import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";
import { cricketerSchema, formatFullName } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import { getAdminEmailFromSession } from "@/lib/admin-credentials";
import { logAudit } from "@/lib/audit";
import {
  findMobileRegistrationConflict,
  normalizeContactFields,
} from "@/lib/contact-uniqueness";

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

    const normalized = normalizeContactFields(parsed.data);

    const conflict = await findMobileRegistrationConflict(
      Cricketer,
      normalized.contact_number_1,
      normalized.contact_number_2,
      id
    );

    if (conflict) {
      const message =
        conflict.field === "contact_number_1"
          ? "This mobile number is already registered"
          : "This mobile number is already used in another registration";

      return NextResponse.json(
        {
          error: message,
          details: { fieldErrors: { [conflict.field]: [message] } },
        },
        { status: 409 }
      );
    }

    const previousData = existing.toObject();
    Object.assign(existing, {
      ...normalized,
      contact_number_2: normalized.contact_number_2 || "",
    });
    await existing.save();

    const fullName = formatFullName(
      normalized.first_name,
      normalized.middle_name,
      normalized.last_name
    );

    await logAudit({
      cricketerId: id,
      cricketerName: fullName,
      action: "UPDATE",
      performedBy: getAdminEmailFromSession(session),
      changes: {
        before: previousData,
        after: normalized,
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
