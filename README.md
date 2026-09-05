# NutriTouch

**A ciência da nutrição, no seu ritmo.**

V1 funcional mobile-first, preparada para GitHub Pages/PWA.

## O que já existe
- onboarding e avaliação em 5 etapas
- IMC e classificação de triagem
- TMB por Mifflin-St Jeor
- estimativa de gasto energético por nível de atividade
- metas de manutenção, emagrecimento, recomposição e ganho
- distribuição de proteínas, carboidratos e gorduras
- segurança GREEN/YELLOW/RED
- cardápio diário automático com 3–6 refeições
- quantidades em gramas e macros por refeição
- base inicial de alimentos pesquisável
- preferências, alimentos a evitar, alergias e intolerância à lactose
- armazenamento local do perfil
- PWA/offline cache básico

## Segurança
O motor é determinístico: a camada de interface não altera silenciosamente calorias ou macros. Situações de maior risco podem bloquear a geração automática. A versão atual é um produto V1 técnico e não deve ser apresentada como diagnóstico, prescrição ou substituto de nutricionista/médico.

## Próximas evoluções
- banco de alimentos validado (ex.: composição nutricional oficial/licenciada)
- gerador de cardápio com otimização de macros e variedade
- substituições equivalentes por preferência/intolerância/alergia
- histórico de peso e tendência semanal
- recalibração após 2–4 semanas
- autenticação e banco de dados multiusuário
- auditoria de cálculo e versionamento do motor
- testes automatizados e CI
- revisão clínica/regulatória antes de uso público
