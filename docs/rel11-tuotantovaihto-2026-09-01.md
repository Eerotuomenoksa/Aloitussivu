# REL-11 tuotantovaihto 1.9.2026 klo 09.00

> **Aikataulumuutos 27.8.2026:** tekninen tuotantovaihto on aikaistettu pehmeäksi avaukseksi 28.8.2026. Laaja tiedotus säilyy 1.9.2026 klo 09.00. Päivitetty aikataulu ja GO-ehdot ovat tiedostossa `rel11-pehmea-avaus-2026-08-28.md`. Tämän ajokirjan vaiheiden järjestystä käytetään edelleen, mutta alla olevia version 0.74.5 ZIP- ja ehdokaspolkuja sisältäviä komentolohkoja ei saa ajaa. Ne korvataan version 0.74.6 täsmällisillä palvelinpoluilla vasta uuden paketin esiviennin jälkeen.

Päivitetty 27.8.2026. Tämä on suoritettava ajokirja Aloitussivun tuotantojulkaisuun. Kellonajat ovat Europe/Helsinki-aikaa. **Klo 09.00 on varsinaisen tietosiirron T0; tavoite on aktivoida julkinen `/aloitus/` ja samalla ainoa kirjoittava Cloudcity-provider noin klo 09.10, hyväksyä smoke noin klo 09.20 ja päättää muutosikkuna viimeistään klo 09.25.**

## Lukittu lähtötilanne

- Julkaisuehdokas on `REL-11-v0.74.5-ccaea4d434df`.
- Palvelimen ZIP on `/home/seniorsurffi/aloitussivu-rel11-v0745-production-path.zip`, koko 828142 tavua ja SHA-256 `a2b18ab6ddff6a590b3adf1de46560252b9f74abd48226aadbed7e3b645b5143`.
- Purettu ehdokas on `/home/seniorsurffi/rel11-production-candidate-ccaea4d434df-20260827-120748`, 115 tiedostoa.
- Staging-tiedostojen palautuspiste on `/home/seniorsurffi/rel11-v0745-final-staging-files-20260827-120748.tar.gz`, SHA-256 `a3c5e75feee083310623f469a37ea63cffaa428d6e3b842746d95ec3f3838f38`.
- Yksityinen tuotantokoodi on `/home/seniorsurffi/aloitus-production/`: 45 tiedostoa, hakemistot 750 ja tiedostot 640. Oikeaa `secrets/config.php`-tiedostoa ei ollut vielä lähtötilanteessa.
- Julkista `/home/seniorsurffi/website.wp33403/aloitus/`-hakemistoa ei ollut vielä lähtötilanteessa. Nykyinen WordPress-ohjaus säilyy siihen asti, kun fyysinen hakemisto aktivoidaan.
- Tuotanto-MariaDB:ssä ovat migraatiot `001_initial_schema` ja `002_add_link_reports_triage_index`, 15 taulua ja tarvittava linkki-ilmoitusindeksi. Sovellusdataa ei ole vielä tuotu.
- Tuotanto-MariaDB:n varmistus ja staging-MariaDB:n manuaalinen varmistus on otettu 27.8.2026.
- Cloudcity vahvisti 28.8.2026, ettei tietokantaan saa erillisiä käyttäjiä eri oikeuksilla. Tuotevastuu hyväksyi ainoan tietokantakäyttäjän käyttämisen API:ssa dokumentoidulla tietoturvapoikkeuksella. Käyttäjällä saa olla globaali `USAGE` ja tietokantakohtainen `ALL PRIVILEGES` vain Aloitussivun tuotantokantaan, ilman `GRANT OPTION` -oikeutta.
- Firestore-esivienti projektista `aloitussivu-5d50c` valmistui 27.8.2026 klo 15.14.31, SHA-256 `7b1ccaf1546f50f39332ba6f188fab642f1aa3a36789bec2b78d5713dcab6d3a`, poikkeamia 0. Tämä on harjoitus- ja vertailuaineisto, **ei julkaisuhetkellä tuotava aineisto**.
- WordPress-esittelysivu ja kuvakaappaukset on tuotevastuun ilmoituksen mukaan tehty.

