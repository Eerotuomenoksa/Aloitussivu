export type DataProviderKind = 'cloudcity' | 'firebase-rollback' | 'local';

export type PublicListResource = 'approved-links' | 'blocked-links' | 'scam-alerts';
export type PublicWriteResource = 'link-reports' | 'feedback' | 'test-feedback' | 'usage-events';
export type AdminListResource =
  | 'link-reports'
  | 'feedback'
  | 'test-feedback'
  | 'approved-links'
  | 'blocked-links'
  | 'scam-alerts'
  | 'ncsc-logs'
  | 'link-checks'
  | 'usage-stats';
export type AdminMutableResource =
  | 'link-reports'
  | 'feedback'
  | 'approved-links'
  | 'blocked-links'
  | 'scam-alerts';
export type AdminAction = 'ncsc-run';
export type LinkCheckAdminAction = 'approve' | 'block' | 'replace';

export type MutationReceipt = {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  duplicate?: boolean;
};

export type AdminSession = {
  uid: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
};

export type AdminAttachment = {
  dataUrl: string;
  name: string;
  type: string;
  size: number;
};

export interface DataProvider {
  readonly kind: DataProviderKind;
  listPublic<T>(resource: PublicListResource, options?: { fresh?: boolean }): Promise<T[]>;
  submitPublic(resource: PublicWriteResource, payload: Record<string, unknown>): Promise<MutationReceipt>;
  getAdminSession(): Promise<AdminSession>;
  listAdmin<T>(resource: AdminListResource): Promise<T>;
  createAdmin(resource: AdminMutableResource, payload: Record<string, unknown>): Promise<MutationReceipt>;
  updateAdmin(resource: AdminMutableResource, id: string, payload: Record<string, unknown>): Promise<MutationReceipt>;
  deleteAdmin(resource: 'approved-links' | 'blocked-links', id: string): Promise<void>;
  runAdminAction<T>(action: AdminAction): Promise<T>;
  actOnLinkCheck(urlHash: string, action: LinkCheckAdminAction, reason: string, replacementUrl?: string): Promise<MutationReceipt>;
  getFeedbackAttachment(feedbackId: string): Promise<AdminAttachment | null>;
}

export class DataProviderError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number = 0,
  ) {
    super(message);
    this.name = 'DataProviderError';
  }
}

export const isAdminAccessError = (error: unknown) => (
  error instanceof DataProviderError && (error.status === 401 || error.status === 403)
);

export const subscribeWithPolling = <T>(
  load: () => Promise<T>,
  callback: (value: T) => void,
  onError?: (error: unknown) => void,
  pollIntervalMs = 0,
  onLoadingChange?: (loading: boolean) => void,
) => {
  let active = true;
  let loading = false;

  const refresh = async () => {
    if (!active || loading) return;
    loading = true;
    onLoadingChange?.(true);
    try {
      const value = await load();
      if (active) callback(value);
    } catch (error) {
      if (active) onError?.(error);
    } finally {
      loading = false;
      if (active) onLoadingChange?.(false);
    }
  };

  void refresh();
  const timer = pollIntervalMs > 0
    ? window.setInterval(() => void refresh(), pollIntervalMs)
    : undefined;
  const handleOnline = () => void refresh();
  window.addEventListener('online', handleOnline);

  return () => {
    active = false;
    if (timer !== undefined) window.clearInterval(timer);
    window.removeEventListener('online', handleOnline);
  };
};
