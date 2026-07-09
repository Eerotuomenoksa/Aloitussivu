# Ylläpitotarkistus 8.7.2026

Tämä tarkistus tehtiin eilisten SEO/GEO/AEO- ja suorituskykymuutosten jälkeen. Tavoitteena oli varmistaa, ettei sivun peruskäyttö, metatiedot, mobiilinäkymä tai julkaisutarkistus ole rikkoutunut.

## Yhteenveto

Sivu toimii paikallisessa tarkistuksessa hyvin. Desktop- ja mobiilinäkymä latautuivat HTTP 200 -vastauksella, mobiilissa ei havaittu vaakasuuntaista ylivuotoa, sivun tärkeimmät metatiedot olivat paikallaan ja JSON-LD-rakenne löytyi etusivulta.

Tarkistuksessa löytyi kaksi ylläpidon kannalta hyödyllistä parannusta:

- paikallinen kehityssivu yritti kutsua nimipäivä-Cloud Functionia ja tuotti CORS-virheitä konsoliin
- normaali `npm run build` oli sidottu hitaisiin verkkopohjaisiin data- ja linkkiskannauksiin

Molemmat korjattiin tässä työpaketissa.

## Ajetut tarkistukset

| Tarkistus | Tulos |
| --- | --- |
| `npm run build` | OK, Vite-build valmistui 5,60 sekunnissa |
| `npx tsc --noEmit` | OK |
| `npm run check:secrets` | OK, kovakoodattuja avaimia ei löytynyt |
| Playwright desktop 1440 x 1000 | OK, ei konsoli- tai sivuvirheitä |
| Playwright mobile 390 x 844 | OK, ei konsoli- tai sivuvirheitä, ei vaakaylivuotoa |
| Staattiset julkiset tiedostot | OK: `saavutettavuus.html`, `tietosuoja.html`, `sivua-tukemassa.html`, `sitemap.xml`, `site.webmanifest`, `robots.txt` |

## SEO/GEO/AEO-pikatarkistus

Etusivulta löytyivät tarkistuksessa:

- otsikko: `Aloitussivu | Selkeä ja turvallinen linkkihakemisto ikääntyneille`
- metakuvaus
- `robots`-metatieto
- canonical-osoite
- web manifest
- JSON-LD-tyypit: `Organization`, `WebSite`, `WebApplication`, `WebPage`, `CollectionPage`, `BreadcrumbList`, `FAQPage`
- `h1`: `Aloitussivu`
- footer- ja navigaatiolinkit

## Korjatut havainnot

### Nimipäivähaun paikallinen CORS-melu

`services/nameDayService.ts` ei enää hae oletusarvoista Cloud Function -osoitetta paikallisessa Vite-kehitysympäristössä, ellei `VITE_NAMEDAY_TODAY_URL` ole erikseen asetettu. Tämä pitää paikallisen selaintarkistuksen puhtaana ilman, että tuotantokäyttäytyminen muuttuu.

### Buildin verkkoriippuvuudet

`npm run build` tekee nyt normaalin frontend-buildin ilman hitaita verkkohakuja. Verkkopohjaiset päivitykset siirrettiin erillisiksi huoltokomennoiksi:

- `npm run refresh:links`
- `npm run refresh:data`

Lisäksi `scripts/update-newspapers.mjs` jatkaa nykyisellä `localNewspaperLinks.ts`-aineistolla, jos Wikipedia tai muu ulkoinen lähde palauttaa hetkellisen 429-, 5xx- tai verkkovirheen.

## Huomiot seuraavaan ylläpitökertaan

- Lighthouse-PDF:t ovat edelleen erillisenä aineistona `docs/Lighthouse/`-kansiossa, mutta niitä ei lisätty automaattisesti versionhallintaan.
- Root-tason Office-tiedostot ovat edelleen näkyvissä päätöstä varten.
- `tmp/` ja tavalliset `outputs/`-artefaktit rajattiin paikallisiksi `.gitignore`-säännöillä.
