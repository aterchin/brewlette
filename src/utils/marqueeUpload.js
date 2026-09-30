import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase.js";

// Keep these in sync with storage.rules.
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGES_PER_SCAN = 2;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

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
 * Upload 1–2 marquee photos as one scan:
 * marquee_scans/{uid}/{scanId}/photo-1, photo-2
 * Returns { scanId, images: [{ path, url }] }.
 */
export async function uploadMarqueeScan(uid, files) {
  if (files.length === 0 || files.length > MAX_IMAGES_PER_SCAN) {
    throw new Error(`Pick 1 to ${MAX_IMAGES_PER_SCAN} photos.`);
  }

  const scanId = crypto.randomUUID();
  const images = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const path = `marquee_scans/${uid}/${scanId}/photo-${i + 1}`;
    const result = await uploadBytes(ref(storage, path), file, {
      contentType: file.type,
    });
    const url = await getDownloadURL(result.ref);
    images.push({ path, url });
  }

  return { scanId, images };
}
