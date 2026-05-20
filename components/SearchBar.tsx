
import React, { useState } from 'react';
import { useI18n } from '../i18n';

interface SearchBarProps {
  fontSizeStep?: number;
  variant?: 'default' | 'header';
}

const SearchBar: React.FC<SearchBarProps> = ({ fontSizeStep = 0, variant = 'default' }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`;
      window.open(targetUrl, '_blank');
      setQuery('');
    }
  };

  const textClasses = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];
  const isHeader = variant === 'header';
  const inputTextClass = isHeader ? 'text-lg md:text-xl' : textClasses[fontSizeStep];

  return (
    <form onSubmit={handleSearch} className={`relative w-full space-y-3 ${isHeader ? 'max-w-5xl' : 'max-w-4xl mx-auto mb-12'}`}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('googlePlaceholder')}
          className={`w-full bg-white dark:bg-slate-800 border-4 ${isHeader ? 'border-slate-200 dark:border-slate-700 rounded-[1.5rem] py-4 pl-14 pr-4 shadow-xl sm:rounded-[2rem] sm:py-5 sm:pl-16 sm:pr-36' : 'border-slate-200 dark:border-slate-700 rounded-[2.5rem] py-6 px-10 pl-16 shadow-xl'} focus:ring-8 focus:ring-brand-indigo/20 focus:border-brand-indigo outline-none transition-all text-slate-950 dark:text-white font-bold ${inputTextClass}`}
          aria-label={t('googleSearch')}
        />
        <div className={`absolute left-5 ${isHeader ? 'top-6 sm:left-6 sm:top-1/2' : 'left-6 top-1/2'} -translate-y-1/2 text-3xl opacity-40 sm:text-4xl`} aria-hidden="true">
          🔍
        </div>
        <button
          type="submit"
          className={`${isHeader ? 'mt-3 w-full bg-[#d09a32] hover:bg-[#e0aa43] text-slate-950 border-b-4 border-[#8f651e] px-5 py-3 text-lg focus:ring-amber-200 sm:absolute sm:right-4 sm:top-1/2 sm:mt-0 sm:w-auto sm:-translate-y-1/2 sm:px-7 sm:text-xl' : 'absolute right-4 top-1/2 -translate-y-1/2 bg-[#173e5f] hover:bg-[#214f76] text-white px-8 py-3 text-xl focus:ring-indigo-300'} rounded-full font-black transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-4`}
        >
          {t('searchButton')}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
