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
  if (!match?.groups?.owner || !match?.groups?.repo) {
    return '';
  }

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

function readRecentCommits(limit = 10) {
  const output = runGit(['log', '--no-merges', '-n', String(limit), '--date=short', '--pretty=format:@@@%H|%ad|%s', '--name-only']);
  if (!output) return [];

  const entries = [];
  let current = null;

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.startsWith('@@@')) {
      if (current) entries.push(current);
      const [hash, date, subject] = line.slice(3).split('|');
      current = { hash, date, subject, files: [] };
      continue;
    }

    if (current && !current.files.includes(line)) {
      current.files.push(line);
    }
  }

  if (current) entries.push(current);
  return entries;
}

function gitCommitSubject(hash) {
  try {
    return runGit(['show', '-s', '--format=%s', hash]);
  } catch {
    return '';
  }
}

function shortSha(sha) {
  return sha.slice(0, 7);
}

async function readDeployments(limit = 10) {
  if (!apiToken) {
    return { source: 'git-fallback', deployments: [] };
  }

  const repoSlug = parseRepoSlug();
  if (!repoSlug) {
    return { source: 'git-fallback', deployments: [] };
  }

  try {
    const deployments = await fetchJson(`https://api.github.com/repos/${repoSlug}/deployments?per_page=${limit}`);
    const normalized = await Promise.all(
      deployments.map(async deployment => {
        const statuses = await fetchJson(`https://api.github.com/repos/${repoSlug}/deployments/${deployment.id}/statuses?per_page=1`);
        const latestStatus = statuses[0] ?? null;
        const subject = gitCommitSubject(deployment.sha) || deployment.sha;

        return {
          id: deployment.id,
          environment: deployment.environment ?? 'github-pages',
          createdAt: deployment.created_at ?? '',
          state: latestStatus?.state ?? deployment.state ?? 'unknown',
          description: latestStatus?.description ?? deployment.description ?? '',
          sha: deployment.sha,
          shortSha: shortSha(deployment.sha),
          subject,
          url: latestStatus?.target_url ?? deployment.url ?? '',
        };
      }),
    );

    return { source: 'github-api', deployments: normalized };
  } catch (error) {
    console.warn(`GitHub deployment history unavailable: ${error instanceof Error ? error.message : String(error)}`);
    return { source: 'git-fallback', deployments: [] };
  }
}

const generatedAt = formatGeneratedAt(new Date());
const worktreeChanges = readWorktreeChanges();
const recentCommits = readRecentCommits();
const deploymentResult = await readDeployments();

const fileContents = `export type ChangelogWorktreeChange = {
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'unmerged';
  path: string;
};

export type ChangelogCommit = {
  hash: string;
  date: string;
  subject: string;
  files: string[];
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

export const CHANGELOG_GENERATED_AT = ${JSON.stringify(generatedAt)};
export const CHANGELOG_SOURCE = ${JSON.stringify(deploymentResult.source)};
export const CHANGELOG_WORKTREE_CHANGES: ChangelogWorktreeChange[] = ${JSON.stringify(worktreeChanges, null, 2)};
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = ${JSON.stringify(deploymentResult.deployments, null, 2)};
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = ${JSON.stringify(recentCommits, null, 2)};
`;

writeFileSync(outputPath, fileContents, 'utf8');
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
