import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";
import { sendCancellationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim());

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createServiceClient();

    // Look up active or trialing subscriptions for this email
    const { data: subscriptions, error: dbError } = await supabase
      .from("subscriptions")
      .select("stripe_session_id, status")
      .eq("email", normalizedEmail)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (dbError) {
      console.error("Supabase lookup error:", dbError);
      return NextResponse.json(
        { error: "Failed to look up subscription" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found for this email" },
        { status: 404 }
      );
    }

    const stripeSubId = subscriptions[0].stripe_session_id;

    // Cancel at end of billing period (customer keeps access until then)
    const updatedSubscription = await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true,
    });

    // The webhook will handle updating the Supabase status when Stripe
    // fires the customer.subscription.updated event

    const cancelAtIso = updatedSubscription.current_period_end
      ? new Date(updatedSubscription.current_period_end * 1000).toISOString()
      : null;

    // Send cancellation confirmation email
    await sendCancellationEmail(normalizedEmail, cancelAtIso || undefined);

    return NextResponse.json({
      success: true,
      cancelAt: cancelAtIso,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: "Failed to cancel subscription. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
