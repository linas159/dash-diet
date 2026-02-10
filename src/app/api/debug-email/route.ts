import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Temporary debug endpoint - remove in production
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("email", normalizedEmail);

    // Check quiz results
    const { data: quizResults, error: quizError } = await supabase
      .from("quiz_results")
      .select("id, email, created_at, bmi, daily_calories")
      .eq("email", normalizedEmail);

    return NextResponse.json({
      email: normalizedEmail,
      subscriptions: {
        count: subscriptions?.length || 0,
        data: subscriptions || [],
        error: subError?.message,
      },
      quizResults: {
        count: quizResults?.length || 0,
        data: quizResults || [],
        error: quizError?.message,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to debug" },
      { status: 500 }
    );
  }
}
