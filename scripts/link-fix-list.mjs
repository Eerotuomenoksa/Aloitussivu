// Muodostaa korjauslistan mittausajon tuloksista (.tmp/link-benchmark.ndjson).
// Ryhmittelee havainnot lähdetiedoston ja toimenpiteen mukaan, jotta korjaukset
// voi tehdä tiedosto kerrallaan.
//
//   node scripts/link-check-benchmark.mjs     # aja ensin mittaus
//   node scripts/link-fix-list.mjs            # sitten tämä

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date().toISOString().slice(0, 10);

// Tunnetut verkkotunnusten myynti- ja parkkipalvelut.
const FOR_SALE = /(^|\.)(sedo\.com|dan\.com|afternic\.com|hugedomains\.com|bodis\.com|parkingcrew\.net|catcha\.fi)$/i;
const FOR_SALE_PATH = /\/verkkotunnukset\/|utm_medium=Parking|sales_lander/i;

const registered = (hostname) => {
  const parts = String(hostname).toLowerCase().replace(/\.$/, '').split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const lastTwo = parts.slice(-2).join('.');
  const twoLevel = new Set(['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au', 'org.au', 'co.nz']);
  return twoLevel.has(lastTwo) ? parts.slice(-3).join('.') : lastTwo;
};

const hostOf = (url) => {
  try { return new URL(url).hostname; } catch { return ''; }
};

const classify = (row) => {
  const finalHost = hostOf(row.finalUrl);
  if (row.finalUrl && (FOR_SALE.test(registered(finalHost)) || FOR_SALE_PATH.test(row.finalUrl))) {
    return { action: 'POISTA HETI', reason: 'Osoite ohjaa verkkotunnusten kauppapaikkaan', priority: 1 };
  }
  if (row.code === 'enotfound' || row.code === 'eai_again') {
    return { action: 'poista', reason: 'Verkkotunnus ei enää ratkea — vapautunut ja ostettavissa', priority: 2 };
  }
  if (row.httpStatus === 404 && row.status === 'failed') {
    return { action: 'korjaa osoite', reason: 'Sivu on poistunut tai siirtynyt (404)', priority: 3 };
  }
  if (row.code === 'https_available') {
    return { action: 'päivitä HTTPS', reason: 'HTTPS-versio toimii — vaihda osoite, linkki palaa käyttäjille', priority: 4 };
  }
  if (row.code === 'https_required') {
    return { action: 'poista tai korvaa', reason: 'Vain http, eikä HTTPS-versiota ole — ei näy käyttäjälle', priority: 5 };
  }
  if (row.domainChanged) {
    return { action: 'päivitä ohjaus', reason: 'Ohjautuu toiseen verkkotunnukseen — päivitä suoraksi', priority: 6 };
  }
  if (row.contentFlag === 'soft_404' || row.contentFlag === 'parked_domain') {
    return { action: 'korjaa osoite', reason: `Sisältöhuomio: ${row.contentFlag}`, priority: 3 };
  }
  if (row.status === 'failed') {
    return { action: 'tarkista käsin', reason: `Tekninen virhe: ${row.code}`, priority: 7 };
  }
  if (row.contentFlag) {
    return { action: 'tarkista käsin', reason: `Sisältöhuomio: ${row.contentFlag}`, priority: 8 };
  }
  return null;
};

const csvEscape = (value) => `"${String(value ?? '').replace(/\s+/g, ' ').trim().replace(/"/g, '""')}"`;

