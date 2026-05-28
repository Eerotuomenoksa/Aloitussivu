# Codex-toimenpidelista — Tietoturvakorjaukset

**Lähde:** `docs/tietoturva-arvio-2026-05-27.md`
**Päiväys:** 27.5.2026
**Tarkoitus:** Koneluettava, atominen toimenpidelista AI-koodausagentille (Codex) sivuston tietoturvaheikkouksien korjaamiseksi. Jokainen tehtävä on suoritettavissa itsenäisesti ja sisältää tarkat tiedostopolut, nykytilan, tavoitetilan ja varmistusaskeleet.

**Ohjeet Codexille:**
- Suorita tehtävät prioriteettijärjestyksessä (P0 → P3).
- Tee jokaisesta tehtävästä erillinen commit muodossa: `security(P{priority}-{id}): {title}`.
- Älä yhdistä tehtäviä samaan committiin ellei `bundleWith`-kenttä mainitse niin.
- Tehtävät joiden `type: manual` vaativat ihmiskäyttäjän toimia (esim. Firebase Console). Älä yritä automatisoida niitä — luo sen sijaan `TODO_HUMAN.md`-merkintä juurihakemistoon.
- Aja `npm run check:secrets` ennen jokaista committia.
- Jos tehtävän `verify`-komento epäonnistuu, peruuta muutokset ja raportoi.

---

## Tehtävälista

