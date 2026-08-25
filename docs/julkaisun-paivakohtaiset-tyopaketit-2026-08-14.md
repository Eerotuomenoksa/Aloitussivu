# Julkaisua edeltävät päiväkohtaiset työpaketit 14.8.–3.9.2026

Tämä on julkaisun ensisijainen toteutusjärjestys. Tavoitejulkaisu on tiistai 1.9.2026 ja ehdoton takaraja torstai 3.9.2026. Palvelun virallinen nimi on `Seniorin aloitussivu`. Käyttäjän lopullinen tuotanto-osoite ja selaimen osoitepalkissa säilyvä osoite on `https://seniorsurf.fi/aloitus/`. Aiempi suunnitelma ohjata osoite tuotannon alidomainiin kumottiin 25.8.2026.

## Aikataulusäännöt

- Töitä suunnitellaan vain maanantaista perjantaihin.
- Viikonlopuille 15.–16.8., 22.–23.8. ja 29.–30.8. ei ole työpaketteja, julkaisuja eikä odotettuja hyväksyntöjä.
- Oletuksena on yksi tekninen pääpaketti työpäivää kohden.
- Senioritestaus ja selosteiden sisällöllinen viimeistely kulkevat erillisinä rinnakkaispaketteina, koska niillä on eri omistajat eivätkä ne saa pysäyttää teknistä toteutusta.
- Pakettia ei aloiteta ennen kuin sen riippuvuudet on merkitty hyväksytyiksi julkaisupäiväkirjaan.
- Paketti valmistuu vasta, kun toteutus, testit, dokumentointi ja seuraavalle paketille annettava luovutusmerkintä ovat valmiit.
- Salaisuuksia, tietokantatunnuksia, Firebase-avaimia, henkilötietoja tai yksityisiä palautteita ei kirjata Git-repositorioon tai julkaisupäiväkirjaan.

## WordPress-sivuston suojaaminen

`seniorsurf.fi`-pääsivusto toimii WordPressillä. Aloitussivun toteutus ei saa muuttaa WordPressin tiedostoja, tietokantaa, lisäosia, teemaa, ylläpitotunnuksia tai normaalia reititystä ilman Fakiirimedian etukäteen hyväksymää, varmistettua ja palautettavaa muutosta.

Pakolliset eristysperiaatteet:

1. Staging käyttää WordPressistä erillistä Cloudcity-alidomainia. Tuotannossa vain julkinen frontend ja API-entrypoint sijoitetaan WordPressin rinnalle fyysiseen `/website.wp33403/aloitus/`-hakemistoon; sovelluskoodi, asetukset, lokit ja liitteet säilyvät erillisessä julkisen web-juuren ulkopuolisessa `/aloitus-production/`-hakemistossa.
2. Aloitussivulla on oma MariaDB-tietokanta ja oma vähimmän oikeuden tietokantakäyttäjä. Käyttäjällä ei ole oikeuksia WordPressin tietokantaan.
3. Aloitussivun API, riippuvuudet, asetukset, lokit ja liitetiedostot pidetään erillään WordPressistä. Salaisuudet eivät ole kummankaan sivuston julkisessa web-juuressa.
4. WordPressin pääjuuren `.htaccess`-tiedostoa ei muuteta Aloitussivua varten. Fyysisen `/aloitus/`-hakemiston pitää ohittaa WordPressin normaali reititys. Redirection-lisäosaa voidaan käyttää vasta julkaisun jälkeen erikseen hyväksyttyihin kirjoitusvirheosoitteisiin, mutta ei kanoniseen `/aloitus/`-polkuun.
5. Aloitussivun `/aloitus/api/`-vastauksia ei saa välimuistittaa. Aloitussivun hashatut staattiset resurssit voidaan välimuistittaa pitkään, mutta HTML lyhyesti. Aloitussivun oman alihakemiston `.htaccess`-otsakkeet eivät saa muuttaa muun WordPress-sivuston välimuistia.
6. Ennen jokaista staging- tai tuotantomuutosta kirjataan WordPressin vertailusavukoe: etusivu, `wp-admin`-kirjautumissivu, vähintään kolme sovittua sisältösivua, yksi mediatiedosto ja yksi keskeinen lomake tai muu dynaaminen toiminto.
7. Sama WordPress-savukoe toistetaan muutoksen jälkeen. Statuskoodien, sisällön, kirjautumisen, lomakkeen ja keskeisten otsakkeiden pitää säilyä ennallaan.
8. Cloudcityn normaali varmistus kattaa kaiken `Website`-kansion alla olevan sisällön sekä tietokannat. Tietokannat voidaan palauttaa varmistuksesta myös itse käsin. Varmistuksen palautuspiste tarkistetaan ennen tuotantoon vientiä.
9. Palautusohje erottaa Aloitussivun poistamisen tai palauttamisen WordPressin palauttamisesta. Aloitussivun palautus ei saa edellyttää WordPressin tietokannan palauttamista.
10. Tuotantomuutos tehdään vain Fakiirimedian kanssa sovitussa arkipäivän muutosikkunassa.

## Omistajaroolit

