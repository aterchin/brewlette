import { useEffect, useRef, useState } from "react";
import {
  checkPassword,
  isDefaultPassword,
  setSessionUnlocked,
} from "../utils/storage.js";
import "./BartenderUnlock.css";

const DEFAULT_PASSWORD_HINT = "Default password is brewlette";

export default function BartenderUnlock({ open, onUnlock, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const showDefaultHint = isDefaultPassword();

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError("");
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
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

  function handleSubmit(event) {
    event.preventDefault();
    if (checkPassword(password)) {
      setSessionUnlocked(true);
      setPassword("");
      setError("");
      onUnlock();
      return;
    }
    setError("Nope.");
  }

  return (
    <div className="bartender-unlock" role="dialog" aria-modal="true" aria-labelledby="bartender-unlock-title">
      <button
        type="button"
        className="bartender-unlock__backdrop"
        aria-label="Cancel"
        onClick={onCancel}
      />
      <div className="bartender-unlock__card">
        <h2 id="bartender-unlock-title">Bartender only</h2>
        <p className="bartender-unlock__copy">Enter the password to edit the beer list.</p>
        <form className="bartender-unlock__form" onSubmit={handleSubmit}>
          <label className="bartender-unlock__field" htmlFor="bartender-password">
            <span>Password</span>
            {showDefaultHint ? (
              <p className="bartender-unlock__hint">{DEFAULT_PASSWORD_HINT}</p>
            ) : null}
            <input
              ref={inputRef}
              id="bartender-password"
              type="text"
              autoComplete="off"
              spellCheck="false"
              placeholder={showDefaultHint ? DEFAULT_PASSWORD_HINT : undefined}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
            />
          </label>
          {error ? (
            <p className="bartender-unlock__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="bartender-unlock__actions">
            <button type="submit" className="btn btn-primary">
              Unlock
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
