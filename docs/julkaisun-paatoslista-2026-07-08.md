# Julkaisun päätöslista 8.7.2026

> Päivitetty 25.8.2026: palvelun virallinen nimi on `Seniorin aloitussivu` ja käyttäjille viestittävä osoite `https://seniorsurf.fi/aloitus/`. Tavoitejulkaisu on 1.9.2026 ja ehdoton takaraja 3.9.2026. Julkaisu tehdään Cloudcityn webhotellissa ilman erillistä domainia. Nimipäivät ja tekoälyavustaja jätetään ensimmäisestä julkaisusta pois. Paikallisuutiset säilytetään oletuksena piilotettuina ja käyttäjän asetuksista avattavina. Sivua tukemassa -sivu poistetaan. Beta-merkintä sekä sisäiset testi-, kehitysjono-, ylläpito- ja muutoslokilinkit piilotetaan julkaisukandidaatista viimeistään 31.8. Ajantasainen avoin lista on `TODO_HUMAN.md` ja päiväkohtainen työpakettijako `docs/julkaisun-paivakohtaiset-tyopaketit-2026-08-14.md`.

Tämä lista kokoaa päätökset, jotka kannattaa lukita ennen elokuun varsinaista viimeistelyä ja ennen syyskuun palvelin- tai staging-työtä.

## Alkuperäinen päätöslista

| Päätös | Miksi tarvitaan | Suositeltu linja | Viimeistään |
| --- | --- | --- | --- |
| Virallinen nimi | Nimi vaikuttaa metatietoihin, viestintään, saavutettavuusselosteeseen ja esittelymateriaaleihin | Ensimmäisen julkaisun nimi on `Seniorin aloitussivu` | päätetty 25.8.2026 |
| Lopullinen osoite | SEO, App Check, Firebase Authentication, CORS ja jakolinkit riippuvat lopullisesta osoitteesta | Käyttäjille viestittävä ja kanoninen polku on `seniorsurf.fi/aloitus/`; Cloudcityn tuotantoalidomain säilyy teknisenä julkaisukohteena | päätetty 25.8.2026 |
| Palvelinmalli | Suojausotsikot, välimuisti, pakkaus ja integraatiot riippuvat alustasta | P1: ensimmäinen julkaisu Cloudcityn webhotellissa; eristä Aloitussivu WordPressistä ja hyväksytä staging, palvelinasetukset, varmistukset ja muutosikkunat Fakiirimedialla | 25.8.2026 |
| Ylläpidon sähköposti-ilmoitukset | Linkki-ilmoitukset ja automaatiovirheet tarvitsevat vastuullisen vastaanoton | Ei estä ensimmäistä julkaisua; sovi siihen asti manuaalinen tarkistusrytmi ja toteuta automaatio palvelinpuolelta myöhemmin | julkaisun jälkeen |
| Nimipäivätoiminto | Nykyinen testirajallinen API ei ole hyvä tuotantoriippuvuus | Jätä ensimmäisestä julkaisusta pois | päätetty ja toteutettu |
| Ylläpidon julkiset linkit | Ylläpito ei saa näyttää tavalliselle käyttäjälle viralliselta palvelusisällöltä | Pidä testauksen ajan, piilota beta-, Muutosloki- ja Ylläpito-linkit julkaisukandidaatista; käytä sisäisillä sivuilla `noindex`-rajausta | 31.8.2026 |
| Tietosuojan ja saavutettavuuden yhteystiedot | Selosteet tarvitsevat lopulliset vastuutiedot | P1: lukitse yhteyshenkilö, palautekanava ja organisaatioteksti ennen julkaisukandidaattia | 27.8.2026 |
| Julkaisuun kuulumattomat linkit | Testi-, ylläpito- ja epävarmat linkit heikentävät luotettavuutta | Piilota sisäiset linkit ja siirrä epävarmat sisällöt jatkokehitykseen ennen sisältöjäädytystä | 27.8.2026 |
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