| Rooli | Vastuu |
| --- | --- |
| SeniorSurf-tuotevastuu | rajaus, P1/P2-päätökset, selosteiden yhteystiedot ja julkaise/älä julkaise -päätös |
| Kehitys | frontend, API, skeema, migraatio, automaatiot, testit ja tekninen dokumentaatio |
| Fakiirimedia | WordPress- ja Cloudcity-ympäristön tuntemus, hakemistot, varmistukset, reititys, välimuisti ja tuotannon muutosikkuna |
| Tietosuoja- ja saavutettavuusvastuu | selosteiden sisältö, yhteystiedot ja hyväksyntä |
| Senioritestausvastuu | testaajien rekrytointi, testitilanteet ja havaintojen anonymisoitu koonti |
| Julkaisija | hyväksytyn buildin ja migraation tuotantoon vienti sekä palautuspäätös |

## Riippuvuuksien pääketju

```text
REL-00 yhteydenotto ja lukitus
  -> REL-01 WordPress/Cloudcity-eristys
    -> REL-02 MariaDB-skeema
      -> REL-03 API-perusta
        -> REL-04 julkiset tietovirrat
          -> REL-05 ylläpito ja tunnistus
            -> REL-06 frontend-provider
              -> REL-07 eristetty staging
                -> REL-08 Firestore-migraatio
                  -> REL-09 tausta-ajot ja palautuskoe
                    -> REL-10 julkaisukandidaatti
                      -> REL-11 julkaisuportti
                        -> REL-12 tuotantojulkaisu
                          -> REL-13/14 varapäivät
```

Rinnakkaispaketit `TEST-P2` ja `CONTENT-P1` syöttävät tuloksensa `REL-10`:lle. Niiden teknisiä muutoksia ei yhdistetä julkaisukandidaattiin ilman normaalia tarkistusta.

## Päiväkohtainen yhteenveto

| Päivä | Paketti | Prioriteetti | Päätulos |
| --- | --- | --- | --- |
| pe 14.8. | REL-00 | P1 | jono lukittu, omistajat nimetty ja sähköposti Fakiirimedialle lähetetty |
| ma 17.8. | REL-01 | P1 | WordPress- ja Cloudcity-eristys hyväksytty, varmistus- ja palautusmalli sovittu |
| ti 18.8. | REL-02 | P1 | MariaDB-skeema ja migraatiorunko valmiina |
| ke 19.8. | REL-03 | P1 | PHP-API:n turvallinen perusta ja health-tarkistus valmiina |
| to 20.8. | REL-04 | P1 | julkiset luku- ja kirjoitusreitit valmiina |
| pe 21.8. | REL-05 | P1 | ylläpidon tunnistus, roolit ja ylläpitoreitit valmiina |
| ma 24.8. | REL-06 | P1 | frontend käyttää provider-rajapintaa ja Cloudcity-API:a |
| ti 25.8. | REL-07 | P1 | eristetty Cloudcity-staging ja palvelinasetukset hyväksytty |
| ke 26.8. | REL-08 | P1 | Firestore-vienti ja MariaDB-tuonti kuivaharjoiteltu ja täsmäytetty |
| to 27.8. | REL-09 | P1 | tausta-ajot, liitteet, varmistus ja palautuskoe hyväksytty |
| pe 28.8. | REL-10 | P1 | sisältöjäädytetty julkaisukandidaatti stagingissä ja lanseeraustekstin luonnos valmis |
| ma 31.8. | REL-11 | P1 | käyttöliittymä-, WordPress-, linkki- ja integraatioportti läpäisty; go/no-go kirjattu |
| ti 1.9. | REL-12 | P1 | tavoitejulkaisu, tuotannon smoke-testit ja viestintä valmiina |
| ke 2.9. | REL-13 | P1-varapäivä | vain havaittujen P1-esteiden korjaus ja vaikutusalueen uusintatesti |
| to 3.9. | REL-14 | P1-takaraja | julkaisu tai kirjallinen älä julkaise -päätös |

## REL-00 – Julkaisulukitus ja yhteydenotto

**Ajankohta:** perjantai 14.8.  
**Omistaja:** SeniorSurf-tuotevastuu  
**Riippuvuudet:** julkaisuosoite, sisältörajaus ja P1/P2-luokittelu päätetty.

Tehtävät:

1. Nimeä jokaiselle paketille vastuuhenkilö ja varahenkilö.
2. Vahvista, kenellä on Cloudcityn, WordPressin, Firebase-projektin ja DNS:n tarvittavat oikeudet. Kirjaa vain oikeuden haltija, ei tunnuksia.
3. Lähetä Fakiirimedia-sähköposti tiedoston `docs/fakiirimedia-sahkopostiluonnos-2026-08-14.md` pohjalta.
4. Pyydä vastaus ja tekninen yhteyshenkilö viimeistään maanantaina 17.8. klo 12.
5. Sovi arkipäiville staging- ja tuotantomuutosikkunat sekä kiireellisen palautuksen yhteydenottotapa.
6. Avaa `docs/julkaisupaivakirja-2026-09.md` ja kirjaa paketin tila.

Hyväksymisehdot:

- sähköposti on lähetetty nimetylle vastaanottajalle ja lähetysaika on kirjattu;
- vastuuroolit ja oikeuksien haltijat on nimetty;
- Fakiirimedian vastauksen puuttuminen on merkitty P1-riippuvuudeksi REL-01:lle;
- mitään tuotanto- tai WordPress-muutosta ei ole tehty.

