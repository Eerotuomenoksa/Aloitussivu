import { LocalNewsHeadline, RssFeedConfig } from '../types';

interface Rss2JsonItem {
  title?: string;
  link?: string;
  pubDate?: string;
  author?: string;
}

interface Rss2JsonResponse {
  status?: string;
  feed?: {
    title?: string;
  };
  items?: Rss2JsonItem[];
}

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

const decodeText = (value: string) => {
  const decoded = value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (entity) => HTML_ENTITIES[entity] ?? entity);
  return decoded.trim();
};

const withFeedMetadata = (headline: LocalNewsHeadline, feed: RssFeedConfig): LocalNewsHeadline => ({
  ...headline,
  sourceType: feed.sourceType,
  sourcePriority: feed.sourcePriority,
  sourceKey: feed.sourceKey ?? feed.url,
});

const fetchDirectFeed = async (feed: RssFeedConfig) => {
  const response = await fetch(feed.url);
  if (!response.ok) throw new Error('RSS-syötettä ei voitu hakea.');
  const xml = await response.text();
  return parseFeed(xml, feed).map((headline) => withFeedMetadata(headline, feed));
};

const fetchRss2JsonFeed = async (feed: RssFeedConfig) => {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('RSS-to-JSON-haku epäonnistui.');

  const data = await response.json() as Rss2JsonResponse;
  if (data.status !== 'ok' || !data.items) throw new Error('RSS-to-JSON-vastaus ei sisältänyt uutisia.');

  const source = data.feed?.title || feed.name;
  return data.items.map((item) => ({
    title: decodeText(item.title ?? ''),
    link: item.link ?? '',
    source,
    publishedAt: item.pubDate,
  })).filter((headline) => headline.title && headline.link)
    .map((headline) => withFeedMetadata(headline, feed));
};

const fetchTextWithCorsFallback = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Sivua ei voitu hakea.');
    return response.text();
  } catch {
    const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) throw new Error('Sivun CORS-välitys epäonnistui.');
    return response.text();
  }
};

const toAbsoluteUrl = (url: string, baseUrl: string) => {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
};

const parseFinnishPublishedAt = (value: string) => {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!match) return '';

  const [, day, month, year, hour = '0', minute = '0'] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  ).toISOString();
};

const isLikelyNewsLink = (headline: LocalNewsHeadline, feed: RssFeedConfig) => {
  const title = headline.title.toLocaleLowerCase('fi-FI');
  if (!headline.title || !headline.link || headline.title.length < 12) return false;
  if (title.includes('image:') || title.includes('kuva:')) return false;
  if (/^(kirjaudu|tilaa|mainos|asiakaspalvelu|näytä lisää|lue lisää)$/i.test(headline.title)) return false;

  let url: URL;
  try {
    url = new URL(headline.link);
  } catch {
    return false;
  }

  const path = url.pathname.toLocaleLowerCase('fi-FI');
  if (path.endsWith('/fi/uutiset') || path.endsWith('/uutiset') || path.endsWith('/nyheter')) return false;
  if (path.includes('/uutiset/') || path.includes('/nyheter/') || path.includes('/ajankohtaista/') || path.includes('/tiedotteet/')) return true;
  if (feed.sourceType === 'yle' && url.hostname.includes('yle.fi') && path.startsWith('/a/')) return true;
  if (['regional-newspaper', 'regional-news', 'national-newspaper'].includes(feed.sourceType ?? '')) {
    return /\/(art-|paikalliset|maakunta|lappi|satakunta|pirkanmaa|savo|karjala|kainuu|oulu|turku|tampere|helsinki|kymenlaakso|hame|häme)\b/.test(path);
  }

  return false;
};

const fetchHtmlNewsPage = async (feed: RssFeedConfig) => {
  const html = await fetchTextWithCorsFallback(feed.url);
  const doc = new DOMParser().parseFromString(html, 'text/html');

  return Array.from(doc.querySelectorAll('a[href]'))
    .map((link): LocalNewsHeadline => {
      const href = link.getAttribute('href') ?? '';
      const title = decodeText(link.textContent ?? '').replace(/\s+/g, ' ');
      const container = link.closest('li, article, div, section') ?? link.parentElement;
      const publishedText = container?.textContent?.match(/Julkaistu\s+\d{1,2}\.\d{1,2}\.\d{4}(?:\s+\d{1,2}:\d{2})?/)?.[0] ?? '';

      return {
        title,
        link: toAbsoluteUrl(href, feed.url),
        source: feed.name,
        publishedAt: parseFinnishPublishedAt(publishedText),
      };
    })
    .filter((headline) => isLikelyNewsLink(headline, feed))
    .map((headline) => withFeedMetadata(headline, feed));
};

