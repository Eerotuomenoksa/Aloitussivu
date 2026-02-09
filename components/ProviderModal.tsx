
import React, { useEffect } from 'react';
import { Shortcut, Provider } from '../types';

interface ProviderModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ shortcut, onClose }) => {
  // Sulje ESC-näppäimellä
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!shortcut || !shortcut.providers) return null;

  const groupedProviders = shortcut.providers.reduce((acc, provider) => {
    const key = provider.group || 'Muut';
    if (!acc[key]) acc[key] = [];
    acc[key].push(provider);
    return acc;
  }, {} as Record<string, Provider[]>);

  const groupKeys = Object.keys(groupedProviders);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-white/20 my-8 flex flex-col max-h-[90vh]">
        <div className={`${shortcut.color} p-8 text-white flex items-center justify-between shadow-lg`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden="true">{shortcut.icon}</span>
            <h2 id="modal-title" className="text-3xl font-black">{shortcut.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-3xl transition-all focus:ring-4 focus:ring-white"
            aria-label="Sulje"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto">
          {groupKeys.map((group) => (
            <div key={group} className="space-y-4">
              {group !== 'Muut' && (
                <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-700 pb-1">
                  {group}
                </h3>
              )}
              <div className="grid gap-3">
                {groupedProviders[group].map((provider, idx) => (
                  <a
                    key={idx}
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl hover:border-blue-600 transition-all group focus:ring-4 focus:ring-blue-500 outline-none"
                  >
                    <span className="text-2xl font-black dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{provider.name}</span>
                    <span className="text-4xl opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-100 dark:bg-slate-900 text-center">
          <button 
            onClick={onClose}
            className="text-xl font-black text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Palaa takaisin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
