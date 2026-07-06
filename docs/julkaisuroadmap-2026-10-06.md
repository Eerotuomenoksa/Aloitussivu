# Julkaisuroadmap 6.10.2026

Tämä roadmap kokoaa aloitussivu -sivun työn pilotista vakaaksi julkaisuksi. Suunniteltu julkaisupäivä on tiistai 6.10.2026.

Roadmap täydentää elokuun julkaisusuunnitelmaa. Tähän dokumenttiin kootaan päätöspisteet, keskeneräiset asiat ja julkaisuun vaadittavat hyväksynnät.

## Julkaisutavoite

Tavoitteena on julkaista aloitussivu pysyvään käyttöön niin, että käyttäjälle näkyvä kokonaisuus, nimi, visuaalinen ilme, tietosuoja, saavutettavuus, ylläpito ja tekninen tuotantoympäristö ovat sovittuina.

Julkaisu voi tapahtua kahdella tavalla:

1. Ensisijainen tavoite: palvelu julkaistaan oikeassa tuotantoympäristössä Cloudcityn tai muun sovitun palvelimen kautta.
2. Varasuunnitelma: frontend julkaistaan turvallisemmassa välivaiheessa, esimerkiksi Firebase Hostingissa tai nykyisen GitHub Pages -mallin kovennetulla rajauksella, jos Cloudcity-siirto ei valmistu ajoissa.

## Nykytila 31.5.2026

Sivusto on käyttökelpoinen pilotti, jossa on jo laaja palveluvalikoima, paikallisuutta, huijausvaroituksia, käyttötilastoja, ylläpitonäkymä, kieliversioita, toinen kello, tietosuojaselosteen luonnos ja saavutettavuusselosteen luonnos.

Keskeneräiset julkaisuun vaikuttavat asiat:

- avoimen testauksen tulokset puuttuvat vielä, koska testaus alkaa suunnitelman mukaan 1.6.2026
- testipalautteen priorisointi ja korjauslista pitää tehdä testijakson jälkeen
- nykyinen työnimi on Aloitussivu, mutta virallinen julkaisunimi pitää vielä vahvistaa ennen viestintää
- lopullinen julkaisupolku tai domain pitää päättää
- visuaalinen ilme pitää lukita ennen laajaa julkaisua
- saavutettavuustutkimus pitää tehdä ja saavutettavuusseloste viimeistellä sen perusteella
- tietosuojaseloste pitää viimeistellä lopullisilla vastuu- ja yhteystiedoilla
- Cloudcityn tai muun oikean palvelinympäristön tekninen ratkaisu pitää päättää ja testata
- ylläpidon sähköposti-ilmoitusten toteutustapa pitää selvittää
- nimipäivärajapinnan testirajoite pitää ratkaista ennen tuotantokäyttöä tai toiminto pitää piilottaa
- huijausvaroitusten automaation ajastus ja lokiseuranta pitää lukita
- linkkien tarkistus- ja ylläpitoprosessi pitää sopia

## Ennen julkaisua päätettävät ja muutettavat asiat

Tämä lista kootaan erikseen, jotta julkaisuun liittyvät nimitys-, osoite-, ylläpito- ja siivouspäätökset eivät huku teknisten työpakettien sisään.

### 1. Virallinen nimi ja nimen käyttötapa

- päätetään, jääkö viralliseksi nimeksi Aloitussivu vai valitaanko eri julkaisunimi
- päätetään, kirjoitetaanko nimi kaikissa kieliversioissa sellaisenaan vai käännetäänkö se
- päivitetään nimi käyttöliittymään, selaimen otsikoihin, metatietoihin, tietosuoja- ja saavutettavuussivuille, esittelymateriaaleihin ja julkaisun viestipohjiin
- tarkistetaan, ettei vanha työnimi, pieni alkukirjain tai SeniorSurf-yhdistelmänimi jää palvelun nimeksi vahingossa

### 2. Palvelun osoite ja julkaisupolku

- päätetään lopullinen osoite: oma domain, SeniorSurf-polku tai väliaikainen turvallisempi hosting-osoite
- testataan staging täsmälleen samalla polulla tai domainrakenteella kuin tuotanto
- päivitetään Firebase Authenticationin sallitut domainit, API key -rajoitukset, CORS, App Check ja mahdolliset suojausotsikot valittuun osoitteeseen
- päivitetään dokumentit, footer-linkit, jakolinkkien metatiedot ja julkaisuviestit lopulliseen osoitteeseen
- päätetään mitä nykyiselle GitHub Pages -testiosoitteelle tehdään: ohjaus, arkistointi tai selkeä testikäyttömerkintä

### 3. Ylläpidon ilmoitukset ja sähköposti

- päätetään, lähteekö ylläpidolle sähköposti uusista linkki-ilmoituksista, huijausvaroitusautomaation virheistä ja muista todo-asioista
- päätetään lähettäjäosoite, vastaanottajat ja mahdollinen jakelulista
- valitaan tekninen toteutustapa: Cloudcityn sähköposti, Microsoft 365 SMTP, Firebase/Cloud Function tai muu palvelinpuolen lähetyspalvelu
- varmistetaan, ettei sähköpostin käyttäjätunnuksia, avaimia tai SMTP-salaisuuksia päädy frontend-koodiin
- sovitaan varamalli, jos sähköpostia ei ehditä julkaisuun: esimerkiksi ylläpidon manuaalinen tarkistusrytmi ja päivittäinen koonti ylläpitonäkymässä

### 4. Poistettavat, piilotettavat ja tarkistettavat linkit

- ajetaan linkkitarkistus ja poistetaan rikkinäiset, vanhentuneet, tuplana olevat ja käyttäjän kannalta epäluotettavat linkit
- päätetään, mitkä kokeilu-, testi-, ylläpito- ja tekniset linkit poistetaan loppukäyttäjän näkyvistä ennen julkaisua
- tarkistetaan, ettei julkisessa etusivussa tai footerissa ole linkkejä, jotka ovat tarkoitettu vain ylläpitäjälle tai testaajalle
- merkitään epäselvät linkit päätettäviksi ihmiselle: poistetaan, korvataan vai jätetään jatkokehitykseen
- päivitetään `docs/linkit.md`, linkkiloki ja tarvittaessa poistettavien linkkien perustelut

