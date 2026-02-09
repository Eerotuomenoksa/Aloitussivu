
import React from 'react';
import { SHORTCUTS } from '../constants';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Lasketaan linkkien määrät kategorioittain ja kokonaismäärä
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto text-slate-800">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8">
        <div className="bg-slate-800 p-8 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-5xl">ℹ️</span>
            <h2 className="text-3xl font-bold">Tietoa sivustosta</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-3xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 md:p-12 space-y-10 max-h-[75vh] overflow-y-auto">
          <section className="space-y-4">
            <h3 className="text-2xl font-black">Mikä on Seniorin aloitussivu?</h3>
            <p className="text-xl leading-relaxed">
              Seniorin aloitussivu on suunniteltu helpottamaan ikäihmisten internetin käyttöä kokoamalla tärkeimmät palvelut yhteen paikkaan selkeällä ja turvallisella tavalla.
            </p>
          </section>

          <section className="bg-blue-50 p-8 rounded-3xl border-2 border-blue-100 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2 mb-2">
                  <span>📊</span> Sivuston laajuus
                </h3>
                <p className="text-2xl font-medium text-blue-900 leading-tight">
                  Sivustolta löytyy yhteensä <span className="text-5xl font-black text-blue-600 inline-block px-2">{totalLinks}</span> tarkistettua linkkiä.
                </p>
              </div>
              <div className="text-blue-700/80 italic text-lg max-w-xs">
                Linkit on valittu ja tarkistettu huolellisesti helppokäyttöisyyden varmistamiseksi.
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-black border-b-2 border-slate-100 pb-2">Linkit kategorioittain</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-lg font-bold text-slate-700">{stat.name}</span>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-full border border-slate-200 font-bold text-blue-600">
                    {stat.count} {stat.count === 1 ? 'linkki' : 'linkkiä'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-4">
            <h3 className="text-2xl font-black">Miten sivustoa käytetään?</h3>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <p className="text-lg">Klikkaa suuria värikkäitä painikkeita siirtyäksesi eri kategorioihin.</p>
              </li>
              <li className="flex gap-4 items-start">
                <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <p className="text-lg">Valitse avautuvasta listasta haluamasi palvelun tarjoaja (esim. oma pankkisi).</p>
              </li>
              <li className="flex gap-4 items-start">
                <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <p className="text-lg">Tekoälyavustaja auttaa kaikissa kysymyksissä yläpalkissa.</p>
              </li>
            </ul>
          </section>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="text-xl font-bold text-slate-500 hover:text-slate-800 p-4"
          >
            Sulje ja palaa takaisin
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
