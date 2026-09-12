const recipe = (id, title, kind, ingredients, options = {}) => ({
  id, title, kind, ingredients,
  diets: options.diets || ['omnivore'],
  flags: options.flags || [],
  styles: options.styles || []
});

export const QUANTIFIED_CHEESE_RECIPES = [
  // Café da manhã
  recipe('q-b24','Pão francês com muçarela e laranja','breakfast',[
    {foodId:'TACO-2011-053',grams:60},{foodId:'TBCA-BRC0059G',grams:40},{foodId:'TBCA-BRC0020C',grams:140}
  ],{diets:['omnivore'],flags:['gluten','milk','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b25','Tapioca com queijo Minas frescal e tomate','breakfast',[
    {foodId:'TBCA-BRC0906B',grams:60},{foodId:'TBCA-BRC0052G',grams:50},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['milk','lactose','gluten_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b26','Cuscuz de milho com queijo coalho e mamão','breakfast',[
    {foodId:'TBCA-BRC0409A',grams:180},{foodId:'TBCA-BRC0048G',grams:40},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore'],flags:['milk','lactose_unknown','gluten_unknown'],styles:['brasileira']}),
  recipe('q-b27','Pão integral com cottage e maçã','breakfast',[
    {foodId:'TACO-2011-052',grams:60},{foodId:'TBCA-BRC0158G',grams:70},{foodId:'TBCA-BRC0023C',grams:130}
  ],{diets:['omnivore'],flags:['gluten','milk','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b28','Pão francês com Minas meia cura e laranja','breakfast',[
    {foodId:'TACO-2011-053',grams:60},{foodId:'TBCA-BRC0154G',grams:40},{foodId:'TBCA-BRC0020C',grams:140}
  ],{diets:['omnivore'],flags:['gluten','milk','lactose_unknown'],styles:['brasileira']}),
  recipe('q-b29','Pão integral com queijo prato e tomate','breakfast',[
    {foodId:'TACO-2011-052',grams:60},{foodId:'TBCA-BRC0064G',grams:40},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['gluten','milk','lactose_unknown'],styles:['brasileira']}),

  // Lanches e ceias
  recipe('q-s17','Cottage com maçã','snack',[
    {foodId:'TBCA-BRC0158G',grams:100},{foodId:'TBCA-BRC0023C',grams:130}
  ],{diets:['omnivore'],flags:['milk','lactose_unknown','gluten_unknown'],styles:['brasileira','fitness']}),
  recipe('q-s18','Queijo prato com laranja','snack',[
    {foodId:'TBCA-BRC0064G',grams:40},{foodId:'TBCA-BRC0020C',grams:140}
  ],{diets:['omnivore'],flags:['milk','lactose_unknown','gluten_unknown'],styles:['brasileira']}),
  recipe('q-s19','Torrada de pão francês com muçarela e tomate','snack',[
    {foodId:'TACO-2011-063',grams:40},{foodId:'TBCA-BRC0059G',grams:40},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['milk','lactose_unknown','gluten_unknown'],styles:['brasileira','fitness']}),
  recipe('q-s20','Queijo Minas frescal com mamão','snack',[
    {foodId:'TBCA-BRC0052G',grams:50},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore'],flags:['milk','lactose','gluten_unknown'],styles:['brasileira']}),
  recipe('q-s21','Pão integral com ricota e tomate','snack',[
    {foodId:'TACO-2011-052',grams:45},{foodId:'TBCA-BRC0051G',grams:70},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['gluten','milk','lactose'],styles:['brasileira','fitness']}),
  recipe('q-s22','Minas meia cura com maçã','snack',[
    {foodId:'TBCA-BRC0154G',grams:40},{foodId:'TBCA-BRC0023C',grams:130}
  ],{diets:['omnivore'],flags:['milk','lactose_unknown','gluten_unknown'],styles:['brasileira']}),

  // Almoço e jantar
  recipe('q-l24','Macarrão com frango, tomate e parmesão','lunch',[
    {foodId:'TBCA-BRC0834A',grams:220},{foodId:'TACO-2011-408',grams:130},{foodId:'USDA-170457',grams:120},{foodId:'TBCA-BRC0060G',grams:20},{foodId:'TBCA-BRC0002D',grams:5}
  ],{diets:['omnivore'],flags:['meat','gluten','milk','lactose_unknown'],styles:['brasileira','mediterranea','fitness']}),
  recipe('q-d19','Frango, batata, muçarela e tomate','dinner',[
    {foodId:'TACO-2011-408',grams:120},{foodId:'USDA-170440',grams:180},{foodId:'TBCA-BRC0059G',grams:40},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['meat','milk','lactose_unknown','gluten_unknown'],styles:['brasileira','fitness']}),
  recipe('q-d20','Macarrão com atum, tomate e parmesão','dinner',[
    {foodId:'TBCA-BRC0834A',grams:180},{foodId:'TBCA-BRC0131E',grams:120},{foodId:'USDA-170457',grams:100},{foodId:'TBCA-BRC0060G',grams:20},{foodId:'TBCA-BRC0002D',grams:5}
  ],{diets:['omnivore'],flags:['fish','gluten','milk','lactose_unknown'],styles:['brasileira','mediterranea','fitness']})
];
