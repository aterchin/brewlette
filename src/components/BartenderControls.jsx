import { useState } from "react";
import { isDefaultPassword } from "../utils/storage.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import "./BartenderControls.css";

const DEFAULT_PASSWORD_HINT = "Default password is brewlette";

export default function BartenderControls({
  onBack,
  onReset,
  onChangePassword,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const showDefaultHint = isDefaultPassword();

  function resetPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setPasswordError("");
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordSuccess(false);

    const next = newPassword.trim();
    if (next === "") {
      setPasswordError("New password can’t be empty.");
      return;
    }

    const result = onChangePassword(currentPassword, next);
    if (!result?.ok) {
      setPasswordError(result?.error || "Couldn’t change password.");
      return;
    }

    resetPasswordForm();
    setPasswordSuccess(true);
  }

  function confirmReset() {
    onReset();
    setPasswordSuccess(false);
    setResetConfirmOpen(false);
  }

  return (
    <section className="bartender-controls" aria-label="Bartender controls">
      <header className="bartender-controls__topbar">
        <div className="bartender-controls__topbar-copy">
          <h2>Controls</h2>
          <p>Administrative settings</p>
        </div>
        <div className="bartender-controls__topbar-actions">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </header>

      <div className="bartender-controls__body">
        <div className="bartender-controls__panel">
          <h3>Demo list</h3>
          <p className="bartender-controls__copy">
            Replace the current wheel with the built-in sample beer list.
          </p>
          <div className="bartender-controls__actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setResetConfirmOpen(true)}
            >
              Reset to demo
            </button>
          </div>
        </div>

        {onChangePassword ? (
          <div className="bartender-controls__panel">
            <h3>Change password</h3>
            <p className="bartender-controls__copy">
              Soft lock for the edit screen. Stored on this device only.
            </p>
            <form
              className="bartender-controls__password-form"
              onSubmit={handlePasswordSubmit}
            >
              <label className="bartender-controls__field">
                <span>Current password</span>
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder={showDefaultHint ? DEFAULT_PASSWORD_HINT : undefined}
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                />
              </label>
              <label className="bartender-controls__field">
                <span>New password</span>
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck="false"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                />
              </label>
              {passwordError ? (
                <p className="bartender-controls__error" role="alert">
                  {passwordError}
                </p>
              ) : null}
              {passwordSuccess ? (
                <p className="bartender-controls__success" role="status">
                  Password updated.
                </p>
              ) : null}
              <button type="submit" className="btn btn-primary">
                Save password
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset beer list?"
        message="Reset to the demo beer list? This replaces your current list."
        confirmLabel="Reset"
        onConfirm={confirmReset}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </section>
  );
}
