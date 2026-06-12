import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PDF_TABLE_HEADERS,
  rowsToPdfTableBody,
  type ExportPlayerRow,
  type ExportStatistics,
} from "./export-data";
import {
  applyGujaratiFontToPdf,
  setGujaratiPdfFont,
} from "./pdf-gujarati-font.server";
import {
  APP_BRAND_NAME,
  DEVELOPER_CREDIT,
  HOSTING_CREDIT,
} from "./constants";

export interface PdfExportMetadata {
  tournamentTitle: string;
  tournamentShort: string;
  organizationName: string;
  reportTitle: string;
  exportedAt: string;
  totalPlayers: number;
  tournamentYear: string;
}

const BRAND_PURPLE: [number, number, number] = [46, 0, 75];
const TEXT_DARK: [number, number, number] = [30, 41, 59];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];
const ROW_ALT: [number, number, number] = [248, 250, 252];
const FONT_NAME = "NotoSansGujarati";

const MARGIN = { left: 14, right: 14, top: 14, bottom: 22 };

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

function getContentWidth(doc: jsPDF): number {
  return (
    doc.internal.pageSize.getWidth() - MARGIN.left - MARGIN.right
  );
}

/** Centered report header — page 1 only */
function drawReportHeader(
  doc: jsPDF,
  metadata: PdfExportMetadata,
  logoDataUrl: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  let y = MARGIN.top;

  doc.addImage(logoDataUrl, "PNG", centerX - 11, y, 22, 22);
  y += 28;

  setGujaratiPdfFont(doc, "bold");
  doc.setTextColor(...BRAND_PURPLE);
  doc.setFontSize(16);
  doc.text(`${APP_BRAND_NAME} ${metadata.tournamentYear}`, centerX, y, {
    align: "center",
  });
  y += 7;

  setGujaratiPdfFont(doc, "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(11);
  doc.text(metadata.reportTitle, centerX, y, { align: "center" });
  y += 9;

  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`Generated: ${metadata.exportedAt}`, centerX, y, {
    align: "center",
  });
  y += 5;
  doc.text(
    `Total Registered Players: ${metadata.totalPlayers}`,
    centerX,
    y,
    { align: "center" }
  );
  y += 5;
  doc.text(`Tournament Year: ${metadata.tournamentYear}`, centerX, y, {
    align: "center",
  });
  y += 8;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN.left, y, pageWidth - MARGIN.right, y);

  return y + 6;
}

/** Minimal continuation label on pages 2+ */
function drawContinuationHeader(
  doc: jsPDF,
  metadata: PdfExportMetadata
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  setGujaratiPdfFont(doc, "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(8);
  doc.text(
    `${APP_BRAND_NAME} ${metadata.tournamentYear} — ${metadata.reportTitle}`,
    pageWidth / 2,
    MARGIN.top + 4,
    { align: "center" }
  );

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN.left, MARGIN.top + 7, pageWidth - MARGIN.right, MARGIN.top + 7);
}

function drawStatisticsTable(
  doc: jsPDF,
  stats: ExportStatistics,
  startY: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = Math.min(120, getContentWidth(doc));
  const marginLeft = (pageWidth - tableWidth) / 2;

  setGujaratiPdfFont(doc, "bold");
  doc.setTextColor(...BRAND_PURPLE);
  doc.setFontSize(10);
  doc.text("Registration Summary", MARGIN.left, startY);

  const summaryBody: string[][] = [
    ["Total Players", String(stats.totalPlayers)],
    ["Total Batters", String(stats.totalBatters)],
    ["Total Bowlers", String(stats.totalBowlers)],
    ["Total All-Rounders", String(stats.totalAllRounders)],
    ["Total Wicket Keepers", String(stats.totalWicketKeepers)],
    ["Total Captaincy Interests", String(stats.totalCaptainsInterested)],
  ];

  autoTable(doc, {
    startY: startY + 3,
    margin: { left: marginLeft, right: pageWidth - marginLeft - tableWidth },
    tableWidth,
    head: [["Metric", "Count"]],
    body: summaryBody,
    theme: "plain",
    styles: {
      font: FONT_NAME,
      fontSize: 9,
      cellPadding: 3,
      textColor: TEXT_DARK,
      lineColor: BORDER,
      lineWidth: 0.15,
    },
    headStyles: {
      font: FONT_NAME,
      fontStyle: "bold",
      fillColor: BRAND_PURPLE,
      textColor: [255, 255, 255],
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.72 },
      1: { cellWidth: tableWidth * 0.28, halign: "center", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: ROW_ALT,
    },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? startY;
  return finalY + 8;
}

function drawPageFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  metadata: PdfExportMetadata
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - MARGIN.bottom + 4;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN.left, footerY, pageWidth - MARGIN.right, footerY);

  setGujaratiPdfFont(doc, "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(6.5);

  doc.text(DEVELOPER_CREDIT, pageWidth / 2, footerY + 4, { align: "center" });
  doc.text(HOSTING_CREDIT, pageWidth / 2, footerY + 7.5, { align: "center" });

  doc.setFontSize(6);
  doc.text(
    `© ${metadata.tournamentYear} ${metadata.organizationName}`,
    MARGIN.left,
    footerY + 11
  );
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth / 2,
    footerY + 11,
    { align: "center" }
  );
  doc.text(
    `Exported: ${metadata.exportedAt}`,
    pageWidth - MARGIN.right,
    footerY + 11,
    { align: "right" }
  );
}

