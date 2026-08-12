
import React, { useCallback, useEffect, useState } from 'react';
import { SHORTCUTS } from '../constants';
import { getLocalizedShortcuts } from '../localServices';
import { filterVisibleShortcuts, useLinkVisibilityVersion } from '../linkVisibility';
import { Shortcut, Favorite, LocalityInfo, LinkReportDraft } from '../types';
import { mergeApprovedLinksIntoShortcuts, useApprovedLinkSuggestionsVersion } from '../approvedLinks';
import { useI18n } from '../i18n';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { shortcutGroups } from './shortcutGroups';
import { MicrophoneIcon, SearchIcon } from './icons/SearchIcons';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
  fontSizeStep?: number;
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  locality: LocalityInfo | null;
  onReportLink?: (draft: LinkReportDraft) => void;
  selectedThemeAnchors?: string[];
}

type LinkResult = { name: string; url: string; color: string; categoryName: string; categoryIcon: string; phone?: string; phoneUrl?: string };
type PhoneResult = { name: string; phone: string; phoneUrl?: string; color: string; categoryName: string; categoryIcon: string };
type CategoryResult = { shortcut: Shortcut; color: string };

const getPhoneHref = (phone?: string, phoneUrl?: string) => {
  if (phoneUrl) return phoneUrl;
  if (!phone) return undefined;
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
};

const rowColors = [
  'bg-[var(--theme-surface)]',
  'bg-[var(--theme-surface)]',
  'bg-[var(--theme-surface)]',
];

