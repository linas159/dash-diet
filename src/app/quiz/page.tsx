"use client";

import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store";
import { quizQuestions } from "@/data/questions";
import QuizHeader from "@/components/QuizHeader";
import ProgressBar from "@/components/ProgressBar";
import QuestionRenderer from "@/components/QuestionRenderer";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function QuizPage() {
  const router = useRouter();
  const {
    currentStep,
    answers,
    setAnswer,
    nextStep,
    prevStep,
    setIsGenerating,
    isGenerating,
    setEmail,
  } = useQuizStore();

  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmailInput] = useState("");

  const currentQuestion = quizQuestions[currentStep];
  const isLastQuestion = currentStep >= quizQuestions.length - 1;
  const totalQuestions = quizQuestions.length;

  const currentValue = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const canProceed = () => {
    if (!currentQuestion) return false;
    const val = answers[currentQuestion.id];
    if (!val) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  };

  const handleNext = (autoAdvance = false) => {
    if (!autoAdvance && !canProceed()) return;

    if (isLastQuestion) {
      setShowEmailCapture(true);
    } else {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setShowEmailCapture(false);
    setIsGenerating(true);
    if (email) setEmail(email);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, email }),
      });

      if (response.ok) {
        // Small delay to show the full loading animation
        setTimeout(() => {
          router.push("/results");
        }, 3000);
      } else {
        // Fallback: go to results with locally computed data
        router.push("/results");
      }
    } catch {
      // If API fails, still navigate to results page with local computation
      router.push("/results");
    }
  };

  const handleBack = () => {
    if (showEmailCapture) {
      setShowEmailCapture(false);
      return;
    }
    if (currentStep === 0) {
      router.push("/");
    } else {
      prevStep();
    }
  };

  // Loading / Generating state
  if (isGenerating) {
    return <LoadingAnalysis />;
  }

  // Email capture before generating
  if (showEmailCapture) {
    return (
      <div className="min-h-screen flex flex-col">
        <QuizHeader onBack={handleBack} section="Almost Done" />

        <div className="flex-1 flex flex-col justify-center px-4 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-dash-blue to-dash-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Where should we send your plan?
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Enter your email to receive your personalized DASH diet plan
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-base
                           focus:border-dash-blue focus:outline-none focus:ring-4 focus:ring-primary-100
                           transition-all placeholder:text-gray-400"
              />

              <button
                onClick={handleSubmit}
                disabled={!email.includes("@")}
                className="btn-primary"
              >
                Generate My Plan
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
              We respect your privacy. No spam, unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <QuizHeader
        onBack={handleBack}
        showBack={true}
        section={currentQuestion.section}
      />

      <ProgressBar current={currentStep + 1} total={totalQuestions} />

      <div className="flex-1 pt-4 overflow-y-auto">
        <QuestionRenderer
          question={currentQuestion}
          value={currentValue}
          onChange={(value) => setAnswer(currentQuestion.id, value)}
          onNext={handleNext}
        />
      </div>

      {/* Bottom action bar for multi-select and number inputs */}
      {(currentQuestion.type === "multiple" ||
        currentQuestion.type === "number" ||
        currentQuestion.type === "height" ||
        currentQuestion.type === "weight") && (
        <div className="fixed bottom-6 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => handleNext()}
              disabled={!canProceed()}
              className="btn-primary"
            >
              {isLastQuestion ? "See My Results" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
