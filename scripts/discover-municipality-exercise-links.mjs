import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const TIMEOUT_MS = 9000;
const CONCURRENCY = 8;
const MAX_PAGES_TO_SCORE = 10;

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const normalizeText = (value) => String(value ?? '')
  .toLocaleLowerCase('fi-FI')
  .normalize('NFKC')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const decodeHtml = (value) => String(value ?? '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'")
  .replace(/&apos;/g, "'");

const stripTags = (html) => decodeHtml(html)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const readText = (filePath) => readFile(path.join(ROOT, filePath), 'utf8');

const parseWebsiteMap = (source) => {
  const rows = [];
  const entryPattern = /'([^']+)':\s*'([^']+)'/g;
  let match;
  while ((match = entryPattern.exec(source))) {
    rows.push({ municipality: match[1], baseUrl: match[2] });
  }
  return rows;
};

const withTimeout = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'SeniorinAloitussivu municipality exercise link discovery',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
};

const fetchText = async (url) => {
  try {
    const response = await withTimeout(url);
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok) return { ok: false, status: response.status, finalUrl: response.url, text: '' };
    if (!/text\/html|application\/xhtml\+xml|application\/xml|text\/xml/i.test(contentType)) {
      return { ok: false, status: response.status, finalUrl: response.url, text: '' };
    }
    return { ok: true, status: response.status, finalUrl: response.url, text: await response.text() };
  } catch (error) {
    return { ok: false, status: error.name ?? 'error', finalUrl: url, text: '' };
  }
};

const resolveUrl = (href, baseUrl) => {
  if (!href || /^(mailto|tel|javascript):/i.test(href)) return '';
  try {
    const url = new URL(decodeHtml(href), baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (/\.(pdf|docx?|xlsx?|pptx?|zip|jpg|jpeg|png|webp|svg|ics)$/i.test(url.pathname)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
};

const sameSite = (candidate, baseUrl) => {
  try {
    const candidateHost = new URL(candidate).hostname.replace(/^www\./, '');
    const baseHost = new URL(baseUrl).hostname.replace(/^www\./, '');
    return candidateHost === baseHost || candidateHost.endsWith(`.${baseHost}`) || baseHost.endsWith(`.${candidateHost}`);
  } catch {
    return false;
  }
};

const extractAnchors = (html, baseUrl) => {
  const anchors = [];
  const anchorPattern = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorPattern.exec(html))) {
    const url = resolveUrl(match[1] ?? match[2] ?? match[3], baseUrl);
    if (!url || !sameSite(url, baseUrl)) continue;
    const text = stripTags(match[4]);
    anchors.push({ url, text });
  }
  return anchors;
};

const pathCandidates = [
  'liikunta',
  'liikuntapalvelut',
  'ohjattu-liikunta',
  'senioriliikunta',
  'senioreiden-liikunta',
  'soveltava-liikunta',
  'erityisliikunta',
  'liikuntaneuvonta',
  'vapaa-aika/liikunta',
  'vapaa-aika/liikuntapalvelut',
  'vapaa-aika/liikuntapalvelut/ohjattu-liikunta',
  'vapaa-aika-ja-matkailu/liikunta-ja-ulkoilu',
  'hyvinvointi-ja-vapaa-aika/liikuntapalvelut',
  'hyvinvointi-ja-vapaa-aika/liikunta',
  'kulttuuri-ja-vapaa-aika/liikunta',
  'liikunta-ja-luonto',
  'liikunta-ja-ulkoilu',
];

const scoringTerms = [
  ['ohjattu liikunta', 80],
  ['ohjattua liikuntaa', 80],
  ['ohjatut liikuntaryhm', 80],
  ['liikuntaryhm', 70],
  ['senioriliikunta', 70],
  ['senioreiden liikunta', 70],
  ['ikäihmisten liikunta', 70],
  ['ikääntyneiden liikunta', 70],
  ['tuolijumppa', 60],
  ['tasapainojumppa', 60],
  ['vesijumppa', 50],
  ['jumppa', 45],
  ['soveltava liikunta', 55],
  ['erityisliikunta', 55],
  ['terveysliikunta', 50],
  ['liikuntaneuvonta', 45],
  ['liikuntapalvelut', 35],
  ['liikunta ja ulkoilu', 30],
  ['motion', 25],
  ['idrott', 25],
  ['senior', 25],
];

const negativeTerms = [
  ['koulu', -15],
  ['varhaiskasvatus', -20],
  ['nuorten liikunta', -20],
  ['lasten liikunta', -20],
  ['avustukset', -20],
  ['tilojen varaus', -20],
];

const scoreText = (value) => {
  const text = normalizeText(value);
  let score = 0;
  const hits = [];

  for (const [term, weight] of scoringTerms) {
    if (text.includes(term)) {
      score += weight;
      hits.push(term);
    }
  }

  for (const [term, weight] of negativeTerms) {
    if (text.includes(term)) score += weight;
  }

  return { score, hits };
};

const confidenceForScore = (score) => {
  if (score >= 110) return 'korkea';
  if (score >= 65) return 'keskitaso';
  if (score >= 35) return 'matala';
  return 'ei löytynyt';
};

const titleFromHtml = (html) => {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).slice(0, 120);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return title ? stripTags(title[1]).slice(0, 120) : '';
};

