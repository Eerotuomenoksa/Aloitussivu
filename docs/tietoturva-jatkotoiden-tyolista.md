# aloitussivu - tietoturvan jatkotyolista

Tarkistuspaiva: 2026-05-26  
Lahtokohta: omassa tietoturvakatsauksessa loydetyt jatkokorjaukset aiempien tietoturvapakettien jalkeen.

## Tavoite

Tama lista kokoaa seuraavat tietoturvaparannukset toteutusjarjestykseen. Aiemmat kriittiset salaisuuksien siirrot on tehty, mutta sivulla on viela julkisia toimintoja, joita voidaan vaarinkayttaa kuormittamiseen, kulujen kasvattamiseen tai yllapitajan tyon hairintaan.

## Tyolista

### JATKO-01 - Estetaan Gemini-funktion vaarinkaytto

**Tila:** kooditasolla tehty, tuotantoasetusten tarkistus viela ennen julkaisua  
**Taso:** korkea  
**Tiedostot:** `functions/gemini.ts`, `services/geminiService.ts`, mahdollisesti Firebase App Check -asetukset

**Ongelma:** `geminiChat` on julkinen HTTP-funktio. API-avain ei enaa vuoda selaimeen, mutta kuka tahansa voi yrittaa kutsua funktiota suoraan ja kuluttaa Gemini-kiintiota.

**Korjaukset:**
- Lisaa Firebase App Check ja tarkista App Check -token funktiossa. Koodituki lisatty; tuotantopakotus vaatii viela Firebase Consolen asetuksen ja `GEMINI_REQUIRE_APP_CHECK=true`.
- Lisaa palvelinpuolen rate limit esimerkiksi IP:n, uid:n tai App Check -tunnisteen mukaan. Kevyt instanssikohtainen IP-raja lisatty.
- Salli `task`-kenttaan vain tunnetut arvot: `assistant` ja `summarizeNews`. Lisatty.
- Harkitse kirjautumisvaatimusta avustajalle, jos kustannusriski kasvaa.
- Kirjaa vain tekniset virheet, ei kayttajien viesteja tai henkilokohtaisia tietoja.

**Hyvaksymiskriteerit:**
- Tuntematon tai puuttuva App Check -token ei voi kayttaa funktiota tuotannossa.
- Sama kayttaja tai sama IP ei voi tehda rajattomasti pyyntoja.
- Avustaja toimii normaalisti sivustolla.

**18.6.2026 rajaus:** App Check -tarkistus ja kevyt instanssikohtainen rate limit ovat koodissa. Ennen tuotantojulkaisua tarkistetaan viela lopullisen domainin App Check -asetukset, Firebase/Google Cloud -budjettihalytykset ja mahdollinen tarve Firestore-, Redis- tai Cloud Armor -pohjaiselle pysyvammalle rate limitille.

### JATKO-02 - Suojataan linkkiehdotusjono spammilta

**Tila:** pilottitason kevyt suoja tehty, tuotantotason palvelinpuolen suoja avoin  
**Taso:** korkea/keskitaso  
**Tiedostot:** `linkVisibility.ts`, `components/LinkReportModal.tsx`, `firestore.rules`, mahdollinen uusi Cloud Function

**Ongelma:** `linkReports`-kokoelmaan saa luoda raportteja julkisesti. Kenttien pituuksia rajataan, mutta massasyottoa ei estetä.

**Korjaukset:**
- Siirra linkkiraportin luonti suoraan Firestore-kirjoituksesta Cloud Functionin kautta.
- Lisaa App Check tai muu selaimen aitouden tarkistus.
- Lisaa kevyt rate limit: esimerkiksi enintaan 5 ilmoitusta / selain tai IP / paiva.
- Validoi URL palvelimella: ensisijaisesti vain `https://`, ei tyhjia tai teknisesti vaarallisia skeemoja.
- Lisaa lomakkeeseen honeypot-kentta tai muu hiljainen bottien esto.

