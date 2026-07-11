# Alueellisten linkkien työpaketit 10.-11.7.2026

Tilannekuva perustuu tiedostoon `outputs/regional-link-coverage.json` ja linkkitilastoihin 11.7.2026. Kunnilla on nyt aina joko oma tai alueellinen julkisen liikenteen linkki, mutta palveluliikenteessä ja paikallisuutisten syötteissä on vielä selvä täyttötarve.

## Nykyinen kattavuus

- Kuntia: 308
- Julkinen liikenne: 182 alueellista, 45 omaa, 81 kansallisen reittioppaan varassa
- Palveluliikenne: 195 omaa tai alueellista, 113 puuttuu
- Paikallisuutisten syötteet: 209 omaa RSS/feed-kuntaa, 99 puuttuu; tarkempi uutisraportti tunnistaa 214 kuntaa omalla uutisvirralla ja 94 kuntaa hyvinvointialueen uutisten varassa
- Kriittinen puute eli sekä julkinen liikenne että palveluliikenne puuttuvat: 0 kuntaa
- Kirjastot: aluekirjastomalli kattaa kaikki 308 kuntaa, jatkossa tarvitaan lähinnä URL- ja ajantasaisuusauditointi

## Väkilukutausta

Lisää työpakettien tulkintataustaa ylläpidetään tiedostoissa `outputs/municipality-population-context.json`, `docs/kuntien-vakiluku-linkkitausta.md` ja `docs/kuntien-vakiluku-linkkitausta.csv`. Väkiluku muuttaa hakutyön odotusarvoa: hyvin pienellä kunnalla puuttuva kuntakohtainen linkki voi tarkoittaa, että palvelu on aidosti seudullinen, kutsutaksi- tai asiointiliikennepohjainen, ja paikallisuutiset löytyvät seutu- tai maakuntalehden tasolta.

Käytännön sääntö:

- suurissa ja keskisuurissa kunnissa puuttuva linkki on vahvempi hakusignaali
- pienissä kunnissa hyväksyttävä lopputulos voi olla virallinen seudullinen, maakunnallinen tai taksipohjainen lähde
- jos omaa uutis-RSS-syötettä ei ole, etsi paikallislehti, seutulehti, maakuntalehti, kunnan uutiset-sivu tai hyvinvointialueen uutiset
- älä lisää linkkiä ilman lähdettä, vaikka kunta olisi puutelistalla

## Mitä kannattaa etsiä seuraavaksi

1. Palveluliikenne ensin. Se on suurin käytännön palveluaukko, ja 113 kunnalla puuttuu vielä linkki.
2. Julkisen liikenteen kansalliset fallback-linkit kannattaa vaihtaa alueellisiin vain silloin, kun kunnalle löytyy selkeä virallinen tai alueellinen lähde.
3. Paikallisuutisten seuraava aalto kannattaa rajata 94 kuntaan, joilla on enää hyvinvointialueen uutiset fallbackina. Tarkista ensin paikallislehtien kuntakattavuus, sitten kunnan oma uutiset-sivu ilman RSS:ää, ja jätä hyvinvointialue fallbackiksi vain kun parempaa lähdettä ei löydy.
4. Museot, eläkeyhdistykset ja potilasyhdistykset saivat ensimmäisen kattavuusraportin tiedostoon `outputs/regional-community-link-coverage.json`. Seuraava työ on kasvattaa eläkeyhdistysten paikallisia ja alueellisia osumia järjestö kerrallaan virallisista yhdistyshauista.
5. Kirjastoissa ei tarvita kuntakohtaista täyttöaaltoa juuri nyt. Parempi työpaketti on tarkistaa 35 alueellisen kirjastolinkin HTTPS, uudelleenohjaukset ja kuntakattavuus.

## Työpaketti 1: palveluliikenne, Keski-Suomi ja Kanta-Häme

Tavoite: paikata pieni ja hyvin rajattu palveluliikenteen puuteryhmä.

Tilanne 10.7.2026: vahvistetut Petäjäveden asiointiliikenne ja Uuraisten kutsutaksi lisättiin. Hankasalmi, Kannonkoski, Kinnula, Kivijärvi, Konnevesi, Kyyjärvi, Saarijärvi, Hattula ja Humppila jätettiin avoimeksi, koska niistä ei löytynyt nykyistä käyttäjälle hyödyllistä palveluliikennesivua.

Kunnat:

- Keski-Suomi: Hankasalmi, Kannonkoski, Kinnula, Kivijärvi, Konnevesi, Kyyjärvi, Petäjävesi, Saarijärvi, Uurainen
- Kanta-Häme lisäeränä, jos lähteet löytyvät nopeasti: Hattula, Humppila

Hakusanat:

- `palveluliikenne`
- `asiointiliikenne`
- `kutsutaksi`
- `kuljetuspalvelu`
- `joukkoliikenne`

Valmiin paketin tulos:

- lisäykset `localServiceTransportLinks.ts`
- päivitys `outputs/regional-link-coverage.json`
- työjonodokumentin tilanteen päivitys
- validointi: `npm run build`

## Työpaketti 2: Pohjois-Pohjanmaan palveluliikenne

Tavoite: suurimman prioriteettialueen palveluliikennepuutteiden puolitus tai täysi täyttö, lähteiden löytyvyydestä riippuen.

Tilanne 10.7.2026: vahvistetut Iin Iikka-linja, Kuusamon sivukylien asiointiliikenne ja Reisjärven 9.7.2026 alkava asiointikuljetus lisättiin. Haapajärvi, Haapavesi, Hailuoto, Kalajoki, Kempele, Liminka, Lumijoki, Merijärvi, Muhos, Pyhäjoki, Sievi, Utajärvi ja Ylivieska jätettiin avoimeksi, koska niistä ei löytynyt nykyistä erillistä palvelu-, asiointi- tai kutsuliikenteen käyttäjäsivua.

Kunnat:

- Haapajärvi, Haapavesi, Hailuoto, Ii, Kalajoki, Kempele, Kuusamo, Liminka
- Lumijoki, Merijärvi, Muhos, Pyhäjoki, Reisjärvi, Sievi, Utajärvi, Ylivieska

Huomio:

- Tämä on iso 16 kunnan paketti. Jos lähteiden tarkistus vie aikaa, jaa kahteen commit-erään yllä olevan rivijaon mukaan.
- Hyväksy vain virallinen kunnan, seudullisen liikenteen tai hyvinvointialueen lähde.

## Työpaketti 3: Pohjois-Pohjanmaan julkisen liikenteen fallbackit

Tavoite: vaihtaa kansallisen reittioppaan varassa olevia kuntia alueellisiin linkkeihin silloin, kun lähde on selkeä.

Kunnat:

- Alavieska, Kärsämäki, Nivala, Oulainen, Pudasjärvi, Pyhäjärvi
- Pyhäntä, Raahe, Siikajoki, Siikalatva, Taivalkoski, Vaala

Lopetusehto:

- Jos kunnalle ei löydy selkeää alueellista joukkoliikennesivua, jätä kansallinen fallback voimaan ja kirjaa havainto työjonoon.

## Työpaketti 4: Varsinais-Suomen palveluliikenne

Tavoite: paikata 14 palveluliikennepuutetta alueelta, jossa kuntien ja seudullisten toimijoiden linkkejä löytyy todennäköisesti hyvin.

Tilanne 10.7.2026: vahvistetut Kaarinan ja Liedon Föli-kutsubussit, Paimion palveluliikenne, Raision Fölix ja Turun asiointilinjat lisättiin. Aura, Kemiönsaari, Koski Tl, Kustavi, Marttila, Nousiainen, Oripää, Rusko ja Vehmaa jäivät avoimeksi, koska niistä ei löytynyt nykyistä erillistä palvelu-, asiointi- tai kutsuliikenteen käyttäjäsivua.

Kunnat:

- Aura, Kaarina, Kemiönsaari, Koski Tl, Kustavi, Lieto, Marttila
- Nousiainen, Oripää, Paimio, Raisio, Rusko, Turku, Vehmaa

Erityishuomio:

- Turun seudulla voi olla useampi pätevä lähde. Valitse käyttäjälle hyödyllisin käytännön palvelusivu, ei organisaation yleisesittelyä.

## Työpaketti 5: Satakunnan palveluliikenne

Tavoite: jatkaa aiempaa Satakunnan alueellisten linkkien täydentämistä palveluliikenteeseen.

Tilanne 11.7.2026: palveluliikenteeseen ei löytynyt uutta nykyistä virallista käyttäjäsivua, mutta lisähaku paikkasi julkisen liikenteen fallbackit kunnista Huittinen, Kankaanpää ja Rauma. Ne lisättiin virallisista kuntien/kaupungin joukkoliikennesivuista.

Kunnat:

- Eura, Eurajoki, Harjavalta, Jämijärvi, Karvia, Kokemäki, Merikarvia
- Nakkila, Pomarkku, Pori, Siikainen, Säkylä, Ulvila

Lisähaku:

- Samalla voi tarkistaa julkisen liikenteen fallbackit: Huittinen, Kankaanpää, Rauma.

## Työpaketti 6: paikallisuutisten RSS- ja uutisfallbackit

Tavoite: kasvattaa uutissyötteiden kattavuutta ilman väkisin lisättyjä lähteitä.

Tilanne 11.7.2026: hyvinvointialuefallback-kunnista lisättiin 165 virallista kunnan omaa ei-tyhjää RSS/Atom-syötettä tiedostoon `municipalityNewsFeeds.ts`. Jäljellä on 94 kuntaa, joilla on vain hyvinvointialueen uutislinkki. Lisäksi jatkoraportissa on 48 kunnan uutis- tai ajankohtaista-sivua ilman RSS:ää, 27 tyhjää kuntasyötettä, 2 hylättyä epäilyttävää kuntasyötettä ja 51 paikallislehtien feed-ehdokasta, joiden kuntakattavuus pitää tarkistaa ennen lisäämistä.

