# 63 rikkinäiseksi ilmoitetun linkin loppuraportti 31.8.2026

Lähtöaineisto: `docs/linkit-korjauslistan-tilanne-2026-08-30.md`.
Korvaajien taustatyö: `docs/linkit-404-korvaajat-2026-08-30.md`.

## Lopputulos

Alkuperäisen listan 63 osoitteesta:

- 60 vanhaa osoitetta ei enää esiinny siinä lähdetiedostossa, jossa se oli raportoitu;
- 3 osoitetta jätettiin ennalleen, koska ne toimivat jälleen ja vastasivat tarkistushetkellä HTTP 200:lla;
- yhtään alkuperäisen listan oikeasti rikkoutunutta osoitetta ei jäänyt käyttäjälle näkyvään linkkidataan.

Viiden DNS-virheen ryhmästä Fredrika-kirjastojen kaksi osoitetta on korvattu nykyisillä kirjastosivuilla. Länsi-Uusimaan etusivu sekä Vimpelin etusivu ja RSS-syöte osoittautuivat tilapäisiksi DNS-häiriöiksi ja toimivat nyt. Vimpelin RSS vastasi lisäksi sisältötyypillä `application/rss+xml`.

Kaikki 58 vanhaa 404-osoitetta on poistettu alkuperäisistä lähdetiedostoistaan tai korvattu. Valtaosa korjauksista oli jo tehty ennen tätä loppukierrosta. Tällä kierroksella ratkaistiin neljä viimeistä tapausta:

| Kohde | Ratkaisu | Peruste |
| --- | --- | --- |
| Rantasalmen englanninkielinen sivu | Korvattiin osoitteella `https://rantasalmi.fi/briefly-in-english/municipality-and-administration/` | Virallinen nykyinen englanninkielinen sivu, HTTP 200 |
| Uudenkaupungin kirjaston digiopastus | Rikkinäinen footnote-osoite poistettiin ja korvattiin kuvaavalla tekstillä; toimiva kirjastopalvelujen osoite säilytettiin | Virallinen kirjastopalvelujen sivu mainitsee digiopastuksen, HTTP 200 |
| Outokummun Välke ry:n digineuvonta | Koko opastuspaikka poistettiin listalta | Yhdistyksen oma ajankohtaissivu kertoo digineuvonnan päättyneen 18.12.2025 ainakin toistaiseksi |
| Tuulensuun palvelukeskuksen Seniorit Surffaa | Koko opastuspaikka poistettiin listalta | Nykyinen virallinen palveluluettelo ei enää sisällä palvelua eikä vanhan aikataulun tai puhelinnumeron ajantasaisuutta voitu vahvistaa |

Lisäksi kaksi taustaraportissa epävarmaksi jäänyttä korvaajaa tarkistettiin sisällön tasolla:

- Kiuruveden virallisen sivun WordPress-rajapinta vahvisti, että paikallisliikenteen sivu sisältää nimenomaan PALI-palveluliikenteen aikataulut, hinnat, esteettömyystiedon ja tilausnumeron. Korvaaja säilytettiin.
- Vöyrin kirjaston englanninkieliseksi vaihdettu osoite korvattiin saman virallisen sivun suomenkielisellä kieliversiolla `https://www.vora.fi/fi/palvelut/kirjasto/voyrin-paakirjasto/`. Sivusto ilmoittaa sen itse englanninkielisen sivun `hreflang="fi-fi"`-vastineeksi, ja osoite vastasi HTTP 200.

## Uusintatarkistus

Korvaajaraportin linkitetyt kohteet, kolme ennalleen jätettyä osoitetta ja viimeisten tapausten viralliset näyttösivut tarkistettiin verkosta 31.8.2026:

- tarkistettuja uniikkeja osoitteita 56;
- 55 vastasi hyväksytysti ensimmäisellä kierroksella;
- Helsingin Kampin palvelukeskuksen sivu aikakatkaistiin ensimmäisellä 25 sekunnin yrityksellä mutta vastasi uusinnassa HTTP 200;
- lopputulos 56/56 tavoitettavissa.

Vöyrin myöhemmin löydetty suomenkielinen vastine tarkistettiin tämän joukon lisäksi ja vastasi HTTP 200.

Tämä verkkotarkistus täydentää sisällöllisen varmennuksen, joka on dokumentoitu korvaajaraportissa. HTTP 200 yksin ei ole peruste hyväksyä verkkotunnusten kauppapaikkaa tai väärää palvelua.

## Kooditarkistukset

Kaikki seuraavat tarkistukset läpäisivät:

- `npm run build:link-catalog`: 2 374 linkkiä, joista 2 357 HTTPS- ja 17 HTTP-osoitetta;
- `npm run test:link-catalog`: PASS ja kattavuusvahti OK;
- `npm run test:link-policy`: PASS;
- `npx tsc --noEmit -p tsconfig.json`: PASS;
- `npm run check:secrets`: PASS;
- `npm run build`: PASS.

Vite ilmoitti vain ennestään tunnetut varoitukset Firestore-moduulin staattisesta ja dynaamisesta tuonnista sekä yli 500 kt:n pääpalasta. Ne eivät liity linkkidatan korjauksiin eivätkä estäneet tuotantobuildia.

## Julkaisutila

Korjaukset ja raportti ovat paikallisessa työpuussa. Tätä linkkidatan loppukierrosta ei ole vielä paketoitu eikä viety tuotantoon.
