# P1-suunnitelma: Cloudcityn tietokanta ja API

Päivitetty 20.8.2026. Tavoitejulkaisu on 1.9.2026 ja ehdoton takaraja 3.9.2026.

## Päätös ja tavoite

Cloudcityn MariaDB-tietokanta, palvelinpuolen API ja nykyisen Firestore-datan siirto luokitellaan **P1 – julkaisun estäväksi**. Julkaisukandidaattia ei hyväksytä, ennen kuin etusivun ja ylläpidon tarvitsemat tietovirrat toimivat Cloudcity-stagingissä ja tietokannan palautus on kokeiltu.

Tavoitetila:

```text
React/Vite osoitteessa https://aloitussivu.seniorsurf.fi/
  -> saman originin PHP-API /api/v1/
    -> Cloudcityn MariaDB
```

Palvelun virallinen nimi on `Seniorin aloitussivu`. Staging käyttää vastaavaa rakennetta osoitteessa `https://staging.aloitussivu.seniorsurf.fi/`, ja sen API on `/api/v1/` samalla staging-originilla. Käyttäjille viestittävä WordPress-osoite `https://seniorsurf.fi/aloitus/` ohjataan myöhemmässä työpaketissa tuotannon alidomainiin.

Selain ei yhdistä MariaDB:hen suoraan. Tietokantatunnuksia ei lisätä Vite-muuttujiin, JavaScript-bundleen, GitHubiin tai julkisen web-juuren alle.

Päiväkohtainen toteutusjärjestys ja pakettien hyväksymisehdot ovat tiedostossa `docs/julkaisun-paivakohtaiset-tyopaketit-2026-08-14.md`.

## WordPress-eristys

`seniorsurf.fi`-pääsivusto toimii WordPressillä ja on P1-suojakohde. Aloitussivulla käytetään erillistä hakemistoa, tietokantaa, tietokantakäyttäjää, API-sovellusta, asetuksia, lokeja ja suojattua liitepolkua. Aloitussivun sovelluskäyttäjällä ei ole oikeuksia WordPressin tietokantaan.

Aloitussivun alidomainit käyttävät omia document root -hakemistojaan, joten WordPressin pääjuuren `.htaccess`-tiedostoa ei muuteta Aloitussivun sovellusta tai API:a varten. WordPressiin tehdään myöhemmin vain hyväksytty Redirection-ohjaus markkinointiosoitteesta tuotannon alidomainiin. Jokaisen staging- ja tuotantoympäristön muutoksen ennen ja jälkeen testataan WordPressin etusivu, ylläpitokirjautuminen, sovitut sisältösivut, mediatiedosto ja keskeinen dynaaminen toiminto. WordPressin regressio pysäyttää julkaisupaketin.

Cloudcityn normaali varmistus ottaa mukaan kaiken hallintapaneelin `Website`-kansion alla olevan sisällön sekä tietokannat. Varmistus ei siis rajaudu vain WordPress-asennukseen, vaikka WordPress ja Aloitussivu pidetään ajossa erillisissä hakemistoissa. Tietokannat voidaan palauttaa varmistuksesta myös itse käsin. Ennen tiedostojen palautusta tarkistetaan aina, mitä sivustohakemistoja palautus korvaa, jotta yhden sovelluksen palautus ei peruuta toisen sovelluksen uudempia tiedostoja.

LiteSpeed Cache vaikuttaa vain WordPress-asennukseen. Se ei välimuistita Aloitussivun alidomaineja tai `/api/v1/`-vastauksia, joten Aloitussivulle ei tarvita WordPressin LiteSpeed-poikkeussääntöä. Aloitussivun HTML:n, hashattujen resurssien ja API-vastausten välimuisti määritetään sen omissa palvelinasetuksissa ja HTTP-otsakkeissa.

## Julkaisulinjan rajaus

P1-julkaisuun kuuluvat:

- MariaDB-tietokanta ja versionoidut skeemamigraatiot;
- saman originin PHP-API julkisille ja ylläpidon tietovirroille;
- frontendin tietovarastorajapinta, jolla Firestore voidaan vaihtaa Cloudcity-API:in yhdestä asetuksesta;
- nykyisen Firestore-datan vienti, muunnos, tuonti ja täsmäytys;
- linkki-ilmoitukset, avoin palaute, testipalaute, hyväksytyt ja estetyt linkit, huijausvaroitukset, automaation lokit ja karkea käyttötilasto;
- ylläpitäjän tunnistus, roolit, kirjoitusten auditointi ja palvelinpuolen syötevalidointi;
- varmuuskopiointi, palautuskoe, valvonta ja dokumentoitu hätäpalautus.

Selaimen paikallistallennukseen jäävät suosikit, tekstikoko, väriteema, näkyvien osioiden valinnat, opastuksen tila ja valittu paikkakunta. Nimipäivien `adminStats`-historia arkistoidaan tarvittaessa, mutta poistettua nimipäivätoimintoa ei rakenneta Cloudcityyn.

## Nykyiset tietoryhmät ja tavoitetaulut

| Nykyinen Firestore-kokoelma | Käyttö | Cloudcityn tavoite |
| --- | --- | --- |
| `linkReports` | käyttäjien uudet, väärät ja rikkinäiset linkit | `link_reports` |
| `feedbackItems` | avoin palaute ja työjonon tila | `feedback_items` |
| `feedbackAttachments` | palautteen kuvakaappaukset | suojattu tiedostotila + `feedback_attachments`-metatiedot |
| `testFeedbackResponses` | julkaisua edeltävän testauksen vastaukset | `test_feedback_responses` |
| `approvedLinks` | ylläpidon hyväksymät lisälinkit | `approved_links` |
| `blockedLinks` | ajonaikaisesti piilotettavat linkit | `blocked_links` |
| `scamAlerts` | julkiset huijausvaroitukset | `scam_alerts` |
| `ncscScrapeLog` | Kyberturvallisuuskeskuksen automaation ajoloki | `ncsc_scrape_logs` |
| `usageStats` | päiväkohtainen karkea käyttötilasto | `usage_daily`, `usage_page_daily`, `usage_link_daily` |
| `adminStats` | poistuvien toimintojen ylläpitotilasto | arkisto, ei aktiivista P1-taulua |

Lisäksi luodaan:

- `admin_users`: Firebase UID, vahvistettu sähköposti, rooli ja aktiivisuus;
- `audit_log`: ylläpidon muutokset, tekijä, kohde ja aikaleima;
- `schema_migrations`: suoritetut skeemaversiot;
- `rate_limit_buckets`: lyhytikäinen väärinkäytön rajoitus ilman raakamuotoisen IP-osoitteen pysyvää tallennusta.

Kaikissa sisältötauluissa käytetään nykyisiä UUID-tunnisteita, UTC-aikaleimoja, `created_at`- ja `updated_at`-kenttiä sekä tarkoituksenmukaisia uniikki- ja hakuindeksejä. URL-osoitteet normalisoidaan ennen tallennusta.

## API-versio 1

Julkiset reitit:

```text
GET  /api/v1/health
GET  /api/v1/approved-links
GET  /api/v1/blocked-links
GET  /api/v1/scam-alerts
POST /api/v1/link-reports
POST /api/v1/feedback
POST /api/v1/test-feedback
POST /api/v1/usage-events
```

Ylläpidon reitit:

