import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const normalizedEmail = email.toLowerCase().trim();

    // First, try to find ANY subscription with this email (not just active)
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_session_id, status, created_at")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false });

    console.log("Subscription lookup for email:", normalizedEmail, {
      found: subscriptions?.length || 0,
      data: subscriptions,
      error: subError?.message,
    });

    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0];

      console.log("Found subscription:", {
        id: subscription.stripe_session_id,
        status: subscription.status,
      });

      // Return the subscription ID regardless of status
      // The plan page will handle showing appropriate messages
      return NextResponse.json({
        success: true,
        subscriptionId: subscription.stripe_session_id,
        status: subscription.status,
      });
    }

    // Fallback: Check if there's a quiz result with a plan for this email
    const { data: quizResults, error: quizError } = await supabase
      .from("quiz_results")
      .select("id, plan, created_at")
      .eq("email", normalizedEmail)
      .not("plan", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (quizResults && quizResults.length > 0) {
      // For quiz results without subscription, we need a different approach
      // We can use the quiz result ID as a fallback
      return NextResponse.json({
        success: true,
        subscriptionId: `quiz_${quizResults[0].id}`,
        isQuizOnly: true,
      });
    }

    return NextResponse.json(
      { error: "No plan found for this email address. Please complete the quiz first." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
