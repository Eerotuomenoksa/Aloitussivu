import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { User } from 'firebase/auth';
import './index.css';
import {
  getFeedbackAttachment,
  subscribeFeedbackItems,
  subscribePublicFeedbackItems,
  updateFeedbackItem,
} from './feedback';
import type {
  FeedbackAttachment,
  FeedbackItem,
  FeedbackStatus,
  FeedbackType,
} from './feedback';
import {
  subscribePublicLinkReports,
  type LinkReportStatus,
  type PublicLinkReportEntry,
} from './linkVisibility';
import {
  getUserEmail,
  signInWithGoogle,
  signOutAdmin,
  subscribeToAuth,
} from './firebaseClient';
import { getVerifiedAdminSession, isAdminAccessError, type AdminSession } from './services/data';
import { installUsageTracking } from './usageTracking';

const typeLabels: Record<FeedbackType, string> = {
  bug: 'Virhe',
  content: 'Sisältö',
  link: 'Linkki',
  accessibility: 'Saavutettavuus',
  idea: 'Idea',
  other: 'Muu',
};

const statusLabels: Record<FeedbackStatus, string> = {
  new: 'Uusi',
  triage: 'Arvioinnissa',
  planned: 'Jonossa',
  in_progress: 'Työn alla',
  done: 'Käsitelty',
  rejected: 'Ei toteuteta',
};

