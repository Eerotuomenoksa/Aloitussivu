import React, { useEffect, useMemo, useRef, useState } from 'react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type TourStep = {
  target: string;
  title: string;
  body: string;
};

const steps: TourStep[] = [
  {
    target: 'logo',
    title: 'SeniorSurfin aloitussivu',
    body: 'Tämä sivu kokoaa arjen tärkeät verkkopalvelut selkeään näkymään.',
  },
  {
    target: 'google-search',
    title: 'Google-haku',
    body: 'Tällä hakukentällä voit etsiä tietoa internetistä ilman, että sinun tarvitsee ensin avata erillistä hakusivua.',
  },
  {
    target: 'assistant',
    title: 'Tekoälyavustaja',
    body: 'Tekoälylle voi kirjoittaa kysymyksen tavallisella suomen kielellä. Se auttaa esimerkiksi löytämään oikean palvelun tai selittämään vaikeaa termiä.',
  },
  {
    target: 'weather',
    title: 'Sää',
    body: 'Sää tulee sijainnin perusteella Ilmatieteen laitoksen avoimesta säädatasta. Tarkemman ennusteen voi avata Ilmatieteen laitoksen sivulle.',
  },
  {
    target: 'regional-services',
    title: 'Paikalliset palvelut',
    body: 'Paikkakunnan mukaan näkyvät kunnan palvelut, hyvinvointialue, paikalliset uutiset ja muut lähialueen linkit.',
  },
  {
    target: 'local-news',
    title: 'Paikalliset uutiset',
    body: 'Uutisotsikot tulevat paikallisten lehtien RSS-syötteistä silloin, kun paikkakunnalle löytyy sopiva uutislähde. Linkki vie aina alkuperäiseen lehteen.',
  },
  {
    target: 'scam-alerts',
    title: 'Huijausvaroitukset',
    body: 'Huijausvaroitukset tulevat ylläpidon lisäämistä varoituksista ja Kyberturvallisuuskeskuksen viikkokatsauksista poimituista aiheista.',
  },
  {
    target: 'favorites',
    title: 'Suosikit',
    body: 'Kun lisäät linkin suosikiksi, se löytyy jatkossa nopeasti etusivulta.',
  },
  {
    target: 'quick-links',
    title: 'Kategoriat',
    body: 'Isot laatikot avaavat aihealueet, kuten terveyden, pankit, uutiset, liikenteen ja kulttuurin.',
  },
  {
    target: 'settings',
    title: 'Asetukset',
    body: 'Asetuksista voi suurentaa tekstiä, vaihtaa teemaa ja piilottaa etusivun osioita.',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const step = steps[stepIndex];

  const visibleStepNumber = stepIndex + 1;
  const isLastStep = stepIndex === steps.length - 1;

  const highlightStyle = useMemo(() => {
    if (!targetRect) return undefined;
    const padding = 10;
    return {
      left: Math.max(8, targetRect.left - padding),
      top: Math.max(8, targetRect.top - padding),
      width: Math.min(window.innerWidth - 16, targetRect.width + padding * 2),
      height: Math.min(window.innerHeight - 16, targetRect.height + padding * 2),
    };
  }, [targetRect]);

  useEffect(() => {
    if (!isOpen) return;
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
      if (event.key === 'ArrowRight') setStepIndex((current) => Math.min(steps.length - 1, current + 1));
      if (event.key === 'ArrowLeft') setStepIndex((current) => Math.max(0, current - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const finish = () => {
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/55 backdrop-blur-[2px]" role="presentation">
      {highlightStyle && (
        <div
          className="pointer-events-none fixed rounded-[2rem] border-4 border-[#d09a32] bg-white/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.58),0_0_0_8px_rgba(208,154,50,0.25)]"
          style={highlightStyle}
          aria-hidden="true"
        />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        tabIndex={-1}
        className="fixed inset-x-3 bottom-3 mx-auto max-w-2xl rounded-[2rem] border-4 border-white/20 bg-white p-5 text-slate-900 shadow-2xl outline-none dark:bg-slate-900 dark:text-white sm:bottom-6 sm:p-6 md:inset-x-1/2 md:bottom-auto md:top-1/2 md:w-[min(48rem,calc(100vw-3rem))] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:p-8"
      >
        <p className="text-sm font-black uppercase tracking-widest text-[#173e5f] dark:text-blue-200">
          Vaihe {visibleStepNumber}/{steps.length}
        </p>
        <h2 id="onboarding-title" className="mt-2 text-2xl font-black md:text-3xl">
          {step.title}
        </h2>
        <p id="onboarding-description" className="mt-3 text-lg font-bold leading-relaxed text-slate-600 dark:text-slate-300">
          {step.body}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-700 transition-all hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Lopeta
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-700 transition-all hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Edellinen
            </button>
            <button
              type="button"
              onClick={isLastStep ? finish : () => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
              className="rounded-full bg-indigo-600 px-6 py-3 font-black text-white shadow-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95"
            >
              {isLastStep ? 'Valmis' : 'Seuraava'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
