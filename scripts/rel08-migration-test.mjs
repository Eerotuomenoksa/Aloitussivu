import assert from 'node:assert/strict';
import { buildMigration, FIRESTORE_COLLECTIONS, normalizeHttpsUrl, REL08_FORMAT } from './rel08-migration-lib.mjs';

const ids = {
  report: '11111111-1111-4111-8111-111111111111',
  feedback: '22222222-2222-4222-8222-222222222222',
  test: '33333333-3333-4333-8333-333333333333',
  approved: '44444444-4444-4444-8444-444444444444',
  blocked: '55555555-5555-4555-8555-555555555555',
  alert: '66666666-6666-4666-8666-666666666666',
  log: '77777777-7777-4777-8777-777777777777',
};
const now = '2026-08-24T09:00:00.000Z';
const png = Buffer.from('89504e470d0a1a0a00000000', 'hex');

const emptyCollections = () => Object.fromEntries(FIRESTORE_COLLECTIONS.map((name) => [name, []]));
const collections = emptyCollections();
collections.linkReports.push({ id: ids.report, data: {
  id: ids.report, type: 'new', name: 'Esimerkki', url: 'https://Example.com', category: 'Testi', source: 'lomake',
  note: '', status: 'pending', createdAt: now, updatedAt: now,
} });
collections.feedbackItems.push({ id: ids.feedback, data: {
  id: ids.feedback, type: 'bug', title: 'Testipalaute', description: 'Kuvaus testiin', page: 'index',
  status: 'new', publicNote: '', client: { deviceType: 'desktop' }, hasScreenshot: true,
  createdAt: now, updatedAt: now,
} });
collections.feedbackAttachments.push({ id: ids.feedback, data: {
  id: ids.feedback, feedbackId: ids.feedback, createdAt: now,
  screenshot: { name: 'kuva.png', type: 'image/png', size: png.length, dataUrl: `data:image/png;base64,${png.toString('base64')}` },
} });
collections.testFeedbackResponses.push({ id: ids.test, data: {
  id: ids.test, formVersion: '2026-08-release-candidate', createdAt: now, deviceTypes: ['computer'],
  usefulnessRating: 5, easeRating: 4, mostImportantFix: 'Ei korjattavaa',
} });
collections.approvedLinks.push({ id: ids.approved, data: {
  id: ids.approved, name: 'Hyväksytty', url: 'https://example.org/path#fragment', category: 'Testi', source: 'ylläpito',
  note: 'Huomio', createdFromReportId: ids.report, createdAt: now, updatedAt: now,
} });
collections.blockedLinks.push({ id: ids.blocked, data: {
  id: ids.blocked, url: 'https://blocked.example/path', reason: 'Testi', createdAt: now,
} });
collections.scamAlerts.push({ id: ids.alert, data: {
  id: ids.alert, title: 'Varoitus', body: 'Varoituksen sisältö', severity: 'warning', active: true,
  source: 'ncsc-auto', sourceUrl: 'https://example.fi/news', sourceWeek: '34/2026', originalHeading: 'Alkuperäinen',
  structureVersion: '2026', createdAt: now, updatedAt: now, expiresAt: '2026-09-24T09:00:00.000Z',
} });
collections.ncscScrapeLog.push({ id: ids.log, data: {
  url: 'https://example.fi/news', weekLabel: '34/2026', processedAt: now, alertsCreated: 1, structureVersion: '2026',
} });
collections.usageStats.push({ id: '2026-08-24', data: {
  date: '2026-08-24', totalPageviews: 3, totalLinkClicks: 2,
  pageviews: { one: { count: 3, page: 'index' } },
  linkClicks: { two: { count: 2, url: 'https://example.org', label: 'Esimerkki', category: 'Testi', page: 'index' } },
} });
collections.adminStats.push({ id: 'namedayApi', data: { totalRequests: 2, updatedAt: now } });

const payload = { format: REL08_FORMAT, projectId: 'test-project', exportedAt: now, deltaSince: null, collections };
const migration = buildMigration(payload);

assert.deepEqual(migration.exceptions, []);
assert.ok(migration.sql?.includes('START TRANSACTION;'));
assert.ok(migration.sql?.includes('COMMIT;'));
assert.ok(migration.sql?.includes(`CONVERT(X'' USING utf8mb4)`));
assert.ok(!migration.sql?.includes('CONVERT(0x USING utf8mb4)'));
assert.equal((migration.sql?.match(/ON DUPLICATE KEY UPDATE/g) ?? []).length, 11);
assert.equal(migration.model.feedbackAttachments.length, 1);
assert.match(migration.model.feedbackAttachments[0].storageKey, /^2026\/08\/[0-9a-f-]{36}-[0-9a-f]{12}\.png$/);
assert.equal(migration.report.archivedOnly.adminStats, 1);
assert.equal(migration.report.exceptionCount, 0);
assert.ok(migration.verificationSql?.includes('LEFT(SHA2(id, 256), 16)'));
assert.equal(normalizeHttpsUrl('https://Example.com:443'), 'https://example.com');
assert.equal(normalizeHttpsUrl('https://Example.com/path#fragment'), 'https://example.com/path');

const invalidPayload = structuredClone(payload);
invalidPayload.collections.feedbackAttachments[0].data.screenshot.dataUrl = 'data:image/png;base64,ZmFrZQ==';
invalidPayload.collections.feedbackAttachments[0].data.screenshot.size = 4;
const invalid = buildMigration(invalidPayload);
assert.equal(invalid.sql, null);
assert.ok(invalid.exceptions.some((item) => item.code === 'invalid_attachment_signature'));
assert.ok(invalid.exceptions.every((item) => !('documentId' in item)));

console.log('REL-08 migration tests: OK');
