# REL-11: julkaisuportin testimatriisi 31.8.2026

Tämä matriisi suoritetaan jäädytetylle Cloudcity-staging-ehdokkaalle. Testituloksiin ei kirjata salasanoja, tunnisteita, yksityisten palautteiden sisältöä tai muita henkilötietoja.

## 1. Testikohde ja päätöstiedot

| Kenttä | Arvo |
| --- | --- |
| Staging | `https://staging.aloitussivu.seniorsurf.fi/` |
| Julkaisukandidaatti | `REL-10-v0.73.1-b28578557e5a` |
| Sovellusversio | `0.73.1` |
| Sovelluscommit | `b28578557e5a` |
| Staging-ZIP SHA-256 | `8d8fdabf6b7a575fc8ac059c11ceb34694ee268c24be00259e276f7b378e7044` |
| Skeemamigraatiot | `001_initial_schema`, `002_add_link_reports_triage_index` |
| Testipäivä | 31.8.2026 |
| Testauksen aloittaja ja aika | täytetään |
| Tekninen testaaja | täytetään |
| Senioritestaaja(t) | täytetään |
| WordPress-tarkistaja | täytetään |
| Go/no-go-hyväksyjä | täytetään |
| Päätös ja kellonaika | täytetään |

## 2. Tulos- ja havaintomerkinnät

- **PASS:** testi läpäisi hyväksymisehdon.
- **FAIL:** hyväksymisehto ei täyttynyt; havaintotunniste vaaditaan.
- **BLOCKED:** testiä ei voitu suorittaa; este, omistaja ja jatkoaika vaaditaan.
- **N/A:** testi ei sovellu; kirjallinen perustelu vaaditaan.
- **P1:** julkaisueste, kuten palvelun estyminen, tietojen menetys, oikeuksien ohitus, keskeisen toiminnon käyttökelvottomuus tai WordPress-regressio.
- **P2:** merkittävä virhe, jolla on toimiva kiertotapa; julkaisu vaatii tuotevastuun kirjallisen hyväksynnän.
- **P3:** vähäinen virhe, joka ei estä ydinkäyttöä; omistaja ja jatkoaika kirjataan.

Yksikin avoin P1 tarkoittaa päätöstä **NO-GO**. Jäädytettyä ehdokasta muutetaan vain dokumentoidun P1-korjauksen vuoksi. Korjaus vaatii uuden commitin, buildin, vaikutusaluetestin, koko P1-smoken ja uuden jäädytyksen.

## 3. Ennakkoehdot

| ID | P | Tarkistus | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| PRE-01 | P1 | Stagingin `build-info.json` | Build ID, commit ja `workingTreeDirty: false` vastaavat yllä olevaa testikohdetta. |  |  |
| PRE-02 | P1 | API-health ja MariaDB | `/api/v1/health` palauttaa `status: ok`, `database: up` ja `version: v1`. |  |  |
| PRE-03 | P1 | Muuttumaton ehdokas | Stagingin pääbundle on `assets/main-DW1uN0JW.js`; jäädytyksen jälkeen ei ole tehty sovellus- tai palvelinasetusmuutosta. |  |  |
| PRE-04 | P1 | Stagingin palautuspiste | Tiedostopalautuspaketti ja tuore tietokantavarmistus ovat olemassa yksityisessä sijainnissa. |  |  |
| PRE-05 | P1 | WordPress-esittelysivu | `/aloitussivu-palvelu/` on julkaistu hyväksytyllä sisällöllä ja suoralla `/aloitus/`-linkillä. |  |  |
| PRE-06 | P1 | Tuotannonkaltainen `/aloitus/`-koe | Suora polku, API-entrypoint ja resurssit voidaan testata WordPressin rinnalla ilman pääjuuren `.htaccess`-muutosta tai Redirection-sääntöä. |  |  |
| PRE-07 | P1 | Vastuut ja muutosikkuna | Varmistus-, vaihto-, smoke- ja palautusvastuut sekä tuotannon kellonaika on vahvistettu. |  |  |
| PRE-08 | P1 | Testiaineisto | Lomake- ja ylläpitotesteissä käytettävä keinotekoinen aineisto on sovittu; todellisia henkilötietoja ei käytetä. |  |  |

