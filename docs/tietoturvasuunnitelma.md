# SeniorSurf – Tietoturvasuunnitelma

**Versio:** 2.0  
**Päivitetty:** 2026-06-12  
**Lähde:** AI-avusteinen koodikatselmus + Codexin tietoturva-arviot 2026-05-26 – 2026-06-12  
**Pisteytys (viimeisin arvio 28.5.2026):** **7.5 / 10** ↑ (aiemmin 6.5/10)

---

## Tiivistelmä

SeniorSurf on Suomen ikääntyneille suunnattu aloitussivu, jossa on yli 3 000 linkkiä ja yli 1 000 domeenia. Kohderyhmä on erityisen haavoittuvainen huijaussivustoille. Tietoturvatyötä on tehty aktiivisesti keväällä 2026: Codex on toteuttanut merkittävän osan kriittisistä korjauksista. Tämä dokumentti on ajantasainen kokonaiskuva.

---

## MITÄ CODEX ON JO TOTEUTTANUT ✅

### Salaisuuksien hallinta ja autentikointi
- ✅ Gemini API -avain siirretty frontendistä Cloud Functioniin (`SEC-01`)
- ✅ `VITE_ADMIN_TRIGGER_SECRET` poistettu frontendistä, autentikointi Bearer-tokenilla (`SEC-02`)
- ✅ `check-no-hardcoded-secrets.mjs` -skripti + `npm run check:secrets` (`SEC-03`)
- ✅ `functions/.env` lisätty `.gitignore`-tiedostoon (`SEC-08`)
- ✅ Lokitiedostot siivottu reposta (`SEC-09`)

### Firebase App Check
- ✅ App Check **pakollinen** `geminiChat`-funktiossa – ei enää `GEMINI_REQUIRE_APP_CHECK`-opt-in (`SEC-004`)
- ✅ App Check lisätty myös `trackUsage`-funktioon – hiljainen hylkäys ilman tokenia (`SEC-005`)

### HTTP-suojausotsikot (`firebase.json`)
- ✅ Content Security Policy ilman `'unsafe-inline'` `script-src`:ssä (`SEC-006 / KESKI-3`)
- ✅ `connect-src` tarkennettu listamuotoon – ei enää `*.googleapis.com` (`SEC-007`)
- ✅ `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS (`SEC-06`)
- ✅ `frame-ancestors 'none'` – estää iframe-upotuksen (`SEC-06`)
- ✅ `Permissions-Policy` asetettu (`SEC-08`)

### Firestore-säännöt
- ✅ `scamAlerts`: poistettu kirjautuneiden käyttäjien update-oikeus (`SEC-05`)
- ✅ `linkReports`: vain admin voi päivittää (`SEC-05`)
- ✅ `adminStats`, `ncscScrapeLog`, `usageStats`: admin-only luku (`JATKO-05`)
- ✅ Syötteiden validointi kenttätasolla (tyyppi, koko, status) on paikallaan

### CORS ja verkko
- ✅ CORS whitelist-pohjainen – ei `cors: true` (`SEC-04`)
- ✅ `rel="noopener noreferrer"` ulkoisissa linkeissä
- ✅ Google-haun `window.open` korjattu `noopener,noreferrer`-optioilla (`JATKO-07`)

### Koodin siisteys
- ✅ `Math.random()` → `crypto.randomUUID()` ID-generaatiossa (`SEC-012`)
- ✅ `rssService.ts` `innerHTML`-pohjainen HTML-purkaminen korvattu (`SEC-013`)
- ✅ Gemini-malli päivitetty: `gemini-2.5-flash` (vakaa versio) (`SEC-014 / MATALA-4`)

### Linkkien turvallisuustarkistus (merkittävä päivitys)
- ✅ `scripts/update-links.mjs` tuottaa **riskipisteet** jokaiselle linkille
- ✅ Raportti sisältää: alkuperäinen domain, lopullinen domain, domainin vaihto, RDAP-signaali, sisältösignaali, sivun otsikko, riskipisteet, suositeltava toimenpide
- ✅ Linkit piilotetaan suosituksen `piilota` perusteella – ei vain HTTP-statuksen
- ✅ `docs/linkit-manuaalinen-tarkistus.csv` – manuaalinen tarkistusjono riskijärjestyksessä
- ✅ `verifiedLinks.ts` – versionhallittu manuaalisen varmennuksen rekisteri

### Hakukoneet ja robots
- ✅ `robots.txt` lisätty, ylläpitosivuille `noindex` (`SEC-07`)

---

## AVOIMET LÖYDÖKSET – TOIMENPITEET TARVITAAN

### 🔴 KRIITTINEN: Tuotantosalaisuudet paikallisessa `functions/.env`-tiedostossa

**Tiedosto:** `c:\dev\Aloitussivu\functions\.env`

Tiedosto sisältää aktiivisia tuotantosalaisuuksia selkokielisenä (GEMINI_API_KEY, ADMIN_TRIGGER_SECRET). OneDrive-synkronointi on poistettu tältä koneelta, mutta avaimet ovat silti paikallisella levyllä selkokielisenä. Avaimet voivat olla paljastuneita aiemmalta OneDrive-ajalta.

**Toimenpiteet (tee heti, ~40 min):**

| # | Toimenpide | Missä | Aika |
|---|---|---|---|
| 1 | Pyöräytä `GEMINI_API_KEY` | Google AI Studio / Cloud Console | 10 min |
| 2 | Generoi uusi `ADMIN_TRIGGER_SECRET` (`openssl rand -base64 32`) | Terminaali | 2 min |
| 3 | Siirrä molemmat Firebase Secret Manageriin: `firebase functions:secrets:set GEMINI_API_KEY` | Terminaali | 10 min |
| 4 | Lisää `GEMINI_API_KEY`:lle API-restriktio: vain `generativelanguage.googleapis.com` | Cloud Console | 5 min |
| 5 | Päivitä `functions/gemini.ts` käyttämään `defineSecret()` `process.env`:n sijaan | Koodi | 15 min |

---

### 🟠 KORKEA: Firebase Web API -avaimen HTTP-referrer-rajoitus puuttuu

**Ongelma:** `VITE_FIREBASE_API_KEY` on julkinen selaimessa (tarkoituksella), mutta ilman referrer-rajoitusta kuka tahansa voi kuluttaa Firebase-kvootan → DoS-vektori.

**Toimenpide (10 min, Google Cloud Console):**
1. APIs & Services → Credentials → muokkaa Firebase Web API -avainta
2. Application restrictions: **HTTP referrers**
3. Salli: `https://eerotuomenoksa.github.io/*`, `https://aloitussivu-5d50c.web.app/*`, `http://localhost:5173/*`
4. API restrictions: Identity Toolkit API, Cloud Firestore API, Firebase Installations API, Token Service API, Firebase App Check API

