import { createRequire } from 'node:module';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FIRESTORE_COLLECTIONS, REL08_FORMAT, isInside } from './rel08-migration-lib.mjs';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const name = process.argv[index];
  if (!name.startsWith('--')) throw new Error(`Tuntematon argumentti: ${name}`);
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Arvo puuttuu: ${name}`);
  args.set(name.slice(2), value);
  index += 1;
}

const projectId = args.get('project-id')?.trim();
const outputArg = args.get('output');
const deltaSinceRaw = args.get('since')?.trim() ?? null;
const credentialArg = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
if (!projectId || !outputArg) {
  throw new Error('Käyttö: node scripts/rel08-export-firestore.mjs --project-id PROJEKTI --output REPOSITORION_ULKOPUOLINEN_TIEDOSTO [--since ISO_AIka]');
}
if (!credentialArg) throw new Error('GOOGLE_APPLICATION_CREDENTIALS-ympäristömuuttuja puuttuu.');

const workspace = path.resolve(process.cwd());
const output = path.resolve(outputArg);
const credentialPath = path.resolve(credentialArg);
if (isInside(output, workspace) || isInside(credentialPath, workspace)) {
  throw new Error('Vienti ja Admin SDK -avain on pidettävä repositorion ulkopuolella.');
}
await stat(credentialPath);
try {
  await stat(output);
  throw new Error('Vientitiedosto on jo olemassa; valitse uusi tiedostonimi.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const credentialMetadata = JSON.parse(await readFile(credentialPath, 'utf8'));
if (credentialMetadata.project_id !== projectId) {
  throw new Error('Admin SDK -avaimen projekti ei vastaa --project-id-arvoa. Vienti keskeytettiin.');
}

const deltaSince = deltaSinceRaw === null ? null : new Date(deltaSinceRaw);
if (deltaSince && Number.isNaN(deltaSince.getTime())) throw new Error('Virheellinen --since-aikaleima.');

const requireFromFunctions = createRequire(new URL('../functions/package.json', import.meta.url));
const { applicationDefault, deleteApp, initializeApp } = requireFromFunctions('firebase-admin/app');
const { getFirestore } = requireFromFunctions('firebase-admin/firestore');

const app = initializeApp({ credential: applicationDefault(), projectId }, `rel08-export-${Date.now()}`);
const db = getFirestore(app);

const portableValue = (value) => {
  if (value === null || value === undefined || typeof value !== 'object') return value;
  if (typeof value.toDate === 'function') {
    return { __rel08Type: 'timestamp', iso: value.toDate().toISOString() };
  }
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return { __rel08Type: 'bytes', base64: Buffer.from(value).toString('base64') };
  }
  if (Array.isArray(value)) return value.map(portableValue);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, portableValue(item)]));
};

const timestampValue = (value) => {
  if (typeof value === 'string') return Date.parse(value);
  if (value && typeof value === 'object' && value.__rel08Type === 'timestamp') return Date.parse(value.iso);
  return Number.NaN;
};

const includeInDelta = (doc) => {
  if (!deltaSince) return true;
  const data = doc.data ?? {};
  const candidates = ['updatedAt', 'createdAt', 'processedAt', 'publishedAt']
    .map((field) => timestampValue(data[field]))
    .filter(Number.isFinite);
  if (typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    candidates.push(Date.parse(`${data.date}T00:00:00Z`));
  }
  return candidates.length === 0 || candidates.some((value) => value >= deltaSince.getTime());
};

const collections = {};
try {
  for (const name of FIRESTORE_COLLECTIONS) {
    const snapshot = await db.collection(name).get();
    collections[name] = snapshot.docs
      .map((doc) => ({ id: doc.id, data: portableValue(doc.data()) }))
      .filter(includeInDelta)
      .sort((left, right) => left.id.localeCompare(right.id));
  }
} finally {
  await deleteApp(app);
}

const exportedAt = new Date().toISOString();
const payload = {
  format: REL08_FORMAT,
  projectId,
  exportedAt,
  deltaSince: deltaSince?.toISOString() ?? null,
  deltaMode: deltaSince ? 'timestamp-upserts; deletions require write freeze and full reconciliation' : null,
  collections,
  counts: Object.fromEntries(FIRESTORE_COLLECTIONS.map((name) => [name, collections[name].length])),
};

await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });

console.log(JSON.stringify({
  status: 'ok',
  projectId,
  exportedAt,
  deltaSince: payload.deltaSince,
  counts: payload.counts,
}, null, 2));
