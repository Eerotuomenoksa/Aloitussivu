import { MUNICIPALITIES } from './municipalRegistry';
import { MUNICIPALITY_WEBSITES } from './municipalityWebsites';
import { MUNICIPALITY_WEBSITE_LANGUAGE_URLS } from './municipalityWebsiteLocales';
import { MUNICIPALITY_SWEDISH_NAMES_BY_CODE } from './municipalityNames';
import { LOCAL_NEWSPAPER_FEEDS } from './localNewspaperFeeds';
import { filterVisibleProviders } from './linkVisibility';
import { LocalityInfo, Municipality, Provider, RegionalContext, RssFeedConfig, Shortcut } from './types';
import type { LanguageCode } from './i18n';

interface LocalServiceConfig {
  publicTransport?: Provider;
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
  };
};

const localizeMunicipalityProvider = (provider: Provider | undefined, municipality: string, language: LanguageCode = 'fi'): Provider | undefined => {
  if (!provider) return provider;
  const url = getMunicipalityWebsiteUrl(municipality, language);
  return url ? { ...provider, url } : provider;
};

const regionalServiceAreas: RegionalServiceArea[] = [
  {
    id: 'helsinki-region',
    name: 'Helsingin seutu',
    municipalities: ['espoo', 'helsinki', 'kauniainen', 'kerava', 'kirkkonummi', 'siuntio', 'sipoo', 'tuusula', 'vantaa'],
    services: {
      publicTransport: { name: 'HSL Reittiopas', url: 'https://www.hsl.fi/', group: 'Julkinen liikenne' },
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

const hslPublicTransport: Provider = { name: 'HSL', url: 'https://www.hsl.fi/', group: 'Julkinen liikenne' };

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
  };
};

export const getRegionalProviders = (context: RegionalContext, language: LanguageCode = 'fi'): Provider[] => {
  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const serviceArea = getRegionalServiceArea(key);
  const wellbeingArea = exact?.wellbeingArea ?? getWellbeingAreaProvider(context.municipality);
  const publicTransport = exact?.publicTransport ?? serviceArea?.services.publicTransport;
  const municipalityProvider = localizeMunicipalityProvider(exact?.municipality, municipality, language)
    ?? getMunicipalityWebsiteProvider(municipality, language);

  return filterVisibleProviders(uniqueProviders([
    municipalityProvider,
    wellbeingArea,
    exact?.library,
    publicTransport,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

export const getRegionalPublicTransportProviders = (context: RegionalContext): Provider[] => {
  const key = normalizeMunicipality(context.municipality.name);
  const exact = localServiceMap[key];
  const serviceArea = getRegionalServiceArea(key);

  return filterVisibleProviders(uniqueProviders([
    exact?.publicTransport ?? serviceArea?.services.publicTransport,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

export const getRegionalLibraryProviders = (context: RegionalContext): Provider[] => {
  const key = normalizeMunicipality(context.municipality.name);
  const exact = localServiceMap[key];

  return filterVisibleProviders(uniqueProviders([
    exact?.library,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
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
    publicTransport: serviceArea?.services.publicTransport,
    wellbeingArea,
    municipality: localizeMunicipalityProvider(exact?.municipality, municipality, language)
      ?? getMunicipalityWebsiteProvider(municipality, language),
  };

  const services = { ...fallback, ...exact, wellbeingArea: exact?.wellbeingArea ?? fallback.wellbeingArea };

  return shortcuts.map((shortcut) => {
    if (!shortcut.providers) return shortcut;

    if (shortcut.name === 'Liikenne') {
      return { ...shortcut, providers: addFirst(shortcut.providers, services.publicTransport) };
    }

    if (shortcut.name === 'Kirjastot') {
      return { ...shortcut, providers: addFirst(shortcut.providers, services.library) };
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

    if (shortcut.name === 'Terveys') {
      return { ...shortcut, providers: addFirst(shortcut.providers, services.wellbeingArea) };
    }

    if (shortcut.name === 'Uutiset & Media') {
      return { ...shortcut, providers: uniqueProviders([...getRegionalNewsProviders(context), ...shortcut.providers]) };
    }

    return shortcut;
  }).map((shortcut) => shortcut.providers
    ? { ...shortcut, providers: filterVisibleProviders(shortcut.providers) }
    : shortcut
  );
};
