
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
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  const textClasses = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];
  const isHeader = variant === 'header';

  return (
    <form onSubmit={handleSearch} className={`relative w-full ${isHeader ? 'max-w-5xl' : 'max-w-4xl mx-auto mb-12'}`}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('googlePlaceholder')}
          className={`w-full bg-white dark:bg-slate-800 border-4 ${isHeader ? 'border-slate-200 dark:border-slate-700 rounded-[2rem] py-5 pl-16 pr-36 shadow-xl' : 'border-slate-200 dark:border-slate-700 rounded-[2.5rem] py-6 px-10 pl-16 shadow-xl'} focus:ring-8 focus:ring-brand-indigo/20 focus:border-brand-indigo outline-none transition-all dark:text-white font-bold ${textClasses[fontSizeStep]}`}
          aria-label={t('googleSearch')}
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl opacity-40" aria-hidden="true">
          🔍
        </div>
        <button
          type="submit"
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${isHeader ? 'bg-brand-indigo hover:bg-brand-purple text-white border-b-4 border-indigo-900 px-7 py-3' : 'bg-brand-indigo hover:bg-brand-purple text-white px-8 py-3'} rounded-full font-black text-xl transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300`}
        >
          {t('searchButton')}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
