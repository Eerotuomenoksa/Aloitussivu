// Mittausajo: tarkistaa linkit ja tuottaa luvut cron-mitoitusta varten.
// Ei muuta mitään sovelluksessa. Ei kirjoita linkHealth.ts:ää eikä piilota linkkejä.
//
// HUOM: tämä mittaus käyttää GET-pyyntöä (enintään 16 kt), koska se tarkistaa myös
// sivun sisällön (soft-404, parkkisivu). Tuotannon cron voi käyttää kevyempää
// HEAD-pyyntöä, joten sen vastausajat ovat tässä mitattuja hieman nopeampia.
//
//   node scripts/link-check-benchmark.mjs                  # koko katalogi
//   node scripts/link-check-benchmark.mjs --sample 300     # satunnaisotos
//   node scripts/link-check-benchmark.mjs --concurrency 8  # hitaampi, kohteliaampi
//   node scripts/link-check-benchmark.mjs --resume         # jatka keskeytynyttä ajoa
//
// Tulokset:
//   .tmp/link-benchmark.ndjson          rivi per linkki, kirjoitetaan ajon aikana
//   docs/linkit-mittaus-<pvm>.csv       lopullinen taulukko
//   docs/linkit-mittaus-<pvm>.md        yhteenveto ja cron-mitoitus

import { mkdir, readFile, writeFile, appendFile, access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { execFile } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return fallback;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : true;
};

const CONCURRENCY = Number(arg('concurrency', 10)) || 10;
const TIMEOUT_MS = Number(arg('timeout', 12000)) || 12000;
const SAMPLE = Number(arg('sample', 0)) || 0;
const RESUME = Boolean(arg('resume', false));
const MAX_HOST_PARALLEL = 1;
const PROGRESS_PATH = resolve(root, '.tmp', 'link-benchmark.ndjson');

const USER_AGENT = 'Mozilla/5.0 (compatible; SeniorinAloitussivu-LinkChecker/2.0-mittaus; +https://seniorsurf.fi/aloitus/)';
const HEADERS = {
  'user-agent': USER_AGENT,
  'accept-language': 'fi-FI,fi;q=0.9,sv;q=0.8,en;q=0.7',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const SOFT_404 = /sivua ei l(ö|o)yd|sivua ei ole|page not found|error 404|sidan hittades inte|sivu on poistettu/i;
const PARKED = /osta t(ä|a)m(ä|a) verkkotunnus|buy this domain|domain for sale|sedo\.com|dan\.com|parkingcrew|parked/i;

const registeredDomain = (hostname) => {
  const parts = String(hostname).toLowerCase().replace(/\.$/, '').split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const lastTwo = parts.slice(-2).join('.');
  const twoLevel = new Set(['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au', 'org.au', 'co.nz']);
  return twoLevel.has(lastTwo) ? parts.slice(-3).join('.') : lastTwo;
};

const loadCatalog = async () => {
  const path = resolve(root, '.tmp', 'link-catalog.json');
  try {
    await access(path);
  } catch {
    await execFileAsync(process.execPath, [resolve(root, 'scripts', 'build-link-catalog.mjs')], { cwd: root });
  }
  const catalog = JSON.parse(await readFile(path, 'utf8'));
  const links = [...catalog.links];

  // Komponenteissa olevat kayttajalle nakyvat osoitteet, jotka eivat ole katalogin lahdetiedostoissa.
  try {
    const extra = JSON.parse(await readFile(resolve(root, 'docs', 'linkit-lisaosoitteet.json'), 'utf8'));
    const seen = new Set(links.map((link) => link.url));
    for (const link of extra.links ?? []) {
      if (link?.url && !seen.has(link.url)) {
        seen.add(link.url);
        links.push(link);
      }
    }
  } catch {
    // Lisaosoitteet ovat valinnaisia.
  }
  return links;
};

const readDone = async () => {
  const done = new Map();
  if (!RESUME) return done;
  try {
    await access(PROGRESS_PATH);
  } catch {
    return done;
  }
  const stream = createInterface({ input: createReadStream(PROGRESS_PATH, 'utf8'), crlfDelay: Infinity });
  for await (const line of stream) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line);
      if (row.url) done.set(row.url, row);
    } catch {
      // Ohita vajaa rivi keskeytyneestä ajosta.
    }
  }
  return done;
};

