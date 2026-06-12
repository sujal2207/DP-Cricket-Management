/**
 * Canonical Gujarati tournament strings — verified Unicode.
 * ટુર્નામેન્ટ: uses separate ર+ન (no halant) for reliable font rendering.
 */

/** ટુર્નામેન્ટ */
export const TOURNAMENT_WORD_GU =
  "\u0A9F\u0AC1\u0AB0\u0A28\u0ABE\u0AAE\u0AC7\u0A28\u0ACD\u0A9F";

export const CRICKET_TOURNAMENT_GU =
  "\u0A95\u0ACD\u0AB0\u0ABF\u0A95\u0AC7\u0A9F \u0A9F\u0AC1\u0AB0\u0A28\u0ABE\u0AAE\u0AC7\u0A28\u0ACD\u0A9F";

export const DEFAULT_ORGANIZATION_NAME_GU =
  "\u0AA2\u0A81\u0A82\u0AA2\u0AC0\u0AAF\u0ABE \u0AAA\u0AC0\u0AAA\u0AB3\u0AC0\u0AAF\u0ABE";

export const DVARA_GU = "\u0AA6\u0ACD\u0AB5\u0ABE\u0AB0\u0ABE";
export const AYOJIT_GU = "\u0A86\u0AAF\u0ACB\u0A9C\u0ABF\u0AA4";

export {
  normalizeGujaratiText,
  normalizeTextInput,
  sanitizeGujaratiText,
} from "./gujarati-normalize";

import { normalizeGujaratiText } from "./gujarati-normalize";

export function buildTournamentShortGu(orgName: string, year: string): string {
  return `${normalizeGujaratiText(orgName)} ${CRICKET_TOURNAMENT_GU} ${year}`;
}

/** ઢuંઢીયા પીપળીયા દ્વારા આયોજિત ... */
export function buildTournamentTitleGu(orgName: string, year: string): string {
  const org = normalizeGujaratiText(orgName);
  return `${org} ${DVARA_GU} ${AYOJIT_GU} ${org} ${CRICKET_TOURNAMENT_GU} ${year}`;
}

export function buildAvailabilityNoticeGu(tournamentShortGu: string): string {
  const short = normalizeGujaratiText(tournamentShortGu);
  const prefix = "તા. 22 અને 23 ના રોજ રમાશે તે ";
  const suffix = " માટે ઉપલબ્ધ રહે તેવા ખેલાડીઓ જ આ ફોર્મ ભરે.";
  return normalizeGujaratiText(`${prefix}${short}${suffix}`);
}

export function buildFeeNoticeGu(tournamentWord = TOURNAMENT_WORD_GU): string {
  const word = normalizeGujaratiText(tournamentWord);
  return normalizeGujaratiText(
    `આ નોંધણી ફોર્મ ભરનાર દરેક ખેલાડીએ ફરજિયાત ₹500 ${word} ફી ભરવાની રહેશે.`
  );
}
