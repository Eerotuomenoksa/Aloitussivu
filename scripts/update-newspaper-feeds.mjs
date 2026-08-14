import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEWSPAPER_FILE = path.join(ROOT, 'localNewspaperLinks.ts');
const REGISTRY_FILE = path.join(ROOT, 'municipalRegistry.ts');
const OUTPUT_FILE = path.join(ROOT, 'localNewspaperFeeds.ts');
const DOCS_DIR = path.join(ROOT, 'docs');
const MISSING_DOC = path.join(DOCS_DIR, 'paikallisuutiset-puuttuvat-kunnat.md');
const SCAN_CONCURRENCY = 6;
const MANUAL_NEWSPAPER_FEEDS = [
  {
    municipality: 'Espoo',
    name: 'Länsiväylä',
    url: 'https://www.lansivayla.fi/feed/rss/',
  },
  {
    municipality: 'Helsinki',
    name: 'Helsingin Uutiset',
    url: 'https://www.helsinginuutiset.fi/feed/rss/',
  },
  {
    municipality: 'Oulu',
    name: 'Kaleva: Oulun seutu',
    url: 'https://kaleva.fi/feedit/rss/managed-listing/oulun-seutu/',
  },
  {
    municipality: 'Tampere',
    name: 'Tamperelainen',
    url: 'https://www.tamperelainen.fi/feed/rss/',
  },
  {
    municipality: 'Turku',
    name: 'Turkulainen',
    url: 'https://www.turkulainen.fi/feed/rss/',
  },
  {
    municipality: 'Vantaa',
    name: 'Vantaan Sanomat',
    url: 'https://www.vantaansanomat.fi/feed/rss/',
  },
  {
    municipality: 'Eckerö',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Forssa',
    name: 'Forssan Lehti',
    url: 'https://www.forssanlehti.fi/feed/rss/',
  },
  {
    municipality: 'Föglö',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Geta',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Hammarland',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Hausjärvi',
    name: 'Aamuposti',
    url: 'https://www.aamuposti.fi/feed/rss/',
  },
  {
    municipality: 'Hollola',
    name: 'Etelä-Suomen Sanomat',
    url: 'https://www.ess.fi/feed/rss/',
  },
  {
    municipality: 'Humppila',
    name: 'Forssan Lehti',
    url: 'https://www.forssanlehti.fi/feed/rss/',
  },
  {
    municipality: 'Hyvinkää',
    name: 'Aamuposti',
    url: 'https://www.aamuposti.fi/feed/rss/',
  },
  {
    municipality: 'Iitti',
    name: 'Etelä-Suomen Sanomat',
    url: 'https://www.ess.fi/feed/rss/',
  },
  {
    municipality: 'Jokioinen',
    name: 'Forssan Lehti',
    url: 'https://www.forssanlehti.fi/feed/rss/',
  },
  {
    municipality: 'Jomala',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Jämsä',
    name: 'Keskisuomalainen',
    url: 'https://www.ksml.fi/feed/rss/',
  },
  {
    municipality: 'Kerava',
    name: 'Keski-Uusimaa',
    url: 'https://www.keski-uusimaa.fi/feed/rss/',
  },
  {
    municipality: 'Kruunupyy',
    name: 'Österbottens Tidning',
    url: 'https://www.osterbottenstidning.fi/feed/',
  },
  {
    municipality: 'Kuhmoinen',
    name: 'Kuhmoisten Sanomat',
    url: 'https://kuhmoistensanomat.fi/feed/',
  },
  {
    municipality: 'Kumlinge',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Kärsämäki',
    name: 'Pyhäjokiseutu',
    url: 'https://www.pyhajokiseutu.fi/feedit/rss/managed-listing/uusimmat/',
  },
  {
    municipality: 'Lapinlahti',
    name: 'Matti ja Liisa',
    url: 'https://www.mattijaliisa.fi/feed/rss/',
  },
  {
    municipality: 'Lemland',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Luumäki',
    name: 'Luumäen Lehti',
    url: 'https://www.luumaenlehti.fi/feed/rss/',
  },
  {
    municipality: 'Lumparland',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Lappeenranta',
    name: 'Uutisvuoksi',
    url: 'https://www.uutisvuoksi.fi/feed/rss/',
  },
  {
    municipality: 'Maalahti',
    name: 'Vasabladet',
    url: 'https://www.vasabladet.fi/feed/',
  },
  {
    municipality: 'Maarianhamina - Mariehamn',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Merijärvi',
    name: 'Pyhäjokiseutu',
    url: 'https://www.pyhajokiseutu.fi/feedit/rss/managed-listing/uusimmat/',
  },
  {
    municipality: 'Mänttä-Vilppula',
    name: 'Keskisuomalainen',
    url: 'https://www.ksml.fi/feed/rss/',
  },
  {
    municipality: 'Pedersören kunta',
    name: 'Österbottens Tidning',
    url: 'https://www.osterbottenstidning.fi/feed/',
  },
  {
    municipality: 'Polvijärvi',
    name: 'Outokummun Seutu',
    url: 'https://www.outokummunseutu.fi/feed/rss',
  },
  {
    municipality: 'Pudasjärvi',
    name: 'Iijokiseutu',
    url: 'https://www.iijokiseutu.fi/feedit/rss/managed-listing/uusimmat/',
  },
  {
    municipality: 'Pukkila',
    name: 'Mäntsälän Uutiset',
    url: 'https://www.mantsalanuutiset.fi/feed/rss/',
  },
  {
    municipality: 'Rautavaara',
    name: 'Pitäjäläinen',
    url: 'https://www.pitajalainen.fi/feed/rss/',
  },
  {
    municipality: 'Riihimäki',
    name: 'Aamuposti',
    url: 'https://www.aamuposti.fi/feed/rss/',
  },
  {
    municipality: 'Ruokolahti',
    name: 'Uutisvuoksi',
    url: 'https://www.uutisvuoksi.fi/feed/rss/',
  },
  {
    municipality: 'Saltvik',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Savitaipale',
    name: 'Etelä-Saimaa',
    url: 'https://www.esaimaa.fi/feed/rss/',
  },
  {
    municipality: 'Sonkajärvi',
    name: 'Miilu',
    url: 'https://www.miilu.fi/feed/rss/',
  },
  {
    municipality: 'Sottunga',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Sund',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Taipalsaari',
    name: 'Etelä-Saimaa',
    url: 'https://www.esaimaa.fi/feed/rss/',
  },
  {
    municipality: 'Taivassalo',
    name: 'Uudenkaupungin Sanomat',
    url: 'https://www.uudenkaupunginsanomat.fi/feed/',
  },
  {
    municipality: 'Tohmajärvi',
    name: 'Karjalan Heili',
    url: 'https://www.heili.fi/feed/rss/',
  },
  {
    municipality: 'Tyrnävä',
    name: 'Rantalakeus',
    url: 'https://www.rantalakeus.fi/feedit/rss/managed-listing/uusimmat/',
  },
  {
    municipality: 'Uurainen',
    name: 'Keskisuomalainen',
    url: 'https://www.ksml.fi/feed/rss/',
  },
  {
    municipality: 'Uusikaarlepyy',
    name: 'Österbottens Tidning',
    url: 'https://www.osterbottenstidning.fi/feed/',
  },
  {
    municipality: 'Vehmaa',
    name: 'Uudenkaupungin Sanomat',
    url: 'https://www.uudenkaupunginsanomat.fi/feed/',
  },
  {
    municipality: 'Vårdö',
    name: 'Nya Åland',
    url: 'https://www.nyan.ax/feed/rss/',
  },
  {
    municipality: 'Vöyri',
    name: 'Vasabladet',
    url: 'https://www.vasabladet.fi/feed/',
  },
  {
    municipality: 'Äänekoski',
    name: 'Sisä-Suomen Lehti',
    url: 'https://www.sisasuomenlehti.fi/feed/rss/',
  },
  {
    municipality: 'Aura',
    name: 'Auranmaan Viikkolehti',
    url: 'https://www.avl.fi/feed/',
  },
  {
    municipality: 'Enonkoski',
    name: 'Puruvesi',
    url: 'https://www.puruvesi.net/feed/rss/',
  },
  {
    municipality: 'Kaavi',
    name: 'Koillis-Savo',
    url: 'https://www.koillis-savo.fi/feed/rss/',
  },
  {
    municipality: 'Kangasala',
    name: 'Sydän-Hämeen Lehti',
    url: 'https://shl.fi/feed/',
  },
  {
    municipality: 'Kannonkoski',
    name: 'Sampo',
    url: 'https://www.sampolehti.fi/feed/rss/',
  },
  {
    municipality: 'Kemiönsaari',
    name: 'Annonsbladet',
    url: 'https://annonsbladet.fi/feed/',
  },
  {
    municipality: 'Kitee',
    name: 'Puruvesi',
    url: 'https://www.puruvesi.net/feed/rss/',
  },
  {
    municipality: 'Koski Tl',
    name: 'Auranmaan Viikkolehti',
    url: 'https://www.avl.fi/feed/',
  },
  {
    municipality: 'Liperi',
    name: 'Kotiseutu-uutiset',
    url: 'https://kotiseutu-uutiset.com/feed/',
  },
  {
    municipality: 'Loviisa',
    name: 'Nya Östis',
    url: 'https://www.nyaostis.fi/feed/',
  },
  {
    municipality: 'Marttila',
    name: 'Auranmaan Viikkolehti',
    url: 'https://www.avl.fi/feed/',
  },
  {
    municipality: 'Miehikkälä',
    name: 'Kaakonkulma',
    url: 'https://www.kaakonkulma.fi/feed/rss/',
  },
  {
    municipality: 'Oripää',
    name: 'Auranmaan Viikkolehti',
    url: 'https://www.avl.fi/feed/',
  },
  {
    municipality: 'Pälkäne',
    name: 'Sydän-Hämeen Lehti',
    url: 'https://shl.fi/feed/',
  },
  {
    municipality: 'Pöytyä',
    name: 'Auranmaan Viikkolehti',
    url: 'https://www.avl.fi/feed/',
  },
  {
    municipality: 'Rautalampi',
    name: 'Paikallislehti Sisä-Savo',
    url: 'https://www.sisa-savolehti.fi/feed/rss/',
  },
  {
    municipality: 'Rääkkylä',
    name: 'Kotiseutu-uutiset',
    url: 'https://kotiseutu-uutiset.com/feed/',
  },
  {
    municipality: 'Saarijärvi',
    name: 'Sampo',
    url: 'https://www.sampolehti.fi/feed/rss/',
  },
  {
    municipality: 'Salo',
    name: 'Perniönseudun Lehti',
    url: 'https://www.pernionseudunlehti.fi/feed/rss/',
  },
  {
    municipality: 'Savonlinna',
    name: 'Puruvesi',
    url: 'https://www.puruvesi.net/feed/rss/',
  },
  {
    municipality: 'Suonenjoki',
    name: 'Paikallislehti Sisä-Savo',
    url: 'https://www.sisa-savolehti.fi/feed/rss/',
  },
  {
    municipality: 'Tervo',
    name: 'Paikallislehti Sisä-Savo',
    url: 'https://www.sisa-savolehti.fi/feed/rss/',
  },
  {
    municipality: 'Tuusniemi',
    name: 'Koillis-Savo',
    url: 'https://www.koillis-savo.fi/feed/rss/',
  },
  {
    municipality: 'Vesanto',
    name: 'Paikallislehti Sisä-Savo',
    url: 'https://www.sisa-savolehti.fi/feed/rss/',
  },
  {
    municipality: 'Virolahti',
    name: 'Kaakonkulma',
    url: 'https://www.kaakonkulma.fi/feed/rss/',
  },
  {
    municipality: 'Heinävesi',
    name: 'Heinäveden Lehti',
    url: 'https://www.heinavedenlehti.fi/feed/rss',
  },
  {
    municipality: 'Kangasniemi',
    name: 'Kangasniemen Kunnallislehti',
    url: 'https://www.kangasniemenlehti.fi/feed/rss',
  },
  {
    municipality: 'Kalajoki',
    name: 'Kalajoen Seutu',
    url: 'https://kalajoenseutu.net/feed/',
  },
  {
    municipality: 'Karkkila',
    name: 'Karkkilan Tienoo',
    url: 'https://www.karkkilalainen.fi/feed/rss',
  },
  {
    municipality: 'Keitele',
    name: 'Pielavesi-Keitele',
    url: 'https://www.pielavesi-keitele.fi/feed/rss',
  },
  {
    municipality: 'Kokemäki',
    name: 'Kokemäkeläinen',
    url: 'http://kokemakelainen.net/feed/',
  },
  {
    municipality: 'Kuhmo',
    name: 'Kuhmolainen',
    url: 'https://www.kuhmolainen.fi/feed',
  },
  {
    municipality: 'Laukaa',
    name: 'Laukaa-Konnevesi',
    url: 'https://www.laukaa-konnevesi.fi/feed/rss',
  },
  {
    municipality: 'Loppi',
    name: 'Lopen Lehti',
    url: 'https://www.lopenlehti.fi/feed/rss',
  },
  {
    municipality: 'Loviisa',
    name: 'Loviisan Sanomat',
    url: 'https://www.loviisansanomat.fi/feed/rss',
  },
  {
    municipality: 'Orivesi',
    name: 'Oriveden Sanomat',
    url: 'https://orivedensanomat.fi/feed/',
  },
  {
    municipality: 'Outokumpu',
    name: 'Outokummun Seutu',
    url: 'https://www.outokummunseutu.fi/feed/rss',
  },
  {
    municipality: 'Paimio',
    name: 'Kunnallislehti Paimio-Sauvo-Kaarina',
    url: 'https://www.kuntsari.fi/feed/',
  },
  {
    municipality: 'Parainen',
    name: 'Pargas Kungörelser - Paraisten Kuulutukset',
    url: 'https://www.pku.fi/feed/',
  },
  {
    municipality: 'Pietarsaari',
    name: 'Pietarsaaren Sanomat',
    url: 'https://www.pietarsaarensanomat.fi/feed',
  },
  {
    municipality: 'Pirkkala',
    name: 'Pirkkalainen',
    url: 'https://pirkkalainen.fi/feed/',
  },
  {
    municipality: 'Pyhäjärvi',
    name: 'Pyhäjärven Sanomat',
    url: 'https://pyhajarvensanomat.fi/feed/',
  },
  {
    municipality: 'Rautjärvi',
    name: 'Parikkalan-Rautjärven Sanomat',
    url: 'https://www.prsanomat.fi/feed/rss',
  },
  {
    municipality: 'Sauvo',
    name: 'Kunnallislehti Paimio-Sauvo-Kaarina',
    url: 'https://www.kuntsari.fi/feed/',
  },
  {
    municipality: 'Uusikaupunki',
    name: 'Uudenkaupungin Sanomat',
    url: 'https://www.uudenkaupunginsanomat.fi/feed/',
  },
  {
    municipality: 'Varkaus',
    name: 'Warkauden Lehti',
    url: 'https://www.warkaudenlehti.fi/feed/rss',
  },
  {
    municipality: 'Vesilahti',
    name: 'Lempäälän-Vesilahden Sanomat',
    url: 'https://lvs.fi/feed/',
  },
  {
    municipality: 'Viitasaari',
    name: 'Viitasaaren Seutu',
    url: 'https://www.viitasaarenseutu.fi/feed/rss',
  },
  {
    municipality: 'Ylöjärvi',
    name: 'Ylöjärven Uutiset',
    url: 'https://ylojarvenuutiset.fi/feed/',
  },
];

