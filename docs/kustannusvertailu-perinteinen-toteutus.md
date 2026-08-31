# Mitä Aloitussivu olisi maksanut perinteisesti toteutettuna

Laadittu: 28.8.2026
Liittyy: `docs/tyotuntiseuranta.md`
Luonne: **arvio, ei tarjous eikä toteuma.** Luvut on esitettävä vaihteluvälinä, ei yhtenä lukuna — samalla periaatteella kuin työtuntiseurannassa.

## 1. Kysymys

Jos sama palvelu olisi tilattu ohjelmistotalolta tavanomaisena projektina ilman tekoälyavusteista kehitystä, mitä se olisi maksanut?

## 2. Mitä on rakennettu

Arvion pohjana on repositorion todellinen sisältö 28.8.2026:

| Kohde | Määrä |
| --- | ---: |
| Sovelluskoodi, frontend (React/TypeScript, ilman kuntadataa) | n. 23 800 riviä |
| Backend (PHP, 52 luokkaa) | 7 133 riviä |
| API-testit | 2 446 riviä |
| Rakennus- ja data-ajoskriptit | 8 668 riviä |
| Cloud Functions | 554 riviä |
| Kuntakohtainen linkkiaineisto | 21 773 riviä |
| Dokumentaatio (90 tiedostoa) | 20 582 riviä |
| Commiteja | 266 |
| Linkkejä | 2 099 |
| Kuntia katettu | 308 |
| Kieliversioita | 7 |
| Julkaisuportin testitapauksia | 88 |

Lisäksi: neljä teemaa ja tumma tila, viisi tekstikokoa, saavutettavuustyö, ylläpitokäyttöliittymä, palautejono, linkki-ilmoitukset, Kyberturvallisuuskeskuksen syötteen jäsennin kahdelle eri sivurakenteelle, tekoälytiivistys selkokielelle, käyttötilastointi ilman evästeitä, WordPress-integraatio ja kymmenvaiheinen käyttöönottoprosessi.

## 3. Työmääräarvio perinteisellä menetelmällä

Yksikkö on henkilötyöpäivä (7,5 h). Arvio olettaa osaavan suomalaisen ohjelmistotalon tiimin: tuoteomistaja/projektipäällikkö, suunnittelija, kaksi kehittäjää, testaaja ja osa-aikainen tietoturva-asiantuntija.

| Kokonaisuus | Matala | Keski | Korkea |
| --- | ---: | ---: | ---: |
| Määrittely, konseptointi, käyttäjätutkimus | 14 | 20 | 28 |
| UX/UI-suunnittelu (teemat, tekstikoot, ikääntyneiden käytettävyys) | 22 | 30 | 42 |
| Frontend-toteutus | 58 | 75 | 100 |
| Backend, API ja tietokanta | 28 | 38 | 52 |
| **Kuntadatan kerääminen ja tarkistus, 308 kuntaa** | 42 | 55 | 75 |
| Monikielisyyden tekninen toteutus | 4 | 6 | 9 |
| Saavutettavuustyö (toteutus) | 9 | 12 | 18 |
| Tietoturvatyö ja korjaukset | 7 | 10 | 15 |
| Testaus ja laadunvarmistus (88 testitapausta, julkaisuportti) | 24 | 32 | 45 |
| Julkaisu, ympäristöt, WordPress-integraatio | 12 | 16 | 24 |
| Dokumentaatio | 8 | 12 | 18 |
| **Välisumma** | **228** | **306** | **426** |
| Projektinjohto ja hallinto, 18 % | 41 | 55 | 77 |
| **Yhteensä henkilötyöpäivää** | **269** | **361** | **503** |
| **Yhteensä tuntia** | **2 020** | **2 710** | **3 770** |

Keskiarvio 361 henkilötyöpäivää vastaa noin **1,7 henkilötyövuotta**.

### Kuntadata on arvion suurin yksittäinen erä

308 kuntaa kertaa keskimäärin seitsemän tietolajia (kunnan sivut, senioripalvelut, palveluliikenne, paikallislehti, ohjattu liikunta, uutissyöte, opastuspaikat), noin kymmenen minuuttia per tietolaji haku- ja tarkistustyötä, on yksinään noin 360 tuntia. Tämä työ ei näy koodina eikä ominaisuuslistalla, mutta se on palvelun ainoa todellinen kilpailuetu.

## 4. Hinta

Suomalaisten ohjelmistokonsulttien tuntihinnat ovat 2026 tyypillisesti 100–180 €/h; roolikohtaisesti junior 40–100, keskitaso 70–130, senior 80–160, arkkitehti 90–200, UX 80–150 ja projektipäällikkö 80–180 €/h. Sekoitettu tuntihinta tälle roolijakaumalle on realistisesti 100–140 €/h.

