
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

const MIN_UI_SCALE = 50;
const MAX_UI_SCALE = 200;
const DEFAULT_UI_SCALE = 100;
const UI_SCALE_STEP = 10;

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Shortcut | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHomepageOpen, setIsHomepageOpen] = useState(false);
  const [locality, setLocality] = useState<LocalityInfo | null>(null);
  const [reportDraft, setReportDraft] = useState<LinkReportDraft | null>(null);

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

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const decreaseFont = useCallback(() => setUiScale(prev => Math.max(MIN_UI_SCALE, prev - UI_SCALE_STEP)), []);
  const increaseFont = useCallback(() => setUiScale(prev => Math.min(MAX_UI_SCALE, prev + UI_SCALE_STEP)), []);
  const resetFont = useCallback(() => setUiScale(DEFAULT_UI_SCALE), []);
  const fontSizeStep = 0;
  const uiZoom = uiScale / 100;
  useLinkVisibilityVersion();
  const openReportModal = useCallback((draft: LinkReportDraft) => setReportDraft(draft), []);
  const closeReportModal = useCallback(() => setReportDraft(null), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-300 text-base overflow-x-auto">
      <div
        className="p-4 md:p-8 lg:p-12 max-w-[1900px] mx-auto space-y-12 transition-all duration-300"
        style={{ zoom: uiZoom }}
      >

        {/* Yläpalkki */}
        <nav className="flex flex-wrap justify-end gap-3" aria-label="Asetukset">

          {/* Tekstikoko: A− | nro | A+ sekä palautuspainike */}
          <div className="flex items-center gap-2">
            <div className="flex items-stretch rounded-full bg-yellow-400 border-b-4 border-yellow-600 shadow-md overflow-hidden" role="group" aria-label="Tekstikoko">
              <button
                onClick={decreaseFont}
                disabled={uiScale === MIN_UI_SCALE}
                className="px-5 py-3 font-black text-xl hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-30 focus:ring-4 focus:ring-yellow-300 focus:outline-none"
                aria-label="Pienennä tekstiä"
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
                aria-label="Suurenna tekstiä"
              >
                A+
              </button>
            </div>
            {uiScale !== DEFAULT_UI_SCALE && (
              <button
                onClick={resetFont}
                className="bg-yellow-200 hover:bg-yellow-300 text-yellow-900 px-4 py-3 rounded-full font-black text-base transition-all active:scale-95 shadow-md border-b-4 border-yellow-500 focus:ring-4 focus:ring-yellow-300 whitespace-nowrap"
                aria-label="Palauta normaali tekstikoko"
              >
                ↺ 100%
              </button>
            )}
          </div>

          <button
            onClick={() => setIsHomepageOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-indigo-900 focus:ring-4 focus:ring-indigo-300"
          >
            🏠 Ohje
          </button>

          <button
            onClick={() => setIsInfoOpen(true)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-slate-400 focus:ring-4 focus:ring-slate-300"
          >
            ℹ️ Tietoa
          </button>

          <button
            onClick={toggleDarkMode}
            className={`${isDarkMode ? 'bg-amber-100 text-amber-950' : 'bg-slate-900 text-white'} px-6 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md focus:ring-4 focus:ring-blue-300`}
            aria-label={isDarkMode ? 'Vaihda vaaleaan teemaan' : 'Vaihda tummaan teemaan'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </nav>

        <header className="animate-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <Clock fontSizeStep={fontSizeStep} />
            </div>
            <div className="lg:col-span-3">
              <WeatherCard onLocationResolved={setLocality} />
            </div>
            <div className="lg:col-span-4">
              <Assistant />
            </div>
          </div>
        </header>

        <main className="space-y-10 animate-in [animation-delay:200ms]">
          <SearchBar fontSizeStep={fontSizeStep} />
          <RegionalServicesPanel locality={locality} fontSizeStep={fontSizeStep} onReportLink={openReportModal} />

          <section className="space-y-8">
            <h2 className="font-black text-slate-900 dark:text-white tracking-tighter transition-all duration-300 text-4xl md:text-6xl">
              Valitse palvelu
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
            © 2026 Seniorin aloitussivu — Selkeys on välittämistä.
          </p>
        </footer>

        <ProviderModal
          shortcut={selectedCategory}
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

export default App;

