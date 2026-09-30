import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton.jsx";
import {
  deleteMarqueePhoto,
  loadMarqueePhotos,
  uploadMarqueePhotos,
  validateMarqueeImage,
} from "../utils/marqueeUpload.js";
import "./BartenderControls.css";

// The resize extension usually finishes within a few seconds of upload.
const RESIZE_POLL_MS = 3000;
const RESIZE_POLL_TRIES = 6;

/**
 * Upload 1–2 photos of the beer marquee.
 * Saved photos are loaded from Storage each time the page opens.
 */
export default function MarqueeScan({ uid, onBack }) {
  // In Storage: [{ path, generation, url, originalUrl, resized } | null, ...]
  const [saved, setSaved] = useState([null, null]);
  // Bumped after each upload to start checking for resized copies; 0 = not polling.
  const [resizePoll, setResizePoll] = useState(0);
  // Picked on this visit, not uploaded yet: [File | null, File | null]
  const [pending, setPending] = useState([null, null]);
  const [errors, setErrors] = useState(["", ""]);
  const [status, setStatus] = useState("loading"); // loading | idle | uploading | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadMarqueePhotos(uid)
      .then((photos) => {
        if (cancelled) return;
        setSaved(photos);
        setStatus("idle");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setStatus("error");
        setErrorMessage("Couldn’t load saved photos.");
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => {
    if (!resizePoll) return undefined;
    let cancelled = false;
    let tries = 0;
    let timer;

    function check() {
      tries += 1;
      loadMarqueePhotos(uid)
        .then((photos) => {
          if (cancelled) return;
          setSaved(photos);
          const waiting = photos.some((photo) => photo && !photo.resized);
          if (waiting && tries < RESIZE_POLL_TRIES) {
            timer = setTimeout(check, RESIZE_POLL_MS);
          }
        })
        .catch((error) => console.error(error));
    }

    timer = setTimeout(check, RESIZE_POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [uid, resizePoll]);

  function pickPhoto(index, file) {
    const error = validateMarqueeImage(file);
    const nextPending = [...pending];
    const nextErrors = [...errors];

    nextPending[index] = error ? null : file;
    nextErrors[index] = error || "";

    setPending(nextPending);
    setErrors(nextErrors);
    setStatus("idle");
    setErrorMessage("");
  }

  async function removePhoto(index) {
    // Not uploaded yet: just drop it.
    if (pending[index]) {
      const nextPending = [...pending];
      nextPending[index] = null;
      setPending(nextPending);
      return;
    }

    const photo = saved[index];
    if (!photo) return;

    // A poll finishing mid-delete would bring the photo back.
    setResizePoll(0);
    setStatus("uploading");
    setErrorMessage("");
    try {
      await deleteMarqueePhoto(photo.path);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Couldn’t remove photo. Try again.");
      return;
    }

    const nextSaved = [...saved];
    nextSaved[index] = null;
    setSaved(nextSaved);
    setStatus("idle");
  }

  async function handleUpload() {
    if (!pending.some(Boolean) || status === "uploading") return;

    setStatus("uploading");
    setErrorMessage("");
    try {
      const uploaded = await uploadMarqueePhotos(uid, pending);
      setSaved(uploaded.map((photo, i) => photo || saved[i]));
      setPending([null, null]);
      setStatus("idle");
      setResizePoll((n) => n + 1);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Upload failed. Check your connection and try again.");
    }
  }

  const busy = status === "loading" || status === "uploading";
  const hasPending = pending.some(Boolean);
  const savedCount = saved.filter(Boolean).length;

  return (
    <section className="bartender-controls" aria-label="Scan marquee">
      <header className="bartender-controls__topbar">
        <BackButton onClick={onBack} label="Back to beer list" />
        <div className="bartender-controls__topbar-copy">
          <h2>Scan marquee</h2>
          <p>Upload 1 or 2 photos of your beer wall</p>
        </div>
      </header>

      <div className="bartender-controls__body">
        <PhotoSlot
          label="Photo 1"
          file={pending[0]}
          saved={saved[0]}
          error={errors[0]}
          disabled={busy}
          onPick={(file) => pickPhoto(0, file)}
          onRemove={() => removePhoto(0)}
        />
        <PhotoSlot
          label="Photo 2 (optional)"
          hint="Wall too wide? Add a second shot."
          file={pending[1]}
          saved={saved[1]}
          error={errors[1]}
          disabled={busy}
          onPick={(file) => pickPhoto(1, file)}
          onRemove={() => removePhoto(1)}
        />

        <div className="bartender-controls__panel">
          {status === "error" ? (
            <p className="bartender-controls__error" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {status !== "error" && savedCount > 0 && !hasPending ? (
            <p className="bartender-controls__copy" role="status">
              Saved {savedCount} photo{savedCount === 1 ? "" : "s"}.
            </p>
          ) : null}
          <div className="bartender-controls__actions">
            <button
              type="button"
              className="btn scoop btn-primary"
              onClick={handleUpload}
              disabled={!hasPending || busy}
            >
              {status === "loading"
                ? "Loading…"
                : status === "uploading"
                  ? "Working…"
                  : "Upload photos"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoSlot({ label, hint, file, saved, error, disabled, onPick, onRemove }) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleChange(event) {
    const picked = event.target.files?.[0];
    if (picked) onPick(picked);
    // Clear so picking the same file again still fires onChange.
    event.target.value = "";
  }

  // A newly picked photo wins over the saved one until it's uploaded.
  const imageUrl = previewUrl || saved?.url;
  const image = imageUrl ? (
    <img
      src={imageUrl}
      alt={`${label} ${previewUrl ? "preview" : "saved"}`}
      style={{
        display: "block",
        maxWidth: 200,
        maxHeight: 200,
        marginTop: 12,
        border: "var(--border-chunky) solid var(--color-ink)",
      }}
    />
  ) : null;

  return (
    <div className="bartender-controls__panel">
      <h3>{label}</h3>
      {hint ? <p className="bartender-controls__copy">{hint}</p> : null}

      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
      />

      {error ? (
        <p className="bartender-controls__error" role="alert">
          {error}
        </p>
      ) : null}

      {imageUrl ? (
        <div>
          {previewUrl ? (
            image
          ) : (
            <a
              href={saved.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open full-size ${label}`}
              style={{ display: "inline-block" }}
            >
              {image}
            </a>
          )}
          <p className="bartender-controls__copy">
            {previewUrl ? "Not uploaded yet" : "Saved — tap to open full size"}
          </p>
          <div className="bartender-controls__actions">
            <button
              type="button"
              className="btn scoop btn-ghost"
              onClick={onRemove}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
