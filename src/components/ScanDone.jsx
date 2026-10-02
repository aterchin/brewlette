import "./BartenderControls.css";
import "./ScanDone.css";

/** Payoff after a scan replaces the list: send the bartender back to spin. */
export default function ScanDone({ count, onSpin, onOpenList }) {
  return (
    <section className="bartender-controls scan-done" aria-label="Beer list updated">
      <div className="scan-done__card" role="status">
        <span className="scan-done__count">{count}</span>
        <h2 className="scan-done__title">
          {count === 1 ? "Beer" : "Beers"} on the wheel
        </h2>
      </div>

      <div className="scan-done__actions">
        <button type="button" className="btn btn-primary btn-xl" onClick={onSpin}>
          Spin it
        </button>
        <button type="button" className="btn-link" onClick={onOpenList}>
          Check the list
        </button>
      </div>
    </section>
  );
}
