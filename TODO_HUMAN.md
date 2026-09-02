# TODO_HUMAN

> **Projektin työjono on `TYOJONO.md`.** Uudet tehtävät kirjataan sinne. Tämä tiedosto on julkaisuportin dokumentti: julkaisun ehdot, päätökset ja niiden perustelut.

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

Pehmeä tuotantoavaus hyväksyttiin 28.8.2026 klo 11.36. **Nykyinen tuotantoversio on 1.0.0**, aktivoitu 1.9.2026 klo 08.28 (`REL-14-v1.0.0-131853bcb724`). Cloudcity-staging, MariaDB- ja Firestore-siirto, tuotanto-API, ylläpitotunnistus, palvelinasetukset ja suora `/aloitus/`-polku ovat valmiit. Firestore-kirjoituslukko on edelleen voimassa. Palautteen kirjoittava tuotantouusinta on PASS ja testipalaute on käsitelty. **Versionosto 1.0.0 tehtiin 1.9.2026** (kohta 4). Laajan tiedotuksen GO edellyttää edelleen, että alla olevat kohdat 1-2 ovat valmiit.

1. **VALMIS 1.9.2026 – WordPress-esittelysivun painike.** Eero todensi 1.9. klo 08.45, että painike toimii linkkinä. WP-01–WP-05- ja WP-11-uusintatestit ovat vielä tekemättä. Alkuperäinen havainto: korjaa `https://seniorsurf.fi/aloitussivu/`-sivun näkyvän `Avaa Seniorin aloitussivu` -painikkeen linkiksi `https://seniorsurf.fi/aloitus/`. Tuotannon HTML- ja selainkoe 28.8.2026 vahvisti, että painike on nyt `<a>` ilman `href`-attribuuttia eikä näy saavutettavuuspuussa linkkinä. Korjauksen jälkeen testaa linkki tietokoneella ja mobiilissa sekä toista WP-01–WP-05 ja WP-11.
2. **P1 – KO-01-tietosuojaselosteen hyväksyntä ja julkaisu:** suomen-, ruotsin- ja englanninkieliseen selosteeseen on lisätty Open-Meteo, OpenStreetMap Nominatim, rss2json ja allorigins sekä kuvaus niille välittyvistä koordinaateista ja IP-osoitteesta. Teksti kertoo, ettei Nominatimia käytetä valitun kotikunnan kanssa. Nina Ziessler hyväksyy tekstin, minkä jälkeen valmis korjaus viedään tuotantoon ennen laajaa tiedotusta.
3. **VALMIS 31.8.2026 – palautteen onnistumisen tuotantouusinta:** henkilötiedoton keinotekoinen palaute lähetettiin tuotannossa ja käsiteltiin hyväksytyssä ylläpitonäkymässä. Käyttäjä vahvisti palautetestin tehdyksi ja käsitellyksi.
4. **VALMIS 1.9.2026 – versionosto 1.0.0.** Ominaisuuksia muuttamaton versionosto tehtiin: `package.json`, `package-lock.json`, `appVersion.ts`, `changelogData.ts`. Samalla vaihdettiin faviconit (majakkatunnus). Loppuportin tarkistuslista alla; tiedotuksen GO-aika kirjataan tänne kun kohdat 1-2 ovat valmiit.

   Loppuportin tarkistuslista: korjaa kohdat 1–2, tarkista canonical-, Open Graph-, sitemap- ja robots-tiedostot, tietosuoja, saavutettavuus, `/aloitus/`, `/aloitussivu/`, mobiili- ja työpöytänäkymä sekä WordPress-savukoe. Nimetty riippumaton hyväksyjä vahvistaa tuloksen. Vasta tämän jälkeen kirjataan tiedotuksen GO-aika. Tulostettava raportointipohja on tiedostossa `output/pdf/seniorin-aloitussivu-julkaisun-loppuportti-raportointipohja.pdf`.

### Julkaisun jälkeen

1. **P1 – tuotantotietokannan käyttäjäpoikkeuksen tarkistus viimeistään 30.9.2026:** tarkista, mahdollistaako Cloudcity silloin erillisen vähimmän oikeuden API-käyttäjän tai onko käyttöympäristöön tullut muu turvallinen ratkaisu. Jos mahdollista, siirrä API käyttäjälle, jolla on vain `SELECT`, `INSERT`, `UPDATE` ja `DELETE`, kierrätä vanha salasana ja sulje tiedoston `docs/rel11-tietoturvapoikkeus-api-kayttaja-2026-08-28.md` poikkeus. Omistaja: Eero Tuomenoksa.

