import { getFirebaseAuth } from '../../firebaseClient';
import type {
  AdminAttachment,
  AdminListResource,
  AdminMutableResource,
  AdminSession,
  DataProvider,
  MutationReceipt,
  PublicListResource,
  PublicWriteResource,
} from './dataProvider';
import { DataProviderError } from './dataProvider';
import { adminTokenHeader, apiBase } from './providerConfig';

type ApiEnvelope<T> = {
  data: T;
  requestId?: string;
};

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
  };
};

const parseJson = async (response: Response) => {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.toLocaleLowerCase('en-US').includes('application/json')) return null;
  try {
    return await response.json() as unknown;
  } catch {
    return null;
  }
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      credentials: 'same-origin',
      ...init,
    });
  } catch {
    throw new DataProviderError('Palvelimeen ei saatu yhteyttä.', 'network_error');
  }

  if (response.status === 204) return undefined as T;
  const payload = await parseJson(response);
  if (!response.ok) {
    const errorPayload = payload as ApiErrorEnvelope | null;
    throw new DataProviderError(
      errorPayload?.error?.message || `Pyyntö epäonnistui (${response.status}).`,
      errorPayload?.error?.code || 'request_failed',
      response.status,
    );
  }
  return payload as T;
};

const adminHeaders = async (json = false, forceTokenRefresh = false) => {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) {
    throw new DataProviderError('Kirjaudu ylläpitäjänä.', 'authentication_required', 401);
  }
  const token = await user.getIdToken(forceTokenRefresh);
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    [adminTokenHeader]: `Bearer ${token}`,
  };
};

const body = (payload: Record<string, unknown>) => JSON.stringify(payload);

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
  reader.onerror = () => reject(reader.error ?? new Error('Liitettä ei voitu lukea.'));
  reader.readAsDataURL(blob);
});

const attachmentName = (response: Response) => {
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (!encoded) return 'kuvakaappaus';
  try {
    return decodeURIComponent(encoded);
  } catch {
    return 'kuvakaappaus';
  }
};

export const cloudcityApiDataProvider: DataProvider = {
  kind: 'cloudcity',

  async listPublic<T>(resource: PublicListResource, options?: { fresh?: boolean }) {
    const envelope = await request<ApiEnvelope<T[]>>(`/${resource}`, {
      method: 'GET',
      cache: options?.fresh ? 'no-store' : 'default',
    });
    return envelope.data;
  },

  async submitPublic(resource: PublicWriteResource, payload: Record<string, unknown>) {
    if (resource === 'usage-events') {
      await request<void>(`/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body(payload),
        keepalive: true,
      });
      return {};
    }
    const envelope = await request<ApiEnvelope<MutationReceipt>>(`/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body(payload),
    });
    return envelope.data;
  },

  async getAdminSession() {
    const envelope = await request<ApiEnvelope<AdminSession>>('/admin/me', {
      method: 'GET',
      headers: await adminHeaders(false, true),
      cache: 'no-store',
    });
    return envelope.data;
  },

  async listAdmin<T>(resource: AdminListResource) {
    const envelope = await request<ApiEnvelope<T>>(`/admin/${resource}`, {
      method: 'GET',
      headers: await adminHeaders(),
      cache: 'no-store',
    });
    return envelope.data;
  },

  async createAdmin(resource: AdminMutableResource, payload: Record<string, unknown>) {
    const envelope = await request<ApiEnvelope<MutationReceipt>>(`/admin/${resource}`, {
      method: 'POST',
      headers: await adminHeaders(true),
      body: body(payload),
    });
    return envelope.data;
  },

  async updateAdmin(resource: AdminMutableResource, id: string, payload: Record<string, unknown>) {
    const envelope = await request<ApiEnvelope<MutationReceipt>>(`/admin/${resource}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: await adminHeaders(true),
      body: body(payload),
    });
    return envelope.data;
  },

  async deleteAdmin(resource: 'approved-links' | 'blocked-links', id: string) {
    await request<void>(`/admin/${resource}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: await adminHeaders(),
    });
  },

  async runAdminAction<T>(action: 'ncsc-run') {
    const envelope = await request<ApiEnvelope<T>>(`/admin/${action}`, {
      method: 'POST',
      headers: await adminHeaders(),
    });
    return envelope.data;
  },

  async actOnLinkCheck(urlHash, action, reason, replacementUrl, replacementName) {
    const envelope = await request<ApiEnvelope<MutationReceipt>>(`/admin/link-checks/${encodeURIComponent(urlHash)}/action`, {
      method: 'POST',
      headers: await adminHeaders(true),
      body: body({
        action,
        reason,
        ...(replacementUrl ? { replacementUrl } : {}),
        ...(replacementName ? { replacementName } : {}),
      }),
    });
    return envelope.data;
  },

  async getFeedbackAttachment(feedbackId: string): Promise<AdminAttachment | null> {
    let response: Response;
    try {
      response = await fetch(`${apiBase}/admin/feedback/${encodeURIComponent(feedbackId)}/attachment`, {
        method: 'GET',
        headers: await adminHeaders(),
        credentials: 'same-origin',
        cache: 'no-store',
      });
    } catch {
      throw new DataProviderError('Liitepalvelimeen ei saatu yhteyttä.', 'network_error');
    }
    if (response.status === 404) return null;
    if (!response.ok) {
      const payload = await parseJson(response) as ApiErrorEnvelope | null;
      throw new DataProviderError(
        payload?.error?.message || `Liitteen haku epäonnistui (${response.status}).`,
        payload?.error?.code || 'request_failed',
        response.status,
      );
    }
    const blob = await response.blob();
    return {
      dataUrl: await blobToDataUrl(blob),
      name: attachmentName(response),
      type: blob.type,
      size: blob.size,
    };
  },
};

export const selectedDataProvider = cloudcityApiDataProvider;
