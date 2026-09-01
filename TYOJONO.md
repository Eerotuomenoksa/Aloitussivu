# TYÖJONO

**Tämä on projektin yksi työjono. Uudet tehtävät kirjataan tänne.**
Eero ja Codex poimivat työnsä täältä. Yksityiskohdat ovat linkitetyissä tiedostoissa — tämä on hakemisto, ei määrittely.

Koottu ensimmäisen kerran 31.8.2026 tiedostoista `TODO_HUMAN.md` ja `docs/codex-tehtava-*.md`.

## Miten tätä käytetään

1. **Uusi tehtävä kirjataan aina tähän tiedostoon**, myös silloin kun sille tehdään oma määrittelydokumentti. Rivi tänne, tarkka sisältö `docs/codex-tehtava-*.md` -tiedostoon.
2. **Codex aloittaa tästä.** Poimi ylimmästä avoimesta P1-tehtävästä, lue linkitetty tiedosto kokonaan ennen kuin kirjoitat riviäkään.
3. **Tila päivitetään tänne**, kun tehtävä valmistuu tai jää kesken. Älä jätä tilaa vain committiviestiin.
4. **Tunnisteet ovat pysyviä.** MK-01 tarkoittaa aina samaa asiaa, myös kun se on tehty.
5. `TODO_HUMAN.md` säilyy julkaisuportin dokumenttina — siellä ovat julkaisun ehdot ja päätökset. Tämä tiedosto on työjono. Jos ne ovat ristiriidassa, `TODO_HUMAN.md` voittaa julkaisua koskevissa asioissa.

## Kiireellisin ensin

### Eero — ennen torstaita 3.9.2026

| Tehtävä | Tila | Lisätiedot |
| --- | --- | --- |
| Tulosta A5-opastuskortti, 100 kpl | Valmis painettavaksi | `docs/a5-opastuskortti-A4-2up.pdf`, kaksipuolinen, käännä pitkältä sivulta |
| **P1 – WordPress-esittelysivun painikkeen `href`** | Avoin, estää laajan tiedotuksen | `TODO_HUMAN.md` › Avoinna ennen 1.9. |
| **P1 – 1.0.0:n ja tiedotuspäivän loppuportti** | Versionosto 1.0.0 tehty 1.9.2026, loppuportin tarkistuslista ja tiedotuksen GO yhä avoinna | `TODO_HUMAN.md` › Avoinna ennen 1.9. |
| P2 – palautteen onnistumisen tuotantouusinta 0.74.7:llä | Avoin | `TODO_HUMAN.md` › Avoinna ennen 1.9. |
| **Kävijätilastojen nollaus julkaisuaamuna** | Skripti valmis, ajamatta | `database/maintenance/reset-usage-stats.sql` ja sen README |
| **v1.0.0:n tuotantoonvienti** | Ajokirja valmis, ajamatta. Este: paketointi vaatii puhtaan työpuun (234 muutettua, joista 19 oikeita) | `docs/rel15-v100-tuotantopaivitys.md` |

### Codex — viikko 36 (1.–6.9.)

| Tunnisteet | Tehtävä | Prioriteetti | Määrittely |
| --- | --- | --- | --- |
| **MK-01…MK-03** | `?src=`-arvojen täydennys, `qr` pois | P1 | `docs/codex-tehtava-markkinointilinkit-src-2026-08-31.md` |
| **MK-04** | `?lang=`-parametri | P1 | sama tiedosto |
| **KO-01** | Tietosuojaseloste: kolmannen osapuolen palvelut | P1, ehto laajalle tiedotukselle | `docs/codex-tehtava-kolmannen-osapuolen-palvelut-2026-08-30.md` |
| **TS-01** | Tietosuojaselosteen selkokielistys (fi). Luonnos valmis, odottaa Eeron ja Ninan hyväksyntää. Ei viety koodiin. | P2 | `docs/tietosuoja-selkokieli-luonnos-2026-08-31.md` |
| **TS-02** | Selkokielistyksen käännös sv ja en | P3, tehdään vasta kun TS-01 hyväksytty | sama tiedosto |
| **TS-03** | Poista kuollut Gemini-koodi: `services/geminiService.ts`, `components/Assistant.tsx`, `components/NewsFeed.tsx`, `functions/gemini.ts`. Mitään ei renderöidä, mutta koodi pitää yllä reittiä Googlelle jota seloste ei mainitse | P3 | `docs/tietosuoja-selkokieli-luonnos-2026-08-31.md` › Koodista tarkistettu |
| **TS-04** | `services/data/providerConfig.ts`: vaihda oletusprovideriksi `cloudcity`. Nyt oletus on `firebase-rollback` (Firestore), jos `VITE_DATA_PROVIDER` unohtuu — silloin seloste olisi väärässä | P3 | sama tiedosto |