const request = async (url, method, useRange) => {
  const headers = { ...HEADERS };
  if (method === 'GET' && useRange) headers.range = 'bytes=0-16383';
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method,
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { response, ms: Date.now() - started, error: null };
  } catch (error) {
    const name = error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'timeout' : (error?.cause?.code ?? error?.code ?? 'request_failed');
    return { response: null, ms: Date.now() - started, error: String(name).toLowerCase() };
  }
};

const classify = (httpStatus) => {
  if (httpStatus >= 200 && httpStatus < 300) return { status: 'ok', code: null };
  if ([401, 403, 405, 417, 429].includes(httpStatus)) return { status: 'warning', code: 'access_limited' };
  if (httpStatus >= 500) return { status: 'failed', code: 'server_error' };
  return { status: 'failed', code: 'http_status_error' };
};

const checkOne = async (link) => {
  const base = {
    url: link.url,
    name: link.name,
    category: link.category,
    source: link.source,
    scheme: link.url.startsWith('http://') ? 'http' : 'https',
  };
  if (base.scheme === 'http') {
    const upgraded = link.url.replace(/^http:/i, 'https:');
    const probe = await request(upgraded, 'HEAD', false);
    const reachable = probe.response && probe.response.status >= 200 && probe.response.status < 400;
    return { ...base, status: 'rejected', code: reachable ? 'https_available' : 'https_required', httpStatus: probe.response?.status ?? null, ms: probe.ms, finalUrl: reachable ? upgraded : '', domainChanged: false, contentFlag: '', attempts: 1 };
  }

  let attempts = 1;
  let attempt = await request(link.url, 'GET', true);
  let httpStatus = attempt.response?.status ?? 0;
  // Osa palvelimista ei tue Range-otsaketta: yritä kerran ilman sitä.
  if (!attempt.error && [416, 417, 501].includes(httpStatus)) {
    attempts += 1;
    attempt = await request(link.url, 'GET', false);
    httpStatus = attempt.response?.status ?? 0;
  }

  if (attempt.error) {
    return { ...base, status: 'failed', code: attempt.error, httpStatus: null, ms: attempt.ms, finalUrl: '', domainChanged: false, contentFlag: '', attempts };
  }

  const { status, code } = classify(httpStatus);
  const finalUrl = attempt.response.url || link.url;
  let domainChanged = false;
  try {
    domainChanged = registeredDomain(new URL(link.url).hostname) !== registeredDomain(new URL(finalUrl).hostname);
  } catch {
    // Jätä vertailu tekemättä, jos osoitetta ei voi jäsentää.
  }

  let contentFlag = '';
  if (status === 'ok' && /text\/html/i.test(attempt.response.headers.get('content-type') ?? '')) {
    try {
      const body = (await attempt.response.text()).slice(0, 16384);
      if (body.trim().length === 0) throw new Error('tyhja_runko');
      const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
      const text = body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (SOFT_404.test(`${title} ${text.slice(0, 400)}`)) contentFlag = 'soft_404';
      else if (PARKED.test(`${title} ${text.slice(0, 800)}`)) contentFlag = 'parked_domain';
      else if (!title && text.length < 200) contentFlag = 'empty_page';
    } catch {
      // Rungon lukeminen ei ole pakollista.
    }
  }
  return { ...base, status, code, httpStatus, ms: attempt.ms, finalUrl, domainChanged, contentFlag, attempts };
};

const runLimited = async (items, worker, limit) => {
  const activeHosts = new Map();
  let index = 0;
  const pending = [];
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      let host = '';
      try { host = new URL(item.url).hostname; } catch { host = item.url; }
      while ((activeHosts.get(host) ?? 0) >= MAX_HOST_PARALLEL) {
        await new Promise((done) => setTimeout(done, 120));
      }
      activeHosts.set(host, (activeHosts.get(host) ?? 0) + 1);
      try {
        pending.push(await worker(item));
      } finally {
        const left = (activeHosts.get(host) ?? 1) - 1;
        if (left <= 0) activeHosts.delete(host); else activeHosts.set(host, left);
      }
    }
  });
  await Promise.all(workers);
  return pending;
};

const percentile = (values, share) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))];
};

const csvEscape = (value) => `"${String(value ?? '').replace(/\s+/g, ' ').trim().replace(/"/g, '""')}"`;

