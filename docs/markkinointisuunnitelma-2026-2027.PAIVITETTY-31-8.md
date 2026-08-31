# Seniorin aloitussivu — markkinointisuunnitelma 2026–2027

Laadittu: 28.8.2026
Päivitetty: 31.8.2026 (tilannetarkistus repositoriosta ja tuotannosta)
Täydentää: `docs/lanseerausteksti-2026-09.md` (valmiit tekstit A–D), `docs/rel11-pehmea-avaus-2026-08-28.md`
Mittarit: `docs/codex-tehtava-kayttotilastot-ja-aloitussivuksi-asetus.md`
Julkaisuportin tila: `TODO_HUMAN.md`, `docs/julkaisupaivakirja-2026-09.md`

## 1. Lähtökohta

Lanseeraustekstit ovat valmiina. Tämä dokumentti vastaa siihen, mitä julkaisupäivän jälkeen tapahtuu: miten digiopastajat pidetään mukana kuukausitasolla, miten 9.9. avautuva Juttunetti hyödynnetään, ja miten tavoitetaan se kohderyhmä, jota SeniorSurf ei tavoita omilla kanavillaan — ikääntyneen aikuiset lapset ja lapsenlapset.

Kasvun pullonkaula ei ole tunnettuus vaan **asettaminen**. Sivu tuottaa arvoa vasta kun se on jonkun selaimen aloitussivuna. Jokainen alla oleva toimenpide arvioidaan yhdellä kysymyksellä: *saako tämä jonkun tekemään sen asetuksen jonkun toisen puolesta tai itselleen?*

## 1.1 Tilanne 31.8.2026

Tarkistettu repositoriosta ja elävästä tuotannosta 31.8.2026.

| Asia | Tila |
| --- | --- |
| Palvelu tuotannossa osoitteessa `seniorsurf.fi/aloitus` | Kyllä. Pehmeä avaus hyväksyttiin 28.8. klo 11.36, tuotannossa on versio 0.77.9. |
| Laajan tiedotuksen GO | **Ei vielä.** NO-GO on voimassa, kunnes WordPress-painikkeen P1-virhe on korjattu, tietosuojaselosteen kolmannen osapuolen täydennys (KO-01) tehty ja loppuportti hyväksytty. |
| `?src=`-parametri | **Toteutettu.** Selain lukee ja poistaa parametrin (`usageTracking.ts`), ja selain sekä palvelin tuntevat kaikki luvun 6 kaksitoista kanavaa. Palvelin tallentaa tuntemattomat arvot selaimen lähettämään `other`-varmistusluokkaan. |
| A5-kortti opastajille | Taitettu 28.8. (`docs/a5-kortti-aloitussivu.pdf`). Painatusta ei ole tilattu, eikä kortin osoitteessa ole `?src=`-parametria. |
| A4 läheisille | Ei aloitettu. |
| Juttunetin vastavuoroiset linkit ja videoryhmä | Ei kirjattu sovituksi. |
| Kuukausirytmi opastajien kirjeessä | Ei vielä kirjeen vakiorakenteessa. |

Kaksi julkaisuestettä koskee tätä suunnitelmaa suoraan:

1. **WordPressin esittelysivun painike on rikki.** Osoitteessa `https://seniorsurf.fi/aloitussivu/` oleva *Avaa Seniorin aloitussivu* -painike on yhä 31.8. `<a>`-elementti ilman `href`-osoitetta. Se ei toimi linkkinä eikä näy linkkinä ruudunlukijalle. Yksikään tiedote, kirje tai kortti ei saa ohjata tuolle sivulle ennen korjausta.
2. **Tietosuojaselosteesta puuttuvat kolmannen osapuolen palvelut.** Täydennys (KO-01) on ehto laajalle tiedotukselle, ei julkaisulle.

Kumpikaan este ei estä pehmeän avauksen jatkamista eikä opastajien ennakkotietoa. Molemmat estävät vaiheen 1 laajan lähetyksen.

## 2. Kolme yleisöä, kolme eri lupausta

Sama sivu, mutta sama viesti ei toimi kaikille.

| Yleisö | Mitä he haluavat | Lupaus |
| --- | --- | --- |
| Digiopastaja | Että opastus jää päälle kun hän lähtee pois | "Yksi osoite jää opastettavalle käteen." |
| Ikääntynyt itse | Ettei tarvitse muistaa eikä pelätä | "Mistä lähden liikkeelle." |
| Läheinen (lapsi, lapsenlapsi) | Vähemmän huolta ja vähemmän tukipuheluita | "Vartti, ja isän netti on turvallisempi." |

