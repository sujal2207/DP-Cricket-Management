import type { jsPDF } from "jspdf";

export const FONT_FILE = "NotoSansGujarati-Regular.ttf";
export const FONT_NAME = "NotoSansGujarati";
export const LOCAL_FONT_URL = "/fonts/NotoSansGujarati-Regular.ttf";
export const REMOTE_FONT_URL =
  "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansGujarati/NotoSansGujarati-Regular.ttf";

let cachedBase64: string | null = null;

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function setCachedGujaratiFontBase64(base64: string): void {
  cachedBase64 = base64;
}

export function getCachedGujaratiFontBase64(): string | null {
  return cachedBase64;
}

export async function fetchFontBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load Gujarati font: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return arrayBufferToBase64(buffer);
}

export async function applyGujaratiFontToPdf(doc: jsPDF, base64: string): Promise<void> {
  doc.addFileToVFS(FONT_FILE, base64);
  doc.addFont(FONT_FILE, FONT_NAME, "normal");
  doc.addFont(FONT_FILE, FONT_NAME, "bold");
  doc.setFont(FONT_NAME, "normal");
}

export function setGujaratiPdfFont(doc: jsPDF, style: "normal" | "bold" = "normal"): void {
  doc.setFont(FONT_NAME, style);
}

export const GUJARATI_PDF_FONT_NAME = FONT_NAME;

export async function resolveGujaratiFontBase64(
  loader: () => Promise<string>
): Promise<string> {
  if (cachedBase64) return cachedBase64;
  cachedBase64 = await loader();
  return cachedBase64;
}
