# Julkaisun työpaketit 14.8.–3.9.2026

## Julkaisutavoite

- **Tavoitejulkaisu:** tiistai 1.9.2026.
- **Ehdoton takaraja:** torstai 3.9.2026.
- **Julkaisunimi:** `Seniorin aloitussivu`.
- **Julkaisuosoite:** `https://seniorsurf.fi/aloitus/` Cloudcityn webhotellissa.
- **Julkaisun laajuus:** rajattu ensimmäinen julkaisu ilman tekoälyavustajaa ja nimipäiviä. Paikallisuutiset säilytetään oletuksena piilotettuina ja käyttäjän asetuksista avattavina.

Tämä dokumentti määrittää julkaisuportin ylätason. Päiväkohtainen toteutusjärjestys, riippuvuudet, hyväksymisehdot, WordPress-eristys ja dokumentointivaatimukset ovat ensisijaisesti tiedostossa `docs/julkaisun-paivakohtaiset-tyopaketit-2026-08-14.md`. Toteutuksen tila kirjataan tiedostoon `docs/julkaisupaivakirja-2026-09.md`. Cloudcityn MariaDB, saman originin API ja julkaisuun kuuluvien Firestore-tietojen migraatio ovat P1-ehtoja.

## Prioriteetit

- **P1 – estävä:** tietoturva-, tietosuoja-, saavutettavuus- tai toimivuusvirhe, jonka vuoksi julkaisua ei voida tehdä.
- **P2 – korjattava ennen sisältöjäädytystä:** selvä käytettävyys- tai sisältövirhe, joka haittaa keskeistä käyttötapaa mutta ei estä teknistä julkaisua.
- **P3 – julkaisun jälkeen:** uusi ominaisuus, laaja integraatio tai parannus, jolle on toimiva kiertotapa.

Uusia ominaisuuksia ei oteta julkaisuun 17.8. jälkeen. Uusien testaajien havainnoista tehdään ennen julkaisua vain P1- ja perustellut P2-korjaukset.

## WP0 – Rajaus, työjonon lukitus ja Fakiirimedia-yhteydenotto 14.8.

**Omistaja:** kehitys ja SeniorSurf-tuotevastuu  
**Tavoite:** muodostaa yksi julkaisuun johtava jono ja poistaa ristiriitaiset tavoitteet.

Tehtävät:

1. Luokittele kaikki avoimet kohdat P1-, P2- ja P3-tasoille.
2. Nimeä jokaiselle julkaisuun jäävälle tehtävälle vastuurooli ja määräpäivä.
3. Vahvista ensimmäisen julkaisun sisältö: ei tekoälyavustajaa eikä nimipäiviä; paikallisuutiset säilytetään oletuksena piilotettuina.
4. Pidä beta-, Muutosloki- ja Ylläpito-linkit näkyvissä vain testauksen ajan; merkitse niiden piilotus WP4:n tehtäväksi.
5. Varmista, että Linkkiluettelo, Tietosuoja ja Saavutettavuusseloste säilyvät julkisina hyötylinkkeinä.
6. Lähetä Fakiirimedia-yhteydenotto ja sovi WordPress-eristys, varmistukset, tekninen yhteyshenkilö ja arkipäivien muutosikkunat.

Valmis, kun julkaisuun vaikuttavat avoimet tehtävät löytyvät `TODO_HUMAN.md`-tiedostosta eikä P3-työtä ole julkaisupolulla.

## WP1 – Lisätestaus ja sisältöpäätökset 17.–21.8.

**Lisätestauksen luokitus:** P2 – tehtävä ennen sisältöjäädytystä  
**Omistaja:** SeniorSurf-tiimi ja kehitys  
**Tavoite:** saada vielä käyttäjäpalautetta ennen sisältöjäädytystä.

Tehtävät:

1. Hanki vähintään viisi uutta senioritestausta: vähintään kaksi puhelimella ja kaksi tietokoneella.
2. Kirjaa havainnot saman päivän aikana ja korjaa P1-havainnot heti.
3. [x] Paikallisuutisten lopullinen rajaus päätettiin 14.8.: osuus säilytetään ensimmäisessä julkaisussa oletuksena piilotettuna ja asetuksista avattavana.
4. Tee kuntien seniorilinkeille ja tärkeimmille valtakunnallisille palveluille pistokoe.
5. Lukitse P2-korjauslista 21.8. päivän loppuun mennessä.

Valmis, kun testaus on toteutettu mahdollisimman lähelle tavoitemäärää, paikallisuutisista on kirjattu päätös ja jokainen P1/P2-havainto on korjattu tai aikataulutettu. Testaajien tavoitemäärän pieni alitus ei yksin estä julkaisua.

