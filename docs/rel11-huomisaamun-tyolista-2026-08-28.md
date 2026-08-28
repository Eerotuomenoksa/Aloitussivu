# REL-11 huomisaamun työlista 28.8.2026

Tavoite on avata `https://seniorsurf.fi/aloitus/` pehmeästi perjantaina 28.8.2026 ja tehdä laaja tiedotus vasta maanantaina 1.9.2026 klo 09.00. Huomisen avaus on oikea tuotantovaihto, joten yksikään kova GO-ehto ei muutu vapaaehtoiseksi.

## Valmiina tältä illalta

- Versio 0.74.6 ja build `REL-11-v0.74.6-d010d2954873` ovat paikallisesti valmiit.
- Staging- ja tuotantopolun ZIPit on rakennettu ja varmennettu.
- TypeScript, salaisuustarkistus, staging-, Cloudcity- ja Firebase-palautusbuildit, API-testit 46/46 sekä paketin PHP-lint 43/43 ovat PASS.
- Hidas, onnistuva, tyhjä ja virheellinen huijausvaroitusvastaus on testattu paikallisessa selaimessa. Muu sivu pysyi käytettävissä.
- Vanhaa version 0.74.5 tuotantopakettia ei aktivoida.

## Aamun etenemisjärjestys

### 1. Klo 08.00–08.10: paikallinen tarkistus

```powershell
Set-Location C:\dev\Aloitussivu
powershell -ExecutionPolicy Bypass -File .\scripts\rel11-morning-preflight.ps1
```

Odotus: staging ja production-path ovat molemmat `PASS`.

Toteutunut 28.8.2026: **PASS**. Molemmat paketit vastasivat buildia `REL-11-v0.74.6-d010d2954873`, tiedostomäärä oli 115 ja SHA-256-tiivisteet täsmäsivät.

### 2. Klo 08.10–08.20: API-käyttäjän portti

Cloudcity vahvisti 28.8.2026, ettei samaan tietokantaan saa erillisiä käyttäjiä eri oikeuksilla. Tuotevastuu hyväksyi tiedostoon `rel11-tietoturvapoikkeus-api-kayttaja-2026-08-28.md` kirjatun poikkeuksen ja ainoan käyttäjän käyttämisen API:ssa.

Varmista vielä `SHOW GRANTS` -tuloksesta:

- globaali oikeus on vain `USAGE`;
- `ALL PRIVILEGES` kohdistuu täsmälleen kantaan `dbtqq_aloitussivu_prod`;
- `GRANT OPTION` -oikeutta tai oikeuksia WordPressin ja muiden palveluiden kantoihin ei ole.

STOP, jos rajaus ei täyty. Tietokantakohtainen `ALL PRIVILEGES` hyväksytään vain dokumentoidulla poikkeuksella.

Toteutunut 28.8.2026: **PASS poikkeuksella**. Aiemmin toimitettu `SHOW GRANTS` sisälsi globaalin `USAGE`-oikeuden ja tietokantakohtaisen `ALL PRIVILEGES` -oikeuden vain kantaan `dbtqq_aloitussivu_prod`; `GRANT OPTION`- tai muiden kantojen oikeuksia ei näkynyt. Seuraava tuotantoportti on `config.php` ja `database=up`.

Kun käyttäjä on hyväksytty, tee tuotannon yksityinen `config.php` tiedoston `rel11-tuotantovaihto-2026-09-01.md` kohdan **API-konfiguraatio SSH:ssa** mukaan. Varmista tiedosto-oikeus 640 ja `database=up`. Älä kopioi tunnuksia tai asetustiedoston sisältöä keskusteluun.

### 3. Klo 08.20 alkaen: versio 0.74.6 stagingiin

Noudata tiedostoa `rel11-staging-vienti-2026-08-28.md`. Tee stagingin tiedostovarmistus, varmista ZIPin SHA-256, pura paketti ja tee vaikutusaluetesti.

Stagingin pitää olla PASS ennen tuotantopaketin esivientiä. Aikataulu siirtyy automaattisesti, jos testiä ei saada valmiiksi klo 09.00 mennessä.

Toteutunut 28.8.2026: **PASS**. Build, commit, pääbundle ja API-health täsmäsivät; selainvaikutusalue hyväksyttiin tuloksella `STAGING_UI=PASS`.

### 4. Valmiusportti stagingin jälkeen

Vahvista ennen tuotannon kirjoituslukkoa:

- tietoturvapoikkeuksen mukainen `SHOW GRANTS` sekä `database=up`;
- version 0.74.6 staging-uusinta PASS;
- tuotannon admin-roolit henkilötiedottomasti täsmäytetty;
- tuore staging- ja tuotantotietokannan varmistus kirjattu yksityiseen lokiin;
- Firestore-kirjoituslukon ja normaalisäännön `--dry-run` PASS;
- riippumaton smoke-hyväksyjä ja palautustuki tavoitettavissa;
- tuotantopolun ZIP palvelimella, tiiviste täsmää ja uusi ehdokashakemisto on varmennettu;
- WordPressin ennen-savukoe PASS.

Jos yksikin kohta puuttuu, älä aloita Firestore-kirjoituslukkoa. Pehmeä avaus voidaan siirtää myöhempään kellonaikaan ilman, että 1.9. tiedotusaikaa vielä muutetaan.

### 5. Tuotantovaihto

Käytä `rel11-pehmea-avaus-2026-08-28.md`-tiedoston aikataulua ja `rel11-tuotantovaihto-2026-09-01.md`-tiedoston vaiheiden järjestystä. Älä aja jälkimmäisen vanhoja version 0.74.5 polkuja sisältäviä komentolohkoja.

Uuden tuotantopaketin paikallinen tunniste on:

```text
C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-production-path.zip
824586 tavua
SHA-256 97006ada23b3c32626fbe40160d8b74933a01f1081be71aada97bb6245e162e4
```

Kun paketti on siirretty palvelimelle, kirjaa sen täsmällinen palvelinpolku ja uuden erillisen ehdokashakemiston polku ennen aktivointikomentojen muodostamista. Julkista `/home/seniorsurffi/website.wp33403/aloitus/`-hakemistoa ei luoda ennen lopullisen MariaDB-tuonnin PASS-tulosta.

## Valmis tulosyhteenveto, jonka voit lähettää minulle

Älä lähetä salasanoja, sähköposteja, UID-tunnisteita, SQL-sisältöä tai asetustiedostoa. Riittää:

```text
PREFLIGHT=PASS/FAIL
API_GRANTS=PASS/FAIL/ODOTTAA
DATABASE_CONNECTION=PASS/FAIL/ODOTTAA
STAGING_BUILD=REL-11-v0.74.6-d010d2954873 tai FAIL
STAGING_HEALTH=ok/up/v1 tai FAIL
STAGING_UI=PASS/FAIL
STAGING_BACKUP=/home/seniorsurffi/...tar.gz
SMOKE_HYVAKSYJA=NIMETTY/PUUTTUU
PALAUTUSTUKI=VALMIS/PUUTTUU
```

Näiden perusteella voidaan tehdä huomisen GO/NO-GO-päätös ja muodostaa uuden tuotantoehdokkaan täsmälliset SSH-komennot.

## Maanantai 1.9.

Klo 08.30 tehdään uusi vain lukeva health-, etusivu-, huijausvaroitus-, sää-, paikallisuutis-, admin- ja WordPress-tarkistus. Laaja tiedotus lähtee klo 09.00 vain PASS-tuloksella.
