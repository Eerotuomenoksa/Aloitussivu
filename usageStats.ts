import { getDataProvider } from './services/data';

export type UsageLinkStats = {
  count: number;
  url: string;
  label: string;
  category: string;
  page: string;
};

export type UsageDailyStats = {
  date: string;
  totalPageviews: number;
  totalLinkClicks: number;
  pageviews: Record<string, { count: number; page: string }>;
  linkClicks: Record<string, UsageLinkStats>;
  context: Record<string, Record<string, number>>;
};

const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const toString = (value: unknown) => (typeof value === 'string' ? value : '');
export const getUsageStatsErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (code === 'permission-denied' || code === 'admin_forbidden') {
      return 'Käyttötilastojen lukeminen epäonnistui: tunnuksella ei ole ylläpito-oikeutta.';
    }
  }
  return error instanceof Error ? error.message : 'Käyttötilastojen haku epäonnistui.';
};

const parseDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDateKey = (date: Date) => new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(date);

export const shiftDate = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getDateKeysBetween = (startDate: string, endDate: string) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || start > end) return [];

  const dates: string[] = [];
  for (let current = start; current <= end; current = shiftDate(current, 1)) {
    dates.push(formatDateKey(current));
    if (dates.length >= 370) break;
  }
  return dates;
};

const normalizeLinkClicks = (value: unknown) => {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value as Record<string, Record<string, unknown>>).map(([id, item]) => ([
    id,
    {
      count: toNumber(item.count),
      url: toString(item.url),
      label: toString(item.label),
      category: toString(item.category),
      page: toString(item.page),
    },
  ])));
};

const normalizePageviews = (value: unknown) => {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value as Record<string, Record<string, unknown>>).map(([id, item]) => ([
    id,
    {
      count: toNumber(item.count),
      page: toString(item.page),
    },
  ])));
};

export const fetchUsageStats = async (startDate: string, endDate: string): Promise<UsageDailyStats[]> => {
  const dates = getDateKeysBetween(startDate, endDate);
  if (dates.length === 0) return [];
  type CloudcityUsageStats = {
    daily: Array<{ date: string; pageviews: number; linkClicks: number }>;
    pages: Array<{ date: string; page: string; count: number }>;
    links: Array<{ date: string; url: string; label: string; category: string; page: string; count: number }>;
    context?: Array<{ date: string; dimension: string; bucket: string; count: number }>;
  };
  const raw = await (await getDataProvider()).listAdmin<UsageDailyStats[] | CloudcityUsageStats>('usage-stats');
  if (Array.isArray(raw)) {
    const byDate = new Map(raw.map((day) => [day.date, day]));
    return dates.map((date) => {
      const data = byDate.get(date);
      return {
        date,
        totalPageviews: toNumber(data?.totalPageviews),
        totalLinkClicks: toNumber(data?.totalLinkClicks),
        pageviews: normalizePageviews(data?.pageviews),
        linkClicks: normalizeLinkClicks(data?.linkClicks),
        context: data?.context && typeof data.context === 'object' ? data.context : {},
      };
    });
  }

  const allowedDates = new Set(dates);
  const byDate = new Map<string, UsageDailyStats>(dates.map((date) => [date, {
    date,
    totalPageviews: 0,
    totalLinkClicks: 0,
    pageviews: {},
    linkClicks: {},
    context: {},
  }]));
  raw.daily.forEach((day) => {
    const target = byDate.get(day.date);
    if (!target) return;
    target.totalPageviews = toNumber(day.pageviews);
    target.totalLinkClicks = toNumber(day.linkClicks);
  });
  raw.pages.forEach((page, index) => {
    if (!allowedDates.has(page.date)) return;
    const target = byDate.get(page.date)!;
    target.pageviews[`page-${index}`] = { count: toNumber(page.count), page: toString(page.page) };
  });
  raw.links.forEach((link, index) => {
    if (!allowedDates.has(link.date)) return;
    const target = byDate.get(link.date)!;
    target.linkClicks[`link-${index}`] = {
      count: toNumber(link.count),
      url: toString(link.url),
      label: toString(link.label),
      category: toString(link.category),
      page: toString(link.page),
    };
  });
  (raw.context ?? []).forEach((item) => {
    if (!allowedDates.has(item.date)) return;
    const target = byDate.get(item.date)!;
    const dimension = toString(item.dimension);
    const bucket = toString(item.bucket);
    if (!dimension || !bucket) return;
    target.context[dimension] ??= {};
    target.context[dimension][bucket] = toNumber(item.count);
  });
  return dates.map((date) => byDate.get(date)!);
};
