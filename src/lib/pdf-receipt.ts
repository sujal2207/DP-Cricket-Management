import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { APP_BRAND_NAME, DEVELOPER_CREDIT, HOSTING_CREDIT } from "./constants";
import { gu } from "./translations/publicRegistrationGu";
import type { RegistrationBrandingData } from "./registration-branding-types";
import {
  applyGujaratiFontToPdf,
  setGujaratiPdfFont,
} from "./pdf-gujarati-font.server";
import {
  buildReceiptRowDefinitions,
  drawReceiptTable,
  type RegistrationReceiptData,
} from "./pdf-receipt-shared";

export type { RegistrationReceiptData };

const BRAND_PURPLE: [number, number, number] = [46, 0, 75];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];

function loadLogoDataUrl(): string {
  const logoPath = path.join(
    process.cwd(),
    "public",
    "images",
    "dp-cricket-tournament-logo.png"
  );
  const buffer = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function generateRegistrationReceiptPdf(
  data: RegistrationReceiptData,
  branding: RegistrationBrandingData
): Promise<Uint8Array> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await applyGujaratiFontToPdf(doc);

  const logoDataUrl = loadLogoDataUrl();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  let y = 16;

  doc.addImage(logoDataUrl, "PNG", centerX - 14, y, 28, 28);
  y += 34;

  setGujaratiPdfFont(doc, "normal");
  doc.setTextColor(...BRAND_PURPLE);
  doc.setFontSize(16);
  doc.text(`${APP_BRAND_NAME} ${branding.tournamentYear}`, centerX, y, {
    align: "center",
  });
  y += 7;

  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(11);
  doc.text(branding.tournamentShortGu, centerX, y, { align: "center" });
  y += 10;

  doc.setFillColor(...BRAND_PURPLE);
  doc.roundedRect(20, y, pageWidth - 40, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(gu.pdf.receiptTitle, centerX, y + 7, { align: "center" });
  y += 16;

  y = drawReceiptTable(doc, buildReceiptRowDefinitions(data), y);
  y += 10;

  doc.setTextColor(190, 18, 60);
  doc.setFontSize(9);
  setGujaratiPdfFont(doc, "normal");
  const feeLines = doc.splitTextToSize(branding.feeNoticeGu, pageWidth - 40);
  doc.text(feeLines, centerX, y, { align: "center" });
  y += feeLines.length * 4.5 + 8;

  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(10);
  doc.text(
    `${branding.tournamentShortGu} માં નોંધણી કરવા બદલ આભાર.`,
    centerX,
    y,
    { align: "center" }
  );

  const footerY = pageHeight - 22;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(20, footerY, pageWidth - 20, footerY);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  setGujaratiPdfFont(doc, "normal");
  doc.text(DEVELOPER_CREDIT, centerX, footerY + 5, { align: "center" });
  doc.text(HOSTING_CREDIT, centerX, footerY + 9, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(
    `© ${new Date().getFullYear()} ${APP_BRAND_NAME}`,
    centerX,
    footerY + 13,
    { align: "center" }
  );

  const buffer = doc.output("arraybuffer");
  return new Uint8Array(buffer);
}
