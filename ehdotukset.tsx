import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { User } from 'firebase/auth';
import './index.css';
import {
  getApprovedLinkSuggestions,
  approveLinkSuggestion,
  refreshApprovedLinkSuggestions,
  removeApprovedLinkSuggestion,
  subscribeApprovedLinkSuggestions,
  ApprovedLinkSuggestion,
} from './approvedLinks';
import {
  addBlockedLink,
  ManagedLinkReportEntry,
  subscribeLinkReports,
  updateLinkReportStatus,
} from './linkVisibility';
import {
  getUserAuthDebugInfo,
  getUserEmail,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutAdmin,
  subscribeToAuth,
} from './firebaseClient';
import { getVerifiedAdminSession, isAdminAccessError, type AdminSession } from './services/data';
import {
  NcscScrapeLogEntry,
  ScamAlertEntry,
  runNcscScrapeNow,
  subscribeNcscScrapeLogs,
  subscribeScamAlerts,
  updateScamAlertActiveState,
} from './scamAlerts';
import {
  UsageDailyStats,
  fetchUsageStats,
  formatDateKey,
  getUsageStatsErrorMessage,
  shiftDate,
} from './usageStats';
import {
  installUsageTracking,
  isUsageTrackingDisabled,
  setUsageTrackingDisabled,
} from './usageTracking';
import {
  subscribeFeedbackItems,
  updateFeedbackItem,
  type FeedbackItem,
  type FeedbackStatus,
} from './feedback';
import {
  actOnLinkCheck,
  emptyLinkCheckOverview,
  fetchLinkChecks,
  getLinkCheckErrorLabel,
  getLinkCheckRunMessage,
  subscribeLinkChecks,
  type LinkCheckItem,
  type LinkCheckOverview,
} from './linkChecks';
import { MUNICIPALITIES } from './municipalRegistry';
import SiteContentEditor from './components/admin/SiteContentEditor';

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');
const extractHttpsUrl = (value: string) => (
  value.match(/https:\/\/[^\s<>"']+/i)?.[0]?.replace(/[),.;!?]+$/, '') ?? ''
);

const statusLabel = {
  pending: 'Odottaa',
  approved: 'Hyväksytty tuotantoon',
  rejected: 'Hylätty',
};

const feedbackStatusLabel: Record<FeedbackStatus, string> = {
  new: 'Uusi',
  triage: 'Arvioitavana',
  planned: 'Suunniteltu',
  in_progress: 'Työn alla',
  done: 'Käsitelty',
  rejected: 'Hylätty',
};

const feedbackTypeLabel: Record<FeedbackItem['type'], string> = {
  bug: 'Virhe',
  content: 'Sisältö',
  link: 'Linkki',
  accessibility: 'Saavutettavuus',
  idea: 'Idea',
  other: 'Muu',
};

const severityLabel = {
  info: 'Tieto',
  warning: 'Varoitus',
  danger: 'Vakava',
};

type UsageRangeMode = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const usageRangeLabels: Record<UsageRangeMode, string> = {
  day: 'Päivä',
  week: 'Viikko',
  month: 'Kuukausi',
  quarter: 'Kvartaali',
  year: 'Vuosi',
  custom: 'Oma väli',
};

const getUsagePresetRange = (mode: UsageRangeMode) => {
  const today = new Date();
  const end = formatDateKey(today);

  if (mode === 'day') return { start: end, end };
  if (mode === 'week') return { start: formatDateKey(shiftDate(today, -6)), end };
  if (mode === 'month') return { start: formatDateKey(shiftDate(today, -29)), end };
  if (mode === 'quarter') return { start: formatDateKey(shiftDate(today, -89)), end };
  if (mode === 'year') return { start: formatDateKey(shiftDate(today, -364)), end };
  return { start: end, end };
};

const normalizeUsagePage = (page: string) => (page === 'index' ? 'etusivu' : page);

const isExcludedUsageSection = (page: string) => {
  const normalized = normalizeUsagePage(page).toLocaleLowerCase('fi-FI');
  return normalized === 'ehdotukset'
    || normalized === 'yllapito'
    || normalized === 'testipalaute-yllapito'
    || normalized.startsWith('saavutettavuus');
};

const isExcludedUsageCategory = (category: string) => {
  const normalized = category.trim().toLocaleLowerCase('fi-FI');
  return normalized === 'ylläpito'
    || normalized === 'saavutettavuus'
    || normalized === 'saavutettavuusseloste';
};

const sumUsageStats = (stats: UsageDailyStats[]) => {
  const pages = new Map<string, { count: number; page: string }>();
  const categories = new Map<string, { count: number; category: string }>();
  let totalPageviews = 0;
  let totalLinkClicks = 0;

  stats.forEach((day) => {
    totalPageviews += day.totalPageviews;
    totalLinkClicks += day.totalLinkClicks;

    Object.values(day.pageviews).forEach((pageview) => {
      const page = normalizeUsagePage(pageview.page);
      const current = pages.get(page) ?? { count: 0, page };
      current.count += pageview.count;
      pages.set(page, current);
    });

    Object.values(day.linkClicks).forEach((link) => {
      const category = link.category.trim();
      if (!category || isExcludedUsageSection(link.page) || isExcludedUsageCategory(category)) return;
      const key = category.toLocaleLowerCase('fi-FI');
      const current = categories.get(key) ?? {
        count: 0,
        category,
      };
      current.count += link.count;
      categories.set(key, current);
    });
  });

  return {
    totalPageviews,
    totalLinkClicks,
    frontPageViews: pages.get('etusivu')?.count ?? 0,
    topCategories: [...categories.values()].sort((a, b) => b.count - a.count).slice(0, 12),
  };
};

const getFrontPageViews = (day: UsageDailyStats) => (
  Object.values(day.pageviews).reduce((total, pageview) => (
    normalizeUsagePage(pageview.page) === 'etusivu' ? total + pageview.count : total
  ), 0)
);

const sumContext = (stats: UsageDailyStats[], dimension: string, bucket?: string) => (
  stats.reduce((total, day) => {
    const values = day.context?.[dimension] ?? {};
    if (bucket) return total + (values[bucket] ?? 0);
    return total + Object.values(values).reduce((sum, count) => sum + count, 0);
  }, 0)
);

const getGrowthMetrics = (stats: UsageDailyStats[]) => {
  const dailyDirect = stats.map((day, index) => {
    const windowDays = stats.slice(Math.max(0, index - 6), index + 1);
    const rollingViews = windowDays.reduce((sum, item) => sum + item.totalPageviews, 0);
    const rollingDirect = sumContext(windowDays, 'entry', 'direct');
    const direct = day.context?.entry?.direct ?? 0;
    return {
      date: day.date,
      direct,
      share: day.totalPageviews > 0 ? (direct / day.totalPageviews) * 100 : 0,
      rollingShare: rollingViews > 0 ? (rollingDirect / rollingViews) * 100 : 0,
    };
  });
  const guide = stats.reduce<Record<string, number>>((totals, day) => {
    Object.entries(day.context?.guide ?? {}).forEach(([bucket, count]) => {
      totals[bucket] = (totals[bucket] ?? 0) + count;
    });
    return totals;
  }, {});
  const opened = guide.opened ?? 0;
  const done = guide.done ?? 0;
  const browser = Object.entries(guide).reduce((sum, [bucket, count]) => (
    bucket.startsWith('browser:') ? sum + count : sum
  ), 0);
  const shared = Object.entries(guide).reduce((sum, [bucket, count]) => (
    bucket.startsWith('shared:') ? sum + count : sum
  ), 0);
  const totalViews = stats.reduce((sum, day) => sum + day.totalPageviews, 0);
  const direct = sumContext(stats, 'entry', 'direct');
  return {
    dailyDirect,
    direct,
    directShare: totalViews > 0 ? (direct / totalViews) * 100 : 0,
    funnel: { opened, browser, done, shared, completion: opened > 0 ? (done / opened) * 100 : 0 },
  };
};

function HomeLink() {
  return (
    <a
      href="./index.html"
      className="aurora-primary-link text-base"
    >
      ← Palaa etusivulle
    </a>
  );
}

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fi-FI', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const ncscBadgeClass = (log: NcscScrapeLogEntry) => {
  if (log.structureVersion === 'unknown') return 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200';
  if (log.alertsCreated > 0) return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200';
  return 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200';
};

const ncscStructureLabel = {
  '2026': 'Poimittu viikkokatsauksesta',
  '2025': 'Poimittu varalukijalla',
  news: 'Poimittu uutisesta',
  unknown: 'Ei tunnistettavaa sisältöä',
} satisfies Record<NcscScrapeLogEntry['structureVersion'], string>;

const getErrorCode = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('code' in error)) return '';
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : '';
};

const getErrorDetails = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return '';
  const customData = 'customData' in error ? (error as { customData?: unknown }).customData : null;
  if (!customData || typeof customData !== 'object') return '';
  const values = Object.entries(customData as Record<string, unknown>)
    .filter(([, value]) => typeof value === 'string' && value)
    .map(([key, value]) => `${key}: ${value}`);
  return values.length > 0 ? ` Lisätieto: ${values.join(', ')}.` : '';
};

