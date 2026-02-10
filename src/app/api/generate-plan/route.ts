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
    const { answers, email } = body as {
      answers: QuizAnswers;
      email?: string;
    };

    // Extract key data from answers
    const gender = (answers.gender as string) || "male";
    const age = (answers.age as number) || 30;
    const height = (answers.height as number) || 170;
    const weight = (answers.current_weight as number) || 80;
    const targetWeight = (answers.target_weight as number) || 70;
    const activityLevel = (answers.activity_level as string) || "light";
    const goal = (answers.goal as string) || "eat_healthier";
    const allergies = (answers.allergies as string[]) || [];
    const foodPreferences = (answers.food_preferences as string[]) || [];
    const foodsToAvoid = (answers.foods_to_avoid as string[]) || [];
    const healthConditions = (answers.health_conditions as string[]) || [];
    const cookingSkill = (answers.cooking_skill as string) || "intermediate";
    const exerciseFrequency =
      (answers.exercise_frequency as string) || "1_2_week";

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

    // Build the AI prompt
    const prompt = buildPrompt({
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
    });

    let aiPlan = null;

    // Try Gemini API if key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction =
          "You are a certified nutritionist specializing in the DASH diet. Generate personalized meal plans and exercise routines. Respond in JSON format only.";

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 3000,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const textContent = data.candidates[0].content.parts[0].text;
          aiPlan = JSON.parse(textContent);
        }
      } catch (err) {
        console.error("Gemini API error:", err);
      }
    }

    // Fallback: generate a default DASH plan
    if (!aiPlan) {
      aiPlan = generateFallbackPlan({
        dailyCalories,
        allergies,
        foodPreferences,
        foodsToAvoid,
        exerciseFrequency,
        cookingSkill,
      });
    }

    // Store in Supabase if available
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      try {
        const supabase = createServiceClient();
        const { error: dbErr } = await supabase.from("quiz_results").insert({
          email: email || null,
          answers,
          bmi,
          daily_calories: dailyCalories,
          plan: { ...aiPlan, bmiCategory },
          created_at: new Date().toISOString(),
        });
        if (dbErr) {
          console.error("Supabase quiz_results insert failed:", dbErr.message);
        }
      } catch (err) {
        console.error("Supabase storage error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      plan: {
        bmi,
        bmiCategory,
        dailyCalories,
        ...aiPlan,
      },
    });
  } catch (error) {
    console.error("Generate plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
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
}

function buildPrompt(params: PromptParams): string {
  return `Create a personalized 7-day DASH diet plan for this person:

Profile:
- Gender: ${params.gender}, Age: ${params.age}
- Height: ${params.height}cm, Weight: ${params.weight}kg, Target: ${params.targetWeight}kg
- BMI: ${params.bmi} (${params.bmiCategory})
- Daily calorie target: ${params.dailyCalories} kcal
- Activity level: ${params.activityLevel}
- Primary goal: ${params.goal}
- Cooking skill: ${params.cookingSkill}
- Exercise frequency: ${params.exerciseFrequency}
- Allergies: ${params.allergies.filter((a) => a !== "none").join(", ") || "None"}
- Preferred foods: ${params.foodPreferences.join(", ") || "No preference"}
- Foods to avoid: ${params.foodsToAvoid.filter((a) => a !== "none").join(", ") || "None"}
- Health conditions: ${params.healthConditions.filter((a) => a !== "none").join(", ") || "None"}

DASH Diet Requirements:
- Low sodium (1500-2300mg/day)
- Rich in fruits, vegetables, whole grains
- Lean proteins, low-fat dairy
- Nuts, seeds, and legumes
- Limited saturated fat, red meat, sweets

Return JSON with this structure:
{
  "mealPlan": [
    {
      "day": "Monday",
      "meals": [
        { "type": "Breakfast", "name": "...", "calories": 400, "description": "..." },
        { "type": "Lunch", "name": "...", "calories": 500, "description": "..." },
        { "type": "Dinner", "name": "...", "calories": 500, "description": "..." },
        { "type": "Snack", "name": "...", "calories": 200, "description": "..." }
      ]
    }
  ],
  "exercisePlan": [
    {
      "day": "Monday",
      "exercises": [
        { "name": "...", "duration": "30 min", "intensity": "moderate" }
      ]
    }
  ],
  "foodCombinations": [
    { "name": "...", "foods": ["food1", "food2"], "benefit": "..." }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "summary": "A brief personalized summary of the plan"
}`;
}

interface FallbackParams {
  dailyCalories: number;
  allergies: string[];
  foodPreferences: string[];
  foodsToAvoid: string[];
  exerciseFrequency: string;
  cookingSkill: string;
}

function generateFallbackPlan(params: FallbackParams) {
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
    },
    {
      name: "Greek Yogurt Parfait",
      description:
        "Low-fat Greek yogurt layered with granola, banana slices, and chia seeds",
    },
    {
      name: "Veggie Egg White Omelette",
      description:
        "Egg whites with spinach, tomatoes, and bell peppers, served with whole wheat toast",
    },
    {
      name: "Banana Almond Smoothie",
      description:
        "Banana, almond butter, spinach, low-fat milk blended with ice",
    },
    {
      name: "Whole Grain Avocado Toast",
      description:
        "Whole wheat bread topped with mashed avocado, cherry tomatoes, and seeds",
    },
    {
      name: "Fruit & Cottage Cheese Bowl",
      description:
        "Low-fat cottage cheese with fresh peaches, flaxseeds, and a touch of cinnamon",
    },
    {
      name: "Multigrain Pancakes",
      description:
        "Whole grain pancakes with fresh strawberries and a light maple drizzle",
    },
  ];

  const lunches = [
    {
      name: "Grilled Chicken Salad",
      description:
        "Mixed greens with grilled chicken breast, chickpeas, cucumber, and lemon vinaigrette",
    },
    {
      name: "Turkey & Avocado Wrap",
      description:
        "Whole wheat wrap with lean turkey, avocado, mixed greens, and hummus",
    },
    {
      name: "Quinoa & Black Bean Bowl",
      description:
        "Quinoa with black beans, corn, tomatoes, cilantro, and lime dressing",
    },
    {
      name: "Salmon Poke Bowl",
      description:
        "Brown rice with fresh salmon, edamame, cucumber, and sesame dressing",
    },
    {
      name: "Mediterranean Lentil Soup",
      description:
        "Hearty lentil soup with carrots, celery, tomatoes, and herbs, with whole grain bread",
    },
    {
      name: "Chicken & Vegetable Stir-Fry",
      description:
        "Lean chicken with broccoli, snap peas, and brown rice in ginger sauce",
    },
    {
      name: "Tuna & White Bean Salad",
      description:
        "Light tuna mixed with white beans, arugula, cherry tomatoes, and olive oil",
    },
  ];

  const dinners = [
    {
      name: "Baked Salmon with Roasted Vegetables",
      description:
        "Herb-crusted salmon fillet with roasted sweet potatoes, asparagus, and lemon",
    },
    {
      name: "Chicken Breast with Quinoa",
      description:
        "Grilled chicken breast with herbed quinoa and steamed broccoli",
    },
    {
      name: "Turkey Meatballs & Whole Wheat Pasta",
      description:
        "Lean turkey meatballs in marinara sauce over whole wheat spaghetti with side salad",
    },
    {
      name: "Grilled Shrimp Tacos",
      description:
        "Corn tortillas with grilled shrimp, cabbage slaw, and Greek yogurt sauce",
    },
    {
      name: "Stuffed Bell Peppers",
      description:
        "Bell peppers stuffed with brown rice, lean ground turkey, and vegetables",
    },
    {
      name: "Baked Cod with Sweet Potato",
      description:
        "Baked cod with mashed sweet potato, steamed green beans, and lemon herb sauce",
    },
    {
      name: "Chicken & Vegetable Curry",
      description:
        "Light coconut curry with chicken, spinach, and vegetables over brown rice",
    },
  ];

  const snacks = [
    { name: "Apple with Almond Butter", description: "Fresh apple slices with 1 tbsp natural almond butter" },
    { name: "Mixed Nuts & Dried Fruit", description: "Small handful of unsalted mixed nuts with dried cranberries" },
    { name: "Veggie Sticks & Hummus", description: "Carrot and celery sticks with 2 tbsp hummus" },
    { name: "Greek Yogurt & Berries", description: "Low-fat Greek yogurt with a handful of blueberries" },
    { name: "Rice Cakes with Avocado", description: "2 rice cakes topped with mashed avocado and cherry tomatoes" },
    { name: "Trail Mix", description: "Unsalted almonds, pumpkin seeds, and dark chocolate chips" },
    { name: "Banana with Peanut Butter", description: "Banana with 1 tbsp natural peanut butter" },
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
        { name: "Brisk Walking", duration: "30 min", intensity: "moderate" },
        { name: "Bodyweight Squats", duration: "10 min", intensity: "moderate" },
      ],
      [
        { name: "Light Jogging", duration: "20 min", intensity: "moderate" },
        { name: "Push-ups & Planks", duration: "15 min", intensity: "moderate" },
      ],
      [
        { name: "Yoga / Stretching", duration: "30 min", intensity: "light" },
      ],
      [
        { name: "Cycling", duration: "25 min", intensity: "moderate" },
        { name: "Core Exercises", duration: "10 min", intensity: "moderate" },
      ],
      [
        { name: "Swimming or Walking", duration: "30 min", intensity: "moderate" },
      ],
      [
        { name: "HIIT Circuit", duration: "20 min", intensity: "high" },
        { name: "Cool-down Stretch", duration: "10 min", intensity: "light" },
      ],
    ];
    return { day, exercises: exercises[i % exercises.length] };
  });

  const foodCombinations = [
    {
      name: "Iron Boost",
      foods: ["Spinach", "Lemon juice", "Chickpeas"],
      benefit:
        "Vitamin C from lemon enhances iron absorption from spinach and chickpeas",
    },
    {
      name: "Heart Protector",
      foods: ["Salmon", "Garlic", "Olive oil"],
      benefit:
        "Omega-3s combined with allicin and healthy fats for cardiovascular support",
    },
    {
      name: "Bone Builder",
      foods: ["Low-fat yogurt", "Almonds", "Figs"],
      benefit:
        "Calcium and magnesium combination supports strong bones and muscles",
    },
    {
      name: "BP Reducer",
      foods: ["Banana", "Sweet potato", "White beans"],
      benefit:
        "Potassium-rich trio that naturally helps lower blood pressure",
    },
    {
      name: "Anti-Inflammatory",
      foods: ["Turmeric", "Black pepper", "Ginger"],
      benefit:
        "Piperine in black pepper increases curcumin absorption by 2000%",
    },
  ];

  const tips = [
    "Aim for 4-5 servings of fruits and 4-5 servings of vegetables daily",
    "Choose whole grains over refined grains for 6-8 daily servings",
    "Limit sodium to 1,500mg per day — use herbs and spices instead of salt",
    "Include 2-3 servings of low-fat dairy products daily for calcium",
    "Eat nuts, seeds, or legumes 4-5 times per week",
    "Limit added sugars to less than 5 servings per week",
    "Drink at least 8 glasses of water daily",
    "Prepare meals at home to control sodium and portion sizes",
  ];

  return {
    mealPlan,
    exercisePlan,
    foodCombinations,
    tips,
    summary: `Your personalized DASH diet plan is designed for a daily intake of ${params.dailyCalories} calories. It emphasizes fruits, vegetables, whole grains, and lean proteins while limiting sodium, saturated fats, and added sugars. Combined with your exercise routine, you can expect to see improvements in blood pressure, weight, and overall energy levels.`,
  };
}
