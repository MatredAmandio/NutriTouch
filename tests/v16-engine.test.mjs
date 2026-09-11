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
