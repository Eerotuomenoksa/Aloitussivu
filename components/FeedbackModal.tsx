import React, { useEffect, useRef, useState } from 'react';
import { submitFeedback } from '../feedback';
import type { FeedbackClientInfo, FeedbackScreenshotDraft, FeedbackType } from '../feedback';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackTypes: { value: FeedbackType; label: string; description: string }[] = [
  { value: 'bug', label: 'Virhe', description: 'Jokin ei toimi tai näkyy väärin.' },
  { value: 'content', label: 'Sisältö', description: 'Teksti, otsikko tai tieto kaipaa korjausta.' },
  { value: 'link', label: 'Linkki', description: 'Linkki puuttuu, ei toimi tai vie väärään paikkaan.' },
  { value: 'accessibility', label: 'Saavutettavuus', description: 'Käyttö on hankalaa näppäimistöllä, ruudunlukijalla tai mobiilissa.' },
  { value: 'idea', label: 'Idea', description: 'Ehdotus sivun parantamiseen.' },
  { value: 'other', label: 'Muu', description: 'Jokin muu palaute.' },
];

const getCurrentPageLabel = () => {
  if (typeof window === 'undefined') return 'Etusivu';
  const file = window.location.pathname.split('/').pop() || 'index.html';
  if (file === 'index.html' || file === '') return 'Etusivu';
  return file;
};

const SCREENSHOT_MAX_BYTES = 450 * 1024;
const allowedScreenshotTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const screenshotAcceptTypes = [...allowedScreenshotTypes].join(',');
const screenshotDataUrlPattern = /^data:image\/(?:png|jpeg|webp|gif);base64,/;

const detectBrowser = (userAgent: string) => {
  const rules = [
    { name: 'Edge', pattern: /Edg\/([\d.]+)/ },
    { name: 'Chrome', pattern: /Chrome\/([\d.]+)/ },
    { name: 'Firefox', pattern: /Firefox\/([\d.]+)/ },
    { name: 'Safari', pattern: /Version\/([\d.]+).*Safari/ },
  ];
  const match = rules.map((rule) => {
    const result = userAgent.match(rule.pattern);
    return result ? { name: rule.name, version: result[1] } : null;
  }).find(Boolean);
  return match ?? { name: 'Tuntematon selain', version: undefined };
};

const detectOs = (userAgent: string, platform: string) => {
  if (/Windows/i.test(userAgent) || /Win/i.test(platform)) return 'Windows';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS/iPadOS';
  if (/Mac/i.test(platform)) return 'macOS';
  if (/Linux/i.test(userAgent) || /Linux/i.test(platform)) return 'Linux';
  return 'Tuntematon käyttöjärjestelmä';
};

const detectDeviceType = (userAgent: string): FeedbackClientInfo['deviceType'] => {
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) return 'mobile';
  if (/iPad|Tablet/i.test(userAgent)) return 'tablet';
  if (typeof window !== 'undefined') return 'desktop';
  return 'unknown';
};

