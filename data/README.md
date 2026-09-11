# NutriTouch Food Knowledge Base

## Estado atual
Foundation V2 em modo seguro. O aplicativo existente **não foi alterado** nesta etapa.

- Registros sem proveniência verificável por alimento ficam em `quarantined`.
- Valores nutricionais sem fonte verificável são `null` e não podem alimentar cálculos.
- Cada valor futuro deve ter fonte, identificador do registro e data de acesso/importação.
- Chaves de API nunca devem ser armazenadas no repositório.

## Fluxo de publicação de dados
1. Selecionar fonte autorizada.
2. Localizar o alimento/preparo exato.
3. Registrar identificador da fonte.
4. Normalizar para 100 g de porção comestível.
5. Validar esquema e plausibilidade.
6. Revisar restrições, alergênicos e compatibilidade alimentar.
7. Só então liberar o registro para cálculo.

## Fontes
Ver `sources.json`. A fonte de composição não deve ser confundida com uma diretriz alimentar.
