/* NutriTouch V16 — metabolismo e antropometria.
 * Funções puras, sem DOM e sem armazenamento.
 */

export function activityBand(activity) {
  if (activity === 'sedentary') return 'inactive';
  if (activity === 'light') return 'low';
  if (activity === 'moderate') return 'active';
  return 'very';
}

function childGrowthCost(age, sex) {
  if (age < 14) return sex === 'male' ? 25 : 30;
  return 20;
}

export function estimateEnergy({ age, sex, weight, height, activity }) {
  const A = Number(age);
  const W = Number(weight);
  const H = Number(height);
  const band = activityBand(activity);

  if (![A, W, H].every(Number.isFinite) || A <= 0 || W <= 0 || H <= 0) return null;

  if (A < 19) {
    const male = sex === 'male';
    const equations = male ? {
      inactive: -447.51 + 3.68 * A + 13.01 * H + 13.15 * W,
      low: 19.12 + 3.68 * A + 8.62 * H + 20.28 * W,
      active: -388.19 + 3.68 * A + 12.66 * H + 20.46 * W,
      very: -671.75 + 3.68 * A + 15.38 * H + 23.25 * W
    } : {
      inactive: 55.59 - 22.25 * A + 8.43 * H + 17.07 * W,
      low: -297.54 - 22.25 * A + 12.77 * H + 14.73 * W,
      active: -189.55 - 22.25 * A + 11.74 * H + 18.34 * W,
      very: -709.59 - 22.25 * A + 18.22 * H + 14.25 * W
    };
    return equations[band] + childGrowthCost(A, sex);
  }

  const male = sex === 'male';
  const equations = male ? {
    inactive: 753.07 - 10.83 * A + 6.50 * H + 14.10 * W,
    low: 581.47 - 10.83 * A + 8.30 * H + 14.94 * W,
    active: 1004.82 - 10.83 * A + 6.52 * H + 15.91 * W,
    very: -517.88 - 10.83 * A + 15.61 * H + 19.11 * W
  } : {
    inactive: 584.90 - 7.01 * A + 5.72 * H + 11.71 * W,
    low: 575.77 - 7.01 * A + 6.60 * H + 12.14 * W,
    active: 710.25 - 7.01 * A + 6.54 * H + 12.34 * W,
    very: 511.83 - 7.01 * A + 9.07 * H + 12.56 * W
  };
  return equations[band];
}

export function estimateBMR({ age, sex, weight, height }) {
  const A = Number(age);
  const W = Number(weight);
  const H = Number(height);
  if (![A, W, H].every(Number.isFinite) || A < 19 || W <= 0 || H <= 0) return null;
  return sex === 'male'
    ? 10 * W + 6.25 * H - 5 * A + 5
    : 10 * W + 6.25 * H - 5 * A - 161;
}

export function calculateBMI(weight, heightCm) {
  const W = Number(weight);
  const H = Number(heightCm) / 100;
  if (!Number.isFinite(W) || !Number.isFinite(H) || W <= 0 || H <= 0) return null;
  return W / (H ** 2);
}

export function adultBMIClass(bmi) {
  if (!Number.isFinite(bmi)) return '';
  if (bmi < 18.5) return 'Abaixo da faixa de referência';
  if (bmi < 25) return 'Faixa considerada saudável';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade classe I';
  if (bmi < 40) return 'Obesidade classe II';
  return 'Obesidade classe III';
}