const fetchWithTimeout = async (url, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; SeniorinAloitussivu/1.0)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
  } finally {
    clearTimeout(timer);
  }
};

const readTsArray = async (filePath) => {
  const text = await readFile(filePath, 'utf8');
  return text;
};

const normalizeText = (value) => value
  .trim()
  .toLocaleLowerCase('fi-FI')
  .replace(/[.,;:!?()\[\]{}–—-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const stripDiacritics = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeMunicipality = (name) => {
  const normalized = normalizeText(name)
    .replace(/^kunta\s+/i, '')
    .replace(/\s+kaupunki$/i, '')
    .replace(/\s+kunta$/i, '')
    .replace(/\s+-\s+.*$/i, '')
    .trim();
  return stripDiacritics(normalized);
};

const getInflections = (name) => {
  const base = normalizeMunicipality(name);
  const forms = new Set([base, `${base}n`, `${base}ssa`, `${base}ssä`, `${base}sta`, `${base}stä`, `${base}lla`, `${base}llä`, `${base}lta`, `${base}ltä`, `${base}lle`]);
  if (base.endsWith('i')) {
    const stem = base.slice(0, -1);
    forms.add(`${stem}issa`);
    forms.add(`${stem}issä`);
    forms.add(`${stem}ista`);
    forms.add(`${stem}istä`);
    forms.add(`${stem}iin`);
  }
  return [...forms];
};

const extractNewspaperLinks = (text) => {
  const result = [];
  for (const match of text.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\s*\}/g)) {
    result.push({ name: match[1], url: match[2] });
  }
  return result;
};

