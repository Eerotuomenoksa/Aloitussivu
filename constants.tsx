
import { Shortcut, NewsItem } from './types';

export const QUOTES = [
  "Jokainen päivä on uusi mahdollisuus.",
  "Pieni hymy kantaa pitkälle.",
  "Onni löytyy usein arjen pienistä hetkistä.",
  "Jokainen hetki on arvokas lahja.",
  "Mieli on kuin puutarha: mitä kylvät, sitä niität.",
  "Ystävällinen sana ei maksa mitään, mutta antaa paljon.",
  "Luonto on paras lääke mielenrauhaan.",
  "Tänään on hyvä päivä olla kiitollinen.",
  "Rohkeus on sitä, että tekee vaikka pelottaa.",
  "Elämä on tässä ja nyt."
];

// Värit: bg-brand-indigo, bg-brand-purple, bg-brand-orange, bg-brand-cyan, bg-brand-teal, bg-brand-grey

export const SHORTCUTS: Shortcut[] = [
  { 
    name: 'Apua digiin', icon: '💻', color: 'bg-brand-indigo',
    providers: [
      { name: 'Savonetti', url: 'https://www.savonetti.fi' },
      { name: 'Joen Severi', url: 'https://www.joenseveri.fi' },
      { name: 'Verkosta virtaa', url: 'https://verkostavirtaa.fi' },
      { name: 'HelsinkiMissio digituki', url: 'https://www.helsinkimissio.fi/apua-ja-tukea/seniorit/digituki/' },
      { name: 'SeniorSurf - Opastuspaikat', url: 'https://seniorsurf.fi/opastuspaikat/' },
      { name: 'Enter ry - Digiopastusta', url: 'https://www.entery.fi' },
      { name: 'Mukanetti - ATK-apua', url: 'https://www.mukanetti.net' },
      { name: 'Digitreenit (Yle)', url: 'https://yle.fi/aihe/digitreenit' }
    ]
  },
  { 
    name: 'Hengellisyys', icon: '⛪', color: 'bg-brand-purple',
    providers: [
      { name: 'Suomen ev.lut. kirkko', url: 'https://evl.fi' },
      { name: 'Kirkko ja kaupunki', url: 'https://www.kirkkojakaupunki.fi' },
      { name: 'Radio Dei', url: 'https://www.radiodei.fi' },
      { name: 'Raamattu.fi', url: 'https://raamattu.fi' }
    ]
  },
  { 
    name: 'Julkiset palvelut', icon: '🏛️', color: 'bg-brand-grey',
    providers: [
      { name: 'Suomi.fi', url: 'https://www.suomi.fi' },
      { name: 'Kela', url: 'https://www.kela.fi' },
      { name: 'Vero.fi', url: 'https://www.vero.fi' },
      { name: 'Poliisi', url: 'https://poliisi.fi' },
      { name: 'Digi- ja väestötietovirasto', url: 'https://dvv.fi' }
    ]
  },
  { 
    name: 'Kielet', icon: '🗣️', color: 'bg-brand-purple',
    providers: [
      { name: 'Google Kääntäjä', url: 'https://translate.google.fi' },
      { name: 'Sanakirja.fi', url: 'https://www.sanakirja.fi' },
      { name: 'Duolingo', url: 'https://www.duolingo.com' }
    ]
  },
  { 
    name: 'Kirjallisuus', icon: '📖', color: 'bg-brand-teal',
    providers: [
      { name: 'Kirjasampo', url: 'https://www.kirjasampo.fi' },
      { name: 'Sähköiset kirjat (Ellibs)', url: 'https://www.ellibs.com/fi/' },
      { name: 'BookBeat', url: 'https://www.bookbeat.fi' },
      { name: 'Adlibris', url: 'https://www.adlibris.com' }
    ]
  },
  { 
    name: 'Kirjastot', icon: '📚', color: 'bg-brand-teal',
    providers: [
      { name: 'Kirjastot.fi', url: 'https://www.kirjastot.fi' },
      { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi' },
      { name: 'Finna.fi', url: 'https://www.finna.fi' },
      { name: 'Celia-äänikirjat', url: 'https://www.celia.fi' }
    ]
  },
  { 
    name: 'Koti', icon: '🏠', color: 'bg-brand-grey',
    providers: [
      { name: 'Etuovi', url: 'https://www.etuovi.com' },
      { name: 'Oikotie Asunnot', url: 'https://asunnot.oikotie.fi' },
      { name: 'Martat - Kodinhoito', url: 'https://www.martat.fi/marttakoulu/kodinhoito/' }
    ]
  },
  { 
    name: 'Kulttuuri', icon: '🎭', color: 'bg-brand-orange',
    providers: [
      { name: 'Museokortti', url: 'https://www.museot.fi' },
      { name: 'Lippu.fi', url: 'https://www.lippu.fi' },
      { name: 'Tiketti', url: 'https://www.tiketti.fi' },
      { name: 'Kansallisooppera', url: 'https://oopperabaletti.fi' }
    ]
  },
  { 
    name: 'Liikenne', icon: '🚌', color: 'bg-brand-cyan',
    providers: [
      { name: 'Taksi Helsinki', url: 'https://taksihelsinki.fi', group: 'Taksit' },
      { name: 'Lähitaksi', url: 'https://www.lahitaksi.fi', group: 'Taksit' },
      { name: 'Menevä Taksi', url: 'https://meneva.fi', group: 'Taksit' },
      { name: '02 Taksi', url: 'https://02taksi.fi', group: 'Taksit' },
      { name: 'VR - Junat', url: 'https://www.vr.fi', group: 'Matkustus' },
      { name: 'Matkahuolto', url: 'https://www.matkahuolto.fi', group: 'Matkustus' },
      { name: 'OnniBus', url: 'https://www.onnibus.com', group: 'Matkustus' },
      { name: 'HSL Reittiopas', url: 'https://www.reittiopas.fi', group: 'Reittioppaat' }
    ]
  },
  { 
    name: 'Luonto', icon: '🌲', color: 'bg-brand-teal',
    providers: [
      { name: 'Luontoon.fi', url: 'https://www.luontoon.fi' },
      { name: 'Retkipaikka', url: 'https://retkipaikka.fi' },
      { name: 'Luontoportti', url: 'https://www.luontoportti.com' },
      { name: 'Metsähallitus', url: 'https://www.metsa.fi' }
    ]
  },
  { 
    name: 'Matkailu', icon: '✈️', color: 'bg-brand-orange',
    providers: [
      { name: 'Aurinkomatkat', url: 'https://www.aurinkomatkat.fi' },
      { name: 'Tjäreborg', url: 'https://www.tjareborg.fi' },
      { name: 'Momondo', url: 'https://www.momondo.fi' },
      { name: 'Rantapallo', url: 'https://www.rantapallo.fi' }
    ]
  },
  { 
    name: 'Musiikki', icon: '🎵', color: 'bg-brand-orange',
    providers: [
      { name: 'Spotify', url: 'https://open.spotify.com' },
      { name: 'Yle Areena Musiikki', url: 'https://areena.yle.fi/audio' },
      { name: 'YouTube Musiikki', url: 'https://music.youtube.com' },
      { name: 'Radio.fi', url: 'https://www.radio.fi' }
    ]
  },
  { 
    name: 'Oikeus', icon: '⚖️', color: 'bg-brand-grey',
    providers: [
      { name: 'Oikeus.fi', url: 'https://oikeus.fi' },
      { name: 'Kuluttajaneuvonta', url: 'https://www.kkv.fi/kuluttajaneuvonta/' },
      { name: 'Eduskunnan oikeusasiamies', url: 'https://www.oikeusasiamies.fi' },
      { name: 'Tietosuojavaltuutettu', url: 'https://tietosuoja.fi' }
    ]
  },
  { 
    name: 'Pankit', icon: '🏦', color: 'bg-brand-indigo',
    providers: [
      { name: 'OP - Osuuspankki', url: 'https://www.op.fi' },
      { name: 'Nordea', url: 'https://www.nordea.fi' },
      { name: 'S-Pankki', url: 'https://www.s-pankki.fi' },
      { name: 'Danske Bank', url: 'https://danskebank.fi' },
      { name: 'Aktia', url: 'https://www.aktia.fi' },
      { name: 'Handelsbanken', url: 'https://www.handelsbanken.fi' },
      { name: 'Säästöpankki', url: 'https://www.saastopankki.fi' },
      { name: 'POP Pankki', url: 'https://www.poppankki.fi' }
    ]
  },
  { 
    name: 'Ruoka', icon: '🥘', color: 'bg-brand-orange',
    providers: [
      { name: 'K-Ruoka', url: 'https://www.k-ruoka.fi' },
      { name: 'S-Kaupat', url: 'https://www.s-kaupat.fi' },
      { name: 'Yhteishyvä Reseptit', url: 'https://yhteishyva.fi' },
      { name: 'Valio Reseptit', url: 'https://www.valio.fi/reseptit/' },
      { name: 'Kotikokki', url: 'https://www.kotikokki.net' }
    ]
  },
  { 
    name: 'Sosiaalinen media', icon: '💬', color: 'bg-brand-indigo',
    providers: [
      { name: 'Facebook', url: 'https://www.facebook.com' },
      { name: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
      { name: 'Instagram', url: 'https://www.instagram.com' },
      { name: 'X (Twitter)', url: 'https://www.x.com' }
    ]
  },
  { 
    name: 'Sovellukset', icon: '📱', color: 'bg-brand-indigo',
    providers: [
      { name: 'Google Play Kauppa', url: 'https://play.google.com' },
      { name: 'App Store (Apple)', url: 'https://www.apple.com/fi/app-store/' },
      { name: 'Huawei AppGallery', url: 'https://appgallery.huawei.com' }
    ]
  },
  { 
    name: 'Sukututkimus', icon: '🌳', color: 'bg-brand-teal',
    providers: [
      { name: 'MyHeritage', url: 'https://www.myheritage.fi' },
      { name: 'Sukuhaku', url: 'https://www.genealogia.fi' },
      { name: 'Kansallisarkisto', url: 'https://arkisto.fi' },
      { name: 'Suomen Sukututkimusseura', url: 'https://www.genealogia.fi' }
    ]
  },
  { 
    name: 'Sähköposti', icon: '✉️', color: 'bg-brand-cyan',
    providers: [
      { name: 'Gmail', url: 'https://mail.google.com' },
      { name: 'Outlook / Hotmail', url: 'https://outlook.live.com' },
      { name: 'Suomi24 Posti', url: 'https://posti.suomi24.fi' },
      { name: 'Telia Sähköposti', url: 'https://webmail.teliatunnus.fi' }
    ]
  },
  { 
    name: 'Sää', icon: '☀️', color: 'bg-brand-cyan',
    providers: [
      { name: 'Ilmatieteen laitos', url: 'https://www.ilmatieteenlaitos.fi' },
      { name: 'Foreca', url: 'https://www.foreca.fi' },
      { name: 'Yle Sää', url: 'https://yle.fi/saa' }
    ]
  },
  { 
    name: 'Taiteet', icon: '🎨', color: 'bg-brand-orange',
    providers: [
      { name: 'Ateneum', url: 'https://ateneum.fi' },
      { name: 'Kiasma', url: 'https://kiasma.fi' },
      { name: 'Taidehalli', url: 'https://taidehalli.fi' },
      { name: 'Amos Rex', url: 'https://amosrex.fi' }
    ]
  },
  { 
    name: 'Tekniikka', icon: '⚙️', color: 'bg-brand-cyan',
    providers: [
      { name: 'Tekniikan Maailma', url: 'https://tekniikanmaailma.fi' },
      { name: 'Mikrobitti', url: 'https://www.mikrobitti.fi' },
      { name: 'Tivi', url: 'https://www.tivi.fi' },
      { name: 'Digitreenit (Yle)', url: 'https://yle.fi/aihe/digitreenit' }
    ]
  },
  { 
    name: 'Terveys', icon: '🏥', color: 'bg-brand-teal',
    providers: [
      { name: 'OmaKanta', url: 'https://www.kanta.fi/omakanta' },
      { name: 'Terveyskylä', url: 'https://www.terveyskyla.fi' },
      { name: 'Terveyskirjasto', url: 'https://www.terveyskirjasto.fi' },
      { name: 'Apteekki.fi', url: 'https://www.apteekki.fi' },
      { name: 'Mehiläinen', url: 'https://www.mehilainen.fi' },
      { name: 'Terveystalo', url: 'https://www.terveystalo.com' }
    ]
  },
  { 
    name: 'Tiede', icon: '🧪', color: 'bg-brand-purple',
    providers: [
      { name: 'Tiede-lehti', url: 'https://www.tiede.fi' },
      { name: 'Tieteen Kuvalehti', url: 'https://tieku.fi' },
      { name: 'Tiedeykkönen (Yle)', url: 'https://areena.yle.fi/audio/1-1466035' }
    ]
  },
  { 
    name: 'Turvallisuus', icon: '🛡️', color: 'bg-brand-orange',
    providers: [
      { name: 'Kyberturvallisuuskeskus', url: 'https://www.kyberturvallisuuskeskus.fi' },
      { name: '112.fi - Hätäkeskus', url: 'https://112.fi' },
      { name: 'Poliisi', url: 'https://poliisi.fi' },
      { name: 'Pelastustoimi', url: 'https://pelastustoimi.fi' }
    ]
  },
  { 
    name: 'Urheilu', icon: '⚽', color: 'bg-brand-teal',
    providers: [
      { name: 'Yle Urheilu', url: 'https://yle.fi/urheilu' },
      { name: 'Iltalehti Urheilu', url: 'https://www.iltalehti.fi/urheilu' },
      { name: 'MTV Urheilu', url: 'https://www.mtv.fi/urheilu' },
      { name: 'Tulospalvelu.fi', url: 'https://www.tulospalvelu.fi' }
    ]
  },
  { 
    name: 'Uutiset & Media', icon: '📰', color: 'bg-brand-grey',
    providers: [
      { name: 'Yle Uutiset', url: 'https://yle.fi/uutiset' },
      { name: 'Helsingin Sanomat', url: 'https://www.hs.fi' },
      { name: 'Ilta-Sanomat', url: 'https://www.is.fi' },
      { name: 'Iltalehti', url: 'https://www.iltalehti.fi' },
      { name: 'Maaseudun Tulevaisuus', url: 'https://www.maaseuduntulevaisuus.fi' }
    ]
  },
  { 
    name: 'Vapaa-aika', icon: '🎈', color: 'bg-brand-orange',
    providers: [
      { name: 'Kansalaisopistot', url: 'https://kansalaisopistot.fi' },
      { name: 'Martat', url: 'https://www.martat.fi' },
      { name: 'Suomen Latu', url: 'https://www.suomenlatu.fi' },
      { name: 'Suomi.fi harrastushaku', url: 'https://www.suomi.fi/palvelut/harrastushaku' }
    ]
  },
  { 
    name: 'Verkkokaupat', icon: '🛒', color: 'bg-brand-orange',
    providers: [
      { name: 'Tori.fi', url: 'https://www.tori.fi' },
      { name: 'Prisma.fi', url: 'https://www.prisma.fi' },
      { name: 'K-Ruoka Kauppa', url: 'https://www.k-ruoka.fi/kauppa' },
      { name: 'Tokmanni', url: 'https://www.tokmanni.fi' },
      { name: 'Zalando', url: 'https://www.zalando.fi' }
    ]
  },
  { 
    name: 'Viihde', icon: '🍿', color: 'bg-brand-orange',
    providers: [
      { name: 'Yle Areena', url: 'https://areena.yle.fi' },
      { name: 'MTV Katsomo', url: 'https://www.mtv.fi' },
      { name: 'Ruutu', url: 'https://www.ruutu.fi' },
      { name: 'YouTube', url: 'https://www.youtube.com' }
    ]
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    category: "Kotimaa",
    time: "10:30",
    title: "Uusia ulkoilureittejä avattu senioreille",
    summary: "Kaupunki on panostanut esteettömyyteen ja lisännyt penkkejä suosittujen puistojen varsille."
  }
];
