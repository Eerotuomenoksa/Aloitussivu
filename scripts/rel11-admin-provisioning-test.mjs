import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildAdminProvisioning, normalizeAdminProvisioning } from './rel11-admin-provisioning-lib.mjs';

const validPayload = () => ({
  projectId: 'aloitussivu-5d50c',
  environment: 'production',
  admins: [
    { firebaseUid: 'testUid-A_123', email: 'First.Admin@Example.com', role: 'admin', active: true },
    { firebaseUid: 'testUid-B_456', email: 'viewer.o-hara@example.com', role: 'viewer', active: false },
  ],
});

const built = buildAdminProvisioning(validPayload());
assert.equal(built.summary.adminCount, 2);
assert.deepEqual(built.summary.roleCounts, { admin: 1, editor: 0, viewer: 1 });
assert.deepEqual(built.summary.activeCounts, { active: 1, inactive: 1 });
assert.match(built.summary.preflightSqlSha256, /^[a-f0-9]{64}$/u);
assert.match(built.summary.provisionSqlSha256, /^[a-f0-9]{64}$/u);
assert.match(built.sql, /START TRANSACTION;/u);
assert.match(built.sql, /COMMIT;/u);
assert.match(built.sql, /WHERE NOT EXISTS/u);
assert.match(built.preflightSql, /conflicting_email_assignments/u);
assert.match(built.verificationSql, /expected_accounts_found/u);
assert.match(built.verificationSql, /expected_accounts_matching/u);

for (const secret of ['testUid-A_123', 'testUid-B_456', 'first.admin@example.com', "viewer.o-hara@example.com"]) {
  assert.equal(built.sql.includes(secret), false);
  assert.equal(built.preflightSql.includes(secret), false);
  assert.equal(built.verificationSql.includes(secret), false);
  assert.equal(JSON.stringify(built.summary).includes(secret), false);
}

const expectInvalid = (mutate, code) => {
  const payload = validPayload();
  mutate(payload);
  assert.throws(() => normalizeAdminProvisioning(payload), new RegExp(code, 'u'));
};

expectInvalid((payload) => { payload.projectId = 'wrong-project'; }, 'invalid_project_id');
expectInvalid((payload) => { payload.environment = 'staging'; }, 'invalid_environment');
expectInvalid((payload) => { payload.admins[0].firebaseUid = 'REPLACE_WITH_UID'; }, 'placeholder_firebase_uid');
expectInvalid((payload) => { payload.admins[0].email = 'admin@example.invalid'; }, 'invalid_email');
expectInvalid((payload) => { payload.admins[0].role = 'owner'; }, 'invalid_role');
expectInvalid((payload) => { delete payload.admins[0].active; }, 'invalid_active');
expectInvalid((payload) => { payload.admins[1].firebaseUid = payload.admins[0].firebaseUid; }, 'duplicate_firebase_uid');
expectInvalid((payload) => { payload.admins[1].email = payload.admins[0].email.toUpperCase(); }, 'duplicate_email');
expectInvalid((payload) => { payload.admins[0].email = 'admin\n@example.com'; }, 'invalid_email');

const workspace = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const privateTestRoot = mkdtempSync(path.join(os.tmpdir(), 'aloitussivu-rel11-admin-'));
try {
  const input = path.join(privateTestRoot, 'admins.json');
  const output = path.join(privateTestRoot, 'output');
  writeFileSync(input, `${JSON.stringify(validPayload())}\n`, { encoding: 'utf8', mode: 0o600 });

  const firstRun = spawnSync(process.execPath, [
    path.join(workspace, 'scripts', 'rel11-build-admin-provisioning.mjs'),
    '--input', input,
    '--output-dir', output,
  ], { cwd: workspace, encoding: 'utf8' });
  assert.equal(firstRun.status, 0, firstRun.stderr);
  const consoleSummary = JSON.parse(firstRun.stdout);
  assert.equal(consoleSummary.status, 'ok');
  assert.equal(consoleSummary.adminCount, 2);
  assert.equal(firstRun.stdout.includes('testUid-A_123'), false);
  assert.equal(firstRun.stdout.includes('first.admin@example.com'), false);
  assert.equal(JSON.parse(readFileSync(path.join(output, 'summary.json'), 'utf8')).adminCount, 2);
  assert.match(readFileSync(path.join(output, 'preflight-admins.sql'), 'utf8'), /conflicting_email_assignments/u);
  assert.match(readFileSync(path.join(output, 'provision-admins.sql'), 'utf8'), /START TRANSACTION;/u);
  assert.match(readFileSync(path.join(output, 'verify-admins.sql'), 'utf8'), /expected_accounts_matching/u);

  const existingOutputRun = spawnSync(process.execPath, [
    path.join(workspace, 'scripts', 'rel11-build-admin-provisioning.mjs'),
    '--input', input,
    '--output-dir', output,
  ], { cwd: workspace, encoding: 'utf8' });
  assert.notEqual(existingOutputRun.status, 0);
  assert.match(existingOutputRun.stderr, /Tuloshakemisto on jo olemassa/u);

  const repositoryInputRun = spawnSync(process.execPath, [
    path.join(workspace, 'scripts', 'rel11-build-admin-provisioning.mjs'),
    '--input', path.join(workspace, 'database', 'admin-provisioning-input.example.json'),
    '--output-dir', path.join(privateTestRoot, 'repository-input-output'),
  ], { cwd: workspace, encoding: 'utf8' });
  assert.notEqual(repositoryInputRun.status, 0);
  assert.match(repositoryInputRun.stderr, /repositori/u);
} finally {
  rmSync(privateTestRoot, { recursive: true, force: true });
}

console.log('REL-11 admin-provisiointi: PASS');
