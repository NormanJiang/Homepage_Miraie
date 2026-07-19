import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;

function run(label, args, options = {}) {
  console.log(`\n[${label}]`);
  execFileSync(node, args, { cwd: root, stdio: "inherit", ...options });
}

// Generate the deployed child page from the Payroll source before every homepage build.
run("Language check", ["scripts/check-site-language.mjs"]);
run("Payroll", ["scripts/build.mjs"], { cwd: resolve(root, "payroll-hours-dashboard") });
run("Sync Payroll", ["scripts/sync-payroll.mjs"]);
run("Sync Codex Token Usage", ["scripts/sync-token-usage.mjs"]);
run("Sync Gallery", ["scripts/sync-gallery.mjs"]);
run("Sync Writing", ["scripts/sync-writing.mjs"]);
run("Homepage", ["node_modules/vite/bin/vite.js", "build"]);
