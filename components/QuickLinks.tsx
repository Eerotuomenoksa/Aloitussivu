
import React from 'react';
import { SHORTCUTS } from '../constants';
import { Shortcut } from '../types';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
  isLargeFont?: boolean;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ onSelectCategory, isLargeFont }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {SHORTCUTS.map((link, idx) => {
        const isCategory = !!link.providers;
        const baseStyles = `${link.color} p-8 rounded-[2.5rem] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40 focus:ring-4 focus:ring-blue-400 focus:outline-none flex flex-col items-center justify-center text-center gap-3`;
        
        const content = (
          <>
            <span className={`${isLargeFont ? 'text-7xl' : 'text-6xl'}`} aria-hidden="true">{link.icon}</span>
            <span className={`font-black leading-tight tracking-tight ${isLargeFont ? 'text-2xl' : 'text-xl'}`}>
              {link.name}
            </span>
          </>
        );

        if (isCategory) {
          return (
            <button
              key={idx}
              onClick={() => onSelectCategory(link)}
              className={baseStyles}
              aria-label={`Avaa kategoria: ${link.name}`}
            >
              {content}
            </button>
          );
        }

        return (
          <a 
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={baseStyles}
            aria-label={`Siirry sivustolle: ${link.name}`}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
};

export default QuickLinks;
