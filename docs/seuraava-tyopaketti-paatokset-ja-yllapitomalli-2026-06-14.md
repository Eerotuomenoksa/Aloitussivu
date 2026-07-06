# Seuraava työpaketti: päätökset ja ylläpitomalli

Päiväys: 14.6.2026

## Miksi tämä paketti on seuraava

Edellinen paketti sai käyttäjälle näkyvät pienet korjaukset ja linkki-ilmoitusten kevyen suojauksen valmiiksi. Seuraavaksi ei kannata aloittaa uutta isoa koodikokonaisuutta ennen kuin julkaisua, ylläpitoa ja vastuita koskevat päätökset on kirjattu.

Tämä työpaketti kokoaa ne asiat, jotka Eeron pitää tarkistaa ja määritellä. Kun nämä on päätetty, Codex voi jatkaa toteutusta paljon suoraviivaisemmin ilman arvailua.

## Paketin tavoite

Tavoitteena on tehdä päätösdokumentti, jonka perusteella voidaan seuraavaksi toteuttaa:

- julkaisun nimi ja osoite
- ylläpidon näkyvyys ja suojaus
- tietosuoja- ja saavutettavuussivujen lopulliset tiedot
- linkkiehdotusten ja palautteiden käsittelymalli
- Firebase-, Firebase Hosting- tai Cloudcity-polun seuraava vaihe
- julkaisuun kuulumattomien linkkien ja sivujen siivous

## Eeron tarkistettavat ja määriteltävät asiat

### 1. Virallinen nimi

Päätä:

- jääkö palvelun viralliseksi nimeksi `Aloitussivu`
- käytetäänkö nimeä muodossa `SeniorSurf Aloitussivu`
- tarvitaanko kokonaan uusi nimi
- kirjoitetaanko nimi kaikissa kieliversioissa samana vai käännetäänkö se

Tarkista:

- näkyykö nykyinen nimi oikein headerissa, footerissa, selaimen otsikossa ja dokumenteissa
- onko nimi riittävän selkeä käyttäjälle, joka ei tunne projektia
- pitääkö SeniorSurf-brändi näkyä nimessä vai riittääkö footerissa oleva tarjoajatieto

Kirjattava päätös:

```text
Virallinen nimi:
Nimen käyttö kieliversioissa:
SeniorSurf-nimen käyttö:
```

### 2. Lopullinen osoite tai julkaisuosoitteen suunta

Päätä:

- tavoitellaanko ensisijaisesti osoitetta `seniorsurf.fi/aloitussivu`
- käytetäänkö välivaiheessa Firebase Hostingia
- jääkö GitHub Pages vain testiosoitteeksi
- tarvitaanko oma domain

Tarkista:

- kuka voi päättää SeniorSurf-sivuston polusta
- saadaanko `seniorsurf.fi/aloitussivu` käyttöön ennen lokakuun julkaisua
- pitääkö nykyiseen testiosoitteeseen lisätä selkeä “testiversio” -merkintä
- mitä osoitetta käytetään testaajien viestinnässä nyt

Kirjattava päätös:

```text
Ensisijainen tuotanto-osoite:
Väliaikainen julkaisuosoite:
Mitä nykyiselle GitHub Pages -osoitteelle tehdään:
Kuka päättää lopullisen osoitteen:
```

### 3. Julkaisualusta

Päätä alustavasti:

- jatketaanko nykyisellä GitHub Pages + Firebase -mallilla testauksen ajan
- siirrytäänkö ensin Firebase Hostingiin suojausotsikoiden takia
- valmistellaanko Cloudcity-siirto vasta testausjakson jälkeen
- otetaanko Cloudcityyn oma tietokanta heti vai myöhemmässä vaiheessa

Tarkista:

- onko Cloudcityssä käytettävissä backend, tietokanta, cron-ajot ja ympäristömuuttujat
- kuka hallitsee Cloudcity-tunnuksia
- saako Cloudcityyn staging-ympäristön
- pitääkö Firebase jäädä väliaikaiseksi datakerrokseksi

Kirjattava päätös:

```text
Testausjakson tekninen malli:
Ensimmäinen tuotantomalli:
Cloudcityn rooli:
Firebase jää käyttöön kyllä/ei:
```

### 4. Ylläpitolinkit ja ylläpidon näkyvyys

Päätä:

- näkyykö `Ylläpito` julkisessa footerissa
- näkyykö `Kehitysjono` julkisessa footerissa
- näkyykö `Linkkiluettelo` julkisessa footerissa
- pidetäänkö `Muutosloki` julkisena
- piilotetaanko ylläpidon tekniset sivut navigaatiosta mutta jätetään kirjautumisen taakse

Tarkista:

- mitä sivuja tavallinen loppukäyttäjä oikeasti tarvitsee
- mitä sivuja tarvitaan vain testaajille
- mitä sivuja tarvitaan vain ylläpitäjälle
- onko ylläpitosivuilla `noindex` ja robots-rajaukset riittävästi

Kirjattava päätös:

```text
Footerissa näkyvät sivut:
Vain testaajille näkyvät sivut:
Vain ylläpidolle tarkoitetut sivut:
Poistetaanko ylläpito-linkki footerista:
```

### 5. Ylläpitovastuu

Päätä:

- kuka tai ketkä käsittelevät palautteet
- kuka käsittelee linkki-ilmoitukset
- kuka hyväksyy uudet linkit
- kuka päättää linkin poistamisesta
- kuka seuraa huijausvaroitusten automaatiota
- kuka vastaa julkaisun jälkeen viikoittaisesta tarkistuksesta

Tarkista:

- onko ylläpitoon käytettävissä säännöllisesti aikaa
- tarvitaanko varahenkilö
- miten kiireelliset huijaus- tai rikkinäinen linkki -havainnot käsitellään

Kirjattava päätös:

```text
Päävastuullinen:
Varahenkilö:
Linkki-ilmoitusten käsittelijä:
Huijausvaroitusten seuraaja:
Viikoittainen ylläpitorytmi:
```

### 6. Ylläpidon ilmoitukset

Päätä:

- tarvitaanko sähköposti uusista palautteista
- tarvitaanko sähköposti uusista linkki-ilmoituksista
- tarvitaanko koontiviesti esimerkiksi kerran päivässä tai viikossa
- mikä sähköpostiosoite tai jakelulista vastaanottaa ilmoitukset
- mikä osoite näkyy lähettäjänä

Tarkista:

- voidaanko käyttää SeniorSurfin tai VTKL:n sähköpostia
- onko Cloudcityssä tai Microsoft 365:ssä käytettävissä turvallinen lähetysmalli
- halutaanko ilmoitukset heti vai riittääkö manuaalinen tarkistusrytmi

Kirjattava päätös:

```text
Ilmoitukset käytössä kyllä/ei:
Vastaanottaja:
Lähettäjäosoite:
Ilmoitustiheys:
Väliaikainen malli, jos sähköpostia ei toteuteta vielä:
```

### 7. Tietosuoja

Päätä ja tarkista:

- kuka on rekisterinpitäjä
- mikä on tietosuojayhteydenoton osoite
- mainitaanko käyttötilastot lopullisessa muodossa
- mainitaanko linkki-ilmoitusten tiedot ja säilytysaika
- mainitaanko palautelomakkeen selain- ja laitetiedot
- mainitaanko kuvakaappauksen lähetysmahdollisuus
- mainitaanko tekoälyavustajan tietovirrat
- jääkö Firebase palveluntarjoajaksi tietosuojaselosteeseen
- mainitaanko mahdollinen Cloudcity jo nyt vai vasta siirron jälkeen

Kirjattava päätös:

```text
Rekisterinpitäjä:
Tietosuojayhteydenotto:
Palautteiden säilytysaika:
Linkki-ilmoitusten säilytysaika:
Käyttötilastojen säilytysaika:
Firebase/Cloudcity maininta:
```

### 8. Saavutettavuus

Päätä:

- tehdäänkö virallinen saavutettavuusseloste jo pilotissa vai vasta ennen laajaa julkaisua
- mikä on saavutettavuuspalautteen yhteystieto
- kuka tekee tai hyväksyy käsin tehtävän saavutettavuustarkistuksen
- testataanko ruudunlukijalla ennen laajaa julkaisua

Tarkista:

- desktop
- mobiili
- tekstikoon suurennos
- näppäimistökäyttö
- modaalit
- lomakkeet
- ruudunlukijan peruspolku
- kontrastit visuaalisten muutosten jälkeen

Kirjattava päätös:

```text
Saavutettavuusselosteen muoto:
Saavutettavuuspalautteen yhteystieto:
Käsintarkistuksen vastuuhenkilö:
Ruudunlukijatestaus kyllä/ei:
```

### 9. Linkkivalikoiman rajaus

Päätä:

- pidetäänkö sivu kuratoituna aloitussivuna vai mahdollisimman kattavana hakemistona
- mikä on kriteeri uuden linkin lisäämiselle
- milloin paikallinen linkki nostetaan `Lähelläsi`-osioon
- milloin linkki jää vain kategoriaan
- milloin linkki poistetaan kokonaan
- käytetäänkö Matkahuoltoa fallbackina kunnille ilman omaa julkisen liikenteen linkkiä

Tarkista:

- ovatko suuret kaupungit nyt riittävän rauhallisia `Lähelläsi`-osiossa
- ovatko palveluliikenne- ja julkisen liikenteen linkit käyttäjälle ymmärrettävästi nimettyjä
- pitääkö linkkiluettelon kokonaismäärää rajata ennen julkaisua

Kirjattava päätös:

```text
Uuden linkin hyväksymiskriteeri:
Lähelläsi-osioon nostamisen kriteeri:
Poistamisen kriteeri:
Matkahuolto fallback hyväksytty kyllä/ei:
```

### 10. Nimipäivät

Päätä:

- jäävätkö nimipäivät näkyviin tuotantoon
- piilotetaanko toiminto testauksen jälkeen, jos tuotantodataa ei ole
- hankitaanko tiedostopohjainen nimipäivädata
- kuka vastaa datan vuosittaisesta päivityksestä

Kirjattava päätös:

```text
Nimipäivät tuotannossa kyllä/ei:
Tietolähde:
Päivitysvastuu:
Jos ei ratkaista ennen julkaisua, piilotetaanko:
```

### 11. Tekoälyavustaja

Päätä:

- pidetäänkö tekoälyavustaja mukana julkaisussa
- vaatiiko käyttö kirjautumisen myöhemmin
- mikä kustannusriski hyväksytään
- otetaanko Firebase App Check tuotannossa pakolliseksi ennen laajempaa julkaisua

Tarkista:

- Gemini-funktion App Check -pakotus Firebase Consolessa
- `GEMINI_REQUIRE_APP_CHECK=true`
- budjetti- tai käyttörajat Google Cloudissa
- mitä käyttäjälle kerrotaan avustajan tietosuojasta

Kirjattava päätös:

```text
Avustaja mukana julkaisussa kyllä/ei:
App Check pakolliseksi kyllä/ei:
Kustannusraja tai seuranta:
Tietosuojateksti riittävä kyllä/ei:
```

### 12. Testipalautteen käsittely

Päätä:

- milloin testipalautteet käydään läpi
- miten palaute luokitellaan
- kuka päättää, mikä korjataan ennen julkaisua
- mitkä ideat siirretään jatkokehitykseen

Tarkista:

- palautelomakkeen vastaukset
- kehitysjono
- linkki-ilmoitukset
- suorat havainnot opastustilanteista
- WhatsApp/testaajilta tulleet huomiot

Kirjattava päätös:

```text
Palautteen läpikäyntipäivä:
Päätöksentekijät:
P1/P2/P3-luokittelun kriteeri:
Mihin jatkokehitysideat kirjataan:
```

## Codexin toteutusohjeet, kun päätökset on kirjattu

Kun yllä oleviin kohtiin on vastaukset, Codex voi tehdä seuraavan toteutuspaketin näin:

1. Päivitä päätökset dokumentteihin:
   - `docs/elokuun-julkaisusuunnitelma.md`
   - `docs/julkaisuroadmap-2026-10-06.md`
   - `docs/saavutettavuus-ja-tietosuoja-sivut-suunnitelma.md`
   - tarvittaessa `docs/firebase-maaritys-ohje.md`

2. Päivitä käyttöliittymän näkyvät linkit:
   - footerin sivut
   - ylläpito- ja kehitysjonolinkit
   - tietosuoja- ja saavutettavuuslinkit

3. Päivitä tekstit:
   - tietosuojasivu
   - saavutettavuussivu
   - ohje- ja tietoa-tekstit
   - julkaisuviestien pohjat, jos sellaiset päätetään tehdä

4. Tee tekniset rajaukset:
   - `robots.txt` ja `noindex` vain ylläpidolle tarkoitetuille sivuille
   - ylläpitolinkkien näkyvyys päätöksen mukaan
   - mahdollinen Firebase Hosting -valmistelu
   - App Check -asetusten dokumentointi

5. Aja tarkistukset:
   - `npx vite build`
   - valikoitu selaintesti etusivulle, muutoslokiin, tietosuojaan, saavutettavuuteen ja ylläpitoon
   - tarvittaessa linkkitarkistus, jos linkkivalikoimaa muutetaan

6. Päivitä muutosloki ja työloki.

## Ehdotettu seuraava commit-kokonaisuus

Kun päätökset on annettu ja toteutus tehty, sopiva commit voisi olla:

```text
julkaisun rajaus ja ylläpitomallin päätökset
```

Vaihtoehtoisesti, jos toteutus rajataan vain dokumentointiin:

```text
julkaisupäätösten työpaketti
```

## Mitä ei tehdä tässä paketissa

- Ei vielä tehdä täyttä Cloudcity-siirtoa.
- Ei vielä toteuteta uutta tietokantaa.
- Ei vielä muuteta kaikkia datatoimintoja data provider -malliin.
- Ei tehdä täyttä linkkiauditointia, ellei siihen varata erillistä aikaa.
- Ei poisteta ylläpitolinkkejä tai testisivuja ennen päätöstä.
- Ei muuteta virallista nimeä tai domainia ilman hyväksyttyä päätöstä.

## Suositeltu työskentelytapa

1. Eero täyttää tämän dokumentin päätöskohtiin vastaukset.
2. Codex käy vastaukset läpi ja tekee toteutussuunnitelman.
3. Toteutus jaetaan pieniin committeihin:
   - dokumentit
   - käyttöliittymän linkit ja tekstit
   - tekniset suojaus- ja julkaisuasetukset
4. Jokaisen commitin jälkeen ajetaan build ja päivitetään muutosloki.

## Tärkeimmät päätökset ensin

Jos kaikkia kohtia ei ehditä käydä kerralla läpi, aloita näistä viidestä:

1. Virallinen nimi.
2. Lopullinen osoite tai väliaikainen julkaisuosoite.
3. Näkyykö ylläpito julkisessa footerissa.
4. Kuka käsittelee palautteet ja linkki-ilmoitukset.
5. Rekisterinpitäjä ja yhteystieto tietosuoja- sekä saavutettavuuspalautteelle.

## Väliaikaiset minimilinjaukset 18.6.2026