Sovelluspakettia ei rakenneta uudelleen dokumentti-, provisiointityökalu- tai kirjoituslukkosääntöjen muutosten vuoksi. Jos `dist`, `api`, `deploy/cloudcity`, `package.json`-version tuotantoriippuvuudet tai tuotantobuildin syötteet muuttuvat, ehdokas on rakennettava, vietävä ja testattava uudelleen.

## Nimet ja kovat GO-ehdot

Täytä nimet viimeistään maanantaina 31.8. klo 12.00:

| Vastuu | Nimi | Valmis |
| --- | --- | --- |
| Go/no-go ja kirjoituslukko | Eero Tuomenoksa |  |
| SSH-aktivointi | Eero Tuomenoksa |  |
| MariaDB-tuonti ja täsmäytys | Eero Tuomenoksa |  |
| WordPress-jälkisavukoe | Eero Tuomenoksa |  |
| Riippumaton smoke-hyväksyntä | nimetään |  |
| Palautuspäätöksen tuki | Nina Ziessler / vahvistetaan |  |
| Cloudcity/WordPress-tuki | Fakiirimedia |  |

Julkaisu on NO-GO, jos maanantaina 31.8. klo 12.00 yksikin näistä puuttuu:

1. hyväksytty tietoturvapoikkeus ja sen rajauksen mukainen `SHOW GRANTS` -tulos;
2. valmis yksityinen tuotanto-`config.php` sekä onnistunut tietokantayhteyskoe;
3. tuotannon admin-roolit ja henkilötiedoton täsmäytys;
4. nimetty riippumaton smoke-hyväksyjä ja tavoitettavissa oleva palautustuki;
5. Firestore-kirjoituslukon kuivaharjoitus ja palautussäännön komento;
6. WordPressin ennen-savukoe sekä suoran `/aloitus/`-polun palautusehto;
7. muuttumaton ZIP, ehdokashakemisto ja niiden tiivisteet.

Ilman näitä ei aloiteta kirjoituslukkoa eikä tietojen tuontia.

## Perjantai 28.8. – valmistelu 1/2

1. Säilytä Cloudcityn vastaus yksityisessä ylläpitolokissa ilman tunnuksia.
2. Tarkista API-käyttäjän grantit phpMyAdminissa tai ylläpitoistunnossa. Hyväksy dokumentoidulla poikkeuksella globaali `USAGE` ja tietokantakohtainen `ALL PRIVILEGES` täsmälleen Aloitussivun tuotantokantaan. Hylkää `GRANT OPTION`, muut globaalit oikeudet sekä oikeudet WordPress-kantaan tai muihin kantoihin.
3. Tee yksityinen `config.php` jäljempänä kuvatulla tavalla käyttäen ainoaa Cloudcityn tietokantakäyttäjää.
4. Tarkista Firebase Consolesta jokaisen ylläpitäjän UID, vahvistettu sähköposti, rooli ja aktiivisuus. Muodosta admin-SQL repositorion ulkopuolelle ja aja se tuotantokantaan.
5. Nimeä riippumaton smoke-hyväksyjä ja varmista, että hän on tavoitettavissa 1.9. klo 09.10–09.25.
6. Aja kirjoituslukkosääntöjen `--dry-run`. Älä julkaise sääntöjä vielä.

### API-konfiguraatio SSH:ssa

Kirjaudu palvelimelle omassa terminaalissa. Älä kopioi salasanaa komentoriville tai keskusteluun.

```bash
(
  set -eu
  REL11_PRIVATE=/home/seniorsurffi/aloitus-production

  test "$(realpath "$REL11_PRIVATE")" = /home/seniorsurffi/aloitus-production
  test -f "$REL11_PRIVATE/secrets/config.production.example.php"
  if test -e "$REL11_PRIVATE/secrets/config.php"; then
    echo 'STOP: config.php on jo olemassa; sitä ei korvattu.' >&2
    exit 1
  fi

  cp "$REL11_PRIVATE/secrets/config.production.example.php" "$REL11_PRIVATE/secrets/config.php"
  chmod 640 "$REL11_PRIVATE/secrets/config.php"
  test "$(stat -c '%a' "$REL11_PRIVATE/secrets/config.php")" = 640
  echo 'production_config_template=ready'
)
```

Suluissa ajettava lohko ei sulje SSH-yhteyttä, vaikka jokin tarkistus pysäyttää vaiheen. Jos tulos on `STOP`, älä poista tai korvaa olemassa olevaa tiedostoa ennen sen alkuperän varmistamista.

