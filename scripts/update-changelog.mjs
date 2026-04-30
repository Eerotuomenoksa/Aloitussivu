import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, 'changelogData.ts');
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

function readRecentCommits(limit = 20) {
  const output = runGit(['log', '--no-merges', '-n', String(limit), '--date=short', '--pretty=format:@@@%H|%ad|%s']);
  if (!output) return [];

  return output.split(/\r?\n/).filter(Boolean).flatMap(line => {
    if (!line.startsWith('@@@')) return [];
    const [hash, date, subject] = line.slice(3).split('|');
    return [{ hash, date, subject }];
  });
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

  if (paths.some((pathName) => ['App.tsx', 'muutosloki.tsx', 'scripts/update-changelog.mjs', 'changelogData.ts'].includes(pathName))) {
    notes.push('Muutosloki muutettiin selkokieliseksi kehittäjäsivuksi, joka näyttää muutokset ilman tiedostolinkkejä.');
  }

  if (paths.some((pathName) => ['App.tsx'].includes(pathName))) {
    notes.push('Pääsivulle lisättiin beta-merkintä sekä linkki muutoslokiin.');
  }

  if (paths.some((pathName) => ['localServices.ts', 'components/RegionalServicesPanel.tsx', 'localLinkVisibility.ts'].includes(pathName))) {
    notes.push('Paikallisiin linkkeihin lisättiin seurakunnat, ja niiden piilottaminen tallentuu nyt selaimen muistiin.');
  }

  if (paths.some((pathName) => ['components/InfoModal.tsx', 'localStats.ts'].includes(pathName))) {
    notes.push('Tietoa-sivua täydennettiin paikallisten linkkien alaluokilla, kuten kunnilla, hyvinvointialueilla ja kirjastoilla.');
  }

  if (paths.some((pathName) => ['linkHealth.ts', 'linkStats.ts', 'docs/linkit.csv', 'docs/linkit.md', 'docs/yllapito-linkkiloki.csv', 'scripts/update-links.mjs'].includes(pathName))) {
    notes.push('Linkkien tarkistus, näkyvyyden hallinta ja ylläpitoloki päivittyvät automaattisesti buildin yhteydessä.');
  }

  if (paths.some((pathName) => ['constants.tsx', 'localServices.ts', 'municipalityWebsites.ts'].includes(pathName))) {
    notes.push('Palvelukategorioita ja paikallisia linkkejä laajennettiin uusilla suomalaisilla palveluilla.');
  }

  if (notes.length === 0) {
    notes.push('Työpuussa on paikallisia muutoksia, mutta niistä ei löytynyt vielä valmista yhteenvetokategoriaa.');
  }

  return uniqueBy(notes, (item) => item);
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
const worktreeChanges = readWorktreeChanges();
const worktreeSummary = summarizeWorktree(worktreeChanges);
const recentCommits = readRecentCommits();
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
  subject: string;
};

export const CHANGELOG_GENERATED_AT = ${JSON.stringify(generatedAt)};
export const CHANGELOG_WORKTREE_SUMMARY: string[] = ${JSON.stringify(worktreeSummary, null, 2)};
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = ${JSON.stringify(deployments, null, 2)};
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = ${JSON.stringify(recentCommits, null, 2)};
`;

writeFileSync(outputPath, fileContents, 'utf8');
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