const QuickLinks: React.FC<QuickLinksProps> = ({
  onSelectCategory,
  fontSizeStep = 0,
  favorites,
  onToggleFavorite,
  locality,
  onReportLink,
  selectedThemeAnchors = [],
}) => {
  const { t, categoryName, language, speechLocale } = useI18n();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showAllThemes, setShowAllThemes] = useState(false);
  const setSpokenSearch = useCallback((text: string) => {
    setSearchInput(text);
    setSearch(text);
  }, []);
  const clearSearchBeforeListen = useCallback(() => {
    setSearchInput('');
    setSearch('');
  }, []);
  const { speechState, toggleListening } = useSpeechInput({
    locale: speechLocale,
    onResult: setSpokenSearch,
    clearBeforeListen: clearSearchBeforeListen,
  });

  const shortcuts = filterVisibleShortcuts(getLocalizedShortcuts(SHORTCUTS, locality, language));
  useLinkVisibilityVersion();
  useApprovedLinkSuggestionsVersion();
  const approvedShortcuts = mergeApprovedLinksIntoShortcuts(shortcuts);
  const sortedShortcuts = [...approvedShortcuts].sort((a, b) => categoryName(a.name).localeCompare(categoryName(b.name), 'fi'));
  const shortcutsByName = new Map(sortedShortcuts.map((shortcut) => [shortcut.name, shortcut]));
  const groupedShortcutNames = new Set(shortcutGroups.flatMap((group) => group.categories));
  const zoneGroups = shortcutGroups
    .map((group) => ({
      ...group,
      shortcuts: group.categories
        .map((name) => shortcutsByName.get(name))
        .filter((shortcut): shortcut is Shortcut => Boolean(shortcut)),
    }))
    .filter((group) => group.shortcuts.length > 0);
  const ungroupedShortcuts = sortedShortcuts.filter((shortcut) => !groupedShortcutNames.has(shortcut.name));
  const selectedThemeKey = selectedThemeAnchors.join('|');
  const selectedZoneGroups = selectedThemeAnchors
    .map((anchor) => zoneGroups.find((group) => group.anchor === anchor))
    .filter((group): group is (typeof zoneGroups)[number] => Boolean(group));
  const otherZoneGroups = zoneGroups.filter((group) => !selectedThemeAnchors.includes(group.anchor));
  const hasThemeSelection = selectedZoneGroups.length > 0;
  const displayedZoneGroups = hasThemeSelection
    ? (showAllThemes ? [...selectedZoneGroups, ...otherZoneGroups] : selectedZoneGroups)
    : zoneGroups;

  useEffect(() => {
    setShowAllThemes(false);
  }, [selectedThemeKey]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

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
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
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
  const matchedPhones: PhoneResult[] = [];
  const matchedCategoryNames = new Set<string>();
  const matchedLinkKeys = new Set<string>();
  const matchedPhoneKeys = new Set<string>();

  if (q) {
    sortedShortcuts.forEach((shortcut, idx) => {
      const color = rowColors[Math.floor(idx / 6) % rowColors.length];
      const translatedShortcutName = categoryName(shortcut.name);
      const categoryMatches = `${shortcut.name} ${translatedShortcutName}`.toLowerCase().includes(q);

      if (categoryMatches) {
        matchedCategories.push({ shortcut, color });
        matchedCategoryNames.add(shortcut.name);
      }

      if (shortcut.providers) {
        shortcut.providers.forEach(provider => {
          const providerSearchText = `${provider.name} ${provider.url ?? ''} ${provider.phone ?? ''}`.toLowerCase();
          const phoneDigits = provider.phone?.replace(/\D/g, '') ?? '';
          const queryDigits = q.replace(/\D/g, '');
          const providerMatches = providerSearchText.includes(q);
          const phoneMatches = Boolean(provider.phone) && queryDigits.length >= 3 && phoneDigits.includes(queryDigits);
          const shouldShowAsPhone = Boolean(provider.phone) && (phoneMatches || (providerMatches && shortcut.name === 'Puhelinnumerot'));

          if (providerMatches && !categoryMatches && !shouldShowAsPhone) {
            const linkKey = `${shortcut.name}:${provider.url}`;
            if (matchedLinkKeys.has(linkKey)) return;
            matchedLinkKeys.add(linkKey);
            matchedLinks.push({
              name: provider.name,
              url: provider.url,
              phone: provider.phone,
              phoneUrl: provider.phoneUrl,
              color,
              categoryName: shortcut.name,
              categoryIcon: shortcut.icon,
            });
          }

          if (shouldShowAsPhone && provider.phone && !categoryMatches) {
            const phoneKey = `${shortcut.name}:${provider.phone}:${provider.name}`;
            if (matchedPhoneKeys.has(phoneKey)) return;
            matchedPhoneKeys.add(phoneKey);
            matchedPhones.push({
              name: provider.name,
              phone: provider.phone,
              phoneUrl: provider.phoneUrl,
              color,
              categoryName: shortcut.name,
              categoryIcon: shortcut.icon,
            });
          }
        });
      }
    });

    shortcutGroups.forEach((group, idx) => {
      const translatedGroupName = categoryName(group.name);
      const groupMatches = `${group.name} ${translatedGroupName}`.toLowerCase().includes(q);
      if (!groupMatches) return;

      const color = rowColors[idx % rowColors.length];
      group.categories.forEach((name) => {
        const shortcut = shortcutsByName.get(name);
        if (!shortcut || matchedCategoryNames.has(shortcut.name)) return;
        matchedCategories.push({ shortcut, color });
        matchedCategoryNames.add(shortcut.name);
      });
    });
  }

  const hasResults = matchedCategories.length + matchedLinks.length + matchedPhones.length > 0;

  const baseCardStyles = (color: string) =>
    `${color} group bento-card-surface bento-stripe bento-shimmer relative overflow-hidden flex flex-col gap-2.5 rounded-[44px] border-[1.5px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-7 text-left text-[var(--theme-text)] shadow-[0_1px_4px_rgba(0,0,0,.06)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.004] hover:border-[var(--theme-border-strong)] hover:shadow-[0_6px_24px_rgba(0,0,0,.12)] focus-visible:outline-[2.5px] focus-visible:outline-[var(--theme-focus)] focus-visible:outline-offset-3 active:-translate-y-0.5 active:scale-100 min-h-[220px]`;

  return (
    <div className="space-y-8 animate-in">

      {/* Hakukenttä */}
      <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--theme-muted)]" aria-hidden="true">
            <SearchIcon className="h-7 w-7" />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setSearch('');
            }}
            placeholder={speechState === 'listening' ? t('listeningPlaceholder') : t('searchPlaceholder')}
            className={`w-full rounded-2xl border-2 bg-[var(--theme-surface)] py-4 pl-14 pr-14 font-normal text-[var(--theme-text)] placeholder:text-[var(--theme-muted)] transition-all focus:outline-none focus:ring-4
              ${speechState === 'listening'
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-[var(--theme-border)] focus:border-[var(--theme-gold)] focus:ring-[var(--theme-focus)]/30'
              } ${inputClasses[fontSizeStep]}`}
            aria-label={t('searchPlaceholder')}
            title="Etsi palveluita, kategorioita ja puhelinnumeroita tältä sivulta"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              title="Tyhjennä palveluhaku"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-[var(--theme-muted)] transition-colors hover:text-[var(--theme-text)]"
              aria-label={t('clearSearch')}
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-stretch gap-3">
          {speechState !== 'unsupported' && (
            <button
              type="button"
              onClick={toggleListening}
              title={speechState === 'listening' ? 'Lopeta puheentunnistus' : 'Hae palvelua puhumalla'}
              className={`flex min-h-14 min-w-14 items-center justify-center rounded-2xl border-2 transition-all focus:ring-4 focus:ring-red-300 focus:outline-none active:scale-95
                ${speechState === 'listening'
                  ? 'border-red-500 bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
                  : 'border-[var(--theme-border-strong)] bg-[var(--theme-surface)] text-[var(--theme-primary)] hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                }`}
              aria-label={speechState === 'listening' ? t('stopListening') : t('startListening')}
            >
              <MicrophoneIcon className="h-7 w-7" />
            </button>
          )}
          <button
            type="submit"
            className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--theme-primary)] px-6 py-3 text-lg font-semibold text-[var(--theme-primary-label)] shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-[.98] md:flex-none"
          >
            <SearchIcon className="h-6 w-6" />
            <span>{t('searchButton')}</span>
          </button>
        </div>
      </form>
      {speechState === 'listening' && (
        <p className={`flex items-center justify-center gap-2 text-center font-semibold text-red-500 animate-pulse ${subTextClasses[fontSizeStep]}`}>
          <MicrophoneIcon className="h-6 w-6" /> {t('listeningNow')}
        </p>
      )}

      {/* Hakutulokset */}
      {q ? (
        <>
          {!hasResults && (
            <p aria-live="polite" className={`py-12 text-center font-bold text-[var(--theme-muted)] ${inputClasses[fontSizeStep]}`}>
              {t('noResults')}
            </p>
          )}
          {hasResults && (
            <p className="sr-only" aria-live="polite">
              Hakutuloksia {matchedCategories.length + matchedLinks.length + matchedPhones.length}.
            </p>
          )}

          {matchedCategories.length > 0 && (
            <div className="space-y-3">
              <p className={`font-black uppercase tracking-widest text-[var(--theme-muted)] ${subTextClasses[fontSizeStep]}`}>
                {t('categories')}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
                {matchedCategories.map(({ shortcut, color }, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectCategory({ ...shortcut, color })}
                    title={`Avaa kategoria ${categoryName(shortcut.name)}`}
                    className={baseCardStyles(color)}
                    aria-label={`${t('openCategory')}: ${categoryName(shortcut.name)}`}
                  >
                  <span className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-pale)] text-3xl transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{shortcut.icon}</span>
                    <span className={`link-label-text min-w-0 max-w-full font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                      {categoryName(shortcut.name)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedLinks.length > 0 && (
            <div className="space-y-3">
              <p className={`font-black uppercase tracking-widest text-[var(--theme-muted)] ${subTextClasses[fontSizeStep]}`}>
                Verkkosivut
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
                {matchedLinks.map((link, idx) => {
                  const isFav = favorites.some(f => f.url === link.url);
                  const phoneHref = getPhoneHref(link.phone, link.phoneUrl);
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
                        title={`Avaa verkkosivu: ${link.name}`}
                        className={baseCardStyles(link.color)}
                        aria-label={`${t('goToSite')}: ${link.name}`}
                      >
                        <span className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-pale)] text-3xl transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{link.categoryIcon}</span>
                        <span className={`link-label-text min-w-0 max-w-full font-normal leading-snug transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                          {link.name}
                        </span>
                        <span className={`opacity-75 font-normal ${subTextClasses[fontSizeStep]}`}>
                          {categoryName(link.categoryName)}
                        </span>
                        {link.phone && phoneHref && (
                          <span className={`font-medium ${subTextClasses[fontSizeStep]}`}>
                            ☎ {link.phone}
                          </span>
                        )}
                      </a>
                      {onReportLink && (
                        <button
                        onClick={() => onReportLink({
                          name: link.name,
                          url: link.url,
                          category: link.categoryName,
                          source: 'QuickLinks',
                        })}
                        title={`Ilmoita ongelma linkissä: ${link.name}`}
                        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-surface)] text-xl text-[var(--theme-text)] opacity-0 shadow-md transition-all hover:bg-[var(--theme-pale)] focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 group-hover/link:opacity-100"
                        aria-label={`${t('reportLink')}: ${link.name}`}
                      >
                        !
                      </button>
                      )}
                      <button
                        onClick={() => onToggleFavorite(fav)}
                        title={isFav ? `Poista suosikeista: ${link.name}` : `Lisää suosikkeihin: ${link.name}`}
                        className={`absolute top-3 right-3 flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none
                          ${isFav
                            ? 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
                            : 'bg-[var(--theme-surface)] shadow-md hover:bg-[var(--theme-gold-pale)]'
                          } ${starClasses[fontSizeStep]}`}
                        aria-label={isFav ? `${t('removeFavorite')}: ${link.name}` : `${t('addFavorite')}: ${link.name}`}
                      >
                        {isFav ? '⭐' : '☆'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {matchedPhones.length > 0 && (
            <div className="space-y-3">
              <p className={`font-black uppercase tracking-widest text-[var(--theme-muted)] ${subTextClasses[fontSizeStep]}`}>
                Puhelinnumerot
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
                {matchedPhones.map((phone, idx) => {
                  const phoneHref = getPhoneHref(phone.phone, phone.phoneUrl);
                  return (
                    <a
                      key={idx}
                      href={phoneHref}
                      className={baseCardStyles(phone.color)}
                      aria-label={`Soita: ${phone.name}, ${phone.phone}`}
                    >
                      <span className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-pale)] text-3xl transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">☎</span>
                      <span className={`link-label-text min-w-0 max-w-full font-normal leading-snug transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                        {phone.name}
                      </span>
                      <span className={`font-medium ${subTextClasses[fontSizeStep]}`}>
                        {phone.phone}
                      </span>
                      <span className={`opacity-75 font-normal ${subTextClasses[fontSizeStep]}`}>
                        {categoryName(phone.categoryName)}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Värivyöhykkeet */
        <>
          <div className="space-y-8">
            {hasThemeSelection && (
              <div className="flex flex-col gap-3 rounded-[2rem] border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-black text-[var(--theme-text)]">
                    {showAllThemes ? 'Kaikki teemat näkyvät' : 'Sinulle valitut teemat'}
                  </p>
                  <p className="mt-1 font-bold text-[var(--theme-muted)]">
                    Palveluhaku etsii aina myös piilossa olevista teemoista.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllThemes((current) => !current)}
                  aria-expanded={showAllThemes}
                  className="min-h-12 shrink-0 rounded-full bg-[var(--theme-primary)] px-5 py-3 font-black text-[var(--theme-primary-label)] shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95"
                >
                  {showAllThemes ? 'Näytä vain valitut' : `Näytä kaikki ${zoneGroups.length} teemaa`}
                </button>
              </div>
            )}

            {displayedZoneGroups.map((group, idx) => (
              <section
                key={group.name}
                id={group.anchor}
                className={`zone ${group.zone}`}
                aria-labelledby={`shortcut-group-${idx}`}
              >
                <div className="zone-head">
                  <span className="zone-icon" aria-hidden="true">{group.icon}</span>
                  <div className="min-w-0">
                    <h3 id={`shortcut-group-${idx}`} className="font-display zone-title">
                      {categoryName(group.name)}
                    </h3>
                    <p className="zone-info">{t(group.descriptionKey)}</p>
                  </div>
                </div>

                <div className="zone-links-grid">
                  {group.shortcuts.map((shortcut) => {
                    const isCategory = !!shortcut.providers;
                    const label = categoryName(shortcut.name);
                    const content = (
                      <>
                        <span className="zone-link-icon" aria-hidden="true">{shortcut.icon || '🔗'}</span>
                        <span className="zone-link-label">{label}</span>
                        <span className="zone-link-arrow" aria-hidden="true">→</span>
                      </>
                    );

                    if (isCategory) {
                      return (
                        <button
                          key={shortcut.name}
                          type="button"
                          onClick={() => onSelectCategory({ ...shortcut, color: rowColors[0] })}
                          className="zone-link"
                          title={`Avaa kategoria ${label}`}
                          aria-label={`${t('openCategory')}: ${label}`}
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <a
                        key={shortcut.name}
                        href={shortcut.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="zone-link"
                        title={`Avaa verkkosivu: ${label}`}
                        aria-label={`${t('goToSite')}: ${label}`}
                      >
                        {content}
                      </a>
                    );
                  })}
                </div>
              </section>
            ))}

            {ungroupedShortcuts.length > 0 && (!hasThemeSelection || showAllThemes) && (
              <section className="zone zone-uutiset" aria-label={t('categories')}>
                <div className="zone-links-grid">
                  {ungroupedShortcuts.map((shortcut) => {
                    const label = categoryName(shortcut.name);
                    const content = (
                      <>
                        <span className="zone-link-icon" aria-hidden="true">{shortcut.icon || '🔗'}</span>
                        <span className="zone-link-label">{label}</span>
                        <span className="zone-link-arrow" aria-hidden="true">→</span>
                      </>
                    );
                    return shortcut.providers ? (
                      <button
                        key={shortcut.name}
                        type="button"
                        onClick={() => onSelectCategory({ ...shortcut, color: rowColors[0] })}
                        className="zone-link"
                        title={`Avaa kategoria ${label}`}
                        aria-label={`${t('openCategory')}: ${label}`}
                      >
                        {content}
                      </button>
                    ) : (
                      <a
                        key={shortcut.name}
                        href={shortcut.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="zone-link"
                        title={`Avaa verkkosivu: ${label}`}
                        aria-label={`${t('goToSite')}: ${label}`}
                      >
                        {content}
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuickLinks;