**Hyvaksymiskriteerit:**
- Tavallinen kayttaja voi edelleen lahettaa palautteen ilman kirjautumista.
- Automaattinen massasyotto ei tayta Firestorea rajattomasti.
- Yllapidon ehdotusjono nayttaa vain palvelimella validoituja raportteja.

**18.6.2026 rajaus:** Pilotissa kaytossa on kevyt suoja: URL-normalisointi, vaarallisten skeemojen torjunta, `https://`-ohjaus/validointi, pituusrajat ja honeypot-kentta. Tama vaikeuttaa tavallista roskaa, mutta ei ole tayden tuotantotason spammisuoja, koska selaimelta on edelleen sallittu rajattu luonti Firestoreen. Tuotantovaiheessa linkkiraportin luonti siirretaan Cloud Functioniin, johon lisataan App Check, palvelinpuolen URL-validointi ja pyyntorajoitus.

### JATKO-03 - Yhtenaiseta admin-oikeuksien malli

**Tila:** odottaa paatosta tavoitemallista  
**Taso:** keskitaso  
**Tiedostot:** `firebaseClient.ts`, `firestore.rules`, `functions/ncscCron.ts`, yllapidon ohjeet

**Ongelma:** Admin-oikeus tarkistetaan nyt eri tavoilla: frontendissa sahkopostilla ja `localStorage`-fallbackilla, Firestoressa sahkopostilla, ja `ncscScrapeNow`-funktiossa sahkopostilla tai UID:lla.

**Korjaukset:**
- Paata yksi paamalli: mieluiten Firebase Auth UID tai custom claims.
- Lisaa sama UID-/claim-tarkistus Firestore-saantoihin.
- Poista `localStorage` admin-paatoksen lahteena; sita voi kayttaa vain nayttamiseen tai debugiin.
- Dokumentoi, miten uusi admin lisataan ja miten vanha poistetaan.

**Hyvaksymiskriteerit:**
- Sama kayttaja toimii adminina seka Firestoressa etta Cloud Functioneissa.
- `localStorage`-muokkaus ei saa yllapitokayttoliittymaa nayttamaan oikeuksia virheellisesti.
- Adminin vaihto on toistettava ohjeesta.

**18.6.2026 rajaus:** Tahan ei tehda koodimuutosta ennen kuin yllapitokayttajien maara ja tavoitemalli paatetaan. Suositus on custom claims- tai UID-pohjainen malli, joka dokumentoidaan samalla kun uusi admin lisataan.

### JATKO-04 - Varmistetaan suojausotsikot oikeassa hostingissa

**Tila:** odottaa hosting-paatosta  
**Taso:** keskitaso  
**Tiedostot:** `firebase.json`, hosting-palvelun asetukset, `docs/elokuun-julkaisusuunnitelma.md`

**Ongelma:** `firebase.json` sisaltaa suojausotsikot, mutta GitHub Pages ei kayta niita. Otsikot tulevat voimaan vasta Firebase Hostingissa tai muussa palvelussa, johon ne asetetaan.

