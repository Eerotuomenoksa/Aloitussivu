
import React, { useState } from 'react';

const SearchBar: React.FC<{ fontSizeStep?: number }> = ({ fontSizeStep = 0 }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  const textClasses = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-4xl mx-auto mb-12">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Etsi Googlesta..."
          className={`w-full bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 rounded-[2.5rem] py-6 px-10 pl-16 shadow-xl focus:ring-8 focus:ring-brand-indigo/20 focus:border-brand-indigo outline-none transition-all dark:text-white font-bold ${textClasses[fontSizeStep]}`}
          aria-label="Google-haku"
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl opacity-40">
          🔍
        </div>
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-indigo hover:bg-brand-purple text-white px-8 py-3 rounded-full font-black text-xl transition-all shadow-lg active:scale-95"
        >
          Hae
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
