# Codex-tehtävä: tietosuojaselosteen selkokielistys tuotantoon

**Tunnisteet:** TS-01 (fi), TS-02 (sv + en), TS-03 (kuollut Gemini-koodi), TS-04 (provider-oletus)
**Päivä:** 31.8.2026
**Tila:** koodimuutokset tehty ja `tsc` puhdas. **Buildia ei ole ajettu.** Julkaisu on Codexin tehtävä.
**Lähtökohta:** HEAD `e18ced8`. Muutokset ovat työpuussa, **ei committia**.

---

## 1. Mitä on jo tehty

### TS-01 ja TS-02 — `tietosuoja.tsx`
`privacyTranslations` kirjoitettu uusiksi kaikilla kolmella kielellä (fi, sv, en).
Teksti on selkokielinen: suora puhuttelu, lyhyet virkkeet, vaikeat sanat selitetty.

- **Osioiden `id`-tunnisteet ovat ennallaan.** Vanhat ankkurilinkit (`#oikeudet`, `#kayttotilasto` jne.) toimivat.
- **Yksi uusi osio:** `id: 'sanasto'`, otsikko "Sanoja, jotka voivat olla vieraita". Se on osioiden `oikeudet` ja `yhteydenotto` välissä kaikilla kielillä.
- Otsikot muuttuivat kaikissa osioissa. Sisällysluettelo rakentuu otsikoista automaattisesti, joten se päivittyy itsestään.
- `PrivacySection`-komponenttia, tyylejä tai `publicPageLocalization.tsx`:ää **ei ole muutettu.**

Huom: `yhteydenotto`-osion viimeinen kappale saa yhä eri tyylin (`aurora-soft-panel`),
koska `PrivacySection` tunnistaa sen `id`:n perusteella. Tarkista silmämääräisesti että
päivämääräkappale näyttää oikealta — se on yhä osion viimeinen kappale.

### TS-03 — kuollut Gemini-koodi poistettu
Poistetut tiedostot:

- `services/geminiService.ts`
- `components/Assistant.tsx`
- `components/NewsFeed.tsx`
- `functions/gemini.ts`

Muutettu: `functions/index.ts` — rivi `export { geminiChat } from './gemini';` poistettu.
Muutettu: `.env.example` — rivi `VITE_GEMINI_CHAT_URL=` poistettu.

Perustelu: mikään ei renderöinyt `Assistant`- eikä `NewsFeed`-komponenttia. `App.tsx` ei
viitannut niihin, ja `NewsFeed` käytti `MOCK_NEWS`-testidataa. Koodi piti kuitenkin yllä
reittiä, jossa käyttäjän kirjoittama teksti olisi mennyt Googlelle ja App Check olisi
ladannut reCAPTCHAn — kumpaakaan tietosuojaseloste ei mainitse.

**TÄRKEÄÄ, ei tehty:** `services/ncscScraper.ts` käyttää yhä Geminiä (`GEMINI_API_KEY`,
malli `gemini-3-flash-preview`). Se on palvelinpuolen huijausvaroitusten käsittely, ja se
saa syötteekseen vain Kyberturvallisuuskeskuksen julkisia sivuja — **ei käyttäjien tietoja.**
Sitä **ei saa poistaa** ja seloste ei sitä tarvitse mainita.

**Tarkistettava Firebasessa:** lähdekoodin poisto ei poista jo julkaistua funktiota.
Tarkista `firebase functions:list`, ja jos `geminiChat` on yhä pystyssä, aja
`firebase functions:delete geminiChat`. Muuten pystyssä on julkinen päätepiste, jota
mikään seloste ei kuvaa.

### TS-04 — `services/data/providerConfig.ts`
Oletusprovider on nyt `cloudcity`. Aiemmin oletus oli `firebase-rollback`, jos
`VITE_DATA_PROVIDER` puuttui ja Firebase-avaimet olivat olemassa. Silloin käsin ajettu
`npm run build` olisi tehnyt nipun, joka kirjoittaa Firestoreen — ja seloste lupaa, että
palautteet ja käyttöluvut ovat Cloudcityn palvelimella. `hasFirebaseConfig` poistettiin
käyttämättömänä.

`firebase-rollback` toimii yhä, mutta vain nimenomaisella arvolla
(`.env.firebase-rollback` / `npm run build:firebase-rollback`). Paluusuunnitelma ei muutu.

---

## 2. Mitä Codexin pitää tehdä

