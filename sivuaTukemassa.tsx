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
const pageNavLinkClass = 'inline-flex min-h-12 items-center rounded-full bg-white px-4 py-2 text-sm font-black text-indigo-700 shadow-sm ring-1 ring-indigo-100 hover:bg-indigo-50 hover:underline focus:outline-none focus:ring-4 focus:ring-indigo-200';

function App() {
  useEffect(() => installUsageTracking('sivua-tukemassa'), []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="space-y-7">
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
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
              Kokeilu
            </span>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">Sivua tukemassa</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-slate-700">
              Tämä sivu kokoaa näkyviin toimijat, jotka tukevat aloitussivun olemassaoloa. Tukeminen tehdään avoimesti ja niin, ettei sivuston puolueettomuus vaarannu.
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Tukijaperiaatteet</h2>
            <ul className="mt-5 space-y-4">
              {principles.map((principle) => (
                <li key={principle} className="flex gap-3 text-base font-bold leading-relaxed text-slate-700">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#173e5f] text-sm font-black text-white">
                    ✓
                  </span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
            <h2 className="text-2xl font-black text-indigo-950">Mitä tukeminen tarkoittaa?</h2>
            <p className="mt-4 text-base font-bold leading-relaxed text-indigo-950/80">
              Tukija voi saada logonsa näkyviin tällä sivulla. Mahdollinen logo linkin yhteydessä merkitään erikseen tukijamerkinnällä. Tukeminen ei ole suositus, arvio tai ostopaikka listalla.
            </p>
            <p className="mt-4 text-sm font-black uppercase tracking-wide text-indigo-800">
              Selkeä merkintä on tärkeämpi kuin näkyvyys.
            </p>
          </div>
        </section>

        <section className="mt-10 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Tukijat</h2>
              <p className="mt-2 text-sm font-bold text-slate-600">
                Tukijat näytetään avoimesti. Sivun omistaja on mukana ensimmäisenä tukijana.
              </p>
            </div>
          </div>

          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-[minmax(220px,360px)_1fr] md:items-center">
              <a href="https://vtkl.fi/" target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-slate-200 bg-white p-4 focus:outline-none focus:ring-4 focus:ring-indigo-200" aria-label="Siirry Vanhustyön keskusliitto ry:n sivustolle">
                <img
                  src={vtklLogo}
                  alt="Vanhustyön keskusliitto ry"
                  className="h-auto w-full"
                />
              </a>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-indigo-700">Sivun omistaja ja tukija</p>
                  <h3 className="mt-1 text-2xl font-black">Vanhustyön keskusliitto ry</h3>
                </div>
                <p className="text-base font-bold leading-relaxed text-slate-700">
                  Vanhustyön keskusliitto ry omistaa ja mahdollistaa Aloitussivu seniorille -kokeilun. Omistajuus merkitään näkyvästi, mutta se ei muuta linkkien puolueetonta käsittelyä.
                </p>
                <a href="https://vtkl.fi/" target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#173e5f] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#214f76]">
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
