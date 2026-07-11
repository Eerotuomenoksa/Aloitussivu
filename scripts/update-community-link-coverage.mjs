import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const readSource = (filePath) => readFileSync(path.join(repoRoot, filePath), 'utf8');

const normalizeText = (value) => value
  .trim()
  .toLocaleLowerCase('fi-FI')
  .replace(/[.,;:!?()[\]{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeMunicipality = (name) => normalizeText(name)
  .replace(/^kunta\s+/i, '')
  .replace(/\s+kaupunki$/i, '')
  .replace(/\s+kunta$/i, '')
  .replace(/\s+seutukunta$/i, '')
  .replace(/\s+-\s+.*$/i, '')
  .trim();

const normalizeArea = (value) => normalizeText(value)
  .replace(/\bhyvinvointialue\b/g, '')
  .replace(/\bmaakunta\b/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .map((word) => word.length > 4 ? word.replace(/n$/u, '') : word)
  .join(' ');

const extractQuotedStrings = (value) => [...value.matchAll(/'([^']+)'|"([^"]+)"/g)]
  .map((match) => match[1] ?? match[2])
  .filter(Boolean);

const parseMunicipalities = () => {
  const source = readSource('municipalRegistry.ts');
  return [...source.matchAll(/\{\s*"code":\s*"(?<code>[^"]+)",\s*"name":\s*"(?<name>[^"]+)",\s*"wellbeingAreaCode":\s*"(?<wellbeingAreaCode>[^"]+)",\s*"wellbeingAreaName":\s*"(?<wellbeingAreaName>[^"]+)"/g)]
    .map((match) => ({
      code: match.groups.code,
      name: match.groups.name,
      key: normalizeMunicipality(match.groups.name),
      wellbeingAreaCode: match.groups.wellbeingAreaCode,
      wellbeingAreaName: match.groups.wellbeingAreaName,
    }));
};

const extractArrayBody = (source, arrayName) => {
  const exportIndex = source.indexOf(`export const ${arrayName}`);
  if (exportIndex === -1) throw new Error(`Array not found: ${arrayName}`);
  const equalsIndex = source.indexOf('=', exportIndex);
  if (equalsIndex === -1) throw new Error(`Array assignment not found: ${arrayName}`);
  const start = source.indexOf('[', equalsIndex);
  if (start === -1) throw new Error(`Array start not found: ${arrayName}`);

  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(start + 1, index);
    }
  }

  throw new Error(`Array end not found: ${arrayName}`);
};

const extractObjectBodies = (arrayBody) => {
  const objects = [];
  let start = -1;
  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = 0; index < arrayBody.length; index += 1) {
    const char = arrayBody[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '{') {
      if (depth === 0) start = index;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(arrayBody.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return objects;
};

const stringField = (objectBody, field) => {
  const match = objectBody.match(new RegExp(`${field}:\\s*(?:"([^"]*)"|'([^']*)')`));
  return match ? (match[1] ?? match[2]).trim() : '';
};

const arrayField = (objectBody, field) => {
  const match = objectBody.match(new RegExp(`${field}:\\s*\\[([\\s\\S]*?)\\]`));
  return match ? extractQuotedStrings(match[1]).map((item) => item.trim()).filter(Boolean) : [];
};

const parseProviderArray = (source, arrayName) => extractObjectBodies(extractArrayBody(source, arrayName))
  .map((body) => ({
    name: stringField(body, 'name'),
    url: stringField(body, 'url'),
    group: stringField(body, 'group'),
    type: stringField(body, 'type'),
    area: stringField(body, 'area'),
    municipality: stringField(body, 'municipality'),
    municipalities: arrayField(body, 'municipalities'),
  }))
  .filter((provider) => provider.name && provider.url);

const isNational = (provider) => ['koko suomi', 'suomi'].includes(normalizeArea(provider.area || provider.group));

const providerMunicipalityKeys = (provider, municipalities) => {
  const keys = new Set();
  const municipalityKeys = new Set(municipalities.map((item) => item.key));

  for (const name of [provider.municipality, ...provider.municipalities].filter(Boolean)) {
    const key = normalizeMunicipality(name);
    if (municipalityKeys.has(key)) keys.add(key);
  }

  if (provider.area && keys.size === 0 && !isNational(provider)) {
    const providerArea = normalizeArea(provider.area);
    for (const municipality of municipalities) {
      const municipalityArea = normalizeArea(municipality.wellbeingAreaName);
      if (providerArea && municipalityArea && (providerArea.includes(municipalityArea) || municipalityArea.includes(providerArea))) {
        keys.add(municipality.key);
      }
    }
  }

  return keys;
};

const statusCounts = (items, key) => items.reduce((acc, item) => {
  acc[item[key]] = (acc[item[key]] ?? 0) + 1;
  return acc;
}, {});

const groupBy = (items, keyFn) => items.reduce((acc, item) => {
  const key = keyFn(item);
  acc.set(key, [...(acc.get(key) ?? []), item]);
  return acc;
}, new Map());

const summarize = (providers, municipalities) => {
  const coveredByMunicipality = new Map(municipalities.map((municipality) => [municipality.key, []]));
  const providersWithMunicipalityMetadata = providers.filter((provider) => provider.municipality || provider.municipalities.length > 0);
  const providersWithAreaMetadata = providers.filter((provider) => provider.area && !isNational(provider));
  const nationalProviders = providers.filter(isNational);

  for (const provider of providers) {
    for (const key of providerMunicipalityKeys(provider, municipalities)) {
      coveredByMunicipality.get(key)?.push(provider.name);
    }
  }

  const municipalityRows = municipalities.map((municipality) => {
    const providersForMunicipality = coveredByMunicipality.get(municipality.key) ?? [];
    return {
      ...municipality,
      status: providersForMunicipality.length > 0 ? 'has-local-or-regional' : 'no-local-or-regional',
      providerCount: providersForMunicipality.length,
      providers: providersForMunicipality,
    };
  });

  return {
    providerCount: providers.length,
    nationalProviderCount: nationalProviders.length,
    providersWithMunicipalityMetadata: providersWithMunicipalityMetadata.length,
    providersWithAreaMetadata: providersWithAreaMetadata.length,
    municipalityStatusCounts: statusCounts(municipalityRows, 'status'),
    municipalities: municipalityRows,
  };
};

const formatGroupedMunicipalities = (title, rows) => {
  if (rows.length === 0) return `## ${title}\n\nEi kuntia tässä luokassa.\n`;
  const groups = groupBy(rows, (row) => row.wellbeingAreaName);
  const sections = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'fi'))
    .map(([area, municipalities]) => [
      `### ${area}, ${municipalities.length} kuntaa`,
      '',
      municipalities.map((item) => item.name).sort((a, b) => a.localeCompare(b, 'fi')).join(', '),
    ].join('\n'));
  return [`## ${title}`, '', ...sections, ''].join('\n\n');
};

const formatProviderList = (providers) => providers
  .map((provider) => `- ${provider.name}: ${provider.url}`)
  .join('\n');

const municipalities = parseMunicipalities();
const communitySource = readSource('communityLinks.ts');

const patientAssociations = parseProviderArray(communitySource, 'PATIENT_ASSOCIATION_LINKS');
const seniorAssociations = parseProviderArray(communitySource, 'SENIOR_ASSOCIATION_LINKS');
const museums = parseProviderArray(communitySource, 'MUSEUM_LINKS');

const summaries = {
  seniorAssociations: summarize(seniorAssociations, municipalities),
  patientAssociations: summarize(patientAssociations, municipalities),
  museums: summarize(museums, municipalities),
};

const outputDir = path.join(repoRoot, 'outputs');
mkdirSync(outputDir, { recursive: true });
writeFileSync(
  path.join(outputDir, 'regional-community-link-coverage.json'),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    municipalityCount: municipalities.length,
    counts: {
      seniorAssociations: {
        providerCount: summaries.seniorAssociations.providerCount,
        nationalProviderCount: summaries.seniorAssociations.nationalProviderCount,
        providersWithMunicipalityMetadata: summaries.seniorAssociations.providersWithMunicipalityMetadata,
        providersWithAreaMetadata: summaries.seniorAssociations.providersWithAreaMetadata,
        municipalityStatusCounts: summaries.seniorAssociations.municipalityStatusCounts,
      },
      patientAssociations: {
        providerCount: summaries.patientAssociations.providerCount,
        nationalProviderCount: summaries.patientAssociations.nationalProviderCount,
        providersWithMunicipalityMetadata: summaries.patientAssociations.providersWithMunicipalityMetadata,
        providersWithAreaMetadata: summaries.patientAssociations.providersWithAreaMetadata,
        municipalityStatusCounts: summaries.patientAssociations.municipalityStatusCounts,
      },
      museums: {
        providerCount: summaries.museums.providerCount,
        nationalProviderCount: summaries.museums.nationalProviderCount,
        providersWithMunicipalityMetadata: summaries.museums.providersWithMunicipalityMetadata,
        providersWithAreaMetadata: summaries.museums.providersWithAreaMetadata,
        municipalityStatusCounts: summaries.museums.municipalityStatusCounts,
      },
    },
    seniorAssociations: summaries.seniorAssociations.municipalities,
    patientAssociations: summaries.patientAssociations.municipalities,
    museums: summaries.museums.municipalities,
  }, null, 2),
  'utf8',
);

const seniorMissingRows = summaries.seniorAssociations.municipalities
  .filter((row) => row.status === 'no-local-or-regional');
const seniorCoveredRows = summaries.seniorAssociations.municipalities
  .filter((row) => row.status === 'has-local-or-regional');

const markdown = `# Alueellisten yhteisölinkkien kattavuus

Päivitetty: ${new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date())}

Tämä raportti kuvaa museo-, eläkeyhdistys- ja potilasyhdistyslinkkien nykyistä metadataa. Se ei tarkoita, että jokaiselle kunnalle pitäisi väkisin löytyä oma yhdistys, vaan auttaa erottamaan valtakunnalliset lähteet paikallisista ja alueellisista osumista.

Koneellinen JSON-raportti: \`outputs/regional-community-link-coverage.json\`

## Yhteenveto

| Kori | Linkkejä | Valtakunnallisia | Kunta-metadatalla | Alue-metadatalla | Kuntia, joissa paikallinen tai alueellinen osuma |
| --- | ---: | ---: | ---: | ---: | ---: |
| Eläkeyhdistykset | ${summaries.seniorAssociations.providerCount} | ${summaries.seniorAssociations.nationalProviderCount} | ${summaries.seniorAssociations.providersWithMunicipalityMetadata} | ${summaries.seniorAssociations.providersWithAreaMetadata} | ${summaries.seniorAssociations.municipalityStatusCounts['has-local-or-regional'] ?? 0} |
| Potilasyhdistykset | ${summaries.patientAssociations.providerCount} | ${summaries.patientAssociations.nationalProviderCount} | ${summaries.patientAssociations.providersWithMunicipalityMetadata} | ${summaries.patientAssociations.providersWithAreaMetadata} | ${summaries.patientAssociations.municipalityStatusCounts['has-local-or-regional'] ?? 0} |
| Museot | ${summaries.museums.providerCount} | ${summaries.museums.nationalProviderCount} | ${summaries.museums.providersWithMunicipalityMetadata} | ${summaries.museums.providersWithAreaMetadata} | ${summaries.museums.municipalityStatusCounts['has-local-or-regional'] ?? 0} |

## Eläkeyhdistysten tämänhetkinen pohja

${formatProviderList(seniorAssociations)}

${formatGroupedMunicipalities('Eläkeyhdistykset: paikallinen tai alueellinen osuma datassa', seniorCoveredRows)}

${formatGroupedMunicipalities('Eläkeyhdistykset: ei vielä paikallista tai alueellista osumaa datassa', seniorMissingRows)}

## Seuraava työ

1. Käy eläkeyhdistykset järjestö kerrallaan: Eläkeliitto, Senioriliitto, Eläkeläiset ry, EKL, KRELLI ja Svenska pensionärsförbundet.
2. Lisää paikallinen tai alueellinen linkki vain, kun järjestön oma sivu nimeää kunnan, alueen tai paikallisyhdistyksen.
3. Älä tulkitse puuttuvaa paikallisosumaa virheeksi pienissä kunnissa; monessa kunnassa toiminta voi olla seudullista tai valtakunnallisen hakusivun varassa.
4. Kun lisäät linkkejä, täytä vähintään \`group\`, \`type\`, \`area\` tai \`municipalities\`, \`sourceNote\` ja \`verifiedAt\`.
`;

writeFileSync(path.join(repoRoot, 'docs', 'alueelliset-yhteisolinkit-kattavuus.md'), markdown, 'utf8');

console.log('Wrote docs/alueelliset-yhteisolinkit-kattavuus.md');
console.log('Wrote outputs/regional-community-link-coverage.json');
