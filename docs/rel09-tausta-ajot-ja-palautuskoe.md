# REL-09: tausta-ajot ja palautuskoe

Tämä ohje koskee vain Aloitussivun Cloudcity-stagingiä. Tuotantoa, WordPressin tiedostoja tai WordPressin tietokantaa ei muuteta eikä palauteta tässä paketissa. Salaisuuksia, ylläpitäjien tunnisteita tai yksityisten palautteiden sisältöä ei kopioida testituloksiin.

## 1. Paketin palvelinsijoittelu

REL-09-paketin hakemistot sijoitetaan stagingin ympäristöjuureen näin:

```text
/website.aloitussivu-staging/
  bootstrap.php
  src/
  cron/ncsc.php
  secrets/config.php
  logs/
  cache/
  protected_uploads/
  public_html/
```

Selainpohjainen Cloudcity-tiedostonhallinta ei pura ZIP-pakettia luotettavasti. Käytä paketista valmiiksi purettua hakemistoa `.tmp/rel09-staging-package/`: lataa `src`-hakemiston PHP-tiedostot palvelimen `src`-hakemistoon, `cron/ncsc.php` uuteen `cron`-hakemistoon ja `public_html`-sisältö vastaavaan julkiseen hakemistoon. Älä korvaa `secrets/config.php`-tiedostoa malliasetuksella. Älä lataa ZIPiä `public_html`-hakemistoon.

Palvelimella hakemistojen `src`, `cron`, `secrets`, `logs`, `cache` ja `protected_uploads` oikeus on `750`. PHP-tiedostojen ja `secrets/config.php`-tiedoston oikeus on `640`. Julkisen hakemiston aiemmin hyväksyttyjä oikeuksia ei muuteta.

## 2. Käyttötilasto

Selain lähettää vain `pageview`- ja `linkClick`-tapahtumia saman originin reitille `POST /api/v1/usage-events`. API tallentaa Europe/Helsinki-päivän aggregaatit tauluihin `usage_daily`, `usage_page_daily` ja `usage_link_daily`. Raakaa IP-osoitetta, käyttäjätunnistetta, evästettä, selaimen sormenjälkeä tai user agentia ei tallenneta käyttötilastoon.

Savukokeessa verrataan ennen ja jälkeen vain kyseisen päivän kokonaislaskureita. Julkiseen dokumentaatioon ei kopioida yksittäisten palautteiden tai yksityisten näkymien sisältöä.

## 3. NCSC-ajon rakenne

Sama palvelinluokka suorittaa sekä CLI-cronin että ylläpidon `POST /api/v1/admin/ncsc-run` -käsiajon. Ajo:

- hakee vain Kyberturvallisuuskeskuksen sallituista HTTPS-osoitteista;
- käyttää MariaDB:n yhteyskohtaista `GET_LOCK`-lukkoa, joten rinnakkainen ajo ohitetaan;
- ohittaa saman lähdeosoitteen kuuden päivän ajan onnistuneen ajon jälkeen;
- käyttää lähdeosoitteesta ja alkuperäisestä otsikosta muodostettua determinististä tunnistetta sekä upsertia, joten uusinta-ajo ei luo kaksoisvaroitusta;
- tallentaa yhteenvedon `ncsc_scrape_logs`-tauluun ja ylläpidon käsiajosta lisäksi henkilötiedottoman auditointimerkinnän;
- antaa automaattivaroitukselle 28 päivän voimassaoloajan;
- ei tarvitse tekoälypalvelun avainta.

## 4. Cloudcity-cron

Valitse Cloudcityn **Ajastettu ajo** -lomakkeessa toimintatavaksi **Aja PHP-skripti**. Palvelu suorittaa tiedoston samalla PHP-versiolla kuin webhotelli, joten lomakkeeseen ei kirjoiteta PHP-binäärin komentorivipolkua. Syötä kotihakemistoon suhteutettu PHP-skriptin polku:

```text
website.aloitussivu-staging/cron/ncsc.php
```

Valitse aikatauluksi **Vapaa ajastus**, joka suoritetaan kahdesti arkipäivisin Europe/Helsinki-ajassa:

```text
30 11,15 * * 1-5
```

Anna lyhyeksi nimeksi esimerkiksi `Aloitussivu NCSC staging`, laita **Testaa toiminta** päälle ensimmäisellä tallennuksella ja jätä **Poista käytöstä** pois päältä. Älä lisää lomakkeeseen salasanoja tai tietokantatunnuksia.

