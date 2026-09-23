import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../utils/wheel.js";
import "./BeerResult.css";

const FADE_OUT_MS = 280;

export default function BeerResult({ beer, onSpinAgain }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setLeaving(false);

    if (prefersReducedMotion()) {
      setShowDetails(true);
      setShowSurprise(true);
      return undefined;
    }

    setShowDetails(false);
    setShowSurprise(false);

    const detailsTimer = window.setTimeout(() => setShowDetails(true), 700);
    const surpriseTimer = window.setTimeout(() => setShowSurprise(true), 1300);

    return () => {
      window.clearTimeout(detailsTimer);
      window.clearTimeout(surpriseTimer);
    };
  }, [beer?.id]);

  useEffect(() => {
    if (!leaving) return undefined;

    if (prefersReducedMotion()) {
      onSpinAgain();
      return undefined;
    }

    const timer = window.setTimeout(onSpinAgain, FADE_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving, onSpinAgain]);

  function handleSpinAgain() {
    if (leaving) return;
    setLeaving(true);
  }

  if (!beer) return null;

  const className = [
    "beer-result",
    beer.isZero ? "beer-result--zero" : "",
    leaving ? "beer-result--leaving" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (beer.isZero) {
    const message = beer.surprise?.trim() || "SPIN AGAIN";
    return (
      <section className={className} aria-live="polite">
        <p className="visually-hidden">Zero. {message}.</p>
        <p className="beer-result__number">#0</p>
        <h2
          className={`beer-result__name beer-result__zero-message ${
            showSurprise ? "is-visible" : ""
          }`}
        >
          {message}
        </h2>
        <div className="beer-result__actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSpinAgain}
            disabled={leaving}
          >
            Spin again
          </button>
        </div>
      </section>
    );
  }

  const abvLabel =
    typeof beer.abv === "number" && Number.isFinite(beer.abv)
      ? `${formatAbv(beer.abv)}% ABV`
      : null;

  const surprise = beer.surprise?.trim();

  return (
    <section className={className} aria-live="polite">
      <p className="visually-hidden">
        {beer.number != null ? `Number ${beer.number}, ` : ""}
        {beer.name} selected.
      </p>

      {beer.number != null && (
        <p className="beer-result__number">#{beer.number}</p>
      )}
      <h2 className="beer-result__name">{beer.name}</h2>

      <div
        className={`beer-result__meta ${showDetails ? "is-visible" : ""}`}
      >
        {(beer.brewery || beer.style) && (
          <p className="beer-result__brewery">
            {[beer.brewery, beer.style].filter(Boolean).join(" · ")}
          </p>
        )}
        {abvLabel && <p className="beer-result__abv">{abvLabel}</p>}
        {beer.description?.trim() && (
          <p className="beer-result__description">{beer.description}</p>
        )}
      </div>

      {surprise && (
        <blockquote
          className={`beer-result__surprise ${showSurprise ? "is-visible" : ""}`}
        >
          “{surprise}”
        </blockquote>
      )}

      <div className="beer-result__actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSpinAgain}
          disabled={leaving}
        >
          Spin again
        </button>
      </div>
    </section>
  );
}

function formatAbv(abv) {
  return Number.isInteger(abv) ? String(abv) : abv.toFixed(1);
}
