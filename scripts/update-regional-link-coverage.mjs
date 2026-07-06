import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const readSource = (filePath) => readFileSync(path.join(repoRoot, filePath), 'utf8');

const normalizeText = (value) => value
  .trim()
  .toLocaleLowerCase('fi-FI')
  .replace(/[.,;:!?()[\]{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeMunicipality = (name) => normalizeText(name)
  .replace(/^kunta\s+/i, '')
  .replace(/\s+kaupunki$/i, '')
  .replace(/\s+kunta$/i, '')
  .replace(/\s+seutukunta$/i, '')
  .replace(/\s+-\s+.*$/i, '')
  .trim();

const extractQuotedStrings = (value) => [...value.matchAll(/'([^']+)'|"([^"]+)"/g)]
  .map((match) => match[1] ?? match[2])
  .filter(Boolean);

const parseMunicipalities = () => {
  const source = readSource('municipalRegistry.ts');
  return [...source.matchAll(/\{\s*"code":\s*"(?<code>[^"]+)",\s*"name":\s*"(?<name>[^"]+)",\s*"wellbeingAreaCode":\s*"(?<wellbeingAreaCode>[^"]+)",\s*"wellbeingAreaName":\s*"(?<wellbeingAreaName>[^"]+)"/g)]
    .map((match) => ({
      code: match.groups.code,
      name: match.groups.name,
      key: normalizeMunicipality(match.groups.name),
      wellbeingAreaCode: match.groups.wellbeingAreaCode,
      wellbeingAreaName: match.groups.wellbeingAreaName,
    }));
};

const parseRegionalServiceAreas = () => {
  const source = readSource('localServices.ts');
  return [...source.matchAll(/id:\s*'(?<id>[^']+)',\s*name:\s*'(?<name>[^']+)',\s*municipalities:\s*\[(?<municipalities>[^\]]+)\],[\s\S]*?publicTransport:\s*\{\s*name:\s*'(?<providerName>[^']+)',\s*url:\s*'(?<url>[^']+)'/g)]
    .map((match) => ({
      id: match.groups.id,
      name: match.groups.name,
      municipalities: extractQuotedStrings(match.groups.municipalities).map(normalizeMunicipality),
      providerName: match.groups.providerName,
      url: match.groups.url,
    }));
};

const parseLocalServiceMapPublicTransport = () => {
  const source = readSource('localServices.ts');
  const entries = new Map();
  const mapMatch = source.match(/const localServiceMap:[\s\S]*?=\s*\{(?<body>[\s\S]*?)\n\};/);
  if (!mapMatch?.groups?.body) return entries;

  for (const match of mapMatch.groups.body.matchAll(/\n\s{2}(?<key>[a-zåäöé]+):\s*\{(?<body>[\s\S]*?)(?=\n\s{2}[a-zåäöé]+:\s*\{|\n$)/g)) {
    const body = match.groups.body;
    const publicTransport = body.match(/publicTransport:\s*(?<value>hslPublicTransport|\{[\s\S]*?name:\s*'(?<name>[^']+)',\s*url:\s*'(?<url>[^']+)'[\s\S]*?\})/);
    if (!publicTransport) continue;

    entries.set(normalizeMunicipality(match.groups.key), {
      providerName: publicTransport.groups.name ?? 'HSL',
      url: publicTransport.groups.url ?? 'https://www.hsl.fi/',
    });
  }

  return entries;
};

const parseMunicipalityEntries = (filePath) => {
  const source = readSource(filePath);
  return new Set([...source.matchAll(/["']?municipality["']?\s*:\s*["'](?<municipality>[^"']+)["']/g)]
    .map((match) => normalizeMunicipality(match.groups.municipality)));
};

const statusCounts = (items, key) => items.reduce((acc, item) => {
  acc[item[key]] = (acc[item[key]] ?? 0) + 1;
  return acc;
}, {});

const groupBy = (items, keyFn) => items.reduce((acc, item) => {
  const key = keyFn(item);
  acc.set(key, [...(acc.get(key) ?? []), item]);
  return acc;
}, new Map());

const formatCountTable = (counts) => [
  '| Tila | Kuntia |',
  '| --- | ---: |',
  ...Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, 'fi')).map(([status, count]) => `| ${status} | ${count} |`),
].join('\n');

const formatGroupedMunicipalities = (title, rows) => {
  if (rows.length === 0) return `## ${title}\n\nEi kuntia tässä luokassa.\n`;
  const groups = groupBy(rows, (row) => row.wellbeingAreaName);
  const sections = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'fi'))
    .map(([area, municipalities]) => [
      `### ${area}, ${municipalities.length} kuntaa`,
      '',
      municipalities.map((item) => item.name).sort((a, b) => a.localeCompare(b, 'fi')).join(', '),
    ].join('\n'));
  return [`## ${title}`, '', ...sections, ''].join('\n\n');
};

const municipalities = parseMunicipalities();
const regionalServiceAreas = parseRegionalServiceAreas();
const ownPublicTransport = parseLocalServiceMapPublicTransport();
const serviceTransportMunicipalities = parseMunicipalityEntries('localServiceTransportLinks.ts');
const newspaperFeedMunicipalities = parseMunicipalityEntries('localNewspaperFeeds.ts');

const regionalPublicTransportByMunicipality = new Map();
for (const area of regionalServiceAreas) {
  for (const municipality of area.municipalities) {
    regionalPublicTransportByMunicipality.set(municipality, area);
  }
}

const coverage = municipalities.map((municipality) => {
  const ownTransport = ownPublicTransport.get(municipality.key);
  const regionalTransport = regionalPublicTransportByMunicipality.get(municipality.key);
  const publicTransportStatus = regionalTransport && ownTransport?.url === regionalTransport.url
    ? 'ok-regional'
    : ownTransport
      ? 'ok-own'
      : regionalTransport
        ? 'ok-regional'
        : 'fallback-national';

  return {
    ...municipality,
    publicTransport: {
      status: publicTransportStatus,
      providerName: ownTransport?.providerName ?? regionalTransport?.providerName ?? 'Matkahuollon reittiopas',
      area: regionalTransport?.name ?? (publicTransportStatus === 'fallback-national' ? 'Suomi' : municipality.name),
    },
    serviceTransport: {
      status: serviceTransportMunicipalities.has(municipality.key) ? 'ok-own' : 'missing',
    },
    localNewsFeed: {
      status: newspaperFeedMunicipalities.has(municipality.key) ? 'ok-own' : 'missing',
    },
  };
});

const outputDir = path.join(repoRoot, 'outputs');
mkdirSync(outputDir, { recursive: true });
writeFileSync(
  path.join(outputDir, 'regional-link-coverage.json'),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    municipalityCount: municipalities.length,
    counts: {
      publicTransport: statusCounts(coverage.map((row) => row.publicTransport), 'status'),
      serviceTransport: statusCounts(coverage.map((row) => row.serviceTransport), 'status'),
      localNewsFeed: statusCounts(coverage.map((row) => row.localNewsFeed), 'status'),
    },
    municipalities: coverage,
  }, null, 2),
  'utf8',
);

const publicTransportFallbackRows = coverage.filter((row) => row.publicTransport.status === 'fallback-national');
const missingServiceTransportRows = coverage.filter((row) => row.serviceTransport.status === 'missing');
const missingLocalNewsFeedRows = coverage.filter((row) => row.localNewsFeed.status === 'missing');

const markdown = `# Alueellisten linkkien kattavuus ja puuttuvat kuntalinkit

Päivitetty: ${new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date())}

Tämä raportti tukee puuttuvien alueellisten linkkien täydentämistä. Se ei vielä todista, ettei kunnassa ole palvelua, vaan kertoo missä Aloitussivun datassa ei ole omaa tai seudullista linkkiä.

Koneellinen JSON-raportti: \`outputs/regional-link-coverage.json\`

## Yhteenveto

Kuntia yhteensä: ${municipalities.length}

### Julkinen liikenne

${formatCountTable(statusCounts(coverage.map((row) => row.publicTransport), 'status'))}

Tulkinta:

- \`ok-own\`: kunnalla on oma julkisen liikenteen linkki.
- \`ok-regional\`: kunnalla on seudullinen joukkoliikennelinkki.
- \`fallback-national\`: käyttäjälle näytetään Matkahuollon reittiopas, koska omaa tai seudullista linkkiä ei ole vielä merkitty.

### Palveluliikenne

${formatCountTable(statusCounts(coverage.map((row) => row.serviceTransport), 'status'))}

### Paikallisuutisten RSS-syötteet

${formatCountTable(statusCounts(coverage.map((row) => row.localNewsFeed), 'status'))}

${formatGroupedMunicipalities('Julkinen liikenne: valtakunnallisen fallbackin varassa', publicTransportFallbackRows)}

${formatGroupedMunicipalities('Palveluliikenne: oma linkki puuttuu datasta', missingServiceTransportRows)}

${formatGroupedMunicipalities('Paikallisuutiset: RSS-syöte puuttuu datasta', missingLocalNewsFeedRows)}

## Seuraava työ

1. Käy \`fallback-national\`-kunnat läpi hyvinvointialue tai maakunta kerrallaan.
2. Korvaa Matkahuollon fallback omalla tai seudullisella linkillä vain, jos virallinen lähde löytyy.
3. Jos käytetään naapurikunnan linkkiä, lisää linkille \`scope: 'neighbor'\`, \`sourceMunicipality\`, \`fallbackFor\` ja \`sourceNote\`.
4. Tarkista, että käyttöliittymä näyttää alkuperän: oman kunnan palvelu, seudullinen palvelu, naapurikunnan palvelu tai valtakunnallinen haku.
`;

writeFileSync(path.join(repoRoot, 'docs', 'alueelliset-linkit-puuttuvat-kunnat.md'), markdown, 'utf8');

console.log('Wrote docs/alueelliset-linkit-puuttuvat-kunnat.md');
console.log('Wrote outputs/regional-link-coverage.json');
