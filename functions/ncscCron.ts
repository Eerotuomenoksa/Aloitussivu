import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { runNcscScrapeJob } from '../services/ncscScheduler';
import { getAllowedOrigins } from './cors';

const ADMIN_EMAILS = ['eero.tuomenoksa@gmail.com', 'seniorsurf.suomi@gmail.com'];
const ADMIN_UIDS = new Set(
  (process.env.ADMIN_UIDS ?? '')
    .split(',')
    .map((uid) => uid.trim())
    .filter(Boolean)
);

const getAdminAuth = () => {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getAuth();
};

export const ncscWeeklyScrape = onSchedule(
  {
    // NCSC publishes most RSS items during Finnish office hours; run after the morning and afternoon peaks.
    schedule: '30 11,15 * * 1-5',
    timeZone: 'Europe/Helsinki',
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 120,
  },
  async () => {
    const result = await runNcscScrapeJob();
    console.log(`NCSC scrape complete: ${result.alertsCreated} alerts from ${result.url}`);
  }
);

export const ncscScrapeNow = onRequest(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 120,
    cors: getAllowedOrigins(),
    invoker: 'public',
  },
  async (req, res) => {
    const authHeader = req.headers.authorization ?? '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!idToken) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      const email = (decoded.email ?? '').toLocaleLowerCase('fi-FI');
      if (!ADMIN_EMAILS.includes(email) && !ADMIN_UIDS.has(decoded.uid)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    } catch {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    try {
      const result = await runNcscScrapeJob();
      res.status(200).json(result);
    } catch (error) {
      console.error('NCSC scrape now failed:', error);
      res.status(500).json({ error: 'Scrape failed' });
    }
  }
);
