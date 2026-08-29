# Karkea käyttötilasto ja tietosuoja

Tarkistuspäivä: 2026-08-29

## Mitä kerätään

Sivustolla voidaan kerätä erittäin karkeaa käyttötilastoa palvelun kehittämistä varten:

- sivulatausten määrä päiväkohtaisesti
- linkkiklikkausten määrä päiväkohtaisesti
- klikattujen linkkien osoite ja näkyvä nimi ylläpidon raportointia varten
- sivun avaustavan luokka: suora avaus, sisäinen siirtymä, SeniorSurf-sivusto, hakukone tai muu ulkoinen sivusto
- selaimen ilmoittama siirtymätyyppi: uusi siirtymä, uudelleenlataus, historia-avaus tai esilataus
- tieto siitä, oliko selainhistorian pituus avaushetkellä yksi
- käyttäjän paikallinen kellonaikatunti väliltä 0–23
- kampanjalähteen sallittu luokka: `opastus`, `esite`, `qr`, `kirje`, `some`, `lehti` tai `other`
- näyttötila: tavallinen selain tai erillisenä asennettu verkkosovellus
- aloitussivuohjeen vaihe: avaus, selainvalinta, valmiiksi kuittaus tai jakaminen sekä selain- tai jakotavan sallittu luokka

Selain lähettää `pageview`-, `linkClick`- ja `guide`-tapahtumat saman originin Cloudcity-API:in. API tallentaa vain päiväkohtaiset koosteet MariaDB-tauluihin `usage_daily`, `usage_page_daily`, `usage_link_daily` ja `usage_context_daily`. Firestore ei ole julkaistavan version käyttötilaston tietovarasto.

Viittaavasta sivusta ei lähetetä eikä tallenneta osoitetta. Selain luokittelee sen ennen lähetystä yhdeksi yllä luetelluista avaustavoista. Tuntemattomia kampanja-, selain-, jakotapa- tai muita luokitteluarvoja ei tallenneta.

## Mitä ei kerätä

Toteutus ei käytä:

- evästeitä
- localStoragea tai muuta selainmuistia käyttäjän tunnistamiseen
- käyttäjä-ID:tä
- istuntotunnistetta
- selaimen sormenjälkeä
- IP-osoitteen tallennusta
- tarkkaa maantieteellistä sijaintia
- viittaavan sivun osoitteen tallennusta
- mitään tilastointia varten tehtävää eväste-, localStorage- tai muuta päätelaitetallennusta

Cloudcity-API käsittelee HTTP-pyynnön teknistä verkko-osoitetta pyynnön aikana, mutta raakaa IP-osoitetta ei kirjoiteta käyttötilastoon. Väärinkäytön estävä pyyntörajoitus käyttää palvelinsalaisuudella muodostettua HMAC-SHA-256-tiivistettä ja lyhyttä aikaikkunaa.

Tilastointi ei kirjoita tietoa käyttäjän päätelaitteelle eikä lue sieltä tilastointitietoa. Tämän vuoksi tilastointi ei perustu päätelaitetallennusta koskevaan suostumukseen eikä sivulla tarvita tilastointievästeiden suostumusbanneria. Käyttäjän omat palveluasetukset ovat erillisiä, palvelun nimenomaisen toiminnan toteuttavia asetuksia. Tulkinta tarkistutetaan Vanhustyön keskusliiton tietosuojavastaavalla ennen seuraavaa laajaa julkaisua.

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
- suorien avausten osuuden ja seitsemän päivän liukuvan keskiarvon
- avausten kellonaikajakauman
- aloitussivuohjeen suppilon ja onnistumisprosentin
- kampanjalähteiden jakauman

Tilaston luku on rajattu Cloudcity-API:ssa hyväksytyille ylläpitäjille. Ylläpitäjä tunnistetaan väliaikaisesti Firebase Authenticationin Google-kirjautumisella, minkä lisäksi API vaatii aktiivisen MariaDB-roolin.

## Säilytysaika

Tunnisteettomat päiväkohtaiset käyttötilastokoosteet, mukaan lukien `usage_context_daily`, säilytetään enintään 24 kuukautta. Vanhemmat koosteet poistetaan määräaikaisessa ylläpidossa. Säilytysaika ja toteutunut poistokäytäntö tarkistetaan osana julkaisun jälkeistä tietosuojaseurantaa.
