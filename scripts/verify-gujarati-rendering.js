/**
 * Verify Gujarati test samples normalize correctly (NFC, no corruption).
 * Run: node scripts/verify-gujarati-rendering.js
 */

const TOURNAMENT_WORD_GU =
  "\u0A9F\u0AC1\u0AB0\u0A28\u0ABE\u0AAE\u0AC7\u0A28\u0ACD\u0A9F";

const INVISIBLE_CHARS =
  /[\u200B-\u200D\uFEFF\u2060\u061C\u202A-\u202E\u2066-\u2069]/g;
const CORRUPTED_CHARS = /[\uFFFD\uFFFE\uFFFF]/g;
const TOURNAMENT_HALANT_VARIANTS = [
  /\u0A9F\u0AC1\u0AB0\u0ACD\u0A28\u0ABE\u0AAE\u0AC7\u0A82\u0A9F/g,
  /\u0A9F\u0AC1\u0AB0\u0ACD\u0A28\u0ABE\u0AAE\u0AC7\u0A28\u0ACD\u0A9F/g,
];
const TARGETED_NA_FIXES = [
  [/\u0A9F\u0AC1\u0AB0\u0AA8/g, "\u0A9F\u0AC1\u0AB0\u0A28"],
  [/\u0AA8\u0ABE\u0A82\u0AA7\u0AB5\u0AC1\u0AA8\u0AC0/g, "\u0A28\u0ABE\u0A82\u0AA7\u0AB5\u0AC1\u0A28\u0AC0"],
  [/\u0AA8\u0ACB\u0A82\u0AA7\u0AB5\u0AC1\u0AA8\u0AC0/g, "\u0A28\u0ACB\u0A82\u0AA7\u0AB5\u0AC1\u0A28\u0AC0"],
  [/\u0AA7\u0ACB\u0AA8\u0ABE\u0AA8\u0AB8\u0AB0/g, "\u0AA7\u0ACB\u0A28\u0ABE\u0A28\u0AB8\u0AB0"],
];

function normalizeGujaratiText(text) {
  let result = text;
  for (const pattern of TOURNAMENT_HALANT_VARIANTS) {
    result = result.replace(pattern, TOURNAMENT_WORD_GU);
  }
  for (const [pattern, replacement] of TARGETED_NA_FIXES) {
    result = result.replace(pattern, replacement);
  }
  return result
    .replace(INVISIBLE_CHARS, "")
    .replace(CORRUPTED_CHARS, "")
    .normalize("NFC")
    .trim();
}

const SAMPLES = [
  "ગુજરાતી ક્રિકેટ નોંધણી",
  "ધોરણસર નોંધણી ફોર્મ",
  "હું ક્રિકેટ રમવા ઇચ્છું છું",
  "બેટિંગ",
  "બોલિંગ",
  "ઓલ રાઉન્ડર",
  "વિકેટ કીપર",
  "મને ક્રિકેટ રમતા શીખવું છે",
];

let passed = 0;

console.log("Gujarati rendering verification\n");

for (const sample of SAMPLES) {
  const normalized = normalizeGujaratiText(sample);
  const nfc = sample.normalize("NFC");
  const ok = normalized === nfc && normalized.length > 0;
  if (ok) {
    passed++;
    console.log(`✓ ${sample}`);
  } else {
    console.log(`✗ ${sample}`);
    console.log(`  expected: ${nfc}`);
    console.log(`  got:      ${normalized}`);
    process.exit(1);
  }
}

console.log(`\n${passed}/${SAMPLES.length} passed`);

console.log("\nCorruption fix check:");
const corrupted = "\u0A9F\u0AC1\u0AB0\u0AA8\u0ABE\u0AAE\u0AC7\u0A28\u0ACD\u0A9F";
const fixed = normalizeGujaratiText(corrupted);
console.log(`  fixed:  ${fixed}`);
console.log(`  ok:     ${fixed === TOURNAMENT_WORD_GU}`);

if (fixed !== TOURNAMENT_WORD_GU) process.exit(1);

process.exit(0);
