import React, { useEffect, useRef } from 'react';

interface TestFeedbackPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onPostpone: () => void;
}

const TestFeedbackPrompt: React.FC<TestFeedbackPromptProps> = ({
  isOpen,
  onClose,
  onPostpone,
}) => {
  const laterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => laterButtonRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-feedback-prompt-title"
    >
      <div className="w-full max-w-xl rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 text-[var(--theme-text)] shadow-[0_18px_70px_rgba(0,0,0,.28)] md:p-6">
        <p className="text-sm font-black uppercase tracking-[.16em] text-[var(--theme-primary)]">
          Testaus
        </p>
        <h2 id="test-feedback-prompt-title" className="aurora-section-title mt-2 text-3xl">
          Haluatko vastata lyhyeen kyselyyn?
        </h2>
        <p className="mt-3 font-semibold leading-relaxed text-[var(--theme-text-2)]">
          Kun olet ehtinyt tutustua sivuun hetken, vastauksesi auttaa viimeistelemään aloitussivua.
        </p>
        <p className="mt-3 rounded-2xl bg-[var(--theme-pale)] p-3 text-sm font-bold text-[var(--theme-text-2)]">
          Kysely on anonyymi. Älä kirjoita vastauksiin nimeä, yhteystietoja tai arkaluonteisia tietoja.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={laterButtonRef}
            type="button"
            onClick={onPostpone}
            className="aurora-secondary-button min-h-12 px-5 py-3"
          >
            Vastaan myöhemmin
          </button>
          <a
            href="./testipalaute.html"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 py-3 text-center font-black text-white no-underline transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95"
          >
            Vastaa nyt
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestFeedbackPrompt;
