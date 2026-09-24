import { useEffect, useRef, useState } from "react";
import "./BartenderUnlock.css";

function friendlyAuthError(error) {
  const code = error?.code;
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-email"
  ) {
    return "Nope.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many tries. Wait a bit.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Try again.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "";
  }
  if (code === "auth/popup-blocked") {
    return "Popup blocked. Allow popups and try again.";
  }
  if (code === "auth/account-exists-with-different-credential") {
    return "Use the sign-in method you used before.";
  }
  return "Couldn’t sign in.";
}

export default function BartenderUnlock({
  open,
  onSignIn,
  onSignInGoogle,
  onSignInFacebook,
  onCancel,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);
  const hasOauth = Boolean(onSignInGoogle || onSignInFacebook);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
    setSubmitting(false);
    const id = window.requestAnimationFrame(() => {
      emailRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event) {
      if (event.key === "Escape" && !submitting) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, submitting]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSignIn(trimmedEmail, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (submitting || !onSignInGoogle) return;
    setSubmitting(true);
    setError("");
    try {
      await onSignInGoogle();
    } catch (err) {
      const message = friendlyAuthError(err);
      if (message) setError(message);
      setSubmitting(false);
    }
  }

  async function handleFacebook() {
    if (submitting || !onSignInFacebook) return;
    setSubmitting(true);
    setError("");
    try {
      await onSignInFacebook();
    } catch (err) {
      const message = friendlyAuthError(err);
      if (message) setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="bartender-unlock"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bartender-unlock-title"
    >
      <button
        type="button"
        className="bartender-unlock__backdrop"
        aria-label="Cancel"
        onClick={onCancel}
        disabled={submitting}
      />
      <div className="bartender-unlock__card">
        <h2 id="bartender-unlock-title">Bartender only</h2>
        <p className="bartender-unlock__copy">
          Sign in to edit the beer list.
        </p>
        <form className="bartender-unlock__form" onSubmit={handleSubmit}>
          <label className="bartender-unlock__field" htmlFor="bartender-email">
            <span>Email</span>
            <input
              ref={emailRef}
              id="bartender-email"
              type="email"
              autoComplete="username"
              spellCheck="false"
              value={email}
              disabled={submitting}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
            />
          </label>
          <label
            className="bartender-unlock__field"
            htmlFor="bartender-password"
          >
            <span>Password</span>
            <div className="bartender-unlock__password">
              <input
                id="bartender-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                disabled={submitting}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError("");
                }}
              />
              <button
                type="button"
                className="bartender-unlock__visibility"
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={submitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              />
            </div>
          </label>
          {error ? (
            <p className="bartender-unlock__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="bartender-unlock__actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            {hasOauth ? (
              <>
                <p className="bartender-unlock__divider" role="separator">
                  <span>or</span>
                </p>
                {onSignInGoogle ? (
                  <button
                    type="button"
                    className="btn btn-ghost bartender-unlock__oauth bartender-unlock__oauth--google"
                    onClick={handleGoogle}
                    disabled={submitting}
                  >
                    Continue with Google
                  </button>
                ) : null}
                {onSignInFacebook ? (
                  <button
                    type="button"
                    className="btn btn-ghost bartender-unlock__oauth bartender-unlock__oauth--facebook"
                    onClick={handleFacebook}
                    disabled={submitting}
                  >
                    Continue with Facebook
                  </button>
                ) : null}
              </>
            ) : null}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
