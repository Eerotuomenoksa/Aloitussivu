import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type TourStep = {
  target: string;
  title: string;
  body: string;
  contains: string;
};

const steps: TourStep[] = [
  {
    target: 'logo',
    title: 'SeniorSurfin aloitussivu',
    body: 'Täältä löytyvät arjen tärkeät verkkopalvelut.',
    contains: 'Sivun nimi ja tunnus. Tästä tunnistaa, että olet SeniorSurfin aloitussivulla.',
  },
  {
    target: 'google-search',
    title: 'Google-haku',
    body: 'Kirjoita hakusana ja paina Hae.',
    contains: 'Hakukenttä ja hakupainike internetistä etsimistä varten.',
  },
  {
    target: 'assistant',
    title: 'Tekoälyavustaja',
    body: 'Voit kysyä apua tavallisella suomen kielellä.',
    contains: 'Painike, josta avautuu keskusteluavustaja kysymyksiä varten.',
  },
  {
    target: 'weather',
    title: 'Sää',
    body: 'Näet paikallisen sään ja linkin tarkempaan ennusteeseen.',
    contains: 'Paikkakunnan sää, lämpötila ja linkki tarkempaan sääennusteeseen.',
  },
  {
    target: 'regional-services',
    title: 'Paikalliset palvelut',
    body: 'Valitse paikkakunta, niin saat paikalliset linkit.',
    contains: 'Kuntavalinta sekä oman alueen palvelu-, uutis- ja varoitusnostot.',
  },
  {
    target: 'local-news',
    title: 'Paikalliset uutiset',
    body: 'Paikalliset otsikot vievät alkuperäisen lehden sivulle.',
    contains: 'Otsikoita paikallisista uutislähteistä ja linkki lehden sivulle.',
  },
  {
    target: 'scam-alerts',
    title: 'Huijausvaroitukset',
    body: 'Täältä näet ajankohtaisia varoituksia.',
    contains: 'Ajankohtaiset varoitukset, joita klikkaamalla näet lisätiedot.',
  },
  {
    target: 'favorites',
    title: 'Suosikit',
    body: 'Tallenna tärkeät linkit nopeaa käyttöä varten.',
    contains: 'Omat tallennetut linkit. Jos suosikkeja ei vielä ole, alue voi olla tyhjä.',
  },
  {
    target: 'quick-links',
    title: 'Kategoriat',
    body: 'Avaa aihealue ja valitse tarvitsemasi palvelu.',
    contains: 'Pääkategoriat ja niiden alakategoriat, joista palvelulinkit avautuvat.',
  },
  {
    target: 'settings',
    title: 'Asetukset',
    body: 'Muuta tekstikokoa, teemaa ja näkyviä osioita.',
    contains: 'Rataspainike, josta avautuvat sivun omat asetukset.',
  },
];

