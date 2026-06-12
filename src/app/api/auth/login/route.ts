import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  setSessionCookie,
  verifyCredentials,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const isValid = await verifyCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSession(email);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
