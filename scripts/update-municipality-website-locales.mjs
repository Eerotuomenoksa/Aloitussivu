import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TIMEOUT_MS = 9_000;
const CONCURRENCY = 10;

const languageLabels = {
  sv: ['svenska', 'ruotsi', 'på svenska'],
  en: ['english', 'englanti', 'in english'],
  uk: ['українська', 'ukrainian', 'ukraina'],
  et: ['eesti', 'estonian', 'viro'],
  ru: ['русский', 'russian', 'venäjä'],
  se: ['davvisámegiella', 'sámegiella', 'sami', 'saame', 'saameksi'],
};

const languagePathHints = {
  sv: ['sv', 'svenska', 'pa-svenska', 'på-svenska'],
  en: ['en', 'english', 'in-english'],
  uk: ['uk', 'ukrainian', 'ukr', 'ukraina'],
  et: ['et', 'eesti', 'estonian'],
  ru: ['ru', 'russian'],
  se: ['se', 'sme', 'saame', 'sami'],
};

const hreflangToLanguage = (value) => {
  const code = value.toLowerCase().split('-')[0];
  if (['sv', 'en', 'uk', 'et', 'ru'].includes(code)) return code;
  if (['se', 'sme', 'smn', 'sms'].includes(code)) return 'se';
  return null;
};

const normalizeText = (value) => value
  .toLocaleLowerCase('fi-FI')
  .normalize('NFKC')
  .replace(/\s+/g, ' ')
  .trim();

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const jsString = (value) => JSON.stringify(value);

const readText = (filePath) => readFile(path.join(ROOT, filePath), 'utf8');

const parseWebsiteMap = (source) => {
  const rows = [];
  const entryPattern = /'([^']+)':\s*'([^']+)'/g;
  let match;
  while ((match = entryPattern.exec(source))) {
    rows.push({ municipalityKey: match[1], baseUrl: match[2] });
  }
  return rows;
};

const withTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'accept': 'text/html,application/xhtml+xml',
        'user-agent': 'SeniorinAloitussivu language-link scanner (+https://github.com/)',
      },
      ...options,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const fetchHtml = async (url) => {
  try {
    const response = await withTimeout(url);
    if (!response.ok) return { html: '', finalUrl: url, status: response.status };
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return { html: '', finalUrl: response.url, status: response.status };
    }
    return { html: await response.text(), finalUrl: response.url, status: response.status };
  } catch (error) {
    return { html: '', finalUrl: url, status: error.name ?? 'error' };
  }
};

const resolveUrl = (href, baseUrl) => {
  if (!href || /^(mailto|tel|javascript):/i.test(href)) return '';
  try {
    const url = new URL(href.replace(/&amp;/g, '&'), baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (/\.(pdf|docx?|xlsx?|pptx?|zip|jpg|jpeg|png|webp|svg)$/i.test(url.pathname)) return '';
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

const extractAttributes = (tag) => {
  const attrs = {};
  const attrPattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = attrPattern.exec(tag))) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
};

const stripTags = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const containsLanguageLabel = (text, label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, 'iu').test(text);
};

const candidateLanguageFromAnchor = (attrs, text, href) => {
  const hreflang = attrs.hreflang ? hreflangToLanguage(attrs.hreflang) : null;
  if (hreflang) return { language: hreflang, score: 100 };

  const lang = attrs.lang ? hreflangToLanguage(attrs.lang) : null;
  if (lang) return { language: lang, score: 80 };

  const normalizedText = normalizeText(`${text} ${attrs['aria-label'] ?? ''} ${attrs.title ?? ''}`);
  for (const [language, labels] of Object.entries(languageLabels)) {
    if (normalizedText.length <= 40 && labels.some((label) => containsLanguageLabel(normalizedText, label))) {
      return { language, score: 70 };
    }
  }

  try {
    const segments = new URL(href).pathname
      .split('/')
      .map((segment) => decodeURIComponent(segment).toLocaleLowerCase('fi-FI'))
      .filter(Boolean);
    const firstSegment = segments[0] ?? '';
    for (const [language, hints] of Object.entries(languagePathHints)) {
      if (hints.includes(firstSegment)) return { language, score: 55 };
    }
  } catch {
    return null;
  }

  return null;
};

const pickBest = (current, next) => {
  if (!current || next.score > current.score) return next;
  if (next.score === current.score && next.url.length < current.url.length) return next;
  return current;
};

const isLikelyLanguageLandingPage = (url, language, score) => {
  try {
    const segments = new URL(url).pathname
      .split('/')
      .map((segment) => decodeURIComponent(segment).toLocaleLowerCase('fi-FI'))
      .filter(Boolean);
    const blockedContentSections = new Set([
      'ajankohtaista',
      'anslagstavla',
      'kalender',
      'meddelanden',
      'news',
      'nyheter',
      'tapahtumat',
      'uutiset',
    ]);
    if (segments.some((segment) => blockedContentSections.has(segment))) return false;
    if (segments.length === 0) return true;
    if (languagePathHints[language]?.includes(segments[0])) return true;
    if (segments.length > 2) return false;
    if (score >= 100) return true;
    return segments.some((segment) => languagePathHints[language]?.some((hint) => segment.includes(hint)));
  } catch {
    return false;
  }
};

