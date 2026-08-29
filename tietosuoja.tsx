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

type PrivacyCopy = {
  navigationLabel: string;
  backHome: string;
  accessibility: string;
  kicker: string;
  title: string;
  intro: string;
  summaryTitle: string;
  summaryItems: string[];
  tocLabel: string;
  tocTitle: string;
  sections: Array<{ id: string; title: string; blocks: ContentBlock[] }>;
};

const paragraph = (content: React.ReactNode): ContentBlock => ({ type: 'paragraph', content });
const list = (...items: string[]): ContentBlock => ({ type: 'list', items });

const privacyTranslations: Record<PublicPageLanguage, PrivacyCopy> = {
  fi: {
    navigationLabel: 'Sivun linkit',
    backHome: 'Takaisin aloitussivulle',
    accessibility: 'Saavutettavuus',
    kicker: 'Käyttäjälle',
    title: 'Tietosuoja',
    intro: 'Seniorin aloitussivua voi käyttää ilman kirjautumista ja ilman evästeisiin perustuvaa seurantaa. Sivusto tallentaa käyttäjän omia asetuksia pääosin käyttäjän omaan selaimeen.',
    summaryTitle: 'Lyhyesti',
    summaryItems: [
      'Sivua voi käyttää ilman käyttäjätiliä.',
      'Asetukset ja suosikit säilyvät käyttäjän omassa selaimessa.',
      'Käyttötilasto on karkea eikä perustu evästeisiin tai käyttäjäprofiileihin.',
      'Linkki-ilmoituksiin tallennetaan vain käyttäjän itse antamat tiedot.',
    ],
    tocLabel: 'Tietosuojasivun sisällysluettelo',
    tocTitle: 'Sisällysluettelo',
    sections: [
      {
        id: 'mita-sivu-kertoo',
        title: 'Mitä tämä sivu kertoo',
        blocks: [paragraph('Tämä tietosuojasivu kertoo, mitä tietoja Seniorin aloitussivu käsittelee ja mihin tarkoitukseen. Sivun tarkoitus on olla selkeä myös käyttäjälle, joka ei tunne tietosuojatermejä.')],
      },
      {
        id: 'rekisterinpitaja',
        title: 'Rekisterinpitäjä',
        blocks: [
          paragraph('Seniorin aloitussivun rekisterinpitäjä on Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry (Y-tunnus 0215403–8), Malmin kauppatie 26, 00700 Helsinki.'),
          paragraph(<>Tietosuojan yhteyshenkilö on Nina Ziessler, vastaava asiantuntija. Hänet tavoittaa sähköpostilla osoitteesta <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a> ja puhelimitse numerosta 050 468 0171.</>),
        ],
      },
      {
        id: 'mita-kasitellaan',
        title: 'Mitä tietoja käsitellään',
        blocks: [
          paragraph('Sivustolla voidaan käsitellä seuraavia tietoja:'),
          list(
            'käyttäjän valitsema paikkakunta',
            'käyttäjän suosikit',
            'tekstikoko, väriteema ja näkyvien osioiden asetukset',
            'päiväkohtainen käyttötilasto sivulatauksista, linkkien klikkauksista, avaustapojen luokista ja aloitussivuohjeen vaiheista',
            'käyttäjän lähettämä palaute tai linkki-ilmoitus sekä aiemmin kerätty julkaisua edeltävä testipalaute sen poistamiseen asti',
            'palautteeseen vapaaehtoisesti liitetty kuvakaappaus ja rajatut tekniset tiedot laitetyypistä, selaimesta ja sivusta',
            'ylläpitäjän Google-kirjautumistieto, käyttöoikeus ja ylläpidon muutosten auditointitiedot',
          ),
        ],
      },
      {
        id: 'mita-ei-kerata',
        title: 'Mitä ei kerätä',
        blocks: [
          paragraph('Sivusto ei käytä:'),
          list('evästeisiin perustuvaa käyttäjäseurantaa', 'mainosseurantaa', 'käyttäjätunnisteita tavalliselle käyttäjälle', 'selaimen sormenjälkeä', 'IP-osoitteen tallennusta käyttötilastoon', 'tarkkaa sijaintihistoriaa'),
          paragraph('Sivustoa voi käyttää ilman kirjautumista.'),
        ],
      },
      {
        id: 'selaimen-asetukset',
        title: 'Selaimeen tallennettavat asetukset',
        blocks: [
          paragraph('Osa asetuksista tallennetaan käyttäjän omaan selaimeen, jotta sivu muistaa käyttäjän valinnat.'),
          list('suosikit', 'valittu paikkakunta', 'tekstikoko', 'tumma tai vaalea tila', 'näkyvät osiot', 'onko esittelykierros jo nähty', 'toisen kellon aikavyöhyke'),
          paragraph('Nämä tiedot eivät muodosta palvelimella käyttäjäprofiilia. Käyttäjä voi poistaa ne tyhjentämällä selaimen sivustotiedot.'),
        ],
      },
      {
        id: 'kayttotilasto',
        title: 'Karkea käyttötilasto',
        blocks: [
          paragraph('Sivustolla kerätään karkeaa käyttötilastoa palvelun kehittämiseksi.'),
          list('sivulatausten ja linkkiklikkausten määrä päiväkohtaisesti', 'klikattujen linkkien osoite ja näkyvä nimi ylläpidon raportointia varten', 'avaustavan luokka: suora, sisäinen, SeniorSurf, hakukone tai muu ulkoinen sivusto', 'siirtymätyyppi, historian pituusluokka, paikallinen tunti ja selaimen näyttötila', 'kampanjalähteen sallittu luokka', 'aloitussivuohjeen avaus, selainvalinta, valmiiksi kuittaus ja jakotapa'),
          paragraph('Viittaavasta sivusta tallennetaan vain luokka, ei koskaan osoitetta. Tuntemattomia luokitteluarvoja ei tallenneta.'),
          paragraph('Tilasto lähetetään saman sivuston Cloudcity-API:in ja tallennetaan päiväkohtaisina koosteina MariaDB-tietokantaan. Tilasto ei käytä evästeitä, käyttäjätunnisteita tai selaimen sormenjälkeä, eikä raakaa IP-osoitetta tallenneta käyttötilastoon. Tilastointi ei tallenna tai lue päätelaitteelta tietoa, joten sitä varten ei tarvita evästesuostumusta. API käsittelee pyynnön teknistä verkko-osoitetta väärinkäytön estämiseksi ja muodostaa siitä palvelinsalaisuudella suojatun, lyhytikäiseen pyyntörajoitukseen käytettävän tunnisteen.'),
        ],
      },
      {
        id: 'palautteet',
        title: 'Palautteet ja linkki-ilmoitukset',
        blocks: [
          paragraph('Käyttäjä voi lähettää yleistä palautetta tai ilmoittaa uuden, rikkinäisen tai väärään paikkaan vievän linkin. Julkaisua edeltävä testikysely on poistettu käytöstä; aiemmin annetut vastaukset säilyvät vain alla mainitun poistoajan loppuun.'),
          list('palautteen tyyppi, otsikko, kuvaus ja sivu, jota palaute koskee', 'aiemmin testipalautelomakkeessa annetut vastaukset', 'linkin nimi', 'osoite', 'kategoria tai lähde, jos se on mukana', 'käyttäjän kirjoittama lisähuomio', 'ilmoituksen ajankohta', 'ilmoituksen käsittelytila', 'vapaaehtoinen kuvakaappaus'),
          paragraph('Tietoja käytetään vain Seniorin aloitussivun ylläpitoon, virheiden korjaamiseen, testaamiseen ja kehittämiseen. Lomakkeisiin tai kuvakaappauksiin ei pidä kirjoittaa henkilötietoja, terveystietoja, salasanoja tai muuta arkaluonteista tietoa. Kuvakaappaukset säilytetään suojattuina julkisen verkkohakemiston ulkopuolella.'),
        ],
      },
      {
        id: 'paikalliset-palvelut',
        title: 'Paikalliset palvelut ja sää',
        blocks: [
          paragraph('Paikallisia palveluja voidaan näyttää käyttäjän valitseman tai käyttäjän luvalla selaimen paikantaman paikkakunnan perusteella. Paikkakunnan voi vaihtaa käsin. Tarkkaa sijaintia ei tallenneta Seniorin aloitussivun palvelimelle.'),
          paragraph('Sääkortti käyttää säätietoa tarjoavaa ulkopuolista rajapintaa. Sää haetaan paikkakunnan koordinaattien perusteella. Tarkkaa käyttäjäprofiilia ei tallenneta.'),
        ],
      },
      {
        id: 'palveluntarjoajat',
        title: 'Tekniset palveluntarjoajat',
        blocks: [
          paragraph('Seniorin aloitussivun verkkopalvelu, PHP-API, suojatut liitteet ja MariaDB-tietokanta sijaitsevat Cloudcityn palvelinympäristössä. Ylläpitäjien Google-kirjautuminen varmennetaan väliaikaisesti Firebase Authentication -palvelulla. Firebase ei ole Seniorin aloitussivun varsinaisen sisällön tai palautteiden ensisijainen tietovarasto.'),
          paragraph('Sää-, paikannus- ja osoitehakutoiminnot voivat tehdä pyynnön ulkopuoliseen sää- tai paikkatietopalveluun vain toimintoa käytettäessä. Ulkoisen linkin tai Google-haun avaamisen jälkeen käyttäjä siirtyy kyseisen palveluntarjoajan palveluun ja sen tietosuojakäytännöt koskevat käyttöä.'),
        ],
      },
      {
        id: 'yllapitajan-kirjautuminen',
        title: 'Ylläpitäjän kirjautuminen',
        blocks: [paragraph('Ylläpitonäkymä on rajattu ennalta hyväksytyille ylläpitäjille. Ylläpitäjä kirjautuu Google-tunnuksella Firebase Authentication -palvelun kautta. Cloudcity-API tarkistaa kirjautumistunnisteen ja hyväksyy vain aktiivisen ylläpitoroolin. Tavallinen käyttäjä ei tarvitse kirjautumista.')],
      },
      {
        id: 'sailytys-ja-poistaminen',
        title: 'Tietojen säilytys ja poistaminen',
        blocks: [
          paragraph('Selaimeen tallennetut asetukset säilyvät käyttäjän omalla laitteella, kunnes käyttäjä poistaa sivuston tiedot tai vaihtaa selainta.'),
          paragraph('Palautteet ja linkki-ilmoitukset poistetaan viimeistään 12 kuukauden kuluttua vastaanottamisesta. Palautteiden kuvakaappaukset poistetaan heti, kun niitä ei enää tarvita, ja viimeistään 90 päivän kuluttua vastaanottamisesta.'),
          paragraph('Julkaisua edeltävä testipalaute poistetaan viimeistään kuuden kuukauden kuluttua testatun version julkaisemisesta. Jos versiota ei julkaista, määräaika lasketaan testauksen päättymisestä. Tunnisteettomat päiväkohtaiset käyttötilastokoosteet poistetaan viimeistään 24 kuukauden kuluttua.'),
          paragraph('Tiedot voidaan poistaa aikaisemmin, jos niitä ei enää tarvita. Ylläpitäjän tunniste- ja käyttöoikeustietoja säilytetään vain ylläpitotehtävän edellyttämän ajan.'),
        ],
      },
      {
        id: 'oikeudet',
        title: 'Käyttäjän oikeudet',
        blocks: [
          paragraph('Jos käyttäjän lähettämässä palautteessa tai kuvakaappauksessa on häntä koskevia henkilötietoja, hän voi pyytää tietojen tarkastamista, oikaisemista tai poistamista sekä käsittelyn rajoittamista soveltuvan tietosuojalainsäädännön mukaisesti. Pyynnössä pitää antaa riittävät tiedot oikean palautteen tunnistamiseksi ilman, että viestiin lisätään tarpeettomia henkilötietoja.'),
          paragraph('Käyttäjällä on myös oikeus tehdä valitus Tietosuojavaltuutetun toimistolle, jos hän katsoo, että henkilötietoja on käsitelty lainvastaisesti.'),
        ],
      },
      {
        id: 'yhteydenotto',
        title: 'Yhteydenotto',
        blocks: [
          paragraph(<>Tietosuojaan liittyvät kysymykset ja pyynnöt voi lähettää Nina Ziesslerille osoitteeseen <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>. Yleiset SeniorSurf-yhteydenotot voi lähettää osoitteeseen <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>.</>),
          paragraph('Päivitetty 29.8.2026. Selostetta päivitetään, kun palvelun tietovirrat, säilytysajat tai yhteystiedot muuttuvat.'),
        ],
      },
    ],
  },
  sv: {
    navigationLabel: 'Sidans länkar',
    backHome: 'Tillbaka till startsidan',
    accessibility: 'Tillgänglighet',
    kicker: 'För användaren',
    title: 'Dataskydd',
    intro: 'Seniorens startsida kan användas utan inloggning och utan spårning som bygger på kakor. Webbplatsen sparar huvudsakligen användarens egna inställningar i användarens webbläsare.',
    summaryTitle: 'I korthet',
    summaryItems: [
      'Sidan kan användas utan användarkonto.',
      'Inställningar och favoriter sparas i användarens egen webbläsare.',
      'Användningsstatistiken är översiktlig och bygger inte på kakor eller användarprofiler.',
      'I länkmeddelanden sparas endast de uppgifter som användaren själv lämnar.',
    ],
    tocLabel: 'Innehållsförteckning för dataskyddssidan',
    tocTitle: 'Innehåll',
    sections: [
      {
        id: 'mita-sivu-kertoo',
        title: 'Vad den här sidan berättar',
        blocks: [paragraph('På den här dataskyddssidan beskrivs vilka uppgifter Seniorens startsida behandlar och för vilka ändamål. Sidan ska vara tydlig också för användare som inte känner till dataskyddstermer.')],
      },
      {
        id: 'rekisterinpitaja',
        title: 'Personuppgiftsansvarig',
        blocks: [
          paragraph('Personuppgiftsansvarig för Seniorens startsida är Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry (FO-nummer 0215403–8), Malmin kauppatie 26, 00700 Helsingfors.'),
          paragraph(<>Kontaktperson för dataskydd är Nina Ziessler, ansvarig sakkunnig. Hon nås per e-post på <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a> och per telefon på 050 468 0171.</>),
        ],
      },
      {
        id: 'mita-kasitellaan',
        title: 'Vilka uppgifter behandlas',
        blocks: [
          paragraph('Följande uppgifter kan behandlas på webbplatsen:'),
          list('den ort som användaren har valt', 'användarens favoriter', 'inställningar för textstorlek, färgtema och synliga avsnitt', 'dagsvis användningsstatistik över sidladdningar, länkklick, ingångskategorier och steg i startsidesguiden', 'respons eller länkmeddelanden som användaren skickar samt tidigare insamlad testrespons tills den raderas', 'en skärmbild som frivilligt bifogas responsen samt begränsade tekniska uppgifter om enhetstyp, webbläsare och sida', 'administratörens Google-inloggningsuppgifter, behörighet och granskningsuppgifter om ändringar i administrationen'),
        ],
      },
      {
        id: 'mita-ei-kerata',
        title: 'Vad samlas inte in',
        blocks: [
          paragraph('Webbplatsen använder inte:'),
          list('kakbaserad användarspårning', 'reklamspårning', 'användaridentifierare för vanliga användare', 'fingeravtryck av webbläsaren', 'lagring av IP-adresser i användningsstatistiken', 'exakt positionshistorik'),
          paragraph('Webbplatsen kan användas utan inloggning.'),
        ],
      },
      {
        id: 'selaimen-asetukset',
        title: 'Inställningar som sparas i webbläsaren',
        blocks: [
          paragraph('Vissa inställningar sparas i användarens egen webbläsare så att sidan kommer ihåg användarens val.'),
          list('favoriter', 'vald ort', 'textstorlek', 'mörkt eller ljust läge', 'synliga avsnitt', 'om introduktionsrundan redan har visats', 'tidszonen för den andra klockan'),
          paragraph('Dessa uppgifter bildar ingen användarprofil på servern. Användaren kan radera dem genom att rensa webbplatsdata i webbläsaren.'),
        ],
      },
      {
        id: 'kayttotilasto',
        title: 'Översiktlig användningsstatistik',
        blocks: [
          paragraph('Webbplatsen samlar in översiktlig användningsstatistik för att utveckla tjänsten.'),
          list('antal sidladdningar och länkklick per dag', 'den klickade länkens adress och synliga namn för administrationens rapportering', 'ingångskategori: direkt, intern, SeniorSurf, sökmotor eller annan extern webbplats', 'navigeringstyp, historiklängdskategori, lokal timme och visningsläge', 'en tillåten kampanjkategori', 'öppning, webbläsarval, färdigmarkering och delningssätt i startsidesguiden'),
          paragraph('För den hänvisande sidan sparas endast en kategori, aldrig adressen. Okända kategorivärden sparas inte.'),
          paragraph('Statistiken skickas till Cloudcity-API:et på samma webbplats och sparas som dagsvisa sammanställningar i en MariaDB-databas. Statistiken använder inte kakor, användaridentifierare eller fingeravtryck av webbläsaren, och den råa IP-adressen sparas inte i användningsstatistiken. Statistiken lagrar eller läser inget på enheten och kräver därför inget samtycke till statistikkakor. API:et behandlar förfrågans tekniska nätverksadress för att förebygga missbruk och skapar med hjälp av en serverhemlighet en skyddad identifierare som används för kortvarig begränsning av antalet förfrågningar.'),
        ],
      },
      {
        id: 'palautteet',
        title: 'Respons och länkmeddelanden',
        blocks: [
          paragraph('Användaren kan skicka allmän respons eller meddela om en ny eller trasig länk eller en länk som leder fel. Testenkäten före publicering är inte längre i bruk; tidigare svar bevaras endast tills lagringstiden nedan löper ut.'),
          list('responsens typ, rubrik, beskrivning och den sida som responsen gäller', 'tidigare svar i formuläret för testrespons', 'länkens namn', 'adress', 'kategori eller källa, om den ingår', 'användarens tilläggskommentar', 'tidpunkten för meddelandet', 'meddelandets behandlingsstatus', 'frivillig skärmbild'),
          paragraph('Uppgifterna används endast för underhåll, felkorrigering, testning och utveckling av Seniorens startsida. Personuppgifter, hälsouppgifter, lösenord eller andra känsliga uppgifter ska inte skrivas i formulär eller visas på skärmbilder. Skärmbilderna förvaras skyddade utanför den offentliga webbkatalogen.'),
        ],
      },
      {
        id: 'paikalliset-palvelut',
        title: 'Lokala tjänster och väder',
        blocks: [
          paragraph('Lokala tjänster kan visas utifrån den ort som användaren har valt eller som webbläsaren har lokaliserat med användarens tillstånd. Orten kan ändras manuellt. Den exakta positionen sparas inte på servern för Seniorens startsida.'),
          paragraph('Väderkortet använder ett externt gränssnitt som tillhandahåller väderuppgifter. Vädret hämtas utifrån ortens koordinater. Ingen exakt användarprofil sparas.'),
        ],
      },
      {
        id: 'palveluntarjoajat',
        title: 'Tekniska tjänsteleverantörer',
        blocks: [
          paragraph('Webbtjänsten Seniorens startsida, PHP-API:et, skyddade bilagor och MariaDB-databasen finns i Cloudcitys servermiljö. Administratörernas Google-inloggning verifieras tillfälligt med Firebase Authentication. Firebase är inte det primära datalagret för innehållet eller responsen i Seniorens startsida.'),
          paragraph('Väder-, positionerings- och adressökning kan göra en förfrågan till en extern väder- eller geodatatjänst endast när funktionen används. När användaren öppnar en extern länk eller en Google-sökning övergår hen till tjänsteleverantörens tjänst, vars dataskyddspraxis då gäller.'),
        ],
      },
      {
        id: 'yllapitajan-kirjautuminen',
        title: 'Administratörens inloggning',
        blocks: [paragraph('Administrationsvyn är begränsad till på förhand godkända administratörer. Administratören loggar in med ett Google-konto via Firebase Authentication. Cloudcity-API:et kontrollerar inloggningsidentifieraren och godkänner endast en aktiv administratörsroll. Vanliga användare behöver inte logga in.')],
      },
      {
        id: 'sailytys-ja-poistaminen',
        title: 'Lagring och radering av uppgifter',
        blocks: [
          paragraph('Inställningar som sparats i webbläsaren finns kvar på användarens egen enhet tills användaren raderar webbplatsens data eller byter webbläsare.'),
          paragraph('Respons och länkmeddelanden raderas senast 12 månader efter mottagandet. Skärmbilder som bifogats respons raderas så snart de inte längre behövs och senast 90 dagar efter mottagandet.'),
          paragraph('Testrespons före publicering raderas senast sex månader efter att den testade versionen har publicerats. Om versionen inte publiceras räknas tidsfristen från det att testningen avslutades. Dagsvisa sammanställningar av användningsstatistik utan identifierare raderas senast efter 24 månader.'),
          paragraph('Uppgifterna kan raderas tidigare om de inte längre behövs. Administratörens identifierings- och behörighetsuppgifter lagras endast så länge administrationsuppgiften kräver det.'),
        ],
      },
      {
        id: 'oikeudet',
        title: 'Användarens rättigheter',
        blocks: [
          paragraph('Om den respons eller skärmbild som användaren skickat innehåller personuppgifter om användaren kan hen i enlighet med tillämplig dataskyddslagstiftning begära att uppgifterna granskas, rättas eller raderas samt att behandlingen begränsas. Begäran ska innehålla tillräckliga uppgifter för att rätt respons ska kunna identifieras utan att onödiga personuppgifter läggs till i meddelandet.'),
          paragraph('Användaren har också rätt att lämna in ett klagomål till Dataombudsmannens byrå om hen anser att personuppgifter har behandlats i strid med lagen.'),
        ],
      },
      {
        id: 'yhteydenotto',
        title: 'Kontakt',
        blocks: [
          paragraph(<>Frågor och begäranden som gäller dataskydd kan skickas till Nina Ziessler på <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>. Allmänna SeniorSurf-kontakter kan skickas till <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>.</>),
          paragraph('Uppdaterad 29.8.2026. Beskrivningen uppdateras när tjänstens dataflöden, lagringstider eller kontaktuppgifter ändras.'),
        ],
      },
    ],
  },
  en: {
    navigationLabel: 'Page links',
    backHome: 'Back to the start page',
    accessibility: 'Accessibility',
    kicker: 'For users',
    title: 'Privacy',
    intro: 'The Senior Start Page can be used without signing in and without cookie-based tracking. The website stores the user’s own settings mainly in the user’s browser.',
    summaryTitle: 'In brief',
    summaryItems: [
      'The page can be used without a user account.',
      'Settings and favourites remain in the user’s own browser.',
      'Usage statistics are aggregated and are not based on cookies or user profiles.',
      'Only information supplied by the user is stored in link reports.',
    ],
    tocLabel: 'Privacy page table of contents',
    tocTitle: 'Contents',
    sections: [
      {
        id: 'mita-sivu-kertoo',
        title: 'What this page explains',
        blocks: [paragraph('This privacy page explains what information the Senior Start Page processes and for what purposes. It is intended to be clear also to users who are unfamiliar with data protection terminology.')],
      },
      {
        id: 'rekisterinpitaja',
        title: 'Data controller',
        blocks: [
          paragraph('The data controller for the Senior Start Page is Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry (Business ID 0215403–8), Malmin kauppatie 26, FI-00700 Helsinki, Finland.'),
          paragraph(<>The data protection contact person is Nina Ziessler, Senior Specialist. She can be reached by email at <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a> and by telephone at +358 50 468 0171.</>),
        ],
      },
      {
        id: 'mita-kasitellaan',
        title: 'What information is processed',
        blocks: [
          paragraph('The website may process the following information:'),
          list('the municipality selected by the user', 'the user’s favourites', 'settings for text size, colour theme and visible sections', 'daily usage aggregates for page loads, link clicks, entry categories and start-page guide steps', 'feedback or a link report submitted by the user and previously collected pre-release test feedback until its deletion', 'a screenshot voluntarily attached to feedback and limited technical information about the device type, browser and page', 'the administrator’s Google sign-in information, access rights and audit information about administrative changes'),
        ],
      },
      {
        id: 'mita-ei-kerata',
        title: 'What is not collected',
        blocks: [
          paragraph('The website does not use:'),
          list('cookie-based user tracking', 'advertising tracking', 'user identifiers for ordinary users', 'browser fingerprinting', 'storage of IP addresses in usage statistics', 'precise location history'),
          paragraph('The website can be used without signing in.'),
        ],
      },
      {
        id: 'selaimen-asetukset',
        title: 'Settings stored in the browser',
        blocks: [
          paragraph('Some settings are stored in the user’s own browser so that the page remembers the user’s choices.'),
          list('favourites', 'selected municipality', 'text size', 'dark or light mode', 'visible sections', 'whether the introduction tour has already been viewed', 'the time zone of the second clock'),
          paragraph('This information does not form a user profile on the server. The user can remove it by clearing the website data in the browser.'),
        ],
      },
      {
        id: 'kayttotilasto',
        title: 'Aggregated usage statistics',
        blocks: [
          paragraph('The website collects aggregated usage statistics to develop the service.'),
          list('the number of page loads and link clicks per day', 'the address and visible name of clicked links for administrative reporting', 'entry category: direct, internal, SeniorSurf, search engine or another external website', 'navigation type, history-length category, local hour and display mode', 'an allowed campaign-source category', 'opening, browser selection, completion and sharing method in the start-page guide'),
          paragraph('Only a category is stored for the referring page, never its address. Unknown category values are not stored.'),
          paragraph('The statistics are sent to the Cloudcity API on the same website and stored as daily aggregates in a MariaDB database. The statistics do not use cookies, user identifiers or browser fingerprinting, and the raw IP address is not stored in usage statistics. Statistics neither store nor read information on the device and therefore do not require consent for statistics cookies. The API processes the request’s technical network address to prevent misuse and uses a server secret to create a protected identifier for short-term request rate limiting.'),
        ],
      },
      {
        id: 'palautteet',
        title: 'Feedback and link reports',
        blocks: [
          paragraph('The user can send general feedback or report a new or broken link or a link that points to the wrong destination. The pre-release test survey is no longer active; earlier responses are retained only until the retention period below expires.'),
          list('the feedback type, title, description and the page concerned', 'earlier answers submitted on the test feedback form', 'link name', 'address', 'category or source, if included', 'an additional note written by the user', 'time of the report', 'processing status of the report', 'optional screenshot'),
          paragraph('The information is used only to maintain, correct errors in, test and develop the Senior Start Page. Forms and screenshots must not contain personal data, health information, passwords or other sensitive information. Screenshots are stored securely outside the public web directory.'),
        ],
      },
      {
        id: 'paikalliset-palvelut',
        title: 'Local services and weather',
        blocks: [
          paragraph('Local services may be shown based on the municipality selected by the user or located by the browser with the user’s permission. The municipality can be changed manually. The precise location is not stored on the Senior Start Page server.'),
          paragraph('The weather card uses an external interface that provides weather information. Weather data is retrieved using the municipality’s coordinates. No precise user profile is stored.'),
        ],
      },
      {
        id: 'palveluntarjoajat',
        title: 'Technical service providers',
        blocks: [
          paragraph('The Senior Start Page web service, PHP API, protected attachments and MariaDB database are located in Cloudcity’s server environment. Administrators’ Google sign-ins are temporarily verified using Firebase Authentication. Firebase is not the primary data store for the Senior Start Page content or feedback.'),
          paragraph('Weather, location and address search functions may send a request to an external weather or geospatial service only when the function is used. After opening an external link or Google search, the user enters that service provider’s service, and its privacy practices apply.'),
        ],
      },
      {
        id: 'yllapitajan-kirjautuminen',
        title: 'Administrator sign-in',
        blocks: [paragraph('The administration view is restricted to pre-approved administrators. An administrator signs in with a Google account through Firebase Authentication. The Cloudcity API verifies the sign-in token and accepts only an active administrator role. Ordinary users do not need to sign in.')],
      },
      {
        id: 'sailytys-ja-poistaminen',
        title: 'Data retention and deletion',
        blocks: [
          paragraph('Settings stored in the browser remain on the user’s own device until the user removes the website data or changes browser.'),
          paragraph('Feedback and link reports are deleted no later than 12 months after receipt. Screenshots attached to feedback are deleted as soon as they are no longer needed and no later than 90 days after receipt.'),
          paragraph('Pre-release test feedback is deleted no later than six months after the tested version is released. If the version is not released, the period is calculated from the end of testing. Daily usage-statistics aggregates without identifiers are deleted no later than after 24 months.'),
          paragraph('Information may be deleted earlier if it is no longer needed. Administrator identity and access-right information is retained only for as long as required by the administrative role.'),
        ],
      },
      {
        id: 'oikeudet',
        title: 'User rights',
        blocks: [
          paragraph('If feedback or a screenshot submitted by a user contains personal data concerning that user, the user may request access to, rectification or deletion of the data and restriction of processing in accordance with applicable data protection legislation. The request must include enough information to identify the correct feedback without adding unnecessary personal data to the message.'),
          paragraph('The user also has the right to lodge a complaint with the Office of the Data Protection Ombudsman if they believe that personal data has been processed unlawfully.'),
        ],
      },
      {
        id: 'yhteydenotto',
        title: 'Contact',
        blocks: [
          paragraph(<>Questions and requests concerning data protection can be sent to Nina Ziessler at <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>. General SeniorSurf enquiries can be sent to <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>.</>),
          paragraph('Updated 29 August 2026. This notice is updated when the service’s data flows, retention periods or contact details change.'),
        ],
      },
    ],
  },
};

