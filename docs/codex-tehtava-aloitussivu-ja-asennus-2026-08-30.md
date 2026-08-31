# Codex-tehtävä: aloitussivuksi asettaminen ja sovelluksen asennus

Päivitetty: 30.8.2026
Koskee: `components/HomepageModal.tsx`, `public/site.webmanifest`, `index.html`, `i18n.tsx`, `usageTracking.ts`
Liittyy: `docs/codex-tehtava-aloitussivuksi-painike.md` (28.8.2026, toteutettu)

## 0. Lähtökohta — kaksi kysymystä ja niiden vastaukset

**Voiko aloitussivun asettaa koneellisesti?** Ei voi. Verkkosivulla ei ole eikä ole tulossa rajapintaa, jolla selaimen aloitussivun voisi asettaa. Internet Explorerin `setHomePage()` ja Firefoxin `window.sidebar.addPanel()` on molemmat poistettu vuosia sitten, eikä mikään standardi korvannut niitä. Ainoat koneelliset tavat ovat käyttöjärjestelmätason hallinta (ryhmäkäytäntö, MDM), jotka eivät sovellu kuluttajakäyttöön.

Selaimet estävät tämän tarkoituksella: jos sivu voisi vaihtaa aloitussivun, haittasivustot tekisivät niin jatkuvasti. Se on sama suoja, jota tämä palvelu muuten puolustaa. **Ohjeistus on siis ainoa tie varsinaiseen aloitussivuasetukseen** — mutta se ei ole ainoa tie tavoitteeseen.

**Voiko selaimen tunnistaa koneellisesti?** Voi, ja se on jo tehty (`detectBrowser`, `HomepageModal.tsx:32`). Tunnistus on kuitenkin liian karkea kohderyhmälle, ja siinä on yksi vakava katve (luku 2).

### Tavoitteen uudelleenmuotoilu

"Aloitussivu" edellyttää, että käyttäjä avaa ensin selaimen ja tietää mikä selain on. Aloittelevalle käyttäjälle **kuvake työpöydällä tai puhelimen kotinäytöllä on suorempi**: yksi napautus, ei selainta väliin, ei asetusvalikoita. Tämä on lisäksi ainoa polku, jonka voi tehdä oikeasti yhdellä klikkauksella (luku 3).

Suositus: tarjotaan molemmat, asennus ensin siellä missä se on mahdollista, ja aloitussivuohje aina.

## HS-01 · Selaintunnistuksen katve: sovelluksen sisäiset selaimet (P1) — **TOTEUTETTU 30.8.2026**

> **Tila: tehty.** `components/HomepageModal.tsx`: uusi tyyppi `DetectedBrowser = BrowserId | 'inapp'`, `IN_APP_BROWSER_PATTERN` (fban, fbav, fb_iab, fbios, instagram, messenger, whatsapp, line/, micromessenger, gsa/, twitter, snapchat, tiktok) sekä iOS-WebView-tunnistus (applewebkit ilman safari/). Sovellusikkunassa näytetään oma `inAppGuide`-lohko selainohjeiden sijaan. Uudet avaimet `homepageInAppTitle`, `homepageInAppBody`, `homepageInAppStep` (fi/sv/en). `tsc --noEmit` puhdas. **Testattava oikeasti WhatsAppista ja Messengeristä avaamalla.**


### Miksi

Nykyinen `detectBrowser` palauttaa `'android'` tai `'ios'` heti kun laite tunnistuu, riippumatta siitä missä selaimessa sivu on auki. Se tarkoittaa, että **sovelluksen sisäisessä selaimessa** (WhatsApp, Messenger, Facebook, Instagram, Gmail) käyttäjälle näytetään Chromen tai Safarin valikko-ohjeet — valikkoa, jota siellä ei ole.

Tämä on kohderyhmän todennäköisin ensikohtaaminen palvelun kanssa: läheinen lähettää linkin WhatsAppilla, senior napauttaa sitä, ja sivu aukeaa WhatsAppin sisäiseen selaimeen. Siellä **aloitussivua ei voi asettaa lainkaan**, eikä sovellusta voi asentaa. Ohje, jota ei voi seurata, on kohderyhmälle pahempi kuin ei ohjetta: se saa käyttäjän uskomaan, että vika on hänessä.

### Mitä tehdä

