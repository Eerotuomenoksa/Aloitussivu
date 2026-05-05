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
  ManagedLinkReportEntry,
  subscribeLinkReports,
  updateLinkReportStatus,
} from './linkVisibility';
import {
  ADMIN_EMAIL,
  isAdminUser,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutAdmin,
  subscribeToAuth,
} from './firebaseClient';

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
  approved: 'Hyväksytty',
  rejected: 'Hylätty',
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [reports, setReports] = useState<ManagedLinkReportEntry[]>([]);
  const [approvedLinks, setApprovedLinks] = useState<ApprovedLinkSuggestion[]>(() => getApprovedLinkSuggestions());
  const [reportDrafts, setReportDrafts] = useState<Record<string, { name: string; url: string; category: string; note: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const hasAdminAccess = isAdminUser(user);

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

  const signIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch {
      setAuthError('Kirjautuminen ei onnistunut. Tarkista Firebase-asetukset ja Google-kirjautuminen.');
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

  const copyApprovedJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(approvedLinks, null, 2));
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-10">
        <header className="space-y-4">
          <span className="inline-flex rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
            Ylläpito
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Linkkiehdotukset</h1>
          <p className="max-w-3xl text-base md:text-lg text-slate-600 dark:text-slate-300">
            Ilmoitetut muutokset tallentuvat yhteiseen ylläpitojonoon. Hyväksyntä on rajattu Google-tunnukselle {ADMIN_EMAIL}.
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
              Käytä Google-tunnusta {ADMIN_EMAIL}.
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
              Olet kirjautunut osoitteella {user.email}. Ylläpitoon pääsee vain osoitteella {ADMIN_EMAIL}.
            </p>
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
                <p className="font-black">Kirjautunut: {user.email}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Odottaa: {pendingReports.length} · Hyväksyttyjä linkkejä: {approvedLinks.length}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
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

            <section className="space-y-4">
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
                            Hylkää
                          </button>
                          <button
                            type="button"
                            disabled={busyId === report.id}
                            onClick={() => approveReport(report)}
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
                          >
                            Hyväksy sivustolle
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="space-y-4">
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
                          Merkitse käsitellyksi
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
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
              <section className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-black">Käsitellyt ilmoitukset</h2>
                <div className="grid gap-3">
                  {reviewedReports.slice(0, 30).map((report) => (
                    <article key={report.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-black">{report.name}</p>
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 break-all">{report.url}</p>
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
