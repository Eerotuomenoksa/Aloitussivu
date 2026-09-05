# Aloitussivun PHP-API

Tämä hakemisto sisältää WordPressistä riippumattoman PHP 8.4 -API:n perustan. Selain käyttää myöhemmin saman originin reittejä polussa `/api/v1/`. Julkinen web-palvelin näkee vain `public/api`-hakemiston; sovelluskoodi, asetukset ja lokit pidetään web-juuren ulkopuolella.

## Rakenne

```text
api/
  bootstrap.php              PSR-4-autoload ilman Composer-riippuvuutta
  src/                       reititys, HTTP, PDO, validointi ja suojaus
  cron/ncsc.php              vain CLI:stä ajettava NCSC-tausta-ajo
  cron/notifications.php     ylläpitokoosteen ja raporttien muodostus jonoon
  cron/email-dispatch.php    SMTP-lähetys ja hallitut uudelleenyritykset
  cron/smtp-test.php         manuaalinen SMTP-yhteyden testiviesti
  public/api/index.php       ainoa julkinen PHP-entrypoint
  public/api/.htaccess       Apache-reititys /api/* -> index.php
  public/router.php          PHP:n paikallisen palvelimen reititin
  config.example.php         salaisuuksia sisältämätön mallipohja
  tests/run.php              riippuvuudettomat sopimustestit
```

API ei lataa WordPressin bootstrappia, evästeitä tai tietokantaa. PDO käyttää oikeita valmisteltuja kyselyjä (`ATTR_EMULATE_PREPARES=false` MySQLissä) ja asettaa jokaisen MySQL-yhteyden UTC-aikaan.

## Paikallinen kehitys

Älä käytä paikallisessa kehityksessä tuotantotietokantaa tai tuotannon tunnuksia.

1. Asenna PHP 8.4 ja ota testejä varten `pdo_sqlite` käyttöön.
2. Kopioi `api/config.example.php` tiedostoksi `api/secrets/config.php`. `api/secrets/` ja `api/logs/` ovat Gitistä ohitettuja.
3. Käytä paikallista MariaDB-tietokantaa tai vaihda paikallisen asetuksen DSN arvoon `sqlite:C:/absoluuttinen/polku/test.sqlite`.
4. Käynnistä palvelin repositorion juuresta:

```powershell
php -S 127.0.0.1:8088 -t api/public api/public/router.php
```

5. Tarkista health:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8088/api/v1/health
```

Puuttuva tai web-juuren sisällä oleva asetustiedosto palauttaa hallitun `configuration_error`-vastauksen. Tarkkaa tiedostopolkua, PDO-virhettä tai tunnuksia ei palauteta asiakkaalle.

## Cloudcity-sijoittelu

Stagingissä ja tuotannossa ympäristökohtainen juuri on `public_html`-hakemiston ylähakemisto. Sijoittelu tehdään näin:

```text
ympäristöjuuri/
  bootstrap.php
  src/
  secrets/config.php         640, ei Gitissä
  logs/api.log               640, päivittäinen kierto, 30 vrk
  cache/firebase-public-keys.json  640, Googlen julkiset varmenteet
  protected_uploads/         750, ei web-juuressa
  public_html/
    api/
      index.php
      .htaccess
