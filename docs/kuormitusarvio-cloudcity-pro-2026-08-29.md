# Kuormitusarvio: aloitussivu Cloudcity Pro -paketissa

Päivätty 29.8.2026. Laadittu repon versiosta (dist-build 29.8.2026 09:56) ja Cloudcityn
julkisesta hinnastosta. Tarkoitus: tietää etukäteen millä liikenteellä paketti tai
arkkitehtuuri on vaihdettava, ja mitä kannattaa korjata ennen sitä.

## 1. Lähtötilanne

Samassa Cloudcity Pro -webhotellissa pyörii WordPress (seniorsurf.fi) ja aloitussivu
(`/aloitus`, PHP-API + MariaDB). Paketti jaetaan, joten kumpi tahansa voi hidastaa toista.

| Resurssi | Pro | Ultra (seuraava taso) | Nykykäyttö |
|---|---|---|---|
| CPU | 200 % (2 prioritisoitua) | 400 % (4) | – |
| RAM | 2 GB | 2 GB | – |
| Levytila | 50 GB | 50 GB | 8,5 GB (elokuu 2026) |
| Siirto | rajaton | rajaton | 10–15 GB/kk, huippu 15 GB (toukokuu) |
| Hinta | 15,06 €/kk sis. alv | 36,40 €/kk sis. alv | – |

Huom: Pro:sta Ultraan siirryttäessä **muistin määrä ei kasva**, vain CPU. Rinnakkaisten
PHP-prosessien katto ei siis nouse — ja se on käytännössä se raja johon piikissä osutaan.

## 2. Mitä yksi käynti maksaa

Mitattu `dist`-buildista (gzip) ja koodista.

| | Määrä |
|---|---|
| Ensikäynti | ~320 KB: HTML+JS+CSS 190 KB, logo-PNG 72 KB, fontit ~55 KB |
| Ensikäynti, alueelliset paneelit avattu | ~400 KB (`localServices` 43 KB + `ProviderModal` 40 KB) |
| Paluukäynti | ~15 KB — hashatut assetit ovat `immutable`-välimuistissa vuoden |
| PHP-suorituksia / istunto | 5–7 |
| SQL-lauseita / istunto | ~12–18 |

PHP-suoritukset istuntoa kohti:

1. `GET /api/v1/approved-links`
2. `GET /api/v1/blocked-links`
3. `GET /api/v1/scam-alerts`
4. `POST /api/v1/usage-events` (pageview, 15 s viiveellä)
5. 1–3 × `POST /api/v1/usage-events` (linkkiklikit)

Kolme ensimmäistä ovat API:n `.htaccess`-asetuksen takia **välimuistittomia** (`no-store`),
vaikka niiden sisältö muuttuu harvoin. Jokainen POST tekee lisäksi rate limit -transaktion
(`rate_limit_buckets`-upsert + select), eli kaksi ylimääräistä lausetta per kirjoitus.

Staattiset tiedostot tarjoilee LiteSpeed ilman PHP:tä, joten ne eivät kuluta käytännössä
lainkaan CPU:ta. Sovellus on per näyttökerta selvästi kevyempi kuin WordPress-sivulataus.

## 3. Siirtomäärä ei ole rajoite

10 000 ensikäyntiä ≈ 3,4 GB. Vaikka aloitussivu toisi 50 000 käyntiä kuukaudessa, se on
~17 GB eli nykyisen WP-liikenteen verran — ja Pro:ssa siirto on rajaton. **Siirtomäärä ei
tule koskaan olemaan syy vaihtaa pakettia.** Levytila ei myöskään: sovelluksen build on
2 MB ja käyttötilastot tallennetaan koosteriveinä (`usage_daily`, `usage_page_daily`,
`usage_context_daily`), eli muutamia satoja rivejä vuodessa.

Ainoat levyä ajan myötä syövät asiat ovat pyyntöloki (`logs/`, JSONL) ja palautteiden
liitteet (`protected_uploads`). Miljoona API-pyyntöä kuukaudessa tuottaa lokia luokkaa
250 MB/kk, jos kaikki pyynnöt lokitetaan.

## 4. Kynnysarvot

