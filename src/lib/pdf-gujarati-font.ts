import type { jsPDF } from "jspdf";
import {
  applyGujaratiFontToPdf as registerGujaratiFont,
  fetchFontBase64,
  LOCAL_FONT_URL,
  REMOTE_FONT_URL,
  resolveGujaratiFontBase64,
  setGujaratiPdfFont,
  GUJARATI_PDF_FONT_NAME,
} from "./pdf-gujarati-font-core";

export { setGujaratiPdfFont, GUJARATI_PDF_FONT_NAME };

export async function loadGujaratiFontBase64(): Promise<string> {
  return resolveGujaratiFontBase64(async () => {
    try {
      return await fetchFontBase64(LOCAL_FONT_URL);
    } catch {
      return fetchFontBase64(REMOTE_FONT_URL);
    }
  });
}

export async function applyGujaratiFontToPdf(doc: jsPDF): Promise<void> {
  const base64 = await loadGujaratiFontBase64();
  await registerGujaratiFont(doc, base64);
}
