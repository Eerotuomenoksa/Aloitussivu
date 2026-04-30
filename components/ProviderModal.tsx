
import React, { useEffect } from 'react';
import { filterVisibleProviders, useLinkVisibilityVersion } from '../linkVisibility';
import { Shortcut, Provider, Favorite, LinkReportDraft } from '../types';

interface ProviderModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
  fontSizeStep?: number;
  favorites: Favorite[];
  onToggleFavorite: (fav: Favorite) => void;
  onReportLink?: (draft: LinkReportDraft) => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ shortcut, onClose, fontSizeStep = 0, favorites, onToggleFavorite, onReportLink }) => {
  useLinkVisibilityVersion();
  const titleClasses = [
    'text-3xl md:text-5xl',
    'text-4xl md:text-6xl',
    'text-5xl md:text-7xl',
    'text-6xl md:text-8xl',
    'text-7xl md:text-9xl',
  ];

  const iconClasses = [
    'text-5xl md:text-7xl',
    'text-6xl md:text-8xl',
    'text-7xl md:text-9xl',
    'text-8xl md:text-[10rem]',
    'text-9xl md:text-[12rem]',
  ];

  const itemTextClasses = [
    'text-xl md:text-2xl',
    'text-2xl md:text-3xl',
    'text-3xl md:text-4xl',
    'text-4xl md:text-5xl',
    'text-5xl md:text-6xl',
  ];

  const starClasses = [
    'text-2xl w-10 h-10',
    'text-3xl w-12 h-12',
    'text-4xl w-14 h-14',
    'text-5xl w-16 h-16',
    'text-6xl w-20 h-20',
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!shortcut || !shortcut.providers) return null;

  const visibleProviders = filterVisibleProviders(shortcut.providers) ?? [];
  if (visibleProviders.length === 0) return null;

  const groupedProviders = visibleProviders.reduce((acc, provider) => {
    const key = provider.group || 'Palvelut';
    if (!acc[key]) acc[key] = [];
    acc[key].push(provider);
    return acc;
  }, {} as Record<string, Provider[]>);

  const groupKeys = Object.keys(groupedProviders);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-200/90 dark:bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden border-4 border-slate-200 dark:border-white/20 my-8 flex flex-col max-h-[95vh]">
        <div className={`${shortcut.color} p-10 text-white flex items-center justify-between shadow-xl`}>
          <div className="flex items-center gap-6">
            <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{shortcut.icon}</span>
            <h2 id="modal-title" className={`font-black tracking-tighter transition-all duration-300 ${titleClasses[fontSizeStep]}`}>{shortcut.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-16 h-16 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-4xl transition-all focus:ring-4 focus:ring-white active:scale-90"
            aria-label="Sulje"
          >
            ✕
          </button>
        </div>

        <div className="p-10 space-y-12 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950">
          {groupKeys.map((group) => (
            <div key={group} className="space-y-6">
              {group !== 'Palvelut' && (
                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] border-b-4 border-slate-200 dark:border-slate-800 pb-2">
                  {group}
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedProviders[group].map((provider, idx) => {
                  const isFav = favorites.some(f => f.url === provider.url);
                  const fav: Favorite = {
                    name: provider.name,
                    url: provider.url,
                    categoryName: shortcut.name,
                    categoryIcon: shortcut.icon,
                    color: shortcut.color,
                  };
                  return (
                    <div key={idx} className="relative group/card">
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-md hover:shadow-2xl hover:border-blue-600 dark:hover:border-blue-500 transition-all focus:ring-8 focus:ring-blue-500/20 outline-none text-center min-h-[120px]"
                      >
                        <span className={`font-black text-slate-800 dark:text-white group-hover/card:text-blue-700 dark:group-hover/card:text-blue-400 transition-all duration-300 leading-tight ${itemTextClasses[fontSizeStep]}`}>
                          {provider.name}
                        </span>
                      </a>
                      {onReportLink && (
                        <button
                          onClick={() => onReportLink({
                            name: provider.name,
                            url: provider.url,
                            category: shortcut.name,
                            source: 'ProviderModal',
                          })}
                          className="absolute bottom-3 right-3 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-md transition-all focus:ring-4 focus:ring-blue-300 focus:outline-none opacity-0 group-hover/card:opacity-100 w-10 h-10 text-xl"
                          aria-label={`Ilmoita linkki: ${provider.name}`}
                        >
                          !
                        </button>
                      )}
                      <button
                        onClick={() => onToggleFavorite(fav)}
                        className={`absolute top-3 right-3 flex items-center justify-center rounded-full transition-all focus:ring-4 focus:ring-yellow-300 focus:outline-none
                          ${isFav
                            ? 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 opacity-0 group-hover/card:opacity-100'
                          } ${starClasses[fontSizeStep]}`}
                        aria-label={isFav ? `Poista suosikeista: ${provider.name}` : `Lisää suosikiksi: ${provider.name}`}
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

        <div className="p-8 bg-white dark:bg-slate-900 border-t-4 border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-2xl font-black text-slate-600 dark:text-slate-300 transition-all active:scale-95 border-b-4 border-slate-300 dark:border-slate-950"
          >
            Palaa takaisin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
