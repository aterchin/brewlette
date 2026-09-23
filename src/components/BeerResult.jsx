import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../utils/wheel.js";
import "./BeerResult.css";

export default function BeerResult({ beer, onSpinAgain }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShowDetails(true);
      setShowSurprise(true);
      return undefined;
    }

    setShowDetails(false);
    setShowSurprise(false);

    const detailsTimer = window.setTimeout(() => setShowDetails(true), 280);
    const surpriseTimer = window.setTimeout(() => setShowSurprise(true), 900);

    return () => {
      window.clearTimeout(detailsTimer);
      window.clearTimeout(surpriseTimer);
    };
  }, [beer?.id]);

  if (!beer) return null;

  const abvLabel =
    typeof beer.abv === "number" && Number.isFinite(beer.abv)
      ? `${formatAbv(beer.abv)}% ABV`
      : null;

  const surprise = beer.surprise?.trim();

  return (
    <section className="beer-result" aria-live="polite">
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
        <button type="button" className="btn btn-primary" onClick={onSpinAgain}>
          Spin again
        </button>
      </div>
    </section>
  );
}

function formatAbv(abv) {
  return Number.isInteger(abv) ? String(abv) : abv.toFixed(1);
}
