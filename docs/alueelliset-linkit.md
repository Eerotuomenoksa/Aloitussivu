# Alueelliset linkit

Päivitetty: 13.7.2026

Tämä on alueellisten linkkien käsin ylläpidettävä päädokumentti. Kattavuusluvut otetaan aina koneellisista JSON-raporteista, ei vanhoista käsin kirjoitetuista arvioista.

## Lähdetiedostot ja raportit

| Kokonaisuus | Datatiedostot | Generoitu raportti | Päivityskomento |
| --- | --- | --- | --- |
| Julkinen liikenne, palveluliikenne ja paikallisuutisten RSS-status | `localServices.ts`, `localServiceTransportLinks.ts`, `localNewspaperFeeds.ts`, `municipalityNewsFeeds.ts` | `docs/alueelliset-linkit-puuttuvat-kunnat.md`, `outputs/regional-link-coverage.json` | `npm run regional-coverage` |
| Uutisvirtojen tarkempi kattavuus | `localNewspaperFeeds.ts`, `municipalityNewsFeeds.ts`, `localServices.ts` | `docs/alueelliset-uutisfeedit-kattavuus.md`, `docs/alueelliset-uutisfeedit-kattavuus.csv`, `outputs/regional-news-feed-coverage.json` | `node scripts/update-news-feed-coverage.mjs` |
| Paikallislehtien RSS-lista | `localNewspaperLinks.ts`, `localNewspaperFeeds.ts`, `scripts/update-newspaper-feeds.mjs` | `docs/paikallisuutiset-puuttuvat-kunnat.md` | `npm run newspaper-feeds` |
| Museot, eläkeyhdistykset ja potilasyhdistykset | `museumLinks.ts`, `seniorAssociationLinks.ts`, `patientAssociationLinks.ts` | `docs/alueelliset-yhteisolinkit-kattavuus.md`, `outputs/regional-community-link-coverage.json` | `npm run community-coverage` |

Generoituja raportteja ei yhdistetä tähän käsin. Ne saavat pysyä erillisinä, koska skriptit kirjoittavat ne uudelleen.

## Nykyinen tilanne

Koneellinen lähde: `outputs/regional-link-coverage.json` ja `outputs/regional-news-feed-coverage.json`.

| Kori | Nykytila 13.7.2026 |
| --- | ---: |
| Julkinen liikenne: oma tai seudullinen linkki | 227 / 308 kuntaa |
| Julkinen liikenne: valtakunnallisen fallbackin varassa | 81 kuntaa |
| Palveluliikenne: oma linkki datassa | 195 / 308 kuntaa |
| Palveluliikenne: oma linkki puuttuu | 113 kuntaa |
| Paikallisuutisten RSS tai uutisfeed `regional-link-coverage`-raportissa | 219 / 308 kuntaa |
| Paikallisuutisten RSS tai feed puuttuu `regional-link-coverage`-raportissa | 89 kuntaa |
| Oma uutisvirta tarkemmassa uutisraportissa | 224 / 308 kuntaa |
| Vain hyvinvointialueen uutisten varassa tarkemmassa uutisraportissa | 84 kuntaa |
| Kunnat, joilta puuttuvat seudullinen/oma julkinen liikenne sekä palveluliikenne | 0 kuntaa |

RSS-lukujen ero on tarkoituksellinen: `regional-link-coverage` mittaa linkkikategoriaa karkeammin, kun taas `regional-news-feed-coverage` erottaa paikallislehden syötteen, kunnan oman uutisvirran ja hyvinvointialuefallbackin.

Yhteisolinkkien nykytila `outputs/regional-community-link-coverage.json`-raportissa:

| Kori | Linkkejä | Kuntia, joissa paikallinen tai alueellinen osuma |
| --- | ---: | ---: |
| Eläkeyhdistykset | 17 | 97 |
| Potilasyhdistykset | 107 | 168 |
| Museot | 44 | 20 |