### 5. Ylläpidon reitit ja pääsyn suojaus

- päätetään, poistetaanko julkinen ylläpito-linkki footerista kokonaan vai jätetäänkö se vain sovitulle testijaksolle
- vaihdetaan ylläpidon suorat reitit vähemmän arvattaviin nimiin tai sijoitetaan ne julkisen navigaation ulkopuolelle
- lisätään `noindex` ja robots-rajaukset ylläpito-, ehdotus- ja linkkilistasivuille silloin, kun ne eivät ole käyttäjälle tarkoitettuja julkisia sivuja
- varmistetaan, että ylläpito ei perustu pelkkään vaikeasti arvattavaan URLiin, vaan kirjautumiseen, admin-oikeuden tarkistukseen, palvelinpuolen sääntöihin ja tarvittaessa pyyntörajoihin
- testataan, että ei-ylläpitäjä ei näe tai voi muuttaa linkkiehdotuksia, huijausvaroituksia, käyttötilastoja tai muita ylläpitotietoja

### 6. Julkaisua edeltävä hyväksyntälista

- virallinen nimi hyväksytty
- lopullinen osoite hyväksytty ja testattu
- sähköposti- tai muu ylläpidon ilmoitusmalli päätetty
- poistettavat linkit käyty läpi
- ylläpitoreitit ja pääsynsuojaus päätetty ja testattu
- tietosuoja- ja saavutettavuussivut päivitetty lopullisilla nimillä, osoitteilla ja yhteystiedoilla
- julkaisuviestit ja jakolinkkien esikatselut tarkistettu

## Julkaisun periaatteet

Julkaisuun ei oteta enää syyskuun puolivälin jälkeen isoja uusia ominaisuuksia, elleivät ne ole välttämättömiä julkaisun turvallisuuden, saavutettavuuden tai käyttöönoton kannalta.

Linkkien lisäykset, tekstikorjaukset ja pienet bugikorjaukset ovat sallittuja julkaisuun asti, mutta ne pitää testata kevyesti.

Käyttäjälle näkyvät rakenne-, nimi-, väri- ja navigaatiomuutokset lukitaan ennen hyväksyntätestausta.

## Aikajana

### 1.6.-30.6.2026: avoin testaus

Tavoite on kerätä käyttäjä- ja digiopastajapalautetta ilman, että sivua muutetaan jatkuvasti alta pois.

Tehtävät:

- kerätään palautelomakkeen vastaukset
- kirjataan suorat havainnot opastustilanteista
- seurataan, löytyvätkö palvelut ja ymmärretäänkö kategoriat
- seurataan mobiilikäytettävyyttä, tekstikokoa, kontrasteja ja kielen ymmärrettävyyttä
- kirjataan puuttuvat linkit, virheelliset linkit ja epäselvät palvelut
- seurataan huijausvaroitusten, paikallisuutisten, nimipäivien ja tekoälyavustajan toimivuutta

Sallitut muutokset testauksen aikana:

- kriittiset bugikorjaukset
- yksittäiset linkkikorjaukset
- pienet tekstikorjaukset
- saavutettavuuden kannalta välttämättömät pienet korjaukset

Ei tehdä testauksen aikana:

- isoa visuaalista uudistusta
- domain- tai palvelinsiirtoa
- suurta tietokanta- tai ylläpitomallin muutosta
- uusia päätoimintoja, jotka vaikeuttavat palautteen tulkintaa

### 1.7.-31.7.2026: kevyt ylläpito ja palautteen kokoaminen

Heinäkuu pidetään kevyenä ylläpitokuukautena.

Tehtävät:

- varmistetaan, että testauslinkki toimii
- korjataan vain selvät virheet
- kootaan palautteet elokuun analyysiä varten
- aloitetaan alustava lista: julkaisuun pakolliset, julkaisuun hyödylliset ja myöhemmäksi jätettävät

### 1.8.-16.8.2026: testitulosten analyysi ja päätökset

Tämä on ensimmäinen varsinainen julkaisupäätösten jakso.

Tehtävät:

- analysoidaan avoimen testauksen tulokset
- ryhmitellään palaute: löydettävyys, käytettävyys, saavutettavuus, sisältö, tekniset virheet, uudet ideat
- päätetään, mitkä palautteet korjataan ennen 6.10. julkaisua
- vahvistetaan nimen käyttötapa viestinnässä: työnimi Aloitussivu tai erikseen päätetty virallinen nimi
- päätetään lopullinen domain tai polku
- päätetään, pidetäänkö ylläpito-, ehdotus- ja linkkilistasivut julkisessa navigaatiossa vai siirretäänkö ne vain ylläpidon käyttöön
- päätetään, jääkö Firebase julkaisuun mukaan vai siirretäänkö data Cloudcityyn ennen julkaisua
- päätetään visuaalisen ilmeen suunta: värit, fonttikoko, korttirakenne, painikkeet, tiheys ja kuvallisuus
- päätetään ylläpitovastuu ja julkaisun jälkeinen päivitysrytmi

Hyväksyttävä lopputulos 16.8. mennessä:

- priorisoitu korjauslista
- alustava julkaisunimi: Aloitussivu tai erikseen päätetty virallinen nimi
- lista ennen julkaisua poistettavista tai piilotettavista linkeistä
- alustava tuotantoympäristöpäätös
- päätös siitä, mitä ei tehdä ennen ensimmäistä julkaisua

### 17.8.-31.8.2026: saavutettavuus, tietosuoja ja visuaalinen lukitus

Tavoite on tehdä palvelusta julkaisukelpoinen myös luottamuksen ja vastuullisuuden näkökulmasta.

Tehtävät:

- tehdään saavutettavuustutkimus tai vähintään kattava käsin tehty saavutettavuustarkistus
- testataan näppäimistökäyttö, ruudunlukijakäyttö, kontrastit, mobiilinäkymät ja modaalit
- korjataan julkaisua estävät saavutettavuuspuutteet
- viimeistellään saavutettavuusseloste
- viimeistellään tietosuojaseloste
- lisätään lopullinen palautekanava saavutettavuus- ja tietosuojapalautteelle
- lukitaan visuaalinen ilme ensimmäistä julkaisua varten
- kirjataan myöhemmät visuaaliset ideat jatkokehitykseen

Hyväksyttävä lopputulos 31.8. mennessä:

- saavutettavuusseloste on valmis julkaistavaksi
- tietosuojaseloste on valmis julkaistavaksi
- visuaalinen ilme on lukittu
- jäljellä ei ole tunnettuja P1-tason saavutettavuusongelmia

### 1.9.-15.9.2026: tekninen tuotantopolku ja palvelinsiirto

Tavoite on ratkaista, missä palvelu julkaistaan ja miten taustatoiminnot toimivat tuotannossa.

Tehtävät:

- päätetään lopullinen palvelinmalli: Cloudcity, Firebase Hosting välivaiheena tai muu sovittu tuotantomalli
- selvitetään Cloudcityn Pro-tilin sähköposti- ja backend-mahdollisuudet
- päätetään ylläpidon ilmoitusosoite, vastaanottajat ja mahdollinen lähettäjäosoite
- suunnitellaan, tarvitaanko Cloudcityyn oma API ja tietokanta
- testataan staging-ympäristö
- testataan ympäristömuuttujat ja salaisuuksien hallinta palvelinpuolella
- varmistetaan HTTP-suojausotsikot
- varmistetaan App Check tai vastaava suojaus julkaistulle ympäristölle
- testataan Google-kirjautuminen ja ylläpitonäkymä uudessa osoitteessa
- testataan linkkiehdotukset, huijausvaroitukset, käyttötilastot ja nimipäivätoiminto uudessa osoitteessa

Hyväksyttävä lopputulos 15.9. mennessä:

- tuotantopolku on päätetty
- staging toimii
- kriittiset ympäristömuuttujat ja salaisuudet eivät ole frontendissä
- ylläpito toimii uudessa ympäristössä

### 16.9.-27.9.2026: release candidate

Tavoite on jäädyttää julkaistava kokonaisuus.

Tehtävät:

- tehdään release candidate -versio
- tehdään linkkitarkistus
- poistetaan tai piilotetaan julkaisuun kuulumattomat testi-, ylläpito- ja tekniset linkit
- vaihdetaan ylläpitoreitit pois helposti arvattavista julkisista osoitteista ja poistetaan ne julkisesta navigaatiosta, jos niin päätetään
- tehdään käyttöliittymän smoke-testaus mobiilissa ja työpöydällä
- testataan kieliversiot
- testataan ylläpitäjän kirjautuminen ja ei-ylläpitäjän pääsyn esto
- testataan huijausvaroitusten automaatio ja ajoloki
- testataan käyttötilastojen päivittyminen
- testataan nimipäivärajapinnan käyttöraja tai tiedostopohjainen ratkaisu
- testataan footerin linkit: tietosuoja, saavutettavuus, muutosloki, linkit ja ylläpito
- laaditaan julkaisutiedote ja testaajille lähetettävä kiitos-/jatkoviesti

Hyväksyttävä lopputulos 27.9. mennessä:

- julkaisukandidaatti on valmis
- vain P2/P3-tason pienet korjaukset ovat sallittuja
- julkaisuviestintä on luonnosteltu

### 28.9.-5.10.2026: hyväksyntä ja julkaisuvalmistelu

Tämä on viimeinen viikko ennen julkaisua.

Tehtävät:

- tehdään hyväksyntätestaus lopullisessa osoitteessa
- tarkistetaan tietosuoja- ja saavutettavuussivujen lopulliset tekstit
- tarkistetaan nimi, logo/otsikko ja metatiedot
- tarkistetaan, että työnimi/virallinen nimi, osoite ja ylläpidon yhteystiedot ovat yhtenäiset kaikissa kieliversioissa
- tarkistetaan jakolinkkien esikatselut
- varmistetaan analytiikan ja käyttötilastojen toiminta
- varmistetaan ylläpidon päivystys ensimmäiselle julkaisuviikolle
- tehdään go/no-go-päätös

Go/no-go-päivä:

- suositus: torstai 1.10.2026
- varapäivä: perjantai 2.10.2026

### 6.10.2026: julkaisu

Julkaisupäivän tehtävät:

- julkaistaan lopullinen osoite
- tarkistetaan etusivu, ylläpito, tietosuoja, saavutettavuus ja muutosloki tuotannossa
- lähetetään viesti testaajille ja sidosryhmille
- merkitään GitHub Pages -testiosoite joko testikäyttöön tai ohjataan käyttäjät uuteen osoitteeseen
- seurataan virheitä, palautetta ja käyttötilastoja

Ensimmäisen viikon seuranta:

- seurataan kriittiset bugit päivittäin
- tarkistetaan ylläpitoon tulleet linkkiehdotukset ja ilmoitukset
- tarkistetaan huijausvaroitusten automaatio
- seurataan, tuleeko saavutettavuus- tai tietosuojapalautetta

## Työpaketit ja alustavat versiot

Nykyinen versio on `0.70.0`. Alla olevat versiot ovat suunnittelunumeroita. Lopullinen versionumero nostetaan toteutettujen muutosten mukaan versionumerointiskriptillä.

Arvioissa ihmisen aika tarkoittaa aktiivista työaikaa: päätökset, ohjaus, tarkistus, hyväksyntä ja tarvittava käsin tehty testaus. Codex-aika tarkoittaa toteutusta, tarkistuksia, dokumentointia ja ajoja, jotka voivat suurelta osin tapahtua taustalla.