2. **P1 – kotikunnan kysyminen ja toinen paikkakunta, päätetty 30.8.2026:** esittelykierroksen pitää kysyä kotikunta oikeana valintana (nyt se vain korostaa Lähelläsi-osion eikä mikään kysy), Asetuksiin oma selkeä kotikunnan vaihto, ja lisäoptiona toinen paikkakunta esimerkiksi mökkiä varten. Täysi määrittely: `docs/codex-tehtava-kotikunta-ja-toinen-paikkakunta-2026-08-30.md` (KK-01…KK-04). Tausta: kotikunta on se yksi valinta joka avaa paikalliset palvelut, uutiset, liikenteen ja sään — ilman sitä käyttäjä näkee vain valtakunnalliset linkit. Lisäksi iOS:n kotinäyttösovelluksella on oma tallennustila, joten Safarissa valittu kunta ei seuraa asennettuun sovellukseen. Omistaja: kehitys.

3. **P2 – ulkopuolisten palvelujen riippuvuuksien vähentäminen:** KO-01-seloste toteutettiin ennen laajaa tiedotusta. Julkaisun jälkeen tehdään määrittelyn `docs/codex-tehtava-kolmannen-osapuolen-palvelut-2026-08-30.md` KO-02–KO-04: RSS-haku siirretään palvelimelle, Nominatim korvataan omalla kuntahaulla ja jäljelle jääville rajapinnoille lisätään valvonta. Omistaja: kehitys.

4. **P3 – näkymäasetusten kertapalautus, REL-13 tai myöhempi:** lisää Asetukset-paneeliin selkeä `Palauta näkymän oletusasetukset` -toiminto. Se saa palauttaa vihreän vaalean teeman, digitaalisen kellon, 100 prosentin tekstikoon, osioiden oletusnäkyvyyden, tyhjän kiinnostavien teemojen valinnan ja toissijaisen kellon oletusaikavyöhykkeen. Toiminto ei saa poistaa kotikuntaa, suosikkeja, kielivalintaa, perehdytyksen tilaa, käyttötilastovalintaa, lomake- tai lähetysjonoja, tunnistautumistietoja, välimuisteja eikä mitään palvelimen tietoja. Omistaja: kehitys. Testaa näppäimistöllä, ruudunlukijan perustilassa ja sivun uudelleenlatauksen yli.

5. **P2 – 320 × 800 -näkymän viimeistely 200 prosentin suurennuksella:** tuotannon R-16-kokeessa 31.8.2026 sisältö säilyi luettavana, mutta asettelu hajosi selvästi 320 × 800 -näkymässä. Leveydellä 375 × 800 sama koe oli kunnossa, ja R-17:n 1280 × 800 -työpöytänäkymä oli PASS. Korjaa erityisesti ylätunnisteen toimintojen, haun ja sisältökorttien mukautuminen kapeimpaan näkymään. Varmista erikseen sekä sovelluksen 200 prosentin tekstikoko selaimen 100 prosentin zoomilla että selaimen 200 prosentin zoom, jotta testitavat eivät sekoitu. Hyväksymisehto: ei vaakavieritystä, päällekkäisyyttä tai leikkautuvia ohjaimia; pystysuuntainen vieritys ja kaikki ydintoiminnot säilyvät. Omistaja: kehitys.

## Tehty

- Palautteen onnistumisen kirjoittava tuotantouusinta tehtiin ja henkilötiedoton testipalaute käsiteltiin hyväksytyssä ylläpidossa 31.8.2026. Avoin REL11-DATA-01-havainto on suljettu.
- Automaattisen linkkitarkistuksen P1-korjaukset, migraatiot 005–006 ja paketti `REL-14-v0.77.0-49cf755312e2` vietiin tuotantoon 30.8.2026. API-health, ensimmäinen käsiajo ja Cloudcityn aktiivinen PHP-tuntiajo `7 * * * *` ovat PASS. Ajastuksen käyttöönottotesti tarkisti kaksi kohdetta: yksi onnistui ja yksi sai hallitun varoituksen; virheitä, hylkäyksiä ja automaattisia estoja oli 0.
- Version 0.74.7 kolme pehmeän avauksen P2-havaintoa korjattiin ja paketti `REL-11-v0.74.7-7bc8b9f06334` vietiin tuotantoon 28.8.2026. HTTP-smoke, uusi pääbundle `assets/main-Iuu9MbpP.js`, 320/375/768/1280 px × 100/200 % -matriisi, 320 px / 200 % -palauteikkuna, OP-linkkien näkyvä kohde ja nollan konsolivirheen selainkoe ovat PASS. Palautteen kirjoittava tuotantovahvistus tehtiin ja käsiteltiin loppuun 31.8.2026.
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
