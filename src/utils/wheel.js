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
 * Continuous decelerate into the winner — no overshoot, no bounce, no phased crawl.
 * Fast revolutions early, then a long smooth coast that never re-accelerates.
 *
 * @param {number} t progress 0..1
 */
export function easeMechanicalSpin(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  // Quintic ease-out: most of the travel early, last stretch is a long soft landing
  return 1 - (1 - t) ** 5;
}

/**
 * Mechanical deceleration without bounce — CSS cubic-bezier(0.12, 1, 0.33, 1).
 */
export function easeMechanical(t) {
  return sampleBezier(0.12, 1, 0.33, 1, t);
}

/** @deprecated Prefer easeMechanical */
export function easeOutCubic(t) {
  return easeMechanical(t);
}

function sampleBezier(x1, y1, x2, y2, t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  let start = 0;
  let end = 1;
  let mid = t;

  for (let i = 0; i < 12; i += 1) {
    const x = bezierCoord(mid, x1, x2);
    if (Math.abs(t - x) < 1e-5) break;
    if (x < t) start = mid;
    else end = mid;
    mid = (start + end) / 2;
  }

  return bezierCoord(mid, y1, y2);
}

function bezierCoord(t, a, b) {
  const mt = 1 - t;
  return 3 * mt * mt * t * a + 3 * mt * t * t * b + t * t * t;
}
