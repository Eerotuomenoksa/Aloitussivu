import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, 'changelogData.ts');
const versionPath = path.join(repoRoot, 'appVersion.ts');
const apiToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? '';

function runGit(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd();
}

function formatGeneratedAt(date) {
  return new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function normalizeStatus(code) {
  if (code.startsWith('R')) return 'renamed';
  if (code.startsWith('A')) return 'added';
  if (code.startsWith('D')) return 'deleted';
  if (code.startsWith('U')) return 'unmerged';
  return 'modified';
}

function parseRepoSlug() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;

  const remote = runGit(['remote', 'get-url', 'origin']);
  const match = remote.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/.]+)(?:\.git)?$/i);
  if (!match?.groups?.owner || !match?.groups?.repo) return '';
  return `${match.groups.owner}/${match.groups.repo}`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${apiToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function readWorktreeChanges() {
  const trackedOutput = runGit(['diff', '--name-status', 'HEAD']);
  const tracked = trackedOutput
    ? trackedOutput.split(/\r?\n/).filter(Boolean).map(line => {
        const [status, ...rest] = line.split('\t');
        const paths = rest.filter(Boolean);
        return {
          status: normalizeStatus(status),
          path: paths[paths.length - 1] ?? '',
        };
      }).filter(entry => entry.path)
    : [];

  const untrackedOutput = runGit(['ls-files', '--others', '--exclude-standard']);
  const untracked = untrackedOutput
    ? untrackedOutput.split(/\r?\n/).filter(Boolean).map(pathname => ({
        status: 'untracked',
        path: pathname,
      }))
    : [];

  return [...tracked, ...untracked].sort((a, b) => a.path.localeCompare(b.path, 'fi'));
}

function readRecentCommits() {
  const output = runGit(['log', '--no-merges', '--date=short', '--pretty=format:@@@%H|%ad|%s']);
  if (!output) return [];

  return output.split(/\r?\n/).filter(Boolean).flatMap(line => {
    if (!line.startsWith('@@@')) return [];
    const [hash, date, subject] = line.slice(3).split('|');
    return [{ hash, date, subject }];
  });
}

function readAppVersion() {
  try {
    const source = readFileSync(versionPath, 'utf8');
    return source.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? '0.0';
  } catch {
    return '0.0';
  }
}

function readVersionMinor(version) {
  const minor = Number(version.split('.')[1] ?? 0);
  return Number.isFinite(minor) ? minor : 0;
}

function formatHistoryVersion(currentVersion, index) {
  const minor = Math.max(0, readVersionMinor(currentVersion) - index);
  return `0.${String(minor).padStart(2, '0')}`;
}

function addVersionsToCommits(commits, currentVersion) {
  return commits.map((commit, index) => ({
    ...commit,
    version: formatHistoryVersion(currentVersion, index),
  }));
}

function readCommitSubject(hash) {
  try {
    return runGit(['show', '-s', '--format=%s', hash]);
  } catch {
    return '';
  }
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarizeWorktree(changes) {
  const paths = changes.map((change) => change.path);
  const notes = [];

  if (paths.some((pathName) => ['appVersion.ts', 'package.json', 'package-lock.json', 'muutosloki.tsx', 'App.tsx'].includes(pathName))) {
    notes.push('Versionumerointi otettiin käyttöön: nykyinen versio näkyy footerissa ja muutoslokin yläosassa.');
    notes.push('Muutoshistoria näyttää versionumeron jokaisen muutoksen yhteydessä.');
  }

  if (paths.some((pathName) => ['localServices.ts'].includes(pathName))) {
    notes.push('Loviisan joukkoliikenteen linkki lisättiin alueellisiin palveluihin.');
    notes.push('Paikallisia kirjastolinkkejä täydennettiin Kirkanta/Kirjastot.fi-dataan pohjautuvilla kirjastokimpoilla.');
    notes.push('Alueellisiin palveluihin lisättiin ja laajennettiin palvelualue-mallia, jotta joukkoliikennejärjestäjät, kuten HSL, Nysse, Föli, Linkki ja Vilkku, voidaan jakaa usealle kunnalle yhdestä paikasta.');
    notes.push('Alueellisista linkeistä poistettiin tuplana näkynyt kunnan verkkosivut -linkki, kun kunnan palvelut näyttää saman asian käyttäjälle selkeämmin.');
  }

  if (paths.some((pathName) => ['constants.tsx'].includes(pathName))) {
    notes.push('Puhelinnumerot lisättiin omaksi kategoriakseen ja tärkeimpien palveluiden korteille lisättiin soittopainikkeet.');
    notes.push('Liikunta-kategoriaa täydennettiin Tanssit-ryhmällä, josta löytyy lavatansseja, päivätansseja ja seuratanssia tukevia linkkejä.');
  }

  if (paths.some((pathName) => ['localNewspaperFeeds.ts', 'scripts/update-newspaper-feeds.mjs', 'docs/paikallisuutiset-puuttuvat-kunnat.md'].includes(pathName))) {
    notes.push('Pirkkalan uutisiin lisättiin Pirkkalainen-lehden RSS-syöte.');
  }

  if (paths.some((pathName) => ['linkHealth.ts', 'linkStats.ts', 'docs/linkit.csv', 'docs/linkit.md', 'docs/yllapito-linkkiloki.csv', 'scripts/update-links.mjs'].includes(pathName))) {
    notes.push('Linkkien tarkistusdata ja ylläpitoloki päivitettiin uusimman buildin yhteydessä.');
  }

  if (paths.some((pathName) => ['components/SearchBar.tsx', 'components/Assistant.tsx', 'components/QuickLinks.tsx', 'hooks/useSpeechInput.ts'].includes(pathName))) {
    notes.push('Google-haku, palveluhaku ja tekoälyavustaja toimivat nyt myös omalla äänellä mikrofonipainikkeen kautta.');
  }

  if (paths.some((pathName) => ['components/RegionalServicesPanel.tsx'].includes(pathName))) {
    notes.push('Etusivun alueellisiin palveluihin nostettiin myös paikalliset kirjastokimpat, jotta esimerkiksi Loviisalle näkyy Helle-kirjastot.');
    notes.push('Alueellisten palvelujen kunnan valintaa selkeytettiin: rajausviesti päivitettiin, turha kuntalaatikko poistettiin ja Vaihda kunta -painike siirrettiin työpöytänäkymässä kunnan kentän rinnalle.');
  }

  if (paths.some((pathName) => ['ehdotukset.tsx', 'adminStats.ts', 'functions/nameday.ts', 'firestore.rules'].includes(pathName))) {
    notes.push('Ylläpitoon lisättiin nimipäivärajapinnan käyttölaskuri, joka näyttää kutsujen kokonaismäärän, onnistuneet ja epäonnistuneet haut sekä viimeisimmän käyttöajan.');
    notes.push('Kirjautuminen ja huijausvaroitukset -sivulle lisättiin näkyvä Palaa etusivulle -linkki.');
  }

  if (paths.some((pathName) => ['components/OnboardingTour.tsx', 'components/InfoModal.tsx'].includes(pathName))) {
    notes.push('Sivuston esittelyyn lisättiin tieto, että robottia, Google-hakua ja palveluhakua voi käyttää myös omalla äänellä.');
  }

  if (paths.some((pathName) => ['linkit.tsx'].includes(pathName))) {
    notes.push('Linkkiluettelon Paikkakunnittain-taulukon vaakavieritystä helpotettiin yläreunan vierityspalkilla ja lukitulla paikkakuntasarakkeella.');
    notes.push('Linkkiluettelon Paikkakunnittain-välilehdeltä poistettiin tyhjä paikallisten palvelujen sarake ja siihen lisättiin omat sarakkeet potilas- ja eläkeyhdistyksille.');
    notes.push('Alueellisten linkkien listaan lisättiin kirjastojen lisäksi museot, teatterit, potilasyhdistykset ja eläkeyhdistykset.');
  }

  if (paths.some((pathName) => ['sivua-tukemassa.html', 'sivuaTukemassa.tsx', 'App.tsx', 'vite.config.ts'].includes(pathName) || pathName.startsWith('assets/'))) {
    notes.push('Sivustolle lisättiin kokeiluna Sivua tukemassa -sivu, jossa kerrotaan tukijaperiaatteet ja näytetään ensimmäisenä tukijana Vanhustyön keskusliitto ry.');
  }

  if (notes.length === 0) {
    notes.push('Työpuussa on paikallisia muutoksia, mutta niistä ei löytynyt vielä valmista yhteenvetokategoriaa.');
  }

  return uniqueBy(notes, (item) => item);
}

function summarizeCommit(commit) {
  const subject = commit.subject.toLocaleLowerCase('fi-FI');
  const notes = [];

  if (subject.includes('elementit -10%')) {
    notes.push('Käyttöliittymän tekstit, painikkeet ja laatikot pienennettiin 10 prosenttia aiempaa kompaktimmiksi.');
  }

  if (subject.includes('tuplana olevat kunnan sivut')) {
    notes.push('Alueellisista linkeistä poistettiin tuplana näkynyt kunnan verkkosivut -linkki, kun kunnan palvelut näyttää saman asian käyttäjälle selkeämmin.');
  }

  if (subject.includes('pirkkalainen')) {
    notes.push('Pirkkalan uutisiin lisättiin Pirkkalainen-lehden RSS-syöte.');
  }

  if (subject.includes('toinen kello')) {
    notes.push('Asetuksiin lisättiin toinen kello, jonka aikavyöhykkeen käyttäjä voi valita itse.');
  }

  if (subject.includes('saavutettavuus muutoksia')) {
    notes.push('Saavutettavuustarkistuksen havaintoja korjattiin: otsikkorakennetta, asetuspaneelin rooleja, linkkien nimiä ja kosketusalueita parannettiin.');
  }

  if (subject.includes('tietosuoja-selosteeseen') || subject.includes('saavutettavuusselosteeseen')) {
    notes.push('Tietosuojaselosteen ja saavutettavuusselosteen luonnokset lisättiin sivustolle sekä linkitettiin footeriin, Ohjeeseen ja Tietoa-osioon.');
  }

  return notes;
}

function summarizeToday(recentCommits, worktreeChanges) {
  const today = new Date().toISOString().slice(0, 10);
  const commitNotes = recentCommits
    .filter((commit) => commit.date === today)
    .flatMap((commit) => summarizeCommit(commit));

  if (commitNotes.length > 0) {
    return uniqueBy(commitNotes, (item) => item);
  }

  return uniqueBy([
    ...commitNotes,
    ...summarizeWorktree(worktreeChanges),
  ], (item) => item);
}

async function readDeployments(limit = 10) {
  if (!apiToken) return [];

  const repoSlug = parseRepoSlug();
  if (!repoSlug) return [];

  try {
    const deployments = await fetchJson(`https://api.github.com/repos/${repoSlug}/deployments?per_page=${limit}`);
    return await Promise.all(
      deployments.map(async (deployment) => {
        const statuses = await fetchJson(`https://api.github.com/repos/${repoSlug}/deployments/${deployment.id}/statuses?per_page=1`);
        const latestStatus = statuses[0] ?? null;

        return {
          id: deployment.id,
          environment: deployment.environment ?? 'github-pages',
          createdAt: deployment.created_at ?? '',
          state: latestStatus?.state ?? deployment.state ?? 'unknown',
          description: latestStatus?.description ?? deployment.description ?? '',
          sha: deployment.sha,
          shortSha: deployment.sha.slice(0, 7),
          subject: readCommitSubject(deployment.sha) || deployment.sha,
          url: latestStatus?.target_url ?? deployment.url ?? '',
        };
      }),
    );
  } catch {
    return [];
  }
}

const generatedAt = formatGeneratedAt(new Date());
const appVersion = readAppVersion();
const worktreeChanges = readWorktreeChanges();
const recentCommits = addVersionsToCommits(readRecentCommits(), appVersion);
const worktreeSummary = summarizeToday(recentCommits, worktreeChanges);
const deployments = await readDeployments();

const fileContents = `export type ChangelogWorktreeChange = {
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'unmerged';
  path: string;
};

export type ChangelogDeployment = {
  id: number;
  environment: string;
  createdAt: string;
  state: string;
  description: string;
  sha: string;
  shortSha: string;
  subject: string;
  url: string;
};

export type ChangelogCommit = {
  hash: string;
  date: string;
  version: string;
  subject: string;
};

export const CHANGELOG_GENERATED_AT = ${JSON.stringify(generatedAt)};
export const CHANGELOG_VERSION = ${JSON.stringify(appVersion)};
export const CHANGELOG_WORKTREE_SUMMARY: string[] = ${JSON.stringify(worktreeSummary, null, 2)};
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = ${JSON.stringify(deployments, null, 2)};
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = ${JSON.stringify(recentCommits, null, 2)};
`;

writeFileSync(outputPath, fileContents, 'utf8');
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