1. Lisää `detectBrowser`-funktioon sovelluksen sisäisten selainten tunnistus **ennen** laitetunnistusta:

   ```
   fban|fbav|fb_iab|instagram|messenger|whatsapp|line/|twitter|gsa/|micromessenger
   ```

   iOS:llä lisämerkki: WebView ei sisällä merkkijonoa `safari/` vaikka `applewebkit` on mukana.

2. Kun tulos on `inapp`, älä näytä selainohjeita lainkaan. Näytä sen sijaan oma näkymä:
   - Otsikko: *"Avaa tämä sivu ensin selaimessa"*
   - Perustelu yhdellä lauseella: *"Olet nyt sovelluksen sisäisessä ikkunassa, jossa aloitussivua ei voi asettaa."*
   - Osoite isolla ja kopioitavana (`HOMEPAGE_URL`, kopiointipainike on jo olemassa)
   - Ohje: *"Napauta oikean yläkulman kolmea pistettä ja valitse Avaa selaimessa."* Tämä toiminto on kaikissa yleisimmissä sovellusselaimissa, vaikka sen paikka vaihtelee.
   - Vasta selaimessa avattuna näytetään normaali ohje.

3. Lisää tarvittavat käännösavaimet kaikkiin seitsemään kielilohkoon (`fi`, `sv`, `en`, `uk`, `et`, `ru`, `se`). Merkitse konekäännöstasoiset erikseen, kuten aiemmassa tehtävässä.

### Hyväksymiskriteerit

- WhatsAppin ja Messengerin sisäisessä selaimessa avattuna modaali näyttää "avaa selaimessa" -ohjeen, ei valikko-ohjeita.
- Tavallisessa selaimessa käyttäytyminen ei muutu.

## HS-02 · Tunnistuksen tarkkuus: UA Client Hints ja puuttuvat selaimet (P2)

### Miksi

`detectBrowser` lukee vain `navigator.userAgent`-merkkijonoa ja tunnistaa kuusi vaihtoehtoa. Puuttuvat:

- **Samsung Internet** — Samsung-puhelinten oletusselain ja yleinen kohderyhmässä. Nyt se saa Chromen Android-ohjeet, vaikka sen valikko on eri paikassa ja asetuksen nimi on toinen.
- **Firefox ja Chrome iOS:llä** — molemmat saavat Safari-ohjeet.
- **Opera, Brave, Vivaldi** — Opera tunnistuu Chromeksi.
- **Työpöydän käyttöjärjestelmä** — Chromen ohjeet ovat käytännössä samat Windowsilla ja Macilla, mutta Safari-ohje näytetään myös Windows-käyttäjälle, jolla Safaria ei ole.

### Mitä tehdä

1. Käytä ensisijaisesti **UA Client Hints** -rajapintaa, joka on Chromium-selaimissa luotettava eikä vaadi merkkijonon arvailua:

   ```ts
   const brands = (navigator as any).userAgentData?.brands ?? [];
   // brands sisältää esim. { brand: 'Microsoft Edge', version: '…' }
   ```

   Se erottaa Edgen, Operan, Bravein ja Samsung Internetin toisistaan. `navigator.userAgentData.mobile` kertoo laitetyypin.

2. Käytä `navigator.userAgent`-merkkijonoa vain varalla (Firefox ja Safari eivät toteuta Client Hintsiä). Lisää varalle tunnistus merkkijonoista `samsungbrowser/`, `opr/`, `crios/`, `fxios/`, `vivaldi`.

3. Lisää ohjekortit ainakin **Samsung Internetille** ja **Chrome iOS:llä**. Muille riittää, että ne ohjataan lähimpään sukulaiseen ja kortin otsikossa sanotaan se ääneen ("Opera — ohjeet ovat samat kuin Chromessa").

4. **Älä koskaan piilota muita vaihtoehtoja.** Tunnistus saa vain järjestää listan, kuten nyt. Jos tunnistus menee pieleen, käyttäjän on päästävä eteenpäin ilman että hän tietää mikä meni vikaan.

### Käytettävyys: älä pyydä senioria nimeämään selaintaan

Aloitteleva käyttäjä ei tiedä selaimensa nimeä, mutta **tunnistaa kuvakkeen ja painikkeen sijainnin**. Muuta korttien otsikot sen mukaisiksi:

- Nykyinen: `Google Chrome`
- Parempi: `Google Chrome` + alle pienemmällä *"Värillinen pyöreä kuvake. Valikko on kolme pistettä oikeassa yläkulmassa."*

