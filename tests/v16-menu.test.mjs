import assert from 'node:assert/strict';
import { generateWeeklyPlan } from '../js/meals/generator.js';
import { isMealCompatible, mealPlanEligibility } from '../js/meals/substitutions.js';
import { isValidatedFood } from '../js/data/foods.js';

const profile = {
  meals: 4,
  preferences: 'brasileira',
  goal: 'recomp',
  intolerance: 'none',
  allergies: '',
  avoid: '',
  trainingTime: 'morning'
};

const week = generateWeeklyPlan(profile, new Date(2026, 8, 11, 12));
assert.equal(week.length, 7);
assert.equal(week[0].meals.length, 4);
assert.equal(week[0].meals[0].role, 'Pré-treino');
assert.equal(week[0].meals[1].role, 'Pós-treino');
for (const day of week) {
  for (const entry of day.meals) {
    assert.equal(Object.hasOwn(entry.meal, 'kcal'), false);
    assert.equal(/\b\d+\s*kcal\b/i.test(JSON.stringify(entry.meal)), false);
  }
}

const sixMeals = generateWeeklyPlan({ ...profile, meals: 6 }, new Date(2026, 8, 11, 12));
for (const day of sixMeals) {
  const snackIds = day.meals.filter(entry => entry.kind === 'snack').map(entry => entry.meal.id);
  assert.equal(new Set(snackIds).size, snackIds.length);
}

assert.equal(
  isMealCompatible(
    { title: 'Iogurte com fruta', components: ['iogurte', 'fruta'], flags: ['lactose'] },
    { ...profile, intolerance: 'lactose' }
  ),
  false
);

assert.equal(mealPlanEligibility({ ...profile, intolerance: 'fructose' }).allowed, false);
assert.equal(mealPlanEligibility({ ...profile, intolerance: 'other' }).allowed, false);
assert.equal(mealPlanEligibility({ ...profile, intolerance: 'none' }).allowed, true);

assert.equal(
  isValidatedFood({
    nutrition: { energy_kcal: null, protein_g: null, carbohydrate_g: null, fat_g: null },
    sources: [{ source_id: 'USDA_FDC', status: 'quarantined', record_id: null }]
  }),
  false
);

assert.equal(
  isValidatedFood({
    nutrition: { energy_kcal: 100, protein_g: 4, carbohydrate_g: 15, fat_g: 2 },
    sources: [{ source_id: 'USDA_FDC', status: 'verified', record_id: 'source-1' }]
  }),
  true
);

assert.equal(
  isValidatedFood({
    nutrition: { energy_kcal: 100, protein_g: 4, carbohydrate_g: 15, fat_g: 2 },
    sources: [{ source_id: 'UNLISTED_SOURCE', status: 'verified', record_id: 'source-1' }]
  }),
  false
);

console.log('NutriTouch V16 menu/data tests: OK');
