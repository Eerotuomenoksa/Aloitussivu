# Palautelomakkeen suunnitelma julkaisua edeltävään testaukseen

Päivitetty 13.8.2026 vastaamaan 3.9.2026 tavoitejulkaisua. Uudessa testikierroksessa arvioidaan rajattua julkaisuversiota, josta tekoälyavustaja ja nimipäivät on poistettu. Paikallisuutiset ovat oletuksena piilossa, ja niiden mukanaolo ratkaistaan uusien testivastausten perusteella.

## Tavoite

Palautelomakkeen tarkoitus on selvittää:

- löytävätkö testaajat tarvitsemansa palvelut
- onko sivun tarkoitus ymmärrettävä
- toimivatko kategoriat ja alakategoriat
- ovatko paikalliset palvelut hyödyllisiä
- löytyvätkö uuden yläosan kello, verkkohaku ja sää helposti
- löytyvätkö ja avautuvatko kuntakohtaiset senioripalvelulinkit Lähelläsi-osiossa
- haluavatko testaajat paikallisuutiset ensimmäiseen julkaisuun
- huomaavatko käyttäjät tärkeät toiminnot
- onko mobiilikäyttö riittävän helppoa
- ovatko värit, tekstikoko ja kontrastit sopivia
- mitä pitää korjata ennen varsinaista julkaisua

Lomakkeen pitää olla riittävän lyhyt, jotta vastauskynnys pysyy matalana. Kaikkea ei kannata tehdä pakolliseksi.

## Suositeltu aloitusteksti

```text
Kiitos, että testaat aloitussivua.

Palautteen avulla viimeistelemme 3.9.2026 tavoitejulkaisua. Tekoälyavustaja ja nimipäivät eivät kuulu tähän testattavaan versioon. Lomakkeeseen vastaaminen vie noin 5-10 minuuttia. Voit vastata itse tai yhdessä digiopastajan kanssa.
```

## Ennen lomakkeeseen vastaamista

Testaajaa pyydetään tekemään neljä tehtävää:

1. Etsi yläosasta kello, sää ja Google-haku.
2. Etsi yksi tarvitsemasi palvelu kategorioista tai linkkihaulla.
3. Valitse Lähelläsi-osiossa oma kunta ja avaa kunnan senioripalvelulinkki, jos se näkyy.
4. Avaa Asetukset, ota paikallisuutiset käyttöön ja arvioi niiden paikka ensimmäisessä julkaisussa.

## Pakolliset kysymykset

Suositus on, että vain nämä kysymykset ovat pakollisia:

1. Millä laitteella testasit?
2. Löysitkö etsimäsi palvelut?
3. Kuinka hyödylliseltä sivu tuntui?
4. Mikä on tärkein asia, joka pitäisi korjata ennen julkaisua?

Muut kysymykset kannattaa jättää vapaaehtoisiksi.

## Lomakkeen rakenne

## 1. Taustatieto

Taustakysymykset auttavat tulkitsemaan palautetta. Niiden pitää olla kevyitä eikä liian henkilökohtaisia.

### Millä laitteella testasit?

Tyyppi: valintaruudut, voi valita useamman

Vaihtoehdot:

- Puhelin
- Tabletti
- Tietokone

Suositus: pakollinen.

### Käytitkö sivua itse vai jonkun kanssa?

Tyyppi: monivalinta

Vaihtoehdot:

- Itse
- Toisen henkilön kanssa
- Opastustilanteessa

### Kuinka tottunut olet käyttämään verkkopalveluja?

Tyyppi: monivalinta

Vaihtoehdot:

- Käytän verkkopalveluja usein
- Käytän verkkopalveluja joskus
- Tarvitsen usein apua
- Vastaan opastajan tai havainnoijan näkökulmasta

## 2. Ensivaikutelma

### Oliko sivun tarkoitus selvä?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- Ei

### Löysitkö yläosasta helposti kellon, sään ja Google-haun?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- Ei

### Mikä oli ensivaikutelmasi sivusta?

Tyyppi: avoin tekstikenttä

### Tuntuiko sivu?

Tyyppi: valintaruudut

Vaihtoehdot:

- Selkeältä
- Rauhalliselta
- Liian täydeltä
- Liian sekavalta
- Muuta, mitä?

## 3. Palveluiden löytäminen

Tämä on lomakkeen tärkein osio.

### Löysitkö etsimäsi palvelut?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- En

Suositus: pakollinen.

### Mitä yritit löytää?

Tyyppi: avoin tekstikenttä

### Mikä jäi löytymättä?

Tyyppi: avoin tekstikenttä

### Oliko kategorioiden ja alakategorioiden jako ymmärrettävä?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- Ei

### Mikä kategoria, sana tai otsikko tuntui epäselvältä?

Tyyppi: avoin tekstikenttä

## 4. Paikalliset sisällöt

### Näkyikö oma paikkakunta oikein?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Ei
- En huomannut

### Oliko paikallisista palveluista hyötyä?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- Ei
- En käyttänyt niitä

### Löytyikö Lähelläsi-osiosta kuntasi senioripalvelusivu?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä, linkki löytyi ja avautui
- Linkki näkyi, mutta ei avautunut oikein
- Kuntani seniorilinkkiä ei löytynyt
- En testannut tätä

