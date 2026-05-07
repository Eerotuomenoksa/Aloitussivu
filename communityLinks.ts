import type { Provider } from './types';

export interface RegionalProvider extends Provider {
  area?: string;
  municipality?: string;
  municipalities?: string[];
  specialty?: string;
  type?: string;
}

export const PATIENT_ASSOCIATION_LINKS: Provider[] = [
  {
    name: "22q11 Finland (ent. Catch-yhdistys)",
    url: "https://www.22q11finland.fi/"
  },
  {
    name: "AH-potilaat",
    url: "https://www.ah-potilaat.fi/"
  },
  {
    name: "Aivolisäke-potilasyhdistys Sella",
    url: "https://www.aivolisake.fi/"
  },
  {
    name: "ALS-tutkimuksen tuki",
    url: "https://www.als-tutkimus.fi/"
  },
  {
    name: "AMC",
    url: "https://www.amc.fi/"
  },
  {
    name: "Aniridia Finland",
    url: "https://www.aniridia.fi/"
  },
  {
    name: "Autistien ja Rett-henkilöiden Tuki ry",
    url: "https://www.autistienettutuki.fi/"
  },
  {
    name: "Cranio",
    url: "https://www.cranio.fi/"
  },
  {
    name: "Erityislasten Omaiset ELO",
    url: "https://www.elory.fi/"
  },
  {
    name: "Etelä-Suomen Alopecia- ja Vitiligoyhdistys",
    url: "https://www.alopecia.fi/"
  },
  {
    name: "Finnilco",
    url: "https://www.finnilco.fi/"
  },
  {
    name: "Frax",
    url: "https://www.frax.fi/"
  },
  {
    name: "FSHD-yhdistys",
    url: "https://www.fshd.fi/"
  },
  {
    name: "GNAO1 Tuki",
    url: "https://www.gnao1tuki.fi/"
  },
  {
    name: "HARSO",
    url: "https://www.harso.fi/"
  },
  {
    name: "Hengitystuki",
    url: "https://www.hengitystuki.fi/"
  },
  {
    name: "Ihoyhdistys",
    url: "https://www.ihoyhdistys.fi/"
  },
  {
    name: "Immuunipuutospotilaiden yhdistys Imppu",
    url: "https://www.imppu.fi/"
  },
  {
    name: "ITP Suomi",
    url: "https://www.itpsuomi.fi/"
  },
  {
    name: "Kalfos",
    url: "https://www.kalfos.fi/"
  },
  {
    name: "Karpatiat",
    url: "https://www.karpatiat.fi/"
  },
  {
    name: "Lupus Suomi",
    url: "https://www.lupussuomi.fi/"
  },
  {
    name: "Lyhytkasvuiset",
    url: "https://www.lyhytkasvuiset.fi/"
  },
  {
    name: "Marfan ja sen kaltaiset sairaudet ry",
    url: "https://www.marfanyhdistys.fi/"
  },
  {
    name: "MeHyvät",
    url: "https://www.mehyvat.fi/"
  },
  {
    name: "Mitokondrioyhdistys",
    url: "https://www.mitokondrioyhdistys.fi/"
  },
  {
    name: "OUKALI ry",
    url: "https://www.oukali.fi/"
  },
  {
    name: "Pohjois-Suomen Alopecia- ja Vitiligoyhdistys",
    url: "https://www.alopecia.fi/pohjois-suomi"
  },
  {
    name: "REDY",
    url: "https://www.redy.fi/"
  },
  {
    name: "Refluksilapset",
    url: "https://www.refluksilapset.fi/"
  },
  {
    name: "Retina",
    url: "https://www.retina.fi/"
  },
  {
    name: "SMA Finland",
    url: "https://www.smafinland.fi/"
  },
  {
    name: "SUHUPO",
    url: "https://www.suhupo.fi/"
  },
  {
    name: "Suomen Akustikusneurinoomayhdistys",
    url: "https://www.akustikusneurinooma.fi/"
  },
  {
    name: "Suomen albinismiyhdistys",
    url: "https://www.albinismi.fi/"
  },
  {
    name: "Suomen Amyloidoosiyhdistys",
    url: "https://www.amyloidoosi.fi/"
  },
  {
    name: "Suomen Angelman-yhdistys",
    url: "https://www.angelman.fi/"
  },
  {
    name: "Suomen CF-yhdistys",
    url: "https://www.cf-yhdistys.fi/"
  },
  {
    name: "Suomen Chiari- ja syringomyeliayhdistys",
    url: "https://www.chiari.fi/"
  },
  {
    name: "Suomen Dystoniayhdistys",
    url: "https://www.dystonia.fi/"
  },
  {
    name: "Suomen EB-yhdistys",
    url: "https://www.eb-yhdistys.fi/"
  },
  {
    name: "Suomen Ehlers-Danlos yhdistys (SEDY)",
    url: "https://www.sedy.fi/"
  },
  {
    name: "Suomen Fabry-yhdistys",
    url: "https://www.fabry.fi/"
  },
  {
    name: "Suomen fruktoosi-intolerantikot (HFI)",
    url: "https://www.hfi.fi/"
  },
  {
    name: "Suomen HAE-yhdistys",
    url: "https://www.hae.fi/"
  },
  {
    name: "Suomen Hemofiliayhdistys",
    url: "https://www.hemofilia.fi/"
  },
  {
    name: "Suomen HHT/Osler-yhdistys",
    url: "https://www.hhtosler.fi/"
  },
  {
    name: "Suomen Huntington-yhdistys",
    url: "https://www.huntington.fi/"
  },
  {
    name: "Suomen Iktyoosiyhdistys",
    url: "https://www.iktyoosi.fi/"
  },
  {
    name: "Suomen Kampurajalkayhdistys",
    url: "https://www.kampurajalkayhdistys.fi/"
  },
  {
    name: "Suomen lymfayhdistys",
    url: "https://www.lymfayhdistys.fi/"
  },
  {
    name: "Suomen Marfan-yhdistys",
    url: "https://www.marfanyhdistys.fi/"
  },
  {
    name: "Suomen MG-yhdistys",
    url: "https://www.mg-yhdistys.fi/"
  },
  {
    name: "Suomen Narkolepsiayhdistys",
    url: "https://www.narkolepsia.fi/"
  },
  {
    name: "Suomen NF-yhdistys",
    url: "https://www.nf-yhdistys.fi/"
  },
  {
    name: "Suomen Noonan-yhdistys",
    url: "https://www.noonan.fi/"
  },
  {
    name: "Suomen Osteogenesis Imperfecta –yhdistys",
    url: "https://www.oi-yhdistys.fi/"
  },
  {
    name: "Suomen Palovammayhdistys",
    url: "https://www.palovammayhdistys.fi/"
  },
  {
    name: "Suomen PAH-potilasyhdistys",
    url: "https://www.pah.fi/"
  },
  {
    name: "Suomen PANS/PANDAS",
    url: "https://www.panspandas.fi/"
  },
  {
    name: "Suomen Perthes",
    url: "https://www.perthes.fi/"
  },
  {
    name: "Suomen PWS-yhdistys",
    url: "https://www.pws.fi/"
  },
  {
    name: "Suomen Sklerodermayhdistys",
    url: "https://www.skleroderma.fi/"
  },
  {
    name: "Suomen Sotos-perheiden tukiyhdistys",
    url: "https://www.sotos.fi/"
  },
  {
    name: "Suomen Tourette- ja OCD -yhdistys",
    url: "https://www.tourette.fi/"
  },
  {
    name: "Suomen Tuberoosiskleroosiyhdistys",
    url: "https://www.tsc.fi/"
  },
  {
    name: "Suomen Turner-yhdistys",
    url: "https://www.turner.fi/"
  },
  {
    name: "Suomen Vaskuliittiyhdistys",
    url: "https://www.vaskuliitti.fi/"
  },
  {
    name: "Sydän- ja Keuhkosiirrokkaat (Syke)",
    url: "https://www.syke.fi/"
  },
  {
    name: "Sydänlapset ja -aikuiset",
    url: "https://www.sydanlapset.fi/"
  },
  {
    name: "Sylva",
    url: "https://www.sylva.fi/"
  },
  {
    name: "Valoihottumayhdistys",
    url: "https://www.valoihottuma.fi/"
  },
  {
    name: "Waldenström Finland ry",
    url: "https://www.waldenstrom.fi/"
  },
  {
    name: "Aivovammaliitto ry",
    url: "https://www.aivovammaliitto.fi/"
  },
  {
    name: "ADHD-liitto ry",
    url: "https://www.adhd-liitto.fi/"
  },
  {
    name: "A-klinikkasäätiö",
    url: "https://www.a-klinikka.fi/"
  },
  {
    name: "Suomen Hemofiliayhdistys ry (SHY)",
    url: "https://www.hemofilia.fi/"
  },
  {
    name: "HARSO ry",
    url: "https://www.harso.fi/"
  }
];

