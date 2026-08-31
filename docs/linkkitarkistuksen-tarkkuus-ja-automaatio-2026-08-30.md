# Linkkitarkistuksen tarkkuus ja automaatio

Päivitetty: 30.8.2026
Koskee: `scripts/update-links.mjs`, `linkHealth.ts`, `verifiedLinks.ts`, `linkVisibility.ts`
Tausta: `docs/linkkien-turvallisuustarkistuksen-suunnitelma.md` (12.6.2026)

## 1. Yhteenveto

Linkkien luotettavuus on Aloitussivun keskeisin lupaus, mutta linkkiterveys on tällä hetkellä **käsityö, jonka tulos leivotaan buildiin**. Tarkistus ajetaan silloin kun joku muistaa ajaa sen, yhdeltä koneelta, yhtenä hetkenä, ilman uusintayrityksiä ja ilman tietoa siitä millainen tilanne oli edellisellä kerralla.

Kaksi seurausta:

1. **Rikkinäinen linkki voi olla näkyvissä viikkoja.** Ajohistoria (`docs/linkit.md` gitissä): 12.6. → 10.7. → 13.8. → 25.8. Väli on ollut 12–28 vuorokautta. Deploy-workflow ei aja tarkistusta lainkaan, joten julkaisu ei paranna tilannetta.
2. **Toimiva linkki voi kadota käyttäjältä ilman syytä.** Yksittäinen aikakatkaisu tai palvelimen bottisuojaus riittää piilottamaan linkin seuraavaan ajoon asti. Tästä on jo konkreettinen näyttö: `verifiedLinks.ts`:ssä on kuusi poikkeusta, jotka kaikki on jouduttu kirjaamaan käsin siksi, että sivu vastaa selaimelle 200 mutta tarkistimelle 500 tai 417.

Nykyisen ajon tulos (25.8.2026): 2 099 linkkiä, 102 piilotettu, 236 manuaalisessa jonossa. Piilotetuista **59 on `http://`-osoitteita, jotka `linkVisibility.ts` estäisi joka tapauksessa** — eli lista on yli puoliksi täytettä, joka peittää alleen ne ~43 tapausta, joissa on oikeasti jotain rikki.

Manuaalisessa jonossa on 236 riviä, joista 86 on merkintä "Sivun otsikko tai sisältö ei selvästi vastaa linkin nimeä". Se on jonon suurin yksittäinen syy — ja käytännössä kohinaa, koska vertailulogiikka on liian karkea (kohta 3.3). 236 riviä on liikaa käytäväksi läpi kerralla, joten jono ei tule käydyksi läpi ollenkaan.

Ehdotukset alla on jaettu tarkkuuteen (luku 4), automaatioon (luku 5) ja prosessiin (luku 6). Kiireellisin on **T1 (kaksi peräkkäistä epäonnistumista ennen piilotusta)** ja **T2 (selainmainen tunniste)**: ne kaksi poistavat suurimman osan vääristä piilotuksista pienellä työllä.

## 2. Nykytila lyhyesti

| Vaihe | Miten toimii nyt |
| --- | --- |
| Käynnistys | Käsin: `npm run links` kehittäjän koneelta |
| Rytmi | Ei sovittua rytmiä; toteutunut väli 12–28 vrk |
| Keruu | 13 lähdetiedostoa regexillä, 2 099 uniikkia linkkiä |
| Tekninen tarkistus | HEAD → tarvittaessa GET (`Range: 0-2048`), 10 s timeout, 12 rinnakkain, ei uudelleenyritystä |
| Sisältötarkistus | title/h1/meta + 64 kt sivun alkua; parkkisivun tunnistus + nimivastaavuus |
| Domain-signaali | RDAP-haku per domain — kirjoitetaan raporttiin, **ei vaikuta pisteytykseen** |
| Päätös | Riskipisteet ≥ 50 → `piilota`; > 0 → `tarkista` |
| Vaikutus | `linkHealth.ts` → build → deploy. Ilman uutta buildia mikään ei muutu |
| Ohitus | `verifiedLinks.ts` (10 riviä) ja `MANUALLY_VERIFIED_URLS` (28 URLia skriptin sisällä) |
| Nopea hätäesto | On olemassa: `addBlockedLink()` → `blocked-links`-API → näkyy ilman buildia. Vain käsikäyttöinen |
| Raportit | `docs/linkit.csv`, `linkit-huomiot.csv`, `yllapito-linkkiloki.csv`, `linkit-manuaalinen-tarkistus.csv`, `puhelinnumerot.csv/md` |

