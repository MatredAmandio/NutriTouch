import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isValidatedFood } from '../js/data/foods.js';
import { buildFoodIndex, nutrientsFor, recipeNutrition, scaleRecipeToTarget } from '../js/meals/nutrition.js';
import { QUANTIFIED_RECIPES } from '../js/meals/quantified-recipes.js';
import { generateQuantifiedWeeklyPlan } from '../js/meals/quantified-generator.js';

const core = JSON.parse(await readFile(new URL('../data/foods.json', import.meta.url), 'utf8'));
const taco = JSON.parse(await readFile(new URL('../data/foods-taco.json', import.meta.url), 'utf8'));
const foods = [...core.foods, ...taco.foods];

assert.equal(core.version, '3.1.0');
assert.equal(core.foods.length, 27, 'base 3.1.0 should contain exactly 27 validated foods');
assert.equal(taco.version, '3.2.0');
assert.equal(taco.foods.length, 10, 'TACO supplement should contain 10 validated bread records');
assert.equal(foods.length, 37, 'combined validated food base should contain 37 foods');
assert.ok(foods.every(isValidatedFood), 'every combined food must pass the accepted-source validation gate');
assert.ok(foods.every(food => food.sources?.some(source => source.record_id && source.status === 'validated')));

const frenchBread = taco.foods.find(food => food.id === 'TACO-2011-053');
assert.ok(frenchBread);
assert.deepEqual(
  [frenchBread.nutrition.energy_kcal, frenchBread.nutrition.protein_g, frenchBread.nutrition.carbohydrate_g, frenchBread.nutrition.fat_g],
  [300, 8.0, 58.6, 3.1]
);
assert.equal(frenchBread.sources[0].source_id, 'TACO_NEPA_UNICAMP');
assert.equal(frenchBread.sources[0].record_id, '53');
assert.equal(frenchBread.sources[0].edition, '4ª edição revisada e ampliada');
assert.equal(frenchBread.sources[0].year, 2011);

const wrongEdition = structuredClone(frenchBread);
wrongEdition.sources[0].edition = 'edição não aceita';
assert.equal(isValidatedFood(wrongEdition), false, 'TACO records from an unaccepted edition must fail validation');

const rawCheeseBread = taco.foods.find(food => food.id === 'TACO-2011-141');
assert.equal(rawCheeseBread.food_state, 'raw');
assert.ok(!QUANTIFIED_RECIPES.some(recipe => recipe.ingredients.some(item => item.foodId === rawCheeseBread.id)), 'raw cheese bread must not be offered in quantified meals');

const glutenBread = taco.foods.find(food => food.id === 'TACO-2011-050');
assert.equal(glutenBread.diet_compatibility.gluten_free, 'not_allowed');
assert.ok(glutenBread.allergens.includes('gluten'));

const index = buildFoodIndex(foods);
assert.ok(QUANTIFIED_RECIPES.length >= 60, 'expanded quantified library should contain at least 60 recipes');
assert.equal(new Set(QUANTIFIED_RECIPES.map(recipe => recipe.id)).size, QUANTIFIED_RECIPES.length, 'quantified recipe ids must be unique');
assert.ok(QUANTIFIED_RECIPES.every(recipe => recipe.ingredients.every(item => index.has(item.foodId))), 'every quantified recipe ingredient must exist in the combined validated food base');

const rice = index.get('USDA-169704');
const rice150 = nutrientsFor(rice, 150);
assert.ok(Math.abs(rice150.energy_kcal - 184.5) < 0.01);
assert.ok(Math.abs(rice150.protein_g - 4.11) < 0.01);

const bread70 = nutrientsFor(frenchBread, 70);
assert.ok(Math.abs(bread70.energy_kcal - 210) < 0.01);
assert.ok(Math.abs(bread70.protein_g - 5.6) < 0.01);

const lunch = QUANTIFIED_RECIPES.find(recipe => recipe.id === 'q-l1');
const lunchNutrition = recipeNutrition(lunch, index);
assert.ok(lunchNutrition?.nutrients.energy_kcal > 450);
assert.ok(lunchNutrition?.nutrients.protein_g > 40);

