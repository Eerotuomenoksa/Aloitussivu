import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SHORTCUTS } from './constants';
import { MUNICIPALITIES } from './municipalRegistry';
import { getRegionalLibraryProviders, getRegionalNewsProviders, getRegionalProviders, getRegionalPublicTransportProviders, getRegionalRssFeeds, getRegionalServiceAreaMunicipalities, normalizeMunicipality } from './localServices';
import { Municipality, Provider } from './types';
import { installUsageTracking } from './usageTracking';
import { translateCategoryName } from './i18n';
import {
  PublicPageLanguage,
  PublicPageLanguageSwitcher,
  usePublicPageLanguage,
} from './publicPageLocalization';

interface GeneralLinkRow {
  name: string;
  url: string;
  category: string;
  group: string;
}

interface RegionalLinkRow {
  municipality: string;
  category: string;
  name: string;
  url: string;
}

interface MunicipalityLinkRow {
  municipality: string;
  municipalityWebsites: RegionalLinkRow[];
  wellbeingAreas: RegionalLinkRow[];
  libraries: RegionalLinkRow[];
  publicTransport: RegionalLinkRow[];
  serviceTransport: RegionalLinkRow[];
  museums: RegionalLinkRow[];
  theaters: RegionalLinkRow[];
  patientAssociations: RegionalLinkRow[];
  seniorAssociations: RegionalLinkRow[];
  regionalNews: RegionalLinkRow[];
  rssFeeds: RegionalLinkRow[];
}

type ActiveView = 'general' | 'regional' | 'municipalities';

const collator = new Intl.Collator('fi-FI');
const municipalityNameColumnWidth = 176;
const municipalityLinkColumnWidth = 320;
const municipalityLinkColumnCount = 11;
const municipalityTableMinWidth = municipalityNameColumnWidth + (municipalityLinkColumnWidth * municipalityLinkColumnCount);

const uniqueByKey = <T,>(items: T[], getKey: (item: T) => string) => [
  ...new Map(items.map((item) => [getKey(item), item])).values(),
];

const providerToRegionalRow = (
  municipality: string,
  category: string,
  provider: Provider
): RegionalLinkRow => ({
  municipality,
  category,
  name: provider.name,
  url: provider.url,
});

const getShortcutProviders = (name: string) => (
  SHORTCUTS.find((shortcut) => shortcut.name === name)?.providers ?? []
);

const providerMunicipalityNames = (provider: Provider) => {
  const regionalProvider = provider as Provider & {
    municipality?: string;
    municipalities?: string[];
  };

  return [
    regionalProvider.municipality,
    ...(regionalProvider.municipalities ?? []),
    provider.group,
  ].filter((value): value is string => Boolean(value));
};

