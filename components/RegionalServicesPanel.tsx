import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getLocalizedMunicipalityName, getRegionalLibraryProviders, getRegionalNewsProviders, getRegionalProviders, getRegionalRssFeeds, normalizeMunicipality, resolveRegionalContext } from '../localServices';
import { filterVisibleProviders } from '../linkVisibility';
import { LocalityInfo, Provider, LinkReportDraft } from '../types';
import LocalNewsHeadlines from './LocalNewsHeadlines';
import { useI18n } from '../i18n';

interface RegionalServicesPanelProps {
  locality: LocalityInfo | null;
  fontSizeStep?: number;
  onLocalitySelected?: (locality: LocalityInfo) => void;
  onReportLink?: (draft: LinkReportDraft) => void;
  showNews?: boolean;
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
  if (text.includes('kela-taksi') || text.includes('taksi')) return '🚕';
  if (text.includes('liikenne') || text.includes('reitti') || text.includes('hsl') || text.includes('nysse') || text.includes('föli')) return '🚌';
  if (text.includes('kirjasto') || text.includes('finna') || text.includes('helmet')) return '📚';
  if (text.includes('hyvinvointialue') || text.includes('sote') || text.includes('terveys')) return '🏥';
  if (text.includes('paikalliset palvelut') || text.includes('palvelut') || text.includes('kunta') || text.includes('kaupunki')) return '🏛️';
  return '📍';
};

const getPhoneHref = (provider: Provider) => {
  if (provider.phoneUrl) return provider.phoneUrl;
  if (!provider.phone) return undefined;
  return `tel:${provider.phone.replace(/[^\d+]/g, '')}`;
};

const uniqueProvidersByUrl = (providers: Provider[]) => providers.filter(
  (provider, index, all) => all.findIndex((item) => item.url === provider.url) === index
);

const ServiceLink: React.FC<{ provider: Provider; index: number; fontSizeStep: number; onReportLink?: (draft: LinkReportDraft) => void }> = ({ provider, index, fontSizeStep, onReportLink }) => {
  const { t, categoryName } = useI18n();
  const icon = getRegionalServiceIcon(provider);
  const phoneHref = getPhoneHref(provider);
  const href = phoneHref ?? provider.url;
  const isPhoneLink = Boolean(phoneHref);
  return (
    <div className="relative group/service">
      <a
        href={href}
        target={isPhoneLink ? undefined : '_blank'}
        rel={isPhoneLink ? undefined : 'noopener noreferrer'}
        className="zone-link"
        title={isPhoneLink ? `Soita: ${provider.name}` : `Avaa alueellinen palvelu: ${provider.name}`}
        aria-label={provider.phone ? `Soita: ${provider.name}, ${provider.phone}` : undefined}
      >
        <span className="zone-link-icon" aria-hidden="true">{icon}</span>
        <span className="zone-link-label flex min-w-0 flex-col gap-0.5">
          <span className={`min-w-0 leading-tight ${textClasses[fontSizeStep]}`}>{provider.name}</span>
          {provider.phone && <span className={`font-black text-[var(--zone-strong)] ${smallTextClasses[fontSizeStep]}`}>☎ {provider.phone}</span>}
          {provider.group && <span className={`font-semibold text-[var(--theme-text-3)] ${smallTextClasses[fontSizeStep]}`}>{categoryName(provider.group)}</span>}
        </span>
        <span className="zone-link-arrow" aria-hidden="true">→</span>
      </a>
      {onReportLink && (
        <button
          onClick={() => onReportLink({
            name: provider.name,
            url: provider.url,
            category: provider.group,
            source: 'RegionalServicesPanel',
          })}
          title={`Ilmoita ongelma alueellisessa linkissä: ${provider.name}`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-surface)] text-xl text-[var(--theme-text)] opacity-0 shadow-md transition-all hover:bg-[var(--theme-pale)] focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 group-hover/service:opacity-100"
          aria-label={`${t('reportLink')}: ${provider.name}`}
        >
          !
        </button>
      )}
    </div>
  );
};