Suunnitelman (12.6.) vaiheista 1–3 ja 5 on toteutettu, **vaihe 4 (ylläpito-UI) ja vaihe 6 (ajastus ja julkaisuputki) ovat kokonaan tekemättä**. Vaiheen 6 hyväksymiskriteeri "rikkinäinen linkki ei jää näkyviin seuraavaan julkaisuun" ei siis täyty.

## 3. Havainnot tarkkuudesta

### 3.1 Tarkistus on tilaton — yksi huono hetki piilottaa linkin (vakava)

Jokainen ajo on itsenäinen tilannekuva. Ei tallenneta, oliko linkki kunnossa edellisellä kerralla. Yhdestä epäonnistuneesta pyynnöstä seuraa suoraan `virhe` (+80 pistettä) ja piilotus. Uusintayritystä ei ole: yksi HEAD, tarvittaessa yksi GET, 10 s aikakatkaisu.

Käytännössä: jos ajon aikana ajajan verkkoyhteys pätkii, VPN katkeaa tai kohdepalvelu on huollossa 30 sekuntia, linkkejä katoaa käyttäjiltä siihen asti kunnes joku ajaa tarkistuksen uudelleen — eli mahdollisesti kolmeksi viikoksi. Nykyisessä raportissa on 5 riviä `fetch failed` ja useita aikakatkaisuja, joista osa on lähes varmasti tätä.

Tämä on tarkkuuden suurin yksittäinen ongelma, koska se tuottaa nimenomaan sitä virhettä, joka on käyttäjälle näkymätön: palvelu, joka oikeasti toimii, puuttuu listalta eikä kukaan huomaa.

### 3.2 Tarkistin näyttää botilta, joten osa palvelimista torjuu sen (vakava)

`scripts/update-links.mjs:223` lähettää tunnisteen `SeniorinAloitussivu-link-check/1.0`. Moni suojattu sivusto (Cloudflare, Imperva, kunnan WAF) vastaa tuntemattomalle asiakkaalle 403:lla tai 500:lla, vaikka sivu toimii selaimessa täysin normaalisti.

Näyttö on jo kirjattuna `verifiedLinks.ts`:ään: kkv.fi/kuluttajaneuvonta, tamperefilharmonia.fi, kotikokki.net ja marttila.fi on kaikki jouduttu merkitsemään poikkeuksiksi juuri tällä perusteella ("Palvelin palauttaa automaattisen Node-tarkistimen pyynnölle HTTP 500"). Outlook vastaa 417 (Expectation Failed), mikä viittaa `Range`-otsakkeeseen.

Nykyisessä ajossa on 26 kpl HTTP 500, 12 kpl 403 ja 4 kpl 429. Iso osa niistä on todennäköisesti tätä samaa ilmiötä. Jokainen niistä on joko turha piilotus tai turha rivi manuaalisessa jonossa.

### 3.3 Sisältövertailu on samanaikaisesti liian löysä ja liian meluisa (vakava)

`contentMatchesExpected` (`update-links.mjs:436`) hyväksyy sivun, jos **yksikin** vähintään 4-merkkinen sana linkin nimestä tai kategoriasta esiintyy sivun ensimmäisessä 64 kt:ssa.

- Liian löysä: linkki "Kuopion kaupunki / Palveluliikenne" menee läpi mistä tahansa sivusta, jonka tekstissä esiintyy sana "kuopio" — myös kaapatusta domainista tai mainossivusta.
- Liian meluisa: 86 linkkiä sai merkinnän "ei selvästi vastaa linkin nimeä". Esimerkiksi lyhytnimiset lehdet ja seurat eivät osu, vaikka sivu on oikea.

Lisäksi **soft-404 jää kokonaan huomaamatta**: sivu, joka palauttaa 200 ja tekstin "Sivua ei löytynyt", menee tarkistuksesta läpi ilman merkintää. Tämä on tavallinen tapa, jolla kunnan sivu-uudistus rikkoo alasivulinkit — ja juuri sitä tapausta, jonka tämän tarkistuksen pitäisi löytää.

Pisteytys poikkeaa myös suunnitelmasta: suunnitelmassa "sisältö ei vastaa odotettua nimeä" = +70, koodissa +35.

