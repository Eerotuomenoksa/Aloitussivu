# REL-08 – Firestore-vienti ja MariaDB-tuontiharjoitus

Tämä ohje koskee vain Aloitussivun Firestore-datan siirtoa Cloudcityn staging-tietokantaan. Tuotantoa, WordPressiä tai Firestore-dataa ei muuteta REL-08-kuivaharjoituksessa.

## Tietoryhmät

Tuontiin kuuluvat `linkReports`, `feedbackItems`, `feedbackAttachments`, `testFeedbackResponses`, `approvedLinks`, `blockedLinks`, `scamAlerts`, `ncscScrapeLog` ja `usageStats`. `adminStats` viedään erilliseen arkistoon, mutta sitä ei tuoda aktiiviseen MariaDB-skeemaan.

Migraatiotyökalu:

- lukee Firestorea vain luku -operaatioilla;
- tarkistaa projektitunnuksen ennen vientiä;
- muuntaa camelCase-kentät MariaDB-skeemaan;
- säilyttää alkuperäiset tietuetunnisteet;
- muodostaa idempotentin `INSERT ... ON DUPLICATE KEY UPDATE` -SQL:n;
- purkaa sallitut PNG-, JPEG-, WebP- ja GIF-liitteet suojattuun hakemistorakenteeseen;
- tarkistaa liitteen MIME-tyypin, koon, Base64-muodon ja tiedostoallekirjoituksen;
- tuottaa vain lukumääriä, aikavälejä ja tunnisteiden tiivisteitä sisältävän täsmäytysraportin.

## Salaisuudet ja yksityinen aineisto

Admin SDK -avainta, Firestore-vientiä, tuonti-SQL:ää tai liitteitä ei saa tallentaa Git-repositorioon, pilvisynkronoituun kansioon, lokiin tai keskusteluun. Skriptit keskeyttävät ajon, jos syöte- tai tulospolku on nykyisen repositorion sisällä.

Käytä esimerkiksi paikallista, synkronoimatonta kansiota:

```powershell
$rel08Private = Join-Path $env:LOCALAPPDATA 'Aloitussivu-REL08-private'
New-Item -ItemType Directory -Path $rel08Private -ErrorAction Stop
```

Tallenna Firebase Consolesta hallitusti ladattu Admin SDK -avaintiedosto tähän kansioon. Älä avaa tai kopioi JSON-sisältöä keskusteluun. Avain poistetaan tai mitätöidään, kun vienti ja mahdollinen delta-vienti ovat valmiit.

## 1. Paikallinen testi

```powershell
Set-Location C:\dev\Aloitussivu
npm run rel08:test
npm run check:secrets
```

Odotettu tulos on `REL-08 migration tests: OK` ja salaisuusskannauksen onnistuminen.

## 2. Firestore-vienti

Aseta avaimen polku vain nykyiseen PowerShell-prosessiin ja anna uusi vientitiedostonimi:

```powershell
$rel08Private = Join-Path $env:LOCALAPPDATA 'Aloitussivu-REL08-private'
$env:GOOGLE_APPLICATION_CREDENTIALS = Join-Path $rel08Private 'firebase-admin-rel08.json'
$exportFile = Join-Path $rel08Private 'firestore-export-full-2026-08-24.json'

npm run rel08:export -- `
  --project-id aloitussivu-5d50c `
  --output $exportFile
```

Komento tulostaa vain projektitunnuksen, vientiajan ja kokoelmien rivimäärät. Se ei tulosta dokumenttien sisältöä tai avaimen polkua.

## 3. Tuontiaineiston rakentaminen

Tuloshakemiston täytyy olla uusi:

```powershell
$importDir = Join-Path $rel08Private 'import-full-2026-08-24-01'

npm run rel08:build-import -- `
  --input $exportFile `
  --output-dir $importDir
```

Tulokset:

- `import.sql`: idempotentti MariaDB-tuonti, sisältää yksityistä aineistoa;
- `verify.sql`: henkilödataa näyttämättömät lukumäärä-, aikaväli- ja pistokoekyselyt;
- `reconciliation-report.json`: lähde- ja tavoiterivimäärät sekä tiivistetyt pistokoeavaimet;
- `exceptions.json`: vain tiivistetty dokumenttitunniste ja poikkeamakoodi;
- `attachments/`: suojattuun palvelinhakemistoon siirrettävät liitteet;
- `adminStats-archive.json`: poistuvan toiminnon arkisto, ei MariaDB-tuontiin.

Jos `exceptionCount` on suurempi kuin nolla, `import.sql`-tiedostoa ei muodosteta. Poikkeamat ratkaistaan kirjallisesti ennen staging-tuontia.

## 4. Staging-tuonti ja idempotenssikoe

1. Ota phpMyAdminissa uusi staging-tietokannan SQL-vienti ennen muutosta.
2. Varmista, että kohdetietokanta on staging, ei tuotanto eikä WordPressin tietokanta.
3. Jos `attachments` sisältää tiedostoja, lataa ne palvelimen `/website.aloitussivu-staging/protected_uploads/`-hakemistoon täsmälleen paketin alihakemistorakenteella. Hakemistojen oikeus on `750` ja tiedostojen tavoiteoikeus `640`.
4. Tuo `import.sql` phpMyAdminin **Tuo/Import**-toiminnolla staging-tietokantaan.
5. Suorita `verify.sql` ja vertaa tuloksia `reconciliation-report.json`-raporttiin. Kirjaa vain lukumäärät, aikavälit ja tiivisteet.
6. Tuo sama `import.sql` toisen kerran.
7. Suorita `verify.sql` uudelleen. Kaikkien rivimäärien pitää pysyä samoina.
8. Testaa stagingissä julkiset listat, yksityiset ylläpitolistat ja mahdollinen liitteen avaus hyväksytyllä ylläpitäjällä. Kokeile yksityisen aineiston suoraa URL-avausta kirjautumatta; sen pitää epäonnistua.

Älä kopioi Firestore-viennin, `import.sql`-tiedoston tai palautesisältöjen rivejä dokumentaatioon tai keskusteluun.

## 5. Delta-harjoitus

Delta-vienti voidaan muodostaa uudella tiedostonimellä:

```powershell
$deltaFile = Join-Path $rel08Private 'firestore-export-delta-2026-08-24.json'

npm run rel08:export -- `
  --project-id aloitussivu-5d50c `
  --output $deltaFile `
  --since '2026-08-24T09:00:00Z'
```

Delta sisältää aikaleiman jälkeen luodut tai päivitetyt dokumentit. Firestore ei säilytä poistojen aikaleimaa, joten tuotantovaihdossa tehdään kirjoituskatko ja lopullinen koko tunnistejoukon täsmäytys; pelkkä delta ei todista poistojen vastaavuutta.

Tuotantovaihdon käsikirjoituksen kellonajat:

1. **T−15 min:** ilmoita muutosikkuna ja varmista palautuspiste.
2. **T0:** estä uudet Firestore- ja Cloudcity-kirjoitukset hallitulla huoltotilalla.
3. **T+2 min:** tee lopullinen Firestore-vienti ja tunnistejoukon vertailu.
4. **T+7 min:** rakenna ja tuo delta MariaDB:hen.
5. **T+12 min:** aja lukumäärä-, aikaväli-, pistokoe- ja yksityisyystarkistukset.
6. **T+17 min:** vaihda hyväksytty Cloudcity-build käyttöön ja tee smoke-testit.
7. **T+22 min:** avaa kirjoitukset vain yhteen tietovarastoon.
8. **T+25 min:** päätä muutosikkuna tai käynnistä palautus.

Suunniteltu kirjoituskatkon enimmäiskesto on 25 minuuttia. Aikaa tarkennetaan staging-kuivaharjoituksen mitatun keston perusteella.

## Palautus stagingissä

Jos tuonti epäonnistuu, pidä kirjoitukset suljettuina, palauta vain Aloitussivun staging-tietokanta ennen tuontia otetusta viennistä ja poista ainoastaan täsmällisesti tunnistetut REL-08-liitetiedostot. WordPressin tiedostoja tai tietokantaa ei palauteta.
