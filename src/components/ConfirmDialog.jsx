import { useEffect, useId, useRef } from "react";
import "./ConfirmDialog.css";

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

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      confirmRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
    >
      <button
        type="button"
        className="confirm-dialog__backdrop"
        aria-label="Cancel"
        onClick={onCancel}
      />
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
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