const main = async () => {
  await mkdir(resolve(root, '.tmp'), { recursive: true });
  await mkdir(resolve(root, 'docs'), { recursive: true });

  const allLinks = await loadCatalog();
  const catalogHttps = allLinks.filter((link) => !link.url.startsWith('http://')).length;
  let links = allLinks;
  if (SAMPLE > 0 && SAMPLE < links.length) {
    const shuffled = [...links];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    links = shuffled.slice(0, SAMPLE);
  }

  const done = await readDone();
  const todo = links.filter((link) => !done.has(link.url));
  if (!RESUME) await writeFile(PROGRESS_PATH, '', 'utf8');
  console.log(`Tarkistetaan ${todo.length} linkkiä (${done.size} valmiina), rinnakkaisuus ${CONCURRENCY}, aikakatkaisu ${TIMEOUT_MS} ms.`);

  const startedAt = Date.now();
  let completed = 0;
  const fresh = await runLimited(todo, async (link) => {
    const row = await checkOne(link);
    await appendFile(PROGRESS_PATH, `${JSON.stringify(row)}\n`, 'utf8');
    completed += 1;
    if (completed % 50 === 0 || completed === todo.length) {
      const perSecond = completed / Math.max(1, (Date.now() - startedAt) / 1000);
      console.log(`${completed}/${todo.length} · ${perSecond.toFixed(1)} linkkiä/s`);
    }
    return row;
  }, CONCURRENCY);

  const rows = [...done.values(), ...fresh];
  const wallSeconds = (Date.now() - startedAt) / 1000;
  const today = new Date().toISOString().slice(0, 10);

  const header = ['URL', 'Nimi', 'Kategoria', 'Lähde', 'Protokolla', 'Tila', 'Koodi', 'HTTP', 'Kesto ms', 'Yrityksiä', 'Lopullinen URL', 'Domain vaihtui', 'Sisältöhuomio'];
  const csv = rows.map((row) => [
    row.url, row.name, row.category, row.source, row.scheme, row.status, row.code ?? '', row.httpStatus ?? '',
    row.ms, row.attempts, row.finalUrl, row.domainChanged ? 'kyllä' : 'ei', row.contentFlag,
  ].map(csvEscape).join(','));
  await writeFile(resolve(root, 'docs', `linkit-mittaus-${today}.csv`), `${header.map(csvEscape).join(',')}\n${csv.join('\n')}\n`, 'utf8');

  const https = rows.filter((row) => row.scheme === 'https');
  const count = (predicate) => rows.filter(predicate).length;
  const times = https.filter((row) => row.status !== 'failed').map((row) => row.ms);
  const codes = {};
  rows.forEach((row) => { if (row.code) codes[row.code] = (codes[row.code] ?? 0) + 1; });

  const okCount = count((row) => row.status === 'ok');
  const warningCount = count((row) => row.status === 'warning');
  const failedCount = count((row) => row.status === 'failed');
  const rejectedCount = count((row) => row.status === 'rejected');
  const httpsAvailable = count((row) => row.code === 'https_available');
  const domainChanged = count((row) => row.domainChanged);
  const contentFlags = count((row) => row.contentFlag);

  // Cron-mitoitus lasketaan aina KOKO katalogista, ei otoksesta.
  const checkable = catalogHttps;
  const perRunAt = (runsPerDay, days) => Math.ceil(checkable / days / runsPerDay);
  // Uusintakuorma: kuinka moni linkki on vikatilassa ja kuinka usein niitä yritetään uudelleen.
  const failureRate = https.length > 0 ? failedCount / https.length : 0;
  const projectedFailing = Math.round(failureRate * checkable);
  const retryFlat = projectedFailing;                    // kiinteä retry_hours = 24
  const retryStaggered = Math.round(projectedFailing / 7); // porrastettu 6 h / 24 h / 72 h / 7 vrk

  const summary = [
    `# Linkkien mittausajo ${today}`,
    '',
    `Ajettu komennolla \`node scripts/link-check-benchmark.mjs${SAMPLE ? ` --sample ${SAMPLE}` : ''}\`. Mittaus ei muuta sovelluksen linkkinäkyvyyttä.`,
    '',
    '## Tulokset',
    '',
    '| Mittari | Määrä |',
    '|---|---:|',
    `| Linkkejä tarkistettu | ${rows.length} |`,
    `| Kunnossa (ok) | ${okCount} |`,
    `| Varoitus (bottisuojaus tms.) | ${warningCount} |`,
    `| Epäonnistui (failed) | ${failedCount} |`,
    `| Ohitettu, ei HTTPS (rejected) | ${rejectedCount} |`,
    `| Näistä HTTPS-versio toimii | ${httpsAvailable} |`,
    `| Verkkotunnus vaihtui ohjauksessa | ${domainChanged} |`,
    `| Sisältöhuomio (soft-404, parkkisivu, tyhjä) | ${contentFlags} |`,
    '',
    '## Vastausajat (onnistuneet HTTPS-tarkistukset)',
    '',
    `- mediaani ${percentile(times, 0.5)} ms`,
    `- 90. persentiili ${percentile(times, 0.9)} ms`,
    `- 99. persentiili ${percentile(times, 0.99)} ms`,
    `- hitain ${Math.max(0, ...times)} ms`,
    `- koko ajo ${wallSeconds.toFixed(0)} s rinnakkaisuudella ${CONCURRENCY}`,
    '',
    '## Virhekoodit',
    '',
    ...Object.entries(codes).sort((a, b) => b[1] - a[1]).map(([code, n]) => `- ${code}: ${n}`),
    '',
    '## Cron-mitoitus',
    '',
    `Tarkistettavia HTTPS-linkkejä koko katalogissa: ${checkable}.${SAMPLE ? ` (Osuudet on laskettu ${https.length} linkin otoksesta.)` : ''}`,
    '',
    '| Tarkistusväli | Kerran vrk | 4× vrk | Tunnin välein |',
    '|---|---:|---:|---:|',
    `| 7 vrk | ${perRunAt(1, 7)} | ${perRunAt(4, 7)} | ${perRunAt(24, 7)} |`,
    `| 14 vrk | ${perRunAt(1, 14)} | ${perRunAt(4, 14)} | ${perRunAt(24, 14)} |`,
    `| 30 vrk | ${perRunAt(1, 30)} | ${perRunAt(4, 30)} | ${perRunAt(24, 30)} |`,
    '',
    'Taulukon luku on **vähimmäiserän koko** (`link_checks.batch_size`), jolla koko linkkimassa ehtii läpi annetussa ajassa. Lisää siihen vielä varaa uusintayrityksille: epäonnistuneet linkit tarkistetaan `retry_hours`-välein ja ne kuluttavat samaa erää.',
    '',
    `Yhden tarkistuksen mediaanikesto oli ${percentile(times, 0.5)} ms, joten peräkkäin ajettuna ${perRunAt(24, 14)} linkin erä kestää tyypillisesti noin ${((percentile(times, 0.5) * perRunAt(24, 14)) / 1000).toFixed(0)} s. Hitaimmillaan (99. persentiili) sama erä kestää noin ${((percentile(times, 0.99) * perRunAt(24, 14)) / 1000).toFixed(0)} s.`,
    '',
    '### Uusintayritysten kuorma',
    '',
    `Vikatilassa oli ${(failureRate * 100).toFixed(1)} % tarkistetuista, mikä koko katalogissa tarkoittaa noin ${projectedFailing} linkkiä.`,
    '',
    `- Kiinteällä \`retry_hours = 24\`: **${retryFlat} ylimääräistä tarkistusta vuorokaudessa**.`,
    `- Porrastetulla uusinnalla (6 h → 24 h → 72 h → 7 vrk): noin **${retryStaggered} tarkistusta vuorokaudessa**.`,
    '',
    `Erän koon on katettava vakiokuorma **ja** uusinnat. Tunnin välein ajettuna tarvittava \`batch_size\` on vähintään \`ceil((vakiokuorma + uusinnat) / 24)\` ja siihen päälle noin 20 % varaa.`,
  ];
  await writeFile(resolve(root, 'docs', `linkit-mittaus-${today}.md`), `${summary.join('\n')}\n`, 'utf8');

  console.log(`\nValmis. ok=${okCount} warning=${warningCount} failed=${failedCount} rejected=${rejectedCount}`);
  console.log(`docs/linkit-mittaus-${today}.md ja docs/linkit-mittaus-${today}.csv kirjoitettu.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
