"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useQuizStore } from "@/lib/store";
import {
  calculateBMI,
  getBMICategory,
  getBMIColor,
  calculateDailyCalories,
  getWeightLossProjection,
} from "@/lib/utils";
import CountdownTimer from "@/components/CountdownTimer";
import FAQSection from "@/components/FAQSection";
import BodyTransformationCard from "@/components/BodyTransformationCard";
import SafeCheckout from "@/components/SafeCheckout";
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

  const weightDiff = Math.abs(weight - targetWeight);
  const isWeightLoss = weight > targetWeight;
  const isWeightGain = weight < targetWeight;
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

      {/* Body Transformation Card */}
      <BodyTransformationCard
        gender={gender}
        currentWeight={weight}
        targetWeight={targetWeight}
        height={height}
      />

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
              label: isWeightLoss ? "Weight to Lose" : "Weight to Gain",
              value: weightDiff > 0 ? `${weightDiff.toFixed(1)}` : "0",
              unit: "kg",
              emoji: isWeightLoss ? "⬇️" : "⬆️",
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
      </div>

      {/* Safe Checkout */}
      <div className="px-4">

        {(() => {
          const plan = pricingPlans.find((p) => p.id === selectedPlan);
          if (!plan) return null;
          return (
            <p className="text-[10px] leading-snug text-gray-300 mt-4 px-2 text-center">
              By clicking &ldquo;GET MY PLAN&rdquo;, I agree to pay ${plan.price.toFixed(2)} for my plan and that if I do not cancel before the end of the dash.diet {plan.trialLabel}, dash.diet will automatically charge my payment method the regular price of ${plan.renewalPrice.toFixed(2)} every {plan.renewalPeriod} thereafter until I cancel by contacting us at support@trydashdiet.com.
            </p>
          );
        })()}
      </div>
      <SafeCheckout />

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

      {/* As Seen In - Media Coverage */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 py-6 bg-gray-50 rounded-2xl mt-8"
      >
        <p className="text-center text-xs font-medium text-gray-400 mb-4 uppercase tracking-wide">
          As Featured In
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap opacity-60 grayscale">
          <Image
            src="/photos/forbes.svg"
            alt="Forbes"
            width={70}
            height={20}
            className="h-5 w-auto"
          />
          <Image
            src="/photos/cnn.svg"
            alt="CNN"
            width={50}
            height={20}
            className="h-5 w-auto"
          />
          <Image
            src="/photos/bbc.svg"
            alt="BBC"
            width={50}
            height={20}
            className="h-5 w-auto"
          />
          <Image
            src="/photos/the_guardian.svg"
            alt="The Guardian"
            width={100}
            height={20}
            className="h-5 w-auto"
          />
        </div>
      </motion.section>

      {/* Testimonials with Trustpilot */}
      <section className="px-4 py-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Trusted by Thousands
          </h2>

          {/* Trustpilot Rating */}
          <div className="inline-flex flex-col items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-4 rounded-2xl border border-green-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">4.8</span>
              <Image
                src="/photos/stars-5-1.svg"
                alt="5 stars"
                width={100}
                height={20}
                className="h-5 w-auto"
              />
            </div>
            <p className="text-xs text-gray-600">
              Based on <span className="font-semibold">3,247 reviews</span>
            </p>
            <Image
              src="/photos/trustpilot-1.svg"
              alt="Trustpilot"
              width={80}
              height={20}
              className="h-4 w-auto"
            />
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              name: "James M.",
              initial: "JM",
              bgColor: "bg-teal-200",
              text: "I was skeptical about another diet plan, but this one is different. The personalized approach helped me lower my blood pressure naturally in just 6 weeks. My doctor is impressed with my progress and I feel great!",
              timeAgo: "3d ago",
              verified: true
            },
            {
              name: "Sarah K.",
              initial: "SK",
              bgColor: "bg-blue-200",
              text: "Lost 18 pounds in 2 months! My blood pressure is finally under control and I have so much more energy. The personalized meal plans made it incredibly easy to follow.",
              timeAgo: "1w ago",
              verified: true
            },
            {
              name: "Michael R.",
              initial: "MR",
              bgColor: "bg-purple-200",
              text: "My doctor recommended the DASH diet and this app made it simple to follow. I'm off my blood pressure medication and feel healthier than I have in years!",
              timeAgo: "2w ago",
              verified: true
            },
          ].map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              {/* Header with avatar and name */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-gray-800 font-bold text-sm">
                      {testimonial.initial}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </span>
                      {testimonial.verified && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="#00b67a"/>
                          <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <span className="text-xs text-gray-500 font-medium">Verified</span>
                    </div>
                    <div className="flex items-center mt-0.5">
                      <Image
                        src="/photos/stars-5-1.svg"
                        alt="5 stars"
                        width={70}
                        height={14}
                        className="h-3.5 w-auto"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {testimonial.timeAgo}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 text-sm mb-2">
                {i === 0 ? "Eye-opening experience" : i === 1 ? "Life-changing results" : "Best decision ever"}
              </h3>

              {/* Review text */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {testimonial.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expert Credentials */}
      <section className="px-4 py-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 flex-shrink-0">
              <Image
                src="/photos/Harvard.png"
                alt="Harvard"
                width={80}
                height={80}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                Created by Harvard Experts
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our personalized DASH diet plans are developed in collaboration with
                nutrition researchers from <span className="font-semibold text-gray-900">Harvard Medical School</span> and
                leading cardiovascular health experts. Science-backed nutrition you can trust.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#1e3a5f" strokeWidth="1.5"/>
                    <path d="M5 8l2 2 4-4" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">Evidence-based</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#1e3a5f" strokeWidth="1.5"/>
                    <path d="M5 8l2 2 4-4" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">Clinically proven</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

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
        {/* Subscription terms */}
        {(() => {
          const plan = pricingPlans.find((p) => p.id === selectedPlan);
          if (!plan) return null;
          return (
            <p className="text-[10px] leading-snug text-gray-300 mt-3 px-2 text-center">
              By clicking &ldquo;GET MY PLAN&rdquo;, I agree to pay ${plan.price.toFixed(2)} for my plan and that if I do not cancel before the end of the dash.diet {plan.trialLabel}, dash.diet will automatically charge my payment method the regular price of ${plan.renewalPrice.toFixed(2)} every {plan.renewalPeriod} thereafter until I cancel by contacting us at support@trydashdiet.com.
            </p>
          );
        })()}
        <SafeCheckout />
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
      </div>

      {/* Footer */}
      <footer className="px-4 mt-8 pb-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link href="/cookies" className="hover:text-gray-600">Cookies</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            <Link href="/cancel" className="hover:text-gray-600">Cancel</Link>
          </div>
          <p className="text-[11px] text-gray-400">
            Results may vary. The DASH diet plan is not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
