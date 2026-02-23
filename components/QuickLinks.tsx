
import React from 'react';
import { SHORTCUTS } from '../constants';
import { Shortcut } from '../types';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
  fontSizeStep?: number;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ onSelectCategory, fontSizeStep = 0 }) => {
  // Lajitellaan kaikki kategoriat aakkosjärjestykseen nimen mukaan
  const sortedShortcuts = [...SHORTCUTS].sort((a, b) => a.name.localeCompare(b.name, 'fi'));

  // Määritellään värit riveittäin (5 riviä, 6 saraketta = 30 kohdetta)
  const rowColors = [
    'bg-brand-indigo',  // Rivi 1
    'bg-brand-purple',  // Rivi 2
    'bg-brand-cyan',    // Rivi 3
    'bg-brand-teal',    // Rivi 4
    'bg-brand-orange'   // Rivi 5
  ];

  // Kuvakkeiden koot portain
  const iconClasses = [
    'text-4xl md:text-5xl', // 0
    'text-5xl md:text-6xl', // 1
    'text-6xl md:text-7xl', // 2
    'text-7xl md:text-8xl', // 3
    'text-8xl md:text-9xl'  // 4
  ];

  // Tekstien koot portain
  const textClasses = [
    'text-lg md:text-xl',   // 0
    'text-xl md:text-2xl',  // 1
    'text-2xl md:text-3xl', // 2
    'text-3xl md:text-4xl', // 3
    'text-4xl md:text-5xl'  // 4
  ];

  return (
    <div className="animate-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {sortedShortcuts.map((link, idx) => {
          // Lasketaan rivin indeksi (0-4), jotta väri määräytyy rivin mukaan
          // Huom: grid-cols-6 on määräävä tekijä riviväritykselle
          const rowIndex = Math.floor(idx / 6);
          const currentColor = rowColors[rowIndex] || 'bg-brand-grey';
          
          const isCategory = !!link.providers;
          const baseStyles = `${currentColor} p-6 md:p-8 rounded-[2rem] shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40 focus:ring-4 focus:ring-blue-400 focus:outline-none flex flex-col items-center justify-center text-center gap-3 h-full min-h-[160px] md:min-h-[220px]`;
          
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
    </div>
  );
};

export default QuickLinks;
