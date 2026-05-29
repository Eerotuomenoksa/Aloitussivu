# Tietoturva-arvio — Aloitussivu (SeniorSurf)

**Päiväys:** 28.5.2026  
**Auditoitu kohde:** Aloitussivu-projekti (React/Vite + Firebase + Cloud Functions)  
**Auditoija:** AI-avusteinen koodikatselmus  
**Auditin laajuus:** Frontend-koodi, Firebase-konfiguraatio, Firestore-säännöt, Cloud Functions, HTTP-otsakkeet, riippuvuudet ja salaisuuksien hallinta  
**Edellinen arvio:** 27.5.2026 (6.5/10) → **Nyt: 7.5/10**

---

## Tiivistelmä

Edellisen auditin (27.5.2026) jälkeen on tehty **kolme merkittävää korjausta**: App Check on nyt pakollinen molemmissa Cloud Functions -funktioissa, CSP:n `'unsafe-inline'` on poistettu `script-src`:stä, ja Gemini-malli on päivitetty vakaaseen versioon. Pisteytys on noussut **7.5 / 10**.

Kriittisin avoin ongelma on edelleen **tuotantosalaisuudet paikallisessa ympäristössä** — tämä vaatii toimenpiteitä ennen laajempaa käyttöönottoa.

> **Kontekstihuomio (28.5.2026):** `NAMEDAY_API_TOKEN` on vain testikäytössä eikä ole tuotantoriski. OneDrive-kansio (`Vanhustyön keskusliitto ry\Tiedostot\GitHub\Aloitussivu`) on siirretty roskakoriin — tämä poistaa OneDrive-synkronointiriskin **tältä työasemalta**, mutta ei kierrä salaisuuksien oikean hallinnan tarvetta.

---

## Korjatut löydökset (27.5.2026 → 28.5.2026)

### ✅ KORKEA 3 → Korjattu — App Check pakollinen `geminiChat`-funktiossa
**Tiedosto:** `functions/gemini.ts`

Vanha opt-in-logiikka (`GEMINI_REQUIRE_APP_CHECK`-ympäristömuuttuja) on poistettu. `verifyAppCheck()` hylkää pyynnön 401:llä jos App Check -token puuttuu tai on virheellinen — ilman poikkeuksia.

### ✅ KESKI 1 → Korjattu — App Check vaaditaan myös `trackUsage`-funktiossa
**Tiedosto:** `functions/usage.ts` (rivit 155–158)

`verifyAppCheck`-tarkistus on lisätty ennen Firestore-kirjoitusta. Ilman App Check -tokenia funktio vastaa 204:llä (hiljainen hylkäys, ei vuoda tietoa virheestä).

### ✅ KESKI 3 → Korjattu — `'unsafe-inline'` poistettu CSP:stä
**Tiedosto:** `firebase.json` (rivi 31)

`script-src 'self'` ilman `'unsafe-inline'`. `connect-src` on samalla tarkennettu listamuotoon (`*.googleapis.com` → spesifiset domainit). `img-src` on tiukennettu `https://seniorsurf.fi`:hin.

### ✅ MATALA 4 → Korjattu — Gemini-malli päivitetty
**Tiedosto:** `functions/gemini.ts` rivi 133

`gemini-3-flash-preview` → `gemini-2.5-flash` (vakaa versio, tuotantotason SLA).

---

## Avoimet löydökset

### 🔴 KRIITTINEN 1 — Tuotantosalaisuudet paikallisessa `functions/.env`-tiedostossa
**Tiedosto:** `c:\dev\Aloitussivu\functions\.env`

Tiedosto sisältää aktiivisia tuotantosalaisuuksia selkokielisenä:

- `GEMINI_API_KEY=<redacted>`
- `ADMIN_TRIGGER_SECRET=<redacted>`
- `NAMEDAY_API_TOKEN=...` *(vain testikäytössä — ei tuotantoriski)*

OneDrive-synkronointi on poistunut tältä työasemalta, **mutta** tiedosto on edelleen paikallisella levyllä selkokielisenä. Avaimet ovat edelleen aktiivisia (ellei ole pyöräytetty).

