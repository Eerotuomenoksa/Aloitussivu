import React from 'react';
import { Favorite } from '../types';
import { isLinkVisible } from '../linkVisibility';
import { useI18n } from '../i18n';

interface FavoriteLinksProps {
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  fontSizeStep?: number;
}

const FavoriteLinks: React.FC<FavoriteLinksProps> = ({ favorites, onToggleFavorite, fontSizeStep = 0 }) => {
  const { t, categoryName } = useI18n();
  const visibleFavorites = favorites.filter((fav) => isLinkVisible(fav.url));

  if (visibleFavorites.length === 0) return null;

  const textClasses = [
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
  ];

  const subTextClasses = [
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
  ];

  const basePillStyles =
    'inline-flex items-center gap-2 rounded-full border-2 border-[#e8a020] bg-[#fff8e8] px-5 py-2.5 font-black text-[#1a2e1e] shadow-[0_3px_0_#c27e10] transition-all duration-100 hover:-translate-y-0.5 hover:bg-[#fff0c0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a4d2e] active:translate-y-0 active:shadow-none dark:bg-[#2a2010] dark:text-[#e8f5ed]';

  return (
    <section className="space-y-4" aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 ${subTextClasses[fontSizeStep]}`}>
        <span aria-hidden="true">⭐</span> {t('favorites')}
      </h2>
      <div className="flex flex-wrap gap-3 md:gap-4">
        {visibleFavorites.map((fav) => {
          return (
            <div key={fav.url} className="group/fav inline-flex items-center gap-2">
              <a
                href={fav.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${basePillStyles} ${textClasses[fontSizeStep]}`}
                aria-label={`${t('goToSite')}: ${fav.name}`}
              >
                <span aria-hidden="true">{fav.categoryIcon}</span>
                <span className="leading-tight">
                  {fav.name}
                </span>
                <span className={`opacity-65 font-semibold ${subTextClasses[fontSizeStep]}`}>
                  {categoryName(fav.categoryName)}
                </span>
              </a>
              <button
                onClick={() => onToggleFavorite(fav)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-[#c8dece] bg-transparent text-xl font-black text-[#6b8c72] transition-all hover:border-[#e8a020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a4d2e]"
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
