/* NutriTouch V16 — deterministic safety layer.
 * Estimates are educational support and do not replace professional assessment.
 */

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function classifySafety({ age, pregnant, diabetes, hypertension, requestedKcal, expenditureKcal, goal }) {
  const expenditure = Number(expenditureKcal);
  const requested = Number(requestedKcal);

  if (Number(age) < 19) {
    return { level: 'RED', blockAutomaticTarget: true, requiresReview: true, reason: 'Menores de 19 anos exigem avaliação individual.' };
  }
  if (pregnant) {
    return { level: 'RED', blockAutomaticTarget: true, requiresReview: true, reason: 'Gestação exige acompanhamento profissional individualizado.' };
  }
  if (diabetes || hypertension) {
    return { level: 'YELLOW', blockAutomaticTarget: true, requiresReview: true, reason: 'Condição clínica informada: revisar a meta com profissional habilitado.' };
  }
  if (![expenditure, requested].every(Number.isFinite) || expenditure <= 0) {
    return { level: 'RED', blockAutomaticTarget: true, requiresReview: true, reason: 'Dados insuficientes para estimar a meta energética.' };
  }

  const minFactor = goal === 'gain' ? 1.0 : 0.8;
  const maxFactor = goal === 'loss' ? 1.0 : 1.2;
  const boundedKcal = clamp(requested, expenditure * minFactor, expenditure * maxFactor);
  const capped = Math.abs(boundedKcal - requested) > 0.5;

  return {
    level: capped ? 'YELLOW' : 'GREEN',
    blockAutomaticTarget: false,
    requiresReview: capped,
    boundedKcal,
    requestedKcal: requested,
    adjustmentKcal: boundedKcal - expenditure,
    reason: capped ? 'O prazo solicitado exigiria um ajuste além do limite conservador do aplicativo.' : 'Estimativa dentro dos limites conservadores do aplicativo.'
  };
}
