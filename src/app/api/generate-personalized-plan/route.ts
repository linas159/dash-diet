import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
} from "@/lib/utils";
import { QuizAnswers } from "@/types/quiz";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, email, quizAnswers } = body as {
      subscriptionId: string;
      email: string;
      quizAnswers: QuizAnswers;
    };

    console.log("🔄 Starting personalized plan generation for:", { subscriptionId, email });

    if (!subscriptionId || !quizAnswers) {
      console.error("❌ Missing required parameters:", { subscriptionId: !!subscriptionId, quizAnswers: !!quizAnswers });
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Extract key data from answers
    const gender = (quizAnswers.gender as string) || "male";
    const age = (quizAnswers.age as number) || 30;
    const height = (quizAnswers.height as number) || 170;
    const weight = (quizAnswers.current_weight as number) || 80;
    const targetWeight = (quizAnswers.target_weight as number) || 70;
    const activityLevel = (quizAnswers.activity_level as string) || "light";
    const goal = (quizAnswers.goal as string) || "eat_healthier";
    const allergies = (quizAnswers.allergies as string[]) || [];
    const foodPreferences = (quizAnswers.food_preferences as string[]) || [];
    const foodsToAvoid = (quizAnswers.foods_to_avoid as string[]) || [];
    const healthConditions = (quizAnswers.health_conditions as string[]) || [];
    const cookingSkill = (quizAnswers.cooking_skill as string) || "intermediate";
    const exerciseFrequency = (quizAnswers.exercise_frequency as string) || "1_2_week";

    // Additional quiz answers
    const mealsPerDay = (quizAnswers.meals_per_day as string) || "3";
    const eatingHabits = (quizAnswers.eating_habits as string[]) || [];
    const bodyType = (quizAnswers.body_type as string) || "average";
    const targetBody = (quizAnswers.target_body as string) || "fit";
    const saltIntake = (quizAnswers.salt_intake as string) || "moderate";
    const sleepHours = (quizAnswers.sleep_hours as string) || "7_8";
    const waterIntake = (quizAnswers.water_intake as string) || "4_6";
    const stressLevel = (quizAnswers.stress_level as string) || "3";
    const timeline = (quizAnswers.timeline as string) || "3months";
    const motivation = (quizAnswers.motivation as string) || "energy";
    const pastDiets = (quizAnswers.past_diets as string[]) || [];

    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);
    const dailyCalories = calculateDailyCalories(
      gender,
      weight,
      height,
      age,
      activityLevel,
      goal
    );

    // Build the AI prompt for comprehensive personalized plan
    const prompt = buildComprehensivePrompt({
      gender,
      age,
      height,
      weight,
      targetWeight,
      bmi,
      bmiCategory,
      dailyCalories,
      activityLevel,
      goal,
      allergies,
      foodPreferences,
      foodsToAvoid,
      healthConditions,
      cookingSkill,
      exerciseFrequency,
      mealsPerDay,
      eatingHabits,
      bodyType,
      targetBody,
      saltIntake,
      sleepHours,
      waterIntake,
      stressLevel,
      timeline,
      motivation,
      pastDiets,
    });

    // Log the full prompt so you can inspect it in the terminal while it generates
    console.log("\n" + "═".repeat(80));
    console.log("📋 GEMINI PROMPT");
    console.log("═".repeat(80));
    console.log(prompt);
    console.log("═".repeat(80) + "\n");

    let personalizedPlan = null;

    // Try Gemini API if key is available
    if (process.env.GEMINI_API_KEY) {
      // Use env override first, then try pinned stable models in order.
      // Prefer pinned versions (e.g. gemini-2.0-flash-001) over unpinned aliases
      // so deprecations don't silently break generation. Add newer models to the
      // front of this list as they become available.
      const modelsToTry = [
        ...new Set([
          process.env.GEMINI_MODEL,
          "gemini-2.5-flash",
          "gemini-2.0-flash-001",
          "gemini-1.5-flash-001",
        ].filter(Boolean) as string[]),
      ];

      const systemInstruction =
        "You are a certified nutritionist and fitness expert specializing in the DASH diet. Generate comprehensive, personalized meal plans, exercise routines, shopping lists, and progress tracking templates. Respond in JSON format only with detailed, actionable content.";

      for (const model of modelsToTry) {
        console.log(`🤖 Trying Gemini model: ${model}`);
        try {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY.trim()}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 32768,
                  responseMimeType: "application/json",
                },
              }),
            }
          );

          if (geminiResponse.ok) {
            const data = await geminiResponse.json();
            const textContent = data.candidates[0].content.parts[0].text;
            personalizedPlan = JSON.parse(textContent);
            console.log(`✅ Gemini model ${model} generated personalized plan successfully`);
            break;
          }

          const errorText = await geminiResponse.text();
          console.error(`❌ Gemini model ${model} failed (${geminiResponse.status}):`, errorText);

          // Only try the next model on 404 (deprecated/unavailable); other errors
          // (401, 429, 5xx) won't be fixed by switching models.
          if (geminiResponse.status !== 404) break;
        } catch (err) {
          console.error(`❌ Gemini model ${model} error:`, err);
          // JSON parse errors mean the response was truncated (hit token limit).
          // Try the next model rather than giving up entirely.
          if (err instanceof SyntaxError) {
            console.log(`⚠️ Truncated JSON from ${model}, trying next model...`);
            continue;
          }
          break;
        }
      }
    } else {
      console.log("⚠️ No GEMINI_API_KEY found, using fallback plan generator");
    }

    // Fallback: generate a comprehensive default DASH plan
    if (!personalizedPlan) {
      console.log("📋 Generating fallback DASH plan...");
      personalizedPlan = generateComprehensiveFallbackPlan({
        dailyCalories,
        allergies,
        foodPreferences,
        foodsToAvoid,
        exerciseFrequency,
        cookingSkill,
        bmi,
        bmiCategory,
        targetWeight,
        weight,
      });
      console.log("✅ Fallback plan generated successfully");
    }

    // Add metadata
    const fullPlan = {
      ...personalizedPlan,
      bmi,
      bmiCategory,
      dailyCalories,
      generatedAt: new Date().toISOString(),
      userProfile: {
        gender,
        age,
        height,
        weight,
        targetWeight,
        activityLevel,
        goal,
      },
    };

    // Store in Supabase subscriptions table
    console.log("💾 Saving personalized plan to Supabase for subscription:", subscriptionId);
    const supabase = createServiceClient();
    const { data: updateData, error: updateError } = await supabase
      .from("subscriptions")
      .update({ personalized_plan: fullPlan })
      .eq("stripe_session_id", subscriptionId)
      .select();

    if (updateError) {
      console.error("❌ Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save personalized plan" },
        { status: 500 }
      );
    }

    if (!updateData || updateData.length === 0) {
      console.error("⚠️ No subscription found with stripe_session_id:", subscriptionId);
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    console.log("✅ Personalized plan saved successfully to Supabase!");

    return NextResponse.json({
      success: true,
      message: "Personalized plan generated and saved",
    });
  } catch (error) {
    console.error("Generate personalized plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate personalized plan" },
      { status: 500 }
    );
  }
}

