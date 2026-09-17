import { DAYS } from './generator.js';
import { QUANTIFIED_RECIPES } from './quantified-library.js';
import { buildFoodIndex, mealShares, scaleRecipeToTarget, addNutrients, nutrientsFor } from './nutrition.js';

const STYLE_PREFERENCES = new Set(['brasileira', 'mediterranea', 'fitness', 'vegetariana', 'vegana']);
const BRAZILIAN_BREAD_BREAKFAST_DAYS = new Set([0, 2, 5]);
const STAPLE_MEALS = new Set(['any', 'breakfast', 'lunch', 'snack', 'dinner']);

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
  const flags = new Set(recipe.flags || []);
  if (!(recipe.diets || []).includes(diet)) return false;
  if (profile.intolerance === 'lactose' && (flags.has('lactose') || flags.has('lactose_unknown'))) return false;
  const glutenRestricted = preference === 'sem-gluten' || ['gluten_intolerance','ncgs'].includes(profile.intolerance);
  if (glutenRestricted && (flags.has('oats') || flags.has('gluten') || flags.has('gluten_unknown'))) return false;

  const terms = normalizedTerms(profile);
  if (!terms.length) return true;
  const searchable = recipe.ingredients.map(item => {
    const food = foodIndex.get(item.foodId);
    return `${food?.name || ''} ${(food?.aliases || []).join(' ')} ${(food?.allergens || []).join(' ')}`;
  }).join(' ').toLowerCase();
  return !terms.some(term => searchable.includes(term));
}

function stylePool(recipes, preference) {
  if (!STYLE_PREFERENCES.has(preference)) return recipes;
  const preferred = recipes.filter(recipe => (recipe.styles || []).includes(preference));
  return preferred.length ? preferred : recipes;
}

function recipeContainsBread(recipe, foodIndex) {
  return recipe.ingredients.some(item => {
    const food = foodIndex.get(item.foodId);
    const text = `${food?.name || ''} ${(food?.aliases || []).join(' ')}`.toLowerCase();
    return /\bpão\b|\bpao\b|\btorrada\b/.test(text);
  });
}

function poolForSlot(pool, kind, dayIndex, profile, foodIndex) {
  if (kind !== 'breakfast' || (profile.preferences || 'brasileira') !== 'brasileira') return pool;
  if (!BRAZILIAN_BREAD_BREAKFAST_DAYS.has(dayIndex)) return pool;
  const breadPool = pool.filter(recipe => recipeContainsBread(recipe, foodIndex));
  return breadPool.length ? breadPool : pool;
}

function chooseRecipe(pool, dayIndex, slotIndex, seed, used) {
  if (!pool.length) return null;
  const start = hashSeed(`${seed}|${dayIndex}|${slotIndex}`) % pool.length;
  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(start + offset) % pool.length];
    if (!used.has(candidate.id)) return candidate;
  }
  return pool[start];
}

function stapleCompatible(food, profile) {
  if (!food) return false;
  const preference = profile.preferences || 'brasileira';
  const compatibility = food.diet_compatibility || {};
  if (preference === 'vegana' && compatibility.vegan !== 'allowed') return false;
  if (preference === 'vegetariana' && compatibility.vegetarian !== 'allowed') return false;
  if (profile.intolerance === 'lactose' && !String(compatibility.lactose_free || '').startsWith('allowed')) return false;
  const glutenRestricted = preference === 'sem-gluten' || ['gluten_intolerance','ncgs'].includes(profile.intolerance);
  if (glutenRestricted && compatibility.gluten_free !== 'allowed') return false;

  const terms = normalizedTerms(profile);
  if (!terms.length) return true;
  const searchable = `${food.name || ''} ${(food.aliases || []).join(' ')} ${(food.allergens || []).join(' ')}`.toLowerCase();
  return !terms.some(term => searchable.includes(term));
}

function stapleScheduleMatches(staple, dayIndex) {
  const frequency = Math.max(1, Math.min(7, Math.round(Number(staple.frequency) || 7)));
  if (frequency >= 7) return true;
  const offset = hashSeed(staple.foodId) % 7;
  const days = new Set(Array.from({length: frequency}, (_, index) => (Math.floor(index * 7 / frequency) + offset) % 7));
  return days.has(dayIndex);
}

function preferredMealForFood(food, slots) {
  const available = new Set(slots.map(([, kind]) => kind));
  const text = `${food?.group || ''} ${(food?.tags || []).join(' ')} ${food?.name || ''}`.toLowerCase();
  if (/bebida|beverage|café|cafe|chá|cha|pão|pao|torrada/.test(text) && available.has('breakfast')) return 'breakfast';
  if (/fruta|fruit/.test(text) && available.has('snack')) return 'snack';
  if (/arroz|feijão|feijao|massa|macarr|batata|mandioca|carne|frango|peixe/.test(text) && available.has('lunch')) return 'lunch';
  return slots[0]?.[1] || 'breakfast';
}

function roundTo5(value) {
  return Math.max(5, Math.round(Number(value || 0) / 5) * 5);
}

