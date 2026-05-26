# Elokuun julkaisusuunnitelma: SeniorSurfin aloitussivu

Tämä suunnitelma kokoaa julkisen testauksen jälkeiset työt, Cloudcity-siirron valmistelun ja lopullisen julkaisun vaiheet. Lähtökohtana on, että julkinen testaus alkaa 1.6. ja kestää noin kuukauden, heinäkuu on lomakuukausi, ja elokuun alussa aloitetaan testitulosten läpikäynti sekä julkaisun viimeistely.

## 1. Tavoite

Tavoitteena on viedä SeniorSurfin aloitussivu julkiseen, vakaaseen tuotantokäyttöön elo-syyskuussa. Lopullinen osoite on joko oma selkeä domain tai SeniorSurfin alla oleva polku:

- `seniorsurf.fi/aloitussivu`
- vaihtoehtoisesti erillinen oma domain, jos sivustolle päätetään antaa itsenäinen nimi

Tässä suunnitelmassa oletetaan ensisijaisesti vaihtoehto `seniorsurf.fi/aloitussivu`, koska se on käyttäjälle ymmärrettävä, luotettava ja sopii SeniorSurf-kokonaisuuteen.

## 2. Aikajana

### Toukokuu ennen julkista testausta

Tavoite on pitää näkyvät toiminnallisuudet mahdollisimman vakaina ennen 1.6. alkavaa testausta.

Suositeltavat työt:

- korjataan selkeät käyttöliittymäongelmat
- viimeistellään mobiilikäytettävyys
- tarkistetaan saavutettavuuden perusasiat
- varmistetaan, että huijausvaroitukset, paikalliset palvelut, uutiset ja linkki-ilmoitukset toimivat
- vältetään isoja arkkitehtuurimuutoksia aivan testauksen alla, elleivät ne ole hyvin rajattuja

Teknisen välikerroksen voi aloittaa jo toukokuussa, jos se tehdään siten, ettei käyttäjälle näkyvä toiminta muutu.

### 1.6.-30.6. julkinen testaus

Testauksen aikana tavoitteena on kerätä havaintoja eikä tehdä jatkuvasti isoja muutoksia tuotantoon.

Kerättävät asiat:

- löytyvätkö käyttäjät tarvitsemansa palvelut
- ovatko kategoriat ja alakategoriat ymmärrettäviä
- toimiiko alueellinen sisältö oikeilla paikkakunnilla
- ovatko paikalliset uutiset hyödyllisiä
- ymmärretäänkö huijausvaroitukset
- käytetäänkö tekoälyavustajaa
- onko tekstikoko sopiva
- onko sivusto mobiilissa riittävän helppo
- tuleeko linkki-ilmoituksia tai ehdotuksia
- nouseeko esiin puuttuvia palveluita

Testauksen aikana tehtävät korjaukset:

- vain selkeät bugikorjaukset
- pienet tekstikorjaukset
- yksittäiset linkkikorjaukset
- kriittiset mobiili- tai saavutettavuuskorjaukset

Vältettävät asiat testauksen aikana:

- iso värimaailman tai rakenteen muutos
- tietokantasiirto
- domain-siirto
- ylläpitoprosessin suuri muutos

### Heinäkuu

Heinäkuu on lomakuukausi. Suositus on, ettei silloin tehdä kriittisiä julkaisumuutoksia, ellei kyseessä ole selkeä virhe.

Mahdollinen kevyt ylläpito:

- tarkistetaan, ettei sivusto ole rikki
- reagoidaan vain kriittisiin ongelmiin
- kerätään testipalautteet talteen elokuuta varten

### Elokuun alku

Elokuun alussa aloitetaan varsinainen analyysi ja viimeistely.

Ensimmäinen työpaketti:

- käydään testipalaute läpi
- ryhmitellään palaute: bugit, käytettävyys, sisältö, tekniset asiat, uudet ideat
- päätetään, mitkä korjataan ennen julkaisua ja mitkä jätetään myöhemmäksi
- tarkistetaan linkki-ilmoitukset ja käyttäjien ehdotukset
- arvioidaan, onko sivuston rakenne riittävän selkeä julkaisua varten