---

### 🟡 TÄRKEÄ: In-memory rate limiting nollautuu cold startilla

**Tiedosto:** `functions/gemini.ts` – `rateLimitBuckets = new Map()`

Jokainen Cloud Functions -instanssi pitää omaa laskuriaan. Cold start nollaa sen. Haitallinen toimija voi ohittaa rajoituksen odottamalla tai käyttämällä useita pyyntöjä eri instansseista.

**Ratkaisu:** Korvaa Firestore-transaktiolla:
```typescript
// functions/rateLimiter.ts
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const checkRateLimit = async (key: string, maxReq: number, windowMs: number): Promise<boolean> => {
  const db = getFirestore();
  const ref = db.collection('rateLimits').doc(key.replace(/[^a-zA-Z0-9-_]/g, '_'));
  const now = Date.now();

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data();

    if (!data || data.resetAt.toMillis() <= now) {
      tx.set(ref, { count: 1, resetAt: new Date(now + windowMs) });
      return false;
    }
    if (data.count >= maxReq) return true;
    tx.update(ref, { count: FieldValue.increment(1) });
    return false;
  });
};
```

Lisää Firestore-sääntöihin:
```
match /rateLimits/{key} {
  allow read, write: if false; // vain Cloud Functions
}
```

---

### 🟡 TÄRKEÄ: Admin-tunnistus hajautettu kolmeen paikkaan

**Ongelma:** Admin-sähköpostit (`eero.tuomenoksa@gmail.com`, `seniorsurf.suomi@gmail.com`) ovat kovakoodattuina `firestore.rules`-, `functions/ncscCron.ts`- ja `firebaseClient.ts`-tiedostoissa. Ylläpitäjän vaihto vaatii muutoksia kolmeen paikkaan.

**Ratkaisu – Firebase Custom Claims:**
```typescript
// Aseta kerran Admin SDK:lla:
await admin.auth().setCustomUserClaims(uid, { admin: true });

// firestore.rules:
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

// functions/ncscCron.ts:
const decoded = await getAdminAuth().verifyIdToken(idToken);
if (decoded.admin !== true) { res.status(403).json({ error: 'Forbidden' }); return; }
```

