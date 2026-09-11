/* NutriTouch V16 — camada determinística de segurança. */

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function classifySafety({ profile, requestedKcal, expenditureKcal }) {
  const age = Number(profile.age);
  const expenditure = Number(expenditureKcal);
  const requested = Number(requestedKcal);

  if (age < 19) {
    return {
      level: 'RED',
      blockAutomaticTarget: true,
      requiresReview: true,
      boundedKcal: expenditure,
      reason: 'Crescimento e desenvolvimento exigem avaliação individual; o app não aplica déficit ou superávit automático.'
    };
  }

  if (profile.condition === 'pregnancy') {
    return {
      level: 'RED',
      blockAutomaticTarget: true,
      requiresReview: true,
      boundedKcal: expenditure,
      reason: 'Gestação exige acompanhamento profissional individualizado; a meta automática foi bloqueada.'
    };
  }

  if (profile.condition === 'diabetes' || profile.condition === 'hypertension') {
    return {
      level: 'YELLOW',
      blockAutomaticTarget: true,
      requiresReview: true,
      boundedKcal: expenditure,
      reason: 'Condição clínica informada: a estimativa deve ser individualizada com profissional habilitado.'
    };
  }

  if (![expenditure, requested].every(Number.isFinite) || expenditure <= 0) {
    return {
      level: 'RED',
      blockAutomaticTarget: true,
      requiresReview: true,
      boundedKcal: expenditure,
      reason: 'Dados insuficientes para estimar uma meta energética.'
    };
  }

  const minFactor = profile.goal === 'gain' ? 1.00 : 0.80;
  const maxFactor = profile.goal === 'loss' ? 1.00 : 1.20;
  const boundedKcal = clamp(requested, expenditure * minFactor, expenditure * maxFactor);
  const capped = Math.abs(boundedKcal - requested) > 1;

  let level = capped ? 'YELLOW' : 'GREEN';
  let reason = capped
    ? 'O ajuste solicitado ultrapassa o limite conservador do aplicativo; a meta foi limitada e deve ser revisada.'
    : 'Estimativa dentro dos limites conservadores do aplicativo.';

  const foodRestriction = Boolean(profile.allergies) || (profile.intolerance && profile.intolerance !== 'none');
  if (foodRestriction && level === 'GREEN') {
    level = 'YELLOW';
    reason = 'Há alergia/intolerância informada; o plano alimentar exige conferência de ingredientes e contaminação cruzada.';
  }

  return {
    level,
    blockAutomaticTarget: false,
    requiresReview: capped || foodRestriction,
    boundedKcal,
    requestedKcal: requested,
    appliedAdjustmentKcal: boundedKcal - expenditure,
    capped,
    reason
  };
}
