import { connectDB } from "@/lib/db";
import RegistrationBranding from "@/models/RegistrationBranding";
import {
  buildAvailabilityNoticeGu,
  buildFeeNoticeGu,
  buildTournamentShortGu,
  buildTournamentTitleGu,
  sanitizeGujaratiText,
  DEFAULT_ORGANIZATION_NAME_GU,
} from "@/lib/gujarati-text";
import {
  isPublicRegistrationOpen,
  normalizeCloseDate,
} from "@/lib/registration-window";
import type { RegistrationBrandingInput } from "@/lib/registration-branding-validation";
import type { RegistrationBrandingData } from "@/lib/registration-branding-types";
import { unstable_noStore } from "next/cache";

export type { RegistrationBrandingData } from "@/lib/registration-branding-types";
export { buildBrandingFormDefaults } from "@/lib/registration-branding-types";

const BRANDING_KEY = "default";

const DEFAULT_HERO_DESCRIPTION_GU =
  "કૃપા કરીને નીચેની માહિતી સંપૂર્ણ અને યથાસ્થાને ભરો. તમારી નોંધણી સફળતાપૂર્વક સબમિટ થયા પછી તમને પુષ્ટિ મળશે.";

function buildFormSubtitleGu(tournamentShortGu: string): string {
  return `${sanitizeGujaratiText(tournamentShortGu)} — ક્રિકેટર નોંધણી ફોર્મ`;
}

function envOrgName(): string {
  return sanitizeGujaratiText(
    process.env.NEXT_PUBLIC_ORGANIZATION_NAME_GU?.trim() ||
      DEFAULT_ORGANIZATION_NAME_GU
  );
}

function envYear(): string {
  return process.env.NEXT_PUBLIC_TOURNAMENT_YEAR?.trim() || "2026";
}

function sanitizeBranding(
  data: Omit<
    RegistrationBrandingData,
    "isRegistrationOpen" | "registrationClosesOn"
  > & {
    registrationClosesOn?: string | null;
    isRegistrationOpen?: boolean;
  }
): RegistrationBrandingData {
  const tournamentShortGu = sanitizeGujaratiText(data.tournamentShortGu);
  const registrationClosesOn = normalizeCloseDate(data.registrationClosesOn);
  return {
    organizationNameGu: sanitizeGujaratiText(data.organizationNameGu),
    tournamentYear: data.tournamentYear.trim(),
    tournamentTitleGu: sanitizeGujaratiText(data.tournamentTitleGu),
    tournamentShortGu,
    formSubtitleGu: sanitizeGujaratiText(
      data.formSubtitleGu || buildFormSubtitleGu(tournamentShortGu)
    ),
    heroDescriptionGu: sanitizeGujaratiText(
      data.heroDescriptionGu || DEFAULT_HERO_DESCRIPTION_GU
    ),
    availabilityNoticeGu: sanitizeGujaratiText(data.availabilityNoticeGu),
    feeNoticeGu: sanitizeGujaratiText(data.feeNoticeGu),
    registrationClosesOn,
    isRegistrationOpen:
      data.isRegistrationOpen ?? isPublicRegistrationOpen(registrationClosesOn),
    updatedAt: data.updatedAt,
  };
}

/** Defaults used only when DB document is first created */
export function getDefaultRegistrationBranding(): RegistrationBrandingData {
  const organizationNameGu = envOrgName();
  const tournamentYear = envYear();
  const tournamentShortGu =
    sanitizeGujaratiText(
      process.env.NEXT_PUBLIC_TOURNAMENT_SHORT_GU?.trim() || ""
    ) || buildTournamentShortGu(organizationNameGu, tournamentYear);
  const tournamentTitleGu =
    sanitizeGujaratiText(
      process.env.NEXT_PUBLIC_TOURNAMENT_TITLE_GU?.trim() || ""
    ) || buildTournamentTitleGu(organizationNameGu, tournamentYear);

  return sanitizeBranding({
    organizationNameGu,
    tournamentYear,
    tournamentTitleGu,
    tournamentShortGu,
    formSubtitleGu: buildFormSubtitleGu(tournamentShortGu),
    heroDescriptionGu: DEFAULT_HERO_DESCRIPTION_GU,
    availabilityNoticeGu: buildAvailabilityNoticeGu(tournamentShortGu),
    feeNoticeGu: buildFeeNoticeGu(),
    registrationClosesOn: null,
  });
}