```yaml
schema_version: 1
project: aloitussivu
audit_date: 2026-05-27
total_tasks: 15
tasks:

  - id: SEC-001
    priority: P0
    type: manual
    title: Pyöräytä functions/.env -salaisuudet ja siirrä Secret Manageriin
    rationale: |
      functions/.env sisältää selkokielisinä GEMINI_API_KEY ja ADMIN_TRIGGER_SECRET
      (sekä NAMEDAY_API_TOKEN, joka on vain testikäytössä — käsitellään SEC-015:ssa).
      Hakemisto on OneDrive-synkronoitu → salaisuudet vuotavat Microsoftin pilveen.
    files: ["functions/.env"]
    human_actions:
      - "Luo uusi GEMINI_API_KEY: https://console.cloud.google.com/apis/credentials (poista vanha avain)"
      - "Generoi uusi ADMIN_TRIGGER_SECRET: `openssl rand -base64 32`"
      - "HUOM: NAMEDAY_API_TOKEN-pyöräytys EI tarpeen — token peruutetaan kokonaan SEC-015:ssa"
      - "Aseta GEMINI_API_KEY ja ADMIN_TRIGGER_SECRET Secret Manageriin: `firebase functions:secrets:set GEMINI_API_KEY`"
      - "Päivitä Cloud Functions käyttämään `defineSecret()` -syntaksia process.env:n sijaan"
    codex_after_human:
      - "Päivitä functions/gemini.ts ja functions/ncscCron.ts käyttämään defineSecret():iä"
      - "ÄLÄ päivitä functions/nameday.ts:ää — se poistetaan SEC-015:ssa"
    verify:
      - "functions/.env sisältää vain NAMEDAY_API_TOKEN:in (poistuu SEC-015:ssa)"
      - "grep -rn 'AIzaSy' functions/ --exclude=.env palauttaa 0 osumaa"
      - "npm run check:secrets"

  - id: SEC-002
    priority: P0
    type: manual
    title: Siirrä työhakemisto OneDriven ulkopuolelle TAI poista synkronointi alikansioilta
    rationale: |
      Koko projektikansio sijaitsee polussa "C:\\Users\\...\\OneDrive - Vanhustyön keskusliitto ry\\..."
      Tämä synkronoi dist/-buildit ja .env-tiedostot pilveen.
    files: []
    human_actions:
      - "VAIHTOEHTO A (suositus): Siirrä koko repo polkuun C:\\dev\\Aloitussivu\\ ja klooni uudelleen"
      - "VAIHTOEHTO B: Klikkaa hiiren oikealla `dist/` ja `functions/.env` → 'Free up space' / 'Always keep on this device' POIS"
      - "VAIHTOEHTO B: Lisää OneDrive-asetuksiin poissulkemissääntö node_modules/, dist/, functions/.env"
    codex_after_human: []
    verify:
      - "ls C:\\dev\\Aloitussivu\\.git tai OneDrive-statuksen tarkistus"

  - id: SEC-003
    priority: P0
    type: manual
    title: Lisää HTTP-referrer-rajoitus VITE_FIREBASE_API_KEY:lle
    rationale: |
      Selainpuolen Firebase-avain on julkinen mutta tarvitsee referrer-rajoituksen
      Google Cloudissa estääkseen kvoottakulutuksen kolmansilta osapuolilta.
    files: []
    human_actions:
      - "Avaa: https://console.cloud.google.com/apis/credentials?project=aloitussivu-5d50c"
      - "Muokkaa avainta 'AIzaSyBSSBCbiGIJDYp_l0fShTx6YMIOZ_rnmVE'"
      - "Application restrictions → HTTP referrers (web sites)"
      - "Lisää: https://eerotuomenoksa.github.io/*"
      - "Lisää: https://aloitussivu-5d50c.web.app/*"
      - "Lisää: https://aloitussivu-5d50c.firebaseapp.com/*"
      - "Lisää: http://localhost:5173/*  (kehitys)"
      - "API restrictions → rajaa: Identity Toolkit API, Cloud Firestore API, Firebase Installations API, Token Service API, Firebase App Check API"
    verify:
      - "curl https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyB... -d '{}' EI saa onnistua ilman oikeaa referreriä"

  - id: SEC-004
    priority: P1
    type: code-fix
    title: Pakota App Check geminiChat-funktiossa (poista opt-in)
    rationale: |
      verifyAppCheckIfRequired() ohittaa App Check -tarkistuksen jos
      GEMINI_REQUIRE_APP_CHECK !== 'true'. Tämä on epäturvallinen oletus.
    files: ["functions/gemini.ts"]
    changes:
      - file: "functions/gemini.ts"
        find: |
          const verifyAppCheckIfRequired = async (req: Request) => {
            if (process.env.GEMINI_REQUIRE_APP_CHECK !== 'true') return true;

            const token = req.header('X-Firebase-AppCheck');
            if (!token) return false;

            try {
              await getAdminAppCheck().verifyToken(token);
              return true;
            } catch (error) {
              console.warn('Gemini App Check verification failed:', error);
              return false;
            }
          };
        replace: |
          const verifyAppCheck = async (req: Request) => {
            const token = req.header('X-Firebase-AppCheck');
            if (!token) return false;

            try {
              await getAdminAppCheck().verifyToken(token);
              return true;
            } catch (error) {
              console.warn('Gemini App Check verification failed:', error);
              return false;
            }
          };
      - file: "functions/gemini.ts"
        find: "if (!await verifyAppCheckIfRequired(req)) {"
        replace: "if (!await verifyAppCheck(req)) {"
    verify:
      - "cd functions && npx tsc --noEmit"
      - "grep -n 'GEMINI_REQUIRE_APP_CHECK' functions/ palauttaa 0 osumaa"

  - id: SEC-005
    priority: P1
    type: code-fix
    title: Vaadi App Check trackUsage-funktiolle
    rationale: |
      trackUsage on julkinen endpoint joka kirjoittaa Firestoreen. CORS ei ole
      tietoturvarajoite — bot voi pumpata roskaa.
    files: ["functions/usage.ts"]
    changes:
      - file: "functions/usage.ts"
        find: |
          import { onRequest, type Request } from 'firebase-functions/v2/https';
          import { getApps, initializeApp } from 'firebase-admin/app';
          import { FieldValue, getFirestore } from 'firebase-admin/firestore';
          import { getAllowedOrigins } from './cors';
        replace: |
          import { onRequest, type Request } from 'firebase-functions/v2/https';
          import { getApps, initializeApp } from 'firebase-admin/app';
          import { getAppCheck } from 'firebase-admin/app-check';
          import { FieldValue, getFirestore } from 'firebase-admin/firestore';
          import { getAllowedOrigins } from './cors';
      - file: "functions/usage.ts"
        find: |
          const getAdminDb = () => {
            if (getApps().length === 0) {
              initializeApp();
            }
            return getFirestore();
          };
        replace: |
          const getAdminDb = () => {
            if (getApps().length === 0) {
              initializeApp();
            }
            return getFirestore();
          };

          const getAdminAppCheck = () => {
            if (getApps().length === 0) {
              initializeApp();
            }
            return getAppCheck();
          };

          const verifyAppCheck = async (req: Request) => {
            const token = req.header('X-Firebase-AppCheck');
            if (!token) return false;
            try {
              await getAdminAppCheck().verifyToken(token);
              return true;
            } catch {
              return false;
            }
          };
      - file: "functions/usage.ts"
        find: |
          if (req.method !== 'POST') {
              res.status(405).send('Method Not Allowed');
              return;
            }

            if (isRateLimited(getClientKey(req))) {
              res.status(204).send();
              return;
            }
        replace: |
          if (req.method !== 'POST') {
              res.status(405).send('Method Not Allowed');
              return;
            }

            if (!await verifyAppCheck(req)) {
              res.status(204).send();
              return;
            }

            if (isRateLimited(getClientKey(req))) {
              res.status(204).send();
              return;
            }
    related_client_changes:
      - file: "usageTracking.ts"
        note: |
          Päivitä sendUsageEvent lisäämään X-Firebase-AppCheck-token fetch-pyyntöön.
          Käytä getFirebaseAppCheckToken() funktiosta firebaseClient.ts.
          Huom: navigator.sendBeacon() ei tue otsakkeita → poista sendBeacon-haara
          tai lähetä token URL-parametrina (vähemmän suotavaa).
    verify:
      - "cd functions && npx tsc --noEmit"
      - "grep -n 'verifyAppCheck' functions/usage.ts"

  - id: SEC-006
    priority: P1
    type: code-fix
    title: Poista 'unsafe-inline' CSP:n script-src:stä
    rationale: |
      'unsafe-inline' kumoaa CSP:n XSS-suojan. Vite tuottaa ulkoiset bundlet
      joten sisäistä inline-skriptiä ei pitäisi tarvita.
    files: ["firebase.json"]
    changes:
      - file: "firebase.json"
        find: "script-src 'self' 'unsafe-inline';"
        replace: "script-src 'self';"
    verify:
      - "npm run build && grep -r '<script>' dist/index.html palauttaa 0 inline-skriptiä"
      - "deployaa stagingiin, avaa selain ja tarkista konsoli CSP-virheiden varalta"
    rollback: |
      Jos selain raportoi CSP-rikkomuksia, palauta 'unsafe-inline'
      ja luo erillinen tehtävä inline-skriptien tunnistamiseen ja siirtämiseen
      ulkoiseen tiedostoon tai nonce/hash-pohjaiseen sallintaan.

  - id: SEC-007
    priority: P1
    type: code-fix
    title: Tiukenna CSP:n connect-src ja img-src
    rationale: |
      connect-src 'https://*.googleapis.com' on tarpeettoman laaja.
      img-src 'https:' sallii minkä tahansa HTTPS-kuvalähteen.
    files: ["firebase.json"]
    changes:
      - file: "firebase.json"
        find: "connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net https://europe-west1-aloitussivu-5d50c.cloudfunctions.net;"
        replace: "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://firebaseinstallations.googleapis.com https://firebaseappcheck.googleapis.com https://content-firebaseappcheck.googleapis.com https://securetoken.googleapis.com https://europe-west1-aloitussivu-5d50c.cloudfunctions.net https://api.rss2json.com https://api.allorigins.win https://nimipaivarajapinta.fi;"
    verify:
      - "Deployaa stagingiin, käy läpi: kirjautuminen, linkkiehdotuksen lähetys, Gemini-chat, RSS-uutiset"
      - "Tarkista DevTools → Network ettei pyyntöjä blokattu CSP-rikkomuksiin"
    bundleWith: ["SEC-006"]

  - id: SEC-008
    priority: P2
    type: code-fix
    title: Tiukenna Permissions-Policy (poista microphone jos ei käytössä)
    rationale: |
      Permissions-Policy sallii microphone=(self) mutta sivustolla ei näytä
      olevan ääninauhoituksen käyttöä.
    files: ["firebase.json"]
    preconditions:
      - "Vahvista että koodissa ei käytetä navigator.mediaDevices.getUserMedia({audio:true}) tai SpeechRecognition-rajapintaa"
      - "grep -r 'getUserMedia\\|SpeechRecognition\\|webkitSpeechRecognition' . --exclude-dir=node_modules --exclude-dir=dist"
    changes:
      - file: "firebase.json"
        condition: "yllä oleva grep palauttaa 0 osumaa"
        find: "camera=(), microphone=(self), geolocation=(self)"
        replace: "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
    verify:
      - "Sivuston toiminnallisuus säilyy"

  - id: SEC-009
    priority: P2
    type: code-fix
    title: Siirry Firebase Custom Claims -pohjaiseen admin-tunnistukseen
    rationale: |
      Sähköpostipohjainen admin-lista on hajautettu kolmeen paikkaan ja
      hauras. Custom Claims on Firebasen suositeltu tapa.
    files:
      - "firestore.rules"
      - "firebaseClient.ts"
      - "functions/ncscCron.ts"
    human_actions:
      - "Aja kerran Admin SDK:n kautta: admin.auth().setCustomUserClaims(uid, {admin: true}) molemmille admin-tileille"
      - "Kirjaudu adminilla uudelleen sivustolle (claim aktivoituu uuden tokenin myötä)"
    changes:
      - file: "firestore.rules"
        find: |
          function isAdmin() {
              return request.auth != null
                && request.auth.token.email in [
                  'eero.tuomenoksa@gmail.com',
                  'seniorsurf.suomi@gmail.com'
                ];
            }
        replace: |
          function isAdmin() {
              return request.auth != null
                && request.auth.token.admin == true;
            }
      - file: "firebaseClient.ts"
        find: "export const isAdminUser = (user: User | null) => ADMIN_EMAILS.includes(getUserEmail(user).toLocaleLowerCase('fi-FI'));"
        replace: |
          export const isAdminUser = async (user: User | null) => {
            if (!user) return false;
            const tokenResult = await user.getIdTokenResult();
            return tokenResult.claims.admin === true;
          };
      - file: "functions/ncscCron.ts"
        find: |
          const decoded = await getAdminAuth().verifyIdToken(idToken);
                const email = (decoded.email ?? '').toLocaleLowerCase('fi-FI');
                if (!ADMIN_EMAILS.includes(email) && !ADMIN_UIDS.has(decoded.uid)) {
                  res.status(403).json({ error: 'Forbidden' });
                  return;
                }
        replace: |
          const decoded = await getAdminAuth().verifyIdToken(idToken);
                if (decoded.admin !== true) {
                  res.status(403).json({ error: 'Forbidden' });
                  return;
                }
    related_callers:
      - "ehdotukset.tsx käyttää isAdminUser(user) synkronisesti — muuta await/useEffect-pattern"
    verify:
      - "Kirjaudu admin-tilillä: ehdotukset.html avautuu, ei-admin tilillä ei"
      - "firebase deploy --only firestore:rules ja yritä lukea adminStats ei-admin-tilillä → permission denied"

  - id: SEC-010
    priority: P2
    type: manual
    title: Pakota 2FA admin-tileille
    rationale: |
      Admin-tilit hallitsevat kaikkien käyttäjien näkemiä sisältöjä.
      Google-tilin 2FA on lähimerkki kompromissin vaikutuksen pienentämiseen.
    human_actions:
      - "https://myaccount.google.com/signinoptions/two-step-verification → ota käyttöön molemmille admin-tileille"
      - "Käytä Authenticator-appia tai turvallisuusavainta (Yubikey), ÄLÄ SMS:ää"
    verify: []

  - id: SEC-011
    priority: P2
    type: manual
    title: Aseta budjettihälytys Firebase/Google Cloud -projektille
    rationale: |
      Avoimet endpointit ja Firestore-luvut ovat DoS/talousvektoreita.
      Budjettihälytys pysäyttää yllätyslaskut.
    human_actions:
      - "https://console.cloud.google.com/billing/budgets?project=aloitussivu-5d50c"
      - "Luo budjetti: 10 €/kk, hälytys 50% / 90% / 100%"
      - "Erillinen hälytys Gemini API -kustannuksille: 5 €/kk"
    verify: []

  - id: SEC-012
    priority: P3
    type: code-fix
    title: Korvaa Math.random()-pohjaiset ID:t crypto.randomUUID():lla
    rationale: |
      Math.random ei ole kryptografisesti turvallinen. ID:iden ennustettavuus
      ei ole akuutti riski Firestoren kontekstissa mutta vakiointi siisteyttää.
    files:
      - "components/LinkReportModal.tsx"
      - "approvedLinks.ts"
    changes:
      - file: "components/LinkReportModal.tsx"
        find: "id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,"
        replace: "id: crypto.randomUUID(),"
      - file: "approvedLinks.ts"
        find: "id: suggestion.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,"
        replace: "id: suggestion.id ?? crypto.randomUUID(),"
    verify:
      - "npx tsc --noEmit"
      - "grep -rn 'Math.random' --include='*.ts' --include='*.tsx' . --exclude-dir=node_modules --exclude-dir=dist palauttaa <= 0 osumaa tai vain tarkoituksellisia kohteita"

  - id: SEC-013
    priority: P3
    type: code-fix
    title: Korvaa rssService.ts:n innerHTML-pohjainen HTML-entiteettien purku
    rationale: |
      textarea.innerHTML on hauras kuvio. Vaikka ei suorita skriptejä,
      koodin myöhempi siirto dangerouslySetInnerHTML:ään tekisi XSS:n välittömäksi.
    files: ["services/rssService.ts"]
    changes:
      - file: "services/rssService.ts"
        find: |
          const decodeText = (value: string) => {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = value;
            return textarea.value.trim();
          };
        replace: |
          const HTML_ENTITIES: Record<string, string> = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&apos;': "'",
            '&nbsp;': ' ',
          };

          const decodeText = (value: string) => {
            const decoded = value
              .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
              .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
              .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (entity) => HTML_ENTITIES[entity] ?? entity);
            return decoded.trim();
          };
    verify:
      - "npx tsc --noEmit"
      - "Manuaalitesti: lataa kunnan paikallisuutisten otsikot ja tarkista että ä/ö/Skandinaviset merkit näkyvät oikein"

  - id: SEC-014
    priority: P3
    type: code-fix
    title: Vaihda Gemini-malli preview-versiosta vakaaseen
    rationale: |
      gemini-3-flash-preview voi muuttua tai poistua ilman ennakkoilmoitusta.
    files: ["functions/gemini.ts"]
    changes:
      - file: "functions/gemini.ts"
        find: "model: 'gemini-3-flash-preview',"
        replace: "model: 'gemini-2.5-flash',"
    verify:
      - "Deployaa stagingiin ja testaa Gemini-chat ja news-summary -toiminnot"
      - "Tarkista Firebase Console → Functions logs ei virheitä"

  - id: SEC-015
    priority: P1
    type: hybrid
    title: Korvaa nimipäivärajapinta tiedostopohjaisella ratkaisulla ja poista NAMEDAY_API_TOKEN
    rationale: |
      Nimipäivärajapinta on vain testikäytössä; tuotantoon nimipäivät ostetaan
      kertaluonteisena tiedostona. Tiedostopohjainen ratkaisu poistaa:
        - NAMEDAY_API_TOKEN-salaisuuden tarpeen (yksi salaisuus vähemmän hallittavana)
        - namedayToday Cloud Function -kutsujen kustannukset
        - Firestore-kirjoitukset adminStats/namedayApi -dokumenttiin
        - Riippuvuuden ulkoiseen nimipaivarajapinta.fi-palveluun
    files:
      - "functions/index.ts"
      - "functions/nameday.ts"
      - "functions/.env"
      - "services/nameDayService.ts"
      - "ehdotukset.tsx"
      - "adminStats.ts"
      - "assets/namedays-2026.json (UUSI)"
    human_actions:
      - "Hanki ostettu nimipäivätiedosto (CSV tai JSON) toimittajalta"
      - "Muunna se muotoon: {\"01-01\": [\"Uudenvuodenpäivä\"], \"01-02\": [\"Aapeli\"], ...} (MM-DD-avaimet)"
      - "Tallenna polkuun assets/namedays-2026.json (tai vastaava nimi vuodelle)"
      - "Peruuta NAMEDAY_API_TOKEN nimipaivarajapinta.fi:n hallintapaneelista kun deployattu"
      - "Poista adminStats/namedayApi-dokumentti Firestoresta deployn jälkeen"
    codex_changes:
      - file: "services/nameDayService.ts"
        action: "refactor"
        description: |
          Korvaa fetch(getNameDayTodayUrl()) staattisella JSON-tuonnilla:
            import namedays from '../assets/namedays-2026.json';
            export const getTodayNamedays = (): string[] => {
              const today = new Date();
              const key = `${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
              return namedays[key] ?? [];
            };
          Säilytä julkinen API-pintaprofiili niin että kutsujat eivät rikkoonu.
      - file: "functions/index.ts"
        find: "export { namedayToday } from './nameday';"
        replace: ""
      - file: "functions/nameday.ts"
        action: "delete"
      - file: "functions/.env"
        action: "remove-line"
        find: "NAMEDAY_API_TOKEN=ndt_f3eecc7369abcfef69b8f01597540acf3deff9698678e0aaebf9a4b8dacfb008"
      - file: "ehdotukset.tsx"
        action: "remove"
        description: "Poista Nimipäivärajapinta-kortti reviewTasks-listasta (rivit ~362-371) ja siihen liittyvät subscribeNameDayApiUsageStats-kutsut"
      - file: "adminStats.ts"
        action: "remove"
        description: "Poista NameDayApiUsageStats-tyyppi ja subscribeNameDayApiUsageStats-funktio jos niitä ei käytetä muualla"
    verify:
      - "cd functions && npx tsc --noEmit"
      - "npx tsc --noEmit (juurikansiossa)"
      - "grep -rn 'NAMEDAY_API_TOKEN\\|namedayToday\\|nimipaivarajapinta' . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=docs palauttaa 0 osumaa"
      - "Manuaalitesti: etusivu näyttää tämän päivän nimipäivän oikein"
      - "Firebase Functions logs: namedayToday-funktiota ei enää kutsuta"
    notes: |
      Vaihda jatkossa namedays-2026.json -tiedosto vuosittain.
      Harkitse luoda CI-tehtävä joka muistuttaa joulukuussa seuraavan vuoden tiedoston päivityksestä.

