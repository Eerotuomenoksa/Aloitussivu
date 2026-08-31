# Linkkimittauksen analyysi 30.8.2026

Lähde: `docs/linkit-mittaus-2026-08-30-aamu.md` ja `.csv` (2 381 linkkiä, ajo 339 s).
Liittyy: `docs/codex-tehtava-linkkitarkistuksen-viimeistely-2026-08-30.md`.

## 1. Korjaa heti — kaksi linkkiä osoittaa verkkotunnuskauppaan

Nämä eivät odota Codexin automaatiota. Ne ovat tuotannossa nyt.

| Sovelluksessa lukee | Osoite vie oikeasti | Lähde |
| --- | --- | --- |
| **Eläkeläisliittojen etujärjestö EETU ry** | `sedo.com/search/details/?…&domain=eetu.fi&…&utm_medium=Parking` | `communityLinks.ts` |
| **Suomen PAH-potilasyhdistys** | `catcha.fi/verkkotunnukset/pah.fi` | `communityLinks.ts` |

Molempien yhdistysten verkkotunnus on vanhentunut ja päätynyt myyntiin. Käyttäjä, joka klikkaa "Eläkeläisliittojen etujärjestö EETU ry", päätyy verkkotunnusten kauppapaikalle. Kuka tahansa voi ostaa `eetu.fi`-osoitteen ja laittaa sinne mitä tahansa — ja linkki sovelluksessa osoittaisi edelleen sinne, nimellä joka antaa ymmärtää sen olevan eläkeläisjärjestöjen kattojärjestö.

Tämä on juuri se riski, jota palvelun on tarkoitus torjua.

**Huomaa myös, miksi nykyinen automaatio ei olisi löytänyt tätä:** Sedon sivu vastasi tarkistimelle HTTP 403, joka luokitellaan tilaksi `warning` = "bottisuojaus, linkki todennäköisesti kunnossa". Statuskoodi sanoi *ei hätää*. Vain **verkkotunnuksen vaihtuminen ohjauksessa** paljasti asian. Tämä nostaa tehtävän LC-07 prioriteetin.

Kolmas tapaus, ei yhtä vakava mutta rikki: `www.tyrnava.fi/en/home.html` ohjaa osoitteeseen `account.lianacloud.com` eli julkaisujärjestelmän kirjautumissivulle. Kunnan englanninkielinen sivu on poissa.

## 2. Vastaus kysymykseen: onko 2 184 verkkotunnusten määrä?

Ei. **2 184 on `ok`-tilaisten linkkien määrä.** Kokonaisluvut:

| | |
| --- | ---: |
| Linkkejä tarkistettu | 2 381 |
| Kunnossa | 2 184 |
| Varoitus (bottisuojaus tms.) | 19 |
| Epäonnistui | 119 |
| Ohitettu, ei HTTPS | 59 |
| **Eri verkkotunnuksia** | **1 103** |

Ja tärkein osa vastausta: **katalogi on jo linkkikohtainen, ei verkkotunnuskohtainen.** `build-link-catalog.mjs` yksilöi rivit URL-osoitteen mukaan, joten kunnan pääsivu, senioripalvelut ja kirjasto ovat kolme erillistä tarkistettavaa riviä.

| Verkkotunnuksella on | Verkkotunnuksia |
| --- | ---: |
| 1 linkki | 640 |
| 2–4 linkkiä | 327 |
| 5–9 linkkiä | 128 |
| 10 tai enemmän | 8 |

**1 741 linkkiä (73 %) jakaa verkkotunnuksen jonkin toisen linkin kanssa.** Suurin on `hel.fi` 19 linkillä. Huoli siitä, että syvälinkit jäisivät tarkistamatta, on siis aiheeton — ne kaikki tarkistetaan.

## 3. Mutta hypoteesi itsessään osui oikeaan

Ajatus siitä, että sivuston uudistus rikkoo useita saman verkkotunnuksen linkkejä kerralla, näkyy datassa:

| Verkkotunnus | Rikki / linkkejä | Virhe |
| --- | ---: | --- |
| `hel.fi` | 4/19 | 404 |
| `pudasjarvi.fi` | 3/4 | 404 |
| `hameenlinna.fi` | 2/7 | 404 |
| `kiuruvesi.fi` | 2/6 | 404 |
| `juuka.fi` | 2/6 | 404 |
| `vimpeli.fi` | 2/3 | DNS ei ratkea |
| `alopecia.fi` | 2/2 | DNS ei ratkea |
| `fredrikabiblioteken.fi` | 2/2 | DNS ei ratkea |

