import assert from 'node:assert/strict';

const memory = new Map();
globalThis.localStorage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: key => memory.delete(key),
  clear: () => memory.clear()
};

const storage = await import('../js/storage.js');
const assessment = await import('../js/ui/assessment.js');

const profile = {
  ...storage.DEFAULT_PROFILE,
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
  trainingMin: 60,
  trainingType: 'mixed',
  meals: '4',
  preferences: 'brasileira',
  intolerance: 'none',
  condition: ''
};

assert.equal(storage.isProfileComplete(profile), false);
const completed = storage.completeAssessment(profile);
assert.equal(storage.isProfileComplete(completed), true);
assert.equal(storage.isProfileComplete({ ...completed, weight: 59 }), false);

assert.equal(assessment.validateAssessmentStep(2, profile), null);
assert.match(
  assessment.validateAssessmentStep(2, { ...profile, target: 62 }),
  /menor que o peso atual/i
);
assert.match(
  assessment.validateAssessmentStep(2, { ...profile, goal: 'gain', target: 58 }),
  /maior que o peso atual/i
);
assert.match(
  assessment.validateAssessmentStep(4, { ...profile, preferences: 'ayurveda' }),
  /perfil alimentar disponível/i
);
assert.match(
  assessment.validateAssessmentStep(3, { ...profile, activity: 'extreme' }),
  /nível de atividade disponível/i
);

const emptyEvolution = storage.saveEvolutionEntry({ date: '2026-09-11', weight: '', waist: '', hip: '' });
assert.equal(emptyEvolution.ok, false);
assert.equal(emptyEvolution.code, 'empty');

const first = storage.saveEvolutionEntry({ date: '2026-09-11', weight: 60, waist: 75, hip: 98 });
assert.equal(first.ok, true);
const duplicate = storage.saveEvolutionEntry({ date: '2026-09-11', weight: 59.8 });
assert.equal(duplicate.ok, false);
assert.equal(duplicate.code, 'duplicate');
const replaced = storage.saveEvolutionEntry({ date: '2026-09-11', weight: 59.8 }, { replace: true });
assert.equal(replaced.ok, true);
assert.equal(replaced.replaced, true);

console.log('NutriTouch V16 profile/evolution tests: OK');
