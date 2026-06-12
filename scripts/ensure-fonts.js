/**
 * Ensures the Gujarati PDF font exists in public/fonts (required on Vercel).
 * Skips download if the file is already present.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const FONT_DIR = path.join(process.cwd(), "public", "fonts");
const FONT_PATH = path.join(FONT_DIR, "NotoSansGujarati-Regular.ttf");
const FONT_URL =
  "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansGujarati/NotoSansGujarati-Regular.ttf";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          download(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Font download failed: HTTP ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  if (fs.existsSync(FONT_PATH) && fs.statSync(FONT_PATH).size > 1000) {
    return;
  }

  fs.mkdirSync(FONT_DIR, { recursive: true });
  await download(FONT_URL, FONT_PATH);

  if (!fs.existsSync(FONT_PATH) || fs.statSync(FONT_PATH).size < 1000) {
    throw new Error("Gujarati font download did not produce a valid file");
  }

  console.log("Downloaded NotoSansGujarati-Regular.ttf for PDF generation");
}

main().catch((error) => {
  console.warn("ensure-fonts:", error.message);
});
