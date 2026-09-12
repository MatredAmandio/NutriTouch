import { QUANTIFIED_RECIPES as CORE_RECIPES } from './quantified-recipes.js';
import { QUANTIFIED_RECIPES_3_3 } from './quantified-recipes-3.3.js';
import { QUANTIFIED_CHEESE_RECIPES } from './quantified-recipes-cheese.js';
import { QUANTIFIED_BEVERAGE_RECIPES } from './quantified-recipes-beverages.js';

export const QUANTIFIED_RECIPES = Object.freeze([
  ...CORE_RECIPES,
  ...QUANTIFIED_RECIPES_3_3,
  ...QUANTIFIED_CHEESE_RECIPES,
  ...QUANTIFIED_BEVERAGE_RECIPES
]);
