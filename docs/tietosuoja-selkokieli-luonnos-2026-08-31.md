# Tietosuojaseloste selkokielellä — LUONNOS

**Tunniste:** TS-01
**Päivä:** 31.8.2026
**Tila 2.9.2026:** teksti on **tuotannossa**. Viety koodiin 31.8. (commit `1472c10`),
julkaistu v1.0.0:n mukana 1.9. **Nina ei ole vielä hyväksynyt tekstiä** — tämä tiedosto on
edelleen se dokumentti, jonka perusteella hyväksyntä annetaan.

**Huomio 2.9.:** tehtävä E-02 poistaa tilastoinnista kentät `hour`, `url` ja `src`.
Selosteen osio "Miten sivun käyttöä lasketaan" luettelee ne yhä. Kun E-02 toteutetaan,
samat rivit on poistettava selosteesta kaikilta kolmelta kieleltä. Ks. työjonon TS-07.
**Koskee:** `tietosuoja.tsx`, vain suomenkielinen osio (`privacyTranslations.fi`)
**Ruotsi ja englanti:** ennallaan. Käännetään vasta kun suomi on hyväksytty.

## Miksi

Nykyinen seloste on lakiteknisesti kattava, mutta se käyttää sanoja, joita
kohderyhmä ei tunne: rekisterinpitäjä, eväste, selaimen sormenjälki,
IP-osoite, API, MariaDB, Firebase, koordinaatit, siirtymätyyppi,
käsittelyn rajoittaminen, palvelinsalaisuus, pyyntörajoitus.

## Mitä muuttuu

- Puhuttelu vaihtuu: "käyttäjä" → **sinä**. Selkokielessä suora puhuttelu on selvästi ymmärrettävämpi.
- Lauseet lyhennetään. Tavoite enintään 15 sanaa.
- Jokainen vaikea sana selitetään siinä kohdassa, jossa se esiintyy.
- Otsikot kirjoitetaan kysymyksinä tai arkikielellä. Osioiden `id`-tunnisteet pysyvät ennallaan, joten vanhat linkit toimivat.
- Tuotenimet MariaDB, PHP-API ja Cloudcity-API tiivistetään: "palvelin" ja "Cloudcityn konesali".
- **Uusi osio lopussa:** "Sanoja, jotka voivat olla vieraita".

## Mitä EI muutu

Kaikki lakisisältö säilyy: rekisterinpitäjän viralliset tiedot, yhteyshenkilö,
käsiteltävät tietoryhmät, kolmannen osapuolen palvelut nimeltä, säilytysajat
(12 kk / 90 vrk / 6 kk / 24 kk), rekisteröidyn oikeudet ja
Tietosuojavaltuutetun toimisto.

## Tarkistettavaa ennen hyväksyntää

1. **Nina:** kelpaako "Laissa tällaista vastuullista tahoa sanotaan rekisterinpitäjäksi" -muotoilu, vai pitääkö otsikon olla juridinen sana?
2. **Nina:** riittääkö "Cloudcityn konesali" ja "palvelin", vai pitääkö MariaDB ja PHP-API mainita nimeltä?
3. **Eero:** otetaanko sanastoso-osio mukaan? Se pidentää sivua noin puolella ruudulla.
4. Puhelinnumero, sähköpostit ja Y-tunnus on kopioitu nykyisestä selosteesta. Tarkista, että ne ovat yhä oikein.

---

# UUSI TEKSTI

## Yläosa

**Kicker:** Sinulle

**Otsikko:** Tietosuoja

**Ingressi:**
Seniorin aloitussivua voit käyttää ilman tunnusta ja salasanaa.
Sivu ei seuraa sinua. Sivu ei tee sinusta profiilia.
Omat valintasi tallentuvat pääosin vain omaan selaimeesi.

## Lyhyesti

