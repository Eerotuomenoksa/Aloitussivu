# Tarkistus: automaattinen linkkitarkistus (LC-02 ja ympäröivä putki)

Tarkistaja: Claude. Päivä: 30.8.2026. Kohde: Codexin ilmoittama valmis kokonaisuus ennen migraatiota 005-006.

Lue tämä ennen kuin `link_checks.enabled` käännetään tuotannossa arvoon `true`.

## Codexin jatkotarkistus 30.8.2026

**Tila: P1-1, P1-2, P2-1 ja P2-2 on korjattu, testattu ja aktivoitu tuotantoon. Cloudcityn tuntiajo on aktiivinen ja käyttöönottotesti on PASS.**

- `HttpLinkChecker` palauttaa `dns_failed`-tuloksen nyt tilassa `failed`; pysyvät osoitekäytäntövirheet säilyvät tilassa `rejected`.
- Ehdokaskysely lukee aiemman `last_status`-arvon ja joukkokatkaisin laskee vain uudet verkkovirheet. Jo tunnettu rikkinäisten verkkotunnusten joukko ei siten lukitse seuraavia tuntiajoja.
- `autoUnblock()` käyttää omaa `auto_unblock_enabled`-lippuaan riippumatta siitä, luodaanko uusia automaattisia estoja.
- Migraatiot 005–006 ovat uusinta-ajettavia: taulut luodaan `IF NOT EXISTS` -ehdolla, 006:n sarakkeet `ADD COLUMN IF NOT EXISTS` -ehdolla ja migraatiomerkinnät `INSERT IGNORE` -lauseella. MariaDB:n DDL:n implisiittinen commit on huomioitu asentimessa ajamalla molemmat migraatiot aina ja tarkistamalla taulut sekä sarakkeet erikseen.

Regressiotestit kattavat puuttuvan `.invalid`-DNS-nimen, aidon uuden 4/5-verkkohäiriön, jo ennestään `failed`-tilassa olevan 4/5-joukon sekä automaattisen palautuksen `auto_block_enabled=false` -tilassa. Varmennukset: API-testit 61/61, PHP-lint 62/62 lähdepuussa ja 59/59 paketissa, TypeScript, Cloudcity-build, linkkikatalogi 2 386 linkkiä, URL-käytäntötesti ja salaisuustarkistus PASS.

Korjattu julkaisucommit on `49cf755312e2caf4716a0b1fa685a237d8c8c29c`. Ehdokas `REL-14-v0.77.0-49cf755312e2`, SHA-256 `cfafa2e3a0f61102e2f5055e2f1bbc3276ec1453a10164d4aea10bc6dd41d680`, aktivoitiin tuotantoon 30.8.2026 klo 20.06 Suomen aikaa. Migraatiot 005–006, paketin PHP-lint 59/59, linkkiasetus, API-health ja ensimmäinen linkkiajo olivat PASS. Cloudcityn PHP-skriptiajo `aloitus-production/cron/link-check.php` tallennettiin aktiiviseksi aikataululla `7 * * * *`. Ajastuksen käyttöönottotesti valmistui klo 20.12: katalogi 2 386, hyväksytyt 1, tarkistetut 2, onnistuneet 1, varoitukset 1 sekä virheet, hylkäykset, estot ja palautukset 0. Hallittu varoitus ei kasvattanut virhe- tai estolaskureita.

## Yhteenveto

Toteutus on hyvätasoinen. SSRF-suojaukset ovat ehjät, autoblockin rajaus on oikea, migraation sarakkeet vastaavat kyselyitä, ja 39 kuollutta yhdistysdomainia on korjattu ilman yhtään piilotusta. Ajoin `tsc --noEmit` itse: exit 0.

Löysin kuitenkin yhden P1-luokan virheen, joka tekee tyhjäksi juuri sen suojauksen, jonka tuotantoonvientiohje lupaa. Se on korjattava ennen ensimmäistä cron-ajoa. Migraation voi ajaa ilman tätä korjausta.

## P1-1 · DNS-virhe luokitellaan `rejected`, ei `failed`

