
import React, { useCallback, useState } from 'react';
import { useI18n } from '../i18n';
import { useSpeechInput } from '../hooks/useSpeechInput';

interface SearchBarProps {
  fontSizeStep?: number;
  variant?: 'default' | 'header';
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
  const inputTextClass = isHeader ? 'text-lg md:text-xl' : textClasses[fontSizeStep];
  const inputColorClass = isHeader
    ? 'border-white/30 bg-slate-950 text-white placeholder-slate-200'
    : 'border-slate-200 bg-white text-slate-950 placeholder-slate-500 dark:border-white/30 dark:bg-slate-950 dark:text-white dark:placeholder-slate-200';
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
          className={`w-full border-4 ${inputColorClass} ${inputShapeClass} focus:ring-8 focus:ring-brand-indigo/20 focus:border-brand-indigo outline-none transition-all font-bold ${inputTextClass}`}
          aria-label={t('googleSearch')}
        />
        <div className={`absolute ${isHeader ? 'left-4 top-1/2 text-2xl sm:left-6 sm:text-4xl' : 'left-6 top-1/2 text-3xl sm:text-4xl'} -translate-y-1/2 opacity-40`} aria-hidden="true">
          🔍
        </div>
        <div className={`absolute ${isHeader ? 'right-3 sm:right-4' : 'right-4'} top-1/2 -translate-y-1/2 flex items-center gap-2`}>
          {canListen && (
            <button
              type="button"
              onClick={toggleListening}
              className={`${speechState === 'listening' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 text-slate-700 hover:bg-red-100 hover:text-red-700 dark:bg-slate-800 dark:text-white dark:hover:bg-red-900/40'} flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300 sm:h-12 sm:w-12`}
              aria-label={speechState === 'listening' ? t('stopListening') : t('startListening')}
            >
              🎤
            </button>
          )}
          <button
            type="submit"
            className={`${isHeader ? 'bg-[#d09a32] hover:bg-[#e0aa43] text-slate-950 border-b-4 border-[#8f651e] px-4 py-2 text-base focus:ring-amber-200 sm:px-7 sm:py-3 sm:text-xl' : 'bg-[#173e5f] hover:bg-[#214f76] text-white px-8 py-3 text-xl focus:ring-indigo-300'} rounded-full font-black transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-4`}
          >
            {t('searchButton')}
          </button>
        </div>
      </div>
      {speechState === 'listening' && (
        <p className="text-center font-bold text-red-500 animate-pulse">
          🎤 {t('listeningNow')}
        </p>
      )}
    </form>
  );
};

export default SearchBar;
