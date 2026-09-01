<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Seniorin aloitussivu

SeniorSurf-kayttoon rakennettu React/Vite-sovellus, joka kokoaa helppokayttoisia yleisia ja alueellisia linkkeja, palautteenkeruuta, yllapitotoimintoja ja kevyita Firebase-taustapalveluja.

## Tyojono

Avoimet tehtavat ja niiden tila ovat tiedostossa `TYOJONO.md`. Uudet tehtavat kirjataan sinne; yksityiskohtaiset maarittelyt ovat `docs/codex-tehtava-*.md` -tiedostoissa. Julkaisun ehdot ja paatokset ovat tiedostossa `TODO_HUMAN.md`.

## Paikallinen kehitys

**Edellytys:** Node.js 20 tai uudempi.

1. Asenna riippuvuudet: `npm install`
2. Kopioi tarvittaessa `.env.example` tiedostoksi `.env.local` ja tayta vain julkiset `VITE_*`-arvot.
3. Kaynnista kehityspalvelin: `npm run dev`

Cloudcityn PHP-API:n paikallinen rakenne, turvallinen asetusten sijoittelu ja testikomennot on kuvattu tiedostossa `api/README.md`. API-kehityksessa ei kayteta tuotantotietokantaa tai tuotannon tunnuksia.

Frontendin Cloudcity-, staging-, Firebase-palautus- ja local-providerien valinta seka build-komennot on kuvattu tiedostossa `services/data/README.md`.

Frontendin `VITE_*`-arvot paatyvat selaimen JavaScriptiin, joten niihin ei saa laittaa Gemini-avaimia, admin-salaisuuksia, Firebase service account -tietoja tai muita salaisuuksia. Cloud Functions -salaisuudet asetetaan Firebase Secret Manageriin tai turvalliseen deploy-ymparistoon.

## Tarkistukset

Kayta ennen julkaisua tai isompaa muutosta ainakin:

- `npm run check:secrets` tarkistaa tunnettuja kovakoodattuja salaisuuksia.
- `npm run regional-coverage` paivittaa alueellisten linkkien kattavuusraportin.
- `npm run refresh:links` paivittaa linkkidokumentit ja linkkien tarkistusaineiston. Aja tama erillisena huoltotehtavana, koska tarkistus kay verkossa. Tarkistus hyväksyy vain `https://`-osoitteet; suorat HTTP-osoitteet ja HTTPS:stä HTTP:hen päätyvät uudelleenohjaukset hylätään.
- `npm run test:link-catalog` varmistaa, että tuotannon automaattiseen tarkistukseen pakattava linkkiluettelo on ehjä, yksilöllinen ja sisältää myös digiopastuspaikat sekä kuntien kieliversiot.
- `npm run refresh:data` paivittaa verkosta paikallislehti- ja RSS-aineistot, alueellisen kattavuusraportin, linkkidokumentit ja muutoslokin. Aja tama erillisena huoltotehtavana, koska ulkoiset lahteet voivat olla hitaita tai rajoittaa pyyntoja.
- `npx tsc --noEmit -p tsconfig.json` tarkistaa frontendin TypeScript-tyypit.
- `npm run build` tekee normaalin frontend-buildin ilman hitaita verkkohakuja.
- `npm run changelog` paivittaa muutoslokin, kun haluat kirjata tyopuun muutokset ennen commitia.
- `cd functions && npm run build` tarkistaa Cloud Functions -tyypityksen.

Tuotannon automaattinen linkkitarkistus ajetaan yksityisellä PHP-cronilla `api/cron/link-check.php`. Se tarkistaa linkit erissä, tallentaa ajohistorian MariaDB:hen ja näyttää toistuvasti epäonnistuneet linkit ylläpidossa. Käyttöönotto ja Cloudcityn ajastus on kuvattu tiedostossa `docs/rel14-v0770-automaattinen-linkkitarkistus.md`.

## Tietoturvan peruslinja

- Cloudcity-API ja MariaDB:n `admin_users`-roolit ovat julkaisuympariston ensisijainen kirjoitus- ja yllapito-oikeuksien valvontapaikka. Firestore-saannot koskevat vain maaraikaista palautusbuildia.
- Yllapito-oikeus ei saa nojata selaimen `localStorage`-arvoihin; niita saa kayttaa vain kayttoliittyman apuna.
- Kayttajien kirjoittama palaute ja linkki-ilmoitukset validoidaan seka clientissa etta Firestore-saannoissa.
- Kuvakaappaukset rajataan sallittuihin kuvatyyppeihin ja kokoon ennen tallennusta.
- Firebase Hosting -otsakkeet maaritetaan tiedostossa `firebase.json`.

## Alueelliset linkit

Alueelliset joukkoliikenne-, palveluliikenne- ja uutispuutteet seurataan tiedostoissa:

- `localServices.ts`
- `localServiceTransportLinks.ts`
- `localNewspaperFeeds.ts`
- `docs/alueelliset-linkit-puuttuvat-kunnat.md`
- `outputs/regional-link-coverage.json`

Uusi alueellinen linkki lisataan vain, kun virallinen lahde tai selkea palveluntuottajan lahde loytyy. Jos linkki palvelee useaa kuntaa, merkitse se seudulliseksi alueeksi, jotta kayttajalle voidaan nayttaa, onko kyse oman kunnan, seudun vai valtakunnallisesta fallback-linkista.