const statusClasses: Record<FeedbackStatus, string> = {
  new: 'bg-blue-100 text-blue-950 dark:bg-blue-900/40 dark:text-blue-100',
  triage: 'bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100',
  planned: 'bg-cyan-100 text-cyan-950 dark:bg-cyan-900/40 dark:text-cyan-100',
  in_progress: 'bg-violet-100 text-violet-950 dark:bg-violet-900/40 dark:text-violet-100',
  done: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100',
  rejected: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

const linkTypeLabels: Record<PublicLinkReportEntry['type'], string> = {
  new: 'Uusi linkkiehdotus',
  broken: 'Rikkinäinen linkki',
  wrong: 'Väärä linkki',
};

const linkStatusLabels: Record<LinkReportStatus, string> = {
  pending: 'Odottaa käsittelyä',
  approved: 'Hyväksytty tuotantoon',
  rejected: 'Hylätty',
};

const linkStatusClasses: Record<LinkReportStatus, string> = {
  pending: 'bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100',
  approved: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100',
  rejected: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fi-FI', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const statusOrder: FeedbackStatus[] = ['new', 'triage', 'planned', 'in_progress', 'done', 'rejected'];

function HomeLink() {
  return (
    <a href="./index.html" className="aurora-primary-link text-base">
      ← Palaa etusivulle
    </a>
  );
}

function AdminEditor({
  item,
  userEmail,
}: {
  item: FeedbackItem;
  userEmail: string;
}) {
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [publicNote, setPublicNote] = useState(item.publicNote ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(item.status);
    setPublicNote(item.publicNote ?? '');
    setError('');
  }, [item.id, item.publicNote, item.status]);

  const save = async () => {
    setError('');
    setIsSaving(true);
    try {
      await updateFeedbackItem(item.id, status, publicNote, userEmail);
    } catch {
      setError('Päivitys ei onnistunut. Tarkista kirjautuminen ja ylläpito-oikeus.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-pale)] p-4">
      <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-black uppercase tracking-wide text-[var(--theme-muted)]">Tila</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as FeedbackStatus)}
            className="aurora-input rounded-2xl px-4 py-3 font-bold"
          >
            {statusOrder.map((value) => (
              <option key={value} value={value}>{statusLabels[value]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black uppercase tracking-wide text-[var(--theme-muted)]">Julkinen käsittelymerkintä</span>
          <textarea
            value={publicNote}
            onChange={(event) => setPublicNote(event.target.value)}
            className="aurora-input rounded-2xl px-4 py-3 font-bold"
            placeholder="Esim. Korjattu versiossa 0.71.1"
            maxLength={1600}
            rows={3}
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="rounded-full bg-[var(--theme-primary)] px-6 py-3 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Tallennetaan' : 'Tallenna'}
        </button>
      </div>
      {error && <p className="mt-3 font-bold text-rose-600 dark:text-rose-300">{error}</p>}
    </div>
  );
}

function FeedbackCard({
  item,
  canEdit,
  userEmail,
}: {
  item: FeedbackItem;
  canEdit: boolean;
  userEmail: string;
}) {
  const [attachment, setAttachment] = useState<FeedbackAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    let isActive = true;
    setAttachment(null);
    setAttachmentError('');
    if (!canEdit || !item.hasScreenshot) return () => { isActive = false; };

    getFeedbackAttachment(item.id)
      .then((nextAttachment) => {
        if (isActive) setAttachment(nextAttachment);
      })
      .catch(() => {
        if (isActive) setAttachmentError('Kuvakaappausta ei voitu ladata.');
      });

    return () => {
      isActive = false;
    };
  }, [canEdit, item.hasScreenshot, item.id]);

  return (
    <article className="rounded-[28px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-black ${statusClasses[item.status]}`}>
              {statusLabels[item.status]}
            </span>
            <span className="rounded-full bg-[var(--theme-pale)] px-3 py-1 text-sm font-black text-[var(--theme-muted)]">
              {typeLabels[item.type]}
            </span>
            {item.page && (
              <span className="rounded-full bg-[var(--theme-pale)] px-3 py-1 text-sm font-black text-[var(--theme-muted)]">
                {item.page}
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight text-[var(--theme-text)] md:text-3xl">
            {item.title}
          </h2>
        </div>
        <p className="text-sm font-bold text-[var(--theme-muted)]">
          Lisätty {formatDateTime(item.createdAt)}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-relaxed text-[var(--theme-text-2)]">
        {item.description}
      </p>

      {canEdit && (item.client || item.hasScreenshot) ? (
        <div className="mt-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-pale)] p-4">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--theme-muted)]">Tekniset tiedot</p>
          {item.client ? (
            <div className="mt-3 grid gap-2 text-sm font-bold text-[var(--theme-text-2)] md:grid-cols-2">
              <p>Selain: {item.client.browserName}{item.client.browserVersion ? ` ${item.client.browserVersion}` : ''}</p>
              <p>Käyttöjärjestelmä: {item.client.osName}</p>
              <p>Laite: {item.client.deviceType}</p>
              <p>Kieli: {item.client.language || '-'}</p>
              <p>Näkymä: {item.client.viewport}</p>
              <p>Näyttö: {item.client.screen}</p>
              <p>Aikavyöhyke: {item.client.timezone || '-'}</p>
              <p>Kosketusnäyttö: {item.client.touch ? 'kyllä' : 'ei'}</p>
              <p className="md:col-span-2 break-all">User agent: {item.client.userAgent}</p>
            </div>
          ) : null}
          {item.hasScreenshot ? (
            <div className="mt-4">
              <p className="text-sm font-black text-[var(--theme-muted)]">Kuvakaappaus</p>
              {attachment?.screenshot ? (
                <a
                  href={attachment.screenshot.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block"
                >
                  <img
                    src={attachment.screenshot.dataUrl}
                    alt={`Palautteen kuvakaappaus: ${attachment.screenshot.name}`}
                    className="max-h-80 rounded-2xl border border-[var(--theme-border)] object-contain"
                  />
                </a>
              ) : (
                <p className="mt-2 text-sm font-bold text-[var(--theme-muted)]">
                  {attachmentError || 'Kuvakaappausta ladataan...'}
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {item.publicNote ? (
        <div className="mt-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-pale)] p-4">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--theme-muted)]">Käsittely</p>
          <p className="mt-1 font-bold text-[var(--theme-text)]">{item.publicNote}</p>
          <p className="mt-2 text-sm font-bold text-[var(--theme-muted)]">
            Päivitetty {formatDateTime(item.updatedAt)}
          </p>
        </div>
      ) : null}

      {canEdit ? <AdminEditor item={item} userEmail={userEmail} /> : null}
    </article>
  );
}

function LinkReportCard({ report }: { report: PublicLinkReportEntry }) {
  return (
    <article className="rounded-[28px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-black ${linkStatusClasses[report.status]}`}>
              {linkStatusLabels[report.status]}
            </span>
            <span className="rounded-full bg-[var(--theme-pale)] px-3 py-1 text-sm font-black text-[var(--theme-muted)]">
              {linkTypeLabels[report.type]}
            </span>
            {report.category ? (
              <span className="rounded-full bg-[var(--theme-pale)] px-3 py-1 text-sm font-black text-[var(--theme-muted)]">
                {report.category}
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight text-[var(--theme-text)] md:text-3xl">
            {report.name || 'Linkkiehdotus'}
          </h3>
          <a
            href={report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block break-all font-bold text-[var(--theme-primary)] underline"
          >
            {report.url}
          </a>
        </div>
        <p className="text-sm font-bold text-[var(--theme-muted)]">
          Lisätty {formatDateTime(report.createdAt)}
        </p>
      </div>

      {report.status !== 'pending' ? (
        <div className="mt-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-pale)] p-4">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--theme-muted)]">Käsittely</p>
          <p className="mt-1 font-bold text-[var(--theme-text)]">
            {report.reviewReason || linkStatusLabels[report.status]}
          </p>
          <p className="mt-2 text-sm font-bold text-[var(--theme-muted)]">
            Päivitetty {formatDateTime(report.reviewedAt || report.updatedAt)}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function DevelopmentQueuePage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [linkReports, setLinkReports] = useState<PublicLinkReportEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [adminAccessReady, setAdminAccessReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [linkLoadError, setLinkLoadError] = useState('');

  useEffect(() => installUsageTracking('kehitysjono'), []);

  useEffect(() => subscribeToAuth((nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
  }), []);

  useEffect(() => {
    let current = true;
    setAdminSession(null);
    setAdminAccessReady(!user);
    if (!user) return () => { current = false; };
    void getVerifiedAdminSession()
      .then((session) => {
        if (current) setAdminSession(session);
      })
      .catch((error) => {
        if (current) setAuthError(error instanceof Error ? error.message : 'Ylläpito-oikeutta ei voitu vahvistaa.');
      })
      .finally(() => {
        if (current) setAdminAccessReady(true);
      });
    return () => { current = false; };
  }, [user]);

  const canEdit = adminSession !== null;

  useEffect(() => {
    setLoadError('');
    const subscribe = canEdit ? subscribeFeedbackItems : subscribePublicFeedbackItems;
    return subscribe(setItems, (error) => {
      if (canEdit && isAdminAccessError(error)) setAdminSession(null);
      setLoadError(error instanceof Error ? error.message : 'Palautteita ei voitu ladata.');
    });
  }, [canEdit]);

  useEffect(() => {
    setLinkLoadError('');
    return subscribePublicLinkReports(setLinkReports, (error) => {
      setLinkLoadError(error instanceof Error ? error.message : 'Linkkiehdotuksia ei voitu ladata.');
    });
  }, []);

  const counts = useMemo(() => statusOrder.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  })), [items]);

  const userEmail = adminSession?.email || getUserEmail(user);

  const signIn = async () => {
    setAuthError('');
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';
      setAuthError(code ? `Kirjautuminen ei onnistunut. Firebase-virhe: ${code}.` : 'Kirjautuminen ei onnistunut.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)]">
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-10">
        <HomeLink />

        <header className="rounded-[32px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-sm md:p-8">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[var(--theme-muted)]">Palautteiden käsittely</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Kehitysjono</h1>
              <p className="mt-3 max-w-3xl text-lg font-semibold leading-relaxed text-[var(--theme-text-2)]">
                Tällä sivulla kaikki voivat seurata palautteiden ja linkkiehdotusten käsittelyä sekä ylläpidon julkisia vastauksia. Älä lisää palautteeseen henkilötietoja tai muuta arkaluonteista tietoa.
              </p>
            </div>
            <a
              href="./index.html?feedback=1"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--theme-primary)] px-5 py-3 font-black text-white no-underline transition-all hover:bg-[var(--theme-primary-mid)]"
            >
              Anna uusi palaute
            </a>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="Palautteiden tilanne">
          {counts.map(({ status, count }) => (
            <div key={status} className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
              <p className="text-sm font-black text-[var(--theme-muted)]">{statusLabels[status]}</p>
              <p className="font-display text-4xl font-bold text-[var(--theme-text)]">{count}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Ylläpidon käsittely</h2>
              <p className="mt-1 font-semibold text-[var(--theme-muted)]">
                Kaikki voivat lukea jonon. Tilan ja julkisen käsittelymerkinnän päivittäminen vaatii ylläpito-oikeuden.
              </p>
            </div>
            {authReady && canEdit ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-[var(--theme-muted)]">{userEmail}</span>
                <button type="button" onClick={signOutAdmin} className="aurora-secondary-button px-5 py-3">
                  Kirjaudu ulos
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signIn}
                disabled={isSigningIn}
                className="aurora-secondary-button px-5 py-3"
              >
                {isSigningIn ? 'Avataan kirjautumista' : 'Ylläpitäjän kirjautuminen'}
              </button>
            )}
          </div>
          {authError && <p className="mt-4 rounded-2xl bg-rose-50 p-4 font-bold text-rose-800 dark:bg-rose-900/20 dark:text-rose-200">{authError}</p>}
          {loadError && <p className="mt-4 rounded-2xl bg-rose-50 p-4 font-bold text-rose-800 dark:bg-rose-900/20 dark:text-rose-200">{loadError}</p>}
          {linkLoadError && <p className="mt-4 rounded-2xl bg-rose-50 p-4 font-bold text-rose-800 dark:bg-rose-900/20 dark:text-rose-200">{linkLoadError}</p>}
          {authReady && user && adminAccessReady && !canEdit && (
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              Olet kirjautunut, mutta tällä tunnuksella ei ole ylläpito-oikeutta.
            </p>
          )}
        </section>

        <section className="space-y-4" aria-labelledby="feedback-list-title">
          <h2 id="feedback-list-title" className="font-display text-3xl font-bold">Palautteet ja vastaukset</h2>
          {items.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 text-center">
              <p className="font-black text-[var(--theme-muted)]">Palautteita ei ole vielä kehitysjonossa.</p>
            </div>
          ) : (
            items.map((item) => (
              <FeedbackCard key={item.id} item={item} canEdit={canEdit} userEmail={userEmail} />
            ))
          )}
        </section>

        <section className="space-y-4" aria-labelledby="link-report-list-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="link-report-list-title" className="font-display text-3xl font-bold">Linkkiehdotukset ja linkki-ilmoitukset</h2>
              <p className="mt-2 font-semibold text-[var(--theme-muted)]">
                Täältä näet, odottaako ehdotus käsittelyä ja hyväksyttiinkö se tuotantoon vai hylättiinkö se.
              </p>
            </div>
            <a href="./index.html?link-report=1" className="aurora-primary-link text-base">Ehdota uutta linkkiä</a>
          </div>
          {linkReports.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 text-center">
              <p className="font-black text-[var(--theme-muted)]">Linkkiehdotuksia tai linkki-ilmoituksia ei ole vielä.</p>
            </div>
          ) : (
            linkReports.map((report) => <LinkReportCard key={report.id} report={report} />)
          )}
        </section>
      </main>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DevelopmentQueuePage />
    </React.StrictMode>
  );
}
