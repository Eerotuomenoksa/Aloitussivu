export const BUMP_ORDER = {
  none: 0,
  patch: 1,
  minor: 2,
  major: 3,
};

const USER_FACING_EXTENSIONS = new Set(['.tsx', '.ts', '.html', '.css']);
const PATCH_ONLY_PREFIXES = [
  'docs/',
  'scripts/',
  '.github/',
];
const PATCH_ONLY_FILES = new Set([
  'README.md',
  'TODO_HUMAN.md',
  'changelogData.ts',
  'package-lock.json',
]);
const FEATURE_FILES = new Set([
  'App.tsx',
  'constants.tsx',
  'i18n.tsx',
  'muutosloki.tsx',
  'firebaseConfig.ts',
  'firestore.rules',
]);

export function normalizeVersion(version) {
  const [major = '0', minor = '0', patch = '0'] = String(version).split('.');
  return `${Number(major) || 0}.${Number(minor) || 0}.${Number(patch) || 0}`;
}

export function parseVersion(version) {
  const [major, minor, patch] = normalizeVersion(version).split('.').map(Number);
  return { major, minor, patch };
}

export function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

export function maxBump(...bumps) {
  return bumps.reduce((best, bump) => (BUMP_ORDER[bump] > BUMP_ORDER[best] ? bump : best), 'none');
}

export function bumpVersion(version, bump, { pre1MajorAsMinor = true } = {}) {
  const parsed = parseVersion(version);

  if (bump === 'major') {
    if (pre1MajorAsMinor && parsed.major === 0) {
      return formatVersion({ major: 0, minor: parsed.minor + 1, patch: 0 });
    }
    return formatVersion({ major: parsed.major + 1, minor: 0, patch: 0 });
  }

  if (bump === 'minor') {
    return formatVersion({ major: parsed.major, minor: parsed.minor + 1, patch: 0 });
  }

  if (bump === 'patch') {
    return formatVersion({ major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 });
  }

  return formatVersion(parsed);
}

export function classifySubject(subject = '') {
  const text = subject.toLocaleLowerCase('fi-FI');

  if (
    /\bbreaking change\b/.test(text) ||
    /!:\s/.test(subject) ||
    /\bmajor\b/.test(text) ||
    text.includes('rikkova') ||
    text.includes('iso muutos')
  ) {
    return {
      bump: 'major',
      reason: 'commit-viesti viittaa isoon tai rikkovaan muutokseen',
    };
  }

  if (isPatchSubject(text)) {
    return {
      bump: 'patch',
      reason: 'commit-viesti viittaa linkkien lisäykseen, korjaukseen, dokumentaatioon tai ylläpitoon',
    };
  }

  if (
    /^feat(\(.+\))?:/.test(text) ||
    text.includes('lisätty') ||
    text.includes('lisää') ||
    text.includes('uusi ') ||
    text.includes('ominaisuus') ||
    text.includes('toinen kello') ||
    text.includes('seloste') ||
    text.includes('sivu')
  ) {
    return {
      bump: 'minor',
      reason: 'commit-viesti viittaa uuteen käyttäjälle näkyvään ominaisuuteen',
    };
  }

  return { bump: 'none', reason: '' };
}

function isPatchSubject(text) {
  return (
    /^fix(\(.+\))?:/.test(text) ||
    /^docs(\(.+\))?:/.test(text) ||
    /^chore(\(.+\))?:/.test(text) ||
    text.includes('korjaa') ||
    text.includes('korjattu') ||
    text.includes('päivitä') ||
    text.includes('päivitetty') ||
    text.includes('muutosloki') ||
    text.includes('tarkistus') ||
    text.includes('linkki') ||
    text.includes('linkit') ||
    text.includes('links')
  );
}

export function classifyPath(filePath = '') {
  const normalized = filePath.replace(/\\/g, '/');
  const extension = normalized.includes('.') ? normalized.slice(normalized.lastIndexOf('.')) : '';

  if (PATCH_ONLY_FILES.has(normalized) || PATCH_ONLY_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return {
      bump: 'patch',
      reason: `${normalized}: dokumentaatio, skripti tai ylläpitotiedosto`,
    };
  }

  if (FEATURE_FILES.has(normalized) || normalized.startsWith('components/') || normalized.startsWith('hooks/')) {
    return {
      bump: 'minor',
      reason: `${normalized}: käyttäjälle näkyvä sovellusmuutos`,
    };
  }

  if (normalized.startsWith('functions/') || normalized.startsWith('services/')) {
    return {
      bump: 'minor',
      reason: `${normalized}: palvelu- tai taustatoiminnon muutos`,
    };
  }

  if (USER_FACING_EXTENSIONS.has(extension)) {
    return {
      bump: 'patch',
      reason: `${normalized}: sovelluskoodin ylläpito- tai korjausmuutos`,
    };
  }

  return {
    bump: 'patch',
    reason: `${normalized}: muu ylläpitomuutos`,
  };
}

export function classifyChange({ subject = '', paths = [] } = {}) {
  const subjectClassification = classifySubject(subject);
  const pathClassifications = paths.map((pathName) => classifyPath(pathName));
  const subjectIsPatch = subjectClassification.bump === 'patch';
  const bump = subjectIsPatch
    ? 'patch'
    : maxBump(subjectClassification.bump, ...pathClassifications.map((item) => item.bump));
  const reasons = [
    subjectClassification.reason,
    ...pathClassifications.map((item) => item.reason),
  ].filter(Boolean);

  return {
    bump,
    reasons,
  };
}
