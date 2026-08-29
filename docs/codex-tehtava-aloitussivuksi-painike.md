# Codex-tehtävä: "Aseta aloitussivuksi" -painike ylätunnisteeseen

Laadittu: 28.8.2026
Tila: paikallinen sovellustoteutus valmis 29.8.2026, julkaisuportti kesken
Koskee: `App.tsx` (ylätunniste), `components/HomepageModal.tsx`, `components/InfoModal.tsx`, `i18n.tsx`
Liittyy: `docs/codex-tehtava-kayttotilastot-ja-aloitussivuksi-asetus.md`, `docs/a5-kortti-aloitussivu.pdf`

Toteutustarkistus 29.8.2026: tuotantobuild valmistuu, kaikki seitsemän kielipainiketta on tarkistettu ja näkymät on testattu leveyksillä 320, 360, 768, 1024 ja 1440 px. Ennen julkaisua tehdään vielä ihmisen ruudunlukija- ja kontrastikierros sekä luetutetaan uk-, et-, ru- ja se-käännökset. A5-kortin HTML-lähde on päivitetty, mutta PDF on muodostettava ja tarkistettava uudelleen ennen painamista.

## 1. Ongelma

Aloitussivuksi asettaminen on palvelun tärkein yksittäinen käyttäjätoiminto — sivu tuottaa arvoa vasta selaimen aloitussivuna. Nyt se on painikkeen takana, jonka teksti on **"🏠 Ohje"**. Painike ei kerro mitä se tekee, eikä kukaan avaa sitä arvatakseen.

Koodista löytyi kolme yhteenkuuluvaa havaintoa:

1. **Etiketti ei vastaa sisältöä.** Painike `App.tsx`:ssä käyttää avainta `help` (fi: "Ohje"), mutta modaalin otsikko on `homepageTitle` (fi: "Aseta Seniorin aloitussivu aloitussivuksi").
2. **Sisältö on osin päällekkäinen `InfoModal`in kanssa.** `HomepageModal` sisältää osiot "Mikä on Seniorin aloitussivu?" ja sivuston esittelyn käynnistyksen. `InfoModal` sisältää jo `infoWhatTitle`-osion ja saa `showOnboardingOffer`- ja `onStartOnboarding`-propsit, eli esittely tarjotaan jo siellä.
3. **Selainohjeet eivät näy mobiilissa lainkaan.** `HomepageModal`in ohjelohko on `className="mt-6 hidden space-y-12 md:block"`. Puhelimella käyttäjä näkee otsikon, osoitteen ja lakitiedot mutta ei yhtäkään ohjetta. Lisäksi ohjeet kattavat vain Chromen ja Edgen.

Havainto 3 on vakavampi kuin painikkeen teksti.

## 2. Päätöskohta Eerolle — ratkaise ennen toteutusta

**Vaihtoehto A (suositus): nimetään nykyinen painike uudelleen, ei lisätä uutta painiketta.**
Ylätunniste luetaan: `Palaute | Kieli | 🏠 Aseta aloitussivuksi | ℹ️ Tietoa | ⚙️`. Koska "Ohje"-painikkeen oma sisältö on jo `InfoModal`issa, erillistä ohjepainiketta ei jää kaipaamaan mikään. Painikkeiden määrä pysyy samana, ylätunniste ei ahtaudu ja jokainen painike kertoo mitä se tekee.

**Vaihtoehto B: lisätään uusi painike "Ohje"-painikkeen viereen.**
Ylätunnisteeseen tulee kuudes kontrolli. Kaksi vierekkäistä painiketta ("Aseta aloitussivuksi" ja "Ohje") avaavat lähes samaa sisältöä, mikä on kohderyhmälle sekavampaa kuin nykytila. Toteutetaan vain jos "Ohje"-painikkeelle keksitään oma, selvästi eri sisältö.

**Loput tästä dokumentista olettaa vaihtoehdon A.**

## 3. Muutos 1 — ylätunnisteen painike

Tiedosto `App.tsx`, nykyinen kultainen painike (`setIsHomepageOpen(true)`).

- Näkyvä teksti tulee uudesta avaimesta `setHomepageButton`, ei enää avaimesta `help`.
- **Responsiivinen etiketti**, koska ylätunniste on `lg:flex-nowrap` ja jotkin kielet ovat pitkiä:

```tsx
<span aria-hidden="true">🏠</span>
<span className="hidden sm:inline">{t('setHomepageButton')}</span>
<span className="sm:hidden">{t('setHomepageButtonShort')}</span>
```

