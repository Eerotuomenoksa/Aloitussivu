import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';

const FEEDBACK_COLLECTION = 'feedbackItems';
const FEEDBACK_ATTACHMENT_COLLECTION = 'feedbackAttachments';
const FEEDBACK_STORAGE_KEY = 'feedbackItems';
const FEEDBACK_ATTACHMENT_STORAGE_KEY = 'feedbackAttachments';
const FEEDBACK_CHANGE_EVENT = 'feedbackitemschange';

export type FeedbackType = 'bug' | 'content' | 'link' | 'accessibility' | 'idea' | 'other';
export type FeedbackStatus = 'new' | 'triage' | 'planned' | 'in_progress' | 'done' | 'rejected';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  page: string;
  status: FeedbackStatus;
  publicNote: string;
  createdAt: string;
  updatedAt: string;
  handledAt?: string;
  handledBy?: string;
  client?: FeedbackClientInfo;
  hasScreenshot?: boolean;
}

export interface FeedbackDraft {
  type: FeedbackType;
  title: string;
  description: string;
  page: string;
  client?: FeedbackClientInfo;
  screenshot?: FeedbackScreenshotDraft | null;
}

export interface FeedbackClientInfo {
  browserName: string;
  browserVersion?: string;
  osName: string;
  deviceType: 'desktop' | 'tablet' | 'mobile' | 'unknown';
  userAgent: string;
  platform: string;
  language: string;
  viewport: string;
  screen: string;
  timezone: string;
  touch: boolean;
}

export interface FeedbackScreenshotDraft {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface FeedbackAttachment {
  id: string;
  feedbackId: string;
  screenshot?: FeedbackScreenshotDraft;
  createdAt: string;
}

export type FeedbackSubmitResult = {
  item: FeedbackItem;
  storage: 'cloud' | 'local';
};

const readLocalFeedback = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as FeedbackItem[] : [];
  } catch {
    return [];
  }
};

const writeLocalFeedback = (items: FeedbackItem[]) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors.
  }
};

const saveLocalFeedback = (item: FeedbackItem) => {
  writeLocalFeedback([item, ...readLocalFeedback()].slice(0, 1000));
  emitFeedbackChange();
};

const readLocalAttachments = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(FEEDBACK_ATTACHMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as FeedbackAttachment[] : [];
  } catch {
    return [];
  }
};

const saveLocalAttachment = (attachment: FeedbackAttachment) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      FEEDBACK_ATTACHMENT_STORAGE_KEY,
      JSON.stringify([attachment, ...readLocalAttachments()].slice(0, 100))
    );
  } catch {
    // Ignore storage errors.
  }
};

const emitFeedbackChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FEEDBACK_CHANGE_EVENT));
  }
};

export const submitFeedback = async (draft: FeedbackDraft): Promise<FeedbackSubmitResult> => {
  const now = new Date().toISOString();
  const item: FeedbackItem = {
    id: crypto.randomUUID(),
    type: draft.type,
    title: draft.title.trim(),
    description: draft.description.trim(),
    page: draft.page.trim(),
    status: 'new',
    publicNote: '',
    createdAt: now,
    updatedAt: now,
    ...(draft.client ? { client: draft.client } : {}),
    ...(draft.screenshot ? { hasScreenshot: true } : {}),
  };
  const attachment: FeedbackAttachment | null = draft.screenshot ? {
    id: item.id,
    feedbackId: item.id,
    screenshot: draft.screenshot,
    createdAt: now,
  } : null;

  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, FEEDBACK_COLLECTION, item.id), item);
        if (attachment) {
          await setDoc(doc(db, FEEDBACK_ATTACHMENT_COLLECTION, item.id), attachment);
        }
        emitFeedbackChange();
        return { item, storage: 'cloud' };
      } catch (error) {
        saveLocalFeedback(item);
        if (attachment) saveLocalAttachment(attachment);
        return { item, storage: 'local' };
      }
    }
  }

  saveLocalFeedback(item);
  if (attachment) saveLocalAttachment(attachment);
  return { item, storage: 'local' };
};

export const getFeedbackAttachment = async (feedbackId: string): Promise<FeedbackAttachment | null> => {
  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      const snapshot = await getDoc(doc(db, FEEDBACK_ATTACHMENT_COLLECTION, feedbackId));
      return snapshot.exists() ? snapshot.data() as FeedbackAttachment : null;
    }
  }

  return readLocalAttachments().find((attachment) => attachment.feedbackId === feedbackId) ?? null;
};

export const subscribeFeedbackItems = (callback: (items: FeedbackItem[]) => void) => {
  if (!isFirebaseConfigured) {
    const handleChange = () => callback(readLocalFeedback());
    callback(readLocalFeedback());
    window.addEventListener('storage', handleChange);
    window.addEventListener(FEEDBACK_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(FEEDBACK_CHANGE_EVENT, handleChange);
    };
  }

  const db = getFirebaseDb();
  if (!db) {
    callback(readLocalFeedback());
    return () => {};
  }

  return onSnapshot(
    query(collection(db, FEEDBACK_COLLECTION), orderBy('createdAt', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as FeedbackItem[]);
    },
    () => callback(readLocalFeedback())
  );
};

export const updateFeedbackItem = async (
  id: string,
  status: FeedbackStatus,
  publicNote: string,
  handledBy?: string | null
) => {
  const now = new Date().toISOString();
  const patch = {
    status,
    publicNote: publicNote.trim(),
    updatedAt: now,
    ...(status === 'done' || status === 'rejected' ? { handledAt: now } : {}),
    ...(handledBy ? { handledBy } : {}),
  };

  const updateLocalFeedback = () => {
    writeLocalFeedback(readLocalFeedback().map((item) => (
      item.id === id ? { ...item, ...patch } : item
    )));
    emitFeedbackChange();
  };

  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      try {
        await updateDoc(doc(db, FEEDBACK_COLLECTION, id), patch);
        emitFeedbackChange();
        return;
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        updateLocalFeedback();
        return;
      }
    }
  }

  updateLocalFeedback();
};
