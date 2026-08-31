# Codex-tehtävä: sääkortin lähdelinkki ja kaksi kiireellistä linkkikorjausta

Päivitetty: 30.8.2026
Koskee: `components/WeatherCard.tsx`, `communityLinks.ts`, `i18n.tsx`
Liittyy: `docs/linkit-mittaus-analyysi-2026-08-30.md`, `docs/linkit-korjattavat-2026-08-30-aamu.md`

---

## SK-01 · Sääkortista pääsee tarkempaan säätietoon (P2) — **TOTEUTETTU 30.8.2026**

> **Tila: tehty.** `components/WeatherCard.tsx` + `i18n.tsx` (7 kieltä, uusi avain `weatherDetailsLocal`). Uusi tila `fmiMunicipality` pitää kunnan suomenkielisen nimen, `weatherDetailsUrl` rakentaa osoitteen `…/saa/<kunta>` ja varamallina etusivun. Lisättiin näkyvä linkkirivi lämpötilan alle (vain iso variantti, min 44 px, alleviivattu). Koko kortista EI tehty linkkiä. `tsc --noEmit` puhdas. Eeron testattava `npm run build` + selain.


### Nykytila

Linkki on jo olemassa, mutta se on käytännössä piilossa ja vie väärään paikkaan.

`components/WeatherCard.tsx:525–535`: klikattava alue on **pelkkä sää-emoji** (🌤️), ja se vie osoitteeseen `https://www.ilmatieteenlaitos.fi/` eli Ilmatieteen laitoksen etusivulle. Sieltä käyttäjän pitäisi itse etsiä oma kuntansa.

Kaksi ongelmaa:

1. **Ei löydettävissä.** Emoji ympyrän sisällä ei näytä linkiltä. Ruudunlukijalle `aria-label` (`weatherDetails`, fi: *"Katso tarkempi sää Ilmatieteen laitokselta"*) on kunnossa, mutta näkevä käyttäjä ei saa mitään vihjettä siitä että kuvaketta voi painaa. Kohderyhmässä tämä tarkoittaa, ettei kukaan paina sitä.
2. **Vie etusivulle, ei omaan kuntaan.** Kortti tietää jo käyttäjän kunnan, joten linkin voi viedä suoraan perille.

### Osoitemuoto — varmennettu 30.8.2026

Ilmatieteen laitoksen paikallissääsivu on muotoa:

```
https://www.ilmatieteenlaitos.fi/saa/<Kunnan suomenkielinen nimi>
```

Tarkistettu selaimella kahdella tapauksella:

| Osoite | Sivun otsikko | Tulos |
| --- | --- | --- |
| `…/saa/Tampere` | Sää Tampere – Ilmatieteen laitos | toimii |
| `…/saa/Pedersören%20kunta` | Sää Pedersören kunta – Ilmatieteen laitos | toimii, myös välilyönnillä ja ä-kirjaimella |

### Mitä tehdä

1. **Käytä kunnan suomenkielistä kanonista nimeä**, älä lokalisoitua. Kortissa on jo molemmat: `municipalityInfo?.name` on suomenkielinen nimi, kun taas `getLocalizedMunicipalityName(...)` palauttaa käyttöliittymän kielen mukaisen nimen. **Ruotsinkielinen tai englanninkielinen nimi ei toimi Ilmatieteen laitoksen osoitteessa**, joten näkyvä teksti saa olla lokalisoitu mutta osoitteen on käytettävä suomenkielistä nimeä.
2. **Enkoodaa nimi** `encodeURIComponent`-funktiolla. Nimissä on välilyöntejä ja ääkkösiä (`Pedersören kunta`, `Koski Tl`, `Hämeenlinna`).
3. **Varamalli:** jos kuntaa ei ole tiedossa tai käyttäjä ei ole Suomessa, käytä nykyistä etusivuosoitetta. Kortissa on jo lippu `isInFinland` tätä varten.
4. **Lisää näkyvä linkki** kuvakkeen rinnalle, älä sen tilalle. Kortin alalaitaan oma rivi, esimerkiksi *"Tarkempi sää: Tampere →"*, alleviivattuna ja vähintään 44 × 44 px kosketusalueella. Kuvakkeen linkki voi jäädä ennalleen.
5. **Älä tee koko kortista linkkiä.** Kortissa on jo muita interaktiivisia elementtejä (`WeatherCard.tsx:507` painike `aria-label={t('showWeather')}`), ja linkin sisään upotettu painike on virheellistä HTML:ää ja hajottaa ruudunlukijakäytön.
6. **Säilytä `isLinkVisible`-tarkistus.** Uusi syvälinkki on saman verkkotunnuksen alla, joten nykyinen ehto `isLinkVisible('https://www.ilmatieteenlaitos.fi/')` riittää portiksi molemmille. **Älä lisää 309 kuntakohtaista osoitetta linkkikatalogiin** — ne muodostuvat ajossa, kuten uutisotsikot ja Google-haut, ja katalogissa riittää verkkotunnuksen juuri.
7. **Käännökset:** lisää uusi avain (esim. `weatherDetailsLocal`) kaikkiin seitsemään kielilohkoon paikkamerkillä kunnan nimelle, esim. fi: *"Tarkempi sää: {municipality}"*. Nykyinen `weatherDetails` säilyy `aria-label`-tekstinä. Merkitse uk-, et-, ru- ja se-käännökset tarkistettaviksi, kuten muissakin tehtävissä.

### Huomio, joka kannattaa ratkaista samalla

