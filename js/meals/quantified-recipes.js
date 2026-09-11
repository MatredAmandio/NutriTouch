const recipe = (id, title, kind, ingredients, options = {}) => ({
  id, title, kind, ingredients,
  diets: options.diets || ['omnivore'],
  flags: options.flags || []
});

export const QUANTIFIED_RECIPES = [
  recipe('q-b1','Aveia cremosa com banana e iogurte','breakfast',[
    {foodId:'USDA-173905',grams:180},{foodId:'USDA-173944',grams:100},{foodId:'USDA-171284',grams:120}
  ],{diets:['omnivore','vegetarian'],flags:['lactose','oats']}),
  recipe('q-b2','Ovos cozidos com batata e banana','breakfast',[
    {foodId:'USDA-173424',grams:100},{foodId:'USDA-170440',grams:120},{foodId:'USDA-173944',grams:80}
  ],{diets:['omnivore','vegetarian'],flags:['egg']}),
  recipe('q-b3','Iogurte natural com banana e aveia','breakfast',[
    {foodId:'USDA-171284',grams:150},{foodId:'USDA-173944',grams:120},{foodId:'USDA-173905',grams:140}
  ],{diets:['omnivore','vegetarian'],flags:['lactose','oats']}),
  recipe('q-b4','Tofu com batata e banana','breakfast',[
    {foodId:'USDA-172448',grams:130},{foodId:'USDA-170440',grams:120},{foodId:'USDA-173944',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy']}),

  recipe('q-l1','Frango, arroz integral, feijão e brócolis','lunch',[
    {foodId:'USDA-171477',grams:120},{foodId:'USDA-169704',grams:110},{foodId:'USDA-173735',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore'],flags:['meat']}),
  recipe('q-l2','Frango, batata, cenoura e brócolis','lunch',[
    {foodId:'USDA-171477',grams:130},{foodId:'USDA-170440',grams:180},{foodId:'USDA-170394',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore'],flags:['meat']}),
  recipe('q-l3','Tofu, arroz integral, feijão e brócolis','lunch',[
    {foodId:'USDA-172448',grams:160},{foodId:'USDA-169704',grams:120},{foodId:'USDA-173735',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy']}),
  recipe('q-l4','Lentilha, arroz integral, brócolis e cenoura','lunch',[
    {foodId:'USDA-172421',grams:150},{foodId:'USDA-169704',grams:120},{foodId:'USDA-169967',grams:120},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore','vegetarian','vegan']}),
  recipe('q-l5','Ovos, arroz integral, feijão e brócolis','lunch',[
    {foodId:'USDA-173424',grams:120},{foodId:'USDA-169704',grams:100},{foodId:'USDA-173735',grams:100},{foodId:'USDA-169967',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg']}),

  recipe('q-s1','Iogurte natural com banana','snack',[
    {foodId:'USDA-171284',grams:170},{foodId:'USDA-173944',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['lactose']}),
  recipe('q-s2','Banana com aveia','snack',[
    {foodId:'USDA-173944',grams:100},{foodId:'USDA-173905',grams:150}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['oats']}),
  recipe('q-s3','Ovo cozido com banana','snack',[
    {foodId:'USDA-173424',grams:70},{foodId:'USDA-173944',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg']}),
  recipe('q-s4','Tofu, batata e cenoura','snack',[
    {foodId:'USDA-172448',grams:100},{foodId:'USDA-170440',grams:80},{foodId:'USDA-170394',grams:60}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy']}),

  recipe('q-d1','Frango, batata, brócolis e cenoura','dinner',[
    {foodId:'USDA-171477',grams:120},{foodId:'USDA-170440',grams:180},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore'],flags:['meat']}),
  recipe('q-d2','Tofu, batata, brócolis e cenoura','dinner',[
    {foodId:'USDA-172448',grams:180},{foodId:'USDA-170440',grams:180},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore','vegetarian','vegan'],flags:['soy']}),
  recipe('q-d3','Lentilha, arroz integral e brócolis','dinner',[
    {foodId:'USDA-172421',grams:170},{foodId:'USDA-169704',grams:100},{foodId:'USDA-169967',grams:150}
  ],{diets:['omnivore','vegetarian','vegan']}),
  recipe('q-d4','Ovos, arroz integral, brócolis e cenoura','dinner',[
    {foodId:'USDA-173424',grams:120},{foodId:'USDA-169704',grams:100},{foodId:'USDA-169967',grams:100},{foodId:'USDA-170394',grams:100}
  ],{diets:['omnivore','vegetarian'],flags:['egg']})
];