- `aria-label` ja `title` käyttävät uutta avainta `setHomepageAria`, joka on täysi lause. Ruudunlukija saa siis aina koko merkityksen, vaikka näkyvä teksti olisi lyhyt muoto.
- Emoji `🏠` pysyy `aria-hidden="true"`, jottei ruudunlukija lue "talo".
- Painike säilyy kultaisena (`var(--theme-gold)`) — se on sivun ainoa ensisijainen toimintopainike, eikä toista kultaista painiketta saa lisätä.
- **Järjestys:** siirrä tämä painike ryhmän ensimmäiseksi, ennen Palautetta. Perustelu: vasemmalta oikealle luettaessa ensimmäisenä pitää olla tärkein toiminto, ei palautelomake. Tämä on halpa muutos ja se voidaan perua erikseen.
- Avainta `help` ei poisteta `i18n.tsx`:stä, koska sitä käytetään muualla. Tarkista käyttökohdat ennen poistoa.

## 4. Muutos 2 — käännökset seitsemälle kielelle

Lisää `i18n.tsx`:ään kaikkiin seitsemään kielilohkoon (`fi`, `sv`, `en`, `uk`, `et`, `ru`, `se`) kolme avainta. Kielilohko ei saa jäädä vajaaksi, koska puuttuva avain putoaa englanninkieliseen varatekstiin keskellä suomenkielistä käyttöliittymää.

| Kieli | `setHomepageButton` | `setHomepageButtonShort` | Varmuus |
| --- | --- | --- | --- |
| fi | Aseta aloitussivuksi | Aloitussivuksi | varma |
| sv | Ställ in som startsida | Som startsida | varma |
| en | Set as start page | Start page | varma |
| et | Määra avaleheks | Avaleheks | tarkistettava |
| uk | Зробити стартовою | Стартова | tarkistettava |
| ru | Сделать стартовой | Стартовая | tarkistettava |
| se | Bija álggahansiidun | Álggahansiidu | tarkistettava |

`setHomepageAria` on täysi lause, esimerkiksi fi: *"Aseta Seniorin aloitussivu selaimesi aloitussivuksi"*. Muodosta se kunkin kielen olemassa olevasta `homepageTitle`-käännöksestä, jotta sanasto pysyy yhtenäisenä.

**Pituussääntö:** `setHomepageButtonShort` saa olla enintään 14 merkkiä. Jos jokin käännös ylittää rajan, lyhennä sitä — älä anna ylätunnisteen rivittyä `lg`-koossa.

Merkinnällä *tarkistettava* olevat käännökset ovat konekäännöstasoisia ja ne on luetutettava kielitaitoisella ennen julkaisua. Repossa on jo tunnettu puute: uk-, et-, ru- ja se-versiot käyttävät osin englanninkielistä varatekstiä kesäkuun UI-uudistuksen jäljiltä. Älä laajenna tuota puutetta uusilla arvauksilla ilman merkintää.

## 5. Muutos 3 — modaalin siivous

`components/HomepageModal.tsx`:

- **Poista** osio `homepageWhatTitle` / `homepageWhatBody`. Sama asia on `InfoModal`in `infoWhatTitle`-osiossa.
- **Poista** osio `homepageTourTitle` / `homepageTourBody` / `homepageStartTour` ja propsi `onStartOnboarding`. Esittely tarjotaan jo `InfoModal`issa `showOnboardingOffer`-propsin kautta. Varmista ennen poistoa, että `InfoModal`in tarjous näkyy myös silloin kun käyttäjä on jo nähnyt esittelyn kerran — jos ei näy, siirrä ehto niin että esittelyn voi aina käynnistää uudelleen.
- `i18n.tsx`:n poistuvia avaimia ei poisteta tässä tehtävässä. Merkitse ne kommentilla ja poista vasta erillisessä siivouksessa.
- Lopputulos: modaali tekee yhden asian. Otsikko, osoite, selainohjeet, valmis-painike.

## 6. Muutos 4 — mobiiliohjeet (tärkein korjaus)

Poista `hidden md:block` ohjelohkosta ja tee ohjeista responsiiviset. Kattavuus laajennetaan:

| Ympäristö | Ohje |
| --- | --- |
| Chrome (työpöytä) | nykyinen |
| Edge (työpöytä) | nykyinen |
| Firefox (työpöytä) | uusi |
| Safari (Mac) | uusi |
| Android Chrome | "Lisää aloitusnäytölle" |
| iPhone Safari | jakopainike → "Lisää Koti-valikkoon" |

Puhelimessa ei ole aloitussivua siinä merkityksessä kuin työpöydällä, joten mobiilin oikea vastine on kuvakkeen lisääminen aloitusnäytölle. Tämä on todennäköisesti käytetympi polku kuin työpöytäohjeet.

Esitysmuoto: yksi laajennettava lohko selainta kohti (`<details>`-elementti tai vastaava), ei kaikkia auki yhtä aikaa. Selaintunnistus saa nostaa todennäköisimmän vaihtoehdon ensimmäiseksi ja avata sen valmiiksi, mutta **kaikkien muiden on aina oltava saatavilla** — tunnistus menee joskus väärin, eikä väärä vastaus saa olla ainoa vastaus.