```

Kopioi siis `api/bootstrap.php` ja `api/src/` ympäristöjuureen sekä `api/public/api/` hakemistoon `public_html/api/`. Entry point löytää oletuksena ympäristöjuuren ja `secrets/config.php`-tiedoston. Poikkeava sijainti voidaan määrittää palvelinympäristön muuttujilla `ALOITUSSIVU_API_ROOT` ja `ALOITUSSIVU_API_CONFIG`. Cron-ajoille julkinen juuri voidaan tarvittaessa ilmoittaa muuttujalla `ALOITUSSIVU_PUBLIC_ROOT`; tuotannon vakiosijoittelu tunnistetaan myös automaattisesti.

Staging- ja tuotantoasetuksissa vaaditaan HTTPS-origin, `mysql:`-DSN, tietokannan salasana ja vähintään 32-merkkinen satunnainen rate limit -salaisuus. `trust_proxy` pidetään `false`-arvossa, ellei Cloudcityn tunnetun välityspalvelimen käyttöä ole erikseen varmennettu.

Sähköposti-ilmoitukset ovat oletuksena pois käytöstä. Kun `notifications.enabled` asetetaan arvoon `true`, asetuksessa vaaditaan vastaanottaja, lähettäjän osoite ja nimi sekä STARTTLS-suojatun SMTP-yhteyden palvelin, portti, käyttäjätunnus ja salasana. Salasana kuuluu vain web-juuren ulkopuoliseen `secrets/config.php`-tiedostoon; sitä ei välitetä cron-komennossa eikä tallenneta tietokantaan tai lokiin.

Ylläpidon tunnistus vaatii lisäksi Firebase-projektin julkisen projektitunnisteen ja web-juuren ulkopuolisen välimuistitiedoston Googlen julkisille allekirjoitusvarmenteille. PHP:n OpenSSL-laajennuksen ja ulospäin toimivan HTTPS-yhteyden pitää olla käytettävissä.

## REL-03-sopimus

`GET /api/v1/health` palauttaa onnistumisessa HTTP 200:

```json
{
  "data": {
    "status": "ok",
    "database": "up",
    "version": "v1",
    "time": "2026-08-20T07:00:00+00:00"
  },
  "requestId": "0123456789abcdef0123456789abcdef"
}
```

Tietokantavirhe palauttaa HTTP 503 ja turvallisen virheen, jonka `details.database` on `down`. Muut virheet käyttävät samaa muotoa:

```json
{
  "error": {
    "code": "not_found",
    "message": "Reittiä ei löytynyt.",
    "requestId": "0123456789abcdef0123456789abcdef"
  }
}
```

Jokainen vastaus sisältää `X-Request-ID`-otsakkeen. Asiakkaan antama tunniste hyväksytään vain rajatussa muodossa; muut arvot korvataan satunnaisella tunnisteella. Loki sisältää vain ajan, request ID:n, metodin, polun, statuskoodin, keston ja virhekoodin. Pyyntörunkoa, lomaketekstiä, evästeitä, tunnuksia tai raakaa IP-osoitetta ei lokiteta.

CORS sallii vain asetukseen merkityn täsmällisen originin. Ilman `Origin`-otsaketta tulevat saman originin ja palvelinasiakkaiden pyynnöt hyväksytään. Tuotanto ja staging vaativat HTTPS:n. Pyyntörungon oletusraja on 768 KiB ja sallittu konfigurointiväli 1 KiB–1 MiB.

## REL-04: julkiset tietovirrat

Kaikki kirjoitusreitit hyväksyvät vain `application/json`-pyyntöjä ja vain sopimuksessa nimetyt kentät. Lomakepyyntöjen `id` on asiakkaan luoma UUID, jota käytetään turvalliseen uudelleenlähetykseen. Ensimmäinen tallennus palauttaa 201 ja saman tunnisteen sekä saman sisällön uusinta 200 sekä `duplicate: true`. Sama tunniste eri sisällöllä palauttaa 409/`idempotency_conflict`.

Kaikkien kirjoituspyyntöjen valinnainen `website`-kenttä on honeypot ja sen pitää olla tyhjä. Palautetta, testipalautetta, linkki-ilmoituksia tai käyttötilastoja ei voi lukea julkisesta API:sta; `GET` näihin reitteihin palauttaa 405.

### Julkiset listat

| Reitti | Julkiset kentät |
| --- | --- |
| `GET /api/v1/site-content` | ylläpidossa julkaistut sisältöavaimet, kieli, teksti ja päivitysaika; ylläpitäjän tunnistetta ei palauteta |
| `GET /api/v1/approved-links` | `id`, `name`, `url`, `category`, `source`, `createdAt`, valinnaiset `municipality` ja `note` |
| `GET /api/v1/blocked-links` | `id`, `url`, `createdAt`; syy ja ylläpitäjä eivät ole julkisia |
| `GET /api/v1/scam-alerts` | vain aktiiviset ja vanhenemattomat varoitukset; julkinen sisältö ja lähdetiedot |
| `GET /api/v1/feedback` | palautteen teksti, tila ja julkinen käsittelymerkintä; selain- ja laitetiedot, ylläpitäjän tunniste sekä kuvakaappaus eivät ole julkisia |
| `GET /api/v1/link-reports` | linkkiehdotuksen tai -ilmoituksen perustiedot, tila ja julkinen käsittelyperuste; ilmoittajan lähde, lisätieto ja ylläpitäjän tunniste eivät ole julkisia |

Listavastaus on `{"data": [...], "requestId": "..."}`. Listoilla on 60 sekunnin selainvälimuisti ja `ETag`; vastaava `If-None-Match` palauttaa 304.

```powershell
Invoke-WebRequest -UseBasicParsing https://staging.aloitussivu.seniorsurf.fi/api/v1/approved-links
```

### Linkki-ilmoitus

`POST /api/v1/link-reports` vaatii tyypin `new`, `broken` tai `wrong`, 1–160 merkin nimen, enintään 500 merkin HTTPS-osoitteen ja enintään 1000 merkin huomion. `category` ja `source` ovat valinnaisia, enintään 255 merkkiä. Saman tyypin ja normalisoidun URL:n avoin ilmoitus palautetaan duplikaattina.

```json
{
  "id": "30000000-0000-4000-8000-000000000001",
  "type": "broken",
  "name": "Esimerkkipalvelu",
  "url": "https://example.com/palvelu",
  "category": "Asiointi",
  "source": "Käyttäjän ilmoitus",
  "note": "Linkki ei avaudu.",
  "website": ""
}
```

### Avoin palaute

`POST /api/v1/feedback` vaatii tyypin `bug`, `content`, `link`, `accessibility`, `idea` tai `other`, 3–140 merkin otsikon, 5–1600 merkin kuvauksen ja enintään 120 merkin sivun. Valinnainen `client` noudattaa nykyistä rajattua selainympäristön kenttäsopimusta.

```json
{
  "id": "40000000-0000-4000-8000-000000000001",
  "type": "accessibility",
  "title": "Painike ei erotu",
  "description": "Painikkeen kontrasti on liian matala.",
  "page": "index",
  "website": ""
}
```

Valinnainen `screenshot` sisältää kentät `name`, `type`, `size` ja `dataUrl`. Sallittuja ovat PNG, JPEG, WebP ja GIF, enintään 450 KiB. Palvelin tarkistaa base64-koon, kuvan rakenteen ja MIME-tyypin. Kuva tallennetaan satunnaisella nimellä `protected_uploads`-hakemistoon web-juuren ulkopuolelle; tietokantaan tallennetaan vain suojattu avain, nimi, MIME-tyyppi, koko ja SHA-256-tiiviste.

### Testipalaute

`POST /api/v1/test-feedback` hyväksyy lomakeversiot `2026-06` ja `2026-08-release-candidate`. Palvelin soveltaa samoja pakollisia kenttiä, enum-arvoja ja 900/1200 merkin tekstirajoja kuin nykyiset Firestore-säännöt. Release candidate -versiossa myös `headerClarity` ja `seniorPageStatus` ovat pakollisia.

```json
{
  "id": "10000000-0000-4000-8000-000000000001",
  "formVersion": "2026-08-release-candidate",
  "createdAt": "2026-08-20T09:00:00.000Z",
  "deviceTypes": ["computer"],
  "useMode": "self",
  "webExperience": "often",
  "purposeClear": "yes",
  "headerClarity": "yes",
  "firstImpression": "Selkeä",
  "pageFeelings": ["clear", "useful"],
  "foundServices": "yes",
  "searchedFor": "Pankkipalvelu",
  "missingService": "",
  "categoryClarity": "yes",
  "unclearCategory": "",
  "municipalityCorrect": "yes",
  "localServicesUseful": "yes",
  "seniorPageStatus": "opened",
  "missingLocalLink": "",
  "localNewsUseful": "yes",
  "featureRatings": {"weather": 4, "scamAlerts": 5},
  "missingFeature": "",
  "textSize": "good",
  "contrastClarity": "yes",
  "mobileEase": "notTested",
  "difficultPart": "",
  "tourViewed": "yes",
  "tourHelpful": "yes",
  "tourFeedback": "",
  "usefulnessRating": 5,
  "easeRating": 4,
  "recommend": "yes",
  "mostImportantFix": "Painikkeen kontrasti",
  "bestThing": "Selkeys",
  "website": ""
}
```

### Käyttötilasto

`POST /api/v1/usage-events` hyväksyy `pageview`- tai `linkClick`-tapahtuman ja palauttaa 204. Sivun nimi ja linkin kategoria ovat enintään 180 merkkiä. Tilastointi ei vastaanota yksittäisen linkin osoitetta, linkin nimeä, kellonaikaa tai kampanjalähdettä.

```json
{"type":"pageview","page":"index"}
```

```json
{"type":"linkClick","page":"index","category":"Asiointi"}
```

Käyttötilasto tallentaa vain Helsinki-päivän kokonaislaskurit sekä sivu- ja linkkikohtaiset laskurit. Se ei hyväksy eikä tallenna käyttäjätunnistetta, raakaa IP-osoitetta, user agentia tai selaimen sormenjälkeä. Pyyntörajoitin käyttää IP-osoitteesta palvelinsalaisuudella laskettua HMAC-SHA-256-tiivistettä; raakaa osoitetta ei tallenneta.

### Pyyntörajat

| Reitti | Raja asiakastiivistettä kohden |
| --- | --- |
| linkki-ilmoitus | 10 pyyntöä / 10 minuuttia |
| avoin palaute | 6 pyyntöä / 10 minuuttia |
| testipalaute | 6 pyyntöä / 10 minuuttia |
| käyttötilasto | 120 pyyntöä / minuutti |

Rajan ylitys palauttaa 429/`rate_limited` ja `Retry-After`-otsakkeen.

## REL-05: ylläpidon tunnistus ja reitit

Kaikki `/api/v1/admin/`-reitit vaativat oletuksena otsakkeen `Authorization: Bearer <Firebase-ID-token>`. API hyväksyy vain Firebase Client SDK:n ID-tokenin, jonka:

- algoritmi on RS256 ja allekirjoitus vastaa Googlen `securetoken`-varmennetta;
- `aud` vastaa asetettua Firebase-projektia ja `iss` on saman projektin `https://securetoken.google.com/<projectId>`;
- `exp` on voimassa sekä `iat` ja `auth_time` hyväksyttävässä ajassa;
- `sub` on kelvollinen Firebase UID;
- tokenin varmennettu `sub`-UID vastaa aktiivista `admin_users`-riviä, jonka rooli on `viewer`, `editor` tai `admin`.

