export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese (Class I)";
  if (bmi < 40) return "Obese (Class II)";
  return "Obese (Class III)";
}

export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return "#3b82f6";
  if (bmi < 25) return "#22c55e";
  if (bmi < 30) return "#f59e0b";
  if (bmi < 35) return "#f97316";
  return "#ef4444";
}

export function calculateDailyCalories(
  gender: string,
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: string,
  goal: string
): number {
  // Mifflin-St Jeor equation
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.375);

  // Adjust for goal
  if (goal === "lose_weight") return Math.round(tdee - 500);
  if (goal === "build_muscle") return Math.round(tdee + 300);
  return Math.round(tdee);
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Unit conversion helpers
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function inToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

export function cmToIn(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function getWeightLossProjection(
  currentWeight: number,
  targetWeight: number,
  weeks: number
): number[] {
  const totalLoss = currentWeight - targetWeight;
  const weeklyLoss = totalLoss / weeks;
  const projections: number[] = [];

  for (let i = 0; i <= weeks; i++) {
    projections.push(
      Math.round((currentWeight - weeklyLoss * i) * 10) / 10
    );
  }

  return projections;
}
