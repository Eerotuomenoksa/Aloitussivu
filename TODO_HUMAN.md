# TODO_HUMAN

Tässä tiedostossa on jäljellä oleva siivous- ja tarkistuslista. Varsinaiset manuaaliset tietoturvakohdat on tehty, paitsi nimipäivädataan liittyvä SEC-015, joka tehdään aikaisintaan elokuussa 2026.

Älä kirjoita salasanoja, API-avaimia, tokeneita tai service account -avainten sisältöjä tähän tiedostoon.

## Julkaisu 1.–3.9.2026

Tila: Julkaisun rajaus päätetty 13.8.2026. Tavoitejulkaisu on 1.9.2026 ja ehdoton takaraja 3.9.2026. Ajantasainen päiväkohtainen toteutusjärjestys on dokumentissa `docs/julkaisun-paivakohtaiset-tyopaketit-2026-08-14.md`, ja toteutuksen tila kirjataan tiedostoon `docs/julkaisupaivakirja-2026-09.md`.

### Päätetty

- Julkaisunimi on `Seniorin aloitussivu` ja käyttäjille viestittävä osoite on `https://seniorsurf.fi/aloitus/`. Päätös vahvistettiin 25.8.2026.
- Julkaisu tehdään Cloudcityn webhotelliin. Erillistä domainia ei hankita tässä vaiheessa.
- Nimipäivät ja tekoälyavustaja eivät kuulu ensimmäiseen julkaisuun.
- Paikallisuutiset kuuluvat ensimmäiseen julkaisuun. Osuus on oletuksena piilossa, ja käyttäjä voi ottaa sen käyttöön asetuksista.
- Sivua tukemassa -kokeilusivu poistetaan.
- Beta-merkintä sekä Muutosloki-, Ylläpito-, testaus- ja kehitysjonolinkit ovat näkyvissä vain testauksen ajan ja piilotetaan julkaisukandidaatista viimeistään 31.8. Linkkiluettelo, Tietosuoja ja Saavutettavuusseloste säilyvät julkisina hyötylinkkeinä. Sisäiset sivut voivat säilyä suorilla osoitteilla `noindex`-rajattuina.
- Ennen julkaisua hankitaan lisää senioritestaajia. Heidän löytämänsä P1/P2-korjaukset tehdään heti ja testataan uudelleen.

### Työpaketit ja määräajat

1. **WP0 14.8.:** rajaus, työjonon lukitus ja yhteydenotto Fakiirimediaan.
2. **WP1 17.–21.8.:** vähintään viisi uutta senioritestausta, paikallisuutisten toimivuuden arviointi ja P2-listan lukitus.
3. **WP2 17.–21.8. ja 24.–27.8.:** P1-tason Cloudcity-staging, MariaDB, saman originin API, Firestore-migraatio, ylläpidon tunnistus ja palvelinasetukset.
4. **WP3 24.–27.8.:** selosteet, linkkiraportti, sovitut korjaukset ja sisältöjäädytys.
5. **WP4 28. ja 31.8.:** julkaisukandidaatti, sisäisten linkkien piilotus ja koko julkaisuportti.
6. **WP5 1.9.:** tavoitejulkaisu ja seurannan käynnistys.
7. **Varapäivät 2.–3.9.:** vain P1-korjaukset; julkaisu viimeistään 3.9.

### Avoinna ennen julkaisua