**Läheisen motiivia ei saa arvata väärin.** Aikuinen lapsi ei innostu digiosallisuudesta. Häntä liikuttaa kaksi asiaa: pelko siitä, että vanhempi joutuu huijatuksi, ja väsymys siihen että hän on suvun oma it-tuki. Molempiin tämä sivu vastaa konkreettisesti. Viestin kärki läheisille on siis **turvallisuus ja oma helpotus**, ei ikääntyneen osallisuus.

Eettinen rajaus: ei syyllistämistä. Ei "etkö välitä vanhemmastasi" -kulmaa missään muodossa. Kulma on "tämä on helppo, tee se kerralla".

## 3. Vaiheet

### Vaihe 0 — Pehmeä avaus (28.8.–31.8.)

Toteutunut. Osoite oli rajatulla digiopastaja- ja testaajaryhmällä, ei julkista tiedotusta. Tuotantoavaus hyväksyttiin 28.8., ja tuotantoversio on ehtinyt 0.77.8:aan. Vaiheen tavoite — ensimmäiset havainnot ja Eeron video — jatkuu, koska vaihe 1 ei ala ennen porttia.

### Vaihe 1 — Digiopastajat (1.9.–8.9., ehdollinen)

Valmiit tekstit A–D lähtevät vasta kun loppuportti on hyväksytty. Jos portti ei aukea 1.9., koko vaihe siirtyy kokonaisuutena eikä sitä lähetetä osittain: opastajille menevä kirje on kertaluontoinen, eikä sitä kannata polttaa keskeneräiseen tilanteeseen. Takaraja on 3.9. Lisäksi:

- **Ennakkotieto opastajille jo 31.8.** Opastaja ei saa kuulla asiasta opastettavalta.
- **Painettu A5-kortti opastajille.** Osoite isolla, QR-koodi, tyhjä rivi johon opastaja kirjoittaa opastettavan kotikunnan. Opastaja antaa kortin opastettavalle tilanteen lopussa. Tämä on suunnitelman tärkein yksittäinen fyysinen esine: tällä hetkellä opastettava lähtee opastuksesta tyhjin käsin.
  *Tila 31.8.:* kortti on taitettu, painatusta ei ole tilattu. **Ennen painatusta:** kortin QR-koodin on osoitettava osoitteeseen `seniorsurf.fi/aloitus/?src=opastus`. Painettuun korttiin ei voi lisätä parametria jälkikäteen, ja ilman sitä koko opastuskanavan tulos jää mittauksen ulkopuolelle.
- **Opastajan muistilista opastustilanteeseen:** aseta aloitussivuksi → valitse kotikunta → säädä tekstikoko → tallenna 2–3 suosikkia. Neljä askelta, ei enempää.

### Vaihe 2 — Juttunetti (9.9. alkaen)

Juttunetti avautuu 9.9.2026: VTKL:n eläkeikäisten kohtaamispaikka, päivittäiset ohjatut videoryhmät ja moderoitu keskustelufoorumi, La Carita -säätiön rahoittama, rakennettu 58 iäkkään kanssa 13 keskusteluryhmässä.

**Periaate: aloitussivu ei kilpaile Juttunetin avauksesta, se palvelee sitä.** 9.9. viikolla ei lähetetä yhtään aloitussivun omaa tiedotetta. Aloitussivu tulee mukaan Juttunetin sisällä.

- **Vastavuoroiset linkit.** Aloitussivulle Juttunetti-nosto omaan kohtaansa; Juttunettiin aloitussivu palveluna, ei uutisena.
- **Videoryhmä lokakuussa: "Näin teet netistä omannäköisen".** 30 minuuttia, vetäjänä vertaisopastaja eikä Eero. Osallistujat asettavat aloitussivun yhdessä ryhmän aikana. Tämä on paras yksittäinen konversiotilanne koko suunnitelmassa: ihmiset ovat jo koneella, jo verkossa ja jo ohjatussa tilanteessa.
- **Foorumiketju "Mitä puuttuu omasta kunnastasi?"** Palvelee sekä yhteisöä että linkkiaineiston täydentämistä. Juttunetin käyttäjät ovat täsmälleen se joukko, joka osaa kertoa mitä oman kunnan sivulta puuttuu.
- Juttunetin käyttäjä on jo ylittänyt korkeamman kynnyksen kuin aloitussivun asettaminen. Konversio-odotus on siksi selvästi korkeampi kuin muissa kanavissa.

