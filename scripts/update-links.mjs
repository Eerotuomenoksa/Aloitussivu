import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { lookup } from 'node:dns/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CHECK_TIMEOUT_MS = 10_000;
const CHECK_CONCURRENCY = 12;
const MANUALLY_VERIFIED_URLS = new Set([
  'http://kuopionkaupunginteatteri.fi',
  'https://haapavesi.fi',
  'https://hel.fi',
  'https://ikaalinen.fi',
  'https://ilmajoki.fi',
  'https://isojoki.fi',
  'https://isokyro.fi',
  'https://kuopionkaupunginteatteri.fi',
  'https://www.espoonteatteri.fi',
  'https://www.hyrynsalmi.fi',
  'https://www.iisalmi.fi',
  'https://www.iitti.fi',
  'https://www.ilomantsi.fi',
  'https://www.imatra.fi',
  'https://www.inari.fi',
  'https://www.inga.fi',
  'https://www.vapaaehtoistyö.fi',
  'https://www.gutenberg.org',
  'https://www.kirjasampo.fi',
  'https://nyaostis.fi',
]);

const rows = [];

const readText = (filePath) => readFile(path.join(ROOT, filePath), 'utf8');

const addRow = (section, category, name, url, source) => {
  if (!url || !/^https:\/\//i.test(url)) return;
  rows.push({ section, category, name, url, source });
};

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const jsString = (value) => JSON.stringify(value);

const normalizeHost = (host) => host.toLowerCase().replace(/\.$/, '');
const normalizeUrlForComparison = (url) => url.trim().replace(/\/+$/, '');
const isManuallyVerified = (url) => MANUALLY_VERIFIED_URLS.has(normalizeUrlForComparison(url));

const isPrivateIp = (address) => {
  if (!address) return false;
  if (address === '::1') return true;
  if (address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80')) return true;

  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
};

const evaluateUrlSafety = async (rawUrl) => {
  const notes = [];

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safety: 'virhe', notes: ['Virheellinen URL'] };
  }

  if (!['https:', 'http:'].includes(parsed.protocol)) {
    return { safety: 'virhe', notes: [`Ei sallittu protokolla: ${parsed.protocol}`] };
  }

  if (parsed.username || parsed.password) {
    notes.push('URL sisältää käyttäjätunnuksen tai salasanan');
  }

  if (parsed.protocol !== 'https:') {
    notes.push('Ei HTTPS-yhteyttä');
  }

  const host = normalizeHost(parsed.hostname);
  if (['localhost', '0.0.0.0'].includes(host) || host.endsWith('.local')) {
    notes.push('Paikallinen tai sisäverkon osoite');
  }

  try {
    const addresses = await lookup(host, { all: true });
    if (addresses.some((item) => isPrivateIp(item.address))) {
      notes.push('Osoite palautuu yksityiseen IP-alueeseen');
    }
  } catch (error) {
    notes.push(`DNS ei ratkennut: ${error.code ?? error.message}`);
  }

  return {
    safety: notes.length === 0 ? 'ok' : 'huomio',
    notes,
  };
};

const fetchWithTimeout = async (url, options) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'SeniorinAloitussivu-link-check/1.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...(options.headers ?? {}),
      },
      ...options,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const checkHttp = async (url) => {
  try {
    let response = await fetchWithTimeout(url, { method: 'HEAD' });

    if ([405, 403, 400].includes(response.status)) {
      response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { range: 'bytes=0-2048' },
      });
    }

    const reachable = response.status >= 200 && response.status < 400;
    return {
      check: reachable ? 'ok' : 'huomio',
      status: String(response.status),
      finalUrl: response.url,
      notes: reachable ? [] : [`HTTP ${response.status}`],
    };
  } catch (error) {
    return {
      check: 'virhe',
      status: '',
      finalUrl: '',
      notes: [error.name === 'AbortError' ? 'Tarkistus aikakatkaistiin' : error.message],
    };
  }
};

const runLimited = async (items, worker, limit) => {
  const results = new Array(items.length);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
};

