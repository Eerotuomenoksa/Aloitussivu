import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { User } from 'firebase/auth';
import './index.css';
import {
  subscribeTestFeedbackResponses,
  type TestFeatureKey,
  type TestFeedbackResponse,
} from './testFeedback';
import {
  getUserEmail,
  isAdminUser,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutAdmin,
  subscribeToAuth,
} from './firebaseClient';
import { installUsageTracking } from './usageTracking';

type LabelMap = Record<string, string>;

const deviceLabels: LabelMap = {
  phone: 'Puhelin',
  tablet: 'Tabletti',
  computer: 'Tietokone',
};

const useModeLabels: LabelMap = {
  self: 'Käytti itse',
  withSomeone: 'Yhdessä toisen kanssa',
  guidance: 'Opastustilanne',
};

const webExperienceLabels: LabelMap = {
  often: 'Käyttää usein',
  sometimes: 'Käyttää joskus',
  needsHelp: 'Tarvitsee usein apua',
  observer: 'Opastaja tai havainnoija',
};

const yesPartlyNoLabels: LabelMap = {
  yes: 'Kyllä',
  partly: 'Osittain',
  no: 'Ei',
};

const pageFeelingLabels: LabelMap = {
  clear: 'Selkeä',
  calm: 'Rauhallinen',
  useful: 'Hyödyllinen',
  tooFull: 'Liian täysi',
  confusing: 'Sekava',
  pleasant: 'Mukavan näköinen',
};

const municipalityLabels: LabelMap = {
  yes: 'Kyllä',
  no: 'Ei',
  notSeen: 'Ei huomannut',
};

const localUsefulnessLabels: LabelMap = {
  yes: 'Kyllä',
  partly: 'Osittain',
  no: 'Ei',
  notUsed: 'Ei käyttänyt',
};

const localNewsLabels: LabelMap = {
  yes: 'Kyllä',
  partly: 'Osittain',
  no: 'Ei',
  notSeen: 'Ei huomannut',
};

const textSizeLabels: LabelMap = {
  good: 'Sopiva',
  tooSmall: 'Liian pieni',
  tooLarge: 'Liian suuri',
  changed: 'Vaihteli kokoa',
};

const mobileEaseLabels: LabelMap = {
  yes: 'Kyllä',
  partly: 'Osittain',
  no: 'Ei',
  notTested: 'Ei testannut puhelimella',
};

const tourViewedLabels: LabelMap = {
  yes: 'Kyllä',
  partly: 'Osittain',
  no: 'Ei',
};

const tourHelpfulLabels: LabelMap = {
  yes: 'Kyllä',
  partly: 'Osittain',
  no: 'Ei',
  notViewed: 'Ei katsonut',
};

const recommendLabels: LabelMap = {
  yes: 'Kyllä',
  maybe: 'Ehkä',
  no: 'Ei',
};

const featureLabels: Record<TestFeatureKey, string> = {
  weather: 'Sää',
  assistant: 'Tekoäly',
  internetSearch: 'Internet-haku',
  scamAlerts: 'Huijausvaroitukset',
  nearby: 'Lähelläsi',
  favorites: 'Suosikit',
  categorySearch: 'Kategoriahaku',
  namedays: 'Nimipäivät',
  localNews: 'Paikalliset uutiset',
};

const featureOrder = Object.keys(featureLabels) as TestFeatureKey[];

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fi-FI', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const formatAverage = (value: number | null) => (
  value === null ? '-' : value.toLocaleString('fi-FI', { maximumFractionDigits: 1 })
);

const getLabel = (value: string, labels: LabelMap) => (
  value ? labels[value] ?? value : 'Ei vastausta'
);

const getErrorCode = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('code' in error)) return '';
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : '';
};

function HomeLink() {
  return (
    <a href="./yllapito.html" className="aurora-primary-link text-base">
      ← Ylläpitoon
    </a>
  );
}

function exportJson(filename: string, content: unknown) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function average(values: number[]) {
  const cleanValues = values.filter((value) => value > 0);
  if (cleanValues.length === 0) return null;
  return cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length;
}