**Missä:** `api/src/HttpLinkChecker.php` rivit 138 ja 148 palauttavat `['error' => 'dns_failed']`, ja rivi 43 kääntää kaikki `validateTarget`-virheet tilaksi `rejected`.

**Miksi tämä on vakava.** Kolme seurausta ketjuuntuu:

1. **Kiintopiste ei suojaa.** `LinkCheckJob::run()` tarkistaa `https://www.suomi.fi/` ennen erää. Jos palvelimen nimipalvelu on poikki, tarkistus palauttaa tilan `rejected`. `isNetworkFailure()` vaatii tilan `failed`, joten se palauttaa `false` ja ajo jatkuu normaalisti.
2. **Joukkokatkaisin ei suojaa.** `isSuspectBatch()` laskee samalla ehdolla, joten sekään ei kertyisi yhtään osumaa.
3. **Kohteet poistuvat seurannasta pysyvästi.** `nextCheck()` antaa tilalle `rejected` arvon `9999-12-31`. Yksi nimipalveluhäiriö yhden cron-ajon aikana siirtää jokaisen sen aikana tarkistetun linkin ikuisesti pois tarkistusjonosta. `syncCatalog()`-lauseen `ON DUPLICATE KEY UPDATE` ei nollaa `next_check_at`-saraketta, eikä ylläpitonäkymässä ole nollausta. Ainoa palautuskeino on käsin ajettu SQL.

Lisäksi `autoBlock()`-kyselyn ehto `t.last_error_code IN ('dns_failed', ...)` yhdessä ehdon `t.last_status = 'failed'` kanssa on kuollutta koodia: `dns_failed` ei koskaan saavu tilassa `failed`.

Tuotantoonvientiohje `docs/rel14-v0770-automaattinen-linkkitarkistus.md` lupaa: *"Palvelimen oma verkkohäiriö ei kasvata kohteiden vikalaskureita eikä aiheuta estoja."* Tämä lupaus ei tällaisenaan pidä.

**Korjaus.** `dns_failed` on ohimenevä, muut `validateTarget`-virheet ovat pysyviä käytäntöpäätöksiä. Erota ne:

```php
if ($validation['error'] !== null) {
    // dns_failed on ohimenevä häiriö, muut validointivirheet ovat pysyviä.
    $transient = $validation['error'] === 'dns_failed';
    return $this->result(
        $transient ? 'failed' : 'rejected',
        null,
        $current,
        $validation['error'],
        $started,
        $original,
    );
}
```

Tämä yksi muutos palauttaa kiintopisteen, palauttaa joukkokatkaisimen, estää pysyvän poistuman ja herättää `autoBlock`-saannon `dns_failed`-haaran. **Se on kuitenkin tehtävä yhdessä havainnon P1-2 kanssa**, muuten katkaisin alkaa laueta väärin.

## P1-2 · Joukkokatkaisin voi jumittaa ajon pysyvästi

**Missä:** `LinkCheckJob::isSuspectBatch()` rivit 395-406 ja ehdokaskyselyn järjestys rivillä 74.

Ehdokkaat järjestetään niin, että `failed`-tilaiset tulevat ensin. Erän koko on 10 ja samalta isännältä otetaan enintään 3. Kun P1-1 on korjattu, joukko aidosti kuolleita verkkotunnuksia tuottaa koodin `dns_failed` tilassa `failed`. Jos näistä kertyy 7 kymmenestä, jokainen ajo merkitaan tilaan `network_suspect`, mitään ei tallenneta, eikä mikään poistu jonosta — ja seuraava tunti nostaa samat kymmenen uudelleen. Ajo lakkaa etenemästä hiljaisesti.

Juuri nyt riski on latentti, koska 39 kuollutta domainia on korjattu. Se palaa heti kun seuraava joukko yhdistyksiä lopettaa.

**Korjaus.** Laske katkaisimeen vain **uudet** verkkovirheet, eli kohteet joiden aiempi `last_status` ei ollut jo `failed`. Ota `last_status` mukaan ehdokaskyselyn sarakkeisiin ja suodata sen mukaan. Kiintopiste hoitaa aidon katkoksen tunnistuksen erikseen — se on nyt oikea suojaus, kun P1-1 on korjattu.

