import { NextResponse } from "next/server";
import { getRegistrationBranding } from "@/lib/registration-branding";

export async function GET() {
  try {
    const branding = await getRegistrationBranding();
    return NextResponse.json(branding);
  } catch (error) {
    console.error("GET public branding error:", error);
    return NextResponse.json(
      { error: "Failed to load registration branding" },
      { status: 500 }
    );
  }
}