Firebase UID on käyttöoikeuden pysyvä ensisijainen tunniste. Tokenin valinnaisia `email`, `email_verified` ja `firebase.sign_in_provider` -väitteitä voidaan käyttää diagnostiikkaan, mutta niiden puuttuminen ei estä ennalta provisioitua UID:tä. Selainprofiilin tai `providerData`-sähköpostia ei käytetä oikeuden myöntämiseen.

Julkiset varmenteet haetaan Googlen virallisesta X.509-päätepisteestä ja välimuistitetaan `Cache-Control: max-age` -ajan. Tokenia, Authorization-otsaketta tai sähköpostia ei kirjoiteta HTTP-lokiin. Selainpuolen sähköposti, piilotettu kenttä tai `localStorage`-arvo ei osallistu oikeuspäätökseen.

Roolit ovat:

| Rooli | Oikeus |
| --- | --- |
| `viewer` | ylläpitotietojen luku |
| `editor` | luku ja sisältömuutokset |
| `admin` | luku ja sisältömuutokset |

Ympäristökohtaiset UID:t ja sähköpostit lisätään `admin_users`-tauluun turvallisessa ylläpitoistunnossa, ei migraatioon tai Git-repositorioon. Firebase Consolesta tarkistettu UID on oikeuspäätöksen ensisijainen tunniste; sähköposti säilytetään ylläpidollisena tietona. Rooli voidaan poistaa käytöstä asettamalla `active = 0`; muutos vaikuttaa seuraavaan API-pyyntöön.