PRE-05 ja PRE-06 ovat tämän matriisin valmisteluhetkellä avoimia riippuvuuksia. Niitä ei saa merkitä PASSiksi pelkän staging-alidomainin perusteella.

## 4. Näkymä- ja tekstikokomatriisi

Käytä selaimen zoomia 100 prosenttia ja säädä sovelluksen **Tekstikoko** Asetuksista taulukon arvoon. Tee jokaisella rivillä sama ydinkoe: yläosa, Google-haku, palveluhaku, sää, Lähelläsi, palvelukategoriat, Asetukset, palaute, selostelinkit ja alatunniste.

Hyväksymisehto kaikille riveille: ei vaakasuuntaista sivuvieritystä, leikkautuvaa sisältöä tai päällekkäisiä ohjaimia; teksti, fokus ja painikkeet säilyvät käytettävinä; modaalit mahtuvat näkymään ja niitä voi vierittää pystysuunnassa.

| ID | P | Leveys | Tekstikoko | Tulos | Todiste tai havainto |
| --- | --- | ---: | ---: | --- | --- |
| UI-01 | P1 | 320 px | 100 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät ja olivat pystysuunnassa vieritettävissä. |
| UI-02 | P1 | 320 px | 150 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät ja olivat pystysuunnassa vieritettävissä. |
| UI-03 | P1 | 320 px | 200 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät ja olivat pystysuunnassa vieritettävissä. |
| UI-04 | P1 | 375 px | 100 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät ja olivat pystysuunnassa vieritettävissä. |
| UI-05 | P1 | 375 px | 150 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät ja olivat pystysuunnassa vieritettävissä. |
| UI-06 | P1 | 375 px | 200 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät ja olivat pystysuunnassa vieritettävissä. |
| UI-07 | P1 | 768 px | 100 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät kokonaan ja olivat pystysuunnassa vieritettävissä. |
| UI-08 | P1 | 768 px | 150 % | FAIL | Sivulla ei ole vaakaylivuotoa, mutta Asetukset-ikkuna leikkautuu vasemmalta: leveys noin 720 px ja vasen reuna noin 27 px näkymän ulkopuolella. |
| UI-09 | P1 | 768 px | 200 % | FAIL | Asetukset-ikkuna on noin 960 px leveä ja sen vasen reuna noin 287 px näkymän ulkopuolella; otsikkoa ja vasemman reunan ohjaimia leikkautuu. |
| UI-10 | P1 | 1280 px | 100 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät kokonaan ja olivat pystysuunnassa vieritettävissä. |
| UI-11 | P1 | 1280 px | 150 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät kokonaan ja olivat pystysuunnassa vieritettävissä. |
| UI-12 | P1 | 1280 px | 200 % | PASS | Ei vaakaylivuotoa; ydinosat sekä Asetukset- ja Palaute-ikkunat näkyivät kokonaan ja olivat pystysuunnassa vieritettävissä. |

Rivit UI-01–UI-12 suoritettiin 26.8.2026 HTTP Basic Auth -suojatussa Cloudcity-stagingissa selaimen zoomilla 100 prosenttia ja jäädytetyllä ehdokkaalla `REL-10-v0.73.1-b28578557e5a`. Testitunnuksia ei tallennettu matriisiin tai projektin tiedostoihin. Tulos: 10 PASS ja 2 FAIL; UI-08 ja UI-09 ovat samaan Asetukset-ikkunan leveyteen liittyvä avoin P1-havainto.

### Korjauskierros 26.8.2026 (paikallinen varmennus, ei staging)

