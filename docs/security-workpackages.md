# Security Workpackages for Codex
# SeniorSurf aloitussivu — tietoturvakorjaukset
# Tarkistuspvm: 2026-05-26
#
# KÄYTTÖ CODEXILLE:
# Jokainen työpaketti on itsenäinen tehtävä. Aloita aina SEC-01:stä.
# Jokainen paketti kertoo: mitä muutetaan, missä tiedostossa, miten testataan.

---

## SEC-01 · KRIITTINEN · Sirrä Gemini API-kutsu palvelinpuolelle

**Ongelma:** `VITE_API_KEY` on Vite-ympäristömuuttuja joka päätyy JavaScript-bundleen.
Kuka tahansa voi lukea sen selaimen DevTools → Network tai Sources -näkymästä.

**Tiedostot joita muutetaan:**
- `services/geminiService.ts` — poistetaan suora `import.meta.env.VITE_API_KEY` -käyttö
- `functions/index.ts` — lisätään uusi HTTP-funktio `geminiChat`
- `functions/ncscCron.ts` tai uusi `functions/gemini.ts` — toteutus
- `.env.example` — poistetaan `VITE_API_KEY`-rivi, lisätään ohje

**Mitä Codexin tulee tehdä:**

1. Luo uusi Firebase Cloud Function `geminiChat` tiedostoon `functions/gemini.ts`:
   ```typescript
   // functions/gemini.ts
   import { onRequest } from 'firebase-functions/v2/https';
   import { GoogleGenAI } from '@google/genai';

   export const geminiChat = onRequest(
     { region: 'europe-west1', memory: '256MiB', timeoutSeconds: 60, cors: true, invoker: 'public' },
     async (req, res) => {
       if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }
       const { prompt, history } = req.body as { prompt: string; history: { role: string; content: string }[] };
       if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
         res.status(400).json({ error: 'Invalid prompt' }); return;
       }
       const apiKey = process.env.GEMINI_API_KEY;
       if (!apiKey) { res.status(500).json({ error: 'Not configured' }); return; }
       const ai = new GoogleGenAI({ apiKey });
       // ... sama logiikka kuin nykyisessä geminiService.ts:ssä
       // palauttaa: res.json({ text: response.text })
     }
   );
   ```

2. Vientaa `geminiChat` tiedostosta `functions/index.ts`.

3. Muuta `services/geminiService.ts` kutsumaan Cloud Functionia suoran API-kutsun sijaan:
   ```typescript
   // Vanha: const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
   // Uusi:
   const url = `https://europe-west1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/geminiChat`;
   const response = await fetch(url, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ prompt, history }),
   });
   const data = await response.json();
   return data.text ?? 'Pahoittelut, virhe.';
   ```

4. Poista `VITE_API_KEY` kaikista tiedostoista:
   - `.env` — poista rivi `VITE_API_KEY=...`
   - `.env.example` — poista `VITE_API_KEY`-rivi
   - `services/geminiService.ts` — poista kaikki `import.meta.env.VITE_API_KEY` -viittaukset
   - `deploy.yml` — varmista ettei `VITE_API_KEY` ole env-lohkossa

5. Varmista että `functions/.env` sisältää `GEMINI_API_KEY=<arvo>` (ei muuteta tähän).

**Testaustapa:**
```bash
npm run build 2>&1 | grep -i "VITE_API_KEY"
# Ei saa tulostaa mitaan

grep -r "VITE_API_KEY" --include="*.ts" --include="*.tsx" --include="*.js"
# Ei saa tulostaa mitaan