Käsin tehdyssä ensimmäisessä ajossa turvallinen JSON-yhteenveto näyttää sekä UTC- että Europe/Helsinki-ajan. Hyväksyttävä tulos on `completed` tai kuuden päivän uusintaeston vuoksi `completed`, jossa kohde on ohitettu. `failed` vaatii `ncsc_scrape_logs`-näkymän tarkistuksen ennen jatkoa.

## 5. Tausta-ajon staging-kokeet

1. Ota ennen käsiajoa taulujen `scam_alerts` ja `ncsc_scrape_logs` rivimäärät.
2. Tee hyväksytyllä editor- tai admin-roolilla yksi ylläpidon **Aja nyt** -käsiajo.
3. Tarkista, että ylläpidon ajoloki näyttää uuden onnistuneen tai hallitusti ohitetun ajon.
4. Tee heti toinen käsiajo. Sen pitää ohittaa äskettäin käsitellyt lähteet eikä `scam_alerts`-rivimäärä saa kasvaa samoista varoituksista.
5. Käynnistä tarvittaessa toinen ajo ensimmäisen ollessa kesken vain hallitussa staging-kokeessa. Toisen pitää palautua ohitettuna lukon vuoksi.
6. Tarkista virheloki vain turvallisella, palautettavalla staging-kokeella. Älä muuta virallista lähdeosoitetta tuotannossa.

## 6. Tietokannan varmistus ja palautuskoe

1. Vie nykyinen Aloitussivun staging-tietokanta phpMyAdminista SQL-tiedostoksi repositorion ulkopuoliseen yksityiseen kansioon.
2. Kirjaa vain viennin aika, koko ja SHA-256-tiiviste. Älä kirjaa SQL-sisältöä.
3. Luo erillinen tyhjä staging-palautustietokanta ja sille erillinen vähimmän oikeuden käyttäjä. Älä käytä WordPress-tietokantaa.
4. Tuo SQL-varmistus tyhjään palautustietokantaan.
5. Vertaa `schema_migrations`-versiot ja kaikkien Aloitussivun 15 taulun rivimäärät lähteeseen.
6. Tee palautustietokantaan vain erillisen, väliaikaisen staging-konfiguraation kautta health-, julkinen luku-, kirjoitus- ja ylläpitolukukoe. Älä vaihda varsinaista stagingiä palautustietokantaan ilman tuoretta varmistusta ja täsmällistä palautussuunnitelmaa.
7. Poista testissä luotu kirjoitusrivi tai palauta palautustietokanta uudelleen samasta varmistuksesta. Varsinaisen stagingin dataa ei poisteta.

## 7. Aloitussivun erillinen palautusharjoitus

Palautusharjoituksen vaikutusalue on vain:

```text
/website.aloitussivu-staging/
Aloitussivun staging-tietokanta
```

Harjoituksessa dokumentoidaan, että edellinen tunnettu frontend/API-paketti voidaan palauttaa ympäristöjuureen ja Aloitussivun staging-tietokanta voidaan palauttaa omaan tyhjään tai korvattavaan tietokantaansa. WordPressin hakemisto `/website.wp33403/` ja WordPress-tietokanta jätetään kokonaan palautuksen ulkopuolelle. Tämän jälkeen toistetaan Aloitussivun health-, etusivu-, ylläpito- ja kirjoitussavukokeet sekä WordPressin vain lukeva vertailusavukoe.

## 8. CONTENT-P1-julkaisuportti

REL-09 ei voi sulkeutua ennen kuin vastuuhenkilö vahvistaa:

- rekisterinpitäjän virallisen nimen;
- tietosuoja- ja saavutettavuuskysymysten yhteystiedon;
- saavutettavuuspalautteen kanavan;
- palautteiden, testipalautteiden, liitteiden ja käyttötilaston hyväksytyt säilytysajat;
- tietosuojaselosteen ja saavutettavuusselosteen hyväksyjän sekä hyväksymispäivän.

Näitä tietoja ei arvata teknisessä toteutuksessa. Hyväksynnän jälkeen luonnosmerkinnät poistetaan julkisilta sivuilta ja toteutunut Cloudcity MariaDB/API -malli sekä väliaikainen Firebase Authentication kuvataan oikein.
