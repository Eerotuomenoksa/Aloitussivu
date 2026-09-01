import type { DataProviderKind } from './dataProvider';

const configuredProvider = import.meta.env.VITE_DATA_PROVIDER?.trim().toLocaleLowerCase('en-US');
// Oletus on tarkoituksella 'cloudcity'. Aiemmin oletus valittiin pelkkien
// Firebase-avainten perusteella, jolloin ilman VITE_DATA_PROVIDER-arvoa syntyi
// nippu joka kirjoittaa Firestoreen. Tietosuojaseloste lupaa, etta palautteet ja
// kayttoluvut ovat Cloudcityn palvelimella, joten Firestoreen kirjoittava nippu
// tekisi selosteesta virheellisen. 'firebase-rollback' on nykyisin vain
// nimenomainen paluuvaihtoehto, ei oletus.
export const dataProviderKind: DataProviderKind = (
  configuredProvider === 'cloudcity'
  || configuredProvider === 'firebase-rollback'
  || configuredProvider === 'local'
)
  ? configuredProvider
  : 'cloudcity';

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
