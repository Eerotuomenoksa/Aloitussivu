# Codex-tehtävä: automaattisen linkkitarkistuksen viimeistely

Päivitetty: 30.8.2026
Tila: viimeistelytehtävät määritelty; REL-14 / v0.77.0:n perusputki on toteutettu paikallisesti, mutta PHP/MariaDB-palvelintestit ja tuotantokäyttöönotto ovat kesken
Perustuu analyysiin `docs/linkkitarkistuksen-tarkkuus-ja-automaatio-2026-08-30.md`
Koskee: `api/src/LinkCheckJob.php`, `api/src/HttpLinkChecker.php`, `api/src/LinkCatalog.php`, `api/cron/link-check.php`, `database/migrations/`, `scripts/build-link-catalog.mjs`, `linkChecks.ts`, `ehdotukset.tsx`, `scripts/update-links.mjs`

## 0. Lähtötilanne ja rajaus — lue tämä ensin

**Älä kirjoita uutta putkea alusta.** Työn alla oleva palvelinpuolen toteutus (`link_check_*`-taulut, `LinkCheckJob`, `HttpLinkChecker`, `LinkCatalog`, cron-ajo, ylläpitonäkymän `#link-checks`-osio) on arkkitehtuuriltaan oikea ja ratkaisee jo suoraan neljä vanhan Node-putken pahinta ongelmaa:

- **Tila säilyy.** `link_check_targets.failure_count` ja `link_check_results.consecutive_failures` tekevät mahdolliseksi sen, mitä `scripts/update-links.mjs` ei osannut: yksi hetkellinen häiriö ei enää tarkoita mitään pysyvää.
- **Uusintayritys on sisäänrakennettu.** `nextCheck()` siirtää epäonnistuneen linkin uuteen yritykseen `retry_hours`-välein sen sijaan että tuomitsisi sen heti.
- **Bottisuojaus tunnistetaan omaksi luokakseen.** 401/403/405/429 → `warning`, ei `failed`. Tämä on tarkalleen oikea ratkaisu siihen ongelmaan, jonka takia `verifiedLinks.ts`:ään on jouduttu kirjaamaan käsin kuusi poikkeusta.
- **SSRF-suojaus on kunnossa.** DNS-ratkaisu ennen pyyntöä, yksityisten ja varattujen osoitealueiden hylkäys, `CURLOPT_RESOLVE`-kiinnitys, vain HTTPS ja vain portti 443, uudelleenohjaukset validoidaan kierros kerrallaan. Tätä ei saa heikentää missään alla olevassa tehtävässä.

Tämän tehtävälistan tarkoitus on **täydentää** tuota putkea, ei korvata sitä. Muutokset ovat lisäyksiä olemassa oleviin luokkiin ja taaksepäin yhteensopivia tietokantamigraatioita.

Yksi asia on kuitenkin ratkaistava periaatetasolla ennen koodia (LC-11): tällä hetkellä repossa on **kaksi rinnakkaista linkkitarkistusta**, vanha `scripts/update-links.mjs` (build-aikainen, kirjoittaa `linkHealth.ts`:n) ja uusi palvelinputki. Ne eivät tiedä toisistaan. Jos molemmat jäävät elämään ilman työnjakoa, ne alkavat kumota toistensa päätöksiä.

### Mitä uudesta putkesta puuttuu

Nykyisellään **automaatio ei piilota mitään.** `LinkCheckJob` kirjaa tuloksen tietokantaan ja `AdminApi::linkChecks` näyttää sen ylläpitäjälle, mutta mikään ei kirjoita `blocked_links`-tauluun eikä muuta sitä mitä käyttäjä näkee. Käyttäjän kannalta putki on tällä hetkellä raportointityökalu, ei suojaus. Tämä on LC-02 ja se on koko listan tärkein kohta.

Lisäksi puuttuvat: sisältötarkistus (soft-404 menee läpi tilassa `ok`), uudelleenohjauksen domain-muutoksen tunnistus, varmennus- ja poikkeusrekisteri, kriittisyysluokat, `http://`-linkkien järkevä käsittely ja joukkovirheen katkaisin.

### Turvallisuusrajat, joita ei saa ylittää missään tehtävässä

1. Älä poista tai löysennä `HttpLinkChecker::validateTarget()`-tarkistuksia (HTTPS-pakko, portti 443, yksityiset osoitealueet, `CURLOPT_RESOLVE`-kiinnitys, `CURLOPT_PROTOCOLS`/`CURLOPT_REDIR_PROTOCOLS`).
2. Automaatio saa **piilottaa** linkkejä. Se ei saa koskaan poistaa linkkiä lähdetiedostosta, muokata `verifiedLinks.ts`:ää, kirjoittaa `approved_links`-tauluun eikä poistaa `blocked_links`-rivejä, jotka ihminen on lisännyt.
3. Poikkeuspäätös on aina ihmisen. Automaatio saa ehdottaa, ei myöntää.
4. Ei API-avaimia, SMTP-tunnuksia eikä salaisuuksia frontendiin, `.env`-tiedostoihin tai versionhallintaan. Safe Browsing -avain (jos LC-13 toteutetaan) menee palvelimen konfiguraatioon samalla tavalla kuin muut cron-salaisuudet.
5. Jokainen uusi konfiguraatioarvo `Config.php`:hen `boundedInt`/`boolValue`-rajoilla, kuten nykyiset `link_checks`-arvot.

### Tarkistushetken tilanne 30.8.2026

Paikallisesti läpäisty:

- `npm run test:link-policy`
- `npm run test:link-catalog` (`links=2386`)
- `npx tsc --noEmit -p tsconfig.json`
- `npm run build:cloudcity`
- `npm run check:secrets`
- `scripts/build-production-path-package.ps1` PowerShell-syntaksitarkistus

Vielä pakollinen ennen käyttöönottoa:

- kaikkien muuttuneiden PHP-tiedostojen `php -l` palvelimen PHP 8.4:llä;
- `php -d extension=pdo_sqlite api/tests/run.php` ympäristössä, jossa PHP:n tarvittavat laajennukset ovat käytettävissä;
- migraation 005 ajo testi- tai tuotantotietokantaan ja rakennetarkistus;
- cronin ensimmäinen käsiajo asetuksella `link_checks.enabled = true`;
- ylläpitonäkymän ja sähköpostikoosteen savutesti oikealla ajodatalla;
- täysi kuiva tarkistuskierros ennen mahdollista automaattista piilotusta.

Paikallisessa Windows-ympäristössä ei ollut PHP CLI:tä, joten PHP-testien puuttuvaa ajoa ei saa tulkita hyväksytyksi testiksi. Tuotantoon ei ole tehty tämän tehtävän yhteydessä muutoksia.

---

## 0.5 Mittaustulokset 30.8.2026 — lue ennen kuin aloitat

Koko katalogi mitattiin 30.8.2026 (`scripts/link-check-benchmark.mjs`, 2 381 linkkiä, ajo 339 s). Tulokset ovat tiedostoissa `docs/linkit-mittaus-2026-08-30-aamu.md`/`.csv` ja analyysi tiedostossa `docs/linkit-mittaus-analyysi-2026-08-30.md`.

| | |
| --- | ---: |
| Kunnossa | 2 184 |
| Varoitus (bottisuojaus) | 19 |
| Epäonnistui | 119 |
| Ohitettu, ei HTTPS | 59 |
| Eri verkkotunnuksia | 1 103 |

**Korjauslista on valmiina:** `docs/linkit-korjattavat-2026-08-30-aamu.md` ja `.csv`, muodostettu komennolla `node scripts/link-fix-list.mjs`. Siinä on 236 havaintoa ryhmiteltynä lähdetiedoston ja toimenpiteen mukaan:

| Toimenpide | Kpl |
| --- | ---: |
| korjaa osoite (404) | 58 |
| poista (verkkotunnus kuollut) | 45 |
| päivitä ohjaus (domain vaihtuu) | 43 |
| päivitä HTTPS | 42 |
| tarkista käsin | 29 |
| poista tai korvaa (vain http) | 17 |
| **POISTA HETI** | **2** |

Aja `node scripts/link-fix-list.mjs` uudelleen jokaisen mittausajon jälkeen; se lukee `.tmp/link-benchmark.ndjson`-tiedoston ja päivittää listan.

### Löydös, joka selittää suuren osan ongelmasta

**`scripts/update-links.mjs` ei ole koskaan tarkistanut tiedostoja `communityLinks.ts` (166 linkkiä) eikä `seniorSurfGuidancePlaces.ts` (256 linkkiä).** Ne puuttuvat `collectLinks()`-funktion lähdelistalta kokonaan. Tarkistuksen ulkopuolella on siis ollut 422 linkkiä eli 18 % katalogista.

Ja juuri niissä on lähes kaikki mätä: 119 viasta **83 (70 %)** on näissä kahdessa tiedostossa. Sieltä löytyivät 39 kuollutta yhdistysverkkotunnusta ja digiopastuksen 31 kpl 404-osoitteita — vuosien ajan huomaamatta, koska mikään ei katsonut niitä.

`scripts/build-link-catalog.mjs` sisältää molemmat lähteet, joten **uusi putki korjaa tämän katveen jo nyt**. Varmista LC-01:ssä, ettei kattavuus katoa rakenteiseen poimintaan siirryttäessä — siksi LC-01:n kohdassa 3 vaaditaan varmistus yleistä regex-hakua vastaan.

