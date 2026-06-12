import type { jsPDF } from "jspdf";
import { formatFullName } from "./validation";
import { CAPTAINCY_INTEREST } from "./constants";
import { gu, getCategoryLabel } from "./translations/publicRegistrationGu";
import { setGujaratiPdfFont, GUJARATI_PDF_FONT_NAME } from "./pdf-gujarati-font-core";

export const RECEIPT_NOT_APPLICABLE = "N/A";

export interface RegistrationReceiptData {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  address: string;
  age?: number | null;
  contact_number_1: string;
  contact_number_2?: string | null;
  cricket_categories: string[];
  capacity_roles: string[];
  jersey_size?: string | null;
  jersey_number?: number | null;
  jersey_name?: string | null;
  created_at?: Date | string | null;
}

export type ReceiptValueFont = "gujarati" | "latin";

export interface ReceiptRowDefinition {
  label: string;
  value: string;
  valueFont: ReceiptValueFont;
}

const TEXT_DARK: [number, number, number] = [30, 41, 59];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];
const ROW_ALT: [number, number, number] = [248, 250, 252];

const TABLE_MARGIN_LEFT = 20;
const TABLE_WIDTH = 170;
const LABEL_WIDTH = 68;
const VALUE_WIDTH = TABLE_WIDTH - LABEL_WIDTH;
const FONT_SIZE = 10;
const LINE_HEIGHT = 4.8;
const CELL_PADDING = 3;

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

function detectValueFont(text: string): ReceiptValueFont {
  if (text === RECEIPT_NOT_APPLICABLE || /^[\x00-\x7F]*$/.test(text)) {
    return "latin";
  }
  return /[\u0A80-\u0AFF]/.test(text) ? "gujarati" : "latin";
}

function row(
  label: string,
  value: string,
  valueFont?: ReceiptValueFont
): ReceiptRowDefinition {
  return {
    label,
    value,
    valueFont: valueFont ?? detectValueFont(value),
  };
}

