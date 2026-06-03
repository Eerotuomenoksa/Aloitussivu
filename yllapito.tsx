import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { installUsageTracking } from './usageTracking';

const adminLinks = [
  {
    title: 'Muutosloki',
    description: 'Katso koko muutoshistoria ja viimeisimmät julkaisut.',
    href: './muutosloki.html',
  },
  {
    title: 'Kirjautuminen, käyttötilastot ja huijausvaroitukset',
    description: 'Kirjaudu ylläpitoon, tarkastele karkeita käyttötilastoja, käsittele linkkiehdotukset ja aja Kyberturvallisuuskeskuksen haku.',
    href: './ehdotukset.html',
  },
  {
    title: 'Linkkiluettelo',
    description: 'Tarkastele kaikkia linkkejä, alueellisia linkkejä ja paikkakuntakohtaista listausta.',
    href: './linkit.html',
  },
];

function HomeLink({ className = '' }: { className?: string }) {
  return (
    <a
      href="./index.html"
      className={`aurora-primary-link text-base ${className}`}
    >
      ← Palaa etusivulle
    </a>
  );
}

function App() {
  useEffect(() => installUsageTracking('yllapito'), []);

  return (
    <main className="aurora-page">
      <div className="aurora-shell space-y-10">
        <header className="aurora-subpage-hero space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="aurora-kicker">
              Ylläpito
            </span>
            <HomeLink />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Ylläpitäjän työpöytä</h1>
          <p className="max-w-3xl text-base font-semibold text-white/75 md:text-lg">
            Nopea näkymä sivuston ylläpidon tärkeimpiin työkaluihin. Kirjautuminen ja huijausvaroitukset löytyvät samasta suojatusta ylläpitonäkymästä.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Ylläpidon linkit">
          {adminLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="aurora-card group transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40"
            >
              <span className="text-sm font-black uppercase tracking-wide text-[var(--theme-primary)]">
                Avaa
              </span>
              <h2 className="aurora-section-title mt-3 text-2xl group-hover:text-[var(--theme-primary)]">
                {link.title}
              </h2>
              <p className="mt-3 text-base font-bold text-[var(--theme-text-2)]">
                {link.description}
              </p>
            </a>
          ))}
        </section>

        <footer className="border-t border-[var(--theme-border)] pt-8">
          <HomeLink />
        </footer>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
