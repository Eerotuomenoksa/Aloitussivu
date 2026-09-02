# Repon tiedostokartta ja dokumenttien tila

Kirjattu 30.8.2026. Tarkoitus: ulkopuolinen pääsee kärryille kokonaisuudesta, ja tiedetään mitkä dokumentit ovat ajan tasalla ja mitkä eivät.

---

## 1. Tärkein havainto: arkkitehtuurikuvaus on vanhentunut

`docs/nykyarkkitehtuuri-asiantuntijakuvaus-2026-06-14.md` on kirjoitettu **14.6.2026**. Laskin sanaosumat: se mainitsee **Firestoren tai Firebasen 64 kertaa** ja **MariaDB:n tai Cloudcityn nolla kertaa**.

Elokuussa 2026 tuotannon taustajärjestelmä kuitenkin **vaihtui Firestoresta MariaDB:hen ja Cloudcityn webhotelliin** (REL-08 migraatio, REL-11 tuotantovaihto). Sovellus käyttää nyt omaa PHP-API:a (`api/src/`, 52 tiedostoa) saman originin takaa. Firebase on jäljellä vain ylläpitäjän tunnistautumisessa ja palautuspolkuna (`.env.firebase-rollback`).

**Kuvaus siis kertoo järjestelmästä, jota ei enää ole.** Sama koskee sen konepariskuntaa `nykyarkkitehtuuri-machine-readable-2026-06-14.json`.

Myös `README.md` sanoo yhä *"kevyita Firebase-taustapalveluja"* — se on osittain harhaanjohtava, vaikka mainitseekin Cloudcityn PHP-API:n myöhemmin.

**Tämä on korjattava ensimmäisenä, jos ulkopuolisen pitää ymmärtää kokonaisuus.** Uusin `docs/Seniorin-aloitussivu-tekninen-arkkitehtuuri.docx` on päivitetty 29.8., joten se saattaa olla ajan tasalla — sitä ei ole tarkistettu tässä.

---

## 2. Mistä järjestelmä koostuu

### Frontend — React + Vite, monisivuinen

`vite.config.ts` määrittelee **14 erillistä sisäänkäyntiä**. Jokainen on oma HTML-sivunsa ja oma juurikomponenttinsa repon juuressa:

| Sivu | Juurikomponentti | Mitä |
| --- | --- | --- |
| `index.html` | `App.tsx` (49 kB) | Etusivu: sää, haku, huijausvaroitukset, suosikit, paikalliset palvelut, kategoriat |
| `linkit.html` (+ sv, en) | `linkit.tsx` | Julkinen linkkiluettelo |
| `tietosuoja.html` (+ sv, en) | `tietosuoja.tsx` | Tietosuojaseloste |
| `saavutettavuus.html` (+ sv, en) | `saavutettavuus.tsx` | Saavutettavuusseloste |
| `muutosloki.html` | `muutosloki.tsx` | Julkinen muutosloki |
| `ehdotukset.html` | `ehdotukset.tsx` (73 kB) | **Ylläpitonäkymä**: linkkiehdotukset, estot, käyttötilastot, linkkitarkistus |
| `kehitysjono.html` | `kehitysjono.tsx` | Palautteista muodostuva kehitysjono |
| `yllapito.html` | `yllapito.tsx` | Ylläpidon kirjautuminen |
| `testipalaute.html` | `testipalaute.tsx` | Testauksen palautelomake |

`components/` sisältää 22 komponenttia, `hooks/` kaksi, `services/` 13 tiedostoa (data-providerit, RSS, sää, opastuspaikat, NCSC-haku).

### Linkkidata — repon juuressa olevat .ts-tiedostot

Tämä on palvelun varsinainen sisältö, noin 700 kB lähdedataa:

| Tiedosto | Koko | Sisältö |
| --- | ---: | --- |
| `seniorSurfGuidancePlaces.ts` | 286 kB | Digiopastuspaikat |
| `localServices.ts` | 109 kB | Alueellisten palvelujen kokoamislogiikka **ja** data |
| `localServiceTransportLinks.ts` | 64 kB | Palveluliikenne |
| `municipalRegistry.ts` | 44 kB | 308 kunnan perustiedot |
| `constants.tsx` | 42 kB | Valtakunnalliset palvelukategoriat (`SHORTCUTS`) |
| `communityLinks.ts` | 31 kB | Potilas- ja eläkeyhdistykset, museot |
| `localSeniorLinks.ts`, `localExerciseLinks.ts`, `localKelaTaxiNumbers.ts`, `municipalityNewsFeeds.ts`, `municipalityWebsites.ts`, `municipalityWebsiteLocales.ts`, `localNewspaperLinks.ts`, `localNewspaperFeeds.ts`, `localSportsClubs.ts` | 5–31 kB | Aihekohtaista alueellista dataa |

