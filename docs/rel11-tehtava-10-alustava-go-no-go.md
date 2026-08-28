# REL-11 tehtävä 10/10 – alustava go/no-go-päätös

Päivitetty 27.8.2026. Tämä on ennen ensi viikon julkaisuikkunaa tehty alustava päätöspöytäkirja. Se ei ole tuotantolupa eikä muuta Cloudcityä, WordPressiä, Firestorea tai MariaDB:tä.

Suoritettava tuotantovaihto on aikataulutettu 1.9.2026 klo 09.00–09.25 ja dokumentoitu ajokirjaan [rel11-tuotantovaihto-2026-09-01.md](rel11-tuotantovaihto-2026-09-01.md). Alustava päätös pysyy NO-GO-tilassa, kunnes ajokirjan maanantain kova valmiusportti on hyväksytty.

## Päätös

**NO-GO 27.8.2026.** REL-11-versiota ei julkaista vielä tuotantoon.

Staging-ehdokkaan `REL-11-v0.74.5-d5c4ea9ac2b8` sovelluskorjaukset ja niiden vaikutusaluetestit ovat PASS, ja avoimia P1-vikahavaintoja on 0. PRE-05:n WordPress-esittely, PRE-08:n keinotekoinen testiaineisto, WP-05, OPS-01 ja OPS-05 ovat PASS. Kokonaisportissa on silti 12 P1-riviä, joita ei ole vielä hyväksytty oikeassa julkaisuympäristössä tai ihmisten vahvistuksilla.

## Hyväksytty tekninen näyttö

- Stagingin build ID, commit ja puhdas työpuu on vahvistettu.
- Etusivu, pääbundle ja API-health ovat PASS; health palauttaa `ok/up/v1`.
- A11Y- ja CORE-korjausten vaikutusalue on PASS stagingissa.
- WordPressin vain lukeva ennen-savukoe WP-01–WP-04 on PASS.
- `/aloitus/`-tuotantopolun paikallinen koepaketti, API, resurssit, kanonisointi ja oma 404 ovat PASS.
- Tuotantopolun paikallinen koepaketti on yksilöity, avautuu virheittä eikä sisällä salaisuustiedostoja.
- Firebase-palautusbuild muodostuu versiosta 0.74.5 ja vaiheittainen, vain yhden kirjoitusproviderin salliva palautuspolku on dokumentoitu. ERR-07 on PASS paikallisena palautusvalmiutena.
- Julkaisu- ja keskeytysviestit ovat valmiit, mutta niitä ei lähetetä ennen REL-12-smoken hyväksyntää. OPS-07 on PASS tällä lähetyskiellolla.

## Ensi viikolla suljettavat P1-porttirivit

| Ryhmä | Rivit | Mitä puuttuu |
| --- | --- | --- |
| Ennakkoehdot | PRE-06–PRE-07 | Oikea Cloudcity/WordPress-rinnakkaiskoe sekä henkilöiden ja kellonaikojen vahvistus. PRE-05-esittelysivu ja PRE-08-testiaineisto ovat PASS. |
| WordPress ja tuotantopolku | WP-06–WP-11 | WP-06–WP-10:n uusinta oikeassa `/aloitus/`-osoitteessa ja WP-01–WP-04:n jälkeen-savukoe. WP-05-esittelysivu on PASS. |
| Varmistus ja vaihto | OPS-02–OPS-04, OPS-06 | MariaDB-varmistuksen yksityinen lopputietue, lopullinen Firestore-vienti ja täsmäytys, hyväksytyn käyttäjäpoikkeuksen mukainen tuotantoyhteys sekä vastuiden hyväksyntä. OPS-01-tiedostovarmistus ja OPS-05-tuotantopaketti ovat PASS. |

WP-06–WP-10:n paikallinen tulos on hyväksytty vain valmistelunäyttönä. Se ei todista Cloudcityn LiteSpeed/Apache-reititystä, fyysisen `/aloitus/`-hakemiston rinnakkaiseloa WordPressin kanssa eikä oikeaa tuotantotietokantaa.