const readFirstText = (element: Element, selectors: string[]) => {
  for (const selector of selectors) {
    const match = element.querySelector(selector);
    const text = match?.textContent?.trim();
    if (text) return decodeText(text);
  }
  return '';
};

const readFirstLink = (element: Element) => {
  const atomLink = element.querySelector('link[href]')?.getAttribute('href');
  if (atomLink) return atomLink;

  const rssLink = element.querySelector('link')?.textContent?.trim();
  return rssLink || '';
};

const parseFeed = (xml: string, feed: RssFeedConfig): LocalNewsHeadline[] => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) throw new Error('RSS-syöte ei ollut luettavassa muodossa.');

  const items = Array.from(doc.querySelectorAll('item, entry'));
  return items.map((item) => ({
    title: readFirstText(item, ['title']),
    link: readFirstLink(item),
    source: feed.name,
    publishedAt: readFirstText(item, ['pubDate', 'published', 'updated']),
  })).filter((headline) => headline.title && headline.link);
};

const fetchOneFeed = async (feed: RssFeedConfig) => {
  try {
    return await fetchDirectFeed(feed);
  } catch {
    try {
      return await fetchRss2JsonFeed(feed);
    } catch {
      return fetchHtmlNewsPage(feed);
    }
  }
};

const getPublishedAtTime = (value?: string) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
};

const getHeadlineSourceKey = (headline: LocalNewsHeadline) => (
  headline.sourceKey ?? headline.source
);

const getHeadlineLane = (headline: LocalNewsHeadline) => {
  if (['local-newspaper', 'regional-newspaper', 'regional-news', 'national-newspaper'].includes(headline.sourceType ?? '')) {
    return 'journalistic';
  }
  if (['municipality', 'yle'].includes(headline.sourceType ?? '')) {
    return 'municipality';
  }
  if (headline.sourceType === 'wellbeing-area') {
    return 'wellbeing-area';
  }
  return headline.sourceKey ? `source:${headline.sourceKey}` : '';
};

const selectDistinctHeadlines = (headlines: LocalNewsHeadline[], limit: number) => {
  const uniqueHeadlines = headlines
    .filter((headline, index, all) => all.findIndex((item) => item.link === headline.link) === index)
    .sort((a, b) => {
      const priorityDiff = (a.sourcePriority ?? 100) - (b.sourcePriority ?? 100);
      if (priorityDiff !== 0) return priorityDiff;
      return getPublishedAtTime(b.publishedAt) - getPublishedAtTime(a.publishedAt);
    });
  const selected: LocalNewsHeadline[] = [];
  const usedLanes = new Set<string>();
  const usedSources = new Set<string>();

  for (const headline of uniqueHeadlines) {
    const sourceKey = getHeadlineSourceKey(headline);
    const lane = getHeadlineLane(headline);
    if (sourceKey && usedSources.has(sourceKey)) continue;
    if (lane && usedLanes.has(lane)) continue;

    selected.push(headline);
    if (sourceKey) usedSources.add(sourceKey);
    if (lane) usedLanes.add(lane);
    if (selected.length >= limit) return selected;
  }

  for (const headline of uniqueHeadlines) {
    const sourceKey = getHeadlineSourceKey(headline);
    if (sourceKey && usedSources.has(sourceKey)) continue;

    selected.push(headline);
    if (sourceKey) usedSources.add(sourceKey);
    if (selected.length >= limit) return selected;
  }

  return selected;
};

export const fetchLocalNewsHeadlines = async (feeds: RssFeedConfig[], limit = 3): Promise<LocalNewsHeadline[]> => {
  const headlines: LocalNewsHeadline[] = [];

  for (const feed of feeds) {
    try {
      headlines.push(...await fetchOneFeed(feed));
    } catch {
      // Continue with the next feed; one broken municipal RSS should not hide other local headlines.
    }
  }

  return selectDistinctHeadlines(headlines, limit);
};
