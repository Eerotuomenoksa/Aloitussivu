# Codex: jatka tästä

Kirjattu 30.8.2026 klo 12.15. Eero lähtee purjehtimaan; tämä on ainoa tiedosto, joka sinun tarvitsee lukea päästäksesi kiinni.
Kaikki muutokset ovat **committoimatta**. Mitään ei ole pushattu.

---

## 0. Lue tämä ensin — kaksi asiaa jotka voivat yllättää

### 0.0 SSH- ja tuotantokomentojen pysyvä toimintatapa

**Älä käynnistä SSH-, SCP- tai salasanaa pyytävää komentoa Codexin omassa terminaalissa.** Eero ajaa kaikki tällaiset komennot itse omassa Windows PowerShell -ikkunassaan ja palvelimelle avatussa SSH-istunnossa.

Toimi jatkossa näin:

1. Codex rakentaa ja varmentaa tiedostot paikallisesti, mutta ei aloita SSH- tai SCP-yhteyttä.
2. Anna Eerolle erikseen otsikoidut, suoraan kopioitavat komennot: ensin **paikallinen Windows PowerShell**, sitten **palvelimen SSH-istunto**.
3. Älä pyydä tai vastaanota SSH-salasanaa keskustelussa. Eero syöttää sen itse PowerShellin piilotettuun kehotteeseen.
4. Käytä Cloudcityn SSH-isäntää `seniorsurffi.ssh.cchosting.fi`. Osoite `staging.aloitussivu.seniorsurf.fi` ei ole julkaisujen SSH-isäntä ja voi katkaista yhteyden.
5. Windowsin `scp`-komennossa siirry ensin tiedostojen hakemistoon ja käytä paikallisille tiedostoille suhteellisia polkuja. Näin aseman `C:`-kaksoispistettä ei tulkita etäosoitteen erottimeksi.
6. Odota, että Eero liittää komentojen tulosteen keskusteluun, ennen kuin päätät käyttöönoton onnistuneeksi tai annat seuraavan muuttavan komennon.

### 0.1 Saatoin ylikirjoittaa työtäsi tiedostossa `api/src/HttpLinkChecker.php`

Kirjoitin sen kokonaan uusiksi klo 11.06. Tiedostoa ei ole **koskaan committoitu** (`git status` näyttää `??`), joten vertailukohtaa ei ole. Perustin uudelleenkirjoituksen siihen versioon jonka luin aiemmin aamulla, ja säilytin kaikki SSRF-suojaukset sanatarkasti — mutta jos muokkasit tiedostoa klo 08.05–08.10 välillä (kuten teit `LinkCheckJob.php`:lle, `AdminApi.php`:lle ja `LinkCatalog.php`:lle), se muutos on mennyt.

**Tee ensimmäisenä:** lue `api/src/HttpLinkChecker.php` läpi ja tarkista puuttuuko siitä jotain, minkä lisäsit. Jos puuttuu, lisää se takaisin — nykyinen versio on toimiva pohja mutta ei välttämättä täydellinen.

### 0.2 `LinkCheckJob.php` on sinun, en koskenut siihen

Yritin muokata sitä, patch epäonnistui, ja se paljasti että olit ehtinyt lisätä `fairBatch()`-isäntäjaon ja try/catch-suojauksen. Lopetin siihen. **`api/src/LinkCheckJob.php` on täsmälleen siinä tilassa johon jätit sen.**

---

## 1. Mitä on tehty 30.8. — älä tee näitä uudelleen

Kaikki läpäisevät `npx tsc --noEmit -p tsconfig.json` ja `php -l`. Frontend-muutokset on buildattu ja Eero on testannut ne selaimessa.

### Datakorjaukset

| # | Tiedosto | Muutos |
| --- | --- | --- |
| 1 | `communityLinks.ts` | `www.eetu.fi` → `www.eetury.fi` (rivi 563), `www.pah.fi` → `suomen-pah.org` (rivi 242). **Vanhat ohjasivat verkkotunnuskauppaan** (sedo.com ja catcha.fi) |
| 2 | `seniorSurfGuidancePlaces.ts` (39 kpl), `localServices.ts` (3 kpl) | 42 osoitetta `http://` → `https://`. Katalogin http-osoitteet 59 → **17** |

