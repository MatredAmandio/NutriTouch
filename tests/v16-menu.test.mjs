import assert from 'node:assert/strict';
import { generateWeeklyPlan } from '../js/meals/generator.js';
import { isMealCompatible } from '../js/meals/substitutions.js';
import { isValidatedFood } from '../js/data/foods.js';

const profile = {
  meals: 4,
  preferences: 'brasileira',
  goal: 'recomp',
  intolerance: 'none',
  allergies: '',
  avoid: ''
};

const week = generateWeeklyPlan(profile, new Date(2026, 8, 11, 12));
assert.equal(week.length, 7);
assert.equal(week[0].meals.length, 4);
for (const day of week) {
  for (const entry of day.meals) {
    assert.equal(Object.hasOwn(entry.meal, 'kcal'), false);
    assert.equal(/\b\d+\s*kcal\b/i.test(JSON.stringify(entry.meal)), false);
  }
}

assert.equal(
  isMealCompatible(
    { title: 'Iogurte com fruta', components: ['iogurte', 'fruta'], flags: ['lactose'] },
    { ...profile, intolerance: 'lactose' }
  ),
  false
);

assert.equal(
  isValidatedFood({
    nutrition: { energy_kcal: null, protein_g: null, carbohydrate_g: null, fat_g: null },
    sources: [{ status: 'quarantined', record_id: null }]
  }),
  false
);

assert.equal(
  isValidatedFood({
    nutrition: { energy_kcal: 100, protein_g: 4, carbohydrate_g: 15, fat_g: 2 },
    sources: [{ status: 'verified', record_id: 'source-1' }]
  }),
  true
);

console.log('NutriTouch V16 menu/data tests: OK');