| Paketti | Aikaikkuna | Alustava versio | Päätyyppi | Ihmisen aktiivinen aika | Codex-/toteutusaika | Lopputulos |
| --- | --- | --- | --- | ---: | ---: | --- |
| WP0: testausjakson tuki | 1.6.-30.6. | `0.71.x` | kevyt koodaus ja ylläpito | 3-6 h | 8-16 h | Testaus pysyy käynnissä, kriittiset virheet ja pienet linkkikorjaukset hoidetaan |
| WP1: testitulosten koonti | 1.8.-6.8. | ei versiota tai `0.72.0` | testitulosten läpikäynti | 6-10 h | 4-8 h | Palautteet luokiteltu ja priorisoitu |
| WP2: julkaisun rajaus | 5.8.-9.8. | ei versiota | päätöksenteko isommalla porukalla | 3-5 h | 2-4 h | Päätös siitä, mitä tehdään ennen 6.10., mitä poistetaan/piilotetaan ja mitä jätetään jatkokehitykseen |
| WP3: nimi ja osoite | 5.8.-16.8. | ei versiota | päätöksenteko isommalla porukalla | 2-4 h | 2-4 h | Virallinen nimi tai työnimen käyttö vahvistettu, domain tai polku valittu |
| WP4: palautteen P1/P2-korjaukset | 7.8.-23.8. | `0.73.0`-`0.76.x` | koodaus ja sisällön korjaus | 5-10 h | 16-35 h | Tärkeimmät testipalautteen korjaukset tehty |
| WP5: visuaalinen lukitus | 17.8.-31.8. | `0.77.0` | päätös ja koodaus | 4-8 h | 8-18 h | Värit, rakenne, tiheys, painikkeet ja mobiilirytmi lukittu |
| WP6: saavutettavuustutkimus | 17.8.-24.8. | ei versiota | testaus ja arviointi | 5-9 h | 4-10 h | Näppäimistö-, ruudunlukija-, kontrasti- ja mobiilihavainnot koottu |
| WP7: saavutettavuuskorjaukset ja seloste | 24.8.-31.8. | `0.78.0`-`0.80.x` | koodaus ja dokumentointi | 4-8 h | 12-25 h | Julkaisua estävät saavutettavuuspuutteet korjattu ja seloste viimeistelty |
| WP8: tietosuojaselosteen viimeistely | 24.8.-31.8. | `0.81.0` | päätös ja dokumentointi | 3-5 h | 4-8 h | Rekisterinpitäjä, yhteystieto ja tietovirrat kuvattu |
| WP9: tuotantopolun päätös | 1.9.-5.9. | ei versiota | päätöksenteko ja tekninen selvitys | 4-8 h | 4-8 h | Päätös Cloudcity/Firebase/muu tuotantomalli |
| WP10: palvelinsiirto ja staging | 1.9.-15.9. | `0.82.0`-`0.86.x` | koodaus ja ympäristötyö | 8-16 h | 25-55 h | Staging toimii ja ylläpito, kirjautuminen sekä ympäristömuuttujat on testattu |
| WP11: ylläpidon ilmoitukset | 8.9.-19.9. | `0.87.0` | koodaus ja palvelinselvitys | 3-6 h | 8-20 h | Päätös sähköpostista, vastaanottajista ja koontimallista, mahdollinen ensimmäinen toteutus |
| WP12: nimipäivät tuotantoon | 8.9.-19.9. | `0.88.0` | koodaus ja sisältöpäätös | 2-4 h | 6-14 h | Nimipäivät joko tiedostopohjaiseksi tai piilotetaan tuotannosta |
| WP13: huijausvaroitusten automaatio | 8.9.-19.9. | `0.89.0` | koodaus ja ylläpitoprosessi | 3-5 h | 8-18 h | Ajastus, loki, viimeisin päivitysaika ja ylläpidon seuranta kunnossa |
| WP14: linkkitarkistus ja sisällön siivous | 16.9.-23.9. | `0.90.x` | tarkistus ja pienet korjaukset | 4-7 h | 8-20 h | Rikkinäiset linkit, tuplat, julkaisuun kuulumattomat linkit ja ylläpidon julkiset linkit korjattu |
| WP15: release candidate | 16.9.-27.9. | `0.95.0` | testaus ja jäädytys | 6-10 h | 10-25 h | Julkaisukandidaatti valmis hyväksyntään |
| WP16: hyväksyntä ja julkaisuviestintä | 28.9.-5.10. | `0.99.0` | päätös, viestintä ja testaus | 5-9 h | 4-10 h | Go/no-go, viestit, metatiedot ja viimeiset tarkistukset valmiit |
| WP17: julkaisu | 6.10. | `1.0.0` | julkaisu ja seuranta | 3-6 h | 3-8 h | Tuotantojulkaisu tehty ja ensimmäiset tarkistukset läpi |
| WP18: ensimmäisen viikon seuranta | 7.10.-13.10. | `1.0.1`-`1.0.x` | ylläpito ja bugikorjaukset | 3-6 h | 5-15 h | Ensimmäiset käyttäjäpalautteet ja pienet korjaukset hoidettu |
| WP19: Chrome Built-in AI -selvitys | 6.1.-31.1.2027 | `1.2.0` tai myöhempi | jatkokehitys ja tekninen kokeilu | 2-4 h | 6-14 h | Selvitetty voidaanko selaimen paikallista AI-rajapintaa käyttää nykyisen avustajan rinnalla |

### Työpakettien tarkempi sisältö

#### WP0: testausjakson tuki

Tyyppi: kevyt koodaus ja ylläpito.

Tehdään vain testauksen mahdollistavat korjaukset. Linkkien lisäykset, yksittäiset virheet ja kriittiset käyttökatkot voidaan korjata patch-versioina.

Ei vaadi isoa päätöstä, ellei löydy käyttäjää estävä virhe.

#### WP1: testitulosten koonti

Tyyppi: testitulosten läpikäynti.

Kootaan palautelomakkeen vastaukset, opastajien havainnot, linkkiehdotukset, tekniset virheet ja ylläpidon lokit yhteen listaan.

Codex voi auttaa luokittelussa, yhteenvetojen tekemisessä ja korjauslistan luonnissa. Ihmisen pitää arvioida, mikä on oikeasti tärkeää käyttäjälle.

