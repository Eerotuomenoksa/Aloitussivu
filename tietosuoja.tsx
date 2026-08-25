import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { installUsageTracking } from './usageTracking';

const pageNavLinkClass = 'aurora-nav-link px-4 py-2 text-sm';
const sectionClass = 'aurora-panel';
const headingClass = 'aurora-section-title text-2xl';
const paragraphClass = 'mt-4 text-base font-bold leading-relaxed text-[var(--theme-text-2)]';
const listClass = 'mt-4 space-y-2 text-base font-bold leading-relaxed text-[var(--theme-text-2)]';

const tocItems = [
  ['mita-sivu-kertoo', 'Mitä tämä sivu kertoo'],
  ['rekisterinpitaja', 'Rekisterinpitäjä'],
  ['mita-kasitellaan', 'Mitä tietoja käsitellään'],
  ['mita-ei-kerata', 'Mitä ei kerätä'],
  ['selaimen-asetukset', 'Selaimeen tallennettavat asetukset'],
  ['kayttotilasto', 'Karkea käyttötilasto'],
  ['palautteet', 'Palautteet ja linkki-ilmoitukset'],
  ['paikalliset-palvelut', 'Paikalliset palvelut ja sää'],
  ['palveluntarjoajat', 'Tekniset palveluntarjoajat'],
  ['yllapitajan-kirjautuminen', 'Ylläpitäjän kirjautuminen'],
  ['sailytys-ja-poistaminen', 'Tietojen säilytys ja poistaminen'],
  ['oikeudet', 'Käyttäjän oikeudet'],
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
    <main className="aurora-page">
      <div className="aurora-shell">
        <header className="aurora-subpage-hero space-y-7">
          <nav className="flex flex-wrap items-center gap-3" aria-label="Sivun linkit">
            <a href="./index.html" className={pageNavLinkClass}>
              Takaisin aloitussivulle
            </a>
            <a href="./saavutettavuus.html" className={pageNavLinkClass}>
              Saavutettavuus
            </a>
          </nav>

          <div className="space-y-4">
            <span className="aurora-kicker">
              Käyttäjälle
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Tietosuoja</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-white/75">
              Seniorin aloitussivua voi käyttää ilman kirjautumista ja ilman evästeisiin perustuvaa seurantaa. Sivusto tallentaa käyttäjän omia asetuksia pääosin käyttäjän omaan selaimeen.
            </p>
          </div>
        </header>

        <section className="aurora-soft-panel mt-10" aria-labelledby="privacy-summary-heading">
          <h2 id="privacy-summary-heading" className="aurora-section-title text-2xl">Lyhyesti</h2>
          <ul className="mt-4 grid gap-3 text-base font-bold leading-relaxed text-[var(--theme-text-2)] md:grid-cols-2">
            <li>Sivua voi käyttää ilman käyttäjätiliä.</li>
            <li>Asetukset ja suosikit säilyvät käyttäjän omassa selaimessa.</li>
            <li>Käyttötilasto on karkea eikä perustu evästeisiin tai käyttäjäprofiileihin.</li>
            <li>Linkki-ilmoituksiin tallennetaan vain käyttäjän itse antamat tiedot.</li>
          </ul>
        </section>

        <nav className="aurora-panel mt-8 p-5" aria-label="Tietosuojasivun sisällysluettelo">
          <h2 className="text-lg font-black text-[var(--theme-text)]">Sisällysluettelo</h2>
          <ol className="mt-4 grid gap-2 text-sm font-black text-[var(--theme-primary)] md:grid-cols-2">
            {tocItems.map(([id, label]) => (
              <li key={id}>
                <a className="inline-flex min-h-10 items-center rounded-full px-3 py-1.5 hover:bg-[var(--theme-pale)] hover:underline focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" href={`#${id}`}>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-6">
          <PrivacySection id="mita-sivu-kertoo" title="Mitä tämä sivu kertoo">
            <p className={paragraphClass}>
              Tämä tietosuojasivu kertoo, mitä tietoja Seniorin aloitussivu käsittelee ja mihin tarkoitukseen. Sivun tarkoitus on olla selkeä myös käyttäjälle, joka ei tunne tietosuojatermejä.
            </p>
          </PrivacySection>

          <PrivacySection id="rekisterinpitaja" title="Rekisterinpitäjä">
            <p className={paragraphClass}>
              Seniorin aloitussivun rekisterinpitäjä on Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry (Y-tunnus 0215403–8), Malmin kauppatie 26, 00700 Helsinki.
            </p>
            <p className={paragraphClass}>
              Tietosuojan yhteyshenkilö on Nina Ziessler, vastaava asiantuntija. Hänet tavoittaa sähköpostilla osoitteesta <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a> ja puhelimitse numerosta 050 468 0171.
            </p>
          </PrivacySection>

          <PrivacySection id="mita-kasitellaan" title="Mitä tietoja käsitellään">
            <p className={paragraphClass}>Sivustolla voidaan käsitellä seuraavia tietoja:</p>
            <ul className={listClass}>
              <li>käyttäjän valitsema paikkakunta</li>
              <li>käyttäjän suosikit</li>
              <li>tekstikoko, väriteema ja näkyvien osioiden asetukset</li>
              <li>karkea käyttötilasto sivulatauksista ja linkkien klikkauksista</li>
              <li>käyttäjän lähettämä palaute, testipalaute tai linkki-ilmoitus, jos käyttäjä itse täyttää lomakkeen</li>
              <li>palautteeseen vapaaehtoisesti liitetty kuvakaappaus ja rajatut tekniset tiedot laitetyypistä, selaimesta ja sivusta</li>
              <li>ylläpitäjän Google-kirjautumistieto, käyttöoikeus ja ylläpidon muutosten auditointitiedot</li>
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
              Tilasto lähetetään saman sivuston Cloudcity-API:in ja tallennetaan päiväkohtaisina koosteina MariaDB-tietokantaan. Tilasto ei käytä evästeitä, käyttäjätunnisteita tai selaimen sormenjälkeä, eikä raakaa IP-osoitetta tallenneta käyttötilastoon. API käsittelee pyynnön teknistä verkko-osoitetta väärinkäytön estämiseksi ja muodostaa siitä palvelinsalaisuudella suojatun, lyhytikäiseen pyyntörajoitukseen käytettävän tunnisteen.
            </p>
          </PrivacySection>

          <PrivacySection id="palautteet" title="Palautteet, testipalaute ja linkki-ilmoitukset">
            <p className={paragraphClass}>
              Käyttäjä voi lähettää yleistä palautetta, vastata julkaisua edeltävään testikyselyyn tai ilmoittaa uuden, rikkinäisen tai väärään paikkaan vievän linkin. Lomakkeisiin tallennetaan käyttäjän itse antamat tiedot ja palautteen käsittelyssä tarvittavat rajatut tekniset tiedot.
            </p>
            <ul className={listClass}>
              <li>palautteen tyyppi, otsikko, kuvaus ja sivu, jota palaute koskee</li>
              <li>testipalautelomakkeessa annetut vastaukset</li>
              <li>linkin nimi</li>
              <li>osoite</li>
              <li>kategoria tai lähde, jos se on mukana</li>
              <li>käyttäjän kirjoittama lisähuomio</li>
              <li>ilmoituksen ajankohta</li>
              <li>ilmoituksen käsittelytila</li>
              <li>vapaaehtoinen kuvakaappaus</li>
            </ul>
            <p className={paragraphClass}>
              Tietoja käytetään vain Seniorin aloitussivun ylläpitoon, virheiden korjaamiseen, testaamiseen ja kehittämiseen. Lomakkeisiin tai kuvakaappauksiin ei pidä kirjoittaa henkilötietoja, terveystietoja, salasanoja tai muuta arkaluonteista tietoa. Kuvakaappaukset säilytetään suojattuina julkisen verkkohakemiston ulkopuolella.
            </p>
          </PrivacySection>

          <PrivacySection id="paikalliset-palvelut" title="Paikalliset palvelut ja sää">
            <p className={paragraphClass}>
              Paikallisia palveluja voidaan näyttää käyttäjän valitseman tai käyttäjän luvalla selaimen paikantaman paikkakunnan perusteella. Paikkakunnan voi vaihtaa käsin. Tarkkaa sijaintia ei tallenneta Seniorin aloitussivun palvelimelle.
            </p>
            <p className={paragraphClass}>
              Sääkortti käyttää säätietoa tarjoavaa ulkopuolista rajapintaa. Sää haetaan paikkakunnan koordinaattien perusteella. Tarkkaa käyttäjäprofiilia ei tallenneta.
            </p>
          </PrivacySection>

          <PrivacySection id="palveluntarjoajat" title="Tekniset palveluntarjoajat">
            <p className={paragraphClass}>
              Seniorin aloitussivun verkkopalvelu, PHP-API, suojatut liitteet ja MariaDB-tietokanta sijaitsevat Cloudcityn palvelinympäristössä. Ylläpitäjien Google-kirjautuminen varmennetaan väliaikaisesti Firebase Authentication -palvelulla. Firebase ei ole Seniorin aloitussivun varsinaisen sisällön tai palautteiden ensisijainen tietovarasto.
            </p>
            <p className={paragraphClass}>
              Sää-, paikannus- ja osoitehakutoiminnot voivat tehdä pyynnön ulkopuoliseen sää- tai paikkatietopalveluun vain toimintoa käytettäessä. Ulkoisen linkin tai Google-haun avaamisen jälkeen käyttäjä siirtyy kyseisen palveluntarjoajan palveluun ja sen tietosuojakäytännöt koskevat käyttöä.
            </p>
          </PrivacySection>

          <PrivacySection id="yllapitajan-kirjautuminen" title="Ylläpitäjän kirjautuminen">
            <p className={paragraphClass}>
              Ylläpitonäkymä on rajattu ennalta hyväksytyille ylläpitäjille. Ylläpitäjä kirjautuu Google-tunnuksella Firebase Authentication -palvelun kautta. Cloudcity-API tarkistaa kirjautumistunnisteen ja hyväksyy vain aktiivisen ylläpitoroolin. Tavallinen käyttäjä ei tarvitse kirjautumista.
            </p>
          </PrivacySection>

          <PrivacySection id="sailytys-ja-poistaminen" title="Tietojen säilytys ja poistaminen">
            <p className={paragraphClass}>
              Selaimeen tallennetut asetukset säilyvät käyttäjän omalla laitteella, kunnes käyttäjä poistaa sivuston tiedot tai vaihtaa selainta.
            </p>
            <p className={paragraphClass}>
              Palautteet ja linkki-ilmoitukset poistetaan viimeistään 12 kuukauden kuluttua vastaanottamisesta. Palautteiden kuvakaappaukset poistetaan heti, kun niitä ei enää tarvita, ja viimeistään 90 päivän kuluttua vastaanottamisesta.
            </p>
            <p className={paragraphClass}>
              Julkaisua edeltävä testipalaute poistetaan viimeistään kuuden kuukauden kuluttua testatun version julkaisemisesta. Jos versiota ei julkaista, määräaika lasketaan testauksen päättymisestä. Tunnisteettomat päiväkohtaiset käyttötilastokoosteet poistetaan viimeistään 24 kuukauden kuluttua.
            </p>
            <p className={paragraphClass}>
              Tiedot voidaan poistaa aikaisemmin, jos niitä ei enää tarvita. Ylläpitäjän tunniste- ja käyttöoikeustietoja säilytetään vain ylläpitotehtävän edellyttämän ajan.
            </p>
          </PrivacySection>

          <PrivacySection id="oikeudet" title="Käyttäjän oikeudet">
            <p className={paragraphClass}>
              Jos käyttäjän lähettämässä palautteessa tai kuvakaappauksessa on häntä koskevia henkilötietoja, hän voi pyytää tietojen tarkastamista, oikaisemista tai poistamista sekä käsittelyn rajoittamista soveltuvan tietosuojalainsäädännön mukaisesti. Pyynnössä pitää antaa riittävät tiedot oikean palautteen tunnistamiseksi ilman, että viestiin lisätään tarpeettomia henkilötietoja.
            </p>
            <p className={paragraphClass}>
              Käyttäjällä on myös oikeus tehdä valitus Tietosuojavaltuutetun toimistolle, jos hän katsoo, että henkilötietoja on käsitelty lainvastaisesti.
            </p>
          </PrivacySection>

          <PrivacySection id="yhteydenotto" title="Yhteydenotto">
            <p className={paragraphClass}>
              Tietosuojaan liittyvät kysymykset ja pyynnöt voi lähettää Nina Ziesslerille osoitteeseen <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>. Yleiset SeniorSurf-yhteydenotot voi lähettää osoitteeseen <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>.
            </p>
            <p className="aurora-soft-panel mt-4 text-sm font-black leading-relaxed">
              Päivitetty 25.8.2026. Selostetta päivitetään, kun palvelun tietovirrat, säilytysajat tai yhteystiedot muuttuvat.
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