## Ratkaistu P2-tuotepäätös

Tuotevastuu hyväksyi 27.8.2026 PREF-02:n täsmennetyn hyväksymisehdon. REL-11:ssä tekstikoon voi palauttaa 100 prosenttiin. Palautus muuttaa vain selaimen paikallista `uiScale`-asetusta eikä poista kotikuntaa, suosikkeja, lomaketietoja, tunnistautumistietoja tai palvelimen tietoja. Kooditarkistus vahvisti, että `resetFont` asettaa vain tekstikoon oletusarvoon ja tallennusefekti kirjoittaa vain `uiScale`-avaimen. PREF-02 on PASS eikä vaadi version 0.74.5 sovelluskoodin muuttamista tai uutta staging-kierrosta.

Kaikkien Asetukset-paneelissa näkyvien näkymäasetusten turvallinen kertapalautus siirrettiin kehityksen omistamaksi REL-13:n tai myöhemmän version tehtäväksi tiedostoon `TODO_HUMAN.md`. Tehtävä ei saa tyhjentää kotikuntaa, suosikkeja, kieltä, lomakejonoja, tunnistautumista tai palvelimen tietoja.

Suljettu P3-havainto `REL11-OPS-01` oli hakurajauksesta johtunut väärä löydös eikä vaikuta päätökseen.

## GO-ehdot

Päätös voidaan muuttaa GO-tilaan vain, kun kaikki seuraavat toteutuvat samalla jäädytetyllä ehdokkaalla:

1. PRE-06–PRE-07, WP-06–WP-11, OPS-02–OPS-04 ja OPS-06 ovat PASS tai kirjallisesti perusteltu N/A sallitaan matriisin sääntöjen mukaisesti. PRE-05, PRE-08, WP-05, OPS-01 ja OPS-05 säilyvät PASS-tilassa.
2. Oikea `/aloitus/`, `/aloitus/api/v1/health`, resurssit, kanonisointi ja Aloitussivun 404 läpäisevät kokeet ilman alidomainiohjausta tai WordPress-regressiota.
3. Lopullinen Firestore-delta ja tunnistejoukon vertailu täsmäävät, `exceptionCount` on 0 eikä samanaikaisia kirjoituksia synny Firestoreen ja Cloudcityyn.
4. Julkaisuhetken tiedosto- ja MariaDB-varmistukset, palautusoikeudet sekä 28.8.2026 hyväksytyn tietoturvapoikkeuksen rajauksen mukainen tuotantotietokantatunnus on vahvistettu.
5. PREF-02:n 27.8.2026 hyväksytty rajaus säilyy muuttumattomana; myöhempi kertapalautus ei kuulu REL-11-julkaisuun.
6. Go/no-go-hyväksyjä, riippumaton smoke-hyväksyjä, palautuksen käynnistäjä ja muutosikkunan kellonajat on nimetty.
7. Lopullinen commit, build ID ja ZIP-tiiviste on lukittu ja vastaa testattua sisältöä.

## Hyväksyntä – täytetään vasta ensi viikolla

- Lopullinen päätös: `täytetään`
- Go/no-go-hyväksyjä: `täytetään`
- Päivämäärä ja kellonaika Europe/Helsinki: `täytetään`
- Riippumaton smoke-hyväksyjä: `täytetään`
- Hyväksytyt P2/P3-poikkeamat: `täytetään tai ei ole`
- REL-12:lle luovutettu commit/build/ZIP: `täytetään`
- Palautuksen käynnistäjä: `täytetään`

Kun nämä kohdat ovat valmiit, tehtävän 10/10 lopullinen päätös kirjataan testimatriisiin ja julkaisupäiväkirjaan. Ennen sitä päätös pysyy NO-GO-tilassa.
