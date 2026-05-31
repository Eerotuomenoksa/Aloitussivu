import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  BUMP_ORDER,
  bumpVersion,
  classifyChange,
  maxBump,
  normalizeVersion,
} from './versioning.mjs';

const repoRoot = process.cwd();
const appVersionPath = path.join(repoRoot, 'appVersion.ts');
const packageJsonPath = path.join(repoRoot, 'package.json');
const packageLockPath = path.join(repoRoot, 'package-lock.json');
const validBumps = new Set(['major', 'minor', 'patch', 'none']);

function runGit(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd();
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    bump: '',
    set: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    if (arg === '--bump') options.bump = argv[index + 1] ?? '';
    if (arg === '--set') options.set = argv[index + 1] ?? '';
  }

  if (options.bump && !validBumps.has(options.bump)) {
    throw new Error(`Tuntematon bump-arvo: ${options.bump}. Käytä major, minor, patch tai none.`);
  }

  return options;
}

function normalizeStatus(code) {
  if (code.startsWith('R')) return 'renamed';
  if (code.startsWith('A')) return 'added';
  if (code.startsWith('D')) return 'deleted';
  if (code.startsWith('U')) return 'unmerged';
  return 'modified';
}

function parseNameStatus(output) {
  if (!output) return [];

  return output.split(/\r?\n/).filter(Boolean).map((line) => {
    const [status, ...rest] = line.split('\t');
    const paths = rest.filter(Boolean);

    return {
      status: normalizeStatus(status),
      path: paths[paths.length - 1] ?? '',
    };
  }).filter((entry) => entry.path);
}

function readPendingChanges() {
  const staged = parseNameStatus(runGit(['diff', '--cached', '--name-status']));
  if (staged.length > 0) return { source: 'staged', changes: staged };

  const tracked = parseNameStatus(runGit(['diff', '--name-status', 'HEAD']));
  const untrackedOutput = runGit(['ls-files', '--others', '--exclude-standard']);
  const untracked = untrackedOutput
    ? untrackedOutput.split(/\r?\n/).filter(Boolean).map((pathName) => ({
        status: 'untracked',
        path: pathName,
      }))
    : [];

  return {
    source: 'worktree',
    changes: [...tracked, ...untracked].sort((a, b) => a.path.localeCompare(b.path, 'fi')),
  };
}

function readCurrentVersion() {
  const source = readFileSync(appVersionPath, 'utf8');
  const appVersion = source.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1];
  if (appVersion) return normalizeVersion(appVersion);

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  return normalizeVersion(packageJson.version ?? '0.0.0');
}

function updateAppVersion(nextVersion) {
  const source = readFileSync(appVersionPath, 'utf8');
  const updated = source
    .replace(/APP_VERSION\s*=\s*['"][^'"]+['"]/, `APP_VERSION = '${nextVersion}'`)
    .replace(
      /APP_VERSION_BASIS\s*=\s*['"][^'"]+['"]/,
      "APP_VERSION_BASIS = 'Versio noudattaa semanttista versionumerointia: major isoille tai rikkoville muutoksille, minor uusille ominaisuuksille ja patch korjauksille, dokumentaatiolle sekä ylläpidolle. Ennen 1.0-julkaisua isot käyttäjämuutokset nostavat 0.x-minoria.'",
    );

  writeFileSync(appVersionPath, updated, 'utf8');
}

function updateJsonVersion(filePath, nextVersion) {
  const json = JSON.parse(readFileSync(filePath, 'utf8'));
  json.version = nextVersion;
  if (json.packages?.['']) json.packages[''].version = nextVersion;
  writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
}

function determineBump(changes) {
  if (changes.length === 0) {
    return {
      bump: 'none',
      reasons: ['Ei havaittu stage- tai työpuumuutoksia.'],
    };
  }

  const classifications = changes.map((change) => classifyChange({ paths: [change.path] }));
  const bump = maxBump(...classifications.map((classification) => classification.bump));
  const reasons = classifications
    .flatMap((classification) => classification.reasons)
    .filter(Boolean)
    .slice(0, 8);

  return {
    bump: BUMP_ORDER[bump] > 0 ? bump : 'patch',
    reasons,
  };
}

const options = parseArgs(process.argv.slice(2));
const currentVersion = readCurrentVersion();
const { source, changes } = readPendingChanges();
const detected = determineBump(changes);
const bump = options.bump || detected.bump;
const nextVersion = options.set ? normalizeVersion(options.set) : bumpVersion(currentVersion, bump);

console.log(`Nykyinen versio: ${currentVersion}`);
console.log(`Muutosten lähde: ${source}`);
console.log(`Tunnistettu nosto: ${detected.bump}`);
if (options.bump) console.log(`Pakotettu nosto: ${options.bump}`);
if (options.set) console.log(`Pakotettu versio: ${nextVersion}`);
console.log(`Uusi versio: ${nextVersion}`);
detected.reasons.forEach((reason) => console.log(`- ${reason}`));

if (!options.dryRun) {
  updateAppVersion(nextVersion);
  updateJsonVersion(packageJsonPath, nextVersion);
  updateJsonVersion(packageLockPath, nextVersion);
}
