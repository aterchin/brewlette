import { useEffect, useRef, useState } from "react";
import "./BartenderUnlock.css";

function friendlyAuthError(error, mode) {
  const code = error?.code;
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-email"
  ) {
    return "Nope.";
  }
  if (code === "auth/email-already-in-use") {
    return "That email is already registered.";
  }
  if (code === "auth/weak-password") {
    return "Password must be at least 6 characters.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many tries. Wait a bit.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Try again.";
  }
  if (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  ) {
    return "";
  }
  if (code === "auth/popup-blocked") {
    return "Popup blocked. Allow popups and try again.";
  }
  if (code === "auth/account-exists-with-different-credential") {
    return "Use the sign-in method you used before.";
  }
  return mode === "register" ? "Couldn’t create account." : "Couldn’t sign in.";
}

export default function BartenderUnlock({
  onSignIn,
  onRegister,
  onSignInGoogle,
  onCancel,
}) {
  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);
  const isRegister = mode === "register";

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      emailRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && !submitting) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, submitting]);

  function switchMode(nextMode) {
    if (submitting || nextMode === mode) return;
    setMode(nextMode);
    setError("");
    setShowPassword(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password required.");
      return;
    }
    if (isRegister && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (isRegister) {
        await onRegister(trimmedEmail, password);
      } else {
        await onSignIn(trimmedEmail, password);
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(friendlyAuthError(err, mode));
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
      const message = friendlyAuthError(err, mode);
      if (message) setError(message);
      setSubmitting(false);
    }
  }

  return (
    <section
      className="bartender-unlock"
      aria-labelledby="bartender-unlock-title"
    >
      <header className="bartender-unlock__topbar">
        <div className="bartender-unlock__topbar-copy">
          <h2 id="bartender-unlock-title">Bartender only</h2>
          <p className="bartender-unlock__copy">
            {isRegister
              ? "Create an account to edit the beer list."
              : "Sign in to edit the beer list."}
          </p>
        </div>
      </header>

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
              autoComplete={isRegister ? "new-password" : "current-password"}
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
            {submitting
              ? isRegister
                ? "Creating…"
                : "Signing in…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => switchMode(isRegister ? "signIn" : "register")}
            disabled={submitting}
          >
            {isRegister ? "Sign in instead" : "Create an account"}
          </button>
          {onSignInGoogle ? (
            <>
              <p className="bartender-unlock__divider" role="separator">
                <span>or</span>
              </p>
              <button
                type="button"
                className="btn btn-ghost bartender-unlock__oauth bartender-unlock__oauth--google"
                onClick={handleGoogle}
                disabled={submitting}
              >
                Continue with Google
              </button>
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
    </section>
  );
}
