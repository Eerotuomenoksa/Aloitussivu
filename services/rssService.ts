import { LocalNewsHeadline, RssFeedConfig } from '../types';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const decodeText = (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value.trim();
};

const fetchFeedText = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.ok) return response.text();
  } catch {
    // Some RSS feeds do not allow browser-origin requests; the proxy keeps this client-only app usable.
  }

  const proxied = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
  if (!proxied.ok) throw new Error('RSS-syötettä ei voitu hakea.');
  return proxied.text();
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

export const fetchLocalNewsHeadlines = async (feeds: RssFeedConfig[], limit = 3): Promise<LocalNewsHeadline[]> => {
  const headlines: LocalNewsHeadline[] = [];

  for (const feed of feeds) {
    try {
      const xml = await fetchFeedText(feed.url);
      headlines.push(...parseFeed(xml, feed.name));
    } catch {
      // Continue with the next feed; one broken municipal RSS should not hide other local headlines.
    }

    if (headlines.length >= limit) break;
  }

  return headlines
    .filter((headline, index, all) => all.findIndex((item) => item.link === headline.link) === index)
    .slice(0, limit);
};
