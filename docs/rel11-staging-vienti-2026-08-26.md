# REL-11-stagingvienti 26.8.2026

Tämä ohje koskee vain seuraavaa yksilöityä staging-ehdokasta:

| Kenttä | Arvo |
| --- | --- |
| Build ID | `REL-11-v0.74.2-ee6f9ebf1f3d` |
| Commit | `ee6f9ebf1f3d` |
| ZIP | `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip` |
| ZIP palvelimella | `/home/seniorsurffi/aloitussivu-rel11-v0742-staging.zip` |
| Koko | 833 781 tavua |
| SHA-256 | `4205860a745f8ba561b34f304e1e689fdf5f12bb2679d3879cf15cb554848c25` |
| Tiedostoja | 115 |
| Pääbundle | `assets/main-CamQDfot.js` |

Paketti korvaa stagingin sovellustiedostot mutta ei sisällä eikä korvaa palvelimen yksityistä `secrets/config.php`-tiedostoa. ZIP siirretään käyttäjän kotihakemistoon, ei `public_html`-hakemistoon.

## 1. Tarkista paketti paikallisessa PowerShellissä

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip'
```

Tuloksen pitää olla:

```text
4205860a745f8ba561b34f304e1e689fdf5f12bb2679d3879cf15cb554848c25
```

## 2. Siirrä ZIP paikallisessa PowerShellissä

```powershell
scp 'C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip' seniorsurffi@staging.aloitussivu.seniorsurf.fi:/home/seniorsurffi/aloitussivu-rel11-v0742-staging.zip
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
test ! -e /home/seniorsurffi/rel11-v0740-predeploy-files-20260826.tar.gz && tar -C /home/seniorsurffi/website.aloitussivu-staging -czf /home/seniorsurffi/rel11-v0740-predeploy-files-20260826.tar.gz bootstrap.php src cron public_html build-info.json
ls -lh /home/seniorsurffi/rel11-v0740-predeploy-files-20260826.tar.gz
```

Jos ensimmäinen komento ei tulosta mitään eikä varmistustiedostoa synny, pysähdy: samanniminen tiedosto on jo olemassa tai jokin varmistettava kohde puuttuu.

## 5. Varmista siirretty ZIP

```bash
sha256sum /home/seniorsurffi/aloitussivu-rel11-v0742-staging.zip
unzip -tq /home/seniorsurffi/aloitussivu-rel11-v0742-staging.zip
```

SHA-256:n pitää olla täsmälleen sama kuin yllä, ja `unzip`-testin pitää ilmoittaa, ettei pakatussa datassa ole virheitä.

## 6. Pura ehdokas stagingiin

```bash
unzip -oq /home/seniorsurffi/aloitussivu-rel11-v0742-staging.zip -d /home/seniorsurffi/website.aloitussivu-staging
```

Komento ei koske `secrets/config.php`-tiedostoon, koska sitä ei ole ZIPissä.

## 7. Varmista build ja oikeudet

```bash
grep -E '"(buildId|commit|workingTreeDirty)"' /home/seniorsurffi/website.aloitussivu-staging/build-info.json
grep -o 'assets/main-[^" ]*\.js' /home/seniorsurffi/website.aloitussivu-staging/public_html/index.html
stat -c '%a %n' /home/seniorsurffi/website.aloitussivu-staging/public_html/index.html /home/seniorsurffi/website.aloitussivu-staging/public_html/.htaccess /home/seniorsurffi/website.aloitussivu-staging/bootstrap.php /home/seniorsurffi/website.aloitussivu-staging/src/App.php
```

Odotukset:

- build ID `REL-11-v0.74.2-ee6f9ebf1f3d`
- commit `ee6f9ebf1f3d`
- `workingTreeDirty` on `false`
- pääbundle `assets/main-CamQDfot.js`
- keskeisten tiedostojen oikeudet `644`

## 8. Tee smoke-tarkistus

Avaa selaimella `https://staging.aloitussivu.seniorsurf.fi/` ja tarkista etusivu. Stagingin Basic Auth on tällä testikierroksella väliaikaisesti poissa käytöstä, joten API-healthin voi tarkistaa SSH-istunnossa näin:

```bash
curl -sS https://staging.aloitussivu.seniorsurf.fi/api/v1/health
```

Vastauksen pitää sisältää `status: ok`, `database: up` ja `version: v1`.

Tämän jälkeen uusintatestataan A11Y-03 kaikissa kahdeksassa väriteema/vaalea–tumma-yhdistelmässä ja tehdään P1-smoke. Aiemmat UI-01–UI-12-, A11Y-02- ja A11Y-04-tulokset säilyvät, koska muutos rajautuu Google-haun mikrofonipainikkeen fokusrenkaaseen. Ehdokasta ei jäädytetä ennen uuden ehdokkaan hyväksyntää.

## 9. Palautus tarvittaessa

Jos build-tunniste, etusivu tai health-tarkistus epäonnistuu, palauta edellinen staging-sisältö:

```bash
tar -C /home/seniorsurffi/website.aloitussivu-staging -xzf /home/seniorsurffi/rel11-v0740-predeploy-files-20260826.tar.gz
```

Tarkista palautuksen jälkeen uudelleen etusivu, `build-info.json` ja API-health.
