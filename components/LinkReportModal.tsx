import React, { useEffect, useRef, useState } from 'react';
import { submitLinkReport } from '../linkVisibility';
import { LinkReportDraft, LinkReportEntry, LinkReportType } from '../types';
import { useI18n } from '../i18n';

interface LinkReportModalProps {
  draft: LinkReportDraft | null;
  onClose: () => void;
}

const LinkReportModal: React.FC<LinkReportModalProps> = ({ draft, onClose }) => {
  const { t } = useI18n();
  const [type, setType] = useState<LinkReportType>('new');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!draft) return;
    setType(draft.url ? 'broken' : 'new');
    setName(draft.name ?? '');
    setUrl(draft.url ?? '');
    setCategory(draft.category ?? '');
    setNote('');
    setSubmitted(false);
    setSubmitError('');
    setIsSubmitting(false);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [draft]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [onClose]);

  if (!draft) return null;
  const typeOptions: { value: LinkReportType; label: string; description: string }[] = [
    { value: 'new', label: t('linkReportNew'), description: t('linkReportNewDescription') },
    { value: 'broken', label: t('linkReportBroken'), description: t('linkReportBrokenDescription') },
    { value: 'wrong', label: t('linkReportWrong'), description: t('linkReportWrongDescription') },
  ];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    const trimmedName = name.trim() || draft.name.trim() || t('unknownLink');
    const trimmedUrl = url.trim() || draft.url.trim();
    const trimmedCategory = category.trim() || draft.category?.trim() || '';
    const trimmedNote = note.trim();

    if (!trimmedUrl) return;
    setIsSubmitting(true);

    const entry: LinkReportEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      name: trimmedName,
      url: trimmedUrl,
      category: trimmedCategory,
      source: draft.source || t('userReport'),
      createdAt: new Date().toISOString(),
      note: trimmedNote,
    };

    try {
      await submitLinkReport(entry);

      setSubmitted(true);
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = window.setTimeout(onClose, 900);
    } catch {
      setSubmitError(t('reportSaveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-3 sm:p-4 bg-slate-200/90 dark:bg-slate-950/90 backdrop-blur-lg sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-report-title"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-700 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2.5rem]">
        <div className="shrink-0 p-5 md:p-8 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-widest text-white/70">{t('linkReportKicker')}</p>
            <h2 id="link-report-title" className="text-3xl md:text-5xl font-black leading-tight">{t('linkReportTitle')}</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-3xl font-black transition-all active:scale-95"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  aria-pressed={type === option.value}
                  className={`text-left rounded-2xl border-4 p-4 transition-all ${type === option.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}
                >
                  <span className="block font-black text-slate-900 dark:text-white">{option.label}</span>
                  <span className="block mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{option.description}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="block font-black text-slate-700 dark:text-slate-200">{t('linkName')}</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder={t('linkNamePlaceholder')}
                />
              </label>

              <label className="space-y-2">
                <span className="block font-black text-slate-700 dark:text-slate-200">{t('address')}</span>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                  required
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="block font-black text-slate-700 dark:text-slate-200">{t('category')}</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder={t('categoryPlaceholder')}
              />
            </label>

            <label className="space-y-2 block">
              <span className="block font-black text-slate-700 dark:text-slate-200">{t('additionalInfo')}</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="w-full min-h-[110px] rounded-2xl border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-y"
                placeholder={t('additionalInfoPlaceholder')}
              />
            </label>

            {submitted ? (
              <p role="status" className="rounded-2xl bg-green-50 dark:bg-green-900/20 border-4 border-green-200 dark:border-green-900 p-4 font-black text-green-800 dark:text-green-200">
                {t('reportSaved')}
              </p>
            ) : null}

            {submitError ? (
              <p role="alert" className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 border-4 border-rose-200 dark:border-rose-900 p-4 font-black text-rose-800 dark:text-rose-200">
                {submitError}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 flex flex-wrap items-center justify-end gap-3 border-t-4 border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-full font-black text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95"
            >
              {isSubmitting ? t('saving') : t('saveReport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkReportModal;
