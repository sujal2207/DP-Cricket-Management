import { formatFullName } from "@/lib/validation";
import { CAPTAINCY_INTEREST } from "@/lib/constants";
import {
  formatPdfValue,
  formatPdfDateTime,
  PDF_NOT_APPLICABLE,
} from "@/lib/pdf-cell-utils";

export interface CricketerExportRecord {
  _id: { toString(): string } | string;
  first_name: string;
  middle_name: string;
  last_name: string;
  address: string;
  age?: number;
  contact_number_1: string;
  contact_number_2?: string;
  jersey_size?: string;
  jersey_number?: number;
  jersey_name?: string;
  cricket_categories: string[];
  capacity_roles?: string[];
  registration_source?: string;
  created_at: Date | string;
}

export interface ExportPlayerRow {
  srNo: number;
  playerId: string;
  playerName: string;
  fathersName: string;
  age: string;
  address: string;
  mobileNumber: string;
  mobileNumber2: string;
  cricketCategory: string;
  captaincyInterest: string;
  jerseySize: string;
  jerseyNumber: string;
  jerseyName: string;
  registrationDate: string;
  registrationSource: string;
}

export const EXPORT_COLUMN_HEADERS: { key: keyof ExportPlayerRow; header: string }[] = [
  { key: "srNo", header: "Sr. No." },
  { key: "playerId", header: "Registration ID" },
  { key: "playerName", header: "Full Name" },
  { key: "fathersName", header: "Father's / Husband's Name" },
  { key: "age", header: "Age" },
  { key: "address", header: "Full Address" },
  { key: "mobileNumber", header: "Mobile Number 1" },
  { key: "mobileNumber2", header: "Mobile Number 2" },
  { key: "jerseySize", header: "Jersey Size" },
  { key: "jerseyNumber", header: "Jersey Number" },
  { key: "jerseyName", header: "Jersey Name" },
  { key: "cricketCategory", header: "Cricket Categories" },
  { key: "captaincyInterest", header: "Captaincy Interest" },
  { key: "registrationDate", header: "Registration Date & Time" },
  { key: "registrationSource", header: "Registration Source" },
];

/** Column headers used in the landscape PDF player table (no Sr. No. / Source) */
export const PDF_TABLE_HEADERS = [
  "Registration ID",
  "Full Name",
  "Father's / Husband's Name",
  "Age",
  "Full Address",
  "Mobile 1",
  "Mobile 2",
  "Jersey Size",
  "Jersey No.",
  "Jersey Name",
  "Categories",
  "Captaincy",
  "Reg. Date & Time",
];

/** Relative widths for PDF columns — must match PDF_TABLE_HEADERS length */
export const PDF_COLUMN_WIDTH_RATIOS = [
  0.055, 0.105, 0.085, 0.035, 0.125, 0.065, 0.065, 0.045, 0.045, 0.075, 0.11,
  0.05, 0.075,
];

export function formatExportTimestamp(date = new Date()): string {
  return formatPdfDateTime(date);
}

export function buildExportFilename(
  extension: string,
  tournamentYear?: string
): string {
  const datePart = new Date().toISOString().slice(0, 10);
  const year = tournamentYear?.trim() || "2026";
  return `DP-Cricket-Tournament-${year}-Registrations-${datePart}.${extension}`;
}

export function buildExportRows(cricketers: CricketerExportRecord[]): ExportPlayerRow[] {
  return cricketers.map((c, index) => {
    const id = typeof c._id === "string" ? c._id : c._id.toString();
    return {
      srNo: index + 1,
      playerId: id.slice(-8).toUpperCase(),
      playerName: formatFullName(c.first_name, c.middle_name, c.last_name),
      fathersName: formatPdfValue(c.middle_name),
      age: formatPdfValue(c.age),
      address: formatPdfValue(c.address),
      mobileNumber: formatPdfValue(c.contact_number_1),
      mobileNumber2: formatPdfValue(c.contact_number_2),
      cricketCategory:
        c.cricket_categories.length > 0
          ? c.cricket_categories.join(", ")
          : PDF_NOT_APPLICABLE,
      captaincyInterest: (c.capacity_roles || []).includes(CAPTAINCY_INTEREST)
        ? "Yes"
        : "No",
      jerseySize: formatPdfValue(c.jersey_size),
      jerseyNumber: formatPdfValue(c.jersey_number),
      jerseyName: formatPdfValue(c.jersey_name),
      registrationDate: formatPdfDateTime(c.created_at),
      registrationSource: formatPdfValue(c.registration_source) === PDF_NOT_APPLICABLE
        ? "Admin Panel"
        : String(c.registration_source),
    };
  });
}

export function buildExportMetadata(
  totalPlayers: number,
  tournamentTitle: string,
  tournamentShort: string,
  organizationName: string,
  tournamentYear?: string
) {
  const exportedAt = formatExportTimestamp();
  return {
    exportedAt,
    totalPlayers,
    tournamentTitle,
    tournamentShort,
    organizationName,
    tournamentYear: tournamentYear?.trim() || "2026",
    reportTitle: "Player Registration Report",
  };
}

export interface ExportStatistics {
  totalPlayers: number;
  totalBatters: number;
  totalBowlers: number;
  totalAllRounders: number;
  totalWicketKeepers: number;
  totalCaptainsInterested: number;
}

export function buildExportStatistics(
  cricketers: CricketerExportRecord[]
): ExportStatistics {
  const hasCategory = (c: CricketerExportRecord, cat: string) =>
    c.cricket_categories.includes(cat);

  return {
    totalPlayers: cricketers.length,
    totalBatters: cricketers.filter((c) => hasCategory(c, "Batting")).length,
    totalBowlers: cricketers.filter((c) => hasCategory(c, "Bowling")).length,
    totalAllRounders: cricketers.filter((c) => hasCategory(c, "All Rounder"))
      .length,
    totalWicketKeepers: cricketers.filter((c) =>
      hasCategory(c, "Wicket Keeper")
    ).length,
    totalCaptainsInterested: cricketers.filter((c) =>
      (c.capacity_roles || []).includes(CAPTAINCY_INTEREST)
    ).length,
  };
}

export function rowToCsvRecord(row: ExportPlayerRow): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  for (const col of EXPORT_COLUMN_HEADERS) {
    record[col.header] = row[col.key];
  }
  return record;
}

export function rowsToPdfTableBody(rows: ExportPlayerRow[]): string[][] {
  return rows.map((row) => [
    row.playerId,
    row.playerName,
    row.fathersName,
    row.age,
    row.address,
    row.mobileNumber,
    row.mobileNumber2,
    row.jerseySize,
    row.jerseyNumber,
    row.jerseyName,
    row.cricketCategory,
    row.captaincyInterest,
    row.registrationDate,
  ]);
}