const normalizeArea = (value: string) => normalizeMunicipality(value)
  .replace(/\bhyvinvointialue\b/g, '')
  .replace(/\bmaakunta\b/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .map((word) => word.length > 4 ? word.replace(/n$/u, '') : word)
  .join(' ');

const providerMatchesWellbeingArea = (provider: Provider, municipality: Municipality) => {
  const regionalProvider = provider as Provider & { area?: string };
  if (!regionalProvider.area || !municipality.wellbeingAreaName) return false;

  const providerArea = normalizeArea(regionalProvider.area);
  const municipalityArea = normalizeArea(municipality.wellbeingAreaName);
  if (!providerArea || providerArea === 'koko suomi' || !municipalityArea) return false;

  return providerArea.includes(municipalityArea) || municipalityArea.includes(providerArea);
};

const providerMatchesMunicipalityArea = (provider: Provider, municipality: Municipality) => (
  providerMunicipalityNames(provider)
    .map(normalizeMunicipality)
    .some((name) => getRegionalServiceAreaMunicipalities(municipality.name).includes(name))
  || providerMatchesWellbeingArea(provider, municipality)
);

const museumProviders = getShortcutProviders('Museot');
const theaterProviders = getShortcutProviders('Teatterit');
const patientAssociationProviders = getShortcutProviders('Potilasyhdistykset');
const seniorAssociationProviders = getShortcutProviders('Eläkeyhdistykset');

const generalLinks = uniqueByKey(
  SHORTCUTS.flatMap((shortcut) => (shortcut.providers ?? shortcut.url
    ? shortcut.providers?.map((provider) => ({
        name: provider.name,
        url: provider.url,
        category: shortcut.name,
        group: provider.group ?? '',
      })) ?? [{
        name: shortcut.name,
        url: shortcut.url ?? '',
        category: shortcut.name,
        group: '',
      }]
    : []
  )),
  (row) => `${row.category}|${row.group}|${row.name}|${row.url}`
).sort((a, b) => collator.compare(`${a.category} ${a.name}`, `${b.category} ${b.name}`));

const phoneLinkCount = uniqueByKey(
  SHORTCUTS.flatMap((shortcut) => (shortcut.providers ?? []).filter((provider) => provider.phone)),
  (provider) => `${provider.name}|${provider.url}|${provider.phone}`
).length;

const municipalityRows: MunicipalityLinkRow[] = MUNICIPALITIES
  .map((municipality) => {
    const context = { municipality, displayName: municipality.name };
    const publicTransport = getRegionalPublicTransportProviders(context).map((provider) => (
      providerToRegionalRow(municipality.name, 'Julkinen liikenne', provider)
    ));
    const libraries = getRegionalLibraryProviders(context).map((provider) => (
      providerToRegionalRow(municipality.name, 'Kirjastot', provider)
    ));
    const separatedUrls = new Set([...publicTransport, ...libraries].map((row) => row.url));
    const regionalProviders = getRegionalProviders(context)
      .filter((provider) => !separatedUrls.has(provider.url));
    const municipalityWebsiteUrls = new Set(
      regionalProviders
        .filter((provider, index) => index === 0 && provider.group === 'Paikalliset palvelut')
        .map((provider) => provider.url)
    );
    const wellbeingAreaUrls = new Set(
      regionalProviders
        .filter((provider) => provider.group === 'Hyvinvointialue')
        .map((provider) => provider.url)
    );
    const municipalityWebsites = regionalProviders
      .filter((provider) => municipalityWebsiteUrls.has(provider.url))
      .map((provider) => (
        providerToRegionalRow(municipality.name, 'Kunnan nettisivut', provider)
      ));
    const wellbeingAreas = regionalProviders
      .filter((provider) => wellbeingAreaUrls.has(provider.url))
      .map((provider) => (
        providerToRegionalRow(municipality.name, 'Hyvinvointialue', provider)
      ));
    const serviceTransport = regionalProviders
      .filter((provider) => provider.group === 'Palveluliikenne')
      .map((provider) => (
        providerToRegionalRow(municipality.name, 'Palveluliikenne', provider)
      ));
    const museums = museumProviders
      .filter((provider) => providerMatchesMunicipalityArea(provider, municipality))
      .map((provider) => providerToRegionalRow(municipality.name, 'Museot', provider));
    const theaters = theaterProviders
      .filter((provider) => providerMatchesMunicipalityArea(provider, municipality))
      .map((provider) => providerToRegionalRow(municipality.name, 'Teatterit', provider));
    const patientAssociations = patientAssociationProviders
      .filter((provider) => providerMatchesMunicipalityArea(provider, municipality))
      .map((provider) => providerToRegionalRow(municipality.name, 'Potilasyhdistykset', provider));
    const seniorAssociations = seniorAssociationProviders
      .filter((provider) => providerMatchesMunicipalityArea(provider, municipality))
      .map((provider) => providerToRegionalRow(municipality.name, 'Eläkeyhdistykset', provider));
    const regionalNews = getRegionalNewsProviders(context).map((provider) => (
      providerToRegionalRow(municipality.name, 'Alueelliset uutiset', provider)
    ));
    const rssFeeds = getRegionalRssFeeds(context).map((feed) => ({
      municipality: municipality.name,
      category: 'Uutisvirrat',
      name: feed.name,
      url: feed.url,
    }));

    return {
      municipality: municipality.name,
      municipalityWebsites: uniqueByKey(municipalityWebsites, (row) => `${row.category}|${row.name}|${row.url}`),
      wellbeingAreas: uniqueByKey(wellbeingAreas, (row) => `${row.category}|${row.name}|${row.url}`),
      libraries: uniqueByKey(libraries, (row) => `${row.category}|${row.name}|${row.url}`),
      publicTransport: uniqueByKey(publicTransport, (row) => `${row.category}|${row.name}|${row.url}`),
      serviceTransport: uniqueByKey(serviceTransport, (row) => `${row.category}|${row.name}|${row.url}`),
      museums: uniqueByKey(museums, (row) => `${row.category}|${row.name}|${row.url}`),
      theaters: uniqueByKey(theaters, (row) => `${row.category}|${row.name}|${row.url}`),
      patientAssociations: uniqueByKey(patientAssociations, (row) => `${row.category}|${row.name}|${row.url}`),
      seniorAssociations: uniqueByKey(seniorAssociations, (row) => `${row.category}|${row.name}|${row.url}`),
      regionalNews: uniqueByKey(regionalNews, (row) => `${row.category}|${row.name}|${row.url}`),
      rssFeeds: uniqueByKey(rssFeeds, (row) => `${row.category}|${row.name}|${row.url}`),
    };
  })
  .sort((a, b) => collator.compare(a.municipality, b.municipality));

const regionalLinks = uniqueByKey(
  municipalityRows.flatMap((row) => [...row.municipalityWebsites, ...row.wellbeingAreas, ...row.libraries, ...row.publicTransport, ...row.serviceTransport, ...row.museums, ...row.theaters, ...row.patientAssociations, ...row.seniorAssociations, ...row.regionalNews, ...row.rssFeeds]),
  (row) => `${row.municipality}|${row.category}|${row.name}|${row.url}`
).sort((a, b) => collator.compare(`${a.municipality} ${a.category} ${a.name}`, `${b.municipality} ${b.category} ${b.name}`));

const allLinkCount = generalLinks.length + regionalLinks.length;
const pageNavLinkClass = 'aurora-nav-link px-4 py-2 text-sm';

const linkListTranslations = {
  fi: {
    pageLinks: 'Sivun linkit',
    backHome: 'Takaisin aloitussivulle',
    kicker: 'Ammattilaisille',
    title: 'Linkkiluettelo',
    intro: 'Koonti sivuston yleisistä linkeistä sekä jokaiselle kunnalle muodostuvista alueellisista palvelu-, uutis- ja RSS-linkeistä.',
    searchLabel: 'Hae linkeistä',
    searchPlaceholder: 'Hae nimellä, URLilla, kategorialla tai paikkakunnalla',
    downloadGeneral: 'Lataa yleiset CSV',
    downloadRegional: 'Lataa alueelliset CSV',
    allLinks: 'Kaikki linkit',
    allLinksSubtitle: 'Yleiset + alueelliset',
    generalLinks: 'Yleiset linkit',
    regionalLinks: 'Alueelliset linkit',
    municipalities: 'Paikkakunnat',
    phoneNumbers: 'Puhelinnumeroita',
    views: 'Linkkiluettelon näkymät',
    byMunicipality: 'Paikkakunnittain',
    skipList: 'Ohita valittu linkkilista',
    regionalIntro: 'Tässä näkymässä ovat vain paikkakuntiin liittyvät linkit: kunnan sivut, hyvinvointialueet, kirjastot, kulttuuri- ja yhdistyslinkit, alueelliset uutiset ja uutisvirrat.',
    municipalitiesHeading: 'Paikkakunnat aakkosjärjestyksessä',
    pageName: 'Sivun nimi',
    url: 'URL',
    category: 'Kategoria',
    group: 'Ryhmä',
    municipality: 'Paikkakunta',
    municipalityWebsite: 'Kunnan nettisivut',
    wellbeingArea: 'Hyvinvointialue',
    library: 'Kirjasto',
    publicTransport: 'Julkinen liikenne',
    serviceTransport: 'Palveluliikenne',
    museums: 'Museot',
    theaters: 'Teatterit',
    patientAssociations: 'Potilasyhdistykset',
    seniorAssociations: 'Eläkeyhdistykset',
    regionalNews: 'Alueelliset uutiset',
    newsFeeds: 'Uutisvirrat',
    listEnd: 'Linkkilistan loppu.',
    generalCsvFilename: 'yleiset-linkit.csv',
    regionalCsvFilename: 'alueelliset-linkit.csv',
  },
  sv: {
    pageLinks: 'Sidans länkar',
    backHome: 'Tillbaka till startsidan',
    kicker: 'För yrkesverksamma',
    title: 'Länklista',
    intro: 'En sammanställning av webbplatsens allmänna länkar och de regionala service-, nyhets- och RSS-länkar som skapas för varje kommun.',
    searchLabel: 'Sök bland länkarna',
    searchPlaceholder: 'Sök efter namn, webbadress, kategori eller ort',
    downloadGeneral: 'Ladda ned allmänna länkar som CSV',
    downloadRegional: 'Ladda ned regionala länkar som CSV',
    allLinks: 'Alla länkar',
    allLinksSubtitle: 'Allmänna + regionala',
    generalLinks: 'Allmänna länkar',
    regionalLinks: 'Regionala länkar',
    municipalities: 'Kommuner',
    phoneNumbers: 'Telefonnummer',
    views: 'Länklistans vyer',
    byMunicipality: 'Per kommun',
    skipList: 'Hoppa över den valda länklistan',
    regionalIntro: 'Den här vyn innehåller endast ortsspecifika länkar: kommunernas webbplatser, välfärdsområden, bibliotek, kultur- och föreningslänkar, regionala nyheter och nyhetsflöden.',
    municipalitiesHeading: 'Kommuner i alfabetisk ordning',
    pageName: 'Sidans namn',
    url: 'Webbadress',
    category: 'Kategori',
    group: 'Grupp',
    municipality: 'Kommun',
    municipalityWebsite: 'Kommunens webbplats',
    wellbeingArea: 'Välfärdsområde',
    library: 'Bibliotek',
    publicTransport: 'Kollektivtrafik',
    serviceTransport: 'Servicetrafik',
    museums: 'Museer',
    theaters: 'Teatrar',
    patientAssociations: 'Patientföreningar',
    seniorAssociations: 'Pensionärsföreningar',
    regionalNews: 'Regionala nyheter',
    newsFeeds: 'Nyhetsflöden',
    listEnd: 'Slut på länklistan.',
    generalCsvFilename: 'allmanna-lankar.csv',
    regionalCsvFilename: 'regionala-lankar.csv',
  },
  en: {
    pageLinks: 'Page links',
    backHome: 'Back to the home page',
    kicker: 'For professionals',
    title: 'Link list',
    intro: 'A summary of the website’s general links and the regional service, news and RSS links provided for each municipality.',
    searchLabel: 'Search the links',
    searchPlaceholder: 'Search by name, URL, category or municipality',
    downloadGeneral: 'Download general links as CSV',
    downloadRegional: 'Download regional links as CSV',
    allLinks: 'All links',
    allLinksSubtitle: 'General + regional',
    generalLinks: 'General links',
    regionalLinks: 'Regional links',
    municipalities: 'Municipalities',
    phoneNumbers: 'Phone numbers',
    views: 'Link list views',
    byMunicipality: 'By municipality',
    skipList: 'Skip the selected link list',
    regionalIntro: 'This view contains only municipality-related links: municipal websites, wellbeing services counties, libraries, cultural and association links, regional news and news feeds.',
    municipalitiesHeading: 'Municipalities in alphabetical order',
    pageName: 'Page name',
    url: 'URL',
    category: 'Category',
    group: 'Group',
    municipality: 'Municipality',
    municipalityWebsite: 'Municipal website',
    wellbeingArea: 'Wellbeing services county',
    library: 'Library',
    publicTransport: 'Public transport',
    serviceTransport: 'Service transport',
    museums: 'Museums',
    theaters: 'Theatres',
    patientAssociations: 'Patient associations',
    seniorAssociations: 'Pensioner associations',
    regionalNews: 'Regional news',
    newsFeeds: 'News feeds',
    listEnd: 'End of the link list.',
    generalCsvFilename: 'general-links.csv',
    regionalCsvFilename: 'regional-links.csv',
  },
} as const;

const linkValueTranslations: Record<string, Partial<Record<PublicPageLanguage, string>>> = {
  'Kunnan nettisivut': { sv: 'Kommunens webbplats', en: 'Municipal website' },
  'Kirjasto': { sv: 'Bibliotek', en: 'Library' },
  'Palveluliikenne': { sv: 'Servicetrafik', en: 'Service transport' },
  'Uutisvirrat': { sv: 'Nyhetsflöden', en: 'News feeds' },
  'Koko Suomi': { sv: 'Hela Finland', en: 'All Finland' },
};

const localizeLinkValue = (value: string, language: PublicPageLanguage) => (
  linkValueTranslations[value]?.[language]
  ?? translateCategoryName(value, language)
);

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ].join('\n');
  const blob = new Blob([`${csv}\n`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const normalizeSearch = (value: string) => value.toLocaleLowerCase('fi-FI').trim();

const getRegionalLinkSearchText = (link: RegionalLinkRow, language: PublicPageLanguage) => (
  `${link.category} ${localizeLinkValue(link.category, language)} ${link.name} ${link.url}`
);

const LinkList = ({ links }: { links: RegionalLinkRow[] }) => (
  <ul className="space-y-2">
    {links.map((link) => (
      <li key={`${link.category}|${link.name}|${link.url}`} className="leading-snug">
        <a className="inline-flex min-h-8 items-center break-words font-black text-[var(--theme-primary)] hover:underline focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" href={link.url} target="_blank" rel="noopener noreferrer">
          {link.name}
        </a>
        <span className="block break-all text-xs font-bold text-[var(--theme-text-3)]">{link.url}</span>
      </li>
    ))}
  </ul>
);

function App() {
  useEffect(() => installUsageTracking('linkit'), []);

  const language = usePublicPageLanguage();
  const copy = linkListTranslations[language];

  const [query, setQuery] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('regional');
  const municipalityTopScrollRef = useRef<HTMLDivElement>(null);
  const municipalityTableScrollRef = useRef<HTMLDivElement>(null);
  const search = normalizeSearch(query);

  const filteredGeneralLinks = useMemo(() => generalLinks.filter((row) => (
    !search || `${row.name} ${row.url} ${row.category} ${localizeLinkValue(row.category, language)} ${row.group} ${localizeLinkValue(row.group, language)}`.toLocaleLowerCase('fi-FI').includes(search)
  )), [language, search]);

  const filteredRegionalLinks = useMemo(() => regionalLinks.filter((row) => (
    !search || `${row.municipality} ${row.category} ${localizeLinkValue(row.category, language)} ${row.name} ${row.url}`.toLocaleLowerCase('fi-FI').includes(search)
  )), [language, search]);

  const filteredMunicipalityRows = useMemo(() => municipalityRows.filter((row) => (
    !search || [
      row.municipality,
      ...row.municipalityWebsites.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.wellbeingAreas.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.libraries.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.publicTransport.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.serviceTransport.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.museums.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.theaters.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.patientAssociations.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.seniorAssociations.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.regionalNews.map((link) => getRegionalLinkSearchText(link, language)),
      ...row.rssFeeds.map((link) => getRegionalLinkSearchText(link, language)),
    ].join(' ').toLocaleLowerCase('fi-FI').includes(search)
  )), [language, search]);

  const municipalityColumnCounts = useMemo(() => ({
    municipalityWebsites: filteredMunicipalityRows.reduce((sum, row) => sum + row.municipalityWebsites.length, 0),
    wellbeingAreas: filteredMunicipalityRows.reduce((sum, row) => sum + row.wellbeingAreas.length, 0),
    libraries: filteredMunicipalityRows.reduce((sum, row) => sum + row.libraries.length, 0),
    publicTransport: filteredMunicipalityRows.reduce((sum, row) => sum + row.publicTransport.length, 0),
    serviceTransport: filteredMunicipalityRows.reduce((sum, row) => sum + row.serviceTransport.length, 0),
    museums: filteredMunicipalityRows.reduce((sum, row) => sum + row.museums.length, 0),
    theaters: filteredMunicipalityRows.reduce((sum, row) => sum + row.theaters.length, 0),
    patientAssociations: filteredMunicipalityRows.reduce((sum, row) => sum + row.patientAssociations.length, 0),
    seniorAssociations: filteredMunicipalityRows.reduce((sum, row) => sum + row.seniorAssociations.length, 0),
    regionalNews: filteredMunicipalityRows.reduce((sum, row) => sum + row.regionalNews.length, 0),
    rssFeeds: filteredMunicipalityRows.reduce((sum, row) => sum + row.rssFeeds.length, 0),
  }), [filteredMunicipalityRows]);

  const tabs: { id: ActiveView; label: string; count: number }[] = [
    { id: 'regional', label: copy.regionalLinks, count: filteredRegionalLinks.length },
    { id: 'municipalities', label: copy.byMunicipality, count: filteredMunicipalityRows.length },
    { id: 'general', label: copy.generalLinks, count: filteredGeneralLinks.length },
  ];

  const syncMunicipalityTopScroll = () => {
    if (!municipalityTopScrollRef.current || !municipalityTableScrollRef.current) return;
    municipalityTableScrollRef.current.scrollLeft = municipalityTopScrollRef.current.scrollLeft;
  };

  const syncMunicipalityTableScroll = () => {
    if (!municipalityTopScrollRef.current || !municipalityTableScrollRef.current) return;
    municipalityTopScrollRef.current.scrollLeft = municipalityTableScrollRef.current.scrollLeft;
  };

  return (
    <main className="aurora-page">
      <div className="mx-auto max-w-[1800px] px-4 py-8 md:px-8 md:py-12 space-y-10">
        <header className="aurora-subpage-hero space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav aria-label={copy.pageLinks}>
              <a href="./index.html" className={pageNavLinkClass}>
                {copy.backHome}
              </a>
            </nav>
            <PublicPageLanguageSwitcher page="linkit" language={language} />
          </div>
          <div className="space-y-3">
            <span className="aurora-kicker">
              {copy.kicker}
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{copy.title}</h1>
            <p className="max-w-4xl text-base font-semibold text-white/75 md:text-lg">
              {copy.intro}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_auto]">
            <label className="block">
              <span className="sr-only">{copy.searchLabel}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="aurora-input w-full rounded-xl px-4 py-3 font-bold shadow-sm"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadCsv(
                  copy.generalCsvFilename,
                  [copy.pageName, copy.url, copy.category, copy.group],
                  generalLinks.map((row) => [row.name, row.url, localizeLinkValue(row.category, language), localizeLinkValue(row.group, language)])
                )}
                className="rounded-xl bg-[var(--theme-gold)] px-4 py-3 font-black text-[var(--theme-cta-label)] shadow-sm hover:bg-[var(--theme-gold-light)]"
              >
                {copy.downloadGeneral}
              </button>
              <button
                type="button"
                onClick={() => downloadCsv(
                  copy.regionalCsvFilename,
                  [copy.municipality, copy.category, copy.pageName, copy.url],
                  regionalLinks.map((row) => [row.municipality, localizeLinkValue(row.category, language), row.name, row.url])
                )}
                className="rounded-xl bg-[var(--theme-primary)] px-4 py-3 font-black text-white shadow-sm hover:bg-[var(--theme-primary-mid)]"
              >
                {copy.downloadRegional}
              </button>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-white/65">{copy.allLinks}</dt>
              <dd className="text-3xl font-black text-white">{allLinkCount}</dd>
              <dd className="mt-1 text-xs font-bold text-white/55">{copy.allLinksSubtitle}</dd>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-white/65">{copy.generalLinks}</dt>
              <dd className="text-3xl font-black text-white">{generalLinks.length}</dd>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-white/65">{copy.regionalLinks}</dt>
              <dd className="text-3xl font-black text-white">{regionalLinks.length}</dd>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-white/65">{copy.municipalities}</dt>
              <dd className="text-3xl font-black text-white">{municipalityRows.length}</dd>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-white/65">{copy.phoneNumbers}</dt>
              <dd className="text-3xl font-black text-white">{phoneLinkCount}</dd>
            </div>
          </dl>
          <nav className="flex flex-wrap gap-2 rounded-xl border border-white/15 bg-white/10 p-2 shadow-sm" aria-label={copy.views}>
            {tabs.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`${isActive ? 'bg-[var(--theme-gold)] text-[var(--theme-header-bg)] shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'} rounded-lg px-4 py-3 text-sm font-black transition-colors`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                  <span className={`${isActive ? 'bg-black/10 text-[var(--theme-header-bg)]' : 'bg-white/15 text-white'} ml-2 rounded-full px-2 py-0.5 text-xs`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
          <a
            href="#link-list-after"
            className="inline-flex min-h-12 items-center rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            {copy.skipList}
          </a>
        </header>

        {activeView === 'general' && (
        <section id="general-links" className="space-y-4" aria-labelledby="general-links-heading">
          <h2 id="general-links-heading" className="aurora-section-title text-2xl md:text-3xl">{copy.generalLinks}</h2>
          <div className="overflow-x-auto rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm">
            <table className="min-w-full divide-y divide-[var(--theme-border)] text-sm text-[var(--theme-text)]">
              <thead className="bg-[var(--theme-pale)] text-left text-xs font-black uppercase tracking-wide text-[var(--theme-muted)]">
                <tr>
                  <th className="px-4 py-3">{copy.pageName}</th>
                  <th className="px-4 py-3">{copy.url}</th>
                  <th className="px-4 py-3">{copy.category}</th>
                  <th className="px-4 py-3">{copy.group}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border)]">
                {filteredGeneralLinks.map((row) => (
                  <tr key={`${row.category}|${row.group}|${row.name}|${row.url}`}>
                    <td className="px-4 py-3 font-black">{row.name}</td>
                    <td className="px-4 py-3">
                      <a className="inline-flex min-h-8 items-center break-all text-[var(--theme-primary)] hover:underline focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" href={row.url} target="_blank" rel="noopener noreferrer">{row.url}</a>
                    </td>
                    <td className="px-4 py-3 font-bold">{localizeLinkValue(row.category, language)}</td>
                    <td className="px-4 py-3 text-[var(--theme-muted)]">{row.group ? localizeLinkValue(row.group, language) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {activeView === 'regional' && (
        <section id="regional-links" className="space-y-4" aria-labelledby="regional-links-heading">
          <h2 id="regional-links-heading" className="aurora-section-title text-2xl md:text-3xl">{copy.regionalLinks}</h2>
          <p className="max-w-4xl text-sm font-bold text-[var(--theme-text-2)]">
            {copy.regionalIntro}
          </p>
          <div className="overflow-x-auto rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm">
            <table className="min-w-full divide-y divide-[var(--theme-border)] text-sm text-[var(--theme-text)]">
              <thead className="bg-[var(--theme-pale)] text-left text-xs font-black uppercase tracking-wide text-[var(--theme-muted)]">
                <tr>
                  <th className="px-4 py-3">{copy.municipality}</th>
                  <th className="px-4 py-3">{copy.category}</th>
                  <th className="px-4 py-3">{copy.pageName}</th>
                  <th className="px-4 py-3">{copy.url}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border)]">
                {filteredRegionalLinks.map((row) => (
                  <tr key={`${row.municipality}|${row.category}|${row.name}|${row.url}`}>
                    <td className="px-4 py-3 font-black">{row.municipality}</td>
                    <td className="px-4 py-3 font-bold">{localizeLinkValue(row.category, language)}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">
                      <a className="inline-flex min-h-8 items-center break-all text-[var(--theme-primary)] hover:underline focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" href={row.url} target="_blank" rel="noopener noreferrer">{row.url}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {activeView === 'municipalities' && (
        <section id="municipality-links" className="space-y-4" aria-labelledby="municipality-links-heading">
          <h2 id="municipality-links-heading" className="aurora-section-title text-2xl md:text-3xl">{copy.municipalitiesHeading}</h2>
          <div className="sticky top-0 z-30 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2 shadow-sm">
            <div
              ref={municipalityTopScrollRef}
              onScroll={syncMunicipalityTopScroll}
              className="overflow-x-auto"
              aria-hidden="true"
            >
              <div className="h-3" style={{ width: municipalityTableMinWidth }} />
            </div>
          </div>
          <div
            ref={municipalityTableScrollRef}
            onScroll={syncMunicipalityTableScroll}
            className="overflow-x-auto rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm"
          >
            <table className="min-w-full divide-y divide-[var(--theme-border)] text-sm align-top text-[var(--theme-text)]" style={{ minWidth: municipalityTableMinWidth }}>
              <thead className="bg-[var(--theme-pale)] text-left text-xs font-black uppercase tracking-wide text-[var(--theme-muted)]">
                <tr>
                  <th className="sticky left-0 z-20 w-44 bg-[var(--theme-pale)] px-4 py-3 shadow-[6px_0_12px_rgba(15,23,42,0.08)]">{copy.municipality}</th>
                  <th className="min-w-80 px-4 py-3">{copy.municipalityWebsite} ({municipalityColumnCounts.municipalityWebsites})</th>
                  <th className="min-w-80 px-4 py-3">{copy.wellbeingArea} ({municipalityColumnCounts.wellbeingAreas})</th>
                  <th className="min-w-80 px-4 py-3">{copy.library} ({municipalityColumnCounts.libraries})</th>
                  <th className="min-w-80 px-4 py-3">{copy.publicTransport} ({municipalityColumnCounts.publicTransport})</th>
                  <th className="min-w-80 px-4 py-3">{copy.serviceTransport} ({municipalityColumnCounts.serviceTransport})</th>
                  <th className="min-w-80 px-4 py-3">{copy.museums} ({municipalityColumnCounts.museums})</th>
                  <th className="min-w-80 px-4 py-3">{copy.theaters} ({municipalityColumnCounts.theaters})</th>
                  <th className="min-w-80 px-4 py-3">{copy.patientAssociations} ({municipalityColumnCounts.patientAssociations})</th>
                  <th className="min-w-80 px-4 py-3">{copy.seniorAssociations} ({municipalityColumnCounts.seniorAssociations})</th>
                  <th className="min-w-80 px-4 py-3">{copy.regionalNews} ({municipalityColumnCounts.regionalNews})</th>
                  <th className="min-w-80 px-4 py-3">{copy.newsFeeds} ({municipalityColumnCounts.rssFeeds})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border)]">
                {filteredMunicipalityRows.map((row) => (
                  <tr key={row.municipality}>
                    <td className="sticky left-0 z-10 bg-[var(--theme-surface)] px-4 py-4 text-base font-black shadow-[6px_0_12px_rgba(15,23,42,0.06)]">{row.municipality}</td>
                    <td className="px-4 py-4"><LinkList links={row.municipalityWebsites} /></td>
                    <td className="px-4 py-4"><LinkList links={row.wellbeingAreas} /></td>
                    <td className="px-4 py-4"><LinkList links={row.libraries} /></td>
                    <td className="px-4 py-4"><LinkList links={row.publicTransport} /></td>
                    <td className="px-4 py-4"><LinkList links={row.serviceTransport} /></td>
                    <td className="px-4 py-4"><LinkList links={row.museums} /></td>
                    <td className="px-4 py-4"><LinkList links={row.theaters} /></td>
                    <td className="px-4 py-4"><LinkList links={row.patientAssociations} /></td>
                    <td className="px-4 py-4"><LinkList links={row.seniorAssociations} /></td>
                    <td className="px-4 py-4"><LinkList links={row.regionalNews} /></td>
                    <td className="px-4 py-4"><LinkList links={row.rssFeeds} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}
        <div id="link-list-after" tabIndex={-1} className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-sm font-bold text-[var(--theme-muted)]">
          {copy.listEnd}
        </div>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
