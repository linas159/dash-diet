// Image mapping helpers for the plan page
// Keeps image selection logic out of the page component

export function getMealImage(mealType: string, dayIndex: number): string {
  const type = mealType.toLowerCase();
  let category = "snack";
  if (type.includes("breakfast") || type.includes("morning")) category = "breakfast";
  else if (type.includes("lunch") || type.includes("noon")) category = "lunch";
  else if (type.includes("dinner") || type.includes("evening") || type.includes("supper")) category = "dinner";
  else if (type.includes("snack")) category = "snack";

  const num = (dayIndex % 4) + 1;
  return `/photos/meals/${category}-${num}.jpg`;
}

export function getExerciseImage(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes("walk")) return "/photos/exercises/walking.jpg";
  if (name.includes("jog") || name.includes("run")) return "/photos/exercises/jogging.jpg";
  if (name.includes("yoga") || name.includes("meditation")) return "/photos/exercises/yoga.jpg";
  if (name.includes("cycl") || name.includes("bike") || name.includes("biking")) return "/photos/exercises/cycling.jpg";
  if (name.includes("swim")) return "/photos/exercises/swimming.jpg";
  if (name.includes("hiit") || name.includes("circuit") || name.includes("interval")) return "/photos/exercises/hiit.jpg";
  if (name.includes("stretch") || name.includes("cool") || name.includes("flexibility") || name.includes("warm")) return "/photos/exercises/stretching.jpg";
  // push-ups, squats, planks, core, bodyweight, strength, resistance
  if (name.includes("push") || name.includes("squat") || name.includes("plank") || name.includes("core") || name.includes("body") || name.includes("strength") || name.includes("resist") || name.includes("weight") || name.includes("lunge") || name.includes("curl") || name.includes("press")) return "/photos/exercises/strength.jpg";
  return "/photos/exercises/strength.jpg";
}

export function getShoppingCategoryImage(category: string): string {
  const validCategories = ["produce", "proteins", "grains", "dairy", "pantry", "other"];
  const cat = category.toLowerCase();
  if (validCategories.includes(cat)) return `/photos/shopping/${cat}.jpg`;
  return "/photos/shopping/other.jpg";
}

const comboImages = [
  "iron-boost",
  "heart-protector",
  "bone-builder",
  "bp-reducer",
  "anti-inflammatory",
  "energy-sustainer",
];

export function getComboImage(comboName: string, index: number): string {
  const name = comboName.toLowerCase();
  if (name.includes("iron")) return "/photos/combos/iron-boost.jpg";
  if (name.includes("heart") || name.includes("cardio")) return "/photos/combos/heart-protector.jpg";
  if (name.includes("bone") || name.includes("calcium")) return "/photos/combos/bone-builder.jpg";
  if (name.includes("blood") || name.includes("bp") || name.includes("pressure")) return "/photos/combos/bp-reducer.jpg";
  if (name.includes("inflam") || name.includes("anti")) return "/photos/combos/anti-inflammatory.jpg";
  if (name.includes("energy") || name.includes("sustain") || name.includes("power")) return "/photos/combos/energy-sustainer.jpg";
  // Fallback: cycle through images by index
  return `/photos/combos/${comboImages[index % comboImages.length]}.jpg`;
}

const lifestyleImages = [
  "/photos/lifestyle/cooking.jpg",
  "/photos/lifestyle/grocery-shopping.jpg",
  "/photos/lifestyle/water.jpg",
  "/photos/lifestyle/meal-prep.jpg",
];

export function getLifestyleImage(index: number): string {
  return lifestyleImages[index % lifestyleImages.length];
}