---

## LC-01 · Katalogin rakennus rakenteiseksi (P1)

### Miksi

`scripts/build-link-catalog.mjs` poimii jokaisen lainausmerkeissä olevan `http(s)://`-osoitteen 21 lähdetiedostosta ja arvaa nimen enintään 320 merkin päässä olevasta `name:`-kentästä. Uudelleen ajettu tarkistus 30.8.2026 tuotti 2 386 linkkiä, ja niistä:

- **1 494 linkin (62,6 %) nimi on pelkkä verkkotunnus.** Nimen arvaus epäonnistui, joten ylläpitonäkymän rivillä lukee `www.hel.fi`, ei `Helsingin kaupungin senioripalvelut`. Ylläpitäjä ei tunnista, mikä linkki on rikki eikä mistä osiosta se löytyy.
- **Kategorioita on 17**, ja ne ovat enimmäkseen laajoja lähderyhmiä. Vanha `update-links.mjs` tuotti 40 todellista kategoriaa. Ilman oikeaa kategoriaa kriittisyysluokitus (LC-04) on mahdoton: `constants.tsx` sisältää sekä hätänumerot että ristikkopelit, ja molemmat saavat nyt kategorian `Valtakunnalliset palvelut`.

Roskaosoitteita ei löytynyt (0 kpl kuva-, fontti- tai rajapinta-URLia), joten keruun kattavuus on kunnossa — ongelma on metatiedon laadussa.

### Mitä tehdä

1. Korvaa yleinen `urlPattern`-haku lähdekohtaisilla rakenteisilla poiminnoilla. `scripts/update-links.mjs`:n `collectLinks()` sisältää valmiit, testatut regexit jokaiselle 13 lähteelle (osio, kategoria, nimi, URL, lähdetiedosto). **Siirrä tuo logiikka `build-link-catalog.mjs`:ään** sen sijaan että kirjoittaisit sen uudelleen.
2. Laajenna katalogin skeemaa versioon 2:
   ```json
   { "url": "...", "name": "...", "section": "...", "category": "...",
     "source": "...", "criticality": "critical|important|normal" }
   ```
3. Säilytä yleinen regex-haku **varmistuksena**: jos rakenteinen poiminta löytää lähdetiedostosta vähemmän linkkejä kuin yleinen haku, kirjoita erotus tiedostoon `.tmp/link-catalog-missed.json` ja kaadu testissä. Näin uusi linkkityyppi lähdetiedostossa ei jää huomaamatta.

   **TEHTY 30.8.2026:** kattavuusvahti on lisätty tiedostoon `scripts/link-catalog-test.mjs`. Se käy repon juuren `.ts`/`.tsx`-tiedostot läpi ja kaatuu, jos jokin sisältää yli 20 osoitetta eikä ole katalogin `sourceFiles`-listalla (generoidut tiedostot ohitetaan). Testattu: menee läpi nykytilassa, ja laukeaa oikein jos `communityLinks.ts` tai `seniorSurfGuidancePlaces.ts` poistetaan lähteistä.

   **Lisäksi: kaadu, jos lähdelistalta puuttuu tiedosto.** `scripts/link-catalog-test.mjs` on laajennettava tarkistamaan, ettei repon juuressa ole `.ts`-tiedostoa, joka sisältää yli 20 osoitetta eikä ole `sources`-listalla. Juuri tämä katve toteutui vanhassa `update-links.mjs`-skriptissä: `communityLinks.ts` (166 linkkiä) ja `seniorSurfGuidancePlaces.ts` (256 linkkiä) eivät olleet sen lähdelistalla, ja niihin kertyi 70 % kaikista vioista vuosien ajan. Ilman testiä sama toistuu seuraavan tiedoston kohdalla.

   Kattavuus on tarkistettu 30.8.2026 (`docs/linkit-katalogin-kattavuus-2026-08-30.md`): katalogi kattaa kaikki käyttäjälle näkyvät osoitteet, ja sen ulkopuolelle jää vain 13 rajapinta- tai mallipohjaosoitetta. Älä siis lisää lähteitä — varmista vain, ettei kattavuus katoa rakenteiseen poimintaan siirryttäessä.
4. Päivitä `LinkCatalog::load()` lukemaan `schemaVersion === 2`, `section` ja `criticality` (salli vain kolme arvoa, muu → `link_catalog_item_invalid`).
5. Säilytä nykyiset `package.json`-komennot `build:link-catalog` ja `test:link-catalog` ja lisää ne julkaisun vakioporttiin. Erillistä `link-catalog`-aliasta ei tarvita, ellei muiden ylläpitokomentojen nimeämistä samalla yhdenmukaisteta.
6. `scripts/build-rel11-staging-package.ps1` kopioi `api/cron`-hakemiston mutta **ei generoi `link-catalog.json`-tiedostoa**. Tuotantopaketin skriptissä generointi on jo rivillä 72. Lisää sama vaihe staging-skriptiin, muuten cron kaatuu stagingissa virheeseen `link_catalog_unreadable`.

### Kaksi eri akselia: kriittisyys ja muutosherkkyys

**Korjaus 30.8.2026:** aiempi versio tästä ohjeesta neuvoi tarkistamaan kriittiset linkit vuorokauden välein. Se oli väärin, ja `docs/linkit.csv`:n data osoittaa miksi.

Kriittisistä 98 linkistä elokuun ajossa nousi esiin **viisi**, ja jokainen niistä oli tarkistimen oma virhe, ei rikkinäinen linkki:

| Linkki | Havainto | Todellinen syy |
| --- | --- | --- |
| DVV – holhous ja edunvalvonta (×2) | "otsikko ei vastaa nimeä" | Nimivertailun kohina (poistetaan LC-06:ssa) |
| Pankkien korttien sulkupalvelu | "otsikko ei vastaa nimeä" | Sama kohina |
| Kuluttajaneuvonta | HTTP 500 | WAF-torjunta (LC-04) |
| Mehiläinen | HTTP 429 | Pyyntörajoitus (LC-04) |

**Aidosti rikkinäisiä kriittisiä linkkejä oli nolla.** Kriittiset kohteet ovat viranomaisia, pankkeja ja terveyspalveluita: ne ylläpitävät osoitteitaan huolellisesti eivätkä riko niitä. Samalla ne käyttävät alan tiukimpia bottisuojauksia, joten ne ovat myös **todennäköisin väärien hälytysten lähde**. Tiheä tarkistus tuottaisi niistä pelkkää kohinaa eikä löytäisi mitään.

Ongelmat keskittyvät aivan muualle (vain HTTPS-linkit, jotta `http://`-hylkäys ei vääristä):

| Osio | Ongelmia | Osuus |
| --- | ---: | ---: |
| Hyvinvointialueet | 13/46 | 28,3 % |
| Paikalliset urheiluseurat | 9/45 | 20,0 % |
| Kuntien kieliversiot | 40/235 | 17,0 % |
| Paikalliset erikoislinkit | 42/296 | 14,2 % |
| Palvelukategoriat | 31/376 | 8,2 % |
| Kuntien verkkosivut | 24/308 | 7,8 % |
| Lehdet (https) | 6/86 | 7,0 % |
| Paikalliset senioripalvelut | 2/123 | 1,6 % |
| Alueelliset puhelinnumerot | 0/20 | 0 % |
| Uutisvirrat | 0/297 | 0 % |

Tarkistustiheyttä ohjaa siis **muutosherkkyys**, ei kriittisyys. Kriittisyys ohjaa sitä, mitä havainnosta seuraa.

| Akseli | Mitä se ohjaa |
| --- | --- |
| **Muutosherkkyys** (kuinka todennäköisesti linkki rikkoutuu) | Tarkistusväli — ja se **opitaan havainnoista**, ei käsin luokitella (LC-03) |
| **Kriittisyys** (mitä rikkinäisyys maksaa käyttäjälle) | Piilotuskynnys, hälytys, kahden silmän varmennus, tarkistuksen syvyys |

Testasin myös oletuksen, että syvälinkit rikkoutuisivat juuriosoitteita herkemmin. **Se ei pidä paikkaansa:** juuriosoitteet 9,9 %, syvälinkit 7,8 %. Älä rakenna luokittelua polun syvyyden varaan.

### Kriittisyysluokan määrittely

Kriittisyys **ei** enää määritä tarkistusväliä. Se määrittää reaktion:

| Luokka | Kategoriat | Piilotus | Hälytys | Varmennus |
| --- | --- | --- | --- | --- |
| `critical` | Hätänumerot, terveys, Kela, pankit ja tunnistautuminen, poliisi, huijausvaroitukset, sulkupalvelut | 1 varmistettu kova virhe (404/410/DNS/TLS) | Sähköposti heti | Kahden silmän periaate, odotettu domain lukitaan |
| `important` | Kunnat, hyvinvointialueet, joukkoliikenne, kirjastot, kieliversiot, senioripalvelut | 2 peräkkäistä | Koontina | Yksi tarkistaja |
| `normal` | Lehdet, RSS, urheiluseurat, liikuntaryhmät, harrastukset, digiopastus | 2 peräkkäistä, 5xx vaatii 3 | Ei erillistä | Yksi tarkistaja |

