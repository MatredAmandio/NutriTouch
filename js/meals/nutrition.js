const NUTRIENT_KEYS = ['energy_kcal', 'protein_g', 'carbohydrate_g', 'fat_g', 'fiber_g', 'sodium_mg'];

export function buildFoodIndex(foods = []) {
  return new Map((foods || []).map(food => [food.id, food]));
}

export function nutrientsFor(food, grams) {
  const n = food?.nutrition;
  const basis = Number(n?.basis_g) || 100;
  const factor = Math.max(0, Number(grams) || 0) / basis;
  const out = {};
  for (const key of NUTRIENT_KEYS) {
    const value = Number(n?.[key]);
    out[key] = Number.isFinite(value) ? value * factor : 0;
  }
  return out;
}

export function addNutrients(items = []) {
  return items.reduce((total, item) => {
    for (const key of NUTRIENT_KEYS) total[key] += Number(item?.[key]) || 0;
    return total;
  }, Object.fromEntries(NUTRIENT_KEYS.map(key => [key, 0])));
}

export function recipeNutrition(recipe, foodIndex) {
  const ingredients = (recipe.ingredients || []).map(ingredient => {
    const food = foodIndex.get(ingredient.foodId);
    if (!food) return null;
    const grams = Number(ingredient.grams) || 0;
    return {
      foodId: food.id,
      name: food.name,
      grams,
      nutrients: nutrientsFor(food, grams)
    };
  }).filter(Boolean);

  if (ingredients.length !== (recipe.ingredients || []).length) return null;
  return { ingredients, nutrients: addNutrients(ingredients.map(item => item.nutrients)) };
}

function roundTo5(value) {
  return Math.max(5, Math.round(value / 5) * 5);
}

export function scaleRecipeToTarget(recipe, targetKcal, foodIndex) {
  const base = recipeNutrition(recipe, foodIndex);
  if (!base || !base.nutrients.energy_kcal) return null;
  const requested = Number(targetKcal) || base.nutrients.energy_kcal;
  const rawFactor = requested / base.nutrients.energy_kcal;
  const factor = Math.min(1.6, Math.max(0.65, rawFactor));
  const scaledRecipe = {
    ...recipe,
    ingredients: recipe.ingredients.map(item => ({ ...item, grams: roundTo5(item.grams * factor) }))
  };
  const calculated = recipeNutrition(scaledRecipe, foodIndex);
  return calculated ? { ...scaledRecipe, ...calculated, targetKcal: requested, scaleFactor: factor } : null;
}

export function mealShares(count) {
  if (count <= 3) return [0.25, 0.40, 0.35];
  if (count === 4) return [0.25, 0.35, 0.15, 0.25];
  if (count === 5) return [0.22, 0.33, 0.14, 0.23, 0.08];
  return [0.20, 0.10, 0.30, 0.10, 0.22, 0.08];
}