interface PromptParams {
  gender: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  activityLevel: string;
  goal: string;
  allergies: string[];
  foodPreferences: string[];
  foodsToAvoid: string[];
  healthConditions: string[];
  cookingSkill: string;
  exerciseFrequency: string;
  mealsPerDay: string;
  eatingHabits: string[];
  bodyType: string;
  targetBody: string;
  saltIntake: string;
  sleepHours: string;
  waterIntake: string;
  stressLevel: string;
  timeline: string;
  motivation: string;
  pastDiets: string[];
}

// Human-readable label maps (keeps prompt tokens low while keeping AI context clear)
const GOAL_LABELS: Record<string, string> = {
  lose_weight: "lose weight", lower_bp: "lower blood pressure",
  eat_healthier: "eat healthier", more_energy: "increase energy",
  build_muscle: "build muscle", improve_health: "improve overall health",
};
const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "sedentary (desk job)", light: "lightly active",
  moderate: "moderately active", very_active: "very active",
};
const COOKING_LABELS: Record<string, string> = {
  beginner: "beginner cook", intermediate: "intermediate cook",
  advanced: "advanced cook", no_cook: "does not cook — needs no-cook or minimal-prep meals",
};
const TIMELINE_LABELS: Record<string, string> = {
  "1month": "1 month", "3months": "3 months",
  "6months": "6 months", longterm: "long-term lifestyle change",
};
const SALT_LABELS: Record<string, string> = {
  high: "currently eats a high-sodium diet — strong sodium reduction needed",
  moderate: "moderate sodium intake",
  low: "already low sodium intake — maintain and reinforce",
  unsure: "unsure about sodium intake",
};
const SLEEP_LABELS: Record<string, string> = {
  less_5: "under 5 hours (sleep-deprived)", "5_6": "5–6 hours (below optimal)",
  "7_8": "7–8 hours (healthy)", "9_plus": "9+ hours",
};
const WATER_LABELS: Record<string, string> = {
  less_4: "under 4 glasses/day (dehydrated)", "4_6": "4–6 glasses/day",
  "7_8": "7–8 glasses/day", "9_plus": "9+ glasses/day",
};