Havainnon `REL11-UI-01` korjaus varmennettiin paikallisesti rakennetulla korjatulla buildilla. Tarkistus tehtiin Chromiumilla suomenkielisessä käyttöliittymässä tekstirivien tarkkuudella: jokaisen paneelin tekstirivin ja ohjaimen suorakulmio verrattiin näkymän reunoihin, minkä lisäksi tarkistettiin sivun vaakaylivuoto sekä paneelin pysty- ja vaakavieritys.

| Vaihe | Tulos |
| --- | --- |
| Lähtötaso ilman korjausta, tiukka tarkistus | 2 PASS / 10 FAIL |
| Codexin leveyskorjaus, tiukka tarkistus | 11 PASS / 1 FAIL (UI-03) |
| Leveyskorjaus + fokuksenhallinta + `legend`-rajaus | 12 PASS / 0 FAIL |

Näppäimistökoe korjatulla buildilla 768 px / 150 %: fokus siirtyy avattaessa `Sulje`-painikkeeseen, 40 peräkkäistä sarkainpainallusta ja vaihto-sarkain pysyivät paneelin sisällä, Esc sulki paneelin ja palautti fokuksen `Avaa asetukset` -painikkeeseen.

Nämä tulokset **eivät** korvaa stagingissa ajettavia rivejä. Korjaus muuttaa pääbundlen tiivistettä, joten UI-01–UI-12 sekä A11Y-02 ja A11Y-04 ajetaan uudelleen uudella jäädytetyllä ehdokkaalla, ja PRE-01 sekä PRE-03 päivitetään sen tunnisteilla.

## 5. Teemat ja asetusten säilyminen

| ID | P | Testi | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| THEME-01 | P1 | Vihreä, vaalea ja tumma | Teksti, linkit, fokus, ohjaimet ja tilat erottuvat; sisältö ei katoa. | PASS (paikallinen build) | 26.8.2026 paikallisella Chromium-buildilla: teksti/tausta 16.5:1 ja 17.4:1, painikkeen teksti/tausta 9.1:1 ja 4.9:1 (vaalea/tumma). Ei stagingissa. |
| THEME-02 | P1 | Violetti, vaalea ja tumma | Sama hyväksymisehto kuin THEME-01:ssä. | PASS (paikallinen build) | Teksti/tausta 17.6:1 ja 17.7:1, painikkeen teksti/tausta 10.0:1 ja 6.5:1. Ei stagingissa. |
| THEME-03 | P1 | Sininen, vaalea ja tumma | Sama hyväksymisehto kuin THEME-01:ssä. | PASS (paikallinen build) | Teksti/tausta 17.1:1 ja 17.5:1, painikkeen teksti/tausta 11.3:1 ja 6.3:1. Ei stagingissa. |
| THEME-04 | P1 | Ruskea, vaalea ja tumma | Sama hyväksymisehto kuin THEME-01:ssä. | PASS (paikallinen build) | Teksti/tausta 17.7:1 ja 17.6:1, painikkeen teksti/tausta 8.4:1 ja 5.0:1. Ei stagingissa. |
| PREF-01 | P2 | Kotikunta, teema, kellot ja tekstikoko | Asetukset säilyvät sivun päivityksen jälkeen vain paikallisesti selaimessa. | PASS (paikallinen build) | Automatisoitu koe: asetukset säilyivät todellisen sivunlatauksen yli, ja uusi selainistunto (tyhjä localStorage) näytti oletukset. |
| PREF-02 | P2 | Asetusten palautus | Oletusasetusten palautus toimii eikä poista palvelimen tietoja. | FAIL (löydös) | Sovelluksessa ei ole "palauta kaikki oletusasetukset" -painiketta — Asetuksista löytyy vain tekstikoon oma "Palauta normaali tekstikoko". Rivin hyväksymisehto ei vastaa nykyistä käyttöliittymää; vaatii tuotepäätöksen (uusi ominaisuus tai rivin uudelleenmuotoilu). |
| PREF-03 | P1 | Paikallisuutisten oletus | Uutiset ovat puhtaassa istunnossa piilossa eivätkä syötteet lataudu ennen valintaa. | PASS (paikallinen build) | Verkkopyyntöjä uutis-/RSS-osoitteisiin ei havaittu ennen käyttäjän valintaa; `uiVisibility.regionalNews` oletuksena `false`. |
| PREF-04 | P1 | Paikallisuutisten käyttöönotto | Valinta näyttää oikean kunnan uutiset ja käynnistää syötteet hallitusti. | ei testattu | Vaatii oikean uutissyötteen (verkko/Cloudcity) — ei testattavissa paikallisesti. |