const extractLanguageUrls = (html, baseUrl) => {
  const found = {};

  const tagPattern = /<(link|a)\b[^>]*>([\s\S]*?<\/a>)?/gi;
  let match;
  while ((match = tagPattern.exec(html))) {
    const tag = match[0];
    const tagName = match[1].toLowerCase();
    const attrs = extractAttributes(tag);
    const href = resolveUrl(attrs.href, baseUrl);
    if (!href || !sameSite(href, baseUrl)) continue;

    if (tagName === 'link') {
      const rel = normalizeText(attrs.rel ?? '');
      const language = attrs.hreflang ? hreflangToLanguage(attrs.hreflang) : null;
      if (language && rel.includes('alternate') && isLikelyLanguageLandingPage(href, language, 120)) {
        found[language] = pickBest(found[language], { url: href, score: 120, source: 'hreflang' });
      }
      continue;
    }

    const text = stripTags(match[2] ?? '');
    const candidate = candidateLanguageFromAnchor(attrs, text, href);
    if (!candidate) continue;
    if (!isLikelyLanguageLandingPage(href, candidate.language, candidate.score)) continue;
    found[candidate.language] = pickBest(found[candidate.language], {
      url: href,
      score: candidate.score,
      source: attrs.hreflang ? 'anchor-hreflang' : 'anchor',
    });
  }

  return found;
};

const runPool = async (items, worker) => {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });
  await Promise.all(workers);
  return results;
};

const scanMunicipality = async ({ municipalityKey, baseUrl }, index, total) => {
  const { html, finalUrl, status } = await fetchHtml(baseUrl);
  if ((index + 1) % 25 === 0 || index === total - 1) {
    console.log(`Scanned ${index + 1}/${total}`);
  }

  const languageUrls = html ? extractLanguageUrls(html, finalUrl) : {};
  try {
    const final = new URL(finalUrl);
    if (final.hostname.endsWith('.ax')) {
      languageUrls.sv = { url: final.origin + '/', score: 130, source: 'aland-default' };
    }
  } catch {
    // Keep extracted values if final URL is not parseable.
  }
  return {
    municipalityKey,
    baseUrl,
    finalUrl,
    status,
    languageUrls,
  };
};

const writeOutputs = async (results) => {
  const entries = results
    .map((result) => {
      const languages = Object.entries(result.languageUrls)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([language, value]) => `    ${language}: ${jsString(value.url)}`)
        .join(',\n');
      if (!languages) return '';
      return `  ${jsString(result.municipalityKey)}: {\n${languages}\n  }`;
    })
    .filter(Boolean)
    .join(',\n');

  const ts = `// Generated by scripts/update-municipality-website-locales.mjs on ${new Date().toISOString().slice(0, 10)}.\n` +
    `// Keys match normalized Finnish municipality names in municipalityWebsites.ts.\n` +
    `import type { LanguageCode } from './i18n';\n\n` +
    `export const MUNICIPALITY_WEBSITE_LANGUAGE_URLS: Record<string, Partial<Record<LanguageCode, string>>> = {\n${entries}\n};\n`;

  const csvRows = [
    ['kunta', 'perusosoite', 'lopullinen osoite', 'kieli', 'kieliversion osoite', 'lähde', 'tila'],
    ...results.flatMap((result) => {
      const languages = Object.entries(result.languageUrls);
      if (languages.length === 0) {
        return [[result.municipalityKey, result.baseUrl, result.finalUrl, '', '', '', result.status]];
      }
      return languages
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([language, value]) => [
          result.municipalityKey,
          result.baseUrl,
          result.finalUrl,
          language,
          value.url,
          value.source,
          result.status,
        ]);
    }),
  ];

  await mkdir(path.join(ROOT, 'docs'), { recursive: true });
  await writeFile(path.join(ROOT, 'municipalityWebsiteLocales.ts'), ts, 'utf8');
  await writeFile(
    path.join(ROOT, 'docs', 'kuntien-kieliversiot.csv'),
    csvRows.map((row) => row.map(csvEscape).join(',')).join('\n'),
    'utf8'
  );
};

const main = async () => {
  const websites = parseWebsiteMap(await readText('municipalityWebsites.ts'));
  const results = await runPool(websites, (item, index) => scanMunicipality(item, index, websites.length));
  await writeOutputs(results);

  const counts = results.reduce((acc, result) => {
    for (const language of Object.keys(result.languageUrls)) {
      acc[language] = (acc[language] ?? 0) + 1;
    }
    return acc;
  }, {});
  console.log(`Wrote municipalityWebsiteLocales.ts and docs/kuntien-kieliversiot.csv`);
  console.log(JSON.stringify(counts, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