function PrivacySection({ id, title, blocks }: { id: string; title: string; blocks: ContentBlock[] }) {
  return (
    <section id={id} className={sectionClass} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className={headingClass}>{title}</h2>
      {blocks.map((block, index) => block.type === 'paragraph' ? (
        <p
          key={index}
          className={index === blocks.length - 1 && id === 'yhteydenotto'
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
  const copy = privacyTranslations[language];

  useEffect(() => installUsageTracking('tietosuoja'), []);

  return (
    <main className="aurora-page">
      <div className="aurora-shell">
        <header className="aurora-subpage-hero space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex flex-wrap items-center gap-3" aria-label={copy.navigationLabel}>
              <a href="./index.html" className={pageNavLinkClass}>{copy.backHome}</a>
              <a href={getLocalizedPublicPageHref('saavutettavuus', language)} className={pageNavLinkClass}>{copy.accessibility}</a>
            </nav>
            <PublicPageLanguageSwitcher page="tietosuoja" language={language} />
          </div>

          <div className="space-y-4">
            <span className="aurora-kicker">{copy.kicker}</span>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{copy.title}</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-white/75">{copy.intro}</p>
          </div>
        </header>

        <section className="aurora-soft-panel mt-10" aria-labelledby="privacy-summary-heading">
          <h2 id="privacy-summary-heading" className="aurora-section-title text-2xl">{copy.summaryTitle}</h2>
          <ul className="mt-4 grid gap-3 text-base font-bold leading-relaxed text-[var(--theme-text-2)] md:grid-cols-2">
            {copy.summaryItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
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
          {copy.sections.map((section) => <PrivacySection key={section.id} {...section} />)}
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
