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

Käytä ympäristökohtaisilla arvoilla seuraavaa muotoa:

```sql
INSERT INTO admin_users (firebase_uid, email, role, active)
VALUES ('<FIREBASE_UID>', '<VERIFIED_EMAIL>', 'admin', 1)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  role = VALUES(role),
  active = VALUES(active);
```

Älä tallenna täytettyä komentoa, tietokantavientiä tai käyttäjälistaa Git-repositorioon. Oikeus poistetaan välittömästi käytöstä komennolla `UPDATE admin_users SET active = 0 WHERE firebase_uid = '<FIREBASE_UID>';`. API tarkistaa jokaisella ylläpitopyynnöllä allekirjoitetun Firebase-tokenin UID:n, rivin aktiivisuuden ja roolin. UID on oikeuspäätöksen ensisijainen tunniste; tokenin valinnaisten sähköposti- tai provider-väitteiden puuttuminen ei estä ennalta provisioitua UID:tä. Selaimen sähköpostia ei hyväksytä oikeusväitteeksi.
