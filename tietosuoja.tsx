import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { installUsageTracking } from './usageTracking';

const pageNavLinkClass = 'inline-flex min-h-12 items-center rounded-full bg-white px-4 py-2 text-sm font-black text-indigo-700 shadow-sm ring-1 ring-indigo-100 hover:bg-indigo-50 hover:underline focus:outline-none focus:ring-4 focus:ring-indigo-200';
const sectionClass = 'rounded-lg border border-slate-200 bg-white p-6 shadow-sm';
const headingClass = 'text-2xl font-black tracking-tight text-slate-950';
const paragraphClass = 'mt-4 text-base font-bold leading-relaxed text-slate-700';
const listClass = 'mt-4 space-y-2 text-base font-bold leading-relaxed text-slate-700';

const tocItems = [
  ['mita-sivu-kertoo', 'Mitä tämä sivu kertoo'],
  ['mita-kasitellaan', 'Mitä tietoja käsitellään'],
  ['mita-ei-kerata', 'Mitä ei kerätä'],
  ['selaimen-asetukset', 'Selaimeen tallennettavat asetukset'],
  ['kayttotilasto', 'Karkea käyttötilasto'],
  ['linkki-ilmoitukset', 'Linkki-ilmoitukset ja ylläpito'],
  ['tekoaly-ja-palvelut', 'Tekoälyavustaja ja ulkopuoliset palvelut'],
  ['paikalliset-palvelut', 'Paikalliset palvelut ja sää'],
  ['yllapitajan-kirjautuminen', 'Ylläpitäjän kirjautuminen'],
  ['sailytys-ja-poistaminen', 'Tietojen säilytys ja poistaminen'],
  ['yhteydenotto', 'Yhteydenotto'],
];

function PrivacySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={sectionClass} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className={headingClass}>{title}</h2>
      {children}
    </section>
  );
}

