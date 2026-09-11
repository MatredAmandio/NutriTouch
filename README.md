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
- `js/meals/substitutions.js`: compatibilidade/substituições sem fingir equivalência nutricional;
- `js/data/foods.js`: carrega `data/foods.json` e só libera para cálculo registros com proveniência e nutrientes validados;
- `js/storage.js`: perfil V16 e histórico de evolução;
- `js/ui/*`: renderização das telas.

## Mudanças principais

O usuário continua informando o prazo em meses, porém a V16 converte o prazo em uma data-alvo real do calendário, inclusive em finais de mês. O resultado mostra separadamente gasto estimado, ajuste aplicado, meta energética, macros e nível de segurança.

O cardápio deixou de carregar calorias escritas diretamente nas strings. Enquanto os ingredientes não estiverem ligados a registros validados da base de alimentos, as refeições são exibidas apenas como estrutura alimentar e o app informa que o cálculo nutricional ainda não está disponível.

A navegação principal agora é **Início · Cardápio · Alimentos · Evolução**. A avaliação é editada a partir do perfil/painel. Evolução registra data, peso, cintura, quadril e observações no armazenamento local.

## Segurança

O motor é determinístico e a camada de interface não altera silenciosamente metas ou macros. Menores de 19 anos e gestação bloqueiam ajuste energético automático; condições clínicas informadas exigem revisão. Alergias e intolerâncias impedem o gerador de ignorar uma restrição quando não há opção compatível.

O NutriTouch não deve ser apresentado como diagnóstico, prescrição ou substituto de nutricionista/médico.

## Dados de alimentos

`data/foods.json` permanece em modo de quarentena. Um registro só é elegível para cálculos quando possui:

1. composição nutricional numérica mínima;
2. fonte com identificador de registro;
3. status de fonte validado/verificado/aprovado.

Dados nulos ou sem proveniência podem aparecer como identidade alimentar, mas não entram em cálculos.

## Testes e PWA

`npm test` executa testes do motor, calendário real, segurança, gerador, restrições e validação da base. O workflow do GitHub Actions valida a V16 em pull requests antes de permitir deploy no `main`.

O service worker V16 mantém shell modular e base de alimentos disponíveis offline, atualizando `foods.json` com estratégia network-first.
