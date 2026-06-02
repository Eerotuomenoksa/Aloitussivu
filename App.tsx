
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
const THEME_KEY = 'colorTheme';

type ColorTheme = 'vihrea' | 'violetti' | 'sininen' | 'oranssi';

const THEMES: { id: ColorTheme; labelKey: 'themeGreen' | 'themeViolet' | 'themeBlue' | 'themeOrange'; shortLabel: string; swatch: string; accent: string }[] = [
  { id: 'vihrea', labelKey: 'themeGreen', shortLabel: 'Metsä', swatch: '#0f2318', accent: '#d4940a' },
  { id: 'violetti', labelKey: 'themeViolet', shortLabel: 'VTKL', swatch: '#2a0a52', accent: '#f49638' },
  { id: 'sininen', labelKey: 'themeBlue', shortLabel: 'Talvi', swatch: '#0e1f3b', accent: '#c8922a' },
  { id: 'oranssi', labelKey: 'themeOrange', shortLabel: 'Aurinko', swatch: '#4a1808', accent: '#28aa58' },
];

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
    <label className="relative inline-flex h-12 items-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm focus-within:ring-2 focus-within:ring-[#e8a020] md:h-12">
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
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return ['vihrea', 'violetti', 'sininen', 'oranssi'].includes(saved ?? '')
      ? saved as ColorTheme
      : 'vihrea';
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
    const root = document.documentElement;
    root.classList.remove('theme-vihrea', 'theme-violetti', 'theme-sininen', 'theme-oranssi');
    root.classList.toggle('dark', isDarkMode);
    root.classList.add(`theme-${colorTheme}`);
    localStorage.setItem(THEME_KEY, colorTheme);
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode, colorTheme]);

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
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-all duration-300 text-base overflow-x-auto">
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
                'radial-gradient(ellipse 40% 60% at 25% 10%, rgba(212,148,10,.08) 0%, transparent 55%)',
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
            <nav className="mb-8 flex flex-wrap items-center gap-4 border-b border-white/[.08] pb-5" aria-label={t('topArea')}>
              <div className="mr-auto flex flex-col gap-0.5">
                <p className="text-[.7rem] font-bold uppercase tracking-[.22em] text-[var(--theme-gold)] opacity-85">
                  Vanhustyön keskusliitto · SeniorSurf
                </p>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-none tracking-tight text-white">
                  {t('pageTitle')}
                </h1>
              </div>
              <span className="rounded-full border border-white/[.18] bg-white/10 px-3 py-1.5 text-[.7rem] font-bold uppercase tracking-[.12em] text-white/65">
                {t('beta')}
              </span>
              <LanguageSelector language={language} setLanguage={setLanguage} label={t('language')} />
              <button
                onClick={() => setIsHomepageOpen(true)}
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-white/20 bg-[var(--theme-gold)] px-[1.1rem] py-[.55rem] text-[.95rem] font-extrabold text-[var(--theme-cta-label)] transition-all hover:bg-[var(--theme-gold-light)] active:scale-[.97]"
                aria-label={t('openHomepageHelp')}
              >
                🏠 {t('help')}
              </button>
              <button
                ref={settingsButtonRef}
                type="button"
                onClick={() => setIsSettingsOpen(prev => !prev)}
                data-tour="settings"
                className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border border-white/[.16] bg-white/[.09] px-[1.1rem] py-[.55rem] text-[.95rem] font-bold text-white/85 transition-all hover:bg-white/[.18] hover:text-white"
                aria-label={t('openSettings')}
                aria-expanded={isSettingsOpen}
                aria-haspopup="dialog"
                aria-controls={isSettingsOpen ? 'settings-panel' : undefined}
              >
                ⚙️
              </button>
            </nav>

            <div className="hero-body-grid grid gap-8 pb-10" style={{ gridTemplateColumns: '1fr 1.4fr', alignItems: 'end' }}>
              {uiVisibility.clock && (
                <div className="flex flex-col gap-2 animate-rise" data-tour="clock">
                  <Clock
                    fontSizeStep={fontSizeStep}
                    variant="aurora"
                    secondaryClock={uiVisibility.secondaryClock ? {
                      label: selectedSecondaryTimeZone.label,
                      timeZone: selectedSecondaryTimeZone.value,
                    } : undefined}
                  />
                </div>
              )}
              <div className="flex flex-col gap-4 animate-rise" style={{ animationDelay: '120ms' }} data-tour="google-search">
                <p className="text-[.75rem] font-bold uppercase tracking-[.18em] text-white/35">
                  {t('searchLabel')}
                </p>
                {uiVisibility.googleSearch && (
                  <SearchBar fontSizeStep={fontSizeStep} variant="aurora" />
                )}
                <div className="glass-chip-row mt-3 flex flex-wrap gap-3.5" role="region" aria-label={t('currentInfo')}>
                  {uiVisibility.weather && (
                    <div className="min-w-[260px] flex-1">
                      <WeatherCard locality={regionalLocality} onLocationResolved={updateLocality} variant="aurora" />
                    </div>
                  )}
                  {uiVisibility.assistant && (
                    <div className="relative z-50 hidden min-w-[220px] flex-1 md:block" data-tour="assistant">
                      <Assistant variant="header" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 z-[4]"
            style={{
              height: '5rem',
              background: 'var(--theme-bg)',
              clipPath: 'ellipse(60% 100% at 50% 100%)',
            }}
          />
        </header>

        {isSettingsOpen && (
          <div
            id="settings-panel"
              className="absolute right-3 md:right-8 lg:right-12 top-[5.5rem] z-30 w-[min(24rem,calc(100vw-1.5rem))] rounded-[2rem] border-2 border-[rgba(28,82,53,.18)] bg-[var(--theme-surface)] p-5 shadow-[0_16px_64px_rgba(10,26,14,.18)]"
            role="dialog"
            aria-labelledby="settings-panel-title"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
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
                        background: `linear-gradient(135deg, ${theme.swatch} 0%, ${theme.accent} 100%)`,
                        boxShadow: colorTheme === theme.id
                          ? `0 0 0 3px var(--theme-bg), 0 0 0 5px ${theme.swatch}`
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
                      {theme.shortLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="mb-4 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-[var(--theme-border)] px-4 py-3 text-left font-bold text-[var(--theme-text)] hover:bg-[var(--theme-pale)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40"
              aria-label={isDarkMode ? t('lightTheme') : t('darkTheme')}
            >
              <span>{isDarkMode ? t('lightTheme') : t('darkTheme')}</span>
              <span aria-hidden="true">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>

            <div className="mb-4 rounded-2xl border-2 border-[var(--theme-border)] p-4">
              <p className="mb-3 font-black text-[var(--theme-text)]">
                {t('textSize')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={decreaseFont}
                  disabled={uiScale <= MIN_UI_SCALE}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-header-bg)] text-lg font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95 disabled:opacity-40 md:h-12 md:w-12"
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
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-header-bg)] text-lg font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95 disabled:opacity-40 md:h-12 md:w-12"
                  aria-label={`${t('increaseText')} (${uiScale}%)`}
                >
                  A+
                </button>
                {uiScale !== DEFAULT_UI_SCALE && (
                  <button
                    type="button"
                    onClick={resetFont}
                    className="rounded-full bg-[var(--theme-gold)] px-4 py-3 text-sm font-black text-[var(--theme-cta-label)] shadow-md transition-all hover:bg-[var(--theme-gold-light)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95"
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
                <label key={item.key} className={`${item.className ?? 'flex'} items-center justify-between gap-4 rounded-2xl border-2 border-[var(--theme-border)] px-4 py-3 cursor-pointer`}>
                  <span className="font-bold text-[var(--theme-text)]">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={uiVisibility[item.key as keyof UiVisibilityState]}
                    onChange={(event) => updateVisibility(item.key as keyof UiVisibilityState, event.target.checked)}
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
                      {formatTimeZoneLabel(option.label, option.value)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        <main id="main-content" className="space-y-10 animate-fade-up" style={{ animationDelay: '300ms' }} tabIndex={-1}>
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
            <h2 className="font-display mb-5 flex items-center gap-3 text-4xl font-semibold tracking-tight text-[var(--theme-text)] md:text-5xl">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-pale)] text-xl" aria-hidden="true">
                🌿
              </span>
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
          className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden text-white"
          style={{ width: fullBleedWidth, background: 'var(--theme-footer-bg)' }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: [
                'radial-gradient(ellipse 60% 80% at 15% 120%, var(--theme-primary) 0%, transparent 55%)',
                'radial-gradient(ellipse 40% 60% at 85% -20%, rgba(212,148,10,.12) 0%, transparent 50%)',
              ].join(', '),
            }}
          />
          <div
            aria-hidden="true"
            className="relative block h-10 w-full bg-[var(--theme-bg)]"
            style={{ clipPath: 'ellipse(55% 100% at 50% 0%)' }}
          />
          <div className="footer-inner-grid relative mx-auto grid w-full max-w-[1400px] grid-cols-3 gap-10 px-6 pb-10 pt-8">
            <div>
              <p className="font-display text-2xl text-white">
                SeniorSurf <span className="italic text-[var(--theme-gold-light)]">aloitussivu</span>
              </p>
              <p className="mt-3 max-w-[36ch] text-sm font-semibold leading-relaxed text-white/55">
                {t('footer')}
              </p>
              {isLinkVisible('https://seniorsurf.fi/') && isLinkVisible('https://seniorsurf.fi/wp-content/uploads/SeniorSurf_White-320-x-102-px.svg') && (
                <a
                  href="https://seniorsurf.fi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block"
                  aria-label={t('seniorSurfLogoAlt')}
                >
                  <img
                    src="https://seniorsurf.fi/wp-content/uploads/SeniorSurf_White-320-x-102-px.svg"
                    alt={t('seniorSurfLogoAlt')}
                    className="h-9 w-auto brightness-0 invert opacity-60 transition-opacity hover:opacity-90"
                    loading="lazy"
                  />
                </a>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openReportModal({ name: '', url: '', category: '', source: 'Footer' })}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--theme-gold)] px-5 py-2.5 text-sm font-black text-[var(--theme-cta-label)] shadow-[0_3px_0_rgba(0,0,0,.28)] hover:bg-[var(--theme-gold-light)] focus-visible:ring-2 focus-visible:ring-white active:translate-y-[2px] active:shadow-none"
                >
                  {t('reportNewLink')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-black text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                >
                  ℹ️ {t('info')}
                </button>
              </div>
            </div>

            <nav className="grid content-start gap-3" aria-label={t('footerLinks')}>
              <p className="text-[.7rem] font-black uppercase tracking-[.2em] text-white/35 sm:col-span-2">
                {t('footerNavSite')}
              </p>
              {[
                { href: './yllapito.html', label: t('admin') },
                { href: './muutosloki.html', label: t('changelog') },
                { href: './linkit.html', label: t('linkList') },
                { href: './tietosuoja.html', label: t('privacyNotice') },
                { href: './saavutettavuus.html', label: t('accessibilityStatement') },
                { href: './sivua-tukemassa.html', label: t('supporters') },
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
            <div className="content-start">
              <p className="mb-3 text-[.7rem] font-black uppercase tracking-[.2em] text-white/35">
                {t('footerNavLegal')}
              </p>
              <div className="grid gap-3">
                <a href="./tietosuoja.html" className="footer-link" target="_blank" rel="noopener noreferrer">{t('privacyNotice')}</a>
                <a href="./saavutettavuus.html" className="footer-link" target="_blank" rel="noopener noreferrer">{t('accessibilityStatement')}</a>
              </div>
            </div>
          </div>
          <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-3">
            <p className="text-xs font-semibold text-white/25">
              © SeniorSurf
            </p>
            <a
              href="./muutosloki.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black uppercase tracking-[.15em] text-white/25 no-underline hover:text-white/50"
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

