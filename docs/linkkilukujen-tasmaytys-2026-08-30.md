# Mistä luku 5 199 tulee? Linkkilukujen täsmäytys

Päivitetty: 30.8.2026
Menetelmä: `linkit.tsx`:n laskenta toistettiin sellaisenaan sovelluksen omalla datalla (`municipalRegistry.ts`, `localServices.ts`, `constants.tsx`) ja tulokset verrattiin linkkikatalogiin. Laskenta tuotti täsmälleen samat luvut kuin käyttöliittymä — **947** ja **4 252** — joten alla oleva erittely on tarkka, ei arvio.

## Lyhyt vastaus

Luvut mittaavat eri asioita, ja **suurempi luku kattaa vähemmän eri osoitteita**.

| Luku | Mitä laskee | Osoitteita |
| --- | --- | ---: |
| **5 199** | Rivejä linkkiluettelossa | 1 825 eri osoitetta |
| **2 386** | Tarkistettavia osoitteita katalogissa | 2 386 eri osoitetta |

Linkkiluettelo listaa **jokaisen kunnan omat linkit erikseen**. Sama hyvinvointialueen tai maakuntalehden osoite toistuu niin monta kertaa kuin alueella on kuntia.

## 5 199 = 947 + 4 252

### Yleiset linkit: 947 riviä → 922 eri osoitetta

Nämä tulevat `constants.tsx`:n `SHORTCUTS`-rakenteesta. Rivi yksilöidään avaimella `kategoria|ryhmä|nimi|osoite`, joten sama osoite kahdessa kategoriassa on kaksi riviä. Ero 947 − 922 = 25 on juuri tätä.

### Alueelliset linkit: 4 252 riviä → vain 1 073 eri osoitetta

Rivi yksilöidään avaimella **`kunta`**`|kategoria|nimi|osoite`. Sama osoite lasketaan siis erikseen jokaiselle kunnalle, jolle se näytetään. Keskimäärin jokainen alueellinen osoite esiintyy **neljän kunnan** listalla.

| Kategoria | Rivejä |
| --- | ---: |
| Uutisvirrat | 917 |
| Alueelliset uutiset | 625 |
| Museot | 498 |
| Teatterit | 416 |
| Julkinen liikenne | 305 |
| Kunnan nettisivut | 301 |
| Hyvinvointialue | 284 |
| Kirjastot | 250 |
| Eläkeyhdistykset | 250 |
| Potilasyhdistykset | 235 |
| Palveluliikenne | 171 |
| **Yhteensä** | **4 252** |

Eniten toistuvat osoitteet:

| Kertaa | Osoite |
| ---: | --- |
| 113 | `krell.fi/yhdistykset/` |
| 88 | `spfpension.fi/foreningar/` |
| 81 | `reittiopas.matkahuolto.fi/` |
| 60 | `pohde.fi/ajankohtaista/` |
| 57 | `ilkkapohjalainen.fi/` |
| 54 | `varha.fi/fi/ajankohtaista` |
| 52 | `ouka.fi/oulun-taidemuseo` |
| 49 | `kaleva.fi/` |

Eläkeyhdistysten kattolinkki `krell.fi/yhdistykset/` näkyy 113 kunnan listalla ja tuottaa siis yksin 113 riviä luvusta 4 252. Se on yksi osoite, joka on tarkistettavana kerran.

### Yhdiste

947 riviä (922 osoitetta) + 4 252 riviä (1 073 osoitetta) = 5 199 riviä. Osoitteista 170 esiintyy sekä yleisissä että alueellisissa, joten eri osoitteita on **1 825**.

## Miksi katalogissa on enemmän: 563 osoitetta ei näy linkkiluettelossa

Vertailu on yksisuuntainen: **jokainen linkkiluettelon osoite on katalogissa, mutta 563 katalogin osoitetta ei ole linkkiluettelossa.**

| Lähdetiedosto | Puuttuu luettelosta |
| --- | ---: |
| `seniorSurfGuidancePlaces.ts` (digiopastuspaikat) | 256 |
| `municipalityWebsiteLocales.ts` (kuntien kieliversiot) | 207 |
| `localSportsClubs.ts` (urheiluseurat) | 45 |
| `localServices.ts` | 30 |
| `localServiceTransportLinks.ts` | 10 |
| `municipalityWebsites.ts` | 7 |
| Muut (sovelluksen omat, komponentit) | 8 |
| **Yhteensä** | **563** |

1 825 + 563 = 2 388, mistä päädytään katalogin 2 386:een, kun kaksi osoitetta yhdistyy normalisoinnissa (loppukauttaviiva).

**Linkkiluettelo ei siis ole täydellinen luettelo palvelun linkeistä.** Kolme suurinta puutetta:

1. **Digiopastuspaikat (256).** `seniorSurfGuidancePlaces.ts` on käytössä vain `services/guidancePlacesService.ts`-tiedostossa eli Lähelläsi-osion opastuspaikoissa. Se ei kulje linkkiluettelon läpi lainkaan.
2. **Kuntien kieliversiot (207/235).** Ruotsin-, englannin-, ukrainan-, viron-, venäjän- ja saamenkieliset kuntasivut näkyvät sovelluksessa, mutta eivät luettelossa.
3. **Urheiluseurat (45).** Koko kategoria puuttuu luettelosta.

## Mitä tästä seuraa

Kumpikaan luku ei ole väärin, mutta yhdessä ne ovat harhaanjohtavia: käyttäjä näkee 5 199 yhdellä sivulla ja 1 997 toisella, ja kumpikaan ei kerro mitä se laskee. Korjaus on tehtävässä **LC-15**:

- Erota termit **linkkiosoite** (uniikki URL, tarkistettava) ja **linkkiesiintymä** (rivi käyttöliittymässä, kunnat erikseen).
- Merkitse kumpi luku on kyseessä: esimerkiksi *"5 199 linkkiä kaikille kunnille yhteensä (1 825 eri osoitetta)"*.
- Täydennä linkkiluettelo tai kerro selvästi, mitä se ei sisällä.
- Ota Tietoa-sivun luku palvelimelta (katalogi − estetyt), älä vanhentuvasta `linkStats.ts`-tiedostosta.
