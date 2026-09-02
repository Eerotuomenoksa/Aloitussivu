# REL-15 / v1.0.0 tuotantopäivitys

Päivitys viedään Eeron omalla SSH-yhteydellä. Tuotannon nykyinen versio 0.77.9 säilytetään palautettavana hakemistona. WordPressin tiedostoihin tai tietokantaan ei kosketa. Kellonajat ovat Europe/Helsinki-aikaa.

Tämä ajokirja noudattaa `rel12-v0750-tuotantopaivitys.md`:n rakennetta. Ensimmäisen tuotantovaihdon ajokirja `rel11-tuotantovaihto-2026-09-01.md` koskee Firestore-siirtoa eikä päde tähän: tuotanto on jo Cloudcityssä, joten tässä ei ole vientiä, kirjoituslukkoa eikä tietojen tuontia.

## Kuka tämän voi tehdä ja kuinka kauan siinä menee

Tämän voi tehdä yksin. Kaikki vaiheet ovat samoja kuin versioiden 0.77.8 ja 0.77.9 aktivoinneissa, ja tämä on niitä yksinkertaisempi: ei migraatioita, ei Firestore-vientiä, ei kirjoituslukkoa, ei asetusmuutoksia. Palautus on kaksi `mv`-komentoa.

Realistinen kesto keskeytyksettä noin **2–3 tuntia**, josta suurin osa on vaiheen 9 hyväksymiskokeita. Varaa aikaa neljä tuntia.

Tarvitset: Windows-työaseman (Linux-VM ei kelpaa, `vite build` kaatuu siellä rollupin natiivibinääriin), verkkoyhteyden, SSH-tunnuksen `seniorsurffi@seniorsurffi.ssh.cchosting.fi`, tietokannan tunnukset ja pääsyn phpMyAdminiin.

Yhtä asiaa et voi tehdä yksin: **TODO_HUMAN.md vaatii nimetyn riippumattoman hyväksyjän** loppuportin savukokeelle. Se on tuotepäätös, ei tekninen este — jos hyväksyjää ei ole, voit silti tehdä tämän teknisen päivityksen, mutta loppuportti jää auki ja se on kirjattava.

## Päivityksen sisältö

Työpuussa on **19 oikeasti muuttunutta tiedostoa** (`git diff --ignore-cr-at-eol --stat HEAD`). Ne ovat kolmesta eri asiasta:

1. **Uusi favicon** — `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`. Majakkatunnus VTKL:n violetilla ja oranssilla. `index.html` ja `site.webmanifest` ennallaan.
2. **Versionosto 1.0.0** — `package.json`, `package-lock.json`, `appVersion.ts`, `changelogData.ts`, `changelogHighlights.ts`, `scripts/bump-version.mjs`, `TODO_HUMAN.md`.
3. **TS-03 ja TS-04, jotka olivat työpuussa jo ennen tätä** — kuollut Gemini-koodi poistettu (`services/geminiService.ts`, `components/Assistant.tsx`, `components/NewsFeed.tsx`, `functions/gemini.ts`, `functions/index.ts`, `.env.example`) ja `services/data/providerConfig.ts`:n oletusprovideriksi vaihdettu `cloudcity`.

> **Huomaa:** tämä ei siis ole TODO_HUMAN.md:n tarkoittama "ominaisuuksia muuttamaton versionosto". Poistettua koodia ei renderöity missään ja `tsc --noEmit` menee puhtaana läpi, joten käyttäjälle näkyvää muutosta ei pitäisi olla — mutta poisto on silti mukana paketissa. Jos versio 1.0.0 halutaan viedä yksinään, TS-03/TS-04-muutokset on siirrettävä omaan haaraansa ennen paketointia.

**Tietokantamigraatioita ei tarvita tässä päivityksessä.** Migraatiot 001–007 ovat jo tuotannossa (viimeisimmät tulivat REL-14:n mukana). GDPR-korjauksen migraatio `008_usage_privacy_cleanup.sql` pitää ajaa erillisenä tietojen minimointina ennen uuden tilastointikoodin aktivointia. Paketti sisältää migraatiotiedostot 004–008, mutta niitä **ei ajeta automaattisesti**; ne ovat versionoituja ja kirjaavat itsensä `schema_migrations`-tauluun.

## Päätettävä ennen aloitusta