#### WP2: julkaisun rajaus

Tyyppi: päätöksenteko isommalla porukalla.

Päätetään julkaisuun pakolliset asiat, hyödylliset mutta vapaaehtoiset asiat ja julkaisun jälkeiset ideat.

Tämä on aikataulun tärkein päätöspaketti. Jos tätä ei tehdä, lokakuun julkaisu paisuu helposti.

Pakettiin lisätään erillinen poistettavien ja piilotettavien asioiden lista. Siihen kuuluvat esimerkiksi testilinkit, ylläpidon suorat linkit, epäselvät palvelulinkit, keskeneräiset kokeilutoiminnot ja sellaiset toiminnot, joiden tuotantovastuu tai tietosuojakuvaus ei ole valmis.

#### WP3: nimi ja osoite

Tyyppi: päätöksenteko isommalla porukalla.

Nykyinen työnimi on Aloitussivu. Päätetään, jääkö se viralliseksi julkaisunimeksi vai valitaanko erillinen virallinen nimi. Päätetään myös osoite: SeniorSurf-polku, oma domain tai väliaikainen julkaisuosoite.

Codex voi valmistella nimen yhtenäisen käytön käyttöliittymään, kieliversioihin, dokumentteihin, viestintäteksteihin ja metatietoihin, mutta nimi- ja osoitepäätös kannattaa tehdä ihmisryhmässä.

#### WP4: palautteen P1/P2-korjaukset

Tyyppi: koodaus ja sisällön korjaus.

Korjataan testissä löytyneet käyttäjää estävät tai selvästi häiritsevät asiat. Tämä voi sisältää mobiiliasettelua, tekstimuutoksia, linkkejä, paikallisuuden ongelmia, ylläpidon pieniä parannuksia ja kieliversioita.

Versionumerointi: käyttäjälle näkyvät kokonaisuudet nostavat minoria, yksittäiset linkit ja bugit patcheja.

#### WP5: visuaalinen lukitus

Tyyppi: päätös ja koodaus.

Lukitaan julkaisun ulkoasu. Tavoite ei ole tehdä uutta markkinointisivua, vaan varmistaa että käyttöliittymä on rauhallinen, selkeä ja toistettavasti saman näköinen.

Päätettäviä asioita ovat värit, korttitiheys, painikkeet, fonttikoko, mobiilin rytmi ja mahdolliset tukija-/logoelementit.

#### WP6: saavutettavuustutkimus

Tyyppi: testaus ja arviointi.

Tehdään käsin tehtävä tarkistus: näppäimistö, ruudunlukija, kontrastit, mobiili, modaalit, lomakkeet, fokusjärjestys ja kieliversiot.

Codex voi valmistella testiprotokollan ja kerätä havaintoja koodista, mutta ruudunlukija- ja käytettävyystulkinnassa tarvitaan ihmisen arvio.

#### WP7: saavutettavuuskorjaukset ja seloste

Tyyppi: koodaus ja dokumentointi.

Korjataan julkaisua estävät saavutettavuuspuutteet ja päivitetään saavutettavuusseloste vastaamaan todellista tilannetta.

Jos tutkimus löytää isoja puutteita, tästä tulee aikataulun kannalta kriittinen paketti.

#### WP8: tietosuojaselosteen viimeistely

Tyyppi: päätös ja dokumentointi.

Viimeistellään rekisterinpitäjä, yhteystiedot, käyttötilastojen kuvaus, tekoälyavustajan tietovirrat, linkkiehdotukset, Firebase/Cloudcity-roolit ja paikallistallennus.

Tarvitsee ihmiseltä päätökset vastuista ja yhteystiedoista.

#### WP9: tuotantopolun päätös

Tyyppi: päätöksenteko ja tekninen selvitys.

Päätetään mennäänkö julkaisuun Cloudcityllä, Firebase Hostingilla vai muulla välivaiheen mallilla.

Päätös pitää tehdä aikaisin syyskuussa, koska toteutuksen ja testauksen pitää ehtiä ennen release candidatea.

#### WP10: palvelinsiirto ja staging

Tyyppi: koodaus ja ympäristötyö.

Toteutetaan valittu tuotantopolku ja staging. Testataan kirjautuminen, Firestore tai mahdollinen Cloudcity API, ympäristömuuttujat, App Check, suojausotsikot ja ylläpito.

Tämä on suurin tekninen epävarmuus. Jos Cloudcityn rajat tulevat vastaan, käytetään varasuunnitelmaa.

#### WP11: ylläpidon ilmoitukset

Tyyppi: koodaus ja palvelinselvitys.

Selvitetään Cloudcityn Pro-tilin sähköpostiominaisuudet ja päätetään ylläpidon ilmoitusosoite, vastaanottajat, lähettäjäosoite ja lähetyksen vastuupalvelu. Ensimmäinen toteutus voi olla vain päivittäinen koonti tai ylläpidon ilmoitus uusista linkkiehdotuksista.

Jos sähköpostit venyvät, julkaisu voi silti mennä läpi ilman tätä, kunhan ylläpidon manuaalinen tarkistusrytmi sovitaan.

Sähköpostisalaisuuksia ei saa toteuttaa frontendissä. Ilmoitusten pitää lähteä palvelinpuolelta tai sovitusta taustapalvelusta.

#### WP12: nimipäivät tuotantoon

Tyyppi: koodaus ja sisältöpäätös.

Päätetään piilotetaanko nimipäivät tuotannosta vai siirrytäänkö tiedostopohjaiseen ostettuun nimipäivädataan. Testirajallinen API ei ole hyvä tuotantoriippuvuus.

Jos dataa ei saada ajoissa, toiminto piilotetaan asetuksista oletuksena.

#### WP13: huijausvaroitusten automaatio

Tyyppi: koodaus ja ylläpitoprosessi.

Lukitaan RSS- tai muu lähde, ajastus, viimeisin päivitysaika, ajoloki ja ylläpitäjän hälytys, jos haku ei onnistu.

Tavoite on, että käyttäjä ei näe vanhentunutta varoitusta ilman selkeää päivitystietoa.

