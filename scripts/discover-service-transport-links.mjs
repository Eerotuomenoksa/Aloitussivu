import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TIMEOUT_MS = 12_000;
const CONCURRENCY = 8;
const MAX_SITEMAP_URLS = 12_000;

const TERMS = [
  'palveluliikenne',
  'asiointiliikenne',
  'kutsuliikenne',
  'kutsujoukkoliikenne',
  'kutsutaksi',
  'palvelubussi',
  'asiointikyyti',
  'kyläkyyti',
  'kimppakyyti',
  'joukkoliikenne',
];

const PRIMARY_TERMS = [
  'palveluliikenne',
  'asiointiliikenne',
  'kutsuliikenne',
  'kutsujoukkoliikenne',
  'kutsutaksi',
  'palvelubussi',
  'asiointikyyti',
  'kyläkyyti',
];

const COMMON_PATHS = [
  '/kaupunki-ja-hallinto/asiointi-ja-yhteystiedot/palveluliikenne/',
  '/asuminen-ja-ymparisto/liikenne/palveluliikenne/',
  '/asuminen-ja-ymparisto/liikenne-ja-kadut/palveluliikenne/',
  '/asuminen-ja-ymparisto/kadut-ja-liikenne/palveluliikenne/',
  '/asuminen-ja-liikenne/liikenne/palveluliikenne/',
  '/palvelut/liikenne/palveluliikenne/',
  '/palveluliikenne/',
  '/asiointiliikenne/',
  '/kutsuliikenne/',
  '/kutsutaksi/',
  '/palvelubussi/',
  '/joukkoliikenne/',
  '/liikenneyhteydet/',
  '/liikenne/',
];

const STALE_OR_NEWS_PATTERNS = [
  'kysely',
  'tiedote',
  'tiedoksi',
  'uutinen',
  'uutiset',
  'tag/',
  'avainsana',
  'tapahtuma',
  'tapahtumakalenteri',
  'presidentinvaalit',
  'liikennejarjestely',
  'liikennejärjestely',
  'kokeilu',
  'kokeile',
  'tutuksi',
  'supistuu',
  'paattyy',
  'päättyy',
  'maksuton',
  'suunnitellaan',
  'esiteltiin',
  'kaynnistyy',
  'käynnistyy',
  'ajankohtaista',
  'news-article',
  'tarinat',
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  'kesalla-2024',
  'kesällä 2024',
];

const readText = (filePath) => readFile(path.join(ROOT, filePath), 'utf8');

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const normalizeText = (value) => String(value ?? '')
  .toLocaleLowerCase('fi-FI')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&[#a-z0-9]+;/gi, ' ')
  .replace(/[^a-z0-9åäö]+/giu, ' ')
  .trim();

const titleCaseMunicipality = (value) => value
  .split(/\s+/)
  .filter(Boolean)
  .map((word) => word.charAt(0).toLocaleUpperCase('fi-FI') + word.slice(1))
  .join(' ');

const normalizeUrl = (baseUrl, candidate) => {
  try {
    const url = new URL(candidate, baseUrl);
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
};

const fetchText = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.5',
        'user-agent': 'Aloitussivu link discovery (+https://github.com/Eerotuomenoksa/Aloitussivu)',
      },
      redirect: 'follow',
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !/text|html|xml|json/i.test(contentType)) {
      return { ok: false, status: response.status, url: response.url, text: '', contentType };
    }
    return {
      ok: true,
      status: response.status,
      url: response.url,
      text: await response.text(),
      contentType,
    };
  } catch (error) {
    return { ok: false, status: error.name ?? 'error', url, text: '', contentType: '' };
  } finally {
    clearTimeout(timeout);
  }
};

const htmlToText = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getTitle = (html) => {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
};

const parseMunicipalityWebsites = async () => {
  const source = await readText('municipalityWebsites.ts');
  return [...source.matchAll(/'([^']+)':\s*'([^']+)'/g)]
    .map((match) => ({ municipality: match[1], baseUrl: match[2] }));
};

const extractUrlsFromXml = (xml) => (
  [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim())
);

const extractLinksFromHtml = (baseUrl, html) => (
  [...html.matchAll(/\bhref=["']([^"']+)["']/gi)]
    .map((match) => normalizeUrl(baseUrl, match[1]))
    .filter(Boolean)
);

