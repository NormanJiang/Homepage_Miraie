import { cp, mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("payroll-hours-dashboard/dist");
const destination = resolve("public/payroll");

try {
  await stat(resolve(source, "index.html"));
} catch {
  throw new Error("Payroll build is missing. Run its build command before syncing the static child page.");
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve(source, "index.html"), resolve(destination, "index.html"));
await cp(resolve(source, "assets"), resolve(destination, "assets"), { recursive: true });
console.log("Synced Payroll dashboard to public/payroll/");
