import { X } from "lucide-react";
import "./Tip.css";

/**
 * Speech bubble pointing at the next thing to tap.
 * `placement` is where the bubble sits relative to its target.
 */
export default function Tip({ children, onDismiss, placement = "above", className = "" }) {
  return (
    <div className={`tip tip--${placement} ${className}`.trim()} role="note">
      <p className="tip__text">{children}</p>
      <button
        type="button"
        className="tip__close"
        onClick={onDismiss}
        aria-label="Dismiss tip"
        title="Got it"
      >
        <X size={20} strokeWidth={2.75} aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}
