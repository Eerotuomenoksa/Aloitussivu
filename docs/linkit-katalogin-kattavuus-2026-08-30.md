# Onko linkkikatalogi täydellinen?

Päivitetty: 30.8.2026
Menetelmä: kaikki repon `.ts`- ja `.tsx`-tiedostot käytiin läpi (pois lukien `node_modules`, `dist`, `functions` ja väliaikaishakemistot), jokainen lainausmerkeissä oleva `http(s)://`-osoite poimittiin ja verrattiin katalogiin `.tmp/link-catalog.json`.

## Vastaus: kyllä, katalogi kattaa kaikki käyttäjälle näkyvät linkit

| | |
| --- | ---: |
| Osoitteita katalogissa | **2 386** |
| Repossa katalogin ulkopuolella | 13 |
| Näistä käyttäjälle näkyviä linkkejä | **0** |

Kaikki 13 katalogin ulkopuolista osoitetta ovat rajapintoja, mallipohjia tai ei-linkkejä:

| Osoite | Mikä se on |
| --- | --- |
| `api.open-meteo.com/v1/forecast` | Säätietojen rajapinta |
| `geocoding-api.open-meteo.com/v1/search` | Kunnan koordinaattihaku |
| `nominatim.openstreetmap.org/reverse` | Sijainnista kunnaksi |
| `api.rss2json.com/v1/api.json` | RSS-syötteiden luku |
| `api.allorigins.win/raw` | CORS-välitys, varajärjestelmä edelliselle |
| `kyberturvallisuuskeskus.fi/feed/rss/fi` | Huijausvaroitusten lähde, palvelinpuoli |
| `europe-west1-<projectId>.cloudfunctions.net/*` (4 kpl) | Oma taustapalvelu |
| `google.com/search?q=${…}` | Muodostuu käyttäjän hausta |
| `w3.org/2000/svg` | SVG-nimiavaruus, ei avattava osoite |
| `https://` | Lomakkeen paikkamerkki |

Tarkistin erikseen kahdeksan komponenteissa olevaa käyttäjälinkkiä (Ilmatieteen laitos, maailmankello, opastuspaikat, Yle Uutiset, Kyberturvallisuuskeskuksen varoitukset, oma osoite, saavutettavuusvaatimukset.fi, SeniorSurf). **Kaikki kahdeksan olivat jo katalogissa**, koska ne esiintyvät myös `constants.tsx`-tiedostossa tai muualla katalogin lähteissä.

Lukumäärä kasvoi aamun ajosta: mittaus tehtiin 2 381 osoitteella, katalogissa on nyt 2 386. Viisi osoitetta on tullut päivän aikana lähdetiedostoihin.

## Mitä katalogin ulkopuolelle jää tarkoituksella

**Ylläpitäjän hyväksymät käyttäjäehdotukset.** Ne eivät ole lähdetiedostoissa vaan tietokannan `approved_links`-taulussa. `LinkCheckJob::syncApprovedLinks` synkronoi ne tarkistusjonoon erikseen, joten palvelinputki kattaa ne — mutta paikallinen mittausajo ei näe niitä. Todellinen tarkistettavien kokonaismäärä on siis **2 386 + hyväksytyt ehdotukset**. Kysy luku tuotannon ylläpitonäkymästä.

**Uutisotsikoiden osoitteet.** Ne muodostuvat ajossa RSS-syötteistä eivätkä ole ennalta tiedossa. Syötteiden osoitteet itse ovat katalogissa (297 kpl).

## Erillinen huomio: rajapinnat ovat valvomaton riski

Rajapinnat eivät kuulu linkkitarkistukseen, mutta **niiden hajoaminen rikkoo toiminnon kokonaan** eikä mikään huomaa sitä. Kolme kohtaa ansaitsee tarkastelun ennen laajaa tiedotusta:

1. **`api.rss2json.com` ja `api.allorigins.win`** ovat ilmaisia julkisia välityspalveluita ilman palvelutasolupausta. `services/rssService.ts:74` käyttää jälkimmäistä ensimmäisen varajärjestelmänä, mikä on hyvä — mutta jos molemmat ovat poissa, paikallisuutiset lakkaavat toimimasta. Kumpikaan ei ole kenenkään vastuulla.
2. **`nominatim.openstreetmap.org`** on OpenStreetMapin ilmainen palvelu, jolla on tiukka käyttöehto (enintään yksi pyyntö sekunnissa, tunnistettava User-Agent). Jos aloitussivu yleistyy ja pyyntöjä tulee paljon, palvelu voi estää liikenteen kokonaan. **Tarkista ennen laajaa tiedotusta**, mitä käyttöehto sallii ja tarvitaanko oma välimuisti palvelimelle.
3. **`api.open-meteo.com`** on ilmainen ei-kaupalliseen käyttöön, mutta sillekin on pyyntörajat.

Suositus: nämä eivät kuulu linkkitarkistukseen vaan omaan kevyeen valvontaan — esimerkiksi kerran vuorokaudessa ajettava tarkistus, joka hakee yhden testipyynnön kustakin rajapinnasta ja hälyttää sähköpostilla, jos vastaus ei ole kunnossa. Se on pieni lisä `api/cron`-hakemistoon.

## Kolmas havainto linkkiluetteloon (LC-15)

`linkit.tsx` rakentaa julkisen linkkiluettelon vain `constants.tsx`- ja `localServices.ts`-lähteistä. **Digiopastuspaikat (`seniorSurfGuidancePlaces.ts`, 256 osoitetta) eivät ole linkkiluettelossa lainkaan** — tiedostoa käyttää vain `services/guidancePlacesService.ts`.

Linkkiluettelon luku 5 199 ei siis ole vain eri määritelmä ("esiintymiä, kunnat erikseen") vaan myös epätäydellinen: se jättää yhden koko sisältöosion ulkopuolelle. Tämä kuuluu tehtävään LC-15.

## Miten kattavuus pysyy kunnossa

`scripts/build-link-catalog.mjs` lukee 15 lähdetiedostoa nimeltä. Jos uusi linkkitiedosto lisätään eikä sitä lisätä listalle, se jää tarkistuksen ulkopuolelle huomaamatta — juuri näin kävi `communityLinks.ts`- ja `seniorSurfGuidancePlaces.ts`-tiedostoille vanhassa `update-links.mjs`-skriptissä, ja niihin kertyi 70 % kaikista vioista.

Suositus (osa tehtävää LC-01): katalogitestin `scripts/link-catalog-test.mjs` on **kaadettava, jos repon juuresta löytyy `.ts`-tiedosto, joka sisältää yli 20 osoitetta eikä ole lähdelistalla**. Silloin katve ei voi toistua hiljaa.
