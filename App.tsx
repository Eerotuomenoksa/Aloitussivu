
import React, { useState } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import QuickLinks from './components/QuickLinks';
import Assistant from './components/Assistant';
import ProviderModal from './components/ProviderModal';
import InfoModal from './components/InfoModal';
import HomepageModal from './components/HomepageModal';
import { Shortcut } from './types';
import { QUOTES } from './constants';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Shortcut | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isHomepageOpen, setIsHomepageOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  // Get daily quote based on the current day
  const dailyQuote = QUOTES[new Date().getDate() - 1] || QUOTES[0];

  return (
    <div className={`${isDarkMode ? 'dark bg-slate-950' : 'bg-white'} min-h-screen transition-colors duration-300 text-black dark:text-white`}>
      <div className="p-4 md:p-8 lg:p-12 max-w-[1800px] mx-auto space-y-12">
        {/* Utility Buttons */}
        <div className="flex flex-wrap justify-end gap-3 -mb-2">
          <button 
            onClick={() => setIsLargeFont(!isLargeFont)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-full font-black text-lg transition-all active:scale-95 flex items-center gap-2 shadow-md border-2 border-yellow-600"
          >
            {isLargeFont ? <span>🔍 Normaali teksti</span> : <span>🔍➕ Suurenna tekstiä</span>}
          </button>

          <button 
            onClick={() => setIsHomepageOpen(true)}
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-950 px-5 py-2 rounded-full font-black text-lg transition-all active:scale-95 flex items-center gap-2 shadow-sm border-2 border-indigo-200"
          >
            <span>🏠</span> Asennus ohje
          </button>

          <button 
            onClick={() => setIsInfoOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-950 px-5 py-2 rounded-full font-black text-lg transition-all active:scale-95 flex items-center gap-2 shadow-sm border-2 border-slate-200"
          >
            <span>ℹ️</span> Tietoa
          </button>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`${isDarkMode ? 'bg-amber-100 text-amber-950 border-amber-200' : 'bg-black text-white border-black'} px-5 py-2 rounded-full font-black text-lg transition-all active:scale-95 flex items-center gap-2 shadow-md border-2`}
          >
            {isDarkMode ? <span>☀️ Vaalea teema</span> : <span>🌙 Tumma teema</span>}
          </button>
        </div>

        {/* Hero Section */}
        <header className="space-y-12 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
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

          {/* Daily Quote Section */}
          <div className="pt-4 overflow-hidden">
            <p className={`font-serif italic text-black dark:text-slate-100 leading-tight font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isLargeFont ? 'text-6xl' : 'text-5xl'}`}>
              "{dailyQuote}"
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className={`space-y-12 pt-12 ${isLargeFont ? 'text-xl' : ''}`}>
          <section className="space-y-10">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-3xl flex items-center justify-center text-5xl shadow-md border-4 border-blue-200 dark:border-blue-700">🚀</div>
              <h2 className={`font-black text-black dark:text-white tracking-tighter ${isLargeFont ? 'text-8xl' : 'text-7xl'}`}>
                Mihin haluat mennä?
              </h2>
            </div>
            <QuickLinks onSelectCategory={setSelectedCategory} isLargeFont={isLargeFont} />
          </section>
        </main>

        {/* Footer Section */}
        <footer className={`pt-24 pb-20 text-center space-y-12 border-t-8 border-slate-100 dark:border-slate-900 ${isLargeFont ? 'text-2xl' : ''}`}>
          <div className="flex flex-col items-center gap-10">
            <a 
              href="https://seniorsurf.fi/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-[2.5rem] shadow-2xl inline-block border-8 border-blue-50 transition-all hover:scale-105"
            >
              <img 
                src="https://seniorsurf.fi/wp-content/uploads/2021/04/SeniorSurf_logo_RGB.png" 
                alt="SeniorSurf - Vanhustyön keskusliitto" 
                className="h-20 md:h-24 w-auto object-contain"
                loading="eager"
              />
            </a>
            <div className="space-y-6 max-w-2xl">
              <p className={`text-black dark:text-white font-black italic leading-tight ${isLargeFont ? 'text-5xl' : 'text-4xl'}`}>
                Seniorin aloitussivu — Selkeys on välittämistä.
              </p>
              <p className={`text-black/60 dark:text-white/60 font-bold tracking-wide ${isLargeFont ? 'text-3xl' : 'text-2xl'}`}>
                © 2026 — Suunniteltu suomalaisille senioreille osana digitaalista osallisuutta.
              </p>
            </div>
          </div>
        </footer>

        {/* Overlays */}
        <ProviderModal 
          shortcut={selectedCategory} 
          onClose={() => setSelectedCategory(null)} 
        />
        
        <InfoModal 
          isOpen={isInfoOpen} 
          onClose={() => setIsInfoOpen(false)} 
        />

        <HomepageModal
          isOpen={isHomepageOpen}
          onClose={() => setIsHomepageOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;
