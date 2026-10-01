import { useEffect, useState } from "react";
import BackButton from "./BackButton.jsx";
import ScanReview from "./ScanReview.jsx";
import { extractBeersFromImages } from "../utils/marqueeOcr.js";
import { beersFromScan } from "../utils/storage.js";
import {
  deleteMarqueePhoto,
  loadMarqueeBlobs,
  loadMarqueePhotos,
  uploadMarqueePhoto,
  validateMarqueeImage,
} from "../utils/marqueeUpload.js";
import "./BartenderControls.css";
import "./MarqueeScan.css";

// The resize extension usually finishes within a few seconds of upload.
const RESIZE_POLL_MS = 3000;
const RESIZE_POLL_TRIES = 6;

/**
 * Upload 1–2 photos of the beer marquee. Picking a photo uploads it right away.
 * Saved photos are loaded from Storage each time the page opens.
 */
export default function MarqueeScan({ uid, currentCount, onBack, onReplace }) {
  // In Storage: [{ path, originalUrl, resizedUrl } | null, ...]
  const [saved, setSaved] = useState([null, null]);
  // Local blob URLs of just-uploaded photos, shown until the resized copy exists.
  const [previews, setPreviews] = useState([null, null]);
  // Bumped after each upload to start checking for resized copies; 0 = not polling.
  const [resizePoll, setResizePoll] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | idle | uploading | removing | reading | error
  const [errorMessage, setErrorMessage] = useState("");
  // { beers, skippedCount } from the last "Read board"; null shows the photo page.
  const [review, setReview] = useState(null);

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
          const waiting = photos.some((photo) => photo && !photo.resizedUrl);
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

  // Drop a preview once its photo is removed or the resized copy arrives.
  useEffect(() => {
    previews.forEach((url, i) => {
      if (url && (!saved[i] || saved[i].resizedUrl)) {
        URL.revokeObjectURL(url);
        setPreviews((current) => current.map((p, j) => (j === i ? null : p)));
      }
    });
  }, [saved, previews]);

  const busy = ["loading", "uploading", "removing", "reading"].includes(status);

  async function uploadPhoto(index, file) {
    if (busy) return;
    const invalid = validateMarqueeImage(file);
    if (invalid) {
      setStatus("error");
      setErrorMessage(invalid);
      return;
    }

    // A poll finishing mid-upload would overwrite the new photo with stale data.
    setResizePoll(0);
    setStatus("uploading");
    setErrorMessage("");
    try {
      const photo = await uploadMarqueePhoto(uid, index, file);
      const preview = URL.createObjectURL(file);
      setPreviews((current) => current.map((p, i) => (i === index ? preview : p)));
      setSaved((current) => current.map((p, i) => (i === index ? photo : p)));
      setStatus("idle");
      setResizePoll((n) => n + 1);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Upload failed. Check your connection and try again.");
    }
  }

  async function removePhoto(index) {
    const photo = saved[index];
    if (!photo || busy) return;

    // A poll finishing mid-delete would bring the photo back.
    setResizePoll(0);
    setStatus("removing");
    setErrorMessage("");
    try {
      await deleteMarqueePhoto(photo.path);
      setSaved((current) => current.map((p, i) => (i === index ? null : p)));
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Couldn’t remove photo. Try again.");
    }
  }

  async function readBoard() {
    const paths = saved.filter(Boolean).map((photo) => photo.path);
    if (!paths.length || busy) return;

    setResizePoll(0);
    setStatus("reading");
    setErrorMessage("");
    try {
      const blobs = await loadMarqueeBlobs(paths);
      const scanned = await extractBeersFromImages(blobs);
      const beers = beersFromScan(scanned);
      setReview({ beers, skippedCount: scanned.length - beers.length });
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Couldn’t read the board. Try again.");
    }
  }

  const busyLabel = {
    loading: "Loading…",
    uploading: "Uploading…",
    removing: "Removing…",
    reading: "Reading board…",
  }[status];
  const savedCount = saved.filter(Boolean).length;
  const statusText =
    savedCount > 0
      ? `Saved ${savedCount} photo${savedCount === 1 ? "" : "s"}. Tap one to open full size.`
      : "Wall too wide? Add a second shot.";

  if (review) {
    return (
      <ScanReview
        beers={review.beers}
        skippedCount={review.skippedCount}
        currentCount={currentCount}
        onReplace={onReplace}
        onCancel={() => setReview(null)}
      />
    );
  }

  return (
    <section className="bartender-controls" aria-label="Scan marquee">
      <header className="bartender-controls__topbar">
        <BackButton onClick={onBack} label="Back to controls" />
        <div className="bartender-controls__topbar-copy">
          <h2>Scan marquee</h2>
          <p>Upload 1 or 2 photos of your beer wall</p>
        </div>
      </header>

      <div className="bartender-controls__panel">
        <div className="marquee-scan__grid">
          <PhotoSlot
            label="Photo 1"
            saved={saved[0]}
            preview={previews[0]}
            disabled={busy}
            onPick={(file) => uploadPhoto(0, file)}
            onRemove={() => removePhoto(0)}
          />
          <PhotoSlot
            label="Photo 2 (optional)"
            saved={saved[1]}
            preview={previews[1]}
            disabled={busy}
            onPick={(file) => uploadPhoto(1, file)}
            onRemove={() => removePhoto(1)}
          />
        </div>

        {status === "error" ? (
          <p className="bartender-controls__error marquee-scan__status" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <p className="bartender-controls__copy marquee-scan__status" role="status">
          {statusText}
        </p>

        <div className="marquee-scan__read">
          <button
            type="button"
            className="btn scoop btn-primary"
            onClick={readBoard}
            disabled={busy || savedCount === 0}
          >
            Read board
          </button>
        </div>
      </div>

      {busyLabel ? (
        <div className="marquee-scan__overlay" role="status" aria-live="polite">
          <p className="marquee-scan__overlay-card">{busyLabel}</p>
        </div>
      ) : null}
    </section>
  );
}

function PhotoSlot({ label, saved, preview, disabled, onPick, onRemove }) {
  function handleChange(event) {
    const picked = event.target.files?.[0];
    if (picked) onPick(picked);
    // Clear so picking the same file again still fires onChange.
    event.target.value = "";
  }

  const tile = saved ? (
    <div className="marquee-scan__tile">
      <a
        className="marquee-scan__link"
        href={saved.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open full-size ${label}`}
      >
        <img
          className="marquee-scan__img"
          src={saved.resizedUrl || preview || saved.originalUrl}
          alt={label}
        />
      </a>
    </div>
  ) : (
    <label className="marquee-scan__tile marquee-scan__tile--empty">
      <input
        type="file"
        accept="image/*"
        className="marquee-scan__file"
        onChange={handleChange}
        disabled={disabled}
        aria-label={`Add ${label}`}
      />
      <span className="marquee-scan__plus" aria-hidden="true">+</span>
      <span className="marquee-scan__label">{label}</span>
    </label>
  );

  return (
    <div className="marquee-scan__slot">
      {tile}
      <div className="marquee-scan__actions">
        {saved ? (
          <button
            type="button"
            className="marquee-scan__remove"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${label}`}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
