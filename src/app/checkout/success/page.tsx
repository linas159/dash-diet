"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuizStore } from "@/lib/store";
import { trackPurchase, trackPlanAccessed } from "@/lib/fbpixel";

const planPrices: Record<string, number> = {
  "7day": 2.95,
  monthly: 9.99,
  quarterly: 19.99,
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const { answers, selectedPlan: storedPlan } = useQuizStore();
  const purchaseTracked = useRef(false);

  // Direct flow (card/Google Pay/Apple Pay): subscription already created
  const directSubscriptionId = searchParams.get("subscription_id");

  // Redirect flow (PayPal): Stripe adds these params after redirect back
  const paymentIntentParam = searchParams.get("payment_intent");
  const planIdParam = searchParams.get("plan_id");
  const customerIdParam = searchParams.get("customer_id");

  const [subscriptionId, setSubscriptionId] = useState<string | null>(
    directSubscriptionId
  );
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    directSubscriptionId ? "success" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const confirmedRef = useRef(false);

  useEffect(() => {
    // If we already have a subscription ID (direct flow), we're done
    if (directSubscriptionId) {
      setStatus("success");
      // Track purchase for direct flow
      if (!purchaseTracked.current) {
        purchaseTracked.current = true;
        const planId = storedPlan || "monthly";
        trackPurchase({
          planId,
          value: planPrices[planId] || 0,
          subscriptionId: directSubscriptionId,
        });
      }
      return;
    }

    // Redirect flow: we have a payment_intent from PayPal/redirect-based payment
    if (paymentIntentParam && planIdParam && customerIdParam) {
      // Prevent double-call from React Strict Mode
      if (confirmedRef.current) return;
      confirmedRef.current = true;

      // Complete the subscription server-side
      fetch("/api/confirm-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerIdParam,
          paymentIntentId: paymentIntentParam,
          planId: planIdParam,
          answers: answers || {},
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setErrorMessage(data.error);
            setStatus("error");
          } else {
            setSubscriptionId(data.subscriptionId);
            setStatus("success");
            // Track purchase for redirect flow
            if (!purchaseTracked.current) {
              purchaseTracked.current = true;
              trackPurchase({
                planId: planIdParam!,
                value: planPrices[planIdParam!] || 0,
                subscriptionId: data.subscriptionId,
              });
            }
          }
        })
        .catch(() => {
          setErrorMessage("Failed to finalize your subscription. Please contact support.");
          setStatus("error");
        });
    } else {
      // No params at all — show success anyway (edge case)
      setStatus("success");
    }
  }, [directSubscriptionId, paymentIntentParam, planIdParam, customerIdParam, answers, storedPlan]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 border-4 border-dash-blue/20 border-t-dash-blue rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Finalizing your subscription...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{errorMessage}</p>
        <Link href="/contact" className="text-dash-blue font-medium text-sm">
          Contact Support
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M10 20L17 27L30 13"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Your DASH Journey!
        </h1>
        <p className="text-gray-600 mb-8 max-w-sm">
          Your personalized DASH diet plan is ready. Access your meal plan,
          exercise routine, and tips below.
        </p>

        <div className="space-y-4 w-full max-w-sm">
          <div className="bg-blue-50 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-2">
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-dash-teal mt-0.5">1.</span>
                Access your personalized DASH meal plan
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dash-teal mt-0.5">2.</span>
                Follow your weekly meal and exercise schedule
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dash-teal mt-0.5">3.</span>
                Try the powerful food combinations
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dash-teal mt-0.5">4.</span>
                Track your progress and adjust as needed
              </li>
            </ul>
          </div>

          <Link
            href={subscriptionId ? `/plan?subscription_id=${subscriptionId}` : "/"}
            className="block"
            onClick={() => {
              if (subscriptionId) trackPlanAccessed(subscriptionId);
            }}
          >
            <button className="btn-primary">
              {subscriptionId ? "Access My Plan" : "Back to Home"}
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-dash-blue/20 border-t-dash-blue rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
