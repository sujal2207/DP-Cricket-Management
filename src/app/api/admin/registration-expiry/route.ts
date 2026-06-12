import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminEmailFromSession } from "@/lib/admin-credentials";
import {
  getRegistrationBranding,
  updateRegistrationExpiry,
} from "@/lib/registration-branding";
import { registrationExpirySchema } from "@/lib/registration-expiry-validation";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branding = await getRegistrationBranding();
    return NextResponse.json({
      registrationClosesOn: branding.registrationClosesOn,
      isRegistrationOpen: branding.isRegistrationOpen,
      updatedAt: branding.updatedAt,
    });
  } catch (error) {
    console.error("GET registration expiry error:", error);
    return NextResponse.json(
      { error: "Failed to load registration settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = registrationExpirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid date", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const adminEmail = getAdminEmailFromSession(session);
    const branding = await updateRegistrationExpiry(
      parsed.data.registration_closes_on,
      adminEmail || "admin"
    );

    return NextResponse.json({
      registrationClosesOn: branding.registrationClosesOn,
      isRegistrationOpen: branding.isRegistrationOpen,
      updatedAt: branding.updatedAt,
    });
  } catch (error) {
    console.error("PATCH registration expiry error:", error);
    return NextResponse.json(
      { error: "Failed to update registration settings" },
      { status: 500 }
    );
  }
}
