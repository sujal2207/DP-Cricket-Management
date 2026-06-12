import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";
import { publicCricketerSchema, formatFullName } from "@/lib/validation";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";
import { REGISTRATION_SOURCES, CAPTAINCY_INTEREST } from "@/lib/constants";
import { logAudit } from "@/lib/audit";
import { gu } from "@/lib/translations/publicRegistrationGu";

export async function POST(request: NextRequest) {
  try {
    const csrfToken = request.headers.get("X-CSRF-Token");
    const csrfValid = await validateCsrfToken(csrfToken);
    if (!csrfValid) {
      return NextResponse.json({ error: gu.errors.invalidCsrf }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`public-register:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: gu.errors.rateLimit,
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = publicCricketerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: gu.errors.validationFailed, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { interested_in_captaincy, ...data } = parsed.data;

    const capacity_roles = interested_in_captaincy ? [CAPTAINCY_INTEREST] : [];

    await connectDB();

    const existing = await Cricketer.findOne({
      contact_number_1: data.contact_number_1,
    });

    if (existing) {
      return NextResponse.json({ error: gu.errors.duplicateMobile }, { status: 409 });
    }

    const cricketer = await Cricketer.create({
      ...data,
      contact_number_2: data.contact_number_2 || "",
      capacity_roles,
      registration_source: REGISTRATION_SOURCES.PUBLIC,
    });

    const fullName = formatFullName(
      data.first_name,
      data.middle_name,
      data.last_name
    );

    await createNotification(cricketer._id.toString(), fullName);

    await logAudit({
      cricketerId: cricketer._id.toString(),
      cricketerName: fullName,
      action: "CREATE",
      performedBy: "Public Registration",
      changes: { ...data, registration_source: REGISTRATION_SOURCES.PUBLIC },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: cricketer._id.toString(),
          first_name: cricketer.first_name,
          middle_name: cricketer.middle_name,
          last_name: cricketer.last_name,
          full_name: fullName,
          contact_number_1: cricketer.contact_number_1,
          cricket_categories: cricketer.cricket_categories,
          capacity_roles: cricketer.capacity_roles,
          interested_in_captaincy: interested_in_captaincy,
          created_at: cricketer.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public registration error:", error);
    return NextResponse.json({ error: gu.errors.submitFailed }, { status: 500 });
  }
}
