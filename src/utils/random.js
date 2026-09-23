/**
 * Pick a random integer in [0, maxExclusive) using crypto when available.
 */
export function randomIndex(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("randomIndex requires a positive integer maxExclusive");
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    // Rejection sampling avoids modulo bias for small ranges.
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    const buffer = new Uint32Array(1);
    let value;
    do {
      crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return value % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

export function pickRandomItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }
  return items[randomIndex(items.length)];
}
