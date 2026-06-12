import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { User } from 'firebase/auth';
import './index.css';
import {
  getApprovedLinkSuggestions,
  approveLinkSuggestion,
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
  isAdminUser,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutAdmin,
  subscribeToAuth,
} from './firebaseClient';
import {
  NcscScrapeLogEntry,
  ScamAlertEntry,
  runNcscScrapeNow,
  subscribeNcscScrapeLogs,
  subscribeScamAlerts,
  updateScamAlertActiveState,
} from './scamAlerts';
import {
  NameDayApiUsageStats,
  subscribeNameDayApiUsageStats,
} from './adminStats';
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

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');

function exportJson(filename: string, content: unknown) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const statusLabel = {
  pending: 'Odottaa',
  approved: 'Toteutettu',
  rejected: 'Sivuutettu',
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

const getCurrentMonthKey = () => new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
}).format(new Date());

const normalizeUsagePage = (page: string) => (page === 'index' ? 'etusivu' : page);

const sumUsageStats = (stats: UsageDailyStats[]) => {
  const pages = new Map<string, { count: number; page: string }>();
  const links = new Map<string, { count: number; url: string; label: string; category: string; page: string }>();
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

    Object.entries(day.linkClicks).forEach(([id, link]) => {
      const current = links.get(id) ?? {
        count: 0,
        url: link.url,
        label: link.label || link.url,
        category: link.category,
        page: link.page,
      };
      current.count += link.count;
      links.set(id, current);
    });
  });

  return {
    totalPageviews,
    totalLinkClicks,
    frontPageViews: pages.get('etusivu')?.count ?? 0,
    topLinks: [...links.values()].sort((a, b) => b.count - a.count).slice(0, 12),
  };
};

