/** Degrees in a full circle. */
export const FULL_CIRCLE = 360;

/**
 * Slice geometry for a beer list.
 * Index 0 starts at -90deg (12 o'clock) so the pointer at top feels natural.
 */
export function getSliceAngle(count) {
  if (!count || count < 1) return 0;
  return FULL_CIRCLE / count;
}

export function getSliceStartAngle(index, count) {
  return index * getSliceAngle(count) - 90;
}

export function getSliceMidAngle(index, count) {
  return getSliceStartAngle(index, count) + getSliceAngle(count) / 2;
}

/**
 * Target wheel rotation so slice `winnerIndex` lands under the top pointer.
 * Adds full spins for theatrical effect. Rotation is CSS-style degrees
 * (positive = clockwise when applied as rotate()).
 */
export function getTargetRotation({
  winnerIndex,
  count,
  currentRotation = 0,
  minSpins = 4,
  maxSpins = 7,
}) {
  if (!count || count < 1) return currentRotation;

  const slice = getSliceAngle(count);
  // Mid of winner should sit at top (pointer). With our -90 offset in drawing,
  // the wheel's canvas rotation that places mid-angle at top:
  // midAngle + rotation ≡ -90 (mod 360) in canvas space where 0 is east.
  // Simpler: pointer is at top. After rotation R, mid of winner should be at top.
  // Mid angle in unrotated wheel (0 = east, CCW positive in canvas): start at -90.
  // We use CSS rotate which is clockwise-positive from 12 o'clock visual if we
  // draw with the same convention. Keep math consistent with BeerWheel drawing.
  const mid = getSliceMidAngle(winnerIndex, count);
  // We want mid + rotation = -90 + k*360 in the same angle space used for arcs
  // that start at -90 for index 0. Pointer sits at visual top = -90deg.
  const aligned = -90 - mid;
  const base = normalizeDegrees(aligned);

  const spins =
    minSpins +
    Math.floor(Math.random() * Math.max(1, maxSpins - minSpins + 1));

  // Always spin forward (increasing rotation) from current position.
  const absolute = currentRotation + spins * FULL_CIRCLE;
  const currentNorm = normalizeDegrees(currentRotation);
  let delta = normalizeDegrees(base - currentNorm);
  if (delta < 20) {
    delta += FULL_CIRCLE;
  }

  return absolute - currentNorm + currentRotation + delta;
}

export function normalizeDegrees(degrees) {
  const mod = degrees % FULL_CIRCLE;
  return mod < 0 ? mod + FULL_CIRCLE : mod;
}

/**
 * Shorten a beer name for wheel labels.
 */
export function shortenLabel(name, maxChars = 14) {
  const text = String(name || "").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

/**
 * Split a label into up to two lines for canvas drawing.
 */
export function wrapLabel(name, maxCharsPerLine = 12) {
  const text = String(name || "").trim();
  if (text.length <= maxCharsPerLine) {
    return [text];
  }

  const shortened = shortenLabel(text, maxCharsPerLine * 2);
  const mid = Math.ceil(shortened.length / 2);
  const spaceNearMid = shortened.lastIndexOf(" ", mid);
  if (spaceNearMid > 3) {
    return [
      shortened.slice(0, spaceNearMid),
      shortened.slice(spaceNearMid + 1),
    ];
  }
  return [
    shortened.slice(0, mid),
    shortened.slice(mid),
  ];
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Ease-out cubic for wheel deceleration.
 */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}
