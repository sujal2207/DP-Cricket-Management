import ExcelJS from "exceljs";
import {
  EXPORT_COLUMN_HEADERS,
  type ExportPlayerRow,
} from "./export-data";

interface ExcelExportMetadata {
  tournamentTitle: string;
  reportTitle: string;
  exportedAt: string;
  totalPlayers: number;
}

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE2E8F0" } },
  left: { style: "thin", color: { argb: "FFE2E8F0" } },
  bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
  right: { style: "thin", color: { argb: "FFE2E8F0" } },
};

const COLUMN_WIDTHS = [8, 30, 16, 40, 24, 18, 12, 14, 20, 18, 22, 12];

export async function generateExcelExport(
  rows: ExportPlayerRow[],
  metadata: ExcelExportMetadata
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DP Cricket Tournament CMS";
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheet = workbook.addWorksheet("Player Registrations", {
    views: [{ state: "frozen", ySplit: 4, activeCell: "A5" }],
    properties: { defaultRowHeight: 18 },
  });

  const colCount = EXPORT_COLUMN_HEADERS.length;
  const lastColLetter = sheet.getColumn(colCount).letter;

  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell("A1");
  titleCell.value = metadata.tournamentTitle;
  titleCell.font = {
    name: "Calibri",
    size: 16,
    bold: true,
    color: { argb: "FF2E004B" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF8FAFC" },
  };
  sheet.getRow(1).height = 32;

  sheet.mergeCells(`A2:${lastColLetter}2`);
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = `${metadata.reportTitle}  •  Exported: ${metadata.exportedAt}  •  Total Players: ${metadata.totalPlayers}`;
  subtitleCell.font = {
    name: "Calibri",
    size: 10,
    color: { argb: "FF475569" },
  };
  subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(2).height = 22;

  sheet.getRow(3).height = 8;

  const headerRow = sheet.getRow(4);
  EXPORT_COLUMN_HEADERS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF16A34A" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = thinBorder;
  });
  headerRow.height = 24;

  rows.forEach((row, rowIndex) => {
    const dataRow = sheet.getRow(5 + rowIndex);
    EXPORT_COLUMN_HEADERS.forEach((col, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      cell.value = row[col.key];
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = {
        vertical: "top",
        wrapText: true,
        horizontal: col.key === "srNo" ? "center" : "left",
      };
      cell.border = thinBorder;

      if (rowIndex % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
    dataRow.height = 20;
  });

  COLUMN_WIDTHS.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  if (rows.length === 0) {
    const emptyRow = sheet.getRow(5);
    sheet.mergeCells(`A5:${lastColLetter}5`);
    emptyRow.getCell(1).value = "No player registrations found.";
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    emptyRow.getCell(1).font = { italic: true, color: { argb: "FF64748B" } };
  }

  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: Math.max(4, 4 + rows.length), column: colCount },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
