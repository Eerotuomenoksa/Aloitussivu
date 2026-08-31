import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutput = resolve(workspaceRoot, '.tmp', 'link-catalog.json');
const outputArgument = process.argv.indexOf('--output');
const outputPath = outputArgument >= 0 && process.argv[outputArgument + 1]
  ? resolve(process.cwd(), process.argv[outputArgument + 1])
  : defaultOutput;

const sources = [
  ['constants.tsx', 'Valtakunnalliset palvelut'],
  ['communityLinks.ts', 'Yhdistykset ja yhteisöt'],
  ['localExerciseLinks.ts', 'Liikunta'],
  ['localKelaTaxiNumbers.ts', 'Kela-taksit'],
  ['localNewspaperFeeds.ts', 'Paikallisuutiset'],
  ['localNewspaperLinks.ts', 'Paikallislehdet'],
  ['localSeniorLinks.ts', 'Senioripalvelut'],
  ['localServices.ts', 'Paikalliset palvelut'],
  ['localServiceTransportLinks.ts', 'Liikenne'],
  ['localSportsClubs.ts', 'Urheiluseurat'],
  ['municipalityNewsFeeds.ts', 'Kuntauutiset'],
  ['municipalityWebsiteLocales.ts', 'Kuntien kieliversiot'],
  ['municipalityWebsites.ts', 'Kuntien verkkosivut'],
  ['seniorSurfGuidancePlaces.ts', 'Digiopastus'],
  ['App.tsx', 'Sivuston kiinteät linkit'],
  ['components/Clock.tsx', 'Sivuston kiinteät linkit'],
  ['components/HomepageModal.tsx', 'Sivuston kiinteät linkit'],
  ['components/NearbyGuidancePlaces.tsx', 'Digiopastus'],
  ['components/ScamAlertsBanner.tsx', 'Huijausvaroitukset'],
  ['components/WeatherCard.tsx', 'Sääpalvelu'],
  ['saavutettavuus.tsx', 'Lakisääteiset tiedot'],
];

const urlPattern = /(['"])(https?:\/\/[^'"\s<>`]+)\1/g;
const nameBeforeUrlPattern = /(?:name|label|title)\s*:\s*(['"])([^'"\r\n]{1,160})\1[^{}\[\]]{0,240}$/s;
const internalDependencyHosts = new Set([
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'nominatim.openstreetmap.org',
]);
const trimUrlPunctuation = (value) => value.replace(/[),.;]+$/u, '');

const normalizeUrl = (value) => {
  const url = new URL(trimUrlPunctuation(value));
  url.hash = '';
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
    url.port = '';
  }
  return url.toString();
};

const linksByUrl = new Map();
for (const [sourceFile, category] of sources) {
  const absolutePath = resolve(workspaceRoot, sourceFile);
  const content = await readFile(absolutePath, 'utf8');
  for (const match of content.matchAll(urlPattern)) {
    let url;
    try {
      url = normalizeUrl(match[2]);
    } catch {
      continue;
    }
    if (internalDependencyHosts.has(new URL(url).hostname)) continue;
    const context = content.slice(Math.max(0, match.index - 320), match.index);
    const nameMatch = context.match(nameBeforeUrlPattern);
    const name = nameMatch?.[2]?.trim() || new URL(url).hostname;
    const existing = linksByUrl.get(url);
    if (existing) {
      if (!existing.sources.includes(sourceFile)) existing.sources.push(sourceFile);
      continue;
    }
    linksByUrl.set(url, {
      url,
      name,
      category,
      source: sourceFile,
      sources: [sourceFile],
    });
  }
}

const links = [...linksByUrl.values()].sort((first, second) => first.url.localeCompare(second.url, 'fi'));
const catalog = {
  schemaVersion: 1,
  generatedAtUtc: new Date().toISOString(),
  sourceFiles: sources.map(([file]) => file),
  links,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  output: relative(workspaceRoot, outputPath).replaceAll('\\', '/'),
  sourceFiles: catalog.sourceFiles.length,
  links: links.length,
  https: links.filter((item) => item.url.startsWith('https://')).length,
  http: links.filter((item) => item.url.startsWith('http://')).length,
}));
