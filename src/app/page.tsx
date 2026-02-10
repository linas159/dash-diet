"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AccessPlanSection from "@/components/AccessPlanSection";

const benefits = [
  {
    emoji: "❤️",
    title: "Lower Blood Pressure",
    desc: "Clinically proven to reduce hypertension naturally",
  },
  {
    emoji: "⚖️",
    title: "Healthy Weight Loss",
    desc: "Sustainable results without extreme restrictions",
  },
  {
    emoji: "🧠",
    title: "Better Heart Health",
    desc: "Reduce cholesterol and cardiovascular risk",
  },
  {
    emoji: "⚡",
    title: "More Energy",
    desc: "Feel energized throughout the day",
  },
];

const stats = [
  { value: "147K+", label: "Plans created" },
  { value: "4.8", label: "App rating" },
  { value: "92%", label: "See results" },
];

const steps = [
  { num: "1", title: "Take the quiz", desc: "Answer questions about your health and goals" },
  { num: "2", title: "Get your plan", desc: "We create your personalized DASH diet plan" },
  { num: "3", title: "See results", desc: "Follow the plan and track your progress" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-dash-blue to-dash-teal rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-lg text-dash-blue">DashDiet</span>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            #1 Doctor-Recommended Diet
          </div>

          <h1 className="text-[2rem] leading-[1.15] font-extrabold text-gray-900 mb-3">
            Your Personal{" "}
            <span className="gradient-text">DASH Diet</span>{" "}
            Plan
          </h1>

          <p className="text-base text-gray-600 leading-relaxed mb-6">
            Get a personalized meal plan, exercise routine, and food combinations
            — all backed by science and created in minutes.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-3"
        >
          <Link href="/quiz" className="block">
            <button className="btn-primary flex items-center justify-center gap-2">
              <span>Start Free Quiz</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10h12m0 0l-4-4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
          <p className="text-center text-xs text-gray-400">
            Takes only 2 minutes — no credit card required
          </p>
        </motion.div>
      </section>

      {/* Social Proof Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 py-6"
      >
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 bg-gray-50 rounded-2xl"
            >
              <div className="text-xl font-bold text-dash-blue">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* What is DASH */}
      <section className="px-4 py-8">
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            What is the DASH Diet?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            DASH stands for <strong>Dietary Approaches to Stop Hypertension</strong>.
            Developed by the NIH, it&apos;s ranked the #1 best diet for healthy eating
            and is proven to lower blood pressure, reduce cholesterol, and promote
            sustainable weight loss.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Fruits",
              "Vegetables",
              "Whole grains",
              "Lean protein",
              "Low-fat dairy",
              "Nuts & seeds",
            ].map((food) => (
              <span
                key={food}
                className="bg-white/80 text-dash-blue text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Benefits of DASH
        </h2>
        <div className="space-y-3">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {benefit.emoji}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-5">How It Works</h2>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-dash-blue to-dash-teal rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {step.num}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Real Results
        </h2>
        <div className="space-y-4">
          {[
            {
              name: "Sarah K.",
              age: 42,
              text: "Lost 15 lbs in 3 months and my blood pressure dropped to normal. The meal plans are easy to follow!",
              rating: 5,
            },
            {
              name: "Michael R.",
              age: 55,
              text: "My doctor told me to try DASH. This plan made it so simple. Down 20 lbs and off my BP medication.",
              rating: 5,
            },
            {
              name: "Jessica L.",
              age: 34,
              text: "I love that the meals are delicious and I don't feel like I'm on a diet. More energy than ever!",
              rating: 5,
            },
          ].map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-gray-50 rounded-2xl"
            >
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <svg
                    key={j}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="#f59e0b"
                  >
                    <path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8L8 1z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-700 mb-2">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className="text-xs text-gray-500">
                {testimonial.name}, age {testimonial.age}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-8 pb-12">
        <div className="bg-gradient-to-br from-dash-blue to-primary-800 rounded-3xl p-6 text-center text-white">
          <h2 className="text-xl font-bold mb-2">
            Ready to transform your health?
          </h2>
          <p className="text-sm text-blue-200 mb-5">
            Take the free quiz and get your personalized DASH diet plan today.
          </p>
          <Link href="/quiz">
            <button className="w-full py-4 px-6 bg-white text-dash-blue font-bold rounded-2xl text-lg transition-all active:scale-[0.98]">
              Get My Plan
            </button>
          </Link>
        </div>
      </section>

      {/* Access Existing Plan */}
      <AccessPlanSection />

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-gray-100">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-dash-blue to-dash-teal rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">D</span>
            </div>
            <span className="font-bold text-sm text-gray-900">DashDiet</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link href="/cookies" className="hover:text-gray-600">Cookies</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} DashDiet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