Dokumentoitava näyttö:

- sähköpostin lähetysaika ja vastaanottajan rooli;
- omistajataulukko;
- sovitut muutosikkunat tai avoin vastauspyyntö;
- REL-01:lle annettu luovutusmerkintä.

## REL-01 – Cloudcity- ja WordPress-eristyksen varmennus

**Ajankohta:** maanantai 17.8.  
**Omistaja:** Fakiirimedia + tekninen ylläpito  
**Riippuvuudet:** REL-00 valmis ja Fakiirimedian tekninen yhteyshenkilö tavoitettu.

Tehtävät:

1. Selvitä WordPressin fyysinen web-juuri, alidomainien erillinen hakemistokohdistus, pääjuuren `.htaccess`, LiteSpeed-välimuisti ja mahdolliset tietoturvalisäosat.
2. Valitse erillinen, ei-julkinen tai pääsyrajattu staging-osoite ja erillinen staging-hakemisto.
3. Varmista PHP-versio, PDO MySQL, JSON, OpenSSL, cURL, Composer tai riippuvuuksien toimitustapa, cron, SSH/SFTP ja lokien sijainti.
4. Luo suunnitelma erillisille staging- ja tuotantotietokannoille sekä vähimmän oikeuden käyttäjille.
5. Varmista, että Cloudcityn normaali varmistus kattaa koko `Website`-kansion ja tietokannat, tietokanta voidaan palauttaa itse käsin ja laajan tiedostopalautuksen vaikutusalue tunnetaan.
6. Valitse WordPress-savukokeen vertailu-URL:t ja kirjaa niiden lähtötila.
7. Piirrä hakemisto-, reititys-, tietokanta- ja varmistusrajaus julkaisupäiväkirjaan.

Hyväksymisehdot:

- Fakiirimedia hyväksyy, ettei Aloitussivu käytä WordPressin tietokantaa tai sovelluskoodia;
- staging voidaan toteuttaa ilman tuotanto-WordPressin muutosta;
- varmistuksesta palauttamisen vastuuhenkilö ja arvioitu palautusaika tunnetaan;
- kaikki REL-02:n tarvitsemat tekniset ominaisuudet on vahvistettu;
- avoin WordPress-riski pysäyttää paketin ja kirjataan P1-esteeksi.

Dokumentoitava näyttö:

- ympäristömatriisi ilman salaisuuksia;
- hakemisto- ja tietokantaeristys;
- WordPress-savukokeen lähtötulos;
- varmistuksen ajankohta ja palautusvastuu;
- REL-02:n riippuvuuksien hyväksyntä.

## REL-02 – MariaDB-skeema ja migraatiorunko

**Ajankohta:** tiistai 18.8.  
**Omistaja:** kehitys  
**Riippuvuudet:** REL-01:n tietokanta-, PHP- ja hakemistotiedot hyväksytty.

Tehtävät:

1. Luo versionoidut SQL-migraatiot tauluille, indekseille, viiteavaimille ja `schema_migrations`-taululle.
2. Luo erilliset staging- ja tuotantotietokannat sekä kummallekin oma sovelluskäyttäjä vähimmillä tarvittavilla oikeuksilla. Sovelluskäyttäjille annetaan vain normaalikäytön tarvitsemat luku- ja kirjoitusoikeudet; skeemamigraatiot ajetaan erillisillä ylläpito-oikeuksilla.
3. Mallinna kaikki P1-tietoryhmät Cloudcity-suunnitelman mukaisesti.
4. Määritä aikaleimat UTC-muodossa, UUID-tunnisteet, URL-uniikkiudet ja poistojen käsittely.
5. Tee tyhjän tietokannan perustamis-, päivitys- ja palautustesti paikallisessa tai stagingiin rinnastettavassa ympäristössä.
6. Dokumentoi skeemaversio ja tietosuojan kannalta säilytettävät kentät.

Hyväksymisehdot:

- migraatiot voidaan ajaa alusta kahdesti hallitusti ilman kaksoisrakenteita;
- sovelluskäyttäjä ei näe WordPress-tietokantaa eikä voi luoda tarpeettomia oikeuksia;
- skeema kattaa kaikki migroitavat Firestore-kokoelmat;
- alasajon tai palautuksen vaikutus on dokumentoitu;
- REL-03 saa toimivan staging-yhteysmallin ilman tunnusten kirjaamista repoon.

Dokumentoitava näyttö:

- skeemakaavio tai taululuettelo;
- migraatiokomentojen tulos ilman tunnuksia;
- oikeusmatriisi;
- REL-03-luovutus.

## REL-03 – PHP-API:n perusta ja suojaus

**Ajankohta:** keskiviikko 19.8.  
**Omistaja:** kehitys  
**Riippuvuudet:** REL-02 hyväksytty.

Tehtävät:

1. Luo Aloitussivun oma PHP-bootstrap, reititin, konfiguraation lataus ja PDO-yhteys WordPressistä riippumattomaan hakemistoon.
2. Toteuta versionoitu `/api/v1/health`, yhdenmukaiset JSON-virheet, request ID ja palvelinloki ilman arkaluonteisia hyötykuormia.
3. Lisää pyyntökoon rajat, palvelinpuolen validointikehys, parametroidut SQL-kyselyt ja rate limit -perusta.
4. Rajaa CORS saman originiin. Varmista, ettei API lataa WordPressin bootstrappia tai käytä WordPressin evästeitä.
5. Lisää automaattiset tarkistukset health-, 404-, väärä HTTP-metodi-, tietokantavirhe- ja puuttuva konfiguraatio -tilanteille.
6. Dokumentoi paikallinen kehitys ilman tuotantotietokannan suoraa käyttöä.

Hyväksymisehdot:

- health-reitti toimii ja tietokantayhteyden tila näkyy paljastamatta tunnuksia;
- väärät reitit ja metodit palauttavat hallitun JSON-virheen;
- SQL-injektioyritys ei muuta kyselyn rakennetta;
- WordPressin tiedostoja tai tietokantaa ei käytetä;
- REL-04 voi lisätä reitit yhteisen validointi- ja virhekerroksen päälle.

Dokumentoitava näyttö:

- API-rakenteen kuvaus;
- testitulokset ja statuskoodit;
- lokituksen ja salaisuuksien sijaintiperiaate;
- REL-04-luovutus.

## REL-04 – Julkiset tietovirrat

**Ajankohta:** torstai 20.8.  
**Omistaja:** kehitys  
**Riippuvuudet:** REL-03 hyväksytty.

Tehtävät:

1. Toteuta hyväksyttyjen ja estettyjen linkkien sekä aktiivisten huijausvaroitusten luku-API:t.
2. Toteuta linkki-ilmoituksen, avoimen palautteen, testipalautteen ja karkean käyttötilaston kirjoitus-API:t.
3. Siirrä nykyisten Firestore-sääntöjen kenttä-, pituus-, enum-, URL- ja liiterajat palvelinpuolen validointiin.
4. Lisää honeypot, pyyntörajoitus, duplikaattien hallinta ja turvallinen virhevastaus.
5. Varmista, ettei käyttötilasto tallenna raakaa IP-osoitetta, käyttäjätunnistetta tai selaimen sormenjälkeä.
6. Tee sopimustestit onnistumisille, virheille, ylimittaisille syötteille ja nopealle toistolle.

Hyväksymisehdot:

- jokainen julkinen reitti täyttää dokumentoidun pyyntö- ja vastaussopimuksen;
- virheellinen data ei tallennu;
- julkinen käyttäjä ei pysty lukemaan palaute- tai ylläpitodatajoukkoja;
- WordPress-savukoe on muuttumaton, jos staging-palvelimelle on tehty reititysmuutoksia;
- REL-05 saa vakaan API-sopimuksen.

Dokumentoitava näyttö:

- API-sopimukset esimerkkipyyntöineen ilman henkilötietoja;
- sopimustestien koonti;
- tietosuojakenttien tarkistus;
- REL-05-luovutus.

## REL-05 – Ylläpidon tunnistus ja ylläpitoreitit

**Ajankohta:** perjantai 21.8.  
**Omistaja:** kehitys + SeniorSurf-tuotevastuu  
**Riippuvuudet:** REL-04 hyväksytty; ylläpitäjien Firebase UID:t ja vahvistetut sähköpostit saatavilla turvallisesti.

Tehtävät:

1. Toteuta Firebase ID-tokenin palvelinpuolen tarkistus ja `admin_users`-roolivarmistus.
2. Lisää ylläpidon luku- ja muutosreitit linkki-ilmoituksille, palautteille, testipalautteille, linkkilistoille, huijausvaroituksille, ajolokeille ja käyttötilastoille.
3. Lisää `audit_log` kaikkiin ylläpidon muutoksiin.
4. Testaa kirjautumaton, vanhentunut token, väärä käyttäjä, poistettu rooli ja hyväksytty ylläpitäjä.
5. Rajaa `seniorsurf.fi` Firebase Authenticationin sallittuihin domaineihin ja selainavain lopulliseen originiin vasta hyväksytyn ympäristösuunnitelman mukaan.
6. Koosta rinnakkaisen `TEST-P2`-paketin tulokset ja lukitse löydetyt P1/P2-havainnot.

Hyväksymisehdot:

- vain nimetty ylläpitäjä pääsee ylläpitoreitteihin;
- frontendissä näkyvä sähköposti tai localStorage-arvo ei anna oikeuksia;
- kaikki ylläpidon muutokset näkyvät auditointilokissa;
- Firebase on vain tunnistuspalvelu, ei uuden tuotantodatan ensisijainen tietovarasto;
- REL-06 saa dokumentoidut julkiset ja ylläpidon API-sopimukset.

Dokumentoitava näyttö:

- oikeustestien anonymisoitu koonti;
- admin-roolien hyväksyntä;
- lukittu P1/P2-havaintolista;
- REL-06-luovutus.

## REL-06 – Frontendin provider-siirtymä

**Ajankohta:** maanantai 24.8.  
**Omistaja:** kehitys  
**Riippuvuudet:** REL-04 ja REL-05 hyväksytty.

Tehtävät:

1. Luo `services/data`-rajapinta ja Cloudcity-, Firebase-palautus- sekä local-providerit.
2. Siirrä linkki-ilmoitukset, palautteet, testipalautteet, hyväksytyt ja estetyt linkit, huijausvaroitukset sekä käyttötilasto providerin taakse.
3. Korvaa Firestoren reaaliaikakuuntelut alkulatauksella, muutoksen jälkeisellä päivityksellä ja hallitulla ylläpidon kyselyvälillä.
4. Säilytä verkkovirheen paikallinen palautus niin, ettei käyttäjän lähetys katoa tai näytä onnistuneelta ilman tallennusta.
5. Lisää build-asetukset `cloudcity`, `firebase-rollback` ja paikalliseen kehitykseen ilman salaisuuksien bundlausta.
6. Aja yksikkö-, TypeScript-, build- ja keskeisten käyttöpolkujen testit.

Hyväksymisehdot:

- Cloudcity-build ei käytä Firestorea julkisten tai ylläpidon tietojen ensisijaisena lähteenä;
- provider voidaan vaihtaa yhdellä dokumentoidulla asetuksella;
- lomakkeiden onnistumis- ja virhetilat ovat käyttäjälle totuudenmukaisia;
- tuotantobuild menee läpi;
- REL-07 saa versionoidun, testatun buildin.

Dokumentoitava näyttö:

- provider-kartta ja ympäristöasetukset;
- build- ja testitulokset;
- tunnetut palautusrajoitukset;
- REL-07-luovutus.

## REL-07 – Eristetty Cloudcity-staging ja palvelinasetukset

**Ajankohta:** tiistai 25.8.  
**Omistaja:** Fakiirimedia + tekninen ylläpito + kehitys  
**Riippuvuudet:** REL-01 ja REL-06 hyväksytty; staging-muutosikkuna sovittu.

Tehtävät:

1. Ota WordPressin vertailusavukoe ja varmennus ennen staging-muutosta.
2. Vie build erilliseen staging-hakemistoon ja API erilliseen sovellushakemistoon.
3. Varmista staging-alidomainin juuripolku, monisivuiset HTML-osoitteet, saman originin `/api/v1/`-reitit ja 404-käsittely.
4. Määritä HTTPS, HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, kehystysrajaus, pakkaus ja välimuistit vain oikeaan laajuuteen.
5. Varmista Aloitussivun omilla HTTP-otsakkeilla, ettei API:a välimuistiteta. LiteSpeed Cache vaikuttaa vain WordPress-asennukseen, joten erillistä WordPressin LiteSpeed-poikkeusta ei tarvita. Varmista, ettei Aloitussivun CSP tai `.htaccess` muuta WordPressin otsakkeita.
6. Jos pääjuuren reititysmuutos on välttämätön, Fakiirimedia ottaa varmistuksen, hyväksyy tarkan diffin ja testaa palautuksen.
7. Toista WordPress-savukoe ja vertaa lähtötilaan.

Hyväksymisehdot:

- staging toimii tuotannon alidomainia vastaavasti osoitteessa `https://staging.aloitussivu.seniorsurf.fi/`;
- WordPressin savukokeessa ei ole eroa;
- Aloitussivun API-vastauksia ei välimuistiteta;
- suojausotsikot, 404, pakkaus ja staattisten resurssien välimuistit on todistettu;
- REL-08 saa vakaan stagingin ja erillisen staging-tietokannan.

Dokumentoitava näyttö:

- staging-URL ja build-tunniste;
- ennen/jälkeen WordPress-savukoe;
- otsake-, 404-, pakkaus- ja välimuistitarkistus;
- tehdyt palvelinasetusdiffit ilman salaisuuksia;
- REL-08-luovutus.

## REL-08 – Firestore-vienti ja MariaDB-tuontiharjoitus

**Ajankohta:** keskiviikko 26.8.  
**Omistaja:** kehitys + tietosuojavastuu  
**Riippuvuudet:** REL-02, REL-06 ja REL-07 hyväksytty.

Tehtävät:

1. Tee Firestore-vientityökalu, kenttämuunnokset ja idempotentti MariaDB-tuonti.
2. Pidä Admin SDK -avain repositorion, lokien ja synkronoitujen kansioiden ulkopuolella.
3. Vie kaikki P1-tietoryhmät, tuo ne stagingiin ja aja sama tuonti uudelleen duplikaattien varalta.
4. Täsmäytä kokoelma- ja taulurivimäärät, tunnisteet, aikavälit sekä vähintään viisi pistokoetta tietoryhmää kohden.
5. Tarkista liitteiden tiedostomuoto, koko, suojattu polku ja metatiedot.
6. Harjoittele delta-vienti ja kirjaa tuotantokatkon enimmäiskesto.

Hyväksymisehdot:

- kaikki julkaisuun kuuluvat tietueet täsmäävät tai poikkeamille on hyväksytty kirjallinen selitys;
- tuonnin uudelleenajo ei luo kaksoiskappaleita;
- yksityiset vastaukset tai liitteet eivät ole julkisesti avattavissa;
- tuotannon delta-vaihto on vaiheistettu kellonaikoineen;
- REL-09 saa täsmäytetyn staging-datan.

Dokumentoitava näyttö:

- rivimäärä- ja pistokoeraportti ilman henkilötietoja;
- poikkeamalista;
- delta-vaihdon käsikirjoitus;
- REL-09-luovutus.

