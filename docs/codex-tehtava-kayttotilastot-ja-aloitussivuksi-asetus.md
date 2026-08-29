# Codex-tehtävä: kasvumittarit ilman evästeitä + aloitussivuksi asettamisen polku

Laadittu: 2026-08-28
Tila: paikallinen sovellustoteutus valmis 2026-08-29, julkaisuportti kesken
Liittyy: `docs/kayttotilastot-ja-tietosuoja.md`, `usageTracking.ts`, `api/src/PublicApi.php`, `components/HomepageModal.tsx`

Toteutustarkistus 2026-08-29: tuotantobuild valmistuu ja API-testit läpäisevät kaikki 47 testiä. Migraatiota ei ole ajettu stagingiin tai tuotantoon, 24 tunnin staging-dataa ei ole kerätty eikä ihmisen ruudunlukija- ja tulostustarkistusta ole vielä tehty. Selainkohtaisten ohjeaskelten kuvakaappaukset jäävät erilliseksi sisältötyöksi ennen lopullista julkaisuporttia.

## 1. Tausta ja tavoite

Palvelun kasvun kannalta ratkaiseva kysymys ei ole kävijämäärä vaan se, **kuinka moni ottaa sivun oikeasti aloitussivukseen ja palaa siihen päivittäin**. Tätä ei tällä hetkellä mitata mitenkään.

Tavoite on saada kolme asiaa:

1. **Suorien avausten osuus** — luotettava populaatiotason mittari siitä, kasvaako tottumuskäyttö.
2. **Aloitussivuksi-oppaan suppilo** — kuinka moni avaa ohjeen ja kuinka moni saa sen tehtyä.
3. **"Tee se läheiselle" -polku** — uusi toiminnallisuus, jolla aikuinen lapsi tai digiopastaja voi asettaa sivun toisen henkilön selaimeen tai lähettää ohjeen eteenpäin. Tämä on todennäköisesti suurin yksittäinen kasvuvipu.

## 2. Reunaehdot — lue nämä ensin

Nämä ovat ehdottomia. Jos jokin toteutusvaihtoehto rikkoo näitä, valitse toinen vaihtoehto tai kysy ennen toteutusta.

1. **Ei evästekyselyä, ei suostumusbanneria.** Saavutettavuussyistä sivulla ei kysytä mitään ennen kuin käyttäjä pääsee sisältöön.
2. **Ei uutta selainmuistiin kirjoittamista tilastointitarkoituksessa.** Sähköisen viestinnän palveluista annetun lain 205 § edellyttää suostumusta päätelaitteelle tallentamiseen ja siellä olevan tiedon lukemiseen, ellei se ole välttämätöntä käyttäjän nimenomaisesti pyytämän palvelun toteuttamiseksi. Tilastointi ei kuulu tämän poikkeuksen piiriin. Koska emme kysy suostumusta, emme myöskään tallenna mitään tilastointia varten.
3. **Nykyinen tietosuojalupaus pysyy voimassa.** `docs/kayttotilastot-ja-tietosuoja.md` lupaa, ettei käytetä evästeitä, localStorage-tunnistetta, istuntotunnistetta, sormenjälkeä eikä IP-tallennusta. Kaikki alla oleva on suunniteltu niin, että lupaus pitää sanatarkasti.
4. **Vain koosteet, ei tapahtumarivejä.** Kuten nykyisin: API kasvattaa päiväkohtaisia laskureita, se ei tallenna yksittäisiä tapahtumia.
5. **Ei vapaata tekstiä julkiseen päätepisteeseen.** `/api/v1/usage-events` on tunnistautumaton. Kaikki uudet kentät validoidaan palvelimella kiinteää sallittujen arvojen listaa vasten. Tuntematon arvo hylätään hiljaisesti, ei tallenneta.
6. **Olemassa oleva opt-out säilyy.** `seniorSurfUsageTrackingDisabled` toimii jatkossakin ja kytkee pois myös kaikki uudet signaalit.

## 3. Mitä mitataan ja miten se määritellään

### 3.1 Suora avaus (kotisivusignaali)

Sivunavaus lasketaan **suoraksi avaukseksi**, kun kaikki kolme ehtoa täyttyvät:

- `document.referrer` on tyhjä
- `performance.getEntriesByType('navigation')[0].type === 'navigate'`
- `window.history.length === 1`

