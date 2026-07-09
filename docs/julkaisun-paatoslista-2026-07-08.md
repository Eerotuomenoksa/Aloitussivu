# Julkaisun päätöslista 8.7.2026

Tämä lista kokoaa päätökset, jotka kannattaa lukita ennen elokuun varsinaista viimeistelyä ja ennen syyskuun palvelin- tai staging-työtä.

## Päätettävät asiat

| Päätös | Miksi tarvitaan | Suositeltu linja | Viimeistään |
| --- | --- | --- | --- |
| Virallinen nimi | Nimi vaikuttaa metatietoihin, viestintään, saavutettavuusselosteeseen ja esittelymateriaaleihin | Päätä jääkö nimeksi `Aloitussivu` vai käytetäänkö erillistä julkaisunimeä | 5.8.2026 |
| Lopullinen osoite | SEO, App Check, Firebase Authentication, CORS ja jakolinkit riippuvat lopullisesta osoitteesta | Valitse oma domain, SeniorSurf-polku tai sovittu väliaikainen hosting-osoite | 5.8.2026 |
| Palvelinmalli | Suojausotsikot, välimuisti, pakkaus, sähköpostit ja mahdollinen backend riippuvat alustasta | Päätä Cloudcity, Firebase Hosting välivaiheena tai muu tuotantomalli | 15.9.2026 |
| Ylläpidon sähköposti-ilmoitukset | Linkki-ilmoitukset ja automaatiovirheet tarvitsevat vastuullisen vastaanoton | Toteuta vain palvelinpuolelta, ei frontendin salaisuuksilla | 19.9.2026 |
| Nimipäivätoiminto | Nykyinen testirajallinen API ei ole hyvä tuotantoriippuvuus | Piilota tuotannosta tai vaihda ostettuun tiedostopohjaiseen dataan | 19.9.2026 |
| Ylläpidon julkiset linkit | Ylläpito ei saa näyttää tavalliselle käyttäjälle viralliselta palvelusisällöltä | Poista footerista tai pidä vain sovitussa testikäytössä, lisää noindex ei-julkisille sivuille | 23.9.2026 |
| Tietosuojan ja saavutettavuuden yhteystiedot | Selosteet tarvitsevat lopulliset vastuutiedot | Lukitse yhteyshenkilö, palautekanava ja organisaatioteksti | 23.9.2026 |
| Julkaisuun kuulumattomat linkit | Testi-, ylläpito- ja epävarmat linkit heikentävät luotettavuutta | Tee linkkien siivouslista ja päätä poistetaanko, piilotetaanko vai jätetäänkö jatkokehitykseen | 23.9.2026 |
| Lighthouse- ja auditointiraporttien arkistointi | Todisteaineisto kannattaa säilyttää hallitusti, mutta kaikki renderöinnit eivät kuulu repoon | Päätetty 9.7.2026: `docs/Lighthouse/` pidetään paikallisena eikä viedä GitHubiin | tehty |
| Alueellisten linkkien täydennyksen laajuus | Kaikkia 308 kuntaa ei kannata täyttää kerralla | Aloita hyvinvointialueista, joissa sekä julkinen liikenne että palveluliikenne puuttuvat usealta kunnalta | 9.8.2026 |

## Ehdotettu elokuun aloituspalaverin agenda

1. Lukitaan nimi ja osoite.
2. Päätetään hosting-polku ja mahdollinen välivaihe.
3. Päätetään nimipäivätoiminnon kohtalo tuotannossa.
4. Valitaan ylläpidon sähköposti- ja vastuuhenkilömalli.
5. Rajataan ennen julkaisua korjattavat alueelliset linkit.
6. Päätetään, mitkä raportit ja Office-aineistot lisätään versionhallintaan.

## Päätöksen jälkeen tehtävät tekniset päivitykset

- Päivitä canonical-osoitteet, sitemap, manifest ja jakometatiedot lopulliseen osoitteeseen.
- Päivitä Firebase Authenticationin sallitut domainit, API key -rajoitukset, App Check ja CORS.
- Varmista hostingin suojausotsikot, gzip/Brotli-pakkaus ja välimuistit.
- Aja uusi Lighthouse-mittaus lopullisessa originissa.
- Päivitä tietosuoja-, saavutettavuus- ja tukijasivut lopullisilla nimillä ja yhteystiedoilla.
