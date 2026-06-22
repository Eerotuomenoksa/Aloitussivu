# Ensi viikon tyopaketti 22.-26.6.2026

Paivays: 18.6.2026

## Viikon tavoite

Viikon 22.-26.6.2026 tavoite on saada avoimen testauksen loppupuoli hallittuun tilaan ilman isoa uutta ominaisuuskehitysta. Painopiste on kolmessa asiassa:

1. Nykyinen likainen tyopuu jaetaan turvallisiin commit-kokonaisuuksiin.
2. Testausjakson palaute, kehitysjono ja linkki-ilmoitukset tarkistetaan.
3. Ennen heinäkuun kevyempää ylläpitovaihetta kirjataan, mitkä asiat ovat valmiita, mitkä odottavat päätöstä ja mitkä siirtyvät elokuulle.

Viikon ei pidä hajota Cloudcity-siirtoon, isoon visuaaliseen uudistukseen, täyteen linkkiauditointiin tai tuotantotason tietokantamuutoksiin. Niille on oma paikkansa elokuun ja syyskuun roadmapissa.

## Lähtötila

Tämä työpaketti jatkaa dokumentista `docs/keskeneraiset-tyot-valmiiksi-2026-06-18.md`.

Tiedossa oleva lähtötila:

- `npx vite build` meni läpi 18.6.2026.
- Etusivu ja kehitysjono latautuivat kehityspalvelimessa ilman selaimen konsolivirheitä.
- Kehitysjonossa ei ollut uusia, arvioinnissa olevia, jonossa olevia tai työn alla olevia palautteita.
- Huijausvaroitusmodaalin lopullinen selaintesti jäi odottamaan aktiivista varoitusta.
- Työpuussa on useita koreja: koodimuutokset, dokumentit, nimeämiset/esitysaineistot, ikonit ja paikalliset output-tiedostot.

## Viikon onnistumisen määritelmä

Viikko on onnistunut, jos perjantaina 26.6.2026:

- työpuu on joko siisti tai jokainen jäljellä oleva muutos kuuluu nimettyyn koriin
- vähintään käyttäjälle näkyvä koodikori on testattu ja valmis commitattavaksi tai commitattu
- kehitysjono, palautteet ja linkki-ilmoitukset on tarkistettu
- huijausvaroitusmodaali on testattu, jos aktiivinen varoitus on saatavilla
- päätöspaketissa on tiedossa, mitkä päätökset vaativat ihmisen vahvistuksen ennen elokuuta
- heinäkuun kevyt ylläpitomalli on kirjattu
- muutosloki ja työtuntiseuranta on päivitetty viikon töistä

## Mitä ei tehdä ensi viikolla

- Ei tehdä täyttä Cloudcity-siirtoa.
- Ei toteuteta uutta tietokantaa.
- Ei muuteta kaikkia datatoimintoja provider-malliin.
- Ei tehdä isoa visuaalista uudistusta.
- Ei poisteta ylläpitolinkkejä, kehitysjonoa tai teknisiä sivuja ilman vahvistettua päätöstä.
- Ei tehdä täyttä linkkiauditointia, ellei sille varata erikseen kokonainen työrupeama.
- Ei väitetä tietosuoja- tai saavutettavuussivuja lopullisiksi, jos yhteystiedot ja vastuuroolit puuttuvat.

## Päiväkohtainen suunnitelma

### Maanantai 22.6.2026: työpuun rauhoitus

Tavoite: aloitetaan viikko sillä, että kukaan ei joudu arvaamaan mitä nykyiset muutokset tarkoittavat.

Tehtävät:

1. Aja:

   ```powershell
   git status --short
   npx vite build
   ```

2. Vertaa nykyistä työpuuta dokumentin `docs/keskeneraiset-tyot-valmiiksi-2026-06-18.md` korijakoon.
3. Valitse ensimmäinen commit-kori:
   - ensisijaisesti Kori A: käyttäjälle näkyvät koodimuutokset
   - vaihtoehtoisesti Kori B: dokumenttien tilannekuva, jos koodimuutokset vaativat lisäselvitystä