**Toimenpiteet:**
- **Heti:** Pyöräytä `GEMINI_API_KEY` Google Cloud Consolessa ja `ADMIN_TRIGGER_SECRET` (generoi uusi arvo). Vanha avain on ollut altistuneena OneDrivessa.
- Siirrä salaisuudet **Firebase Secret Manageriin**: `firebase functions:secrets:set GEMINI_API_KEY`
- Lisää `GEMINI_API_KEY`:lle Google Cloud Consolessa API-restriktio: vain `generativelanguage.googleapis.com`
- `NAMEDAY_API_TOKEN` peruutetaan kun nimipäivät siirretään tiedostoon (ks. KESKI 5)

---

### 🟠 KORKEA 1 — `dist/`-kansio paikallisessa repositoriossa
**Kansio:** `c:\dev\Aloitussivu\dist\`

`dist/` on `.gitignore`:ssa eikä mene Githubiin, mutta sijaitsee paikallisella levyllä. Vite-bundlessa on `VITE_*`-muuttujat (Firebase Web API -avain ym.) selväkielisenä. Riski on pieni verrattuna OneDrive-tilanteeseen, mutta kannattaa tiedostaa.

**Suositus:** Rakenna `dist/` aina CI:ssä (GitHub Actions). Paikallinen `npm run build` voidaan tehdä, mutta `dist/` ei tarvitse olla pitkäkestoisesti levyllä.

---

### 🟠 KORKEA 2 — Firebase Web API -avaimen HTTP-referrer-rajoitus
**Tiedosto:** `.env` (`VITE_FIREBASE_API_KEY=<public Firebase Web API key>`)

Firebase Web API -avain on julkinen kaikille selaimessa (kuten kuuluukin), mutta sen turvallisuus riippuu Google Cloud Consolessa asetetuista HTTP-referrer-rajoituksista. Ilman rajoitusta kuka tahansa voi väärinkäyttää avainta Firebase-kvootan kuluttamiseen (DoS-vektori).

**Toimenpiteet (10 min):**
- Google Cloud Console → APIs & Services → Credentials → muokkaa avainta
- Application restrictions: **HTTP referrers** → salli `https://eerotuomenoksa.github.io/*` ja `https://aloitussivu-5d50c.web.app/*`
- API restrictions: salli vain Identity Toolkit API, Firestore API, Firebase Installations API, Token Service API, Firebase App Check API

---

### 🟡 KESKI 2 — Sähköpostipohjainen admin-tunnistus
**Tiedostot:** `firestore.rules` (rivit 5–11), `functions/ncscCron.ts`

Adminit tunnistetaan kahdella Gmail-osoitteella (`request.auth.token.email in [...]`). Jos jomman kumman tilin tunnukset vuotavat, hyökkääjä saa täydet admin-oikeudet Firestoreen (scam-alertit, hyväksytyt linkit, jne.).

**Toimenpiteet (2 t):**
- Pakota molemmille admin-tileille 2FA (Google-tilin asetus — ei koodimuutosta)
- Pidemmällä aikavälillä: siirry **Firebase Custom Claims** -pohjaiseen admin-merkintään (`request.auth.token.admin == true`)
- Lyhyessä juoksussa lisää `&& request.auth.token.email_verified == true` Firestore-sääntöihin

---

### 🟡 KESKI 4 — RSS-syötteiden HTML-dekoodaus `textarea.innerHTML`:llä
**Tiedosto:** `services/rssService.ts` (rivit 18–22)

```ts
const decodeText = (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value.trim();
};
```

Ei välitöntä XSS-riskiä (textarea-konteksti ei aja skriptejä), mutta tekniikka on hauras. RSS-sisältö tulee myös kahden ulkoisen proxyn (`api.rss2json.com`, `api.allorigins.win`) kautta.

**Toimenpiteet:**
- Korvaa `DOMParser` + `textContent`-pohjaisella purkuulla: `const el = new DOMParser().parseFromString(value, 'text/html'); return el.documentElement.textContent?.trim() ?? '';`
- Harkitse `allorigins.win`-fallbackin korvaamista omalla Cloud Functions -proxyllä

---

### 🟡 KESKI 5 — Nimipäivärajapinta testikäytössä, siirtyminen tiedostoon kesken
**Tiedosto:** `functions/nameday.ts`, `functions/.env`

Ei aktiivinen tuotantoriski, mutta `NAMEDAY_API_TOKEN` elää edelleen `.env`-tiedostossa ja `namedayToday`-funktio on deployattu.