Tunnistetun kortin yläpuolella lukee jo `homepageDetectedBrowser`. Muuta se kysymysmuotoon, joka antaa luvan olla eri mieltä: *"Näyttää siltä, että käytät Google Chromea. Jos ei pidä paikkaansa, valitse alta oikea."*

### Hyväksymiskriteerit

- Samsung Internet ei enää saa Chromen ohjeita.
- Kaikki vaihtoehdot ovat aina valittavissa tunnistuksesta riippumatta.
- Tunnistuksen tulos näytetään ehdotuksena, ei väitteenä.

## HS-03 · Sovelluksen asennus yhdellä klikkauksella (P1)

### Miksi

Tämä on ainoa kohta, jossa "koneellisesti mahdollisimman helposti" toteutuu oikeasti. Chromium-selaimissa (Chrome, Edge) työpöydällä ja Androidilla selain lähettää `beforeinstallprompt`-tapahtuman, jonka voi ottaa talteen ja näyttää käyttäjälle oman **"Asenna kuvake työpöydälle"** -painikkeen. Painikkeen painaminen avaa selaimen oman asennusvahvistuksen — käyttäjälle yksi klikkaus ja yksi vahvistus, ei yhtään asetusvalikkoa.

Lopputulos on kohderyhmälle parempi kuin aloitussivu: kuvake työpöydällä tai kotinäytöllä, joka avaa palvelun suoraan ilman selaimen käynnistämistä ja ilman osoiterivin näpyttelyä.

### Nykytila estää tämän kokonaan

`public/site.webmanifest` sisältää vain kuvakkeet **32×32 ja 180×180**. Chromen asennettavuus edellyttää suurempia kuvakkeita (perinteisesti 192×192 ja 512×512). Lisäksi repossa ei ole **lainkaan service workeria**, ja `beforeinstallprompt` edellyttää sellaista, jolla on `fetch`-käsittelijä. Asennuspainike ei siis voi ilmestyä millään.

### Mitä tehdä

1. **Täydennä manifest:** lisää kuvakkeet 192×192 ja 512×512, molemmat myös `"purpose": "maskable"` -versioina, jotta Android-kotinäytön kuvake ei jää valkoisen ympyrän sisään. Lähteenä `public/favicon.svg`.
2. **Lisää minimaalinen service worker** `public/sw.js`: rekisteröinti, `fetch`-käsittelijä ja yksinkertainen offline-varasivu. **Älä lisää sisällön välimuistitusta tässä vaiheessa** — vanhentunut välimuisti on tälle palvelulle pahempi ongelma kuin offline-tuen puute, koska huijausvaroitukset ja linkkiestot tulevat palvelimelta ja niiden on oltava tuoreita. Jos välimuistia myöhemmin lisätään, `blocked-links`- ja `scam-alerts`-pyynnöt on jätettävä sen ulkopuolelle ehdottomasti.
3. **Ota `beforeinstallprompt` talteen** `App.tsx`:ssä, `preventDefault()` ja tallenna tapahtuma muistiin (Reactin tilaan, ei `localStorage`-tallennukseen).
4. **Näytä asennuspainike `HomepageModal`in ensimmäisenä vaihtoehtona** silloin kun tapahtuma on saatu:
   - Otsikko: *"Helpoin tapa: asenna kuvake"*
   - Yksi lause: *"Saat oman kuvakkeen, josta sivu aukeaa suoraan. Ei tarvitse avata selainta."*
   - Painike, joka kutsuu `prompt()`-metodia.
   - Kun asennus onnistuu (`appinstalled`-tapahtuma), näytä vahvistus ja ohje siitä, mistä kuvake löytyy.
5. **iOS ja Safari:** rajapintaa ei ole. Näytä oma kortti: Jaa-kuvake (neliö ja ylöspäin osoittava nuoli) → "Lisää Koti-valikkoon". Kuvaile kuvake sanallisesti, älä oleta että käyttäjä tunnistaa nimen.
6. **Firefox työpöydällä** ei tue asennusta. Älä näytä painiketta, näytä aloitussivuohje.
7. **Aloitussivuohje säilyy aina** asennusvaihtoehdon rinnalla. Osa käyttäjistä haluaa nimenomaan aloitussivun, ja osalla asennus ei ole tarjolla.

### Hyväksymiskriteerit

