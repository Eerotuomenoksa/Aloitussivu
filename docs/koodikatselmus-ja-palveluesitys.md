# Seniorin aloitussivu - koodikatselmus ja palveluesitys

Päiväys: 7.5.2026

## 1. Koodikatselmuksen sisältö

Katselmuksessa käytiin läpi seuraavat kokonaisuudet:

- Etusivun rakenne ja käyttöliittymän skaalaus: `App.tsx`
- Huijausvaroitusten etusivunäkymä: `components/ScamAlertsBanner.tsx`
- Alueellisten palveluiden ja paikallisuutisten sijoittelu: `components/RegionalServicesPanel.tsx`
- Firebase-kirjautuminen ja admin-tunnistus: `firebaseClient.ts`
- Huijausvaroitusten Firestore-tilaukset ja manuaaliajo: `scamAlerts.ts`
- Firestore-säännöt: `firestore.rules`
- Kyberturvallisuuskeskuksen automaatio: `functions/ncscCron.ts`, `services/ncscScheduler.ts`, `services/ncscScraper.ts`
- GitHub Pages -julkaisu: `.github/workflows/deploy.yml`

Varmistukset:

- Frontend build: `npx vite build` onnistui.
- Cloud Functions build: `npm run build` kansiossa `functions/` onnistui.

## 2. Katselmuksen löydökset

### Korkea: manuaaliajon salaisuus on mukana selaimen buildissa

Tiedostot:

- `scamAlerts.ts`, rivit 108-124
- `functions/ncscCron.ts`, rivit 25-29
- `.github/workflows/deploy.yml`, rivi 55

Nykyinen manuaaliajo toimii niin, että selain lukee `VITE_ADMIN_TRIGGER_SECRET`-arvon ja lähettää sen `x-admin-secret`-headerissa julkiseen Cloud Functioniin. Kaikki `VITE_`-alkuiset muuttujat päätyvät tuotantobundleen, joten tämä ei ole oikea palvelinsalaisuus. Käytännössä osaava käyttäjä voi löytää arvon selaimen JavaScriptistä ja käynnistää manuaaliajon.

Vaikutus:

- Ulkopuolinen voi ajaa huijausvaroitusten haun toistuvasti, jos löytää arvon.
- Suora tietovuotoriski on rajattu, koska funktio luo vain varoituksia ja logeja, mutta toiminto kuluttaa Cloud Functions-, Gemini- ja Firestore-resursseja.

Suositus:

- Poista `VITE_ADMIN_TRIGGER_SECRET` tuotantobuildista.
- Suojaa manuaaliajo Firebase Auth ID tokenilla ja tarkista palvelimella, että käyttäjän sähköposti on admin.
- Vaihtoehtoisesti tee manuaaliajo vain Firebase Callable Functionina, jossa `request.auth` on pakollinen.

### Keskitaso: dialogi ei vielä hallitse näppäimistöfokusta täydellisesti

Tiedosto:

- `components/ScamAlertsBanner.tsx`, rivit 75-94

Varoituskortin avaama dialogi käyttää `role="dialog"` ja `aria-modal="true"`, mutta siinä ei vielä ole Escape-sulkemista, fokuksen siirtoa dialogiin tai fokuksen palautusta avanneeseen korttiin.

Vaikutus:

- Hiirellä ja kosketuksella toiminta on selkeä.
- Näppäimistö- ja ruudunlukijakäyttäjälle käyttökokemus voi olla epätasainen.

Suositus:

- Lisää Escape-sulkeminen.
- Siirrä fokus avattaessa Sulje-painikkeeseen tai dialogin otsikkoon.
- Palauta fokus siihen varoituskorttiin, josta dialogi avattiin.

### Keskitaso: aktiivisten varoitusten kysely hakee kaikki dokumentit

Tiedosto:

- `scamAlerts.ts`, rivit 43-53

Etusivu tilaa koko `scamAlerts`-kokoelman ja suodattaa aktiiviset sekä vanhentumattomat varoitukset selaimessa. Nykyisellä datamäärällä tämä on täysin toimiva, mutta jos varoituksia kertyy vuosien mittaan paljon, etusivu lataa tarpeettomasti vanhoja dokumentteja.

Vaikutus:

- Pieni nyt.
- Kasvaa ajan myötä Firestore-lukujen ja latausajan mukana.

Suositus:

- Lisää kyselyyn `where('active', '==', true)` ja `limit(3-10)`.
- Vaihtoehtoisesti ylläpidä erillistä `activeScamAlerts`-kokoelmaa, jos halutaan välttää indeksi- ja vanhenemislogiikan mutkia.

### Matala: UI-skaalaus käyttää CSS `zoom`-ominaisuutta

Tiedosto:

- `App.tsx`, rivi 169

Sovellus skaalaa koko näkymän `zoom`-tyylillä. Tämä toimii Chromium-pohjaisissa selaimissa, mutta `zoom` ei ole yhtä standardi kuin fontti- ja layout-pohjainen skaalaus.

