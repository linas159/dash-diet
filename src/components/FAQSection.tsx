"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is the DASH diet?",
    answer: "DASH stands for Dietary Approaches to Stop Hypertension. It's a scientifically proven eating plan developed by the National Institutes of Health (NIH) that emphasizes fruits, vegetables, whole grains, lean proteins, and low-fat dairy while limiting sodium, saturated fats, and added sugars."
  },
  {
    question: "How quickly will I see results?",
    answer: "Most people start seeing improvements in blood pressure within 2 weeks. Weight loss results typically appear within 3-4 weeks of following the plan consistently. However, individual results may vary based on your starting point, adherence to the plan, and overall lifestyle factors."
  },
  {
    question: "Is this suitable for vegetarians or vegans?",
    answer: "Absolutely! The DASH diet is highly adaptable to vegetarian and vegan lifestyles. Our personalized meal plans can be customized based on your dietary preferences, including plant-based protein sources like beans, lentils, tofu, and nuts."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no penalties or fees. Simply go to your account settings or contact our support team, and we'll process your cancellation immediately. You'll retain access until the end of your current billing period."
  },
  {
    question: "Do I need to count calories?",
    answer: "Not necessarily! Our personalized meal plans are already calorie-controlled based on your goals and activity level. However, we do provide calorie information for each meal if you prefer to track your intake. The focus is on eating nutritious, satisfying foods in the right portions."
  },
  {
    question: "Will I need to buy special foods or supplements?",
    answer: "No! The DASH diet focuses on whole, commonly available foods you can find at any grocery store. You won't need expensive supplements, meal replacements, or hard-to-find ingredients. Our shopping lists make it easy to find everything you need."
  },
  {
    question: "How is this different from other diet apps?",
    answer: "Unlike generic diet apps, we provide truly personalized plans based on your unique health profile, preferences, and goals. Our plans are backed by Harvard-affiliated nutrition experts and based on the #1 doctor-recommended diet. Plus, we include meal plans, exercise routines, shopping lists, and progress tracking all in one place."
  },
  {
    question: "Is the DASH diet safe for people with diabetes?",
    answer: "Yes! The DASH diet is often recommended for people with diabetes because it helps manage blood sugar levels, reduce insulin resistance, and lower blood pressure. However, we always recommend consulting with your healthcare provider before starting any new diet plan, especially if you're managing a chronic condition."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-4 py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
        Frequently Asked Questions
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Everything you need to know about the DASH diet plan
      </p>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-sm pr-4">
                {faq.question}
              </span>
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#1e3a5f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-0">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Still have questions? */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Still have questions?{" "}
          <a href="mailto:support@trydashdiet.com" className="text-dash-blue font-semibold hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </section>
  );
}
