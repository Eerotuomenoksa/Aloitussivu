import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getLocalizedMunicipalityName, getRegionalLibraryProviders, getRegionalNewsProviders, getRegionalProviders, getRegionalRssFeeds, resolveRegionalContext } from '../localServices';
import { filterVisibleProviders } from '../linkVisibility';
import { LocalityInfo, Provider, LinkReportDraft } from '../types';
import LocalNewsHeadlines from './LocalNewsHeadlines';
import ScamAlertsBanner from './ScamAlertsBanner';
import { useI18n } from '../i18n';

interface RegionalServicesPanelProps {
  locality: LocalityInfo | null;
  fontSizeStep?: number;
  onReportLink?: (draft: LinkReportDraft) => void;
  showNews?: boolean;
  showScamAlerts?: boolean;
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

const getRegionalServiceIcon = (provider: Provider) => {
  const text = `${provider.group ?? ''} ${provider.name}`.toLocaleLowerCase('fi-FI');
  if (text.includes('liikenne') || text.includes('reitti') || text.includes('hsl') || text.includes('nysse') || text.includes('föli')) return '🚌';
  if (text.includes('kirjasto') || text.includes('finna') || text.includes('helmet')) return '📚';
  if (text.includes('hyvinvointialue') || text.includes('sote') || text.includes('terveys')) return '🏥';
  if (text.includes('paikalliset palvelut') || text.includes('palvelut') || text.includes('kunta') || text.includes('kaupunki')) return '🏛️';
  return '📍';
};

const uniqueProvidersByUrl = (providers: Provider[]) => providers.filter(
  (provider, index, all) => all.findIndex((item) => item.url === provider.url) === index
);

const ServiceLink: React.FC<{ provider: Provider; index: number; fontSizeStep: number; onReportLink?: (draft: LinkReportDraft) => void }> = ({ provider, index, fontSizeStep, onReportLink }) => {
  const { t, categoryName } = useI18n();
  const icon = getRegionalServiceIcon(provider);
  const colors = [
    'bg-[#dceff4] hover:bg-[#cce7ee] dark:bg-[#173e5f] dark:hover:bg-[#214f76]',
    'bg-[#d8f0ee] hover:bg-[#c8e7e4] dark:bg-[#1d5c62] dark:hover:bg-[#23727a]',
    'bg-[#f8e2af] hover:bg-[#f3d48d] dark:bg-[#73501e] dark:hover:bg-[#8c6225]',
  ];

  return (
    <div className="relative group/service">
      <a
        href={provider.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${colors[index % colors.length]} text-slate-950 dark:text-white rounded-2xl p-5 md:p-6 shadow-md border-4 border-slate-900/10 dark:border-white/10 transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 min-h-[120px] flex flex-col justify-between gap-4`}
      >
        <span className="flex items-start gap-3">
          <span className="shrink-0 text-3xl leading-none md:text-4xl" aria-hidden="true">{icon}</span>
          <span className={`min-w-0 font-black leading-tight ${textClasses[fontSizeStep]}`}>{provider.name}</span>
        </span>
        {provider.group && <span className={`font-bold opacity-80 ${smallTextClasses[fontSizeStep]}`}>{categoryName(provider.group)}</span>}
      </a>
      {onReportLink && (
        <button
          onClick={() => onReportLink({
            name: provider.name,
            url: provider.url,
            category: provider.group,
            source: 'RegionalServicesPanel',
          })}
          className="absolute bottom-3 right-3 flex items-center justify-center rounded-full bg-white/70 hover:bg-white text-slate-950 shadow-md transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none opacity-0 group-hover/service:opacity-100 focus:opacity-100 w-10 h-10 text-xl"
          aria-label={`${t('reportLink')}: ${provider.name}`}
        >
          !
        </button>
      )}
    </div>
  );
};

const RegionalServicesPanel: React.FC<RegionalServicesPanelProps> = ({ locality, fontSizeStep = 0, onReportLink, showNews = true, showScamAlerts = true }) => {
  const { language, t } = useI18n();
  const [query, setQuery] = useState('');
  const [isManualQuery, setIsManualQuery] = useState(false);
  const municipalityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!locality?.municipality || isManualQuery) return;
    setQuery(locality.municipality);
  }, [isManualQuery, locality?.municipality]);

  const context = useMemo(() => resolveRegionalContext(query, locality), [query, locality]);
  const services = useMemo(() => context ? filterVisibleProviders(uniqueProvidersByUrl([
    ...getRegionalProviders(context, language),
    ...getRegionalLibraryProviders(context),
  ])) ?? [] : [], [context, language]);
  const newsFallbacks = useMemo(() => context ? filterVisibleProviders(getRegionalNewsProviders(context)) ?? [] : [], [context]);
  const rssFeeds = useMemo(() => context ? getRegionalRssFeeds(context) : [], [context]);
  const fallbackNewsUrl = newsFallbacks[0]?.url ?? '';
  const localizedMunicipalityName = context ? getLocalizedMunicipalityName(context.municipality, language) : '';
  const detectedMunicipalityName = locality?.municipality ? getLocalizedMunicipalityName(locality.municipality, language) : '';
  const displayedQuery = !isManualQuery && localizedMunicipalityName ? localizedMunicipalityName : query;
  const focusMunicipalityInput = () => {
    setIsManualQuery(true);
    window.requestAnimationFrame(() => {
      municipalityInputRef.current?.focus();
      municipalityInputRef.current?.select();
    });
  };

  return (
    <section className="space-y-6" aria-labelledby="regional-services-heading">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <h2 id="regional-services-heading" className="font-black text-slate-900 dark:text-white text-3xl md:text-5xl leading-tight">
            {t('regionalServicesTitle')}
          </h2>
        </div>
        <div className="w-full xl:max-w-2xl">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="flex-1">
              <span className={`block font-black text-slate-700 dark:text-slate-200 mb-1 ${smallTextClasses[fontSizeStep]}`}>{t('municipality')}</span>
              <input
                ref={municipalityInputRef}
                type="search"
                value={displayedQuery}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setQuery(nextQuery);
                  setIsManualQuery(nextQuery.trim().length > 0);
                }}
                placeholder={localizedMunicipalityName ? `${t('localityPrefix')}: ${localizedMunicipalityName}` : t('municipalityPlaceholder')}
                className={`min-h-14 w-full rounded-xl border-2 border-slate-200 dark:border-white/30 bg-white dark:bg-slate-950 px-4 py-3 font-bold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-brand-indigo focus:ring-4 focus:ring-brand-indigo/20 dark:text-white dark:placeholder-slate-200 ${smallTextClasses[fontSizeStep]}`}
                aria-label={t('municipality')}
              />
            </label>
            {context && (
              <button
                type="button"
                onClick={focusMunicipalityInput}
                className="min-h-14 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 font-black transition-all active:scale-95 md:self-end"
              >
                Vaihda kunta
              </button>
            )}
          </div>
          {context && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[#9fcbd6] dark:border-white/15 bg-[#f3fbfc] dark:bg-[#102d45] px-4 py-3 shadow-sm">
              <p className={`font-bold text-slate-700 dark:text-slate-200 ${smallTextClasses[fontSizeStep]}`}>
                Alueelliset palvelut rajataan tähän paikkakuntaan.
              </p>
              {locality?.municipality && isManualQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setIsManualQuery(false);
                    setQuery(locality.municipality);
                  }}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-black transition-all active:scale-95"
                >
                  Käytä sijaintia {detectedMunicipalityName}
                </button>
              )}
            </div>
          )}
          <p className="sr-only">
            {t('changeMunicipalityHint')}
          </p>
        </div>
      </div>

      {context ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
            {services.map((provider, index) => <ServiceLink key={provider.url} provider={provider} index={index} fontSizeStep={fontSizeStep} onReportLink={onReportLink} />)}
          </div>

          {(showNews || showScamAlerts) && (
          <div className={`grid gap-6 xl:items-start ${showNews && showScamAlerts ? 'xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : 'xl:grid-cols-1'}`}>
            {showNews && (
                <div className="space-y-3" data-tour="local-news">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${smallTextClasses[fontSizeStep]}`}>
                      {t('localNews')}
                    </h3>
                  </div>
                  <LocalNewsHeadlines feeds={rssFeeds} fallbackUrl={fallbackNewsUrl} fontSizeStep={fontSizeStep} compact />
                  {fallbackNewsUrl && (
                    <a
                      href={fallbackNewsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex font-black text-brand-indigo dark:text-blue-300 hover:underline ${smallTextClasses[fontSizeStep]}`}
                    >
                      {t('moreNews')}
                    </a>
                  )}
                </div>
            )}
            {showScamAlerts && (
              <div data-tour="scam-alerts">
                <ScamAlertsBanner compact />
              </div>
            )}
          </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className={`font-black text-slate-500 dark:text-slate-400 ${textClasses[fontSizeStep]}`}>
            {t('typeMunicipalityPrompt')}
          </p>
        </div>
      )}
    </section>
  );
};

export default RegionalServicesPanel;

