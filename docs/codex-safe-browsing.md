# Codex-tehtävä: Google Safe Browsing API -integraatio

**Tavoite:** Lisää Google Safe Browsing v4 -tarkistus kaikkiin linkkeihin, jotta phishing- ja haittasivustot havaitaan ennen kuin käyttäjät kohtaavat ne.

**Konteksti:** SeniorSurf on ikääntyneille suunnattu aloitussivu, jossa on yli 3 000 linkkiä. Nykyinen `scripts/update-links.mjs` tarkistaa vain URL-rakenteen, DNS:n ja HTTPS:n – ei tunnista phishing- tai haittasivustoja lainkaan.

---

## Arkkitehtuurisuunnitelma

```
update-links.mjs (build/CI)
  └─ kutsuu safeBrowsingCheck(urls[]) suoraan Safe Browsing API v4:ään
       └─ tallentaa uhkatulokset CSV:hen + linkHealth.ts:ään

Cloud Function: safeBrowsingCheckNow (admin-käyttö)
  └─ ylläpitäjä voi tarkistaa yksittäisen URLin ylläpitopaneelista
       └─ tallentaa tuloksen Firestoreen (urlSafetyCache/{urlHash})

Firestore: urlSafetyCache
  └─ välimuisti Safe Browsing -tuloksille (TTL 24h)
  └─ vähentää API-kutsuja, säästää kiintiötä
```

---

## Vaihe 1: Google API -avain ja ympäristömuuttujat

### Mitä tehdä:
1. Projektin omistaja (ei Codex) luo avaimen osoitteessa: https://console.cloud.google.com/apis/credentials
   - Ota käyttöön: **Safe Browsing API**
   - Rajoita avain: vain Safe Browsing API, vain Cloud Functions IP:stä jos mahdollista

2. Tallenna avain Firebase Secret Manageriin:
   ```bash
   firebase functions:secrets:set SAFE_BROWSING_API_KEY
   ```

3. Lisää `.env.example`-tiedostoon kommenttiviive (ei oikeaa arvoa):
   ```
   # SAFE_BROWSING_API_KEY=   # Aseta Firebase Secret Manageriin, ei tänne
   ```

---

## Vaihe 2: Uusi moduuli `functions/safeBrowsing.ts`

Luo tiedosto `functions/safeBrowsing.ts`:

```typescript
/**
 * Google Safe Browsing v4 Lookup API -integraatio.
 * Docs: https://developers.google.com/safe-browsing/v4/lookup-api
 *
 * Ilmainen kiintiö: 10 000 URL/päivä.
 * Pyynnöt voivat sisältää enintään 500 URLia kerralla.
 */

const SAFE_BROWSING_ENDPOINT =
  'https://safebrowsing.googleapis.com/v4/threatMatches:find';

const THREAT_TYPES = [
  'MALWARE',
  'SOCIAL_ENGINEERING',
  'UNWANTED_SOFTWARE',
  'POTENTIALLY_HARMFUL_APPLICATION',
] as const;

export type ThreatType = (typeof THREAT_TYPES)[number];

export interface SafeBrowsingThreat {
  url: string;
  threatType: ThreatType;
  platformType: string;
}

export interface SafeBrowsingResult {
  url: string;
  safe: boolean;
  threats: SafeBrowsingThreat[];
  checkedAt: string;
}

/**
 * Tarkistaa enintään 500 URLia yhdellä API-kutsulla.
 * Palauttaa vain URLit, joilla on uhkia – turvalliset URLit eivät näy vastauksessa.
 */
export const checkUrlsSafeBrowsing = async (
  urls: string[],
  apiKey: string
): Promise<SafeBrowsingResult[]> => {
  if (urls.length === 0) return [];
  if (urls.length > 500) {
    throw new Error('Safe Browsing API supports max 500 URLs per request');
  }

  const body = {
    client: { clientId: 'seniorsurf-fi', clientVersion: '1.0.0' },
    threatInfo: {
      threatTypes: THREAT_TYPES,
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: urls.map((url) => ({ url })),
    },
  };

  const response = await fetch(
    `${SAFE_BROWSING_ENDPOINT}?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Safe Browsing API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    matches?: Array<{
      threatType: string;
      platformType: string;
      threat: { url: string };
    }>;
  };

  const checkedAt = new Date().toISOString();

  // Ryhmittele uhat URLin mukaan
  const threatsByUrl = new Map<string, SafeBrowsingThreat[]>();
  for (const match of data.matches ?? []) {
    const url = match.threat.url;
    if (!threatsByUrl.has(url)) threatsByUrl.set(url, []);
    threatsByUrl.get(url)!.push({
      url,
      threatType: match.threatType as ThreatType,
      platformType: match.platformType,
    });
  }

  // Palauta kaikki tarkistetut URLit tuloksineen
  return urls.map((url) => ({
    url,
    safe: !threatsByUrl.has(url),
    threats: threatsByUrl.get(url) ?? [],
    checkedAt,
  }));
};