### Frontend

| # | Tiedosto | Muutos |
| --- | --- | --- |
| 3 | `components/HomepageModal.tsx`, `i18n.tsx` | **HS-07**: tunnistettu selain aukeaa nyt oikeasti. `<details>`-elementeillä ei ollut `open`-attribuuttia lainkaan, vaikka teksti väitti "avattu valmiiksi". Ratkaisu on `useState<Set<BrowserId>>` + `useEffect` — **älä vaihda sitä muotoon `open={id === detectedBrowser}`**, React nollaisi sen joka uudelleenpiirrolla |
| 4 | `components/HomepageModal.tsx`, `i18n.tsx` | **HS-01**: sovellusten sisäisten selainten tunnistus (WhatsApp, Messenger, Facebook, Instagram + iOS-WebView) ja oma ohje "Avaa tämä sivu ensin selaimessa" |
| 5 | `components/OnboardingTour.tsx`, `App.tsx` | **HS-08**: kierroksen viimeinen vaihe "Ota sivu käyttöön" + "Aseta aloitussivuksi" / "Ehkä myöhemmin" |
| 6 | `components/WeatherCard.tsx`, `i18n.tsx` | **SK-01**: sääkortista linkki oman kunnan säähän (`ilmatieteenlaitos.fi/saa/<kunta>`). **Osoite vaatii kunnan suomenkielisen nimen**, lokalisoitu ei toimi |
| 7 | `linkit.tsx` | Puhelinnumeroiden laskenta 39 → 81 (Kela-taksit mukaan) |
| 8 | `linkit.tsx` | Kokonaisluku 5 199 → **1 825**: laskee eri verkko-osoitteet, ei rivejä. Alaotsikko "Eri verkko-osoitetta" |
| 9 | `linkit.tsx` | Haku siirtyy automaattisesti välilehdelle jolla on tuloksia. Syy: näkymä avautuu Alueelliset-välilehdelle, jossa "Koko Suomi" -linkit eivät näy lainkaan, joten haku "eetu" näytti tyhjää |
| 10 | `index.css` `@media print` | Tulosteen marginaalit: poistettiin `inset: 0` ja `min-height: 100%` jotka venyttivät arkin paperin reunaan |

### Työkalut ja testit

| # | Tiedosto | Mitä |
| --- | --- | --- |
| 11 | `scripts/link-check-benchmark.mjs` | **Uusi.** Mittaa koko katalogin, tuottaa `docs/linkit-mittaus-<pvm>.md`/`.csv`. Ei muuta sovelluksessa mitään. Tukee `--sample`, `--concurrency`, `--resume` |
| 12 | `scripts/link-fix-list.mjs` | **Uusi.** Muodostaa korjauslistan mittauksesta: `docs/linkit-korjattavat-<pvm>.md`/`.csv` |
| 13 | `scripts/link-catalog-test.mjs` | Kattavuusvahti: kaatuu jos repon juuren `.ts`-tiedostossa on yli 20 osoitetta eikä se ole `sourceFiles`-listalla. Testattu molempiin suuntiin |
| 14 | `docs/linkit-lisaosoitteet.json` | **Uusi.** Dokumentoi mitä jätetään tarkoituksella tarkistuksen ulkopuolelle (rajapinnat, mallipohjat) |

### API (LC-tehtävät)

| # | Tiedosto | Mitä |
| --- | --- | --- |
| 15 | `api/src/HttpLinkChecker.php` | **LC-04 + LC-07 kokonaan.** Ks. luku 0.1 |
| 16 | `api/src/LinkCheckResult.php` | Kaksi uutta **valinnaista** kenttää: `domainChanged`, `retryAfterSeconds`. Yhteensopiva nykyisen `LinkCheckJob`in kanssa |
| 17 | `api/src/Config.php` | `auto_block_enabled` (oletus **false**), `auto_block_max_per_run` (25), `auto_unblock_enabled` (true), `min_interval_hours` (72) |
| 18 | `database/migrations/006_link_check_hardening.sql` | **Uusi.** Sarakkeet `check_interval_hours`, `final_domain_changed`, `auto_blocked_at`, `blocked_count`, `unblocked_count` |