- Et tarvitse tunnusta etkä salasanaa.
- Valintasi ja suosikkisi säilyvät omassa selaimessasi.
- Emme seuraa sinua emmekä kerää sinusta profiilia.
- Laskemme vain, montako kertaa sivua ja linkkejä käytetään.
- Emme myy tietoja. Emme anna niitä mainostajille.
- Sää ja paikallisuutiset haetaan muista palveluista. Ne näkevät, mistä päin nettiä pyyntö tulee.

## Sisällysluettelo

Otsikot ovat samat kuin alla olevissa osioissa.

---

## 1. Mitä tällä sivulla kerrotaan
`id: mita-sivu-kertoo`

Tämä sivu kertoo, mitä tietoja Seniorin aloitussivu käsittelee.
Se kertoo myös, mihin tietoja käytetään ja kuinka kauan ne säilyvät.

Kirjoitimme tekstin tavallisella kielellä.
Vaikeat sanat selitetään heti siinä kohdassa, jossa ne esiintyvät.
Sivun lopussa on lisäksi lyhyt sanasto.

Jos jokin jää epäselväksi, voit kysyä meiltä.
Yhteystiedot ovat sivun lopussa.

## 2. Kuka vastaa tiedoistasi
`id: rekisterinpitaja`

Sivustosta vastaa Vanhustyön keskusliitto ry.

Viralliset tiedot:
Vanhustyön keskusliitto – Centralförbundet för de gamlas väl ry
Y-tunnus 0215403–8
Malmin kauppatie 26, 00700 Helsinki

Laissa tällaista vastuullista tahoa sanotaan rekisterinpitäjäksi.
Se tarkoittaa kahta asiaa.
Me päätämme, mitä tietoja kerätään ja miksi.
Me myös vastaamme siitä, että tiedot ovat turvassa.

Tietosuoja-asioista vastaa Nina Ziessler.
Voit lähettää hänelle sähköpostia: nina.ziessler@vtkl.fi
Voit myös soittaa numeroon 050 468 0171.

## 3. Mitä tietoja sivu käsittelee
`id: mita-kasitellaan`

Sivu voi käsitellä näitä tietoja:

- paikkakunta, jonka olet valinnut
- linkit, jotka olet merkinnyt suosikeiksi
- tekstin koko, värit ja se, mitkä osiot näkyvät
- lukumäärät: montako kertaa sivu on avattu ja montako linkkiä napsautettu
- palaute tai ilmoitus linkistä, jonka olet itse lähettänyt
- kuva näytöstä, jos liitit sellaisen palautteeseen
- tieto siitä, millaisella laitteella ja selaimella palaute lähetettiin
- vanhat testivastaukset, kunnes ne poistetaan
- ylläpitäjän kirjautumistieto ja tieto siitä, mitä ylläpitäjä on muuttanut

Sivu ei kysy nimeäsi eikä osoitettasi.
Nimesi tulee tietoomme vain, jos kirjoitat sen itse palautteeseen.

## 4. Mitä sivu ei kerää
`id: mita-ei-kerata`

Sivu ei tee mitään näistä:

- ei seuraa sinua evästeiden avulla
- ei seuraa sinua mainoksia varten
- ei anna sinulle salaista tunnistenumeroa
- ei tunnista selaintasi niin sanotun sormenjäljen avulla
- ei tallenna IP-osoitettasi käyttölukuihin
- ei tallenna, missä olet liikkunut

Eväste on pieni tiedosto. Sivusto voi tallentaa sen selaimeesi.
Moni sivusto seuraa evästeillä, missä käyt netissä.
Tämä sivu ei tee niin.

Sivun käyttö ei vaadi kirjautumista.

## 5. Mitä selaimeesi tallennetaan
`id: selaimen-asetukset`

Selain on ohjelma, jolla katselet nettisivuja.
Tavallisia selaimia ovat Chrome, Edge, Safari ja Firefox.

Osa valinnoistasi tallentuu vain omaan selaimeesi.
Näin sivu muistaa ne, kun tulet uudelleen.

Selaimeen tallentuvat:

- suosikkisi
- valitsemasi paikkakunta
- tekstin koko
- tumma tai vaalea väri
- ne osiot, jotka haluat näkyviin
- tieto siitä, oletko jo katsonut sivun esittelyn
- toisen kellon maa tai kaupunki, jos olet ottanut toisen kellon käyttöön

Nämä tiedot eivät lähde mihinkään.
Ne pysyvät omassa laitteessasi.
Meille ei synny niistä profiilia.

Voit poistaa tiedot itse.
Tyhjennä selaimen sivustotiedot, niin ne häviävät.

## 6. Mitä muita palveluja sivu käyttää
`id: kolmannen-osapuolen-palvelut`

Sää ja paikallisuutiset haetaan muista palveluista.
Ne ovat muiden yritysten ja yhteisöjen ylläpitämiä.

- **Open-Meteo** antaa säätiedot. Se saa tietää paikkakuntasi sijainnin kartalla.
- **OpenStreetMapin Nominatim** kertoo, mikä kunta sijainnin kohdalla on. Sitä käytetään vain, jos annat luvan paikannukseen.
- **Nominatimia ei käytetä lainkaan**, jos olet valinnut kotikuntasi itse.
- **rss2json ja allorigins** voivat välittää paikallisuutiset. Niitä käytetään vain, jos uutiset eivät tule perille suoraan.

Kun selaimesi ottaa yhteyttä näihin palveluihin, ne näkevät IP-osoitteesi.

IP-osoite on numerosarja.
Sen avulla tieto löytää oikeaan laitteeseen.
Se kertoo suunnilleen, miltä seudulta ollaan liikkeellä.
Se ei kerro nimeäsi.

Seniorin aloitussivu ei tallenna näitä sijainteja omiin tietoihinsa.
Se ei tallenna myöskään IP-osoitetta.

## 7. Miten sivun käyttöä lasketaan
`id: kayttotilasto`

Laskemme, miten sivua käytetään.
Näin tiedämme, mikä toimii ja mitä pitää parantaa.

Laskemme päivittäin:

- montako kertaa sivu on avattu ja montako linkkiä napsautettu
- millä sivuston osiolla ja missä linkkikategoriassa klikkaus tapahtui
- mistä sivulle tultiin: suoraan, sivuston sisältä, SeniorSurfista, hakukoneesta vai muualta netistä
- tultiinko uutena käyntinä vai takaisin-painikkeella
- onko selain tavallisessa vai asennetun sovelluksen tilassa
- avasitko aloitussivuohjeen ja miten käytit sitä

Emme tallenna yksittäisen linkin osoitetta tai kellonaikaa.
Tallennamme vain osion ja kategorian sekä tulon lähteen luokan, esimerkiksi "hakukone".

Nämä luvut eivät kerro, kuka sinä olet.
Ne kertovat vain lukumääriä.
Ylläpitäjä näkee esimerkiksi, että tietyn osion linkkikategoriaa napsautettiin 40 kertaa.
Hän ei näe, kuka niitä napsautti.

Luvut lähetetään saman sivuston omalle palvelimelle.
Ne tallennetaan päivittäisinä yhteenvetoina.

Laskenta ei käytä evästeitä.
Se ei tallenna eikä lue mitään laitteeltasi.
Siksi sivun ei tarvitse kysyä sinulta lupaa evästeisiin.

Palvelin näkee pyynnön mukana tulevan IP-osoitteen.
Se muuttaa osoitteen heti merkkijonoksi, josta ei voi palata takaisin osoitteeseen.
Merkkijonolla estetään ylimääräiset pyynnöt lyhyen ajan sisällä.
Alkuperäistä IP-osoitetta ei tallenneta.

## 8. Palaute ja ilmoitus linkistä
`id: palautteet`

Voit lähettää meille palautetta.
Voit myös ilmoittaa linkistä, joka on rikki tai vie väärään paikkaan.
Voit ehdottaa uutta linkkiä.

