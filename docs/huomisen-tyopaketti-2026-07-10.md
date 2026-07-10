# Huomisen työpaketti 10.7.2026

## Toteutus 10.7.2026

Työpaketti toteutettiin kriittisen korin osalta. Kuusi kuntaa, joilta puuttuivat sekä paikallinen tai seudullinen julkisen liikenteen linkki että palveluliikenteen linkki, käsiteltiin lähdepohjaisesti.

Lisättiin:

- Kinnula ja Kivijärvi: Tillgren Lines Kivijärvi-Kinnula julkisen liikenteen linkiksi.
- Kyyjärvi: OnniBus Kyyjärvi julkisen liikenteen linkiksi.
- Kihniö: A. Lamminmäki Kihniö-Parkano julkisen liikenteen linkiksi.
- Jämijärvi: Länsilinjat Jämijärvi julkisen liikenteen linkiksi.
- Multia: Multian asiointiliikenne palveluliikenteen linkiksi.
- Kainuu ja Ahvenanmaa: puuttuneet hyvinvointialueiden tiedotelinkit.

Ei lisätty:

- Kinnulan, Kivijärven, Kyyjärven, Kihniön ja Jämijärven palveluliikenteen linkkejä, koska nykyistä virallista käyttäjäsivua ei löytynyt.
- Multian julkisen liikenteen linkkiä, koska varma lähde löytyi vain kunnan asiointiliikenteelle.
- `localStats.ts`-päivitystä, koska `npm run links` on täysi DNS/HTTP/RDAP- ja sisältötarkistus, joka kirjoittaa monta linkkiraporttia. Kuntasivujen 308/308-luku varmistettiin lähdetiedostosta, mutta laajempi linkkiajo kannattaa tehdä omana huoltopakettinaan.

`npm run regional-coverage` päivitti raportit tilanteeseen:

| Kokonaisuus | Ennen | Jälkeen |
| --- | ---: | ---: |
| Julkinen liikenne valtakunnallisen fallbackin varassa | 89 | 84 |
| Palveluliikenteen oma linkki puuttuu | 124 | 123 |
| Sekä julkinen liikenne että palveluliikenne puuttuvat | 6 | 0 |

## Päätavoite

Saadaan alueellisten linkkien kriittisin jäljellä oleva aukko käsiteltyä lähdepohjaisesti: kunnat, joilta puuttuvat sekä oma tai seudullinen julkisen liikenteen linkki että palvelu-, asiointi- tai kutsuliikenteen linkki.

Tavoite ei ole täyttää kaikkia 124 palveluliikenteen puutetta eikä aloittaa 295 paikallisuutisen RSS-syötteen urakkaa. Huomisen hyvä tulos on pieni, tarkistettu ja julkaistavaksi kelpaava linkkierä sekä selkeä raportti siitä, mihin linkkiä ei lisätty lähteen puuttuessa.

## Lähtötilanne 9.7.2026

Koneellinen lähde on `outputs/regional-link-coverage.json`, joka on päivitetty komennolla `npm run regional-coverage`.

| Kokonaisuus | Tilanne |
| --- | ---: |
| Kuntia yhteensä | 308 |
| Julkinen liikenne valtakunnallisen fallbackin varassa | 89 |
| Palveluliikenteen oma linkki puuttuu | 124 |
| Paikallisuutisten RSS-syöte puuttuu | 295 |
| Sekä julkinen liikenne että palveluliikenne puuttuvat | 6 |

Lisäksi kuntien verkkosivut on täydennetty lähdetiedostossa `municipalityWebsites.ts` tasolle 308/308. `localStats.ts` näyttää vielä vanhaa kuntasivujen lukua, jos `scripts/update-links.mjs`-generointia ei ole ajettu kuntasivulisäyksen jälkeen.

Työpuussa on suunnittelun hetkellä myös aiempi `changelogData.ts`-muutos ja kaksi Office-tiedostoa. Niitä ei oteta mukaan linkkipaketin commitiin ilman erillistä päätöstä.

## Ehdotettu työjärjestys

### 1. Aamun nopea siistintä

Tarkistetaan ensin työpuun ja tilastojen tila:

- varmista `git status --short`
- varmista, että `municipalityWebsites.ts` sisältää 308 kuntasivua
- päätä, generoidaanko `localStats.ts` mukaan samaan korjauspakettiin
- jätä `changelogData.ts` rauhaan, ellei muutosloki tarkoituksella päivitetä
- jätä Office-tiedostot kokonaan stagingin ulkopuolelle

Hyväksyttävä lopputulos:

- tiedetään, mitkä tiedostot kuuluvat huomisen linkkierään
- Info-ikkunan kuntasivumäärä ei jää epähuomiossa vanhaksi, jos se halutaan samalla julkaisuvalmiiksi

Arvio:

- ihminen: 5-10 min
- Codex/toteutus: 10-20 min

### 2. Ensisijainen kori: molemmat liikennelinkit puuttuvat

Käydään läpi jäljellä oleva täyttöaalto samassa järjestyksessä kuin `docs/alueellisten-linkkien-tyojono-2026-07-08.md`.

| Prioriteetti | Alue | Kunnat | Tarkistus |
| ---: | --- | --- | --- |
| 1 | Keski-Suomen hyvinvointialue | Kinnula, Kivijärvi, Kyyjärvi, Multia | Julkinen liikenne, asiointiliikenne, palveluliikenne, kutsutaksi, kunnan liikennesivut |
| 2 | Pirkanmaan hyvinvointialue | Kihniö | Kunnan joukkoliikenne, asiointiliikenne, seudulliset yhteydet |
| 3 | Satakunnan hyvinvointialue | Jämijärvi | Kunnan sivu, Satakunnan seutuliikenne, mahdollinen palvelu- tai asiointiliikenne |

