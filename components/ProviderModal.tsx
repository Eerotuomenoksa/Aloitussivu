
import React from 'react';
import { Shortcut, Provider } from '../types';

interface ProviderModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ shortcut, onClose }) => {
  if (!shortcut || !shortcut.providers) return null;

  const groupedProviders = shortcut.providers.reduce((acc, provider) => {
    const key = provider.group || 'Muut';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(provider);
    return acc;
  }, {} as Record<string, Provider[]>);

  const groupKeys = Object.keys(groupedProviders);
  const hasMultipleGroups = groupKeys.length > 1 || (groupKeys.length === 1 && groupKeys[0] !== 'Muut');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-white/20 dark:border-slate-700 my-8">
        <div className={`${shortcut.color} p-10 text-white flex items-center justify-between sticky top-0 z-10 shadow-lg`}>
          <div className="flex items-center gap-6">
            <span className="text-6xl drop-shadow-md">{shortcut.icon}</span>
            <h2 className="text-4xl font-black">Valitse {shortcut.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-4xl font-bold transition-all active:scale-90"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 md:p-10 space-y-10 max-h-[65vh] overflow-y-auto">
          {groupKeys.map((group) => (
            <div key={group} className="space-y-6">
              {hasMultipleGroups && (
                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b-4 border-slate-100 dark:border-slate-700 pb-2">
                  {group}
                </h3>
              )}
              <div className="grid gap-4">
                {groupedProviders[group].map((provider, idx) => (
                  <a
                    key={idx}
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-3xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all group active:scale-[0.97]"
                  >
                    <span className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{provider.name}</span>
                    <span className="text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 text-4xl transition-transform group-hover:translate-x-2">→</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t-4 border-slate-100 dark:border-slate-700 text-center sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="text-2xl font-black text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white py-2 px-8 transition-colors"
          >
            Peruuta ja palaa takaisin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
