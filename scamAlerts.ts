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

const SCAM_ALERTS_COLLECTION = 'scamAlerts';
const NCSC_SCRAPE_LOG_COLLECTION = 'ncscScrapeLog';
const REMOTE_SYNC_DELAY_MS = 12000;

const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY?.trim()
  && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
  && import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
);

const loadRemoteFirestore = async () => {
  if (!hasFirebaseConfig) return null;
  const [client, firestore] = await Promise.all([
    import('./firebaseClient'),
    import('firebase/firestore'),
  ]);
  if (!client.isFirebaseConfigured) return null;
  const db = client.getFirebaseDb();
  return db ? { client, db, firestore } : null;
};

const getScrapeLogReadErrorMessage = (error: { code?: string; message: string }) => (
  error.code === 'permission-denied'
    ? 'Ajolokin lukeminen epäonnistui: kirjaudu ylläpitäjän Google-tunnuksella, jolla on oikeus Firestore-sääntöihin.'
    : `Ajolokin lukeminen epäonnistui: ${error.message}`
);

export const subscribeScamAlerts = (callback: (alerts: ScamAlertEntry[]) => void) => {
  callback([]);
  let cancelled = false;
  let unsubscribeRemote: (() => void) | undefined;
  const timer = window.setTimeout(() => {
    void loadRemoteFirestore().then((remote) => {
      if (cancelled || !remote) return;
      const { db, firestore } = remote;
      unsubscribeRemote = firestore.onSnapshot(
        firestore.query(
          firestore.collection(db, SCAM_ALERTS_COLLECTION),
          firestore.orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
          callback(snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })) as ScamAlertEntry[]);
        },
        () => callback([])
      );
    });
  }, REMOTE_SYNC_DELAY_MS);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
    unsubscribeRemote?.();
  };
};

export const subscribeNcscScrapeLogs = (
  callback: (logs: NcscScrapeLogEntry[]) => void,
  onError?: (message: string, error?: { code?: string; message: string }) => void
) => {
  let unsubscribeRemote: (() => void) | undefined;
  let cancelled = false;
  void loadRemoteFirestore().then((remote) => {
    if (cancelled) return;
    if (!remote) {
      callback([]);
      onError?.('Firebase-asetukset puuttuvat, joten ajolokia ei voi lukea.');
      return;
    }

    const { db, firestore } = remote;
    unsubscribeRemote = firestore.onSnapshot(
      firestore.query(firestore.collection(db, NCSC_SCRAPE_LOG_COLLECTION), firestore.orderBy('processedAt', 'desc')),
      (snapshot) => {
        onError?.('');
        callback(snapshot.docs.slice(0, 10).map((document) => ({
          id: document.id,
          ...document.data(),
        })) as NcscScrapeLogEntry[]);
      },
      (error) => {
        callback([]);
        onError?.(getScrapeLogReadErrorMessage(error), error);
      }
    );
  });

  return () => {
    cancelled = true;
    unsubscribeRemote?.();
  };
};

export const updateScamAlertActiveState = async (id: string, active: boolean) => {
  const remote = await loadRemoteFirestore();
  if (!remote) return;
  await remote.firestore.updateDoc(remote.firestore.doc(remote.db, SCAM_ALERTS_COLLECTION, id), {
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
  const url = getNcscScrapeNowUrl();
  const remote = await loadRemoteFirestore();
  const user = remote?.client.getFirebaseAuth()?.currentUser;

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