Muokkaa `config.php` palvelimen omassa editorissa tai Cloudcityn suojatussa tiedostonhallinnassa. Aseta:

- ympäristö `production`, origin `https://seniorsurf.fi` ja base path `/aloitus`;
- tuotantokannan nimi sekä tietoturvapoikkeuksella hyväksytty ainoa Cloudcity-käyttäjä;
- Cloudcityn tietokantaisäntä `dbtma.db.cchosting.fi` ja portti 3306;
- vahva satunnainen `rate_limit_secret`;
- Firebase-projekti `aloitussivu-5d50c`.

Tarkista paljastamatta arvoja:

```bash
(
  set -eu
  REL11_CONFIG=/home/seniorsurffi/aloitus-production/secrets/config.php
  PHP_BIN=/opt/alt/php84/usr/bin/php

  test -x "$PHP_BIN"
  test -f "$REL11_CONFIG"
  test "$(stat -c '%a' "$REL11_CONFIG")" = 640
  "$PHP_BIN" -l "$REL11_CONFIG"
  if grep -Eq 'REPLACE_WITH|CHANGE_ME' "$REL11_CONFIG"; then
    echo 'BLOCKED: config.php sisältää malliarvon.' >&2
    exit 1
  fi

  "$PHP_BIN" -r '$c = require $argv[1]; $p = new PDO($c["database"]["dsn"], $c["database"]["username"], $c["database"]["password"], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]); $p->query("SELECT 1"); echo "database=up\n";' "$REL11_CONFIG"
)
```

Komennon pitää tulostaa vain syntaksin onnistuminen ja `database=up`.

### Admin-roolien yksityinen aineisto

Kopioi mallipohja repositorion ulkopuolelle ja täytä tiedosto paikallisesti. Malliarvot on tarkoituksella estetty generaattorissa.

```powershell
Set-Location C:\dev\Aloitussivu

$rel11Private = Join-Path $env:LOCALAPPDATA 'Aloitussivu-REL11-private'
New-Item -ItemType Directory -Path $rel11Private -Force | Out-Null

$adminInput = Join-Path $rel11Private 'production-admins.json'
if (-not (Test-Path -LiteralPath $adminInput)) {
    Copy-Item -LiteralPath .\database\admin-provisioning-input.example.json -Destination $adminInput
    throw "Täytä yksityinen tiedosto ja aja komennot uudelleen: $adminInput"
}

$adminStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$adminOutput = Join-Path $rel11Private "production-admins-$adminStamp"

npm run rel11:admin-provisioning-test
npm run rel11:build-admin-provisioning -- `
  --input $adminInput `
  --output-dir $adminOutput
```

Aja ensin `preflight-admins.sql` oikeassa tuotantokannassa; `conflicting_email_assignments`-arvon pitää olla 0. Aja vasta sitten `provision-admins.sql` ja `verify-admins.sql`. Sekä `expected_accounts_found`- että `expected_accounts_matching`-arvon pitää vastata `summary.json`-tiedoston `adminCount`-arvoa. Tuloksia saa kirjata vain rooli- ja aktiivisuuslukumäärinä. Täytettyä JSONia tai SQL:ää ei kopioida Git-repositorioon, keskusteluun tai julkiseen päiväkirjaan.

### Firestore-kirjoituslukon kuivaharjoitus

Työasemalla on varmennettu Firebase CLI 15.19.0:lla 27.8.2026, että sääntötiedosto kääntyy projektille onnistuneesti. Toista tarkistus 31.8. ja 1.9. ennen käyttöä:

```powershell
Set-Location C:\dev\Aloitussivu
firebase.cmd deploy --only firestore `
  --config firebase.write-freeze.json `
  --project aloitussivu-5d50c `
  --dry-run `
  --non-interactive
```

`firebase.write-freeze.json` osoittaa tiedostoon `deploy/firebase/firestore-write-freeze.rules`. Lukko säilyttää nykyiset julkiset Firestore-luvut, estää kaikki asiakas- ja ylläpitokirjoitukset ja estää admin-only-lukureitit. Admin SDK -vienti toimii silti IAM-tunnistuksella; Firebase-palvelinkirjastot ohittavat Security Rules -säännöt.

