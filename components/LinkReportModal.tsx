import React, { useEffect, useRef, useState } from 'react';
import { normalizeReportUrl, submitLinkReport } from '../linkVisibility';
import { LinkReportDraft, LinkReportEntry, LinkReportType } from '../types';
import { useI18n } from '../i18n';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

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
  const [website, setWebsite] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap(modalRef, Boolean(draft), onClose, closeButtonRef);

  useEffect(() => {
    if (!draft) return;
    setType(draft.url ? 'broken' : 'new');
    setName(draft.name ?? '');
    setUrl(draft.url ?? '');
    setCategory(draft.category ?? '');
    setNote('');
    setWebsite('');
    setSubmitted(false);
    setSubmitError('');
    setIsSubmitting(false);
  }, [draft]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

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

    const normalizedUrl = normalizeReportUrl(trimmedUrl);
    if (website.trim()) {
      setSubmitted(true);
      closeTimerRef.current = window.setTimeout(onClose, 900);
      return;
    }

    if (!normalizedUrl) {
      setSubmitError(t('reportUrlMustBeHttps'));
      return;
    }

    setIsSubmitting(true);

    const entry: LinkReportEntry = {
      id: crypto.randomUUID(),
      type,
      name: trimmedName,
      url: normalizedUrl,
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
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-lg sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-report-title"
    >
      <div ref={modalRef} tabIndex={-1} className="aurora-modal-shell flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2.5rem]">
        <div className="aurora-modal-header flex shrink-0 items-center justify-between gap-4 p-5 text-white md:p-8">
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-widest text-white/70">{t('linkReportKicker')}</p>
            <h2 id="link-report-title" className="font-display text-3xl font-bold leading-tight md:text-5xl">{t('linkReportTitle')}</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-white/10 text-3xl font-black transition-all hover:bg-white/20 active:scale-95"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="aurora-modal-body min-h-0 flex-1 space-y-5 overflow-y-auto p-5 md:p-8">
            <label className="sr-only" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  aria-pressed={type === option.value}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${type === option.value ? 'border-[var(--theme-primary)] bg-[var(--theme-pale)]' : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'}`}
                >
                  <span className="block font-black text-[var(--theme-text)]">{option.label}</span>
                  <span className="mt-1 block text-sm font-bold text-[var(--theme-text-3)]">{option.description}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="block font-black text-[var(--theme-text-2)]">{t('linkName')}</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="aurora-input w-full rounded-2xl px-4 py-3 font-bold"
                  placeholder={t('linkNamePlaceholder')}
                />
              </label>

              <label className="space-y-2">
                <span className="block font-black text-[var(--theme-text-2)]">{t('address')}</span>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="aurora-input w-full rounded-2xl px-4 py-3 font-bold"
                  placeholder="https://..."
                  required
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="block font-black text-[var(--theme-text-2)]">{t('category')}</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="aurora-input w-full rounded-2xl px-4 py-3 font-bold"
                placeholder={t('categoryPlaceholder')}
              />
            </label>

            <label className="space-y-2 block">
              <span className="block font-black text-[var(--theme-text-2)]">{t('additionalInfo')}</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="aurora-input min-h-[110px] w-full resize-y rounded-2xl px-4 py-3 font-bold"
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

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5">
            <button
              type="button"
              onClick={onClose}
              className="aurora-secondary-button px-6 py-3"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--theme-primary)] px-8 py-3 font-black text-white transition-all hover:bg-[var(--theme-primary-mid)] active:scale-95"
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
