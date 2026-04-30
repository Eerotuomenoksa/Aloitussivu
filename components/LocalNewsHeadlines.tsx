import React, { useEffect, useState } from 'react';
import { fetchLocalNewsHeadlines } from '../services/rssService';
import { isLinkVisible, useLinkVisibilityVersion } from '../linkVisibility';
import { LocalNewsHeadline, RssFeedConfig } from '../types';

interface LocalNewsHeadlinesProps {
  feeds: RssFeedConfig[];
  fallbackUrl: string;
  fontSizeStep: number;
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

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric' }).format(date);
};

const LocalNewsHeadlines: React.FC<LocalNewsHeadlinesProps> = ({ feeds, fallbackUrl, fontSizeStep }) => {
  useLinkVisibilityVersion();
  const [headlines, setHeadlines] = useState<LocalNewsHeadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Ladataan paikallisia uutisia">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 p-5 min-h-[130px] animate-pulse">
            <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-4" />
            <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
        <p className={`text-slate-500 dark:text-slate-400 font-bold mb-4 ${smallTextClasses[fontSizeStep]}`}>
          Paikallista RSS-syötettä ei saatu ladattua.
        </p>
        {fallbackUrl && isLinkVisible(fallbackUrl) && (
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 font-black transition-all active:scale-95 ${smallTextClasses[fontSizeStep]}`}
          >
            Avaa uutishaku
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {headlines.filter((headline) => isLinkVisible(headline.link)).map((headline) => (
        <a
          key={headline.link}
          href={headline.link}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 p-5 shadow-md hover:shadow-xl transition-all active:scale-95 min-h-[130px] flex flex-col justify-between gap-4"
        >
          <span className={`font-black text-slate-900 dark:text-white leading-tight ${textClasses[fontSizeStep]}`}>
            {headline.title}
          </span>
          <span className={`font-bold text-slate-500 dark:text-slate-400 ${smallTextClasses[fontSizeStep]}`}>
            {headline.source}{formatDate(headline.publishedAt) ? ` · ${formatDate(headline.publishedAt)}` : ''}
          </span>
        </a>
      ))}
    </div>
  );
};

export default LocalNewsHeadlines;
