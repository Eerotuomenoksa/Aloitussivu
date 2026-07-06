import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';

export type NameDayApiUsageStats = {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  monthlyRequests: Record<string, number>;
  monthlyLimit: number;
  lastUsedAt: string;
};

const ADMIN_STATS_COLLECTION = 'adminStats';
const NAMEDAY_API_STATS_DOCUMENT = 'namedayApi';

const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const toMonthlyRequests = (value: unknown) => {
  if (!value || typeof value !== 'object') return {};
  const entries: [string, number][] = Object.entries(value as Record<string, unknown>)
    .map(([month, count]) => [month, toNumber(count)]);
  return Object.fromEntries(
    entries.filter(([, count]) => count > 0)
  );
};
const getFirestoreReadErrorMessage = (error: { code?: string; message: string }) => (
  error.code === 'permission-denied'
    ? 'Nimipäivärajapinnan käyttölaskurin lukeminen epäonnistui: kirjaudu ylläpitäjän Google-tunnuksella, jolla on oikeus Firestore-sääntöihin.'
    : `Nimipäivärajapinnan käyttölaskurin lukeminen epäonnistui: ${error.message}`
);

export const subscribeNameDayApiUsageStats = (
  callback: (stats: NameDayApiUsageStats | null) => void,
  onError?: (message: string, error?: { code?: string; message: string }) => void
) => {
  if (!isFirebaseConfigured) {
    callback(null);
    onError?.('Firebase-asetukset puuttuvat, joten nimipäivärajapinnan käyttölaskuria ei voi lukea.');
    return () => {};
  }

  const db = getFirebaseDb();
  if (!db) {
    callback(null);
    onError?.('Firestore-yhteyttä ei voitu avata.');
    return () => {};
  }

  return onSnapshot(
    doc(db, ADMIN_STATS_COLLECTION, NAMEDAY_API_STATS_DOCUMENT),
    (snapshot) => {
      onError?.('');
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      callback({
        totalRequests: toNumber(data.totalRequests),
        successfulRequests: toNumber(data.successfulRequests),
        failedRequests: toNumber(data.failedRequests),
        monthlyRequests: toMonthlyRequests(data.monthlyRequests),
        monthlyLimit: toNumber(data.monthlyLimit),
        lastUsedAt: typeof data.lastUsedAt === 'string' ? data.lastUsedAt : '',
      });
    },
    (error) => {
      callback(null);
      onError?.(getFirestoreReadErrorMessage(error), error);
    }
  );
};
