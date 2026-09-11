# NutriTouch

**A ciência da nutrição, no seu ritmo.**

V16 em arquitetura modular, mobile-first e preparada para GitHub Pages/PWA.

## Arquitetura V16

A interface foi separada do armazenamento, motor nutricional, segurança, cardápio e base de alimentos:

- `js/engine/metabolism.js`: gasto energético, TMB e antropometria;
- `js/engine/goals.js`: objetivo, data-alvo real e ajuste solicitado;
- `js/engine/macros.js`: referências de proteína, carboidrato, gordura, fibras e sódio;
- `js/engine/safety.js`: limites automáticos e classificação GREEN/YELLOW/RED;
- `js/engine/nutri-engine.js`: resposta consolidada `gasto → ajuste → meta → macros → segurança`;
- `js/meals/generator.js`: geração semanal estrutural;
- `js/meals/nutrition.js`: cálculo por gramas e soma de nutrientes;
- `js/meals/quantified-recipes.js`: receitas estruturadas ligadas a registros validados;
- `js/meals/quantified-generator.js`: distribuição diária de energia, escala de porções e geração quantitativa;
- `js/meals/substitutions.js`: compatibilidade e bloqueios por restrições;
- `js/data/foods.js`: carrega `data/foods.json` e só libera para cálculo registros com proveniência e nutrientes validados;
- `js/storage.js`: perfil V16, conclusão da avaliação e histórico de evolução;
- `js/ui/*`: renderização das telas.

## Avaliação e segurança

A avaliação possui cinco etapas e só é considerada concluída depois da validação final. Idade, peso e altura isoladamente não liberam mais o perfil como pronto. Alterações posteriores invalidam a assinatura da avaliação até uma nova conclusão das cinco etapas.

O objetivo é validado antes do cálculo: emagrecimento exige peso-alvo inferior ao peso atual, ganho exige alvo superior e manutenção ignora peso-alvo/prazo. A data-alvo é fixada no calendário quando o objetivo é concluído; recalibrações posteriores usam os **dias restantes** até essa data, sem reiniciar silenciosamente o prazo. Data-alvo vencida bloqueia novo ajuste automático até revisão.

Menores de 19 anos, gestação, diabetes, hipertensão e prazo vencido mantêm bloqueios/revisão conforme a camada de segurança. O NutriTouch não deve ser apresentado como diagnóstico, prescrição ou substituto de nutricionista/médico.

## Cardápio quantitativo

Quando todos os ingredientes de uma receita estão ligados a registros validados, o NutriTouch pode calcular:

- gramas de cada ingrediente;
- energia da refeição;
- proteínas, carboidratos e gorduras;
- fibra e sódio no total diário;
- distribuição da meta energética entre 3 e 6 refeições;
- ajuste proporcional de porções dentro de limites conservadores.

Quando a base ainda não cobre uma opção segura, o app mantém o comportamento anterior: exibe apenas uma estrutura de refeição ou bloqueia a sugestão, em vez de inventar valores.

A opção ayurvédica foi removida. Os perfis disponíveis são brasileira/caseira, mediterrânea, vegetariana, vegana, sem glúten e fitness/performance. O modo sem glúten exclui receitas com aveia comum por risco de contaminação cruzada, salvo futura inclusão de um registro certificado.

## Dados de alimentos

A base inicial V16.1 contém um núcleo pequeno de alimentos usados nas receitas quantitativas. Cada registro elegível exige:

1. composição nutricional numérica mínima;
2. fonte com identificador de registro;
3. status validado/verificado/aprovado;
4. base de referência explícita (100 g de parte comestível).

O núcleo inicial usa dados do **USDA FoodData Central**, publicados sob **CC0 1.0**, com o identificador FDC preservado em cada registro. A fonte sugerida pelo USDA é: *U.S. Department of Agriculture, Agricultural Research Service. FoodData Central.*

A base brasileira continua sendo uma prioridade, mas dados de terceiros não serão incorporados sem confirmação de licença compatível com o uso do produto. A expansão deve manter proveniência por registro e nunca misturar valores sem rastreabilidade.

## Lista de alimentos

A tela Alimentos mostra grupo, energia, proteína, carboidrato, gordura, fibra, sódio e a origem do registro. Busca por nome, alias ou grupo continua disponível. Alimentos incompletos permanecem em quarentena e não entram em cálculos.

## Evolução

A navegação principal é **Início · Cardápio · Alimentos · Evolução**. Evolução registra data, peso, cintura, quadril e observações localmente.

Para salvar um registro é necessário informar pelo menos uma medida. Registros na mesma data pedem confirmação antes de substituir o anterior, exclusões pedem confirmação e a data padrão usa o calendário local do dispositivo em vez de UTC.

## Testes e PWA

`npm test` executa testes do motor, calendário real, prazo restante, segurança, gerador, restrições, conclusão da avaliação, evolução, base validada, cálculo por gramas e cardápio quantitativo. O workflow do GitHub Actions valida a V16 em pull requests antes de permitir deploy no `main`.

O service worker mantém o shell modular, o novo motor de alimentos e a base disponíveis offline, atualiza `foods.json` com estratégia network-first e não grava respostas HTTP com erro no cache.
