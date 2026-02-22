// Image mapping helpers for the plan page
// Keeps image selection logic out of the page component

// ── Photo contents (keep in sync when adding new images) ──────────────────
// breakfast-1  = oatmeal with berries
// breakfast-2  = avocado toast
// breakfast-3  = smoothie / acai bowl
// breakfast-4  = scrambled eggs with vegetables
// breakfast-5  = Greek yogurt parfait (layered glass, granola, berries)
// breakfast-6  = chia seed pudding (jar, mango topping)
// breakfast-7  = cottage cheese bowl with peaches / fruit
// breakfast-8  = fresh fruit salad bowl (melon, kiwi, citrus)
// breakfast-9  = overnight oats in mason jar (banana, chia seeds)
// breakfast-10 = whole grain toast with poached egg and wilted spinach
// breakfast-11 = breakfast burrito / wrap with scrambled egg and black beans
// breakfast-12 = baked oats in ramekin with blueberries
//
// lunch-1  = rainbow salad bowl
// lunch-2  = wrap / roll
// lunch-3  = grain bowl (quinoa, chickpeas, farro)
// lunch-4  = soup (tomato / broth-based)
// lunch-5  = poke bowl (raw fish, rice, edamame, avocado)
// lunch-6  = Mediterranean platter (hummus, pita, olives, feta)
// lunch-7  = Buddha bowl (roasted veg, chickpeas, tahini)
// lunch-8  = Caesar / grilled chicken salad
// lunch-9  = quinoa tabbouleh with fresh herbs and lemon
// lunch-10 = minestrone / lentil soup with crusty bread
// lunch-11 = grilled chicken rice bowl with roasted peppers
// lunch-12 = tuna Niçoise salad (green beans, eggs, olives)
//
// dinner-1  = salmon with roasted vegetables
// dinner-2  = chicken with couscous / quinoa
// dinner-3  = pasta / spaghetti
// dinner-4  = stir-fry (mixed vegetables in wok)
// dinner-5  = stuffed bell peppers
// dinner-6  = shrimp tacos in corn tortillas
// dinner-7  = coconut curry (chicken or vegetable)
// dinner-8  = sheet pan roasted chicken with sweet potatoes
// dinner-9  = baked cod / halibut with lemon-herb crust
// dinner-10 = turkey / lean beef meatballs in light tomato sauce
// dinner-11 = red lentil dal with yogurt swirl and naan
// dinner-12 = roasted vegetable medley on baking tray
//
// snack-1  = apple slices with peanut / almond butter
// snack-2  = mixed nuts bowl
// snack-3  = yogurt with berries and granola
// snack-4  = veggies and hummus platter
// snack-5  = hard-boiled eggs with cherry tomatoes and cucumber
// snack-6  = tall smoothie in a glass
// snack-7  = rice cakes topped with avocado
// snack-8  = steamed edamame bowl
// snack-9  = banana with almond / peanut butter
// snack-10 = dark chocolate squares with strawberries / raspberries
// snack-11 = celery sticks and baby carrots with almond butter / hummus
// snack-12 = cottage cheese with pineapple and honey
//
// brunch-1 = shakshuka (eggs in tomato sauce, cast iron)
// brunch-2 = avocado toast with poached egg on top
// brunch-3 = veggie frittata slice with side salad
// brunch-4 = grain bowl with soft-boiled egg and tahini