### Ylläpitoreitit

| Metodi ja reitti | Tarkoitus |
| --- | --- |
| `GET /api/v1/admin/me` | aktiivisen ylläpitäjän UID, sähköposti ja rooli |
| `GET /api/v1/admin/site-content` | kaikkien etusivun käyttöliittymäkielten ylläpidossa julkaistut sivutekstit |
| `PATCH /api/v1/admin/site-content/{contentKey}` | tekstin julkaisu tai tyhjällä arvolla palautus koodin oletustekstiin; vaatii editorin tai adminin roolin |
| `GET /api/v1/admin/link-reports` | linkki-ilmoitusjono |
| `PATCH /api/v1/admin/link-reports/{id}` | tila ja käsittelyperuste |
| `GET /api/v1/admin/feedback` | avoin palaute ja rajatut liitemetatiedot |
| `PATCH /api/v1/admin/feedback/{id}` | tila ja julkinen huomio |
| `GET /api/v1/admin/feedback/{id}/attachment` | suojatun kuvaliitteiden lataus |
| `GET /api/v1/admin/test-feedback` | testipalautteet |
| `GET/POST /api/v1/admin/approved-links` | hyväksyttyjen linkkien lista ja lisäys |
| `DELETE /api/v1/admin/approved-links/{id}` | hyväksytyn linkin poisto |
| `GET/POST /api/v1/admin/blocked-links` | estettyjen linkkien lista ja lisäys |
| `DELETE /api/v1/admin/blocked-links/{id}` | estetyn linkin poisto |
| `GET/POST /api/v1/admin/scam-alerts` | kahden viime kuukauden huijausvaroitukset, vanhemmat yhä voimassa olevat varoitukset ja uuden varoituksen lisäys |
| `PATCH /api/v1/admin/scam-alerts/{id}` | huijausvaroituksen rajattu päivitys |
| `GET /api/v1/admin/ncsc-logs` | Kyberturvallisuuskeskuksen ajoloki |
| `POST /api/v1/admin/ncsc-run` | editorin tai adminin turvallinen NCSC-käsiajo |
| `GET /api/v1/admin/link-checks` | automaattisen linkkitarkistuksen yhteenveto, kaikkien nykyisten varoitusten ja virheiden kohdetiedot, vahvistetut ongelmat ja ajohistoria |
| `POST /api/v1/admin/link-checks/{urlHash}/action` | hyväksy huomio tai palauta automaattisesti estetty linkki määräaikaiseksi poikkeukseksi, piilota linkki ylläpitäjän estolla tai päivitä nimi ja HTTPS-osoite (`action: replace`, `replacementName`, `replacementUrl`) |
| `GET /api/v1/admin/usage-stats` | päivä-, sivu- ja osio-/kategoriakohtaiset aggregaatit |
| `GET /api/v1/admin/audit-log` | ylläpidon muutosloki |

