
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
        
        const content = (
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <span className={`${isLargeFont ? 'text-7xl' : 'text-6xl'}`}>{link.icon}</span>
            <span className={`font-black leading-tight tracking-tight ${isLargeFont ? 'text-2xl' : 'text-xl'}`}>
              {link.name}
            </span>
          </div>
        );

        if (isCategory) {
          return (
            <button
              key={idx}
              onClick={() => onSelectCategory(link)}
              className={`${link.color} p-8 rounded-[2.5rem] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40`}
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
            className={`${link.color} p-8 rounded-[2.5rem] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 active:scale-95 text-white border-4 border-transparent hover:border-white/40`}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
};

export default QuickLinks;
