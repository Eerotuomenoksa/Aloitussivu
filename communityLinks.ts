import { Provider } from './types';

export interface RegionalProvider extends Provider {
  area?: string;
  municipality?: string;
  municipalities?: string[];
  specialty?: string;
  type?: string;
}

export const PATIENT_ASSOCIATION_LINKS: RegionalProvider[] = [
  {
    name: "22q11 Finland (ent. Catch-yhdistys)",
    url: "https://www.22q11finland.fi/"
  },
  {
    name: "AH-potilaat",
    url: "https://www.ah-potilaat.org/"
  },
  {
    name: "Aivolisäke-potilasyhdistys Sella",
    url: "https://sellanet.com/"
  },
  {
    name: "ALS-tutkimuksen tuki",
    url: "https://www.alstuttu.org/"
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
    name: "Rett Finland ry",
    url: "https://www.rettfinland.fi/"
  },
  {
    name: "Cranio",
    url: "https://www.cranio.fi/"
  },
  {
    name: "Erityislasten Omaiset ELO",
    url: "https://erityislastenomaiset.fi/"
  },
  {
    name: "Etelä-Suomen Alopecia- ja Vitiligoyhdistys",
    url: "https://www.alopeciavitiligo.fi/yhdistykset/etela-suomi/"
  },
  {
    name: "Finnilco",
    url: "https://www.finnilco.fi/"
  },
  {
    name: "Frax",
    url: "https://fraxry.wordpress.com/"
  },
  {
    name: "FSHD-yhdistys",
    url: "https://fshdfinland.org/"
  },
  {
    name: "GNAO1 Tuki",
    url: "https://www.gnao1.fi/"
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
    url: "https://www.iholiitto.fi/ihoyhdistys/"
  },
  {
    name: "Immuunipuutospotilaiden yhdistys Imppu",
    url: "https://immuunipuutospotilaidenyhdistys.fi/"
  },
  {
    name: "ITP – Verenvuotosairaudet ry",
    url: "https://verenvuotosairaudet.fi/verenvuototaudit/itp-eli-immuuni-trombosytopenia/"
  },
  {
    name: "Kalfos",
    url: "https://www.kalfos.fi/"
  },
  {
    name: "Karpatiat",
    url: "https://sydan.fi/karpatiat/"
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
    url: "https://www.marfan.fi/"
  },
  {
    name: "MeHyvät",
    url: "https://www.mehyvat.fi/"
  },
  {
    name: "Mitokondrioyhdistys",
    url: "https://mitokondrioyhdistys.neuroliitto.fi/"
  },
  {
    name: "OUKALI ry",
    url: "https://www.oukali-lihastautiyhdistys.com/"
  },
  {
    name: "Pohjois-Suomen Alopecia- ja Vitiligoyhdistys",
    url: "https://www.alopeciavitiligo.fi/yhdistykset/pohjois-suomi/"
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
    url: "https://www.halkio.com/"
  },
  {
    name: "Suomen Akustikusneurinoomayhdistys",
    url: "https://www.akustikusneurinoomayhdistys.com/"
  },
  {
    name: "Suomen albinismiyhdistys",
    url: "https://albinismiyhdistys.omasivu.fi/"
  },
  {
    name: "Suomen Amyloidoosiyhdistys",
    url: "https://suomenamyloidoosiyhdistys.fi/"
  },
  {
    name: "Suomen Angelman-yhdistys",
    url: "https://www.angelman.fi/"
  },
  {
    name: "Suomen CF-yhdistys",
    url: "https://www.hengitysyhdistys.fi/suomencf/"
  },
  {
    name: "Suomen Chiari- ja syringomyeliayhdistys",
    url: "https://neuroliitto.fi/yhdistykset/jasenyhdistykset/"
  },
  {
    name: "Suomen Dystoniayhdistys",
    url: "https://dystoniayhdistys.com/"
  },
  {
    name: "Suomen EB-yhdistys",
    url: "https://www.iholiitto.fi/eb-yhdistys/"
  },
  {
    name: "Suomen Ehlers-Danlos yhdistys (SEDY)",
    url: "https://www.ehlers-danlos.fi/"
  },
  {
    name: "Suomen Fabry-yhdistys",
    url: "https://fabry.neuroliitto.fi/"
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
    url: "https://verenvuotosairaudet.fi/"
  },
  {
    name: "Suomen HHT/Osler-yhdistys",
    url: "https://hht-osler.fi/"
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
    url: "https://www.skyry.org/"
  },
  {
    name: "Suomen lymfayhdistys",
    url: "https://www.lymfayhdistys.fi/"
  },
  {
    name: "Suomen MG-yhdistys",
    url: "https://www.suomenmg-yhdistys.fi/"
  },
  {
    name: "Suomen Narkolepsiayhdistys",
    url: "https://www.narkolepsia.fi/"
  },
  {
    name: "Suomen NF-yhdistys",
    url: "https://www.snf.fi/"
  },
  {
    name: "Suomen Noonan-yhdistys",
    url: "https://www.noonansuomi.net/"
  },
  {
    name: "Suomen Osteogenesis Imperfecta –yhdistys",
    url: "https://www.oi-yhdistys.fi/"
  },
  {
    name: "Suomen Palovammayhdistys",
    url: "https://www.iholiitto.fi/jasenjarjestot/palovammayhdistys/"
  },
  {
    name: "Suomen PAH-potilasyhdistys",
    url: "https://suomen-pah.org/"
  },
  {
    name: "Suomen PANS/PANDAS",
    url: "https://panspandas.wordpress.com/"
  },
  {
    name: "Suomen Perthes",
    url: "https://www.perthes.fi/"
  },
  {
    name: "Suomen PWS-yhdistys",
    url: "https://www.pws-yhdistys.fi/"
  },
  {
    name: "Suomen Sklerodermayhdistys",
    url: "https://www.sklero.org/"
  },
  {
    name: "Sotosin oireyhtymä – Tukiliitto",
    url: "https://www.tukiliitto.fi/diagnoosit/sotosin-oireyhtyma/"
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
    url: "https://www.vaskuliittiyhdistys.fi/"
  },
  {
    name: "Sydän- ja Keuhkosiirrokkaat (Syke)",
    url: "https://www.syke.fi/"
  },
  {
    name: "Sydänlapset ja -aikuiset",
    url: "https://sydanlapsetjaaikuiset.fi/"
  },
  {
    name: "Sylva",
    url: "https://www.sylva.fi/"
  },
  {
    name: "Valoihottumayhdistys",
    url: "https://valoihottuma.allergia.fi/"
  },
  {
    name: "Waldenström Finland ry",
    url: "https://www.wmfin.fi/"
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
    name: "Espoon ja Kauniaisten Muistiyhdistys ry / Esbo och Grankulla Minnesförening rf",
    url: "https://muistiliitto.fi/muistiyhdistykset/espoon-ja-kauniaisten-muistiyhdistys-ry-esbo-och-grankulla-minnesforening-rf/etusivu-espoo/",
    group: "Muistiyhdistykset",
    municipalities: ["Espoo", "Kauniainen"]
  },
  {
    name: "Etelä-Karjalan Muisti ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/etela-karjalan-muisti-ry/etusivu-etela-karjala/",
    group: "Muistiyhdistykset",
    area: "Etelä-Karjala"
  },
  {
    name: "Etelä-Pohjanmaan Muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/etela-pohjanmaan-muistiyhdistys-ry/etusivu-2/",
    group: "Muistiyhdistykset",
    area: "Etelä-Pohjanmaa"
  },
  {
    name: "Helsingin Muistiyhdistys ry",
    url: "https://muistihelsinki.fi/",
    group: "Muistiyhdistykset",
    municipality: "Helsinki"
  },
  {
    name: "Hyvinkään Muisti ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/hyvinkaan-muisti-ry/etusivu-hyvinkaa/",
    group: "Muistiyhdistykset",
    municipality: "Hyvinkää"
  },
  {
    name: "Jämsän Muistiyhdistys ry",
    url: "https://www.jamsanmuistiyhdistys.fi/",
    group: "Muistiyhdistykset",
    municipality: "Jämsä"
  },
  {
    name: "Kainuun Muistiyhdistys",
    url: "https://muistiliitto.fi/muistiyhdistykset/kainuun-muistiyhdistys/etusivu-kainuu/",
    group: "Muistiyhdistykset",
    area: "Kainuu"
  },
  {
    name: "Kanta-Hämeen Muistiyhdistys ry",
    url: "https://muistiaina.fi/",
    group: "Muistiyhdistykset",
    area: "Kanta-Häme"
  },
  {
    name: "Karjaan ja Pohjan ikäihmisten tuki ry / Stöd för de äldre i Karis och Pojo rf",
    url: "https://muistiliitto.fi/muistiyhdistykset/karjaan-ja-pohjan-ikaihmisten-tuki-ry-stod-for-de-aldre-i-karis-och-pojo-rf/etusivu-karjaa/",
    group: "Muistiyhdistykset",
    municipalities: ["Raasepori"]
  },
  {
    name: "Keski-Suomen Muistiyhdistys ry",
    url: "https://ksmuistiyhdistys.fi/",
    group: "Muistiyhdistykset",
    area: "Keski-Suomi"
  },
  {
    name: "Keski-Uudenmaan Muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/keski-uudenmaan-muistiyhdistys-ry/etusivu-keski-uusimaa/",
    group: "Muistiyhdistykset",
    municipalities: ["Hyvinkää", "Järvenpää", "Kerava", "Mäntsälä", "Nurmijärvi", "Pornainen", "Sipoo", "Tuusula"]
  },
  {
    name: "Koillismaan Seudun Muisti ry",
    url: "https://www.koillismaanseudunmuisti.fi/",
    group: "Muistiyhdistykset",
    municipalities: ["Kuusamo", "Taivalkoski", "Pudasjärvi"]
  },
  {
    name: "Kotkan Seudun muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/kotkan-seudun-muistiyhdistys-ry/etusivu-kotka/",
    group: "Muistiyhdistykset",
    municipalities: ["Kotka", "Hamina", "Pyhtää", "Virolahti", "Miehikkälä"]
  },
  {
    name: "Kouvolan seudun Muisti ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/kouvolan-seudun-muisti/etusivu-kouvola/",
    group: "Muistiyhdistykset",
    municipality: "Kouvola"
  },
  {
    name: "Lapin Muistiyhdistys ry",
    url: "https://lapinmuistiyhdistys.fi/",
    group: "Muistiyhdistykset",
    area: "Lappi"
  },
  {
    name: "Länsi-Pohjan Muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/lansi-pohjan-muistiyhdistys/etusivu-lansi-pohja/",
    group: "Muistiyhdistykset",
    municipalities: ["Kemi", "Keminmaa", "Simo", "Tervola", "Tornio", "Ylitornio"]
  },
  {
    name: "Mikkelin seudun Muisti ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/mikkelin-seudun-muisti/etusivu-2/",
    group: "Muistiyhdistykset",
    municipality: "Mikkeli"
  },
  {
    name: "Oulun Seudun Muistiyhdistys ry",
    url: "https://www.osmy.fi/",
    group: "Muistiyhdistykset",
    municipalities: ["Oulu", "Ii", "Kempele", "Liminka", "Lumijoki", "Muhos", "Tyrnävä"]
  },
  {
    name: "Pieksämäen Muistiyhdistys",
    url: "https://muistiliitto.fi/muistiyhdistykset/pieksamaen-muistiyhdistys/pieksamaen-muistiyhdistys-ry/",
    group: "Muistiyhdistykset",
    municipality: "Pieksämäki"
  },
  {
    name: "Pirkanmaan Muistiyhdistys ry",
    url: "https://www.pirkanmaanmuistiyhdistys.fi/",
    group: "Muistiyhdistykset",
    area: "Pirkanmaa"
  },
  {
    name: "Pohjois-Karjalan Muisti ry",
    url: "https://www.pkmuistiry.fi/",
    group: "Muistiyhdistykset",
    area: "Pohjois-Karjala"
  },
  {
    name: "Pohjois-Savon Muisti ry",
    url: "https://www.psmuisti.fi/",
    group: "Muistiyhdistykset",
    area: "Pohjois-Savo"
  },
  {
    name: "Porin Seudun Muistiyhdistys",
    url: "https://muistiliitto.fi/muistiyhdistykset/porin-seudun-muistiyhdistys/etusivu-pori/",
    group: "Muistiyhdistykset",
    municipality: "Pori"
  },
  {
    name: "Päijät-Hämeen Muistiyhdistys ry",
    url: "https://www.ph-muistiyhdistys.fi/",
    group: "Muistiyhdistykset",
    area: "Päijät-Häme"
  },
  {
    name: "Raahen seudun muistiyhdistys",
    url: "https://muistiliitto.fi/muistiyhdistykset/raahen-seudun-muistiyhdistys/etusivu-raahe/",
    group: "Muistiyhdistykset",
    municipality: "Raahe"
  },
  {
    name: "Rauman Seudun Muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/rauman-seudun-muistiyhdistys/etusivu-rauma/",
    group: "Muistiyhdistykset",
    municipality: "Rauma"
  },
  {
    name: "Salon Muistiyhdistys",
    url: "https://muistiliitto.fi/muistiyhdistykset/salon-muistiyhdistys/tietoa-yhdistyksesta-4/",
    group: "Muistiyhdistykset",
    municipality: "Salo"
  },
  {
    name: "Savonlinnan Seudun Muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/savonlinnan-seudun-muistiyhdistys/etusivu-savonlinna/",
    group: "Muistiyhdistykset",
    municipality: "Savonlinna"
  },
  {
    name: "Suomenselän Muisti ry",
    url: "https://www.suomenselanmuisti.fi/",
    group: "Muistiyhdistykset",
    municipalities: ["Alajärvi", "Soini", "Vimpeli"]
  },
  {
    name: "Vaasan Seudun Muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/vaasan-seudun-muistiyhdistys-ry/etusivu-8/",
    group: "Muistiyhdistykset",
    municipality: "Vaasa"
  },
  {
    name: "Vantaan Muistiyhdistys ry",
    url: "https://muistiliitto.fi/muistiyhdistykset/vantaan-muistiyhdistys-ry/etusivu-vantaa/",
    group: "Muistiyhdistykset",
    municipality: "Vantaa"
  },
  {
    name: "Varsinais-Suomen Muistiyhdistys ry / Egentliga Finlands Minnesförening rf",
    url: "https://www.muistiturku.fi/fi/",
    group: "Muistiyhdistykset",
    area: "Varsinais-Suomi"
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
    name: "Eläkkeensaajien Keskusliitto EKL ry",
    url: "https://www.ekl.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: [],
    sourceNote: "EETUn jäsenjärjestö ja valtakunnallinen eläkeläisjärjestö; EKL:n sivu ohjaa EKL-yhdistyksiin kautta maan.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "KRELLI Kristilliset Eläkeläiset ry",
    url: "https://www.krell.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: [],
    sourceNote: "EETUn jäsenjärjestö; KRELLI kuvaa itsensä valtakunnalliseksi eläkeläisjärjestöksi ja ylläpitää paikallisyhdistyslistausta.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "Svenska pensionärsförbundet",
    url: "https://www.spfpension.fi/",
    group: "Koko Suomi",
    type: "Valtakunnallinen",
    area: "Koko Suomi",
    municipalities: [],
    sourceNote: "EETUn jäsenjärjestö; ruotsinkielinen eläkeläisliitto, jolla on paikallisyhdistyksiä eri puolilla Svenskfinlandia.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "Eläkeläisliittojen etujärjestö EETU ry",
    url: "https://www.eetury.fi/",
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
    name: "EKL-yhdistykset piireittäin",
    url: "https://www.ekl.fi/tietoa-meista/yhdistykset/",
    group: "Koko Suomi",
    type: "Yhdistyshaku",
    area: "Koko Suomi",
    municipalities: [],
    sourceNote: "EKL:n yhdistyshaku ohjaa alueellisiin EKL-yhdistyksiin ja kertoo uuden jäsenen liittyvän alueyhdistykseen.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "KRELLI paikallisyhdistykset",
    url: "https://www.krell.fi/yhdistykset/",
    group: "Paikallisyhdistykset",
    type: "Yhdistyshaku",
    area: "Koko Suomi",
    municipalities: [
      "Alavus",
      "Espoo",
      "Hamina",
      "Helsinki",
      "Huittinen",
      "Hämeenlinna",
      "Iisalmi",
      "Joensuu",
      "Jyväskylä",
      "Kerava",
      "Kitee",
      "Kotka",
      "Kouvola",
      "Kuopio",
      "Kurikka",
      "Lahti",
      "Lappeenranta",
      "Lapua",
      "Lempäälä",
      "Leppävirta",
      "Lohja",
      "Loimaa",
      "Mikkeli",
      "Nurmijärvi",
      "Pori",
      "Rauma",
      "Riihimäki",
      "Ruokolahti",
      "Ruovesi",
      "Rääkkylä",
      "Sastamala",
      "Suonenjoki",
      "Tampere",
      "Teuva",
      "Turku",
      "Valkeakoski",
      "Vantaa"
    ],
    sourceNote: "KRELLIn yhdistyssivu listaa paikallisyhdistykset paikkakunnittain ja linkittää niiden sivuille.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "Eläkeläiset ry Kainuun Aluejärjestö",
    url: "https://elakelaiset.fi/jarjesto/aluejarjestot-ja-paikallisyhdistykset/",
    group: "Kainuu",
    type: "Aluejärjestö",
    area: "Kainuu",
    municipalities: [
      "Hyrynsalmi",
      "Kajaani",
      "Kuhmo",
      "Paltamo",
      "Puolanka",
      "Sotkamo",
      "Suomussalmi"
    ],
    sourceNote: "Eläkeläiset ry:n aluejärjestösivu listaa Kainuun aluejärjestön sekä Hyrynsalmen, Kajaanin, Kuhmon, Paltamon, Puolangan, Sotkamon ja Suomussalmen paikallisyhdistykset.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "Eläkeläiset ry Keski-Suomen aluejärjestö",
    url: "https://elakelaiset.fi/jarjesto/aluejarjestot-ja-paikallisyhdistykset/",
    group: "Keski-Suomi",
    type: "Aluejärjestö",
    area: "Keski-Suomi",
    municipalities: [
      "Hankasalmi",
      "Jyväskylä",
      "Jämsä",
      "Laukaa",
      "Multia",
      "Muurame",
      "Pihtipudas",
      "Saarijärvi",
      "Äänekoski"
    ],
    sourceNote: "Eläkeläiset ry:n aluejärjestösivu listaa Keski-Suomen aluejärjestön ja alueen paikallisyhdistysten kotisivulinkkejä.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "Svenska pensionärsförbundet paikallisyhdistykset",
    url: "https://www.spfpension.fi/foreningar/",
    group: "Ruotsinkieliset seniorit",
    type: "Yhdistyshaku",
    area: "Svenskfinland",
    municipalities: [
      "Porvoo",
      "Loviisa",
      "Pyhtää",
      "Sipoo",
      "Raasepori",
      "Inkoo",
      "Hanko",
      "Kirkkonummi",
      "Lohja",
      "Siuntio",
      "Helsinki",
      "Espoo",
      "Kauniainen",
      "Vantaa",
      "Kemiönsaari",
      "Parainen",
      "Turku",
      "Pedersören kunta",
      "Pietarsaari",
      "Uusikaarlepyy",
      "Kokkola",
      "Kaskinen",
      "Mustasaari",
      "Korsnäs",
      "Kristiinankaupunki",
      "Kruunupyy",
      "Luoto",
      "Maalahti",
      "Närpiö",
      "Vöyri",
      "Vaasa",
      "Pori",
      "Tampere",
      "Maarianhamina"
    ],
    sourceNote: "Svenska pensionärsförbundetin yhdistyssivu listaa 72 paikallisyhdistystä alueittain ja erilliset alueelliset organisaatiot.",
    verifiedAt: "2026-07-11"
  },
  {
    name: "Eläkeliiton Etelä-Hämeen piiri",
    url: "https://etela-hame.elakeliitto.fi/yhdistykset/",
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
    ],
    sourceNote: "Eläkeliiton Etelä-Hämeen piirin sivu kertoo piirissä olevan 18 paikallisyhdistystä ja listaa niiden verkkosivut.",
    verifiedAt: "2026-07-11"
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
    ],
    sourceNote: "Senioriliiton paikallisyhdistykset-sivu ohjaa valitsemaan ensin alueellisen senioripiirin ja sen jälkeen piirin paikallisyhdistyksen.",
    verifiedAt: "2026-07-11"
  }
];

