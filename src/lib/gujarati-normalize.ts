/**
 * Gujarati / Unicode text normalization for storage and display.
 * Applies NFC, removes invisible characters, and fixes common corruptions.
 */

/** Canonical ટુર્નામેન્ટ (ર+ન, no halant) */
const TOURNAMENT_WORD_GU =
  "\u0A9F\u0AC1\u0AB0\u0A28\u0ABE\u0AAE\u0AC7\u0A28\u0ACD\u0A9F";

/** Zero-width and bidi control characters that break Gujarati shaping */
const INVISIBLE_CHARS =
  /[\u200B-\u200D\uFEFF\u2060\u061C\u202A-\u202E\u2066-\u2069]/g;

/** Replacement character and other invalid glyphs */
const CORRUPTED_CHARS = /[\uFFFD\uFFFE\uFFFF]/g;

/** Halant-based tournament spelling variants → canonical ટુર્નામેન્ટ */
const TOURNAMENT_HALANT_VARIANTS = [
  /\u0A9F\u0AC1\u0AB0\u0ACD\u0A28\u0ABE\u0AAE\u0AC7\u0A82\u0A9F/g,
  /\u0A9F\u0AC1\u0AB0\u0ACD\u0A28\u0ABE\u0AAE\u0AC7\u0A28\u0ACD\u0A9F/g,
];

/** U+0AA8 (ઈ) mis-typed where U+0A28 (ન) is intended — context-specific only */
const TARGETED_NA_FIXES: [RegExp, string][] = [
  [/\u0A9F\u0AC1\u0AB0\u0AA8/g, "\u0A9F\u0AC1\u0AB0\u0A28"],
  [/\u0AA8\u0ABE\u0A82\u0AA7\u0AB5\u0AC1\u0AA8\u0AC0/g, "\u0A28\u0ABE\u0A82\u0AA7\u0AB5\u0AC1\u0A28\u0AC0"],
  [/\u0AA8\u0ACB\u0A82\u0AA7\u0AB5\u0AC1\u0AA8\u0AC0/g, "\u0A28\u0ACB\u0A82\u0AA7\u0AB5\u0AC1\u0A28\u0AC0"],
  [/\u0AA7\u0ACB\u0AA8\u0ABE\u0AA8\u0AB8\u0AB0/g, "\u0AA7\u0ACB\u0A28\u0ABE\u0A28\u0AB8\u0AB0"],
];

function applyGujaratiCorruptionFixes(text: string): string {
  let result = text;
  for (const pattern of TOURNAMENT_HALANT_VARIANTS) {
    result = result.replace(pattern, TOURNAMENT_WORD_GU);
  }
  for (const [pattern, replacement] of TARGETED_NA_FIXES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Normalize user-entered text (names, address, notes) before save.
 * Preserves Gujarati content; strips HTML/injection chars separately via sanitize.
 */
export function normalizeTextInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return applyGujaratiCorruptionFixes(input)
    .replace(INVISIBLE_CHARS, "")
    .replace(CORRUPTED_CHARS, "")
    .normalize("NFC")
    .replace(/\s+/g, (match) => (match.includes("\n") ? match : " "))
    .trim();
}

/**
 * Normalize branding / static Gujarati copy (includes tournament word fixes).
 */
export function normalizeGujaratiText(text: string): string {
  return normalizeTextInput(text);
}

/** @deprecated Use normalizeGujaratiText — kept for existing imports */
export function sanitizeGujaratiText(text: string): string {
  return normalizeGujaratiText(text);
}

/** Test strings for rendering verification */
export const GUJARATI_TEST_SAMPLES = [
  "ગુજરાતી ક્રિકેટ નોંધણી",
  "ધોરણસર નોંધણી ફોર્મ",
  "હું ક્રિકેટ રમવા ઇચ્છું છું",
  "બેટિંગ",
  "બોલિંગ",
  "ઓલ રાઉન્ડર",
  "વિકેટ કીપર",
  "મને ક્રિકેટ રમતા શીખવું છે",
] as const;

export function verifyGujaratiSamples(): { sample: string; valid: boolean }[] {
  return GUJARATI_TEST_SAMPLES.map((sample) => {
    const normalized = normalizeGujaratiText(sample);
    return {
      sample,
      valid: normalized === sample.normalize("NFC") && normalized.length > 0,
    };
  });
}
