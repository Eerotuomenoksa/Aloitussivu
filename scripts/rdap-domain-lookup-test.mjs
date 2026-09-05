import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { RdapDomainLookup } from './rdap-domain-lookup.mjs';

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'aloitussivu-rdap-'));
const cachePath = path.join(tempRoot, 'rdap-cache.json');
const nowMs = Date.parse('2026-09-05T08:00:00.000Z');

try {
  let requests = 0;
  const lookup = new RdapDomainLookup({
    cachePath,
    now: () => nowMs,
    sleep: async () => {},
    requestIntervalMs: 0,
    fetchImpl: async () => {
      requests += 1;
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({ entities: [{ vcardArray: ['vcard', [['fn', {}, 'text', 'Esimerkkikunta']]] }] }),
      };
    },
  });
  await lookup.load();
  assert.equal(await lookup.lookup('esimerkki.fi'), 'Esimerkkikunta');
  assert.equal(await lookup.lookup('esimerkki.fi'), 'Esimerkkikunta');
  assert.equal(requests, 1, 'sama domain haetaan vain kerran');
  await lookup.save();

  const persisted = JSON.parse(await readFile(cachePath, 'utf8'));
  assert.equal(persisted.entries['esimerkki.fi'].signal, 'Esimerkkikunta');

  const cachedLookup = new RdapDomainLookup({
    cachePath,
    now: () => nowMs + 24 * 60 * 60 * 1000,
    fetchImpl: async () => { throw new Error('tuoretta välimuistia ei saa hakea uudelleen'); },
  });
  await cachedLookup.load();
  assert.equal(await cachedLookup.lookup('esimerkki.fi'), 'Esimerkkikunta');

  let limitedRequests = 0;
  const limitedCachePath = path.join(tempRoot, 'limited.json');
  const limitedLookup = new RdapDomainLookup({
    cachePath: limitedCachePath,
    now: () => nowMs,
    sleep: async () => {},
    requestIntervalMs: 0,
    fetchImpl: async () => {
      limitedRequests += 1;
      return {
        ok: false,
        status: 429,
        headers: { get: () => '3600' },
        json: async () => ({}),
      };
    },
  });
  assert.match(await limitedLookup.lookup('rajoitettu.fi'), /RDAP-taustapalvelun pyyntörajoitus/);
  assert.match(await limitedLookup.lookup('toinen.fi'), /RDAP-taustapalvelun pyyntörajoitus/);
  assert.equal(limitedRequests, 1, '429 pysäyttää loput RDAP-kyselyt');
  await limitedLookup.save();

  const persistedLimitLookup = new RdapDomainLookup({
    cachePath: limitedCachePath,
    now: () => nowMs + 30 * 60 * 1000,
    fetchImpl: async () => { throw new Error('tallennetun pyyntötauon aikana ei saa tehdä verkkopyyntöä'); },
  });
  await persistedLimitLookup.load();
  assert.match(await persistedLimitLookup.lookup('kolmas.fi'), /RDAP-taustapalvelun pyyntörajoitus/);

  const staleCachePath = path.join(tempRoot, 'stale.json');
  await writeFile(staleCachePath, JSON.stringify({
    version: 1,
    blockedUntil: null,
    entries: {
      'vanha.fi': {
        signal: 'Vanha omistajatieto',
        checkedAt: '2026-01-01T00:00:00.000Z',
        kind: 'success',
      },
    },
  }), 'utf8');
  const staleLookup = new RdapDomainLookup({
    cachePath: staleCachePath,
    now: () => nowMs,
    maxRequestsPerRun: 0,
  });
  await staleLookup.load();
  assert.equal(await staleLookup.lookup('vanha.fi'), 'Vanha omistajatieto (vanhentuneesta välimuistista)');

  console.log('RDAP-välimuistin testit läpäisty.');
} finally {
  await Promise.all([
    rm(cachePath, { force: true }),
    rm(path.join(tempRoot, 'limited.json'), { force: true }),
    rm(path.join(tempRoot, 'stale.json'), { force: true }),
  ]);
  await rmdir(tempRoot);
}