function countSingle(
  responses: TestFeedbackResponse[],
  getter: (response: TestFeedbackResponse) => string,
  labels: LabelMap
) {
  const counts = new Map<string, number>();
  responses.forEach((response) => {
    const value = getter(response) || '';
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: getLabel(value, labels), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fi'));
}

function countMultiple(
  responses: TestFeedbackResponse[],
  getter: (response: TestFeedbackResponse) => string[],
  labels: LabelMap
) {
  const counts = new Map<string, number>();
  responses.forEach((response) => {
    const values = getter(response);
    if (values.length === 0) {
      counts.set('', (counts.get('') ?? 0) + 1);
      return;
    }
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  });
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: getLabel(value, labels), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fi'));
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="aurora-card">
      <p className="text-sm font-black uppercase tracking-wide text-[var(--theme-muted)]">{label}</p>
      <p className="font-display text-4xl font-bold text-[var(--theme-text)]">{value}</p>
      {hint ? <p className="mt-1 text-sm font-bold text-[var(--theme-text-2)]">{hint}</p> : null}
    </div>
  );
}

function Distribution({
  title,
  items,
  total,
}: {
  title: string;
  items: { label: string; count: number }[];
  total: number;
}) {
  return (
    <section className="aurora-panel space-y-4">
      <h2 className="aurora-section-title text-2xl">{title}</h2>
      {items.length === 0 ? (
        <p className="font-bold text-[var(--theme-muted)]">Ei vastauksia.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm font-black text-[var(--theme-text)]">
                  <span>{item.label}</span>
                  <span>{item.count} ({percent} %)</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[var(--theme-pale)]">
                  <div
                    className="h-full rounded-full bg-[var(--theme-primary)]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FeatureSummary({ responses }: { responses: TestFeedbackResponse[] }) {
  const stats = featureOrder.map((key) => {
    const values = responses
      .map((response) => response.featureRatings?.[key] ?? 0)
      .filter((value) => value > 0);
    return {
      key,
      label: featureLabels[key],
      count: values.length,
      average: average(values),
    };
  });

  return (
    <section className="aurora-panel space-y-4">
      <h2 className="aurora-section-title text-2xl">Toimintojen tarpeellisuus</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-sm font-black uppercase tracking-wide text-[var(--theme-muted)]">
              <th className="px-3 py-2">Toiminto</th>
              <th className="px-3 py-2">Keskiarvo</th>
              <th className="px-3 py-2">Vastauksia</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((item) => (
              <tr key={item.key} className="bg-[var(--theme-surface)]">
                <td className="rounded-l-2xl border-y border-l border-[var(--theme-border)] px-3 py-3 font-black">
                  {item.label}
                </td>
                <td className="border-y border-[var(--theme-border)] px-3 py-3 font-bold">
                  {formatAverage(item.average)}
                </td>
                <td className="rounded-r-2xl border-y border-r border-[var(--theme-border)] px-3 py-3 font-bold">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TextResponses({
  title,
  responses,
  getter,
}: {
  title: string;
  responses: TestFeedbackResponse[];
  getter: (response: TestFeedbackResponse) => string;
}) {
  const entries = responses
    .map((response) => ({ id: response.id, createdAt: response.createdAt, text: getter(response).trim() }))
    .filter((entry) => entry.text.length > 0);

  return (
    <section className="aurora-panel space-y-4">
      <h2 className="aurora-section-title text-2xl">{title}</h2>
      {entries.length === 0 ? (
        <p className="font-bold text-[var(--theme-muted)]">Ei avoimia vastauksia.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <article key={`${title}-${entry.id}`} className="border-t border-[var(--theme-border)] pt-3">
              <p className="text-sm font-bold text-[var(--theme-muted)]">{formatDateTime(entry.createdAt)}</p>
              <p className="mt-1 whitespace-pre-wrap font-semibold text-[var(--theme-text)]">{entry.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ResponseDetails({ responses }: { responses: TestFeedbackResponse[] }) {
  return (
    <section className="aurora-panel space-y-4">
      <h2 className="aurora-section-title text-2xl">Yksittäiset vastaukset</h2>
      {responses.length === 0 ? (
        <p className="font-bold text-[var(--theme-muted)]">Ei vastauksia.</p>
      ) : (
        <div className="space-y-3">
          {responses.map((response) => (
            <details key={response.id} className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
              <summary className="cursor-pointer font-black text-[var(--theme-text)]">
                {formatDateTime(response.createdAt)} · hyödyllisyys {response.usefulnessRating || '-'} / 5
              </summary>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="font-black text-[var(--theme-muted)]">Laitteet</dt>
                  <dd className="font-bold">{response.deviceTypes.map((value) => deviceLabels[value] ?? value).join(', ') || '-'}</dd>
                </div>
                <div>
                  <dt className="font-black text-[var(--theme-muted)]">Löysi palvelut</dt>
                  <dd className="font-bold">{getLabel(response.foundServices, yesPartlyNoLabels)}</dd>
                </div>
                <div>
                  <dt className="font-black text-[var(--theme-muted)]">Helppokäyttöisyys</dt>
                  <dd className="font-bold">{response.easeRating || '-'}</dd>
                </div>
                <div>
                  <dt className="font-black text-[var(--theme-muted)]">Suosittelisi</dt>
                  <dd className="font-bold">{getLabel(response.recommend, recommendLabels)}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="font-black text-[var(--theme-muted)]">Tärkein korjaus</dt>
                  <dd className="whitespace-pre-wrap font-bold">{response.mostImportantFix || '-'}</dd>
                </div>
              </dl>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function TestFeedbackAdminPage() {
  const [responses, setResponses] = useState<TestFeedbackResponse[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => installUsageTracking('testipalaute-yllapito'), []);

  useEffect(() => subscribeToAuth((nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
  }), []);

  const canView = !isFirebaseConfigured || isAdminUser(user);
  const userEmail = getUserEmail(user);

  useEffect(() => {
    if (!authReady) return undefined;
    if (isFirebaseConfigured && !canView) {
      setResponses([]);
      return undefined;
    }

    setLoadError('');
    return subscribeTestFeedbackResponses(
      setResponses,
      (error) => {
        const code = getErrorCode(error);
        setLoadError(code
          ? `Vastauksia ei voitu lukea Firestoresta. Virhe: ${code}.`
          : 'Vastauksia ei voitu lukea Firestoresta.');
      }
    );
  }, [authReady, canView]);

  const summary = useMemo(() => {
    const latest = responses[0]?.createdAt;
    return {
      total: responses.length,
      latest,
      usefulnessAverage: average(responses.map((response) => response.usefulnessRating)),
      easeAverage: average(responses.map((response) => response.easeRating)),
    };
  }, [responses]);

  const signIn = async () => {
    setAuthError('');
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const code = getErrorCode(error);
      setAuthError(code ? `Kirjautuminen ei onnistunut. Firebase-virhe: ${code}.` : 'Kirjautuminen ei onnistunut.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="aurora-page">
      <div className="aurora-shell max-w-6xl space-y-8">
        <header className="aurora-subpage-hero space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="aurora-kicker">Ylläpito</span>
            <HomeLink />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
            Testipalautteen koonti
          </h1>
          <p className="max-w-3xl text-base font-semibold text-white/80 md:text-lg">
            Näkymä kokoaa anonyymit testilomakkeen vastaukset jakaumiksi, keskiarvoiksi ja avoimiksi huomioiksi.
          </p>
        </header>

        <section className="aurora-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="aurora-section-title text-2xl">Kirjautuminen</h2>
              <p className="mt-1 font-semibold text-[var(--theme-muted)]">
                Firestore-vastauksia voi tarkastella vain ylläpitäjän Google-tunnuksella.
              </p>
            </div>
            {authReady && canView && isFirebaseConfigured ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-[var(--theme-muted)]">{userEmail}</span>
                <button type="button" onClick={signOutAdmin} className="aurora-secondary-button px-5 py-3">
                  Kirjaudu ulos
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signIn}
                disabled={isSigningIn || !isFirebaseConfigured}
                className="aurora-secondary-button px-5 py-3"
              >
                {isSigningIn ? 'Avataan kirjautumista' : 'Ylläpitäjän kirjautuminen'}
              </button>
            )}
          </div>
          {!isFirebaseConfigured ? (
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              Firebase ei ole määritetty. Näytetään tämän selaimen paikalliset testivastaukset.
            </p>
          ) : null}
          {authError ? (
            <p className="mt-4 rounded-2xl bg-rose-50 p-4 font-bold text-rose-900 dark:bg-rose-900/20 dark:text-rose-100">
              {authError}
            </p>
          ) : null}
          {authReady && isFirebaseConfigured && user && !canView ? (
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              Olet kirjautunut, mutta tällä tunnuksella ei ole ylläpito-oikeutta.
            </p>
          ) : null}
          {loadError ? (
            <p className="mt-4 rounded-2xl bg-rose-50 p-4 font-bold text-rose-900 dark:bg-rose-900/20 dark:text-rose-100">
              {loadError}
            </p>
          ) : null}
        </section>

        {canView ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Yhteenveto">
              <SummaryCard label="Vastauksia" value={summary.total} />
              <SummaryCard label="Hyödyllisyys" value={formatAverage(summary.usefulnessAverage)} hint="asteikko 1-5" />
              <SummaryCard label="Helppokäyttöisyys" value={formatAverage(summary.easeAverage)} hint="asteikko 1-5" />
              <SummaryCard label="Uusin vastaus" value={summary.latest ? formatDateTime(summary.latest) : '-'} />
            </section>

            <div className="flex flex-wrap justify-end gap-3">
              <a href="./testipalaute.html" className="aurora-nav-link">
                Avaa lomake
              </a>
              <button
                type="button"
                onClick={() => exportJson('testipalaute-vastaukset.json', responses)}
                className="aurora-secondary-button px-5 py-3"
                disabled={responses.length === 0}
              >
                Vie JSON
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Distribution
                title="Millä laitteella testattiin?"
                items={countMultiple(responses, (response) => response.deviceTypes, deviceLabels)}
                total={responses.length}
              />
              <Distribution
                title="Käyttötilanne"
                items={countSingle(responses, (response) => response.useMode, useModeLabels)}
                total={responses.length}
              />
              <Distribution
                title="Verkkopalvelujen käyttötottumus"
                items={countSingle(responses, (response) => response.webExperience, webExperienceLabels)}
                total={responses.length}
              />
              <Distribution
                title="Löysikö etsimänsä palvelut?"
                items={countSingle(responses, (response) => response.foundServices, yesPartlyNoLabels)}
                total={responses.length}
              />
              <Distribution
                title="Sivun ensituntuma"
                items={countMultiple(responses, (response) => response.pageFeelings, pageFeelingLabels)}
                total={responses.length}
              />
              <Distribution
                title="Kategoriat ymmärrettäviä"
                items={countSingle(responses, (response) => response.categoryClarity, yesPartlyNoLabels)}
                total={responses.length}
              />
              <Distribution
                title="Paikkakunta näkyi oikein"
                items={countSingle(responses, (response) => response.municipalityCorrect, municipalityLabels)}
                total={responses.length}
              />
              <Distribution
                title="Paikalliset palvelut hyödyllisiä"
                items={countSingle(responses, (response) => response.localServicesUseful, localUsefulnessLabels)}
                total={responses.length}
              />
              <Distribution
                title="Paikallisuutisista hyötyä"
                items={countSingle(responses, (response) => response.localNewsUseful, localNewsLabels)}
                total={responses.length}
              />
              <Distribution
                title="Tekstin koko"
                items={countSingle(responses, (response) => response.textSize, textSizeLabels)}
                total={responses.length}
              />
              <Distribution
                title="Mobiilikäyttö"
                items={countSingle(responses, (response) => response.mobileEase, mobileEaseLabels)}
                total={responses.length}
              />
              <Distribution
                title="Suosittelisi sivua"
                items={countSingle(responses, (response) => response.recommend, recommendLabels)}
                total={responses.length}
              />
              <Distribution
                title="Esittelykierros katsottu"
                items={countSingle(responses, (response) => response.tourViewed, tourViewedLabels)}
                total={responses.length}
              />
              <Distribution
                title="Esittely auttoi"
                items={countSingle(responses, (response) => response.tourHelpful, tourHelpfulLabels)}
                total={responses.length}
              />
            </div>

            <FeatureSummary responses={responses} />

            <div className="grid gap-5 lg:grid-cols-2">
              <TextResponses title="Tärkein korjattava asia" responses={responses} getter={(response) => response.mostImportantFix} />
              <TextResponses title="Mikä sivulla oli erityisen hyvää" responses={responses} getter={(response) => response.bestThing} />
              <TextResponses title="Mitä yritettiin löytää" responses={responses} getter={(response) => response.searchedFor} />
              <TextResponses title="Mikä jäi löytymättä" responses={responses} getter={(response) => response.missingService} />
              <TextResponses title="Puuttuvat paikalliset linkit" responses={responses} getter={(response) => response.missingLocalLink} />
              <TextResponses title="Puuttuvat toiminnot" responses={responses} getter={(response) => response.missingFeature} />
              <TextResponses title="Vaikeat kohdat" responses={responses} getter={(response) => response.difficultPart} />
              <TextResponses title="Esittelykierroksen palaute" responses={responses} getter={(response) => response.tourFeedback} />
            </div>

            <ResponseDetails responses={responses} />
          </>
        ) : (
          <section className="aurora-panel text-center">
            <p className="font-black text-[var(--theme-muted)]">
              Kirjaudu ylläpitäjän tunnuksella nähdäksesi testipalautteen koonnin.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <TestFeedbackAdminPage />
    </React.StrictMode>
  );
}
