/**
 * Generate favicon and PWA icon sizes from the DP Cricket Tournament logo.
 * Run: node scripts/generate-favicons.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "public", "images", "dp-cricket-tournament-logo.png");
const ICONS_DIR = path.join(ROOT, "public", "icons");
const APP_DIR = path.join(ROOT, "src", "app");

const SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-48x48.png", size: 48 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
];

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Source logo not found:", SOURCE);
    process.exit(1);
  }

  fs.mkdirSync(ICONS_DIR, { recursive: true });

  for (const { name, size } of SIZES) {
    const out = path.join(ICONS_DIR, name);
    await sharp(SOURCE)
      .resize(size, size, { fit: "cover", position: "centre" })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(out);
    console.log(`✓ ${name}`);
  }

  await sharp(SOURCE)
    .resize(32, 32, { fit: "cover", position: "centre" })
    .png()
    .toFile(path.join(APP_DIR, "icon.png"));

  await sharp(SOURCE)
    .resize(180, 180, { fit: "cover", position: "centre" })
    .png()
    .toFile(path.join(APP_DIR, "apple-icon.png"));

  fs.copyFileSync(
    path.join(ICONS_DIR, "favicon-32x32.png"),
    path.join(ROOT, "public", "favicon.ico")
  );

  console.log("\nFavicons generated in public/icons/, src/app/, and public/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
