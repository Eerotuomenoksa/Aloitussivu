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
import ManagedMarkdown from './components/ManagedMarkdown';
import { getSiteContentValue, useSiteContentVersion } from './siteContent';

const pageNavLinkClass = 'aurora-nav-link px-4 py-2 text-sm';
const sectionClass = 'aurora-panel';
const headingClass = 'aurora-section-title text-2xl';
const paragraphClass = 'mt-4 text-base font-bold leading-relaxed text-[var(--theme-text-2)]';
const listClass = 'mt-4 list-disc space-y-2 pl-6 text-base font-bold leading-relaxed text-[var(--theme-text-2)] marker:font-black marker:text-[var(--theme-primary)]';

type ContentBlock =
  | { type: 'paragraph'; content: React.ReactNode }
  | { type: 'list'; items: string[] };

type PrivacyCopy = {
  navigationLabel: string;
  backHome: string;
  accessibility: string;
  seniorSurfPrivacy: string;
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
    seniorSurfPrivacy: 'SeniorSurfin tietosuojaseloste',
    kicker: 'Sinulle',
    title: 'Tietosuoja',
    intro: 'Seniorin aloitussivua voit käyttää ilman tunnusta ja salasanaa. Sivu ei seuraa sinua. Sivu ei tee sinusta profiilia. Omat valintasi tallentuvat pääosin vain omaan selaimeesi.',
    summaryTitle: 'Lyhyesti',
    summaryItems: [
      'Et tarvitse tunnusta etkä salasanaa.',
      'Valintasi ja suosikkisi säilyvät omassa selaimessasi.',
      'Emme seuraa sinua emmekä kerää sinusta profiilia.',
      'Laskemme vain, montako kertaa sivua ja linkkejä käytetään.',
      'Emme myy tietoja. Emme anna niitä mainostajille.',
      'Sää ja paikallisuutiset haetaan muista palveluista. Ne näkevät, mistä päin nettiä pyyntö tulee.',
    ],
    tocLabel: 'Tietosuojasivun sisällysluettelo',
    tocTitle: 'Sisällysluettelo',
    sections: [
      {
        id: 'mita-sivu-kertoo',
        title: 'Mitä tällä sivulla kerrotaan',
        blocks: [
          paragraph('Tämä sivu kertoo, mitä tietoja Seniorin aloitussivu käsittelee. Se kertoo myös, mihin tietoja käytetään ja kuinka kauan ne säilyvät.'),
          paragraph('Kirjoitimme tekstin tavallisella kielellä. Vaikeat sanat selitetään heti siinä kohdassa, jossa ne esiintyvät. Sivun lopussa on lisäksi lyhyt sanasto.'),
          paragraph('Jos jokin jää epäselväksi, voit kysyä meiltä. Yhteystiedot ovat sivun lopussa.'),
        ],
      },
      {
        id: 'rekisterinpitaja',
        title: 'Kuka vastaa tiedoistasi',
        blocks: [
          paragraph('Sivustosta vastaa Vanhustyön keskusliitto ry.'),
          paragraph('Viralliset tiedot: Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry, Y-tunnus 0215403–8, Malmin kauppatie 26, 00700 Helsinki.'),
          paragraph('Laissa tällaista vastuullista tahoa sanotaan rekisterinpitäjäksi. Se tarkoittaa kahta asiaa. Me päätämme, mitä tietoja kerätään ja miksi. Me myös vastaamme siitä, että tiedot ovat turvassa.'),
          paragraph(<>Tietosuoja-asioista vastaa Nina Ziessler. Voit lähettää hänelle sähköpostia osoitteeseen <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>. Voit myös soittaa numeroon 050 468 0171.</>),
        ],
      },
      {
        id: 'mita-kasitellaan',
        title: 'Mitä tietoja sivu käsittelee',
        blocks: [
          paragraph('Sivu voi käsitellä näitä tietoja:'),
          list(
            'paikkakunta, jonka olet valinnut',
            'linkit, jotka olet merkinnyt suosikeiksi',
            'tekstin koko, värit ja se, mitkä osiot näkyvät',
            'lukumäärät: montako kertaa sivu on avattu ja montako linkkiä napsautettu',
            'palaute tai ilmoitus linkistä, jonka olet itse lähettänyt',
            'kuva näytöstä, jos liitit sellaisen palautteeseen',
            'tieto siitä, millaisella laitteella ja selaimella palaute lähetettiin',
            'vanhat testivastaukset, kunnes ne poistetaan',
            'ylläpitäjän kirjautumistieto ja tieto siitä, mitä ylläpitäjä on muuttanut',
          ),
          paragraph('Sivu ei kysy nimeäsi eikä osoitettasi. Nimesi tulee tietoomme vain, jos kirjoitat sen itse palautteeseen.'),
        ],
      },
      {
        id: 'mita-ei-kerata',
        title: 'Mitä sivu ei kerää',
        blocks: [
          paragraph('Sivu ei tee mitään näistä:'),
          list(
            'ei seuraa sinua evästeiden avulla',
            'ei seuraa sinua mainoksia varten',
            'ei anna sinulle salaista tunnistenumeroa',
            'ei tunnista selaintasi niin sanotun sormenjäljen avulla',
            'ei tallenna IP-osoitettasi käyttölukuihin',
            'ei tallenna, missä olet liikkunut',
          ),
          paragraph('Eväste on pieni tiedosto. Sivusto voi tallentaa sen selaimeesi. Moni sivusto seuraa evästeillä, missä käyt netissä. Tämä sivu ei tee niin.'),
          paragraph('Sivun käyttö ei vaadi kirjautumista.'),
        ],
      },
      {
        id: 'selaimen-asetukset',
        title: 'Mitä selaimeesi tallennetaan',
        blocks: [
          paragraph('Selain on ohjelma, jolla katselet nettisivuja. Tavallisia selaimia ovat Chrome, Edge, Safari ja Firefox.'),
          paragraph('Osa valinnoistasi tallentuu vain omaan selaimeesi. Näin sivu muistaa ne, kun tulet uudelleen.'),
          list(
            'suosikkisi',
            'valitsemasi paikkakunta',
            'tekstin koko',
            'tumma tai vaalea väri',
            'ne osiot, jotka haluat näkyviin',
            'tieto siitä, oletko jo katsonut sivun esittelyn',
            'toisen kellon maa tai kaupunki, jos olet ottanut toisen kellon käyttöön',
          ),
          paragraph('Nämä tiedot eivät lähde mihinkään. Ne pysyvät omassa laitteessasi. Meille ei synny niistä profiilia.'),
          paragraph('Voit poistaa tiedot itse. Tyhjennä selaimen sivustotiedot, niin ne häviävät.'),
        ],
      },
      {
        id: 'kolmannen-osapuolen-palvelut',
        title: 'Mitä muita palveluja sivu käyttää',
        blocks: [
          paragraph('Sää ja paikallisuutiset haetaan muista palveluista. Ne ovat muiden yritysten ja yhteisöjen ylläpitämiä.'),
          list(
            'Open-Meteo antaa säätiedot. Se saa tietää paikkakuntasi sijainnin kartalla.',
            'OpenStreetMapin Nominatim kertoo, mikä kunta sijainnin kohdalla on. Sitä käytetään vain, jos annat luvan paikannukseen.',
            'Nominatimia ei käytetä lainkaan, jos olet valinnut kotikuntasi itse.',
            'rss2json ja allorigins voivat välittää paikallisuutiset. Niitä käytetään vain, jos uutiset eivät tule perille suoraan.',
          ),
          paragraph('Kun selaimesi ottaa yhteyttä näihin palveluihin, ne näkevät IP-osoitteesi.'),
          paragraph('IP-osoite on numerosarja. Sen avulla tieto löytää oikeaan laitteeseen. Se kertoo suunnilleen, miltä seudulta ollaan liikkeellä. Se ei kerro nimeäsi.'),
          paragraph('Seniorin aloitussivu ei tallenna näitä sijainteja omiin tietoihinsa. Se ei tallenna myöskään IP-osoitetta.'),
        ],
      },
      {
        id: 'kayttotilasto',
        title: 'Miten sivun käyttöä lasketaan',
        blocks: [
          paragraph('Laskemme, miten sivua käytetään. Näin tiedämme, mikä toimii ja mitä pitää parantaa.'),
          paragraph('Laskemme päivittäin:'),
          list(
            'montako kertaa sivu on avattu ja montako linkkiä napsautettu',
            'millä sivuston osiolla ja missä linkkikategoriassa klikkaus tapahtui',
            'mistä sivulle tultiin: suoraan, sivuston sisältä, SeniorSurfista, hakukoneesta vai muualta netistä',
            'tultiinko uutena käyntinä vai takaisin-painikkeella',
            'onko selain tavallisessa vai asennetun sovelluksen tilassa',
            'avasitko aloitussivuohjeen ja miten käytit sitä',
          ),
          paragraph('Emme tallenna yksittäisen linkin osoitetta tai kellonaikaa. Tallennamme vain osion ja kategorian sekä tulon lähteen luokan, esimerkiksi hakukone.'),
          paragraph('Nämä luvut eivät kerro, kuka sinä olet. Ne kertovat vain lukumääriä. Ylläpitäjä näkee esimerkiksi, että tietyn osion linkkikategoriaa napsautettiin 40 kertaa. Hän ei näe, kuka napsautti.'),
          paragraph('Luvut lähetetään saman sivuston omalle palvelimelle. Ne tallennetaan päivittäisinä yhteenvetoina.'),
          paragraph('Laskenta ei käytä evästeitä. Se ei tallenna eikä lue mitään laitteeltasi. Siksi sivun ei tarvitse kysyä sinulta lupaa evästeisiin.'),
          paragraph('Palvelin näkee pyynnön mukana tulevan IP-osoitteen. Se muuttaa osoitteen heti merkkijonoksi, josta ei voi palata takaisin osoitteeseen. Merkkijonolla estetään ylimääräiset pyynnöt lyhyen ajan sisällä. Alkuperäistä IP-osoitetta ei tallenneta.'),
        ],
      },
      {
        id: 'palautteet',
        title: 'Palaute ja ilmoitus linkistä',
        blocks: [
          paragraph('Voit lähettää meille palautetta. Voit myös ilmoittaa linkistä, joka on rikki tai vie väärään paikkaan. Voit ehdottaa uutta linkkiä.'),
          paragraph('Kun lähetät palautteen, tallennamme:'),
          list(
            'palautteen tyypin, otsikon ja kuvauksen',
            'sivun, jota palaute koskee',
            'linkin nimen ja osoitteen',
            'linkin aiheryhmän tai lähteen, jos se on mukana',
            'oman lisähuomiosi',
            'ajankohdan, jolloin lähetit ilmoituksen',
            'tiedon siitä, onko ilmoitus jo käsitelty',
            'kuvan näytöstä, jos liitit sellaisen',
          ),
          paragraph('Käytämme tietoja vain sivun ylläpitoon, korjaamiseen, testaamiseen ja kehittämiseen.'),
          paragraph('Älä kirjoita lomakkeeseen henkilötietoja. Älä kirjoita terveystietoja äläkä salasanoja. Katso myös, ettei kuvassa näy tällaisia tietoja.'),
          paragraph('Palautteen teksti, käsittelyn tila ja ylläpidon julkinen vastaus näkyvät kaikille palautteiden käsittelysivulla. Linkki-ilmoituksesta näkyvät linkin perustiedot, tila ja julkinen käsittelyperuste. Laitteen ja selaimen tekniset tiedot sekä palautteeseen liitetty kuva näkyvät vain nimetyille ylläpitäjille.'),
          paragraph('Sivulla oli aiemmin testikysely. Se on nyt poistettu käytöstä. Vanhat vastaukset poistetaan kohdassa "Kuinka kauan tiedot säilyvät" kerrotussa ajassa.'),
        ],
      },
      {
        id: 'paikalliset-palvelut',
        title: 'Paikkakunta ja sää',
        blocks: [
          paragraph('Voit valita paikkakuntasi itse. Voit myös antaa selaimen etsiä sen. Selain kysyy siihen aina luvan.'),
          paragraph('Voit vaihtaa paikkakuntaa milloin tahansa. Tarkkaa sijaintiasi ei tallenneta meidän palvelimellemme.'),
          paragraph('Sääkortti hakee sään toisesta palvelusta. Haku tehdään paikkakunnan sijainnin perusteella. Sinusta ei tehdä profiilia.'),
        ],
      },
      {
        id: 'palveluntarjoajat',
        title: 'Missä tiedot säilytetään',
        blocks: [
          paragraph('Palvelin on tietokone, joka säilyttää sivuston tiedot. Se myös lähettää sivun sinun selaimeesi.'),
          paragraph('Seniorin aloitussivun palvelin on Cloudcityn konesalissa. Siellä ovat myös palautteet, palautteiden kuvat ja käyttöluvut.'),
          paragraph('Ylläpitäjien kirjautuminen tarkistetaan Googlen Firebase-palvelussa. Sitä käytetään vain kirjautumiseen. Sinun tietosi eivät mene sinne.'),
          paragraph('Google on yhdysvaltalainen yritys. Siksi ylläpitäjän kirjautumistietoa voidaan käsitellä myös EU:n ulkopuolella. Tämä ei koske sinua eikä muita sivun käyttäjiä.'),
          paragraph('Sää- ja paikkatietoa haetaan muista palveluista vain silloin, kun käytät sitä toimintoa.'),
          paragraph('Kun avaat ulkoisen linkin tai teet Google-haun, siirryt pois tältä sivulta. Silloin sinua koskevat sen palvelun omat säännöt.'),
        ],
      },
      {
        id: 'yllapitajan-kirjautuminen',
        title: 'Ylläpitäjän kirjautuminen',
        blocks: [
          paragraph('Sivulla on ylläpitonäkymä. Sinne pääsevät vain ennalta nimetyt ylläpitäjät.'),
          paragraph('Ylläpitäjä kirjautuu Google-tunnuksella. Palvelin tarkistaa tunnisteen. Se hyväksyy vain voimassa olevan ylläpito-oikeuden.'),
          paragraph('Tavallinen käyttäjä ei tarvitse kirjautumista. Sinun ei tarvitse tehdä tunnusta.'),
        ],
      },
      {
        id: 'sailytys-ja-poistaminen',
        title: 'Kuinka kauan tiedot säilyvät',
        blocks: [
          paragraph('Selaimeen tallennetut valinnat säilyvät omalla laitteellasi. Ne säilyvät, kunnes poistat sivuston tiedot tai vaihdat selainta.'),
          paragraph('Palautteet ja linkkejä koskevat ilmoitukset poistetaan viimeistään 12 kuukauden kuluttua.'),
          paragraph('Palautteeseen liitetyt kuvat poistetaan heti, kun niitä ei enää tarvita. Viimeistään ne poistetaan 90 päivän kuluttua.'),
          paragraph('Vanhat testivastaukset poistetaan viimeistään kuuden kuukauden kuluttua siitä, kun testattu versio on julkaistu. Jos versiota ei julkaista, aika lasketaan testauksen päättymisestä.'),
          paragraph('Päivittäiset käyttöluvut poistetaan viimeistään 24 kuukauden kuluttua. Niissä ei ole tunnistetietoja.'),
          paragraph('Poistamme tiedot aiemmin, jos niitä ei enää tarvita. Ylläpitäjien tunniste- ja käyttöoikeustiedot säilytetään vain niin kauan kuin ylläpitotyö vaatii.'),
        ],
      },
      {
        id: 'oikeudet',
        title: 'Sinun oikeutesi',
        blocks: [
          paragraph('Sinulla on lain mukaan oikeuksia omiin tietoihisi. Näitä oikeuksia voit käyttää, jos lähettämässäsi palautteessa tai kuvassa on sinua koskevia tietoja.'),
          paragraph('Voit pyytää, että:'),
          list(
            'kerromme, mitä tietoja sinusta on',
            'korjaamme väärän tiedon',
            'poistamme tiedon',
            'emme käytä tietoa toistaiseksi',
          ),
          paragraph('Kerro pyynnössä sen verran, että löydämme oikean palautteen. Älä kirjoita pyyntöön ylimääräisiä henkilötietoja.'),
          paragraph('Vastaamme pyyntöösi. Jos et ole vastaukseen tyytyväinen, voit ottaa yhteyttä viranomaiseen. Viranomainen on Tietosuojavaltuutetun toimisto. Voit tehdä sinne valituksen, jos epäilet, että tietojasi on käsitelty väärin.'),
        ],
      },
      {
        id: 'yhteydenotto',
        title: 'Kysy meiltä',
        blocks: [
          paragraph('Vastaamme mielellämme kysymyksiin.'),
          paragraph(<>Tietosuoja-asiat: Nina Ziessler, <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>, puhelin 050 468 0171. Muut SeniorSurf-asiat: <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>.</>),
          paragraph('Päivitetty 31.8.2026. Päivitämme tämän sivun, kun tiedot, säilytysajat tai yhteystiedot muuttuvat.'),
        ],
      },
      {
        id: 'sanasto',
        title: 'Sanoja, jotka voivat olla vieraita',
        blocks: [
          paragraph(<><strong>Selain.</strong> Ohjelma, jolla katselet nettisivuja. Esimerkiksi Chrome, Edge, Safari tai Firefox.</>),
          paragraph(<><strong>Eväste.</strong> Pieni tiedosto, jonka sivusto voi tallentaa selaimeesi. Tämä sivu ei käytä evästeitä seurantaan.</>),
          paragraph(<><strong>IP-osoite.</strong> Numerosarja, jonka avulla tieto löytää oikeaan laitteeseen. Se ei kerro nimeäsi.</>),
          paragraph(<><strong>Palvelin.</strong> Tietokone, joka säilyttää sivuston tiedot ja lähettää sivun selaimeesi.</>),
          paragraph(<><strong>Rekisterinpitäjä.</strong> Se taho, joka vastaa tiedoistasi. Tässä se on Vanhustyön keskusliitto ry.</>),
          paragraph(<><strong>Profiili.</strong> Kerätty kuva siitä, kuka olet ja mitä teet netissä. Tästä sivusta ei synny sinulle profiilia.</>),
          paragraph(<><strong>Paikannus.</strong> Selaimen toiminto, joka kertoo sijaintisi. Selain kysyy siihen aina luvan.</>),
        ],
      },
    ],
  },
  sv: {
    navigationLabel: 'Sidans länkar',
    backHome: 'Tillbaka till startsidan',
    accessibility: 'Tillgänglighet',
    seniorSurfPrivacy: 'SeniorSurfs dataskyddsbeskrivning',
    kicker: 'Till dig',
    title: 'Dataskydd',
    intro: 'Du kan använda Seniorens startsida utan konto och utan lösenord. Sidan följer dig inte. Sidan skapar ingen profil av dig. Dina egna val sparas i huvudsak bara i din egen webbläsare.',
    summaryTitle: 'I korthet',
    summaryItems: [
      'Du behöver inget konto och inget lösenord.',
      'Dina val och favoriter stannar i din egen webbläsare.',
      'Vi följer dig inte och samlar ingen profil om dig.',
      'Vi räknar bara hur många gånger sidan och länkarna används.',
      'Vi säljer inga uppgifter. Vi ger dem inte till annonsörer.',
      'Väder och lokala nyheter hämtas från andra tjänster. De ser från vilket håll på nätet förfrågan kommer.',
    ],
    tocLabel: 'Innehållsförteckning för dataskyddssidan',
    tocTitle: 'Innehåll',
    sections: [
      {
        id: 'mita-sivu-kertoo',
        title: 'Vad den här sidan berättar',
        blocks: [
          paragraph('Den här sidan berättar vilka uppgifter Seniorens startsida behandlar. Den berättar också vad uppgifterna används till och hur länge de sparas.'),
          paragraph('Vi har skrivit texten på vanligt språk. Svåra ord förklaras genast där de förekommer. I slutet finns dessutom en kort ordlista.'),
          paragraph('Om något är oklart kan du fråga oss. Kontaktuppgifterna finns i slutet av sidan.'),
        ],
      },
      {
        id: 'rekisterinpitaja',
        title: 'Vem ansvarar för dina uppgifter',
        blocks: [
          paragraph('Vanhustyön keskusliitto ry ansvarar för webbplatsen.'),
          paragraph('Officiella uppgifter: Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry, FO-nummer 0215403–8, Malmin kauppatie 26, 00700 Helsingfors.'),
          paragraph('I lagen kallas en sådan ansvarig part personuppgiftsansvarig. Det betyder två saker. Vi bestämmer vilka uppgifter som samlas in och varför. Vi ansvarar också för att uppgifterna är trygga.'),
          paragraph(<>Nina Ziessler ansvarar för dataskyddsfrågor. Du kan skicka e-post till henne på <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>. Du kan också ringa numret 050 468 0171.</>),
        ],
      },
      {
        id: 'mita-kasitellaan',
        title: 'Vilka uppgifter behandlar sidan',
        blocks: [
          paragraph('Sidan kan behandla de här uppgifterna:'),
          list(
            'den ort du har valt',
            'de länkar du har markerat som favoriter',
            'textstorlek, färger och vilka avsnitt som syns',
            'antal: hur många gånger sidan har öppnats och hur många länkar som klickats',
            'respons eller meddelande om en länk som du själv har skickat',
            'en bild av skärmen, om du bifogade en till responsen',
            'uppgift om vilken typ av enhet och webbläsare responsen skickades med',
            'gamla testsvar, tills de raderas',
            'administratörens inloggningsuppgift och uppgift om vad administratören har ändrat',
          ),
          paragraph('Sidan frågar inte efter ditt namn eller din adress. Ditt namn kommer till vår kännedom bara om du själv skriver det i responsen.'),
        ],
      },
      {
        id: 'mita-ei-kerata',
        title: 'Vad sidan inte samlar in',
        blocks: [
          paragraph('Sidan gör inget av det här:'),
          list(
            'följer dig inte med hjälp av kakor',
            'följer dig inte för reklam',
            'ger dig ingen hemlig identifieringskod',
            'känner inte igen din webbläsare med ett så kallat fingeravtryck',
            'sparar inte din IP-adress i användningssiffrorna',
            'sparar inte var du har rört dig',
          ),
          paragraph('En kaka är en liten fil. En webbplats kan spara den i din webbläsare. Många webbplatser följer med kakor var du rör dig på nätet. Den här sidan gör inte så.'),
          paragraph('Du behöver inte logga in för att använda sidan.'),
        ],
      },
      {
        id: 'selaimen-asetukset',
        title: 'Vad som sparas i din webbläsare',
        blocks: [
          paragraph('En webbläsare är ett program som du tittar på webbsidor med. Vanliga webbläsare är Chrome, Edge, Safari och Firefox.'),
          paragraph('En del av dina val sparas bara i din egen webbläsare. Så minns sidan dem när du kommer tillbaka.'),
          list(
            'dina favoriter',
            'den ort du har valt',
            'textstorlek',
            'mörk eller ljus färg',
            'de avsnitt du vill se',
            'uppgift om du redan har sett presentationen av sidan',
            'land eller stad för den andra klockan, om du har tagit den i bruk',
          ),
          paragraph('De här uppgifterna går ingenstans. De stannar på din egen enhet. Ingen profil av dig uppstår hos oss.'),
          paragraph('Du kan radera uppgifterna själv. Töm webbplatsdata i webbläsaren, så försvinner de.'),
        ],
      },
      {
        id: 'kolmannen-osapuolen-palvelut',
        title: 'Vilka andra tjänster sidan använder',
        blocks: [
          paragraph('Väder och lokala nyheter hämtas från andra tjänster. De drivs av andra företag och sammanslutningar.'),
          list(
            'Open-Meteo ger väderuppgifterna. Den får veta var din ort ligger på kartan.',
            'OpenStreetMaps Nominatim berättar vilken kommun platsen hör till. Den används bara om du ger lov till positionering.',
            'Nominatim används inte alls om du själv har valt din hemkommun.',
            'rss2json och allorigins kan förmedla de lokala nyheterna. De används bara om nyheterna inte kommer fram direkt.',
          ),
          paragraph('När din webbläsare kontaktar de här tjänsterna ser de din IP-adress.'),
          paragraph('En IP-adress är en sifferserie. Med hjälp av den hittar informationen rätt enhet. Den berättar ungefär från vilken trakt man rör sig. Den berättar inte ditt namn.'),
          paragraph('Seniorens startsida sparar inte de här platserna bland sina egna uppgifter. Den sparar inte heller IP-adressen.'),
        ],
      },
      {
        id: 'kayttotilasto',
        title: 'Hur användningen av sidan räknas',
        blocks: [
          paragraph('Vi räknar hur sidan används. Så vet vi vad som fungerar och vad som behöver förbättras.'),
          paragraph('Vi räknar varje dag:'),
          list(
            'hur många gånger sidan har öppnats och hur många länkar som klickats',
            'på vilken del av webbplatsen och i vilken länkkategori klicket skedde',
            'varifrån man kom till sidan: direkt, inifrån webbplatsen, från SeniorSurf, från en sökmotor eller någon annanstans på nätet',
            'om det var ett nytt besök eller om man kom med bakåtknappen',
            'om webbläsaren är i vanligt läge eller i läget för en installerad app',
            'om du öppnade guiden för startsidan och hur du använde den',
          ),
          paragraph('Vi sparar inte en enskild länkadress eller klockslag. Vi sparar bara webbplatsens del, länkkategorin och klassen för varifrån besöket kom, till exempel sökmotor.'),
          paragraph('De här siffrorna berättar inte vem du är. De berättar bara antal. Administratören ser till exempel att en länkkategori klickades 40 gånger. Han eller hon ser inte vem som klickade.'),
          paragraph('Siffrorna skickas till webbplatsens egen server. De sparas som dagliga sammanställningar.'),
          paragraph('Räkningen använder inga kakor. Den sparar och läser ingenting på din enhet. Därför behöver sidan inte fråga dig om lov till kakor.'),
          paragraph('Servern ser den IP-adress som följer med förfrågan. Den gör genast om adressen till en teckensträng som man inte kan gå tillbaka till adressen från. Med teckensträngen hindras extra förfrågningar under en kort tid. Den ursprungliga IP-adressen sparas inte.'),
        ],
      },
      {
        id: 'palautteet',
        title: 'Respons och meddelande om en länk',
        blocks: [
          paragraph('Du kan skicka respons till oss. Du kan också meddela om en länk som är trasig eller leder fel. Du kan föreslå en ny länk.'),
          paragraph('När du skickar respons sparar vi:'),
          list(
            'responsens typ, rubrik och beskrivning',
            'den sida som responsen gäller',
            'länkens namn och adress',
            'länkens ämnesgrupp eller källa, om den finns med',
            'din egen tilläggskommentar',
            'tidpunkten då du skickade meddelandet',
            'uppgift om meddelandet redan har behandlats',
            'en bild av skärmen, om du bifogade en',
          ),
          paragraph('Vi använder uppgifterna bara för att underhålla, korrigera, testa och utveckla sidan.'),
          paragraph('Skriv inga personuppgifter i formuläret. Skriv inga hälsouppgifter och inga lösenord. Se också till att sådana uppgifter inte syns på bilden.'),
          paragraph('Responsens text, behandlingsstatus och administrationens offentliga svar visas för alla på sidan för responsbehandling. För en länkrapport visas länkens grunduppgifter, status och den offentliga behandlingsmotiveringen. Tekniska uppgifter om enheten och webbläsaren samt en bifogad bild visas endast för namngivna administratörer.'),
          paragraph('Tidigare fanns en testenkät på sidan. Den är nu ur bruk. Gamla svar raderas inom den tid som nämns i avsnittet "Hur länge uppgifterna sparas".'),
        ],
      },
      {
        id: 'paikalliset-palvelut',
        title: 'Ort och väder',
        blocks: [
          paragraph('Du kan välja din ort själv. Du kan också låta webbläsaren söka den. Webbläsaren frågar alltid om lov till det.'),
          paragraph('Du kan byta ort när som helst. Din exakta position sparas inte på vår server.'),
          paragraph('Väderkortet hämtar vädret från en annan tjänst. Hämtningen görs utifrån ortens läge. Ingen profil av dig skapas.'),
        ],
      },
      {
        id: 'palveluntarjoajat',
        title: 'Var uppgifterna sparas',
        blocks: [
          paragraph('En server är en dator som förvarar webbplatsens uppgifter. Den skickar också sidan till din webbläsare.'),
          paragraph('Servern för Seniorens startsida finns i Cloudcitys datorhall. Där finns också responsen, bilderna i responsen och användningssiffrorna.'),
          paragraph('Administratörernas inloggning kontrolleras i Googles Firebase-tjänst. Den används bara för inloggning. Dina uppgifter går inte dit.'),
          paragraph('Google är ett amerikanskt företag. Därför kan administratörens inloggningsuppgift behandlas också utanför EU. Det gäller inte dig och inte andra användare av sidan.'),
          paragraph('Väder- och platsuppgifter hämtas från andra tjänster bara när du använder den funktionen.'),
          paragraph('När du öppnar en extern länk eller gör en Google-sökning lämnar du den här sidan. Då gäller den tjänstens egna regler för dig.'),
        ],
      },
      {
        id: 'yllapitajan-kirjautuminen',
        title: 'Administratörens inloggning',
        blocks: [
          paragraph('Sidan har en administrationsvy. Dit kommer bara på förhand namngivna administratörer.'),
          paragraph('Administratören loggar in med ett Google-konto. Servern kontrollerar identifieraren. Den godkänner bara en giltig administratörsbehörighet.'),
          paragraph('En vanlig användare behöver inte logga in. Du behöver inte skapa något konto.'),
        ],
      },
      {
        id: 'sailytys-ja-poistaminen',
        title: 'Hur länge uppgifterna sparas',
        blocks: [
          paragraph('De val som sparats i webbläsaren finns kvar på din egen enhet. De finns kvar tills du raderar webbplatsens data eller byter webbläsare.'),
          paragraph('Respons och meddelanden om länkar raderas senast efter 12 månader.'),
          paragraph('Bilder som bifogats respons raderas genast när de inte längre behövs. Senast raderas de efter 90 dagar.'),
          paragraph('Gamla testsvar raderas senast sex månader efter att den testade versionen har publicerats. Om versionen inte publiceras räknas tiden från det att testningen avslutades.'),
          paragraph('De dagliga användningssiffrorna raderas senast efter 24 månader. De innehåller inga identifieringsuppgifter.'),
          paragraph('Vi raderar uppgifterna tidigare om de inte längre behövs. Administratörernas identifierings- och behörighetsuppgifter sparas bara så länge administrationsarbetet kräver det.'),
        ],
      },
      {
        id: 'oikeudet',
        title: 'Dina rättigheter',
        blocks: [
          paragraph('Enligt lagen har du rättigheter till dina egna uppgifter. Rättigheterna kan du använda om den respons eller bild du skickat innehåller uppgifter om dig.'),
          paragraph('Du kan begära att vi:'),
          list(
            'berättar vilka uppgifter som finns om dig',
            'rättar en felaktig uppgift',
            'raderar en uppgift',
            'tills vidare inte använder en uppgift',
          ),
          paragraph('Berätta så mycket i din begäran att vi hittar rätt respons. Skriv inga onödiga personuppgifter i begäran.'),
          paragraph('Vi svarar på din begäran. Om du inte är nöjd med svaret kan du kontakta myndigheten. Myndigheten är Dataombudsmannens byrå. Du kan lämna in ett klagomål dit om du misstänker att dina uppgifter har behandlats fel.'),
        ],
      },
      {
        id: 'yhteydenotto',
        title: 'Fråga oss',
        blocks: [
          paragraph('Vi svarar gärna på frågor.'),
          paragraph(<>Dataskyddsfrågor: Nina Ziessler, <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>, telefon 050 468 0171. Övriga SeniorSurf-ärenden: <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>.</>),
          paragraph('Uppdaterad 31.8.2026. Vi uppdaterar den här sidan när uppgifterna, lagringstiderna eller kontaktuppgifterna ändras.'),
        ],
      },
      {
        id: 'sanasto',
        title: 'Ord som kan vara främmande',
        blocks: [
          paragraph(<><strong>Webbläsare.</strong> Ett program som du tittar på webbsidor med. Till exempel Chrome, Edge, Safari eller Firefox.</>),
          paragraph(<><strong>Kaka.</strong> En liten fil som en webbplats kan spara i din webbläsare. Den här sidan använder inga kakor för att följa dig.</>),
          paragraph(<><strong>IP-adress.</strong> En sifferserie som hjälper informationen att hitta rätt enhet. Den berättar inte ditt namn.</>),
          paragraph(<><strong>Server.</strong> En dator som förvarar webbplatsens uppgifter och skickar sidan till din webbläsare.</>),
          paragraph(<><strong>Personuppgiftsansvarig.</strong> Den part som ansvarar för dina uppgifter. Här är det Vanhustyön keskusliitto ry.</>),
          paragraph(<><strong>Profil.</strong> En insamlad bild av vem du är och vad du gör på nätet. Den här sidan skapar ingen profil av dig.</>),
          paragraph(<><strong>Positionering.</strong> En funktion i webbläsaren som berättar var du är. Webbläsaren frågar alltid om lov till det.</>),
        ],
      },
    ],
  },
  en: {
    navigationLabel: 'Page links',
    backHome: 'Back to the start page',
    accessibility: 'Accessibility',
    seniorSurfPrivacy: 'SeniorSurf Privacy Statement',
    kicker: 'For you',
    title: 'Privacy',
    intro: 'You can use the Senior Start Page without an account and without a password. The page does not track you. The page does not build a profile of you. Your own choices are saved mainly in your own browser.',
    summaryTitle: 'In brief',
    summaryItems: [
      'You do not need an account or a password.',
      'Your choices and favourites stay in your own browser.',
      'We do not track you and we do not build a profile of you.',
      'We only count how many times the page and the links are used.',
      'We do not sell information. We do not give it to advertisers.',
      'Weather and local news come from other services. They see roughly where on the internet the request comes from.',
    ],
    tocLabel: 'Privacy page table of contents',
    tocTitle: 'Contents',
    sections: [
      {
        id: 'mita-sivu-kertoo',
        title: 'What this page tells you',
        blocks: [
          paragraph('This page tells you what information the Senior Start Page handles. It also tells you what the information is used for and how long it is kept.'),
          paragraph('We wrote this text in everyday language. Difficult words are explained where they appear. There is also a short word list at the end.'),
          paragraph('If something is unclear, you can ask us. The contact details are at the end of the page.'),
        ],
      },
      {
        id: 'rekisterinpitaja',
        title: 'Who is responsible for your information',
        blocks: [
          paragraph('Vanhustyön keskusliitto ry is responsible for this website.'),
          paragraph('Official details: Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry, Business ID 0215403–8, Malmin kauppatie 26, FI-00700 Helsinki, Finland.'),
          paragraph('In law, such a responsible party is called the data controller. This means two things. We decide what information is collected and why. We are also responsible for keeping it safe.'),
          paragraph(<>Nina Ziessler is responsible for data protection matters. You can email her at <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>. You can also call +358 50 468 0171.</>),
        ],
      },
      {
        id: 'mita-kasitellaan',
        title: 'What information the page handles',
        blocks: [
          paragraph('The page may handle this information:'),
          list(
            'the municipality you have chosen',
            'the links you have marked as favourites',
            'text size, colours and which sections are shown',
            'counts: how many times the page was opened and how many links were clicked',
            'feedback or a report about a link that you sent yourself',
            'a picture of your screen, if you attached one to your feedback',
            'what kind of device and browser the feedback was sent from',
            'old test answers, until they are deleted',
            'the administrator sign-in details and what the administrator changed',
          ),
          paragraph('The page does not ask for your name or your address. We only learn your name if you write it in your feedback yourself.'),
        ],
      },
      {
        id: 'mita-ei-kerata',
        title: 'What the page does not collect',
        blocks: [
          paragraph('The page does none of the following:'),
          list(
            'it does not track you with cookies',
            'it does not track you for advertising',
            'it does not give you a hidden identity number',
            'it does not recognise your browser by a so-called fingerprint',
            'it does not store your IP address in the usage counts',
            'it does not store where you have been',
          ),
          paragraph('A cookie is a small file. A website can save it in your browser. Many websites use cookies to follow where you go online. This page does not do that.'),
          paragraph('You do not need to sign in to use the page.'),
        ],
      },
      {
        id: 'selaimen-asetukset',
        title: 'What is saved in your browser',
        blocks: [
          paragraph('A browser is the program you look at web pages with. Common browsers are Chrome, Edge, Safari and Firefox.'),
          paragraph('Some of your choices are saved only in your own browser. That way the page remembers them when you come back.'),
          list(
            'your favourites',
            'the municipality you chose',
            'text size',
            'dark or light colours',
            'the sections you want to see',
            'whether you have already seen the introduction',
            'the country or city of the second clock, if you turned it on',
          ),
          paragraph('This information does not go anywhere. It stays on your own device. No profile of you is created on our side.'),
          paragraph('You can delete it yourself. Clear the website data in your browser and it is gone.'),
        ],
      },
      {
        id: 'kolmannen-osapuolen-palvelut',
        title: 'What other services the page uses',
        blocks: [
          paragraph('Weather and local news come from other services. They are run by other companies and organisations.'),
          list(
            'Open-Meteo provides the weather. It learns where your municipality is on the map.',
            'OpenStreetMap Nominatim tells which municipality a location belongs to. It is used only if you allow location access.',
            'Nominatim is not used at all if you chose your home municipality yourself.',
            'rss2json and allorigins may pass on the local news. They are used only if the news does not arrive directly.',
          ),
          paragraph('When your browser contacts these services, they see your IP address.'),
          paragraph('An IP address is a series of numbers. It helps information find the right device. It shows roughly what area you are in. It does not tell anyone your name.'),
          paragraph('The Senior Start Page does not store these locations in its own records. It does not store the IP address either.'),
        ],
      },
      {
        id: 'kayttotilasto',
        title: 'How use of the page is counted',
        blocks: [
          paragraph('We count how the page is used. That is how we know what works and what needs improving.'),
          paragraph('Every day we count:'),
          list(
            'how many times the page was opened and how many links were clicked',
            'which part of the website and which link category received the click',
            'where people came from: directly, from within the site, from SeniorSurf, from a search engine or from elsewhere online',
            'whether it was a new visit or someone used the back button',
            'whether the browser is in regular mode or installed-app mode',
            'whether you opened the start page guide and how you used it',
          ),
          paragraph('We do not store an individual link address or the time of day. We store only the website section, link category and the class of where the visit came from, for example a search engine.'),
          paragraph('These counts do not tell us who you are. They only tell us numbers. An administrator sees, for example, that a link category was clicked 40 times. They do not see who clicked it.'),
          paragraph('The counts are sent to the website’s own server. They are stored as daily summaries.'),
          paragraph('The counting uses no cookies. It stores and reads nothing on your device. That is why the page does not have to ask you for cookie consent.'),
          paragraph('The server sees the IP address that comes with the request. It immediately turns the address into a string of characters that cannot be turned back into an address. The string is used to block extra requests for a short time. The original IP address is not stored.'),
        ],
      },
      {
        id: 'palautteet',
        title: 'Feedback and reporting a link',
        blocks: [
          paragraph('You can send us feedback. You can also report a link that is broken or goes to the wrong place. You can suggest a new link.'),
          paragraph('When you send feedback, we store:'),
          list(
            'the type, title and description of the feedback',
            'the page the feedback is about',
            'the name and address of the link',
            'the topic group or source of the link, if it is included',
            'your own extra note',
            'the time you sent the report',
            'whether the report has already been handled',
            'a picture of your screen, if you attached one',
          ),
          paragraph('We use the information only to maintain, fix, test and develop the page.'),
          paragraph('Do not write personal details in the form. Do not write health information or passwords. Also check that such details are not visible in the picture.'),
          paragraph('The feedback text, processing status and the administrator’s public reply are shown to everyone on the feedback processing page. For a link report, the link’s basic details, status and public processing reason are shown. Technical device and browser details and any attached image are visible only to named administrators.'),
          paragraph('The page used to have a test survey. It is no longer in use. Old answers are deleted within the time given in "How long information is kept".'),
        ],
      },
      {
        id: 'paikalliset-palvelut',
        title: 'Municipality and weather',
        blocks: [
          paragraph('You can choose your municipality yourself. You can also let the browser find it. The browser always asks your permission for that.'),
          paragraph('You can change the municipality at any time. Your exact location is not stored on our server.'),
          paragraph('The weather card fetches the weather from another service. The search is made using the location of the municipality. No profile of you is created.'),
        ],
      },
      {
        id: 'palveluntarjoajat',
        title: 'Where the information is kept',
        blocks: [
          paragraph('A server is a computer that keeps the website’s information. It also sends the page to your browser.'),
          paragraph('The Senior Start Page server is in Cloudcity’s data centre. The feedback, the pictures attached to feedback and the usage counts are there too.'),
          paragraph('Administrator sign-ins are checked in Google’s Firebase service. It is used only for signing in. Your information does not go there.'),
          paragraph('Google is a United States company. For that reason an administrator’s sign-in details may also be handled outside the EU. This does not concern you or other users of the page.'),
          paragraph('Weather and location information is fetched from other services only when you use that feature.'),
          paragraph('When you open an external link or make a Google search, you leave this page. That service’s own rules then apply to you.'),
        ],
      },
      {
        id: 'yllapitajan-kirjautuminen',
        title: 'Administrator sign-in',
        blocks: [
          paragraph('The page has an administration view. Only administrators named in advance can get in.'),
          paragraph('An administrator signs in with a Google account. The server checks the sign-in token. It accepts only a valid administrator role.'),
          paragraph('An ordinary user does not need to sign in. You do not need to create an account.'),
        ],
      },
      {
        id: 'sailytys-ja-poistaminen',
        title: 'How long information is kept',
        blocks: [
          paragraph('The choices saved in your browser stay on your own device. They stay until you delete the website data or change browser.'),
          paragraph('Feedback and reports about links are deleted no later than 12 months afterwards.'),
          paragraph('Pictures attached to feedback are deleted as soon as they are no longer needed. At the latest they are deleted after 90 days.'),
          paragraph('Old test answers are deleted no later than six months after the tested version has been released. If the version is not released, the time is counted from the end of testing.'),
          paragraph('The daily usage counts are deleted no later than after 24 months. They contain no identifying details.'),
          paragraph('We delete information earlier if it is no longer needed. Administrator identity and access details are kept only as long as the administration work requires.'),
        ],
      },
      {
        id: 'oikeudet',
        title: 'Your rights',
        blocks: [
          paragraph('The law gives you rights over your own information. You can use these rights if the feedback or picture you sent contains information about you.'),
          paragraph('You can ask us to:'),
          list(
            'tell you what information we hold about you',
            'correct information that is wrong',
            'delete information',
            'stop using information for the time being',
          ),
          paragraph('Give enough detail in your request for us to find the right feedback. Do not write unnecessary personal details in the request.'),
          paragraph('We will answer your request. If you are not satisfied with the answer, you can contact the authorities. The authority is the Office of the Data Protection Ombudsman. You can lodge a complaint there if you suspect your information has been handled wrongly.'),
        ],
      },
      {
        id: 'yhteydenotto',
        title: 'Ask us',
        blocks: [
          paragraph('We are happy to answer questions.'),
          paragraph(<>Data protection matters: Nina Ziessler, <a className="underline" href="mailto:nina.ziessler@vtkl.fi">nina.ziessler@vtkl.fi</a>, telephone +358 50 468 0171. Other SeniorSurf matters: <a className="underline" href="mailto:seniorsurf@vtkl.fi">seniorsurf@vtkl.fi</a>.</>),
          paragraph('Updated 31 August 2026. We update this page when the information, the retention times or the contact details change.'),
        ],
      },
      {
        id: 'sanasto',
        title: 'Words that may be unfamiliar',
        blocks: [
          paragraph(<><strong>Browser.</strong> The program you look at web pages with. For example Chrome, Edge, Safari or Firefox.</>),
          paragraph(<><strong>Cookie.</strong> A small file a website can save in your browser. This page does not use cookies to track you.</>),
          paragraph(<><strong>IP address.</strong> A series of numbers that helps information find the right device. It does not tell anyone your name.</>),
          paragraph(<><strong>Server.</strong> A computer that keeps the website’s information and sends the page to your browser.</>),
          paragraph(<><strong>Data controller.</strong> The party responsible for your information. Here it is Vanhustyön keskusliitto ry.</>),
          paragraph(<><strong>Profile.</strong> A collected picture of who you are and what you do online. This page does not build a profile of you.</>),
          paragraph(<><strong>Location access.</strong> A browser feature that tells where you are. The browser always asks your permission for it.</>),
        ],
      },
    ],
  },
};

