# Julkisten alasivujen kieliversiot 28.8.2026

## Toteutettu kattavuus

| Sivu | Suomi | Ruotsi | Englanti | Hakukonenäkyvyys |
|---|---|---|---|---|
| Linkkiluettelo | `linkit.html` | `linkit-sv.html` | `linkit-en.html` | `noindex`, ei sivukartassa |
| Tietosuoja | `tietosuoja.html` | `tietosuoja-sv.html` | `tietosuoja-en.html` | indeksoitava, kaikki versiot sivukartassa |
| Saavutettavuusseloste | `saavutettavuus.html` | `saavutettavuus-sv.html` | `saavutettavuus-en.html` | indeksoitava, kaikki versiot sivukartassa |

Jokaisella sivulla on FI/SV/EN-kielivalitsin, oikea HTML-kielimääritys sekä kielikohtainen otsikko, kuvaus, canonical-osoite ja `hreflang`-linkitys. Etusivun alatunniste ohjaa ruotsiksi ja englanniksi vastaavaan kieliversioon. Alasivulla valittu kieli siirtyy myös etusivun kielivalinnaksi.

Linkkiluettelossa käyttöliittymä, tilastot, välilehdet, taulukko-otsikot, kategoriat ja CSV-viennin otsikot on käännetty. Ulkoisten palvelujen nimet, kuntien nimet ja palveluntarjoajien viralliset nimet säilyvät lähdeaineiston mukaisina.

## Testaus

- TypeScript-tarkistus läpäisty.
- Cloudcity-tuotantorakennus läpäisty.
- Kaikki yhdeksän osoitetta avattu paikallisesta tuotantorakennuksesta selaimessa.
- Jokaisesta osoitteesta tarkistettu dokumentin kieli, sivuotsikko, pääotsikko, kielivalitsin ja aktiivinen kieli.
- Ruotsin- ja englanninkielisten etusivujen alatunnistelinkit tarkistettu.
- Selainkonsolissa ei ollut virheitä.

## Etusivun kovakoodausauditointi 29.8.2026

Ruotsin- ja englanninkielisestä käyttöliittymästä poistettiin vielä etusivun yhteisiin komponentteihin jääneet suomenkieliset kovakoodaukset. Tarkistus kattoi yläpalkin ja alatunnisteen, haku- ja puhepainikkeet, asetukset ja aikavyöhykkeet, kiinnostavat teemat, aluepalvelut, palautteen, linkki-ilmoituksen, ohjeen, tietomodaalin, esittelykierroksen ja palvelumodaalit.

Käännösavainten kattavuus tarkistettiin koneellisesti: suomen-, ruotsin- ja englanninkielisissä pääsanastoissa sekä lisäsanastoissa on samat avaimet. Myös datasta muodostuvat yleiset ryhmä- ja aluenimet lokalisoidaan. Kuntien nimet näytetään ruotsiksi virallisella ruotsinkielisellä nimellä silloin, kun sellainen on rekisterissä.

Ulkoisten palvelujen, viranomaisten, yhdistysten ja muiden palveluntarjoajien virallisia nimiä ei konekäännetä. Ne voivat siksi sisältää suomea myös ruotsin- ja englanninkielisessä näkymässä ilman, että kyse on käyttöliittymän kovakoodauksesta.

## Ennen tuotantoon vientiä

- Ruotsin- ja englanninkielinen tietosuojateksti tarkistutetaan tietosuojasta vastaavalla henkilöllä.
- Ruotsin- ja englanninkielinen saavutettavuusseloste tarkistutetaan kielen ja viranomaistermien osalta.
- Ukrainan-, viron-, venäjän- ja pohjoissaamenkielisiä alasivuja ei ole vielä toteutettu. Näillä etusivun kielillä alasivulinkit ohjaavat toistaiseksi suomenkielisiin versioihin.

Tätä muutosta ei ole vielä viety tuotantoon.