/** ASCII-only date for reliable PDF rendering with Helvetica */
export function formatReceiptDateForPdf(date: string | Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return RECEIPT_NOT_APPLICABLE;

  const pad = (n: number) => String(n).padStart(2, "0");
  const hours = d.getHours();
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";

  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(h12)}:${pad(d.getMinutes())} ${ampm}`;
}

export function formatReceiptValue(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return RECEIPT_NOT_APPLICABLE;
  if (typeof value === "number") {
    return Number.isNaN(value) ? RECEIPT_NOT_APPLICABLE : String(value);
  }
  const trimmed = value.trim();
  return trimmed === "" ? RECEIPT_NOT_APPLICABLE : trimmed;
}

export function mapCricketerToReceiptData(
  cricketer: Record<string, unknown>
): RegistrationReceiptData {
  const id =
    typeof cricketer._id === "object" &&
    cricketer._id !== null &&
    "toString" in cricketer._id
      ? (cricketer._id as { toString(): string }).toString()
      : String(cricketer._id ?? cricketer.id ?? "");

  const categories = cricketer.cricket_categories;
  const roles = cricketer.capacity_roles;

  return {
    id,
    first_name: String(cricketer.first_name ?? ""),
    middle_name: String(cricketer.middle_name ?? ""),
    last_name: String(cricketer.last_name ?? ""),
    address: String(cricketer.address ?? ""),
    age:
      typeof cricketer.age === "number"
        ? cricketer.age
        : cricketer.age != null
          ? Number(cricketer.age)
          : null,
    contact_number_1: String(cricketer.contact_number_1 ?? ""),
    contact_number_2: String(cricketer.contact_number_2 ?? ""),
    cricket_categories: Array.isArray(categories)
      ? categories.map(String)
      : [],
    capacity_roles: Array.isArray(roles) ? roles.map(String) : [],
    jersey_size: String(cricketer.jersey_size ?? ""),
    jersey_number:
      typeof cricketer.jersey_number === "number"
        ? cricketer.jersey_number
        : cricketer.jersey_number != null
          ? Number(cricketer.jersey_number)
          : null,
    jersey_name: String(cricketer.jersey_name ?? ""),
    created_at:
      cricketer.created_at instanceof Date
        ? cricketer.created_at
        : cricketer.created_at
          ? String(cricketer.created_at)
          : null,
  };
}

export function buildReceiptRowDefinitions(
  data: RegistrationReceiptData
): ReceiptRowDefinition[] {
  const fullName = formatFullName(
    data.first_name,
    data.middle_name,
    data.last_name
  );
  const categories =
    data.cricket_categories.length > 0
      ? data.cricket_categories.map((c) => getCategoryLabel(c)).join(", ")
      : RECEIPT_NOT_APPLICABLE;
  const captaincy = (data.capacity_roles || []).includes(CAPTAINCY_INTEREST)
    ? gu.success.yes
    : gu.success.no;
  const dateStr = data.created_at
    ? formatReceiptDateForPdf(data.created_at)
    : RECEIPT_NOT_APPLICABLE;

  return [
    row(gu.pdf.registrationId, data.id.slice(-8).toUpperCase(), "latin"),
    row(gu.pdf.fullName, formatReceiptValue(fullName)),
    row(gu.pdf.fathersName, formatReceiptValue(data.middle_name)),
    row(gu.pdf.age, formatReceiptValue(data.age), "latin"),
    row(gu.pdf.address, formatReceiptValue(data.address)),
    row(gu.pdf.mobile1, formatReceiptValue(data.contact_number_1), "latin"),
    row(gu.pdf.mobile2, formatReceiptValue(data.contact_number_2), "latin"),
    row(gu.pdf.jerseySize, formatReceiptValue(data.jersey_size), "latin"),
    row(gu.pdf.jerseyNumber, formatReceiptValue(data.jersey_number), "latin"),
    row(gu.pdf.jerseyName, formatReceiptValue(data.jersey_name)),
    row(gu.pdf.categories, categories, "gujarati"),
    row(gu.pdf.captaincy, captaincy, "gujarati"),
    row(gu.pdf.date, dateStr, "latin"),
  ];
}

function setLatinPdfFont(doc: jsPDF): void {
  doc.setFont("helvetica", "normal");
}

function setValueFont(doc: jsPDF, font: ReceiptValueFont): void {
  if (font === "gujarati") {
    setGujaratiPdfFont(doc, "normal");
  } else {
    setLatinPdfFont(doc);
  }
}

function measureWrappedLines(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  font: ReceiptValueFont
): string[] {
  setValueFont(doc, font);
  return doc.splitTextToSize(text, maxWidth) as string[];
}

/** Manual receipt table — avoids jsPDF-autoTable font/glyph issues */
export function drawReceiptTable(
  doc: jsPDF,
  rows: ReceiptRowDefinition[],
  startY: number
): number {
  doc.setFontSize(FONT_SIZE);
  let y = startY;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];

    setGujaratiPdfFont(doc, "normal");
    const labelLines = doc.splitTextToSize(row.label, LABEL_WIDTH - CELL_PADDING * 2) as string[];

    const valueLines = measureWrappedLines(
      doc,
      row.value,
      VALUE_WIDTH - CELL_PADDING * 2,
      row.valueFont
    );

    const contentLines = Math.max(labelLines.length, valueLines.length, 1);
    const rowHeight = contentLines * LINE_HEIGHT + CELL_PADDING * 2;

    if (index % 2 === 0) {
      doc.setFillColor(...ROW_ALT);
      doc.rect(TABLE_MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, "F");
    }

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.15);
    doc.rect(TABLE_MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, "S");

    setGujaratiPdfFont(doc, "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text(labelLines, TABLE_MARGIN_LEFT + CELL_PADDING, y + CELL_PADDING + 3.5);

    setValueFont(doc, row.valueFont);
    doc.setTextColor(...TEXT_DARK);
    doc.text(
      valueLines,
      TABLE_MARGIN_LEFT + LABEL_WIDTH + CELL_PADDING,
      y + CELL_PADDING + 3.5
    );

    y += rowHeight;
  }

  return y;
}

/** @deprecated Use buildReceiptRowDefinitions + drawReceiptTable */
export function buildReceiptRows(data: RegistrationReceiptData): string[][] {
  return buildReceiptRowDefinitions(data).map((row) => [row.label, row.value]);
}

/** Kept for compatibility — prefer drawReceiptTable */
export function getReceiptTableOptions(): null {
  return null;
}

export { GUJARATI_PDF_FONT_NAME };
