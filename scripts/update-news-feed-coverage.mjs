import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const readSource = (filePath) => readFileSync(path.join(repoRoot, filePath), 'utf8');

const normalizeText = (value) => value
  .trim()
  .toLocaleLowerCase('fi-FI')
  .replace(/[.,;:!?()[\]{}–—-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeMunicipality = (name) => normalizeText(name)
  .replace(/^kunta\s+/i, '')
  .replace(/\s+kaupunki$/i, '')
  .replace(/\s+kunta$/i, '')
  .replace(/\s+-\s+.*$/i, '')
  .trim();

const comparableHost = (url) => {
  try {
    return new URL(url).hostname.toLocaleLowerCase('fi-FI').replace(/^www\./, '');
  } catch {
    return '';
  }
};

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

const parseJsonArrayConst = (filePath, constName) => {
  const source = readSource(filePath);
  const match = source.match(new RegExp(`export const ${constName} = (?<json>\\[[\\s\\S]*?\\]) as const;`));
  if (!match?.groups?.json) {
    throw new Error(`Could not parse ${constName} from ${filePath}`);
  }
  return JSON.parse(match.groups.json);
};

const findBalancedBlock = (source, startIndex, openChar, closeChar) => {
  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error(`Could not find balanced block starting at ${startIndex}`);
};

const parseRecord = (source, constName) => {
  const declarationIndex = source.indexOf(`const ${constName}`);
  if (declarationIndex === -1) throw new Error(`Could not find ${constName}`);
  const openIndex = source.indexOf('{', declarationIndex);
  const block = findBalancedBlock(source, openIndex, '{', '}');
  return new Map([...block.matchAll(/'(?<key>[^']+)':\s*'(?<value>[^']+)'/g)]
    .map((match) => [match.groups.key, match.groups.value]));
};

const parseLocalServiceMap = () => {
  const source = readSource('localServices.ts');
  const declarationIndex = source.indexOf('const localServiceMap');
  if (declarationIndex === -1) throw new Error('Could not find localServiceMap');
  const openIndex = source.indexOf('{', declarationIndex);
  const block = findBalancedBlock(source, openIndex, '{', '}');
  const entries = new Map();

  let index = 1;
  while (index < block.length - 1) {
    const match = /\s*(?<key>[a-zåäöé]+):\s*\{/u.exec(block.slice(index));
    if (!match?.groups?.key) break;

    const keyStart = index + match.index;
    const bodyOpen = keyStart + match[0].lastIndexOf('{');
    const body = findBalancedBlock(block, bodyOpen, '{', '}');
    entries.set(normalizeMunicipality(match.groups.key), {
      municipalityUrl: body.match(/municipality:\s*\{[\s\S]*?url:\s*'(?<url>[^']+)'/)?.groups?.url ?? '',
      rssFeeds: [...body.matchAll(/\{\s*name:\s*'(?<name>[^']+)',\s*url:\s*'(?<url>[^']+)'/g)]
        .filter((rssMatch) => body.lastIndexOf('rssFeeds:', rssMatch.index) !== -1)
        .filter((rssMatch) => {
          const rssSectionStart = body.lastIndexOf('rssFeeds:', rssMatch.index);
          const regionalSectionStart = body.lastIndexOf('regionalNews:', rssMatch.index);
          return rssSectionStart > regionalSectionStart;
        })
        .map((rssMatch) => ({ name: rssMatch.groups.name, url: rssMatch.groups.url })),
    });
    index = bodyOpen + body.length + 1;
  }

  return entries;
};

const uniqueByUrl = (items) => [...new Map(items.map((item) => [item.url, item])).values()];

const csvEscape = (value) => {
  const stringValue = String(value ?? '');
  return /[",\n;]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
};

const formatLinkList = (sources) => sources
  .map((source) => `${source.name} (${source.url})`)
  .join('; ');

const markdownTable = (headers, rows) => [
  `| ${headers.join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.join(' | ')} |`),
].join('\n');

const groupBy = (items, keyFn) => items.reduce((acc, item) => {
  const key = keyFn(item);
  acc.set(key, [...(acc.get(key) ?? []), item]);
  return acc;
}, new Map());

const municipalities = parseMunicipalities();
const localNewspaperFeeds = parseJsonArrayConst('localNewspaperFeeds.ts', 'LOCAL_NEWSPAPER_FEEDS');
const municipalityNewsFeeds = parseJsonArrayConst('municipalityNewsFeeds.ts', 'MUNICIPALITY_NEWS_FEEDS');
const localServicesSource = readSource('localServices.ts');
const wellbeingAreaNewsUrls = parseRecord(localServicesSource, 'wellbeingAreaNewsUrls');
const localServiceEntries = parseLocalServiceMap();

const newspaperFeedsByMunicipality = groupBy(localNewspaperFeeds, (feed) => normalizeMunicipality(feed.municipality));
const municipalityNewsFeedsByMunicipality = groupBy(municipalityNewsFeeds, (feed) => normalizeMunicipality(feed.municipality));

const coverage = municipalities.map((municipality) => {
  const exact = localServiceEntries.get(municipality.key);
  const municipalityHost = comparableHost(exact?.municipalityUrl ?? '');
  const exactFeeds = uniqueByUrl(exact?.rssFeeds ?? []);
  const newspaperFeedsFromExact = [];
  const municipalityNewsFeedsFromExact = [];

  for (const feed of exactFeeds) {
    const feedHost = comparableHost(feed.url);
    if (municipalityHost && feedHost === municipalityHost) {
      municipalityNewsFeedsFromExact.push({ ...feed, sourceType: 'municipality-news-flow' });
    } else {
      newspaperFeedsFromExact.push({ ...feed, sourceType: 'local-newspaper-feed' });
    }
  }

  const localNewspaperSources = uniqueByUrl([
    ...(newspaperFeedsByMunicipality.get(municipality.key) ?? []).map((feed) => ({
      name: feed.name,
      url: feed.url,
      sourceType: 'local-newspaper-feed',
    })),
    ...newspaperFeedsFromExact,
  ]);
  const municipalityNewsSources = uniqueByUrl([
    ...(municipalityNewsFeedsByMunicipality.get(municipality.key) ?? []).map((feed) => ({
      name: feed.name,
      url: feed.url,
      sourceType: 'municipality-news-flow',
    })),
    ...municipalityNewsFeedsFromExact,
  ]);
  const wellbeingAreaNewsUrl = wellbeingAreaNewsUrls.get(municipality.wellbeingAreaCode) ?? '';
  const ownNewsFlowCount = localNewspaperSources.length + municipalityNewsSources.length;

  return {
    ...municipality,
    sourceStatus: ownNewsFlowCount > 0 ? 'own-news-flow' : 'wellbeing-area-news-only',
    hasLocalNewspaperFeed: localNewspaperSources.length > 0,
    hasMunicipalityNewsFlow: municipalityNewsSources.length > 0,
    hasOwnNewsFlow: ownNewsFlowCount > 0,
    localNewspaperSources,
    municipalityNewsSources,
    wellbeingAreaNews: wellbeingAreaNewsUrl
      ? {
          name: `Hyvinvointialueen uutiset: ${municipality.wellbeingAreaName}`,
          url: wellbeingAreaNewsUrl,
          sourceType: 'wellbeing-area-news',
        }
      : null,
  };
});

const localNewspaperRows = coverage.filter((row) => row.hasLocalNewspaperFeed);
const municipalityNewsRows = coverage.filter((row) => row.hasMunicipalityNewsFlow);
const noOwnNewsRows = coverage.filter((row) => !row.hasOwnNewsFlow);
const wellbeingFallbackGroups = [...groupBy(noOwnNewsRows, (row) => row.wellbeingAreaName).entries()]
  .sort(([a], [b]) => a.localeCompare(b, 'fi'))
  .map(([areaName, rows]) => ({
    areaName,
    count: rows.length,
    url: rows[0]?.wellbeingAreaNews?.url ?? '',
    municipalities: rows.map((row) => row.name).sort((a, b) => a.localeCompare(b, 'fi')),
  }));

const outputDir = path.join(repoRoot, 'outputs');
const docsDir = path.join(repoRoot, 'docs');
mkdirSync(outputDir, { recursive: true });
mkdirSync(docsDir, { recursive: true });

writeFileSync(
  path.join(outputDir, 'regional-news-feed-coverage.json'),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    municipalityCount: municipalities.length,
    counts: {
      localNewspaperFeedMunicipalities: localNewspaperRows.length,
      municipalityNewsFlowMunicipalities: municipalityNewsRows.length,
      ownNewsFlowMunicipalities: coverage.filter((row) => row.hasOwnNewsFlow).length,
      wellbeingAreaNewsOnlyMunicipalities: noOwnNewsRows.length,
      municipalitiesWithoutAnyNewsSource: coverage.filter((row) => !row.hasOwnNewsFlow && !row.wellbeingAreaNews).length,
    },
    municipalities: coverage,
  }, null, 2),
  'utf8',
);

const csvRows = [
  [
    'kunta',
    'hyvinvointialue',
    'oma_uutisvirta',
    'paikallislehti_syotteet',
    'kunnan_uutisvirrat',
    'hyvinvointialueen_uutisvirta',
    'luokitus',
  ],
  ...coverage.map((row) => [
    row.name,
    row.wellbeingAreaName,
    row.hasOwnNewsFlow ? 'kyllä' : 'ei',
    formatLinkList(row.localNewspaperSources),
    formatLinkList(row.municipalityNewsSources),
    row.wellbeingAreaNews ? `${row.wellbeingAreaNews.name} (${row.wellbeingAreaNews.url})` : '',
    row.sourceStatus,
  ]),
];

writeFileSync(
  path.join(docsDir, 'alueelliset-uutisfeedit-kattavuus.csv'),
  csvRows.map((row) => row.map(csvEscape).join(',')).join('\n'),
  'utf8',
);

const localNewspaperTableRows = localNewspaperRows
  .sort((a, b) => a.name.localeCompare(b.name, 'fi'))
  .map((row) => [
    row.name,
    row.wellbeingAreaName,
    row.localNewspaperSources.map((source) => `[${source.name}](${source.url})`).join('<br>'),
  ]);

const municipalityNewsTableRows = municipalityNewsRows
  .sort((a, b) => a.name.localeCompare(b.name, 'fi'))
  .map((row) => [
    row.name,
    row.wellbeingAreaName,
    row.municipalityNewsSources.map((source) => `[${source.name}](${source.url})`).join('<br>'),
  ]);

const wellbeingFallbackTableRows = wellbeingFallbackGroups.map((group) => [
  group.areaName,
  String(group.count),
  group.url ? `[Hyvinvointialueen uutiset](${group.url})` : 'Puuttuu',
  group.municipalities.join(', '),
]);

const markdown = `# Alueellisten uutisfeedien kattavuus

Päivitetty: ${new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date())}

Tämä raportti erottaa kolme uutislähdetyyppiä:

- paikallislehden RSS-/feed-linkki tiedostosta \`localNewspaperFeeds.ts\` tai kuntakohtaisesta \`localServices.ts\`-määrittelystä
- kunnan oma uutisvirta tiedostosta \`municipalityNewsFeeds.ts\` tai tiedoston \`localServices.ts\` kuntakohtaisista \`rssFeeds\`-riveistä, kun syötteen hosti on kunnan oma palveluhosti
- hyvinvointialueen uutislinkki tiedoston \`localServices.ts\` \`wellbeingAreaNewsUrls\`-kartasta

Koneellinen JSON-raportti: \`outputs/regional-news-feed-coverage.json\`
Kuntakohtainen CSV-taulukko: \`docs/alueelliset-uutisfeedit-kattavuus.csv\`

## Yhteenveto

| Mittari | Kuntia |
| --- | ---: |
| Kuntia yhteensä | ${municipalities.length} |
| Paikallislehden uutisfeed | ${localNewspaperRows.length} |
| Kunnan oma uutisvirta | ${municipalityNewsRows.length} |
| Jokin oma uutisvirta, eli paikallislehti tai kunta | ${coverage.filter((row) => row.hasOwnNewsFlow).length} |
| Ei omaa uutisvirtaa, mutta hyvinvointialueen uutislinkki on saatavilla | ${noOwnNewsRows.length} |
| Ei mitään uutislähdettä datassa | ${coverage.filter((row) => !row.hasOwnNewsFlow && !row.wellbeingAreaNews).length} |

## Kunnat, joilla on paikallislehden uutisfeed

${markdownTable(['Kunta', 'Hyvinvointialue', 'Lähde'], localNewspaperTableRows)}

## Kunnat, joilla on kunnan oma uutisvirta

${markdownTable(['Kunta', 'Hyvinvointialue', 'Lähde'], municipalityNewsTableRows)}

## Kunnat ilman omaa uutisvirtaa

Näissä kunnissa ei ole datassa paikallislehden feediä eikä kunnan omaa uutisvirtaa. Käyttöliittymässä uutisten fallbackina voidaan silti näyttää hyvinvointialueen uutislinkki.

${markdownTable(['Hyvinvointialue', 'Kuntia', 'Hyvinvointialueen uutislinkki', 'Kunnat ilman omaa uutisvirtaa'], wellbeingFallbackTableRows)}

## Seuraava tarkistus

1. Etsi ensin puuttuville kunnille paikallislehden RSS-/Atom-syöte.
2. Jos lehdellä ei ole syötettä, etsi kunnan oma RSS, Atom, uutiset-sivu tai tiedotevirta.
3. Jos kunnalla ei ole omaa uutisvirtaa, hyvinvointialueen uutislinkki jää perustelluksi alueelliseksi fallbackiksi.
4. Älä lisää feedejä ilman toimivaa lähdeosoitetta ja selvää kuntakytkentää.
`;

writeFileSync(path.join(docsDir, 'alueelliset-uutisfeedit-kattavuus.md'), markdown, 'utf8');

console.log('Wrote docs/alueelliset-uutisfeedit-kattavuus.md');
console.log('Wrote docs/alueelliset-uutisfeedit-kattavuus.csv');
console.log('Wrote outputs/regional-news-feed-coverage.json');
