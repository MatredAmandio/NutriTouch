const recipe = (id, title, kind, ingredients, options = {}) => ({
  id, title, kind, ingredients,
  diets: options.diets || ['omnivore'],
  flags: options.flags || [],
  styles: options.styles || []
});

export const QUANTIFIED_RECIPES_3_3 = [
  // Café da manhã
  recipe('q-b19','Tapioca com ovos e mamão','breakfast',[
    {foodId:'TBCA-BRC0906B',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore','vegetarian'],flags:['egg','gluten_unknown'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-b20','Cuscuz de milho com ovos e tomate','breakfast',[
    {foodId:'TBCA-BRC0409A',grams:180},{foodId:'USDA-173424',grams:100},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg','gluten_unknown'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-b21','Leite integral com banana e aveia','breakfast',[
    {foodId:'TBCA-BRC0044G',grams:240},{foodId:'USDA-173944',grams:100},{foodId:'USDA-173905',grams:120}
  ],{diets:['omnivore','vegetarian'],flags:['lactose','oats','milk'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-b22','Pão francês com queijo Minas e laranja','breakfast',[
    {foodId:'TACO-2011-053',grams:60},{foodId:'TBCA-BRC0052G',grams:50},{foodId:'TBCA-BRC0020C',grams:140}
  ],{diets:['omnivore'],flags:['gluten','lactose','milk'],styles:['brasileira']}),
  recipe('q-b23','Tapioca com ricota e tomate','breakfast',[
    {foodId:'TBCA-BRC0906B',grams:70},{foodId:'TBCA-BRC0051G',grams:70},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['lactose','milk','gluten_unknown'],styles:['brasileira','fitness']}),

  // Almoço
  recipe('q-l19','Frango cozido, arroz branco, feijão carioca e beterraba','lunch',[
    {foodId:'TACO-2011-408',grams:140},{foodId:'USDA-169757',grams:150},{foodId:'TBCA-BRC0254T',grams:100},{foodId:'TBCA-BRC0912B',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l20','Patinho, arroz integral, feijão carioca e beterraba','lunch',[
    {foodId:'TACO-2011-377',grams:130},{foodId:'USDA-169704',grams:140},{foodId:'TBCA-BRC0254T',grams:100},{foodId:'TBCA-BRC0912B',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l21','Atum cozido, arroz branco, feijão carioca e tomate','lunch',[
    {foodId:'TBCA-BRC0131E',grams:150},{foodId:'USDA-169757',grams:150},{foodId:'TBCA-BRC0254T',grams:100},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea','fitness']}),
  recipe('q-l22','Macarrão com frango cozido, tomate e azeite','lunch',[
    {foodId:'TBCA-BRC0834A',grams:220},{foodId:'TACO-2011-408',grams:140},{foodId:'USDA-170457',grams:120},{foodId:'TBCA-BRC0002D',grams:8}
  ],{diets:['omnivore'],flags:['meat','gluten'],styles:['brasileira','fitness']}),
  recipe('q-l23','Macarrão com patinho, tomate e azeite','lunch',[
    {foodId:'TBCA-BRC0834A',grams:220},{foodId:'TACO-2011-377',grams:120},{foodId:'USDA-170457',grams:120},{foodId:'TBCA-BRC0002D',grams:8}
  ],{diets:['omnivore'],flags:['meat','gluten'],styles:['brasileira','fitness']}),

  // Lanches e ceias
  recipe('q-s12','Maçã com amendoim torrado sem sal','snack',[
    {foodId:'TBCA-BRC0023C',grams:130},{foodId:'USDA-173806',grams:25}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['peanut'],styles:['brasileira','fitness','vegetariana','vegana']}),
  recipe('q-s13','Laranja com amendoim torrado sem sal','snack',[
    {foodId:'TBCA-BRC0020C',grams:140},{foodId:'USDA-173806',grams:25}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['peanut'],styles:['brasileira','fitness','vegetariana','vegana']}),
  recipe('q-s14','Ricota com maçã','snack',[
    {foodId:'TBCA-BRC0051G',grams:80},{foodId:'TBCA-BRC0023C',grams:130}
  ],{diets:['omnivore'],flags:['lactose','milk','gluten_unknown'],styles:['brasileira','fitness']}),
  recipe('q-s15','Queijo Minas com laranja','snack',[
    {foodId:'TBCA-BRC0052G',grams:50},{foodId:'TBCA-BRC0020C',grams:140}
  ],{diets:['omnivore'],flags:['lactose','milk','gluten_unknown'],styles:['brasileira']}),
  recipe('q-s16','Tapioca com ovo e tomate','snack',[
    {foodId:'TBCA-BRC0906B',grams:60},{foodId:'USDA-173424',grams:70},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg','gluten_unknown'],styles:['brasileira','fitness','vegetariana']}),

  // Jantar
  recipe('q-d17','Atum cozido, mandioca, beterraba e azeite','dinner',[
    {foodId:'TBCA-BRC0131E',grams:140},{foodId:'USDA-2709564',grams:120},{foodId:'TBCA-BRC0912B',grams:100},{foodId:'TBCA-BRC0002D',grams:8}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea','fitness']}),
  recipe('q-d18','Patinho, batata e beterraba','dinner',[
    {foodId:'TACO-2011-377',grams:120},{foodId:'USDA-170440',grams:160},{foodId:'TBCA-BRC0912B',grams:120}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']})
];
