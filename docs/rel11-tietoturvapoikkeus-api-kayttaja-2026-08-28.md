# REL-11 tietoturvapoikkeus: tuotantotietokannan ainoa käyttäjä

## Päätös

Tila: **hyväksytty 28.8.2026**.

Poikkeuksen hyväksyjä ja riskin omistaja on Eero Tuomenoksa. Cloudcity ilmoitti 28.8.2026, ettei tietokantoihin saa erillisiä käyttäjiä eri oikeuksilla. REL-11-tuotannossa sallitaan siksi palveluntarjoajan ainoan tietokantakäyttäjän käyttäminen sekä migraatioihin että sovelluksen API-ajoon.

Poikkeus koskee vain:

- tietokantaa `dbtqq_aloitussivu_prod`;
- käyttäjää `ustqq_aloitussivu_prod`;
- REL-11:n Cloudcity-tuotantoa.

Salasanaa ei tallenneta repositorioon, dokumentteihin, komentohistoriaan tai keskusteluun.

## Hyväksytty poikkeama

Aiemmin vaadittu erillinen vain `SELECT`, `INSERT`, `UPDATE` ja `DELETE` -oikeuksilla toimiva API-käyttäjä ei ole Cloudcityn nykyisessä palvelumallissa toteutettavissa. Hyväksytty käyttäjä saa tietokantakohtaisen `ALL PRIVILEGES` -oikeuden Aloitussivun omaan tuotantokantaan.

Poikkeus ei hyväksy:

- `GRANT OPTION` -oikeutta;
- globaaleja oikeuksia `USAGE`-oikeuden lisäksi;
- oikeuksia WordPressin tai muiden palveluiden tietokantoihin;
- tietokantatunnuksen käyttämistä selaimessa tai julkisen web-juuren asetustiedostossa.

## Jäännösriski

Jos API-palvelin tai sen tietokantatunnus vaarantuu, hyökkääjä voisi sovellusdatan lukemisen ja muuttamisen lisäksi luoda, muuttaa tai poistaa Aloitussivun tuotantokannan tauluja. Erillisen vähimmän oikeuden käyttäjän puuttuessa tätä oikeustasoa ei voida poistaa sovellusasetuksella. Riski rajoittuu nykyisen grant-näytön perusteella Aloitussivun omaan tietokantaan eikä ulotu WordPress-kantaan tai käyttäjähallintaan.

## Kompensoivat suojaukset

1. `SHOW GRANTS` tarkistetaan ennen julkaisua. Hyväksy vain globaali `USAGE` ja tietokantakohtainen `ALL PRIVILEGES` täsmälleen kantaan `dbtqq_aloitussivu_prod`, ilman `GRANT OPTION` -oikeutta.
2. Tietokanta on erillinen WordPress-tietokannasta. Poikkeus ei laajenna oikeuksia muihin kantoihin.
3. Tunnuksella on vahva yksilöllinen salasana, jota säilytetään käyttäjän salasanojen hallinnassa.
4. Oikea `config.php` säilytetään web-juuren ulkopuolella hakemistossa `/home/seniorsurffi/aloitus-production/secrets/`, tiedosto-oikeudella 640. Paketit sisältävät vain malliasetuksen.
5. API käyttää kiinteitä parametrisoituja SQL-kyselyitä. Selain ei saa tietokantatunnusta.
6. Julkiset kirjoitusreitit ovat validoituja ja nopeusrajoitettuja. Ylläpitoreitit vaativat Firebase-tunnistuksen ja tietokannan aktiivisen roolin.
7. Tuotantokannasta otetaan palautuspiste ennen lopullista tuontia ja heti hyväksytyn avauksen jälkeen. Palautusoikeus varmennetaan yksityisessä ylläpitolokissa.
8. Audit-loki, API-health ja kirjoittavien toimintojen smoke tarkistetaan avauksessa sekä 1.9. ennen laajaa tiedotusta.

## Julkaisuportti

Poikkeus poistaa erillisen API-käyttäjän puuttumisen itsenäisenä NO-GO-esteenä. OPS-04 voidaan merkitä PASS vasta, kun:

- `SHOW GRANTS` vastaa tämän poikkeuksen rajausta;
- tuotannon `config.php` on valmis ja oikeus on 640;
- yhteyskoe tulostaa `database=up`;
- health palauttaa aktivoinnin jälkeen `ok/up/v1`;
- tuore tietokantavarmistus ja palautuspolku on kirjattu.

STOP, jos käyttäjällä on oikeuksia muuhun tietokantaan, globaaleja oikeuksia `USAGE`-oikeuden lisäksi, `GRANT OPTION`, asetustiedosto on julkisessa hakemistossa tai tietokannan palautuspiste puuttuu.

## Seuranta

Poikkeus tarkistetaan viimeistään 30.9.2026 ja aina, jos Cloudcity muuttaa käyttäjähallintaa, hosting-ratkaisu vaihtuu tai tietokantatunnus joudutaan kierrättämään. Jos erillinen vähimmän oikeuden käyttäjä tulee mahdolliseksi, API siirretään sille ja tämä poikkeus suljetaan.
