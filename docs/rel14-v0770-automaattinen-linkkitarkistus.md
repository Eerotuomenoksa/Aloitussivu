# REL-14 / v0.77.0 – automaattinen linkkitarkistus

Tämä julkaisu lisää HTTPS-linkkien erissä tehtävän taustatarkistuksen. Tarkistin käsittelee tuotantopaketin linkkiluettelon sekä ylläpidossa hyväksytyt linkit. Tila ja ajohistoria tallennetaan tietokantaan, vahvistetut ongelmat näkyvät ylläpidossa ja varmat toistuvat viat piilotetaan automaattisesti käyttäjiltä.

## Ennen aktivointia

1. Ota varmuuskopio nykyisestä julkisesta ja yksityisestä tuotantopolusta sekä tietokannasta.
2. Pura paketti ehdokashakemistoon ja tarkista `build-info.json` sekä SHA-256.
3. Aja järjestyksessä `database_migrations/005_automated_link_checks.sql`, `database_migrations/006_link_check_hardening.sql`, `database_migrations/007_link_check_admin_actions.sql` ja `database_migrations/008_usage_privacy_cleanup.sql` tuotantotietokantaan.
4. Kopioi julkiset tiedostot polkuun `/website.wp33403/aloitus/` ja yksityiset tiedostot polkuun `/aloitus-production/`. Säilytä aina nykyinen `secrets/config.php`.
5. Tarkista, että `/aloitus-production/data/link-catalog.json` on mukana ja yksityisen web-juuren ulkopuolella.

## Yksityinen asetus

Lisää nykyisen `/home/seniorsurffi/aloitus-production/secrets/config.php`-tiedoston palauttamaan taulukkoon:

```php
'link_checks' => [
    'enabled' => true,
    'batch_size' => 10,
    'timeout_seconds' => 5,
    'refresh_days' => 30,
    'retry_hours' => 24,
    'alert_after_failures' => 2,
    'auto_block_enabled' => true,
    'auto_block_max_per_run' => 25,
    'auto_unblock_enabled' => true,
    'min_interval_hours' => 72,
],
```

`batch_size` kertoo yhden cron-ajon enimmäislinkkimäärän. Uudet kohteet hajautetaan ensimmäiselle 72 tunnille. Onnistuminen kasvattaa kohteen omaa väliä 1,5-kertaiseksi enintään `refresh_days`-rajaan, ja virhe tai varoitus palauttaa välin `min_interval_hours`-arvoon. Virheen uusinnat porrastetaan 6, 24 ja 72 tuntiin sekä sen jälkeen seitsemään vuorokauteen.

Automaattinen esto koskee vain kahdesti vahvistettua 404/410-, DNS-, TLS-, uudelleenohjaus- tai verkkotunnuksen myyntivirhettä. Yhdessä ajossa piilotetaan enintään 25 linkkiä. Kunnossa olevaksi palautunut automaatin estämä linkki palautetaan näkyviin, mutta ylläpitäjän tekemään estoon ei kosketa koskaan. Eero hyväksyi automaattisen eston käyttöönoton 30.8.2026.

## Cloudcityn ajastus

Lisää PHP-skriptinä ajettava työ:

- PHP-skripti: `aloitus-production/cron/link-check.php`
- Ajastus: vapaa ajastus `7 * * * *`
- Nimi: `Aloitussivu – automaattinen linkkitarkistus`
- Testaa toiminta: käytössä ensimmäisen tallennuksen yhteydessä

Ajastus tarkistaa enintään kymmenen vuorossa olevaa linkkiä tunnissa ja enintään kolme linkkiä samalta isännältä. Erässä on enintään neljä samanaikaista ulkoista yhteyttä. Yksittäisen HTTP-yrityksen aikakatkaisu on viisi sekuntia, yhden kohteen kokonaisbudjetti 15 sekuntia ja koko ajo enintään 120 sekuntia. Tietokantalukko estää päällekkäiset ajot.

Ennen erää tarkistetaan `https://www.suomi.fi/`. Jos kiintopiste ei vastaa tai yli 60 prosenttia erästä kaatuu DNS-, yhteys- tai aikakatkaisuvirheeseen, ajo merkitään `network_suspect`-tilaan eikä yhtään kohdetta päivitetä tai piiloteta. Kahdesta peräkkäisestä tapauksesta tulee `network_suspect_repeated`, joka näkyy ylläpidossa ja seuraavassa ylläpitokoosteessa.

