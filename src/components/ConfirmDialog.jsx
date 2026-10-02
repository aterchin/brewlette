import { useEffect, useId, useRef, useState } from "react";
import "./ConfirmDialog.css";

const EXIT_MS = 320;
const EXIT_MS_REDUCED = 120;

function exitDuration() {
  if (typeof window === "undefined" || !window.matchMedia) return EXIT_MS;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? EXIT_MS_REDUCED
    : EXIT_MS;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const messageId = useId();
  const confirmRef = useRef(null);
  const exitTimerRef = useRef(null);
  const [exiting, setExiting] = useState(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setExiting(null);
  }

  useEffect(() => () => window.clearTimeout(exitTimerRef.current), []);

  function leave(kind, callback) {
    if (exiting) return;
    setExiting(kind);
    exitTimerRef.current = window.setTimeout(callback, exitDuration());
  }

  const cancel = () => leave("cancel", onCancel);
  const confirm = () => leave("confirm", onConfirm);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      confirmRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event) {
      if (event.key === "Escape") cancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!open) return null;

  return (
    <div
      className="confirm-dialog"
      data-exiting={exiting ?? undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
    >
      <button
        type="button"
        className="confirm-dialog__backdrop"
        aria-label="Cancel"
        onClick={cancel}
      />
      <div className="confirm-dialog__sign">
        <span className="confirm-dialog__chain" aria-hidden="true" />
        <span className="confirm-dialog__chain" aria-hidden="true" />
        <div className="confirm-dialog__card">
          <h2 id={titleId}>{title}</h2>
          {message ? (
            <p id={messageId} className="confirm-dialog__copy">
              {message}
            </p>
          ) : null}
          <div className="confirm-dialog__actions">
            <button
              ref={confirmRef}
              type="button"
              className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
              onClick={confirm}
            >
              {confirmLabel}
            </button>
            <button type="button" className="btn btn-ghost" onClick={cancel}>
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