### 3.4 Poikkeukset eivät vanhene, ja ne ohittavat liikaa (vakava)

`verifiedLinks.ts`:ssä on kenttä `nextReviewAt`, ja kuudelle poikkeukselle on merkitty **1.9.2026** — kahden päivän päähän. Mikään ei lue tuota kenttää: `readVerifiedLinks` (`update-links.mjs:133`) poimii regexillä vain `url`, `status` ja `confidence`. Poikkeus on siis käytännössä pysyvä.

Pahempaa: `hasAcceptedException` (`update-links.mjs:520`) ohittaa `mustHide`-ehdon myös silloin, kun HTTP-tarkistus epäonnistuu kokonaan. Yhdessä −40 pisteen alennuksen kanssa tämä tarkoittaa, että **poikkeukseksi merkitty linkki pysyy näkyvissä, vaikka se palauttaisi 404:n tai sen domain lakkaisi ratkeamasta** (404 = 70 − 40 = 30 < 50). Poikkeus on tarkoitettu kiertämään bottisuojausta, ei kuolleen linkin näyttämiseen.

Vertailuksi: puhelinnumeropuolella vanheneminen on jo toteutettu oikein (90 vrk kriittisille, 180 vrk muille, Kela-taksit 1.12.2026). Sama malli puuttuu linkeistä.

### 3.5 `http://`-linkkejä ei enää tarkisteta lainkaan (keskisuuri)

`link-url-policy.mjs` hylkää kaiken muun kuin `https:`-protokollan, ja sekä `evaluateUrlSafety` että `checkHttp` kutsuvat sitä ensimmäisenä. `http://`-linkki saa siis automaattisesti turvallisuusvirheen (+100) ja tarkistusvirheen (+80) **ilman että kohteeseen otetaan yhteyttä**.

Seuraukset:
- 59 `http://`-riviä `linkHealth.ts`:ssä on turhaa: `isLinkVisible` (`linkVisibility.ts`) estää kaikki `http://`-osoitteet erikseen jo runtimessa.
- Jos jokin näistä lehdistä ottaa HTTPS:n käyttöön, **automaatio ei voi koskaan huomata sitä**. HTTPS-päivitettävyys on tarkistettu kerran käsin (`docs/http-https-tarkistus.csv`, 26.8.), ja se jäi kertaluontoiseksi.
- `docs/linkkien-turvallisuustarkistuksen-suunnitelma.md` väittää yhä, että myös `http://`-linkit tarkistetaan. Dokumentti on tältä osin vanhentunut.

### 3.6 RDAP-haku maksaa mutta ei vaikuta mihinkään (pieni, mutta helppo voitto)

Jokaiselle uniikille domainille tehdään RDAP-kysely (`getDomainOwnershipSignal`). Tulos kirjoitetaan CSV-sarakkeeseen, mutta **`scoreLinkRisk` ei käytä sitä lainkaan**. Suunnitelman kohta "domain uusi tai omistajatieto puutteellinen: +20" on jäänyt toteuttamatta. Ajoaika kuluu, hyötyä ei tule — ja nimenomaan tuore rekisteröintipäivä olisi yksi harvoista automaattisesti saatavista huijaussignaaleista.

### 3.7 Kaksi rekisteriä samasta asiasta (pieni)

Manuaalisesti hyväksytyt linkit ovat kahdessa paikassa: `MANUALLY_VERIFIED_URLS` (28 kovakoodattua URLia `update-links.mjs:12`, saavat automaattisesti luottamustason C ilman perustelua tai päivämäärää) ja `verifiedLinks.ts` (10 riviä perusteluineen). Kahden totuuden lähteen ylläpito ajautuu erilleen.

### 3.8 Ei hälytystä eikä varmistusta joukkovirheelle (keskisuuri)

Jos ajo tuottaisi 102 piilotuksen sijaan 600, tiedosto kirjoittuisi silti ja tulos päätyisi seuraavaan buildiin. Mikään ei vertaa tulosta edelliseen ajoon eikä keskeytä ilmeisen rikkinäistä ajoa (esim. ajajan verkko poikki). Tämä on sama riski kuin 3.1, mutta koko aineiston mitassa.

### 3.9 Piilotus on käyttäjälle täysin hiljainen (tuotepäätös)

