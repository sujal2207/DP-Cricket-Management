import {
  EXPORT_COLUMN_HEADERS,
  type ExportPlayerRow,
  rowToCsvRecord,
} from "./export-data";

export function generateCsvExport(rows: ExportPlayerRow[]): string {
  const headers = EXPORT_COLUMN_HEADERS.map((col) => col.header);

  const lines = [
    headers.map((h) => escapeCsvField(h)).join(","),
    ...rows.map((row) => {
      const record = rowToCsvRecord(row);
      return headers
        .map((header) => escapeCsvField(String(record[header] ?? "")))
        .join(",");
    }),
  ];

  return "\uFEFF" + lines.join("\r\n");
}

function escapeCsvField(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return `"${normalized.replace(/"/g, '""')}"`;
}
