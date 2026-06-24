import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  syncLocalTestFeedbackResponses,
  submitTestFeedback,
  type TestDeviceType,
  type TestFeatureKey,
  type TestFeatureRatings,
  type TestFeedbackDraft,
} from './testFeedback';
import { installUsageTracking } from './usageTracking';

type ChoiceOption = {
  value: string;
  label: string;
  hint?: string;
};

const deviceOptions: { value: TestDeviceType; label: string }[] = [
  { value: 'phone', label: 'Puhelin' },
  { value: 'tablet', label: 'Tabletti' },
  { value: 'computer', label: 'Tietokone' },
];

const useModeOptions: ChoiceOption[] = [
  { value: 'self', label: 'Käytin itse' },
  { value: 'withSomeone', label: 'Käytin yhdessä toisen henkilön kanssa' },
  { value: 'guidance', label: 'Testasin opastustilanteessa' },
];

const webExperienceOptions: ChoiceOption[] = [
  { value: 'often', label: 'Käytän verkkopalveluja usein' },
  { value: 'sometimes', label: 'Käytän verkkopalveluja joskus' },
  { value: 'needsHelp', label: 'Tarvitsen usein apua' },
  { value: 'observer', label: 'Vastaan opastajan tai havainnoijan näkökulmasta' },
];

const yesPartlyNoOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'partly', label: 'Osittain' },
  { value: 'no', label: 'Ei' },
];

const foundServiceOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'partly', label: 'Osittain' },
  { value: 'no', label: 'En' },
];

const pageFeelingOptions: ChoiceOption[] = [
  { value: 'clear', label: 'Selkeältä' },
  { value: 'calm', label: 'Rauhalliselta' },
  { value: 'useful', label: 'Hyödylliseltä' },
  { value: 'tooFull', label: 'Liian täydeltä' },
  { value: 'confusing', label: 'Liian sekavalta' },
  { value: 'pleasant', label: 'Mukavan näköiseltä' },
];

const municipalityOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'no', label: 'Ei' },
  { value: 'notSeen', label: 'En huomannut' },
];

const localUsefulnessOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'partly', label: 'Osittain' },
  { value: 'no', label: 'Ei' },
  { value: 'notUsed', label: 'En käyttänyt niitä' },
];

const localNewsOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'partly', label: 'Osittain' },
  { value: 'no', label: 'Ei' },
  { value: 'notSeen', label: 'En huomannut niitä' },
];

const textSizeOptions: ChoiceOption[] = [
  { value: 'good', label: 'Sopiva' },
  { value: 'tooSmall', label: 'Liian pieni' },
  { value: 'tooLarge', label: 'Liian suuri' },
  { value: 'changed', label: 'Vaihtelin kokoa asetuksista' },
];

const mobileEaseOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'partly', label: 'Osittain' },
  { value: 'no', label: 'Ei' },
  { value: 'notTested', label: 'En testannut puhelimella' },
];

const tourViewedOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'partly', label: 'Osittain' },
  { value: 'no', label: 'En' },
];

const tourHelpfulOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'partly', label: 'Osittain' },
  { value: 'no', label: 'Ei' },
  { value: 'notViewed', label: 'En katsonut' },
];

const recommendOptions: ChoiceOption[] = [
  { value: 'yes', label: 'Kyllä' },
  { value: 'maybe', label: 'Ehkä' },
  { value: 'no', label: 'En' },
];

const featureOptions: { key: TestFeatureKey; label: string }[] = [
  { key: 'weather', label: 'Sää' },
  { key: 'assistant', label: 'Tekoäly' },
  { key: 'internetSearch', label: 'Internet-haku' },
  { key: 'scamAlerts', label: 'Huijausvaroitukset' },
  { key: 'nearby', label: 'Lähelläsi' },
  { key: 'favorites', label: 'Suosikit' },
  { key: 'categorySearch', label: 'Kategoriahaku' },
  { key: 'namedays', label: 'Nimipäivät (ei näy heinäkuussa)' },
  { key: 'localNews', label: 'Paikalliset uutiset' },
];

const initialDraft: TestFeedbackDraft = {
  deviceTypes: [],
  useMode: '',
  webExperience: '',
  purposeClear: '',
  firstImpression: '',
  pageFeelings: [],
  foundServices: '',
  searchedFor: '',
  missingService: '',
  categoryClarity: '',
  unclearCategory: '',
  municipalityCorrect: '',
  localServicesUseful: '',
  missingLocalLink: '',
  localNewsUseful: '',
  featureRatings: {},
  missingFeature: '',
  textSize: '',
  contrastClarity: '',
  mobileEase: '',
  difficultPart: '',
  tourViewed: '',
  tourHelpful: '',
  tourFeedback: '',
  usefulnessRating: 0,
  easeRating: 0,
  recommend: '',
  mostImportantFix: '',
  bestThing: '',
};