const RegionalServicesPanel: React.FC<RegionalServicesPanelProps> = ({ locality, fontSizeStep = 0, onLocalitySelected, onReportLink, showNews = true }) => {
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

  useEffect(() => {
    if (!isManualQuery || !context) return;
    if (locality?.municipality && normalizeMunicipality(locality.municipality) === normalizeMunicipality(context.municipality.name)) return;

    onLocalitySelected?.({
      municipality: context.municipality.name,
      displayName: localizedMunicipalityName || context.displayName,
      countryCode: 'fi',
      isInFinland: true,
    });
  }, [context, isManualQuery, locality?.municipality, localizedMunicipalityName, onLocalitySelected]);

  const focusMunicipalityInput = () => {
    setIsManualQuery(true);
    window.requestAnimationFrame(() => {
      municipalityInputRef.current?.focus();
      municipalityInputRef.current?.select();
    });
  };

  return (
    <section className="zone zone-local" id="lahellasi" aria-labelledby="regional-services-heading">
      <div className="zone-head">
        <span className="zone-icon" aria-hidden="true">📍</span>
        <div className="min-w-0">
          <h2 id="regional-services-heading" className="font-display zone-title break-words [overflow-wrap:anywhere]">
            {localizedMunicipalityName ? `${t('nearYou')} · ${localizedMunicipalityName}` : t('nearYou')}
          </h2>
          <p className="zone-info">{t('localZoneInfo')}</p>
        </div>
      </div>
      <div className="mb-5">
        <div className="w-full xl:max-w-2xl">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="flex-1">
              <span className={`mb-1 block font-black text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>{t('municipality')}</span>
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
                className={`min-h-14 w-full rounded-full border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 font-bold text-[var(--theme-text)] placeholder:text-[var(--theme-muted)] focus:border-[var(--theme-gold)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 ${smallTextClasses[fontSizeStep]}`}
                aria-label={t('municipality')}
              />
              {context && (
                <span className={`mt-1 block font-semibold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
                  Näytetään alueelliset palvelut: {localizedMunicipalityName || context.displayName}.
                </span>
              )}
            </label>
            {context && (
              <button
                type="button"
                onClick={focusMunicipalityInput}
                className="min-h-14 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2 font-bold text-[var(--theme-primary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--theme-pale)] active:scale-95 md:self-end"
              >
                Vaihda kunta
              </button>
            )}
          </div>
          {context && locality?.municipality && isManualQuery && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsManualQuery(false);
                  setQuery(locality.municipality);
                }}
                className="rounded-full bg-[var(--theme-primary)] px-4 py-2 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95"
              >
                Käytä sijaintia {detectedMunicipalityName}
              </button>
            </div>
          )}
          <p className="sr-only">
            {t('changeMunicipalityHint')}
          </p>
        </div>
      </div>

      {context ? (
        <div className={showNews ? 'local-grid' : ''}>
          <div className="zone-links-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))', alignContent: 'start' }}>
            {services.map((provider, index) => <ServiceLink key={provider.url} provider={provider} index={index} fontSizeStep={fontSizeStep} onReportLink={onReportLink} />)}
          </div>

          {showNews && (
            <div className="local-news-card space-y-3" data-tour="local-news">
              <h3 className="font-display flex items-center gap-2 text-xl font-bold text-[var(--theme-text)] md:text-2xl">
                <span aria-hidden="true">📰</span>
                {t('localNews')}
              </h3>
              <LocalNewsHeadlines feeds={rssFeeds} fallbackUrl={fallbackNewsUrl} fontSizeStep={fontSizeStep} compact />
              {fallbackNewsUrl && (
                <a
                  href={fallbackNewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex font-black text-[var(--zone-strong)] hover:underline ${smallTextClasses[fontSizeStep]}`}
                >
                  {t('moreNews')} →
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-[var(--zone-border)] bg-[var(--theme-surface)] p-8 text-center">
          <p className={`font-black text-[var(--theme-muted)] ${textClasses[fontSizeStep]}`}>
            {t('typeMunicipalityPrompt')}
          </p>
        </div>
      )}
    </section>
  );
};

export default RegionalServicesPanel;