function buildComprehensivePrompt(params: PromptParams): string {
  const cal = params.dailyCalories;

  // ── Meal structure based on meals_per_day ──────────────────────────────────
  type MealSlot = { type: string; cal: number; proteinG: number; carbsG: number; fatsG: number; sodiumMg: number };
  let mealSlots: MealSlot[];
  let mealCountNote: string;

  if (params.mealsPerDay === "1_2") {
    // 2 large meals, no snack
    mealSlots = [
      { type: "Brunch", cal: Math.round(cal * 0.55), proteinG: 35, carbsG: 55, fatsG: 22, sodiumMg: 500 },
      { type: "Dinner", cal: Math.round(cal * 0.45), proteinG: 40, carbsG: 50, fatsG: 20, sodiumMg: 450 },
    ];
    mealCountNote = "2 meals per day (Brunch + Dinner). Large, satisfying portions. No breakfast or separate snack.";
  } else if (params.mealsPerDay === "3" || params.eatingHabits.includes("skip_breakfast")) {
    // 3 meals, no snack
    mealSlots = [
      { type: "Breakfast", cal: Math.round(cal * 0.25), proteinG: 20, carbsG: 40, fatsG: 12, sodiumMg: 280 },
      { type: "Lunch",     cal: Math.round(cal * 0.40), proteinG: 32, carbsG: 52, fatsG: 16, sodiumMg: 420 },
      { type: "Dinner",    cal: Math.round(cal * 0.35), proteinG: 38, carbsG: 48, fatsG: 18, sodiumMg: 380 },
    ];
    mealCountNote = params.eatingHabits.includes("skip_breakfast")
      ? "3 meals per day — user often skips breakfast so keep it very quick (under 5 min)."
      : "3 meals per day (Breakfast, Lunch, Dinner). No snack.";
  } else if (params.mealsPerDay === "grazing") {
    // 5 small meals
    mealSlots = [
      { type: "Breakfast",    cal: Math.round(cal * 0.20), proteinG: 15, carbsG: 35, fatsG: 10, sodiumMg: 200 },
      { type: "Mid-Morning",  cal: Math.round(cal * 0.15), proteinG: 10, carbsG: 20, fatsG:  8, sodiumMg: 120 },
      { type: "Lunch",        cal: Math.round(cal * 0.25), proteinG: 28, carbsG: 40, fatsG: 12, sodiumMg: 350 },
      { type: "Afternoon",    cal: Math.round(cal * 0.15), proteinG: 10, carbsG: 18, fatsG:  8, sodiumMg: 120 },
      { type: "Dinner",       cal: Math.round(cal * 0.25), proteinG: 30, carbsG: 38, fatsG: 14, sodiumMg: 320 },
    ];
    mealCountNote = "5 small meals/snacks throughout the day (grazing style). Keep each meal light.";
  } else {
    // Default: 4 meals (4_5 or unset)
    mealSlots = [
      { type: "Breakfast", cal: Math.round(cal * 0.25), proteinG: 20, carbsG: 45, fatsG: 12, sodiumMg: 280 },
      { type: "Lunch",     cal: Math.round(cal * 0.35), proteinG: 30, carbsG: 50, fatsG: 15, sodiumMg: 400 },
      { type: "Dinner",    cal: Math.round(cal * 0.30), proteinG: 35, carbsG: 45, fatsG: 18, sodiumMg: 350 },
      { type: "Snack",     cal: Math.round(cal * 0.10), proteinG:  5, carbsG: 18, fatsG:  8, sodiumMg:  80 },
    ];
    mealCountNote = "4 meals per day (Breakfast, Lunch, Dinner, Snack).";
  }

  // ── Derive personalization rules ──────────────────────────────────────────
  const rules: string[] = [];

  // Meal count
  rules.push(`Meal structure: ${mealCountNote}`);

  // Goal-specific macros
  if (params.goal === "build_muscle") rules.push("High protein priority (1.8–2.2g per kg body weight). Include protein in every meal.");
  if (params.goal === "lose_weight") rules.push("Moderate calorie deficit already applied. Prioritize high-volume, low-calorie-density foods.");
  if (params.goal === "lower_bp" || params.healthConditions.includes("high_bp")) rules.push("Strict sodium limit: under 1500mg/day. Emphasise potassium-rich foods (bananas, sweet potato, spinach).");
  if (params.healthConditions.includes("diabetes")) rules.push("Low glycaemic index meals. Minimise simple sugars and refined carbs. Pair carbs with protein/fat.");
  if (params.healthConditions.includes("high_cholesterol")) rules.push("Avoid saturated fat. Use olive oil, oily fish, oats, and soluble fibre sources.");
  if (params.healthConditions.includes("kidney")) rules.push("Limit high-potassium and high-phosphorus foods (bananas, avocado, dairy in excess). Smaller protein portions.");
  if (params.healthConditions.includes("digestive")) rules.push("Avoid raw cruciferous vegetables and high-FODMAP foods. Prefer cooked vegetables and easy-to-digest grains.");

  // Salt intake
  if (params.saltIntake !== "none") rules.push(`Salt habit: ${SALT_LABELS[params.saltIntake] || params.saltIntake}.`);

  // Cooking skill
  rules.push(`Cooking skill: ${COOKING_LABELS[params.cookingSkill] || params.cookingSkill}. ${params.cookingSkill === "beginner" || params.cookingSkill === "no_cook" ? "Use simple recipes, max 15 min prep." : ""}`);

  // Eating habits
  if (params.eatingHabits.includes("late_snacking")) rules.push("User snacks late at night — include a light evening snack option and avoid heavy dinners.");
  if (params.eatingHabits.includes("big_portions")) rules.push("User tends to overeat — use high-fibre, high-volume meals to promote satiety.");
  if (params.eatingHabits.includes("emotional_eating")) rules.push("User eats when stressed — include magnesium-rich and serotonin-supporting foods (dark chocolate, nuts, salmon).");
  if (params.eatingHabits.includes("fast_food")) rules.push("User frequently eats fast food — include quick-prep alternatives that satisfy similar cravings.");
  if (params.eatingHabits.includes("sugary_drinks")) rules.push("User drinks sugary beverages — meal plan should include naturally sweet foods to reduce cravings.");

  // Body composition
  if (params.targetBody === "muscular" || params.goal === "build_muscle") rules.push("Target: muscular build — increase protein, include post-workout meal options.");
  if (params.targetBody === "lean" || params.targetBody === "slim") rules.push("Target: lean/slim — keep fat intake moderate, prioritise lean proteins and vegetables.");

  // Sleep
  if (params.sleepHours === "less_5" || params.sleepHours === "5_6") rules.push("Poor sleep — include magnesium-rich evening foods (pumpkin seeds, almonds, leafy greens) to aid sleep.");

  // Water
  if (params.waterIntake === "less_4") rules.push("Low water intake — add water-rich foods (cucumber, watermelon, celery). Mention hydration in recipe steps.");

  // Stress
  const stress = parseInt(params.stressLevel, 10);
  if (stress >= 4) rules.push("High stress — incorporate anti-stress nutrients: omega-3s, vitamin C (citrus, berries), magnesium, B vitamins.");

  // Timeline
  const timelineLabel = TIMELINE_LABELS[params.timeline] || params.timeline;
  rules.push(`Goal timeline: ${timelineLabel}.`);

  // Avoided foods / allergies (explicit exclusions)
  const excluded = [...params.allergies, ...params.foodsToAvoid].filter((a) => a !== "none");
  if (excluded.length) rules.push(`STRICTLY exclude from all meals: ${excluded.join(", ")}.`);

  // Food preferences
  const preferred = params.foodPreferences.filter((p) => p !== "none");
  if (preferred.length) rules.push(`Preferred foods to incorporate: ${preferred.join(", ")}.`);

  // ── Build inline meal schema template ────────────────────────────────────
  const mealSchemaLines = mealSlots.map((s, i) => {
    const line = `{ "type": "${s.type}", "name": "...", "calories": ${s.cal}, "description": "One sentence.", "ingredients": ["item1","item2","item3","item4"], "macros": { "protein": ${s.proteinG}, "carbs": ${s.carbsG}, "fats": ${s.fatsG}, "sodium": ${s.sodiumMg} }, "prepTime": "...", "recipe": "Preparation sentence. Serving sentence." }`;
    return i === 0 ? line : `        ${line}`;
  }).join(",\n        ");

  return `You are a certified DASH diet nutritionist. Generate a personalized 7-day DASH diet plan as a single valid JSON object.

USER PROFILE:
- ${params.gender}, age ${params.age}, ${params.height}cm, ${params.weight}kg → target ${params.targetWeight}kg
- BMI ${params.bmi} (${params.bmiCategory}), primary goal: ${GOAL_LABELS[params.goal] || params.goal}
- Activity: ${ACTIVITY_LABELS[params.activityLevel] || params.activityLevel}, exercise: ${params.exerciseFrequency.replace(/_/g, " ")}/week
- Daily calorie target: ${params.dailyCalories} kcal

PERSONALIZATION RULES (apply strictly to every meal and exercise choice):
${rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

DASH DIET RULES: sodium <2000mg/day overall, rich in fruits/vegetables/whole grains/lean proteins/low-fat dairy/nuts.

STRICT OUTPUT RULES:
1. Return ONLY the JSON object — no markdown, no code fences, no explanations before or after.
2. Every string value must be under 120 characters.
3. Each meal has exactly 4–6 ingredients (plain strings, no measurements in the array key — measurements go inside the string).
4. "recipe" is exactly 2 sentences: one preparation sentence, one serving sentence.
5. The JSON must be 100% complete and syntactically valid — do not truncate.

Return this exact JSON structure populated for all 7 days:
{
  "mealPlan": [
    {
      "day": "Monday",
      "meals": [
        ${mealSchemaLines}
      ]
    }
  ],
  "exercisePlan": [
    {
      "day": "Monday",
      "exercises": [
        { "name": "Brisk Walk", "duration": "30 min", "intensity": "moderate", "instructions": "Walk at a steady pace maintaining rhythmic breathing.", "caloriesBurned": 150 }
      ]
    }
  ],
  "weeklyShoppingList": {
    "produce": [{ "item": "Spinach", "quantity": "1 bag" }],
    "proteins": [{ "item": "Chicken breast", "quantity": "2 lbs" }],
    "grains": [{ "item": "Brown rice", "quantity": "2 cups dry" }],
    "dairy": [{ "item": "Low-fat Greek yogurt", "quantity": "32 oz" }],
    "pantry": [{ "item": "Olive oil", "quantity": "1 bottle" }],
    "other": [{ "item": "Mixed nuts", "quantity": "1 bag" }]
  },
  "foodCombinations": [
    { "name": "Iron Boost", "foods": ["Spinach", "Lemon juice"], "benefit": "Vitamin C triples iron absorption from leafy greens.", "bestTime": "lunch" },
    { "name": "Heart Protector", "foods": ["Salmon", "Olive oil"], "benefit": "Omega-3s and healthy fats maximise cardiovascular support.", "bestTime": "dinner" },
    { "name": "BP Reducer", "foods": ["Banana", "Sweet potato"], "benefit": "High potassium foods naturally help lower blood pressure.", "bestTime": "any meal" },
    { "name": "Energy Sustainer", "foods": ["Oats", "Berries"], "benefit": "Complex carbs with antioxidants provide lasting energy.", "bestTime": "breakfast" }
  ],
  "progressTracking": {
    "weeklyGoals": [
      { "goal": "Drink 8 glasses of water daily", "tracked": false },
      { "goal": "Exercise at least 3 times this week", "tracked": false },
      { "goal": "Limit sodium to under 2000mg daily", "tracked": false },
      { "goal": "Eat 5+ servings of fruits/vegetables daily", "tracked": false }
    ],
    "measurements": { "weight": null, "waist": null, "bloodPressure": null, "energy": null },
    "milestones": [
      { "week": 1, "target": "Complete all planned meals", "achieved": false },
      { "week": 2, "target": "Hit all exercise sessions", "achieved": false },
      { "week": 4, "target": "Notice improved energy levels", "achieved": false },
      { "week": 8, "target": "Measurable blood pressure improvement", "achieved": false }
    ]
  },
  "tips": [
    "Limit sodium to 1500–2000mg/day; use herbs and spices instead of salt.",
    "Aim for 4–5 servings each of fruits and vegetables daily.",
    "Choose whole grains over refined: oats, brown rice, whole wheat bread.",
    "Drink 8 glasses of water daily to support metabolism and blood pressure.",
    "Meal prep on Sundays to stay consistent throughout the week."
  ],
  "summary": "2–3 sentence personalised summary mentioning the user's goal, calorie target, meal structure, and realistic timeline."
}

Generate all 7 days (Monday–Sunday) in mealPlan and exercisePlan. Vary meals — no meal name repeated across the week. Apply all personalization rules above to every single day.`;
}

