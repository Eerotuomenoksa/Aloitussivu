# REL-11 version 0.74.6 staging-vienti 28.8.2026

Tämä ohje koskee vain ehdokasta `REL-11-v0.74.6-d010d2954873`. Aja komennot yksi lohko kerrallaan. Älä kopioi tietokantatunnuksia, Basic Auth -tunnuksia tai muita salaisuuksia keskusteluun.

| Kenttä | Arvo |
| --- | --- |
| Paikallinen ZIP | `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip` |
| ZIP palvelimella | `/home/seniorsurffi/aloitussivu-rel11-v0746-staging.zip` |
| Koko | 838175 tavua |
| SHA-256 | `1d05240c75ad46095829f6830103db9c6176f08cb188776dc01de3e4ed758ebe` |
| Tiedostoja | 115 |
| Pääbundle | `assets/main-NYkkJV2H.js` |

Paketti ei sisällä oikeaa `secrets/config.php`-tiedostoa eikä muuta staging-tietokantaa.

## 1. Paikallinen ennakkotarkistus

Avaa PowerShell 7 hakemistossa `C:\dev\Aloitussivu`:

```powershell
Set-Location C:\dev\Aloitussivu
powershell -ExecutionPolicy Bypass -File .\scripts\rel11-morning-preflight.ps1
```

Jatka vain, jos molempien pakettien tulos on `PASS`.

## 2. Siirrä staging-ZIP

```powershell
scp 'C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip' seniorsurffi@staging.aloitussivu.seniorsurf.fi:/home/seniorsurffi/aloitussivu-rel11-v0746-staging.zip
```

Kirjaudu siirron jälkeen SSH:lla:

```powershell
ssh seniorsurffi@staging.aloitussivu.seniorsurf.fi
```

## 3. Palvelimen turvallinen ennakkotarkistus ja varmistus

Aja SSH-istunnossa:

```bash
set -eu
REL11_STAGING_ROOT=/home/seniorsurffi/website.aloitussivu-staging
REL11_STAGING_ZIP=/home/seniorsurffi/aloitussivu-rel11-v0746-staging.zip
REL11_STAGING_BACKUP=/home/seniorsurffi/rel11-v0745-pre-v0746-staging-files-$(date +%Y%m%d-%H%M%S).tar.gz

test "$(whoami)" = seniorsurffi
test "$(realpath "$REL11_STAGING_ROOT")" = /home/seniorsurffi/website.aloitussivu-staging
test -f "$REL11_STAGING_ZIP"
test -f "$REL11_STAGING_ROOT/secrets/config.php"
test "$(sha256sum "$REL11_STAGING_ZIP" | awk '{print $1}')" = 1d05240c75ad46095829f6830103db9c6176f08cb188776dc01de3e4ed758ebe
test "$(stat -c '%s' "$REL11_STAGING_ZIP")" = 838175
unzip -tq "$REL11_STAGING_ZIP"
if unzip -Z1 "$REL11_STAGING_ZIP" | grep -qx 'secrets/config.php'; then
  echo 'BLOCKED: ZIP sisältää oikean config.php-polun.' >&2
  exit 1
fi

REL11_CONFIG_SHA_BEFORE=$(sha256sum "$REL11_STAGING_ROOT/secrets/config.php" | awk '{print $1}')
tar -C "$REL11_STAGING_ROOT" -czf "$REL11_STAGING_BACKUP" bootstrap.php src cron public_html build-info.json
test -s "$REL11_STAGING_BACKUP"
chmod 640 "$REL11_STAGING_BACKUP"

printf 'BACKUP=%s\n' "$REL11_STAGING_BACKUP"
sha256sum "$REL11_STAGING_BACKUP"
```

STOP, jos jokin `test` tai `unzip` epäonnistuu. Kirjaa `BACKUP`-polku ja tiiviste yksityiseen ylläpitolokiin.

## 4. Pura uusi ehdokas stagingiin

Tämä lohko on itsenäinen ja sen voi ajaa turvallisesti uudessa SSH-istunnossa myös silloin, jos aikaisempi istunto katkesi. ZIP ei sisällä oikeaa `secrets/config.php`-tiedostoa. Sulut ajavat tarkistukset alishellissä, joten virhe pysäyttää lohkon mutta ei sulje SSH-yhteyttä.

