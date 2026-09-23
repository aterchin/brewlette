/** Degrees in a full circle. */
export const FULL_CIRCLE = 360;

/** Green-zero pocket — not a tap; result is surprise-only (default SPIN AGAIN). */
export const WHEEL_ZERO = Object.freeze({
  id: "__wheel_zero__",
  number: 0,
  isZero: true,
  surprise: "SPIN AGAIN",
});

/**
 * Wheel pockets: green 0 first, then the live tap list.
 * Zero is never stored in the beer list.
 */
export function buildWheelSegments(beers) {
  const list = Array.isArray(beers) ? beers : [];
  return [WHEEL_ZERO, ...list];
}

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
 * Target wheel rotation so slice `winnerIndex` lands under the pointer.
 * Adds full spins for theatrical effect. Rotation is CSS-style degrees
 * (positive = clockwise when applied as rotate()).
 *
 * ## Pointer / landing math
 *
 * Canvas angles: 0° = 3 o’clock, positive = clockwise (same as ctx.rotate /
 * ctx.arc). Slice geometry is drawn in wheel-local space with index 0 starting
 * at -90° (12 o’clock). After we apply rotation R to the canvas, a point drawn
 * at local angle `θ` appears on screen at `θ + R`.
 *
 * We pick the winner first (crypto index), then choose R so that slice’s
 * midpoint sits on the pointer ray:
 *
 *   mid + R ≡ pointerAngle  (mod 360)
 *   R      ≡ pointerAngle - mid
 *
 * Historically `pointerAngle` was hard-coded as -90° (dead top). That assumed
 * the CSS triangle’s centerline matched the canvas vertical exactly. In
 * practice the pointer is a wide border-triangle (half of it always overhangs
 * each side of the seam), and a diagonal drop-shadow made the gold mass look
 * biased onto the counter-clockwise neighbor — so a correct mid-0 landing
 * could still *feel* like it was sitting on 19.
 *
 * We now measure the pointer’s layout-box center vs the canvas center
 * (`measurePointerAngleDeg`) and pass that in as `pointerAngleDeg`, so the
 * indicator is the div’s horizontal middle — not an assumed -90°. Rest pose
 * (`getRestRotation`) parks mid-0 on that same ray so idle isn’t the 19|0
 * seam. The wheel stays mounted under the result view so remounting doesn’t
 * snap R back to 0 and reintroduce the seam illusion after a zero win.
 *
 * @param {number} [pointerAngleDeg=-90] screen angle of the pointer (canvas
 *   convention: 0 = 3 o’clock, positive clockwise). Default is 12 o’clock.
 */
export function getTargetRotation({
  winnerIndex,
  count,
  currentRotation = 0,
  minSpins = 4,
  maxSpins = 7,
  pointerAngleDeg = -90,
}) {
  if (!count || count < 1) return currentRotation;

  // mid + R ≡ pointerAngle  →  R ≡ pointerAngle - mid  (see block comment above)
  const mid = getSliceMidAngle(winnerIndex, count);
  const landing = normalizeDegrees(pointerAngleDeg - mid);

  const spinRange = Math.max(1, maxSpins - minSpins + 1);
  const spins = minSpins + Math.floor(Math.random() * spinRange);

  const currentNorm = normalizeDegrees(currentRotation);
  let delta = normalizeDegrees(landing - currentNorm);
  if (delta < 1) {
    delta += FULL_CIRCLE;
  }

  return currentRotation + spins * FULL_CIRCLE + delta;
}

/**
 * Rest rotation that parks slice `index` mid under the pointer (no full spins).
 * Same identity as getTargetRotation’s landing step: R ≡ pointerAngle - mid.
 */
export function getRestRotation(index, count, pointerAngleDeg = -90) {
  if (!count || count < 1) return 0;
  const mid = getSliceMidAngle(index, count);
  return normalizeDegrees(pointerAngleDeg - mid);
}

/**
 * Angle from wheel center to the horizontal middle of the pointer box.
 *
 * Uses getBoundingClientRect() layout boxes (filters/shadows don’t inflate
 * the rect), so a diagonal drop-shadow can’t skew the measured centerline.
 * atan2(dy, dx) with screen y-down matches canvas clockwise-from-3-o’clock.
 * Falls back to -90° if either node isn’t measurable yet.
 *
 * @param {HTMLElement} canvas
 * @param {HTMLElement} pointerEl
 * @returns {number} degrees in canvas convention (0 = 3 o’clock, +clockwise)
 */
export function measurePointerAngleDeg(canvas, pointerEl) {
  if (!canvas || !pointerEl) return -90;

  const wheel = canvas.getBoundingClientRect();
  const pointer = pointerEl.getBoundingClientRect();
  if (wheel.width < 1 || wheel.height < 1) return -90;

  const cx = wheel.left + wheel.width / 2;
  const cy = wheel.top + wheel.height / 2;
  const px = pointer.left + pointer.width / 2;
  const py = pointer.top + pointer.height / 2;

  const deg = (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
  return Number.isFinite(deg) ? deg : -90;
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
