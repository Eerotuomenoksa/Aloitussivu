
import React from 'react';

interface HomepageModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Added fontSizeStep to resolve TS error in App.tsx and support UI scaling
  fontSizeStep?: number;
}

const HomepageModal: React.FC<HomepageModalProps> = ({ isOpen, onClose, fontSizeStep = 0 }) => {
  // Scaling arrays for elder-friendly instruction display
  const titleClasses = ['text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];
  const iconClasses = ['text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];
  const urlClasses = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden border-4 border-white/20 dark:border-slate-700 my-8">
        <div className="bg-indigo-600 dark:bg-indigo-700 p-10 text-white flex items-center justify-between sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-6">
            <span className={`drop-shadow-md transition-all duration-300 ${iconClasses[fontSizeStep]}`}>🏠</span>
            <h2 className={`font-black transition-all duration-300 ${titleClasses[fontSizeStep]}`}>Aseta aloitussivuksi</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-4xl font-bold transition-all active:scale-90"
          >
            ✕
          </button>
        </div>
        
        <div className="p-10 space-y-12 max-h-[70vh] overflow-y-auto text-slate-800 dark:text-slate-200">
          <section className="space-y-6">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Mikä on aloitussivu?</h3>
            <p className="text-2xl leading-relaxed">
              Aloitussivu eli "kotisivu" on verkkosivu, joka aukeaa automaattisesti, kun avaat internet-selaimen. Voit itse valita, mikä sivu avautuu ensimmäisenä.
            </p>
          </section>

          <section className="space-y-8">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white underline decoration-indigo-300 dark:decoration-indigo-500 underline-offset-[12px]">Ohjeet selaimellesi</h3>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 space-y-6">
              <p className="text-xl font-bold dark:text-slate-300">Käytä tätä osoitetta asetuksissa:</p>
              <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border-4 border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-mono text-center select-all cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all shadow-inner duration-300 ${urlClasses[fontSizeStep]}`}>
                https://eerotuomenoksa.github.io/seniorin-aloitussivu/
              </div>
            </div>

            <div className="space-y-12 mt-10">
              {/* Google Chrome */}
              <div className="space-y-4 p-6 bg-red-50/30 dark:bg-red-950/10 rounded-3xl border-2 border-red-100 dark:border-red-900/30">
                <h4 className="text-2xl font-black flex items-center gap-4 text-red-700 dark:text-red-400">
                  <span className="w-10 h-10 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-xl flex items-center justify-center text-lg">C</span> Google Chrome:
                </h4>
                <ul className="list-disc ml-8 space-y-3 text-xl leading-relaxed">
                  <li>Klikkaa oikeassa yläkulmassa olevia <strong>kolmea pistettä</strong>.</li>
                  <li>Valitse <strong>Asetukset</strong>.</li>
                  <li>Valitse vasemmalta <strong>Käynnistettäessä</strong>.</li>
                  <li>Valitse <strong>Avaa tietty sivu tai sivut</strong>.</li>
                  <li>Paina <strong>Lisää uusi sivu</strong> ja liitä osoite.</li>
                </ul>
              </div>

              {/* Microsoft Edge */}
              <div className="space-y-4 p-6 bg-blue-50/30 dark:bg-blue-950/10 rounded-3xl border-2 border-blue-100 dark:border-blue-900/30">
                <h4 className="text-2xl font-black flex items-center gap-4 text-blue-700 dark:text-blue-400">
                  <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-red-200 rounded-xl flex items-center justify-center text-lg">E</span> Microsoft Edge:
                </h4>
                <ul className="list-disc ml-8 space-y-3 text-xl leading-relaxed">
                  <li>Klikkaa oikeassa yläkulmassa olevia <strong>kolmea pistettä</strong>.</li>
                  <li>Valitse <strong>Asetukset</strong>.</li>
                  <li>Valitse <strong>Käynnistettäessä</strong>.</li>
                  <li>Valitse <strong>Avaa tietty sivu tai sivut</strong>.</li>
                  <li>Klikkaa <strong>Lisää uusi sivu</strong> ja liitä osoite.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-amber-50 dark:bg-amber-950/20 p-10 rounded-[2.5rem] border-2 border-amber-200 dark:border-amber-800/50 space-y-6">
            <h3 className="text-2xl font-black text-amber-800 dark:text-amber-400 flex items-center gap-4">
              <span>💡</span> Vinkki apuun
            </h3>
            <p className="text-xl text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              Jos asetusten löytäminen tuntuu vaikealta, voit pyytää apua läheiseltä, digiopastajalta tai kirjaston henkilökunnalta. He auttavat mielellään!
            </p>
          </section>

          <div className="bg-green-50 dark:bg-green-950/20 p-10 rounded-[2.5rem] text-center border-4 border-green-200 dark:border-green-800/50">
            <p className="text-3xl font-black text-green-700 dark:text-green-400 mb-2">Hienoa! 🎉</p>
            <p className="text-xl text-green-900 dark:text-green-200 font-bold">Nyt sivusto on valmiina helpottamaan arkeasi.</p>
          </div>
        </div>
        
        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t-4 border-slate-100 dark:border-slate-700 text-center sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="text-2xl font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-10 py-2 transition-colors"
          >
            Sulje ohjeet
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomepageModal;