## Tarkistukset palvelimella

```bash
php -l /home/seniorsurffi/aloitus-production/cron/link-check.php
php -l /home/seniorsurffi/aloitus-production/src/LinkCheckJob.php
php -l /home/seniorsurffi/aloitus-production/src/HttpLinkChecker.php
php /home/seniorsurffi/aloitus-production/cron/link-check.php
```

Onnistunut käsiajo palauttaa JSON-rivin, jonka `status` on `completed`, `checked` on enintään asetettu eräkoko ja prosessin paluuarvo on 0. Ensimmäinen ajo synkronoi pakatun linkkiluettelon tietokantaan.

Tarkista lisäksi:

```sql
SELECT version FROM schema_migrations WHERE version = '005_automated_link_checks';
SELECT version FROM schema_migrations WHERE version = '006_link_check_hardening';
SELECT version FROM schema_migrations WHERE version = '007_link_check_admin_actions';
SELECT COUNT(*) AS targets FROM link_check_targets WHERE catalog_active = 1 OR approved_active = 1;
SELECT status, checked_count, ok_count, warning_count, failed_count, rejected_count,
       blocked_count, unblocked_count, message_code, started_at
FROM link_check_runs ORDER BY started_at DESC LIMIT 5;
SELECT url, reason, created_at FROM blocked_links WHERE created_by IS NULL ORDER BY created_at DESC LIMIT 25;
```

Kirjaudu ylläpitoon ja avaa **Automaattinen linkkitarkistus**. Näkymässä pitää näkyä linkkien kokonaismäärä, viimeisin ajo ja vahvistetut ongelmat. Tarkista yhdellä oikealla huomiolla, että perustelun kirjoittamisen jälkeen **Hyväksy toimivaksi** poistaa huomion listalta. Hyväksyntä tallentuu tauluun `link_check_overrides`, ja saman uudelleenohjauksen myöhempi muuttuminen nostaa huomion uudelleen. **Poista linkki näkyvistä** lisää ylläpitäjän tekemän rivin `blocked_links`-tauluun; käytä tätä savussa vain aidosti poistettavalle testikohteelle.

Yhteenvetokorttien **Varoituksia**- ja **Epäonnistuu**-lukujen kohteet näkyvät alempana nimettynä listana. Jokaisesta näytetään osoite, automaation turvallinen virhesyy, mahdollinen HTTP-tila sekä seuraava tarkistusaika. Varoitus on tavallisesti 401-, 403- tai 429-rajoitus eikä yksin tarkoita kuollutta linkkiä. Ensimmäinen epäonnistuminen tarkistetaan automaattisesti uudelleen ennen vahvistettua huomiota, mutta ylläpitäjä voi käsin tarkistettuaan hyväksyä tai piilottaa kohteen jo listasta. **Hyväksytty poikkeus**- ja **Piilotettu**-merkinnät kertovat, että kohde on jo käsitelty.

## Mitä tarkistin hyväksyy

- Vain `https://`-osoitteet hyväksytään.
- Myös jokainen uudelleenohjaus tarkistetaan, eikä lopullinen `http://`-osoite kelpaa.
- TLS-varmenne tarkistetaan.
- Sisäiset, paikalliset ja varatut IP-osoitteet estetään SSRF-suojauksena.
- HTTP 401, 403 ja 429 tulkitaan varoitukseksi, koska palvelin vastasi mutta rajoitti automaattista tarkistusta.
- Varsinaiset virheet vahvistetaan toistolla ennen ylläpitohälytystä.
- Verkkotunnuksen myyntisivulle päätyvä linkki luokitellaan varmaksi virheeksi.
- Uudelleenohjauksen siirtyminen toiselle rekisteröitävälle verkkotunnukselle tallennetaan ylläpidon tarkistettavaksi.
- Palvelimen oma verkkohäiriö ei kasvata kohteiden vikalaskureita eikä aiheuta estoja.

## Palautus

Poista ensin automaattinen esto käytöstä asettamalla `link_checks.auto_block_enabled` arvoon `false`. Jos koko tarkistus pitää palauttaa, poista Cloudcityn link-check-ajastus käytöstä ja aseta myös `link_checks.enabled` arvoon `false`. Palauta edellisen julkaisun julkinen sekä yksityinen koodi, mutta säilytä nykyinen `secrets/config.php`. Migraatioiden 005–007 taulut ja sarakkeet ovat lisäyksiä, joten ne voidaan jättää tietokantaan palautuksen ajaksi.
