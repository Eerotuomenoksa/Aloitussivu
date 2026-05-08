import { GoogleGenAI } from '@google/genai';
import { XMLParser } from 'fast-xml-parser';
import { HTMLElement, parse } from 'node-html-parser';

export interface NcscScamItem {
  heading: string;
  bodyText: string;
  sourceWeek: string;
  sourceUrl: string;
  publishedAt: string;
}

export type NcscStructureVersion = '2026' | '2025' | 'news' | 'unknown';

export interface NcscScrapeResult {
  url: string;
  weekLabel: string;
  publishedAt: string;
  scamItems: NcscScamItem[];
  structureVersion: NcscStructureVersion;
}

export interface NcscFeedTarget {
  url: string;
  title: string;
  publishedAt?: string;
  kind: 'review' | 'news';
}

type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  'content:encoded'?: string;
};

type RssFeed = {
  rss?: {
    channel?: {
      item?: FeedItem | FeedItem[];
    };
  };
};

type SimplifiedScam = {
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'danger';
};

const RSS_URL = 'https://www.kyberturvallisuuskeskus.fi/feed/rss/fi';
const USER_AGENT = 'Mozilla/5.0 (compatible; SeniorSurf-bot/1.0)';
const REVIEW_TITLE = 'viikkokatsaus';
const SCAM_SECTION_HEADING = 'Ajankohtaiset huijaukset';
const MODEL = 'gemini-3-flash-preview';
const NEWS_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_NEWS_TARGETS = 5;

const CONSUMER_KEYWORDS = [
  'huijaus',
  'kalastelu',
  'tietojenkalastelu',
  'petos',
  'tekstiviesti',
  'huijausviesti',
  'huijaussoitto',
  'huijauspuhelu',
  'verkkokauppa',
  'pankkitunnus',
  'maksukortti',
  'varaus',
  'booking',
  'nimissä',
  'pikaviesti',
  'whatsapp',
  'telegram',
  'signal',
  'tilikaappaus',
  'tilin kaappaus',
  'kaappaus',
  'rikollis',
  'suojautumiskeino',
];

const TECHNICAL_KEYWORDS = [
  'haavoittuvuus',
  'direktiivi',
  'nis2',
  'cve',
  'palvelunesto',
  'organisaatio',
  'webinaari',
  'seminaari',
  'kvantti',
  'rekisteri',
];

