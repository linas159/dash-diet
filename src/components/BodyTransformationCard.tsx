"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { calculateBMI, getBMICategory } from "@/lib/utils";

interface BodyTransformationCardProps {
  gender: string;
  currentWeight: number;
  targetWeight: number;
  height: number;
}

// Map BMI to body type image - ensure different images for different BMI ranges
function getBodyTypeImage(bmi: number, gender: string): string {
  const genderSuffix = gender === "female" ? "woman" : "man";

  if (bmi < 18.5) {
    // Underweight - use very fit
    return `/photos/very-fit-${genderSuffix}.png`;
  } else if (bmi < 25) {
    // Normal weight - use normal
    return `/photos/normal-${genderSuffix}.png`;
  } else if (bmi < 30) {
    // Overweight - use obese (lighter version)
    return `/photos/obese-${genderSuffix}.png`;
  } else if (bmi < 35) {
    // Obese - use very obese
    return `/photos/very-obese-${genderSuffix}.png`;
  } else {
    // Very obese - use very obese
    return `/photos/very-obese-${genderSuffix}.png`;
  }
}

// Get the goal/target image - always show progress
function getGoalBodyImage(currentBMI: number, targetBMI: number, gender: string): string {
  const genderSuffix = gender === "female" ? "woman" : "man";

  // If target is normal/fit, show very fit to show aspirational goal
  if (targetBMI < 25) {
    return `/photos/very-fit-${genderSuffix}.png`;
  } else if (targetBMI < 30) {
    // Target is still overweight, show normal as improvement
    return `/photos/normal-${genderSuffix}.png`;
  } else {
    // Target is still obese, show at least one level better
    return `/photos/obese-${genderSuffix}.png`;
  }
}

// Calculate body fat percentage (estimation)
function estimateBodyFat(bmi: number, gender: string): number {
  // Simplified estimation formula
  if (gender === "female") {
    return Math.round((1.2 * bmi + 0.23 * 30 - 5.4) * 10) / 10;
  } else {
    return Math.round((1.2 * bmi + 0.23 * 30 - 16.2) * 10) / 10;
  }
}

// Get fitness level based on BMI
function getFitnessLevel(bmi: number): { level: number; label: string; color: string } {
  if (bmi < 18.5) return { level: 3, label: "Good", color: "bg-green-500" };
  if (bmi < 25) return { level: 4, label: "Excellent", color: "bg-green-500" };
  if (bmi < 30) return { level: 2, label: "Fair", color: "bg-yellow-500" };
  if (bmi < 35) return { level: 1, label: "Low", color: "bg-red-400" };
  return { level: 1, label: "Very Low", color: "bg-red-500" };
}

export default function BodyTransformationCard({
  gender,
  currentWeight,
  targetWeight,
  height,
}: BodyTransformationCardProps) {
  const currentBMI = calculateBMI(currentWeight, height);
  const targetBMI = calculateBMI(targetWeight, height);

  const currentBodyFat = estimateBodyFat(currentBMI, gender);
  const targetBodyFat = estimateBodyFat(targetBMI, gender);

  const currentFitness = getFitnessLevel(currentBMI);
  const targetFitness = getFitnessLevel(targetBMI);

  const currentImage = getBodyTypeImage(currentBMI, gender);
  const targetImage = getGoalBodyImage(currentBMI, targetBMI, gender);

  return (
    <div className="px-4 -mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="grid grid-cols-2">
          {/* NOW - Current Body */}
          <div className="p-6 border-r border-gray-100">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-red-600 uppercase tracking-wide">
                Now
              </h3>
            </div>

            {/* Body Image */}
            <div className="relative h-64 mb-4 flex items-end justify-center">
              <div className="relative w-40 h-full">
                <Image
                  src={currentImage}
                  alt="Current body type"
                  fill
                  className="object-contain object-bottom grayscale"
                  priority
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Body fat:</div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentBodyFat}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">BMI:</div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentBMI.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fitness level:</div>
                <div className="flex gap-1.5 mt-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < currentFitness.level ? currentFitness.color : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GOAL - Target Body */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-green-600 uppercase tracking-wide">
                Goal
              </h3>
            </div>

            {/* Body Image */}
            <div className="relative h-64 mb-4 flex items-end justify-center">
              <div className="relative w-40 h-full">
                <Image
                  src={targetImage}
                  alt="Goal body type"
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Body fat:</div>
                <div className="text-2xl font-bold text-green-700">
                  {targetBodyFat}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">BMI:</div>
                <div className="text-2xl font-bold text-green-700">
                  {targetBMI.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fitness level:</div>
                <div className="flex gap-1.5 mt-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < targetFitness.level ? targetFitness.color : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-3 border-green-500">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-green-600"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
