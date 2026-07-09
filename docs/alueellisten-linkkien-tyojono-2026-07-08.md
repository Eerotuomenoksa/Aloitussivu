# Alueellisten linkkien työjono 8.7.2026

Tämä työjono perustuu komennolla `npm run regional-coverage` päivitettyyn raporttiin `docs/alueelliset-linkit-puuttuvat-kunnat.md` ja koneelliseen tiedostoon `outputs/regional-link-coverage.json`.

## Kattavuus 9.7.2026

| Kokonaisuus | Tilanne |
| --- | ---: |
| Kuntia yhteensä | 308 |
| Julkinen liikenne valtakunnallisen fallbackin varassa | 221 |
| Palveluliikenteen oma linkki puuttuu | 171 |
| Paikallisuutisten RSS-syöte puuttuu | 295 |
| Sekä julkinen liikenne että palveluliikenne puuttuvat | 113 |

## Toteutettu 9.7.2026

Satakunnan ensimmäisestä täyttöaallosta lisättiin vahvistetut julkisen liikenteen seudulliset linkit:

| Kunnat | Linkki | Peruste |
| --- | --- | --- |
| Pori, Ulvila, Nakkila, Harjavalta, Kokemäki | Porin joukkoliikenne | Ulvilan kaupungin joukkoliikennesivu kertoo, että Porin seudullisen joukkoliikenteen järjestämisalueeseen kuuluvat Pori, Ulvila, Nakkila, Harjavalta ja Kokemäki. |
| Eura, Eurajoki, Karvia | Seutu+ | Seutu+ kokoaa Varsinais-Suomen ja Satakunnan seutuliikenteen reitit, aikataulut ja lipputuotteet. Porin joukkoliikenteen Seutu+-sivu vahvistaa Pori-Harjavalta-Kokemäki-Eura- ja Pori-Eurajoki-Rauma-yhteydet, ja Karvian kunnan sivu ohjaa Seutu+-reitteihin ja aikatauluihin. |

Jämijärvelle ei lisätty linkkiä, koska virallista kunnan omaa tai selvästi Jämijärven kattavaa seudullista palvelulähdettä ei löytynyt vielä riittävän varmasti.

## Ensimmäinen täyttöaalto

Aloita alueilta, joissa sekä julkisen liikenteen seudullinen/oma linkki että palveluliikenteen oma linkki puuttuvat monesta kunnasta.

| Prioriteetti | Alue | Molemmat liikennelinkit puuttuvat | Ensimmäiset kunnat |
| ---: | --- | ---: | --- |
| 1 | Pohjanmaan hyvinvointialue | 12 | Kaskinen, Korsnäs, Kristiinankaupunki, Kruunupyy, Laihia, Luoto |
| 2 | Pohjois-Pohjanmaan hyvinvointialue | 11 | Haapajärvi, Haapavesi, Hailuoto, Kalajoki, Kuusamo, Merijärvi |
| 3 | Varsinais-Suomen hyvinvointialue | 10 | Aura, Kemiönsaari, Koski Tl, Kustavi, Loimaa, Marttila |
| 4 | Keski-Suomen hyvinvointialue | 10 | Jämsä, Kannonkoski, Kinnula, Kivijärvi, Konnevesi, Kyyjärvi |
| 5 | Lapin hyvinvointialue | 9 | Enontekiö, Inari, Kemi, Keminmaa, Kolari, Pello |
| 6 | Etelä-Pohjanmaan hyvinvointialue | 9 | Alavus, Ilmajoki, Isojoki, Isokyrö, Karijoki, Soini |
| 7 | Kanta-Hämeen hyvinvointialue | 7 | Hausjärvi, Humppila, Jokioinen, Loppi, Riihimäki, Tammela |
| 8 | Keski-Pohjanmaan hyvinvointialue | 7 | Halsua, Kannus, Kaustinen, Lestijärvi, Perho, Toholampi |
| 9 | Pohjois-Savon hyvinvointialue | 6 | Kaavi, Kiuruvesi, Lapinlahti, Pielavesi, Rautalampi, Sonkajärvi |
| 10 | Satakunnan hyvinvointialue | 5 | Jämijärvi, Merikarvia, Pomarkku, Siikainen, Säkylä |

## Lähteiden tarkistusjärjestys

Käytä linkin hyväksymiseen tätä järjestystä:

1. Kunnan oma verkkosivu tai kunnan virallinen palvelusivu.
2. Seudullisen joukkoliikenneviranomaisen tai palveluntuottajan oma sivu.
3. Hyvinvointialueen tai maakunnallisen palvelun virallinen sivu, jos palvelu aidosti kattaa kunnan.
4. Kunnan sivulta löytyvä ohjaus naapurikunnan tai seudun palveluun.
5. Palveluntuottajan oma sivu, jos se nimeää kunnan tai alueen selvästi.

Älä lisää linkkiä pelkän hakutuloksen, vanhan uutisen, arkistosivun tai epäselvän yrityshakemiston perusteella.

## Naapurikunnan linkin hyväksyminen

Naapurikunnan tai toisen kunnan linkki on sallittu vain, jos jokin näistä toteutuu:

- käyttäjän oma kunta ohjaa kyseiseen palveluun
- palveluntuottaja kertoo palvelun kattavan käyttäjän kunnan
- seudullinen tai hyvinvointialueen sivu vahvistaa palvelun kuuluvan käyttäjän alueelle

Kun tällainen linkki lisätään, merkitse dataan vähintään:

- `scope: 'neighbor'`
- `sourceMunicipality`
- `fallbackFor`
- `sourceNote`
- `verifiedAt`

Käyttöliittymän pitää näyttää käyttäjälle selvästi, ettei kyse ole oman kunnan omasta palvelusta.

## Hyväksyttävä pieni eteneminen

Yhden ylläpitökerran realistinen tavoite on yksi hyvinvointialue tai 5-10 kuntaa:

1. Tarkista viralliset julkisen liikenteen lähteet.
2. Tarkista palveluliikenteen, asiointiliikenteen, kutsutaksin ja kuljetuspalvelun sivut.
3. Lisää vain vahvistetut linkit.
4. Aja `npm run regional-coverage`.
5. Kirjaa lähde ja tarkistuspäivä.

## Tarkistuslähteet 9.7.2026

- Porin joukkoliikenne, Seutu+: `https://pjl.pori.fi/etusivu/liput-ja-hinnat/seutu/`
- Ulvilan joukkoliikennesivu: `https://www.ulvila.fi/palvelut-ja-asuminen/tekniset-palvelut/kadut-ja-liikenne/joukkoliikenne/`
- Seutu+: `https://seutuplus.fi/`
- Seutu+ liikennöitsijät: `https://seutuplus.fi/liikennoitsijat/`
- Karvian joukkoliikenne ja taksipalvelut: `https://karvia.fi/palvelut/muut-palvelut/joukkoliikenne-ja-taksipalvelut/`
