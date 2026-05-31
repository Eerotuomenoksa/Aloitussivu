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
  ['tarkoitus', 'Saavutettavuusselosteen tarkoitus'],
  ['tila', 'Palvelun saavutettavuuden tila'],
  ['tavoite', 'Saavutettavuuden tavoite'],
  ['asetukset', 'Käyttäjän omat asetukset'],
  ['huomioitu', 'Mitä olemme huomioineet'],
  ['puutteet', 'Tunnetut puutteet'],
  ['testaus', 'Miten saavutettavuutta on testattu'],
  ['palaute', 'Palaute ja yhteydenotto'],
  ['paivitys', 'Selosteen päivitys'],
];

function AccessibilitySection({
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
  useEffect(() => installUsageTracking('saavutettavuus'), []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="space-y-7">
          <nav className="flex flex-wrap items-center gap-3" aria-label="Sivun linkit">
            <a href="./index.html" className={pageNavLinkClass}>
              Takaisin aloitussivulle
            </a>
            <a href="./tietosuoja.html" className={pageNavLinkClass}>
              Tietosuoja
            </a>
            <a href="./sivua-tukemassa.html" className={pageNavLinkClass}>
              Sivua tukemassa
            </a>
            <a href="./muutosloki.html" className={pageNavLinkClass}>
              Muutosloki
            </a>
          </nav>

          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
              Käyttäjälle
            </span>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">Saavutettavuusseloste</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-slate-700">
              SeniorSurfin aloitussivu on suunniteltu ikääntyneille käyttäjille. Selkeä rakenne, isot painikkeet, tekstikoon säätö ja rauhallinen näkymä ovat palvelun peruslähtökohtia.
            </p>
          </div>
        </header>

        <section className="mt-10 rounded-lg border border-indigo-200 bg-indigo-50 p-6" aria-labelledby="accessibility-summary-heading">
          <h2 id="accessibility-summary-heading" className="text-2xl font-black text-indigo-950">Lyhyesti</h2>
          <p className="mt-4 text-base font-bold leading-relaxed text-indigo-950/85">
            SeniorSurfin aloitussivu täyttää saavutettavuuden tavoitteet osittain. Sivustolla on jo paljon saavutettavuutta tukevia ratkaisuja, mutta ruudunlukija-, näppäimistö-, kontrasti- ja käyttäjätestausta täydennetään ennen laajempaa julkaisua.
          </p>
        </section>

        <nav className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-label="Saavutettavuusselosteen sisällysluettelo">
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
          <AccessibilitySection id="tarkoitus" title="Saavutettavuusselosteen tarkoitus">
            <p className={paragraphClass}>
              Tämä saavutettavuusseloste koskee SeniorSurfin aloitussivua. Seloste kertoo, miten saavutettavuus on huomioitu, mitä puutteita on tunnistettu ja miten käyttäjä voi antaa palautetta.
            </p>
            <p className={paragraphClass}>
              Seloste on laadittu kehitysvaiheen tarkistuksen perusteella. Sitä päivitetään ennen laajempaa julkaisua, kun näppäimistö-, kontrasti- ja ruudunlukijatestausta on täydennetty.
            </p>
          </AccessibilitySection>

          <AccessibilitySection id="tila" title="Palvelun saavutettavuuden tila">
            <p className={paragraphClass}>
              SeniorSurfin aloitussivu täyttää saavutettavuuden tavoitteet osittain.
            </p>
            <p className={paragraphClass}>
              Sivustolla on jo paljon saavutettavuutta tukevia ratkaisuja, kuten suuret painikkeet, selkeä rakenne, tekstikoon säätö, pääsisältöön hyppäämisen linkki ja kuvaavat nimet painikkeille. Kaikkia kohtia ei ole kuitenkaan vielä testattu riittävän kattavasti ruudunlukijalla ja pelkällä näppäimistöllä.
            </p>
          </AccessibilitySection>

          <AccessibilitySection id="tavoite" title="Saavutettavuuden tavoite">
            <p className={paragraphClass}>
              SeniorSurfin aloitussivun tavoitteena on olla mahdollisimman helppo käyttää myös silloin, kun näkö, motoriikka, muisti tai digitaidot aiheuttavat haasteita.
            </p>
            <ul className={listClass}>
              <li>suurta ja selkeää tekstiä</li>
              <li>isoja painikkeita</li>
              <li>rauhallista visuaalista rakennetta</li>
              <li>näppäimistökäyttöä</li>
              <li>ruudunlukijan ymmärrettävää rakennetta</li>
              <li>mahdollisuutta käyttää hakua ja avustajaa myös puheella, jos selain tukee sitä</li>
            </ul>
          </AccessibilitySection>

          <AccessibilitySection id="asetukset" title="Käyttäjän omat asetukset">
            <p className={paragraphClass}>Sivun asetuksista käyttäjä voi:</p>
            <ul className={listClass}>
              <li>suurentaa tai pienentää tekstin kokoa</li>
              <li>vaihtaa tumman ja vaalean tilan välillä</li>
              <li>piilottaa osioita, joita ei tarvitse</li>
              <li>näyttää tai piilottaa sääkortin, kellon, uutiset, huijausvaroitukset ja tekoälyavustajan</li>
              <li>valita toisen kellon aikavyöhykkeen</li>
            </ul>
            <p className={paragraphClass}>Nämä asetukset tallennetaan käyttäjän omaan selaimeen.</p>
          </AccessibilitySection>

          <AccessibilitySection id="huomioitu" title="Mitä olemme huomioineet">
            <ul className={listClass}>
              <li>selkeä otsikkorakenne</li>
              <li>pääsisältöön hyppäämisen linkki</li>
              <li>suuret kosketusalueet</li>
              <li>korkea kontrasti päätoiminnoissa</li>
              <li>tekstikoon säätö</li>
              <li>asetuspaneelin Escape-sulku ja fokuksen palautus</li>
              <li>linkkien ja painikkeiden kuvaavat nimet</li>
              <li>sivuston esittelykierros uudelle käyttäjälle</li>
            </ul>
          </AccessibilitySection>

          <AccessibilitySection id="puutteet" title="Tunnetut puutteet">
            <p className={paragraphClass}>
              Sivusto on vielä kokeilu- ja kehitysvaiheessa. Tunnettuja tai tarkistettavia asioita:
            </p>
            <ul className={listClass}>
              <li>kaikkien modaalien fokuslukitus ja fokuksen palautus pitää varmistaa</li>
              <li>linkkiluettelosivu sisältää suuren määrän linkkejä, vaikka sivulle on lisätty haku, välilehdet ja ohituslinkki</li>
              <li>kaikkien kieliversioiden tekstit eivät ole yhtä viimeisteltyjä kuin suomi</li>
              <li>osa ulkopuolisista palveluista ei ole sivuston hallinnassa</li>
              <li>kartta-, sää-, tekoäly- ja puhetoiminnot voivat toimia eri tavoin eri selaimissa</li>
              <li>automaattista saavutettavuusauditointia ja käsin tehtyä ruudunlukijatestausta pitää vielä täydentää ennen laajaa julkaisua</li>
            </ul>
          </AccessibilitySection>

          <AccessibilitySection id="testaus" title="Miten saavutettavuutta on testattu">
            <p className={paragraphClass}>
              Sivustolle on tehty kehitysvaiheen saavutettavuustarkistus 31.5.2026.
            </p>
            <p className={paragraphClass}>Tarkistuksessa käytiin läpi:</p>
            <ul className={listClass}>
              <li>aloitussivu</li>
              <li>linkkiluettelo</li>
              <li>sivun tukijat</li>
              <li>linkkiehdotusten ylläpitosivu</li>
              <li>muutosloki</li>
            </ul>
            <p className={paragraphClass}>
              Tarkistuksessa katsottiin muun muassa otsikkorakennetta, sivun kielimääritystä, pääsisältöä, painikkeiden ja linkkien nimiä, lomakekenttien nimiä, kuvien alt-tekstejä ja duplikaatti-id:itä.
            </p>
            <p className={paragraphClass}>Tarkistusta täydennetään ennen julkaisua:</p>
            <ul className={listClass}>
              <li>näppäimistötestauksella</li>
              <li>ruudunlukijatestauksella</li>
              <li>kontrastien käsintarkistuksella</li>
              <li>mobiilinäkymän testauksella</li>
              <li>käyttäjätestauksella digiopastajien ja ikääntyneiden käyttäjien kanssa</li>
            </ul>
          </AccessibilitySection>

          <AccessibilitySection id="palaute" title="Palaute ja yhteydenotto">
            <p className={paragraphClass}>
              Sivua testataan digiopastajien ja käyttäjien kanssa. Palautteessa kannattaa kertoa:
            </p>
            <ul className={listClass}>
              <li>mikä kohta oli vaikea käyttää</li>
              <li>millä laitteella ja selaimella ongelma näkyi</li>
              <li>onnistuiko toiminto näppäimistöllä tai kosketuksella</li>
              <li>haittasiko ongelma sivun käyttöä vai oliko kyse pienemmästä häiriöstä</li>
            </ul>
            <p className={paragraphClass}>
              Saavutettavuuspalautteelle lisätään ennen julkaisua yhteydenottotapa. Vaihtoehtoina ovat sähköpostiosoite, lomake tai SeniorSurfin yleinen yhteydenottokanava.
            </p>
          </AccessibilitySection>

          <AccessibilitySection id="paivitys" title="Selosteen päivitys">
            <p className={paragraphClass}>
              Selostetta päivitetään aina, kun palveluun tehdään saavutettavuuteen vaikuttavia muutoksia tai kun käyttäjätestauksessa löytyy uusia havaintoja.
            </p>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-black leading-relaxed text-amber-950">
              Päivitetty 31.5.2026. Tämä seloste on käyttöönoton luonnos, jota täydennetään lopullisella palautekanavalla ennen laajaa julkaisua.
            </p>
          </AccessibilitySection>
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
