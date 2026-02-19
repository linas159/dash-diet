import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim());

const validPlans = ["7day", "monthly", "quarterly"];

// Intro prices in cents — must match what's displayed in CheckoutForm
const introPriceAmounts: Record<string, number> = {
  "7day": 295, // $2.95
  monthly: 999, // $9.99
  quarterly: 1999, // $19.99
};

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

    const amount = introPriceAmounts[planId];
    if (!amount) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Create a Stripe Customer
    const customer = await stripe.customers.create({
      email,
      metadata: { planId },
    });

    // Create a PaymentIntent for the intro charge
    // setup_future_usage saves the payment method for future subscription billing
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: "off_session",
      metadata: { planId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to initialize checkout" },
      { status: 500 }
    );
  }
}
