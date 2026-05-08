import React from 'react';
import { Favorite } from '../types';
import { isLinkVisible } from '../linkVisibility';
import { useI18n } from '../i18n';

interface FavoriteLinksProps {
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  fontSizeStep?: number;
}

const rowColors = [
  'bg-brand-indigo',
  'bg-brand-purple',
  'bg-brand-cyan',
  'bg-brand-teal',
  'bg-brand-orange',
];

const FavoriteLinks: React.FC<FavoriteLinksProps> = ({ favorites, onToggleFavorite, fontSizeStep = 0 }) => {
  const { t, categoryName } = useI18n();
  const visibleFavorites = favorites.filter((fav) => isLinkVisible(fav.url));

  if (visibleFavorites.length === 0) return null;

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

  const starClasses = [
    'text-xl w-9 h-9',
    'text-2xl w-11 h-11',
    'text-3xl w-13 h-13',
    'text-4xl w-14 h-14',
    'text-5xl w-16 h-16',
  ];

  const baseCardStyles = (color: string) =>
    `${color} p-6 md:p-8 rounded-[2rem] shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40 focus:ring-4 focus:ring-blue-400 focus:outline-none flex flex-col items-center justify-center text-center gap-3 h-full min-h-[160px] md:min-h-[220px]`;

  return (
    <section className="space-y-4" aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 ${subTextClasses[fontSizeStep]}`}>
        <span aria-hidden="true">⭐</span> {t('favorites')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {visibleFavorites.map((fav, idx) => {
          const color = fav.color || rowColors[idx % rowColors.length];
          return (
            <div key={fav.url} className="relative group/fav">
              <a
                href={fav.url}
                target="_blank"
                rel="noopener noreferrer"
                className={baseCardStyles(color)}
                aria-label={`${t('goToSite')}: ${fav.name}`}
              >
                <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{fav.categoryIcon}</span>
                <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                  {fav.name}
                </span>
                <span className={`opacity-75 font-semibold ${subTextClasses[fontSizeStep]}`}>
                  {categoryName(fav.categoryName)}
                </span>
              </a>
              <button
                onClick={() => onToggleFavorite(fav)}
                className={`absolute top-3 right-3 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-md transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none ${starClasses[fontSizeStep]}`}
                aria-label={`${t('removeFavorite')}: ${fav.name}`}
              >
                ⭐
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FavoriteLinks;
