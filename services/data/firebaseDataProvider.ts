import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getFirebaseAppCheckToken,
  getFirebaseAuth,
  getFirebaseDb,
  getUserEmail,
  isAdminUser,
} from '../../firebaseClient';
import type {
  AdminAttachment,
  AdminListResource,
  AdminMutableResource,
  DataProvider,
  PublicListResource,
  PublicWriteResource,
} from './dataProvider';
import { DataProviderError } from './dataProvider';

const collectionNames = {
  'approved-links': 'approvedLinks',
  'blocked-links': 'blockedLinks',
  'scam-alerts': 'scamAlerts',
  'link-reports': 'linkReports',
  feedback: 'feedbackItems',
  'test-feedback': 'testFeedbackResponses',
  'ncsc-logs': 'ncscScrapeLog',
  'link-checks': 'linkChecks',
  'usage-stats': 'usageStats',
} as const;

const orderFields: Partial<Record<keyof typeof collectionNames, string>> = {
  'approved-links': 'createdAt',
  'blocked-links': 'createdAt',
  'scam-alerts': 'createdAt',
  'link-reports': 'createdAt',
  feedback: 'createdAt',
  'test-feedback': 'createdAt',
  'ncsc-logs': 'processedAt',
};

const requireDb = async () => {
  const db = await getFirebaseDb();
  if (!db) throw new DataProviderError('Firestore-yhteyttä ei voitu avata.', 'firebase_unavailable');
  return db;
};

const listCollection = async <T>(resource: keyof typeof collectionNames): Promise<T[]> => {
  const db = await requireDb();
  const reference = collection(db, collectionNames[resource]);
  const snapshot = await getDocs(orderFields[resource]
    ? query(reference, orderBy(orderFields[resource]!, 'desc'))
    : reference);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as T[];
};

const firebaseUsageUrl = () => {
  const explicit = import.meta.env.VITE_USAGE_TRACK_URL?.trim();
  if (explicit) return explicit;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  return projectId ? `https://europe-west1-${projectId}.cloudfunctions.net/trackUsage` : '';
};

const submitUsage = async (payload: Record<string, unknown>) => {
  const url = firebaseUsageUrl();
  if (!url) throw new DataProviderError('Käyttötilastopalvelua ei ole määritetty.', 'firebase_unavailable');
  const appCheckToken = await getFirebaseAppCheckToken();
  if (!appCheckToken) throw new DataProviderError('App Check -tunnistetta ei saatu.', 'app_check_unavailable');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Firebase-AppCheck': appCheckToken,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });
  if (!response.ok) {
    throw new DataProviderError(`Käyttötilaston tallennus epäonnistui (${response.status}).`, 'request_failed', response.status);
  }
};

const firebaseStoredPayload = (resource: Exclude<PublicWriteResource, 'usage-events'>, payload: Record<string, unknown>) => {
  const { screenshot, website: _website, ...cleanPayload } = payload;
  const createdAt = typeof cleanPayload.createdAt === 'string' ? cleanPayload.createdAt : new Date().toISOString();
  if (resource === 'feedback') {
    return {
      ...cleanPayload,
      createdAt,
      status: 'new',
      publicNote: '',
      updatedAt: createdAt,
      hasScreenshot: Boolean(screenshot),
    };
  }
  if (resource === 'link-reports') {
    return { ...cleanPayload, createdAt, status: 'pending', updatedAt: createdAt };
  }
  return { ...cleanPayload, createdAt };
};

export const firebaseDataProvider: DataProvider = {
  kind: 'firebase-rollback',

  async listPublic<T>(resource: PublicListResource) {
    const items = await listCollection<T>(resource);
    if (resource !== 'scam-alerts') return items;
    const now = Date.now();
    return items.filter((item) => {
      const alert = item as { active?: unknown; expiresAt?: unknown };
      const expiry = typeof alert.expiresAt === 'string' ? new Date(alert.expiresAt).getTime() : 0;
      return alert.active === true && expiry > now;
    });
  },

  async submitPublic(resource: PublicWriteResource, payload: Record<string, unknown>) {
    if (resource === 'usage-events') {
      await submitUsage(payload);
      return {};
    }
    const id = typeof payload.id === 'string' ? payload.id : crypto.randomUUID();
    const db = await requireDb();
    const collectionName = collectionNames[resource];
    const storedPayload = firebaseStoredPayload(resource, payload);
    await setDoc(doc(db, collectionName, id), storedPayload);

    if (resource === 'feedback' && payload.screenshot && typeof payload.screenshot === 'object') {
      await setDoc(doc(db, 'feedbackAttachments', id), {
        id,
        feedbackId: id,
        screenshot: payload.screenshot,
        createdAt: storedPayload.createdAt,
      });
    }
    return { id, createdAt: storedPayload.createdAt };
  },

  async getAdminSession() {
    const user = getFirebaseAuth()?.currentUser ?? null;
    if (!user) throw new DataProviderError('Kirjaudu ylläpitäjänä.', 'authentication_required', 401);
    if (!isAdminUser(user)) throw new DataProviderError('Tunnuksella ei ole ylläpito-oikeutta.', 'admin_forbidden', 403);
    return { uid: user.uid, email: getUserEmail(user), role: 'admin' };
  },

  async listAdmin<T>(resource: AdminListResource) {
    return listCollection<T>(resource) as Promise<T>;
  },

  async createAdmin(resource: AdminMutableResource, payload: Record<string, unknown>) {
    const id = typeof payload.id === 'string' ? payload.id : crypto.randomUUID();
    await setDoc(doc(await requireDb(), collectionNames[resource], id), {
      ...payload,
      id,
      createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id };
  },

  async updateAdmin(resource: AdminMutableResource, id: string, payload: Record<string, unknown>) {
    const updatedAt = new Date().toISOString();
    await updateDoc(doc(await requireDb(), collectionNames[resource], id), { ...payload, updatedAt });
    return { id, updatedAt };
  },

  async deleteAdmin(resource: 'approved-links' | 'blocked-links', id: string) {
    await deleteDoc(doc(await requireDb(), collectionNames[resource], id));
  },

  async runAdminAction<T>() {
    throw new DataProviderError('Ylläpidon käsiajoa ei tueta Firebase-palautusproviderissa.', 'unsupported_operation');
  },

  async actOnLinkCheck(_urlHash, _action, _reason, _replacementUrl) {
    throw new DataProviderError('Linkkitarkistuksen huomioita ei käsitellä Firebase-palautusproviderissa.', 'unsupported_operation');
  },

  async getFeedbackAttachment(feedbackId: string): Promise<AdminAttachment | null> {
    const snapshot = await getDoc(doc(await requireDb(), 'feedbackAttachments', feedbackId));
    if (!snapshot.exists()) return null;
    const screenshot = snapshot.data().screenshot as Partial<AdminAttachment> | undefined;
    if (!screenshot || typeof screenshot.dataUrl !== 'string') return null;
    return {
      dataUrl: screenshot.dataUrl,
      name: typeof screenshot.name === 'string' ? screenshot.name : 'kuvakaappaus',
      type: typeof screenshot.type === 'string' ? screenshot.type : '',
      size: typeof screenshot.size === 'number' ? screenshot.size : 0,
    };
  },
};

export const selectedDataProvider = firebaseDataProvider;
