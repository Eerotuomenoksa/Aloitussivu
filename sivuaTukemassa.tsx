import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import vtklLogo from './assets/vtkl_logo_vaaka_FI_SE_RGB.png';
import { installUsageTracking } from './usageTracking';

const principles = [
  'Tukijana oleminen ei vaikuta sivuston linkkien valintaan, järjestykseen, hakutuloksiin tai sanamuotoihin.',
  'Tukijat merkitään aina selkeästi, jotta käyttäjä tunnistaa kaupallisen tai muun taloudellisen tuen.',
  'Tukijan logo linkin yhteydessä on mahdollinen vain selvästi merkittynä tukijamerkintänä, eikä se nosta linkkiä muiden edelle.',
  'Sivustolle ei oteta mukaan harhaanjohtavaa, aggressiivista tai käyttäjien luottamusta heikentävää mainontaa.',
  'Tukijalogoihin ei liitetä käyttäjien profilointiin perustuvaa mainontaa tai erillisiä seurantapikseleitä.',
];
const pageNavLinkClass = 'aurora-nav-link px-4 py-2 text-sm';

function App() {
  useEffect(() => installUsageTracking('sivua-tukemassa'), []);

  return (
    <main className="aurora-page">
      <div className="aurora-shell">
        <header className="aurora-subpage-hero space-y-7">
          <nav className="flex flex-wrap items-center justify-between gap-4" aria-label="Sivun linkit">
            <a href="./index.html" className={pageNavLinkClass}>
              Takaisin aloitussivulle
            </a>
            <a href="./tietosuoja.html" className={pageNavLinkClass}>
              Tietosuoja
            </a>
            <a href="./saavutettavuus.html" className={pageNavLinkClass}>
              Saavutettavuus
            </a>
            <a href="./muutosloki.html" className={pageNavLinkClass}>
              Muutosloki
            </a>
          </nav>

          <div className="space-y-4">
            <span className="aurora-kicker">
              Kokeilu
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Sivua tukemassa</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-white/75">
              Tämä sivu kokoaa näkyviin toimijat, jotka tukevat aloitussivun olemassaoloa. Tukeminen tehdään avoimesti ja niin, ettei sivuston puolueettomuus vaarannu.
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="aurora-panel">
            <h2 className="aurora-section-title text-2xl">Tukijaperiaatteet</h2>
            <ul className="mt-5 space-y-4">
              {principles.map((principle) => (
                <li key={principle} className="flex gap-3 text-base font-bold leading-relaxed text-[var(--theme-text-2)]">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-black text-white">
                    ✓
                  </span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="aurora-soft-panel">
            <h2 className="aurora-section-title text-2xl">Mitä tukeminen tarkoittaa?</h2>
            <p className="mt-4 text-base font-bold leading-relaxed text-[var(--theme-text-2)]">
              Tukija voi saada logonsa näkyviin tällä sivulla. Mahdollinen logo linkin yhteydessä merkitään erikseen tukijamerkinnällä. Tukeminen ei ole suositus, arvio tai ostopaikka listalla.
            </p>
            <p className="mt-4 text-sm font-black uppercase tracking-wide text-[var(--theme-primary)]">
              Selkeä merkintä on tärkeämpi kuin näkyvyys.
            </p>
          </div>
        </section>

        <section className="mt-10 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="aurora-section-title text-3xl">Tukijat</h2>
              <p className="mt-2 text-sm font-bold text-[var(--theme-text-2)]">
                Tukijat näytetään avoimesti. Sivun omistaja on mukana ensimmäisenä tukijana.
              </p>
            </div>
          </div>

          <article className="aurora-panel">
            <div className="grid gap-6 md:grid-cols-[minmax(220px,360px)_1fr] md:items-center">
              <a href="https://vtkl.fi/" target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" aria-label="Siirry Vanhustyön keskusliitto ry:n sivustolle">
                <img
                  src={vtklLogo}
                  alt="Vanhustyön keskusliitto ry"
                  className="h-auto w-full"
                />
              </a>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-[var(--theme-primary)]">Sivun omistaja ja tukija</p>
                  <h3 className="aurora-section-title mt-1 text-2xl">Vanhustyön keskusliitto ry</h3>
                </div>
                <p className="text-base font-bold leading-relaxed text-[var(--theme-text-2)]">
                  Vanhustyön keskusliitto ry omistaa ja mahdollistaa Aloitussivu seniorille -kokeilun. Omistajuus merkitään näkyvästi, mutta se ei muuta linkkien puolueetonta käsittelyä.
                </p>
                <a href="https://vtkl.fi/" target="_blank" rel="noopener noreferrer" className="aurora-primary-link text-sm">
                  Siirry sivustolle
                </a>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