const sameHost = (baseUrl, candidateUrl) => {
  try {
    return new URL(baseUrl).hostname.replace(/^www\./, '') === new URL(candidateUrl).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
};

const termMatchesUrl = (url) => {
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    decoded = url;
  }
  const normalized = normalizeText(decoded);
  return TERMS.some((term) => normalized.includes(normalizeText(term)));
};

const termMatchesContent = (text) => {
  const normalized = normalizeText(text);
  return PRIMARY_TERMS.filter((term) => normalized.includes(normalizeText(term)));
};

const candidateSitemaps = (baseUrl) => [
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/page-sitemap.xml',
  '/wp-sitemap.xml',
  '/wp-sitemap-posts-page-1.xml',
].map((item) => normalizeUrl(baseUrl, item));

const collectCandidateUrls = async ({ baseUrl }) => {
  const candidates = new Set(COMMON_PATHS.map((item) => normalizeUrl(baseUrl, item)).filter(Boolean));

  const home = await fetchText(baseUrl);
  if (home.ok) {
    extractLinksFromHtml(home.url, home.text)
      .filter((url) => sameHost(baseUrl, url) && termMatchesUrl(url))
      .forEach((url) => candidates.add(url));
  }

  const sitemapQueue = [...candidateSitemaps(baseUrl)];
  const seenSitemaps = new Set();
  let inspectedUrls = 0;

  while (sitemapQueue.length > 0 && inspectedUrls < MAX_SITEMAP_URLS) {
    const sitemapUrl = sitemapQueue.shift();
    if (!sitemapUrl || seenSitemaps.has(sitemapUrl)) continue;
    seenSitemaps.add(sitemapUrl);

    const sitemap = await fetchText(sitemapUrl);
    if (!sitemap.ok) continue;

    const urls = extractUrlsFromXml(sitemap.text);
    inspectedUrls += urls.length;
    for (const url of urls) {
      if (!sameHost(baseUrl, url)) continue;
      if (/sitemap/i.test(url) && /\.xml(\?|$)/i.test(url)) {
        sitemapQueue.push(url);
      }
      if (termMatchesUrl(url)) {
        candidates.add(url);
      }
    }
  }

  return [...candidates];
};

const scoreCandidate = (municipality, result) => {
  if (!result.ok) return null;
  const title = getTitle(result.text);
  const plainText = htmlToText(result.text);
  const terms = termMatchesContent(`${title} ${plainText}`);
  if (terms.length === 0) return null;

  const normalized = normalizeText(`${title} ${plainText}`);
  const normalizedUrl = normalizeText(result.url);
  const normalizedTitle = normalizeText(title);
  const isLikelyNewsOrStale = STALE_OR_NEWS_PATTERNS.some((pattern) => (
    normalizedUrl.includes(normalizeText(pattern)) || normalizedTitle.includes(normalizeText(pattern))
  ));
  const hasStableServicePath = PRIMARY_TERMS.some((term) => normalizedUrl.includes(normalizeText(term)))
    || /joukkoliikenne|liikennepalvelut|liikenneyhteydet|liikenne/i.test(result.url);
  if (isLikelyNewsOrStale) return null;

  const municipalityHit = normalized.includes(normalizeText(municipality));
  const score = terms.length * 20
    + (municipalityHit ? 15 : 0)
    + (terms.some((term) => term === 'palveluliikenne') ? 30 : 0)
    + (terms.some((term) => term === 'asiointiliikenne') ? 20 : 0)
    + (/joukkoliikenne|liikenne|kyyti|taksi/i.test(result.url) ? 10 : 0)
    + (hasStableServicePath ? 20 : 0)
    - (isLikelyNewsOrStale ? 35 : 0);

  return {
    url: result.url,
    status: result.status,
    title,
    terms: [...new Set(terms)].join('; '),
    score,
    snippet: plainText.slice(0, 450),
  };
};

const runLimited = async (items, worker, limit) => {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
};

const discoverForMunicipality = async (entry, index) => {
  const candidates = await collectCandidateUrls(entry);
  const checked = await runLimited(candidates, async (url) => {
    const response = await fetchText(url);
    return scoreCandidate(entry.municipality, response);
  }, 4);

  const best = checked
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.url.length - b.url.length)[0] ?? null;

  if ((index + 1) % 10 === 0 || index === 0) {
    console.log(`${index + 1} kuntaa tarkistettu`);
  }

  return {
    ...entry,
    candidates: candidates.length,
    best,
  };
};

