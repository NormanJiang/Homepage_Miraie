import { cp, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "writing", "2021-new-year-story");
const destination = resolve(root, "public", "writing", "2021-new-year-story");

await stat(resolve(source, "index.html"));
await stat(resolve(source, "story.json"));
await rm(destination, { recursive: true, force: true });
await cp(source, destination, { recursive: true });

console.log("Synced 2021 New Year story to public/writing/");
