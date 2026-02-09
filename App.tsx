
import React, { useState, useCallback } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import QuickLinks from './components/QuickLinks';
import Assistant from './components/Assistant';
import ProviderModal from './components/ProviderModal';
import InfoModal from './components/InfoModal';
import HomepageModal from './components/HomepageModal';
import { Shortcut } from './types';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Shortcut | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHomepageOpen, setIsHomepageOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const toggleLargeFont = useCallback(() => setIsLargeFont(prev => !prev), []);

  return (
    <div className={`${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'} min-h-screen transition-colors duration-300 text-slate-900 dark:text-white ${isLargeFont ? 'text-2xl' : 'text-base'}`}>
      <div className="p-4 md:p-8 lg:p-12 max-w-[1800px] mx-auto space-y-12">
        
        {/* Yläpalkki / Asetukset */}
        <nav className="flex flex-wrap justify-end gap-3" aria-label="Asetukset">
          <button 
            onClick={toggleLargeFont}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-black text-lg transition-all active:scale-95 shadow-md border-b-4 border-yellow-700 focus:ring-4 focus:ring-yellow-300"
            aria-pressed={isLargeFont}
          >
            🔍 {isLargeFont ? 'Normaali teksti' : 'Suurempi teksti'}
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
            {isDarkMode ? '☀️ Vaalea' : '🌙 Tumma'}
          </button>
        </nav>

        <header className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <Clock />
            </div>
            <div className="lg:col-span-3">
              <WeatherCard />
            </div>
            <div className="lg:col-span-4">
              <Assistant />
            </div>
          </div>
        </header>

        <main className="space-y-16">
          <section className="space-y-8" aria-labelledby="links-heading">
            <h2 id="links-heading" className={`font-black text-slate-900 dark:text-white tracking-tighter ${isLargeFont ? 'text-7xl' : 'text-6xl'}`}>
              Mihin haluat mennä?
            </h2>
            <QuickLinks onSelectCategory={setSelectedCategory} isLargeFont={isLargeFont} />
          </section>
        </main>

        <footer className="pt-24 pb-12 border-t-2 border-slate-200 dark:border-slate-800 text-center space-y-8">
          <a 
            href="https://seniorsurf.fi/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-white p-6 rounded-3xl shadow-md border-2 border-slate-100 transition-transform hover:scale-105 focus:ring-4 focus:ring-blue-500"
            aria-label="Vieraile SeniorSurf-sivustolla"
          >
            <img 
              src="https://seniorsurf.fi/wp-content/uploads/2021/04/SeniorSurf_logo_RGB.png" 
              alt="SeniorSurf logo" 
              className="h-20 w-auto transition-all"
              loading="lazy"
            />
          </a>
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            © 2026 Seniorin aloitussivu — Selkeys on välittämistä.
          </p>
        </footer>

        <ProviderModal 
          shortcut={selectedCategory} 
          onClose={() => setSelectedCategory(null)} 
        />
        
        <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
        <HomepageModal isOpen={isHomepageOpen} onClose={() => setIsHomepageOpen(false)} />
      </div>
    </div>
  );
};

export default App;
