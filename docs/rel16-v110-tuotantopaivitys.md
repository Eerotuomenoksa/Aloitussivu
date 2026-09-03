# REL-16 / v1.1.1 tuotantopäivitys

Tämä julkaisu tuo palautteiden julkisen käsittelyseurannan, yhdenmukaistaa linkkiehdotusten hyväksynnän ja päivittää automaattisen linkkitarkistuksen tuotantoasetuksen.

## Julkaisun sisältö

- Kaikki käyttäjät näkevät `kehitysjono.html`-sivulla palautteiden ja linkki-ilmoitusten tilan sekä ylläpidon julkaiseman käsittelymerkinnän.
- Linkkiehdotus kulkee aina rakenteiseen hyväksyntä- tai hylkäysprosessiin. Myös vanha `link`-tyyppinen palaute voidaan ylläpidossa hyväksyä tuotantolinkiksi tai hylätä. Hyväksyttävä linkki voidaan kohdistaa yhdelle kunnalle tai jättää valtakunnalliseksi.
- Julkiset API-listat palauttavat vain seurantaan tarvittavat kentät. Ilmoittajan selain- ja laitetiedot, liitteet sekä ylläpitäjän tunnisteet eivät vuoda julkisiksi.
- Linkkitarkistuksen `timeout_seconds` on viisi sekuntia. `batch_size` on 50, jolloin noin 2 379 linkin täysi kierros kestää vähintään noin kaksi vuorokautta. Tarkistimen enimmäisrinnakkaisuus on neljä ulkoista yhteyttä, ja 120 sekunnin ajobudjetin täyttyessä loput vuorossa olevat kohteet jäävät seuraavaan tuntiajoon.

Kahden tunnin staging-kuormitusajo päättyi ilman virheitä: 5 760 HTTP-pyyntöä, kaikki 200, p95 49 ms ja enimmäiskesto 240 ms. Ajo mittasi omaa API:a (0,8 pyyntöä/s), ei ulkoisia linkkikohteita. Siksi ulkoisten yhteyksien rinnakkaisuutta ei kasvateta tämän perusteella.

Ennen koodin aktivointia aja paketista `database_migrations/009_approved_links_municipality.sql` tuotantotietokantaan. Se lisää hyväksytylle linkille valinnaisen kunnan; tyhjä arvo tarkoittaa valtakunnallista linkkiä. Migraatio on uudelleenajettava turvallisesti.

## Ennen siirtoa

1. Varmista paketin `build-info.json`: `package` on `REL-16`, `version` on `1.1.1` ja `commit` vastaa git-committia.
2. Varmista ZIPin SHA-256 sekä palvelimella että paikallisesti. Keskeytä, jos arvot poikkeavat.
3. Ota varmistukset nykyisestä julkisesta hakemistosta, yksityisestä API-polusta ja tietokannasta ennen yhtäkään muutosta.

## Palvelimelle siirto

Siirrä ZIP palvelimelle ja pura se ehdokashakemistoon:

```bash
set -eu
ZIP=/home/seniorsurffi/aloitussivu-rel16-v1.1.1-production-path.zip
CANDIDATE=/home/seniorsurffi/rel16-production-candidate-$(date +%Y%m%d-%H%M%S)
test -f "$ZIP"
mkdir "$CANDIDATE"
unzip -q "$ZIP" -d "$CANDIDATE"
test -f "$CANDIDATE/build-info.json"
test -f "$CANDIDATE/wordpress_aloitus/index.html"
test -f "$CANDIDATE/private_root/src/PublicApi.php"
echo "ehdokas=ok polku=$CANDIDATE"
```

Kopioi yksityinen API säilyttäen nykyinen `secrets/config.php`. Älä käytä `rsync --delete`-komentoa.

```bash
set -eu
PRIVATE=/home/seniorsurffi/aloitus-production
test -f "$PRIVATE/secrets/config.php"
cp -a "$CANDIDATE/private_root/bootstrap.php" "$PRIVATE/"
cp -a "$CANDIDATE/private_root/src/." "$PRIVATE/src/"
cp -a "$CANDIDATE/private_root/cron/." "$PRIVATE/cron/"
cp -a "$CANDIDATE/private_root/data/." "$PRIVATE/data/"
cp -a "$CANDIDATE/private_root/secrets/config.production.example.php" "$PRIVATE/secrets/"
/opt/alt/php84/usr/bin/php -l "$PRIVATE/bootstrap.php"
/opt/alt/php84/usr/bin/php -l "$PRIVATE/src/PublicApi.php"
/opt/alt/php84/usr/bin/php -l "$PRIVATE/src/AdminApi.php"
/opt/alt/php84/usr/bin/php -l "$PRIVATE/src/HttpLinkChecker.php"
/opt/alt/php84/usr/bin/php -l "$PRIVATE/src/LinkCheckJob.php"
```

Vaihda julkinen hakemisto atomisesti vasta, kun yllä olevat tarkistukset ovat PASS. Säilytä edellinen hakemisto yksilöllisellä `rel16`-palautusnimellä ja tarkista lähdepolut ennen `mv`-komentoja.

## Hyväksymiskokeet aktivoinnin jälkeen

```bash
for u in / kehitysjono.html tietosuoja.html muutosloki.html api/v1/health api/v1/feedback api/v1/link-reports; do
  printf '%-24s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "https://seniorsurf.fi/aloitus/$u")"
done
```

Kaikkien pitää palauttaa 200. `health`-vastauksen `data.status` on `ok`, `data.database` on `up` ja `Cache-Control` on `no-store`.

Tee lisäksi selaimessa yksi testilinkkiehdotus: varmista, että se näkyy kehitysjonossa, ylläpito voi hyväksyä tai hylätä sen ja käsittelymerkintä näkyy julkisesti. Poista tai hylkää testirivi hallitusti ja kirjaa toimenpide julkaisupäiväkirjaan.

Tarkista ensimmäisen linkkitarkistusajon jälkeen `link_check_runs`-taulusta, että ajo on `completed` eikä automaattisia estoja synny odottamatta. Jos epäilyttävä verkkohäiriö tai P1-virhe havaitaan, aseta ensin `link_checks.auto_block_enabled` arvoon `false`, säilytä `secrets/config.php` ja palauta edellinen julkinen tai yksityinen versio varmistuksesta.