Piilotettu linkki katoaa listalta ilman jälkeä. Jos kunnan ainoa palveluliikennelinkki piiloutuu, käyttäjä näkee tyhjän kohdan eikä tiedä, onko palvelua olemassa. Kohderyhmän kannalta "emme juuri nyt saa yhteyttä tähän sivustoon" on rehellisempi ja käyttökelpoisempi kuin katoaminen — ja tukee palvelun luotettavuuslupausta paremmin kuin hiljaisuus.

### 3.10 Sivuhavainto: CI-putki ei vastaa tuotantoa

`.github/workflows/deploy.yml` rakentaa ja julkaisee GitHub Pagesiin osoitteeseen `eerotuomenoksa.github.io/Aloitussivu/`, kun tuotanto on siirtymässä Cloudcityyn osoitteeseen `seniorsurf.fi/aloitus`. Ennen kuin linkkitarkistus kytketään julkaisuputkeen, kannattaa päättää mikä putki on se oikea.

## 4. Ehdotukset tarkkuuteen

Prioriteettijärjestyksessä. Työmäärät ovat karkeita arvioita yhden kehittäjän työnä.

### T1. Kaksi peräkkäistä epäonnistumista ennen piilotusta (½ pv) — tärkein

Tallenna ajojen välinen tila tiedostoon `linkHealthState.json` (versionhallintaan): per URL viimeisin tila, peräkkäisten epäonnistumisten määrä, ensimmäisen epäonnistumisen päivä, viimeisin onnistumispäivä.

Sääntö:
- 1. epäonnistuminen → `tarkista`, ei piilotusta, kirjataan tilaan
- 2. peräkkäinen epäonnistuminen eri ajossa → `piilota`
- Poikkeus: 404, 410 ja DNS-virhe piilotetaan heti (ne eivät ole hetkellisiä)
- Onnistuminen nollaa laskurin
- Lisää raporttiin sarake "Rikki alkaen" ja "Viimeksi kunnossa"

Lisäksi 2 uudelleenyritystä eksponentiaalisella backoffilla (1 s, 4 s) verkkovirheelle, aikakatkaisulle ja 5xx-vastaukselle. Nosta aikakatkaisu 10 s → 20 s hitaille kuntasivuille.

Vaikutus: poistaa käytännössä kaikki hetkellisistä häiriöistä johtuvat piilotukset. Antaa myös ensimmäistä kertaa vastauksen kysymykseen "kuinka kauan tämä linkki on ollut rikki".

### T2. Selainmainen tunniste ja varovaisempi pyyntö (1–2 h)

- Vaihda User-Agent tavalliseksi selaintunnisteeksi ja lisää loppuun rehellinen yhteystieto, esim. `Mozilla/5.0 (compatible; SeniorSurf-linkkitarkistus/2.0; +https://seniorsurf.fi/aloitus)`.
- Lisää `accept-language: fi-FI,fi;q=0.9,sv;q=0.8,en;q=0.7`.
- Jos GET `Range`-otsakkeella palauttaa 416 tai 417, yritä uudelleen ilman `Range`-otsaketta.
- Jos HEAD epäonnistuu, kokeile GET myös silloin kun HEAD palautti 405 tai 501 (nyt GET-kokeilu tehdään, mutta vain kerran ja samoilla otsakkeilla).
- Kunnioita `Retry-After`-otsaketta 429-vastauksessa.

Vaikutus: iso osa nykyisistä 26 × 500, 12 × 403 ja 4 × 429 -riveistä katoaa. Osa `verifiedLinks.ts`:n poikkeuksista käy tarpeettomiksi, jolloin ne voi poistaa — mikä on itsessään tarkkuusparannus (kohta 3.4).

### T3. Sisältösignaalin jako kahtia + soft-404 (1 pv)

Erota vahvat ja heikot signaalit:

**Vahva (pisteytetään, +60):** parkkisivu tai myytävä domain (on jo), kirjautumisportaali odottamattomassa paikassa, hakukoneen tulossivu, ja **uutena soft-404**: sivun otsikko tai ensimmäiset 200 merkkiä sisältävät "sivua ei löydy", "sivua ei löytynyt", "page not found", "404", "poistettu käytöstä", "under construction".

**Heikko (ei pisteitä, vain raporttiin):** nimivastaavuus. Siirrä `contentMatchesExpected` omaan sarakkeeseensa "Nimivastaavuus: heikko/kohtalainen/vahva" ja ota se pois riskipisteytyksestä.

