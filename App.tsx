
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
import { isLinkVisible, useLinkVisibilityVersion } from './linkVisibility';
import { Shortcut, Favorite, LocalityInfo, LinkReportDraft } from './types';
import { mergeApprovedLinksIntoShortcuts } from './approvedLinks';
import { useApprovedLinkSuggestionsVersion } from './approvedLinks';
import { LanguageCode, LanguageProvider, LANGUAGES, useI18n } from './i18n';

const MIN_UI_SCALE = 50;
const MAX_UI_SCALE = 200;
const DEFAULT_UI_SCALE = 100;
const UI_SCALE_STEP = 10;
const BASE_UI_SCALE_MULTIPLIER = 0.9;
const SAVED_LOCALITY_KEY = 'locality';

interface UiVisibilityState {
  clock: boolean;
  regionalServices: boolean;
  regionalNews: boolean;
  weather: boolean;
  assistant: boolean;
  googleSearch: boolean;
}

const defaultUiVisibility: UiVisibilityState = {
  clock: true,
  regionalServices: true,
  regionalNews: true,
  weather: true,
  assistant: true,
  googleSearch: true,
};

interface LanguageFlagSelectorProps {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  label: string;
}

const LanguageFlagSelector: React.FC<LanguageFlagSelectorProps> = ({ language, setLanguage, label }) => (
  <div className="flex flex-wrap items-center gap-1 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-1 shadow-sm" role="group" aria-label={label}>
    {LANGUAGES.map((item) => {
      const isActive = item.code === language;
      return (
        <button
          key={item.code}
          type="button"
          onClick={() => setLanguage(item.code)}
          className={`${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'} flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-lg font-black transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300`}
          aria-label={`${label}: ${item.nativeName}`}
          aria-pressed={isActive}
          title={item.nativeName}
        >
          <span aria-hidden="true">{item.flag}</span>
        </button>
      );
    })}
  </div>
);

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
  useLinkVisibilityVersion();
  useApprovedLinkSuggestionsVersion();
  const openReportModal = useCallback((draft: LinkReportDraft) => setReportDraft(draft), []);
  const closeReportModal = useCallback(() => setReportDraft(null), []);
  const selectedShortcut = selectedCategory ? mergeApprovedLinksIntoShortcuts([selectedCategory])[0] ?? selectedCategory : null;
  const updateVisibility = useCallback((key: keyof UiVisibilityState, value: boolean) => {
    setUiVisibility(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-300 text-base overflow-x-auto">
      <div
        className="relative p-4 md:p-8 lg:p-12 max-w-[1900px] mx-auto space-y-12 transition-all duration-300"
        style={{ zoom: uiZoom }}
      >

        {/* Yläpalkki */}
        <nav className="relative flex flex-wrap items-center gap-3" aria-label={t('settings')}>
          <div className="flex items-center gap-2">
            <div className="flex items-stretch rounded-full bg-yellow-400 border-b-4 border-yellow-600 shadow-md overflow-hidden" role="group" aria-label={t('resetText')}>
              <button
                onClick={decreaseFont}
                disabled={uiScale === MIN_UI_SCALE}
                className="px-5 py-3 font-black text-xl hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-30 focus:ring-4 focus:ring-yellow-300 focus:outline-none"
                aria-label={t('decreaseText')}
              >
                A−
              </button>
              <span className="px-4 py-3 font-black text-lg border-x-2 border-yellow-600 flex items-center select-none" aria-live="polite">
                {uiScale}%
              </span>
              <button
                onClick={increaseFont}
                disabled={uiScale === MAX_UI_SCALE}
                className="px-5 py-3 font-black text-xl hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-30 focus:ring-4 focus:ring-yellow-300 focus:outline-none"
                aria-label={t('increaseText')}
              >
                A+
              </button>
            </div>
            {uiScale !== DEFAULT_UI_SCALE && (
              <button
                onClick={resetFont}
                className="bg-yellow-200 hover:bg-yellow-300 text-yellow-900 px-4 py-3 rounded-full font-black text-base transition-all active:scale-95 shadow-md border-b-4 border-yellow-500 focus:ring-4 focus:ring-yellow-300 whitespace-nowrap"
                aria-label={t('resetText')}
              >
                ↺ 100%
              </button>
            )}
          </div>

          <div className="flex-1 flex justify-center">
            <span className="text-sm font-black uppercase tracking-wide text-amber-700 dark:text-amber-300">
              {t('beta')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 ml-auto">
            <a
              href="./muutosloki.html"
              className="text-sm font-black text-indigo-700 dark:text-indigo-300 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('changelog')}
            </a>
            <a
              href="./linkit.html"
              className="text-sm font-black text-indigo-700 dark:text-indigo-300 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('linkList')}
            </a>
          </div>

          <button
            onClick={() => setIsHomepageOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-indigo-900 focus:ring-4 focus:ring-indigo-300"
          >
            🏠 {t('help')}
          </button>

          <button
            onClick={() => setIsInfoOpen(true)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-5 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-slate-400 focus:ring-4 focus:ring-slate-300"
          >
            ℹ️ {t('info')}
          </button>

          <button
            onClick={toggleDarkMode}
            className={`${isDarkMode ? 'bg-amber-100 text-amber-950' : 'bg-slate-900 text-white'} px-5 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md focus:ring-4 focus:ring-blue-300`}
            aria-label={isDarkMode ? t('lightTheme') : t('darkTheme')}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <LanguageFlagSelector language={language} setLanguage={setLanguage} label={t('language')} />

          <button
            type="button"
            onClick={() => setIsSettingsOpen(prev => !prev)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-5 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-slate-400 focus:ring-4 focus:ring-slate-300"
            aria-label={t('openSettings')}
            aria-expanded={isSettingsOpen}
            aria-haspopup="menu"
          >
            ⚙️
          </button>
        </nav>

        {isSettingsOpen && (
          <div
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
              >
                {t('close')}
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <span className="block font-black text-slate-700 dark:text-slate-200">{t('language')}</span>
              <LanguageFlagSelector language={language} setLanguage={setLanguage} label={t('language')} />
            </div>

            <div className="space-y-3">
              {[
                { key: 'clock', label: t('showClock') },
                { key: 'regionalServices', label: t('showRegionalServices') },
                { key: 'regionalNews', label: t('showNews') },
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

        <header className="animate-in">
          <div className="flex flex-col xl:flex-row gap-8 items-stretch">
            {uiVisibility.clock && (
              <div className="xl:flex-[1.2] flex flex-col justify-center">
                <Clock fontSizeStep={fontSizeStep} />
              </div>
            )}
            {uiVisibility.weather && (
              <div className="xl:flex-1">
                <WeatherCard onLocationResolved={updateLocality} />
              </div>
            )}
            {uiVisibility.assistant && (
              <div className="xl:flex-1">
                <Assistant />
              </div>
            )}
          </div>
        </header>

        <main className="space-y-10 animate-in [animation-delay:200ms]">
          {uiVisibility.googleSearch && <SearchBar fontSizeStep={fontSizeStep} />}
          {uiVisibility.regionalServices && (
            <RegionalServicesPanel
              locality={locality}
              fontSizeStep={fontSizeStep}
              onReportLink={openReportModal}
              showNews={uiVisibility.regionalNews}
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

        <footer className="pt-24 pb-12 border-t-2 border-slate-200 dark:border-slate-800 text-center space-y-8 opacity-80">
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
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            {t('footer')}
          </p>
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
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;