```bash
(
set -eu
REL11_STAGING_ROOT=/home/seniorsurffi/website.aloitussivu-staging
REL11_STAGING_ZIP=/home/seniorsurffi/aloitussivu-rel11-v0746-staging.zip

test "$(realpath "$REL11_STAGING_ROOT")" = /home/seniorsurffi/website.aloitussivu-staging
test -f "$REL11_STAGING_ZIP"
test -f "$REL11_STAGING_ROOT/secrets/config.php"
test "$(sha256sum "$REL11_STAGING_ZIP" | awk '{print $1}')" = 1d05240c75ad46095829f6830103db9c6176f08cb188776dc01de3e4ed758ebe
find /home/seniorsurffi -maxdepth 1 -type f -name 'rel11-v0745-pre-v0746-staging-files-*.tar.gz' -print -quit | grep -q .
if unzip -Z1 "$REL11_STAGING_ZIP" | grep -qx 'secrets/config.php'; then
  echo 'BLOCKED: ZIP sisältää oikean config.php-polun.' >&2
  exit 1
fi

REL11_CONFIG_SHA_BEFORE=$(sha256sum "$REL11_STAGING_ROOT/secrets/config.php" | awk '{print $1}')
unzip -oq "$REL11_STAGING_ZIP" -d "$REL11_STAGING_ROOT"

test "$(sha256sum "$REL11_STAGING_ROOT/secrets/config.php" | awk '{print $1}')" = "$REL11_CONFIG_SHA_BEFORE"
test "$(stat -c '%a' "$REL11_STAGING_ROOT/secrets/config.php")" = 640
grep -F '"buildId": "REL-11-v0.74.6-d010d2954873"' "$REL11_STAGING_ROOT/build-info.json"
grep -F '"commit": "d010d2954873"' "$REL11_STAGING_ROOT/build-info.json"
grep -F '"workingTreeDirty": false' "$REL11_STAGING_ROOT/build-info.json"
grep -F 'assets/main-NYkkJV2H.js' "$REL11_STAGING_ROOT/public_html/index.html"
/opt/alt/php84/usr/bin/php -l "$REL11_STAGING_ROOT/bootstrap.php"

echo 'staging_files=ok'
)

curl -sS -w '\nHTTP_STATUS=%{http_code}\n' https://staging.aloitussivu.seniorsurf.fi/api/v1/health
```

Ensimmäisen lohkon pitää päättyä arvoon `staging_files=ok`. Health-vastauksen pitää sisältää `status: ok`, `database: up` ja `version: v1`. Jos curl palauttaa HTTP 401:n, stagingin Basic Auth on käytössä: tee health-tarkistus selaimen kirjautuneessa istunnossa tai anna tunnukset curl-komennolle paikallisesti; älä kirjoita niitä tähän ohjeeseen tai keskusteluun.

## 5. Selaimen vaikutusaluetesti

Tarkista stagingissa vähintään:

1. Footerissa näkyvät vuosiluku ja osoite `seniorsurf.fi/aloitus`. Versionumero ei kuulu nykyiseen julkiseen footeriin; varmista versio palvelimen `build-info.json`-tiedostosta ja pääbundlen nimestä kohdan 4 mukaisesti.
2. Otsikko, sää, Google-haku, sisältövalikko ja palvelukategoriat näkyvät heti.
3. Huijausvaroituslaatikossa näkyy hitaalla yhteydellä `Ladataan huijausvaroituksia…`, ja sisältö korvaa viestin valmistuttua.
4. Varoituksia näkyy enintään kaksi ja niiden lisätietoikkuna sekä lähdelinkki toimivat.
5. Valitse kunta. Lähialueen palvelut latautuvat ja paikallisuutisissa näkyy latausviesti haun aikana.
6. Palaute- ja linkki-ilmoitusikkunat avautuvat. Älä lähetä oikeita henkilötietoja.
7. Selainkonsolissa ei ole uutta sovellusvirhettä.

Jos kaikki kohdat ovat PASS, kirjaa staging-uusinnan aika ja hyväksyjä. Jos P1-virhe löytyy, älä vie tuotantopakettia.

## 6. Palautus tarvittaessa

Käytä vain saman istunnon `REL11_STAGING_BACKUP`-muuttujaa ja varmista kohde ennen palautusta:

```bash
test "$(realpath "$REL11_STAGING_ROOT")" = /home/seniorsurffi/website.aloitussivu-staging
test -s "$REL11_STAGING_BACKUP"
tar -C "$REL11_STAGING_ROOT" -xzf "$REL11_STAGING_BACKUP"
curl -fsS https://staging.aloitussivu.seniorsurf.fi/api/v1/health
```

Palautuksen jälkeen varmista vanha build ID selaimessa tai `build-info.json`-tiedostosta.