export const SENIOR_ASSOCIATION_LINKS: RegionalProvider[] = [
  {
    name: "Kansallinen Senioriliitto ry",
    url: "https://www.senioriliitto.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: []
  },
  {
    name: "Eläkeliitto",
    url: "https://elakeliitto.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: []
  },
  {
    name: "Eläkeläiset ry",
    url: "https://elakelaiset.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: []
  },
  {
    name: "Eläkeläisliittojen etujärjestö EETU ry",
    url: "https://www.eetu.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: []
  },
  {
    name: "Vanhus- ja lähimmäispalvelun liitto VALLI ry",
    url: "https://www.valli.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: []
  },
  {
    name: "Ikäinstituutti",
    url: "https://www.ikainstituutti.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: []
  },
  {
    name: "Vanhustyön keskusliitto (VTKL) ry",
    url: "https://www.vtkl.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: []
  },
  {
    name: "Eläkeliiton Etelä-Hämeen piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Etelä-Häme",
    type: "Piirijärjestö",
    area: "Etelä-Häme",
    municipalities: [
      "Akaa",
      "Forssa",
      "Hattula",
      "Hauho",
      "Hausjärvi",
      "Humppila",
      "Hämeenlinna",
      "Janakkala",
      "Jokioinen",
      "Kalvola",
      "Lammi",
      "Loppi",
      "Renko",
      "Riihimäki",
      "Tammela",
      "Urjala",
      "Valkeakoski",
      "Ypäjä"
    ]
  },
  {
    name: "Eläkeliiton Etelä-Pohjanmaan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Etelä-Pohjanmaa",
    type: "Piirijärjestö",
    area: "Etelä-Pohjanmaa",
    municipalities: [
      "Alahärmä",
      "Alajärvi",
      "Alavus",
      "Ilmajoki",
      "Isojoki",
      "Isokyrö",
      "Jalasjärvi",
      "Jurva",
      "Karijoki-Kristiina",
      "Kauhajoki",
      "Kauhava",
      "Kortesjärvi",
      "Kuortane",
      "Kurikka",
      "Laihia",
      "Lappajärvi",
      "Lapua",
      "Lehtimäki",
      "Maalahti",
      "Nurmo",
      "Peräseinäjoki",
      "Seinäjoki",
      "Soini",
      "Teuva",
      "Töysä",
      "Vimpeli",
      "Vähäkyrö",
      "Ylihärmä",
      "Ylistaro",
      "Ähtäri"
    ]
  },
  {
    name: "Eläkeliiton Etelä-Savon piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Etelä-Savo",
    type: "Piirijärjestö",
    area: "Etelä-Savo",
    municipalities: [
      "Anttola",
      "Haukivuori",
      "Hirvensalmi",
      "Joroinen",
      "Juva",
      "Jäppilä",
      "Kangasniemi",
      "Mikkeli",
      "Mäntyharju",
      "Pertunmaa",
      "Pieksämäki",
      "Puumala",
      "Ristiina",
      "Virtasalmi"
    ]
  },
  {
    name: "Eläkeliiton Helsingin piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Helsinki",
    type: "Piirijärjestö",
    area: "Helsinki",
    municipalities: [
      "Espoo",
      "Helsinki",
      "Ikiliikkujat",
      "Itä-Helsinki"
    ]
  },
  {
    name: "Eläkeliiton Itä-Savon piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Itä-Savo",
    type: "Piirijärjestö",
    area: "Itä-Savo",
    municipalities: [
      "Enonkoski",
      "Kerimäki",
      "Lohilahti",
      "Punkaharju",
      "Rantasalmi",
      "Savonlinnan seutu",
      "Savonranta",
      "Sulkava"
    ]
  },
  {
    name: "Eläkeliiton Kainuun piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Kainuu",
    type: "Piirijärjestö",
    area: "Kainuu",
    municipalities: [
      "Hyrynsalmi",
      "Kajaani",
      "Kuhmo",
      "Paltamo",
      "Puolanka",
      "Ristijärvi",
      "Ruhtinansalmi",
      "Sotkamo",
      "Suomussalmi",
      "Vaala",
      "Vuolijoki"
    ]
  },
  {
    name: "Eläkeliiton Karjalan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Karjala",
    type: "Piirijärjestö",
    area: "Karjala",
    municipalities: [
      "Joutseno",
      "Lappeenranta",
      "Lemi",
      "Luumäki",
      "Parikkala",
      "Rautjärvi",
      "Ruokolahti",
      "Savitaipale",
      "Simpele",
      "Taipalsaari",
      "Ylämaa"
    ]
  },
  {
    name: "Eläkeliiton Keski-Pohjanmaan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Keski-Pohjanmaa",
    type: "Piirijärjestö",
    area: "Keski-Pohjanmaa",
    municipalities: [
      "Halsua",
      "Himanka",
      "Kannus",
      "Kaustinen",
      "Kokkola",
      "Kälviä",
      "Lestijärvi",
      "Lohtaja",
      "Perho",
      "Pietarsaari",
      "Sievi",
      "Toholampi",
      "Ullava",
      "Veteli"
    ]
  },
  {
    name: "Eläkeliiton Keski-Suomen piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Keski-Suomi",
    type: "Piirijärjestö",
    area: "Keski-Suomi",
    municipalities: [
      "Haapamäki",
      "Hankasalmi",
      "Joutsa",
      "Jyväskylä",
      "Jämsä",
      "Kannonkoski",
      "Karstula",
      "Keuruu",
      "Kinnula",
      "Kivijärvi",
      "Konnevesi",
      "Korpilahti",
      "Kuhmoinen",
      "Kyyjärvi",
      "Laukaa",
      "Lievestuore",
      "Luhanka",
      "Multia",
      "Muurame",
      "Petäjävesi",
      "Pihtipudas",
      "Saarijärvi",
      "Toivakka",
      "Uurainen",
      "Viitasaari",
      "Äänekoski"
    ]
  },
  {
    name: "Eläkeliiton Kymenlaakson piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Kymenlaakso",
    type: "Piirijärjestö",
    area: "Kymenlaakso",
    municipalities: [
      "Anjalankoski",
      "Elimäki",
      "Jaala",
      "Kotka",
      "Kouvola",
      "Kuusankoski",
      "Miehikkälä",
      "Pyhtää",
      "Valkeala",
      "Vehkalahti",
      "Virolahti"
    ]
  },
  {
    name: "Eläkeliiton Lapin piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Lappi",
    type: "Piirijärjestö",
    area: "Lappi",
    municipalities: [
      "Enontekiö",
      "Inari",
      "Kemi",
      "Kemijärvi",
      "Keminmaa",
      "Kittilä",
      "Kolari ja järvikylät",
      "Pelkosenniemi",
      "Pello",
      "Posio",
      "Ranua",
      "Rovaniemi",
      "Salla",
      "Savukoski",
      "Simo",
      "Sodankylä",
      "Tervola",
      "Tornio",
      "Ylitornio"
    ]
  },
  {
    name: "Eläkeliiton Pirkanmaan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Pirkanmaa",
    type: "Piirijärjestö",
    area: "Pirkanmaa",
    municipalities: [
      "Hämeenkyrö",
      "Ikaalinen",
      "Kangasala",
      "Kuorevesi",
      "Lempäälä",
      "Längelmäki",
      "Orivesi",
      "Pirkkala-Nokia",
      "Ruovesi",
      "Sydänhäme",
      "Tampere",
      "Vesilahti",
      "Virrat",
      "Ylöjärvi"
    ]
  },
  {
    name: "Eläkeliiton Pohjois-Karjalan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Pohjois-Karjala",
    type: "Piirijärjestö",
    area: "Pohjois-Karjala",
    municipalities: [
      "Eno",
      "Heinävesi",
      "Ilomantsi",
      "Joensuu",
      "Juuka",
      "Kesälahti",
      "Kiihtelysvaara",
      "Kitee",
      "Kontiolahti",
      "Liperi",
      "Nurmes",
      "Outokumpu",
      "Pielisen Pirteät",
      "Polvijärvi",
      "Pyhäselkä",
      "Rääkkylä",
      "Tohmajärvi",
      "Valtimo",
      "Viinijärvi",
      "Värtsilä"
    ]
  },
  {
    name: "Eläkeliiton Pohjois-Pohjanmaan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Pohjois-Pohjanmaa",
    type: "Piirijärjestö",
    area: "Pohjois-Pohjanmaa",
    municipalities: [
      "Alavieska",
      "Haapavesi",
      "Hailuoto",
      "Haukipudas",
      "Ii",
      "Kalajoki",
      "Kempele",
      "Kestilä",
      "Kiiminki",
      "Kuivaniemi",
      "Kuusamo",
      "Kärsämäki",
      "Liminka",
      "Lumijoki",
      "Merijärvi",
      "Muhos",
      "Nivala",
      "Oulainen",
      "Oulu",
      "Oulunsalo",
      "Paavola",
      "Pattijoki",
      "Pudasjärvi",
      "Pulkkila",
      "Pyhäjoki",
      "Pyhäjärvi",
      "Pyhäntä",
      "Raahe",
      "Rantsila",
      "Reisjärvi",
      "Ruukki",
      "Siikajoki",
      "Taivalkoski",
      "Temmes",
      "Tyrnävä",
      "Utajärvi",
      "Vihanti",
      "Yli-Ii",
      "Ylikiiminki",
      "Ylivieska"
    ]
  },
  {
    name: "Eläkeliiton Pohjois-Savon piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Pohjois-Savo",
    type: "Piirijärjestö",
    area: "Pohjois-Savo",
    municipalities: [
      "Juankoski",
      "Kaavi",
      "Karttula",
      "Keitele",
      "Kuopio",
      "Leppävirta",
      "Maaninka",
      "Mustinlahti",
      "Muuruvesi",
      "Nilsiä",
      "Pielavesi",
      "Rautalampi",
      "Riistavesi",
      "Siilinjärvi",
      "Suonenjoki",
      "Säyneinen",
      "Tervo",
      "Tuusniemi",
      "Varkaus",
      "Vehmersalmi",
      "Vesanto"
    ]
  },
  {
    name: "Eläkeliiton Päijät-Hämeen piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Päijät-Häme",
    type: "Piirijärjestö",
    area: "Päijät-Häme",
    municipalities: [
      "Asikkala",
      "Hartola",
      "Heinola",
      "Hollola",
      "Iitti",
      "Kärkölä",
      "Lahti",
      "Nastola",
      "Orimattila",
      "Padasjoki",
      "Sysmä"
    ]
  },
  {
    name: "Eläkeliiton Satakunnan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Satakunta",
    type: "Piirijärjestö",
    area: "Satakunta",
    municipalities: [
      "Eura",
      "Eurajoki",
      "Harjavalta",
      "Honkajoki",
      "Huittinen",
      "Jämijärvi",
      "Kankaanpää",
      "Karvia",
      "Kihniö",
      "Kiikoinen",
      "Kiukainen",
      "Kokemäki",
      "Kullaa",
      "Köyliö",
      "Lappi",
      "Lavia",
      "Merikarvia",
      "Mouhijärvi",
      "Nakkila",
      "Noormarkku",
      "Parkano",
      "Pomarkku",
      "Pori",
      "Punkalaidun",
      "Rauma",
      "Siikainen",
      "Suodenniemi",
      "Säkylä",
      "Ulvila",
      "Vammala",
      "Vampula",
      "Äetsä"
    ]
  },
  {
    name: "Eläkeliiton Uudenmaan piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Uusimaa",
    type: "Piirijärjestö",
    area: "Uusimaa",
    municipalities: [
      "Askola",
      "Hyvinkää",
      "Järvenpää",
      "Karjalohja",
      "Karkkila",
      "Kerava",
      "Kirkkonummi",
      "Lohja",
      "Mäntsälä",
      "Nummela",
      "Nummi",
      "Nurmijärvi",
      "Pornainen",
      "Porvoo",
      "Pukkila",
      "Pusula",
      "Sammatti",
      "Seutula",
      "Tuusula",
      "Vantaa",
      "Vihti"
    ]
  },
  {
    name: "Eläkeliiton Varsinais-Suomen piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Varsinais-Suomi",
    type: "Piirijärjestö",
    area: "Varsinais-Suomi",
    municipalities: [
      "Alastaro",
      "Aura",
      "Halikko",
      "Kaarina",
      "Kalanti",
      "Karinainen",
      "Kemiönsaari",
      "Kiikala",
      "Kisko",
      "Koski TL",
      "Kustavi",
      "Kuusjoki",
      "Laitila",
      "Lemu-Askainen-Velkua",
      "Lieto",
      "Loimaa",
      "Loimaan Eloisat",
      "Marttila",
      "Masku",
      "Mellilä",
      "Mietoinen",
      "Mynämäki",
      "Naantali",
      "Nousiainen",
      "Oripää",
      "Paimio",
      "Parainen",
      "Perniö",
      "Pertteli",
      "Piikkiö",
      "Pyhäranta",
      "Pöytyä",
      "Raisio",
      "Rymättylä",
      "Salo",
      "Sauvo-Karuna",
      "Somero",
      "Suomusjärvi",
      "Särkisalo",
      "Taivassalo",
      "Tarvasjoki",
      "Turku",
      "Vahto-Rusko",
      "Vehmaa",
      "Yläne"
    ]
  },
  {
    name: "Eläkeliiton Ylä-Savon piiri",
    url: "https://elakeliitto.fi/piirit-ja-yhdistykset/",
    group: "Ylä-Savo",
    type: "Piirijärjestö",
    area: "Ylä-Savo",
    municipalities: [
      "Iisalmi",
      "Kiuruvesi",
      "Lapinlahti",
      "Rautavaara",
      "Sonkajärvi",
      "Sukeva",
      "Varpaisjärvi",
      "Vieremä"
    ]
  },
  {
    name: "Senioriliitto – Etelä-Karjala",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Etelä-Karjala",
    type: "Piirijärjestö",
    area: "Etelä-Karjala",
    municipalities: [
      "Hamina",
      "Imatra",
      "Lappeenranta",
      "Luumäki",
      "Miehikkälä",
      "Parikkala",
      "Rautjärvi",
      "Ruokolahti",
      "Savitaipale",
      "Taipalsaari"
    ]
  },
  {
    name: "Senioriliitto – Etelä-Savo",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Etelä-Savo",
    type: "Piirijärjestö",
    area: "Etelä-Savo",
    municipalities: [
      "Mikkeli",
      "Savonlinna",
      "Pieksämäki",
      "Enonkoski",
      "Hirvensalmi",
      "Juva",
      "Kangasniemi",
      "Pertunmaa",
      "Punkaharju",
      "Rantasalmi"
    ]
  },
  {
    name: "Senioriliitto – Helsinki",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Helsinki",
    type: "Piirijärjestö",
    area: "Helsinki",
    municipalities: [
      "Helsinki",
      "Espoo",
      "Vantaa",
      "Kauniainen"
    ]
  },
  {
    name: "Senioriliitto – Häme",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Häme",
    type: "Piirijärjestö",
    area: "Häme",
    municipalities: [
      "Hämeenlinna",
      "Riihimäki",
      "Forssa",
      "Valkeakoski",
      "Akaa",
      "Hattula",
      "Janakkala",
      "Loppi",
      "Tammela"
    ]
  },
  {
    name: "Senioriliitto – Keski-Suomi",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Keski-Suomi",
    type: "Piirijärjestö",
    area: "Keski-Suomi",
    municipalities: [
      "Jyväskylä",
      "Äänekoski",
      "Saarijärvi",
      "Laukaa",
      "Muurame",
      "Petäjävesi",
      "Toivakka",
      "Uurainen",
      "Viitasaari"
    ]
  },
  {
    name: "Senioriliitto – Kymenlaakso",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Kymenlaakso",
    type: "Piirijärjestö",
    area: "Kymenlaakso",
    municipalities: [
      "Kotka",
      "Kouvola",
      "Hamina",
      "Pyhtää",
      "Miehikkälä",
      "Virolahti"
    ]
  },
  {
    name: "Senioriliitto – Lappi",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Lappi",
    type: "Piirijärjestö",
    area: "Lappi",
    municipalities: [
      "Rovaniemi",
      "Kemi",
      "Tornio",
      "Sodankylä",
      "Kemijärvi",
      "Tervola",
      "Inari",
      "Enontekiö"
    ]
  },
  {
    name: "Senioriliitto – Oulu",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Oulu",
    type: "Piirijärjestö",
    area: "Oulu",
    municipalities: [
      "Oulu",
      "Raahe",
      "Nivala",
      "Ylivieska",
      "Haapavesi",
      "Siikalatva",
      "Pyhäjärvi"
    ]
  },
  {
    name: "Senioriliitto – Pirkanmaa",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Pirkanmaa",
    type: "Piirijärjestö",
    area: "Pirkanmaa",
    municipalities: [
      "Tampere",
      "Pirkkala",
      "Nokia",
      "Kangasala",
      "Lempäälä",
      "Orivesi",
      "Vesilahti",
      "Ylöjärvi"
    ]
  },
  {
    name: "Senioriliitto – Pohjanmaa",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Pohjanmaa",
    type: "Piirijärjestö",
    area: "Pohjanmaa",
    municipalities: [
      "Vaasa",
      "Seinäjoki",
      "Korsholm",
      "Närpiö",
      "Korsnäs",
      "Maalahti",
      "Kurikka",
      "Ilmajoki"
    ]
  },
  {
    name: "Senioriliitto – Satakunta",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Satakunta",
    type: "Piirijärjestö",
    area: "Satakunta",
    municipalities: [
      "Pori",
      "Rauma",
      "Huittinen",
      "Kankaanpää",
      "Harjavalta",
      "Eura",
      "Köyliö",
      "Lavia"
    ]
  },
  {
    name: "Senioriliitto – Savo-Karjala",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Savo-Karjala",
    type: "Piirijärjestö",
    area: "Savo-Karjala",
    municipalities: [
      "Joensuu",
      "Kuopio",
      "Savonlinna",
      "Mikkeli",
      "Pieksämäki",
      "Iisalmi"
    ]
  },
  {
    name: "Senioriliitto – Uusimaa",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Uusimaa",
    type: "Piirijärjestö",
    area: "Uusimaa",
    municipalities: [
      "Helsinki",
      "Espoo",
      "Vantaa",
      "Hyvinkää",
      "Järvenpää",
      "Kerava",
      "Kirkkonummi",
      "Lohja",
      "Porvoo"
    ]
  },
  {
    name: "Senioriliitto – Varsinais-Suomi",
    url: "https://www.senioriliitto.fi/liitto/paikallisyhdistykset/",
    group: "Varsinais-Suomi",
    type: "Piirijärjestö",
    area: "Varsinais-Suomi",
    municipalities: [
      "Turku",
      "Salo",
      "Raisio",
      "Naantali",
      "Loimaa",
      "Kaarina",
      "Lieto",
      "Paimio"
    ]
  }
];

