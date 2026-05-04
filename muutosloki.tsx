import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  CHANGELOG_DEPLOYMENTS,
  CHANGELOG_GENERATED_AT,
  CHANGELOG_RECENT_COMMITS,
  CHANGELOG_WORKTREE_SUMMARY,
  type ChangelogDeployment,
  type ChangelogCommit,
} from './changelogData';

function formatCommitHash(hash: string) {
  return hash.slice(0, 7);
}

function formatDeploymentTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function DeploymentCard({ deployment }: { deployment: ChangelogDeployment }) {
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs font-black rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 px-3 py-1">
          {deployment.environment}
        </span>
        <span className="font-mono text-xs font-black rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-3 py-1">
          {deployment.state}
        </span>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {formatDeploymentTime(deployment.createdAt)}
        </span>
      </div>
      <p className="mt-3 text-base md:text-lg font-bold text-slate-800 dark:text-slate-200">
        {deployment.description || deployment.subject}
      </p>
    </article>
  );
}

function CommitCard({ commit }: { commit: ChangelogCommit }) {
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs font-black rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200 px-3 py-1">
          {formatCommitHash(commit.hash)}
        </span>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{commit.date}</span>
      </div>
      <p className="mt-3 text-base md:text-lg font-bold text-slate-800 dark:text-slate-200">
        {commit.subject}
      </p>
    </article>
  );
}

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

function App() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12 space-y-10">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
              Kehittäjille
            </span>
            <HomeLink />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Muutosloki</h1>
          <p className="max-w-3xl text-base md:text-lg text-slate-600 dark:text-slate-300">
            Tämä sivu näyttää viimeisimmät muutokset suomenkielisinä yhteenvetoina.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Päivitetty: <span className="font-bold">{CHANGELOG_GENERATED_AT}</span>
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black">Tämän päivän muutokset</h2>
          {CHANGELOG_WORKTREE_SUMMARY.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">
              Tämän ajon aikana ei löytynyt uusia paikallisia muutoksia.
            </p>
          ) : (
            <div className="grid gap-4">
              {CHANGELOG_WORKTREE_SUMMARY.map((summary) => (
                <article key={summary} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <p className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200">
                    {summary}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-black">Viimeisimmät julkaisut</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {CHANGELOG_DEPLOYMENTS.length} merkintää
            </span>
          </div>
          {CHANGELOG_DEPLOYMENTS.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">
              Julkaisutietoja ei saatu tähän ajoon.
            </p>
          ) : (
            <div className="grid gap-4">
              {CHANGELOG_DEPLOYMENTS.map((deployment) => (
                <DeploymentCard key={deployment.id} deployment={deployment} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-black">Viimeisimmät commitit</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {CHANGELOG_RECENT_COMMITS.length} merkintää
            </span>
          </div>
          <div className="grid gap-4">
            {CHANGELOG_RECENT_COMMITS.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-300">Ei commit-historiaa saatavilla.</p>
            ) : (
              CHANGELOG_RECENT_COMMITS.map((commit) => (
                <CommitCard key={commit.hash} commit={commit} />
              ))
            )}
          </div>
        </section>

        <footer className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <HomeLink />
        </footer>
      </div>
    </main>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;
