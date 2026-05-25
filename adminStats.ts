import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';

export type NameDayApiUsageStats = {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsedAt: string;
};

const ADMIN_STATS_COLLECTION = 'adminStats';
const NAMEDAY_API_STATS_DOCUMENT = 'namedayApi';

const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

export const subscribeNameDayApiUsageStats = (
  callback: (stats: NameDayApiUsageStats | null) => void,
  onError?: (message: string) => void
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
        lastUsedAt: typeof data.lastUsedAt === 'string' ? data.lastUsedAt : '',
      });
    },
    (error) => {
      callback(null);
      onError?.(`Nimipäivärajapinnan käyttölaskurin lukeminen epäonnistui: ${error.message}`);
    }
  );
};
