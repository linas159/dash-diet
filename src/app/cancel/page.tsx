"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CancelPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cancelDate, setCancelDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      if (data.cancelAt) {
        setCancelDate(
          new Date(data.cancelAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <Image
            src="/dash-diet-logo.svg"
            alt="DashDiet"
            width={120}
            height={34}
            className="h-8 w-auto"
          />
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {!success ? (
          <>
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Cancel Subscription
            </h1>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
              Enter the email address you used to subscribe. Your plan will
              remain active until the end of your current billing period.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dash-blue focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-red-500 text-white text-sm font-semibold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Cancelling..." : "Cancel My Subscription"}
              </button>
            </form>

            <p className="text-xs text-gray-400 mt-6 text-center max-w-sm">
              Changed your mind?{" "}
              <Link href="/" className="text-dash-blue underline">
                Go back home
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Subscription Cancelled
            </h1>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
              Your subscription has been cancelled.
              {cancelDate && (
                <>
                  {" "}
                  You will continue to have access to your plan until{" "}
                  <span className="font-semibold text-gray-700">
                    {cancelDate}
                  </span>
                  .
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mb-6 text-center max-w-sm">
              You will not be charged again. If you change your mind, you can
              always resubscribe by taking the quiz again.
            </p>

            <Link href="/" className="btn-primary inline-block text-center px-8">
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