Tämä on selaimen käynnistyksen aloitussivun, kirjanmerkin ja käsin kirjoitetun osoitteen yhteinen allekirjoitus. Se **ei erottele näitä toisistaan**, joten sitä käsitellään aloitussivukäytön ylärajana, ei tarkkana lukuna. Merkitystä on kehityssuunnalla: jos suorien avausten osuus kaikista avauksista nousee viikkotasolla, tottumuskäyttö kasvaa.

Tueksi kerätään **kellonaikajakauma**. Aloitussivuavaukset kasautuvat selaimen käynnistykseen, eli aamuun. Suorien avausten aamupiikin vahvistuminen on toinen riippumaton todiste samasta asiasta.

### 3.2 Uusi vs. palaava käyttäjä

**Aitoa käyttäjäkohtaista paluuprosenttia ei voi mitata ilman päätelaitteelle tallentamista, eikä sitä tässä siis tehdä.** Kohdan 3.1 mittarit korvaavat sen populaatiotasolla.

Valinnainen laajennus, joka toteutetaan vain jos Eero erikseen hyväksyy: sivu lukee joka tapauksessa käyttäjän omat asetukset renderöintiä varten, joten pyyntöön voidaan liittää tieto siitä, **renderöityikö sivu käyttäjän omilla asetuksilla vai oletusasetuksilla** (`pageState: 'personalised' | 'default'`). Tämä kuvaa sivun tilaa, ei tunnista käyttäjää, eikä siitä synny uutta tallennusta. Jos tämä toteutetaan, `docs/kayttotilastot-ja-tietosuoja.md` on päivitettävä samassa yhteydessä ja asia on tarkistutettava VTKL:n tietosuojavastaavalla. **Älä toteuta tätä oletuksena.**

### 3.3 Aloitussivuksi-oppaan suppilo

Neljä tapahtumaa, kaikki tilattomia:

| Tapahtuma | Milloin |
|---|---|
| `guideOpened` | Aloitussivuksi-ohje avataan |
| `guideBrowser` | Käyttäjä valitsee selaimen (arvo: `chrome`/`edge`/`firefox`/`safari`/`android`/`ios`/`other`) |
| `guideDone` | Käyttäjä painaa ohjeen lopussa "Valmis, asetin sen" |
| `guideShared` | Ohje lähetetään eteenpäin (arvo: `share`/`email`/`sms`/`print`/`copy`) |

Tärkein tunnusluku on `guideDone / guideOpened`. Se kertoo, toimiiko ohje, ja se on ainoa mittari, joka reagoi ohjeen parantamiseen nopeasti.

### 3.4 Kampanjalähde

Tuetaan `?src=`-parametria painetuissa materiaaleissa, QR-koodeissa ja opastajien jakamissa linkeissä. Palvelin hyväksyy vain kiinteän listan arvoja (esim. `opastus`, `esite`, `qr`, `kirje`, `some`, `lehti`). Tuntematon arvo lasketaan arvoon `other`. Parametri poistetaan osoiteriviltä `history.replaceState`-kutsulla heti lukemisen jälkeen, jottei se jää kirjanmerkkiin.

## 4. Toteutus, asiakaspuoli

Tiedosto: `usageTracking.ts`

Laajenna `UsageEvent`-tyyppi:

```ts
type UsageEvent = {
  type: 'pageview' | 'linkClick' | 'guide';
  page: string;
  url?: string;
  label?: string;
  category?: string;
  // uudet, vain type === 'pageview'
  entry?: 'direct' | 'internal' | 'seniorsurf' | 'search' | 'external';
  navType?: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  freshTab?: boolean;          // history.length === 1
  hour?: number;               // 0-23, käyttäjän paikallinen tunti
  src?: string;                // vain sallitulta listalta
  displayMode?: 'browser' | 'standalone';
  // uudet, vain type === 'guide'
  step?: 'opened' | 'browser' | 'done' | 'shared';
  value?: string;              // selaintunnus tai jakotapa, sallitulta listalta
};
```

Lisää apufunktio `getEntryContext()`, joka päättelee yllä olevat arvot. Vaatimukset:

- Referreristä lähetetään **vain luokka**, ei koskaan koko osoitetta. Luokittelu: tyhjä → `direct`; sama origin → `internal`; `*.seniorsurf.fi` → `seniorsurf`; tunnettu hakukone (google, bing, duckduckgo, yahoo, ecosia) → `search`; muu → `external`.
- Kaikki `try/catch`-suojattuna. `performance.getEntriesByType` puuttuu vanhoista selaimista — silloin kenttä jätetään pois, ei arvata.
- Nykyinen 15 sekunnin `PAGEVIEW_DELAY_MS` säilyy. Konteksti luetaan heti sivun latauksessa ja säilötään moduulin muuttujaan, koska `history.length` muuttuu käyttäjän navigoidessa.
- `isUsageTrackingDisabled()` estää edelleen kaiken lähetyksen.

Vie uusi funktio:

```ts
export const trackGuideStep = (step: 'opened'|'browser'|'done'|'shared', value?: string) => { ... }
```

## 5. Toteutus, API ja tietokanta

### 5.1 Migraatio `database/migrations/003_usage_context_daily.sql`

```sql
CREATE TABLE IF NOT EXISTS usage_context_daily (
  usage_date DATE NOT NULL,
  dimension VARCHAR(24) NOT NULL,
  bucket VARCHAR(32) NOT NULL,
  count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (usage_date, dimension, bucket)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Ulottuvuudet (`dimension`): `entry`, `navtype`, `freshtab`, `hour`, `src`, `display`, `guide`.

Ei uusia sarakkeita `usage_daily`-tauluun — kaikki uusi menee tähän yhteen tauluun, jolloin uuden ulottuvuuden lisääminen ei vaadi migraatiota.

### 5.2 `api/src/PublicApi.php`

- Laajenna `submitUsageEvent` hyväksymään `type: 'guide'`.
- Toteuta `ALLOWED_CONTEXT`-vakiotaulukko: ulottuvuus → sallitut arvot. Validointi tapahtuu **ennen** kirjoitusta. Tuntematon ulottuvuus tai arvo ohitetaan hiljaisesti; pyyntö palauttaa silti 204, jotta selain ei yritä uudelleen.
- `hour` validoidaan kokonaisluvuksi 0–23 ja tallennetaan kaksimerkkisenä (`'07'`).
- Yksi pageview saa kasvattaa korkeintaan yhtä laskuria per ulottuvuus.
- Nykyinen pyyntörajoitus (`120/60`) säilyy ja kattaa myös guide-tapahtumat.
- Yhtään uutta kenttää ei kirjoiteta pyyntölokiin.

## 6. Tuotemuutos: aloitussivuksi asettamisen polku

Nykyinen `HomepageModal.tsx` on hyvä pohja mutta oletuksena yhden käyttäjän oma tekeminen. Laajennettava kolmeen polkuun. Aloitusnäkymässä kolme isoa valintaa:

1. **"Asetan tämän omalle koneelleni"** → nykyinen ohje, selaintunnistus vain järjestysvihjeenä (tunnistettu selain ensimmäisenä, kaikki muut aina näkyvissä avattavina). Ei koskaan piiloteta vaihtoehtoja tunnistuksen perusteella, koska tunnistus menee joskus väärin.
2. **"Asetan tämän toisen henkilön koneelle"** → sama ohje, mutta teksti kolmannessa persoonassa ("napsauta hänen selaimessaan…"). Lopuksi **muistilista auttajalle**: aloitussivu, tekstikoko, kotikunta, huijausvaroitukset päälle. Perustelu: konfiguroimaton sivu ei jää käyttöön, konfiguroitu jää.
3. **"Lähetän ohjeen hänelle"** → valmis viesti, jossa osoite ja lyhyt ohje. Toteutus: `navigator.share` kun saatavilla, muuten `mailto:`, `sms:` ja "kopioi teksti" -painike. Lisäksi **tulostettava A4** (`window.print()` + print-tyylit): iso osoite, QR-koodi, numeroidut askeleet. Tulosteen on toimittava mustavalkoisena.

Vaatimukset kaikille poluille:

- Osoite `https://www.seniorsurf.fi/aloitus/` näkyvissä isolla ja "Kopioi osoite" -painike.
- Yksi toiminto per askel, numeroidut askeleet, kuvakaappaus jokaisesta.
- **Mobiilipolku omana vaihtoehtonaan:** "Lisää puhelimen aloitusnäytölle" (iOS Safari: jakopainike → Lisää Koti-valikkoon; Android Chrome: valikko → Lisää aloitusnäyttöön). Tämä on mobiilin todellinen vastine aloitussivulle ja luultavasti tärkeämpi kuin työpöytäpolku.
- Lopussa iso **"Valmis, asetin sen"** -painike, joka kuittaa onnistumisen ja lähettää `guideDone`.
- Kaikki uusi noudattaa nykyisiä saavutettavuusvaatimuksia: fokusrengas, `fontSizeStep`-skaalaus, kosketuskohteiden vähimmäiskoko, ruudunlukijatestaus.
- Kaikki uusi teksti `i18n.tsx`:ään. Suomi ensin; uk/et/ru/se voivat jäädä myöhempään kuten muukin uusi sisältö.