Sivutekstien editori käyttää vain palvelimen sallimia sisältöavaimia ja kieliä `fi`, `sv`, `en`, `se`, `uk`, `et` ja `ru`. Tyhjä arvo poistaa mukautuksen ja palauttaa koodissa olevan oletustekstin. Tietosuoja- ja saavutettavuusselosteiden pitkissä tekstikentissä tuetaan rajattua Markdownia (väliotsikot, luettelot ja turvalliset HTTPS- sekä sähköpostilinkit); raakaa HTML:ää ei tulkita. Erilliset selostesivut ja niiden editorit ovat käytössä kielillä `fi`, `sv` ja `en`, joille on tarkistettu oma juridinen sisältö.

## REL-09: tausta-ajo

`cron/ncsc.php` ja `POST /api/v1/admin/ncsc-run` käyttävät samaa `NcscJob`-toteutusta. MariaDB:n yhteyskohtainen `GET_LOCK` estää rinnakkaiset ajot. Kuuden päivän lähdekohtainen uusintaesto, deterministinen varoitustunniste ja upsert estävät kaksoisvaroitukset. Onnistumiset, hallitut ohitukset ja turvalliset virhekoodit tallennetaan `ncsc_scrape_logs`-tauluun. Käsiajo vaatii kirjoittavan ylläpitoroolin ja siitä syntyy auditointimerkintä.

