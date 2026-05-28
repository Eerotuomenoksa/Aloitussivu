# Tietoturva-arvio — Aloitussivu (SeniorSurf)

**Päiväys:** 27.5.2026
**Auditoitu kohde:** Aloitussivu-projekti (React/Vite + Firebase + Cloud Functions)
**Auditoija:** AI-avusteinen koodikatselmus
**Auditin laajuus:** Frontend-koodi, Firebase-konfiguraatio, Firestore-säännöt, Cloud Functions, HTTP-otsakkeet, riippuvuudet ja salaisuuksien hallinta

---

## Tiivistelmä

Sivuston perustietoturva on monelta osin **kohtuullisen hyvällä mallilla** ja kohdeyleisön (ikääntyneet käyttäjät) erityispiirteet on huomioitu. Vahvuuksia: kattavat Firestore-säännöt, App Check -tuki Gemini-funktiossa, kohtuullinen CSP, rate limiting Cloud Functions -funktioissa, ja `rel="noopener noreferrer"` -käytäntö ulkoisissa linkeissä. `.env`-tiedostot eivät näy git-historiassa.

Kuitenkin löytyi yksi **kriittinen** löydös (`functions/.env` sisältää aktiivisia API-avaimia paikallisessa työhakemistossa OneDrive-synkronoituna), **kolme korkean** ja useita **keski-/matalan** prioriteetin parannuskohdetta. Pisteytys: **6.5 / 10** — toimiva mutta selvästi parannettavissa.

> **Tarkennus 27.5.2026:** `NAMEDAY_API_TOKEN` on vain testikäytössä; tuotantoon nimipäivät ostetaan staattisena tiedostona, joten kyseinen vuototokeni ei ole tuotantoriski jatkossa. Ks. löydös KESKI 5.

---

## Löydökset prioriteettijärjestyksessä

### 🔴 KRIITTINEN 1 — Tuotanto­salaisuudet OneDrivessa
**Tiedosto:** `functions/.env`

Tiedosto sisältää useita aktiivisia tuotantosalaisuuksia selkokielisenä:

- `GEMINI_API_KEY=AIzaSyCBEE9H7dc3lOiZaZO68Ykq15iN0F33U_I`
- `NAMEDAY_API_TOKEN=ndt_f3eecc7369abcfef69b8f01597540acf3deff9698678e0aaebf9a4b8dacfb008` *(huom: tämä token on vain testikäytössä — tuotannossa nimipäivät tulevat ostettavasta tiedostosta, ks. alla)*
- `ADMIN_TRIGGER_SECRET=sWM3ATbykGWq5DZnbO0naS3-QRWOac-g3zjsVvU9px0`

**Riski:** Vaikka `.gitignore` estää committoinnin (varmistettu), tiedosto sijaitsee OneDrive-synkronoidussa kansiossa `C:\Users\eero.tuomenoksa\OneDrive - Vanhustyön keskusliitto ry\...`. Tämä tarkoittaa että:

1. Salaisuudet replikoituvat Microsoftin pilveen ja kaikkiin laitteisiin joihin tili on kirjattu.
2. Jos OneDrive-tilin tunnukset vuotavat tai sitä jaetaan, kaikki salaisuudet vuotavat.
3. OneDriven mahdollinen "Files on Demand" -toiminto ei poista jo synkronoituja tiedostoja palvelimelta.
4. Yritystilin järjestelmänvalvojat voivat lähtökohtaisesti lukea tiedostoja.

