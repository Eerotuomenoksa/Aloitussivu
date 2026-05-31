# Saavutettavuus- ja tietosuojasivujen suunnitelma

Päivitetty: 31.5.2026

Tämä dokumentti suunnittelee kaksi julkista lisäsivua SeniorSurfin aloitussivulle:

- `saavutettavuus.html`
- `tietosuoja.html`

Sivujen tavoite on lisätä luottamusta, kertoa käyttäjälle ymmärrettävästi mitä sivusto tekee ja tukea myöhempää julkaisua esimerkiksi SeniorSurfin tai Cloudcityn alla.

## Yhteinen sivumalli

Molemmat sivut tehdään samalla rauhallisella tekstisivumallilla kuin `sivua-tukemassa.html`.

Yhteiset osat:

- ylälinkit: `Takaisin aloitussivulle`, `Tietosuoja`, `Saavutettavuus`, `Sivua tukemassa`
- leveys: sama `max-w-6xl`
- otsikko ja lyhyt ingressi
- sisällysluettelo sivun ankkureihin
- selkeät osiot, ei raskasta lakitekstiseinää
- lopussa päivämäärä ja yhteydenottotapa

Footer-linkkeihin lisätään:

- `Tietosuoja`
- `Saavutettavuus`

## 1. Tietosuojasivu

### Sivun tarkoitus

Tietosuojasivun pitää vastata tavalliselle käyttäjälle:

- mitä tietoja sivu käsittelee
- mitä ei kerätä
- miksi paikallistallennusta käytetään
- miten käyttötilasto toimii
- mitä tapahtuu, jos käyttäjä lähettää linkki-ilmoituksen
- missä ulkopuolisia palveluja käytetään
- miten käyttäjä voi pyytää lisätietoa

### Pääviesti

SeniorSurfin aloitussivu on rakennettu niin, että sitä voi käyttää ilman kirjautumista ja ilman evästeisiin perustuvaa seurantaa. Sivusto tallentaa käyttäjän omia asetuksia vain käyttäjän omaan selaimeen.

### Ehdotettu rakenne

1. Mitä tämä sivu kertoo
2. Mitä tietoja käsitellään
3. Mitä ei kerätä
4. Selaimeen tallennettavat asetukset
5. Karkea käyttötilasto
6. Linkki-ilmoitukset ja ylläpito
7. Tekoälyavustaja ja ulkopuoliset palvelut
8. Paikalliset palvelut ja sää
9. Ylläpitäjän kirjautuminen
10. Tietojen säilytys ja poistaminen
11. Yhteydenotto

### Luonnosteksti

#### Mitä tämä sivu kertoo

Tämä tietosuojasivu kertoo, mitä tietoja SeniorSurfin aloitussivu käsittelee ja mihin tarkoitukseen. Sivun tarkoitus on olla selkeä myös käyttäjälle, joka ei tunne tietosuojatermejä.

#### Mitä tietoja käsitellään

Sivustolla voidaan käsitellä seuraavia tietoja:

- käyttäjän valitsema paikkakunta
- käyttäjän suosikit
- tekstikoko, väriteema ja näkyvien osioiden asetukset
- karkea käyttötilasto sivulatauksista ja linkkien klikkauksista
- käyttäjän lähettämä linkki-ilmoitus, jos käyttäjä itse täyttää lomakkeen
- ylläpitäjän Google-kirjautumistieto ylläpitonäkymässä

#### Mitä ei kerätä

Sivusto ei käytä:

- evästeisiin perustuvaa käyttäjäseurantaa
- mainosseurantaa
- käyttäjätunnisteita tavalliselle käyttäjälle
- selaimen sormenjälkeä
- IP-osoitteen tallennusta käyttötilastoon
- tarkkaa sijaintihistoriaa

Sivustoa voi käyttää ilman kirjautumista.

#### Selaimeen tallennettavat asetukset

Osa asetuksista tallennetaan käyttäjän omaan selaimeen, jotta sivu muistaa käyttäjän valinnat.

Näitä voivat olla:

- suosikit
- valittu paikkakunta
- tekstikoko
- tumma tai vaalea tila
- näkyvät osiot
- onko esittelykierros jo nähty
- toisen kellon aikavyöhyke

Nämä tiedot eivät muodosta palvelimella käyttäjäprofiilia. Käyttäjä voi poistaa ne tyhjentämällä selaimen sivustotiedot.

#### Karkea käyttötilasto

Sivustolla kerätään karkeaa käyttötilastoa palvelun kehittämiseksi.

Tilastoon voidaan tallentaa:

- sivulatausten määrä päiväkohtaisesti
- linkkiklikkausten määrä päiväkohtaisesti
- klikattujen linkkien osoite ja näkyvä nimi ylläpidon raportointia varten

