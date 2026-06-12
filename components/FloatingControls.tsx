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

  const buttonClass = 'flex h-[3.25rem] w-[3.25rem] md:h-16 md:w-16 items-center justify-center rounded-full bg-[#1a4d2e] text-lg md:text-2xl font-black leading-none text-white border-2 border-white/20 shadow-[0_4px_20px_rgba(26,77,46,.3)] transition-all hover:scale-105 hover:bg-[#2e7d50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a020] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed';

  if (hidden) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 hidden flex-col items-end gap-3 md:flex" role="group" aria-label={resetLabel}>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        className={`${buttonClass} bg-[#e8a020] text-[#1a2e1e] border-[#c27e10]`}
        title="Suurenna sivun tekstiä ja painikkeita"
        aria-label={`${increaseLabel} (${uiScale}%)`}
      >
        A+
      </button>
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        className={buttonClass}
        title="Pienennä sivun tekstiä ja painikkeita"
        aria-label={`${decreaseLabel} (${uiScale}%)`}
      >
        A−
      </button>
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-[#e8a020] px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-black text-[#1a2e1e] shadow-[0_4px_20px_rgba(26,77,46,.3)] border-2 border-[#c27e10] transition-all hover:bg-[#f0b030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a020] active:scale-95"
          title="Palauta tekstikoko normaaliksi"
          aria-label={resetLabel}
        >
          100%
        </button>
      )}
      <button
        type="button"
        onClick={scrollToTop}
        title="Palaa sivun alkuun"
        aria-label={backToTopLabel}
        aria-hidden={!isTopVisible}
        tabIndex={isTopVisible ? 0 : -1}
        className={`${buttonClass} text-3xl md:text-4xl ${isTopVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
};

export default FloatingControls;
