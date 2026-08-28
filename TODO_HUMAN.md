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

### Avoinna ennen 1.9. laajaa tiedotusta

Pehmeä tuotantoavaus hyväksyttiin 28.8.2026 klo 11.36. Cloudcity-staging, MariaDB- ja Firestore-siirto, tuotanto-API, ylläpitotunnistus, palvelinasetukset, selosteet, WordPress-esittelysivu, suora `/aloitus/`-polku sekä WordPressin jälkeen-savukoe ovat valmiit. Firestore-kirjoituslukko on edelleen voimassa.

1. **P1 – julkaisuportin käyttöliittymätesti 31.8.:** testaa P2-korjausten jälkeen 320, 375, 768 ja 1280 pikselin leveydet, tekstikoko 100–200 %, näppäimistöpolku, ruudunlukijan perusrakenne, teemat ja tärkeimmät modaalit. Laaja tiedotus voidaan hyväksyä vasta, kun testit on suoritettu eikä avoimia P1-havaintoja ole.
2. **P1 – linkki- ja integraatiotesti viimeistään 31.8.:** testaa tärkeimmät palvelulinkit, linkki-ilmoitus, palaute, huijausvaroitukset, karkea käyttötilasto ja suojattu ylläpito tuotanto-osoitteessa. Laaja tiedotus voidaan hyväksyä vasta, kun keskeiset tietovirrat toimivat eikä avoimia P1-havaintoja ole.
3. **P1 – tiedotuspäivän tuotantotarkistus 1.9., tarvittaessa viimeistään 3.9.:** tarkista canonical-, Open Graph-, sitemap- ja robots-tiedostot, etusivu, tietosuoja, saavutettavuus, sovelluksen suora `/aloitus/`-polku ja `/aloitussivu/`-esittelysivu sekä mobiili- ja työpöytänäkymä oikeassa tuotanto-osoitteessa. Toista myös WordPress-savukoe ja kirjaa tiedotuksen GO-aika. Laaja tiedotus hyväksytään vasta, kun tuotannon smoke-testit on läpäisty eikä avoimia P1-havaintoja ole.

### Julkaisun jälkeen

1. **P2 – palautelomakkeen onnistumisvahvistus ennen 1.9. tiedotusta:** tuotannon smoke-testissä onnistumisviesti jäi vieritettävän lomakealueen loppuun ja ikkuna sulkeutui noin 1,1 sekunnissa. Tämä johti kahteen saman testipalautteen lähetykseen. Siirrä vahvistus aina näkyvään kohtaan, estä uusi lähetys onnistumisen jälkeen ja pidä vahvistus näkyvissä, kunnes käyttäjä sulkee sen tai riittävän pitkä, saavutettava viive täyttyy. Lisää mobiili-, näppäimistö- ja ruudunlukijatesti.
2. **P2 – mobiilikategorioiden vaakasuuntainen ylileveys ennen 1.9. tiedotusta:** OnePlus 12:n Chromessa ja 100 prosentin näkymässä kategorian linkkilaatikot ovat vaakasuunnassa liian suuria. Korjaa korttien leveys, rivittyminen ja mahdollinen vaakavieritys niin, että sisältö mahtuu näkymään ilman sivuttaisvieritystä. Testaa vähintään vastaavalla Android/Chrome-laitteella ja 100–200 prosentin tekstikoolla.
3. **P2 – Osuuspankki-linkin kohde ennen 1.9. tiedotusta:** tuotannon linkkitestissä Osuuspankki-linkki avasi Keski-Suomen OP:n alueellisen sivun. Tarkista linkkiaineiston kohde ja vaihda se valtakunnalliseen, käyttäjän sijainnista riippumattomaan OP-palveluun tai nimeä alueellinen kohde yksiselitteisesti. Varmista lopullinen uudelleenohjaus selaimessa ennen laajaa tiedotusta.

4. **P1 – tuotantotietokannan käyttäjäpoikkeuksen tarkistus viimeistään 30.9.2026:** tarkista, mahdollistaako Cloudcity silloin erillisen vähimmän oikeuden API-käyttäjän tai onko käyttöympäristöön tullut muu turvallinen ratkaisu. Jos mahdollista, siirrä API käyttäjälle, jolla on vain `SELECT`, `INSERT`, `UPDATE` ja `DELETE`, kierrätä vanha salasana ja sulje tiedoston `docs/rel11-tietoturvapoikkeus-api-kayttaja-2026-08-28.md` poikkeus. Omistaja: Eero Tuomenoksa.

5. **P3 – näkymäasetusten kertapalautus, REL-13 tai myöhempi:** lisää Asetukset-paneeliin selkeä `Palauta näkymän oletusasetukset` -toiminto. Se saa palauttaa vihreän vaalean teeman, digitaalisen kellon, 100 prosentin tekstikoon, osioiden oletusnäkyvyyden, tyhjän kiinnostavien teemojen valinnan ja toissijaisen kellon oletusaikavyöhykkeen. Toiminto ei saa poistaa kotikuntaa, suosikkeja, kielivalintaa, perehdytyksen tilaa, käyttötilastovalintaa, lomake- tai lähetysjonoja, tunnistautumistietoja, välimuisteja eikä mitään palvelimen tietoja. Omistaja: kehitys. Testaa näppäimistöllä, ruudunlukijan perustilassa ja sivun uudelleenlatauksen yli.

## Tehty

- REL-11:n pehmeä tuotantoavaus hyväksyttiin 28.8.2026 klo 11.36. Julkinen `/aloitus/`-polku, Cloudcity-API, tuotanto-MariaDB, hyväksytyn ylläpitäjän kirjautuminen, WordPress-rinnakkaiselo ja palautusvalmius läpäisivät tuotantosmoken. Laaja 1.9. tiedotus jäi ehdolliseksi kolmelle P2-korjaukselle ja uudelle julkaisuportin tarkistukselle.
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