## REL-09 – Tausta-ajot, varmistus ja palautuskoe

**Ajankohta:** torstai 27.8.  
**Omistaja:** kehitys + Fakiirimedia  
**Riippuvuudet:** REL-07 ja REL-08 hyväksytty.

Tehtävät:

1. Siirrä karkean käyttötilaston kirjoitus Cloudcity-API:in ja Kyberturvallisuuskeskuksen ajo Cloudcity-croniin.
2. Testaa ajon aikavyöhyke, lukitus, idempotenssi, virheloki ja ylläpidon ajolokin näkymä.
3. Ota staging-tietokannasta manuaalinen varmistus ja palauta se erilliseen tyhjään staging-tietokantaan.
4. Vertaa palautetun tietokannan rivimäärät ja sovelluksen keskeiset luku- ja kirjoituspolut.
5. Harjoittele Aloitussivun frontendin ja tietokannan palautus ilman WordPress-tietokannan palauttamista.
6. Vahvista `CONTENT-P1`-paketin selosteet ja yhteystiedot päivän loppuun mennessä.

Hyväksymisehdot:

- cron ei käynnisty päällekkäin eikä kirjoita duplikaatteja;
- palautettu tietokanta toimii ja täsmää varmistukseen;
- WordPressiä ei tarvitse palauttaa Aloitussivun palautuksessa;
- tietosuoja- ja saavutettavuusselosteet on hyväksytty;
- REL-10 saa palautuskelpoisen teknisen kokonaisuuden ja julkaisuvalmiit selosteet.

Dokumentoitava näyttö:

- cron- ja ajolokiraportti;
- varmistuksen ja palautuksen ajankohdat, kesto ja täsmäytys;
- erillisen palautuksen käsikirjoitus;
- selosteiden hyväksyjä ja päivämäärä;
- REL-10-luovutus.

## REL-10 – Sisältöjäädytys ja julkaisukandidaatti

**Ajankohta:** perjantai 28.8.  
**Omistaja:** kehitys + SeniorSurf-tuotevastuu  
**Riippuvuudet:** REL-09, TEST-P2 ja CONTENT-P1 valmiit; kaikki hyväksytyt P2-korjaukset yhdistetty.

Tehtävät:

1. Piilota beta-merkintä sekä Muutosloki-, Ylläpito-, testi- ja kehitysjonolinkit julkisesta navigaatiosta.
2. Varmista, että nimipäivät ja AI eivät näy tai lataudu ja että paikallisuutiset ovat oletuksena piilossa mutta asetuksista avattavissa.
3. Tarkista canonical, Open Graph, sitemap, robots, nimi, osoite, tietosuoja- ja saavutettavuuslinkit.
4. Aja keskeisten palvelulinkkien raportti ja korjaa vain hyväksytyt P1/P2-havainnot.
5. Hyväksy WordPressin `/aloitussivu-palvelu/`-esittelysivun sisältö sekä suora `/aloitus/`-tuotantorakenne. Varmista, että frontend käyttää `/aloitus/api/v1`-osoitetta, yksityiset palvelintiedostot pysyvät web-juuren ulkopuolella eikä kanoniseen polkuun tehdä Redirection-sääntöä.
6. Rakenna yksilöity julkaisukandidaatti `main`-haarasta ja vie sama build stagingiin.
7. Jäädytä sisältö. Tämän jälkeen hyväksytään vain P1-korjauksia.

Hyväksymisehdot:

- julkaisuun kuulumattomat toiminnot ja sisäiset navigaatiolinkit eivät näy;
- selosteet ja metatiedot käyttävät lopullista osoitetta;
- WordPressin esittelysivu ja suora `/aloitus/`-rakenne on hyväksytty, osoitepalkki säilyy päätetyssä osoitteessa eikä yksityisiä palvelintiedostoja sijoiteta web-juureen;
- julkaisukandidaatilla on yksilöity commit- ja build-tunniste;
- stagingissä on täsmälleen julkaistavaksi tarkoitettu build;
- REL-11 saa muuttumattoman testikohteen.

Dokumentoitava näyttö:

- commit- ja build-tunniste;
- sisältöjäädytyksen päätös;
- linkkiraportti ja hyväksytyt poikkeamat;
- näkyvyys- ja metatietotarkistus;
- REL-11-luovutus.

## REL-11 – Täysi julkaisuportti ja go/no-go

**Ajankohta:** maanantai 31.8.  
**Omistaja:** testaajat + kehitys + SeniorSurf-tuotevastuu + Fakiirimedia  
**Riippuvuudet:** REL-10 valmis; julkaisukandidaatti ei ole muuttunut.

Tehtävät:

1. Testaa 320, 375, 768 ja 1280 pikselin leveydet sekä tekstikoot 100, 150 ja 200 prosenttia.
2. Testaa näppäimistöpolku, näkyvä fokus, ruudunlukijan perusrakenne, kaikki neljä teemaa ja tärkeimmät modaalit.
3. Testaa Google-haku, linkkihaku, Lähelläsi, kuntien seniorilinkit, paikallisuutiset, huijausvaroitukset ja keskeiset palvelulinkit.
4. Testaa linkki-ilmoitus, avoin palaute, testipalaute, käyttötilasto, ylläpitäjän kirjautuminen, ylläpidon muutokset ja auditointiloki.
5. Testaa luvaton ylläpitokäyttö, ylimittainen syöte, liitteen suojaus, 404, verkkovirhe ja palautusproviderin hallittu toiminta.
6. Toista WordPress-savukoe ja vertaa REL-01:n lähtötilaan.
7. Testaa suora `/aloitus/`-polku loppukauttaviivalla ja ilman sitä, varmista ettei osoite vaihdu alidomainiin, tarkista `/aloitus/api/v1`-reitit sekä resurssit ja varmista ettei WordPress kaappaa Aloitussivun reittejä.
8. Testaa `/aloitussivu-palvelu/`-esittelysivun sisältö, saavutettavuus, mobiilinäkymä ja linkki `/aloitus/`-osoitteeseen.
9. Ota viimeinen staging-varmistus, tee lopullisen delta-tuonnin kuivaharjoitus ja vahvista tuotannon muutosikkuna Fakiirimedian kanssa.
10. Kirjaa julkaise/älä julkaise -päätös ja kaikki hyväksytyt P2/P3-poikkeamat.

Hyväksymisehdot:

- kaikki P1-testit on suoritettu ja avoimia P1-havaintoja ei ole;
- WordPressin toiminnassa ei ole regressiota;
- WordPressin esittelysivu toimii ja suora `/aloitus/`-polku säilyy osoitepalkissa ilman ulkoista ohjausta;
- sama build ja migraatioversio voidaan viedä tuotantoon;
- tuotannon varmistus-, vaihto-, smoke- ja palautusvastuut on nimetty;
- REL-12 saa kirjallisen julkaisuluvan.

Dokumentoitava näyttö:

- testimatriisi ja tulokset;
- WordPress-savukoe;
- tietovirtojen ja oikeuksien testit;
- go/no-go-päätös, hyväksyjä ja kellonaika;
- REL-12-luovutus.

## REL-12 – Tavoitejulkaisu ja tuotannon smoke-testit

**Ajankohta:** tiistai 1.9.  
**Omistaja:** julkaisija + Fakiirimedia + SeniorSurf-viestintä  
**Riippuvuudet:** REL-11:n kirjallinen julkaisulupa.

Tehtävät:

1. Varmista ennen muutosta tuore Cloudcity-palautuspiste, joka kattaa koko `Website`-kansion sekä WordPressin ja Aloitussivun tuotantotietokannat. Varmista samalla tietokantojen käsin palauttamisen käyttöoikeus.
2. Kirjaa WordPress-savukokeen tuotannon lähtötila.
3. Vie hyväksytty build, API, skeemamigraatio ja lopullinen Firestore-delta suunnitellussa järjestyksessä.
4. Testaa Aloitussivun etusivu, metatiedot, sitemap, robots, mobiili, työpöytä, haut, paikallissisällöt, lomakkeet, huijausvaroitukset, käyttötilasto ja ylläpito.
5. Aktivoi hyväksytty suora `/aloitus/`-hakemisto, testaa etusivu ja `/aloitus/api/v1/health` ilman ulkoista ohjausta sekä varmista `/aloitussivu-palvelu/`-esittelysivu.
6. Toista WordPress-savukoe välittömästi julkaisun jälkeen.
7. Jos P1-virhe tai WordPress-regressio löytyy, pysäytä kirjoitukset ja käynnistä dokumentoitu palautus.
8. Lähetä sovittu julkaisuviesti vasta smoke-testien jälkeen ja käynnistä päivittäinen seuranta.

Hyväksymisehdot:

- tuotanto-osoite toimii ja kaikki P1-smoke-testit läpäisevät;
- WordPress toimii kuten ennen muutosta;
- tuotannon tietokanta ja API tallentavat sekä lukevat oikein;
- julkaisuviesti on lähetetty vasta hyväksynnän jälkeen;
- seurannan omistaja ja seuraava tarkistusaika on kirjattu.

Dokumentoitava näyttö:

- julkaistu commit-, build- ja skeemaversio;
- varmistusten ajankohdat;
- Aloitussivun ja WordPressin smoke-testit;
- julkaisu- tai palautuspäätös;
- ensimmäisen seurantatarkistuksen aika.

## REL-13 – P1-varapäivä

**Ajankohta:** keskiviikko 2.9.  
**Omistaja:** kehitys + vaikutusalueen testaaja  
**Riippuvuudet:** vain REL-12:ssa tai seurannassa havaittu P1-este.

Tehtävät:

1. Korjaa vain dokumentoitu P1-este mahdollisimman pienellä muutoksella.
2. Testaa muutoksen vaikutusalue, koko P1-smoke sekä WordPress-savukoe.
3. Ota uusi build- ja tarvittaessa tietokantavarmistus ennen tuotantoon vientiä.
4. Päivitä julkaisu- tai palautuspäätös.

Hyväksymisehdot:

- P1-este on poistunut eikä uusi P1-regressio ole syntynyt;
- WordPress toimii muuttumattomana;
- mitään P2/P3-parannusta tai uutta ominaisuutta ei ole lisätty.

Jos P1-estettä ei ole, päivä käytetään vain seurantaan ja dokumentaation täydentämiseen.

## REL-14 – Ehdoton takaraja

