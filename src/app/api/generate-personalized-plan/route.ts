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
    const exerciseFrequency =
      (quizAnswers.exercise_frequency as string) || "1_2_week";

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
    });

    let personalizedPlan = null;

    // Try Gemini API if key is available
    if (process.env.GEMINI_API_KEY) {
      console.log("🤖 Using Gemini API to generate personalized plan...");
      try {
        const systemInstruction =
          "You are a certified nutritionist and fitness expert specializing in the DASH diet. Generate comprehensive, personalized meal plans, exercise routines, shopping lists, and progress tracking templates. Respond in JSON format only with detailed, actionable content.";

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
                maxOutputTokens: 8000,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const textContent = data.candidates[0].content.parts[0].text;
          personalizedPlan = JSON.parse(textContent);
          console.log("✅ Gemini API generated personalized plan successfully");
        } else {
          const errorText = await geminiResponse.text();
          console.error("❌ Gemini API failed:", geminiResponse.status, errorText);
        }
      } catch (err) {
        console.error("❌ Gemini API error:", err);
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
}

function buildComprehensivePrompt(params: PromptParams): string {
  return `Create a comprehensive personalized 7-day DASH diet plan for this person:

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
        {
          "type": "Breakfast",
          "name": "...",
          "calories": 400,
          "description": "...",
          "ingredients": ["ingredient1", "ingredient2"],
          "macros": { "protein": 20, "carbs": 45, "fats": 15, "sodium": 300 },
          "prepTime": "15 min",
          "recipe": "Step by step instructions..."
        }
      ]
    }
  ],
  "exercisePlan": [
    {
      "day": "Monday",
      "exercises": [
        {
          "name": "...",
          "duration": "30 min",
          "intensity": "moderate",
          "instructions": "How to perform...",
          "caloriesBurned": 200
        }
      ]
    }
  ],
  "weeklyShoppingList": {
    "produce": [{"item": "Spinach", "quantity": "2 bunches"}],
    "proteins": [{"item": "Chicken breast", "quantity": "1.5 lbs"}],
    "grains": [{"item": "Brown rice", "quantity": "2 cups"}],
    "dairy": [{"item": "Low-fat Greek yogurt", "quantity": "1 container"}],
    "pantry": [{"item": "Olive oil", "quantity": "1 bottle"}],
    "other": [{"item": "Almond butter", "quantity": "1 jar"}]
  },
  "foodCombinations": [
    {
      "name": "...",
      "foods": ["food1", "food2"],
      "benefit": "...",
      "bestTime": "breakfast/lunch/dinner"
    }
  ],
  "progressTracking": {
    "weeklyGoals": [
      {"goal": "Drink 8 glasses of water daily", "tracked": false},
      {"goal": "Exercise 3 times this week", "tracked": false}
    ],
    "measurements": {
      "weight": null,
      "waist": null,
      "bloodPressure": null,
      "energy": null
    },
    "milestones": [
      {"week": 1, "target": "Complete all meals", "achieved": false},
      {"week": 2, "target": "Hit exercise goals", "achieved": false}
    ]
  },
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
