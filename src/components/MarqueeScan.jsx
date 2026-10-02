import { useEffect, useState } from "react";
import { Camera, Plus, X } from "lucide-react";
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

const READING_LINE_MS = 4000;
const READING_LINES = [
  "Analyzing you while you decide",
  "Going outside to smoke",
  "Double charging you in my mind",
  "Cleaning glasses and ignoring you",
  "Not caring where you grew up",
  "Reconsidering my life choices",
  "Buying a shot to shut you up",
  "Playing get-the-hell-out music",
];

function randomReadingLine(except) {
  const options = READING_LINES.filter((line) => line !== except);
  return options[Math.floor(Math.random() * options.length)];
}

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
  // { beers, skippedCount } from the last scan; null shows the photo page.
  const [review, setReview] = useState(null);
  const [readingLine, setReadingLine] = useState(() => randomReadingLine());

  useEffect(() => {
    if (status !== "reading") return undefined;
    setReadingLine((current) => randomReadingLine(current));
    const timer = setInterval(() => {
      setReadingLine((current) => randomReadingLine(current));
    }, READING_LINE_MS);
    return () => clearInterval(timer);
  }, [status]);

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
    reading: "Reading the board…",
  }[status];
  const savedCount = saved.filter(Boolean).length;
  // A saved photo always leads; the empty slot beside it shrinks to "Add another angle".
  const slotOrder = saved[1] && !saved[0] ? [1, 0] : [0, 1];
  const scanningIndex = saved.findIndex(Boolean);
  const scanningSrc =
    scanningIndex >= 0 ? photoSrc(saved[scanningIndex], previews[scanningIndex]) : null;

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
    <section className="bartender-controls" aria-label="Scan your board">
      <header className="bartender-controls__topbar">
        <BackButton onClick={onBack} label="Back" />
        <div className="bartender-controls__topbar-copy">
          <h2>Scan your board</h2>
        </div>
      </header>

      <div className="marquee-scan__step">
        <div className="marquee-scan__step-head">
          <span className="step-badge" aria-hidden="true">1</span>
          <h3>Snap</h3>
        </div>

        <div className="marquee-scan__photos">
          {slotOrder.map((index, position) => {
            const extra = position === 1;
            if (extra && savedCount === 0) return null;
            return (
              <PhotoSlot
                key={index}
                label={`Photo ${index + 1}`}
                emptyTitle={extra ? "Add another angle" : "Add a photo"}
                emptyHint={extra ? "For wide boards" : undefined}
                compact={extra}
                saved={saved[index]}
                preview={previews[index]}
                disabled={busy}
                onPick={(file) => uploadPhoto(index, file)}
                onRemove={() => removePhoto(index)}
              />
            );
          })}
        </div>

        {status === "error" ? (
          <p className="marquee-scan__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="action-bar">
        <button
          type="button"
          className="btn btn-primary btn-xl"
          onClick={readBoard}
          disabled={busy || savedCount === 0}
        >
          <span className="step-badge" aria-hidden="true">2</span>
          Scan
        </button>
        {savedCount === 0 && status !== "loading" ? (
          <p className="action-bar__note">Add a photo first</p>
        ) : null}
      </div>

      {busyLabel ? (
        <div className="marquee-scan__overlay" role="status" aria-live="polite">
          <div className="marquee-scan__overlay-card">
            {status === "reading" && scanningSrc ? (
              <div className="marquee-scan__scanner" aria-hidden="true">
                <img src={scanningSrc} alt="" />
                <span className="marquee-scan__scanline" />
              </div>
            ) : null}
            {status === "reading" ? (
              <p>
                <span className="visually-hidden">{busyLabel}</span>
                <span aria-hidden="true">{readingLine}…</span>
              </p>
            ) : (
              <p>{busyLabel}</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function photoSrc(saved, preview) {
  return saved.resizedUrl || preview || saved.originalUrl;
}

function PhotoSlot({
  label,
  emptyTitle,
  emptyHint,
  compact = false,
  saved,
  preview,
  disabled,
  onPick,
  onRemove,
}) {
  function handleChange(event) {
    const picked = event.target.files?.[0];
    if (picked) onPick(picked);
    // Clear so picking the same file again still fires onChange.
    event.target.value = "";
  }

  if (saved) {
    return (
      <div className="marquee-scan__tile">
        <img className="marquee-scan__img" src={photoSrc(saved, preview)} alt={label} />
        <button
          type="button"
          className="marquee-scan__remove"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${label}`}
          title="Remove photo"
        >
          <X size={22} strokeWidth={2.75} aria-hidden="true" focusable="false" />
        </button>
      </div>
    );
  }

  const Icon = compact ? Plus : Camera;
  return (
    <label
      className={`marquee-scan__tile marquee-scan__tile--empty${compact ? " marquee-scan__tile--compact" : ""}`}
    >
      <input
        type="file"
        accept="image/*"
        className="marquee-scan__file"
        onChange={handleChange}
        disabled={disabled}
        aria-label={`Add ${label}`}
      />
      <Icon
        className="marquee-scan__icon"
        size={compact ? 28 : 56}
        strokeWidth={2.25}
        aria-hidden="true"
        focusable="false"
      />
      <span className="marquee-scan__empty-copy">
        <span className="marquee-scan__empty-title">{emptyTitle}</span>
        {emptyHint ? <span className="marquee-scan__empty-hint">{emptyHint}</span> : null}
      </span>
    </label>
  );
}
