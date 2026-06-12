import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";
import { cricketerSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import { getAdminEmailFromSession } from "@/lib/admin-credentials";
import { logAudit } from "@/lib/audit";
import { formatFullName } from "@/lib/validation";
import { ITEMS_PER_PAGE, CAPTAINCY_INTEREST } from "@/lib/constants";
import {
  findMobileRegistrationConflict,
  normalizeContactFields,
} from "@/lib/contact-uniqueness";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const searchName = searchParams.get("searchName") || "";
    const searchMobile = searchParams.get("searchMobile") || "";
    const category = searchParams.get("category") || "";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {};
    const conditions: Record<string, unknown>[] = [];

    if (searchName) {
      const nameRegex = new RegExp(searchName, "i");
      conditions.push({
        $or: [
          { first_name: nameRegex },
          { middle_name: nameRegex },
          { last_name: nameRegex },
        ],
      });
    }

    if (searchMobile) {
      conditions.push({
        $or: [
          { contact_number_1: new RegExp(searchMobile) },
          { contact_number_2: new RegExp(searchMobile) },
        ],
      });
    }

    if (category) {
      filter.cricket_categories = category;
    }

    const capacityRole = searchParams.get("capacityRole") || "";
    if (capacityRole === "__none__") {
      filter.capacity_roles = { $ne: CAPTAINCY_INTEREST };
    } else if (capacityRole) {
      filter.capacity_roles = capacityRole;
    }

    const registrationSource = searchParams.get("registrationSource") || "";
    if (registrationSource) {
      filter.registration_source = registrationSource;
    }

    if (conditions.length === 1) {
      Object.assign(filter, conditions[0]);
    } else if (conditions.length > 1) {
      filter.$and = conditions;
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [cricketers, total] = await Promise.all([
      Cricketer.find(filter)
        .sort({ created_at: sortOrder })
        .skip(skip)
        .limit(ITEMS_PER_PAGE)
        .lean(),
      Cricketer.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: cricketers,
      pagination: {
        page,
        totalPages: Math.ceil(total / ITEMS_PER_PAGE),
        totalItems: total,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error("GET cricketers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cricketers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = cricketerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const normalized = normalizeContactFields(parsed.data);

    const conflict = await findMobileRegistrationConflict(
      Cricketer,
      normalized.contact_number_1,
      normalized.contact_number_2
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

    const cricketer = await Cricketer.create({
      ...normalized,
      contact_number_2: normalized.contact_number_2 || "",
      capacity_roles: [],
      registration_source: "Admin Panel",
    });

    const fullName = formatFullName(
      normalized.first_name,
      normalized.middle_name,
      normalized.last_name
    );

    await logAudit({
      cricketerId: cricketer._id.toString(),
      cricketerName: fullName,
      action: "CREATE",
      performedBy: getAdminEmailFromSession(session),
      changes: normalized,
    });

    return NextResponse.json(
      { success: true, data: cricketer },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST cricketer error:", error);
    return NextResponse.json(
      { error: "Failed to create cricketer" },
      { status: 500 }
    );
  }
}