### Minkä kunnan valitsit, ja puuttuiko tai toimiko jokin paikallinen linkki väärin?

Tyyppi: avoin tekstikenttä

### Pitäisikö paikallisuutisten olla mukana ensimmäisessä julkaisussa?

Tyyppi: monivalinta

Vaihtoehdot:

- Pidä mukana ensimmäisessä julkaisussa
- Pidä mukana vain asetuksista valittavana
- Jätä pois ensimmäisestä julkaisusta
- En testannut paikallisuutisia

## 5. Toiminnot

### Kuinka tarpeellisilta nämä toiminnot tuntuvat?

Tyyppi: arviointitaulukko, asteikko 1-5

Ohje vastaajalle:

Arvioi jokainen toiminto sen mukaan, kuinka tarpeelliselta se tuntuu aloitussivulla.

Asteikko:

- 1 = Ei lainkaan tarpeellinen
- 2 = Melko tarpeeton
- 3 = En osaa sanoa / kohtalaisen tarpeellinen
- 4 = Tarpeellinen
- 5 = Erittäin tarpeellinen

Arvioitavat toiminnot:

- Sää
- Google-haku
- Huijausvaroitukset
- Lähelläsi ja kuntasi senioripalvelut
- Suosikit
- Linkkihaku
- Paikalliset uutiset (asetuksista)

Suositus: vapaaehtoinen, mutta pidetään yhtenä isona kysymyksenä.

### Puuttuuko jokin tärkeä toiminto?

Tyyppi: avoin tekstikenttä

## 6. Käytettävyys ja saavutettavuus

### Oliko tekstin koko sopiva?

Tyyppi: monivalinta

Vaihtoehdot:

- Sopiva
- Liian pieni
- Liian suuri
- Vaihtelin kokoa asetuksista

### Oliko väreistä ja kontrasteista helppo saada selvää?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- Ei

### Oliko sivua helppo käyttää puhelimella?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- Ei
- En testannut puhelimella

### Tuliko vastaan kohta, jota oli vaikea painaa, lukea tai ymmärtää?

Tyyppi: avoin tekstikenttä

## 7. Sivuston esittelykierros

### Katsoitko sivuston esittelykierroksen?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- En

### Auttoiko esittely ymmärtämään sivua?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Osittain
- Ei
- En katsonut

### Mitä esittelystä puuttui tai mikä siinä oli turhaa?

Tyyppi: avoin tekstikenttä

## 8. Kokonaisarvio

### Kuinka hyödylliseltä sivu tuntui?

Tyyppi: asteikko 1-5

Asteikon selite:

- 1 = ei lainkaan hyödyllinen
- 5 = erittäin hyödyllinen

Suositus: pakollinen.

### Kuinka helppokäyttöiseltä sivu tuntui?

Tyyppi: asteikko 1-5

Asteikon selite:

- 1 = vaikea käyttää
- 5 = erittäin helppo käyttää

### Voisitko suositella sivua seniorille tai digiopastukseen?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Ehkä
- En

### Mikä on tärkein asia, joka pitäisi korjata ennen julkaisua?

Tyyppi: avoin tekstikenttä

Suositus: pakollinen.

### Mikä sivulla oli erityisen hyvää?

Tyyppi: avoin tekstikenttä

## 9. Yhteystieto vapaaehtoisesti

### Saako sinuun olla yhteydessä lisäkysymyksissä?

Tyyppi: monivalinta

Vaihtoehdot:

- Kyllä
- Ei

### Sähköposti tai puhelin

Tyyppi: tekstikenttä

Ohjeteksti:

```text
Yhteystieto on vapaaehtoinen. Käytämme sitä vain, jos tarvitsemme tarkennusta palautteeseesi.
```

## Suositeltu lopputeksti

```text
Kiitos palautteesta.

Käymme vastaukset läpi elokuussa ja käytämme niitä aloitussivun viimeistelyyn ennen julkaisua.
```

## Lomakkeen toteutussuositus

Lomake kannattaa pitää yhtenä sivuna, mutta jakaa väliotsikoilla selkeisiin osioihin. Tämä helpottaa vastaamista ja lomakkeen silmäilyä.

Suositukset:

- käytä selkeitä väliotsikoita
- pidä pakolliset kysymykset minimissä
- lisää avoimia kenttiä kohtiin, joissa käyttäjä voi kertoa omin sanoin
- anna mahdollisuus vastata myös opastajan tai havainnoijan näkökulmasta
- älä kysy tarpeettomia henkilötietoja
- kerro mihin palautetta käytetään

## Palautteen käsittely elokuussa

Vastaukset kannattaa ryhmitellä elokuussa seuraavasti:

- löydettävyys ja kategoriat
- paikalliset palvelut ja uutiset
- mobiilikäyttö
- saavutettavuus ja luettavuus
- huijausvaroitukset
- tekoälyavustaja
- linkkipuutteet ja väärät linkit
- esittelykierros
- uudet kehitysideat

Julkaisuun ennen elo-syyskuuta kannattaa ottaa vain:

- toistuvat käytettävyysongelmat
- selkeät bugit
- puuttuvat tai virheelliset tärkeät linkit
- saavutettavuuteen vaikuttavat korjaukset
- asiat, jotka estävät sivun ymmärtämistä

Muut ideat voidaan kirjata myöhempään kehityslistaan.

