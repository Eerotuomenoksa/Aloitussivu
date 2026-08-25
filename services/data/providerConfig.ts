import type { DataProviderKind } from './dataProvider';

const configuredProvider = import.meta.env.VITE_DATA_PROVIDER?.trim().toLocaleLowerCase('en-US');
const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY?.trim()
  && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
  && import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
);

export const dataProviderKind: DataProviderKind = (
  configuredProvider === 'cloudcity'
  || configuredProvider === 'firebase-rollback'
  || configuredProvider === 'local'
)
  ? configuredProvider
  : (hasFirebaseConfig ? 'firebase-rollback' : 'local');

export const apiBase = (import.meta.env.VITE_API_BASE?.trim() || '/api/v1').replace(/\/+$/, '');

const configuredTokenHeader = import.meta.env.VITE_ADMIN_TOKEN_HEADER?.trim().toLocaleLowerCase('en-US');
export const adminTokenHeader = configuredTokenHeader === 'x-firebase-id-token'
  ? 'X-Firebase-ID-Token'
  : 'Authorization';

export const adminPollIntervalMs = (() => {
  const configured = Number(import.meta.env.VITE_ADMIN_POLL_INTERVAL_MS);
  if (!Number.isFinite(configured)) return 30000;
  return Math.min(300000, Math.max(15000, Math.round(configured)));
})();