export function getMealImage(mealType: string, dayIndex: number, mealName?: string): string {
  const type = mealType.toLowerCase();
  const name = (mealName || "").toLowerCase();

  // ── Brunch (2-meal-per-day plan) ──────────────────────────────────────────
  if (type.includes("brunch")) {
    if (name.includes("shakshuka") || name.includes("tomato") || name.includes("poached"))
      return "/photos/meals/brunch-1.jpg";
    if (name.includes("avocado") || name.includes("toast"))
      return "/photos/meals/brunch-2.jpg";
    if (name.includes("frittata") || name.includes("omelette") || name.includes("egg"))
      return "/photos/meals/brunch-3.jpg";
    if (name.includes("bowl") || name.includes("grain") || name.includes("quinoa"))
      return "/photos/meals/brunch-4.jpg";
    return `/photos/meals/brunch-${(dayIndex % 4) + 1}.jpg`;
  }

  // ── Breakfast / Mid-Morning ────────────────────────────────────────────────
  if (type.includes("breakfast") || type.includes("mid-morning") || type.includes("morning")) {
    // ── Specific catches first (order matters) ────────────────────────────
    // breakfast-9: overnight oats — "overnight" is uniquely specific
    if (name.includes("overnight"))
      return "/photos/meals/breakfast-9.jpg";
    // breakfast-10: poached egg on toast with spinach
    if (name.includes("poached") || name.includes("spinach"))
      return "/photos/meals/breakfast-10.jpg";
    // breakfast-11: breakfast burrito / wrap with egg and black beans
    if (name.includes("burrito") || name.includes("black bean"))
      return "/photos/meals/breakfast-11.jpg";
    // breakfast-12: baked oats in ramekin with blueberries
    if (name.includes("baked oat") || name.includes("ramekin") ||
        (name.includes("blueberry") && (name.includes("oat") || name.includes("bak"))))
      return "/photos/meals/breakfast-12.jpg";

    // ── General catches ───────────────────────────────────────────────────
    // breakfast-1: classic oatmeal / porridge (after overnight check above)
    if (name.includes("oat") || name.includes("porridge") || name.includes("cereal") ||
        name.includes("muesli") || name.includes("granola bowl"))
      return "/photos/meals/breakfast-1.jpg";
    // breakfast-2: avocado toast, bagels, pancakes
    if (name.includes("avocado") || name.includes("toast") || name.includes("bagel") ||
        name.includes("pancake") || name.includes("waffle") || name.includes("bread"))
      return "/photos/meals/breakfast-2.jpg";
    // breakfast-3: smoothies, acai bowls
    if (name.includes("smoothie") || name.includes("acai"))
      return "/photos/meals/breakfast-3.jpg";
    // breakfast-4: scrambled eggs, omelettes (generic egg dishes)
    if (name.includes("scramble") || name.includes("omelette") ||
        name.includes("veggie egg") || name.includes("egg white"))
      return "/photos/meals/breakfast-4.jpg";
    // breakfast-5: Greek yogurt parfait
    if (name.includes("parfait") || name.includes("yogurt") || name.includes("granola"))
      return "/photos/meals/breakfast-5.jpg";
    // breakfast-6: chia pudding
    if (name.includes("chia") || name.includes("pudding"))
      return "/photos/meals/breakfast-6.jpg";
    // breakfast-7: cottage cheese bowl with fruit
    if (name.includes("cottage") || name.includes("peach") || name.includes("ricotta"))
      return "/photos/meals/breakfast-7.jpg";
    // breakfast-8: fresh fruit salad bowl
    if (name.includes("fruit salad") || name.includes("fruit bowl") ||
        name.includes("melon") || name.includes("kiwi") || name.includes("berry bowl"))
      return "/photos/meals/breakfast-8.jpg";
    // late egg catch: any remaining egg / frittata → breakfast-4
    if (name.includes("egg") || name.includes("frittata"))
      return "/photos/meals/breakfast-4.jpg";
    // late fruit / banana / berry → smoothie bowl (breakfast-3)
    if (name.includes("banana") || name.includes("berry") ||
        name.includes("blueberry") || name.includes("bowl"))
      return "/photos/meals/breakfast-3.jpg";
    return `/photos/meals/breakfast-${(dayIndex % 12) + 1}.jpg`;
  }

  // ── Lunch / Afternoon ─────────────────────────────────────────────────────
  if (type.includes("lunch") || type.includes("afternoon") || type.includes("noon")) {
    // ── Specific catches first ────────────────────────────────────────────
    // lunch-8: Caesar salad
    if (name.includes("caesar"))
      return "/photos/meals/lunch-8.jpg";
    // lunch-5: poke bowl (raw fish, edamame)
    if (name.includes("poke") || name.includes("edamame"))
      return "/photos/meals/lunch-5.jpg";
    // lunch-6: Mediterranean platter (hummus, falafel, olives)
    if (name.includes("mediterranean") || name.includes("hummus") || name.includes("falafel") ||
        name.includes("platter") || name.includes("olive"))
      return "/photos/meals/lunch-6.jpg";
    // lunch-7: Buddha bowl (tahini is the tell-tale keyword)
    if (name.includes("buddha") || name.includes("tahini"))
      return "/photos/meals/lunch-7.jpg";
    // lunch-9: quinoa tabbouleh — "tabbouleh" is unmistakably specific
    if (name.includes("tabbouleh") || name.includes("tabouleh"))
      return "/photos/meals/lunch-9.jpg";
    // lunch-10: minestrone or lentil soup with bread — must come before generic soup catch
    if (name.includes("minestrone") || (name.includes("lentil") && name.includes("soup")))
      return "/photos/meals/lunch-10.jpg";
    // lunch-4: generic soups / stews
    if (name.includes("soup") || name.includes("stew") || name.includes("chowder") ||
        name.includes("bisque") || name.includes("broth"))
      return "/photos/meals/lunch-4.jpg";
    // lunch-2: wraps, sandwiches, burritos
    if (name.includes("wrap") || name.includes("roll") || name.includes("tortilla") ||
        name.includes("sandwich") || name.includes("burrito") || name.includes("pita"))
      return "/photos/meals/lunch-2.jpg";
    // lunch-12: tuna Niçoise — tuna here is more accurate than the generic salad bowl
    if (name.includes("niçoise") || name.includes("nicoise") || name.includes("tuna"))
      return "/photos/meals/lunch-12.jpg";
    // lunch-1: generic salads / greens (tuna already caught above)
    if (name.includes("salad") || name.includes("slaw") || name.includes("greens"))
      return "/photos/meals/lunch-1.jpg";
    // lunch-11: grilled chicken rice bowl with roasted peppers
    if ((name.includes("chicken") || name.includes("grilled")) &&
        (name.includes("rice") || name.includes("bowl")))
      return "/photos/meals/lunch-11.jpg";
    // lunch-3: grain bowls, quinoa, chickpeas, lentils, rice (catch-all bowl)
    if (name.includes("bowl") || name.includes("quinoa") || name.includes("grain") ||
        name.includes("chickpea") || name.includes("lentil") || name.includes("bean") ||
        name.includes("farro") || name.includes("rice"))
      return "/photos/meals/lunch-3.jpg";
    return `/photos/meals/lunch-${(dayIndex % 12) + 1}.jpg`;
  }

  // ── Dinner / Evening / Supper ─────────────────────────────────────────────
  if (type.includes("dinner") || type.includes("evening") || type.includes("supper")) {
    // ── Specific catches first ────────────────────────────────────────────
    // dinner-5: stuffed peppers
    if (name.includes("stuffed"))
      return "/photos/meals/dinner-5.jpg";
    // dinner-6: tacos / fajitas
    if (name.includes("taco") || name.includes("fajita"))
      return "/photos/meals/dinner-6.jpg";
    // dinner-7: curries (coconut, tikka, masala)
    if (name.includes("curry") || name.includes("coconut") ||
        name.includes("tikka") || name.includes("masala"))
      return "/photos/meals/dinner-7.jpg";
    // dinner-11: lentil dal with naan — must come before sheet-pan and general fish checks
    // "lentil" without "soup" catches lentil dal/stew; "dal"/"dhal"/"naan" are unmistakable
    if (name.includes("dal") || name.includes("dhal") || name.includes("naan") ||
        (name.includes("lentil") && !name.includes("soup")))
      return "/photos/meals/dinner-11.jpg";
    // dinner-8: sheet pan chicken with sweet potato
    if (name.includes("sheet pan") || name.includes("roasted chicken") ||
        name.includes("sweet potato") || name.includes("traybake"))
      return "/photos/meals/dinner-8.jpg";
    // dinner-9: baked cod / halibut with lemon-herb crust — before generic fish catch
    // "cod" is moved here because dinner-9 IS baked cod; salmon stays in dinner-1
    if (name.includes("halibut") || name.includes("cod") ||
        (name.includes("lemon") && name.includes("herb") &&
         (name.includes("fish") || name.includes("bak"))))
      return "/photos/meals/dinner-9.jpg";
    // dinner-1: salmon, other fish and seafood
    if (name.includes("salmon") || name.includes("fish") || name.includes("tilapia") ||
        name.includes("seafood") || name.includes("prawn") ||
        (name.includes("shrimp") && !name.includes("taco")))
      return "/photos/meals/dinner-1.jpg";
    // dinner-10: meatballs — must come before the chicken/turkey catch
    // (turkey meatball contains "turkey" but "meatball" is the decisive keyword)
    if (name.includes("meatball"))
      return "/photos/meals/dinner-10.jpg";
    // dinner-2: chicken, turkey, poultry dishes
    if (name.includes("chicken") || name.includes("turkey") ||
        name.includes("breast") || name.includes("poultry"))
      return "/photos/meals/dinner-2.jpg";
    // dinner-3: pasta / noodles (meatball removed — handled above)
    if (name.includes("pasta") || name.includes("spaghetti") || name.includes("noodle") ||
        name.includes("linguine") || name.includes("penne"))
      return "/photos/meals/dinner-3.jpg";
    // dinner-12: roasted vegetable medley — before generic vegetable / stir-fry catch
    if (name.includes("medley") ||
        (name.includes("roasted") && (name.includes("vegetable") || name.includes("veggie"))))
      return "/photos/meals/dinner-12.jpg";
    // dinner-4: stir-fries, wok dishes, tofu, generic vegetable dinners
    if (name.includes("stir") || name.includes("wok") || name.includes("tofu") ||
        name.includes("vegetable") || name.includes("veggie") || name.includes("pepper"))
      return "/photos/meals/dinner-4.jpg";
    return `/photos/meals/dinner-${(dayIndex % 12) + 1}.jpg`;
  }

  // ── Snack (default for unrecognised meal types) ───────────────────────────
  // Most specific catches first to avoid collisions
  // snack-8: edamame
  if (name.includes("edamame"))
    return "/photos/meals/snack-8.jpg";
  // snack-7: rice cakes with avocado
  if (name.includes("rice cake") || (name.includes("avocado") && name.includes("rice")))
    return "/photos/meals/snack-7.jpg";
  // snack-6: smoothies / protein shakes
  if (name.includes("smoothie") || name.includes("shake") || name.includes("protein shake"))
    return "/photos/meals/snack-6.jpg";
  // snack-5: hard-boiled eggs with veggies
  if (name.includes("boiled egg") || name.includes("hard-boiled") || name.includes("hard boiled") ||
      (name.includes("egg") && (name.includes("veggi") || name.includes("tomato") || name.includes("cucumber"))))
    return "/photos/meals/snack-5.jpg";
  // snack-9: banana with nut butter — "banana" before the generic nut-butter check (snack-1)
  if (name.includes("banana"))
    return "/photos/meals/snack-9.jpg";
  // snack-10: dark chocolate with berries
  if (name.includes("chocolate") || name.includes("dark choc"))
    return "/photos/meals/snack-10.jpg";
  // snack-12: cottage cheese with pineapple — "cottage cheese" before snack-3's generic yogurt/fruit
  if (name.includes("pineapple") || name.includes("cottage cheese"))
    return "/photos/meals/snack-12.jpg";
  // snack-11: celery sticks / baby carrots — more specific than the generic veggie platter (snack-4)
  if (name.includes("celery stick") || name.includes("baby carrot"))
    return "/photos/meals/snack-11.jpg";
  // snack-1: apple / stone fruit / nut butter
  if (name.includes("apple") || name.includes("pear") || name.includes("peach") ||
      name.includes("orange") || name.includes("peanut butter") || name.includes("almond butter"))
    return "/photos/meals/snack-1.jpg";
  // snack-2: mixed nuts and seeds
  if (name.includes("nut") || name.includes("almond") || name.includes("walnut") ||
      name.includes("cashew") || name.includes("trail mix") || name.includes("seed mix"))
    return "/photos/meals/snack-2.jpg";
  // snack-3: yogurt, granola, berry/fruit snacks ("cottage" removed — handled by snack-12)
  if (name.includes("yogurt") || name.includes("granola") || name.includes("parfait") ||
      name.includes("berry") || name.includes("fruit"))
    return "/photos/meals/snack-3.jpg";
  // snack-4: veggie & hummus platter (generic vegetables / dips)
  if (name.includes("veggie") || name.includes("vegetable") || name.includes("carrot") ||
      name.includes("celery") || name.includes("hummus") || name.includes("cucumber"))
    return "/photos/meals/snack-4.jpg";

  return `/photos/meals/snack-${(dayIndex % 12) + 1}.jpg`;
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