Kun lähetät palautteen, tallennamme:

- palautteen tyypin, otsikon ja kuvauksen
- sivun, jota palaute koskee
- linkin nimen ja osoitteen
- linkin aiheryhmän tai lähteen, jos se on mukana
- oman lisähuomiosi
- ajankohdan, jolloin lähetit ilmoituksen
- tiedon siitä, onko ilmoitus jo käsitelty
- kuvan näytöstä, jos liitit sellaisen

Käytämme tietoja vain sivun ylläpitoon, korjaamiseen, testaamiseen ja kehittämiseen.

Älä kirjoita lomakkeeseen henkilötietoja.
Älä kirjoita terveystietoja äläkä salasanoja.
Katso myös, ettei kuvassa näy tällaisia tietoja.

Kuvat säilytetään suojatussa paikassa.
Ne eivät näy ulkopuolisille.

Sivulla oli aiemmin testikysely.
Se on nyt poistettu käytöstä.
Vanhat vastaukset poistetaan kohdassa 12 kerrotussa ajassa.

## 9. Paikkakunta ja sää
`id: paikalliset-palvelut`

Voit valita paikkakuntasi itse.
Voit myös antaa selaimen etsiä sen.
Selain kysyy siihen aina luvan.

Voit vaihtaa paikkakuntaa milloin tahansa.

Tarkkaa sijaintiasi ei tallenneta meidän palvelimellemme.

Sääkortti hakee sään toisesta palvelusta.
Haku tehdään paikkakunnan sijainnin perusteella.
Sinusta ei tehdä profiilia.

## 10. Missä tiedot säilytetään
`id: palveluntarjoajat`

Palvelin on tietokone, joka säilyttää sivuston tiedot.
Se myös lähettää sivun sinun selaimeesi.

Seniorin aloitussivun palvelin on Cloudcityn konesalissa.
Siellä ovat myös palautteet, palautteiden kuvat ja käyttöluvut.

Ylläpitäjien kirjautuminen tarkistetaan Googlen Firebase-palvelussa.
Sitä käytetään vain kirjautumiseen.
Sinun tietosi eivät mene sinne.
Palautteet, käyttöluvut ja sivun sisältö ovat Cloudcityn palvelimella.

Google on yhdysvaltalainen yritys.
Siksi ylläpitäjän kirjautumistietoa voidaan käsitellä myös EU:n ulkopuolella.
Tämä ei koske sinua eikä muita sivun käyttäjiä.

Sää- ja paikkatietoa haetaan muista palveluista vain silloin, kun käytät sitä toimintoa.

Kun avaat ulkoisen linkin tai teet Google-haun, siirryt pois tältä sivulta.
Silloin sinua koskevat sen palvelun omat säännöt.

## 11. Ylläpitäjän kirjautuminen
`id: yllapitajan-kirjautuminen`

Sivulla on ylläpitonäkymä.
Sinne pääsevät vain ennalta nimetyt ylläpitäjät.

Ylläpitäjä kirjautuu Google-tunnuksella.
Palvelin tarkistaa tunnisteen.
Se hyväksyy vain voimassa olevan ylläpito-oikeuden.

Tavallinen käyttäjä ei tarvitse kirjautumista.
Sinun ei tarvitse tehdä tunnusta.

## 12. Kuinka kauan tiedot säilyvät
`id: sailytys-ja-poistaminen`

Selaimeen tallennetut valinnat säilyvät omalla laitteellasi.
Ne säilyvät, kunnes poistat sivuston tiedot tai vaihdat selainta.

Palautteet ja linkkejä koskevat ilmoitukset poistetaan viimeistään 12 kuukauden kuluttua.

Palautteeseen liitetyt kuvat poistetaan heti, kun niitä ei enää tarvita.
Viimeistään ne poistetaan 90 päivän kuluttua.

Vanhat testivastaukset poistetaan viimeistään kuuden kuukauden kuluttua siitä,
kun testattu versio on julkaistu.
Jos versiota ei julkaista, aika lasketaan testauksen päättymisestä.

