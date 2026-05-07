import { createHash, randomUUID } from 'crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  fetchLatestNcscReviewUrl,
  fetchPageHtml,
  parseNcscReview,
  simplifyForSeniors,
} from './ncscScraper';

type ScrapeLogEntry = {
  url: string;
  weekLabel: string;
  publishedAt?: string;
  processedAt: string;
  alertsCreated: number;
  structureVersion: '2026' | '2025' | 'unknown';
};

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
const ALERT_TTL_MS = 28 * 24 * 60 * 60 * 1000;

const getAdminDb = () => {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
};

const getDocumentId = (url: string) => createHash('md5').update(url).digest('hex');

const wasRecentlyProcessed = (log: ScrapeLogEntry | undefined) => {
  if (!log?.processedAt) return false;
  const processedAt = Date.parse(log.processedAt);
  return Number.isFinite(processedAt) && Date.now() - processedAt < SIX_DAYS_MS;
};

export async function runNcscScrapeJob(): Promise<{ alertsCreated: number; url: string | null }> {
  try {
    const url = await fetchLatestNcscReviewUrl();
    if (!url) {
      console.log('NCSC RSS empty');
      return { alertsCreated: 0, url: null };
    }

    const db = getAdminDb();
    const logRef = db.collection('ncscScrapeLog').doc(getDocumentId(url));
    const existingLog = await logRef.get();
    const logData = existingLog.exists ? existingLog.data() as ScrapeLogEntry : undefined;

    if (wasRecentlyProcessed(logData)) {
      console.log(`NCSC already processed: ${url}`);
      return { alertsCreated: 0, url };
    }

    const html = await fetchPageHtml(url);
    const result = await parseNcscReview(html, url);
    console.log(`NCSC structure version: ${result.structureVersion}`);

    if (result.scamItems.length === 0) {
      await logRef.set({
        url,
        weekLabel: result.weekLabel,
        publishedAt: result.publishedAt,
        processedAt: new Date().toISOString(),
        alertsCreated: 0,
        structureVersion: result.structureVersion,
      });
      return { alertsCreated: 0, url };
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ALERT_TTL_MS).toISOString();

    for (const item of result.scamItems) {
      const simplified = await simplifyForSeniors(item);
      const id = randomUUID();
      await db.collection('scamAlerts').doc(id).set({
        id,
        title: simplified.title,
        body: simplified.body,
        severity: simplified.severity,
        active: true,
        createdAt: now,
        updatedAt: now,
        expiresAt,
        source: 'ncsc-auto',
        sourceUrl: url,
        sourceWeek: result.weekLabel,
        originalHeading: item.heading,
        structureVersion: result.structureVersion,
      });
    }

    await logRef.set({
      url,
      weekLabel: result.weekLabel,
      publishedAt: result.publishedAt,
      processedAt: new Date().toISOString(),
      alertsCreated: result.scamItems.length,
      structureVersion: result.structureVersion,
    });

    return { alertsCreated: result.scamItems.length, url };
  } catch (error) {
    console.error('NCSC scrape job failed:', error);
    return { alertsCreated: 0, url: null };
  }
}
