import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { ScamAlertEntry, subscribeScamAlerts } from '../scamAlerts';

const severityStyles = {
  info: 'border-[#9fcbd6] bg-[#dceff4] text-slate-950 dark:border-white/15 dark:bg-[#173e5f] dark:text-white',
  warning: 'border-[#d7b565] bg-[#f8e2af] text-slate-950 dark:border-white/15 dark:bg-[#73501e] dark:text-white',
  danger: 'border-[#8fcfca] bg-[#d8f0ee] text-slate-950 dark:border-white/15 dark:bg-[#1d5c62] dark:text-white',
};

const severityLabel = {
  info: 'Tieto',
  warning: 'Varoitus',
  danger: 'Tärkeä varoitus',
};

const isVisibleAlert = (alert: ScamAlertEntry) => {
  if (!alert.active) return false;
  if (!alert.expiresAt) return true;
  const expiresAt = Date.parse(alert.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt > Date.now();
};

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

interface ScamAlertsBannerProps {
  compact?: boolean;
}

const ScamAlertsBanner: React.FC<ScamAlertsBannerProps> = ({ compact = false }) => {
  const [alerts, setAlerts] = useState<ScamAlertEntry[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ScamAlertEntry | null>(null);

  useEffect(() => subscribeScamAlerts(setAlerts), []);

  const visibleAlerts = useMemo(
    () => alerts.filter(isVisibleAlert).slice(0, 2),
    [alerts]
  );

  if (visibleAlerts.length === 0) return null;

  const alertDialog = selectedAlert ? ReactDOM.createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/70 p-3 sm:items-center sm:p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scam-alerts-dialog-heading"
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-4 shadow-2xl dark:bg-slate-900 sm:max-h-[90vh] sm:p-6 md:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="scam-alerts-dialog-heading" className="text-2xl md:text-4xl font-black text-slate-950 dark:text-white">
              Huijausvaroitukset
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAlert(null)}
            className="rounded-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-5 py-3 font-black transition-all focus:outline-none focus:ring-4 focus:ring-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            Sulje
          </button>
        </div>

        <article className={`mt-4 md:mt-5 rounded-2xl border-4 p-4 md:p-5 shadow-sm ${severityStyles[selectedAlert.severity]}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-900 dark:bg-slate-950/60 dark:text-white">
              {severityLabel[selectedAlert.severity]}
            </span>
            {selectedAlert.source === 'ncsc-auto' && (
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-900 dark:bg-slate-950/60 dark:text-white">
                Kyberturvallisuuskeskus
              </span>
            )}
          </div>
          <h3 className="mt-3 text-xl md:text-2xl font-black">
            {selectedAlert.title}
          </h3>
          {formatDateTime(selectedAlert.createdAt) && (
            <p className="mt-1 text-sm font-bold opacity-75">
              {formatDateTime(selectedAlert.createdAt)}
            </p>
          )}
          <p className="mt-2 text-base md:text-lg font-bold leading-relaxed">
            {selectedAlert.body}
          </p>
          {selectedAlert.sourceUrl && (
            <a
              href={selectedAlert.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-black underline decoration-2 underline-offset-4"
            >
              Lähde
            </a>
          )}
        </article>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <section className="space-y-3" aria-labelledby="scam-alerts-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="scam-alerts-heading" className="text-xl md:text-2xl font-black text-slate-950 dark:text-white">
            Huijausvaroitukset
          </h3>
        </div>
      </div>

      <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'} aria-label="Huijausvaroitusten otsikot">
        {visibleAlerts.map((alert) => (
          <button
            key={alert.id}
            type="button"
            onClick={() => setSelectedAlert(alert)}
            className={`${severityStyles[alert.severity]} rounded-2xl border-4 p-5 text-left shadow-md transition-all hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#d09a32]/40 ${compact ? 'min-h-[72px]' : 'min-h-[130px]'} flex flex-col justify-between gap-4`}
            aria-haspopup="dialog"
          >
            <span className="font-black text-lg md:text-xl leading-tight">
              {alert.title}
            </span>
            {formatDateTime(alert.createdAt) && (
              <span className="text-xs font-bold text-current opacity-75">
                {formatDateTime(alert.createdAt)}
              </span>
            )}
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-900 dark:bg-slate-950/60 dark:text-white">
                {severityLabel[alert.severity]}
              </span>
              {alert.source === 'ncsc-auto' && (
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-900 dark:bg-slate-950/60 dark:text-white">
                  Kyberturvallisuuskeskus
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {alertDialog}
    </section>
  );
};

export default ScamAlertsBanner;
