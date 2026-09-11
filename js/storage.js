export const APP_VERSION = 16;

export const STORAGE_KEYS = Object.freeze({
  profile: 'nutritouch_profile',
  profileVersion: 'nutritouch_profile_version',
  evolution: 'nutritouch_evolution_v1'
});

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
  steps: '',
  occupation: 'mixed',
  cook: 'moderate',
  preferences: 'brasileira',
  avoid: '',
  allergies: '',
  intolerance: 'none',
  condition: '',
  _goalStartDate: '',
  _goalSignature: ''
});

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

export function resetProfile() {
  localStorage.removeItem(STORAGE_KEYS.profile);
  localStorage.removeItem(STORAGE_KEYS.profileVersion);
}

export function isProfileComplete(profile) {
  return Boolean(Number(profile.age) && Number(profile.weight) && Number(profile.height));
}

export function getEvolutionEntries() {
  const entries = readJSON(STORAGE_KEYS.evolution, []);
  return Array.isArray(entries)
    ? entries.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))
    : [];
}

export function saveEvolutionEntry(entry) {
  const normalized = {
    date: String(entry.date || new Date().toISOString().slice(0, 10)),
    weight: entry.weight === '' || entry.weight == null ? null : Number(entry.weight),
    waist: entry.waist === '' || entry.waist == null ? null : Number(entry.waist),
    hip: entry.hip === '' || entry.hip == null ? null : Number(entry.hip),
    notes: String(entry.notes || '').trim()
  };

  const entries = getEvolutionEntries().filter(item => item.date !== normalized.date);
  entries.push(normalized);
  writeJSON(STORAGE_KEYS.evolution, entries);
  return normalized;
}

export function deleteEvolutionEntry(date) {
  const entries = getEvolutionEntries().filter(item => item.date !== date);
  writeJSON(STORAGE_KEYS.evolution, entries);
}