const collectLinks = async () => {
  const constants = await readText('constants.tsx');
  let category = '';
  const categoryNames = new Set();
  for (const line of constants.split(/\r?\n/)) {
    const categoryMatch = line.match(/name:\s*'([^']+)',\s*icon:/);
    if (categoryMatch) {
      category = categoryMatch[1];
      categoryNames.add(category);
      continue;
    }

    const providerMatch = line.match(/\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)'(?:,\s*group:\s*'([^']+)')?/);
    if (providerMatch) {
      addRow('Palvelukategoriat', category, providerMatch[1], providerMatch[2], 'constants.tsx');
    }
  }

  const localServices = await readText('localServices.ts');
  const localTransportCount = [...localServices.matchAll(/publicTransport:\s*\{/g)].length;
  const localLibraryCount = [...localServices.matchAll(/library:\s*\{/g)].length;
  const localMunicipalityServiceCount = [...localServices.matchAll(/municipality:\s*\{/g)].length;
  const localWellbeingAreaCount = [...localServices.matchAll(/'([0-9]{2})':\s*'([^']+)'/g)].length;

  for (const match of localServices.matchAll(/(publicTransport|library|municipality|wellbeingArea):\s*\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)',\s*group:\s*'([^']+)'/g)) {
    addRow('Paikalliset erikoislinkit', match[4], match[2], match[3], 'localServices.ts');
  }

  for (const match of localServices.matchAll(/regionalNewsProvider\('([^']+)',\s*'([^']+)'\)/g)) {
    addRow('Alueelliset uutislähteet', 'Alueelliset uutiset', match[1], match[2], 'localServices.ts');
  }

  for (const match of localServices.matchAll(/'([0-9]{2})':\s*'([^']+)'/g)) {
    addRow('Hyvinvointialueet', 'Hyvinvointialue', `Hyvinvointialue ${match[1]}`, match[2], 'localServices.ts');
  }

  const municipalityWebsites = await readText('municipalityWebsites.ts');
  for (const match of municipalityWebsites.matchAll(/'([^']+)':\s*'([^']+)'/g)) {
    addRow('Kuntien verkkosivut', 'Kunta', match[1], match[2], 'municipalityWebsites.ts');
  }

  const municipalityWebsiteLocales = await readText('municipalityWebsiteLocales.ts');
  let currentMunicipality = '';
  for (const line of municipalityWebsiteLocales.split(/\r?\n/)) {
    const municipalityMatch = line.match(/^\s*"([^"]+)":\s*\{/);
    if (municipalityMatch) {
      currentMunicipality = municipalityMatch[1];
      continue;
    }
    const languageMatch = line.match(/^\s*(sv|en|uk|et|ru|se):\s*"([^"]+)"/);
    if (languageMatch && currentMunicipality) {
      addRow('Kuntien kieliversiot', languageMatch[1], `${currentMunicipality} (${languageMatch[1]})`, languageMatch[2], 'municipalityWebsiteLocales.ts');
    }
  }

   const localNewspapers = await readText('localNewspaperLinks.ts');
   for (const match of localNewspapers.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\s*\}/g)) {
     addRow('Lehdet', 'Suomalaiset paikallislehdet', match[1], match[2], 'localNewspaperLinks.ts');
   }

  addRow('Sovelluksen omat linkit', 'Footer', 'SeniorSurf', 'https://seniorsurf.fi/', 'App.tsx');
  addRow('Sovelluksen omat linkit', 'Footer', 'SeniorSurf logo', 'https://seniorsurf.fi/wp-content/uploads/SeniorSurf_White-320-x-102-px.svg', 'App.tsx');
  addRow('Sovelluksen omat linkit', 'Sää', 'Ilmatieteen laitos', 'https://www.ilmatieteenlaitos.fi/', 'WeatherCard.tsx');
  addRow('Sovelluksen omat linkit', 'Sää API', 'Open-Meteo ennuste', 'https://api.open-meteo.com/v1/forecast', 'WeatherCard.tsx');
  addRow('Sovelluksen omat linkit', 'Digiopastus', 'SeniorSurf opastuspaikat', 'https://seniorsurf.fi/seniorit/opastuspaikat/', 'NearbyGuidancePlaces.tsx');
  addRow('Sovelluksen omat linkit', 'Haku', 'Google-haku', 'https://www.google.com/search', 'SearchBar.tsx / localServices.ts');

  return {
    categoryNames,
    localTransportCount,
    localLibraryCount,
    localMunicipalityServiceCount,
    localWellbeingAreaCount,
    municipalityWebsiteCount: [...municipalityWebsites.matchAll(/'([^']+)':\s*'([^']+)'/g)].length,
    municipalityWebsiteLocaleCount: [...municipalityWebsiteLocales.matchAll(/^\s*(sv|en|uk|et|ru|se):\s*"([^"]+)"/gm)].length,
    localNewspaperCount: [...localNewspapers.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\s*\}/g)].length,
  };
};

