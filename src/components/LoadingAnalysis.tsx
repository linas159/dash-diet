"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const steps = [
  { label: "Analyzing your body metrics", emoji: "📊" },
  { label: "Evaluating dietary preferences", emoji: "🥗" },
  { label: "Checking health conditions", emoji: "❤️" },
  { label: "Calculating daily nutrition needs", emoji: "🔢" },
  { label: "Building your DASH meal plan", emoji: "🍽️" },
  { label: "Creating exercise routine", emoji: "🏃" },
  { label: "Generating food combinations", emoji: "🧬" },
  { label: "Finalizing your personalized plan", emoji: "✨" },
];

export default function LoadingAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 1;
      });
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 mb-8 relative"
      >
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.76} 276`}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-dash-blue">{progress}%</span>
        </div>
      </motion.div>

      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
        Creating Your Plan
      </h2>
      <p className="text-sm text-gray-500 mb-8 text-center">
        Our AI is building your personalized DASH diet plan
      </p>

      <div className="w-full max-w-sm space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.3,
              x: 0,
            }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                i < currentStep
                  ? "bg-green-100"
                  : i === currentStep
                  ? "bg-primary-100"
                  : "bg-gray-50"
              }`}
            >
              {i < currentStep ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8L7 12L13 4"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span className="text-sm">{step.emoji}</span>
              )}
            </div>
            <span
              className={`text-sm ${
                i <= currentStep
                  ? "text-gray-900 font-medium"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
            {i === currentStep && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-dash-teal ml-auto"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
