# TODO_HUMAN

Tässä tiedostossa on jäljellä oleva siivous- ja tarkistuslista. Varsinaiset manuaaliset tietoturvakohdat on tehty, paitsi nimipäivädataan liittyvä SEC-015, joka tehdään aikaisintaan elokuussa 2026.

Älä kirjoita salasanoja, API-avaimia, tokeneita tai service account -avainten sisältöjä tähän tiedostoon.

## Julkaisu 3.9.2026

Tila: Julkaisun rajaus päätetty 13.8.2026. Avoimet julkaisuportin tehtävät on lueteltu alla.

### Päätetty

- Julkaisunimi on toistaiseksi `Aloitussivu`. Jos nimi myöhemmin vaihtuu, nimi ja osoite päivitetään samalla.
- Julkaisu tehdään Cloudcityn webhotelliin osoitteeseen `https://seniorsurf.fi/aloitussivu/`. Erillistä domainia ei hankita tässä vaiheessa.
- Nimipäivät ja tekoälyavustaja eivät kuulu 3.9. julkaisuun.
- Paikallisuutiset ovat oletuksena piilossa. Lopullinen päätös niiden mukanaolosta tehdään viimeistään ennen julkaisukandidaattia.
- Sivua tukemassa -kokeilusivu poistetaan.
- Beta-, testaus-, kehitysjono-, ylläpito-, linkkiluettelo- ja muutoslokilinkit eivät näy julkisessa navigaatiossa. Testi- ja ylläpitosivut säilyvät suorilla osoitteilla ja niissä käytetään `noindex`-rajausta.
- Ennen julkaisua hankitaan lisää senioritestaajia. Heidän löytämänsä P1/P2-korjaukset tehdään heti ja testataan uudelleen.

### Avoinna ennen julkaisua

1. **Paikallisuutisten lopullinen rajaus:** jätetäänkö asetus käyttöön vai poistetaanko paikallisuutiset kokonaan ensimmäisestä julkaisusta.
2. **Cloudcity-staging:** siirrä `dist` testipolkuun, varmista että `seniorsurf.fi/aloitussivu/` ja kaikki suhteelliset resurssit toimivat alihakemistossa.
3. **Tuotanto-originin ulkoiset asetukset:** lisää `seniorsurf.fi` Firebase Authenticationin sallittuihin domaineihin, selaimen Firebase API -avaimen HTTP-referrer-rajoituksiin ja App Checkiin. CORS-oletus on lisätty koodiin.
4. **Cloudcityn palvelinasetukset:** varmista HTTPS, 404-käsittely, suojausotsikot, HTML:n lyhyt välimuisti, hashattujen resurssien pitkä välimuisti sekä gzip- tai Brotli-pakkaus.
5. **Selosteiden viimeistely:** lisää tietosuoja- ja saavutettavuusselosteisiin lopullinen yhteystieto ja vahvista vastuuhenkilö.
6. **Lisätestaus:** vähintään viisi uutta senioritestausta, joista vähintään kaksi puhelimella ja kaksi tietokoneella. Kirjaa P1/P2-havainnot ja korjaa ne ennen sisältöjäädytystä.
7. **Julkaisuportin käyttöliittymätesti:** 320, 375, 768 ja 1280 pikselin leveydet, tekstikoko 100–200 %, näppäimistöpolku, ruudunlukijan perusrakenne, teemat ja tärkeimmät modaalit.
8. **Linkki- ja integraatiotesti:** tärkeimmät palvelulinkit, linkki-ilmoitus, huijausvaroitukset, karkea käyttötilasto ja suojattu ylläpito testataan Cloudcity-osoitteessa.
9. **Julkaisupäivän tarkistus:** canonical-, Open Graph-, sitemap- ja robots-tiedostot, etusivu, tietosuoja, saavutettavuus sekä mobiili- ja työpöytänäkymä tarkistetaan tuotannossa.

## Tehty

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

Tila: Ei estä 3.9. julkaisua. Nimipäivät on poistettu julkaisun käyttöliittymästä.

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
