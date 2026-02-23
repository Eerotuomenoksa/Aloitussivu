
import React, { useState, useCallback, useEffect } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import QuickLinks from './components/QuickLinks';
import Assistant from './components/Assistant';
import ProviderModal from './components/ProviderModal';
import InfoModal from './components/InfoModal';
import HomepageModal from './components/HomepageModal';
import SearchBar from './components/SearchBar';
import { Shortcut } from './types';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Shortcut | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHomepageOpen, setIsHomepageOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState(0); // 0, 1, 2, 3, 4

  // Päivitetään dark mode HTML-tagiin
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  
  const cycleFontSize = useCallback(() => {
    setFontSizeStep(prev => (prev + 1) % 5);
  }, []);

  const fontClasses = [
    'text-base',      // 100%
    'text-lg',        // 125%
    'text-xl',        // 150%
    'text-2xl',       // 175%
    'text-3xl'        // 200%
  ];

  const headingClasses = [
    'text-4xl md:text-6xl',
    'text-5xl md:text-7xl',
    'text-6xl md:text-8xl',
    'text-7xl md:text-9xl',
    'text-8xl md:text-[10rem]'
  ];

  const fontSizeLabels = ['100%', '125%', '150%', '175%', '200%'];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-300 ${fontClasses[fontSizeStep]}`}>
      <div className="p-4 md:p-8 lg:p-12 max-w-[1900px] mx-auto space-y-12">
        
        {/* Yläpalkki / Asetukset */}
        <nav className="flex flex-wrap justify-end gap-3" aria-label="Asetukset">
          <button 
            onClick={cycleFontSize}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-yellow-700 focus:ring-4 focus:ring-yellow-300 flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Koko: {fontSizeLabels[fontSizeStep]}</span>
          </button>

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
              <WeatherCard />
            </div>
            <div className="lg:col-span-4">
              <Assistant />
            </div>
          </div>
        </header>

        <main className="space-y-10 animate-in [animation-delay:200ms]">
          <SearchBar fontSizeStep={fontSizeStep} />

          <section className="space-y-8">
            <h2 className={`font-black text-slate-900 dark:text-white tracking-tighter transition-all duration-300 ${headingClasses[fontSizeStep]}`}>
              Valitse palvelu
            </h2>
            <QuickLinks onSelectCategory={setSelectedCategory} fontSizeStep={fontSizeStep} />
          </section>
        </main>

        <footer className="pt-24 pb-12 border-t-2 border-slate-200 dark:border-slate-800 text-center space-y-8 opacity-80">
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
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            © 2026 Seniorin aloitussivu — Selkeys on välittämistä.
          </p>
        </footer>

        <ProviderModal shortcut={selectedCategory} onClose={() => setSelectedCategory(null)} fontSizeStep={fontSizeStep} />
        <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} fontSizeStep={fontSizeStep} />
        <HomepageModal isOpen={isHomepageOpen} onClose={() => setIsHomepageOpen(false)} fontSizeStep={fontSizeStep} />
      </div>
    </div>
  );
};

export default App;
