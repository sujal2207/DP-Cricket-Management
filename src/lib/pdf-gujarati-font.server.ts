import "server-only";

import fs from "fs";
import path from "path";
import type { jsPDF } from "jspdf";
import {
  applyGujaratiFontToPdf as registerGujaratiFont,
  FONT_FILE,
  resolveGujaratiFontBase64,
  setGujaratiPdfFont,
  GUJARATI_PDF_FONT_NAME,
} from "./pdf-gujarati-font-core";

export { setGujaratiPdfFont, GUJARATI_PDF_FONT_NAME };

const LOCAL_FONT_PATH = path.join(process.cwd(), "public", "fonts", FONT_FILE);

export async function loadGujaratiFontBase64(): Promise<string> {
  return resolveGujaratiFontBase64(async () => {
    if (!fs.existsSync(LOCAL_FONT_PATH)) {
      throw new Error(`Gujarati font not found at ${LOCAL_FONT_PATH}`);
    }
    return fs.readFileSync(LOCAL_FONT_PATH).toString("base64");
  });
}

export async function applyGujaratiFontToPdf(doc: jsPDF): Promise<void> {
  const base64 = await loadGujaratiFontBase64();
  await registerGujaratiFont(doc, base64);
}
