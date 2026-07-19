import { cp, mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("codex-token-usage-dashboard");
const destination = resolve("public/codex-token-usage");

try {
  await stat(resolve(source, "index.html"));
} catch {
  throw new Error("Codex Token Usage page is missing. Check codex-token-usage-dashboard/index.html.");
}

await rm(destination, { recursive: true, force: true });
await mkdir(resolve(destination, "assets"), { recursive: true });
await cp(resolve(source, "index.html"), resolve(destination, "index.html"));
await cp(resolve(source, "styles.css"), resolve(destination, "styles.css"));
await cp(resolve(source, "assets"), resolve(destination, "assets"), { recursive: true });
console.log("Synced Codex Token Usage dashboard to public/codex-token-usage/");
