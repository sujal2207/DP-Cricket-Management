import { jsPDF } from "jspdf";
import { formatFullName } from "./validation";
import { formatDate } from "./utils";
import { CAPTAINCY_INTEREST } from "./constants";
import { gu, getCategoryLabel } from "./translations/publicRegistrationGu";
import type { RegistrationBrandingData } from "./registration-branding-types";
import { applyGujaratiFontToPdf, setGujaratiPdfFont } from "./pdf-gujarati-font";

export interface SlipData {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  contact_number_1: string;
  cricket_categories: string[];
  capacity_roles: string[];
  created_at?: string;
}

export async function generateRegistrationSlip(
  data: SlipData,
  branding: RegistrationBrandingData
): Promise<jsPDF> {
  const doc = new jsPDF();
  await applyGujaratiFontToPdf(doc);

  const fullName = formatFullName(data.first_name, data.middle_name, data.last_name);

  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  setGujaratiPdfFont(doc, "bold");
  doc.text(branding.tournamentShortGu, 105, 20, { align: "center" });
  doc.setFontSize(11);
  setGujaratiPdfFont(doc, "normal");
  doc.text(gu.pdf.slip, 105, 32, { align: "center" });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  let y = 55;

  const rows: [string, string][] = [
    [gu.pdf.registrationId, data.id.slice(-8).toUpperCase()],
    [gu.pdf.fullName, fullName],
    [gu.pdf.mobile, data.contact_number_1],
    [
      gu.pdf.categories,
      data.cricket_categories.map((c) => getCategoryLabel(c)).join(", "),
    ],
    [
      gu.pdf.captaincy,
      data.capacity_roles.includes(CAPTAINCY_INTEREST) ? gu.success.yes : gu.success.no,
    ],
  ];

  if (data.created_at) {
    rows.push([gu.pdf.date, formatDate(data.created_at)]);
  }

  rows.forEach(([label, value]) => {
    setGujaratiPdfFont(doc, "bold");
    doc.text(`${label}:`, 20, y);
    setGujaratiPdfFont(doc, "normal");
    const lines = doc.splitTextToSize(value, 120);
    doc.text(lines, 70, y);
    y += Math.max(8, lines.length * 6);
  });

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(190, 18, 60);
  setGujaratiPdfFont(doc, "normal");
  const feeLines = doc.splitTextToSize(branding.feeNoticeGu, 170);
  doc.text(feeLines, 105, y, { align: "center" });
  y += feeLines.length * 5 + 6;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${branding.tournamentShortGu} માં નોંધણી કરવા બદલ આભાર.`,
    105,
    y,
    { align: "center" }
  );

  return doc;
}

export async function downloadRegistrationSlip(
  data: SlipData,
  branding: RegistrationBrandingData
): Promise<void> {
  const doc = await generateRegistrationSlip(data, branding);
  doc.save(`dp-registration-${data.id.slice(-8)}.pdf`);
}
