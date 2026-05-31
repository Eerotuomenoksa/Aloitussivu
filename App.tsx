
import React, { useState, useCallback, useEffect } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import QuickLinks from './components/QuickLinks';
import Assistant from './components/Assistant';
import ProviderModal from './components/ProviderModal';
import InfoModal from './components/InfoModal';
import HomepageModal from './components/HomepageModal';
import LinkReportModal from './components/LinkReportModal';
import OnboardingTour from './components/OnboardingTour';
import SearchBar from './components/SearchBar';
import RegionalServicesPanel from './components/RegionalServicesPanel';
import FloatingControls from './components/FloatingControls';
import FavoriteLinks from './components/FavoriteLinks';
import TimeAwareLogo, { LogoPhase, getLogoPhase } from './components/TimeAwareLogo';
import { isLinkVisible, useLinkVisibilityVersion } from './linkVisibility';
import { Shortcut, Favorite, LocalityInfo, LinkReportDraft } from './types';
import { mergeApprovedLinksIntoShortcuts } from './approvedLinks';
import { useApprovedLinkSuggestionsVersion } from './approvedLinks';
import { LanguageCode, LanguageProvider, LANGUAGES, useI18n } from './i18n';
import { APP_VERSION_LABEL } from './appVersion';
import { installUsageTracking } from './usageTracking';

const MIN_UI_SCALE = 50;
const MAX_UI_SCALE = 200;
const DEFAULT_UI_SCALE = 100;
const UI_SCALE_STEP = 10;
const BASE_UI_SCALE_MULTIPLIER = 0.9;
const SAVED_LOCALITY_KEY = 'locality';
const ONBOARDING_SEEN_KEY = 'onboardingSeen';
const SECONDARY_TIME_ZONE_KEY = 'secondaryTimeZone';

