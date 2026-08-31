# Codex-tehtävä: kolmannen osapuolen palvelut — läpinäkyvyys ja riippuvuuksien vähentäminen

Päivitetty: 30.8.2026
Eeron päätös: toteutetaan kaikki kolme tasoa (KO-01, KO-02, KO-03).
Koskee: `tietosuoja.tsx`, `services/rssService.ts`, `components/WeatherCard.tsx`, `municipalRegistry.ts`, `api/src/`, `api/cron/`

## Miksi

Sovellus kutsuu käyttäjän selaimesta **suoraan kolmea ulkopuolista palvelua**, joita palvelu ei omista eikä valvo. Jokainen niistä saa käyttäjän IP-osoitteen, ja yksi saa tarkat koordinaatit.

| Palvelu | Missä | Mitä tekee | Mitä sille lähtee |
| --- | --- | --- | --- |
| `nominatim.openstreetmap.org` | `components/WeatherCard.tsx:254` | Muuntaa sijainnin kunnan nimeksi | **Tarkat koordinaatit** + IP |
| `api.rss2json.com` | `services/rssService.ts:51` | Hakee RSS-syötteen kun suora haku estyy CORSiin | Syötteen osoite + IP |
| `api.allorigins.win` | `services/rssService.ts:74` | Yleinen CORS-välitys uutissivun HTML:lle | Haettava osoite + IP |

Kaksi ongelmaa:

1. **Tietosuojaseloste ei mainitse yhtäkään niistä.** Tarkistettu 30.8.2026: `tietosuoja.tsx` ei sisällä sanoja nominatim, openstreetmap, rss2json, allorigins eikä open-meteo. Selosteessa on 39 osiota, eikä yhdessäkään kerrota näistä luovutuksista.
2. **Ne ovat ilmaisia palveluita ilman palvelutasolupausta, eikä mikään valvo niitä.** Jos jokin kaatuu, paikallisuutiset tai sään kunnantunnistus lakkaavat toimimasta hiljaisesti. Linkkitarkistus ei huomaa mitään, koska nämä eivät ole linkkejä.

Nominatimin osalta on lisäksi konkreettinen käyttöehto: OpenStreetMap sallii enintään yhden pyynnön sekunnissa ja edellyttää tunnistettavaa User-Agentia. Jos palvelu yleistyy, liikenne voidaan estää kokonaan.

**Missä järjestyksessä kutsutaan** (`services/rssService.ts:180` `fetchOneFeed`): suora haku → rss2json → uutissivun HTML allorigins-välityksellä. `fetchWeather` (`WeatherCard.tsx:355`) kutsuu Nominatimia **vain** kun kotikuntaa ei ole valittuna ja käyttäjä sallii paikannuksen; kotikunnan ollessa valittuna käytetään `geocoding-api.open-meteo.com`-nimihakua.

---

## KO-01 · Tietosuojaselosteeseen oma osio (P1, tehdään ensin)

Tämä on pienin työ ja korjaa läpinäkyvyyden heti, riippumatta siitä ehtiikö KO-02 ja KO-03 tehdä.

### Mitä tehdä

Lisää `tietosuoja.tsx`:n `sections`-taulukkoon **kaikkiin kolmeen kieleen** (fi, sv, en) uusi osio, esimerkiksi `id: 'kolmannen-osapuolen-palvelut'`, otsikolla **"Palvelut, joita sivu käyttää"**. Sijoita se sen osion jälkeen, joka kertoo mitä laitteelle tallennetaan.

Osion on kerrottava suoraan ja ilman tietosuojatermejä:

- Sään näyttämiseen käytetään **Open-Meteo**-palvelua, jolle lähtee sijainnin koordinaatit.
- Jos käyttäjä sallii paikannuksen eikä kotikuntaa ole valittu, koordinaatit lähetetään **OpenStreetMapin Nominatim**-palveluun kunnan nimen selvittämiseksi. **Jos kotikunta on valittu, tätä ei tehdä.**
- Paikallisuutisten hakuun käytetään tarvittaessa **rss2json**- ja **allorigins**-välityspalveluita, jos lehden oma syöte ei aukea suoraan.
- Näille palveluille välittyy käyttäjän IP-osoite, kuten aina kun selain hakee jotain toiselta sivustolta.
- **Mitään näistä ei tallenneta aloitussivun omiin järjestelmiin.**

Kirjoita teksti kohderyhmälle: lyhyet lauseet, ei sanoja kuten "kolmas osapuoli" tai "tietojen luovutus" ilman selitystä. Käytä `docs`-kansiossa olevaa `seniorit-digi-ohjeet`-linjaa: enintään noin 15 sanaa lauseessa.

Lisää sama tieto myös selosteen tiivistelmään (`summaryItems`), yhdellä rivillä.

### Hyväksymiskriteerit

- Selosteesta löytyy hakusanoilla Nominatim, Open-Meteo, rss2json ja allorigins.
- Osio on kaikilla kolmella kielellä.
- Teksti kertoo myös sen, milloin Nominatimia **ei** kutsuta.

---

## KO-02 · RSS-haku palvelimelle (P2)

Poistaa `rss2json`- ja `allorigins`-riippuvuudet kokonaan ja lopettaa käyttäjän IP-osoitteen välittymisen niille.

### Miksi tämä on luonteva

Repossa on **jo valmis malli**: `api/src/NcscJob.php`, `HttpNcscSource.php` ja `api/cron/ncsc.php` hakevat Kyberturvallisuuskeskuksen RSS-syötteen palvelimelta ja tallentavat tuloksen. Sama rakenne sopii paikallisuutisille sellaisenaan.

### Mitä tehdä

