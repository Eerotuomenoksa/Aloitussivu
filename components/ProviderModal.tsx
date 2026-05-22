
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
      className="fixed inset-0 z-[9999] isolate flex items-start justify-center bg-slate-200 dark:bg-slate-950 p-3 opacity-100 animate-in fade-in duration-200 sm:p-4 sm:bg-slate-200/90 sm:dark:bg-slate-950/90 sm:backdrop-blur-lg sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative z-[10000] flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-2xl dark:border-white/20 dark:bg-slate-900 sm:my-8 sm:max-h-[95vh] sm:rounded-[3rem] sm:border-4">
        <div className={`${shortcut.color} p-4 text-white flex items-center justify-between gap-3 shadow-xl sm:p-6 md:p-10`}>
          <div className="flex min-w-0 items-center gap-3 sm:gap-4 md:gap-6">
            <span className={`shrink-0 transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{shortcut.icon}</span>
            <h2 id="modal-title" className={`min-w-0 font-black leading-tight tracking-tight transition-all duration-300 ${titleClasses[fontSizeStep]}`}>{categoryName(shortcut.name)}</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl transition-all hover:bg-white/40 focus:ring-4 focus:ring-white active:scale-90 sm:h-14 sm:w-14 md:h-16 md:w-16 md:text-4xl"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 sm:space-y-8 sm:p-6 md:space-y-12 md:p-10">
          {showNearbyGuidance && (
            <NearbyGuidancePlaces
              locality={locality}
              fontSizeStep={fontSizeStep}
              className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:rounded-[2rem] sm:border-4 sm:p-6"
            />
          )}

          {groupKeys.map((group) => (
            <div key={group} className="space-y-4 md:space-y-6">
              {group !== categoryName(t('services')) && (
                <h3 className="border-b-2 border-slate-200 pb-2 text-base font-black uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:text-lg md:border-b-4 md:text-2xl md:tracking-[0.2em]">
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
                      <div className={`flex flex-col justify-between gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 text-center shadow-md transition-all hover:border-blue-600 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500 sm:rounded-[2rem] sm:border-4 sm:p-5 md:gap-5 md:rounded-[2.5rem] md:p-6 ${provider.phone ? 'min-h-[180px] md:min-h-[220px]' : 'min-h-[132px] md:min-h-[150px]'}`}>
                        <div className="flex flex-1 items-center justify-center px-2 sm:px-4 md:px-8">
                          <span className={`font-black leading-tight text-slate-800 dark:text-white ${itemTextClasses[fontSizeStep]}`}>
                            {provider.name}
                          </span>
                        </div>
                        <div className="grid w-full grid-cols-1 gap-3">
                          <a
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-3 text-base md:text-lg font-black text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none active:scale-95"
                            aria-label={`Avaa verkkosivu: ${provider.name}`}
                          >
                            <span aria-hidden="true">↗</span>
                            <span>Verkkosivu</span>
                          </a>
                          {provider.phone && phoneHref && (
                            <a
                              href={phoneHref}
                              className="inline-flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-[#d09a32] px-5 py-3 text-xl md:text-2xl font-black text-slate-950 shadow-sm transition-all hover:bg-[#e2ad45] focus:ring-4 focus:ring-amber-200 focus:outline-none active:scale-95"
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
                          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-xl text-white shadow-md transition-all hover:bg-slate-900 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:h-10 sm:w-10 sm:opacity-0 sm:group-hover/card:opacity-100"
                          aria-label={`${t('reportLink')}: ${provider.name}`}
                        >
                          !
                        </button>
                      )}
                      <button
                        onClick={() => onToggleFavorite(fav)}
                        className={`absolute top-3 right-3 flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none
                          ${isFav
                            ? 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 sm:opacity-0 sm:group-hover/card:opacity-100 focus:opacity-100'
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

        <div className="border-t-2 border-slate-100 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-6 md:border-t-4 md:p-8">
          <button
            onClick={onClose}
            className="min-h-12 rounded-full border-b-4 border-slate-300 bg-slate-100 px-8 py-3 text-lg font-black text-slate-700 transition-all hover:bg-slate-200 active:scale-95 dark:border-slate-950 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:px-12 md:py-4 md:text-2xl"
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
