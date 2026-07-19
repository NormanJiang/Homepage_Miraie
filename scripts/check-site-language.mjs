import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";

const root = resolve(".");
const targets = [
  "index.html",
  "src",
  "payroll-hours-dashboard/index.html",
  "payroll-hours-dashboard/src",
  "payroll-hours-dashboard/api",
  "codex-token-usage-dashboard/index.html",
  "codex-token-usage-dashboard/assets",
];
const chinese = /[\u4E00-\u9FFF]/;
const textExtensions = new Set([".html", ".js", ".css", ".svg"]);

async function filesAt(path) {
  const fullPath = resolve(root, path);
  const entries = await readdir(fullPath, { withFileTypes: true });
  return Promise.all(entries.flatMap((entry) => {
    const child = resolve(fullPath, entry.name);
    if (entry.isDirectory()) return filesAt(relative(root, child));
    return textExtensions.has(entry.name.slice(entry.name.lastIndexOf("."))) ? [child] : [];
  }));
}

const files = (await Promise.all(targets.map(async (target) => {
  const fullPath = resolve(root, target);
  try {
    const info = await stat(fullPath);
    if (info.isDirectory()) return (await filesAt(target)).map((path) => ({ fullPath: path }));
    return textExtensions.has(target.slice(target.lastIndexOf(".")))
      ? [{ fullPath, content: await readFile(fullPath, "utf8") }]
      : [];
  } catch {
    return [];
  }
}))).flat();

const violations = [];
for (const file of files) {
  const content = file.content ?? await readFile(file.fullPath, "utf8");
  content.split(/\r?\n/).forEach((line, index) => {
    if (chinese.test(line)) violations.push(`${relative(root, file.fullPath)}:${index + 1}`);
  });
}

if (violations.length) {
  throw new Error(`Website copy must be English. Chinese text found in:\n${violations.join("\n")}`);
}

console.log("Language check passed: published page sources are English-only.");