## 6. Näppäimistö ja ruudunlukijan perusrakenne

| ID | P | Testi | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| A11Y-01 | P1 | Ohita sisältöön -linkki | Linkki tulee näkyviin fokuksessa ja siirtää pääsisältöön. | PASS (paikallinen build) | Ensimmäinen sarkain löytää "Siirry sisältöön" -linkin, Enter siirtää fokuksen `#main-content`-elementtiin. |
| A11Y-02 | P1 | Koko sivun sarkainjärjestys | Järjestys on looginen, mikään kohde ei jää saavuttamatta eikä synny näppäimistöansaa. | PASS (paikallinen build) | 80 peräkkäistä sarkainpainallusta ei jäänyt loukkuun. Sama koe paljasti A11Y-03-havainnon (ks. alla) — korjattu commitissa `bd492c4`, vahvistettava manuaalisesti. |
| A11Y-03 | P1 | Näkyvä fokus | Fokus näkyy jokaisessa linkissä, painikkeessa, kentässä, valinnassa ja modaalissa kaikilla teemoilla. | FAIL → korjattu, vahvistus kesken | Automatisoitu CSS-tarkistus löysi 26.8.2026: neljältä ylätunnisteen painikkeelta (Palaute, Ohje, ℹ️ Tietoa, ⚙️ Asetukset) puuttui sovelluksen oma fokusrengas kaikissa 8 teema/tila-yhdistelmässä (`outline-width: 0`, läpinäkyvä `box-shadow`), toisin kuin footerin identtisillä painikkeilla. Lisätty samat `focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]`-luokat kuin footerissa (commit `bd492c4`). TypeScript ja build puhtaita. Automaattista visuaalista jälkivarmennusta ei saatu luotettavaksi tässä istunnossa (headless-testiajurin ja Reactin välinen ajoitusongelma esti DOM-tarkistuksen) — **vaatii lyhyen manuaalisen sarkainkokeen oikealla selaimella ennen kuin rivi merkitään PASSiksi**. |
| A11Y-04 | P1 | Asetukset | Avaus, kaikki ohjaimet, sulkeminen ja fokuksen palautus toimivat näppäimistöllä. | PASS (paikallinen build) | Ks. REL11-UI-01/A11Y-01-korjaus: alkufokus, sarkainrajaus, Esc ja Sulje palauttavat fokuksen — automatisoitu koe 40/40 sarkainta pysyi paneelissa. |
| A11Y-05 | P1 | Modaalit | Tietoa-, palaute-, linkki-ilmoitus-, palveluvalinta- ja aloitussivuohjemodaali rajaavat fokuksen, sulkeutuvat Escillä ja palauttavat fokuksen avaajaan. | Osittain PASS (paikallinen build) | Automatisoitu koe kattoi Palaute- ja Tietoa-modaalit: fokusloukku, Esc ja fokuksen palautus toimivat. Linkki-ilmoitus-, palveluvalinta- ja aloitussivuohjemodaalia ei vielä testattu. |
| A11Y-06 | P1 | Otsikot ja maamerkit | Yksi pääotsikko; header, nav, main ja footer ovat tunnistettavissa; otsikkotasot ovat loogiset. | PASS (paikallinen build) | Yksi `h1`, header/nav(×3)/main/footer löytyvät, otsikkotasoissa ei hyppyjä (h1→h2→h3). |
| A11Y-07 | P1 | Kenttien nimet ja virheet | Hakujen ja lomakkeiden nimet, pakollisuus, virheet ja onnistumisviestit välittyvät ruudunlukijalle. |  | Ei testattu tässä kierroksessa — vaatii lomakekohtaisen kokeen. |
| A11Y-08 | P1 | Dynaamiset tilat | Tekstikoko, hakutulokset, lataus, virhe ja onnistuminen ilmoitetaan ilman kohtuutonta fokuksen siirtoa. |  | Ei testattu tässä kierroksessa — vaatii aria-live-alueiden kohdennetun kokeen. |
| A11Y-09 | P2 | Kielenvaihto | Suomi, ruotsi ja englanti vaihtuvat; dokumentin kieli ja keskeiset nimet vastaavat valintaa. | PASS (paikallinen build) | `fi`/`sv`/`en`: `html[lang]`, sivun otsikko ja "Siirry sisältöön" / "Gå till innehållet" / "Skip to content" vaihtuvat oikein. |

