import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { verifyAdminLogin } from "@/lib/admin-users";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "cms_session";

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  email: string;
  /** @deprecated legacy JWT field */
  username?: string;
  exp?: number;
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<boolean> {
  return verifyAdminLogin(email, password);
}

export async function createSession(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  return new SignJWT({ email: normalized })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const data = payload as unknown as SessionPayload;
    if (!data.email && data.username) {
      data.email = data.username;
    }
    return data;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