const toggleListValue = <T extends string,>(values: T[], value: T) => (
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
);

function HomeLink({ className = '' }: { className?: string }) {
  return (
    <a href="./index.html" className={`aurora-primary-link text-base ${className}`}>
      ← Palaa etusivulle
    </a>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="aurora-panel space-y-5" aria-labelledby={`section-${number}`}>
      <div>
        <p className="text-sm font-black uppercase tracking-[.16em] text-[var(--theme-primary)]">
          Kohta {number}
        </p>
        <h2 id={`section-${number}`} className="aurora-section-title mt-1 text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="block text-base font-black text-[var(--theme-text)]">
      {children}
      {required ? <span className="ml-1 text-rose-700 dark:text-rose-300">*</span> : null}
    </span>
  );
}

function ChoiceGroup({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  options: ChoiceOption[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-3">
      <legend>
        <FieldLabel required={required}>{label}</FieldLabel>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 font-bold transition-colors ${
              value === option.value
                ? 'border-[var(--theme-primary)] bg-[var(--theme-pale)] text-[var(--theme-text)]'
                : 'border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-2)] hover:bg-[var(--theme-pale)]'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-5 w-5 shrink-0 accent-[var(--theme-primary)]"
              required={required}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGroup<T extends string>({
  label,
  values,
  options,
  onChange,
  required = false,
}: {
  label: string;
  values: T[];
  options: { value: T; label: string }[];
  onChange: (values: T[]) => void;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-3">
      <legend>
        <FieldLabel required={required}>{label}</FieldLabel>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 font-bold transition-colors ${
              values.includes(option.value)
                ? 'border-[var(--theme-primary)] bg-[var(--theme-pale)] text-[var(--theme-text)]'
                : 'border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-2)] hover:bg-[var(--theme-pale)]'
            }`}
          >
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => onChange(toggleListValue(values, option.value))}
              className="h-5 w-5 shrink-0 accent-[var(--theme-primary)]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {required ? (
        <p className="text-sm font-bold text-[var(--theme-muted)]">Valitse vähintään yksi vaihtoehto.</p>
      ) : null}
    </fieldset>
  );
}

function TextQuestion({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="block space-y-2">
      <FieldLabel required={required}>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="aurora-input w-full resize-y rounded-2xl px-4 py-3 font-bold"
        rows={rows}
        placeholder={placeholder}
        required={required}
        minLength={required ? 3 : undefined}
        maxLength={1200}
      />
    </label>
  );
}

function RatingScale({
  label,
  name,
  value,
  onChange,
  required = false,
  lowLabel,
  highLabel,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend>
        <FieldLabel required={required}>{label}</FieldLabel>
      </legend>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label
            key={rating}
            className={`flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 px-2 py-2 text-center font-black transition-colors ${
              value === rating
                ? 'border-[var(--theme-primary)] bg-[var(--theme-pale)] text-[var(--theme-text)]'
                : 'border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-2)] hover:bg-[var(--theme-pale)]'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              className="sr-only"
              required={required}
            />
            {rating}
          </label>
        ))}
      </div>
      <div className="flex justify-between gap-4 text-sm font-bold text-[var(--theme-muted)]">
        <span>{lowLabel}</span>
        <span className="text-right">{highLabel}</span>
      </div>
    </fieldset>
  );
}

function FeatureRatingTable({
  ratings,
  onChange,
}: {
  ratings: TestFeatureRatings;
  onChange: (ratings: TestFeatureRatings) => void;
}) {
  return (
    <fieldset className="space-y-4">
      <legend>
        <FieldLabel>Kuinka tarpeellisilta nämä toiminnot tuntuvat?</FieldLabel>
      </legend>
      <p className="font-semibold text-[var(--theme-text-2)]">
        Arvioi jokainen toiminto asteikolla 1-5. Voit jättää kohdan tyhjäksi, jos et osaa arvioida sitä.
      </p>
      <div className="space-y-3">
        {featureOptions.map((feature) => (
          <div
            key={feature.key}
            className="grid gap-3 border-t border-[var(--theme-border)] pt-3 md:grid-cols-[minmax(10rem,1fr)_minmax(18rem,1.2fr)] md:items-center"
          >
            <p className="font-black text-[var(--theme-text)]">{feature.label}</p>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={feature.label}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <label
                  key={`${feature.key}-${rating}`}
                  className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 text-sm font-black transition-colors ${
                    ratings[feature.key] === rating
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-pale)] text-[var(--theme-text)]'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-2)] hover:bg-[var(--theme-pale)]'
                  }`}
                >
                  <input
                    type="radio"
                    name={`feature-${feature.key}`}
                    value={rating}
                    checked={ratings[feature.key] === rating}
                    onChange={() => onChange({ ...ratings, [feature.key]: rating })}
                    className="sr-only"
                  />
                  {rating}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm font-bold text-[var(--theme-muted)] sm:grid-cols-5">
        <span>1 = Ei lainkaan</span>
        <span>2 = Melko tarpeeton</span>
        <span>3 = En osaa sanoa</span>
        <span>4 = Tarpeellinen</span>
        <span>5 = Erittäin tarpeellinen</span>
      </div>
    </fieldset>
  );
}

function TestFeedbackPage() {
  const [draft, setDraft] = useState<TestFeedbackDraft>(initialDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [syncNotice, setSyncNotice] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => installUsageTracking('testipalaute'), []);

  useEffect(() => {
    let isActive = true;
    syncLocalTestFeedbackResponses()
      .then((result) => {
        if (!isActive || result.synced === 0) return;
        setSyncNotice(result.synced === 1
          ? 'Aiemmin selaimeen jäänyt vastaus siirrettiin tietokantaan.'
          : `${result.synced} aiemmin selaimeen jäänyttä vastausta siirrettiin tietokantaan.`);
      })
      .catch(() => {
        // Local fallback remains available if Firestore is still unavailable.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const requiredProgress = useMemo(() => {
    const checks = [
      draft.deviceTypes.length > 0,
      Boolean(draft.foundServices),
      draft.usefulnessRating >= 1,
      draft.mostImportantFix.trim().length >= 3,
    ];
    return checks.filter(Boolean).length;
  }, [draft]);

  const updateDraft = <K extends keyof TestFeedbackDraft>(key: K, value: TestFeedbackDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (draft.deviceTypes.length === 0) {
      setError('Valitse vähintään yksi laite.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!draft.foundServices) {
      setError('Vastaa kohtaan "Löysitkö etsimäsi palvelut?".');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (draft.usefulnessRating < 1) {
      setError('Anna sivulle hyödyllisyysarvio asteikolla 1-5.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (draft.mostImportantFix.trim().length < 3) {
      setError('Kirjoita tärkein korjattava asia ennen lähetystä.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitTestFeedback(draft);
      setSubmitted(true);
      setNotice(result.storage === 'cloud'
        ? 'Kiitos. Vastaus tallennettiin anonyymisti.'
        : 'Kiitos. Vastaus tallennettiin tähän selaimeen. Yritämme siirtää selaimeen jääneet vastaukset tietokantaan, kun yhteys toimii.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Vastauksen tallennus ei onnistunut. Yritä hetken päästä uudelleen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startAnotherResponse = () => {
    setDraft(initialDraft);
    setSubmitted(false);
    setNotice('');
    setSyncNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="aurora-page">
      <div className="aurora-shell max-w-5xl space-y-8">
        <header className="aurora-subpage-hero space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="aurora-kicker">Testaus</span>
            <HomeLink />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
            Testipalautelomake
          </h1>
          <p className="max-w-3xl text-base font-semibold text-white/80 md:text-lg">
            Kiitos, että testaat aloitussivua. Vastaaminen vie noin 5-10 minuuttia. Vastaukset tallennetaan anonyymisti ja niitä käytetään sivun viimeistelyyn.
          </p>
        </header>

        <section className="aurora-soft-panel space-y-3" aria-label="Tärkeää ennen vastaamista">
          <p className="font-black text-[var(--theme-text)]">
            Älä kirjoita lomakkeeseen nimeä, sähköpostia, puhelinnumeroa, henkilötunnusta, terveystietoja, salasanoja tai muuta arkaluonteista tietoa.
          </p>
          <p className="font-semibold text-[var(--theme-text-2)]">
            Pakollisia kohtia on neljä. Täytetty {requiredProgress}/4.
          </p>
        </section>

        {notice ? (
          <section role="status" className="rounded-2xl border-4 border-emerald-200 bg-emerald-50 p-5 font-black text-emerald-900 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
            <p>{notice}</p>
            {submitted ? (
              <button
                type="button"
                onClick={startAnotherResponse}
                className="mt-4 rounded-full bg-[var(--theme-primary)] px-5 py-3 font-black text-white"
              >
                Lähetä toinen vastaus
              </button>
            ) : null}
          </section>
        ) : null}

        {syncNotice ? (
          <section role="status" className="rounded-2xl border-4 border-sky-200 bg-sky-50 p-5 font-black text-sky-900 dark:border-sky-900 dark:bg-sky-900/20 dark:text-sky-100">
            {syncNotice}
          </section>
        ) : null}

        {error ? (
          <section role="alert" className="rounded-2xl border-4 border-rose-200 bg-rose-50 p-5 font-black text-rose-900 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-100">
            {error}
          </section>
        ) : null}

        <form onSubmit={submit} className="space-y-6">
          <Section number="1" title="Taustatieto">
            <CheckboxGroup
              label="Millä laitteella testasit?"
              values={draft.deviceTypes}
              options={deviceOptions}
              onChange={(values) => updateDraft('deviceTypes', values)}
              required
            />
            <ChoiceGroup
              label="Käytitkö sivua itse vai jonkun kanssa?"
              name="useMode"
              value={draft.useMode}
              options={useModeOptions}
              onChange={(value) => updateDraft('useMode', value)}
            />
            <ChoiceGroup
              label="Kuinka tottunut olet käyttämään verkkopalveluja?"
              name="webExperience"
              value={draft.webExperience}
              options={webExperienceOptions}
              onChange={(value) => updateDraft('webExperience', value)}
            />
          </Section>

          <Section number="2" title="Ensivaikutelma">
            <ChoiceGroup
              label="Oliko sivun tarkoitus selvä?"
              name="purposeClear"
              value={draft.purposeClear}
              options={yesPartlyNoOptions}
              onChange={(value) => updateDraft('purposeClear', value)}
            />
            <TextQuestion
              label="Mikä oli ensivaikutelmasi sivusta?"
              value={draft.firstImpression}
              onChange={(value) => updateDraft('firstImpression', value)}
              placeholder="Esimerkiksi mikä tuntui selkeältä, oudolta tai hyödylliseltä?"
            />
            <CheckboxGroup
              label="Tuntuiko sivu?"
              values={draft.pageFeelings}
              options={pageFeelingOptions}
              onChange={(values) => updateDraft('pageFeelings', values)}
            />
          </Section>

          <Section number="3" title="Palveluiden löytäminen">
            <ChoiceGroup
              label="Löysitkö etsimäsi palvelut?"
              name="foundServices"
              value={draft.foundServices}
              options={foundServiceOptions}
              onChange={(value) => updateDraft('foundServices', value)}
              required
            />
            <TextQuestion
              label="Mitä yritit löytää?"
              value={draft.searchedFor}
              onChange={(value) => updateDraft('searchedFor', value)}
              placeholder="Esimerkiksi Kela, Omakanta, kirjasto, paikallisuutiset tai huijausvaroitukset."
            />
            <TextQuestion
              label="Mikä jäi löytymättä?"
              value={draft.missingService}
              onChange={(value) => updateDraft('missingService', value)}
            />
            <ChoiceGroup
              label="Oliko kategorioiden ja alakategorioiden jako ymmärrettävä?"
              name="categoryClarity"
              value={draft.categoryClarity}
              options={yesPartlyNoOptions}
              onChange={(value) => updateDraft('categoryClarity', value)}
            />
            <TextQuestion
              label="Mikä kategoria, sana tai otsikko tuntui epäselvältä?"
              value={draft.unclearCategory}
              onChange={(value) => updateDraft('unclearCategory', value)}
            />
          </Section>

          <Section number="4" title="Paikalliset sisällöt">
            <ChoiceGroup
              label="Näkyikö oma paikkakunta oikein?"
              name="municipalityCorrect"
              value={draft.municipalityCorrect}
              options={municipalityOptions}
              onChange={(value) => updateDraft('municipalityCorrect', value)}
            />
            <ChoiceGroup
              label="Oliko paikallisista palveluista hyötyä?"
              name="localServicesUseful"
              value={draft.localServicesUseful}
              options={localUsefulnessOptions}
              onChange={(value) => updateDraft('localServicesUseful', value)}
            />
            <TextQuestion
              label="Puuttuiko paikkakunnaltasi jokin tärkeä linkki?"
              value={draft.missingLocalLink}
              onChange={(value) => updateDraft('missingLocalLink', value)}
            />
            <ChoiceGroup
              label="Oliko paikallisuutisista hyötyä?"
              name="localNewsUseful"
              value={draft.localNewsUseful}
              options={localNewsOptions}
              onChange={(value) => updateDraft('localNewsUseful', value)}
            />
          </Section>

          <Section number="5" title="Toiminnot">
            <FeatureRatingTable
              ratings={draft.featureRatings}
              onChange={(ratings) => updateDraft('featureRatings', ratings)}
            />
            <TextQuestion
              label="Puuttuuko jokin tärkeä toiminto?"
              value={draft.missingFeature}
              onChange={(value) => updateDraft('missingFeature', value)}
            />
          </Section>

          <Section number="6" title="Käytettävyys ja saavutettavuus">
            <ChoiceGroup
              label="Oliko tekstin koko sopiva?"
              name="textSize"
              value={draft.textSize}
              options={textSizeOptions}
              onChange={(value) => updateDraft('textSize', value)}
            />
            <ChoiceGroup
              label="Oliko väreistä ja kontrasteista helppo saada selvää?"
              name="contrastClarity"
              value={draft.contrastClarity}
              options={yesPartlyNoOptions}
              onChange={(value) => updateDraft('contrastClarity', value)}
            />
            <ChoiceGroup
              label="Oliko sivua helppo käyttää puhelimella?"
              name="mobileEase"
              value={draft.mobileEase}
              options={mobileEaseOptions}
              onChange={(value) => updateDraft('mobileEase', value)}
            />
            <TextQuestion
              label="Tuliko vastaan kohta, jota oli vaikea painaa, lukea tai ymmärtää?"
              value={draft.difficultPart}
              onChange={(value) => updateDraft('difficultPart', value)}
            />
          </Section>

          <Section number="7" title="Sivuston esittelykierros">
            <ChoiceGroup
              label="Katsoitko sivuston esittelykierroksen?"
              name="tourViewed"
              value={draft.tourViewed}
              options={tourViewedOptions}
              onChange={(value) => updateDraft('tourViewed', value)}
            />
            <ChoiceGroup
              label="Auttoiko esittely ymmärtämään sivua?"
              name="tourHelpful"
              value={draft.tourHelpful}
              options={tourHelpfulOptions}
              onChange={(value) => updateDraft('tourHelpful', value)}
            />
            <TextQuestion
              label="Mitä esittelystä puuttui tai mikä siinä oli turhaa?"
              value={draft.tourFeedback}
              onChange={(value) => updateDraft('tourFeedback', value)}
            />
          </Section>

          <Section number="8" title="Kokonaisarvio">
            <RatingScale
              label="Kuinka hyödylliseltä sivu tuntui?"
              name="usefulnessRating"
              value={draft.usefulnessRating}
              onChange={(value) => updateDraft('usefulnessRating', value)}
              lowLabel="1 = ei lainkaan hyödyllinen"
              highLabel="5 = erittäin hyödyllinen"
              required
            />
            <RatingScale
              label="Kuinka helppokäyttöiseltä sivu tuntui?"
              name="easeRating"
              value={draft.easeRating}
              onChange={(value) => updateDraft('easeRating', value)}
              lowLabel="1 = vaikea käyttää"
              highLabel="5 = erittäin helppo käyttää"
            />
            <ChoiceGroup
              label="Voisitko suositella sivua seniorille tai digiopastukseen?"
              name="recommend"
              value={draft.recommend}
              options={recommendOptions}
              onChange={(value) => updateDraft('recommend', value)}
            />
            <TextQuestion
              label="Mikä on tärkein asia, joka pitäisi korjata ennen julkaisua?"
              value={draft.mostImportantFix}
              onChange={(value) => updateDraft('mostImportantFix', value)}
              placeholder="Kirjoita tärkein korjaus tai asia, joka jäi vaivaamaan."
              required
            />
            <TextQuestion
              label="Mikä sivulla oli erityisen hyvää?"
              value={draft.bestThing}
              onChange={(value) => updateDraft('bestThing', value)}
            />
          </Section>

          <div className="aurora-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-[var(--theme-text-2)]">
              Lähettämällä vastauksen hyväksyt, että anonyymi palaute tallennetaan sivun kehittämistä varten.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || submitted}
              className="min-h-14 rounded-full bg-[var(--theme-primary)] px-8 py-3 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitted ? 'Vastaus lähetetty' : isSubmitting ? 'Tallennetaan...' : 'Lähetä vastaus'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <TestFeedbackPage />
    </React.StrictMode>
  );
}