/**
 * Apufunktio: jaa suuri URL-lista 500 URLin eriin.
 */
export const checkAllUrlsSafeBrowsing = async (
  urls: string[],
  apiKey: string
): Promise<SafeBrowsingResult[]> => {
  const BATCH_SIZE = 500;
  const results: SafeBrowsingResult[] = [];

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchResults = await checkUrlsSafeBrowsing(batch, apiKey);
    results.push(...batchResults);

    // Lyhyt tauko erien välissä, jotta ei ylitetä rate limitiä
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
};
```

---

## Vaihe 3: Cloud Function `safeBrowsingCheckNow` tiedostoon `functions/safeBrowsingCheck.ts`

Luo tiedosto `functions/safeBrowsingCheck.ts`:

```typescript
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createHash } from 'node:crypto';
import { getAllowedOrigins } from './cors';
import { checkUrlsSafeBrowsing, type SafeBrowsingResult } from './safeBrowsing';

const safeBrowsingApiKey = defineSecret('SAFE_BROWSING_API_KEY');

const ADMIN_EMAILS = ['eero.tuomenoksa@gmail.com', 'seniorsurf.suomi@gmail.com'];
const CACHE_COLLECTION = 'urlSafetyCache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 tuntia

const getAdminApp = () => {
  if (getApps().length === 0) initializeApp();
  return { auth: getAuth(), db: getFirestore() };
};

/** SHA-256-tiiviste URLin käyttöön Firestore-dokumentin avaimena */
const urlToDocId = (url: string) =>
  createHash('sha256').update(url).digest('hex').slice(0, 40);

/** Lue välimuistista, palauta null jos vanhentunut tai puuttuu */
const getCachedResult = async (
  db: ReturnType<typeof getFirestore>,
  url: string
): Promise<SafeBrowsingResult | null> => {
  const doc = await db.collection(CACHE_COLLECTION).doc(urlToDocId(url)).get();
  if (!doc.exists) return null;

  const data = doc.data() as SafeBrowsingResult & { cachedAt: string };
  const age = Date.now() - new Date(data.cachedAt).getTime();
  if (age > CACHE_TTL_MS) return null;

  return data;
};

/** Tallenna tulos välimuistiin */
const cacheResult = async (
  db: ReturnType<typeof getFirestore>,
  result: SafeBrowsingResult
): Promise<void> => {
  await db
    .collection(CACHE_COLLECTION)
    .doc(urlToDocId(result.url))
    .set({ ...result, cachedAt: new Date().toISOString() });
};

export const safeBrowsingCheckNow = onRequest(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 30,
    cors: getAllowedOrigins(),
    invoker: 'public',
    secrets: [safeBrowsingApiKey],
  },
  async (req, res) => {
    // Vain POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    // Tunnistaudu ylläpitäjänä
    const authHeader = req.headers.authorization ?? '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!idToken) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { auth, db } = getAdminApp();
    try {
      const decoded = await auth.verifyIdToken(idToken);
      const email = (decoded.email ?? '').toLowerCase();
      if (!ADMIN_EMAILS.includes(email)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    } catch {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Validoi syöte
    const { urls } = req.body as { urls?: unknown };
    if (
      !Array.isArray(urls) ||
      urls.length === 0 ||
      urls.length > 500 ||
      urls.some((u) => typeof u !== 'string' || u.length > 2048)
    ) {
      res.status(400).json({ error: 'urls must be a non-empty string array, max 500 items' });
      return;
    }

    const apiKey = safeBrowsingApiKey.value();
    if (!apiKey) {
      res.status(500).json({ error: 'Safe Browsing API key not configured' });
      return;
    }

    try {
      // Tarkista välimuistista ensin
      const results: SafeBrowsingResult[] = [];
      const uncachedUrls: string[] = [];

      await Promise.all(
        (urls as string[]).map(async (url) => {
          const cached = await getCachedResult(db, url);
          if (cached) {
            results.push(cached);
          } else {
            uncachedUrls.push(url);
          }
        })
      );

      // Tarkista välimuistista puuttuvat Safe Browsingista
      if (uncachedUrls.length > 0) {
        const fresh = await checkUrlsSafeBrowsing(uncachedUrls, apiKey);
        await Promise.all(fresh.map((r) => cacheResult(db, r)));
        results.push(...fresh);
      }

      const threats = results.filter((r) => !r.safe);
      res.status(200).json({
        checked: results.length,
        threats: threats.length,
        results: threats, // palauta vain uhkat, ei kaikkia
      });
    } catch (error) {
      console.error('Safe Browsing check failed:', error);
      res.status(500).json({ error: 'Check failed' });
    }
  }
);
```

---

## Vaihe 4: Lisää funktio `functions/index.ts`-exportteihin

Lisää `functions/index.ts` loppuun:

```typescript
export { safeBrowsingCheckNow } from './safeBrowsingCheck';
```

---

## Vaihe 5: Firestore-säännöt – lisää `urlSafetyCache`-kokoelma

Lisää `firestore.rules`-tiedostoon ennen viimeistä `}`:

```
match /urlSafetyCache/{docId} {
  allow read: if isAdmin();   // ylläpitäjä lukee välimuistin
  allow write: if false;      // vain Cloud Functions kirjoittaa
}
```

---

## Vaihe 6: Päivitä `scripts/update-links.mjs` käyttämään Safe Browsing -tarkistusta

### 6a: Lisää Safe Browsing -kutsu skriptin alkuun

Lisää `scripts/update-links.mjs` alkuun (heti import-rivien jälkeen):

```javascript
// Safe Browsing v4 – käytetään jos SAFE_BROWSING_API_KEY on asetettu
const SAFE_BROWSING_API_KEY = process.env.SAFE_BROWSING_API_KEY ?? '';
const SAFE_BROWSING_BATCH_SIZE = 500;

