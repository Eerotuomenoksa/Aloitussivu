import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, 'changelogData.ts');

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

function readWorktreeChanges() {
  const trackedOutput = runGit(['diff', '--name-status', 'HEAD']);
  const tracked = trackedOutput
    ? trackedOutput.split(/\r?\n/).filter(Boolean).map(line => {
        const [status, ...rest] = line.split(/\t/);
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

const generatedAt = formatGeneratedAt(new Date());
const worktreeChanges = readWorktreeChanges();
const recentCommits = readRecentCommits();

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

export const CHANGELOG_GENERATED_AT = ${JSON.stringify(generatedAt)};
export const CHANGELOG_WORKTREE_CHANGES: ChangelogWorktreeChange[] = ${JSON.stringify(worktreeChanges, null, 2)};
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = ${JSON.stringify(recentCommits, null, 2)};
`;

writeFileSync(outputPath, fileContents, 'utf8');
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