const collectClientInfo = (): FeedbackClientInfo | undefined => {
  if (typeof window === 'undefined') return undefined;
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform || '';
  const browser = detectBrowser(userAgent);
  return {
    browserName: browser.name,
    browserVersion: browser.version,
    osName: detectOs(userAgent, platform),
    deviceType: detectDeviceType(userAgent),
    userAgent,
    platform,
    language: window.navigator.language || '',
    viewport: `${window.innerWidth} x ${window.innerHeight}`,
    screen: `${window.screen.width} x ${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    touch: window.navigator.maxTouchPoints > 0,
  };
};

const fileToScreenshot = (file: File): Promise<FeedbackScreenshotDraft> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      reject(new Error('Kuvakaappausta ei voitu lukea.'));
      return;
    }
    if (!screenshotDataUrlPattern.test(reader.result)) {
      reject(new Error('Kuvakaappauksen tiedostomuoto ei ole sallittu.'));
      return;
    }
    resolve({
      name: file.name,
      type: file.type || 'image/png',
      size: file.size,
      dataUrl: reader.result,
    });
  };
  reader.onerror = () => reject(new Error('Kuvakaappausta ei voitu lukea.'));
  reader.readAsDataURL(file);
});

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(getCurrentPageLabel);
  const [submitted, setSubmitted] = useState(false);
  const [submitNotice, setSubmitNotice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientInfo, setClientInfo] = useState<FeedbackClientInfo | undefined>(() => collectClientInfo());
  const [screenshot, setScreenshot] = useState<FeedbackScreenshotDraft | null>(null);
  const [screenshotError, setScreenshotError] = useState('');
  const closeTimerRef = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap(modalRef, isOpen, onClose, closeButtonRef);

  useEffect(() => {
    if (!isOpen) return;
    setType('bug');
    setTitle('');
    setDescription('');
    setPage(getCurrentPageLabel());
    setSubmitted(false);
    setSubmitNotice('');
    setSubmitError('');
    setIsSubmitting(false);
    setClientInfo(collectClientInfo());
    setScreenshot(null);
    setScreenshotError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const chooseScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshotError('');
    const file = event.target.files?.[0];
    if (!file) {
      setScreenshot(null);
      return;
    }

    if (!allowedScreenshotTypes.has(file.type)) {
      setScreenshot(null);
      setScreenshotError('Valitse PNG-, JPG-, WebP- tai GIF-kuva.');
      event.target.value = '';
      return;
    }

    if (file.size > SCREENSHOT_MAX_BYTES) {
      setScreenshot(null);
      setScreenshotError('Kuvakaappaus on liian suuri. Enimmäiskoko on 450 kt.');
      event.target.value = '';
      return;
    }

    try {
      setScreenshot(await fileToScreenshot(file));
    } catch {
      setScreenshot(null);
      setScreenshotError('Kuvakaappausta ei voitu lukea.');
      event.target.value = '';
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedPage = page.trim() || getCurrentPageLabel();

    if (trimmedTitle.length < 3) {
      setSubmitError('Kirjoita otsikkoon vähintään 3 merkkiä.');
      return;
    }

    if (trimmedDescription.length < 5) {
      setSubmitError('Kirjoita palautteeseen vähintään 5 merkkiä.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFeedback({
        type,
        title: trimmedTitle,
        description: trimmedDescription,
        page: trimmedPage,
        client: clientInfo,
        screenshot,
      });
      setSubmitted(true);
      setSubmitNotice(result.storage === 'cloud'
        ? 'Kiitos. Palaute lisättiin kehitysjonoon.'
        : 'Kiitos. Palaute tallennettiin tähän selaimeen, mutta julkiseen kehitysjonoon ei juuri nyt saatu yhteyttä.');
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = window.setTimeout(onClose, result.storage === 'cloud' ? 1100 : 3500);
    } catch {
      setSubmitError('Palautteen tallennus ei onnistunut. Yritä hetken päästä uudelleen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-lg sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div ref={modalRef} tabIndex={-1} className="aurora-modal-shell flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2.5rem]">
        <div className="aurora-modal-header flex shrink-0 items-center justify-between gap-4 p-5 text-white md:p-8">
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-widest text-white/70">Testipalaute</p>
            <h2 id="feedback-modal-title" className="font-display text-3xl font-bold leading-tight md:text-5xl">Anna palautetta sivusta</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-white/10 text-3xl font-black transition-all hover:bg-white/20 active:scale-95"
            aria-label="Sulje"
          >
            x
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="aurora-modal-body min-h-0 flex-1 space-y-5 overflow-y-auto p-5 md:p-8">
            <p className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-pale)] p-4 font-bold text-[var(--theme-text-2)]">
              Palaute näkyy julkisessa kehitysjonossa. Älä kirjoita henkilötietoja, terveystietoja, salasanoja tai muuta arkaluonteista tietoa. Kuvakaappaus tallennetaan vain ylläpidon tarkistusta varten.
            </p>
            <p className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 font-bold text-[var(--theme-text-2)]">
              Kirjoita mieluiten vain yksi palautekokonaisuus kerrallaan. Se auttaa kehittäjää käsittelemään palautteen nopeammin ja merkitsemään sen valmiiksi selkeämmin.
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {feedbackTypes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  aria-pressed={type === option.value}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${type === option.value ? 'border-[var(--theme-primary)] bg-[var(--theme-pale)]' : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'}`}
                >
                  <span className="block font-black text-[var(--theme-text)]">{option.label}</span>
                  <span className="mt-1 block text-sm font-bold text-[var(--theme-text-3)]">{option.description}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)]">
              <label className="space-y-2">
                <span className="block font-black text-[var(--theme-text-2)]">Lyhyt otsikko</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="aurora-input w-full rounded-2xl px-4 py-3 font-bold"
                  placeholder="Esim. Nimipäivä ei näy kellon alla"
                  minLength={3}
                  maxLength={140}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="block font-black text-[var(--theme-text-2)]">Koskee sivua</span>
                <input
                  value={page}
                  onChange={(event) => setPage(event.target.value)}
                  className="aurora-input w-full rounded-2xl px-4 py-3 font-bold"
                  maxLength={120}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="block font-black text-[var(--theme-text-2)]">Mitä pitäisi korjata tai käsitellä?</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="aurora-input min-h-[150px] w-full resize-y rounded-2xl px-4 py-3 font-bold"
                placeholder="Kerro mitä huomasit. Laite ja selain lisätään automaattisesti, jos selain sallii sen."
                minLength={5}
                maxLength={1600}
                required
              />
            </label>

            <div className="grid gap-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="font-black text-[var(--theme-text-2)]">Laite ja selain</p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--theme-text-3)]">
                  {clientInfo
                    ? `${clientInfo.browserName}${clientInfo.browserVersion ? ` ${clientInfo.browserVersion}` : ''}, ${clientInfo.osName}, ${clientInfo.deviceType}. Näkymä ${clientInfo.viewport}.`
                    : 'Automaattisia laitetietoja ei saatu luettua.'}
                </p>
              </div>
              <div>
                <label className="block space-y-2">
                  <span className="block font-black text-[var(--theme-text-2)]">Kuvakaappaus, vapaaehtoinen</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={screenshotAcceptTypes}
                    onChange={chooseScreenshot}
                    className="block w-full text-sm font-bold text-[var(--theme-text-2)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--theme-primary)] file:px-4 file:py-2 file:font-black file:text-white"
                  />
                </label>
                <p className="mt-2 text-xs font-bold text-[var(--theme-text-3)]">
                  Enimmäiskoko 450 kt. Rajaa kuvasta pois nimet, sähköpostit ja muut yksityiset tiedot.
                </p>
                {screenshot ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--theme-pale)] p-3">
                    <span className="min-w-0 truncate text-sm font-black text-[var(--theme-text)]">
                      {screenshot.name} ({Math.round(screenshot.size / 1024)} kt)
                    </span>
                    <button type="button" onClick={removeScreenshot} className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--theme-primary)]">
                      Poista
                    </button>
                  </div>
                ) : null}
                {screenshotError ? (
                  <p className="mt-2 text-sm font-black text-rose-700 dark:text-rose-300">{screenshotError}</p>
                ) : null}
              </div>
            </div>

            {submitted ? (
              <p role="status" className="rounded-2xl border-4 border-green-200 bg-green-50 p-4 font-black text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
                {submitNotice}
              </p>
            ) : null}

            {submitError ? (
              <p role="alert" className="rounded-2xl border-4 border-rose-200 bg-rose-50 p-4 font-black text-rose-800 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-200">
                {submitError}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5">
            <a
              href="./kehitysjono.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black text-[var(--theme-primary)] no-underline hover:underline"
            >
              Katso kehitysjono
            </a>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="aurora-secondary-button px-6 py-3">
                Peruuta
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[var(--theme-primary)] px-8 py-3 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Tallennetaan...' : 'Tallenna palaute'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
