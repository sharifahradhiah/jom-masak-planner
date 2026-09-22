/**
 * Thin localStorage wrapper. Every mock service reads/writes exclusively
 * through here, so swapping the persistence layer (or pointing it at a
 * real backend cache) later only touches this one file.
 */
const NAMESPACE = 'mealplanning';

function keyFor(key) {
  return `${NAMESPACE}:${key}`;
}

export function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(keyFor(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    window.localStorage.setItem(keyFor(key), JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private mode) — fail silently for MVP.
  }
}

export function removeStore(key) {
  window.localStorage.removeItem(keyFor(key));
}

export function clearAllStore() {
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(`${NAMESPACE}:`))
    .forEach((k) => window.localStorage.removeItem(k));
}