#### WP14: linkkitarkistus ja sisällön siivous

Tyyppi: tarkistus ja pienet korjaukset.

Ajetaan linkkitarkistus, korjataan rikkinäiset linkit ja poistetaan selkeät tuplat. Samalla poistetaan tai piilotetaan julkaisuun kuulumattomat testilinkit, ylläpidon julkiset linkit ja muut palvelut, joiden ylläpitovastuu tai luotettavuus ei ole valmis.

Ylläpidon osoitteet voidaan vaihtaa vähemmän arvattaviin reitteihin ja poistaa julkisesta navigaatiosta, mutta tämä ei korvaa kirjautumista, admin-oikeuksia, Firestore-/API-sääntöjä, `noindex`-merkintöjä eikä pyyntörajoja.

#### WP15: release candidate

Tyyppi: testaus ja jäädytys.

Tehdään `0.95.0`-julkaisukandidaatti. Sen jälkeen sallitaan vain hyväksyntätestauksessa löytyneet korjaukset.

Testataan etusivu, asetukset, kieliversiot, ylläpito, kirjautuminen, linkit, huijausvaroitukset, käyttötilastot, tietosuoja ja saavutettavuus.

#### WP16: hyväksyntä ja julkaisuviestintä

Tyyppi: päätös, viestintä ja testaus.

Tehdään go/no-go, viimeistellään julkaisun viestit, tarkistetaan metatiedot ja sovitaan ensimmäisen viikon seuranta.

Tämä on enemmän ihmistyötä kuin koodausta.

#### WP17: julkaisu

Tyyppi: julkaisu ja seuranta.

Julkaistaan `1.0.0`. Tarkistetaan tuotantopolku heti julkaisun jälkeen ja lähetetään viestit testaajille sekä sidosryhmille.

#### WP18: ensimmäisen viikon seuranta

Tyyppi: ylläpito ja bugikorjaukset.

Korjataan vain julkaisun jälkeiset kriittiset tai pienet selkeät virheet. Versionumerot ovat `1.0.1`, `1.0.2` ja niin edelleen.

#### WP19: Chrome Built-in AI -selvitys

Tyyppi: jatkokehitys ja tekninen kokeilu.

Ajankohta: noin kolme kuukautta 6.10.2026-julkaisun jälkeen, alustavasti tammikuu 2027.

Selvitetään, voidaanko Chrome-selaimen sisäänrakennettuja AI-rajapintoja käyttää aloitussivun avustajan tai tekstinkäsittelyn tukena. Tätä ei suunnitella ensimmäisen julkaisun osaksi, koska selain- ja kielituki voi olla rajallinen, eikä toiminnon pidä rikkoa nykyistä Cloud Function + Gemini -mallia.

Tarkistettavat asiat:

- onko Chrome Built-in AI / Prompt API vakaasti saatavilla julkaisun jälkeisessä Chrome-versiossa
- toimiiko rajapinta suomen kielellä riittävän hyvin seniorikäyttäjän tarpeisiin
- millä laitteilla malli on käytettävissä ja miten puuttuva tuki havaitaan
- voiko sitä käyttää vain lisäominaisuutena nykyisen pilvipohjaisen avustajan rinnalla
- millainen tietosuojateksti tarvitaan, jos osa AI-käsittelystä tapahtuu paikallisesti selaimessa
- mitä tapahtuu muissa selaimissa, mobiilissa ja vanhemmissa Chrome-versioissa

Mahdollinen toteutusmalli:

- lisätään erillinen AI-adapteri, joka tarkistaa selaimen paikallisen AI-tuen
- käytetään selaimen paikallista AI:ta vain rajattuihin tehtäviin, kuten palautetekstin selkeyttämiseen, lyhyeen tiivistykseen tai ohjeen muotoiluun
- säilytetään nykyinen `geminiChat` Cloud Function varmana oletusratkaisuna
- lisätään selkeä fallback, jos paikallista mallia ei ole saatavilla

Päätöskriteeri: ominaisuus otetaan käyttöön vain, jos se parantaa käyttäjäkokemusta ilman että palvelun toimivuus riippuu yhdestä selaimesta tai keskeneräisestä rajapinnasta.

## Kokonaistyöarvio

Jos Codexia käytetään sujuvasti toteuttavana parina, realistinen ihmisen aktiivinen työmäärä on noin 75-135 tuntia koko kesä-lokakuun polulle, jos mukaan lasketaan myös kokoukset, päätökset, testipalautteen käsittely, hyväksyntä ja julkaisun jälkeinen seuranta.

Varsinaista Codexin, komentojen, buildien, testien ja taustatoteutuksen aikaa kertyy arviolta 160-350 tuntia. Tästä suuri osa voi tapahtua niin, että ihminen tekee samalla muuta työtä ja palaa tarkistamaan tuloksia.

Tiukempi minimimalli on noin 45-70 tuntia ihmisen aktiivista työtä, jos:

- Cloudcity-siirto jätetään julkaisun jälkeen tehtäväksi tai käytetään valmista välivaiheen hostingia
- sähköposti-ilmoitukset jätetään jatkokehitykseen
- nimipäivät piilotetaan tai ratkaistaan hyvin yksinkertaisesti
- testipalautteesta korjataan vain P1/P2-asiat
- visuaalisuutta ei avata uudeksi suunnittelukierrokseksi

Laajempi tuotantomalli on noin 100-160 tuntia ihmisen aktiivista työtä, jos:

- Cloudcityyn tehdään oma backend/API ja tietokantaratkaisu ennen julkaisua
- sähköposti-ilmoitukset rakennetaan julkaisuun mukaan
- saavutettavuustutkimus tuottaa merkittäviä korjauksia
- nimi, domain ja visuaalinen ilme vaativat useita hyväksyntäkierroksia

## Viikkotason tuntiarvio

Alla oleva arvio näyttää työn kuormituksen viikoittain. Ihmisen tunnit tarkoittavat aktiivista työaikaa. Codex-/toteutusaika tarkoittaa työtä, jonka voi suurelta osin antaa Codexille, komentojen ajoille ja tarkistuksille.

