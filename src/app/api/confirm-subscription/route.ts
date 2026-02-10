import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Each plan maps to its RECURRING price (the regular price charged after intro period)
const priceMap: Record<string, string> = {
  "7day": process.env.STRIPE_PRICE_7DAY!,
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  quarterly: process.env.STRIPE_PRICE_QUARTERLY!,
};

// Intro pricing: trial days + the one-time intro price ID from Stripe
const introConfig: Record<
  string,
  { trialDays: number; introPriceId: string }
> = {
  "7day": {
    trialDays: 7,
    introPriceId: process.env.STRIPE_INTRO_PRICE_7DAY!,
  },
  monthly: {
    trialDays: 30,
    introPriceId: process.env.STRIPE_INTRO_PRICE_MONTHLY!,
  },
  quarterly: {
    trialDays: 90,
    introPriceId: process.env.STRIPE_INTRO_PRICE_QUARTERLY!,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, setupIntentId, planId, answers } = body;

    if (!customerId || !setupIntentId || !planId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const recurringPriceId = priceMap[planId];
    const intro = introConfig[planId];

    if (!recurringPriceId || !intro) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Retrieve the SetupIntent — use ITS customer (the one with the PM attached)
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const paymentMethodId = setupIntent.payment_method as string;
    // Always trust the SetupIntent's customer, not the one from the client
    const actualCustomerId = setupIntent.customer as string;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "No payment method found" },
        { status: 400 }
      );
    }

    // Set as default payment method on the actual customer
    await stripe.customers.update(actualCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create the subscription with trial + one-time intro charge
    const subscription = await stripe.subscriptions.create({
      customer: actualCustomerId,
      items: [{ price: recurringPriceId }],
      trial_period_days: intro.trialDays,
      default_payment_method: paymentMethodId,
      add_invoice_items: [
        {
          price: intro.introPriceId,
          quantity: 1,
        },
      ],
      metadata: {
        quizAnswers: JSON.stringify(answers).slice(0, 500),
        planId,
      },
    });

    // Direct Supabase insert (don't rely solely on webhooks for local dev)
    try {
      const customer = await stripe.customers.retrieve(actualCustomerId);
      const customerEmail = (customer as Stripe.Customer).email || null;

      const supabase = createServiceClient();
      const { error: dbError } = await supabase.from("subscriptions").insert({
        stripe_session_id: subscription.id,
        stripe_customer_id: actualCustomerId,
        email: customerEmail,
        status: subscription.status,
        quiz_answers: answers || null,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Supabase insert failed:", dbError.message, dbError.details, dbError.hint);
      } else if (answers && Object.keys(answers).length > 0) {
        // Trigger personalized plan generation in the background
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        try {
          const planResponse = await fetch(`${baseUrl}/api/generate-personalized-plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId: subscription.id,
              email: customerEmail,
              quizAnswers: answers,
            }),
          });

          if (!planResponse.ok) {
            const errorText = await planResponse.text();
            console.error("Plan generation failed:", planResponse.status, errorText);
          } else {
            console.log("✅ Personalized plan generated after subscription confirmation");
          }
        } catch (planErr) {
          console.error("Plan generation request failed:", planErr);
          // Don't fail the checkout — plan can be generated later via get-plan fallback
        }
      }
    } catch (dbError) {
      console.error("Supabase direct insert error:", dbError);
      // Don't fail the checkout — subscription was created successfully
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error("Confirm subscription error:", error);
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to create subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