Näissä koreissa puuttuva paikallinen osuma ei tarkoita, että jokaiselle kunnalle pitää löytää oma linkki. Valtakunnallinen tai alueellinen toimija voi olla oikea ratkaisu, jos kattavuus on lähteestä selvä.

## Hyväksymissäännöt

Perussääntö: ei lähdettä, ei linkkiä.

Hyväksy linkki vain, jos jokin näistä vahvistaa alueellisen kattavuuden:

- kunnan oma verkkosivu tai virallinen palvelusivu
- seudullisen joukkoliikenneviranomaisen tai palveluntuottajan oma sivu
- hyvinvointialueen, maakunnallisen palvelun tai virallisen kirjastokimpan sivu
- kunnan sivulta löytyvä ohjaus naapurikunnan tai seudun palveluun
- palveluntuottajan oma sivu, jos se nimeää kunnan tai alueen selvästi
- uutisissa lehden oma sivu, mediakortti, jakelu-/levikkialue, kuntakohtainen osasto tai toimituksellinen kuvaus

Älä lisää linkkiä pelkän hakutuloksen, konserniomistuksen, vanhan uutisen, arkistosivun, päättyneen kokeilun tai epäselvän yrityshakemiston perusteella.

## Tietomalli

Alueelliselle tai naapurikunnan linkille kirjataan tarpeen mukaan:

- `municipality` tai `municipalities`
- `area` tai `sourceArea`
- `scope`, esimerkiksi `regional`, `neighbor` tai `nationalFallback`
- `sourceMunicipality`, jos linkki kuuluu toiseen kuntaan
- `fallbackFor`, jos linkkiä näytetään muille kunnille
- `sourceNote`
- `verifiedAt`

Naapurikunnan linkki on sallittu vain, jos käyttäjän oma kunta, palveluntuottaja tai seudullinen lähde vahvistaa sen soveltuvuuden. Käyttöliittymän pitää näyttää alkuperä: oman kunnan palvelu, seudullinen palvelu, hyvinvointialue, naapurikunnan palvelu tai valtakunnallinen haku.

## Uutiset ja seutulehdet

Paikallisuutisten järjestys:

1. Paikallislehden tai paikallislehtiperheen RSS/Atom-syöte, kun kunta kuuluu selvästi lehden alueeseen.
2. Kunnan oma uutis-, ajankohtaista- tai tiedotesyöte.
3. Kunnan uutis- tai ajankohtaista-sivu ilman syötettä tavallisena uutislinkkinä.
4. Hyvinvointialueen uutiset tai tiedotteet fallbackina.
5. Maakunta- tai seutulehden paikallissivu vain, jos rajaus kuntaan tai seutuun on uskottava.

Monikuntalehtiä ei saa mapittaa kunnille pelkän omistajan tai lehtiperheen perusteella. Hyväksy kunta mukaan vasta, kun lehden oma sivu, levikki-/jakelualue, kuntakohtainen osasto tai toimituksellinen kuvaus kertoo kunnan kuuluvan lehden uutisalueeseen.

13.7.2026 seutulehtitarkistuksessa lisättiin vahvistettuja paikallislehti-RSS-mapityksiä ja tavallisia alueuutislinkkejä. UutisOiva lisättiin tavalliseksi alueuutislinkiksi kunnille Hämeenkyrö, Ikaalinen, Jämijärvi ja Ylöjärvi, koska Viljakkala kuuluu nykyisin Ylöjärveen ja `https://oivaseutu.fi/feed/` palautti 404-sivun. RSS-listaan sitä ei lisätty.

Jatkoon ovat edelleen hyviä uutishakukohteita etenkin:

- Länsi-Uusimaa ja pääkaupunkiseutu: Länsi-Uusimaa, Länsiväylä, Vihdin Uutiset, Karkkilalainen, Keski-Uusimaa ja Uusimaa
- Kanta-Häme ja Lahden suunta: Keski-Häme ja muut selkeästi rajatut paikallis- tai seutulehdet
- Kymenlaakso: Keskilaakso ja muut kuntakattavuudeltaan vahvistettavat lehdet
- yksittäiset paikallislehtiehdokkaat, jotka ovat `docs/paikallisuutiset-puuttuvat-kunnat.md`-raportissa ilman kuntamappausta

## Työjärjestys

Tee ylläpitokerta pienenä, lähdepohjaisena korina. Hyvä koko on yksi hyvinvointialue, maakunta tai 5-10 kuntaa.

1. Tarkista ensin `git status --short`.
2. Lue ajantasainen koneellinen raportti.
3. Hae vain virallisista tai muuten vahvoista lähteistä.
4. Paikkaa vain vahvistetut linkit dataan.
5. Kirjaa lisäykselle lähde ja tarkistuspäivä.
6. Aja tarvittava coverage-komento.
7. Aja validointi ennen julkaisua.

Tämänhetkiset käytännön prioriteetit:

| Prioriteetti | Kori | Nykyiset suurimmat aukot |
| ---: | --- | --- |
| 1 | Palveluliikenne | Ahvenanmaa 16, Pohjois-Pohjanmaa 13, Satakunta 13, Varsinais-Suomi 9, Pohjanmaa 8, Keski-Pohjanmaa 7, Keski-Suomi 7, Länsi-Uusimaa 7 |
| 2 | Julkinen liikenne | Pohjois-Pohjanmaa 12, Lappi 9, Pirkanmaa 9, Etelä-Pohjanmaa 7, Etelä-Savo 7, Pohjois-Karjala 6 |
| 3 | Uutisvirrat | Ahvenanmaa 13, Lappi 12, Etelä-Pohjanmaa 7, Pirkanmaa 6, Pohjanmaa 6, Pohjois-Pohjanmaa 6 |
| 4 | Yhteisolinkit | Eläkeyhdistysten, potilasyhdistysten ja museoiden kattavuutta jatketaan järjestö tai aihe kerrallaan, ei kunnittain pakottaen |

Vanha kriittinen kori, jossa sekä julkinen liikenne että palveluliikenne puuttuivat, on valmis: nykyinen määrä on 0 kuntaa.

## Validointi

Liikenne- tai palveluliikennemuutoksen jälkeen:

```powershell
npm run regional-coverage
npm run build
npx tsc --noEmit
npm run check:secrets
git diff --check
```

Uutisfeedimuutoksen jälkeen:

```powershell
npm run newspaper-feeds
node scripts/update-news-feed-coverage.mjs
npm run regional-coverage
npm run build
npx tsc --noEmit
npm run check:secrets
git diff --check
```

Yhteisolinkkien muutoksen jälkeen:

```powershell
npm run community-coverage
npm run build
npx tsc --noEmit
npm run check:secrets
git diff --check
```

`npm run links` on hidas täysi linkkiajo. Aja se erikseen vain, kun halutaan päivittää linkkistatistiikat ja CSV-raportit.

## Korvatut dokumentit

Tämä päädokumentti korvaa aiemmat käsin ylläpidetyt suunnitelma-, työpaketti- ja tarkistusmuistiot. Historiallinen yksityiskohta löytyy tarvittaessa git-historiasta.

Korvatut tiedostot:

- `docs/puuttuvien-alueellisten-linkkien-taydennyssuunnitelma.md`
- `docs/alueellisten-linkkien-tyojono-2026-07-08.md`
- `docs/alueellisten-linkkien-tyopaketit-2026-07-10.md`
- `docs/huomisen-tyopaketti-2026-07-10.md`
- `docs/alueelliset-uutislahteet-jatkotarkistus-2026-07-11.md`
- `docs/seutulehdet-tarkistus-2026-07-13.md`