grep -r "import.meta.env.VITE_API_KEY" .
# Ei saa tulostaa mitaan
```

**Hyväksymiskriteerit:**
- [ ] `grep -r "VITE_API_KEY" src/ services/ components/` ei löydä mitään
- [ ] `dist/` -hakemistossa ei ole merkkijonoa `AIzaSy` (Gemini-avaimen alku)
- [ ] Tekoälyavustaja toimii kehitysympäristössä Cloud Functionin kautta

---

## SEC-02 · KRIITTINEN · Poista VITE_ADMIN_TRIGGER_SECRET frontendistä

**Ongelma:** `VITE_ADMIN_TRIGGER_SECRET` päätyy bundleen. `ncscScrapeNow`-funktion
salaussuojaus on näennäinen koska secret on julkinen kaikille sivuston kävijöille.

**Tiedostot joita muutetaan:**
- `scamAlerts.ts` — `runNcscScrapeNow`-funktio
- `functions/ncscCron.ts` — `ncscScrapeNow`-funktion autentikointi
- `.env.example` — päivitys
- `deploy.yml` — `VITE_ADMIN_TRIGGER_SECRET` pois

**Mitä Codexin tulee tehdä:**

1. Muuta `functions/ncscCron.ts` tarkistamaan Firebase Auth ID token secretin sijaan:
   ```typescript
   // ncscCron.ts — uusi autentikointilogiikka
   import { getAuth } from 'firebase-admin/auth';

   export const ncscScrapeNow = onRequest(
     { region: 'europe-west1', memory: '256MiB', timeoutSeconds: 120, cors: true, invoker: 'public' },
     async (req, res) => {
       const authHeader = req.headers.authorization ?? '';
       const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
       if (!idToken) { res.status(401).json({ error: 'Unauthorized' }); return; }
       try {
         const decoded = await getAuth().verifyIdToken(idToken);
         const adminEmails = ['eero.tuomenoksa@gmail.com', 'seniorsurf.suomi@gmail.com'];
         if (!adminEmails.includes(decoded.email ?? '')) {
           res.status(403).json({ error: 'Forbidden' }); return;
         }
       } catch {
         res.status(401).json({ error: 'Invalid token' }); return;
       }
       const result = await runNcscScrapeJob();
       res.status(200).json(result);
     }
   );
   ```

2. Muuta `scamAlerts.ts` lähettämään Firebase ID token Authorizaion-otsikossa:
   ```typescript
   // scamAlerts.ts — runNcscScrapeNow
   import { getAuth } from 'firebase/auth';

   export const runNcscScrapeNow = async () => {
     const auth = getAuth();
     const user = auth.currentUser;
     if (!user) throw new Error('Ei kirjautunut.');
     const idToken = await user.getIdToken();
     const url = getNcscScrapeNowUrl();
     const response = await fetch(url, {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${idToken}` },
     });
     // ... sama virheenkäsittely kuin ennen
   };
   ```

3. Poista `VITE_ADMIN_TRIGGER_SECRET` ja `ADMIN_TRIGGER_SECRET` kaikista frontend-tiedostoista:
   - `.env` — poista molemmat rivit
   - `.env.example` — poista `VITE_ADMIN_TRIGGER_SECRET`-rivi
   - `scamAlerts.ts` — poista `import.meta.env.VITE_ADMIN_TRIGGER_SECRET` -viittaukset
   - `deploy.yml` — poista `VITE_ADMIN_TRIGGER_SECRET: ${{ secrets.VITE_ADMIN_TRIGGER_SECRET }}`

4. Pidä `ADMIN_TRIGGER_SECRET` `functions/.env`-tiedostossa jos halutaan pitää fallback-tarkistus funktioissa.

**Testaustapa:**
```bash
grep -r "VITE_ADMIN_TRIGGER_SECRET" --include="*.ts" --include="*.tsx" --include="*.yml" .
# Ei saa tulostaa mitaan

grep -r "ADMIN_TRIGGER_SECRET" --include="*.ts" --include="*.tsx" .
# Ei saa tulostaa mitaan (functions/ -hakemisto ok)
```

**Hyväksymiskriteerit:**
- [ ] `grep -r "VITE_ADMIN_TRIGGER_SECRET" .` ei löydä mitään (paitsi functions/.env)
- [ ] `dist/` -hakemistossa ei ole merkkijonoa `ADMIN_TRIGGER_SECRET`
- [ ] "Aja nyt" -painike toimii admin-kirjautumisen jälkeen
- [ ] Ilman kirjautumista Cloud Function palauttaa 401

---

## SEC-03 · KRIITTINEN · Vaihda paljastuneet avainarvot uusiin

**Ongelma:** Avainarvot ovat olleet paikallisessa `.env`-tiedostossa josta ne saattoivat
paljastua. Vaikka git-historiassa ei ole löydöksiä, avainten vaihto on hyvä käytäntö
aina kun ne ovat paljastuneet edes paikallisesti.

**TÄMÄ EI OLE CODEX-TEHTÄVÄ — tee manuaalisesti:**

1. **Gemini API-avain** (`AIzaSyCq...`):
   - Avaa https://aistudio.google.com/apikey
   - Poista vanha avain, luo uusi
   - Päivitä `functions/.env` → `GEMINI_API_KEY=<uusi>`

2. **Firebase API-avain** (`AIzaSyBS...`):
   - Firebase Console → Project Settings → Web app → API key
   - Firebase API-avaimet voi rajata Google Cloud Console → APIs & Services → Credentials
   - Lisää HTTP referrer -rajoitus: `https://tuotantodomain.fi/*`

3. **Nimipäivä-API token** (`ndt_f3ee...`):
   - Kirjaudu nimipaiva.fi-palveluun ja generoi uusi token
   - Päivitä `functions/.env` → `NAMEDAY_API_TOKEN=<uusi>`

4. **ADMIN_TRIGGER_SECRET** — voidaan poistaa SEC-02 jälkeen kokonaan.

**Codex-osuus (automatisoi tarkistus):**

Lisää `scripts/check-no-hardcoded-secrets.mjs`:
```javascript
// scripts/check-no-hardcoded-secrets.mjs
import { execSync } from 'child_process';

const patterns = [
  'AIzaSy',           // Google/Firebase/Gemini API keys
  'AAAA[A-Za-z0-9]', // FCM server keys
  'ndt_',             // Nimipaiva API tokens
  'sWM3AT',           // tunnistettava secret-prefix
];

let found = false;
for (const pattern of patterns) {
  try {
    const result = execSync(
      `grep -rn "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.html" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=functions .`,
      { encoding: 'utf8' }
    );
    if (result.trim()) {
      console.error(`VIRHE: Kovakoodattu arvo löydetty (pattern: ${pattern}):`);
      console.error(result);
      found = true;
    }
  } catch {
    // grep palauttaa exit 1 kun ei löydä — se on ok
  }
}

if (found) process.exit(1);
console.log('OK: Kovakoodattuja avaimia ei löydetty.');
```

Lisää `package.json` scripts-osioon:
```json
"check:secrets": "node scripts/check-no-hardcoded-secrets.mjs"
```

Lisää `deploy.yml` build-stepin jälkeen:
```yaml
- name: Check no hardcoded secrets
  run: npm run check:secrets
```

**Hyväksymiskriteerit:**
- [ ] `npm run check:secrets` ajaa onnistuneesti
- [ ] `deploy.yml` sisältää `check:secrets` -askeleen
- [ ] Vanhat avainarvot eivät esiinny missään lähdekooditiedostossa

---

## SEC-04 · MERKITTÄVÄ · Rajaa CORS tuotantodomainin mukaan

**Ongelma:** `functions/ncscCron.ts` käyttää `cors: true` joka sallii kutsut mistä tahansa.

**Tiedostot joita muutetaan:**
- `functions/ncscCron.ts`
- `functions/gemini.ts` (uusi SEC-01:stä)

**Mitä Codexin tulee tehdä:**

1. Muuta `ncscCron.ts`:
   ```typescript
   // Vanha:
   cors: true,
   // Uusi (aseta oikea domain kun tiedossa):
   cors: ['https://seniorsurfin.fi', 'https://www.seniorsurfin.fi'],
   ```

2. Muuta vastaavasti `gemini.ts` (luodaan SEC-01:ssä).

3. Lisää `functions/.env`-tiedostoon (ja `functions/index.ts` -lukemaan):
   ```
   ALLOWED_ORIGIN=https://seniorsurfin.fi
   ```

**Huom:** Tee tämä vasta kun CloudCity-domain on vahvistettu.
Väliaikaisesti voi pitää `cors: ['https://eerotuomenoksa.github.io', 'http://localhost:5173']`.

**Hyväksymiskriteerit:**
- [ ] `cors: true` ei esiinny missään `functions/` -tiedostossa
- [ ] CORS-lista sisältää vain tunnistettuja domaineja
- [ ] Funktio palauttaa 403 kun kutsutaan tuntemattomasta domainista (tarkista curl-komennolla)

---

## SEC-05 · MERKITTÄVÄ · Tiukenna Firestore-säännöt

**Ongelma A:** `scamAlerts`-kokoelman `onlyTogglesVisibility()` sallii kenet tahansa
kirjautuneen Google-käyttäjän piilottaa huijausvaroituksia asettamalla `active=false`.

**Ongelma B:** `linkReports`-kokoelman `onlyReviewsLinkReport()` sallii kenet tahansa
kirjautuneen merkitä raportteja `approved`/`rejected`.

**Tiedostot joita muutetaan:**
- `firestore.rules`

**Mitä Codexin tulee tehdä:**

Muuta `firestore.rules` seuraavilla korjauksilla:

```javascript
// VANHA — scamAlerts:
match /scamAlerts/{alertId} {
  allow read: if true;
  allow create, delete: if isAdmin();
  allow update: if isAdmin() || (request.auth != null && onlyTogglesVisibility());
  //                             ^^^ POISTA tämä — vain adminin pitää voida muuttaa
}

// UUSI — scamAlerts:
match /scamAlerts/{alertId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}

// VANHA — linkReports:
match /linkReports/{reportId} {
  allow create: if isValidReport();
  allow read, delete: if isAdmin();
  allow update: if isAdmin() || (request.auth != null && onlyReviewsLinkReport());
  //                             ^^^ POISTA tämä
}

// UUSI — linkReports:
match /linkReports/{reportId} {
  allow create: if isValidReport();
  allow read, delete: if isAdmin();
  allow update: if isAdmin();
}
```

**Poista myös** käyttämättömäksi jäävä `onlyTogglesVisibility()` ja `onlyReviewsLinkReport()`
-funktiomäärittely jos niitä ei enää käytetä.

**Testaustapa:**
```bash
# Asenna firebase-tools jos ei ole
npm install -g firebase-tools

# Aja Firestore-sääntöjen yksikkötestit
firebase emulators:exec --only firestore "npm test"
```

**Hyväksymiskriteerit:**
- [ ] `firestore.rules` ei sisällä `onlyTogglesVisibility` -viittauksia `scamAlerts`-osiossa
- [ ] `firestore.rules` ei sisällä `onlyReviewsLinkReport` -viittauksia `linkReports`-osiossa
- [ ] `firebase deploy --only firestore:rules` onnistuu ilman virheitä

---

## SEC-06 · HUOMIO · Lisää HTTP-suojausotsikot palvelinkonfiguraatioon

**Ongelma:** Content-Security-Policy, HSTS ja muut suojausotsikot puuttuvat.

**Tiedostot joita muutetaan:**
- `firebase.json` (GitHub Pages → Firebase Hosting siirtymässä)
- TAI CloudCityn nginx/palvelinkonfiguraatio

**Mitä Codexin tulee tehdä:**

Lisää `firebase.json` hosting-osioon:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "X-Frame-Options",
            "value": "SAMEORIGIN"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "camera=(), microphone=(self), geolocation=(self)"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net https://europe-west1-aloitussivu-5d50c.cloudfunctions.net; frame-ancestors 'none'"
          }
        ]
      }
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