Nämä linjaukset eivät vielä korvaa lopullista julkaisu- tai hallintapäätöstä. Niiden tarkoitus on sulkea keskeneräinen työpaketti niin, että toteutusta voidaan jatkaa hallitusti ilman arvailua.

### 1. Virallinen nimi

Päätös: ei vielä lopullinen.

Väliaikainen malli: käyttöliittymässä ja dokumenteissa käytetään nimeä `Aloitussivu`. SeniorSurf säilyy taustapalvelun, verkoston tai tarjoajakontekstin nimenä, eikä sitä pakoteta osaksi jokaisen sivun virallista nimeä ennen erillistä viestintäpäätöstä.

Tarkistaja: Eero / SeniorSurf- tai VTKL-viestinnän vastuuhenkilö.

Viimeinen päivä päättää: ennen elokuun varsinaisia julkaisu- ja viestintätekstejä.

### 2. Väliaikainen julkaisuosoite

Päätös: ei vielä lopullinen.

Väliaikainen malli: nykyistä testausosoitetta käytetään vain pilotti- ja testauskäyttöön. GitHub Pages -mallia ei kuvata tuotantotason ratkaisuksi, koska palvelimen suojausotsikot ja lopullinen polku riippuvat hosting-päätöksestä.

Tarkistaja: Eero ja lopullisesta SeniorSurf-polusta tai hostingista päättävä taho.

Viimeinen päivä päättää: ennen tuotantoon tähtäävää staging-testausta.

### 3. Ylläpito- ja kehitysjonolinkkien näkyvyys

Päätös: väliaikaisesti näkyvyys voi säilyä testauksen aikana.

Väliaikainen malli: `Kehitysjono` voi olla julkinen testauksen läpinäkyvyyden takia. `Ylläpito`, `Linkkiluettelo` ja muut tekniset sivut arvioidaan ennen julkaisua erikseen. Julkinen linkki ei ole käyttöoikeussuoja, joten ylläpitodatan suojaus perustuu kirjautumiseen, admin-oikeuksiin ja Firestore/Function-sääntöihin.

Tarkistaja: Eero.

Viimeinen päivä päättää: ennen laajaa julkaisua ja ennen footerin lopullista lukitusta.

### 4. Palautteiden ja linkki-ilmoitusten käsittely

Päätös: ei vielä lopullinen.

Väliaikainen malli: Eero käsittelee pilotin palautteet, linkki-ilmoitukset ja kehitysjonon tilamuutokset. Jos käsittelyyn tulee toinen ylläpitäjä, admin-malli täytyy dokumentoida ja yhtenäistää ennen oikeuksien lisäämistä.

Tarkistaja: Eero.

Viimeinen päivä päättää: ennen kuin palautemäärä kasvaa tai ylläpitoa jaetaan useammalle henkilölle.

### 5. Rekisterinpitäjä ja yhteystiedot

Päätös: ei vielä lopullinen.

Väliaikainen malli: tietosuoja- ja saavutettavuussivut pidetään luonnos-/pilottitasolla siihen asti, että rekisterinpitäjä, yhteydenotto-osoite ja palautekanavan vastuuhenkilö vahvistetaan. Sivujen ei pidä antaa vaikutelmaa lopullisesta virallisesta selosteesta ennen näitä tietoja.

Tarkistaja: Eero ja VTKL:n tietosuoja-/saavutettavuusvastuu.

Viimeinen päivä päättää: ennen julkista tuotantojulkaisua.

## Toteutuksen rajaus 18.6.2026

Näiden väliaikaisten linjausten perusteella voi tehdä dokumenttien, roadmapin ja testausohjeiden täsmennyksiä. Käyttöliittymän footer-linkkejä, virallista nimeä, osoitetta tai tietosuojasivun lopullista sanamuotoa ei muuteta pysyvästi ennen kuin yllä olevat päätökset on vahvistettu.
