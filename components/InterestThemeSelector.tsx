import React from 'react';
import { useI18n } from '../i18n';
import { MAX_INTEREST_THEMES, shortcutGroups } from './shortcutGroups';

interface InterestThemeSelectorProps {
  selectedAnchors: string[];
  onChange: (anchors: string[]) => void;
  compact?: boolean;
}

const InterestThemeSelector: React.FC<InterestThemeSelectorProps> = ({
  selectedAnchors,
  onChange,
  compact = false,
}) => {
  const { categoryName } = useI18n();
  const showAll = selectedAnchors.length === 0;
  const selectionLimitReached = selectedAnchors.length >= MAX_INTEREST_THEMES;

  const toggleTheme = (anchor: string) => {
    if (selectedAnchors.includes(anchor)) {
      onChange(selectedAnchors.filter((selectedAnchor) => selectedAnchor !== anchor));
      return;
    }
    if (!selectionLimitReached) onChange([...selectedAnchors, anchor]);
  };

  return (
    <fieldset className="rounded-2xl border-2 border-[var(--theme-border)] p-4">
      <legend className="px-1 font-black text-[var(--theme-text)]">Kiinnostavat teemat</legend>
      <p className="mt-1 text-sm font-bold leading-relaxed text-[var(--theme-muted)]">
        Valitse enintään {MAX_INTEREST_THEMES} teemaa. Jos valitset Näytä kaikki, mitään sisältöä ei rajata.
      </p>

      <div className={`mt-3 grid grid-cols-1 gap-2 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
        <button
          type="button"
          onClick={() => onChange([])}
          aria-pressed={showAll}
          className={`${showAll
            ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primary-label)]'
            : 'border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-pale)]'
          } flex min-h-20 min-w-0 items-center gap-2 rounded-2xl border-2 p-3 text-left font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40`}
        >
          <span className="text-2xl" aria-hidden="true">✨</span>
          <span className="min-w-0 leading-tight [overflow-wrap:anywhere]">Näytä kaikki</span>
          {showAll && <span className="ml-auto" aria-hidden="true">✓</span>}
        </button>

        {shortcutGroups.map((group) => {
          const selected = selectedAnchors.includes(group.anchor);
          const disabled = !selected && selectionLimitReached;
          return (
            <button
              key={group.anchor}
              type="button"
              onClick={() => toggleTheme(group.anchor)}
              disabled={disabled}
              aria-pressed={selected}
              className={`${selected
                ? 'border-[var(--theme-primary)] bg-[var(--theme-pale)] text-[var(--theme-text)]'
                : 'border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-pale)]'
              } flex min-h-20 min-w-0 items-center gap-2 rounded-2xl border-2 p-3 text-left font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 disabled:cursor-not-allowed disabled:opacity-45`}
            >
              <span className="text-2xl" aria-hidden="true">{group.icon}</span>
              <span className="min-w-0 leading-tight [overflow-wrap:anywhere]">{categoryName(group.name)}</span>
              {selected && <span className="ml-auto" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm font-bold text-[var(--theme-muted)]" aria-live="polite">
        {showAll
          ? 'Kaikki teemat näytetään.'
          : `${selectedAnchors.length}/${MAX_INTEREST_THEMES} teemaa valittu. Muut teemat saa aina näkyviin sivulta.`}
      </p>
    </fieldset>
  );
};

export default InterestThemeSelector;
