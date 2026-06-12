import {
  DEFAULT_ORGANIZATION_NAME_GU,
  TOURNAMENT_WORD_GU,
  CRICKET_TOURNAMENT_GU,
  buildTournamentShortGu,
  buildTournamentTitleGu,
  sanitizeGujaratiText,
} from "@/lib/gujarati-text";

export {
  TOURNAMENT_WORD_GU,
  CRICKET_TOURNAMENT_GU,
  DEFAULT_ORGANIZATION_NAME_GU,
} from "@/lib/gujarati-text";

/** Village / organization name — set in .env as NEXT_PUBLIC_ORGANIZATION_NAME_GU */
export const ORGANIZATION_NAME_GU = sanitizeGujaratiText(
  process.env.NEXT_PUBLIC_ORGANIZATION_NAME_GU?.trim() ||
    DEFAULT_ORGANIZATION_NAME_GU
);

/** Tournament year */
export const TOURNAMENT_YEAR =
  process.env.NEXT_PUBLIC_TOURNAMENT_YEAR?.trim() || "2026";

export const TOURNAMENT_SHORT_GU = buildTournamentShortGu(
  ORGANIZATION_NAME_GU,
  TOURNAMENT_YEAR
);

/** Full hero title — set in .env as NEXT_PUBLIC_TOURNAMENT_TITLE_GU */
export const TOURNAMENT_TITLE_GU = sanitizeGujaratiText(
  process.env.NEXT_PUBLIC_TOURNAMENT_TITLE_GU?.trim() ||
    buildTournamentTitleGu(ORGANIZATION_NAME_GU, TOURNAMENT_YEAR)
);

export { sanitizeGujaratiText };