/**
 * Tarkistaa URLs-listan Safe Browsing v4 -rajapinnasta.
 * Palauttaa Map<url, uhkakuvaus[]> – turvalliset URLit eivät näy mapissa.
 */
const checkSafeBrowsing = async (urls) => {
  const threatMap = new Map();
  if (!SAFE_BROWSING_API_KEY) return threatMap;

  for (let i = 0; i < urls.length; i += SAFE_BROWSING_BATCH_SIZE) {
    const batch = urls.slice(i, i + SAFE_BROWSING_BATCH_SIZE);
    const body = {
      client: { clientId: 'seniorsurf-fi', clientVersion: '1.0.0' },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: batch.map((url) => ({ url })),
      },
    };

    try {
      const resp = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SAFE_BROWSING_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      if (!resp.ok) {
        console.warn(`Safe Browsing API error ${resp.status} – ohitetaan erä ${i}–${i + batch.length}`);
        continue;
      }
      const data = await resp.json();
      for (const match of data.matches ?? []) {
        const url = match.threat.url;
        if (!threatMap.has(url)) threatMap.set(url, []);
        threatMap.get(url).push(match.threatType);
      }
    } catch (err) {
      console.warn('Safe Browsing -kutsu epäonnistui:', err.message);
    }

    if (i + SAFE_BROWSING_BATCH_SIZE < urls.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return threatMap;
};
```

### 6b: Kutsu `checkSafeBrowsing` main()-funktion alussa

Etsi `main`-funktion sisältä kohta, jossa `uniqueRows` on rakennettu mutta ennen rinnakkaistarkistuksia. Lisää:

```javascript
// Safe Browsing -tarkistus kaikille URLeille kerralla (1 API-kutsu / 500 URL)
const allUrls = uniqueRows.map((row) => row.url);
console.log(`Tarkistetaan ${allUrls.length} URLia Safe Browsing -rajapinnasta...`);
const safeBrowsingThreats = await checkSafeBrowsing(allUrls);
if (safeBrowsingThreats.size > 0) {
  console.warn(`⚠️  Safe Browsing löysi uhkia ${safeBrowsingThreats.size} URLissa.`);
}
```

### 6c: Päivitä `evaluateUrlSafety`-funktio käyttämään Safe Browsing -tulosta

Muuta `evaluateUrlSafety`-funktion signatuuria ottamaan `safeBrowsingThreats`-map parametrina:

```javascript
const evaluateUrlSafety = async (rawUrl, safeBrowsingThreats) => {
  const notes = [];
  // ... olemassa oleva koodi ...

  // LISÄÄ TÄMÄ ENNEN return-lausetta:
  const sbThreats = safeBrowsingThreats?.get(rawUrl);
  if (sbThreats && sbThreats.length > 0) {
    notes.push(`Safe Browsing -uhka: ${sbThreats.join(', ')}`);
    return { safety: 'uhka', notes };
  }

  // ... olemassa oleva safety-arvon palautus ...
};
```

### 6d: Välitä `safeBrowsingThreats` rinnakkaiseen tarkistukseen

Etsi kohta, jossa kutsutaan `evaluateUrlSafety(row.url)`. Muuta:

```javascript
// ENNEN:
evaluateUrlSafety(row.url),

// JÄLKEEN:
evaluateUrlSafety(row.url, safeBrowsingThreats),
```

---

## Vaihe 7: Lisää ympäristömuuttuja `.env.example`-tiedostoon

Lisää `.env.example`-tiedoston loppuun:

```
# Safe Browsing API -avain (skriptiajoa varten, ei VITE_-prefix)
# Hanki: https://console.cloud.google.com/apis/credentials → Safe Browsing API
# SAFE_BROWSING_API_KEY=
```

---

## Vaihe 8: GitHub Actions -integraatio (valinnainen, suositeltu)

Jos projektissa on `.github/workflows/`-hakemisto, luo `.github/workflows/link-audit.yml`:

```yaml
name: Viikoittainen linkkiauditointi + Safe Browsing
on:
  schedule:
    - cron: '0 5 * * 1'   # Maanantai 05:00 UTC
  workflow_dispatch:        # Voi ajaa myös käsin

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Aja linkkiauditointi Safe Browsingilla
        run: node scripts/update-links.mjs
        env:
          SAFE_BROWSING_API_KEY: ${{ secrets.SAFE_BROWSING_API_KEY }}
      - name: Tarkista Safe Browsing -uhat
        run: |
          if grep -q '"uhka"' docs/yllapito-linkkiloki.csv; then
            echo "::error::Safe Browsing löysi uhkia! Tarkista docs/yllapito-linkkiloki.csv"
            exit 1
          fi
      - name: Luo PR jos linkkilistaan tuli muutoksia
        uses: peter-evans/create-pull-request@v6
        with:
          title: "Automaattinen linkkiauditointi ${{ github.run_started_at }}"
          branch: linkkiauditointi/automaattinen-${{ github.run_number }}
          commit-message: "chore: viikoittainen linkkiauditointi"
          body: |
            Automaattinen viikoittainen linkkiauditointi.
            Muutokset: päivitetty linkHealth.ts ja CSV-raportit.
```

Muista lisätä `SAFE_BROWSING_API_KEY` GitHub Secretseihin.

---

## Vaihe 9: Ylläpitopaneeli – Safe Browsing -tarkistusnappi (valinnainen)

Jos `yllapito.tsx` sisältää linkkiehdotusten hallintanäkymän, lisää sinne "Tarkista Safe Browsingilla" -toiminto hyväksyttäville linkeille. Kutsu `safeBrowsingCheckNow`-funktiota samalla tavalla kuin `ncscScrapeNow` kutsutaan `scamAlerts.ts`-tiedostossa.

---

## Yhteenveto muutettavista tiedostoista

| Tiedosto | Muutos |
|---|---|
| `functions/safeBrowsing.ts` | **Uusi** – Safe Browsing API -moduuli |
| `functions/safeBrowsingCheck.ts` | **Uusi** – Cloud Function ylläpidolle |
| `functions/index.ts` | Lisää export |
| `functions/package.json` | Ei muutoksia (käyttää fetch, Node 20) |
| `firestore.rules` | Lisää `urlSafetyCache`-kokoelma |
| `scripts/update-links.mjs` | Lisää `checkSafeBrowsing`-kutsu ja integroi `evaluateUrlSafety`-funktioon |
| `.env.example` | Lisää `SAFE_BROWSING_API_KEY`-kommentti |
| `.github/workflows/link-audit.yml` | **Uusi** (valinnainen) – CI-automatisointi |

---

## Hyväksymiskriteerit

- [ ] `node scripts/update-links.mjs` ajaa ilman virheitä ilman API-avainta (degradoi siististi)
- [ ] `node scripts/update-links.mjs` tunnistaa testiuhkan kun `SAFE_BROWSING_API_KEY` on asetettu
  - Testaa: lisää `http://malware.testing.google.test/testing/malware/` tilapäisesti linkkilistaasi
- [ ] `safeBrowsingCheckNow` Cloud Function palauttaa 401 ilman tokenia
- [ ] `safeBrowsingCheckNow` palauttaa 403 ei-ylläpitäjätokenilla
- [ ] `safeBrowsingCheckNow` käyttää Firestore-välimuistia (toinen kutsu samalle URLille ei tee API-pyyntöä 24h sisällä)
- [ ] Firestore-säännöt estävät `urlSafetyCache`-kokoelman kirjoituksen asiakkaalta
- [ ] `docs/yllapito-linkkiloki.csv` sisältää sarakkeen "Turvallisuus" arvolla "uhka" Safe Browsing -löydöksille
- [ ] TypeScript-tyypit ovat oikein, `tsc` ei tuota virheitä `functions/`-hakemistossa