const PLAYER_COLUMN_WIDTHS: Record<number, number> = {
  0: 17,
  1: 32,
  2: 10,
  3: 22,
  4: 46,
  5: 28,
  6: 16,
  7: 13,
  8: 11,
  9: 24,
  10: 20,
};

export async function generatePdfExport(
  rows: ExportPlayerRow[],
  metadata: PdfExportMetadata,
  statistics: ExportStatistics
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  await applyGujaratiFontToPdf(doc);
  const logoDataUrl = loadLogoDataUrl();
  const tableWidth = getContentWidth(doc);

  let y = drawReportHeader(doc, metadata, logoDataUrl);
  y = drawStatisticsTable(doc, statistics, y);

  if (rows.length === 0) {
    setGujaratiPdfFont(doc, "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.setFontSize(10);
    doc.text(
      "No player registrations recorded yet.",
      doc.internal.pageSize.getWidth() / 2,
      y + 6,
      { align: "center" }
    );
  } else {
    setGujaratiPdfFont(doc, "bold");
    doc.setTextColor(...BRAND_PURPLE);
    doc.setFontSize(10);
    doc.text("Registered Players", MARGIN.left, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      tableWidth,
      margin: { ...MARGIN, top: 22 },
      head: [PDF_TABLE_HEADERS],
      body: rowsToPdfTableBody(rows),
      theme: "plain",
      showHead: "everyPage",
      styles: {
        font: FONT_NAME,
        fontSize: 7.5,
        cellPadding: 2.5,
        overflow: "linebreak",
        valign: "top",
        textColor: TEXT_DARK,
        lineColor: BORDER,
        lineWidth: 0.15,
      },
      headStyles: {
        font: FONT_NAME,
        fontStyle: "bold",
        fillColor: BRAND_PURPLE,
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
        fontSize: 7.5,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: ROW_ALT,
      },
      columnStyles: {
        0: { cellWidth: PLAYER_COLUMN_WIDTHS[0], halign: "center" },
        1: { cellWidth: PLAYER_COLUMN_WIDTHS[1] },
        2: { cellWidth: PLAYER_COLUMN_WIDTHS[2], halign: "center" },
        3: { cellWidth: PLAYER_COLUMN_WIDTHS[3] },
        4: { cellWidth: PLAYER_COLUMN_WIDTHS[4] },
        5: { cellWidth: PLAYER_COLUMN_WIDTHS[5], halign: "center" },
        6: { cellWidth: PLAYER_COLUMN_WIDTHS[6], halign: "center" },
        7: { cellWidth: PLAYER_COLUMN_WIDTHS[7], halign: "center" },
        8: { cellWidth: PLAYER_COLUMN_WIDTHS[8], halign: "center" },
        9: { cellWidth: PLAYER_COLUMN_WIDTHS[9] },
        10: { cellWidth: PLAYER_COLUMN_WIDTHS[10], halign: "center" },
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          drawContinuationHeader(doc, metadata);
        }
      },
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawPageFooter(doc, page, totalPages, metadata);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
