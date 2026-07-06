# Puuttuvien alueellisten linkkien taydennyssuunnitelma

Paivays: 22.6.2026

## Tavoite

Taman suunnitelman tavoite on luoda turvallinen tapa taydentaa `Lähelläsi`-osion alueellisia linkkeja niin, etta:

1. puuttuvat kuntakohtaiset linkit loytyvat jarjestelmällisesti
2. viereisen kunnan tai seudun palveluja voidaan kayttaa hallitusti, kun omaa linkkia ei ole
3. kayttajalle kerrotaan selvasti, mista kunnasta tai alueelta linkki on
4. etusivulle ei synny harhaanjohtavaa vaikutelmaa, etta naapurikunnan palvelu olisi kayttajan oman kunnan palvelu

## Periaate

Alueellista linkkia ei lisata pelkan arvauksen perusteella. Jokaisella lisatylla linkilla pitaa olla:

- palvelun nimi
- URL
- aihealue
- palvelun oma kunta, seutu tai hyvinvointialue
- tieto siita, onko linkki kayttajan oman kunnan linkki, seudullinen linkki vai naapurikunnan fallback
- lahde tai tarkistusmerkinta

Kayttajalle naytetaan naapurikunnan linkki vain, jos se on todennakoisesti hyodyllinen ja sen alkupera kerrotaan nakyvasti.

## Nykyinen tilanne koodissa

Nykyinen `Provider`-malli sisaltaa:

- `name`
- `url`
- `group`
- `phone`
- `phoneUrl`

Osassa alueellisista aineistoista kaytetaan jo laajempaa `RegionalProvider`-tietoa, jossa voi olla esimerkiksi kunta, kunnat tai alue. Kayttoliittyman peruslinkki ei kuitenkaan viela kerro johdonmukaisesti, onko linkki oman kunnan, seudun vai viereisen kunnan palvelu.

Tarvittava parannus on siis pieni metatietokerros, ei koko datamallin uusiminen.

## Ehdotettu datamalli

Laajennetaan alueellisten linkkien metatietoa seuraavilla kentilla.

```ts
type RegionalProviderScope = 'municipality' | 'regional' | 'wellbeingArea' | 'neighbor' | 'nationalFallback';

interface RegionalProviderMeta {
  municipality?: string;
  municipalities?: string[];
  area?: string;
  sourceMunicipality?: string;
  sourceArea?: string;
  scope?: RegionalProviderScope;
  fallbackFor?: string[];
  sourceNote?: string;
  verifiedAt?: string;
}
```

Kenttien merkitys:

| Kentta | Kaytto |
| --- | --- |
| `municipality` | linkki kuuluu yhteen kuntaan |
| `municipalities` | linkki palvelee useita kuntia |
| `area` | linkki kuuluu seutuun, maakuntaan tai hyvinvointialueeseen |
| `sourceMunicipality` | linkin varsinainen kunta, jos linkkia naytetaan toiselle kunnalle |
| `sourceArea` | linkin varsinainen seutu tai alue |
| `scope` | miten linkki suhteutuu valittuun kuntaan |
| `fallbackFor` | kunnat, joille linkkia naytetaan fallbackina |
| `sourceNote` | yllapitajan lyhyt perustelu |
| `verifiedAt` | tarkistuspaiva |

Esimerkki:

```ts
{
  name: 'Naapurikunnan asiointiliikenne',
  url: 'https://example.fi/asiointiliikenne',
  group: 'Julkinen liikenne',
  municipality: 'Naapurila',
  sourceMunicipality: 'Naapurila',
  scope: 'neighbor',
  fallbackFor: ['Pienikunta'],
  sourceNote: 'Pienikunnan sivu ohjaa asiointiliikenteen Naapurilan palveluun.',
  verifiedAt: '2026-08-04',
}
```

## Miten puuttuvat linkit etsitään

### 1. Tee puuttuvien kuntien raportti aiheittain

Jokaiselle linkkityypille tehdään oma raportti:

- julkinen liikenne ja palveluliikenne
- kirjastot
- paikallislehdet ja RSS-syotteet
- paikalliset palvelut
- liikunta ja urheiluseurat
- museot ja kulttuuri
- elakeyhdistykset ja potilasyhdistykset

Raportissa verrataan kuntarekisterin kaikkia kuntia siihen, löytyykö kunnalle:

1. oma kuntakohtainen linkki
2. seudullinen linkki
3. hyvinvointialueen linkki
4. naapurikunnan tai lähialueen fallback
5. valtakunnallinen fallback

Tulosluokat:

