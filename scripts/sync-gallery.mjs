import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "gallery");
const destination = resolve(root, "public", "gallery");
const photosRoot = resolve(root, "Photos");
const generatedAssets = resolve(source, "assets");
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

const folders = (await readdir(photosRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => Number(left) - Number(right));

if (!folders.length) {
  throw new Error("Add at least one numbered folder under Photos, for example Photos/1.");
}

const primaryId = folders[0];

async function copyCollection(id, assetsDirectory) {
  const folder = resolve(photosRoot, id);
  const files = (await readdir(folder, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "en"));

  if (!files.length) {
    throw new Error(`Photos/${id} does not contain a supported image file.`);
  }

  await mkdir(assetsDirectory, { recursive: true });
  const photos = [];
  for (const [index, file] of files.entries()) {
    const extension = extname(file).toLowerCase();
    const target = `photo-${String(index + 1).padStart(2, "0")}${extension}`;
    await cp(resolve(folder, file), resolve(assetsDirectory, target));
    photos.push({ src: `./assets/${target}`, alt: `Snapshot ${String(index + 1).padStart(2, "0")}`, caption: `Frame ${String(index + 1).padStart(2, "0")}` });
  }
  return photos;
}

function dataModule(id, photos) {
  return `export const collection = ${JSON.stringify({ id, title: `Snapshots, ${id}`, count: photos.length })};\nexport const photos = ${JSON.stringify(photos, null, 2)};\n`;
}

const collections = folders.map((id) => ({ id, title: `Collection ${id}` }));
const indexModule = `export const collectionIndex = ${JSON.stringify({ primaryId, collections }, null, 2)};\n`;

await stat(resolve(source, "index.html"));
await rm(generatedAssets, { recursive: true, force: true });
const primaryPhotos = await copyCollection(primaryId, generatedAssets);
await writeFile(resolve(source, "gallery-data.js"), dataModule(primaryId, primaryPhotos));
await writeFile(resolve(source, "collection-index.js"), indexModule);
await rm(destination, { recursive: true, force: true });
await cp(source, destination, { recursive: true });

for (const id of folders.filter((folder) => folder !== primaryId)) {
  const collectionDestination = resolve(destination, id);
  await cp(source, collectionDestination, { recursive: true });
  await rm(resolve(collectionDestination, "assets"), { recursive: true, force: true });
  const photos = await copyCollection(id, resolve(collectionDestination, "assets"));
  await writeFile(resolve(collectionDestination, "gallery-data.js"), dataModule(id, photos));
  await writeFile(resolve(collectionDestination, "collection-index.js"), indexModule);
}

console.log(`Synced ${folders.length} gallery collection(s) to public/gallery/`);