Vaikutus:

- Todennäköisesti hyväksyttävä kohderyhmässä, jos pääkäyttö tapahtuu tavallisilla selaimilla.
- Jatkokehityksessä voi aiheuttaa mitta- ja saavutettavuuseroja selainten välillä.

Suositus:

- Pidä nykyinen ratkaisu lyhyellä aikavälillä.
- Jos käyttö laajenee, siirrä skaalaus CSS-muuttujiin, kuten `--ui-scale`, ja käytä `rem`, `clamp()` ja komponenttikohtaisia kokoluokkia.

## 3. Mitä palvelu tarjoaa

Seniorin aloitussivu on ikääntyneille suunnattu selkeä verkkosivu, joka kokoaa arjen digipalvelut yhteen paikkaan.

Palvelu tarjoaa:

- Helpon etusivun yleisiin verkkopalveluihin.
- Kategoriat esimerkiksi julkisiin palveluihin, terveyteen, pankkeihin, uutisiin, kulttuuriin, museoihin, yhdistyksiin ja kotihoitoon.
- Alueelliset palvelut kunnan perusteella.
- Paikalliset uutiset ja lehtilinkit.
- Lähimmät digiopastuspaikat.
- Sää, kello ja helppokäyttöinen Google-haku.
- Kieliversiot useille käyttäjäryhmille.
- Tekoälyavustajan.
- Huijausvaroitukset Kyberturvallisuuskeskuksen viikkokatsauksista.
- Ylläpitonäkymän linkkiehdotuksille, ilmoituksille ja huijausvaroitusten hallinnalle.

Palvelun ydinlupaus:

> Yksi selkeä aloitussivu, joka vähentää etsimistä ja auttaa ikääntynyttä löytämään turvallisesti oikeaan palveluun.

## 4. Ylläpitotarve

### Kevyt jatkuva ylläpito

Arvio: 1-3 tuntia kuukaudessa.

Sisältö:

- Käyttäjien linkkiehdotusten ja virheilmoitusten tarkistus.
- Rikkinäisten linkkien korjaus.
- Uusien hyödyllisten palveluiden lisääminen.
- GitHub Pages -julkaisun onnistumisen tarkistus isompien muutosten jälkeen.

### Huijausvaroitusten ylläpito

Arvio: 0,5-1 tuntia kuukaudessa, jos automaatio toimii.

Sisältö:

- Automaation lokien tarkistus ylläpidosta.
- Tarvittaessa manuaaliajo.
- Väärien tai epäselvien varoitusten piilottaminen.
- Gemini-selkokielistyksen laadun satunnainen tarkistus.

### Tekninen ylläpito

Arvio: 1-2 tuntia kuukaudessa normaalisti, enemmän isommissa muutoksissa.

Sisältö:

- Firebase-secretsien ja GitHub Actionsin toiminnan seuranta.
- Cloud Functions -runtimepäivitykset. Node.js 20 on vanhentumassa, joten päivitys Node 22:een kannattaa tehdä vuoden 2026 aikana.
- Firestore-sääntöjen tarkistus, kun uusia kokoelmia tai ylläpitotoimintoja lisätään.
- Riippuvuuksien päivitys muutaman kerran vuodessa.

### Sisällöllinen omistajuus

Palvelu tarvitsee nimetyn vastuuhenkilön tai pienen ylläpitoryhmän, joka päättää:

- Mitkä linkit hyväksytään.
- Mitkä kategoriat ovat etusivun kannalta olennaisia.
- Miten huijausvaroitukset esitetään ymmärrettävästi.
- Milloin palvelu on valmis laajempaan viestintään.

## 5. Markkinointisuositus

Palvelua kannattaa markkinoida käytännön hyöty edellä, ei teknologiana.

### Pääkohderyhmät

- Ikääntyneet käyttäjät.
- Digiopastajat.
- Kirjastot.
- Vanhus- ja eläkeläisyhdistykset.
- Kunnat ja hyvinvointialueiden neuvonta.
- Läheiset, jotka auttavat ikääntynyttä verkkoasioinnissa.

### Viestikulmat

1. "Turvallinen aloitus nettiin"
   - Korostaa huijausvaroituksia, selkeyttä ja luotettavia linkkejä.

2. "Kaikki tärkeät palvelut yhdestä paikasta"
   - Korostaa arjen hyötyä: Kela, OmaKanta, pankit, kunnan palvelut, uutiset.

3. "Paikallinen apu löytyy helpommin"
   - Korostaa kunta- ja aluekohtaisia palveluita sekä digiopastuspaikkoja.

4. "Sopii digiopastuksen työkaluksi"
   - Korostaa käyttöä opastustilanteissa, kirjastoissa ja yhdistyksissä.

### Kanavat

- SeniorSurf-verkosto ja digiopastajat.
- Vanhustyön keskusliiton viestintäkanavat.
- Eläkeläis- ja potilasyhdistykset.
- Kirjastot ja kunnat.
- Paikallislehdet ja kuntien uutiskirjeet.
- Lyhyet WhatsApp-/sähköpostiviestit testaajille.