const looksLikeErrorPage = (title, html) => {
  const haystack = normalizeText(`${title} ${stripTags(html).slice(0, 1500)}`);
  return [
    'virhe 404',
    '404',
    'sivua ei löytynyt',
    'sivua ei loytynyt',
    'page not found',
    'not found',
    'sidan hittades inte',
    'sidan kunde inte hittas',
  ].some((term) => haystack.includes(term));
};

const sitemapCandidates = async (baseUrl) => {
  const sitemapUrl = resolveUrl('/sitemap.xml', baseUrl);
  const result = await fetchText(sitemapUrl);
  if (!result.ok || !result.text) return [];

  const locs = [...result.text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map((match) => decodeHtml(match[1]).trim())
    .filter((url) => sameSite(url, baseUrl));

  return locs
    .filter((url) => scoreText(url.replace(/[-_/]/g, ' ')).score >= 25)
    .slice(0, 30)
    .map((url) => ({ url, text: 'sitemap' }));
};

const candidatePaths = (baseUrl) => {
  const variants = [];
  for (const item of pathCandidates) {
    variants.push({ url: resolveUrl(item, baseUrl), text: item.replace(/-/g, ' ') });
    variants.push({ url: resolveUrl(`${item}/`, baseUrl), text: item.replace(/-/g, ' ') });
  }
  return variants.filter((item) => item.url);
};

const uniqueCandidates = (items) => {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    const key = item.url.replace(/\/+$/, '');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
};

const discoverMunicipality = async ({ municipality, baseUrl }, index, total) => {
  console.log(`${index + 1}/${total} ${municipality}`);
  const home = await fetchText(baseUrl);
  const initialCandidates = [
    ...candidatePaths(home.finalUrl || baseUrl),
    ...(home.text ? extractAnchors(home.text, home.finalUrl || baseUrl) : []),
    ...(await sitemapCandidates(home.finalUrl || baseUrl)),
  ];

  const rankedCandidates = uniqueCandidates(initialCandidates)
    .map((item) => {
      const combined = `${item.text} ${item.url.replace(/[-_/]/g, ' ')}`;
      return { ...item, initialScore: scoreText(combined).score };
    })
    .filter((item) => item.initialScore >= 25)
    .sort((a, b) => b.initialScore - a.initialScore)
    .slice(0, MAX_PAGES_TO_SCORE);

  let best = null;

  for (const candidate of rankedCandidates) {
    const page = await fetchText(candidate.url);
    if (!page.ok) continue;

    const pageText = page.text ? stripTags(page.text).slice(0, 30_000) : '';
    const title = page.text ? titleFromHtml(page.text) : candidate.text;
    if (!pageText || looksLikeErrorPage(title, page.text)) continue;

    const scored = scoreText(`${title} ${candidate.text} ${candidate.url.replace(/[-_/]/g, ' ')} ${pageText}`);
    const totalScore = scored.score + Math.min(candidate.initialScore, 30);
    const row = {
      municipality,
      baseUrl,
      name: title || candidate.text || municipality,
      url: page.finalUrl || candidate.url,
      status: page.status,
      score: totalScore,
      confidence: confidenceForScore(totalScore),
      hits: [...new Set(scored.hits)].join('; '),
    };

    if (!best || row.score > best.score) best = row;
  }

  if (!best || best.confidence === 'ei löytynyt') {
    return {
      municipality,
      baseUrl,
      name: '',
      url: '',
      status: home.status,
      score: best?.score ?? 0,
      confidence: 'ei löytynyt',
      hits: '',
    };
  }

  return best;
};

const runPool = async (items, worker) => {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex, items.length);
    }
  });
  await Promise.all(workers);
  return results;
};

