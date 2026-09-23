import { defaultBeers } from "../data/defaultBeers.js";

export const STORAGE_KEY = "brewlette.beers.v1";
export const DEFAULTS_KEY = "brewlette.defaults.v1";
export const PASSWORD_KEY = "brewlette.password.v1";
export const UNLOCK_KEY = "brewlette.unlocked.v1";
export const DEFAULT_PASSWORD = "brewlette";

function isValidBeer(beer) {
  if (!beer || typeof beer !== "object") return false;
  if (typeof beer.id !== "string" || beer.id.trim() === "") return false;
  if (typeof beer.name !== "string" || beer.name.trim() === "") return false;

  const abvOk =
    beer.abv === null ||
    beer.abv === undefined ||
    (typeof beer.abv === "number" && Number.isFinite(beer.abv));

  return abvOk;
}

function parseNumber(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseInt(value, 10);
    if (Number.isInteger(n) && n >= 1) return n;
  }
  return null;
}

/**
 * Normalize beers and ensure each has a unique positive integer `number`.
 * Missing/invalid numbers get the next free slot; duplicates are remapped.
 */
export function normalizeBeerList(beers) {
  const used = new Set();
  let nextFree = 1;

  function claim(preferred) {
    let n = preferred;
    if (n == null || used.has(n)) {
      while (used.has(nextFree)) nextFree += 1;
      n = nextFree;
    }
    used.add(n);
    while (used.has(nextFree)) nextFree += 1;
    return n;
  }

  const normalized = beers.filter(isValidBeer).map((beer, index) => {
    const abv =
      typeof beer.abv === "number" && Number.isFinite(beer.abv) ? beer.abv : null;
    const preferred = parseNumber(beer.number) ?? index + 1;

    return {
      id: String(beer.id),
      number: claim(preferred),
      name: String(beer.name).trim(),
      brewery: typeof beer.brewery === "string" ? beer.brewery : "",
      style: typeof beer.style === "string" ? beer.style : "",
      abv,
      description: typeof beer.description === "string" ? beer.description : "",
      surprise: typeof beer.surprise === "string" ? beer.surprise : "",
    };
  });

  return sortByNumber(normalized);
}

export function sortByNumber(beers) {
  return [...beers].sort((a, b) => a.number - b.number || a.name.localeCompare(b.name));
}

export function nextBeerNumber(beers) {
  if (!beers.length) return 1;
  return Math.max(...beers.map((b) => b.number)) + 1;
}

/**
 * Load beers from localStorage.
 * Falls back to defaults when missing or malformed.
 */
export function loadBeers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return cloneDefaults();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return cloneDefaults();
    }

    const beers = normalizeBeerList(parsed);
    if (beers.length === 0) {
      return cloneDefaults();
    }

    return beers;
  } catch {
    return cloneDefaults();
  }
}

export function saveBeers(beers) {
  if (!Array.isArray(beers)) {
    return false;
  }

  try {
    const normalized = normalizeBeerList(beers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function resetBeers() {
  const defaults = cloneDefaults();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors; still return defaults.
    }
  }
  return defaults;
}

/**
 * Built-in sample list from `defaultBeers.js`.
 */
export function cloneBuiltInDefaults() {
  return normalizeBeerList(defaultBeers.map((beer) => ({ ...beer })));
}

/**
 * Load bartender-defined defaults from localStorage.
 * Returns null when unset or unreadable (caller should use built-ins).
 */
export function loadCustomDefaults() {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (raw == null) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return normalizeBeerList(parsed);
  } catch {
    return null;
  }
}

export function saveCustomDefaults(beers) {
  if (!Array.isArray(beers)) return false;

  try {
    const normalized = normalizeBeerList(beers);
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

/**
 * Effective defaults for reset / missing storage: custom if set, else built-in.
 */
function cloneDefaults() {
  const custom = loadCustomDefaults();
  if (custom != null) return custom;
  return cloneBuiltInDefaults();
}

/**
 * Soft bartender PIN — client-side only. Default when nothing stored.
 */
export function loadPassword() {
  try {
    const raw = localStorage.getItem(PASSWORD_KEY);
    if (raw == null) return DEFAULT_PASSWORD;
    const trimmed = String(raw).trim();
    return trimmed === "" ? DEFAULT_PASSWORD : trimmed;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

export function isDefaultPassword() {
  return loadPassword() === DEFAULT_PASSWORD;
}

export function savePassword(password) {
  const trimmed = typeof password === "string" ? password.trim() : "";
  if (trimmed === "") return false;

  try {
    localStorage.setItem(PASSWORD_KEY, trimmed);
    return true;
  } catch {
    return false;
  }
}

export function checkPassword(attempt) {
  const trimmed = typeof attempt === "string" ? attempt.trim() : "";
  return trimmed !== "" && trimmed === loadPassword();
}

export function isSessionUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSessionUnlocked(unlocked) {
  try {
    if (unlocked) {
      sessionStorage.setItem(UNLOCK_KEY, "1");
    } else {
      sessionStorage.removeItem(UNLOCK_KEY);
    }
    return true;
  } catch {
    return false;
  }
}
