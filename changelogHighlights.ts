export type ChangelogHighlight = {
  date: string;
  title: string;
  summary: string;
  changes: string[];
  tags: string[];
};

export const AUGUST_2026_HIGHLIGHTS: ChangelogHighlight[] = [
  {
    date: '25.8.2026',
    title: 'Julkaisukandidaatin linkit tarkistettu',
    summary:
      'Koko linkkivalikoima tarkistettiin ennen sisältöjäädytystä ja keskeisten palveluiden vanhentuneet osoitteet korjattiin.',
    changes: [
      'Automaattinen raportti tarkisti 2 123 yksilöllistä linkkiä ja päivitti linkkiluettelon, ylläpitolokin, manuaalisen tarkistusjonon sekä julkaistavan estolistan.',
      'Vanhentuneita uudelleenohjauksia korvattiin suorilla nykyosoitteilla muun muassa Teuvan liikenteessä, Vapaaehtoistyö.fi-palvelussa, Kansallisarkistossa, Helmetissä, Oulun seudun liikenteessä, Kuluttajaliiton Huijausinfossa sekä useissa media- ja kulttuuripalveluissa.',
      'Kuluttajaneuvonnan kaksoislinkki poistettiin. Automaattisen tarkistimen bottisuoja- ja aikakatkaisupoikkeukset dokumentoitiin viikon mittaisina tarkistuspoikkeuksina, eikä keskeisiin palvelukategorioihin jäänyt piilotettuja linkkejä.',
    ],
    tags: ['Linkit', 'Julkaisu', 'Laadunvarmistus'],
  },
  {
    date: '25.8.2026',
    title: 'Seniorin aloitussivu ja lyhyempi julkaisuosoite',
    summary:
      'Palvelun nimi ja käyttäjille viestittävä osoite vahvistettiin ennen julkaisukandidaatin rakentamista.',
    changes: [
      'Palvelun viralliseksi nimeksi vahvistettiin Seniorin aloitussivu.',
      'Kanoniseksi ja käyttäjille viestittäväksi osoitteeksi vahvistettiin seniorsurf.fi/aloitus.',
      'Nimi päivitettiin käyttöliittymään, ohjeteksteihin, selosteisiin, manifestiin ja jakometatietoihin. Uusi osoite päivitettiin canonical-tietoihin, Open Graph -tietoihin, sitemap-tiedostoon ja robots-ohjeisiin.',
    ],
    tags: ['Julkaisu', 'Nimi', 'Metatiedot'],
  },
  {
    date: '14.8.2026',
    title: 'Julkaisunäkymän viimeistely',
    summary:
      'Ensimmäisen julkaisun sisältö rajattiin, yläosa viimeisteltiin ja testausaineistot päivitettiin vastaamaan julkaisutilannetta.',
    changes: [
      'Julkaisun rajaus ja työpaketit lukittiin: tavoitejulkaisu on 1.9.2026 ja ehdoton takaraja 3.9.2026. Julkaisu tehdään Cloudcityn webhotellissa osoitteeseen seniorsurf.fi/aloitus ilman erillistä domainia.',
      'Cloudcityn MariaDB, saman originin palvelin-API ja julkaisuun kuuluvien Firestore-tietojen migraatio nostettiin P1-julkaisuehdoksi. Suunnitelma kattaa tietomallin, API-reitit, ylläpidon tunnistuksen, migraation, varmistuksesta palautuksen, hätäpalautuksen ja arkipäivien toteutusaikataulun 17.–31.8.',
      'Julkaisua edeltävä työ jaettiin päiväkohtaisiin arkipäivien paketteihin 14.8.–3.9. Jokaisella paketilla on omistaja, riippuvuudet, hyväksymisehdot, dokumentointivaatimus ja luovutus seuraavalle paketille. Fakiirimedialle valmisteltiin yhteydenotto WordPress-eristyksen, Cloudcity-oikeuksien, varmistusten, reitityksen, välimuistin ja muutosikkunoiden sopimiseksi.',
      'Nimipäivät ja AI-avustaja poistettiin ensimmäisen julkaisun käyttöliittymästä. Paikallisuutiset päätettiin säilyttää ensimmäisessä julkaisussa oletuksena piilotettuina ja käyttäjän asetuksista avattavina.',
      'Yläosa suunniteltiin uudelleen: kello ja sää ovat rinnakkain vasemmalla ja Google-haku oikealla. Toinen kello sijoitettiin työpöytänäkymässä pääkellon viereen, ja sääkorttiin lisättiin nykyisen sään rinnalle huomisen säätila sekä alin ja ylin lämpötila. Molempien hakujen painike on nimeltään Hae ja sijaitsee ennen mikrofonia; palveluhaun painikkeesta poistettiin lisäksi suurennuslasikuvake. Työpöytänäkymän tyhjää pystysuuntaista tilaa tiivistettiin vaakaviivan, sisältörivin ja Mitä etsit tänään? -osion väliltä.',
      'Aihealueiden alalinkkiruudukkoa tiivistettiin responsiivisesti: neljä linkkiä mahtuu leveällä työpöytänäytöllä samalle riville, pienemmällä läppärillä ja vaakasuuntaisella tabletilla ruudukko mukautuu kahteen sarakkeeseen ja pystysuuntaisella tabletilla yhteen sarakkeeseen.',
      'Asetusten värimaailmavalintojen kuvakkeet muutettiin liukuväreistä teemojen todellisiksi pääväreiksi ja valinnat nimettiin väreittäin: Vihreä, Violetti, Sininen ja Ruskea.',
      'Julkaisua edeltävä testipalautelomake päivitettiin uuteen rajaukseen: arvioitavana ovat nyt uusi yläosa, Lähelläsi-osion kuntakohtaiset senioripalvelulinkit sekä paikallisuutisten hyödyllisyys ja toimivuus. AI- ja nimipäiväkysymykset poistettiin.',
      'Sivua tukemassa -kokeilusivu poistettiin. Testaus- ja kehitysjonolinkit poistettiin julkisesta navigaatiosta. Beta-merkintä sekä Linkkiluettelo-, Ylläpito- ja Muutosloki-linkit palautettiin toistaiseksi alatunnisteeseen. Tietoa-ikkunan vanhentunut AI-maininta poistettiin ja työpöytänäkymän sulkeminen korjattiin: otsakkeen ja alareunan sulkupainikkeet pysyvät näkyvissä sisällön vieriessä, ja ikkunan voi sulkea myös Esc-näppäimellä. Canonical-osoitteet, jakometatiedot, sitemap ja robots päivitettiin seniorsurf.fi/aloitus-polulle.',
    ],
    tags: ['Julkaisu', 'Yläosa', 'Testauspalaute', 'Saavutettavuus'],
  },
  {
    date: '13.8.2026',
    title: 'Testauspalautteen korjaukset ja kuntien senioripalvelut',
    summary:
      'Avoimen testauksen havainnot vietiin käyttöliittymään, aluepalveluihin ja ylläpidon aineistoihin.',
    changes: [
      'Palveluikkunoiden avaaminen ei enää piilota sivua tai siirrä lukukohtaa. Kohdistus, taustasivun lukitus ja vierityksen palautus toimivat hallitusti myös näppäimistöllä.',
      'Etusivun oletusnäkymää rauhoitettiin: alueuutiset ovat uusille käyttäjille oletuksena piilossa ja tyhjä suosikkialue jätetään näyttämättä.',
      'Kaikkien 308 kunnan virallisille sivuille tehtiin seniori- ja ikäihmissisältöjen syvätarkistus. Laajennettu haku käy läpi myös sivukartat, palveluosiot ja kuntien oman haun sekä erottaa koontisivut uutisista, tapahtumista, neuvostoista ja muista viitesivuista. Lähelläsi-osioon tuotiin 123 varmennettua kuntakohtaista senioripalvelulinkkiä, jotka näytetään vain valitun kunnan yhteydessä.',
      'Tilastokeskuksen vuoden 2025 ikärakenteella laskettuna näissä 123 kunnassa asuu 786 391 vähintään 65-vuotiasta. Se on 58,4 % koko Suomen 1 347 494 henkilön 65+ väestöstä.',
      'Senioripalvelut ja liikuntalinkit rajattiin valittuun kotikuntaan. Liikunnassa oman kunnan tarjontaa täydentävät valtakunnalliset harjoitteluohjeet ja tanssipalvelut.',
      'Palveluryhmiä selkeytettiin: asumisen ja kodinhoidon sisältö siirrettiin Raha-alueelle, yksityinen Kotihoito-palvelut-ryhmä poistettiin ja Tekniikkauutiset rajattiin kolmeen varsinaiseen mediaan.',
      'Lielahden ja Tesoman digitukijärjestys korjattiin siten, että Tampereen kaupunginkirjaston digituki näkyy ennen Mukanetti-yhdistystä. Linkkiluettelo, linkkien tarkistusdata ja ylläpitoloki päivitettiin vastaamaan muutoksia.',
    ],
    tags: ['Testauspalaute', 'Senioripalvelut', 'Saavutettavuus', 'Linkit'],
  },
  {
    date: '12.8.2026',
    title: 'Luettavuus, hakujen selkeys ja testauksen raportointi',
    summary:
      'Typografia ja hakutoiminnot yhdenmukaistettiin testauspalautteen perusteella, ja julkaisupäätöksen tueksi koottiin raportit.',
    changes: [
      'Sivuston kirjasimeksi yhtenäistettiin paikallisesti ladattava DM Sans. Liian raskaita lihavointeja, kirjainvälejä ja tavutusta vähennettiin erityisesti palvelukorteissa ja otsikoissa.',
      'Google-haku ja sivuston palveluhaku erotettiin täsmällisemmillä ohjeteksteillä kaikissa seitsemässä kieliversiossa. Hakukentän yläpuolinen tarpeeton ”Haku (Google-haku)” -otsikko poistettiin.',
      'Haun emoji-kuvakkeet korvattiin yhtenäisillä SVG-kuvakkeilla, ja hakukenttien, puhehaun, kellon sekä avustajan responsiivista asettelua tarkennettiin.',
      'Testauspalautteesta laadittiin korjaussuunnitelma, julkaisuvalmiuden tiimikoonti sekä VTKL-brändiä koskeva esitys.',
      'Muutoslokin automaattista luokittelua täydennettiin niin, että elokuun teema- ja palautekorjaukset näkyvät historiassa aiempaa kuvaavammin.',
    ],
    tags: ['Luettavuus', 'Haku', 'Monikielisyys', 'Raportointi'],
  },
  {
    date: '11.8.2026',
    title: 'Omien kiinnostusten mukainen etusivu',
    summary:
      'Käyttäjä voi valita itselleen tärkeät sisältöteemat esittelyssä ja asetuksissa.',
    changes: [
      'Uusi kiinnostusteemojen valitsin lisättiin esittelykierrokseen ja asetuksiin.',
      'Valinnat tallennetaan selaimeen, joten oma näkymä säilyy seuraavilla käyttökerroilla.',
      'Etusivun palveluryhmien järjestys ja sisältöalueiden navigointi mukautuvat valittuihin kiinnostuksiin.',
      'Neljän vastaajan testauspalaute koottiin erilliseksi esitykseksi, ja palautteille laadittiin julkaisusuunnitelma.',
    ],
    tags: ['Personointi', 'Asetukset', 'Testauspalaute'],
  },
  {
    date: '10.8.2026',
    title: 'Väriteemojen järjestelmällinen tarkistus',
    summary:
      'Käyttöliittymän värit sidottiin yhteisiin teemamuuttujiin, jotta kaikki teemat säilyvät luettavina ja yhtenäisinä.',
    changes: [
      'Yläpalkin, hakujen, kellon, suosikkien, palvelukorttien, sään ja tekstikoon säätimien kiinteät väriarvot korvattiin teemakohtaisilla arvoilla.',
      'Painikkeiden tekstit, reunukset, kohdistusrenkaat, varjot ja osoittimen alla näkyvät tilat mukautuvat nyt valittuun teemaan.',
      'Tumma teema ja korkean kontrastin tilanteet tarkistettiin yhtenäisen värijärjestelmän osaksi. Testauspalautteen ensimmäinen koontiesitys valmistui.',
    ],
    tags: ['Väriteemat', 'Kontrasti', 'Saavutettavuus'],
  },
];
