"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { useQuizStore } from "@/lib/store";
import CheckoutForm from "@/components/CheckoutForm";
import { trackInitiateCheckout } from "@/lib/fbpixel";

const stripePromise = getStripe();

const planPrices: Record<string, number> = {
  "7day": 2.95,
  monthly: 9.99,
  quarterly: 19.99,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { email, selectedPlan, answers } = useQuizStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    // Guard: redirect if no quiz data
    if (!answers || Object.keys(answers).length === 0) {
      router.push("/");
      return;
    }

    if (!selectedPlan) {
      router.push("/results");
      return;
    }

    // Prevent double-call from React Strict Mode
    if (clientSecret) return;

    let cancelled = false;

    // Create SetupIntent on mount
    fetch("/api/create-setup-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || (answers.email as string) || "", planId: selectedPlan }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setSetupError(data.error);
        } else {
          setClientSecret(data.clientSecret);
          setCustomerId(data.customerId);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setSetupError("Failed to initialize checkout. Please try again.");
      });

    return () => { cancelled = true; };
  }, [answers, email, selectedPlan, router, clientSecret]);

  // Track InitiateCheckout once when the checkout page loads with a valid plan
  useEffect(() => {
    if (!checkoutTracked.current && selectedPlan) {
      checkoutTracked.current = true;
      trackInitiateCheckout({
        planId: selectedPlan,
        value: planPrices[selectedPlan] || 0,
      });
    }
  }, [selectedPlan]);

  if (setupError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{setupError}</p>
          <button
            onClick={() => router.push("/results")}
            className="text-dash-blue font-semibold underline"
          >
            Go back to results
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Skeleton header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="px-4 py-4 space-y-4 max-w-[428px] mx-auto w-full">
          {/* Skeleton order summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          {/* Skeleton heading */}
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          {/* Skeleton payment form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="space-y-3">
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
            </div>
          </div>
          {/* Skeleton button */}
          <div className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0d9488",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1.5px solid #e5e7eb",
              padding: "12px 14px",
              fontSize: "16px",
              borderRadius: "10px",
            },
            ".Input:focus": {
              borderColor: "#0d9488",
              boxShadow: "0 0 0 3px rgba(13, 148, 136, 0.1)",
            },
            ".Label": {
              fontSize: "13px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "6px",
            },
            ".Tab": {
              borderRadius: "10px",
              border: "1.5px solid #e5e7eb",
              padding: "10px 12px",
            },
            ".Tab--selected": {
              borderColor: "#0d9488",
              backgroundColor: "#f0fdfa",
            },
            ".Tab:hover": {
              borderColor: "#0d9488",
            },
          },
        },
      }}
    >
      <CheckoutForm
        planId={selectedPlan}
        customerId={customerId!}
        answers={answers}
      />
    </Elements>
  );
}
