import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { ScamAlertEntry, subscribeScamAlerts } from '../scamAlerts';
import { useI18n } from '../i18n';

const severityStyles = {
  info: 'border-[var(--theme-gold)] bg-[var(--theme-surface)] text-[var(--theme-text)]',
  warning: 'border-[var(--theme-gold)] bg-[var(--theme-surface)] text-[var(--theme-text)]',
  danger: 'border-[var(--theme-gold)] bg-[var(--theme-surface)] text-[var(--theme-text)]',
};

const MORE_SCAM_ALERTS_URL = 'https://www.kyberturvallisuuskeskus.fi/fi/varoitukset';

const isVisibleAlert = (alert: ScamAlertEntry) => {
  if (!alert.active) return false;
  if (!alert.expiresAt) return true;
  const expiresAt = Date.parse(alert.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt > Date.now();
};

const formatDateTime = (value: string | undefined, locale: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getSourceLabel = (alert: ScamAlertEntry, ncscSource: string, fallback: string) => {
  if (alert.source === 'ncsc-auto') return ncscSource;
  if (alert.source) return alert.source;
  return fallback;
};

const formatAlertMeta = (alert: ScamAlertEntry, locale: string, ncscSource: string, fallback: string) => {
  const time = formatDateTime(alert.createdAt, locale);
  return `${getSourceLabel(alert, ncscSource, fallback)}${time ? ` · ${time}` : ''}`;
};

interface ScamAlertsBannerProps {
  compact?: boolean;
  framed?: boolean;
}

const ScamAlertsBanner: React.FC<ScamAlertsBannerProps> = ({ compact = false, framed = false }) => {
  const { locale, t } = useI18n();
  const [alerts, setAlerts] = useState<ScamAlertEntry[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ScamAlertEntry | null>(null);

  useEffect(() => subscribeScamAlerts(setAlerts), []);

  const visibleAlerts = useMemo(
    () => alerts.filter(isVisibleAlert).slice(0, 2),
    [alerts]
  );

  if (visibleAlerts.length === 0) return null;

  const alertDialog = selectedAlert ? ReactDOM.createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scam-alerts-dialog-heading"
        className="aurora-modal-shell max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-[var(--theme-surface)] p-4 shadow-2xl sm:max-h-[90vh] sm:p-6 md:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="scam-alerts-dialog-heading" className="text-2xl font-black text-[var(--theme-text)] md:text-4xl">
              {t('scamAlertsTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAlert(null)}
            className="rounded-full bg-[var(--theme-pale)] px-5 py-3 font-black text-[var(--theme-text)] transition-all hover:bg-[var(--theme-gold-pale)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30"
          >
            {t('close')}
          </button>
        </div>

        <article className={`mt-4 rounded-2xl border-2 p-4 shadow-sm md:mt-5 md:p-5 ${severityStyles[selectedAlert.severity]}`}>
          <h3 className="text-xl md:text-2xl font-black">
            {selectedAlert.title}
          </h3>
          <p className="mt-1 text-sm font-bold text-[var(--theme-muted)]">
            {formatAlertMeta(selectedAlert, locale, t('ncscSource'), t('scamAlertsTitle'))}
          </p>
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
              {t('scamAlertSource')}
            </a>
          )}
        </article>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <section
      className={framed ? 'zone zone-suosikit space-y-3 !border-[3px] !border-[var(--theme-gold)] !py-5' : 'space-y-3'}
      data-tour={framed ? 'scam-alerts' : undefined}
      aria-labelledby="scam-alerts-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="scam-alerts-heading" className="flex items-center gap-2 text-xl font-black text-[var(--theme-text)] md:text-2xl">
            <span aria-hidden="true">⚠️</span>
            {t('scamAlertsTitle')}
          </h3>
        </div>
      </div>

      <div className={compact ? 'grid grid-cols-1 gap-3 md:grid-cols-2' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'} aria-label={t('scamAlertsHeadings')}>
        {visibleAlerts.map((alert) => (
          <button
            key={alert.id}
            type="button"
            onClick={() => setSelectedAlert(alert)}
            className={`${severityStyles[alert.severity]} flex flex-col justify-between gap-3 rounded-2xl border-2 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)] ${compact ? 'min-h-[72px]' : 'min-h-[130px]'}`}
            aria-haspopup="dialog"
          >
            <span className="font-black text-base md:text-xl leading-tight">
              {alert.title}
            </span>
            <span className="text-xs font-bold text-[var(--theme-muted)]">
              {formatAlertMeta(alert, locale, t('ncscSource'), t('scamAlertsTitle'))}
            </span>
          </button>
        ))}
      </div>

      <a
        href={MORE_SCAM_ALERTS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex font-black text-[var(--theme-primary)] hover:underline"
      >
        {t('moreScamAlerts')}
      </a>

      {alertDialog}
    </section>
  );
};

export default ScamAlertsBanner;
