import { DAYS } from './generator.js';
import { QUANTIFIED_RECIPES } from './quantified-recipes.js';
import { buildFoodIndex, mealShares, scaleRecipeToTarget, addNutrients } from './nutrition.js';

function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function weekKey(date = new Date()) {
  const now = new Date(date);
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - oneJan) / 86400000);
  return `${now.getFullYear()}-${Math.floor(dayOfYear / 7)}`;
}

function labelsAndKinds(count) {
  if (count <= 3) return [['Café da manhã','breakfast'],['Almoço','lunch'],['Jantar','dinner']];
  if (count === 4) return [['Café da manhã','breakfast'],['Almoço','lunch'],['Lanche da tarde','snack'],['Jantar','dinner']];
  if (count === 5) return [['Café da manhã','breakfast'],['Almoço','lunch'],['Lanche da tarde','snack'],['Jantar','dinner'],['Ceia','snack']];
  return [['Café da manhã','breakfast'],['Lanche da manhã','snack'],['Almoço','lunch'],['Lanche da tarde','snack'],['Jantar','dinner'],['Ceia','snack']];
}

function trainingRoles(count, trainingTime) {
  const roles = Array.from({length: count}, () => '');
  if (!trainingTime) return roles;
  if (trainingTime === 'morning') { roles[0] = 'Pré-treino'; if (count > 1) roles[1] = 'Pós-treino'; }
  if (trainingTime === 'afternoon') {
    const pre = count >= 4 ? Math.max(1, count - 3) : 1;
    roles[pre] = 'Pré-treino'; roles[Math.min(count - 1, pre + 1)] = 'Pós-treino';
  }
  if (trainingTime === 'evening') {
    const post = Math.max(0, count - 1); roles[Math.max(0, post - 1)] = 'Pré-treino'; roles[post] = 'Pós-treino';
  }
  return roles;
}

function normalizedTerms(profile) {
  return `${profile.avoid || ''},${profile.allergies || ''}`.toLowerCase().split(/[,;]/).map(x => x.trim()).filter(x => x.length >= 3);
}

function recipeCompatible(recipe, profile, foodIndex) {
  const preference = profile.preferences || 'brasileira';
  const diet = preference === 'vegana' ? 'vegan' : preference === 'vegetariana' ? 'vegetarian' : 'omnivore';
  if (!(recipe.diets || []).includes(diet)) return false;
  if (profile.intolerance === 'lactose' && (recipe.flags || []).includes('lactose')) return false;
  const glutenRestricted = preference === 'sem-gluten' || ['gluten_intolerance','ncgs'].includes(profile.intolerance);
  if (glutenRestricted && (recipe.flags || []).includes('oats')) return false;

  const terms = normalizedTerms(profile);
  if (!terms.length) return true;
  const searchable = recipe.ingredients.map(item => {
    const food = foodIndex.get(item.foodId);
    return `${food?.name || ''} ${(food?.aliases || []).join(' ')} ${(food?.allergens || []).join(' ')}`;
  }).join(' ').toLowerCase();
  return !terms.some(term => searchable.includes(term));
}

function chooseRecipe(pool, dayIndex, slotIndex, seed, used) {
  if (!pool.length) return null;
  const start = (seed + dayIndex * 11 + slotIndex * 7) % pool.length;
  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(start + offset) % pool.length];
    if (!used.has(candidate.id)) return candidate;
  }
  return pool[start];
}

export function canGenerateQuantifiedPlan(foods = []) {
  const ids = new Set((foods || []).map(food => food.id));
  return QUANTIFIED_RECIPES.some(recipe => recipe.ingredients.every(item => ids.has(item.foodId)));
}

export function generateQuantifiedWeeklyPlan(profile, foods, targetKcal, date = new Date()) {
  const count = Math.max(3, Math.min(6, Number(profile.meals) || 4));
  const slots = labelsAndKinds(count);
  const shares = mealShares(count);
  const roles = trainingRoles(count, profile.trainingTime);
  const foodIndex = buildFoodIndex(foods);
  const seed = hashSeed(`${profile.preferences}|${profile.goal}|${weekKey(date)}`);
  const pools = Object.fromEntries(['breakfast','lunch','snack','dinner'].map(kind => [kind,
    QUANTIFIED_RECIPES.filter(recipe => recipe.kind === kind && recipe.ingredients.every(item => foodIndex.has(item.foodId)) && recipeCompatible(recipe, profile, foodIndex))
  ]));

  if (slots.some(([,kind]) => !pools[kind]?.length)) return null;

  return DAYS.map((day, dayIndex) => {
    const usedByKind = new Map();
    const meals = slots.map(([label, kind], slotIndex) => {
      if (!usedByKind.has(kind)) usedByKind.set(kind, new Set());
      const recipe = chooseRecipe(pools[kind], dayIndex, slotIndex, seed, usedByKind.get(kind));
      usedByKind.get(kind).add(recipe.id);
      const target = Number(targetKcal) * shares[slotIndex];
      const quantified = scaleRecipeToTarget(recipe, target, foodIndex);
      return {
        label, kind, role: roles[slotIndex],
        meal: { id: recipe.id, title: recipe.title, flags: recipe.flags || [], components: quantified.ingredients.map(item => `${item.grams} g ${item.name}`) },
        ingredients: quantified.ingredients,
        nutrients: quantified.nutrients,
        targetKcal: target
      };
    });
    return {
      day,
      meals,
      nutrients: addNutrients(meals.map(meal => meal.nutrients)),
      nutrientStatus: 'validated-food-calculation'
    };
  });
}
