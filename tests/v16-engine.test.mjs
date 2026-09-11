import assert from 'node:assert/strict';
import { addCalendarMonths, buildDeadlinePlan } from '../js/engine/goals.js';
import { classifySafety } from '../js/engine/safety.js';

const leap = addCalendarMonths(new Date(2024, 0, 31, 12), 1);
assert.equal(leap.getFullYear(), 2024);
assert.equal(leap.getMonth(), 1);
assert.equal(leap.getDate(), 29);

const normal = addCalendarMonths(new Date(2026, 0, 31, 12), 1);
assert.equal(normal.getMonth(), 1);
assert.equal(normal.getDate(), 28);

const plan = buildDeadlinePlan({ weight: 60, targetWeight: 57, months: 1, expenditureKcal: 1872, startDate: new Date(2026, 8, 11, 12) });
assert.equal(plan.days, 30); // Sep 11 -> Oct 11 happens to be 30 calendar days.
assert.equal(plan.targetDate.getMonth(), 9);
assert.equal(plan.targetDate.getDate(), 11);

const twoMonths = buildDeadlinePlan({ weight: 60, targetWeight: 58, months: 2, expenditureKcal: 1872, startDate: new Date(2026, 0, 31, 12) });
assert.equal(twoMonths.targetDate.getMonth(), 2);
assert.equal(twoMonths.targetDate.getDate(), 31);
assert.equal(twoMonths.days, 59);

const cappedLoss = classifySafety({ age: 43, pregnant: false, diabetes: false, hypertension: false, requestedKcal: 1000, expenditureKcal: 1872, goal: 'loss' });
assert.equal(cappedLoss.level, 'YELLOW');
assert.equal(Math.round(cappedLoss.boundedKcal), Math.round(1872 * 0.8));

assert.equal(classifySafety({ age: 17, requestedKcal: 1800, expenditureKcal: 2000, goal: 'loss' }).blockAutomaticTarget, true);
assert.equal(classifySafety({ age: 30, pregnant: true, requestedKcal: 1800, expenditureKcal: 2000, goal: 'maintenance' }).level, 'RED');
assert.equal(classifySafety({ age: 43, diabetes: true, requestedKcal: 1700, expenditureKcal: 1900, goal: 'loss' }).requiresReview, true);

console.log('NutriTouch V16 engine tests: OK');
