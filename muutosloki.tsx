import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  CHANGELOG_DEPLOYMENTS,
  CHANGELOG_GENERATED_AT,
  CHANGELOG_SOURCE,
  CHANGELOG_RECENT_COMMITS,
  CHANGELOG_WORKTREE_CHANGES,
  type ChangelogDeployment,
  type ChangelogCommit,
  type ChangelogWorktreeChange,
} from './changelogData';

const statusLabels: Record<ChangelogWorktreeChange['status'], string> = {
  modified: 'muokattu',
  added: 'lisätty',
  deleted: 'poistettu',
  renamed: 'uudelleennimetty',
  untracked: 'uusi',
  unmerged: 'yhdistämätön',
};

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

function FileList({ files }: { files: string[] }) {
  if (files.length === 0) return null;

  return (
    <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
      {files.map(file => (
        <li key={file} className="font-mono break-all">
          {file}
        </li>
      ))}
    </ul>
  );
}

function ChangePill({ status }: { status: ChangelogWorktreeChange['status'] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
      {statusLabels[status]}
    </span>
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
      <h2 className="mt-3 text-lg md:text-xl font-black text-slate-900 dark:text-white">
        {commit.subject}
      </h2>
      <FileList files={commit.files.slice(0, 8)} />
      {commit.files.length > 8 && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          +{commit.files.length - 8} tiedostoa lisää
        </p>
      )}
    </article>
  );
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
      <h2 className="mt-3 text-lg md:text-xl font-black text-slate-900 dark:text-white">
        {deployment.subject}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="font-mono">{deployment.shortSha}</span>
        {deployment.description ? ` · ${deployment.description}` : ''}
      </p>
      {deployment.url && (
        <a
          href={deployment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
        >
          Avaa deployment
        </a>
      )}
    </article>
  );
}

function WorktreeRow({ change }: { change: ChangelogWorktreeChange }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3">
      <ChangePill status={change.status} />
      <span className="font-mono text-sm break-all text-slate-700 dark:text-slate-200">{change.path}</span>
    </li>
  );
}

function App() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12 space-y-10">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wide">
              Kehittäjille
            </span>
            <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Ei linkitetty käyttöliittymään
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Muutosloki</h1>
          <p className="max-w-3xl text-base md:text-lg text-slate-600 dark:text-slate-300">
            Tämä sivu on tarkoitettu kehittäjille ja ylläpitoon. Se avautuu suoraan osoitteesta
            <span className="font-mono"> /muutosloki.html</span>.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Päivitetty: <span className="font-bold">{CHANGELOG_GENERATED_AT}</span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Lähde: <span className="font-bold">{CHANGELOG_SOURCE === 'github-api' ? 'GitHub deployments' : 'paikallinen git-fallback'}</span>
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-black">GitHub Pages -deployt</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {CHANGELOG_DEPLOYMENTS.length} merkintää
            </span>
          </div>
          {CHANGELOG_DEPLOYMENTS.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-5 text-slate-600 dark:text-slate-300">
              Deployment-historiaa ei saatu GitHub API:sta tässä ajossa. Buildissä käytetään
              silloin paikallista fallbackia, mutta GitHub Actionsissa tämä osio täyttyy
              oikeasta deployments-sivusta haetulla datalla.
            </p>
          ) : (
            <div className="grid gap-4">
              {CHANGELOG_DEPLOYMENTS.map(deployment => (
                <DeploymentCard key={deployment.id} deployment={deployment} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-black">Työpuun muutokset</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              näkyvät buildissa ennen varsinaista julkaisua
            </span>
          </div>
          {CHANGELOG_WORKTREE_CHANGES.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">
              Ei paikallisia muutoksia.
            </p>
          ) : (
            <ul className="space-y-3">
              {CHANGELOG_WORKTREE_CHANGES.map(change => (
                <WorktreeRow key={`${change.status}:${change.path}`} change={change} />
              ))}
            </ul>
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
              CHANGELOG_RECENT_COMMITS.map(commit => (
                <CommitCard key={commit.hash} commit={commit} />
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-5 text-sm text-slate-600 dark:text-slate-300">
          Tämä sivu ei näy valikossa eikä pääkäyttöliittymässä. Se on tarkoitettu tarkistukseen,
          vertailuun ja ylläpitoon.
        </section>
      </div>
    </main>
  );
}

export default App;

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
