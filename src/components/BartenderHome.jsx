import { useState } from "react";
import { Camera, ChevronRight } from "lucide-react";
import BackButton from "./BackButton.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import Tip from "./Tip.jsx";
import { useTip } from "../hooks/useTip.js";
import "./BartenderControls.css";
import "./BartenderHome.css";

/**
 * First screen after sign-in: scanning the board is the main action,
 * the beer list is second, account actions sit quietly at the bottom.
 */
export default function BartenderHome({
  beerCount,
  onBack,
  onScanMarquee,
  onOpenList,
  onReset,
  userEmail,
  onSignOut,
}) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [scanTipUnseen, dismissScanTip] = useTip("scan");

  function openScan() {
    dismissScanTip();
    onScanMarquee();
  }

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
    <section className="bartender-controls" aria-label="Bartender home">
      <header className="bartender-controls__topbar">
        <BackButton onClick={onBack} label="Back to wheel" />
        <div className="bartender-controls__topbar-copy">
          <h2>Behind the bar</h2>
          {userEmail ? <p>{userEmail}</p> : null}
        </div>
      </header>

      <div className="bartender-home__cards">
        {onScanMarquee ? (
          <div className="bartender-home__scan-wrap">
            {scanTipUnseen ? (
              <Tip
                className="bartender-home__tip"
                placement="above-start"
                onDismiss={dismissScanTip}
              >
                Start here. Take a photo of your chalkboard or menu.
              </Tip>
            ) : null}
            <button type="button" className="bartender-home__scan" onClick={openScan}>
              <span className="bartender-home__scan-photo" aria-hidden="true">
                <Camera size={56} strokeWidth={2} />
              </span>
              <span className="bartender-home__scan-title">Scan your board</span>
              <span className="bartender-home__scan-sub">
                Snap the tap list to add beers.
              </span>
            </button>
          </div>
        ) : null}

        <button type="button" className="bartender-home__list" onClick={onOpenList}>
          <span className="bartender-home__list-count" aria-hidden="true">
            {beerCount}
          </span>
          <span className="bartender-home__list-copy">
            <strong>Beer list</strong>
            <span>
              {beerCount === 1 ? "1 beer" : `${beerCount} beers`} on the wheel
            </span>
          </span>
          <ChevronRight size={28} strokeWidth={2.5} aria-hidden="true" focusable="false" />
        </button>
      </div>

      <footer className="bartender-home__footer">
        {signOutError ? (
          <p className="bartender-controls__error bartender-home__error" role="alert">
            {signOutError}
          </p>
        ) : null}
        <div className="bartender-home__footer-links">
          {onSignOut ? (
            <button
              type="button"
              className="btn-link"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          ) : null}
          <button
            type="button"
            className="btn-link btn-link--danger"
            onClick={() => setResetConfirmOpen(true)}
          >
            Reset to demo
          </button>
        </div>
      </footer>

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