- Lighthouse antaa sivulle "installable"-tuloksen.
- Chromessa ja Edgessä asennuspainike ilmestyy, ja sen painaminen avaa selaimen asennusvahvistuksen.
- Safarissa ja Firefoxissa ei näytetä painiketta, jota ei voi käyttää.
- Service worker ei välimuistita `blocked-links`- eikä `scam-alerts`-vastauksia.

## HS-04 · Tietosuoja: mitään suostumusta ei tarvita, kun nämä ehdot pitävät (P1)

### Lähtökohta

Selaintunnistus **ei ole evästeitä vastaava toiminto** silloin kun se tehdään kokonaan selaimessa eikä mitään tallenneta eikä lähetetä. `navigator.userAgent`-merkkijonon lukeminen sen valitsemiseksi, mikä ohje ruudulla näytetään, ei kirjoita laitteelle mitään.

EDPB:n ohje 2/2023 tulkitsee "pääsyä päätelaitteeseen tallennettuihin tietoihin" laajasti, joten pelkkään "emme tallenna evästettä" -perusteluun ei kannata nojata yksin. Tässä pätee kuitenkin ePrivacy-direktiivin 5(3) artiklan poikkeus: toimenpide on **välttämätön käyttäjän nimenomaisesti pyytämän palvelun toteuttamiseksi**. Käyttäjä painoi "Aseta aloitussivuksi" nimenomaan saadakseen ohjeet omalle selaimelleen; ilman selaimen tunnistamista pyydettyä palvelua ei voi tuottaa.

### Kolme ehtoa, joiden on pysyttävä voimassa

1. **Tunnistuksen tulosta ei tallenneta laitteelle.** Ei `localStorage`, ei `sessionStorage`, ei eväste. Pidä se Reactin tilassa, joka katoaa sivun sulkeutuessa. Sama koskee `beforeinstallprompt`-tapahtumaa.
2. **Tunnistuksen tulosta ei lähetetä palvelimelle automaattisesti.** Tämä on nykytoteutuksen tarkistettava kohta: `HomepageModal.tsx:162` kutsuu `trackGuideStep('browser', browser.id)` kun käyttäjä avaa selainkortin. Tarkistettu 30.8.2026: `sendUsageEvent` (`usageTracking.ts:143`) kunnioittaa käyttötilastojen poiskytkentää, joten toteutus on kunnossa. **Säilytä tämä raja:** automaattinen tunnistus on paikallinen eikä tuota yhtään tapahtumaa; vain käyttäjän oma klikkaus tilastoidaan, ja se kulkee olemassa olevan opt-outin läpi.
3. **Service workerille pätee sama poikkeus, mutta kapeasti.** Service workerin asentaminen on tallennus päätelaitteelle, ja se on välttämätön käyttäjän pyytämän asennuksen toteuttamiseksi — mutta vain siltä osin. Älä tallenna service workeriin tai sen välimuistiin mitään käyttäjäkohtaista.

### Mitä tehdä

1. Lisää `docs/kayttotilastot-ja-tietosuoja.md`-dokumenttiin lyhyt kappale: selaintunnistus tehdään paikallisesti, tulosta ei tallenneta eikä lähetetä, ja peruste on 5(3):n välttämättömyyspoikkeus.
2. Lisää sama yhdellä lauseella tietosuojaselosteeseen (`tietosuoja.tsx`) siihen kohtaan, jossa selitetään mitä laitteelle tallennetaan.
3. Jos service worker toteutetaan (HS-03), lisää selosteeseen maininta siitä, mitä se tallentaa ja miten asennuksen voi perua.
4. **Älä lisää evästebanneria.** Tämä ominaisuus ei tuo sellaista tarvetta, ja banneri olisi kohderyhmälle merkittävä käytettävyyshaitta.

### Hyväksymiskriteerit

- Selaimen kehitystyökalujen Application-välilehdellä ei näy uutta tallennettua avainta, kun modaali avataan ja selain tunnistetaan.
- Verkkovälilehdellä ei näy yhtään pyyntöä pelkän modaalin avaamisen ja tunnistuksen seurauksena.

## HS-07 · Tunnistettua selainta ei tosiasiassa avata — teksti lupaa väärin (P1) — **TOTEUTETTU 30.8.2026**