Päivittäiset käyttöluvut poistetaan viimeistään 24 kuukauden kuluttua.
Niissä ei ole tunnistetietoja.

Poistamme tiedot aiemmin, jos niitä ei enää tarvita.

Ylläpitäjien tunniste- ja käyttöoikeustiedot säilytetään vain niin kauan
kuin ylläpitotyö vaatii.

## 13. Sinun oikeutesi
`id: oikeudet`

Sinulla on lain mukaan oikeuksia omiin tietoihisi.

Näitä oikeuksia voit käyttää, jos lähettämässäsi palautteessa tai kuvassa
on sinua koskevia tietoja.

Voit pyytää, että:

- kerromme, mitä tietoja sinusta on
- korjaamme väärän tiedon
- poistamme tiedon
- emme käytä tietoa toistaiseksi

Kerro pyynnössä sen verran, että löydämme oikean palautteen.
Älä kirjoita pyyntöön ylimääräisiä henkilötietoja.

Vastaamme pyyntöösi.
Jos et ole vastaukseen tyytyväinen, voit ottaa yhteyttä viranomaiseen.
Viranomainen on Tietosuojavaltuutetun toimisto.
Voit tehdä sinne valituksen, jos epäilet, että tietojasi on käsitelty väärin.

## 14. Kysy meiltä
`id: yhteydenotto`

Vastaamme mielellämme kysymyksiin.

Tietosuoja-asiat: Nina Ziessler, nina.ziessler@vtkl.fi, puhelin 050 468 0171.

Muut SeniorSurf-asiat: seniorsurf@vtkl.fi

Päivitetty 31.8.2026.
Päivitämme tämän sivun, kun tiedot, säilytysajat tai yhteystiedot muuttuvat.

## 15. Sanoja, jotka voivat olla vieraita
`id: sanasto` (uusi osio)

**Selain**
Ohjelma, jolla katselet nettisivuja. Esimerkiksi Chrome, Edge, Safari tai Firefox.

**Eväste**
Pieni tiedosto, jonka sivusto voi tallentaa selaimeesi. Tämä sivu ei käytä evästeitä seurantaan.

**IP-osoite**
Numerosarja, jonka avulla tieto löytää oikeaan laitteeseen. Se ei kerro nimeäsi.

**Palvelin**
Tietokone, joka säilyttää sivuston tiedot ja lähettää sivun selaimeesi.

**Rekisterinpitäjä**
Se taho, joka vastaa tiedoistasi. Tässä se on Vanhustyön keskusliitto ry.

**Profiili**
Kerätty kuva siitä, kuka olet ja mitä teet netissä. Tästä sivusta ei synny sinulle profiilia.

**Paikannus**
Selaimen toiminto, joka kertoo sijaintisi. Selain kysyy siihen aina luvan.

---

# Kattavuustarkistus

| Nykyisen selosteen kohta | Onko mukana | Missä |
| --- | --- | --- |
| Rekisterinpitäjän nimi, Y-tunnus, osoite | Kyllä, sanatarkasti | 2 |
| Yhteyshenkilö, sähköposti, puhelin | Kyllä | 2 ja 14 |
| Käsiteltävät tietoryhmät (7 kohtaa) | Kyllä, 9 kohtaa selkeämmin jaettuna | 3 |
| Mitä ei kerätä (6 kohtaa) | Kyllä | 4 |
| Selaimeen tallennettavat (7 kohtaa) | Kyllä | 5 |
| Open-Meteo, Nominatim, rss2json, allorigins | Kyllä, kaikki nimeltä | 6 |
| Käyttötilaston sisältö (6 kohtaa) | Kyllä, 8 kohtaa arkikielellä | 7 |
| Viittaavasta sivusta vain luokka | Kyllä | 7 |
| Ei evästesuostumusta, IP suojattuna tunnisteena | Kyllä | 7 |
| Palautteiden tietosisältö (9 kohtaa) | Kyllä | 8 |
| Kielto kirjoittaa arkaluonteista | Kyllä | 8 |
| Kuvat julkisen hakemiston ulkopuolella | Kyllä, "suojatussa paikassa" | 8 |
| Cloudcity, PHP-API, MariaDB, Firebase | Osittain: Cloudcity ja Firebase nimeltä, PHP-API ja MariaDB yleistettynä "palvelimeksi" | 10 |
| Ylläpitäjän kirjautuminen | Kyllä | 11 |
| Säilytysajat 12 kk / 90 vrk / 6 kk / 24 kk | Kyllä, kaikki neljä | 12 |
| Tarkastus, oikaisu, poisto, rajoitus | Kyllä | 13 |
| Tietosuojavaltuutetun toimisto | Kyllä | 13 |
| Päivityspäivä | Kyllä | 14 |