Mittasuhteet kannattaa silti pitää mielessä: **8 verkkotunnusta, 19 vikaa 119:stä (16 %)**. Loput 100 vikaa ovat yksittäisiä. Kasautuminen on siis todellinen ilmiö mutta ei hallitseva.

Siitä seuraa yksi konkreettinen parannus, joka on halpa toteuttaa (lisätty tehtävään LC-03):

> **Sisarlinkkien herätys.** Kun jokin linkki epäonnistuu kovalla virheellä (404, 410, DNS), aseta saman verkkotunnuksen muiden linkkien `next_check_at` heti erääntyneeksi. Jos `hel.fi`-sivustolla yksi osoite antaa 404:n, loput 18 tarkistetaan tunnin sisällä sen sijaan että ne odottaisivat omaa vuoroaan viikkoja.

Tämä vastaa suoraan siihen mitä sanoit: yksittäisen linkin katkeaminen ei ole kriittistä, mutta kun verkkotunnuksen haltija uudistaa sivunsa, käytettävyys kärsii monessa kohtaa yhtä aikaa — ja juuri silloin kannattaa katsoa koko verkkotunnus kerralla.

## 4. Viat keskittyvät kahteen lähteeseen

| Kategoria | Rikki / linkkejä | Osuus |
| --- | ---: | ---: |
| **Yhdistykset ja yhteisöt** (`communityLinks.ts`) | 49/166 | **29,5 %** |
| **Digiopastus** (`seniorSurfGuidancePlaces.ts`) | 34/200 https | **17,0 %** |
| Liikunta | 8/152 | 5,3 % |
| Liikenne | 9/179 | 5,0 % |
| Urheiluseurat | 1/45 | 2,2 % |
| Valtakunnalliset palvelut | 6/352 | 1,7 % |
| Senioripalvelut | 2/123 | 1,6 % |
| Kuntien verkkosivut | 2/274 | 0,7 % |
| Paikallisuutiset | 0/74 | 0 % |

### 4.1 Yhdistykset: 39 kuollutta verkkotunnusta

Näistä 49 viasta **39 on verkkotunnuksia, jotka eivät enää ratkea DNS:ssä.** Lähes kaikki ovat pienten harvinaissairausyhdistysten sivustoja:

`ah-potilaat.fi`, `aivolisake.fi`, `akustikusneurinooma.fi`, `albinismi.fi`, `alopecia.fi`, `als-tutkimus.fi`, `amyloidoosi.fi`, `autistienettutuki.fi`, `cf-yhdistys.fi`, `chiari.fi`, `dystonia.fi`, `eb-yhdistys.fi`, `fabry.fi`, `frax.fi`, `fshd.fi`, `gnao1tuki.fi`, `hhtosler.fi`, `ihoyhdistys.fi`, `kampurajalkayhdistys.fi`, `karpatiat.fi`, `marfanyhdistys.fi`, `mg-yhdistys.fi`, `mitokondrioyhdistys.fi`, `nf-yhdistys.fi`, `palovammayhdistys.fi`, `panspandas.fi`, `pws.fi`, `skleroderma.fi`, `sotos.fi`, `suhupo.fi`, `valoihottuma.fi`, `vaskuliitti.fi`, `waldenstrom.fi` ja muutama muu.

Pieni potilasyhdistys ei uusi verkkotunnustaan, kun aktiivi vaihtuu. **Ja vapautunut verkkotunnus on ostettavissa** — juuri niin kuin `eetu.fi`:lle ja `pah.fi`:lle kävi. Nämä 39 eivät ole vain rikkinäisiä linkkejä, ne ovat 39 tulevaa `eetu.fi`-tapausta, ellei niitä poisteta.

Suositus: poista kuolleet verkkotunnukset lähdedatasta, älä vain piilota niitä. Piilotettu linkki jää tiedostoon odottamaan, että joku ostaa tunnuksen ja se palaa näkyviin seuraavassa tarkistuksessa "toimivana".

### 4.2 Digiopastus: 31 kertaa 404 omassa datassa

`seniorSurfGuidancePlaces.ts` on SeniorSurfin oma opastuspaikkatieto. 200 https-linkistä 34 epäonnistui, joista 31 on suoraa 404:ää:

```
https://mantyharju.fi/sisalto/palvelut/kirjastopalvelut
https://multia.fi/asukkaille/kirjasto.html
https://tslturku.fi/apupiste-nettitaitoja-kadesta-pitaen
https://uusikaupunki.fi/fi/kirjaston-palvelut/kirjaston-digiopastus
https://valkery.fi/digineuvonta/
https://www.elakeliitto.fi/muut-viikottaiset-kerhot
```

Lisäksi tästä samasta tiedostosta 56 osoitetta on yhä `http://`-muodossa eikä näy käyttäjälle lainkaan. Digiopastus on palvelun ydinsisältöä, joten tämä kannattaa käydä läpi käsin riippumatta siitä, missä vaiheessa automaatio on.

