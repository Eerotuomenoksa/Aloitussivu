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

  const buttonClass = 'flex h-[3.25rem] w-[3.25rem] md:h-16 md:w-16 items-center justify-center rounded-full bg-[#0f3b24] text-lg md:text-2xl font-black leading-none border-2 border-white/30 shadow-[0_4px_20px_rgba(15,59,36,.32)] transition-all hover:scale-105 hover:bg-[#216b43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c840] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#365443] disabled:text-white disabled:opacity-100';

  if (hidden) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 hidden flex-col items-end gap-3 md:flex" role="group" aria-label={resetLabel}>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        className={`${buttonClass} border-[#9c6500] bg-[#f5c840] text-[#07140a] hover:bg-[#ffd45a] disabled:bg-[#f0d073] disabled:text-[#07140a]`}
        title="Suurenna sivun tekstiä ja painikkeita"
        aria-label={`${increaseLabel} (${uiScale}%)`}
      >
        A+
      </button>
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        className={`${buttonClass} text-white`}
        title="Pienennä sivun tekstiä ja painikkeita"
        aria-label={`${decreaseLabel} (${uiScale}%)`}
      >
        A−
      </button>
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border-2 border-[#9c6500] bg-[#f5c840] px-3 py-2 text-sm font-black text-[#07140a] shadow-[0_4px_20px_rgba(15,59,36,.32)] transition-all hover:bg-[#ffd45a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c840] active:scale-95 md:px-4 md:py-3 md:text-base"
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
        className={`${buttonClass} text-3xl text-white md:text-4xl ${isTopVisible ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none translate-y-4 opacity-0'}`}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
};

export default FloatingControls;