**Ainoa tietoinen tarkkuuden vähennys:** MariaDB ja PHP-API eivät esiinny nimeltä.
Jos Nina haluaa ne takaisin, lisätään kohtaan 10 lause:
"Tekniset nimet: palvelinohjelma on PHP-API ja tietokanta MariaDB."

---

# Palautekierros senioripersoonilla

Luonnos ajettiin `ikaantyneet-palautteenantajat`-skillin läpi 31.8.2026.
Keskiarvo **3,5 / 5**. Kymmenen persoonaa, arvosanat 2–5.

**Toimi hyvin:** sinuttelu, lyhyet virkkeet, osio 4 ("Mitä sivu ei kerää").
Sitä kiittivät myös epäluuloiset persoonat (Urho, Pentti).

## Korjattu jo tähän luonnokseen

| Havainto | Kuka | Korjaus |
| --- | --- | --- |
| "salatuksi merkkijonoksi" on väärin — tiiviste ei ole salaus | Tapio (IT-asiantuntija) | "merkkijonoksi, josta ei voi palata takaisin osoitteeseen" |
| "Kysy rohkeasti. Kysyminen ei ole tyhmää." tuntuu holhoavalta | Mirja, Liisa | "Vastaamme mielellämme kysymyksiin." |
| "linkki-ilmoitus" ei ole suomea | Mirja (äidinkielen opettaja) | "ilmoitus linkistä" |
| "aikavyöhyke" ja "esittelykierros" jäivät selittämättä | Mohamed (tulkki) | "toisen kellon maa tai kaupunki", "sivun esittely" |
| "evästesuostumus" | Mohamed | "sivun ei tarvitse kysyä sinulta lupaa evästeisiin" |
| Jää epäselväksi, näkeekö ylläpitäjä minun napsautukseni | Pentti | Osioon 7 lisätty: ylläpitäjä näkee lukumäärän, ei napsauttajaa |

## Avoinna — vaatii päätöksen

**1. Pituus.** Reino (83) ja Aino (91) antoivat 2 tähteä. Molemmat sanoivat saman:
15 osiota on liikaa, ja "Lyhyesti"-laatikko riitti heille.
He ovat juuri se joukko, jota seloste eniten koskee.

*Ehdotus, ei toteutettu:* nostetaan "Lyhyesti" ingressin yläpuolelle ja
suurennetaan se. Sisällysluettelo taitetaan kiinni, ja sen saa auki napsauttamalla.
Tämä on ulkoasumuutos, ei tekstimuutos — päätä erikseen.

**2. Siirtyvätkö tiedot EU:n ulkopuolelle?** (Tapio ja Urho, kumpikin erikseen)

**Ratkaistu osittain 31.8.** Eero vahvisti: Firebasea käytetään tällä hetkellä vain
ylläpitäjän kirjautumiseen. Tarkistin väitteen koodista — ks. "Koodista tarkistettu"
tämän tiedoston lopussa. Vahvistus on kirjoitettu osioon 10.

