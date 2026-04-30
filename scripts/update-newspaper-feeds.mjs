import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEWSPAPER_FILE = path.join(ROOT, 'localNewspaperLinks.ts');
const REGISTRY_FILE = path.join(ROOT, 'municipalRegistry.ts');
const OUTPUT_FILE = path.join(ROOT, 'localNewspaperFeeds.ts');
const DOCS_DIR = path.join(ROOT, 'docs');
const MISSING_DOC = path.join(DOCS_DIR, 'paikallisuutiset-puuttuvat-kunnat.md');
const SCAN_CONCURRENCY = 6;

const fetchWithTimeout = async (url, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; SeniorinAloitussivu/1.0)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
  } finally {
    clearTimeout(timer);
  }
};

const readTsArray = async (filePath) => {
  const text = await readFile(filePath, 'utf8');
  return text;
};

const normalizeText = (value) => value
  .trim()
  .toLocaleLowerCase('fi-FI')
  .replace(/[.,;:!?()\[\]{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const stripDiacritics = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeMunicipality = (name) => {
  const normalized = normalizeText(name)
    .replace(/^kunta\s+/i, '')
    .replace(/\s+kaupunki$/i, '')
    .replace(/\s+kunta$/i, '')
    .replace(/\s+-\s+.*$/i, '')
    .trim();
  return stripDiacritics(normalized);
};

const getInflections = (name) => {
  const base = normalizeMunicipality(name);
  const forms = new Set([base, `${base}n`, `${base}ssa`, `${base}ssä`, `${base}sta`, `${base}stä`, `${base}lla`, `${base}llä`, `${base}lta`, `${base}ltä`, `${base}lle`]);
  if (base.endsWith('i')) {
    const stem = base.slice(0, -1);
    forms.add(`${stem}issa`);
    forms.add(`${stem}issä`);
    forms.add(`${stem}ista`);
    forms.add(`${stem}istä`);
    forms.add(`${stem}iin`);
  }
  return [...forms];
};

const extractNewspaperLinks = (text) => {
  const result = [];
  for (const match of text.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\s*\}/g)) {
    result.push({ name: match[1], url: match[2] });
  }
  return result;
};

const extractMunicipalities = (text) => {
  const municipalities = [];
  for (const match of text.matchAll(/"name":\s*"([^"]+)",\s*"wellbeingAreaCode":/g)) {
    municipalities.push(match[1]);
  }
  return municipalities;
};

const resolveMunicipality = (title, municipalities) => {
  const haystack = ` ${normalizeText(title)} `;
  const ordered = [...municipalities].sort((a, b) => b.length - a.length);
  for (const municipality of ordered) {
    const forms = getInflections(municipality);
    if (forms.some((form) => haystack.includes(` ${form} `))) {
      return municipality;
    }
  }
  return '';
};

const cleanUrl = (url) => url.replace(/&amp;/g, '&').replace(/[)\].,;]+$/g, '');

const isCandidateUrl = (url) => {
  try {
    const parsed = new URL(cleanUrl(url));
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (['wikimedia.org', 'wikipedia.org', 'creativecommons.org', 'donate.wikimedia.org', 'web.archive.org', 'archive.org', 'tools.wmflabs.org', 'wikimediafoundation.org', 'kansalliskirjasto.fi'].some((host) => parsed.hostname.includes(host))) return false;
    return true;
  } catch {
    return false;
  }
};

