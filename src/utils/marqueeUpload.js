import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase.js";

// Keep these in sync with storage.rules.
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGES_PER_SCAN = 2;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

const LAST_SCAN_KEY = "brewlette.marqueeScan.v1";

/**
 * Check one photo before upload.
 * Returns an error message, or null if the file is OK.
 */
export function validateMarqueeImage(file) {
  if (!file) return "No file selected.";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Use a JPEG, PNG, WebP, or HEIC image.";
  }
  if (file.size >= MAX_IMAGE_BYTES) {
    return "Image must be smaller than 8MB.";
  }
  return null;
}

/**
 * Upload photos into one scan: marquee_scans/{uid}/{scanId}/photo-1, photo-2
 * `files` is one entry per slot ([file | null, file | null]); slot N -> photo-N.
 * Pass an existing scanId to replace photos in that scan.
 * Returns { scanId, photos: [{ path, url } | null, ...] } for the uploaded slots only.
 */
export async function uploadMarqueeScan(uid, files, scanId = crypto.randomUUID()) {
  const photos = [];

  for (let i = 0; i < MAX_IMAGES_PER_SCAN; i += 1) {
    const file = files[i];
    if (!file) {
      photos.push(null);
      continue;
    }
    const path = `marquee_scans/${uid}/${scanId}/photo-${i + 1}`;
    const result = await uploadBytes(ref(storage, path), file, {
      contentType: file.type,
    });
    const url = await getDownloadURL(result.ref);
    photos.push({ path, url });
  }

  return { scanId, photos };
}

export async function deleteMarqueePhoto(path) {
  await deleteObject(ref(storage, path));
}

function isValidPhoto(photo) {
  return (
    photo === null ||
    (photo &&
      typeof photo.path === "string" &&
      typeof photo.url === "string")
  );
}

/**
 * Last saved scan on this device for this user, or null.
 * Shape: { scanId, photos: [{ path, url } | null, { path, url } | null] }
 */
export function loadLastScan(uid) {
  try {
    const raw = localStorage.getItem(`${LAST_SCAN_KEY}.${uid}`);
    if (!raw) return null;
    const scan = JSON.parse(raw);
    if (
      typeof scan?.scanId !== "string" ||
      !Array.isArray(scan.photos) ||
      scan.photos.length !== MAX_IMAGES_PER_SCAN ||
      !scan.photos.every(isValidPhoto)
    ) {
      return null;
    }
    return scan;
  } catch {
    return null;
  }
}

export function saveLastScan(uid, scan) {
  try {
    if (scan) {
      localStorage.setItem(`${LAST_SCAN_KEY}.${uid}`, JSON.stringify(scan));
    } else {
      localStorage.removeItem(`${LAST_SCAN_KEY}.${uid}`);
    }
  } catch {
    // Storage full or blocked — the photos are still in Firebase.
  }
}
