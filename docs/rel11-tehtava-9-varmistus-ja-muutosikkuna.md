# REL-11 tehtävä 9/10 – varmistus, delta ja muutosikkuna

Päivitetty 27.8.2026. Tämä on valmisteluohje ensi viikon tuotantovaihdolle. Ohjeen tekeminen ei muuta Cloudcityä, WordPressiä, Firestorea tai MariaDB:tä.

## Nykyinen paikallinen näyttö

- `npm run rel08:test`: PASS 27.8.2026.
- `scripts/rel08-export-firestore.mjs`, `rel08-build-import.mjs`, `rel08-migration-lib.mjs` ja `rel08-migration-test.mjs`: Node-syntaksi PASS.
- `npm run check:secrets`: PASS.
- Viimeisin tuotantopolun koepaketti on `REL-11-v0.74.5-3f6d9c6ff403`, 115 tiedostoa, SHA-256 `c85852e1e59581b41b9d113565c124719ddb16b37e4c913e3afe8f07fd76e160`.
- Deploy-inputit vastaavat stagingissa testattua sovelluskoodia `d5c4ea9ac2b8`. Jos jokin deploy-inputti muuttuu, paketti rakennetaan ja testataan uudelleen.

Oikea Firestore-delta, julkaisuhetken varmistukset ja vastuuhenkilöiden hyväksyntä ovat vielä avoinna.

## Julkaisupäivän järjestys

1. Vahvista muutosikkunan alkamis- ja päättymisaika sekä kaikki vastuuhenkilöt.
2. Toista WordPressin ennen-savukoe WP-01–WP-04.
3. Ota nykyisestä staging-versiosta uusi tiedostovarmistus ja uusi MariaDB-varmistus.
4. Varmista tuotantotietokannan kohde, migraatiot ja vähimmän oikeuden käyttäjä.
5. Aloita kirjoituskatko ja ota lopullinen Firestore-vienti sekä delta.
6. Rakenna tuontiaineisto, tarkista `exceptionCount = 0` ja täsmäytä lukumäärät sekä tiivisteet.
7. Tuo delta MariaDB:hen vain vahvistettuun Aloitussivun tuotantotietokantaan.
8. Vie hyväksytty julkinen ja yksityinen tuotantopaketti niiden omiin hakemistoihin.
9. Aja `/aloitus/`-, API-, resurssi-, 404-, lomake-, ylläpito- ja WordPress-smoke.
10. Avaa kirjoitukset vain Cloudcity-provideriin. Lähetä julkaisuviesti vasta hyväksytyn REL-12-smoken jälkeen.

## Lopullinen staging-tiedostovarmistus SSH:ssa

Valitse uusi aikaleima. Seuraavat komennot vain lukevat nykyisiä tiedostoja ja luovat uuden arkiston käyttäjän yksityiseen kotihakemistoon.

```bash
pwd
realpath /home/seniorsurffi/website.aloitussivu-staging

REL11_STAMP=YYYYMMDD-HHMM
REL11_BACKUP=/home/seniorsurffi/rel11-v0745-final-staging-files-${REL11_STAMP}.tar.gz

test ! -e "$REL11_BACKUP" && tar \
  -C /home/seniorsurffi/website.aloitussivu-staging \
  -czf "$REL11_BACKUP" \
  bootstrap.php src cron public_html build-info.json

ls -lh "$REL11_BACKUP"
sha256sum "$REL11_BACKUP"
```

Hyväksy vain, jos `realpath` palauttaa täsmälleen `/home/seniorsurffi/website.aloitussivu-staging`, arkisto syntyy uutena ja SHA-256 saadaan laskettua. Kirjaa julkiseen päiväkirjaan vain aika, sijainti, koko ja tiiviste; älä arkiston sisältöä.

## Lopullinen MariaDB-varmistus

1. Ota Cloudcityn tai phpMyAdminin kautta uusi vienti Aloitussivun staging-tietokannasta.
2. Varmista tietokannan nimi ennen vientiä. Älä valitse WordPressin tietokantaa.
3. Säilytä SQL repositorion ja pilvisynkronoitujen kansioiden ulkopuolella.
4. Kirjaa yksityiseen ylläpitolokiin aika, 15 taulun määrä, tiedoston koko ja SHA-256.
5. Älä kopioi SQL-sisältöä, tietokantatunnusta tai tiivistettä julkiseen keskusteluun.

Varmistus pitää uusia julkaisuikkunassa. Elokuun 26. päivän varmistus säilyy palautusnäyttönä, mutta se ei yksin riitä ensi viikon viimeiseksi palautuspisteeksi.

## Firestore-delta käyttäjän omassa PowerShellissä

Admin SDK -avainta ei anneta AI-agentille, tallenneta repoon tai kopioida keskusteluun. Käytä uutta väliaikaista avainta vain nykyisessä PowerShell-prosessissa ja mitätöi se heti hyväksytyn viennin jälkeen.

```powershell
Set-Location C:\dev\Aloitussivu

$rel11Private = Join-Path $env:LOCALAPPDATA 'Aloitussivu-REL11-private'
New-Item -ItemType Directory -Path $rel11Private -ErrorAction Stop -Force | Out-Null

$env:GOOGLE_APPLICATION_CREDENTIALS = Join-Path $rel11Private 'firebase-admin-rel11.json'
if (-not (Test-Path -LiteralPath $env:GOOGLE_APPLICATION_CREDENTIALS)) {
    throw 'Admin SDK -avaintiedostoa ei löytynyt.'
}

$rel11Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$deltaFile = Join-Path $rel11Private "firestore-export-delta-$rel11Stamp.json"
$importDir = Join-Path $rel11Private "import-delta-$rel11Stamp"

npm run rel08:export -- `
  --project-id aloitussivu-5d50c `
  --output $deltaFile `
  --since '2026-08-24T09:00:00Z'

