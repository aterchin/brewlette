import {
  deleteObject,
  getBlob,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../firebase.js";

// Keep these in sync with storage.rules.
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGES_PER_SCAN = 2;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

// Keep in sync with IMG_SIZES in extensions/storage-resize-images.env.
export const RESIZED_SIZE = "640x640";

/** Fixed path per slot: marquee_scans/{uid}/photo-1, photo-2 */
function photoPath(uid, index) {
  return `marquee_scans/${uid}/photo-${index + 1}`;
}

/**
 * Where the Resize Images extension writes its copy: photo-1 -> photo-1_640x640.
 * It appears a few seconds after upload; HEIC never gets one (unsupported by the extension).
 */
function resizedPath(path) {
  return `${path}_${RESIZED_SIZE}`;
}

/**
 * Download URL (with the file's generation appended) and last-updated time.
 * Storage bumps `generation` on every overwrite, so the browser can't show a stale cached image.
 */
async function fileInfo(path) {
  const fileRef = ref(storage, path);
  const [url, { generation, updated }] = await Promise.all([
    getDownloadURL(fileRef),
    getMetadata(fileRef),
  ]);
  return { url: `${url}&v=${generation}`, updated: new Date(updated) };
}

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
 * Load this user's current photos from Storage.
 * Lists the folder first so empty slots don't trigger 404s.
 * Returns [{ path, originalUrl, resizedUrl } | null, ...] — null for an empty slot,
 * `resizedUrl` null until the extension has made a copy of the current original.
 */
export async function loadMarqueePhotos(uid) {
  const folder = await listAll(ref(storage, `marquee_scans/${uid}`));
  const existingPaths = folder.items.map((item) => item.fullPath);

  return Promise.all(
    Array.from({ length: MAX_IMAGES_PER_SCAN }, async (_, i) => {
      const path = photoPath(uid, i);
      if (!existingPaths.includes(path)) return null;
      const hasResized = existingPaths.includes(resizedPath(path));
      const [original, resized] = await Promise.all([
        fileInfo(path),
        hasResized ? fileInfo(resizedPath(path)) : null,
      ]);
      // An older copy can outlive its photo if the extension finished after a quick remove.
      const fresh = resized && resized.updated >= original.updated;
      return { path, originalUrl: original.url, resizedUrl: fresh ? resized.url : null };
    }),
  );
}

/**
 * Upload one photo into slot `index`.
 * Returns { path, originalUrl, resizedUrl: null }.
 */
export async function uploadMarqueePhoto(uid, index, file) {
  const path = photoPath(uid, index);
  await uploadBytes(ref(storage, path), file, { contentType: file.type });
  const { url } = await fileInfo(path);
  return { path, originalUrl: url, resizedUrl: null };
}

/**
 * Download original photos as Blobs (for sending to Gemini).
 * Needs CORS on the bucket — see cors.json.
 */
export function loadMarqueeBlobs(paths) {
  return Promise.all(paths.map((path) => getBlob(ref(storage, path))));
}

/** Deletes the original and its resized copy. */
export async function deleteMarqueePhoto(path) {
  await Promise.all([deleteIfExists(path), deleteIfExists(resizedPath(path))]);
}

async function deleteIfExists(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    // Already gone is fine.
    if (error?.code !== "storage/object-not-found") throw error;
  }
}