const isVisibleTourTarget = (target: string) => {
  const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!element) return true;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && window.getComputedStyle(element).display !== 'none';
};

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [availableSteps, setAvailableSteps] = useState<TourStep[]>(steps);
  const dialogRef = useRef<HTMLDivElement>(null);
  const step = availableSteps[stepIndex] ?? availableSteps[0] ?? steps[0];

  const visibleStepNumber = stepIndex + 1;
  const isLastStep = stepIndex === availableSteps.length - 1;

  const highlightStyle = useMemo(() => {
    if (!targetRect) return undefined;
    const padding = 10;
    const left = Math.max(8, targetRect.left - padding);
    const top = Math.max(8, targetRect.top - padding);
    const width = Math.min(window.innerWidth - 16 - left, targetRect.width + padding * 2);
    const height = Math.min(window.innerHeight - 16 - top, targetRect.height + padding * 2);
    return {
      left,
      top,
      width,
      height,
      right: Math.max(0, window.innerWidth - left - width),
      bottom: Math.max(0, window.innerHeight - top - height),
    };
  }, [targetRect]);

  useEffect(() => {
    if (!isOpen) return;
    setAvailableSteps(steps.filter((item) => isVisibleTourTarget(item.target)));
    setStepIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const updateTarget = () => {
      const element = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!element) {
        setTargetRect(null);
        return;
      }
      element.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      window.setTimeout(() => setTargetRect(element.getBoundingClientRect()), 220);
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, { passive: true });
    return () => {
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget);
    };
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setStepIndex((current) => Math.min(availableSteps.length - 1, current + 1));
      if (event.key === 'ArrowLeft') setStepIndex((current) => Math.max(0, current - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableSteps.length, isOpen, onClose]);

  if (!isOpen) return null;

  const finish = () => {
    onComplete();
    onClose();
  };

  const tour = (
    <div className="fixed inset-0 z-[70]" role="presentation">
      {highlightStyle && (
        <>
          <div className="pointer-events-none fixed left-0 right-0 top-0 bg-slate-950/58 backdrop-blur-[2px]" style={{ height: highlightStyle.top }} aria-hidden="true" />
          <div className="pointer-events-none fixed left-0 bg-slate-950/58 backdrop-blur-[2px]" style={{ top: highlightStyle.top, width: highlightStyle.left, height: highlightStyle.height }} aria-hidden="true" />
          <div className="pointer-events-none fixed bg-slate-950/58 backdrop-blur-[2px]" style={{ left: highlightStyle.left + highlightStyle.width, right: 0, top: highlightStyle.top, height: highlightStyle.height }} aria-hidden="true" />
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 bg-slate-950/58 backdrop-blur-[2px]" style={{ top: highlightStyle.top + highlightStyle.height }} aria-hidden="true" />
          <div
            className="pointer-events-none fixed rounded-[2rem] border-[6px] border-[#f5c14b] shadow-[0_0_0_10px_rgba(245,193,75,0.25)]"
            style={highlightStyle}
            aria-hidden="true"
          />
        </>
      )}
      {!highlightStyle && <div className="pointer-events-none fixed inset-0 bg-slate-950/58 backdrop-blur-[2px]" aria-hidden="true" />}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        tabIndex={-1}
        className="fixed inset-x-4 bottom-4 mx-auto max-h-[42dvh] overflow-y-auto rounded-2xl border-2 border-white/20 bg-white p-4 text-slate-900 shadow-2xl outline-none dark:bg-slate-900 dark:text-white sm:bottom-6 md:inset-x-1/2 md:bottom-auto md:top-1/2 md:max-h-[80dvh] md:w-[min(44rem,calc(100vw-3rem))] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[2rem] md:border-4 md:p-6"
      >
        <p className="text-xs font-black uppercase tracking-widest text-[#173e5f] dark:text-blue-200 md:text-sm">
          Vaihe {visibleStepNumber}/{availableSteps.length}
        </p>
        <h2 id="onboarding-title" className="mt-1 text-xl font-black md:mt-2 md:text-3xl">
          {step.title}
        </h2>
        <p id="onboarding-description" className="mt-2 text-base font-bold leading-snug text-slate-600 dark:text-slate-300 md:mt-3 md:text-lg md:leading-relaxed">
          {step.body}
        </p>
        <div className="mt-4 hidden rounded-2xl border-2 border-[#d09a32]/40 bg-amber-50 p-4 dark:border-[#d09a32]/50 dark:bg-amber-950/30 md:block">
          <p className="text-sm font-black uppercase tracking-widest text-amber-900 dark:text-amber-200">
            Korostettu kohta sisältää
          </p>
          <p className="mt-1 text-base font-black leading-relaxed text-slate-900 dark:text-white">
            {step.contains}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 md:mt-5 md:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition-all hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:px-5 md:py-3 md:text-base"
          >
            Lopeta
          </button>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition-all hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:px-5 md:py-3 md:text-base"
            >
              Edellinen
            </button>
            <button
              type="button"
              onClick={isLastStep ? finish : () => setStepIndex((current) => Math.min(availableSteps.length - 1, current + 1))}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-black text-white shadow-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95 md:px-6 md:py-3 md:text-base"
            >
              {isLastStep ? 'Valmis' : 'Seuraava'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(tour, document.body);
};

export default OnboardingTour;