**Paketointiskriptin nimeäminen.** `scripts/build-production-path-package.ps1` käyttää nyt REL-15-leimaa: ZIP on `aloitussivu-rel15-v1.0.0-production-path.zip`, `build-info.json` sisältää `package: "REL-15"` ja `buildId: "REL-15-v1.0.0-<commit>"`, ja paketin `DEPLOY_INSTRUCTIONS.md` perustuu tähän tiedostoon.

- **Toteutus:** vaihtoehto B on tehty ennen ehdokkaan rakentamista. Paketin leima ja ohjetiedosto vastaavat nyt REL-15-julkaisua.

Suositus on B. Se on kolmen rivin muutos ja poistaa riskin, että palvelimella luetaan väärää ohjetta palautustilanteessa.

## Vaihe 1 — commit ja puhdas julkaisutyöpuu

Paketointiskripti kieltäytyy, jos `git status --porcelain` ei ole tyhjä (`Tuotantopolun paketti on rakennettava puhtaasta työpuusta`). Päätyöpuu **ei koskaan** ole puhdas: siinä on pysyvä CRLF-ajautuma, 1.9.2026 noin 215 tiedostoa jotka näkyvät muuttuneina vaikka sisältö on identtinen.

Tätä ei korjata julkaisupäivänä. Projektin vakiintunut tapa on rakentaa julkaisu **erillisessä git-työpuussa**, joka on puhdas rakenteeltaan. Niitä on jo kaksi:

```text
C:\dev\Aloitussivu.tmp\rel14-v0780-release      puhdas, node_modules on, .env.local PUUTTUU
C:\dev\Aloitussivu\.tmp\rel14-release-worktree  puhdas, node_modules ja .env.local on, haarassa codex/rel14-production
```

**Älä aja `git worktree prune`.** Molemmat on merkitty `prunable`, ja prune poistaisi ne rekisteristä.

### 1a. Committaa oikeat muutokset päätyöpuussa

19 tiedostoa on oikeasti muuttunut. Lisää ne nimeltä, niin CRLF-kohina jää committaamatta. `git add -A` tarvitaan poistettujen tiedostojen takia.

```powershell
Set-Location C:\dev\Aloitussivu

git add -A `
  appVersion.ts changelogData.ts changelogHighlights.ts `
  package.json package-lock.json scripts/bump-version.mjs `
  public/favicon.svg public/favicon-32.png public/apple-touch-icon.png `
  TODO_HUMAN.md README.md .env.example `
  services/data/providerConfig.ts services/geminiService.ts `
  components/Assistant.tsx components/NewsFeed.tsx `
  functions/gemini.ts functions/index.ts `
  docs/codex-tehtava-markkinointilinkit-src-2026-08-31.md `
  TYOJONO.md docs/rel15-v100-tuotantopaivitys.md database/maintenance

