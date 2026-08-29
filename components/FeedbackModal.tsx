import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { submitFeedback, syncLocalFeedbackItems } from '../feedback';
import type { FeedbackClientInfo, FeedbackScreenshotDraft, FeedbackType } from '../feedback';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { useI18n } from '../i18n';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackTranslations = {
  fi: {
    home: 'Etusivu', kicker: 'Testipalaute', title: 'Anna palautetta sivusta', close: 'Sulje',
    types: [
      { value: 'bug', label: 'Virhe', description: 'Jokin ei toimi tai näkyy väärin.' },
      { value: 'content', label: 'Sisältö', description: 'Teksti, otsikko tai tieto kaipaa korjausta.' },
      { value: 'link', label: 'Linkki', description: 'Linkki puuttuu, ei toimi tai vie väärään paikkaan.' },
      { value: 'accessibility', label: 'Saavutettavuus', description: 'Käyttö on hankalaa näppäimistöllä, ruudunlukijalla tai mobiilissa.' },
      { value: 'idea', label: 'Idea', description: 'Ehdotus sivun parantamiseen.' },
      { value: 'other', label: 'Muu', description: 'Jokin muu palaute.' },
    ],
    syncSent: '{count} aiemmin selaimeen tallennettua palautetta lähetettiin tietokantaan.',
    syncPending: '{count} aiemmin tallennettua palautetta odottaa toimivaa verkkoyhteyttä.',
    selectImage: 'Valitse PNG-, JPG-, WebP- tai GIF-kuva.',
    imageTooLarge: 'Kuvakaappaus on liian suuri. Enimmäiskoko on 450 kt.',
    imageReadFailed: 'Kuvakaappausta ei voitu lukea.',
    titleMin: 'Kirjoita otsikkoon vähintään 3 merkkiä.',
    descriptionMin: 'Kirjoita palautteeseen vähintään 5 merkkiä.',
    savedCloud: 'Kiitos. Palaute lisättiin kehitysjonoon.',
    savedLocal: 'Kiitos. Palaute tallennettiin tähän selaimeen, mutta tietokantaan ei juuri nyt saatu yhteyttä.',
    saveFailed: 'Palautteen tallennus ei onnistunut. Yritä hetken päästä uudelleen.',
    sentOnce: 'Palaute on lähetetty vain kerran. Voit nyt sulkea ikkunan.',
    privacy: 'Palaute näkyy vain hyväksytylle ylläpidolle. Älä kirjoita henkilötietoja, terveystietoja, salasanoja tai muuta arkaluonteista tietoa. Kuvakaappaus tallennetaan vain ylläpidon tarkistusta varten.',
    oneIssue: 'Kirjoita mieluiten vain yksi palautekokonaisuus kerrallaan. Se auttaa kehittäjää käsittelemään palautteen nopeammin ja merkitsemään sen valmiiksi selkeämmin.',
    shortTitle: 'Lyhyt otsikko', titlePlaceholder: 'Esim. Hakupainike jää puhelimella piiloon',
    concernsPage: 'Koskee sivua', descriptionLabel: 'Mitä pitäisi korjata tai käsitellä?',
    descriptionPlaceholder: 'Kerro mitä huomasit. Laite ja selain lisätään automaattisesti, jos selain sallii sen.',
    deviceAndBrowser: 'Laite ja selain', viewport: 'Näkymä', noDeviceInfo: 'Automaattisia laitetietoja ei saatu luettua.',
    screenshotOptional: 'Kuvakaappaus, vapaaehtoinen', screenshotHint: 'Enimmäiskoko 450 kt. Rajaa kuvasta pois nimet, sähköpostit ja muut yksityiset tiedot.',
    remove: 'Poista', fileSizeUnit: 'kt', cancel: 'Peruuta', sent: 'Palaute lähetetty', sending: 'Lähetetään...', send: 'Lähetä palaute',
    unknownBrowser: 'Tuntematon selain', unknownOs: 'Tuntematon käyttöjärjestelmä',
    deviceTypes: { mobile: 'puhelin', tablet: 'tabletti', desktop: 'tietokone', unknown: 'tuntematon laite' },
  },
  sv: {
    home: 'Startsida', kicker: 'Testrespons', title: 'Ge respons om sidan', close: 'Stäng',
    types: [
      { value: 'bug', label: 'Fel', description: 'Något fungerar inte eller visas fel.' },
      { value: 'content', label: 'Innehåll', description: 'Text, rubrik eller information behöver korrigeras.' },
      { value: 'link', label: 'Länk', description: 'En länk saknas, fungerar inte eller leder fel.' },
      { value: 'accessibility', label: 'Tillgänglighet', description: 'Användningen är svår med tangentbord, skärmläsare eller mobil.' },
      { value: 'idea', label: 'Idé', description: 'Förslag på hur sidan kan förbättras.' },
      { value: 'other', label: 'Annat', description: 'Någon annan respons.' },
    ],
    syncSent: '{count} tidigare webbläsarsparade responser skickades till databasen.',
    syncPending: '{count} tidigare sparade responser väntar på en fungerande nätverksanslutning.',
    selectImage: 'Välj en PNG-, JPG-, WebP- eller GIF-bild.',
    imageTooLarge: 'Skärmbilden är för stor. Maximal storlek är 450 kB.',
    imageReadFailed: 'Skärmbilden kunde inte läsas.',
    titleMin: 'Skriv minst 3 tecken i rubriken.',
    descriptionMin: 'Skriv minst 5 tecken i responsen.',
    savedCloud: 'Tack. Responsen lades till i utvecklingskön.',
    savedLocal: 'Tack. Responsen sparades i den här webbläsaren, men databasen kunde inte nås just nu.',
    saveFailed: 'Responsen kunde inte sparas. Försök igen om en stund.',
    sentOnce: 'Responsen har skickats endast en gång. Du kan nu stänga fönstret.',
    privacy: 'Responsen visas endast för godkända administratörer. Skriv inte personuppgifter, hälsouppgifter, lösenord eller annan känslig information. Skärmbilden sparas endast för administrationens granskning.',
    oneIssue: 'Beskriv helst endast en responshelhet åt gången. Det hjälper utvecklaren att behandla responsen snabbare och tydligare markera den som klar.',
    shortTitle: 'Kort rubrik', titlePlaceholder: 'T.ex. sökknappen döljs på telefonen',
    concernsPage: 'Gäller sidan', descriptionLabel: 'Vad borde korrigeras eller behandlas?',
    descriptionPlaceholder: 'Berätta vad du upptäckte. Enhet och webbläsare läggs till automatiskt om webbläsaren tillåter det.',
    deviceAndBrowser: 'Enhet och webbläsare', viewport: 'Vy', noDeviceInfo: 'Automatiska enhetsuppgifter kunde inte läsas.',
    screenshotOptional: 'Skärmbild, frivillig', screenshotHint: 'Maximal storlek 450 kB. Beskär bort namn, e-postadresser och annan privat information.',
    remove: 'Ta bort', fileSizeUnit: 'kB', cancel: 'Avbryt', sent: 'Respons skickad', sending: 'Skickar...', send: 'Skicka respons',
    unknownBrowser: 'Okänd webbläsare', unknownOs: 'Okänt operativsystem',
    deviceTypes: { mobile: 'telefon', tablet: 'surfplatta', desktop: 'dator', unknown: 'okänd enhet' },
  },
  en: {
    home: 'Home page', kicker: 'Test feedback', title: 'Give feedback about the page', close: 'Close',
    types: [
      { value: 'bug', label: 'Error', description: 'Something does not work or is displayed incorrectly.' },
      { value: 'content', label: 'Content', description: 'Text, a heading or information needs correcting.' },
      { value: 'link', label: 'Link', description: 'A link is missing, does not work or leads to the wrong place.' },
      { value: 'accessibility', label: 'Accessibility', description: 'The page is difficult to use with a keyboard, screen reader or mobile device.' },
      { value: 'idea', label: 'Idea', description: 'A suggestion for improving the page.' },
      { value: 'other', label: 'Other', description: 'Some other feedback.' },
    ],
    syncSent: '{count} previously browser-saved feedback items were sent to the database.',
    syncPending: '{count} previously saved feedback items are waiting for a working network connection.',
    selectImage: 'Select a PNG, JPG, WebP or GIF image.',
    imageTooLarge: 'The screenshot is too large. The maximum size is 450 kB.',
    imageReadFailed: 'The screenshot could not be read.',
    titleMin: 'Enter at least 3 characters in the title.',
    descriptionMin: 'Enter at least 5 characters in the feedback.',
    savedCloud: 'Thank you. The feedback was added to the development queue.',
    savedLocal: 'Thank you. The feedback was saved in this browser, but the database could not be reached right now.',
    saveFailed: 'The feedback could not be saved. Please try again in a moment.',
    sentOnce: 'The feedback was sent only once. You can now close the window.',
    privacy: 'Feedback is visible only to approved administrators. Do not enter personal data, health information, passwords or other sensitive information. A screenshot is stored only for administrative review.',
    oneIssue: 'Please describe only one feedback item at a time. This helps the developer process it faster and mark it as completed more clearly.',
    shortTitle: 'Short title', titlePlaceholder: 'For example, the search button is hidden on a phone',
    concernsPage: 'Page concerned', descriptionLabel: 'What should be corrected or addressed?',
    descriptionPlaceholder: 'Describe what you noticed. Device and browser details are added automatically if the browser allows it.',
    deviceAndBrowser: 'Device and browser', viewport: 'Viewport', noDeviceInfo: 'Automatic device information could not be read.',
    screenshotOptional: 'Screenshot, optional', screenshotHint: 'Maximum size 450 kB. Crop out names, email addresses and other private information.',
    remove: 'Remove', fileSizeUnit: 'kB', cancel: 'Cancel', sent: 'Feedback sent', sending: 'Sending...', send: 'Send feedback',
    unknownBrowser: 'Unknown browser', unknownOs: 'Unknown operating system',
    deviceTypes: { mobile: 'phone', tablet: 'tablet', desktop: 'computer', unknown: 'unknown device' },
  },
} as const;