## WP2 – Cloudcity-staging, API ja tietokanta 17.–21.8. ja 24.–27.8.

**Cloudcity-stagingin luokitus:** P1 – julkaisun estävä  
**Cloudcityn palvelinasetusten luokitus:** P1 – julkaisun estävä  
**Omistaja:** tekninen ylläpito ja Cloudcity-yhteyshenkilö  
**Tavoite:** todistaa, että staattinen julkaisu, saman originin API ja Cloudcityn MariaDB toimivat lopullisessa alihakemistossa ilman ensisijaista Firestore-tietovarastoa.

WordPressin pääsivusto on P1-suojakohde: Aloitussivulla käytetään erillistä hakemistoa, tietokantaa ja käyttäjää, ympäristömuutokset hyväksytetään Fakiirimedialla ja ennen/jälkeen-savukoe sekä palautettava varmistus vaaditaan.

Tehtävät:

1. Vie tuotantobuild staging-polkuun, joka vastaa osoitetta `/aloitus/`, ja testaa suhteelliset resurssit, sivulinkit, suorat HTML-osoitteet ja 404-käsittely.
2. Luo Cloudcityn MariaDB, versionoidut skeemamigraatiot ja saman originin PHP-API suunnitelman `docs/cloudcity-tietokanta-p1-suunnitelma-2026-08-14.md` mukaisesti.
3. Lisää frontendin provider-rajapinta ja siirrä julkaisuun kuuluvat tietovirrat Cloudcity-API:in.
4. Vie Firestore-data, tuo se MariaDB:hen alkuperäisillä tunnisteilla ja täsmäytä rivimäärät sekä pistokokeet.
5. Säilytä Firebase Authentication väliaikaisesti ylläpitäjän tunnistuksessa, tarkista token ja rooli Cloudcityn API:ssa sekä rajaa tuotanto-originin Firebase-asetukset.
6. Siirrä käyttötilasto ja Kyberturvallisuuskeskuksen ajo palvelinpuolen API:in ja croniin.
7. Varmista HTTPS, suojausotsikot, syötevalidointi, pyyntörajoitus, salaisuuksien hallinta, pakkaus sekä HTML:n ja hashattujen resurssien välimuistit.
8. Testaa Cloudcityn tietokantavarmistuksen palautus ja dokumentoi myös frontendin ja datan hallittu hätäpalautus.

Valmis, kun staging avautuu lopullista polkua vastaavasta osoitteesta ilman puuttuvia resursseja, kaikki julkaisuun kuuluvat tietovirrat käyttävät Cloudcity-API:a, migraatio on täsmäytetty ja tietokanta on palautettu onnistuneesti varmistuksesta.

## WP3 – Sisältö, selosteet ja korjausjäädytys 24.–27.8.

**Selosteiden viimeistelyn luokitus:** P1 – julkaisun estävä  
**Omistaja:** sisältövastuu, tietosuojavastuu ja kehitys  
**Tavoite:** saada julkaistava sisältö tarkistusvalmiiksi.

Tehtävät:

1. Lisää tietosuoja- ja saavutettavuusselosteisiin lopulliset vastuu- ja yhteystiedot.
2. Tarkista nimi, osoite, canonical, Open Graph, sitemap ja robots.
3. Laadi ja hyväksytä WordPressin julkinen `Seniorin aloitussivu – palvelun esittely` -sivu polkuun `/aloitussivu/`; lisää selkeä linkki sovelluksen osoitteeseen `/aloitus/` ja ota hyväksyntää varten tietokone- sekä puhelinkuvakaappaukset.
4. Valmistele sovelluksen fyysinen `/aloitus/`-hakemisto WordPressin rinnalle ilman WordPress-sivua, Redirection-sääntöä tai pääjuuren `.htaccess`-muutosta. Osoitepalkin pitää säilyä muodossa `https://seniorsurf.fi/aloitus/`.
5. Aja linkkiraportti ja korjaa keskeisten palveluiden rikkinäiset linkit.
6. Toteuta lukitut P2-korjaukset ja testaa ne uudelleen.
7. Jäädytä sisältö 27.8. päivän lopussa. Sen jälkeen hyväksytään vain P1-korjauksia.

Valmis, kun selosteet ja WordPressin esittelysivu ovat julkaistavissa, ohjaussääntö on hyväksytty, P1-virheitä ei ole ja sisältöjäädytys on kirjattu.

## WP4 – Julkaisukandidaatti ja julkaisuportti 28. ja 31.8.

**Käyttöliittymätestin luokitus:** P1 – julkaisun estävä  
**Linkki- ja integraatiotestin luokitus:** P1 – julkaisun estävä  
**Omistaja:** kehitys, testaajat ja julkaisupäätöksen tekijä  
**Tavoite:** muodostaa tuotantoon vietävä release candidate.