Toinen työpaketti:

- päätetään lopullinen julkaisumalli: oma domain vai `seniorsurf.fi/aloitussivu`
- varmistetaan Cloudcityn tekniset reunaehdot
- suunnitellaan tietokanta ja API
- päätetään, siirretäänkö Firebase kokonaan pois vai jääkö se väliaikaisesti käyttöön

### Elokuun puoliväli ja loppu

Varsinainen toteutus ja testaus.

Työt:

- teknisen välikerroksen viimeistely
- Cloudcity-backendin ja tietokannan toteutus, jos siirrytään omaan tietokantaan
- staging-ympäristön pystytys
- datan migraatio tai rinnakkaiskäyttö
- hyväksyntätestaus
- lopullinen julkaisupäätös

### Syyskuu

Syyskuussa voidaan tehdä lopullinen tuotantoon siirto, jos elokuun toteutus ja testaus on valmis.

Jos elokuussa tulee paljon testipalautteen vaatimaa hiomista, syyskuun alku on realistinen julkaisuhetki.

## 3. Nykyinen tekninen tilanne

Nykyinen sivusto toimii React/Vite-frontendinä. Osa käyttäjän valinnoista tallennetaan selaimen `localStorage`iin. Ylläpitotoiminnot, linkki-ilmoitukset, hyväksytyt linkit, piilotetut linkit ja huijausvaroitukset ovat kytkeytyneet Firebase/Firestore-pohjaiseen toteutukseen.

Nykyisiä datatoimintoja:

- käyttäjän suosikit selaimen paikallistallennuksessa
- tekstikoko, teema, näkyvät osiot ja onboarding-tila selaimen paikallistallennuksessa
- linkki-ilmoitukset ylläpitoon
- hyväksytyt linkkiehdotukset
- piilotettavat tai poistetut linkit
- huijausvaroitukset
- Kyberturvallisuuskeskuksen viikkokatsauksen haku ja ajoloki
- ylläpitäjän kirjautuminen

## 4. Cloudcity-siirron vaikutus arkkitehtuuriin

Jos sivusto siirtyy Cloudcity-palvelimelle ja käyttöön otetaan oma tietokanta, suurin muutos ei ole frontendissä vaan datakerroksessa.

Lopullinen tavoiterakenne:

```text
React-sivusto
  -> Cloudcityllä ajettava backend/API
    -> Cloudcityn tietokanta
```

Tärkeä reunaehto:

Tietokantaan voi ottaa yhteyttä vain Cloudcityn omilta palvelimilta. Tämä tarkoittaa, että selainpohjainen React-sovellus ei saa koskaan yhdistää tietokantaan suoraan. Tietokantatunnukset eivät saa päätyä frontend-koodiin.

Paikallinen kehitys oikeaa tietokantaa vasten:

```text
oma työpöytäkone
  -> SSH-tunneli
    -> Cloudcity-palvelin
      -> tietokanta
```

Vaihtoehtoisesti paikallisessa kehityksessä voidaan käyttää mock-dataa ja testata oikea tietokantayhteys Cloudcityn staging-ympäristössä.

## 5. Tekninen välikerros

Tekninen välikerros tarkoittaa, että komponentit eivät enää kutsu Firebasea tai muuta tallennustapaa suoraan. Sen sijaan kaikki datan haku ja tallennus kulkee yhden oman rajapinnan kautta.

Nykyinen malli on karkeasti:

```text
komponentti -> Firebase / Firestore / localStorage
```

Tavoitemalli:

```text
komponentti -> data provider -> Firebase nyt
                         -> Cloudcity API myöhemmin
                         -> mock-data tarvittaessa
```

Tämä tekee elokuun siirrosta hallittavamman, koska frontendin näkökulmasta datan lähde voidaan vaihtaa providerin sisällä.

