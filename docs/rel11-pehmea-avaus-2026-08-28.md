# REL-11 pehmeä avaus 28.8.2026

Päivitetty 28.8.2026. Aloitussivu avataan teknisesti yleisölle perjantaina 28.8.2026, jotta Eero voi kuvata lyhyen videon ja digiopastajat sekä testaajat voivat tutustua palveluun ennakkoon. Laaja tiedotus tehdään maanantaina 1.9.2026 klo 09.00.

Pehmeä avaus on oikea tuotantovaihto, ei erillinen esikatselu. Osoite `https://seniorsurf.fi/aloitus/`, Cloudcity-API ja tuotanto-MariaDB ovat avaamisen jälkeen käyttäjien käytössä. Siksi samoja varmistus-, tietosuoja-, vähimmän oikeuden ja palautusehtoja noudatetaan kuin aiemmin 1.9. suunnitellussa vaihdossa.

## Lukittu sovellusehdokas ja tuotantokonfiguraation korjaus

- Stagingissa hyväksytty sovellusbuild: `REL-11-v0.74.6-d010d2954873`; pääbundle `assets/main-NYkkJV2H.js`.
- Tuotantokonfiguraation korjauksen sisältävä build: `REL-11-v0.74.6-6974967944fb`.
- Uusi paikallinen staging-verrokkipaketti: `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip`, 838198 tavua, SHA-256 `03620b1b6265223f712c07b90b5f25d2fc96d3b04666bdebd5da563ec46a0648`.
- Tuotantopolun ZIP: `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-production-path.zip`, 824590 tavua, SHA-256 `2fca11c90ca1fdcf3ec0bfd10ae6e1a9e465100b3ea4fde44f6b3935c50db479`.
- Kummassakin ZIPissä on 115 tiedostoa, kaikki merkinnät avautuvat, vaarallisia polkuja on 0 eikä paketissa ole oikeaa `config.php`-tiedostoa, `.env`-tiedostoja tai Admin SDK -avainta.

Commitien `d010d2954873..6974967944fb` tuotantoajoon vaikuttava ainoa muutos on tuotannon esimerkkikonfiguraation tietokantaisäntä `dbtqq.db.cchosting.fi`; frontend- tai API-koodi ei muuttunut. Uuden staging-verrokin pääbundle säilyi nimeltään `assets/main-NYkkJV2H.js`. Aiempi stagingin health- ja käyttöliittymä-PASS säilyvät näyttönä sovelluskoodista; tuotantokonfiguraation `database=up` ja uuden tuotantopaketin palvelinesivienti ovat PASS.

Huomisaamun tiivis työjärjestys on tiedostossa `rel11-huomisaamun-tyolista-2026-08-28.md` ja uuden ehdokkaan staging-komennot tiedostossa `rel11-staging-vienti-2026-08-28.md`.

## Aikataulu

- **28.8. klo 08.30:** valmiusportti. Hyväksytty API-käyttäjäpoikkeus, tuotantokonfiguraatio, uusi version 0.74.6 ehdokas, staging-uusinta, varmistukset, admin-roolit, smoke-hyväksyjä ja palautustuki tarkistetaan.
- **28.8. klo 09.00:** aikaisin mahdollinen T0, jos kaikki kovat GO-ehdot ovat PASS. Jos yksikin ehto puuttuu, avausta siirretään saman päivän myöhempään hallittuun ikkunaan eikä ehtoja ohiteta.
- **28.8. T0–T0+25 min:** Firestore-kirjoituslukko, lopullinen vienti, tuotantotuonti, julkisen hakemiston aktivointi ja smoke tehdään tiedoston `rel11-tuotantovaihto-2026-09-01.md` vaiheiden järjestyksessä. Sen vanhoja version 0.74.5 polkuja sisältäviä komentolohkoja ei ajeta; uudet täsmälliset palvelinpolut kirjataan version 0.74.6 esiviennin jälkeen.
- **28.8. smoken jälkeen:** sivu jätetään julkisesti käytettäväksi. Vain rajatulle digiopastaja- ja testaajaryhmälle kerrotaan osoite; yleistä julkaisuviestiä ei vielä lähetetä.
- **1.9. klo 08.30:** tarkistetaan health, huijausvaroitukset, sää, paikallisuutiset, lomakekirjoitus, admin-näkymä ja WordPressin vertailusivut.
- **1.9. klo 09.00:** laaja tiedotus lähetetään vain, jos tarkistus on PASS. Muussa tapauksessa tiedotus siirretään ja sivu joko korjataan tai palautetaan vian vakavuuden mukaan.

## Kovat GO-ehdot 28.8.