| Viikko | Päivät | Pääpaino | Ihminen | Codex/toteutus | Huomio |
| --- | --- | --- | ---: | ---: | --- |
| v23 | 1.6.-7.6. | Avoimen testauksen käynnistys ja ensimmäiset havainnot | 1-2 h | 2-4 h | Varmistetaan, että testauslinkki, lomake ja perustoiminnot toimivat |
| v24 | 8.6.-14.6. | Testausjakson tuki | 1-2 h | 2-4 h | Vain pienet bugit, linkit ja tekstikorjaukset |
| v25 | 15.6.-21.6. | Testausjakson tuki ja havaintojen keruu | 1-2 h | 2-4 h | Aloitetaan palautteiden kevyt ryhmittely |
| v26 | 22.6.-28.6. | Testauksen loppuvaihe | 1-2 h | 2-4 h | Tarkistetaan, että palautteet eivät jää hajalleen |
| v27 | 29.6.-5.7. | Testauksen sulku ja kevyt koonti | 1-3 h | 2-5 h | Kesäkuun testaus päättyy, kirjataan avoimet havainnot |
| v28 | 6.7.-12.7. | Loma, vain kriittinen ylläpito | 0-1 h | 0-2 h | Ei suunniteltuja muutoksia |
| v29 | 13.7.-19.7. | Loma, vain kriittinen ylläpito | 0-1 h | 0-2 h | Ei suunniteltuja muutoksia |
| v30 | 20.7.-26.7. | Loma, vain kriittinen ylläpito | 0-1 h | 0-2 h | Ei suunniteltuja muutoksia |
| v31 | 27.7.-2.8. | Palautteiden valmistelu elokuuta varten | 1-3 h | 2-5 h | Kevyt koonti, jos palautteita on kertynyt paljon |
| v32 | 3.8.-9.8. | Testitulosten analyysi ja julkaisun rajaus | 10-16 h | 8-16 h | Tärkeä päätösviikko: P1/P2-lista, mitä ei tehdä, nimivaihtoehdot |
| v33 | 10.8.-16.8. | Nimi, osoite, tuotantomallin suunta ja korjausten aloitus | 8-14 h | 12-24 h | Julkaisun rajaus pitää lukita viimeistään tällä viikolla |
| v34 | 17.8.-23.8. | Palautekorjaukset, visuaalinen suunta, saavutettavuustutkimus | 10-16 h | 20-40 h | Kuormittava viikko, koska päätökset ja toteutus menevät päällekkäin |
| v35 | 24.8.-30.8. | Saavutettavuuskorjaukset, selosteet ja visuaalinen lukitus | 10-16 h | 20-40 h | 31.8. mennessä ilmeen, selosteiden ja P1-saavutettavuuden pitää olla kunnossa |
| v36 | 31.8.-6.9. | Tuotantopolun päätös ja stagingin aloitus | 8-14 h | 16-32 h | Päätetään Cloudcity/Firebase/muu malli ja aloitetaan ympäristötyö |
| v37 | 7.9.-13.9. | Palvelinsiirto, ylläpito, nimipäivät ja automaatiot | 8-14 h | 24-48 h | Suurin tekninen toteutusviikko |
| v38 | 14.9.-20.9. | Stagingin viimeistely ja sisällön/linkkien siivous | 7-12 h | 18-36 h | Tuotantopolun pitää olla toimiva ennen release candidatea |
| v39 | 21.9.-27.9. | Release candidate ja hyväksyntätestauksen aloitus | 8-14 h | 14-30 h | `0.95.0`, vain välttämättömät korjaukset tämän jälkeen |
| v40 | 28.9.-4.10. | Go/no-go, julkaisuviestintä ja lopulliset tarkistukset | 8-14 h | 8-20 h | Go/no-go suositus 1.10., varapäivä 2.10. |
| v41 | 5.10.-11.10. | Julkaisu 6.10. ja ensimmäinen seuranta | 6-12 h | 8-20 h | Julkaisupäivän tarkistukset ja ensimmäiset bugikorjaukset |
| v42 | 12.10.-18.10. | Julkaisun jälkiseuranta | 2-5 h | 3-10 h | Pienet `1.0.x`-korjaukset ja palautteiden ensimmäinen koonti |

### Viikkokuorman tulkinta

Kevyet viikot ovat kesäkuun testausviikot ja heinäkuun lomaviikot. Varsinainen työhuippu osuu viikoille 32-40 eli 3.8.-4.10.

Jos halutaan pitää ihmisen aktiivinen työ alle noin 8 tunnissa viikossa, pitää rajata erityisesti:

- Cloudcityn syvä migraatio julkaisun jälkeiseen vaiheeseen
- sähköposti-ilmoitukset jatkokehitykseen, ellei Cloudcity tarjoa niihin hyvin valmista ratkaisua
- visuaalinen kierros yhteen päätöskierrokseen
- testipalautteesta vain P1/P2-korjaukset julkaisuun

Jos nämä rajaukset tehdään, kuormitus on realistinen myös heinäkuun loman jälkeen. Ilman rajauksia viikot 34-38 voivat nousta liian raskaiksi.

## Päätettävät asiat

### Nimi

Päätös 1.6.2026: käyttäjälle näkyvä nimi on aloitussivu.

Päätöskriteerit:

- käyttäjä ymmärtää nimen heti
- nimi sopii SeniorSurf-kokonaisuuteen
- nimi ei kuulosta liian tekniseltä
- nimi toimii suomeksi, ruotsiksi ja englanniksi riittävän hyvin
- domain tai polku on selkeä

### Julkaisuosoite

Päätettävä viimeistään 16.8.2026.

Päävaihtoehdot:

- `seniorsurf.fi/aloitussivu`
- oma domain
- Cloudcityn tarjoama osoite ohjattuna selkeään domainiin
- väliaikainen Firebase Hosting -osoite ennen Cloudcity-siirtoa

### Visuaalinen ilme

Lukittava viimeistään 31.8.2026.

