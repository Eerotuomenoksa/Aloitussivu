# E-02: Tilastoinnin GDPR-korjaus — saavutettavuus ennen markkinointia

**Eero päätös 2.9.2026:** Saavutettavuus ennen markkinointia. Poistetaan tilastoinnista `hour` (kellonaika), `url` (linkki) ja `src` (kampanja).

**Tila:** P1, ratkaistu 2.9. klo 07:45. Codex implementoi viikolla 36.

## Miksi

GDPR-vaatimus: Tilastoinnin perusteella ei saa tunnistaa käyttäjiä.

- **Aiemmin:** `hour + url + src` → voidaan seurata samaa käyttäjää historian perusteella (esim. "kirjeen saaja (src=kirje) klikkasi linkkiä X klo 09:15, seuraavana päivänä sama henkilö klikkasi Y") → henkilötieto → vaatii suostumuksen
- **Nyt:** Ainoastaan `page + category + entry + displayMode + step + value` (selain) → aggregoitu data, ei tunnistava → ei banneria tarvita

**Bonus:** Käyttäjälle selkeämpi UX (ei evästebanneria), koodi yksinkertaisempi.

## Mitä poistetaan

`usageTracking.ts` UsageEvent-tyypistä:

```typescript
export type UsageEvent = {
  type: 'pageview' | 'linkClick' | 'guide';
  page: string;
  // ❌ POISTETAAN: url?: string;
  label?: string;
  category?: string;
  entry?: 'direct' | 'internal' | 'seniorsurf' | 'search' | 'external';
  // ❌ POISTETAAN: hour?: number;
  // ❌ POISTETAAN: src?: string;
  displayMode?: 'browser' | 'standalone';
  step?: 'opened' | 'browser' | 'done' | 'shared';
  value?: string; // selain
};
```

## Mitä säilytetään

- `page` — mikä osio (linkit, ehdotukset, jne)
- `category` — linkin kategoria (terveys, kulttuuri, jne)
- `entry` — mistä käyttäjä tuli (direct, search, internal, external, seniorsurf)
- `displayMode` — browser vai asennettu sovellus
- `step` — onboarding-vaihe (opened, browser, done, shared)
- `value` — selain (chrome, safari, jne)

**Tulos:** Aggregoitu data: "Linkit-osiolla 250 klikkiä päivässä, kategoriasta terveys 50 kpl, kulttuuri 80 kpl"

## Kohdetiedostot

1. **usageTracking.ts** 
   - Poistetaan UsageEvent-tyypistä `url?`, `hour?`, `src?`
   - Päivitä `trackPageView()`, `trackLinkClick()`, `trackGuideStep()` poistamaan nämä arvot
   - Tarkista: ei kutsupaikoissa käytössä näitä kenttiä

2. **components/** ja **services/**
   - Etsi kaikki kutsut `trackPageView`, `trackLinkClick`, `trackGuideStep`
   - Poista näiltä riveilty: hour, url, src
   - Grep-etsinnti: `grep -r "trackPageView\|trackLinkClick\|trackGuideStep" components/ services/ --include="*.tsx" --include="*.ts"`

3. **docs/tietosuoja-selkokieli-luonnos-2026-08-31.md**
   - Osio 4 "Kerättävät henkilötiedot" → päivitä:
   - Aikaisemmin: "Kellonaika ja klikattu linkki"
   - Nyt: "Osion tyyppi (linkit, etusivu, jne) ja linkin kategoria, mutta ei kellonaikaa eikä yksittäistä linkkiä"

## Testaus

- [ ] `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` → ei virheitä
- [ ] `npm run build` (pilvikontti) → ei virheitä
- [ ] DevTools Console → ei varoituksia usageTracking-funktioista
- [ ] Tilastointi-näkymät (jos verkossa testataan) → näyttävät vain kategorioita/osiota, ei kellonaikoja

## Vaikutus muuhun

**TS-01 luonnos:** Nina voi nyt hyväksyä ilman evästekysymystä. Korjaus tekee selosteesta laillisen.

**TS-05, SA-01:** Voidaan tehdä T-04 (paikkakunta-luokittelu) jälkeen.

**MK-04, KO-01:** Riippumattomat, voidaan tehdä rinnalla.

---

**Lisätiedot:** Kollegien palautekierros 2.9.2026, GDPR-arvio tehty 2.9. klo 07:45, analyysi tallenna projektin muistioon `/areas/aloitussivu-kollegit-2026-09-02`.
