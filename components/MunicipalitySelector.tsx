import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import {
  findMunicipality,
  getLocalizedMunicipalityName,
  normalizeMunicipality,
  resolveRegionalContext,
} from '../localServices';
import { LocalityInfo } from '../types';

interface MunicipalitySelectorProps {
  locality: LocalityInfo | null;
  onLocalitySelected?: (locality: LocalityInfo) => void;
  fontSizeStep?: number;
  compact?: boolean;
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

const MunicipalitySelector: React.FC<MunicipalitySelectorProps> = ({
  locality,
  onLocalitySelected,
  fontSizeStep = 0,
  compact = false,
}) => {
  const { language, t } = useI18n();
  const [query, setQuery] = useState(locality?.municipality ?? '');
  const [isManualQuery, setIsManualQuery] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const helpId = useId();
  const errorId = useId();

  useEffect(() => {
    if (isManualQuery) return;
    setQuery(locality?.municipality ?? '');
  }, [isManualQuery, locality?.municipality]);

  const context = useMemo(
    () => resolveRegionalContext(query, isManualQuery ? null : locality),
    [isManualQuery, locality, query],
  );
  const localizedMunicipalityName = context
    ? getLocalizedMunicipalityName(context.municipality, language)
    : '';
  const detectedMunicipality = locality?.municipality
    ? findMunicipality(locality.municipality)
    : null;
  const detectedLocationLabel = detectedMunicipality
    ? getLocalizedMunicipalityName(detectedMunicipality, language)
    : locality?.displayName || locality?.municipality || '';
  const displayedQuery = !isManualQuery && localizedMunicipalityName
    ? localizedMunicipalityName
    : query;
  const hasInvalidMunicipality = isManualQuery && Boolean(query.trim()) && !context;
  const differsFromSavedLocality = Boolean(
    locality?.municipality
      && context
      && normalizeMunicipality(locality.municipality) !== normalizeMunicipality(context.municipality.name),
  );

  useEffect(() => {
    if (!isManualQuery || !context) return;
    if (
      locality?.municipality
      && normalizeMunicipality(locality.municipality) === normalizeMunicipality(context.municipality.name)
    ) return;

    onLocalitySelected?.({
      municipality: context.municipality.name,
      displayName: localizedMunicipalityName || context.displayName,
      countryCode: 'fi',
      isInFinland: true,
    });
  }, [context, isManualQuery, locality?.municipality, localizedMunicipalityName, onLocalitySelected]);

  const useSavedLocality = () => {
    if (!locality?.municipality) return;
    setIsManualQuery(false);
    setQuery(locality.municipality);
  };

  const clearInput = () => {
    setIsManualQuery(true);
    setQuery('');
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="min-w-0">
      <div className={`flex min-w-0 flex-col gap-2 ${compact ? '' : 'sm:flex-row sm:items-center'}`}>
        <label className="min-w-0 flex-1">
          <span className="sr-only">{t('municipality')}</span>
          <input
            ref={inputRef}
            type="search"
            value={displayedQuery}
            onFocus={() => {
              if (!isManualQuery) {
                setIsManualQuery(true);
                window.requestAnimationFrame(() => inputRef.current?.select());
              }
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsManualQuery(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                useSavedLocality();
                inputRef.current?.blur();
              }
            }}
            placeholder={localizedMunicipalityName || t('municipalityPlaceholder')}
            className={`min-h-12 w-full rounded-full border-2 border-[var(--zone-border)] bg-[var(--theme-surface)] px-5 py-2 font-black text-[var(--theme-text)] placeholder:text-[var(--theme-muted)] focus:border-[var(--theme-gold)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 ${textClasses[fontSizeStep]}`}
            aria-label={t('municipality')}
            aria-invalid={hasInvalidMunicipality ? 'true' : undefined}
            aria-describedby={`${helpId}${hasInvalidMunicipality ? ` ${errorId}` : ''}`}
            enterKeyHint="done"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {isManualQuery && query.trim() ? (
            <button
              type="button"
              onClick={clearInput}
              className={`min-h-11 rounded-full bg-[var(--theme-primary)] px-5 py-2 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 ${smallTextClasses[fontSizeStep]}`}
            >
              {t('clear')}
            </button>
          ) : null}
          {differsFromSavedLocality ? (
            <button
              type="button"
              onClick={useSavedLocality}
              className={`min-h-11 rounded-full bg-[var(--theme-primary)] px-5 py-2 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 ${smallTextClasses[fontSizeStep]}`}
            >
              {t('useDetectedLocation')}
            </button>
          ) : null}
        </div>
      </div>
      {differsFromSavedLocality ? (
        <p className={`mt-2 font-semibold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
          {t('currentLocationIs').replace('{location}', detectedLocationLabel)}
        </p>
      ) : null}
      {hasInvalidMunicipality ? (
        <p
          id={errorId}
          role="alert"
          aria-atomic="true"
          className={`mt-2 font-semibold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}
        >
          {t('fullMunicipalityPrompt')}
        </p>
      ) : null}
      <p id={helpId} className="sr-only">{t('changeMunicipalityHint')}</p>
    </div>
  );
};

export default MunicipalitySelector;