Kirjoita luokittelu **yhteen tiedostoon** (`scripts/link-criticality.mjs`), jotta se on yhdessä paikassa ja testattavissa. Tuntematon kategoria → `normal` ja rivi testin varoituslistalle.

**Kriittisten linkkien oikea suoja ei ole tiheä pollaus.** HTTP-tarkistus ei löydä väärää tai kaapattua pankkilinkkiä — se vastaa 200 aivan kuten oikeakin. Kriittisiä suojaavat: (a) osoitteen kertaluontoinen ihmisvarmennus ja odotetun verkkotunnuksen lukitseminen, (b) uudelleenohjauksen domain-muutoksen tunnistus (LC-07), (c) Safe Browsing (LC-13), ja (d) nopea reaktio silloin kun vika on aito. Lisää siksi `link_check_overrides`-tauluun (LC-05) valinnainen `expected_domain`-sarake: jos kriittisen linkin lopullinen verkkotunnus poikkeaa siitä, tila on `failed` ja hälytys lähtee heti, tarkistusvälistä riippumatta.

### Hyväksymiskriteerit

- Alle 5 % katalogin linkeistä on sellaisia, joiden `name` on pelkkä verkkotunnus.
- Kategorioita on vähintään 35.
- `npm run test:link-catalog` tarkistaa nimikattavuuden, kategorioiden määrän, kriittisyysarvojen kelvollisuuden ja rakenteisen poiminnan kattavuuden yleiseen hakuun verrattuna.
- Staging- ja tuotantopaketti sisältävät molemmat yksityisen `data/link-catalog.json`-tiedoston, joka asennetaan web-juuren ulkopuolelle.

---

## LC-02 · Automaattinen piilotus — putken tärkein puuttuva osa (P1)

### Miksi

`LinkCheckJob` tuottaa juuri oikeat tiedot päätöksentekoon, mutta päätöstä ei tehdä. Konfiguraatioarvo `link_check_alert_after_failures` (oletus 2) näkyy vain ylläpitonäkymän tekstissä "Hälytysraja on 2 peräkkäistä epäonnistumista" — mikään ei toimi sen perusteella. Rikkinäinen linkki näkyy käyttäjälle siihen asti, kunnes ylläpitäjä käy ylläpitosivulla ja painaa käsin Piilota.

### Mitä tehdä

Lisää `LinkCheckJob`iin vaihe, joka ajetaan tarkistuserän jälkeen samassa ajossa.

**Piilota, kun kaikki seuraavat pätevät:**
- `last_status = 'failed'` (**ei koskaan `warning` eikä `rejected`** — `warning` on nimenomaan bottisuojaus, `rejected` käsitellään LC-08:ssa)
- `failure_count >= alert_after_failures`
- `error_code` on jokin varmoista: `http_status_error` (HTTP 404, 410 tai 5xx), `dns_failed`, `tls_failed`, `too_many_redirects`, `redirect_location_missing`
- linkille ei ole voimassa olevaa poikkeusta (LC-05)
- URL ei ole jo `blocked_links`-taulussa

**Palauta näkyviin, kun:**
- `last_status = 'ok'` ja `failure_count = 0`
- **ja** `blocked_links`-rivin `created_by IS NULL` eli eston on tehnyt automaatio, ei ihminen

Käytä `blocked_links`-taulua sellaisenaan (`001_initial_schema.sql`): `created_by = NULL` merkitsee automaatin tekemää estoa ja `reason`-kenttään koneluettava peruste, esim. `auto:http_status_error:404`. Ihmisen tekemään estoon ei kosketa koskaan.

Lisää konfiguraatioon:
```
link_checks.auto_block_enabled          (bool, oletus false)
link_checks.auto_block_max_per_run      (int, 1–200, oletus 25)
link_checks.auto_unblock_enabled        (bool, oletus true)
```

Ota `auto_block_enabled` käyttöön vasta, kun putki on ajanut vähintään yhden täyden kierroksen tuotannossa ja tulokset on katsottu läpi. Aja se siihen asti "kuivana": kirjaa ajolokiin, mitä olisi piilotettu.

Laajenna `link_check_runs`-taulua sarakkeilla `blocked_count` ja `unblocked_count`.

### Hyväksymiskriteerit

- `auto_block_enabled = false` → käyttäytyminen ei muutu lainkaan nykyisestä.
- `warning`-tilainen linkki ei piiloudu koskaan automaattisesti, vaikka `failure_count` kasvaisi.
- Ihmisen lisäämä `blocked_links`-rivi ei poistu automaattisesti missään tilanteessa.
- Yksikkötesti: 404 kahdesti peräkkäin → esto; sen jälkeen 200 → eston poisto; ihmisen esto + 200 → esto säilyy.

---

## LC-03 · Läpimenoaika: erän koko ja ajorytmi (P1)

### Miksi

Nykyasetuksilla katalogi ei ehdi läpi, jos cron asetetaan liian harvaksi. Laskenta 2 386 linkillä:

| Erän koko | Cron-väli | Tarkistuksia/vrk | Koko kierros |
| --- | --- | --- | --- |
| 10 | kerran vrk | 10 | **239 vrk** |
| 10 | tunnin välein | 240 | 10 vrk |
| 20 | tunnin välein | 480 | 5 vrk |
| 50 | tunnin välein | 1 200 | 2 vrk |

`link_check_refresh_days` on oletuksena 30, mikä edellyttää noin 80 tarkistusta vuorokaudessa. Jos cron ajetaan kerran vuorokaudessa oletuserällä 10, asetettu tavoite on saavuttamaton eikä mikään kerro siitä.

Toinen ongelma: ensimmäisessä katalogisynkronoinnissa **jokainen** kohde saa `next_check_at = now`, joten koko 2 386 linkin jono on heti erääntynyt, ja järjestys `ORDER BY ... next_check_at` on tuolloin käytännössä mielivaltainen. Sama isäntä voi osua samaan erään monta kertaa peräkkäin.

### Mitä tehdä

1. **Hajauta ensimmäinen tarkistusaika.** Katalogisynkronoinnissa aseta `next_check_at = now + INTERVAL (CONV(SUBSTR(url_hash,1,6),16,10) MOD :spread_minutes) MINUTE`, jossa `spread_minutes` on kriittisyysluokan väli minuutteina. Deterministinen hajautus pitää kuorman tasaisena myös seuraavilla kierroksilla.
2. **Opeta tarkistusväli havainnoista — älä luokittele sitä käsin.** Kiinteät luokkakohtaiset välit vaativat 2 381 linkin käsiluokittelun ja menevät joka tapauksessa väärin, koska muutosherkkyys ei noudata kategoriaa. Käytä sen sijaan mukautuvaa väliä:

   - **Onnistunut tarkistus:** `uusi väli = min(vanha väli × 1,5, max_interval)`
   - **Epäonnistuminen tai varoitus:** `uusi väli = min_interval`
   - Uusi linkki aloittaa `min_interval`-välistä

   | Kriittisyys | `min_interval` | `max_interval` |
   | --- | ---: | ---: |
   | `critical` | 3 vrk | 14 vrk |
   | `important` | 3 vrk | 30 vrk |
   | `normal` | 7 vrk | 60 vrk |

   Malli tekee itse sen, mitä käsiluokittelu yrittää: vakaa `kela.fi` ajautuu muutamassa kuukaudessa 14 vuorokauden väliin, hyvinvointialueen heiluva alasivu jää kolmeen. Kriittisyys asettaa vain ylä- ja alarajan, ei väliä itseään.

   Uusi sarake `link_check_targets.check_interval_hours SMALLINT UNSIGNED NOT NULL DEFAULT 72`.

3. **Suositeltu tuotantoasetus:** cron **tunnin välein**, `batch_size = 10`, `timeout_seconds = 12`, `retry_hours` porrastettuna (ks. kohta 6).

   Perustelu todellisilla luvuilla. Elokuun ajossa 2 040 https-linkistä 176 (8,6 %) oli jossain ongelmatilassa ja 1 864 kunnossa. Mukautuvalla välillä tasapainotila on:

   | Joukko | Linkkejä | Vakiintunut väli | Tarkistuksia/vrk |
   | --- | ---: | ---: | ---: |
   | Vakaat | ~1 864 | 30–60 vrk | ~41 |
   | Heiluvat | ~176 | 3–7 vrk | ~35 |
   | **Vakiokuorma yhteensä** | | | **~76** |

   Erä 10 tunnin välein antaa **240 tarkistusta vuorokaudessa** eli noin kolminkertaisen varan. Se riittää vakiokuormaan, uusintayrityksiin, katalogin kasvuun ja siihen että ensimmäinen täysi kierros (2 040 linkkiä) valmistuu noin 8,5 vuorokaudessa. **Vastaus alkuperäiseen kysymykseen on siis: 10 linkkiä per ajo on oikea määrä — kunhan ajo tapahtuu tunnin välein eikä kerran vuorokaudessa.**

   Kerran vuorokaudessa ajettuna erän pitäisi olla 80–100, mikä tekee yhdestä ajosta pitkän ja hauraan. Tunnin väli on parempi: pienempi erä, lyhyempi ajo, tasaisempi kuorma ja pienempi vahinko yhdestä epäonnistuneesta ajosta.

