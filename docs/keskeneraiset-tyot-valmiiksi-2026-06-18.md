# Keskeneraiset tyot valmiiksi

Paivays: 18.6.2026

## Tavoite

Tama suunnitelma sulkee 14.-15.6.2026 kirjattujen tyopakettien avoimet langat hallitussa jarjestyksessa. Tavoite ei ole aloittaa uutta isoa ominaisuutta, vaan saada nykyinen tyopuu, paatoskohdat ja tietoturvan jatkot selkeaan valmiustilaan.

Valmis tarkoittaa tassa:

- tyopuu on jaettu ymmarrettaviin commit-kokonaisuuksiin
- paatoskohdat on joko paatetty, kirjattu odottamaan ihmisen paatosta tai siirretty elokuun julkaisupakettiin
- kayttajalle nakyvat keskeneraiset muutokset on testattu selaimessa
- tietoturvan jatkotyot on rajattu niin, ettei niita roiku epamaaraisina "melkein tehty" -asioina
- muutosloki ja tyotuntiseuranta kertovat, mita tehtiin

## Nykyinen tilanne

Julkisessa kehitysjonossa ei ole uusia, arvioinnissa olevia, jonossa olevia tai tyon alla olevia palautteita. `kehitysjono.html` latautuu kehityspalvelimessa ilman konsolivirheita. Tarkistushetkella nakyvissa oli aiemmin kasiteltyja palautteita.

Repo ei kuitenkaan ole tyon kannalta tyhja: tyopuussa on useita muutettuja ja uusia tiedostoja, ja dokumenteissa on viela auki olevia tyopakettikohtia. Suurin riski ei ole yksittainen bugi, vaan se, etta monta eri kokonaisuutta sekoittuu samaan commit- tai julkaisupakettiin.

## Toteutettu korijako 18.6.2026

Nykyinen tyopuu jaetaan seuraaviin koreihin. Mitään tiedostoa ei poisteta tai palauteta automaattisesti ennen kuin kori on erikseen hyvaksytty commitattavaksi.

### Kori A: kayttajalle nakyvat koodimuutokset

- `index.html`
- `kehitysjono.tsx`
- `localNewspaperLinks.ts`

Tarkistus ennen commitia:

- `npx vite build`
- etusivu
- kehitysjono
- paikallisuutisten naytto kunnissa, joita muutos koskee

### Kori B: dokumentit ja suunnitelmat

- `docs/elokuun-julkaisusuunnitelma.md`
- `docs/firebase-maaritys-ohje.md`
- `docs/paikallisuutiset-puuttuvat-kunnat.md`
- `docs/saavutettavuus-ja-tietosuoja-sivut-suunnitelma.md`
- `docs/security-workpackages.md`
- `docs/testauksen-palautelomake-suunnitelma.md`
- `docs/tietoturva-jatkotoiden-tyolista.md`
- `docs/huomisen-tyopaketti-2026-06-15.md`
- `docs/julkaisuroadmap-2026-10-06.md`
- `docs/julkaisuroadmap-tyopaketit-2026-10-06.json`
- `docs/keskeneraiset-tyot-valmiiksi-2026-06-18.md`
- `docs/nykyarkkitehtuuri-asiantuntijakuvaus-2026-06-14.md`
- `docs/nykyarkkitehtuuri-machine-readable-2026-06-14.json`
- `docs/palautelomake-kysymykset-2026-06.md`
- `docs/seuraava-tyopaketti-paatokset-ja-yllapitomalli-2026-06-14.md`
- `docs/suunnitelma-ui-uudistus-vedos-a.md`
- `docs/tietoturvasuunnitelma.md`
- `docs/ui-vedos-a-varivyohykkeet.html`
- `docs/ui-vedos-b-isot-kortit.html`
- `docs/codex-safe-browsing.md`

Tarkistus ennen commitia:

- varmista, ettei dokumentit lupaa valmiiksi asioita, jotka ovat vasta tuotantovaiheen ehtoja
- pidä paatosdokumentit erillaan koodimuutosten commitista, ellei muutos ole suoraan samaa pakettia

### Kori C: dokumenttien uudelleennimeamiset ja esitysaineistot

- poistuneet: `docs/SeniorSurfin-aloitussivu-esittely-tiimille.docx`
- poistuneet: `docs/SeniorSurfin-aloitussivu-esittely-tiimille-paivitetty.docx`
- poistunut: `docs/tiimiesittely-seniorsurfin-aloitussivu.md`
- uudet: `docs/aloitussivu-esittely-tiimille.docx`
- uudet: `docs/aloitussivu-esittely-tiimille-paivitetty.docx`
- uusi: `docs/tiimiesittely-aloitussivu.md`
- `docs/esitykset/`
- `agenda_suunnittelupalaveri_2026-08-12.docx`
- `SROI_Aloitussivu.xlsx`