Kohdat 15–18 ovat **valmiita rakennuspalikoita LC-02:lle ja LC-03:lle** — asetukset ja sarakkeet ovat olemassa, mutta mikään ei vielä käytä niitä.

---

## 2. Mistä jatkaa — suositeltu järjestys

### Vaihe 1: tarkista mitä sait (15 min)

1. Lue `api/src/HttpLinkChecker.php` (luku 0.1).
2. Aja `npx tsc --noEmit -p tsconfig.json`, `npm run build`, `node scripts/link-catalog-test.mjs`, `php -l api/src/*.php`.
3. Aja `node scripts/link-check-benchmark.mjs` ja `node scripts/link-fix-list.mjs`. **"POISTA HETI" -rivejä pitäisi olla 0** (eetu ja pah on korjattu).

### Vaihe 2: LC-02, automaattinen piilotus — tärkein puuttuva asia

Tämä on koko putken kriittisin puute: **mikään ei kirjoita `blocked_links`-tauluun**, joten automaatio raportoi mutta ei piilota käyttäjältä mitään. Täysi määrittely on tiedostossa `docs/codex-tehtava-linkkitarkistuksen-viimeistely-2026-08-30.md` (LC-02). Tiivistettynä:

**Piilota kun kaikki pätevät:** `last_status = 'failed'` (**ei koskaan `warning` eikä `rejected`**), `failure_count >= alert_after_failures`, `error_code` on jokin varmoista (`http_status_error` 404/410, `dns_failed`, `tls_failed`, `too_many_redirects`, `domain_for_sale`), ei voimassa olevaa poikkeusta, ei jo estettynä.

**Palauta näkyviin kun:** `last_status = 'ok'` ja `failure_count = 0` **ja** `blocked_links.created_by IS NULL` (eli eston teki automaatti, ei ihminen). **Ihmisen tekemään estoon ei kosketa koskaan.**

Käytä `blocked_links`-taulua sellaisenaan. `url_hash` on **BINARY(32)**: `hash('sha256', $url, true)` — huomaa että `link_check_targets.url_hash` on CHAR(64) heksana, eri muoto. `reason`-kenttään koneluettava peruste, esim. `auto:http_status_error:404`. Asetukset ovat jo `Config.php`:ssä, laskurit migraatiossa 006.

**Pidä `auto_block_enabled` arvossa `false`** kunnes putki on ajanut tuotannossa yhden täyden kierroksen ja tulokset on katsottu. Aja siihen asti kuivana: kirjaa lokiin mitä olisi piilotettu.

### Vaihe 3: LC-09 joukkovirheen katkaisin

Ennen LC-02:n käyttöönottoa. Jos yli 60 % erästä kaatuu verkkovirheeseen (`dns_failed`, `connection_failed`, `timeout`, `request_failed`), merkitse ajo `skipped` koodilla `network_suspect` **äläkä kasvata yhdenkään kohteen `failure_count`-arvoa**. Vika on lähes aina omassa päässä. Helpoin toteutus: kerää erän tulokset muistiin ennen kuin kirjoitat mitään.

### Vaihe 4: LC-05 poikkeusrekisteri

`verifiedLinks.ts`:n `nextReviewAt` on kuollut kenttä, ja **kuusi poikkeusta erääntyi jo 1.9.2026**. Neljä niistä (kkv.fi, tamperefilharmonia.fi, korundi.fi, kotikokki.net) tarkistettiin 30.8. selaimella ja ne latautuivat normaalisti — ne olivat WAF-torjuntaa, ja LC-04:n jälkeen poikkeusta ei todennäköisesti tarvita lainkaan. **`marttila.fi` ei latautunut**: TLS-ketju ei validoidu, mikä viittaa puuttuvaan välivarmenteeseen. Tarkista `openssl s_client -connect marttila.fi:443 -showcerts` ennen kuin uusit sen poikkeuksen.

### Vaihe 5: loput LC-tehtävät