export const MUSEUM_LINKS: RegionalProvider[] = [
  {
    name: "Suomen kansallismuseo",
    url: "https://www.kansallismuseo.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Kulttuurihistoria"
  },
  {
    name: "Kansallisgalleria (Ateneum, Kiasma, Sinebrychoff)",
    url: "https://www.kansallisgalleria.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Taide"
  },
  {
    name: "Luonnontieteellinen keskusmuseo LUOMUS",
    url: "https://www.luomus.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Luonnontieteet"
  },
  {
    name: "Suomen merimuseo",
    url: "https://www.merimuseo.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Merihistoria"
  },
  {
    name: "Suomen ilmailumuseo",
    url: "https://www.ilmailumuseo.fi/",
    group: "Vantaa",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Vantaa",
    specialty: "Ilmailu"
  },
  {
    name: "Suomen rautatiemuseo",
    url: "https://www.rautatiemuseo.fi/",
    group: "Hyvinkää",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Hyvinkää",
    specialty: "Rautatiet"
  },
  {
    name: "Suomen sotamuseo",
    url: "https://www.sotamuseo.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Sotahistoria"
  },
  {
    name: "Suomen valokuvataiteen museo",
    url: "https://www.valokuvataiteenmuseo.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Valokuvataide"
  },
  {
    name: "Designmuseo",
    url: "https://www.designmuseo.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Muotoilu"
  },
  {
    name: "Arkkitehtuurimuseo",
    url: "https://www.mfa.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Arkkitehtuuri"
  },
  {
    name: "Suomen teatterimuseo",
    url: "https://www.teatterimuseo.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Teatteri"
  },
  {
    name: "Suomen urheilumuseo",
    url: "https://www.urheilumuseo.fi/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Urheilu"
  },
  {
    name: "Suomen pelimuseo",
    url: "https://www.pelimuseo.fi/",
    group: "Tampere",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Tampere",
    specialty: "Pelit"
  },
  {
    name: "Suomen postimuseo",
    url: "https://www.postimuseo.fi/",
    group: "Tampere",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Tampere",
    specialty: "Posti"
  },
  {
    name: "Suomen työväenmuseo Werstas",
    url: "https://www.werstas.fi/",
    group: "Tampere",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Tampere",
    specialty: "Työväenhistoria"
  },
  {
    name: "Suomen mediamuseo Rupriikki",
    url: "https://www.rupriikki.fi/",
    group: "Tampere",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Tampere",
    specialty: "Media"
  },
  {
    name: "Suomen kello- ja korumuseo",
    url: "https://www.kellomuseo.fi/",
    group: "Espoo",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Espoo",
    specialty: "Kellot ja korut"
  },
  {
    name: "Helsingin taidemuseo HAM",
    url: "https://www.hamhelsinki.fi/",
    group: "Helsinki",
    type: "Alueellinen vastuumuseo",
    area: "Uusimaa",
    municipality: "Helsinki",
    specialty: "Taide"
  },
  {
    name: "Hämeenlinnan taidemuseo",
    url: "https://www.hameenlinna.fi/taidemuseo",
    group: "Hämeenlinna",
    type: "Alueellinen vastuumuseo",
    area: "Kanta-Häme",
    municipality: "Hämeenlinna",
    specialty: "Taide"
  },
  {
    name: "Joensuun taidemuseo",
    url: "https://www.joensuu.fi/museot",
    group: "Joensuu",
    type: "Alueellinen vastuumuseo",
    area: "Pohjois-Karjala",
    municipality: "Joensuu",
    specialty: "Taide"
  },
  {
    name: "Jyväskylän taidemuseo",
    url: "https://www.jyvaskyla.fi/taidemuseo",
    group: "Jyväskylä",
    type: "Alueellinen vastuumuseo",
    area: "Keski-Suomi",
    municipality: "Jyväskylä",
    specialty: "Taide"
  },
  {
    name: "Oulun taidemuseo",
    url: "https://www.ouka.fi/oulun-taidemuseo",
    group: "Oulu",
    type: "Alueellinen vastuumuseo",
    area: "Pohjois-Pohjanmaa ja Kainuu",
    municipality: "Oulu",
    specialty: "Taide"
  },
  {
    name: "Turun taidemuseo",
    url: "https://www.turuntaidemuseo.fi/",
    group: "Turku",
    type: "Alueellinen vastuumuseo",
    area: "Varsinais-Suomi",
    municipality: "Turku",
    specialty: "Taide"
  },
  {
    name: "Pohjanmaan museo",
    url: "https://www.pohjanmaanmuseo.fi/",
    group: "Vaasa",
    type: "Alueellinen vastuumuseo",
    area: "Pohjanmaa ja Keski-Pohjanmaa",
    municipality: "Vaasa",
    specialty: "Kulttuurihistoria"
  },
  {
    name: "Mikkelin taidemuseo",
    url: "https://www.mikkeli.fi/mikkelin-taidemuseo",
    group: "Mikkeli",
    type: "Alueellinen vastuumuseo",
    area: "Etelä-Savo",
    municipality: "Mikkeli",
    specialty: "Taide"
  },
  {
    name: "Lappeenrannan taidemuseo",
    url: "https://www.lappeenranta.fi/taidemuseo",
    group: "Lappeenranta",
    type: "Alueellinen vastuumuseo",
    area: "Etelä-Karjala ja Kymenlaakso",
    municipality: "Lappeenranta",
    specialty: "Taide"
  },
  {
    name: "Satakunnan museo",
    url: "https://www.satakuntamuseo.fi/",
    group: "Pori",
    type: "Alueellinen vastuumuseo",
    area: "Satakunta",
    municipality: "Pori",
    specialty: "Kulttuurihistoria"
  },
  {
    name: "Aboa Vetus & Ars Nova",
    url: "https://www.aboavetusarsnova.fi/",
    group: "Turku",
    type: "Paikallismuseo",
    area: "Varsinais-Suomi",
    municipality: "Turku",
    specialty: "Arkeologia ja taide"
  },
  {
    name: "Amos Rex",
    url: "https://www.amosrex.fi/",
    group: "Helsinki",
    type: "Paikallismuseo",
    area: "Uusimaa",
    municipality: "Helsinki",
    specialty: "Nykytaide"
  },
  {
    name: "Ateneum",
    url: "https://www.ateneum.fi/",
    group: "Helsinki",
    type: "Paikallismuseo",
    area: "Uusimaa",
    municipality: "Helsinki",
    specialty: "Taide"
  },
  {
    name: "Turun linna",
    url: "https://www.turunlinna.fi/",
    group: "Turku",
    type: "Paikallismuseo",
    area: "Varsinais-Suomi",
    municipality: "Turku",
    specialty: "Historia"
  },
  {
    name: "Vapriikki",
    url: "https://www.vapriikki.fi/",
    group: "Tampere",
    type: "Paikallismuseo",
    area: "Pirkanmaa",
    municipality: "Tampere",
    specialty: "Luonnontieteet ja historia"
  },
  {
    name: "Seurasaaren ulkomuseo",
    url: "https://www.kansallismuseo.fi/seurasaari",
    group: "Helsinki",
    type: "Paikallismuseo",
    area: "Uusimaa",
    municipality: "Helsinki",
    specialty: "Ulkomuseo"
  },
  {
    name: "Alvar Aalto -museo",
    url: "https://www.alvaraalto.fi/",
    group: "Jyväskylä",
    type: "Paikallismuseo",
    area: "Keski-Suomi",
    municipality: "Jyväskylä",
    specialty: "Arkkitehtuuri"
  },
  {
    name: "Ainola",
    url: "https://www.ainola.fi/",
    group: "Järvenpää",
    type: "Paikallismuseo",
    area: "Uusimaa",
    municipality: "Järvenpää",
    specialty: "Kotimuseo"
  },
  {
    name: "Serlachius-museo Gustaf",
    url: "https://www.serlachius.fi/",
    group: "Mänttä-Vilppula",
    type: "Paikallismuseo",
    area: "Pirkanmaa",
    municipality: "Mänttä-Vilppula",
    specialty: "Taide ja teollisuus"
  },
  {
    name: "Oulun taidemuseo",
    url: "https://www.ouka.fi/taidemuseo",
    group: "Oulu",
    type: "Paikallismuseo",
    area: "Pohjois-Pohjanmaa",
    municipality: "Oulu",
    specialty: "Taide"
  },
  {
    name: "Kiasma",
    url: "https://www.kiasma.fi/",
    group: "Helsinki",
    type: "Paikallismuseo",
    area: "Uusimaa",
    municipality: "Helsinki",
    specialty: "Nykytaide"
  },
  {
    name: "Hämeen linna",
    url: "https://www.hameenlinna.fi/hameenlinna",
    group: "Hämeenlinna",
    type: "Paikallismuseo",
    area: "Kanta-Häme",
    municipality: "Hämeenlinna",
    specialty: "Historia"
  },
  {
    name: "Rovaniemen taidemuseo",
    url: "https://www.rovaniemi.fi/taidemuseo",
    group: "Rovaniemi",
    type: "Paikallismuseo",
    area: "Lappi",
    municipality: "Rovaniemi",
    specialty: "Taide"
  },
  {
    name: "Ahvenanmaan museo",
    url: "https://www.museum.ax/",
    group: "Maarianhamina",
    type: "Paikallismuseo",
    area: "Ahvenanmaa",
    municipality: "Maarianhamina",
    specialty: "Kulttuurihistoria"
  },
  {
    name: "Arktikum",
    url: "https://www.arktikum.fi/",
    group: "Rovaniemi",
    type: "Paikallismuseo",
    area: "Lappi",
    municipality: "Rovaniemi",
    specialty: "Arktinen kulttuuri ja luonto"
  }
];
