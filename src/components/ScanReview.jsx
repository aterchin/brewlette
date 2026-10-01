import { useState } from "react";
import BackButton from "./BackButton.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { MAX_BEERS } from "../utils/storage.js";
import "./BartenderControls.css";
import "./BeerEditor.css";
import "./ScanReview.css";

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/**
 * Beers read from the marquee, shown before they replace the bartender's list.
 * `beers` is already normalized (ids, unique numbers, max MAX_BEERS).
 */
export default function ScanReview({ beers, skippedCount, currentCount, onReplace, onCancel }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className="bartender-controls" aria-label="Review scanned beers">
      <header className="bartender-controls__topbar">
        <BackButton onClick={onCancel} label="Back to photos" />
        <div className="bartender-controls__topbar-copy">
          <h2>Review beers</h2>
          <p>{plural(beers.length, "beer")} read from the board</p>
        </div>
      </header>

      {beers.length > 0 ? (
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
      ) : null}

      <div className="bartender-controls__panel">
        {beers.length === 0 ? (
          <p className="bartender-controls__copy">
            No beers found. Try a straighter, closer photo of the board.
          </p>
        ) : (
          <p className="bartender-controls__copy">
            Check the list above. You can fix any mistakes in the beer list after replacing.
          </p>
        )}
        {skippedCount > 0 ? (
          <p className="bartender-controls__copy">
            Skipped {skippedCount} {skippedCount === 1 ? "entry" : "entries"} (unreadable
            name, or over the {MAX_BEERS}-beer limit).
          </p>
        ) : null}

        <div className="bartender-controls__actions">
          <button
            type="button"
            className="btn scoop btn-primary"
            onClick={() => setConfirmOpen(true)}
            disabled={beers.length === 0}
          >
            Replace list
          </button>
          <button type="button" className="btn scoop btn-ghost" onClick={onCancel}>
            Discard
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Replace beer list?"
        message={`Replace your ${plural(currentCount, "beer")} with these ${beers.length}?`}
        confirmLabel="Replace"
        onConfirm={() => {
          setConfirmOpen(false);
          onReplace(beers);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
