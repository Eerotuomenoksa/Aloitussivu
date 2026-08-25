import { createHash } from 'node:crypto';
import path from 'node:path';

export const REL08_FORMAT = 'aloitussivu-rel08-firestore-export-v1';

export const FIRESTORE_COLLECTIONS = [
  'linkReports',
  'feedbackItems',
  'feedbackAttachments',
  'testFeedbackResponses',
  'approvedLinks',
  'blockedLinks',
  'scamAlerts',
  'ncscScrapeLog',
  'usageStats',
  'adminStats',
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const MIME_EXTENSIONS = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

const hasExpectedImageSignature = (mediaType, contents) => {
  if (mediaType === 'image/png') return contents.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  if (mediaType === 'image/jpeg') return contents.length >= 3 && contents[0] === 0xff && contents[1] === 0xd8 && contents[2] === 0xff;
  if (mediaType === 'image/gif') return ['GIF87a', 'GIF89a'].includes(contents.subarray(0, 6).toString('ascii'));
  if (mediaType === 'image/webp') {
    return contents.subarray(0, 4).toString('ascii') === 'RIFF' && contents.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
};

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const idHash = (value) => sha256(String(value)).slice(0, 16);

const utf8Hex = (value) => Buffer.from(String(value), 'utf8').toString('hex');
const sqlText = (value) => {
  const encoded = utf8Hex(value);
  return encoded === '' ? `CONVERT(X'' USING utf8mb4)` : `CONVERT(0x${encoded} USING utf8mb4)`;
};
const sqlNullableText = (value) => value === null || value === undefined || value === '' ? 'NULL' : sqlText(value);
const sqlInt = (value) => String(Math.max(0, Math.trunc(Number(value) || 0)));
const sqlBool = (value) => value === true || value === 1 ? '1' : '0';
const sqlBinaryHash = (value) => `UNHEX('${sha256(value)}')`;

const sqlAdminReference = (value) => value
  ? `(SELECT firebase_uid FROM admin_users WHERE firebase_uid = ${sqlText(value)} OR LOWER(email) = LOWER(${sqlText(value)}) LIMIT 1)`
  : 'NULL';

const sqlLinkReportReference = (value) => value
  ? `(SELECT id FROM link_reports WHERE id = ${sqlText(value)} LIMIT 1)`
  : 'NULL';

const upsert = (table, columns, values, immutable = ['id']) => {
  const updates = columns
    .filter((column) => !immutable.includes(column))
    .map((column) => `${column} = VALUES(${column})`)
    .join(', ');
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON DUPLICATE KEY UPDATE ${updates};`;
};

const portableDate = (value) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && value.__rel08Type === 'timestamp') return value.iso;
  return '';
};

const mariaDate = (value, field) => {
  const raw = portableDate(value);
  const parsed = new Date(raw);
  if (!raw || Number.isNaN(parsed.getTime())) throw new Error(`invalid_${field}`);
  const iso = parsed.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 23)}000`;
};

const optionalMariaDate = (value, field) => value ? mariaDate(value, field) : null;

const requiredString = (data, field, max, min = 1) => {
  const value = typeof data[field] === 'string' ? data[field].trim() : '';
  if (value.length < min || value.length > max) throw new Error(`invalid_${field}`);
  return value;
};

const optionalString = (data, field, max) => {
  if (data[field] === undefined || data[field] === null) return null;
  const value = typeof data[field] === 'string' ? data[field].trim() : '';
  if (value.length > max) throw new Error(`invalid_${field}`);
  return value || null;
};

const enumValue = (data, field, allowed, fallback) => {
  const value = data[field] ?? fallback;
  if (!allowed.includes(value)) throw new Error(`invalid_${field}`);
  return value;
};

const documentId = (doc, requireUuid = true) => {
  const value = typeof doc.id === 'string' && doc.id ? doc.id : doc.data?.id;
  if (typeof value !== 'string' || value.length > 36 || (requireUuid && !UUID.test(value))) {
    throw new Error('invalid_document_id');
  }
  if (doc.data?.id !== undefined && doc.data.id !== value) throw new Error('mismatched_document_id');
  return value;
};

export const normalizeHttpsUrl = (value, max = 2048) => {
  if (typeof value !== 'string') throw new Error('invalid_url');
  const raw = value.trim();
  if (!raw || raw.length > max) throw new Error('invalid_url');
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('invalid_url');
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('invalid_url');
  parsed.hash = '';
  const authority = raw.slice(raw.indexOf('://') + 3);
  const hasPath = authority.search(/[/?#]/) >= 0 && authority[authority.search(/[/?#]/)] === '/';
  const path = parsed.pathname === '/' && !hasPath ? '' : parsed.pathname;
  const port = parsed.port === '443' ? '' : parsed.port;
  const normalized = `https://${parsed.hostname.toLowerCase()}${port ? `:${port}` : ''}${path}${parsed.search}`;
  if (normalized.length > max) throw new Error('invalid_url');
  return normalized;
};

const collectionDocs = (payload, name) => {
  const docs = payload.collections?.[name];
  if (!Array.isArray(docs)) throw new Error(`missing_collection_${name}`);
  return docs;
};

const sourceCounts = (payload) => Object.fromEntries(
  FIRESTORE_COLLECTIONS.map((name) => [name, collectionDocs(payload, name).length]),
);

const sampleHashes = (rows, key = 'id') => rows
  .slice()
  .sort((a, b) => String(a[key]).localeCompare(String(b[key])))
  .slice(0, 5)
  .map((row) => idHash(row[key]));

const temporalRange = (rows, fields) => {
  const values = rows.flatMap((row) => fields.map((field) => row[field]).filter(Boolean)).sort();
  return { first: values[0] ?? null, last: values.at(-1) ?? null };
};

const createModel = () => ({
  linkReports: [],
  feedbackItems: [],
  feedbackAttachments: [],
  testFeedbackResponses: [],
  approvedLinks: [],
  blockedLinks: [],
  scamAlerts: [],
  ncscScrapeLogs: [],
  usageDaily: [],
  usagePages: [],
  usageLinks: [],
});

const pushDocuments = (payload, collection, target, mapper, exceptions) => {
  for (const doc of collectionDocs(payload, collection)) {
    try {
      target.push(mapper(doc));
    } catch (error) {
      exceptions.push({
        collection,
        documentIdHash: idHash(doc?.id ?? 'missing'),
        code: error instanceof Error ? error.message : 'unknown_error',
      });
    }
  }
};

const buildModel = (payload) => {
  const model = createModel();
  const exceptions = [];

  pushDocuments(payload, 'linkReports', model.linkReports, (doc) => {
    const data = doc.data ?? {};
    const createdAt = mariaDate(data.createdAt, 'createdAt');
    return {
      id: documentId(doc),
      type: enumValue(data, 'type', ['new', 'broken', 'wrong']),
      name: requiredString(data, 'name', 160),
      url: normalizeHttpsUrl(data.url, 500),
      category: optionalString(data, 'category', 255),
      source: optionalString(data, 'source', 255),
      note: requiredString(data, 'note', 1000, 0),
      status: enumValue(data, 'status', ['pending', 'approved', 'rejected'], 'pending'),
      reviewReason: optionalString(data, 'reviewReason', 65535),
      createdAt,
      updatedAt: data.updatedAt ? mariaDate(data.updatedAt, 'updatedAt') : createdAt,
      reviewedAt: optionalMariaDate(data.reviewedAt, 'reviewedAt'),
      reviewedBy: optionalString(data, 'reviewedBy', 128),
      approvedLinkId: optionalString(data, 'approvedLinkId', 36),
    };
  }, exceptions);

  pushDocuments(payload, 'feedbackItems', model.feedbackItems, (doc) => {
    const data = doc.data ?? {};
    const createdAt = mariaDate(data.createdAt, 'createdAt');
    return {
      id: documentId(doc),
      type: enumValue(data, 'type', ['bug', 'content', 'link', 'accessibility', 'idea', 'other']),
      title: requiredString(data, 'title', 140, 3),
      description: requiredString(data, 'description', 1600, 5),
      page: requiredString(data, 'page', 120, 0),
      status: enumValue(data, 'status', ['new', 'triage', 'planned', 'in_progress', 'done', 'rejected'], 'new'),
      publicNote: requiredString(data, 'publicNote', 65535, 0),
      client: data.client && typeof data.client === 'object' && !Array.isArray(data.client) ? data.client : null,
      hasScreenshot: data.hasScreenshot === true,
      createdAt,
      updatedAt: data.updatedAt ? mariaDate(data.updatedAt, 'updatedAt') : createdAt,
      handledAt: optionalMariaDate(data.handledAt, 'handledAt'),
      handledBy: optionalString(data, 'handledBy', 128),
    };
  }, exceptions);

  pushDocuments(payload, 'feedbackAttachments', model.feedbackAttachments, (doc) => {
    const data = doc.data ?? {};
    const id = documentId(doc);
    const feedbackId = typeof data.feedbackId === 'string' ? data.feedbackId : id;
    if (!UUID.test(feedbackId)) throw new Error('invalid_feedbackId');
    const screenshot = data.screenshot;
    if (!screenshot || typeof screenshot !== 'object') throw new Error('invalid_screenshot');
    const mediaType = requiredString(screenshot, 'type', 100);
    const extension = MIME_EXTENSIONS.get(mediaType);
    if (!extension) throw new Error('invalid_attachment_type');
    const match = typeof screenshot.dataUrl === 'string'
      ? screenshot.dataUrl.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/)
      : null;
    if (!match) throw new Error('invalid_attachment_data');
    const contents = Buffer.from(match[2], 'base64');
    const declaredSize = Number(screenshot.size);
    if (!contents.length || contents.length > 460800 || declaredSize !== contents.length) throw new Error('invalid_attachment_size');
    if (!hasExpectedImageSignature(mediaType, contents)) throw new Error('invalid_attachment_signature');
    const createdAt = mariaDate(data.createdAt, 'createdAt');
    const digest = sha256(contents);
    const yearMonth = createdAt.slice(0, 7).replace('-', '/');
    return {
      id,
      feedbackId,
      originalName: requiredString(screenshot, 'name', 255),
      mediaType,
      byteSize: contents.length,
      sha256: digest,
      storageKey: `${yearMonth}/${feedbackId}-${digest.slice(0, 12)}.${extension}`,
      createdAt,
      contents,
    };
  }, exceptions);

  pushDocuments(payload, 'testFeedbackResponses', model.testFeedbackResponses, (doc) => {
    const data = doc.data ?? {};
    const id = documentId(doc);
    const formVersion = requiredString(data, 'formVersion', 80);
    const createdAt = mariaDate(data.createdAt, 'createdAt');
    const response = { ...data };
    delete response.id;
    delete response.formVersion;
    delete response.createdAt;
    return { id, formVersion, response, createdAt };
  }, exceptions);

  pushDocuments(payload, 'approvedLinks', model.approvedLinks, (doc) => {
    const data = doc.data ?? {};
    const createdAt = mariaDate(data.createdAt, 'createdAt');
    return {
      id: documentId(doc),
      name: requiredString(data, 'name', 160),
      url: normalizeHttpsUrl(data.url),
      category: requiredString(data, 'category', 255),
      source: requiredString(data, 'source', 255),
      note: optionalString(data, 'note', 65535),
      createdFromReportId: optionalString(data, 'createdFromReportId', 36),
      createdAt,
      updatedAt: data.updatedAt ? mariaDate(data.updatedAt, 'updatedAt') : createdAt,
    };
  }, exceptions);

  pushDocuments(payload, 'blockedLinks', model.blockedLinks, (doc) => {
    const data = doc.data ?? {};
    return {
      id: documentId(doc),
      url: normalizeHttpsUrl(data.url),
      reason: optionalString(data, 'reason', 1000),
      createdAt: mariaDate(data.createdAt, 'createdAt'),
      createdBy: optionalString(data, 'createdBy', 128),
    };
  }, exceptions);

  pushDocuments(payload, 'scamAlerts', model.scamAlerts, (doc) => {
    const data = doc.data ?? {};
    const createdAt = mariaDate(data.createdAt, 'createdAt');
    return {
      id: documentId(doc),
      title: requiredString(data, 'title', 500),
      body: requiredString(data, 'body', 65535),
      severity: enumValue(data, 'severity', ['info', 'warning', 'danger']),
      active: data.active === true,
      source: optionalString(data, 'source', 255),
      sourceUrl: data.sourceUrl ? normalizeHttpsUrl(data.sourceUrl) : null,
      sourceWeek: optionalString(data, 'sourceWeek', 100),
      originalHeading: optionalString(data, 'originalHeading', 500),
      structureVersion: data.structureVersion
        ? enumValue(data, 'structureVersion', ['2026', '2025', 'news', 'unknown'])
        : null,
      createdAt,
      updatedAt: data.updatedAt ? mariaDate(data.updatedAt, 'updatedAt') : createdAt,
      expiresAt: mariaDate(data.expiresAt, 'expiresAt'),
    };
  }, exceptions);

  pushDocuments(payload, 'ncscScrapeLog', model.ncscScrapeLogs, (doc) => {
    const data = doc.data ?? {};
    return {
      id: documentId(doc, false),
      sourceUrl: requiredString(data, 'url', 2048),
      weekLabel: requiredString(data, 'weekLabel', 100),
      publishedAt: optionalMariaDate(data.publishedAt, 'publishedAt'),
      processedAt: mariaDate(data.processedAt, 'processedAt'),
      alertsCreated: Math.max(0, Math.trunc(Number(data.alertsCreated) || 0)),
      structureVersion: enumValue(data, 'structureVersion', ['2026', '2025', 'news', 'unknown']),
      message: optionalString(data, 'message', 1000),
    };
  }, exceptions);

  pushDocuments(payload, 'usageStats', model.usageDaily, (doc) => {
    const data = doc.data ?? {};
    const date = typeof data.date === 'string' ? data.date : doc.id;
    if (!DATE_KEY.test(date)) throw new Error('invalid_usage_date');
    const pages = data.pageviews && typeof data.pageviews === 'object' ? data.pageviews : {};
    const links = data.linkClicks && typeof data.linkClicks === 'object' ? data.linkClicks : {};
    for (const item of Object.values(pages)) {
      if (!item || typeof item !== 'object') throw new Error('invalid_pageview');
      const page = requiredString(item, 'page', 180);
      model.usagePages.push({ date, page, count: Math.max(0, Math.trunc(Number(item.count) || 0)) });
    }
    for (const item of Object.values(links)) {
      if (!item || typeof item !== 'object') throw new Error('invalid_link_click');
      model.usageLinks.push({
        date,
        url: requiredString(item, 'url', 2048),
        label: requiredString(item, 'label', 180, 0),
        category: requiredString(item, 'category', 180, 0),
        page: requiredString(item, 'page', 180),
        count: Math.max(0, Math.trunc(Number(item.count) || 0)),
      });
    }
    return {
      date,
      totalPageviews: Math.max(0, Math.trunc(Number(data.totalPageviews) || 0)),
      totalLinkClicks: Math.max(0, Math.trunc(Number(data.totalLinkClicks) || 0)),
    };
  }, exceptions);

  const feedbackIds = new Set(model.feedbackItems.map((item) => item.id));
  const attachmentFeedbackIds = new Set(model.feedbackAttachments.map((item) => item.feedbackId));
  for (const attachment of model.feedbackAttachments) {
    if (!feedbackIds.has(attachment.feedbackId)) {
      exceptions.push({ collection: 'feedbackAttachments', documentIdHash: idHash(attachment.id), code: 'missing_feedback_parent' });
    }
  }
  for (const feedback of model.feedbackItems) {
    if (feedback.hasScreenshot && !attachmentFeedbackIds.has(feedback.id)) {
      exceptions.push({ collection: 'feedbackItems', documentIdHash: idHash(feedback.id), code: 'missing_attachment' });
    }
    feedback.hasScreenshot = attachmentFeedbackIds.has(feedback.id);
  }

  return { model, exceptions };
};

const buildSql = (model, metadata) => {
  const statements = [
    '-- Aloitussivu REL-08 Firestore -> MariaDB staging import',
    `-- Export SHA-256: ${metadata.exportSha256}`,
    `-- Generated at: ${metadata.generatedAt}`,
    'SET NAMES utf8mb4;',
    "SET time_zone = '+00:00';",
    'START TRANSACTION;',
  ];

  for (const item of model.linkReports) statements.push(upsert('link_reports', [
    'id', 'type', 'name', 'url', 'url_hash', 'category', 'source', 'note', 'status', 'review_reason',
    'created_at', 'updated_at', 'reviewed_at', 'reviewed_by', 'approved_link_id',
  ], [
    sqlText(item.id), sqlText(item.type), sqlText(item.name), sqlText(item.url), sqlBinaryHash(item.url),
    sqlNullableText(item.category), sqlNullableText(item.source), sqlText(item.note), sqlText(item.status),
    sqlNullableText(item.reviewReason), sqlText(item.createdAt), sqlText(item.updatedAt), sqlNullableText(item.reviewedAt),
    sqlAdminReference(item.reviewedBy), sqlNullableText(item.approvedLinkId),
  ]));

  for (const item of model.feedbackItems) statements.push(upsert('feedback_items', [
    'id', 'type', 'title', 'description', 'page', 'status', 'public_note', 'client_json', 'has_screenshot',
    'created_at', 'updated_at', 'handled_at', 'handled_by',
  ], [
    sqlText(item.id), sqlText(item.type), sqlText(item.title), sqlText(item.description), sqlText(item.page),
    sqlText(item.status), sqlText(item.publicNote), item.client ? sqlText(JSON.stringify(item.client)) : 'NULL',
    sqlBool(item.hasScreenshot), sqlText(item.createdAt), sqlText(item.updatedAt), sqlNullableText(item.handledAt),
    sqlAdminReference(item.handledBy),
  ]));

  for (const item of model.testFeedbackResponses) statements.push(upsert('test_feedback_responses', [
    'id', 'form_version', 'response_json', 'created_at',
  ], [sqlText(item.id), sqlText(item.formVersion), sqlText(JSON.stringify(item.response)), sqlText(item.createdAt)]));

  for (const item of model.approvedLinks) statements.push(upsert('approved_links', [
    'id', 'name', 'url', 'url_hash', 'category', 'source', 'note', 'created_from_report_id', 'created_at', 'updated_at',
  ], [
    sqlText(item.id), sqlText(item.name), sqlText(item.url), sqlBinaryHash(item.url), sqlText(item.category),
    sqlText(item.source), sqlNullableText(item.note), sqlLinkReportReference(item.createdFromReportId),
    sqlText(item.createdAt), sqlText(item.updatedAt),
  ]));

  for (const item of model.blockedLinks) statements.push(upsert('blocked_links', [
    'id', 'url', 'url_hash', 'reason', 'created_at', 'created_by',
  ], [
    sqlText(item.id), sqlText(item.url), sqlBinaryHash(item.url), sqlNullableText(item.reason),
    sqlText(item.createdAt), sqlAdminReference(item.createdBy),
  ]));

  for (const item of model.scamAlerts) statements.push(upsert('scam_alerts', [
    'id', 'title', 'body', 'severity', 'active', 'source', 'source_url', 'source_week', 'original_heading',
    'structure_version', 'created_at', 'updated_at', 'expires_at',
  ], [
    sqlText(item.id), sqlText(item.title), sqlText(item.body), sqlText(item.severity), sqlBool(item.active),
    sqlNullableText(item.source), sqlNullableText(item.sourceUrl), sqlNullableText(item.sourceWeek),
    sqlNullableText(item.originalHeading), sqlNullableText(item.structureVersion), sqlText(item.createdAt),
    sqlText(item.updatedAt), sqlText(item.expiresAt),
  ]));

  for (const item of model.ncscScrapeLogs) statements.push(upsert('ncsc_scrape_logs', [
    'id', 'source_url', 'week_label', 'published_at', 'processed_at', 'alerts_created', 'structure_version', 'message',
  ], [
    sqlText(item.id), sqlText(item.sourceUrl), sqlText(item.weekLabel), sqlNullableText(item.publishedAt),
    sqlText(item.processedAt), sqlInt(item.alertsCreated), sqlText(item.structureVersion), sqlNullableText(item.message),
  ]));

  for (const item of model.usageDaily) statements.push(upsert('usage_daily', [
    'usage_date', 'total_pageviews', 'total_link_clicks',
  ], [sqlText(item.date), sqlInt(item.totalPageviews), sqlInt(item.totalLinkClicks)], ['usage_date']));

  for (const item of model.usagePages) statements.push(upsert('usage_page_daily', [
    'usage_date', 'page_hash', 'page', 'count',
  ], [sqlText(item.date), sqlBinaryHash(item.page), sqlText(item.page), sqlInt(item.count)], ['usage_date', 'page_hash']));

  for (const item of model.usageLinks) statements.push(upsert('usage_link_daily', [
    'usage_date', 'link_hash', 'url', 'label', 'category', 'page', 'count',
  ], [
    sqlText(item.date), sqlBinaryHash(item.url), sqlText(item.url), sqlText(item.label), sqlText(item.category),
    sqlText(item.page), sqlInt(item.count),
  ], ['usage_date', 'link_hash']));

  for (const item of model.feedbackAttachments) statements.push(upsert('feedback_attachments', [
    'id', 'feedback_id', 'storage_key', 'original_name', 'media_type', 'byte_size', 'sha256', 'created_at',
  ], [
    sqlText(item.id), sqlText(item.feedbackId), sqlText(item.storageKey), sqlText(item.originalName),
    sqlText(item.mediaType), sqlInt(item.byteSize), `UNHEX('${item.sha256}')`, sqlText(item.createdAt),
  ]));

  statements.push('COMMIT;', '');
  return statements.join('\n');
};

const TABLE_REPORTS = [
  ['link_reports', 'linkReports'],
  ['feedback_items', 'feedbackItems'],
  ['feedback_attachments', 'feedbackAttachments'],
  ['test_feedback_responses', 'testFeedbackResponses'],
  ['approved_links', 'approvedLinks'],
  ['blocked_links', 'blockedLinks'],
  ['scam_alerts', 'scamAlerts'],
  ['ncsc_scrape_logs', 'ncscScrapeLogs'],
  ['usage_daily', 'usageDaily'],
  ['usage_page_daily', 'usagePages'],
  ['usage_link_daily', 'usageLinks'],
];

const buildVerificationSql = (model) => {
  const lines = [
    '-- REL-08 count and time-range verification (contains no content fields)',
    "SET time_zone = '+00:00';",
  ];
  for (const [table] of TABLE_REPORTS) {
    lines.push(`SELECT '${table}' AS table_name, COUNT(*) AS row_count FROM ${table};`);
  }
  lines.push(
    "SELECT 'link_reports' AS table_name, MIN(created_at) AS first_at, MAX(updated_at) AS last_at FROM link_reports;",
    "SELECT 'feedback_items' AS table_name, MIN(created_at) AS first_at, MAX(updated_at) AS last_at FROM feedback_items;",
    "SELECT 'test_feedback_responses' AS table_name, MIN(created_at) AS first_at, MAX(created_at) AS last_at FROM test_feedback_responses;",
    "SELECT 'approved_links' AS table_name, MIN(created_at) AS first_at, MAX(updated_at) AS last_at FROM approved_links;",
    "SELECT 'blocked_links' AS table_name, MIN(created_at) AS first_at, MAX(created_at) AS last_at FROM blocked_links;",
    "SELECT 'scam_alerts' AS table_name, MIN(created_at) AS first_at, MAX(updated_at) AS last_at FROM scam_alerts;",
    "SELECT 'ncsc_scrape_logs' AS table_name, MIN(processed_at) AS first_at, MAX(processed_at) AS last_at FROM ncsc_scrape_logs;",
    "SELECT 'usage_daily' AS table_name, MIN(usage_date) AS first_at, MAX(usage_date) AS last_at FROM usage_daily;",
  );
  for (const [table, modelKey] of TABLE_REPORTS.slice(0, 8)) {
    const hashes = sampleHashes(model[modelKey]);
    if (hashes.length) {
      lines.push(`SELECT '${table}' AS table_name, LEFT(SHA2(id, 256), 16) AS id_hash FROM ${table} WHERE LEFT(SHA2(id, 256), 16) IN (${hashes.map((hash) => `'${hash}'`).join(', ')});`);
    }
  }
  const usageHashes = sampleHashes(model.usageDaily, 'date');
  if (usageHashes.length) {
    lines.push(`SELECT 'usage_daily' AS table_name, LEFT(SHA2(usage_date, 256), 16) AS id_hash FROM usage_daily WHERE LEFT(SHA2(usage_date, 256), 16) IN (${usageHashes.map((hash) => `'${hash}'`).join(', ')});`);
  }
  lines.push('');
  return lines.join('\n');
};

export const buildMigration = (payload) => {
  if (!payload || payload.format !== REL08_FORMAT || typeof payload.projectId !== 'string') {
    throw new Error('invalid_export_format');
  }
  const exportSha256 = sha256(JSON.stringify(payload));
  const { model, exceptions } = buildModel(payload);
  const generatedAt = new Date().toISOString();
  const report = {
    format: 'aloitussivu-rel08-reconciliation-v1',
    projectId: payload.projectId,
    exportSha256,
    exportedAt: payload.exportedAt,
    deltaSince: payload.deltaSince ?? null,
    generatedAt,
    sourceCounts: sourceCounts(payload),
    transformedCounts: Object.fromEntries(TABLE_REPORTS.map(([table, key]) => [table, model[key].length])),
    sampleIdHashes: {
      ...Object.fromEntries(TABLE_REPORTS.slice(0, 8).map(([table, key]) => [table, sampleHashes(model[key])])),
      usage_daily: sampleHashes(model.usageDaily, 'date'),
    },
    ranges: {
      link_reports: temporalRange(model.linkReports, ['createdAt', 'updatedAt']),
      feedback_items: temporalRange(model.feedbackItems, ['createdAt', 'updatedAt']),
      test_feedback_responses: temporalRange(model.testFeedbackResponses, ['createdAt']),
      approved_links: temporalRange(model.approvedLinks, ['createdAt', 'updatedAt']),
      blocked_links: temporalRange(model.blockedLinks, ['createdAt']),
      scam_alerts: temporalRange(model.scamAlerts, ['createdAt', 'updatedAt']),
      ncsc_scrape_logs: temporalRange(model.ncscScrapeLogs, ['processedAt']),
      usage_daily: temporalRange(model.usageDaily, ['date']),
    },
    archivedOnly: { adminStats: collectionDocs(payload, 'adminStats').length },
    exceptionCount: exceptions.length,
  };
  return {
    model,
    exceptions,
    report,
    sql: exceptions.length ? null : buildSql(model, { exportSha256, generatedAt }),
    verificationSql: exceptions.length ? null : buildVerificationSql(model),
  };
};

export const isInside = (candidate, parent) => {
  const normalizeCase = (value) => process.platform === 'win32' ? value.toLowerCase() : value;
  const relative = path.relative(normalizeCase(path.resolve(parent)), normalizeCase(path.resolve(candidate)));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

export const hashIdForReport = idHash;
