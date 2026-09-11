/* NutriTouch V16 — goal planning.
 * Pure functions: no DOM/localStorage dependencies.
 */

export const KCAL_PER_KG = 7700;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function lastDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Add calendar months while clamping month-end dates.
 * Example: Jan 31 + 1 month => Feb 28/29, not March.
 */
export function addCalendarMonths(date, months) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) throw new Error('Invalid start date');

  const count = Math.max(0, Math.trunc(Number(months) || 0));
  const year = source.getFullYear();
  const month = source.getMonth();
  const day = source.getDate();
  const targetMonthIndex = month + count;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const targetDay = Math.min(day, lastDayOfMonth(targetYear, targetMonth));

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

/**
 * Converts the simple UI input (number of months) into a real calendar date.
 * requestedKcal is an estimate used by the safety layer; it is not a prescription.
 */
export function buildDeadlinePlan({ weight, targetWeight, months, expenditureKcal, startDate = new Date() }) {
  const current = Number(weight);
  const target = Number(targetWeight);
  const expenditure = Number(expenditureKcal);
  const durationMonths = Math.max(1, Math.trunc(Number(months) || 1));

  if (![current, target, expenditure].every(Number.isFinite) || current <= 0 || target <= 0 || expenditure <= 0) {
    return null;
  }

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
