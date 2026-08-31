import { execFile } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(workspaceRoot, '.tmp', 'link-catalog-test.json');

await execFileAsync(process.execPath, [
  resolve(workspaceRoot, 'scripts', 'build-link-catalog.mjs'),
  '--output',
  outputPath,
], { cwd: workspaceRoot });

const catalog = JSON.parse(await readFile(outputPath, 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(catalog.schemaVersion === 1, 'Catalog schema version is incorrect.');
assert(Array.isArray(catalog.links) && catalog.links.length > 2000, 'Catalog does not contain the expected application links.');
assert(new Set(catalog.links.map((item) => item.url)).size === catalog.links.length, 'Catalog contains duplicate URLs.');
assert(catalog.links.every((item) => /^https?:\/\//.test(item.url)), 'Catalog contains an unsupported URL scheme.');
assert(catalog.links.every((item) => item.name && item.category && item.source), 'Catalog metadata is incomplete.');
assert(catalog.sourceFiles.includes('seniorSurfGuidancePlaces.ts'), 'Guidance-place links are missing from catalog sources.');
assert(catalog.sourceFiles.includes('municipalityWebsiteLocales.ts'), 'Municipality language versions are missing from catalog sources.');

// Kattavuusvahti: uusi linkkitiedosto ei saa jaada katalogin ulkopuolelle huomaamatta.
// Nain kavi aiemmin communityLinks.ts- ja seniorSurfGuidancePlaces.ts-tiedostoille
// vanhassa update-links.mjs-skriptissa: 422 linkkia oli vuosia tarkistuksen ulkopuolella,
// ja niissa oli 70 % kaikista vioista.
const { readdir } = await import('node:fs/promises');
const urlPattern = /(['"`])(https?:\/\/[^'"`\s<>]+)\1/g;
const sourceFiles = new Set(catalog.sourceFiles);
const rootEntries = await readdir(workspaceRoot, { withFileTypes: true });
const uncovered = [];
for (const entry of rootEntries) {
  if (!entry.isFile()) continue;
  if (!/\.(ts|tsx)$/.test(entry.name)) continue;
  if (sourceFiles.has(entry.name)) continue;
  // Generoidut ja tekniset tiedostot eivat ole linkkilahteita.
  if (['linkHealth.ts', 'linkStats.ts', 'localStats.ts', 'verifiedLinks.ts', 'vite-env.d.ts'].includes(entry.name)) continue;
  const text = await readFile(resolve(workspaceRoot, entry.name), 'utf8');
  const urls = new Set([...text.matchAll(urlPattern)].map((match) => match[2]));
  if (urls.size > 20) uncovered.push(`${entry.name} (${urls.size} osoitetta)`);
}
assert(
  uncovered.length === 0,
  `Naissa tiedostoissa on yli 20 osoitetta, mutta ne eivat ole build-link-catalog.mjs:n lahdelistalla: ${uncovered.join(', ')}`,
);

await rm(outputPath, { force: true });
console.log(`link-catalog-test=PASS links=${catalog.links.length} kattavuusvahti=OK`);