const main = async () => {
  const raw = await readFile(resolve(root, '.tmp', 'link-benchmark.ndjson'), 'utf8');
  const rows = raw.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));

  const items = [];
  for (const row of rows) {
    const verdict = classify(row);
    if (verdict) items.push({ ...row, ...verdict });
  }
  items.sort((a, b) => a.priority - b.priority
    || a.source.localeCompare(b.source, 'fi')
    || a.url.localeCompare(b.url, 'fi'));

  const header = ['Prioriteetti', 'Toimenpide', 'Peruste', 'Lähdetiedosto', 'Nimi sovelluksessa', 'Nykyinen URL', 'Ehdotettu URL', 'HTTP', 'Virhekoodi'];
  const csv = items.map((item) => [
    item.priority,
    item.action,
    item.reason,
    item.source,
    item.name,
    item.url,
    item.code === 'https_available' ? item.url.replace(/^http:/i, 'https:') : (item.domainChanged ? item.finalUrl : ''),
    item.httpStatus ?? '',
    item.code ?? '',
  ].map(csvEscape).join(','));
  await writeFile(resolve(root, 'docs', `linkit-korjattavat-${today}.csv`), `${header.map(csvEscape).join(',')}\n${csv.join('\n')}\n`, 'utf8');

  // Markdown-yhteenveto lähdetiedostoittain
  const bySource = new Map();
  for (const item of items) {
    if (!bySource.has(item.source)) bySource.set(item.source, []);
    bySource.get(item.source).push(item);
  }
  const byAction = new Map();
  for (const item of items) byAction.set(item.action, (byAction.get(item.action) ?? 0) + 1);

  const md = [
    `# Korjattavat linkit ${today}`,
    '',
    `Muodostettu komennolla \`node scripts/link-fix-list.mjs\` mittausajon tuloksista. Havaintoja yhteensä ${items.length}.`,
    '',
    'Rivikohtainen lista: `docs/linkit-korjattavat-' + today + '.csv`.',
    '',
    '## Toimenpiteet',
    '',
    '| Toimenpide | Kpl |',
    '|---|---:|',
    ...[...byAction.entries()].sort((a, b) => b[1] - a[1]).map(([action, n]) => `| ${action} | ${n} |`),
    '',
    '## Lähdetiedostoittain',
    '',
    '| Lähdetiedosto | Korjattavia |',
    '|---|---:|',
    ...[...bySource.entries()].sort((a, b) => b[1].length - a[1].length).map(([source, list]) => `| \`${source}\` | ${list.length} |`),
    '',
  ];

  const urgent = items.filter((item) => item.priority === 1);
  if (urgent.length > 0) {
    md.push('## Kiireelliset', '', '| Nimi sovelluksessa | Nykyinen osoite | Vie oikeasti |', '|---|---|---|');
    urgent.forEach((item) => md.push(`| ${item.name} | \`${item.url}\` | \`${item.finalUrl.slice(0, 90)}\` |`));
    md.push('');
  }

  for (const [source, list] of [...bySource.entries()].sort((a, b) => b[1].length - a[1].length)) {
    md.push(`### \`${source}\` — ${list.length} kpl`, '');
    const grouped = new Map();
    for (const item of list) {
      if (!grouped.has(item.action)) grouped.set(item.action, []);
      grouped.get(item.action).push(item);
    }
    for (const [action, entries] of grouped) {
      md.push(`**${action}** (${entries.length}):`, '');
      entries.slice(0, 40).forEach((item) => {
        const suggestion = item.code === 'https_available'
          ? ` → \`${item.url.replace(/^http:/i, 'https:')}\``
          : item.domainChanged ? ` → \`${item.finalUrl.slice(0, 70)}\`` : '';
        md.push(`- ${item.name} — \`${item.url.slice(0, 80)}\`${suggestion}`);
      });
      if (entries.length > 40) md.push(`- …ja ${entries.length - 40} muuta, ks. CSV`);
      md.push('');
    }
  }

  await writeFile(resolve(root, 'docs', `linkit-korjattavat-${today}.md`), `${md.join('\n')}\n`, 'utf8');
  console.log(`Kirjoitettu docs/linkit-korjattavat-${today}.md ja .csv — ${items.length} havaintoa.`);
  [...byAction.entries()].sort((a, b) => b[1] - a[1]).forEach(([action, n]) => console.log(`  ${String(n).padStart(4)}  ${action}`));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