const cleanText = (value: string, maxLength = 800) => {
  const cleaned = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 3).trim()}...` : cleaned;
};

const normalizeText = (value: string) => cleanText(value, Number.MAX_SAFE_INTEGER).toLocaleLowerCase('fi-FI');

const getElementText = (element: HTMLElement) => cleanText(element.textContent ?? '', Number.MAX_SAFE_INTEGER);

const getTagName = (element: HTMLElement) => element.tagName.toLocaleLowerCase('fi-FI');

const hasKeyword = (value: string, keywords: string[]) => {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(keyword));
};

const ensureArray = <T,>(value: T | T[] | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const sortByDateDesc = (items: FeedItem[]) => [...items].sort((a, b) => {
  const aTime = a.pubDate ? Date.parse(a.pubDate) : 0;
  const bTime = b.pubDate ? Date.parse(b.pubDate) : 0;
  return bTime - aTime;
});

const getFeedPublishedAt = (item: FeedItem) => {
  if (!item.pubDate) return undefined;
  const time = Date.parse(item.pubDate);
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
};

const isRecentFeedItem = (item: FeedItem) => {
  if (!item.pubDate) return true;
  const publishedAt = Date.parse(item.pubDate);
  return Number.isFinite(publishedAt) && Date.now() - publishedAt <= NEWS_LOOKBACK_MS;
};

const getFeedSearchText = (item: FeedItem) => [
  item.title ?? '',
  item.description ?? '',
  item['content:encoded'] ?? '',
].join(' ');

const isReviewFeedItem = (item: FeedItem) => (
  Boolean(item.link) && item.title?.toLocaleLowerCase('fi-FI').includes(REVIEW_TITLE)
);

const isRelevantNewsFeedItem = (item: FeedItem) => {
  if (!item.link || isReviewFeedItem(item) || !isRecentFeedItem(item)) return false;
  const text = getFeedSearchText(item);
  return hasKeyword(text, CONSUMER_KEYWORDS) && !hasKeyword(text, TECHNICAL_KEYWORDS);
};

const toFeedTarget = (item: FeedItem, kind: NcscFeedTarget['kind']): NcscFeedTarget | null => {
  const url = item.link?.trim();
  if (!url) return null;
  return {
    url,
    title: cleanText(item.title ?? url, 180),
    publishedAt: getFeedPublishedAt(item),
    kind,
  };
};

const uniqueTargets = (targets: NcscFeedTarget[]) => {
  const seen = new Set<string>();
  return targets.filter((target) => {
    if (seen.has(target.url)) return false;
    seen.add(target.url);
    return true;
  });
};

const switchReviewUrlPath = (url: string) => {
  if (url.includes('/ajankohtaista/')) return url.replace('/ajankohtaista/', '/uutiset/');
  if (url.includes('/uutiset/')) return url.replace('/uutiset/', '/ajankohtaista/');
  return null;
};

const dateFromIsoWeek = (weekLabel: string) => {
  const match = weekLabel.match(/^(\d{1,2})\/(\d{4})$/);
  if (!match) return new Date().toISOString();

  const week = Number(match[1]);
  const year = Number(match[2]);
  const fourthOfJanuary = new Date(Date.UTC(year, 0, 4));
  const day = fourthOfJanuary.getUTCDay() || 7;
  const monday = new Date(fourthOfJanuary);
  monday.setUTCDate(fourthOfJanuary.getUTCDate() - day + 1 + (week - 1) * 7);
  const date = monday.toISOString().slice(0, 10);
  return `${date}T00:00:00+02:00`;
};

const extractWeekLabel = (root: HTMLElement) => {
  const h1Text = getElementText(root.querySelector('h1') ?? root);
  const match = h1Text.match(/(\d{1,2}\/\d{4})/);
  return match?.[1] ?? '';
};

const extractPublishedAt = (root: HTMLElement, weekLabel: string) => {
  const timeElement = root.querySelector('time');
  const datetime = timeElement?.getAttribute('datetime')?.trim();
  if (datetime) return datetime;
  return dateFromIsoWeek(weekLabel);
};

const extractNewsPublishedAt = (root: HTMLElement, fallbackPublishedAt?: string) => {
  const timeElement = root.querySelector('time');
  const datetime = timeElement?.getAttribute('datetime')?.trim();
  return datetime || fallbackPublishedAt || new Date().toISOString();
};

const toScamItem = (
  heading: string,
  bodyText: string,
  sourceWeek: string,
  sourceUrl: string,
  publishedAt: string
): NcscScamItem => ({
  heading: cleanText(heading, 160),
  bodyText: cleanText(bodyText),
  sourceWeek,
  sourceUrl,
  publishedAt,
});

const parseJsonObject = (value: string): SimplifiedScam | null => {
  const match = value.match(/\{[\s\S]*\}/);
  if (!match) return null;

  const parsed = JSON.parse(match[0]) as Partial<SimplifiedScam>;
  if (
    typeof parsed.title === 'string'
    && typeof parsed.body === 'string'
    && (parsed.severity === 'info' || parsed.severity === 'warning' || parsed.severity === 'danger')
  ) {
    return {
      title: parsed.title,
      body: parsed.body,
      severity: parsed.severity,
    };
  }

  return null;
};

export async function fetchLatestNcscReviewUrl(): Promise<string | null> {
  const response = await fetch(RSS_URL, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`NCSC RSS fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const feed = parser.parse(xml) as RssFeed;
  const items = ensureArray(feed.rss?.channel?.item);
  const latest = sortByDateDesc(items).find((item) => (
    item.title?.toLocaleLowerCase('fi-FI').includes(REVIEW_TITLE) && item.link
  ));

  return latest?.link?.trim() ?? null;
}

