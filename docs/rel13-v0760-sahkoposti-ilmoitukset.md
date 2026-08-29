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

`smtp-test.php`-skriptiä ei ajasteta. Tuotannolle luodaan lisäksi oma `aloitus-production/cron/ncsc.php`-ajo arkipäiviksi klo 11.30 ja 15.30 (`30 11,15 * * 1-5`). Aiempi stagingin NCSC-ajo ei päivitä tuotantokantaa, ja se voidaan pitää poissa käytöstä normaalissa tuotantotilassa.

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

## Toteutunut tuotantokäyttöönotto 29.8.2026

Puhtaasta commitista `a49410f118e7` rakennettu paketti `REL-13-v0.76.0-a49410f118e7` sisälsi 130 tiedostoa. ZIPin SHA-256 oli `0437596c3567297f725995f7f8d9f371d857f20a9663094ac48cbaa8ed502d75`. Build-info vahvisti version 0.76.0, puhtaan työpuun, migraatiot 001–004, tausta-ajot `ncsc`, `notifications` ja `email-dispatch` sekä manuaalisen `smtp-test`-työkalun. Paketissa ei ollut oikeaa `secrets/config.php`-tiedostoa, ja SMTP-salasana jäi vain palvelimen yksityiseen asetukseen.

Ennen aktivointia luotiin 600-oikeuksinen koodi- ja asetussnapshot `/home/seniorsurffi/rel13-v0760-predeploy-a49410f118e7.tar.gz`, jonka SHA-256 oli `33dad7c2693b5b9666dcc6eb513659f9b321d19019143ab861208dcc09c4ba42`. Migraatio `004_email_notifications` varmennettiin yhdellä migraatiorivillä, 14 sarakkeella ja kolmiosaisella yksikäsitteisellä jaksoavaimella. Edellinen julkinen ja yksityinen koodi säilyvät palautuspolussa `/home/seniorsurffi/rel13-v0760-rollback-a49410f118e7`.

Version 0.76.0 aktivointisavu palautti etusivulle, ylläpitoon, englannin- ja ruotsinkielisille linkkisivuille, API-healthille ja WordPressin etusivulle HTTP 200:n. Tarkoituksella puuttuva polku palautti HTTP 404:n ja WordPressin ylläpito HTTP 302 -kirjautumisohjauksen. Health sisälsi arvot `ok/up/v1`, ja `config.php` pysyi aktivointivaihdon aikana tavutasolla muuttumattomana.

Cloudcityn SMTP-yhteys varmennettiin portissa 587 TLS 1.3:lla, varmenteen tarkistus oli OK ja palvelin ilmoitti tukevansa `AUTH PLAIN LOGIN` -menetelmiä. Ensimmäinen kirjautumisyritys rajasi virheen SMTP-tunnukseen; postilaatikkokohtaisen salasanan korjauksen jälkeen manuaalinen testiviesti sai tilan `sent` ja saapui vastaanottajalle. Heinäkuun 2026 kuukausiraportti jonotettiin kerran, lähetettiin ensimmäisellä yrityksellä ja varmennettiin tietokannasta tilaan `sent`, jossa `attempt_count=1` ja `last_error_code` oli tyhjä. Uusinta palautti raportin `existing`-kentässä ja lähettäjä lähetti 0 uutta viestiä, joten idempotenssi on PASS.

Cloudcityn tuotantoajot aktivoitiin seuraavasti: ilmoitusten muodostus päivittäin klo 08.15, sähköpostijonon lähetys 15 minuutin välein ja tuotannon NCSC-ajo arkipäivisin klo 11.30 sekä 15.30. Stagingin NCSC-ajo poistettiin käytöstä. Cloudcityn omassa ajastusympäristössä `email-dispatch` palautti `status=ok`, `sent=0` ja `failed=0`; `notifications` palautti `status=ok`, tyhjän `queued`-listan ja olemassa olevan `monthly_report:2026-07`-avaimen. Tuotannon NCSC-koe valmistui 2,603 sekunnissa tilalla `completed`, käsitteli kuusi kohdetta, loi yhden varoituksen eikä tuottanut virheitä. Version 0.76.0 sähköposti- ja tuotantocron-käyttöönotto on PASS.