```

---

## Suoritusjärjestys ja riippuvuudet

```mermaid
graph TD
    SEC001[SEC-001 Pyöräytä salaisuudet] --> SEC003[SEC-003 API-key restriktio]
    SEC002[SEC-002 Pois OneDrivesta]
    SEC003 --> SEC004[SEC-004 Pakota App Check]
    SEC004 --> SEC005[SEC-005 App Check trackUsageen]
    SEC005 --> SEC006[SEC-006 Poista unsafe-inline]
    SEC006 -.bundleWith.-> SEC007[SEC-007 Tiukenna connect-src]
    SEC008[SEC-008 Permissions-Policy]
    SEC010[SEC-010 2FA] --> SEC009[SEC-009 Custom Claims]
    SEC009
    SEC011[SEC-011 Budjettihälytys]
    SEC012[SEC-012 crypto.randomUUID]
    SEC013[SEC-013 decodeText refactor]
    SEC014[SEC-014 Stable Gemini model]
    SEC015[SEC-015 Nimipäivät tiedostoon] --> SEC001
```

**Suositeltu commitointijärjestys:**
1. SEC-015 (nimipäivät tiedostoon — poistaa yhden salaisuuden ennen SEC-001:tä)
2. SEC-001, SEC-002, SEC-003 (manuaalitehtävät — tee samana päivänä)
3. SEC-004, SEC-005 (App Check)
4. SEC-006 + SEC-007 (yksi commit, sama tiedosto)
5. SEC-008 (yksinkertainen)
6. SEC-010 ennen SEC-009:ää (ettei lukita itseä ulos)
7. SEC-009 (custom claims — vaatii huolellisuutta)
8. SEC-011 (budjetti)
9. SEC-012, SEC-013, SEC-014 (siivous)

## Globaalit hyväksymiskriteerit

- `npm run check:secrets` ei löydä uusia salaisuuksia
- `npm run build` valmistuu virheittä
- `cd functions && npx tsc --noEmit` valmistuu virheittä
- Frontti toimii kirjautumattomille käyttäjille kuten ennen (etusivu, linkit, scam-alerts)
- Admin-tunnistus toimii molemmille admin-tileille
- `firebase deploy --dry-run --only firestore:rules,functions,hosting` valmistuu virheittä
