import React, { useEffect, useMemo, useState } from 'react';
import { getTranslationText } from '../../i18n';
import { isAdminAccessError } from '../../services/data';
import {
  refreshSiteContent,
  saveSiteContent,
  SITE_CONTENT_LOCALES,
  type SiteContentEntry,
  type SiteContentLocale,
} from '../../siteContent';

type ContentField = {
  key: string;
  label: string;
  help: string;
  rows?: number;
  markdown?: boolean;
  defaults: Partial<Record<SiteContentLocale, string>>;
};

type ContentGroup = {
  title: string;
  description: string;
  preview?: string;
  locales?: readonly SiteContentLocale[];
  fields: ContentField[];
};

const field = (
  key: string,
  label: string,
  defaults: Partial<Record<SiteContentLocale, string>>,
  help = 'Tyhjä kenttä käyttää sovelluksen nykyistä oletustekstiä.',
  rows?: number,
  markdown = false,
): ContentField => ({ key, label, defaults, help, rows, markdown });

const translatedDefaults = (translationKey: string): Record<SiteContentLocale, string> => Object.fromEntries(
  SITE_CONTENT_LOCALES.map((locale) => [locale, getTranslationText(locale, translationKey)]),
) as Record<SiteContentLocale, string>;

const footerDescriptionDefaults = Object.fromEntries(SITE_CONTENT_LOCALES.map((locale) => [
  locale,
  `${getTranslationText(locale, 'footerProvidedBy')} ${getTranslationText(locale, 'footerVtklLink')} ${getTranslationText(locale, 'footerSeniorSurfLink')}.`,
])) as Record<SiteContentLocale, string>;

const statementLocales = ['fi', 'sv', 'en'] as const satisfies readonly SiteContentLocale[];