**Yhä Ninan päätettävänä:** riittääkö osion 10 lause "Google on yhdysvaltalainen yritys,
siksi ylläpitäjän kirjautumistietoa voidaan käsitellä myös EU:n ulkopuolella"?
GDPR:n 13 artikla edellyttää mainintaa siirron perusteesta (esimerkiksi
vakiosopimuslausekkeet), jos siirtoa tapahtuu. Kyse on kahden nimetyn VTKL:n
työntekijän sähköpostiosoitteesta, ei käyttäjien tiedoista, joten riski on pieni.
Maininta kannattaa silti joko tehdä oikein tai jättää kokonaan pois.

**3. Kuka pääsee palautteisiini?** (Urho)
Seloste kertoo, että ylläpitonäkymä on rajattu nimetyille ylläpitäjille.
Se ei kerro, näkevätkö kaikki ylläpitäjät kaikki palautteet.
Jos vastaus on yksinkertainen, se kannattaa sanoa osiossa 8.

Kohdat 2 ja 3 koskevat myös nykyistä, tuotannossa olevaa selostetta.
Ne eivät ole tämän selkokielistyksen aiheuttamia.


---

# Koodista tarkistettu 31.8.2026

Eero vahvisti, että Firebasea käytetään vain ylläpitäjän kirjautumiseen.
Tarkistin väitteen koodista, koska seloste ei saa luvata enempää kuin mitä koodi tekee.

| Väite | Pitää paikkansa | Todiste |
| --- | --- | --- |
| Firebase = vain kirjautuminen | **Kyllä** | `firebaseClient.ts` vie ulos `getFirebaseAuth`, `signInWithGoogle`, `subscribeToAuth`. Julkiset polut (`scamAlerts.ts`, `cloudcityApiDataProvider.ts`) kutsuvat vain `getFirebaseAuth()`. |
| Palautteet ja käyttöluvut eivät ole Firestoressa | **Kyllä, tuotannossa** | `scripts/build-production-path-package.ps1` rivi 87 pakottaa `VITE_DATA_PROVIDER=cloudcity`, `.env.staging` sama. Firestore-toteutus jää pois nipusta. |
| Tavallinen käyttäjä ei laukaise reCAPTCHAa | **Kyllä** | App Check (`ReCaptchaV3Provider`) alustetaan vain funktioissa `getFirebaseDb` ja `getFirebaseAppCheckToken`. Kumpaakaan ei kutsuta julkisilta sivuilta. |

## Kaksi sivulöydöstä, eivät kiireellisiä

**1. Gemini-koodi on repossa mutta kuollutta.**
`services/geminiService.ts` kutsuu Google Geminiä Cloud Functionin kautta.
Sitä käyttävät `components/Assistant.tsx` ja `components/NewsFeed.tsx`.
**Kumpaakaan komponenttia ei renderöidä mistään** — `App.tsx` ei viittaa niihin,
ja `NewsFeed` käyttää yhä `MOCK_NEWS`-testidataa.
Tietosuojaseloste on siis oikeassa, kun se ei mainitse Geminiä.
Jos komponentit joskus otetaan käyttöön, seloste on päivitettävä samalla:
silloin käyttäjän kirjoittama teksti menisi Googlelle ja App Check lataisi reCAPTCHAn.
*Ehdotus: poista kuollut koodi, niin virhe on mahdoton.*

**2. `firebase-rollback` on yhä oletus, jos ympäristömuuttuja unohtuu.**
`services/data/providerConfig.ts`: jos `VITE_DATA_PROVIDER` on tyhjä mutta
Firebase-avaimet ovat olemassa, valinnaksi tulee `firebase-rollback` eli Firestore.
Tuotantoskripti asettaa arvon oikein, joten vaara on teoreettinen.
Käsin ajettu `npm run build` ilman `.env.cloudcity`-tiedostoa tekisi kuitenkin
nipun, joka kirjoittaa Firestoreen — ja seloste olisi silloin väärässä.
*Ehdotus: vaihda oletukseksi `cloudcity`.*
