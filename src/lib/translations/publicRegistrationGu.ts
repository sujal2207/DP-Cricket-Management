import type { CricketCategory } from "@/lib/constants";
import {
  ORGANIZATION_NAME_GU,
  TOURNAMENT_TITLE_GU,
  TOURNAMENT_SHORT_GU,
  TOURNAMENT_YEAR,
  TOURNAMENT_WORD_GU,
} from "@/lib/org-branding";

export {
  ORGANIZATION_NAME_GU,
  TOURNAMENT_TITLE_GU,
  TOURNAMENT_SHORT_GU,
  TOURNAMENT_YEAR,
  TOURNAMENT_WORD_GU,
} from "@/lib/org-branding";

export const gu = {
  meta: {
    title: `${TOURNAMENT_SHORT_GU} — ક્રિકેટર નોંધણી`,
    description: `${TOURNAMENT_TITLE_GU} માટે ક્રિકેટર નોંધણી ફોર્મ`,
  },
  header: {
    brand: ORGANIZATION_NAME_GU,
    subtitle: "ક્રિકેટર નોંધણી ફોર્મ",
  },
  hero: {
    badge: `${TOURNAMENT_YEAR} · ${ORGANIZATION_NAME_GU}`,
    title: TOURNAMENT_TITLE_GU,
    description:
      "કૃપા કરીને નીચેની માહિતી સંપૂર્ણ અને યથાસ્થાને ભરો. તમારી નોંધણી સફળતાપૂર્વક સબમિટ થયા પછી તમને પુષ્ટિ મળશે.",
  },
  footer: {
    note: `તા. 22 અને 23 ના રોજ રમાશે તે ${TOURNAMENT_SHORT_GU} માટે ઉપલબ્ધ રહે તેવા ખેલાડીઓ જ આ ફોર્મ ભરે.`,
    feeNotice: `આ નોંધણી ફોર્મ ભરનાર દરેક ખેલાડીએ ફરજિયાત ₹500 ${TOURNAMENT_WORD_GU} ફી ભરવાની રહેશે.`,
    copyright: (year: number) =>
      `© ${year} ${ORGANIZATION_NAME_GU}. સર્વાધિકાર સુરક્ષિત.`,
  },
  form: {
    personalInfo: "વ્યક્તિગત માહિતી",
    firstName: "નામ",
    middleName: "પિતાનું/પતિનું નામ",
    lastName: "અટક",
    fullAddress: "સંપૂર્ણ સરનામું",
    contactInfo: "સંપર્ક માહિતી",
    contact1: "મોબાઇલ નંબર 1",
    contact2: "મોબાઇલ નંબર 2",
    contact1Placeholder: "10 અંકનો મોબાઇલ નંબર",
    contact2Placeholder: "વૈકલ્પિક",
    categoryTitle: "ક્રિકેટ કેટેગરી પસંદગી",
    categoryLabel: "તમારી ક્રિકેટ કેટેગરી પસંદ કરો",
    categoryDescription: (max: number) => `ઓછામાં ઓછી 1 અને વધુમાં વધુ ${max} વિકલ્પ પસંદ કરો`,
    categorySelected: (count: number, max: number) => `પસંદ કરેલ: ${count}/${max}`,
    capacityTitle: "ક્રિકેટ રુચિ ક્ષમતા",
    captaincy: "કેપ્ટનસીમાં રસ છે",
    submit: "નોંધણી સબમિટ કરો",
    loading: "ફોર્મ તૈયાર થઈ રહ્યું છે...",
    maxCategoryError: (max: number) =>
      `તમે વધુમાં વધુ ${max} કેટેગરી જ પસંદ કરી શકો છો`,
  },
  success: {
    title: "નોંધણી સફળતાપૂર્વક સબમિટ થઈ",
    message: `${ORGANIZATION_NAME_GU} સાથે નોંધણી કરવા બદલ આભાર.`,
    registrationId: "નોંધણી ID",
    name: "નામ",
    mobile: "મોબાઇલ નંબર",
    categories: "પસંદ કરેલી કેટેગરી",
    captaincy: "કેપ્ટનસીમાં રસ",
    yes: "હા",
    no: "ના",
    submitAnother: "બીજી નોંધણી કરો",
    downloadSlip: "નોંધણી સ્લિપ ડાઉનલોડ કરો",
  },
  errors: {
    submissionFailed: "સબમિશન નિષ્ફળ ગયું",
    unexpected: "અનપેક્ષિત ભૂલ થઈ. કૃપા કરીને ફરી પ્રયાસ કરો.",
    invalidCsrf: "અમાન્ય CSRF ટોકન. પૃષ્ઠ રિફ્રેશ કરી ફરી પ્રયાસ કરો.",
    rateLimit: "ઘણા બધા પ્રયાસો. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.",
    validationFailed: "માહિતી યોગ્ય નથી. કૃપા કરીને ફોર્મ તપાસો.",
    duplicateMobile: "આ મોબાઇલ નંબર સાથે પહેલેથી નોંધણી થયેલ છે",
    submitFailed: "નોંધણી સબમિટ કરવામાં નિષ્ફળ. ફરી પ્રયાસ કરો.",
    firstNameMin: "નામ ઓછામાં ઓછા 2 અક્ષરનું હોવું જોઈએ",
    nameInvalid: "માત્ર અક્ષરો અને જગ્યા માન્ય છે",
    middleNameMin: "પિતાનું/પતિનું નામ ઓછામાં ઓછા 2 અક્ષરનું હોવું જોઈએ",
    lastNameMin: "અટક ઓછામાં ઓછી 2 અક્ષરની હોવી જોઈએ",
    addressMin: "સરનામું ઓછામાં ઓછા 10 અક્ષરનું હોવું જોઈએ",
    mobileInvalid: "માન્ય 10 અંકનો ભારતીય મોબાઇલ નંબર દાખલ કરો (6-9 થી શરૂ)",
    mobileRequired: "મોબાઇલ નંબર 1 ફરજિયાત છે",
    mobileNumericOnly: "મોબાઇલ નંબરમાં માત્ર અંક (0-9) જ દાખલ કરો",
    firstNameRequired: "નામ ફરજિયાત છે",
    middleNameRequired: "પિતાનું/પતિનું નામ ફરજિયાત છે",
    lastNameRequired: "અટક ફરજિયાત છે",
    addressRequired: "સંપૂર્ણ સરનામું ફરજિયાત છે",
    categoryMin: "ઓછામાં ઓછી એક ક્રિકેટ કેટેગરી પસંદ કરો",
    categoryMax: (max: number) => `તમે વધુમાં વધુ ${max} કેટેગરી જ પસંદ કરી શકો છો`,
    contactDifferent: "બંને મોબાઇલ નંબર અલગ હોવા જોઈએ",
  },
  categories: {
    Batting: "બેટિંગ",
    Bowling: "બોલિંગ",
    "All Rounder": "ઓલ રાઉન્ડર",
    "Wicket Keeper": "વિકેટ કીપર",
    "Don't Know Cricket But Want To Play":
      "ક્રિકેટ આવડતું નથી પણ રમવા માંગુ છું",
  } satisfies Record<CricketCategory, string>,
  pdf: {
    title: ORGANIZATION_NAME_GU,
    slip: "નોંધણી સ્લિપ",
    thankYou: `${ORGANIZATION_NAME_GU} સાથે નોંધણી કરવા બદલ આભાર.`,
    registrationId: "નોંધણી ID",
    fullName: "પૂરું નામ",
    mobile: "મોબાઇલ નંબર",
    categories: "ક્રિકેટ કેટેગરી",
    captaincy: "કેપ્ટનસીમાં રસ",
    date: "નોંધણી તારીખ",
  },
} as const;

export function getCategoryLabel(category: string): string {
  return gu.categories[category as CricketCategory] ?? category;
}