## 6. Välikerroksen käytännön toteutus

Suositeltu kansiorakenne:

```text
services/data/
  types.ts
  dataProvider.ts
  firebaseDataProvider.ts
  apiDataProvider.ts
  mockDataProvider.ts
```

### `types.ts`

Sisältää yhteiset datatyypit ja rajapinnat:

- linkki-ilmoitus
- hyväksytty linkki
- piilotettu linkki
- huijausvaroitus
- automaation ajoloki
- ylläpitokäyttäjän perustiedot

### `dataProvider.ts`

Yksi paikka, josta sovellus saa käytössä olevan providerin.

Esimerkki:

```ts
export const dataProvider = firebaseDataProvider;
```

Elokuussa tämä voisi vaihtua:

```ts
export const dataProvider = apiDataProvider;
```

### `firebaseDataProvider.ts`

Käärii nykyisen Firebase-toteutuksen yhteisen rajapinnan alle.

Esimerkiksi:

```ts
submitLinkReport(report)
subscribeLinkReports(callback)
updateLinkReportStatus(id, status)
subscribeScamAlerts(callback)
updateScamAlertActiveState(id, active)
```

### `apiDataProvider.ts`

Tuleva Cloudcity API -toteutus.

Esimerkiksi:

```ts
fetch('/api/link-reports')
fetch('/api/scam-alerts')
fetch('/api/approved-links')
```

### `mockDataProvider.ts`

Hyödyllinen paikalliseen kehitykseen, jos Cloudcityn tietokantaan ei haluta yhdistää SSH-tunnelilla.

## 7. Mitä dataa Cloudcityn tietokantaan tarvitaan

Alustava taulujako:

### `link_reports`

Käyttäjien ilmoitukset.

Kenttiä:

- `id`
- `type`: new, broken, wrong
- `name`
- `url`
- `category`
- `source`
- `note`
- `status`: pending, approved, rejected
- `created_at`
- `reviewed_at`
- `reviewed_by`
- `approved_link_id`

### `approved_links`

Ylläpidon hyväksymät uudet linkit.

Kenttiä:

- `id`
- `name`
- `url`
- `category`
- `source`
- `note`
- `created_at`
- `created_from_report_id`

### `blocked_links`

Linkit, jotka käyttäjien ilmoitusten tai ylläpidon perusteella piilotetaan.

Kenttiä:

- `id`
- `url`
- `reason`
- `created_at`
- `created_by`

### `scam_alerts`

Huijausvaroitukset.

Kenttiä:

- `id`
- `title`
- `body`
- `severity`
- `active`
- `source`
- `source_url`
- `original_heading`
- `created_at`
- `expires_at`

### `ncsc_scrape_logs`

Kyberturvallisuuskeskuksen viikkokatsauksen automaation ajoloki.

Kenttiä:

- `id`
- `processed_at`
- `week_label`
- `source_url`
- `alerts_created`
- `structure_version`
- `message`

### `admin_users`

Ylläpitäjät, jos kirjautumista ei hoideta erillisellä tunnistusratkaisulla.

Kenttiä:

- `id`
- `email`
- `role`
- `created_at`
- `active`

## 8. API-reitit Cloudcityyn

Alustavat julkiset reitit:

```text
GET  /api/scam-alerts
POST /api/link-reports
GET  /api/approved-links
GET  /api/blocked-links
```

Alustavat ylläpitoreitit:

```text
GET    /api/admin/link-reports
PATCH  /api/admin/link-reports/:id
GET    /api/admin/approved-links
POST   /api/admin/approved-links
DELETE /api/admin/approved-links/:id
GET    /api/admin/scam-alerts
POST   /api/admin/scam-alerts
PATCH  /api/admin/scam-alerts/:id
GET    /api/admin/ncsc-logs
POST   /api/admin/ncsc-run
```

Huomio:

API:n pitää olla ainoa kerros, joka yhdistää tietokantaan. Frontend ei yhdistä tietokantaan.

