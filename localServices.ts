import { MUNICIPALITIES } from './municipalRegistry';
import { MUNICIPALITY_WEBSITES } from './municipalityWebsites';
import { MUNICIPALITY_WEBSITE_LANGUAGE_URLS } from './municipalityWebsiteLocales';
import { MUNICIPALITY_SWEDISH_NAMES_BY_CODE } from './municipalityNames';
import { MUNICIPALITY_NEWS_FEEDS } from './municipalityNewsFeeds';
import { LOCAL_NEWSPAPER_FEEDS } from './localNewspaperFeeds';
import { LOCAL_NEWSPAPER_LINKS } from './localNewspaperLinks';
import { LOCAL_SERVICE_TRANSPORT_LINKS } from './localServiceTransportLinks';
import { LOCAL_SPORTS_CLUBS } from './localSportsClubs';
import { KELA_TAXI_PROVIDERS } from './localKelaTaxiNumbers';
import type { RegionalProvider } from './communityLinks';
import { SHORTCUTS } from './constants';
import { filterVisibleProviders } from './linkVisibility';
import { LocalityInfo, Municipality, Provider, RegionalContext, RegionalProviderScope, RssFeedConfig, Shortcut } from './types';
import type { LanguageCode } from './i18n';

interface LocalServiceConfig {
  publicTransport?: Provider;
  serviceTransport?: Provider[];
  library?: Provider;
  wellbeingArea?: Provider;
  municipality?: Provider;
  regionalNews?: Provider[];
  rssFeeds?: RssFeedConfig[];
}

interface RegionalServiceArea {
  id: string;
  name: string;
  municipalities: string[];
  services: Pick<LocalServiceConfig, 'publicTransport'>;
}

interface RegionalLibraryArea {
  id: string;
  municipalities: string[];
  provider: Provider;
}

const municipalityAliases: Record<string, string> = {
  esbo: 'espoo',
  grankulla: 'kauniainen',
  helsingfors: 'helsinki',
  helsingin: 'helsinki',
  helsingissä: 'helsinki',
  helsingista: 'helsinki',
  helsingistä: 'helsinki',
  vanda: 'vantaa',
  abo: 'turku',
  åbo: 'turku',
  tammerfors: 'tampere',
  uleaborg: 'oulu',
  jyvaskyla: 'jyväskylä',
  mariehamn: 'maarianhamina',
};

const wellbeingAreaUrls: Record<string, string> = {
  '01': 'https://itauusimaa.fi/',
  '02': 'https://www.keusote.fi/',
  '03': 'https://www.luvn.fi/',
  '04': 'https://vakehyva.fi/',
  '05': 'https://www.varha.fi/',
  '06': 'https://sata.fi/',
  '07': 'https://omahame.fi/',
  '08': 'https://www.pirha.fi/',
  '09': 'https://paijatha.fi/',
  '10': 'https://kymenhva.fi/',
  '11': 'https://www.ekhva.fi/',
  '12': 'https://etelasavonha.fi/',
  '13': 'https://pshyvinvointialue.fi/',
  '14': 'https://www.siunsote.fi/',
  '15': 'https://www.hyvaks.fi/',
  '16': 'https://www.hyvaep.fi/',
  '17': 'https://pohjanmaanhyvinvointi.fi/',
  '18': 'https://soite.fi/',
  '19': 'https://pohde.fi/',
  '20': 'https://kainuunhyvinvointialue.fi/',
  '21': 'https://lapha.fi/',
  '90': 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut',
  '91': 'https://www.aland.ax/sv',
};

const wellbeingAreaNewsUrls: Record<string, string> = {
  '01': 'https://itauusimaa.fi/ajankohtaista/',
  '02': 'https://www.keusote.fi/ajankohtaista/',
  '03': 'https://www.luvn.fi/fi/haku?q=&type=news',
  '04': 'https://vakehyva.fi/fi/ajankohtaista',
  '05': 'https://www.varha.fi/fi/ajankohtaista',
  '06': 'https://sata.fi/ajankohtaista/',
  '07': 'https://omahame.fi/uutiset',
  '08': 'https://www.pirha.fi/ajankohtaista/pirha-nyt',
  '09': 'https://paijatha.fi/ajankohtaista/',
  '10': 'https://kymenhva.fi/kategoria/uutiset/',
  '11': 'https://www.ekhva.fi/hyvinvointialue/ajankohtaista/',
  '12': 'https://etelasavonha.fi/eloisa/uutiset/',
  '13': 'https://pshyvinvointialue.fi/fi/ajankohtaiset',
  '14': 'https://www.siunsote.fi/ajankohtaista/',
  '15': 'https://www.hyvaks.fi/uutiset',
  '16': 'https://www.hyvaep.fi/ajankohtaista/',
  '17': 'https://pohjanmaanhyvinvointi.fi/tietoa-meista/ajankohtaista/uutiset/',
  '18': 'https://soite.fi/soite/ajankohtaista/',
  '19': 'https://pohde.fi/ajankohtaista/',
  '20': 'https://hyvinvointialue.kainuu.fi/tiedotteet',
  '21': 'https://lapha.fi/ajankohtaista',
  '90': 'https://www.hel.fi/fi/uutiset',
  '91': 'https://www.ahs.ax/nyheter',
};