## P2-1 · Automaattinen palautus kuolee samalla katkaisijalla kuin esto

**Missä:** `LinkCheckJob.php` rivit 125-130. `autoUnblock()` on `if ($this->config->linkCheckAutoBlockEnabled)` -lohkon sisällä.

Tuotantoonvientiohjeen palautusosio neuvoo nimenomaan asettamaan `auto_block_enabled` arvoon `false`. Silloin myös palautus lakkaa, ja automaatin jo piilottamat linkit jäävät piiloon pysyvästi, vaikka ne korjaantuisivat.

**Korjaus.** Kaksi vaihtoehtoa, molemmat kelpaavat:
- Siirrä `autoUnblock()` omaan `if ($this->config->linkCheckAutoUnblockEnabled)` -lohkoonsa esto-lohkon ulkopuolelle, tai
- lisää palautusohjeeseen pakollinen askel: `DELETE FROM blocked_links WHERE created_by IS NULL AND reason LIKE 'auto:%';`

Ensimmäinen on parempi.

## P2-2 · Migraatio 006 ei ole atominen eikä toistettava

MariaDB tekee DDL-lauseille implisiittisen commitin, joten tiedoston `START TRANSACTION` / `COMMIT` ei anna peruutusta. Jos `ALTER TABLE link_check_targets` onnistuu ja `ALTER TABLE link_check_runs` kaatuu, sarakkeet jäävät paikalleen ilman `schema_migrations`-riviä, ja uusinta kaatuu virheeseen "Duplicate column name".

Sama koskee migraatiota 005, jos se on jo ajettu: `INSERT INTO schema_migrations` kaatuu perusavaimeen.

**Ennen ajoa tarkista:**

```sql
SELECT version FROM schema_migrations WHERE version IN ('005_automated_link_checks','006_link_check_hardening');
SHOW COLUMNS FROM link_check_targets LIKE 'check_interval_hours';
SHOW COLUMNS FROM link_check_runs LIKE 'blocked_count';
```

Aja kumpikin `ALTER TABLE` erikseen ja lisää `schema_migrations`-rivi vasta kun molemmat ovat läpi.

## P3 · Pienemmät havainnot

1. **Ensimmäisen kierroksen kesto.** Katalogi on 2 386 linkkiä, uudet kohteet hajautetaan 72 tunnille, mutta erä 10 tunnissa antaa 240 tarkistusta vuorokaudessa. Ensimmäinen täysi kierros kestää noin 10 vuorokautta. Vakiokuormassa (2 386 / 30 vrk = noin 80 vrk:ssa) vara on kolminkertainen, joten tämä on vain siirtymävaihe — mutta jos halutaan nopeampi ensimmäinen kuva, nosta `batch_size` arvoon 25 ensimmäiseksi viikoksi ja palauta se sitten.
2. **Aikabudjetin laskutoimitus.** `HttpLinkChecker::TOTAL_BUDGET_SECONDS` on 15 ja erä on 10, eli pahimmillaan 150 sekuntia. `LinkCheckJob::RUN_BUDGET_SECONDS` on 120. Huonossa ajossa vain noin 8 kohdetta tarkistetaan ja ajo saa koodin `time_budget_reached`. Tämä on hallittu katkaisu, ei virhe, mutta ohjeen "enintään kymmenen vuorossa olevaa linkkiä tunnissa" on optimistinen.
3. **Varoitus nollaa vikalaskurin.** `LinkCheckJob.php` rivit 87-89: `failure_count` nollataan aina kun tila ei ole `failed`. Linkki joka vuorottelee tilojen `failed` ja `warning` välillä — tyypillinen WAF-käyttäytyminen — ei saavuta koskaan hälytysrajaa 2. Harkitse ettei `warning` nollaa laskuria, vaan jättää sen ennalleen.
4. **`domain_for_sale` on ainoa sisältöperustainen autoblock-sääntö.** Se on juuri se sääntö joka olisi napannut eetu.fi:n ja pah.fi:n, joten se kuuluu listalle. Mutta se on heuristiikka, ja väärä positiivinen piilottaa toimivan linkin hiljaisesti. Syy tallentuu muodossa `auto:domain_for_sale`, mikä riittää — käy ensimmäisen kuukauden estot läpi käsin.
5. **Julkaisupäiväkirjaan ei ole kirjattu LC-02:n ja LC-04:n ennen/jälkeen-lukuja**, vaikka tehtävämäärittely edellyttää niitä: montako linkkiä tilassa `failed`, montako `warning`, montako olisi piilotettu. Ilman näitä emme tiedä paransiko muutos tarkkuutta vai siirsikö se virheet toiseen luokkaan. Lisää luvut ensimmäisen tuotantoajon jälkeen. `REL-14` on päiväkirjan tilannekuvassa yhä "odottaa".

