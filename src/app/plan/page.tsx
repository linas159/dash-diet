"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  getMealImage,
  getExerciseImage,
  getShoppingCategoryImage,
  getComboImage,
  getLifestyleImage,
} from "@/lib/plan-images";

interface Meal {
  type: string;
  name: string;
  calories: number;
  description: string;
  ingredients?: string[];
  macros?: { protein: number; carbs: number; fats: number; sodium: number };
  prepTime?: string;
  recipe?: string;
}

interface MealDay {
  day: string;
  meals: Meal[];
}

interface Exercise {
  name: string;
  duration: string;
  intensity: string;
}

interface ExerciseDay {
  day: string;
  exercises: Exercise[];
  restDay?: boolean;
}

interface FoodCombo {
  name: string;
  foods: string[];
  benefit: string;
  bestTime?: string;
}

interface ShoppingItem {
  item: string;
  quantity: string;
}

interface ShoppingList {
  produce?: ShoppingItem[];
  proteins?: ShoppingItem[];
  grains?: ShoppingItem[];
  dairy?: ShoppingItem[];
  pantry?: ShoppingItem[];
  other?: ShoppingItem[];
}

interface ProgressTracking {
  weeklyGoals?: Array<{ goal: string; tracked: boolean }>;
  measurements?: {
    weight?: number | null;
    waist?: number | null;
    bloodPressure?: { systolic: number | null; diastolic: number | null } | null;
    energyLevel?: number | null;
    sleepQuality?: number | null;
  };
  milestones?: Array<{ week: number; target: string; achieved: boolean }>;
  dailyChecklist?: {
    waterIntake?: boolean[];
    mealsCompleted?: boolean[];
    exerciseCompleted?: boolean[];
    sleepQuality?: (number | null)[];
  };
}

interface PlanData {
  bmi?: number;
  bmiCategory?: string;
  dailyCalories?: number;
  mealPlan?: MealDay[];
  exercisePlan?: ExerciseDay[];
  foodCombinations?: FoodCombo[];
  weeklyShoppingList?: ShoppingList;
  progressTracking?: ProgressTracking;
  tips?: string[];
  summary?: string;
  email?: string;
}

const categoryEmojis: Record<string, string> = {
  produce: "🥬",
  proteins: "🍗",
  grains: "🌾",
  dairy: "🥛",
  pantry: "🏺",
  other: "🛒",
};

