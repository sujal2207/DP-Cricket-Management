import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";
import { getRegistrationBranding } from "@/lib/registration-branding";
import {
  buildExportFilename,
  buildExportMetadata,
  buildExportRows,
  buildExportStatistics,
  type CricketerExportRecord,
} from "@/lib/export-data";
import { generateCsvExport } from "@/lib/export-csv";
import { generateExcelExport } from "@/lib/export-excel";
import { generatePdfExport } from "@/lib/export-pdf-report";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const format = new URL(request.url).searchParams.get("format") || "xlsx";
    const [cricketers, branding] = await Promise.all([
      Cricketer.find().sort({ created_at: -1 }).lean(),
      getRegistrationBranding(),
    ]);

    const rows = buildExportRows(cricketers as CricketerExportRecord[]);
    const statistics = buildExportStatistics(cricketers as CricketerExportRecord[]);
    const metadata = buildExportMetadata(
      rows.length,
      branding.tournamentTitleGu,
      branding.tournamentShortGu,
      branding.organizationNameGu,
      branding.tournamentYear
    );

    const filename = buildExportFilename(format, branding.tournamentYear);

    if (format === "csv") {
      const csv = generateCsvExport(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "pdf") {
      const buffer = await generatePdfExport(
        rows,
        {
          tournamentTitle: branding.tournamentTitleGu,
          tournamentShort: branding.tournamentShortGu,
          organizationName: branding.organizationNameGu,
          reportTitle: metadata.reportTitle,
          exportedAt: metadata.exportedAt,
          totalPlayers: metadata.totalPlayers,
          tournamentYear: metadata.tournamentYear,
        },
        statistics
      );

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const buffer = await generateExcelExport(rows, {
      tournamentTitle: branding.tournamentTitleGu,
      reportTitle: metadata.reportTitle,
      exportedAt: metadata.exportedAt,
      totalPlayers: metadata.totalPlayers,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
