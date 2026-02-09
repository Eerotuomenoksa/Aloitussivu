
import React from 'react';
import { SHORTCUTS } from '../constants';
import { Shortcut } from '../types';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
  fontSizeStep?: number;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ onSelectCategory, fontSizeStep = 0 }) => {
  // Kuvakkeiden koot portain
  const iconClasses = [
    'text-5xl md:text-6xl', // 0
    'text-6xl md:text-7xl', // 1
    'text-7xl md:text-8xl', // 2
    'text-8xl md:text-9xl', // 3
    'text-9xl md:text-[10rem]' // 4
  ];

  // Tekstien koot portain
  const textClasses = [
    'text-xl',    // 0
    'text-2xl',   // 1
    'text-3xl',   // 2
    'text-4xl',   // 3
    'text-5xl'    // 4
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {SHORTCUTS.map((link, idx) => {
        const isCategory = !!link.providers;
        const baseStyles = `${link.color} p-8 rounded-[2.5rem] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40 focus:ring-4 focus:ring-blue-400 focus:outline-none flex flex-col items-center justify-center text-center gap-3`;
        
        const content = (
          <>
            <span className={`transition-all duration-300 ${iconClasses[fontSizeStep]}`} aria-hidden="true">{link.icon}</span>
            <span className={`font-black leading-tight tracking-tight transition-all duration-300 ${textClasses[fontSizeStep]}`}>
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
