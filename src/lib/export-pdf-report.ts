import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PDF_TABLE_HEADERS,
  PDF_COLUMN_WIDTH_RATIOS,
  rowsToPdfTableBody,
  type ExportPlayerRow,
  type ExportStatistics,
} from "./export-data";
import {
  applyGujaratiFontToPdf,
} from "./pdf-gujarati-font.server";
import { applyAutoTableCellFont, drawPdfMixedLine, drawPdfTextLine } from "./pdf-cell-utils";
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

const MARGIN = { left: 12, right: 12, top: 14, bottom: 24 };
const BODY_FONT_SIZE = 6.5;
const HEAD_FONT_SIZE = 6.5;

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
  return doc.internal.pageSize.getWidth() - MARGIN.left - MARGIN.right;
}

function buildPdfColumnStyles(tableWidth: number) {
  const styles: Record<number, { cellWidth: number; halign?: "left" | "center" | "right" }> = {};
  PDF_COLUMN_WIDTH_RATIOS.forEach((ratio, index) => {
    styles[index] = {
      cellWidth: tableWidth * ratio,
      halign:
        index === 0 || index === 3 || index === 7 || index === 8 || index === 11
          ? "center"
          : "left",
    };
  });
  return styles;
}

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

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_PURPLE);
  doc.setFontSize(16);
  doc.text(`${APP_BRAND_NAME} ${metadata.tournamentYear}`, centerX, y, {
    align: "center",
  });
  y += 7;

  doc.setFont("helvetica", "normal");
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

function drawContinuationHeader(
  doc: jsPDF,
  metadata: PdfExportMetadata
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "normal");
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

  doc.setFont("helvetica", "bold");
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
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: TEXT_DARK,
      lineColor: BORDER,
      lineWidth: 0.15,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      font: "helvetica",
      fontStyle: "bold",
      fillColor: BRAND_PURPLE,
      textColor: [255, 255, 255],
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.72 },
      1: { cellWidth: tableWidth * 0.28, halign: "center" },
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

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(6.5);
  drawPdfTextLine(doc, DEVELOPER_CREDIT, pageWidth / 2, footerY + 4, "center");
  drawPdfTextLine(doc, HOSTING_CREDIT, pageWidth / 2, footerY + 7.5, "center");

  doc.setFontSize(6);
  drawPdfMixedLine(
    doc,
    [
      { text: `© ${metadata.tournamentYear} `, font: "latin" },
      {
        text: metadata.organizationName,
        font: /[\u0A80-\u0AFF]/.test(metadata.organizationName)
          ? "gujarati"
          : "latin",
      },
    ],
    MARGIN.left,
    footerY + 11,
    "left"
  );
  doc.setFont("helvetica", "normal");
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
  const columnStyles = buildPdfColumnStyles(tableWidth);

  let y = drawReportHeader(doc, metadata, logoDataUrl);
  y = drawStatisticsTable(doc, statistics, y);

  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.setFontSize(10);
    doc.text(
      "No player registrations recorded yet.",
      doc.internal.pageSize.getWidth() / 2,
      y + 6,
      { align: "center" }
    );
  } else {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_PURPLE);
    doc.setFontSize(10);
    doc.text("Registered Players", MARGIN.left, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      tableWidth,
      margin: { ...MARGIN, top: 20 },
      head: [PDF_TABLE_HEADERS],
      body: rowsToPdfTableBody(rows),
      theme: "plain",
      showHead: "everyPage",
      rowPageBreak: "auto",
      styles: {
        font: "helvetica",
        fontSize: BODY_FONT_SIZE,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "top",
        textColor: TEXT_DARK,
        lineColor: BORDER,
        lineWidth: 0.15,
        minCellHeight: 9,
      },
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fillColor: BRAND_PURPLE,
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
        fontSize: HEAD_FONT_SIZE,
        cellPadding: 2.5,
        overflow: "linebreak",
        minCellHeight: 10,
      },
      alternateRowStyles: {
        fillColor: ROW_ALT,
      },
      columnStyles,
      didParseCell: (data) => {
        if (data.section === "head") {
          data.cell.styles.font = "helvetica";
          data.cell.styles.fontStyle = "bold";
          return;
        }
        if (data.section === "body") {
          applyAutoTableCellFont(data.cell.text, data.cell.styles);
        }
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
