import React, { useEffect, useState } from 'react';

interface BackToTopButtonProps {
  label: string;
}

const SHOW_AFTER_PX = 500;

const BackToTopButton: React.FC<BackToTopButtonProps> = ({ label }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_PX);
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

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-4xl font-black leading-none text-white shadow-2xl border-b-4 border-indigo-900 transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95 ${isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
};

export default BackToTopButton;