MK-04 on ehto ruotsinkieliselle kortille. KO-01 on ehto laajalle tiedotukselle.

### Codex — seuraavaksi, tila tarkistettava

Nämä on määritelty aiemmin. **Tarkista tila ennen aloitusta** — osa on voitu tehdä 30.8. jälkeen ilman että sitä on kirjattu.

| Tunnisteet | Aihe | Määrittely |
| --- | --- | --- |
| KK-01…KK-04 | Kotikunnan kysyminen, Asetukset, toinen paikkakunta | `docs/codex-tehtava-kotikunta-ja-toinen-paikkakunta-2026-08-30.md` |
| KO-02…KO-04 | RSS-haku palvelimelle, Nominatimin korvaaminen | `docs/codex-tehtava-kolmannen-osapuolen-palvelut-2026-08-30.md` |
| LC-01…LC-15 | Linkkitarkistuksen viimeistely. **LC-02 on kriittisin:** mikään ei kirjoita `blocked_links`-tauluun | `docs/codex-tehtava-linkkitarkistuksen-viimeistely-2026-08-30.md` |
| HS-01…HS-08 | Aloitussivuksi asettaminen ja asennus. **HS-03 (PWA-manifest + service worker) tiedetään tekemättömäksi** | `docs/codex-tehtava-aloitussivu-ja-asennus-2026-08-30.md` |
| SK-01…SK-02 | Sääkortti ja linkkikorjaukset | `docs/codex-tehtava-saakortti-ja-linkkikorjaukset-2026-08-30.md` |

### Eero — päätökset, jotka estävät muuta työtä

| Päätös | Miksi kiireellinen | Tausta |
| --- | --- | --- |
| **Tuotteen nimi ruotsiksi ja englanniksi** | Estää ruotsinkielisen kortin. Repo on itsensä kanssa ristiriidassa: `linkit-sv.html` sanoo *Seniorens startsida*, mutta `i18n.tsx`:n `pageTitle` on kaikilla kielillä *Seniorin aloitussivu* | `docs/kortin-kieliversiot-jarjestys-2026-08-31.md` |
| **`?src=`-arvolistan vahvistus** | Codex toteuttaa listan sellaisenaan ellei toisin sanota | `docs/codex-tehtava-markkinointilinkit-src-2026-08-31.md` › Päätetty lista |
| **Firebase-siirto EU:n ulkopuolelle: mainitaanko selosteessa?** | Eero vahvisti 31.8.: Firebase = vain ylläpitäjän kirjautuminen, vahvistettu koodista. Ninan päätettävä, kirjoitetaanko siirron peruste (vakiosopimuslausekkeet) selosteeseen vai jätetäänkö maininta pois | `docs/tietosuoja-selkokieli-luonnos-2026-08-31.md` › Avoinna |
| PREF-02-puute | Tuotepäätös tarvitaan | `TODO_HUMAN.md` |

### Aikataulutetut, ei vielä aloitettavat

| Aika | Tehtävä | Lisätiedot |
| --- | --- | --- |
| 9.9. | Juttunetin avaus — aloitussivun omaa tiedotusta ei tuolle viikolle | `docs/markkinointisuunnitelma-2026-2027.md` |
| 28.9. mennessä | Ruotsinkielinen A5-kortti valmiiksi Vanhustenviikolle | `docs/kortin-kieliversiot-jarjestys-2026-08-31.md` |
| 28.9. mennessä | A4 "Näin asetat läheisellesi aloitussivun" | markkinointisuunnitelma › luku 9 |
| 30.9. mennessä | **P1** – tuotantotietokannan vähimmän oikeuden käyttäjä | `TODO_HUMAN.md` › Julkaisun jälkeen |
| 5.–11.10. | Vanhustenviikko, teema *Arjen kohtaamiset* | markkinointisuunnitelma › vaihe 3 |
| Lokakuu | Arvio: englanninkielinen kortti vai uk/et/ru-käännösten viimeistely | `docs/kortin-kieliversiot-jarjestys-2026-08-31.md` |
| Elokuu 2026 → | SEC-015 nimipäiväintegraation jälkisiivous | `TODO_HUMAN.md` |

## Siivottavaa

| Asia | Tila |
| --- | --- |
| `docs/markkinointisuunnitelma-2026-2027.PAIVITETTY-31-8.md` siirrettävä alkuperäisen päälle | Odottaa: alkuperäinen tiedosto oli 31.8. lukossa (auki Eeron koneella) |
| Repon CRLF-ajautuma, 232 tiedostoa | Tunnettu, saastuttaa `npm run changelog` |
| `_to_delete/`-kansion sisältö | Eero voi poistaa |