6. **Porrasta uusintaväli.** Kiinteä `retry_hours = 24` tarkoittaa, että jokainen pysyvästi rikkinäinen linkki kuluttaa yhden tarkistusvuoron joka vuorokausi ikuisesti. Elokuun raportissa vikatilassa oli 102 linkkiä, eli 102 tarkistusta vuorokaudessa — enemmän kuin koko `normal`-luokan vakiokuorma. Porrasta epäonnistumisten mukaan: 1. uusinta 6 h, 2. 24 h, 3. 72 h, sen jälkeen 7 vrk. Tällöin sama 102 linkin joukko kuluttaa noin 15 vuoroa vuorokaudessa 102:n sijaan.

7. **Rajaa ajon kokonaiskesto.** `LinkCheckJob` ajaa erän **peräkkäin**, eikä yhdellekään kohteelle ole kokonaisaikabudjettia: `HttpLinkChecker` sallii 5 uudelleenohjausta, joista jokainen on oma `CURLOPT_TIMEOUT`-jaksonsa, joten yksi kohde voi pahimmillaan viedä 6 × 8 s = 48 s. Erä 15 tarkoittaa teoreettista 12 minuutin ajoa jaetulla webhotellilla. Lisää (a) kohdekohtainen kokonaisbudjetti 15 s kaikkien hyppyjen yli ja (b) ajokohtainen 120 s seinäkelloraja, jonka jälkeen ajo päättyy siististi ja loput kohteet jäävät seuraavalle kierrokselle.
8. **Sisarlinkkien herätys.** Kun linkki epäonnistuu kovalla virheellä (404, 410, `dns_failed`), aseta **saman verkkotunnuksen muiden kohteiden** `next_check_at` heti erääntyneeksi. Perustelu mittausdatasta 30.8.2026: 73 % linkeistä jakaa verkkotunnuksen jonkin toisen kanssa, ja vioista 19/119 kasautui kahdeksalle verkkotunnukselle (`hel.fi` 4/19, `pudasjarvi.fi` 3/4, `hameenlinna.fi` 2/7, `kiuruvesi.fi` 2/6, `juuka.fi` 2/6 — kaikki 404, eli sivuston uudistus). Kun yksi kunnan alasivu katoaa, loput kannattaa katsoa tunnin sisällä eikä viikkojen päästä.

   Rajaa herätys enintään 25 sisarlinkkiin kerrallaan, jottei yksi iso verkkotunnus täytä koko jonoa.

9. **Lisää isäntäkohtainen kohteliaisuusrajoitus:** enintään 3 saman isännän kohdetta samassa erässä. Ilman tätä esim. kuntien kieliversiot (235 riviä, osa samalla isännällä) osuvat kimppuun kerralla.
10. **Kirjaa läpimenoaika näkyviin.** Lisää `AdminApi::linkChecks`-vastaukseen `summary.oldestCheckedAt` ja `summary.estimatedCycleDays`, ja näytä ne ylläpitonäkymässä. Ylläpitäjän on nähtävä, kattaako tarkistus koko linkkimassan vai vain osan siitä.

### Hyväksymiskriteerit

- Ylläpitonäkymä kertoo, kuinka vanha vanhin tarkistus on ja kuinka monta vuorokautta täysi kierros kestää nykyasetuksilla.
- Yksikään yksittäinen isäntä ei saa yli 3 pyyntöä samassa erässä.
- Testi laskee mukautuvan mallin tasapainokuorman ja kaatuu, jos se ylittää `batch_size × ajoja_vuorokaudessa`.
- Vakaana pysyvän linkin tarkistusväli kasvaa kohti `max_interval`-arvoa ja epäonnistuminen pudottaa sen takaisin `min_interval`-arvoon.
- Yksikään ajo ei kestä yli 120 sekuntia eikä yksikään kohde yli 15 sekuntia.

### Mittausajo ennen asetusten lukitsemista

Repossa on `scripts/link-check-benchmark.mjs`, joka tarkistaa katalogin linkit LC-04:n mukaisella pyyntötavalla ja tuottaa tiedostot `docs/linkit-mittaus-<pvm>.md` ja `.csv`. Se ei muuta mitään sovelluksessa. Aja se **ennen kuin `batch_size` ja `refresh_days` lyödään lukkoon** ja käytä sen tuottamaa mitoitustaulukkoa sekä vastausaikojen persentiilejä yllä olevien arvioiden tarkistamiseen. Aja se mieluiten Cloudcityn palvelimelta, koska tarkistus tehdään tuotannossa sieltä ja WAF-käyttäytyminen riippuu lähde-IP:stä.

---

## LC-04 · Selainmainen pyyntö ja väärät virheet (P1)

### Miksi

`HttpLinkChecker` lähettää tunnisteen `SeniorinAloitussivu-LinkChecker/1.0`. Moni suojattu sivusto vastaa tuntemattomalle asiakkaalle 403:lla tai **500:lla**, vaikka sivu toimii selaimessa. 403 on jo hoidettu (`warning`), mutta **500 menee luokkaan `failed`** ja johtaa LC-02:n jälkeen automaattiseen piilotukseen.

Näyttö on jo repossa: `verifiedLinks.ts` sisältää neljä poikkeusta perusteella "Palvelin palauttaa automaattisen Node-tarkistimen pyynnölle HTTP 500" (kkv.fi/kuluttajaneuvonta, tamperefilharmonia.fi, kotikokki.net, marttila.fi) ja yhden 417-vastauksen (outlook.live.com). Elokuun ajossa 500-vastauksia oli 26 kappaletta.

### Mitä tehdä

1. Vaihda `CURLOPT_USERAGENT` selainmaiseksi ja säilytä rehellinen tunniste lopussa:
   `Mozilla/5.0 (compatible; SeniorinAloitussivu-LinkChecker/2.0; +https://seniorsurf.fi/aloitus/)`
2. Lisää `CURLOPT_HTTPHEADER`: `Accept-Language: fi-FI,fi;q=0.9,sv;q=0.8,en;q=0.7` ja `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`.
3. Laajenna HEAD→GET-uusintaa: nyt uusinta tehdään vain statuksilla 405 ja 501. **Tee uusinta myös statuksilla 400, 403, 417 ja 5xx.** Moni palvelin torjuu HEAD-pyynnön mutta vastaa GET-pyyntöön normaalisti.
4. Jos GET `CURLOPT_RANGE`-otsakkeella palauttaa 416 tai 417, yritä kerran uudelleen ilman `Range`-otsaketta.
5. **Erottele 5xx omaksi luokakseen.** Lisää `error_code`-arvo `server_error` (5xx) erilleen arvosta `http_status_error` (4xx). Vaadi 5xx-tapauksissa **kolme** peräkkäistä epäonnistumista ennen piilotusta kahden sijaan — huoltokatko ja WAF-torjunta näyttävät molemmat 5xx:ltä, kuollut sivu ei.
6. Kunnioita `Retry-After`-otsaketta 429- ja 503-vastauksissa: jos otsake on olemassa ja arvo alle 7 vrk, käytä sitä `next_check_at`-arvona.
7. `validateTarget()` kiinnittää vain ensimmäisen DNS-osoitteen. Jos pyyntö epäonnistuu virheeseen `connection_failed`, yritä kerran seuraavalla osoitteella ennen kuin merkitset epäonnistumisen.

### Mitattu todiste 30.8.2026

Muutokset 1–4 testattiin `scripts/link-check-benchmark.mjs`-ajolla koko katalogilla:

| | Vanha tarkistin (elokuu) | Uusi pyyntötapa |
| --- | ---: | ---: |
| HTTP 5xx | 26 | **1** |
| 401/403/405/429 | 16 | 19 |
| Sisältösignaalin kohina | 112 | 13 |

**25 väärää palvelinvirhettä katosi** pelkällä tunnisteen ja GET-uusinnan vaihdolla. Kaikki 58 jäljelle jäänyttä `http_status_error`-tapausta olivat 404 — ei yhtään epämääräistä 5xx:ää. Toteuta tämä ensin; se on listan halvin ja vaikuttavin muutos.

### Hyväksymiskriteerit

- `verifiedLinks.ts`:n viidestä bottisuojauspoikkeuksesta vähintään kolme läpäisee tarkistuksen ilman poikkeusta. Aja ne käsin ja kirjaa tulos tehtävän yhteenvetoon.
- 5xx vaatii kolme epäonnistumista, 404/410 kaksi.
- Yksikkötesti kattaa HEAD 403 → GET 200 -polun ja `Range` 416 → uusinta ilman Rangea -polun.

---

## LC-05 · Varmennus- ja poikkeusrekisteri tietokantaan (P1)

### Miksi

`verifiedLinks.ts`:n kenttä `nextReviewAt` on kuollut: `readVerifiedLinks()` (`update-links.mjs:133`) poimii regexillä vain `url`, `status` ja `confidence`. Kuudelle poikkeukselle on merkitty erääntymispäiväksi **1.9.2026**, eikä mikään huomauta niiden vanhenemisesta. Uusi palvelinputki ei lue `verifiedLinks.ts`:ää lainkaan, joten poikkeukset katoavat kokonaan, kun putki ottaa piilotuksen hoitaakseen.

Lisäksi `hasAcceptedException` (`update-links.mjs:520`) ohittaa piilotuksen myös silloin, kun HTTP-tarkistus epäonnistuu kokonaan. Poikkeukseksi merkitty linkki pysyy siis näkyvissä, vaikka se palauttaisi 404:n. Tätä virhettä **ei saa siirtää** uuteen putkeen.

