import { MUNICIPALITIES } from './municipalRegistry';
import { LOCAL_NEWSPAPER_FEEDS } from './localNewspaperFeeds';
import { filterVisibleProviders } from './linkVisibility';
import { LocalityInfo, Municipality, Provider, RegionalContext, RssFeedConfig, Shortcut } from './types';

interface LocalServiceConfig {
  publicTransport?: Provider;
  library?: Provider;
  wellbeingArea?: Provider;
  municipality?: Provider;
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
  '09': 'https://paijat-sote.fi/',
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
  '91': 'https://www.aland.fi/',
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
    .replace(/\s+-\s+.*$/i, '')
    .trim();

  return municipalityAliases[normalized] ?? normalized;
};

const municipalitiesByNormalizedName = new Map<string, Municipality>(
  MUNICIPALITIES.map((municipality) => [normalizeMunicipality(municipality.name), municipality])
);

const createMunicipalitySearch = (municipality: string, label: string, query: string): Provider => ({
  name: `${label}: ${municipality}`,
  url: `https://www.google.com/search?q=${encodeURIComponent(`${municipality} ${query}`)}`,
  group: 'Paikalliset palvelut',
});

const createNewsSearch = (municipality: string, source: string, site?: string): Provider => ({
  name: `${source}: ${municipality}`,
  url: site
    ? `https://www.google.com/search?q=${encodeURIComponent(`site:${site} ${municipality} uutiset`)}`
    : `https://www.google.com/search?q=${encodeURIComponent(`${municipality} uutiset`)}`,
  group: 'Alueelliset uutiset',
});

const createGoogleNewsRss = (municipality: string): RssFeedConfig => ({
  name: `Google News: ${municipality}`,
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(`${municipality} uutiset`)}&hl=fi&gl=FI&ceid=FI:fi`,
});

const stripDiacritics = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const localPaperSlugOverrides: Record<string, string> = {
  espoo: 'espoon',
  helsinki: 'helsingin',
  kauniainen: 'kauniaisten',
  kuopio: 'kuopion',
  lappeenranta: 'lappeenrannan',
  lahti: 'lahden',
  oulu: 'oulun',
  pori: 'porin',
  porvoo: 'porvoon',
  tampere: 'tampereen',
  turku: 'turun',
  vaasa: 'vaasan',
  vantaa: 'vantaan',
  jyvaskyla: 'jyvaskylan',
  ylojarvi: 'ylojarven',
};

const createLocalPaperRssFeed = (municipality: string): RssFeedConfig => {
  const normalized = stripDiacritics(normalizeMunicipality(municipality));
  const slug = localPaperSlugOverrides[normalized]
    ?? normalized.replace(/i$/, 'in').replace(/a$/, 'an').replace(/ä$/, 'än').replace(/o$/, 'on').replace(/u$/, 'un').replace(/e$/, 'een');

  return {
    name: `Paikallislehti: ${municipality}`,
    url: `https://${slug}uutiset.fi/feed`,
  };
};

