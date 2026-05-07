import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const adminLinks = [
  {
    title: 'Muutosloki',
    description: 'Katso koko muutoshistoria ja viimeisimmät julkaisut.',
    href: './muutosloki.html',
  },
  {
    title: 'Kirjautuminen ja huijausvaroitukset',
    description: 'Kirjaudu ylläpitoon, käsittele linkkiehdotukset ja aja Kyberturvallisuuskeskuksen huijausvaroitusten haku.',
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
      className={`inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-base font-black text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 ${className}`}
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
              Ylläpito
            </span>
            <HomeLink />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Ylläpitäjän työpöytä</h1>
          <p className="max-w-3xl text-base md:text-lg text-slate-600 dark:text-slate-300">
            Nopea näkymä sivuston ylläpidon tärkeimpiin työkaluihin. Kirjautuminen ja huijausvaroitukset löytyvät samasta suojatusta ylläpitonäkymästä.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Ylläpidon linkit">
          {adminLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              <span className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                Avaa
              </span>
              <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                {link.title}
              </h2>
              <p className="mt-3 text-base font-bold text-slate-600 dark:text-slate-300">
                {link.description}
              </p>
            </a>
          ))}
        </section>

        <footer className="border-t border-slate-200 dark:border-slate-800 pt-8">
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