**Toimenpiteet (kun siirtyminen tehdään):**
- Lisää `assets/namedays-YYYY.json` ja lataa selaimessa staattisena
- Poista `namedayToday`-export `functions/index.ts`:stä ja `functions/nameday.ts`
- Peruuta `NAMEDAY_API_TOKEN` nimipaivarajapinta.fi:n hallintapaneelista
- Poista `adminStats/namedayApi`-dokumentti Firestoresta
- Päivitä `ehdotukset.tsx`: poista "Nimipäivärajapinta"-kortti

---

### 🟢 MATALA 1 — Rate limit pelkän IP:n perusteella
**Tiedostot:** `functions/gemini.ts`, `functions/usage.ts`

Rate limiter käyttää `x-forwarded-for`:n ensimmäistä arvoa. Operaattori-NAT:n takaa tulevat käyttäjät jakavat saman IP:n.

**Suositus:** Yhdistelmäavain (IP + AppCheck-token-prefix) jakamiseen. Pienellä käyttäjämäärällä ei kriittinen.

---

### 🟢 MATALA 2 — `microphone=(self)` Permissions-Policy:ssä
**Tiedosto:** `firebase.json` rivi 27

```
Permissions-Policy: camera=(), microphone=(self), geolocation=(self)
```

`microphone=(self)` on tarpeellinen jos puhesyöte (`hooks/useSpeechInput.ts`) on käytössä. Jos mikrofoniominaisuus on aktiivinen, tämä on OK. Jos se poistetaan käytöstä, vaihda `microphone=()`.

---

### 🟢 MATALA 3 — `Math.random()` ID:iden luonnissa
**Tiedostot:** `components/LinkReportModal.tsx` rivi 71, `approvedLinks.ts` rivi 113

Ei käytännön tietoturvariskiä tässä käyttötapauksessa, mutta siistimpi vaihtoehto on `crypto.randomUUID()`.

---

### 🟢 MATALA 5 — Julkiset Firestore-kokoelmat ilman budjettihälytystä
**Tiedosto:** `firestore.rules`

`approvedLinks`, `blockedLinks`, `scamAlerts` ovat `allow read: if true`. Tarkoituksellinen julkinen sivusto, mutta kasvava käyttö kasvattaa Firestore-lukukustannuksia.

**Suositus:** Aseta Firebase-projektille budjettihälytys (5–10 €/kk). Harkitse CDN-välimuistia jos lukumäärät kasvavat.

---

### 🆕 HUOMIO — `img-src` on nyt hyvin tiukka
**Tiedosto:** `firebase.json` rivi 31

`img-src 'self' data: https://seniorsurf.fi` — jos sivusto näyttää favicon-kuvia ulkopuolisista linkeistä (esim. Google Favicon API), ne eivät enää lataudu. Tarkista selainkonsolista onko CSP-rikkomuksia.

---

## Vahvuudet (ennallaan)

✅ `.env`-tiedostot eivät ole git-historiassa (varmistettu)  
✅ **App Check pakollinen** molemmissa Cloud Functions -funktioissa (uusi 28.5.2026)  
✅ **CSP ilman `'unsafe-inline'`** `script-src`:ssä (uusi 28.5.2026)  
✅ HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy asianmukaisesti asetettu  
✅ `frame-ancestors 'none'` estää sivuston upottamisen iframeen  
✅ `rel="noopener noreferrer"` kaikissa ulkoisissa `target="_blank"`-linkeissä  
✅ Firestore-säännöt validoivat `linkReports`-dokumentin tyypin, koon ja statuksen  
✅ `ncscScrapeNow` vaatii Bearer-tokenin + admin-email-varmennuksen  
✅ CORS-origin-lista on whitelist eikä `*`  
✅ Frontend ei käytä `dangerouslySetInnerHTML`:ää  
✅ `linkReports`-validaatio rajoittaa kentät (url ≤500, name ≤160, note ≤1000 merkkiä)  
✅ `scripts/check-no-hardcoded-secrets.mjs` etsii automaattisesti salaisuuksia koodista  
✅ `gemini-2.5-flash` — vakaa malli, ei preview (uusi 28.5.2026)  
✅ OneDrive-synkronointi poistettu tältä työasemalta (uusi 28.5.2026)  

---

## Toimenpidesuositukset ympäristön mukaan

### 🖥️ Kehityspalvelin — tee ennen tuotantoonvientiä

Nämä ovat **koodimuutoksia** tai paikallisia tarkistuksia. Tehdään kehitysympäristössä, testataan, ja viedään tuotantoon normaalina deploymentina.

