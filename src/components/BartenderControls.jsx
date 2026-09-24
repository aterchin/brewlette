import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog.jsx";
import "./BartenderControls.css";

export default function BartenderControls({
  onBack,
  onReset,
  userEmail,
  onSignOut,
}) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  function confirmReset() {
    onReset();
    setResetConfirmOpen(false);
  }

  async function handleSignOut() {
    if (signingOut || !onSignOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      await onSignOut();
    } catch {
      setSignOutError("Couldn’t sign out.");
      setSigningOut(false);
    }
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

        {onSignOut ? (
          <div className="bartender-controls__panel">
            <h3>Account</h3>
            <p className="bartender-controls__copy">
              {userEmail
                ? `Signed in as ${userEmail}`
                : "Signed in to edit the beer list."}
            </p>
            {signOutError ? (
              <p className="bartender-controls__error" role="alert">
                {signOutError}
              </p>
            ) : null}
            <div className="bartender-controls__actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
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