### Markkinointilauseita

- "Seniorin aloitussivu kokoaa tärkeät digipalvelut yhteen selkeään näkymään."
- "Vähemmän etsimistä, enemmän varmuutta."
- "Turvallisempi tapa aloittaa verkkoasiointi."
- "Digiopastajan apuri ja seniorin oma kotisivu nettiin."

## 6. Esitysrungon ehdotus

### Dia 1: Otsikko

Seniorin aloitussivu - turvallinen ja selkeä reitti arjen digipalveluihin

Pääviesti: palvelu tekee verkkoasioinnin aloittamisesta helpompaa ja turvallisempaa.

### Dia 2: Miksi palvelua tarvitaan

Ikääntyneelle ongelma ei ole vain palvelun käyttö, vaan oikean ja turvallisen palvelun löytäminen.

Nosta esiin:

- Liikaa osoitteita ja hakutuloksia.
- Huijaussivujen ja kalastelun riski.
- Paikallisten palveluiden löytäminen on hankalaa.
- Digiopastuksessa tarvitaan yhteinen selkeä lähtöpiste.

### Dia 3: Mitä palvelu tarjoaa

Yksi näkymä, jossa on:

- Tärkeät valtakunnalliset linkit.
- Paikalliset palvelut.
- Uutiset ja lehtilinkit.
- Digiopastuspaikat.
- Huijausvaroitukset.
- Ylläpidetty linkkiehdotusprosessi.

### Dia 4: Käyttäjän polku

1. Käyttäjä avaa aloitussivun.
2. Hän valitsee kunnan tai käyttää sijaintia.
3. Hän näkee paikalliset palvelut, uutiset ja varoitukset.
4. Hän valitsee tutun kategorian tai hakee palvelua.
5. Tarvittaessa hän ilmoittaa rikkinäisestä tai puuttuvasta linkistä.

### Dia 5: Turvallisuus ja huijausvaroitukset

Kyberturvallisuuskeskuksen viikkokatsauksista nostetaan ajankohtaiset huijaukset selkeällä kielellä.

Nosta esiin:

- Automaattinen viikoittainen haku.
- Ylläpitäjän manuaaliajo.
- Varoitusten aktivointi ja piilottaminen.
- Selkokielinen esitystapa.

### Dia 6: Ylläpitomalli

Palvelu on kevyt ylläpitää, jos vastuut ja rutiinit ovat selvät.

Kuukausittain:

- Linkkiehdotusten käsittely.
- Rikkinäisten linkkien korjaus.
- Huijausvaroitusten tarkistus.
- Julkaisun toimivuuden tarkistus.

Kvartaaleittain:

- Riippuvuuksien päivitykset.
- Kategorioiden ja sisältöjen arviointi.
- Käyttäjäpalautteen koonti.

### Dia 7: Riskit ja kehityskohdat

Tärkeimmät seuraavat parannukset:

- Manuaaliajon suojaus pois selaimen `VITE_`-secretistä.
- Dialogien näppäimistöfokuksen viimeistely.
- Firestore-kyselyiden optimointi, jos datamäärä kasvaa.
- Cloud Functions runtimepäivitys Node 22:een.

### Dia 8: Kenelle palvelua kannattaa tarjota

Ensisijaiset kumppanit:

- Digiopastajat ja SeniorSurf-verkosto.
- Kirjastot.
- Kunnat.
- Eläkeläisjärjestöt.
- Potilas- ja senioriyhdistykset.
- Läheiset ja vapaaehtoiset.

### Dia 9: Markkinointi

Markkinoinnin kärki:

> Turvallinen aloitussivu nettiin - selkeät linkit, paikalliset palvelut ja ajankohtaiset huijausvaroitukset yhdessä paikassa.

Kanavat:

- Järjestöjen uutiskirjeet.
- Kirjastojen ja kuntien viestintä.
- Paikallislehdet.
- Digiopastustilaisuudet.
- WhatsApp- ja sähköpostijakelu testaajille.

### Dia 10: Seuraavat askeleet

1. Korjataan katselmuksen korkean prioriteetin suojausasia.
2. Varmistetaan GitHub Pages -tuotantodeploy Firebase-secreteillä.
3. Kerätään testipalautetta 2-4 viikkoa.
4. Tehdään lyhyt esittelyvideo tai kuvallinen ohje.
5. Sovitaan ylläpitovastuu ja julkaisurytmi.

## 7. Tiivistelmä päätöksentekijälle

Palvelu on jo käyttökelpoinen pilotti. Sen arvo syntyy selkeydestä, paikallisuudesta ja turvallisuudesta. Ylläpitotarve on kohtuullinen, mutta edellyttää omistajuutta. Ennen laajempaa markkinointia kannattaa korjata manuaaliajon suojaus ja viimeistellä saavutettavuusdialogit.

