"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AccessPlanSection from "@/components/AccessPlanSection";
import FAQSection from "@/components/FAQSection";

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
        <div className="flex items-center">
          <Image
            src="/dash-diet-logo.svg"
            alt="DashDiet"
            width={240}
            height={80}
            className="h-14 w-auto"
          />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-1 pb-6">
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
        className="px-4 py-2"
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

      {/* As Seen In - Media Coverage */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 py-6 bg-gray-50 rounded-2xl"
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

      {/* Bottom CTA */}
      <section className="px-4 py-4 pb-4">
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
      <footer className="px-4 py-4 border-t border-gray-100">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Image
              src="/dash-diet-logo.svg"
              alt="DashDiet"
              width={200}
              height={56}
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link href="/cookies" className="hover:text-gray-600">Cookies</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            <Link href="/cancel" className="hover:text-gray-600">Cancel</Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} DashDiet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
