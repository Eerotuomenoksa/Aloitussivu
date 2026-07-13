import React, { useEffect, useState } from 'react';
import { fetchLocalNewsHeadlines } from '../services/rssService';
import { isLinkVisible, useLinkVisibilityVersion } from '../linkVisibility';
import { LocalNewsHeadline, RssFeedConfig } from '../types';
import { useI18n } from '../i18n';

interface LocalNewsHeadlinesProps {
  feeds: RssFeedConfig[];
  fallbackUrl: string;
  fontSizeStep: number;
  compact?: boolean;
}

const textClasses = [
  'text-base md:text-lg',
  'text-lg md:text-xl',
  'text-xl md:text-2xl',
  'text-2xl md:text-3xl',
  'text-3xl md:text-4xl',
];

const smallTextClasses = [
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
];

const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatHeadlineMeta = (headline: LocalNewsHeadline) => {
  const publishedAt = formatDateTime(headline.publishedAt);
  return [publishedAt, headline.source].filter(Boolean).join(' · ');
};

const LocalNewsHeadlines: React.FC<LocalNewsHeadlinesProps> = ({ feeds, fallbackUrl, fontSizeStep, compact = false }) => {
  useLinkVisibilityVersion();
  const [headlines, setHeadlines] = useState<LocalNewsHeadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (feeds.length === 0) {
        setLoading(false);
        setFailed(false);
        setHeadlines([]);
        return;
      }

      setLoading(true);
      setFailed(false);
      setHeadlines([]);

      try {
        const next = await fetchLocalNewsHeadlines(feeds, 3);
        if (!isActive) return;
        setHeadlines(next);
        setFailed(next.length === 0);
      } catch {
        if (!isActive) return;
        setFailed(true);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [feeds]);

  if (feeds.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 text-center">
        <p className={`mb-4 font-bold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
          {t('localNewsNoSources')}
        </p>
        {fallbackUrl && isLinkVisible(fallbackUrl) && (
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 py-3 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 ${smallTextClasses[fontSizeStep]}`}
          >
            {t('openRegionalNews')}
          </a>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'} aria-label="Ladataan paikallisia uutisia">
        {[0, 1, 2].map((item) => (
          <div key={item} className={`rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm animate-pulse ${compact ? 'min-h-[72px]' : 'min-h-[130px]'}`}>
            <div className="mb-4 h-5 w-3/4 rounded bg-[var(--theme-pale)]" />
            <div className="h-5 w-full rounded bg-[var(--theme-pale)]" />
          </div>
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 text-center">
        <p className={`mb-4 font-bold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
          {t('localNewsFetchFailed')}
        </p>
        {fallbackUrl && isLinkVisible(fallbackUrl) && (
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 py-3 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95 ${smallTextClasses[fontSizeStep]}`}
          >
            {t('openRegionalNews')}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
      {headlines.filter((headline) => isLinkVisible(headline.link)).map((headline) => (
        <a
          key={headline.link}
          href={headline.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col justify-between gap-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 text-[var(--theme-text)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--theme-pale)] hover:shadow-md active:scale-[.99] ${compact ? 'min-h-[72px]' : 'min-h-[130px]'}`}
        >
          <span className={`font-black leading-tight ${textClasses[fontSizeStep]}`}>
            {headline.title}
          </span>
          <span className={`font-bold text-[var(--theme-muted)] ${compact ? 'text-sm' : smallTextClasses[fontSizeStep]}`}>
            {formatHeadlineMeta(headline)}
          </span>
        </a>
      ))}
    </div>
  );
};

export default LocalNewsHeadlines;
