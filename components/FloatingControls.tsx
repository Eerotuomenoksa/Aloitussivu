import React, { useEffect, useState } from 'react';

interface FloatingControlsProps {
  decreaseLabel: string;
  increaseLabel: string;
  resetLabel: string;
  backToTopLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
  showReset: boolean;
  uiScale: number;
  hidden?: boolean;
}

const SHOW_TOP_AFTER_PX = 500;

const FloatingControls: React.FC<FloatingControlsProps> = ({
  decreaseLabel,
  increaseLabel,
  resetLabel,
  backToTopLabel,
  onDecrease,
  onIncrease,
  onReset,
  canDecrease,
  canIncrease,
  showReset,
  uiScale,
  hidden = false,
}) => {
  const [isTopVisible, setIsTopVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsTopVisible(window.scrollY > SHOW_TOP_AFTER_PX);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const buttonClass = 'flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border-2 text-lg font-black leading-none shadow-[0_4px_20px_rgba(0,0,0,.24)] transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:h-16 md:w-16 md:text-2xl';
  const primaryButtonClass = 'border-white/30 bg-[var(--theme-primary)] text-[var(--theme-primary-label)] hover:bg-[var(--theme-primary-mid)]';
  const accentButtonClass = 'border-[var(--theme-gold)] bg-[var(--theme-gold)] text-[var(--theme-cta-label)] hover:bg-[var(--theme-gold-light)]';

  if (hidden) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 hidden flex-col items-end gap-3 md:flex" role="group" aria-label={resetLabel}>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        className={`${buttonClass} ${accentButtonClass}`}
        title={increaseLabel}
        aria-label={`${increaseLabel} (${uiScale}%)`}
      >
        A+
      </button>
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        className={`${buttonClass} ${primaryButtonClass}`}
        title={decreaseLabel}
        aria-label={`${decreaseLabel} (${uiScale}%)`}
      >
        A−
      </button>
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border-2 border-[var(--theme-gold)] bg-[var(--theme-gold)] px-3 py-2 text-sm font-black text-[var(--theme-cta-label)] shadow-[0_4px_20px_rgba(0,0,0,.24)] transition-all hover:bg-[var(--theme-gold-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)] active:scale-95 md:px-4 md:py-3 md:text-base"
          title={resetLabel}
          aria-label={resetLabel}
        >
          100%
        </button>
      )}
      <button
        type="button"
        onClick={scrollToTop}
        title={backToTopLabel}
        aria-label={backToTopLabel}
        aria-hidden={!isTopVisible}
        tabIndex={isTopVisible ? 0 : -1}
        className={`${buttonClass} ${primaryButtonClass} text-3xl md:text-4xl ${isTopVisible ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none translate-y-4 opacity-0'}`}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
};

export default FloatingControls;
