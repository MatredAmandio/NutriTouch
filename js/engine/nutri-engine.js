import { estimateEnergy, estimateBMR, calculateBMI, adultBMIClass } from './metabolism.js';
import { buildDeadlinePlan, defaultGoalRequest } from './goals.js';
import { macroTargets, fiberTarget, sodiumReference } from './macros.js';
import { classifySafety } from './safety.js';

export const ENGINE_VERSION = 16;

export function calculateNutrition(profile, startDate = new Date()) {
  const expenditureKcal = estimateEnergy(profile);
  const bmrKcal = estimateBMR(profile);
  const bmi = calculateBMI(profile.weight, profile.height);

  if (!Number.isFinite(expenditureKcal) || !Number.isFinite(bmi)) {
    return { ok: false, error: 'Dados insuficientes para calcular o perfil nutricional.', version: ENGINE_VERSION };
  }

  const plan = buildDeadlinePlan({
    weight: profile.weight,
    targetWeight: profile.target,
    months: profile.deadline,
    expenditureKcal,
    startDate
  });

  const request = plan
    ? { requestedKcal: plan.requestedKcal, requestedAdjustmentKcal: plan.energyDelta, source: 'deadline' }
    : { ...defaultGoalRequest(profile.goal, expenditureKcal), source: 'goal-default' };

  const safety = classifySafety({
    profile,
    requestedKcal: request.requestedKcal,
    expenditureKcal
  });

  const targetKcal = Number.isFinite(safety.boundedKcal) ? safety.boundedKcal : expenditureKcal;
  const adjustmentKcal = targetKcal - expenditureKcal;
  const macros = macroTargets(profile, targetKcal);
  const age = Number(profile.age);

  return {
    ok: true,
    version: ENGINE_VERSION,
    anthropometry: {
      bmi,
      bmiClass: age < 19 ? 'Usar IMC-por-idade/sexo para classificação' : adultBMIClass(bmi)
    },
    metabolism: {
      bmrKcal,
      expenditureKcal
    },
    goal: {
      type: profile.goal,
      source: request.source,
      plan,
      requestedKcal: request.requestedKcal,
      requestedAdjustmentKcal: request.requestedAdjustmentKcal
    },
    adjustment: {
      requestedKcal: request.requestedAdjustmentKcal,
      appliedKcal: adjustmentKcal,
      capped: Boolean(safety.capped)
    },
    target: {
      kcal: targetKcal
    },
    macros,
    references: {
      fiber_g: fiberTarget(age, profile.sex),
      sodium_mg: sodiumReference(age, targetKcal)
    },
    safety
  };
}
