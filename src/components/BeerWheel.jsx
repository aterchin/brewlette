import { useEffect, useRef } from "react";
import {
  easeMechanical,
  getSliceAngle,
  getSliceMidAngle,
  getSliceStartAngle,
  getTargetRotation,
  normalizeDegrees,
  prefersReducedMotion,
  shortenLabel,
} from "../utils/wheel.js";
import { randomIndex } from "../utils/random.js";
import "./BeerWheel.css";

const SLICE_COLORS = ["#1a1f26", "#991b1b", "#fdfbf7", "#064e3b"];
const SLICE_TEXT = ["#fdfbf7", "#fdfbf7", "#12161a", "#fdfbf7"];
const STROKE = "#0b0d11";
const RIM = "#f59e0b";
const HUB = "#12161a";
const HUB_RING = "#f59e0b";
const INNER_RING = "#fdfbf7";

/**
 * @param {{
 *   beers: Array<{ id: string, name: string }>,
 *   spinning: boolean,
 *   onSpinComplete: (beer: object, index: number) => void,
 *   rotationRef: React.MutableRefObject<number>,
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
      drawWheel(canvas, beers, rotationRef.current, cssSize, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [beers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    drawWheel(canvas, beers, rotationRef.current, sizeRef.current, dpr);
  }, [beers]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function spin() {
    if (disabled || spinning || lockRef.current || !beers.length) return;

    lockRef.current = true;
    const winnerIndex = randomIndex(beers.length);
    const winner = beers[winnerIndex];
    onSpinStart?.(winner, winnerIndex);

    const reduced = prefersReducedMotion();
    const from = rotationRef.current;
    const to = getTargetRotation({
      winnerIndex,
      count: beers.length,
      currentRotation: from,
      minSpins: reduced ? 1 : 4,
      maxSpins: reduced ? 1 : 7,
    });

    const duration = reduced ? 400 : 4200;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeMechanical(t);
      const current = from + (to - from) * eased;
      rotationRef.current = current;

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        drawWheel(canvas, beers, current, sizeRef.current, dpr);
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
          aria-label={`Beer wheel with ${beers.length} beers`}
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

function drawWheel(canvas, beers, rotationDeg, cssSize, dpr) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = cssSize;
  const count = beers.length;
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

  for (let i = 0; i < count; i += 1) {
    const startDeg = getSliceStartAngle(i, count);
    const start = (startDeg * Math.PI) / 180;
    const end = ((startDeg + slice) * Math.PI) / 180;
    const colorIndex = i % SLICE_COLORS.length;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 2, start, end);
    ctx.closePath();
    ctx.fillStyle = SLICE_COLORS[colorIndex];
    ctx.fill();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 3;
    ctx.stroke();

    const midDeg = getSliceMidAngle(i, count);
    const midRad = (midDeg * Math.PI) / 180;
    const maxChars = count > 16 ? 14 : count > 12 ? 16 : count > 8 ? 20 : 24;
    const title = shortenLabel(beers[i].name, maxChars);
    const hasNumber = beers[i].number != null;
    const numberLabel = hasNumber ? String(beers[i].number) : null;

    // Radial labels: hub → rim. Flip left-side slices so type stays upright.
    const screenDeg = normalizeDegrees(midDeg + rotationDeg);
    const flip = screenDeg > 90 && screenDeg < 270;
    const titleSize = Math.max(
      14,
      Math.min(22, radius * (count > 14 ? 0.062 : 0.072))
    );
    const numberSize = titleSize * 2.15;
    const numberStart = radius * 0.22;
    const titleStart = hasNumber ? radius * 0.42 : radius * 0.26;

    ctx.save();
    ctx.rotate(midRad);
    if (flip) ctx.rotate(Math.PI);
    ctx.fillStyle = SLICE_TEXT[colorIndex];
    ctx.textAlign = flip ? "right" : "left";
    ctx.textBaseline = "middle";

    if (numberLabel) {
      ctx.font = `700 ${numberSize}px "Abril Fatface", Georgia, serif`;
      ctx.fillText(numberLabel, flip ? -numberStart : numberStart, 0);
    }

    ctx.font = `700 ${titleSize}px Arvo, Georgia, serif`;
    ctx.fillText(title, flip ? -titleStart : titleStart, 0);
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
