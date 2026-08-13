import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const TIMEOUT_MS = 8_000;
const CONCURRENCY = 5;
const MAX_PAGES_TO_SCORE = 12;
const MAX_CHILD_SITEMAPS = 15;
const MAX_HUB_PAGES = 6;
const MAX_SEARCH_PAGES = 7;
const MAX_REPORTED_CANDIDATES = 5;

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const decodeHtml = (value) => String(value ?? '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, ' ')
  .replace(/&auml;/gi, 'ä')
  .replace(/&ouml;/gi, 'ö')
  .replace(/&aring;/gi, 'å')
  .replace(/&#0?39;/g, "'")
  .replace(/&apos;/g, "'")
  .replace(/&#x2d;/gi, '-')
  .replace(/&#8211;|&#x2013;/gi, '–')
  .replace(/&#8212;|&#x2014;/gi, '—')
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
  .replace(/\u00ad/g, '');
const stripTags = (html) => decodeHtml(html)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const normalizeText = (value) => stripTags(String(value ?? ''))
  .toLocaleLowerCase('fi-FI')
  .normalize('NFKC')
  .replace(/[–—_/.-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const displayMunicipality = (value) => value.charAt(0).toLocaleUpperCase('fi-FI') + value.slice(1);

const parseWebsiteMap = (source) => {
  const rows = [];
  for (const match of source.matchAll(/'([^']+)':\s*'([^']+)'/g)) {
    rows.push({ key: match[1], municipality: displayMunicipality(match[1]), baseUrl: match[2] });
  }
  return rows;
};

const fetchText = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.7',
        'user-agent': 'SeniorinAloitussivu municipality senior page discovery',
      },
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !/text\/html|text\/plain|application\/xhtml\+xml|application\/xml|text\/xml/i.test(contentType)) {
      return { ok: false, status: response.status, finalUrl: response.url || url, text: '' };
    }
    return { ok: true, status: response.status, finalUrl: response.url || url, text: await response.text() };
  } catch (error) {
    return { ok: false, status: error?.name ?? 'error', finalUrl: url, text: '' };
  } finally {
    clearTimeout(timeout);
  }
};

const resolveUrl = (href, baseUrl) => {
  if (!href || /^(mailto|tel|javascript):/i.test(href)) return '';
  try {
    const url = new URL(decodeHtml(href), baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (/\.(pdf|docx?|xlsx?|pptx?|zip|jpe?g|png|webp|svg|ics)$/i.test(url.pathname)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
};

const comparableHost = (value) => {
  try { return new URL(value).hostname.replace(/^www\./, '').toLocaleLowerCase('fi-FI'); } catch { return ''; }
};
const sameSite = (candidate, baseUrl) => {
  const candidateHost = comparableHost(candidate);
  const baseHost = comparableHost(baseUrl);
  return Boolean(candidateHost && baseHost && (
    candidateHost === baseHost
    || candidateHost.endsWith(`.${baseHost}`)
    || baseHost.endsWith(`.${candidateHost}`)
  ));
};

const positiveTerms = [
  ['seniorityö', 150], ['seniorityo', 150], ['senioripalvelut', 140],
  ['ikäihmisten palvelut', 135], ['ikaihmisten palvelut', 135],
  ['ikääntyneiden palvelut', 135], ['ikaantyneiden palvelut', 135],
  ['vanhusten palvelut', 135], ['vanhuspalvelut', 125], ['vanhuspalvelu', 120],
  ['vanhustyö', 125], ['vanhustyo', 125], ['palvelut senioreille', 120],
  ['seniorineuvonta', 115], ['ikäihmiset', 95], ['ikaihmiset', 95],
  ['ikäihmisille', 90], ['ikaihmisille', 90], ['ikäihminen', 75], ['ikaihminen', 75],
  ['ikääntyneet', 95], ['ikaantyneet', 95], ['ikääntyneille', 90], ['ikaantyneille', 90],
  ['ikääntyvä', 65], ['ikaantyva', 65], ['seniorit', 85], ['senioreille', 85],
  ['seniorisivut', 120], ['ikäystävällinen', 70], ['ikaystavallinen', 70],
  ['eläkeläiset', 55], ['elakelaiset', 55], ['eläkeläinen', 50], ['elakelainen', 50],
  ['eläkkeellä', 45], ['elakkeella', 45], ['vanhukset', 65], ['vanhus', 45],
  ['äldre personer', 95], ['aldre personer', 95], ['äldreomsorg', 110],
  ['aldreomsorg', 110], ['äldreservice', 110], ['aldreservice', 110],
  ['seniorservice', 110], ['seniorer', 85], ['för äldre', 90], ['for aldre', 90],
  ['äldre', 50], ['aldre', 50], ['pensionärer', 60], ['pensionarer', 60],
  ['pensionär', 55], ['pensionar', 55], ['pensionerad', 45],
];
const negativeTerms = [
  ['tapahtuma', -150], ['evenemang', -150], ['uutinen', -120], ['uutiset', -100],
  ['news article', -120], ['ajankohtaista', -80], ['blogi', -80],
  ['senioriliikunta', -90], ['liikunta', -55], ['motion', -45], ['idrott', -45],
  ['eläkeläisyhdistys', -70], ['elakelaisyhdistys', -70], ['yhdistys', -35],
  ['työpaikka', -100], ['tyopaikka', -100], ['rekry', -100], ['pdf', -100],
];

const scoreText = (value, { includeNegative = true } = {}) => {
  const text = normalizeText(value);
  let score = 0;
  const hits = [];
  for (const [term, weight] of positiveTerms) {
    if (text.includes(term)) {
      score += weight;
      hits.push(term);
    }
  }
  if (includeNegative) {
    for (const [term, weight] of negativeTerms) {
      if (text.includes(term)) score += weight;
    }
  }
  return { score, hits };
};

const confidenceForScore = (score, candidateType = 'palvelusivu') => {
  if (candidateType === 'viitesivu') return score >= 130 ? 'keskitaso' : score >= 70 ? 'matala' : 'ei löytynyt';
  if (score >= 230) return 'korkea';
  if (score >= 130) return 'keskitaso';
  if (score >= 70) return 'matala';
  return 'ei löytynyt';
};

const referencePageTerms = [
  'vanhusneuvosto', 'äldreråd', 'aldrerad', 'eläkeläisyhdistys', 'elakelaisyhdistys',
  'senioriliikunta', 'senioreiden liikunta', 'ikäihmisten liikunta', 'ikaihmisten liikunta',
  'ikääntyneiden liikunta', 'ikaantyneiden liikunta', 'motion för äldre', 'motion for aldre',
  'kulttuuria senioreille', 'kulttuuria ikääntyneille', 'kulttuuria ikaantyneille',
  'tapahtumat senioreille', 'senioritapahtuma', 'eläkeläisjärjestö', 'elakelaisjarjesto',
  'uutinen', 'uutiset', 'ajankohtaista', 'tiedote', 'meddelande', 'nyheter',
  'kampanja', 'joulupostia', 'hanke', 'projekti', 'kysely', 'enkät', 'enkat',
  'ilmoittaudu', 'anmälan', 'anmalan', 'kutsu', 'tilaisuus', 'kurssi', 'ryhmä', 'ryhma',
  'avustus', 'hakemus', 'ansökan', 'ansokan', 'odotusajat', 'väntetider', 'vantetider',
  'kaavaluonnos', 'asukastilaisuus', 'vanhustenviikko', 'äldres vecka', 'aldres vecka',
  'senioritori', 'senioritalo', 'serviceguide', 'palveluopas',
];
const directLandingTerms = [
  'seniorityö', 'seniorityo', 'senioripalvelu', 'seniorisivu', 'seniorineuvonta',
  'ikäihmisten palvelut', 'ikaihmisten palvelut', 'ikääntyneiden palvelut',
  'ikaantyneiden palvelut', 'vanhusten palvelut', 'vanhuspalvelu', 'vanhustyö', 'vanhustyo',
  'palvelut senioreille', 'palveluja senioreille', 'ikäihmiselle', 'ikaihmiselle', 'ikäihmiset', 'ikaihmiset',
  'ikääntyvien palvelut', 'ikaantyvien palvelut', 'ikäihmisille', 'ikaihmisille',
  'ikääntyneille', 'ikaantyneille', 'ikääntyneet', 'ikaantyneet',
  'seniorit', 'senioreille', 'äldreomsorg', 'aldreomsorg', 'äldreservice', 'aldreservice',
  'seniorservice', 'för äldre', 'for aldre', 'seniorer',
];

const candidateTypeFor = (title, url) => {
  const text = normalizeText(`${title} ${url}`);
  if (referencePageTerms.some((term) => text.includes(term))) return 'viitesivu';
  if (directLandingTerms.some((term) => text.includes(term))) return 'palvelusivu';
  return 'viitesivu';
};

const titleFromHtml = (html) => {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).slice(0, 160);
  const ogTitle = html.match(/<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i);
  if (ogTitle) return decodeHtml(ogTitle[1]).slice(0, 160);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return title ? stripTags(title[1]).slice(0, 160) : '';
};

const looksLikeErrorPage = (title, html) => {
  const text = normalizeText(`${title} ${stripTags(html).slice(0, 1400)}`);
  return ['virhe 404', 'sivua ei löytynyt', 'sivua ei loytynyt', 'page not found', 'not found', 'sidan hittades inte']
    .some((term) => text.includes(term));
};

const looksLikeLandingPage = (title, url) => {
  const normalizedTitle = normalizeText(title);
  let normalizedPath = '';
  try {
    normalizedPath = normalizeText(decodeURIComponent(new URL(url).pathname));
  } catch {
    normalizedPath = normalizeText(url);
  }
  const excludedPathTerms = [
    'category', 'km event category', 'jarjestaja', 'järjestäjä', 'uutiset', 'nyheter',
    'news article', 'ajankohtaista', 'tapahtuma', 'event', 'arviointikertomus',
    'avainsana', 'tag', 'hakutulos', 'hakutulokset', 'haku', 'search',
    'kurssit', 'kursverksamhet', 'rekry', 'lediga tjanster', 'lediga tjänster',
    'fortroendevalda', 'förtroendevalda', 'jarjestot', 'järjestöt',
    'avgifter', 'institutionsvard', 'institutionsvård', 'organisation och arbete',
    'administrativ organisation', 'pakolaispalvelut',
    'kotoutumisen palvelukartta', 'seniorikartta auttaa', 'vi soker', 'vi söker',
    'rokotusapua',
  ];
  const excludedTitleTerms = [
    'arkistot', 'arviointikertomus', 'vi söker', 'vi soker', 'lediga tjänster',
    'lediga tjanster', 'kokeilu käyntiin',
    'personaldimensioneringen', 'sommarcafe', 'sommarcafé', 'låtskrivning',
    'latskrivning', 'rokotusapua', 'yhdessä vellamoon', 'auttaa löytämään',
    'söker en servicechef', 'soker en servicechef',
    'rehabilitering', 'barn och äldreomsorg avgifter', 'aldreomsorgsnamnden',
    'äldreomsorgsnämnden', 'aldreomsorgssektorn', 'äldreomsorgssektorn',
  ];
  return !excludedPathTerms.some((term) => normalizedPath.includes(term))
    && !excludedTitleTerms.some((term) => normalizedTitle.includes(term));
};

// The score is intentionally conservative. These official landing pages were
// manually checked after discovery because generic page chrome kept their score
// just below the automatic high-confidence threshold.
const manualCuration = {
  helsinki: { promote: true },
  kangasniemi: { promote: true, name: 'Ikääntyneet' },
  kittilä: { promote: true },
  kärkölä: { promote: true },
  liperi: { promote: true },
  muurame: { promote: true },
  nurmijärvi: { promote: true },
  pyhäranta: { promote: true, name: 'Ikäihmisten palvelut' },
  ähtäri: { promote: true },
  hamina: { name: 'Ikääntyneiden palvelut' },
  luoto: { name: 'Aktiiviset seniorit' },
  merikarvia: { name: 'Ikäihmisten palvelut' },
  lapinjärvi: { exclude: true },
  finström: { approve: true, name: 'Hemservice och äldreboende', url: 'https://www.finstrom.ax/social-service/hemservice-aldreboende' },
  hanko: { approve: true, name: 'Tjänster för äldre', url: 'https://hanko.fi/sv/halsa-och-valmaende/tjanster-for-aldre/' },
  huittinen: { approve: true, name: 'Seniorit', url: 'https://www.huittinen.fi/vapaa-aika/seniorit/' },
  humppila: { approve: true, name: 'Seniorit', url: 'https://www.humppila.fi/vapaa-aika-ja-matkailu/seniorit/' },
  jyväskylä: { approve: true, name: 'Palveluja senioreille', url: 'https://www.jyvaskyla.fi/palveluja-senioreille' },
  kangasala: { approve: true, name: 'Ikääntyneille', url: 'https://www.kangasala.fi/kohderyhmat/ikaantyneille/' },
  kannonkoski: { approve: true, name: 'Seniorit', url: 'https://kannonkoski.fi/seniorit' },
  karstula: { approve: true, name: 'Seniorit', url: 'https://karstula.fi/vapaa-aika-ja-matkailu/seniorit/' },
  kaskinen: { approve: true, name: 'Seniorit', url: 'https://kaskinen.fi/fi/seniorit' },
  kauhava: { approve: true, name: 'Senioreille', url: 'https://kauhava.fi/senioreille/' },
  kauniainen: { approve: true, name: 'Senioripalvelut ja Villa Breda', url: 'https://www.kauniainen.fi/hyvinvointi/lansi-uudenmaan-hyvinvointialue/villa-breda-ja-seniorit/' },
  keuruu: { approve: true, name: 'Ikääntyneille', url: 'https://keuruu.fi/ikaantyneille/' },
  kirkkonummi: { approve: true, name: 'Seniorit', url: 'https://kirkkonummi.fi/tietoa-kirkkonummesta/tietoa-kunnasta/lapsiperheet-nuoret-ja-seniorit/seniorit/' },
  kotka: { approve: true, name: 'Ikääntyneet', url: 'https://www.kotka.fi/ikaantyneet/' },
  kouvola: { approve: true, name: 'Ikääntyneet', url: 'https://www.kouvola.fi/ikaantyneet' },
  kumlinge: { approve: true, name: 'Äldreomsorg', url: 'https://www.kumlinge.ax/social-omsorg/aldreomsorg' },
  kurikka: { approve: true, name: 'Ikäihmiset', url: 'https://kurikka.fi/target_group/ikaihmiset/' },
  laihia: { approve: true, name: 'Vanhuspalvelut', url: 'https://laihia.fi/palveluhakemisto/vanhuspalvelut-5/' },
  lapua: { approve: true, name: 'Ikäihmiset', url: 'https://lapua.fi/etusivu/vahvuutena-v%C3%A4litt%C3%A4minen/v%C3%A4litt%C3%A4misen-ty%C3%B6kalupakki/ik%C3%A4ihmiset/' },
  laukaa: { approve: true, name: 'Ikäihmiset', url: 'https://www.laukaa.fi/asukkaat/palvelut-kohderyhmittain/ikaihmiset/' },
  lemi: { approve: true, name: 'Vanhuspalvelut', url: 'https://lemi.fi/palvelut/sosiaali-ja-terveyspalvelut/vanhuspalvelus/' },
  maalahti: { approve: true, name: 'Aktiva seniorer', url: 'https://www.malax.fi/fritid-och-kultur/aktiva-seniorer/' },
  maarianhamina: { approve: true, name: 'Äldre och omsorg', url: 'https://www.mariehamn.ax/aldre-och-omsorg' },
  oripää: { approve: true, name: 'Varhan vanhustenhuollon palvelut', url: 'https://oripaa.fi/asukkaalle/hyvinvointi/varsinais-suomen-hyvinvointialue/vanhuspalvelut/' },
  oulu: { approve: true, name: 'Ikääntyneet', url: 'https://www.ouka.fi/ikaantyneet' },
  parainen: { approve: true, name: 'Seniorit', url: 'https://www.pargas.fi/fi/seniorit' },
  parikkala: { approve: true, name: 'Ikääntyneet', url: 'https://parikkala.fi/ikaantyneet/' },
  pedersören: { approve: true, name: 'Seniorer', url: 'https://www.pedersore.fi/sv/valfard/seniorer/' },
  petäjävesi: { approve: true, name: 'Senioreille', url: 'https://www.petajavesi.fi/vapaa-aika-ja-hyvinvointi/senioreille/' },
  pieksämäki: { approve: true, name: 'Ikäihmisten palvelut', url: 'https://www.pieksamaki.fi/terveys-ja-hyvinvointi/ikaneuvola/' },
  pietarsaari: { approve: true, name: 'Välfärdstjänster för seniorer', url: 'https://jakobstad.fi/invanare/framjande-av-valfard-och-halsa/valfarstjanster-for-seniorer' },
  porvoo: { approve: true, name: 'Seniorernas välmående', url: 'https://www.porvoo.fi/sv/valmaende-och-sakerhet/seniorernas-valmaende/' },
  pudasjärvi: { approve: true, name: 'Pudasjärven seniorisivut', url: 'https://www.pudasjarvi.fi/asuminen-ja-ymparisto/seniorit/' },
  pöytyä: { approve: true, name: 'Vanhustyö', url: 'https://www.poytya.fi/voi-hyvin/vanhustyo/' },
  ranua: { approve: true, name: 'Senioreille', url: 'https://ranua.fi/senioreille/' },
  riihimäki: { approve: true, name: 'Avoin senioritoiminta', url: 'https://www.riihimaki.fi/ela-ja-voi-hyvin/hyvinvointi/aktiivisuutta-arkeen/avoin-senioritoiminta/' },
  rovaniemi: { approve: true, name: 'Ikäihmiselle', url: 'https://www.rovaniemi.fi/Palvelut-sinulle/Ikaihmiselle' },
  saarijärvi: { approve: true, name: 'Ikäihmiset', url: 'https://saarijarvi.fi/sosiaali-ja-terveyspalvelut/ikaihmiset/' },
  sastamala: { approve: true, name: 'Toimintakykyä ja osallisuutta ikääntyneille', url: 'https://sastamala.fi/arki-ja-vapaa-aika/hyvinvointi-ja-terveys/ikaantyneiden-hyvinvoinnin-ja-terveyden-edistaminen/toimintakykya-ja-osallisuutta-ikaantyneille/' },
  seinäjoki: { approve: true, name: 'Ikääntyvien palvelut', url: 'https://www.seinajoki.fi/ikaantyvien-palvelut/' },
  suonenjoki: { approve: true, name: 'Seniorit', url: 'https://suonenjoki.fi/seniorit/' },
  sysmä: { approve: true, name: 'Senioreille', url: 'https://sysma.fi/senioreille/' },
  taivassalo: { approve: true, name: 'Vanhustyö', url: 'https://taivassalo.fi/sote/vanhustyo' },
  tampere: { approve: true, name: 'Ikääntyneet', url: 'https://www.tampere.fi/ikaantyneet' },
  teuva: { approve: true, name: 'Ikääntyneet', url: 'https://teuva.fi/ikaantyneet/' },
  turku: { approve: true, name: 'Seniorit', url: 'https://www.turku.fi/seniorit' },
  urjala: { approve: true, name: 'Ikäihmiset', url: 'https://www.urjala.fi/ikaihmiset/' },
  uurainen: { approve: true, name: 'Ikäihmiset', url: 'https://uurainen.fi/sosiaali-ja-terveyspalvelut/ikaihmiset/' },
  vaasa: { approve: true, name: 'Ikäihmisille', url: 'https://www.vaasa.fi/asu-ja-ela/palvelut-kohderyhmittain/ikaihmisille/' },
  vantaa: { approve: true, name: 'Palvelut senioreille', url: 'https://www.vantaa.fi/fi/tukea-ja-apua-arkeen/senioreille' },
  virrat: { approve: true, name: 'Ikäihmisten palvelut', url: 'https://www.virrat.fi/hyvinvoinnin-toimiala134460894/hyvinvoinnin-ja-terveyden-edistaminen/elintapaohjaus/ikaihmisten-palvelut/' },
  ylöjärvi: { approve: true, name: 'Ikäihmiset', url: 'https://www.ylojarvi.fi/ikaihmiset/' },
  äänekoski: { approve: true, name: 'Ikääntyneet', url: 'https://www.aanekoski.fi/ikaantyneet' },
};

// Stable baseline from the first manually reviewed pass. Keeping this separate
// prevents an overly broad automatic run from becoming trusted input on the
// next run merely because it rewrote localSeniorLinks.ts.
const baselineVerifiedKeys = new Set([
  'akaa', 'asikkala', 'brändö', 'eckerö', 'espoo', 'eura', 'föglö', 'geta',
  'hamina', 'hammarland', 'helsinki', 'hyvinkää', 'ii', 'isokyrö', 'joensuu',
  'jokioinen', 'joutsa', 'järvenpää', 'kangasniemi', 'kannus', 'kauhajoki',
  'keitele', 'kemi', 'kittilä', 'kyyjärvi', 'kärkölä', 'lemland', 'lempäälä',
  'leppävirta', 'lieto', 'liperi', 'luhanka', 'lumparland', 'luoto', 'merikarvia',
  'muhos', 'muurame', 'mynämäki', 'myrskylä', 'mäntsälä', 'naantali',
  'nurmijärvi', 'orimattila', 'outokumpu', 'padasjoki', 'pornainen', 'posio',
  'pukkila', 'pyhtää', 'pyhäjoki', 'pyhäranta', 'raahe', 'rantasalmi',
  'ristijärvi', 'salla', 'salo', 'saltvik', 'sievi', 'sund', 'toivakka',
  'tuusula', 'ulvila', 'utajärvi', 'vesilahti', 'viitasaari', 'virolahti',
  'vårdö', 'vöyri', 'ylivieska', 'ähtäri',
]);

const extractAnchors = (html, baseUrl, source = 'etusivu') => {
  const anchors = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = resolveUrl(match[1] ?? match[2] ?? match[3], baseUrl);
    if (!url || !sameSite(url, baseUrl)) continue;
    anchors.push({ url, text: stripTags(match[4]), source });
  }
  return anchors;
};

const extractSitemapLocs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
  .map((match) => decodeHtml(match[1]).trim());

const sitemapCandidates = async (baseUrl) => {
  const robotsUrl = resolveUrl('/robots.txt', baseUrl);
  const robots = robotsUrl ? await fetchText(robotsUrl) : { ok: false, text: '' };
  const robotsSitemaps = robots.ok
    ? [...robots.text.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)].map((match) => resolveUrl(match[1], baseUrl)).filter(Boolean)
    : [];
  const roots = [...new Set([
    ...['/sitemap.xml', '/wp-sitemap.xml', '/sitemap_index.xml'].map((item) => resolveUrl(item, baseUrl)),
    ...robotsSitemaps,
  ].filter(Boolean))];
  const pageUrls = [];
  const childSitemaps = [];

  const rootResults = await Promise.all(roots.map(async (sitemapUrl) => ({
    sitemapUrl,
    result: await fetchText(sitemapUrl),
  })));
  for (const { result } of rootResults) {
    if (!result.ok) continue;
    for (const loc of extractSitemapLocs(result.text)) {
      if (!sameSite(loc, baseUrl)) continue;
      if (/\.xml(?:\?|$)/i.test(loc)) childSitemaps.push(loc);
      else pageUrls.push(loc);
    }
  }

  const rankedChildren = [...new Set(childSitemaps)]
    .sort((a, b) => {
      const rank = (value) => /(?:page|pages|sivu|post|content)/i.test(value) ? 1 : 0;
      return rank(b) - rank(a);
    })
    .slice(0, MAX_CHILD_SITEMAPS);
  const childResults = await Promise.all(rankedChildren.map(async (childUrl) => ({
    childUrl,
    result: await fetchText(childUrl),
  })));
  for (const { result } of childResults) {
    if (!result.ok) continue;
    pageUrls.push(...extractSitemapLocs(result.text).filter((loc) => sameSite(loc, baseUrl) && !/\.xml(?:\?|$)/i.test(loc)));
  }

  return [...new Set(pageUrls)]
    .map((url) => ({ url, text: url.replace(/[-_/]/g, ' '), source: 'sivukartta' }))
    .filter((item) => scoreText(item.text).score >= 50);
};

const fixedPaths = [
  'seniorit', 'senioreille', 'seniorityo', 'seniorityö', 'senioripalvelut', 'seniorisivut',
  'ikaihmiset', 'ikäihmiset', 'ikaihmisille', 'ikäihmisille', 'ikaantyneet', 'ikääntyneet',
  'vanhuspalvelut', 'vanhusten-palvelut', 'vanhustyo', 'vanhustyö',
  'elakelaiset', 'eläkeläiset', 'elakkeella', 'eläkkeellä',
  'hyvinvointi-ja-terveys/seniorityo', 'hyvinvointi-ja-terveys/seniorit',
  'hyvinvointi-ja-terveys/ikaihmiset', 'hyvinvointi-ja-terveys/ikaantyneet',
  'hyvinvointi-ja-vapaa-aika/ikaihmiset', 'hyvinvointi-ja-vapaa-aika/seniorit',
  'hyvinvointi/ikaihmiset', 'hyvinvointi/ikaantyneet', 'hyvinvointi/seniorit',
  'palvelut/seniorit', 'palvelut/senioreille', 'palvelut/ikaihmiset',
  'palvelut/ikaantyneet', 'palvelut/vanhukset', 'palvelut/vanhuspalvelut',
  'sosiaali-ja-terveys/ikaihmiset', 'sosiaali-ja-terveys/ikaantyneet',
  'sosiaali-ja-terveyspalvelut/senioripalvelut', 'sosiaali-ja-terveyspalvelut/ikaihmiset',
  'asukkaalle/ikaihmiset', 'asukkaalle/ikaantyneet', 'asukkaalle/vanhuspalvelut',
  'eldre', 'seniorer', 'aldreomsorg', 'aldreservice', 'service/aldre', 'service/seniorer',
  'vard-och-omsorg/aldreomsorg', 'social-och-halsa/aldre',
];
const pathCandidates = (baseUrl) => fixedPaths.flatMap((item) => [item, `${item}/`])
  .map((item) => ({ url: resolveUrl(item, baseUrl), text: item, source: 'polku' }))
  .filter((item) => item.url);

const hubTerms = [
  ['ikäryhm', 100], ['ikaryhm', 100], ['kohderyhm', 90], ['elämänkaari', 85], ['elamankaari', 85],
  ['hyvinvointi', 80], ['terveys', 70], ['palvelut', 65], ['asukkaalle', 60], ['kuntalaiselle', 60],
  ['vapaa aika', 50], ['arki', 40], ['tukea ja apua', 70], ['social', 60], ['omsorg', 70],
  ['hälsa', 60], ['halsa', 60], ['välfärd', 65], ['valfard', 65], ['service', 45],
];
const scoreHub = (value) => {
  const text = normalizeText(value);
  return hubTerms.reduce((sum, [term, weight]) => sum + (text.includes(term) ? weight : 0), 0);
};

const deepAnchorCandidates = async (homeHtml, baseUrl) => {
  const hubs = uniqueCandidates(extractAnchors(homeHtml, baseUrl))
    .map((item) => ({ ...item, hubScore: scoreHub(`${item.text} ${item.url}`) }))
    .filter((item) => item.hubScore > 0 && looksLikeLandingPage(item.text, item.url))
    .sort((a, b) => b.hubScore - a.hubScore)
    .slice(0, MAX_HUB_PAGES);
  const candidates = [];

  const hubResults = await Promise.all(hubs.map(async (hub) => ({ hub, page: await fetchText(hub.url) })));
  for (const { page } of hubResults) {
    if (!page.ok || !sameSite(page.finalUrl, baseUrl)) continue;
    candidates.push(...extractAnchors(page.text, page.finalUrl, 'syvälinkki')
      .filter((item) => scoreText(`${item.text} ${item.url}`).score >= 40));
  }

  return candidates;
};

const searchTerms = ['ikäihmiset', 'ikääntyneet', 'vanhus', 'seniori', 'eläkeläinen', 'äldre', 'pensionär'];
const extractSearchTemplate = (html, baseUrl) => {
  for (const match of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    const attributes = match[1];
    const body = match[2];
    const method = attributes.match(/\bmethod\s*=\s*["']?([^\s"'>]+)/i)?.[1]?.toLocaleLowerCase('fi-FI') ?? 'get';
    if (method !== 'get') continue;
    const actionValue = attributes.match(/\baction\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const action = resolveUrl(actionValue?.[1] ?? actionValue?.[2] ?? actionValue?.[3] ?? baseUrl, baseUrl);
    if (!action || !sameSite(action, baseUrl)) continue;
    const inputs = [...body.matchAll(/<input\b([^>]*)>/gi)].map((input) => input[1]);
    const searchInput = inputs.find((input) => /\btype\s*=\s*["']?search/i.test(input))
      ?? inputs.find((input) => /\bname\s*=\s*["']?(?:s|q|query|search|searchword|keyword)\b/i.test(input));
    const name = searchInput?.match(/\bname\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const parameter = name?.[1] ?? name?.[2] ?? name?.[3];
    if (parameter) return { action, parameter };
  }

  if (/wp-content|wp-includes|wp-json/i.test(html)) return { action: baseUrl, parameter: 's' };
  return null;
};

const internalSearchCandidates = async (homeHtml, baseUrl) => {
  const template = extractSearchTemplate(homeHtml, baseUrl);
  if (!template) return [];
  const candidates = [];

  const searchResults = await Promise.all(searchTerms.slice(0, MAX_SEARCH_PAGES).map(async (term) => {
    const searchUrl = new URL(template.action);
    searchUrl.searchParams.set(template.parameter, term);
    return fetchText(searchUrl.toString());
  }));
  for (const page of searchResults) {
    if (!page.ok || !sameSite(page.finalUrl, baseUrl)) continue;
    candidates.push(...extractAnchors(page.text, page.finalUrl, 'sisäinen haku')
      .filter((item) => scoreText(`${item.text} ${item.url}`).score >= 40));
  }

  return candidates;
};

const uniqueCandidates = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url.replace(/\/+$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseKnownSeniorLinks = (source) => {
  const rows = new Map();
  for (const match of source.matchAll(/\{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"[\s\S]*?"municipality":\s*"([^"]+)"[\s\S]*?\}/g)) {
    const fullName = decodeHtml(match[1]);
    rows.set(match[3], {
      name: fullName.includes(' – ') ? fullName.split(' – ').slice(1).join(' – ') : fullName,
      url: decodeHtml(match[2]),
    });
  }
  return rows;
};

const sourceBonus = (source) => ({
  etusivu: 180,
  sivukartta: 160,
  syvälinkki: 150,
  'sisäinen haku': 140,
  polku: 0,
}[source] ?? 0);

const discoverMunicipality = async ({ key, municipality, baseUrl }, index, total, knownLinksByKey) => {
  console.log(`${index + 1}/${total} ${municipality}`);
  const known = knownLinksByKey.get(key);
  if (known) {
    const row = {
      key, municipality, baseUrl, name: known.name, url: known.url,
      status: 200, score: 999, confidence: 'korkea', candidateType: 'palvelusivu',
      source: 'aiemmin varmennettu', hits: 'aiemmin varmennettu',
    };
    return { best: row, candidates: [row] };
  }

  const home = await fetchText(baseUrl);
  const canonicalBase = home.finalUrl || baseUrl;
  const homeCandidates = home.text ? extractAnchors(home.text, canonicalBase) : [];
  const sitemapItems = await sitemapCandidates(canonicalBase);
  const deepItems = home.text ? await deepAnchorCandidates(home.text, canonicalBase) : [];
  const discoveredItems = [...homeCandidates, ...sitemapItems, ...deepItems]
    .filter((item) => scoreText(`${item.text} ${item.url}`).score >= 40);
  const strongestDiscoveredScore = discoveredItems.reduce(
    (bestScore, item) => Math.max(bestScore, scoreText(`${item.text} ${item.url}`).score),
    0,
  );
  const searchItems = home.text && strongestDiscoveredScore < 120
    ? await internalSearchCandidates(home.text, canonicalBase)
    : [];
  const candidates = uniqueCandidates([
    ...discoveredItems,
    ...searchItems,
    ...pathCandidates(canonicalBase),
  ]).map((item) => {
    const initialScore = scoreText(`${item.text} ${item.url}`).score;
    return { ...item, initialScore, rankingScore: initialScore + sourceBonus(item.source) };
  })
    .filter((item) => item.initialScore >= 40)
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, MAX_PAGES_TO_SCORE);

  const found = [];
  const candidatePages = await Promise.all(candidates.map(async (candidate) => ({
    candidate,
    page: await fetchText(candidate.url),
  })));
  for (const { candidate, page } of candidatePages) {
    if (!page.ok || !sameSite(page.finalUrl, canonicalBase)) continue;
    const title = titleFromHtml(page.text);
    if (!title || looksLikeErrorPage(title, page.text) || !looksLikeLandingPage(title, page.finalUrl)) continue;
    const titleScore = scoreText(`${title} ${page.finalUrl}`);
    const excerptScore = scoreText(stripTags(page.text).slice(0, 8000), { includeNegative: false });
    const candidateType = candidateTypeFor(title, page.finalUrl);
    const evidenceBonus = candidate.source === 'polku' ? 0 : 30;
    const score = candidate.initialScore + (titleScore.score * 2) + Math.min(excerptScore.score, 120) + evidenceBonus;
    const row = {
      key, municipality, baseUrl, name: title, url: page.finalUrl,
      status: page.status, score, confidence: confidenceForScore(score, candidateType), candidateType,
      source: candidate.source,
      hits: [...new Set([...titleScore.hits, ...excerptScore.hits])].join('; '),
    };
    found.push(row);
  }

  const ranked = found.toSorted((a, b) => {
    const typeDifference = (b.candidateType === 'palvelusivu' ? 1 : 0) - (a.candidateType === 'palvelusivu' ? 1 : 0);
    return typeDifference || b.score - a.score;
  });
  const best = ranked[0] ?? {
    key, municipality, baseUrl, name: '', url: '', status: home.status,
    score: 0, confidence: 'ei löytynyt', candidateType: '', source: '', hits: '',
  };
  return { best, candidates: ranked.slice(0, MAX_REPORTED_CANDIDATES) };
};

const runPool = async (items, worker) => {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index], index, items.length);
    }
  });
  await Promise.all(workers);
  return results;
};

const main = async () => {
  const websiteSource = await readFile(path.join(ROOT, 'municipalityWebsites.ts'), 'utf8');
  const knownSeniorSource = await readFile(path.join(ROOT, 'localSeniorLinks.ts'), 'utf8');
  const municipalities = parseWebsiteMap(websiteSource);
  const knownLinksByKey = new Map(
    [...parseKnownSeniorLinks(knownSeniorSource)].filter(([key]) => baselineVerifiedKeys.has(key)),
  );
  const scanResults = await runPool(
    municipalities,
    (municipality, index, total) => discoverMunicipality(municipality, index, total, knownLinksByKey),
  );
  const results = scanResults.map((result) => result.best);
  const curatedResults = results.map((row) => {
    const correction = manualCuration[row.key];
    const cleanedName = decodeHtml(row.name).replace(/\s+/g, ' ').trim();
    if (correction?.exclude) {
      return {
        ...row, name: '', url: '', score: 0, confidence: 'ei löytynyt',
        candidateType: '', source: '', hits: '',
      };
    }
    const approved = knownLinksByKey.has(row.key) || correction?.approve;
    return {
      ...row,
      name: correction?.name ?? cleanedName,
      url: correction?.url ?? row.url,
      confidence: approved || correction?.promote
        ? 'korkea'
        : row.confidence === 'korkea' ? 'keskitaso' : row.confidence,
      candidateType: approved ? 'palvelusivu' : row.candidateType,
      source: correction?.approve ? 'manuaalinen varmennus' : row.source,
      status: correction?.approve ? 200 : row.status,
    };
  });
  const ordered = [...curatedResults].sort((a, b) => a.municipality.localeCompare(b.municipality, 'fi'));
  const generatedAt = new Date().toLocaleString('fi-FI', {
    timeZone: 'Europe/Helsinki', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const summary = {
    total: ordered.length,
    high: ordered.filter((row) => row.confidence === 'korkea').length,
    medium: ordered.filter((row) => row.confidence === 'keskitaso').length,
    low: ordered.filter((row) => row.confidence === 'matala').length,
    missing: ordered.filter((row) => row.confidence === 'ei löytynyt').length,
  };

  await mkdir(DOCS_DIR, { recursive: true });
  const csvRows = [
    ['Päivitetty', 'Kunta', 'Varmuus', 'Tyyppi', 'Pisteet', 'Nimi', 'URL', 'Kunnan sivu', 'HTTP', 'Löytötapa', 'Osumat'].map(csvEscape).join(','),
    ...ordered.map((row) => [generatedAt, row.municipality, row.confidence, row.candidateType, row.score, row.name, row.url, row.baseUrl, row.status, row.source, row.hits].map(csvEscape).join(',')),
  ];
  const markdownRows = [
    '# Kuntien omat seniorisivut', '', `Päivitetty: ${generatedAt}`, '',
    `Tarkistettu: ${summary.total} kuntaa.`,
    `Korkean varmuuden suora seniorisivu löytyi ${summary.high} kunnalle.`,
    `Keskitasoisia ehdokkaita löytyi ${summary.medium}, matalan varmuuden ehdokkaita ${summary.low}.`,
    `Automaattinen kartoitus ei löytänyt ehdokasta ${summary.missing} kunnalle.`, '',
    'Kartoitus tarkistaa kuntien viralliset verkkotunnukset, niiden etusivujen linkit, tavallisimmat seniorisivujen polut, robots.txt-tiedoston sivukartat, palvelu- ja hyvinvointiosioiden syvälinkit sekä sivuston oman haun. Korkean varmuuden palvelusivut viedään sovellukseen. Vanhusneuvostot, yhdistykset sekä yksittäiset liikunta-, kulttuuri- ja tapahtumasivut merkitään viitesivuiksi eikä niitä tuoda automaattisesti.', '',
    '| Kunta | Varmuus | Tyyppi | Linkki | Löytötapa |', '|---|---:|---|---|---|',
    ...ordered.map((row) => `| ${row.municipality} | ${row.confidence} | ${row.candidateType || '-'} | ${row.url ? `[${row.name || row.url}](${row.url})` : '-'} | ${row.source || '-'} |`), '',
  ];
  const highConfidenceRows = ordered.filter((row) => row.confidence === 'korkea' && row.candidateType === 'palvelusivu' && row.url);
  const deepCandidateRows = scanResults.flatMap((result) => result.candidates)
    .filter((row) => !knownLinksByKey.has(row.key))
    .toSorted((a, b) => a.municipality.localeCompare(b.municipality, 'fi') || b.score - a.score);
  const deepCsvRows = [
    ['Päivitetty', 'Kunta', 'Varmuus', 'Tyyppi', 'Pisteet', 'Nimi', 'URL', 'Kunnan sivu', 'HTTP', 'Löytötapa', 'Osumat'].map(csvEscape).join(','),
    ...deepCandidateRows.map((row) => [generatedAt, row.municipality, row.confidence, row.candidateType, row.score, row.name, row.url, row.baseUrl, row.status, row.source, row.hits].map(csvEscape).join(',')),
  ];
  const deepMunicipalityCount = new Set(deepCandidateRows.map((row) => row.key)).size;
  const deepServiceMunicipalityCount = new Set(deepCandidateRows
    .filter((row) => row.candidateType === 'palvelusivu')
    .map((row) => row.key)).size;
  const deepReferenceMunicipalityCount = new Set(deepCandidateRows
    .filter((row) => row.candidateType === 'viitesivu')
    .map((row) => row.key)).size;
  const deepMarkdownRows = [
    '# Puuttuvien kuntien seniorisivujen syvätarkistus', '',
    `Päivitetty: ${generatedAt}`, '',
    `Lähtötilanteessa varmennettu seniorisivu oli ${knownLinksByKey.size} kunnalla ja syvätarkistettavia kuntia ${municipalities.length - knownLinksByKey.size}.`,
    `Vähintään yksi ehdokas löytyi ${deepMunicipalityCount} kunnalle. Palvelusivuehdokkaita löytyi ${deepServiceMunicipalityCount} kunnalle ja viitesivuja ${deepReferenceMunicipalityCount} kunnalle.`, '',
    'Palvelusivuehdokas on seniorien tai ikääntyneiden koonti- tai palvelusivu. Viitesivu voi olla esimerkiksi vanhusneuvosto, eläkeläisyhdistys, yksittäinen liikuntaryhmä, kulttuurisivu tai tapahtuma. Viitesivu osoittaa seniorisisällön olemassaolon, mutta sitä ei viedä sovellukseen senioripalvelujen päälinkiksi.', '',
    '| Kunta | Varmuus | Tyyppi | Pisteet | Linkki | Löytötapa |',
    '|---|---:|---|---:|---|---|',
    ...deepCandidateRows.map((row) => `| ${row.municipality} | ${row.confidence} | ${row.candidateType} | ${row.score} | [${row.name || row.url}](${row.url}) | ${row.source} |`), '',
  ];
  const tsRows = [
    "import { Provider } from './types';", '',
    `// Generated from the official municipality sites on ${new Date().toISOString().slice(0, 10)}.`,
    '// Only high-confidence, municipality-hosted senior landing pages are included.',
    'export const MUNICIPALITY_SENIOR_LINKS: Provider[] = [',
    ...highConfidenceRows.map((row) => `  ${JSON.stringify({
      name: `${row.municipality} – ${row.name}`,
      url: row.url,
      group: 'Oman kunnan senioripalvelut',
      municipality: row.key,
      scope: 'municipality',
      verifiedAt: new Date().toISOString().slice(0, 10),
    }, null, 2).split('\n').join('\n  ')},`),
    '];', '',
  ];

  await Promise.all([
    writeFile(path.join(DOCS_DIR, 'kuntien-seniorisivut.csv'), `${csvRows.join('\n')}\n`, 'utf8'),
    writeFile(path.join(DOCS_DIR, 'kuntien-seniorisivut.md'), `${markdownRows.join('\n')}\n`, 'utf8'),
    writeFile(path.join(DOCS_DIR, 'kuntien-seniorisivut-syvatarkistus.csv'), `${deepCsvRows.join('\n')}\n`, 'utf8'),
    writeFile(path.join(DOCS_DIR, 'kuntien-seniorisivut-syvatarkistus.md'), `${deepMarkdownRows.join('\n')}\n`, 'utf8'),
    writeFile(path.join(ROOT, 'localSeniorLinks.ts'), `${tsRows.join('\n')}\n`, 'utf8'),
  ]);
  console.log(`Valmis. Kuntia: ${summary.total}, korkea: ${summary.high}, keskitaso: ${summary.medium}, matala: ${summary.low}, ei löytynyt: ${summary.missing}.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
