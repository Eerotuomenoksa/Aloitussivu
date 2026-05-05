import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';
import { BLOCKED_LINK_URLS } from './linkHealth';
import { LinkReportEntry, Provider, Shortcut } from './types';

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');
const RUNTIME_BLOCKED_LINKS_KEY = 'blockedLinkUrls';
const LINK_REPORTS_KEY = 'linkReports';
const LINK_HEALTH_CHANGE_EVENT = 'linkhealthchange';
const LINK_REPORTS_CHANGE_EVENT = 'linkreportschange';
const LINK_REPORTS_COLLECTION = 'linkReports';

export type LinkReportStatus = 'pending' | 'approved' | 'rejected';

export interface ManagedLinkReportEntry extends LinkReportEntry {
  status: LinkReportStatus;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedLinkId?: string;
}

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

const getBlockedUrls = () => new Set(BLOCKED_LINK_URLS.map(normalizeUrl));

export const getLinkReports = () => readJsonArray(LINK_REPORTS_KEY) as LinkReportEntry[];

const getManagedLinkReports = () => getLinkReports().map((report) => ({
  ...report,
  status: 'pending' as LinkReportStatus,
}));

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
  const existingReports = getLinkReports();
  const nextReports = [entry, ...existingReports].slice(0, 1000);
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LINK_REPORTS_KEY, JSON.stringify(nextReports));
  } catch {
    // Ignore storage errors.
  }
};

const emitLinkReportsChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LINK_REPORTS_CHANGE_EVENT));
  }
};

export const submitLinkReport = async (entry: LinkReportEntry) => {
  const report: ManagedLinkReportEntry = {
    ...entry,
    status: 'pending',
    updatedAt: entry.createdAt,
  };

  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      await setDoc(doc(db, LINK_REPORTS_COLLECTION, report.id), report);
      emitLinkReportsChange();
      return;
    }
  }

  reportLink(entry);
  emitLinkReportsChange();
};

export const subscribeLinkReports = (callback: (reports: ManagedLinkReportEntry[]) => void) => {
  if (!isFirebaseConfigured) {
    const handleChange = () => callback(getManagedLinkReports());
    callback(getManagedLinkReports());
    window.addEventListener('storage', handleChange);
    window.addEventListener(LINK_REPORTS_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(LINK_REPORTS_CHANGE_EVENT, handleChange);
    };
  }

  const db = getFirebaseDb();
  if (!db) {
    callback(getManagedLinkReports());
    return () => {};
  }

  return onSnapshot(
    query(collection(db, LINK_REPORTS_COLLECTION), orderBy('createdAt', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as ManagedLinkReportEntry[]);
    },
    () => callback(getManagedLinkReports())
  );
};

export const updateLinkReportStatus = async (
  id: string,
  status: LinkReportStatus,
  reviewerEmail?: string | null,
  approvedLinkId?: string
) => {
  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      await updateDoc(doc(db, LINK_REPORTS_COLLECTION, id), {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewerEmail ?? '',
        updatedAt: new Date().toISOString(),
        ...(approvedLinkId ? { approvedLinkId } : {}),
      });
      emitLinkReportsChange();
      return;
    }
  }

  emitLinkReportsChange();
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
