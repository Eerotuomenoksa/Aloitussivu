
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface HomepageModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Added fontSizeStep to resolve TS error in App.tsx and support UI scaling
  fontSizeStep?: number;
  onStartOnboarding?: () => void;
}

const HomepageModal: React.FC<HomepageModalProps> = ({ isOpen, onClose, fontSizeStep = 0, onStartOnboarding }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Scaling arrays for elder-friendly instruction display
  const titleClasses = [
    'text-2xl sm:text-3xl md:text-3xl',
    'text-2xl sm:text-3xl md:text-4xl',
    'text-3xl sm:text-4xl md:text-5xl',
    'text-4xl sm:text-5xl md:text-6xl',
    'text-5xl sm:text-6xl md:text-7xl',
  ];
  const iconClasses = [
    'text-4xl md:text-5xl',
    'text-5xl md:text-6xl',
    'text-6xl md:text-7xl',
    'text-7xl md:text-8xl',
    'text-8xl md:text-9xl',
  ];
  const urlClasses = [
    'text-lg md:text-xl',
    'text-xl md:text-2xl',
    'text-2xl md:text-3xl',
    'text-3xl md:text-4xl',
    'text-4xl md:text-5xl',
  ];

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const root = document.getElementById('root');
    const previousAriaHidden = root?.getAttribute('aria-hidden');
    const previousDisplay = root?.style.display;
    const previousPointerEvents = root?.style.pointerEvents;
    if (root) {
      root.setAttribute('aria-hidden', 'true');
      root.style.display = 'none';
      root.style.pointerEvents = 'none';
    }
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      if (!root) return;
      if (previousAriaHidden === null) {
        root.removeAttribute('aria-hidden');
      } else {
        root.setAttribute('aria-hidden', previousAriaHidden);
      }
      root.style.display = previousDisplay ?? '';
      root.style.pointerEvents = previousPointerEvents ?? '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] isolate flex items-start justify-center overflow-y-auto bg-slate-900 p-3 animate-in fade-in duration-200 sm:items-center sm:bg-slate-900/80 sm:p-4 sm:backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="homepage-modal-title"
    >
      <div className="relative z-[10000] flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 border-white/20 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:my-8 sm:max-h-[92vh] sm:rounded-[3rem] sm:border-4">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-indigo-600 p-4 text-white shadow-lg dark:bg-indigo-700 sm:p-6 md:p-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5 md:gap-6">
            <span className={`shrink-0 drop-shadow-md transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">🏠</span>
            <h2 id="homepage-modal-title" className={`min-w-0 font-black leading-tight transition-all duration-300 ${titleClasses[fontSizeStep]}`}>Aseta SeniorSurfin aloitussivuksi</h2>
          </div>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-bold transition-all hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white active:scale-90 sm:h-14 sm:w-14 sm:text-4xl"
            aria-label="Sulje ohjeet"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 space-y-6 overflow-y-auto p-4 text-slate-800 dark:text-slate-200 sm:space-y-8 sm:p-6 md:space-y-12 md:p-10">
          <section className="space-y-3 md:space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">Mikä on SeniorSurfin aloitussivu?</h3>
            <p className="text-lg leading-relaxed md:text-2xl">
              SeniorSurfin aloitussivu voi toimia selaimen kotisivuna eli sivuna, joka aukeaa automaattisesti, kun avaat internet-selaimen. Voit itse valita, mikä sivu avautuu ensimmäisenä.
            </p>
          </section>

          {onStartOnboarding && (
            <section className="space-y-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-950/20 md:rounded-[2rem] md:p-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">Sivuston esittely</h3>
              <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200 md:text-xl">
                Käynnistä lyhyt esittely, jos haluat nähdä tärkeimmät kohdat nopeasti.
              </p>
              <button
                type="button"
                onClick={onStartOnboarding}
                className="min-h-12 rounded-full bg-indigo-600 px-6 py-3 text-lg font-black text-white shadow-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95 md:px-8 md:py-4 md:text-xl"
              >
                Käynnistä esittely
              </button>
            </section>
          )}

          <section className="space-y-5 md:space-y-8">
            <h3 className="text-2xl font-black text-slate-900 underline decoration-indigo-300 underline-offset-[8px] dark:text-white dark:decoration-indigo-500 md:text-3xl md:underline-offset-[12px]">Ohjeet selaimellesi</h3>
            
            <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950 md:rounded-[2rem] md:p-8 md:space-y-6">
              <p className="text-lg font-bold dark:text-slate-300 md:text-xl">Käytä tätä osoitetta asetuksissa:</p>
              <div className={`select-all rounded-2xl border-4 border-indigo-100 bg-white p-4 text-center font-mono text-indigo-700 shadow-inner transition-all duration-300 hover:bg-indigo-50 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-indigo-950 md:p-6 ${urlClasses[fontSizeStep]}`}>
                seniorsurf.fi/aloitussivu
              </div>
            </div>

            <div className="mt-6 hidden space-y-12 md:block">
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

          <section className="space-y-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20 md:rounded-[2.5rem] md:p-10 md:space-y-6">
            <h3 className="flex items-center gap-3 text-xl font-black text-amber-800 dark:text-amber-300 md:gap-4 md:text-2xl">
              <span>💡</span> Vinkki apuun
            </h3>
            <p className="text-base font-medium leading-relaxed text-amber-900 dark:text-amber-100 md:text-xl">
              Jos asetusten löytäminen tuntuu vaikealta, voit pyytää apua läheiseltä, digiopastajalta tai kirjaston henkilökunnalta. He auttavat mielellään!
            </p>
          </section>

          <div className="rounded-2xl border-4 border-green-200 bg-green-50 p-5 text-center dark:border-green-800/50 dark:bg-green-950/20 md:rounded-[2.5rem] md:p-10">
            <p className="mb-2 text-2xl font-black text-green-700 dark:text-green-300 md:text-3xl">Hienoa! 🎉</p>
            <p className="text-base font-bold text-green-900 dark:text-green-100 md:text-xl">Nyt SeniorSurfin aloitussivu on valmiina helpottamaan arkeasi.</p>
          </div>
        </div>
        
        <div className="sticky bottom-0 z-10 border-t-2 border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900 md:border-t-4 md:p-8">
          <button 
            onClick={onClose}
            className="min-h-12 rounded-full px-8 py-3 text-lg font-black text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white md:px-10 md:text-2xl"
            aria-label="Sulje ohjeet"
          >
            Sulje ohjeet
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default HomepageModal;
