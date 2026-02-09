
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
  "Elämä on tässä ja nyt.",
  "Ole oma itsesi, kaikki muut on jo varattu.",
  "Sydän on viisas opas matkalla.",
  "Pienet askeleet vievät suuriin kohteisiin.",
  "Ilo on sielun aurinkoa.",
  "Rauha alkaa sisältäpäin.",
  "Ystävyys on elämän suola.",
  "Kauneus on katsojan silmässä ja sydämessä.",
  "Anna jokaiselle päivälle mahdollisuus olla elämäsi kaunein.",
  "Viisaus on hiljaisuutta ja kuuntelua.",
  "Hyvyys on kieli, jota kuurot kuulevat ja sokeat näkevät.",
  "Eilinen on historiaa, huominen arvoitus, tämä päivä lahja.",
  "Nauru pidentää ikää ja lämmittää mieltä.",
  "Tee tänään jotain, mistä tulevaisuuden itsesi kiittää.",
  "Kiitollisuus muuttaa sen mitä meillä on, riittäväksi.",
  "Yksinkertaisuus on äärimmäistä hienostuneisuutta.",
  "Mitä enemmän annat, sitä enemmän saat.",
  "Toivo on ankkuri, joka pitää myrskyssä.",
  "Aika on kalleinta mitä meillä on.",
  "Kukki siellä, missä sinut on istutettu.",
  "Elämä on matka, ei määränpää.",
  "Suurin ilo on antaa iloa toisille."
];