```text
GET    /api/v1/admin/me
GET    /api/v1/admin/link-reports
PATCH  /api/v1/admin/link-reports/{id}
GET    /api/v1/admin/feedback
PATCH  /api/v1/admin/feedback/{id}
GET    /api/v1/admin/feedback/{id}/attachment
GET    /api/v1/admin/test-feedback
GET    /api/v1/admin/approved-links
POST   /api/v1/admin/approved-links
DELETE /api/v1/admin/approved-links/{id}
GET    /api/v1/admin/blocked-links
POST   /api/v1/admin/blocked-links
DELETE /api/v1/admin/blocked-links/{id}
GET    /api/v1/admin/scam-alerts
POST   /api/v1/admin/scam-alerts
PATCH  /api/v1/admin/scam-alerts/{id}
GET    /api/v1/admin/ncsc-logs
POST   /api/v1/admin/ncsc-run              (REL-09: cron ja turvallinen käsiajo)
GET    /api/v1/admin/usage-stats
GET    /api/v1/admin/audit-log
```

API palauttaa yhdenmukaiset JSON-vastaukset ja virhekoodit. Julkiset listat käyttävät ETag- tai lyhyttä välimuistia. Firestoren reaaliaikaiset kuuntelut korvataan alkulatauksella, hallitulla päivityksellä muutoksen jälkeen ja tarvittaessa maltillisella kyselyvälillä ylläpitonäkymässä.

## Frontendin tietovarastorajapinta

Toteutettu rakenne:

```text
services/data/
  dataProvider.ts
  providerConfig.ts
  index.ts
  cloudcityApiDataProvider.ts
  firebaseDataProvider.ts
  localDataProvider.ts
```

`VITE_DATA_PROVIDER=cloudcity` valitsee julkaistavan toteutuksen ja `VITE_API_BASE=/api/v1` saman originin API:n sekä tuotannossa että stagingissä. Komponentit eivät tämän jälkeen tuo `firebase/firestore`-moduuleja suoraan.

Firebase-provider säilytetään lyhyen palautusjakson ajan, mutta sitä ei käytetä tuotannon ensisijaisena kirjoituskohteena. Local-provider säilyy kehitystä ja hallittua verkkovirheen välimuistia varten; selaimeen tallentunut palaute ei saa kadota, ja uudelleenlähetys tehdään käyttäjälle näkyvästi.

## Ylläpitäjän tunnistus

Ensimmäisen julkaisun vähäriskisin linja on säilyttää Firebase Authentication vain ylläpitäjän Google-tunnistuksessa. Cloudcityn API tarkistaa ID-tokenin palvelinpuolella ja hyväksyy vain `admin_users`-tauluun lisätyn UID:n, vahvistetun sähköpostin ja aktiivisen roolin.

Firebase Authenticationin staging- ja tuotantodomainit sekä selaimen Firebase API -avaimen vastaavat HTTP-referrer-rajaukset vahvistettiin tehdyiksi 21.8.2026. Firestore ei kuitenkaan ole tuotantodatan lähde. Cloudcityn omaan istuntoon tai muuhun SSO-ratkaisuun siirtyminen tehdään julkaisun jälkeen erillisenä muutoksena, ellei Firebase-riippuvuuden täydellistä poistamista päätetä erikseen ennen toteutusta.

## Tietoturvan vähimmäisehdot

- API hyväksyy vain HTTPS:n ja saman originin; yleistä `*`-CORS-sääntöä ei käytetä.
- HTTPS, 404-käsittely, suojausotsikot, HTML:n lyhyt välimuisti, hashattujen resurssien pitkä välimuisti ja gzip- tai Brotli-pakkaus ovat P1-julkaisuportteja.
- Kaikki SQL käyttää PDO:n parametrisidontaa ja vähimmän oikeuden tietokantakäyttäjää.
- Julkiset kirjoitukset validoidaan palvelimella vähintään nykyisten Firestore-rajojen tarkkuudella.
- Julkisissa lomakkeissa käytetään honeypotia, pyyntökoon rajaa ja pyyntörajoitusta.
- Ylläpidon kirjoitukset vaativat hyväksytyn tokenin, roolin ja CSRF-suojauksen, jos käytetään evästepohjaista istuntoa.
- Liitteet sallitaan vain tarkistetuissa kuvaformaateissa ja kokorajan sisällä. Ne tallennetaan julkisen web-juuren ulkopuolelle tai estetään suorilta URL-osoitteilta.
- Salaisuudet ovat Cloudcityn palvelinympäristössä tai julkisen web-juuren ulkopuolisessa käyttöoikeuksin rajatussa asetustiedostossa.
- Raakamuotoista IP-osoitetta, selaimen sormenjälkeä tai käyttäjätunnistetta ei tallenneta käyttötilastoon.
- Ylläpidon muutokset kirjataan `audit_log`-tauluun.

