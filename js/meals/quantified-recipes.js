const recipe = (id, title, kind, ingredients, options = {}) => ({
  id, title, kind, ingredients,
  diets: options.diets || ['omnivore'],
  flags: options.flags || [],
  styles: options.styles || []
});

export const QUANTIFIED_RECIPES = [
  // Café da manhã
  recipe('q-b1','Aveia cremosa com banana e iogurte','breakfast',[
    {foodId:'USDA-173905',grams:180},{foodId:'USDA-173944',grams:100},{foodId:'USDA-171284',grams:120}
  ],{diets:['omnivore','vegetarian'],flags:['lactose','oats'],styles:['mediterranea','fitness','vegetariana']}),
  recipe('q-b2','Ovos cozidos com batata e mamão','breakfast',[
    {foodId:'USDA-173424',grams:100},{foodId:'USDA-170440',grams:140},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-b3','Iogurte natural com banana e mamão','breakfast',[
    {foodId:'USDA-171284',grams:170},{foodId:'USDA-173944',grams:100},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore','vegetarian'],flags:['lactose'],styles:['brasileira','mediterranea','vegetariana']}),
  recipe('q-b4','Tofu com batata-doce e mamão','breakfast',[
    {foodId:'USDA-172448',grams:160},{foodId:'USDA-168484',grams:200},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['vegetariana','vegana']}),
  recipe('q-b5','Ovos com fubá cozido, tomate e mamão','breakfast',[
    {foodId:'USDA-173424',grams:100},{foodId:'USDA-2708374',grams:200},{foodId:'USDA-170457',grams:100},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','vegetariana']}),
  recipe('q-b6','Ovos com mandioca e mamão','breakfast',[
    {foodId:'USDA-173424',grams:100},{foodId:'USDA-2709564',grams:150},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-b7','Iogurte com mamão e aveia','breakfast',[
    {foodId:'USDA-171284',grams:170},{foodId:'USDA-169926',grams:140},{foodId:'USDA-173905',grams:180}
  ],{diets:['omnivore','vegetarian'],flags:['lactose','oats'],styles:['mediterranea','fitness','vegetariana']}),
  recipe('q-b8','Aveia com banana e mamão','breakfast',[
    {foodId:'USDA-173905',grams:220},{foodId:'USDA-173944',grams:120},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['oats'],styles:['vegetariana','vegana']}),
  recipe('q-b9','Tofu com batata, banana e tomate','breakfast',[
    {foodId:'USDA-172448',grams:160},{foodId:'USDA-170440',grams:160},{foodId:'USDA-173944',grams:100},{foodId:'USDA-170457',grams:80}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['vegetariana','vegana']}),
  recipe('q-b10','Ovos com batata-doce, tomate e mamão','breakfast',[
    {foodId:'USDA-173424',grams:100},{foodId:'USDA-168484',grams:200},{foodId:'USDA-170457',grams:100},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-b11','Pão francês com ovos e mamão','breakfast',[
    {foodId:'TACO-2011-053',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore'],flags:['egg','gluten','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b12','Pão integral com ovos e tomate','breakfast',[
    {foodId:'TACO-2011-052',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['egg','gluten','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b13','Pão de milho com ovos e mamão','breakfast',[
    {foodId:'TACO-2011-051',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore'],flags:['egg','gluten_unknown','lactose_unknown'],styles:['brasileira']}),
  recipe('q-b14','Pão de aveia com ovos e banana','breakfast',[
    {foodId:'TACO-2011-048',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-173944',grams:100}
  ],{diets:['omnivore'],flags:['egg','gluten_unknown','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b15','Pão de soja com ovos e mamão','breakfast',[
    {foodId:'TACO-2011-049',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore'],flags:['egg','soy','gluten_unknown','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b16','Pão sovado com ovos e mamão','breakfast',[
    {foodId:'TACO-2011-054',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore'],flags:['egg','gluten','lactose_unknown'],styles:['brasileira']}),
  recipe('q-b17','Pão de glúten com ovos e tomate','breakfast',[
    {foodId:'TACO-2011-050',grams:70},{foodId:'USDA-173424',grams:100},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['egg','gluten','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-b18','Pão de queijo assado com mamão','breakfast',[
    {foodId:'TACO-2011-140',grams:70},{foodId:'USDA-169926',grams:120}
  ],{diets:['omnivore'],flags:['dairy','gluten_unknown','lactose_unknown'],styles:['brasileira']}),

  // Almoço
  recipe('q-l1','Frango, arroz integral, feijão e brócolis','lunch',[
    {foodId:'USDA-171477',grams:120},{foodId:'USDA-169704',grams:110},{foodId:'USDA-173735',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l2','Frango, batata, cenoura e brócolis','lunch',[
    {foodId:'USDA-171477',grams:130},{foodId:'USDA-170440',grams:180},{foodId:'USDA-170394',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l3','Tofu, arroz integral, feijão e brócolis','lunch',[
    {foodId:'USDA-172448',grams:160},{foodId:'USDA-169704',grams:120},{foodId:'USDA-173735',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['vegetariana','vegana']}),
  recipe('q-l4','Lentilha, arroz integral, brócolis e cenoura','lunch',[
    {foodId:'USDA-172421',grams:150},{foodId:'USDA-169704',grams:120},{foodId:'USDA-169967',grams:120},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['vegetariana','vegana']}),
  recipe('q-l5','Ovos, arroz integral, feijão e brócolis','lunch',[
    {foodId:'USDA-173424',grams:120},{foodId:'USDA-169704',grams:100},{foodId:'USDA-173735',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','vegetariana']}),
  recipe('q-l6','Frango, arroz branco, feijão e couve','lunch',[
    {foodId:'USDA-171477',grams:140},{foodId:'USDA-169757',grams:180},{foodId:'USDA-173735',grams:120},{foodId:'USDA-168523',grams:80}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l7','Tilápia, arroz integral, feijão e abobrinha','lunch',[
    {foodId:'USDA-175177',grams:180},{foodId:'USDA-169704',grams:160},{foodId:'USDA-173735',grams:100},{foodId:'USDA-168470',grams:120}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea','fitness']}),
  recipe('q-l8','Carne moída, arroz branco, feijão e tomate','lunch',[
    {foodId:'USDA-171794',grams:130},{foodId:'USDA-169757',grams:150},{foodId:'USDA-173735',grams:100},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l9','Bife bovino, mandioca, couve e abóbora','lunch',[
    {foodId:'USDA-173061',grams:120},{foodId:'USDA-2709564',grams:150},{foodId:'USDA-168523',grams:80},{foodId:'USDA-168449',grams:150}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l10','Sardinha, arroz branco, feijão e salada','lunch',[
    {foodId:'USDA-175139',grams:120},{foodId:'USDA-169757',grams:150},{foodId:'USDA-173735',grams:100},{foodId:'USDA-169249',grams:80},{foodId:'USDA-170457',grams:80}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea']}),
  recipe('q-l11','Frango, batata-doce, brócolis e cenoura','lunch',[
    {foodId:'USDA-171477',grams:150},{foodId:'USDA-168484',grams:200},{foodId:'USDA-169967',grams:120},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-l12','Tilápia, mandioca, tomate e salada','lunch',[
    {foodId:'USDA-175177',grams:180},{foodId:'USDA-2709564',grams:150},{foodId:'USDA-170457',grams:100},{foodId:'USDA-169249',grams:100}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea','fitness']}),
  recipe('q-l13','Frango, arroz branco, feijão e abóbora','lunch',[
    {foodId:'USDA-171477',grams:140},{foodId:'USDA-169757',grams:170},{foodId:'USDA-173735',grams:110},{foodId:'USDA-168449',grams:150}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira']}),
  recipe('q-l14','Lentilha, arroz branco, abóbora e abobrinha','lunch',[
    {foodId:'USDA-172421',grams:180},{foodId:'USDA-169757',grams:140},{foodId:'USDA-168449',grams:150},{foodId:'USDA-168470',grams:120}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['brasileira','vegetariana','vegana']}),
  recipe('q-l15','Grão-de-bico, arroz integral, brócolis e tomate','lunch',[
    {foodId:'USDA-173757',grams:180},{foodId:'USDA-169704',grams:130},{foodId:'USDA-169967',grams:120},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['mediterranea','vegetariana','vegana']}),
  recipe('q-l16','Grão-de-bico, batata-doce, tomate e salada','lunch',[
    {foodId:'USDA-173757',grams:180},{foodId:'USDA-168484',grams:180},{foodId:'USDA-170457',grams:100},{foodId:'USDA-169249',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['mediterranea','vegetariana','vegana']}),
  recipe('q-l17','Tofu, arroz integral, grão-de-bico e brócolis','lunch',[
    {foodId:'USDA-172448',grams:180},{foodId:'USDA-169704',grams:120},{foodId:'USDA-173757',grams:100},{foodId:'USDA-169967',grams:120}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['mediterranea','vegetariana','vegana']}),
  recipe('q-l18','Ovos, arroz branco, feijão e couve','lunch',[
    {foodId:'USDA-173424',grams:150},{foodId:'USDA-169757',grams:150},{foodId:'USDA-173735',grams:100},{foodId:'USDA-168523',grams:80}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','vegetariana']}),

  // Lanches e ceias
  recipe('q-s1','Iogurte natural com banana','snack',[
    {foodId:'USDA-171284',grams:170},{foodId:'USDA-173944',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['lactose'],styles:['brasileira','mediterranea','fitness','vegetariana']}),
  recipe('q-s2','Banana com aveia e mamão','snack',[
    {foodId:'USDA-173944',grams:100},{foodId:'USDA-173905',grams:150},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['oats'],styles:['mediterranea','vegetariana','vegana']}),
  recipe('q-s3','Ovo cozido com banana e mamão','snack',[
    {foodId:'USDA-173424',grams:80},{foodId:'USDA-173944',grams:100},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-s4','Tofu, batata-doce e tomate','snack',[
    {foodId:'USDA-172448',grams:100},{foodId:'USDA-168484',grams:120},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['vegetariana','vegana']}),
  recipe('q-s5','Iogurte com mamão e aveia','snack',[
    {foodId:'USDA-171284',grams:170},{foodId:'USDA-169926',grams:120},{foodId:'USDA-173905',grams:120}
  ],{diets:['omnivore','vegetarian'],flags:['lactose','oats'],styles:['mediterranea','fitness','vegetariana']}),
  recipe('q-s6','Grão-de-bico com tomate e alface','snack',[
    {foodId:'USDA-173757',grams:120},{foodId:'USDA-170457',grams:100},{foodId:'USDA-169249',grams:80}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['mediterranea','vegetariana','vegana']}),
  recipe('q-s7','Ovo cozido com batata e tomate','snack',[
    {foodId:'USDA-173424',grams:90},{foodId:'USDA-170440',grams:120},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','fitness','vegetariana']}),
  recipe('q-s8','Fubá cozido com iogurte e mamão','snack',[
    {foodId:'USDA-2708374',grams:180},{foodId:'USDA-171284',grams:150},{foodId:'USDA-169926',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['lactose'],styles:['brasileira','vegetariana']}),
  recipe('q-s9','Torrada de pão francês com ovo e tomate','snack',[
    {foodId:'TACO-2011-063',grams:45},{foodId:'USDA-173424',grams:70},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['egg','gluten_unknown','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-s10','Pão integral com banana','snack',[
    {foodId:'TACO-2011-052',grams:55},{foodId:'USDA-173944',grams:100}
  ],{diets:['omnivore'],flags:['gluten','lactose_unknown'],styles:['brasileira','fitness']}),
  recipe('q-s11','Pão de milho com banana','snack',[
    {foodId:'TACO-2011-051',grams:55},{foodId:'USDA-173944',grams:100}
  ],{diets:['omnivore'],flags:['gluten_unknown','lactose_unknown'],styles:['brasileira']}),

  // Jantar
  recipe('q-d1','Frango, batata, brócolis e cenoura','dinner',[
    {foodId:'USDA-171477',grams:120},{foodId:'USDA-170440',grams:180},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-d2','Tofu, batata, brócolis e cenoura','dinner',[
    {foodId:'USDA-172448',grams:180},{foodId:'USDA-170440',grams:180},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['vegetariana','vegana']}),
  recipe('q-d3','Lentilha, arroz integral e brócolis','dinner',[
    {foodId:'USDA-172421',grams:170},{foodId:'USDA-169704',grams:100},{foodId:'USDA-169967',grams:150}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['vegetariana','vegana']}),
  recipe('q-d4','Ovos, arroz integral, brócolis e cenoura','dinner',[
    {foodId:'USDA-173424',grams:120},{foodId:'USDA-169704',grams:100},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','vegetariana']}),
  recipe('q-d5','Frango, arroz branco, abobrinha e cenoura','dinner',[
    {foodId:'USDA-171477',grams:130},{foodId:'USDA-169757',grams:120},{foodId:'USDA-168470',grams:120},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-d6','Tilápia, batata, brócolis e tomate','dinner',[
    {foodId:'USDA-175177',grams:160},{foodId:'USDA-170440',grams:180},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea','fitness']}),
  recipe('q-d7','Carne moída, abóbora, batata e salada','dinner',[
    {foodId:'USDA-171794',grams:110},{foodId:'USDA-168449',grams:180},{foodId:'USDA-170440',grams:160},{foodId:'USDA-169249',grams:80}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira']}),
  recipe('q-d8','Sardinha, mandioca, tomate e salada','dinner',[
    {foodId:'USDA-175139',grams:100},{foodId:'USDA-2709564',grams:110},{foodId:'USDA-170457',grams:100},{foodId:'USDA-169249',grams:80}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea']}),
  recipe('q-d9','Bife bovino, arroz integral, brócolis e tomate','dinner',[
    {foodId:'USDA-173061',grams:110},{foodId:'USDA-169704',grams:120},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira','fitness']}),
  recipe('q-d10','Frango, mandioca, couve e abóbora','dinner',[
    {foodId:'USDA-171477',grams:130},{foodId:'USDA-2709564',grams:120},{foodId:'USDA-168523',grams:80},{foodId:'USDA-168449',grams:150}
  ],{diets:['omnivore'],flags:['meat'],styles:['brasileira']}),
  recipe('q-d11','Tilápia, arroz integral, grão-de-bico e abobrinha','dinner',[
    {foodId:'USDA-175177',grams:150},{foodId:'USDA-169704',grams:100},{foodId:'USDA-173757',grams:80},{foodId:'USDA-168470',grams:120}
  ],{diets:['omnivore'],flags:['fish'],styles:['brasileira','mediterranea','fitness']}),
  recipe('q-d12','Ovos, arroz branco, feijão e couve','dinner',[
    {foodId:'USDA-173424',grams:120},{foodId:'USDA-169757',grams:110},{foodId:'USDA-173735',grams:90},{foodId:'USDA-168523',grams:80}
  ],{diets:['omnivore','vegetarian'],flags:['egg'],styles:['brasileira','vegetariana']}),
  recipe('q-d13','Lentilha, arroz branco, brócolis e abóbora','dinner',[
    {foodId:'USDA-172421',grams:160},{foodId:'USDA-169757',grams:110},{foodId:'USDA-169967',grams:120},{foodId:'USDA-168449',grams:150}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['brasileira','vegetariana','vegana']}),
  recipe('q-d14','Grão-de-bico, batata, abobrinha e tomate','dinner',[
    {foodId:'USDA-173757',grams:160},{foodId:'USDA-170440',grams:150},{foodId:'USDA-168470',grams:120},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],styles:['mediterranea','vegetariana','vegana']}),
  recipe('q-d15','Tofu, batata-doce, brócolis e cenoura','dinner',[
    {foodId:'USDA-172448',grams:180},{foodId:'USDA-168484',grams:180},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['vegetariana','vegana']}),
  recipe('q-d16','Tofu, arroz integral, grão-de-bico e tomate','dinner',[
    {foodId:'USDA-172448',grams:170},{foodId:'USDA-169704',grams:100},{foodId:'USDA-173757',grams:90},{foodId:'USDA-170457',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy'],styles:['mediterranea','vegetariana','vegana']})
];