export const SHORTCUTS: Shortcut[] = [
  { 
    name: 'Apua digiin', 
    icon: '💻', 
    color: 'bg-teal-600',
    providers: [
      { name: 'SeniorSurf - Opastuspaikat', url: 'https://seniorsurf.fi/opastuspaikat/' },
      { name: 'SeniorSurf - Etäopastus', url: 'https://seniorsurf.fi/etaopastus/' },
      { name: 'Digitreenit (Yle)', url: 'https://yle.fi/aihe/digitreenit' },
      { name: 'Mukanetti', url: 'https://www.mukanetti.net' },
      { name: 'Enter ry', url: 'https://www.entery.fi' },
      { name: 'Savonetti', url: 'https://www.savonetti.fi' },
      { name: 'Verkosta Virtaa', url: 'https://www.elakeliitto.fi/tekemista/verkosta-virtaa' }
    ]
  },
  { 
    name: 'Hengellisyys', 
    icon: '⛪', 
    color: 'bg-amber-600',
    url: 'https://eerotuomenoksa.github.io/seniorin-aloitussivu/hengellisyys.html'
  },
  { 
    name: 'Julkiset palvelut', 
    icon: '🏛️', 
    color: 'bg-slate-600',
    providers: [
      { name: 'Suomi.fi', url: 'https://www.suomi.fi' },
      { name: 'Kela', url: 'https://www.kela.fi' },
      { name: 'Vero.fi', url: 'https://www.vero.fi' },
      { name: 'Poliisi', url: 'https://poliisi.fi' },
      { name: 'Digi- ja väestötietovirasto', url: 'https://dvv.fi' }
    ]
  },
  { 
    name: 'Kielet', 
    icon: '🗣️', 
    color: 'bg-rose-600',
    providers: [
      { name: 'Sanakirja.fi', url: 'https://www.sanakirja.fi' },
      { name: 'Kielitoimiston sanakirja', url: 'https://www.kielitoimistonsanakirja.fi' },
      { name: 'Duolingo', url: 'https://www.duolingo.com' },
      { name: 'Google Kääntäjä', url: 'https://translate.google.fi' }
    ]
  },
  { 
    name: 'Kirjallisuus', 
    icon: '📖', 
    color: 'bg-amber-800',
    providers: [
      { name: 'Kirjasampo', url: 'https://www.kirjasampo.fi' },
      { name: 'Lukulamppu', url: 'https://www.lukulamppu.fi' },
      { name: 'Adlibris', url: 'https://www.adlibris.com/fi' },
      { name: 'BookBeat', url: 'https://www.bookbeat.fi' },
      { name: 'Suomalainen Kirjakauppa', url: 'https://www.suomalainen.com' }
    ]
  },
  { 
    name: 'Kirjastot', 
    icon: '📚', 
    color: 'bg-emerald-600',
    providers: [
      { name: 'Kirjastot.fi (Haku)', url: 'https://www.kirjastot.fi' },
      { name: 'Celia - Saavutettava kirjasto', url: 'https://www.celia.fi/' },
      { name: 'Helmet (PK-seutu)', url: 'https://www.helmet.fi' },
      { name: 'PIKI (Tampereen seutu)', url: 'https://piki.finna.fi' },
      { name: 'Finna.fi - Kansallinen haku', url: 'https://www.finna.fi' }
    ]
  },
  { 
    name: 'Koti', 
    icon: '🏠', 
    color: 'bg-stone-600',
    providers: [
      { name: 'Martat', url: 'https://www.martat.fi' },
      { name: 'Puutarha.net', url: 'https://puutarha.net' },
      { name: 'Meillä kotona', url: 'https://www.meillakotona.fi' },
      { name: 'Kotiliesi', url: 'https://kotiliesi.fi' },
      { name: 'Etuovi.com', url: 'https://www.etuovi.com' }
    ]
  },
  { 
    name: 'Kulttuuri', 
    icon: '🎭', 
    color: 'bg-pink-600',
    providers: [
      { name: 'Museot.fi - Museokortti', url: 'https://www.museot.fi' },
      { name: 'Kansallisooppera ja -baletti', url: 'https://oopperabaletti.fi' },
      { name: 'Kansallisteatteri', url: 'https://kansallisteatteri.fi' },
      { name: 'Lippu.fi', url: 'https://www.lippu.fi' }
    ]
  },
  { 
    name: 'Liikenne', 
    icon: '🚌', 
    color: 'bg-orange-500',
    providers: [
      { name: 'VR - Junat', url: 'https://www.vr.fi', group: 'Junat' },
      { name: 'Matkahuolto', url: 'https://www.matkahuolto.fi', group: 'Linja-autot' },
      { name: 'Tallink Silja', url: 'https://www.tallinksilja.fi', group: 'Laivat' },
      { name: 'HSL Reittiopas', url: 'https://www.reittiopas.fi', group: 'Paikallisliikenne' }
    ]
  },
  { 
    name: 'Luonto', 
    icon: '🌲', 
    color: 'bg-green-700',
    providers: [
      { name: 'Luontoon.fi', url: 'https://www.luontoon.fi' },
      { name: 'Retkipaikka.fi', url: 'https://retaikka.fi' },
      { name: 'Ympäristö.fi', url: 'https://www.ymparisto.fi' }
    ]
  },
  { 
    name: 'Matkailu', 
    icon: '✈️', 
    color: 'bg-sky-600',
    providers: [
      { name: 'Finnair', url: 'https://www.finnair.com/fi-fi' },
      { name: 'Aurinkomatkat', url: 'https://www.aurinkomatkat.fi' },
      { name: 'Tjäreborg', url: 'https://www.tjareborg.fi' },
      { name: 'Booking.com', url: 'https://www.booking.com' }
    ]
  },
  { 
    name: 'Musiikki', 
    icon: '🎵', 
    color: 'bg-fuchsia-600',
    providers: [
      { name: 'Spotify', url: 'https://open.spotify.com' },
      { name: 'Radio Suomi', url: 'https://areena.yle.fi/radio/ohjelmat/57-ww2X6pX0Y' },
      { name: 'YouTube Music', url: 'https://music.youtube.com' }
    ]
  },
  { 
    name: 'Oikeus', 
    icon: '⚖️', 
    color: 'bg-gray-700',
    providers: [
      { name: 'Oikeus.fi', url: 'https://oikeus.fi' },
      { name: 'Kuluttajaneuvonta', url: 'https://www.kkv.fi/kuluttajaneuvonta/' },
      { name: 'Eduskunta', url: 'https://www.eduskunta.fi' },
      { name: 'Finlex', url: 'https://www.finlex.fi' }
    ]
  },
  { 
    name: 'Pankit', 
    icon: '🏦', 
    color: 'bg-indigo-600',
    providers: [
      { name: 'OP', url: 'https://www.op.fi' },
      { name: 'Nordea', url: 'https://www.nordea.fi' },
      { name: 'S-Pankki', url: 'https://www.s-pankki.fi' },
      { name: 'Danske Bank', url: 'https://danskebank.fi' }
    ]
  },
  { 
    name: 'Ruoka', 
    icon: '🥘', 
    color: 'bg-orange-700',
    providers: [
      { name: 'K-Ruoka - Reseptit', url: 'https://www.k-ruoka.fi/reseptit' },
      { name: 'Yhteishyvä - Ruoka', url: 'https://yhteishyva.fi/ruoka' },
      { name: 'Valio - Reseptit', url: 'https://www.valio.fi/reseptit/' }
    ]
  },
  { 
    name: 'Sosiaalinen media', 
    icon: '💬', 
    color: 'bg-cyan-600',
    providers: [
      { name: 'WhatsApp', url: 'https://web.whatsapp.com' },
      { name: 'Facebook', url: 'https://www.facebook.com' },
      { name: 'Instagram', url: 'https://www.instagram.com' }
    ]
  },
  { 
    name: 'Sovellukset', 
    icon: '📱', 
    color: 'bg-neutral-600',
    providers: [
      { name: 'Play kauppa (Android)', url: 'https://play.google.com/store' },
      { name: 'Appstore (Apple)', url: 'https://www.apple.com/fi/app-store/' },
      { name: 'Microsoft Store (Windows)', url: 'https://apps.microsoft.com/home' }
    ]
  },
  { 
    name: 'Sukututkimus', 
    icon: '🌳', 
    color: 'bg-amber-700',
    providers: [
      { name: 'Sukuhistoria.fi', url: 'https://www.sukuhistoria.fi' },
      { name: 'Kansallisarkisto', url: 'https://astia.narc.fi' },
      { name: 'MyHeritage', url: 'https://www.myheritage.fi' }
    ]
  },
  { 
    name: 'Sähköposti', 
    icon: '✉️', 
    color: 'bg-blue-500',
    providers: [
      { name: 'Gmail', url: 'https://mail.google.com' },
      { name: 'Outlook / Hotmail', url: 'https://outlook.live.com' },
      { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' }
    ]
  },
  { 
    name: 'Sää', 
    icon: '🌤️', 
    color: 'bg-yellow-500',
    providers: [
      { name: 'Ilmatieteen laitos', url: 'https://www.ilmatieteenlaitos.fi' },
      { name: 'Foreca', url: 'https://www.foreca.fi' }
    ]
  },
  { 
    name: 'Taiteet', 
    icon: '🎨', 
    color: 'bg-violet-600',
    providers: [
      { name: 'Ateneum', url: 'https://ateneum.fi' },
      { name: 'Kiasma', url: 'https://kiasma.fi' },
      { name: 'HAM', url: 'https://www.hamhelsinki.fi' }
    ]
  },
  { 
    name: 'Tekniikka', 
    icon: '⚙️', 
    color: 'bg-zinc-700',
    providers: [
      { name: 'Tekniikan Maailma', url: 'https://tekniikanmaailma.fi' },
      { name: 'Mikrobitti', url: 'https://www.mikrobitti.fi' },
      { name: 'Digitoday', url: 'https://www.is.fi/digitoday/' }
    ]
  },
  { 
    name: 'Terveys', 
    icon: '🏥', 
    color: 'bg-red-500',
    providers: [
      { name: 'OmaKanta', url: 'https://www.kanta.fi/omakanta' },
      { name: 'Terveyskylä', url: 'https://www.terveyskyla.fi' },
      { name: 'Apteekki.fi', url: 'https://www.apteekki.fi' }
    ]
  },
  { 
    name: 'Tiede', 
    icon: '🧪', 
    color: 'bg-purple-600',
    providers: [
      { name: 'Tiede-lehti', url: 'https://www.tiede.fi' },
      { name: 'Ursa - Tähtitaivas', url: 'https://www.ursa.fi' }
    ]
  },
  { 
    name: 'Turvallisuus', 
    icon: '🛡️', 
    color: 'bg-orange-600',
    providers: [
      { name: 'Huijausinfo', url: 'https://www.kuluttajaliitto.fi/hankkeet/huijausinfo/' },
      { name: 'Poliisi', url: 'https://poliisi.fi/asioi-verkossa' }
    ]
  },
  { 
    name: 'Urheilu', 
    icon: '⚽', 
    color: 'bg-green-600',
    providers: [
      { name: 'Yle Urheilu', url: 'https://yle.fi/urheilu' },
      { name: 'Liiga.fi', url: 'https://liiga.fi' },
      { name: 'Teksti-TV', url: 'https://yle.fi/tekstitv/201' }
    ]
  },
  { 
    name: 'Uutiset & Media', 
    icon: '📰', 
    color: 'bg-slate-800',
    providers: [
      { name: 'Yle Uutiset', url: 'https://yle.fi/uutiset' },
      { name: 'Helsingin Sanomat', url: 'https://www.hs.fi' },
      { name: 'Ilta-Sanomat', url: 'https://www.is.fi' }
    ]
  },
  { 
    name: 'Vapaa-aika', 
    icon: '🧶', 
    color: 'bg-pink-500',
    providers: [
      { name: 'Eläkeliitto', url: 'https://www.elakeliitto.fi' },
      { name: 'Martat', url: 'https://www.martat.fi' },
      { name: 'Veikkaus', url: 'https://www.veikkaus.fi' }
    ]
  },
  { 
    name: 'Verkkokaupat', 
    icon: '🛒', 
    color: 'bg-indigo-700',
    providers: [
      { name: 'Tori.fi', url: 'https://www.tori.fi' },
      { name: 'Prisma.fi', url: 'https://www.prisma.fi' },
      { name: 'Zalando', url: 'https://www.zalando.fi' }
    ]
  },
  { 
    name: 'Viihde', 
    icon: '🍿', 
    color: 'bg-red-600',
    providers: [
      { name: 'Yle Areena', url: 'https://areena.yle.fi' },
      { name: 'Netflix', url: 'https://www.netflix.com/fi/' },
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