**Suositukset:**
- **Heti:** Pyöräytä (rotate) `GEMINI_API_KEY` ja `ADMIN_TRIGGER_SECRET` — luo Gemini API -avaimelle uusi avain ja peruuta vanha; generoi uusi admin-trigger-secret. **`NAMEDAY_API_TOKEN` ei vaadi pyöräytystä koska se on vain testikäytössä** — peruuta token kokonaan kun siirrytään tiedostopohjaiseen ratkaisuun (ks. KESKI 5).
- Siirrä jäljelle jäävät salaisuudet **Firebase Functions Secret Manageriin** (`firebase functions:secrets:set GEMINI_API_KEY`), älä `.env`-tiedostoon.
- Siirrä koko `functions/.env` paikallisesti hakemistoon joka **ei ole** OneDrive-synkronoitu (esim. `C:\dev\Aloitussivu-secrets\`).
- Lisää `GEMINI_API_KEY`:lle Google Cloud Consolessa **API-restriktiot**: rajoita vain `generativelanguage.googleapis.com`-rajapintaan ja IP-rangeen (Firebase Functions -palvelimet).

---

### 🟠 KORKEA 1 — `dist/`-kansio synkronoidaan OneDriveen
**Tiedosto:** `.gitignore` (rivi 2), kansio `dist/`

`dist/` on `.gitignore`:ssa mutta sijaitsee OneDrive-kansiossa. Vite-buildin lopputulos sisältää `.env`-tiedostoista upotetut `VITE_*`-muuttujat selväkielisenä JavaScript-bundelissa. Tämä on normaali Vite-käytäntö, **mutta** koska bundlessa on Firebase Web API -avain joka on **vähäisesti rajoitettu** (ks. seuraava löydös), tämä korostuu.

**Riski:** Web-bundlet vuotavat OneDriveen kuten yllä — vähäisempi riski kuin functions/.env mutta sama vektori.

**Suositukset:**
- Rakenna `dist/` aina OneDriven ulkopuolella (esim. CI:ssä tai paikallisessa `~/dev/`-kansiossa).
- Lisää `dist/`-poissulkeminen OneDriven asetuksiin (Files On-Demand → "Always keep on this device" pois).

---

### 🟠 KORKEA 2 — Selainpuolen Firebase API -avaimen rajoitukset puuttunevat
**Tiedosto:** `.env`, `firebaseClient.ts`

`VITE_FIREBASE_API_KEY=AIzaSyBSSBCbiGIJDYp_l0fShTx6YMIOZ_rnmVE` paljastuu kaikille selaimissa (kuten kuuluukin Firebase Web SDK:lle), mutta sen turvallisuus riippuu **HTTP referrer -rajoituksesta** Google Cloud Consolessa. En voi auditin osana varmistaa onko rajoitus paikallaan, joten oletan että ei.

**Riski:** Ilman referrer-rajoitusta kuka tahansa voi väärinkäyttää avainta esim. Firebase Authentication- tai Identity Toolkit -kiintiön kuluttamiseen. Vaikka data on Firestore-sääntöjen takana, kvootan loppuun käyttäminen on DoS-vektori.

**Suositukset:**
- Google Cloud Console → APIs & Services → Credentials → muokkaa avainta:
  - Application restrictions: **HTTP referrers** → salli vain `https://eerotuomenoksa.github.io/*` ja `https://aloitussivu-5d50c.web.app/*` (sekä localhost devauksessa).
  - API restrictions: salli vain `Identity Toolkit API`, `Firestore API`, `Firebase Cloud Messaging API`, `Firebase Installations API`, `Token Service API`.

---

### 🟠 KORKEA 3 — `geminiChat`-funktio ei pakota App Checkiä oletuksena
**Tiedosto:** `functions/gemini.ts` (rivit 57–70)

```ts
const verifyAppCheckIfRequired = async (req: Request) => {
  if (process.env.GEMINI_REQUIRE_APP_CHECK !== 'true') return true;
  ...
};
```

App Check on **opt-in** ympäristömuuttujalla. Jos `GEMINI_REQUIRE_APP_CHECK` ei ole asetettu `true`:ksi tuotannossa, kuka tahansa voi kutsua julkista endpointtia ja kuluttaa Gemini-kiintiötäsi. Rate limit on muistissa (`Map`) per Cloud Functions -instanssi — Cloud Functions skaalaa horisontaalisesti, joten todellinen yläraja kerrotaan instanssimäärällä.

**Riski:** Suora taloudellinen ($) ja palvelunestoriski. Hyökkääjä voi tehdä 20 pyyntöä/10min × N instanssia, joka voi olla satoja tai tuhansia kutsuja minuutissa todellisuudessa.

**Suositukset:**
- Aseta tuotantoympäristöön `GEMINI_REQUIRE_APP_CHECK=true` ja **poista koko opt-in-haarautuminen** — App Check pitäisi vaatia aina.
- Siirrä rate limiter Firestore-pohjaiseksi tai Redis/Memorystoreen, jotta se toimii instanssien yli.
- Aseta Gemini API -avaimelle **budjettihälytys** Google Cloudissa (esim. 5 €/päivä).
- Harkitse käyttäjäkohtaista pyyntörajaa (UID-pohjainen) IP-pohjaisen lisäksi — IP-osoite voi olla NAT:n takana jaettu.

---

### 🟡 KESKI 1 — `trackUsage`-endpointti hyväksyy kaikki POST-pyynnöt ilman App Checkiä
**Tiedosto:** `functions/usage.ts`

`trackUsage` kirjoittaa Firestoreen ilman App Check -varmennusta. CORS rajoittaa selaimen `fetch`-pohjaisen käytön sallittuihin origin:eihin, mutta CORS **ei ole tietoturvarajoite** — sitä noudattaa vain selain. `curl`-kutsulla tai bottiverkolla kuka tahansa voi pumpata roskaa `usageStats`-kokoelmaan.

**Riski:** Tilastojen vääristäminen, Firestore-kustannusten kasvattaminen (kirjoituksia veloitetaan), `usageStats`-kokoelman paisuminen kunnes Firestore-dokumentti saavuttaa 1 MiB:n rajan.

**Suositukset:**
- Vaadi App Check -token myös `trackUsage`-funktiolle.
- Lisää `usageStats`-dokumenttiin ylivuotosuoja: jos `pageviews`-kentässä on yli N avainta tai dokumentti on yli 800 KiB, hylkää uusi kirjoitus tai siirrä alikollektioon.

---

### 🟡 KESKI 2 — Sähköpostipohjainen admin-tunnistus on hauras
**Tiedostot:** `firestore.rules` (rivit 5–11), `functions/ncscCron.ts` (rivit 8–14), `firebaseClient.ts` (rivit 122–155)

Adminit tunnistetaan kahden Gmail-osoitteen perusteella. Tämä tarkoittaa:

1. Jos `seniorsurf.suomi@gmail.com` -tilin salasana vuotaa tai 2FA pettää, hyökkääjä saa täydet admin-oikeudet (kirjoittaa scam-alerteja, hyväksyttyjä linkkejä jne. — joka näkyy kaikille käyttäjille).
2. Firestore-säännöt käyttävät tarkistusta `request.auth.token.email in [...]`. Sähköpostiosoite on Google-tilin attribuutti, mutta jos joskus konfiguraatio muutetaan sallimaan sähköpostin muutos (tai jos käytössä on aliaksia), tämä voi pettää.
3. Frontendin `getUserEmail`-funktio lukee sähköpostin myös `localStorage`-tallennetusta arvosta (`readStoredAdminEmail`), mikä on selaintason "muistilappu" UI:n näyttämistä varten — Firestore-säännöt eivät sitä luota, mutta jos joku katselee kooditarkastelua tämä näyttää epäilyttävältä ja kannattaa kommentoida selkeästi koodiin.

**Suositukset:**
- Pakota admin-tileille 2FA (Google-tilin asetus).
- Siirry **Firebase Custom Claims** -pohjaiseen admin-merkintään: aseta `admin: true` -claim adminkäyttäjille Admin SDK:lla, ja muuta säännöt muotoon `request.auth.token.admin == true`. Sähköpostilista häviää koodista.
- Jos jätät sähköpostit, harkitse vähintään `request.auth.token.email_verified == true` -tarkistus sääntöihin.

---

### 🟡 KESKI 3 — Content-Security-Policy sallii `'unsafe-inline'` skripteissä
**Tiedosto:** `firebase.json` (rivi 30–31)

```
script-src 'self' 'unsafe-inline';
```

`'unsafe-inline'` tarkoittaa että kaikki `<script>...</script>`-elementit ja `onclick="..."`-attribuutit suoritetaan. Tämä **kumoaa CSP:n tärkeimmän XSS-suojan**. Vitestä syntyy normaalisti ulkoisia bundleja eikä sisäisiä skriptejä, joten tämän pitäisi olla poistettavissa.

**Lisähuomio:** `connect-src` sallii `https://*.googleapis.com` mikä on laajempi kuin tarpeen — `firebase`-domain ja `generativelanguage.googleapis.com` riittäisivät.

`img-src 'self' data: https:` sallii **minkä tahansa** HTTPS-kuvan — käytännössä OK tälle sivustolle koska näytetään ulkoisia favicon-kuvia jne., mutta voisi tiukentaa jos tiedetään lähdedomainit.

**Suositukset:**
- Poista `'unsafe-inline'` `script-src`:stä. Jos Vite-buildi tuottaa inline-scriptin, lisää nonce tai siirry hashiin.
- Lisää CSP-raportoinnin endpointti: `report-uri /csp-report` ja seuraa rikkomuksia.
- Harkitse `Cross-Origin-Opener-Policy: same-origin` ja `Cross-Origin-Resource-Policy: same-origin` -otsakkeita.

---

### 🟡 KESKI 4 — RSS-syötteiden HTML-entiteettien purku `innerHTML`:llä
**Tiedosto:** `services/rssService.ts` (rivit 18–22)

```ts
const decodeText = (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value.trim();
};
```

`textarea.innerHTML = value` ei suorita `<script>`-tageja (selain ei käsittele niitä textarea-kontekstissa), joten **suora XSS ei ole mahdollista**. Mutta:

1. RSS-syötteet tulevat kunnan paikallislehdiltä ja kolmannelta osapuolelta `api.rss2json.com` sekä `api.allorigins.win` — luotat siis kahteen ulkopuoliseen proxyyn, jotka voivat injektoida sisältöä.
2. Jos joku muuttaa myöhemmin `decodeText`:n palautuksen tulemaan vaikkapa `dangerouslySetInnerHTML`:ään, XSS tulee välittömäksi.

**Suositukset:**
- Korvaa `DOMParser` + `textContent`-pohjaiseen purkuun tai käytä `he`-kirjastoa (HTML entity decoder, ~6 KB).
- Pidä `allorigins.win`-fallback minimoituna — se on **rajaton proxy**, joka voi muuttua tai poistua koska vain. Lisää sisäinen Cloud Functions -proxy jos RSS-välitys on tärkeää.

---

### 🟢 MATALA 1 — `rate limit` pelkän IP-osoitteen pohjalta
**Tiedostot:** `functions/gemini.ts`, `functions/usage.ts`

Rate limiter käyttää `x-forwarded-for`-otsakkeen ensimmäistä arvoa. Useat operaattori-NAT:n takaa tulevat käyttäjät jakavat saman IP:n, joten yksi väärinkäyttäjä voi tukkia kiintiön muilta saman NAT:n takaa.

**Suosittelu:** Käytä yhdistelmäavainta (IP + UA-hash tai IP + AppCheck-token-prefix) jakamiseen.

---

### 🟢 MATALA 2 — `Permissions-Policy` sallii mikrofonin ja sijainnin `self`:lle
**Tiedosto:** `firebase.json` (rivi 27)

```
Permissions-Policy: camera=(), microphone=(self), geolocation=(self)
```

Sivusto näyttäisi käyttävän vain `geolocation`:ia (paikkakuntahaku). Mikrofonin saliminen voi olla turhaa.

**Suosittelu:** Tarkista käytetäänkö mikrofonia. Jos ei, vaihda `microphone=()`.

---

### 🟢 MATALA 3 — `Math.random()` ID:iden luonnissa
**Tiedostot:** `components/LinkReportModal.tsx` rivi 71, `approvedLinks.ts` rivi 113

Käyttäjäilmoitusten ID:t generoidaan `${Date.now()}-${Math.random().toString(16).slice(2)}`. Ei kryptografisesti turvallinen, mutta käyttötapaus (Firestore-dokumentti-ID) on triviaali — törmäysriski erittäin pieni.

**Suosittelu:** Vaihda `crypto.randomUUID()`:hen — selaintuki on nykyaikainen ja koodi siistiytyy.

---

### 🟢 MATALA 4 — `geminiChat` -malli "preview"
**Tiedosto:** `functions/gemini.ts` rivi 135 — `model: 'gemini-3-flash-preview'`

Preview-malleilla ei välttämättä ole tuotantotason SLA:ta tai pitkäikäisyyttä. Jos malli poistuu käytöstä, käyttäjille tulee 500-virheitä.

**Suosittelu:** Vaihda vakaaseen versioon (esim. `gemini-2.5-flash`) tai dokumentoi syy preview-mallin käyttöön.

---

### 🟡 KESKI 5 — Nimipäivärajapinta on vain testikäytössä; tuotantoon vaihdetaan tiedostoon
**Tiedosto:** `functions/nameday.ts`, `functions/.env` (`NAMEDAY_API_TOKEN`)

`namedayToday`-Cloud Function ja siihen liittyvä token ovat **testikäytössä**. Tuotantoon nimipäivät on tarkoitus ostaa kertaluonteisena tiedostona, joka paketoidaan staattisesti sivustoon tai funktion bundleen.

**Riski:** Niin kauan kuin token elää `.env`-tiedostossa, se on edelleen yllä KRIITTINEN 1 -löydöksen mukainen vuotoriski. Lisäksi `namedayApi`-Firestore-statistiikka kerää kustannuksia kirjoituksista jokaisella kutsulla.

**Suositukset (kun siirto tehdään):**
- Lisää nimipäivätiedosto (esim. `assets/namedays-2026.json`) ja lataa selaimessa staattisena resurssina — Cloud Function ja `NAMEDAY_API_TOKEN` poistetaan kokonaan.
- Poista `namedayToday`-export `functions/index.ts`:stä ja poista `functions/nameday.ts`.
- Peruuta `NAMEDAY_API_TOKEN` nimipaivarajapinta.fi:n hallintapaneelista.
- Poista `adminStats/namedayApi`-dokumentti Firestoresta (tilastolähde poistuu).
- Päivitä `ehdotukset.tsx`:n ylläpitonäkymä: poista "Nimipäivärajapinta"-kortti.

**Tämän löydöksen toteuttaminen poistaa samalla osan KRIITTINEN 1:stä** — yksi salaisuus vähemmän hallittavana.

---

### 🟢 MATALA 5 — Firestore-säännöt eivät rajoita scamAlerts/approvedLinks -lukuja
**Tiedosto:** `firestore.rules` (rivit 45–58)

`approvedLinks`, `blockedLinks`, `scamAlerts` -kokoelmat ovat `allow read: if true` eli täysin julkisia. Tämä on todennäköisesti tarkoituksellista (etusivu on julkinen), mutta tämä tarkoittaa myös että kuka tahansa voi pollata kokoelmia ja kasvattaa Firestore-lukukustannuksia. Yhdistettynä siihen että näitä luetaan `onSnapshot`-kuuntelijoilla, kustannukset voivat kasvaa nopeasti.

**Suosittelu:** Aseta Firebase-projektille **budjettihälytys** (esim. 10 €/kk). Harkitse näiden kokoelmien servausta CDN-välimuistitetun JSON-tiedoston kautta jos lukumäärät kasvavat suuriksi.

---

## Vahvuudet (jätä nämä ennalleen)

✅ **`.env`-tiedostot eivät ole git-historiassa** — varmistettu `git log --all`-haulla.
✅ **HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy** -otsakkeet asianmukaisesti asetettu.
✅ **`frame-ancestors 'none'`** estää sivuston upottamisen iframeen (clickjacking-suoja).
✅ **`rel="noopener noreferrer"`** on lisätty kaikkiin ulkoisiin `target="_blank"`-linkkeihin.
✅ **Firestore-säännöt validoivat `linkReports`-dokumentin tyypin, koon ja rajoittavat statusta** (`status == 'pending'`).
✅ **`ncscScrapeNow` vaatii Bearer-tokenin** ja varmistaa admin-emailin Admin SDK:lla.
✅ **CORS-origin-lista on whitelist eikä `*`**.
✅ **Frontend ei käytä `dangerouslySetInnerHTML`:ää** (Reactin oma escapaus suojaa XSS:ltä).
✅ **`linkReports`-validaatio rajoittaa note <=1000 merkkiä, url <=500 merkkiä, name <=160 merkkiä** — DoS-suoja.
✅ **Skripti `scripts/check-no-hardcoded-secrets.mjs`** etsii automaattisesti tunnettuja salaisuusmuotoja koodista — hieno käytäntö.

---

## Toimenpidesuositukset prioriteettijärjestyksessä

| # | Toimenpide | Prioriteetti | Arvioitu työmäärä |
|---|---|---|---|
| 1 | Pyöräytä `GEMINI_API_KEY` ja `ADMIN_TRIGGER_SECRET`, siirrä Secret Manageriin (NAMEDAY_API_TOKEN peruutetaan kun siirrytään tiedostoon, ks. #9) | 🔴 KRIITT. | 30 min |
| 2 | Rajoita `VITE_FIREBASE_API_KEY` Google Cloud Consolessa HTTP-refereriin | 🟠 KORKEA | 10 min |
| 3 | Aseta `GEMINI_REQUIRE_APP_CHECK=true` ja Google Cloud -budjettihälytys | 🟠 KORKEA | 20 min |
| 4 | Vaadi App Check myös `trackUsage`-funktiolle | 🟡 KESKI | 30 min |
| 5 | Poista `'unsafe-inline'` CSP:n `script-src`:stä | 🟡 KESKI | 1 t |
| 6 | Siirry Custom Claims -pohjaiseen adminiin sähköpostien sijaan | 🟡 KESKI | 2 t |
| 7 | Siirrä työhakemisto OneDriven ulkopuolelle tai aseta `dist/`/`functions/.env` synkronoinnista pois | 🔴/🟠 | 15 min |
| 8 | Korvaa `Math.random()` `crypto.randomUUID()`:lla | 🟢 | 10 min |
| 9 | Vaihda nimipäivärajapinta tiedostoon ja poista `namedayToday`-funktio + `NAMEDAY_API_TOKEN` | 🟡 KESKI | 1–2 t |

---

## Liite — Auditin laajuus ja menetelmät

**Tarkastetut tiedostot:**
- `.env`, `.env.example`, `.gitignore`, `firebase.json`, `firestore.rules`
- `firebaseClient.ts`, `App.tsx`, `ehdotukset.tsx`, `yllapito.tsx`, `linkit.tsx`
- `linkVisibility.ts`, `approvedLinks.ts`, `usageTracking.ts`
- `functions/index.ts`, `functions/gemini.ts`, `functions/usage.ts`, `functions/ncscCron.ts`, `functions/nameday.ts`, `functions/cors.ts`, `functions/.env`
- `services/rssService.ts`, `services/ncscScheduler.ts`
- `components/LinkReportModal.tsx`, `index.html`
- `package.json`

**Hakukyselyt:**
- `dangerouslySetInnerHTML|innerHTML|eval|new Function|document.write`
- `target="_blank"|rel=`
- `addDoc|setDoc|updateDoc|deleteDoc`
- `isAdminUser|isAdmin\(|ADMIN_EMAIL`
- Git-historia `.env`-tiedostoille

**Tarkastamatta jääneet alueet:**
- Riippuvuuksien (`npm audit`) ajantasaiset CVE:t — suositellaan ajamaan `npm audit` säännöllisesti
- Google Cloud Console -puolen konfiguraatiot (API-avainten rajoitukset, IAM-roolit, budjettihälytykset)
- Firebase App Check -konfiguraatio Firebase Consolessa
- 2FA-status admin-tileille
- Tuotanto­ympäristön ympäristömuuttujat (Cloud Functions deploy)
- E2E-testit ja niiden kattamat turvallisuusskenaariot
