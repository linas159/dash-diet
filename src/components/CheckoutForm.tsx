"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { QuizAnswers } from "@/types/quiz";
import SafeCheckout from "./SafeCheckout";

const planDetails: Record<
  string,
  {
    name: string;
    price: number;
    renewalPrice: number;
    renewalPeriod: string;
    trialLabel: string;
  }
> = {
  "7day": {
    name: "7-Day Plan",
    price: 2.95,
    renewalPrice: 37.98,
    renewalPeriod: "1 month",
    trialLabel: "7 day plan",
  },
  monthly: {
    name: "Monthly Plan",
    price: 9.99,
    renewalPrice: 37.98,
    renewalPeriod: "1 month",
    trialLabel: "monthly plan",
  },
  quarterly: {
    name: "3-Month Plan",
    price: 19.99,
    renewalPrice: 75.98,
    renewalPeriod: "3 months",
    trialLabel: "3 month plan",
  },
};

interface CheckoutFormProps {
  planId: string;
  customerId: string;
  answers: QuizAnswers;
}

export default function CheckoutForm({
  planId,
  customerId,
  answers,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = planDetails[planId];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: setupError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?plan_id=${planId}&customer_id=${customerId}`,
      },
    });

    if (setupError) {
      setError(
        setupError.message || "Payment setup failed. Please try again."
      );
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch("/api/confirm-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          setupIntentId: setupIntent.id,
          planId,
          answers,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsProcessing(false);
        return;
      }

      router.push(`/checkout/success?subscription_id=${data.subscriptionId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col min-h-screen bg-gray-50"
    >
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="#1f2937"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 flex-1">Checkout</h1>
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          className="text-gray-400"
        >
          <rect
            x="3"
            y="9"
            width="14"
            height="9"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6 9V6a4 4 0 118 0v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 max-w-[428px] mx-auto w-full">
        {/* Order Summary - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dash-teal to-dash-green flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M10 2L3 7v9a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 18V10h6v8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  DASH Diet {plan.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Personalized plan
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                ${plan.price.toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Select Payment Method heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="font-bold text-gray-900 text-base mb-3">
            Select a payment method
          </h2>
        </motion.div>

        {/* Payment Element - clean container */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <PaymentElement
            options={{
              layout: {
                type: "tabs",
              },
              paymentMethodOrder: [
                "apple_pay",
                "google_pay",
                "paypal",
                "card",
              ],
              wallets: {
                applePay: "auto",
                googlePay: "auto",
              },
            }}
          />
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full py-4 px-6 bg-gradient-to-r from-dash-teal to-dash-green text-white font-bold rounded-2xl text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-teal-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="text-white"
              >
                <rect
                  x="3"
                  y="9"
                  width="14"
                  height="9"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M6 9V6a4 4 0 118 0v3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Submit Secure Payment
            </>
          )}
        </button>

        {/* Guaranteed Safe Checkout */}
        <SafeCheckout />

        {/* Subscription terms */}
        <p className="text-[10px] leading-snug text-gray-400 px-2 text-center pb-4 mt-4">
          By proceeding with payment, you agree to be charged $
          {plan.price.toFixed(2)} now. After your {plan.trialLabel}, you will be
          billed ${plan.renewalPrice.toFixed(2)} every {plan.renewalPeriod}{" "}
          until you cancel. You can cancel anytime. For any inquiries, contact
          us at support@trydashdiet.com.
        </p>
      </div>
    </form>
  );
}