**Muista:** Kirjaudu admin-tilillä uudelleen sisään Custom Claims -muutoksen jälkeen (token päivittyy).

---

### 🟡 TÄRKEÄ: `feedbackItems`-kokoelma on julkisesti luettavissa

**Tiedosto:** `firestore.rules`
```
match /feedbackItems/{feedbackId} {
  allow read: if true;  // ← kaikki voivat lukea käyttäjäpalautteen
```

**Korjaus:**
```
match /feedbackItems/{feedbackId} {
  allow read: if isAdmin();
  allow create: if isValidFeedbackCreate();
  allow update, delete: if isAdmin();
}
```

---

### 🟡 TÄRKEÄ: Nimipäivärajapinta – token ja Cloud Function käytössä turhaan

**Ongelma:** `NAMEDAY_API_TOKEN` elää `functions/.env`-tiedostossa. Nimipäivät voidaan toimittaa staattisena JSON-tiedostona ilman ulkoista riippuvuutta.

**Toimenpide (SEC-015):**
1. Hanki nimipäivätiedosto ja tallenna `assets/namedays-YYYY.json`
2. Poista `namedayToday`-funktio `functions/index.ts`:stä
3. Päivitä `services/nameDayService.ts` käyttämään staattista JSON-tuontia
4. Peruuta `NAMEDAY_API_TOKEN` nimipaivarajapinta.fi:ssä
5. Poista `adminStats/namedayApi`-dokumentti Firestoresta

---

### 🟡 TÄRKEÄ: CORS-fallback sallii localhost tuotannossa

**Tiedosto:** `functions/cors.ts`

`DEFAULT_ALLOWED_ORIGINS` sisältää `http://localhost:5173`. Jos `ALLOWED_ORIGINS`-ympäristömuuttujaa ei ole asetettu tuotannossa, localhost on sallittu.

**Korjaus:**
```typescript
export const getAllowedOrigins = () => {
  const configured = process.env.ALLOWED_ORIGINS ?? '';
  const origins = configured.split(',').map((o) => o.trim()).filter(Boolean);
  if (origins.length > 0) return origins;

  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }
  throw new Error('ALLOWED_ORIGINS puuttuu tuotantoympäristöstä');
};
```

---

### 🟡 TÄRKEÄ: Safe Browsing -integraatio ei vielä käytössä

**Ongelma:** Nykyinen linkkitarkistus (vaikka huomattavasti parantunut) ei havaitse phishing- ja haittasivustoja, joiden DNS toimii normaalisti.

**Suunnitelma:** Katso `docs/codex-safe-browsing.md` – yksityiskohtainen Codex-tehtävä toteutukselle.

