import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { installUsageTracking } from './usageTracking';
import {
  getLocalizedPublicPageHref,
  PublicPageLanguage,
  PublicPageLanguageSwitcher,
  usePublicPageLanguage,
} from './publicPageLocalization';

const pageNavLinkClass = 'aurora-nav-link px-4 py-2 text-sm';
const sectionClass = 'aurora-panel';
const headingClass = 'aurora-section-title text-2xl';
const paragraphClass = 'mt-4 text-base font-bold leading-relaxed text-[var(--theme-text-2)]';
const listClass = 'mt-4 space-y-2 text-base font-bold leading-relaxed text-[var(--theme-text-2)]';

type ContentBlock =
  | { type: 'paragraph'; content: React.ReactNode }
  | { type: 'list'; items: string[] };

type AccessibilityCopy = {
  navigationLabel: string;
  backHome: string;
  privacy: string;
  kicker: string;
  title: string;
  intro: string;
  summaryTitle: string;
  summary: string;
  tocLabel: string;
  tocTitle: string;
  sections: Array<{ id: string; title: string; blocks: ContentBlock[] }>;
};

const paragraph = (content: React.ReactNode): ContentBlock => ({ type: 'paragraph', content });
const list = (...items: string[]): ContentBlock => ({ type: 'list', items });

