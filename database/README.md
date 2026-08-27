# Aloitussivun MariaDB-migraatiot

Migraatiot ajetaan erikseen staging- ja tuotantotietokantaan. Sovelluksen normaalilla tietokantakäyttäjällä ei ole DDL-oikeuksia; migraatiot ajetaan erillisillä ylläpito-oikeuksilla.

## Käyttöperiaatteet

- Aja tiedostot nousevassa nimijärjestyksessä vain kerran tietokantaa kohden.
- Migraation suoritus kirjataan `schema_migrations`-tauluun.
- Yhteyden aikavyöhyke asetetaan API:ssa UTC:ksi jokaisen PDO-yhteyden alussa ennen luku- ja kirjoitusoperaatioita (`SET time_zone = '+00:00'`). CloudCityn MariaDB-palvelimen oletusistunto on EEST (`SYSTEM`), joten tähän ei saa luottaa palvelimen oletusasetuksena.
- Liitteiden sisältöä, tietokantatunnuksia, salasanoja tai raakamuotoisia IP-osoitteita ei tallenneta tietokantaan.
- `url_hash` ja `bucket_hash` ovat sovelluksen SHA-256-tiivisteitä; ne eivät ole palautettavia URL- tai IP-arvoja.

Ensimmäinen migraatio on [001_initial_schema.sql](migrations/001_initial_schema.sql).

## Ylläpitäjäroolien provisiointi

`admin_users` on ympäristökohtaista käyttöoikeusdataa, eikä ylläpitäjien UID:itä tai sähköposteja lisätä versionoituun migraatioon. Staging- ja tuotantorivit luodaan erikseen turvallisessa tietokannan ylläpitoistunnossa vasta, kun Firebase Consolesta on tarkistettu käyttäjän UID ja vahvistettu sähköposti.

Kopioi [admin-provisioning-input.example.json](admin-provisioning-input.example.json) repositorion ulkopuoliseen yksityiseen hakemistoon, korvaa malliarvot ja rakenna SQL uuteen yksityiseen hakemistoon:

```powershell
$rel11Private = Join-Path $env:LOCALAPPDATA 'Aloitussivu-REL11-private'
$inputFile = Join-Path $rel11Private 'production-admins.json'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputDir = Join-Path $rel11Private "production-admins-$stamp"

npm run rel11:build-admin-provisioning -- `
  --input $inputFile `
  --output-dir $outputDir
```

Generaattori hyväksyy vain projektin `aloitussivu-5d50c`, ympäristön `production`, roolit `admin`, `editor` ja `viewer` sekä erikseen annetun `active`-totuusarvon. Se estää saman UID:n tai sähköpostin toistumisen, kieltäytyy kirjoittamasta repositorion sisään eikä tulosta tunnisteita tai sähköposteja konsoliin. SQL käyttää UTF-8-heksalitteraaleja, joten erikoismerkkejä ei yhdistetä SQL-syntaksiin. Ristiriita, jossa sama sähköposti kuuluisi tietokannassa eri UID:lle, näkyy ennakkotarkistuksessa eikä provisiointi muuta ristiriitaista riviä.

1. Suorita `preflight-admins.sql` vain oikeassa Aloitussivun tuotantotietokannassa. `conflicting_email_assignments`-arvon pitää olla 0.
2. Suorita vasta sitten `provision-admins.sql` ylläpito-oikeudella.
3. Suorita `verify-admins.sql`. Sekä `expected_accounts_found`- että `expected_accounts_matching`-arvon pitää olla sama kuin `summary.json`-tiedoston `adminCount`; muut tulokset näyttävät vain rooli- ja aktiivisuuslukumääriä.
4. Testaa jokainen rooli oikealla allekirjoitetulla Firebase-kirjautumisella ennen julkaisua.

Älä tallenna täytettyä JSONia, muodostettua SQL:ää, tietokantavientiä tai käyttäjälistaa Git-repositorioon. Oikeus poistetaan käytöstä muodostamalla samalle UID:lle uusi yksityinen aineisto arvolla `active: false` ja ajamalla sen SQL; älä kirjoita käsin henkilötietoja komentohistoriaan. API tarkistaa jokaisella ylläpitopyynnöllä allekirjoitetun Firebase-tokenin UID:n, rivin aktiivisuuden ja roolin. UID on oikeuspäätöksen ensisijainen tunniste; tokenin valinnaisten sähköposti- tai provider-väitteiden puuttuminen ei estä ennalta provisioitua UID:tä. Selaimen sähköpostia ei hyväksytä oikeusväitteeksi.
