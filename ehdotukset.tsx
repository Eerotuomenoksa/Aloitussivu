import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { getApprovedLinkSuggestions, approveLinkSuggestion, removeApprovedLinkSuggestion, ApprovedLinkSuggestion } from './approvedLinks';
import { getLinkReports } from './linkVisibility';
import { LinkReportEntry } from './types';

const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');
const PASSWORD_HASH = import.meta.env.VITE_EHDOTUKSET_PASSWORD_HASH?.trim() ?? '';
const UNLOCK_KEY = 'ehdotuksetUnlocked';

const toHex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)]
  .map((value) => value.toString(16).padStart(2, '0'))
  .join('');

const sha256 = async (value: string) => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return toHex(digest);
};

function exportJson(filename: string, content: unknown) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [reports, setReports] = useState<LinkReportEntry[]>(() => getLinkReports());
  const [approvedVersion, setApprovedVersion] = useState(0);
  const [reportDrafts, setReportDrafts] = useState<Record<string, { name: string; url: string; category: string; note: string }>>({});
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passwordError, setPasswordError] = useState('');
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setReports(getLinkReports());
      setApprovedVersion((value) => value + 1);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const unlock = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');

    if (!PASSWORD_HASH) {
      setPasswordError('Salasanaa ei ole määritetty tähän julkaisuun.');
      return;
    }

    setIsCheckingPassword(true);
    try {
      const hash = await sha256(password);
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem(UNLOCK_KEY, 'true');
        setIsUnlocked(true);
        setPassword('');
      } else {
        setPasswordError('Väärä salasana.');
      }
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const approvedLinks = useMemo(() => getApprovedLinkSuggestions(), [approvedVersion]);
  const approvedUrls = useMemo(() => new Set(approvedLinks.map((item) => normalizeUrl(item.url))), [approvedLinks]);
  const pendingNewReports = useMemo(
    () => reports.filter((report) => report.type === 'new' && !approvedUrls.has(normalizeUrl(report.url))),
    [reports, approvedUrls]
  );
  const issueReports = useMemo(
    () => reports.filter((report) => report.type !== 'new'),
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

  const approveReport = (report: LinkReportEntry) => {
    const draft = reportDrafts[report.id] ?? {
      name: report.name,
      url: report.url,
      category: report.category ?? '',
      note: report.note ?? '',
    };

    const approved = approveLinkSuggestion({
      name: draft.name || report.name || 'Tuntematon linkki',
      url: draft.url || report.url,
      category: draft.category || report.category || 'Yleiset linkit',
      source: report.source,
      note: draft.note || report.note || '',
      id: report.id,
      createdAt: report.createdAt,
    });

    setApprovedVersion((value) => value + 1);
    setReportDrafts((current) => {
      const next = { ...current };
      delete next[report.id];
      return next;
    });
    return approved;
  };

  const copyApprovedJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(approvedLinks, null, 2));
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-10">
        {!isUnlocked ? (
          <section className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
            <header className="space-y-3">
              <span className="inline-flex rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                Kehittäjille
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Linkkiehdotukset</h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300">
                Tämä sivu on salasanan takana.
              </p>
            </header>

            <form onSubmit={unlock} className="space-y-4">
              <label className="space-y-2 block">
                <span className="block font-black text-slate-700 dark:text-slate-200">Salasana</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white"
                  autoComplete="current-password"
                />
              </label>
              {passwordError && (
                <p className="font-bold text-rose-600">{passwordError}</p>
              )}
              <button
                type="submit"
                disabled={isCheckingPassword}
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
              >
                {isCheckingPassword ? 'Tarkistetaan...' : 'Avaa sivu'}
              </button>
            </form>
          </section>
        ) : (
          <>
            <header className="space-y-4">
              <span className="inline-flex rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
                Kehittäjille
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Linkkiehdotukset</h1>
              <p className="max-w-3xl text-base md:text-lg text-slate-600 dark:text-slate-300">
                Tarkistetut ehdotukset voidaan hyväksyä täältä sivustolle. Hyväksytyt linkit näkyvät heti saman selaimen käyttöliittymässä.
              </p>
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
              </div>
            </header>

            <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black">Hyväksytyt linkit</h2>
          {approvedLinks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 font-bold">Ei vielä hyväksyttyjä linkkejä.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {approvedLinks.map((link: ApprovedLinkSuggestion) => (
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
                        {report.type}
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
                        onClick={() => approveReport(report)}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 font-black shadow-md transition-all active:scale-95"
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
            <p className="text-slate-500 dark:text-slate-400 font-bold">Ei muita ilmoituksia.</p>
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
                </article>
              ))}
            </div>
          )}
            </section>
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
