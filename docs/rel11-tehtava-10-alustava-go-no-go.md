# REL-11 tehtävä 10/10 – alustava go/no-go-päätös

Päivitetty 27.8.2026. Tämä on ennen ensi viikon julkaisuikkunaa tehty alustava päätöspöytäkirja. Se ei ole tuotantolupa eikä muuta Cloudcityä, WordPressiä, Firestorea tai MariaDB:tä.

## Päätös

**NO-GO 27.8.2026.** REL-11-versiota ei julkaista vielä tuotantoon.

Staging-ehdokkaan `REL-11-v0.74.5-d5c4ea9ac2b8` sovelluskorjaukset ja niiden vaikutusaluetestit ovat PASS, ja avoimia P1-vikahavaintoja on 0. Kokonaisportissa on silti 16 P1-riviä, joita ei ole vielä hyväksytty oikeassa julkaisuympäristössä tai ihmisten vahvistuksilla.

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
| Ennakkoehdot | PRE-05–PRE-08 | WordPress-esittelysivu, oikea Cloudcity/WordPress-rinnakkaiskoe, henkilöiden ja kellonaikojen vahvistus sekä keinotekoisen testiaineiston sopiminen. |
| WordPress ja tuotantopolku | WP-05–WP-11 | Esittelysivun julkaisu, WP-06–WP-10:n uusinta oikeassa `/aloitus/`-osoitteessa ja WP-01–WP-04:n jälkeen-savukoe. |
| Varmistus ja vaihto | OPS-01–OPS-04, OPS-06 | Julkaisuhetken tiedosto- ja MariaDB-varmistukset, oikea Firestore-delta ja täsmäytys, oikean tuotantotietokannan valmius sekä vastuiden ja muutosikkunan hyväksyntä. |

WP-06–WP-10:n paikallinen tulos on hyväksytty vain valmistelunäyttönä. Se ei todista Cloudcityn LiteSpeed/Apache-reititystä, fyysisen `/aloitus/`-hakemiston rinnakkaiseloa WordPressin kanssa eikä oikeaa tuotantotietokantaa.

## Avoin P2-tuotepäätös

PREF-02 on FAIL, koska sovelluksessa ei ole kaikkien asetusten kertapalautusta oletuksiin. Nykyinen tekstikoon palautuspainike ei täytä testirivin nykyistä hyväksymisehtoa. Ennen GO-päätöstä tuotevastuun pitää kirjallisesti valita jompikumpi:

1. toteutetaan kaikkien paikallisten käyttöliittymäasetusten turvallinen palautus oletuksiin ja testataan se; tai
2. muutetaan PREF-02:n hyväksymisehto vastaamaan tarkoitettua, nykyistä asetusten hallintaa ja hyväksytään puuttuva kokonaispalautus rajattuna P2-poikkeamana omistajan ja aikataulun kanssa.

P2-riviä ei hyväksytä automaattisesti. Suljettu P3-havainto `REL11-OPS-01` oli hakurajauksesta johtunut väärä löydös eikä vaikuta päätökseen.

## GO-ehdot

Päätös voidaan muuttaa GO-tilaan vain, kun kaikki seuraavat toteutuvat samalla jäädytetyllä ehdokkaalla:

1. PRE-05–PRE-08, WP-05–WP-11, OPS-01–OPS-04 ja OPS-06 ovat PASS tai kirjallisesti perusteltu N/A sallitaan matriisin sääntöjen mukaisesti.
2. Oikea `/aloitus/`, `/aloitus/api/v1/health`, resurssit, kanonisointi ja Aloitussivun 404 läpäisevät kokeet ilman alidomainiohjausta tai WordPress-regressiota.
3. Lopullinen Firestore-delta ja tunnistejoukon vertailu täsmäävät, `exceptionCount` on 0 eikä samanaikaisia kirjoituksia synny Firestoreen ja Cloudcityyn.
4. Julkaisuhetken tiedosto- ja MariaDB-varmistukset, palautusoikeudet sekä tuotantotietokannan vähimmän oikeuden tunnukset on vahvistettu.
5. PREF-02:sta on kirjallinen tuotepäätös; mahdollinen P2-poikkeama on hyväksytty, omistettu ja aikataulutettu.
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
