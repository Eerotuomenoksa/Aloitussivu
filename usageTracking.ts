import { getFirebaseAppCheckToken } from './firebaseClient';

type UsageEvent = {
  type: 'pageview' | 'linkClick';
  page: string;
  url?: string;
  label?: string;
  category?: string;
};

const getUsageTrackUrl = () => {
  const explicitUrl = import.meta.env.VITE_USAGE_TRACK_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return '';
  return `https://europe-west1-${projectId}.cloudfunctions.net/trackUsage`;
};

const getPageName = () => {
  if (typeof window === 'undefined') return 'unknown';
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path.replace(/\.html$/i, '') || 'index';
};

const sendUsageEvent = async (event: UsageEvent) => {
  const url = getUsageTrackUrl();
  if (!url || typeof navigator === 'undefined') return;

  const body = JSON.stringify(event);
  const appCheckToken = await getFirebaseAppCheckToken();
  if (!appCheckToken) return;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Firebase-AppCheck': appCheckToken,
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Usage tracking is optional and must not disturb the user.
  });
};

export const trackPageView = (page = getPageName()) => {
  void sendUsageEvent({ type: 'pageview', page });
};

export const trackLinkClick = (values: { url: string; label?: string; category?: string; page?: string }) => {
  void sendUsageEvent({
    type: 'linkClick',
    page: values.page || getPageName(),
    url: values.url,
    label: values.label,
    category: values.category,
  });
};

export const installUsageTracking = (page = getPageName()) => {
  trackPageView(page);

  const handleClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (!(link instanceof HTMLAnchorElement)) return;

    const href = link.href;
    if (!href) return;

    trackLinkClick({
      url: href,
      label: link.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120),
      category: link.closest('[data-usage-category]')?.getAttribute('data-usage-category') ?? '',
      page,
    });
  };

  document.addEventListener('click', handleClick, { capture: true });
  return () => document.removeEventListener('click', handleClick, { capture: true });
};