Lukittavat asiat:

- päävärit
- tumma ja vaalea tila
- korttien koko ja tiheys
- painikkeiden tyyli
- otsikon ja yläpalkin rakenne
- tukijalogojen tai taustakuvien käyttö
- mobiilinäkymän rytmi

Julkaisun jälkeen visuaalisia isoja muutoksia tehdään vain suunnitellussa jatkoversiossa.

### Tuotantoympäristö

Päätettävä viimeistään 15.9.2026.

Minimivaatimukset:

- salaisuudet ovat palvelinpuolella
- kirjautuminen toimii julkaistussa osoitteessa
- ylläpito pystyy käsittelemään linkkiehdotukset ja ilmoitukset
- suojausotsikot ovat käytössä valitun hosting-mallin rajoissa
- automaatiot eivät riipu kehittäjän koneesta
- varmuuskopiointi tai datan palautuspolku on tiedossa

## Julkaisuun pakolliset tehtävät

### Testaus ja palaute

- avoimen testauksen palautteet analysoitu
- palautteet luokiteltu tärkeyden mukaan
- julkaisuun otettavat korjaukset valittu
- julkaisuun kuulumattomat ideat kirjattu jatkokehitykseen

### Sisältö ja linkit

- linkkitarkistus ajettu ennen release candidatea
- 404- ja virheelliset linkit korjattu tai poistettu
- tärkeimmät paikalliset palvelut tarkistettu
- nimipäivätoiminnon tuotantomalli päätetty
- huijausvaroitusten automaation lähde ja ajastus päätetty

### Saavutettavuus

- näppäimistötestaus tehty
- ruudunlukijatestaus tehty vähintään keskeisille poluille
- mobiilitestaus tehty
- kontrastit tarkistettu
- saavutettavuusseloste viimeistelty
- palautekanava lisätty

### Tietosuoja

- rekisterinpitäjä ja yhteystiedot päätetty
- tietosuojaseloste viimeistelty
- käyttötilastojen kuvaus tarkistettu
- evästeiden ja paikallistallennuksen kuvaus tarkistettu
- tekoälyavustajan ja linkkiehdotusten tietovirrat kuvattu

### Tekniikka

- tuotantoympäristö päätetty
- staging testattu
- build toimii
- linkkitarkistus toimii
- salaisuudet eivät ole frontend-bundlessa
- Firebase/Cloudcity/App Check -asetukset testattu lopullisessa osoitteessa
- ylläpidon admin-oikeudet testattu
- ei-adminin pääsy estetty

### Ylläpito

- ylläpitovastuu nimetty
- sähköposti- tai muu ilmoitusmalli päätetty
- linkkiehdotusten käsittelyprosessi sovittu
- huijausvaroitusten seuranta sovittu
- käyttötilastojen katselurytmi sovittu
- julkaisun jälkeinen ensimmäisen kuukauden seuranta sovittu

## Riskit ja varasuunnitelmat

| Riski | Vaikutus | Varasuunnitelma |
| --- | --- | --- |
| Cloudcity-siirto viivästyy | Julkaisuympäristö ei ehdi valmiiksi | Julkaistaan välivaiheessa nykyisellä Firebase-mallilla turvallisemmassa hostingissa |
| Testipalaute tuottaa paljon korjauksia | Julkaisu viivästyy tai paisuu | Korjataan vain P1/P2-asiat ennen 6.10., muut jatkokehitykseen |
| Nimen käyttötapa jää epäyhtenäiseksi | Viestintä ja domain voivat näyttää keskeneräisiltä | Käytetään johdonmukaisesti nimeä aloitussivu ja pidetään SeniorSurf taustapalvelun/verkoston nimenä |
| Saavutettavuustutkimus löytää isoja puutteita | Julkaisu voi viivästyä | Julkaisu siirtyy tai julkaistaan rajatumpana pilottina selosteessa kuvatulla tavalla |
| Nimipäivärajapinnan raja tulee vastaan | Nimipäivät eivät toimi tuotannossa | Piilotetaan nimipäivät tai siirrytään tiedostopohjaiseen dataan |
| Huijausvaroitusten automaatio ei päivity | Varoitukset vanhenevat | Näytetään viimeisin päivitysaika ja tehdään ylläpitäjälle ilmoitus |

## Julkaisun jälkeinen jatkokehitys

Ensimmäisen julkaisun jälkeen jatkokehitykseen voidaan jättää:

- lisäominaisuudet toiseen kelloon ja toiseen sääkorttiin
- laajemmat personointiasetukset
- automaattiset ylläpitosähköpostit, jos niitä ei ehditä julkaisuun
- nimipäivien vuosittainen päivitysprosessi
- laajempi analytiikan raportointi
- Cloudcityn syvempi tietokantaintegraatio, jos julkaisu tehdään välivaiheen mallilla
- uudet tukija- ja kumppanuusnäkymät
- Chrome-selaimen sisäänrakennetun AI-rajapinnan selvitys noin kolme kuukautta julkaisun jälkeen; mahdollinen käyttötapa olisi paikallinen lisäavustaja tai tekstin selkeytys nykyisen Cloud Function + Gemini -mallin rinnalla, ei sen pakollisena korvaajana

## Go/no-go-kriteerit 1.10.2026

Julkaisu 6.10.2026 hyväksytään, jos:

- etusivu toimii tuotanto-osoitteessa mobiilissa ja työpöydällä
- keskeiset linkit ja palvelut löytyvät
- ylläpito toimii sovitulla admin-tunnuksella
- tietosuoja- ja saavutettavuusselosteet ovat julkaistuina
- julkaisunimi ja osoite on hyväksytty
- kriittisiä saavutettavuus-, tietosuoja- tai tietoturvaesteitä ei ole avoinna
- testipalautteen P1-korjaukset on tehty tai niille on hyväksytty varasuunnitelma
- ylläpidon vastuut ja ensimmäisen viikon seuranta on sovittu

Jos jokin näistä ei täyty, päätetään joko rajatusta pilottijulkaisusta tai julkaisun siirrosta.
