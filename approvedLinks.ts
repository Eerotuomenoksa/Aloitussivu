import { useEffect, useState } from 'react';
import { getDataProvider } from './services/data';
import { LocalityInfo, Provider, Shortcut } from './types';

export interface ApprovedLinkSuggestion {
  id: string;
  name: string;
  url: string;
  replacesUrl?: string;
  category: string;
  municipality?: string;
  source: string;
  createdAt: string;
  note?: string;
}

const APPROVED_LINKS_KEY = 'approvedLinkSuggestions';
const APPROVED_LINKS_CHANGE_EVENT = 'approvedlinkchange';

const normalizeText = (value: string) => value.trim().toLocaleLowerCase('fi-FI').replace(/\s+/g, ' ');
const normalizeUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    parsed.protocol = 'https:';
    parsed.hostname = parsed.hostname.replace(/^www\./, '');
    parsed.hash = '';
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return url.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '').toLocaleLowerCase('fi-FI');
  }
};

const normalizeKnownApprovedLink = (link: ApprovedLinkSuggestion): ApprovedLinkSuggestion => (
  normalizeText(link.name) === 'blusky' && normalizeUrl(link.url) === normalizeUrl('https://bsky.social')
    ? { ...link, name: 'Bluesky' }
    : link
);

const readJsonArray = <T,>(key: string): T[] => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
};

const writeJsonArray = <T,>(key: string, value: T[]) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
};

let approvedLinksCache = readJsonArray<ApprovedLinkSuggestion>(APPROVED_LINKS_KEY).map(normalizeKnownApprovedLink);

const emitApprovedLinksChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(APPROVED_LINKS_CHANGE_EVENT));
  }
};

const setApprovedLinksCache = (links: ApprovedLinkSuggestion[]) => {
  approvedLinksCache = links.map(normalizeKnownApprovedLink);
  writeJsonArray(APPROVED_LINKS_KEY, approvedLinksCache);
  emitApprovedLinksChange();
};

export const getApprovedLinkSuggestions = () => approvedLinksCache;

export const refreshApprovedLinkSuggestions = async () => {
  const provider = await getDataProvider();
  const links = await provider.listPublic<ApprovedLinkSuggestion>('approved-links', { fresh: true });
  setApprovedLinksCache(links);
  return links;
};

const startApprovedLinksRemoteSync = () => {
  let cancelled = false;
  void getDataProvider()
    .then((provider) => provider.listPublic<ApprovedLinkSuggestion>('approved-links'))
    .then((links) => {
      if (!cancelled) setApprovedLinksCache(links);
    })
    .catch(() => {
      // Säilytä viimeisin paikallinen välimuisti verkkovirheessä.
    });

  return () => {
    cancelled = true;
  };
};

let approvedLinksSubscriberCount = 0;
let stopApprovedLinksRemoteSync: (() => void) | null = null;

export const subscribeApprovedLinkSuggestions = (callback: (links: ApprovedLinkSuggestion[]) => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== APPROVED_LINKS_KEY) return;
    approvedLinksCache = readJsonArray<ApprovedLinkSuggestion>(APPROVED_LINKS_KEY).map(normalizeKnownApprovedLink);
    callback(getApprovedLinkSuggestions());
  };
  const handleChange = () => callback(getApprovedLinkSuggestions());

  callback(getApprovedLinkSuggestions());
  window.addEventListener('storage', handleStorage);
  window.addEventListener(APPROVED_LINKS_CHANGE_EVENT, handleChange);

  approvedLinksSubscriberCount += 1;
  if (approvedLinksSubscriberCount === 1) {
    stopApprovedLinksRemoteSync = startApprovedLinksRemoteSync();
  }

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(APPROVED_LINKS_CHANGE_EVENT, handleChange);
    approvedLinksSubscriberCount = Math.max(0, approvedLinksSubscriberCount - 1);
    if (approvedLinksSubscriberCount === 0) {
      stopApprovedLinksRemoteSync?.();
      stopApprovedLinksRemoteSync = null;
    }
  };
};