## 9. Kirjautuminen ja ylläpito

Avoin päätös:

- säilytetäänkö Google-kirjautuminen
- käytetäänkö SeniorSurfin tai Cloudcityn omaa kirjautumista
- käytetäänkö yksinkertaista ylläpitokäyttäjälistaa palvelimella

Suositus:

Jos Google-kirjautuminen toimii luotettavasti ja on ylläpidolle helppo, sen voi säilyttää myös Cloudcity-API:n kanssa. Tällöin API tarkistaa käyttäjän tokenin tai ylläpitäjän sähköpostin.

Jos Cloudcity/WordPress-ympäristö tarjoaa luontevan kirjautumisen, se voi olla parempi pitkällä aikavälillä, mutta se pitää selvittää ennen toteutusta.

## 10. Huijausvaroitusten automaatio

Nykyinen toiminnallisuus hakee Kyberturvallisuuskeskuksen viikkokatsausta ja luo varoituksia.

Cloudcity-mallissa automaation pitäisi pyöriä palvelinpuolella:

- cron-ajona
- ajastettuna PHP/Node-skriptinä
- tai ylläpidon käsin käynnistettävänä API-toimintona

Tärkeää:

- automaation ajoloki tallennetaan tietokantaan
- jos sivurakenne muuttuu eikä varoituksia synny, ylläpito näkee sen
- lähde-URL tallennetaan
- alkuperäinen otsikko tallennetaan tarkistusta varten

## 11. Selaimen paikallistallennukseen jäävät asiat

Kaikkea ei tarvitse viedä tietokantaan.

Selaimen `localStorage`iin voi jatkossakin jäädä:

- suosikit
- tekstikoko
- tumma/vaalea tila
- näkyvien osioiden asetukset
- onboardingin läpikäynti
- käyttäjän valittu tai havaittu paikkakunta

Näitä ei kannata siirtää palvelimelle ellei synny selkeää tarvetta synkronoida asetuksia laitteiden välillä.

Huomio:

Onboardingin läpikäyntiä ei suositella sidottavaksi IP-osoitteeseen. IP-pohjainen tunnistus on epäluotettava ja yksityisyyden kannalta raskaampi. Selaimen paikallistallennus on tähän riittävä.

## 12. Domain- ja polkupäätös

Vaihtoehto A: `seniorsurf.fi/aloitussivu`

Hyödyt:

- käyttäjä tunnistaa SeniorSurf-brändin
- luottamus on parempi
- helppo kertoa ja ohjeistaa
- sopii nykyisiin ohjeteksteihin

Huomiot:

- reititys pitää tehdä oikein, jotta staattiset assetit latautuvat alihakemistosta
- Vite buildin `base`-asetus pitää tarkistaa
- linkit kuten `./muutosloki.html`, `./linkit.html` ja `./yllapito.html` pitää testata alihakemistossa

Vaihtoehto B: oma domain

Hyödyt:

- lyhyt ja selkeä nimi voi olla helppo muistaa
- itsenäinen palvelu

Huomiot:

- nimen valinta vaatii enemmän työtä
- luottamuksen rakentaminen vaatii enemmän viestintää
- SeniorSurf-yhteys pitää silti näkyä selvästi

Suositus:

Ensisijaisesti `seniorsurf.fi/aloitussivu`, ellei löydy erittäin selkeää omaa nimeä.

## 13. Julkaisua edeltävä tarkistuslista

### Käyttöliittymä

- desktop toimii
- mobiili toimii
- tekstikoon säätö toimii
- tumma tila toimii
- onboarding toimii ja sen voi käynnistää ohjeesta uudelleen
- tekoälychat ei peitä muuta käyttöliittymää liikaa
- huijausvaroitukset avautuvat oikein
- asetukset toimivat
- versionumerosta avautuu muutosloki

### Sisältö