const main = async () => {
  const {
    categoryNames,
    localTransportCount,
    localLibraryCount,
    localMunicipalityServiceCount,
    localWellbeingAreaCount,
    municipalityWebsiteCount,
    municipalityWebsiteLocaleCount,
    localNewspaperCount,
  } = await collectLinks();

  const uniqueRows = [...new Map(
    rows
      .sort((a, b) => `${a.section}|${a.category}|${a.name}|${a.url}`.localeCompare(`${b.section}|${b.category}|${b.name}|${b.url}`, 'fi-FI'))
      .map((row) => [`${row.section}|${row.category}|${row.name}|${row.url}`, row])
  ).values()];

  console.log(`Tarkistetaan ${uniqueRows.length} linkkiä...`);

  const checkedRows = await runLimited(uniqueRows, async (row, index) => {
    const [safety, http] = await Promise.all([
      evaluateUrlSafety(row.url),
      checkHttp(row.url),
    ]);

    if ((index + 1) % 25 === 0 || index + 1 === uniqueRows.length) {
      console.log(`${index + 1}/${uniqueRows.length}`);
    }

    return {
      ...row,
      check: http.check,
      status: http.status,
      finalUrl: http.finalUrl,
      safety: safety.safety,
      notes: [...safety.notes, ...http.notes].join('; '),
    };
  }, CHECK_CONCURRENCY);

  await mkdir(path.join(ROOT, 'docs'), { recursive: true });

  const csvHeader = ['Osio', 'Kategoria', 'Nimi', 'URL', 'Lähde', 'Tarkistus', 'HTTP', 'Turvallisuus', 'Lopullinen URL', 'Huomiot'];
  const csvRows = checkedRows.map((row) => [
    row.section,
    row.category,
    row.name,
    row.url,
    row.source,
    row.check,
    row.status,
    row.safety,
    row.finalUrl,
    row.notes,
  ].map(csvEscape).join(','));
  await writeFile(path.join(ROOT, 'docs', 'linkit.csv'), `${csvHeader.map(csvEscape).join(',')}\n${csvRows.join('\n')}\n`, 'utf8');

  const countsBySection = new Map();
  for (const row of checkedRows) {
    countsBySection.set(row.section, (countsBySection.get(row.section) ?? 0) + 1);
  }

  const failed = checkedRows.filter((row) => !isManuallyVerified(row.url) && (row.check === 'virhe' || row.safety === 'virhe'));
  const warnings = checkedRows.filter((row) => row.check === 'huomio' || row.safety === 'huomio');
  const adminRows = checkedRows.filter((row) => row.check !== 'ok' || row.safety !== 'ok');
  const blockedUrls = [...new Set(failed.map((row) => row.url))].sort((a, b) => a.localeCompare(b, 'fi-FI'));
  const generatedAt = new Intl.DateTimeFormat('fi-FI', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Helsinki',
  }).format(new Date());

  const linkHealth = [
    '// Generated by scripts/update-links.mjs.',
    '// Links listed here are hidden from the end-user UI until the next successful check.',
    'export const BLOCKED_LINK_URLS: string[] = [',
    ...blockedUrls.map((url) => `  ${jsString(url)},`),
    '];',
    '',
  ];
  await writeFile(path.join(ROOT, 'linkHealth.ts'), linkHealth.join('\n'), 'utf8');

  const visibleLinks = checkedRows.length - blockedUrls.length;
  const localLinkStats = [
    '// Generated by scripts/update-links.mjs.',
    'export const LOCAL_LINK_STATS = {',
    `  municipalities: ${municipalityWebsiteCount},`,
    `  municipalityLanguageVersions: ${municipalityWebsiteLocaleCount},`,
    `  wellbeingAreas: ${localWellbeingAreaCount},`,
    `  municipalityServicePages: ${localMunicipalityServiceCount},`,
    `  localTransport: ${localTransportCount},`,
    `  localLibraries: ${localLibraryCount},`,
    `  localNewspapers: ${localNewspaperCount},`,
    '} as const;',
    '',
  ];
  await writeFile(path.join(ROOT, 'localStats.ts'), localLinkStats.join('\n'), 'utf8');

  const linkStats = [
    '// Generated by scripts/update-links.mjs.',
    'export const LINK_STATS = {',
    `  totalLinks: ${checkedRows.length},`,
    `  visibleLinks: ${visibleLinks},`,
    `  hiddenLinks: ${blockedUrls.length},`,
    `  categoryCount: ${categoryNames.size},`,
    '  sections: {',
    ...[...countsBySection.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'fi-FI'))
      .map(([section, count]) => `    ${jsString(section)}: ${count},`),
    '  } as Record<string, number>,',
    '} as const;',
    '',
  ];
  await writeFile(path.join(ROOT, 'linkStats.ts'), linkStats.join('\n'), 'utf8');

  const adminHeader = ['Päivitetty', 'Osio', 'Kategoria', 'Nimi', 'URL', 'Lähde', 'Tarkistus', 'HTTP', 'Turvallisuus', 'Lopullinen URL', 'Huomiot'];
  const adminCsvRows = adminRows.map((row) => [
    generatedAt,
    row.section,
    row.category,
    row.name,
    row.url,
    row.source,
    row.check,
    row.status,
    row.safety,
    row.finalUrl,
    row.notes,
  ].map(csvEscape).join(','));
  await writeFile(path.join(ROOT, 'docs', 'yllapito-linkkiloki.csv'), `${adminHeader.map(csvEscape).join(',')}\n${adminCsvRows.join('\n')}\n`, 'utf8');

  const warningCsvRows = warnings.map((row) => [
    generatedAt,
    row.section,
    row.category,
    row.name,
    row.url,
    row.source,
    row.check,
    row.status,
    row.safety,
    row.finalUrl,
    row.notes,
  ].map(csvEscape).join(','));
  await writeFile(path.join(ROOT, 'docs', 'linkit-huomiot.csv'), `${adminHeader.map(csvEscape).join(',')}\n${warningCsvRows.join('\n')}\n`, 'utf8');

  const markdown = [
    '# Palvelun linkit',
    '',
    `Päivitetty: ${generatedAt}`,
    '',
    'Tämä tiedosto summaa sovelluksessa olevat linkit. Varsinainen avattava taulukko on tiedostossa `docs/linkit.csv`.',
    '',
    '| Osio | Linkkejä |',
    '|---|---:|',
    ...[...countsBySection.entries()].sort(([a], [b]) => a.localeCompare(b, 'fi-FI')).map(([section, count]) => `| ${section} | ${count} |`),
    '',
    `Yhteensä: ${checkedRows.length} linkkiä.`,
    '',
    `Tarkistusvirheitä: ${failed.length}.`,
    `Huomioita: ${warnings.length}.`,
    `Piilotettu loppukäyttäjiltä: ${blockedUrls.length} linkkiä.`,
    '',
    'Turvallisuustarkistus on perustarkistus: URL-muoto, sallittu protokolla, HTTPS, kirjautumistietojen puuttuminen sekä paikallisten/sisäverkon osoitteiden esto. Se ei korvaa haittasivustojen erillistä mainearviota.',
    '',
    'Huomio: paikalliset uutisotsikot ja käyttäjän tekemät Google-haut muodostuvat ajossa, joten yksittäisiä hakutuloksia ei listata staattisessa taulukossa.',
  ];

  await writeFile(path.join(ROOT, 'docs', 'linkit.md'), `${markdown.join('\n')}\n`, 'utf8');

  console.log(`Valmis. Linkkejä: ${checkedRows.length}, virheitä: ${failed.length}, huomioita: ${warnings.length}, piilotettu: ${blockedUrls.length}.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