Paranna samalla vertailua: rajaa vertailuteksti `<title>`, `<h1>`, meta description ja canonical-osoitteeseen (ei koko 64 kt:n raakatekstiin), vertaa myös domainin nimeä linkin nimeen, ja vaadi useamman kuin yhden sanan osuma pitkille nimille.

Vaikutus: manuaalinen jono putoaa 236:sta arviolta noin sataan, ja jono muuttuu sellaiseksi, joka on realistista käydä läpi. Samalla löytyvät soft-404:t, jotka nyt menevät kokonaan ohi.

### T4. Poikkeusten vanheneminen ja yksi rekisteri (½ pv)

- Lue `nextReviewAt` ja `verifiedAt` `verifiedLinks.ts`:stä (mieluiten tuomalla tiedosto sisään sen sijaan että sitä luetaan regexillä).
- Vanhentunut poikkeus lakkaa vaikuttamasta ja nousee raporttiin omalla rivillään "Varmennus vanhentunut".
- Poikkeus ei koskaan ohita 404/410/DNS-virhettä. Rajaa poikkeuksen vaikutus siihen mitä varten se on: bottisuojauksen aiheuttama 403/429/500.
- Siirrä `MANUALLY_VERIFIED_URLS`:n 28 URLia `verifiedLinks.ts`:ään perusteluineen ja päivämäärineen, ja poista vakio skriptistä.
- Anna oletusvanheneminen luottamustason mukaan: A = 12 kk, B = 12 kk, C = 6 kk, poikkeus = 3 kk.

Huom: kuusi nykyistä poikkeusta erääntyy **1.9.2026**. Ne pitää käydä läpi joka tapauksessa.

### T5. HTTPS-päivityksen automaattinen etsintä (2–3 h)

Kokeile jokaiselle `http://`-linkille sen `https://`-vastine joka ajossa. Jos HTTPS vastaa 200–399 ja sisältö vastaa, kirjaa raporttiin **"HTTPS saatavilla — päivitä lähdetiedostoon"** ja nosta rivi omaan raporttiinsa `docs/https-paivitettavat.csv`.

Poista samalla `http://`-osoitteet `linkHealth.ts`:stä (59 riviä 102:sta), koska `linkVisibility.ts` hoitaa eston. Silloin `linkHealth.ts` kertoo sen mitä sen pitäisi kertoa: mitkä HTTPS-linkit ovat rikki.

Vaikutus: käsin kerran tehty työ (`docs/http-https-tarkistus.csv`) muuttuu jatkuvaksi, ja linkkejä palautuu käyttäjille kun lehdet päivittävät sivustonsa.

### T6. Kriittisyysluokka ohjaa kynnystä (½ pv)

Kaikkia linkkejä käsitellään nyt samalla kynnyksellä, vaikka riski on hyvin erilainen. Lisää linkille kriittisyysluokka kategorian perusteella:

| Luokka | Esimerkit | Piilotuskynnys | Tarkistusväli | Varmennus |
| --- | --- | --- | --- | --- |
| Kriittinen | Hätänumerot, terveys, Kela, pankit, tunnistautuminen, poliisi, huijausvaroitukset | 40 (piilota herkästi) | 3 kk | Kahden silmän periaate |
| Tärkeä | Kunnat, hyvinvointialueet, joukkoliikenne, kirjastot | 50 | 6 kk | Yksi tarkistaja |
| Tavallinen | Lehdet, RSS, seurat, harrastukset, liikuntaryhmät | 65 (älä piilota yhdestä 500:sta) | 12 kk | Yksi tarkistaja |

Puhelinnumeropuolella vastaava luokittelu on jo olemassa (`critical`-kenttä). Käytä samaa periaatetta.

Vaikutus: kriittisissä linkeissä varovaisuus lisääntyy, tavallisissa kohina vähenee. Nykyinen yksi kynnys tekee molemmat väärin.

### T7. RDAP-signaali käyttöön tai pois (2 h)

Jos pidetään: pisteytä vain se, mitä siitä oikeasti saa irti — domain rekisteröity alle 90 vrk sitten (+30) ja RDAP-nimi on selvässä ristiriidassa odotetun organisaation kanssa (+20, vain raporttiin nostoa varten). Tallenna välimuisti levylle ajojen välillä, jotta 1 000+ kyselyä ei toisteta joka kerta.

Jos ei pidetä: poista haku ja säästä ajoaika. Nykyinen välitila on huonoin vaihtoehto.

### T8. Safe Browsing -tarkistus (2–3 pv, suunnitelma on jo valmiina)