1. Cloudcityn 28.8.2026 vahvistama käyttäjärajoitus ja tuotevastuun hyväksymä tietoturvapoikkeus on kirjattu tiedostoon `rel11-tietoturvapoikkeus-api-kayttaja-2026-08-28.md`. Ainoalla käyttäjällä on globaali `USAGE` ja tietokantakohtainen `ALL PRIVILEGES` vain Aloitussivun tuotantokantaan, ilman `GRANT OPTION` -oikeutta.
2. Yksityinen tuotanto-`config.php` on valmis, oikeudet ovat 640 ja yhteyskoe tulostaa `database=up` paljastamatta arvoja.
3. Version 0.74.6 uusi ZIP ja ehdokashakemisto on yksilöity SHA-256-tiivisteellä. Vanhaa version 0.74.5 pakettia ei aktivoida.
4. Versio 0.74.6 on viety stagingiin ja huijausvaroitusten hidas, onnistuva, tyhjä ja virheellinen tila sekä muun sivun samanaikainen käytettävyys on hyväksytty.
5. Tuotannon admin-roolit, viimeiset varmistukset, Firestore-lukon kuivaharjoitus ja palautuskomento ovat PASS.
6. Riippumaton smoke-hyväksyjä ja palautuspäätöksen tuki ovat tavoitettavissa koko muutosikkunan ajan.

Jos yksikin ehto puuttuu, tulos on NO-GO. Tietokantakohtainen `ALL PRIVILEGES` hyväksytään vain dokumentoidun poikkeuksen rajoissa; globaalit tai muiden tietokantojen oikeudet pysäyttävät julkaisun.

## Version 0.74.6 vaikutusaluetesti stagingissa

- Sivun otsikko, haku, sää, sisältövalikko ja palvelulinkit näkyvät ja toimivat huijausvaroituspyynnön ollessa tarkoituksella hidas.
- Huijausvaroituslaatikossa näkyy `Ladataan huijausvaroituksia…` ennen vastausta.
- Onnistunut vastaus korvaa lataustilan enintään kahdella uusimmalla aktiivisella varoituksella.
- Tyhjä vastaus näyttää tekstin `Ajankohtaisia huijausvaroituksia ei ole.`
- API-virhe näyttää hallitun virheviestin eikä estä muun sivun käyttöä.
- Paikallisuutisten, lähialueen palvelujen ja palvelulinkkien lataustilat ovat näkyviä; sääkortin aiempi näkyvä lataustila säilyy.
- Selainkonsolissa ei ole uutta sovellusvirhettä ja verkosta ladattavat resurssit sekä `/api/v1/health` palautuvat odotetusti.

## Pehmeän avauksen viestirajaus

Ennakkoviestissä kerrotaan, että sivu on pehmeässä avauksessa ja havainnot ovat tervetulleita. Viestissä ei luvata häiriötöntä tuotantotasoa ennen 1.9. tarkistusta. Julkaisuviestiä, lehdistötiedotetta tai laajaa sosiaalisen median tiedotusta ei lähetetä 28.8.

Videon voi kuvata vasta hyväksytyn smoken jälkeen. Kuvassa ei näytetä ylläpitonäkymiä, kirjautumistietoja, palautteita, selaimen tunnisteita tai henkilötietoja.

## Tuloskirjaus

| Kohta | Tulos |
| --- | --- |
| Version 0.74.6 staging-uusinta | PASS 28.8.2026: build, commit, pääbundle, health ja käyttöliittymän vaikutusalue hyväksytty |
| API-käyttäjä ja tuotantokonfiguraatio | PASS 28.8.2026: käyttäjä ja `SHOW GRANTS` hyväksytyllä poikkeuksella; `config.php`-syntaksi, arvot ja 640-oikeus PASS; tuotantopalvelin `dbtqq.db.cchosting.fi`; `database=up` |
| Yksityinen tuotanto-API-juuri | PASS 28.8.2026: palautusarkisto 600-oikeudella, vanha juuri säilytetty, PHP-lint 43/43 ja aktiivinen tietokantayhteys `up` |
| Admin-roolit ja tuotantokannan varmistus | PASS 28.8.2026: ristiriitoja 0, kaksi aktiivista admin-roolia, odotetut tilit löytyivät ja täsmäsivät 2/2; uusi yksityinen SQL-varmistus tallessa |
| Firestore-sääntöjen kuivaharjoitus | PASS 28.8.2026: kirjoituslukko ja normaalien sääntöjen palautus kääntyivät projektille `aloitussivu-5d50c`; sääntöjä ei vielä julkaistu |
| Lopullinen Firestore-vienti ja MariaDB-täsmäytys | PASS 28.8.2026: kirjoituslukko julkaistu klo 10.19.33, julkinen luku PASS ja kirjoitus estetty; vientien poikkeamia 0/0; täysi SHA-256 `fcd0b951a021a08c0a192e74c98ce106da03bce2b99ff3a60dd439983685e597`; taulumäärät ja tunnistenäytteet täsmäsivät |
| Julkisen `/aloitus/`-polun smoke | PASS 28.8.2026: etusivu ja pääbundle 200, `/aloitus` ohjasi kerran kanoniseen polkuun, oma 404 toimi ja health palautti 200 sekä `ok/up/v1` ja `Cache-Control: no-store` |
| WordPressin jälkeen-savukoe | PASS 28.8.2026: etusivu, Etäopastus, Ajankohtaista, Yhteystiedot ja haku palauttivat 200 odotetuilla otsikoilla; `/wp-admin/` ohjasi kirjautumiseen ja vertailumedia säilyi 152080 tavun JPEG-kuvana |
| Riippumaton hyväksyjä | PASS 28.8.2026: tietokone- ja mobiilinäkymä hyväksyttiin eikä P1-virheitä havaittu |
| Pehmeän avauksen GO-aika | GO 28.8.2026 klo 11.36 Europe/Helsinki |
| Version 0.74.7 P2-korjausten paikallinen vaikutusalue | PASS 28.8.2026: palautteen vahvistus ja lähetyslukko, kategoriakorttien 320/375/768/1280 px × 100/200 % -matriisi sekä OP-linkin lopullinen valtakunnallinen kohde hyväksyttiin paikallisessa buildissa |
| 1.9. tiedotuksen GO-aika | täytetään |