- kategoriat ja alakategoriat ovat järkevät
- paikalliset palvelut näkyvät oikein
- museoiden ja teatterien alueellinen näkyvyys toimii
- linkkilista on ajan tasalla
- muutosloki on ajan tasalla
- ohje- ja tietotekstit vastaavat lopullista domainia

### Tekninen

- build menee läpi
- staging toimii
- tuotanto toimii
- API toimii
- tietokantayhteys toimii vain palvelimelta
- SSH-tunneliohje on dokumentoitu kehitystä varten
- varmuuskopiointi on suunniteltu
- virheloki tai vähintään virheiden tarkistustapa on olemassa

### Ylläpito

- ylläpitäjä pääsee kirjautumaan
- linkki-ilmoitukset näkyvät
- ilmoitukset voi hyväksyä, hylätä ja piilottaa
- huijausvaroituksia voi näyttää ja piilottaa
- automaation ajoloki on luettavissa

## 14. Elokuun työpaketit

### Työpaketti 1: palautteen analyysi

Kestoarvio: 1-3 päivää

Tulokset:

- palautekooste
- päätös korjattavista asioista
- priorisoitu tehtävälista

### Työpaketti 2: tekninen välikerros

Kestoarvio: 1-3 päivää

Tulokset:

- data provider -rajapinta
- Firebase-adapteri
- alustava API-adapteri
- dokumentoitu datamalli

### Työpaketti 3: Cloudcity-selvitys

Kestoarvio: 1-2 päivää

Selvitettävät asiat:

- tuettu backend-tekniikka
- tietokantatyyppi
- cron-ajojen mahdollisuus
- SSH-tunnelin käyttö
- ympäristömuuttujien tai salaisuuksien hallinta
- staging-ympäristön mahdollisuus
- lokitus ja varmuuskopiot

### Työpaketti 3B: väliaikainen siirto Firebase Hostingiin

Kestoarvio: 0,5-1 päivää

Tavoite:

Jos Cloudcity-siirto ei ole vielä valmis lopulliseen julkaisuun mennessä, siirretään staattinen frontend GitHub Pagesista Firebase Hostingiin välivaiheena. Tämä mahdollistaa Firebase Hosting -suojausotsikot, kuten Content-Security-Policy, HSTS, Referrer-Policy ja X-Frame-Options, jotka eivät tule käyttöön GitHub Pages -julkaisussa projektin `firebase.json`-asetuksilla.

Tulokset:

- Firebase Hosting käytössä projektissa `aloitussivu-5d50c`
- `firebase.json`-tiedoston suojausotsikot testattu tuotanto- tai staging-osoitteessa
- GitHub Actions tai manuaalinen deploy päivitetty julkaisemaan `dist` Firebase Hostingiin
- vanha GitHub Pages -osoite ohjaa uuteen osoitteeseen tai merkitään vain testikäyttöön
- Firebase API key -rajoituksiin lisätty uusi hosting-domain
- Firebase Authenticationin Authorized domains -listaan lisätty uusi hosting-domain
- tekoälyavustaja, nimipäivä, ylläpito ja Kyberturvallisuuskeskuksen ajo testattu uudessa osoitteessa

Huomio:

Tämä ei korvaa Cloudcityn omaa tietokanta- ja API-siirtoa. Se on turvallinen välivaihe, jolla nykyinen Firebase-pohjainen toteutus saadaan paremmin suojattuun julkaisuympäristöön.

### Työpaketti 4: Cloudcity API ja tietokanta

Kestoarvio: 4-8 päivää

Tulokset:

- tietokantataulut
- API-reitit
- ylläpitotoiminnot
- huijausvaroitusten haku
- perusvirheenkäsittely

### Työpaketti 5: migraatio ja rinnakkaistestaus

Kestoarvio: 2-4 päivää

Tulokset:

- nykyinen data siirretty tai synkronoitu
- staging testattu
- Firebase- ja Cloudcity-toteutusten erot tarkistettu
- rollback-suunnitelma olemassa

### Työpaketti 6: julkaisu

Kestoarvio: 1-2 päivää