function docToData(doc: {
  organization_name_gu: string;
  tournament_year: string;
  tournament_title_gu: string;
  tournament_short_gu: string;
  form_subtitle_gu?: string;
  hero_description_gu?: string;
  availability_notice_gu: string;
  fee_notice_gu: string;
  registration_closes_on?: string | null;
  updated_at?: Date;
}): RegistrationBrandingData {
  const registrationClosesOn = normalizeCloseDate(doc.registration_closes_on);
  return sanitizeBranding({
    organizationNameGu: doc.organization_name_gu,
    tournamentYear: doc.tournament_year,
    tournamentTitleGu: doc.tournament_title_gu,
    tournamentShortGu: doc.tournament_short_gu,
    formSubtitleGu:
      doc.form_subtitle_gu ?? buildFormSubtitleGu(doc.tournament_short_gu),
    heroDescriptionGu: doc.hero_description_gu ?? DEFAULT_HERO_DESCRIPTION_GU,
    availabilityNoticeGu: doc.availability_notice_gu,
    feeNoticeGu: doc.fee_notice_gu,
    registrationClosesOn,
    updatedAt: doc.updated_at?.toISOString(),
  });
}

function inputToDoc(input: RegistrationBrandingInput) {
  const data = sanitizeBranding({
    organizationNameGu: input.organization_name_gu,
    tournamentYear: input.tournament_year,
    tournamentTitleGu: input.tournament_title_gu,
    tournamentShortGu: input.tournament_short_gu,
    formSubtitleGu: input.form_subtitle_gu,
    heroDescriptionGu: input.hero_description_gu,
    availabilityNoticeGu: input.availability_notice_gu,
    feeNoticeGu: input.fee_notice_gu,
  });

  return {
    organization_name_gu: data.organizationNameGu,
    tournament_year: data.tournamentYear,
    tournament_title_gu: data.tournamentTitleGu,
    tournament_short_gu: data.tournamentShortGu,
    form_subtitle_gu: data.formSubtitleGu,
    hero_description_gu: data.heroDescriptionGu,
    availability_notice_gu: data.availabilityNoticeGu,
    fee_notice_gu: data.feeNoticeGu,
  };
}

export async function getRegistrationBranding(): Promise<RegistrationBrandingData> {
  unstable_noStore();
  const defaults = getDefaultRegistrationBranding();

  try {
    await connectDB();
    let doc = await RegistrationBranding.findOne({ key: BRANDING_KEY });

    if (!doc) {
      doc = await RegistrationBranding.create({
        key: BRANDING_KEY,
        ...inputToDoc({
          organization_name_gu: defaults.organizationNameGu,
          tournament_year: defaults.tournamentYear,
          tournament_title_gu: defaults.tournamentTitleGu,
          tournament_short_gu: defaults.tournamentShortGu,
          form_subtitle_gu: defaults.formSubtitleGu,
          hero_description_gu: defaults.heroDescriptionGu,
          availability_notice_gu: defaults.availabilityNoticeGu,
          fee_notice_gu: defaults.feeNoticeGu,
        }),
      });
    }

    return docToData(doc);
  } catch (error) {
    console.error("getRegistrationBranding fallback:", error);
    return defaults;
  }
}

export async function updateRegistrationBranding(
  input: RegistrationBrandingInput,
  updatedBy: string
): Promise<RegistrationBrandingData> {
  await connectDB();

  const payload = inputToDoc(input);

  const doc = await RegistrationBranding.findOneAndUpdate(
    { key: BRANDING_KEY },
    { ...payload, updated_by: updatedBy },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return docToData(doc);
}

export async function updateRegistrationExpiry(
  closesOn: string | null,
  updatedBy: string
): Promise<RegistrationBrandingData> {
  await connectDB();

  const normalized = normalizeCloseDate(closesOn);

  const doc = await RegistrationBranding.findOneAndUpdate(
    { key: BRANDING_KEY },
    {
      registration_closes_on: normalized,
      updated_by: updatedBy,
    },
    { new: true }
  );

  if (!doc) {
    await getRegistrationBranding();
    const updated = await RegistrationBranding.findOneAndUpdate(
      { key: BRANDING_KEY },
      {
        registration_closes_on: normalized,
        updated_by: updatedBy,
      },
      { new: true }
    );
    if (!updated) {
      throw new Error("Failed to update registration deadline");
    }
    return docToData(updated);
  }

  return docToData(doc);
}
