
import React, { useState, useCallback, useEffect } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import QuickLinks from './components/QuickLinks';
import Assistant from './components/Assistant';
import ProviderModal from './components/ProviderModal';
import InfoModal from './components/InfoModal';
import HomepageModal from './components/HomepageModal';
import LinkReportModal from './components/LinkReportModal';
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

const MIN_UI_SCALE = 50;
const MAX_UI_SCALE = 200;
const DEFAULT_UI_SCALE = 100;
const UI_SCALE_STEP = 10;
const BASE_UI_SCALE_MULTIPLIER = 0.792;
const SAVED_LOCALITY_KEY = 'locality';

interface UiVisibilityState {
  clock: boolean;
  regionalServices: boolean;
  regionalNews: boolean;
  scamAlerts: boolean;
  weather: boolean;
  assistant: boolean;
  googleSearch: boolean;
}

const defaultUiVisibility: UiVisibilityState = {
  clock: true,
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
    dark: 'linear-gradient(135deg, #0f2942 0%, #173e5f 100%)',
  },
  day: {
    light: 'linear-gradient(135deg, #173e5f 0%, #214f76 100%)',
    dark: 'linear-gradient(135deg, #0f2942 0%, #173e5f 100%)',
  },
  evening: {
    light: 'linear-gradient(135deg, #173e5f 0%, #214f76 100%)',
    dark: 'linear-gradient(135deg, #0f2942 0%, #173e5f 100%)',
  },
  night: {
    light: 'linear-gradient(135deg, #173e5f 0%, #214f76 100%)',
    dark: 'linear-gradient(135deg, #0f2942 0%, #173e5f 100%)',
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
    <label className="relative inline-flex h-12 items-center rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus-within:ring-4 focus-within:ring-indigo-300">
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
  const [selectedCategory, setSelectedCategory] = useState<Shortcut | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHomepageOpen, setIsHomepageOpen] = useState(false);
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
    const interval = window.setInterval(() => setLogoPhase(getLogoPhase(new Date())), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSettingsOpen(false);
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
  const openReportModal = useCallback((draft: LinkReportDraft) => setReportDraft(draft), []);
  const closeReportModal = useCallback(() => setReportDraft(null), []);
  const selectedShortcut = selectedCategory ? mergeApprovedLinksIntoShortcuts([selectedCategory])[0] ?? selectedCategory : null;
  const updateVisibility = useCallback((key: keyof UiVisibilityState, value: boolean) => {
    setUiVisibility(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f1e8] dark:bg-slate-950 transition-all duration-300 text-base overflow-x-auto">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-black focus:text-slate-950 focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#d09a32]"
      >
        Siirry sisältöön
      </a>
      <div
        className="relative p-6 md:p-10 lg:p-16 max-w-[1900px] mx-auto space-y-12 transition-all duration-300"
        style={{ zoom: uiZoom }}
      >

        <header
          className="relative z-20 left-1/2 -mt-6 w-screen -translate-x-1/2 overflow-visible text-white shadow-xl ring-1 ring-white/15 md:-mt-10 lg:-mt-16"
          style={{ background: headerBackgrounds[logoPhase][isDarkMode ? 'dark' : 'light'], width: fullBleedWidth }}
        >
          <div className="mx-auto w-full max-w-[1900px] px-6 py-6 md:px-10 md:py-8 lg:px-16">
          <h1 className="sr-only">SeniorSurfin aloitussivu</h1>
          <nav className="relative grid gap-5 xl:grid-cols-[minmax(18rem,28rem)_minmax(0,46rem)_auto] xl:items-center" aria-label="Sivun yläosa">
            <div className="flex min-w-[18rem] items-center">
              <TimeAwareLogo phase={logoPhase} isDarkMode={isDarkMode} className="h-auto w-full max-w-[28rem] drop-shadow-lg" />
            </div>

            {(uiVisibility.assistant || uiVisibility.weather) && (
              <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
                {uiVisibility.assistant && (
                  <div className="relative z-50">
                    <Assistant variant="header" />
                  </div>
                )}
                {uiVisibility.weather && (
                  <WeatherCard onLocationResolved={updateLocality} variant="compact" />
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black uppercase tracking-wide text-amber-800 ring-1 ring-white/50">
                {t('beta')}
              </span>

              <button
                onClick={() => setIsHomepageOpen(true)}
                className="bg-white/95 hover:bg-white text-slate-950 px-5 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-black/20 focus:ring-4 focus:ring-white/60 focus:outline-none"
                aria-label="Avaa ohje aloitussivuksi asettamiseen"
              >
                🏠 {t('help')}
              </button>

              <LanguageSelector language={language} setLanguage={setLanguage} label={t('language')} />

              <button
                type="button"
                onClick={() => setIsSettingsOpen(prev => !prev)}
                className="bg-white/95 hover:bg-white text-slate-950 px-5 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-black/20 focus:ring-4 focus:ring-white/60 focus:outline-none"
                aria-label={t('openSettings')}
                aria-expanded={isSettingsOpen}
                aria-haspopup="menu"
                aria-controls="settings-menu"
              >
                ⚙️
              </button>
            </div>
          </nav>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-center">
            {uiVisibility.googleSearch && <SearchBar fontSizeStep={fontSizeStep} variant="header" />}
            {uiVisibility.clock && <Clock fontSizeStep={fontSizeStep} variant="compact" />}
          </div>
          </div>
        </header>

        {isSettingsOpen && (
          <div
            id="settings-menu"
            className="absolute right-4 md:right-8 lg:right-12 top-[5.5rem] z-30 w-[min(24rem,calc(100vw-2rem))] rounded-3xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-5"
            role="menu"
            aria-label={t('settings')}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-black text-slate-900 dark:text-white text-xl">{t('settings')}</h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-full px-3 py-2 text-sm font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
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

            <div className="space-y-3">
              {[
                { key: 'clock', label: t('showClock') },
                { key: 'regionalServices', label: t('showRegionalServices') },
                { key: 'regionalNews', label: t('showNews') },
                { key: 'scamAlerts', label: t('showScamAlerts') },
                { key: 'weather', label: t('showWeather') },
                { key: 'assistant', label: t('showAssistant') },
                { key: 'googleSearch', label: t('showGoogleSearch') },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3 cursor-pointer">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={uiVisibility[item.key as keyof UiVisibilityState]}
                    onChange={(event) => updateVisibility(item.key as keyof UiVisibilityState, event.target.checked)}
                    className="h-5 w-5 accent-indigo-600"
                    aria-label={item.label}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <main id="main-content" className="space-y-10 animate-in [animation-delay:200ms]" tabIndex={-1}>
          <FavoriteLinks favorites={favorites} onToggleFavorite={toggleFavorite} fontSizeStep={fontSizeStep} />

          {uiVisibility.regionalServices && (
            <RegionalServicesPanel
              locality={locality}
              fontSizeStep={fontSizeStep}
              onReportLink={openReportModal}
              showNews={uiVisibility.regionalNews}
              showScamAlerts={uiVisibility.scamAlerts}
            />
          )}

          <section className="space-y-8">
            <h2 className="font-black text-slate-900 dark:text-white tracking-tighter transition-all duration-300 text-4xl md:text-6xl">
              {t('chooseService')}
            </h2>
            <QuickLinks
              onSelectCategory={setSelectedCategory}
              fontSizeStep={fontSizeStep}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              locality={locality}
              onReportLink={openReportModal}
            />
          </section>
        </main>

        <footer
          className="relative left-1/2 w-screen -translate-x-1/2 text-center text-white shadow-inner"
          style={{ background: headerBackgrounds[logoPhase][isDarkMode ? 'dark' : 'light'], width: fullBleedWidth }}
        >
          <div className="mx-auto w-full max-w-[1900px] space-y-8 px-6 py-12 md:px-10 lg:px-16">
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
          <nav className="flex flex-wrap justify-center gap-4" aria-label="Alatunnisteen linkit">
            <a
              href="./yllapito.html"
              className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#173e5f] shadow-sm hover:bg-white hover:underline focus:outline-none focus:ring-4 focus:ring-white/60"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ylläpito
            </a>
            <a
              href="./muutosloki.html"
              className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#173e5f] shadow-sm hover:bg-white hover:underline focus:outline-none focus:ring-4 focus:ring-white/60"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('changelog')}
            </a>
            <a
              href="./linkit.html"
              className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#173e5f] shadow-sm hover:bg-white hover:underline focus:outline-none focus:ring-4 focus:ring-white/60"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('linkList')}
            </a>
          </nav>
          {isLinkVisible('https://seniorsurf.fi/') && isLinkVisible('https://seniorsurf.fi/wp-content/uploads/SeniorSurf_White-320-x-102-px.svg') && (
            <a
              href="https://seniorsurf.fi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block p-4 rounded-3xl transition-transform hover:scale-105"
            >
              <img
                src="https://seniorsurf.fi/wp-content/uploads/SeniorSurf_White-320-x-102-px.svg"
                alt="SeniorSurf logo"
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
            className="inline-block rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.24em] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-white/60"
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
        />
        <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} fontSizeStep={fontSizeStep} />
        <HomepageModal isOpen={isHomepageOpen} onClose={() => setIsHomepageOpen(false)} fontSizeStep={fontSizeStep} />
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