`i18n.tsx` (97 kB) sisältää käännökset seitsemälle kielelle. **Huom:** uk, et, ru ja se ovat osin puutteellisia kesäkuun UI-uudistuksen jäljiltä, ja `OnboardingTour.tsx`:llä on oma käännöstaulukko joka tukee vain fi/sv/en.

### Backend — PHP-API Cloudcityssä

`api/src/` (52 tiedostoa) toteuttaa saman originin REST-API:n: julkinen `PublicApi.php`, ylläpidon `AdminApi.php`, tietokantakerros, sähköposti-ilmoitukset (`NotificationJob`, `EmailDispatcher`), huijausvaroitusten haku (`NcscJob`) ja automaattinen linkkitarkistus (`LinkCheckJob`, `HttpLinkChecker`, `LinkCatalog`).

`api/cron/` sisältää viisi ajastettua työtä: `link-check.php`, `ncsc.php`, `notifications.php`, `email-dispatch.php`, `smtp-test.php`.

`database/migrations/` sisältää kahdeksan migraatiota. `008_usage_privacy_cleanup.sql` tekee käyttötilastojen tietojen minimoinnin ennen uuden tilastointikoodin aktivointia.

### Generoivat skriptit — `scripts/`

| Skripti | Mitä tekee |
| --- | --- |
| `build-link-catalog.mjs` | Kokoaa linkkikatalogin 21 lähdetiedostosta → `api/data/link-catalog.json`. **Tämä on palvelinputken syöte** |
| `link-catalog-test.mjs` | Katalogin testi + kattavuusvahti |
| `update-links.mjs` | Vanha linkkitarkistus, kirjoittaa `linkHealth.ts`, `linkStats.ts`, `localStats.ts` ja `docs/linkit*.csv` |
| `link-check-benchmark.mjs`, `link-fix-list.mjs` | Uudet mittaus- ja korjauslistatyökalut (30.8.) |
| `update-*.mjs` (9 kpl) | Kattavuusraporttien ja lehtidatan päivitys |
| `rel08-*`, `rel11-*` | Migraatio- ja provisiointityökalut |
| `build-*-package.ps1` | Julkaisupakettien kokoaminen |

**Kaksi rinnakkaista linkkiputkea on tällä hetkellä olemassa** (vanha Node-skripti ja uusi PHP-cron), eikä työnjakoa ole päätetty. Ks. LC-11.

---

## 3. Dokumenttien tila

`docs/` sisältää **87 markdown-tiedostoa**, 17 CSV:tä, 8 Office-tiedostoa ja kuvaliitteitä. Alla luokittelu. Merkintä *(luettu)* tarkoittaa että tiedosto on käyty läpi 30.8.; muut on luokiteltu nimen, päiväyksen ja asiayhteyden perusteella, ja ne kannattaa vahvistaa ennen poistoa.

### A. Ajantasaiset ja aktiiviset — säilytä

| Tiedosto | Mitä |
| --- | --- |
| `CODEX-JATKA-TASTA.md` | **Aloita tästä.** Työn jatkamisen käsikirja *(luettu)* |
| `codex-tehtava-linkkitarkistuksen-viimeistely-2026-08-30.md` | LC-01…LC-15, linkkiautomaation toimeksianto *(luettu)* |
| `codex-tehtava-aloitussivu-ja-asennus-2026-08-30.md` | HS-01…HS-08 *(luettu)* |
| `codex-tehtava-kotikunta-ja-toinen-paikkakunta-2026-08-30.md` | KK-01…KK-04 *(luettu)* |
| `codex-tehtava-saakortti-ja-linkkikorjaukset-2026-08-30.md` | SK-01, SK-02 *(luettu)* |
| `codex-tehtava-kolmannen-osapuolen-palvelut-2026-08-30.md` | KO-01…KO-04: tietosuojaseloste, RSS palvelimelle, Nominatim pois *(luettu)* |
| `codex-safe-browsing.md` | Toteuttamaton mutta yhä relevantti (LC-13) *(luettu)* |
| `linkit-mittaus-analyysi-2026-08-30.md` | Mittausajon analyysi *(luettu)* |
| `linkit-katalogin-kattavuus-2026-08-30.md` | Onko katalogi täydellinen *(luettu)* |
| `linkkilukujen-tasmaytys-2026-08-30.md` | Mistä luvut 5199/2386/1997 tulevat *(luettu)* |
| `linkkitarkistuksen-tarkkuus-ja-automaatio-2026-08-30.md` | Vanhan putken analyysi *(luettu)* |
| `rel14-v0770-automaattinen-linkkitarkistus.md` | Käyttöönotto-ohje, **seuraava julkaisu** *(luettu)* |
| `julkaisupaivakirja-2026-09.md` | Elävä julkaisupäiväkirja |
| `kuormitusarvio-cloudcity-pro-2026-08-29.md` | Kuormitusarvio |
| `markkinointisuunnitelma-2026-2027.md`, `lanseerausteksti-2026-09.md` | Viestintä |
| `kayttotilastot-ja-tietosuoja.md` | Tilastoinnin tietosuojaperuste |
| `artefaktien-sailytyslinjaus-2026-07-08.md` | **Mitä säilytetään versionhallinnassa** *(luettu)* |
| `tietoturvasuunnitelma.md` | Voimassa oleva linjaus |