const getFrontPageViews = (day: UsageDailyStats) => (
  Object.values(day.pageviews).reduce((total, pageview) => (
    normalizeUsagePage(pageview.page) === 'etusivu' ? total + pageview.count : total
  ), 0)
);

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
    return 'Kirjautuminen ei onnistu tästä osoitteesta. Lisää Firebase Authenticationin Authorized domains -listaan 127.0.0.1 ja GitHub Pages -domain, tai avaa paikallinen sivu osoitteella localhost:5173.';
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
    return `Firebase palautti sisäisen kirjautumisvirheen. Tarkista Firebase Consolesta, että Google provider on käytössä, GitHub Pages -domain on Authorized domains -listalla ja API-avaimen HTTP referrer -rajoitus sallii https://eerotuomenoksa.github.io/*.${details}`;
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
  const [approvedLinks, setApprovedLinks] = useState<ApprovedLinkSuggestion[]>(() => getApprovedLinkSuggestions());
  const [reportDrafts, setReportDrafts] = useState<Record<string, { name: string; url: string; category: string; note: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scamAlerts, setScamAlerts] = useState<ScamAlertEntry[]>([]);
  const [scamAlertBusyId, setScamAlertBusyId] = useState<string | null>(null);
  const [scamAlertMessage, setScamAlertMessage] = useState('');
  const [ncscLogs, setNcscLogs] = useState<NcscScrapeLogEntry[]>([]);
  const [ncscLogError, setNcscLogError] = useState('');
  const [ncscBusy, setNcscBusy] = useState(false);
  const [ncscMessage, setNcscMessage] = useState('');
  const [nameDayApiUsage, setNameDayApiUsage] = useState<NameDayApiUsageStats | null>(null);
  const [nameDayApiUsageError, setNameDayApiUsageError] = useState('');
  const [usageRangeMode, setUsageRangeMode] = useState<UsageRangeMode>('week');
  const [usageRange, setUsageRange] = useState(() => getUsagePresetRange('week'));
  const [usageStats, setUsageStats] = useState<UsageDailyStats[]>([]);
  const [usageStatsBusy, setUsageStatsBusy] = useState(false);
  const [usageStatsError, setUsageStatsError] = useState('');
  const [usageTrackingDisabled, setUsageTrackingDisabledState] = useState(() => isUsageTrackingDisabled());

  const hasAdminAccess = isAdminUser(user);
  const userEmail = getUserEmail(user);
  const authDebugInfo = getUserAuthDebugInfo(user);
  const adminPermissionHint = user
    ? `Nykyinen Firebase UID: ${user.uid}. Lisää tämä UID Firestore-sääntöjen admin-listaan, jos sähköposticlaim ei riitä.`
    : '';

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

  useEffect(() => subscribeApprovedLinkSuggestions(setApprovedLinks), []);

  useEffect(() => {
    if (!hasAdminAccess) {
      setReports([]);
      return () => {};
    }
    return subscribeLinkReports(setReports);
  }, [hasAdminAccess]);

  useEffect(() => {
    if (!hasAdminAccess) {
      setScamAlerts([]);
      setNcscLogs([]);
      setNcscLogError('');
      setNameDayApiUsage(null);
      setNameDayApiUsageError('');
      setUsageStats([]);
      setUsageStatsError('');
      return () => {};
    }

    const unsubscribeAlerts = subscribeScamAlerts(setScamAlerts);
    const addPermissionHint = (message: string, error?: { code?: string }) => (
      error?.code === 'permission-denied' && adminPermissionHint
        ? `${message} ${adminPermissionHint}`
        : message
    );
    const unsubscribeLogs = subscribeNcscScrapeLogs(
      setNcscLogs,
      (message, error) => setNcscLogError(addPermissionHint(message, error))
    );
    const unsubscribeNameDayUsage = subscribeNameDayApiUsageStats(
      setNameDayApiUsage,
      (message, error) => setNameDayApiUsageError(addPermissionHint(message, error))
    );
    return () => {
      unsubscribeAlerts();
      unsubscribeLogs();
      unsubscribeNameDayUsage();
    };
  }, [adminPermissionHint, hasAdminAccess]);

  useEffect(() => {
    if (usageRangeMode === 'custom') return;
    setUsageRange(getUsagePresetRange(usageRangeMode));
  }, [usageRangeMode]);

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
  const currentNameDayMonth = getCurrentMonthKey();
  const currentNameDayRequests = nameDayApiUsage?.monthlyRequests[currentNameDayMonth] ?? 0;
  const nameDayMonthlyLimit = nameDayApiUsage?.monthlyLimit || 100;
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
      label: 'Käyttötilastot',
      count: usageTotals.frontPageViews,
      href: '#usage-stats',
      tone: usageStatsError ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-cyan-100 text-cyan-950 dark:bg-cyan-900/40 dark:text-cyan-100',
      note: usageStatsError || `${usageRange.start} - ${usageRange.end}`,
    },
    {
      label: 'Nimipäivärajapinta',
      count: nameDayApiUsage?.totalRequests ?? 0,
      href: '#nameday-api-usage',
      tone: nameDayApiUsageError || currentNameDayRequests >= nameDayMonthlyLimit ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      note: nameDayApiUsage
        ? `${currentNameDayMonth}: ${currentNameDayRequests}/${nameDayMonthlyLimit}. Viimeksi käytetty ${formatDateTime(nameDayApiUsage.lastUsedAt)}.`
        : (nameDayApiUsageError || 'Käyttöä ei ole vielä kirjattu.'),
    },
  ], [activeScamAlerts.length, approvedLinks.length, currentNameDayMonth, currentNameDayRequests, issueReports.length, nameDayApiUsage, nameDayApiUsageError, nameDayMonthlyLimit, ncscAttentionLogs.length, pendingNewReports.length, usageRange.end, usageRange.start, usageStatsError, usageTotals.frontPageViews]);

  useEffect(() => {
    setReportDrafts((current) => {
      const next = { ...current };
      for (const report of pendingNewReports) {
        if (!next[report.id]) {
          next[report.id] = {
            name: report.name || '',
            url: report.url || '',
            category: report.category || '',
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
      note: report.note ?? '',
    };

    setBusyId(report.id);
    try {
      const approved = await approveLinkSuggestion({
        name: draft.name || report.name || 'Tuntematon linkki',
        url: draft.url || report.url,
        category: draft.category || report.category || 'Yleiset linkit',
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
    } finally {
      setBusyId(null);
    }
  };

  const rejectReport = async (report: ManagedLinkReportEntry) => {
    setBusyId(report.id);
    try {
      await updateLinkReportStatus(report.id, 'rejected', user?.email);
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

  const copyApprovedJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(approvedLinks, null, 2));
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

  return (
    <main className="aurora-page">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-10">
        <header className="aurora-subpage-hero space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="aurora-kicker">
              Ylläpito
            </span>
            <HomeLink />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Linkkiehdotukset</h1>
          <p className="max-w-3xl text-base font-semibold text-white/75 md:text-lg">
            Ilmoitetut muutokset tallentuvat yhteiseen ylläpitojonoon. Hyväksyntä on rajattu ylläpitäjän Google-tunnukselle.
          </p>
        </header>

        {!isFirebaseConfigured ? (
          <section className="aurora-soft-panel max-w-3xl space-y-3 p-6 shadow-sm">
            <h2 className="aurora-section-title text-2xl">Firebase-asetukset puuttuvat</h2>
            <p className="font-bold text-[var(--theme-text-2)]">
              Lisää GitHub Pages -julkaisuun Firebase-ympäristömuuttujat ja ota Google-kirjautuminen sekä Firestore käyttöön. Ilman niitä sivu voi toimia vain paikallisella selaintallennuksella.
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
        ) : !hasAdminAccess ? (
          <section className="aurora-panel max-w-2xl space-y-4 p-8">
            <h2 className="aurora-section-title text-3xl">Ei käyttöoikeutta</h2>
            <p className="font-bold text-[var(--theme-text-2)]">
              Olet kirjautunut osoitteella {userEmail || 'tuntematon sähköposti'}. Ylläpitoon pääsee vain ylläpitäjän tunnuksella.
            </p>
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
                  Odottaa: {pendingReports.length} · Hyväksyttyjä linkkejä: {approvedLinks.length}
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
                  onClick={copyApprovedJson}
                  className="rounded-full bg-[var(--theme-primary)] px-5 py-3 font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95"
                >
                  Kopioi hyväksytyt JSONina
                </button>
                <button
                  type="button"
                  onClick={() => exportJson('hyvaksytyt-linkit.json', approvedLinks)}
                  className="aurora-secondary-button px-5 py-3 shadow-md"
                >
                  Lataa JSON
                </button>
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
                  Nopea näkymä avoimiin asioihin ja automaation huomioihin.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                {reviewTasks.map((task) => (
                  <a
                    key={task.href}
                    href={task.href}
                    className="aurora-card transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-black text-[var(--theme-text)]">{task.label}</p>
                      <span className={`rounded-full px-3 py-1 text-sm font-black ${task.tone}`}>
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
                      <h3 className="text-xl font-black">Klikatuimmat linkit</h3>
                      {usageTotals.topLinks.length === 0 ? (
                        <p className="font-bold text-slate-500 dark:text-slate-400">Ei linkkiklikkauksia valitulla aikavälillä.</p>
                      ) : (
                        <div className="grid gap-3">
                          {usageTotals.topLinks.map((link) => (
                            <article key={link.url} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-black break-words">{link.label || link.url}</p>
                                  <p className="mt-1 text-xs font-bold text-slate-500 break-all dark:text-slate-400">{link.url}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-cyan-100 px-3 py-1 text-sm font-black text-cyan-950 dark:bg-cyan-900/40 dark:text-cyan-100">
                                  {link.count}
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

            <section id="nameday-api-usage" className="scroll-mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">Nimipäivärajapinta</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Kertoo, kuinka monta kertaa Cloud Function on kutsunut Nimipäivärajapintaa.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-lg font-black text-slate-900 dark:bg-slate-800 dark:text-white">
                  {nameDayApiUsage?.totalRequests ?? 0} kertaa
                </span>
              </div>
              {nameDayApiUsageError ? (
                <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {nameDayApiUsageError}
                </p>
              ) : (
                <>
                  {currentNameDayRequests >= nameDayMonthlyLimit && (
                    <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                      Kuukauden testiraja on täynnä. Nimipäivät piilotetaan käyttäjiltä, kunnes uusi kuukausi alkaa tai raja nostetaan.
                    </p>
                  )}
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Tämä kuukausi</p>
                      <p className="mt-1 text-2xl font-black">{currentNameDayRequests}/{nameDayMonthlyLimit}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Onnistuneet</p>
                      <p className="mt-1 text-2xl font-black">{nameDayApiUsage?.successfulRequests ?? 0}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Epäonnistuneet</p>
                      <p className="mt-1 text-2xl font-black">{nameDayApiUsage?.failedRequests ?? 0}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Viimeksi</p>
                      <p className="mt-1 text-lg font-black">{formatDateTime(nameDayApiUsage?.lastUsedAt)}</p>
                    </div>
                  </div>
                </>
              )}
            </section>

            <section id="scam-alerts-admin" className="space-y-4 scroll-mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">Huijausvaroitukset</h2>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Aktiiviset varoitukset ja Kyberturvallisuuskeskuksen viikkokatsauksen automaattinen haku.
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

                        <div className="flex flex-wrap items-center justify-end gap-3">
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