const SECONDARY_TIME_ZONE_OPTIONS = [
  { value: 'America/Los_Angeles', label: 'Los Angeles' },
  { value: 'America/New_York', label: 'New York' },
  { value: 'America/Toronto', label: 'Ottawa' },
  { value: 'Atlantic/Canary', label: 'Kanariansaaret' },
  { value: 'Europe/London', label: 'Iso-Britannia' },
  { value: 'Europe/Stockholm', label: 'Ruotsi' },
  { value: 'Europe/Kyiv', label: 'Ukraina' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Bangkok', label: 'Thaimaa' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

const getUtcOffsetLabel = (timeZone: string, date = new Date()) => {
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? '';

  return offset.replace('GMT', 'UTC');
};

const formatTimeZoneLabel = (label: string, timeZone: string) => {
  const offset = getUtcOffsetLabel(timeZone);
  const winterOffset = getUtcOffsetLabel(timeZone, new Date('2026-01-15T12:00:00Z'));
  if (!offset) return label;
  return `${label} (${offset} nyt, talvella ${winterOffset || offset})`;
};

interface UiVisibilityState {
  clock: boolean;
  secondaryClock: boolean;
  regionalServices: boolean;
  regionalNews: boolean;
  scamAlerts: boolean;
  weather: boolean;
  assistant: boolean;
  googleSearch: boolean;
}

const defaultUiVisibility: UiVisibilityState = {
  clock: true,
  secondaryClock: false,
  regionalServices: true,
  regionalNews: true,
  scamAlerts: true,
  weather: true,
  assistant: true,
  googleSearch: true,
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
  const activeLanguage = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];

  return (
    <label className="relative inline-flex h-12 items-center rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus-within:ring-4 focus-within:ring-indigo-300 md:h-12">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none flex items-center gap-2 pl-4 pr-10 text-slate-900 dark:text-white">
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
      <span className="pointer-events-none absolute right-4 text-sm font-black text-slate-500 dark:text-slate-300" aria-hidden="true">
        ▾
      </span>
    </label>
  );
};

const AppContent: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  const settingsButtonRef = React.useRef<HTMLButtonElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Shortcut | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHomepageOpen, setIsHomepageOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => localStorage.getItem(ONBOARDING_SEEN_KEY) === 'true');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [locality, setLocality] = useState<LocalityInfo | null>(() => {
    try {
      const saved = localStorage.getItem(SAVED_LOCALITY_KEY);
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
      const saved = localStorage.getItem('uiVisibility');
      if (!saved) return defaultUiVisibility;
      const parsed = JSON.parse(saved) as Partial<UiVisibilityState>;
      return { ...defaultUiVisibility, ...parsed };
    } catch {
      return defaultUiVisibility;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('isDarkMode') === 'true';
  });

  const [uiScale, setUiScale] = useState(() => {
    const savedScale = parseInt(localStorage.getItem('uiScale') ?? '', 10);
    if (!Number.isNaN(savedScale)) {
      return Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, savedScale));
    }

    const legacyStep = parseInt(localStorage.getItem('fontSizeStep') ?? '0', 10);
    const legacyScale = [100, 125, 150, 175, 200][legacyStep] ?? DEFAULT_UI_SCALE;
    return legacyScale;
  });
  const [secondaryTimeZone, setSecondaryTimeZone] = useState(() => {
    const saved = localStorage.getItem(SECONDARY_TIME_ZONE_KEY);
    return SECONDARY_TIME_ZONE_OPTIONS.some((option) => option.value === saved)
      ? saved
      : SECONDARY_TIME_ZONE_OPTIONS[0].value;
  });
  const [logoPhase, setLogoPhase] = useState<LogoPhase>(() => getLogoPhase(new Date()));

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') ?? '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((fav: Favorite) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.url === fav.url);
      const next = exists ? prev.filter(f => f.url !== fav.url) : [...prev, fav];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = '100%';
    localStorage.setItem('uiScale', String(uiScale));
  }, [uiScale]);

  useEffect(() => {
    localStorage.setItem('uiVisibility', JSON.stringify(uiVisibility));
  }, [uiVisibility]);

  useEffect(() => {
    localStorage.setItem(SECONDARY_TIME_ZONE_KEY, secondaryTimeZone);
  }, [secondaryTimeZone]);

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

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const decreaseFont = useCallback(() => setUiScale(prev => Math.max(MIN_UI_SCALE, prev - UI_SCALE_STEP)), []);
  const increaseFont = useCallback(() => setUiScale(prev => Math.min(MAX_UI_SCALE, prev + UI_SCALE_STEP)), []);
  const resetFont = useCallback(() => setUiScale(DEFAULT_UI_SCALE), []);
  const updateLocality = useCallback((nextLocality: LocalityInfo) => {
    setLocality(nextLocality);
    localStorage.setItem(SAVED_LOCALITY_KEY, JSON.stringify(nextLocality));
  }, []);
  const fontSizeStep = 0;
  const uiZoom = (uiScale * BASE_UI_SCALE_MULTIPLIER) / 100;
  const fullBleedWidth = `calc(100vw / ${uiZoom})`;
  useLinkVisibilityVersion();
  useApprovedLinkSuggestionsVersion();
  useEffect(() => installUsageTracking('etusivu'), []);
  const openReportModal = useCallback((draft: LinkReportDraft) => setReportDraft(draft), []);
  const closeReportModal = useCallback(() => setReportDraft(null), []);
  const selectedShortcut = selectedCategory ? mergeApprovedLinksIntoShortcuts([selectedCategory])[0] ?? selectedCategory : null;
  const isFinnishLocality = locality?.isInFinland !== false;
  const regionalLocality = isFinnishLocality ? locality : null;
  const selectedSecondaryTimeZone = SECONDARY_TIME_ZONE_OPTIONS.find((option) => option.value === secondaryTimeZone) ?? SECONDARY_TIME_ZONE_OPTIONS[0];
  const isAnyModalOpen = Boolean(selectedShortcut || isInfoOpen || isHomepageOpen || isOnboardingOpen || reportDraft || isSettingsOpen);
  const updateVisibility = useCallback((key: keyof UiVisibilityState, value: boolean) => {
    setUiVisibility(prev => ({ ...prev, [key]: value }));
  }, []);
  const startOnboarding = useCallback(() => {
    setIsInfoOpen(false);
    setIsHomepageOpen(false);
    setIsOnboardingOpen(true);
  }, []);
  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setHasSeenOnboarding(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f1e8] dark:bg-slate-900 transition-all duration-300 text-base overflow-x-auto">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-black focus:text-slate-950 focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#d09a32]"
      >
        {t('skipToContent')}
      </a>
      <div
        className="relative p-3 md:p-10 lg:p-16 max-w-[1900px] mx-auto space-y-6 md:space-y-12 transition-all duration-300"
        style={{ zoom: uiZoom }}
      >

        <header
          className="relative z-20 left-1/2 -mt-3 w-screen -translate-x-1/2 overflow-visible text-white shadow-xl ring-1 ring-white/15 md:-mt-10 lg:-mt-16"
          style={{ background: headerBackgrounds[logoPhase][isDarkMode ? 'dark' : 'light'], width: fullBleedWidth }}
        >
          <div className="mx-auto w-full max-w-[1900px] px-3 py-3 md:px-10 md:py-8 lg:px-16">
          <h1 className="sr-only">{t('pageTitle')}</h1>
          <nav className="relative flex flex-wrap items-start gap-2 md:gap-5 xl:grid xl:grid-cols-[minmax(18rem,28rem)_minmax(0,46rem)_auto] xl:items-center" aria-label={t('topArea')}>
            <div className="hidden items-center md:flex md:min-w-[18rem]" data-tour="logo">
              <TimeAwareLogo phase={logoPhase} isDarkMode={isDarkMode} className="h-auto w-full max-w-[28rem] drop-shadow-lg" />
            </div>

            {(uiVisibility.assistant || uiVisibility.weather) && (
              <div className={`${uiVisibility.weather ? 'grid' : 'hidden md:grid'} min-w-[8.5rem] flex-1 basis-[8.5rem] gap-2 md:min-w-0 md:basis-auto md:gap-4 md:grid-cols-2 md:items-stretch xl:flex-none`}>
                {uiVisibility.assistant && (
                  <div className="relative z-50 hidden md:block" data-tour="assistant">
                    <Assistant variant="header" />
                  </div>
                )}
                {uiVisibility.weather && (
                  <div data-tour="weather">
                    <WeatherCard locality={regionalLocality} onLocationResolved={updateLocality} variant="compact" />
                  </div>
                )}
              </div>
            )}

            <div className="flex min-w-[9rem] flex-[2_1_9rem] flex-wrap items-center justify-end gap-2 md:gap-3 xl:flex-none xl:justify-end">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-800 ring-1 ring-white/50 md:px-4 md:py-2 md:text-sm">
                {t('beta')}
              </span>

              <button
                onClick={() => setIsHomepageOpen(true)}
                className="bg-white/95 hover:bg-white text-slate-950 px-4 py-2.5 rounded-full font-black text-base transition-all active:scale-95 shadow-md border-b-4 border-black/20 focus:ring-4 focus:ring-white/60 focus:outline-none md:px-5 md:py-3 md:text-lg"
                aria-label={t('openHomepageHelp')}
              >
                🏠 {t('help')}
              </button>

              <LanguageSelector language={language} setLanguage={setLanguage} label={t('language')} />

              <button
                ref={settingsButtonRef}
                type="button"
                onClick={() => setIsSettingsOpen(prev => !prev)}
                data-tour="settings"
                className="bg-white/95 hover:bg-white text-slate-950 px-4 py-2.5 rounded-full font-black text-base transition-all active:scale-95 shadow-md border-b-4 border-black/20 focus:ring-4 focus:ring-white/60 focus:outline-none md:px-5 md:py-3 md:text-lg"
                aria-label={t('openSettings')}
                aria-expanded={isSettingsOpen}
                aria-haspopup="dialog"
                aria-controls={isSettingsOpen ? 'settings-panel' : undefined}
              >
                ⚙️
              </button>
            </div>
          </nav>

          <div className="mt-3 grid gap-3 md:mt-8 md:gap-6 xl:grid-cols-[24rem_minmax(0,1fr)] xl:items-center">
            {uiVisibility.clock && (
              <div className={uiVisibility.secondaryClock ? 'block' : 'hidden md:block'}>
                <Clock
                  fontSizeStep={fontSizeStep}
                  variant="compact"
                  secondaryClock={uiVisibility.secondaryClock ? {
                    label: selectedSecondaryTimeZone.label,
                    timeZone: selectedSecondaryTimeZone.value,
                  } : undefined}
                />
              </div>
            )}
            {uiVisibility.googleSearch && (
              <div data-tour="google-search">
                <SearchBar fontSizeStep={fontSizeStep} variant="header" />
              </div>
            )}
          </div>
          </div>
        </header>

        {isSettingsOpen && (
          <div
            id="settings-panel"
              className="absolute right-3 md:right-8 lg:right-12 top-[5.5rem] z-30 w-[min(24rem,calc(100vw-1.5rem))] rounded-3xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-5"
            role="dialog"
            aria-labelledby="settings-panel-title"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 id="settings-panel-title" className="font-black text-slate-900 dark:text-white text-xl">{t('settings')}</h2>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  window.requestAnimationFrame(() => settingsButtonRef.current?.focus());
                }}
                className="min-h-14 rounded-full px-5 py-3 text-sm font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 md:min-h-12 md:px-4 md:py-2"
                aria-label={t('close')}
              >
                {t('close')}
              </button>
            </div>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="mb-4 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3 text-left font-black text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-300"
              aria-label={isDarkMode ? t('lightTheme') : t('darkTheme')}
            >
              <span>{isDarkMode ? t('lightTheme') : t('darkTheme')}</span>
              <span aria-hidden="true">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>

            <div className="mb-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-4">
              <p className="mb-3 font-black text-slate-900 dark:text-white">
                {t('textSize')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={decreaseFont}
                  disabled={uiScale <= MIN_UI_SCALE}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#173e5f] text-lg font-black text-white shadow-md transition-all hover:bg-[#214f76] focus:outline-none focus:ring-4 focus:ring-[#d09a32]/40 active:scale-95 disabled:opacity-40 md:h-12 md:w-12"
                  aria-label={`${t('decreaseText')} (${uiScale}%)`}
                >
                  A-
                </button>
                <span className="min-w-16 text-center text-lg font-black text-slate-800 dark:text-slate-100" aria-live="polite">
                  {uiScale}%
                </span>
                <button
                  type="button"
                  onClick={increaseFont}
                  disabled={uiScale >= MAX_UI_SCALE}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#173e5f] text-lg font-black text-white shadow-md transition-all hover:bg-[#214f76] focus:outline-none focus:ring-4 focus:ring-[#d09a32]/40 active:scale-95 disabled:opacity-40 md:h-12 md:w-12"
                  aria-label={`${t('increaseText')} (${uiScale}%)`}
                >
                  A+
                </button>
                {uiScale !== DEFAULT_UI_SCALE && (
                  <button
                    type="button"
                    onClick={resetFont}
                    className="rounded-full bg-[#d09a32] px-4 py-3 text-sm font-black text-slate-950 shadow-md transition-all hover:bg-[#e0aa43] focus:outline-none focus:ring-4 focus:ring-amber-200 active:scale-95"
                    aria-label={t('resetText')}
                  >
                    100%
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'clock', label: t('showClock') },
                { key: 'secondaryClock', label: t('showSecondaryClock') },
                { key: 'regionalServices', label: t('showRegionalServices') },
                { key: 'regionalNews', label: t('showNews') },
                { key: 'scamAlerts', label: t('showScamAlerts') },
                { key: 'weather', label: t('showWeather') },
                { key: 'assistant', label: t('showAssistant'), className: 'hidden md:flex' },
                { key: 'googleSearch', label: t('showGoogleSearch') },
              ].map((item) => (
                <label key={item.key} className={`${item.className ?? 'flex'} items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3 cursor-pointer`}>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={uiVisibility[item.key as keyof UiVisibilityState]}
                    onChange={(event) => updateVisibility(item.key as keyof UiVisibilityState, event.target.checked)}
                    className="h-14 w-14 shrink-0 accent-indigo-600 md:h-5 md:w-5"
                    aria-label={item.label}
                  />
                </label>
              ))}
            </div>

            {uiVisibility.secondaryClock && (
              <label className="mt-4 block rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3">
                <span className="mb-2 block font-black text-slate-900 dark:text-white">{t('secondaryClockTimezone')}</span>
                <select
                  value={secondaryTimeZone}
                  onChange={(event) => setSecondaryTimeZone(event.target.value)}
                  className="min-h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white md:min-h-12"
                >
                  {SECONDARY_TIME_ZONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {formatTimeZoneLabel(option.label, option.value)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        <main id="main-content" className="space-y-10 animate-in [animation-delay:200ms]" tabIndex={-1}>
          <div data-tour="favorites">
            <FavoriteLinks favorites={favorites} onToggleFavorite={toggleFavorite} fontSizeStep={fontSizeStep} />
          </div>

          {uiVisibility.regionalServices && isFinnishLocality && (
            <div data-tour="regional-services">
              <RegionalServicesPanel
                locality={regionalLocality}
                fontSizeStep={fontSizeStep}
                onLocalitySelected={updateLocality}
                onReportLink={openReportModal}
                showNews={uiVisibility.regionalNews}
                showScamAlerts={uiVisibility.scamAlerts}
              />
            </div>
          )}

          <section className="space-y-8" data-tour="quick-links">
            <h2 className="font-black text-slate-900 dark:text-white tracking-tighter transition-all duration-300 text-4xl md:text-6xl">
              {t('chooseService')}
            </h2>
            <QuickLinks
              onSelectCategory={setSelectedCategory}
              fontSizeStep={fontSizeStep}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              locality={regionalLocality}
              onReportLink={openReportModal}
            />
          </section>
        </main>

        <footer
          className="relative left-1/2 w-screen -translate-x-1/2 text-center text-white shadow-inner"
          style={{ background: headerBackgrounds[logoPhase][isDarkMode ? 'dark' : 'light'], width: fullBleedWidth }}
        >
          <div className="mx-auto w-full max-w-[1900px] space-y-8 px-6 py-12 md:px-10 lg:px-16">
          <div className="flex flex-wrap justify-center gap-5 md:gap-6">
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="rounded-full bg-white/95 px-6 py-3 text-base font-black text-slate-950 shadow-md border-b-4 border-black/20 transition-all hover:bg-white active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/60"
            >
              ℹ️ {t('info')}
            </button>
            <button
              type="button"
              onClick={() => openReportModal({ name: '', url: '', category: '', source: 'Footer' })}
              className="rounded-full bg-[#d09a32] px-6 py-3 text-base font-black text-slate-950 shadow-md border-b-4 border-[#8f651e] transition-all hover:bg-[#e2ad45] active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-200"
            >
              {t('reportNewLink')}
            </button>
          </div>
          <nav className="flex flex-wrap justify-center gap-4" aria-label={t('footerLinks')}>
            <a
              href="./yllapito.html"
              className="min-h-14 rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#173e5f] shadow-sm hover:bg-white hover:underline focus:outline-none focus:ring-4 focus:ring-white/60 md:min-h-12"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('admin')}
            </a>
            <a
              href="./muutosloki.html"
              className="min-h-14 rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#173e5f] shadow-sm hover:bg-white hover:underline focus:outline-none focus:ring-4 focus:ring-white/60 md:min-h-12"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('changelog')}
            </a>
            <a
              href="./linkit.html"
              className="min-h-14 rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#173e5f] shadow-sm hover:bg-white hover:underline focus:outline-none focus:ring-4 focus:ring-white/60 md:min-h-12"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('linkList')}
            </a>
            <a
              href="./sivua-tukemassa.html"
              className="min-h-14 rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#173e5f] shadow-sm hover:bg-white hover:underline focus:outline-none focus:ring-4 focus:ring-white/60 md:min-h-12"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('supporters')}
            </a>
          </nav>
          {isLinkVisible('https://seniorsurf.fi/') && isLinkVisible('https://seniorsurf.fi/wp-content/uploads/SeniorSurf_White-320-x-102-px.svg') && (
            <a
              href="https://seniorsurf.fi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block p-4 rounded-3xl transition-transform hover:scale-105"
              aria-label={t('seniorSurfLogoAlt')}
            >
              <img
                src="https://seniorsurf.fi/wp-content/uploads/SeniorSurf_White-320-x-102-px.svg"
                alt={t('seniorSurfLogoAlt')}
                className="h-16 w-auto brightness-0 dark:brightness-100"
                loading="lazy"
              />
            </a>
          )}
          <p className="font-bold text-white/80">
            {t('footer')}
          </p>
          <a
            href="./muutosloki.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 items-center rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.24em] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-white/60 md:min-h-12"
            aria-label={`${t('changelog')}: ${APP_VERSION_LABEL}`}
          >
            {APP_VERSION_LABEL}
          </a>
          </div>
        </footer>

        <ProviderModal
          shortcut={selectedShortcut}
          onClose={() => setSelectedCategory(null)}
          fontSizeStep={fontSizeStep}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onReportLink={openReportModal}
          locality={regionalLocality}
        />
        <InfoModal
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          fontSizeStep={fontSizeStep}
          showOnboardingOffer={!hasSeenOnboarding}
          onStartOnboarding={startOnboarding}
        />
        <HomepageModal
          isOpen={isHomepageOpen}
          onClose={() => setIsHomepageOpen(false)}
          fontSizeStep={fontSizeStep}
          onStartOnboarding={startOnboarding}
        />
        <OnboardingTour
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={completeOnboarding}
        />
        <LinkReportModal draft={reportDraft} onClose={closeReportModal} />
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

