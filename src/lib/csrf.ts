import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export const CSRF_COOKIE = "cms_csrf";

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export async function setCsrfCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });
}

export async function validateCsrfToken(headerToken: string | null): Promise<boolean> {
  if (!headerToken) return false;
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!cookieToken || cookieToken !== headerToken) return false;
  return true;
}
