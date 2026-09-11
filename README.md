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
- `js/storage.js`: perfil V16, conclusão da avaliação e histórico de evolução;
- `js/ui/*`: renderização das telas.

## Avaliação e segurança

A avaliação possui cinco etapas e só é considerada concluída depois da validação final. Idade, peso e altura isoladamente não liberam mais o perfil como pronto. Alterações posteriores invalidam a assinatura da avaliação até uma nova conclusão das cinco etapas.

O objetivo é validado antes do cálculo: emagrecimento exige peso-alvo inferior ao peso atual, ganho exige alvo superior e manutenção ignora peso-alvo/prazo. A data-alvo é fixada no calendário quando o objetivo é concluído; recalibrações posteriores usam os **dias restantes** até essa data, sem reiniciar silenciosamente o prazo. Data-alvo vencida bloqueia novo ajuste automático até revisão.

Menores de 19 anos, gestação, diabetes, hipertensão e prazo vencido mantêm bloqueios/revisão conforme a camada de segurança. O NutriTouch não deve ser apresentado como diagnóstico, prescrição ou substituto de nutricionista/médico.

## Cardápio

O cardápio não possui calorias escritas diretamente nas strings. Enquanto ingredientes não estiverem ligados a registros validados da base, as refeições são exibidas apenas como estrutura alimentar.

A opção ayurvédica foi removida. Os perfis disponíveis são brasileira/caseira, mediterrânea, vegetariana, vegana, sem glúten e fitness/performance.

O gerador:

- respeita filtros estruturais de glúten, lactose, vegetariano, vegano, alimentos evitados e alergias informadas;
- bloqueia geração automática para intolerância à frutose e outras intolerâncias sem regra específica validada;
- bloqueia cardápio automático quando a camada clínica também bloqueia a meta;
- evita repetir automaticamente os três lanches de um mesmo dia em planos com seis refeições;
- usa o horário habitual do treino apenas para marcar referências estruturais de pré/pós-treino;
- permite nova rotação semanal sem sobrescrever imediatamente a escolha.

## Evolução

A navegação principal é **Início · Cardápio · Alimentos · Evolução**. Evolução registra data, peso, cintura, quadril e observações localmente.

Para salvar um registro é necessário informar pelo menos uma medida. Registros na mesma data pedem confirmação antes de substituir o anterior, exclusões pedem confirmação e a data padrão usa o calendário local do dispositivo em vez de UTC.

## Dados de alimentos

`data/foods.json` permanece em modo de quarentena. Um registro só é elegível para cálculos quando possui:

1. composição nutricional numérica mínima;
2. fonte com identificador de registro;
3. status de fonte validado/verificado/aprovado.

Dados nulos ou sem proveniência podem aparecer como identidade alimentar, mas não entram em cálculos.

## Testes e PWA

`npm test` executa testes do motor, calendário real, prazo restante, segurança, gerador, restrições, conclusão da avaliação, evolução e validação da base. O workflow do GitHub Actions valida a V16 em pull requests antes de permitir deploy no `main`.

O service worker V16 mantém o shell modular e a base de alimentos disponíveis offline, atualiza `foods.json` com estratégia network-first e não grava respostas HTTP com erro no cache. O manifesto possui atalho para Cardápio e Evolução e um ícone maskable dedicado.