Tarkistus ennen commitia:

- varmista, etta kyse on tarkoituksellisesta nimeamisen yhtenaistamisesta
- tarkista, tarvitaanko isot binaaritiedostot versiohallintaan vai riittaako dokumenttien lähde/polku

### Kori D: julkaisumetadata ja ikonit

- `public/apple-touch-icon.png`
- `public/favicon-32.png`
- `public/favicon.svg`

Tarkistus ennen commitia:

- selaimen favicon nakyy kehityspalvelimessa
- ikonit eivat ole vain tilapaisia kokeiluversioita

### Kori E: paikalliset tulosteet ja tarkistuskuvat

- `outputs/`

Tarkistus ennen commitia:

- commitataan vain sellaiset tulosteet, joita tarvitaan dokumentoiduksi artefaktiksi
- muut esikatselut pidetaan paikallisina tai lisataan tarvittaessa `.gitignore`-saantoon erillisella paatoksella

## Toteutuksen tilat 18.6.2026

| Kokonaisuus | Tila | Seuraava askel |
| --- | --- | --- |
| Tyopuun korijako | tehty dokumenttitasolla | valitse ensimmainen commit-kori |
| Kehitysjono | tarkistettu selaimessa | seuraa uudet palautteet normaalissa yllapidossa |
| Huijausvaroitusikkuna | koodissa mukana aiemmassa muutoksessa | uusi selaintesti, kun aktiivinen varoitus on nakyvissa |
| Linkkiehdotusten spammisuoja | pilottitaso tehty, tuotantotaso rajattu jatkoksi | dokumentoi tila jatkotyolistaan |
| Julkaisun ja yllapidon paatokset | minimilinjaukset kirjataan paatosdokumenttiin | ihmisen vahvistus ennen UI-muutoksia |
| Admin-oikeuksien yhtenainen malli | ei toteuteta koodissa ilman paatosta | dokumentoi tavoitemalli |
| Hostingin suojausotsikot | odottaa hosting-paatosta | pidetaan julkaisun porttiehtona |
| Elokuun asiat | siirretty tarkoituksella | ei kasitella taman viikon virheina |

## Tarkistukset 18.6.2026

Suoritetut tarkistukset:

- `npx vite build` onnistui.
- Etusivu latautui kehityspalvelimessa osoitteessa `http://127.0.0.1:5173/` ilman selaimen konsolivirheita.
- Kehitysjono latautui osoitteessa `http://127.0.0.1:5173/kehitysjono.html` ilman selaimen konsolivirheita.

Havainnot:

- Kehitysjonossa nakyi tarkistushetkella 2 kasiteltya ja 1 ei toteuteta -tilassa olevaa palautetta. Jonossa ei ollut uusia, arvioinnissa olevia, jonossa olevia tai tyon alla olevia palautteita.
- Huijausvaroitusmodaalia ei voitu lopullisesti selaintestata, koska etusivulla ei tarkistushetkella ollut avattavaa aktiivista huijausvaroitusta. Tama ei ole build-virhe, vaan testidatan/tilanteen rajaus.

Uusintatesti huijausvaroitukselle:

1. Varmista, etta Firestoressa tai paikallisessa datassa on aktiivinen huijausvaroitus.
2. Avaa etusivu.
3. Avaa varoituksen lisatiedot.
4. Tarkista, etta modaali avautuu, sulkeutuu Escape-nappaimella ja "Lue lisaa varoituksesta" vie lahteeseen tai yleiseen varoituslahteeseen.

## Tyopaketti 1: tyopuun katselmus ja commit-korit

Prioriteetti: korkea

Tavoite: erotetaan nykyiset muutokset toisistaan ennen uutta toteutusta.

Tehtavat:

1. Listaa muuttuneet, poistetut ja uudet tiedostot.
2. Jaa ne koreihin:
   - kayttajalle nakyvat koodimuutokset
   - dokumenttien paivitykset
   - esitykset ja toimistodokumentit
   - faviconit ja julkaisumetadata
   - paikalliset tarkistus- ja output-tiedostot
3. Tarkista dokumenttien uudelleennimeamiset:
   - vanhat `SeniorSurfin-...`-nimiset tiedostot
   - uudet `aloitussivu-...`-nimiset tiedostot
   - `tiimiesittely-seniorsurfin-aloitussivu.md` -> `tiimiesittely-aloitussivu.md`
4. Paata, mitka output-tiedostot ja esikatselukuvat kuuluvat versionhallintaan.
5. Tee ensimmainen commit vain yhdesta selkeasta korista.

Hyvaksymiskriteerit:

- `git status --short` on ymmarrettava ja jokainen jaljella oleva tiedosto kuuluu nimettyyn koriin
- yhtaan toisen tyokalun tai ihmisen muutosta ei peruta vahingossa
- seuraava commit-viesti on paatetty ennen stagingia

Ehdotettu commit:

```text
jarjesta keskenerainen tyopuu koreiksi
```

## Tyopaketti 2: 15.6. huijausvaroitus- ja kehitysjonopaketti loppuun

Prioriteetti: korkea

Tavoite: varmistetaan, etta 15.6. tyopaketin kayttajalle nakyva osa on oikeasti valmis.

Tehtavat:

1. Testaa huijausvaroitusikkuna selaimessa:
   - avautuu
   - sulkeutuu hiirella ja nappaimistolla
   - mahtuu mobiiliin ja desktopiin
   - "Lue lisaa varoituksesta" vie oikeaan lahteeseen
   - lahdelinkin puuttuessa linkki vie yleiseen huijausvaroitusten lahteeseen
2. Tarkista kielitekstit suomeksi, ruotsiksi ja englanniksi.
3. Testaa kehitysjono:
   - julkinen lukutila toimii
   - tyhja tila on ymmarrettava
   - yllapidon kirjautuminen nakyy mutta ei anna oikeuksia ilman adminia
4. Aja build.
5. Paivita muutosloki ja tyotuntiseuranta, jos nykyinen kirjaus ei kata lopullista testausta.

Hyvaksymiskriteerit:

- `npm run build` onnistuu
- valikoitu selaintesti on tehty osoitteisiin:
  - `/`
  - `/kehitysjono.html`
  - huijausvaroituksen avautuva ikkuna etusivulla
- muutosloki ei lupaa enempaa kuin toteutus tekee

Ehdotettu commit:

```text
viimeistele huijausvaroitus ja kehitysjono
```

## Tyopaketti 3: linkkiehdotusjonon spammisuoja vaiheeseen "riittava pilottiin"

Prioriteetti: korkea/keskitaso

Tavoite: suljetaan `JATKO-02` niin pitkalle, etta pilottijakso voidaan jatkaa ilman ilmeista massasyottoriskiin ja yllapidon kuormaan liittyvaa aukkoa.

Tama ei viela tarkoita taytta tuotantotason suojamallia, jos Cloudcity- tai Firebase Hosting -paatokset ovat kesken.

Tehtavat nyt:

1. Varmista nykyiset kevyet suojat:
   - URL normalisoidaan
   - `https://` on ensisijainen
   - vaaralliset skeemat hylataan
   - pituusrajat ovat seka lomakkeessa etta Firestore-saannoissa
   - honeypot-kentta on mukana
2. Lisaa dokumenttiin selkea rajaus:
   - nykyinen suoja on pilottitason kevyt suoja
   - tuotantotason suoja vaatii palvelinpuolen luonnin
3. Suunnittele tuotantovaihe erikseen:
   - uusi Cloud Function linkkiraportin luonnille
   - App Check
   - IP- tai App Check -kohtainen rate limit
   - palvelinpuolen URL-validointi
   - Firestore-kirjoituksen sulkeminen suoraan selaimelta

Hyvaksymiskriteerit:

- tavallinen kayttaja voi edelleen ilmoittaa rikkinnaisen linkin ilman kirjautumista
- bottimainen perussyotto vaikeutuu
- dokumentissa ei vaiteta, etta tayden tuotantotason spammisuoja on valmis
- `docs/tietoturva-jatkotoiden-tyolista.md` kertoo, mika osa on tehty ja mika jaa tuotantovaiheeseen

Ehdotettu commit:

```text
rajaa linkkiehdotusten spammisuoja pilottitasolle
```

## Tyopaketti 4: paatosdokumentin minimivastaukset

Prioriteetti: korkea

Tavoite: 14.6. paatos- ja yllapitomallipaketti ei jaa avoimeksi kaiken osalta. Kirjataan vahintaan viisi paatosta tai valiaikaista linjausta.

Paatettavat ensin:

1. Virallinen nimi.
2. Valiaikainen julkaisuosoite testauksen ajaksi.
3. Nakyvatko yllapito- ja kehitysjonolinkit julkisessa footerissa.
4. Kuka kasittelee palautteet ja linkki-ilmoitukset.
5. Rekisterinpitaja ja tietosuoja-/saavutettavuusyhteystieto.

Jos lopullista vastausta ei ole, kirjataan valiaikainen linja:

```text
Paatos: ei viela lopullinen
Valiaikainen malli:
Tarkistaja:
Viimeinen paiva paattaa:
```

Hyvaksymiskriteerit:

- `docs/seuraava-tyopaketti-paatokset-ja-yllapitomalli-2026-06-14.md` ei ole pelkka kysymyslista
- jokaisella viidella tarkeimmalla kohdalla on vastaus, valiaikainen malli tai nimetty omistaja
- toteutusta ei aloiteta niista kohdista, joissa paatos puuttuu

Ehdotettu commit:

```text
kirjaa julkaisun ja yllapidon minimipaatokset
```

## Tyopaketti 5: admin-oikeuksien malli tuotantopaatokseen asti

Prioriteetti: keskitaso

Tavoite: `JATKO-03` rajataan niin, etta tiedetaan mita tehdaan nyt ja mita vasta tuotantomallin lukittuessa.

Tehtavat nyt:

1. Dokumentoi nykyinen malli:
   - frontend
   - Firestore-saannot
   - Cloud Functionit
2. Tarkista, onko `localStorage` vain nayttamisen/debuggauksen apu vai oikeuden lahde.
3. Valitse tavoitemalli:
   - ensisijaisesti Firebase Auth custom claims tai UID-pohjainen tarkistus
4. Kirjaa siirtymasuunnitelma.

Hyvaksymiskriteerit:

- yllapitaja tietaa, miten uusi admin lisataan ja poistetaan
- dokumentti kertoo, mika nykyisessa mallissa on valiaikaista
- koodimuutoksia ei tehda ennen kuin tavoitemalli on paatetty

Ehdotettu commit:

```text
dokumentoi admin-oikeuksien tavoitemalli
```

## Tyopaketti 6: hosting- ja suojausotsikkopaatos

Prioriteetti: keskitaso

Tavoite: `JATKO-04` ei voi valmistua kokonaan ennen lopullista hosting-paatosta, mutta se voidaan siirtaa selkeaksi julkaisuehdoksi.

Tehtavat:

1. Kirjaa nykytila:
   - GitHub Pages ei kayta `firebase.json`-suojausotsikoita
   - Firebase Hosting tai Cloudcity tarvitaan, jos otsikot halutaan palvelintasolla voimaan
2. Paata valiaikainen testausmalli.
3. Lisaa ennen julkaisua tehtava tarkistus:
   - `curl -I` lopulliseen domainiin
   - CSP
   - HSTS
   - Referrer-Policy
   - X-Frame-Options tai `frame-ancestors`

Hyvaksymiskriteerit:

- nykyista testiosoitteen suojaustasoa ei kuvata vahingossa tuotantotasoiseksi
- roadmapissa on selkea portti: tuotantodomainin headerit tarkistetaan ennen julkaisua

Ehdotettu commit:

```text
selkeyta hostingin suojausotsikoiden paatos
```

## Tyopaketti 7: elokuulle siirrettavat asiat

Prioriteetti: matala nyt, korkea elokuussa

Tavoite: erotetaan tietoisesti myohemmaksi siirretyt asiat taman viikon keskeneraisista.

Siirretaan elokuulle:

- nimipaivadata tiedostopohjaiseksi ja vanhan tokenin poisto
- yllapidon sahkoposti-ilmoitusten toteutustapa
- testipalautteen laajempi P1/P2/P3-priorisointi, jos palautteita ei ole viela kertynyt
- Cloudcityn lopullinen siirto, ellei paatosta tehda jo nyt

Hyvaksymiskriteerit:

- `TODO_HUMAN.md` ja roadmap ovat keskenaan linjassa
- naita ei kasitella taman viikon "keskeneraisina virheina", vaan tarkoituksella ajoitettuina jatkotoina

## Suositeltu toteutusjarjestys

1. Tyopuun katselmus ja commit-korit.
2. Huijausvaroituksen ja kehitysjonon selaintesti.
3. Build ja mahdolliset pienet korjaukset.
4. Linkkiehdotusten spammisuojan pilottirajaus.
5. Viisi minimipaatosta paatosdokumenttiin.
6. Admin- ja hosting-mallit dokumentteihin, jos paatokset riittavat.
7. Muutosloki ja tyotuntiseuranta.

## Paivan lopun tavoitetila

Vahimmaisvalmis:

- palvelin kaynnistyy
- build menee lapi
- kehitysjono on testattu ja huijausvaroituksen uusintatestin ehto on kirjattu
- tyopuu on jaettu koreihin
- avoimet paatokset on nimetty

Hyva valmis:

- vahintaan yksi rajattu commit tehty
- 15.6. tyopaketti on suljettu
- `JATKO-02` on jaettu pilottitasoon ja tuotantotasoon
- 14.6. paatosdokumentissa on viisi minimivastausta tai valiaikaista linjausta

Paras valmis:

- tyopuu on siisti
- kaikki taman viikon keskeneraiset asiat on joko tehty, commitattu tai siirretty nimettyyn myohempaan pakettiin
- elokuulle siirretyt asiat eivat sekoitu taman viikon tyojonoon
