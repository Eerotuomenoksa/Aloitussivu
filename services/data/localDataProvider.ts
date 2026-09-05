import type {
  AdminAttachment,
  AdminListResource,
  AdminMutableResource,
  DataProvider,
  PublicListResource,
  PublicWriteResource,
} from './dataProvider';
import { DataProviderError } from './dataProvider';

const storageKeys = {
  'approved-links': 'approvedLinkSuggestions',
  'blocked-links': 'blockedLinkUrls',
  'scam-alerts': 'scamAlerts',
  'link-reports': 'linkReports',
  feedback: 'feedbackItems',
  'test-feedback': 'testFeedbackResponses',
  'ncsc-logs': 'ncscScrapeLog',
  'link-checks': 'linkChecks',
  'usage-stats': 'usageStats',
  'site-content': 'siteContent',
} as const;

const readArray = <T>(key: string): T[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
};

const writeArray = (key: string, value: unknown[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new DataProviderError('Tietoa ei voitu tallentaa selaimeen.', 'local_storage_failed');
  }
};

const resourceKey = (resource: keyof typeof storageKeys) => storageKeys[resource];

const upsert = (resource: keyof typeof storageKeys, payload: Record<string, unknown>) => {
  const id = typeof payload.id === 'string' ? payload.id : crypto.randomUUID();
  const key = resourceKey(resource);
  const current = readArray<Record<string, unknown>>(key);
  writeArray(key, [{ ...payload, id }, ...current.filter((item) => item.id !== id)].slice(0, 1000));
  return id;
};

export const localDataProvider: DataProvider = {
  kind: 'local',

  async listPublic<T>(resource: PublicListResource) {
    if (resource === 'blocked-links') {
      return readArray<unknown>(resourceKey(resource)).map((item, index) => {
        if (typeof item === 'string') {
          return { id: `local-${index}`, url: item, createdAt: '' };
        }
        return item;
      }).filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object')) as T[];
    }
    return readArray<T>(resourceKey(resource));
  },

  async submitPublic(resource: PublicWriteResource, payload: Record<string, unknown>) {
    if (resource === 'usage-events') return {};
    const createdAt = typeof payload.createdAt === 'string' ? payload.createdAt : new Date().toISOString();
    const stored = resource === 'feedback'
      ? { ...payload, createdAt, status: 'new', publicNote: '', updatedAt: createdAt }
      : resource === 'link-reports'
        ? { ...payload, createdAt, status: 'pending', updatedAt: createdAt }
        : { ...payload, createdAt };
    const id = upsert(resource, stored);
    if (resource === 'feedback' && payload.screenshot) {
      const attachments = readArray<Record<string, unknown>>('feedbackAttachments');
      writeArray('feedbackAttachments', [{
        id,
        feedbackId: id,
        screenshot: payload.screenshot,
        createdAt,
      }, ...attachments.filter((item) => item.feedbackId !== id)].slice(0, 100));
    }
    return { id, createdAt };
  },

  async getAdminSession() {
    throw new DataProviderError('Paikallinen provider ei myönnä ylläpito-oikeuksia.', 'authentication_required', 401);
  },

  async listAdmin<T>(resource: AdminListResource) {
    return readArray<unknown>(resourceKey(resource)) as T;
  },

  async createAdmin(resource: AdminMutableResource, payload: Record<string, unknown>) {
    return { id: upsert(resource, payload) };
  },

  async updateAdmin(resource: AdminMutableResource, id: string, payload: Record<string, unknown>) {
    const key = resourceKey(resource);
    const current = readArray<Record<string, unknown>>(key);
    const updatedAt = new Date().toISOString();
    const nextItem = { ...payload, id, ...(resource === 'site-content' ? { key: id } : {}), updatedAt };
    const exists = current.some((item) => item.id === id && (resource !== 'site-content' || item.locale === payload.locale));
    writeArray(key, exists
      ? current.map((item) => item.id === id && (resource !== 'site-content' || item.locale === payload.locale) ? { ...item, ...nextItem } : item)
      : [nextItem, ...current]);
    return { id, updatedAt };
  },

  async deleteAdmin(resource: 'approved-links' | 'blocked-links', id: string) {
    const key = resourceKey(resource);
    writeArray(key, readArray<Record<string, unknown>>(key).filter((item) => item.id !== id));
  },

  async runAdminAction<T>() {
    throw new DataProviderError('Ylläpidon käsiajoa ei tueta paikallisproviderissa.', 'unsupported_operation');
  },

  async actOnLinkCheck(_urlHash, _action, _reason, _replacementUrl, _replacementName) {
    throw new DataProviderError('Linkkitarkistuksen huomioita ei käsitellä paikallisproviderissa.', 'unsupported_operation');
  },

  async getFeedbackAttachment(feedbackId: string): Promise<AdminAttachment | null> {
    const attachment = readArray<{ feedbackId?: string; screenshot?: Partial<AdminAttachment> }>('feedbackAttachments')
      .find((item) => item.feedbackId === feedbackId)?.screenshot;
    if (!attachment || typeof attachment.dataUrl !== 'string') return null;
    return {
      dataUrl: attachment.dataUrl,
      name: typeof attachment.name === 'string' ? attachment.name : 'kuvakaappaus',
      type: typeof attachment.type === 'string' ? attachment.type : '',
      size: typeof attachment.size === 'number' ? attachment.size : 0,
    };
  },
};

export const selectedDataProvider = localDataProvider;