Cloudcity-cron käyttää palvelimen PHP 8.4 CLI:tä ja ympäristöjuuren web-juuren ulkopuolista skriptiä. Suositeltu aikataulu on arkipäivisin klo 11.30 ja 15.30 Europe/Helsinki-ajassa. Komentoon ei lisätä salaisuuksia; skripti lukee olemassa olevan `secrets/config.php`-asetuksen. Yksityiskohtainen staging- ja palautuskoe on tiedostossa `docs/rel09-tausta-ajot-ja-palautuskoe.md`.

## REL-13: sähköposti-ilmoitukset ja raportit

Migraatio `004_email_notifications.sql` lisää idempotentin `email_outbox`-jonon. Vastaanottaja `seniorsurf@vtkl.fi` ja lähettäjä `noreply@seniorsurf.fi` luetaan yksityisestä asetuksesta; vastaanottajan osoitetta tai SMTP-tunnuksia ei tallenneta jonoon. Jonossa säilyvät vain viestityyppi, raporttijakso, koosteviestin sisältö, turvallinen virhekoodi ja toimitustila. Lähetetyt ja lopullisesti epäonnistuneet rivit poistetaan 24 kuukauden kuluttua.

`cron/notifications.php` muodostaa:

- arkipäivän ylläpitokoosteen vain, kun jonossa on avoimia palautteita, odottavia linkki-ilmoituksia, pian vanhenevia huijausvaroituksia tai tarkistettava NCSC-ajo;
- edellisen kalenterikuukauden raportin kuukauden toisesta päivästä alkaen;
- edellisen kalenterikvartaalin raportin tammi-, huhti-, heinä- ja lokakuun viidennestä päivästä alkaen.

Kooste ei lue eikä lähetä käyttäjien otsikoita, kuvauksia, huomioita tai liitteitä. Kuukausi- ja kvartaaliraportit sisältävät tunnisteettomat tapahtumakoosteet, vertailun edelliseen jaksoon, suoran avauksen osuuden, ohjefunnelin, suosituimmat sivut/linkkiluokat/linkit sekä ylläpitovirran lukumäärät. Raportissa kerrotaan erikseen, etteivät tapahtumat ole yksilöityjä käyttäjiä eikä suora avaus todista aloitussivuasetusta.

`cron/email-dispatch.php` käyttää MariaDB:n yhteyslukkoa, ottaa enintään kymmenen erää kerrallaan ja yrittää virhettä uudelleen 5 ja 30 minuutin kuluttua. Kolmas epäonnistuminen merkitään tilaan `failed`. Tietokantaan tallennetaan vain rajattu `smtp_*`-virhekoodi, ei palvelimen vastausta tai tunnuksia. Tunnin ajaksi tilaan `sending` jäänyt rivi palautuu hallittuun käsittelyyn. Sama viestityyppi, jakso ja vastaanottaja-alias voidaan jonottaa vain kerran.

Cloudcityn suositus on ajaa `notifications.php` päivittäin klo 08.15 ja `email-dispatch.php` 15 minuutin välein Europe/Helsinki-ajassa. Ensimmäinen SMTP-koe tehdään manuaalisesti skriptillä `cron/smtp-test.php`; skripti ei tulosta salasanaa tai vastaanottajan osoitetta.