### Mitä tehdä

1. Uusi migraatio `006_link_check_overrides.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS link_check_overrides (
     url_hash CHAR(64) NOT NULL,
     url VARCHAR(2048) NOT NULL,
     status ENUM('verified','exception','needs_review','retired') NOT NULL,
     confidence ENUM('A','B','C','D','E') NOT NULL,
     scope ENUM('bot_protection','content_signal','all') NOT NULL DEFAULT 'bot_protection',
     organization VARCHAR(255) NULL,
     evidence VARCHAR(1000) NULL,
     notes VARCHAR(1000) NULL,
     verified_at DATETIME(6) NOT NULL,
     verified_by VARCHAR(128) NULL,
     next_review_at DATETIME(6) NOT NULL,
     created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
     updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
     PRIMARY KEY (url_hash),
     KEY idx_link_overrides_review (next_review_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   ```
2. **`scope` on tämän kohdan ydin.** Poikkeus vaikuttaa vain siihen, mitä varten se on myönnetty:
   - `bot_protection`: estää piilotuksen vain statuksilla 401/403/405/417/429 ja 5xx
   - `content_signal`: estää piilotuksen vain LC-06:n sisältösignaalin perusteella
   - `all`: vaatii erillisen perustelun, ja **ei koskaan** estä piilotusta virheillä 404, 410, `dns_failed` tai `tls_failed`
3. Vanhentunut poikkeus (`next_review_at < now`) lakkaa vaikuttamasta ja nousee ylläpitonäkymään omalle listalleen "Varmennus vanhentunut".
4. Oletusvanheneminen luottamustason mukaan: A ja B 12 kk, C 6 kk, poikkeus 3 kk.
5. Kertaluontoinen siirtoskripti, joka vie `verifiedLinks.ts`:n 10 riviä ja `update-links.mjs:12`:n 28 kovakoodattua `MANUALLY_VERIFIED_URLS`-osoitetta tähän tauluun. Jälkimmäisillä ei ole perustelua eikä päivämäärää: anna niille `status='verified'`, `confidence='C'`, `next_review_at = siirtopäivä + 3 kk` ja `notes='Siirretty MANUALLY_VERIFIED_URLS-listasta, perustelu puuttuu'`, jotta ne tulevat käsiteltäviksi.
6. Poista siirron jälkeen `MANUALLY_VERIFIED_URLS` skriptistä ja merkitse `verifiedLinks.ts` vanhentuneeksi. Yksi rekisteri, ei kahta.

### 1.9.2026 erääntyvien poikkeusten esitarkistus

Viisi kuudesta erääntyvästä poikkeuksesta tarkistettiin 30.8.2026 selainpohjaisella haulla. Kaikki viisi sivua **latautuivat normaalisti oikealla sisällöllä**:

| URL | Sivun otsikko | Päätelmä |
| --- | --- | --- |
| `https://www.kkv.fi/kuluttajaneuvonta/` | Kuluttajaneuvonta – KKV | Sivu kunnossa; 500-vastaus oli tarkistimen torjunta |
| `https://www.tamperefilharmonia.fi/` | Tampere Filharmonia | Sivu kunnossa, konserttitiedot ajan tasalla |
| `https://korundi.fi/fi/kavijalle/lapin-kamariorkesteri` | Kulttuuritalo Korundi – Lapin kamariorkesteri | Sivu kunnossa ja vastaa linkin nimeä |
| `https://www.kotikokki.net` | Kotikokki.net – Reseptit arkeen ja juhlaan | Sivu kunnossa |
| `https://marttila.fi/` | — | **Ei latautunut**: TLS-varmenteen ketju ei validoitunut (`unable to get local issuer certificate`) |

`marttila.fi` on syytä tutkia erikseen: se **ei todennäköisesti ole bottisuojaus** vaan puuttuva välivarmenne palvelimen ketjussa. Selain paikkaa tällaisen usein itse hakemalla puuttuvan varmenteen, mutta curl, PHP ja Node eivät. Jos näin on, poikkeus on väärä ratkaisu — oikea on ilmoittaa kunnalle varmennekonfiguraation virheestä ja pitää linkki `warning`-tilassa siihen asti. Varmista `openssl s_client -connect marttila.fi:443 -showcerts` -komennolla ennen kuin poikkeus uusitaan.

`https://outlook.live.com` jäi tarkistamatta (kirjautumisen takana). Sen 417-vastaus selittyy todennäköisesti `Range`-otsakkeella, jonka LC-04 kohta 4 korjaa.

Neljä ensimmäistä poikkeusta kannattaa siis **poistaa vasta LC-04:n jälkeen** ja tarkistaa silloin, tarvitaanko niitä enää lainkaan. Jos selainmainen tunniste riittää, poikkeuksia ei uusita.

### Hyväksymiskriteerit

- Poikkeus, jonka `next_review_at` on menneisyydessä, ei vaikuta piilotuspäätökseen.
- `scope='bot_protection'`-poikkeus ei estä piilotusta, kun linkki palauttaa 404.
- Ylläpitonäkymä listaa vanhentuneet ja 30 vrk:n sisällä vanhenevat varmennukset.

---

## LC-06 · Sisältötarkistus: soft-404 ja parkkisivu (P2)

### Miksi

Uusi putki ei katso vastauksen sisältöä lainkaan. Sivu, joka palauttaa **HTTP 200 ja tekstin "Sivua ei löytynyt"**, kirjautuu tilaan `ok`. Juuri näin kuntien sivu-uudistukset rikkovat alasivulinkkejä, ja se on tapaus, jonka tämän tarkistuksen pitäisi löytää. Vanhassa Node-putkessa oli edes parkkisivun tunnistus; jos se poistuu käytöstä ilman korvaajaa, tarkkuus **heikkenee** nykyisestä.

Vanhan putken nimivastaavuusvertailu sen sijaan kannattaa jättää pois: se hyväksyi sivun yhdestä osuvasta sanasta ja tuotti 86 turhaa riviä 236:n käsittelyjonoon.

### Mitä tehdä

1. GET-pyyntö hakee jo 16 kt (`CURLOPT_RANGE 0-16383`), mutta runko heitetään pois. Ota se talteen, kun vastaus on `text/html` ja status 200.
2. Poimi `<title>`, ensimmäinen `<h1>` ja `<meta name="description">`. Tallenna otsikko uuteen sarakkeeseen `link_check_targets.page_title` (VARCHAR(255)).
3. Merkitse **vain vahvat signaalit**, uusi tila `warning` + `error_code`:
   - `soft_404`: otsikko tai ensimmäiset 300 merkkiä sisältävät ilmauksen `sivua ei löyd`, `sivua ei ole`, `page not found`, `error 404`, `sidan hittades inte`
   - `parked_domain`: `osta tämä verkkotunnus`, `buy this domain`, `domain for sale`, `sedo.com`, `dan.com`, `parkingcrew`
   - `empty_page`: `text/html`, status 200, mutta ei `<title>` eikä `<h1>` eikä yli 200 merkkiä tekstiä. **Lisäehto:** älä merkitse tyhjäksi, jos rungossa on `<script src=`-viittauksia — mittauksessa 30.8.2026 tämä sääntö antoi 13 osumaa, joista suurin osa (WhatsApp Web, Huawei AppGallery, Retkipaikka) oli JavaScriptillä renderöityviä sivuja eli vääriä hälytyksiä.
4. **Kaksi peräkkäistä havaintoa** ennen kuin sisältösignaali johtaa piilotukseen — sama sääntö kuin muissakin. Yksittäinen välimuistivirhe ei saa piilottaa kuntasivua.
5. Älä toteuta nimivastaavuusvertailua. Jos organisaationimen vertailu halutaan myöhemmin, se tehdään erikseen raportointityökaluna, ei pisteytyksenä.
6. Purkamisen turvallisuus: käsittele runkoa aina merkkijonona (`substr`, `preg_match`), älä koskaan HTML-jäsentimellä tai `libxml`illa, ja rajaa käsittely 16 kt:iin.

### Hyväksymiskriteerit

- Testisivu, joka palauttaa 200 ja otsikon "Sivua ei löytynyt", saa tilan `warning` ja koodin `soft_404`.
- Sisältösignaali ei koskaan yksin piilota linkkiä ensimmäisellä havainnolla.
- Muistinkäyttö per tarkistus pysyy alle 100 kt.

---

## LC-07 · Uudelleenohjauksen domain-muutos (P1 — nostettu 30.8.2026)

### Miksi

`HttpLinkChecker` seuraa uudelleenohjauksia ja tallentaa `final_url`-arvon, mutta ei vertaa sitä alkuperäiseen. Linkki, joka ohjautuu kokonaan toiselle verkkotunnukselle, saa tilan `ok`. Vanha Node-putki antoi tästä +50 riskipistettä.

**Mittaus 30.8.2026 osoitti, ettei tämä ole teoreettinen puute.** Kaksi tuotannossa olevaa linkkiä osoittaa verkkotunnusten kauppapaikkaan:

| Sovelluksessa lukee | Vie oikeasti |
| --- | --- |
| Eläkeläisliittojen etujärjestö EETU ry | `sedo.com/…?domain=eetu.fi&…&utm_medium=Parking` |
| Suomen PAH-potilasyhdistys | `catcha.fi/verkkotunnukset/pah.fi` |

