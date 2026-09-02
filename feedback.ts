import { adminPollIntervalMs, getDataProvider, subscribeWithPolling } from './services/data';

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

const removeLocalFeedback = (ids: string[]) => {
  if (ids.length === 0) return;
  writeLocalFeedback(readLocalFeedback().filter((item) => !ids.includes(item.id)));
  try {
    localStorage.setItem(
      FEEDBACK_ATTACHMENT_STORAGE_KEY,
      JSON.stringify(readLocalAttachments().filter((attachment) => !ids.includes(attachment.feedbackId))),
    );
  } catch {
    // Säilytä liite, jos selaintallennuksen siivous epäonnistuu.
  }
  emitFeedbackChange();
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

  try {
    const provider = await getDataProvider();
    await provider.submitPublic('feedback', {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      page: item.page,
      ...(item.client ? { client: item.client } : {}),
      ...(draft.screenshot ? { screenshot: draft.screenshot } : {}),
      website: '',
    });
    emitFeedbackChange();
    return { item, storage: provider.kind === 'local' ? 'local' : 'cloud' };
  } catch {
    saveLocalFeedback(item);
    if (attachment) saveLocalAttachment(attachment);
    return { item, storage: 'local' };
  }
};

export const syncLocalFeedbackItems = async () => {
  const localItems = readLocalFeedback();
  const provider = await getDataProvider();
  if (provider.kind === 'local') {
    return { total: localItems.length, synced: 0, remaining: localItems.length };
  }

  const attachments = readLocalAttachments();
  const syncedIds: string[] = [];
  for (const item of [...localItems].reverse()) {
    const screenshot = attachments.find((attachment) => attachment.feedbackId === item.id)?.screenshot;
    try {
      await provider.submitPublic('feedback', {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        page: item.page,
        ...(item.client ? { client: item.client } : {}),
        ...(screenshot ? { screenshot } : {}),
        website: '',
      });
      syncedIds.push(item.id);
    } catch {
      break;
    }
  }
  removeLocalFeedback(syncedIds);
  return {
    total: localItems.length,
    synced: syncedIds.length,
    remaining: localItems.length - syncedIds.length,
  };
};

export const getFeedbackAttachment = async (feedbackId: string): Promise<FeedbackAttachment | null> => {
  const provider = await getDataProvider();
  const remote = await provider.getFeedbackAttachment(feedbackId);
  if (remote) {
    return {
      id: feedbackId,
      feedbackId,
      screenshot: remote,
      createdAt: '',
    };
  }

  return readLocalAttachments().find((attachment) => attachment.feedbackId === feedbackId) ?? null;
};

export const subscribeFeedbackItems = (
  callback: (items: FeedbackItem[]) => void,
  onError?: (error: unknown) => void,
) => {
  const handleChange = () => callback(readLocalFeedback());
  window.addEventListener('storage', handleChange);
  window.addEventListener(FEEDBACK_CHANGE_EVENT, handleChange);
  const stopPolling = subscribeWithPolling(
    async () => (await getDataProvider()).listAdmin<FeedbackItem[]>('feedback'),
    callback,
    (error) => {
      callback(readLocalFeedback());
      onError?.(error);
    },
    adminPollIntervalMs,
  );
  return () => {
    stopPolling();
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(FEEDBACK_CHANGE_EVENT, handleChange);
  };
};

export const subscribePublicFeedbackItems = (
  callback: (items: FeedbackItem[]) => void,
  onError?: (error: unknown) => void,
) => {
  const handleChange = () => callback(readLocalFeedback());
  window.addEventListener('storage', handleChange);
  window.addEventListener(FEEDBACK_CHANGE_EVENT, handleChange);
  const stopPolling = subscribeWithPolling(
    async () => (await getDataProvider()).listPublic<FeedbackItem>('feedback', { fresh: true }),
    callback,
    (error) => {
      callback(readLocalFeedback());
      onError?.(error);
    },
    adminPollIntervalMs,
  );
  return () => {
    stopPolling();
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(FEEDBACK_CHANGE_EVENT, handleChange);
  };
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

  const provider = await getDataProvider();
  await provider.updateAdmin('feedback', id, {
    status,
    publicNote: publicNote.trim(),
  });
  updateLocalFeedback();
};