### Vaihe 3 — Läheiset (lokakuu 2026 – tammikuu 2027)

Kaksi luontaista huippua: **Vanhustenviikko 5.–11.10.2026** ja **joulu**.

Vanhustenviikon 2026 teema on *Arjen kohtaamiset*, ja valtakunnallinen vanhustenpäivän pääjuhla on sunnuntaina 4.10. Joensuussa. Teema sopii tähän suunnitelmaan poikkeuksellisen hyvin: aloitussivun asettaminen toisen puolesta on juuri sellainen arjen kohtaaminen, jossa toinen ihminen tekee jotain konkreettista. A4:n on siksi oltava valmis viimeistään 28.9., jotta se ehtii viikon materiaaleihin.

Joulu on tämän suunnitelman tärkein ajankohta, ja syy on käytännöllinen: se on vuoden ainoa hetki, jolloin aikuinen lapsi on fyysisesti vanhempansa kotona ja vanhemman tietokone on samassa huoneessa. Kampanja ajetaan **11.–30.12.** ja kärki on "tee se nyt kun olet siellä".

## 4. Miten läheiset tavoitetaan

SeniorSurfin omat kanavat eivät tavoita heitä. Tarvitaan kanavia, joissa 45–65-vuotias jo on.

### 4.1 Yksi esine, joka kulkee kaikkialle

**Tulostettava A4: "Näin asetat läheisellesi aloitussivun — 15 minuuttia."** Sisältö: neljä numeroitua askelta, iso osoite, QR-koodi, ja alareunassa muistilista siitä mitä muuta samalla kannattaa säätää. Toimii mustavalkoisena.

Sama tiedosto menee pankin konttorin pöydälle, kirjaston ilmoitustaululle, työpaikan intraan, partiolippukunnan tehtäväpakettiin ja jouluksi kotiin. Yksi tiedosto, kaikki kanavat. Sama sisältö tulee myös sovelluksen omaan "lähetän ohjeen hänelle" -polkuun.

### 4.2 Työpaikat — aliarvioitu ja ilmainen kanava

Ikääntyneen lapsi on työikäinen. Työnantajien työhyvinvointi- ja henkilöstökirjeet käsittelevät jo omaishoitoa ja läheisen auttamista.

- Valmis, brändäämätön yhden sivun materiaali, jonka mikä tahansa työnantaja voi liittää henkilöstökirjeeseen sellaisenaan.
- Tarjotaan ensin suurille julkisen sektorin työnantajille ja VTKL:n jäsenjärjestöille. Kynnys on matala, koska materiaali on valmis eikä maksa mitään.
- Mittaus: `?src=tyopaikka`.

### 4.3 Media — kärki on huijaukset, ei aloitussivu

"Aloitussivu senioreille" ei ole juttu. **"Näin suojaat vanhempasi nettihuijauksilta"** on juttu, ja aloitussivu on siinä ratkaisun osa.

- Palvelujournalismi: iltapäivälehtien ja aikakauslehtien digi- ja elämäntapatoimitukset, Yle Akuutti -tyyppiset ohjelmat.
- Kulma: Kyberturvallisuuskeskuksen varoitukset selkokielellä suoraan sen ihmisen ruudulla, jota ne koskevat.
- Asiantuntijahaastattelu VTKL:stä, ei tuote-esittely.

### 4.4 Pankit, apteekit, kirjastot

Pankeilla on oma taloudellinen intressi vähentää huijaustappioita ja valmiit senioripalvelut. Tarjotaan A4:ää konttoreihin ja senioriltapäiviin. Kirjastot ovat jo digiopastuksen paikka. Apteekit tavoittavat sekä ikääntyneen että hänen asiointiapunsa.

Mittaus: `?src=pankki`, `?src=kirjasto`.

### 4.5 Järjestöt, joiden yleisö on nimenomaan läheinen

Omaishoitajaliitto, Muistiliitto ja eläkeläisjärjestöjen paikallisyhdistykset. Muistiliiton yleisölle sivun arvo on erityinen: kun muisti heikkenee, yksi tuttu aloitusnäkymä on merkittävästi helpompi kuin monta osoitetta.

### 4.6 Lapsenlapset — anna tehtävä, älä tee sisältöä

15–30-vuotiaita ei tavoiteta VTKL:n kanavista, eikä VTKL:n kannata yrittää tehdä heille sisältöä sosiaaliseen mediaan. Toimiva muoto on **tehtäväkortti**, ei viesti.

