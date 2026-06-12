import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await connectDB();

    const logs = await AuditLog.find()
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("Audit log error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
