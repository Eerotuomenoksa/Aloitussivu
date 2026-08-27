# REL-11 – keinotekoinen testiaineisto

Lukittu 27.8.2026 julkaisuportin kirjoittaviin lomake- ja ylläpitotesteihin. Aineisto ei sisällä todellisia henkilötietoja tai oikeita palautteita.

## Yhteinen tunniste

Käytä kaikessa kirjoitettavassa testisisällössä tunnistetta `REL11-TESTI-20260831`. Älä käytä henkilönimeä, sähköpostiosoitetta, puhelinnumeroa, oikeaa asiakasasiaa tai tuotannon luottamuksellista tietoa.

## Sovittu aineisto

| Kohde | Keinotekoinen sisältö |
| --- | --- |
| Kotikunta ja kuvakaappaukset | Tampere, joka on julkinen kuntavalinta eikä henkilötieto. |
| Avoin palaute | Tyyppi `muu`; otsikko `REL11-TESTI-20260831`; kuvaus `Keinotekoinen julkaisuportin testipalaute. Saa poistaa testin jälkeen.`; sivu `Etusivu`. |
| Linkki-ilmoitus | Tyyppi `uusi`; nimi `REL11-TESTILINKKI`; osoite `https://example.com/rel11-testi`; kategoria `Muu`; lisätieto `REL11-TESTI-20260831 – keinotekoinen ilmoitus, saa poistaa.` |
| Testipalaute | Valitse neutraali tai epävarma sallittu vaihtoehto, kun sellainen on tarjolla, laitteeksi `tietokone` ja numeroarvoiksi 3. Kirjoita kaikkiin vapaisiin kenttiin vain `REL11-TESTI-20260831 – keinotekoinen vastaus.` |
| Kuvakaappausliite | Paikallisesti luotu pieni yksivärinen PNG ilman ruutukaappausta, tekstiä, metatietoja tai henkilötietoa. Tiedostonimi `REL11-TESTI-20260831.png`. |
| Ylläpidon tilamuutos | Käsittele vain tällä tunnisteella luotua linkki-ilmoitusta tai palautetta. Älä muuta oikeita käyttäjätietueita. |
| Käyttötilastokoe | Yksi sivulataus ja yksi sovelluksessa jo näkyvän julkisen palvelulinkin klikkaus hyväksytyssä testi-istunnossa. Raporttiin kirjataan vain aggregaatin kasvu, ei raakaa osoitetta tai käyttäjätunnistetta. |

Admin-kirjautumisessa käytetään vain ennestään hyväksyttyä henkilökohtaista ylläpitotiliä. Tunnusta, sähköpostia tai tokenia ei kopioida testiraporttiin. Passiivisen tai tuntemattoman käyttäjän koetta ei tehdä luomalla uutta oikeaa henkilötunnusta, vaan käytetään jo hyväksyttyä testijärjestelyä tai sopimustestin näyttöä.

## Siivous ja raportointi

1. Hae testin jälkeen ylläpidosta tunniste `REL11-TESTI-20260831`.
2. Poista tai sulje vain tunnisteella varmasti yksilöidyt keinotekoiset tietueet hyväksytyllä ylläpitotoiminnolla.
3. Varmista, ettei avoimeen paikalliseen lähetysjonoon jää testitietueita.
4. Kirjaa päiväkirjaan vain testin tila, kellonaika, tietuetyyppi ja siivouksen onnistuminen. Älä kopioi lomakevastauksen sisältöä, ylläpitäjän sähköpostia tai tunnistetta.
5. Jos tietuetta ei voi yksilöidä varmasti, älä poista sitä. Merkitse testi keskeytetyksi ja pyydä ylläpitäjää tarkistamaan kohde.