- **"Tee mummolle aloitussivu" -tehtäväkortti** kouluille, partiolippukunnille, 4H-kerhoille ja seurakuntien nuorisotyölle. Yksi A4, selkeä tehtävä, tehtävissä 20 minuutissa, sopii sekä kouluvierailuun että itsenäiseksi tehtäväksi.
- Kouluissa on jo sukupolvien välistä digiopastusta. Tämä antaa siihen valmiin sisällön, jota opettajan ei tarvitse itse keksiä.
- Partio on tässä luonteva kumppani ja Eerolla on siihen suora tuntuma.
- Ei TikTok-tuotantoa. Nuori ei jaa järjestön videota, mutta hän tekee annetun tehtävän.

## 5. Digiopastajien pitäminen mukana — kuukausirytmi

Kertalanseeraus ei riitä. Toistuva rakenne digiopastajien kuukausikirjeeseen, korkeintaan kolme riviä kerrallaan:

1. **Kuukauden linkkivinkki** — yksi sivulla oleva palvelu, jota harva tuntee.
2. **"Teidän ehdotuksestanne lisätty"** — luettelo kunnista ja palveluista, jotka on lisätty opastajien ilmoitusten perusteella edellisen kuukauden aikana.

Kohta 2 on suunnitelman halvin ja tehokkain yksittäinen keino. Kun opastaja ilmoittaa puuttuvan linkin ja näkee sen sivulla viikon päästä omalla nimellään mainittuna, hän siirtyy käyttäjästä puolestapuhujaksi. Sama palaute parantaa tuotetta. Tavoite: **vastaus jokaiseen linkki-ilmoitukseen 7 vuorokaudessa.**

Lisäksi:

- 20 minuutin osuus olemassa oleviin opastajawebinaareihin. Ei uutta webinaaria.
- A5-korttien täydennystilaus ilman kysymyksiä.
- Kerran vuodessa: opastajien oma kysely siitä, mitä sivulta puuttuu.

### 5.1 Kirjeen linkki — tarkistettu 31.8.2026

Digiopastajien uutiskirjeessä linkin kohde on

`https://seniorsurf.fi/aloitus/?src=kirje`

- **Ei `seniorsurf.fi/aloitussivu/`.** Se on WordPressin esittelysivu, jonka *Avaa Seniorin aloitussivu* -painike on 31.8. rikki. Kirjeen linkin on vietävä suoraan palveluun, ei esittelysivun kautta.
- `?src=kirje` on palvelimen sallimien arvojen joukossa, joten se kirjautuu oikein omana kanavanaan. Tarkistettu 31.8. sekä koodista että elävästä tuotannosta.
- Selain poistaa parametrin osoiteriviltä heti latauksen jälkeen. Lukija näkee siis siistin osoitteen ja voi tallentaa sen aloitussivukseen ilman kampanjaparametria — tämä on tärkeää juuri opastajien kirjeessä, koska sen lukija asettaa osoitteen eteenpäin toisen koneelle.
- Osoite toimii sekä kauttaviivalla että ilman.
- **Yleissääntö kaikkiin kanaviin:** näkyvä teksti on lyhyt `seniorsurf.fi/aloitus`, linkin kohde on parametrillinen osoite. Näin lukija näkee muistettavan osoitteen ja mittaus saa silti kanavatiedon.

## 6. Mittarointi kanavittain

Kaikki kampanjalinkit `?src=`-parametrilla.

`src` tarkoittaa aina kanavaa, ei linkin tai materiaalin muotoa. Sallitut kanavat ovat samassa järjestyksessä selaimessa ja palvelimella: `opastus`, `kirje`, `some`, `esite`, `lehti`, `esittely`, `vtkl`, `juttunetti`, `tyopaikka`, `pankki`, `kirjasto`, `koulu`. Palvelin hyväksyy lisäksi varmistusarvon `other`, joksi selain muuttaa tuntemattomat arvot; sitä ei kirjoiteta kampanjalinkkeihin. QR-koodi on linkin esitysmuoto, joten `qr` ei ole sallittu `src`-arvo. Esimerkiksi opastuskortin QR-linkki käyttää arvoa `?src=opastus`.

Seurattavat luvut kuukausittain:

| Mittari | Mitä se kertoo |
| --- | --- |
| Suorien avausten osuus | Tottumuskäytön kasvu — tärkein yksittäinen luku |
| `guideDone / guideOpened` | Toimiiko asetusohje |
| Jakotoiminnon käyttö | Toimiiko läheispolku |
| `src`-jakauma | Mikä kanava tuottaa, mikä ei |
| Linkki-ilmoitusten määrä | Opastajayhteisön aktiivisuus |
| Avaukset per päivä | Kokonaiskehitys |

