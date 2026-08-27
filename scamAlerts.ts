import { getFirebaseAuth } from './firebaseClient';
import { adminPollIntervalMs, dataProviderKind, getDataProvider, subscribeWithPolling } from './services/data';

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
  structureVersion?: '2026' | '2025' | 'news' | 'unknown';
}

export interface NcscScrapeLogEntry {
  id: string;
  url: string;
  weekLabel: string;
  publishedAt?: string;
  processedAt: string;
  alertsCreated: number;
  structureVersion: '2026' | '2025' | 'news' | 'unknown';
}

const getScrapeLogReadErrorMessage = (error: { code?: string; message: string }) => (
  error.code === 'permission-denied' || error.code === 'admin_forbidden'
    ? 'Ajolokin lukeminen epäonnistui: tunnuksella ei ole ylläpito-oikeutta.'
    : `Ajolokin lukeminen epäonnistui: ${error.message}`
);

export const subscribeScamAlerts = (
  callback: (alerts: ScamAlertEntry[]) => void,
  admin = false,
  onError?: (error: unknown) => void,
  onLoadingChange?: (loading: boolean) => void,
) => {
  callback([]);
  return subscribeWithPolling(
    async () => {
      const provider = await getDataProvider();
      return admin
        ? provider.listAdmin<ScamAlertEntry[]>('scam-alerts')
        : provider.listPublic<ScamAlertEntry>('scam-alerts');
    },
    callback,
    onError,
    admin ? adminPollIntervalMs : 300000,
    onLoadingChange,
  );
};

export const subscribeNcscScrapeLogs = (
  callback: (logs: NcscScrapeLogEntry[]) => void,
  onError?: (message: string, error?: { code?: string; message: string }) => void
) => {
  return subscribeWithPolling(
    async () => (await getDataProvider()).listAdmin<NcscScrapeLogEntry[]>('ncsc-logs'),
    (logs) => {
      onError?.('');
      callback(logs.slice(0, 10));
    },
    (error) => {
      callback([]);
      const normalized = error instanceof Error ? error : new Error('Tuntematon virhe');
      onError?.(getScrapeLogReadErrorMessage(normalized), normalized);
    },
    adminPollIntervalMs,
  );
};

export const updateScamAlertActiveState = async (id: string, active: boolean) => {
  await (await getDataProvider()).updateAdmin('scam-alerts', id, { active });
};

export const getNcscScrapeNowUrl = () => {
  const explicitUrl = import.meta.env.VITE_NCSC_SCRAPE_NOW_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return '';
  return `https://europe-west1-${projectId}.cloudfunctions.net/ncscScrapeNow`;
};

export const runNcscScrapeNow = async () => {
  if (dataProviderKind === 'cloudcity') {
    return (await getDataProvider()).runAdminAction<{
      status: 'completed' | 'skipped';
      alertsCreated: number;
      targetsProcessed: number;
      targetsSkipped: number;
      errors: number;
      url: string | null;
    }>('ncsc-run');
  }
  const url = getNcscScrapeNowUrl();
  const user = getFirebaseAuth()?.currentUser;

  if (!user) {
    throw new Error('Kirjaudu ylläpitäjänä ennen Kyberturvallisuuskeskuksen ajon käynnistämistä.');
  }
  if (!url) {
    throw new Error('Cloud Function -osoitetta ei voitu muodostaa.');
  }

  const idToken = await user.getIdToken();
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch {
    throw new Error('Kyberturvallisuuskeskuksen ajon kutsu ei tavoittanut Cloud Functionia. Varmista, että funktiot on deployattu Firebaseen ja CORS on käytössä.');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Kyberturvallisuuskeskuksen ajon Cloud Functionia ei löydy. Deployaa ncscScrapeNow Firebaseen.');
    }

    if (response.status === 401) {
      throw new Error('Kirjautuminen ei kelpaa Kyberturvallisuuskeskuksen ajon käynnistämiseen. Kirjaudu uudelleen ylläpitäjänä.');
    }

    if (response.status === 403) {
      throw new Error('Käyttäjällä ei ole oikeutta käynnistää Kyberturvallisuuskeskuksen ajoa.');
    }

    throw new Error(`Kyberturvallisuuskeskuksen ajon käynnistys epäonnistui (${response.status}).`);
  }

  return response.json() as Promise<{ alertsCreated: number; url: string | null }>;
};