const accessibilityTranslations: Record<PublicPageLanguage, AccessibilityCopy> = {
  fi: {
    navigationLabel: 'Sivun linkit',
    backHome: 'Takaisin aloitussivulle',
    privacy: 'Tietosuoja',
    kicker: 'Käyttäjälle',
    title: 'Saavutettavuusseloste',
    intro: 'Seniorin aloitussivu on suunniteltu ikääntyneille käyttäjille. Selkeä rakenne, isot painikkeet, tekstikoon säätö ja rauhallinen näkymä ovat palvelun peruslähtökohtia.',
    summaryTitle: 'Lyhyesti',
    summary: 'Seniorin aloitussivu täyttää saavutettavuuden tavoitteet osittain. Sivustolla on jo paljon saavutettavuutta tukevia ratkaisuja, mutta ruudunlukija-, näppäimistö-, kontrasti- ja käyttäjätestausta täydennetään ennen laajempaa julkaisua.',
    tocLabel: 'Saavutettavuusselosteen sisällysluettelo',
    tocTitle: 'Sisällysluettelo',
    sections: [
      {
        id: 'tarkoitus',
        title: 'Saavutettavuusselosteen tarkoitus',
        blocks: [
          paragraph('Tämä saavutettavuusseloste koskee Seniorin aloitussivua. Seloste kertoo, miten saavutettavuus on huomioitu, mitä puutteita on tunnistettu ja miten käyttäjä voi antaa palautetta.'),
          paragraph('Seloste on laadittu kehitysvaiheen tarkistuksen perusteella. Sitä päivitetään ennen laajempaa julkaisua, kun näppäimistö-, kontrasti- ja ruudunlukijatestausta on täydennetty.'),
        ],
      },
      {
        id: 'tila',
        title: 'Palvelun saavutettavuuden tila',
        blocks: [
          paragraph('Seniorin aloitussivu täyttää saavutettavuuden tavoitteet osittain.'),
          paragraph('Sivustolla on jo paljon saavutettavuutta tukevia ratkaisuja, kuten suuret painikkeet, selkeä rakenne, tekstikoon säätö, pääsisältöön hyppäämisen linkki ja kuvaavat nimet painikkeille. Kaikkia kohtia ei ole kuitenkaan vielä testattu riittävän kattavasti ruudunlukijalla ja pelkällä näppäimistöllä.'),
        ],
      },
      {
        id: 'tavoite',
        title: 'Saavutettavuuden tavoite',
        blocks: [
          paragraph('Seniorin aloitussivun tavoitteena on olla mahdollisimman helppo käyttää myös silloin, kun näkö, motoriikka, muisti tai digitaidot aiheuttavat haasteita.'),
          list('suurta ja selkeää tekstiä', 'isoja painikkeita', 'rauhallista visuaalista rakennetta', 'näppäimistökäyttöä', 'ruudunlukijan ymmärrettävää rakennetta', 'mahdollisuutta käyttää hakuja myös puheella, jos selain tukee sitä'),
        ],
      },
      {
        id: 'asetukset',
        title: 'Käyttäjän omat asetukset',
        blocks: [
          paragraph('Sivun asetuksista käyttäjä voi:'),
          list('suurentaa tai pienentää tekstin kokoa', 'vaihtaa tumman ja vaalean tilan välillä', 'piilottaa osioita, joita ei tarvitse', 'näyttää tai piilottaa sääkortin, kellon, paikallisuutiset ja huijausvaroitukset', 'valita toisen kellon aikavyöhykkeen'),
          paragraph('Nämä asetukset tallennetaan käyttäjän omaan selaimeen.'),
        ],
      },
      {
        id: 'huomioitu',
        title: 'Mitä olemme huomioineet',
        blocks: [list('selkeä otsikkorakenne', 'pääsisältöön hyppäämisen linkki', 'suuret kosketusalueet', 'korkea kontrasti päätoiminnoissa', 'tekstikoon säätö', 'asetuspaneelin Escape-sulku ja fokuksen palautus', 'linkkien ja painikkeiden kuvaavat nimet', 'sivuston esittelykierros uudelle käyttäjälle')],
      },
      {
        id: 'puutteet',
        title: 'Tunnetut puutteet',
        blocks: [
          paragraph('Sivusto on vielä kokeilu- ja kehitysvaiheessa. Tunnettuja tai tarkistettavia asioita:'),
          list('kaikkien modaalien fokuslukitus ja fokuksen palautus pitää varmistaa', 'linkkiluettelosivu sisältää suuren määrän linkkejä, vaikka sivulle on lisätty haku, välilehdet ja ohituslinkki', 'kaikkien kieliversioiden tekstit eivät ole yhtä viimeisteltyjä kuin suomi', 'osa ulkopuolisista palveluista ei ole sivuston hallinnassa', 'kartta-, sää- ja puhetoiminnot voivat toimia eri tavoin eri selaimissa', 'automaattista saavutettavuusauditointia ja käsin tehtyä ruudunlukijatestausta pitää vielä täydentää ennen laajaa julkaisua'),
        ],
      },
      {
        id: 'testaus',
        title: 'Miten saavutettavuutta on testattu',
        blocks: [
          paragraph('Sivustolle on tehty kehitysvaiheen saavutettavuustarkistus 31.5.2026.'),
          paragraph('Tarkistuksessa käytiin läpi:'),
          list('Seniorin aloitussivu', 'linkkiluettelo', 'linkkiehdotusten ylläpitosivu', 'muutosloki'),
          paragraph('Tarkistuksessa katsottiin muun muassa otsikkorakennetta, sivun kielimääritystä, pääsisältöä, painikkeiden ja linkkien nimiä, lomakekenttien nimiä, kuvien alt-tekstejä ja duplikaatti-id:itä.'),
          paragraph('Tarkistusta täydennetään ennen julkaisua:'),
          list('näppäimistötestauksella', 'ruudunlukijatestauksella', 'kontrastien käsintarkistuksella', 'mobiilinäkymän testauksella', 'käyttäjätestauksella digiopastajien ja ikääntyneiden käyttäjien kanssa'),
        ],
      },
      {
        id: 'palaute',
        title: 'Palaute ja yhteydenotto',
        blocks: [
          paragraph('Sivua testataan digiopastajien ja käyttäjien kanssa. Palautteessa kannattaa kertoa:'),
          list('mikä kohta oli vaikea käyttää', 'millä laitteella ja selaimella ongelma näkyi', 'onnistuiko toiminto näppäimistöllä tai kosketuksella', 'haittasiko ongelma sivun käyttöä vai oliko kyse pienemmästä häiriöstä'),
          paragraph(<>Saavutettavuuspalautteen voi lähettää sähköpostilla osoitteeseen <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>. Palautteeseen vastataan mahdollisimman pian; vastauksessa voi mennä 14 päivää. Palautteiden käsittelystä vastaa Vanhustyön keskusliiton SeniorSurf-toiminta.</>),
        ],
      },
      {
        id: 'valvonta',
        title: 'Täytäntöönpanomenettely',
        blocks: [
          paragraph('Jos huomaat palvelussa saavutettavuusongelman, anna ensin palautetta sivuston ylläpitäjälle. Jos et ole tyytyväinen vastaukseen tai et saa vastausta kahden viikon aikana, voit antaa palautteen valvovalle viranomaiselle.'),
          paragraph(<>Valvontaviranomainen on Liikenne- ja viestintävirasto Traficomin Digitaalisen esteettömyyden ja saavutettavuuden valvontayksikkö. Ohjeet löytyvät osoitteesta <a className="underline" href="https://www.saavutettavuusvaatimukset.fi/" rel="noreferrer" target="_blank">saavutettavuusvaatimukset.fi</a>. Sähköposti on <a className="underline" href="mailto:saavutettavuus@traficom.fi">saavutettavuus@traficom.fi</a> ja Traficomin vaihteen numero 029 534 5000.</>),
        ],
      },
      {
        id: 'paivitys',
        title: 'Selosteen päivitys',
        blocks: [
          paragraph('Selostetta päivitetään aina, kun palveluun tehdään saavutettavuuteen vaikuttavia muutoksia tai kun käyttäjätestauksessa löytyy uusia havaintoja.'),
          paragraph('Seloste on laadittu kehitysvaiheen itsearvioinnin perusteella 31.5.2026 ja päivitetty 25.8.2026. Selostetta päivitetään seuraavan kattavan saavutettavuustarkistuksen ja olennaisten palvelumuutosten yhteydessä.'),
        ],
      },
    ],
  },
  sv: {
    navigationLabel: 'Sidans länkar',
    backHome: 'Tillbaka till startsidan',
    privacy: 'Dataskydd',
    kicker: 'För användaren',
    title: 'Tillgänglighetsutlåtande',
    intro: 'Seniorens startsida har utformats för äldre användare. En tydlig struktur, stora knappar, justerbar textstorlek och en lugn vy är grundläggande utgångspunkter för tjänsten.',
    summaryTitle: 'I korthet',
    summary: 'Seniorens startsida uppfyller tillgänglighetsmålen delvis. Webbplatsen har redan många lösningar som stöder tillgängligheten, men tester med skärmläsare och tangentbord samt kontrast- och användartester kompletteras före en bredare lansering.',
    tocLabel: 'Tillgänglighetsutlåtandets innehållsförteckning',
    tocTitle: 'Innehåll',
    sections: [
      {
        id: 'tarkoitus',
        title: 'Tillgänglighetsutlåtandets syfte',
        blocks: [
          paragraph('Detta tillgänglighetsutlåtande gäller Seniorens startsida. Utlåtandet beskriver hur tillgängligheten har beaktats, vilka brister som har identifierats och hur användaren kan ge respons.'),
          paragraph('Utlåtandet har utarbetats utifrån en granskning under utvecklingsfasen. Det uppdateras före en bredare lansering när testerna med tangentbord och skärmläsare samt kontrasttesterna har kompletterats.'),
        ],
      },
      {
        id: 'tila',
        title: 'Tjänstens tillgänglighetsstatus',
        blocks: [
          paragraph('Seniorens startsida uppfyller tillgänglighetsmålen delvis.'),
          paragraph('Webbplatsen har redan många lösningar som stöder tillgängligheten, till exempel stora knappar, tydlig struktur, justerbar textstorlek, en länk för att hoppa till huvudinnehållet och beskrivande namn på knappar. Alla delar har dock ännu inte testats tillräckligt omfattande med skärmläsare och enbart tangentbord.'),
        ],
      },
      {
        id: 'tavoite',
        title: 'Tillgänglighetsmål',
        blocks: [
          paragraph('Målet är att Seniorens startsida ska vara så enkel som möjligt att använda också när syn, motorik, minne eller digitala färdigheter innebär utmaningar.'),
          list('stor och tydlig text', 'stora knappar', 'en lugn visuell struktur', 'tangentbordsanvändning', 'en struktur som skärmläsare kan tolka', 'möjlighet att använda sökningar med tal om webbläsaren stöder det'),
        ],
      },
      {
        id: 'asetukset',
        title: 'Användarens egna inställningar',
        blocks: [
          paragraph('I sidans inställningar kan användaren:'),
          list('förstora eller förminska texten', 'växla mellan mörkt och ljust läge', 'dölja avsnitt som inte behövs', 'visa eller dölja väderkortet, klockan, lokala nyheter och bedrägerivarningar', 'välja tidszon för den andra klockan'),
          paragraph('Dessa inställningar sparas i användarens egen webbläsare.'),
        ],
      },
      {
        id: 'huomioitu',
        title: 'Vad vi har beaktat',
        blocks: [list('tydlig rubrikstruktur', 'länk för att hoppa till huvudinnehållet', 'stora tryckytor', 'hög kontrast i huvudfunktionerna', 'justerbar textstorlek', 'stängning av inställningspanelen med Escape och återställning av fokus', 'beskrivande namn på länkar och knappar', 'en introduktionsrunda för nya användare')],
      },
      {
        id: 'puutteet',
        title: 'Kända brister',
        blocks: [
          paragraph('Webbplatsen är fortfarande i försöks- och utvecklingsfasen. Kända frågor eller frågor som ska kontrolleras:'),
          list('fokuslåsning och återställning av fokus i alla dialogrutor måste säkerställas', 'länklistan innehåller ett stort antal länkar, trots att sidan har fått sökning, flikar och en länk för att hoppa förbi listan', 'texterna i alla språkversioner är inte lika finslipade som de finska texterna', 'en del externa tjänster ligger utanför webbplatsens kontroll', 'kart-, väder- och talfunktioner kan fungera olika i olika webbläsare', 'den automatiska tillgänglighetsgranskningen och den manuella skärmläsartestningen måste kompletteras före en bred lansering'),
        ],
      },
      {
        id: 'testaus',
        title: 'Hur tillgängligheten har testats',
        blocks: [
          paragraph('En tillgänglighetsgranskning under utvecklingsfasen genomfördes på webbplatsen den 31 maj 2026.'),
          paragraph('Granskningen omfattade:'),
          list('Seniorens startsida', 'länklistan', 'administrationssidan för länkförslag', 'ändringsloggen'),
          paragraph('Vid granskningen kontrollerades bland annat rubrikstrukturen, sidans språkangivelse, huvudinnehållet, namn på knappar och länkar, namn på formulärfält, bildernas alt-texter och dubbla id-attribut.'),
          paragraph('Granskningen kompletteras före lanseringen med:'),
          list('tangentbordstestning', 'skärmläsartestning', 'manuell kontroll av kontraster', 'testning av mobilvyn', 'användartestning med digitala handledare och äldre användare'),
        ],
      },
      {
        id: 'palaute',
        title: 'Respons och kontakt',
        blocks: [
          paragraph('Sidan testas tillsammans med digitala handledare och användare. I responsen är det bra att berätta:'),
          list('vilken del som var svår att använda', 'på vilken enhet och i vilken webbläsare problemet visades', 'om funktionen kunde användas med tangentbord eller pekskärm', 'om problemet hindrade användningen av sidan eller var en mindre störning'),
          paragraph(<>Tillgänglighetsrespons kan skickas per e-post till <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>. Vi svarar så snart som möjligt; det kan ta 14 dagar att få svar. SeniorSurf-verksamheten vid Vanhustyön keskusliitto ansvarar för behandlingen av responsen.</>),
        ],
      },
      {
        id: 'valvonta',
        title: 'Tillsynsförfarande',
        blocks: [
          paragraph('Om du upptäcker ett tillgänglighetsproblem i tjänsten ska du först ge respons till webbplatsens administratör. Om du inte är nöjd med svaret eller inte får något svar inom två veckor kan du lämna respons till tillsynsmyndigheten.'),
          paragraph(<>Tillsynsmyndighet är Transport- och kommunikationsverket Traficoms enhet för tillsyn över digital tillgänglighet. Anvisningar finns på <a className="underline" href="https://www.saavutettavuusvaatimukset.fi/" rel="noreferrer" target="_blank">saavutettavuusvaatimukset.fi</a>. E-postadressen är <a className="underline" href="mailto:saavutettavuus@traficom.fi">saavutettavuus@traficom.fi</a> och telefonnumret till Traficoms växel är 029 534 5000.</>),
        ],
      },
      {
        id: 'paivitys',
        title: 'Uppdatering av utlåtandet',
        blocks: [
          paragraph('Utlåtandet uppdateras alltid när ändringar som påverkar tillgängligheten görs i tjänsten eller när nya observationer framkommer vid användartestning.'),
          paragraph('Utlåtandet utarbetades utifrån en självutvärdering under utvecklingsfasen den 31 maj 2026 och uppdaterades den 25 augusti 2026. Det uppdateras i samband med nästa omfattande tillgänglighetsgranskning och väsentliga ändringar i tjänsten.'),
        ],
      },
    ],
  },
  en: {
    navigationLabel: 'Page links',
    backHome: 'Back to the start page',
    privacy: 'Privacy',
    kicker: 'For users',
    title: 'Accessibility statement',
    intro: 'The Senior Start Page is designed for older users. A clear structure, large buttons, adjustable text size and a calm view are fundamental principles of the service.',
    summaryTitle: 'In brief',
    summary: 'The Senior Start Page partially meets its accessibility objectives. The website already includes many solutions that support accessibility, but screen-reader, keyboard, contrast and user testing will be expanded before a wider release.',
    tocLabel: 'Accessibility statement table of contents',
    tocTitle: 'Contents',
    sections: [
      {
        id: 'tarkoitus',
        title: 'Purpose of the accessibility statement',
        blocks: [
          paragraph('This accessibility statement applies to the Senior Start Page. It explains how accessibility has been taken into account, what shortcomings have been identified and how users can provide feedback.'),
          paragraph('The statement was prepared on the basis of a review during the development phase. It will be updated before a wider release when keyboard, contrast and screen-reader testing has been expanded.'),
        ],
      },
      {
        id: 'tila',
        title: 'Accessibility status of the service',
        blocks: [
          paragraph('The Senior Start Page partially meets its accessibility objectives.'),
          paragraph('The website already includes many solutions that support accessibility, such as large buttons, a clear structure, adjustable text size, a link to skip to the main content and descriptive button names. However, all areas have not yet been tested comprehensively enough with a screen reader and keyboard alone.'),
        ],
      },
      {
        id: 'tavoite',
        title: 'Accessibility objective',
        blocks: [
          paragraph('The aim is to make the Senior Start Page as easy as possible to use also when vision, motor skills, memory or digital skills present challenges.'),
          list('large, clear text', 'large buttons', 'a calm visual structure', 'keyboard use', 'a structure that screen readers can understand', 'the option to use voice search if the browser supports it'),
        ],
      },
      {
        id: 'asetukset',
        title: 'User settings',
        blocks: [
          paragraph('In the page settings, users can:'),
          list('increase or decrease text size', 'switch between dark and light mode', 'hide sections they do not need', 'show or hide the weather card, clock, local news and scam alerts', 'select the time zone for the second clock'),
          paragraph('These settings are stored in the user’s own browser.'),
        ],
      },
      {
        id: 'huomioitu',
        title: 'What we have taken into account',
        blocks: [list('a clear heading structure', 'a link to skip to the main content', 'large touch targets', 'high contrast in primary functions', 'adjustable text size', 'closing the settings panel with Escape and restoring focus', 'descriptive names for links and buttons', 'an introduction tour for new users')],
      },
      {
        id: 'puutteet',
        title: 'Known shortcomings',
        blocks: [
          paragraph('The website is still in the trial and development phase. Known matters or matters requiring verification include:'),
          list('focus trapping and focus restoration must be verified in all dialogs', 'the link-list page contains a large number of links even though search, tabs and a skip link have been added', 'the texts in all language versions are not as polished as the Finnish texts', 'some external services are outside the website’s control', 'map, weather and speech features may behave differently in different browsers', 'automated accessibility auditing and manual screen-reader testing must still be expanded before a wide release'),
        ],
      },
      {
        id: 'testaus',
        title: 'How accessibility has been tested',
        blocks: [
          paragraph('A development-phase accessibility review was carried out on the website on 31 May 2026.'),
          paragraph('The review covered:'),
          list('the Senior Start Page', 'the link list', 'the link-suggestion administration page', 'the change log'),
          paragraph('The review examined, among other things, the heading structure, page language declaration, main content, names of buttons and links, names of form fields, image alt text and duplicate IDs.'),
          paragraph('The review will be expanded before release with:'),
          list('keyboard testing', 'screen-reader testing', 'manual contrast checks', 'mobile-view testing', 'user testing with digital tutors and older users'),
        ],
      },
      {
        id: 'palaute',
        title: 'Feedback and contact',
        blocks: [
          paragraph('The page is tested with digital tutors and users. Feedback should explain:'),
          list('which part was difficult to use', 'which device and browser showed the problem', 'whether the function worked with a keyboard or touch input', 'whether the problem prevented use of the page or was a smaller inconvenience'),
          paragraph(<>Accessibility feedback can be sent by email to <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>. We respond as soon as possible; receiving a response may take 14 days. The SeniorSurf programme of Vanhustyön keskusliitto is responsible for processing feedback.</>),
        ],
      },
      {
        id: 'valvonta',
        title: 'Enforcement procedure',
        blocks: [
          paragraph('If you notice an accessibility problem in the service, first provide feedback to the website administrator. If you are not satisfied with the response or do not receive a response within two weeks, you can submit feedback to the supervisory authority.'),
          paragraph(<>The supervisory authority is the Finnish Transport and Communications Agency Traficom’s Digital Accessibility Supervision Unit. Instructions are available at <a className="underline" href="https://www.saavutettavuusvaatimukset.fi/" rel="noreferrer" target="_blank">saavutettavuusvaatimukset.fi</a>. The email address is <a className="underline" href="mailto:saavutettavuus@traficom.fi">saavutettavuus@traficom.fi</a>, and Traficom’s switchboard number is +358 29 534 5000.</>),
        ],
      },
      {
        id: 'paivitys',
        title: 'Updating the statement',
        blocks: [
          paragraph('The statement is updated whenever changes affecting accessibility are made to the service or new findings emerge from user testing.'),
          paragraph('The statement was prepared on the basis of a development-phase self-assessment on 31 May 2026 and updated on 25 August 2026. It will be updated in connection with the next comprehensive accessibility review and material service changes.'),
        ],
      },
    ],
  },
};

