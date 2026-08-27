import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildAdminProvisioning } from './rel11-admin-provisioning-lib.mjs';
import { isInside } from './rel08-migration-lib.mjs';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const name = process.argv[index];
  if (!name.startsWith('--')) throw new Error(`Tuntematon argumentti: ${name}`);
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Arvo puuttuu: ${name}`);
  args.set(name.slice(2), value);
  index += 1;
}

const inputArg = args.get('input');
const outputArg = args.get('output-dir');
if (!inputArg || !outputArg) {
  throw new Error('Käyttö: node scripts/rel11-build-admin-provisioning.mjs --input YKSITYINEN_JSON --output-dir UUSI_YKSITYINEN_HAKEMISTO');
}

const workspace = path.resolve(process.cwd());
const input = path.resolve(inputArg);
const output = path.resolve(outputArg);
if (isInside(input, workspace) || isInside(output, workspace)) {
  throw new Error('Täytetty admin-aineisto ja SQL on pidettävä repositorion ulkopuolella.');
}
await stat(input);
try {
  await stat(output);
  throw new Error('Tuloshakemisto on jo olemassa; valitse uusi hakemisto.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const payload = JSON.parse(await readFile(input, 'utf8'));
const provisioning = buildAdminProvisioning(payload);
await mkdir(output, { mode: 0o700 });
await writeFile(path.join(output, 'preflight-admins.sql'), provisioning.preflightSql, {
  encoding: 'utf8', flag: 'wx', mode: 0o600,
});
await writeFile(path.join(output, 'provision-admins.sql'), provisioning.sql, {
  encoding: 'utf8', flag: 'wx', mode: 0o600,
});
await writeFile(path.join(output, 'verify-admins.sql'), provisioning.verificationSql, {
  encoding: 'utf8', flag: 'wx', mode: 0o600,
});
await writeFile(path.join(output, 'summary.json'), `${JSON.stringify(provisioning.summary, null, 2)}\n`, {
  encoding: 'utf8', flag: 'wx', mode: 0o600,
});

console.log(JSON.stringify({ status: 'ok', ...provisioning.summary }, null, 2));
