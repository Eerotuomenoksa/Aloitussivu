import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => subscribeScamAlerts(setAlerts), []);

  const visibleAlerts = useMemo(
    () => alerts.filter(isVisibleAlert).slice(0, 2),
    [alerts]
  );

  useEffect(() => {
    if (!selectedAlert) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedAlert(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedAlert]);

  if (visibleAlerts.length === 0) return null;

  const alertDialog = selectedAlert ? ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-2 backdrop-blur-sm sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedAlert(null);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scam-alerts-dialog-heading"
        aria-describedby="scam-alerts-dialog-body"
        className="aurora-modal-shell flex max-h-[calc(100dvh-1rem)] w-full max-w-[min(72rem,calc(100vw-1rem))] flex-col overflow-y-auto rounded-[2rem] bg-[var(--theme-surface)] p-4 shadow-2xl sm:max-h-[92vh] sm:p-7 md:p-10"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="scam-alerts-dialog-heading" className="text-3xl font-black leading-tight text-[var(--theme-text)] md:text-5xl">
              {t('scamAlertsTitle')}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setSelectedAlert(null)}
            className="min-h-14 rounded-full bg-[var(--theme-pale)] px-6 py-3 text-lg font-black text-[var(--theme-text)] transition-all hover:bg-[var(--theme-gold-pale)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30"
          >
            {t('close')}
          </button>
        </div>

        <article className={`mt-6 flex min-h-[min(34rem,62dvh)] flex-1 flex-col rounded-[1.75rem] border-2 p-5 shadow-sm md:p-8 ${severityStyles[selectedAlert.severity]}`}>
          <h3 className="text-2xl font-black leading-tight md:text-4xl">
            {selectedAlert.title}
          </h3>
          <p className="mt-3 text-base font-bold text-[var(--theme-muted)] md:text-lg">
            {formatAlertMeta(selectedAlert, locale, t('ncscSource'), t('scamAlertsTitle'))}
          </p>
          <p id="scam-alerts-dialog-body" className="mt-5 text-xl font-bold leading-relaxed md:text-2xl">
            {selectedAlert.body}
          </p>
          <a
            href={selectedAlert.sourceUrl || MORE_SCAM_ALERTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-[var(--theme-gold)] px-6 py-3 text-lg font-black text-[var(--theme-cta-label)] no-underline shadow-md transition-all hover:bg-[var(--theme-gold-light)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-focus)]/30 md:mt-8"
          >
            {t('scamAlertReadMore')} →
          </a>
        </article>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <section
      className={framed ? 'zone zone-suosikit space-y-3 !border-[3px] !border-[var(--theme-gold)] !py-4' : 'space-y-3'}
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

      {compact ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-label={t('scamAlertsHeadings')}>
          {visibleAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => setSelectedAlert(alert)}
              className={`${severityStyles[alert.severity]} flex min-h-[5.75rem] flex-col justify-between gap-2 rounded-2xl border-2 p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]`}
              aria-haspopup="dialog"
            >
              <span className="font-black text-base leading-tight md:text-lg">
                {alert.title}
              </span>
              <span className="text-xs font-bold text-[var(--theme-muted)]">
                {formatAlertMeta(alert, locale, t('ncscSource'), t('scamAlertsTitle'))}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label={t('scamAlertsHeadings')}>
          {visibleAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => setSelectedAlert(alert)}
              className={`${severityStyles[alert.severity]} flex min-h-[130px] flex-col justify-between gap-3 rounded-2xl border-2 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus)]`}
              aria-haspopup="dialog"
            >
              <span className="text-base font-black leading-tight md:text-xl">
                {alert.title}
              </span>
              <span className="text-xs font-bold text-[var(--theme-muted)]">
                {formatAlertMeta(alert, locale, t('ncscSource'), t('scamAlertsTitle'))}
              </span>
            </button>
          ))}
        </div>
      )}

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