1. Uusi cron-työ `api/cron/news-feeds.php` ja luokka `api/src/NewsFeedJob.php`, joka hakee syötteet erissä ja tallentaa tuoreimmat otsikot tietokantaan. Käytä samoja turvallisuusrajoja kuin `HttpLinkChecker`issa: vain HTTPS, DNS-tarkistus, yksityisten osoitealueiden esto, aikakatkaisu.
2. Uusi julkinen päätepiste `GET /api/v1/news?municipality=<kunta>`, joka palauttaa valmiiksi haetut otsikot.
3. `services/rssService.ts` kutsuu tätä päätepistettä. **Poista `fetchRss2JsonFeed` ja `fetchTextWithCorsFallback` kokonaan.**
4. Välimuistin tuoreus: syötteet haetaan esimerkiksi 30 minuutin välein. Uutisotsikko saa olla puoli tuntia vanha; se ei ole kriittistä tietoa.
5. **Älä välimuistita huijausvaroituksia tai linkkiestoja tähän samaan mekanismiin** — ne on saatava tuoreina.

### Sivuhyöty

Palvelin voi tallentaa syötteen viimeisimmän kohteen päivämäärän, mikä ratkaisee samalla tehtävän **LC-14**: 297 uutissyötettä läpäisee saatavuustarkistuksen, mutta mikään ei tällä hetkellä huomaa jos syöte on lakannut päivittymästä.

### Hyväksymiskriteerit

- Selaimen verkkovälilehdellä ei näy yhtään pyyntöä `rss2json`- tai `allorigins`-palveluun.
- Paikallisuutiset toimivat kuten ennen.
- Syötteen tuoreus on nähtävissä ylläpitonäkymässä.

---

## KO-03 · Nominatim korvataan omalla kuntahaulla (P2)

Poistaa viimeisen palvelun, jolle lähtee käyttäjän tarkka sijainti.

### Este, joka on ratkaistava ensin

`municipalRegistry.ts` sisältää 308 kunnan tiedot, mutta **siinä ei ole koordinaatteja** — vain `code`, `name`, `wellbeingAreaCode` ja `wellbeingAreaName`.

### Mitä tehdä

1. **Kertaluontoinen skripti** `scripts/update-municipality-coordinates.mjs`, joka hakee jokaiselle kunnalle keskipisteen koordinaatit ja kirjoittaa ne `municipalRegistry.ts`-tiedostoon (`lat`, `lon`). Lähteenä voi käyttää joko Tilastokeskuksen aineistoa tai `geocoding-api.open-meteo.com`-nimihakua, jota sovellus jo käyttää (`WeatherCard.tsx:313`). Aja skripti kerran; tulos on staattista dataa eikä sitä tarvitse päivittää kuin kuntaliitosten yhteydessä.
2. **Korvaa Nominatim-kutsu** lähimmän kunnan päättelyllä selaimessa: laske haversine-etäisyys käyttäjän koordinaateista jokaiseen kuntaan ja valitse lähin. 308 vertailua on selaimessa mitätön työ.
3. **Rajaa Suomeen.** Jos lähin kunta on kauempana kuin esimerkiksi 100 km, käyttäjä on todennäköisesti ulkomailla — käytä nykyistä `isInFinland: false` -polkua eikä pakota kuntaa.
4. **Poista `nominatim.openstreetmap.org`-kutsu** `WeatherCard.tsx`:stä ja päivitä `docs/linkit-lisaosoitteet.json`-tiedoston `eiTarkisteta`-lista.

### Mitä tällä menetetään

Nominatim palauttaa myös maakoodin ja kaupunginosan tarkkuudella olevan nimen. Lähimmän kunnan päättely antaa vain kunnan. Kohderyhmän kannalta se riittää: sovellus tarvitsee kunnan, ei katuosoitetta. Ulkomaan tunnistus hoituu etäisyysrajalla.

### Sivuhyöty

Sää alkaa toimia myös silloin kun Nominatim on alhaalla tai rajoittaa liikennettä.

### Hyväksymiskriteerit

- Selaimen verkkovälilehdellä ei näy pyyntöä `nominatim.openstreetmap.org`-palveluun missään tilanteessa.
- Paikannuksen salliminen tuottaa oikean kunnan vähintään 20 testikunnalla eri puolilta Suomea.
- Tukholman koordinaateilla sovellus ei väitä käyttäjän olevan suomalaisessa kunnassa.

---

## KO-04 · Rajapintojen valvonta (P2)

Kun KO-02 ja KO-03 on tehty, ulkopuolisia riippuvuuksia jää kaksi: `api.open-meteo.com` (sää) ja `geocoding-api.open-meteo.com` (jos sitä yhä käytetään). Ne eivät kuulu linkkitarkistukseen, mutta niiden hajoaminen rikkoo toiminnon eikä mikään huomaa.

Lisää `api/cron`-hakemistoon kevyt vuorokausittainen tarkistus, joka tekee yhden testipyynnön kuhunkin jäljellä olevaan rajapintaan ja lähettää sähköpostin, jos vastaus ei ole kunnossa. Käytä olemassa olevaa `NotificationJob`-putkea. Tämä on pieni työ ja kattaa myös tulevat rajapinnat.

---

## Toteutusjärjestys

1. **KO-01** seloste — pieni työ, korjaa läpinäkyvyyden heti, ei riipu muista
2. **KO-02** RSS palvelimelle — poistaa kaksi riippuvuutta ja ratkaisee LC-14:n samalla
3. **KO-03** Nominatim pois — vaatii koordinaattien lisäämisen ensin
4. **KO-04** valvonta jäljelle jääville

KO-01 kannattaa tehdä ennen laajaa tiedotusta. KO-02 ja KO-03 ovat julkaisun jälkeistä työtä.
