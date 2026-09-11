/* NutriTouch V16 — referências de macronutrientes.
 * Valores são estimativas iniciais e não constituem prescrição.
 */

export function trainingContext(profile) {
  const type = profile.trainingType || 'none';
  const freq = Math.max(0, Math.min(7, Number(profile.trainingFreq) || 0));
  const minutes = Math.max(0, Number(profile.trainingMin) || 0);
  const resistance = profile.resistance === 'yes' || type === 'resistance' || type === 'mixed';
  const fitness = profile.preferences === 'fitness';
  return { type, freq, minutes, resistance, fitness, training: type !== 'none' && freq > 0 };
}

export function proteinTarget(profile) {
  const age = Number(profile.age);
  const weight = Number(profile.weight);
  if (!Number.isFinite(age) || !Number.isFinite(weight) || age <= 0 || weight <= 0) return null;

  const context = trainingContext(profile);
  let gramsPerKg;

  if (age < 14) gramsPerKg = 0.95;
  else if (age < 19) gramsPerKg = 0.85;
  else if (age >= 65) gramsPerKg = 1.0;
  else gramsPerKg = 0.8;

  if (age >= 19 && !profile.condition) {
    if (context.resistance || context.fitness) {
      if (profile.goal === 'loss' || profile.goal === 'recomp') gramsPerKg = 1.6;
      else if (profile.goal === 'gain') gramsPerKg = 1.4;
      else gramsPerKg = 1.2;

      if (context.freq >= 5 && context.minutes >= 60 && profile.goal === 'recomp') {
        gramsPerKg = 1.7;
      }
    } else if (context.training) {
      gramsPerKg = Math.max(gramsPerKg, 1.0);
    }
  }

  const rdaFloor = age < 19
    ? (profile.sex === 'male' ? (age < 14 ? 34 : 52) : (age < 14 ? 34 : 46))
    : 0;

  return {
    grams: Math.max(gramsPerKg * weight, rdaFloor),
    gramsPerKg
  };
}

export function macroTargets(profile, targetKcal) {
  const age = Number(profile.age);
  const kcal = Number(targetKcal);
  const protein = proteinTarget(profile);
  if (!protein || !Number.isFinite(kcal) || kcal <= 0) return null;

  if (age < 19) {
    return { protein_g: protein.grams, protein_gkg: protein.gramsPerKg, carbohydrate_g: null, fat_g: null };
  }

  const proteinKcal = protein.grams * 4;
  const fatKcal = kcal * 0.28;
  const carbohydrate = Math.max(0, (kcal - proteinKcal - fatKcal) / 4);

  return {
    protein_g: protein.grams,
    protein_gkg: protein.gramsPerKg,
    carbohydrate_g: carbohydrate,
    fat_g: fatKcal / 9
  };
}

export function fiberTarget(age, sex) {
  const A = Number(age);
  if (!Number.isFinite(A)) return null;
  if (A < 14) return sex === 'male' ? 31 : 26;
  if (A < 19) return sex === 'male' ? 38 : 26;
  if (A < 51) return sex === 'male' ? 38 : 25;
  return sex === 'male' ? 30 : 21;
}

export function sodiumReference(age, targetKcal) {
  const A = Number(age);
  const kcal = Number(targetKcal);
  if (!Number.isFinite(A) || !Number.isFinite(kcal)) return null;
  if (A >= 19) return 2000;
  return Math.round(Math.min(2000, 2000 * (kcal / 2000)));
}
