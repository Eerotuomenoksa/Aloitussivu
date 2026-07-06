import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebaseClient';
export {
  markTestFeedbackAnswered,
  postponeTestFeedbackPrompt,
  shouldShowTestFeedbackPrompt,
} from './testFeedbackPromptState';
import { markTestFeedbackAnswered } from './testFeedbackPromptState';

export const TEST_FEEDBACK_FORM_VERSION = '2026-06';
const TEST_FEEDBACK_COLLECTION = 'testFeedbackResponses';
const TEST_FEEDBACK_STORAGE_KEY = 'testFeedbackResponses';
const TEST_FEEDBACK_CHANGE_EVENT = 'testfeedbackresponseschange';

export type TestDeviceType = 'phone' | 'tablet' | 'computer';
export type TestFeatureKey =
  | 'weather'
  | 'assistant'
  | 'internetSearch'
  | 'scamAlerts'
  | 'nearby'
  | 'favorites'
  | 'categorySearch'
  | 'namedays'
  | 'localNews';

export type TestFeatureRatings = Partial<Record<TestFeatureKey, number>>;

export interface TestFeedbackDraft {
  deviceTypes: TestDeviceType[];
  useMode: string;
  webExperience: string;
  purposeClear: string;
  firstImpression: string;
  pageFeelings: string[];
  foundServices: string;
  searchedFor: string;
  missingService: string;
  categoryClarity: string;
  unclearCategory: string;
  municipalityCorrect: string;
  localServicesUseful: string;
  missingLocalLink: string;
  localNewsUseful: string;
  featureRatings: TestFeatureRatings;
  missingFeature: string;
  textSize: string;
  contrastClarity: string;
  mobileEase: string;
  difficultPart: string;
  tourViewed: string;
  tourHelpful: string;
  tourFeedback: string;
  usefulnessRating: number;
  easeRating: number;
  recommend: string;
  mostImportantFix: string;
  bestThing: string;
}

export interface TestFeedbackResponse extends TestFeedbackDraft {
  id: string;
  formVersion: string;
  createdAt: string;
}

export type TestFeedbackSubmitResult = {
  response: TestFeedbackResponse;
  storage: 'cloud' | 'local';
};

const trimText = (value: string, maxLength: number) => value.trim().slice(0, maxLength);

const normalizeDraft = (draft: TestFeedbackDraft): TestFeedbackDraft => ({
  deviceTypes: [...new Set(draft.deviceTypes)].filter((value): value is TestDeviceType => (
    value === 'phone' || value === 'tablet' || value === 'computer'
  )),
  useMode: draft.useMode,
  webExperience: draft.webExperience,
  purposeClear: draft.purposeClear,
  firstImpression: trimText(draft.firstImpression, 1200),
  pageFeelings: [...new Set(draft.pageFeelings)].slice(0, 8),
  foundServices: draft.foundServices,
  searchedFor: trimText(draft.searchedFor, 900),
  missingService: trimText(draft.missingService, 900),
  categoryClarity: draft.categoryClarity,
  unclearCategory: trimText(draft.unclearCategory, 900),
  municipalityCorrect: draft.municipalityCorrect,
  localServicesUseful: draft.localServicesUseful,
  missingLocalLink: trimText(draft.missingLocalLink, 900),
  localNewsUseful: draft.localNewsUseful,
  featureRatings: Object.fromEntries(
    Object.entries(draft.featureRatings).filter(([, value]) => (
      Number.isInteger(value) && value >= 1 && value <= 5
    ))
  ) as TestFeatureRatings,
  missingFeature: trimText(draft.missingFeature, 900),
  textSize: draft.textSize,
  contrastClarity: draft.contrastClarity,
  mobileEase: draft.mobileEase,
  difficultPart: trimText(draft.difficultPart, 1200),
  tourViewed: draft.tourViewed,
  tourHelpful: draft.tourHelpful,
  tourFeedback: trimText(draft.tourFeedback, 900),
  usefulnessRating: Number.isInteger(draft.usefulnessRating) ? draft.usefulnessRating : 0,
  easeRating: Number.isInteger(draft.easeRating) ? draft.easeRating : 0,
  recommend: draft.recommend,
  mostImportantFix: trimText(draft.mostImportantFix, 1200),
  bestThing: trimText(draft.bestThing, 900),
});

const readLocalResponses = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(TEST_FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as TestFeedbackResponse[] : [];
  } catch {
    return [];
  }
};

const writeLocalResponses = (responses: TestFeedbackResponse[]) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(TEST_FEEDBACK_STORAGE_KEY, JSON.stringify(responses));
  } catch {
    // Local fallback is best-effort only.
  }
};

const emitTestFeedbackChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(TEST_FEEDBACK_CHANGE_EVENT));
  }
};

const saveLocalResponse = (response: TestFeedbackResponse) => {
  writeLocalResponses([response, ...readLocalResponses()].slice(0, 1000));
  emitTestFeedbackChange();
};

const removeLocalResponses = (ids: string[]) => {
  if (ids.length === 0) return;
  writeLocalResponses(readLocalResponses().filter((response) => !ids.includes(response.id)));
  emitTestFeedbackChange();
};

const uploadResponse = async (response: TestFeedbackResponse) => {
  if (!isFirebaseConfigured) throw new Error('Firebase ei ole määritetty.');
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore-yhteyttä ei voitu avata.');
  await setDoc(doc(db, TEST_FEEDBACK_COLLECTION, response.id), response);
};

export const submitTestFeedback = async (draft: TestFeedbackDraft): Promise<TestFeedbackSubmitResult> => {
  const now = new Date().toISOString();
  const response: TestFeedbackResponse = {
    id: crypto.randomUUID(),
    formVersion: TEST_FEEDBACK_FORM_VERSION,
    createdAt: now,
    ...normalizeDraft(draft),
  };

  if (isFirebaseConfigured) {
    try {
      await uploadResponse(response);
      markTestFeedbackAnswered();
      emitTestFeedbackChange();
      return { response, storage: 'cloud' };
    } catch {
      markTestFeedbackAnswered();
      saveLocalResponse(response);
      return { response, storage: 'local' };
    }
  }

  markTestFeedbackAnswered();
  saveLocalResponse(response);
  return { response, storage: 'local' };
};

export const syncLocalTestFeedbackResponses = async () => {
  const localResponses = readLocalResponses();
  const syncedIds: string[] = [];

  for (const response of localResponses) {
    try {
      await uploadResponse(response);
      syncedIds.push(response.id);
    } catch {
      break;
    }
  }

  removeLocalResponses(syncedIds);
  return {
    total: localResponses.length,
    synced: syncedIds.length,
    remaining: localResponses.length - syncedIds.length,
  };
};

export const subscribeTestFeedbackResponses = (
  callback: (responses: TestFeedbackResponse[]) => void,
  onError?: (error: unknown) => void
) => {
  if (!isFirebaseConfigured) {
    const handleChange = () => callback(readLocalResponses());
    callback(readLocalResponses());
    window.addEventListener('storage', handleChange);
    window.addEventListener(TEST_FEEDBACK_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(TEST_FEEDBACK_CHANGE_EVENT, handleChange);
    };
  }

  const db = getFirebaseDb();
  if (!db) {
    callback(readLocalResponses());
    return () => {};
  }

  return onSnapshot(
    query(collection(db, TEST_FEEDBACK_COLLECTION), orderBy('createdAt', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as TestFeedbackResponse[]);
    },
    (error) => {
      callback(readLocalResponses());
      onError?.(error);
    }
  );
};
