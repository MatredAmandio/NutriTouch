import { poolForPreference } from './templates.js';
import { compatiblePool } from './substitutions.js';

export const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function currentWeekKey(date = new Date()) {
  const now = new Date(date);
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - oneJan) / 86400000);
  return `${now.getFullYear()}-${Math.floor(dayOfYear / 7)}`;
}

function rotate(pool, count, seed) {
  const random = rng(seed);
  const order = pool.map((_, i) => i).sort(() => random() - 0.5);
  return Array.from({ length: count }, (_, i) => pool[order[i % order.length]]);
}

function mealLabels(count) {
  if (count <= 3) return ['Café da manhã', 'Almoço', 'Jantar'];
  if (count === 4) return ['Café da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'];
  if (count === 5) return ['Café da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];
  return ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];
}

function mealKinds(count) {
  if (count <= 3) return ['breakfast', 'lunch', 'dinner'];
  if (count === 4) return ['breakfast', 'lunch', 'snack', 'dinner'];
  if (count === 5) return ['breakfast', 'lunch', 'snack', 'dinner', 'snack'];
  return ['breakfast', 'snack', 'lunch', 'snack', 'dinner', 'snack'];
}

export function generateWeeklyPlan(profile, date = new Date()) {
  const count = Math.max(3, Math.min(6, Number(profile.meals) || 4));
  const pool = poolForPreference(profile.preferences);
  const seedBase = hashSeed(`${profile.preferences}|${profile.goal}|${currentWeekKey(date)}`);
  const rotations = {};

  for (const [index, kind] of ['breakfast', 'lunch', 'snack', 'dinner'].entries()) {
    const compatible = compatiblePool(pool[kind], profile);
    const safePool = compatible.length ? compatible : [{
      id: `blocked-${kind}`,
      title: 'Refeição não sugerida automaticamente',
      components: ['Revise alergias, intolerâncias e alimentos evitados antes de escolher uma opção.'],
      flags: ['blocked']
    }];
    rotations[kind] = rotate(safePool, 14, seedBase + (index + 1) * 9973);
  }

  const labels = mealLabels(count);
  const kinds = mealKinds(count);

  return DAYS.map((dayName, dayIndex) => ({
    day: dayName,
    meals: kinds.map((kind, mealIndex) => ({
      label: labels[mealIndex],
      kind,
      meal: rotations[kind][dayIndex + mealIndex]
    })),
    nutrientStatus: 'awaiting-validated-food-links'
  }));
}
