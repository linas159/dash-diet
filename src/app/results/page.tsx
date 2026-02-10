"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuizStore } from "@/lib/store";
import {
  calculateBMI,
  getBMICategory,
  getBMIColor,
  calculateDailyCalories,
  getWeightLossProjection,
} from "@/lib/utils";
import CountdownTimer from "@/components/CountdownTimer";
import { useState } from "react";

const pricingPlans = [
  {
    id: "7day",
    name: "7-Day Plan",
    price: 2.95,
    originalPrice: 5.90,
    period: "",
    priceId: "7day",
    popular: false,
    renewalPrice: 37.98,
    renewalPeriod: "1 month",
    trialLabel: "7 day plan",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 9.99,
    originalPrice: 19.98,
    period: "/mo",
    priceId: "monthly",
    popular: true,
    renewalPrice: 37.98,
    renewalPeriod: "1 month",
    trialLabel: "monthly plan",
  },
  {
    id: "quarterly",
    name: "3 Months",
    price: 19.99,
    originalPrice: 39.98,
    period: "",
    totalPrice: 19.99,
    priceId: "quarterly",
    popular: false,
    savings: "33%",
    renewalPrice: 75.98,
    renewalPeriod: "3 months",
    trialLabel: "3 month plan",
  },
];

export default function ResultsPage() {
  const router = useRouter();
  const { answers, selectedPlan: storedPlan, setSelectedPlan: setStoredPlan } = useQuizStore();
  const [selectedPlan, setSelectedPlan] = useState(storedPlan || "monthly");

  // Compute stats from answers
  const gender = (answers.gender as string) || "male";
  const age = (answers.age as number) || 30;
  const height = (answers.height as number) || 170;
  const weight = (answers.current_weight as number) || 80;
  const targetWeight = (answers.target_weight as number) || 70;
  const activityLevel = (answers.activity_level as string) || "light";
  const goal = (answers.goal as string) || "lose_weight";

  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const bmiColor = getBMIColor(bmi);
  const dailyCalories = calculateDailyCalories(
    gender,
    weight,
    height,
    age,
    activityLevel,
    goal
  );

  const weightDiff = weight - targetWeight;
  const weeksToGoal = Math.max(4, Math.round(weightDiff / 0.5));
  const projections = getWeightLossProjection(weight, targetWeight, Math.min(weeksToGoal, 12));

  const handleCheckout = () => {
    setStoredPlan(selectedPlan);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Discount Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2.5 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-sm font-bold">🔥 50% discount reserved for:</span>
          <CountdownTimer initialMinutes={15} variant="banner" />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-b from-dash-blue to-primary-800 text-white px-4 pt-6 pb-12 rounded-b-[2rem]">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3"
          >
            <span className="text-3xl">📊</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-1"
          >
            Your Results Are Ready
          </motion.h1>
          <p className="text-blue-200 text-sm">
            Based on your answers, here&apos;s your personalized analysis
          </p>
        </div>
      </div>

      {/* BMI Card */}
      <div className="px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Body Mass Index
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-4xl font-bold" style={{ color: bmiColor }}>
                {bmi}
              </div>
              <div className="text-sm font-medium" style={{ color: bmiColor }}>
                {bmiCategory}
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-gray-500">
                Current: <span className="font-bold text-gray-900">{weight} kg</span>
              </div>
              <div className="text-xs text-gray-500">
                Target: <span className="font-bold text-dash-teal">{targetWeight} kg</span>
              </div>
              <div className="text-xs text-gray-500">
                Height: <span className="font-bold text-gray-900">{height} cm</span>
              </div>
            </div>
          </div>

          {/* BMI scale bar */}
          <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-5 bg-white rounded-sm border-2 shadow-md"
              style={{
                borderColor: bmiColor,
                left: `${Math.min(Math.max(((bmi - 15) / 30) * 100, 2), 98)}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">15</span>
            <span className="text-[10px] text-gray-400">20</span>
            <span className="text-[10px] text-gray-400">25</span>
            <span className="text-[10px] text-gray-400">30</span>
            <span className="text-[10px] text-gray-400">35+</span>
          </div>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Daily Calories",
              value: `${dailyCalories}`,
              unit: "kcal",
              emoji: "🔥",
              color: "bg-orange-50",
            },
            {
              label: "Weight to Lose",
              value: weightDiff > 0 ? `${weightDiff}` : "0",
              unit: "kg",
              emoji: "⚖️",
              color: "bg-blue-50",
            },
            {
              label: "Estimated Time",
              value: weightDiff > 0 ? `${weeksToGoal}` : "—",
              unit: "weeks",
              emoji: "📅",
              color: "bg-green-50",
            },
            {
              label: "Sodium Target",
              value: "1,500",
              unit: "mg/day",
              emoji: "🧂",
              color: "bg-purple-50",
            },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`${metric.color} rounded-2xl p-4`}
            >
              <span className="text-lg">{metric.emoji}</span>
              <div className="mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {metric.unit}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="px-4 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-dash-blue/5 to-dash-teal/5 rounded-2xl p-5 border border-dash-blue/10"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎯</span> Your 12-Week Transformation
          </h3>
          <div className="space-y-4">
            {[
              { week: "Week 1-2", title: "Adaptation Phase", desc: "Body adjusts to DASH diet, initial energy boost", icon: "🌱" },
              { week: "Week 3-4", title: "Momentum Building", desc: "Notice changes in energy and sleep quality", icon: "⚡" },
              { week: "Week 5-8", title: "Visible Results", desc: "See improvements in weight and blood pressure", icon: "📈" },
              { week: "Week 9-12", title: "Habit Formation", desc: "DASH lifestyle becomes second nature", icon: "✨" },
            ].map((phase, i) => (
              <motion.div
                key={phase.week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">
                  {phase.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-dash-teal">
                      {phase.week}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {phase.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {phase.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {weightDiff > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Expected weight at Week 12:</span>
                <span className="font-bold text-dash-teal text-lg">
                  {Math.round((weight - Math.min(weightDiff, weeksToGoal * 0.5)) * 10) / 10} kg
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* What You'll Get */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Your Personalized Plan Includes
        </h2>
        <div className="space-y-3">
          {[
            {
              emoji: "🍽️",
              title: "Custom DASH Meal Plan",
              desc: "Daily meals tailored to your preferences, allergies, and calorie goals",
            },
            {
              emoji: "🏃",
              title: "Exercise Routine",
              desc: "Workouts matched to your fitness level and available time",
            },
            {
              emoji: "🧬",
              title: "Food Combinations",
              desc: "Nutrient-optimized pairings for maximum health benefits",
            },
            {
              emoji: "📱",
              title: "Weekly Shopping Lists",
              desc: "Organized grocery lists to make shopping easy",
            },
            {
              emoji: "📊",
              title: "Progress Tracking",
              desc: "Monitor weight, blood pressure, and nutrition intake",
            },
            {
              emoji: "🤖",
              title: "AI Adjustments",
              desc: "Your plan evolves as you progress and give feedback",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3"
            >
              <span className="text-xl flex-shrink-0">{feature.emoji}</span>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{feature.desc}</p>
              </div>
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Limited Offer Banner */}
      <div className="px-4 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5 text-center"
        >
          <div className="text-2xl mb-2">🔥</div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            Limited Time Offer
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Your personalized plan is ready. Claim it before the offer expires.
          </p>
          <CountdownTimer initialMinutes={15} />
        </motion.div>
      </div>

      {/* Pricing */}
      <div className="px-4 mt-8" id="pricing">
        <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
          Choose Your Plan
        </h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          Cancel anytime. 30-day money-back guarantee.
        </p>

        <div className="space-y-3">
          {pricingPlans.map((plan) => (
            <motion.button
              key={plan.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === plan.id
                  ? "border-dash-blue bg-primary-50 ring-2 ring-primary-200"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-dash-teal to-dash-green text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center justify-between pr-8">
                <div>
                  <div className="font-semibold text-gray-900">{plan.name}</div>
                  {plan.savings && (
                    <div className="text-xs text-dash-teal font-medium mt-0.5">
                      Save {plan.savings}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm text-gray-400 line-through">
                      ${plan.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-gray-500">{plan.period}</span>
                    )}
                  </div>
                  {plan.totalPrice && (
                    <div className="text-[11px] text-gray-400">
                      ${plan.totalPrice} total
                    </div>
                  )}
                </div>
              </div>

              {/* Radio indicator */}
              <div
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id
                    ? "border-dash-blue"
                    : "border-gray-300"
                }`}
              >
                {selectedPlan === plan.id && (
                  <div className="w-3 h-3 rounded-full bg-dash-blue" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="px-4 mt-6">
        <button
          onClick={handleCheckout}
          className="btn-accent relative overflow-hidden"
        >
          GET MY PLAN — $
          {pricingPlans.find((p) => p.id === selectedPlan)?.price}
          {pricingPlans.find((p) => p.id === selectedPlan)?.period || ""}
        </button>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1L3 5v5a2 2 0 002 2h4a2 2 0 002-2V5L7 1z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Secure checkout
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 13A6 6 0 107 1a6 6 0 000 12z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M4.5 7l2 2L10 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            30-day guarantee
          </div>
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="px-4 mt-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <span className="text-2xl">🛡️</span>
          <h3 className="font-bold text-gray-900 mt-2">
            30-Day Money-Back Guarantee
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            If you&apos;re not satisfied with your plan, we&apos;ll refund you.
            No questions asked.
          </p>
        </div>
        {/* Subscription terms */}
        {(() => {
          const plan = pricingPlans.find((p) => p.id === selectedPlan);
          if (!plan) return null;
          return (
            <p className="text-[10px] leading-snug text-gray-300 mt-3 px-2 text-center">
              By clicking &ldquo;GET MY PLAN&rdquo;, I agree to pay ${plan.price.toFixed(2)} for my plan and that if I do not cancel before the end of the dash.diet {plan.trialLabel}, dash.diet will automatically charge my payment method the regular price of ${plan.renewalPrice.toFixed(2)} every {plan.renewalPeriod} thereafter until I cancel by contacting us at help@dash.diet.
            </p>
          );
        })()}
      </div>

      {/* Footer */}
      <footer className="px-4 mt-8 pb-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link href="/cookies" className="hover:text-gray-600">Cookies</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          </div>
          <p className="text-[11px] text-gray-400">
            Results may vary. The DASH diet plan is not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
