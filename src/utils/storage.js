import { sampleBeers } from "../data/sampleBeers.js";

export const STORAGE_KEY = "brewlette.beers.v1";
/** Spark-friendly cap — matches Firestore `beer_lists` document design. */
export const MAX_BEERS = 20;

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

export function createBeerId(name) {
  const slug = String(name || "beer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slug || "beer"}-${suffix}`;
}

export function parseAbv(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Whole number in 1..MAX_BEERS, or null. */
export function parseBeerNumber(value) {
  let n = null;
  if (typeof value === "number") {
    n = value;
  } else if (typeof value === "string" && value.trim() !== "") {
    n = Number.parseInt(value, 10);
  }
  if (Number.isInteger(n) && n >= 1 && n <= MAX_BEERS) return n;
  return null;
}

/**
 * Normalize beers and ensure each has a unique `number` in 1..MAX_BEERS.
 * Missing/invalid/out-of-range numbers get the next free slot; duplicates are remapped.
 */
export function normalizeBeerList(beers) {
  const used = new Set();
  let nextFree = 1;

  function isTaken(n) {
    return used.has(n) || reserved.has(n);
  }

  function claim(preferred) {
    let n = preferred;
    if (n == null || used.has(n)) {
      while (isTaken(nextFree)) nextFree += 1;
      n = nextFree;
    }
    used.add(n);
    return n;
  }

  const valid = beers.filter(isValidBeer).slice(0, MAX_BEERS);
  const reserved = new Set(
    valid.map((beer) => parseBeerNumber(beer.number)).filter((n) => n != null),
  );

  const normalized = valid.map((beer) => {
    const abv =
      typeof beer.abv === "number" && Number.isFinite(beer.abv) ? beer.abv : null;
    const preferred = parseBeerNumber(beer.number);

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

/**
 * Turn raw beers read from a marquee photo into a saveable list: adds ids,
 * drops nameless entries, caps at MAX_BEERS, and makes numbers unique.
 */
export function beersFromScan(scanned) {
  const text = (value) => (typeof value === "string" ? value.trim() : "");
  const beers = (Array.isArray(scanned) ? scanned : [])
    .filter((beer) => text(beer?.name))
    .map((beer) => ({
      id: createBeerId(beer.name),
      number: beer.number,
      name: text(beer.name),
      brewery: text(beer.brewery),
      style: text(beer.style),
      abv: parseAbv(beer.abv),
      description: text(beer.description),
      surprise: "",
    }));
  return normalizeBeerList(beers);
}

export function sortByNumber(beers) {
  return [...beers].sort((a, b) => a.number - b.number || a.name.localeCompare(b.name));
}

/**
 * Suggested number for a new beer: one past the highest, or the lowest gap
 * once the top slot is taken. Null when every slot in 1..MAX_BEERS is used.
 */
export function nextBeerNumber(beers) {
  if (!beers.length) return 1;
  const used = new Set(beers.map((b) => b.number));
  const afterHighest = Math.max(...used) + 1;
  if (afterHighest <= MAX_BEERS) return afterHighest;
  for (let n = 1; n <= MAX_BEERS; n += 1) {
    if (!used.has(n)) return n;
  }
  return null;
}

/**
 * Built-in sample set from `sampleBeers.js` — demos and Reset to demo only.
 */
export function cloneSampleBeers() {
  return normalizeBeerList(sampleBeers.map((beer) => ({ ...beer })));
}

/**
 * Load beers from localStorage.
 * Falls back to the sample set when missing or malformed; a saved empty list stays empty.
 */
export function loadBeers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return cloneSampleBeers();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return cloneSampleBeers();
    }
    if (parsed.length === 0) {
      return [];
    }

    const beers = normalizeBeerList(parsed);
    if (beers.length === 0) {
      return cloneSampleBeers();
    }

    return beers;
  } catch {
    return cloneSampleBeers();
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

/** Replace the live list with the built-in sample set. */
export function resetBeers() {
  const sample = cloneSampleBeers();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors; still return sample.
    }
  }
  return sample;
}
