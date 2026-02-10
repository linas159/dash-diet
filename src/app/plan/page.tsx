"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Meal {
  type: string;
  name: string;
  calories: number;
  description: string;
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

function PlanContent() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"meals" | "exercise" | "shopping" | "progress" | "tips">("meals");

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
      <header className="px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-lg z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-dash-blue to-dash-teal rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-lg text-dash-blue">Your Plan</span>
        </div>
      </header>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6"
      >
        <div className="bg-gradient-to-br from-dash-blue to-primary-800 rounded-2xl p-5 text-white mb-6">
          <h1 className="text-lg font-bold mb-1">Your DASH Diet Plan</h1>
          <p className="text-sm text-blue-200 leading-relaxed">{plan.summary}</p>
          <div className="flex gap-4 mt-4">
            {plan.bmi && (
              <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                <div className="text-lg font-bold">{plan.bmi}</div>
                <div className="text-[10px] text-blue-200">BMI</div>
              </div>
            )}
            {plan.dailyCalories && (
              <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                <div className="text-lg font-bold">{plan.dailyCalories}</div>
                <div className="text-[10px] text-blue-200">kcal/day</div>
              </div>
            )}
          </div>
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
              className="bg-white border border-gray-100 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-dash-teal uppercase tracking-wide">
                  {meal.type}
                </span>
                <span className="text-xs text-gray-400">{meal.calories} kcal</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{meal.name}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{meal.description}</p>
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
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🧘</div>
              <h3 className="font-semibold text-gray-900 mb-1">Rest Day</h3>
              <p className="text-sm text-gray-500">
                Recovery is essential. Take it easy and let your body recharge.
              </p>
            </div>
          ) : (
            currentExercise.exercises.map((exercise, i) => (
              <motion.div
                key={`${activeDay}-${exercise.name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  exercise.intensity === "high"
                    ? "bg-red-50 text-red-500"
                    : exercise.intensity === "light"
                    ? "bg-green-50 text-green-500"
                    : "bg-blue-50 text-dash-blue"
                }`}>
                  <span className="text-lg">
                    {exercise.intensity === "high" ? "🔥" : exercise.intensity === "light" ? "🧘" : "💪"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{exercise.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{exercise.duration}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-xs text-gray-500 capitalize">{exercise.intensity}</span>
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
            <h3 className="font-semibold text-gray-900 mb-1">📋 Weekly Shopping List</h3>
            <p className="text-xs text-gray-600">
              Everything you need for your 7-day DASH meal plan
            </p>
          </div>

          {Object.entries(plan.weeklyShoppingList).map(([category, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={category}>
                <h4 className="font-semibold text-sm text-gray-900 mb-2 capitalize flex items-center gap-2">
                  {category === "produce" && "🥬"}
                  {category === "proteins" && "🍗"}
                  {category === "grains" && "🌾"}
                  {category === "dairy" && "🥛"}
                  {category === "pantry" && "🏺"}
                  {category === "other" && "🛒"}
                  {category}
                </h4>
                <div className="space-y-2">
                  {items.map((item: ShoppingItem, i: number) => (
                    <motion.div
                      key={`${category}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item.item}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.quantity}</span>
                    </motion.div>
                  ))}
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
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Weekly Goals</h3>
              <div className="space-y-2">
                {plan.progressTracking.weeklyGoals.map((goalItem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4"
                  >
                    <div className="w-6 h-6 border-2 border-dash-blue rounded-md flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 flex-1">{goalItem.goal}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Measurements */}
          {plan.progressTracking.measurements && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📏 Track Your Measurements</h3>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weight (kg)</span>
                  <input
                    type="number"
                    placeholder="--"
                    className="w-20 px-3 py-1 text-sm border border-gray-200 rounded-lg text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Waist (cm)</span>
                  <input
                    type="number"
                    placeholder="--"
                    className="w-20 px-3 py-1 text-sm border border-gray-200 rounded-lg text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blood Pressure</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="--"
                      className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg text-right"
                    />
                    <span className="text-xs text-gray-400">/</span>
                    <input
                      type="number"
                      placeholder="--"
                      className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg text-right"
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
                    className="w-20 px-3 py-1 text-sm border border-gray-200 rounded-lg text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Milestones */}
          {plan.progressTracking.milestones && plan.progressTracking.milestones.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🏆 Milestones</h3>
              <div className="space-y-2">
                {plan.progressTracking.milestones.map((milestone, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-dash-teal">Week {milestone.week}</span>
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                    </div>
                    <p className="text-sm text-gray-700">{milestone.target}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === "tips" && (
        <div className="px-4 space-y-6">
          {/* Tips */}
          {plan.tips && plan.tips.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">DASH Diet Tips</h3>
              <div className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
                  >
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    <p className="text-sm text-gray-700">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Food Combos */}
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
                    className="bg-white border border-gray-100 rounded-2xl p-4"
                  >
                    <h4 className="font-semibold text-sm text-gray-900">{combo.name}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
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
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
