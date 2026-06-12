const { loadEnvConfig } = require("@next/env");
const { spawnSync } = require("child_process");
const path = require("path");

loadEnvConfig(process.cwd());

const command = process.argv[2] || "dev";
const port = process.env.PORT?.trim() || "3000";
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const args = command === "start" ? ["start", "-p", port] : ["dev", "-p", port];
const result = spawnSync(process.execPath, [nextBin, ...args], {
  stdio: "inherit",
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);
