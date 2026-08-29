
import React, { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import ZoneToc from './components/ZoneToc';
import InterestThemeSelector from './components/InterestThemeSelector';
import SearchBar from './components/SearchBar';
import FloatingControls from './components/FloatingControls';
import FavoriteLinks from './components/FavoriteLinks';
import { LogoPhase, getLogoPhase } from './components/TimeAwareLogo';
import { isLinkVisible, useLinkVisibilityVersion } from './linkVisibility';
import { Shortcut, Favorite, LocalityInfo, LinkReportDraft } from './types';
import { mergeApprovedLinksIntoShortcuts } from './approvedLinks';
import { useApprovedLinkSuggestionsVersion } from './approvedLinks';
import { LanguageCode, LanguageProvider, LANGUAGES, useI18n } from './i18n';
import { getLocalizedPublicPageHref } from './publicPageLocalization';
import { normalizeInterestThemeAnchors } from './components/shortcutGroups';
import { defaultUiVisibility, UiVisibilityKey, UiVisibilityOption, UiVisibilityState } from './uiPreferences';
import { installUsageTracking, trackGuideStep } from './usageTracking';
// Valkoinen logo näytetään tummassa teemassa, värillinen vaaleassa.
import seniorSurfLogoTummaTeema from './assets/seniorsurf-logo-tumma-teema.png';
import seniorSurfLogoVaaleaTeema from './assets/seniorsurf-logo-vaalea-teema.png';

const ProviderModal = lazy(() => import('./components/ProviderModal'));
const InfoModal = lazy(() => import('./components/InfoModal'));
const HomepageModal = lazy(() => import('./components/HomepageModal'));
const LinkReportModal = lazy(() => import('./components/LinkReportModal'));
const FeedbackModal = lazy(() => import('./components/FeedbackModal'));
const OnboardingTour = lazy(() => import('./components/OnboardingTour'));
const RegionalServicesPanel = lazy(() => import('./components/RegionalServicesPanel'));
const ScamAlertsBanner = lazy(() => import('./components/ScamAlertsBanner'));
const QuickLinks = lazy(() => import('./components/QuickLinks'));

const LoadingMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="flex min-h-24 items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 font-bold text-[var(--theme-muted)]"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-atomic="true"
  >
    <span className="text-2xl" aria-hidden="true">⏳</span>
    <span>{children}</span>
  </div>
);

const ScamAlertsFallback = () => {
  const { t } = useI18n();
  return (
    <section className="zone zone-suosikit space-y-3 !border-[3px] !border-[var(--theme-gold)] !py-4" aria-labelledby="scam-alerts-loading-heading" data-tour="scam-alerts">
      <h3 id="scam-alerts-loading-heading" className="flex items-center gap-2 text-xl font-black text-[var(--theme-text)] md:text-2xl">
        <span aria-hidden="true">⚠️</span>
        {t('scamAlertsTitle')}
      </h3>
      <LoadingMessage>{t('scamAlertsLoading')}</LoadingMessage>
    </section>
  );
};

const RegionalServicesFallback = () => {
  const { t } = useI18n();
  return (
    <section id="lahellasi" className="zone zone-local space-y-3" aria-labelledby="regional-services-loading-heading">
      <h2 id="regional-services-loading-heading" className="font-display zone-title">
        <span aria-hidden="true">📍 </span>{t('nearYou')}
      </h2>
      <LoadingMessage>{t('regionalServicesLoading')}</LoadingMessage>
    </section>
  );
};

const QuickLinksFallback = () => {
  const { t } = useI18n();
  return <LoadingMessage>{t('serviceLinksLoading')}</LoadingMessage>;
};

const MIN_UI_SCALE = 50;
const MAX_UI_SCALE = 200;
const DEFAULT_UI_SCALE = 100;
const UI_SCALE_STEP = 10;
const BASE_UI_SCALE_MULTIPLIER = 1.25;
const SAVED_LOCALITY_KEY = 'locality';
const ONBOARDING_SEEN_KEY = 'onboardingSeen';
const SECONDARY_TIME_ZONE_KEY = 'secondaryTimeZone';
const THEME_KEY = 'colorTheme';
const CLOCK_MODE_KEY = 'clockMode';
const FAVORITES_KEY = 'favorites';
const INTEREST_THEMES_KEY = 'interestThemes';

const readLocalPreference = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeLocalPreference = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Local preferences must not prevent the page from working.
  }
};

type ColorTheme = 'vihrea' | 'violetti' | 'sininen' | 'oranssi';
type ClockMode = 'digital' | 'analog';

const THEMES: { id: ColorTheme; labelKey: 'themeGreen' | 'themeViolet' | 'themeBlue' | 'themeBrown'; primaryColor: string }[] = [
  { id: 'vihrea', labelKey: 'themeGreen', primaryColor: '#1c5235' },
  { id: 'violetti', labelKey: 'themeViolet', primaryColor: '#5c1a9e' },
  { id: 'sininen', labelKey: 'themeBlue', primaryColor: '#1a3a6a' },
  { id: 'oranssi', labelKey: 'themeBrown', primaryColor: '#8a3010' },
];

