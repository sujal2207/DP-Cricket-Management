import type { jsPDF } from "jspdf";
import {
  setGujaratiPdfFont,
  GUJARATI_PDF_FONT_NAME,
} from "./pdf-gujarati-font-core";

export const PDF_NOT_APPLICABLE = "N/A";

export type PdfTextFont = "latin" | "gujarati";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function detectPdfTextFont(text: string): PdfTextFont {
  if (!text || text === PDF_NOT_APPLICABLE) return "latin";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gujarati";
  return "latin";
}

export function setPdfTextFont(doc: jsPDF, font: PdfTextFont): void {
  if (font === "gujarati") {
    setGujaratiPdfFont(doc, "normal");
  } else {
    doc.setFont("helvetica", "normal");
  }
}

export function formatPdfValue(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return PDF_NOT_APPLICABLE;
  if (typeof value === "number") {
    return Number.isNaN(value) ? PDF_NOT_APPLICABLE : String(value);
  }
  const trimmed = value.trim();
  return trimmed === "" ? PDF_NOT_APPLICABLE : trimmed;
}

/** ASCII-only date/time string — renders reliably with Helvetica in PDFs */
export function formatPdfDateTime(date: string | Date | null | undefined): string {
  if (!date) return PDF_NOT_APPLICABLE;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return PDF_NOT_APPLICABLE;

  const pad = (n: number) => String(n).padStart(2, "0");
  const hours = d.getHours();
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";

  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(h12)}:${pad(d.getMinutes())} ${ampm}`;
}

export function cellTextContent(text: string | string[] | undefined): string {
  if (!text) return "";
  return Array.isArray(text) ? text.join(" ") : String(text);
}

/** Assign the correct jsPDF font per autoTable cell (Gujarati vs Latin) */
export function applyAutoTableCellFont(
  text: string | string[] | undefined,
  styles: { font?: string; fontStyle?: string }
): void {
  const content = cellTextContent(text);
  const font = detectPdfTextFont(content);
  styles.font = font === "gujarati" ? GUJARATI_PDF_FONT_NAME : "helvetica";
  styles.fontStyle = "normal";
}

export function measurePdfTextWidth(
  doc: jsPDF,
  text: string,
  font: PdfTextFont = detectPdfTextFont(text)
): number {
  setPdfTextFont(doc, font);
  return doc.getTextWidth(text);
}

export interface PdfTextSegment {
  text: string;
  font?: PdfTextFont;
}

/** Draw a line that mixes Latin and Gujarati segments with correct fonts */
export function drawPdfMixedLine(
  doc: jsPDF,
  segments: PdfTextSegment[],
  x: number,
  y: number,
  align: "left" | "center" | "right" = "left"
): void {
  const parts = segments.map((segment) => {
    const font = segment.font ?? detectPdfTextFont(segment.text);
    return {
      text: segment.text,
      font,
      width: measurePdfTextWidth(doc, segment.text, font),
    };
  });

  const totalWidth = parts.reduce((sum, part) => sum + part.width, 0);
  let cursorX =
    align === "center" ? x - totalWidth / 2 : align === "right" ? x - totalWidth : x;

  for (const part of parts) {
    setPdfTextFont(doc, part.font);
    doc.text(part.text, cursorX, y);
    cursorX += part.width;
  }
}

/** Draw single-line text using the appropriate font for its script */
export function drawPdfTextLine(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "left" | "center" | "right" = "left"
): void {
  setPdfTextFont(doc, detectPdfTextFont(text));
  doc.text(text, x, y, { align });
}

export { GUJARATI_PDF_FONT_NAME };