interface FallbackParams {
  dailyCalories: number;
  allergies: string[];
  foodPreferences: string[];
  foodsToAvoid: string[];
  exerciseFrequency: string;
  cookingSkill: string;
  bmi: number;
  bmiCategory: string;
  targetWeight: number;
  weight: number;
}

function generateComprehensiveFallbackPlan(params: FallbackParams) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const breakfastCalories = Math.round(params.dailyCalories * 0.25);
  const lunchCalories = Math.round(params.dailyCalories * 0.35);
  const dinnerCalories = Math.round(params.dailyCalories * 0.3);
  const snackCalories = Math.round(params.dailyCalories * 0.1);

  const breakfasts = [
    {
      name: "Oatmeal with Berries & Walnuts",
      description:
        "Steel-cut oats topped with mixed berries, crushed walnuts, and a drizzle of honey",
      ingredients: ["Steel-cut oats", "Mixed berries", "Walnuts", "Honey", "Cinnamon"],
      macros: { protein: 12, carbs: 45, fats: 18, sodium: 150 },
      prepTime: "15 min",
      recipe: "1. Cook oats according to package. 2. Top with berries and walnuts. 3. Drizzle honey and sprinkle cinnamon.",
    },
    {
      name: "Greek Yogurt Parfait",
      description:
        "Low-fat Greek yogurt layered with granola, banana slices, and chia seeds",
      ingredients: ["Greek yogurt", "Granola", "Banana", "Chia seeds", "Honey"],
      macros: { protein: 20, carbs: 40, fats: 12, sodium: 180 },
      prepTime: "10 min",
      recipe: "1. Layer yogurt with granola. 2. Add banana slices. 3. Top with chia seeds and honey.",
    },
    {
      name: "Veggie Egg White Omelette",
      description:
        "Egg whites with spinach, tomatoes, and bell peppers, served with whole wheat toast",
      ingredients: ["Egg whites", "Spinach", "Tomatoes", "Bell peppers", "Whole wheat bread"],
      macros: { protein: 22, carbs: 35, fats: 8, sodium: 320 },
      prepTime: "20 min",
      recipe: "1. Sauté vegetables. 2. Pour egg whites and cook. 3. Serve with toasted bread.",
    },
    {
      name: "Banana Almond Smoothie",
      description:
        "Banana, almond butter, spinach, low-fat milk blended with ice",
      ingredients: ["Banana", "Almond butter", "Spinach", "Low-fat milk", "Ice"],
      macros: { protein: 15, carbs: 42, fats: 14, sodium: 200 },
      prepTime: "5 min",
      recipe: "1. Blend all ingredients until smooth. 2. Serve immediately.",
    },
    {
      name: "Whole Grain Avocado Toast",
      description:
        "Whole wheat bread topped with mashed avocado, cherry tomatoes, and seeds",
      ingredients: ["Whole wheat bread", "Avocado", "Cherry tomatoes", "Pumpkin seeds", "Lemon"],
      macros: { protein: 10, carbs: 38, fats: 20, sodium: 280 },
      prepTime: "10 min",
      recipe: "1. Toast bread. 2. Mash avocado with lemon. 3. Top with tomatoes and seeds.",
    },
    {
      name: "Fruit & Cottage Cheese Bowl",
      description:
        "Low-fat cottage cheese with fresh peaches, flaxseeds, and a touch of cinnamon",
      ingredients: ["Cottage cheese", "Peaches", "Flaxseeds", "Cinnamon", "Honey"],
      macros: { protein: 24, carbs: 32, fats: 10, sodium: 450 },
      prepTime: "8 min",
      recipe: "1. Place cottage cheese in bowl. 2. Add sliced peaches. 3. Sprinkle flaxseeds and cinnamon.",
    },
    {
      name: "Multigrain Pancakes",
      description:
        "Whole grain pancakes with fresh strawberries and a light maple drizzle",
      ingredients: ["Whole grain flour", "Egg", "Milk", "Strawberries", "Maple syrup"],
      macros: { protein: 14, carbs: 50, fats: 12, sodium: 220 },
      prepTime: "25 min",
      recipe: "1. Mix pancake batter. 2. Cook on griddle. 3. Top with strawberries and syrup.",
    },
  ];

  const lunches = [
    {
      name: "Grilled Chicken Salad",
      description:
        "Mixed greens with grilled chicken breast, chickpeas, cucumber, and lemon vinaigrette",
      ingredients: ["Chicken breast", "Mixed greens", "Chickpeas", "Cucumber", "Lemon", "Olive oil"],
      macros: { protein: 35, carbs: 42, fats: 18, sodium: 380 },
      prepTime: "30 min",
      recipe: "1. Grill chicken. 2. Toss greens with chickpeas and cucumber. 3. Top with chicken and vinaigrette.",
    },
    {
      name: "Turkey & Avocado Wrap",
      description:
        "Whole wheat wrap with lean turkey, avocado, mixed greens, and hummus",
      ingredients: ["Whole wheat tortilla", "Turkey breast", "Avocado", "Mixed greens", "Hummus"],
      macros: { protein: 30, carbs: 45, fats: 22, sodium: 420 },
      prepTime: "15 min",
      recipe: "1. Spread hummus on tortilla. 2. Layer turkey, avocado, and greens. 3. Roll tightly.",
    },
    {
      name: "Quinoa & Black Bean Bowl",
      description:
        "Quinoa with black beans, corn, tomatoes, cilantro, and lime dressing",
      ingredients: ["Quinoa", "Black beans", "Corn", "Tomatoes", "Cilantro", "Lime"],
      macros: { protein: 18, carbs: 58, fats: 12, sodium: 340 },
      prepTime: "25 min",
      recipe: "1. Cook quinoa. 2. Mix with beans, corn, and tomatoes. 3. Dress with lime and cilantro.",
    },
    {
      name: "Salmon Poke Bowl",
      description:
        "Brown rice with fresh salmon, edamame, cucumber, and sesame dressing",
      ingredients: ["Salmon", "Brown rice", "Edamame", "Cucumber", "Sesame seeds", "Soy sauce"],
      macros: { protein: 32, carbs: 48, fats: 20, sodium: 520 },
      prepTime: "35 min",
      recipe: "1. Cook rice. 2. Cube salmon. 3. Assemble bowl with vegetables and dressing.",
    },
    {
      name: "Mediterranean Lentil Soup",
      description:
        "Hearty lentil soup with carrots, celery, tomatoes, and herbs, with whole grain bread",
      ingredients: ["Lentils", "Carrots", "Celery", "Tomatoes", "Garlic", "Whole grain bread"],
      macros: { protein: 20, carbs: 62, fats: 8, sodium: 480 },
      prepTime: "40 min",
      recipe: "1. Sauté vegetables. 2. Add lentils and broth. 3. Simmer until tender. 4. Serve with bread.",
    },
    {
      name: "Chicken & Vegetable Stir-Fry",
      description:
        "Lean chicken with broccoli, snap peas, and brown rice in ginger sauce",
      ingredients: ["Chicken breast", "Broccoli", "Snap peas", "Brown rice", "Ginger", "Garlic"],
      macros: { protein: 34, carbs: 50, fats: 14, sodium: 460 },
      prepTime: "30 min",
      recipe: "1. Cook rice. 2. Stir-fry chicken and vegetables. 3. Add ginger sauce and serve over rice.",
    },
    {
      name: "Tuna & White Bean Salad",
      description:
        "Light tuna mixed with white beans, arugula, cherry tomatoes, and olive oil",
      ingredients: ["Tuna", "White beans", "Arugula", "Cherry tomatoes", "Olive oil", "Lemon"],
      macros: { protein: 28, carbs: 40, fats: 16, sodium: 400 },
      prepTime: "15 min",
      recipe: "1. Mix tuna with beans. 2. Toss with arugula and tomatoes. 3. Dress with olive oil and lemon.",
    },
  ];

  const dinners = [
    {
      name: "Baked Salmon with Roasted Vegetables",
      description:
        "Herb-crusted salmon fillet with roasted sweet potatoes, asparagus, and lemon",
      ingredients: ["Salmon", "Sweet potatoes", "Asparagus", "Lemon", "Herbs", "Olive oil"],
      macros: { protein: 36, carbs: 42, fats: 22, sodium: 320 },
      prepTime: "45 min",
      recipe: "1. Season salmon with herbs. 2. Roast vegetables. 3. Bake salmon at 400°F for 15 min.",
    },
    {
      name: "Chicken Breast with Quinoa",
      description:
        "Grilled chicken breast with herbed quinoa and steamed broccoli",
      ingredients: ["Chicken breast", "Quinoa", "Broccoli", "Herbs", "Garlic", "Lemon"],
      macros: { protein: 38, carbs: 45, fats: 15, sodium: 290 },
      prepTime: "40 min",
      recipe: "1. Grill chicken. 2. Cook quinoa with herbs. 3. Steam broccoli. 4. Serve together.",
    },
    {
      name: "Turkey Meatballs & Whole Wheat Pasta",
      description:
        "Lean turkey meatballs in marinara sauce over whole wheat spaghetti with side salad",
      ingredients: ["Ground turkey", "Whole wheat pasta", "Marinara sauce", "Mixed greens", "Parmesan"],
      macros: { protein: 32, carbs: 55, fats: 18, sodium: 540 },
      prepTime: "50 min",
      recipe: "1. Form and bake meatballs. 2. Cook pasta. 3. Simmer meatballs in sauce. 4. Serve with salad.",
    },
    {
      name: "Grilled Shrimp Tacos",
      description:
        "Corn tortillas with grilled shrimp, cabbage slaw, and Greek yogurt sauce",
      ingredients: ["Shrimp", "Corn tortillas", "Cabbage", "Greek yogurt", "Lime", "Cilantro"],
      macros: { protein: 30, carbs: 48, fats: 14, sodium: 420 },
      prepTime: "30 min",
      recipe: "1. Season and grill shrimp. 2. Make slaw. 3. Warm tortillas. 4. Assemble tacos.",
    },
    {
      name: "Stuffed Bell Peppers",
      description:
        "Bell peppers stuffed with brown rice, lean ground turkey, and vegetables",
      ingredients: ["Bell peppers", "Ground turkey", "Brown rice", "Tomatoes", "Onions", "Cheese"],
      macros: { protein: 28, carbs: 50, fats: 16, sodium: 380 },
      prepTime: "60 min",
      recipe: "1. Cook rice and turkey mixture. 2. Stuff peppers. 3. Bake at 375°F for 30 min.",
    },
    {
      name: "Baked Cod with Sweet Potato",
      description:
        "Baked cod with mashed sweet potato, steamed green beans, and lemon herb sauce",
      ingredients: ["Cod", "Sweet potato", "Green beans", "Lemon", "Herbs", "Butter"],
      macros: { protein: 34, carbs: 46, fats: 12, sodium: 310 },
      prepTime: "45 min",
      recipe: "1. Bake cod. 2. Mash sweet potatoes. 3. Steam green beans. 4. Make lemon herb sauce.",
    },
    {
      name: "Chicken & Vegetable Curry",
      description:
        "Light coconut curry with chicken, spinach, and vegetables over brown rice",
      ingredients: ["Chicken", "Coconut milk", "Spinach", "Curry spices", "Brown rice", "Vegetables"],
      macros: { protein: 32, carbs: 52, fats: 20, sodium: 450 },
      prepTime: "40 min",
      recipe: "1. Cook rice. 2. Sauté chicken and vegetables. 3. Add curry and coconut milk. 4. Simmer.",
    },
  ];

  const snacks = [
    {
      name: "Apple with Almond Butter",
      description: "Fresh apple slices with 1 tbsp natural almond butter",
      ingredients: ["Apple", "Almond butter"],
      macros: { protein: 4, carbs: 20, fats: 9, sodium: 50 },
      prepTime: "2 min",
      recipe: "1. Slice apple. 2. Serve with almond butter for dipping.",
    },
    {
      name: "Mixed Nuts & Dried Fruit",
      description: "Small handful of unsalted mixed nuts with dried cranberries",
      ingredients: ["Mixed nuts", "Dried cranberries"],
      macros: { protein: 6, carbs: 18, fats: 12, sodium: 25 },
      prepTime: "1 min",
      recipe: "1. Mix nuts and dried fruit in a small container.",
    },
    {
      name: "Veggie Sticks & Hummus",
      description: "Carrot and celery sticks with 2 tbsp hummus",
      ingredients: ["Carrots", "Celery", "Hummus"],
      macros: { protein: 3, carbs: 16, fats: 6, sodium: 180 },
      prepTime: "5 min",
      recipe: "1. Cut vegetables into sticks. 2. Serve with hummus.",
    },
    {
      name: "Greek Yogurt & Berries",
      description: "Low-fat Greek yogurt with a handful of blueberries",
      ingredients: ["Greek yogurt", "Blueberries"],
      macros: { protein: 12, carbs: 18, fats: 4, sodium: 80 },
      prepTime: "2 min",
      recipe: "1. Top yogurt with fresh blueberries.",
    },
    {
      name: "Rice Cakes with Avocado",
      description: "2 rice cakes topped with mashed avocado and cherry tomatoes",
      ingredients: ["Rice cakes", "Avocado", "Cherry tomatoes"],
      macros: { protein: 4, carbs: 22, fats: 10, sodium: 90 },
      prepTime: "5 min",
      recipe: "1. Mash avocado. 2. Spread on rice cakes. 3. Top with sliced tomatoes.",
    },
    {
      name: "Trail Mix",
      description: "Unsalted almonds, pumpkin seeds, and dark chocolate chips",
      ingredients: ["Almonds", "Pumpkin seeds", "Dark chocolate chips"],
      macros: { protein: 7, carbs: 15, fats: 14, sodium: 30 },
      prepTime: "1 min",
      recipe: "1. Mix ingredients in a small container.",
    },
    {
      name: "Banana with Peanut Butter",
      description: "Banana with 1 tbsp natural peanut butter",
      ingredients: ["Banana", "Peanut butter"],
      macros: { protein: 5, carbs: 25, fats: 8, sodium: 60 },
      prepTime: "2 min",
      recipe: "1. Slice banana. 2. Serve with peanut butter for dipping.",
    },
  ];

  const mealPlan = days.map((day, i) => ({
    day,
    meals: [
      { type: "Breakfast", ...breakfasts[i], calories: breakfastCalories },
      { type: "Lunch", ...lunches[i], calories: lunchCalories },
      { type: "Dinner", ...dinners[i], calories: dinnerCalories },
      { type: "Snack", ...snacks[i], calories: snackCalories },
    ],
  }));

  const isLightExercise =
    params.exerciseFrequency === "never" ||
    params.exerciseFrequency === "1_2_week";

  const exercisePlan = days.map((day, i) => {
    if (i === 6 || (isLightExercise && (i === 2 || i === 4))) {
      return { day, exercises: [], restDay: true };
    }
    const exercises = [
      [
        {
          name: "Brisk Walking",
          duration: "30 min",
          intensity: "moderate",
          instructions: "Walk at a pace where you can talk but not sing. Maintain good posture.",
          caloriesBurned: 150,
        },
        {
          name: "Bodyweight Squats",
          duration: "10 min",
          intensity: "moderate",
          instructions: "Stand with feet shoulder-width apart. Lower down as if sitting, then rise. 3 sets of 12 reps.",
          caloriesBurned: 80,
        },
      ],
      [
        {
          name: "Light Jogging",
          duration: "20 min",
          intensity: "moderate",
          instructions: "Jog at a comfortable pace. Focus on breathing rhythmically.",
          caloriesBurned: 180,
        },
        {
          name: "Push-ups & Planks",
          duration: "15 min",
          intensity: "moderate",
          instructions: "3 sets of 10 push-ups, followed by 3 30-second planks. Rest between sets.",
          caloriesBurned: 100,
        },
      ],
      [
        {
          name: "Yoga / Stretching",
          duration: "30 min",
          intensity: "light",
          instructions: "Focus on flexibility and relaxation. Hold each stretch for 20-30 seconds.",
          caloriesBurned: 90,
        },
      ],
      [
        {
          name: "Cycling",
          duration: "25 min",
          intensity: "moderate",
          instructions: "Cycle at a steady pace. Keep resistance moderate.",
          caloriesBurned: 200,
        },
        {
          name: "Core Exercises",
          duration: "10 min",
          intensity: "moderate",
          instructions: "Crunches, bicycle crunches, and leg raises. 3 sets of 15 reps each.",
          caloriesBurned: 70,
        },
      ],
      [
        {
          name: "Swimming or Walking",
          duration: "30 min",
          intensity: "moderate",
          instructions: "Swim laps or walk briskly. Maintain consistent pace throughout.",
          caloriesBurned: 250,
        },
      ],
      [
        {
          name: "HIIT Circuit",
          duration: "20 min",
          intensity: "high",
          instructions: "Alternate 30 sec high-intensity (jumping jacks, burpees) with 30 sec rest. Repeat 10 times.",
          caloriesBurned: 220,
        },
        {
          name: "Cool-down Stretch",
          duration: "10 min",
          intensity: "light",
          instructions: "Gentle stretching to cool down. Focus on muscles worked during HIIT.",
          caloriesBurned: 40,
        },
      ],
    ];
    return { day, exercises: exercises[i % exercises.length] };
  });

  // Generate comprehensive shopping list
  const weeklyShoppingList = {
    produce: [
      { item: "Spinach", quantity: "2 bunches" },
      { item: "Mixed berries", quantity: "2 pints" },
      { item: "Bananas", quantity: "6" },
      { item: "Apples", quantity: "4" },
      { item: "Avocados", quantity: "4" },
      { item: "Tomatoes", quantity: "8" },
      { item: "Cherry tomatoes", quantity: "2 pints" },
      { item: "Bell peppers", quantity: "6" },
      { item: "Broccoli", quantity: "2 heads" },
      { item: "Asparagus", quantity: "1 bunch" },
      { item: "Sweet potatoes", quantity: "4 large" },
      { item: "Carrots", quantity: "1 lb" },
      { item: "Celery", quantity: "1 bunch" },
      { item: "Cucumber", quantity: "3" },
      { item: "Mixed greens", quantity: "2 bags" },
      { item: "Arugula", quantity: "1 container" },
      { item: "Cilantro", quantity: "1 bunch" },
      { item: "Garlic", quantity: "2 bulbs" },
      { item: "Ginger", quantity: "1 piece" },
      { item: "Lemon", quantity: "6" },
      { item: "Lime", quantity: "4" },
    ],
    proteins: [
      { item: "Chicken breast", quantity: "3 lbs" },
      { item: "Salmon fillets", quantity: "1.5 lbs" },
      { item: "Cod fillets", quantity: "1 lb" },
      { item: "Shrimp", quantity: "1 lb" },
      { item: "Ground turkey", quantity: "2 lbs" },
      { item: "Tuna (canned, low sodium)", quantity: "2 cans" },
      { item: "Eggs", quantity: "1 dozen" },
      { item: "Egg whites", quantity: "1 carton" },
    ],
    grains: [
      { item: "Steel-cut oats", quantity: "1 container" },
      { item: "Quinoa", quantity: "2 cups dry" },
      { item: "Brown rice", quantity: "3 cups dry" },
      { item: "Whole wheat bread", quantity: "1 loaf" },
      { item: "Whole wheat tortillas", quantity: "1 package" },
      { item: "Corn tortillas", quantity: "1 package" },
      { item: "Whole wheat pasta", quantity: "1 box" },
      { item: "Rice cakes", quantity: "1 package" },
    ],
    dairy: [
      { item: "Low-fat Greek yogurt", quantity: "32 oz container" },
      { item: "Low-fat cottage cheese", quantity: "1 container" },
      { item: "Low-fat milk", quantity: "1/2 gallon" },
      { item: "Parmesan cheese", quantity: "1 small block" },
    ],
    pantry: [
      { item: "Almond butter", quantity: "1 jar" },
      { item: "Peanut butter", quantity: "1 jar" },
      { item: "Hummus", quantity: "2 containers" },
      { item: "Olive oil", quantity: "1 bottle" },
      { item: "Coconut oil", quantity: "1 jar" },
      { item: "Honey", quantity: "1 bottle" },
      { item: "Maple syrup", quantity: "1 bottle" },
      { item: "Low-sodium soy sauce", quantity: "1 bottle" },
      { item: "Marinara sauce", quantity: "1 jar" },
      { item: "Black beans (canned)", quantity: "2 cans" },
      { item: "White beans (canned)", quantity: "2 cans" },
      { item: "Chickpeas (canned)", quantity: "2 cans" },
      { item: "Lentils (dried)", quantity: "1 bag" },
      { item: "Mixed nuts", quantity: "1 container" },
      { item: "Walnuts", quantity: "8 oz" },
      { item: "Almonds", quantity: "8 oz" },
      { item: "Pumpkin seeds", quantity: "4 oz" },
      { item: "Chia seeds", quantity: "1 bag" },
      { item: "Flaxseeds", quantity: "1 bag" },
      { item: "Dark chocolate chips", quantity: "1 bag" },
      { item: "Dried cranberries", quantity: "1 bag" },
    ],
    other: [
      { item: "Herbs & spices", quantity: "as needed" },
      { item: "Low-sodium chicken broth", quantity: "2 cartons" },
      { item: "Curry paste or powder", quantity: "1 container" },
      { item: "Coconut milk (light)", quantity: "1 can" },
      { item: "Granola", quantity: "1 bag" },
    ],
  };

  const foodCombinations = [
    {
      name: "Iron Boost",
      foods: ["Spinach", "Lemon juice", "Chickpeas"],
      benefit:
        "Vitamin C from lemon enhances iron absorption from spinach and chickpeas by up to 300%",
      bestTime: "lunch",
    },
    {
      name: "Heart Protector",
      foods: ["Salmon", "Garlic", "Olive oil"],
      benefit:
        "Omega-3s combined with allicin and healthy fats for maximum cardiovascular support",
      bestTime: "dinner",
    },
    {
      name: "Bone Builder",
      foods: ["Low-fat yogurt", "Almonds", "Figs"],
      benefit:
        "Calcium and magnesium combination supports strong bones and muscles",
      bestTime: "breakfast",
    },
    {
      name: "BP Reducer",
      foods: ["Banana", "Sweet potato", "White beans"],
      benefit:
        "Potassium-rich trio that naturally helps lower blood pressure within weeks",
      bestTime: "any meal",
    },
    {
      name: "Anti-Inflammatory",
      foods: ["Turmeric", "Black pepper", "Ginger"],
      benefit:
        "Piperine in black pepper increases curcumin absorption by 2000%",
      bestTime: "lunch/dinner",
    },
    {
      name: "Energy Sustainer",
      foods: ["Oats", "Walnuts", "Berries"],
      benefit:
        "Complex carbs with omega-3s and antioxidants provide sustained energy",
      bestTime: "breakfast",
    },
  ];

  const progressTracking = {
    weeklyGoals: [
      { goal: "Drink 8 glasses of water daily", tracked: false },
      { goal: "Exercise at least 3 times this week", tracked: false },
      { goal: "Complete all meal prep on Sunday", tracked: false },
      { goal: "Limit sodium to under 2000mg daily", tracked: false },
      { goal: "Eat at least 5 servings of fruits/vegetables daily", tracked: false },
      { goal: "Get 7-8 hours of sleep each night", tracked: false },
    ],
    measurements: {
      weight: null,
      waist: null,
      bloodPressure: { systolic: null, diastolic: null },
      energyLevel: null,
      sleepQuality: null,
    },
    milestones: [
      { week: 1, target: "Complete all meals as planned", achieved: false },
      { week: 2, target: "Hit all exercise goals", achieved: false },
      { week: 3, target: "Lose 1-2 lbs (if weight loss goal)", achieved: false },
      { week: 4, target: "Notice improved energy levels", achieved: false },
      { week: 8, target: "Reduce blood pressure by 5-10 points", achieved: false },
      { week: 12, target: "Reach 75% of target weight (if applicable)", achieved: false },
    ],
    dailyChecklist: {
      waterIntake: Array(7).fill(false),
      mealsCompleted: Array(7).fill(false),
      exerciseCompleted: Array(7).fill(false),
      sleepQuality: Array(7).fill(null),
    },
  };

  const tips = [
    "Aim for 4-5 servings of fruits and 4-5 servings of vegetables daily for maximum DASH benefits",
    "Choose whole grains over refined grains for 6-8 daily servings to support heart health",
    "Limit sodium to 1,500mg per day — use herbs and spices instead of salt for flavor",
    "Include 2-3 servings of low-fat dairy products daily for calcium and vitamin D",
    "Eat nuts, seeds, or legumes 4-5 times per week for healthy fats and protein",
    "Limit added sugars to less than 5 servings per week to maintain healthy blood sugar",
    "Drink at least 8 glasses of water daily to support metabolism and blood pressure",
    "Prepare meals at home to control sodium and portion sizes more effectively",
    "Meal prep on Sundays to set yourself up for success throughout the week",
    "Read nutrition labels carefully — aim for less than 140mg sodium per serving",
  ];

  const weightToLose = params.weight - params.targetWeight;
  const weeksToGoal = Math.ceil(weightToLose / 0.5); // Assuming 0.5kg per week healthy loss

  return {
    mealPlan,
    exercisePlan,
    weeklyShoppingList,
    foodCombinations,
    progressTracking,
    tips,
    summary: `Your personalized DASH diet plan is designed for a daily intake of ${params.dailyCalories} calories to help you achieve your goals. With your current BMI of ${params.bmi} (${params.bmiCategory}), this plan emphasizes nutrient-dense fruits, vegetables, whole grains, and lean proteins while limiting sodium to 1,500-2,300mg daily. Combined with your customized exercise routine, you can expect improvements in blood pressure, energy levels, and overall health. ${weightToLose > 0 ? `Based on your target weight, you could reach your goal in approximately ${weeksToGoal} weeks with consistent adherence.` : "Focus on maintaining your healthy weight while building strength and cardiovascular health."}`,
  };
}