Tuotantoympäristö paljasti kaksi käyttöönoton aikaista alustapoikkeamaa. ZIP oli purettu yksityisen ehdokashakemiston vuoksi oikeuksilla 700/600; julkiset hakemistot korjattiin arvoon 755 ja tiedostot arvoon 644 ennen hyväksyttyä aktivointia. Lisäksi WordPressin pääjuuren reititys sieppasi virtuaaliset `/aloitus/api/`-polut. Pääjuuren `.htaccess` varmuuskopioitiin yksityiseen kotihakemistoon, minkä jälkeen ennen WordPressin automaattista lohkoa lisättiin vain `/aloitus/api/`-pyyntöihin rajattu sääntö. WordPressin dynaamista lohkoa, tietokantaa, teemaa, lisäosia tai Redirection-sääntöjä ei muutettu. LiteSpeedin vanha API-404 tyhjennettiin välimuistista ja kaikki WordPress-verrokit testattiin muutoksen jälkeen.

Firebase-verkkosovelluksen tuotanto-origin lisättiin selaimen API-avaimen HTTP-referrer-rajoituksiin sekä Authenticationin sallittuihin domaineihin. Tämän jälkeen tuotannon admin-kirjautuminen ja `ADMIN`-rooli olivat PASS. Kaksi henkilötiedotonta smoke-palautetta tallentui MariaDB:hen ja merkittiin hyväksytyssä ylläpitonäkymässä valmiiksi. Firestore-kirjoituslukko jätettiin GO-päätöksen mukaisesti voimaan.

Pehmeä avaus hyväksyttiin kolmella avoimella P2-havainnolla, jotka eivät estä rajattua ennakkokäyttöä mutta käsitellään ennen 1.9. laajaa tiedotusta: palautteen onnistumisvahvistus voi jäädä vieritysalueen loppuun ja sulkeutua liian nopeasti, OnePlus 12:n Chromessa kategorian linkkilaatikot ovat 100 prosentin näkymässä liian leveitä sekä Osuuspankki-linkki avasi Keski-Suomen alueellisen OP-sivun.

## Version 0.74.7 P2-korjauskierros 28.8.2026

Kaikki kolme pehmeän avauksen P2-havaintoa on korjattu lähdekoodiin. Palautteen onnistumisvahvistus on modaaliotsikon alla näkyvässä, ruudunlukijalle ilmoittavassa tilassa; fokus siirtyy vahvistukseen, uusi lähetys estetään ja ikkuna pysyy auki käyttäjän sulkemiseen asti. Paikallisessa 320 px / 200 % -kokeessa vahvistus pysyi kokonaan näkymässä yli 4,5 sekuntia, lähetyspainike oli lukittu ja Escape sulki ikkunan sekä palautti fokuksen Palaute-painikkeeseen.

Kategoriakorttien leveys ja rivittyminen korjattiin. Paikallinen build läpäisi 320, 375, 768 ja 1280 pikselin leveydet sekä 100 ja 200 prosentin tekstikoot: kaikissa kahdeksassa yhdistelmässä dokumentin leveys vastasi näkymää, yhdeksän kategoriaruudukkoa ja 39 korttia pysyivät rajojen sisällä eikä sivuttaisvieritystä syntynyt.

Pankit-kategorian OP-linkki ja `OP henkilöasiakkaat` osoittavat nyt valtakunnalliselle sivulle `https://www.op.fi/henkiloasiakkaat/asiakaspalvelu/ota-yhteytta`. Osoite palautti HTTP 200:n ja selain päätyi samaan URLiin otsikolla `OP:n ja Pohjola Vakuutuksen yhteystiedot henkilöasiakkaille | OP`. Alueellinen numero nimettiin `OP Keski-Suomi – seniorit ja erityistä tukea tarvitsevat`, ja sen Keski-Suomen kohde säilytettiin tarkoituksella.

Version 0.74.7 TypeScript-tarkistus, salaisuustarkistus, Functions-build sekä Cloudcity-, staging-, Firebase-palautus- ja local-provider-buildit ovat PASS. Paikallinen PHP-ajonaika puuttui Windows-ympäristöstä, joten muuttumattoman API:n sopimustestejä ei ajettu uudelleen; viimeisin dokumentoitu 46/46-tulos säilyy vertailunäyttönä. Korjausversiota ei ole vielä viety tuotantoon, joten 1.9. tiedotuksen GO pysyy avoimena tuotantoviennille ja koko tuotantoportin uusinnalle.
