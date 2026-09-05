import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CACHE_VERSION = 1;
const SUCCESS_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const FAILURE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHE_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const DEFAULT_RATE_LIMIT_BACKOFF_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SERVICE_BACKOFF_MS = 60 * 60 * 1000;

const RATE_LIMIT_SIGNAL = 'Omistajatietoa ei haettu (RDAP-taustapalvelun pyyntörajoitus; kohdesivun tila erillinen)';
const REQUEST_LIMIT_SIGNAL = 'Omistajatietoa ei haettu tässä ajossa (RDAP-taustapalvelun kyselyraja; kohdesivun tila erillinen)';
const SERVICE_UNAVAILABLE_SIGNAL = 'Omistajatietoa ei saatu (RDAP-taustapalvelu ei vastannut; kohdesivun tila erillinen)';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const collectRdapNames = (value, names = new Set()) => {
  if (!value) return names;
  if (Array.isArray(value)) {
    if (value[0] === 'fn' || value[0] === 'org') {
      const item = String(value[3] ?? '').trim();
      if (item) names.add(item);
    }
    value.forEach((item) => collectRdapNames(item, names));
    return names;
  }
  if (typeof value === 'object') {
    if (typeof value.name === 'string' && value.name.trim()) names.add(value.name.trim());
    Object.values(value).forEach((item) => collectRdapNames(item, names));
  }
  return names;
};

const parseRetryAfterMs = (value, nowMs) => {
  const candidate = String(value ?? '').trim();
  if (/^[0-9]{1,7}$/.test(candidate)) {
    return Math.min(Number(candidate) * 1000, 7 * 24 * 60 * 60 * 1000);
  }
  const dateMs = Date.parse(candidate);
  if (Number.isFinite(dateMs) && dateMs > nowMs) {
    return Math.min(dateMs - nowMs, 7 * 24 * 60 * 60 * 1000);
  }
  return null;
};

const normalizeCacheEntry = (value) => {
  if (!value || typeof value !== 'object') return null;
  const signal = typeof value.signal === 'string' ? value.signal.trim() : '';
  const checkedAt = typeof value.checkedAt === 'string' ? value.checkedAt : '';
  const checkedAtMs = Date.parse(checkedAt);
  const kind = value.kind === 'success' || value.kind === 'failure' ? value.kind : null;
  if (!signal || !Number.isFinite(checkedAtMs) || !kind) return null;
  return { signal, checkedAt, kind };
};

export class RdapDomainLookup {
  constructor({
    cachePath,
    fetchImpl = globalThis.fetch,
    now = () => Date.now(),
    sleep = wait,
    requestIntervalMs = 750,
    maxRequestsPerRun = 100,
    timeoutMs = 10_000,
  }) {
    if (!cachePath) throw new Error('RDAP cache path is required');
    if (typeof fetchImpl !== 'function') throw new Error('Fetch implementation is required');
    this.cachePath = cachePath;
    this.fetchImpl = fetchImpl;
    this.now = now;
    this.sleep = sleep;
    this.requestIntervalMs = Math.max(0, requestIntervalMs);
    this.maxRequestsPerRun = Math.max(0, maxRequestsPerRun);
    this.timeoutMs = Math.max(1, timeoutMs);
    this.entries = new Map();
    this.inFlight = new Map();
    this.queue = Promise.resolve();
    this.lastRequestAt = 0;
    this.requestCount = 0;
    this.blockedUntil = 0;
  }

