import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app } from "../firebase.js";

export const OCR_MODEL = "gemini-3.8-flash";

const OCR_PROMPT = `Read all of the text in this photo of a bar's beer marquee or tap list.
Return only the text you can see, top to bottom, one line per line of signage.
Do not add commentary, formatting, or text that isn't in the image.
If there is no readable text, return an empty response.`;

let model = null;

function getOcrModel() {
  if (!model) {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    model = getGenerativeModel(ai, { model: OCR_MODEL });
  }
  return model;
}

/**
 * Convert a web File into the inline-data part Gemini expects:
 * { inlineData: { data: <base64>, mimeType } }
 */
export function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Result is "data:<mime>;base64,<data>" — Gemini wants just the data.
      const data = String(reader.result).split(",")[1];
      resolve({ inlineData: { data, mimeType: file.type } });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Send one photo to Gemini and return the text it reads (may be ""). */
export async function extractTextFromImage(file) {
  const imagePart = await fileToGenerativePart(file);
  const result = await getOcrModel().generateContent([OCR_PROMPT, imagePart]);
  return result.response.text().trim();
}
