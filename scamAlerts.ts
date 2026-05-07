import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';

export type ScamAlertSeverity = 'info' | 'warning' | 'danger';

export interface ScamAlertEntry {
  id: string;
  title: string;
  body: string;
  severity: ScamAlertSeverity;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  source?: string;
  sourceUrl?: string;
  sourceWeek?: string;
  originalHeading?: string;
  structureVersion?: '2026' | '2025' | 'unknown';
}

export interface NcscScrapeLogEntry {
  id: string;
  url: string;
  weekLabel: string;
  publishedAt?: string;
  processedAt: string;
  alertsCreated: number;
  structureVersion: '2026' | '2025' | 'unknown';
}

const SCAM_ALERTS_COLLECTION = 'scamAlerts';
const NCSC_SCRAPE_LOG_COLLECTION = 'ncscScrapeLog';

export const subscribeScamAlerts = (callback: (alerts: ScamAlertEntry[]) => void) => {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const db = getFirebaseDb();
  if (!db) {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    query(collection(db, SCAM_ALERTS_COLLECTION), orderBy('createdAt', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as ScamAlertEntry[]);
    },
    () => callback([])
  );
};

export const subscribeNcscScrapeLogs = (callback: (logs: NcscScrapeLogEntry[]) => void) => {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const db = getFirebaseDb();
  if (!db) {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    query(collection(db, NCSC_SCRAPE_LOG_COLLECTION), orderBy('processedAt', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.slice(0, 10).map((document) => ({
        id: document.id,
        ...document.data(),
      })) as NcscScrapeLogEntry[]);
    },
    () => callback([])
  );
};

export const updateScamAlertActiveState = async (id: string, active: boolean) => {
  const db = getFirebaseDb();
  if (!db) return;
  await updateDoc(doc(db, SCAM_ALERTS_COLLECTION, id), {
    active,
    updatedAt: new Date().toISOString(),
  });
};

export const getNcscScrapeNowUrl = () => {
  const explicitUrl = import.meta.env.VITE_NCSC_SCRAPE_NOW_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return '';
  return `https://europe-west1-${projectId}.cloudfunctions.net/ncscScrapeNow`;
};

export const runNcscScrapeNow = async () => {
  const secret = import.meta.env.VITE_ADMIN_TRIGGER_SECRET?.trim();
  const url = getNcscScrapeNowUrl();

  if (!secret) {
    throw new Error('VITE_ADMIN_TRIGGER_SECRET puuttuu.');
  }
  if (!url) {
    throw new Error('Cloud Function -osoitetta ei voitu muodostaa.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-secret': secret,
    },
  });

  if (!response.ok) {
    throw new Error(`NCSC-ajon käynnistys epäonnistui (${response.status}).`);
  }

  return response.json() as Promise<{ alertsCreated: number; url: string | null }>;
};