## 7. Julkiset ydintoiminnot ja linkit

| ID | P | Testi | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| CORE-01 | P1 | Google-haku | Tyhjä haku estyy; tavallinen hakusana avaa oikein URL-koodatun Google-haun. |  |  |
| CORE-02 | P1 | Palveluhaku | Tunnettu palvelu löytyy; nollatulos on ymmärrettävä eikä riko sivua. |  |  |
| CORE-03 | P1 | Sää | Valitun kunnan sää latautuu tai näyttää hallitun virhetilan. |  |  |
| CORE-04 | P1 | Lähelläsi | Kotikunnan palvelut, yhteystiedot ja kartta-/verkkolinkit vastaavat valintaa. |  |  |
| CORE-05 | P1 | Kuntien seniorilinkit | Vähintään kolme erilaista kuntaa avaa oikean senioripalvelukohteen. |  |  |
| CORE-06 | P1 | Yhden ja usean linkin aiheet | Yhden linkin aihe avautuu suoraan; usean linkin aihe avaa valintaikkunan. |  |  |
| CORE-07 | P1 | Huijausvaroitukset | Varoitukset latautuvat MariaDB/API-providerilta; tyhjä ja virhetila ovat hallittuja. |  |  |
| CORE-08 | P1 | Keskeiset palvelulinkit | Vähintään yksi linkki jokaisesta pääkategoriasta sekä puhelinlinkkien otos toimii. |  |  |
| CORE-09 | P1 | Julkinen navigaatio | Beta-, Muutosloki-, Ylläpito-, testaus- ja kehitysjonolinkit eivät näy. |  |  |
| CORE-10 | P1 | Julkiset hyötylinkit | Linkkiluettelo, Tietosuoja ja Saavutettavuusseloste avautuvat oikein. |  |  |
| CORE-11 | P1 | Metatiedot | Staging on `noindex`; canonical ja Open Graph osoittavat `https://seniorsurf.fi/aloitus/`-osoitteeseen. |  |  |
| CORE-12 | P1 | Sisäiset suorat sivut | Sisäiset HTML-sivut säilyvät suorilla osoitteilla ja ovat `noindex`-rajattuja. |  |  |

## 8. Lomakkeet, käyttötilasto ja ylläpito

Käytä tunnisteetonta testitekstiä, esimerkiksi `REL11-TESTI-20260831`. Älä kopioi vastausten sisältöä päiväkirjaan.

