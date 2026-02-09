
import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-16 max-w-[1800px] mx-auto space-y-12">
      {/* Utility Buttons */}
      <div className="flex flex-wrap justify-end gap-4 -mb-4">
        <button 
          onClick={() => setIsHomepageOpen(true)}
          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-6 py-3 rounded-full font-bold text-lg transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <span>🏠</span> Tee tästä aloitussivu
        </button>
        <button 
          onClick={() => setIsInfoOpen(true)}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-full font-bold text-lg transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <span>ℹ️</span> Tietoa sivustosta
        </button>
      </div>

      {/* Hero Section: Clock, Weather, and Assistant */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-12 border-b-2 border-slate-100">
        <div className="lg:col-span-4 flex flex-col justify-center">
          <Clock />
        </div>
        <div className="lg:col-span-3 flex items-center">
          <WeatherCard />
        </div>
        <div className="lg:col-span-5">
          <Assistant />
        </div>
      </header>

      {/* Main Content: Navigation Links */}
      <main className="space-y-12">
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">🚀</div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Mihin haluat mennä?</h2>
          </div>
          <QuickLinks onSelectCategory={setSelectedCategory} />
        </section>
      </main>

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

      {/* Footer Section */}
      <footer className="pt-16 pb-12 text-center space-y-8 border-t-2 border-slate-100">
        <div className="flex flex-col items-center gap-4">
          <p className="text-2xl text-slate-500 font-medium italic">Seniorin aloitussivu — Selkeys on välittämistä.</p>
          <p className="text-xl text-slate-400 font-medium">© 2026 — Suunniteltu suomalaisille senioreille.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