export const MUSEUM_LINKS: RegionalProvider[] = [
  {
    name: "Taide- ja museokeskus Sinkka",
    url: "https://www.sinkka.fi/",
    group: "Kerava",
    type: "Taide- ja museokeskus",
    municipality: "Kerava",
    specialty: "Taide ja paikallishistoria"
  },
  {
    name: "Halosenniemi",
    url: "https://www.halosenniemi.fi/",
    group: "Tuusula",
    type: "Kotimuseo",
    municipality: "Tuusula",
    municipalities: ["Kerava", "Tuusula", "Järvenpää"],
    specialty: "Taide ja kulttuurihistoria"
  },
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
    url: "https://www.helsinki.fi/fi/luomus",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Luonnontieteet"
  },
  {
    name: "Suomen merimuseo",
    url: "https://www.kansallismuseo.fi/fi/suomenmerimuseo",
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
    url: "https://admuseo.fi/",
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
    url: "https://tahto.com/",
    group: "Helsinki",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Helsinki",
    specialty: "Urheilu"
  },
  {
    name: "Suomen pelimuseo",
    url: "https://www.vapriikki.fi/nayttelyt/suomen-pelimuseo-nayttelyt/",
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
    url: "https://www.tyovaenmuseo.fi/",
    group: "Tampere",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Tampere",
    specialty: "Työväenhistoria"
  },
  {
    name: "Suomen mediamuseo Rupriikki",
    url: "https://www.postimuseo.fi/tiedotteet/postimuseo-ja-tampereen-historialliset-museot-saivat-yhdessa-valtakunnallisen-vastuumuseotehtavan/",
    group: "Tampere",
    type: "Valtakunnallinen vastuumuseo",
    area: "Koko Suomi",
    municipality: "Tampere",
    specialty: "Media"
  },
  {
    name: "Suomen kello- ja korumuseo",
    url: "https://www.museokruunu.fi/",
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
    url: "https://www.hameenlinnantaidemuseo.fi/",
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
    url: "https://ouluntaidemuseo.fi/",
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
    url: "https://www.vaasa.fi/koe-ja-nae/kulttuuria-vaasassa-ja-seudulla/vaasan-museot/pohjanmaan-museo/",
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
    url: "https://www.lappeenranta.fi/fi/kulttuuri-ja-liikunta/lappeenrannan-museot/museot/lappeenrannan-taidemuseo",
    group: "Lappeenranta",
    type: "Alueellinen vastuumuseo",
    area: "Etelä-Karjala ja Kymenlaakso",
    municipality: "Lappeenranta",
    specialty: "Taide"
  },
  {
    name: "Satakunnan museo",
    url: "https://satakunnanmuseo.pori.fi/",
    group: "Pori",
    type: "Alueellinen vastuumuseo",
    area: "Satakunta",
    municipality: "Pori",
    specialty: "Kulttuurihistoria"
  },
  {
    name: "Aboa Vetus & Ars Nova",
    url: "https://avan.fi/",
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
    url: "https://www.kansallismuseo.fi/fi/seurasaarenulkomuseo",
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
    municipalities: ["Kerava", "Tuusula", "Järvenpää"],
    specialty: "Musiikki ja kulttuurihistoria"
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
    url: "https://ouluntaidemuseo.fi/",
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
    url: "https://suomenkansallismuseo.fi/kohde/hameen-linna/",
    group: "Hämeenlinna",
    type: "Paikallismuseo",
    area: "Kanta-Häme",
    municipality: "Hämeenlinna",
    specialty: "Historia"
  },
  {
    name: "Rovaniemen taidemuseo",
    url: "https://korundi.fi/fi/kavijalle/rovaniemen-taidemuseo",
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
