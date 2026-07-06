# Huomisen työpaketti 15.6.2026

## Päätavoite

Saadaan nykyinen keskeneräinen työpuu hallittuun tilaan ja viedään seuraava pieni mutta käyttäjälle näkyvä kokonaisuus valmiiksi: huijausvaroitusten avautuva ikkuna, muutoslokin ajantasaisuus ja tietoturvan seuraavan työpaketin valmistelu.

Tavoite ei ole aloittaa montaa uutta isoa ominaisuutta, vaan sulkea avoimet langat siististi.

## Ehdotettu työjärjestys

### 1. Avoimen työpuun katselmus

Arvioidaan ensin nykyiset muuttuneet ja uudet tiedostot:

- mitkä muutokset ovat valmiita commitattavaksi
- mitkä ovat käyttäjän tai Clauden tekemiä muutoksia, joita ei pidä muuttaa
- mitkä tiedostot kuuluvat samaan kokonaisuuteen
- mitkä kannattaa jättää myöhemmäksi

Erityishuomio:

- `components/ScamAlertsBanner.tsx`
- `i18n.tsx`
- `index.html`
- `kehitysjono.tsx`
- dokumenttien nimetyt siirrot ja uudet dokumentit
- favicon- ja logo-tiedostot

Hyväksyttävä lopputulos:

- tiedetään, mikä on seuraava turvallinen commit-kokonaisuus
- mitään käyttäjän tai toisen työkalun muutosta ei vahingossa peruta

Arvio:

- ihminen: 15-30 min
- Codex/toteutus: 30-60 min

### 2. Huijausvaroitusikkunan viimeistely

Nykyisessä työpuussa on jo muutos, jossa huijausvaroituksen avautuva ikkuna on isompi ja siinä on aina "Lue lisää varoituksesta" -linkki. Tämä kannattaa viimeistellä omaksi rajatuksi kokonaisuudeksi.

Tarkistetaan:

- modaali mahtuu työpöydällä ja mobiilissa ruutuun
- otsikot ja leipäteksti ovat riittävän suuret
- sulje-painike on selkeä ja näppäimistöllä käytettävissä
- "Lue lisää varoituksesta" vie ensisijaisesti varoituksen omaan lähteeseen
- jos lähdelinkkiä ei ole, linkki vie yleiseen huijausvaroitusten listaan
- kieliversiot löytyvät vähintään suomeksi, ruotsiksi ja englanniksi

Hyväksyttävä lopputulos:

- `npx vite build` menee läpi
- pikainen selaintesti vahvistaa, että ikkuna avautuu ja sulkeutuu
- muutos voidaan commitata erillisenä kokonaisuutena

Mahdollinen commit-viesti:

`huijausvaroitusten ikkuna selkeämmäksi`

Arvio:

- ihminen: 15-30 min
- Codex/toteutus: 45-90 min

### 3. Muutosloki ja työloki ajan tasalle

Kun huijausvaroitusikkuna on viimeistelty, päivitetään:

- muutosloki
- työtuntiseuranta
- tarvittaessa kehitysjono, jos sinne kuuluu jatkohuomioita

Hyväksyttävä lopputulos:

- muutosloki kertoo selkeästi, mitä käyttäjälle muuttui
- työlokiin tulee arvio ihmisen ja Codexin työstä
- dokumentointi ei sekoitu muihin keskeneräisiin tiedostoihin

Arvio:

- ihminen: 10-15 min
- Codex/toteutus: 20-40 min

### 4. Tietoturvan seuraavan palan valmistelu: linkkiehdotusjonon spammisuoja

Jos aikaa jää, aloitetaan tietoturvalistan seuraava konkreettinen työ: JATKO-02, eli linkkiehdotusjonon spammisuoja.

Ensimmäinen vaihe kannattaa rajata suunnitteluun ja toteutuskohtien varmistamiseen:

- missä linkkiehdotus nyt tallennetaan
- mitä Firestore-säännöt sallivat
- onko nykyisessä palautelomakkeessa ja linkki-ilmoituksessa sama vai eri tallennuspolku
- mitä kannattaa siirtää Cloud Functionin kautta
- mitä voidaan tehdä heti ilman tuotantoympäristön rikkomista

Mahdollinen toteutuksen ensimmäinen osa:

- URL-validointi tiukemmaksi
- `https://` ensisijaiseksi
- pituusrajat ja pakolliset kentät selkeiksi
- honeypot-kenttä lomakkeeseen
- palvelinpuolen toteutussuunnitelma erilliseen tiedostoon, jos Cloud Function vaatii enemmän työtä

Hyväksyttävä lopputulos:

- syntyy pieni toteutettava suunnitelma tai ensimmäinen rajattu PR/commit
- ei rikota tavallisen käyttäjän mahdollisuutta ilmoittaa rikkinäisestä linkistä

Mahdollinen commit-viesti, jos toteutetaan koodia:

`linkkiehdotusten spammisuojan aloitus`

Arvio:

- ihminen: 20-40 min
- Codex/toteutus: 1-3 h

## Mitä ei kannata tehdä huomenna

- ei aloiteta isoa visuaalista uudistusta
- ei tehdä täyttä linkkitarkistusajoa, ellei sille varata erikseen aikaa
- ei yhdistetä huijausvaroitusikkunaa, dokumenttisiirtoja, faviconeja ja tietoturvaa samaan commitiin
- ei peruta tai siivota muiden tekemiä muutoksia ilman erillistä päätöstä

## Suositeltu päivän lopetus

Päivän lopuksi pitäisi olla vähintään yksi näistä valmiina:

1. huijausvaroitusikkuna commitattu ja pushettu
2. avoimen työpuun tilanne kirjattu ja seuraavat commit-kokonaisuudet nimetty
3. linkkiehdotusjonon spammisuojasta tehty toteutuskelpoinen aloitussuunnitelma

Paras lopputulos:

- huijausvaroitusikkuna valmis
- muutosloki ja työloki päivitetty
- seuraava tietoturvapala rajattu toteutettavaksi
- työpuussa ei ole uusia epäselviä muutoksia

## Aamun aloituskomennot

```powershell
git status --short
npx vite build
```

Jos build on vihreä, jatketaan huijausvaroitusikkunan selaintestillä. Jos build ei ole vihreä, korjataan build ensin ennen uusia muutoksia.