Hyväksy linkki vain, jos lähde on jokin näistä:

- kunnan oma verkkosivu tai kunnan virallinen palvelusivu
- seudullisen joukkoliikenneviranomaisen tai palveluntuottajan oma sivu
- hyvinvointialueen tai maakunnallisen palvelun virallinen sivu, jos se kattaa kunnan aidosti
- kunnan oma ohjaus naapurikunnan tai seudun palveluun
- palveluntuottajan oma sivu, jos se nimeää kunnan tai alueen selvästi

Älä lisää linkkiä pelkän hakutuloksen, vanhan uutisen, päättyneen kokeilun, talousarvioviitteen, arkiston tai epäselvän yrityshakemiston perusteella.

Hyväksyttävä lopputulos:

- jokaisesta kuudesta kunnasta on tehty päätös: lisätty linkki tai dokumentoitu hylkäysperuste
- `localServices.ts` ja/tai `localServiceTransportLinks.ts` muuttuvat vain vahvistetuilla linkeillä
- `npm run regional-coverage` päivittää kattavuusraportit

Arvio:

- ihminen: 20-40 min lähteiden arviointiin
- Codex/toteutus: 1,5-3 h riippuen lähteiden laadusta

### 3. Toissijainen kori: palveluliikenteen jatkotarkistus

Jos kuuden kunnan kori valmistuu ennen päivän puoliväliä, jatketaan palveluliikenteen aukoista. Ensisijaiset ryhmät ovat ne, joissa julkinen liikenne on jo saatu paikalliseksi tai seudulliseksi mutta palveluliikenne jäi auki.

| Alue | Kunnat |
| --- | --- |
| Pohjois-Pohjanmaa | Haapajärvi, Merijärvi, Pyhäjoki, Reisjärvi |
| Etelä-Karjala | Lemi, Luumäki, Taipalsaari |
| Kainuu | Kuhmo, Puolanka, Suomussalmi |
| Länsi-Uusimaa | Hanko, Inkoo, Raasepori |
| Keski-Pohjanmaa | Halsua, Kannus, Kaustinen, Lestijärvi, Perho, Toholampi, Veteli |

Tässä korissa ei tarvitse saada koko aluetta valmiiksi. Riittää, että löydetyt viralliset palveluliikennelinkit lisätään ja heikot osumat kirjataan avoimiksi.

### 4. Pieni aluepalvelukori

Jos liikennekori ei vaadi koko päivää, tarkistetaan vielä hyvinvointialueiden tiedotelinkit:

- Kainuu, koska `wellbeingAreaNewsUrls` ei sisällä koodia `20`
- Ahvenanmaa, koska `wellbeingAreaNewsUrls` ei sisällä koodia `91`

Hyvinvointialueiden päälinkit ovat jo datassa kaikille aluekoodeille. Kirjastolinkit eivät ole huomisen ensisijainen muutoskohde: jos niitä tarkistetaan, kattavuus pitää mitata per kunta eikä pelkällä `LOCAL_LINK_STATS.localLibraries`-luvulla, joka kuvaa paikallisia kirjastoalueita eikä suoraan 308 kunnan kattavuutta.

### 5. Dokumentointi ja validointi

Kun päivän linkit on lisätty:

- aja `npm run regional-coverage`
- päivitä tarvittaessa `docs/alueellisten-linkkien-tyojono-2026-07-08.md`
- päivitä tarvittaessa `docs/alueelliset-linkit-puuttuvat-kunnat.md`
- kirjaa lisätyt ja hylätyt lähteet lyhyesti
- aja `npm run build`
- aja `npx tsc --noEmit`
- aja `npm run check:secrets`
- aja `git diff --check`

`npm run links` jätetään pois, ellei erikseen haluta pitkää linkkiajoa.

## Mitä ei kannata tehdä huomenna

- ei aloiteta paikallisuutisten 295 RSS-syötteen täyttöä
- ei täytetä linkkejä ilman virallista lähdettä
- ei yhdistetä Office-tiedostoja tai keskeneräistä muutoslokia liikennecommitiin
- ei lisätä päättyneitä kokeiluja tai vanhoja tiedotteita käyttäjälinkeiksi
- ei julkaista Lighthouse-aineistoja GitHubiin

## Suositeltu päivän lopetus

Päivän lopussa pitäisi olla yksi selkeä kokonaisuus:

1. kriittinen kuuden kunnan kori käsitelty
2. coverage-raportti päivitetty
3. hyväksytyt ja hylätyt lähteet kirjattu
4. build, TypeScript, secret-check ja diff-check vihreänä
5. staging rajattu vain huomisen linkki- ja raporttitiedostoihin

Mahdollinen commit-viesti, jos käyttäjä pyytää julkaisun päivän päätteeksi:

`puuttuvien alueellisten liikennelinkkien jatkotäydennys`

## Aamun aloituskomennot

```powershell
git status --short
node -e "const fs=require('fs'); const text=fs.readFileSync('municipalityWebsites.ts','utf8'); console.log((text.match(/^  '[^']+':\s*'[^']+',?$/gm)||[]).length);"
npm run regional-coverage
```

Jos coverage pysyy odotetussa lähtötilanteessa, aloitetaan Keski-Suomesta kunnilla Kinnula, Kivijärvi, Kyyjärvi ja Multia.