### B. Generoituja raportteja — älä muokkaa käsin

Nämä skriptit kirjoittavat uudelleen. Muokkaus katoaa seuraavassa ajossa.

`linkit.md` ja `linkit.csv`, `puhelinnumerot.md` ja `.csv`, `yllapito-linkkiloki.csv`, `linkit-huomiot.csv`, `linkit-manuaalinen-tarkistus.csv`, `alueelliset-uutisfeedit-kattavuus.md`/`.csv`, `alueelliset-linkit.md`, `alueelliset-linkit-puuttuvat-kunnat.md`, `alueelliset-yhteisolinkit-kattavuus.md`, `kuntien-seniorisivut.md`/`.csv`, `kuntien-seniorisivut-syvatarkistus.md`/`.csv`, `kuntien-seniorisivujen-vaestokattavuus.md`, `kuntien-ohjattu-liikunta.md`/`.csv`, `kuntien-vakiluku-linkkitausta.md`/`.csv`, `kuntien-kieliversiot.csv`, `palveluliikenne-kartoitus.md`/`.csv`, `paikallisuutiset-puuttuvat-kunnat.md`, `julkinen-liikenne-puuttuvat-kunnat.md`

Lisäksi kertaluontoiset mittaustulokset, jotka voi poistaa kun uudempi on ajettu: `linkit-mittaus-2026-08-30-aamu.md`/`.csv`, `linkit-korjattavat-2026-08-30-aamu.md`/`.csv`, `http-https-tarkistus.csv`, `paikallislehtien-http-osoitteet-2026-08-26.md`.

### C. Julkaisuhistoria — säilytä, mutta ne ovat kertakäyttöisiä

17 `rel*`-tiedostoa. REL-08…REL-13 ovat toteutuneiden julkaisujen käyttöönotto-ohjeita; ne kannattaa säilyttää jäljitettävyyden vuoksi mutta ne eivät ohjaa mitään enää. **REL-11:llä on yksin yhdeksän tiedostoa** — ne kuvaavat saman tuotantovaihdon eri vaiheita ja voisi tiivistää yhdeksi.

`rel08-firestore-migraatio-ohje.md`, `rel09-tausta-ajot-ja-palautuskoe.md`, `rel10-wordpress-esittely-ja-ohjaus.md`, `rel11-*` (9 kpl), `rel12-v0750-tuotantopaivitys.md`, `rel13-v0760-sahkoposti-ilmoitukset.md`.

### D. Todennäköisesti vanhentuneita — tarkista ja poista tai arkistoi

Päivätyt työpaketit, joiden päivä on mennyt ja jotka on ilmeisesti toteutettu:

| Tiedosto | Päiväys |
| --- | --- |
| `huomisen-tyopaketti-2026-06-15.md` | 15.6. |
| `ensi-viikon-tyopaketti-2026-06-22.md` | 22.6. |
| `keskeneraiset-tyot-valmiiksi-2026-06-18.md` | 18.6. |
| `seuraava-tyopaketti-paatokset-ja-yllapitomalli-2026-06-14.md` | 14.6. |
| `julkaisun-paatoslista-2026-07-08.md` | 8.7. |
| `yllapitotarkistus-2026-07-08.md` | 8.7. |
| `elokuun-ensimmaisen-viikon-tyopaketti-2026-08-03.md` | 3.8. |
| `elokuun-julkaisusuunnitelma.md` | elokuu |
| `julkaisun-paivakohtaiset-tyopaketit-2026-08-14.md` | 14.8. |
| `julkaisun-tyopaketit-2026-09-01.md` | 1.9. |
| `rel11-huomisaamun-tyolista-2026-08-28.md` | 28.8. |
| `julkaisuroadmap-2026-10-06.md` + `.json` | 6.10. — tarkista onko yhä voimassa |

