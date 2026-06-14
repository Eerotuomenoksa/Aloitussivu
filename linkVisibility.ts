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
const BLOCKED_LINKS_COLLECTION = 'blockedLinks';

export type LinkReportStatus = 'pending' | 'approved' | 'rejected';

export const normalizeReportUrl = (url: string) => {
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return '';
  }
};

export interface ManagedLinkReportEntry extends LinkReportEntry {
  status: LinkReportStatus;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedLinkId?: string;
  reviewReason?: string;
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

let runtimeBlockedUrlsCache = (readJsonArray(RUNTIME_BLOCKED_LINKS_KEY) as string[]).map(normalizeUrl);

const emitLinkHealthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LINK_HEALTH_CHANGE_EVENT));
  }
};

const setRuntimeBlockedUrlsCache = (urls: string[]) => {
  runtimeBlockedUrlsCache = [...new Set(urls.map(normalizeUrl))];
  writeJsonArray(RUNTIME_BLOCKED_LINKS_KEY, runtimeBlockedUrlsCache);
  emitLinkHealthChange();
};

const getRuntimeBlockedUrls = () => runtimeBlockedUrlsCache;

const getBlockedUrls = () => new Set([
  ...BLOCKED_LINK_URLS.map(normalizeUrl),
  ...getRuntimeBlockedUrls(),
]);

export const getLinkReports = () => readJsonArray(LINK_REPORTS_KEY) as LinkReportEntry[];

const getManagedLinkReports = () => (readJsonArray(LINK_REPORTS_KEY) as Partial<ManagedLinkReportEntry>[]).map((report) => ({
  ...report,
  status: report.status ?? 'pending' as LinkReportStatus,
})) as ManagedLinkReportEntry[];

const writeManagedLinkReports = (reports: ManagedLinkReportEntry[]) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LINK_REPORTS_KEY, JSON.stringify(reports));
  } catch {
    // Ignore storage errors.
  }
};

const updateLocalLinkReportStatus = (
  id: string,
  status: LinkReportStatus,
  reviewedAt: string,
  reviewerEmail?: string | null,
  approvedLinkId?: string,
  reviewReason?: string
) => {
  writeManagedLinkReports(getManagedLinkReports().map((report) => (
    report.id === id
      ? {
          ...report,
          status,
          reviewedAt,
          reviewedBy: reviewerEmail ?? '',
          updatedAt: reviewedAt,
          ...(approvedLinkId ? { approvedLinkId } : {}),
          ...(reviewReason ? { reviewReason } : {}),
        }
      : report
  )));
  emitLinkReportsChange();
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
  const normalizedUrl = normalizeReportUrl(entry.url);
  if (!normalizedUrl) {
    throw new Error('Invalid link report URL');
  }

  const report: ManagedLinkReportEntry = {
    ...entry,
    url: normalizedUrl,
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
  approvedLinkId?: string,
  reviewReason?: string
) => {
  const reviewedAt = new Date().toISOString();

  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      try {
        await updateDoc(doc(db, LINK_REPORTS_COLLECTION, id), {
          status,
          reviewedAt,
          reviewedBy: reviewerEmail ?? '',
          updatedAt: reviewedAt,
          ...(approvedLinkId ? { approvedLinkId } : {}),
          ...(reviewReason ? { reviewReason } : {}),
        });
        emitLinkReportsChange();
        return;
      } catch (error) {
        const hasLocalReport = getManagedLinkReports().some((report) => report.id === id);
        if (!hasLocalReport) throw error;
      }
    }
  }

  updateLocalLinkReportStatus(id, status, reviewedAt, reviewerEmail, approvedLinkId, reviewReason);
};

export const addBlockedLink = async (url: string) => {
  const normalized = normalizeUrl(url);
  const runtimeBlocked = new Set(runtimeBlockedUrlsCache);
  runtimeBlocked.add(normalized);
  setRuntimeBlockedUrlsCache([...runtimeBlocked]);

  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      await setDoc(doc(db, BLOCKED_LINKS_COLLECTION, encodeURIComponent(normalized)), {
        url: normalized,
        createdAt: new Date().toISOString(),
      });
    }
  }
};

const subscribeBlockedLinks = () => {
  if (!isFirebaseConfigured) return () => {};
  const db = getFirebaseDb();
  if (!db) return () => {};

  return onSnapshot(
    collection(db, BLOCKED_LINKS_COLLECTION),
    (snapshot) => setRuntimeBlockedUrlsCache(snapshot.docs.map((document) => normalizeUrl(String(document.data().url ?? ''))).filter(Boolean)),
    () => setRuntimeBlockedUrlsCache(readJsonArray(RUNTIME_BLOCKED_LINKS_KEY) as string[])
  );
};

export const useLinkVisibilityVersion = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleChange = () => setVersion((current) => current + 1);
    window.addEventListener('storage', handleChange);
    window.addEventListener(LINK_HEALTH_CHANGE_EVENT, handleChange);
    const unsubscribeBlockedLinks = subscribeBlockedLinks();
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(LINK_HEALTH_CHANGE_EVENT, handleChange);
      unsubscribeBlockedLinks();
    };
  }, []);

  return version;
};
