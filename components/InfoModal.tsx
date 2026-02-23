
import React from 'react';
import { SHORTCUTS } from '../constants';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSizeStep?: number;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, fontSizeStep = 0 }) => {
  const titleClasses = ['text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];
  const headerIconClasses = ['text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];
  const statClasses = ['text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];

  if (!isOpen) return null;

  const categoryStats = SHORTCUTS.map(shortcut => {
    let count = 0;
    if (shortcut.providers) {
      count = shortcut.providers.length;
    } else if (shortcut.url) {
      count = 1;
    }
    return { name: shortcut.name, count, icon: shortcut.icon };
  });

  const totalLinks = categoryStats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-200/60 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto text-slate-800">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-700 my-8">
        <div className="bg-slate-800 dark:bg-slate-950 p-8 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className={`transition-all duration-300 ${headerIconClasses[fontSizeStep]}`}>ℹ️</span>
            <h2 className={`font-bold transition-all duration-300 ${titleClasses[fontSizeStep]}`}>Tietoa ja Ohjeet</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-3xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 md:p-12 space-y-10 max-h-[75vh] overflow-y-auto">
          {/* Tekoälyohjeet */}
          <section className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-3xl border-4 border-purple-200 dark:border-purple-800/50 space-y-6">
            <h3 className="text-3xl font-black text-purple-900 dark:text-purple-300 flex items-center gap-3">
              <span>🤖</span> Tekoälyavustajan aktivointi
            </h3>
            <div className="space-y-4 text-xl leading-relaxed dark:text-slate-200 font-medium">
              <p>Avustaja vaatii toimiakseen <strong>API-avaimen</strong>. Se on maksuton ja helppo ottaa käyttöön:</p>
              <ol className="list-decimal ml-8 space-y-4">
                <li>Mene osoitteeseen <a href="https://aistudio.google.com/" target="_blank" className="text-purple-700 dark:text-purple-400 underline font-black">aistudio.google.com</a></li>
                <li>Luo uusi <strong>API Key</strong>.</li>
                <li>Aseta tämä avain sovelluksen ympäristömuuttujiin nimellä <code>API_KEY</code>.</li>
                <li>Kun avain on asetettu, voit keskustella avustajan kanssa klikkaamalla robotti-ikonia aloitussivulla.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl font-black dark:text-white underline decoration-blue-500 underline-offset-8">Mikä tämä on?</h3>
            <p className="text-xl leading-relaxed dark:text-slate-300">
              Seniorin aloitussivu on suunniteltu helpottamaan internetin käyttöä. Olemme koonneet 30 tärkeää kategoriaa ja satoja tarkistettuja linkkejä, jotta löydät etsimäsi yhdellä klikkauksella.
            </p>
          </section>

          <section className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border-2 border-blue-100 dark:border-blue-800/50 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                <span>📊</span> Sivuston laajuus
              </h3>
              <p className="text-2xl font-medium text-blue-900 dark:text-blue-100 leading-tight">
                Sivustolta löytyy yhteensä <span className={`font-black text-blue-600 dark:text-blue-400 inline-block px-2 transition-all duration-300 ${statClasses[fontSizeStep]}`}>{totalLinks}</span> tarkistettua linkkiä.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-black border-b-2 border-slate-100 dark:border-slate-700 pb-2 dark:text-white">Kaikki 30 kategoriaa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryStats.sort((a,b) => a.name.localeCompare(b.name)).map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/60 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{stat.name}</span>
                  </div>
                  <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600 font-bold text-blue-600 dark:text-blue-400">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-center sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="text-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-4"
          >
            Sulje ja palaa takaisin
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