const SECONDARY_TIME_ZONE_OPTIONS = [
  { value: 'America/Los_Angeles', labels: { fi: 'Los Angeles', sv: 'Los Angeles', en: 'Los Angeles' } },
  { value: 'America/New_York', labels: { fi: 'New York', sv: 'New York', en: 'New York' } },
  { value: 'America/Toronto', labels: { fi: 'Ottawa', sv: 'Ottawa', en: 'Ottawa' } },
  { value: 'Atlantic/Canary', labels: { fi: 'Kanariansaaret', sv: 'Kanarieöarna', en: 'Canary Islands' } },
  { value: 'Europe/London', labels: { fi: 'Iso-Britannia', sv: 'Storbritannien', en: 'United Kingdom' } },
  { value: 'Europe/Stockholm', labels: { fi: 'Ruotsi', sv: 'Sverige', en: 'Sweden' } },
  { value: 'Europe/Kyiv', labels: { fi: 'Ukraina', sv: 'Ukraina', en: 'Ukraine' } },
  { value: 'Asia/Dubai', labels: { fi: 'Dubai', sv: 'Dubai', en: 'Dubai' } },
  { value: 'Asia/Bangkok', labels: { fi: 'Thaimaa', sv: 'Thailand', en: 'Thailand' } },
  { value: 'Australia/Sydney', labels: { fi: 'Sydney', sv: 'Sydney', en: 'Sydney' } },
];

const getUtcOffsetLabel = (timeZone: string, date = new Date()) => {
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? '';

  return offset.replace('GMT', 'UTC');
};

const formatTimeZoneLabel = (label: string, timeZone: string, template: string) => {
  const offset = getUtcOffsetLabel(timeZone);
  const winterOffset = getUtcOffsetLabel(timeZone, new Date('2026-01-15T12:00:00Z'));
  if (!offset) return label;
  return template
    .replace('{label}', label)
    .replace('{current}', offset)
    .replace('{winter}', winterOffset || offset);
};

const normalizeFavoriteUsageCount = (value: unknown) => (
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
);

const normalizeFavorite = (value: unknown): Favorite | null => {
  if (!value || typeof value !== 'object') return null;
  const favorite = value as Partial<Favorite>;
  if (
    typeof favorite.name !== 'string'
    || typeof favorite.url !== 'string'
    || typeof favorite.categoryName !== 'string'
    || typeof favorite.categoryIcon !== 'string'
    || typeof favorite.color !== 'string'
  ) {
    return null;
  }

  return {
    name: favorite.name,
    url: favorite.url,
    categoryName: favorite.categoryName,
    categoryIcon: favorite.categoryIcon,
    color: favorite.color,
    addedAt: typeof favorite.addedAt === 'string' ? favorite.addedAt : undefined,
    lastUsedAt: typeof favorite.lastUsedAt === 'string' ? favorite.lastUsedAt : undefined,
    usageCount: normalizeFavoriteUsageCount(favorite.usageCount),
  };
};

const readStoredFavorites = () => {
  try {
    const parsed = JSON.parse(readLocalPreference(FAVORITES_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeFavorite).filter((favorite): favorite is Favorite => Boolean(favorite)) : [];
  } catch {
    return [];
  }
};

const writeStoredFavorites = (favorites: Favorite[]) => {
  writeLocalPreference(FAVORITES_KEY, JSON.stringify(favorites));
};

const headerBackgrounds: Record<LogoPhase, { light: string; dark: string }> = {
  dawn: {
    light: 'linear-gradient(135deg, #173e5f 0%, #214f76 100%)',
    dark: 'linear-gradient(135deg, #214f76 0%, #2a638f 100%)',
  },
  day: {
    light: 'linear-gradient(135deg, #173e5f 0%, #214f76 100%)',
    dark: 'linear-gradient(135deg, #214f76 0%, #2a638f 100%)',
  },
  evening: {
    light: 'linear-gradient(135deg, #173e5f 0%, #214f76 100%)',
    dark: 'linear-gradient(135deg, #214f76 0%, #2a638f 100%)',
  },
  night: {
    light: 'linear-gradient(135deg, #173e5f 0%, #214f76 100%)',
    dark: 'linear-gradient(135deg, #214f76 0%, #2a638f 100%)',
  },
};

interface LanguageSelectorProps {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  label: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage, label }) => {
  const { t } = useI18n();
  const activeLanguage = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];

  return (
    <label
      className="relative inline-flex h-12 min-w-[4.75rem] items-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm focus-within:ring-2 focus-within:ring-[var(--theme-focus)] sm:min-w-[9.5rem] md:h-12"
      title={t('changeLanguage')}
    >
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none flex items-center gap-2 pl-4 pr-10 text-white">
        <span className="text-xl leading-none" aria-hidden="true">{activeLanguage.flag}</span>
        <span className="hidden sm:inline text-sm font-black">{activeLanguage.nativeName}</span>
      </span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full bg-transparent pl-4 pr-10 text-transparent outline-none"
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} className="bg-white text-slate-900">
            {item.flag} {item.nativeName}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 text-sm font-black text-white/70" aria-hidden="true">
        ▾
      </span>
    </label>
  );
};

