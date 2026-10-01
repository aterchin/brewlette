import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";
import { app } from "../firebase.js";

export const OCR_MODEL = "gemini-3.8-flash";

// Long edge sent to Gemini. Keeps 2 full-size photos under the 20MB request limit.
const MAX_EDGE_PX = 2048;

const OCR_PROMPT = `Read all of the text in this photo of a bar's beer marquee or tap list.
Return only the text you can see, top to bottom, one line per line of signage.
Do not add commentary, formatting, or text that isn't in the image.
If there is no readable text, return an empty response.`;

const TAP_LIST_PROMPT = `These photos show a bar's beer board (marquee or tap list).
If there are two photos, they are parts of the same board and may overlap: list each beer once.

Extract every beer that is currently on tap, in board order (top to bottom, left to right).
- number: the tap or line number printed on the board. Omit it if none is shown.
- name: the beer's name only, without the brewery.
- brewery: the brewery or producer, if shown.
- style: the beer style (e.g. "Pilsner", "Hazy IPA"), if shown.
- abv: alcohol by volume as a plain number (5.8, not "5.8%"). Omit it if not shown.
- description: any tasting notes or descriptive text for that beer, as written.

Rules:
- Only use text visible in the photos. Never guess or fill in from outside knowledge.
- Skip blank, crossed-out, or "coming soon" slots, prices, and non-beer signage.
- Ciders, seltzers, and other drinks on the same taps count as beers.
- If no beers are readable, return an empty list.`;

const beerSchema = Schema.object({
  properties: {
    number: Schema.integer({ description: "Tap or line number shown on the board" }),
    name: Schema.string({ description: "Beer name, without the brewery" }),
    brewery: Schema.string(),
    style: Schema.string(),
    abv: Schema.number({ description: "Alcohol by volume, percent" }),
    description: Schema.string(),
  },
  optionalProperties: ["number", "brewery", "style", "abv", "description"],
});

export const tapListSchema = Schema.object({
  properties: {
    beers: Schema.array({ items: beerSchema }),
  },
});

let ai = null;
let textModel = null;
let tapListModel = null;

function getAIInstance() {
  if (!ai) ai = getAI(app, { backend: new GoogleAIBackend() });
  return ai;
}

function getTextModel() {
  if (!textModel) textModel = getGenerativeModel(getAIInstance(), { model: OCR_MODEL });
  return textModel;
}

function getTapListModel() {
  if (!tapListModel) {
    tapListModel = getGenerativeModel(getAIInstance(), {
      model: OCR_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: tapListSchema,
      },
    });
  }
  return tapListModel;
}

/**
 * Convert a web File (or Blob) into the inline-data part Gemini expects:
 * { inlineData: { data: <base64>, mimeType } }
 */
export function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Result is "data:<mime>;base64,<data>" — Gemini wants just the data.
      const data = String(reader.result).split(",")[1];
      resolve({ inlineData: { data, mimeType: file.type || "image/jpeg" } });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Scale a photo down to MAX_EDGE_PX as JPEG. Returns the original if it's already
 * small enough or the browser can't decode it (e.g. HEIC outside Safari).
 */
async function shrinkImage(blob) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return blob;
  }
  const scale = MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height);
  if (scale >= 1) {
    bitmap.close();
    return blob;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  return jpeg ?? blob;
}

/** Send one photo to Gemini and return the text it reads (may be ""). */
export async function extractTextFromImage(file) {
  const imagePart = await fileToGenerativePart(file);
  const result = await getTextModel().generateContent([OCR_PROMPT, imagePart]);
  return result.response.text().trim();
}

/**
 * Send 1–2 photos of the beer board to Gemini and return the beers it reads,
 * raw from the model: [{ name, number?, brewery?, style?, abv?, description? }].
 * Not validated — run through normalizeBeerList before saving.
 */
export async function extractBeersFromImages(files) {
  const imageParts = await Promise.all(
    files.map(async (file) => fileToGenerativePart(await shrinkImage(file))),
  );
  const result = await getTapListModel().generateContent([TAP_LIST_PROMPT, ...imageParts]);
  const { beers } = JSON.parse(result.response.text());
  return Array.isArray(beers) ? beers : [];
}
