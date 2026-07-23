import { useEffect, useState } from 'react';
import { Shortcut } from './types';

export interface ApprovedLinkSuggestion {
  id: string;
  name: string;
  url: string;
  category: string;
  source: string;
  createdAt: string;
  note?: string;
}

const APPROVED_LINKS_KEY = 'approvedLinkSuggestions';
const APPROVED_LINKS_CHANGE_EVENT = 'approvedlinkchange';
const APPROVED_LINKS_COLLECTION = 'approvedLinks';
const REMOTE_SYNC_DELAY_MS = 12000;

const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY?.trim()
  && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
  && import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
);

const loadRemoteFirestore = async () => {
  if (!hasFirebaseConfig) return null;
  const [client, firestore] = await Promise.all([
    import('./firebaseClient'),
    import('firebase/firestore'),
  ]);
  if (!client.isFirebaseConfigured) return null;
  const db = client.getFirebaseDb();
  return db ? { db, firestore } : null;
};

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

let approvedLinksCache = readJsonArray<ApprovedLinkSuggestion>(APPROVED_LINKS_KEY);

const emitApprovedLinksChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(APPROVED_LINKS_CHANGE_EVENT));
  }
};

const setApprovedLinksCache = (links: ApprovedLinkSuggestion[]) => {
  approvedLinksCache = links;
  writeJsonArray(APPROVED_LINKS_KEY, links);
  emitApprovedLinksChange();
};

export const getApprovedLinkSuggestions = () => approvedLinksCache;

const startApprovedLinksRemoteSync = () => {
  let cancelled = false;
  let unsubscribeRemote: (() => void) | undefined;
  const timer = window.setTimeout(() => {
    void loadRemoteFirestore().then((remote) => {
      if (cancelled || !remote) return;
      const { db, firestore } = remote;
      unsubscribeRemote = firestore.onSnapshot(
        firestore.query(
          firestore.collection(db, APPROVED_LINKS_COLLECTION),
          firestore.orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
          const links = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })) as ApprovedLinkSuggestion[];
          setApprovedLinksCache(links);
        },
        () => {}
      );
    });
  }, REMOTE_SYNC_DELAY_MS);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
    unsubscribeRemote?.();
  };
};

let approvedLinksSubscriberCount = 0;
let stopApprovedLinksRemoteSync: (() => void) | null = null;

export const subscribeApprovedLinkSuggestions = (callback: (links: ApprovedLinkSuggestion[]) => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== APPROVED_LINKS_KEY) return;
    approvedLinksCache = readJsonArray<ApprovedLinkSuggestion>(APPROVED_LINKS_KEY);
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
  const next: ApprovedLinkSuggestion = {
    id: suggestion.id ?? crypto.randomUUID(),
    createdAt: suggestion.createdAt ?? new Date().toISOString(),
    name: suggestion.name.trim(),
    url: suggestion.url.trim(),
    category: suggestion.category.trim(),
    source: suggestion.source,
    note: suggestion.note?.trim() || '',
  };

  const existing = getApprovedLinkSuggestions();
  const normalizedNextUrl = normalizeUrl(next.url);
  const merged = [
    next,
    ...existing.filter((item) => item.id !== next.id && normalizeUrl(item.url) !== normalizedNextUrl),
  ];

  const remote = await loadRemoteFirestore();
  if (remote) {
    await remote.firestore.setDoc(remote.firestore.doc(remote.db, APPROVED_LINKS_COLLECTION, next.id), next);
  }

  setApprovedLinksCache(merged);
  return next;
};

export const removeApprovedLinkSuggestion = async (id: string) => {
  const next = getApprovedLinkSuggestions().filter((item) => item.id !== id);
  const remote = await loadRemoteFirestore();
  if (remote) {
    await remote.firestore.deleteDoc(remote.firestore.doc(remote.db, APPROVED_LINKS_COLLECTION, id));
  }
  setApprovedLinksCache(next);
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

export const mergeApprovedLinksIntoShortcuts = (shortcuts: Shortcut[]) => {
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

    const approved = byCategory.get(normalizeText(shortcut.name)) ?? [];
    if (approved.length === 0) return shortcut;

    const existingUrls = new Set(shortcut.providers.map((provider) => normalizeUrl(provider.url)));
    const existingNames = new Set(shortcut.providers.map((provider) => normalizeText(provider.name)));
    const mergedProviders = [
      ...shortcut.providers,
      ...approved
        .filter((link) => !existingUrls.has(normalizeUrl(link.url)) && !existingNames.has(normalizeText(link.name)))
        .map((link) => ({
          name: link.name,
          url: link.url,
          group: link.category,
        })),
    ];

    return { ...shortcut, providers: mergedProviders };
  });
};
