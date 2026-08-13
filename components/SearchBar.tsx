
import React, { useCallback, useState } from 'react';
import { useI18n } from '../i18n';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { MicrophoneIcon, SearchIcon } from './icons/SearchIcons';

interface SearchBarProps {
  fontSizeStep?: number;
  variant?: 'default' | 'header' | 'aurora';
}

const SearchBar: React.FC<SearchBarProps> = ({ fontSizeStep = 0, variant = 'default' }) => {
  const { t, speechLocale } = useI18n();
  const [query, setQuery] = useState('');
  const setSpokenQuery = useCallback((text: string) => setQuery(text), []);
  const clearQueryBeforeListen = useCallback(() => setQuery(''), []);
  const { speechState, canListen, toggleListening } = useSpeechInput({
    locale: speechLocale,
    onResult: setSpokenQuery,
    clearBeforeListen: clearQueryBeforeListen,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setQuery('');
    }
  };

  const textClasses = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];
  const isHeader = variant === 'header';
  const isAurora = variant === 'aurora';
  const inputTextClass = isHeader ? 'text-lg md:text-xl' : textClasses[fontSizeStep];
  if (isAurora) {
    return (
      <form onSubmit={handleSearch} className="hero-search relative w-full">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={speechState === 'listening' ? t('listeningPlaceholder') : t('googlePlaceholder')}
            className="w-full rounded-[28px] border-[1.5px] border-white bg-white py-[.9rem] pl-12 pr-36 font-body text-[1.1rem] font-normal text-[#0a1a0e] shadow-[0_8px_32px_rgba(0,0,0,.25)] outline-none transition-all placeholder:text-[#4a6455] focus:border-[var(--theme-gold)] focus:ring-4 focus:ring-[var(--theme-focus)]/20"
            aria-label={t('googleSearch')}
            title="Kirjoita hakusana ja hae Googlesta"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-50" aria-hidden="true">
            <SearchIcon className="h-5 w-5" />
          </span>
          <div className="absolute right-[.45rem] top-1/2 flex -translate-y-1/2 items-center gap-2">
            {canListen && (
              <button
                type="button"
                onClick={toggleListening}
                title={speechState === 'listening' ? 'Lopeta puheentunnistus' : 'Hae puhumalla'}
                className={`${speechState === 'listening' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/80 text-[#0a1a0e] hover:bg-red-100 hover:text-red-700'} flex h-9 w-9 items-center justify-center rounded-full text-base shadow-md transition-all active:scale-95 focus-visible:outline-none`}
                aria-label={speechState === 'listening' ? t('stopListening') : t('startListening')}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              title="Avaa hakutulos Googlessa"
              className="rounded-[24px] bg-[var(--theme-primary)] px-[1.1rem] py-[.55rem] text-sm font-bold text-[var(--theme-primary-label)] shadow-[0_2px_12px_rgba(0,0,0,.28)] transition-all hover:bg-[var(--theme-primary-mid)] hover:shadow-[0_4px_20px_rgba(0,0,0,.32)] active:scale-95"
            >
              {t('searchButton')}
            </button>
          </div>
        </div>
        {speechState === 'listening' && (
          <p className="mt-3 flex items-center justify-center gap-2 text-center font-semibold text-white animate-pulse">
            <MicrophoneIcon className="h-5 w-5" /> {t('listeningNow')}
          </p>
        )}
      </form>
    );
  }
  const inputColorClass = isHeader
    ? 'border-transparent bg-white/95 text-[#1a2e1e] placeholder:text-[#7a9a82]'
    : 'border-[var(--theme-border-strong)] bg-[var(--theme-surface)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-3)]';
  const inputShapeClass = isHeader
    ? 'rounded-[1.25rem] py-3 pl-12 pr-44 shadow-xl sm:rounded-[2rem] sm:py-5 sm:pl-16 sm:pr-56'
    : 'rounded-[2.5rem] py-6 pl-16 pr-48 shadow-xl';

  return (
    <form onSubmit={handleSearch} className={`relative w-full space-y-3 ${isHeader ? 'max-w-5xl' : 'max-w-4xl mx-auto mb-12'}`}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={speechState === 'listening' ? t('listeningPlaceholder') : t('googlePlaceholder')}
          className={`w-full border-2 ${inputColorClass} ${inputShapeClass} focus:border-[var(--theme-gold)] focus:ring-4 focus:ring-[var(--theme-focus)]/30 outline-none transition-all font-normal shadow-md ${inputTextClass}`}
          aria-label={t('googleSearch')}
          title="Kirjoita hakusana ja hae Googlesta"
        />
        <div className={`absolute ${isHeader ? 'left-4 top-1/2 sm:left-6' : 'left-6 top-1/2'} -translate-y-1/2 opacity-50`} aria-hidden="true">
          <SearchIcon className={isHeader ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8'} />
        </div>
        <div className={`absolute ${isHeader ? 'right-3 sm:right-4' : 'right-4'} top-1/2 -translate-y-1/2 flex items-center gap-2`}>
          {canListen && (
            <button
              type="button"
              onClick={toggleListening}
              title={speechState === 'listening' ? 'Lopeta puheentunnistus' : 'Hae puhumalla'}
              className={`${speechState === 'listening' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 text-slate-700 hover:bg-red-100 hover:text-red-700 dark:bg-slate-800 dark:text-white dark:hover:bg-red-900/40'} flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300 sm:h-12 sm:w-12`}
              aria-label={speechState === 'listening' ? t('stopListening') : t('startListening')}
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>
          )}
          <button
            type="submit"
            title="Avaa hakutulos Googlessa"
            className={`${isHeader ? 'px-4 py-2 text-base sm:px-7 sm:py-3 sm:text-xl' : 'px-8 py-3 text-xl'} rounded-full bg-[var(--theme-primary)] font-black text-[var(--theme-primary-label)] shadow-lg transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40`}
          >
            {t('searchButton')}
          </button>
        </div>
      </div>
      {speechState === 'listening' && (
        <p className="flex items-center justify-center gap-2 text-center font-semibold text-red-500 animate-pulse">
          <MicrophoneIcon className="h-5 w-5" /> {t('listeningNow')}
        </p>
      )}
    </form>
  );
};

export default SearchBar;
