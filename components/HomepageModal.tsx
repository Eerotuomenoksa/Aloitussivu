
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useI18n } from '../i18n';

interface HomepageModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Added fontSizeStep to resolve TS error in App.tsx and support UI scaling
  fontSizeStep?: number;
  onStartOnboarding?: () => void;
}

const HomepageModal: React.FC<HomepageModalProps> = ({ isOpen, onClose, fontSizeStep = 0, onStartOnboarding }) => {
  const { t } = useI18n();
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
      className="fixed inset-0 z-[9999] isolate flex items-start justify-center overflow-y-auto bg-black/50 p-3 animate-in fade-in duration-200 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="homepage-modal-title"
    >
      <div className="aurora-modal-shell relative z-[10000] flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden sm:my-8 sm:max-h-[92vh]">
        <div className="aurora-modal-header sticky top-0 z-10 flex items-center justify-between gap-3 p-4 text-white shadow-lg sm:p-6 md:p-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5 md:gap-6">
            <span className={`shrink-0 rounded-[1.5rem] bg-white/10 p-3 drop-shadow-md transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">🏠</span>
            <h2 id="homepage-modal-title" className={`font-display min-w-0 font-bold leading-tight transition-all duration-300 ${titleClasses[fontSizeStep]}`}>{t('homepageTitle')}</h2>
          </div>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="aurora-close-button h-12 w-12 shrink-0 text-3xl sm:h-14 sm:w-14 sm:text-4xl"
            aria-label={t('closeInstructions')}
          >
            ✕
          </button>
        </div>
        
        <div className="aurora-modal-body flex-1 space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-6 md:space-y-12 md:p-10">
          <section className="space-y-3 md:space-y-6">
            <h3 className="aurora-section-title text-2xl md:text-3xl">{t('homepageWhatTitle')}</h3>
            <p className="text-lg leading-relaxed md:text-2xl">
              {t('homepageWhatBody')}
            </p>
          </section>

          {onStartOnboarding && (
            <section className="aurora-soft-panel space-y-4 md:rounded-[2rem] md:p-8">
              <h3 className="aurora-section-title text-2xl md:text-3xl">{t('homepageTourTitle')}</h3>
              <p className="text-base leading-relaxed text-[var(--theme-text-2)] md:text-xl">
                {t('homepageTourBody')}
              </p>
              <button
                type="button"
                onClick={onStartOnboarding}
                className="min-h-12 rounded-full bg-[var(--theme-primary)] px-6 py-3 text-lg font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40 active:scale-95 md:px-8 md:py-4 md:text-xl"
              >
                {t('homepageStartTour')}
              </button>
            </section>
          )}

          <section className="space-y-5 md:space-y-8">
            <h3 className="aurora-section-title text-2xl underline decoration-[var(--theme-gold)] underline-offset-[8px] md:text-3xl md:underline-offset-[12px]">{t('browserInstructions')}</h3>
            
            <div className="aurora-panel space-y-4 md:rounded-[2rem] md:p-8 md:space-y-6">
              <p className="text-lg font-bold text-[var(--theme-text-2)] md:text-xl">{t('useThisAddress')}</p>
              <div className={`select-all rounded-2xl border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center font-mono text-[var(--theme-primary)] shadow-inner transition-all duration-300 hover:bg-[var(--theme-pale)] md:p-6 ${urlClasses[fontSizeStep]}`}>
                seniorsurf.fi/aloitussivu
              </div>
            </div>

            <div className="mt-6 hidden space-y-12 md:block">
              {/* Google Chrome */}
              <div className="aurora-card space-y-4 p-6">
                <h4 className="flex items-center gap-4 text-2xl font-black text-[var(--theme-primary)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--theme-pale)] text-lg text-[var(--theme-primary)]">C</span> Google Chrome:
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
              <div className="aurora-card space-y-4 p-6">
                <h4 className="flex items-center gap-4 text-2xl font-black text-[var(--theme-primary)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--theme-pale)] text-lg text-[var(--theme-primary)]">E</span> Microsoft Edge:
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

          <section className="aurora-panel space-y-4 md:rounded-[2rem] md:p-8">
            <h3 className="aurora-section-title text-2xl md:text-3xl">{t('legalInfoTitle')}</h3>
            <p className="text-base font-bold leading-relaxed text-[var(--theme-text-2)] md:text-xl">
              {t('legalInfoBody')}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="./tietosuoja.html"
                target="_blank"
                rel="noopener noreferrer"
                className="aurora-nav-link px-5 py-3 text-base"
              >
                {t('privacyNotice')}
              </a>
              <a
                href="./saavutettavuus.html"
                target="_blank"
                rel="noopener noreferrer"
                className="aurora-nav-link px-5 py-3 text-base"
              >
                {t('accessibilityStatement')}
              </a>
            </div>
          </section>

          <section className="aurora-soft-panel space-y-4 md:rounded-[2.5rem] md:p-10 md:space-y-6">
            <h3 className="flex items-center gap-3 text-xl font-black text-[var(--theme-primary)] md:gap-4 md:text-2xl">
              <span>💡</span> {t('helpTipTitle')}
            </h3>
            <p className="text-base font-medium leading-relaxed text-[var(--theme-text-2)] md:text-xl">
              {t('helpTipBody')}
            </p>
          </section>

          <div className="aurora-soft-panel text-center md:rounded-[2.5rem] md:p-10">
            <p className="mb-2 text-2xl font-black text-[var(--theme-primary)] md:text-3xl">{t('allDoneTitle')} 🎉</p>
            <p className="text-base font-bold text-[var(--theme-text-2)] md:text-xl">{t('allDoneBody')}</p>
          </div>
        </div>
        
        <div className="sticky bottom-0 z-10 border-t-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center md:p-8">
          <button 
            onClick={onClose}
            className="aurora-secondary-button min-h-12 px-8 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40 md:px-10 md:text-2xl"
            aria-label={t('closeInstructions')}
          >
            {t('closeInstructions')}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default HomepageModal;
