
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { filterVisibleProviders, useLinkVisibilityVersion } from '../linkVisibility';
import { Shortcut, Provider, Favorite, LinkReportDraft, LocalityInfo } from '../types';
import { useI18n } from '../i18n';
import NearbyGuidancePlaces from './NearbyGuidancePlaces';

interface ProviderModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
  fontSizeStep?: number;
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  onReportLink?: (draft: LinkReportDraft) => void;
  locality?: LocalityInfo | null;
}

const getPhoneHref = (provider: Provider) => {
  if (provider.phoneUrl) return provider.phoneUrl;
  if (!provider.phone) return undefined;
  return `tel:${provider.phone.replace(/[^\d+]/g, '')}`;
};

const ProviderModal: React.FC<ProviderModalProps> = ({ shortcut, onClose, fontSizeStep = 0, favorites, onToggleFavorite, onReportLink, locality = null }) => {
  const { t, categoryName } = useI18n();
  useLinkVisibilityVersion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleClasses = [
    'text-3xl md:text-5xl',
    'text-4xl md:text-6xl',
    'text-5xl md:text-7xl',
    'text-6xl md:text-8xl',
    'text-7xl md:text-9xl',
  ];

  const iconClasses = [
    'text-4xl md:text-7xl',
    'text-5xl md:text-8xl',
    'text-6xl md:text-9xl',
    'text-7xl md:text-[10rem]',
    'text-8xl md:text-[12rem]',
  ];

  const itemTextClasses = [
    'text-lg md:text-2xl',
    'text-xl md:text-3xl',
    'text-2xl md:text-4xl',
    'text-3xl md:text-5xl',
    'text-4xl md:text-6xl',
  ];

  const starClasses = [
    'text-2xl w-12 h-12 sm:w-10 sm:h-10',
    'text-3xl w-12 h-12',
    'text-4xl w-14 h-14',
    'text-5xl w-16 h-16',
    'text-6xl w-20 h-20',
  ];

  useEffect(() => {
    if (shortcut?.providers) {
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    }
    const root = document.getElementById('root');
    const previousAriaHidden = root?.getAttribute('aria-hidden');
    const previousDisplay = root?.style.display;
    const previousPointerEvents = root?.style.pointerEvents;
    if (root && shortcut?.providers) {
      root.setAttribute('aria-hidden', 'true');
      root.style.display = 'none';
      root.style.pointerEvents = 'none';
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
  }, [onClose, shortcut]);

  if (!shortcut || !shortcut.providers) return null;

  const visibleProviders = filterVisibleProviders(shortcut.providers) ?? [];
  if (visibleProviders.length === 0) return null;

  const groupedProviders = visibleProviders.reduce((acc, provider) => {
    const key = categoryName(provider.group || t('services'));
    if (!acc[key]) acc[key] = [];
    acc[key].push(provider);
    return acc;
  }, {} as Record<string, Provider[]>);

  const groupKeys = Object.keys(groupedProviders);
  const showNearbyGuidance = shortcut.name === 'Apua digiin';

  const modal = (
    <div
      className="fixed inset-0 z-[9999] isolate flex items-start justify-center bg-black/50 p-3 opacity-100 animate-in fade-in duration-200 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="aurora-modal-shell relative z-[10000] flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden sm:my-8 sm:max-h-[95vh]">
        <div className="aurora-modal-header p-4 text-white flex items-center justify-between gap-3 shadow-xl sm:p-6 md:p-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4 md:gap-6">
            <span className={`flex shrink-0 items-center justify-center rounded-[1.5rem] bg-white/10 p-3 transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{shortcut.icon}</span>
            <h2 id="modal-title" className={`font-display min-w-0 font-bold leading-tight tracking-tight transition-all duration-300 ${titleClasses[fontSizeStep]}`}>{categoryName(shortcut.name)}</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="aurora-close-button h-12 w-12 shrink-0 text-3xl focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 sm:h-14 sm:w-14 md:h-16 md:w-16 md:text-4xl"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <div className="aurora-modal-body flex-1 space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-6 md:space-y-12 md:p-10">
          {showNearbyGuidance && (
            <NearbyGuidancePlaces
              locality={locality}
              fontSizeStep={fontSizeStep}
              className="aurora-panel sm:rounded-[2rem] sm:p-6"
            />
          )}

          {groupKeys.map((group) => (
            <div key={group} className="space-y-4 md:space-y-6">
              {group !== categoryName(t('services')) && (
                <h3 className="border-b-2 border-[var(--theme-border)] pb-2 text-base font-black uppercase tracking-wide text-[var(--theme-text-3)] sm:text-lg md:text-2xl md:tracking-[0.2em]">
                  {group}
                </h3>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                {groupedProviders[group].map((provider, idx) => {
                  const isFav = favorites.some(f => f.url === provider.url);
                  const phoneHref = getPhoneHref(provider);
                  const fav: Favorite = {
                    name: provider.name,
                    url: provider.url,
                    categoryName: shortcut.name,
                    categoryIcon: shortcut.icon,
                    color: shortcut.color,
                  };
                  return (
                    <div key={idx} className="relative group/card">
                      <div className={`aurora-card flex flex-col justify-between gap-4 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--theme-primary-mid)] hover:shadow-md sm:p-5 md:gap-5 md:p-6 ${provider.phone ? 'min-h-[180px] md:min-h-[220px]' : 'min-h-[132px] md:min-h-[150px]'}`}>
                        <div className="flex flex-1 items-center justify-center px-2 sm:px-4 md:px-8">
                          <span className={`font-black leading-tight text-[var(--theme-text)] ${itemTextClasses[fontSizeStep]}`}>
                            {provider.name}
                          </span>
                        </div>
                        <div className="grid w-full grid-cols-1 gap-3">
                          <a
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--theme-primary)] px-5 py-3 text-base font-black text-white shadow-sm transition-all hover:bg-[var(--theme-primary-mid)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95 md:text-lg"
                            title={`Avaa verkkosivu: ${provider.name}`}
                            aria-label={`Avaa verkkosivu: ${provider.name}`}
                          >
                            <span aria-hidden="true">↗</span>
                            <span>Verkkosivu</span>
                          </a>
                          {provider.phone && phoneHref && (
                            <a
                              href={phoneHref}
                              className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-[var(--theme-gold)] px-5 py-3 text-xl font-black text-[var(--theme-cta-label)] shadow-sm transition-all hover:bg-[var(--theme-gold-light)] focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 active:scale-95 md:text-2xl"
                              title={`Soita: ${provider.name}`}
                              aria-label={`Soita: ${provider.name}, ${provider.phone}`}
                            >
                              <span aria-hidden="true">☎</span>
                              <span>{provider.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                      {onReportLink && (
                        <button
                          onClick={() => onReportLink({
                            name: provider.name,
                            url: provider.url,
                            category: shortcut.name,
                            source: 'ProviderModal',
                          })}
                          title={`Ilmoita ongelma linkissä: ${provider.name}`}
                          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-xl text-white shadow-md transition-all hover:bg-slate-900 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:h-10 sm:w-10 sm:opacity-0 sm:group-hover/card:opacity-100"
                          aria-label={`${t('reportLink')}: ${provider.name}`}
                        >
                          !
                        </button>
                      )}
                      <button
                        onClick={() => onToggleFavorite(fav)}
                        title={isFav ? `Poista suosikeista: ${provider.name}` : `Lisää suosikkeihin: ${provider.name}`}
                        className={`absolute top-3 right-3 flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none
                          ${isFav
                            ? 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
                            : 'bg-slate-100 shadow-md hover:bg-yellow-100 dark:bg-slate-700 dark:hover:bg-yellow-900/40'
                          } ${starClasses[fontSizeStep]}`}
                        aria-label={isFav ? `${t('removeFavorite')}: ${provider.name}` : `${t('addFavorite')}: ${provider.name}`}
                      >
                        {isFav ? '⭐' : '☆'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center sm:p-6 md:p-8">
          <button
            onClick={onClose}
            className="aurora-secondary-button min-h-12 px-8 py-3 text-lg md:px-12 md:py-4 md:text-2xl"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default ProviderModal;
