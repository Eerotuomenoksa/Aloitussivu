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

const decodeText = (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value.trim();
};

const fetchDirectFeed = async (feed: RssFeedConfig) => {
  const response = await fetch(feed.url);
  if (!response.ok) throw new Error('RSS-syötettä ei voitu hakea.');
  const xml = await response.text();
  return parseFeed(xml, feed.name);
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
  })).filter((headline) => headline.title && headline.link);
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

const parseFeed = (xml: string, source: string): LocalNewsHeadline[] => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) throw new Error('RSS-syöte ei ollut luettavassa muodossa.');

  const items = Array.from(doc.querySelectorAll('item, entry'));
  return items.map((item) => ({
    title: readFirstText(item, ['title']),
    link: readFirstLink(item),
    source,
    publishedAt: readFirstText(item, ['pubDate', 'published', 'updated']),
  })).filter((headline) => headline.title && headline.link);
};

const fetchOneFeed = async (feed: RssFeedConfig) => {
  try {
    return await fetchDirectFeed(feed);
  } catch {
    return fetchRss2JsonFeed(feed);
  }
};

const getPublishedAtTime = (value?: string) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
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

  return headlines
    .filter((headline, index, all) => all.findIndex((item) => item.link === headline.link) === index)
    .sort((a, b) => getPublishedAtTime(b.publishedAt) - getPublishedAtTime(a.publishedAt))
    .slice(0, limit);
};