function App() {
  useEffect(() => installUsageTracking('tietosuoja'), []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="space-y-7">
          <nav className="flex flex-wrap items-center gap-3" aria-label="Sivun linkit">
            <a href="./index.html" className={pageNavLinkClass}>
              Takaisin aloitussivulle
            </a>
            <a href="./sivua-tukemassa.html" className={pageNavLinkClass}>
              Sivua tukemassa
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
              Käyttäjälle
            </span>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">Tietosuoja</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-slate-700">
              SeniorSurfin aloitussivua voi käyttää ilman kirjautumista ja ilman evästeisiin perustuvaa seurantaa. Sivusto tallentaa käyttäjän omia asetuksia pääosin käyttäjän omaan selaimeen.
            </p>
          </div>
        </header>

        <section className="mt-10 rounded-lg border border-indigo-200 bg-indigo-50 p-6" aria-labelledby="privacy-summary-heading">
          <h2 id="privacy-summary-heading" className="text-2xl font-black text-indigo-950">Lyhyesti</h2>
          <ul className="mt-4 grid gap-3 text-base font-bold leading-relaxed text-indigo-950/85 md:grid-cols-2">
            <li>Sivua voi käyttää ilman käyttäjätiliä.</li>
            <li>Asetukset ja suosikit säilyvät käyttäjän omassa selaimessa.</li>
            <li>Käyttötilasto on karkea eikä perustu evästeisiin tai käyttäjäprofiileihin.</li>
            <li>Linkki-ilmoituksiin tallennetaan vain käyttäjän itse antamat tiedot.</li>
          </ul>
        </section>

        <nav className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-label="Tietosuojasivun sisällysluettelo">
          <h2 className="text-lg font-black text-slate-950">Sisällysluettelo</h2>
          <ol className="mt-4 grid gap-2 text-sm font-black text-indigo-700 md:grid-cols-2">
            {tocItems.map(([id, label]) => (
              <li key={id}>
                <a className="inline-flex min-h-10 items-center rounded-full px-3 py-1.5 hover:bg-indigo-50 hover:underline focus:outline-none focus:ring-4 focus:ring-indigo-200" href={`#${id}`}>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-6">
          <PrivacySection id="mita-sivu-kertoo" title="Mitä tämä sivu kertoo">
            <p className={paragraphClass}>
              Tämä tietosuojasivu kertoo, mitä tietoja SeniorSurfin aloitussivu käsittelee ja mihin tarkoitukseen. Sivun tarkoitus on olla selkeä myös käyttäjälle, joka ei tunne tietosuojatermejä.
            </p>
          </PrivacySection>

          <PrivacySection id="mita-kasitellaan" title="Mitä tietoja käsitellään">
            <p className={paragraphClass}>Sivustolla voidaan käsitellä seuraavia tietoja:</p>
            <ul className={listClass}>
              <li>käyttäjän valitsema paikkakunta</li>
              <li>käyttäjän suosikit</li>
              <li>tekstikoko, väriteema ja näkyvien osioiden asetukset</li>
              <li>karkea käyttötilasto sivulatauksista ja linkkien klikkauksista</li>
              <li>käyttäjän lähettämä linkki-ilmoitus, jos käyttäjä itse täyttää lomakkeen</li>
              <li>ylläpitäjän Google-kirjautumistieto ylläpitonäkymässä</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="mita-ei-kerata" title="Mitä ei kerätä">
            <p className={paragraphClass}>Sivusto ei käytä:</p>
            <ul className={listClass}>
              <li>evästeisiin perustuvaa käyttäjäseurantaa</li>
              <li>mainosseurantaa</li>
              <li>käyttäjätunnisteita tavalliselle käyttäjälle</li>
              <li>selaimen sormenjälkeä</li>
              <li>IP-osoitteen tallennusta käyttötilastoon</li>
              <li>tarkkaa sijaintihistoriaa</li>
            </ul>
            <p className={paragraphClass}>Sivustoa voi käyttää ilman kirjautumista.</p>
          </PrivacySection>

          <PrivacySection id="selaimen-asetukset" title="Selaimeen tallennettavat asetukset">
            <p className={paragraphClass}>
              Osa asetuksista tallennetaan käyttäjän omaan selaimeen, jotta sivu muistaa käyttäjän valinnat.
            </p>
            <ul className={listClass}>
              <li>suosikit</li>
              <li>valittu paikkakunta</li>
              <li>tekstikoko</li>
              <li>tumma tai vaalea tila</li>
              <li>näkyvät osiot</li>
              <li>onko esittelykierros jo nähty</li>
              <li>toisen kellon aikavyöhyke</li>
            </ul>
            <p className={paragraphClass}>
              Nämä tiedot eivät muodosta palvelimella käyttäjäprofiilia. Käyttäjä voi poistaa ne tyhjentämällä selaimen sivustotiedot.
            </p>
          </PrivacySection>

          <PrivacySection id="kayttotilasto" title="Karkea käyttötilasto">
            <p className={paragraphClass}>
              Sivustolla kerätään karkeaa käyttötilastoa palvelun kehittämiseksi.
            </p>
            <ul className={listClass}>
              <li>sivulatausten määrä päiväkohtaisesti</li>
              <li>linkkiklikkausten määrä päiväkohtaisesti</li>
              <li>klikattujen linkkien osoite ja näkyvä nimi ylläpidon raportointia varten</li>
            </ul>
            <p className={paragraphClass}>
              Tilasto ei käytä evästeitä, käyttäjätunnisteita, selaimen sormenjälkeä eikä IP-osoitteen tallennusta. Cloud Function näkee HTTP-pyynnön teknisen IP-tiedon pyynnön käsittelyn aikana, mutta sitä ei kirjoiteta tietokantaan.
            </p>
          </PrivacySection>

          <PrivacySection id="linkki-ilmoitukset" title="Linkki-ilmoitukset ja ylläpito">
            <p className={paragraphClass}>
              Käyttäjä voi ilmoittaa uuden linkin, rikkinäisen linkin tai väärään paikkaan vievän linkin. Lomakkeeseen tallennetaan vain käyttäjän itse antamat tiedot.
            </p>
            <ul className={listClass}>
              <li>linkin nimi</li>
              <li>osoite</li>
              <li>kategoria tai lähde, jos se on mukana</li>
              <li>käyttäjän kirjoittama lisähuomio</li>
              <li>ilmoituksen ajankohta</li>
              <li>ilmoituksen käsittelytila</li>
            </ul>
            <p className={paragraphClass}>Linkki-ilmoituksia käytetään vain sivun ylläpitoon.</p>
          </PrivacySection>

          <PrivacySection id="tekoaly-ja-palvelut" title="Tekoälyavustaja ja ulkopuoliset palvelut">
            <p className={paragraphClass}>
              Sivustolla voi olla tekoälyavustaja, joka vastaa käyttäjän kirjoittamaan tai sanelemaan kysymykseen. Käyttäjän ei pidä kirjoittaa avustajalle arkaluonteisia henkilötietoja, pankkitunnuksia, salasanoja tai terveystietoja.
            </p>
            <p className={paragraphClass}>
              Tekoälyavustajan tekninen toteutus voi käyttää ulkopuolista tekoälypalvelua. Kysymys lähetetään käsiteltäväksi vain silloin, kun käyttäjä käyttää avustajaa.
            </p>
          </PrivacySection>

          <PrivacySection id="paikalliset-palvelut" title="Paikalliset palvelut ja sää">
            <p className={paragraphClass}>
              Paikallisia palveluja voidaan näyttää käyttäjän valitseman tai selaimen paikantaman paikkakunnan perusteella. Paikkakunnan voi vaihtaa käsin.
            </p>
            <p className={paragraphClass}>
              Sääkortti käyttää säätietoa tarjoavaa ulkopuolista rajapintaa. Sää haetaan paikkakunnan koordinaattien perusteella. Tarkkaa käyttäjäprofiilia ei tallenneta.
            </p>
          </PrivacySection>

          <PrivacySection id="yllapitajan-kirjautuminen" title="Ylläpitäjän kirjautuminen">
            <p className={paragraphClass}>
              Ylläpitonäkymä on rajattu ylläpitäjille. Ylläpitäjä kirjautuu Google-tunnuksella. Tavallinen käyttäjä ei tarvitse kirjautumista.
            </p>
          </PrivacySection>

          <PrivacySection id="sailytys-ja-poistaminen" title="Tietojen säilytys ja poistaminen">
            <p className={paragraphClass}>
              Selaimeen tallennetut asetukset säilyvät käyttäjän omalla laitteella, kunnes käyttäjä poistaa sivuston tiedot tai vaihtaa selainta.
            </p>
            <p className={paragraphClass}>
              Ylläpidon tiedot, kuten linkki-ilmoitukset ja käyttötilastot, säilytetään niin kauan kuin niitä tarvitaan sivun ylläpitoon ja kehittämiseen.
            </p>
          </PrivacySection>

          <PrivacySection id="yhteydenotto" title="Yhteydenotto">
            <p className={paragraphClass}>
              Tietosuojaan liittyvät kysymykset ohjataan sivun ylläpidolle tai Vanhustyön keskusliiton sovittuun yhteyshenkilöön. Lopullinen yhteystieto lisätään ennen julkaisua.
            </p>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-black leading-relaxed text-amber-950">
              Päivitetty 31.5.2026. Tämä sivu on käyttöönoton luonnos, jota täydennetään lopullisella yhteystiedolla ja rekisterinpitäjätiedolla ennen laajaa julkaisua.
            </p>
          </PrivacySection>
        </div>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
