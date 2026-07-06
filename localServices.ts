import { MUNICIPALITIES } from './municipalRegistry';
import { MUNICIPALITY_WEBSITES } from './municipalityWebsites';
import { MUNICIPALITY_WEBSITE_LANGUAGE_URLS } from './municipalityWebsiteLocales';
import { MUNICIPALITY_SWEDISH_NAMES_BY_CODE } from './municipalityNames';
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
  '21': 'https://lapha.fi/ajankohtaista',
  '90': 'https://www.hel.fi/fi/uutiset',
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
    id: 'oulu-region',
    name: 'Oulun seutu',
    municipalities: ['ii', 'kempele', 'liminka', 'lumijoki', 'muhos', 'oulu', 'tyrnävä', 'utajärvi'],
    services: {
      publicTransport: { name: 'Oulun joukkoliikenne', url: 'https://www.oulunjoukkoliikenne.fi/', group: 'Julkinen liikenne' },
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
    name: 'Pori',
    municipalities: ['pori'],
    services: {
      publicTransport: { name: 'Porin joukkoliikenne', url: 'https://pjl.pori.fi/', group: 'Julkinen liikenne' },
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
  pori: {
    regionalNews: [regionalNewsProvider('Satakunnan Kansa', 'https://www.satakunnankansa.fi/')],
  },
  joensuu: {
    regionalNews: [regionalNewsProvider('Karjalainen', 'https://www.karjalainen.fi/')],
  },
  rovaniemi: {
    regionalNews: [regionalNewsProvider('Lapin Kansa', 'https://www.lapinkansa.fi/')],
  },
  lahti: {
    regionalNews: [regionalNewsProvider('Etelä-Suomen Sanomat', 'https://www.ess.fi/')],
  },
  loviisa: {
    publicTransport: { name: 'Loviisan joukkoliikenne', url: 'https://www.loviisa.fi/asuminen-ja-ymparisto/liikenne/joukkoliikenne/', group: 'Julkinen liikenne' },
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
  kokkola: {
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

  return uniqueFeeds([
    ...newspaperFeeds,
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
