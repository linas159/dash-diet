import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim());

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!.trim()
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const quizAnswers = session.metadata?.quizAnswers
        ? JSON.parse(session.metadata.quizAnswers)
        : null;

      const sessionSubId = (session.subscription as string) || session.id;

      // Check if subscription already exists (may have been inserted by confirm-subscription)
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id, personalized_plan")
        .eq("stripe_session_id", sessionSubId)
        .single();

      if (existingSub) {
        // Subscription already exists — only generate plan if missing
        if (!existingSub.personalized_plan && quizAnswers) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          try {
            const planResponse = await fetch(`${baseUrl}/api/generate-personalized-plan`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: sessionSubId,
                email: session.customer_email || session.customer_details?.email,
                quizAnswers,
              }),
            });

            if (!planResponse.ok) {
              console.error("Plan generation failed:", planResponse.status, await planResponse.text());
            } else {
              console.log("✅ Personalized plan generated via webhook (was missing)");
            }
          } catch (err) {
            console.error("Plan generation request failed:", err);
          }
        }
      } else {
        // Insert new subscription (legacy hosted checkout flow)
        const { error } = await supabase.from("subscriptions").insert({
          stripe_session_id: sessionSubId,
          stripe_customer_id: session.customer as string,
          email: session.customer_email || session.customer_details?.email,
          status: "active",
          quiz_answers: quizAnswers,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Supabase insert error:", error);
        } else {
          const customerEmail = session.customer_email || session.customer_details?.email;

          if (quizAnswers) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            try {
              const planResponse = await fetch(`${baseUrl}/api/generate-personalized-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscriptionId: sessionSubId,
                  email: customerEmail,
                  quizAnswers,
                }),
              });

              if (!planResponse.ok) {
                console.error("Plan generation failed:", planResponse.status, await planResponse.text());
              } else {
                console.log("✅ Personalized plan generated via webhook");
              }
            } catch (err) {
              console.error("Plan generation request failed:", err);
            }
          }

          // Send welcome email with plan link
          if (customerEmail) {
            await sendWelcomeEmail(customerEmail, sessionSubId);
          }
        }
      }
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;

      // Check if already inserted by confirm-subscription
      const { data: existingSubCreated } = await supabase
        .from("subscriptions")
        .select("id, personalized_plan")
        .eq("stripe_session_id", subscription.id)
        .single();

      if (existingSubCreated) {
        // Already exists — only generate plan if missing
        if (!existingSubCreated.personalized_plan) {
          const quizAnswers = subscription.metadata?.quizAnswers
            ? JSON.parse(subscription.metadata.quizAnswers)
            : null;

          if (quizAnswers) {
            const customer = await stripe.customers.retrieve(
              subscription.customer as string
            );
            const customerEmail = (customer as Stripe.Customer).email || null;
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            try {
              const planResponse = await fetch(`${baseUrl}/api/generate-personalized-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscriptionId: subscription.id,
                  email: customerEmail,
                  quizAnswers,
                }),
              });

              if (!planResponse.ok) {
                console.error("Plan generation failed:", planResponse.status, await planResponse.text());
              } else {
                console.log("✅ Plan generated via subscription.created webhook (was missing)");
              }
            } catch (err) {
              console.error("Plan generation request failed:", err);
            }
          }
        }
      } else {
        // Insert new subscription
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        const customerEmail = (customer as Stripe.Customer).email || null;

        const quizAnswers = subscription.metadata?.quizAnswers
          ? JSON.parse(subscription.metadata.quizAnswers)
          : null;

        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            stripe_customer_id: subscription.customer as string,
            stripe_session_id: subscription.id,
            email: customerEmail,
            status: subscription.status,
            quiz_answers: quizAnswers,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Supabase insert error:", insertError);
        } else if (quizAnswers) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          try {
            const planResponse = await fetch(`${baseUrl}/api/generate-personalized-plan`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: subscription.id,
                email: customerEmail,
                quizAnswers,
              }),
            });

            if (!planResponse.ok) {
              console.error("Plan generation failed:", planResponse.status, await planResponse.text());
            } else {
              console.log("✅ Plan generated via subscription.created webhook");
            }
          } catch (err) {
            console.error("Plan generation request failed:", err);
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("stripe_session_id", subscription.id);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("subscriptions")
        .update({ status: subscription.status })
        .eq("stripe_session_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
