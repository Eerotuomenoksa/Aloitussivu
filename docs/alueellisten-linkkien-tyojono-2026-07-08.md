# Alueellisten linkkien työjono 8.7.2026

Tämä työjono perustuu komennolla `npm run regional-coverage` päivitettyyn raporttiin `docs/alueelliset-linkit-puuttuvat-kunnat.md` ja koneelliseen tiedostoon `outputs/regional-link-coverage.json`.

## Kattavuus 9.7.2026

| Kokonaisuus | Tilanne |
| --- | ---: |
| Kuntia yhteensä | 308 |
| Julkinen liikenne valtakunnallisen fallbackin varassa | 218 |
| Palveluliikenteen oma linkki puuttuu | 167 |
| Paikallisuutisten RSS-syöte puuttuu | 295 |
| Sekä julkinen liikenne että palveluliikenne puuttuvat | 108 |

## Toteutettu 9.7.2026

Satakunnan ensimmäisestä täyttöaallosta lisättiin vahvistetut julkisen liikenteen seudulliset linkit:

| Kunnat | Linkki | Peruste |
| --- | --- | --- |
| Pori, Ulvila, Nakkila, Harjavalta, Kokemäki | Porin joukkoliikenne | Ulvilan kaupungin joukkoliikennesivu kertoo, että Porin seudullisen joukkoliikenteen järjestämisalueeseen kuuluvat Pori, Ulvila, Nakkila, Harjavalta ja Kokemäki. |
| Eura, Eurajoki, Karvia | Seutu+ | Seutu+ kokoaa Varsinais-Suomen ja Satakunnan seutuliikenteen reitit, aikataulut ja lipputuotteet. Porin joukkoliikenteen Seutu+-sivu vahvistaa Pori-Harjavalta-Kokemäki-Eura- ja Pori-Eurajoki-Rauma-yhteydet, ja Karvian kunnan sivu ohjaa Seutu+-reitteihin ja aikatauluihin. |

Jämijärvelle ei lisätty linkkiä, koska virallista kunnan omaa tai selvästi Jämijärven kattavaa seudullista palvelulähdettä ei löytynyt vielä riittävän varmasti.

Pohjanmaan jatkotäyttöaallosta lisättiin vahvistetut linkit:

| Kunnat | Linkki | Tyyppi | Peruste |
| --- | --- | --- | --- |
| Luoto | Luodon joukkoliikenne | Julkinen liikenne | Luodon kunnan joukkoliikennesivu kokoaa bussi-, juna- ja lentoyhteydet sekä ohjaa Ingsvaan ja Matkahuoltoon ajankohtaisia aikatauluja varten. |
| Luoto | Luoto VIP-palvelulinja | Palveluliikenne | Luodon kunnan VIP-palvelulinjasivu kertoo kunnan sopimasta Ingves & Svanbäckin palvelulinjasta Luodossa ja Pietarsaareen. |
| Pietarsaari | Pietarsaaren liikenneyhteydet | Julkinen liikenne | Pietarsaaren kaupungin liikenneyhteyssivu kertoo bussiaseman päivittäisistä yhteyksistä Vaasaan, Uuteenkaarlepyyhyn ja Kokkolaan sekä aseman liityntäbussista. |
| Pietarsaari | Pietarsaari Vippari | Palveluliikenne | Pietarsaaren kaupungin liikenneyhteyssivu kuvaa Vipparin tilausohjatuksi joukkoliikenteeksi. |
| Vöyri | Vöyrin joukkoliikenne | Julkinen liikenne | Vöyrin kunnan joukkoliikennesivu ohjaa Vöyri-Vaasa-linjaliikenteeseen ja Matkahuollon reittioppaaseen. |
| Kristiinankaupunki | Kristiinankaupunki palveluliikenne | Palveluliikenne | Kristiinankaupungin oma palveluliikennesivu kertoo eteläisten alueiden palveluliikenteen reitit, tilausohjeen ja puhelinnumeron. |
| Närpiö | Närpiö palveluliikenne | Palveluliikenne | Närpiön kaupungin palveluliikenteen reittiliite kuvaa perjantain palveluliikenteen, kohderyhmät, reitin ja tilausperiaatteen. |

Pohjanmaalta jäivät vielä molempien liikennelinkkien puutelistalle Kaskinen, Korsnäs, Kruunupyy, Laihia, Maalahti, Pedersören kunta ja Uusikaarlepyy. Kristiinankaupunki ja Närpiö jäivät julkisen liikenteen fallbackin varaan, mutta palveluliikenne täydentyi.

## Ensimmäinen täyttöaalto

Aloita alueilta, joissa sekä julkisen liikenteen seudullinen/oma linkki että palveluliikenteen oma linkki puuttuvat monesta kunnasta.

| Prioriteetti | Alue | Molemmat liikennelinkit puuttuvat | Ensimmäiset kunnat |
| ---: | --- | ---: | --- |
| 1 | Pohjois-Pohjanmaan hyvinvointialue | 11 | Haapajärvi, Haapavesi, Hailuoto, Kalajoki, Kuusamo, Merijärvi |
| 2 | Varsinais-Suomen hyvinvointialue | 10 | Aura, Kemiönsaari, Koski Tl, Kustavi, Loimaa, Marttila |
| 3 | Keski-Suomen hyvinvointialue | 10 | Jämsä, Kannonkoski, Kinnula, Kivijärvi, Konnevesi, Kyyjärvi |
| 4 | Etelä-Pohjanmaan hyvinvointialue | 9 | Alavus, Ilmajoki, Isojoki, Isokyrö, Karijoki, Soini |
| 5 | Lapin hyvinvointialue | 9 | Enontekiö, Inari, Kemi, Keminmaa, Kolari, Pello |
| 6 | Kanta-Hämeen hyvinvointialue | 7 | Hausjärvi, Humppila, Jokioinen, Loppi, Riihimäki, Tammela |
| 7 | Keski-Pohjanmaan hyvinvointialue | 7 | Halsua, Kannus, Kaustinen, Lestijärvi, Perho, Toholampi |
| 8 | Pohjanmaan hyvinvointialue | 7 | Kaskinen, Korsnäs, Kruunupyy, Laihia, Maalahti, Pedersören kunta |
| 9 | Pohjois-Savon hyvinvointialue | 6 | Kaavi, Kiuruvesi, Lapinlahti, Pielavesi, Rautalampi, Sonkajärvi |
| 10 | Etelä-Karjalan hyvinvointialue | 5 | Lemi, Luumäki, Ruokolahti, Savitaipale, Taipalsaari |

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
- Luodon joukkoliikenne: `https://larsmo.fi/boende-och-miljo/vagar-bathamnar-och-almanna-omraden/vagar-och-trafikleder/kollektivtrafik/`
- Luodon VIP-palvelulinja: `https://larsmo.fi/vard-och-omsorg/seniortjanster/servicelinjen-vip/`
- Pietarsaaren liikenneyhteydet: `https://jakobstad.fi/trafikforbindelser`
- Vöyrin joukkoliikenne: `https://www.vora.fi/tjanster/trafik-och-vagar`
- Oravais Trafik, Vöyri-Vaasa-linjaliikenne: `https://oravaistrafik.fi/linjetrafik/`
- Kristiinankaupungin palveluliikenne: `https://www.kristinestad.fi/asuminen-ja-ymparisto/palveluliikenne`
- Närpiön palveluliikenteen reittiliite: `https://www.narpes.fi/wp-content/uploads/2026/02/Service_Bilaga-A-Rutter.pdf`