Ratkaisevaa on **miten** ne olisivat jääneet huomaamatta: Sedon sivu vastasi HTTP 403:lla, jonka `HttpLinkChecker` luokittelee tilaksi `warning` = "bottisuojaus, linkki todennäköisesti kunnossa". Statuskoodi ei paljastanut mitään. Vain verkkotunnuksen vaihtuminen paljasti asian.

Samasta aineistosta löytyi 39 harvinaissairausyhdistyksen verkkotunnusta, joiden DNS ei enää ratkea. Jokainen niistä on vapaana ostettavaksi, eli 39 potentiaalista uutta `eetu.fi`-tapausta. Tämän vuoksi tehtävä on P1 eikä P2: se on ainoa signaali, joka erottaa "yhdistys vaihtoi osoitetta" tapauksesta "yhdistyksen osoite on myyty eteenpäin".

### Mitä tehdä

1. Laske rekisteröitävä verkkotunnus (`example.fi`) sekä alkuperäisestä että lopullisesta osoitteesta. `.fi`-, `.com`-, `.org`-, `.net`- ja `.eu`-päätteille riittää kaksi viimeistä osaa; ota mukaan pieni erikoistapauslista (`co.uk`, `com.au` jne.) kuten `update-links.mjs:76`:ssa.
2. Uusi sarake `link_check_targets.final_domain_changed TINYINT(1)`.
3. Domain-muutos → tila `warning`, koodi `domain_changed`. **Ei automaattista piilotusta** — kunnat ja lehdet vaihtavat verkkotunnusta laillisesti. Mittauksessa 45 ohjauksesta valtaosa oli täysin laillisia (`helmet.fi` → `finna.fi` 22 linkkiä, museoiden yhdistymiset, hyvinvointialueiden nimenmuutokset). Nosto ylläpitonäkymän omalle listalle "Verkkotunnus vaihtui", jossa näkyy vanha ja uusi tunnus rinnakkain.
4. **Poikkeus: verkkotunnusten kauppapaikat piilotetaan heti.** Jos lopullinen osoite osuu tunnettuun myynti- tai parkkipalveluun, tila on `failed`, koodi `domain_for_sale`, piilotus ilman toistovaatimusta ja sähköposti-ilmoitus. Aloituslista: `sedo.com`, `dan.com`, `afternic.com`, `parkingcrew.net`, `bodis.com`, `hugedomains.com`, `catcha.fi`, `domainnameshop`, sekä osoitteet joiden polussa on `verkkotunnukset/` tai kyselyparametrissa `utm_medium=Parking`. Listan on oltava konfiguraatiossa, ei koodissa, jotta sitä voi täydentää ilman julkaisua.
5. Poikkeus: jos uudelleenohjaus vie `http`-osoitteeseen, se on jo `rejected` (`CURLOPT_REDIR_PROTOCOLS`). Varmista, että ylläpitonäkymä erottaa tämän tapauksen omaksi selitteekseen.

### Hyväksymiskriteerit

- Ohjaus `www.kunta.fi` → `kunta.fi` ei tuota huomiota (sama rekisteröitävä tunnus).
- Ohjaus `lehti.fi` → `mainossivu.com` tuottaa `domain_changed`-huomion, ei piilotusta.

---

## LC-08 · `http://`-linkkien käsittely ja HTTPS-päivitysehdotus (P2) — **DATAKORJAUS TEHTY 30.8.2026**

> **Tila: 42 osoitetta päivitetty HTTPS:ään** (39 `seniorSurfGuidancePlaces.ts`, 3 `localServices.ts`). Katalogin `http://`-osoitteet putosivat 59:stä **17:ään** — ne 17 eivät vastaa HTTPS:llä lainkaan. Nämä 42 linkkiä palaavat käyttäjille, koska `linkVisibility.ts` esti ne aiemmin protokollan takia. **Itse tehtävä (jonon käsittely, https_available-tunnistus putkessa) on yhä tekemättä.**


### Miksi

Tämä on käytössä oleva vika, joka näkyy heti kun cron käynnistetään. `build-link-catalog.mjs` hyväksyy `http://`-osoitteet (59 kpl 2 386:sta), mutta `HttpLinkChecker::validateTarget()` hylkää ne koodilla `https_required` → tila `rejected` → `nextCheck()` ajoittaa uuden yrityksen `retry_hours`-välein → `failure_count` kasvaa yhdellä joka vuorokausi ikuisesti.

Koska `AdminApi::linkChecks` järjestää huomiolistan `ORDER BY failure_count DESC` ja laskee `attention`-lukuun myös `rejected`-tilan, **nämä 59 linkkiä valtaavat huomiolistan kärjen jo parissa viikossa** ja työntävät oikeat viat 200 rivin katkaisurajan taakse. Samalla ne kuluttavat 59 tarkistusvuoroa vuorokaudessa.

Lisäksi: koska `http://`-osoitetta ei koskaan avata, automaatio **ei voi koskaan huomata**, että lehti on ottanut HTTPS:n käyttöön. HTTPS-päivitettävyys on tarkistettu kerran käsin (`docs/http-https-tarkistus.csv`, 26.8.2026) ja jäänyt kertaluontoiseksi.

### Mitä tehdä

1. **Älä vie `http://`-osoitteita tarkistusjonoon.** Merkitse ne katalogissa kentällä `"scheme": "http"` ja jätä `link_check_targets`-tauluun tilaan `rejected` ilman `next_check_at`-uusintaa (esim. `next_check_at = '9999-12-31'`).
2. **Tarkista sen sijaan HTTPS-vastine.** Kun katalogissa on `http://esimerkki.fi/polku`, aja tarkistus osoitteelle `https://esimerkki.fi/polku` normaalilla `refresh_days`-välillä. Jos se vastaa 200–299:
   - tila `warning`, koodi `https_available`
   - nosto ylläpitonäkymän listalle **"HTTPS saatavilla — päivitä lähdetiedostoon"**, jossa näkyy vanha ja uusi osoite
3. Rajaa `attention`-laskuri ja huomiolista koskemaan vain tilaa `failed`. `rejected` on rakenteellinen tila, ei vika.
4. Muistutus: `linkVisibility.ts`:n `isLinkVisible` estää kaikki `http://`-osoitteet joka tapauksessa, joten näiden piilottaminen ei ole tarpeen — vain päivittäminen on.

### Hyväksymiskriteerit

- `http://`-linkin `failure_count` ei kasva ajojen myötä.
- Ylläpitonäkymän "Huomioitavia"-luku ei sisällä `rejected`-tilaisia rivejä.
- Jos jokin 59:stä `http://`-osoitteesta vastaa HTTPS:llä, se näkyy päivityslistalla vuorokauden sisällä.

---

## LC-09 · Joukkovirheen katkaisin (P2)

### Miksi

Jos palvelimen verkkoyhteys, DNS tai lähtevä palomuuri pettää, koko erä epäonnistuu. Kahden peräkkäisen ajon jälkeen LC-02 alkaa piilottaa linkkejä joukolla, vaikka vika on omassa päässä. Erän koko 10 rajaa vahinkoa, mutta vuorokaudessa se on 240 linkkiä.

### Mitä tehdä

1. Jos yhdessä ajossa **yli 60 % erästä** epäonnistuu virhekoodeilla `dns_failed`, `connection_failed` tai `timeout`, merkitse ajo tilaan `skipped`, koodilla `network_suspect`, **äläkä kasvata yhdenkään kohteen `failure_count`-arvoa** äläkä piilota mitään.
2. Jos kaksi peräkkäistä ajoa saa saman merkinnän, kirjaa `link_check_runs.message_code = 'network_suspect_repeated'` ja lähetä ylläpitäjälle sähköposti olemassa olevalla `NotificationJob`-putkella.
3. Jos yksi ajo piilottaisi enemmän kuin `auto_block_max_per_run` linkkiä, piilota rajan verran ja kirjaa loput seuraavaan ajoon. Älä ohita rajaa.
4. Tarkista käynnistyksessä yksi tunnettu kiintopiste (esim. `https://www.suomi.fi/`) ennen erän ajamista. Jos se ei vastaa, ajo on `skipped`/`network_suspect` heti.

### Hyväksymiskriteerit

- Simuloitu täysi verkkokatko ei kasvata yhdenkään linkin `failure_count`-arvoa eikä tuota estoja.
- Ajohistoriasta näkee, mitkä ajot on ohitettu ja miksi.

---

## LC-10 · Ylläpitonäkymän toiminnot ja ilmoitukset (P2)

### Miksi

`#link-checks`-osio on nyt vain luettava. Ylläpitäjä näkee vian mutta ei voi tehdä sille mitään ilman koodimuutosta — mikä käytännössä tarkoittaa, ettei sitä tehdä. Sähköposti-ilmoitusten infra on jo olemassa (`EmailDispatcher`, `NotificationJob`, `NotificationReportBuilder`), mutta linkkitarkistus ei käytä sitä.

### Mitä tehdä