export const approveLinkSuggestion = async (suggestion: Omit<ApprovedLinkSuggestion, 'id' | 'createdAt'> & Partial<Pick<ApprovedLinkSuggestion, 'id' | 'createdAt'>>) => {
  const id = suggestion.id ?? crypto.randomUUID();
  const source = suggestion.source.trim() || 'Ylläpito';
  const provider = await getDataProvider();
  const receipt = await provider.createAdmin('approved-links', {
    id,
    name: suggestion.name.trim(),
    url: suggestion.url.trim(),
    category: suggestion.category.trim(),
    municipality: suggestion.municipality?.trim() || '',
    source,
    note: suggestion.note?.trim() || '',
  });
  const next: ApprovedLinkSuggestion = {
    id,
    createdAt: receipt.createdAt ?? suggestion.createdAt ?? new Date().toISOString(),
    name: suggestion.name.trim(),
    url: suggestion.url.trim(),
    category: suggestion.category.trim(),
    municipality: suggestion.municipality?.trim() || '',
    source,
    note: suggestion.note?.trim() || '',
  };

  const existing = getApprovedLinkSuggestions();
  const normalizedNextUrl = normalizeUrl(next.url);
  const merged = [
    next,
    ...existing.filter((item) => item.id !== next.id && normalizeUrl(item.url) !== normalizedNextUrl),
  ];

  setApprovedLinksCache(merged);
  void provider.listPublic<ApprovedLinkSuggestion>('approved-links', { fresh: true })
    .then(setApprovedLinksCache)
    .catch(() => {});
  return next;
};

export const removeApprovedLinkSuggestion = async (id: string) => {
  const next = getApprovedLinkSuggestions().filter((item) => item.id !== id);
  const provider = await getDataProvider();
  await provider.deleteAdmin('approved-links', id);
  setApprovedLinksCache(next);
  void provider.listPublic<ApprovedLinkSuggestion>('approved-links', { fresh: true })
    .then(setApprovedLinksCache)
    .catch(() => {});
};

export const useApprovedLinkSuggestionsVersion = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    return subscribeApprovedLinkSuggestions(() => {
      setVersion((current) => current + 1);
    });
  }, []);

  return version;
};

const appliesToProvider = (link: ApprovedLinkSuggestion, provider: Provider) => (
  !link.municipality
  || normalizeText(link.municipality) === normalizeText(provider.municipality ?? provider.sourceMunicipality ?? '')
);

export const resolveApprovedProvider = <T extends Provider>(provider: T): T => {
  const providerUrl = normalizeUrl(provider.url);
  const replacement = approvedLinksCache.find((link) => (
    link.replacesUrl
    && normalizeUrl(link.replacesUrl) === providerUrl
    && appliesToProvider(link, provider)
  )) ?? approvedLinksCache.find((link) => (
    normalizeUrl(link.url) === providerUrl
    && appliesToProvider(link, provider)
  ));
  if (!replacement) return provider;
  return {
    ...provider,
    name: replacement.name,
    url: replacement.url,
    ...(replacement.municipality ? { municipality: replacement.municipality } : {}),
  };
};

export const resolveApprovedUrl = (url: string) => resolveApprovedProvider({ name: '', url }).url;

export const mergeApprovedLinksIntoShortcuts = (shortcuts: Shortcut[], locality: LocalityInfo | null = null) => {
  const approvedLinks = getApprovedLinkSuggestions();
  if (approvedLinks.length === 0) return shortcuts;

  const byCategory = new Map<string, ApprovedLinkSuggestion[]>();
  approvedLinks.forEach((link) => {
    const key = normalizeText(link.category);
    const items = byCategory.get(key) ?? [];
    items.push(link);
    byCategory.set(key, items);
  });

  return shortcuts.map((shortcut) => {
    if (!shortcut.providers) return shortcut;

    const globallyOverriddenProviders = shortcut.providers.map(resolveApprovedProvider);
    const resolvedShortcut = { ...shortcut, providers: globallyOverriddenProviders };

    const approved = (byCategory.get(normalizeText(shortcut.name)) ?? []).filter((link) => (
      !link.municipality || normalizeText(link.municipality) === normalizeText(locality?.municipality ?? '')
    ));
    if (approved.length === 0) return resolvedShortcut;

    const approvedByUrl = new Map(approved.map((link) => [normalizeUrl(link.url), link]));
    const overriddenProviders = globallyOverriddenProviders.map((provider) => {
      const override = approvedByUrl.get(normalizeUrl(provider.url));
      if (!override) return provider;
      return {
        ...provider,
        name: override.name,
        url: override.url,
        ...(override.municipality ? { municipality: override.municipality } : {}),
      };
    });
    const existingUrls = new Set(overriddenProviders.map((provider) => normalizeUrl(provider.url)));
    const existingNames = new Set(overriddenProviders.map((provider) => normalizeText(provider.name)));
    const mergedProviders = [
      ...overriddenProviders,
      ...approved
        .filter((link) => !existingUrls.has(normalizeUrl(link.url)) && !existingNames.has(normalizeText(link.name)))
        .map((link) => ({
          name: link.name,
          url: link.url,
          group: link.category,
          ...(link.municipality ? { municipality: link.municipality } : {}),
        })),
    ];

    return { ...shortcut, providers: mergedProviders };
  });
};
