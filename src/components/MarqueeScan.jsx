import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton.jsx";
import {
  deleteMarqueePhoto,
  loadLastScan,
  saveLastScan,
  uploadMarqueeScan,
  validateMarqueeImage,
} from "../utils/marqueeUpload.js";
import "./BartenderControls.css";

/**
 * Upload 1–2 photos of the beer marquee as one scan.
 * The last saved scan is remembered on this device and shown on return.
 */
export default function MarqueeScan({ uid, onBack }) {
  // Saved in Firebase: { scanId, photos: [{ path, url } | null, ...] } or null
  const [saved, setSaved] = useState(() => loadLastScan(uid));
  // Picked on this visit, not uploaded yet: [File | null, File | null]
  const [pending, setPending] = useState([null, null]);
  const [errors, setErrors] = useState(["", ""]);
  const [status, setStatus] = useState("idle"); // idle | uploading | error
  const [errorMessage, setErrorMessage] = useState("");

  function updateSaved(nextSaved) {
    setSaved(nextSaved);
    saveLastScan(uid, nextSaved);
  }

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

    const photo = saved?.photos[index];
    if (!photo) return;

    setStatus("uploading");
    setErrorMessage("");
    try {
      await deleteMarqueePhoto(photo.path);
    } catch (error) {
      // Already gone in Storage is fine; anything else, stop.
      if (error?.code !== "storage/object-not-found") {
        console.error(error);
        setStatus("error");
        setErrorMessage("Couldn’t remove photo. Try again.");
        return;
      }
    }

    const nextPhotos = [...saved.photos];
    nextPhotos[index] = null;
    // Both slots empty: forget the scan so the next upload starts a new one.
    updateSaved(nextPhotos.some(Boolean) ? { ...saved, photos: nextPhotos } : null);
    setStatus("idle");
  }

  async function handleUpload() {
    if (!pending.some(Boolean) || status === "uploading") return;

    setStatus("uploading");
    setErrorMessage("");
    try {
      const result = await uploadMarqueeScan(uid, pending, saved?.scanId);
      const nextPhotos = result.photos.map(
        (photo, i) => photo || saved?.photos[i] || null,
      );
      updateSaved({ scanId: result.scanId, photos: nextPhotos });
      setPending([null, null]);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Upload failed. Check your connection and try again.");
    }
  }

  const busy = status === "uploading";
  const hasPending = pending.some(Boolean);
  const savedCount = saved ? saved.photos.filter(Boolean).length : 0;

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
          savedUrl={saved?.photos[0]?.url}
          error={errors[0]}
          disabled={busy}
          onPick={(file) => pickPhoto(0, file)}
          onRemove={() => removePhoto(0)}
        />
        <PhotoSlot
          label="Photo 2 (optional)"
          hint="Wall too wide? Add a second shot."
          file={pending[1]}
          savedUrl={saved?.photos[1]?.url}
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
              {busy ? "Working…" : "Upload photos"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoSlot({ label, hint, file, savedUrl, error, disabled, onPick, onRemove }) {
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
  const imageUrl = previewUrl || savedUrl;

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
          <img
            src={imageUrl}
            alt={`${label} ${previewUrl ? "preview" : "saved"}`}
            style={{ display: "block", maxWidth: "100%", maxHeight: 240, marginTop: 12 }}
          />
          <p className="bartender-controls__copy">
            {previewUrl ? "Not uploaded yet" : "Saved"}
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
