# Neljän testipalautteen korjaussuunnitelma

Tavoitejulkaisu: **3.9.2026** Cloudcityn webhotellissa osoitteessa `https://seniorsurf.fi/aloitussivu/`. Ensimmäiselle julkaisulle ei oteta erillistä domainia.

## Lähtötilanne

Koonti perustuu neljään 3.–10.8.2026 annettuun testivastaukseen sekä tiimin 12.8.2026 antamaan käyttöliittymäpalautteeseen.

- Hyödyllisyys: keskiarvo 4,5/5.
- Helppokäyttöisyys: keskiarvo 4,0/5.
- Kaikki neljä suosittelisivat sivua.
- Kaksi vastaajaa piti sivua ainakin osittain liian täytenä.
- Kaksi vastaajaa piti kategorioita vain osittain selkeinä.
- Sivun selkeys, rauhallisuus, hyödyllisyys, mobiilikäyttö ja tekstikoon säätö saivat kiitosta.

Tulokset ovat suuntaa-antavia. Oletusnäkymän sisältöjä ei lukita vain neljän vastauksen perusteella, vaan ennen julkaisua hankitaan lisää senioritestaajia.

## 1. Typografia ja visuaalinen luettavuus

Havainto:

- Fontteja oli useita ja kellon fontin nollassa oli häiritsevä poikkiviiva.
- Osa teksteistä ja linkeistä oli liian voimakkaasti lihavoitu.
- Sanojen ja rivien väljyyttä toivottiin lisää.

Korjaus:

- Käytetään koko sivustolla DM Sans -fonttia, mukaan lukien otsikot, kellot, lomakkeet ja logon tekstiosat.
- Leipäteksti ja linkit esitetään normaalipainoisina. Lihavointia käytetään pääasiassa otsikoissa, painikkeissa ja tärkeissä tilailmoituksissa.
- Lisätään maltillinen sana- ja merkkiväli ja poistetaan tiukimmat negatiiviset kirjainvälit.
- Tarkistetaan pienin, normaali ja suurin käyttäjän valitsema tekstikoko puhelimella ja tietokoneella.

Hyväksymisehto:

- Kaikkien sivujen laskennallinen fonttiperhe on DM Sans.
- Kellon nolla on avoin ilman poikkiviivaa.
- Palvelulinkkien paino on normaali ja otsikoiden hierarkia säilyy selkeänä.

Tila: **toteutettu 12.8.; tarkistettu 375 ja 1280 pikselin leveydellä ilman vaakasuuntaista ylivuotoa**. Suurimman käyttäjäkohtaisen tekstikoon tarkistus jää julkaisuporttiin.

## 2. Hakujen ja ääniohjauksen tunnistettavuus

Havainto:

- Internet-haun yhteys Googleen ei ollut kaikille selvä.
- Hakua etsittiin suurennuslasin perusteella, eikä tekoälyä aina tunnistettu hakutoiminnoksi.
- Kategoriahaun mikrofonimerkki oli epäselvä ja erillinen hakupainike puuttui.
- Yhdessä tietokonetestissä hakukenttä jäi osittain kategorianauhan alle.

Korjaus:

- Internet-haun tekstissä lukee näkyvästi `(Google-haku)`; Google-logoa ei käytetä.
- Suurennuslasi ja mikrofoni piirretään selkeinä SVG-kuvakkeina käyttöjärjestelmästä riippumatta.
- Kategoriahaussa on erillinen **Hae**-painike. Mikrofonipainike on omana rajattuna painikkeenaan ja sillä on ruudunlukijalle selkeä nimi.
- Testataan hakukentän näkyvyys kaikilla tekstikooilla sekä 320, 375, 768 ja 1280 pikselin näkymissä.

Hyväksymisehto:

- Hakua voi käyttää näppäimistöllä, kosketuksella ja puheella.
- Haku- ja mikrofonipainikkeet eivät sekoitu toisiinsa.
- Hakukenttä ei peity navigaation tai kategorianauhan alle.

Tila: **toiminnot toteutettu ja testattu 12.8.** Kategoriahaku ei näytä tuloksia ennen Hae-painiketta tai puhehaun valmistumista, ja painikkeet pysyvät erillään 375 pikselin näkymässä.

## 3. Sisällön määrä, kategoriat ja oletusnäkymä

Havainto:

- Sivun loppu ja yksityiskohdat tuntuivat kahdesta vastaajasta liian runsailta.
- `Koti`, `Tekniikka` ja kaksi eri `Liikunta`-kokonaisuutta aiheuttivat epäselvyyttä.
- Toivottiin App Storea, lisää sähköpostipalveluja ja täsmällisempää Kelataksi-nimeä.
- Oletuksena näkyvien toimintojen määrä vaatii lisää senioripalautetta.

Korjaus:

1. Luetteloidaan kaikki kategoriat, päällekkäiset nimet ja niiden sisällöt.
2. Nimetään kategoriat käyttäjän tehtävän mukaan, ei organisaation tai teknisen tyypin mukaan.
3. Lisätään puuttuvat keskeiset vaihtoehdot vasta linkin ja saavutettavuuden tarkistuksen jälkeen.
4. Valmistellaan kaksi oletusnäkymää senioritestaukseen:
   - suppea: kello, Google-haku, sää, kategoriahaku, Lähelläsi ja huijausvaroitukset;
   - laaja: lisäksi suosikit, paikallisuutiset ja muut toiminnot.
