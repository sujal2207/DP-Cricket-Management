import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";
import { cricketerSchema, formatFullName } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import { getAdminEmailFromSession } from "@/lib/admin-credentials";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const cricketer = await Cricketer.findById(id).lean();

    if (!cricketer) {
      return NextResponse.json({ error: "Cricketer not found" }, { status: 404 });
    }

    return NextResponse.json({ data: cricketer });
  } catch (error) {
    console.error("GET cricketer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cricketer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = cricketerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Cricketer.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Cricketer not found" }, { status: 404 });
    }

    const data = parsed.data;

    const duplicate = await Cricketer.findOne({
      contact_number_1: data.contact_number_1,
      _id: { $ne: id },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A cricketer with this contact number already exists" },
        { status: 409 }
      );
    }

    const previousData = existing.toObject();
    Object.assign(existing, {
      ...data,
      contact_number_2: data.contact_number_2 || "",
    });
    await existing.save();

    const fullName = formatFullName(
      data.first_name,
      data.middle_name,
      data.last_name
    );

    await logAudit({
      cricketerId: id,
      cricketerName: fullName,
      action: "UPDATE",
      performedBy: getAdminEmailFromSession(session),
      changes: {
        before: previousData,
        after: data,
      },
    });

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    console.error("PUT cricketer error:", error);
    return NextResponse.json(
      { error: "Failed to update cricketer" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const cricketer = await Cricketer.findById(id);
    if (!cricketer) {
      return NextResponse.json({ error: "Cricketer not found" }, { status: 404 });
    }

    const fullName = formatFullName(
      cricketer.first_name,
      cricketer.middle_name,
      cricketer.last_name
    );

    await logAudit({
      cricketerId: id,
      cricketerName: fullName,
      action: "DELETE",
      performedBy: getAdminEmailFromSession(session),
      changes: cricketer.toObject() as unknown as Record<string, unknown>,
    });

    await Cricketer.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Cricketer deleted" });
  } catch (error) {
    console.error("DELETE cricketer error:", error);
    return NextResponse.json(
      { error: "Failed to delete cricketer" },
      { status: 500 }
    );
  }
}
