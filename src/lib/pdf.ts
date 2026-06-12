import { jsPDF } from "jspdf";
import { APP_BRAND_NAME, DEVELOPER_CREDIT, HOSTING_CREDIT } from "./constants";
import { gu } from "./translations/publicRegistrationGu";
import type { RegistrationBrandingData } from "./registration-branding-types";
import { applyGujaratiFontToPdf, setGujaratiPdfFont } from "./pdf-gujarati-font";
import {
  buildReceiptRowDefinitions,
  drawReceiptTable,
  type RegistrationReceiptData,
} from "./pdf-receipt-shared";

export type SlipData = RegistrationReceiptData;

const BRAND_PURPLE: [number, number, number] = [46, 0, 75];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function loadLogoDataUrlClient(): Promise<string | null> {
  try {
    const response = await fetch("/images/dp-cricket-tournament-logo.png");
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

export async function generateRegistrationSlip(
  data: SlipData,
  branding: RegistrationBrandingData
): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await applyGujaratiFontToPdf(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  let y = 16;

  const logoDataUrl = await loadLogoDataUrlClient();
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", centerX - 14, y, 28, 28);
    y += 34;
  } else {
    y += 4;
  }

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

  return doc;
}

async function downloadReceiptViaApi(data: SlipData): Promise<void> {
  const response = await fetch("/api/public/receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: data.id,
      contact_number_1: data.contact_number_1,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || gu.errors.receiptFailed);
  }

  const blob = await response.blob();
  if (!blob.size || blob.type !== "application/pdf") {
    throw new Error(gu.errors.receiptFailed);
  }

  triggerBrowserDownload(blob, `dp-registration-receipt-${data.id.slice(-8)}.pdf`);
}

export async function downloadRegistrationSlip(
  data: SlipData,
  branding: RegistrationBrandingData
): Promise<void> {
  let apiError: Error | null = null;

  try {
    await downloadReceiptViaApi(data);
    return;
  } catch (error) {
    apiError =
      error instanceof Error ? error : new Error(gu.errors.receiptFailed);
  }

  try {
    const doc = await generateRegistrationSlip(data, branding);
    doc.save(`dp-registration-receipt-${data.id.slice(-8)}.pdf`);
  } catch {
    throw apiError ?? new Error(gu.errors.receiptFailed);
  }
}
