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

function HomeLink() {
  return (
    <a
      href="./index.html"
      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-base font-black text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
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

const getSignInErrorMessage = (error: unknown) => {
  const code = getErrorCode(error);

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

  return code
    ? `Kirjautuminen ei onnistunut. Firebase-virhe: ${code}.`
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

  const hasAdminAccess = isAdminUser(user);
  const userEmail = getUserEmail(user);
  const authDebugInfo = getUserAuthDebugInfo(user);

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
      return () => {};
    }

    const unsubscribeAlerts = subscribeScamAlerts(setScamAlerts);
    const unsubscribeLogs = subscribeNcscScrapeLogs(setNcscLogs, setNcscLogError);
    const unsubscribeNameDayUsage = subscribeNameDayApiUsageStats(setNameDayApiUsage, setNameDayApiUsageError);
    return () => {
      unsubscribeAlerts();
      unsubscribeLogs();
      unsubscribeNameDayUsage();
    };
  }, [hasAdminAccess]);

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
      label: 'Nimipäivärajapinta',
      count: nameDayApiUsage?.totalRequests ?? 0,
      href: '#nameday-api-usage',
      tone: nameDayApiUsageError ? 'bg-rose-100 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      note: nameDayApiUsage
        ? `Viimeksi käytetty ${formatDateTime(nameDayApiUsage.lastUsedAt)}.`
        : (nameDayApiUsageError || 'Käyttöä ei ole vielä kirjattu.'),
    },
  ], [activeScamAlerts.length, approvedLinks.length, issueReports.length, nameDayApiUsage, nameDayApiUsageError, ncscAttentionLogs.length, pendingNewReports.length]);

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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-10">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
              Ylläpito
            </span>
            <HomeLink />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Linkkiehdotukset</h1>
          <p className="max-w-3xl text-base md:text-lg text-slate-600 dark:text-slate-300">
            Ilmoitetut muutokset tallentuvat yhteiseen ylläpitojonoon. Hyväksyntä on rajattu ylläpitäjän Google-tunnukselle.
          </p>
        </header>

        {!isFirebaseConfigured ? (
          <section className="max-w-3xl rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-6 shadow-sm space-y-3">
            <h2 className="text-2xl font-black text-amber-950 dark:text-amber-100">Firebase-asetukset puuttuvat</h2>
            <p className="font-bold text-amber-900 dark:text-amber-200">
              Lisää GitHub Pages -julkaisuun Firebase-ympäristömuuttujat ja ota Google-kirjautuminen sekä Firestore käyttöön. Ilman niitä sivu voi toimia vain paikallisella selaintallennuksella.
            </p>
          </section>
        ) : !authReady ? (
          <p className="font-black text-slate-500 dark:text-slate-400">Tarkistetaan kirjautumista...</p>
        ) : !user ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
            <h2 className="text-3xl font-black">Kirjaudu ylläpitoon</h2>
            <p className="font-bold text-slate-600 dark:text-slate-300">
              Käytä ylläpitäjän Google-tunnusta.
            </p>
            {authError && <p className="font-bold text-rose-600">{authError}</p>}
            <button
              type="button"
              onClick={signIn}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
            >
              Kirjaudu Googlella
            </button>
          </section>
        ) : !hasAdminAccess ? (
          <section className="max-w-2xl rounded-2xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-4">
            <h2 className="text-3xl font-black">Ei käyttöoikeutta</h2>
            <p className="font-bold text-slate-600 dark:text-slate-300">
              Olet kirjautunut osoitteella {userEmail || 'tuntematon sähköposti'}. Ylläpitoon pääsee vain ylläpitäjän tunnuksella.
            </p>
            {authDebugInfo && (
              <p className="rounded-xl bg-slate-100 dark:bg-slate-950 p-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                {authDebugInfo}
              </p>
            )}
            <button
              type="button"
              onClick={signOutAdmin}
              className="rounded-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-5 py-3 font-black shadow-md transition-all active:scale-95"
            >
              Kirjaudu ulos
            </button>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div>
                <p className="font-black">Kirjautunut: {userEmail}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Odottaa: {pendingReports.length} · Hyväksyttyjä linkkejä: {approvedLinks.length}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="./index.html"
                  className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-5 py-3 font-black shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
                >
                  Palaa etusivulle
                </a>
                <button
                  type="button"
                  onClick={copyApprovedJson}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
                >
                  Kopioi hyväksytyt JSONina
                </button>
                <button
                  type="button"
                  onClick={() => exportJson('hyvaksytyt-linkit.json', approvedLinks)}
                  className="rounded-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-5 py-3 font-black shadow-md transition-all active:scale-95"
                >
                  Lataa JSON
                </button>
                <button
                  type="button"
                  onClick={signOutAdmin}
                  className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-5 py-3 font-black shadow-sm transition-all active:scale-95"
                >
                  Kirjaudu ulos
                </button>
              </div>
            </div>

            <section className="space-y-4" aria-labelledby="review-dashboard-heading">
              <div>
                <h2 id="review-dashboard-heading" className="text-2xl md:text-3xl font-black">Tarkista nämä ensin</h2>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Nopea näkymä avoimiin asioihin ja automaation huomioihin.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {reviewTasks.map((task) => (
                  <a
                    key={task.href}
                    href={task.href}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-black text-slate-900 dark:text-white">{task.label}</p>
                      <span className={`rounded-full px-3 py-1 text-sm font-black ${task.tone}`}>
                        {task.count}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                      {task.note}
                    </p>
                  </a>
                ))}
              </div>
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
                <div className="mt-4 grid gap-3 md:grid-cols-3">
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
