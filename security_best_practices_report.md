# Aloitussivu: koodikatselmus, saavutettavuus ja tietoturvaraportti

Paivays: 6.7.2026

## Yhteenveto

Katselmuksessa korjattiin nelja kaytannon asiaa: Firestore-saantoja kovennettiin, palautteen kuvakaappausten validointi yhtenaistettiin clientin ja Firestoren valilla, yleisimpiin modaleihin lisattiin fokusloukku ja alueellista joukkoliikennedataa taydennettiin 12 kunnan verran. Lisaksi README paivitettiin kehitys-, validointi-, tietoturva- ja alueellisen datan yllapito-ohjeilla.

Kriittista raakaa HTML-injektiota, `eval`-kayttoa tai selvaa avoimen uudelleenohjauksen toteutusta ei loytynyt kaytettyjen hakujen perusteella. Jatkoriskit liittyvat ennen kaikkea admin-oikeuden pitkavalisempaan malliin, salaisuuksien tuotantohallintaan, CSP:n jatkokiristykseen ja puuttuvien alueellisten linkkien systemaattiseen taydentamiseen.

## Korjatut havainnot

### SEC-001: Admin-sahkopostin varmistus ja dokumentti-ID:n eheys

Vakavuus: keskitaso

Sijainnit:

- `firestore.rules:5`
- `firestore.rules:21`
- `firestore.rules:49`
- `firestore.rules:140`
- `firestore.rules:280`
- `firestore.rules:286`
- `firestore.rules:297`

Havainto: Firestore-saannot sallivat admin-oikeuden nimetyilla sahkoposteilla ilman `email_verified`-tarkistusta. Lisaksi linkkiraportin, palautteen ja testipalautteen dokumentti-ID:n ei tarvinnut vastata dataan tallennettua `id`-arvoa.

Korjaus: Admin-sahkopostipolku vaatii nyt `request.auth.token.email_verified == true`. Linkkiraportti, palaute ja testipalaute validoivat dokumentti-ID:n ja datan `id`-kentän vastaavuuden.

Jatkosuositus: Siirry Custom Claims -pohjaiseen admin-malliin (`request.auth.token.admin == true`), jotta tuotantosäännöissä ei tarvitse yllapitaa sahkopostilistaa.

### SEC-002: Kuvakaappausten tiedostotyyppi ja data-URL

Vakavuus: keskitaso

Sijainnit:

- `components/FeedbackModal.tsx:28`
- `components/FeedbackModal.tsx:89`
- `components/FeedbackModal.tsx:158`
- `components/FeedbackModal.tsx:331`
- `firestore.rules:117`

Havainto: Palautemodaalin client-puoli hyvaksyi aiemmin kaiken `image/*`-tyyppisen tiedoston, vaikka Firestore-saannot rajasivat tallennuksen vain PNG/JPEG/WebP/GIF-muotoihin. Paikallinen fallback saattoi siksi kayttaytya valjemmin kuin pilvitallennus.

Korjaus: Clientin `accept`, tiedostotyypin tarkistus ja data-URL-tarkistus kayttavat nyt samaa rajattua allowlistia kuin Firestore. Firestore-saanto tarkistaa myos data-URL:n alkumuodon.

### A11Y-001: Modaalien fokusloukku

Vakavuus: keskitaso

Sijainnit:

- `hooks/useModalFocusTrap.ts:17`
- `hooks/useModalFocusTrap.ts:44`
- `components/FeedbackModal.tsx:121`
- `components/LinkReportModal.tsx:27`
- `components/InfoModal.tsx:27`
- `components/HomepageModal.tsx:42`
- `components/ProviderModal.tsx:82`

Havainto: Useat modaalit fokusoiduivat avattaessa sulkupainikkeeseen ja sulkeutuivat Escilla, mutta tabulaattorifokus ei pysynyt modaalin sisalla. Tama on hankalaa erityisesti nappaimistokayttajille ja ruudunlukijakayttoon.

Korjaus: Lisattiin yhteinen `useModalFocusTrap`-hook, joka lukitsee Tab/Shift+Tab-kierron modaalin sisalle, palauttaa aiemman fokuksen sulkemisen jalkeen ja hoitaa Esc-sulun yhdessa paikassa.

### DATA-001: Puuttuvia alueellisia joukkoliikennelinkkeja taydennetty

Vakavuus: kaytettavyys / sisallon laatu

Sijainnit:

- `localServices.ts:312`
- `localServices.ts:320`
- `localServices.ts:368`
- `localServices.ts:376`
- `docs/alueelliset-linkit-puuttuvat-kunnat.md:17`
- `docs/alueelliset-linkit-puuttuvat-kunnat.md:19`

