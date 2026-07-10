import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { lookup } from 'node:dns/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CHECK_TIMEOUT_MS = 10_000;
const CHECK_CONCURRENCY = 12;
const CONTENT_CHECK_BYTES = 65_536;
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
  'https://hifkfotboll.fi',
  'https://hjk.fi',
  'https://hpk.fi',
  'https://www.hyvinkaantahko.fi',
  'https://www.jku.fi',
  'https://www.joensuunkataja.fi',
  'https://www.jypliiga.fi',
]);

const rows = [];

const readText = (filePath) => readFile(path.join(ROOT, filePath), 'utf8');

const addRow = (section, category, name, url, source) => {
  if (!url || !/^https?:\/\//i.test(url)) return;
  rows.push({ section, category, name, url, source });
};

const csvEscape = (value) => `"${String(value ?? '').replace(/\s*\r?\n\s*/g, ' ').trim().replace(/"/g, '""')}"`;
const jsString = (value) => JSON.stringify(value);

const normalizeHost = (host) => host.toLowerCase().replace(/\.$/, '');
const normalizeUrlForComparison = (url) => url.trim().replace(/\/+$/, '');
const isManuallyVerified = (url) => MANUALLY_VERIFIED_URLS.has(normalizeUrlForComparison(url));
const normalizeText = (value) => String(value ?? '')
  .toLocaleLowerCase('fi-FI')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9åäö]+/giu, ' ')
  .trim();

const getRegisteredDomain = (host) => {
  const parts = normalizeHost(host).split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const lastTwo = parts.slice(-2).join('.');
  const secondLevel = new Set(['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au', 'org.au', 'co.nz']);
  return secondLevel.has(lastTwo) ? parts.slice(-3).join('.') : lastTwo;
};

const getUrlDetails = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    return {
      protocol: parsed.protocol,
      host: normalizeHost(parsed.hostname),
      registeredDomain: getRegisteredDomain(parsed.hostname),
    };
  } catch {
    return { protocol: '', host: '', registeredDomain: '' };
  }
};

const rdapCache = new Map();

const collectRdapNames = (value, names = new Set()) => {
  if (!value) return names;
  if (Array.isArray(value)) {
    if (value[0] === 'fn' || value[0] === 'org') {
      const item = String(value[3] ?? '').trim();
      if (item) names.add(item);
    }
    value.forEach((item) => collectRdapNames(item, names));
    return names;
  }
  if (typeof value === 'object') {
    if (typeof value.name === 'string' && value.name.trim()) names.add(value.name.trim());
    Object.values(value).forEach((item) => collectRdapNames(item, names));
  }
  return names;
};

const getDomainOwnershipSignal = async (domain) => {
  if (!domain) return '';
  if (!rdapCache.has(domain)) {
    rdapCache.set(domain, (async () => {
      try {
        const response = await fetchWithTimeout(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
          method: 'GET',
          headers: { accept: 'application/rdap+json, application/json;q=0.9, */*;q=0.5' },
        });
        if (!response.ok) return `RDAP ${response.status}`;
        const data = await response.json();
        const names = [...collectRdapNames(data)]
          .filter((name) => !/^(redacted|not disclosed|data protected)$/i.test(name))
          .slice(0, 3);
        return names.length > 0 ? names.join(' | ') : 'RDAP löytyi, omistaja ei julkinen';
      } catch (error) {
        return `RDAP ei saatavilla: ${error.name === 'AbortError' ? 'aikakatkaisu' : error.message}`;
      }
    })());
  }
  return rdapCache.get(domain);
};