## Migraatio Firestoresta

1. Tee Firestoresta vain lukuun tarkoitettu JSON-vienti Admin SDK:lla. Service account -tiedosto pidetään repositorion ja synkronoitujen kansioiden ulkopuolella.
2. Ota ennen jokaista tuontia Cloudcityn manuaalinen tietokantavarmistus.
3. Muunna camelCase-kentät skeeman snake_case-kentiksi, Firestore-aikaleimat UTC-aikaleimoiksi ja sisäkkäiset käyttötilastot riveiksi.
4. Tuo data idempotentisti alkuperäisillä tunnisteilla. Sama tuonti voidaan ajaa uudelleen ilman kaksoiskappaleita.
5. Täsmäytä kokoelmien ja taulujen rivimäärät, puuttuvat tunnisteet, aikavälit ja vähintään viiden tietueen pistokoe joka tietoryhmästä.
6. Aja stagingissä kuormittamaton kuivaharjoitus ja dokumentoi kesto sekä mahdolliset poikkeamat.
7. Tee ennen tuotantovaihtoa viimeinen delta-vienti `createdAt`- ja `updatedAt`-aikojen perusteella, tuo se MariaDB:hen ja vaihda frontend Cloudcity-provideriin.
8. Jätä Firestore kirjoitussuojattuun palautustilaan vähintään seitsemäksi päiväksi. Poista se käytöstä vasta, kun Cloudcityn varmistus ja palautus on todistettu.

Migraatio ei sisällä nimipäivien poistuvaa käyttölaskuria eikä keskeneräisen Safe Browsing -suunnitelman `urlSafetyCache`-kokoelmaa.

## Hätäpalautus

Jos Cloudcityn P1-virhe havaitaan julkaisun jälkeen:

1. estä uudet Cloudcity-kirjoitukset huoltotilalla;
2. säilytä MariaDB ja ota siitä välitön varmuuskopio;
3. vie katkon jälkeen syntyneet uudet tietueet ja täsmäytä ne palautuskohteeseen;
4. julkaise edellinen varmennettu frontend-build vasta, kun kirjoitusten jakautuminen kahteen tietovarastoon on estetty;
5. testaa etusivu, palaute, linkki-ilmoitus, huijausvaroitukset ja ylläpito ennen kirjoitusten avaamista.

Palautus ei saa kadottaa käyttäjien lähettämiä palautteita tai linkki-ilmoituksia.

## Aikataulu

| Päivä | Tulos | Vastuu |
| --- | --- | --- |
| pe 14.8. | Fakiirimedia-yhteydenotto, omistajat ja arkipäivien muutosikkunat | tuotevastuu |
| ma 17.8. | WordPress-eristys, Cloudcity-oikeudet, hakemistot, varmistukset ja palautusvastuut vahvistettu | Fakiirimedia + tekninen ylläpito |
| ti 18.8. | MariaDB-skeema ja migraatiorunko valmiina | kehitys |
| ke 19.8. | PHP-API:n perusta, health-reitti ja suojaus valmiina | kehitys |
| to 20.8. | Julkiset luku- ja kirjoitusreitit valmiina | kehitys |
| pe 21.8. | Ylläpidon tunnistus, roolit, reitit ja auditointi valmiina | kehitys + tuotevastuu |
| ma 24.8. | Frontendin provider-rajapinta ja Cloudcity-adapteri valmiina | kehitys |
| ti 25.8. | Eristetty staging, palvelinasetukset ja WordPress-savukoe hyväksytty | Fakiirimedia + tekninen ylläpito + kehitys |
| ke 26.8. | Firestore-vienti ja MariaDB-tuonti kuivaharjoiteltu ja täsmäytetty | kehitys + tietosuojavastuu |
| to 27.8. | Käyttötilasto, NCSC-cron, tietokantavarmistus ja palautuskoe valmiina | kehitys + Fakiirimedia |
| pe 28.8. | Sisältöjäädytetty julkaisukandidaatti stagingissä | kehitys + tuotevastuu |
| ma 31.8. | P1-julkaisuportti ja julkaise/älä julkaise -päätös | testaajat + julkaisija + Fakiirimedia |
| 1.9. | Tavoitejulkaisu, P1-tason tuotannon smoke-testi ja päivittäinen seuranta | julkaisija + ylläpito |
| ke 2.9. | Varapäivä vain todetuille P1-korjauksille | kehitys |
| to 3.9. | Ehdoton takaraja: julkaisu tai kirjallinen älä julkaise -päätös | tuotevastuu + julkaisija |

