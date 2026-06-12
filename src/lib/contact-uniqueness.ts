import type { Model } from "mongoose";
import type { ICricketer } from "@/models/Cricketer";

export type MobileConflictField = "contact_number_1" | "contact_number_2";

/** Normalize to last 10 digits for Indian mobile comparison */
export function normalizeMobileNumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export function buildMobileConflictFilter(
  mobile: string,
  excludeId?: string
): Record<string, unknown> | null {
  const normalized = normalizeMobileNumber(mobile);
  if (normalized.length !== 10) return null;

  const filter: Record<string, unknown> = {
    $or: [{ contact_number_1: normalized }, { contact_number_2: normalized }],
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return filter;
}

export async function findCricketerByRegisteredMobile(
  Cricketer: Model<ICricketer>,
  mobile: string,
  excludeId?: string
) {
  const filter = buildMobileConflictFilter(mobile, excludeId);
  if (!filter) return null;
  return Cricketer.findOne(filter).lean();
}

export async function findMobileRegistrationConflict(
  Cricketer: Model<ICricketer>,
  contactNumber1: string,
  contactNumber2: string | undefined,
  excludeId?: string
): Promise<{ field: MobileConflictField; mobile: string } | null> {
  const primary = normalizeMobileNumber(contactNumber1);
  if (primary.length === 10) {
    const existingPrimary = await findCricketerByRegisteredMobile(
      Cricketer,
      primary,
      excludeId
    );
    if (existingPrimary) {
      return { field: "contact_number_1", mobile: primary };
    }
  }

  const secondary = normalizeMobileNumber(contactNumber2 ?? "");
  if (secondary.length === 10) {
    const existingSecondary = await findCricketerByRegisteredMobile(
      Cricketer,
      secondary,
      excludeId
    );
    if (existingSecondary) {
      return { field: "contact_number_2", mobile: secondary };
    }
  }

  return null;
}

export function normalizeContactFields<
  T extends { contact_number_1?: string; contact_number_2?: string },
>(data: T): T {
  return {
    ...data,
    contact_number_1: data.contact_number_1
      ? normalizeMobileNumber(data.contact_number_1)
      : data.contact_number_1,
    contact_number_2: data.contact_number_2
      ? normalizeMobileNumber(data.contact_number_2)
      : (data.contact_number_2 ?? ""),
  };
}
