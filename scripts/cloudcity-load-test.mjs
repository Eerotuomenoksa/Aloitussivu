// Cloudcityn kevyt, vain-lukuinen kuormitusajo.
// Yksi istunto vastaa uuden etusivun avausta: HTML ja kolme julkista API-listaa.
// Käyttöesimerkit:
//   node scripts/cloudcity-load-test.mjs
//   node scripts/cloudcity-load-test.mjs --duration-minutes 120 --rate 0.25 --concurrency 4
//   node scripts/cloudcity-load-test.mjs --base https://seniorsurf.fi/aloitus/

import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASE = 'https://staging.aloitussivu.seniorsurf.fi/';
const ENDPOINTS = [
  { name: 'page', path: '' },
  { name: 'approved-links', path: 'api/v1/approved-links' },
  { name: 'blocked-links', path: 'api/v1/blocked-links' },
  { name: 'scam-alerts', path: 'api/v1/scam-alerts' },
];
const USER_AGENT = 'Aloitussivu-CloudcityLoadTest/1.0 (+https://seniorsurf.fi/aloitus/)';

const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return fallback;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : fallback;
};

const numberArg = (name, fallback, minimum, maximum) => {
  const value = Number(arg(name, fallback));
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`--${name} pitää olla välillä ${minimum}–${maximum}.`);
  }
  return value;
};

const base = String(arg('base', DEFAULT_BASE)).replace(/\/+$/u, '') + '/';
const durationMinutes = numberArg('duration-minutes', 120, 0.01, 1440);
const sessionsPerSecond = numberArg('rate', 0.25, 0.01, 20);
const maxConcurrency = Math.floor(numberArg('concurrency', 4, 1, 50));
const timeoutMs = Math.floor(numberArg('timeout-ms', 15000, 1000, 120000));
const defaultName = `cloudcity-load-${new Date().toISOString().replace(/[.:]/gu, '-')}.jsonl`;
const output = resolve(ROOT, String(arg('output', `.tmp/${defaultName}`)));
const summaryOutput = `${output}.summary.json`;

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
const requestUrl = (path) => new URL(path, base).toString();

const stats = {
  startedAt: new Date().toISOString(),
  finishedAt: null,
  base,
  durationMinutes,
  targetSessionsPerSecond: sessionsPerSecond,
  maxConcurrency,
  timeoutMs,
  sessions: 0,
  requests: 0,
  ok: 0,
  failed: 0,
  statuses: {},
  durationsMs: [],
  bytes: 0,
};

const request = async (sessionId, endpoint) => {
  const url = requestUrl(endpoint.path);
  const started = Date.now();
  let status = null;
  let bytes = 0;
  let error = null;
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        accept: endpoint.name === 'page' ? 'text/html' : 'application/json',
        'user-agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    status = response.status;
    const body = await response.arrayBuffer();
    bytes = body.byteLength;
    if (!response.ok) {
      error = `http_${response.status}`;
    }
  } catch (requestError) {
    error = requestError?.name === 'TimeoutError' || requestError?.name === 'AbortError'
      ? 'timeout'
      : (requestError?.cause?.code ?? requestError?.code ?? 'request_failed');
  }

  const durationMs = Date.now() - started;
  stats.requests += 1;
  stats.durationsMs.push(durationMs);
  stats.bytes += bytes;
  const statusKey = status === null ? error : String(status);
  stats.statuses[statusKey] = (stats.statuses[statusKey] ?? 0) + 1;
  if (error === null) stats.ok += 1;
  else stats.failed += 1;

  await appendFile(output, `${JSON.stringify({
    at: new Date().toISOString(),
    sessionId,
    endpoint: endpoint.name,
    url,
    status,
    ms: durationMs,
    bytes,
    error,
  })}\n`);
};

const runSession = async (sessionId) => {
  // The browser obtains the document first and starts the three API calls after it.
  await request(sessionId, ENDPOINTS[0]);
  await Promise.all(ENDPOINTS.slice(1).map((endpoint) => request(sessionId, endpoint)));
  stats.sessions += 1;
};

const percentile = (values, fraction) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
};

const snapshot = () => {
  const elapsedSeconds = Math.max(0.001, (Date.now() - Date.parse(stats.startedAt)) / 1000);
  return {
    ...stats,
    elapsedSeconds: Number(elapsedSeconds.toFixed(1)),
    observedRequestsPerSecond: Number((stats.requests / elapsedSeconds).toFixed(3)),
    averageMs: stats.durationsMs.length === 0
      ? 0
      : Math.round(stats.durationsMs.reduce((sum, value) => sum + value, 0) / stats.durationsMs.length),
    p95Ms: percentile(stats.durationsMs, 0.95),
    maxMs: stats.durationsMs.length === 0 ? 0 : Math.max(...stats.durationsMs),
    durationsMs: undefined,
  };
};

await mkdir(resolve(ROOT, '.tmp'), { recursive: true });
await writeFile(output, `${JSON.stringify({
  type: 'meta',
  startedAt: stats.startedAt,
  base,
  durationMinutes,
  targetSessionsPerSecond: sessionsPerSecond,
  maxConcurrency,
  timeoutMs,
  endpoints: ENDPOINTS.map((endpoint) => endpoint.name),
})}\n`, { encoding: 'utf8', flag: 'wx' });

console.log(`Cloudcity-ajo alkaa: ${base}`);
console.log(`Kesto ${durationMinutes} min, tavoite ${sessionsPerSecond} istuntoa/s, rinnakkaisuus ${maxConcurrency}.`);
console.log(`Loki: ${output}`);

const endAt = Date.now() + durationMinutes * 60 * 1000;
const intervalMs = 1000 / sessionsPerSecond;
let nextSessionAt = Date.now();
const inFlight = new Set();
let progressTimer = null;

const printProgress = () => {
  const current = snapshot();
  console.log(
    `${new Date().toISOString()} sessions=${current.sessions} requests=${current.requests} `
    + `ok=${current.ok} failed=${current.failed} avg=${current.averageMs}ms p95=${current.p95Ms}ms `
    + `rps=${current.observedRequestsPerSecond}`,
  );
};

try {
  progressTimer = setInterval(printProgress, 30000);
  while (Date.now() < endAt) {
    const now = Date.now();
    if (now >= nextSessionAt && inFlight.size < maxConcurrency) {
      const sessionId = stats.sessions + inFlight.size + 1;
      const promise = runSession(sessionId)
        .catch((error) => {
          stats.failed += 1;
          console.error(`Istunto ${sessionId} epäonnistui: ${error?.message ?? error}`);
        })
        .finally(() => inFlight.delete(promise));
      inFlight.add(promise);
      nextSessionAt += intervalMs;
      continue;
    }
    if (inFlight.size >= maxConcurrency) {
      await Promise.race(inFlight);
      continue;
    }
    await sleep(Math.min(250, Math.max(1, nextSessionAt - now)));
  }
  await Promise.all(inFlight);
} finally {
  if (progressTimer !== null) clearInterval(progressTimer);
}

stats.finishedAt = new Date().toISOString();
const final = snapshot();
await writeFile(summaryOutput, `${JSON.stringify(final, null, 2)}\n`, 'utf8');
printProgress();
console.log(`Ajo valmis. Yhteenveto: ${summaryOutput}`);