| # | Toimenpide | Prioriteetti | Arvioitu työmäärä |
|---|---|---|---|
| 1 | Vaihda nimipäivärajapinta tiedostoon, poista `namedayToday`-funktio + token | 🟡 KESKI | 1–2 t |
| 2 | Korvaa `textarea.innerHTML` RSS-dekoodauksessa DOMParser+textContent:lla | 🟡 KESKI | 30 min |
| 3 | Vaihda `Math.random()` → `crypto.randomUUID()` (`LinkReportModal.tsx`, `approvedLinks.ts`) | 🟢 | 10 min |
| 4 | Tarkista `img-src 'self' data: https://seniorsurf.fi` — latautuvatko favicon-kuvat oikein | 🟢 | 15 min |
| 5 | Tarkista käytetäänkö mikrofonia (`useSpeechInput.ts`) — jos ei, vaihda `Permissions-Policy`: `microphone=()` | 🟢 | 10 min |

---

### 🏭 Tuotantopalvelin — tee käyttöönoton yhteydessä

Nämä ovat **Google Cloud / Firebase Console -konfiguraatioita** tai salaisuuksien hallintaa. Ne koskevat tuotantoprojektia eikä niitä voi tai kannata tehdä kehitysympäristössä.

| # | Toimenpide | Prioriteetti | Arvioitu työmäärä | Huom |
|---|---|---|---|---|
| 1 | **Pyöräytä `GEMINI_API_KEY`** Google AI Studiossa/Cloud Consolessa — peruuta vanha, luo uusi | 🔴 KRIITT. | 10 min | Tee heti — avain on ollut altistuneena |
| 2 | **Pyöräytä `ADMIN_TRIGGER_SECRET`** — generoi uusi arvo, päivitä Functions-konfiguraatioon | 🔴 KRIITT. | 10 min | Tee heti — sama syy |
| 3 | Siirrä `GEMINI_API_KEY` ja `ADMIN_TRIGGER_SECRET` **Firebase Secret Manageriin** (`firebase functions:secrets:set`) | 🔴 KRIITT. | 20 min | Poistaa `.env`-tarpeen kokonaan |
| 4 | Rajoita `VITE_FIREBASE_API_KEY` **HTTP-refereriin** Google Cloud Consolessa (vain tuotantodomain + `*.web.app`) | 🟠 KORKEA | 10 min | Localhost-devaus ei rajoitu, vain tuotantoavain |
| 5 | Lisää `GEMINI_API_KEY`:lle **API-restriktio** Cloud Consolessa (vain `generativelanguage.googleapis.com`) | 🟠 KORKEA | 5 min | Samalla kun pyöräytät avaimen |
| 6 | Aseta **budjettihälytys** Firebase/Google Cloud Billingissä (esim. 10 €/kk) | 🟢 | 5 min | |
| 7 | Pakota **2FA** molemmille admin-tileille (Google-tilin asetus) | 🟡 KESKI | 5 min | Ei koodimuutosta |

---

### 🔀 Molemmat ympäristöt — kehitys ensin, sitten tuotantoon

Nämä vaativat sekä **koodimuutoksen** (kehitys) että **Firestore-sääntöjen deploymentin** (tuotanto).

| # | Toimenpide | Prioriteetti | Kehitysvaihe | Tuotantovaihe |
|---|---|---|---|---|
| 1 | Siirry **Custom Claims** -pohjaiseen adminiin (`request.auth.token.admin == true`) | 🟡 KESKI | Muuta `firestore.rules` ja admin-SDK-koodi | Deploy säännöt tuotantotietokantaan + aseta claim admin-käyttäjille |
| 2 | Lyhyt pikakorjaus: lisää `email_verified == true` -tarkistus nykyisiin Firestore-sääntöihin | 🟡 KESKI | 1 rivi `firestore.rules`:iin | `firebase deploy --only firestore:rules` |

---

## Muutoshistoria

| Päiväys | Muutos |
|---|---|
| 27.5.2026 | Ensimmäinen arvio — 6.5/10 |
| 28.5.2026 | App Check pakollinen molemmissa funktioissa (KORKEA 3, KESKI 1 ✅); CSP korjattu (KESKI 3 ✅); Gemini-malli päivitetty (MATALA 4 ✅); OneDrive-synkronointi poistettu. Uusi pisteet: **7.5/10**. Toimenpiteet jaotelttu kehitys- ja tuotantopalvelimen mukaan. |
