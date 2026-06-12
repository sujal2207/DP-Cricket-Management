const REGISTRATION_TIMEZONE = "Asia/Kolkata";

/** YYYY-MM-DD in Asia/Kolkata */
export function getTodayInRegistrationTz(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REGISTRATION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function normalizeCloseDate(
  value: string | null | undefined
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
}

/** Registration open when no close date, or today (IST) is on/before close date */
export function isPublicRegistrationOpen(
  closesOn: string | null | undefined,
  now = new Date()
): boolean {
  const closeDate = normalizeCloseDate(closesOn);
  if (!closeDate) return true;
  return getTodayInRegistrationTz(now) <= closeDate;
}

export function formatCloseDateDisplay(
  closesOn: string,
  locale: "en-IN" | "gu-IN" = "en-IN"
): string {
  const [year, month, day] = closesOn.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
