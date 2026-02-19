import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim());

// Each plan maps to its RECURRING price (the regular price charged after intro period)
const priceMap: Record<string, string> = {
  "7day": process.env.STRIPE_PRICE_7DAY!.trim(),
  monthly: process.env.STRIPE_PRICE_MONTHLY!.trim(),
  quarterly: process.env.STRIPE_PRICE_QUARTERLY!.trim(),
};

// Trial days per plan (intro charge is handled separately via PaymentIntent)
const trialConfig: Record<string, number> = {
  "7day": 7,
  monthly: 30,
  quarterly: 90,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, paymentIntentId, planId, answers } = body;

    if (!customerId || !paymentIntentId || !planId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const recurringPriceId = priceMap[planId];
    const trialDays = trialConfig[planId];

    if (!recurringPriceId || !trialDays) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Retrieve the PaymentIntent — use ITS customer (the one with the PM attached)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const paymentMethodId = paymentIntent.payment_method as string;
    // Always trust the PaymentIntent's customer, not the one from the client
    const actualCustomerId = paymentIntent.customer as string;

    // Verify the payment was actually successful
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment has not been completed" },
        { status: 400 }
      );
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "No payment method found" },
        { status: 400 }
      );
    }

    // Idempotency guard: check if subscription already exists for this customer
    const existingSubs = await stripe.subscriptions.list({
      customer: actualCustomerId,
      limit: 1,
    });
    if (existingSubs.data.length > 0) {
      return NextResponse.json({
        subscriptionId: existingSubs.data[0].id,
        status: existingSubs.data[0].status,
      });
    }

    // Set as default payment method on the actual customer
    await stripe.customers.update(actualCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create the subscription with trial period
    // Intro charge was already collected via PaymentIntent — no add_invoice_items needed
    const subscription = await stripe.subscriptions.create({
      customer: actualCustomerId,
      items: [{ price: recurringPriceId }],
      trial_period_days: trialDays,
      default_payment_method: paymentMethodId,
      metadata: {
        quizAnswers: JSON.stringify(answers).slice(0, 500),
        planId,
      },
    });

    // Direct Supabase insert (don't rely solely on webhooks)
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
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim();
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

      // Send welcome email with plan link
      if (customerEmail) {
        const planNames: Record<string, string> = {
          "7day": "7-Day Plan",
          monthly: "Monthly Plan",
          quarterly: "Quarterly Plan",
        };
        await sendWelcomeEmail(
          customerEmail,
          subscription.id,
          planNames[planId] || undefined
        );
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