5. Tekoäly ja nimipäivät poistetaan ensimmäisen julkaisun käyttöliittymästä. Paikallisuutiset ovat oletuksena piilossa, ja niiden lopullinen mukanaolo päätetään lisätestauksen perusteella.

Hyväksymisehto:

- Vähintään 5 uutta senioritestausta, joista vähintään 2 tietokoneella ja 2 puhelimella.
- Oletusnäkymä valitaan tehtävien onnistumisen ja koetun selkeyden perusteella, ei yksittäisen mielipiteen perusteella.
- Yksikään pääkategoria ei vaadi selitystä ennen avaamista.

Tila: **osittain toteutettu 13.8.** Kategorioita on selkeytetty, yläosa on rakennettu uudelleen ilman tekoälyä ja nimipäiviä ja oletusnäkymä on rauhoitettu. Viiden uuden senioritestauksen kierros ja paikallisuutisten lopullinen päätös ovat avoinna.

## 4. Paikalliset linkit, paluu ja näppäimistökäyttö

Havainto:

- Lielahden ja Tesoman kirjastoihin liittyvät digiopastuslinkit veivät yleiselle Mukanetin sivulle.
- Mäntsälän paikallisuutiset ja senioripalvelujen suorat linkit vaativat tarkennusta.
- Alasivulta tai kategoriasta palattaessa käyttäjä joutui etusivun alkuun, mikä haittasi käyttöä ilman hiirtä.

Korjaus:

1. Tarkistetaan nimetyt Tampereen ja Mäntsälän linkit käsin ja korvataan ne suorilla, seniorille merkityksellisillä kohdesivuilla.
2. Käydään muiden kuntien vastaavat linkit läpi samalla säännöllä: suora senioripalvelu ennen kunnan yleissivua.
3. Säilytetään avatun kategorian käynnistäneen elementin fokus ja sivun vieritys, kun ikkuna suljetaan.
4. Lisätään julkaisuporttiin automaattinen linkkitarkistus ja selaimella tehtävä näppäimistöpolku.

Hyväksymisehto:

- Nimetyt virhelinkit on korjattu ja käsin avattu.
- Käyttäjä palaa sulkemisen jälkeen samaan kohtaan ja näkyvä fokus palautuu.
- Kriittisissä linkeissä ei ole automaattisen tarkistuksen virheitä ennen julkaisua.

Tila: **toteutettu nimetylle palautteelle 13.8.** Lielahden ja Tesoman järjestys, Mäntsälän suorat linkit, palveluikkunoiden fokus ja vierityksen palautus sekä 123 kunnan varmennetut seniorilinkit on toteutettu. Julkaisuportin lopullinen automaattinen linkkitarkistus ja näppäimistöpolku ovat avoinna.

## Emoji- ja kuvakelinjaus

Nykyiset kategoriaemojit ovat lähdekoodissa Unicode-merkkeinä. Sivusto ei jaa omia Apple-, Microsoft- tai Google-emoji-kuvatiedostoja, vaan selain ja käyttöjärjestelmä piirtävät merkit käyttäjän laitteella. Tämän vuoksi ulkoasu voi vaihdella laitteittain.

- Käyttöliittymän toiminnalliset kuvakkeet, kuten haku ja mikrofoni, piirretään jatkossa omilla yksinkertaisilla SVG-kuvakkeilla.
- Emoji säilytetään vain sisältöä tukevana, koristeellisena tunnisteena ja piilotetaan ruudunlukijalta, jos sama tieto lukee tekstinä.
- Jos kategoriaemojien pitää näyttää kaikilla laitteilla täsmälleen samoilta, ne korvataan ennen julkaisua yhdellä dokumentoidulla avoimen lähdekoodin kuvakekirjastolla.

Lisenssiviitteet:

- DM Sans: https://github.com/googlefonts/dm-fonts (SIL Open Font License).
- Unicode-emojien kuvat ja oikeudet: https://unicode.org/emoji/images.html. Sivusto käyttää merkkejä, ei Unicode-sivuston tai laitevalmistajien kuvatiedostoja.

## Aikataulu julkaisuun 3.9.2026

- **12.–14.8.** Typografia, kellon aikamuoto, hakujen nimeäminen, haku- ja mikrofonipainikkeet.
- **17.–21.8.** Kategorioiden nimeämis- ja sisältöauditointi sekä nimetyt paikallislinkit.
- **24.–28.8.** Vähintään viisi uutta senioritestausta kahdella oletusnäkymällä.
- **31.8.–1.9.** Testipalautteen kiireelliset korjaukset, näppäimistö- ja saavutettavuustestit sekä linkkiraportti.
- **2.9.** Sisältöjäädytys ja julkaise/älä julkaise -päätös.
- **3.9.** Rajattu julkaisu osoitteessa `seniorsurf.fi/aloitussivu` ja ensimmäisen viikon seurannan käynnistys.

## Julkaisuportti

Julkaisu voidaan tehdä 3.9., kun:

- neljän palautekokonaisuuden kriittiset korjaukset on tehty tai rajattu näkyvästi jatkokehitykseen;
- oletusnäkymä on valittu lisätestauksen perusteella;
- sivu toimii puhelimella, tietokoneella, näppäimistöllä ja suurimmalla tekstikoolla;
- nimetyt paikallislinkit ja tärkeimmät palvelulinkit on tarkistettu;
- avoimet estävät virheet, omistajat ja julkaisuun kuulumattomat toiminnot on kirjattu.
