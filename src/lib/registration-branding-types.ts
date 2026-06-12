import type { RegistrationBrandingInput } from "@/lib/registration-branding-validation";

export interface RegistrationBrandingData {
  organizationNameGu: string;
  tournamentYear: string;
  tournamentTitleGu: string;
  tournamentShortGu: string;
  formSubtitleGu: string;
  heroDescriptionGu: string;
  availabilityNoticeGu: string;
  feeNoticeGu: string;
  /** YYYY-MM-DD (IST) — null = no deadline */
  registrationClosesOn: string | null;
  isRegistrationOpen: boolean;
  updatedAt?: string;
}

export function buildBrandingFormDefaults(
  data: RegistrationBrandingData
): RegistrationBrandingInput {
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
