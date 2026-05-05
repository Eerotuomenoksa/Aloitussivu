import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';
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

const normalizeText = (value: string) => value.trim().toLocaleLowerCase('fi-FI').replace(/\s+/g, ' ');
const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');

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

export const subscribeApprovedLinkSuggestions = (callback: (links: ApprovedLinkSuggestion[]) => void) => {
  if (!isFirebaseConfigured) {
    const handleChange = () => callback(getApprovedLinkSuggestions());
    callback(getApprovedLinkSuggestions());
    window.addEventListener('storage', handleChange);
    window.addEventListener(APPROVED_LINKS_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(APPROVED_LINKS_CHANGE_EVENT, handleChange);
    };
  }

  const db = getFirebaseDb();
  if (!db) {
    callback(getApprovedLinkSuggestions());
    return () => {};
  }

  return onSnapshot(
    query(collection(db, APPROVED_LINKS_COLLECTION), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const links = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as ApprovedLinkSuggestion[];
      setApprovedLinksCache(links);
      callback(links);
    },
    () => callback(getApprovedLinkSuggestions())
  );
};

export const approveLinkSuggestion = async (suggestion: Omit<ApprovedLinkSuggestion, 'id' | 'createdAt'> & Partial<Pick<ApprovedLinkSuggestion, 'id' | 'createdAt'>>) => {
  const next: ApprovedLinkSuggestion = {
    id: suggestion.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
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

  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      await setDoc(doc(db, APPROVED_LINKS_COLLECTION, next.id), next);
    }
  }

  setApprovedLinksCache(merged);
  return next;
};

export const removeApprovedLinkSuggestion = async (id: string) => {
  const next = getApprovedLinkSuggestions().filter((item) => item.id !== id);
  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      await deleteDoc(doc(db, APPROVED_LINKS_COLLECTION, id));
    }
  }
  setApprovedLinksCache(next);
};

export const useApprovedLinkSuggestionsVersion = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleChange = () => setVersion((current) => current + 1);
    window.addEventListener('storage', handleChange);
    window.addEventListener(APPROVED_LINKS_CHANGE_EVENT, handleChange);
    const unsubscribe = subscribeApprovedLinkSuggestions(() => handleChange());
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(APPROVED_LINKS_CHANGE_EVENT, handleChange);
      unsubscribe();
    };
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

    const existingUrls = new Set(shortcut.providers.map((provider) => provider.url.replace(/\/+$/, '')));
    const mergedProviders = [
      ...shortcut.providers,
      ...approved
        .filter((link) => !existingUrls.has(link.url.replace(/\/+$/, '')))
        .map((link) => ({
          name: link.name,
          url: link.url,
          group: link.category,
        })),
    ];

    return { ...shortcut, providers: mergedProviders };
  });
};
