const recipe = (id, title, kind, ingredients, options = {}) => ({
  id, title, kind, ingredients,
  diets: options.diets || ['omnivore'],
  flags: options.flags || [],
  styles: options.styles || []
});

export const QUANTIFIED_BEVERAGE_RECIPES = [
  recipe('q-b30','Pão francês com queijo Minas, mamão e café','breakfast',[
    {foodId:'TACO-2011-053',grams:60},
    {foodId:'TBCA-BRC0052G',grams:50},
    {foodId:'USDA-169926',grams:120},
    {foodId:'TBCA-BRC0007H',grams:200}
  ],{diets:['omnivore'],flags:['gluten','milk','lactose'],styles:['brasileira','fitness']}),

  recipe('q-b31','Pão integral com ovos, tomate e café','breakfast',[
    {foodId:'TACO-2011-052',grams:60},
    {foodId:'USDA-173424',grams:100},
    {foodId:'USDA-170457',grams:100},
    {foodId:'TBCA-BRC0007H',grams:200}
  ],{diets:['omnivore'],flags:['egg','gluten','lactose_unknown'],styles:['brasileira','fitness']}),

  recipe('q-b32','Pão de milho com queijo coalho, mamão e chá mate','breakfast',[
    {foodId:'TACO-2011-051',grams:60},
    {foodId:'TBCA-BRC0048G',grams:40},
    {foodId:'USDA-169926',grams:120},
    {foodId:'TBCA-BRC0011H',grams:200}
  ],{diets:['omnivore'],flags:['milk','lactose_unknown','gluten_unknown'],styles:['brasileira']}),

  recipe('q-b33','Pão de aveia com ricota, maçã e chá preto','breakfast',[
    {foodId:'TACO-2011-048',grams:60},
    {foodId:'TBCA-BRC0051G',grams:70},
    {foodId:'TBCA-BRC0023C',grams:130},
    {foodId:'TBCA-BRC0013H',grams:200}
  ],{diets:['omnivore'],flags:['milk','lactose','gluten_unknown'],styles:['brasileira','fitness']}),

  recipe('q-b34','Pão francês com muçarela, laranja e café','breakfast',[
    {foodId:'TACO-2011-053',grams:60},
    {foodId:'TBCA-BRC0059G',grams:40},
    {foodId:'TBCA-BRC0020C',grams:140},
    {foodId:'TBCA-BRC0007H',grams:200}
  ],{diets:['omnivore'],flags:['gluten','milk','lactose_unknown'],styles:['brasileira']}),

  recipe('q-b35','Pão sovado com ovos, mamão e chá de ervas','breakfast',[
    {foodId:'TACO-2011-054',grams:60},
    {foodId:'USDA-173424',grams:100},
    {foodId:'USDA-169926',grams:120},
    {foodId:'TBCA-BRC0015H',grams:200}
  ],{diets:['omnivore'],flags:['egg','gluten','lactose_unknown'],styles:['brasileira']})
];