| Liikenne | Vaikutus |
|---|---|
| ≤ 1 000 käyntiä/vrk | Ei näy missään. ~5 000–7 000 PHP-pyyntöä/vrk. |
| 1 000–5 000/vrk | Näkyy CPU-käyrässä, toimii hyvin. Cachetus kannattaa jo tehdä. |
| 5 000–20 000/vrk tasaisesti | Riittää **jos** GET-endpointit on cachetettu. Ilman cachetusta ruuhkatunnit hidastavat myös WordPressiä. |
| Piikki: 3 000–10 000 avausta 10 minuutin sisään | ~10–20 rinnakkaista PHP-pyyntöä sekunnissa. 2 GB RAM riittää arviolta 20–30 yhtäaikaiseen PHP-prosessiin, joten jono täyttyy ja molemmat sivustot hidastuvat. **Tämä on todennäköisin särkymiskohta.** |
| > 50 000/vrk pysyvästi | Ultra ei riitä pitkälle (sama RAM). Tässä vaiheessa WP ja sovellus erotetaan tai siirrytään VPS:lle. |

Piikkiskenaario on realistinen: radio- tai TV-maininta, uutiskirjeen lähetys, tai
Juttunetin avautuminen 9.9.2026. Kuukausivolyymi ei ole se mitä kannattaa seurata.

## 5. Kaksi asiaa jotka hajoavat ennen Cloudcityä

**Kolmannen osapuolen ilmaisrajat.** `services/rssService.ts` hakee paikallislehtien feedit
`api.rss2json.com`- ja `api.allorigins.win`-palveluista, sää `api.open-meteo.com`:sta ja
paikannus `nominatim.openstreetmap.org`:sta — kaikki suoraan käyttäjän selaimesta. Nämä
eivät kuormita omaa palvelinta lainkaan, mutta rss2jsonin ilmaistaso on luokkaa 10 000
pyyntöä/vrk ja Nominatimin käyttöehdot kieltävät tämäntyyppisen massakäytön. Ne alkavat
palauttaa virheitä jo muutamalla tuhannella päivittäisellä käyttäjällä. Korjaus: hae feedit
omalla cronilla palvelimelle ja tarjoile staattisena JSONina.

**`usage_daily`-rivilukko.** Jokainen sivunäyttö päivittää transaktiossa saman yhden
päivärivin (`ON DUPLICATE KEY UPDATE total_pageviews = total_pageviews + 1`), ja sen päälle
tulee rate limit -bucketin upsert. Piikissä nämä sarjallistuvat rivilukkoon: pyynnöt
jonoutuvat, PHP-työntekijät täyttyvät ja sivu tökkii, vaikka CPU-käyrä näyttäisi vapaalta.

## 6. Toimenpiteet järjestyksessä

1. **Cachetä `approved-links`, `blocked-links` ja `scam-alerts`** — ETag + `max-age` 5–15 min,
   tai cronilla generoitu staattinen JSON. Poistaa ~60 % PHP-osumista ja nostaa kattoa
   kertaluokan. Halvin yksittäinen korjaus.
2. **Pilko `usage_daily`-kirjoitus** — tunti- tai shard-rivit, tai insert-only-taulu jonka
   cron aggregoi. Kevennä samalla usage-eventin rate limiteriä.
3. **Siirrä RSS-haut palvelimen cronille** (ks. kohta 5).
4. **Vaihda logo-PNG:t WebP/SVG-muotoon** — 72 KB gz kumpikin, 37 % ensilatauksesta. Auttaa
   myös hitailla mobiiliyhteyksillä, mikä on kohderyhmässä oleellista.
5. **Varmista WP:n LiteSpeed-cache** — WordPress on yhä raskaampi vuokralainen per pyyntö.
6. **Lokirotaatio** `logs/`-kansiolle ja `protected_uploads`-kansion kasvun seuranta.

## 7. Mitä seurata

- **Hallintapaneelin CPU-käyrä**: hälytysraja ~40 % jatkuvaa käyttöä. Sen yli mentäessä
  ruuhkapiikeissä ei ole enää varaa.
- **Levytila**: nyt 8,5/50 GB. Tarkista neljännesvuosittain, kasvaako `logs/` odottamattomasti.
- **API-vasteajat**: jos `POST /usage-events` alkaa kestää yli 200 ms, kyse on lähes varmasti
  kohdan 5 rivilukosta, ei CPU:sta.
- **Siirtomäärä**: seurataan vain trendin takia, ei rajan.

Paketin vaihto Ultraan (+21 €/kk) kannattaa vasta jos kohtien 1–2 korjaukset on tehty ja
CPU on silti pullonkaula. Ennen sitä se ostaa vähän ja jättää muistikaton ennalleen.