> **Tila: tehty.** Muutokset on tehty tiedostoihin `components/HomepageModal.tsx` ja `i18n.tsx` (fi, sv, en). `npx tsc --noEmit -p tsconfig.json` menee läpi. **Eeron on vielä ajettava `npm run build` ja testattava selaimilla.** Codex: älä toteuta tätä uudelleen — lue alta mitä tehtiin ja miksi, ja tarkista vain että ratkaisu kestää muiden muutostesi rinnalla.
>
> Samalla toteutettiin kierroksen loppuun aloitussivuksi-kehotus (ks. HS-08).


### Vika

Eeron testaus 30.8.2026: Chromella ja Firefoxilla oikea selain nousee listan ensimmäiseksi, **mutta sen ohjeet eivät ole auki**. Teksti kuitenkin väittää niin.

Syy löytyy koodista. `components/HomepageModal.tsx:158–164` luo jokaisen ohjekortin `<details>`-elementtinä, eikä yhdellekään anneta `open`-attribuuttia:

```tsx
<details
  key={browser.id}
  className="group rounded-2xl …"
  onToggle={…}
>
```

`orderedBrowsers` (rivi 70) järjestää tunnistetun selaimen ensimmäiseksi, mutta järjestäminen on ainoa asia joka tapahtuu. Käännösteksti `homepageDetectedBrowser` (fi: *"Todennäköinen selaimesi on avattu valmiiksi. Kaikki vaihtoehdot ovat silti käytettävissä."*) kertoo siis toiminnosta, jota ei ole toteutettu.

Tämä on pahempi kuin pelkkä puuttuva ominaisuus. Käyttäjä lukee että ohjeet on avattu, ei näe avattuja ohjeita, ja päättelee tehneensä jotain väärin. Kohderyhmässä se riittää keskeyttämään koko yrityksen.

### Korjaus 1 — avaa tunnistettu kortti oikeasti

**Älä sido `open`-attribuuttia suoraan** muotoon `open={browser.id === detectedBrowser}`. React asettaa attribuutin uudelleen jokaisella uudelleenpiirrolla, joten kortti loksahtaisi auki aina kun modaalin tila muuttuu — esimerkiksi kun käyttäjä painaa "Kopioi osoite" ja `copyStatus` päivittyy. Käyttäjä sulkisi kortin ja se avautuisi itsestään uudelleen.

Pidä auki olevat kortit omassa tilassaan ja alusta se modaalin avautuessa:

```tsx
const [openBrowsers, setOpenBrowsers] = useState<Set<BrowserId>>(new Set());

useEffect(() => {
  if (!isOpen) return;
  setOpenBrowsers(detectedBrowser ? new Set([detectedBrowser]) : new Set());
}, [isOpen, detectedBrowser]);
```

ja kortissa:

```tsx
<details
  key={browser.id}
  open={openBrowsers.has(browser.id)}
  onToggle={(event) => {
    const isNowOpen = event.currentTarget.open;
    setOpenBrowsers((current) => {
      const next = new Set(current);
      if (isNowOpen) next.add(browser.id); else next.delete(browser.id);
      return next;
    });
    if (isNowOpen) trackGuideStep('browser', browser.id);
  }}
>
```

Näin useampi kortti voi olla auki yhtä aikaa, kuten nytkin, ja tunnistettu kortti on auki heti. Kun modaali suljetaan ja avataan uudelleen, tila palautuu alkuun.

**Älä siirrä fokusta avattuun korttiin.** Modaalin fokusansa (`useModalFocusTrap`) vie fokuksen sulkupainikkeeseen, ja se on oikein — ruudunlukijan käyttäjän ei pidä pompata keskelle ohjeita.

**Jos HS-01 toteutetaan ensin:** kun `detectBrowser` palauttaa `'inapp'`, mitään korttia ei avata eikä tätä tekstiä näytetä lainkaan.

### Korjaus 2 — teksti kertoo mikä selain tunnistettiin

Nykyinen teksti ei kerro mitä selainta tarkoitetaan. Käyttäjä ei voi arvioida meniko tunnistus oikein.

Muuta `homepageDetectedBrowser` ottamaan paikkamerkki `{browser}`, johon sijoitetaan kortin oma `label` (esim. `Google Chrome`, `Mozilla Firefox`).

**Suomenkielinen teksti:**

> Näyttää siltä, että selaimesi on {browser}. Avasimme sen ohjeet valmiiksi. Jos selaimesi on toinen, valitse se listasta.

