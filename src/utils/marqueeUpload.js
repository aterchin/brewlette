import {
  deleteObject,
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

/** Fixed path per slot: marquee_scans/{uid}/photo-1, photo-2 */
function photoPath(uid, index) {
  return `marquee_scans/${uid}/photo-${index + 1}`;
}

/**
 * Download URL with the file's generation appended.
 * Storage bumps `generation` on every overwrite, so the browser can't show a stale cached image.
 */
async function versionedUrl(fileRef, generation) {
  const url = await getDownloadURL(fileRef);
  return `${url}&v=${generation}`;
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
 * Returns [{ path, generation, url } | null, ...] — null for an empty slot.
 */
export async function loadMarqueePhotos(uid) {
  const folder = await listAll(ref(storage, `marquee_scans/${uid}`));
  const existingPaths = folder.items.map((item) => item.fullPath);
  const photos = [];

  for (let i = 0; i < MAX_IMAGES_PER_SCAN; i += 1) {
    const path = photoPath(uid, i);
    if (!existingPaths.includes(path)) {
      photos.push(null);
      continue;
    }
    const fileRef = ref(storage, path);
    const metadata = await getMetadata(fileRef);
    photos.push({
      path,
      generation: metadata.generation,
      url: await versionedUrl(fileRef, metadata.generation),
    });
  }

  return photos;
}

/**
 * Upload photos by slot ([file | null, file | null]); slot N overwrites photo-N.
 * Returns [{ path, generation, url } | null, ...] for the uploaded slots only.
 */
export async function uploadMarqueePhotos(uid, files) {
  const photos = [];

  for (let i = 0; i < MAX_IMAGES_PER_SCAN; i += 1) {
    const file = files[i];
    if (!file) {
      photos.push(null);
      continue;
    }
    const fileRef = ref(storage, photoPath(uid, i));
    const result = await uploadBytes(fileRef, file, { contentType: file.type });
    photos.push({
      path: fileRef.fullPath,
      generation: result.metadata.generation,
      url: await versionedUrl(fileRef, result.metadata.generation),
    });
  }

  return photos;
}

export async function deleteMarqueePhoto(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    // Already gone is fine.
    if (error?.code !== "storage/object-not-found") throw error;
  }
}