Osoite `seniorsurf.fi/aloitus` säilyy modaalissa isolla ja valittavana, ja sen viereen lisätään "Kopioi osoite" -painike.

Modaalin loppuun iso **"Valmis, asetin sen"** -painike, joka sulkee modaalin ja kuittaa onnistumisen.

## 7. Saavutettavuus

- Kosketuskohde vähintään 44 × 44 CSS-pikseliä; nykyinen `min-h-[2.75rem]` täyttää tämän, älä pienennä.
- Kontrasti tarkistetaan kaikilla neljällä teemalla ja tummassa tilassa. Kultainen tausta ja tumma teksti on nykyisin `var(--theme-cta-label)` — säilytä se, älä vaihda valkoiseen.
- Fokusrengas säilyy (`focus-visible:ring-2`). Tämä oli aiemmin REL-11:n A11Y-03-korjaus, älä pura sitä.
- Painike toimii suurimmalla tekstikoolla (`fontSizeStep` 4) ilman että ylätunniste rikkoutuu.
- Näkyvän tekstin ja `aria-label`in on vastattava toisiaan: `aria-label` saa olla pidempi, mutta sen on alettava samalla sanalla kuin näkyvä teksti.
- `<details>`-lohkot: otsikko on painike, tila välittyy `aria-expanded`illa, ja näppäimistöllä pääsee jokaiseen.

## 8. Mittarointi

Kytke ohjesuppilo mittarointidokumentin mukaisesti:

- painikkeen napsautus → `trackGuideStep('opened')`
- selainlohkon avaus → `trackGuideStep('browser', '<selaintunnus>')`
- "Valmis, asetin sen" → `trackGuideStep('done')`

Tunnusluku `guideDone / guideOpened` kertoo, paransiko tämä muutos mitään. Ilman sitä muutoksen vaikutusta ei voi todeta.

## 9. Testit

- **UIX-01** Painikkeen teksti on "Aseta aloitussivuksi" kaikilla seitsemällä kielellä eikä yksikään putoa englantiin.
- **UIX-02** Ylätunniste ei rivity rikki leveyksillä 320, 360, 768, 1024 ja 1440 pikseliä millään kielellä.
- **UIX-03** Ruudunlukija lukee painikkeen täytenä lauseena, ei sanaa "talo".
- **UIX-04** Selainohjeet näkyvät puhelimella (leveys 360 px) — tämä on nykyisin FAIL.
- **UIX-05** iPhone- ja Android-ohjeet löytyvät ja ovat auki saatavilla.
- **UIX-06** Selaintunnistuksen epäonnistuessa kaikki ohjeet ovat silti avattavissa.
- **UIX-07** Painike toimii kaikilla neljällä teemalla, tummassa tilassa ja suurimmalla tekstikoolla; kontrasti täyttää AA:n.
- **UIX-08** Fokusrengas näkyy näppäimistöfokuksella.
- **UIX-09** Esittely on yhä käynnistettävissä `InfoModal`ista sen jälkeen kun se poistettiin `HomepageModal`ista.
- **UIX-10** Suppilotapahtumat kirjautuvat kerran per toiminto, eivät moneen kertaan.

## 10. Julkaisujärjestys ja riski

Tuotanto on juuri vaihdettu (REL-11, v0.74.6, pehmeä avaus 28.8.) ja laaja tiedotus on 1.9. **Tämä muutos ei kuulu 1.9. julkaisuun.** Se vaatii uuden ehdokasbuildin ja UIX-testikierroksen, eikä sitä pidä kiirehtiä julkaisuviikolle.

Suositeltu järjestys:

1. Muutos 4 (mobiiliohjeet) ensin omana korjauksenaan — se on toiminnallinen puute, ei kosmeettinen.
2. Muutokset 1–3 samassa erässä sen jälkeen.
3. Mittarointi mukaan viimeistään samalla, jotta vaikutus näkyy.

**Riippuvuus painomateriaaliin:** `docs/a5-kortti-aloitussivu.pdf` viittaa tällä hetkellä painikkeeseen nimellä "🏠 Ohje". Jos painike nimetään uudelleen ennen korttien painamista, kortin askel 2 on päivitettävä. Turvallisin muotoilu korttiin on nimestä riippumaton: *"Sivun yläreunassa on keltainen 🏠-painike."*

## 11. Mitä ei muuteta

- Ei toista kultaista painiketta ylätunnisteeseen.
- Ei poisteta Palaute-, Kieli-, Tietoa- tai Asetukset-painikkeita.
- Ei piiloteta ohjeita selaintunnistuksen perusteella.
- Ei pienennetä kosketuskohteita eikä pureta fokusrengasta.
- Ei lisätä uusia i18n-avaimia vain osaan kielistä.
