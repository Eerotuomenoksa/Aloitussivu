# Codex-tehtävä: markkinointilinkkien `?src=`-arvot

Päivitetty: 31.8.2026
Tila: toteutettu, testattu ja aktivoitu tuotantoon versiossa 0.77.9 31.8.2026
Lähde: Eeron ja Clauden keskustelu 31.8.2026, markkinointisuunnitelman kanavalista
Koskee: `usageTracking.ts`, `api/src/PublicApi.php`, `api/tests/run.php`
Liittyy: `docs/codex-tehtava-kayttotilastot-ja-aloitussivuksi-asetus.md`, `docs/markkinointisuunnitelma-2026-2027.md` (luku 6)

## Miksi

Kampanjalinkeissä käytetään `?src=`-parametria, jotta nähdään mikä kanava tuottaa kävijöitä. Nykyinen sallittujen arvojen lista on kuitenkin kahdella tavalla pielessä.

**1. Lista sekoittaa kanavan ja muodon.** `opastus`, `some` ja `lehti` kertovat mistä kanavasta ihminen tuli. `qr` kertoo missä muodossa linkki oli. Ne ovat eri asioita, eikä yksi parametri voi olla molempia: opastajan kortin QR-koodi on yhtä aikaa `opastus` ja `qr`. Siksi `qr` poistetaan ja **`src` tarkoittaa jatkossa vain kanavaa**.

**2. Markkinointisuunnitelman kanavia puuttuu.** Suunnitelma nojaa kanaviin `juttunetti`, `tyopaikka`, `pankki`, `kirjasto` ja `koulu`, joita lista ei tunne. Selain normalisoi tuntemattoman arvon muotoon `other` (`usageTracking.ts:105`), joten näiden kanavien kävijät eivät katoa — mutta ne sulautuvat yhdeksi `other`-luvuksi eivätkä erotu toisistaan. Silloin kanavakohtaista tulosarviota ei voi tehdä juuri niiltä kanavilta, joita suunnitelma eniten korostaa.

Muutos on tehtävä **ennen kuin näiden kanavien ensimmäinen linkki julkaistaan**. Painettuun materiaaliin ei voi lisätä parametria jälkikäteen.

## Päätetty lista

| Arvo | Kanava | Tila |
| --- | --- | --- |
| `opastus` | Opastustilanne, opastajan antama A5-kortti | On jo listalla. **Käytössä painetussa kortissa** (`docs/a5-opastuskortti.pdf`). |
| `kirje` | Digiopastajien uutiskirje (Liana Mail) | On jo listalla |
| `some` | SeniorSurfin ja VTKL:n sosiaalinen media | On jo listalla |
| `esite` | Messuilla ja tapahtumissa jaettava yleisesite | On jo listalla |
| `lehti` | Media ja lehtijutut | On jo listalla |
| `esittely` | Aloitussivun esittelysivu seniorsurf.fi:ssä | **Lisättävä** |
| `vtkl` | vtkl.fi:n sivut | **Lisättävä** |
| `juttunetti` | Juttunetti | **Lisättävä** |
| `tyopaikka` | Työnantajien henkilöstökirjeet ja intrat | **Lisättävä** |
| `pankki` | Pankkien konttorit ja senioritilaisuudet | **Lisättävä** |
| `kirjasto` | Kirjastot | **Lisättävä** |
| `koulu` | Koulut, partio, 4H, seurakuntien nuorisotyö | **Lisättävä** |
| `qr` | — | **Poistettava**, ks. MK-02 |
| `other` | Järjestelmän varmistus tuntemattomille arvoille | Vain palvelimella. **Ei koskaan kirjoiteta linkkiin.** |

Arvot ovat pieniä kirjaimia, ilman ääkkösiä ja välimerkkejä, enintään 32 merkkiä.

## MK-01 · Täydennä sallitut arvot kahteen paikkaan (P1)

Lista on määritelty **kahdessa tiedostossa, ja molemmat on päivitettävä**. Jos vain toinen päivitetään, arvo joko hylätään palvelimella tai muuttuu selaimessa arvoksi `other` — kummassakaan tapauksessa mittaus ei toimi, eikä mikään anna virheilmoitusta.

1. **`usageTracking.ts` rivi 26** — `ALLOWED_CAMPAIGN_SOURCES`. Tämä lista **ei sisällä arvoa `other`**, koska `other` on se arvo, joksi tuntematon syöte muunnetaan (rivi 105). Älä lisää sitä tänne.
2. **`api/src/PublicApi.php` rivi 19** — `ALLOWED_CONTEXT['src']`. Tämä lista **sisältää arvon `other`**, koska selain lähettää sen.

Molempien listojen on sisällettävä samat kanava-arvot samassa järjestyksessä, jotta ero on silmämääräisesti helppo tarkistaa. Ainoa sallittu ero on `other`, joka on vain palvelimen listalla.