1. Kolme toimintoa jokaiselle huomiolistan riville, uusi `POST /api/v1/admin/link-checks/{urlHash}/action`:
   - **Piilota nyt** → rivi `blocked_links`-tauluun, `created_by` = kirjautunut ylläpitäjä
   - **Merkitse poikkeukseksi** → `link_check_overrides`, pakollinen perustelu ja `scope`-valinta (LC-05), oletus `bot_protection` ja `next_review_at` = 3 kk
   - **Tarkistin sen, näytä taas** → `failure_count = 0`, poistaa automaatin tekemän eston, kirjaa `verified_at`
2. Kaikki päätökset kirjataan `updated_at`- ja `verified_by`-tiedoilla. Poikkeus ilman perustelua ei tallennu.
3. Lisää näkymään neljä uutta listaa: **Verkkotunnus vaihtui** (LC-07), **HTTPS saatavilla** (LC-08), **Varmennus vanhentunut** (LC-05) ja **Sisältöhuomiot** (LC-06). Pidä nykyinen "Huomioitavia"-lista vain varmistetuille vioille.
4. Sähköposti-ilmoitus `NotificationJob`in kautta, kun jokin seuraavista täyttyy: uusi kriittisen luokan linkki piilotettiin, `network_suspect_repeated`, tai yli 10 uutta estoa vuorokaudessa. Ei ilmoitusta yksittäisistä `normal`-luokan vioista — muuten ilmoitukset opitaan ohittamaan.
5. Saavutettavuus: uudet painikkeet näppäimistöllä, näkyvä fokusrengas, tila luettavissa ruudunlukijalla. Testaa 320 px ja 200 % tekstikoolla kuten muutkin ylläpitonäkymän osiot.

### Hyväksymiskriteerit

- Ylläpitäjä voi käsitellä linkkihuomion ilman koodimuutosta.
- Poikkeus vaatii perustelun ja `scope`-valinnan.
- Jokaisesta päätöksestä jää tekijä ja aikaleima.

---

## LC-11 · Vanhan Node-putken rajaus (P1, päätös ennen koodia)

### Miksi

`scripts/update-links.mjs` kirjoittaa yhä `linkHealth.ts`-tiedoston, jonka `linkVisibility.ts` lukee staattisena estolistana buildissa. Uusi putki kirjoittaa `blocked_links`-tauluun, jonka sama `linkVisibility.ts` lukee ajonaikaisesti. Kaksi lähdettä, ei työnjakoa: jos `npm run links` ajetaan uuden putken rinnalla, se voi kirjoittaa `linkHealth.ts`:ään eston, jonka palvelinputki on jo perunut — ja päinvastoin.

### Ehdotettu työnjako

| Vastuu | Omistaja |
| --- | --- |
| Saavutettavuus, HTTPS, DNS, TLS, uudelleenohjaus, sisältösignaali, piilotus ja palautus | **Palvelinputki** (`LinkCheckJob`) |
| Katalogin rakentaminen lähdetiedostoista | `scripts/build-link-catalog.mjs` |
| Puhelinnumeroiden lähdetarkistus (`docs/puhelinnumerot.csv/md`) | `scripts/update-links.mjs`, säilytetään |
| Linkkitilastot käyttöliittymään (`linkStats.ts`, `localStats.ts`) | `scripts/update-links.mjs`, säilytetään |
| RDAP-signaali | Poistetaan toistaiseksi (ks. alla) |

### Mitä tehdä

1. Poista `linkHealth.ts`:n kirjoitus `update-links.mjs`:stä sen jälkeen kun LC-02 on tuotannossa ja `auto_block_enabled = true`. Jätä tiedosto olemassa tyhjänä taulukkona, jotta `linkVisibility.ts` ei hajoa, ja lisää kommentti, joka kertoo että esto tulee nyt palvelimelta.
2. Poista `update-links.mjs`:stä HTTP-tarkistus, sisältötarkistus, riskipisteytys ja RDAP-haku. Ne ovat nyt palvelinputken vastuulla — paitsi RDAP, jota **ei tällä hetkellä käytetä mihinkään**: `getDomainOwnershipSignal()` kutsutaan jokaiselle verkkotunnukselle ja tulos kirjoitetaan CSV-sarakkeeseen, mutta `scoreLinkRisk()` ei lue sitä. Poista se kunnes sille on käyttö.
3. Nimeä jäljelle jäävä skripti uudelleen kuvaavasti, esim. `scripts/update-link-stats.mjs`, ja päivitä `package.json`.
4. Päivitä `docs/linkkien-turvallisuustarkistuksen-suunnitelma.md` vastaamaan toteutusta. Sen kuvaus `http://`-linkkien tarkistuksesta ja riskipisteytyksestä on nykykoodiin nähden vanhentunut.

### Hyväksymiskriteerit

- Vain yksi järjestelmä kirjoittaa estoja.
- `npm run links` (tai sen seuraaja) ei enää muuta sitä, mitkä linkit käyttäjälle näkyvät.

---

## LC-12 · Testit (P1, tehdään rinnan)

1. **PHP-yksikkötestit** `api/tests/`-hakemistoon olemassa olevalla ajurilla (`api/tests/run.php`), `LinkChecker`-rajapinta valetoteutuksena:
   - piilotuslogiikka: 404 × 2 → esto; `warning` × 5 → ei estoa; ihmisen esto säilyy
   - poikkeuksen `scope` ja vanheneminen
   - joukkovirheen katkaisin
   - kriittisyysluokan mukainen `nextCheck()`
2. **Katalogitesti** `scripts/link-catalog-test.mjs`: laajenna nimikattavuuteen, kategorioiden määrään ja kriittisyysarvoihin (LC-01).
3. **HTTP-kerroksen testit** `HttpLinkChecker`ille kiinteillä vastauksilla: HEAD 403 → GET 200, Range 416 → uusinta, soft-404, domain-muutos, uudelleenohjausketju.
4. Aja `npm run test:link-policy`, `npm run test:link-catalog` ja PHP-testit samassa tarkistuksessa. Lisää ne julkaisun tarkistuslistaan.

---

## LC-14 · Uutissyötteiden tuoreus (P3)

### Miksi

Uutisvirtoja on 297 ja **yksikään niistä ei ollut vikatilassa** elokuun ajossa — 0,0 %. Se ei tarkoita, että ne olisivat kunnossa.

Nykyinen tarkistus kysyy vain "vastaako osoite". RSS-syöte vastaa 200:lla vielä vuosia sen jälkeen, kun lehti on lopettanut julkaisemisen tai vaihtanut järjestelmää. Repossa ei ole mitään, joka lukisi syötteen `pubDate`- tai `lastBuildDate`-kenttää: `scripts/update-newspaper-feeds.mjs` ja `update-news-feed-coverage.mjs` eivät käsittele päivämääriä lainkaan. Tyhjiä syötteitä on karsittu kerran käsin 14.8.2026.

Palvelu näyttää ikääntyneille paikallisuutisia. Vanhentunut syöte on käyttäjälle huonompi kuin puuttuva: kortissa näkyy uutisotsikko, joka on kuukausien takaa, eikä mikään kerro sitä.

### Mitä tehdä

1. Kun tarkistettavan kohteen `content-type` on `xml`, `rss` tai `atom`, poimi uusimman kohteen `pubDate` / `updated` / kanavan `lastBuildDate`.
2. Uusi sarake `link_check_targets.feed_latest_item_at DATETIME(6) NULL`.
3. Jos tuorein kohde on yli 90 vuorokautta vanha: tila `warning`, koodi `feed_stale`. Ei automaattista piilotusta — kausiluonteinen paikallislehti voi olla hiljaa kesän.
4. Oma lista ylläpitonäkymään: **"Uutissyöte ei ole päivittynyt"**, järjestettynä vanhimmasta.
5. Jos syöte vastaa 200:lla mutta ei sisällä yhtään kohdetta, koodi `feed_empty`.

### Hyväksymiskriteerit

- Syöte, jonka uusin kohde on vuodelta 2024, nousee `feed_stale`-listalle.
- Tuoreustarkistus ei koskaan piilota linkkiä automaattisesti.

---

## LC-13 · Safe Browsing (P3, julkaisun jälkeen)

Suunnitelma on valmiina tiedostossa `docs/codex-safe-browsing.md`. Tämä on **ainoa** koko listan signaali, joka tunnistaa phishing- ja haittasivuston; kaikki muu mittaa toimivuutta ja johdonmukaisuutta, ei vihamielisyyttä. Koska palvelun markkinointikärki on huijauksilta suojautuminen, tämä on suurin ristiriita lupauksen ja toteutuksen välillä.

Toteuta se osana palvelinputkea, ei erillisenä Cloud Functionina: `SafeBrowsingChecker`-luokka, jonka `LinkCheckJob` kutsuu erän lopuksi enintään 500 URLin nipuissa, tulos välimuistiin 24 tunniksi. Avain palvelimen konfiguraatioon, ei koodiin. Osuma → tila `failed`, koodi `safe_browsing_threat`, **piilotus heti ilman toistovaatimusta** ja sähköposti-ilmoitus.

Älä aloita tätä ennen kuin LC-01…LC-12 ovat valmiit ja putki on ajanut tuotannossa vakaasti vähintään kaksi viikkoa.

---

## LC-15 · Käyttäjälle näkyvät linkkiluvut ovat ristiriitaiset (P2) — **OSITTAIN TEHTY 30.8.2026**

