import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';

const FEEDBACK_COLLECTION = 'feedbackItems';
const FEEDBACK_STORAGE_KEY = 'feedbackItems';
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
}

export interface FeedbackDraft {
  type: FeedbackType;
  title: string;
  description: string;
  page: string;
}

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

const emitFeedbackChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FEEDBACK_CHANGE_EVENT));
  }
};

export const submitFeedback = async (draft: FeedbackDraft) => {
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
  };

  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, FEEDBACK_COLLECTION, item.id), item);
        emitFeedbackChange();
        return item;
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        saveLocalFeedback(item);
        return item;
      }
    }
  }

  saveLocalFeedback(item);
  return item;
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