const breadBreakfast = QUANTIFIED_RECIPES.find(recipe => recipe.id === 'q-b11');
const breadBreakfastNutrition = recipeNutrition(breadBreakfast, index);
assert.ok(breadBreakfastNutrition?.nutrients.energy_kcal > 300);
assert.ok(breadBreakfastNutrition?.nutrients.protein_g > 15);

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
const week = generateQuantifiedWeeklyPlan(baseProfile, foods, 2000, new Date('2026-09-14T12:00:00'));
assert.equal(week.length, 7);
assert.ok(week.every(day => day.nutrientStatus === 'validated-food-calculation'));
assert.ok(week.every(day => day.meals.length === 4));
assert.ok(week.every(day => day.meals.every(meal => meal.nutrients?.energy_kcal > 0)));
assert.ok(week.every(day => day.meals.every(meal => meal.meal.components.every(component => /^\d+ g /.test(component)))));

const brazilianMeals = week.flatMap(day => day.meals);
assert.ok(brazilianMeals.every(meal => !/tofu/i.test(meal.meal.title)), 'Brazilian style should not be dominated by tofu recipes');
const brazilianMainTitles = brazilianMeals.filter(meal => ['lunch','dinner'].includes(meal.kind)).map(meal => meal.meal.title).join(' | ');
const proteinFamilies = [
  /frango/i.test(brazilianMainTitles) && 'chicken',
  /tilápia|sardinha/i.test(brazilianMainTitles) && 'fish',
  /carne|bife/i.test(brazilianMainTitles) && 'beef',
  /ovo/i.test(brazilianMainTitles) && 'egg'
].filter(Boolean);
assert.ok(new Set(proteinFamilies).size >= 3, 'Brazilian week should rotate through multiple animal protein families');
assert.ok(QUANTIFIED_RECIPES.some(recipe => recipe.styles?.includes('brasileira') && recipe.ingredients.some(item => item.foodId.startsWith('TACO-2011-'))), 'Brazilian recipe library should use validated TACO breads');

const vegetarianWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'vegetariana' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(vegetarianWeek.length, 7);
assert.ok(vegetarianWeek.flatMap(day => day.meals).every(meal => !/frango|tilápia|sardinha|carne|bife/i.test(meal.meal.title)));
assert.ok(vegetarianWeek.flatMap(day => day.meals).every(meal => !meal.ingredients?.some(item => item.foodId?.startsWith('TACO-2011-'))), 'unverified TACO bread ingredient profiles must not be assumed vegetarian');

const veganWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'vegana' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(veganWeek.length, 7);
assert.ok(veganWeek.flatMap(day => day.meals).every(meal => !/frango|ovo|iogurte|tilápia|sardinha|carne|bife/i.test(meal.meal.title)));
assert.ok(veganWeek.flatMap(day => day.meals).every(meal => !meal.ingredients?.some(item => item.foodId?.startsWith('TACO-2011-'))), 'unverified TACO bread ingredient profiles must not be assumed vegan');

const lactoseWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, intolerance: 'lactose' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(lactoseWeek.length, 7);
assert.ok(lactoseWeek.flatMap(day => day.meals).every(meal => !/iogurte/i.test(meal.meal.title)));
assert.ok(lactoseWeek.flatMap(day => day.meals).every(meal => !meal.ingredients?.some(item => item.foodId?.startsWith('TACO-2011-'))), 'TACO breads with unverified lactose status must be excluded for lactose intolerance');

const glutenFreeWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'sem-gluten' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(glutenFreeWeek.length, 7);
assert.ok(glutenFreeWeek.flatMap(day => day.meals).every(meal => !/aveia/i.test(meal.meal.title)));
assert.ok(glutenFreeWeek.flatMap(day => day.meals).every(meal => !meal.ingredients?.some(item => item.foodId?.startsWith('TACO-2011-'))), 'TACO breads without proven gluten-free status must be excluded from gluten-restricted plans');

console.log('V16 food engine tests passed');