Korjaus: Lisattiin virallisiin lahteisiin perustuvat joukkoliikennealueet:

- Lahden seudun liikenne: Asikkala, Heinola, Hollola, Lahti, Orimattila, Padasjoki
- Hameenlinnan joukkoliikenne: Hattula, Hameenlinna, Janakkala
- Lifti: Mustasaari, Vaasa
- Linkkari: Rovaniemi

Tulos: `npm run regional-coverage` paivitti julkisen liikenteen kattavuuden. Valtakunnallisen fallbackin varassa on nyt 228 kuntaa ja seudullisia joukkoliikennelinkkeja on 79 kuntaan.

Lahteet:

- https://www.lsl.fi/reitit-ja-aikataulut/
- https://hameenlinnanjoukkoliikenne.fi/
- https://www.vaasa.fi/asu-ja-ela/liikenne-ja-kadut/joukkoliikenne/
- https://linkkari.fi/

### BUILD-001: TypeScript-tarkistus saatiin ajettavaksi

Vakavuus: yllapidettavyys

Sijainnit:

- `vite-env.d.ts:1`
- `tsconfig.json:20`
- `adminStats.ts:17`
- `components/RegionalServicesPanel.tsx:167`

Havainto: `npx tsc --noEmit -p tsconfig.json` kaatui ensin `vite.config.ts`-project reference -asetelmaan. Kun se korjattiin, esiin tuli puuttuvat Vite-client-tyypit, PNG-moduulityypit, yksi kuukausilaskennan tyyppivirhe ja aluepaneelin kunnannimen vaaran tyyppinen kutsu.

Korjaus: Lisattiin Vite-client-tyypit, rajattiin frontendin tsconfig pois serveripuolen ja build-outputtien tiedostoista, tyypitettiin kuukausipyynnot eksplisiittisesti ja muutettiin aluepaneeli hakemaan `Municipality`-olio ennen lokalisoitua nimea.

## Avoimet jatkohavainnot

### SEC-003: Admin-oikeus kannattaa siirtaa Custom Claimsiin

Vakavuus: keskitaso

Nykyinen Firestore-saanto on parannettu, mutta sahkoposti- ja UID-listat ovat silti manuaalisesti yllapidettavia. Custom Claims tekisi oikeusmallista selkeamman ja vahentaisi virheellisen tai vanhentuneen sahkopostilistan riskeja.

### SEC-004: Cloud Functions -salaisuuksien tuotantomalli tulee varmistaa

Vakavuus: keskitaso

Koodissa `functions/gemini.ts` ja `functions/nameday.ts` lukevat salaisuuksia `process.env`-muuttujista. Tama voi olla turvallinen, jos arvot tulevat Firebase Secret Managerista tai luotetusta deploy-ymparistosta, mutta asia ei yksin koodista varmistu. Tuotantodeployssa tulee varmistaa, ettei salaisuuksia ole `.env`-tiedostoissa, frontendin `VITE_*`-muuttujissa tai versionhallinnassa.

### SEC-005: CSP: `style-src 'unsafe-inline'`

Vakavuus: matala / puolustussyvyys

`firebase.json` sisaltaa CSP:n, mutta sallii inline-tyylit. Tama on usein kaytannon kompromissi React/Tailwind/Vite-sovelluksissa, mutta korkean tietoturvan tavoitetilassa kannattaa arvioida, voidaanko inline-tyyliriippuvuutta vahentaa ja siirtya tiukempaan CSP:hen.

### DATA-002: Alueellisia aukkoja on viela paljon

Vakavuus: kaytettavyys / sisallon laatu

Paivitetty raportti kertoo, etta palveluliikenteen oma linkki puuttuu edelleen 171 kunnalta ja paikallisuutisten RSS-syote 295 kunnalta. Julkisen liikenteen valtakunnallinen fallback on viela kaytossa 228 kunnalla. Taydennys kannattaa tehda maakunta tai hyvinvointialue kerrallaan virallisista lahteista.

## Validointi

Ajettu 6.7.2026:

- `npm run regional-coverage`: onnistui, paivitti `docs/alueelliset-linkit-puuttuvat-kunnat.md` ja `outputs/regional-link-coverage.json`.
- `npm run check:secrets`: onnistui, kovakoodattuja avaimia ei loytynyt.
- `npx tsc --noEmit -p tsconfig.json`: onnistui korjausten jalkeen.
- `npx vite build`: onnistui. Vite raportoi edelleen isojen chunkkien varoituksen, mutta build valmistui.
- `cd functions && npm run build`: onnistui.
