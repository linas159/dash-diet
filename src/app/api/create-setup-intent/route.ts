import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const validPlans = ["7day", "monthly", "quarterly"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, planId } = body;

    if (!email || !validPlans.includes(planId)) {
      return NextResponse.json(
        { error: "Invalid email or plan" },
        { status: 400 }
      );
    }

    // Create a Stripe Customer
    const customer = await stripe.customers.create({
      email,
      metadata: { planId },
    });

    // Create a SetupIntent with automatic_payment_methods
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { planId },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Create setup intent error:", error);
    return NextResponse.json(
      { error: "Failed to create setup intent" },
      { status: 500 }
    );
  }
}
