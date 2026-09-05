import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useI18n } from '../i18n';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { trackGuideStep } from '../usageTracking';
import { getSiteContentValue, isSiteContentLocale, type SiteContentLocale } from '../siteContent';

interface HomepageModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSizeStep?: number;
}

type GuidePath = 'own' | 'helper' | 'share';
type BrowserId = 'chrome' | 'edge' | 'firefox' | 'safari' | 'android' | 'ios';
type DetectedBrowser = BrowserId | 'inapp';

const HOMEPAGE_URL = 'https://www.seniorsurf.fi/aloitus/';

const browserInstructions: Array<{
  id: BrowserId;
  label: string;
  icon: string;
  steps: string[];
}> = [
  { id: 'chrome', label: 'Google Chrome', icon: 'C', steps: ['homepageChromeStep1', 'homepageChromeStep2', 'homepageChromeStep3', 'homepageChromeStep4', 'homepageChromeStep5'] },
  { id: 'edge', label: 'Microsoft Edge', icon: 'E', steps: ['homepageEdgeStep1', 'homepageEdgeStep2', 'homepageEdgeStep3', 'homepageEdgeStep4', 'homepageEdgeStep5'] },
  { id: 'firefox', label: 'Mozilla Firefox', icon: 'F', steps: ['homepageFirefoxStep1', 'homepageFirefoxStep2', 'homepageFirefoxStep3', 'homepageFirefoxStep4'] },
  { id: 'safari', label: 'Safari (Mac)', icon: 'S', steps: ['homepageSafariStep1', 'homepageSafariStep2', 'homepageSafariStep3', 'homepageSafariStep4'] },
  { id: 'android', label: 'Android Chrome', icon: 'A', steps: ['homepageAndroidStep1', 'homepageAndroidStep2', 'homepageAndroidStep3'] },
  { id: 'ios', label: 'iPhone Safari', icon: 'i', steps: ['homepageIosStep1', 'homepageIosStep2', 'homepageIosStep3'] },
];

// Sovellusten sisaiset selaimet (WhatsApp, Messenger, Facebook, Instagram, ...). Niissa
// aloitussivua ei voi asettaa lainkaan, joten valikko-ohjeiden nayttaminen olisi harhaanjohtavaa.
const IN_APP_BROWSER_PATTERN = /fban|fbav|fb_iab|fbios|instagram|messenger|whatsapp|line\/|micromessenger|gsa\/|twitter|snapchat|tiktok/;

const detectBrowser = (): DetectedBrowser | null => {
  if (typeof navigator === 'undefined') return null;
  const agent = navigator.userAgent.toLocaleLowerCase('en-US');
  if (IN_APP_BROWSER_PATTERN.test(agent)) return 'inapp';
  // iOS:n sovellusikkuna: WebKit ilman Safari-tunnistetta.
  if (/iphone|ipad|ipod/.test(agent) && agent.includes('applewebkit') && !agent.includes('safari/')) return 'inapp';
  if (/iphone|ipad|ipod/.test(agent)) return 'ios';
  if (agent.includes('android')) return 'android';
  if (agent.includes('edg/')) return 'edge';
  if (agent.includes('firefox/')) return 'firefox';
  if (agent.includes('safari/') && !agent.includes('chrome/') && !agent.includes('chromium/')) return 'safari';
  if (agent.includes('chrome/') || agent.includes('chromium/')) return 'chrome';
  return null;
};

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  textArea.remove();
};