**Huom CSP:** `unsafe-inline` on pakollinen koska Tailwind/Vite injektoi inline-tyylejä.
Pitkällä tähtäimellä kannattaa siirtyä nonce-pohjaiseen CSP:hen kun mahdollista.

**Hyväksymiskriteerit:**
- [ ] `curl -I https://tuotantodomain.fi` palauttaa `Strict-Transport-Security`-otsikon
- [ ] `curl -I https://tuotantodomain.fi` palauttaa `Content-Security-Policy`-otsikon
- [ ] `curl -I https://tuotantodomain.fi` palauttaa `X-Frame-Options: SAMEORIGIN`
- [ ] Sivusto toimii normaalisti otsikkojen kanssa (ei blokkauksia konsolissa)

---

## SEC-07 · HUOMIO · Lisää robots.txt ylläpitosivujen suojaamiseksi

**Ongelma:** Ylläpitosivut (`yllapito.html`, `ehdotukset.html`) ovat hakukoneiden
indeksoitavissa ja julkisesti löydettävissä.

**Tiedostot joita muutetaan / luodaan:**
- `public/robots.txt` (tai `robots.txt` juuressa jos Vite kopioi sen)
- `vite.config.ts` — varmista että `public/`-hakemiston tiedostot kopioituvat

**Mitä Codexin tulee tehdä:**