Firebase kertoo, että sääntömuutos vaikuttaa uusiin kyselyihin yleensä noin minuutissa mutta aktiivisiin kuuntelijoihin täysin leviämiseen voi kulua jopa 10 minuuttia. Siksi lukko julkaistaan klo 08.47 ja lopullinen vienti aloitetaan vasta klo 09.00. Lähteet: [Security Rules -käyttöönotto](https://firebase.google.com/docs/firestore/security/get-started) ja [palvelinkirjastojen IAM-käyttäytyminen](https://firebase.google.com/docs/firestore/enterprise/security/rules-structure).

## Maanantai 31.8. – valmistelu 2/2

| Aika | Tehtävä | Hyväksymisehto |
| --- | --- | --- |
| 09.00 | API-käyttäjä, `config.php`, DB-yhteys | kaikki PASS |
| 10.00 | Admin-SQL:n preflight, provisiointi ja henkilötiedoton täsmäytys | ristiriitoja 0; molemmat odotetut tilimäärät täsmäävät. Tuotannon kirjautumiskoe tehdään aktivoinnin jälkeen. |
| 11.00 | WordPress WP-01–WP-04 ennen-savukoe | PASS ja kuvat tallessa |
| 12.00 | Kova valmiusportti | kaikki seitsemän GO-ehtoa täyttyvät |
| 13.00 | Firestore-lukon kuivaharjoitus ja normaalisäännön palautuskomennon tarkistus | molemmat `--dry-run` PASS |
| 14.00 | Ehdokkaan, ZIPin ja hakemistojen vain lukeva uusintatarkistus | polut, 115 tiedostoa ja SHA täsmäävät |
| 15.00 | Kenraaliharjoitus paperilla riippumattoman hyväksyjän kanssa | jokaisella vaiheella tekijä ja STOP-ehto |
| 16.00 | Operatiivinen jäädytys | ei sovellus- tai deploy-inputtimuutoksia |

Normaalisäännön palautuskomennon kuivaharjoitus:

```powershell
firebase.cmd deploy --only firestore `
  --config firebase.json `
  --project aloitussivu-5d50c `
  --dry-run `
  --non-interactive
```

Ehdokkaan SSH-uusintatarkistus:

```bash
set -eu
REL11_ZIP=/home/seniorsurffi/aloitussivu-rel11-v0745-production-path.zip
REL11_CANDIDATE=/home/seniorsurffi/rel11-production-candidate-ccaea4d434df-20260827-120748
REL11_PUBLIC_SOURCE="$REL11_CANDIDATE/wordpress_aloitus"
REL11_PUBLIC_PARENT=/home/seniorsurffi/website.wp33403
REL11_PUBLIC_TARGET="$REL11_PUBLIC_PARENT/aloitus"

test "$(realpath "$REL11_CANDIDATE")" = "$REL11_CANDIDATE"
test "$(realpath "$REL11_PUBLIC_PARENT")" = "$REL11_PUBLIC_PARENT"
test ! -e "$REL11_PUBLIC_TARGET"
test -f "$REL11_PUBLIC_SOURCE/index.html"
test -f "$REL11_PUBLIC_SOURCE/.htaccess"
test -f "$REL11_PUBLIC_SOURCE/api/index.php"
test "$(find "$REL11_CANDIDATE" -type f | wc -l | tr -d ' ')" = 115
test "$(sha256sum "$REL11_ZIP" | awk '{print $1}')" = a2b18ab6ddff6a590b3adf1de46560252b9f74abd48226aadbed7e3b645b5143
test "$(stat -c '%d' "$REL11_PUBLIC_SOURCE")" = "$(stat -c '%d' "$REL11_PUBLIC_PARENT")"

echo 'candidate=ok'
```

Viimeinen `stat` varmistaa, että aktivointi voidaan tehdä saman tiedostojärjestelmän atomisella nimeämisellä.

## Tiistai 1.9. – minuuttiaikataulu

| Aika | Vaihe | Päätös |
| --- | --- | --- |
| 08.30 | Avaa PowerShell, SSH, phpMyAdmin ja hyväksyntäkanava. Tarkista nimet, polut, DB ja varmistukset. | Puute = NO-GO. |
| 08.40 | Aja molemmat Firestore-sääntöjen `--dry-run`-komennot ja ehdokkaan SSH-tarkistus. | Virhe = NO-GO. |
| 08.45 | GO/NO-GO. Ilmoita lomakekirjoitusten huoltoikkuna. | Vain kirjattu GO jatkaa. |
| 08.47 | Julkaise Firestore-kirjoituslukko. | Virhe tai väärä projekti = keskeytys. |
| 08.50 | Kokeile vanhassa Firebase-sovelluksessa keinotekoinen lomakekirjoitus. Sen pitää epäonnistua; julkisen lukudatan pitää yhä näkyä. | Kirjoitus onnistuu = odota/selvitä, älä vie. |
| 09.00 | **T0:** aloita lopullinen täysi Firestore-vienti ja audit-delta. | Ei kirjoituksia lähteeseen. |
| 09.03 | Rakenna täyden viennin `import.sql` ja audit-deltan raportti. | `exceptionCount` 0. |
| 09.05 | Varmista tuotantokannan tyhjyys, tuo **täysi** `import.sql`, aja `verify.sql`. | Lukumäärien ja tiivisteiden on täsmättävä. |
| 09.10 | Aktivoi julkinen hakemisto atomisesti SSH:ssa. Cloudcitystä tulee samalla ainoa käyttäjille mahdollinen kirjoitusprovider. | Poikkeama = välitön palautus. |
| 09.11 | Aja tekninen `/aloitus/`, bundle, health, 404 ja otsakkeet -smoke. | P1-virhe = palautus. |
| 09.14 | Aja keinotekoinen lomakekirjoitus, admin-kirjautuminen ja ylläpitoluku Cloudcityyn. | P1-virhe = palautus. |
| 09.17 | Aja WordPress WP-01–WP-04 jälkeen-savukoe ja riippumaton tarkistus. | Regressio = palautus. |
| 09.20 | Hyväksy smoke ja päätä käyttäjille ilmoitettu huoltojakso. Firestore-lukko jää voimaan. | Kahden providerin kirjoituksia ei sallita. |
| 09.22 | Mitätöi väliaikainen Admin SDK -avain ja tyhjennä prosessin ympäristömuuttuja. | Avain ei jää aktiiviseksi. |
| 09.25 | Kirjaa GO ja lähetä julkaisuviesti, tai käynnistä palautus. | Ikkunaa ei venytetä hiljaisesti. |

Jos Firestore-säännön julkaisu tehdään myöhemmin kuin klo 08.50, siirrä T0-aikaa niin, että julkaisemisesta on kulunut 10 minuuttia. Älä purista leviämisaikaa lyhyemmäksi.

## T0: lopullinen Firestore-vienti työaseman PowerShellissä

Tee sekä täysi vienti että audit-delta samasta jäädytetystä lähteestä. Koska tuotanto-MariaDB on sovellusdatan osalta tyhjä, **tuotantoon tuodaan vain täyden viennin `import.sql`**. Deltaa alkaen `2026-08-27T12:14:31.289Z` käytetään vain osoittamaan esiviennin jälkeen muuttuneet dokumentit; sitä ei tuoda täyden tuonnin lisäksi.

```powershell
Set-Location C:\dev\Aloitussivu

$rel11Private = Join-Path $env:LOCALAPPDATA 'Aloitussivu-REL11-private'
$env:GOOGLE_APPLICATION_CREDENTIALS = Join-Path $rel11Private 'firebase-admin-rel11.json'
if (-not (Test-Path -LiteralPath $env:GOOGLE_APPLICATION_CREDENTIALS)) {
    throw 'Admin SDK -avaintiedostoa ei löytynyt.'
}

$cutoverStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$fullExport = Join-Path $rel11Private "firestore-cutover-full-$cutoverStamp.json"
$fullImport = Join-Path $rel11Private "import-cutover-full-$cutoverStamp"
$auditDelta = Join-Path $rel11Private "firestore-cutover-delta-$cutoverStamp.json"
$auditImport = Join-Path $rel11Private "import-cutover-delta-$cutoverStamp"

npm run rel08:export -- `
  --project-id aloitussivu-5d50c `
  --output $fullExport

npm run rel08:build-import -- `
  --input $fullExport `
  --output-dir $fullImport

npm run rel08:export -- `
  --project-id aloitussivu-5d50c `
  --output $auditDelta `
  --since '2026-08-27T12:14:31.289Z'

npm run rel08:build-import -- `
  --input $auditDelta `
  --output-dir $auditImport

$fullReport = Get-Content -Raw -LiteralPath (Join-Path $fullImport 'reconciliation-report.json') | ConvertFrom-Json
$fullExceptions = Get-Content -Raw -LiteralPath (Join-Path $fullImport 'exceptions.json') | ConvertFrom-Json
$deltaReport = Get-Content -Raw -LiteralPath (Join-Path $auditImport 'reconciliation-report.json') | ConvertFrom-Json
$deltaExceptions = Get-Content -Raw -LiteralPath (Join-Path $auditImport 'exceptions.json') | ConvertFrom-Json

[pscustomobject]@{
    FullProjectId = $fullReport.projectId
    FullExportedAt = $fullReport.exportedAt
    FullSha256 = $fullReport.exportSha256
    FullExceptionCount = @($fullExceptions).Count
    FullSourceCounts = $fullReport.sourceCounts
    FullTransformedCounts = $fullReport.transformedCounts
    DeltaSince = $deltaReport.deltaSince
    DeltaExceptionCount = @($deltaExceptions).Count
    DeltaSourceCounts = $deltaReport.sourceCounts
} | ConvertTo-Json -Depth 5
```

STOP, jos projekti ei ole `aloitussivu-5d50c`, kumpikaan poikkeamamäärä ei ole 0, `deltaSince` ei vastaa esiviennin aikaa, tiedostoja puuttuu tai lukumäärissä on selittämätön lasku. Älä näytä vientien tai SQL:n sisältöä keskustelussa.

## MariaDB-tuonti ja henkilötiedoton täsmäytys

Valitse phpMyAdminissa nimenomaan Aloitussivun tuotantokanta. Tarkista ennen tuontia, että migraatiot löytyvät ja kaikki sovellusdatataulut ovat tyhjiä; `admin_users` saa jo sisältää provisioidut käyttäjät.

```sql
SELECT version FROM schema_migrations ORDER BY version;

SELECT
  (SELECT COUNT(*) FROM feedback_items) AS feedback_items,
  (SELECT COUNT(*) FROM feedback_attachments) AS feedback_attachments,
  (SELECT COUNT(*) FROM test_feedback_responses) AS test_feedback_responses,
  (SELECT COUNT(*) FROM link_reports) AS link_reports,
  (SELECT COUNT(*) FROM approved_links) AS approved_links,
  (SELECT COUNT(*) FROM blocked_links) AS blocked_links,
  (SELECT COUNT(*) FROM scam_alerts) AS scam_alerts,
  (SELECT COUNT(*) FROM ncsc_scrape_logs) AS ncsc_scrape_logs,
  (SELECT COUNT(*) FROM usage_daily) AS usage_daily,
  (SELECT COUNT(*) FROM usage_page_daily) AS usage_page_daily,
  (SELECT COUNT(*) FROM usage_link_daily) AS usage_link_daily,
  (SELECT COUNT(*) FROM rate_limit_buckets) AS rate_limit_buckets,
  (SELECT COUNT(*) FROM audit_log) AS audit_log;
```

Kaikkien 13 arvon pitää olla 0. Jos ei ole, STOP: älä yhdistä täyttä ja delta-tuontia äläkä tyhjennä tauluja ilman uutta palautuspäätöstä.

1. Tuo täyden viennin hakemistosta `import.sql`.
2. Suorita saman hakemiston `verify.sql`.
3. Vertaa kaikkia rivimääriä, aikavälejä ja pistokoetiivisteitä `reconciliation-report.json`-raporttiin.
4. Älä tuo audit-deltan `import.sql`-tiedostoa.
5. Kirjaa vain lukumäärät, aikavälit, tiivisteet, suoritusajat ja PASS/FAIL.

## Julkisen hakemiston aktivointi SSH:ssa

Aja esivalmistelu ennen T0:aa; aja viimeinen `mv` vasta, kun MariaDB-täsmäytys on PASS.

```bash
set -eu
REL11_CANDIDATE=/home/seniorsurffi/rel11-production-candidate-ccaea4d434df-20260827-120748
REL11_PUBLIC_SOURCE="$REL11_CANDIDATE/wordpress_aloitus"
REL11_PUBLIC_PARENT=/home/seniorsurffi/website.wp33403
REL11_PUBLIC_TARGET="$REL11_PUBLIC_PARENT/aloitus"

test "$(realpath "$REL11_PUBLIC_SOURCE")" = "$REL11_PUBLIC_SOURCE"
test "$(realpath "$REL11_PUBLIC_PARENT")" = "$REL11_PUBLIC_PARENT"
test ! -e "$REL11_PUBLIC_TARGET"
test "$(stat -c '%d' "$REL11_PUBLIC_SOURCE")" = "$(stat -c '%d' "$REL11_PUBLIC_PARENT")"

find "$REL11_PUBLIC_SOURCE" -type d -exec chmod 755 {} +
find "$REL11_PUBLIC_SOURCE" -type f -exec chmod 644 {} +
test -f "$REL11_PUBLIC_SOURCE/index.html"
test -f "$REL11_PUBLIC_SOURCE/.htaccess"
test -f "$REL11_PUBLIC_SOURCE/api/index.php"

mv "$REL11_PUBLIC_SOURCE" "$REL11_PUBLIC_TARGET"
test "$(realpath "$REL11_PUBLIC_TARGET")" = "$REL11_PUBLIC_TARGET"
echo 'public_activation=ok'
```

Älä muuta WordPress-juuren `.htaccess`-tiedostoa, WordPress-tietokantaa, teemaa, lisäosia tai Redirection-sääntöjä tässä vaiheessa.

## Julkaisun smoke

Aja tekninen osuus PowerShellistä:

```powershell
$homeResponse = Invoke-WebRequest -Uri 'https://seniorsurf.fi/aloitus/' -MaximumRedirection 0
$health = Invoke-WebRequest -Uri 'https://seniorsurf.fi/aloitus/api/v1/health' -MaximumRedirection 0
$healthJson = $health.Content | ConvertFrom-Json
$missing = $null
try {
    Invoke-WebRequest -Uri 'https://seniorsurf.fi/aloitus/rel11-purposefully-missing' -MaximumRedirection 0 -ErrorAction Stop
} catch {
    $missing = $_.Exception.Response
}

[pscustomobject]@{
    HomeStatus = [int]$homeResponse.StatusCode
    HomeHasAloitusApi = $homeResponse.Content -match '/aloitus/'
    HealthStatus = [int]$health.StatusCode
    ApiStatus = $healthJson.status
    Database = $healthJson.database
    Version = $healthJson.version
    ApiCacheControl = [string]$health.Headers['Cache-Control']
    MissingStatus = if ($missing) { [int]$missing.StatusCode } else { $null }
} | ConvertTo-Json
```

Hyväksy vain, kun:

- `/aloitus/` palauttaa 200 ilman ulkoista ohjausta ja pääbundle palauttaa 200;
- `/aloitus` tekee yhden 301-ohjauksen osoitteeseen `/aloitus/`;
- health palauttaa HTTP 200 sekä `status: ok`, `database: up`, `version: v1` ja `Cache-Control: no-store`;
- tarkoituksella puuttuva alipolku palauttaa Aloitussivun oman 404:n;
- selain näyttää etusivun, resurssit tulevat `/aloitus/assets/`-polusta eikä konsolissa ole P1-virhettä;
- yksi merkitty keinotekoinen lomakekirjoitus näkyy MariaDB:ssä;
- vähintään yksi hyväksytty admin pääsee ylläpitoon ja näytetty rooli vastaa provisiointia; passiivinen tai väärä rooli kokeillaan tuotannossa vain, jos sille on etukäteen sovittu erillinen testirivi (negatiivinen oikeuspolku on jo testattu stagingissa);
- WordPressin WP-01–WP-04-jälkisavukoe on PASS;
- riippumaton hyväksyjä vahvistaa tuloksen.

Poista keinotekoinen testirivi vain sovelluksen hyväksytyllä ylläpitotoiminnolla ja kirjaa poisto.

## Firestore-lukon tila GO-päätöksen jälkeen

Firestore-kirjoituslukko **jätetään voimaan**, kun Cloudcity-julkaisu hyväksytään. Näin vanhat Firebase-buildit eivät voi muodostaa rinnakkaista kirjoituslähdettä. Julkiset Firestore-lukureitit jäävät siirtymäajaksi käyttöön, mutta admin-only-luku ja kaikki kirjoitukset ovat kiinni.

Normaaleja `firestore.rules`-sääntöjä ei palauteta GO-tilanteessa. Ne palautetaan vain, jos tehdään nimenomainen Firebase-palautuspäätös.

## Palautus – käynnistä viimeistään klo 09.25

Palautuksen laukaisee mikä tahansa P1-smokevirhe, tietojen täsmäämättömyys, väärä kohde, kahden providerin kirjoitusmahdollisuus tai muutosikkunan ylitys ilman kirjattua jatkopäätöstä.

### 1. Sulje kirjoitukset ja talleta ongelmatila

- Älä palauta Firestore-sääntöjä vielä.
- Älä tee uusia Cloudcity-kirjoituksia.
- Ota Aloitussivun tuotanto-MariaDB:stä ongelmatilanteen varmistus yksityisesti.
- Älä koske WordPress-tietokantaan.

### 2. Poista julkinen hakemisto reitiltä palautettavasti

```bash
set -eu
REL11_PUBLIC_TARGET=/home/seniorsurffi/website.wp33403/aloitus
REL11_FAILED=/home/seniorsurffi/aloitus-failed-$(date +%Y%m%d-%H%M%S)

test "$(realpath "$REL11_PUBLIC_TARGET")" = "$REL11_PUBLIC_TARGET"
test ! -e "$REL11_FAILED"
mv "$REL11_PUBLIC_TARGET" "$REL11_FAILED"
test ! -e "$REL11_PUBLIC_TARGET"
echo "public_rollback=ok"
```

Tämä on palautettava siirto, ei poisto. Kun fyysinen hakemisto puuttuu, ennen julkaisua testattu WordPress-ohjaus voi jälleen käsitellä `/aloitus/`-osoitteen. Toista WP-01–WP-04 heti.

### 3. Valitse palautuksen tietolähde

- Jos julkista Cloudcityä ei ehditty avata kirjoituksille, pidä tuotanto-MariaDB tutkimusta varten muuttumattomana. Firestore on edelleen alkuperäinen totuuslähde.
- Jos Cloudcityyn syntyi oikeita käyttäjäkirjoituksia, älä avaa Firestorea ennen kuin kirjoitukset on inventoitu ja niiden käsittely päätetty. Automaattista takaisinpäin synkronointia ei tehdä.
- Vain jos Firebase-palautus hyväksytään, julkaise testattu `firebase-rollback`-frontend ja palauta normaalit Firestore-säännöt:

```powershell
firebase.cmd deploy --only firestore `
  --config firebase.json `
  --project aloitussivu-5d50c `
  --non-interactive
```

Odota sääntöjen leviämistä ja varmista yhdellä merkityllä keinotekoisella kirjoituksella, että vain Firebase-provider kirjoittaa. Cloudcity-providerin julkinen hakemisto pysyy poissa reitiltä.

### 4. Sulje palautus

- Varmista WordPress, valittu yksi provider, lomakekirjoitus ja admin-kirjautuminen.
- Kirjaa päätöksentekijä, aika, syy, julkisen epäonnistuneen hakemiston polku, tietokantavarmistuksen sijainti ja seuraava toimenpide.
- Älä lähetä julkaisuviestiä. Käytä valmista keskeytysviestiä.

## Ikkunan lopputietue

Täytä klo 09.25 mennessä:

- Päätös: `GO / ROLLBACK`
- Päätöksentekijä ja kellonaika: `täytetään`
- Riippumaton hyväksyjä: `täytetään`
- Full export SHA-256 ja `exceptionCount`: `täytetään`
- Audit-deltan `deltaSince`, SHA-256 ja `exceptionCount`: `täytetään`
- MariaDB-täsmäytys: `PASS / FAIL`
- Julkinen aktivointi ja smoke: `PASS / FAIL`
- WordPress-jälkisavukoe: `PASS / FAIL`
- Firestore-lukon tila: `LOCKED / RESTORED FOR ROLLBACK`
- Väliaikainen Admin SDK -avain mitätöity: `kyllä / ei`
- Julkaisu- tai keskeytysviesti lähetetty: `täytetään`
