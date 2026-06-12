import type { jsPDF } from "jspdf";
import { formatFullName } from "./validation";
import { CAPTAINCY_INTEREST } from "./constants";
import { gu, getCategoryLabel } from "./translations/publicRegistrationGu";
import {
  setGujaratiPdfFont,
  GUJARATI_PDF_FONT_NAME,
} from "./pdf-gujarati-font-core";
import {
  formatPdfValue,
  formatPdfDateTime,
  PDF_NOT_APPLICABLE,
  detectPdfTextFont,
  setPdfTextFont,
  type PdfTextFont,
} from "./pdf-cell-utils";

export const RECEIPT_NOT_APPLICABLE = PDF_NOT_APPLICABLE;

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

export type ReceiptValueFont = PdfTextFont;

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
const LINE_HEIGHT = 5;
const CELL_PADDING = 3;

function receiptRow(
  label: string,
  value: string,
  valueFont?: ReceiptValueFont
): ReceiptRowDefinition {
  return {
    label,
    value,
    valueFont: valueFont ?? detectPdfTextFont(value),
  };
}

export const formatReceiptValue = formatPdfValue;
export const formatReceiptDateForPdf = formatPdfDateTime;

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
      : PDF_NOT_APPLICABLE;
  const captaincy = (data.capacity_roles || []).includes(CAPTAINCY_INTEREST)
    ? gu.success.yes
    : gu.success.no;
  const dateStr = formatPdfDateTime(data.created_at);

  return [
    receiptRow(gu.pdf.registrationId, data.id.slice(-8).toUpperCase(), "latin"),
    receiptRow(gu.pdf.fullName, formatPdfValue(fullName)),
    receiptRow(gu.pdf.fathersName, formatPdfValue(data.middle_name)),
    receiptRow(gu.pdf.age, formatPdfValue(data.age), "latin"),
    receiptRow(gu.pdf.address, formatPdfValue(data.address)),
    receiptRow(gu.pdf.mobile1, formatPdfValue(data.contact_number_1), "latin"),
    receiptRow(gu.pdf.mobile2, formatPdfValue(data.contact_number_2), "latin"),
    receiptRow(gu.pdf.jerseySize, formatPdfValue(data.jersey_size), "latin"),
    receiptRow(gu.pdf.jerseyNumber, formatPdfValue(data.jersey_number), "latin"),
    receiptRow(gu.pdf.jerseyName, formatPdfValue(data.jersey_name)),
    receiptRow(gu.pdf.categories, categories, "gujarati"),
    receiptRow(gu.pdf.captaincy, captaincy, "gujarati"),
    receiptRow(gu.pdf.date, dateStr, "latin"),
  ];
}

function measureWrappedLines(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  font: ReceiptValueFont
): string[] {
  setPdfTextFont(doc, font);
  return doc.splitTextToSize(text, maxWidth) as string[];
}

/** Manual receipt table — dual-font rendering for reliable output */
export function drawReceiptTable(
  doc: jsPDF,
  rows: ReceiptRowDefinition[],
  startY: number
): number {
  doc.setFontSize(FONT_SIZE);
  let y = startY;

  for (let index = 0; index < rows.length; index++) {
    const rowDef = rows[index];

    setGujaratiPdfFont(doc, "normal");
    const labelLines = doc.splitTextToSize(
      rowDef.label,
      LABEL_WIDTH - CELL_PADDING * 2
    ) as string[];

    const valueLines = measureWrappedLines(
      doc,
      rowDef.value,
      VALUE_WIDTH - CELL_PADDING * 2,
      rowDef.valueFont
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

    setPdfTextFont(doc, rowDef.valueFont);
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

export function buildReceiptRows(data: RegistrationReceiptData): string[][] {
  return buildReceiptRowDefinitions(data).map((r) => [r.label, r.value]);
}

export function getReceiptTableOptions(): null {
  return null;
}

export { GUJARATI_PDF_FONT_NAME };