## Version 0.76.1 sähköpostipohjien päivitys 29.8.2026

Ylläpitokooste sekä kuukausi- ja kvartaaliraportit uudistettiin sähköpostiyhteensopiviksi korttinäkymiksi. Käyttöluvut ryhmiteltiin sivuston käyttöön, aloitussivuoppaaseen ja ylläpitotyöhön. Jokainen mittari näyttää nykyisen arvon, edellisen jakson arvon, selkokielisen muutoksen ja määritelmän siitä, mitä luku tarkoittaa. Ylläpitokooste kertoo vastaavasti tehtäväryhmän tilan, määrän, vanhimman tehtävän iän ja tarvittavan tulkinnan. HTML- ja tekstiversiot sisältävät samat olennaiset selitteet, eikä viesteihin lisätty palautetekstejä, linkki-ilmoitusten huomioita tai muita käyttäjien sisältöjä.

Puhtaasta commitista `10862931332c` rakennettu paketti `REL-13-v0.76.1-10862931332c` sisälsi 130 tiedostoa ja sen SHA-256 oli `b55e300ac8015fca35c634ae9f46726b9a22e79bd9a0afb3e0423bdf0a599d97`. Paikallinen PHP-lint oli 57/57, API-sopimustestit 55/55, TypeScript, salaisuusskannaus ja Cloudcity-build olivat PASS. Kolme malliviestiä renderöitiin oikeilla esimerkkiluvuilla selaimessa. Kuukausi- ja ylläpitoviesti sekä kvartaalin trenditaulukko pysyivät ilman vaakasuuntaista ylivuotoa sekä normaalissa työpöytänäkymässä että 390 pikselin mobiilinäkymässä.

Palvelimen ehdokas täsmäsi paketin tiivisteeseen, sisälsi 130 tiedostoa ja läpäisi PHP-lintin 54/54. Ennen aktivointia otettiin 600-oikeuksinen palautuspaketti `/home/seniorsurffi/rel13-v0761-predeploy-10862931332c.tar.gz`, jonka SHA-256 oli `b1b31e30a5f09b5fc5497458e9bc9ad52914bf83f2e23ab20db986768a03d960`. Nykyinen salainen `config.php`, lokit, välimuisti ja suojatut liitteet kopioitiin uuteen yksityiseen juureen ennen palautettavaa hakemistovaihtoa. Konfiguraation SHA-256 säilyi vaihdossa muuttumattomana. Edellinen julkinen ja yksityinen koodi ovat palautuspolussa `/home/seniorsurffi/rel13-v0761-rollback-10862931332c`.

Aktivoinnin jälkeen etusivu, ylläpito, englannin- ja ruotsinkieliset linkkisivut, API-health ja WordPressin etusivu palauttivat HTTP 200:n. Tarkoituksella puuttuva polku palautti HTTP 404:n ja WordPressin ylläpito HTTP 302:n. Health sisälsi arvot `ok/up/v1`, aktiivinen sähköpostipohja läpäisi PHP-lintin ja uusi mittariselite löytyi aktiivisesta koodista. Ajastusten integraatiokoe tunnisti heinäkuun raportin olemassa olevaksi avaimella `monthly_report:2026-07`, ei jonottanut kaksoiskappaletta ja palautti lähetykselle `sent=0`, `retried=0` ja `failed=0`. Migraatioita, SMTP-asetuksia, DNS:ää tai cron-aikatauluja ei muutettu. Seuraava erääntyvä kooste tai raportti käyttää uutta pohjaa. Version 0.76.1 käyttöönotto on PASS.
