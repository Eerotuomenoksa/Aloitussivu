
import React from 'react';
import { Shortcut, Provider } from '../types';

interface ProviderModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ shortcut, onClose }) => {
  if (!shortcut || !shortcut.providers) return null;

  // Ryhmitellään palveluntarjoajat group-kentän mukaan
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
        <div className={`${shortcut.color} p-8 text-white flex items-center justify-between sticky top-0 z-10`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{shortcut.icon}</span>
            <h2 className="text-3xl font-bold">Valitse {shortcut.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-3xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {groupKeys.map((group) => (
            <div key={group} className="space-y-4">
              {hasMultipleGroups && (
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest border-b pb-2">
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
                    className="flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl border-2 border-slate-200 hover:border-blue-400 transition-all group active:scale-[0.98]"
                  >
                    <span className="text-2xl font-bold text-slate-800">{provider.name}</span>
                    <span className="text-slate-400 group-hover:text-blue-500 text-3xl">→</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="text-xl font-bold text-slate-500 hover:text-slate-800"
          >
            Peruuta ja palaa takaisin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