| Tila | Merkitys |
| --- | --- |
| `ok-own` | kunnalla on oma linkki |
| `ok-regional` | kunnalla on seudullinen tai alueellinen linkki |
| `ok-neighbor` | kunnalle naytetaan perusteltu naapurikunnan linkki |
| `fallback-national` | kaytossa on valtakunnallinen fallback |
| `missing` | ei linkkia |
| `needs-review` | linkki loytyi, mutta alkupera tai soveltuvuus on epaselva |

### 2. Etsi linkit ensisijaisista lahteista

Hakujarjestys:

1. kunnan omat verkkosivut
2. seudullisen toimijan sivut
3. hyvinvointialueen sivut
4. virallinen palveluntuottaja tai kattojärjestö
5. paikallislehti tai yhdistyksen oma sivu
6. luotettava valtakunnallinen hakemisto

Valtio-, kunta- ja järjestölähteet ovat ensisijaisia. Satunnaisia hakutuloksia, vanhoja tapahtumasivuja tai Facebook-ryhmiä ei nosteta `Lähelläsi`-osioon ilman vahvaa syytä.

### 3. Kayta yhtenaisia hakulauseita

Kullekin kunnalle haetaan samoilla kaavoilla. Esimerkkeja:

```text
"{kunta}" "palveluliikenne"
"{kunta}" "julkinen liikenne"
"{kunta}" "kirjasto"
"{kunta}" "eläkeläiset"
"{kunta}" "eläkeyhdistys"
"{kunta}" "potilasyhdistys"
"{kunta}" "liikuntapalvelut"
"{kunta}" "museo"
"{kunta}" "paikallislehti"
"{kunta}" "uutiset"
site:{kunnan-domain} palveluliikenne
site:{kunnan-domain} seniorit
```

Jos kunnan oma sivu ohjaa seudulliseen tai naapurikunnan palveluun, se on paras peruste fallbackille.

### 4. Tarkista linkin soveltuvuus

Linkki voidaan lisata, jos kaikki ehdot tayttyvat:

- URL toimii
- sivu on julkinen
- palvelu on edelleen kaynnissa tai sivua yllapidetaan
- linkin alueellinen kattavuus on ymmarrettava
- linkki ei ole vain yksittainen vanhentunut uutinen
- linkki palvelee kohderyhmaa tai yleista asiointia

Jos linkki on vain osittain soveltuva, se merkitään `needs-review`-tilaan.

## Miten viereisen kunnan tietoja voidaan lisata

Naapurikunnan tietoja ei lisata automaattisesti vain siksi, etta se on kartalla lahella. Tarvitaan jokin perustelu.

Hyvaksyttavat perusteet:

1. Valittu kunta itse ohjaa naapurikunnan palveluun.
2. Palvelu on virallisesti seudullinen, mutta sivu on naapurikunnan domainissa.
3. Palvelu toimii usean kunnan yhteisena hankintana tai sopimuksena.
4. Sama kirjasto-, liikenne-, kulttuuri- tai sote-alue palvelee molempia kuntia.
5. Kunnalla ei ole omaa palvelua, mutta naapurikunnan palvelu on kaytannossa lahin julkinen asiointikanava.

Ei-hyvaksyttavat perusteet:

- linkki on vain hakukoneessa ensimmainen tulos
- palvelu kuulostaa samalta, mutta kattavuus ei kay ilmi
- naapurikunnan palvelu vaatii asumista kyseisessa kunnassa
- palvelu on maksullinen kaupallinen palvelu ilman julkista tai yhdistyspohjaista perustetta
- sivu on vanha tiedote, tapahtuma tai PDF ilman yllapidettya palvelusivua

## Naapurikunnan fallbackin tasot

Fallbackit kannattaa jakaa kolmeen tasoon:

### Taso 1: virallinen yhteinen palvelu

Naytetaan melko rohkeasti.

Esimerkki:

- HSL, Nysse, Föli, Linkki, Vilkku
- kirjastokimppa
- hyvinvointialue
- seudullinen palveluliikenne

Nakyma kayttajalle:

```text
HSL
Seudullinen palvelu: Helsinki, Espoo, Vantaa, Kauniainen
```

### Taso 2: kunnan ohjaama naapuripalvelu

Naytetaan, mutta alkupera kerrotaan selvästi.

Esimerkki:

```text
Asiointiliikenne
Naapurikunnan palvelu: Naapurila. Pienikunnan sivu ohjaa tahan palveluun.
```

### Taso 3: yleinen valtakunnallinen fallback

Naytetaan vasta, jos paikallista tai seudullista linkkia ei ole.