## REL-14: automaattinen linkkitarkistus

Migraatio `005_automated_link_checks.sql` lisää tarkistuskohteet, viimeisimmän tilan, 180 vuorokauden tuloshistorian ja ajokoosteen. Migraatio `006_link_check_hardening.sql` lisää mukautuvan tarkistusvälin, domain-muutoksen, automaattisen eston sekä ajokohtaiset esto- ja palautuslaskurit. Migraatio `007_link_check_admin_actions.sql` lisää auditoidut, kolmen kuukauden välein uudelleen tarkistettavat ylläpitäjän varmennukset. Migraatio `008_usage_privacy_cleanup.sql` poistaa vanhat tunti- ja kampanjalähdebucketit sekä yhdistää vanhat linkkikohtaiset käyttöluvut osio- ja kategoriatasolle. Migraatio `009_approved_links_municipality.sql` lisää hyväksytyille linkeille kuntarajauksen. Migraatio `010_link_content_corrections.sql` lisää vaihdetun linkin alkuperäisen osoitteen kohdistuksen ja korjaa tietokantaan aiemmin hyväksytyn Bluesky-linkin nimen. Migraatio `011_site_content_editor.sql` lisää auditoidun sivutekstien editorin tietovaraston. Migraatio `012_site_content_additional_locales.sql` laajentaa editorin pohjoissaameen, ukrainaan, eestiin ja venäjään. Tuotantopaketin `data/link-catalog.json` muodostetaan sovelluksen linkkilähteistä paketoinnin aikana. Cron yhdistää siihen tietokannan hyväksytyt linkit ja tarkistaa vain vuorossa olevan, asetuksella rajatun erän.

`cron/link-check.php` hyväksyy vain HTTPS-osoitteet, tarkistaa TLS-varmenteen ja jokaisen uudelleenohjauksen sekä estää paikalliset, yksityiset ja varatut IP-osoitteet. HTTP 401, 403 ja 429 kirjataan varoituksiksi; varsinaiset virheet vahvistetaan oletuksena kahdella peräkkäisellä tarkistuksella ennen ylläpidon huomiota. Vahvistettu 404/410-, DNS-, TLS-, uudelleenohjaus- tai verkkotunnuksen myyntivirhe voidaan piilottaa automaattisesti `blocked_links`-taulun kautta. Ihmisen tekemää estoa automaatio ei koskaan poista. MariaDB:n yhteyslukko estää rinnakkaiset ajot.

Ylläpitäjä voi käsitellä jokaisen ylläpitoon nousseen linkin kolmella tavalla. `Hyväksy toimivaksi` tallentaa perustellun poikkeuksen kolmeksi kuukaudeksi; automaattisesti piilotetulla linkillä sama toiminto näkyy nimellä `Palauta näkyviin` ja poistaa vain automaattisen eston. Verkkotunnusohjauksen hyväksyntä ei vaimenna myöhempää 404- tai DNS-vikaa. `Poista linkki näkyvistä` tekee ylläpitäjän pysyvän `blocked_links`-eston, jota automaattinen palautus ei poista. `Tallenna nimi ja osoite` lisää tai päivittää hyväksytyn linkin. Jos HTTPS-osoite muuttuu, alkuperäinen osoite piilotetaan; pelkkä nimimuutos voidaan tallentaa samalla osoitteella.

Yhteenvetolukujen `Varoituksia` ja `Epäonnistuu` alla olevat kohteet palautetaan myös yksittäin `statusItems`-listassa. Ylläpito näyttää nimen, osoitteen, turvallisen virhesyyn, HTTP-tilan sekä seuraavan tarkistusajan. Varoituksen tai ensimmäisen epäonnistumisen voi tarkistaa käsin ja käsitellä heti; voimassa oleva ylläpitäjän poikkeus ja jo piilotettu linkki merkitään listassa erikseen.

