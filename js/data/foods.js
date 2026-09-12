const VERIFIED_SOURCE_STATUSES = new Set(['validated', 'verified', 'approved']);

const ACCEPTED_SOURCE_RULES = Object.freeze({
  USDA_FDC: source => Boolean(source?.record_id),
  TACO_NEPA_UNICAMP: source => Boolean(
    source?.record_id
    && source?.edition === '4ª edição revisada e ampliada'
    && Number(source?.year) === 2011
  ),
  TBCA_USP_FORC: source => Boolean(
    source?.record_id
    && String(source?.version) === '7.3'
    && Number(source?.year) === 2025
  )
});

function hasCompleteNutrition(food) {
  const n = food?.nutrition;
  return n && ['energy_kcal', 'protein_g', 'carbohydrate_g', 'fat_g']
    .every(key => Number.isFinite(n[key]));
}

function isAcceptedSource(source) {
  if (!source || !VERIFIED_SOURCE_STATUSES.has(source.status)) return false;
  const rule = ACCEPTED_SOURCE_RULES[source.source_id];
  return typeof rule === 'function' && rule(source);
}

export function isValidatedFood(food) {
  const verifiedSource = Array.isArray(food?.sources)
    && food.sources.some(isAcceptedSource);
  return Boolean(verifiedSource && hasCompleteNutrition(food));
}

async function fetchDataset(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${path}`);
  return response.json();
}

async function fetchOptionalDataset(path) {
  try {
    return await fetchDataset(path);
  } catch (_) {
    return null;
  }
}

export async function loadFoodDatabase() {
  try {
    const core = await fetchDataset('./data/foods.json');
    const [taco, expansion, cheeses, beverages] = await Promise.all([
      fetchOptionalDataset('./data/foods-taco.json'),
      fetchOptionalDataset('./data/foods-3.3.json'),
      fetchOptionalDataset('./data/foods-cheese.json'),
      fetchOptionalDataset('./data/foods-beverages.json')
    ]);

    const datasets = [core, taco, expansion, cheeses, beverages].filter(Boolean);
    const foods = datasets.flatMap(data => Array.isArray(data.foods) ? data.foods : []);
    const validated = foods.filter(isValidatedFood);
    const quarantined = foods.filter(food => !isValidatedFood(food));
    const version = beverages?.version || cheeses?.version || expansion?.version || taco?.version || core.version || 'unknown';
    const status = datasets.length > 1 ? 'validated_multi_source_core' : (core.status || 'unknown');
    const notes = datasets.map(data => data.safety_note).filter(Boolean);

    return {
      version,
      status,
      safetyNote: notes.join(' '),
      foods,
      validated,
      quarantined
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
