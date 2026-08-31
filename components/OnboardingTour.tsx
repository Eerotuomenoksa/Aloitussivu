import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { UiVisibilityKey, UiVisibilityOption, UiVisibilityState } from '../uiPreferences';
import { LocalityInfo } from '../types';
import InterestThemeSelector from './InterestThemeSelector';
import MunicipalitySelector from './MunicipalitySelector';
import { useI18n } from '../i18n';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  selectedThemeAnchors: string[];
  onSelectedThemeAnchorsChange: (anchors: string[]) => void;
  uiVisibility: UiVisibilityState;
  visibilityOptions: UiVisibilityOption[];
  onVisibilityChange: (key: UiVisibilityKey, value: boolean) => void;
  locality: LocalityInfo | null;
  onLocalitySelected: (locality: LocalityInfo) => void;
  onSetHomepage?: () => void;
}

type TourStep = {
  target?: string;
  title: string;
  body: string;
  contains?: string;
  kind?: 'highlight' | 'municipality' | 'preferences' | 'homepage';
};

const tourTranslations: Record<'fi' | 'sv' | 'en', {
  steps: TourStep[];
  step: string;
  preferencesLegend: string;
  preferencesHint: string;
  highlightedContains: string;
  stop: string;
  previous: string;
  done: string;
  next: string;
  homepageCta: string;
  homepageLater: string;
  municipalitySelected: string;
  municipalitySkip: string;
  municipalityContinue: string;
}> = {
  fi: {
    step: 'Vaihe', preferencesLegend: 'Mitä aloitussivulla näkyy',
    preferencesHint: 'Valinnat tulevat voimaan heti. Ne voi vaihtaa myöhemmin Asetuksista.',
    highlightedContains: 'Korostettu kohta sisältää', stop: 'Lopeta', previous: 'Edellinen', done: 'Valmis', next: 'Seuraava',
    homepageCta: 'Aseta aloitussivuksi', homepageLater: 'Ehkä myöhemmin',
    municipalitySelected: 'Valittu: {municipality}. Näet nyt paikkakunnan palvelut, uutiset ja joukkoliikenteen.',
    municipalitySkip: 'Valitsen myöhemmin', municipalityContinue: 'Jatka',
    steps: [
      { target: 'logo', title: 'Seniorin aloitussivu', body: 'Täältä löytyvät arjen tärkeät verkkopalvelut.', contains: 'Sivun nimi ja tunnus. Tästä tunnistaa, että olet Seniorin aloitussivulla.' },
      { target: 'weather', title: 'Sää', body: 'Näet paikallisen sään nyt, huomisen ennusteen ja linkin tarkempiin säätietoihin.', contains: 'Paikkakunnan nykyinen sää ja lämpötila, huomisen säätila ja lämpötilaväli sekä linkki tarkempaan sääennusteeseen.' },
      { target: 'google-search', title: 'Google-haku', body: 'Kirjoita hakusana tai paina mikrofonia ja sano hakusana ääneen. Paina lopuksi Hae.', contains: 'Hakukenttä, mikrofonipainike ja hakupainike internetistä etsimistä varten.' },
      { target: 'scam-alerts', title: 'Huijausvaroitukset', body: 'Täältä näet ajankohtaisia varoituksia.', contains: 'Ajankohtaiset varoitukset, joita klikkaamalla näet lisätiedot.' },
      { target: 'favorites', title: 'Suosikit', body: 'Tallenna tärkeät linkit nopeaa käyttöä varten.', contains: 'Omat tallennetut linkit. Jos suosikkeja ei vielä ole, alue voi olla tyhjä.' },
      { kind: 'municipality', title: 'Valitse kotikuntasi', body: 'Saat oman alueesi palvelut, uutiset, joukkoliikenteen ja sään näkyviin. Voit myös valita kunnan myöhemmin.' },
      { target: 'local-news', title: 'Paikalliset uutiset', body: 'Paikalliset otsikot vievät alkuperäisen lehden sivulle.', contains: 'Otsikoita paikallisista uutislähteistä ja linkki lehden sivulle.' },
      { target: 'quick-links', title: 'Kategoriat', body: 'Avaa aihealue ja valitse tarvitsemasi palvelu. Palveluhaussa voit myös painaa mikrofonia ja sanoa hakusanan ääneen.', contains: 'Pääkategoriat, palveluhaku ja alakategoriat, joista palvelulinkit avautuvat.' },
      { kind: 'preferences', title: 'Tee sivusta omasi', body: 'Valitse kiinnostavat teemat ja ne osiot, jotka haluat nähdä aloitussivulla.' },
      { kind: 'homepage', title: 'Ota sivu käyttöön', body: 'Tämä sivu on hyödyllisin selaimesi aloitussivuna. Silloin se avautuu itsestään, kun avaat netin. Näytämme ohjeet omalle selaimellesi.' },
      { target: 'settings', title: 'Asetukset', body: 'Muuta tekstikokoa, teemaa ja näkyviä osioita.', contains: 'Rataspainike, josta avautuvat sivun omat asetukset.' },
    ],
  },
  sv: {
    step: 'Steg', preferencesLegend: 'Vad som visas på startsidan',
    preferencesHint: 'Valen börjar gälla genast. De kan ändras senare i Inställningar.',
    highlightedContains: 'Det markerade området innehåller', stop: 'Avsluta', previous: 'Föregående', done: 'Klar', next: 'Nästa',
    homepageCta: 'Ställ in som startsida', homepageLater: 'Kanske senare',
    municipalitySelected: 'Vald: {municipality}. Du ser nu ortens tjänster, nyheter och kollektivtrafik.',
    municipalitySkip: 'Jag väljer senare', municipalityContinue: 'Fortsätt',
    steps: [
      { target: 'logo', title: 'Seniorin aloitussivu', body: 'Här hittar du viktiga webbtjänster för vardagen.', contains: 'Sidans namn och kännetecken, som visar att du är på Seniorin aloitussivu.' },
      { target: 'weather', title: 'Väder', body: 'Du ser det lokala vädret nu, morgondagens prognos och en länk till mer detaljerad väderinformation.', contains: 'Ortens aktuella väder och temperatur, morgondagens väder och temperaturintervall samt en länk till en mer detaljerad prognos.' },
      { target: 'google-search', title: 'Google-sökning', body: 'Skriv ett sökord eller tryck på mikrofonen och säg sökordet. Tryck sedan på Sök.', contains: 'Sökfält, mikrofonknapp och sökknapp för att söka på internet.' },
      { target: 'scam-alerts', title: 'Bedrägerivarningar', body: 'Här ser du aktuella varningar.', contains: 'Aktuella varningar som du kan öppna för mer information.' },
      { target: 'favorites', title: 'Favoriter', body: 'Spara viktiga länkar för snabb åtkomst.', contains: 'Dina sparade länkar. Om du ännu inte har favoriter kan området vara tomt.' },
      { kind: 'municipality', title: 'Välj din hemkommun', body: 'Du får tjänster, nyheter, kollektivtrafik och väder för ditt område. Du kan också välja kommunen senare.' },
      { target: 'local-news', title: 'Lokala nyheter', body: 'Lokala rubriker leder till den ursprungliga tidningens sida.', contains: 'Rubriker från lokala nyhetskällor och en länk till tidningens sida.' },
      { target: 'quick-links', title: 'Kategorier', body: 'Öppna ett ämne och välj den tjänst du behöver. I tjänstesökningen kan du också trycka på mikrofonen och säga sökordet.', contains: 'Huvudkategorier, tjänstesökning och underkategorier som öppnar tjänstelänkar.' },
      { kind: 'preferences', title: 'Gör sidan till din egen', body: 'Välj intressanta teman och de avsnitt som du vill se på startsidan.' },
      { kind: 'homepage', title: 'Ta sidan i bruk', body: 'Sidan är mest användbar som webbläsarens startsida. Då öppnas den av sig själv när du går ut på nätet. Vi visar anvisningarna för din egen webbläsare.' },
      { target: 'settings', title: 'Inställningar', body: 'Ändra textstorlek, tema och synliga avsnitt.', contains: 'Kugghjulsknappen som öppnar sidans inställningar.' },
    ],
  },
  en: {
    step: 'Step', preferencesLegend: 'What is shown on the start page',
    preferencesHint: 'Your choices take effect immediately. You can change them later in Settings.',
    highlightedContains: 'The highlighted area contains', stop: 'End tour', previous: 'Previous', done: 'Done', next: 'Next',
    homepageCta: 'Set as start page', homepageLater: 'Maybe later',
    municipalitySelected: 'Selected: {municipality}. You can now see local services, news and public transport.',
    municipalitySkip: 'I will choose later', municipalityContinue: 'Continue',
    steps: [
      { target: 'logo', title: 'Seniorin aloitussivu', body: 'Here you can find important online services for everyday life.', contains: 'The page name and identifier, showing that you are on Seniorin aloitussivu.' },
      { target: 'weather', title: 'Weather', body: 'You can see the current local weather, tomorrow’s forecast and a link to more detailed weather information.', contains: 'The location’s current weather and temperature, tomorrow’s conditions and temperature range, and a link to a more detailed forecast.' },
      { target: 'google-search', title: 'Google search', body: 'Enter a search term or press the microphone and say it aloud. Then press Search.', contains: 'A search field, microphone button and search button for finding information online.' },
      { target: 'scam-alerts', title: 'Scam alerts', body: 'Current alerts are shown here.', contains: 'Current alerts that you can open for more information.' },
      { target: 'favorites', title: 'Favourites', body: 'Save important links for quick access.', contains: 'Your saved links. If you do not have any favourites yet, the area may be empty.' },
      { kind: 'municipality', title: 'Select your home municipality', body: 'See services, news, public transport and weather for your area. You can also choose the municipality later.' },
      { target: 'local-news', title: 'Local news', body: 'Local headlines open the original newspaper’s page.', contains: 'Headlines from local news sources and a link to the newspaper’s page.' },
      { target: 'quick-links', title: 'Categories', body: 'Open a topic and select the service you need. You can also press the microphone in service search and say the search term.', contains: 'Main categories, service search and subcategories that open service links.' },
      { kind: 'preferences', title: 'Make the page your own', body: 'Select themes of interest and the sections you want to see on the start page.' },
      { kind: 'homepage', title: 'Start using the page', body: 'This page is most useful as your browser start page. Then it opens by itself when you go online. We will show the instructions for your own browser.' },
      { target: 'settings', title: 'Settings', body: 'Change text size, theme and visible sections.', contains: 'The cog button that opens the page settings.' },
    ],
  },
};