const extractMunicipalities = (text) => {
  const municipalities = [];
  for (const match of text.matchAll(/"name":\s*"([^"]+)",\s*"wellbeingAreaCode":/g)) {
    municipalities.push(match[1]);
  }
  return municipalities;
};

const resolveMunicipality = (title, municipalities) => {
  const haystack = ` ${stripDiacritics(normalizeText(title))} `;
  const ordered = [...municipalities].sort((a, b) => b.length - a.length);
  for (const municipality of ordered) {
    const forms = getInflections(municipality);
    if (forms.some((form) => haystack.includes(` ${form} `))) {
      return municipality;
    }
  }
  return '';
};

const cleanUrl = (url) => url.replace(/&amp;/g, '&').replace(/[)\].,;]+$/g, '');
const normalizeFeedUrl = (url) => cleanUrl(url).replace(/\/+$/g, '');

const isCandidateUrl = (url) => {
  try {
    const parsed = new URL(cleanUrl(url));
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (['mediawiki.org', 'wikimedia.org', 'wikipedia.org', 'creativecommons.org', 'donate.wikimedia.org', 'web.archive.org', 'archive.org', 'tools.wmflabs.org', 'wikimediafoundation.org', 'kansalliskirjasto.fi'].some((host) => parsed.hostname.includes(host))) return false;
    return true;
  } catch {
    return false;
  }
};

