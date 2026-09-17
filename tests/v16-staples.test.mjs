import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateQuantifiedWeeklyPlan } from '../js/meals/quantified-generator.js';

const files = ['foods.json', 'foods-taco.json', 'foods-3.3.json', 'foods-cheese.json', 'foods-beverages.json'];
const datasets = await Promise.all(files.map(file => readFile(new URL(`../data/${file}`, import.meta.url), 'utf8').then(JSON.parse)));
const foods = datasets.flatMap(data => data.foods || []);

const baseProfile = {
  meals: 4,
  preferences: 'brasileira',
  goal: 'recomp',
  trainingTime: 'afternoon',
  intolerance: 'none',
  avoid: '',
  allergies: ''
};

const profile = {
  ...baseProfile,
  staples: [
    { foodId: 'TACO-2011-053', meal: 'breakfast', frequency: 7, mode: 'fixed', grams: 50 },
    { foodId: 'TBCA-BRC0007H', meal: 'breakfast', frequency: 7, mode: 'adjust', grams: null }
  ]
};

const week = generateQuantifiedWeeklyPlan(profile, foods, 2000, new Date('2026-09-14T12:00:00'));
assert.equal(week.length, 7);

for (const day of week) {
  const breakfast = day.meals.find(meal => meal.kind === 'breakfast');
  assert.ok(breakfast, 'breakfast must exist');

  const bread = breakfast.ingredients.find(item => item.foodId === 'TACO-2011-053' && item.isStaple);
  assert.ok(bread, 'fixed French bread must be kept at breakfast every day');
  assert.equal(bread.grams, 50, 'fixed indispensable quantity must be preserved');

  const coffee = breakfast.ingredients.find(item => item.foodId === 'TBCA-BRC0007H' && item.isStaple);
  assert.ok(coffee, 'validated coffee must be kept at breakfast every day');
  assert.equal(coffee.grams, 200, 'adjustable beverage should use its validated household measure');

  assert.ok(day.nutrients.energy_kcal > 1600, 'daily plan should remain nutritionally populated after reserving staples');
  assert.ok(day.nutrients.energy_kcal < 2200, 'daily plan should stay close to the 2000 kcal target after reserving staples');
}

const threeTimes = generateQuantifiedWeeklyPlan({
  ...baseProfile,
  staples: [{ foodId: 'USDA-169926', meal: 'snack', frequency: 3, mode: 'adjust', grams: null }]
}, foods, 1900, new Date('2026-09-14T12:00:00'));

const papayaDays = threeTimes.filter(day => day.meals.some(meal => meal.ingredients.some(item => item.foodId === 'USDA-169926' && item.isStaple)));
assert.equal(papayaDays.length, 3, 'weekly indispensable frequency must be respected');

const explicitlyBlocked = generateQuantifiedWeeklyPlan({
  ...baseProfile,
  preferences: 'vegana',
  staples: [{ foodId: 'TBCA-BRC0059G', meal: 'breakfast', frequency: 7, mode: 'fixed', grams: 40 }]
}, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.ok(explicitlyBlocked.every(day => day.meals.every(meal => !meal.ingredients.some(item => item.foodId === 'TBCA-BRC0059G' && item.isStaple))), 'explicit not_allowed restrictions must override indispensable foods');

console.log('V16 indispensable foods tests passed');
