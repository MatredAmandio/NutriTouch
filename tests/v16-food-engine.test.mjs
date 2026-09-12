import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isValidatedFood } from '../js/data/foods.js';
import { buildFoodIndex, nutrientsFor, recipeNutrition, scaleRecipeToTarget } from '../js/meals/nutrition.js';
import { QUANTIFIED_RECIPES } from '../js/meals/quantified-library.js';
import { generateQuantifiedWeeklyPlan } from '../js/meals/quantified-generator.js';

const core = JSON.parse(await readFile(new URL('../data/foods.json', import.meta.url), 'utf8'));
const taco = JSON.parse(await readFile(new URL('../data/foods-taco.json', import.meta.url), 'utf8'));
const expansion = JSON.parse(await readFile(new URL('../data/foods-3.3.json', import.meta.url), 'utf8'));
const cheeses = JSON.parse(await readFile(new URL('../data/foods-cheese.json', import.meta.url), 'utf8'));
const foods = [...core.foods, ...taco.foods, ...expansion.foods, ...cheeses.foods];

assert.equal(core.version, '3.1.0');
assert.equal(core.foods.length, 27, 'base 3.1.0 should contain exactly 27 validated foods');
assert.equal(taco.version, '3.2.0');
assert.equal(taco.foods.length, 10, 'TACO bread supplement should contain 10 validated records');
assert.equal(expansion.version, '3.3.0');
assert.equal(expansion.foods.length, 15, 'priority expansion should contain exactly 15 validated foods');
assert.equal(cheeses.version, '3.4.0');
assert.equal(cheeses.foods.length, 6, 'cheese expansion should contain exactly 6 new validated cheeses');
assert.equal(foods.length, 58, 'combined validated food base should contain 58 foods');
assert.equal(new Set(foods.map(food => food.id)).size, foods.length, 'food ids must remain unique');
assert.ok(foods.every(isValidatedFood), 'every combined food must pass the accepted-source validation gate');
assert.ok(foods.every(food => food.sources?.some(source => source.record_id && source.status === 'validated')));

const frenchBread = taco.foods.find(food => food.id === 'TACO-2011-053');
assert.ok(frenchBread);
assert.deepEqual(
  [frenchBread.nutrition.energy_kcal, frenchBread.nutrition.protein_g, frenchBread.nutrition.carbohydrate_g, frenchBread.nutrition.fat_g],
  [300, 8.0, 58.6, 3.1]
);

const cariocaBeans = expansion.foods.find(food => food.id === 'TBCA-BRC0254T');
assert.ok(cariocaBeans);
assert.deepEqual(
  [cariocaBeans.nutrition.energy_kcal, cariocaBeans.nutrition.protein_g, cariocaBeans.nutrition.carbohydrate_g, cariocaBeans.nutrition.fat_g],
  [133, 9.61, 26.3, 0.81]
);
assert.equal(cariocaBeans.sources[0].source_id, 'TBCA_USP_FORC');
assert.equal(cariocaBeans.sources[0].record_id, 'BRC0254T');
assert.equal(cariocaBeans.sources[0].version, '7.3');
assert.equal(cariocaBeans.sources[0].year, 2025);

const wrongTbcaVersion = structuredClone(cariocaBeans);
wrongTbcaVersion.sources[0].version = '7.2';
assert.equal(isValidatedFood(wrongTbcaVersion), false, 'unaccepted TBCA versions must fail validation');

const cookedChicken = expansion.foods.find(food => food.id === 'TACO-2011-408');
assert.deepEqual(
  [cookedChicken.nutrition.energy_kcal, cookedChicken.nutrition.protein_g, cookedChicken.nutrition.carbohydrate_g, cookedChicken.nutrition.fat_g],
  [163, 31.5, 0, 3.2]
);
assert.equal(cookedChicken.name, 'Peito de frango sem pele cozido');

const grilledPatinho = expansion.foods.find(food => food.id === 'TACO-2011-377');
assert.deepEqual(
  [grilledPatinho.nutrition.energy_kcal, grilledPatinho.nutrition.protein_g, grilledPatinho.nutrition.carbohydrate_g, grilledPatinho.nutrition.fat_g],
  [219, 35.9, 0, 7.3]
);

const tuna = expansion.foods.find(food => food.id === 'TBCA-BRC0131E');
assert.equal(tuna.name, 'Atum cozido, drenado, sem óleo e sem sal');
assert.equal(/enlatad/i.test(tuna.name), false, 'TBCA cooked tuna must not be mislabeled as canned tuna');
assert.ok(tuna.allergens.includes('fish'));

const peanuts = expansion.foods.find(food => food.id === 'USDA-173806');
assert.deepEqual(
  [peanuts.nutrition.energy_kcal, peanuts.nutrition.protein_g, peanuts.nutrition.carbohydrate_g, peanuts.nutrition.fat_g],
  [587, 24.35, 21.26, 49.66]
);
assert.ok(peanuts.allergens.includes('peanut'));

