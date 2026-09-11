const VERIFIED_SOURCE_STATUSES = new Set(['validated', 'verified', 'approved']);

const ACCEPTED_SOURCE_RULES = Object.freeze({
  USDA_FDC: source => Boolean(source?.record_id),
  TACO_NEPA_UNICAMP: source => Boolean(
    source?.record_id
    && source?.edition === '4ª edição revisada e ampliada'
    && Number(source?.year) === 2011
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

export async function loadFoodDatabase() {
  try {
    const core = await fetchDataset('./data/foods.json');
    let taco = null;
    try {
      taco = await fetchDataset('./data/foods-taco.json');
    } catch (_) {
      taco = null;
    }

    const datasets = [core, taco].filter(Boolean);
    const foods = datasets.flatMap(data => Array.isArray(data.foods) ? data.foods : []);
    const validated = foods.filter(isValidatedFood);
    const quarantined = foods.filter(food => !isValidatedFood(food));
    const version = taco?.version || core.version || 'unknown';
    const status = taco ? 'validated_multi_source_core' : (core.status || 'unknown');
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