**Ensimmäisen käynnin kehote:** harkitaan erikseen. Se vaatisi tiedon siitä, onko käyttäjä käynyt aiemmin, eli tallennusta — älä toteuta tässä tehtävässä.

## 7. Ylläpitonäkymä

Lisää `yllapito.html`-näkymään osio "Kasvumittarit":

- Suorien avausten osuus päivittäin ja 7 päivän liukuva keskiarvo.
- Avausten kellonaikajakauma pylväinä.
- Ohjesuppilo: avaukset → selainvalinnat → valmiit → jaetut, sekä `done/opened`-prosentti.
- Kampanjalähteiden jakauma.

Lukuoikeus kuten nykyisin: Firebase-kirjautuminen ja aktiivinen MariaDB-rooli.

## 8. Tietosuojadokumentaatio

Päivitä `docs/kayttotilastot-ja-tietosuoja.md` ja `tietosuoja.tsx` samassa PR:ssä. Lisättävä:

- luettelo uusista kentistä ja niiden sallituista arvoista
- nimenomainen maininta, ettei referreristä tallenneta osoitetta vaan luokka
- vahvistus siitä, ettei mitään tallenneta päätelaitteelle tilastointia varten
- perustelu, miksi suostumusta ei tarvita: ei tallennusta eikä lukemista päätelaitteelta tilastointitarkoituksessa
- 24 kuukauden säilytysaika koskee myös `usage_context_daily`-taulua

Huom Eerolle: tämä on perusteltu tulkinta, mutta se kannattaa tarkistuttaa VTKL:n tietosuojavastaavalla ennen 1.9. Se, ettei sivulla ole evästekyselyä, on saavutettavuusetu, joka kannattaa mainita myös julkistusviestinnässä.

## 9. Testit julkaisuporttiin

Lisää testitapaukset olemassa olevaan testiluetteloon:

- **STAT-01** Suora avaus tyhjällä referrerillä kirjautuu `entry=direct`.
- **STAT-02** Sisäinen navigointi kirjautuu `entry=internal`, ei `direct`.
- **STAT-03** Ulkoinen referrer ei koskaan tallennu osoitteena tietokantaan.
- **STAT-04** Tuntematon `dimension`- tai `bucket`-arvo hylätään, vastaus on silti 204, riviä ei synny.
- **STAT-05** `seniorSurfUsageTrackingDisabled=1` estää kaikki uudet tapahtumat.
- **STAT-06** Ohjesuppilon neljä tapahtumaa kirjautuvat oikein, `done/opened` laskee oikein.
- **STAT-07** Ohje toimii näppäimistöllä, ruudunlukijalla ja suurimmalla tekstikoolla.
- **STAT-08** Tulostettava A4 tulostuu luettavana mustavalkoisena.
- **STAT-09** Selaintunnistuksen epäonnistuessa kaikki selainohjeet ovat silti saatavilla.

## 10. Valmiin määritelmä

- Migraatio ajettu ja peruutettavissa.
- `npm run build` menee läpi, tyyppitarkistus puhdas.
- API-testit `api/tests/run.php` läpi.
- Tietosuojadokumentaatio päivitetty samassa muutoksessa.
- STAT-01…STAT-09 ajettu ja kirjattu.
- Ylläpitonäkymä näyttää oikeaa dataa stagingissa vähintään yhden vuorokauden ajalta.

## 11. Mitä ei saa tehdä

- Ei evästeitä, ei suostumusbanneria.
- Ei localStorage-kirjoituksia tilastointia varten.
- Ei istunto- eikä käyttäjätunnisteita, ei satunnaista "anonyymiä ID:tä".
- Ei koko referrer-osoitteen tallennusta.
- Ei IP-osoitteen tallennusta eikä maapäättelyä tässä tehtävässä.
- Ei kolmannen osapuolen analytiikkaa (GA, Matomo Cloud, Plausible tms.).
- Ei sormenjälkitekniikoita: ei canvas-, fontti- tai laiteominaisuuksien keräystä.
