import { createHash } from 'node:crypto';

export const ADMIN_PROJECT_ID = 'aloitussivu-5d50c';
export const ADMIN_ENVIRONMENT = 'production';
export const ADMIN_ROLES = ['admin', 'editor', 'viewer'];

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const sqlText = (value) => {
  const encoded = Buffer.from(value, 'utf8').toString('hex');
  return `CONVERT(0x${encoded} USING utf8mb4)`;
};

const requiredText = (value, field, maxLength) => {
  if (typeof value !== 'string') throw new Error(`invalid_${field}`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength || CONTROL_CHARACTERS.test(normalized)) {
    throw new Error(`invalid_${field}`);
  }
  return normalized;
};

const normalizeAdmin = (value, index) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`invalid_admin_${index + 1}`);
  }

  const firebaseUid = requiredText(value.firebaseUid, `firebase_uid_${index + 1}`, 128);
  const email = requiredText(value.email, `email_${index + 1}`, 320).toLowerCase();
  const role = requiredText(value.role, `role_${index + 1}`, 16);

  if (firebaseUid.startsWith('REPLACE_')) throw new Error(`placeholder_firebase_uid_${index + 1}`);
  if (!EMAIL.test(email) || email.endsWith('.invalid')) throw new Error(`invalid_email_${index + 1}`);
  if (!ADMIN_ROLES.includes(role)) throw new Error(`invalid_role_${index + 1}`);
  if (typeof value.active !== 'boolean') throw new Error(`invalid_active_${index + 1}`);

  return { firebaseUid, email, role, active: value.active };
};

const assertUnique = (admins, key, errorCode) => {
  const values = new Set();
  for (const admin of admins) {
    const value = admin[key].toLowerCase();
    if (values.has(value)) throw new Error(errorCode);
    values.add(value);
  }
};

export const normalizeAdminProvisioning = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('invalid_payload');
  }
  if (payload.projectId !== ADMIN_PROJECT_ID) throw new Error('invalid_project_id');
  if (payload.environment !== ADMIN_ENVIRONMENT) throw new Error('invalid_environment');
  if (!Array.isArray(payload.admins) || payload.admins.length < 1 || payload.admins.length > 20) {
    throw new Error('invalid_admin_count');
  }

  const admins = payload.admins.map(normalizeAdmin);
  assertUnique(admins, 'firebaseUid', 'duplicate_firebase_uid');
  assertUnique(admins, 'email', 'duplicate_email');
  return { projectId: ADMIN_PROJECT_ID, environment: ADMIN_ENVIRONMENT, admins };
};

const countBy = (values, key, expectedValues) => Object.fromEntries(
  expectedValues.map((expected) => [expected, values.filter((value) => value[key] === expected).length]),
);

export const buildAdminProvisioning = (payload) => {
  const normalized = normalizeAdminProvisioning(payload);
  const inserts = normalized.admins.map((admin) => {
    const uid = sqlText(admin.firebaseUid);
    const email = sqlText(admin.email);
    return [
      'INSERT INTO admin_users (firebase_uid, email, role, active)',
      `SELECT ${uid}, ${email}, '${admin.role}', ${admin.active ? 1 : 0}`,
      'FROM DUAL',
      'WHERE NOT EXISTS (',
      '  SELECT 1 FROM admin_users',
      `  WHERE email = ${email} AND firebase_uid <> ${uid}`,
      ')',
      'ON DUPLICATE KEY UPDATE',
      '  email = VALUES(email),',
      '  role = VALUES(role),',
      '  active = VALUES(active);',
    ].join('\n');
  });

  const sql = [
    '-- Yksityinen tuotantoaineisto. Ei Git-repositorioon tai keskusteluun.',
    '-- Eri UID:lle kuuluva sähköpostiosuma jättää kyseisen rivin muuttamatta.',
    '-- Aja preflight ensin ja verify aina tämän tiedoston jälkeen.',
    'SET NAMES utf8mb4;',
    "SET time_zone = '+00:00';",
    'START TRANSACTION;',
    ...inserts,
    'COMMIT;',
    '',
  ].join('\n\n');

  const uidList = normalized.admins.map((admin) => sqlText(admin.firebaseUid)).join(', ');
  const conflicts = normalized.admins.map((admin) => (
    `(email = ${sqlText(admin.email)} AND firebase_uid <> ${sqlText(admin.firebaseUid)})`
  )).join('\n  OR ');
  const exactMatches = normalized.admins.map((admin) => [
    `(firebase_uid = ${sqlText(admin.firebaseUid)}`,
    ` AND email = ${sqlText(admin.email)}`,
    ` AND role = '${admin.role}'`,
    ` AND active = ${admin.active ? 1 : 0})`,
  ].join('')).join('\n  OR ');
  const preflightSql = [
    '-- Henkilötiedoton ennakkotarkistus: tuloksen pitää olla 0.',
    "SET time_zone = '+00:00';",
    '',
    'SELECT COUNT(*) AS conflicting_email_assignments',
    'FROM admin_users',
    `WHERE ${conflicts};`,
    '',
  ].join('\n');
  const verificationSql = [
    '-- Henkilötiedoton tarkistus: tulos näyttää vain lukumäärät.',
    "SET time_zone = '+00:00';",
    '',
    'SELECT role, active, COUNT(*) AS account_count',
    'FROM admin_users',
    'GROUP BY role, active',
    'ORDER BY role, active DESC;',
    '',
    `SELECT COUNT(*) AS expected_accounts_found FROM admin_users WHERE firebase_uid IN (${uidList});`,
    '',
    'SELECT COUNT(*) AS expected_accounts_matching',
    'FROM admin_users',
    `WHERE ${exactMatches};`,
    '',
  ].join('\n');

  const summary = {
    projectId: normalized.projectId,
    environment: normalized.environment,
    adminCount: normalized.admins.length,
    roleCounts: countBy(normalized.admins, 'role', ADMIN_ROLES),
    activeCounts: {
      active: normalized.admins.filter((admin) => admin.active).length,
      inactive: normalized.admins.filter((admin) => !admin.active).length,
    },
    preflightSqlSha256: sha256(preflightSql),
    provisionSqlSha256: sha256(sql),
  };

  return { preflightSql, sql, verificationSql, summary };
};
