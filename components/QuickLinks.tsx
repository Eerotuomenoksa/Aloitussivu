import React from 'react';
import { SHORTCUTS } from '../constants';
import { Shortcut } from '../types';

interface QuickLinksProps {
  onSelectCategory: (shortcut: Shortcut) => void;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {SHORTCUTS.map((link, idx) => {
        const isCategory = !!link.providers;
        
        const content = (
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <span className="text-5xl">{link.icon}</span>
            <span className="text-lg font-bold leading-tight">{link.name}</span>
          </div>
        );

        if (isCategory) {
          return (
            <button
              key={idx}
              onClick={() => onSelectCategory(link)}
              className={`${link.color} p-6 rounded-[2rem] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-white border-4 border-transparent hover:border-white/30`}
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
            className={`${link.color} p-6 rounded-[2rem] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-white border-4 border-transparent hover:border-white/30`}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
};

export default QuickLinks;