1. Luo tiedosto `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /yllapito.html
Disallow: /ehdotukset.html
Disallow: /linkit.html
Disallow: /muutosloki.html

Sitemap: https://tuotantodomain.fi/sitemap.xml
```

2. Tarkista `vite.config.ts` että `publicDir` on asetettu oikein (oletuksena `public/` kopioidaan `dist/` -hakemistoon automaattisesti).

3. Lisää `index.html` head-osioon:
```html
<meta name="robots" content="index, follow">
```

Ja ylläpitosivujen HTML-tiedostoihin (`yllapito.html`, `ehdotukset.html`, `linkit.html`):
```html
<meta name="robots" content="noindex, nofollow">
```

**Hyväksymiskriteerit:**
- [ ] `dist/robots.txt` löytyy buildin jälkeen
- [ ] `robots.txt` sisältää `Disallow: /yllapito.html`
- [ ] `yllapito.html` sisältää `<meta name="robots" content="noindex, nofollow">`

---

## SEC-08 · HUOMIO · Lisää functions/.env eksplisiittisesti .gitignore-tiedostoon

**Ongelma:** `.gitignore` sisältää `.env` mutta ei `functions/.env` erikseen.

**Tiedostot joita muutetaan:**
- `.gitignore`

**Mitä Codexin tulee tehdä:**

