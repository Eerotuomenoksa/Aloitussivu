
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { SHORTCUTS } from '../constants';
import { LINK_STATS } from '../linkStats';
import { LOCAL_LINK_STATS } from '../localStats';
import { filterVisibleShortcuts, useLinkVisibilityVersion } from '../linkVisibility';
import { useI18n } from '../i18n';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { getLocalizedPublicPageHref } from '../publicPageLocalization';
import { getSiteContentValue, isSiteContentLocale, type SiteContentLocale } from '../siteContent';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSizeStep?: number;
  showOnboardingOffer?: boolean;
  onStartOnboarding?: () => void;
}

const TESTER_FIRST_NAMES = [
  'Ari',
  'Eija-Riitta',
  'Jaana',
  'Marianne',
  'Minna',
  'Pertti',
  'Tapani',
] as const;

const infoPageTranslations = {
  fi: {
    scopeTitle: 'Sivuston laajuus',
    scopeBody: 'Sivustolta löytyy yhteensä {count} näkyvää linkkiä.',
    localLinksTitle: 'Paikalliset linkit',
    localLinksBody: 'Paikalliset sisällöt näkyvät oman kunnan perusteella. Osa linkeistä on kunta- tai aluekohtaisia palveluita, osa taas yleisiä kategorioita, joiden näkyvyyttä tarkennetaan paikkakunnan mukaan.',
    allCategories: 'Kaikki {count} kategoriaa',
    localItems: [
      ['Kunnat', 'kunnan omat verkkosivut'],
      ['Kieliversiot', 'kuntien ruotsi-, englanti- ja muut kieliversiot'],
      ['Hyvinvointialueet', 'alueen sote-sivut'],
      ['Kunnan palvelusivut', 'esim. palvelut ja asiointi'],
      ['Paikallisliikenne', 'joukkoliikenne ja reittioppaat'],
      ['Palveluliikenne', 'kuntien palvelu-, asiointi- ja kutsuliikenne'],
      ['Paikalliset kirjastot', 'kirjastojen omat palvelut'],
      ['Lehdet', 'suomalaiset paikallislehdet'],
      ['Uutisvirrat', 'paikallislehtien RSS-syötteet'],
      ['Ohjattu liikunta', 'kuntien liikuntaryhmät ja soveltava liikunta'],
      ['Senioripalvelut', 'kuntien omat seniori- ja ikäihmisten sivut'],
      ['Urheiluseurat', 'paikkakunnan omat seurat'],
      ['Kela-taksien puhelinnumerot', 'alueelliset tilausnumerot'],
    ],
  },
  sv: {
    scopeTitle: 'Webbplatsens omfattning',
    scopeBody: 'Webbplatsen innehåller totalt {count} synliga länkar.',
    localLinksTitle: 'Lokala länkar',
    localLinksBody: 'Lokalt innehåll visas utifrån den egna kommunen. Vissa länkar är kommun- eller områdesspecifika tjänster, medan andra är allmänna kategorier vars synlighet anpassas efter orten.',
    allCategories: 'Alla {count} kategorier',
    localItems: [
      ['Kommuner', 'kommunernas egna webbplatser'],
      ['Språkversioner', 'kommunernas svenska, engelska och andra språkversioner'],
      ['Välfärdsområden', 'områdets social- och hälsovårdssidor'],
      ['Kommunala servicesidor', 't.ex. tjänster och ärenden'],
      ['Lokaltrafik', 'kollektivtrafik och ruttguider'],
      ['Servicetrafik', 'kommunernas service-, ärende- och anropsstyrda trafik'],
      ['Lokala bibliotek', 'bibliotekens egna tjänster'],
      ['Tidningar', 'finländska lokaltidningar'],
      ['Nyhetsflöden', 'lokaltidningarnas RSS-flöden'],
      ['Ledd motion', 'kommunernas motionsgrupper och anpassad motion'],
      ['Seniortjänster', 'kommunernas egna sidor för seniorer och äldre'],
      ['Idrottsföreningar', 'lokala föreningar'],
      ['Telefonnummer till FPA-taxi', 'regionala beställningsnummer'],
    ],
  },
  en: {
    scopeTitle: 'Website scope',
    scopeBody: 'The website contains a total of {count} visible links.',
    localLinksTitle: 'Local links',
    localLinksBody: 'Local content is shown based on the user’s municipality. Some links are municipal or regional services, while others are general categories whose visibility is refined according to location.',
    allCategories: 'All {count} categories',
    localItems: [
      ['Municipalities', 'municipalities’ own websites'],
      ['Language versions', 'municipal Swedish, English and other language versions'],
      ['Wellbeing services counties', 'regional health and social services pages'],
      ['Municipal service pages', 'for example services and official matters'],
      ['Local public transport', 'public transport and route planners'],
      ['Service transport', 'municipal service, errand and on-demand transport'],
      ['Local libraries', 'libraries’ own services'],
      ['Newspapers', 'Finnish local newspapers'],
      ['News feeds', 'local newspaper RSS feeds'],
      ['Guided exercise', 'municipal exercise groups and adapted exercise'],
      ['Services for older people', 'municipal pages for senior and older residents'],
      ['Sports clubs', 'local clubs'],
      ['Kela taxi phone numbers', 'regional booking numbers'],
    ],
  },
} as const;

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, fontSizeStep = 0, showOnboardingOffer = false, onStartOnboarding }) => {
  const { language, t, categoryName } = useI18n();
  const copy = infoPageTranslations[language === 'sv' || language === 'en' ? language : 'fi'];
  const contentLocale: SiteContentLocale | null = isSiteContentLocale(language) ? language : null;
  const managedText = (key: string, fallback: string) => contentLocale
    ? getSiteContentValue(key, contentLocale, fallback)
    : fallback;
  useLinkVisibilityVersion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleClasses = ['text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];
  const headerIconClasses = ['text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];
  const statClasses = ['text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];

  useModalFocusTrap(modalRef, isOpen, onClose, closeButtonRef);

  if (!isOpen) return null;

  const categoryStats = filterVisibleShortcuts(SHORTCUTS).map(shortcut => {
    let count = 0;
    if (shortcut.providers) {
      count = shortcut.providers.length;
    } else if (shortcut.url) {
      count = 1;
    }
    return { name: shortcut.name, count, icon: shortcut.icon };
  });

  const totalLinks = LINK_STATS.visibleLinks;

  const scopeSummary = t('infoScopeSummary')
    .replace('{categories}', String(categoryStats.length))
    .replace('{links}', String(totalLinks));

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-3 text-[var(--theme-text)] backdrop-blur-sm animate-in fade-in duration-200 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div ref={modalRef} tabIndex={-1} className="aurora-modal-shell flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden md:max-h-[calc(100dvh-3rem)]">
        <div className="aurora-modal-header z-10 flex shrink-0 items-center justify-between gap-4 p-5 text-white md:p-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className={`rounded-[1.5rem] bg-white/10 p-3 transition-all duration-300 ${headerIconClasses[fontSizeStep]}`}>ℹ️</span>
            <h2 id="info-modal-title" className={`font-display font-bold transition-all duration-300 ${titleClasses[fontSizeStep]}`}>{managedText('info.title', t('infoTitle'))}</h2>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            className="aurora-close-button flex h-12 w-12 shrink-0 text-3xl"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>
        
        <div className="aurora-modal-body min-h-0 flex-1 space-y-10 overflow-y-auto p-6 md:p-10">
          <section className="space-y-4">
            <h3 className="aurora-section-title text-2xl underline decoration-[var(--theme-gold)] underline-offset-8">{managedText('info.whatTitle', t('infoWhatTitle'))}</h3>
            <p className="text-xl leading-relaxed text-[var(--theme-text-2)]">
              {managedText('info.whatBody', t('infoWhatBody'))} {scopeSummary}
            </p>
          </section>

          {showOnboardingOffer && onStartOnboarding && (
            <section className="aurora-soft-panel rounded-[2rem] p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h3 className="aurora-section-title text-2xl">
                    {t('onboardingOfferTitle')}
                  </h3>
                  <p className="text-lg font-bold leading-relaxed text-[var(--theme-text-2)]">
                    {t('onboardingOfferBody')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStartOnboarding}
                  className="shrink-0 rounded-full bg-[var(--theme-primary)] px-6 py-4 text-lg font-black text-white shadow-md transition-all hover:bg-[var(--theme-primary-mid)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/40 active:scale-95"
                >
                  {t('onboardingStart')}
                </button>
              </div>
            </section>
          )}

          <section className="aurora-soft-panel space-y-6 p-8">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-[var(--theme-primary)]">
                <span>📊</span> {copy.scopeTitle}
              </h3>
              <p className="text-2xl font-medium leading-tight text-[var(--theme-text)]">
                {copy.scopeBody.split('{count}')[0]}
                <span className={`inline-block px-2 font-black text-[var(--theme-primary)] transition-all duration-300 ${statClasses[fontSizeStep]}`}>{totalLinks}</span>
                {copy.scopeBody.split('{count}')[1]}
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="aurora-section-title text-2xl underline decoration-[var(--theme-gold)] underline-offset-8">{managedText('info.usageTitle', t('usageStatsTitle'))}</h3>
            <p className="text-xl leading-relaxed text-[var(--theme-text-2)]">
              {managedText('info.usageBody', t('usageStatsBody'))}
            </p>
          </section>

          <section className="aurora-soft-panel space-y-4 rounded-3xl p-6">
            <h3 className="aurora-section-title text-2xl">{t('testerThanksTitle')}</h3>
            <p className="text-lg font-bold leading-relaxed text-[var(--theme-text-2)]">
              {t('testerThanksBody')}
            </p>
            <ul className="flex flex-wrap gap-2" aria-label={t('testerThanksTitle')}>
              {TESTER_FIRST_NAMES.map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2 text-lg font-black text-[var(--theme-primary)]"
                >
                  {name}
                </li>
              ))}
            </ul>
          </section>

          <section className="aurora-panel space-y-4 rounded-3xl p-6">
            <h3 className="aurora-section-title text-2xl">{managedText('info.legalTitle', t('legalInfoTitle'))}</h3>
            <p className="text-lg font-bold leading-relaxed text-[var(--theme-text-2)]">
              {managedText('info.legalBody', t('legalInfoBody'))}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={getLocalizedPublicPageHref('tietosuoja', language)}
                target="_blank"
                rel="noopener noreferrer"
                className="aurora-nav-link px-5 py-3 text-base"
              >
                {t('privacyNotice')}
              </a>
              <a
                href={getLocalizedPublicPageHref('saavutettavuus', language)}
                target="_blank"
                rel="noopener noreferrer"
                className="aurora-nav-link px-5 py-3 text-base"
              >
                {t('accessibilityStatement')}
              </a>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="aurora-section-title border-b-2 border-[var(--theme-border)] pb-2 text-2xl">
              {copy.localLinksTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {copy.localItems.map(([name, note], index) => ({
                name,
                note,
                count: [
                  LOCAL_LINK_STATS.municipalities,
                  LOCAL_LINK_STATS.municipalityLanguageVersions,
                  LOCAL_LINK_STATS.wellbeingAreas,
                  LOCAL_LINK_STATS.municipalityServicePages,
                  LOCAL_LINK_STATS.localTransport,
                  LOCAL_LINK_STATS.localServiceTransport,
                  LOCAL_LINK_STATS.localLibraries,
                  LOCAL_LINK_STATS.localNewspapers,
                  LOCAL_LINK_STATS.localNewsFeeds,
                  LOCAL_LINK_STATS.localExerciseLinks,
                  LOCAL_LINK_STATS.localSeniorLinks,
                  LOCAL_LINK_STATS.localSportsClubs,
                  LOCAL_LINK_STATS.localKelaTaxiPhones,
                ][index],
              })).map((item) => (
                <div key={item.name} className="aurora-card flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <span className="block text-lg font-bold text-[var(--theme-text)]">{item.name}</span>
                    <span className="block text-sm font-bold text-[var(--theme-text-3)]">{item.note}</span>
                  </div>
                  <span className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-1 font-bold text-[var(--theme-primary)]">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-[var(--theme-text-3)]">
              {copy.localLinksBody}
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="aurora-section-title border-b-2 border-[var(--theme-border)] pb-2 text-2xl">
              {copy.allCategories.replace('{count}', String(categoryStats.length))}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryStats.sort((a,b) => a.name.localeCompare(b.name)).map((stat, idx) => (
                <div key={idx} className="aurora-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-lg font-bold text-[var(--theme-text)]">{categoryName(stat.name)}</span>
                  </div>
                  <span className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-1 font-bold text-[var(--theme-primary)]">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="z-10 shrink-0 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center md:p-6">
          <button
            type="button"
            onClick={onClose}
            className="aurora-secondary-button px-5 py-2.5 text-xl"
            aria-label={t('close')}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default InfoModal;
