import { useEffect, useState } from 'react';
import { BLOCKED_LINK_URLS } from './linkHealth';
import { adminPollIntervalMs, getDataProvider, subscribeWithPolling } from './services/data';
import { LinkReportEntry, Provider, Shortcut } from './types';

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');
const RUNTIME_BLOCKED_LINKS_KEY = 'blockedLinkUrls';
const LINK_REPORTS_KEY = 'linkReports';
const LINK_HEALTH_CHANGE_EVENT = 'linkhealthchange';
const LINK_REPORTS_CHANGE_EVENT = 'linkreportschange';

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

const writeJsonArray = (key: string, value: unknown[]) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
};

const staticBlockedUrls = new Set(BLOCKED_LINK_URLS.map(normalizeUrl));
let runtimeBlockedUrlsCache = (readJsonArray(RUNTIME_BLOCKED_LINKS_KEY) as string[]).map(normalizeUrl);
let blockedUrlsCache = new Set([...staticBlockedUrls, ...runtimeBlockedUrlsCache]);

const normalizeBlockedUrls = (urls: string[]) => [...new Set(urls.map(normalizeUrl))].sort();

const rebuildBlockedUrlsCache = () => {
  blockedUrlsCache = new Set([...staticBlockedUrls, ...runtimeBlockedUrlsCache]);
};

const emitLinkHealthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LINK_HEALTH_CHANGE_EVENT));
  }
};

const setRuntimeBlockedUrlsCache = (urls: string[]) => {
  const normalizedUrls = normalizeBlockedUrls(urls);
  if (
    normalizedUrls.length === runtimeBlockedUrlsCache.length
    && normalizedUrls.every((url, index) => url === runtimeBlockedUrlsCache[index])
  ) {
    return;
  }

  runtimeBlockedUrlsCache = normalizedUrls;
  rebuildBlockedUrlsCache();
  writeJsonArray(RUNTIME_BLOCKED_LINKS_KEY, runtimeBlockedUrlsCache);
  emitLinkHealthChange();
};

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
  if (/^http:\/\//i.test(url.trim())) return false;
  return !blockedUrlsCache.has(normalizeUrl(url));
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

export const submitLinkReport = async (entry: LinkReportEntry): Promise<{ storage: 'cloud' | 'local' }> => {
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

  try {
    const provider = await getDataProvider();
    await provider.submitPublic('link-reports', {
      id: report.id,
      type: report.type,
      name: report.name,
      url: report.url,
      category: report.category ?? '',
      source: report.source ?? '',
      note: report.note,
      website: '',
    });
    emitLinkReportsChange();
    return { storage: provider.kind === 'local' ? 'local' : 'cloud' };
  } catch {
    reportLink(report);
    emitLinkReportsChange();
    return { storage: 'local' };
  }
};

export const syncLocalLinkReports = async () => {
  const localReports = getManagedLinkReports();
  const provider = await getDataProvider();
  if (provider.kind === 'local') {
    return { total: localReports.length, synced: 0, remaining: localReports.length };
  }
  const syncedIds: string[] = [];
  for (const report of [...localReports].reverse()) {
    try {
      await provider.submitPublic('link-reports', {
        id: report.id,
        type: report.type,
        name: report.name,
        url: report.url,
        category: report.category ?? '',
        source: report.source ?? '',
        note: report.note,
        website: '',
      });
      syncedIds.push(report.id);
    } catch {
      break;
    }
  }
  if (syncedIds.length > 0) {
    writeManagedLinkReports(localReports.filter((report) => !syncedIds.includes(report.id)));
    emitLinkReportsChange();
  }
  return {
    total: localReports.length,
    synced: syncedIds.length,
    remaining: localReports.length - syncedIds.length,
  };
};

export const subscribeLinkReports = (
  callback: (reports: ManagedLinkReportEntry[]) => void,
  onError?: (error: unknown) => void,
) => {
  const handleChange = () => callback(getManagedLinkReports());
  window.addEventListener('storage', handleChange);
  window.addEventListener(LINK_REPORTS_CHANGE_EVENT, handleChange);
  const stopPolling = subscribeWithPolling(
    async () => (await getDataProvider()).listAdmin<ManagedLinkReportEntry[]>('link-reports'),
    callback,
    onError,
    adminPollIntervalMs,
  );

  return () => {
    stopPolling();
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(LINK_REPORTS_CHANGE_EVENT, handleChange);
  };
};

export const updateLinkReportStatus = async (
  id: string,
  status: LinkReportStatus,
  reviewerEmail?: string | null,
  approvedLinkId?: string,
  reviewReason?: string
) => {
  const reviewedAt = new Date().toISOString();

  const provider = await getDataProvider();
  await provider.updateAdmin('link-reports', id, {
    status,
    reviewReason: reviewReason ?? '',
  });
  updateLocalLinkReportStatus(id, status, reviewedAt, reviewerEmail, approvedLinkId, reviewReason);
};

export const addBlockedLink = async (url: string) => {
  const normalized = normalizeUrl(url);
  const provider = await getDataProvider();
  await provider.createAdmin('blocked-links', {
    url: normalized,
    reason: 'Ylläpidon linkkitarkistus',
  });
  const runtimeBlocked = new Set(runtimeBlockedUrlsCache);
  runtimeBlocked.add(normalized);
  setRuntimeBlockedUrlsCache([...runtimeBlocked]);
};

const startBlockedLinksRemoteSync = () => {
  let cancelled = false;
  void getDataProvider()
    .then((provider) => provider.listPublic<{ url: string }>('blocked-links'))
    .then((items) => {
      if (!cancelled) setRuntimeBlockedUrlsCache(items.map((item) => normalizeUrl(item.url)).filter(Boolean));
    })
    .catch(() => {
      // Säilytä viimeisin paikallinen välimuisti verkkovirheessä.
    });

  return () => {
    cancelled = true;
  };
};

let blockedLinksSubscriberCount = 0;
let stopBlockedLinksRemoteSync: (() => void) | null = null;

const subscribeBlockedLinks = () => {
  blockedLinksSubscriberCount += 1;
  if (blockedLinksSubscriberCount === 1) {
    stopBlockedLinksRemoteSync = startBlockedLinksRemoteSync();
  }

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    blockedLinksSubscriberCount = Math.max(0, blockedLinksSubscriberCount - 1);
    if (blockedLinksSubscriberCount === 0) {
      stopBlockedLinksRemoteSync?.();
      stopBlockedLinksRemoteSync = null;
    }
  };
};

export const useLinkVisibilityVersion = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== RUNTIME_BLOCKED_LINKS_KEY) return;
      runtimeBlockedUrlsCache = normalizeBlockedUrls(readJsonArray(RUNTIME_BLOCKED_LINKS_KEY) as string[]);
      rebuildBlockedUrlsCache();
      setVersion((current) => current + 1);
    };
    const handleChange = () => setVersion((current) => current + 1);
    window.addEventListener('storage', handleStorage);
    window.addEventListener(LINK_HEALTH_CHANGE_EVENT, handleChange);
    const unsubscribeBlockedLinks = subscribeBlockedLinks();
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LINK_HEALTH_CHANGE_EVENT, handleChange);
      unsubscribeBlockedLinks();
    };
  }, []);

  return version;
};
