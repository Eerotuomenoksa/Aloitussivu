# REL-11-stagingvienti 26.8.2026

Tämä ohje koskee vain seuraavaa yksilöityä staging-ehdokasta:

| Kenttä | Arvo |
| --- | --- |
| Build ID | `REL-11-v0.74.0-375efac68d1d` |
| Commit | `375efac68d1d` |
| ZIP | `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip` |
| Koko | 830 298 tavua |
| SHA-256 | `0fbac326abd866f63bc8c518d3ac39d72173cd9cb7e4bda8b3610e46eb223d9a` |
| Tiedostoja | 115 |
| Pääbundle | `assets/main-CbpUtkYy.js` |

Paketti korvaa stagingin sovellustiedostot mutta ei sisällä eikä korvaa palvelimen yksityistä `secrets/config.php`-tiedostoa. ZIP siirretään käyttäjän kotihakemistoon, ei `public_html`-hakemistoon.

## 1. Tarkista paketti paikallisessa PowerShellissä

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip'
```

Tuloksen pitää olla:

```text
0fbac326abd866f63bc8c518d3ac39d72173cd9cb7e4bda8b3610e46eb223d9a
```

## 2. Siirrä ZIP paikallisessa PowerShellissä

```powershell
scp 'C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip' seniorsurffi@staging.aloitussivu.seniorsurf.fi:/home/seniorsurffi/
```

## 3. Vahvista kohde nykyisessä SSH-istunnossa

Aja nämä palvelimella:

```bash
whoami
pwd
ls -ld /home/seniorsurffi/website.aloitussivu-staging
ls -ld /home/seniorsurffi/website.aloitussivu-staging/public_html
```

Odotetut arvot ovat käyttäjä `seniorsurffi` ja staging-hakemisto `/home/seniorsurffi/website.aloitussivu-staging`.

## 4. Tee palautuspaketti ennen purkua

Seuraava komento kieltäytyy korvaamasta samannimistä aiempaa varmistusta:

```bash
test ! -e /home/seniorsurffi/rel11-predeploy-files-20260826.tar.gz && tar -C /home/seniorsurffi/website.aloitussivu-staging -czf /home/seniorsurffi/rel11-predeploy-files-20260826.tar.gz bootstrap.php src cron public_html build-info.json
ls -lh /home/seniorsurffi/rel11-predeploy-files-20260826.tar.gz
```

Jos ensimmäinen komento ei tulosta mitään eikä varmistustiedostoa synny, pysähdy: samanniminen tiedosto on jo olemassa tai jokin varmistettava kohde puuttuu.

## 5. Varmista siirretty ZIP

```bash
sha256sum /home/seniorsurffi/aloitussivu-rel11-staging.zip
unzip -tq /home/seniorsurffi/aloitussivu-rel11-staging.zip
```

SHA-256:n pitää olla täsmälleen sama kuin yllä, ja `unzip`-testin pitää ilmoittaa, ettei pakatussa datassa ole virheitä.

## 6. Pura ehdokas stagingiin

```bash
unzip -oq /home/seniorsurffi/aloitussivu-rel11-staging.zip -d /home/seniorsurffi/website.aloitussivu-staging
```

Komento ei koske `secrets/config.php`-tiedostoon, koska sitä ei ole ZIPissä.

## 7. Varmista build ja oikeudet

```bash
grep -E '"(buildId|commit|workingTreeDirty)"' /home/seniorsurffi/website.aloitussivu-staging/build-info.json
grep -o 'assets/main-[^" ]*\.js' /home/seniorsurffi/website.aloitussivu-staging/public_html/index.html
stat -c '%a %n' /home/seniorsurffi/website.aloitussivu-staging/public_html/index.html /home/seniorsurffi/website.aloitussivu-staging/public_html/.htaccess /home/seniorsurffi/website.aloitussivu-staging/bootstrap.php /home/seniorsurffi/website.aloitussivu-staging/src/App.php
```

Odotukset:

- build ID `REL-11-v0.74.0-375efac68d1d`
- commit `375efac68d1d`
- `workingTreeDirty` on `false`
- pääbundle `assets/main-CbpUtkYy.js`
- keskeisten tiedostojen oikeudet `644`

## 8. Tee smoke-tarkistus

Avaa selaimella `https://staging.aloitussivu.seniorsurf.fi/` ja tarkista etusivu. API-healthin voi tarkistaa SSH-istunnossa ilman salasanan kirjoittamista komentohistoriaan näin:

```bash
curl -sS -u surf https://staging.aloitussivu.seniorsurf.fi/api/v1/health
```

`curl` pyytää Basic Auth -salasanan erikseen. Vastauksen pitää sisältää `status: ok`, `database: up` ja `version: v1`.

Tämän jälkeen uusintatestataan ainakin UI-01–UI-12 sekä A11Y-02, A11Y-03 ja A11Y-04. Ehdokasta ei jäädytetä ennen näiden hyväksyntää.

## 9. Palautus tarvittaessa

Jos build-tunniste, etusivu tai health-tarkistus epäonnistuu, palauta edellinen staging-sisältö:

```bash
tar -C /home/seniorsurffi/website.aloitussivu-staging -xzf /home/seniorsurffi/rel11-predeploy-files-20260826.tar.gz
```

Tarkista palautuksen jälkeen uudelleen etusivu, `build-info.json` ja API-health.