1. **P1 – yhteydenotto Fakiirimediaan 14.8.:** lähetä `docs/fakiirimedia-sahkopostiluonnos-2026-08-14.md`, nimeä tekninen yhteyshenkilö ja sovi WordPress-eristys, varmistukset sekä arkipäivien muutosikkunat.
2. **P1 – Cloudcity-staging, viimeistään 25.8.:** siirrä `dist` testipolkuun, varmista että `seniorsurf.fi/aloitus/` ja kaikki suhteelliset resurssit toimivat alihakemistossa. Julkaisua ei tehdä ennen kuin lopullista osoitetta vastaava staging on testattu ilman puuttuvia resursseja ja WordPressin ennen/jälkeen-savukoe on läpäisty.
3. **P1 – Cloudcityn MariaDB, API ja Firestore-migraatio, viimeistään 27.8.:** paikallinen PHP-API ja frontendin Cloudcity-provider ovat valmiit. Seuraavaksi asenna ne stagingiin, siirrä julkaisuun kuuluvat Firestore-tiedot, täsmäytä tietueet ja testaa varmistuksesta palautus. Toteutussuunnitelma on `docs/cloudcity-tietokanta-p1-suunnitelma-2026-08-14.md`.
4. **P1 – ylläpidon tuotantotunnistus ja ulkoiset asetukset, viimeistään 25.8.:** Firebase Authenticationin staging- ja tuotantodomainit sekä selainavaimen HTTP-referrer-rajaukset vahvistettiin tehdyiksi 21.8. Nykyiset testausoriginit säilytettiin siirtymän ajaksi. Stagingin migraatio 002 sekä kaksi aktiivista `admin`-roolia varmennettiin samana päivänä. Jäljellä ovat hyväksytyn ja käytöstä poistetun roolin tunnistustestit oikealla Firebase ID-tokenilla staging-API:a vasten; Cloudcity-API tarkistaa tokenin ja ylläpitäjän roolin palvelinpuolella.
5. **P1 – Cloudcityn palvelinasetukset, viimeistään 25.8.:** varmista HTTPS, 404-käsittely, suojausotsikot, HTML:n lyhyt välimuisti, hashattujen resurssien pitkä välimuisti sekä gzip- tai Brotli-pakkaus. Julkaisua ei tehdä ennen kuin asetukset on varmennettu Cloudcity-stagingissä ilman vaikutusta WordPressiin.
6. **P1 – selosteiden viimeistely, viimeistään 27.8.:** lisää tietosuoja- ja saavutettavuusselosteisiin lopullinen yhteystieto ja vahvista vastuurooli. Julkaisukandidaattia ei hyväksytä ennen kuin molemmat selosteet ovat julkaisuvalmiit.
7. **P1 – WordPressin esittely ja suora tuotantopolku, viimeistään 31.8.:** julkaise Aloitussivun hyväksytty julkinen frontend ja API-entrypoint fyysiseen `/website.wp33403/aloitus/`-hakemistoon siten, että osoitepalkki säilyy muodossa `https://seniorsurf.fi/aloitus/`. Pidä sovelluskoodi, asetukset, lokit ja liitteet web-juuren ulkopuolisessa `/aloitus-production/`-hakemistossa. Älä tee kanoniselle `/aloitus/`-polulle Redirection-sääntöä tai muuta WordPressin pääjuuren `.htaccess`-tiedostoa. Luo lisäksi julkinen esittelysivu `Seniorin aloitussivu – palvelun esittely` polkuun `/aloitussivu-palvelu/`; sivu esittelee palvelun ja linkittää suoraan `/aloitus/`-osoitteeseen. Hyväksytä sisältö ja WordPressin rinnakkaishakemisto ennen julkaisua.
8. **P2 – lisätestaus, viimeistään 21.8.:** tavoittele vähintään viittä uutta senioritestausta, joista vähintään kaksi puhelimella ja kaksi tietokoneella. Tavoitemäärän pieni alitus ei yksin estä julkaisua. Kirjaa havainnot ja luokittele mahdolliset P1/P2-korjaukset erikseen.
9. **P1 – julkaisuportin käyttöliittymätesti 28. ja 31.8.:** testaa 320, 375, 768 ja 1280 pikselin leveydet, tekstikoko 100–200 %, näppäimistöpolku, ruudunlukijan perusrakenne, teemat ja tärkeimmät modaalit. Julkaisu voidaan hyväksyä vasta, kun testit on suoritettu eikä avoimia P1-havaintoja ole.
10. **P1 – linkki- ja integraatiotesti, viimeistään 31.8.:** testaa tärkeimmät palvelulinkit, linkki-ilmoitus, huijausvaroitukset, karkea käyttötilasto ja suojattu ylläpito Cloudcity-osoitteessa. Julkaisu voidaan hyväksyä vasta, kun keskeiset tietovirrat toimivat eikä avoimia P1-havaintoja ole.
11. **P1 – julkaisupäivän tuotantotarkistus 1.9., tarvittaessa viimeistään 3.9.:** tarkista canonical-, Open Graph-, sitemap- ja robots-tiedostot, etusivu, tietosuoja, saavutettavuus, WordPressin `/aloitus/`-ohjaus ja `/aloitussivu-palvelu/`-esittelysivu sekä mobiili- ja työpöytänäkymä oikeassa tuotanto-osoitteessa. Toista myös WordPress-savukoe. Julkaisu hyväksytään vasta, kun tuotannon smoke-testit on läpäisty eikä avoimia P1-havaintoja ole.

## Tehty

