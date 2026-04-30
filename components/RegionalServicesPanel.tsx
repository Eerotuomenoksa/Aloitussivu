import React, { useMemo, useState } from 'react';
import { getRegionalFaithProviders, getRegionalNewsProviders, getRegionalProviders, getRegionalRssFeeds, resolveRegionalContext } from '../localServices';
import { filterVisibleProviders, isLinkVisible, useLinkVisibilityVersion } from '../linkVisibility';
import { LocalityInfo, Provider, LinkReportDraft } from '../types';
import LocalNewsHeadlines from './LocalNewsHeadlines';
import NearbyGuidancePlaces from './NearbyGuidancePlaces';
import { hideLocalLink, filterVisibleLocalProviders, useLocalLinkVisibilityVersion } from '../localLinkVisibility';

interface RegionalServicesPanelProps {
  locality: LocalityInfo | null;
  fontSizeStep?: number;
  onReportLink?: (draft: LinkReportDraft) => void;
}

const textClasses = [
  'text-base md:text-lg',
  'text-lg md:text-xl',
  'text-xl md:text-2xl',
  'text-2xl md:text-3xl',
  'text-3xl md:text-4xl',
];

const smallTextClasses = [
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
];

const ServiceLink: React.FC<{ provider: Provider; index: number; fontSizeStep: number; onReportLink?: (draft: LinkReportDraft) => void }> = ({ provider, index, fontSizeStep, onReportLink }) => {
  const colors = [
    'bg-brand-indigo hover:bg-indigo-700',
    'bg-brand-teal hover:bg-teal-700',
    'bg-brand-cyan hover:bg-cyan-700',
    'bg-brand-purple hover:bg-purple-700',
    'bg-brand-orange hover:bg-orange-700',
  ];

  return (
    <div className="relative group/service">
      <a
        href={provider.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${colors[index % colors.length]} text-white rounded-2xl p-5 md:p-6 shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 min-h-[120px] flex flex-col justify-between gap-4`}
      >
        <span className={`font-black leading-tight ${textClasses[fontSizeStep]}`}>{provider.name}</span>
        {provider.group && <span className={`font-bold opacity-80 ${smallTextClasses[fontSizeStep]}`}>{provider.group}</span>}
      </a>
      {onReportLink && (
        <button
          onClick={() => onReportLink({
            name: provider.name,
            url: provider.url,
            category: provider.group,
            source: 'RegionalServicesPanel',
          })}
          className="absolute top-3 left-3 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white shadow-md transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none opacity-0 group-hover/service:opacity-100 w-10 h-10 text-xl"
          aria-label={`Ilmoita linkki: ${provider.name}`}
        >
          !
        </button>
      )}
    </div>
  );
};

const FaithLink: React.FC<{ provider: Provider; index: number; fontSizeStep: number; onHideLink?: (url: string) => void }> = ({ provider, index, fontSizeStep, onHideLink }) => {
  const colors = [
    'bg-amber-600 hover:bg-amber-700',
    'bg-rose-600 hover:bg-rose-700',
    'bg-fuchsia-600 hover:bg-fuchsia-700',
    'bg-emerald-600 hover:bg-emerald-700',
  ];

  return (
    <div className="relative group/faith">
      <a
        href={provider.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${colors[index % colors.length]} text-white rounded-2xl p-5 md:p-6 shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-300 min-h-[104px] flex flex-col justify-between gap-3`}
      >
        <span className={`font-black leading-tight ${textClasses[fontSizeStep]}`}>{provider.name}</span>
        {provider.group && <span className={`font-bold opacity-80 ${smallTextClasses[fontSizeStep]}`}>{provider.group}</span>}
      </a>
      {onHideLink && (
        <button
          onClick={() => onHideLink(provider.url)}
          className="absolute top-3 left-3 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white shadow-md transition-all focus:ring-4 focus:ring-amber-300 focus:outline-none opacity-100 sm:opacity-0 sm:group-hover/faith:opacity-100 w-10 h-10 text-2xl"
          aria-label={`Piilota näkyvistä: ${provider.name}`}
          title="Piilota näkyvistä"
        >
          ×
        </button>
      )}
    </div>
  );
};

