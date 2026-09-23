import { useEffect, useRef } from "react";
import {
  buildWheelSegments,
  easeMechanical,
  easeMechanicalSpin,
  getSliceAngle,
  getSliceMidAngle,
  getSliceStartAngle,
  getTargetRotation,
  prefersReducedMotion,
} from "../utils/wheel.js";
import { randomIndex } from "../utils/random.js";
import "./BeerWheel.css";

const BLACK = "#0b0d11";
const RED = "#991b1b";
const GREEN = "#064e3b";
const TEXT = "#fdfbf7";
const STROKE = "#0b0d11";
const RIM = "#f59e0b";
const HUB = "#12161a";
const HUB_RING = "#f59e0b";
const INNER_RING = "#fdfbf7";

/**
 * @param {{
 *   beers: Array<{ id: string, name: string, number?: number }>,
 *   spinning: boolean,
 *   onSpinStart?: (segment: object, index: number) => void,
 *   onSpinComplete: (segment: object, index: number) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function BeerWheel({
  beers,
  spinning,
  onSpinStart,
  onSpinComplete,
  disabled = false,
}) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animRef = useRef(null);
  const sizeRef = useRef(320);
  const lockRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const segments = buildWheelSegments(beers);

    const resize = () => {
      const parent = canvas.parentElement;
      const cssSize = Math.min(
        parent?.clientWidth || 320,
        typeof window !== "undefined" ? window.innerWidth * 0.88 : 320,
        typeof window !== "undefined" && window.innerWidth >= 768 ? 512 : 448
      );
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = cssSize;
      canvas.width = Math.floor(cssSize * dpr);
      canvas.height = Math.floor(cssSize * dpr);
      canvas.style.width = `${cssSize}px`;
      canvas.style.height = `${cssSize}px`;
      drawWheel(canvas, segments, rotationRef.current, cssSize, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [beers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    drawWheel(
      canvas,
      buildWheelSegments(beers),
      rotationRef.current,
      sizeRef.current,
      dpr
    );
  }, [beers]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function spin() {
    if (disabled || spinning || lockRef.current || !beers.length) return;

    lockRef.current = true;
    const pockets = buildWheelSegments(beers);
    const winnerIndex = randomIndex(pockets.length);
    const winner = pockets[winnerIndex];
    onSpinStart?.(winner, winnerIndex);

    const reduced = prefersReducedMotion();
    const from = rotationRef.current;
    const to = getTargetRotation({
      winnerIndex,
      count: pockets.length,
      currentRotation: from,
      minSpins: reduced ? 1 : 5,
      maxSpins: reduced ? 1 : 8,
    });

    const duration = reduced ? 400 : 8000;
    const delta = to - from;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = reduced ? easeMechanical(t) : easeMechanicalSpin(t);
      const current = from + delta * eased;
      rotationRef.current = current;

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        drawWheel(canvas, pockets, current, sizeRef.current, dpr);
      }

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        rotationRef.current = to;
        lockRef.current = false;
        onSpinComplete?.(winner, winnerIndex);
      }
    };

    animRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="beer-wheel">
      <div className="beer-wheel__stage" aria-hidden={spinning ? "false" : undefined}>
        <canvas
          ref={canvasRef}
          className="beer-wheel__canvas"
          role="img"
          aria-label={`Roulette wheel with ${beers.length} taps and a green zero`}
        />
        <div className="beer-wheel__pointer" aria-hidden="true" />
      </div>
      <button
        type="button"
        className="btn btn-primary beer-wheel__spin"
        onClick={spin}
        disabled={disabled || spinning || beers.length === 0}
      >
        {spinning ? "Spinning…" : "Spin"}
      </button>
    </div>
  );
}

function sliceColors(segment, nonZeroIndex) {
  if (segment?.isZero) {
    return { fill: GREEN, text: TEXT };
  }
  if (nonZeroIndex % 2 === 0) {
    return { fill: BLACK, text: TEXT };
  }
  return { fill: RED, text: TEXT };
}

function drawWheel(canvas, segments, rotationDeg, cssSize, dpr) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = cssSize;
  const count = segments.length;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  if (count === 0) return;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);

  // Outer rim ring (static carnival metal feel)
  ctx.beginPath();
  ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 3;
  ctx.stroke();

  const slice = getSliceAngle(count);
  let nonZeroIndex = 0;

  for (let i = 0; i < count; i += 1) {
    const segment = segments[i];
    const startDeg = getSliceStartAngle(i, count);
    const start = (startDeg * Math.PI) / 180;
    const end = ((startDeg + slice) * Math.PI) / 180;
    const colors = sliceColors(
      segment,
      segment?.isZero ? 0 : nonZeroIndex
    );
    if (!segment?.isZero) nonZeroIndex += 1;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 2, start, end);
    ctx.closePath();
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 3;
    ctx.stroke();

    const midDeg = getSliceMidAngle(i, count);
    const midRad = (midDeg * Math.PI) / 180;
    const numberLabel =
      segment?.number != null ? String(segment.number) : null;
    if (!numberLabel) continue;

    // Near the outer rim; tops toward the hub (real roulette), same draw pass — no extra cost.
    const numberSize = Math.max(
      18,
      Math.min(34, radius * (count > 16 ? 0.085 : count > 12 ? 0.095 : 0.11))
    );
    const numberPos = radius * 0.88;

    ctx.save();
    ctx.rotate(midRad);
    ctx.translate(numberPos, 0);
    // +X was outward; +90° makes text run along the rim with glyph tops pointing inward.
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = colors.text;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${numberSize}px "Abril Fatface", Georgia, serif`;
    ctx.fillText(numberLabel, 0, 0);
    ctx.restore();
  }

  // Inner cream ring
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(28, radius * 0.14), 0, Math.PI * 2);
  ctx.fillStyle = INNER_RING;
  ctx.fill();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Hub
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(16, radius * 0.08), 0, Math.PI * 2);
  ctx.fillStyle = HUB;
  ctx.fill();
  ctx.strokeStyle = HUB_RING;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.restore();
}
