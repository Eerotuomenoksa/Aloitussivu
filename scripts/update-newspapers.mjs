import { writeFile } from 'node:fs/promises';

const CATEGORY = 'Luokka:Suomalaiset_paikallislehdet';
const OUTPUT_FILE = new URL('../localNewspaperLinks.ts', import.meta.url);
const EXCLUDE_HOSTS = [
  'wikimedia.org',
  'wikimediafoundation.org',
  'wikipedia.org',
  'creativecommons.org',
  'donate.wikimedia.org',
  'web.archive.org',
  'archive.org',
  'tools.wmflabs.org',
  'kansalliskirjasto.fi',
];

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
};

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
};

const cleanUrl = (url) => url.replace(/&amp;/g, '&').replace(/[)\].,;]+$/g, '');

const isCandidateUrl = (url) => {
  try {
    const parsed = new URL(cleanUrl(url));
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (EXCLUDE_HOSTS.some((host) => parsed.hostname.includes(host))) return false;
    return true;
  } catch {
    return false;
  }
};

const pickHomepage = (urls) => {
  const candidates = [...new Set(urls.map(cleanUrl))].filter(isCandidateUrl);
  const roots = candidates.filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname === '/' || parsed.pathname === '' || parsed.pathname === '/index.html';
    } catch {
      return false;
    }
  });

  return roots[0] || candidates[0] || '';
};

const chunk = (items, size) => {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const fetchCategoryMembers = async () => {
  const members = [];
  let cmcontinue;

  do {
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: CATEGORY,
      cmlimit: 'max',
      format: 'json',
      origin: '*',
    });
    if (cmcontinue) params.set('cmcontinue', cmcontinue);

    const data = await fetchJson(`https://fi.wikipedia.org/w/api.php?${params.toString()}`);
    members.push(...(data.query?.categorymembers ?? []));
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue);

  return members;
};

const fetchPageProps = async (titles) => {
  const pages = new Map();

  for (const titleChunk of chunk(titles, 40)) {
    const params = new URLSearchParams({
      action: 'query',
      prop: 'pageprops',
      titles: titleChunk.join('|'),
      format: 'json',
      origin: '*',
    });
    const data = await fetchJson(`https://fi.wikipedia.org/w/api.php?${params.toString()}`);
    const chunkPages = Object.values(data.query?.pages ?? {});
    for (const page of chunkPages) {
      pages.set(page.title, page.pageprops?.wikibase_item ?? null);
    }
  }

  return pages;
};

const fetchWikidataClaims = async (ids) => {
  const claims = new Map();

  for (const idChunk of chunk(ids, 50)) {
    const params = new URLSearchParams({
      action: 'wbgetentities',
      ids: idChunk.join('|'),
      props: 'claims',
      format: 'json',
      origin: '*',
    });
    const data = await fetchJson(`https://www.wikidata.org/w/api.php?${params.toString()}`);

    for (const id of idChunk) {
      const url = data.entities?.[id]?.claims?.P856?.[0]?.mainsnak?.datavalue?.value?.trim?.() ?? null;
      claims.set(id, url);
    }
  }

  return claims;
};

const extractHomepageFromHtml = (html) => {
  const urls = [...html.matchAll(/https?:\/\/[^"' <>\]]+/g)].map((match) => match[0]);
  return pickHomepage(urls);
};

const resolveFallbackUrl = async (title) => {
  const html = await fetchText(`https://fi.wikipedia.org/w/index.php?title=${encodeURIComponent(title)}&printable=yes`);
  return extractHomepageFromHtml(html);
};

const escapeTs = (value) => JSON.stringify(value);

const main = async () => {
  const members = await fetchCategoryMembers();
  const titles = members.map((member) => member.title);
  const pageProps = await fetchPageProps(titles);
  const wikidataIds = [...new Set([...pageProps.values()].filter(Boolean))];
  const p856 = await fetchWikidataClaims(wikidataIds);

  const resolved = [];
  const missing = [];

  for (const title of titles) {
    const id = pageProps.get(title);
    const direct = id ? p856.get(id) : null;
    if (direct && isCandidateUrl(direct)) {
      resolved.push({ name: title, url: direct });
    } else {
      missing.push(title);
    }
  }

  for (const title of missing) {
    try {
      const url = await resolveFallbackUrl(title);
      if (url && isCandidateUrl(url)) {
        resolved.push({ name: title, url });
      } else {
        console.warn(`Ei löytynyt kotisivua: ${title}`);
      }
    } catch (error) {
      console.warn(`Kotisivun haku epäonnistui: ${title}`);
    }
  }

  const deduped = resolved.filter((item, index, all) => all.findIndex((candidate) => candidate.url === item.url) === index);
  deduped.sort((a, b) => a.name.localeCompare(b.name, 'fi'));

  const content = `export const LOCAL_NEWSPAPER_LINKS = ${JSON.stringify(deduped, null, 2)} as const;\n`;
  await writeFile(OUTPUT_FILE, content, 'utf8');

  console.log(`Löytyi ${titles.length} lehteä, kirjoitettiin ${deduped.length} sivustolinkkiä.`);
  console.log(`Puuttuvia ilman linkkiä: ${titles.length - deduped.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
