import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const viteBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite");

if (process.platform === "win32") {
  execFileSync("cmd.exe", ["/c", viteBin, "build"], { stdio: "inherit" });
} else {
  execFileSync(viteBin, ["build"], { stdio: "inherit" });
}

const dist = path.join(root, "dist");
const hostingDir = path.join(dist, ".openai");
mkdirSync(hostingDir, { recursive: true });
copyFileSync(path.join(root, ".openai", "hosting.json"), path.join(hostingDir, "hosting.json"));

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function walk(dir, prefix = "") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "server") return [];
    const full = path.join(dir, entry.name);
    const route = `${prefix}/${entry.name}`;
    return entry.isDirectory() ? walk(full, route) : [{ route, full }];
  });
}

const assets = Object.fromEntries(
  walk(dist).map(({ route, full }) => [
    route.replace(/\\/g, "/"),
    {
      type: contentTypes[path.extname(full)] || "application/octet-stream",
      body: readFileSync(full).toString("base64"),
    },
  ]),
);

const serverDir = path.join(dist, "server");
mkdirSync(serverDir, { recursive: true });

const server = `
const assets = ${JSON.stringify(assets)};

function decodeAsset(asset) {
  const binary = atob(asset.body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/sync" && request.method === "POST") {
      return Response.json({
        ok: false,
        message: "This site does not have a Microsoft Graph/OAuth backend configured. Run the sync workflow in Codex, or connect an Outlook API to refresh this endpoint."
      }, { status: 202 });
    }

    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = assets[pathname] || assets["/index.html"];
    return new Response(decodeAsset(asset), {
      headers: {
        "content-type": asset.type,
        "cache-control": pathname.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache"
      }
    });
  }
};
`;

writeFileSync(path.join(serverDir, "index.js"), server.trimStart(), "utf-8");
