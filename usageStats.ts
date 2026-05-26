import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';

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
};

const USAGE_STATS_COLLECTION = 'usageStats';

const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const toString = (value: unknown) => (typeof value === 'string' ? value : '');

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
  if (!isFirebaseConfigured) return [];
  const db = getFirebaseDb();
  if (!db) return [];

  const dates = getDateKeysBetween(startDate, endDate);
  const snapshots = await Promise.all(dates.map((date) => getDoc(doc(db, USAGE_STATS_COLLECTION, date))));

  return snapshots.map((snapshot, index) => {
    const data = snapshot.exists() ? snapshot.data() : {};
    return {
      date: dates[index],
      totalPageviews: toNumber(data.totalPageviews),
      totalLinkClicks: toNumber(data.totalLinkClicks),
      pageviews: normalizePageviews(data.pageviews),
      linkClicks: normalizeLinkClicks(data.linkClicks),
    };
  });
};
