import BackButton from "./BackButton.jsx";
import { MAX_BEERS } from "../utils/storage.js";
import "./BartenderControls.css";
import "./BeerEditor.css";
import "./ScanReview.css";

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/**
 * Beers read from the marquee, shown before they replace the bartender's list.
 * This screen is the confirmation, so "Put on the wheel" replaces right away.
 * `beers` is already normalized (ids, unique numbers, max MAX_BEERS).
 */
export default function ScanReview({ beers, skippedCount, currentCount, onReplace, onCancel }) {
  const found = beers.length > 0;

  return (
    <section className="bartender-controls" aria-label="Review scanned beers">
      <header className="bartender-controls__topbar">
        <BackButton onClick={onCancel} label="Back to photos" />
        <div className="bartender-controls__topbar-copy">
          <h2>{found ? "Look it over" : "No beers found"}</h2>
          <p>{found ? `${plural(beers.length, "beer")} on the board` : "Try another photo"}</p>
        </div>
      </header>

      {found ? (
        <ul className="beer-editor__nav">
          {beers.map((beer) => (
            <li key={beer.id} className="beer-editor__nav-item scan-review__item">
              <span className="beer-editor__nav-number" aria-hidden="true">
                #{beer.number}
              </span>
              <span className="beer-editor__nav-copy">
                <strong>
                  <span className="visually-hidden">Number {beer.number}. </span>
                  {beer.name}
                </strong>
                <span>
                  {[beer.brewery, beer.style, beer.abv != null ? `${beer.abv}%` : ""]
                    .filter(Boolean)
                    .join(" · ") || "No details"}
                </span>
                {beer.description ? (
                  <span className="scan-review__description">{beer.description}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bartender-controls__panel">
          <p className="bartender-controls__copy scan-review__empty">
            A straighter, closer shot of the board usually does it.
          </p>
        </div>
      )}

      {skippedCount > 0 ? (
        <p className="scan-review__skipped">
          Skipped {skippedCount} {skippedCount === 1 ? "entry" : "entries"} (unreadable
          name, or over the {MAX_BEERS}-beer limit).
        </p>
      ) : null}

      <div className="action-bar">
        {found ? (
          <>
            <button
              type="button"
              className="btn btn-primary btn-xl"
              onClick={() => onReplace(beers)}
            >
              Put on the wheel
            </button>
            {currentCount > 0 ? (
              <p className="action-bar__note">
                Replaces your current {plural(currentCount, "beer")}. You can fix mistakes in
                the beer list.
              </p>
            ) : null}
          </>
        ) : (
          <button type="button" className="btn btn-primary btn-xl" onClick={onCancel}>
            Try another photo
          </button>
        )}
      </div>
    </section>
  );
}
