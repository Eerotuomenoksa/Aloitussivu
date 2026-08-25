import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildMigration, isInside } from './rel08-migration-lib.mjs';

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
  throw new Error('Käyttö: node scripts/rel08-build-import.mjs --input FIRESTORE_EXPORT_JSON --output-dir UUSI_ULKOPUOLINEN_HAKEMISTO');
}

const workspace = path.resolve(process.cwd());
const input = path.resolve(inputArg);
const output = path.resolve(outputArg);
if (isInside(input, workspace) || isInside(output, workspace)) {
  throw new Error('Vienti, SQL ja liitteet on pidettävä repositorion ulkopuolella.');
}
await stat(input);
try {
  await stat(output);
  throw new Error('Tuloshakemisto on jo olemassa; valitse uusi hakemisto.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const payload = JSON.parse(await readFile(input, 'utf8'));
const migration = buildMigration(payload);
await mkdir(output, { mode: 0o700 });
await writeFile(
  path.join(output, 'reconciliation-report.json'),
  `${JSON.stringify(migration.report, null, 2)}\n`,
  { encoding: 'utf8', flag: 'wx', mode: 0o600 },
);
await writeFile(
  path.join(output, 'exceptions.json'),
  `${JSON.stringify(migration.exceptions, null, 2)}\n`,
  { encoding: 'utf8', flag: 'wx', mode: 0o600 },
);

if (migration.exceptions.length > 0 || !migration.sql || !migration.verificationSql) {
  console.error(JSON.stringify({ status: 'blocked', exceptionCount: migration.exceptions.length }, null, 2));
  process.exitCode = 2;
} else {
  await writeFile(path.join(output, 'import.sql'), migration.sql, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  await writeFile(path.join(output, 'verify.sql'), migration.verificationSql, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  await writeFile(
    path.join(output, 'adminStats-archive.json'),
    `${JSON.stringify(payload.collections.adminStats, null, 2)}\n`,
    { encoding: 'utf8', flag: 'wx', mode: 0o600 },
  );

  const attachmentRoot = path.join(output, 'attachments');
  if (migration.model.feedbackAttachments.length > 0) await mkdir(attachmentRoot, { mode: 0o700 });
  for (const attachment of migration.model.feedbackAttachments) {
    const target = path.join(attachmentRoot, ...attachment.storageKey.split('/'));
    await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await writeFile(target, attachment.contents, { flag: 'wx', mode: 0o600 });
  }

  console.log(JSON.stringify({
    status: 'ok',
    exportSha256: migration.report.exportSha256,
    sourceCounts: migration.report.sourceCounts,
    transformedCounts: migration.report.transformedCounts,
    attachmentFiles: migration.model.feedbackAttachments.length,
    exceptionCount: 0,
  }, null, 2));
}
