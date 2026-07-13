import React, { useEffect, useMemo, useState } from 'react';
import { Favorite } from '../types';
import { isLinkVisible } from '../linkVisibility';
import { useI18n } from '../i18n';

interface FavoriteLinksProps {
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  onFavoriteOpen: (url: string) => void;
  fontSizeStep?: number;
}

type FavoriteLayoutMode = 'mostUsed' | 'category';

type FavoriteViewItem = Favorite & {
  originalIndex: number;
  categoryLabel: string;
};

interface FavoriteGroup {
  key: string;
  label: string;
  icon: string;
  favorites: FavoriteViewItem[];
  usageTotal: number;
  lastUsedAt: number;
  firstIndex: number;
}

const FAVORITE_LAYOUT_MODE_KEY = 'favoriteLayoutMode';
const FAVORITE_COMPACT_THRESHOLD = 10;
const FAVORITE_GROUP_THRESHOLD = 20;

const isFavoriteLayoutMode = (value: string | null): value is FavoriteLayoutMode => (
  value === 'mostUsed' || value === 'category'
);

const getFavoriteUsageCount = (favorite: Favorite) => (
  typeof favorite.usageCount === 'number' && Number.isFinite(favorite.usageCount) ? favorite.usageCount : 0
);

const getFavoriteTime = (value?: string) => {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
};

const compareByUse = (a: FavoriteViewItem, b: FavoriteViewItem) => (
  getFavoriteUsageCount(b) - getFavoriteUsageCount(a)
  || getFavoriteTime(b.lastUsedAt) - getFavoriteTime(a.lastUsedAt)
  || a.originalIndex - b.originalIndex
);

