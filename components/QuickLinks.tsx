
import React, { useState, useEffect, useRef } from 'react';
import { SHORTCUTS } from '../constants';
import { getLocalizedShortcuts } from '../localServices';
import { filterVisibleShortcuts, isLinkVisible, useLinkVisibilityVersion } from '../linkVisibility';
import { Shortcut, Favorite, LocalityInfo, LinkReportDraft } from '../types';

type SpeechState = 'idle' | 'listening' | 'unsupported';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
  fontSizeStep?: number;
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  locality: LocalityInfo | null;
  onReportLink?: (draft: LinkReportDraft) => void;
}

type LinkResult = { name: string; url: string; color: string; categoryName: string; categoryIcon: string };
type CategoryResult = { shortcut: Shortcut; color: string };

const rowColors = [
  'bg-brand-indigo',
  'bg-brand-purple',
  'bg-brand-cyan',
  'bg-brand-teal',
  'bg-brand-orange',
];

const QuickLinks: React.FC<QuickLinksProps> = ({ onSelectCategory, fontSizeStep = 0, favorites, onToggleFavorite, locality, onReportLink }) => {
  const [search, setSearch] = useState('');
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechState('unsupported');
      return;
    }
    const r = new SpeechRecognition();
    r.lang = 'fi-FI';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setSearch(text);
      setSpeechState('idle');
    };
    r.onerror = () => setSpeechState('idle');
    r.onend = () => setSpeechState('idle');
    recognitionRef.current = r;
  }, []);

  const toggleListening = () => {
    if (speechState === 'listening') {
      recognitionRef.current?.stop();
      setSpeechState('idle');
    } else {
      setSearch('');
      recognitionRef.current?.start();
      setSpeechState('listening');
    }
  };

  const shortcuts = filterVisibleShortcuts(getLocalizedShortcuts(SHORTCUTS, locality));
  useLinkVisibilityVersion();
  const sortedShortcuts = [...shortcuts].sort((a, b) => a.name.localeCompare(b.name, 'fi'));
  const visibleFavorites = favorites.filter((fav) => isLinkVisible(fav.url));

  const iconClasses = [
    'text-[2.25rem] md:text-[2.7rem]',
    'text-[2.7rem] md:text-[3.375rem]',
    'text-[3.375rem] md:text-[4.05rem]',
    'text-[4.05rem] md:text-[5.4rem]',
    'text-[5.4rem] md:text-[7.2rem]',
  ];

  const textClasses = [
    'text-lg md:text-xl',
    'text-xl md:text-2xl',
    'text-2xl md:text-3xl',
    'text-3xl md:text-4xl',
    'text-4xl md:text-5xl',
  ];

  const subTextClasses = [
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
  ];

  const inputClasses = [
    'text-xl md:text-2xl',
    'text-2xl md:text-3xl',
    'text-3xl md:text-4xl',
    'text-4xl md:text-5xl',
    'text-5xl md:text-6xl',
  ];

  const starClasses = [
    'text-xl w-9 h-9',
    'text-2xl w-11 h-11',
    'text-3xl w-13 h-13',
    'text-4xl w-14 h-14',
    'text-5xl w-16 h-16',
  ];

  const q = search.trim().toLowerCase();

  const matchedCategories: CategoryResult[] = [];
  const matchedLinks: LinkResult[] = [];

  if (q) {
    sortedShortcuts.forEach((shortcut, idx) => {
      const color = rowColors[Math.floor(idx / 6) % rowColors.length];
      const categoryMatches = shortcut.name.toLowerCase().includes(q);

      if (categoryMatches) {
        matchedCategories.push({ shortcut, color });
      }

      if (shortcut.providers) {
        shortcut.providers.forEach(provider => {
          if (provider.name.toLowerCase().includes(q) && !categoryMatches) {
            matchedLinks.push({
              name: provider.name,
              url: provider.url,
              color,
              categoryName: shortcut.name,
              categoryIcon: shortcut.icon,
            });
          }
        });
      }
    });
  }

  const hasResults = matchedCategories.length + matchedLinks.length > 0;

  const baseCardStyles = (color: string) =>
    `${color} p-6 md:p-8 rounded-[2rem] shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40 focus:ring-4 focus:ring-blue-400 focus:outline-none flex flex-col items-center justify-center text-center gap-3 h-full min-h-[160px] md:min-h-[220px]`;

  return (
    <div className="space-y-8 animate-in">

      {/* Suosikit */}
      {visibleFavorites.length > 0 && !q && (
        <div className="space-y-4">
          <h3 className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 ${subTextClasses[fontSizeStep]}`}>
            <span>⭐</span> Suosikit
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {visibleFavorites.map((fav, idx) => (
              <div key={idx} className="relative group/fav">
                <a
                  href={fav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={baseCardStyles(fav.color)}
                  aria-label={`Siirry sivustolle: ${fav.name}`}
                >
                  <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{fav.categoryIcon}</span>
                  <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                    {fav.name}
                  </span>
                  <span className={`opacity-75 font-semibold ${subTextClasses[fontSizeStep]}`}>
                    {fav.categoryName}
                  </span>
                </a>
                <button
                  onClick={() => onToggleFavorite(fav)}
                  className={`absolute top-3 right-3 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-md transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none ${starClasses[fontSizeStep]}`}
                  aria-label={`Poista suosikeista: ${fav.name}`}
                >
                  ⭐
                </button>
              </div>
            ))}
          </div>
          <div className="border-t-4 border-slate-200 dark:border-slate-800" />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${subTextClasses[fontSizeStep]}`}>
          Haku
        </p>
        {onReportLink && (
          <button
            type="button"
            onClick={() => onReportLink({ name: '', url: '', category: '', source: 'QuickLinks' })}
            className={`font-black text-brand-indigo dark:text-blue-300 hover:underline ${subTextClasses[fontSizeStep]}`}
          >
            Ilmoita uusi linkki
          </button>
        )}
      </div>

      {/* Hakukenttä */}
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-2xl">🔎</span>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={speechState === 'listening' ? 'Kuuntelen...' : 'Etsi kategoriaa tai linkkiä...'}
          className={`w-full pl-14 py-4 rounded-2xl border-4 transition-all font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4
            ${speechState === 'listening'
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900 pr-28'
              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900 pr-24'
            } ${inputClasses[fontSizeStep]}`}
          aria-label="Etsi kategoriaa tai linkkiä"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl font-black transition-colors"
              aria-label="Tyhjennä haku"
            >
              ✕
            </button>
          )}
          {speechState !== 'unsupported' && (
            <button
              onClick={toggleListening}
              className={`flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-red-300 focus:outline-none active:scale-95
                ${speechState === 'listening'
                  ? 'bg-red-500 text-white animate-pulse w-12 h-12 text-2xl shadow-lg shadow-red-300'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-500 dark:text-slate-400 hover:text-red-600 w-12 h-12 text-2xl'
                }`}
              aria-label={speechState === 'listening' ? 'Lopeta kuuntelu' : 'Puhu hakusana'}
            >
              🎤
            </button>
          )}
        </div>
      </div>
      {speechState === 'listening' && (
        <p className={`text-red-500 font-bold text-center animate-pulse ${subTextClasses[fontSizeStep]}`}>
          🎤 Kuuntelen — puhu nyt...
        </p>
      )}

      {/* Hakutulokset */}
      {q ? (
        <>
          {!hasResults && (
            <p className={`text-center text-slate-500 dark:text-slate-400 font-bold py-12 ${inputClasses[fontSizeStep]}`}>
              Ei hakutuloksia — kokeile eri hakusanaa
            </p>
          )}

          {matchedCategories.length > 0 && (
            <div className="space-y-3">
              <p className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${subTextClasses[fontSizeStep]}`}>
                Kategoriat
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {matchedCategories.map(({ shortcut, color }, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectCategory({ ...shortcut, color })}
                    className={baseCardStyles(color)}
                    aria-label={`Avaa kategoria: ${shortcut.name}`}
                  >
                    <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{shortcut.icon}</span>
                    <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                      {shortcut.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedLinks.length > 0 && (
            <div className="space-y-3">
              <p className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${subTextClasses[fontSizeStep]}`}>
                Linkit
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {matchedLinks.map((link, idx) => {
                  const isFav = favorites.some(f => f.url === link.url);
                  const fav: Favorite = {
                    name: link.name,
                    url: link.url,
                    categoryName: link.categoryName,
                    categoryIcon: link.categoryIcon,
                    color: link.color,
                  };
                  return (
                    <div key={idx} className="relative group/link">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={baseCardStyles(link.color)}
                        aria-label={`Siirry sivustolle: ${link.name}`}
                      >
                        <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{link.categoryIcon}</span>
                        <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                          {link.name}
                        </span>
                        <span className={`opacity-75 font-semibold ${subTextClasses[fontSizeStep]}`}>
                          {link.categoryName}
                        </span>
                      </a>
                      {onReportLink && (
                        <button
                        onClick={() => onReportLink({
                          name: link.name,
                          url: link.url,
                          category: link.categoryName,
                          source: 'QuickLinks',
                        })}
                        className="absolute bottom-3 right-3 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 text-white shadow-md transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none opacity-0 group-hover/link:opacity-100 w-10 h-10 text-xl"
                        aria-label={`Ilmoita linkki: ${link.name}`}
                      >
                        !
                      </button>
                      )}
                      <button
                        onClick={() => onToggleFavorite(fav)}
                        className={`absolute top-3 right-3 flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none
                          ${isFav
                            ? 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
                            : 'bg-white/30 hover:bg-yellow-100/80 opacity-0 group-hover/link:opacity-100'
                          } ${starClasses[fontSizeStep]}`}
                        aria-label={isFav ? `Poista suosikeista: ${link.name}` : `Lisää suosikiksi: ${link.name}`}
                      >
                        {isFav ? '⭐' : '☆'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Normaali kategoriaruudukko */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {sortedShortcuts.map((link, idx) => {
            const color = rowColors[Math.floor(idx / 6) % rowColors.length];
            const isCategory = !!link.providers;

            const content = (
              <>
                <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{link.icon}</span>
                <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                  {link.name}
                </span>
              </>
            );

            if (isCategory) {
              return (
                <button
                  key={idx}
                  onClick={() => onSelectCategory({ ...link, color })}
                  className={baseCardStyles(color)}
                  aria-label={`Avaa kategoria: ${link.name}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={baseCardStyles(color)}
                aria-label={`Siirry sivustolle: ${link.name}`}
              >
                {content}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickLinks;

