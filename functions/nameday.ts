import { onRequest } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAllowedOrigins } from './cors';

type NameDayItem = {
  name?: string;
  type?: string;
};

type NameDayResponse = {
  success?: boolean;
  date?: {
    formatted?: string;
  };
  name_days?: NameDayItem[];
  name_days_by_type?: Record<string, NameDayItem[]>;
};

const NAMEDAY_API_URL = 'https://nimipaivarajapinta.fi/api/namedays/today';
const NAMEDAY_MONTHLY_REQUEST_LIMIT = 100;

const getAdminDb = () => {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
};

const pickFinnishNames = (data: NameDayResponse) => {
  const finnishNames = data.name_days_by_type?.suomi ?? data.name_days?.filter((item) => item.type === 'suomi') ?? [];
  const names = finnishNames
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));

  return [...new Set(names)];
};

const getMonthKey = () => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Helsinki',
  year: 'numeric',
  month: '2-digit',
}).format(new Date());

const readMonthlyUsage = async () => {
  const monthKey = getMonthKey();
  const snapshot = await getAdminDb().collection('adminStats').doc('namedayApi').get();
  const monthlyRequests = snapshot.data()?.monthlyRequests;
  const currentMonthRequests = monthlyRequests && typeof monthlyRequests === 'object'
    ? Number((monthlyRequests as Record<string, unknown>)[monthKey] ?? 0)
    : 0;

  return {
    monthKey,
    requests: Number.isFinite(currentMonthRequests) ? currentMonthRequests : 0,
  };
};

const recordNameDayApiUse = async (success: boolean) => {
  const monthKey = getMonthKey();
  try {
    await getAdminDb().collection('adminStats').doc('namedayApi').set({
      totalRequests: FieldValue.increment(1),
      successfulRequests: FieldValue.increment(success ? 1 : 0),
      failedRequests: FieldValue.increment(success ? 0 : 1),
      monthlyRequests: {
        [monthKey]: FieldValue.increment(1),
      },
      monthlyLimit: NAMEDAY_MONTHLY_REQUEST_LIMIT,
      lastUsedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Name day usage counter update failed:', error);
  }
};

export const namedayToday = onRequest(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 30,
    cors: getAllowedOrigins(),
    invoker: 'public',
  },
  async (_req, res) => {
    const token = process.env.NAMEDAY_API_TOKEN;
    if (!token) {
      res.status(500).json({ error: 'Name day API token is not configured.' });
      return;
    }

    try {
      const monthlyUsage = await readMonthlyUsage();
      if (monthlyUsage.requests >= NAMEDAY_MONTHLY_REQUEST_LIMIT) {
        res.set('Cache-Control', 'public, max-age=1800, s-maxage=3600');
        res.status(429).json({
          error: 'Name day API monthly test limit reached.',
          hidden: true,
          month: monthlyUsage.monthKey,
          monthlyRequests: monthlyUsage.requests,
          monthlyLimit: NAMEDAY_MONTHLY_REQUEST_LIMIT,
        });
        return;
      }

      const response = await fetch(NAMEDAY_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await recordNameDayApiUse(response.ok);

      if (!response.ok) {
        res.status(response.status).json({ error: 'Name day API request failed.' });
        return;
      }

      const data = await response.json() as NameDayResponse;
      res.set('Cache-Control', 'public, max-age=1800, s-maxage=3600');
      res.status(200).json({
        date: data.date?.formatted ?? '',
        names: pickFinnishNames(data),
      });
    } catch (error) {
      console.error('Name day fetch failed:', error);
      res.status(500).json({ error: 'Name day fetch failed.' });
    }
  }
);