const nodeToMarkdown = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToMarkdown).join('');
  if (!React.isValidElement<{ children?: React.ReactNode; href?: string }>(node)) return '';
  const text = nodeToMarkdown(node.props.children);
  if (node.type === 'a' && node.props.href) return `[${text}](${node.props.href})`;
  if (node.type === 'strong') return text;
  return text;
};

export const getPrivacyDefaultMarkdown = (language: PublicPageLanguage) => {
  const copy = privacyTranslations[language];
  const lines = [
    `## ${copy.summaryTitle}`,
    '',
    ...copy.summaryItems.map((item) => `- ${item}`),
  ];
  copy.sections.forEach((section) => {
    lines.push('', `## ${section.title}`, '');
    section.blocks.forEach((block) => {
      if (block.type === 'list') {
        lines.push(...block.items.map((item) => `- ${item}`), '');
      } else {
        lines.push(nodeToMarkdown(block.content), '');
      }
    });
  });
  return lines.join('\n').trim();
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
  useSiteContentVersion();
  const title = getSiteContentValue('privacy.title', language, copy.title);
  const intro = getSiteContentValue('privacy.intro', language, copy.intro);
  const customBody = getSiteContentValue('privacy.body', language).trim();

  useEffect(() => installUsageTracking('tietosuoja'), []);

  return (
    <main className="aurora-page">
      <div className="aurora-shell">
        <header className="aurora-subpage-hero space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex flex-wrap items-center gap-3" aria-label={copy.navigationLabel}>
              <a href="./index.html" className={pageNavLinkClass}>{copy.backHome}</a>
              <a href={getLocalizedPublicPageHref('saavutettavuus', language)} className={pageNavLinkClass}>{copy.accessibility}</a>
              <a href="https://seniorsurf.fi/seniorsurf/tietosuojaseloste/" className={pageNavLinkClass} target="_blank" rel="noreferrer">{copy.seniorSurfPrivacy}</a>
            </nav>
            <PublicPageLanguageSwitcher page="tietosuoja" language={language} />
          </div>

          <div className="space-y-4">
            <span className="aurora-kicker">{copy.kicker}</span>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-white/75">{intro}</p>
          </div>
        </header>

        {customBody ? (
          <section className="aurora-panel mt-10" aria-label={title}>
            <ManagedMarkdown value={customBody} />
          </section>
        ) : (
          <>
            <section className="aurora-soft-panel mt-10" aria-labelledby="privacy-summary-heading">
              <h2 id="privacy-summary-heading" className="aurora-section-title text-2xl">{copy.summaryTitle}</h2>
              <ul className="mt-4 grid list-disc gap-3 pl-6 text-base font-bold leading-relaxed text-[var(--theme-text-2)] marker:font-black marker:text-[var(--theme-primary)] md:grid-cols-2">
                {copy.summaryItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <nav className="aurora-panel mt-8 p-5" aria-label={copy.tocLabel}>
              <h2 className="text-lg font-black text-[var(--theme-text)]">{copy.tocTitle}</h2>
              <ol className="mt-4 grid list-decimal gap-2 pl-6 text-sm font-black text-[var(--theme-primary)] marker:text-[var(--theme-primary)] md:grid-cols-2">
                {copy.sections.map(({ id, title: sectionTitle }) => (
                  <li key={id}>
                    <a className="inline-flex min-h-10 items-center rounded-full px-3 py-1.5 hover:bg-[var(--theme-pale)] hover:underline focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" href={`#${id}`}>{sectionTitle}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-8 space-y-6">
              {copy.sections.map((section) => <PrivacySection key={section.id} {...section} />)}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const privacyRoot = document.getElementById('root');
if (privacyRoot && /\/tietosuoja(?:-(?:sv|en))?(?:\.html)?\/?$/i.test(window.location.pathname)) {
  ReactDOM.createRoot(privacyRoot).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