`docs/codex-safe-browsing.md` sisältää valmiin toteutussuunnitelman. Tämä on **ainoa ehdotettu signaali, joka oikeasti tunnistaa phishing- ja haittasivuston** — kaikki muu tässä listassa mittaa toimivuutta ja johdonmukaisuutta, ei vihamielisyyttä.

Koska palvelun markkinointikärki on huijaukselta suojautuminen, tämän puuttuminen on suurin ristiriita lupauksen ja toteutuksen välillä. Ilmainen kiintiö (10 000 URL/vrk) riittää 2 099 linkille moninkertaisesti.

Huomioitava: kaapattu tai murrettu sivusto on Safe Browsingissa usein vasta viiveellä, joten tämä täydentää muita signaaleja eikä korvaa niitä.

### T9. Näytä käyttäjälle, että linkki on tilapäisesti pois (tuotepäätös + ½ pv)

Kun linkki piilotetaan, harkitse tyhjän tilan sijasta lyhyttä selitettä siinä kohdassa, jossa linkki olisi ollut: *"Tämän palvelun sivusto ei juuri nyt vastaa. Tarkistamme asian."* Erityisesti silloin, kun kunnan tai kategorian ainoa linkki katoaa.

Tämä on tuotepäätös, ei tekninen — mutta se muuttaa piilotuksen riskiprofiilia: väärä piilotus lakkaa olemasta näkymätön virhe, ja käyttäjä saa tiedon sen sijaan että jäisi ihmettelemään.

## 5. Ehdotukset automaatioon

### A1. Ajastettu GitHub Actions -ajo, joka avaa PR:n (½ pv)

Uusi workflow `link-health.yml`:

- Ajastus `cron`illa maanantaisin ja torstaisin noin klo 05:00 Suomen aikaa, sekä `workflow_dispatch` käsin käynnistystä varten.
- Ajaa `npm run links`.
- Jos generoidut tiedostot (`linkHealth.ts`, `linkStats.ts`, `localStats.ts`, `docs/linkit*.csv`, `docs/linkit.md`, `docs/puhelinnumerot.*`) muuttuivat, avaa PR otsikolla "Linkkitarkistus <pvm>" ja tiivistelmällä: uudet piilotukset, palautuneet linkit, uudet manuaalisen jonon rivit.
- **Ei suoraa pushia mainiin.** Ihminen katsoo diffin ja mergeaa. Tämä säilyttää ihmisen päätösvallan mutta poistaa muistamisen tarpeen.

Huom: CI:n IP-osoitteesta osa palvelimista käyttäytyy eri tavalla kuin Suomesta ajettaessa (geoblokkaus, WAF). T1:n peräkkäisyyssääntö suojaa tältä, mutta ensimmäisten ajojen tuloksia kannattaa verrata paikalliseen ajoon ennen kuin CI:hin luotetaan.

### A2. Joukkovirheen katkaisin (2 h)

Ennen kuin `linkHealth.ts` kirjoitetaan, vertaa edelliseen tilaan:

- Jos piilotettavien määrä kasvaa yli 30 linkillä **tai** yli 25 % yhdessä ajossa → älä kirjoita tiedostoja. Kirjoita sen sijaan `docs/linkit-epaluotettava-ajo.md` ja poistu virhekoodilla.
- Jos yli 20 % kaikista tarkistuksista epäonnistui verkkovirheeseen → sama.

Nämä tarkoittavat lähes aina ajajan verkkoa tai kohdepalvelun laajaa häiriötä, ei sitä että 300 linkkiä hajosi yhtä aikaa.

### A3. Tuoreusportti julkaisuun (1 h)

Lisää buildiin tarkistus: jos linkkitarkistuksen aikaleima on yli 14 vrk vanha, tulosta selkeä varoitus; yli 30 vrk → keskeytä tuotantobuild. Näin vanhentunut linkkiterveys ei pääse tuotantoon huomaamatta.

Aikaleima kannattaa viedä myös `linkStats.ts`:ään (`checkedAt`), jotta se on saatavilla sekä buildissa että ylläpitonäkymässä.

### A4. Kriittisten linkkien nopea ajo ilman buildia (1 pv)

Runtime-esto on jo olemassa: `blocked-links`-API + `addBlockedLink()` + `linkVisibility.ts`:n sync. Sitä käytetään nyt vain käsin.