Kolme lyhyttä lausetta, jokaisessa yksi asia, kaikki alle 15 sanaa. Ensimmäinen kertoo arvauksen arvauksena, toinen selittää mitä tehtiin, kolmas antaa luvan olla eri mieltä ja kertoo mitä silloin tehdään.

**Tärkeä kielioppihuomio:** rakenne on valittu niin, että selaimen nimi on **perusmuodossa**. Älä kirjoita tekstiä muotoon *"käytät {browser}a"* — se tuottaisi tuloksia kuten "käytät Safari (Mac)a" ja "käytät Microsoft Edgeä" väärin taivutettuna. Nykyiset otsikot ovat `Google Chrome`, `Microsoft Edge`, `Mozilla Firefox`, `Safari (Mac)`, `Android Chrome`, `iPhone Safari`, eikä yksikään taivu ohjelmallisesti oikein.

**Käännökset:**

| Kieli | Teksti | Varmuus |
| --- | --- | --- |
| fi | Näyttää siltä, että selaimesi on {browser}. Avasimme sen ohjeet valmiiksi. Jos selaimesi on toinen, valitse se listasta. | varma |
| sv | Det ser ut som att din webbläsare är {browser}. Vi har öppnat anvisningarna för den. Om du använder en annan webbläsare, välj den i listan. | varma |
| en | It looks like your browser is {browser}. We have opened its instructions for you. If you use a different browser, choose it from the list. | varma |
| et | Tundub, et sinu brauser on {browser}. Avasime selle juhised valmis. Kui kasutad muud brauserit, vali see loendist. | tarkistettava |
| uk | Схоже, ваш браузер — {browser}. Ми відкрили інструкцію для нього. Якщо ви користуєтесь іншим браузером, оберіть його зі списку. | tarkistettava |
| ru | Похоже, ваш браузер — {browser}. Мы открыли инструкцию для него. Если вы пользуетесь другим браузером, выберите его из списка. | tarkistettava |
| se | — | **luetutettava kielitaitoisella, älä arvaa** |

Pohjoissaamenkielistä versiota **ei saa tuottaa konekäännöksenä**. Repossa on jo tunnettu puute uk-, et-, ru- ja se-käännöksissä kesäkuun uudistuksen jäljiltä; älä laajenna sitä. Jos saamenkielistä tekstiä ei saada ajoissa, käytä siinä kielessä nykyistä `homepageDetectedBrowser`-tekstiä muuttamattomana kunnes käännös saadaan.

### Korjaus 3 — teksti myös silloin kun tunnistus epäonnistuu

`HomepageModal.tsx:154` näyttää tekstin vain ehdolla `detectedBrowser &&`. Kun tunnistus palauttaa `null`, käyttäjä ei saa mitään ohjetta siitä mitä tehdä.

Lisää uusi avain, esimerkiksi `homepageBrowserUnknown`:

> Emme tunnistaneet selaintasi. Valitse käyttämäsi selain listasta.

### Hyväksymiskriteerit

- Chromella avattaessa Chromen ohjeet ovat näkyvissä heti, ilman klikkausta.
- Firefoxilla avattuna Firefoxin ohjeet ovat näkyvissä heti.
- Kortin sulkeminen pysyy suljettuna, vaikka modaalissa tehtäisiin muita toimintoja (esim. osoitteen kopiointi).
- Teksti kertoo selaimen nimen, ja nimi on perusmuodossa kaikilla kuudella kortilla.
- Kun tunnistus epäonnistuu, käyttäjälle kerrotaan mitä tehdä.
- Testattu oikeilla selaimilla, ei vain laitesimulaattorilla.

---

## HS-08 · Esittelykierroksen lopussa kehotus asettaa aloitussivuksi — **TOTEUTETTU 30.8.2026**

### Miksi

Esittelykierros (`components/OnboardingTour.tsx`) päättyi vaiheeseen "Tee sivusta omasi", ja käyttäjä jäi ilman seuraavaa askelta. Aloitussivuksi asettaminen on palvelun tärkein yksittäinen käyttäjätoiminto — sivu tuottaa arvoa vasta selaimen aloitussivuna — ja esittelyn päätös on luonteva paikka nostaa se esiin: käyttäjä on juuri nähnyt mitä sivu tekee ja on valmiiksi kiinnostunut.

### Mitä tehtiin

