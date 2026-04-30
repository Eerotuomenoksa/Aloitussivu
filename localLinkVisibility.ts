import { useEffect, useState } from 'react';
import { Provider } from './types';

const LOCAL_HIDDEN_LINKS_KEY = 'hiddenLocalLinkUrls';
const LOCAL_LINK_VISIBILITY_CHANGE_EVENT = 'locallinkvisibilitychange';

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');

const readJsonArray = (key: string) => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeJsonArray = (key: string, value: string[]) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
};

const getHiddenUrls = () => new Set((readJsonArray(LOCAL_HIDDEN_LINKS_KEY) as string[]).map(normalizeUrl));

export const isLocalLinkVisible = (url?: string | null) => {
  if (!url) return false;
  return !getHiddenUrls().has(normalizeUrl(url));
};

export const filterVisibleLocalProviders = (providers: Provider[] | undefined) => {
  if (!providers) return providers;
  return providers.filter((provider) => isLocalLinkVisible(provider.url));
};

export const hideLocalLink = (url: string) => {
  const normalized = normalizeUrl(url);
  const hiddenUrls = new Set(readJsonArray(LOCAL_HIDDEN_LINKS_KEY) as string[]);
  hiddenUrls.add(normalized);
  writeJsonArray(LOCAL_HIDDEN_LINKS_KEY, [...hiddenUrls]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LOCAL_LINK_VISIBILITY_CHANGE_EVENT));
  }
};

export const useLocalLinkVisibilityVersion = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleChange = () => setVersion((current) => current + 1);
    window.addEventListener('storage', handleChange);
    window.addEventListener(LOCAL_LINK_VISIBILITY_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(LOCAL_LINK_VISIBILITY_CHANGE_EVENT, handleChange);
    };
  }, []);

  return version;
};