| ID | P | Testi | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| DATA-01 | P1 | Linkki-ilmoitus | Hyväksytty ilmoitus tallentuu kerran; onnistumisviesti näkyy; tuplalähetys ei luo duplikaattia. |  |  |
| DATA-02 | P1 | Avoin palaute | Hyväksytty palaute tallentuu; onnistumisviesti näkyy eikä vastauksen sisältö vuoda URLiin tai lokiin. |  |  |
| DATA-03 | P1 | Kuvakaappausliite | Sallittu kuva tallentuu suojattuun liitetilaan ja näkyy vain tunnistetulle ylläpitäjälle. |  |  |
| DATA-04 | P1 | Testipalaute suoralla osoitteella | Lomake tallentaa sovitun sopimuksen mukaisesti; julkisessa navigaatiossa ei ole linkkiä. |  |  |
| DATA-05 | P1 | Käyttötilasto | 15 sekunnin jälkeen sivulataus ja yksi linkkiklikkaus kasvattavat vain tunnisteettomia päiväaggregaatteja. |  |  |
| ADMIN-01 | P1 | Hyväksytty admin | Firebase-kirjautuminen avaa ylläpidon ja yksityiset kokoelmat. |  |  |
| ADMIN-02 | P1 | Hyväksytty viewer | Luku onnistuu mutta kirjoittavat toiminnot estyvät. |  |  |
| ADMIN-03 | P1 | Passiivinen tai tuntematon käyttäjä | Ylläpito palauttaa hallitun 403-tilan eikä yksityisiä tietoja näy. |  |  |
| ADMIN-04 | P1 | Linkki-ilmoituksen muutos | Sallittu tilamuutos tallentuu ja luo henkilötiedottoman auditointimerkinnän. |  |  |
| ADMIN-05 | P1 | Liitteen lataus | Tunnistettu ylläpitäjä saa oikean kuvan; suora julkinen URL ei toimi. |  |  |
| ADMIN-06 | P1 | NCSC-ajon näkymä | Viimeisimmät ajot näkyvät; käsiajo onnistuu tai ohittuu hallitusti ilman duplikaattia. |  |  |

## 9. Virhe- ja suojaustestit

| ID | P | Testi | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| ERR-01 | P1 | Ylimittainen syöte | API torjuu pyynnön ennen tallennusta vakaalla 4xx-virheellä. |  |  |
| ERR-02 | P1 | Virheellinen JSON tai sisältötyyppi | API torjuu pyynnön; tietokantaan ei synny riviä. |  |  |
| ERR-03 | P1 | Väärä tai naamioitu liite | Liite torjutaan eikä julkista tai suojattua tiedostoa synny. |  |  |
| ERR-04 | P1 | Luvaton ylläpitoreitti | Pyyntö torjutaan 401/403-tilalla ilman yksityistä vastaussisältöä. |  |  |
| ERR-05 | P1 | Puuttuva sivu | Staging näyttää Aloitussivun oman 404-sivun eikä hakemistolistausta. |  |  |
| ERR-06 | P1 | API- tai verkkovirhe | Käyttöliittymä näyttää hallitun virheen, ei tyhjää sivua; turvallinen toiminta jatkuu. |  |  |
| ERR-07 | P1 | Palautusprovider | Firebase-palautusbuild muodostuu ja dokumentoitu hallittu palautuspolku on käytettävissä. |  |  |
| ERR-08 | P1 | HTTPS ja suojausotsikot | HTTPS, CSP, HSTS, MIME-suojaus, referrer-politiikka ja kehystysrajaus vastaavat hyväksyttyä staging-tasoa. |  |  |
| ERR-09 | P1 | Välimuisti ja pakkaus | HTML on lyhytikäinen; hashatut resurssit pitkäikäisiä; gzip tai Brotli toimii; API-health on `no-store`. |  |  |

## 10. WordPress- ja suoran `/aloitus/`-polun testit

Näissä testeissä ei muuteta WordPressin pääjuuren `.htaccess`-tiedostoa, teemaa, lisäosia tai tietokantaa muuten kuin tuotevastuun erikseen hyväksymän esittelysivun osalta.