const mozzarella = cheeses.foods.find(food => food.id === 'TBCA-BRC0059G');
assert.deepEqual(
  [mozzarella.nutrition.energy_kcal, mozzarella.nutrition.protein_g, mozzarella.nutrition.carbohydrate_g, mozzarella.nutrition.fat_g, mozzarella.nutrition.sodium_mg],
  [320, 23.8, 1.97, 24.1, 506]
);
assert.equal(mozzarella.sources[0].record_id, 'BRC0059G');

const prato = cheeses.foods.find(food => food.id === 'TBCA-BRC0064G');
assert.deepEqual(
  [prato.nutrition.energy_kcal, prato.nutrition.protein_g, prato.nutrition.carbohydrate_g, prato.nutrition.fat_g, prato.nutrition.sodium_mg],
  [346, 24.2, 0.20, 27.6, 550]
);

const parmesan = cheeses.foods.find(food => food.id === 'TBCA-BRC0060G');
assert.deepEqual(
  [parmesan.nutrition.energy_kcal, parmesan.nutrition.protein_g, parmesan.nutrition.carbohydrate_g, parmesan.nutrition.fat_g, parmesan.nutrition.sodium_mg],
  [448, 31.9, 2.48, 35.0, 1662]
);

const cottage = cheeses.foods.find(food => food.id === 'TBCA-BRC0158G');
assert.deepEqual(
  [cottage.nutrition.energy_kcal, cottage.nutrition.protein_g, cottage.nutrition.carbohydrate_g, cottage.nutrition.fat_g, cottage.nutrition.sodium_mg],
  [116, 9.70, 3.20, 7.10, 290]
);

const coalho = cheeses.foods.find(food => food.id === 'TBCA-BRC0048G');
assert.deepEqual(
  [coalho.nutrition.energy_kcal, coalho.nutrition.protein_g, coalho.nutrition.carbohydrate_g, coalho.nutrition.fat_g, coalho.nutrition.sodium_mg],
  [335, 23.7, 1.94, 25.9, 526]
);

const meiaCura = cheeses.foods.find(food => food.id === 'TBCA-BRC0154G');
assert.deepEqual(
  [meiaCura.nutrition.energy_kcal, meiaCura.nutrition.protein_g, meiaCura.nutrition.carbohydrate_g, meiaCura.nutrition.fat_g, meiaCura.nutrition.sodium_mg],
  [321, 21.2, 3.60, 24.6, 501]
);

assert.ok(cheeses.foods.every(food => food.sources[0].source_id === 'TBCA_USP_FORC'));
assert.ok(cheeses.foods.every(food => food.sources[0].version === '7.3' && food.sources[0].year === 2025));
assert.ok(cheeses.foods.every(food => food.allergens.includes('milk')), 'all validated dairy cheeses must carry the milk allergen');
assert.ok(cheeses.foods.every(food => food.diet_compatibility.vegan === 'not_allowed'));
assert.ok(cheeses.foods.every(food => food.diet_compatibility.vegetarian === 'unknown_requires_ingredient_check'), 'rennet suitability must not be assumed from macros');
assert.ok(cheeses.foods.every(food => food.diet_compatibility.lactose_free === 'unknown_requires_ingredient_check'), 'lactose-free status must not be inferred from cheese type');

const rawCheeseBread = taco.foods.find(food => food.id === 'TACO-2011-141');
assert.equal(rawCheeseBread.food_state, 'raw');
assert.ok(!QUANTIFIED_RECIPES.some(recipe => recipe.ingredients.some(item => item.foodId === rawCheeseBread.id)), 'raw cheese bread must not be offered in quantified meals');

const glutenBread = taco.foods.find(food => food.id === 'TACO-2011-050');
assert.equal(glutenBread.diet_compatibility.gluten_free, 'not_allowed');
assert.ok(glutenBread.allergens.includes('gluten'));

const index = buildFoodIndex(foods);
assert.ok(QUANTIFIED_RECIPES.length >= 95, 'expanded quantified library should contain at least 95 recipes');
assert.equal(new Set(QUANTIFIED_RECIPES.map(recipe => recipe.id)).size, QUANTIFIED_RECIPES.length, 'quantified recipe ids must be unique');
assert.ok(QUANTIFIED_RECIPES.every(recipe => recipe.ingredients.every(item => index.has(item.foodId))), 'every quantified recipe ingredient must exist in the validated food base');
assert.ok(QUANTIFIED_RECIPES.some(recipe => recipe.ingredients.some(item => item.foodId.startsWith('TBCA-'))), 'quantified library should use validated TBCA foods');
assert.ok(QUANTIFIED_RECIPES.some(recipe => recipe.ingredients.some(item => item.foodId === 'USDA-173806')), 'quantified library should use validated unsalted peanuts');

const cheeseIds = new Set(cheeses.foods.map(food => food.id));
for (const cheeseId of cheeseIds) {
  assert.ok(QUANTIFIED_RECIPES.some(recipe => recipe.ingredients.some(item => item.foodId === cheeseId)), `${cheeseId} should be used by at least one quantified recipe`);
}

