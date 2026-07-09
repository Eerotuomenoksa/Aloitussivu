import type { Provider } from './types';

export interface LocalServiceTransportEntry {
  municipality: string;
  provider: Provider;
  evidence?: string;
}

// Generated/maintained from municipal service transport checks.
// Category name uses the common Finnish term "Palveluliikenne".
export const LOCAL_SERVICE_TRANSPORT_LINKS: LocalServiceTransportEntry[] = [
  {
    municipality: "akaa",
    provider: {
      name: "Akaa palveluliikenne",
      url: "https://akaa.fi/meidan-akaa/liikenneyhteydet/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenneyhteydet &#x2d; Akaan kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "alajärvi",
    provider: {
      name: "Alajärvi palveluliikenne",
      url: "https://alajarvi.fi/kaupunki-ja-hallinto/asiointi-ja-yhteystiedot/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne - Alajärven kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "alavieska",
    provider: {
      name: "Alavieska palveluliikenne",
      url: "https://www.alavieska.fi/kunnan_palvelut/kutsutaksi",
      group: 'Palveluliikenne',
    },
    evidence: "Kutsutaksi | Alavieska; termit: kutsutaksi",
  },
  {
    municipality: "asikkala",
    provider: {
      name: "Asikkala palveluliikenne",
      url: "https://asikkala.fi/asuminen-ja-ymparisto/joukko-ja-palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukko- ja palveluliikenne - Asikkala; termit: palveluliikenne",
  },
  {
    municipality: "evijärvi",
    provider: {
      name: "Evijärvi palveluliikenne",
      url: "https://evijarvi.fi/asuminen-ja-ymparisto/linja-auto-ja-palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Linja-auto- ja palveluliikenne - Evijärven kunta; termit: palveluliikenne",
  },
  {
    municipality: "forssa",
    provider: {
      name: "Forssa palveluliikenne",
      url: "https://www.forssa.fi/asuminen-ja-ymparisto/joukkoliikenne-1558118806/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne | Forssan kaupunki; termit: palveluliikenne; palvelubussi",
  },
  {
    municipality: "hamina",
    provider: {
      name: "Hamina palveluliikenne",
      url: "https://www.hamina.fi/asuminen-ymparisto/kadut-tiet-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne ja palveluliikenne &#x2d; Haminan kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "hartola",
    provider: {
      name: "Hartola palveluliikenne",
      url: "https://hartola.fi/hartolan-kunnan-palvelu-ja-asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Hartolan kunnan palvelu- ja asiointiliikenne - Hartola; termit: asiointiliikenne",
  },
  {
    municipality: "heinola",
    provider: {
      name: "Heinola palveluliikenne",
      url: "https://www.heinola.fi/asuminen-ja-ymparisto/asuminen/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Heinola; termit: palveluliikenne; kutsutaksi; palvelubussi",
  },
  {
    municipality: "heinävesi",
    provider: {
      name: "Heinävesi palveluliikenne",
      url: "https://www.heinavesi.fi/liikenne-ja-kadut/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Heinävesi; termit: asiointiliikenne",
  },
  {
    municipality: "hirvensalmi",
    provider: {
      name: "Hirvensalmi palveluliikenne",
      url: "https://www.hirvensalmi.fi/hirvensalmi-info/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne &#x2d; Hirvensalmi; termit: kutsutaksi",
  },
  {
    municipality: "hollola",
    provider: {
      name: "Hollola palveluliikenne",
      url: "https://hollola.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Hollola; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "huittinen",
    provider: {
      name: "Huittinen palveluliikenne",
      url: "https://www.huittinen.fi/asuminen-ja-ymparisto/asuminen-ymparisto-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Huittisten kaupunki; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "hyrynsalmi",
    provider: {
      name: "Hyrynsalmi palveluliikenne",
      url: "https://hyrynsalmi.fi/asuminen-ja-ymparisto/tiet-ja-yleiset-alueet/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Hyrynsalmen kunta; termit: asiointiliikenne",
  },
  {
    municipality: "hyvinkää",
    provider: {
      name: "Hyvinkää palveluliikenne",
      url: "https://www.hyvinkaa.fi/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne - Hyvinkään kaupunki; termit: palvelubussi",
  },
  {
    municipality: "hämeenkyrö",
    provider: {
      name: "Hämeenkyrö palveluliikenne",
      url: "https://hameenkyro.fi/palvelut/asuminen-ja-elinymparisto/kartat-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Hämeenkyrö; termit: palveluliikenne",
  },
  {
    municipality: "iisalmi",
    provider: {
      name: "Iisalmi palveluliikenne",
      url: "https://iisalmi.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/julkinen-liikenne/pali-palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "PALI-palveluliikenne - Iisalmi; termit: palveluliikenne",
  },
  {
    municipality: "iitti",
    provider: {
      name: "Iitti palveluliikenne",
      url: "https://www.iitti.fi/asuminen-ja-ymparisto/kadut-tiet-ja-liikenne/joukko-ja-palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne, asiointiliikenne ja palveluliikenne | Iitin kunta; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "ikaalinen",
    provider: {
      name: "Ikaalinen palveluliikenne",
      url: "https://ikaalinen.fi/asuminen-ja-ymparisto/kaupunkiymparisto-ja-liikenne-2/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Ikaalinen; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "ilomantsi",
    provider: {
      name: "Ilomantsi palveluliikenne",
      url: "https://www.ilomantsi.fi/asuminen-ja-ymparisto/liikenne-ja-tieverkko/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Ilomantsin kunta; termit: asiointiliikenne",
  },
  {
    municipality: "janakkala",
    provider: {
      name: "Janakkala palveluliikenne",
      url: "https://www.janakkala.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/bussiliikenteen-aikataulut-ja-liput/",
      group: 'Palveluliikenne',
    },
    evidence: "Bussiliikenteen aikataulut ja liput - Janakkala; termit: palveluliikenne",
  },
  {
    municipality: "joensuu",
    provider: {
      name: "Joensuu palveluliikenne",
      url: "https://www.joensuu.fi/arjen-palvelut/liikenne-kadut-ja-kunnossapito/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Joensuu; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "joroinen",
    provider: {
      name: "Joroinen palveluliikenne",
      url: "https://www.joroinen.fi/asuminen-ja-ymparisto/liikenne/palveluliikenne-pali/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne PALI - joroinen.fi; termit: palveluliikenne; kutsujoukkoliikenne",
  },
  {
    municipality: "joutsa",
    provider: {
      name: "Joutsa palveluliikenne",
      url: "https://www.joutsa.fi/asuminen-ja-ymparisto/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne - Joutsan kunta; termit: asiointiliikenne",
  },
  {
    municipality: "juupajoki",
    provider: {
      name: "Juupajoki palveluliikenne",
      url: "https://juupajoki.fi/hallinto-ja-paatoksenteko/tietoa-juupajoesta/liikenneyhteydet/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenneyhteydet ja asiointiliikenne - Juupajoen kunta; termit: asiointiliikenne",
  },
  {
    municipality: "juva",
    provider: {
      name: "Juva palveluliikenne",
      url: "https://www.juva.fi/joukkoliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Linja-autovuorot Juvan kunta - Juvan kunta; termit: asiointiliikenne",
  },
  {
    municipality: "jyväskylä",
    provider: {
      name: "Jyväskylä palveluliikenne",
      url: "https://www.jyvaskyla.fi/asuminen-rakentaminen-ja-liikenne/kadut-ja-liikenne/joukko-ja-palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukko- ja palveluliikenne | Jyväskylä.fi; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "järvenpää",
    provider: {
      name: "Järvenpää palveluliikenne",
      url: "https://www.jarvenpaa.fi/a/jarvenpaan-kaupungin-palveluliikenne-palvelee-arkisin-ja-lauantaisin",
      group: 'Palveluliikenne',
    },
    evidence: "Järvenpään kaupungin palveluliikenne palvelee arkisin ja lauantaisin | Järvenpää; termit: palveluliikenne; palvelubussi",
  },
  {
    municipality: "kajaani",
    provider: {
      name: "Kajaani palveluliikenne",
      url: "https://kajaaninjoukkoliikenne.fi/",
      group: 'Palveluliikenne',
    },
    evidence: "Kajaanin joukkoliikenne; termit: palveluliikenne",
  },
  {
    municipality: "kangasala",
    provider: {
      name: "Kangasala palveluliikenne",
      url: "https://www.kangasala.fi/asu-hyvin/liikenne-kadut-ja-viheralueet/palvelu-ja-joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palvelu- ja joukkoliikenne - Kangasala; termit: palveluliikenne; asiointiliikenne; palvelubussi",
  },
  {
    municipality: "kankaanpää",
    provider: {
      name: "Kankaanpää palveluliikenne",
      url: "https://www.kankaanpaa.fi/kaupunki-ja-hallinto/kankaanpaa-info/liikenneyhteydet/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenneyhteydet - Kankaanpään kaupunki; termit: kutsuliikenne; kutsutaksi",
  },
  {
    municipality: "karkkila",
    provider: {
      name: "Karkkila palveluliikenne",
      url: "https://karkkila.fi/asuminen-ja-ymparisto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Karkkilan kaupunki; termit: asiointiliikenne",
  },
  {
    municipality: "karstula",
    provider: {
      name: "Karstula palveluliikenne",
      url: "https://karstula.fi/asuminen-ja-ymparisto/kunnallistekniikka/katujen-ja-yleisten-alueiden-kunnossapito/liikenneturvallisuus/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenneturvallisuus &#8211; Karstula; termit: asiointiliikenne",
  },
  {
    municipality: "kauhajoki",
    provider: {
      name: "Kauhajoki palveluliikenne",
      url: "https://kauhajoki.fi/tyo-ja-yrittajyys/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne - Kauhajoen kaupunki; termit: asiointiliikenne",
  },
  {
    municipality: "kauhava",
    provider: {
      name: "Kauhava palveluliikenne",
      url: "https://kauhava.fi/asuminen-ja-ymparisto/tiet-ja-liikenne/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne - Kauhava; termit: palveluliikenne",
  },
  {
    municipality: "keitele",
    provider: {
      name: "Keitele palveluliikenne",
      url: "https://keitele.fi/asuminen-ja-ymparisto/liikenneyhteydet/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Keitele; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "kemijärvi",
    provider: {
      name: "Kemijärvi palveluliikenne",
      url: "https://kemijarvi.fi/asuminen-ja-ymparisto/liikennepalvelut/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikennepalvelut - Kemijärvi; termit: palveluliikenne; asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "keuruu",
    provider: {
      name: "Keuruu palveluliikenne",
      url: "https://keuruu.fi/asuminen-ja-ymparisto/keuruun-kaupungin-palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Keuruun kaupungin palveluliikenne - Keuruu; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "kitee",
    provider: {
      name: "Kitee palveluliikenne",
      url: "https://www.kitee.fi/joukkoliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - kitee.fi; termit: asiointiliikenne",
  },
  {
    municipality: "kristiinankaupunki",
    provider: {
      name: "Kristiinankaupunki palveluliikenne",
      url: "https://www.kristinestad.fi/asuminen-ja-ymparisto/palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne Kristiinankaupungin eteläisillä alueilla; termit: palveluliikenne; tarkistettu 2026-07-09",
  },
  {
    municipality: "kittilä",
    provider: {
      name: "Kittilä palveluliikenne",
      url: "https://kittila.fi/asuminen-ja-ymparisto/liikenne/tyomatka-ja-asiointiliikenne-kittilassa",
      group: 'Palveluliikenne',
    },
    evidence: "Työmatka- ja asiointiliikenne Kittilässä | Kittilä; termit: palveluliikenne; asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "kokkola",
    provider: {
      name: "Kokkola palveluliikenne",
      url: "https://www.kokkola.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Kaupunkiliikenne BYSSE, joukko- ja palveluliikenne - Kokkola; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "kontiolahti",
    provider: {
      name: "Kontiolahti palveluliikenne",
      url: "https://www.kontiolahti.fi/asuminen-ja-ymparisto/asuinymparisto-ja-liikenne/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Kontiolahden kunta; termit: asiointiliikenne; kutsujoukkoliikenne",
  },
  {
    municipality: "kouvola",
    provider: {
      name: "Kouvola palveluliikenne",
      url: "https://www.kouvola.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Koutsi – Kouvolan joukkoliikenne - Kouvolan kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "kuortane",
    provider: {
      name: "Kuortane palveluliikenne",
      url: "https://kuortane.fi/sosiaali-ja-terveyspalvelut/kuortaneen-asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Kuortaneen asiointiliikenne | Kuortane; termit: asiointiliikenne",
  },
  {
    municipality: "kurikka",
    provider: {
      name: "Kurikka palveluliikenne",
      url: "https://kurikka.fi/kaupunki-ja-hallinto/asiointi-ja-palvelut/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne – Kurikka; termit: palveluliikenne; asiointiliikenne; palvelubussi",
  },
  {
    municipality: "kärkölä",
    provider: {
      name: "Kärkölä palveluliikenne",
      url: "https://karkola.fi/2025/06/27/omppukyyti-palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Omppukyyti-palveluliikenne - Kärkölä; termit: palveluliikenne",
  },
  {
    municipality: "kärsämäki",
    provider: {
      name: "Kärsämäki palveluliikenne",
      url: "https://karsamaki.fi/julkaisut/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne ilmoittaa; termit: palveluliikenne; palvelubussi",
  },
  {
    municipality: "laitila",
    provider: {
      name: "Laitila palveluliikenne",
      url: "https://www.laitila.fi/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Laitila; termit: asiointiliikenne",
  },
  {
    municipality: "lapinjärvi",
    provider: {
      name: "Lapinjärvi palveluliikenne",
      url: "https://lapinjarvi.fi/kutsutaksi-vie-suoraan-pysakille/",
      group: 'Palveluliikenne',
    },
    evidence: "Kutsutaksi vie suoraan pysäkille - Lapinjärvi.fi; termit: kutsutaksi",
  },
  {
    municipality: "lappajärvi",
    provider: {
      name: "Lappajärvi palveluliikenne",
      url: "https://lappajarvi.fi/asuminen-ja-ymparisto/liikenne-ja-kartat/",
      group: 'Palveluliikenne',
    },
    evidence: "Lappajärvi - - Liikenne ja kartat; termit: palveluliikenne",
  },
  {
    municipality: "lappeenranta",
    provider: {
      name: "Lappeenranta palveluliikenne",
      url: "https://lappeenranta.fi/fi/liikenne-ja-kaupunkiymparisto/joukkoliikenne-ja-muut-liikkumispalvelut/lappeenrannan-seudun-joukkoliikenne/reitit-ja-aikataulut",
      group: 'Palveluliikenne',
    },
    evidence: "Reitit ja aikataulut - Lappeenranta; termit: palveluliikenne; kutsutaksi; palvelubussi",
  },
  {
    municipality: "lapua",
    provider: {
      name: "Lapua palveluliikenne",
      url: "https://lapua.fi/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Lapuan kaupunki; termit: asiointiliikenne",
  },
  {
    municipality: "lempäälä",
    provider: {
      name: "Lempäälä palveluliikenne",
      url: "https://www.lempaala.fi/tiedotteet/lempaalanpalveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Lempäälän palveluliikenne – kesäajan aikataulut ja kilpailutuksen lopputulos - Lempäälä; termit: palveluliikenne; palvelubussi",
  },
  {
    municipality: "leppävirta",
    provider: {
      name: "Leppävirta palveluliikenne",
      url: "https://leppavirta.fi/asuminen-ja-ymparisto/liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Leppävirta; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "lohja",
    provider: {
      name: "Lohja palveluliikenne",
      url: "https://www.lohja.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Lohja; termit: palveluliikenne; kutsuliikenne",
  },
  {
    municipality: "loviisa",
    provider: {
      name: "Loviisa palveluliikenne",
      url: "https://www.loviisa.fi/tiedotteet/kylakyyti-starttaa-tammikuun-puolessa-valissa/",
      group: 'Palveluliikenne',
    },
    evidence: "Kyläkyyti starttaa tammikuun puolessa välissä - Loviisan kaupunki; termit: kyläkyyti",
  },
  {
    municipality: "luoto",
    provider: {
      name: "Luoto VIP-palvelulinja",
      url: "https://larsmo.fi/vard-och-omsorg/seniortjanster/servicelinjen-vip/",
      group: 'Palveluliikenne',
    },
    evidence: "Servicelinjen VIP - Larsmo; termit: servicelinje; palvelulinja; tarkistettu 2026-07-09",
  },
  {
    municipality: "luhanka",
    provider: {
      name: "Luhanka palveluliikenne",
      url: "https://www.luhanka.fi/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne &#8211; Luhanka; termit: asiointiliikenne; asiointikyyti",
  },
  {
    municipality: "masku",
    provider: {
      name: "Masku palveluliikenne",
      url: "https://masku.fi/joukko-ja-palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukko- ja palveluliikenne? - Masku; termit: palveluliikenne",
  },
  {
    municipality: "miehikkälä",
    provider: {
      name: "Miehikkälä palveluliikenne",
      url: "https://www.miehikkala.fi/palvelut/muut-palvelut/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Miehikkälän kunta; termit: palveluliikenne",
  },
  {
    municipality: "mikkeli",
    provider: {
      name: "Mikkeli palveluliikenne",
      url: "https://mikkeli.fi/category/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne &#8211; Mikkeli; termit: palveluliikenne",
  },
  {
    municipality: "muonio",
    provider: {
      name: "Muonio palveluliikenne",
      url: "https://www.muonio.fi/asuminen-ja-ymparisto/joukkoliikenne.html",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Muonion kunta; termit: asiointiliikenne; kutsuliikenne",
  },
  {
    municipality: "muurame",
    provider: {
      name: "Muurame palveluliikenne",
      url: "https://www.muurame.fi/palvelut/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne - Muurame; termit: palveluliikenne",
  },
  {
    municipality: "mynämäki",
    provider: {
      name: "Mynämäki palveluliikenne",
      url: "https://www.mynamaki.fi/asuminen-ja-ymparisto/liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne | Mynämäki; termit: kutsutaksi",
  },
  {
    municipality: "myrskylä",
    provider: {
      name: "Myrskylä palveluliikenne",
      url: "https://myrskyla.fi/palvelut/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne Porvooseen ja Orimattilaan | Myrskylän kunta; termit: palveluliikenne",
  },
  {
    municipality: "mänttä-vilppula",
    provider: {
      name: "Mänttä-vilppula palveluliikenne",
      url: "https://manttavilppula.fi/asuminen-ja-ymparisto/liikenneyhteydet/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne | Mänttä-Vilppula; termit: palveluliikenne",
  },
  {
    municipality: "naantali",
    provider: {
      name: "Naantali palveluliikenne",
      url: "https://www.naantali.fi/fi/asuminen-ja-ymparisto/liikenne-ja-veneily/joukkoliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne | Naantali; termit: palveluliikenne; kutsuliikenne",
  },
  {
    municipality: "nivala",
    provider: {
      name: "Nivala palveluliikenne",
      url: "https://www.nivala.fi/asuminen-ja-ymp%C3%A4risto/nivalan-palveluliikenne-kylakyyti",
      group: 'Palveluliikenne',
    },
    evidence: "Nivalan Palveluliikenne Kyläkyyti | Nivalan kaupunki; termit: palveluliikenne; kyläkyyti",
  },
  {
    municipality: "nokia",
    provider: {
      name: "Nokia palveluliikenne",
      url: "https://www.nokiankaupunki.fi/asuminen-ja-ymparisto/liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Nokian kaupunki; termit: palveluliikenne; kutsutaksi",
  },
  {
    municipality: "närpiö",
    provider: {
      name: "Närpiö palveluliikenne",
      url: "https://www.narpes.fi/wp-content/uploads/2026/02/Service_Bilaga-A-Rutter.pdf",
      group: 'Palveluliikenne',
    },
    evidence: "Närpes stads servicetrafik - rutter; termit: servicetrafik; tarkistettu 2026-07-09",
  },
  {
    municipality: "nurmijärvi",
    provider: {
      name: "Nurmijärvi palveluliikenne",
      url: "https://www.nurmijarvi.fi/kuntalaisen-palvelut/maankaytto-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukko&shy;liikenne - Nurmijärvi; termit: palveluliikenne",
  },
  {
    municipality: "orimattila",
    provider: {
      name: "Orimattila palveluliikenne",
      url: "https://orimattila.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne-ja-palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne &#x2d; Orimattilan kaupunki; termit: palveluliikenne; kutsuliikenne; palvelubussi",
  },
  {
    municipality: "orivesi",
    provider: {
      name: "Orivesi palveluliikenne",
      url: "https://orivesi.fi/2025/08/06/joukkoliikenneuutisia-nyssen-96-linjalla-reilusti-kayttajia-talviaikataulut-astuivat-voimaan-ja-junien-matkustajamaarat-kasvussa/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenneuutisia: Nyssen 96-linjalla reilusti käyttäjiä, talviaikataulut astuivat voimaan ja junien matkustajamäärät kasvussa | Orivesi; termit: palveluliikenne; kutsuliikenne",
  },
  {
    municipality: "oulainen",
    provider: {
      name: "Oulainen palveluliikenne",
      url: "https://www.oulainen.fi/palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne | Oulainen; termit: palveluliikenne; asiointiliikenne; kutsuliikenne",
  },
  {
    municipality: "oulu",
    provider: {
      name: "Oulu palveluliikenne",
      url: "https://www.ouka.fi/liikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne | Oulun kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "outokumpu",
    provider: {
      name: "Outokumpu palveluliikenne",
      url: "https://www.outokummunkaupunki.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Outokummun kaupunki; termit: asiointiliikenne",
  },
  {
    municipality: "padasjoki",
    provider: {
      name: "Padasjoki palveluliikenne",
      url: "https://www.padasjoki.fi/elinvoima-ja-tyollisyys/joukkoliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Padasjoki; termit: kutsutaksi",
  },
  {
    municipality: "paltamo",
    provider: {
      name: "Paltamo palveluliikenne",
      url: "https://www.paltamo.fi/asuminen-ja-ymparisto/asiointiliikenne.html",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Paltamon kunta; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "parikkala",
    provider: {
      name: "Parikkala palveluliikenne",
      url: "https://parikkala.fi/asuminen-ja-ymparisto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Parikkala; termit: asiointiliikenne",
  },
  {
    municipality: "parkano",
    provider: {
      name: "Parkano palveluliikenne",
      url: "https://parkano.fi/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne | Parkano; termit: palveluliikenne",
  },
  {
    municipality: "pelkosenniemi",
    provider: {
      name: "Pelkosenniemi palveluliikenne",
      url: "https://pelkosenniemi.fi/asuminen-ja-ymparisto/liikenneyhteydet-ja-liikenneturva/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenneyhteydet ja liikenneturva - Pelkosenniemi; termit: asiointiliikenne",
  },
  {
    municipality: "pietarsaari",
    provider: {
      name: "Pietarsaari Vippari",
      url: "https://jakobstad.fi/trafikforbindelser",
      group: 'Palveluliikenne',
    },
    evidence: "Trafikförbindelser - Jakobstad; Vippari bokningsstyrd kollektivtrafik; tarkistettu 2026-07-09",
  },
  {
    municipality: "pieksämäki",
    provider: {
      name: "Pieksämäki palveluliikenne",
      url: "https://www.pieksamaki.fi/asukkaat-ja-ymparisto/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne - Pieksämäen kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "pirkkala",
    provider: {
      name: "Pirkkala palveluliikenne",
      url: "https://www.pirkkala.fi/liikenne-ja-kadut/palvelubussi/",
      group: 'Palveluliikenne',
    },
    evidence: "Palvelubussi - Pirkkala; termit: palveluliikenne; palvelubussi",
  },
  {
    municipality: "polvijärvi",
    provider: {
      name: "Polvijärvi palveluliikenne",
      url: "https://www.polvijarvi.fi/julkinen-liikenne-ja-asiointiliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Julkinen liikenne ja asiointiliikenne - polvijarvi.fi; termit: asiointiliikenne",
  },
  {
    municipality: "pornainen",
    provider: {
      name: "Pornainen palveluliikenne",
      url: "https://pornainen.fi/kuntalaiset/joukkoliikenne-ja-aikataulut/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne ja aikataulut - Pornainen; termit: palvelubussi",
  },
  {
    municipality: "porvoo",
    provider: {
      name: "Porvoo palveluliikenne",
      url: "https://www.porvoo.fi/asuminen-ymparisto/kadut-ja-liikenne/porvoon-bussi/kylakyyti/",
      group: 'Palveluliikenne',
    },
    evidence: "Kyläkyyti - Porvoo; termit: kutsuliikenne; kyläkyyti",
  },
  {
    municipality: "posio",
    provider: {
      name: "Posio palveluliikenne",
      url: "https://www.posio.fi/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Posion kunta; termit: asiointiliikenne; kutsuliikenne; kutsutaksi",
  },
  {
    municipality: "pudasjärvi",
    provider: {
      name: "Pudasjärvi palveluliikenne",
      url: "https://www.pudasjarvi.fi/asuminen-ja-ymparisto/liikenneyhteydet/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Pudasjärvi; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "puumala",
    provider: {
      name: "Puumala palveluliikenne",
      url: "https://puumala.fi/asuminen-ja-ymparisto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne | Puumala; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "pyhäjärvi",
    provider: {
      name: "Pyhäjärvi palveluliikenne",
      url: "https://www.pyhajarvi.fi/fi/palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne | Pyhäjärvi; termit: palveluliikenne; kutsutaksi; palvelubussi",
  },
  {
    municipality: "pyhäntä",
    provider: {
      name: "Pyhäntä palveluliikenne",
      url: "https://pyhanta.fi/joukkoliikenneyhteydet",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenneyhteydet | Pyhäntä; termit: asiointiliikenne",
  },
  {
    municipality: "pyhäranta",
    provider: {
      name: "Pyhäranta palveluliikenne",
      url: "https://www.pyharanta.fi/asuminen/liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Pyhäranta; termit: palveluliikenne",
  },
  {
    municipality: "pälkäne",
    provider: {
      name: "Pälkäne palveluliikenne",
      url: "https://www.palkane.fi/liikennekatkos-peruttu-lauantailta/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikennekatkos peruttu lauantailta! &#x2d; palkane; termit: palveluliikenne",
  },
  {
    municipality: "pöytyä",
    provider: {
      name: "Pöytyä palveluliikenne",
      url: "https://www.poytya.fi/asu-ja-rakenna/asuminen/asiointiliikenne-ja-julkinen-liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne ja julkinen liikenne | Pöytyän kunta; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "raahe",
    provider: {
      name: "Raahe palveluliikenne",
      url: "https://www.raahe.fi/asuminen/liikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne | Raahe.fi; termit: palveluliikenne; kutsuliikenne; kutsutaksi; palvelubussi",
  },
  {
    municipality: "rantasalmi",
    provider: {
      name: "Rantasalmi palveluliikenne",
      url: "https://rantasalmi.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne | Rantasalmen kunta; termit: asiointiliikenne",
  },
  {
    municipality: "ranua",
    provider: {
      name: "Ranua palveluliikenne",
      url: "https://ranua.fi/asuminen-ja-rakentaminen/asuminen/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Ranua; termit: asiointiliikenne",
  },
  {
    municipality: "rauma",
    provider: {
      name: "Rauma palveluliikenne",
      url: "https://www.rauma.fi/asuminen-ja-rakentaminen/kadut-ja-liikenne/joukkoliikenne/reitit-ja-aikataulut/",
      group: 'Palveluliikenne',
    },
    evidence: "Reitit ja aikataulut - Rauman kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "rautavaara",
    provider: {
      name: "Rautavaara palveluliikenne",
      url: "https://www.rautavaara.fi/asukkaille/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Rautavaaran kunta; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "rautjärvi",
    provider: {
      name: "Rautjärvi palveluliikenne",
      url: "https://www.rautjarvi.fi/fi/asuminen-ja-ymparisto/asiointiliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Rautjärvi; termit: asiointiliikenne; asiointikyyti",
  },
  {
    municipality: "ristijärvi",
    provider: {
      name: "Ristijärvi palveluliikenne",
      url: "https://www.ristijarvi.fi/asuminen-ja-ymparisto/asiointi-ja-joukkoliikenne.html",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointi- ja joukkoliikenne; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "ruovesi",
    provider: {
      name: "Ruovesi palveluliikenne",
      url: "https://www.ruovesi.fi/ruoveden-kunnan-asiointiliikenne-kesa-2026-16-982026",
      group: 'Palveluliikenne',
    },
    evidence: "Tiedotteet - Ruoveden kunta; termit: asiointiliikenne",
  },
  {
    municipality: "rääkkylä",
    provider: {
      name: "Rääkkylä palveluliikenne",
      url: "https://www.raakkyla.fi/asuminen-rakentaminen-ja-ymparisto/liikenne-satama-ja-tieverkko/joukkoliikenne-ja-taksit/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne ja taksit - Rääkkylä; termit: asiointiliikenne",
  },
  {
    municipality: "salla",
    provider: {
      name: "Salla palveluliikenne",
      url: "https://www.salla.fi/palvelut/asuminen-rakentaminen-ja-ymparisto/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne | Sallan Kunta; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "salo",
    provider: {
      name: "Salo palveluliikenne",
      url: "https://salonpaikku.fi/",
      group: 'Palveluliikenne',
    },
    evidence: "Etusivu - Salon Paikku; termit: palveluliikenne",
  },
  {
    municipality: "sastamala",
    provider: {
      name: "Sastamala palveluliikenne",
      url: "https://sastamala.fi/asuminen-ja-ymparisto/kadut-liikenne-ja-rakennettu-ymparisto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Sastamala; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "sauvo",
    provider: {
      name: "Sauvo palveluliikenne",
      url: "https://www.sauvo.fi/sauvon-sisainen-asiointiliikenne-22-4-alkaen/",
      group: 'Palveluliikenne',
    },
    evidence: "Sauvon sisäinen asiointiliikenne 22.4. alkaen - Sauvon kunnan kotisivut; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "savonlinna",
    provider: {
      name: "Savonlinna palveluliikenne",
      url: "https://www.savonlinna.fi/asukas/kadut-ja-liikenne/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne - Savonlinna; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "savukoski",
    provider: {
      name: "Savukoski palveluliikenne",
      url: "https://www.savukoski.fi/elinkeino/kutsutaksi/",
      group: 'Palveluliikenne',
    },
    evidence: "Kutsutaksi 2026 | Savukosken kunta; termit: kutsutaksi",
  },
  {
    municipality: "seinäjoki",
    provider: {
      name: "Seinäjoki palveluliikenne",
      url: "https://www.seinajoki.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne | Seinäjoen kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "siikajoki",
    provider: {
      name: "Siikajoki palveluliikenne",
      url: "https://www.siikajoki.fi/joukkoliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne | Siikajoki; termit: asiointiliikenne",
  },
  {
    municipality: "siikalatva",
    provider: {
      name: "Siikalatva palveluliikenne",
      url: "https://siikalatva.fi/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Siikalatva; termit: asiointiliikenne",
  },
  {
    municipality: "siilinjärvi",
    provider: {
      name: "Siilinjärvi palveluliikenne",
      url: "https://siilinjarvi.fi/asuminen-ja-ymparisto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Siilinjärven kunnan verkkosivut; termit: palveluliikenne",
  },
  {
    municipality: "sodankylä",
    provider: {
      name: "Sodankylä palveluliikenne",
      url: "https://www.sodankyla.fi/asuminen-ja-ymparisto/tiet-reitit-ja-liikenne/liikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Liikennepalvelut | Sodankylän kunta; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "somero",
    provider: {
      name: "Somero palveluliikenne",
      url: "https://www.somero.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne | Somero; termit: asiointiliikenne",
  },
  {
    municipality: "sotkamo",
    provider: {
      name: "Sotkamo palveluliikenne",
      url: "https://www.sotkamo.fi/kunta-ja-hallinto-2/tietoa-kunnasta/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Sotkamo; termit: asiointiliikenne; kutsutaksi",
  },
  {
    municipality: "suonenjoki",
    provider: {
      name: "Suonenjoki palveluliikenne",
      url: "https://suonenjoki.fi/asuminen-ja-ymparisto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Suonenjoki; termit: kutsutaksi",
  },
  {
    municipality: "sysmä",
    provider: {
      name: "Sysmä palveluliikenne",
      url: "https://sysma.fi/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Sysmä; termit: kutsutaksi",
  },
  {
    municipality: "taivassalo",
    provider: {
      name: "Taivassalo palveluliikenne",
      url: "https://www.taivassalo.fi/matkailu/joukko-ja-palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukko- ja palveluliikenne :: Taivassalon kunta; termit: palveluliikenne",
  },
  {
    municipality: "tervo",
    provider: {
      name: "Tervo palveluliikenne",
      url: "https://www.tervo.fi/asiointiliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Tervo; termit: asiointiliikenne",
  },
  {
    municipality: "toivakka",
    provider: {
      name: "Toivakka palveluliikenne",
      url: "https://www.toivakka.fi/kunta-ja-hallinto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Toivakka; termit: palveluliikenne; asiointikyyti",
  },
  {
    municipality: "tornio",
    provider: {
      name: "Tornio palveluliikenne",
      url: "https://www.tornio.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Julkinen liikenne - Tornio; termit: palveluliikenne",
  },
  {
    municipality: "tuusniemi",
    provider: {
      name: "Tuusniemi palveluliikenne",
      url: "https://www.tuusniemi.fi/kymppikyydit-eli-asiointiliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Kymppikyydit eli asiointiliikenne - Tuusniemi; termit: asiointiliikenne",
  },
  {
    municipality: "tyrnävä",
    provider: {
      name: "Tyrnävä palveluliikenne",
      url: "https://www.tyrnava.fi/asuminen-ja-ymparisto/liikenne/joukkoliikenne.html",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne - Tyrnävän kunta; termit: palveluliikenne",
  },
  {
    municipality: "urjala",
    provider: {
      name: "Urjala palveluliikenne",
      url: "https://www.urjala.fi/asu-ja-rakenna/joukkoliikenne/asiointikuljetus/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne | Urjalan kunta; termit: asiointiliikenne",
  },
  {
    municipality: "uusikaupunki",
    provider: {
      name: "Uusikaupunki palveluliikenne",
      url: "https://uusikaupunki.fi/fi/joukkoliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne | Uudenkaupungin kaupunki; termit: palveluliikenne; kutsuliikenne",
  },
  {
    municipality: "vaala",
    provider: {
      name: "Vaala palveluliikenne",
      url: "https://www.vaala.fi/asiointiliikenne-1-8-alkaen/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne 1.8. alkaen - Vaalan Kunta; termit: asiointiliikenne",
  },
  {
    municipality: "vaasa",
    provider: {
      name: "Vaasa palveluliikenne",
      url: "https://www.vaasa.fi/asu-ja-ela/liikenne-ja-kadut/joukkoliikenne/palvelubussit/",
      group: 'Palveluliikenne',
    },
    evidence: "Palvelubussit | Vaasa; termit: kutsujoukkoliikenne; palvelubussi",
  },
  {
    municipality: "varkaus",
    provider: {
      name: "Varkaus palveluliikenne",
      url: "https://varkaus.fi/fi/sivu/kaupunkiymparisto/liikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Liikenne | Varkaus; termit: palveluliikenne",
  },
  {
    municipality: "vesanto",
    provider: {
      name: "Vesanto palveluliikenne",
      url: "https://vesanto.fi/kuuslahti-kutsutaksi/",
      group: 'Palveluliikenne',
    },
    evidence: "Kuuslahti/Kutsutaksi - Vesannon kunta; termit: kutsutaksi; asiointikyyti",
  },
  {
    municipality: "vesilahti",
    provider: {
      name: "Vesilahti palveluliikenne",
      url: "https://www.vesilahti.fi/vapaa-aika/senioripalvelut/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne - Vesilahti; termit: asiointiliikenne",
  },
  {
    municipality: "vieremä",
    provider: {
      name: "Vieremä palveluliikenne",
      url: "https://vierema.fi/kutsuohjattu-palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Kutsuohjattu palveluliikenne - Vierema; termit: palveluliikenne; asiointiliikenne",
  },
  {
    municipality: "vihti",
    provider: {
      name: "Vihti palveluliikenne",
      url: "https://www.vihti.fi/kategoria/liikenne-ja-joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Sivulta löytyi palveluliikenteeseen liittyvä sisältö; termit: palveluliikenne",
  },
  {
    municipality: "viitasaari",
    provider: {
      name: "Viitasaari palveluliikenne",
      url: "https://viitasaari.fi/?nt_wmc_folder=palveluliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne arkistot - Viitasaari; termit: palveluliikenne",
  },
  {
    municipality: "virolahti",
    provider: {
      name: "Virolahti palveluliikenne",
      url: "https://virolahti.fi/asuminen-ja-ymparisto/ymparisto/joukkoliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne ja palveluliikenne - Virolahti; termit: palveluliikenne",
  },
  {
    municipality: "virrat",
    provider: {
      name: "Virrat palveluliikenne",
      url: "https://www.virrat.fi/hyvinvoinnin-toimiala134460894/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne | Virtain kaupunki; termit: palveluliikenne",
  },
  {
    municipality: "ylitornio",
    provider: {
      name: "Ylitornio palveluliikenne",
      url: "https://ylitornio.fi/asuminen-ja-ymparisto/asiointiliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Asiointiliikenne &#8211; Ylitornio; termit: asiointiliikenne",
  },
  {
    municipality: "ylöjärvi",
    provider: {
      name: "Ylöjärvi palveluliikenne",
      url: "https://www.ylojarvi.fi/palveluliikenne/",
      group: 'Palveluliikenne',
    },
    evidence: "Palveluliikenne - Ylöjärvi; termit: palveluliikenne; asiointiliikenne; palvelubussi",
  },
  {
    municipality: "äänekoski",
    provider: {
      name: "Äänekoski palveluliikenne",
      url: "https://www.aanekoski.fi/asuminen-ja-ymparisto/kaupunkiymparisto-ja-liikenne/joukkoliikenne",
      group: 'Palveluliikenne',
    },
    evidence: "Joukkoliikenne; termit: palveluliikenne; asiointiliikenne",
  },
];
