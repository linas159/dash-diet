import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Each plan maps to its RECURRING price (the regular price charged after intro period)
const priceMap: Record<string, string> = {
  "7day": process.env.STRIPE_PRICE_7DAY!,       // $37.98/month recurring
  monthly: process.env.STRIPE_PRICE_MONTHLY!,    // $37.98/month recurring
  quarterly: process.env.STRIPE_PRICE_QUARTERLY!, // $75.98/3 months recurring
};

// Intro pricing: trial days + upfront charge in cents + label for the one-time product
const introConfig: Record<string, { trialDays: number; introAmountCents: number; introLabel: string }> = {
  "7day":     { trialDays: 7,  introAmountCents: 295,  introLabel: "DASH Diet - 7 Day Intro Plan" },
  monthly:    { trialDays: 30, introAmountCents: 999,  introLabel: "DASH Diet - Monthly Intro Plan" },
  quarterly:  { trialDays: 90, introAmountCents: 1999, introLabel: "DASH Diet - 3 Month Intro Plan" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, answers } = body;

    const stripePriceId = priceMap[priceId];
    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Invalid price selection" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const intro = introConfig[priceId];

    // Build the checkout session options
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/results`,
      metadata: {
        quizAnswers: JSON.stringify(answers).slice(0, 500),
        planId: priceId,
      },
    };

    // If plan has a trial + intro charge (e.g., 7-day plan)
    if (intro && intro.trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: intro.trialDays,
      };

      // Add a one-time intro charge alongside the subscription
      if (intro.introAmountCents > 0) {
        // Create a one-time price on the fly for the intro payment
        const introPrice = await stripe.prices.create({
          unit_amount: intro.introAmountCents,
          currency: "usd",
          product_data: {
            name: intro.introLabel,
          },
        });

        sessionParams.line_items!.push({
          price: introPrice.id,
          quantity: 1,
        });
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