Tulokset:

- lopullinen domain tai polku käytössä
- ohjeet päivitetty
- käyttäjätestauksen jälkeen sovitut korjaukset mukana
- ylläpito ohjeistettu

## 15. Riskit

### Tietokantayhteys vain Cloudcityltä

Riski:

Paikallinen kehitys voi hidastua, jos tietokantaa pitää käyttää SSH-tunnelin kautta.

Hallinta:

- käytetään mock-dataa UI-kehityksessä
- testataan oikea tietokanta stagingissä
- dokumentoidaan SSH-tunnelin käyttö

### Kirjautuminen

Riski:

Nykyinen Firebase/Google-kirjautuminen ei istu suoraan uuteen Cloudcity-API:in.

Hallinta:

- päätetään kirjautumistapa ennen API:n toteutusta
- pidetään ylläpito aluksi mahdollisimman yksinkertaisena

### Testipalautteen määrä

Riski:

Kesäkuun testaus voi tuottaa paljon sisältö- ja käytettävyyspalautetta.

Hallinta:

- priorisoidaan julkaisuun vain kriittiset ja selvästi hyödylliset muutokset
- siirretään uudet ideat myöhempään kehitykseen

### Domain/polku

Riski:

Alihakemisto `seniorsurf.fi/aloitussivu` voi vaatia build- ja reititysmuutoksia.

Hallinta:

- testataan stagingissä juuri samalla polulla
- varmistetaan staattisten tiedostojen polut

### Huijausvaroitusten automaatio

Riski:

Kyberturvallisuuskeskuksen sivurakenne voi muuttua, jolloin automaatio ei löydä varoituksia.

Hallinta:

- ajoloki näkyy ylläpidossa
- nollatulokset merkitään tarkistettaviksi
- ylläpitäjä voi lisätä varoituksen käsin

## 16. Avoimet päätökset

Ennen elokuun toteutusta pitää päättää:

- lopullinen osoite: oma domain vai `seniorsurf.fi/aloitussivu`
- käytetäänkö Firebasea vielä julkaisussa vai siirrytäänkö heti Cloudcity-tietokantaan
- mikä backend-tekniikka Cloudcityssä valitaan
- mikä kirjautumistapa ylläpitoon tulee
- tarvitaanko staging-osoite
- kuka vastaa Cloudcity-palvelimen tunnuksista, tietokannasta ja varmuuskopioista
- kuinka paljon kesäkuun testipalautetta korjataan ennen ensimmäistä varsinaista julkaisua

## 17. Suositeltu etenemismalli

Suositus on kolmivaiheinen.

### Vaihe 1: ennen testausta

Pidetään näkyvä sivusto vakaana. Tehdään vain rajattuja korjauksia ja mahdollisesti tekninen välikerros, jos se ei muuta käyttäjälle näkyvää toimintaa.

### Vaihe 2: elokuun alussa

Analysoidaan testipalaute ja päätetään julkaisuun menevät korjaukset. Samalla lukitaan domain/polku ja Cloudcityn tekninen toteutustapa.

### Vaihe 3: elokuun aikana

Toteutetaan Cloudcity-siirto tai vähintään valmistellaan se niin pitkälle, että syyskuussa voidaan julkaista hallitusti.

Jos aika loppuu, turvallisin välimalli on:

- frontend julkaistaan ensin Firebase Hostingissa, jotta suojausotsikot ja Firebase-funktioiden kanssa sama ympäristö saadaan käyttöön
- lopullinen osoite voidaan myöhemmin ohjata Firebase Hostingiin tai Cloudcityyn päätetyn julkaisumallin mukaan
- Firebase jää väliaikaisesti datakerrokseksi
- Cloudcityn oma tietokanta otetaan käyttöön myöhemmässä vaiheessa

Pitkän aikavälin tavoite on kuitenkin:

```text
SeniorSurfin aloitussivu
  -> Cloudcity API
    -> Cloudcityn oma tietokanta
```
