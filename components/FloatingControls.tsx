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

  const buttonClass = 'flex h-16 w-16 items-center justify-center rounded-full bg-[#173e5f] text-2xl font-black leading-none text-white shadow-2xl border-b-4 border-[#0f2942] transition-all duration-200 hover:bg-[#214f76] focus:outline-none focus:ring-4 focus:ring-[#d09a32]/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-3" role="group" aria-label={resetLabel}>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        className={buttonClass}
        aria-label={`${increaseLabel} (${uiScale}%)`}
      >
        A+
      </button>
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        className={buttonClass}
        aria-label={`${decreaseLabel} (${uiScale}%)`}
      >
        A−
      </button>
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-[#d09a32] px-4 py-3 text-base font-black text-slate-950 shadow-xl border-b-4 border-[#8f651e] transition-all hover:bg-[#e0aa43] focus:outline-none focus:ring-4 focus:ring-amber-200 active:scale-95"
          aria-label={resetLabel}
        >
          100%
        </button>
      )}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={backToTopLabel}
        aria-hidden={!isTopVisible}
        tabIndex={isTopVisible ? 0 : -1}
        className={`${buttonClass} text-4xl ${isTopVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
};

export default FloatingControls;