4. Tarkista `index.html`, `kehitysjono.tsx` ja `localNewspaperLinks.ts`:
   - mitä käyttäjälle muuttuu
   - onko muutos valmis
   - tarvitseeko muutos muutoslokimerkinnän
5. Päätä, mitkä tiedostot jätetään tarkoituksella myöhempiin koreihin.

Hyväksyttävä lopputulos:

- yksi commit-kori on valittu
- sen tiedostot ja testit on nimetty
- build menee läpi tai build-virhe on viikon ensimmäinen korjattava työ

Ihmisen arvioitu aika: 15-30 min  
Codex-/toteutusaika: 30-60 min

Toteuma 22.6.2026:

- `git status --short` tarkistettu.
- `npx vite build` onnistui.
- Ensimmäiseksi koriksi valittiin käyttäjälle näkyvä koodikori ja sen favicon-riippuvuus:
  - `index.html`
  - `kehitysjono.tsx`
  - `public/favicon.svg`
  - `public/favicon-32.png`
  - `public/apple-touch-icon.png`
- `localNewspaperLinks.ts` tarkistettiin, mutta jätettiin pois tästä korista. Siinä ollut uusi Auranmaan Viikkolehden URL ja Lakeuden Joutsen -URL eivät ratkenneet DNS:ssä; Auranmaan Viikkolehti palautettiin toimivaan `https://www.avl.fi/`-osoitteeseen ja Lakeuden Joutsen jätettiin pois, kunnes toimiva julkinen verkkolähde löytyy.
- Etusivu ja kehitysjono testattiin selaimessa ilman konsolivirheitä.
- Faviconit palautuivat kehityspalvelimelta HTTP 200 -vastauksilla.
- Mobiilipistokokeessa etusivulla ja kehitysjonossa ei ollut vaakasuuntaista ylivuotoa 390 px leveydellä.
- Mobiilipistokokeessa Firestore-yhteys antoi hetkellisiä 429/unavailable-virheitä. Tämä ei näyttänyt rikkovan sivun latautumista, mutta kehitysjonon data voi testitilanteessa näkyä puutteellisena, jos Firestore ei vastaa.
- `npm run check:secrets` onnistui.

Seuraava askel:

- Päätä, commitataanko tämä kori viestillä `viimeistele testausjakson nakyvat korjaukset` vai yhdistetäänkö se samaan dokumenttikorin kanssa.

### Tiistai 23.6.2026: käyttäjälle näkyvä testauskori

Tavoite: varmistetaan, että käyttäjälle näkyvät muutokset eivät jää puolivalmiiksi.

Tehtävät:

1. Testaa etusivu desktopissa.
2. Testaa etusivu mobiilileveydellä.
3. Testaa kehitysjono:
   - julkinen näkymä
   - tyhjän/ei-avoimia-palautteita -tilan ymmärrettävyys
   - vanhojen käsiteltyjen palautteiden näkyminen
4. Testaa paikallisuutiset niissä kunnissa, joita `localNewspaperLinks.ts` koskee.
5. Jos aktiivinen huijausvaroitus on saatavilla, testaa modaali:
   - avaus
   - sulkeminen
   - Escape
   - Lue lisää -linkki
6. Päivitä `changelogData.ts`, jos näkyvä muutos ei jo näy muutoshistoriassa.

Hyväksyttävä lopputulos:

- `npx vite build` onnistuu
- etusivu ja kehitysjono on testattu
- paikallisuutisten muutokset on pistokokeiltu
- huijausvaroitusmodaalin tila on joko testattu tai kirjattu odottamaan aktiivista varoitusta

Mahdollinen commit:

```text
viimeistele testausjakson nakyvat korjaukset
```

Ihmisen arvioitu aika: 20-40 min  
Codex-/toteutusaika: 1-2 h

Toteuma 22.6.2026:

- Desktopin alueellisten palveluiden ryhmittelyä selkeytettiin:
  - suorat aluepalvelut näkyvät yhdessä osiossa `Tärkeimmät aluepalvelut`
  - aiheittaiset linkkiryhmät näkyvät omassa osiossaan `Lisää alueellisia linkkejä aiheittain`
  - kunnan valinta yhdistettiin samaan otsakealueeseen `Lähelläsi`-tekstin viereen, jotta kunnan nimi ja vaihtotoiminto eivät näy kahtena erillisenä lohkona
- Huijausvaroitusten kompakti näkymä muutettiin niin, että desktopissa kaksi aktiivista varoitusta näkyy kahtena korttina rinnakkain yhden kortin ja `+1 varoitus` -napin sijaan.
- Uudet aluepalveluotsikot lisättiin i18n-käännöksiin suomeksi, ruotsiksi ja englanniksi.
- `npx vite build` onnistui.
- Desktop- ja mobiilipistokokeissa Helsinki-valinnalla ei syntynyt vaakasuuntaista ylivuotoa.
- Huijausvaroitusten kahden kortin lopullinen visuaalinen tarkistus jää riippumaan siitä, että saatavilla on kaksi aktiivista varoitusta.

### Keskiviikko 24.6.2026: palaute ja ylläpitomalli

Tavoite: varmistetaan, ettei testausjakson palaute jää hajalle.

Tehtävät:

1. Tarkista kehitysjono.
2. Tarkista linkki-ilmoitukset ylläpitonäkymästä, jos admin-kirjautuminen on käytettävissä.
3. Kirjaa yhteenvedoksi:
   - uudet palautteet
   - palautteet, jotka vaativat korjauksen ennen heinäkuuta
   - palautteet, jotka siirtyvät elokuun priorisointiin
   - palautteet, joita ei toteuteta
4. Päivitä tarvittaessa `docs/elokuun-julkaisusuunnitelma.md` tai erillinen palautekoonti.
5. Varmista, että `docs/seuraava-tyopaketti-paatokset-ja-yllapitomalli-2026-06-14.md` sisältää vähintään väliaikaisen mallin palautteen käsittelystä.

Hyväksyttävä lopputulos:

- kehitysjonon tilanne on kirjattu
- akuuteille palautteille on päätetty yksi kolmesta tilasta: korjataan nyt, siirretään elokuulle, ei toteuteta
- ylläpitomallin väliaikainen omistaja on kirjattu

Mahdollinen commit:

```text
kirjaa testipalautteen kasittelymalli
```

Ihmisen arvioitu aika: 30-60 min  
Codex-/toteutusaika: 45-90 min

### Torstai 25.6.2026: päätökset ja heinäkuun rauhoitus

Tavoite: valmistellaan heinäkuun kevyt ylläpitovaihe niin, ettei projekti jää “auki joka suuntaan”.

Tehtävät:

1. Täsmennä viisi minimipäätöstä:
   - nimi
   - testausosoite
   - ylläpitolinkkien näkyvyys
   - palautteiden ja linkki-ilmoitusten käsittelijä
   - tietosuoja- ja saavutettavuusyhteystiedot
2. Jos lopullista päätöstä ei saada, kirjaa:
   - väliaikainen malli
   - vastuuhenkilö
   - viimeinen päätöspäivä
3. Kirjaa heinäkuun ylläpitomalli:
   - kuinka usein testauslinkki tarkistetaan
   - kuinka usein kehitysjono katsotaan
   - mitä korjataan heinäkuussa
   - mitä ei korjata ennen elokuuta
4. Tarkista, että elokuulle siirtyvät asiat ovat samat `TODO_HUMAN.md`:ssä, roadmapissa ja keskeneräisten töiden dokumentissa.

Hyväksyttävä lopputulos:

- päätöspaketti ei ole pelkkä kysymyslista
- heinäkuun kevyt ylläpitomalli on kirjattu
- elokuulle siirtyvät asiat eivät näytä vahingossa tämän viikon virheiltä

Mahdollinen commit:

```text
valmistele heinakuun kevyt yllapitomalli
```

Ihmisen arvioitu aika: 30-60 min  
Codex-/toteutusaika: 1-2 h

### Perjantai 26.6.2026: viikon sulku

Tavoite: viikko päättyy siistiin tilaan.

Tehtävät:

1. Aja:

   ```powershell
   npm run check:secrets
   npx vite build
   ```

2. Tee valikoitu selaintesti:
   - `/`
   - `/kehitysjono.html`
   - `/muutosloki.html`
   - `/tietosuoja.html`
   - `/saavutettavuus.html`
3. Päivitä muutosloki.
4. Päivitä työtuntiseuranta.
5. Tarkista `git status --short`.
6. Kirjaa seuraavan viikon tai heinäkuun ensimmäisen ylläpitokierroksen aloituskohta.

Hyväksyttävä lopputulos:

- build ja salaisuustarkistus menevät läpi
- selaintestin tulos on kirjattu
- työpuun jäljellä olevat muutokset kuuluvat nimettyihin koreihin
- viikon aikana tehdyt päätökset ja siirrot löytyvät dokumenteista

Mahdollinen commit:

```text
sulje kesakuun testausviikon tyot
```

Ihmisen arvioitu aika: 20-45 min  
Codex-/toteutusaika: 45-90 min

## Prioriteetit, jos aikaa on vähän

Jos viikolla ehditään tehdä vain vähän, järjestys on tämä:

1. Build vihreäksi.
2. Käyttäjälle näkyvä koodikori testatuksi ja commit-valmiiksi.
3. Kehitysjonon ja palautteiden tarkistus.
4. Päätöspaketin viisi minimilinjausta.
5. Työloki ja muutosloki.

Jos aikaa jää enemmän:

1. Dokumenttikorin läpikäynti ja commit.
2. Dokumenttien uudelleennimeämisten vahvistus.
3. Faviconien ja julkaisumetadatan tarkistus.
4. Output-kansion siivouspäätös.

## Riskit ja vastatoimet

| Riski | Vaikutus | Vastatoimi |
| --- | --- | --- |
| Työpuu sekoittaa monta kokonaisuutta | commitit ovat vaikeita tarkistaa | pidä korit erillään ja committoi yksi kori kerrallaan |
| Päätöksiä ei saada | UI- ja julkaisumuutokset voivat mennä väärään suuntaan | käytä väliaikaista mallia ja kirjaa omistaja |
| Huijausvaroitusta ei voi testata datan puuttuessa | modaali jää epävarmaksi | kirjaa uusintatestin ehto ja testaa, kun aktiivinen varoitus näkyy |
| Linkki-ilmoitusten spammisuoja tulkitaan valmiiksi tuotantoon | liian heikko suoja julkaisuun | pidä dokumentissa selvä ero pilottitason ja tuotantotason välillä |
| Heinäkuu alkaa ilman ylläpitomallia | palaute ja linkkivirheet kasaantuvat | kirjaa kevyt rytmi: tarkistus kerran viikossa tai sovitusti |

## Ennen viikon alkua tarvittavat ihmispäätökset

Nämä kannattaa vastata ennen maanantaita tai viimeistään torstain päätöspäivänä:

1. Käytetäänkö nimeä `Aloitussivu` myös testiviestinnässä?
2. Saako `Kehitysjono` näkyä julkisesti testauksen ajan?
3. Saako `Ylläpito`-linkki näkyä footerissa testauksen ajan?
4. Kuka tarkistaa kehitysjonon heinäkuussa?
5. Mihin osoitteeseen tietosuoja- ja saavutettavuuspalautteet lopulta ohjataan?

## Viikon lopun raporttipohja

Perjantaina täytetään lyhyt raportti:

```text
Viikon 22.-26.6.2026 lopputulos:

Build:
Salaisuustarkistus:
Selaintestit:
Commitit:
Kehitysjono:
Linkki-ilmoitukset:
Päätökset:
Elokuulle siirretty:
Seuraava askel:
```
