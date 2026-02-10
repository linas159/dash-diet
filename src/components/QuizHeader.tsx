"use client";

import { motion } from "framer-motion";

interface QuizHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  section?: string;
}

export default function QuizHeader({
  onBack,
  showBack = true,
  section,
}: QuizHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 safe-top">
      <div className="w-10">
        {showBack && onBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.button>
        )}
      </div>

      {section && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold text-dash-teal uppercase tracking-wider"
        >
          {section}
        </motion.span>
      )}

      <div className="w-10" />
    </div>
  );
}
