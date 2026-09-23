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

  // Pointer is fixed at the top (-90°). After clockwise rotation R,
  // a slice mid at `mid` appears at mid + R. Land mid under the pointer:
  // mid + R ≡ -90 (mod 360) → R ≡ -90 - mid.
  const mid = getSliceMidAngle(winnerIndex, count);
  const landing = normalizeDegrees(-90 - mid);

  const spinRange = Math.max(1, maxSpins - minSpins + 1);
  const spins = minSpins + Math.floor(Math.random() * spinRange);

  const currentNorm = normalizeDegrees(currentRotation);
  let delta = normalizeDegrees(landing - currentNorm);
  if (delta < 1) {
    delta += FULL_CIRCLE;
  }

  return currentRotation + spins * FULL_CIRCLE + delta;
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
