import React, { useEffect, useMemo, useState } from 'react';
import { ScamAlertEntry, subscribeScamAlerts } from '../scamAlerts';

const severityStyles = {
  info: 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
  danger: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100',
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

const ScamAlertsBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<ScamAlertEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => subscribeScamAlerts(setAlerts), []);

  const visibleAlerts = useMemo(
    () => alerts.filter(isVisibleAlert).slice(0, 3),
    [alerts]
  );

  if (visibleAlerts.length === 0) return null;

  return (
    <section className="rounded-2xl border-4 border-rose-100 bg-white dark:bg-slate-900 dark:border-rose-950/60 p-4 shadow-sm" aria-labelledby="scam-alerts-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-rose-700 dark:text-rose-300">
            Ajankohtaista
          </p>
          <h3 id="scam-alerts-heading" className="text-xl md:text-2xl font-black text-slate-950 dark:text-white">
            Huijausvaroitukset
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-base font-black shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-rose-300"
        >
          Avaa {visibleAlerts.length} varoitusta
        </button>
      </div>

      <ul className="mt-3 grid gap-2" aria-label="Huijausvaroitusten otsikot">
        {visibleAlerts.map((alert) => (
          <li key={alert.id} className="font-black text-slate-900 dark:text-white leading-tight">
            {alert.title}
          </li>
        ))}
      </ul>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scam-alerts-dialog-heading"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-5 md:p-7 shadow-2xl"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-rose-700 dark:text-rose-300">
                  Ajankohtaista
                </p>
                <h2 id="scam-alerts-dialog-heading" className="text-2xl md:text-4xl font-black text-slate-950 dark:text-white">
                  Huijausvaroitukset
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-5 py-3 font-black transition-all focus:outline-none focus:ring-4 focus:ring-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Sulje
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {visibleAlerts.map((alert) => (
                <article
                  key={alert.id}
                  className={`rounded-2xl border-4 p-5 shadow-sm ${severityStyles[alert.severity]}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-900 dark:bg-slate-950/60 dark:text-white">
                      {severityLabel[alert.severity]}
                    </span>
                    {alert.source === 'ncsc-auto' && (
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-900 dark:bg-slate-950/60 dark:text-white">
                        Kyberturvallisuuskeskus
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl md:text-2xl font-black">
                    {alert.title}
                  </h3>
                  <p className="mt-2 text-base md:text-lg font-bold leading-relaxed">
                    {alert.body}
                  </p>
                  {alert.sourceUrl && (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-sm font-black underline decoration-2 underline-offset-4"
                    >
                      Lähde
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ScamAlertsBanner;
