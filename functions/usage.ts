import { createHash } from 'node:crypto';
import { onRequest, type Request } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAllowedOrigins } from './cors';

type UsageEventType = 'pageview' | 'linkClick';

type UsagePayload = {
  type?: unknown;
  page?: unknown;
  url?: unknown;
  label?: unknown;
  category?: unknown;
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const getAdminDb = () => {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
};

const getAdminAppCheck = () => {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getAppCheck();
};

const verifyAppCheck = async (req: Request) => {
  const token = req.header('X-Firebase-AppCheck');
  if (!token) return false;

  try {
    await getAdminAppCheck().verifyToken(token);
    return true;
  } catch {
    return false;
  }
};

const getDateKey = () => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Helsinki',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const cleanText = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.trim().replace(/\s+/g, ' ').slice(0, 180) || fallback;
};

const cleanUrl = (value: unknown) => {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) return '';
    url.hash = '';
    return url.toString().slice(0, 500);
  } catch {
    return '';
  }
};

const getSafeKey = (value: string) => (
  createHash('sha1').update(value).digest('hex').slice(0, 20)
);

const getClientKey = (req: Request) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return firstForwarded?.split(',')[0]?.trim() || req.ip || 'unknown';
};

const isRateLimited = (clientKey: string) => {
  const now = Date.now();
  const current = rateLimitBuckets.get(clientKey);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
};

const getPayload = (req: Request): UsagePayload => {
  if (req.body && typeof req.body === 'object') return req.body as UsagePayload;
  return {};
};

const buildUpdate = (payload: UsagePayload) => {
  const type = payload.type as UsageEventType;
  const page = cleanText(payload.page, 'unknown');
  const pageKey = getSafeKey(page);
  const now = new Date().toISOString();

  if (type === 'pageview') {
    return {
      totalPageviews: FieldValue.increment(1),
      pageviews: {
        [pageKey]: {
          count: FieldValue.increment(1),
          page,
        },
      },
      updatedAt: now,
    };
  }

  if (type === 'linkClick') {
    const url = cleanUrl(payload.url);
    if (!url) return null;
    const linkKey = getSafeKey(url);
    return {
      totalLinkClicks: FieldValue.increment(1),
      linkClicks: {
        [linkKey]: {
          count: FieldValue.increment(1),
          url,
          label: cleanText(payload.label, url),
          category: cleanText(payload.category),
          page,
        },
      },
      updatedAt: now,
    };
  }

  return null;
};

export const trackUsage = onRequest(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 15,
    cors: getAllowedOrigins(),
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    if (!await verifyAppCheck(req)) {
      res.status(204).send();
      return;
    }

    if (isRateLimited(getClientKey(req))) {
      res.status(204).send();
      return;
    }

    const update = buildUpdate(getPayload(req));
    if (!update) {
      res.status(400).json({ error: 'Invalid usage event' });
      return;
    }

    await getAdminDb().collection('usageStats').doc(getDateKey()).set({
      date: getDateKey(),
      ...update,
    }, { merge: true });

    res.status(204).send();
  }
);
