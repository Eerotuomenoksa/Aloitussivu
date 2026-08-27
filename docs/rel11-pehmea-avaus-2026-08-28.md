# REL-11 pehmeä avaus 28.8.2026

Päivitetty 27.8.2026. Aloitussivu avataan teknisesti yleisölle perjantaina 28.8.2026, jotta Eero voi kuvata lyhyen videon ja digiopastajat sekä testaajat voivat tutustua palveluun ennakkoon. Laaja tiedotus tehdään maanantaina 1.9.2026 klo 09.00.

Pehmeä avaus on oikea tuotantovaihto, ei erillinen esikatselu. Osoite `https://seniorsurf.fi/aloitus/`, Cloudcity-API ja tuotanto-MariaDB ovat avaamisen jälkeen käyttäjien käytössä. Siksi samoja varmistus-, tietosuoja-, vähimmän oikeuden ja palautusehtoja noudatetaan kuin aiemmin 1.9. suunnitellussa vaihdossa.

## Uusi paikallinen ehdokas

- Build ID: `REL-11-v0.74.6-d010d2954873`
- Staging-ZIP: `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-staging.zip`, 838175 tavua, SHA-256 `1d05240c75ad46095829f6830103db9c6176f08cb188776dc01de3e4ed758ebe`
- Tuotantopolun ZIP: `C:\dev\Aloitussivu\.tmp\aloitussivu-rel11-production-path.zip`, 824586 tavua, SHA-256 `97006ada23b3c32626fbe40160d8b74933a01f1081be71aada97bb6245e162e4`
- Kummassakin ZIPissä on 115 tiedostoa, kaikki merkinnät avautuvat, vaarallisia polkuja on 0 eikä paketissa ole oikeaa `config.php`-tiedostoa, `.env`-tiedostoja tai Admin SDK -avainta.

Ehdokas on paikallisesti PASS, mutta staging-uusinta on vielä tehtävä ennen pehmeää avausta.

## Aikataulu

- **28.8. klo 08.30:** valmiusportti. Rajattu API-käyttäjä, tuotantokonfiguraatio, uusi version 0.74.6 ehdokas, staging-uusinta, varmistukset, admin-roolit, smoke-hyväksyjä ja palautustuki tarkistetaan.
- **28.8. klo 09.00:** aikaisin mahdollinen T0, jos kaikki kovat GO-ehdot ovat PASS. Jos yksikin ehto puuttuu, avausta siirretään saman päivän myöhempään hallittuun ikkunaan eikä ehtoja ohiteta.
- **28.8. T0–T0+25 min:** Firestore-kirjoituslukko, lopullinen vienti, tuotantotuonti, julkisen hakemiston aktivointi ja smoke tehdään tiedoston `rel11-tuotantovaihto-2026-09-01.md` vaiheiden järjestyksessä. Sen vanhoja version 0.74.5 polkuja sisältäviä komentolohkoja ei ajeta; uudet täsmälliset palvelinpolut kirjataan version 0.74.6 esiviennin jälkeen.
- **28.8. smoken jälkeen:** sivu jätetään julkisesti käytettäväksi. Vain rajatulle digiopastaja- ja testaajaryhmälle kerrotaan osoite; yleistä julkaisuviestiä ei vielä lähetetä.
- **1.9. klo 08.30:** tarkistetaan health, huijausvaroitukset, sää, paikallisuutiset, lomakekirjoitus, admin-näkymä ja WordPressin vertailusivut.
- **1.9. klo 09.00:** laaja tiedotus lähetetään vain, jos tarkistus on PASS. Muussa tapauksessa tiedotus siirretään ja sivu joko korjataan tai palautetaan vian vakavuuden mukaan.

## Kovat GO-ehdot 28.8.

1. Cloudcityn erillisen API-käyttäjän oikeudet ovat vain globaali `USAGE` sekä tuotantokantaan `SELECT`, `INSERT`, `UPDATE` ja `DELETE`.
2. Yksityinen tuotanto-`config.php` on valmis, oikeudet ovat 640 ja yhteyskoe tulostaa `database=up` paljastamatta arvoja.
3. Version 0.74.6 uusi ZIP ja ehdokashakemisto on yksilöity SHA-256-tiivisteellä. Vanhaa version 0.74.5 pakettia ei aktivoida.
4. Versio 0.74.6 on viety stagingiin ja huijausvaroitusten hidas, onnistuva, tyhjä ja virheellinen tila sekä muun sivun samanaikainen käytettävyys on hyväksytty.
5. Tuotannon admin-roolit, viimeiset varmistukset, Firestore-lukon kuivaharjoitus ja palautuskomento ovat PASS.
6. Riippumaton smoke-hyväksyjä ja palautuspäätöksen tuki ovat tavoitettavissa koko muutosikkunan ajan.

Jos yksikin ehto puuttuu, tulos on NO-GO. Erityisesti täysioikeuksista migraatiotunnusta ei käytetä API:ssa kiireen vuoksi.

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
| Version 0.74.6 staging-uusinta | täytetään |
| API-käyttäjä ja tuotantokonfiguraatio | täytetään |
| Lopullinen Firestore-vienti ja MariaDB-täsmäytys | täytetään |
| Julkisen `/aloitus/`-polun smoke | täytetään |
| WordPressin jälkeen-savukoe | täytetään |
| Riippumaton hyväksyjä | täytetään |
| Pehmeän avauksen GO-aika | täytetään |
| 1.9. tiedotuksen GO-aika | täytetään |