const comparableHost = (url) => {
  try {
    return new URL(url).hostname.toLocaleLowerCase('fi-FI').replace(/^www\./, '');
  } catch {
    return '';
  }
};

const discoverFeedLinks = async (siteUrl) => {
  if (!isCandidateUrl(siteUrl)) return [];

  const found = new Set();
  const candidates = new Set();
  const home = new URL(siteUrl);

  try {
    const response = await fetchWithTimeout(siteUrl, 8000);
    const text = await response.text();
    const patterns = [
      /<link[^>]+rel=["'][^"']*(?:alternate|feed)[^"']*["'][^>]*href=["']([^"']+)[\"'][^>]*>/gi,
      /href=["']([^"']*(?:feed|rss|atom|xml)[^"']*)["']/gi,
      /src=["']([^"']*(?:feed|rss|atom|xml)[^"']*)["']/gi,
    ];
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) {
        candidates.add(match[1]);
      }
    }
  } catch {
    // ignore homepage fetch failures and fall back to common feed endpoints
  }

  for (const pathSuffix of ['/feed', '/feed/', '/rss', '/rss.xml', '/feed.xml', '/atom.xml']) {
    candidates.add(new URL(pathSuffix, home).toString());
  }

  for (const candidate of candidates) {
    try {
      const absolute = new URL(cleanUrl(candidate), home).toString();
      if (!isCandidateUrl(absolute)) continue;
      const response = await fetchWithTimeout(absolute, 7000);
      if (!response.ok) continue;
      if (comparableHost(response.url) !== comparableHost(home.toString())) continue;
      const text = await response.text();
      const hasFeedRoot = /^\s*(?:<\?xml[^>]*>\s*)?(?:<\?xml-stylesheet[^>]*>\s*)?<(rss|feed|rdf:RDF)\b/i.test(text);
      const hasFeedItems = /<(item|entry)\b/i.test(text);
      const looksLikeFeed = hasFeedRoot && hasFeedItems;
      if (looksLikeFeed) {
        found.add(response.url);
      }
    } catch {
      // Ignore broken candidates.
    }
  }

  return [...found];
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

