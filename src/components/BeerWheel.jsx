import { useEffect, useRef } from "react";
import {
  easeOutCubic,
  getSliceAngle,
  getSliceMidAngle,
  getSliceStartAngle,
  getTargetRotation,
  prefersReducedMotion,
  shortenLabel,
} from "../utils/wheel.js";
import { randomIndex } from "../utils/random.js";
import "./BeerWheel.css";

const POINTER_COLOR = "#e09a3c";
const SLICE_A = "#2a2119";
const SLICE_B = "#3a2e24";
const STROKE = "#4a3c30";
const TEXT = "#f4ebe2";
const HUB = "#14110e";

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
      const eased = easeOutCubic(t);
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
  const radius = size / 2 - 8;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);

  const slice = getSliceAngle(count);

  for (let i = 0; i < count; i += 1) {
    const startDeg = getSliceStartAngle(i, count);
    const start = (startDeg * Math.PI) / 180;
    const end = ((startDeg + slice) * Math.PI) / 180;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? SLICE_A : SLICE_B;
    ctx.fill();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels — single shortened line keeps dense wheels readable
    const midDeg = getSliceMidAngle(i, count);
    const midRad = (midDeg * Math.PI) / 180;
    const labelRadius = radius * (count > 14 ? 0.68 : 0.6);
    const maxChars = count > 16 ? 9 : count > 12 ? 11 : count > 8 ? 14 : 18;
    const label = shortenLabel(beers[i].name, maxChars);

    ctx.save();
    ctx.rotate(midRad);
    ctx.translate(labelRadius, 0);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = TEXT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = Math.max(
      9,
      Math.min(13, (radius * slice) / (count > 14 ? 220 : 180))
    );
    ctx.font = `600 ${fontSize}px Figtree, sans-serif`;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  // Hub
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(18, radius * 0.08), 0, Math.PI * 2);
  ctx.fillStyle = HUB;
  ctx.fill();
  ctx.strokeStyle = POINTER_COLOR;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}
