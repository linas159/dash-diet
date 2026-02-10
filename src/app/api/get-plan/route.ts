import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: NextRequest) {
  try {
    const subscriptionId = request.nextUrl.searchParams.get("subscription_id");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscription_id" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    let email: string | null = null;
    let quizAnswers: Record<string, unknown> | null = null;

    // Check if this is a quiz-only ID (no subscription)
    if (subscriptionId.startsWith("quiz_")) {
      const quizId = subscriptionId.replace("quiz_", "");
      const { data: quizResult } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("id", quizId)
        .single();

      if (quizResult?.plan) {
        return NextResponse.json({
          success: true,
          plan: quizResult.plan,
          bmi: quizResult.bmi,
          bmiCategory: quizResult.plan?.bmiCategory || null,
          dailyCalories: quizResult.daily_calories,
          email: quizResult.email,
        });
      }
    }

    // Try 1: Look up subscription in Supabase
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("stripe_session_id", subscriptionId)
      .single();

    if (subscription) {
      email = subscription.email;
      quizAnswers = subscription.quiz_answers;

      // If personalized plan exists, return it immediately
      if (subscription.personalized_plan) {
        return NextResponse.json({
          success: true,
          ...subscription.personalized_plan,
          email,
        });
      }
    } else {
      // Try 2: Fallback to Stripe — get subscription & customer email
      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(
          stripeSub.customer as string
        );
        email = (customer as Stripe.Customer).email || null;

        // Try to parse quiz answers from subscription metadata
        if (stripeSub.metadata?.quizAnswers) {
          try {
            quizAnswers = JSON.parse(stripeSub.metadata.quizAnswers);
          } catch {
            // metadata might be truncated, ignore
          }
        }
      } catch (stripeErr) {
        console.error("Stripe subscription lookup failed:", stripeErr);
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }
    }

    // Check if a plan already exists in quiz_results for this email
    if (email) {
      const { data: quizResult } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (quizResult?.plan) {
        return NextResponse.json({
          success: true,
          plan: quizResult.plan,
          bmi: quizResult.bmi,
          bmiCategory: quizResult.plan?.bmiCategory || null,
          dailyCalories: quizResult.daily_calories,
          email,
        });
      }

      // Use quiz_results answers if we don't have them from subscription
      if (!quizAnswers && quizResult?.answers) {
        quizAnswers = quizResult.answers;
      }
    }

    // Generate a personalized plan on the fly if we have quiz answers
    if (quizAnswers) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // If we have a subscription, generate and save a full personalized plan
      if (subscription) {
        try {
          const genResponse = await fetch(`${baseUrl}/api/generate-personalized-plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId,
              email,
              quizAnswers,
            }),
          });

          if (genResponse.ok) {
            // Re-fetch the subscription to get the saved plan
            const { data: updatedSub } = await supabase
              .from("subscriptions")
              .select("personalized_plan")
              .eq("stripe_session_id", subscriptionId)
              .single();

            if (updatedSub?.personalized_plan) {
              return NextResponse.json({
                success: true,
                ...updatedSub.personalized_plan,
                email,
              });
            }
          }
        } catch (err) {
          console.error("On-demand personalized plan generation failed:", err);
        }
      }

      // Fallback to basic plan generation
      const generateResponse = await fetch(`${baseUrl}/api/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers, email }),
      });

      if (generateResponse.ok) {
        const planData = await generateResponse.json();
        return NextResponse.json({
          success: true,
          ...planData.plan,
          email,
        });
      }
    }

    // Last resort: return a generic plan with no quiz data
    return NextResponse.json(
      { error: "No quiz data found. Please retake the quiz." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Get plan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
