import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminEmailFromSession } from "@/lib/admin-credentials";
import {
  getRegistrationBranding,
  updateRegistrationBranding,
} from "@/lib/registration-branding";
import { registrationBrandingSchema } from "@/lib/registration-branding-validation";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branding = await getRegistrationBranding();
    return NextResponse.json(branding);
  } catch (error) {
    console.error("GET admin branding error:", error);
    return NextResponse.json(
      { error: "Failed to load registration branding" },
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
    const parsed = registrationBrandingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid branding data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const adminEmail = getAdminEmailFromSession(session);
    const branding = await updateRegistrationBranding(
      parsed.data,
      adminEmail || "admin"
    );

    return NextResponse.json(branding);
  } catch (error) {
    console.error("PATCH admin branding error:", error);
    return NextResponse.json(
      { error: "Failed to update registration branding" },
      { status: 500 }
    );
  }
}
