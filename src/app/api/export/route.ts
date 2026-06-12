import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";
import { formatFullName } from "@/lib/validation";
import { formatDateShort } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const format = new URL(request.url).searchParams.get("format") || "xlsx";
    const cricketers = await Cricketer.find().sort({ created_at: -1 }).lean();

    const rows = cricketers.map((c) => ({
      ID: c._id.toString(),
      "First Name": c.first_name,
      "Middle Name": c.middle_name,
      "Last Name": c.last_name,
      "Full Name": formatFullName(c.first_name, c.middle_name, c.last_name),
      Address: c.address,
      "Contact Number 1": c.contact_number_1,
      "Contact Number 2": c.contact_number_2 || "",
      "Jersey Size": c.jersey_size || "",
      "Jersey Number": c.jersey_number ?? "",
      "Jersey Name": c.jersey_name || "",
      Categories: c.cricket_categories.join(", "),
      "Captaincy Interest": (c.capacity_roles || []).includes("Interested in Captaincy")
        ? "Yes"
        : "No",
      "Registration Source": c.registration_source || "Admin Panel",
      "Registration Date": formatDateShort(c.created_at),
    }));

    if (format === "csv") {
      const headers = Object.keys(rows[0] || {});
      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((h) => `"${String(row[h as keyof typeof row] ?? "").replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      return new NextResponse("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cricketers-${Date.now()}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      const { applyGujaratiFontToPdf, setGujaratiPdfFont } = await import(
        "@/lib/pdf-gujarati-font"
      );
      const doc = new jsPDF({ orientation: "landscape" });
      await applyGujaratiFontToPdf(doc);
      doc.setFontSize(14);
      setGujaratiPdfFont(doc, "bold");
      doc.text("DPC Cricket - Cricketers Export", 14, 15);
      doc.setFontSize(8);
      setGujaratiPdfFont(doc, "normal");

      let y = 25;
      rows.slice(0, 50).forEach((row, i) => {
        if (y > 190) {
          doc.addPage();
          y = 15;
        }
        const line = `${i + 1}. ${row["Full Name"]} | ${row["Jersey Size"]} #${row["Jersey Number"]} ${row["Jersey Name"]} | ${row["Contact Number 1"]} | ${row.Categories}`;
        const wrapped = doc.splitTextToSize(line, 270);
        doc.text(wrapped, 14, y);
        y += wrapped.length * 6;
      });

      const buffer = Buffer.from(doc.output("arraybuffer"));
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="cricketers-${Date.now()}.pdf"`,
        },
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cricketers");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="cricketers-${Date.now()}.xlsx"`,
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