const getCurrentPageLabel = (homeLabel: string) => {
  if (typeof window === 'undefined') return homeLabel;
  const file = window.location.pathname.split('/').pop() || 'index.html';
  if (file === 'index.html' || file === '') return homeLabel;
  return file;
};

const SCREENSHOT_MAX_BYTES = 450 * 1024;
const allowedScreenshotTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const screenshotAcceptTypes = [...allowedScreenshotTypes].join(',');
const screenshotDataUrlPattern = /^data:image\/(?:png|jpeg|webp|gif);base64,/;

const detectBrowser = (userAgent: string, unknownBrowser: string) => {
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
  return match ?? { name: unknownBrowser, version: undefined };
};

const detectOs = (userAgent: string, platform: string, unknownOs: string) => {
  if (/Windows/i.test(userAgent) || /Win/i.test(platform)) return 'Windows';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS/iPadOS';
  if (/Mac/i.test(platform)) return 'macOS';
  if (/Linux/i.test(userAgent) || /Linux/i.test(platform)) return 'Linux';
  return unknownOs;
};

const detectDeviceType = (userAgent: string): FeedbackClientInfo['deviceType'] => {
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) return 'mobile';
  if (/iPad|Tablet/i.test(userAgent)) return 'tablet';
  if (typeof window !== 'undefined') return 'desktop';
  return 'unknown';
};