Tavoitetasot: 3 kk 100 avausta/pv, 12 kk 500–1 000/pv, 3 v 3 000/pv. Viimeinen vastaa noin yhtä prosenttia Suomen verkossa olevista senioreista.

## 7. Aikataulu tiivistettynä

| Aika | Toimenpide |
| --- | --- |
| 31.8. | WordPress-painikkeen korjaus, loppuportti; ennakkotieto digiopastajille |
| 1.9. | Julkaisu ja tekstit A–D **jos portti on hyväksytty**; muuten siirto, takaraja 3.9. |
| ennen painatusta | `?src=opastus` A5-kortin QR-koodiin |
| 1.–8.9. | Some, A5-kortit opastajille |
| ennen 9.9. | Juttunetin vastavuoroiset linkit ja lokakuun videoryhmä sovittava |
| 9.9. | Juttunetin avaus — ei omaa tiedotusta |
| syyskuu | Kuukausirytmi käyntiin opastajien kirjeessä |
| 28.9. | A4 valmiina Vanhustenviikon materiaaleihin |
| 5.–11.10. | Vanhustenviikko, teema *Arjen kohtaamiset* |
| lokakuu | Juttunetin videoryhmä; A4 pankkeihin ja kirjastoihin |
| loka–marraskuu | Työpaikkakanava, mediakulma huijaukset |
| 11.–30.12. | Joulukampanja: "tee se nyt kun olet siellä" |
| tammikuu 2027 | Ensimmäinen kanavakohtainen tulosarvio `src`-datasta |

## 8. Riskit

1. **9.9. resurssikollisio.** Juttunetin avaus vie VTKL:n viestinnän huomion. Ratkaisu: aloitussivun oma tiedotus pidetään pois tuolta viikolta tarkoituksella.
2. **Kanavien vaihtelevat kunta-aineistot.** Jos kampanja tuo käyttäjiä kunnasta, jonka linkit ovat ohuet, ensivaikutelma kärsii. Tarkista kattavuus ennen alueellista kampanjaa.
3. **Yhden tekijän riski.** Kaikki materiaalit tehdään niin, että ne toimivat ilman Eeroa: valmis A4, valmis A5, valmis webinaariosuus.
4. **Läheisviestin sävy.** Syyllistävä kulma kääntyy järjestöä vastaan. Sävy tarkistetaan jokaisesta läheisille suunnatusta tekstistä erikseen.
5. **Väärä osoite viestinnässä.** Palvelulla on kaksi lähes samannimistä osoitetta: `/aloitus/` on itse palvelu ja `/aloitussivu/` on WordPressin esittelysivu, jonka painike on tällä hetkellä rikki. Sekaannus vie lukijan umpikujaan juuri siinä hetkessä, kun hän on valmis toimimaan. Jokaisen ulos lähtevän linkin kohde tarkistetaan ennen lähetystä.

## 9. Tehtävät ja niiden tila 31.8.2026

1. **A5-kortti opastajille — taitto tehty 28.8., painatus tilaamatta.** Ennen tilausta: lisää `?src=opastus` kortin QR-koodiin.
2. **A4 "Näin asetat läheisellesi aloitussivun" — ei aloitettu.** Määräpäivä 28.9., jotta se ehtii Vanhustenviikkoon 5.–11.10.
3. **Juttunetin vastavuoroiset linkit ja lokakuun videoryhmä — avoinna.** Sovittava ennen 9.9.; avausviikon jälkeen ehdotus kilpailee jo muun sisällön kanssa.
4. **Kuukausirytmin kaksi kohtaa opastajien kirjeeseen — avoinna.** Konkreettisesti: *Kuukauden linkkivinkki* ja *Teidän ehdotuksestanne lisätty* kirjeen vakiorakenteeseen, ei kertaluontoisina nostoina.
5. **`?src=`-parametri ja kanavalista — toteutettu 31.8.** Jäljellä on lisätä `?src=opastus` A5-kortin QR-koodiin ennen painatusta.
6. **Uusi: korjaa `seniorsurf.fi/aloitussivu/` -sivun painikkeen `href`.** Tämä estää tällä hetkellä laajan tiedotuksen ja on estelistan ainoa kohta, joka on kokonaan VTKL:n omassa hallinnassa.