const buildTs = (matches) => [
  "import type { Provider } from './types';",
  '',
  'export interface LocalServiceTransportEntry {',
  '  municipality: string;',
  '  provider: Provider;',
  '  evidence?: string;',
  '}',
  '',
  '// Generated/maintained from municipal service transport checks.',
  '// Category name uses the common Finnish term "Palveluliikenne".',
  'export const LOCAL_SERVICE_TRANSPORT_LINKS: LocalServiceTransportEntry[] = [',
  ...matches.map(({ municipality, best }) => [
    '  {',
    `    municipality: ${JSON.stringify(municipality)},`,
    '    provider: {',
    `      name: ${JSON.stringify(`${titleCaseMunicipality(municipality)} palveluliikenne`)},`,
    `      url: ${JSON.stringify(best.url)},`,
    "      group: 'Palveluliikenne',",
    '    },',
    `    evidence: ${JSON.stringify(`${best.title || 'Sivulta löytyi palveluliikenteeseen liittyvä sisältö'}; termit: ${best.terms}`)},`,
    '  },',
  ].join('\n')),
  '];',
  '',
].join('\n');

const main = async () => {
  const municipalities = await parseMunicipalityWebsites();
  console.log(`Tarkistetaan ${municipalities.length} kuntaa palveluliikenteen varalta...`);
  const results = await runLimited(municipalities, discoverForMunicipality, CONCURRENCY);
  const matches = results
    .filter((item) => item.best && item.best.score >= 50)
    .sort((a, b) => a.municipality.localeCompare(b.municipality, 'fi-FI'));

  await mkdir(path.join(ROOT, 'docs'), { recursive: true });

  const header = ['Kunta', 'Kunnan sivusto', 'Ehdotettu URL', 'HTTP', 'Otsikko', 'Termit', 'Pisteet', 'Ehdokas-URLien määrä', 'Katkelma'];
  const rows = results
    .sort((a, b) => a.municipality.localeCompare(b.municipality, 'fi-FI'))
    .map((item) => [
      item.municipality,
      item.baseUrl,
      item.best?.url ?? '',
      item.best?.status ?? '',
      item.best?.title ?? '',
      item.best?.terms ?? '',
      item.best?.score ?? '',
      item.candidates,
      item.best?.snippet ?? '',
    ].map(csvEscape).join(','));
  await writeFile(path.join(ROOT, 'docs', 'palveluliikenne-kartoitus.csv'), `${header.map(csvEscape).join(',')}\n${rows.join('\n')}\n`, 'utf8');
  await writeFile(path.join(ROOT, 'localServiceTransportLinks.ts'), buildTs(matches), 'utf8');

  const termCounts = new Map();
  for (const match of matches) {
    for (const term of match.best.terms.split(';').map((item) => item.trim()).filter(Boolean)) {
      termCounts.set(term, (termCounts.get(term) ?? 0) + 1);
    }
  }

  const markdown = [
    '# Palveluliikenteen kuntakartoitus',
    '',
    `Tarkistettu kuntia: ${municipalities.length}.`,
    `Löydetty palveluliikenteeseen viittaavia sivuja: ${matches.length}.`,
    '',
    '## Yleisimmät nimitykset',
    '',
    '| Nimitys | Osumia |',
    '|---|---:|',
    ...[...termCounts.entries()].sort((a, b) => b[1] - a[1]).map(([term, count]) => `| ${term} | ${count} |`),
    '',
    '## Löydetyt linkit',
    '',
    '| Kunta | Linkki | Otsikko | Termit |',
    '|---|---|---|---|',
    ...matches.map((item) => `| ${item.municipality} | [linkki](${item.best.url}) | ${item.best.title.replace(/\|/g, '/')} | ${item.best.terms} |`),
    '',
  ];
  await writeFile(path.join(ROOT, 'docs', 'palveluliikenne-kartoitus.md'), markdown.join('\n'), 'utf8');

  console.log(`Valmis. Löydetty ${matches.length} palveluliikennelinkkiä.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