Ehdotus: kevyt ajo (pelkkä HEAD, ei sisältötarkistusta, ei RDAP:ia) **vain kriittisen ja tärkeän luokan linkeille** (T6) esim. kerran vuorokaudessa. Jos linkki epäonnistuu kahdessa peräkkäisessä ajossa, kirjoitetaan esto suoraan `blocked-links`-kokoelmaan → **käyttäjä ei näe rikkinäistä hätä- tai Kela-linkkiä seuraavaan päivään, ei seuraavaan julkaisuun.**

Tämä on ainoa ehdotus, joka irrottaa linkkiterveyden julkaisusyklistä kokonaan. Se on myös eniten työtä vaativa, joten se sopii julkaisun jälkeiseen vaiheeseen.

### A5. Ylläpitonäkymän tarkistusjono (2–3 pv, suunnitelman vaihe 4)

Minimitoteutus: ylläpitosivulle välilehti, joka näyttää `docs/linkit-manuaalinen-tarkistus.csv`:n sisällön riskijärjestyksessä ja tarjoaa kolme toimintoa riville: **Varmenna**, **Piilota**, **Tee poikkeus (vaatii perustelun)**. Päätös kirjautuu tekijän ja päivämäärän kanssa.

Ilman tätä manuaalinen varmennus vaatii koodimuutoksen `verifiedLinks.ts`:ään, mikä käytännössä tarkoittaa, ettei sitä tehdä. Vasta tämä tekee luvusta 6 realistisen.

## 6. Prosessi ja vastuut

Automaatio ei ratkaise sitä, kuka katsoo tuloksen. Ehdotus:

| Mitä | Kuka | Milloin |
| --- | --- | --- |
| Ajastetun ajon PR:n läpikäynti | Ylläpitäjä | 2 × viikossa, ~15 min |
| Manuaalinen jono, kriittinen luokka | Ylläpitäjä + toinen silmä | Kuukausittain |
| Manuaalinen jono, muut | Ylläpitäjä | Kuukausittain, 20 riviä kerrallaan |
| Vanhentuvat varmennukset | Ylläpitäjä | Kuukausittain, raportista |
| Kela-taksinumerot | Ylläpitäjä | Viimeistään 1.12.2026 (muutos 1.1.2027) |
| Piilotettujen määrän kehitys | Ylläpitäjä | Kuukausittain, trendinä |

Kirjattavaksi kannattaa ottaa yksi mittari, joka kertoo prosessin toimivuudesta: **kuinka monta vuorokautta rikkinäinen linkki oli keskimäärin näkyvissä ennen piilotusta**. T1:n tilatiedosto tuottaa tämän luvun ilman lisätyötä.

## 7. Ehdotettu järjestys

**Ennen 9.9. julkaisua (noin 2 työpäivää):**

1. T2 — selainmainen tunniste ja pyyntökorjaukset (1–2 h)
2. T1 — peräkkäisyyssääntö + uudelleenyritykset (½ pv)
3. T4 — poikkeusten vanheneminen; käy läpi 1.9. erääntyvät kuusi poikkeusta (½ pv)
4. T3 — soft-404 + sisältösignaalin jako (1 pv)
5. Aja tarkistus uudelleen ja vertaa: montako nykyisestä 102 piilotuksesta ja 236 jonorivistä jää jäljelle

**Heti julkaisun jälkeen (noin 1 viikko):**

6. A1 — ajastettu GitHub Actions -ajo + PR (½ pv)
7. A2 — joukkovirheen katkaisin (2 h)
8. A3 — tuoreusportti (1 h)
9. T5 — HTTPS-päivityksen etsintä + `http://`-rivien poisto `linkHealth.ts`:stä (2–3 h)
10. T6 — kriittisyysluokat (½ pv)

**Syksyn aikana:**

11. T8 — Safe Browsing (2–3 pv)
12. A5 — ylläpitonäkymän tarkistusjono (2–3 pv)
13. A4 — kriittisten linkkien päivittäinen nopea ajo (1 pv)
14. T7 — RDAP käyttöön tai pois (2 h)
15. T9 — käyttäjälle näkyvä selite piilotetusta linkistä (tuotepäätös)

Päivitä lopuksi `docs/linkkien-turvallisuustarkistuksen-suunnitelma.md` vastaamaan toteutusta: sen kuvaus `http://`-linkkien tarkistuksesta ja pisteytyksestä on nykykoodiin nähden vanhentunut.