const RegionalServicesPanel: React.FC<RegionalServicesPanelProps> = ({ locality, fontSizeStep = 0, onReportLink }) => {
  useLinkVisibilityVersion();
  const localLinkVisibilityVersion = useLocalLinkVisibilityVersion();
  const [query, setQuery] = useState('');
  const context = useMemo(() => resolveRegionalContext(query, locality), [query, locality]);
  const services = useMemo(() => context ? filterVisibleProviders(getRegionalProviders(context)) ?? [] : [], [context]);
  const newsFallbacks = useMemo(() => context ? filterVisibleProviders(getRegionalNewsProviders(context)) ?? [] : [], [context]);
  const rssFeeds = useMemo(() => context ? getRegionalRssFeeds(context) : [], [context]);
  const faithProviders = useMemo(() => context ? getRegionalFaithProviders(context) : [], [context]);
  const visibleFaithProviders = useMemo(
    () => filterVisibleLocalProviders(faithProviders) ?? [],
    [faithProviders, localLinkVisibilityVersion]
  );
  const fallbackNewsUrl = newsFallbacks[0]?.url ?? (isLinkVisible('https://news.google.com/home?hl=fi&gl=FI&ceid=FI:fi') ? 'https://news.google.com/home?hl=fi&gl=FI&ceid=FI:fi' : '');

  return (
    <section className="space-y-6" aria-labelledby="regional-services-heading">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div className="space-y-2">
          <h2 id="regional-services-heading" className="font-black text-slate-900 dark:text-white text-3xl md:text-5xl leading-tight">
            Alueelliset palvelut
          </h2>
          <p className={`text-slate-600 dark:text-slate-300 font-bold max-w-4xl ${smallTextClasses[fontSizeStep]}`}>
            Tunnistaa Tilastokeskuksen vuoden 2026 kuntaluokituksen kaikki 308 kuntaa ja nostaa esiin kunnan palvelut, hyvinvointialueen sekä paikallisia uutisotsikoita RSS-syötteistä.
          </p>
        </div>
        <div className="w-full xl:max-w-3xl">
          {onReportLink && (
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => onReportLink({ name: '', url: '', category: 'Alueelliset palvelut', source: 'RegionalServicesPanel' })}
                className={`font-black text-brand-indigo dark:text-blue-300 hover:underline ${smallTextClasses[fontSizeStep]}`}
              >
                Ilmoita uusi linkki
              </button>
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <label className="flex-1">
              <span className={`block font-black text-slate-700 dark:text-slate-200 mb-2 ${smallTextClasses[fontSizeStep]}`}>Kunta</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={locality?.municipality ? `Sijainti: ${locality.municipality}` : 'Kirjoita kunta, esim. Lahti'}
                className={`w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-4 font-bold focus:outline-none focus:border-brand-indigo focus:ring-4 focus:ring-brand-indigo/20 ${textClasses[fontSizeStep]}`}
                aria-label="Hae kuntaa"
              />
            </label>
            {context && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 px-5 py-4 shadow-sm md:min-w-[12rem]">
                <p className={`font-black text-slate-900 dark:text-white leading-tight ${textClasses[fontSizeStep]}`}>
                  {context.municipality.name}
                </p>
              </div>
            )}
          </div>
          <p className={`mt-2 text-slate-500 dark:text-slate-400 font-bold ${smallTextClasses[fontSizeStep]}`}>
            Voit vaihtaa kuntaa kirjoittamalla uuden kunnan nimen.
          </p>
        </div>
      </div>

      {context ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
            {services.map((provider, index) => <ServiceLink key={provider.url} provider={provider} index={index} fontSizeStep={fontSizeStep} onReportLink={onReportLink} />)}
          </div>

          {visibleFaithProviders.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${smallTextClasses[fontSizeStep]}`}>
                  Seurakunnat
                </h3>
                <p className={`text-slate-500 dark:text-slate-400 ${smallTextClasses[fontSizeStep]}`}>
                  Piilotus jää tähän selaimeen.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                {visibleFaithProviders.map((provider, index) => (
                  <FaithLink
                    key={provider.url}
                    provider={provider}
                    index={index}
                    fontSizeStep={fontSizeStep}
                    onHideLink={hideLocalLink}
                  />
                ))}
              </div>
            </div>
          )}

          <NearbyGuidancePlaces locality={locality} fontSizeStep={fontSizeStep} />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${smallTextClasses[fontSizeStep]}`}>
                Paikalliset uutiset
              </h3>
              {fallbackNewsUrl && (
                <a
                  href={fallbackNewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-black text-brand-indigo dark:text-blue-300 hover:underline ${smallTextClasses[fontSizeStep]}`}
                >
                  Lisää uutisia
                </a>
              )}
            </div>
            <LocalNewsHeadlines feeds={rssFeeds} fallbackUrl={fallbackNewsUrl} fontSizeStep={fontSizeStep} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className={`font-black text-slate-500 dark:text-slate-400 ${textClasses[fontSizeStep]}`}>
            Kirjoita kunnan nimi nähdäksesi alueelliset palvelut.
          </p>
        </div>
      )}
    </section>
  );
};

export default RegionalServicesPanel;