**Ajankohta:** torstai 3.9.  
**Omistaja:** SeniorSurf-tuotevastuu + julkaisija  
**Riippuvuudet:** REL-12 tai REL-13.

Tehtävät:

1. Toista tuotannon P1-smoke ja WordPress-savukoe, jos julkaisu tehtiin 1.–2.9.
2. Jos julkaisu on vielä tekemättä ja kaikki portit täyttyvät, toteuta REL-12:n muuttumaton julkaisuohje.
3. Jos P1-este on avoinna, älä julkaise. Kirjaa este, vaikutus, omistaja, korjaussuunnitelma ja uusi päätöspäivä.
4. Sulje julkaisua edeltävä päiväkirja ja avaa ensimmäisen viikon seurantajakso.

Hyväksymisehdot:

- lopputila on yksiselitteisesti julkaistu tai kirjallisesti estetty;
- WordPressin tila on varmennettu;
- avoimilla havainnoilla on luokitus, omistaja ja jatkoaika.

## TEST-P2 – Uudet senioritestaukset

**Ajankohta:** maanantai–perjantai 17.–21.8.  
**Omistaja:** SeniorSurf-testausvastuu  
**Riippuvuudet:** testipalautelomake toimii; testiversion build-tunniste kirjattu.

Tehtävät:

1. Tavoittele viittä uutta senioritestausta, joista vähintään kaksi puhelimella ja kaksi tietokoneella.
2. Testaa yläosa, palveluiden löytyminen, Lähelläsi, senioripalvelulinkki ja asetuksista avattavat paikallisuutiset.
3. Kirjaa vastaukset anonyymisti ja erottele laite sekä avun käyttö ilman tarpeettomia henkilötietoja.
4. Luokittele havainnot saman päivän aikana P1-, P2- ja P3-tasoille.
5. Vie P1-havainnot heti kehitykselle ja lukitse P2-lista perjantaina 21.8.

Hyväksymisehdot:

- testejä on tehty mahdollisimman lähelle tavoitetta; pieni alitus ei yksin estä julkaisua;
- jokaisella havainnolla on laite, toistettavuus, prioriteetti ja omistaja;
- henkilötietoja ei ole kopioitu julkisiin asiakirjoihin;
- tulos on luovutettu REL-05:lle ja REL-10:lle.

## CONTENT-P1 – Tietosuoja, saavutettavuus ja julkaisusisältö

**Ajankohta:** maanantai–perjantai 17.–28.8., vain arkipäivinä  
**Omistaja:** tietosuoja- ja saavutettavuusvastuu + SeniorSurf-tuotevastuu  
**Riippuvuudet:** lopullinen osoite, rekisterinpitäjän tiedot, yhteystieto ja palautekanava.

Tehtävät:

1. Vahvista tietosuoja- ja saavutettavuusselosteiden vastuurooli, yhteystieto, organisaatioteksti ja palautekanava.
2. Päivitä tietovirtojen kuvaus Cloudcityn MariaDB- ja API-malliin sekä väliaikaiseen Firebase Authenticationiin.
3. Tarkista käyttötilaston, palautteiden, testipalautteiden ja kuvakaappausten käsittely sekä säilytys.
4. Tarkista canonical, Open Graph, sitemap, robots ja julkiset hyötylinkit lopulliselle osoitteelle.
5. Hyväksytä molemmat selosteet viimeistään torstaina 27.8.
6. Laadi tämän viikon aikana lanseeraustekstin luonnos: kerro lyhyesti, mikä Aloitussivu on, kenelle se on tarkoitettu, mitä hyötyä siitä on ja mistä palvelu avataan. Valmistele teksti hyväksyttäväksi perjantaina 28.8.; varsinainen julkaisuviesti lähetetään vasta REL-12:n smoke-testien jälkeen.

Hyväksymisehdot:

- molemmat selosteet ovat julkaisuvalmiita ja hyväksyjä on nimetty;
- teksti vastaa toteutettua tietomallia;
- sisäiset ylläpito- ja testilinkit eivät kuulu julkiseen navigaatioon;
- lanseeraustekstin luonnos on valmis ja vastuuhenkilö sen lopulliselle hyväksynnälle on nimetty;
- tulos on luovutettu REL-09:lle ja REL-10:lle.

## Jokaisen paketin pakollinen dokumentointi

Jokaisesta paketista lisätään `docs/julkaisupaivakirja-2026-09.md`-tiedostoon vähintään:

```text
Paketti ja päivämäärä:
Omistaja ja tarkistaja:
Riippuvuudet tarkistettu:
Muutokset ja päätökset:
Muokatut tiedostot / palvelinasetukset:
Suoritetut komennot ja testit:
Tulokset ja todisteiden sijainti:
WordPress-savukoe ennen/jälkeen, jos ympäristöön koskettiin:
Tietokanta- ja varmistusvaikutus:
Avoimet P1/P2/P3-havainnot:
Palautusohje tai viittaus siihen:
Seuraavalle paketille luovutettu:
Tila: valmis / estynyt
```

Paketin tarkistaja on eri henkilö tai rooli kuin toteuttaja aina, kun paketti muuttaa Cloudcityn tuotanto- tai staging-ympäristöä, tietokantaa, tunnistusta, WordPressin reititystä tai julkaisukandidaattia.
