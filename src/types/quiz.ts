export type QuestionType =
  | "single"
  | "multiple"
  | "number"
  | "height"
  | "weight"
  | "text"
  | "gender"
  | "body-type"
  | "scale";

export interface QuizOption {
  id: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface QuizQuestion {
  id: string;
  section: string;
  question: string;
  subtitle?: string;
  type: QuestionType;
  options?: QuizOption[];
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  required?: boolean;
}

export interface QuizAnswers {
  [questionId: string]: string | string[] | number;
}

export interface UserProfile {
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: string;
  goal: string;
  allergies: string[];
  dietFamiliarity: string;
  bodyType: string;
  targetBodyType: string;
  healthConditions: string[];
  eatingHabits: string[];
  foodPreferences: string[];
  exerciseFrequency: string;
  sleepHours: string;
  waterIntake: string;
  motivation: string;
  timeline: string;
  email?: string;
}

export interface GeneratedPlan {
  id: string;
  summary: string;
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  mealPlan: MealDay[];
  exercisePlan: ExerciseDay[];
  tips: string[];
  foodCombinations: FoodCombination[];
}

export interface MealDay {
  day: string;
  meals: {
    type: string;
    name: string;
    calories: number;
    description: string;
  }[];
}

export interface ExerciseDay {
  day: string;
  exercises: {
    name: string;
    duration: string;
    intensity: string;
  }[];
  restDay?: boolean;
}

export interface FoodCombination {
  name: string;
  foods: string[];
  benefit: string;
}