const groups: ContentGroup[] = [
  {
    title: 'Etusivun ylätunniste',
    description: 'Etusivun vasemmassa yläkulmassa näkyvä nimi ja kuvaus.',
    preview: './index.html',
    fields: [
      field('header.title', 'Sivuston nimi', translatedDefaults('pageTitle')),
      field('header.tagline', 'Kuvausteksti', translatedDefaults('pageTagline')),
    ],
  },
  {
    title: 'Etusivun alatunniste',
    description: 'Etusivun alaosassa näkyvät nimi, kuvaus ja palveluntarjoajan teksti.',
    preview: './index.html#footer',
    fields: [
      field('footer.title', 'Alatunnisteen nimi', translatedDefaults('pageTitle')),
      field('footer.tagline', 'Alatunnisteen kuvaus', translatedDefaults('pageTagline')),
      field('footer.description', 'Palveluntarjoajan teksti', footerDescriptionDefaults, undefined, 3),
    ],
  },
  {
    title: 'Tietoa Seniorin aloitussivusta',
    description: 'Tietoa-ikkunan otsikot ja keskeiset kuvaustekstit. Linkki- ja tilastomäärät säilyvät automaattisina.',
    preview: './index.html',
    fields: [
      field('info.title', 'Ikkunan otsikko', translatedDefaults('infoTitle')),
      field('info.whatTitle', 'Esittelyn otsikko', translatedDefaults('infoWhatTitle')),
      field('info.whatBody', 'Esittelyteksti', translatedDefaults('infoWhatBody'), undefined, 4),
      field('info.usageTitle', 'Käyttötilaston otsikko', translatedDefaults('usageStatsTitle')),
      field('info.usageBody', 'Käyttötilaston kuvaus', translatedDefaults('usageStatsBody'), undefined, 5),
      field('info.legalTitle', 'Tietosuojaosion otsikko', translatedDefaults('legalInfoTitle')),
      field('info.legalBody', 'Tietosuojaosion kuvaus', translatedDefaults('legalInfoBody'), undefined, 3),
    ],
  },
  {
    title: 'Aseta aloitussivuksi',
    description: 'Aloitussivuohjeen otsikko, johdanto ja keskeiset ohjetekstit. Selainkohtaiset tekniset vaiheet säilyvät ennallaan.',
    preview: './index.html',
    fields: [
      field('homepage.title', 'Ikkunan otsikko', translatedDefaults('homepageTitle')),
      field('homepage.intro', 'Johdanto', {
        fi: 'Valitse, asetatko aloitussivun itse, autatko toista henkilöä vai jaatko ohjeen.',
        sv: 'Välj om du ställer in startsidan själv, hjälper någon annan eller delar anvisningen.',
        en: 'Choose whether to set the start page yourself, help someone else or share the instructions.',
      }, undefined, 3),
      field('homepage.addressLabel', 'Osoitekentän ohje', translatedDefaults('useThisAddress')),
      field('homepage.choosePathTitle', 'Valinnan otsikko', translatedDefaults('homepageChoosePathTitle')),
      field('homepage.tipTitle', 'Vinkin otsikko', translatedDefaults('helpTipTitle')),
      field('homepage.tipBody', 'Vinkin teksti', translatedDefaults('helpTipBody'), undefined, 4),
    ],
  },
  {
    title: 'Tietosuojaseloste',
    description: 'Otsikko ja ingressi voidaan vaihtaa erikseen. Selosteteksti korvaa tallennettaessa nykyisen vakiosisällön kokonaan.',
    preview: './tietosuoja.html',
    locales: statementLocales,
    fields: [
      field('privacy.title', 'Sivun otsikko', { fi: 'Tietosuoja', sv: 'Dataskydd', en: 'Privacy' }),
      field('privacy.intro', 'Ingressi', {
        fi: 'Seniorin aloitussivua voit käyttää ilman tunnusta ja salasanaa. Sivu ei seuraa sinua. Sivu ei tee sinusta profiilia. Omat valintasi tallentuvat pääosin vain omaan selaimeesi.',
        sv: 'Du kan använda Seniorens startsida utan användarnamn och lösenord. Sidan följer dig inte och skapar ingen profil av dig. Dina val sparas huvudsakligen endast i din egen webbläsare.',
        en: 'You can use the Senior Start Page without an account or password. The page does not track you or create a profile of you. Your choices are mainly saved only in your own browser.',
      }, undefined, 5),
      field('privacy.body', 'Koko selosteteksti', { fi: '', sv: '', en: '' }, 'Tyhjä kenttä näyttää nykyisen rakenteisen selosteen. Markdown: ## väliotsikko, - luettelokohta ja [linkin nimi](https://osoite.fi).', 18, true),
    ],
  },
  {
    title: 'Saavutettavuusseloste',
    description: 'Otsikko ja ingressi voidaan vaihtaa erikseen. Selosteteksti korvaa tallennettaessa nykyisen vakiosisällön kokonaan.',
    preview: './saavutettavuus.html',
    locales: statementLocales,
    fields: [
      field('accessibility.title', 'Sivun otsikko', { fi: 'Saavutettavuusseloste', sv: 'Tillgänglighetsutlåtande', en: 'Accessibility statement' }),
      field('accessibility.intro', 'Ingressi', {
        fi: 'Seniorin aloitussivu on suunniteltu ikääntyneille käyttäjille. Selkeä rakenne, isot painikkeet, tekstikoon säätö ja rauhallinen näkymä ovat palvelun peruslähtökohtia.',
        sv: 'Seniorens startsida har utformats för äldre användare. En tydlig struktur, stora knappar, justerbar textstorlek och en lugn vy är grundläggande utgångspunkter för tjänsten.',
        en: 'The Senior Start Page is designed for older users. A clear structure, large buttons, adjustable text size and a calm view are fundamental principles of the service.',
      }, undefined, 5),
      field('accessibility.body', 'Koko selosteteksti', { fi: '', sv: '', en: '' }, 'Tyhjä kenttä näyttää nykyisen rakenteisen selosteen. Markdown: ## väliotsikko, - luettelokohta ja [linkin nimi](https://osoite.fi).', 18, true),
    ],
  },
];

