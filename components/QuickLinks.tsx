
import React, { useCallback, useState } from 'react';
import { SHORTCUTS } from '../constants';
import { getLocalizedShortcuts } from '../localServices';
import { filterVisibleShortcuts, useLinkVisibilityVersion } from '../linkVisibility';
import { Shortcut, Favorite, LocalityInfo, LinkReportDraft } from '../types';
import { mergeApprovedLinksIntoShortcuts, useApprovedLinkSuggestionsVersion } from '../approvedLinks';
import { useI18n } from '../i18n';
import { useSpeechInput } from '../hooks/useSpeechInput';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
  fontSizeStep?: number;
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  locality: LocalityInfo | null;
  onReportLink?: (draft: LinkReportDraft) => void;
}

type LinkResult = { name: string; url: string; color: string; categoryName: string; categoryIcon: string; phone?: string; phoneUrl?: string };
type PhoneResult = { name: string; phone: string; phoneUrl?: string; color: string; categoryName: string; categoryIcon: string };
type CategoryResult = { shortcut: Shortcut; color: string };
type ShortcutGroup = {
  name: string;
  icon: string;
  categories: string[];
};

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

const shortcutGroups: ShortcutGroup[] = [
  {
    name: 'Asiointi ja viranomaiset',
    icon: '🏛️',
    categories: ['Julkiset palvelut', 'Oikeus', 'Puhelinnumerot', 'Turvallisuus'],
  },
  {
    name: 'Raha ja ostaminen',
    icon: '🏦',
    categories: ['Pankit', 'Talous', 'Verkkokaupat', 'Ruoka'],
  },
  {
    name: 'Terveys ja hoiva',
    icon: '🏥',
    categories: ['Terveys', 'Potilasyhdistykset', 'Kotihoito-palvelut', 'Koti'],
  },
  {
    name: 'Digi ja yhteydenpito',
    icon: '💻',
    categories: ['Apua digiin', 'Hakukoneet', 'Sähköposti', 'Sosiaalinen media', 'Sovellukset', 'Tekniikka'],
  },
  {
    name: 'Uutiset ja tieto',
    icon: '📰',
    categories: ['Uutiset & Media', 'Lehdet', 'Sää', 'Tiede'],
  },
  {
    name: 'Kulttuuri ja taide',
    icon: '🎭',
    categories: ['Kulttuuri', 'Museot', 'Teatterit', 'Musiikki', 'Taiteet'],
  },
  {
    name: 'Lukeminen, kielet ja historia',
    icon: '📚',
    categories: ['Kirjallisuus', 'Kirjastot', 'Kielet', 'Sukututkimus'],
  },
  {
    name: 'Liikkuminen ja ulkoilu',
    icon: '🚌',
    categories: ['Liikenne', 'Matkailu', 'Liikunta', 'Luonto', 'Urheilu'],
  },
  {
    name: 'Vapaa-aika ja yhteisöt',
    icon: '🎈',
    categories: ['Vapaa-aika', 'Eläkeyhdistykset', 'Hengellisyys', 'Viihde'],
  },
];