> **Tehty:** puhelinnumeroiden laskenta korjattu (`linkit.tsx`: `KELA_TAXI_PROVIDERS` mukaan, 39 → 81). **Tekemättä:** termien erottelu, `linkStats.ts`:n generointi katalogista, palvelinpuolen `link-stats`-päätepiste, luettelon täydentäminen ja 2 %:n poikkeamatesti.


### Miksi

Sovellus näyttää käyttäjälle kolme eri lukua samasta asiasta:

| Missä | Luku | Mistä tulee |
| --- | ---: | --- |
| Linkkiluettelo, "Kaikki linkit" | **5 199** | `linkit.tsx:221` `allLinkCount = generalLinks.length + regionalLinks.length`, laskettu ajossa |
| Linkkiluettelo, "Yleiset" | 947 | `generalLinks`, uniikki avaimella `category\|group\|name\|url` |
| Linkkiluettelo, "Alueelliset" | 4 252 | `regionalLinks`, uniikki avaimella **`municipality`**`\|category\|name\|url` |
| Linkkiluettelo, "Puhelinnumeroita" | **39** | `linkit.tsx:135` `phoneLinkCount`, vain `SHORTCUTS`-rakenteesta |
| Tietoa-sivu | **1 997** | `components/InfoModal.tsx:123` `LINK_STATS.visibleLinks`, generoitu tiedosto |

Kolme erillistä ongelmaa:

**Täsmäytys on tehty 30.8.2026** toistamalla `linkit.tsx`:n laskenta sovelluksen omalla datalla; tulokset ovat tiedostossa `docs/linkkilukujen-tasmaytys-2026-08-30.md`. Laskenta tuotti täsmälleen samat luvut kuin käyttöliittymä (947 ja 4 252), joten alla olevat luvut ovat tarkkoja:

| | Rivejä | Eri osoitteita |
| --- | ---: | ---: |
| Yleiset | 947 | 922 |
| Alueelliset | 4 252 | 1 073 |
| **Linkkiluettelo yhteensä** | **5 199** | **1 825** (170 päällekkäistä) |
| Katalogi (tarkistettavat) | | 2 386 |

**Suurempi luku kattaa siis vähemmän eri osoitteita.** Alueellinen rivi yksilöidään avaimella `kunta|kategoria|nimi|osoite`, joten jokainen alueellinen osoite esiintyy keskimäärin neljän kunnan listalla. Ääriesimerkki: `krell.fi/yhdistykset/` näkyy 113 kunnan listalla ja tuottaa yksin 113 riviä.

**Ja luettelo on epätäydellinen:** 563 katalogin osoitetta ei ole linkkiluettelossa lainkaan — digiopastuspaikat 256, kuntien kieliversiot 207, urheiluseurat 45, muut 55. Toiseen suuntaan puutteita ei ole (jokainen luettelon osoite on katalogissa).

1. **Kaksi eri määritelmää sanalle "linkki".** Linkkiluettelo laskee *esiintymiä*: `regionalLinks` on avainnettu kunnan mukaan, joten sama hyvinvointialueen osoite lasketaan erikseen jokaiselle kunnalle. Tietoa-sivu laskee *uniikkeja osoitteita*. Kumpikaan ei ole väärin, mutta käyttäjä näkee saman sovelluksen kahdella sivulla luvut 5 199 ja 1 997 ilman mitään selitystä.

2. **`linkStats.ts` on vanhentunut.** Se on generoitu 25.8.2026 ja sanoo `totalLinks: 2099`. Katalogissa on nyt 2 381 uniikkia osoitetta. Ero selittyy suurelta osin sillä, että `update-links.mjs` ei lue `communityLinks.ts`- eikä `seniorSurfGuidancePlaces.ts`-tiedostoja (ks. luku 0.5). Myös `visibleLinks: 1997` perustuu vanhan tarkistimen piilotuslukuun 102, joka ei enää vastaa todellisuutta.

3. **Linkkiluettelo ei sisällä kaikkia linkkejä.** 563 osoitetta puuttuu: digiopastuspaikat (256, `seniorSurfGuidancePlaces.ts` kulkee vain `services/guidancePlacesService.ts`:n kautta), kuntien kieliversiot (207/235), urheiluseurat (45) ja 55 muuta. Käyttäjälle esitetään siis luettelo, joka väittää olevansa koonti mutta jättää kokonaisia osioita pois.

4. **Puhelinnumeroita on 81, ei 39.** `linkit.tsx`:n `phoneLinkCount` käy läpi vain `SHORTCUTS`-rakenteen eikä lainkaan tiedostoa `localKelaTaxiNumbers.ts`. Erotus on täsmälleen `LOCAL_LINK_STATS.localKelaTaxiPhones` = 42, ja 39 + 42 = 81 = `LINK_STATS.phoneLinks`. Alueelliset Kela-taksinumerot puuttuvat luvusta kokonaan.

### Mitä tehdä

1. **Päätä ja kirjaa kaksi termiä**, ja käytä niitä johdonmukaisesti sekä koodissa että käyttöliittymässä:
   - **Linkkiosoite** = uniikki URL. Tämä on se, mitä tarkistetaan.
   - **Linkkiesiintymä** = kuinka monta kertaa osoite näkyy käyttöliittymässä, kun kunnat lasketaan erikseen.
2. **Merkitse luvut näkyviin sen mukaan.** Linkkiluettelossa esimerkiksi "5 199 linkkiä kaikille kunnille yhteensä (2 381 eri osoitetta)". Tietoa-sivulla "2 322 tarkistettua osoitetta, joista näkyvissä N".
3. **Muodosta `linkStats.ts` ja `localStats.ts` katalogista**, ei `update-links.mjs`:n omasta keruusta. Kun LC-11:n työnjako on tehty, katalogi on ainoa linkkien lähde, joten tilastojen on tultava samasta paikasta. Lisää molempiin generoitu aikaleima ja näytä se Tietoa-sivulla ("Linkit tarkistettu viimeksi …").
4. **Ota näkyvien linkkien luku palvelimelta**, ei buildista. Kun LC-02 on käytössä, `visibleLinks` on `katalogin osoitteet − blocked_links`. Staattinen luku vanhenee heti seuraavassa cron-ajossa. Yksinkertaisin tapa: laajenna `GET /api/v1/admin/link-checks`-vastauksen rinnalle julkinen, kevyt `GET /api/v1/link-stats`, joka palauttaa vain kokonaisluvut ja tarkistuksen aikaleiman.
5. **Korjaa puhelinnumeroiden laskenta** `linkit.tsx`:ssä laskemaan mukaan `localKelaTaxiNumbers.ts`:n numerot, tai ota luku suoraan `LINK_STATS.phoneLinks`-kentästä.
6. **Lisää testi**, joka kaatuu jos `linkStats.ts`:n `totalLinks` poikkeaa katalogin osoitemäärästä yli 2 %. Näin luku ei pääse ajautumaan uudelleen huomaamatta.

### Hyväksymiskriteerit

- Käyttäjälle näytettävä luku on selitetty siinä kohdassa, missä se näkyy — kumpaakaan lukua ei esitetä ilman mainintaa siitä, mitä se laskee.
- `linkStats.ts` ja katalogi eivät voi olla eri mieltä ilman että testi kaatuu.
- Puhelinnumeroiden luku sisältää Kela-taksinumerot.
- Tietoa-sivu kertoo, milloin linkit on viimeksi tarkistettu.

---

## Toteutusjärjestys

**Ennen julkaisua, jos aikaa on (noin 2–3 päivää):**

1. LC-01 katalogi rakenteiseksi
2. LC-04 selainmainen pyyntö
3. LC-03 erän koko, hajautus ja isäntärajoitus
4. LC-08 `http://`-linkkien käsittely
5. LC-12 testit näille

Näiden jälkeen putki voi ajaa tuotannossa **kuivana** (`auto_block_enabled = false`) ja kerätä oikeaa dataa. Se on itsessään arvokasta: ensimmäinen täysi kierros kertoo, kuinka moni elokuun 26:sta HTTP 500 -vastauksesta oli väärä.

**Heti julkaisun jälkeen (noin viikko):**

6. LC-05 poikkeusrekisteri (kuusi poikkeusta erääntyi jo 1.9.)
7. LC-09 joukkovirheen katkaisin
8. LC-02 automaattinen piilotus — vasta LC-05:n ja LC-09:n jälkeen, ei ennen
9. LC-11 vanhan putken rajaus
10. LC-15 linkkilukujen yhtenäistäminen (tehdään LC-11:n yhteydessä, koska tilastot siirtyvät katalogiin)

**Syyskuun aikana:**

11. LC-06 sisältötarkistus
12. LC-07 domain-muutos
13. LC-10 ylläpitonäkymän toiminnot ja ilmoitukset

**Lokakuu:**

14. LC-14 uutissyötteiden tuoreus
15. LC-13 Safe Browsing

## Raportointi

Kirjaa jokaisen tehtävän valmistuttua tiedostoon `docs/julkaisupaivakirja-2026-09.md`: mitä muutettiin, mitkä testit ajettiin, ja LC-02:n ja LC-04:n osalta **numerot ennen ja jälkeen** — montako linkkiä on tilassa `failed`, montako `warning`, ja montako olisi piilotettu. Ilman noita lukuja emme tiedä, paransiko muutos tarkkuutta vai siirsikö se virheet toiseen luokkaan.
