import { adminPollIntervalMs, getDataProvider, subscribeWithPolling } from './services/data';

export type LinkCheckStatus = 'pending' | 'ok' | 'warning' | 'failed' | 'rejected';

export type LinkCheckItem = {
  id: string;
  url: string;
  name: string;
  category: string;
  source: string;
  lastCheckedAt: string | null;
  nextCheckAt: string;
  status: LinkCheckStatus;
  httpStatus: number | null;
  finalUrl: string | null;
  failureCount: number;
  errorCode: string | null;
  responseMs: number | null;
  isBlocked: boolean;
  overrideScope: string | null;
  overrideNextReviewAt: string | null;
};

export type LinkCheckRun = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  catalogCount: number;
  approvedCount: number;
  checked: number;
  ok: number;
  warnings: number;
  failed: number;
  rejected: number;
  blocked: number;
  unblocked: number;
  messageCode: string | null;
};

export type LinkCheckOverview = {
  enabled: boolean;
  autoBlockEnabled: boolean;
  alertAfterFailures: number;
  summary: {
    total: number;
    pending: number;
    ok: number;
    warnings: number;
    failing: number;
    rejected: number;
    domainChanged: number;
    attention: number;
    due: number;
    oldestCheckedAt: string | null;
    estimatedCycleDays: number;
  };
  lastRun: LinkCheckRun | null;
  items: LinkCheckItem[];
  statusItems: LinkCheckItem[];
  rejectedItems: LinkCheckItem[];
  domainChangedItems: LinkCheckItem[];
  runs: LinkCheckRun[];
};

export const emptyLinkCheckOverview: LinkCheckOverview = {
  enabled: false,
  autoBlockEnabled: false,
  alertAfterFailures: 2,
  summary: { total: 0, pending: 0, ok: 0, warnings: 0, failing: 0, rejected: 0, domainChanged: 0, attention: 0, due: 0, oldestCheckedAt: null, estimatedCycleDays: 0 },
  lastRun: null,
  items: [],
  statusItems: [],
  rejectedItems: [],
  domainChangedItems: [],
  runs: [],
};

export const fetchLinkChecks = async () => {
  const provider = await getDataProvider();
  return provider.listAdmin<LinkCheckOverview>('link-checks');
};

export const actOnLinkCheck = async (
  urlHash: string,
  action: 'approve' | 'block' | 'replace',
  reason: string,
  replacementUrl?: string,
) => {
  const provider = await getDataProvider();
  return provider.actOnLinkCheck(urlHash, action, reason, replacementUrl);
};

export const subscribeLinkChecks = (
  callback: (overview: LinkCheckOverview) => void,
  onError?: (error: unknown) => void,
) => subscribeWithPolling(fetchLinkChecks, callback, onError, adminPollIntervalMs);

const errorLabels: Record<string, string> = {
  https_required: 'Osoite tai uudelleenohjaus ei käytä suojattua HTTPS-yhteyttä.',
  dns_failed: 'Verkkotunnuksen osoitetta ei voitu selvittää.',
  timeout: 'Palvelin ei vastannut määräajassa.',
  connection_failed: 'Palvelimeen ei saatu yhteyttä.',
  tls_failed: 'HTTPS-varmenteen tai salatun yhteyden tarkistus epäonnistui.',
  http_status_error: 'Palvelin palautti virhetilan.',
  server_error: 'Palvelimessa oli tilapäinen 5xx-virhe.',
  access_limited: 'Palvelin rajoitti automaattista tarkistusta, mutta linkki vastasi.',
  too_many_redirects: 'Linkki uudelleenohjasi liian monta kertaa.',
  redirect_location_missing: 'Uudelleenohjauksen kohde puuttui.',
  redirect_location_invalid: 'Uudelleenohjauksen kohdeosoite ei kelpaa.',
  domain_for_sale: 'Osoite ohjautuu verkkotunnuksen myynti- tai pysäköintisivulle.',
  request_failed: 'Verkkopyyntö epäonnistui odottamattomasti.',
  address_not_allowed: 'Osoite johtaa sisäiseen tai varattuun verkkoon, jota tarkistin ei avaa.',
  port_not_allowed: 'Linkki käyttää muuta kuin tavallista HTTPS-porttia.',
};

export const getLinkCheckErrorLabel = (code: string | null) => (
  code ? (errorLabels[code] ?? `Tarkistusvirhe: ${code}`) : 'Tarkistus epäonnistui.'
);

export const getLinkCheckRunMessage = (code: string | null) => {
  if (code === 'network_suspect') return 'Ajo keskeytettiin, koska palvelimen verkkoyhteyttä epäillään.';
  if (code === 'network_suspect_repeated') return 'Palvelimen verkkoyhteyden häiriö toistui. Linkkien virhelaskureita ei muutettu.';
  if (code === 'time_budget_reached') return 'Ajo saavutti kahden minuutin aikarajan. Loput linkit jäivät seuraavaan ajoon.';
  return code ? `Ajokoodi: ${code}` : '';
};
