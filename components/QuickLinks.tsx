
import React, { useState, useEffect, useRef } from 'react';
import { SHORTCUTS } from '../constants';
import { getLocalizedShortcuts } from '../localServices';
import { filterVisibleShortcuts, useLinkVisibilityVersion } from '../linkVisibility';
import { Shortcut, Favorite, LocalityInfo, LinkReportDraft } from '../types';
import { mergeApprovedLinksIntoShortcuts, useApprovedLinkSuggestionsVersion } from '../approvedLinks';
import { useI18n } from '../i18n';

type SpeechState = 'idle' | 'listening' | 'unsupported';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
  fontSizeStep?: number;
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  locality: LocalityInfo | null;
  onReportLink?: (draft: LinkReportDraft) => void;
}

type LinkResult = { name: string; url: string; color: string; categoryName: string; categoryIcon: string; phone?: string; phoneUrl?: string };
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
  'bg-[#214f76]',
  'bg-[#2a6387]',
  'bg-[#4fb8c3]',
  'bg-[#3aa9b5]',
  'bg-[#d09a32]',
  'bg-[#dcae55]',
  'bg-[#6bc7cf]',
];

const shortcutGroups: ShortcutGroup[] = [
  {
    name: 'Asiointi ja viranomaiset',
    icon: '🏛️',
    categories: ['Julkiset palvelut', 'Oikeus', 'Pankit', 'Talous', 'Puhelinnumerot'],
  },
  {
    name: 'Terveys ja apu',
    icon: '🏥',
    categories: ['Terveys', 'Potilasyhdistykset', 'Kotihoito-palvelut', 'Turvallisuus'],
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
    name: 'Kulttuuri',
    icon: '🎭',
    categories: ['Kulttuuri', 'Museot', 'Teatterit', 'Musiikki', 'Taiteet', 'Kirjallisuus', 'Kirjastot'],
  },
  {
    name: 'Liikkuminen ja matkailu',
    icon: '🚌',
    categories: ['Liikenne', 'Matkailu', 'Kielet'],
  },
  {
    name: 'Liikunta ja ulkoilu',
    icon: '🚶',
    categories: ['Liikunta', 'Luonto', 'Urheilu'],
  },
  {
    name: 'Koti ja arki',
    icon: '🏠',
    categories: ['Koti', 'Ruoka', 'Verkkokaupat', 'Viihde'],
  },
  {
    name: 'Harrastukset ja yhteisöt',
    icon: '🎈',
    categories: ['Vapaa-aika', 'Eläkeyhdistykset', 'Sukututkimus', 'Hengellisyys'],
  },
];

const QuickLinks: React.FC<QuickLinksProps> = ({ onSelectCategory, fontSizeStep = 0, favorites, onToggleFavorite, locality, onReportLink }) => {
  const { t, categoryName, language, speechLocale } = useI18n();
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
    r.lang = speechLocale;
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
  }, [speechLocale]);

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
  const matchedCategoryNames = new Set<string>();

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
          const providerSearchText = `${provider.name} ${provider.phone ?? ''}`.toLowerCase();
          if (providerSearchText.includes(q) && !categoryMatches) {
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

  const hasResults = matchedCategories.length + matchedLinks.length > 0;

  const baseCardStyles = (color: string) =>
    `${color} p-6 md:p-8 rounded-[2rem] shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40 focus:ring-4 focus:ring-blue-400 focus:outline-none flex flex-col items-center justify-center text-center gap-3 h-full min-h-[160px] md:min-h-[220px]`;

  const groupCardStyles = (color: string) =>
    `${color} rounded-[2rem] shadow-md text-white border-4 border-white/10 flex h-full min-h-[250px] flex-col gap-5 p-6 md:min-h-[310px] md:p-8`;

  return (
    <div className="space-y-8 animate-in">

      {/* Hakukenttä */}
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-2xl">🔎</span>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={speechState === 'listening' ? t('listeningPlaceholder') : t('searchPlaceholder')}
          className={`w-full pl-14 py-4 rounded-2xl border-4 transition-all font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4
            ${speechState === 'listening'
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900 pr-28'
              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900 pr-24'
            } ${inputClasses[fontSizeStep]}`}
          aria-label={t('searchPlaceholder')}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl font-black transition-colors"
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
                  ? 'bg-red-500 text-white animate-pulse w-12 h-12 text-2xl shadow-lg shadow-red-300'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-500 dark:text-slate-400 hover:text-red-600 w-12 h-12 text-2xl'
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
            <p className={`text-center text-slate-500 dark:text-slate-400 font-bold py-12 ${inputClasses[fontSizeStep]}`}>
              {t('noResults')}
            </p>
          )}

          {matchedCategories.length > 0 && (
            <div className="space-y-3">
              <p className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${subTextClasses[fontSizeStep]}`}>
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
                    <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{shortcut.icon}</span>
                    <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                      {categoryName(shortcut.name)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedLinks.length > 0 && (
            <div className="space-y-3">
              <p className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${subTextClasses[fontSizeStep]}`}>
                {t('links')}
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
                        <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{link.categoryIcon}</span>
                        <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
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
                        className="absolute bottom-3 right-3 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 text-white shadow-md transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none opacity-0 group-hover/link:opacity-100 w-10 h-10 text-xl"
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
                            : 'bg-white/30 hover:bg-yellow-100/80 opacity-0 group-hover/link:opacity-100'
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
        </>
      ) : (
        /* Normaali kategoriaruudukko */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 md:gap-7">
          {groupedShortcuts.map((group, idx) => {
            const color = rowColors[idx % rowColors.length];

            return (
              <section
                key={group.name}
                className={groupCardStyles(color)}
                aria-labelledby={`shortcut-group-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <span className={`shrink-0 transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">
                    {group.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 id={`shortcut-group-${idx}`} className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
                      {categoryName(group.name)}
                    </h3>
                  </div>
                </div>

                <div className="grid flex-1 content-start gap-3 sm:grid-cols-2">
                  {group.shortcuts.map((shortcut) => {
                    const isCategory = !!shortcut.providers;
                    const label = categoryName(shortcut.name);
                    const subCategoryClasses = `flex min-h-14 items-center justify-center rounded-2xl border-2 border-white/55 bg-white/20 px-4 py-3 text-center font-black leading-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_3px_0_rgba(15,23,42,0.22)] transition-all hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/60 active:translate-y-0 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_1px_0_rgba(15,23,42,0.25)] ${subTextClasses[fontSizeStep]}`;

                    if (isCategory) {
                      return (
                        <button
                          key={shortcut.name}
                          type="button"
                          onClick={() => onSelectCategory({ ...shortcut, color })}
                          className={subCategoryClasses}
                          aria-label={`${t('openCategory')}: ${label}`}
                        >
                          {label}
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
                        {label}
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