const collectClientInfo = (unknownBrowser: string, unknownOs: string): FeedbackClientInfo | undefined => {
  if (typeof window === 'undefined') return undefined;
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform || '';
  const browser = detectBrowser(userAgent, unknownBrowser);
  return {
    browserName: browser.name,
    browserVersion: browser.version,
    osName: detectOs(userAgent, platform, unknownOs),
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
      reject(new Error('SCREENSHOT_READ_FAILED'));
      return;
    }
    if (!screenshotDataUrlPattern.test(reader.result)) {
      reject(new Error('SCREENSHOT_FORMAT_INVALID'));
      return;
    }
    resolve({
      name: file.name,
      type: file.type || 'image/png',
      size: file.size,
      dataUrl: reader.result,
    });
  };
  reader.onerror = () => reject(new Error('SCREENSHOT_READ_FAILED'));
  reader.readAsDataURL(file);
});

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { language } = useI18n();
  const copy = feedbackTranslations[language === 'sv' || language === 'en' ? language : 'fi'];
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(() => getCurrentPageLabel(copy.home));
  const [submitted, setSubmitted] = useState(false);
  const [submitNotice, setSubmitNotice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [syncNotice, setSyncNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientInfo, setClientInfo] = useState<FeedbackClientInfo | undefined>(() => collectClientInfo(copy.unknownBrowser, copy.unknownOs));
  const [screenshot, setScreenshot] = useState<FeedbackScreenshotDraft | null>(null);
  const [screenshotError, setScreenshotError] = useState('');
  const submissionLockedRef = useRef(false);
  const submitStatusRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap(modalRef, isOpen, onClose, closeButtonRef);

  useEffect(() => {
    if (!isOpen) return;
    setType('bug');
    setTitle('');
    setDescription('');
    setPage(getCurrentPageLabel(copy.home));
    setSubmitted(false);
    setSubmitNotice('');
    setSubmitError('');
    setSyncNotice('');
    setIsSubmitting(false);
    setClientInfo(collectClientInfo(copy.unknownBrowser, copy.unknownOs));
    setScreenshot(null);
    setScreenshotError('');
    submissionLockedRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = '';
    void syncLocalFeedbackItems().then((result) => {
      if (result.synced > 0) {
        setSyncNotice(copy.syncSent.replace('{count}', String(result.synced)));
      } else if (result.remaining > 0) {
        setSyncNotice(copy.syncPending.replace('{count}', String(result.remaining)));
      }
    }).catch(() => {});
  }, [copy, isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const chooseScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshotError('');
    const file = event.target.files?.[0];
    if (!file) {
      setScreenshot(null);
      return;
    }

    if (!allowedScreenshotTypes.has(file.type)) {
      setScreenshot(null);
      setScreenshotError(copy.selectImage);
      event.target.value = '';
      return;
    }

    if (file.size > SCREENSHOT_MAX_BYTES) {
      setScreenshot(null);
      setScreenshotError(copy.imageTooLarge);
      event.target.value = '';
      return;
    }

    try {
      setScreenshot(await fileToScreenshot(file));
    } catch {
      setScreenshot(null);
      setScreenshotError(copy.imageReadFailed);
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
    if (submitted || isSubmitting || submissionLockedRef.current) return;
    setSubmitError('');

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedPage = page.trim() || getCurrentPageLabel(copy.home);

    if (trimmedTitle.length < 3) {
      setSubmitError(copy.titleMin);
      return;
    }

    if (trimmedDescription.length < 5) {
      setSubmitError(copy.descriptionMin);
      return;
    }

    submissionLockedRef.current = true;
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
        ? copy.savedCloud
        : copy.savedLocal);
      window.requestAnimationFrame(() => submitStatusRef.current?.focus());
    } catch {
      submissionLockedRef.current = false;
      setSubmitError(copy.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center overflow-hidden bg-black/55 backdrop-blur-lg sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div ref={modalRef} tabIndex={-1} className="aurora-modal-shell flex h-[100dvh] max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-none border-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2.5rem] sm:border">
        <div className="aurora-modal-header flex shrink-0 items-center justify-between gap-4 p-5 text-white md:p-8">
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-widest text-white/70">{copy.kicker}</p>
            <h2 id="feedback-modal-title" className="font-display text-3xl font-bold leading-tight md:text-5xl">{copy.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-white/10 text-3xl font-black transition-all hover:bg-white/20 active:scale-95"
            aria-label={copy.close}
          >
            x
          </button>
        </div>

        {submitted ? (
          <div className="shrink-0 border-b-2 border-green-200 bg-green-50 p-4 sm:px-5 md:px-8 dark:border-green-900 dark:bg-green-900/20">
            <div
              ref={submitStatusRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              className="rounded-2xl border-4 border-green-200 bg-green-50 p-4 font-black text-green-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)] dark:border-green-900 dark:bg-green-900/20 dark:text-green-200"
            >
              <p>{submitNotice}</p>
              <p className="mt-1 text-sm font-bold">{copy.sentOnce}</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="aurora-modal-body min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 md:p-8">
            <p className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-pale)] p-4 font-bold text-[var(--theme-text-2)]">
              {copy.privacy}
            </p>
            <p className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 font-bold text-[var(--theme-text-2)]">
              {copy.oneIssue}
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {copy.types.map((option) => (
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
                <span className="block font-black text-[var(--theme-text-2)]">{copy.shortTitle}</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="aurora-input w-full rounded-2xl px-4 py-3 font-bold"
                  placeholder={copy.titlePlaceholder}
                  minLength={3}
                  maxLength={140}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="block font-black text-[var(--theme-text-2)]">{copy.concernsPage}</span>
                <input
                  value={page}
                  onChange={(event) => setPage(event.target.value)}
                  className="aurora-input w-full rounded-2xl px-4 py-3 font-bold"
                  maxLength={120}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="block font-black text-[var(--theme-text-2)]">{copy.descriptionLabel}</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="aurora-input min-h-[150px] w-full resize-y rounded-2xl px-4 py-3 font-bold"
                placeholder={copy.descriptionPlaceholder}
                minLength={5}
                maxLength={1600}
                required
              />
            </label>

            <div className="grid gap-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="font-black text-[var(--theme-text-2)]">{copy.deviceAndBrowser}</p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--theme-text-3)]">
                  {clientInfo
                    ? `${clientInfo.browserName}${clientInfo.browserVersion ? ` ${clientInfo.browserVersion}` : ''}, ${clientInfo.osName}, ${copy.deviceTypes[clientInfo.deviceType]}. ${copy.viewport} ${clientInfo.viewport}.`
                    : copy.noDeviceInfo}
                </p>
              </div>
              <div>
                <label className="block space-y-2">
                  <span className="block font-black text-[var(--theme-text-2)]">{copy.screenshotOptional}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={screenshotAcceptTypes}
                    onChange={chooseScreenshot}
                    className="block w-full text-sm font-bold text-[var(--theme-text-2)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--theme-primary)] file:px-4 file:py-2 file:font-black file:text-white"
                  />
                </label>
                <p className="mt-2 text-xs font-bold text-[var(--theme-text-3)]">
                  {copy.screenshotHint}
                </p>
                {screenshot ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--theme-pale)] p-3">
                    <span className="min-w-0 truncate text-sm font-black text-[var(--theme-text)]">
                      {screenshot.name} ({Math.round(screenshot.size / 1024)} {copy.fileSizeUnit})
                    </span>
                    <button type="button" onClick={removeScreenshot} className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--theme-primary)]">
                      {copy.remove}
                    </button>
                  </div>
                ) : null}
                {screenshotError ? (
                  <p className="mt-2 text-sm font-black text-rose-700 dark:text-rose-300">{screenshotError}</p>
                ) : null}
              </div>
            </div>

            {syncNotice ? (
              <p role="status" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
                {syncNotice}
              </p>
            ) : null}

            {submitError ? (
              <p role="alert" className="rounded-2xl border-4 border-rose-200 bg-rose-50 p-4 font-black text-rose-800 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-200">
                {submitError}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="aurora-secondary-button px-6 py-3">
                {submitted ? copy.close : copy.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitted}
                className="rounded-full bg-[var(--theme-primary)] px-8 py-3 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitted ? copy.sent : isSubmitting ? copy.sending : copy.send}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default FeedbackModal;
