# REL-11 version 0.74.6 tuotantopaketin esivienti 28.8.2026

Tämä ohje siirtää korjatun tuotantopaketin palvelimelle ja purkaa sen erilliseen ehdokashakemistoon. Se ei luo tai muuta julkista `/aloitus/`-hakemistoa, ei muuta tuotantotietokantaa eikä korvaa oikeaa `secrets/config.php`-tiedostoa.

| Kenttä | Arvo |
| --- | --- |
| Build ID | `REL-11-v0.74.6-6974967944fb` |
| Paikallinen ZIP | `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-production-path.zip` |
| ZIP palvelimella | `/home/seniorsurffi/aloitussivu-rel11-v0746-6974967944fb-production-path.zip` |
| Koko | 824590 tavua |
| SHA-256 | `2fca11c90ca1fdcf3ec0bfd10ae6e1a9e465100b3ea4fde44f6b3935c50db479` |
| Tiedostoja | 115 |

## 1. Paikallinen ennakkotarkistus

Aja PowerShell 7:ssä:

```powershell
Set-Location C:\dev\Aloitussivu
powershell -ExecutionPolicy Bypass -File .\scripts\rel11-morning-preflight.ps1
```

Jatka vain, jos sekä staging-verrokki että production-path ovat `PASS` ja tuotantopaketin build ID on `REL-11-v0.74.6-6974967944fb`.

## 2. Siirrä ZIP SCP:llä

Aja paikallisessa PowerShellissä:

```powershell
scp 'C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-production-path.zip' seniorsurffi@staging.aloitussivu.seniorsurf.fi:/home/seniorsurffi/aloitussivu-rel11-v0746-6974967944fb-production-path.zip
```

Kirjaudu siirron jälkeen SSH:lla:

```powershell
ssh seniorsurffi@staging.aloitussivu.seniorsurf.fi
```

## 3. Varmenna ja pura eristetty ehdokas

Aja seuraava lohko SSH-istunnossa. Sulut estävät tarkistusvirhettä sulkemasta SSH-yhteyttä.

```bash
(
  set -eu
  REL11_ZIP=/home/seniorsurffi/aloitussivu-rel11-v0746-6974967944fb-production-path.zip
  REL11_CANDIDATE=/home/seniorsurffi/rel11-production-candidate-6974967944fb-$(date +%Y%m%d-%H%M%S)
  PHP_BIN=/opt/alt/php84/usr/bin/php

  test "$(whoami)" = seniorsurffi
  test -f "$REL11_ZIP"
  test "$(stat -c '%s' "$REL11_ZIP")" = 824590
  test "$(sha256sum "$REL11_ZIP" | awk '{print $1}')" = 2fca11c90ca1fdcf3ec0bfd10ae6e1a9e465100b3ea4fde44f6b3935c50db479
  unzip -tq "$REL11_ZIP"
  if unzip -Z1 "$REL11_ZIP" | grep -qx 'private_root/secrets/config.php'; then
    echo 'BLOCKED: ZIP sisältää oikean config.php-tiedoston.' >&2
    exit 1
  fi

  test ! -e "$REL11_CANDIDATE"
  umask 077
  mkdir "$REL11_CANDIDATE"
  unzip -q "$REL11_ZIP" -d "$REL11_CANDIDATE"

  test "$(realpath "$REL11_CANDIDATE")" = "$REL11_CANDIDATE"
  test "$(find "$REL11_CANDIDATE" -type f | wc -l | tr -d ' ')" = 115
  test -f "$REL11_CANDIDATE/wordpress_aloitus/index.html"
  test -f "$REL11_CANDIDATE/wordpress_aloitus/.htaccess"
  test -f "$REL11_CANDIDATE/wordpress_aloitus/api/index.php"
  test -f "$REL11_CANDIDATE/private_root/secrets/config.production.example.php"
  test ! -e "$REL11_CANDIDATE/private_root/secrets/config.php"
  grep -Fq 'dbtqq.db.cchosting.fi' "$REL11_CANDIDATE/private_root/secrets/config.production.example.php"
  grep -Fq '"buildId": "REL-11-v0.74.6-6974967944fb"' "$REL11_CANDIDATE/build-info.json"
  grep -Fq '"commit": "6974967944fb"' "$REL11_CANDIDATE/build-info.json"
  grep -Fq '"workingTreeDirty": false' "$REL11_CANDIDATE/build-info.json"

  PHP_COUNT=0
  while IFS= read -r -d '' REL11_PHP_FILE; do
    "$PHP_BIN" -l "$REL11_PHP_FILE" >/dev/null
    PHP_COUNT=$((PHP_COUNT + 1))
  done < <(find "$REL11_CANDIDATE" -type f -name '*.php' -print0)
  test "$PHP_COUNT" = 43

  printf 'PRODUCTION_ZIP=PASS\n'
  printf 'CANDIDATE=%s\n' "$REL11_CANDIDATE"
  printf 'FILES=115\n'
  printf 'PHP_FILES=%s\n' "$PHP_COUNT"
  if test -e /home/seniorsurffi/website.wp33403/aloitus; then
    printf 'PUBLIC_TARGET=PRESENT\n'
  else
    printf 'PUBLIC_TARGET=FREE\n'
  fi
)
```

Hyväksy vain tulos `PRODUCTION_ZIP=PASS`, `FILES=115` ja `PHP_FILES=43`. `PUBLIC_TARGET` kirjataan, mutta sitä ei muuteta tässä vaiheessa. Säilytä tulostuva `CANDIDATE`-polku seuraavia vaiheita varten.