`docs/codex-tehtava-linkkitarkistuksen-viimeistely-2026-08-30.md` sisältää LC-01…LC-15 hyväksymiskriteereineen. LC-03 (mukautuva väli), LC-06 (soft-404), LC-08 (`http://`-jonon käsittely), LC-10 (ylläpitonäkymän toiminnot), LC-11 (vanhan Node-putken rajaus), LC-14 (syötteiden tuoreus), LC-15 (linkkiluvut).

### Vaihe 6: muut toimeksiannot

| Dokumentti | Tila |
| --- | --- |
| `codex-tehtava-aloitussivu-ja-asennus-2026-08-30.md` | HS-01, HS-07, HS-08 tehty. **HS-02** (Samsung Internet, UA Client Hints), **HS-03** (PWA-asennus — manifest ja service worker puuttuvat), **HS-04**, **HS-05**, **HS-06** avoinna |
| `codex-tehtava-kotikunta-ja-toinen-paikkakunta-2026-08-30.md` | **KK-01…KK-04 kaikki avoinna.** Eeron päätös 30.8.: esittelyn pitää kysyä kotikunta, Asetuksiin oma vaihto, toinen paikkakunta (mökki) vaihtokytkimellä |
| `codex-tehtava-saakortti-ja-linkkikorjaukset-2026-08-30.md` | SK-01 ja SK-02 tehty |
| `codex-tehtava-kolmannen-osapuolen-palvelut-2026-08-30.md` | **KO-01…KO-04 kaikki avoinna.** Tietosuojaseloste ei mainitse Nominatimia, rss2jsonia, allorigins-palvelua eikä Open-Meteoa, vaikka niille lähtee käyttäjän IP ja Nominatimille tarkat koordinaatit. **KO-01 (seloste) ennen laajaa tiedotusta** |

---

## 3. Mikä on testaamatta

- **HS-01 oikealla puhelimella.** Linkin avaaminen WhatsAppista tai Messengeristä on koko muutoksen peruste, eikä sitä ole testattu. `node node_modules/vite/bin/vite.js --host` antaa lähiverkko-osoitteen.
- **Kohdat 15–18 (`api/`) ajossa.** Vain `php -l` on ajettu. Migraatiota 006 ei ole ajettu missään tietokannassa.
- **Uudet `i18n`-avaimet uk-, et-, ru- ja se-kielillä.** `homepageInApp*`, `homepageBrowserUnknown` ja muutettu `homepageDetectedBrowser` ovat vain fi/sv/en. Muut kielet putoavat varatekstiin. `OnboardingTour`illa on oma käännöstaulukko joka tukee **vain kolmea kieltä** (`Record<'fi'|'sv'|'en', …>`), joten HS-08:n uusi vaihe näkyy muilla kielillä suomeksi.

---

## 4. Ympäristön kummallisuudet, jotka säästävät aikaa

- **PowerShellin suoritusrajoitus estää `npm run`.** Käytä `node node_modules/vite/bin/vite.js build` tai `npm.cmd run build`.
- **`npx tsc` toimii**, ja on nopein tapa verifioida: `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`.
- **Repossa on CRLF-ajautuma:** 232 tiedostoa näyttää muuttuneelta pelkän rivinvaihdon takia. Lue diffit `git diff --ignore-all-space`, muuten et näe mitä oikeasti muuttui.
- **Kehityspalvelin:** http://localhost:5173/. Alasivut tiedostonimellä, esim. `/linkit.html`.

---

## 4a. Huom tiedostojen koodauksesta

Tämä tiedosto tallentui kertaalleen **UTF-16-muotoon** Windows-editorissa (PowerShellin `Out-File` ja Notepadin "Unicode" tekevät niin). Se rikkoo UTF-8:aa odottavat työkalut ja tekee gitin diffistä lukukelvottoman. Se on palautettu UTF-8:ksi. **Tallenna markdown aina UTF-8-muodossa**; PowerShellissä `Out-File -Encoding utf8`.

---

## 4b. Kokonaiskuva ja dokumenttien tila

