import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const TIMEOUT_MS = 8000;
const CONCURRENCY = 10;
const MAX_PAGES_TO_SCORE = 8;
const MAX_CHILD_SITEMAPS = 6;

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const decodeHtml = (value) => String(value ?? '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, ' ')
  .replace(/&auml;/gi, 'ä')
  .replace(/&ouml;/gi, 'ö')
  .replace(/&aring;/gi, 'å')
  .replace(/&#0?39;/g, "'")
  .replace(/&apos;/g, "'")
  .replace(/&#x2d;/gi, '-')
  .replace(/&#8211;|&#x2013;/gi, '–')
  .replace(/&#8212;|&#x2014;/gi, '—')
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
  .replace(/\u00ad/g, '');
const stripTags = (html) => decodeHtml(html)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const normalizeText = (value) => stripTags(String(value ?? ''))
  .toLocaleLowerCase('fi-FI')
  .normalize('NFKC')
  .replace(/[–—_/.-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const displayMunicipality = (value) => value.charAt(0).toLocaleUpperCase('fi-FI') + value.slice(1);

const parseWebsiteMap = (source) => {
  const rows = [];
  for (const match of source.matchAll(/'([^']+)':\s*'([^']+)'/g)) {
    rows.push({ key: match[1], municipality: displayMunicipality(match[1]), baseUrl: match[2] });
  }
  return rows;
};

const fetchText = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.7',
        'user-agent': 'SeniorinAloitussivu municipality senior page discovery',
      },
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !/text\/html|application\/xhtml\+xml|application\/xml|text\/xml/i.test(contentType)) {
      return { ok: false, status: response.status, finalUrl: response.url || url, text: '' };
    }
    return { ok: true, status: response.status, finalUrl: response.url || url, text: await response.text() };
  } catch (error) {
    return { ok: false, status: error?.name ?? 'error', finalUrl: url, text: '' };
  } finally {
    clearTimeout(timeout);
  }
};

const resolveUrl = (href, baseUrl) => {
  if (!href || /^(mailto|tel|javascript):/i.test(href)) return '';
  try {
    const url = new URL(decodeHtml(href), baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (/\.(pdf|docx?|xlsx?|pptx?|zip|jpe?g|png|webp|svg|ics)$/i.test(url.pathname)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
};

const comparableHost = (value) => {
  try { return new URL(value).hostname.replace(/^www\./, '').toLocaleLowerCase('fi-FI'); } catch { return ''; }
};
const sameSite = (candidate, baseUrl) => {
  const candidateHost = comparableHost(candidate);
  const baseHost = comparableHost(baseUrl);
  return Boolean(candidateHost && baseHost && (
    candidateHost === baseHost
    || candidateHost.endsWith(`.${baseHost}`)
    || baseHost.endsWith(`.${candidateHost}`)
  ));
};

const positiveTerms = [
  ['seniorityö', 150], ['seniorityo', 150], ['senioripalvelut', 140],
  ['ikäihmisten palvelut', 135], ['ikaihmisten palvelut', 135],
  ['ikääntyneiden palvelut', 135], ['ikaantyneiden palvelut', 135],
  ['vanhuspalvelut', 120], ['palvelut senioreille', 120],
  ['seniorineuvonta', 115], ['ikäihmiset', 95], ['ikaihmiset', 95],
  ['ikääntyneet', 95], ['ikaantyneet', 95], ['seniorit', 85],
  ['seniorisivut', 120], ['ikäystävällinen', 70], ['ikaystavallinen', 70],
  ['äldre personer', 95], ['aldre personer', 95], ['äldreomsorg', 110],
  ['aldreomsorg', 110], ['äldreservice', 110], ['aldreservice', 110],
  ['seniorservice', 110], ['seniorer', 85], ['för äldre', 90], ['for aldre', 90],
];
const negativeTerms = [
  ['tapahtuma', -150], ['evenemang', -150], ['uutinen', -120], ['uutiset', -100],
  ['news article', -120], ['ajankohtaista', -80], ['blogi', -80],
  ['senioriliikunta', -90], ['liikunta', -55], ['motion', -45], ['idrott', -45],
  ['eläkeläisyhdistys', -70], ['elakelaisyhdistys', -70], ['yhdistys', -35],
  ['työpaikka', -100], ['tyopaikka', -100], ['rekry', -100], ['pdf', -100],
];

const scoreText = (value) => {
  const text = normalizeText(value);
  let score = 0;
  const hits = [];
  for (const [term, weight] of positiveTerms) {
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
  if (score >= 230) return 'korkea';
  if (score >= 130) return 'keskitaso';
  if (score >= 70) return 'matala';
  return 'ei löytynyt';
};

const titleFromHtml = (html) => {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).slice(0, 160);
  const ogTitle = html.match(/<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i);
  if (ogTitle) return decodeHtml(ogTitle[1]).slice(0, 160);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return title ? stripTags(title[1]).slice(0, 160) : '';
};

const looksLikeErrorPage = (title, html) => {
  const text = normalizeText(`${title} ${stripTags(html).slice(0, 1400)}`);
  return ['virhe 404', 'sivua ei löytynyt', 'sivua ei loytynyt', 'page not found', 'not found', 'sidan hittades inte']
    .some((term) => text.includes(term));
};

const looksLikeLandingPage = (title, url) => {
  const normalizedTitle = normalizeText(title);
  let normalizedPath = '';
  try {
    normalizedPath = normalizeText(decodeURIComponent(new URL(url).pathname));
  } catch {
    normalizedPath = normalizeText(url);
  }
  const excludedPathTerms = [
    'category', 'km event category', 'jarjestaja', 'järjestäjä', 'uutiset', 'nyheter',
    'news article', 'ajankohtaista', 'tapahtuma', 'event', 'arviointikertomus',
    'kurssit', 'kursverksamhet', 'rekry', 'lediga tjanster', 'lediga tjänster',
    'fortroendevalda', 'förtroendevalda', 'jarjestot', 'järjestöt',
    'avgifter', 'institutionsvard', 'institutionsvård', 'organisation och arbete',
    'administrativ organisation', 'pakolaispalvelut',
    'kotoutumisen palvelukartta', 'seniorikartta auttaa', 'vi soker', 'vi söker',
    'rokotusapua',
  ];
  const excludedTitleTerms = [
    'arkistot', 'arviointikertomus', 'vi söker', 'vi soker', 'lediga tjänster',
    'lediga tjanster', 'kokeilu käyntiin',
    'personaldimensioneringen', 'sommarcafe', 'sommarcafé', 'låtskrivning',
    'latskrivning', 'rokotusapua', 'yhdessä vellamoon', 'auttaa löytämään',
    'söker en servicechef', 'soker en servicechef',
    'rehabilitering', 'barn och äldreomsorg avgifter', 'aldreomsorgsnamnden',
    'äldreomsorgsnämnden', 'aldreomsorgssektorn', 'äldreomsorgssektorn',
  ];
  return !excludedPathTerms.some((term) => normalizedPath.includes(term))
    && !excludedTitleTerms.some((term) => normalizedTitle.includes(term));
};

// The score is intentionally conservative. These official landing pages were
// manually checked after discovery because generic page chrome kept their score
// just below the automatic high-confidence threshold.
const manualCuration = {
  helsinki: { promote: true },
  kangasniemi: { promote: true, name: 'Ikääntyneet' },
  kittilä: { promote: true },
  kärkölä: { promote: true },
  liperi: { promote: true },
  muurame: { promote: true },
  nurmijärvi: { promote: true },
  pyhäranta: { promote: true, name: 'Ikäihmisten palvelut' },
  ähtäri: { promote: true },
  hamina: { name: 'Ikääntyneiden palvelut' },
  luoto: { name: 'Aktiiviset seniorit' },
  merikarvia: { name: 'Ikäihmisten palvelut' },
  lapinjärvi: { exclude: true },
};

const extractAnchors = (html, baseUrl) => {
  const anchors = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = resolveUrl(match[1] ?? match[2] ?? match[3], baseUrl);
    if (!url || !sameSite(url, baseUrl)) continue;
    anchors.push({ url, text: stripTags(match[4]), source: 'etusivu' });
  }
  return anchors;
};

const extractSitemapLocs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
  .map((match) => decodeHtml(match[1]).trim());

const sitemapCandidates = async (baseUrl) => {
  const roots = ['/sitemap.xml', '/wp-sitemap.xml', '/sitemap_index.xml']
    .map((item) => resolveUrl(item, baseUrl));
  const pageUrls = [];
  const childSitemaps = [];

  for (const sitemapUrl of roots) {
    const result = await fetchText(sitemapUrl);
    if (!result.ok) continue;
    for (const loc of extractSitemapLocs(result.text)) {
      if (!sameSite(loc, baseUrl)) continue;
      if (/\.xml(?:\?|$)/i.test(loc)) childSitemaps.push(loc);
      else pageUrls.push(loc);
    }
  }

  const rankedChildren = [...new Set(childSitemaps)]
    .sort((a, b) => {
      const rank = (value) => /(?:page|pages|sivu|post|content)/i.test(value) ? 1 : 0;
      return rank(b) - rank(a);
    })
    .slice(0, MAX_CHILD_SITEMAPS);
  for (const childUrl of rankedChildren) {
    const result = await fetchText(childUrl);
    if (!result.ok) continue;
    pageUrls.push(...extractSitemapLocs(result.text).filter((loc) => sameSite(loc, baseUrl) && !/\.xml(?:\?|$)/i.test(loc)));
  }

  return [...new Set(pageUrls)]
    .map((url) => ({ url, text: url.replace(/[-_/]/g, ' '), source: 'sivukartta' }))
    .filter((item) => scoreText(item.text).score >= 50);
};

const fixedPaths = [
  'seniorit', 'seniorityo', 'seniorityö', 'senioripalvelut', 'seniorisivut',
  'ikaihmiset', 'ikäihmiset', 'ikaantyneet', 'ikääntyneet',
  'hyvinvointi-ja-terveys/seniorityo', 'hyvinvointi-ja-terveys/seniorit',
  'hyvinvointi/seniorit', 'palvelut/seniorit', 'palvelut/ikaihmiset',
  'sosiaali-ja-terveys/ikaihmiset', 'eldre', 'seniorer', 'aldreomsorg',
];
const pathCandidates = (baseUrl) => fixedPaths.flatMap((item) => [item, `${item}/`])
  .map((item) => ({ url: resolveUrl(item, baseUrl), text: item, source: 'polku' }))
  .filter((item) => item.url);

const uniqueCandidates = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url.replace(/\/+$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const discoverMunicipality = async ({ key, municipality, baseUrl }, index, total) => {
  console.log(`${index + 1}/${total} ${municipality}`);
  const home = await fetchText(baseUrl);
  const canonicalBase = home.finalUrl || baseUrl;
  const candidates = uniqueCandidates([
    ...pathCandidates(canonicalBase),
    ...(home.text ? extractAnchors(home.text, canonicalBase) : []),
    ...(await sitemapCandidates(canonicalBase)),
  ]).map((item) => ({ ...item, initialScore: scoreText(`${item.text} ${item.url}`).score }))
    .filter((item) => item.initialScore >= 50)
    .sort((a, b) => b.initialScore - a.initialScore)
    .slice(0, MAX_PAGES_TO_SCORE);

  let best = null;
  for (const candidate of candidates) {
    const page = await fetchText(candidate.url);
    if (!page.ok || !sameSite(page.finalUrl, canonicalBase)) continue;
    const title = titleFromHtml(page.text);
    if (!title || looksLikeErrorPage(title, page.text) || !looksLikeLandingPage(title, page.finalUrl)) continue;
    const titleScore = scoreText(`${title} ${page.finalUrl}`);
    const excerptScore = scoreText(stripTags(page.text).slice(0, 6000));
    const score = candidate.initialScore + (titleScore.score * 2) + Math.min(excerptScore.score, 100);
    const row = {
      key, municipality, baseUrl, name: title, url: page.finalUrl,
      status: page.status, score, confidence: confidenceForScore(score),
      source: candidate.source,
      hits: [...new Set([...titleScore.hits, ...excerptScore.hits])].join('; '),
    };
    if (!best || row.score > best.score) best = row;
  }

  return best ?? {
    key, municipality, baseUrl, name: '', url: '', status: home.status,
    score: 0, confidence: 'ei löytynyt', source: '', hits: '',
  };
};

const runPool = async (items, worker) => {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index], index, items.length);
    }
  });
  await Promise.all(workers);
  return results;
};

const main = async () => {
  const websiteSource = await readFile(path.join(ROOT, 'municipalityWebsites.ts'), 'utf8');
  const municipalities = parseWebsiteMap(websiteSource);
  const results = await runPool(municipalities, discoverMunicipality);
  const curatedResults = results.map((row) => {
    const correction = manualCuration[row.key];
    const cleanedName = decodeHtml(row.name).replace(/\s+/g, ' ').trim();
    if (correction?.exclude) {
      return {
        ...row,
        name: '', url: '', score: 0, confidence: 'ei löytynyt', source: '', hits: '',
      };
    }
    return {
      ...row,
      name: correction?.name ?? cleanedName,
      confidence: correction?.promote ? 'korkea' : row.confidence,
    };
  });
  const ordered = [...curatedResults].sort((a, b) => a.municipality.localeCompare(b.municipality, 'fi'));
  const generatedAt = new Date().toLocaleString('fi-FI', {
    timeZone: 'Europe/Helsinki', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const summary = {
    total: ordered.length,
    high: ordered.filter((row) => row.confidence === 'korkea').length,
    medium: ordered.filter((row) => row.confidence === 'keskitaso').length,
    low: ordered.filter((row) => row.confidence === 'matala').length,
    missing: ordered.filter((row) => row.confidence === 'ei löytynyt').length,
  };

  await mkdir(DOCS_DIR, { recursive: true });
  const csvRows = [
    ['Päivitetty', 'Kunta', 'Varmuus', 'Pisteet', 'Nimi', 'URL', 'Kunnan sivu', 'HTTP', 'Löytötapa', 'Osumat'].map(csvEscape).join(','),
    ...ordered.map((row) => [generatedAt, row.municipality, row.confidence, row.score, row.name, row.url, row.baseUrl, row.status, row.source, row.hits].map(csvEscape).join(',')),
  ];
  const markdownRows = [
    '# Kuntien omat seniorisivut', '', `Päivitetty: ${generatedAt}`, '',
    `Tarkistettu: ${summary.total} kuntaa.`,
    `Korkean varmuuden suora seniorisivu löytyi ${summary.high} kunnalle.`,
    `Keskitasoisia ehdokkaita löytyi ${summary.medium}, matalan varmuuden ehdokkaita ${summary.low}.`,
    `Automaattinen kartoitus ei löytänyt ehdokasta ${summary.missing} kunnalle.`, '',
    'Kartoitus tarkistaa kuntien viralliset verkkotunnukset, niiden etusivujen linkit, tavallisimmat seniorisivujen polut ja saatavilla olevat sivukartat. Korkean varmuuden rivit viedään sovellukseen. Muut rivit vaativat käsintarkistuksen; puuttuva osuma ei todista, ettei sivua ole.', '',
    '| Kunta | Varmuus | Linkki | Löytötapa |', '|---|---:|---|---|',
    ...ordered.map((row) => `| ${row.municipality} | ${row.confidence} | ${row.url ? `[${row.name || row.url}](${row.url})` : '-'} | ${row.source || '-'} |`), '',
  ];
  const highConfidenceRows = ordered.filter((row) => row.confidence === 'korkea' && row.url);
  const tsRows = [
    "import { Provider } from './types';", '',
    `// Generated from the official municipality sites on ${new Date().toISOString().slice(0, 10)}.`,
    '// Only high-confidence, municipality-hosted senior landing pages are included.',
    'export const MUNICIPALITY_SENIOR_LINKS: Provider[] = [',
    ...highConfidenceRows.map((row) => `  ${JSON.stringify({
      name: `${row.municipality} – ${row.name}`,
      url: row.url,
      group: 'Oman kunnan senioripalvelut',
      municipality: row.key,
      scope: 'municipality',
      verifiedAt: new Date().toISOString().slice(0, 10),
    }, null, 2).split('\n').join('\n  ')},`),
    '];', '',
  ];

  await Promise.all([
    writeFile(path.join(DOCS_DIR, 'kuntien-seniorisivut.csv'), `${csvRows.join('\n')}\n`, 'utf8'),
    writeFile(path.join(DOCS_DIR, 'kuntien-seniorisivut.md'), `${markdownRows.join('\n')}\n`, 'utf8'),
    writeFile(path.join(ROOT, 'localSeniorLinks.ts'), `${tsRows.join('\n')}\n`, 'utf8'),
  ]);
  console.log(`Valmis. Kuntia: ${summary.total}, korkea: ${summary.high}, keskitaso: ${summary.medium}, matala: ${summary.low}, ei löytynyt: ${summary.missing}.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