Seuraavat todennäköiset osumat:

- Varsinais-Suomi: Auranmaan Viikkolehti ja muut seudulliset paikallislehdet
- Keski-Pohjanmaa ja Pohjanmaa: Lestijoki, Perhonjokilaakso ja seudulliset paikallislehdet
- Kymenlaakso: Keskilaakso ja Kaakonkulma
- Lappi: Inarilainen ja Meän Tornionlaakso

Kirjaustapa:

- Merkitse lähteen tyyppi: `local-newspaper-feed`, `municipality-feed`, `municipality-news-page` tai `wellbeing-area-news`.
- Jos kunnalle ei löydy RSS-syötettä, lisää mieluummin uutiset-sivu kuin keinotekoinen feed.
- Älä mapita monikuntalehteä kuntaan ilman lähteestä näkyvää kattavuusperustetta.

## Työpaketti 7: julkisen liikenteen fallback-klusterit

Tavoite: vähentää 81 kansallista fallbackia siellä, missä alueellisia virallisia lähteitä todennäköisesti löytyy.

Etenemisjärjestys:

1. Lappi: Kemijärvi, Kittilä, Pelkosenniemi, Posio, Ranua, Salla, Savukoski, Sodankylä, Ylitornio
2. Pirkanmaa: Hämeenkyrö, Ikaalinen, Juupajoki, Mänttä-Vilppula, Parkano, Pälkäne, Ruovesi, Sastamala, Virrat
3. Etelä-Pohjanmaa: Alavus, Evijärvi, Isojoki, Kauhajoki, Kuortane, Kurikka, Soini
4. Etelä-Savo: Hirvensalmi, Juva, Mikkeli, Pieksämäki, Puumala, Rantasalmi, Savonlinna

Tämä paketti kannattaa tehdä palveluliikenteen jälkeen, koska nykyinen fallback on käyttäjälle parempi kuin tyhjä linkki.

## Työpaketti 8: museot, eläkeyhdistykset ja potilasyhdistykset

Tavoite: tehdä kattavuus näkyväksi ennen varsinaista hakutyötä.

Tilanne 11.7.2026: ensimmäinen kattavuusraportti toteutettiin komennolla `npm run community-coverage`. Raportit ovat tiedostoissa `outputs/regional-community-link-coverage.json` ja `docs/alueelliset-yhteisolinkit-kattavuus.md`. Eläkeyhdistyksiin lisättiin puuttuvat valtakunnalliset EKL, KRELLI ja Svenska pensionärsförbundet sekä ensimmäinen paikallis-/aluehakuerä KRELLIstä, Eläkeläiset ry:n Kainuusta ja Keski-Suomesta, SPF:stä ja Eläkeliiton Etelä-Hämeestä.

Ensimmäinen toteutus:

- Valmis: laske nykyisestä datasta kuntien ja alueiden kattavuus museoille.
- Valmis: laske eläkeyhdistysten paikalliset ja alueelliset osumat erikseen.
- Valmis: laske potilasyhdistyksille alueelliset ja sairauskohtaiset osumat, mutta älä vaadi kuntakohtaista kattavuutta joka diagnoosille.
- Valmis: tuota puutelista tiedostoon `outputs/regional-community-link-coverage.json`.

Nykyiset lähtömäärät:

- museolinkkejä: 44
- eläkeyhdistyslinkkejä: 17 `SENIOR_ASSOCIATION_LINKS`-provideria sekä 4 kohdennettua pikatoimijaa; paikallinen tai alueellinen osuma 97 kunnassa
- potilasyhdistyslinkkejä: 107

Seuraavat eläkeyhdistysaallot:

- Eläkeliitto: lisää piirit ja yhdistykset piirien omilta sivuilta.
- Kansallinen Senioriliitto: lisää senioripiirit ja niiden paikallisyhdistykset.
- Eläkeläiset ry: jatka aluejärjestölistaa Kainuun ja Keski-Suomen jälkeen.
- EKL: käytä EKL-yhdistykset piireittäin -hakua ja lisää kuntarivit vain, kun yhdistys on lähteessä nimetty.
- KRELLI ja SPF: tarkenna nyt lisättyjä hakusivuja tarvittaessa paikallisyhdistyskohtaisiksi riveiksi.

## Validointirutiini jokaiselle toteutuspaketille

- Päivitä kattavuusraportti.
- Tarkista, että linkkiluettelon automaattiset tilastot muuttuvat odotetusti.
- Aja vähintään `npm run build`.
- Jos mukana on linkkigeneraattorin tai UI:n muutoksia, aja lisäksi kohdennettu tyyppitarkistus tai smoke-testi.
- Commitoi vain varsinaiset repo-muutokset. Paikalliset Office- tai auditointitiedostot jätetään ulkopuolelle, ellei niitä erikseen pyydetä.
