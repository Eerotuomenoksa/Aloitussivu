import React, { useEffect } from 'react';
import { LanguageCode } from './i18n';

export type PublicPageLanguage = 'fi' | 'sv' | 'en';
export type PublicPageId = 'linkit' | 'tietosuoja' | 'saavutettavuus';

const supportedLanguages = new Set<PublicPageLanguage>(['fi', 'sv', 'en']);

export const PUBLIC_PAGE_LANGUAGES: Array<{
  code: PublicPageLanguage;
  label: string;
  shortLabel: string;
}> = [
  { code: 'fi', label: 'Suomi', shortLabel: 'FI' },
  { code: 'sv', label: 'Svenska', shortLabel: 'SV' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
];

const languageSwitcherLabels: Record<PublicPageLanguage, string> = {
  fi: 'Vaihda sivun kieli',
  sv: 'Byt sidans språk',
  en: 'Change page language',
};

export const getPublicPageLanguage = (): PublicPageLanguage => {
  if (typeof document === 'undefined') return 'fi';
  const documentLanguage = document.documentElement.lang.toLocaleLowerCase().split('-')[0];
  return supportedLanguages.has(documentLanguage as PublicPageLanguage)
    ? documentLanguage as PublicPageLanguage
    : 'fi';
};

export const getLocalizedPublicPageHref = (
  page: PublicPageId,
  language: LanguageCode | PublicPageLanguage,
) => {
  if (language === 'sv' || language === 'en') return `./${page}-${language}.html`;
  return `./${page}.html`;
};

export const usePublicPageLanguage = () => {
  const language = getPublicPageLanguage();

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch {
      // Language persistence must not prevent the page from working.
    }
    document.documentElement.lang = language;
  }, [language]);

  return language;
};

export function PublicPageLanguageSwitcher({
  page,
  language,
}: {
  page: PublicPageId;
  language: PublicPageLanguage;
}) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label={languageSwitcherLabels[language]}
    >
      {PUBLIC_PAGE_LANGUAGES.map((option) => {
        const isCurrent = option.code === language;
        return (
          <a
            key={option.code}
            href={getLocalizedPublicPageHref(page, option.code)}
            hrefLang={option.code}
            lang={option.code}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={option.label}
            className={`${isCurrent
              ? 'bg-[var(--theme-gold)] text-[var(--theme-header-bg)]'
              : 'bg-white/10 text-white hover:bg-white/20'
            } inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 py-2 text-sm font-black shadow-sm focus:outline-none focus:ring-4 focus:ring-white/30`}
          >
            {option.shortLabel}
          </a>
        );
      })}
    </nav>
  );
}
