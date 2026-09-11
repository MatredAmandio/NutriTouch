const VERIFIED_SOURCE_STATUSES = new Set(['validated', 'verified', 'approved']);

function hasCompleteNutrition(food) {
  const n = food?.nutrition;
  return n && ['energy_kcal', 'protein_g', 'carbohydrate_g', 'fat_g']
    .every(key => Number.isFinite(n[key]));
}

export function isValidatedFood(food) {
  const verifiedSource = Array.isArray(food?.sources)
    && food.sources.some(source => VERIFIED_SOURCE_STATUSES.has(source.status) && source.record_id);
  return Boolean(verifiedSource && hasCompleteNutrition(food));
}

export async function loadFoodDatabase() {
  try {
    const response = await fetch('./data/foods.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const foods = Array.isArray(data.foods) ? data.foods : [];
    return {
      version: data.version || 'unknown',
      status: data.status || 'unknown',
      safetyNote: data.safety_note || '',
      foods,
      validated: foods.filter(isValidatedFood),
      quarantined: foods.filter(food => !isValidatedFood(food))
    };
  } catch (error) {
    return {
      version: 'unavailable',
      status: 'unavailable',
      safetyNote: 'Base de alimentos indisponível no momento.',
      foods: [],
      validated: [],
      quarantined: [],
      error: String(error?.message || error)
    };
  }
}