## Mikä on tarkistettu ja kunnossa

- **SSRF-suojaukset ehjät:** vain `https`, vain portti 443, DNS-selvitys ennen pyyntöä, yksityisten ja varattujen osoitteiden torjunta, `CURLOPT_RESOLVE`-kiinnitys, uudelleenohjauksen uudelleenvalidointi.
- **LC-04 ja LC-07 -muutokset säilyivät:** selainmainen tunniste, HEAD–GET-uusinta, Range 416/417 -varasuunnitelma, `server_error` erotettu, `Retry-After` talteen, `FOR_SALE`-tunnistus, `domainChanged`.
- **Autoblockin rajaus on oikea.** Varoitukset (401/403/405/417/429 → `access_limited`) ja 5xx (`server_error`) eivät ole listalla. Ylläpitäjän tekemiin estoihin ei kosketa: molemmissa poluissa on `created_by IS NULL AND reason LIKE 'auto:%'`. `INSERT IGNORE` yhdessä `uq_blocked_links_url_hash`-avaimen kanssa estää kaksoiskappaleet. Liitos `b.url_hash = UNHEX(t.url_hash)` vastaa saraketta `BINARY(32)`, ja lisäys käyttää binaarimuotoa `hash('sha256', $url, true)`.
- **Migraation 006 sarakkeet vastaavat jokaista kyselyä** tiedostoissa `LinkCheckJob.php` ja `AdminApi.php`.
- **Mukautuva väli vastaa dokumentaatiota:** onnistuminen kertoo 1,5:llä `refresh_days`-kattoon, muu palauttaa arvoon `min_interval_hours`. Uusinnat 6, 24, 72 ja 168 tuntia.
- **Ylläpitonäkymässä on erillinen verkkotunnusjono** (`domainChangedItems`) ja `rejected`-lista, joten P1-1:n aiheuttama massapoistuma näkyisi — mutta vain jos joku katsoo.
- **Kaikki 39 vanhaa verkkotunnusta ovat poissa** tiedostosta `communityLinks.ts`. Tarkistin säännöllisellä lausekkeella: nolla osumaa.
- **Kotikuntavaihe** on esittelykierroksessa yhtä näkyvällä ohitusvaihtoehdolla, kolmella kielellä, ja `finish`-painike on piilotettu oikein.
- **`tsc --noEmit` exit 0** omalla ajollani.

## Suositeltu järjestys

1. Aja migraatiot 005–006 varovasti (P2-2). Tämä voi tapahtua nyt.
2. Korjaa P1-1 ja P1-2 yhdessä. Lisaa testi jossa `dns_failed` tulee validoinnista ja varmista että tila on `failed` ja että kiintopisteen kaatuminen keskeyttää ajon.
3. Korjaa P2-1.
4. Käännä `link_checks.enabled` arvoon `true` mutta `auto_block_enabled` arvoon `false`. Anna pyöriä vuorokausi ja katso luvut.
5. Kirjaa ennen/jälkeen-luvut julkaisupäiväkirjaan (P3-5).
6. Vasta sitten `auto_block_enabled: true`.