## 5. Selainmainen tunniste toimi — mitattu todiste

LC-04:n ennuste piti paikkansa kirkkaasti:

| | Vanha tarkistin (elokuu) | Uusi pyyntötapa (30.8.) |
| --- | ---: | ---: |
| HTTP 5xx | 26 | **1** |
| 401/403/405/429 | 16 | 19 |
| Sisältösignaalin kohina | 112 (joista 86 nimivertailua) | 13 |

Käytännössä **25 väärää palvelinvirhettä katosi** pelkällä tunnisteen ja GET-uusinnan vaihdolla. Se vahvistaa, että `verifiedLinks.ts`:n bottisuojauspoikkeuksista suurin osa käy tarpeettomiksi LC-04:n jälkeen.

Kaikki 58 `http_status_error`-tapausta olivat **404** — ei yhtään 500:aa tai muuta epämääräistä. Signaali on nyt puhdas: 404 tarkoittaa oikeasti, että sivu on poissa.

## 6. Mitoitus vahvistuu mitatuilla luvuilla

| Mittari | Arvo |
| --- | ---: |
| Vastausajan mediaani | 239 ms |
| 90. persentiili | 1 360 ms |
| 99. persentiili | 3 865 ms |
| Hitain | 9 632 ms |
| Koko ajo, rinnakkaisuus 10 | 339 s |

Palvelimen cron ajaa erän **peräkkäin**, joten 10 linkin erä kestää tyypillisesti noin **2,4 s** ja pahimmillaankin alle 40 s. Se mahtuu jaetun webhotellin rajoihin vaivatta.

Vikatilassa on 119 linkkiä (5,1 %). Kiinteällä 24 tunnin uusintavälillä ne söisivät 119 tarkistusvuoroa vuorokaudessa; porrastetulla uusinnalla noin 17.

**Vahvistus aiempaan suositukseen: `batch_size = 10`, cron tunnin välein.** Se antaa 240 tarkistusta vuorokaudessa, kun mukautuvan välin tasapainokuorma on noin 76 ja uusinnat noin 17. Vara on kolminkertainen, ja ensimmäinen täysi kierros valmistuu noin 10 vuorokaudessa.

## 7. Muut havainnot

- **42 osoitetta 59:stä `http://`-linkistä toimii HTTPS:llä.** Nämä saa palautettua käyttäjille pelkällä osoitteen päivityksellä lähdetiedostoon (LC-08). Lista on mittauksen CSV:ssä sarakkeessa `Koodi` = `https_available`.
- **45 uudelleenohjausta vaihtaa verkkotunnusta.** Valtaosa on täysin laillisia: `helmet.fi` → `finna.fi` (22 linkkiä), museoiden yhdistymiset, hyvinvointialueiden nimenmuutokset (`sata.fi` → `satakunnanhyvinvointialue.fi`, `kainuunhyvinvointialue.fi` → `kainuu.fi`). Nämä kannattaa päivittää lähdedataan, jotta jokainen käyttäjän klikkaus ei kulje turhan ohjauksen kautta.
- **13 `empty_page`-havaintoa on enimmäkseen väärää hälytystä.** WhatsApp Web ja Huawei AppGallery renderöityvät JavaScriptillä, joten palvelimen palauttama HTML on tyhjä. `kuhmoinen.fi` (4 osumaa) sen sijaan kannattaa katsoa käsin. LC-06:n tyhjän sivun tunnistus tarvitsee tämän vuoksi lisäehdon: älä merkitse tyhjäksi, jos rungossa on `<script src=`-viittauksia.
- **Uutisvirroista ei epäonnistunut yksikään** (0/74 paikallisuutiset, 0/165 kuntauutiset). Tämä vahvistaa LC-14:n tarpeen: saatavuus ei kerro syötteen tuoreudesta mitään.

## 8. Suositeltu järjestys

1. **Tänään:** poista tai korjaa `eetu.fi` ja `pah.fi` lähdedatasta.
2. **Tällä viikolla:** poista 39 kuollutta yhdistysverkkotunnusta `communityLinks.ts`:stä.
3. **Ennen laajaa tiedotusta:** käy läpi digiopastuksen 31 kpl 404-osoitetta ja 56 `http://`-osoitetta.
4. **Codexin työjonossa:** LC-07 (verkkotunnuksen vaihdos) nousee prioriteettiin P1 kohdan 1 perusteella; LC-03:een lisätty sisarlinkkien herätys.
5. **Helppo voitto milloin vain:** 42 HTTPS-päivitystä ja 45 uudelleenohjauksen oikaisu.
