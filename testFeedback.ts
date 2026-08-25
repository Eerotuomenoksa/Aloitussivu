import { adminPollIntervalMs, getDataProvider, subscribeWithPolling } from './services/data';
export {
  markTestFeedbackAnswered,
  postponeTestFeedbackPrompt,
  shouldShowTestFeedbackPrompt,
} from './testFeedbackPromptState';
import { markTestFeedbackAnswered } from './testFeedbackPromptState';

export const TEST_FEEDBACK_FORM_VERSION = '2026-08-release-candidate';
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
  headerClarity: string;
  firstImpression: string;
  pageFeelings: string[];
  foundServices: string;
  searchedFor: string;
  missingService: string;
  categoryClarity: string;
  unclearCategory: string;
  municipalityCorrect: string;
  localServicesUseful: string;
  seniorPageStatus: string;
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
  headerClarity: draft.headerClarity,
  firstImpression: trimText(draft.firstImpression, 1200),
  pageFeelings: [...new Set(draft.pageFeelings)].slice(0, 8),
  foundServices: draft.foundServices,
  searchedFor: trimText(draft.searchedFor, 900),
  missingService: trimText(draft.missingService, 900),
  categoryClarity: draft.categoryClarity,
  unclearCategory: trimText(draft.unclearCategory, 900),
  municipalityCorrect: draft.municipalityCorrect,
  localServicesUseful: draft.localServicesUseful,
  seniorPageStatus: draft.seniorPageStatus,
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
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(TEST_FEEDBACK_STORAGE_KEY, JSON.stringify(responses));
    return true;
  } catch {
    return false;
  }
};

const emitTestFeedbackChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(TEST_FEEDBACK_CHANGE_EVENT));
  }
};

const saveLocalResponse = (response: TestFeedbackResponse) => {
  const saved = writeLocalResponses([response, ...readLocalResponses()].slice(0, 1000));
  if (!saved) {
    throw new Error('Vastausta ei voitu tallentaa selaimeen.');
  }
  emitTestFeedbackChange();
};

const removeLocalResponses = (ids: string[]) => {
  if (ids.length === 0) return;
  writeLocalResponses(readLocalResponses().filter((response) => !ids.includes(response.id)));
  emitTestFeedbackChange();
};

const uploadResponse = async (response: TestFeedbackResponse) => {
  const provider = await getDataProvider();
  await provider.submitPublic('test-feedback', { ...response, website: '' });
  return provider.kind;
};

export const submitTestFeedback = async (draft: TestFeedbackDraft): Promise<TestFeedbackSubmitResult> => {
  const now = new Date().toISOString();
  const response: TestFeedbackResponse = {
    id: crypto.randomUUID(),
    formVersion: TEST_FEEDBACK_FORM_VERSION,
    createdAt: now,
    ...normalizeDraft(draft),
  };

  try {
    const providerKind = await uploadResponse(response);
    markTestFeedbackAnswered();
    emitTestFeedbackChange();
    return { response, storage: providerKind === 'local' ? 'local' : 'cloud' };
  } catch {
    saveLocalResponse(response);
    markTestFeedbackAnswered();
    return { response, storage: 'local' };
  }
};

export const syncLocalTestFeedbackResponses = async () => {
  const localResponses = readLocalResponses();
  const provider = await getDataProvider();
  if (provider.kind === 'local') {
    return { total: localResponses.length, synced: 0, remaining: localResponses.length };
  }
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
  type AdminTestFeedbackItem = {
    id: string;
    formVersion: string;
    createdAt: string;
    response?: TestFeedbackDraft;
  };
  const normalize = (items: Array<TestFeedbackResponse | AdminTestFeedbackItem>) => items.map((item) => (
    'response' in item && item.response
      ? { ...item.response, id: item.id, formVersion: item.formVersion, createdAt: item.createdAt }
      : item as TestFeedbackResponse
  ));
  const handleChange = () => callback(readLocalResponses());
  window.addEventListener('storage', handleChange);
  window.addEventListener(TEST_FEEDBACK_CHANGE_EVENT, handleChange);
  const stopPolling = subscribeWithPolling(
    async () => normalize(await (await getDataProvider()).listAdmin<Array<TestFeedbackResponse | AdminTestFeedbackItem>>('test-feedback')),
    callback,
    (error) => {
      callback(readLocalResponses());
      onError?.(error);
    },
    adminPollIntervalMs,
  );
  return () => {
    stopPolling();
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(TEST_FEEDBACK_CHANGE_EVENT, handleChange);
  };
};
