export interface AdminCredential {
  email: string;
  password: string;
}

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseJsonCredentials(raw: string): AdminCredential[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const credentials: AdminCredential[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        "email" in item &&
        "password" in item &&
        typeof item.email === "string" &&
        typeof item.password === "string" &&
        item.email.trim() &&
        item.password
      ) {
        credentials.push({
          email: normalizeAdminEmail(item.email),
          password: item.password,
        });
      }
    }
    return credentials.length > 0 ? credentials : null;
  } catch {
    return null;
  }
}

function parsePipeCredentials(raw: string): AdminCredential[] {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const colonIndex = entry.indexOf(":");
      if (colonIndex <= 0) return null;
      const email = entry.slice(0, colonIndex).trim();
      const password = entry.slice(colonIndex + 1);
      if (!email || !password) return null;
      return { email: normalizeAdminEmail(email), password };
    })
    .filter((c): c is AdminCredential => c !== null);
}

/**
 * Main admin + optional extra env admins from ADMIN_CREDENTIALS / legacy vars.
 */
export function loadAdminCredentials(): AdminCredential[] {
  const raw = process.env.ADMIN_CREDENTIALS?.trim();

  if (raw) {
    if (raw.startsWith("[")) {
      const jsonCreds = parseJsonCredentials(raw);
      if (jsonCreds) return jsonCreds;
    } else {
      const pipeCreds = parsePipeCredentials(raw);
      if (pipeCreds.length > 0) return pipeCreds;
    }
  }

  const legacyEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.ADMIN_USERNAME?.trim();
  const legacyPassword = process.env.ADMIN_PASSWORD;

  if (legacyEmail && legacyPassword) {
    return [{ email: normalizeAdminEmail(legacyEmail), password: legacyPassword }];
  }

  return [];
}

/** Primary main admin email from .env (first credential). */
export function getMainAdminEmail(): string | null {
  const creds = loadAdminCredentials();
  return creds[0]?.email ?? null;
}

export function getAdminEmailFromSession(payload: SessionPayloadLike): string {
  return payload.email || payload.username || "admin";
}

interface SessionPayloadLike {
  email?: string;
  username?: string;
}
