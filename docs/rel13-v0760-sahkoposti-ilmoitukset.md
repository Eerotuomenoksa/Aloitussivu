# REL-13: version 0.76.0 sähköposti-ilmoitukset

Tämä päivitys lisää Seniorin aloitussivulle Cloudcityn SMTP-palvelua käyttävät ylläpitoilmoitukset sekä kuukausi- ja kvartaaliraportit. Päivitys viedään käyttäjän omalla SSH-yhteydellä. SMTP-salasanaa ei kirjoiteta keskusteluun, Git-repositorioon, komentoriville, cron-määritykseen, tietokantaan eikä lokiin.

## Lukitut osoitteet

```text
Lähettäjä:      noreply@seniorsurf.fi
Vastaanottaja: seniorsurf@vtkl.fi
SMTP-palvelin: smtp.cloudcity.fi
Portti:        587
Salaus:        STARTTLS
Käyttäjätunnus: noreply@seniorsurf.fi
```

## Päivityksen sisältö

- additiivinen migraatio `004_email_notifications.sql`;
- idempotentti MariaDB-pohjainen sähköpostijono;
- arkipäivän ylläpitokooste vain silloin, kun ylläpito vaatii toimia;
- edellisen kalenterikuukauden raportti;
- edellisen kalenterikvartaalin raportti ja kuukausitrendi;
- STARTTLS- ja SMTP-tunnistettu lähetys, kolme yritystä sekä turvalliset virhekoodit;
- erillinen manuaalinen SMTP-testiviesti;
- cron-ympäristön julkisen juuren turvallinen ratkaisu myös tuotannon hakemistorakenteessa.

Ylläpitokoosteessa ei ole palautteen tai linkki-ilmoituksen vapaata tekstiä eikä liitteitä. Vastaanottajan osoite ja SMTP-tunnukset luetaan vain yksityisestä asetuksesta. Tietokantajonossa vastaanottajaan viitataan aliasnimellä `primary`.

## Salainen tuotantoasetus

Lisää seuraava osio olemassa olevan `/home/seniorsurffi/aloitus-production/secrets/config.php`-tiedoston palautettavan taulukon sisälle. Kirjoita salasana suoraan palvelimella ja pidä tiedoston oikeutena `640`. Ota `enabled` käyttöön vasta migraation ja uuden koodin aktivoinnin jälkeen.

```php
'notifications' => [
    'enabled' => true,
    'recipient' => 'seniorsurf@vtkl.fi',
    'from_address' => 'noreply@seniorsurf.fi',
    'from_name' => 'Seniorin aloitussivu',
    'smtp' => [
        'host' => 'smtp.cloudcity.fi',
        'port' => 587,
        'encryption' => 'starttls',
        'username' => 'noreply@seniorsurf.fi',
        'password' => 'KIRJOITA_SALASANA_VAIN_PALVELIMELLA',
    ],
],
```

Varmista asetustiedoston syntaksi paljastamatta sisältöä:

```bash
php -l /home/seniorsurffi/aloitus-production/secrets/config.php
chmod 640 /home/seniorsurffi/aloitus-production/secrets/config.php
```

## Migraatio ja varmennus

Migraatio ajetaan kerran tietokantakäyttäjällä, jolla on `CREATE`- ja `INSERT`-oikeudet. Käytä `mysql -p`-kyselyä, jotta salasana pyydetään piilotettuna eikä tallennu komentohistoriaan.

```bash
mysql --host=dbtqq.db.cchosting.fi --user=TUOTANNON_MIGRAATIOKAYTTAJA -p TUOTANNON_TIETOKANTA < /home/seniorsurffi/rel13-v0760-candidate/database_migrations/004_email_notifications.sql
```

Varmista tämän jälkeen yhdellä vain luku -kyselyllä migraatio, taulun sarakkeet ja yksikäsitteinen jaksoavain:

```sql
SELECT COUNT(*) AS migration_row
FROM schema_migrations
WHERE version = '004_email_notifications';

SELECT COUNT(*) AS outbox_columns
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'email_outbox';

SELECT COUNT(*) AS unique_period_index_columns
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name = 'email_outbox'
  AND index_name = 'uq_email_outbox_period_recipient';
```

Odotus on `migration_row=1`, `outbox_columns=14` ja `unique_period_index_columns=3`.

## Manuaaliset hyväksymiskokeet

Testaa ensin pelkkä SMTP-yhteys. Tulosteessa ei näytetä osoitteita tai palvelimen raakaa vastausta.

```bash
php /home/seniorsurffi/aloitus-production/cron/smtp-test.php
```

Odotus on JSON, jossa `status` on `sent`, ja testiviesti saapuu osoitteeseen `seniorsurf@vtkl.fi`. Tarkista myös roskapostikansio. Jos ajo epäonnistuu, keskeytä ajastusten käyttöönotto; älä tulosta asetustiedostoa tai salasanaa diagnostiikkaan.

Muodosta tämän jälkeen kyseisen päivän ajankohtaiset viestit jonoon ja lähetä jono:

```bash
php /home/seniorsurffi/aloitus-production/cron/notifications.php
php /home/seniorsurffi/aloitus-production/cron/email-dispatch.php
```

Tarkista jonon tila ilman viestisisältöä:

```sql
SELECT message_type, period_key, status, attempt_count, last_error_code, created_at, sent_at
FROM email_outbox
ORDER BY created_at DESC
LIMIT 20;
```

Hyväksytty tulos on `sent`. `notifications.php` voi palauttaa saman jakson myöhemmällä ajolla kentässä `existing`; tämä todistaa kaksoislähetyksen eston. Arkipäivän ylläpitokoostetta ei synny, jos tehtäviä tai tarkistettavaa NCSC-ajoa ei ole. Kuukausiraportti syntyy kuukauden toisesta päivästä ja kvartaaliraportti uuden kvartaalin viidennestä päivästä alkaen.

## Cloudcity-ajastukset

Luo Cloudcityn **Aja PHP-skripti** -toiminnolla kaksi tuotantoajoa Europe/Helsinki-ajassa:

| Skripti | Aikataulu | Tarkoitus |
| --- | --- | --- |
| `aloitus-production/cron/notifications.php` | päivittäin klo 08.15 | muodostaa ylläpitokoosteen ja erääntyneet raportit jonoon |
| `aloitus-production/cron/email-dispatch.php` | 15 minuutin välein | lähettää jonon ja tekee hallitut uusintayritykset |

`smtp-test.php`-skriptiä ei ajasteta. Olemassa olevat NCSC-ajot säilyvät ennallaan.

## STOP-ehdot

Keskeytä käyttöönotto, jos jokin seuraavista toteutuu:

- migraation rivi-, sarake- tai indeksitarkistus ei täsmää;
- `config.php` ei läpäise PHP:n syntaksitarkistusta;
- SMTP-testi epäonnistuu tai viesti ei saavu vastaanottajalle;
- lähetysjono tallentaa muun kuin rajatun `smtp_*`-virhekoodin;
- vastaanottajan osoite tai SMTP-salasana näkyy cron-tulosteessa tai tietokantajonossa;
- nykyisen sovelluksen health-, ylläpito- tai WordPress-savukoe heikkenee.

## Palautus

Ilmoitukset pysäytetään ensin poistamalla molemmat uudet cron-ajastukset käytöstä ja asettamalla yksityisessä asetuksessa `notifications.enabled` arvoon `false`. Version 0.75.0 koodi voidaan tämän jälkeen palauttaa normaalilla koodipalautuksella. Migraatio 004 ja `email_outbox` voidaan jättää tietokantaan: muutos on additiivinen eikä versio 0.75.0 käytä taulua. Taulua ei poisteta palautuksen yhteydessä, jotta lähetyshistoria ja vikatilanteen selvitystieto säilyvät.
