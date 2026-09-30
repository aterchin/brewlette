import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton.jsx";
import {
  uploadMarqueeScan,
  validateMarqueeImage,
} from "../utils/marqueeUpload.js";
import "./BartenderControls.css";

/**
 * Upload 1–2 photos of the beer marquee as one scan.
 */
export default function MarqueeScan({ uid, onBack }) {
  const [photos, setPhotos] = useState([null, null]);
  const [errors, setErrors] = useState(["", ""]);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [message, setMessage] = useState("");

  function setPhoto(index, file) {
    const nextPhotos = [...photos];
    const nextErrors = [...errors];
    const error = file ? validateMarqueeImage(file) : null;

    nextPhotos[index] = error ? null : file;
    nextErrors[index] = error || "";

    setPhotos(nextPhotos);
    setErrors(nextErrors);
    setStatus("idle");
    setMessage("");
  }

  async function handleUpload() {
    const files = photos.filter(Boolean);
    if (files.length === 0 || status === "uploading") return;

    setStatus("uploading");
    setMessage("");
    try {
      const result = await uploadMarqueeScan(uid, files);
      setStatus("done");
      setMessage(
        `Saved ${result.images.length} photo${result.images.length === 1 ? "" : "s"}.`,
      );
      setPhotos([null, null]);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Upload failed. Check your connection and try again.");
    }
  }

  const hasPhoto = photos.some(Boolean);
  const uploading = status === "uploading";

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
          file={photos[0]}
          error={errors[0]}
          disabled={uploading}
          onChange={(file) => setPhoto(0, file)}
        />
        <PhotoSlot
          label="Photo 2 (optional)"
          hint="Wall too wide? Add a second shot."
          file={photos[1]}
          error={errors[1]}
          disabled={uploading}
          onChange={(file) => setPhoto(1, file)}
        />

        <div className="bartender-controls__panel">
          {message ? (
            <p
              className={
                status === "error"
                  ? "bartender-controls__error"
                  : "bartender-controls__copy"
              }
              role={status === "error" ? "alert" : "status"}
            >
              {message}
            </p>
          ) : null}
          <div className="bartender-controls__actions">
            <button
              type="button"
              className="btn scoop btn-primary"
              onClick={handleUpload}
              disabled={!hasPhoto || uploading}
            >
              {uploading ? "Uploading…" : "Upload photos"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoSlot({ label, hint, file, error, disabled, onChange }) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleChange(event) {
    onChange(event.target.files?.[0] || null);
    // Clear so picking the same file again still fires onChange.
    event.target.value = "";
  }

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

      {previewUrl ? (
        <div>
          <img
            src={previewUrl}
            alt={`${label} preview`}
            style={{ display: "block", maxWidth: "100%", maxHeight: 240, marginTop: 12 }}
          />
          <div className="bartender-controls__actions">
            <button
              type="button"
              className="btn scoop btn-ghost"
              onClick={() => onChange(null)}
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
