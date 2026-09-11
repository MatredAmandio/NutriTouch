/* NutriTouch V16 — versioned local persistence. */

export const STORAGE_KEYS = Object.freeze({
  profile: 'nutritouch_profile',
  evolution: 'nutritouch_evolution_v1'
});

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getEvolutionEntries() {
  const entries = readJSON(STORAGE_KEYS.evolution, []);
  return Array.isArray(entries) ? entries.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))) : [];
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
