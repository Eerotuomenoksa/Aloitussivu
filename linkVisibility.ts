import { useEffect, useState } from 'react';
import { BLOCKED_LINK_URLS } from './linkHealth';
import { LinkReportEntry, Provider, Shortcut } from './types';

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');
const RUNTIME_BLOCKED_LINKS_KEY = 'blockedLinkUrls';
const LINK_REPORTS_KEY = 'linkReports';
const LINK_HEALTH_CHANGE_EVENT = 'linkhealthchange';

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

const getBlockedUrls = () => {
  const runtimeBlocked = readJsonArray(RUNTIME_BLOCKED_LINKS_KEY) as string[];
  return new Set([...BLOCKED_LINK_URLS, ...runtimeBlocked].map(normalizeUrl));
};

export const isLinkVisible = (url?: string | null) => {
  if (!url) return false;
  return !getBlockedUrls().has(normalizeUrl(url));
};

export const filterVisibleProviders = (providers: Provider[] | undefined) => {
  if (!providers) return providers;
  return providers.filter((provider) => isLinkVisible(provider.url));
};

export const filterVisibleShortcuts = (shortcuts: Shortcut[]) => shortcuts
  .map((shortcut) => {
    if (shortcut.providers) {
      return { ...shortcut, providers: filterVisibleProviders(shortcut.providers) };
    }

    return shortcut;
  })
  .filter((shortcut) => shortcut.providers ? shortcut.providers.length > 0 : isLinkVisible(shortcut.url));

export const reportLink = (entry: LinkReportEntry) => {
  const existingReports = readJsonArray(LINK_REPORTS_KEY) as LinkReportEntry[];
  const nextReports = [entry, ...existingReports].slice(0, 1000);
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LINK_REPORTS_KEY, JSON.stringify(nextReports));
  } catch {
    // Ignore storage errors.
  }
};

export const addBlockedLink = (url: string) => {
  const normalized = normalizeUrl(url);
  const runtimeBlocked = new Set(readJsonArray(RUNTIME_BLOCKED_LINKS_KEY) as string[]);
  runtimeBlocked.add(normalized);
  writeJsonArray(RUNTIME_BLOCKED_LINKS_KEY, [...runtimeBlocked]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LINK_HEALTH_CHANGE_EVENT));
  }
};

export const useLinkVisibilityVersion = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleChange = () => setVersion((current) => current + 1);
    window.addEventListener('storage', handleChange);
    window.addEventListener(LINK_HEALTH_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(LINK_HEALTH_CHANGE_EVENT, handleChange);
    };
  }, []);

  return version;
};