function PlanContent() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"meals" | "exercise" | "shopping" | "progress" | "tips">("meals");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Shopping list checkboxes state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Weekly goals checkboxes state
  const [checkedGoals, setCheckedGoals] = useState<Record<number, boolean>>({});

  // Milestones checkboxes state
  const [checkedMilestones, setCheckedMilestones] = useState<Record<number, boolean>>({});

  // Measurements state
  const [measurements, setMeasurements] = useState({
    weight: "",
    waist: "",
    systolic: "",
    diastolic: "",
    energy: "",
  });

  // Recipe modal state
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const toggleShoppingItem = (category: string, index: number) => {
    const key = `${category}-${index}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleGoal = (index: number) => {
    setCheckedGoals((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleMilestone = (index: number) => {
    setCheckedMilestones((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const openRecipeModal = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setShowRecipeModal(false);
    setTimeout(() => setSelectedMeal(null), 300);
  };

  useEffect(() => {
    if (!subscriptionId) {
      setError("No subscription ID provided. Please check your email for the correct link.");
      setLoading(false);
      return;
    }

    fetch(`/api/get-plan?subscription_id=${subscriptionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPlan(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load your plan. Please try again.");
        setLoading(false);
      });
  }, [subscriptionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 border-4 border-dash-blue/20 border-t-dash-blue rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading your personalized plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Plan</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{error}</p>
        <Link href="/contact" className="text-dash-blue font-medium text-sm">
          Contact Support
        </Link>
      </div>
    );
  }

  if (!plan) return null;

  const days = plan.mealPlan?.map((d) => d.day) || [];
  const currentMeals = plan.mealPlan?.[activeDay]?.meals || [];
  const currentExercise = plan.exercisePlan?.[activeDay];

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <header className="px-4 py-1 flex items-center gap-3 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-lg z-10">
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

      {/* Compact Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-4"
      >
        <div className="bg-gradient-to-br from-dash-blue to-primary-800 rounded-2xl text-white mb-4 overflow-hidden">
          <button
            onClick={() => setSummaryExpanded(!summaryExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <h1 className="text-sm font-bold">Your DASH Diet Plan</h1>
            <div className="flex items-center gap-2">
              {plan.bmi && (
                <span className="bg-white/15 rounded-lg px-2 py-1 text-xs font-semibold">
                  BMI {plan.bmi}
                </span>
              )}
              {plan.dailyCalories && (
                <span className="bg-white/15 rounded-lg px-2 py-1 text-xs font-semibold">
                  {plan.dailyCalories} kcal
                </span>
              )}
              <svg
                className={`w-4 h-4 text-blue-200 transition-transform duration-300 ${summaryExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          <AnimatePresence>
            {summaryExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-sm text-blue-200 leading-relaxed">
                  {plan.summary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="px-4 mb-4 overflow-x-auto">
        <div className="flex bg-gray-100 rounded-xl p-1 min-w-max">
          {(["meals", "exercise", "shopping", "progress", "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white text-dash-blue shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {tab === "shopping" ? "Shopping List" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Day Selector (for meals & exercise only) */}
      {(activeTab === "meals" || activeTab === "exercise") && days.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {days.map((day, i) => (
              <button
                key={day}
                onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeDay === i
                    ? "bg-dash-blue text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meals Tab */}
      {activeTab === "meals" && (
        <div className="px-4 space-y-3">
          {currentMeals.map((meal, i) => (
            <motion.div
              key={`${activeDay}-${meal.type}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all"
              onClick={() => openRecipeModal(meal)}
            >
              <div className="relative h-40 w-full">
                <Image
                  src={getMealImage(meal.type, activeDay, meal.name)}
                  alt={meal.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 428px) 396px, 396px"
                  loading={i === 0 ? undefined : "lazy"}
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wide">
                    {meal.type}
                  </span>
                  <span className="text-xs text-white/80 font-medium">{meal.calories} kcal</span>
                </div>
                {/* Recipe indicator */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                  <svg
                    className="w-4 h-4 text-dash-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm">{meal.name}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{meal.description}</p>
                <p className="text-xs text-dash-blue font-medium mt-2">Tap to view recipe →</p>
              </div>
            </motion.div>
          ))}
          {currentMeals.length > 0 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                Daily total: {currentMeals.reduce((sum, m) => sum + m.calories, 0)} kcal
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exercise Tab */}
      {activeTab === "exercise" && currentExercise && (
        <div className="px-4 space-y-3">
          {currentExercise.restDay ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image
                  src="/photos/exercises/rest-day.jpg"
                  alt="Rest day"
                  fill
                  className="object-cover"
                  sizes="(max-width: 428px) 396px, 396px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-bold text-lg mb-1">Rest Day</h3>
                  <p className="text-sm text-white/80">
                    Recovery is essential. Take it easy and let your body recharge.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            currentExercise.exercises.map((exercise, i) => (
              <motion.div
                key={`${activeDay}-${exercise.name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={getExerciseImage(exercise.name)}
                    alt={exercise.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{exercise.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{exercise.duration}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className={`text-xs font-medium capitalize ${
                      exercise.intensity === "high"
                        ? "text-red-500"
                        : exercise.intensity === "light"
                        ? "text-green-500"
                        : "text-dash-blue"
                    }`}>{exercise.intensity}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Shopping List Tab */}
      {activeTab === "shopping" && plan.weeklyShoppingList && (
        <div className="px-4 space-y-4">
          <div className="bg-blue-50 rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Weekly Shopping List</h3>
            <p className="text-xs text-gray-600">
              Everything you need for your 7-day DASH meal plan
            </p>
          </div>

          {Object.entries(plan.weeklyShoppingList).map(([category, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={category}>
                {/* Category banner with photo */}
                <div className="relative h-20 w-full rounded-xl overflow-hidden mb-2">
                  <Image
                    src={getShoppingCategoryImage(category)}
                    alt={category}
                    fill
                    className="object-cover"
                    sizes="(max-width: 428px) 396px, 396px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-white capitalize flex items-center gap-2">
                      {categoryEmojis[category] || "🛒"} {category}
                    </h4>
                    <span className="text-xs text-white/70">{items.length} items</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((item: ShoppingItem, i: number) => {
                    const itemKey = `${category}-${i}`;
                    const isChecked = checkedItems[itemKey] || false;
                    return (
                      <motion.div
                        key={itemKey}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleShoppingItem(category, i)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-dash-blue border-dash-blue"
                                : "border-gray-300"
                            }`}
                          >
                            {isChecked && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-sm transition-all ${
                              isChecked
                                ? "text-gray-400 line-through"
                                : "text-gray-700"
                            }`}
                          >
                            {item.item}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{item.quantity}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Tracking Tab */}
      {activeTab === "progress" && plan.progressTracking && (
        <div className="px-4 space-y-6">
          {/* Weekly Goals */}
          {plan.progressTracking.weeklyGoals && plan.progressTracking.weeklyGoals.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Weekly Goals</h3>
              <div className="space-y-2">
                {plan.progressTracking.weeklyGoals.map((goalItem, i) => {
                  const isChecked = checkedGoals[i] || false;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleGoal(i)}
                    >
                      <div
                        className={`w-6 h-6 border-2 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-dash-blue border-dash-blue"
                            : "border-dash-blue"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <p
                        className={`text-sm flex-1 transition-all ${
                          isChecked ? "text-gray-400 line-through" : "text-gray-700"
                        }`}
                      >
                        {goalItem.goal}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Measurements */}
          {plan.progressTracking.measurements && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Track Your Measurements</h3>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weight (kg)</span>
                  <input
                    type="number"
                    placeholder="--"
                    value={measurements.weight}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, weight: e.target.value })
                    }
                    className="w-20 px-3 py-1 text-sm border border-gray-200 rounded-lg text-right focus:border-dash-blue focus:ring-1 focus:ring-dash-blue outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Waist (cm)</span>
                  <input
                    type="number"
                    placeholder="--"
                    value={measurements.waist}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, waist: e.target.value })
                    }
                    className="w-20 px-3 py-1 text-sm border border-gray-200 rounded-lg text-right focus:border-dash-blue focus:ring-1 focus:ring-dash-blue outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blood Pressure</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="--"
                      value={measurements.systolic}
                      onChange={(e) =>
                        setMeasurements({ ...measurements, systolic: e.target.value })
                      }
                      className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg text-right focus:border-dash-blue focus:ring-1 focus:ring-dash-blue outline-none transition-all"
                    />
                    <span className="text-xs text-gray-400">/</span>
                    <input
                      type="number"
                      placeholder="--"
                      value={measurements.diastolic}
                      onChange={(e) =>
                        setMeasurements({ ...measurements, diastolic: e.target.value })
                      }
                      className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg text-right focus:border-dash-blue focus:ring-1 focus:ring-dash-blue outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Energy Level (1-10)</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="--"
                    value={measurements.energy}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, energy: e.target.value })
                    }
                    className="w-20 px-3 py-1 text-sm border border-gray-200 rounded-lg text-right focus:border-dash-blue focus:ring-1 focus:ring-dash-blue outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Milestones */}
          {plan.progressTracking.milestones && plan.progressTracking.milestones.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Milestones</h3>
              <div className="space-y-2">
                {plan.progressTracking.milestones.map((milestone, i) => {
                  const isChecked = checkedMilestones[i] || false;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleMilestone(i)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-semibold text-dash-teal">
                          Week {milestone.week}
                        </span>
                        <div
                          className={`w-5 h-5 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-dash-teal border-dash-teal"
                              : "border-gray-300"
                          }`}
                        >
                          {isChecked && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-sm transition-all ${
                          isChecked ? "text-gray-400 line-through" : "text-gray-700"
                        }`}
                      >
                        {milestone.target}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === "tips" && (
        <div className="px-4 space-y-6">
          {/* Tips with hero + interspersed lifestyle photos */}
          {plan.tips && plan.tips.length > 0 && (
            <div>
              {/* Hero image */}
              <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-4">
                <Image
                  src="/photos/lifestyle/healthy-eating.jpg"
                  alt="Healthy eating"
                  fill
                  className="object-cover"
                  sizes="(max-width: 428px) 396px, 396px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-bold text-white text-lg">DASH Diet Tips</h3>
                </div>
              </div>
              <div className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <div key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
                    >
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </motion.div>
                    {/* Lifestyle photo after every 3rd tip */}
                    {(i + 1) % 3 === 0 && i < plan.tips!.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (i + 1) * 0.05 }}
                        className="relative h-32 w-full rounded-xl overflow-hidden mt-2"
                      >
                        <Image
                          src={getLifestyleImage(Math.floor(i / 3))}
                          alt="Healthy lifestyle"
                          fill
                          className="object-cover"
                          sizes="(max-width: 428px) 396px, 396px"
                          loading="lazy"
                        />
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Food Combos with photos */}
          {plan.foodCombinations && plan.foodCombinations.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Powerful Food Combinations</h3>
              <div className="space-y-3">
                {plan.foodCombinations.map((combo, i) => (
                  <motion.div
                    key={combo.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={getComboImage(combo.name, i)}
                        alt={combo.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 428px) 396px, 396px"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-3">
                        <h4 className="font-semibold text-sm text-white">{combo.name}</h4>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {combo.foods.map((food) => (
                          <span
                            key={food}
                            className="bg-blue-50 text-dash-blue text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{combo.benefit}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recipe Modal */}
      <AnimatePresence>
        {showRecipeModal && selectedMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeRecipeModal}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header with Image */}
              <div className="relative h-48 w-full flex-shrink-0">
                <Image
                  src={getMealImage(selectedMeal.type, activeDay, selectedMeal.name)}
                  alt={selectedMeal.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={closeRecipeModal}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block bg-dash-teal text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    {selectedMeal.type}
                  </span>
                  <h2 className="text-xl font-bold text-white">{selectedMeal.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-white/80">{selectedMeal.calories} kcal</p>
                    {selectedMeal.prepTime && (
                      <p className="text-sm text-white/80">⏱ {selectedMeal.prepTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-5">
                <div className="space-y-5">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-dash-blue">ℹ️</span> About This Meal
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedMeal.description}
                    </p>
                  </div>

                  {/* Macros */}
                  {selectedMeal.macros && (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Protein", value: selectedMeal.macros.protein, unit: "g", color: "bg-blue-50 text-dash-blue" },
                        { label: "Carbs", value: selectedMeal.macros.carbs, unit: "g", color: "bg-orange-50 text-orange-600" },
                        { label: "Fats", value: selectedMeal.macros.fats, unit: "g", color: "bg-yellow-50 text-yellow-600" },
                        { label: "Sodium", value: selectedMeal.macros.sodium, unit: "mg", color: "bg-red-50 text-red-500" },
                      ].map((m) => (
                        <div key={m.label} className={`rounded-xl p-2 text-center ${m.color}`}>
                          <p className="text-xs font-bold">{m.value}{m.unit}</p>
                          <p className="text-xs opacity-70">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recipe/Instructions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-dash-blue">📝</span> Recipe & Instructions
                    </h3>
                    <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Ingredients:</h4>
                        <ul className="text-sm text-gray-700 space-y-1.5 ml-4">
                          {getRecipeIngredients(selectedMeal).map((ingredient, i) => (
                            <li key={i} className="list-disc">{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructions:</h4>
                        <ol className="text-sm text-gray-700 space-y-1.5 ml-4">
                          {getRecipeInstructions(selectedMeal).map((instruction, i) => (
                            <li key={i} className="list-decimal">{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* DASH Diet Benefits */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-dash-blue">💚</span> DASH Diet Benefits
                    </h3>
                    <div className="bg-green-50 rounded-xl p-4">
                      <ul className="text-sm text-gray-700 space-y-2">
                        {getDashBenefits(selectedMeal.type).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions — always use the actual AI-generated data from the meal object.
// Keyword-based fallbacks only fire when the plan genuinely lacks the field.
function getRecipeIngredients(meal: Meal): string[] {
  if (meal.ingredients && meal.ingredients.length > 0) {
    return meal.ingredients;
  }

  // Fallback: derive a sensible list from the meal name
  const name = meal.name.toLowerCase();
  if (name.includes("oatmeal") || name.includes("oat")) {
    return ["½ cup rolled oats", "1 cup low-fat milk", "½ cup mixed berries", "1 tbsp walnuts", "1 tsp honey", "Pinch of cinnamon"];
  }
  if (name.includes("smoothie")) {
    return ["1 cup spinach", "1 banana", "½ cup mixed berries", "1 cup low-fat yogurt", "1 tbsp chia seeds", "½ cup almond milk"];
  }
  if (name.includes("salad")) {
    return ["2 cups mixed greens", "½ cup cherry tomatoes", "½ cucumber sliced", "3 oz grilled chicken or chickpeas", "2 tbsp olive oil & lemon dressing"];
  }
  if (name.includes("salmon") || name.includes("fish") || name.includes("cod")) {
    return ["4 oz fish fillet", "1 cup broccoli", "½ cup quinoa", "1 lemon juiced", "1 clove garlic", "1 tbsp olive oil"];
  }
  if (name.includes("chicken")) {
    return ["4 oz chicken breast", "1 cup mixed vegetables", "½ cup brown rice", "2 cloves garlic", "1 tbsp olive oil", "Low-sodium spices"];
  }
  if (name.includes("soup")) {
    return ["2 cups low-sodium broth", "1 cup mixed vegetables", "½ cup lentils or beans", "2 cloves garlic", "Fresh herbs"];
  }
  return ["Fresh vegetables", "Lean protein (chicken, fish, or legumes)", "Whole grains", "Healthy fats (olive oil or nuts)", "Low-sodium herbs and spices"];
}

function getRecipeInstructions(meal: Meal): string[] {
  if (meal.recipe && meal.recipe.trim()) {
    // Split the 2-sentence recipe into individual steps
    return meal.recipe
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Fallback: derive steps from the meal name
  const name = meal.name.toLowerCase();
  if (name.includes("oatmeal") || name.includes("oat")) {
    return ["Bring milk to a simmer, add oats and cook 5–7 min until creamy.", "Top with berries, walnuts, and a drizzle of honey. Serve warm."];
  }
  if (name.includes("smoothie")) {
    return ["Blend all ingredients on high for 45 seconds until smooth.", "Pour into a glass and serve immediately."];
  }
  if (name.includes("salad")) {
    return ["Arrange greens, tomatoes, cucumber, and protein in a bowl.", "Drizzle with olive oil and lemon dressing, toss and serve."];
  }
  if (name.includes("salmon") || name.includes("fish") || name.includes("cod")) {
    return ["Season fish with lemon, garlic, and herbs; bake at 400°F for 12–15 min.", "Serve with steamed broccoli and cooked quinoa."];
  }
  if (name.includes("chicken")) {
    return ["Season and cook chicken in olive oil over medium heat, 6–7 min per side.", "Sauté vegetables in the same pan, then serve over brown rice."];
  }
  if (name.includes("soup")) {
    return ["Sauté vegetables and garlic, add broth and beans, simmer 20–25 min.", "Season with herbs and serve hot."];
  }
  return ["Prepare all ingredients following DASH guidelines (minimal salt, plenty of vegetables).", "Combine and serve, seasoning with herbs and lemon juice instead of salt."];
}

function getDashBenefits(mealType: string): string[] {
  const type = mealType.toLowerCase();

  if (type.includes("breakfast")) {
    return [
      "Provides sustained energy throughout the morning",
      "Rich in fiber to support healthy digestion",
      "Contains potassium to help lower blood pressure",
      "Low in sodium to support heart health"
    ];
  }
  if (type.includes("lunch")) {
    return [
      "Balanced macronutrients for afternoon energy",
      "High in vegetables for essential vitamins and minerals",
      "Lean protein supports muscle maintenance",
      "Helps maintain stable blood sugar levels"
    ];
  }
  if (type.includes("dinner")) {
    return [
      "Light yet satisfying for better sleep quality",
      "Rich in omega-3s for heart and brain health",
      "Supports healthy blood pressure with potassium",
      "Low sodium content protects cardiovascular health"
    ];
  }
  if (type.includes("snack")) {
    return [
      "Prevents energy dips between meals",
      "Provides healthy fats and protein for satiety",
      "Nutrient-dense without excess calories",
      "Supports DASH diet goals with whole food ingredients"
    ];
  }

  return [
    "Supports healthy blood pressure levels",
    "Rich in fruits, vegetables, and whole grains",
    "Low in saturated fat and sodium",
    "Provides essential nutrients for heart health"
  ];
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-dash-blue/20 border-t-dash-blue rounded-full animate-spin" />
        </div>
      }
    >
      <PlanContent />
    </Suspense>
  );
}