function adjustableStapleGrams(food, dailyTarget, mealShare) {
  const household = Number(food?.household_measures?.[0]?.grams);
  const text = `${food?.group || ''} ${(food?.tags || []).join(' ')}`.toLowerCase();
  if (/bebida|beverage/.test(text) && Number.isFinite(household) && household > 0) return household;

  const kcal100 = Number(food?.nutrition?.energy_kcal);
  if (!Number.isFinite(kcal100) || kcal100 <= 0) return Number.isFinite(household) && household > 0 ? household : 50;
  const desiredKcal = Math.min(180, Math.max(50, Number(dailyTarget) * Number(mealShare || 0.2) * 0.24));
  let grams = desiredKcal / (kcal100 / 100);
  const upper = /fruta|fruit/.test(text) ? 250 : 180;
  grams = Math.max(15, Math.min(upper, grams));
  return roundTo5(grams);
}

function buildDayStaples(profile, foodIndex, dayIndex, dailyTarget, slots, shares) {
  const raw = Array.isArray(profile.staples) ? profile.staples : [];
  return raw.map(staple => {
    const food = foodIndex.get(staple.foodId);
    if (!food || !stapleCompatible(food, profile) || !stapleScheduleMatches(staple, dayIndex)) return null;
    const requestedMeal = STAPLE_MEALS.has(staple.meal) ? staple.meal : 'breakfast';
    const meal = requestedMeal === 'any' ? preferredMealForFood(food, slots) : requestedMeal;
    const foundSlotIndex = slots.findIndex(([, kind]) => kind === meal);
    const slotIndex = foundSlotIndex >= 0 ? foundSlotIndex : 0;
    const share = shares[slotIndex] || shares[0] || 0.2;
    const fixed = staple.mode === 'fixed' && Number(staple.grams) > 0;
    const grams = fixed
      ? Math.max(5, Math.min(1000, Number(staple.grams)))
      : adjustableStapleGrams(food, dailyTarget, share);
    return {
      foodId: food.id,
      name: food.name,
      meal,
      slotIndex,
      grams,
      fixed,
      nutrients: nutrientsFor(food, grams)
    };
  }).filter(Boolean);
}

function avoidStapleDuplicates(pool, staples = []) {
  if (!staples.length) return pool;
  const ids = new Set(staples.map(item => item.foodId));
  const filtered = pool.filter(recipe => !recipe.ingredients.some(item => ids.has(item.foodId)));
  return filtered.length ? filtered : pool;
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
  const pools = Object.fromEntries(['breakfast','lunch','snack','dinner'].map(kind => {
    const compatible = QUANTIFIED_RECIPES.filter(recipe =>
      recipe.kind === kind
      && recipe.ingredients.every(item => foodIndex.has(item.foodId))
      && recipeCompatible(recipe, profile, foodIndex)
    );
    return [kind, stylePool(compatible, profile.preferences || 'brasileira')];
  }));

  if (slots.some(([,kind]) => !pools[kind]?.length)) return null;

  return DAYS.map((day, dayIndex) => {
    const dayStaples = buildDayStaples(profile, foodIndex, dayIndex, targetKcal, slots, shares);
    const stapleEnergy = dayStaples.reduce((sum, item) => sum + (Number(item.nutrients?.energy_kcal) || 0), 0);
    const regularBudget = Math.max(0, Number(targetKcal) - stapleEnergy);
    const usedByKind = new Map();

    const meals = slots.map(([label, kind], slotIndex) => {
      if (!usedByKind.has(kind)) usedByKind.set(kind, new Set());
      const staplesForMeal = dayStaples.filter(item => item.slotIndex === slotIndex);
      let slotPool = poolForSlot(pools[kind], kind, dayIndex, profile, foodIndex);
      slotPool = avoidStapleDuplicates(slotPool, staplesForMeal);
      const recipe = chooseRecipe(slotPool, dayIndex, slotIndex, seed, usedByKind.get(kind));
      usedByKind.get(kind).add(recipe.id);

      const regularTarget = regularBudget * shares[slotIndex];
      const quantified = scaleRecipeToTarget(recipe, regularTarget, foodIndex, { minFactor: 0.15, maxFactor: 1.6 });
      const stapleIngredients = staplesForMeal.map(item => ({
        foodId: item.foodId,
        name: item.name,
        grams: item.grams,
        nutrients: item.nutrients,
        isStaple: true,
        fixed: item.fixed
      }));
      const ingredients = [...(quantified?.ingredients || []), ...stapleIngredients];
      const nutrients = addNutrients(ingredients.map(item => item.nutrients));
      const components = [
        ...(quantified?.ingredients || []).map(item => `${item.grams} g ${item.name}`),
        ...stapleIngredients.map(item => `${item.grams} g ${item.name} · indispensável`)
      ];

      return {
        label, kind, role: roles[slotIndex],
        meal: { id: recipe.id, title: recipe.title, flags: recipe.flags || [], components },
        ingredients,
        nutrients,
        targetKcal: Number(targetKcal) * shares[slotIndex],
        staples: stapleIngredients
      };
    });

    return {
      day,
      meals,
      nutrients: addNutrients(meals.map(meal => meal.nutrients)),
      nutrientStatus: 'validated-food-calculation',
      staplesApplied: dayStaples.map(item => ({ foodId: item.foodId, name: item.name, meal: item.meal, grams: item.grams, fixed: item.fixed }))
    };
  });
}