1. `TourStep`-tyyppiin uusi laji `'homepage'`, ja kierroksen viimeiseksi vaiheeksi lisättiin **"Ota sivu käyttöön"** kolmella kielellä (fi, sv, en — kierroksella on oma käännöstaulukko, joka tukee vain näitä).

   fi: *"Tämä sivu on hyödyllisin selaimesi aloitussivuna. Silloin se avautuu itsestään, kun avaat netin. Näytämme ohjeet omalle selaimellesi."*

2. Vaiheessa on kaksi painiketta: kultainen **"Aseta aloitussivuksi"**, joka päättää kierroksen ja avaa `HomepageModal`in, sekä vaalea **"Ehkä myöhemmin"**, joka vain päättää kierroksen. Kieltäytyminen on siis yhtä helppoa kuin suostuminen, mikä on kohderyhmän kanssa tärkeää.

3. Alarivin "Valmis"-painike piilotetaan tässä vaiheessa (`step.kind !== 'homepage'`), jottei näytöllä ole kolmea lopetuspainiketta.

4. Uusi valinnainen propsi `onSetHomepage`, joka kytkettiin `App.tsx`:ssä avaamaan `HomepageModal` (`setIsHomepageOpen(true)`).

5. `availableSteps`-suodatin päästää uuden vaiheen läpi (`item.kind === 'homepage'`), koska sillä ei ole `target`-elementtiä sivulla.

### Mitä jää tehtäväksi

- **uk-, et-, ru- ja se-käännökset puuttuvat.** Kierroksen käännöstaulukko `tourTranslations` tukee vain kolmea kieltä (`Record<'fi' | 'sv' | 'en', …>`), ja muut kielet putoavat suomeen. Tämä on kierroksen vanha rajoitus, ei tämän muutoksen aiheuttama — mutta jos kierros laajennetaan seitsemään kieleen, uusi vaihe on käännettävä mukana.
- **Mittaa vaikutus.** `trackGuideStep('opened')` kirjaa jo modaalin avaamisen. Harkitse omaa arvoa sille, että modaali avattiin esittelykierroksen kautta, jotta nähdään toimiiko nosto. Se kulkee olemassa olevan käyttötilastojen poiskytkennän läpi, joten tietosuojan kannalta ei muutosta (HS-04).
- **Testaa kierros loppuun asti** oikealla laitteella: viimeinen vaihe näkyy, molemmat painikkeet toimivat, ja "Aseta aloitussivuksi" avaa modaalin oikein kierroksen sulkeuduttua.

---

## HS-05 · Ohjeiden näkyvyys pienellä näytöllä (P2)

Aiempi tehtävädokumentti (`docs/codex-tehtava-aloitussivuksi-painike.md`, havainto 3) kirjasi, että ohjelohko oli `hidden … md:block` eli puhelimella ohjeita ei näkynyt lainkaan. Tarkista, korjaantuiko tämä 29.8. toteutuksessa, ja jos ei, korjaa: puhelin on kohderyhmän yleisin laite ja juuri siellä ohjeita eniten tarvitaan.

## HS-06 · Testaus

1. Testaa oikeilla laitteilla, ei vain selaimen laitesimulaattorilla: Android-puhelin Chromella ja Samsung Internetillä, iPhone Safarilla, Windows Chromella ja Edgellä.
2. Testaa erikseen **linkin avaaminen WhatsAppista ja Messengeristä** — se on HS-01:n koko peruste.
3. Testaa asennus ja asennuksen poisto: kuvake ilmestyy, avaa oikean osoitteen, ja poisto onnistuu selaimen omista asetuksista.
4. Ruudunlukija ja 200 % tekstikoko, 320 px leveydellä, kuten muissakin näkymissä.
5. Kirjaa tulokset tiedostoon `docs/julkaisupaivakirja-2026-09.md`.

## Toteutusjärjestys

1. ~~**HS-07** tunnistetun selaimen avaaminen ja teksti~~ — **tehty 30.8.2026**, samoin **HS-08**
2. **HS-01** sovellusselainten katve — pienin työ, suurin vaikutus kohderyhmälle
3. **HS-04** tietosuojan kirjaukset — tehdään HS-01:n yhteydessä, ei erillisenä
4. **HS-03** asennus (manifest, service worker, painike)
5. **HS-02** tunnistuksen tarkkuus ja Samsung Internet
6. **HS-05** ja **HS-06**