Tehtävät:

1. Rakenna julkaisukandidaatti `main`-haarasta ja vie se Cloudcity-stagingiin.
2. Piilota julkisesta versiosta beta-merkintä sekä Muutosloki-, Ylläpito-, testi- ja kehitysjonolinkit. Säilytä sivut tarvittaessa suorilla `noindex`-osoitteilla.
3. Varmista, että paikallisuutiset ovat oletuksena piilossa mutta avattavissa asetuksista ja etteivät tekoälyavustaja tai nimipäivät näy tai lataudu.
4. Testaa leveydet 320, 375, 768 ja 1280 pikseliä sekä tekstikoot 100–200 prosenttia.
5. Testaa näppäimistöpolku, ruudunlukijan perusrakenne, kaikki neljä väriteemaa ja tärkeimmät modaalit.
6. Testaa tärkeimmät linkit, linkki-ilmoitus, huijausvaroitukset, käyttötilasto ja suojattu ylläpito stagingissä.
7. Testaa sovelluksen `/aloitus/`-osoite ilman loppukauttaviivaa ja sen kanssa, varmista että osoite säilyy samalla domainilla ilman ketjua tai silmukkaa sekä tarkista kyselyparametrien säilyminen tarvittavissa reiteissä.
8. Testaa `/aloitussivu/`-esittelysivun sisältö, saavutettavuus, tietokone- ja mobiilinäkymä sekä linkki `/aloitus/`-sovellusosoitteeseen.
9. Tee julkaise/älä julkaise -päätös 31.8. päivän loppuun mennessä.

Valmis, kun julkaisuportti täyttyy ja sama build voidaan viedä tuotantoon ilman uusia sisältömuutoksia.

## WP5 – Tavoitejulkaisu 1.9.

**Tuotantotarkistuksen luokitus:** P1 – julkaisun estävä  
**Omistaja:** tekninen julkaisija ja SeniorSurf-viestintä  
**Tavoite:** julkaista osoitteessa `https://seniorsurf.fi/aloitus/`.

Tehtävät:

1. Vie hyväksytty build tuotantoon.
2. Tee tuotannon smoke-testi puhelimella ja tietokoneella.
3. Tarkista etusivu, hakutoiminnot, paikalliset palvelut, selosteet ja jakometatiedot.
4. Lähetä sovittu julkaisuviesti.
5. Käynnistä ensimmäisen viikon päivittäinen virhe- ja palauteseuranta.

## Varapäivät 2.–3.9.

- **2.9.** Korjataan vain tuotantoa estävät P1-virheet ja toistetaan julkaisuportin vaikutusalueen testit.
- **3.9.** Julkaistaan viimeistään. Jos P1-este on edelleen olemassa, siitä tehdään kirjallinen älä julkaise -päätös, nimetään omistaja ja sovitaan uusi päivämäärä erikseen.

Varapäivät eivät ole uusia ominaisuuksia tai tavallisia P2-parannuksia varten.

## Julkaisuportti

Julkaisu voidaan hyväksyä, kun kaikki seuraavat ehdot täyttyvät:

- avoimia P1-virheitä ei ole;
- P2-korjaukset on tehty tai niiden siirto julkaisun jälkeiseen jonoon on hyväksytty;
- lopullista osoitetta vastaava staging on testattu;
- tietosuoja- ja saavutettavuusselosteissa on vahvistetut yhteystiedot;
- mobiili-, työpöytä-, näppäimistö-, suurennus- ja teemakokeet ovat läpäisty;
- tärkeimmät linkit ja integraatiot toimivat;
- julkaisuun kuulumattomat toiminnot ja sisäiset linkit eivät näy julkisessa versiossa;
- palautus edelliseen toimivaan buildiin on mahdollista;
- julkaisupäätökselle ja ensimmäisen viikon seurannalle on nimetty vastuurooli.

## Julkaisun jälkeiseen jonoon siirretyt työt

- Firebase Authenticationin korvaaminen Cloudcityn omalla istunnolla tai muulla SSO-ratkaisulla, kun Cloudcityn tietokanta ja API ovat vakiintuneet;
- Firestore-palautusreitin poistaminen vähintään seitsemän päivän onnistuneen tuotantoseurannan jälkeen;
- ylläpidon sähköposti-ilmoitusten laajempi automaatio;
- uusi erillinen domain;
- tekoälyavustajan tai nimipäivien palauttaminen;
- uudet laajat sisältö- ja integraatiokokonaisuudet;
- P3-käytettävyys- ja ulkoasuparannukset.