const HomepageModal: React.FC<HomepageModalProps> = ({ isOpen, onClose, fontSizeStep = 0 }) => {
  const { language, t } = useI18n();
  const contentLocale: SiteContentLocale | null = isSiteContentLocale(language) ? language : null;
  const managedText = (key: string, fallback: string) => contentLocale
    ? getSiteContentValue(key, contentLocale, fallback)
    : fallback;
  const managedTitle = managedText('homepage.title', t('homepageTitle'));
  const managedIntro = contentLocale ? getSiteContentValue('homepage.intro', contentLocale) : '';
  const [guidePath, setGuidePath] = useState<GuidePath | null>(null);
  const [copyStatus, setCopyStatus] = useState<'address' | 'message' | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleClasses = ['text-2xl sm:text-3xl', 'text-2xl sm:text-4xl', 'text-3xl sm:text-5xl', 'text-4xl sm:text-6xl', 'text-5xl sm:text-7xl'];
  const iconClasses = ['text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl'];
  const urlClasses = ['text-base sm:text-lg', 'text-lg sm:text-xl', 'text-xl sm:text-2xl', 'text-2xl sm:text-3xl', 'text-3xl sm:text-4xl'];
  const detectedBrowser = useMemo(detectBrowser, []);
  const isInAppBrowser = detectedBrowser === 'inapp';
  const detectedCardId = detectedBrowser === 'inapp' ? null : detectedBrowser;
  const orderedBrowsers = useMemo(() => (
    detectedCardId
      ? [...browserInstructions].sort((first, second) => (
        Number(second.id === detectedCardId) - Number(first.id === detectedCardId)
      ))
      : browserInstructions
  ), [detectedCardId]);
  const detectedBrowserLabel = useMemo(() => (
    browserInstructions.find((browser) => browser.id === detectedCardId)?.label ?? ''
  ), [detectedCardId]);
  // Avoinna olevat ohjekortit pidetaan omassa tilassaan. Suora open={id === detectedBrowser}
  // avaisi kortin uudelleen jokaisella uudelleenpiirrolla, esimerkiksi osoitetta kopioitaessa.
  const [openBrowsers, setOpenBrowsers] = useState<Set<BrowserId>>(() => new Set<BrowserId>());

  useEffect(() => {
    if (!isOpen) return;
    setOpenBrowsers(detectedCardId ? new Set<BrowserId>([detectedCardId]) : new Set<BrowserId>());
  }, [isOpen, detectedCardId]);
  const shareMessage = t('homepageShareMessage').replace('{url}', HOMEPAGE_URL);

  useModalFocusTrap(modalRef, isOpen, onClose, closeButtonRef);

  useEffect(() => {
    if (!isOpen) return;
    setGuidePath(null);
    setCopyStatus(null);
    const root = document.getElementById('root');
    const previousAriaHidden = root?.getAttribute('aria-hidden');
    const previousDisplay = root?.style.display;
    const previousPointerEvents = root?.style.pointerEvents;
    if (root) {
      root.setAttribute('aria-hidden', 'true');
      root.style.display = 'none';
      root.style.pointerEvents = 'none';
    }
    return () => {
      if (!root) return;
      if (previousAriaHidden === null) root.removeAttribute('aria-hidden');
      else root.setAttribute('aria-hidden', previousAriaHidden);
      root.style.display = previousDisplay ?? '';
      root.style.pointerEvents = previousPointerEvents ?? '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async (kind: 'address' | 'message') => {
    try {
      await copyText(kind === 'address' ? HOMEPAGE_URL : shareMessage);
      setCopyStatus(kind);
      if (kind === 'message') trackGuideStep('shared', 'copy');
      window.setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      setCopyStatus(null);
    }
  };

  const handleDone = () => {
    trackGuideStep('done');
    onClose();
  };

  const printGuide = () => {
    trackGuideStep('shared', 'print');
    window.print();
  };

  const shareOnDevice = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: managedTitle, text: shareMessage, url: HOMEPAGE_URL });
      trackGuideStep('shared', 'share');
    } catch {
      // Cancelling the native share sheet is not an error for the user.
    }
  };

  const addressCard = (
    <section className="aurora-panel space-y-4 p-4 sm:p-6" aria-labelledby="homepage-address-heading">
      <p id="homepage-address-heading" className="text-base font-black text-[var(--theme-text-2)] sm:text-lg">{managedText('homepage.addressLabel', t('useThisAddress'))}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`min-w-0 flex-1 select-all break-all rounded-2xl border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center font-mono font-black text-[var(--theme-primary)] shadow-inner ${urlClasses[fontSizeStep]}`}>
          seniorsurf.fi/aloitus
        </div>
        <button type="button" onClick={() => void handleCopy('address')} className="aurora-secondary-button min-h-12 shrink-0 px-5 py-3 text-base focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40">
          {copyStatus === 'address' ? t('addressCopied') : t('copyAddress')}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{copyStatus === 'address' ? t('addressCopied') : ''}</p>
    </section>
  );

  const inAppGuide = (
    <section className="space-y-4" aria-labelledby="in-app-heading">
      <div className="rounded-2xl border-2 border-[var(--theme-gold)] bg-[var(--theme-gold-pale)] p-5">
        <h3 id="in-app-heading" className="aurora-section-title text-2xl sm:text-3xl">{t('homepageInAppTitle')}</h3>
        <p className="mt-3 text-base font-bold leading-relaxed text-[var(--theme-text-2)] sm:text-lg">{t('homepageInAppBody')}</p>
        <p className="mt-3 text-base font-bold leading-relaxed text-[var(--theme-text-2)] sm:text-lg">{t('homepageInAppStep')}</p>
        <p className="mt-4 break-all rounded-xl bg-[var(--theme-surface)] px-4 py-3 text-lg font-black text-[var(--theme-primary)]">{HOMEPAGE_URL}</p>
      </div>
    </section>
  );

  const browserGuide = (
    <section className="space-y-4" aria-labelledby="browser-instructions-heading">
      <div>
        <h3 id="browser-instructions-heading" className="aurora-section-title text-2xl sm:text-3xl">{t('browserInstructions')}</h3>
        <p className="mt-2 font-bold text-[var(--theme-text-2)]">
          {detectedCardId
            ? t('homepageDetectedBrowser').replace('{browser}', detectedBrowserLabel)
            : t('homepageBrowserUnknown')}
        </p>
      </div>
      <div className="space-y-3">
        {orderedBrowsers.map((browser) => (
          <details
            key={browser.id}
            open={openBrowsers.has(browser.id)}
            className="group rounded-2xl border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm"
            onToggle={(event) => {
              const isNowOpen = event.currentTarget.open;
              setOpenBrowsers((current) => {
                const next = new Set(current);
                if (isNowOpen) next.add(browser.id); else next.delete(browser.id);
                return next;
              });
              if (isNowOpen) trackGuideStep('browser', browser.id);
            }}
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 font-black text-[var(--theme-primary)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]/40 sm:text-xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-pale)]" aria-hidden="true">{browser.icon}</span>
              <span className="flex-1">{browser.label}</span>
              <span className="text-2xl transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
            </summary>
            <ol className="space-y-3 border-t-2 border-[var(--theme-border)] px-4 py-5 sm:px-6">
              {browser.steps.map((stepKey, index) => (
                <li key={stepKey} className="flex items-start gap-3 text-base font-bold leading-relaxed text-[var(--theme-text-2)] sm:text-lg">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-black text-white" aria-hidden="true">{index + 1}</span>
                  <span>{t(stepKey as Parameters<typeof t>[0])}</span>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </section>
  );

  const modal = (
    <>
      <div className="homepage-guide-screen fixed inset-0 z-[9999] isolate flex items-start justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="homepage-modal-title">
        <div ref={modalRef} tabIndex={-1} className="aurora-modal-shell relative z-[10000] flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden sm:my-8 sm:max-h-[92vh]">
          <div className="aurora-modal-header sticky top-0 z-10 flex items-center justify-between gap-3 p-4 text-white shadow-lg sm:p-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <span className={`shrink-0 rounded-2xl bg-white/10 p-3 ${iconClasses[fontSizeStep]}`} aria-hidden="true">🏠</span>
              <h2 id="homepage-modal-title" className={`font-display min-w-0 font-bold leading-tight ${titleClasses[fontSizeStep]}`}>{managedTitle}</h2>
            </div>
            <button ref={closeButtonRef} type="button" onClick={onClose} className="aurora-close-button h-12 w-12 shrink-0 text-3xl" aria-label={t('closeInstructions')}>✕</button>
          </div>

          <div className="aurora-modal-body min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 md:p-8">
            {addressCard}

            {managedIntro && (
              <p className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-lg font-bold leading-relaxed text-[var(--theme-text-2)]">{managedIntro}</p>
            )}

            {!guidePath ? (
              <section className="space-y-4" aria-labelledby="homepage-path-heading">
                <h3 id="homepage-path-heading" className="aurora-section-title text-2xl sm:text-3xl">{managedText('homepage.choosePathTitle', t('homepageChoosePathTitle'))}</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {([
                    ['own', '👤', 'homepageOwnPath', 'homepageOwnPathDescription'],
                    ['helper', '🤝', 'homepageHelperPath', 'homepageHelperPathDescription'],
                    ['share', '✉️', 'homepageSharePath', 'homepageSharePathDescription'],
                  ] as const).map(([path, icon, title, description]) => (
                    <button key={path} type="button" onClick={() => setGuidePath(path)} className="aurora-card min-h-44 text-left transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40">
                      <span className="text-4xl" aria-hidden="true">{icon}</span>
                      <span className="mt-3 block text-xl font-black text-[var(--theme-primary)]">{t(title)}</span>
                      <span className="mt-2 block font-bold leading-relaxed text-[var(--theme-text-2)]">{t(description)}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <button type="button" onClick={() => setGuidePath(null)} className="aurora-nav-link min-h-12 px-5 py-3 focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40">← {t('homepageBackToPaths')}</button>
            )}

            {(guidePath === 'own' || guidePath === 'helper') && (
              <>
                {guidePath === 'helper' && (
                  <p className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-lg font-bold leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">{t('homepageHelperIntro')}</p>
                )}
                {isInAppBrowser ? inAppGuide : browserGuide}
                {guidePath === 'helper' && (
                  <fieldset className="aurora-soft-panel space-y-3 p-5">
                    <legend className="aurora-section-title px-2 text-2xl">{t('homepageHelperChecklistTitle')}</legend>
                    {['homepageHelperChecklistHomepage', 'homepageHelperChecklistText', 'homepageHelperChecklistMunicipality', 'homepageHelperChecklistScams'].map((key) => (
                      <label key={key} className="flex min-h-12 items-center gap-3 rounded-xl bg-[var(--theme-surface)] p-3 font-bold">
                        <input type="checkbox" className="h-6 w-6 shrink-0 accent-[var(--theme-primary)]" />
                        <span>{t(key as Parameters<typeof t>[0])}</span>
                      </label>
                    ))}
                  </fieldset>
                )}
                <button type="button" onClick={handleDone} className="w-full min-h-14 rounded-full bg-[var(--theme-primary)] px-6 py-4 text-xl font-black text-white shadow-lg transition-all hover:bg-[var(--theme-primary-mid)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40 active:scale-[.98]">✓ {t('homepageDone')}</button>
              </>
            )}

            {guidePath === 'share' && (
              <section className="space-y-5" aria-labelledby="homepage-share-heading">
                <h3 id="homepage-share-heading" className="aurora-section-title text-2xl sm:text-3xl">{t('homepageShareTitle')}</h3>
                <p className="rounded-2xl border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 text-lg font-bold leading-relaxed">{shareMessage}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {typeof navigator.share === 'function' && (
                    <button type="button" onClick={() => void shareOnDevice()} className="aurora-primary-button min-h-12 px-5 py-3">{t('homepageNativeShare')}</button>
                  )}
                  <a href={`mailto:?subject=${encodeURIComponent(managedTitle)}&body=${encodeURIComponent(shareMessage)}`} onClick={() => trackGuideStep('shared', 'email')} className="aurora-secondary-button flex min-h-12 items-center justify-center px-5 py-3 text-center">{t('homepageEmail')}</a>
                  <a href={`sms:?body=${encodeURIComponent(shareMessage)}`} onClick={() => trackGuideStep('shared', 'sms')} className="aurora-secondary-button flex min-h-12 items-center justify-center px-5 py-3 text-center">{t('homepageSms')}</a>
                  <button type="button" onClick={() => void handleCopy('message')} className="aurora-secondary-button min-h-12 px-5 py-3">{copyStatus === 'message' ? t('homepageMessageCopied') : t('homepageCopyMessage')}</button>
                  <button type="button" onClick={printGuide} className="aurora-secondary-button min-h-12 px-5 py-3 sm:col-span-2">🖨️ {t('homepagePrint')}</button>
                </div>
                <div className="flex justify-center rounded-3xl bg-white p-5">
                  <img src="./aloitussivu-qr.svg" alt="QR: seniorsurf.fi/aloitus" className="h-48 w-48" />
                </div>
                <p className="sr-only" role="status" aria-live="polite">{copyStatus === 'message' ? t('homepageMessageCopied') : ''}</p>
              </section>
            )}

            <section className="aurora-soft-panel space-y-3 p-5">
              <h3 className="text-xl font-black text-[var(--theme-primary)]">💡 {managedText('homepage.tipTitle', t('helpTipTitle'))}</h3>
              <p className="font-bold leading-relaxed text-[var(--theme-text-2)]">{managedText('homepage.tipBody', t('helpTipBody'))}</p>
            </section>
          </div>

          <div className="sticky bottom-0 z-10 border-t-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center">
            <button type="button" onClick={onClose} className="aurora-secondary-button min-h-12 px-8 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40" aria-label={t('closeInstructions')}>{t('closeInstructions')}</button>
          </div>
        </div>
      </div>

      <article className="homepage-print-sheet" aria-hidden="true">
        <h1>{managedTitle}</h1>
        <p>{shareMessage}</p>
        <p className="homepage-print-url">seniorsurf.fi/aloitus</p>
        <img src="./aloitussivu-qr.svg" alt="" />
        <ol>
          <li>{t('homepageChromeStep1')}</li>
          <li>{t('homepageChromeStep2')}</li>
          <li>{t('homepageChromeStep3')}</li>
          <li>{t('homepageChromeStep4')}</li>
          <li>{t('homepageChromeStep5')}</li>
        </ol>
      </article>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default HomepageModal;