const normalizeText = (value: string) => value
  .trim()
  .toLocaleLowerCase('fi-FI')
  .replace(/[.,;:!?()\[\]{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const normalizeMunicipality = (name: string) => {
  const normalized = normalizeText(name)
    .replace(/^kunta\s+/i, '')
    .replace(/\s+kaupunki$/i, '')
    .replace(/\s+kunta$/i, '')
    .replace(/\s+seutukunta$/i, '')
    .replace(/\s+-\s+.*$/i, '')
    .trim();

  return municipalityAliases[normalized] ?? normalized;
};

const municipalitiesByNormalizedName = new Map<string, Municipality>(
  MUNICIPALITIES.map((municipality) => [normalizeMunicipality(municipality.name), municipality])
);

const municipalitiesByNormalizedSwedishName = new Map<string, Municipality>(
  MUNICIPALITIES.map((municipality) => [
    normalizeText(MUNICIPALITY_SWEDISH_NAMES_BY_CODE[municipality.code] ?? municipality.name),
    municipality,
  ])
);

export interface RegionalProviderScopeInfo {
  scope: RegionalProviderScope;
  detail?: string;
}

const getMunicipalityNameFromKey = (municipalityKey: string) => (
  municipalitiesByNormalizedName.get(normalizeMunicipality(municipalityKey))?.name ?? municipalityKey
);

const getMunicipalityNamesFromKeys = (municipalityKeys: string[]) => (
  municipalityKeys.map(getMunicipalityNameFromKey)
);

const withRegionalScope = (provider: Provider | undefined, meta: Partial<Provider>): Provider | undefined => (
  provider ? { ...provider, ...meta } : undefined
);

const withMunicipalityScope = (provider: Provider | undefined, municipality: string): Provider | undefined => (
  withRegionalScope(provider, {
    municipality,
    sourceMunicipality: municipality,
    scope: 'municipality',
  })
);

const withRegionalAreaScope = (provider: Provider | undefined, area: { name: string; municipalities: string[] }): Provider | undefined => (
  withRegionalScope(provider, {
    municipalities: getMunicipalityNamesFromKeys(area.municipalities),
    sourceArea: area.name,
    scope: 'regional',
  })
);

export const getRegionalProviderScopeInfo = (provider: Provider, context: RegionalContext): RegionalProviderScopeInfo | null => {
  const municipalityKey = normalizeMunicipality(context.municipality.name);
  const sourceMunicipality = provider.sourceMunicipality ?? provider.municipality;
  const sourceMunicipalityKey = sourceMunicipality ? normalizeMunicipality(sourceMunicipality) : '';
  const providerMunicipalityKeys = provider.municipalities?.map(normalizeMunicipality) ?? [];
  const sourceArea = provider.sourceArea ?? provider.area;

  if (provider.scope === 'nationalFallback') {
    return { scope: 'nationalFallback' };
  }

  if (provider.scope === 'wellbeingArea') {
    return { scope: 'wellbeingArea', detail: sourceArea ?? context.municipality.wellbeingAreaName };
  }

  if (provider.scope === 'neighbor') {
    return { scope: 'neighbor', detail: sourceMunicipality };
  }

  if (provider.scope === 'regional') {
    return { scope: 'regional', detail: sourceArea };
  }

  if (provider.scope === 'municipality') {
    if (!sourceMunicipality || sourceMunicipalityKey === municipalityKey) {
      return { scope: 'municipality' };
    }
    return { scope: 'neighbor', detail: sourceMunicipality };
  }

  if (sourceMunicipality) {
    return sourceMunicipalityKey === municipalityKey
      ? { scope: 'municipality' }
      : { scope: 'neighbor', detail: sourceMunicipality };
  }

  if (providerMunicipalityKeys.includes(municipalityKey)) {
    return { scope: 'regional', detail: sourceArea };
  }

  const groupMunicipality = provider.group ? findMunicipality(provider.group) : null;
  if (groupMunicipality && normalizeMunicipality(groupMunicipality.name) === municipalityKey) {
    return { scope: 'municipality' };
  }

  if (sourceArea) {
    return { scope: 'regional', detail: sourceArea };
  }

  return null;
};

export const getLocalizedMunicipalityName = (municipality: Municipality | null | undefined, language: string) => {
  if (!municipality) return '';
  if (language === 'sv') {
    return MUNICIPALITY_SWEDISH_NAMES_BY_CODE[municipality.code] ?? municipality.name;
  }
  return municipality.name;
};

const getMunicipalityWebsiteUrl = (municipality: string, language: LanguageCode = 'fi') => {
  const key = normalizeMunicipality(municipality);
  return MUNICIPALITY_WEBSITE_LANGUAGE_URLS[key]?.[language]
    ?? MUNICIPALITY_WEBSITES[key]
    ?? MUNICIPALITY_WEBSITES[normalizeText(municipality)];
};

const getMunicipalityWebsiteProvider = (municipality: string, language: LanguageCode = 'fi'): Provider | undefined => {
  const url = getMunicipalityWebsiteUrl(municipality, language);
  if (!url) return undefined;

  return {
    name: `Kunnan palvelut: ${municipality}`,
    url,
    group: 'Paikalliset palvelut',
    municipality,
    sourceMunicipality: municipality,
    scope: 'municipality',
  };
};

const localizeMunicipalityProvider = (provider: Provider | undefined, municipality: string, language: LanguageCode = 'fi'): Provider | undefined => {
  if (!provider) return provider;
  const url = getMunicipalityWebsiteUrl(municipality, language);
  return url ? {
    ...provider,
    url,
    municipality: provider.municipality ?? municipality,
    sourceMunicipality: provider.sourceMunicipality ?? provider.municipality ?? municipality,
    scope: provider.scope ?? 'municipality',
  } : provider;
};

const regionalServiceAreas: RegionalServiceArea[] = [
  {
    id: 'helsinki-region',
    name: 'Helsingin seutu',
    municipalities: ['espoo', 'helsinki', 'kauniainen', 'kerava', 'kirkkonummi', 'siuntio', 'sipoo', 'tuusula', 'vantaa'],
    services: {
      publicTransport: { name: 'HSL', url: 'https://www.hsl.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'tampere-region',
    name: 'Tampereen kaupunkiseutu',
    municipalities: ['kangasala', 'lempäälä', 'nokia', 'orivesi', 'pirkkala', 'tampere', 'vesilahti', 'ylöjärvi'],
    services: {
      publicTransport: { name: 'Nysse', url: 'https://www.nysse.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'vau-region',
    name: 'Valkeakoski-Akaa-Urjala',
    municipalities: ['akaa', 'valkeakoski', 'urjala'],
    services: {
      publicTransport: { name: 'VAU-liikenne', url: 'https://akaa.fi/meidan-akaa/liikenneyhteydet/vau/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'turku-region',
    name: 'Turun seutu',
    municipalities: ['kaarina', 'lieto', 'naantali', 'paimio', 'raisio', 'rusko', 'turku'],
    services: {
      publicTransport: { name: 'Föli', url: 'https://www.foli.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'seutuplus-varsinais-suomi-region',
    name: 'Seutu+ Varsinais-Suomi',
    municipalities: [
      'aura',
      'kemiönsaari',
      'koski tl',
      'kustavi',
      'laitila',
      'loimaa',
      'marttila',
      'masku',
      'mynämäki',
      'nousiainen',
      'oripää',
      'parainen',
      'pyhäranta',
      'pöytyä',
      'salo',
      'sauvo',
      'somero',
      'taivassalo',
      'uusikaupunki',
      'vehmaa',
    ],
    services: {
      publicTransport: {
        name: 'Seutu+',
        url: 'https://seutuplus.fi/aikataulut/',
        group: 'Julkinen liikenne',
        sourceNote: 'Seutu+ kokoaa Varsinais-Suomen seutuliikenteen reitit, aikataulut ja lipputuotteet. Kausilipun kelpoisuusalueet vahvistavat mm. Auran, Kemiönsaaren, Loimaan seudun, Salon/Someron, Paraisten, Kustavin, Uudenkaupungin ja Vehmaan yhteydet.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'oulu-region',
    name: 'Oulun seutu',
    municipalities: ['ii', 'kempele', 'liminka', 'lumijoki', 'muhos', 'oulu', 'tyrnävä', 'utajärvi'],
    services: {
      publicTransport: { name: 'Oulun joukkoliikenne', url: 'https://www.oulunjoukkoliikenne.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'meri-lappi-region',
    name: 'Meri-Lappi',
    municipalities: ['kemi', 'keminmaa', 'simo', 'tervola', 'tornio'],
    services: {
      publicTransport: {
        name: 'Meri-Lapin joukkoliikenne',
        url: 'https://meri-lapinjoukkoliikenne.fi/aikataulut-ja-reitit/',
        group: 'Julkinen liikenne',
        sourceNote: 'Meri-Lapin joukkoliikennesivu kokoaa Kemin, Keminmaan, Simon, Tervolan ja Tornion seutu- ja kaupunkiliikenteen aikataulut ja reitit.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'rundgren-lansi-lappi-region',
    name: 'Liikenne Rundgren Länsi-Lappi',
    municipalities: ['enontekiö', 'kolari', 'muonio'],
    services: {
      publicTransport: {
        name: 'Liikenne Rundgren reitit',
        url: 'https://www.rundgrenoy.fi/',
        group: 'Julkinen liikenne',
        sourceNote: 'Liikenne Rundgren kertoo ajavansa päivittäin linjavuoroa Kolarista Muonioon ja Kolari-Muonio-Vuontisjärvi-Hetta-yhteyttä sekä listaa Kolari-Hetta-, Kolari-Rovaniemi-, Kolari-Kemi- ja Kolari-Muonio-reitit.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'jyvaskyla-region',
    name: 'Jyväskylän seutu',
    municipalities: ['hankasalmi', 'jyväskylä', 'laukaa', 'muurame', 'petäjävesi', 'toivakka', 'äänekoski'],
    services: {
      publicTransport: { name: 'Linkki-paikallisliikenne', url: 'https://linkki.jyvaskyla.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'matkahuolto-keski-suomi-tickets-region',
    name: 'Matkahuollon Keski-Suomen liput',
    municipalities: ['joutsa', 'kannonkoski', 'konnevesi', 'luhanka', 'pihtipudas', 'saarijärvi', 'viitasaari'],
    services: {
      publicTransport: {
        name: 'Keski-Suomen liput',
        url: 'https://www.matkahuolto.fi/matkustajat/keski-suomen-liput',
        group: 'Julkinen liikenne',
        sourceNote: 'Matkahuollon Keski-Suomen lipputuotteet vahvistavat kuntarajat ylittävät yhteysvälit Konnevesi-Äänekoski, Pihtipudas-Viitasaari, Kannonkoski-Saarijärvi ja Luhanka-Joutsa.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'tillgren-kinnula-kivijarvi-region',
    name: 'Tillgren Lines Kivijärvi-Kinnula',
    municipalities: ['kinnula', 'kivijärvi'],
    services: {
      publicTransport: {
        name: 'Tillgren Lines Kivijärvi-Kinnula',
        url: 'https://www.tillgrenlines.fi/linjaliikenne/',
        group: 'Julkinen liikenne',
        sourceNote: 'Tillgren Linesin linjaliikennesivu kertoo Kivijärveltä Kinnulaan ajettavista vuoroista ja siitä, että Kinnulaan suuntautuvia vuoroja voi käyttää kuka tahansa kyytiä tarvitseva. Kinnulan koulukuljetussivu vahvistaa reitin 7.8.2025 alkaen.',
        verifiedAt: '2026-07-10',
      },
    },
  },
  {
    id: 'onnibus-kyyjarvi-region',
    name: 'OnniBus Kyyjärvi',
    municipalities: ['kyyjärvi'],
    services: {
      publicTransport: {
        name: 'OnniBus Kyyjärvi',
        url: 'https://www.onnibus.com/kyyjarvi-kauppakeskus-paletti',
        group: 'Julkinen liikenne',
        sourceNote: 'OnniBusin pysäkkisivu nimeää Kyyjärven kauppakeskus Paletin pysäkiksi ja OnniBusin Kyyjärvi-reittisivu kuvaa Helsinki-Kyyjärvi-yhteyden.',
        verifiedAt: '2026-07-10',
      },
    },
  },
  {
    id: 'lamminmaki-kihnio-region',
    name: 'A. Lamminmäki Kihniö-Parkano',
    municipalities: ['kihniö'],
    services: {
      publicTransport: {
        name: 'A. Lamminmäki Kihniö-Parkano',
        url: 'https://www.matkahuolto.fi/matkustajat/lamminmaen-liput-kankaanpaa-parkano',
        group: 'Julkinen liikenne',
        sourceNote: 'Matkahuollon Lamminmäen lippusivu vahvistaa Parkano-Kihniö-kausilipun ja sen, että sarjalipun kelpoisuusalueeseen kuuluu Kihniö ja liput käyvät A. Lamminmäki Oy:n vuoroilla.',
        verifiedAt: '2026-07-10',
      },
    },
  },
  {
    id: 'lansilinjat-jamijarvi-region',
    name: 'Länsilinjat Jämijärvi',
    municipalities: ['jämijärvi'],
    services: {
      publicTransport: {
        name: 'Länsilinjat Jämijärvi',
        url: 'https://lansilinjat.fi/aikataulut-ja-hinnat/',
        group: 'Julkinen liikenne',
        sourceNote: 'Länsilinjojen aikataulusivu ohjaa ajantasaisiin aikatauluihin ja kesän 22.6.-4.8.2026 aikataulu listaa Jämijärven pysäkit Tampere-Ikaalinen-Kankaanpää-yhteydellä molempiin suuntiin.',
        verifiedAt: '2026-07-10',
      },
    },
  },
  {
    id: 'matkahuolto-ingsva-go-pohjanmaa-region',
    name: 'Matkahuollon INGSVA Go Pohjanmaa',
    municipalities: ['kaskinen', 'korsnäs', 'kristiinankaupunki', 'kruunupyy', 'laihia', 'maalahti', 'närpiö', 'pedersören', 'uusikaarlepyy'],
    services: {
      publicTransport: {
        name: 'INGSVA Go',
        url: 'https://www.matkahuolto.fi/matkustajat/kokkola-kristiinankaupunki',
        group: 'Julkinen liikenne',
        sourceNote: 'Matkahuollon INGSVA Go -lippusivu vahvistaa Kokkola-Kristiinankaupunki-yhteysvälin INGSVA:n liikennöimissä vuoroissa ja listaa lipun kelpoisuusalueeseen Kaskisen, Korsnäsin, Kristiinankaupungin, Kruunupyyn, Laihian, Maalahden, Närpiön, Pedersören ja Uudenkaarlepyyn.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'pohjois-savo-joukkis-region',
    name: 'Pohjois-Savo Joukkis',
    municipalities: ['iisalmi', 'keitele', 'kiuruvesi', 'lapinlahti', 'leppävirta', 'pielavesi', 'rautalampi', 'sonkajärvi', 'suonenjoki', 'tuusniemi', 'varkaus', 'vieremä'],
    services: {
      publicTransport: {
        name: 'Joukkis',
        url: 'https://www.matkahuolto.fi/matkustajat/pohjois-savo-joukkis-liput',
        group: 'Julkinen liikenne',
        sourceNote: 'Matkahuollon Pohjois-Savo Joukkis -lippusivu vahvistaa lipun kelpoisuusalueen Pohjois-Savon kuntien välisillä matkoilla, mm. Iisalmi-Kiuruvesi, Iisalmi-Lapinlahti, Iisalmi-Sonkajärvi, Keitele-Pielavesi, Rautalampi-Suonenjoki, Tuusniemi-Kuopio, Varkaus-Leppävirta ja Varkaus-Kuopio.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'vilkku-kaavi-region',
    name: 'Vilkku Kaavi',
    municipalities: ['kaavi'],
    services: {
      publicTransport: {
        name: 'Vilkku linja 90',
        url: 'https://vilkku.kuopio.fi/90-kuopio-riistavesi-juankoski-kaavi',
        group: 'Julkinen liikenne',
        sourceNote: 'Vilkku linjan 90 aikataulusivu vahvistaa Kuopio-Riistavesi-Juankoski-Kaavi-yhteyden ja Kaavin pysähdykset aikataulussa.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'seutuplus-satakunta-jatko-region',
    name: 'Seutu+ Satakunta jatkoalue',
    municipalities: ['merikarvia', 'pomarkku', 'siikainen', 'säkylä'],
    services: {
      publicTransport: {
        name: 'Seutu+',
        url: 'https://seutuplus.fi/aikataulut/',
        group: 'Julkinen liikenne',
        sourceNote: 'Seutu+ kokoaa Satakunnan seutuliikenteen aikatauluja. Merikarvian, Pomarkun, Siikaisten ja Säkylän yhteydet vahvistettiin kuntien, ELY:n ja liikennöitsijöiden ajantasaisista lähteistä.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'huittinen-joukkoliikenne-region',
    name: 'Huittisten joukkoliikenne',
    municipalities: ['huittinen'],
    services: {
      publicTransport: {
        name: 'Huittisten joukkoliikenne',
        url: 'https://www.huittinen.fi/asuminen-ja-ymparisto/asuminen-ymparisto-ja-liikenne/joukkoliikenne/',
        group: 'Julkinen liikenne',
        sourceNote: 'Huittisten joukkoliikennesivu kokoaa kaikille avoimet koulupäivien linja-autovuorot, Huitsikka-palveluliikenteen sekä Matkahuollon ja Matka.fi:n aikataululinkit.',
        verifiedAt: '2026-07-11',
      },
    },
  },
  {
    id: 'kankaanpaa-liikenneyhteydet-region',
    name: 'Kankaanpään liikenneyhteydet',
    municipalities: ['kankaanpää'],
    services: {
      publicTransport: {
        name: 'Kankaanpään liikenneyhteydet',
        url: 'https://www.kankaanpaa.fi/kaupunki-ja-hallinto/kankaanpaa-info/liikenneyhteydet/',
        group: 'Julkinen liikenne',
        sourceNote: 'Kankaanpään liikenneyhteyssivu kertoo useista päivittäisistä Pori-yhteyksistä, ohjaa Seutu+ aikatauluihin ja kuvaa pysyvän Kankaanpää-Parkano-rautatieaseman kutsuliikenteen.',
        verifiedAt: '2026-07-11',
      },
    },
  },
  {
    id: 'rauma-gyyt-region',
    name: 'Rauman Gyyt',
    municipalities: ['rauma'],
    services: {
      publicTransport: {
        name: 'Rauman Gyyt',
        url: 'https://www.rauma.fi/asuminen-ja-rakentaminen/kadut-ja-liikenne/joukkoliikenne/reitit-ja-aikataulut/',
        group: 'Julkinen liikenne',
        sourceNote: 'Rauman reitit ja aikataulut -sivu kokoaa Gyyt-linjat, kesäkauden 2026 aikataulut, reittioppaat sekä Seutu+ ja kaukoliikenteen yhteydet.',
        verifiedAt: '2026-07-11',
      },
    },
  },
  {
    id: 'etela-savo-joukkis-region',
    name: 'Etelä-Savo Joukkis',
    municipalities: ['enonkoski', 'kangasniemi', 'mäntyharju', 'sulkava'],
    services: {
      publicTransport: {
        name: 'Joukkis',
        url: 'https://www.matkahuolto.fi/matkustajat/etela-savo-joukkis-liput',
        group: 'Julkinen liikenne',
        sourceNote: 'Matkahuollon Etelä-Savo Joukkis -lippusivu vahvistaa Enonkosken, Kangasniemen, Mäntyharjun ja Sulkavan kuntarajat ylittäviä yhteysvälejä.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'kainuu-kuntien-valinen-region',
    name: 'Kainuun kuntien välinen joukkoliikenne',
    municipalities: ['kuhmo', 'puolanka', 'suomussalmi'],
    services: {
      publicTransport: {
        name: 'Kainuun kuntien välinen joukkoliikenne',
        url: 'https://kajaaninjoukkoliikenne.fi/kainuun-kuntien-valinen-joukkoliikenne/',
        group: 'Julkinen liikenne',
        sourceNote: 'Kajaanin joukkoliikenteen Kainuun kuntien välinen sivu listaa Kajaani-Sotkamo-Kuhmo-, Kajaani-Paltamo-Puolanka- ja Kajaani-Suomussalmi-Kuusamo-yhteydet.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'lansi-uusimaa-joukkoliikenne-region',
    name: 'Länsi-Uudenmaan joukkoliikenne',
    municipalities: ['hanko', 'inkoo', 'raasepori'],
    services: {
      publicTransport: {
        name: 'Länsi-Uudenmaan joukkoliikenne',
        url: 'https://www.inkoo.fi/asuminen-ja-ymparisto/kadut-liikenne-ja-satamat/julkinen-liikenne/',
        group: 'Julkinen liikenne',
        sourceNote: 'Inkoon julkisen liikenteen sivu listaa Länsi-Uudenmaan seutulipun kelpoisuusalueeksi mm. Hangon, Inkoon ja Raaseporin sekä ohjaa alueen aikatauluihin.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'askola-pukkila-porvoo-region',
    name: 'Pukkila-Askola-Porvoo',
    municipalities: ['askola', 'pukkila'],
    services: {
      publicTransport: {
        name: 'Pukkila-Askola-Porvoo',
        url: 'https://askola.fi/asuminen-ja-elinymparisto/julkinen-liikenne/',
        group: 'Julkinen liikenne',
        sourceNote: 'Askolan julkisen liikenteen sivu vahvistaa Pukkila-Askola-Porvoo-liikenteen ja aikataulukauden 1.8.2024-31.7.2026.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'kotkan-seutu-jonne-ja-minne-region',
    name: 'Kotkan seudun joukkoliikenne',
    municipalities: ['kotka', 'pyhtää'],
    services: {
      publicTransport: {
        name: 'Jonne ja Minne',
        url: 'https://jonnejaminne.fi/',
        group: 'Julkinen liikenne',
        sourceNote: 'Kotkan joukkoliikennesivu ohjaa Jonne ja Minne -palveluun ja Pyhtään aikataulusivu vahvistaa Pyhtään yhteydet seudun aikatauluissa.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'harman-liikenne-etela-pohjanmaa-region',
    name: 'Härmän Liikenne Etelä-Pohjanmaa',
    municipalities: ['alajärvi', 'ilmajoki', 'isokyrö', 'kauhava', 'lappajärvi', 'lapua', 'seinäjoki', 'vimpeli'],
    services: {
      publicTransport: {
        name: 'Härmän Liikenne reittiliikenne',
        url: 'https://harmanliikenne.fi/reittiliikenne/',
        group: 'Julkinen liikenne',
        sourceNote: 'Härmän Liikenteen reittiliikennesivu listaa Etelä-Pohjanmaan reittejä mm. Ilmajoella, Lapualla, Seinäjoella, Kauhavalla, Alajärvellä, Lappajärvellä, Vimpelissä ja Isossakyrössä.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'kulukuri-keski-pohjanmaa-region',
    name: 'Kulukuri Keski-Pohjanmaan maaseutu',
    municipalities: ['halsua', 'kannus', 'kaustinen', 'lestijärvi', 'perho', 'toholampi', 'veteli'],
    services: {
      publicTransport: {
        name: 'Kulukuri',
        url: 'https://www.kulukuri.com/fi/joukkoliikenne/bussireitit-juuri-nyt',
        group: 'Julkinen liikenne',
        sourceNote: 'Kulukuri kokoaa Keski-Pohjanmaan maaseutualueiden liikkumispalvelut. Bussireitit juuri nyt -sivu listaa Halsuan, Kannuksen, Kaustisen, Lestijärven, Perhon, Toholammin ja Vetelin reitit sekä ylläpitäjäksi Kaustisen seutukunnan.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'lahti-region',
    name: 'Lahden seutu',
    municipalities: ['asikkala', 'heinola', 'hollola', 'lahti', 'orimattila', 'padasjoki'],
    services: {
      publicTransport: { name: 'Lahden seudun liikenne', url: 'https://www.lsl.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'hameenlinna-region',
    name: 'Hämeenlinnan seutu',
    municipalities: ['hattula', 'hämeenlinna', 'janakkala'],
    services: {
      publicTransport: { name: 'Hämeenlinnan joukkoliikenne', url: 'https://hameenlinnanjoukkoliikenne.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'kuopio-region',
    name: 'Kuopion seutu',
    municipalities: ['kuopio', 'siilinjärvi'],
    services: {
      publicTransport: { name: 'Vilkku', url: 'https://vilkku.kuopio.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'joensuu-region',
    name: 'Joensuun seutu',
    municipalities: ['joensuu', 'kontiolahti', 'liperi'],
    services: {
      publicTransport: { name: 'JOJO', url: 'https://jojo.joensuu.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'kouvola-region',
    name: 'Kouvola',
    municipalities: ['kouvola'],
    services: {
      publicTransport: { name: 'Koutsi', url: 'https://www.kouvola.fi/koutsi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'lappeenranta-region',
    name: 'Lappeenrannan seutu',
    municipalities: ['imatra', 'lappeenranta'],
    services: {
      publicTransport: { name: 'Jouko', url: 'https://lappeenranta.fi/fi/palvelut/jouko-joukkoliikenne', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'pori-region',
    name: 'Porin seudullinen joukkoliikenne',
    municipalities: ['pori', 'ulvila', 'nakkila', 'harjavalta', 'kokemäki'],
    services: {
      publicTransport: {
        name: 'Porin joukkoliikenne',
        url: 'https://pjl.pori.fi/',
        group: 'Julkinen liikenne',
        sourceNote: 'Porin seudullisen joukkoliikenneviranomaisen järjestämisalueeseen kuuluvat Pori, Ulvila, Nakkila, Harjavalta ja Kokemäki.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'seutuplus-satakunta-region',
    name: 'Seutu+ Satakunta',
    municipalities: ['eura', 'eurajoki', 'karvia'],
    services: {
      publicTransport: {
        name: 'Seutu+',
        url: 'https://seutuplus.fi/',
        group: 'Julkinen liikenne',
        sourceNote: 'Seutu+ kokoaa Varsinais-Suomen ja Satakunnan seutuliikenteen reitit, aikataulut ja lipputuotteet. Tarkistettu Euran, Eurajoen ja Karvian yhteyksien lähteistä.',
        verifiedAt: '2026-07-09',
      },
    },
  },
  {
    id: 'vaasa-region',
    name: 'Vaasan seutu',
    municipalities: ['mustasaari', 'vaasa'],
    services: {
      publicTransport: { name: 'Lifti', url: 'https://www.vaasa.fi/asu-ja-ela/liikenne-ja-kadut/joukkoliikenne/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'rovaniemi-region',
    name: 'Rovaniemi',
    municipalities: ['rovaniemi'],
    services: {
      publicTransport: { name: 'Linkkari', url: 'https://linkkari.fi/', group: 'Julkinen liikenne' },
    },
  },
  {
    id: 'aland-region',
    name: 'Ahvenanmaa',
    municipalities: ['brändö', 'eckerö', 'finström', 'föglö', 'geta', 'hammarland', 'jomala', 'kumlinge', 'kökar', 'lemland', 'lumparland', 'maarianhamina', 'saltvik', 'sottunga', 'sund', 'vårdö'],
    services: {
      publicTransport: { name: 'Ålandstrafiken', url: 'https://www.alandstrafiken.ax/', group: 'Julkinen liikenne' },
    },
  },
];

const getRegionalServiceArea = (municipalityKey: string): RegionalServiceArea | undefined => (
  regionalServiceAreas.find((area) => area.municipalities.includes(municipalityKey))
);

export const getRegionalServiceAreaMunicipalities = (municipalityName: string) => {
  const municipalityKey = normalizeMunicipality(municipalityName);
  return getRegionalServiceArea(municipalityKey)?.municipalities ?? [municipalityKey];
};

const getScopedPublicTransportProvider = (provider: Provider | undefined, context: RegionalContext, serviceArea?: RegionalServiceArea): Provider | undefined => {
  if (!provider) return undefined;
  if (provider.scope) return provider;

  if (provider.url === matkahuoltoRouteGuide.url) {
    return matkahuoltoRouteGuide;
  }

  if (serviceArea && provider.url === serviceArea.services.publicTransport?.url) {
    return withRegionalAreaScope(provider, serviceArea);
  }

  return withMunicipalityScope(provider, context.municipality.name);
};

const getScopedRouteGuideProvider = (provider: Provider | undefined, serviceArea?: RegionalServiceArea): Provider | undefined => {
  if (!provider) return undefined;
  if (serviceArea) return withRegionalAreaScope(provider, serviceArea);
  return withRegionalScope(provider, { scope: 'regional', sourceArea: 'HSL-alue' });
};

const regionalLibraryAreas: RegionalLibraryArea[] = [
  {
    id: 'anders',
    municipalities: ['halsua', 'kannus', 'kaustinen', 'kokkola', 'lestijärvi', 'toholampi'],
    provider: { name: 'Anders', url: 'https://anders.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'bibliotek-ax',
    municipalities: ['brändö', 'eckerö', 'finström', 'föglö', 'geta', 'hammarland', 'jomala', 'kumlinge', 'kökar', 'lemland', 'lumparland', 'maarianhamina', 'saltvik', 'sottunga', 'sund', 'vårdö'],
    provider: { name: 'Bibliotek.ax', url: 'https://www.bibliotek.ax', group: 'Kirjastot' },
  },
  {
    id: 'blanka',
    municipalities: ['kemiönsaari', 'parainen'],
    provider: { name: 'Blanka', url: 'https://blanka.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'eepos',
    municipalities: ['alajärvi', 'alavus', 'evijärvi', 'ilmajoki', 'isojoki', 'isokyrö', 'karijoki', 'kaskinen', 'kauhajoki', 'kauhava', 'kuortane', 'kurikka', 'laihia', 'lappajärvi', 'lapua', 'perho', 'seinäjoki', 'soini', 'teuva', 'veteli', 'vimpeli', 'ähtäri'],
    provider: { name: 'Eepos-kirjastot', url: 'http://eepos.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'fredrika',
    municipalities: ['korsnäs', 'kristiinankaupunki', 'kruunupyy', 'luoto', 'maalahti', 'mustasaari', 'närpiö', 'pedersören', 'pietarsaari', 'uusikaarlepyy', 'vöyri'],
    provider: { name: 'Fredrikabiblioteken', url: 'http://fredrika.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'heili',
    municipalities: ['imatra', 'lappeenranta', 'lemi', 'luumäki', 'parikkala', 'rautjärvi', 'ruokolahti', 'savitaipale', 'taipalsaari'],
    provider: { name: 'Heili-kirjastot', url: 'https://heilikirjastot.fi/', group: 'Kirjastot' },
  },
  {
    id: 'helle',
    municipalities: ['askola', 'hanko', 'inkoo', 'lapinjärvi', 'loviisa', 'myrskylä', 'pornainen', 'porvoo', 'pukkila', 'raasepori', 'sipoo', 'siuntio'],
    provider: { name: 'Helle-kirjastot', url: 'https://helle.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'helmet',
    municipalities: ['espoo', 'helsinki', 'kauniainen', 'vantaa'],
    provider: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Kirjastot' },
  },
  {
    id: 'joki',
    municipalities: ['alavieska', 'haapajärvi', 'haapavesi', 'kalajoki', 'kärsämäki', 'merijärvi', 'nivala', 'oulainen', 'pyhäjärvi', 'pyhäntä', 'reisjärvi', 'sievi', 'siikalatva', 'ylivieska'],
    provider: { name: 'Joki-kirjastot', url: 'https://joki.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'kangasniemi',
    municipalities: ['kangasniemi'],
    provider: { name: 'Kangasniemen kirjasto', url: 'https://kangasniemi.verkkokirjasto.fi/', group: 'Kirjastot' },
  },
  {
    id: 'kainet',
    municipalities: ['hyrynsalmi', 'kajaani', 'kuhmo', 'paltamo', 'puolanka', 'ristijärvi', 'sotkamo', 'suomussalmi'],
    provider: { name: 'Kainet-kirjastot', url: 'https://kainet.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'keski',
    municipalities: ['hankasalmi', 'joutsa', 'jyväskylä', 'jämsä', 'kannonkoski', 'karstula', 'keuruu', 'kinnula', 'kivijärvi', 'konnevesi', 'kuhmoinen', 'kyyjärvi', 'laukaa', 'luhanka', 'multia', 'muurame', 'petäjävesi', 'pihtipudas', 'saarijärvi', 'toivakka', 'uurainen', 'viitasaari', 'äänekoski'],
    provider: { name: 'Keski-kirjastot', url: 'https://keski.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'kirkes',
    municipalities: ['järvenpää', 'kerava', 'mäntsälä', 'tuusula'],
    provider: { name: 'Kirkes-kirjastot', url: 'https://kirkes.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'kirkkonummi',
    municipalities: ['kirkkonummi'],
    provider: { name: 'Kirkkonummen kirjasto', url: 'https://www.kirkkonummi.verkkokirjasto.fi', group: 'Kirjastot' },
  },
  {
    id: 'kuopio',
    municipalities: ['kaavi', 'kuopio', 'tuusniemi'],
    provider: { name: 'Kuopion kaupunginkirjasto', url: 'https://kuopio.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'kyyti',
    municipalities: ['hamina', 'iitti', 'kotka', 'kouvola', 'miehikkälä', 'pyhtää', 'virolahti'],
    provider: { name: 'Kyyti-kirjastot', url: 'https://kyyti.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'lapin-kirjasto',
    municipalities: ['enontekiö', 'inari', 'kemi', 'kemijärvi', 'keminmaa', 'kittilä', 'kolari', 'muonio', 'pelkosenniemi', 'pello', 'posio', 'ranua', 'rovaniemi', 'salla', 'savukoski', 'simo', 'sodankylä', 'tervola', 'tornio', 'utsjoki', 'ylitornio'],
    provider: { name: 'Lapin kirjasto', url: 'http://lapinkirjasto.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'lastu',
    municipalities: ['asikkala', 'hartola', 'heinola', 'hollola', 'kärkölä', 'lahti', 'orimattila', 'padasjoki', 'sysmä'],
    provider: { name: 'Lastu-kirjastot', url: 'https://lastu.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'leppavirta',
    municipalities: ['leppävirta'],
    provider: { name: 'Leppävirran kirjasto', url: 'https://leppavirta.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'loisto',
    municipalities: ['aura', 'koski tl', 'loimaa', 'marttila', 'oripää', 'pöytyä'],
    provider: { name: 'Loisto-kirjastot', url: 'https://loisto.verkkokirjasto.fi/web/arena', group: 'Kirjastot' },
  },
  {
    id: 'louna',
    municipalities: ['forssa', 'humppila', 'jokioinen', 'tammela', 'ypäjä'],
    provider: { name: 'Louna-kirjastot', url: 'https://louna.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'lukki',
    municipalities: ['karkkila', 'lohja', 'vihti'],
    provider: { name: 'Lukki-kirjastot', url: 'https://lukki.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'lumme',
    municipalities: ['enonkoski', 'hirvensalmi', 'joroinen', 'juva', 'mikkeli', 'mäntyharju', 'pieksämäki', 'puumala', 'rantasalmi', 'savonlinna', 'varkaus'],
    provider: { name: 'Lumme-kirjastot', url: 'https://lumme.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'outi',
    municipalities: ['hailuoto', 'ii', 'kempele', 'kuusamo', 'liminka', 'lumijoki', 'muhos', 'oulu', 'pudasjärvi', 'pyhäjoki', 'raahe', 'siikajoki', 'taivalkoski', 'tyrnävä', 'utajärvi', 'vaala'],
    provider: { name: 'OUTI-kirjastot', url: 'https://outi.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'piki',
    municipalities: ['akaa', 'hämeenkyrö', 'ikaalinen', 'juupajoki', 'kangasala', 'kihniö', 'lempäälä', 'mänttä-vilppula', 'nokia', 'orivesi', 'parkano', 'pirkkala', 'punkalaidun', 'pälkäne', 'ruovesi', 'sastamala', 'tampere', 'urjala', 'valkeakoski', 'vesilahti', 'virrat', 'ylöjärvi'],
    provider: { name: 'PIKI-kirjastot', url: 'https://piki.fi', group: 'Kirjastot' },
  },
  {
    id: 'ratamo',
    municipalities: ['hausjärvi', 'hyvinkää', 'loppi', 'nurmijärvi', 'riihimäki'],
    provider: { name: 'RATAMO-kirjastot', url: 'https://ratamo.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'rutakko',
    municipalities: ['iisalmi', 'keitele', 'kiuruvesi', 'lapinlahti', 'pielavesi', 'rautalampi', 'rautavaara', 'sonkajärvi', 'suonenjoki', 'tervo', 'vesanto', 'vieremä'],
    provider: { name: 'Rutakko-kirjastot', url: 'https://rutakko.verkkokirjasto.fi/', group: 'Kirjastot' },
  },
  {
    id: 'satakirjastot',
    municipalities: ['eura', 'eurajoki', 'harjavalta', 'huittinen', 'jämijärvi', 'kankaanpää', 'karvia', 'kokemäki', 'merikarvia', 'nakkila', 'pomarkku', 'pori', 'rauma', 'siikainen', 'säkylä', 'ulvila'],
    provider: { name: 'Satakirjastot', url: 'https://satakirjastot.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'siilinjarvi',
    municipalities: ['siilinjärvi'],
    provider: { name: 'Siilinjärven kirjasto', url: 'https://siilinjarvenkirjasto.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'somero',
    municipalities: ['somero'],
    provider: { name: 'Someron kirjasto', url: 'https://somero.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'sulkava',
    municipalities: ['sulkava'],
    provider: { name: 'Sulkavan kirjasto', url: 'https://sulkava.verkkokirjasto.fi/web/arena', group: 'Kirjastot' },
  },
  {
    id: 'vaara',
    municipalities: ['heinävesi', 'ilomantsi', 'joensuu', 'juuka', 'kitee', 'kontiolahti', 'lieksa', 'liperi', 'nurmes', 'outokumpu', 'polvijärvi', 'rääkkylä', 'tohmajärvi'],
    provider: { name: 'Vaara-kirjastot', url: 'https://vaara.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'vaasa',
    municipalities: ['vaasa'],
    provider: { name: 'Vaasan kirjasto', url: 'https://vaasankirjasto.finna.fi/', group: 'Kirjastot' },
  },
  {
    id: 'vanamo',
    municipalities: ['hattula', 'hämeenlinna', 'janakkala'],
    provider: { name: 'Vanamo-kirjastot', url: 'https://vanamo.finna.fi', group: 'Kirjastot' },
  },
  {
    id: 'vaski',
    municipalities: ['kaarina', 'kustavi', 'laitila', 'lieto', 'masku', 'mynämäki', 'naantali', 'nousiainen', 'paimio', 'pyhäranta', 'raisio', 'rusko', 'salo', 'sauvo', 'taivassalo', 'turku', 'uusikaupunki', 'vehmaa'],
    provider: { name: 'Vaski-kirjastot', url: 'https://vaski.finna.fi/', group: 'Kirjastot' },
  },
];

const getRegionalLibraryArea = (municipalityKey: string): RegionalLibraryArea | undefined => (
  regionalLibraryAreas.find((area) => area.municipalities.includes(municipalityKey))
);

const getScopedLibraryProvider = (provider: Provider | undefined, context: RegionalContext, libraryArea?: RegionalLibraryArea): Provider | undefined => {
  if (!provider) return undefined;
  if (provider.scope) return provider;

  if (libraryArea && provider.url === libraryArea.provider.url) {
    return withRegionalScope(provider, {
      municipalities: getMunicipalityNamesFromKeys(libraryArea.municipalities),
      sourceArea: provider.name,
      scope: 'regional',
    });
  }

  return withMunicipalityScope(provider, context.municipality.name);
};

const hslPublicTransport: Provider = { name: 'HSL', url: 'https://www.hsl.fi/', group: 'Julkinen liikenne' };
const hslRouteGuide: Provider = { name: 'HSL Reittiopas', url: 'https://reittiopas.hsl.fi/', group: 'Reittioppaat' };
const matkahuoltoRouteGuide: Provider = {
  name: 'Matkahuollon reittiopas',
  url: 'https://reittiopas.matkahuolto.fi/',
  group: 'Julkinen liikenne',
  scope: 'nationalFallback',
  sourceArea: 'Suomi',
  sourceNote: 'Valtakunnallinen reittiopas kunnille, joille ei ole vielä omaa tai seudullista joukkoliikennelinkkiä.',
};
const serviceTransportByMunicipality = new Map(
  LOCAL_SERVICE_TRANSPORT_LINKS.map((entry) => [
    normalizeMunicipality(entry.municipality),
    withMunicipalityScope(entry.provider, entry.municipality) as Provider,
  ])
);

const regionalNewsProvider = (name: string, url: string): Provider => ({
  name,
  url,
  group: 'Alueelliset uutiset',
});

const localServiceMap: Record<string, LocalServiceConfig> = {
  helsinki: {
    publicTransport: hslPublicTransport,
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Kirjastot' },
    municipality: { name: 'Helsingin palvelut', url: 'https://www.hel.fi/fi', group: 'Paikalliset palvelut' },
    rssFeeds: [
      { name: 'Helsingin uutiset', url: 'https://www.hel.fi/fi/uutiset' },
    ],
  },
  espoo: {
    publicTransport: hslPublicTransport,
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Kirjastot' },
    municipality: { name: 'Espoon palvelut', url: 'https://www.espoo.fi/fi', group: 'Paikalliset palvelut' },
    rssFeeds: [
      { name: 'Espoon uutiset', url: 'https://www.espoo.fi/fi/rss/news' },
      { name: 'Espoon artikkelit', url: 'https://www.espoo.fi/fi/rss/articles' },
    ],
  },
  vantaa: {
    publicTransport: hslPublicTransport,
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Kirjastot' },
    municipality: { name: 'Vantaan palvelut', url: 'https://www.vantaa.fi/fi', group: 'Paikalliset palvelut' },
    rssFeeds: [
      { name: 'Vantaan uutiset', url: 'https://www.vantaa.fi/fi/rss/topical/121' },
      { name: 'Vantaan tiedotteet', url: 'https://www.vantaa.fi/fi/rss/topical/119' },
    ],
  },
  kauniainen: {
    publicTransport: hslPublicTransport,
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Kirjastot' },
    municipality: { name: 'Kauniaisten palvelut', url: 'https://www.kauniainen.fi/', group: 'Paikalliset palvelut' },
  },
  tampere: {
    municipality: { name: 'Tampereen palvelut', url: 'https://www.tampere.fi/', group: 'Paikalliset palvelut' },
    regionalNews: [regionalNewsProvider('Aamulehti', 'https://www.aamulehti.fi/')],
    rssFeeds: [
      { name: 'Tampereen uutiset', url: 'https://www.tampere.fi/ajankohtaista/uutiset.xml' },
      { name: 'Tampereen artikkelit', url: 'https://www.tampere.fi/ajankohtaista/artikkelit.xml' },
      { name: 'Tampereen ilmoitukset', url: 'https://www.tampere.fi/ajankohtaista/ilmoitukset.xml' },
    ],
  },
  turku: {
    library: { name: 'Vaski-kirjastot', url: 'https://vaski.finna.fi/', group: 'Kirjastot' },
    municipality: { name: 'Turun palvelut', url: 'https://www.turku.fi/', group: 'Paikalliset palvelut' },
    regionalNews: [regionalNewsProvider('Turun Sanomat', 'https://www.ts.fi/')],
  },
  oulu: {
    library: { name: 'OUTI-kirjastot', url: 'https://outi.finna.fi/', group: 'Kirjastot' },
    municipality: { name: 'Oulun palvelut', url: 'https://www.ouka.fi/', group: 'Paikalliset palvelut' },
    regionalNews: [regionalNewsProvider('Kaleva', 'https://www.kaleva.fi/')],
    rssFeeds: [
      { name: 'Oulun kaupungin uutiset', url: 'https://www.ouka.fi/news/feed?audience=All&region=All&topic=All' },
      { name: 'Kaleva: Oulun seutu', url: 'https://kaleva.fi/feedit/rss/managed-listing/oulun-seutu/' },
    ],
  },
  kuopio: {
    municipality: { name: 'Kuopion palvelut', url: 'https://www.kuopio.fi/', group: 'Paikalliset palvelut' },
    regionalNews: [regionalNewsProvider('Savon Sanomat', 'https://savonsanomat.fi/')],
  },
  jyväskylä: {
    library: { name: 'Keski-kirjastot', url: 'https://keski.finna.fi/', group: 'Kirjastot' },
    municipality: { name: 'Jyväskylän palvelut', url: 'https://www.jyvaskyla.fi/', group: 'Paikalliset palvelut' },
    regionalNews: [regionalNewsProvider('Keskisuomalainen', 'https://www.ksml.fi/')],
  },
  jämsä: {
    publicTransport: {
      name: 'Jämsän joukkoliikenne',
      url: 'https://jamsa.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/kadut-ja-liikenne/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Jämsän kaupungin joukkoliikennesivu kokoaa kaupungin ostamat kaupunkiliikenteen, runkoliikenteen, Pali-kutsuohjatun palveluliikenteen ja aikataulut.',
      verifiedAt: '2026-07-09',
    },
  },
  joutsa: {
    publicTransport: {
      name: 'Joutsan liikenne',
      url: 'https://www.joutsa.fi/asuminen-ja-ymparisto/liikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Joutsan kunnan liikennesivu ohjaa kunnan liikennetiedon yhteydessä Matkahuollon reittioppaaseen ja Reitit ja Liput -sovellukseen.',
      verifiedAt: '2026-07-09',
    },
  },
  luhanka: {
    publicTransport: {
      name: 'Luhangan liikenne',
      url: 'https://www.luhanka.fi/liikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Luhangan kunnan liikennesivu kertoo kaikille avoimesta asiointiliikenteestä sekä kouluaikaan myös muille matkustajille hyödynnettävästä ELY-keskuksen linja-autoliikenteestä Luhanka-Joutsa-yhteysvälillä.',
      verifiedAt: '2026-07-09',
    },
  },
  uurainen: {
    publicTransport: {
      name: 'Uuraisten joukkoliikenteen sarjalippu',
      url: 'https://uurainen.fi/ajankohtaiset/uuraisten-joukkoliikenteen-sarjalippu/',
      group: 'Julkinen liikenne',
      sourceNote: 'Uuraisten kunnan joukkoliikenteen sarjalippusivu vahvistaa Uuraisten alueen lipputuotteen, Matkahuollon sovelluskäytön ja liikennöitsijät.',
      verifiedAt: '2026-07-09',
    },
  },
  lemi: {
    publicTransport: {
      name: 'Lemin julkinen liikenne',
      url: 'https://lemi.fi/palvelut/julkinen-liikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Lemin kunnan julkisen liikenteen sivu ohjaa ajantasaisiin linja-autoaikatauluihin Matkahuollossa ja opas.matka.fi-palvelussa. Sama sivu kertoo linjataksiliikenteen päättyneen 30.6.2022, joten palveluliikennettä ei lisätty.',
      verifiedAt: '2026-07-09',
    },
  },
  luumäki: {
    publicTransport: {
      name: 'Luumäen liikenne',
      url: 'https://luumaki.fi/fi/palvelut/tiet-ja-liikenne',
      group: 'Julkinen liikenne',
      sourceNote: 'Luumäen kunnan tiet ja liikenne -sivu ohjaa julkisen liikenteen aikatauluihin ja Kaakon kausilipun käyttöön Matkahuollon kautta.',
      verifiedAt: '2026-07-09',
    },
  },
  ruokolahti: {
    publicTransport: {
      name: 'Ruokolahden joukkoliikenne',
      url: 'https://ruokolahti.fi/fi/asuminen-ja-ymparisto/joukkoliikenne',
      group: 'Julkinen liikenne',
      sourceNote: 'Ruokolahden kunnan joukkoliikennesivu kokoaa bussi- ja taksiyhteydet sekä kaikille avoimet koulukuljetusvuorot.',
      verifiedAt: '2026-07-09',
    },
  },
  savitaipale: {
    publicTransport: {
      name: 'Savitaipaleen bussiaikataulut',
      url: 'https://savitaipale.fi/fi/asuminen-ja-ymparisto/asuminen/bussiaikataulut',
      group: 'Julkinen liikenne',
      sourceNote: 'Savitaipaleen bussiaikataulusivu kertoo kunnan järjestämästä kaikille avoimesta joukkoliikenteestä lukuvuonna 2025-2026.',
      verifiedAt: '2026-07-09',
    },
  },
  taipalsaari: {
    publicTransport: {
      name: 'Taipalsaaren joukkoliikenne',
      url: 'https://www.taipalsaari.fi/fi/asuminen-ja-ymparisto/tiet-ja-liikenne/joukkoliikenne',
      group: 'Julkinen liikenne',
      sourceNote: 'Taipalsaaren joukkoliikennesivu listaa Lappeenranta-Taipalsaari-yhteyden, ilta- ja viikonloppuyhteydet sekä aikataululinkit.',
      verifiedAt: '2026-07-09',
    },
  },
  juuka: {
    publicTransport: {
      name: 'Juuan julkinen liikenne',
      url: 'https://www.juuka.fi/asuminen-ja-ymparisto/liikenne/julkinen-liikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Juuan julkisen liikenteen sivu kokoaa aikataulu- ja reittiopaslinkit sekä paikalliset liikenneyhteydet.',
      verifiedAt: '2026-07-09',
    },
  },
  lieksa: {
    publicTransport: {
      name: 'Lieksan linja-autot',
      url: 'https://www.lieksa.fi/asuminen-ja-ymparisto/asuminen/kuljetus-liikennointi-joukkoliikenne/linja-autot/',
      group: 'Julkinen liikenne',
      sourceNote: 'Lieksan linja-autosivu ohjaa Joensuun seudun reittioppaaseen ja Matkahuoltoon sekä kokoaa Lieksan joukkoliikenteen aikataulutiedon.',
      verifiedAt: '2026-07-09',
    },
  },
  nurmes: {
    publicTransport: {
      name: 'Nurmeksen joukkoliikenne',
      url: 'https://www.nurmes.fi/asuminen-ja-ymparisto/asuminen/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Nurmeksen joukkoliikennesivu kokoaa bussiyhteydet sekä Katuri-liikenteen Nurmeksen ja Valtimon alueella.',
      verifiedAt: '2026-07-09',
    },
  },
  tohmajärvi: {
    publicTransport: {
      name: 'Tohmajärven julkinen liikenne',
      url: 'https://www.tohmajarvi.fi/julkinen-liikenne',
      group: 'Julkinen liikenne',
      sourceNote: 'Tohmajärven julkisen liikenteen sivu listaa linja-autoyhteydet Joensuuhun ja Kiteelle sekä koulubussi-, kyytitakuu- ja palveluvuorotiedot.',
      verifiedAt: '2026-07-09',
    },
  },
  haapajärvi: {
    publicTransport: {
      name: 'Jokilaaksojen joukkoliikenne',
      url: 'https://www.haapajarvi.fi/ajankohtaista/jokilaaksojen-kuntien-valisen-joukkoliikenteen-talvikausi-alkaa',
      group: 'Julkinen liikenne',
      sourceNote: 'Haapajärven ajankohtaissivu vahvistaa ELY-keskuksen hankkimat Jokilaaksojen kuntien väliset linja-autoyhteydet talvikaudelle.',
      verifiedAt: '2026-07-09',
    },
  },
  merijärvi: {
    publicTransport: {
      name: 'Merijärven liikenneyhteydet',
      url: 'https://www.merijarvi.fi/hallinto-ja-paatoksenteko/kuntainfo',
      group: 'Julkinen liikenne',
      sourceNote: 'Merijärven kuntainfo ohjaa kunnan linja-autojen aikataulutietoihin Matkahuollossa ja paikallisiin liikenneyhteystietoihin.',
      verifiedAt: '2026-07-09',
    },
  },
  pyhäjoki: {
    publicTransport: {
      name: 'Pyhäjoki-Raahe-Oulu',
      url: 'https://www.pyhajoki.fi/ajankohtaista/uudet-linja-autovuorot-taydentavat-vuorotarjontaa-pyhajoen-raahen-ja-oulun-valilla',
      group: 'Julkinen liikenne',
      sourceNote: 'Pyhäjoen tiedote vahvistaa Pyhäjoen, Raahen ja Oulun väliset ELY-keskuksen uudet linja-autovuorot.',
      verifiedAt: '2026-07-09',
    },
  },
  reisjärvi: {
    publicTransport: {
      name: 'Reisjärven linja-autokuljetukset',
      url: 'https://www.reisjarvi.fi/tagit/julkinen-liikenne-linja-auto',
      group: 'Julkinen liikenne',
      sourceNote: 'Reisjärven julkinen liikenne -koonti listaa linja-autokuljetusten aikatauluja, taksoja ja lipputietoja.',
      verifiedAt: '2026-07-09',
    },
  },
  karijoki: {
    publicTransport: {
      name: 'Karijoki-Kauhajoki',
      url: 'https://kauhajoki.fi/tyo-ja-yrittajyys/liikenne/avoin-joukkoliikenne-ja-koulukuljetukset/',
      group: 'Julkinen liikenne',
      sourceNote: 'Kauhajoen avoimen joukkoliikenteen sivu listaa Karijoki-Kauhajoki-reitin ja ohjaa aikatauluihin.',
      verifiedAt: '2026-07-09',
    },
  },
  teuva: {
    publicTransport: {
      name: 'Teuvan liikenne',
      url: 'https://site.teuva.fi/e/site?node_id=81',
      group: 'Julkinen liikenne',
      sourceNote: 'Teuvan kunnan liikennesivu kokoaa linja-autoliikenteen, Matkahuollon, seutulipun ja muut liikenneyhteydet.',
      verifiedAt: '2026-07-09',
    },
  },
  ähtäri: {
    publicTransport: {
      name: 'Ähtärin liikenneyhteydet',
      url: 'https://www.ahtari.fi/index.php/kaupunki-ja-hallinto/tietoa-ahtarista/liikenneyhteydet-ja-sijainti',
      group: 'Julkinen liikenne',
      sourceNote: 'Ähtärin liikenneyhteyssivu kokoaa rautatieaseman, linja-autoaseman ja seudulliset bussiyhteydet.',
      verifiedAt: '2026-07-09',
    },
  },
  kuhmoinen: {
    publicTransport: {
      name: 'Kuhmoisten julkinen liikenne',
      url: 'https://www.kuhmoinen.fi/asuminen%20ja%20ymp%C3%A4rist%C3%B6/kadut%20ja%20liikenne/julkinen%20liikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Kuhmoisten julkisen liikenteen sivu kokoaa Nysse-linjan 42, Matkahuollon yhteydet ja sivukylien asiointiliikenteen.',
      verifiedAt: '2026-07-09',
    },
  },
  punkalaidun: {
    publicTransport: {
      name: 'Punkalaitumen joukkoliikenne',
      url: 'https://www.punkalaidun.fi/sivu.tmpl?sivu_id=9364',
      group: 'Julkinen liikenne',
      sourceNote: 'Punkalaitumen joukkoliikennesivu kertoo Punkalaidun-lipusta, A. Lamminmäen vuoroista sekä Matkahuollon aikataulu- ja lipputiedoista.',
      verifiedAt: '2026-07-09',
    },
  },
  mäntsälä: {
    publicTransport: {
      name: 'Mäntsälän joukkoliikenne',
      url: 'https://www.mantsala.fi/asuminen-ja-ymparisto/liikenne-ja-kadut/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Mäntsälän joukkoliikennesivu kokoaa linja-autoreitit, pysäkit, aikataulut sekä HSL- ja Matkahuolto-linkit.',
      verifiedAt: '2026-07-09',
    },
  },
  pori: {
    regionalNews: [regionalNewsProvider('Satakunnan Kansa', 'https://www.satakunnankansa.fi/')],
  },
  joensuu: {
    regionalNews: [regionalNewsProvider('Karjalainen', 'https://www.karjalainen.fi/')],
  },
  rovaniemi: {
    regionalNews: [regionalNewsProvider('Lapin Kansa', 'https://www.lapinkansa.fi/')],
  },
  inari: {
    publicTransport: {
      name: 'Inarin liikenneyhteydet',
      url: 'https://www.inari.fi/fi/matkailu/liikenneyhteydet.html',
      group: 'Julkinen liikenne',
      sourceNote: 'Inarin kunnan liikenneyhteyssivu kokoaa kunnan bussi-, skibussi-, lento- ja asiointiliikenneyhteydet sekä Inarin lipputuotteet.',
      verifiedAt: '2026-07-09',
    },
  },
  pello: {
    publicTransport: {
      name: 'Pellon julkinen liikenne',
      url: 'https://www.pello.fi/asuminen-ja-rakentaminen/tiet-ja-liikenne/julkinen-liikenne.html',
      group: 'Julkinen liikenne',
      sourceNote: 'Pellon kunnan julkisen liikenteen sivu ohjaa linja-autojen aikatauluihin ja kuvaa kunnan kaikille avointa asiointiliikennettä reitteineen.',
      verifiedAt: '2026-07-09',
    },
  },
  utsjoki: {
    publicTransport: {
      name: 'Utsjoen yhteydet',
      url: 'https://exploreutsjoki.fi/yhteydet/',
      group: 'Julkinen liikenne',
      sourceNote: 'Utsjoen matkailusivu kertoo Ivalosta kulkevasta päivittäisestä linja-autosta Utsjoelle, Karigasniemelle ja Nuorgamiin sekä ohjaa Matkahuollon aikatauluihin.',
      verifiedAt: '2026-07-09',
    },
  },
  lahti: {
    regionalNews: [regionalNewsProvider('Etelä-Suomen Sanomat', 'https://www.ess.fi/')],
  },
  loviisa: {
    publicTransport: { name: 'Loviisan joukkoliikenne', url: 'https://www.loviisa.fi/asuminen-ja-ymparisto/liikenne/joukkoliikenne/', group: 'Julkinen liikenne' },
  },
  forssa: {
    publicTransport: {
      name: 'Forssan seutu- ja alueliikenne',
      url: 'https://www.forssa.fi/asuminen-ja-ymparisto/joukkoliikenne-1558118806/seutu-ja-kaukoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Forssan kaupungin seutu- ja alueliikennesivu listaa Lounais-Hämeen yhteyksiä Forssaan, mm. Humppila-Jokioinen-Forssa-, Loimaa-Ypäjä-Jokioinen-Forssa- ja Tammela-Forssa-reitit.',
      verifiedAt: '2026-07-09',
    },
  },
  hausjärvi: {
    publicTransport: {
      name: 'Hausjärven joukkoliikenne',
      url: 'https://www.hausjarvi.fi/asuminen-ja-rakentaminen/kadut-liikenne-ja-yleiset-alueet/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Hausjärven kunnan joukkoliikennesivu kokoaa palvelulinjan, kunnan rautatieasemat sekä bussi- ja junayhteyksien aikatauluohjeet.',
      verifiedAt: '2026-07-09',
    },
  },
  humppila: {
    publicTransport: {
      name: 'Humppilan julkinen liikenne',
      url: 'https://www.humppila.fi/vapaa-aika-ja-matkailu/jubilee-line-ja-julkinen-liikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Humppilan kunnan julkisen liikenteen sivu kertoo Forssa-Jokioinen-Humppila-yhteydestä, ELY:n jatkavasta liikenteestä sekä bussi- ja junaliikenteen aikataululinkeistä.',
      verifiedAt: '2026-07-09',
    },
  },
  jokioinen: {
    publicTransport: {
      name: 'Jokioisten joukkoliikenne',
      url: 'https://www.jokioinen.fi/asuminen-ja-ymparisto/palveluja-asukkaille/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Jokioisten kunnan joukkoliikennesivu kuvaa Jubilee Line -joukkoliikennekokeilun ja ohjaa kaikkien aikataulujen, mukaan lukien muun julkisen liikenteen, Matkahuollon aikatauluhakuun.',
      verifiedAt: '2026-07-09',
    },
  },
  loppi: {
    publicTransport: {
      name: 'Lopen joukkoliikenne',
      url: 'https://www.loppi.fi/asuminen-ja-ymparisto/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Lopen kunnan joukkoliikennesivu listaa linja-autovuoroja Riihimäelle, Hämeenlinnaan ja Helsingin suuntaan sekä ohjaa ajantasaisiin Matkahuollon aikatauluihin.',
      verifiedAt: '2026-07-09',
    },
  },
  riihimäki: {
    publicTransport: {
      name: 'Riihimäen joukkoliikenne',
      url: 'https://www.riihimaki.fi/asu-ja-rakenna/liikenne-ja-kadut/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Riihimäen kaupungin joukkoliikennesivu kertoo kaupungin toimivalta-alueen paikallisliikenteestä sekä seutuliikenteestä Lopelle, Ryttylään ja Tervakoskelle.',
      verifiedAt: '2026-07-09',
    },
  },
  tammela: {
    publicTransport: {
      name: 'Tammelan liikenneyhteydet',
      url: 'https://www.tammela.fi/asuminen-ja-ymparisto/liikenne/liikenneyhteydet',
      group: 'Julkinen liikenne',
      sourceNote: 'Tammelan kunnan liikenneyhteyssivu kokoaa julkisen liikenteen ja linja-autoyhteydet, kuten Forssan suunnan yhteydet ja Matkahuollon aikatauluhaun.',
      verifiedAt: '2026-07-09',
    },
  },
  ypäjä: {
    publicTransport: {
      name: 'Ypäjän joukkoliikenteen aikataulut',
      url: 'https://ypaja.fi/joukkoliikenteen-aikatauluja/',
      group: 'Julkinen liikenne',
      sourceNote: 'Ypäjän kunnan joukkoliikennesivu ohjaa Matkahuollon linja-autoliikenteen aikatauluun ja lipunmyyntiin, VR:n aikatauluihin sekä Onnibus-yhteyksiin.',
      verifiedAt: '2026-07-09',
    },
  },
  hämeenlinna: {
    regionalNews: [regionalNewsProvider('Hämeen Sanomat', 'https://www.hameensanomat.fi/')],
  },
  kajaani: {
    regionalNews: [regionalNewsProvider('Kainuun Sanomat', 'https://www.kainuunsanomat.fi/')],
  },
  kouvola: {
    regionalNews: [regionalNewsProvider('Kouvolan Sanomat', 'https://www.kouvolansanomat.fi/')],
  },
  mikkeli: {
    regionalNews: [regionalNewsProvider('Länsi-Savo', 'https://www.lansi-savo.fi/')],
  },
  vaasa: {
    regionalNews: [regionalNewsProvider('Pohjalainen', 'https://www.pohjalainen.fi/')],
  },
  haapavesi: {
    publicTransport: {
      name: 'Haapaveden linja-autoyhteydet',
      url: 'https://haapavesi.fi/linja-autoyhteydet',
      group: 'Julkinen liikenne',
      sourceNote: 'Haapaveden kaupungin linja-autoyhteyssivu kokoaa kaupungin kautta kulkevat Ylivieskan, Pyhännän, Kalajoen, Kärsämäen ja Nivalan suunnan yhteydet sekä lipputuote- ja aikatauluohjeet.',
      verifiedAt: '2026-07-09',
    },
  },
  hailuoto: {
    publicTransport: {
      name: 'Hailuodon linja-auto',
      url: 'https://hailuoto.fi/saapuminen/linja-auto/',
      group: 'Julkinen liikenne',
      sourceNote: 'Hailuodon kunnan linja-autosivu kertoo Oulun ja Hailuodon välisten linjojen 59 ja 59S aikataulu- ja lipputiedot.',
      verifiedAt: '2026-07-09',
    },
  },
  kalajoki: {
    publicTransport: {
      name: 'Kalajoen liikenneyhteydet',
      url: 'https://www.kalajoki.fi/fi/kaupunki-ja-hallinto/tietoa-kalajoesta/liikenneyhteydet-kalajoelle',
      group: 'Julkinen liikenne',
      sourceNote: 'Kalajoen kaupungin liikenneyhteyssivu ohjaa Kalajoen linja-autoyhteyksiin Kokkolasta, Oulusta ja Ylivieskasta sekä aikataulujen tarkistamiseen.',
      verifiedAt: '2026-07-09',
    },
  },
  kuusamo: {
    publicTransport: {
      name: 'Kuusamon paikallisliikenne',
      url: 'https://www.kuusamo.fi/asuminen-ja-ymparisto/asuminen/paikallisliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Kuusamon kaupungin paikallisliikennesivu kuvaa yleisölle avoimen paikallisliikenteen, reitit ja aikatauluohjeet.',
      verifiedAt: '2026-07-09',
    },
  },
  luoto: {
    publicTransport: {
      name: 'Luodon joukkoliikenne',
      url: 'https://larsmo.fi/boende-och-miljo/vagar-bathamnar-och-almanna-omraden/vagar-och-trafikleder/kollektivtrafik/',
      group: 'Julkinen liikenne',
      sourceNote: 'Luodon kunnan joukkoliikennesivu kokoaa bussi-, juna- ja lentoyhteydet sekä ohjaa Ingsvaan ja Matkahuoltoon ajankohtaisia aikatauluja varten.',
      verifiedAt: '2026-07-09',
    },
  },
  pietarsaari: {
    publicTransport: {
      name: 'Pietarsaaren liikenneyhteydet',
      url: 'https://jakobstad.fi/trafikforbindelser',
      group: 'Julkinen liikenne',
      sourceNote: 'Pietarsaaren kaupungin liikenneyhteyssivu kertoo bussiaseman päivittäisistä yhteyksistä Vaasaan, Uuteenkaarlepyyhyn ja Kokkolaan sekä aseman liityntäbussista.',
      verifiedAt: '2026-07-09',
    },
  },
  vöyri: {
    publicTransport: {
      name: 'Vöyrin joukkoliikenne',
      url: 'https://www.vora.fi/tjanster/trafik-och-vagar',
      group: 'Julkinen liikenne',
      sourceNote: 'Vöyrin kunnan joukkoliikennesivu ohjaa Vöyri-Vaasa-linjaliikenteeseen ja Matkahuollon reittioppaaseen.',
      verifiedAt: '2026-07-09',
    },
  },
  sievi: {
    publicTransport: {
      name: 'Sievin joukkoliikenne',
      url: 'https://www.sievi.fi/joukkoliikenne',
      group: 'Julkinen liikenne',
      sourceNote: 'Sievin kunnan joukkoliikennesivu kokoaa Sievin ja Ylivieskan sekä Sievin ja Nivalan välisten linja-autovuorojen aikataulu- ja lipputiedot.',
      verifiedAt: '2026-07-09',
    },
  },
  ylivieska: {
    publicTransport: {
      name: 'Ylivieskan julkinen liikenne',
      url: 'https://www.ylivieska.fi/asuminen-ja-ymparisto/julkinen-liikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Ylivieskan kaupungin julkisen liikenteen sivu ohjaa juna-, bussi- ja taksiyhteyksiin sekä kertoo asema- ja linja-autoaseman sijainnin.',
      verifiedAt: '2026-07-09',
    },
  },
  kokkola: {
    publicTransport: {
      name: 'Kokkolan kaupunkiliikenne BYSSE',
      url: 'https://www.kokkola.fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne/',
      group: 'Julkinen liikenne',
      sourceNote: 'Kokkolan kaupungin joukkoliikennesivu kokoaa BYSSE-kaupunkiliikenteen, Kälviän, Lohtajan ja Ullavan suunnan vuorot sekä Matkahuollon reitti- ja lipputiedot.',
      verifiedAt: '2026-07-09',
    },
    regionalNews: [regionalNewsProvider('Keskipohjanmaa', 'https://www.keskipohjanmaa.fi/')],
  },
  seinäjoki: {
    regionalNews: [regionalNewsProvider('Ilkka-Pohjalainen', 'https://ilkkapohjalainen.fi/')],
  },
};

const addFirst = (providers: Provider[] | undefined, provider?: Provider): Provider[] | undefined => {
  if (!providers || !provider || providers.some((item) => item.url === provider.url)) return providers;
  return [provider, ...providers];
};

const uniqueProviders = (providers: Provider[]) => providers.filter(
  (provider, index, all) => all.findIndex((item) => item.url === provider.url) === index
);

const normalizeArea = (value: string) => normalizeText(value)
  .replace(/\bhyvinvointialue\b/g, '')
  .replace(/\bmaakunta\b/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .map((word) => word.length > 4 ? word.replace(/n$/u, '') : word)
  .join(' ');

const regionalProviderRank = (provider: Provider, context: RegionalContext) => {
  const regional = provider as RegionalProvider;
  const municipalityKey = normalizeMunicipality(context.municipality.name);
  const providerMunicipality = regional.municipality ? normalizeMunicipality(regional.municipality) : '';
  const providerMunicipalities = regional.municipalities?.map(normalizeMunicipality) ?? [];
  const providerPlaces = [
    providerMunicipality,
    ...providerMunicipalities,
    provider.group ? normalizeMunicipality(provider.group) : '',
  ].filter(Boolean);
  const serviceAreaMunicipalities = getRegionalServiceAreaMunicipalities(context.municipality.name);

  if (providerMunicipality === municipalityKey || providerMunicipalities.includes(municipalityKey)) {
    return 0;
  }

  if (providerPlaces.some((place) => serviceAreaMunicipalities.includes(place))) {
    return 1;
  }

  const wellbeingArea = context.municipality.wellbeingAreaName;
  if (regional.area && wellbeingArea) {
    const providerArea = normalizeArea(regional.area);
    const municipalityArea = normalizeArea(wellbeingArea);
    if (providerArea && municipalityArea && (providerArea.includes(municipalityArea) || municipalityArea.includes(providerArea))) {
      return 1;
    }
  }

  return 2;
};

const prioritizeRegionalProviders = (providers: Provider[], context: RegionalContext) => (
  [...providers].sort((a, b) => regionalProviderRank(a, context) - regionalProviderRank(b, context))
);

const getProviderPlaceName = (provider: Provider) => {
  const regional = provider as RegionalProvider;
  return provider.group || regional.municipality || regional.area || '';
};

const sortProvidersByLocality = (providers: Provider[], context: RegionalContext) => (
  [...providers].sort((a, b) => {
    const rankDiff = regionalProviderRank(a, context) - regionalProviderRank(b, context);
    if (rankDiff !== 0) return rankDiff;

    const placeDiff = getProviderPlaceName(a).localeCompare(getProviderPlaceName(b), 'fi');
    if (placeDiff !== 0) return placeDiff;

    return a.name.localeCompare(b.name, 'fi');
  })
);

const filterRegionalProviders = (providers: Provider[], context: RegionalContext) => (
  providers.filter((provider) => regionalProviderRank(provider, context) < 2)
);

const isProviderRegionalForContext = (provider: Provider, context: RegionalContext) => {
  if (regionalProviderRank(provider, context) < 2) return true;

  const municipalityKey = normalizeMunicipality(context.municipality.name);
  const groupMunicipality = provider.group ? findMunicipality(provider.group) : null;
  if (groupMunicipality && normalizeMunicipality(groupMunicipality.name) === municipalityKey) return true;

  const nameMunicipality = findMunicipality(provider.name);
  return Boolean(nameMunicipality && normalizeMunicipality(nameMunicipality.name) === municipalityKey);
};

const markRegionalCategory = (provider: Provider, category: string): Provider => ({
  ...provider,
  group: category,
});

const filterPatientAssociationProviders = (providers: Provider[], context: RegionalContext) => {
  const memoryGroup = 'Muistiyhdistykset';
  const nonMemoryProviders = providers.filter((provider) => provider.group !== memoryGroup);
  const localMemoryProviders = filterRegionalProviders(
    providers.filter((provider) => provider.group === memoryGroup),
    context
  );

  return uniqueProviders([...nonMemoryProviders, ...prioritizeRegionalProviders(localMemoryProviders, context)]);
};

const alwaysVisibleTransportProviders: Provider[] = [
  { name: 'VR', url: 'https://www.vr.fi', group: 'Matkustus' },
  { name: 'Finnair', url: 'https://www.finnair.com/fi-fi', group: 'Matkustus' },
  { name: 'Tallink Silja Line', url: 'https://fi.tallink.com/', group: 'Matkustus' },
  { name: 'Viking Line', url: 'https://www.vikingline.fi/', group: 'Matkustus' },
  { name: 'Finnlines', url: 'https://www.finnlines.com/fi/', group: 'Matkustus' },
];

const alwaysVisibleLibraryProviders: Provider[] = [
  { name: 'Finna', url: 'https://www.finna.fi', group: 'Kirjastot' },
  { name: 'Kirjastot.fi', url: 'https://www.kirjastot.fi', group: 'Kirjastot' },
  { name: 'Celia-äänikirjat', url: 'https://www.celia.fi', group: 'Kirjastot' },
];

const uniqueFeeds = (feeds: RssFeedConfig[]) => feeds.filter(
  (feed, index, all) => all.findIndex((item) => item.url === feed.url) === index
);

const getMunicipalityInflections = (name: string) => {
  const base = normalizeMunicipality(name);
  const forms = new Set([base, `${base}n`, `${base}ssa`, `${base}ssä`, `${base}sta`, `${base}stä`, `${base}lla`, `${base}llä`, `${base}lta`, `${base}ltä`, `${base}lle`]);

  if (base.endsWith('i')) {
    const stem = base.slice(0, -1);
    forms.add(`${stem}issa`);
    forms.add(`${stem}issä`);
    forms.add(`${stem}ista`);
    forms.add(`${stem}istä`);
    forms.add(`${stem}iin`);
  }

  return [...forms];
};

const normalizeNameForMatch = (value: string) => normalizeText(value)
  .replace(/[-/]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const findMunicipality = (value: string): Municipality | null => {
  const normalized = normalizeMunicipality(value);
  const exact = municipalitiesByNormalizedName.get(normalized);
  if (exact) return exact;

  const exactSwedish = municipalitiesByNormalizedSwedishName.get(normalizeText(value));
  if (exactSwedish) return exactSwedish;

  const haystack = ` ${normalizeText(value)} `;
  const municipalitiesByLength = [...MUNICIPALITIES].sort((a, b) => b.name.length - a.name.length);

  return municipalitiesByLength.find((municipality) => {
    const forms = getMunicipalityInflections(municipality.name);
    return forms.some((form) => haystack.includes(` ${form} `));
  }) ?? null;
};

export const resolveRegionalContext = (query: string, locality: LocalityInfo | null): RegionalContext | null => {
  const queryMunicipality = findMunicipality(query);
  if (queryMunicipality) {
    return { municipality: queryMunicipality, displayName: queryMunicipality.name };
  }

  if (locality?.municipality) {
    const localityMunicipality = findMunicipality(locality.municipality);
    if (localityMunicipality) {
      return { municipality: localityMunicipality, displayName: locality.displayName || localityMunicipality.name };
    }
  }

  return null;
};

const getWellbeingAreaProvider = (municipality: Municipality): Provider | undefined => {
  if (!municipality.wellbeingAreaName) return undefined;

  const url = municipality.wellbeingAreaCode ? wellbeingAreaUrls[municipality.wellbeingAreaCode] : undefined;
  if (!url) return undefined;

  return {
    name: municipality.wellbeingAreaName,
    url,
    group: 'Hyvinvointialue',
    sourceArea: municipality.wellbeingAreaName,
    scope: 'wellbeingArea',
  };
};

const getWellbeingAreaNewsProvider = (municipality: Municipality): Provider | undefined => {
  if (!municipality.wellbeingAreaName || !municipality.wellbeingAreaCode) return undefined;
  const url = wellbeingAreaNewsUrls[municipality.wellbeingAreaCode];
  if (!url) return undefined;

  return {
    name: `Hyvinvointialueen tiedotteet: ${municipality.wellbeingAreaName}`,
    url,
    group: 'Alueelliset uutiset',
    sourceArea: municipality.wellbeingAreaName,
    scope: 'wellbeingArea',
  };
};

export const getRegionalProviders = (context: RegionalContext, language: LanguageCode = 'fi'): Provider[] => {
  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const serviceArea = getRegionalServiceArea(key);
  const wellbeingArea = exact?.wellbeingArea ?? getWellbeingAreaProvider(context.municipality);
  const publicTransport = getScopedPublicTransportProvider(exact?.publicTransport ?? serviceArea?.services.publicTransport ?? matkahuoltoRouteGuide, context, serviceArea);
  const serviceTransport = [
    ...(exact?.serviceTransport ?? []),
    serviceTransportByMunicipality.get(key),
  ].filter((provider): provider is Provider => Boolean(provider));
  const municipalityProvider = localizeMunicipalityProvider(exact?.municipality, municipality, language)
    ?? getMunicipalityWebsiteProvider(municipality, language);
  const libraryArea = getRegionalLibraryArea(key);
  const library = getScopedLibraryProvider(exact?.library, context, libraryArea);

  const routeGuide = publicTransport?.url.includes('hsl.fi') ? getScopedRouteGuideProvider(hslRouteGuide, serviceArea) : undefined;

  return filterVisibleProviders(uniqueProviders([
    municipalityProvider,
    wellbeingArea,
    library,
    publicTransport,
    routeGuide,
    ...serviceTransport,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

export const getRegionalPublicTransportProviders = (context: RegionalContext): Provider[] => {
  const key = normalizeMunicipality(context.municipality.name);
  const exact = localServiceMap[key];
  const serviceArea = getRegionalServiceArea(key);
  const publicTransport = getScopedPublicTransportProvider(exact?.publicTransport ?? serviceArea?.services.publicTransport ?? matkahuoltoRouteGuide, context, serviceArea);

  return filterVisibleProviders(uniqueProviders([
    publicTransport,
    publicTransport?.url.includes('hsl.fi') ? getScopedRouteGuideProvider(hslRouteGuide, serviceArea) : undefined,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

export const getRegionalLibraryProviders = (context: RegionalContext): Provider[] => {
  const key = normalizeMunicipality(context.municipality.name);
  const exact = localServiceMap[key];
  const libraryArea = getRegionalLibraryArea(key);

  return filterVisibleProviders(uniqueProviders([
    getScopedLibraryProvider(exact?.library, context, libraryArea),
    getScopedLibraryProvider(libraryArea?.provider, context, libraryArea),
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

export const getRegionalKelaTaxiProviders = (context: RegionalContext, language: LanguageCode = 'fi'): Provider[] => {
  const providers = KELA_TAXI_PROVIDERS.filter((provider) => provider.specialty !== 'sv' || language === 'sv');
  return filterVisibleProviders(sortProvidersByLocality(filterRegionalProviders(providers, context), context)) ?? [];
};

export const getRegionalNewsProviders = (context: RegionalContext): Provider[] => {
  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const wellbeingAreaNews = getWellbeingAreaNewsProvider(context.municipality);

  return filterVisibleProviders(uniqueProviders([
    ...(exact?.regionalNews ?? []),
    wellbeingAreaNews,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

const getRegionalNewspaperProviders = (context: RegionalContext): Provider[] => {
  const key = normalizeMunicipality(context.municipality.name);
  const localNewspaperNames = new Set(LOCAL_NEWSPAPER_FEEDS
    .filter((feed) => normalizeMunicipality(feed.municipality) === key)
    .map((feed) => normalizeText(feed.name)));

  return LOCAL_NEWSPAPER_LINKS
    .filter((link) => {
      if (localNewspaperNames.has(normalizeText(link.name))) return true;

      const newspaperName = ` ${normalizeNameForMatch(link.name)} `;
      return getMunicipalityInflections(context.municipality.name)
        .some((form) => newspaperName.includes(` ${normalizeNameForMatch(form)} `));
    })
    .map((link) => ({
      ...link,
      group: context.municipality.name,
      municipality: context.municipality.name,
      sourceMunicipality: context.municipality.name,
      scope: 'municipality' as const,
    }));
};

const getRegionalSportsClubProviders = (context: RegionalContext): Provider[] => (
  sortProvidersByLocality(filterRegionalProviders(LOCAL_SPORTS_CLUBS, context), context)
);

export const getAllRegionalProviders = (context: RegionalContext, language: LanguageCode = 'fi'): Provider[] => {
  const shortcutRegionalProviders = SHORTCUTS.flatMap((shortcut) => (
    shortcut.providers
      ?.filter((provider) => isProviderRegionalForContext(provider, context))
      .map((provider) => markRegionalCategory(provider, shortcut.name)) ?? []
  ));

  return filterVisibleProviders(uniqueProviders(sortProvidersByLocality([
    ...getRegionalProviders(context, language),
    ...getRegionalLibraryProviders(context),
    ...getRegionalNewsProviders(context),
    ...getRegionalNewspaperProviders(context).map((provider) => markRegionalCategory(provider, 'Lehdet')),
    ...getRegionalSportsClubProviders(context).map((provider) => markRegionalCategory(provider, 'Urheilu')),
    ...shortcutRegionalProviders,
  ], context))) ?? [];
};

export const getRegionalCategoryShortcuts = (context: RegionalContext, language: LanguageCode = 'fi'): Shortcut[] => {
  const primaryUrls = new Set([
    ...getRegionalProviders(context, language),
    ...getRegionalLibraryProviders(context),
    ...getRegionalNewsProviders(context),
  ].map((provider) => provider.url));
  const groupedProviders = new Map<string, Provider[]>();

  getAllRegionalProviders(context, language)
    .filter((provider) => provider.group && !primaryUrls.has(provider.url))
    .forEach((provider) => {
      const category = provider.group ?? 'Alueelliset';
      groupedProviders.set(category, [...(groupedProviders.get(category) ?? []), provider]);
    });

  return [...groupedProviders.entries()]
    .map(([name, providers]) => ({
      name,
      icon: getRegionalCategoryIcon(name),
      color: 'bg-brand-teal',
      providers: uniqueProviders(sortProvidersByLocality(providers, context)),
    }))
    .filter((shortcut) => shortcut.providers.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'fi'));
};

const getRegionalCategoryIcon = (category: string) => {
  const text = category.toLocaleLowerCase('fi-FI');
  if (text.includes('lehti') || text.includes('lehdet') || text.includes('uutinen')) return '📰';
  if (text.includes('liikenne') || text.includes('reitti')) return '🚌';
  if (text.includes('museo')) return '🖼️';
  if (text.includes('teatteri')) return '🎭';
  if (text.includes('musiikki')) return '🎵';
  if (text.includes('liikunta') || text.includes('urheilu')) return '🚶';
  if (text.includes('yhdistys') || text.includes('yhdistykset')) return '👥';
  if (text.includes('kotihoito')) return '🤝';
  return '📍';
};

export const getRegionalRssFeeds = (context: RegionalContext): RssFeedConfig[] => {
  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const newspaperFeeds = LOCAL_NEWSPAPER_FEEDS
    .filter((feed) => normalizeMunicipality(feed.municipality) === key)
    .map((feed) => ({ name: feed.name, url: feed.url }));
  const municipalityNewsFeeds = MUNICIPALITY_NEWS_FEEDS
    .filter((feed) => normalizeMunicipality(feed.municipality) === key)
    .map((feed) => ({ name: feed.name, url: feed.url }));

  return uniqueFeeds([
    ...newspaperFeeds,
    ...municipalityNewsFeeds,
    ...(exact?.rssFeeds ?? []),
  ]);
};

export const getLocalizedShortcuts = (shortcuts: Shortcut[], locality: LocalityInfo | null, language: LanguageCode = 'fi'): Shortcut[] => {
  const context = resolveRegionalContext('', locality);
  if (!context) return shortcuts;

  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const serviceArea = getRegionalServiceArea(key);
  const wellbeingArea = exact?.wellbeingArea ?? getWellbeingAreaProvider(context.municipality);

  const fallback: LocalServiceConfig = {
    publicTransport: getScopedPublicTransportProvider(serviceArea?.services.publicTransport ?? matkahuoltoRouteGuide, context, serviceArea),
    wellbeingArea,
    municipality: localizeMunicipalityProvider(exact?.municipality, municipality, language)
      ?? getMunicipalityWebsiteProvider(municipality, language),
  };

  const services = { ...fallback, ...exact, wellbeingArea: exact?.wellbeingArea ?? fallback.wellbeingArea };

  return shortcuts.map((shortcut) => {
    if (!shortcut.providers) return shortcut;

    if (shortcut.name === 'Liikenne') {
      return {
        ...shortcut,
        providers: uniqueProviders([
          ...getRegionalPublicTransportProviders(context),
          ...getRegionalKelaTaxiProviders(context, language),
          ...alwaysVisibleTransportProviders,
        ]),
      };
    }

    if (shortcut.name === 'Kirjastot') {
      return {
        ...shortcut,
        providers: uniqueProviders([
          ...getRegionalLibraryProviders(context),
          ...alwaysVisibleLibraryProviders,
        ]),
      };
    }

    if (shortcut.name === 'Julkiset palvelut') {
      return {
        ...shortcut,
        providers: uniqueProviders([
          services.municipality,
          services.wellbeingArea,
          ...(filterVisibleProviders(shortcut.providers) ?? []),
        ].filter((provider): provider is Provider => Boolean(provider))),
      };
    }

    if (shortcut.name === 'Puhelinnumerot') {
      return {
        ...shortcut,
        providers: uniqueProviders([
          ...getRegionalKelaTaxiProviders(context, language),
          ...shortcut.providers,
        ]),
      };
    }

    if (shortcut.name === 'Terveys') {
      return { ...shortcut, providers: addFirst(shortcut.providers, services.wellbeingArea) };
    }

    if (shortcut.name === 'Uutiset & Media') {
      return { ...shortcut, providers: uniqueProviders([...getRegionalNewsProviders(context), ...shortcut.providers]) };
    }

    if (shortcut.name === 'Lehdet') {
      return { ...shortcut, providers: uniqueProviders([...getRegionalNewspaperProviders(context), ...shortcut.providers]) };
    }

    if (shortcut.name === 'Urheilu') {
      return { ...shortcut, providers: uniqueProviders([...getRegionalSportsClubProviders(context), ...shortcut.providers]) };
    }

    if (shortcut.name === 'Museot' || shortcut.name === 'Teatterit') {
      return { ...shortcut, providers: uniqueProviders(sortProvidersByLocality(shortcut.providers, context)) };
    }

    if (shortcut.name === 'Eläkeyhdistykset') {
      const regionalAssociations = filterRegionalProviders(shortcut.providers, context);
      return {
        ...shortcut,
        providers: uniqueProviders(prioritizeRegionalProviders(
          regionalAssociations.length > 0 ? regionalAssociations : shortcut.providers,
          context,
        )),
      };
    }

    if (shortcut.name === 'Potilasyhdistykset') {
      return { ...shortcut, providers: filterPatientAssociationProviders(shortcut.providers, context) };
    }

    if (shortcut.name === 'Kotihoito-palvelut') {
      return {
        ...shortcut,
        providers: shortcut.providers.filter((provider) => (
          provider.group && normalizeMunicipality(provider.group) === key
        )),
      };
    }

    return shortcut;
  }).map((shortcut) => shortcut.providers
    ? { ...shortcut, providers: filterVisibleProviders(shortcut.providers) }
    : shortcut
  );
};
