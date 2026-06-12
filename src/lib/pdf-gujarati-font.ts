import type { jsPDF } from "jspdf";

const FONT_FILE = "NotoSansGujarati-Regular.ttf";
const FONT_NAME = "NotoSansGujarati";
const FONT_URL =
  "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansGujarati/NotoSansGujarati-Regular.ttf";

let cachedBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
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

export async function loadGujaratiFontBase64(): Promise<string> {
  if (cachedBase64) return cachedBase64;

  const response = await fetch(FONT_URL);
  if (!response.ok) {
    throw new Error(`Failed to load Gujarati font: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  cachedBase64 = arrayBufferToBase64(buffer);
  return cachedBase64;
}

export async function applyGujaratiFontToPdf(doc: jsPDF): Promise<void> {
  const base64 = await loadGujaratiFontBase64();

  doc.addFileToVFS(FONT_FILE, base64);
  doc.addFont(FONT_FILE, FONT_NAME, "normal");
  doc.addFont(FONT_FILE, FONT_NAME, "bold");
  doc.setFont(FONT_NAME, "normal");
}

export function setGujaratiPdfFont(doc: jsPDF, style: "normal" | "bold" = "normal"): void {
  doc.setFont(FONT_NAME, style);
}
