import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isValidatedFood } from '../js/data/foods.js';
import { buildFoodIndex, nutrientsFor, recipeNutrition, scaleRecipeToTarget } from '../js/meals/nutrition.js';
import { QUANTIFIED_RECIPES } from '../js/meals/quantified-recipes.js';
import { generateQuantifiedWeeklyPlan } from '../js/meals/quantified-generator.js';

const db = JSON.parse(await readFile(new URL('../data/foods.json', import.meta.url), 'utf8'));
assert.ok(db.foods.length >= 12, 'starter core should contain at least 12 foods');
assert.ok(db.foods.every(isValidatedFood), 'every starter core food must be calculation-eligible');
assert.ok(db.foods.every(food => food.sources?.some(source => source.record_id && source.status === 'validated')));

const index = buildFoodIndex(db.foods);
const rice = index.get('USDA-169704');
const rice150 = nutrientsFor(rice, 150);
assert.ok(Math.abs(rice150.energy_kcal - 184.5) < 0.01);
assert.ok(Math.abs(rice150.protein_g - 4.11) < 0.01);

const lunch = QUANTIFIED_RECIPES.find(recipe => recipe.id === 'q-l1');
const lunchNutrition = recipeNutrition(lunch, index);
assert.ok(lunchNutrition?.nutrients.energy_kcal > 450);
assert.ok(lunchNutrition?.nutrients.protein_g > 40);

const scaled = scaleRecipeToTarget(lunch, 650, index);
assert.ok(scaled.nutrients.energy_kcal > lunchNutrition.nutrients.energy_kcal);
assert.ok(scaled.ingredients.every(item => item.grams % 5 === 0));

const baseProfile = {
  meals: 4,
  preferences: 'brasileira',
  goal: 'recomp',
  trainingTime: 'afternoon',
  intolerance: 'none',
  avoid: '',
  allergies: ''
};
const week = generateQuantifiedWeeklyPlan(baseProfile, db.foods, 2000, new Date('2026-09-14T12:00:00'));
assert.equal(week.length, 7);
assert.ok(week.every(day => day.nutrientStatus === 'validated-food-calculation'));
assert.ok(week.every(day => day.meals.length === 4));
assert.ok(week.every(day => day.meals.every(meal => meal.nutrients?.energy_kcal > 0)));
assert.ok(week.every(day => day.meals.every(meal => meal.meal.components.every(component => /^\d+ g /.test(component)))));

const veganWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'vegana' }, db.foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(veganWeek.length, 7);
assert.ok(veganWeek.flatMap(day => day.meals).every(meal => !/frango|ovo|iogurte/i.test(meal.meal.title)));

const lactoseWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, intolerance: 'lactose' }, db.foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(lactoseWeek.length, 7);
assert.ok(lactoseWeek.flatMap(day => day.meals).every(meal => !/iogurte/i.test(meal.meal.title)));

const glutenFreeWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'sem-gluten' }, db.foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(glutenFreeWeek.length, 7);
assert.ok(glutenFreeWeek.flatMap(day => day.meals).every(meal => !/aveia/i.test(meal.meal.title)));

console.log('V16 food engine tests passed');