const isVisibleTourTarget = (target: string) => {
  const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && window.getComputedStyle(element).display !== 'none';
};

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
  selectedThemeAnchors,
  onSelectedThemeAnchorsChange,
  uiVisibility,
  visibilityOptions,
  onVisibilityChange,
  locality,
  onLocalitySelected,
  onSetHomepage,
}) => {
  const { language } = useI18n();
  const copy = tourTranslations[language === 'sv' || language === 'en' ? language : 'fi'];
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [availableSteps, setAvailableSteps] = useState<TourStep[]>(copy.steps);
  const dialogRef = useRef<HTMLDivElement>(null);
  const step = availableSteps[stepIndex] ?? availableSteps[0] ?? copy.steps[0];

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
    setAvailableSteps(copy.steps.filter((item) => item.kind === 'municipality' || item.kind === 'preferences' || item.kind === 'homepage' || Boolean(item.target && isVisibleTourTarget(item.target))));
    setStepIndex(0);
  }, [copy, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;

    let animationFrame: number | undefined;
    let settleTimer: number | undefined;

    const measureTarget = () => {
      if (!step.target) {
        setTargetRect(null);
        return;
      }
      const element = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!element) {
        setTargetRect(null);
        return;
      }
      setTargetRect(element.getBoundingClientRect());
    };

    const scheduleMeasurement = () => {
      if (animationFrame !== undefined) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = undefined;
        measureTarget();
      });
    };

    const element = step.target
      ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      : null;
    if (element) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      scheduleMeasurement();
      if (!prefersReducedMotion) {
        settleTimer = window.setTimeout(scheduleMeasurement, 220);
      }
    } else {
      setTargetRect(null);
    }

    window.addEventListener('resize', scheduleMeasurement);
    window.addEventListener('scroll', scheduleMeasurement, { passive: true });
    return () => {
      window.removeEventListener('resize', scheduleMeasurement);
      window.removeEventListener('scroll', scheduleMeasurement);
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (settleTimer !== undefined) {
        window.clearTimeout(settleTimer);
      }
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
  const advance = () => setStepIndex((current) => Math.min(availableSteps.length - 1, current + 1));

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
        className={`aurora-modal-shell fixed inset-x-4 bottom-4 mx-auto overflow-y-auto rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-[var(--theme-text)] shadow-2xl outline-none sm:bottom-6 md:inset-x-1/2 md:bottom-auto md:top-1/2 md:max-h-[80dvh] md:w-[min(44rem,calc(100vw-3rem))] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[2rem] md:p-6 ${step.kind === 'preferences' || step.kind === 'municipality' ? 'max-h-[calc(100dvh-2rem)]' : 'max-h-[42dvh]'}`}
      >
        <p className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)] md:text-sm">
          {copy.step} {visibleStepNumber}/{availableSteps.length}
        </p>
        <h2 id="onboarding-title" className="mt-1 text-xl font-black md:mt-2 md:text-3xl">
          {step.title}
        </h2>
        <p id="onboarding-description" className="mt-2 text-base font-bold leading-snug text-[var(--theme-muted)] md:mt-3 md:text-lg md:leading-relaxed">
          {step.body}
        </p>
        {step.kind === 'municipality' ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border-2 border-[var(--theme-border)] p-4">
              <MunicipalitySelector
                locality={locality}
                onLocalitySelected={onLocalitySelected}
                compact
              />
            </div>
            {locality?.municipality ? (
              <p className="rounded-2xl border-2 border-[var(--theme-gold)] bg-[var(--theme-gold-pale)] p-4 text-base font-black leading-relaxed text-[var(--theme-text)]" role="status" aria-live="polite">
                {copy.municipalitySelected.replace('{municipality}', locality.displayName || locality.municipality)}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={advance}
                className="min-h-14 rounded-2xl bg-[var(--theme-pale)] px-5 py-3 text-base font-black text-[var(--theme-text)] transition-all hover:bg-[var(--theme-gold-pale)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30"
              >
                {copy.municipalitySkip}
              </button>
              <button
                type="button"
                onClick={advance}
                disabled={!locality?.municipality}
                className="min-h-14 rounded-2xl bg-[var(--theme-primary)] px-5 py-3 text-base font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.municipalityContinue}
              </button>
            </div>
          </div>
        ) : step.kind === 'preferences' ? (
          <div className="mt-4 space-y-4">
            <InterestThemeSelector
              selectedAnchors={selectedThemeAnchors}
              onChange={onSelectedThemeAnchorsChange}
            />

            <fieldset className="rounded-2xl border-2 border-[var(--theme-border)] p-4">
              <legend className="px-1 font-black text-[var(--theme-text)]">{copy.preferencesLegend}</legend>
              <p className="mt-1 text-sm font-bold leading-relaxed text-[var(--theme-muted)]">
                {copy.preferencesHint}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {visibilityOptions.map((option) => (
                  <label
                    key={option.key}
                    className={`${option.className ?? 'flex'} min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 font-bold text-[var(--theme-text)]`}
                  >
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      checked={uiVisibility[option.key]}
                      onChange={(event) => onVisibilityChange(option.key, event.target.checked)}
                      className="h-7 w-7 shrink-0 accent-[var(--theme-primary)]"
                      aria-label={option.label}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : step.kind === 'homepage' ? (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => { finish(); onSetHomepage?.(); }}
              className="w-full rounded-2xl bg-[var(--theme-gold)] px-5 py-4 text-lg font-black text-[var(--theme-primary-dark)] shadow-md transition-all hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40 active:scale-95"
            >
              {copy.homepageCta}
            </button>
            <button
              type="button"
              onClick={finish}
              className="w-full rounded-2xl bg-[var(--theme-pale)] px-5 py-3 text-base font-black text-[var(--theme-text)] transition-all hover:bg-[var(--theme-gold-pale)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30"
            >
              {copy.homepageLater}
            </button>
          </div>
        ) : step.contains ? (
          <div className="mt-4 hidden rounded-2xl border-2 border-[var(--theme-gold)] bg-[var(--theme-gold-pale)] p-4 md:block">
            <p className="text-sm font-black uppercase tracking-widest text-[var(--theme-primary)]">
              {copy.highlightedContains}
            </p>
            <p className="mt-1 text-base font-black leading-relaxed text-[var(--theme-text)]">
              {step.contains}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 md:mt-5 md:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[var(--theme-pale)] px-4 py-2 text-sm font-black text-[var(--theme-text)] transition-all hover:bg-[var(--theme-gold-pale)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 md:px-5 md:py-3 md:text-base"
          >
            {copy.stop}
          </button>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="rounded-full bg-[var(--theme-pale)] px-4 py-2 text-sm font-black text-[var(--theme-text)] transition-all hover:bg-[var(--theme-gold-pale)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 disabled:opacity-40 md:px-5 md:py-3 md:text-base"
            >
              {copy.previous}
            </button>
            {step.kind !== 'homepage' && step.kind !== 'municipality' && (
              <button
                type="button"
                onClick={isLastStep ? finish : advance}
                className="rounded-full bg-[var(--theme-primary)] px-5 py-2 text-sm font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 active:scale-95 md:px-6 md:py-3 md:text-base"
              >
                {isLastStep ? copy.done : copy.next}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(tour, document.body);
};

export default OnboardingTour;