Tilasto ei käytä evästeitä, käyttäjätunnisteita, selaimen sormenjälkeä eikä IP-osoitteen tallennusta. Cloud Function näkee HTTP-pyynnön teknisen IP-tiedon pyynnön käsittelyn aikana, mutta sitä ei kirjoiteta tietokantaan.

#### Linkki-ilmoitukset ja ylläpito

Käyttäjä voi ilmoittaa uuden linkin, rikkinäisen linkin tai väärään paikkaan vievän linkin. Lomakkeeseen tallennetaan vain käyttäjän itse antamat tiedot.

Ilmoituksiin voidaan tallentaa:

- linkin nimi
- osoite
- kategoria tai lähde, jos se on mukana
- käyttäjän kirjoittama lisähuomio
- ilmoituksen ajankohta
- ilmoituksen käsittelytila

Linkki-ilmoituksia käytetään vain sivun ylläpitoon.

#### Tekoälyavustaja ja ulkopuoliset palvelut

Sivustolla voi olla tekoälyavustaja, joka vastaa käyttäjän kirjoittamaan tai sanelemaan kysymykseen. Käyttäjän ei pidä kirjoittaa avustajalle arkaluonteisia henkilötietoja, pankkitunnuksia, salasanoja tai terveystietoja.

Tekoälyavustajan tekninen toteutus voi käyttää ulkopuolista tekoälypalvelua. Kysymys lähetetään käsiteltäväksi vain silloin, kun käyttäjä käyttää avustajaa.

#### Paikalliset palvelut ja sää

Paikallisia palveluja voidaan näyttää käyttäjän valitseman tai selaimen paikantaman paikkakunnan perusteella. Paikkakunnan voi vaihtaa käsin.

Sääkortti käyttää säätietoa tarjoavaa ulkopuolista rajapintaa. Sää haetaan paikkakunnan koordinaattien perusteella. Tarkkaa käyttäjäprofiilia ei tallenneta.

#### Ylläpitäjän kirjautuminen

Ylläpitonäkymä on rajattu ylläpitäjille. Ylläpitäjä kirjautuu Google-tunnuksella. Tavallinen käyttäjä ei tarvitse kirjautumista.

#### Tietojen säilytys ja poistaminen

Selaimeen tallennetut asetukset säilyvät käyttäjän omalla laitteella, kunnes käyttäjä poistaa sivuston tiedot tai vaihtaa selainta.

Ylläpidon tiedot, kuten linkki-ilmoitukset ja käyttötilastot, säilytetään niin kauan kuin niitä tarvitaan sivun ylläpitoon ja kehittämiseen.

#### Yhteydenotto

Tietosuojaan liittyvät kysymykset ohjataan sivun ylläpidolle tai Vanhustyön keskusliiton sovittuun yhteyshenkilöön. Lopullinen yhteystieto lisätään ennen julkaisua.

## 2. Saavutettavuussivu

### Saavutettavuustestaus 31.5.2026

Tarkistus tehtiin paikallisessa kehitysympäristössä osoitteessa `http://localhost:5173/`.

Tarkistetut sivut:

- `index.html`
- `linkit.html`
- `sivua-tukemassa.html`
- `ehdotukset.html`
- `muutosloki.html`

Tarkistusmenetelmä:

- selaimen DOM-rakenteen automaattinen tarkistus
- otsikkorakenteen tarkistus
- `html lang`-, `title`-, `main`- ja `h1`-rakenteiden tarkistus
- linkkien, painikkeiden, kuvien ja lomakekenttien nimien tarkistus
- duplikaatti-id:iden tarkistus
- kosketuskohteiden koon suuntaa-antava tarkistus
- dialogien ja asetusten ARIA-rakenteen koodikatselmus

Tarkistuksen positiiviset havainnot:

- kaikilla tarkistetuilla sivuilla on suomenkielinen `lang="fi"`
- kaikilla tarkistetuilla sivuilla on sivun otsikko (`title`)
- kaikilla tarkistetuilla sivuilla on yksi `h1`
- aloitussivulla on pääsisältöön hyppäämisen linkki
- aloitussivulla on yksi `main`-alue
- näkyvillä painikkeilla ja lomakekentillä on pääosin selkeät nimet tai `aria-label`-tekstit
- kuvilla, joita tarkistuksessa löytyi, oli alt-tekstit
- duplikaatti-id:itä ei löytynyt tarkistetuista näkymistä
- ylläpidon `ehdotukset.html`-sivun perusrakenne oli automaattisessa tarkistuksessa siisti
- `muutosloki.html`-sivun perusrakenne oli automaattisessa tarkistuksessa siisti

Tarkistuksessa tunnistetut puutteet ja jatkotarkistukset:

- kaikkien modaalien fokuslukitus, Escape-sulku ja fokuksen palautus pitää testata käsin ruudunlukijan ja näppäimistön kanssa
- kontrasti näyttää pääosin vahvalta, mutta automaattinen kontrastitarkistus ei anna luotettavaa tulosta gradientti- ja kuvataustoissa; kontrasti pitää tarkistaa vielä käsin pääkomponenteista
- puhehaku, tekoälyavustaja, sää, paikalliset palvelut ja ulkopuoliset linkit voivat toimia eri tavoin eri selaimissa, eikä niitä pidä selosteessa kuvata täysin saavutettaviksi ennen käyttäjätestausta

Korjattu jatkotyössä 31.5.2026:

- aloitussivun säätieto muutettiin pois otsikkotasosta, jolloin otsikkorakenne ei enää hyppää `h1`-tasosta `h3`-tasoon
- aloitussivun asetuspaneeli muutettiin valikkoroolista dialogimaiseksi kontrollialueeksi, ja `aria-controls` näytetään vain paneelin ollessa auki
- asetuspaneelin Escape-sulku ja sulkupainike palauttavat fokuksen asetuspainikkeeseen
- `linkit.html` sai ohituslinkin valitun linkkilistan yli
- linkkiluettelon URL-linkkien kosketusalueita kasvatettiin
- tekstisivujen ylälinkkien kosketusalueita kasvatettiin
- kuvalinkeille lisättiin selkeä linkin nimi

Johtopäätös:

Sivusto on saavutettavuuden kannalta hyvällä pilottitasolla: rakenne, suuret painikkeet, tekstikoon säätö ja selkeät nimet tukevat kohderyhmää. Viralliseen saavutettavuusselosteeseen kannattaa kuitenkin kirjata, että palvelu on vielä osittain kehitysvaiheessa ja että ruudunlukija-, näppäimistö- ja kontrastitestausta täydennetään ennen laajempaa julkaisua.

### Sivun tarkoitus

Saavutettavuussivun pitää kertoa:

- mihin saavutettavuudessa pyritään
- mitä käyttäjä voi itse säätää
- mitkä ovat tunnetut puutteet
- miten palautetta voi antaa
- milloin sivu on viimeksi tarkistettu

### Pääviesti

SeniorSurfin aloitussivu on suunniteltu ikääntyneille käyttäjille: isot painikkeet, selkeä rakenne, tekstikoon säätö ja rauhallinen näkymä ovat osa palvelun ydintä. Saavutettavuus ei ole erillinen lisä, vaan sivun peruslähtökohta.

### Ehdotettu rakenne

1. Saavutettavuusselosteen tarkoitus
2. Palvelun saavutettavuuden tila
3. Saavutettavuuden tavoite
4. Käyttäjän omat asetukset
5. Mitä olemme huomioineet
6. Tunnetut puutteet
7. Miten saavutettavuutta on testattu
8. Palaute ja yhteydenotto
9. Selosteen päivitys

### Luonnosteksti

#### Saavutettavuusselosteen tarkoitus

Tämä saavutettavuusseloste koskee SeniorSurfin aloitussivua. Seloste kertoo, miten saavutettavuus on huomioitu, mitä puutteita on tunnistettu ja miten käyttäjä voi antaa palautetta.

Seloste on laadittu kehitysvaiheen tarkistuksen perusteella. Sitä päivitetään ennen laajempaa julkaisua, kun näppäimistö-, kontrasti- ja ruudunlukijatestausta on täydennetty.

#### Palvelun saavutettavuuden tila

SeniorSurfin aloitussivu täyttää saavutettavuuden tavoitteet osittain.

Sivustolla on jo paljon saavutettavuutta tukevia ratkaisuja, kuten suuret painikkeet, selkeä rakenne, tekstikoon säätö, pääsisältöön hyppäämisen linkki ja kuvaavat nimet painikkeille. Kaikkia kohtia ei ole kuitenkaan vielä testattu riittävän kattavasti ruudunlukijalla ja pelkällä näppäimistöllä.

#### Saavutettavuuden tavoite

SeniorSurfin aloitussivun tavoitteena on olla mahdollisimman helppo käyttää myös silloin, kun näkö, motoriikka, muisti tai digitaidot aiheuttavat haasteita.

Sivusto pyrkii tukemaan erityisesti:

- suurta ja selkeää tekstiä
- isoja painikkeita
- rauhallista visuaalista rakennetta
- näppäimistökäyttöä
- ruudunlukijan ymmärrettävää rakennetta
- mahdollisuutta käyttää hakua ja avustajaa myös puheella, jos selain tukee sitä

#### Käyttäjän omat asetukset

Sivun asetuksista käyttäjä voi:

- suurentaa tai pienentää tekstin kokoa
- vaihtaa tumman ja vaalean tilan välillä
- piilottaa osioita, joita ei tarvitse
- näyttää tai piilottaa sääkortin, kellon, uutiset, huijausvaroitukset ja tekoälyavustajan
- valita toisen kellon aikavyöhykkeen

Nämä asetukset tallennetaan käyttäjän omaan selaimeen.

#### Mitä olemme huomioineet

Sivustolla on huomioitu:

- selkeä otsikkorakenne
- pääsisältöön hyppäämisen linkki
- suuret kosketusalueet
- korkea kontrasti päätoiminnoissa
- tekstikoon säätö
- modaalien Escape-sulkeminen niissä näkymissä, joissa se on toteutettu
- linkkien ja painikkeiden kuvaavat nimet
- sivuston esittelykierros uudelle käyttäjälle

#### Tunnetut puutteet

Sivusto on vielä kokeilu- ja kehitysvaiheessa. Tunnettuja tai tarkistettavia asioita:

- kaikkien modaalien fokuslukitus ja fokuksen palautus pitää varmistaa
- linkkiluettelosivu sisältää edelleen suuren määrän linkkejä, vaikka sivulle on lisätty haku, välilehdet ja ohituslinkki
- kaikkien kieliversioiden tekstit eivät ole yhtä viimeisteltyjä kuin suomi
- osa ulkopuolisista palveluista ei ole sivuston hallinnassa
- kartta-, sää-, tekoäly- ja puhetoiminnot voivat toimia eri tavoin eri selaimissa
- automaattista saavutettavuusauditointia ja käsin tehtyä ruudunlukijatestausta pitää vielä täydentää ennen laajaa julkaisua

#### Miten saavutettavuutta on testattu

Sivustolle on tehty kehitysvaiheen saavutettavuustarkistus 31.5.2026.

Tarkistuksessa käytiin läpi:

- aloitussivu
- linkkiluettelo
- sivun tukijat
- linkkiehdotusten ylläpitosivu
- muutosloki

Tarkistuksessa katsottiin muun muassa otsikkorakennetta, sivun kielimääritystä, pääsisältöä, painikkeiden ja linkkien nimiä, lomakekenttien nimiä, kuvien alt-tekstejä ja duplikaatti-id:itä.

Tarkistusta täydennetään ennen julkaisua:

- näppäimistötestauksella
- ruudunlukijatestauksella
- kontrastien käsintarkistuksella
- mobiilinäkymän testauksella
- käyttäjätestauksella digiopastajien ja ikääntyneiden käyttäjien kanssa

#### Palaute ja yhteydenotto

Sivua testataan digiopastajien ja käyttäjien kanssa. Palautteessa kannattaa kertoa:

- mikä kohta oli vaikea käyttää
- millä laitteella ja selaimella ongelma näkyi
- onnistuiko toiminto näppäimistöllä tai kosketuksella
- haittasiko ongelma sivun käyttöä vai oliko kyse pienemmästä häiriöstä

Saavutettavuuspalautteelle lisätään ennen julkaisua yhteydenottotapa. Vaihtoehdot:

- sähköpostiosoite
- lomake
- SeniorSurfin yleinen yhteydenottokanava

#### Selosteen päivitys

Selostetta päivitetään aina, kun palveluun tehdään saavutettavuuteen vaikuttavia muutoksia tai kun käyttäjätestauksessa löytyy uusia havaintoja.

## Toteutuksen tehtävälista

1. Luo `tietosuoja.html` ja `tietosuoja.tsx`.
2. Luo `saavutettavuus.html` ja `saavutettavuus.tsx`.
3. Lisää molemmat Viten sisääntulopisteisiin, jos nykyinen build tarvitsee erillisen HTML-tiedoston.
4. Lisää linkit footer-navigaatioon.
5. Lisää linkit `sivua-tukemassa.html`-sivun ylälinkkeihin.
6. Päivitä tietosuojatekstiin lopullinen rekisterinpitäjä ja yhteystieto.
7. Päivitä saavutettavuustekstiin lopullinen palautekanava.
8. Tarkista build.
9. Tarkista mobiilinäkymä ja näppäimistökäyttö.

## Avoimet päätökset

- Mikä on virallinen yhteystieto tietosuoja- ja saavutettavuuspalautteelle?
- Merkitäänkö rekisterinpitäjäksi Vanhustyön keskusliitto ry vai jokin SeniorSurf-kokonaisuuden nimetty taho?
- Halutaanko tietosuojasivulle lyhyt käyttäjäystävällinen versio ja sen alle tarkempi seloste?
- Tehdäänkö saavutettavuussivu virallisen saavutettavuusselosteen muotoon jo pilotissa vai vasta ennen varsinaista julkaisua?
