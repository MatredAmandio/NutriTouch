/* NutriTouch V16 — metas e prazo em calendário real. */

export const KCAL_PER_KG = 7700;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function lastDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function addCalendarMonths(date, months) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) throw new Error('Invalid start date');

  const count = Math.max(0, Math.trunc(Number(months) || 0));
  const sourceDay = source.getDate();
  const absoluteMonth = source.getMonth() + count;
  const targetYear = source.getFullYear() + Math.floor(absoluteMonth / 12);
  const targetMonth = ((absoluteMonth % 12) + 12) % 12;
  const targetDay = Math.min(sourceDay, lastDayOfMonth(targetYear, targetMonth));

  return new Date(targetYear, targetMonth, targetDay, 12, 0, 0, 0);
}

export function calendarDaysBetween(startDate, endDate) {
  const a = new Date(startDate);
  const b = new Date(endDate);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const au = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bu = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.max(0, Math.round((bu - au) / MS_PER_DAY));
}

export function buildDeadlinePlan({ weight, targetWeight, months, expenditureKcal, startDate = new Date() }) {
  const current = Number(weight);
  const target = Number(targetWeight);
  const expenditure = Number(expenditureKcal);
  const durationMonths = Math.max(0, Math.trunc(Number(months) || 0));

  if (!durationMonths || ![current, target, expenditure].every(Number.isFinite)) return null;
  if (current <= 0 || target <= 0 || expenditure <= 0 || target === current) return null;

  const targetDate = addCalendarMonths(startDate, durationMonths);
  const days = Math.max(1, calendarDaysBetween(startDate, targetDate));
  const deltaKg = target - current;
  const energyDelta = (deltaKg * KCAL_PER_KG) / days;

  return {
    months: durationMonths,
    days,
    target,
    targetDate,
    deltaKg,
    energyDelta,
    requestedKcal: expenditure + energyDelta
  };
}

export function defaultGoalRequest(goal, expenditureKcal) {
  const expenditure = Number(expenditureKcal);
  if (!Number.isFinite(expenditure) || expenditure <= 0) return null;

  const factor = {
    loss: 0.90,
    recomp: 0.97,
    gain: 1.08,
    maintenance: 1
  }[goal] ?? 1;

  return {
    requestedKcal: expenditure * factor,
    requestedAdjustmentKcal: expenditure * (factor - 1),
    factor
  };
}