| ID | P | Testi | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| WP-01 | P1 | WordPress-etusivu | HTTP 200, otsikko ja näkyvä rakenne vastaavat REL-01:n lähtötasoa. |  |  |
| WP-02 | P1 | Etäopastus, Ajankohtaista ja Yhteystiedot | Kaikki palauttavat HTTP 200:n ja keskeinen sisältö näkyy. |  |  |
| WP-03 | P1 | Julkinen WordPress-haku | Tunnettu `digiopastus`-haku näyttää hakutulossivun. |  |  |
| WP-04 | P1 | Kirjautuminen ja vertailumedia | `/wp-admin/` ohjaa kirjautumiseen; kirjautumissivu ja sovittu media toimivat muuttumattomina. |  |  |
| WP-05 | P1 | Esittelysivu | `/aloitussivu-palvelu/` palauttaa 200:n, sisältö on hyväksytty, mobiilinäkymä toimii ja linkki osoittaa suoraan `/aloitus/`-osoitteeseen. |  |  |
| WP-06 | P1 | `/aloitus/` loppukauttaviivalla | HTTP 200 ilman ulkoista ohjausta; osoitepalkki säilyy `seniorsurf.fi/aloitus/`-muodossa. |  |  |
| WP-07 | P1 | `/aloitus` ilman loppukauttaviivaa | Ohjaus päätyy kerran kanoniseen `/aloitus/`-osoitteeseen ilman silmukkaa tai alidomainia. |  |  |
| WP-08 | P1 | Tuotannonkaltainen health | `/aloitus/api/v1/health` palauttaa 200:n, `ok`, `up`, `v1` ja `Cache-Control: no-store`. |  |  |
| WP-09 | P1 | Resurssit ja API | Frontend lataa resurssit `/aloitus/assets/`-polusta ja API-pyynnöt `/aloitus/api/v1`-polusta. |  |  |
| WP-10 | P1 | Aloitussivun 404 | Puuttuva `/aloitus/`-alipolku näyttää Aloitussivun oman 404:n eikä WordPressin 404:ää. |  |  |
| WP-11 | P1 | WordPressin jälkeen-savukoe | WP-01–WP-04 läpäisevät uudelleen Aloitussivun polkutestin jälkeen. |  |  |

## 11. Varmistus, delta ja tuotantovalmius

| ID | P | Testi | Hyväksymisehto | Tulos | Todiste tai havainto |
| --- | --- | --- | --- | --- | --- |
| OPS-01 | P1 | Viimeinen staging-tiedostovarmistus | Varmistuksen aika, sijainti ja palautusoikeus on kirjattu ilman sisältöä. |  |  |
| OPS-02 | P1 | Viimeinen staging-tietokantavarmistus | Vienti tai Cloudcity-varmistus on tuore; koko ja SHA-256 kirjataan yksityisesti. |  |  |
| OPS-03 | P1 | Firestore-deltan kuivaharjoitus | Kuivaharjoitus valmistuu, rivimäärät ja tiivisteet täsmäävät eikä stagingiin kirjoiteta. |  |  |
| OPS-04 | P1 | Tuotantotietokanta | Tyhjä kohde, migraatiot, vähimmän oikeuden käyttäjä ja palautuspolku on vahvistettu. |  |  |
| OPS-05 | P1 | Tuotantopaketti | Tuotantopolun paketti vastaa commitia `b28578557e5a`, käyttää `/aloitus/api/v1`-polkua eikä sisällä salaisuuksia. |  |  |
| OPS-06 | P1 | Vaihto- ja palautusvastuut | Henkilöt, kellonajat, pysäytysehto ja palautusjärjestys on hyväksytty. |  |  |
| OPS-07 | P1 | Julkaisuviestit | Viestit ovat valmiit mutta niitä ei lähetetä ennen REL-12-smoken hyväksyntää. |  |  |

## 12. Havaintoloki