const AppContent: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  const timeZoneLanguage = language === 'sv' || language === 'en' ? language : 'fi';
  const settingsButtonRef = React.useRef<HTMLButtonElement>(null);
  const settingsPanelRef = React.useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Shortcut | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHomepageOpen, setIsHomepageOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => readLocalPreference(ONBOARDING_SEEN_KEY) === 'true');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [locality, setLocality] = useState<LocalityInfo | null>(() => {
    try {
      const saved = readLocalPreference(SAVED_LOCALITY_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as Partial<LocalityInfo>;
      if (typeof parsed.municipality !== 'string' || typeof parsed.displayName !== 'string') return null;
      return {
        municipality: parsed.municipality,
        displayName: parsed.displayName,
        lat: typeof parsed.lat === 'number' ? parsed.lat : undefined,
        lon: typeof parsed.lon === 'number' ? parsed.lon : undefined,
        countryCode: typeof parsed.countryCode === 'string' ? parsed.countryCode : undefined,
        isInFinland: typeof parsed.isInFinland === 'boolean' ? parsed.isInFinland : undefined,
      };
    } catch {
      return null;
    }
  });
  const [reportDraft, setReportDraft] = useState<LinkReportDraft | null>(null);
  const [uiVisibility, setUiVisibility] = useState<UiVisibilityState>(() => {
    try {
      const saved = readLocalPreference('uiVisibility');
      if (!saved) return defaultUiVisibility;
      const parsed = JSON.parse(saved) as Partial<UiVisibilityState>;
      return { ...defaultUiVisibility, ...parsed };
    } catch {
      return defaultUiVisibility;
    }
  });
  const [interestThemeAnchors, setInterestThemeAnchors] = useState<string[]>(() => {
    try {
      return normalizeInterestThemeAnchors(JSON.parse(readLocalPreference(INTEREST_THEMES_KEY) ?? '[]'));
    } catch {
      return [];
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return readLocalPreference('isDarkMode') === 'true';
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const saved = readLocalPreference(THEME_KEY);
    return ['vihrea', 'violetti', 'sininen', 'oranssi'].includes(saved ?? '')
      ? saved as ColorTheme
      : 'vihrea';
  });

  const [uiScale, setUiScale] = useState(() => {
    const savedScale = parseInt(readLocalPreference('uiScale') ?? '', 10);
    if (!Number.isNaN(savedScale)) {
      return Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, savedScale));
    }

    const legacyStep = parseInt(readLocalPreference('fontSizeStep') ?? '0', 10);
    const legacyScale = [100, 125, 150, 175, 200][legacyStep] ?? DEFAULT_UI_SCALE;
    return legacyScale;
  });
  const [secondaryTimeZone, setSecondaryTimeZone] = useState(() => {
    const saved = readLocalPreference(SECONDARY_TIME_ZONE_KEY);
    return SECONDARY_TIME_ZONE_OPTIONS.some((option) => option.value === saved)
      ? saved
      : SECONDARY_TIME_ZONE_OPTIONS[0].value;
  });
  const [clockMode, setClockMode] = useState<ClockMode>(() => {
    const saved = readLocalPreference(CLOCK_MODE_KEY);
    return saved === 'analog' ? 'analog' : 'digital';
  });
  const [logoPhase, setLogoPhase] = useState<LogoPhase>(() => getLogoPhase(new Date()));

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    return readStoredFavorites();
  });

  const toggleFavorite = useCallback((fav: Favorite) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.url === fav.url);
      const next = exists
        ? prev.filter(f => f.url !== fav.url)
        : [...prev, { ...fav, addedAt: fav.addedAt ?? new Date().toISOString(), usageCount: normalizeFavoriteUsageCount(fav.usageCount) }];
      writeStoredFavorites(next);
      return next;
    });
  }, []);

  const markFavoriteUsed = useCallback((url: string) => {
    const openedAt = new Date().toISOString();
    setFavorites(prev => {
      let didUpdate = false;
      const next = prev.map((favorite) => {
        if (favorite.url !== url) return favorite;
        didUpdate = true;
        return {
          ...favorite,
          lastUsedAt: openedAt,
          usageCount: normalizeFavoriteUsageCount(favorite.usageCount) + 1,
        };
      });
      if (didUpdate) {
        writeStoredFavorites(next);
      }
      return didUpdate ? next : prev;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-vihrea', 'theme-violetti', 'theme-sininen', 'theme-oranssi');
    root.classList.toggle('dark', isDarkMode);
    root.classList.add(`theme-${colorTheme}`);
    writeLocalPreference(THEME_KEY, colorTheme);
    writeLocalPreference('isDarkMode', String(isDarkMode));
  }, [isDarkMode, colorTheme]);

  useEffect(() => {
    document.documentElement.style.fontSize = '100%';
    writeLocalPreference('uiScale', String(uiScale));
  }, [uiScale]);

  useEffect(() => {
    writeLocalPreference('uiVisibility', JSON.stringify(uiVisibility));
  }, [uiVisibility]);

  useEffect(() => {
    writeLocalPreference(INTEREST_THEMES_KEY, JSON.stringify(interestThemeAnchors));
  }, [interestThemeAnchors]);

  useEffect(() => {
    writeLocalPreference(SECONDARY_TIME_ZONE_KEY, secondaryTimeZone);
  }, [secondaryTimeZone]);

  useEffect(() => {
    writeLocalPreference(CLOCK_MODE_KEY, clockMode);
  }, [clockMode]);

  useEffect(() => {
    const interval = window.setInterval(() => setLogoPhase(getLogoPhase(new Date())), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
        window.requestAnimationFrame(() => settingsButtonRef.current?.focus());
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSettingsOpen]);

  // Asetukset-paneeli renderöidään portaalilla document.bodyyn, joten se on
  // DOM-järjestyksessä sivun lopussa. Ilman fokuksen siirtoa ja rajausta
  // näppäimistökäyttäjä joutuisi sarkaamaan koko sivun läpi päästäkseen
  // paneeliin. Fokus siirretään paneeliin avattaessa ja pidetään siellä;
  // Esc ja Sulje palauttavat fokuksen avauspainikkeeseen.
  useEffect(() => {
    if (!isSettingsOpen) return;
    const panel = settingsPanelRef.current;
    if (!panel) return;

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
      .filter(el => el.getClientRects().length > 0);

    const frame = window.requestAnimationFrame(() => {
      const [first] = getFocusable();
      (first ?? panel).focus();
    });

    const handleTabTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTabTrap, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleTabTrap, true);
    };
  }, [isSettingsOpen]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const decreaseFont = useCallback(() => setUiScale(prev => Math.max(MIN_UI_SCALE, prev - UI_SCALE_STEP)), []);
  const increaseFont = useCallback(() => setUiScale(prev => Math.min(MAX_UI_SCALE, prev + UI_SCALE_STEP)), []);
  const resetFont = useCallback(() => setUiScale(DEFAULT_UI_SCALE), []);
  const updateLocality = useCallback((nextLocality: LocalityInfo) => {
    setLocality(nextLocality);
    writeLocalPreference(SAVED_LOCALITY_KEY, JSON.stringify(nextLocality));
  }, []);
  const fontSizeStep = 0;
  const uiZoom = (uiScale * BASE_UI_SCALE_MULTIPLIER) / 100;
  const fullBleedWidth = `calc(100vw / ${uiZoom})`;
  useLinkVisibilityVersion();
  useApprovedLinkSuggestionsVersion();
  useEffect(() => {
    return installUsageTracking('etusivu');
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('feedback') !== '1') return;
    setIsFeedbackOpen(true);
    params.delete('feedback');
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, []);
  const openReportModal = useCallback((draft: LinkReportDraft) => setReportDraft(draft), []);
  const closeReportModal = useCallback(() => setReportDraft(null), []);
  const selectedShortcut = selectedCategory ? mergeApprovedLinksIntoShortcuts([selectedCategory])[0] ?? selectedCategory : null;
  const isFinnishLocality = locality?.isInFinland !== false;
  const regionalLocality = isFinnishLocality ? locality : null;
  const selectedSecondaryTimeZone = SECONDARY_TIME_ZONE_OPTIONS.find((option) => option.value === secondaryTimeZone) ?? SECONDARY_TIME_ZONE_OPTIONS[0];
  const isAnyModalOpen = Boolean(selectedShortcut || isInfoOpen || isHomepageOpen || isOnboardingOpen || isFeedbackOpen || reportDraft || isSettingsOpen);
  const shouldShowRegionalServices = uiVisibility.regionalServices && isFinnishLocality;
  const visibilityOptions: UiVisibilityOption[] = [
    { key: 'clock', label: t('showClock') },
    { key: 'secondaryClock', label: t('showSecondaryClock') },
    { key: 'regionalServices', label: t('showRegionalServices') },
    { key: 'regionalNews', label: t('showNews') },
    { key: 'scamAlerts', label: t('showScamAlerts') },
    { key: 'weather', label: t('showWeather') },
    { key: 'googleSearch', label: t('showGoogleSearch') },
  ];
  const updateVisibility = useCallback((key: UiVisibilityKey, value: boolean) => {
    setUiVisibility(prev => ({ ...prev, [key]: value }));
  }, []);
  const updateInterestThemes = useCallback((anchors: string[]) => {
    setInterestThemeAnchors(normalizeInterestThemeAnchors(anchors));
  }, []);
  const startOnboarding = useCallback(() => {
    setIsInfoOpen(false);
    setIsHomepageOpen(false);
    setIsOnboardingOpen(true);
  }, []);
  const completeOnboarding = useCallback(() => {
    writeLocalPreference(ONBOARDING_SEEN_KEY, 'true');
    setHasSeenOnboarding(true);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--theme-bg)] text-base text-[var(--theme-text)] transition-all duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-black focus:text-slate-950 focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]"
      >
        {t('skipToContent')}
      </a>
      <div
        className="relative p-3 md:p-10 lg:p-16 max-w-[1900px] mx-auto space-y-6 md:space-y-12 transition-all duration-300"
        style={{ zoom: uiZoom }}
      >

        <header
          className="aurora-grain relative left-1/2 -mt-3 w-screen -translate-x-1/2 overflow-visible text-white md:-mt-10 lg:-mt-16"
          style={{ background: 'var(--theme-header-bg)', paddingBottom: '5rem', width: fullBleedWidth }}
          role="banner"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: [
                'radial-gradient(ellipse 90% 120% at 0% 40%, var(--theme-header-from) 0%, transparent 55%)',
                'radial-gradient(ellipse 70% 100% at 100% 20%, var(--theme-header-mid) 0%, transparent 55%)',
                'radial-gradient(ellipse 60% 80% at 50% 100%, var(--theme-header-to) 0%, transparent 60%)',
                'radial-gradient(ellipse 50% 70% at 80% 60%, var(--theme-header-mid) 0%, transparent 50%)',
                'radial-gradient(ellipse 40% 60% at 25% 10%, color-mix(in srgb, var(--theme-gold) 8%, transparent) 0%, transparent 55%)',
                'radial-gradient(ellipse 30% 40% at 70% 5%, rgba(255,255,255,.05) 0%, transparent 50%)',
              ].join(', '),
              animation: 'aurora-shift 18s ease-in-out infinite alternate',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1]"
            style={{
              backgroundImage: [
                'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.18) 0%, transparent 100%)',
                'radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,.12) 0%, transparent 100%)',
                'radial-gradient(1.5px 1.5px at 80% 50%, rgba(255,255,255,.15) 0%, transparent 100%)',
                'radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,.10) 0%, transparent 100%)',
                'radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,.14) 0%, transparent 100%)',
              ].join(', '),
            }}
          />
          <div className="relative z-[5] mx-auto max-w-[1380px] px-5 pt-6 md:px-8">
            <nav className="mb-8 flex flex-wrap items-center gap-3 border-b border-white/[.08] pb-5 lg:mb-5 lg:flex-nowrap" aria-label={t('topArea')}>
              <div className="mr-auto flex flex-col gap-1">
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-none tracking-tight text-white">
                  {t('pageTitle')}
                </h1>
                <p className="text-[.95rem] font-bold text-white/80">
                  {t('pageTagline')}
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    trackGuideStep('opened');
                    setIsHomepageOpen(true);
                  }}
                  title={t('setHomepageAria')}
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-white/20 bg-[var(--theme-gold)] px-[1.1rem] py-[.55rem] text-[.95rem] font-extrabold text-[var(--theme-cta-label)] transition-all hover:bg-[var(--theme-gold-light)] active:scale-[.97] focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]"
                  aria-label={t('setHomepageAria')}
                >
                  <span aria-hidden="true">🏠</span>
                  <span className="hidden sm:inline">{t('setHomepageButton')}</span>
                  <span className="sm:hidden">{t('setHomepageButtonShort')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  title={t('feedbackPageTitle')}
                  className="inline-flex min-h-[2.75rem] items-center rounded-full border border-white/[.16] bg-white/[.09] px-[1.1rem] py-[.55rem] text-[.95rem] font-bold text-white/85 transition-all hover:bg-white/[.18] hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]"
                >
                  {t('feedbackButton')}
                </button>
                <LanguageSelector language={language} setLanguage={setLanguage} label={t('language')} />
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(true)}
                  title={t('infoButtonTitle')}
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-white/[.16] bg-white/[.09] px-[1.1rem] py-[.55rem] text-[.95rem] font-bold text-white/85 transition-all hover:bg-white/[.18] hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]"
                >
                  ℹ️ {t('info')}
                </button>
                <button
                  ref={settingsButtonRef}
                  type="button"
                  onClick={() => setIsSettingsOpen(prev => !prev)}
                  data-tour="settings"
                  title={t('openSettings')}
                  className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-white/[.16] bg-white/[.09] px-[1.1rem] py-[.55rem] text-[.95rem] font-bold text-white/85 transition-all hover:bg-white/[.18] hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]"
                  aria-label={t('openSettings')}
                  aria-expanded={isSettingsOpen}
                  aria-haspopup="dialog"
                  aria-controls={isSettingsOpen ? 'settings-panel' : undefined}
                >
                  ⚙️
                </button>
              </div>
            </nav>

            <div className="hero-launch-grid grid gap-4 pb-7 md:gap-5 lg:pb-3">
              {(uiVisibility.clock || uiVisibility.weather) && (
                <div className="hero-launch-info">
                  {uiVisibility.clock && (
                    <div className="flex flex-col gap-2 hero-clock-panel" data-tour="clock">
                      <Clock
                        fontSizeStep={fontSizeStep}
                        variant="aurora"
                        mode={clockMode}
                        secondaryClock={uiVisibility.secondaryClock ? {
                          label: selectedSecondaryTimeZone.labels[timeZoneLanguage],
                          timeZone: selectedSecondaryTimeZone.value,
                        } : undefined}
                      />
                      <p className="text-lg font-bold text-[var(--theme-gold-light)]">
                        {t(logoPhase === 'dawn' ? 'greetingMorning' : logoPhase === 'day' ? 'greetingDay' : 'greetingEvening')}
                      </p>
                    </div>
                  )}
                  {uiVisibility.weather && (
                    <div className="hero-launch-weather hero-chip min-w-0" data-tour="weather" role="region" aria-label={t('currentInfo')}>
                      <WeatherCard locality={regionalLocality} onLocationResolved={updateLocality} variant="chip" />
                    </div>
                  )}
                </div>
              )}
              {uiVisibility.googleSearch && (
                <div className="hero-launch-search" data-tour="google-search">
                  <SearchBar fontSizeStep={fontSizeStep} variant="aurora" />
                </div>
              )}
            </div>
          </div>
        </header>

        {isSettingsOpen && createPortal(
          <div
            id="settings-panel"
            ref={settingsPanelRef}
            tabIndex={-1}
              className="settings-panel-responsive fixed inset-x-3 top-3 z-[80] h-[75dvh] overflow-y-auto rounded-[2rem] border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_16px_64px_rgba(0,0,0,.18)] sm:inset-x-auto sm:right-4 sm:top-[5.5rem] sm:h-auto md:right-8 lg:right-12"
            style={{ '--settings-ui-zoom': uiZoom, zoom: uiZoom } as React.CSSProperties}
            role="dialog"
            aria-labelledby="settings-panel-title"
          >
            <div className="settings-panel-header mb-4 flex items-center justify-between gap-4">
              <h2 id="settings-panel-title" className="font-display font-bold text-[var(--theme-text)] text-xl">{t('settings')}</h2>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  window.requestAnimationFrame(() => settingsButtonRef.current?.focus());
                }}
                className="min-h-14 rounded-full bg-[var(--theme-pale)] px-5 py-3 text-sm font-black text-[var(--theme-primary)] hover:bg-[var(--theme-gold-pale)] md:min-h-12 md:px-4 md:py-2"
                aria-label={t('close')}
              >
                {t('close')}
              </button>
            </div>

            <div className="mb-4">
              <p className="mb-3 font-bold text-[var(--theme-text)]">{t('colorTheme')}</p>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setColorTheme(theme.id)}
                    aria-label={t(theme.labelKey)}
                    aria-pressed={colorTheme === theme.id}
                    className="relative flex min-h-[4.25rem] min-w-[4.25rem] flex-col items-center gap-1.5 rounded-[16px] p-1.5 text-center transition-all focus-visible:outline-[2.5px] focus-visible:outline-[var(--theme-gold-light)] focus-visible:outline-offset-3"
                  >
                    <span
                      className="relative block h-10 w-10 overflow-hidden rounded-[12px]"
                      style={{
                        backgroundColor: theme.primaryColor,
                        boxShadow: colorTheme === theme.id
                          ? `0 0 0 3px var(--theme-bg), 0 0 0 5px ${theme.primaryColor}`
                          : '0 2px 8px rgba(0,0,0,.2)',
                      }}
                      aria-hidden="true"
                    >
                      {colorTheme === theme.id && (
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="max-w-[3.6rem] text-[.65rem] font-bold leading-none text-[var(--theme-text-3)]">
                      {t(theme.labelKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
                type="button"
                onClick={toggleDarkMode}
                title={isDarkMode ? t('lightTheme') : t('darkTheme')}
                className="mb-4 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-[var(--theme-border)] px-4 py-3 text-left font-bold text-[var(--theme-text)] hover:bg-[var(--theme-pale)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40"
                aria-label={isDarkMode ? t('lightTheme') : t('darkTheme')}
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{isDarkMode ? t('lightTheme') : t('darkTheme')}</span>
              <span aria-hidden="true">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>

            <fieldset className="mb-4 min-w-0 rounded-2xl border-2 border-[var(--theme-border)] p-4">
              <legend className="px-1 font-black text-[var(--theme-text)]">{t('clockStyle')}</legend>
              <div className="settings-clock-grid mt-3 grid grid-cols-2 gap-2">
                {[
                  { value: 'digital' as ClockMode, label: t('clockDigital') },
                  { value: 'analog' as ClockMode, label: t('clockAnalog') },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setClockMode(option.value)}
                    aria-pressed={clockMode === option.value}
                    className={`${clockMode === option.value ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-label)]' : 'bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-pale)]'} min-h-12 rounded-2xl border-2 border-[var(--theme-border)] px-3 py-2 text-sm font-black transition-all`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mb-4 rounded-2xl border-2 border-[var(--theme-border)] p-4">
              <p className="mb-3 font-black text-[var(--theme-text)]">
                {t('textSize')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={decreaseFont}
                  disabled={uiScale <= MIN_UI_SCALE}
                  title={t('decreaseText')}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-primary)] text-lg font-black text-[var(--theme-primary-label)] shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95 disabled:opacity-40 md:h-12 md:w-12"
                  aria-label={`${t('decreaseText')} (${uiScale}%)`}
                >
                  A-
                </button>
                <span className="min-w-16 text-center text-lg font-black text-[var(--theme-text)]" aria-live="polite">
                  {uiScale}%
                </span>
                <button
                  type="button"
                  onClick={increaseFont}
                  disabled={uiScale >= MAX_UI_SCALE}
                  title={t('increaseText')}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-primary)] text-lg font-black text-[var(--theme-primary-label)] shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95 disabled:opacity-40 md:h-12 md:w-12"
                  aria-label={`${t('increaseText')} (${uiScale}%)`}
                >
                  A+
                </button>
                {uiScale !== DEFAULT_UI_SCALE && (
                  <button
                    type="button"
                    onClick={resetFont}
                    title={t('resetText')}
                    className="rounded-full bg-[var(--theme-gold)] px-4 py-3 text-sm font-black text-[var(--theme-cta-label)] shadow-md transition-all hover:bg-[var(--theme-gold-light)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95"
                    aria-label={t('resetText')}
                  >
                    100%
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <InterestThemeSelector
                selectedAnchors={interestThemeAnchors}
                onChange={updateInterestThemes}
                compact
              />
            </div>

            <div className="space-y-3">
              {visibilityOptions.map((item) => (
                <label key={item.key} className={`${item.className ?? 'flex'} flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[var(--theme-border)] px-4 py-3 cursor-pointer`}>
                  <span className="min-w-0 font-bold text-[var(--theme-text)] [overflow-wrap:anywhere]">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={uiVisibility[item.key]}
                    onChange={(event) => updateVisibility(item.key, event.target.checked)}
                    title={`${item.label}: ${t('toggleSectionVisibility')}`}
                    className="h-14 w-14 shrink-0 accent-[var(--theme-primary)] md:h-5 md:w-5"
                    aria-label={item.label}
                  />
                </label>
              ))}
            </div>

            {uiVisibility.secondaryClock && (
              <label className="mt-4 block rounded-2xl border-2 border-[var(--theme-border)] px-4 py-3">
                <span className="mb-2 block font-black text-[var(--theme-text)]">{t('secondaryClockTimezone')}</span>
                <select
                  value={secondaryTimeZone}
                  onChange={(event) => setSecondaryTimeZone(event.target.value)}
                  className="min-h-14 w-full rounded-2xl border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-base font-bold text-[var(--theme-text)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 md:min-h-12"
                >
                  {SECONDARY_TIME_ZONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {formatTimeZoneLabel(option.labels[timeZoneLanguage], option.value, t('timeZoneOffsetLabel'))}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>,
          document.body,
        )}

        <main id="main-content" className="space-y-10 animate-fade-up" style={{ animationDelay: '300ms', marginTop: '-3.5rem' }} tabIndex={-1}>
          <ZoneToc showLocal={shouldShowRegionalServices} selectedThemeAnchors={interestThemeAnchors} />

          {uiVisibility.scamAlerts && (
            <Suspense fallback={<ScamAlertsFallback />}>
              <ScamAlertsBanner compact framed />
            </Suspense>
          )}

          {favorites.length > 0 && (
            <div data-tour="favorites">
              <FavoriteLinks
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onFavoriteOpen={markFavoriteUsed}
                fontSizeStep={fontSizeStep}
              />
            </div>
          )}

          {shouldShowRegionalServices && (
            <div data-tour="regional-services">
              <Suspense fallback={<RegionalServicesFallback />}>
                <RegionalServicesPanel
                  locality={regionalLocality}
                  fontSizeStep={fontSizeStep}
                  onLocalitySelected={updateLocality}
                  onReportLink={openReportModal}
                  onSelectCategory={setSelectedCategory}
                  showNews={uiVisibility.regionalNews}
                />
              </Suspense>
            </div>
          )}

          <section className="space-y-8" data-tour="quick-links">
            <Suspense fallback={<QuickLinksFallback />}>
              <QuickLinks
                onSelectCategory={setSelectedCategory}
                fontSizeStep={fontSizeStep}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                locality={regionalLocality}
                onReportLink={openReportModal}
                selectedThemeAnchors={interestThemeAnchors}
              />
            </Suspense>
          </section>
        </main>

        <footer
          className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden text-[var(--theme-footer-text)]"
          style={{ width: fullBleedWidth, background: 'var(--theme-footer-bg)' }}
        >
          {isDarkMode && (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: [
                  'radial-gradient(ellipse 60% 80% at 15% 120%, var(--theme-primary) 0%, transparent 55%)',
                  'radial-gradient(ellipse 40% 60% at 85% -20%, color-mix(in srgb, var(--theme-gold) 12%, transparent) 0%, transparent 50%)',
                ].join(', '),
              }}
            />
          )}
          <div className="footer-inner-grid relative mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-10 px-6 pb-10 pt-8">
            <div>
              <p className="font-display text-2xl text-[var(--theme-footer-text)]">
                Seniorin aloitussivu
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--theme-footer-muted)]">
                {t('pageTagline')}
              </p>
              <p className="mt-3 max-w-[40ch] text-sm font-semibold leading-relaxed text-[var(--theme-footer-muted)]">
                {t('footerProvidedBy')}{' '}
                <a
                  href="https://vtkl.fi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('openVtklSite')}
                  className="font-normal text-[var(--theme-footer-text)] underline decoration-[var(--theme-footer-muted)] underline-offset-4 hover:decoration-[var(--theme-footer-text)]"
                >
                  {t('footerVtklLink')}
                </a>{' '}
                <a
                  href="https://seniorsurf.fi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('openSeniorSurfSite')}
                  className="font-normal text-[var(--theme-footer-text)] underline decoration-[var(--theme-footer-muted)] underline-offset-4 hover:decoration-[var(--theme-footer-text)]"
                >
                  {t('footerSeniorSurfLink')}
                </a>.
              </p>
              {isLinkVisible('https://seniorsurf.fi/') && (
                <a
                  href="https://seniorsurf.fi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block"
                  aria-label={t('seniorSurfLogoAlt')}
                >
                  <img
                    src={isDarkMode ? seniorSurfLogoTummaTeema : seniorSurfLogoVaaleaTeema}
                    alt={t('seniorSurfLogoAlt')}
                    width={2093}
                    height={1219}
                    className="h-20 w-auto opacity-90 transition-opacity hover:opacity-100"
                    loading="lazy"
                  />
                </a>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary)] px-5 py-2.5 text-sm font-black text-[var(--theme-primary-label)] shadow-[0_3px_0_rgba(0,0,0,.28)] hover:bg-[var(--theme-primary-mid)] focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)] active:translate-y-[2px] active:shadow-none"
                >
                  {t('feedbackPageTitle')}
                </button>
                <button
                  type="button"
                  onClick={() => openReportModal({ name: '', url: '', category: '', source: 'Footer' })}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--theme-gold)] px-5 py-2.5 text-sm font-black text-[var(--theme-cta-label)] shadow-[0_3px_0_rgba(0,0,0,.28)] hover:bg-[var(--theme-gold-light)] focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)] active:translate-y-[2px] active:shadow-none"
                >
                  {t('reportNewLink')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--theme-footer-border)] bg-[var(--theme-footer-chip)] px-5 py-2.5 text-sm font-black text-[var(--theme-footer-text)] hover:bg-[var(--theme-footer-chip-hover)] focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]"
                >
                  ℹ️ {t('info')}
                </button>
              </div>
            </div>

            <nav className="grid content-start gap-3" aria-label={t('footerLinks')}>
              <p className="text-[.7rem] font-black uppercase tracking-[.2em] text-[var(--theme-footer-muted)]">
                {t('footerNavSite')}
              </p>
              {[
                { href: getLocalizedPublicPageHref('linkit', language), label: t('linkList') },
                { href: getLocalizedPublicPageHref('tietosuoja', language), label: t('privacyNotice') },
                { href: getLocalizedPublicPageHref('saavutettavuus', language), label: t('accessibilityStatement') },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 border-t border-[var(--theme-footer-border)] px-6 py-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-xs font-semibold text-[var(--theme-footer-muted)]">
                Seniorin aloitussivu {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <p className="text-xs font-semibold text-[var(--theme-footer-muted)]">seniorsurf.fi/aloitus</p>
            </div>
          </div>
        </footer>

        <Suspense fallback={null}>
          {selectedShortcut && (
            <ProviderModal
              shortcut={selectedShortcut}
              onClose={() => setSelectedCategory(null)}
              fontSizeStep={fontSizeStep}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onReportLink={openReportModal}
              locality={regionalLocality}
            />
          )}
          {isInfoOpen && (
            <InfoModal
              isOpen={isInfoOpen}
              onClose={() => setIsInfoOpen(false)}
              fontSizeStep={fontSizeStep}
              showOnboardingOffer
              onStartOnboarding={startOnboarding}
            />
          )}
          {isHomepageOpen && (
            <HomepageModal
              isOpen={isHomepageOpen}
              onClose={() => setIsHomepageOpen(false)}
              fontSizeStep={fontSizeStep}
            />
          )}
          {isOnboardingOpen && (
            <OnboardingTour
              isOpen={isOnboardingOpen}
              onClose={() => setIsOnboardingOpen(false)}
              onComplete={completeOnboarding}
              selectedThemeAnchors={interestThemeAnchors}
              onSelectedThemeAnchorsChange={updateInterestThemes}
              uiVisibility={uiVisibility}
              visibilityOptions={visibilityOptions}
              onVisibilityChange={updateVisibility}
            />
          )}
          {reportDraft && <LinkReportModal draft={reportDraft} onClose={closeReportModal} />}
          {isFeedbackOpen && <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />}
        </Suspense>
      </div>
      <FloatingControls
        decreaseLabel={t('decreaseText')}
        increaseLabel={t('increaseText')}
        resetLabel={t('resetText')}
        backToTopLabel={t('backToTop')}
        onDecrease={decreaseFont}
        onIncrease={increaseFont}
        onReset={resetFont}
        canDecrease={uiScale > MIN_UI_SCALE}
        canIncrease={uiScale < MAX_UI_SCALE}
        showReset={uiScale !== DEFAULT_UI_SCALE}
        uiScale={uiScale}
        hidden={isAnyModalOpen}
      />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