Viikonlopuille 15.–16.8., 22.–23.8. ja 29.–30.8. ei ole työpaketteja tai ympäristömuutoksia.

## Hyväksymisehdot

Kaikkien kohtien pitää täyttyä ennen julkaisua:

- MariaDB:hen ei voi yhdistää selaimesta tai julkisilla tunnuksilla.
- Kaikki julkaisuun kuuluvat Firestore-tietoryhmät on tuotu ja täsmäytetty ilman puuttuvia tunnisteita.
- Julkiset listat sekä kaikki lomakkeiden lähetykset toimivat Cloudcity-API:n kautta.
- Ylläpitäjä voi kirjautua, lukea jonot ja tehdä sallitut muutokset; tavallinen käyttäjä ei pääse ylläpitoreitteihin.
- Liitteiden luvaton suora avaaminen, ylimittaiset syötteet, SQL-injektioyritykset ja puuttuva valtuutus torjutaan.
- Käyttötilasto ei tallenna henkilötietoa ja NCSC-cronista syntyy luettava ajoloki.
- Cloudcityn manuaalinen varmistus ja palautus on kokeiltu staging-tietokannalla.
- Edellinen toimiva build, migraatiovienti ja palautusohje ovat saatavilla.
- `npm run build` sekä P1-tason linkki- ja integraatiotestit menevät läpi Cloudcity-osoitteessa.
- Tunnettuja P1-virheitä ei ole.

## Ennen toteutusta varmennettavat Cloudcity-tiedot

- käytössä olevan paketin tietokantojen määrä ja MariaDB-versio;
- PHP-versio ja tarvittavat laajennukset, erityisesti PDO MySQL, JSON, OpenSSL ja cURL;
- Composerin käyttö tai riippuvuuksien toimitustapa;
- cron-ajojen saatavuus ja aikavyöhyke;
- palvelinpuolen asetustiedoston sijoitus julkisen web-juuren ulkopuolelle;
- liitetiedostojen suojattu tallennuspolku;
- lokien sijainti, kierto ja ylläpidon lukuoikeus;
- tietokannan manuaalisen varmistuksen ja palautuksen oikeudet.

## Lähteet

- [Cloudcityn webhotellien ominaisuudet ja MariaDB/MySQL](https://cloudcity.fi/webhotellit/hinnasto/)
- [Cloudcity Pro: PHP, MariaDB ja tietokantojen hallinta](https://cloudcity.fi/webhotellit/cloudcity-pro/)
- [Cloudcityn tietokannan manuaalinen varmuuskopiointi](https://tuki.cloudcity.fi/ohjeet/cloudcityn-hallintapaneeli/tiedostojen-ja-tietokannan-manuaalinen-varmuuskopiointi/)
- [Cloudcityn tietokannan palautus varmuuskopiosta](https://tuki.cloudcity.fi/ohjeet/cloudcityn-hallintapaneeli/sivuston-palautus-varmuuskopiosta/)
