import { formatFullName } from "@/lib/validation";
import { formatDate, formatDateShort } from "@/lib/utils";
import { CAPTAINCY_INTEREST } from "@/lib/constants";

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
  playerName: string;
  age: string;
  mobileNumber: string;
  address: string;
  cricketCategory: string;
  captaincyInterest: string;
  jerseySize: string;
  jerseyNumber: string;
  jerseyName: string;
  registrationDate: string;
  registrationSource: string;
  playerId: string;
}

export const EXPORT_COLUMN_HEADERS: { key: keyof ExportPlayerRow; header: string }[] = [
  { key: "srNo", header: "Sr. No." },
  { key: "playerName", header: "Player Name" },
  { key: "age", header: "Age" },
  { key: "mobileNumber", header: "Mobile Number" },
  { key: "address", header: "Address" },
  { key: "cricketCategory", header: "Cricket Category" },
  { key: "captaincyInterest", header: "Captaincy Interest" },
  { key: "jerseySize", header: "Jersey Size" },
  { key: "jerseyNumber", header: "Jersey Number" },
  { key: "jerseyName", header: "Jersey Name" },
  { key: "registrationDate", header: "Registration Date" },
  { key: "registrationSource", header: "Registration Source" },
  { key: "playerId", header: "Player ID" },
];

export function formatExportTimestamp(date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
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
      playerName: formatFullName(c.first_name, c.middle_name, c.last_name),
      age: c.age != null ? String(c.age) : "—",
      mobileNumber: c.contact_number_1,
      address: c.address,
      cricketCategory: c.cricket_categories.join(", "),
      captaincyInterest: (c.capacity_roles || []).includes(CAPTAINCY_INTEREST)
        ? "Yes"
        : "No",
      jerseySize: c.jersey_size || "—",
      jerseyNumber: c.jersey_number != null ? String(c.jersey_number) : "—",
      jerseyName: c.jersey_name || "—",
      registrationDate: formatDateShort(c.created_at),
      registrationSource: c.registration_source || "Admin Panel",
      playerId: id.slice(-8).toUpperCase(),
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

/** Flat row keyed by display header for CSV serialization */
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
    row.age,
    row.mobileNumber,
    row.address,
    row.cricketCategory,
    row.captaincyInterest,
    row.jerseySize,
    row.jerseyNumber,
    row.jerseyName,
    row.registrationDate,
  ]);
}

export const PDF_TABLE_HEADERS = [
  "Registration ID",
  "Full Name",
  "Age",
  "Mobile Number",
  "Address",
  "Categories",
  "Captaincy Interest",
  "Jersey Size",
  "Jersey Number",
  "Jersey Name",
  "Registration Date",
];