const main = async () => {
  const [newspaperText, registryText] = await Promise.all([
    readTsArray(NEWSPAPER_FILE),
    readTsArray(REGISTRY_FILE),
  ]);
  const newspapers = extractNewspaperLinks(newspaperText);
  const municipalities = extractMunicipalities(registryText);

  const discovered = [];
  const missingFeeds = [];
  const feedsByMunicipality = new Map();

  const scanned = await runLimited(newspapers, async (paper, index) => {
    const municipality = resolveMunicipality(paper.name, municipalities);
    const feeds = await discoverFeedLinks(paper.url);
    if (feeds.length === 0) {
      if (municipality) missingFeeds.push({ municipality, paper: paper.name, siteUrl: paper.url });
      if ((index + 1) % 10 === 0 || index + 1 === newspapers.length) {
        console.log(`${index + 1}/${newspapers.length}`);
      }
      return null;
    }

    const feedUrl = feeds[0];
    if ((index + 1) % 10 === 0 || index + 1 === newspapers.length) {
      console.log(`${index + 1}/${newspapers.length}`);
    }
    return { municipality, paper: paper.name, siteUrl: paper.url, feedUrl };
  }, SCAN_CONCURRENCY);

  for (const item of scanned.filter(Boolean)) {
    discovered.push(item);
    if (item.municipality) {
      const list = feedsByMunicipality.get(item.municipality) ?? [];
      list.push({ name: item.paper, url: item.feedUrl });
      feedsByMunicipality.set(item.municipality, list);
    }
  }

  for (const feed of MANUAL_NEWSPAPER_FEEDS) {
    const list = feedsByMunicipality.get(feed.municipality) ?? [];
    if (!list.some((item) => normalizeFeedUrl(item.url) === normalizeFeedUrl(feed.url))) {
      list.push({ name: feed.name, url: feed.url });
      discovered.push({
        municipality: feed.municipality,
        paper: feed.name,
        siteUrl: feed.url,
        feedUrl: feed.url,
      });
    }
    feedsByMunicipality.set(feed.municipality, list);
  }

  const feedEntries = [...feedsByMunicipality.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'fi-FI'))
    .flatMap(([municipality, feeds]) => feeds.map((feed) => ({ municipality, ...feed })));

  const output = `export const LOCAL_NEWSPAPER_FEEDS = ${JSON.stringify(feedEntries, null, 2)} as const;\n`;
  await writeFile(OUTPUT_FILE, output, 'utf8');

  await mkdir(DOCS_DIR, { recursive: true });
  const missingMunicipalities = [...new Set(
    municipalities.filter((municipality) => !feedsByMunicipality.has(municipality))
  )].sort((a, b) => a.localeCompare(b, 'fi-FI'));
  const feedUrlsWithMunicipality = new Set(discovered.filter((item) => item.municipality).map((item) => normalizeFeedUrl(item.feedUrl)));
  const displayedFeeds = discovered.filter((item) => item.municipality || !feedUrlsWithMunicipality.has(normalizeFeedUrl(item.feedUrl)));
  const uniqueFeedUrlCount = new Set(discovered.map((item) => item.feedUrl)).size;

  const docLines = [
    '# Paikallisuutiset ilman RSS-syötettä',
    '',
    `Kuntiin liitettyjä paikallislehtien RSS-/feed-linkkejä: ${feedEntries.length}`,
    `Kunnille katettuja paikallisuutisten RSS-kuntia: ${feedsByMunicipality.size}`,
    `Löydettyjä uniikkeja RSS-/feed-osoitteita: ${uniqueFeedUrlCount}`,
    `Kuntia ilman paikallislehtien RSS-/feed-löydöstä: ${missingMunicipalities.length}`,
    '',
    '## Löydetyt syötteet',
    ...displayedFeeds
      .slice()
      .sort((a, b) => `${a.municipality || ''}${a.paper}`.localeCompare(`${b.municipality || ''}${b.paper}`, 'fi-FI'))
      .map((item) => `- ${item.municipality || '(ei kuntamäppäystä)'}: ${item.paper} - ${item.feedUrl}`),
    '',
    '## Kunnat',
    ...missingMunicipalities.map((municipality) => `- ${municipality}`),
    '',
  ];
  await writeFile(MISSING_DOC, `${docLines.join('\n')}`, 'utf8');

  console.log(`Löytyi feediä ${discovered.length} lehdelle.`);
  console.log(`Kuntia ilman paikallislehtien RSS-/feed-löydöstä: ${missingMunicipalities.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