const getSignInErrorMessage = (error: unknown) => {
  const code = getErrorCode(error);
  const details = getErrorDetails(error);

  if (code === 'auth/unauthorized-domain') {
    return 'Kirjautuminen ei onnistu tästä osoitteesta. Lisää nykyinen verkkotunnus Firebase Authenticationin Authorized domains -listaan.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Google-kirjautuminen ei ole käytössä Firebase Authenticationissa. Ota Google provider käyttöön Firebase Consolessa.';
  }

  if (code === 'auth/api-key-not-valid') {
    return 'Firebase API key ei kelpaa. Tarkista GitHub Secrets -arvo VITE_FIREBASE_API_KEY ja varmista, että se on saman Firebase-projektin Web app -asetuksista kuin muut VITE_FIREBASE_* arvot.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Selain esti Google-kirjautumisen ponnahdusikkunan. Salli ponnahdusikkunat tälle sivulle ja yritä uudelleen.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Kirjautumisikkuna suljettiin ennen kirjautumista.';
  }

  if (code === 'auth/internal-error') {
    return `Firebase palautti sisäisen kirjautumisvirheen. Tarkista Google-provider, Authorized domains, API-avaimen HTTP referrer -rajaus ja selaimen konsolin mahdolliset CSP-estot.${details}`;
  }

  return code
    ? `Kirjautuminen ei onnistunut. Firebase-virhe: ${code}.${details}`
    : 'Kirjautuminen ei onnistunut. Tarkista Firebase-asetukset ja Google-kirjautuminen.';
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [reports, setReports] = useState<ManagedLinkReportEntry[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackBusyId, setFeedbackBusyId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [feedbackLinkDrafts, setFeedbackLinkDrafts] = useState<Record<string, { name: string; url: string; category: string; municipality: string }>>({});
  const [approvedLinks, setApprovedLinks] = useState<ApprovedLinkSuggestion[]>(() => getApprovedLinkSuggestions());
  const [reportDrafts, setReportDrafts] = useState<Record<string, { name: string; url: string; category: string; municipality: string; note: string }>>({});
  const [reportReviewReasons, setReportReviewReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scamAlerts, setScamAlerts] = useState<ScamAlertEntry[]>([]);
  const [scamAlertBusyId, setScamAlertBusyId] = useState<string | null>(null);
  const [scamAlertMessage, setScamAlertMessage] = useState('');
  const [ncscLogs, setNcscLogs] = useState<NcscScrapeLogEntry[]>([]);
  const [ncscLogError, setNcscLogError] = useState('');
  const [ncscBusy, setNcscBusy] = useState(false);
  const [ncscMessage, setNcscMessage] = useState('');
  const [usageRangeMode, setUsageRangeMode] = useState<UsageRangeMode>('week');
  const [usageRange, setUsageRange] = useState(() => getUsagePresetRange('week'));
  const [usageStats, setUsageStats] = useState<UsageDailyStats[]>([]);
  const [usageStatsBusy, setUsageStatsBusy] = useState(false);
  const [usageStatsError, setUsageStatsError] = useState('');
  const [usageTrackingDisabled, setUsageTrackingDisabledState] = useState(() => isUsageTrackingDisabled());
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [adminAccessReady, setAdminAccessReady] = useState(false);
  const [linkChecks, setLinkChecks] = useState<LinkCheckOverview>(emptyLinkCheckOverview);
  const [linkCheckError, setLinkCheckError] = useState('');
  const [linkCheckBusyId, setLinkCheckBusyId] = useState<string | null>(null);
  const [linkCheckActionMessage, setLinkCheckActionMessage] = useState('');
  const [linkCheckReasons, setLinkCheckReasons] = useState<Record<string, string>>({});
  const [linkCheckReplacementNames, setLinkCheckReplacementNames] = useState<Record<string, string>>({});
  const [linkCheckReplacementUrls, setLinkCheckReplacementUrls] = useState<Record<string, string>>({});

  const hasAdminAccess = adminSession !== null;
  const userEmail = adminSession?.email || getUserEmail(user);
  const authDebugInfo = getUserAuthDebugInfo(user);
  const adminPermissionHint = adminSession ? `Palvelimen vahvistama rooli: ${adminSession.role}.` : '';

  useEffect(() => installUsageTracking('ehdotukset'), [usageTrackingDisabled]);

  const updateUsageTrackingPreference = (disabled: boolean) => {
    setUsageTrackingDisabled(disabled);
    setUsageTrackingDisabledState(isUsageTrackingDisabled());
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let current = true;
    setAdminSession(null);
    setAdminAccessReady(!user);
    if (!user) return () => { current = false; };

    void getVerifiedAdminSession()
      .then((session) => {
        if (!current) return;
        setAdminSession(session);
        setAuthError('');
      })
      .catch((error) => {
        if (!current) return;
        setAdminSession(null);
        setAuthError(error instanceof Error ? error.message : 'Ylläpito-oikeutta ei voitu vahvistaa.');
      })
      .finally(() => {
        if (current) setAdminAccessReady(true);
      });
    return () => { current = false; };
  }, [user]);

  useEffect(() => subscribeApprovedLinkSuggestions(setApprovedLinks), []);

  useEffect(() => {
    if (!hasAdminAccess) {
      setReports([]);
      return () => {};
    }
    return subscribeLinkReports(setReports, (error) => {
      if (isAdminAccessError(error)) setAdminSession(null);
      setAuthError(error instanceof Error ? error.message : 'Linkki-ilmoituksia ei voitu ladata.');
    });
  }, [hasAdminAccess]);

  useEffect(() => {
    if (!hasAdminAccess) {
      setScamAlerts([]);
      setNcscLogs([]);
      setNcscLogError('');
      setUsageStats([]);
      setUsageStatsError('');
      return () => {};
    }

    const unsubscribeAlerts = subscribeScamAlerts(setScamAlerts, true, (error) => {
      if (isAdminAccessError(error)) setAdminSession(null);
    });
    const addPermissionHint = (message: string, error?: { code?: string }) => (
      error?.code === 'permission-denied' && adminPermissionHint
        ? `${message} ${adminPermissionHint}`
        : message
    );
    const unsubscribeLogs = subscribeNcscScrapeLogs(
      setNcscLogs,
      (message, error) => {
        if (isAdminAccessError(error)) setAdminSession(null);
        setNcscLogError(addPermissionHint(message, error));
      }
    );
    return () => {
      unsubscribeAlerts();
      unsubscribeLogs();
    };
  }, [adminPermissionHint, hasAdminAccess]);

  useEffect(() => {
    if (usageRangeMode === 'custom') return;
    setUsageRange(getUsagePresetRange(usageRangeMode));
  }, [usageRangeMode]);

  useEffect(() => {
    if (!hasAdminAccess) {
      setLinkChecks(emptyLinkCheckOverview);
      setLinkCheckError('');
      return () => {};
    }
    return subscribeLinkChecks(
      (overview) => {
        setLinkChecks(overview);
        setLinkCheckError('');
      },
      (error) => {
        if (isAdminAccessError(error)) setAdminSession(null);
        setLinkCheckError(error instanceof Error ? error.message : 'Linkkitarkistuksen tietoja ei voitu ladata.');
      },
    );
  }, [hasAdminAccess]);

  useEffect(() => {
    if (!hasAdminAccess) {
      setFeedbackItems([]);
      return () => {};
    }
    return subscribeFeedbackItems(
      (items) => {
        setFeedbackItems(items);
        setFeedbackMessage('');
      },
      (error) => {
        if (isAdminAccessError(error)) setAdminSession(null);
        setFeedbackMessage(error instanceof Error ? error.message : 'Palautteita ei voitu ladata.');
      },
    );
  }, [hasAdminAccess]);

  useEffect(() => {
    if (!hasAdminAccess) return;
    let isCurrent = true;
    setUsageStatsBusy(true);
    setUsageStatsError('');

    fetchUsageStats(usageRange.start, usageRange.end)
      .then((stats) => {
        if (isCurrent) setUsageStats(stats);
      })
      .catch((error) => {
        if (isCurrent) {
          if (isAdminAccessError(error)) setAdminSession(null);
          setUsageStats([]);
          setUsageStatsError(`${getUsageStatsErrorMessage(error)} ${adminPermissionHint}`.trim());
        }
      })
      .finally(() => {
        if (isCurrent) setUsageStatsBusy(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [adminPermissionHint, hasAdminAccess, usageRange.end, usageRange.start]);

  const signIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthError(getSignInErrorMessage(error));
    }
  };

  const approvedUrls = useMemo(() => new Set(approvedLinks.map((item) => normalizeUrl(item.url))), [approvedLinks]);
  const pendingReports = useMemo(() => reports.filter((report) => report.status === 'pending'), [reports]);
  const openFeedbackItems = useMemo(
    () => feedbackItems.filter((item) => ['new', 'triage', 'planned', 'in_progress'].includes(item.status)),
    [feedbackItems],
  );
  const pendingNewReports = useMemo(
    () => pendingReports.filter((report) => report.type === 'new' && !approvedUrls.has(normalizeUrl(report.url))),
    [pendingReports, approvedUrls]
  );
  const issueReports = useMemo(
    () => pendingReports.filter((report) => report.type !== 'new'),
    [pendingReports]
  );
  const reviewedReports = useMemo(
    () => reports.filter((report) => report.status !== 'pending'),
    [reports]
  );
  const ncscAttentionLogs = useMemo(
    () => ncscLogs.filter((log) => log.structureVersion === 'unknown' || log.alertsCreated === 0),
    [ncscLogs]
  );
  const activeScamAlerts = useMemo(
    () => scamAlerts.filter((alert) => alert.active),
    [scamAlerts]
  );
  const hiddenScamAlerts = useMemo(
    () => scamAlerts.filter((alert) => !alert.active),
    [scamAlerts]
  );
  const usageTotals = useMemo(() => sumUsageStats(usageStats), [usageStats]);
  const growthMetrics = useMemo(() => getGrowthMetrics(usageStats), [usageStats]);
  const reviewTasks = useMemo(() => [
    {
      label: 'Uudet linkit',
      count: pendingNewReports.length,
      href: '#pending-new-links',
      tone: pendingNewReports.length > 0 ? 'bg-blue-100 text-blue-950 dark:bg-blue-900/40 dark:text-blue-100' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      note: 'Tarkista ehdotukset ja lisää sopivat linkkilistaan.',
    },
    {
      label: 'Muut ilmoitukset',
      count: issueReports.length,
      href: '#issue-reports',
      tone: issueReports.length > 0 ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      note: 'Rikkinäiset, väärät tai poistettavat linkit.',
    },
    {
      label: 'Palautteet',
      count: openFeedbackItems.length,
      href: '#feedback',
      tone: openFeedbackItems.length > 0 ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100',
      note: feedbackMessage || 'Avoimet käyttäjäpalautteet ja niiden käsittely.',
    },
    {
      label: 'Linkkitarkistus',
      count: linkChecks.summary.attention,
      href: '#link-checks',
      tone: linkCheckError || linkChecks.summary.attention > 0 ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100',
      note: linkCheckError || (linkChecks.enabled ? `${linkChecks.summary.ok} kunnossa, ${linkChecks.summary.pending} odottaa ensimmäistä tarkistusta.` : 'Automaattinen tarkistus ei ole käytössä.'),
    },
    {
      label: 'Huijausvaroitukset',
      count: activeScamAlerts.length,
      href: '#scam-alerts-admin',
      tone: ncscAttentionLogs.length > 0 ? 'bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100' : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100',
      note: ncscAttentionLogs.length > 0 ? `${ncscAttentionLogs.length} hakuajoa vaatii silmäilyn.` : 'Automaation viime ajot näyttävät tavallisilta.',
    },
    {
      label: 'Hyväksytyt linkit',
      count: approvedLinks.length,
      href: '#approved-links',
      tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      note: 'Täältä voi poistaa aiemmin hyväksyttyjä lisäyksiä.',
    },
    {
      label: 'Sivutekstit',
      count: 'Muokkaa',
      href: '#site-content',
      tone: 'bg-violet-100 text-violet-950 dark:bg-violet-900/40 dark:text-violet-100',
      note: 'Tietosuoja, saavutettavuus, ohjeikkunat sekä ylä- ja alatunniste.',
    },
    {
      label: 'Käyttötilastot',
      count: usageTotals.frontPageViews,
      href: '#usage-stats',
      tone: usageStatsError ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-cyan-100 text-cyan-950 dark:bg-cyan-900/40 dark:text-cyan-100',
      note: usageStatsError || `${usageRange.start} - ${usageRange.end}`,
    },
  ], [activeScamAlerts.length, approvedLinks.length, feedbackMessage, issueReports.length, linkCheckError, linkChecks.enabled, linkChecks.summary.attention, linkChecks.summary.ok, linkChecks.summary.pending, ncscAttentionLogs.length, openFeedbackItems.length, pendingNewReports.length, usageRange.end, usageRange.start, usageStatsError, usageTotals.frontPageViews]);

  useEffect(() => {
    setReportDrafts((current) => {
      const next = { ...current };
      for (const report of pendingNewReports) {
        if (!next[report.id]) {
          next[report.id] = {
            name: report.name || '',
            url: report.url || '',
            category: report.category || '',
            municipality: '',
            note: report.note || '',
          };
        }
      }
      return next;
    });
  }, [pendingNewReports]);

  const approveReport = async (report: ManagedLinkReportEntry) => {
    const draft = reportDrafts[report.id] ?? {
      name: report.name,
      url: report.url,
      category: report.category ?? '',
      municipality: '',
      note: report.note ?? '',
    };

    setBusyId(report.id);
    try {
      const approved = await approveLinkSuggestion({
        name: draft.name || report.name || 'Tuntematon linkki',
        url: draft.url || report.url,
        category: draft.category || report.category || 'Yleiset linkit',
        municipality: draft.municipality,
        source: report.source,
        note: draft.note || report.note || '',
        id: report.id,
        createdAt: report.createdAt,
      });
      await updateLinkReportStatus(report.id, 'approved', user?.email, approved.id);
      setReportDrafts((current) => {
        const next = { ...current };
        delete next[report.id];
        return next;
      });
      setReportReviewReasons((current) => {
        const next = { ...current };
        delete next[report.id];
        return next;
      });
    } finally {
      setBusyId(null);
    }
  };

  const rejectReport = async (report: ManagedLinkReportEntry) => {
    setBusyId(report.id);
    try {
      const reviewReason = reportReviewReasons[report.id]?.trim()
        || (report.type === 'new' ? 'Ehdotusta ei hyväksytty tuotantoon.' : '');
      await updateLinkReportStatus(report.id, 'rejected', user?.email, undefined, reviewReason);
      setReportReviewReasons((current) => {
        const next = { ...current };
        delete next[report.id];
        return next;
      });
    } finally {
      setBusyId(null);
    }
  };

  const markDuplicateReport = async (report: ManagedLinkReportEntry) => {
    setBusyId(report.id);
    try {
      await updateLinkReportStatus(report.id, 'rejected', user?.email, undefined, 'Linkki on tuplana');
    } finally {
      setBusyId(null);
    }
  };

  const hideReportedLink = async (report: ManagedLinkReportEntry) => {
    setBusyId(report.id);
    try {
      const normalizedReportUrl = normalizeUrl(report.url);
      const matchingApprovedLinks = approvedLinks.filter((link) => normalizeUrl(link.url) === normalizedReportUrl);
      await addBlockedLink(report.url);
      await Promise.all(matchingApprovedLinks.map((link) => removeApprovedLinkSuggestion(link.id)));
      await updateLinkReportStatus(report.id, 'approved', user?.email);
    } finally {
      setBusyId(null);
    }
  };

  const handleFeedbackStatus = async (item: FeedbackItem, status: FeedbackStatus) => {
    setFeedbackBusyId(item.id);
    setFeedbackMessage('');
    try {
      const publicNote = feedbackNotes[item.id] ?? item.publicNote ?? '';
      await updateFeedbackItem(item.id, status, publicNote, user?.email);
      setFeedbackItems((current) => current.map((currentItem) => (
        currentItem.id === item.id
          ? {
            ...currentItem,
            status,
            publicNote,
            updatedAt: new Date().toISOString(),
            ...(status === 'done' || status === 'rejected' ? { handledAt: new Date().toISOString(), handledBy: user?.email } : {}),
          }
          : currentItem
      )));
      setFeedbackMessage(status === 'done' ? `Palaute ”${item.title}” merkitty käsitellyksi.` : `Palautteen ”${item.title}” tila päivitetty.`);
    } catch (error) {
      if (isAdminAccessError(error)) setAdminSession(null);
      setFeedbackMessage(error instanceof Error ? `Palautteen käsittely epäonnistui: ${error.message}` : 'Palautteen käsittely epäonnistui.');
    } finally {
      setFeedbackBusyId(null);
    }
  };

  const approveFeedbackLink = async (item: FeedbackItem) => {
    const draft = feedbackLinkDrafts[item.id] ?? {
      name: item.title,
      url: extractHttpsUrl(item.description),
      category: '',
      municipality: '',
    };
    if (!draft.name.trim() || !draft.url.trim() || !draft.category.trim()) {
      setFeedbackMessage('Täytä linkin nimi, HTTPS-osoite ja kategoria ennen hyväksymistä.');
      return;
    }

    setFeedbackBusyId(item.id);
    setFeedbackMessage('');
    try {
      const approved = await approveLinkSuggestion({
        name: draft.name,
        url: draft.url,
        category: draft.category,
        municipality: draft.municipality,
        source: 'Palautteen käsittely',
        note: item.description.slice(0, 1000),
      });
      const publicNote = `Linkki hyväksyttiin tuotantoon: ${approved.url}`;
      await updateFeedbackItem(item.id, 'done', publicNote, user?.email);
      setFeedbackItems((current) => current.map((currentItem) => (
        currentItem.id === item.id
          ? { ...currentItem, status: 'done', publicNote, updatedAt: new Date().toISOString() }
          : currentItem
      )));
      setFeedbackNotes((current) => ({ ...current, [item.id]: publicNote }));
      setFeedbackLinkDrafts((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setFeedbackMessage(`Linkki ”${approved.name}” lisättiin tuotantoon ja palaute merkittiin käsitellyksi.`);
    } catch (error) {
      if (isAdminAccessError(error)) setAdminSession(null);
      setFeedbackMessage(error instanceof Error ? `Linkin hyväksyminen epäonnistui: ${error.message}` : 'Linkin hyväksyminen epäonnistui.');
    } finally {
      setFeedbackBusyId(null);
    }
  };

  const runNcscNow = async () => {
    setNcscBusy(true);
    setNcscMessage('');
    try {
      const result = await runNcscScrapeNow();
      setNcscMessage(`Luotu ${result.alertsCreated} varoitusta.`);
    } catch (error) {
      setNcscMessage(error instanceof Error ? error.message : 'Kyberturvallisuuskeskuksen ajon käynnistys epäonnistui.');
    } finally {
      setNcscBusy(false);
    }
  };

  const toggleScamAlertActiveState = async (alert: ScamAlertEntry) => {
    setScamAlertBusyId(alert.id);
    setScamAlertMessage('');
    try {
      await updateScamAlertActiveState(alert.id, !alert.active);
      setScamAlerts((current) => current.map((item) => (
        item.id === alert.id
          ? { ...item, active: !alert.active, updatedAt: new Date().toISOString() }
          : item
      )));
    } catch (error) {
      setScamAlertMessage(error instanceof Error
        ? `Varoituksen päivitys epäonnistui: ${error.message}`
        : 'Varoituksen päivitys epäonnistui.');
    } finally {
      setScamAlertBusyId(null);
    }
  };

  const handleLinkCheckAction = async (item: LinkCheckItem, action: 'approve' | 'block' | 'replace') => {
    const reason = (linkCheckReasons[item.id] ?? '').trim();
    if (reason.length < 3) {
      setLinkCheckActionMessage('Kirjoita käsittelylle vähintään kolmen merkin perustelu.');
      return;
    }
    const replacementName = (linkCheckReplacementNames[item.id] ?? item.name).trim();
    const replacementUrl = (linkCheckReplacementUrls[item.id] ?? item.url).trim();
    if (action === 'replace') {
      if (!replacementName) {
        setLinkCheckActionMessage('Anna linkille nimi.');
        return;
      }
      try {
        const parsed = new URL(replacementUrl);
        if (parsed.protocol !== 'https:' || !parsed.hostname) throw new Error('invalid');
      } catch {
        setLinkCheckActionMessage('Syötä uusi osoite HTTPS-muodossa, esimerkiksi https://esimerkki.fi/palvelu.');
        return;
      }
    }
    setLinkCheckBusyId(item.id);
    setLinkCheckActionMessage('');
    try {
      await actOnLinkCheck(
        item.id,
        action,
        reason,
        action === 'replace' ? replacementUrl : undefined,
        action === 'replace' ? replacementName : undefined,
      );
      if (action === 'replace') await refreshApprovedLinkSuggestions().catch(() => undefined);
      setLinkChecks(await fetchLinkChecks());
      setLinkCheckReasons((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setLinkCheckReplacementUrls((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setLinkCheckReplacementNames((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setLinkCheckActionMessage(action === 'approve'
        ? item.isAutoBlocked
          ? `Linkki ${item.name} palautettiin näkyviin. Se tarkistetaan uudelleen kolmen kuukauden kuluttua.`
          : `Linkki ${item.name} hyväksyttiin toimivaksi. Huomio tarkistetaan uudelleen kolmen kuukauden kuluttua.`
        : action === 'replace'
          ? normalizeUrl(replacementUrl) === normalizeUrl(item.url)
            ? `Linkin ${item.name} nimi ja osoite tallennettiin.`
            : `Linkki ${item.name} korvattiin linkillä ${replacementName}, ja vanha osoite piilotettiin käyttäjiltä.`
          : `Linkki ${item.name} poistettiin käyttäjiltä näkyvistä ja lisättiin ylläpidon pysyvälle estolistalle.`);
    } catch (error) {
      if (isAdminAccessError(error)) setAdminSession(null);
      setLinkCheckActionMessage(error instanceof Error
        ? `Linkkihuomion käsittely epäonnistui: ${error.message}`
        : 'Linkkihuomion käsittely epäonnistui.');
    } finally {
      setLinkCheckBusyId(null);
    }
  };

  const renderLinkCheckActions = (item: LinkCheckItem) => (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-2" htmlFor={`link-check-replacement-name-${item.id}`}>
          <span className="block text-sm font-black text-violet-950 dark:text-violet-100">Linkin nimi</span>
          <input
            id={`link-check-replacement-name-${item.id}`}
            type="text"
            maxLength={160}
            value={linkCheckReplacementNames[item.id] ?? item.name}
            onChange={(event) => setLinkCheckReplacementNames((current) => ({ ...current, [item.id]: event.target.value }))}
            disabled={linkCheckBusyId === item.id}
            className="w-full rounded-xl border-2 border-violet-300 bg-white px-3 py-3 font-bold text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-600/25 disabled:opacity-60 dark:border-violet-700 dark:bg-slate-800 dark:text-white"
          />
        </label>
        <label className="block space-y-2" htmlFor={`link-check-replacement-${item.id}`}>
          <span className="block text-sm font-black text-violet-950 dark:text-violet-100">HTTPS-osoite</span>
          <input
            id={`link-check-replacement-${item.id}`}
            type="url"
            inputMode="url"
            maxLength={2048}
            value={linkCheckReplacementUrls[item.id] ?? item.url}
            onChange={(event) => setLinkCheckReplacementUrls((current) => ({ ...current, [item.id]: event.target.value }))}
            disabled={linkCheckBusyId === item.id}
            className="w-full rounded-xl border-2 border-violet-300 bg-white px-3 py-3 font-bold text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-600/25 disabled:opacity-60 dark:border-violet-700 dark:bg-slate-800 dark:text-white"
          />
        </label>
      </div>
      <label className="block space-y-2" htmlFor={`link-check-reason-${item.id}`}>
        <span className="block text-sm font-black text-slate-700 dark:text-slate-200">Ylläpitäjän perustelu</span>
        <input
          id={`link-check-reason-${item.id}`}
          type="text"
          maxLength={900}
          value={linkCheckReasons[item.id] ?? ''}
          onChange={(event) => setLinkCheckReasons((current) => ({ ...current, [item.id]: event.target.value }))}
          placeholder="Esimerkiksi: tarkistettu selaimessa 31.8.2026"
          disabled={linkCheckBusyId === item.id}
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/25 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </label>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
        Tietojen tallentaminen päivittää käyttäjille näytettävän nimen ja osoitteen. Jos osoite vaihtuu, vanha osoite piilotetaan.
        {item.isAutoBlocked && ' Palauttaminen poistaa automaattisen eston ja hyväksyy tarkistetun linkin kolmeksi kuukaudeksi.'}
        {item.isBlocked && !item.isAutoBlocked && ' Linkki on ylläpitäjän pysyvällä estolistalla; sen voi palauttaa estolistojen hallinnasta tai korvata uudella osoitteella.'}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={linkCheckBusyId === item.id}
          onClick={() => void handleLinkCheckAction(item, 'replace')}
          className="rounded-full bg-violet-700 px-5 py-3 font-black text-white shadow-md transition-all hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-700/35 active:scale-95 disabled:opacity-50"
        >
          {linkCheckBusyId === item.id ? 'Käsitellään…' : 'Tallenna nimi ja osoite'}
        </button>
        {(!item.isBlocked || item.isAutoBlocked) && item.status !== 'rejected' && (
          <button
            type="button"
            disabled={linkCheckBusyId === item.id}
            onClick={() => void handleLinkCheckAction(item, 'approve')}
            className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white shadow-md transition-all hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/35 active:scale-95 disabled:opacity-50"
          >
            {linkCheckBusyId === item.id ? 'Käsitellään…' : item.isAutoBlocked ? 'Palauta näkyviin' : 'Hyväksy toimivaksi'}
          </button>
        )}
        {!item.isBlocked && (
          <button
            type="button"
            disabled={linkCheckBusyId === item.id}
            onClick={() => void handleLinkCheckAction(item, 'block')}
            className="rounded-full bg-rose-700 px-5 py-3 font-black text-white shadow-md transition-all hover:bg-rose-800 focus:outline-none focus:ring-4 focus:ring-rose-700/35 active:scale-95 disabled:opacity-50"
          >
            {linkCheckBusyId === item.id ? 'Käsitellään…' : 'Poista linkki näkyvistä'}
          </button>
        )}
      </div>
    </div>
  );

  const primaryLinkCheckIds = new Set([
    ...linkChecks.items.map((item) => item.id),
    ...linkChecks.domainChangedItems.map((item) => item.id),
  ]);
  const otherStatusItems = (linkChecks.statusItems ?? []).filter((item) => !primaryLinkCheckIds.has(item.id));

  return (
    <main className="aurora-page">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 md:px-8 md:py-12">
        <header className="aurora-subpage-hero space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="aurora-kicker">
              Ylläpito
            </span>
            <HomeLink />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Ylläpidon työtila</h1>
          <p className="max-w-3xl text-base font-semibold text-white/75 md:text-lg">
            Seuraa käyttöä, käsittele linkkiehdotukset ja ylläpidä huijausvaroituksia yhdessä suojatussa näkymässä.
          </p>
        </header>

        {!isFirebaseConfigured ? (
          <section className="aurora-soft-panel max-w-3xl space-y-3 p-6 shadow-sm">
            <h2 className="aurora-section-title text-2xl">Firebase-asetukset puuttuvat</h2>
            <p className="font-bold text-[var(--theme-text-2)]">
              Lisää julkaisuun Firebase Authenticationin julkiset ympäristömuuttujat. Firebasea käytetään ylläpitäjän kirjautumiseen, ja palvelin ratkaisee käyttöoikeuden.
            </p>
          </section>
        ) : !authReady ? (
          <p className="font-black text-[var(--theme-text-3)]">Tarkistetaan kirjautumista...</p>
        ) : !user ? (
          <section className="aurora-panel mx-auto max-w-xl space-y-6 p-8">
            <h2 className="aurora-section-title text-3xl">Kirjaudu ylläpitoon</h2>
            <p className="font-bold text-[var(--theme-text-2)]">
              Käytä ylläpitäjän Google-tunnusta.
            </p>
            {authError && <p className="font-bold text-rose-600">{authError}</p>}
            <button
              type="button"
              onClick={signIn}
              className="rounded-full bg-[var(--theme-primary)] px-5 py-3 font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95"
            >
              Kirjaudu Googlella
            </button>
          </section>
        ) : !adminAccessReady ? (
          <p className="font-black text-[var(--theme-text-3)]">Vahvistetaan ylläpito-oikeutta palvelimelta...</p>
        ) : !hasAdminAccess ? (
          <section className="aurora-panel max-w-2xl space-y-4 p-8">
            <h2 className="aurora-section-title text-3xl">Ei käyttöoikeutta</h2>
            <p className="font-bold text-[var(--theme-text-2)]">
              Olet kirjautunut osoitteella {userEmail || 'tuntematon sähköposti'}. Ylläpitoon pääsee vain ylläpitäjän tunnuksella.
            </p>
            {authError && <p className="font-bold text-rose-600">{authError}</p>}
            {authDebugInfo && (
              <p className="rounded-xl bg-[var(--theme-pale)] p-3 text-sm font-bold text-[var(--theme-text-2)]">
                {authDebugInfo}
              </p>
            )}
            <button
              type="button"
              onClick={signOutAdmin}
              className="aurora-secondary-button px-5 py-3 shadow-md"
            >
              Kirjaudu ulos
            </button>
          </section>
        ) : (
          <>
            <div className="aurora-panel flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-black">Kirjautunut: {userEmail}</p>
                <p className="text-sm font-bold text-[var(--theme-text-3)]">
                  Odottaa: {pendingReports.length} linkkiehdotusta · Avoimia palautteita: {openFeedbackItems.length} · Hyväksyttyjä linkkejä: {approvedLinks.length}
                </p>
                {authDebugInfo && (
                  <p className="mt-2 max-w-3xl text-xs font-bold text-[var(--theme-text-3)]">
                    {authDebugInfo}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="./index.html"
                  className="aurora-secondary-button border border-[var(--theme-border)] px-5 py-3 shadow-sm"
                >
                  Palaa etusivulle
                </a>
                <button
                  type="button"
                  onClick={signOutAdmin}
                  className="aurora-secondary-button border border-[var(--theme-border)] px-5 py-3 shadow-sm"
                >
                  Kirjaudu ulos
                </button>
              </div>
            </div>

            <section className="space-y-4" aria-labelledby="review-dashboard-heading">
              <div>
                <h2 id="review-dashboard-heading" className="aurora-section-title text-2xl md:text-3xl">Tarkista nämä ensin</h2>
                <p className="text-sm font-bold text-[var(--theme-text-3)]">
                  Nopea näkymä avoimiin asioihin, automaation huomioihin ja sivutekstien editoriin.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
                {reviewTasks.map((task) => (
                  <a
                    key={task.href}
                    href={task.href}
                    className="aurora-card transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40"
                  >
                    <div>
                      <p className="font-black text-[var(--theme-text)]">{task.label}</p>
                      <span className={`mt-3 inline-flex max-w-full items-center rounded-full px-3 py-1 text-sm font-black ${task.tone}`}>
                        {task.count}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-[var(--theme-text-3)]">
                      {task.note}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            <SiteContentEditor onAccessError={() => setAdminSession(null)} />

            <section id="feedback" className="scroll-mt-6 space-y-5 rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm dark:border-rose-900 dark:bg-rose-950/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black md:text-3xl">Palautteet</h2>
                  <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                    Avoimet palautteet haetaan suoraan ylläpidon tietokannasta. Tila <span className="font-black">Käsitelty</span> tai <span className="font-black">Sivuutettu</span> poistaa palautteen avoimesta laskurista.
                  </p>
                </div>
                <span className={`rounded-full px-4 py-2 text-lg font-black ${openFeedbackItems.length > 0 ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/50 dark:text-rose-100' : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/50 dark:text-emerald-100'}`}>
                  Avoimia {openFeedbackItems.length}
                </span>
              </div>
              {feedbackMessage && (
                <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 font-bold text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100" role="status" aria-live="polite">
                  {feedbackMessage}
                </p>
              )}
              {feedbackItems.length === 0 ? (
                <p className="rounded-2xl bg-white p-4 font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  Palautteita ei löytynyt palvelimen palautetaulusta.
                </p>
              ) : (
                <div className="space-y-3">
                  {feedbackItems.map((item) => {
                    const isOpen = openFeedbackItems.some((openItem) => openItem.id === item.id);
                    const feedbackLinkDraft = feedbackLinkDrafts[item.id] ?? {
                      name: item.title,
                      url: extractHttpsUrl(item.description),
                      category: '',
                      municipality: '',
                    };
                    return (
                      <article key={item.id} className={`rounded-2xl border p-5 shadow-sm ${isOpen ? 'border-rose-200 bg-white dark:border-rose-900 dark:bg-slate-900' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-800 dark:bg-slate-700 dark:text-slate-100">{feedbackTypeLabel[item.type]}</span>
                              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${isOpen ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/50 dark:text-rose-100' : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/50 dark:text-emerald-100'}`}>
                                {feedbackStatusLabel[item.status]}
                              </span>
                            </div>
                            <h3 className="mt-3 text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
                            <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{item.page || 'Ei sivutietoa'} · Lähetetty {formatDateTime(item.createdAt)}</p>
                          </div>
                        </div>
                        <p className="mt-4 whitespace-pre-wrap text-base font-bold text-slate-700 dark:text-slate-200">{item.description}</p>
                        {item.publicNote && <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">Ylläpidon huomio: {item.publicNote}</p>}
                        {isOpen && (
                          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                            {item.type === 'link' ? (
                              <div className="space-y-3 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                                <div>
                                  <p className="font-black text-blue-950 dark:text-blue-100">Hyväksy linkki suoraan tuotantoon</p>
                                  <p className="mt-1 text-sm font-bold text-blue-900 dark:text-blue-200">Tarkista tiedot. Hyväksyminen lisää linkin linkkiluetteloon ja merkitsee palautteen käsitellyksi.</p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  <label className="space-y-1">
                                    <span className="text-sm font-black text-blue-950 dark:text-blue-100">Linkin nimi</span>
                                    <input
                                      value={feedbackLinkDraft.name}
                                      onChange={(event) => setFeedbackLinkDrafts((current) => ({
                                        ...current,
                                        [item.id]: { ...feedbackLinkDraft, name: event.target.value },
                                      }))}
                                      className="w-full rounded-xl border-2 border-blue-200 bg-white px-3 py-2 font-bold text-slate-900 dark:border-blue-800 dark:bg-slate-900 dark:text-white"
                                    />
                                  </label>
                                  <label className="space-y-1">
                                    <span className="text-sm font-black text-blue-950 dark:text-blue-100">Kategoria</span>
                                    <input
                                      value={feedbackLinkDraft.category}
                                      onChange={(event) => setFeedbackLinkDrafts((current) => ({
                                        ...current,
                                        [item.id]: { ...feedbackLinkDraft, category: event.target.value },
                                      }))}
                                      placeholder="Esim. Asiointi"
                                      className="w-full rounded-xl border-2 border-blue-200 bg-white px-3 py-2 font-bold text-slate-900 dark:border-blue-800 dark:bg-slate-900 dark:text-white"
                                    />
                                  </label>
                                  <label className="space-y-1">
                                    <span className="text-sm font-black text-blue-950 dark:text-blue-100">Paikkakunta</span>
                                    <select
                                      value={feedbackLinkDraft.municipality}
                                      onChange={(event) => setFeedbackLinkDrafts((current) => ({
                                        ...current,
                                        [item.id]: { ...feedbackLinkDraft, municipality: event.target.value },
                                      }))}
                                      className="w-full rounded-xl border-2 border-blue-200 bg-white px-3 py-2 font-bold text-slate-900 dark:border-blue-800 dark:bg-slate-900 dark:text-white"
                                    >
                                      <option value="">Valtakunnallinen</option>
                                      {MUNICIPALITIES.map((municipality) => (
                                        <option key={municipality.code} value={municipality.name}>{municipality.name}</option>
                                      ))}
                                    </select>
                                  </label>
                                </div>
                                <label className="block space-y-1">
                                  <span className="text-sm font-black text-blue-950 dark:text-blue-100">HTTPS-osoite</span>
                                  <input
                                    type="url"
                                    value={feedbackLinkDraft.url}
                                    onChange={(event) => setFeedbackLinkDrafts((current) => ({
                                      ...current,
                                      [item.id]: { ...feedbackLinkDraft, url: event.target.value },
                                    }))}
                                    placeholder="https://..."
                                    className="w-full rounded-xl border-2 border-blue-200 bg-white px-3 py-2 font-bold text-slate-900 dark:border-blue-800 dark:bg-slate-900 dark:text-white"
                                  />
                                </label>
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    disabled={feedbackBusyId === item.id}
                                    onClick={() => void approveFeedbackLink(item)}
                                    className="rounded-full bg-blue-700 px-5 py-3 font-black text-white shadow-md transition-all hover:bg-blue-800 active:scale-95 disabled:opacity-50"
                                  >
                                    Hyväksy linkki tuotantoon
                                  </button>
                                </div>
                              </div>
                            ) : null}
                            <label className="block space-y-2" htmlFor={`feedback-note-${item.id}`}>
                              <span className="block text-sm font-black text-slate-700 dark:text-slate-200">Ylläpidon huomio (valinnainen)</span>
                              <textarea
                                id={`feedback-note-${item.id}`}
                                value={feedbackNotes[item.id] ?? item.publicNote ?? ''}
                                onChange={(event) => setFeedbackNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                                maxLength={1600}
                                rows={2}
                                disabled={feedbackBusyId === item.id}
                                className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/25 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                              />
                            </label>
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                                <span className="sr-only">Palautteen tila</span>
                                <select
                                  value={item.status}
                                  onChange={(event) => void handleFeedbackStatus(item, event.target.value as FeedbackStatus)}
                                  disabled={feedbackBusyId === item.id}
                                  className="rounded-full border-2 border-slate-300 bg-white px-3 py-2 font-black text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                >
                                  {(['new', 'triage', 'planned', 'in_progress', 'done', 'rejected'] as FeedbackStatus[]).map((status) => <option key={status} value={status}>{feedbackStatusLabel[status]}</option>)}
                                </select>
                              </label>
                              <button
                                type="button"
                                disabled={feedbackBusyId === item.id}
                                onClick={() => void handleFeedbackStatus(item, 'rejected')}
                                className="rounded-full bg-slate-200 px-5 py-3 font-black text-slate-900 shadow-md transition-all hover:bg-slate-300 active:scale-95 disabled:opacity-50"
                              >
                                Hylkää palaute
                              </button>
                              <button
                                type="button"
                                disabled={feedbackBusyId === item.id}
                                onClick={() => void handleFeedbackStatus(item, 'done')}
                                className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                              >
                                {feedbackBusyId === item.id ? 'Päivitetään...' : 'Merkitse käsitellyksi'}
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section id="link-checks" className="scroll-mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black md:text-3xl">Automaattinen linkkitarkistus</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Tarkistaa linkit pienissä erissä, vaatii HTTPS-yhteyden ja vahvistaa virheen toistolla ennen ilmoitusta.
                  </p>
                </div>
                <span className={`rounded-full px-4 py-2 text-lg font-black ${linkChecks.summary.attention > 0 ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100'}`}>
                  Huomioitavia {linkChecks.summary.attention}
                </span>
              </div>

              {linkCheckError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{linkCheckError}</p>
              ) : (
                <>
                  {linkCheckActionMessage && (
                    <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 font-bold text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100" role="status" aria-live="polite">
                      {linkCheckActionMessage}
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-8">
                    {[
                      ['Linkkejä', linkChecks.summary.total],
                      ['Kunnossa', linkChecks.summary.ok],
                      ['Odottaa', linkChecks.summary.pending],
                      ['Varoituksia', linkChecks.summary.warnings],
                      ['Epäonnistuu', linkChecks.summary.failing],
                      ['HTTPS-sääntö', linkChecks.summary.rejected],
                      ['Domain vaihtui', linkChecks.summary.domainChanged],
                      ['Tarkistusvuorossa', linkChecks.summary.due],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                        <p className="mt-2 text-3xl font-black">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Viimeisin ajo: {linkChecks.lastRun ? `${formatDateTime(linkChecks.lastRun.startedAt)} · tarkistettu ${linkChecks.lastRun.checked} · tila ${linkChecks.lastRun.status}` : 'ei vielä ajohistoriaa'}.
                    {' '}Hälytysraja on {linkChecks.alertAfterFailures} peräkkäistä epäonnistumista.
                    {' '}Automaattinen piilotus on {linkChecks.autoBlockEnabled ? 'käytössä' : 'pois käytöstä'}.
                    {' '}Arvioitu täysi kierros nykyisellä tuntiajolla on {linkChecks.summary.estimatedCycleDays.toLocaleString('fi-FI')} vrk.
                    {linkChecks.summary.oldestCheckedAt ? ` Vanhin viimeisin tarkistus on ${formatDateTime(linkChecks.summary.oldestCheckedAt)}.` : ''}
                  </p>
                  {linkChecks.lastRun && (linkChecks.lastRun.blocked > 0 || linkChecks.lastRun.unblocked > 0 || linkChecks.lastRun.messageCode) && (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100" role="status">
                      {linkChecks.lastRun.blocked > 0 && `Piilotettu automaattisesti ${linkChecks.lastRun.blocked}. `}
                      {linkChecks.lastRun.unblocked > 0 && `Palautettu näkyviin ${linkChecks.lastRun.unblocked}. `}
                      {getLinkCheckRunMessage(linkChecks.lastRun.messageCode)}
                    </p>
                  )}
                  {linkChecks.domainChangedItems.length > 0 && (
                    <details open className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900 dark:bg-violet-950/20">
                      <summary className="cursor-pointer font-black text-violet-950 dark:text-violet-100">
                        Verkkotunnus vaihtui – tarkista kohde ({linkChecks.domainChangedItems.length})
                      </summary>
                      <p className="mt-3 text-sm font-bold text-violet-900 dark:text-violet-200">
                        Linkki vastaa, mutta se päätyy eri verkkotunnukseen. Varmista kohdesivu ylläpidossa ennen kuin päivität linkin lähdetiedostoon.
                      </p>
                      <div className="mt-4 space-y-3">
                        {linkChecks.domainChangedItems.map((item) => (
                          <article key={item.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
                            <h3 className="font-black">{item.name}</h3>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.category} · {item.source}</p>
                            <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Alkuperäinen</p>
                            <a href={item.url} target="_blank" rel="noreferrer" className="block break-all font-bold text-blue-700 underline dark:text-blue-300">{item.url}</a>
                            <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Lopullinen kohde</p>
                            {item.finalUrl ? (
                              <a href={item.finalUrl} target="_blank" rel="noreferrer" className="block break-all font-bold text-blue-700 underline dark:text-blue-300">{item.finalUrl}</a>
                            ) : (
                              <p className="font-bold text-slate-700 dark:text-slate-200">Kohdeosoitetta ei saatu talteen.</p>
                            )}
                            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">Tarkistettu {formatDateTime(item.lastCheckedAt ?? undefined)}</p>
                            {renderLinkCheckActions(item)}
                          </article>
                        ))}
                      </div>
                    </details>
                  )}
                  {linkChecks.items.length === 0 ? (
                    <p className="rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                      Vahvistettuja linkkiongelmia ei ole.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {linkChecks.items.map((item) => (
                        <article key={item.id} className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900 dark:bg-rose-950/20">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-black text-slate-950 dark:text-white">{item.name}</h3>
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.category} · {item.source}</p>
                            </div>
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-black text-rose-950 dark:bg-rose-900/50 dark:text-rose-100">
                              {item.failureCount} kertaa
                            </span>
                          </div>
                          <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 block break-all font-bold text-blue-700 underline dark:text-blue-300">{item.url}</a>
                          <p className="mt-2 text-sm font-bold text-rose-900 dark:text-rose-200">
                            {getLinkCheckErrorLabel(item.errorCode)}{item.httpStatus ? ` HTTP ${item.httpStatus}.` : ''}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                            Tarkistettu {formatDateTime(item.lastCheckedAt ?? undefined)} · seuraava yritys {formatDateTime(item.nextCheckAt)}
                          </p>
                          {renderLinkCheckActions(item)}
                        </article>
                      ))}
                    </div>
                  )}
                  {otherStatusItems.length > 0 && (
                    <details open className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20">
                      <summary className="cursor-pointer font-black text-sky-950 dark:text-sky-100">
                        Varoitusten ja muiden epäonnistumisten tiedot ({otherStatusItems.length})
                      </summary>
                      <p className="mt-3 text-sm font-bold text-sky-900 dark:text-sky-200">
                        Varoitus tarkoittaa usein sitä, että palvelin rajoittaa automaattista tarkistusta. Ensimmäisen epäonnistumisen automaatio tarkistaa uudelleen ennen vahvistettua huomiota. Linkin voi silti tarkistaa ja käsitellä heti ylläpidossa.
                      </p>
                      <div className="mt-4 space-y-3">
                        {otherStatusItems.map((item) => (
                          <article key={item.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h3 className="font-black">{item.name}</h3>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.category} · {item.source}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className={`rounded-full px-3 py-1 text-sm font-black ${item.status === 'warning' ? 'bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-amber-100' : 'bg-rose-100 text-rose-950 dark:bg-rose-900/50 dark:text-rose-100'}`}>
                                  {item.status === 'warning' ? 'Varoitus' : `Epäonnistui ${item.failureCount} kertaa`}
                                </span>
                                {item.isBlocked && (
                                  <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-black text-slate-800 dark:bg-slate-700 dark:text-slate-100">Piilotettu</span>
                                )}
                                {item.overrideScope && (
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-950 dark:bg-emerald-900/50 dark:text-emerald-100">Hyväksytty poikkeus</span>
                                )}
                              </div>
                            </div>
                            <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 block break-all font-bold text-blue-700 underline dark:text-blue-300">{item.url}</a>
                            <p className="mt-2 text-sm font-bold text-sky-950 dark:text-sky-100">
                              {getLinkCheckErrorLabel(item.errorCode)}{item.httpStatus ? ` HTTP ${item.httpStatus}.` : ''}
                            </p>
                            {item.finalUrl && normalizeUrl(item.finalUrl) !== normalizeUrl(item.url) && (
                              <p className="mt-2 break-all text-sm font-bold text-slate-600 dark:text-slate-300">Lopullinen osoite: {item.finalUrl}</p>
                            )}
                            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                              Tarkistettu {formatDateTime(item.lastCheckedAt ?? undefined)} · seuraava yritys {formatDateTime(item.nextCheckAt)}
                            </p>
                            {item.overrideScope && (
                              <p className="mt-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                                Ylläpitäjän hyväksyntä on voimassa{item.overrideNextReviewAt ? ` ${formatDateTime(item.overrideNextReviewAt)} asti` : ''}.
                              </p>
                            )}
                            {renderLinkCheckActions(item)}
                          </article>
                        ))}
                      </div>
                    </details>
                  )}
                  {linkChecks.rejectedItems.length > 0 && (
                    <details className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                      <summary className="cursor-pointer font-black text-amber-950 dark:text-amber-100">
                        HTTPS-säännön vastaiset linkit ({linkChecks.rejectedItems.length})
                      </summary>
                      <p className="mt-3 text-sm font-bold text-amber-900 dark:text-amber-200">
                        Näitä osoitteita ei avata käyttäjille eikä tarkisteta toistuvasti. Päivitä lähdetiedostoon toimiva https://-osoite tai poista vanhentunut linkki.
                      </p>
                      <div className="mt-4 space-y-3">
                        {linkChecks.rejectedItems.map((item) => (
                          <article key={item.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
                            <h3 className="font-black">{item.name}</h3>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.category} · {item.source}</p>
                            <p className="mt-2 break-all font-bold text-slate-800 dark:text-slate-100">{item.url}</p>
                            <p className="mt-2 text-sm font-bold text-amber-900 dark:text-amber-200">{getLinkCheckErrorLabel(item.errorCode)}</p>
                            {renderLinkCheckActions(item)}
                          </article>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
            </section>

            <section id="usage-stats" className="scroll-mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">Käyttötilastot</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Karkea laskuri ilman evästeitä, käyttäjätunnisteita, IP-tallennusta tai maantieteellistä tarkkuutta.
                  </p>
                </div>
                <span className="rounded-full bg-cyan-100 px-4 py-2 text-lg font-black text-cyan-950 dark:bg-cyan-900/40 dark:text-cyan-100">
                  Etusivu {usageTotals.frontPageViews}
                </span>
              </div>

              <label className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/30 md:flex-row md:items-center md:justify-between">
                <span>
                  <span className="block font-black text-cyan-950 dark:text-cyan-100">
                    Älä raportoi tämän selaimen käyttöä
                  </span>
                  <span className="mt-1 block text-sm font-bold text-cyan-900/80 dark:text-cyan-100/75">
                    Asetus tallentuu vain tälle koneelle ja selaimelle. Paikallinen kehityspalvelin jätetään aina tilastojen ulkopuolelle.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={usageTrackingDisabled}
                  onChange={(event) => updateUsageTrackingPreference(event.target.checked)}
                  className="h-6 w-6 shrink-0 accent-cyan-700"
                />
              </label>

              <div className="flex flex-wrap gap-2" aria-label="Käyttötilaston aikaväli">
                {(Object.keys(usageRangeLabels) as UsageRangeMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setUsageRangeMode(mode)}
                    className={`${usageRangeMode === mode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'} rounded-full px-4 py-2 text-sm font-black transition-colors`}
                  >
                    {usageRangeLabels[mode]}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-black text-slate-600 dark:text-slate-300">Alkupäivä</span>
                  <input
                    type="date"
                    value={usageRange.start}
                    onChange={(event) => {
                      setUsageRangeMode('custom');
                      setUsageRange((current) => ({ ...current, start: event.target.value }));
                    }}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-black text-slate-600 dark:text-slate-300">Loppupäivä</span>
                  <input
                    type="date"
                    value={usageRange.end}
                    onChange={(event) => {
                      setUsageRangeMode('custom');
                      setUsageRange((current) => ({ ...current, end: event.target.value }));
                    }}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              </div>

              {usageStatsError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {usageStatsError}
                </p>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Etusivu</p>
                      <p className="mt-2 text-3xl font-black">{usageStatsBusy ? '...' : usageTotals.frontPageViews}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Linkkiklikkaukset</p>
                      <p className="mt-2 text-3xl font-black">{usageStatsBusy ? '...' : usageTotals.totalLinkClicks}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Päiviä valinnassa</p>
                      <p className="mt-2 text-3xl font-black">{usageStats.length}</p>
                    </div>
                  </div>

                  <section className="space-y-5 rounded-3xl border-2 border-cyan-200 bg-cyan-50/70 p-4 dark:border-cyan-900 dark:bg-cyan-950/20 md:p-6" aria-labelledby="growth-metrics-heading">
                    <div>
                      <h3 id="growth-metrics-heading" className="text-2xl font-black">Kasvumittarit</h3>
                      <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                        Suorat avaukset ovat aloitussivukäytön yläraja. Tiedot ovat päiväkohtaisia koosteita ilman käyttäjä- tai istuntotunnisteita.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {[
                        ['Suorat avaukset', growthMetrics.direct, `${growthMetrics.directShare.toFixed(1)} % kaikista`],
                        ['Ohje avattu', growthMetrics.funnel.opened, 'suppilon alku'],
                        ['Selain valittu', growthMetrics.funnel.browser, 'ohje avattu'],
                        ['Valmis', growthMetrics.funnel.done, `${growthMetrics.funnel.completion.toFixed(1)} % avauksista`],
                        ['Ohje jaettu', growthMetrics.funnel.shared, 'läheiselle'],
                      ].map(([label, value, note]) => (
                        <div key={label} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                          <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                          <p className="mt-1 text-3xl font-black">{value}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{note}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="text-lg font-black">Suorien avausten kehitys</h4>
                        <div className="max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                          <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                              <tr>
                                <th className="px-3 py-2 font-black">Päivä</th>
                                <th className="px-3 py-2 font-black">Suorat</th>
                                <th className="px-3 py-2 font-black">Osuus</th>
                                <th className="px-3 py-2 font-black">7 pv</th>
                              </tr>
                            </thead>
                            <tbody>
                              {growthMetrics.dailyDirect.map((day) => (
                                <tr key={day.date} className="border-t border-slate-200 dark:border-slate-800">
                                  <td className="px-3 py-2 font-bold">{day.date}</td>
                                  <td className="px-3 py-2 font-bold">{day.direct}</td>
                                  <td className="px-3 py-2 font-bold">{day.share.toFixed(1)} %</td>
                                  <td className="px-3 py-2 font-bold">{day.rollingShare.toFixed(1)} %</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-lg font-black">Tilastoinnin tietosuoja</h4>
                        <p className="rounded-2xl bg-white p-4 font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          Tilastot ovat päiväkohtaisia yhteenvetoja. Niissä ei näytetä yksittäisiä linkkiosoitteita, kellonaikoja tai kampanjalähteitä.
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="text-xl font-black">Päivittäin</h3>
                      <div className="max-h-80 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-sm">
                          <thead className="sticky top-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <tr>
                              <th className="px-4 py-3 font-black">Päivä</th>
                              <th className="px-4 py-3 font-black">Etusivu</th>
                              <th className="px-4 py-3 font-black">Klikit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usageStats.map((day) => (
                              <tr key={day.date} className="border-t border-slate-200 dark:border-slate-800">
                                <td className="px-4 py-3 font-bold">{day.date}</td>
                                <td className="px-4 py-3 font-bold">{getFrontPageViews(day)}</td>
                                <td className="px-4 py-3 font-bold">{day.totalLinkClicks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-black">Suosituimmat kategoriat</h3>
                      {usageTotals.topCategories.length === 0 ? (
                        <p className="font-bold text-slate-500 dark:text-slate-400">Ei linkkiklikkauksia valitulla aikavälillä.</p>
                      ) : (
                        <div className="grid gap-3">
                          {usageTotals.topCategories.map((category) => (
                            <article key={category.category} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-black break-words">{category.category}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-cyan-100 px-3 py-1 text-sm font-black text-cyan-950 dark:bg-cyan-900/40 dark:text-cyan-100">
                                  {category.count}
                                </span>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>

            <section id="scam-alerts-admin" className="order-last space-y-4 scroll-mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">Huijausvaroitukset</h2>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Aktiiviset varoitukset ja Kyberturvallisuuskeskuksen viikkokatsauksen automaattinen haku. Ylläpitolista näyttää kahden viime kuukauden historian sekä sitä vanhemmat yhä voimassa olevat varoitukset.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={ncscBusy}
                  onClick={runNcscNow}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
                >
                  {ncscBusy ? 'Ajetaan...' : 'Aja nyt'}
                </button>
              </div>

              {ncscMessage && (
                <p className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 font-bold text-slate-700 dark:text-slate-200">
                  {ncscMessage}
                </p>
              )}

              {scamAlertMessage && (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {scamAlertMessage}
                </p>
              )}

              <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-5">
                  <h3 className="text-xl font-black">Aktiiviset varoitukset</h3>
                  {activeScamAlerts.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Ei aktiivisia varoituksia.</p>
                  ) : (
                    <div className="grid gap-3">
                      {activeScamAlerts.slice(0, 20).map((alert) => (
                        <article key={alert.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                              {severityLabel[alert.severity]}
                            </span>
                            {alert.source === 'ncsc-auto' && (
                              <span className="rounded-full bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                                Kyberturvallisuuskeskus
                              </span>
                            )}
                            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${alert.active ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                              {alert.active ? 'Aktiivinen' : 'Pois päältä'}
                            </span>
                          </div>
                          <div>
                            <p className="font-black text-lg">{alert.title}</p>
                            <p className="mt-1 font-bold text-slate-600 dark:text-slate-300">{alert.body}</p>
                          </div>
                          {alert.source === 'ncsc-auto' && alert.originalHeading && (
                            <details className="rounded-xl bg-white dark:bg-slate-900 p-3">
                              <summary className="cursor-pointer text-sm font-black text-slate-500 dark:text-slate-400">
                                Alkuperäinen otsikko
                              </summary>
                              <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{alert.originalHeading}</p>
                              {alert.sourceUrl && (
                                <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm font-black text-indigo-600 dark:text-indigo-300 hover:underline">
                                  Avaa lähde
                                </a>
                              )}
                            </details>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Luotu {formatDateTime(alert.createdAt)}</span>
                            <button
                              type="button"
                              disabled={scamAlertBusyId === alert.id}
                              onClick={() => toggleScamAlertActiveState(alert)}
                              className="rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-900 px-4 py-2 font-black transition-all active:scale-95"
                            >
                              {scamAlertBusyId === alert.id ? 'Päivitetään...' : 'Poista näkyvistä'}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
                    <h3 className="text-xl font-black">Pois näkyvistä</h3>
                    {hiddenScamAlerts.length === 0 ? (
                      <p className="mt-3 text-slate-500 dark:text-slate-400 font-bold">Ei piilotettuja varoituksia.</p>
                    ) : (
                      <div className="mt-3 grid gap-3">
                        {hiddenScamAlerts.slice(0, 20).map((alert) => (
                          <article key={alert.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3 opacity-90">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                                {severityLabel[alert.severity]}
                              </span>
                              <span className="rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 text-xs font-black uppercase tracking-wide">
                                Pois päältä
                              </span>
                            </div>
                            <div>
                              <p className="font-black text-lg">{alert.title}</p>
                              <p className="mt-1 font-bold text-slate-600 dark:text-slate-300">{alert.body}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <span>Päivitetty {formatDateTime(alert.updatedAt || alert.createdAt)}</span>
                              <button
                                type="button"
                                disabled={scamAlertBusyId === alert.id}
                                onClick={() => toggleScamAlertActiveState(alert)}
                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 font-black transition-all active:scale-95"
                              >
                                {scamAlertBusyId === alert.id ? 'Päivitetään...' : 'Näytä uudelleen'}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  <h3 className="text-xl font-black">Kyberturvallisuuskeskuksen automaatio</h3>
                  {ncscLogError ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                      {ncscLogError}
                    </p>
                  ) : ncscLogs.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Ei ajolokia.</p>
                  ) : (
                    <div className="grid gap-3">
                      {ncscLogs.map((log) => (
                        <article key={log.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-black">{log.weekLabel || 'Viikko tuntematon'}</p>
                            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${ncscBadgeClass(log)}`}>
                              {ncscStructureLabel[log.structureVersion] ?? 'Tulkinta tuntematon'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            {formatDateTime(log.processedAt)}
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                            Luotu {log.alertsCreated} varoitusta
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section id="pending-new-links" className="space-y-4 scroll-mt-6">
              <h2 className="text-2xl md:text-3xl font-black">Hyväksyttävät uudet linkit</h2>
              {pendingNewReports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-bold">Ei uusia linkkiehdotuksia.</p>
              ) : (
                <div className="grid gap-4">
                  {pendingNewReports.map((report) => {
                    const draft = reportDrafts[report.id] ?? {
                      name: report.name || '',
                      url: report.url || '',
                      category: report.category || '',
                      municipality: '',
                      note: report.note || '',
                    };

                    return (
                      <article key={report.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                            {report.source}
                          </span>
                          <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                            {statusLabel[report.status]}
                          </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2">
                            <span className="block font-black text-slate-700 dark:text-slate-200">Nimi</span>
                            <input
                              value={draft.name}
                              onChange={(event) => setReportDrafts((current) => ({
                                ...current,
                                [report.id]: { ...draft, name: event.target.value },
                              }))}
                              className="w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="block font-black text-slate-700 dark:text-slate-200">Osoite</span>
                            <input
                              value={draft.url}
                              onChange={(event) => setReportDrafts((current) => ({
                                ...current,
                                [report.id]: { ...draft, url: event.target.value },
                              }))}
                              className="w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white"
                            />
                          </label>
                        </div>

                        <label className="space-y-2 block">
                          <span className="block font-black text-slate-700 dark:text-slate-200">Kategoria</span>
                          <input
                            value={draft.category}
                            onChange={(event) => setReportDrafts((current) => ({
                              ...current,
                              [report.id]: { ...draft, category: event.target.value },
                            }))}
                            className="w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white"
                            placeholder="Esim. Turvallisuus"
                          />
                        </label>

                        <label className="space-y-2 block">
                          <span className="block font-black text-slate-700 dark:text-slate-200">Lisätieto</span>
                          <textarea
                            value={draft.note}
                            onChange={(event) => setReportDrafts((current) => ({
                              ...current,
                              [report.id]: { ...draft, note: event.target.value },
                            }))}
                            className="w-full min-h-[100px] rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white resize-y"
                          />
                        </label>

                        <label className="space-y-2 block">
                          <span className="block font-black text-slate-700 dark:text-slate-200">Hylkäyksen perustelu (julkinen, valinnainen)</span>
                          <textarea
                            value={reportReviewReasons[report.id] ?? ''}
                            onChange={(event) => setReportReviewReasons((current) => ({
                              ...current,
                              [report.id]: event.target.value,
                            }))}
                            className="w-full min-h-[84px] rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white resize-y"
                            placeholder="Perustelu näkyy palautteiden käsittelysivulla."
                            maxLength={1000}
                          />
                        </label>

                        <label className="space-y-2 block">
                          <span className="block font-black text-slate-700 dark:text-slate-200">Paikkakunta</span>
                          <select
                            value={draft.municipality}
                            onChange={(event) => setReportDrafts((current) => ({
                              ...current,
                              [report.id]: { ...draft, municipality: event.target.value },
                            }))}
                            className="w-full rounded-2xl border-4 border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="">Valtakunnallinen</option>
                            {MUNICIPALITIES.map((municipality) => (
                              <option key={municipality.code} value={municipality.name}>{municipality.name}</option>
                            ))}
                          </select>
                          <span className="block text-sm font-bold text-slate-500 dark:text-slate-400">Paikallinen linkki näkyy vain valitun kunnan käyttäjille.</span>
                        </label>

                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <button
                            type="button"
                            disabled={busyId === report.id}
                            onClick={() => rejectReport(report)}
                            className="rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-900 px-5 py-3 font-black shadow-md transition-all active:scale-95"
                          >
                            Hylkää ehdotus
                          </button>
                          <button
                            type="button"
                            disabled={busyId === report.id}
                            onClick={() => approveReport(report)}
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
                          >
                            Lisää linkki
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section id="issue-reports" className="space-y-4 scroll-mt-6">
              <h2 className="text-2xl md:text-3xl font-black">Muut ilmoitukset</h2>
              {issueReports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-bold">Ei muita avoimia ilmoituksia.</p>
              ) : (
                <div className="grid gap-4">
                  {issueReports.map((report) => (
                    <article key={report.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                          {report.type}
                        </span>
                        <span className="font-bold text-slate-500 dark:text-slate-400">{report.category || 'Ei kategoriaa'}</span>
                      </div>
                      <p className="mt-3 font-black text-slate-900 dark:text-white">{report.name}</p>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 break-all">{report.url}</p>
                      {report.note && <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">{report.note}</p>}
                      <div className="mt-4 flex flex-wrap justify-end gap-3">
                        <button
                          type="button"
                          disabled={busyId === report.id}
                          onClick={() => rejectReport(report)}
                          className="rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-900 px-5 py-3 font-black shadow-md transition-all active:scale-95"
                        >
                          Sivuuta ilmoitus
                        </button>
                        <button
                          type="button"
                          disabled={busyId === report.id}
                          onClick={() => markDuplicateReport(report)}
                          className="rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 px-5 py-3 font-black shadow-md transition-all active:scale-95"
                        >
                          Merkitse tuplaksi
                        </button>
                        <button
                          type="button"
                          disabled={busyId === report.id}
                          onClick={() => hideReportedLink(report)}
                          className="rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
                        >
                          Poista linkki näkyvistä
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="approved-links" className="space-y-4 scroll-mt-6">
              <h2 className="text-2xl md:text-3xl font-black">Hyväksytyt linkit</h2>
              {approvedLinks.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-bold">Ei vielä hyväksyttyjä linkkejä.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {approvedLinks.map((link) => (
                    <article key={link.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                       <p className="font-black text-lg text-slate-900 dark:text-white">{link.name}</p>
                       <p className="text-sm font-bold text-slate-500 dark:text-slate-400 break-all mt-1">{link.url}</p>
                       <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">{link.category}</p>
                       <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">{link.municipality ? `Paikkakunta: ${link.municipality}` : 'Valtakunnallinen'}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-400">{link.source}</span>
                        <button
                          type="button"
                          onClick={() => removeApprovedLinkSuggestion(link.id)}
                          className="text-sm font-black text-rose-600 hover:underline"
                        >
                          Poista
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {reviewedReports.length > 0 && (
              <section id="reviewed-reports" className="space-y-4 scroll-mt-6">
                <h2 className="text-2xl md:text-3xl font-black">Käsitellyt ilmoitukset</h2>
                <div className="grid gap-3">
                  {reviewedReports.slice(0, 30).map((report) => (
                    <article key={report.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-black">{report.name}</p>
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 break-all">{report.url}</p>
                          {report.reviewReason && (
                            <p className="mt-1 text-sm font-black text-amber-700 dark:text-amber-300">
                              Syy: {report.reviewReason}
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                          {statusLabel[report.status]}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