`docs/repon-tiedostokartta.md` kuvaa mistä järjestelmä koostuu ja mitkä dokumentit ovat vanhentuneita. **Keskeinen havainto: `nykyarkkitehtuuri-asiantuntijakuvaus-2026-06-14.md` mainitsee Firestoren 64 kertaa ja MariaDB:n nolla kertaa** — se kuvaa järjestelmää joka vaihtui elokuussa. Jos joku pyytää arkkitehtuurikuvausta, älä anna sitä tiedostoa.

---

## 5. Avoimet päätökset Eerolle — älä ratkaise näitä yksin

1. **`auto_block_enabled` päälle?** Vaatii yhden täyden kuivan kierroksen ja tulosten läpikäynnin.
2. **39 kuollutta yhdistysverkkotunnusta** (`communityLinks.ts`). Älä poista suoraan: `eetu.fi` ja `pah.fi` osoittautuivat pelkiksi osoitteenvaihdoiksi, joten jokaisesta on tarkistettava onko yhdistyksellä uusi osoite.
3. ~~**Kysytäänkö kotikunta esittelyssä pakolla vai ohitettavana?**~~ **RATKAISTU 30.8.2026: "Eero vahvistaa että voidaan ohittaa."** Toteuta KK-01 siis ohitettavana: "Ohita"-painike yhtä näkyvänä kuin valinta.
4. ~~**Rajapintavalvonta.**~~ **RATKAISTU 30.8.2026:** Eero päätti että kaikki kolme tasoa toteutetaan — seloste, RSS-haun siirto palvelimelle ja Nominatimin korvaaminen. Määrittely `docs/codex-tehtava-kolmannen-osapuolen-palvelut-2026-08-30.md`. Avoimeksi jää vain se, ehtiikö KO-01 ennen tiedotusta; sen pitäisi ehtiä, se on pieni työ.

---

## 6. Tarkistus 30.8.2026 klo 16.45 — kaksi P1-havaintoa ennen cronin kytkemistä

Kävin läpi valmiiksi ilmoittamasi linkkitarkistuskokonaisuuden. Työ on hyvätasoista: SSRF-suojaukset ovat ehjät, autoblockin rajaus säästää oikeat tapaukset, migraation 006 sarakkeet vastaavat jokaista kyselyä, ja kaikki 39 kuollutta yhdistysdomainia ovat poissa `communityLinks.ts`-tiedostosta (tarkistin säännöllisellä lausekkeella). `tsc --noEmit` antaa exit 0 myös omalla ajollani.

Kaksi asiaa on korjattava ennen kuin `link_checks.enabled` käännetään tuotannossa päälle:

1. **`dns_failed` palautuu tilassa `rejected`, ei `failed`** (`HttpLinkChecker.php` rivit 138 ja 148, sekä rivi 43). Tämä tekee tyhjäksi sekä kiintopisteen että joukkokatkaisimen, ja `nextCheck()` siirtää jokaisen nimipalveluhäiriön aikana tarkistetun linkin pysyvästi arvoon `9999-12-31`. Yksi huono ajo voi hiljaisesti lopettaa koko katalogin seurannan.
2. **`isSuspectBatch()` voi jumittaa ajon**, kun kohta 1 on korjattu ja erä täyttyy aidosti kuolleista verkkotunnuksista. Korjaa nämä kaksi yhdessä.

Lisäksi P2: automaattinen palautus (`autoUnblock`) on eston lippukatkaisijan sisällä, joten palautusohjeen neuvo sulkea `auto_block_enabled` jättäisi jo piilotetut linkit piiloon pysyvästi.

Täydet perustelut, korjausehdotukset koodina, P3-havainnot ja lista siitä mikä on tarkistettu kunnossa olevaksi: **`docs/codex-tarkistus-linkkitarkistus-2026-08-30.md`**.

Migraatiot 005–006 voi ajaa ennen näitä korjauksia. Huomaa vain, että 006:n `ALTER TABLE` -lauseet eivät peruunnu `COMMIT`-lauseella, joten aja ne erikseen ja tarkista `SHOW COLUMNS` ensin.

