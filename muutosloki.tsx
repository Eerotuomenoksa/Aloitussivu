import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  CHANGELOG_GENERATED_AT,
  CHANGELOG_RECENT_COMMITS,
  CHANGELOG_VERSION,
  CHANGELOG_WORKTREE_SUMMARY,
  type ChangelogCommit,
} from './changelogData';
import { APP_VERSION_BASIS } from './appVersion';
import { installUsageTracking } from './usageTracking';

function formatCommitHash(hash: string) {
  return hash.slice(0, 7);
}

function formatChangeType(changeType: ChangelogCommit['changeType']) {
  if (changeType === 'major') return 'Iso muutos';
  if (changeType === 'minor') return 'Ominaisuus';
  if (changeType === 'patch') return 'Korjaus';
  return 'Ylläpito';
}

function CommitCard({ commit }: { commit: ChangelogCommit }) {
  return (
    <article className="aurora-card">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[var(--theme-primary)] px-3 py-1 text-xs font-black text-white">
          v{commit.version}
        </span>
        <span className="rounded-full bg-[var(--theme-pale)] px-3 py-1 font-mono text-xs font-black text-[var(--theme-primary)]">
          {formatCommitHash(commit.hash)}
        </span>
        <span className="text-sm font-bold text-[var(--theme-text-3)]">{commit.date}</span>
        <span className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-1 text-xs font-black text-[var(--theme-text-2)]">
          {formatChangeType(commit.changeType)}
        </span>
      </div>
      <p className="mt-3 text-base font-bold text-[var(--theme-text-2)] md:text-lg">
        {commit.subject}
      </p>
    </article>
  );
}

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

function App() {
  useEffect(() => installUsageTracking('muutosloki'), []);

  const latestSummary = CHANGELOG_WORKTREE_SUMMARY[0] || CHANGELOG_RECENT_COMMITS[0]?.subject || '';

  return (
    <main className="aurora-page">
      <div className="aurora-shell space-y-10">
        <header className="aurora-subpage-hero space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="aurora-kicker">
              Kehittäjille
            </span>
            <HomeLink />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Muutosloki</h1>
          <p className="max-w-3xl text-base font-semibold text-white/75 md:text-lg">
            Tämä sivu näyttää viimeisimmät muutokset suomenkielisinä yhteenvetoina.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/15">
              Versio {CHANGELOG_VERSION}
            </span>
            <span className="text-sm font-bold text-white/55">
              {APP_VERSION_BASIS}
            </span>
          </div>
          <p className="text-sm text-white/60">
            Päivitetty: <span className="font-bold">{CHANGELOG_GENERATED_AT}</span>
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="aurora-section-title text-2xl md:text-3xl">Viimeisin muutos</h2>
          <article className="aurora-panel p-6 shadow-lg">
            <span className="mb-4 inline-flex rounded-full bg-[var(--theme-primary)] px-4 py-2 text-sm font-black text-white">
              Versio {CHANGELOG_VERSION}
            </span>
            <p className="text-xl font-black leading-snug text-[var(--theme-text)] md:text-2xl">
              {latestSummary || 'Ei uusia muutoksia saatavilla.'}
            </p>
          </article>
          {CHANGELOG_WORKTREE_SUMMARY.length > 1 && (
            <div className="grid gap-3">
              {CHANGELOG_WORKTREE_SUMMARY.slice(1).map((summary) => (
                <article key={summary} className="aurora-card">
                  <p className="text-base font-bold text-[var(--theme-text-2)] md:text-lg">
                    {summary}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="aurora-section-title text-2xl md:text-3xl">Koko muutoshistoria</h2>
            <span className="text-sm text-[var(--theme-text-3)]">
              {CHANGELOG_RECENT_COMMITS.length} merkintää
            </span>
          </div>
          <div className="grid gap-4">
            {CHANGELOG_RECENT_COMMITS.length === 0 ? (
              <p className="text-[var(--theme-text-2)]">Ei commit-historiaa saatavilla.</p>
            ) : (
              CHANGELOG_RECENT_COMMITS.map((commit) => (
                <CommitCard key={commit.hash} commit={commit} />
              ))
            )}
          </div>
        </section>

        <footer className="border-t border-[var(--theme-border)] pt-8">
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