const discoverFeedLinks = async (siteUrl) => {
  const found = new Set();
  const candidates = new Set();
  const home = new URL(siteUrl);

  try {
    const response = await fetchWithTimeout(siteUrl, 8000);
    const text = await response.text();
    const patterns = [
      /<link[^>]+rel=["'][^"']*(?:alternate|feed)[^"']*["'][^>]*href=["']([^"']+)[\"'][^>]*>/gi,
      /href=["']([^"']*(?:feed|rss|atom|xml)[^"']*)["']/gi,
      /src=["']([^"']*(?:feed|rss|atom|xml)[^"']*)["']/gi,
    ];
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) {
        candidates.add(match[1]);
      }
    }
  } catch {
    // ignore homepage fetch failures and fall back to common feed endpoints
  }

  for (const pathSuffix of ['/feed', '/feed/', '/rss', '/rss.xml', '/feed.xml', '/atom.xml']) {
    candidates.add(new URL(pathSuffix, home).toString());
  }

  for (const candidate of candidates) {
    try {
      const absolute = new URL(cleanUrl(candidate), home).toString();
      const response = await fetchWithTimeout(absolute, 7000);
      if (!response.ok) continue;
      const contentType = response.headers.get('content-type') ?? '';
      const text = await response.text();
      const looksLikeFeed = /application\/(rss|atom)\+xml|text\/xml|application\/xml/i.test(contentType)
        || /^\s*<\?(xml|xml-stylesheet)/i.test(text)
        || /^\s*<(rss|feed|rdf:RDF)/i.test(text);
      if (looksLikeFeed) {
        found.add(response.url);
      }
    } catch {
      // Ignore broken candidates.
    }
  }

  return [...found];
};

const runLimited = async (items, worker, limit) => {
  const results = new Array(items.length);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
};

const main = async () => {
  const [newspaperText, registryText] = await Promise.all([
    readTsArray(NEWSPAPER_FILE),
    readTsArray(REGISTRY_FILE),
  ]);
  const newspapers = extractNewspaperLinks(newspaperText);
  const municipalities = extractMunicipalities(registryText);

  const discovered = [];
  const missingFeeds = [];
  const feedsByMunicipality = new Map();

  const scanned = await runLimited(newspapers, async (paper, index) => {
    const municipality = resolveMunicipality(paper.name, municipalities);
    const feeds = await discoverFeedLinks(paper.url);
    if (feeds.length === 0) {
      if (municipality) missingFeeds.push({ municipality, paper: paper.name, siteUrl: paper.url });
      if ((index + 1) % 10 === 0 || index + 1 === newspapers.length) {
        console.log(`${index + 1}/${newspapers.length}`);
      }
      return null;
    }

    const feedUrl = feeds[0];
    if ((index + 1) % 10 === 0 || index + 1 === newspapers.length) {
      console.log(`${index + 1}/${newspapers.length}`);
    }
    return { municipality, paper: paper.name, siteUrl: paper.url, feedUrl };
  }, SCAN_CONCURRENCY);

  for (const item of scanned.filter(Boolean)) {
    discovered.push(item);
    if (item.municipality) {
      const list = feedsByMunicipality.get(item.municipality) ?? [];
      list.push({ name: item.paper, url: item.feedUrl });
      feedsByMunicipality.set(item.municipality, list);
    }
  }

  const feedEntries = [...feedsByMunicipality.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'fi-FI'))
    .flatMap(([municipality, feeds]) => feeds.map((feed) => ({ municipality, ...feed })));

  const output = `export const LOCAL_NEWSPAPER_FEEDS = ${JSON.stringify(feedEntries, null, 2)} as const;\n`;
  await writeFile(OUTPUT_FILE, output, 'utf8');

  await mkdir(DOCS_DIR, { recursive: true });
  const missingMunicipalities = [...new Set(
    municipalities.filter((municipality) => !feedsByMunicipality.has(municipality))
  )].sort((a, b) => a.localeCompare(b, 'fi-FI'));

  const docLines = [
    '# Paikallisuutiset ilman RSS-syötettä',
    '',
    `Löydettyjä paikallislehtien RSS-/feed-linkkejä: ${discovered.length}`,
    `Kuntia ilman paikallislehtien RSS-/feed-löydöstä: ${missingMunicipalities.length}`,
    '',
    '## Kunnat',
    ...missingMunicipalities.map((municipality) => `- ${municipality}`),
    '',
  ];
  await writeFile(MISSING_DOC, `${docLines.join('\n')}`, 'utf8');

  console.log(`Löytyi feediä ${discovered.length} lehdelle.`);
  console.log(`Kuntia ilman paikallislehtien RSS-/feed-löydöstä: ${missingMunicipalities.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