const localeLabels: Record<SiteContentLocale, string> = {
  fi: 'Suomi',
  sv: 'Ruotsi',
  en: 'Englanti',
  se: 'Pohjoissaame',
  uk: 'Ukraina',
  et: 'Eesti',
  ru: 'Venäjä',
};
const draftKey = (key: string, locale: SiteContentLocale) => `${locale}:${key}`;

const SiteContentEditor: React.FC<{ onAccessError?: () => void }> = ({ onAccessError }) => {
  const [locale, setLocale] = useState<SiteContentLocale>('fi');
  const [entries, setEntries] = useState<SiteContentEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const next = await refreshSiteContent(true);
      setEntries(next);
      setDrafts(Object.fromEntries(next.map((entry) => [draftKey(entry.key, entry.locale), entry.value])));
      setMessage('');
    } catch (error) {
      if (isAdminAccessError(error)) onAccessError?.();
      setMessage(error instanceof Error ? error.message : 'Sivutekstejä ei voitu ladata.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const activeCount = useMemo(() => entries.filter((entry) => entry.locale === locale && entry.value).length, [entries, locale]);
  const statementEditorAvailable = locale === 'fi' || locale === 'sv' || locale === 'en';

  const save = async (contentField: ContentField, reset = false) => {
    const id = draftKey(contentField.key, locale);
    const value = reset ? '' : (drafts[id] ?? '').trim();
    setBusyKey(id);
    setMessage('');
    try {
      await saveSiteContent(contentField.key, locale, value);
      setEntries((current) => [
        ...current.filter((entry) => !(entry.key === contentField.key && entry.locale === locale)),
        ...(value ? [{ key: contentField.key, locale, value, updatedAt: new Date().toISOString() }] : []),
      ]);
      setDrafts((current) => ({ ...current, [id]: value }));
      setMessage(value ? `“${contentField.label}” tallennettiin.` : `“${contentField.label}” palautettiin oletustekstiin.`);
    } catch (error) {
      if (isAdminAccessError(error)) onAccessError?.();
      setMessage(error instanceof Error ? error.message : 'Tekstiä ei voitu tallentaa.');
    } finally {
      setBusyKey('');
    }
  };

  const loadDefaultStatement = async (contentField: ContentField) => {
    if (locale !== 'fi' && locale !== 'sv' && locale !== 'en') {
      setMessage('Tälle kielelle ei ole erillistä tarkistettua selostesivua.');
      return;
    }
    const id = draftKey(contentField.key, locale);
    setBusyKey(id);
    setMessage('');
    try {
      const value = contentField.key === 'privacy.body'
        ? (await import('../../tietosuoja')).getPrivacyDefaultMarkdown(locale)
        : (await import('../../saavutettavuus')).getAccessibilityDefaultMarkdown(locale);
      setDrafts((current) => ({ ...current, [id]: value }));
      setMessage('Nykyinen vakiosisältö kopioitiin editoriin. Tarkista muutokset ja paina Tallenna.');
    } catch {
      setMessage('Nykyistä vakiosisältöä ei voitu kopioida editoriin.');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <section id="site-content" className="scroll-mt-6 space-y-5 rounded-2xl border border-violet-200 bg-violet-50/40 p-5 shadow-sm dark:border-violet-900 dark:bg-violet-950/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black md:text-3xl">Sivutekstien editori</h2>
          <p className="mt-1 max-w-3xl text-sm font-bold text-slate-600 dark:text-slate-300">Muokkaa julkisia tekstejä ilman koodimuutosta. Tallennus kirjataan ylläpidon muutoslokiin ja näkyy julkisilla sivuilla viimeistään noin minuutissa.</p>
        </div>
        <span className="rounded-full bg-violet-100 px-4 py-2 font-black text-violet-950 dark:bg-violet-900/50 dark:text-violet-100">Mukautettuja {activeCount}</span>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Muokattava kieli">
        {(Object.keys(localeLabels) as SiteContentLocale[]).map((item) => (
          <button key={item} type="button" onClick={() => setLocale(item)} aria-pressed={locale === item} className={`rounded-full px-5 py-3 font-black ${locale === item ? 'bg-violet-700 text-white' : 'bg-white text-violet-950 shadow-sm dark:bg-slate-900 dark:text-violet-100'}`}>
            {localeLabels[item]}
          </button>
        ))}
      </div>

      {!statementEditorAvailable && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          Tällä kielellä voi muokata etusivun, Tietoa-ikkunan sekä aloitussivuohjeen tekstejä. Erilliset tietosuoja- ja saavutettavuussivut ovat käytössä vain suomeksi, ruotsiksi ja englanniksi.
        </p>
      )}

      {message && <p role="status" aria-live="polite" className="rounded-xl bg-white p-3 font-bold text-slate-800 dark:bg-slate-900 dark:text-slate-100">{message}</p>}
      {loading ? <p className="font-bold">Ladataan sivutekstejä…</p> : (
        <div className="space-y-5">
          {groups.filter((group) => !group.locales || group.locales.includes(locale)).map((group) => (
            <details key={group.title} className="rounded-2xl border border-violet-200 bg-white p-4 dark:border-violet-900 dark:bg-slate-900">
              <summary className="cursor-pointer text-xl font-black text-violet-950 dark:text-violet-100">{group.title}</summary>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="max-w-3xl text-sm font-bold text-slate-600 dark:text-slate-300">{group.description}</p>
                  {group.preview && <a href={group.preview} target="_blank" rel="noreferrer" className="aurora-nav-link px-4 py-2 text-sm">Avaa esikatselu</a>}
                </div>
                {group.fields.map((contentField) => {
                  const id = draftKey(contentField.key, locale);
                  const value = drafts[id] ?? '';
                  const hasOverride = entries.some((entry) => entry.key === contentField.key && entry.locale === locale && entry.value);
                  return (
                    <div key={contentField.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                      <label htmlFor={`content-${id}`} className="block font-black text-slate-900 dark:text-white">{contentField.label}</label>
                      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{contentField.help}</p>
                      <textarea
                        id={`content-${id}`}
                        value={value}
                        rows={contentField.rows ?? 2}
                        maxLength={contentField.markdown ? 100000 : 5000}
                        placeholder={contentField.defaults[locale] || 'Kirjoita korvaava teksti tähän…'}
                        onChange={(event) => setDrafts((current) => ({ ...current, [id]: event.target.value }))}
                        disabled={busyKey === id}
                        className={`mt-3 w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 font-bold text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-600/25 dark:border-slate-600 dark:bg-slate-800 dark:text-white ${contentField.markdown ? 'font-mono text-sm' : ''}`}
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className={`text-xs font-black ${hasOverride ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}>{hasOverride ? 'Mukautettu teksti käytössä' : 'Oletusteksti käytössä'}</span>
                        <div className="flex flex-wrap gap-2">
                          {contentField.markdown && !value && <button type="button" disabled={busyKey === id} onClick={() => void loadDefaultStatement(contentField)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-violet-900 shadow-sm disabled:opacity-50 dark:bg-slate-800 dark:text-violet-100">Lataa nykyinen seloste</button>}
                          {hasOverride && <button type="button" disabled={busyKey === id} onClick={() => void save(contentField, true)} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-black text-slate-900 disabled:opacity-50 dark:bg-slate-700 dark:text-white">Palauta oletus</button>}
                          <button type="button" disabled={busyKey === id || !value.trim()} onClick={() => void save(contentField)} className="rounded-full bg-violet-700 px-5 py-2 text-sm font-black text-white disabled:opacity-50">{busyKey === id ? 'Tallennetaan…' : 'Tallenna'}</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
};

export default SiteContentEditor;