**Kortin näyttämä säätieto ei tule Ilmatieteen laitokselta.** Luvut haetaan Open-Meteosta (`WeatherCard.tsx:199`, `api.open-meteo.com`), ja Ilmatieteen laitos on erillinen, käyttäjälle hyödyllisempi lukukohde. Nykyinen suomenkielinen teksti *"Katso tarkempi sää Ilmatieteen laitokselta"* on tältä osin rehellinen, koska se ei väitä Ilmatieteen laitosta tietolähteeksi.

**Älä siis nimeä linkkiä sanalla "lähde"** uutta tekstiä kirjoittaessasi. Jos varsinainen tietolähde halutaan näkyviin, se on erillinen ratkaisu: pieni maininta "Säätiedot: Open-Meteo" kortin alalaidassa. Se on tuotepäätös, ei tämän tehtävän osa — kysy Eerolta ennen toteutusta.

### Päätettävää: uusi välilehti vai sama

Linkki avautuu nyt uuteen välilehteen (`target="_blank"`). Kohderyhmän kannalta tämä on kaksipiippuista: uusi välilehti säilyttää aloitussivun auki, mutta moni ikääntynyt käyttäjä ei huomaa siirtyneensä välilehteen eikä löydä takaisin. Koska palvelu on nimenomaan tarkoitettu aloitussivuksi, uusi välilehti on todennäköisesti oikea valinta ja yhdenmukainen sovelluksen muiden ulkoisten linkkien kanssa. **Säilytä nykyinen käyttäytyminen**, ellei Eero päätä toisin.

### Hyväksymiskriteerit

- Kun kotikunta on tiedossa, linkki vie suoraan sen paikallissääsivulle.
- Ruotsinkielisellä käyttöliittymällä näkyvä teksti on ruotsiksi mutta osoite käyttää suomenkielistä kunnan nimeä ja toimii.
- Ulkomailla tai tuntemattomassa sijainnissa linkki vie etusivulle eikä riko korttia.
- Linkki näkyy linkiltä ilman ruudunlukijaa, kosketusalue vähintään 44 × 44 px.
- Testattu 320 px leveydellä ja 200 % tekstikoolla.
- Testattu vähintään kolmella hankalalla kunnannimellä: `Pedersören kunta`, `Koski Tl`, `Maarianhamina`.

---

## SK-02 · Kaksi kiireellistä linkkikorjausta (P1) — **TOTEUTETTU 30.8.2026**

> **Tila: tehty.** `communityLinks.ts` rivit 242 ja 563 päivitetty. Vanhoja osoitteita ei jätetty mihinkään.


Nämä ovat mittausajon 30.8.2026 kohdat "POISTA HETI" (`docs/linkit-korjattavat-2026-08-30-aamu.md`). Molemmat yhdistykset ovat olemassa ja toimivat — vain verkkotunnus on vaihtunut, ja vanha on päätynyt myyntiin. **Oikea korjaus on osoitteen vaihto, ei linkin poisto.**

Eero on toimittanut uudet osoitteet ja ne on varmennettu selaimella 30.8.2026:

| Tiedosto | Rivi | Nimi | Vanha osoite | **Uusi osoite** | Varmennus |
| --- | ---: | --- | --- | --- | --- |
| `communityLinks.ts` | 563 | Eläkeläisliittojen etujärjestö EETU ry | `https://www.eetu.fi/` | `https://www.eetury.fi/` | Sivun otsikko "Eetusivu – EETU-PIO", sisältö vastaa EETU ry:tä / PIO rf:ää |
| `communityLinks.ts` | 242 | Suomen PAH-potilasyhdistys | `https://www.pah.fi/` | `https://suomen-pah.org/` | Sivun otsikko "Suomen PAH – Potilasyhdistys kotisivu" |

Vanhat osoitteet ohjasivat verkkotunnusten kauppapaikkaan (`sedo.com` ja `catcha.fi`), eli kuka tahansa voi ostaa ne ja laittaa niiden taakse mitä tahansa.

### Mitä tehdä

1. Vaihda molemmat osoitteet `communityLinks.ts`-tiedostoon.
2. **Älä jätä vanhoja osoitteita mihinkään** — ei kommenttiin, ei varaosoitteeksi, ei ohjaustaulukkoon. Vapautunut verkkotunnus ei ole turvallinen varasuunnitelma.
3. Aja `npm run build` ja varmista, että molemmat linkit näkyvät ja avautuvat oikein.
4. Aja mittaus uudelleen (`node scripts/link-check-benchmark.mjs --sample 50` riittää tarkistukseen, tai koko ajo) ja `node scripts/link-fix-list.mjs`, ja varmista että "POISTA HETI" -rivejä on nolla.

### Miksi tämä ei odota automaatiota

Molemmat vastasivat HTTP 403:lla, jonka `HttpLinkChecker` luokittelee tilaksi `warning` = "bottisuojaus, linkki todennäköisesti kunnossa". Statuskoodi ei olisi paljastanut mitään; vain verkkotunnuksen vaihtuminen ohjauksessa paljasti asian. Sama koskee 39:ää muuta kuollutta yhdistysverkkotunnusta, jotka ovat vapaana ostettavaksi — ne ovat oma työnsä (`docs/linkit-korjattavat-2026-08-30-aamu.md`, toimenpide "poista").

### Hyväksymiskriteerit

- Kummallakaan nimellä ei enää päädytä verkkotunnuskauppaan.
- Uusi mittausajo ei tuota yhtään "POISTA HETI" -riviä.
