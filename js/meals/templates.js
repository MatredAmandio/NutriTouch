/* Cardápios estruturais V16.
 * Sem valores de calorias/macros: a composição nutricional só poderá ser calculada
 * quando cada ingrediente estiver ligado a registros validados de foods.json.
 */

const meal = (id, title, components, flags = []) => ({ id, title, components, flags });

export const TEMPLATE_POOLS = {
  brasileira: {
    breakfast: [
      meal('br-b1', 'Cuscuz com ovos, tomate e fruta', ['100 g cuscuz', '2 ovos', 'tomate', '1 porção de fruta'], ['animal']),
      meal('br-b2', 'Aveia com banana e castanhas', ['aveia em flocos', 'banana', 'castanhas'], ['vegan', 'gluten']),
      meal('br-b3', 'Tapioca com ovos e fruta', ['tapioca', '2 ovos', '1 porção de fruta'], ['animal']),
      meal('br-b4', 'Pão integral com ovos e mamão', ['pão integral', '2 ovos', 'mamão'], ['animal', 'gluten'])
    ],
    lunch: [
      meal('br-l1', 'Frango, arroz integral, feijão e salada', ['frango', 'arroz integral', 'feijão', 'salada variada'], ['animal', 'meat']),
      meal('br-l2', 'Peixe assado, batata e legumes', ['peixe', 'batata', 'legumes'], ['animal', 'fish']),
      meal('br-l3', 'Omelete, arroz, feijão e legumes', ['ovos', 'arroz', 'feijão', 'legumes'], ['animal']),
      meal('br-l4', 'Lentilha, arroz integral e vegetais', ['lentilha', 'arroz integral', 'vegetais'], ['vegan'])
    ],
    snack: [
      meal('br-s1', 'Fruta e castanhas', ['1 porção de fruta', 'castanhas'], ['vegan']),
      meal('br-s2', 'Banana com pasta de amendoim', ['banana', 'pasta de amendoim'], ['vegan']),
      meal('br-s3', 'Iogurte com aveia e fruta', ['iogurte natural', 'aveia', 'fruta'], ['animal', 'lactose', 'gluten']),
      meal('br-s4', 'Tapioca pequena com ovo', ['tapioca', '1 ovo'], ['animal'])
    ],
    dinner: [
      meal('br-d1', 'Omelete com legumes e batata', ['ovos', 'legumes', 'batata'], ['animal']),
      meal('br-d2', 'Frango desfiado, arroz e vegetais', ['frango', 'arroz', 'vegetais'], ['animal', 'meat']),
      meal('br-d3', 'Lentilha, batata e vegetais', ['lentilha', 'batata', 'vegetais'], ['vegan']),
      meal('br-d4', 'Peixe grelhado, mandioca e salada', ['peixe', 'mandioca', 'salada'], ['animal', 'fish'])
    ]
  },
  mediterranea: {
    breakfast: [
      meal('med-b1', 'Aveia com frutas, sementes e castanhas', ['aveia', 'frutas', 'sementes', 'castanhas'], ['vegan', 'gluten']),
      meal('med-b2', 'Pão integral com ovos e tomate', ['pão integral', 'ovos', 'tomate', 'azeite'], ['animal', 'gluten']),
      meal('med-b3', 'Iogurte natural com fruta e nozes', ['iogurte natural', 'fruta', 'nozes'], ['animal', 'lactose']),
      meal('med-b4', 'Tapioca com hommus e tomate', ['tapioca', 'hommus', 'tomate'], ['vegan'])
    ],
    lunch: [
      meal('med-l1', 'Peixe, quinoa, grão-de-bico e salada', ['peixe', 'quinoa', 'grão-de-bico', 'salada'], ['animal', 'fish']),
      meal('med-l2', 'Frango, arroz integral e vegetais', ['frango', 'arroz integral', 'vegetais', 'azeite'], ['animal', 'meat']),
      meal('med-l3', 'Lentilha, arroz integral e vegetais assados', ['lentilha', 'arroz integral', 'vegetais', 'azeite'], ['vegan']),
      meal('med-l4', 'Grão-de-bico, quinoa e salada', ['grão-de-bico', 'quinoa', 'salada', 'azeite'], ['vegan'])
    ],
    snack: [
      meal('med-s1', 'Fruta e nozes', ['fruta', 'nozes'], ['vegan']),
      meal('med-s2', 'Hommus com vegetais', ['hommus', 'vegetais'], ['vegan']),
      meal('med-s3', 'Iogurte com fruta', ['iogurte natural', 'fruta'], ['animal', 'lactose']),
      meal('med-s4', 'Fruta com sementes', ['fruta', 'sementes'], ['vegan'])
    ],
    dinner: [
      meal('med-d1', 'Grão-de-bico, vegetais e quinoa', ['grão-de-bico', 'vegetais', 'quinoa'], ['vegan']),
      meal('med-d2', 'Peixe com legumes e arroz integral', ['peixe', 'legumes', 'arroz integral'], ['animal', 'fish']),
      meal('med-d3', 'Omelete com vegetais e batata', ['ovos', 'vegetais', 'batata'], ['animal']),
      meal('med-d4', 'Frango assado, quinoa e legumes', ['frango', 'quinoa', 'legumes'], ['animal', 'meat'])
    ]
  },
  vegetariana: {
    breakfast: [
      meal('veg-b1', 'Pão integral com ovos e tomate', ['pão integral', 'ovos', 'tomate'], ['animal', 'gluten']),
      meal('veg-b2', 'Aveia com banana e castanhas', ['aveia', 'banana', 'castanhas'], ['vegan', 'gluten']),
      meal('veg-b3', 'Tapioca com ovos e fruta', ['tapioca', 'ovos', 'fruta'], ['animal']),
      meal('veg-b4', 'Iogurte com fruta e sementes', ['iogurte natural', 'fruta', 'sementes'], ['animal', 'lactose'])
    ],
    lunch: [
      meal('veg-l1', 'Lentilha, arroz integral e vegetais', ['lentilha', 'arroz integral', 'vegetais'], ['vegan']),
      meal('veg-l2', 'Grão-de-bico, quinoa e salada', ['grão-de-bico', 'quinoa', 'salada'], ['vegan']),
      meal('veg-l3', 'Omelete, feijão, arroz e legumes', ['ovos', 'feijão', 'arroz', 'legumes'], ['animal']),
      meal('veg-l4', 'Tofu, batata-doce e vegetais', ['tofu', 'batata-doce', 'vegetais'], ['vegan'])
    ],
    snack: [
      meal('veg-s1', 'Fruta e castanhas', ['fruta', 'castanhas'], ['vegan']),
      meal('veg-s2', 'Banana com pasta de amendoim', ['banana', 'pasta de amendoim'], ['vegan']),
      meal('veg-s3', 'Iogurte com fruta', ['iogurte natural', 'fruta'], ['animal', 'lactose']),
      meal('veg-s4', 'Hommus com vegetais', ['hommus', 'vegetais'], ['vegan'])
    ],
    dinner: [
      meal('veg-d1', 'Tofu com arroz integral e legumes', ['tofu', 'arroz integral', 'legumes'], ['vegan']),
      meal('veg-d2', 'Grão-de-bico com vegetais e quinoa', ['grão-de-bico', 'vegetais', 'quinoa'], ['vegan']),
      meal('veg-d3', 'Omelete com batata e salada', ['ovos', 'batata', 'salada'], ['animal']),
      meal('veg-d4', 'Sopa de lentilha com vegetais', ['lentilha', 'vegetais'], ['vegan'])
    ]
  },
  vegana: {
    breakfast: [
      meal('vn-b1', 'Aveia com banana e castanhas', ['aveia', 'banana', 'castanhas'], ['vegan', 'gluten']),
      meal('vn-b2', 'Tapioca com pasta de amendoim e fruta', ['tapioca', 'pasta de amendoim', 'fruta'], ['vegan']),
      meal('vn-b3', 'Pão integral com hommus e tomate', ['pão integral', 'hommus', 'tomate'], ['vegan', 'gluten']),
      meal('vn-b4', 'Fruta com aveia e sementes', ['fruta', 'aveia', 'sementes'], ['vegan', 'gluten'])
    ],
    lunch: [
      meal('vn-l1', 'Grão-de-bico, arroz integral e vegetais', ['grão-de-bico', 'arroz integral', 'vegetais'], ['vegan']),
      meal('vn-l2', 'Tofu, batata-doce e legumes', ['tofu', 'batata-doce', 'legumes'], ['vegan']),
      meal('vn-l3', 'Lentilha, quinoa e salada', ['lentilha', 'quinoa', 'salada'], ['vegan']),
      meal('vn-l4', 'Feijão, arroz integral, abóbora e couve', ['feijão', 'arroz integral', 'abóbora', 'couve'], ['vegan'])
    ],
    snack: [
      meal('vn-s1', 'Fruta com castanhas', ['fruta', 'castanhas'], ['vegan']),
      meal('vn-s2', 'Banana com pasta de amendoim', ['banana', 'pasta de amendoim'], ['vegan']),
      meal('vn-s3', 'Hommus com vegetais', ['hommus', 'vegetais'], ['vegan']),
      meal('vn-s4', 'Fruta com sementes', ['fruta', 'sementes'], ['vegan'])
    ],
    dinner: [
      meal('vn-d1', 'Tofu com legumes e arroz integral', ['tofu', 'legumes', 'arroz integral'], ['vegan']),
      meal('vn-d2', 'Grão-de-bico com vegetais e quinoa', ['grão-de-bico', 'vegetais', 'quinoa'], ['vegan']),
      meal('vn-d3', 'Feijão, mandioca e salada', ['feijão', 'mandioca', 'salada'], ['vegan']),
      meal('vn-d4', 'Sopa de lentilha com vegetais', ['lentilha', 'vegetais'], ['vegan'])
    ]
  },
  fitness: {
    breakfast: [
      meal('fit-b1', 'Ovos, aveia, banana e iogurte', ['ovos', 'aveia', 'banana', 'iogurte natural'], ['animal', 'lactose', 'gluten']),
      meal('fit-b2', 'Tapioca com ovos e fruta', ['tapioca', 'ovos', 'fruta'], ['animal']),
      meal('fit-b3', 'Pão integral, ovos e fruta', ['pão integral', 'ovos', 'fruta'], ['animal', 'gluten']),
      meal('fit-b4', 'Aveia, banana e castanhas', ['aveia', 'banana', 'castanhas'], ['vegan', 'gluten'])
    ],
    lunch: [
      meal('fit-l1', 'Frango, arroz, feijão e vegetais', ['frango', 'arroz', 'feijão', 'vegetais'], ['animal', 'meat']),
      meal('fit-l2', 'Peixe, batata-doce e legumes', ['peixe', 'batata-doce', 'legumes'], ['animal', 'fish']),
      meal('fit-l3', 'Carne magra, arroz integral e salada', ['carne magra', 'arroz integral', 'salada'], ['animal', 'meat']),
      meal('fit-l4', 'Lentilha, quinoa e vegetais', ['lentilha', 'quinoa', 'vegetais'], ['vegan'])
    ],
    snack: [
      meal('fit-s1', 'Banana e castanhas', ['banana', 'castanhas'], ['vegan']),
      meal('fit-s2', 'Tapioca com ovo', ['tapioca', 'ovo'], ['animal']),
      meal('fit-s3', 'Iogurte com fruta', ['iogurte natural', 'fruta'], ['animal', 'lactose']),
      meal('fit-s4', 'Fruta com pasta de amendoim', ['fruta', 'pasta de amendoim'], ['vegan'])
    ],
    dinner: [
      meal('fit-d1', 'Frango, arroz integral e legumes', ['frango', 'arroz integral', 'legumes'], ['animal', 'meat']),
      meal('fit-d2', 'Peixe, batata e vegetais', ['peixe', 'batata', 'vegetais'], ['animal', 'fish']),
      meal('fit-d3', 'Omelete, batata e salada', ['ovos', 'batata', 'salada'], ['animal']),
      meal('fit-d4', 'Tofu, quinoa e vegetais', ['tofu', 'quinoa', 'vegetais'], ['vegan'])
    ]
  }
};

export function poolForPreference(preference) {
  if (preference === 'sem-gluten') return TEMPLATE_POOLS.brasileira;
  if (preference === 'ayurveda') return TEMPLATE_POOLS.vegetariana;
  return TEMPLATE_POOLS[preference] || TEMPLATE_POOLS.brasileira;
}
