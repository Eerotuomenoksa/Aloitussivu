# Karkea käyttötilasto ja tietosuoja

Tarkistuspaiva: 2026-05-26

## Mitä kerätään

Sivustolla voidaan kerätä erittäin karkeaa käyttötilastoa palvelun kehittämistä varten:

- sivulatausten määrä päiväkohtaisesti
- linkkiklikkausten määrä päiväkohtaisesti
- klikattujen linkkien osoite ja näkyvä nimi ylläpidon raportointia varten

Tilasto tallennetaan Firestore-kokoelmaan `usageStats`, jossa yksi dokumentti vastaa yhtä päivää.

## Mitä ei kerätä

Toteutus ei käytä:

- evästeitä
- localStoragea tai muuta selainmuistia käyttäjän tunnistamiseen
- käyttäjä-ID:tä
- istuntotunnistetta
- selaimen sormenjälkeä
- IP-osoitteen tallennusta
- tarkkaa maantieteellistä sijaintia

Cloud Function näkee HTTP-pyynnön teknisen IP-tiedon pyynnön käsittelyn aikana, mutta sitä ei kirjoiteta tietokantaan.

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

Tilaston luku on rajattu Firestore-säännöillä ylläpitäjille.