Esimerkki:

```text
Matkahuollon reittiopas
Valtakunnallinen haku, koska kunnalle ei ole viela omaa paikallisliikenteen linkkia.
```

## Miten kerrotaan selkeasti, mista kunnasta linkki on

Kayttoliittymaan lisataan linkkikortille pieni alkuperarivi.

Ehdotettu esitystapa:

| Tilanne | Kortin lisateksti |
| --- | --- |
| oma kunta | `Oman kunnan palvelu` |
| usean kunnan seutu | `Seudullinen palvelu: {alue}` |
| hyvinvointialue | `Hyvinvointialue: {alue}` |
| naapurikunta | `Naapurikunnan palvelu: {kunta}` |
| valtakunnallinen fallback | `Valtakunnallinen haku` |

Jos tila on naapurikunta tai valtakunnallinen fallback, tekstin pitaa olla nakyva, ei pelkka tooltip.

Esimerkki Vantaa:

```text
Vantaan palvelut
Oman kunnan palvelu
```

Esimerkki pienelle kunnalle:

```text
Naapurilan asiointiliikenne
Naapurikunnan palvelu: Naapurila
```

Esimerkki seudulle:

```text
Föli
Seudullinen palvelu: Turun seutu
```

## Suositeltu UI-muutos

`RegionalServicesPanel`-kortissa nimen ja kategorian lisaksi naytetaan `scopeLabel`.

Kortin rakenne:

```text
[ikoni] Palvelun nimi                 ->
        Kategoria
        Alkupera: Oman kunnan palvelu / Seudullinen palvelu / Naapurikunnan palvelu
```

Lyhyt vaihtoehto:

```text
Palvelun nimi
Julkinen liikenne · Seudullinen palvelu: Turun seutu
```

Saavutettavuus:

- sama tieto pitaa sisaltya linkin saavutettavaan nimeen tai kortin tekstisisaltoon
- pelkka vari tai ikoni ei riita
- naapurikuntamerkinta ei saa olla liian pieni

## Toteutusvaiheet

### Vaihe 1: raportointi

Toteuta skripti, joka tuottaa aihekohtaisen puutelistan.

Tulosteet:

- `docs/alueelliset-linkit-puuttuvat-kunnat.md`
- `outputs/regional-link-coverage.json`

Raportissa jokaisesta kunnasta näkyy:

- kunta
- hyvinvointialue
- nykyiset alueelliset linkit
- puuttuvat kategoriat
- nykyinen fallback
- tarkistuksen tila

### Vaihe 2: metatietomalli

Laajenna alueellisten providerien tyyppi niin, että linkin alkupera voidaan päätellä ilman nimen parsimista.

Tarvittavat kentat:

- `scope`
- `sourceMunicipality`
- `sourceArea`
- `fallbackFor`
- `verifiedAt`
- `sourceNote`

### Vaihe 3: nayttoteksti

Lisaa helper-funktio:

```ts
getRegionalProviderScopeLabel(provider, context)
```

Sen tehtava:

- palauttaa `Oman kunnan palvelu`, jos linkki kuuluu valittuun kuntaan
- palauttaa `Seudullinen palvelu: {alue}`, jos linkki kuuluu seutuun
- palauttaa `Naapurikunnan palvelu: {kunta}`, jos `scope === 'neighbor'`
- palauttaa `Valtakunnallinen haku`, jos kyseessa on fallback

### Vaihe 4: UI

Paivita `ServiceLink` nayttamaan scope-teksti kategorian alla.

Naapurikunnan linkeille voi kayttaa hillittya lisamerkintaa:

```text
Naapurikunnan palvelu
```

Ei kuitenkaan varoitusvaria, koska kyse ei ole virheesta.

### Vaihe 5: tietojen taydennys

Kay lapi kunnat aiheittain:

1. aloita julkisesta liikenteesta, koska olemassa on jo puutelista
2. jatka kirjastoihin
3. jatka paikallislehtiin ja uutisiin
4. jatka liikuntaan, kulttuuriin ja yhdistyksiin

Tee lisaykset pienina koreina:

- yksi hyvinvointialue tai maakunta kerrallaan
- yksi linkkityyppi kerrallaan
- jokaisen korin jalkeen `npx vite build`
- pistokoe 2-3 kunnalla

## Tarkistuslista jokaiselle lisatylle linkille

```text
Kunta:
Aihe:
Linkin nimi:
URL:
Oma kunta / seutu / hyvinvointialue / naapurikunta / fallback:
Jos naapurikunta, miksi se sopii:
Kayttajalle naytettava alkuperateksti:
Tarkistettu paiva:
Tarkistaja:
```