Cloudcityn suositus on ajaa työ kerran tunnissa vapaalla ajastuksella `7 * * * *`. Oletuserä on 10 linkkiä. Uusi linkki aloittaa 72 tunnin tarkistusvälistä, ja onnistumiset kasvattavat väliä asteittain enintään 30 vuorokauteen. Epäonnistumiset yritetään uudelleen 6, 24 ja 72 tunnin sekä sen jälkeen 7 vuorokauden välein. Kohteen aikabudjetti on 15 sekuntia ja ajon 120 sekuntia. Jos kiintopiste ei vastaa tai yli 60 prosenttia erästä kaatuu verkkovirheeseen, ajo keskeytyy muuttamatta linkkien vikalaskureita tai näkyvyyttä. Käyttöönotto-ohje on tiedostossa `docs/rel14-v0770-automaattinen-linkkitarkistus.md`.

Kaikki ylläpidon listat palauttavat `Cache-Control: private, no-store`. Liitteen tallennusavainta ei palauteta asiakkaalle, vaan kuva luetaan web-juuren ulkopuolelta vasta uuden oikeustarkistuksen jälkeen. Ylläpidon muutokset tehdään tietokantatransaktiossa yhdessä `audit_log`-rivin kanssa. Auditointirivi sisältää tekijän UID:n, toiminnon, kohdetyypin, kohdetunnisteen ja muuttuneiden kenttien nimet, mutta ei palautetekstiä, käsittelyperustetta tai muuta yksityistä kenttäarvoa.

Esimerkki linkki-ilmoituksen käsittelystä:

```json
{
  "status": "rejected",
  "reviewReason": "Linkki ei kuulu palvelun rajaukseen."
}
```

Esimerkki hyväksytyn linkin lisäämisestä:

```json
{
  "name": "Esimerkkipalvelu",
  "url": "https://example.com/palvelu",
  "category": "Asiointi",
  "source": "Ylläpito",
  "note": ""
}
```

Vain `editor`- ja `admin`-roolit voivat tehdä muutoksia. Puuttuva tunnistus palauttaa 401, kelvollinen token ilman aktiivista täsmäävää roolia 403 ja puuttuva kohde 404. Bearer-tokenia käytetään otsakkeessa eikä evästepohjaista ylläpitoistuntoa ole, joten reitit eivät luota WordPress-evästeisiin tai selain-CSRF-tilaan.

Stagingin HTTP Basic Auth ja tavallinen `Authorization`-Bearer eivät mahdu samaan pyyntöön. Jos koko staging-origin suojataan Basic Authilla, stagingin salaisessa asetustiedostossa käytetään `authentication.token_header = 'x-firebase-id-token'` ja frontend lähettää `X-Firebase-ID-Token: Bearer <token>`. Tuotannossa asetus pidetään arvossa `authorization`. API hyväksyy vain asetuksessa valitun otsakkeen; CORS-preflight nimeää molemmat sallitut otsakkeet, jotta sama build voidaan testata hallitulla ympäristöasetuksella.

## Testit

```powershell
php -d extension=pdo_sqlite api/tests/run.php
```

Testit eivät käytä verkkoyhteyttä tai Cloudcityn tietokantaa. Ne kattavat REL-03-perustan lisäksi julkisten listojen kenttärajauksen ja ETagin, jokaisen julkisen kirjoitustyypin, duplikaatit, idempotenssiristiriidan, Firestore-kenttärajat, kuvan rakenteen, liitteen tietokantarajauksen, käyttölaskurit ilman asiakastunnisteita, ylimittaiset syötteet, 429-vastauksen ja palauteaineistojen lukukiellon. REL-05-testit allekirjoittavat paikallisen RS256-testitokenin ja tarkistavat allekirjoituksen, väitteet, vanhentumisen, puuttuvan tunnistuksen, väärän tai poistetun roolin, luku- ja muutosoikeuden, dynaamiset reitit, suojatun liiteluvun, parametrisidonnan ja auditointirivin.