Toteutetut suunnitelmat, joiden lopputulos on jo koodissa:

`suunnitelma-ui-uudistus-vedos-a.md` (toteutettu 12.6.), `ui-vedos-a-varivyohykkeet.html` ja `ui-vedos-b-isot-kortit.html` (vedokset), `cloudcity-tietokanta-p1-suunnitelma-2026-08-14.md` (toteutettu REL-11:ssä), `saavutettavuus-ja-tietosuoja-sivut-suunnitelma.md`, `testauksen-palautelomake-suunnitelma.md`, `palautelomake-kysymykset-2026-06.md`.

### E. Päällekkäiset tietoturvadokumentit — yhdistä

Kuusi tiedostoa samasta aiheesta, osa lähes identtisiä:

- `tietoturva-arvio-2026-05-27.md` ja `tietoturva-arvio-2026-05-28.md` — **kaksi arviota peräkkäisiltä päiviltä**, tarkista onko toinen turha
- `tietoturvasuunnitelma.md` — voimassa oleva linjaus, säilytä
- `tietoturva-jatkotoiden-tyolista.md`, `security-workpackages.md`, `codex-tietoturva-toimenpiteet.md` — kolme päällekkäistä työlistaa
- `tietoturvaraportti.docx`
- `rel11-tietoturvapoikkeus-api-kayttaja-2026-08-28.md` — **elävä poikkeus**, umpeutuu 30.9.2026, säilytä

### F. Vanhentunut arkkitehtuurikuvaus — korjaa

`nykyarkkitehtuuri-asiantuntijakuvaus-2026-06-14.md` ja `nykyarkkitehtuuri-machine-readable-2026-06-14.json`. Ks. luku 1. **Älä poista ennen kuin korvaava on kirjoitettu** — ne ovat ainoa markdown-muotoinen kokonaiskuvaus.

`koodikatselmus-ja-palveluesitys.md` (31.5.) on samalta ajalta ja todennäköisesti yhtä vanhentunut.

### G. Muut

`tiimiesittely-aloitussivu.md`, `fakiirimedia-sahkopostiluonnos-2026-08-14.md`, `firebase-maaritys-ohje.md` (yhä tarpeen ylläpitäjän tunnistautumiselle), `tyotuntiseuranta.md`/`.csv`, `paivan-mietelauseet-ehdotus.csv`, `a5-kortti-aloitussivu.html`/`.pdf` (painettava kortti), `docs/esitykset/`, `docs/Lighthouse/` (säilytyslinjauksen mukaan **paikallinen**, ei versionhallintaan).

**Roskaa:** `~$`-alkuiset tiedostot (5 kpl) ovat Wordin lukitustiedostoja avoimista dokumenteista. Ne voi poistaa ja lisätä `.gitignore`en.

---

## 4. Suositus siivoukseen

Älä tee sitä nyt vaan yhtenä erillisenä työnä, kun julkaisu on ohi:

1. **Kirjoita arkkitehtuurikuvaus uusiksi** (luku 1). Se on ainoa kohta, joka oikeasti estää ulkopuolista ymmärtämästä kokonaisuutta.
2. **Lisää `docs/README.md`**, joka kertoo mistä aloittaa ja mitkä tiedostot ovat generoituja. Nyt 87 tiedostoa on yhtenä listana ilman hierarkiaa.
3. **Siirrä toteutuneet työpaketit ja julkaisuohjeet `docs/arkisto/`-kansioon.** Ei poistoa — jäljitettävyys säilyy, mutta aktiivinen kansio pienenee arviolta 30 tiedostoa.
4. **Yhdistä tietoturvadokumentit** yhdeksi voimassa olevaksi linjaukseksi ja yhdeksi työlistaksi.
5. **Merkitse generoidut tiedostot** otsikkoriville, esim. *"Generoitu komennolla `npm run links` — älä muokkaa käsin."* Osassa tämä on jo.
6. **Poista `~$`-lukitustiedostot** ja lisää `~$*` `.gitignore`en.

Tarkista ennen poistoa `artefaktien-sailytyslinjaus-2026-07-08.md`, jossa on jo päätetty mitä versionhallintaan kuuluu.