## Esimerkkipaatos naapurikunnan linkille

```text
Kunta: Pienikunta
Aihe: palveluliikenne
Linkin nimi: Naapurilan asiointiliikenne
URL: https://naapurila.fi/asiointiliikenne
Tyyppi: naapurikunta
Peruste: Pienikunnan oma verkkosivu ohjaa asiointiliikenteen Naapurilan palveluun.
Kayttajalle naytetaan: Naapurikunnan palvelu: Naapurila
Tila: hyvaksytty
```

## Riskit

| Riski | Vaikutus | Vastatoimi |
| --- | --- | --- |
| Naapurikunnan linkki nayttaa oman kunnan palvelulta | kayttaja harhautuu | nayta aina alkuperakunta |
| Hakukone loytaa vanhan sivun | linkki vanhenee tai johtaa vaarin | tarkista sivun paivays ja kunnan oma navigaatio |
| Fallbackeja lisataan liikaa | `Lähelläsi` muuttuu epatarkaksi | kayta fallbackeja vasta oman ja seudullisen linkin jalkeen |
| Datamalli paisuu | yllapito vaikeutuu | lisaa vain alkuperan kannalta tarpeelliset kentat |
| Kuntien kieliversiot unohtuvat | ruotsinkielinen kunta saa huonon linkin | tarkista ruotsinkieliset kunnat erikseen |

## Suositeltu ensimmainen toteutuskori

Ensimmainen toteutuskori kannattaa rajata julkiseen liikenteeseen, koska siita on jo puutelista.

Kori:

1. lisaa metatiedot julkisen liikenteen fallbackeille
2. nayta kortissa `Oman kunnan palvelu`, `Seudullinen palvelu` tai `Valtakunnallinen haku`
3. testaa esimerkiksi:
   - Helsinki: seudullinen HSL
   - Akaa: seudullinen VAU-liikenne
   - pieni fallback-kunta: Matkahuollon reittiopas valtakunnallisena hakuna
4. paivita raportti ja tyoloki

Mahdollinen commit:

```text
merkitse alueellisten linkkien alkupera
```

## Toteutettu 22.6.2026

Ensimmainen toteutuskori tehtiin valmiiksi:

- `Provider`-datamalliin lisattiin alueellisen linkin alkuperakentat:
  - `municipality`
  - `municipalities`
  - `area`
  - `sourceMunicipality`
  - `sourceArea`
  - `scope`
  - `fallbackFor`
  - `sourceNote`
  - `verifiedAt`
- `localServices.ts` paattelee nyt linkin alkuperan nykyisista ja uusista kentista.
- `Lähelläsi`-osion palvelukortit näyttävät alkuperän:
  - oman kunnan palvelu
  - seudullinen palvelu
  - hyvinvointialue
  - naapurikunnan palvelu
  - valtakunnallinen haku
- Kategoriasta avautuva linkkimodaali näyttää saman alkuperätiedon, kun käyttäjän kunta on tiedossa.
- Julkisen liikenteen fallback `Matkahuollon reittiopas` merkitään valtakunnalliseksi hauksi.
- HSL:n, Fölin, Nyssen ja muiden seudullisten liikennealueiden linkit merkitään seudullisiksi palveluiksi.
- Hyvinvointialueen palvelu- ja tiedotelinkit merkitään hyvinvointialueen linkeiksi.
- Kunnan omat sivut, paikallislehdet ja palveluliikenne merkitään oman kunnan palveluiksi silloin, kun kunta on tiedossa.
- Uusi komento `npm run regional-coverage` tuottaa:
  - `docs/alueelliset-linkit-puuttuvat-kunnat.md`
  - `outputs/regional-link-coverage.json`

Tarkistukset:

- `npm run regional-coverage` onnistui.
- `npx vite build` onnistui.
- Playwright-pistokoe:
  - Vantaa näytti HSL:n seudullisena palveluna, hyvinvointialueen omalla merkinnällä ja Vantaan palvelut oman kunnan palveluna.
  - Alajärvi näytti Matkahuollon reittioppaan valtakunnallisena hakuna.

Seuraavaksi tehtävä täyttötyö:

- Käydään `fallback-national`-kunnat läpi hyvinvointialue tai maakunta kerrallaan.
- Korvataan Matkahuollon fallback paikallisella tai seudullisella linkillä vain, kun virallinen lähde löytyy.
- Lisätään naapurikunnan linkki vain suunnitelman hyväksymillä perusteilla ja merkitään se `scope: 'neighbor'` -tiedolla.