const QuickLinks: React.FC<QuickLinksProps> = ({ onSelectCategory, fontSizeStep = 0, favorites, onToggleFavorite, locality, onReportLink }) => {
  const { t, categoryName, language, speechLocale } = useI18n();
  const [search, setSearch] = useState('');
  const setSpokenSearch = useCallback((text: string) => setSearch(text), []);
  const clearSearchBeforeListen = useCallback(() => setSearch(''), []);
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
  const groupedShortcuts = [
    ...shortcutGroups
      .map((group) => ({
        ...group,
        shortcuts: group.categories
          .map((name) => shortcutsByName.get(name))
          .filter((shortcut): shortcut is Shortcut => Boolean(shortcut)),
      }))
      .filter((group) => group.shortcuts.length > 0),
    ...sortedShortcuts
      .filter((shortcut) => !groupedShortcutNames.has(shortcut.name))
      .map((shortcut) => ({
        name: shortcut.name,
        icon: shortcut.icon,
        categories: [shortcut.name],
        shortcuts: [shortcut],
      })),
  ];
  const bentoGroups = [...groupedShortcuts].sort((a, b) => {
    const countDifference = b.shortcuts.length - a.shortcuts.length;
    if (countDifference !== 0) return countDifference;
    return categoryName(a.name).localeCompare(categoryName(b.name), 'fi');
  });
  const communityIndex = bentoGroups.findIndex((group) => group.name === 'Vapaa-aika ja yhteisöt');
  const publicServicesIndex = bentoGroups.findIndex((group) => group.name === 'Asiointi ja viranomaiset');
  if (communityIndex > -1 && publicServicesIndex > -1 && communityIndex > publicServicesIndex) {
    const [communityGroup] = bentoGroups.splice(communityIndex, 1);
    bentoGroups.splice(publicServicesIndex, 0, communityGroup);
  }

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

          if (providerMatches && !categoryMatches) {
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

          if (phoneMatches && provider.phone && !categoryMatches) {
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
    `${color} group bento-card-surface bento-stripe bento-shimmer relative overflow-hidden flex flex-col gap-2.5 rounded-[44px] border-[1.5px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-7 text-left text-[var(--theme-text)] shadow-[0_1px_4px_rgba(10,26,14,.06)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.004] hover:border-[var(--border-strong)] hover:shadow-[0_6px_24px_rgba(10,26,14,.12)] focus-visible:outline-[2.5px] focus-visible:outline-[var(--theme-focus)] focus-visible:outline-offset-3 active:-translate-y-0.5 active:scale-100 min-h-[220px]`;

  const groupCardStyles = (color: string, idx: number) =>
    `${color} bento-group-card group bento-card-surface bento-stripe bento-shimmer relative overflow-hidden flex h-full min-h-[220px] flex-col gap-5 rounded-[44px] border-[1.5px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-7 text-left text-[var(--theme-text)] shadow-[0_1px_4px_rgba(10,26,14,.06)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.004] hover:border-[var(--border-strong)] hover:shadow-[0_6px_24px_rgba(10,26,14,.12)] focus-within:outline-[2.5px] focus-within:outline-[var(--theme-focus)] focus-within:outline-offset-3 ${idx < 3 ? 'bento-wide col-span-2' : ''}`;

  return (
    <div className="space-y-8 animate-in">

      {/* Hakukenttä */}
      <div className="relative">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-[var(--theme-muted)]">🔎</span>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={speechState === 'listening' ? t('listeningPlaceholder') : t('searchPlaceholder')}
          className={`w-full rounded-full border-2 bg-[var(--theme-surface)] py-4 pl-14 font-bold text-[var(--theme-text)] placeholder:text-[var(--theme-muted)] transition-all focus:outline-none focus:ring-4
            ${speechState === 'listening'
              ? 'border-red-400 pr-28 focus:border-red-500 focus:ring-red-200'
              : 'border-[var(--theme-border)] pr-24 focus:border-[var(--theme-gold)] focus:ring-[var(--theme-focus)]/30'
            } ${inputClasses[fontSizeStep]}`}
          aria-label={t('searchPlaceholder')}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-2xl font-black text-[var(--theme-muted)] transition-colors hover:text-[var(--theme-text)]"
              aria-label={t('clearSearch')}
            >
              ✕
            </button>
          )}
          {speechState !== 'unsupported' && (
            <button
              onClick={toggleListening}
              className={`flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-red-300 focus:outline-none active:scale-95
                ${speechState === 'listening'
                  ? 'bg-red-500 text-white animate-pulse w-14 h-14 md:w-12 md:h-12 text-2xl shadow-lg shadow-red-300'
                  : 'bg-[var(--theme-pale)] hover:bg-red-100 text-[var(--theme-muted)] hover:text-red-600 w-14 h-14 md:w-12 md:h-12 text-2xl'
                }`}
              aria-label={speechState === 'listening' ? t('stopListening') : t('startListening')}
            >
              🎤
            </button>
          )}
        </div>
      </div>
      {speechState === 'listening' && (
        <p className={`text-red-500 font-bold text-center animate-pulse ${subTextClasses[fontSizeStep]}`}>
          🎤 {t('listeningNow')}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {matchedCategories.map(({ shortcut, color }, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectCategory({ ...shortcut, color })}
                    className={baseCardStyles(color)}
                    aria-label={`${t('openCategory')}: ${categoryName(shortcut.name)}`}
                  >
                  <span className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-pale)] text-3xl transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{shortcut.icon}</span>
                    <span className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
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
                        className={baseCardStyles(link.color)}
                        aria-label={`${t('goToSite')}: ${link.name}`}
                      >
                        <span className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-pale)] text-3xl transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{link.categoryIcon}</span>
                        <span className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                          {link.name}
                        </span>
                        <span className={`opacity-75 font-semibold ${subTextClasses[fontSizeStep]}`}>
                          {categoryName(link.categoryName)}
                        </span>
                        {link.phone && phoneHref && (
                          <span className={`font-black ${subTextClasses[fontSizeStep]}`}>
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
                        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-surface)] text-xl text-[var(--theme-text)] opacity-0 shadow-md transition-all hover:bg-[var(--theme-pale)] focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 group-hover/link:opacity-100"
                        aria-label={`${t('reportLink')}: ${link.name}`}
                      >
                        !
                      </button>
                      )}
                      <button
                        onClick={() => onToggleFavorite(fav)}
                        className={`absolute top-3 right-3 flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none
                          ${isFav
                            ? 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
                            : 'bg-[var(--theme-surface)] hover:bg-[var(--theme-gold-pale)] opacity-0 group-hover/link:opacity-100 focus:opacity-100'
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
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
                      <span className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                        {phone.name}
                      </span>
                      <span className={`font-black ${subTextClasses[fontSizeStep]}`}>
                        {phone.phone}
                      </span>
                      <span className={`opacity-75 font-semibold ${subTextClasses[fontSizeStep]}`}>
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
        /* Normaali kategoriaruudukko */
        <div className="bento-grid grid grid-cols-4 gap-4">
          {bentoGroups.map((group, idx) => {
            const color = rowColors[idx % rowColors.length];

            return (
              <section
                key={group.name}
                className={groupCardStyles(color, idx)}
                aria-labelledby={`shortcut-group-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-[3.25rem] w-[3.25rem] flex-shrink-0 items-center justify-center rounded-[18px] bg-[var(--theme-pale)] text-[1.6rem] transition-transform duration-200 group-hover:scale-[1.08] group-hover:rotate-[-2deg]" aria-hidden="true">
                    {group.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 id={`shortcut-group-${idx}`} className="font-display mt-auto min-w-0 max-w-full break-words text-[clamp(1.15rem,1.5vw,1.4rem)] font-semibold leading-[1.15] tracking-tight [overflow-wrap:anywhere]">
                      {categoryName(group.name)}
                    </h3>
                  </div>
                </div>

                <div className={`grid flex-1 content-start gap-3 ${idx < 3 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {group.shortcuts.map((shortcut) => {
                    const isCategory = !!shortcut.providers;
                    const label = categoryName(shortcut.name);
                    const subCategoryClasses = `mobile-subcategory flex min-h-14 min-w-0 items-center gap-2.5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 py-3 text-left font-black leading-tight text-[var(--theme-text)] break-words [overflow-wrap:anywhere] transition-all hover:-translate-y-0.5 hover:bg-[var(--theme-pale)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)] active:translate-y-0 ${subTextClasses[fontSizeStep]}`;
                    const content = (
                      <>
                        <span className="subcategory-icon flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--theme-pale)] text-xl leading-none" aria-hidden="true">
                          {shortcut.icon || '🔗'}
                        </span>
                        <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                          {label}
                        </span>
                      </>
                    );

                    if (isCategory) {
                      return (
                        <button
                          key={shortcut.name}
                          type="button"
                          onClick={() => onSelectCategory({ ...shortcut, color })}
                          className={subCategoryClasses}
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
                        className={subCategoryClasses}
                        aria-label={`${t('goToSite')}: ${label}`}
                      >
                        {content}
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickLinks;

