# Frontendin data-providerit

Kaikki julkaisuun kuuluvat julkiset ja ylläpidon tietovirrat kulkevat `DataProvider`-rajapinnan kautta. Provider valitaan yhdellä build-muuttujalla:

| Arvo | Käyttö |
| --- | --- |
| `cloudcity` | Ensisijainen julkaisu- ja staging-provider saman originin `/api/v1`-rajapintaan. |
| `firebase-rollback` | Määräaikainen palautusvaihtoehto nykyisiin Firestore-kokoelmiin. |
| `local` | Paikallinen käyttö ilman etäpalvelua; ei myönnä ylläpito-oikeuksia. |

Valmiit komennot ovat:

```powershell
npm run build:cloudcity
npm run build:staging
npm run build:firebase-rollback
npm run build:local-provider
```

`build:staging` käyttää otsaketta `X-Firebase-ID-Token`, jotta staging-originin HTTP Basic Auth voi käyttää tavallista `Authorization`-otsaketta. Tuotantobuild käyttää `Authorization: Bearer <Firebase-ID-token>` -otsaketta. Firebase Authentication säilyy ylläpitäjän kirjautumisessa, mutta Cloudcity-provider ei käytä Firestorea tietolähteenä eikä hyväksy selaimen sähköpostia tai localStorage-arvoa käyttöoikeudeksi.

Julkiset listat ladataan käynnistyksessä ja päivitetään kirjoituksen jälkeen. Ylläpidon listat käyttävät hallittua 30 sekunnin kyselyväliä reaaliaikaisen Firestore-kuuntelun sijaan. Verkkovirheessä palaute, testipalaute ja linkki-ilmoitus säilyvät selaimen paikallisessa jonossa samalla asiakaskohtaisella UUID:llä, joten uudelleenlähetys Cloudcity-API:in on idempotentti.

Vite-muuttujiin ei lisätä salaisuuksia. `VITE_FIREBASE_*`-arvot ovat Firebase Web SDK:n julkisia asetuksia; tietokantatunnukset, palvelinavaimet ja tokenit kuuluvat selaimen ja Git-repositorion ulkopuolelle.