const FavoriteLinks: React.FC<FavoriteLinksProps> = ({ favorites, onToggleFavorite, onFavoriteOpen, fontSizeStep = 0 }) => {
  const { t, categoryName } = useI18n();
  const [layoutMode, setLayoutMode] = useState<FavoriteLayoutMode>(() => {
    if (typeof localStorage === 'undefined') return 'category';
    const storedMode = localStorage.getItem(FAVORITE_LAYOUT_MODE_KEY);
    return isFavoriteLayoutMode(storedMode) ? storedMode : 'category';
  });
  const visibleFavorites = useMemo<FavoriteViewItem[]>(() => favorites
    .map((fav, originalIndex) => ({ ...fav, originalIndex, categoryLabel: categoryName(fav.categoryName) }))
    .filter((fav) => isLinkVisible(fav.url)), [categoryName, favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITE_LAYOUT_MODE_KEY, layoutMode);
    } catch {
      // The view mode is optional local UI state.
    }
  }, [layoutMode]);

  const isCompact = visibleFavorites.length > FAVORITE_COMPACT_THRESHOLD;
  const canChooseLayout = visibleFavorites.length > FAVORITE_COMPACT_THRESHOLD;
  const canGroupByCategory = visibleFavorites.length > FAVORITE_GROUP_THRESHOLD;
  const effectiveLayoutMode = canGroupByCategory ? layoutMode : 'mostUsed';

  const orderedFavorites = useMemo(() => {
    if (visibleFavorites.length <= FAVORITE_COMPACT_THRESHOLD) return visibleFavorites;
    return [...visibleFavorites].sort(compareByUse);
  }, [visibleFavorites]);

  const favoriteGroups = useMemo(() => {
    const groups = new Map<string, FavoriteGroup>();
    orderedFavorites.forEach((favorite) => {
      const key = favorite.categoryName;
      const usageCount = getFavoriteUsageCount(favorite);
      const lastUsedAt = getFavoriteTime(favorite.lastUsedAt);
      const existing = groups.get(key);
      if (existing) {
        existing.favorites.push(favorite);
        existing.usageTotal += usageCount;
        existing.lastUsedAt = Math.max(existing.lastUsedAt, lastUsedAt);
        existing.firstIndex = Math.min(existing.firstIndex, favorite.originalIndex);
        return;
      }

      groups.set(key, {
        key,
        label: favorite.categoryLabel,
        icon: favorite.categoryIcon,
        favorites: [favorite],
        usageTotal: usageCount,
        lastUsedAt,
        firstIndex: favorite.originalIndex,
      });
    });

    return [...groups.values()].sort((a, b) => (
      b.usageTotal - a.usageTotal
      || b.lastUsedAt - a.lastUsedAt
      || a.firstIndex - b.firstIndex
    ));
  }, [orderedFavorites]);

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
    `${isCompact ? 'px-4 py-2' : 'px-5 py-2.5'} inline-flex items-center gap-2 rounded-full border-2 border-[#e8a020] bg-[var(--theme-surface)] font-black text-[var(--theme-text)] shadow-[0_3px_0_#c27e10] transition-all duration-100 hover:-translate-y-0.5 hover:bg-[#fff0c0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a4d2e] active:translate-y-0 active:shadow-none dark:hover:bg-[#2a2010]`;

  const renderFavorite = (fav: FavoriteViewItem) => (
    <div key={fav.url} className="group/fav inline-flex items-center gap-2">
      <a
        href={fav.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onFavoriteOpen(fav.url)}
        className={`${basePillStyles} ${textClasses[fontSizeStep]}`}
        title={`Avaa suosikki: ${fav.name}`}
        aria-label={`${t('goToSite')}: ${fav.name}`}
      >
        <span aria-hidden="true">{fav.categoryIcon}</span>
        <span className="leading-tight">
          {fav.name}
        </span>
        {!isCompact && (
          <span className={`opacity-65 font-semibold ${subTextClasses[fontSizeStep]}`}>
            {fav.categoryLabel}
          </span>
        )}
      </a>
      <button
        onClick={() => onToggleFavorite(fav)}
        title={`Poista suosikeista: ${fav.name}`}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-[#c8dece] bg-transparent text-xl font-black text-[#6b8c72] transition-all hover:border-[#e8a020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a4d2e]"
        aria-label={`${t('removeFavorite')}: ${fav.name}`}
      >
        ⭐
      </button>
    </div>
  );

  return (
    <section className="zone zone-suosikit" aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className="font-display mb-1 flex items-center gap-3 text-2xl font-bold text-[var(--theme-text)] md:text-3xl">
        <span aria-hidden="true">⭐</span> {t('favoritesOwn')}
      </h2>
      <p className={`mb-4 text-[var(--theme-text-2)] ${subTextClasses[fontSizeStep]}`}>
        {visibleFavorites.length === 0 ? t('favoritesEmpty') : t('favoritesHint')}
      </p>
      {canChooseLayout && (
        <div className="mb-4 inline-flex flex-wrap items-center gap-1 rounded-full border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-1" role="group" aria-label={t('favoritesViewMode')}>
          <button
            type="button"
            onClick={() => setLayoutMode('mostUsed')}
            aria-pressed={effectiveLayoutMode === 'mostUsed'}
            className={`${effectiveLayoutMode === 'mostUsed' ? 'bg-[var(--theme-primary)] text-white' : 'text-[var(--theme-text)] hover:bg-[var(--theme-pale)]'} rounded-full px-4 py-2 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]`}
          >
            {t('favoritesMostUsed')}
          </button>
          {canGroupByCategory && (
            <button
              type="button"
              onClick={() => setLayoutMode('category')}
              aria-pressed={effectiveLayoutMode === 'category'}
              className={`${effectiveLayoutMode === 'category' ? 'bg-[var(--theme-primary)] text-white' : 'text-[var(--theme-text)] hover:bg-[var(--theme-pale)]'} rounded-full px-4 py-2 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]`}
            >
              {t('favoritesByCategory')}
            </button>
          )}
        </div>
      )}
      {effectiveLayoutMode === 'category' ? (
        <div className="space-y-5">
          {favoriteGroups.map((group) => (
            <section key={group.key} className="space-y-3" aria-labelledby={`favorite-group-${group.key.replace(/\W+/g, '-')}`}>
              <h3 id={`favorite-group-${group.key.replace(/\W+/g, '-')}`} className={`flex items-center gap-2 font-black text-[var(--theme-text)] ${subTextClasses[fontSizeStep]}`}>
                <span aria-hidden="true">{group.icon}</span>
                <span>{group.label}</span>
              </h3>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {group.favorites.map(renderFavorite)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 md:gap-4">
          {orderedFavorites.map(renderFavorite)}
        </div>
      )}
    </section>
  );
};

export default FavoriteLinks;
