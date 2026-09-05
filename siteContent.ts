import { useEffect, useState } from 'react';
import { getDataProvider } from './services/data';

export const SITE_CONTENT_LOCALES = ['fi', 'sv', 'en', 'se', 'uk', 'et', 'ru'] as const;
export type SiteContentLocale = typeof SITE_CONTENT_LOCALES[number];

export const isSiteContentLocale = (value: string): value is SiteContentLocale => (
  SITE_CONTENT_LOCALES.includes(value as SiteContentLocale)
);

export type SiteContentEntry = {
  key: string;
  locale: SiteContentLocale;
  value: string;
  updatedAt: string;
};

const STORAGE_KEY = 'siteContent';
const CHANGE_EVENT = 'sitecontentchange';

const readCache = (): SiteContentEntry[] => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let contentCache = readCache();

const writeCache = (entries: SiteContentEntry[]) => {
  contentCache = entries.filter((entry) => entry.value !== '');
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contentCache));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  } catch {
    // Sisältö toimii myös ilman selaimen paikallista välimuistia.
  }
};

export const getSiteContentEntries = () => contentCache;

export const getSiteContentValue = (
  key: string,
  locale: SiteContentLocale,
  fallback = '',
) => contentCache.find((entry) => entry.key === key && entry.locale === locale)?.value || fallback;

export const refreshSiteContent = async (admin = false) => {
  const provider = await getDataProvider();
  const entries = admin
    ? await provider.listAdmin<SiteContentEntry[]>('site-content')
    : await provider.listPublic<SiteContentEntry>('site-content', { fresh: true });
  writeCache(entries);
  return entries;
};

export const saveSiteContent = async (key: string, locale: SiteContentLocale, value: string) => {
  const provider = await getDataProvider();
  const receipt = await provider.updateAdmin('site-content', key, { locale, value });
  const next = contentCache.filter((entry) => !(entry.key === key && entry.locale === locale));
  if (value !== '') {
    next.push({ key, locale, value, updatedAt: receipt.updatedAt ?? new Date().toISOString() });
  }
  writeCache(next);
  return receipt;
};

let remoteSyncActive = false;

export const subscribeSiteContent = (callback: (entries: SiteContentEntry[]) => void) => {
  const handleChange = () => callback(getSiteContentEntries());
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    contentCache = readCache();
    callback(getSiteContentEntries());
  };

  callback(getSiteContentEntries());
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);
  if (!remoteSyncActive) {
    remoteSyncActive = true;
    void refreshSiteContent().catch(() => undefined).finally(() => {
      remoteSyncActive = false;
    });
  }

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
};

export const useSiteContentVersion = () => {
  const [, setVersion] = useState(0);
  useEffect(() => subscribeSiteContent(() => setVersion((current) => current + 1)), []);
};