**Lyhyt versio:**
1. Luo API-avain: [console.cloud.google.com](https://console.cloud.google.com) → Safe Browsing API
2. Tallenna: `firebase functions:secrets:set SAFE_BROWSING_API_KEY`
3. Codex toteuttaa `functions/safeBrowsing.ts` ja integroi `update-links.mjs`:iin

---

## KEHITYSKOHTEET – pidemmällä aikavälillä 🟢

### K1: Manuaalisen varmennuksen ylläpitokäyttöliittymä

`docs/linkit-manuaalinen-tarkistus.csv` on olemassa, mutta ylläpitäjä muokkaa tällä hetkellä `verifiedLinks.ts`-tiedostoa suoraan. Parempi olisi ylläpitopaneelin natiivi UI-toiminto: tarkastusjonon näyttö, "Varmenna"/"Piilota"-napit, perustelukenttä.

### K2: Domain-vanhenemisen seuranta

Havaitsee jos linkattu domain on ostettavissa (vanhentunut) → kaappausriski. Toteuta viikoittainen Cloud Function, joka tarkistaa RDAP/WHOIS-tiedot kriittisille domaineille.

### K3: Ulkoisille linkeille varoitusdialogi (harkittava)

Ikääntyneille käyttäjille erityisen tärkeää tietää, milloin poistutaan "turvallisesta" ympäristöstä. Kevyt interstitial tai visuaalinen merkintä uusille/tarkistamattomille linkeille.

### K4: Admin-paneeliin turvallisuuskojelauta

- Viimeisten 7 päivän linkkiraportit
- Piilotettujen linkkien trendi
- NCSC-hälytykset ja niiden tila
- Rate limit -ylitykset

### K5: Budjettihälytys Firebase / Google Cloud -projektille

Avoimet endpointit ovat potentiaalinen kustannusvektori. Aseta 10 €/kk -hälytys Cloud Billing -näkymässä.

### K6: 2FA admin-tileille

Pakota molemmille admin-tileille Google-tilin 2FA (Authenticator-appilla tai hardware-avaimella, **ei SMS:llä**). Ei koodimuutosta – pelkkä Google-tilin asetus.

### K7: Subresource Integrity (SRI) ulkoisille skripteille

Jos tulevaisuudessa ladataan skriptejä CDN:stä, lisää SRI-tiivisteet:
```html
<script src="https://..." integrity="sha384-[tiiviste]" crossorigin="anonymous"></script>
```

---

## Linkkiturvallisuuden kokonaisarkkitehtuuri (nykytila + tavoite)

```
Linkin elinkaari SeniorSurfissa:

[Lisäys koodiin]
  └─ update-links.mjs
       ├─ URL-rakenne + protokolla
       ├─ DNS-resoluutio + yksityiset IP:t
       ├─ HTTP/HTTPS-tarkistus koko polkuun
       ├─ Uudelleenohjaukset + domainin muutos
       ├─ RDAP/WHOIS-signaali
       ├─ Sivun otsikko/sisältö vs. odotettu organisaatio
       ├─ Riskipisteytys → suositeltava toimenpide
       ├─ [TULOSSA] Google Safe Browsing v4 → phishing/malware
       └─ Tuottaa: linkHealth.ts (piilotetut), linkit-manuaalinen-tarkistus.csv

[Manuaalinen varmennus]
  └─ verifiedLinks.ts
       ├─ Tarkistaja käy läpi manuaalisen jonon
       ├─ Luottamustasot A–E
       └─ [TULOSSA] Ylläpitokäyttöliittymä

[Reaaliaikainen seuranta]
  └─ scamAlerts (NCSC-integraatio) ← jo käytössä ✅
  └─ Käyttäjäraportit (linkReports) ← jo käytössä ✅
  └─ [TULOSSA] Admin-kojelauta

[Infrastruktuuri]
  └─ Firebase App Check ← pakollinen ✅
  └─ Firestore-säännöt ← tiukat ✅
  └─ CSP-otsikot ← asetettu ✅
  └─ Rate limiting ← [PARANNETTAVA: in-memory → Firestore]
```

---

## Toimenpideaikataulu

| Viikko | Tehtävä | Prioriteetti |
|---|---|---|
| **Heti** | Pyöräytä GEMINI_API_KEY + ADMIN_TRIGGER_SECRET, siirrä Secret Manageriin | 🔴 |
| **Heti** | Firebase Web API -avaimen HTTP-referrer-rajoitus | 🟠 |
| **1** | `feedbackItems` lukuoikeus admin-only | 🟡 |
| **1** | CORS localhost-fallback pois tuotannosta | 🟡 |
| **2** | Firestore-pohjainen rate limiting | 🟡 |
| **2** | Safe Browsing -integraatio (katso `codex-safe-browsing.md`) | 🟡 |
| **3** | Custom Claims ylläpitäjähallintaan | 🟡 |
| **3** | Nimipäivärajapinnan poisto (SEC-015) | 🟡 |
| **4–8** | Domain-vanhenemisen seuranta, admin-kojelauta, manuaalisen varmennuksen UI | 🟢 |

---

## Pisteytyshistoria

| Päiväys | Pisteet | Merkittävät muutokset |
|---|---|---|
| 2026-05-26 | 6.0/10 | Lähtöpiste, ensimmäinen katselmus |
| 2026-05-27 | 6.5/10 | Ensimmäiset korjaukset |
| 2026-05-28 | **7.5/10** | App Check pakollinen, CSP korjattu, Gemini-malli päivitetty |
| 2026-06-12 | ~7.5/10 | Linkkitarkistus merkittävästi parantunut, mutta kriittiset salaisuuskysymykset auki |

**Tavoite:** 9.0/10 kun kriittiset toimenpiteet, Safe Browsing ja Custom Claims on toteutettu.

---

*Suunnitelma perustuu koodianalyysiin ja Codexin tietoturva-arvioihin 2026-05-26 – 2026-06-12.  
Päivitä tätä dokumenttia aina kun toimenpiteitä toteutetaan.*
