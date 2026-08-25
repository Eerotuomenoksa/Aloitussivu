# Karkea käyttötilasto ja tietosuoja

Tarkistuspäivä: 2026-08-25

## Mitä kerätään

Sivustolla voidaan kerätä erittäin karkeaa käyttötilastoa palvelun kehittämistä varten:

- sivulatausten määrä päiväkohtaisesti
- linkkiklikkausten määrä päiväkohtaisesti
- klikattujen linkkien osoite ja näkyvä nimi ylläpidon raportointia varten

Selain lähettää `pageview`- ja `linkClick`-tapahtumat saman originin Cloudcity-API:in. API tallentaa vain päiväkohtaiset koosteet MariaDB-tauluihin `usage_daily`, `usage_page_daily` ja `usage_link_daily`. Firestore ei ole julkaistavan version käyttötilaston tietovarasto.

## Mitä ei kerätä

Toteutus ei käytä:

- evästeitä
- localStoragea tai muuta selainmuistia käyttäjän tunnistamiseen
- käyttäjä-ID:tä
- istuntotunnistetta
- selaimen sormenjälkeä
- IP-osoitteen tallennusta
- tarkkaa maantieteellistä sijaintia

Cloudcity-API käsittelee HTTP-pyynnön teknistä verkko-osoitetta pyynnön aikana, mutta raakaa IP-osoitetta ei kirjoiteta käyttötilastoon. Väärinkäytön estävä pyyntörajoitus käyttää palvelinsalaisuudella muodostettua HMAC-SHA-256-tiivistettä ja lyhyttä aikaikkunaa.

## Maakohtainen tilastointi

Maakohtainen tilastointi vaatisi käytännössä IP-osoitteen tai hosting-palvelun valmiiksi tuottaman maatiedon käsittelyä.

Tietosuojan kannalta turvallisin nykyinen linja on olla keräämättä maatietoa. Jos maataso halutaan myöhemmin, suositus on:

- älä tallenna IP-osoitetta
- päättele vain maa palvelinpuolella
- tallenna vain päivätason laskuri, esimerkiksi `countries.FI = 123`
- kerro asiasta tietosuojaselosteessa

## Ylläpidon näkymä

Ylläpidon `ehdotukset.html`-näkymä näyttää:

- päiväkohtaiset luvut
- valmiit aikavälit: päivä, viikko, kuukausi, kvartaali, vuosi
- oman päivämäärävälin
- klikatuimmat linkit valitulla aikavälillä

Tilaston luku on rajattu Cloudcity-API:ssa hyväksytyille ylläpitäjille. Ylläpitäjä tunnistetaan väliaikaisesti Firebase Authenticationin Google-kirjautumisella, minkä lisäksi API vaatii aktiivisen MariaDB-roolin.

## Säilytysaika

Tunnisteettomat päiväkohtaiset käyttötilastokoosteet säilytetään enintään 24 kuukautta. Vanhemmat koosteet poistetaan määräaikaisessa ylläpidossa. Säilytysaika ja toteutunut poistokäytäntö tarkistetaan osana julkaisun jälkeistä tietosuojaseurantaa.