const regionalServiceAreas: RegionalServiceArea[] = [
  {
    id: 'helsinki-region',
    name: 'Helsingin seutu',
    municipalities: ['espoo', 'helsinki', 'kauniainen', 'kerava', 'kirkkonummi', 'siuntio', 'sipoo', 'tuusula', 'vantaa'],
    services: {
      publicTransport: { name: 'HSL Reittiopas', url: 'https://www.hsl.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'tampere-region',
    name: 'Tampereen kaupunkiseutu',
    municipalities: ['kangasala', 'lempäälä', 'nokia', 'orivesi', 'pirkkala', 'tampere', 'vesilahti', 'ylöjärvi'],
    services: {
      publicTransport: { name: 'Nysse', url: 'https://www.nysse.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'turku-region',
    name: 'Turun seutu',
    municipalities: ['kaarina', 'lieto', 'naantali', 'paimio', 'raisio', 'rusko', 'turku'],
    services: {
      publicTransport: { name: 'Föli', url: 'https://www.foli.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'oulu-region',
    name: 'Oulun seutu',
    municipalities: ['ii', 'kempele', 'liminka', 'lumijoki', 'muhos', 'oulu', 'tyrnävä', 'utajärvi'],
    services: {
      publicTransport: { name: 'Oulun joukkoliikenne', url: 'https://www.oulunjoukkoliikenne.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'jyvaskyla-region',
    name: 'Jyväskylän seutu',
    municipalities: ['hankasalmi', 'jyväskylä', 'laukaa', 'muurame', 'petäjävesi', 'toivakka', 'äänekoski'],
    services: {
      publicTransport: { name: 'Linkki-paikallisliikenne', url: 'https://linkki.jyvaskyla.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'kuopio-region',
    name: 'Kuopion seutu',
    municipalities: ['kuopio', 'siilinjärvi'],
    services: {
      publicTransport: { name: 'Vilkku', url: 'https://vilkku.kuopio.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'joensuu-region',
    name: 'Joensuun seutu',
    municipalities: ['joensuu', 'kontiolahti', 'liperi'],
    services: {
      publicTransport: { name: 'JOJO', url: 'https://jojo.joensuu.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'kouvola-region',
    name: 'Kouvola',
    municipalities: ['kouvola'],
    services: {
      publicTransport: { name: 'Koutsi', url: 'https://www.kouvola.fi/koutsi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'lappeenranta-region',
    name: 'Lappeenrannan seutu',
    municipalities: ['imatra', 'lappeenranta'],
    services: {
      publicTransport: { name: 'Jouko', url: 'https://lappeenranta.fi/fi/palvelut/jouko-joukkoliikenne', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'pori-region',
    name: 'Pori',
    municipalities: ['pori'],
    services: {
      publicTransport: { name: 'Porin joukkoliikenne', url: 'https://pjl.pori.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'kotka-region',
    name: 'Kotkan seutu',
    municipalities: ['hamina', 'kotka', 'pyhtää'],
    services: {
      publicTransport: { name: 'Jonne & Minne', url: 'https://www.kotkanaikataulut.fi/', group: 'Paikalliset palvelut' },
    },
  },
  {
    id: 'aland-region',
    name: 'Ahvenanmaa',
    municipalities: ['brändö', 'eckerö', 'finström', 'föglö', 'geta', 'hammarland', 'jomala', 'kumlinge', 'kökar', 'lemland', 'lumparland', 'maarianhamina', 'saltvik', 'sottunga', 'sund', 'vårdö'],
    services: {
      publicTransport: { name: 'Ålandstrafiken', url: 'https://www.alandstrafiken.ax/', group: 'Paikalliset palvelut' },
    },
  },
];

const getRegionalServiceArea = (municipalityKey: string): RegionalServiceArea | undefined => (
  regionalServiceAreas.find((area) => area.municipalities.includes(municipalityKey))
);

const localServiceMap: Record<string, LocalServiceConfig> = {
  helsinki: {
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Helsingin palvelut', url: 'https://www.hel.fi/fi', group: 'Paikalliset palvelut' },
  },
  espoo: {
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Espoon palvelut', url: 'https://www.espoo.fi/fi', group: 'Paikalliset palvelut' },
    rssFeeds: [
      { name: 'Espoon uutiset', url: 'https://www.espoo.fi/fi/rss/news' },
      { name: 'Espoon artikkelit', url: 'https://www.espoo.fi/fi/rss/articles' },
    ],
  },
  vantaa: {
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Vantaan palvelut', url: 'https://www.vantaa.fi/fi', group: 'Paikalliset palvelut' },
    rssFeeds: [
      { name: 'Vantaan uutiset', url: 'https://www.vantaa.fi/fi/rss/topical/121' },
      { name: 'Vantaan tiedotteet', url: 'https://www.vantaa.fi/fi/rss/topical/119' },
    ],
  },
  kauniainen: {
    library: { name: 'Helmet-kirjastot', url: 'https://www.helmet.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Kauniaisten palvelut', url: 'https://www.kauniainen.fi/', group: 'Paikalliset palvelut' },
  },
  tampere: {
    library: { name: 'PIKI-kirjastot', url: 'https://piki.verkkokirjasto.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Tampereen palvelut', url: 'https://www.tampere.fi/', group: 'Paikalliset palvelut' },
    rssFeeds: [
      { name: 'Tampereen uutiset', url: 'https://www.tampere.fi/ajankohtaista/uutiset.xml' },
      { name: 'Tampereen artikkelit', url: 'https://www.tampere.fi/ajankohtaista/artikkelit.xml' },
      { name: 'Tampereen ilmoitukset', url: 'https://www.tampere.fi/ajankohtaista/ilmoitukset.xml' },
    ],
  },
  turku: {
    library: { name: 'Vaski-kirjastot', url: 'https://vaski.finna.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Turun palvelut', url: 'https://www.turku.fi/', group: 'Paikalliset palvelut' },
  },
  oulu: {
    library: { name: 'OUTI-kirjastot', url: 'https://outi.finna.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Oulun palvelut', url: 'https://www.ouka.fi/', group: 'Paikalliset palvelut' },
    rssFeeds: [
      { name: 'Oulun kaupungin uutiset', url: 'https://www.ouka.fi/news/feed?audience=All&region=All&topic=All' },
      { name: 'Kaleva: Oulun seutu', url: 'https://kaleva.fi/feedit/rss/managed-listing/oulun-seutu/' },
    ],
  },
  kuopio: {
    municipality: { name: 'Kuopion palvelut', url: 'https://www.kuopio.fi/', group: 'Paikalliset palvelut' },
  },
  jyväskylä: {
    library: { name: 'Keski-kirjastot', url: 'https://keski.finna.fi/', group: 'Paikalliset palvelut' },
    municipality: { name: 'Jyväskylän palvelut', url: 'https://www.jyvaskyla.fi/', group: 'Paikalliset palvelut' },
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
  return {
    name: municipality.wellbeingAreaName,
    url: url ?? `https://www.google.com/search?q=${encodeURIComponent(municipality.wellbeingAreaName)}`,
    group: 'Hyvinvointialue',
  };
};

export const getRegionalProviders = (context: RegionalContext): Provider[] => {
  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const serviceArea = getRegionalServiceArea(key);
  const wellbeingArea = exact?.wellbeingArea ?? getWellbeingAreaProvider(context.municipality);
  const publicTransport = exact?.publicTransport ?? serviceArea?.services.publicTransport;

  return filterVisibleProviders(uniqueProviders([
    exact?.municipality ?? createMunicipalitySearch(municipality, 'Kunnan palvelut', 'palvelut'),
    wellbeingArea ?? createMunicipalitySearch(municipality, 'Hyvinvointialue', 'hyvinvointialue'),
    exact?.library,
    publicTransport,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

export const getRegionalNewsProviders = (context: RegionalContext): Provider[] => {
  const municipality = context.municipality.name;
  const wellbeingArea = context.municipality.wellbeingAreaName;

  return filterVisibleProviders(uniqueProviders([
    createNewsSearch(municipality, 'Kunnan uutiset'),
    wellbeingArea ? createNewsSearch(wellbeingArea, 'Hyvinvointialueen tiedotteet') : undefined,
  ].filter((provider): provider is Provider => Boolean(provider)))) ?? [];
};

export const getRegionalRssFeeds = (context: RegionalContext): RssFeedConfig[] => {
  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const newspaperFeeds = LOCAL_NEWSPAPER_FEEDS
    .filter((feed) => normalizeMunicipality(feed.municipality) === key)
    .map((feed) => ({ name: feed.name, url: feed.url }));

  if (newspaperFeeds.length > 0 || (exact?.rssFeeds?.length ?? 0) > 0) {
    return uniqueFeeds([
      ...newspaperFeeds,
      ...(exact?.rssFeeds ?? []),
    ]);
  }

  return uniqueFeeds([
    createLocalPaperRssFeed(municipality),
    createGoogleNewsRss(municipality),
  ]);
};

export const getLocalizedShortcuts = (shortcuts: Shortcut[], locality: LocalityInfo | null): Shortcut[] => {
  const context = resolveRegionalContext('', locality);
  if (!context) return shortcuts;

  const municipality = context.municipality.name;
  const key = normalizeMunicipality(municipality);
  const exact = localServiceMap[key];
  const serviceArea = getRegionalServiceArea(key);
  const wellbeingArea = exact?.wellbeingArea ?? getWellbeingAreaProvider(context.municipality);

  const fallback: LocalServiceConfig = {
    publicTransport: serviceArea?.services.publicTransport,
    wellbeingArea: wellbeingArea ?? createMunicipalitySearch(municipality, 'Hyvinvointialue', 'hyvinvointialue'),
    municipality: exact?.municipality ?? createMunicipalitySearch(municipality, 'Kunnan palvelut', 'palvelut'),
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
