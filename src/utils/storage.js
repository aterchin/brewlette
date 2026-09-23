import { defaultBeers } from "../data/defaultBeers.js";

export const STORAGE_KEY = "brewlette.beers.v1";

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

function normalizeBeer(beer) {
  const abv =
    typeof beer.abv === "number" && Number.isFinite(beer.abv) ? beer.abv : null;

  return {
    id: String(beer.id),
    name: String(beer.name).trim(),
    brewery: typeof beer.brewery === "string" ? beer.brewery : "",
    style: typeof beer.style === "string" ? beer.style : "",
    abv,
    description: typeof beer.description === "string" ? beer.description : "",
    surprise: typeof beer.surprise === "string" ? beer.surprise : "",
  };
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

    const beers = parsed.filter(isValidBeer).map(normalizeBeer);
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
    const normalized = beers.filter(isValidBeer).map(normalizeBeer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function resetBeers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors; still return defaults.
  }
  return cloneDefaults();
}

function cloneDefaults() {
  return defaultBeers.map((beer) => ({ ...beer }));
}
