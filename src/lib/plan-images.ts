// Image mapping helpers for the plan page
// Keeps image selection logic out of the page component

// Actual photo contents (for accurate keyword matching):
// breakfast-1 = oatmeal with berries
// breakfast-2 = avocado toast
// breakfast-3 = smoothie / acai bowl
// breakfast-4 = scrambled eggs with vegetables
//
// lunch-1 = rainbow salad bowl
// lunch-2 = wrap / roll
// lunch-3 = grain bowl (quinoa, chickpeas, farro)
// lunch-4 = soup (tomato / broth-based)
//
// dinner-1 = salmon with roasted vegetables
// dinner-2 = chicken with couscous / quinoa
// dinner-3 = pasta / spaghetti
// dinner-4 = stir-fry (mixed vegetables in wok)
//
// snack-1 = apple slices with peanut/almond butter
// snack-2 = mixed nuts bowl
// snack-3 = yogurt with berries and granola
// snack-4 = veggies and hummus platter

export function getMealImage(mealType: string, dayIndex: number, mealName?: string): string {
  const type = mealType.toLowerCase();
  const name = (mealName || "").toLowerCase();

  if (type.includes("breakfast") || type.includes("morning")) {
    if (name.includes("oat") || name.includes("porridge") || name.includes("cereal") || name.includes("muesli"))
      return "/photos/meals/breakfast-1.jpg";
    if (name.includes("avocado") || name.includes("toast") || name.includes("bread") || name.includes("bagel") || name.includes("pancake") || name.includes("waffle"))
      return "/photos/meals/breakfast-2.jpg";
    if (name.includes("smoothie") || name.includes("acai") || name.includes("bowl") || name.includes("parfait") || name.includes("yogurt") || name.includes("berry") || name.includes("banana"))
      return "/photos/meals/breakfast-3.jpg";
    if (name.includes("egg") || name.includes("omelette") || name.includes("scramble") || name.includes("frittata") || name.includes("veggie"))
      return "/photos/meals/breakfast-4.jpg";
    // Fallback: cycle
    return `/photos/meals/breakfast-${(dayIndex % 4) + 1}.jpg`;
  }

  if (type.includes("lunch") || type.includes("noon")) {
    if (name.includes("salad") || name.includes("slaw") || name.includes("greens") || name.includes("tuna"))
      return "/photos/meals/lunch-1.jpg";
    if (name.includes("wrap") || name.includes("roll") || name.includes("tortilla") || name.includes("sandwich") || name.includes("burrito") || name.includes("pita"))
      return "/photos/meals/lunch-2.jpg";
    if (name.includes("bowl") || name.includes("quinoa") || name.includes("grain") || name.includes("poke") || name.includes("chickpea") || name.includes("lentil") || name.includes("bean") || name.includes("farro") || name.includes("rice"))
      return "/photos/meals/lunch-3.jpg";
    if (name.includes("soup") || name.includes("stew") || name.includes("chowder") || name.includes("bisque") || name.includes("broth"))
      return "/photos/meals/lunch-4.jpg";
    return `/photos/meals/lunch-${(dayIndex % 4) + 1}.jpg`;
  }

  if (type.includes("dinner") || type.includes("evening") || type.includes("supper")) {
    if (name.includes("salmon") || name.includes("fish") || name.includes("cod") || name.includes("tilapia") || name.includes("tuna") || name.includes("shrimp") || name.includes("seafood") || name.includes("prawn"))
      return "/photos/meals/dinner-1.jpg";
    if (name.includes("chicken") || name.includes("turkey") || name.includes("breast") || name.includes("poultry"))
      return "/photos/meals/dinner-2.jpg";
    if (name.includes("pasta") || name.includes("spaghetti") || name.includes("noodle") || name.includes("linguine") || name.includes("penne") || name.includes("meatball"))
      return "/photos/meals/dinner-3.jpg";
    if (name.includes("stir") || name.includes("fry") || name.includes("curry") || name.includes("wok") || name.includes("tofu") || name.includes("stuffed") || name.includes("pepper") || name.includes("taco") || name.includes("fajita") || name.includes("vegetable"))
      return "/photos/meals/dinner-4.jpg";
    return `/photos/meals/dinner-${(dayIndex % 4) + 1}.jpg`;
  }

  // Snack
  if (name.includes("apple") || name.includes("fruit") || name.includes("banana") || name.includes("pear") || name.includes("peach") || name.includes("orange") || name.includes("peanut butter") || name.includes("almond butter"))
    return "/photos/meals/snack-1.jpg";
  if (name.includes("nut") || name.includes("almond") || name.includes("walnut") || name.includes("cashew") || name.includes("trail") || name.includes("seed") || name.includes("mixed"))
    return "/photos/meals/snack-2.jpg";
  if (name.includes("yogurt") || name.includes("cottage") || name.includes("granola") || name.includes("parfait") || name.includes("berry") || name.includes("berr"))
    return "/photos/meals/snack-3.jpg";
  if (name.includes("veggie") || name.includes("vegetable") || name.includes("carrot") || name.includes("celery") || name.includes("hummus") || name.includes("egg") || name.includes("boiled") || name.includes("cucumber") || name.includes("rice cake"))
    return "/photos/meals/snack-4.jpg";

  return `/photos/meals/snack-${(dayIndex % 4) + 1}.jpg`;
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