export async function fetchNcscFeedTargets(): Promise<NcscFeedTarget[]> {
  const response = await fetch(RSS_URL, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`NCSC RSS fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const feed = parser.parse(xml) as RssFeed;
  const items = sortByDateDesc(ensureArray(feed.rss?.channel?.item));
  const reviewTarget = toFeedTarget(items.find(isReviewFeedItem) ?? {}, 'review');
  const newsTargets = items
    .filter(isRelevantNewsFeedItem)
    .slice(0, MAX_NEWS_TARGETS)
    .map((item) => toFeedTarget(item, 'news'))
    .filter((target): target is NcscFeedTarget => Boolean(target));

  return uniqueTargets([
    ...(reviewTarget ? [reviewTarget] : []),
    ...newsTargets,
  ]);
}

export async function fetchPageHtml(url: string): Promise<string> {
  const requestPage = async (targetUrl: string) => fetch(targetUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });

  let response = await requestPage(url);
  if (response.status === 404) {
    const alternateUrl = switchReviewUrlPath(url);
    if (alternateUrl) {
      response = await requestPage(alternateUrl);
    }
  }

  if (!response.ok) {
    throw new Error(`NCSC page fetch failed: ${response.status} ${response.url}`);
  }

  return response.text();
}

export async function parseNcscReview(html: string, url: string): Promise<NcscScrapeResult> {
  const root = parse(html);
  const weekLabel = extractWeekLabel(root);
  const publishedAt = extractPublishedAt(root, weekLabel);
  const elements = root.querySelectorAll('h2,h3,p,li');
  const h2Indexes = elements
    .map((element, index) => ({ element, index }))
    .filter(({ element }) => getTagName(element) === 'h2' && getElementText(element) === SCAM_SECTION_HEADING);

  if (h2Indexes.length >= 2) {
    const startIndex = h2Indexes[h2Indexes.length - 1].index;
    const h3Indexes = elements
      .map((element, index) => ({ element, index }))
      .filter(({ element, index }) => index > startIndex && getTagName(element) === 'h3')
      .filter(({ index }) => !elements.slice(startIndex + 1, index).some((element) => getTagName(element) === 'h2'));

    const scamItems = h3Indexes
      .map(({ element, index }, itemIndex) => {
        const nextIndex = h3Indexes[itemIndex + 1]?.index
          ?? elements.findIndex((candidate, candidateIndex) => candidateIndex > index && getTagName(candidate) === 'h2');
        const endIndex = nextIndex === -1 ? elements.length : nextIndex;
        const bodyText = elements
          .slice(index + 1, endIndex)
          .filter((candidate) => ['p', 'li'].includes(getTagName(candidate)))
          .map(getElementText)
          .join(' ');

        return toScamItem(getElementText(element), bodyText, weekLabel, url, publishedAt);
      })
      .filter((item) => item.heading && item.bodyText);

    if (scamItems.length > 0) {
      return { url, weekLabel, publishedAt, scamItems, structureVersion: '2026' };
    }
  }

  const allH2Indexes = elements
    .map((element, index) => ({ element, index }))
    .filter(({ element }) => getTagName(element) === 'h2');
  const fallbackItems = allH2Indexes
    .filter(({ element }) => {
      const heading = getElementText(element);
      return hasKeyword(heading, CONSUMER_KEYWORDS) && !hasKeyword(heading, TECHNICAL_KEYWORDS);
    })
    .map(({ element, index }) => {
      const endIndex = elements.findIndex((candidate, candidateIndex) => (
        candidateIndex > index && getTagName(candidate) === 'h2'
      ));
      const normalizedEndIndex = endIndex === -1 ? elements.length : endIndex;
      const bodyText = elements
        .slice(index + 1, normalizedEndIndex)
        .filter((candidate) => ['p', 'li'].includes(getTagName(candidate)))
        .map(getElementText)
        .join(' ');

      return toScamItem(getElementText(element), bodyText, weekLabel, url, publishedAt);
    })
    .filter((item) => item.heading && item.bodyText);

  if (fallbackItems.length > 0) {
    return { url, weekLabel, publishedAt, scamItems: fallbackItems, structureVersion: '2025' };
  }

  return { url, weekLabel, publishedAt, scamItems: [], structureVersion: 'unknown' };
}

export async function parseNcscNews(
  html: string,
  url: string,
  fallbackTitle = '',
  fallbackPublishedAt?: string
): Promise<NcscScrapeResult> {
  const root = parse(html);
  const contentRoot = root.querySelector('article') ?? root.querySelector('main') ?? root;
  const heading = getElementText(root.querySelector('h1') ?? contentRoot) || fallbackTitle;
  const publishedAt = extractNewsPublishedAt(root, fallbackPublishedAt);
  const bodyText = contentRoot
    .querySelectorAll('p,li')
    .map(getElementText)
    .filter((text) => text.length > 20)
    .join(' ');
  const searchableText = `${heading} ${bodyText}`;

  if (!heading || !bodyText || !hasKeyword(searchableText, CONSUMER_KEYWORDS) || hasKeyword(heading, TECHNICAL_KEYWORDS)) {
    return { url, weekLabel: 'Uutinen', publishedAt, scamItems: [], structureVersion: 'unknown' };
  }

  return {
    url,
    weekLabel: 'Uutinen',
    publishedAt,
    scamItems: [toScamItem(heading, bodyText, 'Uutinen', url, publishedAt)],
    structureVersion: 'news',
  };
}

export async function simplifyForSeniors(item: NcscScamItem): Promise<SimplifiedScam> {
  const fallback: SimplifiedScam = {
    title: item.heading.slice(0, 80),
    body: item.bodyText.slice(0, 300),
    severity: 'warning',
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') return fallback;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: 'user',
        parts: [{
          text: `Muuta tämä teksti selkeäksi huijausvaroitukseksi ikääntyneille.
Alkuperäinen otsikko: ${item.heading}
Teksti: ${item.bodyText}
Vastaa VAIN tässä JSON-muodossa, ei muuta tekstiä:
{
"title": "lyhyt otsikko max 10 sanaa",
"body": "2-3 lausetta selkeällä suomella. Kerro mitä huijaus on ja miten välttyä.",
"severity": "info" tai "warning" tai "danger"
}
Käytä severity-arvoa:

"danger" jos huijaus pyytää pankkitunnuksia, maksuja tai henkilötietoja
"warning" jos huijaus voi johtaa vahinkoon mutta ei välittömästi
"info" jos kyse on yleisestä varoituksesta tai tiedotteesta`,
        }],
      }],
      config: {
        systemInstruction: 'Olet asiantuntija, joka muuttaa tietoturvatiedotteet selkeäksi suomeksi ikääntyneille (65+). Kirjoitat lyhyillä lauseilla. Et käytä sanoja: kyberturvallisuus, tietoturva, haavoittuvuus, direktiivi, organisaatio, infrastruktuuri. Käytät arkisia sanoja: huijaus, huijari, viesti, linkki, pankki, puhelu.',
        temperature: 0.2,
        maxOutputTokens: 300,
      },
    });

    return parseJsonObject(response.text ?? '') ?? fallback;
  } catch (error) {
    console.error('NCSC Gemini simplification failed:', error);
    return fallback;
  }
}
