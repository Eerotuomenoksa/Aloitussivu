import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SECRET_PATTERNS = [
  { name: 'Google/Firebase/Gemini API key', pattern: new RegExp(`AI${'za'}Sy[A-Za-z0-9_-]+`) },
  { name: 'Firebase Cloud Messaging server key', pattern: /AAAA[A-Za-z0-9_-]+/ },
  { name: 'Nimipaiva API token', pattern: /ndt_[A-Za-z0-9_-]+/ },
  { name: 'Known admin secret prefix', pattern: new RegExp(`sWM${'3AT'}[A-Za-z0-9_-]*`) },
];

const INCLUDED_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  'dist',
  'docs',
  'node_modules',
  'visual-check-report',
]);

const EXCLUDED_PATHS = new Set([
  'functions/.env',
  'functions/.env.local',
]);

const EXCLUDED_PATH_PREFIXES = [
  'functions/lib/',
  'functions/node_modules/',
];

const findings = [];

const scanDirectory = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.relative(ROOT, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRECTORIES.has(entry.name)) {
        await scanDirectory(fullPath);
      }
      continue;
    }

    if (EXCLUDED_PATHS.has(relativePath) || EXCLUDED_PATH_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) {
      continue;
    }

    if (!entry.isFile() || !INCLUDED_EXTENSIONS.has(path.extname(entry.name))) continue;

    const content = await readFile(fullPath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      SECRET_PATTERNS.forEach(({ name, pattern }) => {
        if (pattern.test(line)) {
          findings.push(`${relativePath}:${index + 1} ${name}`);
        }
      });
    });
  }
};

await scanDirectory(ROOT);

if (findings.length > 0) {
  console.error('VIRHE: Kovakoodattuja avaimia löytyi:');
  findings.forEach((finding) => console.error(finding));
  process.exit(1);
}

console.log('OK: Kovakoodattuja avaimia ei löydetty.');