Lisää `.gitignore`-tiedostoon seuraavat rivit `.env`-rivin alle:
```
.env
functions/.env
functions/.env.local
```

Tarkista myös ettei `functions/.env` vahingossa ole jo versionhallinnassa:
```bash
git ls-files functions/.env
# Ei saa tulostaa mitaan
```

**Hyväksymiskriteerit:**
- [ ] `.gitignore` sisältää rivin `functions/.env`
- [ ] `git ls-files functions/.env` ei tulosta mitään
- [ ] `git status` ei näytä `functions/.env`-tiedostoa

---

## SEC-09 · HUOMIO · Siivoa lokitiedostot reposta

**Ongelma:** `dev-server.out.log`, `devserver.out.log`, `devserver.err.log` jms. ovat repossa.

**Tiedostot joita muutetaan:**
- `.gitignore`
- Poistetaan olemassa olevat .log -tiedostot

**Mitä Codexin tulee tehdä:**

1. Lisää `.gitignore`-tiedostoon:
```
*.log
*.err.log
*.out.log
dev-server.*
devserver.*
```

2. Poista olemassa olevat lokitiedostot git-seurannasta:
```bash
git rm --cached dev-server.out.log dev-server.err.log devserver.out.log devserver.err.log 2>/dev/null || true
git rm --cached .vite-dev.log .vite-dev.out.log .vite-dev.err.log 2>/dev/null || true
```

3. Commitoi muutokset:
```bash
git add .gitignore
git commit -m "sec: lisätty lokitiedostot .gitignore-tiedostoon"
```

**Hyväksymiskriteerit:**
- [ ] `.gitignore` sisältää `*.log`-säännön
- [ ] `git ls-files *.log` ei tulosta mitään
- [ ] `git status` ei näytä .log-tiedostoja muutoksina

---

## Tarkistuslista — kaikki paketit tehty

```
[ ] SEC-01: Gemini API-kutsu palvelinpuolelle ✓
[ ] SEC-02: VITE_ADMIN_TRIGGER_SECRET poistettu ✓
[ ] SEC-03: Avainarvot vaihdettu (manuaalinen) ✓
[ ] SEC-04: CORS rajattu tuotantodomainin mukaan ✓
[ ] SEC-05: Firestore-säännöt tiukennettu ✓
[ ] SEC-06: HTTP-suojausotsikot lisätty ✓
[ ] SEC-07: robots.txt lisätty ✓
[ ] SEC-08: functions/.env .gitignore-tiedostoon ✓
[ ] SEC-09: Lokitiedostot siivottu ✓

Loppuvarmistus:
[ ] npm run build onnistuu ilman virheitä
[ ] npm run check:secrets ei löydä kovakoodattuja avaimia
[ ] firebase deploy --only firestore:rules onnistuu
[ ] Kaikki toiminnot testattu kehitysympäristössä
```