function AccessibilitySection({ id, title, blocks }: { id: string; title: string; blocks: ContentBlock[] }) {
  return (
    <section id={id} className={sectionClass} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className={headingClass}>{title}</h2>
      {blocks.map((block, index) => block.type === 'paragraph' ? (
        <p
          key={index}
          className={index === blocks.length - 1 && id === 'paivitys'
            ? 'aurora-soft-panel mt-4 text-sm font-black leading-relaxed'
            : paragraphClass}
        >
          {block.content}
        </p>
      ) : (
        <ul key={index} className={listClass}>
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ))}
    </section>
  );
}

function App() {
  const language = usePublicPageLanguage();
  const copy = accessibilityTranslations[language];

  useEffect(() => installUsageTracking('saavutettavuus'), []);

  return (
    <main className="aurora-page">
      <div className="aurora-shell">
        <header className="aurora-subpage-hero space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex flex-wrap items-center gap-3" aria-label={copy.navigationLabel}>
              <a href="./index.html" className={pageNavLinkClass}>{copy.backHome}</a>
              <a href={getLocalizedPublicPageHref('tietosuoja', language)} className={pageNavLinkClass}>{copy.privacy}</a>
            </nav>
            <PublicPageLanguageSwitcher page="saavutettavuus" language={language} />
          </div>

          <div className="space-y-4">
            <span className="aurora-kicker">{copy.kicker}</span>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{copy.title}</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-white/75">{copy.intro}</p>
          </div>
        </header>

        <section className="aurora-soft-panel mt-10" aria-labelledby="accessibility-summary-heading">
          <h2 id="accessibility-summary-heading" className="aurora-section-title text-2xl">{copy.summaryTitle}</h2>
          <p className={paragraphClass}>{copy.summary}</p>
        </section>

        <nav className="aurora-panel mt-8 p-5" aria-label={copy.tocLabel}>
          <h2 className="text-lg font-black text-[var(--theme-text)]">{copy.tocTitle}</h2>
          <ol className="mt-4 grid gap-2 text-sm font-black text-[var(--theme-primary)] md:grid-cols-2">
            {copy.sections.map(({ id, title }) => (
              <li key={id}>
                <a className="inline-flex min-h-10 items-center rounded-full px-3 py-1.5 hover:bg-[var(--theme-pale)] hover:underline focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" href={`#${id}`}>{title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-6">
          {copy.sections.map((section) => <AccessibilitySection key={section.id} {...section} />)}
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