| Havainto | Testi-ID | P1/P2/P3 | Kuvaus ja toistaminen | Vaikutus | Omistaja | Tila | Päätös tai jatkoaika |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REL11-UI-01 | UI-08, UI-09 | P1 | Aseta näkymäksi 768 px, selaimen zoomiksi 100 % ja sovelluksen tekstikooksi 150 tai 200 %. Avaa Asetukset. Ikkuna skaalautuu 150 %:ssa noin 720 px ja 200 %:ssa noin 960 px leveäksi, jolloin vasen reuna jää näkymän ulkopuolelle. | Osa otsikosta ja ohjaimista leikkautuu; 200 %:ssa Asetukset eivät ole luotettavasti käytettävissä. | kehitys | korjattu paikallisesti 26.8.2026 | Paikallinen tiukka matriisi 12/12 PASS. Uusintatesti stagingissa vaaditaan uudella ehdokasbuildilla ennen portin hyväksyntää. |
| REL11-UI-02 | UI-03 | P2 | Aseta näkymäksi 320 px ja tekstikooksi 200 %. Avaa Asetukset ja vieritä kellotyyliin ja teemavalintaan. Painikkeen teksti `Digitaalinen` ylitti oikean reunan 6 px ja fieldsetin otsikko `Kiinnostavat teemat` 21 px. | Kapeimmassa näkymässä suurimmalla tekstikoolla osa tekstistä leikkautui. | kehitys | korjattu paikallisesti 26.8.2026 | `legend` sai `max-width: 100%` ja alle 640 px:n näkymissä sallittiin pitkien sanojen katkaisu. Uusintatesti stagingissa uudella ehdokkaalla. |
| REL11-A11Y-01 | A11Y-02, A11Y-04 | P1 | Avaa Asetukset näppäimistöllä 768 px / 150 %. Korjauksen ensimmäisessä versiossa paneeli renderöitiin portaalilla `document.body`-elementin loppuun ilman alkufokusta ja fokuksen rajausta, joten paneelin ensimmäiseen ohjaimeen pääsi vasta 66 sarkainpainalluksella (lähtötaso 4). | Näppäimistökäyttäjä ei käytännössä pääse Asetuksiin. | kehitys | korjattu paikallisesti 26.8.2026 | Paneeli sai alkufokuksen, sarkainrajauksen ja fokuksen palautuksen. Uusintatesti stagingissa uudella ehdokkaalla. |

Havaintoon ei kopioida yksityisen lomakevastauksen, ylläpitotietueen tai liitteen sisältöä.

## 13. Go/no-go-päätös

| Portti | Vaatimus | Tulos |
| --- | --- | --- |
| Testikattavuus | Kaikki P1-rivit ovat PASS tai perustellusti N/A; yksikään P1 ei ole BLOCKED. | Kesken: stagingin näkymämatriisi 10 PASS / 2 FAIL; korjattu koodi läpäisi paikallisen tiukan matriisin 12/12; muut P1-rivit avoinna. |
| Avoimet P1-havainnot | 0 | 2 (`REL11-UI-01`, `REL11-A11Y-01`); molemmat korjattu paikallisesti 26.8.2026, mutta avoinna kunnes uusi ehdokas on jäädytetty ja uusintatestattu stagingissa |
| P2/P3-poikkeamat | Jokainen on kirjallisesti hyväksytty, omistettu ja aikataulutettu. |  |
| WordPress | Ennen- ja jälkeen-savukoe läpäisty ilman regressiota. |  |
| Suora tuotantopolku | `/aloitus/`, `/aloitus/api/v1` ja resurssit on testattu ilman alidomainiin siirtymistä. |  |
| Sama ehdokas | Tuotantoon vietävä commit, versio, skeema ja paketti vastaavat testattua ehdokasta. |  |
| Palautusvalmius | Varmistukset, käyttöoikeudet, omistajat ja pysäytysehto on vahvistettu. |  |

- **Päätös:** GO / NO-GO
- **Hyväksyjä:** täytetään
- **Päivämäärä ja kellonaika:** täytetään
- **Hyväksytyt P2/P3-poikkeamat:** täytetään tai `ei ole`
- **REL-12:lle luovutettu commit/build:** täytetään
- **Tuotannon muutosikkuna:** täytetään
- **Ensimmäinen smoke-tarkistus:** täytetään
- **Palautuksen käynnistäjä:** täytetään
