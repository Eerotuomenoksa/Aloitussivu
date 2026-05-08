import { createHash, randomUUID } from 'crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { DocumentReference, Firestore, getFirestore } from 'firebase-admin/firestore';
import {
  NcscFeedTarget,
  NcscScrapeResult,
  NcscStructureVersion,
  fetchNcscFeedTargets,
  fetchPageHtml,
  parseNcscNews,
  parseNcscReview,
  simplifyForSeniors,
} from './ncscScraper';

type ScrapeLogEntry = {
  url: string;
  weekLabel: string;
  publishedAt?: string;
  processedAt: string;
  alertsCreated: number;
  structureVersion: NcscStructureVersion;
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

const parseTarget = async (target: NcscFeedTarget): Promise<NcscScrapeResult> => {
  const html = await fetchPageHtml(target.url);
  if (target.kind === 'news') {
    return parseNcscNews(html, target.url, target.title, target.publishedAt);
  }
  return parseNcscReview(html, target.url);
};

const writeScrapeLog = async (
  logRef: DocumentReference,
  result: NcscScrapeResult,
  alertsCreated: number
) => {
  await logRef.set({
    url: result.url,
    weekLabel: result.weekLabel,
    publishedAt: result.publishedAt,
    processedAt: new Date().toISOString(),
    alertsCreated,
    structureVersion: result.structureVersion,
  });
};

const createAlerts = async (
  db: Firestore,
  result: NcscScrapeResult
) => {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ALERT_TTL_MS).toISOString();
  let alertsCreated = 0;

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
      sourceUrl: result.url,
      sourceWeek: result.weekLabel,
      originalHeading: item.heading,
      structureVersion: result.structureVersion,
    });
    alertsCreated += 1;
  }

  return alertsCreated;
};

export async function runNcscScrapeJob(): Promise<{ alertsCreated: number; url: string | null }> {
  try {
    const targets = await fetchNcscFeedTargets();
    if (targets.length === 0) {
      console.log('NCSC RSS empty');
      return { alertsCreated: 0, url: null };
    }

    const db = getAdminDb();
    let totalAlertsCreated = 0;
    let firstProcessedUrl: string | null = null;

    for (const target of targets) {
      const logRef = db.collection('ncscScrapeLog').doc(getDocumentId(target.url));
      const existingLog = await logRef.get();
      const logData = existingLog.exists ? existingLog.data() as ScrapeLogEntry : undefined;

      if (wasRecentlyProcessed(logData)) {
        console.log(`NCSC already processed: ${target.url}`);
        if (!firstProcessedUrl) firstProcessedUrl = target.url;
        continue;
      }

      const result = await parseTarget(target);
      console.log(`NCSC ${target.kind} structure version: ${result.structureVersion}`);

      if (!firstProcessedUrl) firstProcessedUrl = result.url;

      if (result.scamItems.length === 0) {
        await writeScrapeLog(logRef, result, 0);
        continue;
      }

      const alertsCreated = await createAlerts(db, result);
      totalAlertsCreated += alertsCreated;
      await writeScrapeLog(logRef, result, alertsCreated);
    }

    return { alertsCreated: totalAlertsCreated, url: firstProcessedUrl };
  } catch (error) {
    console.error('NCSC scrape job failed:', error);
    return { alertsCreated: 0, url: null };
  }
}
