import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { runNcscScrapeJob } from '../services/ncscScheduler';

export const ncscWeeklyScrape = onSchedule(
  {
    schedule: 'every friday 11:00',
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
    cors: true,
    invoker: 'public',
  },
  async (req, res) => {
    const secret = req.headers['x-admin-secret'];
    if (!process.env.ADMIN_TRIGGER_SECRET || secret !== process.env.ADMIN_TRIGGER_SECRET) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const result = await runNcscScrapeJob();
    res.status(200).json(result);
  }
);
