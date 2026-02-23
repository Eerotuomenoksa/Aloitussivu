
import React, { useEffect } from 'react';
import { Shortcut, Provider } from '../types';

interface ProviderModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
  fontSizeStep?: number;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ shortcut, onClose, fontSizeStep = 0 }) => {
  const titleClasses = [
    'text-3xl md:text-5xl',
    'text-4xl md:text-6xl',
    'text-5xl md:text-7xl',
    'text-6xl md:text-8xl',
    'text-7xl md:text-9xl'
  ];

  const iconClasses = [
    'text-5xl md:text-7xl',
    'text-6xl md:text-8xl',
    'text-7xl md:text-9xl',
    'text-8xl md:text-[10rem]',
    'text-9xl md:text-[12rem]'
  ];

  const itemTextClasses = [
    'text-xl md:text-2xl',
    'text-2xl md:text-3xl',
    'text-3xl md:text-4xl',
    'text-4xl md:text-5xl',
    'text-5xl md:text-6xl'
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!shortcut || !shortcut.providers) return null;

  const groupedProviders = shortcut.providers.reduce((acc, provider) => {
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
                {groupedProviders[group].map((provider, idx) => (
                  <a
                    key={idx}
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-md hover:shadow-2xl hover:border-blue-600 dark:hover:border-blue-500 transition-all group focus:ring-8 focus:ring-blue-500/20 outline-none text-center min-h-[180px]"
                  >
                    <span className={`font-black text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-all duration-300 leading-tight ${itemTextClasses[fontSizeStep]}`}>
                      {provider.name}
                    </span>
                    <span className="mt-4 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all">🌐</span>
                  </a>
                ))}
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