npm run rel08:build-import -- `
  --input $deltaFile `
  --output-dir $importDir

$report = Get-Content -Raw -LiteralPath (Join-Path $importDir 'reconciliation-report.json') | ConvertFrom-Json
$exceptions = Get-Content -Raw -LiteralPath (Join-Path $importDir 'exceptions.json') | ConvertFrom-Json

[pscustomobject]@{
    ProjectId = $report.projectId
    DeltaSince = $report.deltaSince
    ExportSha256 = $report.exportSha256
    ExceptionCount = @($exceptions).Count
    SourceCounts = $report.sourceCounts
    TransformedCounts = $report.transformedCounts
} | ConvertTo-Json -Depth 5

$env:GOOGLE_APPLICATION_CREDENTIALS = $null
```

Hyväksymisehdot:

- projektitunnus on `aloitussivu-5d50c`;
- `deltaSince` on `2026-08-24T09:00:00.000Z`;
- `ExceptionCount` on 0;
- lähde- ja muunnetut lukumäärät ovat järkevät;
- `import.sql`, `verify.sql` ja `reconciliation-report.json` syntyvät uuteen yksityiseen hakemistoon;
- mitään ei kirjoiteta MariaDB:hen tämän rakennusvaiheen aikana.

Koska Firestore ei anna poistojen aikaleimaa, lopullisessa vaihdossa tarvitaan lisäksi kirjoituskatkon aikana täysi tunnistejoukon vertailu. Pelkkä delta ei riitä poistojen täsmäytykseen.

## Muutosikkuna ja vastuut

Täytä ja hyväksytä ennen PRE-07:n PASS-merkintää:

| Vastuu | Ehdotettu henkilö tai taho | Vahvistettu |
| --- | --- | --- |
| Go/no-go-päätös ja kirjoituskatko | Eero Tuomenoksa |  |
| WordPress-esittelysivun julkaisu | Eero Tuomenoksa |  |
| SSH-tiedostovarmistus ja paketinvaihto | Eero Tuomenoksa |  |
| MariaDB-varmistus, migraatio ja palautus | Eero Tuomenoksa |  |
| Varahenkilö ja palautuspäätöksen tuki | Nina Ziessler |  |
| WordPress- ja Cloudcity-tuki | Fakiirimedia |  |
| Riippumaton smoke-hyväksyntä | nimetään |  |

- Muutosikkunan päivämäärä: `täytetään`
- Aloitusaika Europe/Helsinki: `täytetään`
- Viimeinen hyväksytty lopetusaika: `täytetään`
- Ensimmäisen smoken kellonaika: `täytetään`
- Palautuksen käynnistäjä: `täytetään`

Suunniteltu kirjoituskatko on enintään 25 minuuttia:

1. **T−15:** ilmoitus, vastuut ja palautuspiste.
2. **T0:** kirjoitukset kiinni.
3. **T+2:** lopullinen vienti ja tunnistejoukon vertailu.
4. **T+7:** delta rakennettu ja tuotu.
5. **T+12:** täsmäytys ja yksityisyystarkistus.
6. **T+17:** paketti käyttöön ja smoke.
7. **T+22:** kirjoitukset auki vain Cloudcity-provideriin.
8. **T+25:** ikkuna päätetään tai palautus käynnistetään.

## Pysäytysehdot

Käynnistä palautusarvio heti, jos yksikin toteutuu:

- `exceptionCount` ei ole 0 tai rivimäärät/tiivisteet eivät täsmää;
- väärä tietokanta, hakemisto, commit, build tai ZIP-tiiviste havaitaan;
- `/aloitus/`, pääbundle tai health ei palauta HTTP 200:aa;
- health ei palauta `ok/up/v1` tai `Cache-Control: no-store` puuttuu;
- osoite vaihtuu alidomainiin, syntyy ohjaussilmukka tai WordPress kaappaa `/aloitus/`-reitin;
- WordPressin WP-01–WP-04-jälkeen-savukoe epäonnistuu;
- kirjoituksia syntyy samanaikaisesti Firestoreen ja Cloudcityyn;
- 25 minuutin kirjoituskatko ylittyy ilman erikseen hyväksyttyä jatkopäätöstä.

Palautuksessa pidä kirjoitukset suljettuina, ota muutostilanteesta uusi Aloitussivun MariaDB-varmistus, palauta vain Aloitussivun täsmällisesti nimetyt tiedosto- ja tietokantakohteet ja toista WordPress-savukoe. Älä palauta WordPressin tietokantaa Aloitussivun virheen vuoksi.

## Valmiit viestiluonnokset

Näitä ei lähetetä ennen REL-12-smoken hyväksyntää.

**Julkaisu hyväksytty**

> Seniorin aloitussivu on julkaistu osoitteessa https://seniorsurf.fi/aloitus/. Julkaisun jälkeiset tekniset ja WordPress-savukokeet on hyväksytty.

**Julkaisu keskeytetty**

> Seniorin aloitussivun julkaisu keskeytettiin tarkistuksessa havaitun poikkeaman vuoksi. Palvelua ei avata ennen palautuksen ja uusintatestien hyväksyntää.