### Hyväksymiskriteerit

- `GET /aloitus/?src=juttunetti` kirjaa `usage_context_daily`-tauluun rivin, jonka `dimension` on `src` ja `bucket` on `juttunetti` — ei `other`.
- Sama toimii arvoille `esittely`, `vtkl`, `tyopaikka`, `pankki`, `kirjasto` ja `koulu`.
- Tuntematon arvo, esimerkiksi `?src=facebook-kampanja-3`, kirjautuu edelleen arvona `other`.

## MK-02 · Poista `qr` (P1)

Poista `qr` molemmilta listoilta.

### HUOM: tämä rikkoo olemassa olevan testin

`api/tests/run.php` rivi **1634** käyttää arvoa `'src' => 'qr'` esimerkkinä *sallitusta* arvosta testissä `usage pageview context and guide funnel are stored only as allowed daily buckets`. Kun `qr` poistetaan, testi kaatuu.

Korjaa se vaihtamalla arvoksi `'src' => 'opastus'`. Älä poista testiä äläkä löysennä sen tarkistuksia.

Saman testin toinen osa (rivi 1655) käyttää arvoa `'src' => 'free-text-campaign'` esimerkkinä *hylätystä* arvosta. Se toimii ennallaan, älä koske siihen.

### Vanha data

Jos `usage_context_daily`-taulussa on ennestään rivejä, joiden `bucket` on `qr`, ne jäävät paikoilleen. **Älä poista niitä** eikä tee migraatiota — historiadata on historiadataa, ja rivejä on korkeintaan muutama pehmeän avauksen ajalta.

## MK-03 · Päivitä dokumentaatio (P2)

Kun MK-01 ja MK-02 on tehty, päivitä lista näihin:

- `docs/markkinointisuunnitelma-2026-2027.md` luku 6, jossa lukee vielä vanha lista. **Huom:** tiedostosta on olemassa päivitetty versio `docs/markkinointisuunnitelma-2026-2027.PAIVITETTY-31-8.md`, jota ei ole vielä yhdistetty alkuperäiseen. Tarkista tilanne ennen muokkausta, ettei työ mene päällekkäin.
- `docs/codex-tehtava-kayttotilastot-ja-aloitussivuksi-asetus.md`, jos siinä on arvolista.

## Mitä EI tehdä

- **Ei tietokantamigraatiota.** `usage_context_daily.bucket` on `VARCHAR(32)` (`database/migrations/003_usage_context_daily.sql`) eikä sisällä ENUM-rajoitusta. Pisin uusi arvo on `juttunetti`, 10 merkkiä. Migraatiota ei tarvita.
- **Älä nimeä uudelleen olemassa olevia arvoja.** `opastus` on jo painettuna A5-kortin QR-koodissa. Uudelleennimeäminen tekisi painetusta erästä mittauskelvottoman.
- **Älä lisää ylläpitonäkymään src-jakauman esitystä tässä tehtävässä.** Sellaista ei ole vielä olemassa, ja se on oma työnsä.
- **Älä lisää `other`-arvoa selaimen listalle.** Se rikkoisi tuntemattomien arvojen normalisoinnin logiikan.

## Huomio: omilta sivuilta tuleva liikenne

Liikenne `seniorsurf.fi`-sivuilta tunnistetaan jo ilman `src`-parametria: `getReferrerCategory` (`usageTracking.ts:79`) kirjaa sen arvona `entry=seniorsurf`. Arvo `esittely` ei siis korvaa tuota vaan tarkentaa sitä — se erottaa nimenomaan aloitussivun esittelysivun muista seniorsurf.fi:n sivuista. Molemmat kirjautuvat, eivätkä ne ole ristiriidassa.

`vtkl.fi` sen sijaan kirjautuu arvona `entry=external` samaan kasaan kaikkien muiden ulkopuolisten sivustojen kanssa, joten sille parametri on pakollinen.

## Testaus

```
node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
php api/tests/run.php
```

Molempien on mentävä läpi. `php -l api/src/PublicApi.php` on nopea esitarkistus.

Lisäksi manuaalisesti: avaa `/aloitus/?src=juttunetti`, tarkista että parametri katoaa osoiteriviltä latauksen jälkeen ja että arvo kirjautuu oikein — ei arvona `other`.

## Hyväksymiskriteerit koko tehtävälle

1. Molemmat listat sisältävät samat 12 kanava-arvoa, palvelimen lista lisäksi arvon `other`.
2. `qr` ei ole kummallakaan listalla.
3. `php api/tests/run.php` menee läpi, ja rivin 1634 testi käyttää arvoa `opastus`.
4. `tsc --noEmit` on puhdas.
5. Tuntematon `?src=`-arvo kirjautuu edelleen arvona `other` eikä kaada mitään.
