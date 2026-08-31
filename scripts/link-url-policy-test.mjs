import assert from 'node:assert/strict';

import { evaluateHttpsUrl, HTTPS_ONLY_MESSAGE } from './link-url-policy.mjs';

const https = evaluateHttpsUrl('https://example.com/path');
assert.equal(https.accepted, true);
assert.equal(https.code, 'ok');
assert.equal(https.url.protocol, 'https:');

const http = evaluateHttpsUrl('http://example.com/path');
assert.equal(http.accepted, false);
assert.equal(http.code, 'https_required');
assert.match(http.note, new RegExp(HTTPS_ONLY_MESSAGE));

const ftp = evaluateHttpsUrl('ftp://example.com/file');
assert.equal(ftp.accepted, false);
assert.equal(ftp.code, 'https_required');

const invalid = evaluateHttpsUrl('ei ole url');
assert.equal(invalid.accepted, false);
assert.equal(invalid.code, 'invalid_url');

console.log(JSON.stringify({ status: 'ok', accepted: ['https:'], rejected: ['http:', 'ftp:', 'invalid'] }));
