
import React, { useEffect, useRef } from 'react';
import { SHORTCUTS } from '../constants';
import { LINK_STATS } from '../linkStats';
import { LOCAL_LINK_STATS } from '../localStats';
import { filterVisibleShortcuts, useLinkVisibilityVersion } from '../linkVisibility';
import { useI18n } from '../i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSizeStep?: number;
  showOnboardingOffer?: boolean;
  onStartOnboarding?: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, fontSizeStep = 0, showOnboardingOffer = false, onStartOnboarding }) => {
  const { t } = useI18n();
  useLinkVisibilityVersion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleClasses = ['text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];
  const headerIconClasses = ['text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];
  const statClasses = ['text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryStats = filterVisibleShortcuts(SHORTCUTS).map(shortcut => {
    let count = 0;
    if (shortcut.providers) {
      count = shortcut.providers.length;
    } else if (shortcut.url) {
      count = 1;
    }
    return { name: shortcut.name, count, icon: shortcut.icon };
  });

  const totalLinks = LINK_STATS.visibleLinks;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 text-[var(--theme-text)] backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div className="aurora-modal-shell my-8 w-full max-w-4xl overflow-hidden">
        <div className="aurora-modal-header sticky top-0 z-10 flex items-center justify-between p-8 text-white">
          <div className="flex items-center gap-4">
            <span className={`rounded-[1.5rem] bg-white/10 p-3 transition-all duration-300 ${headerIconClasses[fontSizeStep]}`}>ℹ️</span>
            <h2 id="info-modal-title" className={`font-display font-bold transition-all duration-300 ${titleClasses[fontSizeStep]}`}>{t('infoTitle')}</h2>
          </div>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="aurora-close-button flex h-12 w-12 text-3xl"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>
        
        <div className="aurora-modal-body max-h-[75vh] space-y-10 overflow-y-auto p-8 md:p-12">
          <section className="space-y-4">
            <h3 className="aurora-section-title text-2xl underline decoration-[var(--theme-gold)] underline-offset-8">{t('infoWhatTitle')}</h3>
            <p className="text-xl leading-relaxed text-[var(--theme-text-2)]">
              {t('infoWhatBody')} {categoryStats.length} {t('categories').toLocaleLowerCase('fi-FI')} ja {totalLinks} {t('links').toLocaleLowerCase('fi-FI')}.
            </p>
          </section>

          {showOnboardingOffer && onStartOnboarding && (
            <section className="aurora-soft-panel rounded-[2rem] p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h3 className="aurora-section-title text-2xl">
                    {t('onboardingOfferTitle')}
                  </h3>
                  <p className="text-lg font-bold leading-relaxed text-[var(--theme-text-2)]">
                    {t('onboardingOfferBody')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStartOnboarding}
                  className="shrink-0 rounded-full bg-[var(--theme-primary)] px-6 py-4 text-lg font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40 active:scale-95"
                >
                  {t('onboardingStart')}
                </button>
              </div>
            </section>
          )}

          <section className="aurora-soft-panel space-y-6 p-8">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-[var(--theme-primary)]">
                <span>📊</span> Sivuston laajuus
              </h3>
              <p className="text-2xl font-medium leading-tight text-[var(--theme-text)]">
                Sivustolta löytyy yhteensä <span className={`inline-block px-2 font-black text-[var(--theme-primary)] transition-all duration-300 ${statClasses[fontSizeStep]}`}>{totalLinks}</span> näkyvää linkkiä.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="aurora-section-title text-2xl underline decoration-[var(--theme-gold)] underline-offset-8">{t('usageStatsTitle')}</h3>
            <p className="text-xl leading-relaxed text-[var(--theme-text-2)]">
              {t('usageStatsBody')}
            </p>
          </section>

          <section className="aurora-panel space-y-4 rounded-3xl p-6">
            <h3 className="aurora-section-title text-2xl">{t('legalInfoTitle')}</h3>
            <p className="text-lg font-bold leading-relaxed text-[var(--theme-text-2)]">
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

          <section className="space-y-6">
            <h3 className="aurora-section-title border-b-2 border-[var(--theme-border)] pb-2 text-2xl">
              Paikalliset linkit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Kunnat', count: LOCAL_LINK_STATS.municipalities, note: 'kunnan omat verkkosivut' },
                { name: 'Kieliversiot', count: LOCAL_LINK_STATS.municipalityLanguageVersions, note: 'kuntien ruotsi-, englanti- ja muut kieliversiot' },
                { name: 'Hyvinvointialueet', count: LOCAL_LINK_STATS.wellbeingAreas, note: 'alueen sote-sivut' },
                { name: 'Kunnan palvelusivut', count: LOCAL_LINK_STATS.municipalityServicePages, note: 'esim. palvelut ja asiointi' },
                { name: 'Paikallisliikenne', count: LOCAL_LINK_STATS.localTransport, note: 'joukkoliikenne ja reittioppaat' },
                { name: 'Palveluliikenne', count: LOCAL_LINK_STATS.localServiceTransport, note: 'kuntien palvelu-, asiointi- ja kutsuliikenne' },
                { name: 'Paikalliset kirjastot', count: LOCAL_LINK_STATS.localLibraries, note: 'kirjastojen omat palvelut' },
                { name: 'Lehdet', count: LOCAL_LINK_STATS.localNewspapers, note: 'suomalaiset paikallislehdet' },
                { name: 'Uutisvirrat', count: LOCAL_LINK_STATS.localNewsFeeds, note: 'paikallislehtien RSS-syötteet' },
                { name: 'Ohjattu liikunta', count: LOCAL_LINK_STATS.localExerciseLinks, note: 'kuntien liikuntaryhmät ja soveltava liikunta' },
                { name: 'Urheiluseurat', count: LOCAL_LINK_STATS.localSportsClubs, note: 'paikkakunnan omat seurat' },
                { name: 'Kela-taksien puhelinnumerot', count: LOCAL_LINK_STATS.localKelaTaxiPhones, note: 'alueelliset tilausnumerot' },
              ].map((item) => (
                <div key={item.name} className="aurora-card flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <span className="block text-lg font-bold text-[var(--theme-text)]">{item.name}</span>
                    <span className="block text-sm font-bold text-[var(--theme-text-3)]">{item.note}</span>
                  </div>
                  <span className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-1 font-bold text-[var(--theme-primary)]">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-[var(--theme-text-3)]">
              Paikalliset sisällöt näkyvät oman kunnan perusteella. Osa linkeistä on kunta- tai aluekohtaisia palveluita, osa taas yleisiä kategorioita, joiden näkyvyyttä tarkennetaan paikkakunnan mukaan.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="aurora-section-title border-b-2 border-[var(--theme-border)] pb-2 text-2xl">Kaikki {categoryStats.length} kategoriaa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryStats.sort((a,b) => a.name.localeCompare(b.name)).map((stat, idx) => (
                <div key={idx} className="aurora-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-lg font-bold text-[var(--theme-text)]">{stat.name}</span>
                  </div>
                  <span className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-1 font-bold text-[var(--theme-primary)]">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="sticky bottom-0 z-10 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 text-center">
          <button 
            onClick={onClose}
            className="aurora-secondary-button px-5 py-2.5 text-xl"
            aria-label={t('close')}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
