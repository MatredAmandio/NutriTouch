import assert from 'node:assert/strict';
import { addCalendarMonths, buildDeadlinePlan } from '../js/engine/goals.js';
import { calculateNutrition } from '../js/engine/nutri-engine.js';

const leap = addCalendarMonths(new Date(2024, 0, 31, 12), 1);
assert.equal(leap.getFullYear(), 2024);
assert.equal(leap.getMonth(), 1);
assert.equal(leap.getDate(), 29);

const normal = addCalendarMonths(new Date(2026, 0, 31, 12), 1);
assert.equal(normal.getMonth(), 1);
assert.equal(normal.getDate(), 28);

const twoMonths = buildDeadlinePlan({
  weight: 60,
  targetWeight: 58,
  months: 2,
  expenditureKcal: 1872,
  startDate: new Date(2026, 0, 31, 12)
});
assert.equal(twoMonths.targetDate.getMonth(), 2);
assert.equal(twoMonths.targetDate.getDate(), 31);
assert.equal(twoMonths.days, 59);

const remaining = buildDeadlinePlan({
  weight: 59,
  targetWeight: 58,
  months: 3,
  expenditureKcal: 1872,
  startDate: new Date(2026, 9, 11, 12),
  targetDate: '2026-12-11'
});
assert.equal(remaining.days, 61);
assert.equal(remaining.targetDate.getMonth(), 11);

const baseProfile = {
  age: 43,
  sex: 'female',
  weight: 60,
  height: 159,
  goal: 'loss',
  target: 58,
  deadline: 3,
  activity: 'moderate',
  resistance: 'yes',
  trainingFreq: 5,
  trainingType: 'mixed',
  trainingMin: 60,
  preferences: 'brasileira',
  intolerance: 'none',
  allergies: '',
  condition: ''
};

const result = calculateNutrition(baseProfile, new Date(2026, 8, 11, 12));
assert.equal(result.ok, true);
assert.equal(result.version, 16);
assert.ok(result.metabolism.expenditureKcal > 0);
assert.ok(Number.isFinite(result.adjustment.appliedKcal));
assert.ok(result.target.kcal > 0);
assert.ok(result.macros.protein_g > 0);
assert.ok(['GREEN', 'YELLOW', 'RED'].includes(result.safety.level));
assert.equal(result.goal.plan.targetDate.getMonth(), 11);
assert.equal(result.goal.plan.targetDate.getDate(), 11);

const updatedWeight = calculateNutrition(
  { ...baseProfile, weight: 59, _goalTargetDate: '2026-12-11' },
  new Date(2026, 9, 11, 12)
);
assert.equal(updatedWeight.goal.plan.days, 61);

const expired = calculateNutrition(
  { ...baseProfile, _goalTargetDate: '2026-09-01' },
  new Date(2026, 8, 11, 12)
);
assert.equal(expired.goal.plan.expired, true);
assert.equal(expired.safety.level, 'YELLOW');
assert.equal(expired.safety.blockAutomaticTarget, true);
assert.equal(expired.adjustment.appliedKcal, 0);

const maintenance = calculateNutrition(
  { ...baseProfile, goal: 'maintenance', target: 50, deadline: 1, _goalTargetDate: '2026-10-11' },
  new Date(2026, 8, 11, 12)
);
assert.equal(maintenance.goal.plan, null);
assert.equal(Math.round(maintenance.adjustment.appliedKcal), 0);

const minor = calculateNutrition({ ...baseProfile, age: 17 }, new Date(2026, 8, 11, 12));
assert.equal(minor.safety.level, 'RED');
assert.equal(minor.adjustment.appliedKcal, 0);

const pregnancy = calculateNutrition({ ...baseProfile, condition: 'pregnancy' }, new Date(2026, 8, 11, 12));
assert.equal(pregnancy.safety.level, 'RED');
assert.equal(pregnancy.adjustment.appliedKcal, 0);

const clinical = calculateNutrition({ ...baseProfile, condition: 'diabetes' }, new Date(2026, 8, 11, 12));
assert.equal(clinical.safety.level, 'YELLOW');
assert.equal(clinical.adjustment.appliedKcal, 0);

console.log('NutriTouch V16 engine tests: OK');
