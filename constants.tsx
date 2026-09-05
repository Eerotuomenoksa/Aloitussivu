
import { Shortcut, NewsItem } from './types';
import { LOCAL_NEWSPAPER_LINKS } from './localNewspaperLinks';
import { MUSEUM_LINKS, PATIENT_ASSOCIATION_LINKS, SENIOR_ASSOCIATION_LINKS } from './communityLinks';
import { MUNICIPALITY_EXERCISE_LINKS } from './localExerciseLinks';
import { MUNICIPALITY_SENIOR_LINKS } from './localSeniorLinks';

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

// Värit: bg-[#173e5f], bg-brand-orange, bg-brand-cyan, bg-brand-teal, bg-brand-grey

export const SHORTCUTS: Shortcut[] = [
  { 
    name: 'Apua digiin', icon: '💻', color: 'bg-[#173e5f]',
    providers: [
      { name: 'Yle Digitreenit', url: 'https://yle.fi/aihe/digitreenit' },
      { name: 'DigiUp Toolbox', url: 'https://www.digiuptoolbox.com/' },
      { name: 'Suomi.fi ohjeet', url: 'https://www.suomi.fi/ohjeet-ja-tuki' },
      { name: 'Savonetti', url: 'https://www.savonetti.fi' },
      { name: 'Joen Severi', url: 'https://sites.google.com/site/joenseveriyhdistys/' },
      { name: 'Verkosta virtaa', url: 'https://verkostavirtaa.fi' },
      { name: 'HelsinkiMissio digituki', url: 'https://www.helsinkimissio.fi/apua-ja-tukea/seniorit/digituki/' },
      { name: 'SeniorSurf - Opastuspaikat', url: 'https://seniorsurf.fi/opastuspaikat/' },
      { name: 'Enter ry - Digiopastusta', url: 'https://www.entersenior.fi/' },
      { name: 'Mukanetti - ATK-apua', url: 'https://www.mukanetti.net' }
    ]
  },
  { 
    name: 'Hengellisyys', icon: '⛪', color: 'bg-[#173e5f]',
    providers: [
      { name: 'Ortodoksinen kirkko', url: 'https://www.ort.fi' },
      { name: 'Kirkon keskusteluapu', url: 'https://evl.fi/apua-ja-tukea/kirkon-keskusteluapu/' },
      { name: 'TV7', url: 'https://www.tv7.fi' },
      { name: 'Patmos', url: 'https://www.patmos.fi' },
      { name: 'Suomen ev.lut. kirkko', url: 'https://evl.fi' },
      { name: 'Kirkko ja kaupunki', url: 'https://www.kirkkojakaupunki.fi' },
      { name: 'Radio Dei', url: 'https://deiplus.fi/radiot' },
      { name: 'Raamattu.fi', url: 'https://raamattu.fi' },
      { name: 'Helsingin juutalainen seurakunta', url: 'https://jchelsinki.fi/', group: 'Uskonnolliset vähemmistöt' },
      { name: 'Suomen Muslimifoorumi - muslimiyhteisöjä', url: 'https://www.muslimifoorumi.fi/kopio-asiantuntijaverkostomme/', group: 'Uskonnolliset vähemmistöt' }
    ]
  },
  { 
    name: 'Julkiset palvelut', icon: '🏛️', color: 'bg-brand-grey',
    providers: [
      { name: 'Suomi.fi-palvelujen neuvonta', url: 'https://www.suomi.fi/ohjeet-ja-tuki/tuki-ja-neuvonta/kansalaisneuvonta', phone: '0295 000', phoneUrl: 'tel:0295000' },
      { name: 'Kela - eläkkeet ja eläkkeensaajan asumistuki', url: 'https://www.kela.fi/soita-kelaan', phone: '020 692 202', phoneUrl: 'tel:020692202' },
      { name: 'Vero.fi - verokortti ja ennakkovero', url: 'https://www.vero.fi/tietoa-verohallinnosta/yhteystiedot-ja-asiointi/soita/henkiloasiakkaat/', phone: '029 497 000', phoneUrl: 'tel:029497000' },
      { name: 'Traficomin vaihde', url: 'https://www.traficom.fi/fi/yhteystiedot/traficomin-puhelinvaihde-ja-kirjaamo', phone: '029 534 5000', phoneUrl: 'tel:0295345000' },
      { name: 'Poliisin valtakunnallinen neuvonta', url: 'https://poliisi.fi/neuvontapalvelu', phone: '0295 419 800', phoneUrl: 'tel:0295419800' },
      { name: 'DVV - holhous ja edunvalvonta', url: 'https://edunvalvonta.dvv.fi/', phone: '0295 536 256', phoneUrl: 'tel:0295536256' },
      { name: 'Tulli', url: 'https://www.tulli.fi/' },
      { name: 'InfoFinland - tietoa monella kielellä', url: 'https://www.infofinland.fi/fi/about-the-service', group: 'Omakielinen asiointi' },
      { name: 'Suomi.fi viittomakielellä', url: 'https://www.suomi.fi/muut-kielet/viittomakieli/kansalaiselle/opetus-ja-koulutus', group: 'Omakielinen asiointi' },
      { name: 'Kela viittomakielellä', url: 'https://www.kela.fi/web/sgn-fi/viittomakieli', group: 'Omakielinen asiointi' },
      { name: 'Suomen Pakolaisapu - Suomiluotsit', url: 'https://pakolaisapu.fi/suomiluotsit/', group: 'Omakielinen asiointi' }
    ]
  },
  {
    name: 'Puhelinnumerot', icon: '☎️', color: 'bg-brand-grey',
    providers: [
      { name: 'Hätänumero 112', url: 'https://112.fi/hatanumero112', group: 'Hätä ja terveys', phone: '112', phoneUrl: 'tel:112' },
      { name: 'Päivystysapu', url: 'https://116117.fi/', group: 'Hätä ja terveys', phone: '116117', phoneUrl: 'tel:116117' },
      { name: 'Myrkytystietokeskus', url: 'https://www.hus.fi/potilaalle/sairaalat-ja-toimipisteet/myrkytystietokeskus', group: 'Hätä ja terveys', phone: '0800 147 111', phoneUrl: 'tel:0800147111' },
      { name: 'Kela - eläkkeet ja eläkkeensaajan asumistuki', url: 'https://www.kela.fi/soita-kelaan/', group: 'Julkiset palvelut', phone: '020 692 202', phoneUrl: 'tel:020692202' },
      { name: 'Suomi.fi-palvelujen neuvonta', url: 'https://www.suomi.fi/ohjeet-ja-tuki/tuki-ja-neuvonta/kansalaisneuvonta', group: 'Julkiset palvelut', phone: '0295 000', phoneUrl: 'tel:0295000' },
      { name: 'Verohallinto - verokortti ja ennakkovero', url: 'https://www.vero.fi/tietoa-verohallinnosta/yhteystiedot-ja-asiointi/soita/henkiloasiakkaat/', group: 'Julkiset palvelut', phone: '029 497 000', phoneUrl: 'tel:029497000' },
      { name: 'Verohallinto - henkilöasiakkaan tuloverotus', url: 'https://www.vero.fi/tietoa-verohallinnosta/yhteystiedot-ja-asiointi/soita/henkiloasiakkaat/', group: 'Julkiset palvelut', phone: '029 497 002', phoneUrl: 'tel:029497002' },
      { name: 'DVV - holhous ja edunvalvonta', url: 'https://edunvalvonta.dvv.fi/', group: 'Julkiset palvelut', phone: '0295 536 256', phoneUrl: 'tel:0295536256' },
      { name: 'Poliisin valtakunnallinen neuvonta', url: 'https://poliisi.fi/neuvontapalvelu', group: 'Julkiset palvelut', phone: '0295 419 800', phoneUrl: 'tel:0295419800' },
      { name: 'Traficomin vaihde', url: 'https://www.traficom.fi/fi/yhteystiedot/traficomin-puhelinvaihde-ja-kirjaamo', group: 'Julkiset palvelut', phone: '029 534 5000', phoneUrl: 'tel:0295345000' },
      { name: 'Helsinki-info', url: 'https://www.hel.fi/fi/paatoksenteko-ja-hallinto/stoa-helsinki-info', group: 'Kunnat', phone: '09 310 11111', phoneUrl: 'tel:0931011111' },
      { name: 'Espoo-info', url: 'https://www.espoo.fi/fi/kaupunki-ja-paatoksenteko/espoon-kaupungin-yhteystiedot-ja-palaute', group: 'Kunnat', phone: '09 816 21', phoneUrl: 'tel:0981621' },
      { name: 'Vantaa-info', url: 'https://www.vantaa.fi/fi/kaupunki-ja-paatoksenteko/asiakaspalvelu', group: 'Kunnat', phone: '09 839 11', phoneUrl: 'tel:0983911' },
      { name: 'Turun kaupungin vaihde', url: 'https://www.turku.fi/kassapalvelut', group: 'Kunnat', phone: '02 330 000', phoneUrl: 'tel:02330000' },
      { name: 'Oulu10-asiakaspalvelu', url: 'https://www.ouka.fi/yhteystiedot-ja-palaute', group: 'Kunnat', phone: '08 558 558 00', phoneUrl: 'tel:0855855800' },
      { name: 'OP Keski-Suomi – seniorit ja erityistä tukea tarvitsevat', url: 'https://www.op.fi/osuuspankit/op-keski-suomi/pankin-palvelut/paikallista-asiakaspalvelua/', group: 'Pankit', phone: '010 252 9627', phoneUrl: 'tel:0102529627' },
      { name: 'OP henkilöasiakkaat', url: 'https://www.op.fi/henkiloasiakkaat/asiakaspalvelu/ota-yhteytta', group: 'Pankit', phone: '0100 0500', phoneUrl: 'tel:01000500' },
      { name: 'Nordea asiakaspalvelu ja seniorilinja', url: 'https://www.nordea.fi/henkiloasiakkaat/palvelumme/verkko-mobiilipalvelut/digineuvontaa.html', group: 'Pankit', phone: '0200 3000', phoneUrl: 'tel:02003000' },
      { name: 'Danske Bank - seniorit ja erityisryhmät', url: 'https://danskebank.fi/sinulle/asiakaspalvelu', group: 'Pankit', phone: '0200 25889', phoneUrl: 'tel:020025889' },
      { name: 'Danske Bank asiakaspalvelu', url: 'https://danskebank.fi/sinulle/asiakaspalvelu', group: 'Pankit', phone: '0200 2580', phoneUrl: 'tel:02002580' },
      { name: 'S-Pankki asiakaspalvelu', url: 'https://www.s-pankki.fi/fi/tiedotteet/2025/s-pankki-kehottaa-asiakaspalveluun-soittavia-tarkistamaan-puhelinnumeron/', group: 'Pankit', phone: '010 76 5800', phoneUrl: 'tel:010765800' },
      { name: 'Aktia henkilöasiakkaat', url: 'https://www.aktia.fi/fi/asiakaspalvelu', group: 'Pankit', phone: '010 247 010', phoneUrl: 'tel:010247010' },
      { name: 'Säästöpankki asiakaspalvelu', url: 'https://www.saastopankki.fi/fi-fi/asiakaspalvelu/yhteydenottokanavat/puhelinnumerot', group: 'Pankit', phone: '0100 5252', phoneUrl: 'tel:01005252' },
      { name: 'Ålandsbanken asiakaspalvelu', url: 'https://www.alandsbanken.fi/', group: 'Pankit', phone: '0204 292 920', phoneUrl: 'tel:0204292920' },
      { name: 'Pankkien yhteinen korttien sulkupalvelu', url: 'https://www.s-pankki.fi/fi/turvallisuus-s-pankissa/turvallinen-pankkiasiointi/', group: 'Pankkien sulkupalvelut', phone: '020 333', phoneUrl: 'tel:020333' },
      { name: 'OP kortin sulkupalvelu', url: 'https://www.op.fi/henkiloasiakkaat/paivittaiset/kortit/kortin-katoaminen', group: 'Pankkien sulkupalvelut', phone: '0100 0555', phoneUrl: 'tel:01000555' },
      { name: 'Aktia kortin sulkupalvelu', url: 'https://www.aktia.fi/fi/turvallisuus', group: 'Pankkien sulkupalvelut', phone: '0800 0 2477', phoneUrl: 'tel:080002477' },
      { name: 'Danske Bank kortin sulkupalvelu', url: 'https://danskebank.fi/sinulle/asiakaspalvelu/sulkupalvelu', group: 'Pankkien sulkupalvelut', phone: '0200 2585', phoneUrl: 'tel:02002585' },
      { name: 'S-Pankki pankkitunnusten sulku', url: 'https://www.s-pankki.fi/fi/turvallisuus-s-pankissa/turvallinen-pankkiasiointi/', group: 'Pankkien sulkupalvelut', phone: '09 6964 6820', phoneUrl: 'tel:0969646820' },
      { name: 'Ålandsbanken Internetkonttorin sulku', url: 'https://online.alandsbanken.fi/service/identify', group: 'Pankkien sulkupalvelut', phone: '09 696 468 00', phoneUrl: 'tel:0969646800' }
    ]
  },
  {
    name: 'Hakukoneet', icon: '🔎', color: 'bg-brand-cyan',
    providers: [
      { name: 'Google', url: 'https://www.google.fi/' },
      { name: 'Bing', url: 'https://www.bing.com/' },
      { name: 'YouTube', url: 'https://www.youtube.com' },
      { name: 'Wikipedia', url: 'https://fi.wikipedia.org/' },
      { name: 'Fonecta', url: 'https://www.fonecta.fi/' }
    ]
  },
  { 
    name: 'Kielet', icon: '🗣️', color: 'bg-[#173e5f]',
    providers: [
      { name: 'Kielitoimiston sanakirja', url: 'https://www.kielitoimistonsanakirja.fi' },
      { name: 'Sanakirja.fi', url: 'https://www.sanakirja.fi' },
      { name: 'DeepL kääntäjä', url: 'https://www.deepl.com' },
      { name: 'Google Kääntäjä', url: 'https://translate.google.fi' },
      { name: 'Duolingo', url: 'https://www.duolingo.com' },
      { name: 'Kuurojen Liitto - viittomakieliset', url: 'https://kuurojenliitto.fi/viittomakieliset/', group: 'Viittomakieli' },
      { name: 'Saamelaiskäräjät', url: 'https://samediggi.fi/', group: 'Saamen kielet' },
      { name: 'Saamelaiskäräjät - kääntäjät ja tulkit', url: 'https://samediggi.fi/kaantajat-ja-tulkit/', group: 'Saamen kielet' },
      { name: 'Karjalan Sivistysseura - karjalan kieli', url: 'https://www.karjalansivistysseura.fi/verkkoaineistot/karjalatietoa/karjalan-kieli/', group: 'Karjalan kieli' }
    ]
  },
  { 
    name: 'Kirjallisuus', icon: '📖', color: 'bg-brand-teal',
    providers: [
      { name: 'Kirjasampo', url: 'https://www.kirjasampo.fi' },
      { name: 'Project Gutenberg', url: 'https://www.gutenberg.org' },
      { name: 'Celia', url: 'https://www.celia.fi' },
      { name: 'Booky.fi', url: 'https://www.booky.fi' },
      { name: 'Antikvaari', url: 'https://www.antikvaari.fi' },
      { name: 'Sähköiset kirjat (Ellibs)', url: 'https://www.ellibs.com/fi/' },
      { name: 'BookBeat', url: 'https://www.bookbeat.com/fi/' },
      { name: 'Adlibris', url: 'https://www.adlibris.com' }
    ]
  },
  { 
    name: 'Kirjastot', icon: '📚', color: 'bg-brand-teal',
    providers: [
      { name: 'Finna', url: 'https://www.finna.fi' },
      { name: 'Kirjastot.fi', url: 'https://www.kirjastot.fi' },
      { name: 'Kirjastohakemisto', url: 'https://hakemisto.kirjastot.fi/' },
      { name: 'Helmet', url: 'https://helmet.finna.fi/' },
      { name: 'Celia-äänikirjat', url: 'https://www.celia.fi' }
    ]
  },
  { 
    name: 'Asuminen ja kodinhoito', icon: '🏠', color: 'bg-brand-grey',
    providers: [
      { name: 'Martat', url: 'https://www.martat.fi' },
      { name: 'Motiva', url: 'https://www.motiva.fi' },
      { name: 'Etuovi', url: 'https://www.etuovi.com' },
      { name: 'Oikotie Asunnot', url: 'https://asunnot.oikotie.fi' },
      { name: 'Martat - Kodinhoito', url: 'https://www.martat.fi/marttakoulu/kodinhoito/' },
      { name: 'Suomen kotikorjaukset', url: 'https://kotikorjaukset.fi/' }
    ]
  },
  { 
    name: 'Kulttuuri', icon: '🎭', color: 'bg-brand-orange',
    providers: [
      { name: 'Museot.fi', url: 'https://www.museot.fi' },
      { name: 'Kansallisgalleria', url: 'https://www.kansallisgalleria.fi' },
      { name: 'Lippu.fi', url: 'https://www.lippu.fi' },
      { name: 'Tiketti', url: 'https://www.tiketti.fi' },
      { name: 'Kansallisooppera', url: 'https://oopperabaletti.fi' }
    ]
  },
  {
    name: 'Museot', icon: '🖼️', color: 'bg-brand-orange',
    providers: MUSEUM_LINKS
  },
  {
    name: 'Teatterit', icon: '🎟️', color: 'bg-[#173e5f]',
    providers: [
      { name: 'Åbo Svenska Teater', url: 'https://www.abosvenskateater.fi/sv/start/', group: 'Turku' },
      { name: 'Ahaa Teatteri', url: 'https://www.ahaateatteri.com', group: 'Tampere' },
      { name: 'Aurinkobaletti', url: 'https://www.aurinkobaletti.fi/', group: 'Turku' },
      { name: 'Cirko – Uuden sirkuksen keskus', url: 'https://www.cirko.fi/', group: 'Helsinki' },
      { name: 'Compañía Kaari & Roni Martin', url: 'https://www.compania.fi/' },
      { name: 'Espoon teatteri', url: 'https://www.espoonteatteri.fi/', group: 'Espoo' },
      { name: 'Greta Tuotanto', url: 'https://www.gretatuotanto.fi/' },
      { name: 'Hämeenlinnan Teatteri', url: 'https://www.hmlteatteri.fi/', group: 'Hämeenlinna' },
      { name: 'Helsingin Kaupunginteatteri', url: 'https://hkt.fi/', group: 'Helsinki' },
      { name: 'Improvisaatioteatteri Stella Polaris', url: 'https://stella-polaris.fi/', group: 'Helsinki' },
      { name: 'Itä-Suomen tanssin aluekeskus', url: 'https://itak.fi/', group: 'Kuopio' },
      { name: 'Joensuun kaupunginteatteri', url: 'https://www.joensuunteatteri.fi', group: 'Joensuu' },
      { name: 'JoJo – Oulun Tanssin Keskus', url: 'https://jojo.fi/', group: 'Oulu' },
      { name: 'Jyväskylän kaupunginteatteri', url: 'https://www.jklteatteri.fi/', group: 'Jyväskylä' },
      { name: 'Kajaanin kaupunginteatteri', url: 'https://www.kajaaninteatteri.fi/', group: 'Kajaani' },
      { name: 'Kemin teatteri', url: 'https://www.keminteatteri.fi/', group: 'Kemi' },
      { name: 'Keski-Uudenmaan Teatteri KUT', url: 'https://www.kut.fi/', group: 'Kerava' },
      { name: 'Klockriketeatern', url: 'https://www.klockrike.fi/sv/start/' },
      { name: 'Kokkolan kaupunginteatteri', url: 'https://kokkolanteatteri.fi/', group: 'Kokkola' },
      { name: 'KOM-teatteri', url: 'https://kom-teatteri.fi/', group: 'Helsinki' },
      { name: 'Kotkan Kaupunginteatteri', url: 'https://www.kotkanteatteri.fi/', group: 'Kotka' },
      { name: 'Kouvolan Teatteri', url: 'https://www.kouvolanteatteri.fi/', group: 'Kouvola' },
      { name: 'Kuopion kaupunginteatteri', url: 'https://kuopionkaupunginteatteri.fi/', group: 'Kuopio' },
      { name: 'Lahden kaupunginteatteri', url: 'https://www.lahdenkaupunginteatteri.fi/', group: 'Lahti' },
      { name: 'Läntinen tanssin aluekeskus', url: 'https://l-tanssi.fi/', group: 'Turku' },
      { name: 'Lappeenrannan kaupunginteatteri', url: 'https://lprteatteri.fi/fi', group: 'Lappeenranta' },
      { name: 'Linnateatteri', url: 'https://linnateatteri.fi/', group: 'Turku' },
      { name: 'Mikkelin Teatteri', url: 'https://www.mikkelinteatteri.fi/', group: 'Mikkeli' },
      { name: 'Musiikkiteatteri Kapsäkki', url: 'https://kapsakki.fi/', group: 'Helsinki' },
      { name: 'Nukketeatteri Sampo', url: 'https://nukketeatterisampo.fi/', group: 'Helsinki' },
      { name: 'Oulun teatteri', url: 'https://oulunteatteri.fi/', group: 'Oulu' },
      { name: 'Pirkanmaan Tanssin Keskus', url: 'https://www.pirkanmaantanssinkeskus.fi/', group: 'Tampere' },
      { name: 'Porin Teatteri', url: 'https://www.porinteatteri.fi/', group: 'Pori' },
      { name: 'Q-teatteri', url: 'https://www.q-teatteri.fi', group: 'Helsinki' },
      { name: 'Rakastajat-teatteri', url: 'https://rakastajat.fi/', group: 'Pori' },
      { name: 'Rauman teatteri', url: 'https://www.raumanteatteri.fi/', group: 'Rauma' },
      { name: 'Red Nose Company', url: 'https://www.rednose.fi/', group: 'Helsinki' },
      { name: 'Riihimäen Teatteri', url: 'https://www.riihimaenteatteri.fi', group: 'Riihimäki' },
      { name: 'Rovaniemen Teatteri', url: 'https://www.rovaniementeatteri.fi/', group: 'Rovaniemi' },
      { name: 'Ryhmäteatteri', url: 'https://ryhmateatteri.fi', group: 'Helsinki' },
      { name: 'Savonlinnan Teatteri', url: 'https://www.savonlinnanteatteri.fi/', group: 'Savonlinna' },
      { name: 'Seinäjoen kaupunginteatteri', url: 'https://seinajoenkaupunginteatteri.fi/', group: 'Seinäjoki' },
      { name: 'Suomen Kansallisteatteri', url: 'https://www.kansallisteatteri.fi', group: 'Helsinki' },
      { name: 'Suomen Komediateatteri', url: 'https://suomenkomediateatteri.fi', group: 'Helsinki' },
      { name: 'Susanna Leinonen Company', url: 'https://susannaleinonen.com', group: 'Helsinki' },
      { name: 'Svenska Teatern', url: 'https://www.svenskateatern.fi/sv/start/', group: 'Helsinki' },
      { name: 'Tampereen Komediateatteri', url: 'https://www.komediateatteri.fi/', group: 'Tampere' },
      { name: 'Tampereen Työväen Teatteri', url: 'https://www.ttt-teatteri.fi', group: 'Tampere' },
      { name: 'Tampereen Teatteri', url: 'https://www.tampereenteatteri.fi/', group: 'Tampere' },
      { name: 'Tanssiteatteri ERI', url: 'https://www.eri.fi/', group: 'Turku' },
      { name: 'Tanssiteatteri Hurjaruuth', url: 'https://www.hurjaruuth.fi/', group: 'Helsinki' },
      { name: 'Tanssiteatteri MD', url: 'https://www.tanssiteatterimd.fi/', group: 'Tampere' },
      { name: 'Tanssiteatteri Minimi', url: 'https://www.minimi.fi/', group: 'Kuopio' },
      { name: 'Tanssiteatteri Raatikko', url: 'https://www.raatikko.fi/', group: 'Vantaa' },
      { name: 'Tanssiteatteri Rimpparemmi', url: 'https://www.rimpparemmi.fi/', group: 'Rovaniemi' },
      { name: 'Tanssiteatteri Tsuumi', url: 'https://www.tsuumi.com/?lang=fi' },
      { name: 'Teater Viirus', url: 'https://www.viirus.fi/', group: 'Helsinki' },
      { name: 'Teatteri Eurooppa Neljä', url: 'https://www.teatterieurooppanelja.fi/', group: 'Jyväskylä' },
      { name: 'Teatteri Hevosenkenkä', url: 'https://www.hevosenkenka.fi', group: 'Espoo' },
      { name: 'Teatteri Imatra', url: 'https://www.teatteri-imatra.fi/', group: 'Imatra' },
      { name: 'Teatteri Jurkka', url: 'https://www.jurkka.fi/', group: 'Helsinki' },
      { name: 'Teatteri Mukamas', url: 'https://www.teatterimukamas.com/', group: 'Tampere' },
      { name: 'Teatteri Rollo', url: 'https://www.rollo.fi' },
      { name: 'Teatteri Vanha Juko', url: 'https://teatterivanhajuko.fi/', group: 'Lahti' },
      { name: 'Teatteri Vantaa', url: 'https://www.teatterivantaa.fi/', group: 'Vantaa' },
      { name: 'Toijalan Näyttämö', url: 'https://akaa.fi/kohteet/toijalan-nayttamo/', group: 'Akaa' },
      { name: 'Turun Kaupunginteatteri', url: 'https://tkteatteri.fi/', group: 'Turku' },
      { name: 'Unga Teatern', url: 'https://www.ungateatern.fi/', group: 'Espoo' },
      { name: 'Vaasan kaupunginteatteri', url: 'https://www.vaasa.fi/koe-ja-nae/kulttuuria-vaasassa-ja-seudulla/vaasan-kaupunginteatteri/', group: 'Vaasa' },
      { name: 'Varkauden Teatteri', url: 'https://www.varkaudenteatteri.fi/', group: 'Varkaus' },
      { name: 'Wasa Teater', url: 'https://www.wasateater.fi/', group: 'Vaasa' },
      { name: 'Zodiak – Uuden tanssin keskus', url: 'https://www.zodiak.fi', group: 'Helsinki' },
    ]
  },
  { 
    name: 'Liikenne', icon: '🚌', color: 'bg-brand-cyan',
    providers: [
      { name: 'VR', url: 'https://www.vr.fi' },
      { name: 'Matkahuolto', url: 'https://www.matkahuolto.fi' },
      { name: 'Google Maps', url: 'https://www.google.com/maps' },
      { name: 'HSL', url: 'https://www.hsl.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Nysse', url: 'https://www.nysse.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Föli', url: 'https://www.foli.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Oulun seudun liikenne', url: 'https://www.osl.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Linkki', url: 'https://linkki.jyvaskyla.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Vilkku', url: 'https://vilkku.kuopio.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Koutsi', url: 'https://www.kouvola.fi/koutsi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'JOJO', url: 'https://jojo.joensuu.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Jouko', url: 'https://lappeenranta.fi/fi/palvelut/jouko-joukkoliikenne', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Porin joukkoliikenne', url: 'https://pjl.pori.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Ålandstrafiken', url: 'https://www.alandstrafiken.ax/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Pääkaupunkiseudun Kaupunkiliikenne', url: 'https://kaupunkiliikenne.fi/', group: 'Joukkoliikennejärjestäjät' },
      { name: 'Nobina Finland', url: 'https://www.nobina.fi/', group: 'Liikennöitsijät' },
      { name: 'Koiviston Auto', url: 'https://www.koivistonauto.fi/', group: 'Liikennöitsijät' },
      { name: 'Pohjolan Liikenne', url: 'https://www.pl.fi/', group: 'Liikennöitsijät' },
      { name: 'Länsilinjat', url: 'https://www.lansilinjat.fi/', group: 'Liikennöitsijät' },
      { name: 'V-S Bussipalvelut', url: 'https://www.linjaliikennenyholm.fi/', group: 'Liikennöitsijät' },
      { name: 'Tampereen Kaupunkiliikenne', url: 'https://www.tampereenkaupunkiliikenne.fi/', group: 'Liikennöitsijät' },
      { name: 'Turun Kaupunkiliikenne', url: 'https://www.turku.fi/', group: 'Liikennöitsijät' },
      { name: 'Taksi Helsinki', url: 'https://taksihelsinki.fi', group: 'Taksit' },
      { name: 'Lähitaksi', url: 'https://www.lahitaksi.fi', group: 'Taksit' },
      { name: 'Menevä Taksi', url: 'https://meneva.fi', group: 'Taksit' },
      { name: '02 Taksi', url: 'https://02taksi.fi', group: 'Taksit' },
      { name: 'OnniBus', url: 'https://www.onnibus.com', group: 'Matkustus' },
      { name: 'Matkahuollon reittiopas', url: 'https://reittiopas.matkahuolto.fi/', group: 'Reittioppaat' },
      { name: 'Nysse reittiopas', url: 'https://reittiopas.tampere.fi/', group: 'Reittioppaat' },
      { name: 'Föli reittiopas', url: 'https://www.foli.fi/fi/aikataulut-ja-reitit', group: 'Reittioppaat' },
      { name: 'Oulun reittiopas', url: 'https://www.osl.fi/aikataulut-ja-linjat/', group: 'Reittioppaat' },
      { name: 'Linkki reittiopas', url: 'https://jyvaskyla.digitransit.fi/', group: 'Reittioppaat' },
      { name: 'Vilkku reittiopas', url: 'https://vilkku.kuopio.fi/aikataulut-ja-reitit', group: 'Reittioppaat' },
      { name: 'JOJO reittiopas', url: 'https://jojo.joensuu.fi/aikataulut-ja-reitit', group: 'Reittioppaat' },
      { name: 'Koutsi reittiopas', url: 'https://kouvola.digitransit.fi/', group: 'Reittioppaat' },
      { name: 'Jouko reittiopas', url: 'https://lappeenranta.fi/fi/liikenne-ja-kaupunkiymparisto/joukkoliikenne-ja-muut-liikkumispalvelut/lappeenrannan-seudun-joukkoliikenne/reitit-ja-aikataulut', group: 'Reittioppaat' },
      { name: 'Porin reittiopas', url: 'https://pori.digitransit.fi/', group: 'Reittioppaat' }
    ]
  },
  { 
    name: 'Luonto', icon: '🌲', color: 'bg-brand-teal',
    providers: [
      { name: 'Luontoon.fi', url: 'https://www.luontoon.fi' },
      { name: 'Suomen Latu', url: 'https://www.suomenlatu.fi' },
      { name: 'Muuttolintujen kevät', url: 'https://www.jyu.fi/fi/tutkimus/muuttolintujen-kevat' },
      { name: 'Retkipaikka', url: 'https://retkipaikka.fi' },
      { name: 'Luontosivusto.fi', url: 'https://luontosivusto.fi' },
      { name: 'Luontoportti', url: 'https://www.luontoportti.com' },
      { name: 'Metsähallitus', url: 'https://www.metsa.fi' }
    ]
  },
  {
    name: 'Liikunta', icon: '🚶', color: 'bg-brand-cyan',
    providers: [
      { name: 'Voitas.fi - liikuntavideot', url: 'https://voitas.fi/liikuntavideot', group: 'Valtakunnallinen' },
      { name: 'Ikäinstituutti - harjoittelu videoiden avulla', url: 'https://www.ikainstituutti.fi/liikunta-ja-ulkoilu-etusivu/voimaa-etajumpasta/harjoittelu-videoiden-avulla/', group: 'Valtakunnallinen' },
      { name: 'Vahvike - jumppavideoita', url: 'https://vahvike.fi/liikunta/jumppavideoita/', group: 'Valtakunnallinen' },
      { name: 'UKK-instituutti - ikäihmisten liikkumisen suositusvideot', url: 'https://ukkinstituutti.fi/aineistot/ikaihmisten-liikkumisen-suositukset-tietoiskuvideot/', group: 'Valtakunnallinen' },
      { name: 'Coronaria - seniorijumppaa', url: 'https://www.coronaria.fi/fysioterapia/seniorijumppaa/', group: 'Valtakunnallinen' },
      { name: 'Tanssi.net - lavatanssikalenteri', url: 'https://www.tanssi.io/', group: 'Tanssit' },
      { name: 'Tanssiin.fi - tanssit ja keikat', url: 'https://www.tanssiin.fi/', group: 'Tanssit' },
      { name: 'Tanssiin.fi - tanssipaikat kartalla', url: 'https://www.tanssiin.fi/tanssilavat/', group: 'Tanssit' },
      { name: 'Suomen Seuratanssiliitto SUSEL', url: 'https://www.susel.fi/', group: 'Tanssit' },
      { name: 'SUSEL - seuratanssin tietoa', url: 'https://www.susel.fi/susel/seuratanssi/', group: 'Tanssit' },
      { name: 'Tanssit.fi - tanssin ABC', url: 'https://www.tanssit.fi/tanssin-abc/', group: 'Tanssit' },
      { name: 'Helsinki - etäliikuntavideot', url: 'https://www.hel.fi/fi/kulttuuri-ja-vapaa-aika/itsenaisesti-katsottavat-etaliikuntavideot', group: 'Alueelliset' },
      { name: 'Espoo - omatoimiliikunta', url: 'https://www.espoo.fi/fi/liikunta-ja-luonto/liikuntaryhmat-ja-kurssit/omatoimiliikunta', group: 'Alueelliset' },
      { name: 'Somero - tuoli- ja tasapainojumppa', url: 'https://www.somero.fi/vapaa-aika-ja-matkailu/liikunta-ja-ulkoilu/etajumppa/', group: 'Alueelliset' },
      { name: 'Eläkeliitto Akaa - jumppavinkkejä ikäihmisille', url: 'https://www.elakeliitto.fi/yhdistykset/akaa/jumppavinkkeja-ja-videoita-ikaihmisille', group: 'Alueelliset' },
      { name: 'Siilinjärvi - kotijumppavideoita senioreille', url: 'https://siilinjarvi.fi/hyvinvointi-ja-vapaa-aika/liikuntapalvelut/terveys-ja-erityisliikunta/kotijumppavideoita-senioreille/', group: 'Alueelliset' },
      ...MUNICIPALITY_EXERCISE_LINKS,
    ]
  },
  { 
    name: 'Matkailu', icon: '✈️', color: 'bg-brand-orange',
    providers: [
      { name: 'Visit Finland', url: 'https://www.visitfinland.com' },
      { name: 'Finnair', url: 'https://www.finnair.com' },
      { name: 'Aurinkomatkat', url: 'https://www.aurinkomatkat.fi' },
      { name: 'Tjäreborg', url: 'https://www.tjareborg.fi' },
      { name: 'Momondo', url: 'https://www.momondo.fi' },
      { name: 'Rantapallo', url: 'https://www.rantapallo.fi' }
    ]
  },
  { 
    name: 'Musiikki', icon: '🎵', color: 'bg-brand-orange',
    providers: [
      { name: 'Yle Areena audio', url: 'https://areena.yle.fi/audio' },
      { name: 'Spotify', url: 'https://open.spotify.com' },
      { name: 'YouTube Musiikki', url: 'https://music.youtube.com' },
      { name: 'Radio Player', url: 'https://play.radioplayer.org/fi' },
      { name: 'Avanti! Kamariorkesteri', url: 'https://avantimusic.fi/', group: 'Orkesterit' },
      { name: 'Helsingin Barokkiorkesteri', url: 'https://hebo.fi/', group: 'Orkesterit' },
      { name: 'Helsingin kaupunginorkesteri', url: 'https://helsinginkaupunginorkesteri.fi/', group: 'Orkesterit' },
      { name: 'Joensuun kaupunginorkesteri', url: 'https://www.joensuunkaupunginorkesteri.fi/', group: 'Orkesterit' },
      { name: 'Jyväskylä Sinfonia', url: 'https://www.jyvaskylasinfonia.fi/', group: 'Orkesterit' },
      { name: 'Keski-Pohjanmaan Kamariorkesteri', url: 'https://www.kamariorkesteri.fi/', group: 'Orkesterit' },
      { name: 'Kuopion kaupunginorkesteri', url: 'https://www.kuopionkaupunginorkesteri.fi/', group: 'Orkesterit' },
      { name: 'Kymi Sinfonietta', url: 'https://kymisinfonietta.fi/', group: 'Orkesterit' },
      { name: 'Lapin kamariorkesteri', url: 'https://korundi.fi/fi/kavijalle/lapin-kamariorkesteri', group: 'Orkesterit' },
      { name: 'Lappeenrannan kaupunginorkesteri', url: 'https://www.lprorkesteri.fi/', group: 'Orkesterit' },
      { name: 'Oulu Sinfonia', url: 'https://www.oulusinfonia.fi/', group: 'Orkesterit' },
      { name: 'Radion sinfoniaorkesteri', url: 'https://yle.fi/aihe/rso', group: 'Orkesterit' },
      { name: 'Sinfonia Lahti', url: 'https://www.sinfonialahti.fi/', group: 'Orkesterit' },
      { name: 'Suomalainen barokkiorkesteri', url: 'https://fibo.fi/', group: 'Orkesterit' },
      { name: 'Tampere Filharmonia', url: 'https://www.tamperefilharmonia.fi/', group: 'Orkesterit' },
      { name: 'Tapiola Sinfonietta', url: 'https://tapiolasinfonietta.fi/', group: 'Orkesterit' },
      { name: 'Turun filharmoninen orkesteri', url: 'https://www.tfo.fi/', group: 'Orkesterit' },
      { name: 'UMO Helsinki Jazz Orchestra', url: 'https://umohelsinki.fi/', group: 'Orkesterit' },
      { name: 'Vaasan kaupunginorkesteri', url: 'https://www.vaasa.fi/koe-ja-nae/kulttuuria-vaasassa-ja-seudulla/vaasan-kaupunginorkesteri/', group: 'Orkesterit' }
    ]
  },
  { 
    name: 'Oikeus', icon: '⚖️', color: 'bg-brand-grey',
    providers: [
      { name: 'Oikeus.fi', url: 'https://www.oikeus.fi' },
      { name: 'Finlex', url: 'https://www.finlex.fi' },
      { name: 'Kuluttajaneuvonta', url: 'https://www.kkv.fi/kuluttajaneuvonta/' },
      { name: 'Eduskunnan oikeusasiamies', url: 'https://www.oikeusasiamies.fi' },
      { name: 'Tietosuojavaltuutettu', url: 'https://tietosuoja.fi' },
      { name: 'Yhdenvertaisuusvaltuutettu', url: 'https://yhdenvertaisuusvaltuutettu.fi/', group: 'Syrjintä ja yhdenvertaisuus' },
      { name: 'Tasa-arvovaltuutettu', url: 'https://tasa-arvo.fi/', group: 'Syrjintä ja yhdenvertaisuus' }
    ]
  },
  { 
    name: 'Pankit', icon: '🏦', color: 'bg-[#173e5f]',
    providers: [
      { name: 'OP', url: 'https://www.op.fi/henkiloasiakkaat/asiakaspalvelu/ota-yhteytta', phone: '0100 0500', phoneUrl: 'tel:01000500' },
      { name: 'Nordea', url: 'https://www.nordea.fi/henkiloasiakkaat/palvelumme/verkko-mobiilipalvelut/digineuvontaa.html', phone: '0200 3000', phoneUrl: 'tel:02003000' },
      { name: 'Danske Bank', url: 'https://danskebank.fi/sinulle/asiakaspalvelu', phone: '0200 2580', phoneUrl: 'tel:02002580' },
      { name: 'S-Pankki', url: 'https://www.s-pankki.fi/fi/tiedotteet/2025/s-pankki-kehottaa-asiakaspalveluun-soittavia-tarkistamaan-puhelinnumeron/', phone: '010 76 5800', phoneUrl: 'tel:010765800' },
      { name: 'Aktia', url: 'https://www.aktia.fi/fi/asiakaspalvelu', phone: '010 247 010', phoneUrl: 'tel:010247010' },
      { name: 'Handelsbanken', url: 'https://www.handelsbanken.fi' },
      { name: 'Säästöpankki', url: 'https://www.saastopankki.fi/fi-fi/asiakaspalvelu/yhteydenottokanavat/puhelinnumerot', phone: '0100 5252', phoneUrl: 'tel:01005252' },
      { name: 'POP Pankki', url: 'https://www.poppankki.fi' },
      { name: 'Alisa Pankki', url: 'https://www.alisapankki.fi/' },
      { name: 'Ålandsbanken', url: 'https://www.alandsbanken.fi/', phone: '0204 292 920', phoneUrl: 'tel:0204292920' }
    ]
  },
  {
    name: 'Talous', icon: '📈', color: 'bg-brand-grey',
    providers: [
      { name: 'Kauppalehti', url: 'https://www.kauppalehti.fi/' },
      { name: 'Talouselämä', url: 'https://www.talouselama.fi/' },
      { name: 'Taloussanomat', url: 'https://www.is.fi/taloussanomat/' }
    ]
  },
  { 
    name: 'Ruoka', icon: '🥘', color: 'bg-brand-orange',
    providers: [
      { name: 'K-Ruoka', url: 'https://www.k-ruoka.fi' },
      { name: 'S-kaupat', url: 'https://www.s-kaupat.fi' },
      { name: 'Kotikokki', url: 'https://www.kotikokki.net' },
      { name: 'Yhteishyvä Reseptit', url: 'https://yhteishyva.fi' },
      { name: 'Valio Reseptit', url: 'https://www.valio.fi/reseptit/' }
    ]
  },
  { 
    name: 'Sosiaalinen media', icon: '💬', color: 'bg-[#173e5f]',
    providers: [
      { name: 'Facebook', url: 'https://www.facebook.com' },
      { name: 'Instagram', url: 'https://www.instagram.com' },
      { name: 'YouTube', url: 'https://www.youtube.com' },
      { name: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
      { name: 'X (Twitter)', url: 'https://twitter.com/' },
      { name: 'Bluesky', url: 'https://bsky.social' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/' }
    ]
  },
  { 
    name: 'Sovellukset', icon: '📱', color: 'bg-[#173e5f]',
    providers: [
      { name: 'Google Play', url: 'https://play.google.com/store/apps' },
      { name: 'App Store', url: 'https://apps.apple.com' },
      { name: '112 Suomi', url: 'https://112.fi' },
      { name: 'Huawei AppGallery', url: 'https://appgallery.huawei.com' }
    ]
  },
  { 
    name: 'Sukututkimus', icon: '🌳', color: 'bg-brand-teal',
    providers: [
      { name: 'Geni', url: 'https://www.geni.com' },
      { name: 'MyHeritage', url: 'https://www.myheritage.fi' },
      { name: 'Sukujutut', url: 'https://www.sukujutut.fi/' },
      { name: 'Sukuhaku', url: 'https://www.genealogia.fi' },
      { name: 'Kansallisarkisto', url: 'https://kansallisarkisto.fi/' }
    ]
  },
  { 
    name: 'Sähköposti', icon: '✉️', color: 'bg-brand-cyan',
    providers: [
      { name: 'Gmail', url: 'https://mail.google.com' },
      { name: 'Outlook / Hotmail', url: 'https://outlook.live.com' }
    ]
  },
  { 
    name: 'Sää', icon: '☀️', color: 'bg-brand-cyan',
    providers: [
      { name: 'Ilmatieteen laitos', url: 'https://www.ilmatieteenlaitos.fi' },
      { name: 'Foreca', url: 'https://www.foreca.fi' },
      { name: 'Yle Sää', url: 'https://yle.fi/saa' },
      { name: 'Supersää', url: 'https://www.is.fi/supersaa/' },
      { name: 'Sadetutka', url: 'https://www.is.fi/supersaa/sadetutka/' }
    ]
  },
  { 
    name: 'Taiteet', icon: '🎨', color: 'bg-brand-orange',
    providers: [
      { name: 'Google Arts & Culture', url: 'https://artsandculture.google.com' },
      { name: 'Kansallisgalleria', url: 'https://www.kansallisgalleria.fi' },
      { name: 'Ateneum', url: 'https://ateneum.fi' },
      { name: 'Kiasma', url: 'https://kiasma.fi' },
      { name: 'Taidehalli', url: 'https://taidehalli.fi' },
      { name: 'Amos Rex', url: 'https://amosrex.fi' }
    ]
  },
  { 
    name: 'Tekniikkauutiset', icon: '⚙️', color: 'bg-brand-cyan',
    providers: [
      { name: 'Tekniikan Maailma', url: 'https://tekniikanmaailma.fi' },
      { name: 'Bitti – Iltalehti', url: 'https://www.iltalehti.fi/bitti' },
      { name: 'Tivi', url: 'https://www.tivi.fi' }
    ]
  },
  { 
    name: 'Terveys', icon: '🏥', color: 'bg-brand-teal',
    providers: [
      { name: 'Terveyskirjasto', url: 'https://www.terveyskirjasto.fi' },
      { name: 'THL', url: 'https://thl.fi' },
      { name: 'OmaKanta', url: 'https://www.kanta.fi/omakanta' },
      { name: 'Terveyskylä', url: 'https://www.terveyskyla.fi' },
      { name: 'Päivystysapu', url: 'https://116117.fi/', phone: '116117', phoneUrl: 'tel:116117' },
      { name: 'Myrkytystietokeskus', url: 'https://www.hus.fi/potilaalle/sairaalat-ja-toimipisteet/myrkytystietokeskus', phone: '0800 147 111', phoneUrl: 'tel:0800147111' },
      { name: 'Apteekki.fi', url: 'https://www.apteekki.fi' },
      { name: 'Mehiläinen', url: 'https://www.mehilainen.fi' },
      { name: 'Terveystalo', url: 'https://www.terveystalo.com' },
      { name: 'Saamenkieliset sote-palvelut', url: 'https://samediggi.fi/vastuualueet/sosiaali-ja-terveys/saamenkieliset-sote-palvelut/', group: 'Omakieliset palvelut' },
      { name: 'Uvja - saamelainen keskustelu- ja kriisituki', url: 'https://uvja.fi/', group: 'Omakieliset palvelut' },
      { name: 'SAMS - ruotsinkieliset vammaisjärjestöt', url: 'https://samsnet.fi/fi/', group: 'Ruotsinkieliset palvelut' },
      { name: 'FDUV - ruotsinkieliset kehitysvammaiset', url: 'https://fduv.fi/fi/lyhyestisuomeksi/', group: 'Ruotsinkieliset palvelut' }
    ]
  },
  {
    name: 'Potilasyhdistykset', icon: '🫶', color: 'bg-brand-teal',
    providers: PATIENT_ASSOCIATION_LINKS
  },
  {
    name: 'Senioripalvelut', icon: '🧓', color: 'bg-brand-teal',
    providers: MUNICIPALITY_SENIOR_LINKS
  },
  { 
    name: 'Tiede', icon: '🧪', color: 'bg-[#173e5f]',
    providers: [
      { name: 'Heureka', url: 'https://www.heureka.fi' },
      { name: 'Tiede', url: 'https://www.hs.fi/tiede/' },
      { name: 'Tieteen Kuvalehti', url: 'https://tieku.fi' },
    ]
  },
  { 
    name: 'Turvallisuus', icon: '🛡️', color: 'bg-brand-orange',
    providers: [
      { name: 'Huijausinfo', url: 'https://www.kuluttajaliitto.fi/hankkeet/huijausinfo/' },
      { name: 'Suvanto ry', url: 'https://www.suvantory.fi/' },
      { name: 'Kyberturvallisuuskeskus', url: 'https://www.kyberturvallisuuskeskus.fi' },
      { name: 'Mobiilivarmenne', url: 'https://mobiilivarmenne.fi' },
      { name: '112.fi - Hätäkeskus', url: 'https://112.fi' },
      { name: 'Poliisi', url: 'https://poliisi.fi' },
      { name: 'Pelastustoimi', url: 'https://pelastustoimi.fi' }
    ]
  },
  { 
    name: 'Urheilu', icon: '⚽', color: 'bg-brand-teal',
    providers: [
      { name: 'Yle Urheilu', url: 'https://yle.fi/urheilu', group: 'Valtakunnallinen' },
      { name: 'Iltalehti Urheilu', url: 'https://www.iltalehti.fi/urheilu', group: 'Valtakunnallinen' },
      { name: 'MTV Urheilu', url: 'https://www.mtv.fi/urheilu', group: 'Valtakunnallinen' },
      { name: 'Tulospalvelu.fi', url: 'https://www.tulospalvelu.fi', group: 'Valtakunnallinen' }
    ]
  },
  { 
    name: 'Lehdet', icon: '🗞️', color: 'bg-brand-grey',
    providers: LOCAL_NEWSPAPER_LINKS.map((item) => ({ name: item.name, url: item.url }))
  },
  { 
    name: 'Uutiset & Media', icon: '📰', color: 'bg-brand-grey',
    providers: [
      { name: 'Yle Uutiset', url: 'https://yle.fi/uutiset' },
      { name: 'Helsingin Sanomat', url: 'https://www.hs.fi' },
      { name: 'Ilta-Sanomat', url: 'https://www.is.fi' },
      { name: 'Iltalehti', url: 'https://www.iltalehti.fi' },
      { name: 'Maaseudun Tulevaisuus', url: 'https://www.maaseuduntulevaisuus.fi' },
      { name: 'Ampparit', url: 'https://www.ampparit.com/' },
      { name: 'Uusi Suomi', url: 'https://www.uusisuomi.fi/' }
    ]
  },
  { 
    name: 'Vapaa-aika', icon: '🎈', color: 'bg-brand-orange',
    providers: [
      { name: 'Lähellä.fi', url: 'https://www.lahella.fi' },
      { name: 'Vapaaehtoistyö', url: 'https://vapaaehtoistyo.fi/fi' },
      { name: 'Kansalaisopistot', url: 'https://kansalaisopistot.fi' },
      { name: 'Martat', url: 'https://www.martat.fi' },
      { name: 'Suomen Latu', url: 'https://www.suomenlatu.fi' },
      { name: 'Geokätköily', url: 'https://www.geocache.fi/' },
      { name: 'Vahvike', url: 'https://vahvike.fi/' },
      { name: 'Suomi.fi harrastushaku', url: 'https://www.suomi.fi/palvelut/harrastushaku' },
      { name: 'Suomen Romanifoorumi', url: 'https://www.romanifoorumi.fi/', group: 'Romanit' },
      { name: 'Suomen Romanifoorumi - jäsenjärjestöt', url: 'https://www.romanifoorumi.fi/jasenjarjestot/', group: 'Romanit' },
      { name: 'Moniheli - monikulttuurijärjestöjen verkosto', url: 'https://moniheli.fi/verkosto/', group: 'Monikulttuurinen toiminta' }
    ]
  },
  {
    name: 'Eläkeyhdistykset', icon: '👥', color: 'bg-[#173e5f]',
    providers: [
      ...SENIOR_ASSOCIATION_LINKS,
      { name: 'Sateenkaariseniorit ry', url: 'https://www.sateenkaariseniorit.fi/', group: 'Sateenkaarisenioreille' },
      { name: 'Sateenkaariseniorit - ryhmätoiminta', url: 'https://www.sateenkaariseniorit.fi/ryhm%C3%A4toiminta', group: 'Sateenkaarisenioreille' },
      { name: 'Seta - tietoa sateenkaarisenioreille', url: 'https://seniorit.seta.fi/tietoa-sateenkaarisenioreille/', group: 'Sateenkaarisenioreille' },
      { name: 'Kuurojen Liitto - senioreille', url: 'https://kuurojenliitto.fi/senioreille/', group: 'Viittomakieliset seniorit' }
    ]
  },
  { 
    name: 'Verkkokaupat', icon: '🛒', color: 'bg-brand-orange',
    providers: [
      { name: 'Verkkokauppa.com', url: 'https://www.verkkokauppa.com' },
      { name: 'Posti', url: 'https://www.posti.fi' },
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
      { name: 'Netflix', url: 'https://www.netflix.com' },
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
