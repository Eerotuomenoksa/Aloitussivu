export type ChangelogHighlight = {
  date: string;
  title: string;
  summary: string;
  changes: string[];
  tags: string[];
};

export const AUGUST_2026_HIGHLIGHTS: ChangelogHighlight[] = [
  {
    date: '13.8.2026',
    title: 'Testauspalautteen korjaukset ja kuntien senioripalvelut',
    summary:
      'Avoimen testauksen havainnot vietiin käyttöliittymään, aluepalveluihin ja ylläpidon aineistoihin.',
    changes: [
      'AI-avustaja avautuu nyt muun sisällön yläpuolelle. Tekstikoon A+ ja A− -säätimet piilotetaan avustajan käytön ajaksi, joten ne eivät peitä keskustelua.',
      'Palveluikkunoiden avaaminen ei enää piilota sivua tai siirrä lukukohtaa. Kohdistus, taustasivun lukitus ja vierityksen palautus toimivat hallitusti myös näppäimistöllä.',
      'Etusivun oletusnäkymää rauhoitettiin: alueuutiset, nimipäivät ja AI-avustaja ovat uusille käyttäjille oletuksena piilossa, nimipäiville lisättiin oma asetus ja tyhjä suosikkialue jätetään näyttämättä.',
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