git status --short --cached
```

Staged-listassa pitää olla **täsmälleen** nämä: 15 `M`, 4 `D` ja uudet `A`-rivit (`TYOJONO.md`, `docs/rel15-…`, `database/maintenance/*`). Jos listassa on yhtään muuta, `git restore --staged <tiedosto>` ja tarkista uudelleen.

Halutessasi voit lisätä myös muut uudet dokumentit (`docs/a5-opastuskortti*`, `docs/kortin-kieliversiot-*`, `docs/tietosuoja-selkokieli-*`, `docs/codex-tehtava-tietosuoja-selkokieli-*`). Ne eivät vaikuta pakettiin. `output/playwright/`-kuvakaappaus kannattaa jättää pois tai lisätä `.gitignore`-tiedostoon.

```powershell
git commit -m "Julkaise versio 1.0.0 ja uusi majakkatunnus"
git rev-parse --short=12 HEAD
```

Kirjaa commit-tunniste ylös.

> `git`-komennot voivat tulostaa `.git/index.lock: Operation not permitted` -varoituksen. Komento onnistuu silti — tarkista tulos `git log --oneline -1`. Jos jokin oikeasti jumittuu, siirrä lukkotiedosto syrjään `mv`-komennolla (älä `rm`) ja yritä uudelleen.

### 1b. Vie commit julkaisutyöpuuhun

Nopea reitti, kun `C:\dev\Aloitussivu.tmp\rel14-v0780-release` on yhä olemassa:

```powershell
Copy-Item C:\dev\Aloitussivu\.env.local C:\dev\Aloitussivu.tmp\rel14-v0780-release\.env.local

Set-Location C:\dev\Aloitussivu.tmp\rel14-v0780-release
git checkout --detach main
git status --porcelain      # pitää olla TYHJÄ
git rev-parse --short=12 HEAD   # pitää olla sama kuin 1a:ssa
```

Jos työpuuta ei ole tai `git status` ei ole tyhjä, tee uusi. `npm ci` kestää muutaman minuutin.

```powershell
Set-Location C:\dev\Aloitussivu
git worktree add C:\dev\Aloitussivu.tmp\rel15-v100-release --detach main

Copy-Item C:\dev\Aloitussivu\.env.local C:\dev\Aloitussivu.tmp\rel15-v100-release\.env.local
Set-Location C:\dev\Aloitussivu.tmp\rel15-v100-release
npm.cmd ci
git status --porcelain      # pitää olla TYHJÄ
```

**Vaiheet 2 ja 3 ajetaan tässä julkaisutyöpuussa, ei `C:\dev\Aloitussivu`-hakemistossa.**

## Vaihe 2 — julkaisuportti

Aja kaikki Windowsilta. Linux-VM ei kelpaa: `node_modules/rollup` on asennettu Windowsille, joten `vite build` kaatuu siellä virheeseen `MODULE_NOT_FOUND`.

> **PowerShell ja npm.** Jos komento kaatuu virheeseen `npm.ps1 cannot be loaded because running scripts is disabled on this system`, käytä `npm.cmd`-muotoa kaikissa npm-komennoissa. `npm.cmd` on tavallinen komentotiedosto eikä osu suorituskäytäntöön. Vaihtoehto on avata istunnolle poikkeus komennolla `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, joka raukeaa kun ikkuna suljetaan. Paketointiskripti itse ajaa sisäisesti `npm.cmd`- ja `powershell -ExecutionPolicy Bypass` -komentoja, joten se toimii kummallakin tavalla.

Kaikki tämän vaiheen komennot ajetaan **julkaisutyöpuussa** (`C:\dev\Aloitussivu.tmp\rel14-v0780-release` tai `…\rel15-v100-release`), ei päätyöpuussa.

```powershell
npm.cmd run check:secrets
node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json
npm.cmd run test:link-policy
npm.cmd run test:link-catalog
```

Kaikkien pitää mennä läpi. `tsc` on jo ajettu puhtaana 1.9.2026 tämän työpuun sisällöllä.

PHP-sopimustestit (`api/tests/run.php`) koskevat tässä ehdokkaassa muuttunutta linkkitarkistuskoodia. Aja ne, jos työasemalla on PHP 8.4; muutoin tee vähintään vaiheen 6 palvelinpuolen `php -l`-tarkistukset ja kirjaa työaseman PHP:n puuttuminen.

## Vaihe 3 — ehdokkaan rakentaminen

Yhä julkaisutyöpuussa:

```powershell
npm.cmd run package:production-path
```

ZIP ja purettu paketti syntyvät **julkaisutyöpuun omaan** `.tmp`-hakemistoon, eivät `C:\dev\Aloitussivu\.tmp`-hakemistoon.

Skripti vaatii `.env.local`-tiedostosta seitsemän `VITE_FIREBASE_*`-arvoa ja tekee verkkovarmennuksen (`scripts/validate-firebase-config.mjs`), joten koneella pitää olla verkkoyhteys. Se ajaa `npm run build:cloudcity`, tarkistaa että bundlesta löytyy `/aloitus/api/v1` ja Firebase-julkiasetukset, ja varmistaa lopuksi ettei git-tila muuttunut paketoinnin aikana.

Tuloste antaa `BuildId`, `PackageDirectory`, `FileCount`, `Zip` ja `Sha256`. **Kirjaa SHA-256 talteen** — sitä verrataan palvelimella.

Paketin rakenne:

```text
wordpress_aloitus/     -> /home/seniorsurffi/website.wp33403/aloitus/
private_root/          -> /home/seniorsurffi/aloitus-production/
database_migrations/   -> ei ajeta tässä julkaisussa
build-info.json
DEPLOY_INSTRUCTIONS.md
```

Tarkista `build-info.json`: `package` on `REL-15`, `version` on `1.0.0` ja `commit` sama kuin vaiheessa 1. Tarkista myös, että faviconit tulivat mukaan:

```powershell
Get-ChildItem .tmp\rel15-v1.0.0-production-path-package\wordpress_aloitus\favicon.svg,
              .tmp\rel15-v1.0.0-production-path-package\wordpress_aloitus\favicon-32.png,
              .tmp\rel15-v1.0.0-production-path-package\wordpress_aloitus\apple-touch-icon.png |
  Select-Object Name, Length
```

PNG-tiedostojen pitää olla **999** ja **3588** tavua. Jos vanhat koot (4460 / 44755) näkyvät, `dist/` on vanha eikä buildi ajanut.

`favicon.svg`-tiedoston kokoa **ei saa verrata tavulukuun**: git muuntaa sen rivinvaihdot Windowsissa CRLF-muotoon, jolloin sama sisältö on 1023 tavua eikä 1002. Tarkista sisältö:

```powershell
Select-String -Path "$pkg\favicon.svg" -Pattern '#492280' -Quiet
```

Pitää tulostaa `True`. Vanhassa faviconissa ei ole VTKL:n violettia.

## Vaihe 4 — varmistukset palvelimella

Ennen mitään muutosta. Aja SSH:ssa.

```bash
set -eu
STAMP=$(date +%Y%m%d-%H%M%S)
PUBLIC=/home/seniorsurffi/website.wp33403/aloitus
PRIVATE=/home/seniorsurffi/aloitus-production

test -d "$PUBLIC"
test -d "$PRIVATE"

tar -czf "/home/seniorsurffi/rel15-varmistus-public-$STAMP.tar.gz" -C "$(dirname "$PUBLIC")" "$(basename "$PUBLIC")"
tar -czf "/home/seniorsurffi/rel15-varmistus-private-$STAMP.tar.gz" -C "$(dirname "$PRIVATE")" "$(basename "$PRIVATE")"

ls -la /home/seniorsurffi/rel15-varmistus-*-$STAMP.tar.gz
echo "varmistukset=ok stamp=$STAMP"
```

Ota lisäksi tietokantavarmistus. Se tarvitaan joka tapauksessa kävijätilastojen nollaukseen, ks. `database/maintenance/README.md`.

## Vaihe 5 — ehdokkaan siirto ja tarkistus

SSH- ja SCP-kohde on `seniorsurffi.ssh.cchosting.fi`; sen kotihakemistossa `/home/seniorsurffi/` ovat sekä staging että tuotanto.

Windowsin `scp` tulkitsee `C:`-kaksoispisteen etäosoitteen erottimeksi, joten siirry ensin paketin hakemistoon ja käytä suhteellista polkua.

```powershell
Set-Location C:\dev\Aloitussivu.tmp\rel15-v100-release\.tmp
scp .\aloitussivu-rel15-v1.0.0-production-path.zip `
  seniorsurffi@seniorsurffi.ssh.cchosting.fi:/home/seniorsurffi/aloitussivu-rel15-v1.0.0-production-path.zip
```

Avaa sitten SSH-yhteys:

```powershell
ssh seniorsurffi@seniorsurffi.ssh.cchosting.fi
```

```bash
sha256sum /home/seniorsurffi/aloitussivu-rel15-v1.0.0-production-path.zip
```

Vertaa tulostetta paikalliseen `Sha256`-arvoon. **STOP, jos ne eivät täsmää.**

Jokainen SSH-lohko on oma shellinsä, joten muuttujat eivät säily lohkojen välillä. Pura ehdokas yhdellä lohkolla ja **kirjaa tulosteen `polku=`-arvo ylös** — sitä tarvitaan vaiheissa 6 ja 7.

```bash
set -eu
ZIP=/home/seniorsurffi/aloitussivu-rel15-v1.0.0-production-path.zip
CANDIDATE=/home/seniorsurffi/rel15-production-candidate-$(date +%Y%m%d-%H%M%S)

test -f "$ZIP"
test ! -e "$CANDIDATE"
unzip -q "$ZIP" -d "$CANDIDATE"

cat "$CANDIDATE/build-info.json"
test -f "$CANDIDATE/wordpress_aloitus/index.html"
test -f "$CANDIDATE/wordpress_aloitus/.htaccess"
test -f "$CANDIDATE/wordpress_aloitus/api/index.php"
test -f "$CANDIDATE/wordpress_aloitus/favicon.svg"
test -f "$CANDIDATE/private_root/data/link-catalog.json"
test ! -f "$CANDIDATE/private_root/secrets/config.php"
grep -q '#492280' "$CANDIDATE/wordpress_aloitus/favicon.svg"
echo "ehdokas=ok polku=$CANDIDATE"
```

`test ! -f .../secrets/config.php` on tärkeä: paketti ei saa sisältää oikeaa asetustiedostoa, vain mallipohjan. Viimeinen rivi varmistaa, että mukana on uusi favicon: vanhassa ei ole VTKL:n violettia `#492280`. Tavukokoa ei verrata, koska git muuntaa SVG:n rivinvaihdot Windowsissa CRLF-muotoon (1023 tavua, sama sisältö).

## Vaihe 6 — yksityinen koodi

Yksityinen puoli päivitetään ensin. Kopio ei poista mitään, joten nykyinen `secrets/config.php`, lokit, välimuisti ja suojatut liitteet säilyvät.

```bash
set -eu
CANDIDATE=          # liita tahan vaiheen 5 tulosteen polku=-arvo
test -n "${CANDIDATE:-}" || { echo "STOP: CANDIDATE-polku puuttuu." >&2; exit 1; }
test -d "$CANDIDATE"
PRIVATE=/home/seniorsurffi/aloitus-production

test -f "$PRIVATE/secrets/config.php"
cp -a "$CANDIDATE/private_root/bootstrap.php" "$PRIVATE/"
cp -a "$CANDIDATE/private_root/src/." "$PRIVATE/src/"
cp -a "$CANDIDATE/private_root/cron/." "$PRIVATE/cron/"
cp -a "$CANDIDATE/private_root/data/." "$PRIVATE/data/"
cp -a "$CANDIDATE/private_root/secrets/config.production.example.php" "$PRIVATE/secrets/"

find "$PRIVATE" -type d -exec chmod 750 {} +
find "$PRIVATE" -type f -exec chmod 640 {} +
test "$(stat -c '%a' "$PRIVATE/secrets/config.php")" = 640
test -f "$PRIVATE/secrets/config.php"
echo "yksityinen=ok"
```

**Älä käytä `rsync --delete`-komentoa.** Se poistaisi `secrets/config.php`-tiedoston, jota paketissa ei ole.

Tarkista syntaksi:

```bash
/opt/alt/php84/usr/bin/php -l /home/seniorsurffi/aloitus-production/bootstrap.php
/opt/alt/php84/usr/bin/php -l /home/seniorsurffi/aloitus-production/src/PublicApi.php
/opt/alt/php84/usr/bin/php -l /home/seniorsurffi/aloitus-production/src/AdminApi.php
```

## Vaihe 7 — julkisen hakemiston vaihto

Vaihto tehdään kahdella nimeämisellä samassa tiedostojärjestelmässä. Katko on millisekunteja.

```bash
set -eu
STAMP=$(date +%Y%m%d-%H%M%S)
CANDIDATE=          # liita tahan vaiheen 5 tulosteen polku=-arvo
test -n "${CANDIDATE:-}" || { echo "STOP: CANDIDATE-polku puuttuu." >&2; exit 1; }
test -d "$CANDIDATE"
SOURCE="$CANDIDATE/wordpress_aloitus"
PARENT=/home/seniorsurffi/website.wp33403
TARGET="$PARENT/aloitus"
PREVIOUS="/home/seniorsurffi/aloitus-v0779-$STAMP"

test "$(realpath "$SOURCE")" = "$SOURCE"
test "$(realpath "$TARGET")" = "$TARGET"
test ! -e "$PREVIOUS"
test "$(stat -c '%d' "$SOURCE")" = "$(stat -c '%d' "$PARENT")"

find "$SOURCE" -type d -exec chmod 755 {} +
find "$SOURCE" -type f -exec chmod 644 {} +

mv "$TARGET" "$PREVIOUS"
mv "$SOURCE" "$TARGET"

test -f "$TARGET/index.html"
test -f "$TARGET/favicon.svg"
test -d "$PREVIOUS"
echo "aktivointi=ok edellinen=$PREVIOUS"
```

Kirjaa `$PREVIOUS`-polku ylös. Palautus tehdään sillä.

WordPress-juuren `.htaccess`-tiedostoon, WordPressin tietokantaan, teemaan, lisäosiin tai Redirection-sääntöihin ei kosketa.

## Vaihe 8 — kävijätilastojen nollaus

Jos tilastot nollataan tämän julkaisun yhteydessä, tee se **vasta kun vaihe 7 on PASS** — muuten palautustilanteessa nollataan tilastot turhaan. Ohje ja skripti: `database/maintenance/README.md` ja `database/maintenance/reset-usage-stats.sql`.

## Vaihe 9 — hyväksymiskokeet

### Tekninen savukoe

> **Mittari: `curl` palvelimelta tai PowerShell omalta koneelta.** Älä käytä Clauden hakutyökalua julkaisuportin mittarina. 1.9.2026 se palautti 404:n osoitteille `favicon.svg`, `muutosloki.html` ja `api/v1/health`, kun palvelimen oma `curl` palautti samoista osoitteista 200. Väärä hälytys johti tarpeettomaan palautukseen. Aja tämä **heti aktivoinnin jälkeen** SSH-istunnossa, ennen mitään muuta:

```bash
for u in / favicon.svg favicon-32.png apple-touch-icon.png muutosloki.html tietosuoja.html linkit.html saavutettavuus.html api/v1/health; do
  printf '%-24s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' https://seniorsurf.fi/aloitus/$u)"
done
```

Kaikkien pitää olla 200. `favicon.svg` tyyppinä `image/svg+xml`, `health` tyyppinä `application/json`.

```powershell
$home1 = Invoke-WebRequest -Uri 'https://seniorsurf.fi/aloitus/' -MaximumRedirection 0
$health = Invoke-WebRequest -Uri 'https://seniorsurf.fi/aloitus/api/v1/health' -MaximumRedirection 0
$healthJson = $health.Content | ConvertFrom-Json
$icon = Invoke-WebRequest -Uri 'https://seniorsurf.fi/aloitus/favicon.svg' -MaximumRedirection 0

[pscustomobject]@{
    HomeStatus  = [int]$home1.StatusCode
    HealthStatus = [int]$health.StatusCode
    ApiStatus   = $healthJson.status
    Database    = $healthJson.database
    ApiVersion  = $healthJson.version
    CacheControl = [string]$health.Headers['Cache-Control']
    FaviconStatus = [int]$icon.StatusCode
    FaviconOnUusi = $icon.Content -match '#492280'
} | ConvertTo-Json
```

Hyväksy vain kun:

- `/aloitus/` palauttaa 200 ilman ulkoista ohjausta
- health palauttaa 200 sekä `status: ok`, `database: up`, `version: v1` ja `Cache-Control: no-store`
- `favicon.svg` palauttaa 200 ja sen sisällössä on `#492280` (vanhassa faviconissa ei ole VTKL:n violettia). **Älä vertaa tavukokoa** — CRLF-muunnos tekee siitä 1023, ei 1002.
- tarkoituksella puuttuva alipolku palauttaa Aloitussivun oman 404:n

> `health`-vastauksen `version: v1` on **rajapinnan** sopimusversio, ei sovelluksen versio. Se pysyy `v1`:nä eikä kerro mitään 1.0.0:sta.

### Version varmistus

Sovellusversio näkyy Muutosloki-sivulla, joka on julkaisukandidaatissa piilotettu navigaatiosta mutta saavutettavissa suoralla osoitteella: `https://seniorsurf.fi/aloitus/muutosloki.html`. Sivun pitää näyttää **Versio 1.0.0** ja kärjessä kohta "Versio 1.0 ja uusi tunnus".

### Faviconin varmistus

Selaimet pitävät faviconeja omassa, sitkeässä välimuistissaan. `.htaccess` ei aseta niille `immutable`-otsaketta (se sääntö osuu vain tiivistenimisiin `/assets/`-tiedostoihin), joten uusi kuvake tulee kyllä läpi, mutta oman selaimen välilehdessä se voi näyttää vanhalta vielä hetken.

Tarkista siis näin, tässä järjestyksessä:

1. Avaa `https://seniorsurf.fi/aloitus/favicon.svg` suoraan — pitää näyttää majakka. Tämä on ainoa varma tarkistus.
   Vanha kuvake oli sininen pyöreä hymynaama, joten sekaannuksen vaaraa ei ole.
2. Sama osoitteille `favicon-32.png` ja `apple-touch-icon.png`.
3. Vasta sitten välilehden kuvake yksityisessä selainikkunassa.

Älä tulkitse vanhaa kuvaketta omassa välilehdessä julkaisuvirheeksi, jos kohdat 1–2 ovat kunnossa.

### Toiminnalliset kokeet

- etusivu latautuu, resurssit tulevat `/aloitus/assets/`-polusta, konsolissa ei P1-virhettä
- kotikunnan valinta ja Lähelläsi-osio toimivat
- palautelomakkeen lähetys onnistuu ja rivi näkyy MariaDB:ssä (poista testirivi hyväksytyllä ylläpitotoiminnolla ja kirjaa poisto)
- linkki-ilmoitus toimii
- ylläpidon Google-kirjautuminen onnistuu ja rooli näkyy oikein
- ylläpidon käyttötilastot ja automaattinen linkkitarkistus aukeavat
- alasivut fi/sv/en: tietosuoja, saavutettavuus, linkkiluettelo
- WordPress WP-01–WP-04 jälkisavukoe

## Palautus

Laukaisee mikä tahansa P1-virhe hyväksymiskokeissa.

```bash
set -eu
TARGET=/home/seniorsurffi/website.wp33403/aloitus
PREVIOUS=            # liita tahan vaiheen 7 tulosteen PALAUTUSPOLKU-arvo
FAILED=/home/seniorsurffi/aloitus-rel15-failed-$(date +%Y%m%d-%H%M%S)

# Lahde on tarkistettava ENNEN kuin kohdetta siirretaan mihinkaan.
test -n "${PREVIOUS:-}" || { echo "STOP: PALAUTUSPOLKU puuttuu." >&2; exit 1; }
test -d "$PREVIOUS"     || { echo "STOP: palautuslahdetta $PREVIOUS ei ole." >&2; exit 1; }
test -f "$PREVIOUS/index.html" || { echo "STOP: $PREVIOUS ei ole sovellushakemisto." >&2; exit 1; }
test -d "$TARGET"       || { echo "STOP: kohdetta ei ole; ala aja tata uudelleen." >&2; exit 1; }
test ! -e "$FAILED"     || { echo "STOP: $FAILED on jo olemassa." >&2; exit 1; }

mv "$TARGET" "$FAILED"
mv "$PREVIOUS" "$TARGET"
test -f "$TARGET/index.html"
echo "palautus=ok epaonnistunut=$FAILED"
```

> **Kaksi sudenkuoppaa, jotka kaatoivat tämän 1.9.2026.**
> Jos `mv`:n kohde on jo olemassa oleva hakemisto, lähde siirtyy **sen sisään** eikä sen tilalle. Siksi yllä on `test ! -e "$FAILED"`.
> Aikaleima `$(date …)` ei laajene, jos komento päätyy shelliin ilman komentosubstituutiota. Siksi lähde tarkistetaan erikseen, eikä nimen yksilöivyyteen luoteta.
> **Tätä lohkoa ei ajeta kahdesti.** Toinen ajo siirtäisi juuri palautetun version pois eikä löytäisi enää lähdettä.

Yksityinen puoli palautetaan vaiheen 4 tarballista, jos ongelma on API:ssa:

```bash
tar -xzf /home/seniorsurffi/rel15-varmistus-private-VAIHDA_STAMP.tar.gz -C /home/seniorsurffi/
```

Tietokantaan ei kosketa palautuksessa. Migraatioita ei ajettu, joten skeema on sama kuin ennen päivitystä, ja 0.77.9 toimii sillä sellaisenaan.

Jos tilastot ehdittiin nollata ennen palautusta, palauta ne vaiheen 4 mysqldump-varmistuksesta.

## Muista julkaisun jälkeen

- Kirjaa `docs/julkaisupaivakirja-2026-09.md`-tiedostoon: aika, buildId, SHA-256, edellisen version polku, hyväksymiskokeiden tulos.
- Päivitä `TODO_HUMAN.md`: tuotannon versio 0.77.9 -> 1.0.0.
- Päivitä `TYOJONO.md`: tilastonollauksen rivi.
- **1.0.0 tuotannossa ei ole sama asia kuin tiedotuksen GO.** WordPress-esittelysivun painikkeen `href` ja KO-01-selosteen hyväksyntä ovat yhä auki, ja loppuportti vaatii nimetyn riippumattoman hyväksyjän.
