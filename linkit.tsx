import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SHORTCUTS } from './constants';
import { MUNICIPALITIES } from './municipalRegistry';
import { getRegionalNewsProviders, getRegionalProviders, getRegionalPublicTransportProviders, getRegionalRssFeeds } from './localServices';
import { Provider } from './types';

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
  localServices: RegionalLinkRow[];
  publicTransport: RegionalLinkRow[];
  regionalNews: RegionalLinkRow[];
  rssFeeds: RegionalLinkRow[];
}

type ActiveView = 'general' | 'regional' | 'municipalities';

const collator = new Intl.Collator('fi-FI');

const uniqueByKey = <T,>(items: T[], getKey: (item: T) => string) => [
  ...new Map(items.map((item) => [getKey(item), item])).values(),
];

const providerToRegionalRow = (
  municipality: string,
  category: string,
  provider: Provider
): RegionalLinkRow => ({
  municipality,
  category: provider.group || category,
  name: provider.name,
  url: provider.url,
});

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

const municipalityRows: MunicipalityLinkRow[] = MUNICIPALITIES
  .map((municipality) => {
    const context = { municipality, displayName: municipality.name };
    const publicTransport = getRegionalPublicTransportProviders(context).map((provider) => (
      providerToRegionalRow(municipality.name, 'Julkinen liikenne', provider)
    ));
    const publicTransportUrls = new Set(publicTransport.map((row) => row.url));
    const localServices = getRegionalProviders(context)
      .filter((provider) => !publicTransportUrls.has(provider.url))
      .map((provider) => (
      providerToRegionalRow(municipality.name, 'Paikalliset palvelut', provider)
    ));
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
      localServices: uniqueByKey(localServices, (row) => `${row.category}|${row.name}|${row.url}`),
      publicTransport: uniqueByKey(publicTransport, (row) => `${row.category}|${row.name}|${row.url}`),
      regionalNews: uniqueByKey(regionalNews, (row) => `${row.category}|${row.name}|${row.url}`),
      rssFeeds: uniqueByKey(rssFeeds, (row) => `${row.category}|${row.name}|${row.url}`),
    };
  })
  .sort((a, b) => collator.compare(a.municipality, b.municipality));

const regionalLinks = uniqueByKey(
  municipalityRows.flatMap((row) => [...row.localServices, ...row.publicTransport, ...row.regionalNews, ...row.rssFeeds]),
  (row) => `${row.municipality}|${row.category}|${row.name}|${row.url}`
).sort((a, b) => collator.compare(`${a.municipality} ${a.category} ${a.name}`, `${b.municipality} ${b.category} ${b.name}`));

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

const LinkList = ({ links }: { links: RegionalLinkRow[] }) => (
  <ul className="space-y-2">
    {links.map((link) => (
      <li key={`${link.category}|${link.name}|${link.url}`} className="leading-snug">
        <a className="font-black text-indigo-700 hover:underline break-words" href={link.url} target="_blank" rel="noopener noreferrer">
          {link.name}
        </a>
        <span className="block text-xs font-bold text-slate-500 break-all">{link.url}</span>
      </li>
    ))}
  </ul>
);