**Codexin jatkotila 30.8.2026:** kaikki yllä kuvatut P1/P2-kohdat on korjattu ja testattu. DNS-virhe on `failed`, eräkatkaisin laskee vain uudet verkkovirheet, `autoUnblock` on riippumaton autoblockista ja migraatiot 005–006 ovat idempotentteja. Paketti `REL-14-v0.77.0-49cf755312e2` (SHA-256 `cfafa2e3a0f61102e2f5055e2f1bbc3276ec1453a10164d4aea10bc6dd41d680`) aktivoitiin tuotantoon onnistuneesti. Migraatiot, PHP-lint 59/59, health ja ensimmäinen linkkiajo ovat PASS. Cloudcityn PHP-skriptiajo `aloitus-production/cron/link-check.php` on aktiivinen aikataululla `7 * * * *`; käyttöönottotesti tarkisti kaksi kohdetta tuloksin yksi onnistuminen ja yksi hallittu varoitus, eikä virheitä, hylkäyksiä tai estoja syntynyt. REL-14:n käyttöönotto on valmis.

---

## 7. Linkkidatan loppukierros 31.8.2026

Tiedoston `docs/linkit-korjauslistan-tilanne-2026-08-30.md` 5 DNS-virhettä ja 58 kovaa 404:ää on käsitelty loppuun. Alkuperäisistä 63 osoitteesta 60 on korvattu tai poistettu lähdetiedostostaan. Länsi-Uusimaan etusivu sekä Vimpelin etusivu ja RSS jätettiin ennalleen, koska kaikki vastaavat jälleen HTTP 200:lla; Vimpelin syöte on `application/rss+xml`.

Viimeisellä kierroksella Rantasalmen englanninkielinen sivu korvattiin, Uudenkaupungin rikkinäinen footnote-osoite siivottiin ja päättyneet tai vahvistamattomat Välkkeen sekä Tuulensuun digiopastuspaikat poistettiin listalta. Kiuruveden PALI-sisältö vahvistettiin virallisesta WordPress-rajapinnasta, ja Vöyrin kirjastolle löydettiin virallinen suomenkielinen sivu. Korvaaja- ja näyttöosoitteiden verkkotarkistus oli lopulta 56/56 tavoitettavissa; Vöyrin myöhemmin löydetty suomenkielinen vastine vastasi lisäksi HTTP 200. Linkkikatalogi-, URL-käytäntö-, TypeScript-, salaisuus- ja tuotantobuild-testit ovat PASS.

Täysi raportti: `docs/linkit-63-kohteen-loppuraportti-2026-08-31.md`. Muutokset ovat paikallisessa työpuussa, eikä tätä loppukierrosta ole vielä julkaistu tuotantoon.

---

## 8. Markkinointilinkkien kanavat tuotannossa 31.8.2026

`?src=` tarkoittaa nyt yksinomaan markkinointikanavaa. Selain ja palvelin tuntevat samassa järjestyksessä arvot `opastus`, `kirje`, `some`, `esite`, `lehti`, `esittely`, `vtkl`, `juttunetti`, `tyopaikka`, `pankki`, `kirjasto` ja `koulu`. Palvelin hyväksyy lisäksi selaimen tuntemattomille arvoille käyttämän `other`-varmistusarvon. `qr` poistettiin kanavalistalta, koska QR on linkin esitysmuoto eikä kanava.

Versio 0.77.9 aktivoitiin tuotantoon 31.8.2026 klo 13.40 Suomen aikaa. Aktiivinen build on `REL-14-v0.77.9-af8a4b0f0b31` ja paketin SHA-256 `7b242f30586978e869cf94e33f574724b5d9ab7b343d81b56f13694c677648b9`. Asennin palautti `CAMPAIGN_SOURCES_STATUS=PASS`, PHP-lint 59/59 ja `DATABASE_CHANGED=false`. Käyttöönoton linkkiajo tarkisti 10 kohdetta tuloksella 10 onnistunutta ja 0 varoitusta tai virhettä. Uutta tietokantamigraatiota ei tarvittu.

Selaintesti varmisti ennen paketointia kaksi polkua: `?src=juttunetti` poistui osoiteriviltä ja pageview lähetti arvon `juttunetti`; tuntematon `?src=facebook-kampanja-3` poistui samoin ja lähetti arvon `other`. Tehtävän yksityiskohdat ovat tiedostossa `docs/codex-tehtava-markkinointilinkit-src-2026-08-31.md`.