const readVerifiedLinks = async () => {
  try {
    const source = await readText('verifiedLinks.ts');
    const entries = [...source.matchAll(/\{\s*url:\s*['"]([^'"]+)['"][\s\S]*?status:\s*['"]([^'"]+)['"][\s\S]*?confidence:\s*['"]([^'"]+)['"]/g)]
      .map((match) => ({
        url: normalizeUrlForComparison(match[1]),
        status: match[2],
        confidence: match[3],
      }));
    const verifiedLinks = new Map(entries.map((entry) => [entry.url, entry]));
    for (const url of MANUALLY_VERIFIED_URLS) {
      const normalizedUrl = normalizeUrlForComparison(url);
      if (!verifiedLinks.has(normalizedUrl)) {
        verifiedLinks.set(normalizedUrl, {
          url: normalizedUrl,
          status: 'verified',
          confidence: 'C',
        });
      }
    }
    return verifiedLinks;
  } catch {
    return new Map([...MANUALLY_VERIFIED_URLS].map((url) => {
      const normalizedUrl = normalizeUrlForComparison(url);
      return [normalizedUrl, {
        url: normalizedUrl,
        status: 'verified',
        confidence: 'C',
      }];
    }));
  }
};

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

const stripHtml = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const decodeHtmlEntities = (value) => value
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const extractHtmlField = (html, pattern) => decodeHtmlEntities(html.match(pattern)?.[1]?.trim() ?? '');

const contentMatchesExpected = (row, contentText) => {
  const haystack = normalizeText(contentText);
  const words = normalizeText(`${row.name} ${row.category}`)
    .split(' ')
    .filter((word) => word.length >= 4 && !['https', 'http'].includes(word));
  if (words.length === 0) return true;
  return words.some((word) => haystack.includes(word));
};

const inspectContent = async (row, http) => {
  if (http.check !== 'ok' || !http.finalUrl) {
    return { contentSignal: 'ei tarkistettu', pageTitle: '', contentNotes: [] };
  }

  try {
    const response = await fetchWithTimeout(http.finalUrl, {
      method: 'GET',
      headers: { range: `bytes=0-${CONTENT_CHECK_BYTES}` },
    });
    const contentType = response.headers.get('content-type') ?? '';
    const text = await response.text();
    const title = extractHtmlField(text, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const h1 = extractHtmlField(text, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const description = extractHtmlField(text, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
      || extractHtmlField(text, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i);
    const visibleText = stripHtml(`${title} ${h1} ${description} ${text.slice(0, CONTENT_CHECK_BYTES)}`);
    const notes = [];

    if (/text\/html/i.test(contentType)) {
      if (!title && !h1) notes.push('HTML-sivulta ei löytynyt otsikkoa');
      if (/domain.*(sale|parked)|osta tämä domain|buy this domain|parking|sedo|dan\.com/i.test(visibleText)) {
        notes.push('Sivu vaikuttaa parkkisivulta tai myytävältä domainilta');
      }
      if (!contentMatchesExpected(row, visibleText)) {
        notes.push('Sivun otsikko tai sisältö ei selvästi vastaa linkin nimeä');
      }
    } else if (!/(xml|rss|atom|json|pdf|image|text\/plain)/i.test(contentType)) {
      notes.push(`Poikkeava sisältötyyppi: ${contentType || 'ei ilmoitettu'}`);
    }

    return {
      contentSignal: notes.length > 0 ? 'huomio' : 'ok',
      pageTitle: title || h1 || description,
      contentNotes: notes,
    };
  } catch (error) {
    return {
      contentSignal: 'huomio',
      pageTitle: '',
      contentNotes: [error.name === 'AbortError' ? 'Sisältötarkistus aikakatkaistiin' : `Sisältötarkistus epäonnistui: ${error.message}`],
    };
  }
};

const scoreLinkRisk = ({ row, safety, http, content, verification }) => {
  const original = getUrlDetails(row.url);
  const final = getUrlDetails(http.finalUrl || row.url);
  const domainChanged = Boolean(original.registeredDomain && final.registeredDomain && original.registeredDomain !== final.registeredDomain);
  let riskScore = 0;
  const riskReasons = [];
  const addRisk = (points, reason) => {
    riskScore += points;
    riskReasons.push(reason);
  };

  if (original.protocol === 'http:') addRisk(40, 'Ei HTTPS-yhteyttä');
  if (safety.safety === 'virhe') addRisk(100, 'Tekninen turvallisuusvirhe');
  if (safety.safety === 'huomio') addRisk(30, 'Turvallisuushuomio');
  if (http.check === 'virhe') addRisk(80, 'HTTP-tarkistus epäonnistui');
  if (http.check === 'huomio') {
    const status = Number(http.status);
    if (status === 404 || status === 410) addRisk(70, `HTTP ${http.status}`);
    else if (status >= 500) addRisk(60, `HTTP ${http.status}`);
    else if (status === 403 || status === 429) addRisk(30, `HTTP ${http.status}`);
    else addRisk(50, `HTTP ${http.status || 'huomio'}`);
  }
  if (domainChanged) addRisk(50, `Domain vaihtui: ${original.registeredDomain} -> ${final.registeredDomain}`);
  if (final.protocol === 'http:') addRisk(40, 'Lopullinen osoite ei käytä HTTPS-yhteyttä');
  if (content.contentSignal === 'huomio') addRisk(35, 'Sisältötarkistus vaatii huomiota');
  if (verification?.status === 'verified' || verification?.status === 'exception') {
    riskScore = Math.max(0, riskScore - 40);
    riskReasons.push(`Manuaalinen tila: ${verification.status}`);
  }

  return {
    originalDomain: original.registeredDomain,
    finalDomain: final.registeredDomain,
    domainChanged: domainChanged ? 'kyllä' : 'ei',
    riskScore,
    riskReasons,
    recommendedAction: riskScore >= 50 || safety.safety === 'virhe' || http.check === 'virhe' ? 'piilota' : riskScore > 0 ? 'tarkista' : 'pidä näkyvissä',
  };
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
  const phoneLinks = new Map();
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

    const phoneMatch = line.match(/\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)'.*?\bphone:\s*'([^']+)'/);
    if (phoneMatch) {
      phoneLinks.set(`${phoneMatch[1]}|${phoneMatch[2]}|${phoneMatch[3]}`, {
        name: phoneMatch[1],
        url: phoneMatch[2],
        phone: phoneMatch[3],
      });
    }
  }

  const localServices = await readText('localServices.ts');
  const localServiceTransportLinks = await readText('localServiceTransportLinks.ts');
  const localKelaTaxiNumbers = await readText('localKelaTaxiNumbers.ts');
  const localNewspaperFeeds = await readText('localNewspaperFeeds.ts');
  const localTransportCount = [...localServices.matchAll(/publicTransport:\s*\{/g)].length;
  const localLibraryCount = [...localServices.matchAll(/library:\s*\{/g)].length;
  const localMunicipalityServiceCount = [...localServices.matchAll(/municipality:\s*\{/g)].length;
  const localWellbeingAreaCount = [...localServices.matchAll(/'([0-9]{2})':\s*'([^']+)'/g)].length;

  for (const match of localServices.matchAll(/(publicTransport|library|municipality|wellbeingArea):\s*\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)',\s*group:\s*'([^']+)'/g)) {
    addRow('Paikalliset erikoislinkit', match[4], match[2], match[3], 'localServices.ts');
  }

  for (const match of localServiceTransportLinks.matchAll(/provider:\s*\{\s*name:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*group:\s*'([^']+)'/g)) {
    addRow('Paikalliset erikoislinkit', match[3], match[1], match[2], 'localServiceTransportLinks.ts');
  }

  for (const match of localServices.matchAll(/regionalNewsProvider\('([^']+)',\s*'([^']+)'\)/g)) {
    addRow('Alueelliset uutislähteet', 'Alueelliset uutiset', match[1], match[2], 'localServices.ts');
  }

  for (const block of localServices.matchAll(/rssFeeds:\s*\[([\s\S]*?)\]/g)) {
    for (const match of block[1].matchAll(/\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)'\s*\}/g)) {
      addRow('Uutisvirrat', 'RSS', match[1], match[2], 'localServices.ts');
    }
  }

  for (const match of localNewspaperFeeds.matchAll(/\{\s*"municipality":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\s*\}/g)) {
    addRow('Uutisvirrat', match[1], match[2], match[3], 'localNewspaperFeeds.ts');
  }

  for (const match of localKelaTaxiNumbers.matchAll(/name:\s*"([^"]+)",\s*url:\s*"([^"]+)".*?group:\s*'Kela-taksi'.*?phone:\s*"([^"]+)"/gs)) {
    addRow('Alueelliset puhelinnumerot', 'Kela-taksi', match[1], match[2], 'localKelaTaxiNumbers.ts');
    phoneLinks.set(`${match[1]}|${match[2]}|${match[3]}`, {
      name: match[1],
      url: match[2],
      phone: match[3],
    });
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

  const localSportsClubs = await readText('localSportsClubs.ts');
  for (const match of localSportsClubs.matchAll(/\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)',\s*group:\s*'([^']+)'/g)) {
    addRow('Paikalliset urheiluseurat', match[3], match[1], match[2], 'localSportsClubs.ts');
  }

  const localExerciseLinks = await readText('localExerciseLinks.ts');
  for (const match of localExerciseLinks.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)",\s*"group":\s*"([^"]+)"\s*\}/g)) {
    addRow('Paikallinen ohjattu liikunta', match[3], match[1], match[2], 'localExerciseLinks.ts');
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
    localServiceTransportCount: [...localServiceTransportLinks.matchAll(/provider:\s*\{/g)].length,
    localMunicipalityServiceCount,
    localWellbeingAreaCount,
    municipalityWebsiteCount: [...municipalityWebsites.matchAll(/'([^']+)':\s*'([^']+)'/g)].length,
    municipalityWebsiteLocaleCount: [...municipalityWebsiteLocales.matchAll(/^\s*(sv|en|uk|et|ru|se):\s*"([^"]+)"/gm)].length,
    localNewspaperCount: [...localNewspapers.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\s*\}/g)].length,
    localNewsFeedCount: [...localNewspaperFeeds.matchAll(/\{\s*"municipality":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\s*\}/g)].length
      + [...localServices.matchAll(/rssFeeds:\s*\[[\s\S]*?\]/g)].reduce((sum, block) => (
        sum + [...block[0].matchAll(/\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)'\s*\}/g)].length
      ), 0),
    localSportsClubCount: [...localSportsClubs.matchAll(/\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)',\s*group:\s*'([^']+)'/g)].length,
    localExerciseLinkCount: [...localExerciseLinks.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)",\s*"group":\s*"([^"]+)"\s*\}/g)].length,
    localKelaTaxiPhoneCount: [...localKelaTaxiNumbers.matchAll(/group:\s*'Kela-taksi'.*?phone:\s*"([^"]+)"/gs)].length,
    phoneLinkCount: phoneLinks.size,
  };
};

const main = async () => {
  const {
    categoryNames,
    localTransportCount,
    localLibraryCount,
    localServiceTransportCount,
    localMunicipalityServiceCount,
    localWellbeingAreaCount,
    municipalityWebsiteCount,
    municipalityWebsiteLocaleCount,
    localNewspaperCount,
    localNewsFeedCount,
    localSportsClubCount,
    localExerciseLinkCount,
    localKelaTaxiPhoneCount,
    phoneLinkCount,
  } = await collectLinks();
  const verifiedLinks = await readVerifiedLinks();

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
    const content = await inspectContent(row, http);
    const verification = verifiedLinks.get(normalizeUrlForComparison(row.url)) ?? null;
    const risk = scoreLinkRisk({ row, safety, http, content, verification });
    const domainOwnerSignal = await getDomainOwnershipSignal(risk.originalDomain);

    if ((index + 1) % 25 === 0 || index + 1 === uniqueRows.length) {
      console.log(`${index + 1}/${uniqueRows.length}`);
    }

    return {
      ...row,
      check: http.check,
      status: http.status,
      finalUrl: http.finalUrl,
      safety: safety.safety,
      originalDomain: risk.originalDomain,
      finalDomain: risk.finalDomain,
      domainChanged: risk.domainChanged,
      domainOwnerSignal,
      contentSignal: content.contentSignal,
      pageTitle: content.pageTitle,
      riskScore: risk.riskScore,
      recommendedAction: risk.recommendedAction,
      verificationStatus: verification?.status ?? '',
      verificationConfidence: verification?.confidence ?? '',
      notes: [...safety.notes, ...http.notes, ...content.contentNotes, ...risk.riskReasons].join('; '),
    };
  }, CHECK_CONCURRENCY);

  await mkdir(path.join(ROOT, 'docs'), { recursive: true });

  const csvHeader = ['Osio', 'Kategoria', 'Nimi', 'URL', 'Lähde', 'Tarkistus', 'HTTP', 'Turvallisuus', 'Lopullinen URL', 'Alkuperäinen domain', 'Lopullinen domain', 'Domain vaihtui', 'RDAP-signaali', 'Sisältösignaali', 'Sivun otsikko', 'Riskipisteet', 'Suositus', 'Manuaalinen tila', 'Luottamustaso', 'Huomiot'];
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
    row.originalDomain,
    row.finalDomain,
    row.domainChanged,
    row.domainOwnerSignal,
    row.contentSignal,
    row.pageTitle,
    row.riskScore,
    row.recommendedAction,
    row.verificationStatus,
    row.verificationConfidence,
    row.notes,
  ].map(csvEscape).join(','));
  await writeFile(path.join(ROOT, 'docs', 'linkit.csv'), `${csvHeader.map(csvEscape).join(',')}\n${csvRows.join('\n')}\n`, 'utf8');

  const countsBySection = new Map();
  for (const row of checkedRows) {
    countsBySection.set(row.section, (countsBySection.get(row.section) ?? 0) + 1);
  }

  const failed = checkedRows.filter((row) => row.check === 'virhe' || row.safety === 'virhe');
  const warnings = checkedRows.filter((row) => row.check === 'huomio' || row.safety === 'huomio' || row.contentSignal === 'huomio' || row.recommendedAction === 'tarkista');
  const adminRows = checkedRows.filter((row) => row.recommendedAction !== 'pidä näkyvissä');
  const blockedRows = checkedRows.filter((row) => row.recommendedAction === 'piilota');
  const blockedUrls = [...new Set(blockedRows.map((row) => row.url))].sort((a, b) => a.localeCompare(b, 'fi-FI'));
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
    `  localServiceTransport: ${localServiceTransportCount},`,
    `  localLibraries: ${localLibraryCount},`,
    `  localNewspapers: ${localNewspaperCount},`,
    `  localNewsFeeds: ${localNewsFeedCount},`,
    `  localSportsClubs: ${localSportsClubCount},`,
    `  localExerciseLinks: ${localExerciseLinkCount},`,
    `  localKelaTaxiPhones: ${localKelaTaxiPhoneCount},`,
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
    `  phoneLinks: ${phoneLinkCount},`,
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

  const adminHeader = ['Päivitetty', 'Osio', 'Kategoria', 'Nimi', 'URL', 'Lähde', 'Tarkistus', 'HTTP', 'Turvallisuus', 'Lopullinen URL', 'Alkuperäinen domain', 'Lopullinen domain', 'Domain vaihtui', 'RDAP-signaali', 'Sisältösignaali', 'Sivun otsikko', 'Riskipisteet', 'Suositus', 'Manuaalinen tila', 'Luottamustaso', 'Huomiot'];
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
    row.originalDomain,
    row.finalDomain,
    row.domainChanged,
    row.domainOwnerSignal,
    row.contentSignal,
    row.pageTitle,
    row.riskScore,
    row.recommendedAction,
    row.verificationStatus,
    row.verificationConfidence,
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
    row.originalDomain,
    row.finalDomain,
    row.domainChanged,
    row.domainOwnerSignal,
    row.contentSignal,
    row.pageTitle,
    row.riskScore,
    row.recommendedAction,
    row.verificationStatus,
    row.verificationConfidence,
    row.notes,
  ].map(csvEscape).join(','));
  await writeFile(path.join(ROOT, 'docs', 'linkit-huomiot.csv'), `${adminHeader.map(csvEscape).join(',')}\n${warningCsvRows.join('\n')}\n`, 'utf8');

  const manualReviewRows = [...adminRows]
    .sort((a, b) => b.riskScore - a.riskScore || `${a.section} ${a.name}`.localeCompare(`${b.section} ${b.name}`, 'fi-FI'))
    .map((row) => [
      generatedAt,
      row.section,
      row.category,
      row.name,
      row.url,
      row.source,
      row.riskScore,
      row.recommendedAction,
      row.originalDomain,
      row.finalDomain,
      row.domainChanged,
      row.domainOwnerSignal,
      row.contentSignal,
      row.pageTitle,
      row.verificationStatus,
      row.verificationConfidence,
      row.notes,
    ].map(csvEscape).join(','));
  const manualReviewHeader = ['Päivitetty', 'Osio', 'Kategoria', 'Nimi', 'URL', 'Lähde', 'Riskipisteet', 'Suositus', 'Alkuperäinen domain', 'Lopullinen domain', 'Domain vaihtui', 'RDAP-signaali', 'Sisältösignaali', 'Sivun otsikko', 'Manuaalinen tila', 'Luottamustaso', 'Huomiot'];
  await writeFile(path.join(ROOT, 'docs', 'linkit-manuaalinen-tarkistus.csv'), `${manualReviewHeader.map(csvEscape).join(',')}\n${manualReviewRows.join('\n')}\n`, 'utf8');

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
    `Puhelinnumeroita yhteensä: ${phoneLinkCount}.`,
    `Näistä alueellisia Kela-taksien tilausnumeroita: ${localKelaTaxiPhoneCount}.`,
    `Uutisvirtoja ja RSS-syötteitä tarkistuksessa: ${localNewsFeedCount}.`,
    '',
    `Tarkistusvirheitä: ${failed.length}.`,
    `Huomioita: ${warnings.length}.`,
    `Piilotettu loppukäyttäjiltä: ${blockedUrls.length} linkkiä.`,
    `Manuaaliseen tarkistusjonoon nostettu: ${adminRows.length} linkkiä.`,
    '',
    'Turvallisuustarkistus kattaa URL-muodon, protokollan, DNS/IP-riskit, HTTP-polun, uudelleenohjaukset, kevyen sisältösignaalin, riskipisteytyksen sekä RDAP-pohjaisen domain-signaalin silloin kun julkista tietoa on saatavilla.',
    '',
    'RDAP-signaali on taustatieto manuaaliselle tarkistukselle. Se voi kertoa rekisteröijän, välittäjän tai omistajaan liittyvän julkisen tiedon, mutta ei yksin todista linkkia aidoksi tai turvalliseksi.',
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