function App() {
  const [query, setQuery] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('regional');
  const search = normalizeSearch(query);

  const filteredGeneralLinks = useMemo(() => generalLinks.filter((row) => (
    !search || `${row.name} ${row.url} ${row.category} ${row.group}`.toLocaleLowerCase('fi-FI').includes(search)
  )), [search]);

  const filteredRegionalLinks = useMemo(() => regionalLinks.filter((row) => (
    !search || `${row.municipality} ${row.category} ${row.name} ${row.url}`.toLocaleLowerCase('fi-FI').includes(search)
  )), [search]);

  const filteredMunicipalityRows = useMemo(() => municipalityRows.filter((row) => (
    !search || [
      row.municipality,
      ...row.localServices.map((link) => `${link.category} ${link.name} ${link.url}`),
      ...row.publicTransport.map((link) => `${link.category} ${link.name} ${link.url}`),
      ...row.regionalNews.map((link) => `${link.category} ${link.name} ${link.url}`),
      ...row.rssFeeds.map((link) => `${link.category} ${link.name} ${link.url}`),
    ].join(' ').toLocaleLowerCase('fi-FI').includes(search)
  )), [search]);

  const tabs: { id: ActiveView; label: string; count: number }[] = [
    { id: 'regional', label: 'Alueelliset linkit', count: filteredRegionalLinks.length },
    { id: 'municipalities', label: 'Paikkakunnittain', count: filteredMunicipalityRows.length },
    { id: 'general', label: 'Yleiset linkit', count: filteredGeneralLinks.length },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1800px] px-4 py-8 md:px-8 md:py-12 space-y-10">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a href="./index.html" className="text-sm font-black text-indigo-700 hover:underline">
              Takaisin aloitussivulle
            </a>
            <a href="./muutosloki.html" className="text-sm font-black text-indigo-700 hover:underline">
              Muutosloki
            </a>
          </div>
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-black uppercase tracking-wide">
              Ammattilaisille
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Linkkiluettelo</h1>
            <p className="max-w-4xl text-base md:text-lg text-slate-600">
              Koonti sivuston yleisistä linkeistä sekä jokaiselle kunnalle muodostuvista alueellisista palvelu-, uutis- ja RSS-linkeistä.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_auto]">
            <label className="block">
              <span className="sr-only">Hae linkeistä</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Hae nimellä, URLilla, kategorialla tai paikkakunnalla"
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadCsv(
                  'yleiset-linkit.csv',
                  ['Sivun nimi', 'URL', 'Kategoria', 'Ryhmä'],
                  generalLinks.map((row) => [row.name, row.url, row.category, row.group])
                )}
                className="rounded-xl bg-indigo-600 px-4 py-3 font-black text-white shadow-sm hover:bg-indigo-700"
              >
                Lataa yleiset CSV
              </button>
              <button
                type="button"
                onClick={() => downloadCsv(
                  'alueelliset-linkit.csv',
                  ['Paikkakunta', 'Kategoria', 'Sivun nimi', 'URL'],
                  regionalLinks.map((row) => [row.municipality, row.category, row.name, row.url])
                )}
                className="rounded-xl bg-slate-900 px-4 py-3 font-black text-white shadow-sm hover:bg-slate-800"
              >
                Lataa alueelliset CSV
              </button>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-slate-500">Yleiset linkit</dt>
              <dd className="text-3xl font-black">{generalLinks.length}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-slate-500">Alueelliset linkit</dt>
              <dd className="text-3xl font-black">{regionalLinks.length}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-sm font-black uppercase tracking-wide text-slate-500">Paikkakunnat</dt>
              <dd className="text-3xl font-black">{municipalityRows.length}</dd>
            </div>
          </dl>
          <nav className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Linkkiluettelon näkymät">
            {tabs.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'} rounded-lg px-4 py-3 text-sm font-black transition-colors`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                  <span className={`${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'} ml-2 rounded-full px-2 py-0.5 text-xs`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </header>

        {activeView === 'general' && (
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black">Yleiset linkit</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Sivun nimi</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Kategoria</th>
                  <th className="px-4 py-3">Ryhmä</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGeneralLinks.map((row) => (
                  <tr key={`${row.category}|${row.group}|${row.name}|${row.url}`}>
                    <td className="px-4 py-3 font-black">{row.name}</td>
                    <td className="px-4 py-3">
                      <a className="text-indigo-700 hover:underline break-all" href={row.url} target="_blank" rel="noopener noreferrer">{row.url}</a>
                    </td>
                    <td className="px-4 py-3 font-bold">{row.category}</td>
                    <td className="px-4 py-3 text-slate-600">{row.group || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {activeView === 'regional' && (
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black">Alueelliset linkit</h2>
          <p className="max-w-4xl text-sm font-bold text-slate-600">
            Tässä näkymässä ovat vain paikkakuntiin liittyvät linkit: paikalliset palvelut, hyvinvointialueet, alueelliset uutiset ja uutisvirrat.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Paikkakunta</th>
                  <th className="px-4 py-3">Kategoria</th>
                  <th className="px-4 py-3">Sivun nimi</th>
                  <th className="px-4 py-3">URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegionalLinks.map((row) => (
                  <tr key={`${row.municipality}|${row.category}|${row.name}|${row.url}`}>
                    <td className="px-4 py-3 font-black">{row.municipality}</td>
                    <td className="px-4 py-3 font-bold">{row.category}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">
                      <a className="text-indigo-700 hover:underline break-all" href={row.url} target="_blank" rel="noopener noreferrer">{row.url}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {activeView === 'municipalities' && (
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black">Paikkakunnat aakkosjärjestyksessä</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm align-top">
              <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-44 px-4 py-3">Paikkakunta</th>
                  <th className="min-w-80 px-4 py-3">Paikalliset palvelut</th>
                  <th className="min-w-80 px-4 py-3">Julkinen liikenne</th>
                  <th className="min-w-80 px-4 py-3">Alueelliset uutiset</th>
                  <th className="min-w-80 px-4 py-3">Uutisvirrat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMunicipalityRows.map((row) => (
                  <tr key={row.municipality}>
                    <td className="px-4 py-4 text-base font-black">{row.municipality}</td>
                    <td className="px-4 py-4"><LinkList links={row.localServices} /></td>
                    <td className="px-4 py-4"><LinkList links={row.publicTransport} /></td>
                    <td className="px-4 py-4"><LinkList links={row.regionalNews} /></td>
                    <td className="px-4 py-4"><LinkList links={row.rssFeeds} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
