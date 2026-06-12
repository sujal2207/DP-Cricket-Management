import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import {
  loadAdminCredentials,
  normalizeAdminEmail,
  getMainAdminEmail,
} from "@/lib/admin-credentials";

export async function verifyAdminLogin(
  email: string,
  password: string
): Promise<boolean> {
  const normalized = normalizeAdminEmail(email);

  const envCredentials = loadAdminCredentials();
  if (envCredentials.length === 0) {
    throw new Error("Main admin not configured in .env");
  }

  const envMatch = envCredentials.some(
    (cred) => cred.email === normalized && cred.password === password
  );
  if (envMatch) return true;

  await connectDB();
  const dbUser = await AdminUser.findOne({ email: normalized });
  if (!dbUser) return false;

  return bcrypt.compare(password, dbUser.password_hash);
}

export async function listManagedAdminUsers() {
  await connectDB();
  const users = await AdminUser.find().sort({ created_at: -1 }).lean();
  return users.map((u) => ({
    id: u._id.toString(),
    email: u.email,
    created_by: u.created_by,
    created_at: u.created_at,
  }));
}

export async function createManagedAdminUser(
  email: string,
  password: string,
  createdBy: string
) {
  const normalized = normalizeAdminEmail(email);

  const envEmails = loadAdminCredentials().map((c) => c.email);
  if (envEmails.includes(normalized)) {
    throw new Error("This email is already used by the main admin");
  }

  await connectDB();

  const existing = await AdminUser.findOne({ email: normalized });
  if (existing) {
    throw new Error("An admin with this email already exists");
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await AdminUser.create({
    email: normalized,
    password_hash,
    created_by: createdBy,
  });

  return {
    id: user._id.toString(),
    email: user.email,
    created_by: user.created_by,
    created_at: user.created_at,
  };
}

export async function deleteManagedAdminUser(id: string) {
  await connectDB();
  const deleted = await AdminUser.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Admin user not found");
  }
  return { email: deleted.email };
}

export function getMainAdminInfo() {
  const email = getMainAdminEmail();
  return email ? { email, source: "env" as const, isMainAdmin: true } : null;
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const normalized = normalizeAdminEmail(email);
  if (loadAdminCredentials().some((c) => c.email === normalized)) return true;
  await connectDB();
  const exists = await AdminUser.exists({ email: normalized });
  return !!exists;
}
