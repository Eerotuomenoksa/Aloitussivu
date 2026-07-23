import React, { useEffect, useMemo, useRef, useState } from 'react';
import { findMunicipality, getLocalizedMunicipalityName, getRegionalCategoryShortcuts, getRegionalLibraryProviders, getRegionalNewsProviders, getRegionalProviderScopeInfo, getRegionalProviders, getRegionalRssFeeds, normalizeMunicipality, resolveRegionalContext } from '../localServices';
import { filterVisibleProviders } from '../linkVisibility';
import { LocalityInfo, Provider, LinkReportDraft, RegionalContext, Shortcut } from '../types';
import LocalNewsHeadlines from './LocalNewsHeadlines';
import { useI18n } from '../i18n';

interface RegionalServicesPanelProps {
  locality: LocalityInfo | null;
  fontSizeStep?: number;
  onLocalitySelected?: (locality: LocalityInfo) => void;
  onReportLink?: (draft: LinkReportDraft) => void;
  onSelectCategory?: (shortcut: Shortcut) => void;
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
  if (text.includes('lehti') || text.includes('lehdet') || text.includes('uutiset') || text.includes('media')) return '📰';
  if (text.includes('museo')) return '🖼️';
  if (text.includes('teatteri')) return '🎭';
  if (text.includes('liikunta') || text.includes('urheilu')) return '🚶';
  if (text.includes('eläkeyhdistys') || text.includes('eläkeyhdistykset') || text.includes('yhdistys') || text.includes('yhdistykset')) return '👥';
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

const normalizeCardText = (value: string) => value
  .toLocaleLowerCase('fi-FI')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isRedundantScopeDetail = (provider: Provider, detail?: string) => {
  if (!detail) return true;
  const providerName = normalizeCardText(provider.name);
  const detailText = normalizeCardText(detail);
  return providerName.includes(detailText) || detailText.includes(providerName);
};

const formatScopeLabel = (provider: Provider, scopeInfo: ReturnType<typeof getRegionalProviderScopeInfo>, t: ReturnType<typeof useI18n>['t']) => {
  if (!scopeInfo) return '';
  if (scopeInfo.scope === 'municipality' || scopeInfo.scope === 'wellbeingArea') return '';
  if (isRedundantScopeDetail(provider, scopeInfo.detail)) {
    return scopeInfo.scope === 'nationalFallback' ? t('regionalScopeNationalFallback') : '';
  }

  const label = scopeInfo.scope === 'regional'
    ? t('regionalScopeRegional')
    : scopeInfo.scope === 'neighbor'
      ? t('regionalScopeNeighbor')
      : t('regionalScopeNationalFallback');
  return scopeInfo.detail ? `${label}: ${scopeInfo.detail}` : label;
};

const ServiceLink: React.FC<{ provider: Provider; index: number; fontSizeStep: number; context: RegionalContext; onReportLink?: (draft: LinkReportDraft) => void }> = ({ provider, index, fontSizeStep, context, onReportLink }) => {
  const { t } = useI18n();
  const icon = getRegionalServiceIcon(provider);
  const phoneHref = getPhoneHref(provider);
  const href = phoneHref ?? provider.url;
  const isPhoneLink = Boolean(phoneHref);
  const scopeLabel = formatScopeLabel(provider, getRegionalProviderScopeInfo(provider, context), t);
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
          {scopeLabel && <span className={`font-semibold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>{scopeLabel}</span>}
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

const formatRegionalLinkCount = (count: number, t: ReturnType<typeof useI18n>['t']) => (
  (count === 1 ? t('regionalLinkCountOne') : t('regionalLinkCountOther')).replace('{count}', String(count))
);

const CategoryLink: React.FC<{ shortcut: Shortcut; fontSizeStep: number; onSelectCategory?: (shortcut: Shortcut) => void }> = ({ shortcut, fontSizeStep, onSelectCategory }) => {
  const { categoryName, t } = useI18n();
  const count = shortcut.providers?.length ?? 0;
  const countLabel = formatRegionalLinkCount(count, t);

  if (!onSelectCategory) return null;

  return (
    <button
      type="button"
      onClick={() => onSelectCategory(shortcut)}
      className="zone-link"
      title={`Avaa alueelliset linkit kategoriassa ${categoryName(shortcut.name)}`}
    >
      <span className="zone-link-icon" aria-hidden="true">{shortcut.icon}</span>
      <span className="zone-link-label flex min-w-0 flex-col gap-0.5">
        <span className={`min-w-0 leading-tight ${textClasses[fontSizeStep]}`}>{categoryName(shortcut.name)}</span>
        <span className={`font-semibold text-[var(--theme-text-3)] ${smallTextClasses[fontSizeStep]}`}>
          {countLabel}
        </span>
      </span>
      <span className="zone-link-arrow" aria-hidden="true">→</span>
    </button>
  );
};

const RegionalServicesPanel: React.FC<RegionalServicesPanelProps> = ({ locality, fontSizeStep = 0, onLocalitySelected, onReportLink, onSelectCategory, showNews = true }) => {
  const { language, t } = useI18n();
  const [query, setQuery] = useState('');
  const [isManualQuery, setIsManualQuery] = useState(false);
  const municipalityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!locality?.municipality || isManualQuery) return;
    setQuery(locality.municipality);
  }, [isManualQuery, locality?.municipality]);

  const context = useMemo(() => resolveRegionalContext(query, isManualQuery ? null : locality), [isManualQuery, query, locality]);
  const services = useMemo(() => context ? filterVisibleProviders(uniqueProvidersByUrl(
    [
      ...getRegionalProviders(context, language),
      ...getRegionalLibraryProviders(context),
    ]
  )) ?? [] : [], [context, language]);
  const regionalCategories = useMemo(() => context ? getRegionalCategoryShortcuts(context, language) : [], [context, language]);
  const newsFallbacks = useMemo(() => context ? filterVisibleProviders(getRegionalNewsProviders(context, language)) ?? [] : [], [context, language]);
  const rssFeeds = useMemo(() => context ? getRegionalRssFeeds(context, language) : [], [context, language]);
  const fallbackNewsUrl = newsFallbacks[0]?.url ?? '';
  const localizedMunicipalityName = context ? getLocalizedMunicipalityName(context.municipality, language) : '';
  const detectedMunicipality = locality?.municipality ? findMunicipality(locality.municipality) : null;
  const detectedMunicipalityName = detectedMunicipality ? getLocalizedMunicipalityName(detectedMunicipality, language) : '';
  const detectedLocationLabel = detectedMunicipalityName || locality?.municipality || '';
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

  const useDetectedMunicipality = () => {
    if (!locality?.municipality) return;
    setIsManualQuery(false);
    setQuery(locality.municipality);
  };

  const clearMunicipalityInput = () => {
    setIsManualQuery(true);
    setQuery('');
    window.requestAnimationFrame(() => {
      municipalityInputRef.current?.focus();
    });
  };

  return (
    <section className="zone zone-local" id="lahellasi" aria-labelledby="regional-services-heading">
      <div className="zone-head items-start">
        <span className="zone-icon" aria-hidden="true">📍</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <h2 id="regional-services-heading" className="font-display zone-title break-words [overflow-wrap:anywhere]">
              {t('nearYou')}
            </h2>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <label className="min-w-0 flex-1 lg:max-w-md">
                <span className="sr-only">
                  {t('municipality')}
                </span>
                <input
                  ref={municipalityInputRef}
                  type="search"
                  value={displayedQuery}
                  onFocus={() => {
                    if (!isManualQuery) {
                      setIsManualQuery(true);
                      window.requestAnimationFrame(() => municipalityInputRef.current?.select());
                    }
                  }}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    setQuery(nextQuery);
                    setIsManualQuery(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      useDetectedMunicipality();
                      municipalityInputRef.current?.blur();
                    }
                  }}
                  placeholder={localizedMunicipalityName ? localizedMunicipalityName : t('municipalityPlaceholder')}
                  className={`min-h-12 w-full rounded-full border-2 border-[var(--zone-border)] bg-[var(--theme-surface)] px-5 py-2 font-black text-[var(--theme-text)] placeholder:text-[var(--theme-muted)] focus:border-[var(--theme-gold)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 ${textClasses[fontSizeStep]}`}
                  aria-label={t('municipality')}
                  enterKeyHint="done"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {isManualQuery && query.trim() ? (
                  <button
                    type="button"
                    onClick={clearMunicipalityInput}
                    className={`min-h-11 rounded-full bg-[var(--theme-primary)] px-5 py-2 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 ${smallTextClasses[fontSizeStep]}`}
                  >
                    Tyhjennä
                  </button>
                ) : null}
                {locality?.municipality && isManualQuery && context && normalizeMunicipality(locality.municipality) !== normalizeMunicipality(context.municipality.name) ? (
                  <button
                    type="button"
                    onClick={useDetectedMunicipality}
                    className={`min-h-11 rounded-full bg-[var(--theme-primary)] px-5 py-2 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 ${smallTextClasses[fontSizeStep]}`}
                  >
                    Käytä sijaintia
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <p className="zone-info">{t('localZoneInfo')}</p>
          {locality?.municipality && isManualQuery && context && normalizeMunicipality(locality.municipality) !== normalizeMunicipality(context.municipality.name) && (
            <p className={`mt-2 font-semibold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
              Sijaintisi on {detectedLocationLabel}.
            </p>
          )}
          {!context && isManualQuery && query.trim() && (
            <p className={`mt-2 font-semibold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
              Kirjoita kunnan nimi kokonaan, esimerkiksi Helsinki, Akaa tai Alajärvi.
            </p>
          )}
          <p className="sr-only">
            {t('changeMunicipalityHint')}
          </p>
        </div>
      </div>

      {context ? (
        <div className={showNews ? 'local-grid' : ''}>
          <div className="space-y-5">
            {services.length > 0 && (
              <section className="space-y-3" aria-label={t('primaryRegionalServices')}>
                <div className="border-b border-[var(--zone-border)] pb-2">
                  <h3 className="font-display text-xl font-bold text-[var(--theme-text)] md:text-2xl">
                    {t('primaryRegionalServices')}
                  </h3>
                </div>
                <div className="zone-links-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))', alignContent: 'start' }}>
                  {services.map((provider, index) => <ServiceLink key={provider.url} provider={provider} index={index} fontSizeStep={fontSizeStep} context={context} onReportLink={onReportLink} />)}
                </div>
              </section>
            )}

            {regionalCategories.length > 0 && (
              <section className="space-y-3" aria-label={t('regionalLinksByTopic')}>
                <div className="border-b border-[var(--zone-border)] pb-2">
                  <h3 className="font-display text-xl font-bold text-[var(--theme-text)] md:text-2xl">
                    {t('regionalLinksByTopic')}
                  </h3>
                </div>
                <div className="zone-links-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))', alignContent: 'start' }}>
                  {regionalCategories.map((shortcut) => (
                    <CategoryLink
                      key={shortcut.name}
                      shortcut={shortcut}
                      fontSizeStep={fontSizeStep}
                      onSelectCategory={onSelectCategory}
                    />
                  ))}
                </div>
              </section>
            )}
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

