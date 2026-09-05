import { getDataProvider } from './services/data';

export type UsageEvent = {
  type: 'pageview' | 'linkClick' | 'guide';
  page: string;
  label?: string;
  category?: string;
  entry?: 'direct' | 'internal' | 'seniorsurf' | 'search' | 'external';
  navType?: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  freshTab?: boolean;
  displayMode?: 'browser' | 'standalone';
  step?: 'opened' | 'browser' | 'done' | 'shared';
  value?: string;
};

export type EntryContext = Pick<
  UsageEvent,
  'entry' | 'navType' | 'freshTab' | 'displayMode'
>;

const USAGE_TRACKING_DISABLED_KEY = 'seniorSurfUsageTrackingDisabled';
const PAGEVIEW_DELAY_MS = 15000;
const SEARCH_HOSTS = ['google.', 'bing.', 'duckduckgo.', 'search.yahoo.', 'ecosia.'];
const GUIDE_VALUES = {
  browser: new Set(['chrome', 'edge', 'firefox', 'safari', 'android', 'ios', 'other']),
  shared: new Set(['share', 'email', 'sms', 'print', 'copy']),
} as const;

const isLocalDevelopmentHost = () => {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

const readUsageTrackingDisabled = () => {
  try {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(USAGE_TRACKING_DISABLED_KEY) === '1';
  } catch {
    return false;
  }
};

export const isUsageTrackingDisabled = () => isLocalDevelopmentHost() || readUsageTrackingDisabled();

export const setUsageTrackingDisabled = (disabled: boolean) => {
  try {
    if (typeof localStorage === 'undefined') return;
    if (disabled) {
      localStorage.setItem(USAGE_TRACKING_DISABLED_KEY, '1');
    } else {
      localStorage.removeItem(USAGE_TRACKING_DISABLED_KEY);
    }
  } catch {
    // Usage tracking preferences are best-effort only.
  }
};

const getPageName = () => {
  if (typeof window === 'undefined') return 'unknown';
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path.replace(/\.html$/i, '') || 'index';
};

const getNavigationType = (): UsageEvent['navType'] => {
  try {
    const navigation = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
    return ['navigate', 'reload', 'back_forward', 'prerender'].includes(navigation?.type ?? '')
      ? navigation?.type
      : undefined;
  } catch {
    return undefined;
  }
};

const getReferrerCategory = (
  referrer: string,
  navType: UsageEvent['navType'],
  freshTab: boolean,
): UsageEvent['entry'] => {
  if (!referrer) {
    return navType === 'navigate' && freshTab ? 'direct' : undefined;
  }
  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.origin === window.location.origin) return 'internal';
    const hostname = referrerUrl.hostname.toLocaleLowerCase('en-US');
    if (hostname === 'seniorsurf.fi' || hostname.endsWith('.seniorsurf.fi')) return 'seniorsurf';
    if (SEARCH_HOSTS.some((searchHost) => hostname.includes(searchHost))) return 'search';
    return 'external';
  } catch {
    return 'external';
  }
};

// Campaign parameters are presentation metadata only. Remove them from the
// visible URL, but never include their value in usage events.
const removeCampaignSourceFromUrl = () => {
  try {
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('src')) return;
    currentUrl.searchParams.delete('src');
    window.history.replaceState(window.history.state, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  } catch {
    // URL cleanup is best effort only.
  }
};

export const getEntryContext = (): EntryContext => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return {};
  try {
    removeCampaignSourceFromUrl();
    const navType = getNavigationType();
    const freshTab = window.history.length === 1;
    const entry = getReferrerCategory(document.referrer, navType, freshTab);
    const displayMode = window.matchMedia?.('(display-mode: standalone)').matches
      || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
      ? 'standalone'
      : 'browser';
    return {
      ...(entry ? { entry } : {}),
      ...(navType ? { navType } : {}),
      freshTab,
      displayMode,
    };
  } catch {
    return {};
  }
};

// Capture navigation state at module load. history.length may change before the delayed pageview is sent.
const initialEntryContext = getEntryContext();

const sendUsageEvent = async (event: UsageEvent) => {
  if (typeof navigator === 'undefined') return;
  if (isUsageTrackingDisabled()) return;
  getDataProvider()
    .then((provider) => provider.submitPublic('usage-events', event as Record<string, unknown>))
    .catch(() => {
      // Usage tracking is optional and must not disturb the user.
    });
};

export const trackPageView = (page = getPageName()) => {
  void sendUsageEvent({ type: 'pageview', page, ...initialEntryContext });
};

export const trackLinkClick = (values: { category?: string; page?: string }) => {
  void sendUsageEvent({
    type: 'linkClick',
    page: values.page || getPageName(),
    category: values.category,
  });
};

export const trackGuideStep = (
  step: 'opened' | 'browser' | 'done' | 'shared',
  value?: string,
) => {
  if ((step === 'browser' || step === 'shared') && !GUIDE_VALUES[step].has(value ?? '')) return;
  void sendUsageEvent({
    type: 'guide',
    page: getPageName(),
    step,
    ...((step === 'browser' || step === 'shared') && value ? { value } : {}),
  });
};

export const installUsageTracking = (page = getPageName()) => {
  if (isUsageTrackingDisabled()) return () => {};

  const pageViewTimer = window.setTimeout(() => trackPageView(page), PAGEVIEW_DELAY_MS);

  const handleClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const category = link.closest('[data-usage-category]')?.getAttribute('data-usage-category')?.trim() ?? '';
    if (!category) return;

    trackLinkClick({
      category,
      page,
    });
  };

  document.addEventListener('click', handleClick, { capture: true });
  return () => {
    window.clearTimeout(pageViewTimer);
    document.removeEventListener('click', handleClick, { capture: true });
  };
};
