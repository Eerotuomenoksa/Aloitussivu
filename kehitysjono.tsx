import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { User } from 'firebase/auth';
import './index.css';
import {
  FeedbackItem,
  FeedbackStatus,
  FeedbackType,
  subscribeFeedbackItems,
  updateFeedbackItem,
} from './feedback';
import {
  getUserEmail,
  isAdminUser,
  signInWithGoogle,
  signOutAdmin,
  subscribeToAuth,
} from './firebaseClient';
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
      setError('Päivitys ei onnistunut. Tarkista kirjautuminen ja Firestore-säännöt.');
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
          <input
            value={publicNote}
            onChange={(event) => setPublicNote(event.target.value)}
            className="aurora-input rounded-2xl px-4 py-3 font-bold"
            placeholder="Esim. Korjattu versiossa 0.71.1"
            maxLength={600}
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

function DevelopmentQueuePage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => installUsageTracking('kehitysjono'), []);

  useEffect(() => subscribeFeedbackItems(setItems), []);

  useEffect(() => subscribeToAuth((nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
  }), []);

  const counts = useMemo(() => statusOrder.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  })), [items]);

  const userEmail = getUserEmail(user);
  const canEdit = isAdminUser(user);

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
          <p className="text-sm font-black uppercase tracking-[.2em] text-[var(--theme-muted)]">Testipalautteet</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Kehitysjono</h1>
              <p className="mt-3 max-w-3xl text-lg font-semibold leading-relaxed text-[var(--theme-text-2)]">
                Tällä sivulla näkyy sivuilta lähetetty palaute ja sen käsittelyn tila. Palaute on julkista, joten lomakkeessa ei kerätä henkilötietoja.
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
                Kaikki voivat lukea jonon. Tilan voi päivittää vain ylläpitäjä.
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
          {authReady && user && !canEdit && (
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              Olet kirjautunut, mutta tällä tunnuksella ei ole ylläpito-oikeutta.
            </p>
          )}
        </section>

        <section className="space-y-4" aria-label="Palautelista">
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