| Erä | Matala | Keski | Korkea |
| --- | ---: | ---: | ---: |
| Työ (tunnit × sekoitettu tuntihinta 100 / 115 / 140 €) | 202 000 € | 311 500 € | 527 800 € |
| Käännökset, 6 kieltä (pohjoissaame nostaa hintaa) | 4 000 € | 6 500 € | 11 000 € |
| Ulkoinen saavutettavuusauditointi | 5 000 € | 8 000 € | 12 000 € |
| Ulkoinen tietoturvatestaus | 6 000 € | 10 000 € | 18 000 € |
| **Yhteensä** | **217 000 €** | **336 000 €** | **569 000 €** |

**Paras yksittäinen arvio: noin 330 000 €.** Vaihteluväli 220 000–570 000 € riippuen toimittajan koosta ja siitä, kuinka tiukasti sisältö olisi rajattu.

### Vaihtoehto: oma rekrytointi

2 710 tuntia vastaa noin 1,75 henkilötyövuotta, mutta työ vaatii vähintään kolme eri osaamista (suunnittelu, kehitys, aineistotyö). Työnantajan kokonaiskustannuksella noin 150 000–190 000 €, minkä lisäksi ulkoiset auditoinnit noin 25 000 €. Käytännössä yhdenkään järjestön ei ole realistista rekrytoida 1,75 henkilötyövuotta kertaluonteiseen projektiin, joten tämä vaihtoehto olisi jäänyt tekemättä.

## 5. Toteutunut kustannus

| Erä | Arvio |
| --- | ---: |
| Ihmisen työaika, 60 h työnantajan kokonaiskustannuksella | n. 3 000 € |
| Tekoälytyökalujen tilaukset, 7 kk | 700–1 800 € |
| **Suora kustannus yhteensä** | **noin 4 000–5 000 €** |

Suhde perinteiseen toteutukseen on karkeasti **1:70** (vaihteluväli 1:45–1:115).

## 6. Mitä luku ei kerro — lue tämä ennen kuin siteeraat lukua

Vertailu ei ole täysin vertailukelpoinen, ja rehellisyys tässä on tärkeämpää kuin näyttävä luku.

1. **Ostettu projekti sisältää asioita, joita tässä ei ole.** Takuu, vastuu, sopimus, jatkuvuus ja se että joku muu kuin sinä osaa korjata palvelun. Tämän projektin ainoa osaaja on yksi ihminen.
2. **Määrittely oli valmiina sinun päässäsi.** Ostetussa projektissa 14–28 henkilötyöpäivää kuluu siihen, että toimittaja saa tietoonsa sen, minkä sinä jo tiesit. Se säästö on neljän vuoden oman työn ja vertaisopastajien kuuntelun ansiota, ei tekoälyn.
3. **Ulkoisia auditointeja ei ole ostettu.** Saavutettavuus- ja tietoturvatyö on tehty itse. Ulkopuolisen arvion riippumattomuutta ei voi korvata omalla tarkistuksella.
4. **Testaajien vapaaehtoistyötä ei ole laskettu kummallekaan puolelle.** Se on todellista työtä, jonka arvo puuttuu molemmista luvuista.
5. **Ylläpito puuttuu molemmista.** 2 099 linkkiä 308 kunnassa vanhenee jatkuvasti. Perinteisillä hinnoilla ylläpito olisi 25–50 henkilötyöpäivää vuodessa eli **20 000–45 000 € vuodessa**. Tämä on se luku, joka kannattaa esittää rahoituskeskustelussa — ei kertainvestointi.

## 7. Kiinnostavin johtopäätös ei ole euromäärä

Jos tämä olisi kilpailutettu, kuntadata olisi karsittu ensimmäisenä. Se on noin 18 % työmäärästä, se näyttää tarjouksessa "sisältötyöltä" eikä ohjelmistolta, ja sen voi aina "tehdä myöhemmin". Ilman sitä lopputulos olisi ollut linkkilista, jollaisia on jo olemassa.

Perinteinen projekti ei siis olisi tuottanut tätä palvelua halvemmalla tai kalliimmalla. Se olisi tuottanut eri, huonomman palvelun — ja todennäköisimmin se ei olisi käynnistynyt lainkaan, koska 330 000 euron hankkeelle ei olisi löytynyt rahoitusta.

Tekoälyn todellinen vaikutus ei ole se, että sama työ tehtiin halvemmalla. Se on se, että työ, jota ei olisi tilattu, tuli tehdyksi.