**Korjaukset:**
- Kun siirto Firebase Hostingiin tai CloudCityyn tehdään, varmista HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy` ja `frame-ancestors`.
- Tarkista tuotantodomainista headerit `curl -I`-komennolla.
- Tiukenna CSP:ta myohemmin poistamalla `unsafe-inline`, jos build-tapa sen sallii.

**Hyvaksymiskriteerit:**
- Tuotantodomain palauttaa suojausotsikot.
- Sivusto toimii ilman selaimen CSP-virheita.
- Yllapitosivut eivat ole iframe-upotettavissa.

**18.6.2026 rajaus:** GitHub Pages -testiosoite ei kayta `firebase.json`-otsikkoja. Suojausotsikoiden varsinainen hyvaksymistesti voidaan tehda vasta Firebase Hostingissa, Cloudcityssa tai muussa lopullisessa hostingissa komennolla `curl -I` tuotantodomainiin.

### JATKO-05 - Rajaa operointitietojen julkinen luku

**Tila:** tehty  
**Taso:** matala/keskitaso  
**Tiedostot:** `firestore.rules`, `adminStats.ts`, `scamAlerts.ts`, `ehdotukset.tsx`

**Ongelma:** `adminStats` ja `ncscScrapeLog` ovat julkisesti luettavissa. Tieto ei ole salainen avain, mutta se paljastaa kayttomaaria, ajorytmeja ja virhetilanteita.

**Korjaukset:**
- Muuta `adminStats` ja `ncscScrapeLog` admin-only-luettaviksi. Tehty Firestore-saannoissa.
- Jos etusivulle tarvitaan julkinen tieto, luo erillinen siivottu `publicStats`-dokumentti.
- Nakyma yllapitoon saa lukea tarkemmat tiedot adminina.

**Hyvaksymiskriteerit:**
- Kirjautumaton kayttaja ei voi lukea ajolokeja tai admin-tilastoja.
- Julkinen sivu toimii edelleen.

### JATKO-06 - Laajenna salaisuusskannaus functions-lahdekoodiin

**Tila:** tehty  
**Taso:** matala  
**Tiedostot:** `scripts/check-no-hardcoded-secrets.mjs`

**Ongelma:** nykyinen tarkistus ohittaa koko `functions`-kansion, jolloin funktioiden lahdekoodiin vahingossa lisatty avain voisi jaada huomaamatta.

**Korjaukset:**
- Skannaa `functions/*.ts`.
- Ohita edelleen `functions/.env`, `functions/.env.local`, `functions/lib` ja `functions/node_modules`.
- Jata dokumentit joko skannauksen ulkopuolelle tai salli niissa vain esimerkkiarvot.

**Hyvaksymiskriteerit:**
- `npm run check:secrets` skannaa frontendin ja funktioiden lahdekoodin.
- Tarkistus ei ilmoita `functions/.env`-tiedoston oikeista salaisuuksista.

### JATKO-07 - Pieni selainkovennus hakutoimintoon

**Tila:** tehty  
**Taso:** matala  
**Tiedostot:** `components/SearchBar.tsx`

**Ongelma:** Google-haku avataan `window.open(targetUrl, '_blank')` -kutsulla ilman `noopener,noreferrer`-asetusta.

**Korjaus:**
- Muuta avaus muotoon: `window.open(targetUrl, '_blank', 'noopener,noreferrer')`.

**Hyvaksymiskriteerit:**
- Hakutoiminto toimii kuten ennen.
- Uusi valilehti ei saa tarpeetonta yhteytta alkuperaiseen ikkunaan.

## Suositeltu toteutusjarjestys

1. JATKO-01 - Gemini-funktion vaarinkayton esto
2. JATKO-02 - Linkkiehdotusten spammisuoja
3. JATKO-03 - Admin-oikeuksien yhtenainen malli
4. JATKO-04 - Suojausotsikot oikeaan hostingiin
5. JATKO-05 - Operointitietojen luku admin-onlyksi
6. JATKO-06 - Salaisuusskannauksen laajennus
7. JATKO-07 - Hakutoiminnon selainkovennus

## Huomioita Eerolle

- App Check ja rate limit ovat seuraavaksi tarkeimmat, koska ne suojaavat kustannuksilta ja kuormitukselta.
- Firebase API key ei ole itsessaan salaisuus, mutta sen kayttoa kannattaa rajoittaa Google Cloudin Credentials-nakymassa HTTP referrer -rajoituksilla.
- `robots.txt` ja `noindex` auttavat hakukoneisiin, mutta ne eivat ole kayttooikeussuoja.
- GitHub Pages -julkaisussa palvelimen suojausotsikot ovat rajalliset. Hosting-siirto on siksi myos tietoturvaparannus, ei vain tekninen siirto.