const rice = index.get('USDA-169704');
const rice150 = nutrientsFor(rice, 150);
assert.ok(Math.abs(rice150.energy_kcal - 184.5) < 0.01);
assert.ok(Math.abs(rice150.protein_g - 4.11) < 0.01);

const beans80 = nutrientsFor(cariocaBeans, 80);
assert.ok(Math.abs(beans80.energy_kcal - 106.4) < 0.01);
assert.ok(Math.abs(beans80.protein_g - 7.688) < 0.01);

const mozzarella40 = nutrientsFor(mozzarella, 40);
assert.ok(Math.abs(mozzarella40.energy_kcal - 128) < 0.01);
assert.ok(Math.abs(mozzarella40.protein_g - 9.52) < 0.01);

const lunch = QUANTIFIED_RECIPES.find(recipe => recipe.id === 'q-l19');
const lunchNutrition = recipeNutrition(lunch, index);
assert.ok(lunchNutrition?.nutrients.energy_kcal > 450);
assert.ok(lunchNutrition?.nutrients.protein_g > 40);

const cheeseLunch = QUANTIFIED_RECIPES.find(recipe => recipe.id === 'q-l24');
const cheeseLunchNutrition = recipeNutrition(cheeseLunch, index);
assert.ok(cheeseLunchNutrition?.nutrients.energy_kcal > 500);
assert.ok(cheeseLunchNutrition?.nutrients.protein_g > 45);

const scaled = scaleRecipeToTarget(lunch, 650, index);
assert.ok(scaled.nutrients.energy_kcal > 0);
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
assert.ok(QUANTIFIED_RECIPES.filter(recipe => recipe.styles?.includes('brasileira')).some(recipe => recipe.ingredients.some(item => cheeseIds.has(item.foodId))), 'Brazilian quantified library should contain validated cheese options');
const brazilianMainTitles = brazilianMeals.filter(meal => ['lunch','dinner'].includes(meal.kind)).map(meal => meal.meal.title).join(' | ');
const proteinFamilies = [
  /frango/i.test(brazilianMainTitles) && 'chicken',
  /tilápia|sardinha|atum/i.test(brazilianMainTitles) && 'fish',
  /carne|bife|patinho/i.test(brazilianMainTitles) && 'beef',
  /ovo/i.test(brazilianMainTitles) && 'egg'
].filter(Boolean);
assert.ok(new Set(proteinFamilies).size >= 3, 'Brazilian week should rotate through multiple animal protein families');

const vegetarianWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'vegetariana' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(vegetarianWeek.length, 7);
assert.ok(vegetarianWeek.flatMap(day => day.meals).every(meal => !/frango|tilápia|sardinha|atum|carne|bife|patinho/i.test(meal.meal.title)));
assert.ok(vegetarianWeek.flatMap(day => day.meals).every(meal => !meal.ingredients.some(item => cheeseIds.has(item.foodId))), 'new cheeses with unverified rennet suitability must not be assumed vegetarian');

const veganWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'vegana' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(veganWeek.length, 7);
assert.ok(veganWeek.flatMap(day => day.meals).every(meal => !/frango|ovo|iogurte|leite|queijo|ricota|cottage|muçarela|tilápia|sardinha|atum|carne|bife|patinho/i.test(meal.meal.title)));
assert.ok(veganWeek.flatMap(day => day.meals).every(meal => !meal.ingredients.some(item => cheeseIds.has(item.foodId))));

const lactoseWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, intolerance: 'lactose' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(lactoseWeek.length, 7);
assert.ok(lactoseWeek.flatMap(day => day.meals).every(meal => !meal.meal.flags.some(flag => ['lactose','lactose_unknown'].includes(flag))));
assert.ok(lactoseWeek.flatMap(day => day.meals).every(meal => !meal.ingredients.some(item => cheeseIds.has(item.foodId))), 'cheeses without validated lactose-free status must be excluded for lactose intolerance');

const milkAllergyWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, allergies: 'milk' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(milkAllergyWeek.length, 7);
assert.ok(milkAllergyWeek.flatMap(day => day.meals).every(meal => !meal.ingredients.some(item => cheeseIds.has(item.foodId))), 'milk-allergy free-text filtering must exclude cheese allergens');

const glutenFreeWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, preferences: 'sem-gluten' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(glutenFreeWeek.length, 7);
assert.ok(glutenFreeWeek.flatMap(day => day.meals).every(meal => !meal.meal.flags.some(flag => ['gluten','gluten_unknown','oats'].includes(flag))));
assert.ok(glutenFreeWeek.flatMap(day => day.meals).every(meal => !meal.ingredients.some(item => cheeseIds.has(item.foodId))), 'cheese gluten status is kept conservative until ingredient/cross-contact evidence exists');

const peanutAvoidWeek = generateQuantifiedWeeklyPlan({ ...baseProfile, avoid: 'amendoim' }, foods, 1900, new Date('2026-09-14T12:00:00'));
assert.equal(peanutAvoidWeek.length, 7);
assert.ok(peanutAvoidWeek.flatMap(day => day.meals).every(meal => !meal.ingredients.some(item => item.foodId === 'USDA-173806')));

console.log('V16 food engine tests passed');