  async load() {
    try {
      const parsed = JSON.parse(await readFile(this.cachePath, 'utf8'));
      if (parsed?.version !== CACHE_VERSION || !parsed.entries || typeof parsed.entries !== 'object') return;
      for (const [domain, rawEntry] of Object.entries(parsed.entries)) {
        const entry = normalizeCacheEntry(rawEntry);
        if (entry) this.entries.set(domain, entry);
      }
      const blockedUntil = Date.parse(String(parsed.blockedUntil ?? ''));
      if (Number.isFinite(blockedUntil) && blockedUntil > this.now()) this.blockedUntil = blockedUntil;
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        console.warn(`RDAP-välimuistia ei voitu lukea: ${error.message}`);
      }
    }
  }

  async save() {
    const nowMs = this.now();
    const entries = Object.fromEntries(
      [...this.entries.entries()]
        .filter(([, entry]) => nowMs - Date.parse(entry.checkedAt) <= MAX_CACHE_AGE_MS)
        .sort(([first], [second]) => first.localeCompare(second, 'en')),
    );
    await mkdir(path.dirname(this.cachePath), { recursive: true });
    await writeFile(this.cachePath, `${JSON.stringify({
      version: CACHE_VERSION,
      savedAt: new Date(nowMs).toISOString(),
      blockedUntil: this.blockedUntil > nowMs ? new Date(this.blockedUntil).toISOString() : null,
      entries,
    }, null, 2)}\n`, 'utf8');
  }

  async lookup(rawDomain) {
    const domain = String(rawDomain ?? '').trim().toLowerCase();
    if (!domain) return '';
    const cached = this.entries.get(domain);
    if (cached && this.isFresh(cached)) return cached.signal;
    if (this.inFlight.has(domain)) return this.inFlight.get(domain);

    const lookup = this.schedule(domain, cached).finally(() => this.inFlight.delete(domain));
    this.inFlight.set(domain, lookup);
    return lookup;
  }

  isFresh(entry) {
    const ageMs = this.now() - Date.parse(entry.checkedAt);
    const ttlMs = entry.kind === 'success' ? SUCCESS_TTL_MS : FAILURE_TTL_MS;
    return ageMs >= 0 && ageMs <= ttlMs;
  }

  schedule(domain, staleEntry) {
    const task = this.queue.then(() => this.fetchSignal(domain, staleEntry));
    this.queue = task.catch(() => undefined);
    return task;
  }

  staleOr(staleEntry, fallback) {
    return staleEntry?.kind === 'success'
      ? `${staleEntry.signal} (vanhentuneesta välimuistista)`
      : fallback;
  }

  async fetchSignal(domain, staleEntry) {
    const nowMs = this.now();
    if (this.blockedUntil > nowMs) return this.staleOr(staleEntry, RATE_LIMIT_SIGNAL);
    if (this.requestCount >= this.maxRequestsPerRun) return this.staleOr(staleEntry, REQUEST_LIMIT_SIGNAL);

    const elapsedMs = nowMs - this.lastRequestAt;
    if (this.lastRequestAt > 0 && elapsedMs < this.requestIntervalMs) {
      await this.sleep(this.requestIntervalMs - elapsedMs);
    }
    this.requestCount += 1;
    this.lastRequestAt = this.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          accept: 'application/rdap+json, application/json;q=0.9, */*;q=0.5',
          'user-agent': 'SeniorinAloitussivu-domain-background-check/2.0 (+https://seniorsurf.fi/aloitus/)',
        },
      });
      if (response.status === 429 || response.status === 503) {
        const retryAfterMs = parseRetryAfterMs(response.headers?.get?.('retry-after'), this.now());
        const fallbackMs = response.status === 429 ? DEFAULT_RATE_LIMIT_BACKOFF_MS : DEFAULT_SERVICE_BACKOFF_MS;
        this.blockedUntil = this.now() + (retryAfterMs ?? fallbackMs);
        return this.staleOr(staleEntry, response.status === 429 ? RATE_LIMIT_SIGNAL : SERVICE_UNAVAILABLE_SIGNAL);
      }
      if (!response.ok) {
        const signal = `Omistajatietoa ei saatu (RDAP-taustapalvelun vastaus ${response.status}; kohdesivun tila erillinen)`;
        this.entries.set(domain, { signal, checkedAt: new Date(this.now()).toISOString(), kind: 'failure' });
        return signal;
      }

      const data = await response.json();
      const names = [...collectRdapNames(data)]
        .filter((name) => !/^(redacted|not disclosed|data protected)$/i.test(name))
        .slice(0, 3);
      const signal = names.length > 0 ? names.join(' | ') : 'Omistajatieto ei julkinen';
      this.entries.set(domain, { signal, checkedAt: new Date(this.now()).toISOString(), kind: 'success' });
      return signal;
    } catch {
      this.blockedUntil = this.now() + DEFAULT_SERVICE_BACKOFF_MS;
      return this.staleOr(staleEntry, SERVICE_UNAVAILABLE_SIGNAL);
    } finally {
      clearTimeout(timeout);
    }
  }
}