const main = async () => {
  const municipalities = parseWebsiteMap(await readText('municipalityWebsites.ts'));
  const results = await runPool(municipalities, discoverMunicipality);
  const ordered = [...results].sort((a, b) => a.municipality.localeCompare(b.municipality, 'fi'));

  await mkdir(DOCS_DIR, { recursive: true });

  const generatedAt = new Date().toLocaleString('fi-FI', {
    timeZone: 'Europe/Helsinki',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const csvRows = [
    ['Päivitetty', 'Kunta', 'Varmuus', 'Pisteet', 'Nimi', 'URL', 'Kunnan sivu', 'HTTP', 'Osumat']
      .map(csvEscape)
      .join(','),
    ...ordered.map((row) => [
      generatedAt,
      row.municipality,
      row.confidence,
      row.score,
      row.name,
      row.url,
      row.baseUrl,
      row.status,
      row.hits,
    ].map(csvEscape).join(',')),
  ];

  const summary = {
    total: ordered.length,
    high: ordered.filter((row) => row.confidence === 'korkea').length,
    medium: ordered.filter((row) => row.confidence === 'keskitaso').length,
    low: ordered.filter((row) => row.confidence === 'matala').length,
    missing: ordered.filter((row) => row.confidence === 'ei löytynyt').length,
  };

  const markdownRows = [
    '# Kuntien ohjatun liikunnan linkkiehdokkaat',
    '',
    `Päivitetty: ${generatedAt}`,
    '',
    `Yhteensä: ${summary.total} kuntaa.`,
    `Korkea varmuus: ${summary.high}.`,
    `Keskitaso: ${summary.medium}.`,
    `Matala: ${summary.low}.`,
    `Ei löytynyt: ${summary.missing}.`,
    '',
    'Tämä on automaattinen kartoitus. Ennen sovellukseen lisäämistä matalan ja keskitason osumat kannattaa tarkistaa käsin.',
    '',
    '| Kunta | Varmuus | Linkki | Osumat |',
    '|---|---:|---|---|',
    ...ordered.map((row) => {
      const link = row.url ? `[${row.name || row.url}](${row.url})` : '-';
      return `| ${row.municipality} | ${row.confidence} | ${link} | ${row.hits || '-'} |`;
    }),
    '',
  ];

  await writeFile(path.join(DOCS_DIR, 'kuntien-ohjattu-liikunta.csv'), `${csvRows.join('\n')}\n`, 'utf8');
  await writeFile(path.join(DOCS_DIR, 'kuntien-ohjattu-liikunta.md'), `${markdownRows.join('\n')}\n`, 'utf8');

  console.log(`Valmis. Kuntia: ${summary.total}, korkea: ${summary.high}, keskitaso: ${summary.medium}, matala: ${summary.low}, ei löytynyt: ${summary.missing}.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