- Paikallisuutisten lopullinen rajaus päätettiin 14.8.2026: osuus säilytetään ensimmäisessä julkaisussa oletuksena piilotettuna ja käyttäjän asetuksista avattavana. Poistaminen siirrettiin pois julkaisutyöstä, koska se edellyttäisi Lähelläsi-osion laajempaa käyttöliittymäsuunnittelua.
- Paikallisuutislähteiden uusintahaku on käsitelty 14.8.2026: 49 aiemmin puuttunutta kuntaa sai varmennetun lähteen, tyhjät syötteet poistettiin kattavuudesta ja lähteettömille kunnille lisättiin uutislähteen ehdotuslomake.
- SEC-001: Gemini- ja admin-salaisuudet on uusittu ja `npm run check:secrets` on mennyt läpi.
- SEC-002: Repo on kloonattu OneDriven ulkopuolelle kansioon `C:\dev\Aloitussivu`.
- SEC-003: Selainpuolen Firebase API -avain on rajattu.
- SEC-009: Firebase Custom Claims on asetettu admin-tileille.
- SEC-010: Kaksivaiheinen tunnistautuminen on käytössä admin-tileillä.
- SEC-011: Google Cloud -budjettihälytykset on asetettu.
- Työtilan siirto: aktiivinen kehitysrepo on `C:\dev\Aloitussivu`, `main` vastaa `origin/main`-haaraa ja vanhasta työtilasta vaaditut tiedostot ovat GitHubissa.
- Vanhan OneDrive-kansion tyhjä `.git` ei enää muodosta Git-repoa, eikä kansiota käytetä aktiiviseen kehitykseen.
- Väliaikainen `scripts/set-admin-claims.mjs` ja `C:\temp\aloitussivu-adminsdk.json` on poistettu.
- Uusi kehityskansio on varmennettu 23.7.2026: salaisuustarkistus, tuotantobuild, Functions-paketin TypeScript-tarkistus ja kaikki 21 ulkoasutarkistusta menivät läpi.

## SEC-015: Nimipäiväintegraation jälkisiivous

Tila: Ei estä 1.–3.9. julkaisua. Nimipäivät on poistettu julkaisun käyttöliittymästä.

1. Varmista tuotantobundlesta ja verkkolokeista, ettei nimipäivärajapintaa enää kutsuta.
2. Peruuta sen jälkeen vanha `NAMEDAY_API_TOKEN` nimipaivarajapinta.fi-palvelussa.
3. Poista Firestoresta `adminStats/namedayApi`, jos tietoa ei enää tarvita historiatietona.
4. Jos nimipäivät palautetaan myöhemmin, tee toiminto tiedostopohjaisella vuosidatalla ja lisää vuosittainen päivitysvastuu.

## Elokuu 2026: ylläpidon sähköposti-ilmoitukset

Tila: Lisätty elokuun todo-listalle

Selvitä Cloudcityn Pro-tilin sähköpostimahdollisuudet ja päätä, millä tavalla ylläpito saa viestin uusista todo-asioista.

Toteutuksessa huomioitavaa:

1. Lähetys tehdään vain palvelinpuolelta, esimerkiksi Cloud Functionista tai Cloudcityn backendistä.
2. SMTP-tunnuksia tai API-avaimia ei lisätä frontendin `.env`-tiedostoihin tai versionhallintaan.
3. Mahdolliset salaisuudet tallennetaan Secret Manageriin, Cloudcityn ympäristömuuttujiin tai muuhun palvelinpuolen salaisuuksien hallintaan.
4. Ensimmäinen ilmoitustyyppi voi olla uusi linkki-ilmoitus ylläpitoon.
5. Myöhemmin mukaan voi lisätä huijausvaroitusten automaation nollatulokset, nimipäivärajapinnan käyttörajan lähestymisen ja käyttötilastojen päivittymättömyyden.
6. Jos ilmoituksia tulee paljon, käytä päivittäistä koontia yksittäisten sähköpostien sijaan.

## Ennen tuotantojulkaisua: manuaaliset integraatiotestit

Tila: Testattava ympäristössä, jossa testitunnukset ja palvelinyhteydet ovat käytettävissä

1. Julkinen etusivu toimii Cloudcityn `aloitussivu`-alihakemistossa.
2. Linkkiehdotuksen lähetys toimii.
3. Huijausvaroitukset latautuvat.
4. Karkea käyttötilasto päivittyy.
5. Admin-tili pääsee ylläpitoon suoralla osoitteella.
6. Ei-admin ei pääse ylläpitoon.