### Vaihe 1 — käännä ja tarkista
```
node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
npm run build:cloudcity
```
`tsc` on ajettu ja se on puhdas. **Buildia ei ole ajettu**, koska tämän istunnon Linux-VM:ssä
`node_modules` sisältää Windows-binäärit (rollupin natiivimoduuli puuttuu). Aja build Windowsissa.

### Vaihe 2 — versio ja changelog
```
npm run release:prepare
```
Muutos on käyttäjälle näkyvä tekstimuutos kolmella kielellä, joten se ansaitsee oman
versionumeron. Kirjoita changelogiin selkokielinen kuvaus: seloste on kirjoitettu
selkokielelle, mukana uusi sanasto-osio.

### Vaihe 3 — paketointi ja julkaisu
```
npm run package:production-path
```
Skripti pakottaa `VITE_DATA_PROVIDER=cloudcity`, joten TS-04 ei muuta paketointia.
Julkaisu WordPress-polkuun normaalisti, ks. `TODO_HUMAN.md`.

### Vaihe 4 — testaa julkaisun jälkeen

| # | Testi | Odotettu |
| --- | --- | --- |
| TS-T1 | `/aloitus/tietosuoja.html` avautuu | Uusi teksti näkyy, otsikko "Tietosuoja" |
| TS-T2 | Sisällysluettelon jokainen linkki | Vie oikeaan osioon, myös uusi "Sanoja, jotka voivat olla vieraita" |
| TS-T3 | Vanha ankkurilinkki `#oikeudet` ja `#kayttotilasto` | Toimii yhä |
| TS-T4 | Kielenvaihto fi → sv → en | Kaikki kolme näyttävät selkokielisen version, ei sekakieltä |
| TS-T5 | `tietosuoja-sv.html` ja `tietosuoja-en.html` suoraan | Aukeavat oikealla kielellä |
| TS-T6 | Sähköpostilinkit | `nina.ziessler@vtkl.fi` ja `seniorsurf@vtkl.fi` avautuvat |
| TS-T7 | Tekstikoon suurennus ja tumma teema | Sanasto-osio pysyy luettavana, ei leikkaudu |
| TS-T8 | Näppäimistöllä läpi sivun | Fokusrengas näkyy jokaisessa sisällysluettelon linkissä (vrt. A11Y-03) |
| TS-T9 | Palautteen lähetys ja ylläpitonäkymä | Toimivat yhä — varmistaa ettei TS-04 rikkonut provider-valintaa |
| TS-T10 | Ylläpitäjän Google-kirjautuminen | Toimii yhä |

TS-T9 ja TS-T10 ovat tärkeimmät regressiotestit. Muut ovat tekstin tarkistusta.

---

## 3. Avoinna — älä julkaise ennen kuin nämä on ratkaistu

**1. Ninan hyväksyntä koko tekstille.**
Luonnos ja perustelut: `docs/tietosuoja-selkokieli-luonnos-2026-08-31.md`.
Teksti on jo koodissa, mutta sitä ei ole hyväksytetty tietosuojavastaavalla.

**2. EU:n ulkopuolinen siirto.** Osiossa "Missä tiedot säilytetään" lukee nyt:
*"Google on yhdysvaltalainen yritys. Siksi ylläpitäjän kirjautumistietoa voidaan käsitellä
myös EU:n ulkopuolella. Tämä ei koske sinua eikä muita sivun käyttäjiä."*
GDPR:n 13 artikla edellyttää mainintaa siirron perusteesta (esimerkiksi
vakiosopimuslausekkeet). Nina päättää: täydennetäänkö perusteella vai poistetaanko lause.
Sama lause on kaikilla kolmella kielellä.

**3. Ulkoasu, ei tehty.** Senioritestauksessa 83- ja 91-vuotiaat pitivät 15 osiota liian
pitkänä ja sanoivat "Lyhyesti"-laatikon riittävän. Ehdotus: nosta laatikko ingressin
yläpuolelle ja taita sisällysluettelo kiinni. Tämä koskettaa A11Y-testattua rakennetta,
joten se on oma tehtävänsä ja oma testikierroksensa. **Älä tee sitä tämän julkaisun mukana.**

---

## 4. Paluu

Kaikki muutokset ovat neljässä tiedostossa ja neljässä poistossa. Jos julkaisu pitää perua:
`git checkout -- tietosuoja.tsx services/data/providerConfig.ts functions/index.ts .env.example`
ja poistettujen tiedostojen palautus samasta committista `e18ced8`.

Tekstimuutos ja koodimuutokset kannattaa committoida erikseen, jotta selosteen tekstin voi
perua ilman että TS-03 ja TS-04 katoavat.
