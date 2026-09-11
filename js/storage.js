export const APP_VERSION = 16;

export const STORAGE_KEYS = Object.freeze({
  profile: 'nutritouch_profile',
  profileVersion: 'nutritouch_profile_version',
  evolution: 'nutritouch_evolution_v1'
});

const ASSESSMENT_FIELDS = Object.freeze([
  'age','sex','weight','height','goal','resistance','target','deadline','activity',
  'meals','trainingFreq','trainingType','trainingMin','trainingTime','preferences',
  'avoid','allergies','intolerance','condition'
]);

export const DEFAULT_PROFILE = Object.freeze({
  age: '',
  sex: 'female',
  weight: '',
  height: '',
  goal: 'recomp',
  resistance: 'yes',
  target: '',
  deadline: '',
  activity: 'moderate',
  meals: '4',
  trainingFreq: '',
  trainingType: 'mixed',
  trainingMin: '',
  trainingTime: '',
  preferences: 'brasileira',
  avoid: '',
  allergies: '',
  intolerance: 'none',
  condition: '',
  _assessmentCompleted: false,
  _assessmentCompletedSignature: '',
  _assessmentCompletedAt: '',
  _goalStartDate: '',
  _goalTargetDate: '',
  _goalSignature: ''
});

export function localDateISO(date = new Date()) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function assessmentSignature(profile = {}) {
  const snapshot = {};
  for (const key of ASSESSMENT_FIELDS) snapshot[key] = profile[key] ?? '';
  return JSON.stringify(snapshot);
}

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getProfile() {
  const stored = readJSON(STORAGE_KEYS.profile, null);
  return stored ? { ...DEFAULT_PROFILE, ...stored } : { ...DEFAULT_PROFILE };
}

export function saveProfile(profile) {
  const saved = { ...DEFAULT_PROFILE, ...profile };
  writeJSON(STORAGE_KEYS.profile, saved);
  localStorage.setItem(STORAGE_KEYS.profileVersion, String(APP_VERSION));
  return saved;
}

export function completeAssessment(profile) {
  const completed = {
    ...DEFAULT_PROFILE,
    ...profile,
    _assessmentCompleted: true,
    _assessmentCompletedAt: new Date().toISOString()
  };
  completed._assessmentCompletedSignature = assessmentSignature(completed);
  return saveProfile(completed);
}

export function resetProfile() {
  localStorage.removeItem(STORAGE_KEYS.profile);
  localStorage.removeItem(STORAGE_KEYS.profileVersion);
}

export function isProfileComplete(profile) {
  const hasCoreData = Boolean(Number(profile?.age) && Number(profile?.weight) && Number(profile?.height));
  if (!hasCoreData || profile?._assessmentCompleted !== true) return false;
  return profile._assessmentCompletedSignature === assessmentSignature(profile);
}

export function getEvolutionEntries() {
  const entries = readJSON(STORAGE_KEYS.evolution, []);
  return Array.isArray(entries)
    ? entries.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))
    : [];
}

export function findEvolutionEntry(date) {
  return getEvolutionEntries().find(item => item.date === String(date)) || null;
}

function metric(value, min, max) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return NaN;
  return number;
}

export function saveEvolutionEntry(entry, { replace = false } = {}) {
  const normalized = {
    date: String(entry.date || localDateISO()),
    weight: metric(entry.weight, 20, 350),
    waist: metric(entry.waist, 20, 250),
    hip: metric(entry.hip, 20, 300),
    notes: String(entry.notes || '').trim()
  };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.date)) {
    return { ok: false, code: 'date', error: 'Informe uma data válida.' };
  }
  if ([normalized.weight, normalized.waist, normalized.hip].some(Number.isNaN)) {
    return { ok: false, code: 'range', error: 'Revise as medidas informadas.' };
  }
  if ([normalized.weight, normalized.waist, normalized.hip].every(value => value == null)) {
    return { ok: false, code: 'empty', error: 'Informe pelo menos peso, cintura ou quadril.' };
  }

  const entries = getEvolutionEntries();
  const exists = entries.some(item => item.date === normalized.date);
  if (exists && !replace) {
    return { ok: false, code: 'duplicate', error: 'Já existe um registro nesta data.' };
  }

  const next = entries.filter(item => item.date !== normalized.date);
  next.push(normalized);
  writeJSON(STORAGE_KEYS.evolution, next);
  return { ok: true, entry: normalized, replaced: exists };
}

export function deleteEvolutionEntry(date) {
  const entries = getEvolutionEntries().filter(item => item.date !== date);
  writeJSON(STORAGE_KEYS.evolution, entries);
}
