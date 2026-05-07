import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sources = {
  patientAssociations: resolve(process.env.USERPROFILE ?? '', 'Downloads', 'suomalaiset_potilasyhdistykset.csv'),
  seniorAssociations: resolve(process.env.USERPROFILE ?? '', 'Downloads', 'suomalaiset_elakelais_ja_senioriyhdistykset_kunnat.csv'),
  museums: resolve(process.env.USERPROFILE ?? '', 'Downloads', 'suomalaiset_museot.csv'),
};

const parseCsv = (input) => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value || row.length > 0) {
    row.push(value.replace(/\r$/, ''));
    rows.push(row);
  }

  const [headers, ...data] = rows.filter((item) => item.some(Boolean));
  return data.map((item) => Object.fromEntries(headers.map((header, index) => [header, item[index] ?? ''])));
};

const readCsv = (path) => parseCsv(readFileSync(path, 'utf8'));

const clean = (value) => value.trim();

const splitMunicipalities = (value) => clean(value)
  .split(',')
  .map((item) => clean(item))
  .filter((item) => item && item !== 'Toimii koko Suomessa');

const normalizeUrl = (url) => clean(url).replace(/\/+$/, '').toLocaleLowerCase('fi-FI');

const uniqueByUrl = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeUrl(item.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const stringify = (value) => JSON.stringify(value, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\n/g, '\n');

const patientAssociations = uniqueByUrl(readCsv(sources.patientAssociations)
  .map((row) => ({
    name: clean(row.Nimi),
    url: clean(row.Verkkosivu),
  }))
  .filter((item) => item.name && item.url));

const seniorAssociations = uniqueByUrl(readCsv(sources.seniorAssociations)
  .map((row) => ({
    name: clean(row.Nimi),
    url: clean(row.Verkkosivu),
    group: clean(row.Alue || row.Tyyppi),
    type: clean(row.Tyyppi),
    area: clean(row.Alue),
    municipalities: splitMunicipalities(row.Kunnat),
  }))
  .filter((item) => item.name && item.url));

const museums = uniqueByUrl(readCsv(sources.museums)
  .map((row) => ({
    name: clean(row.Nimi),
    url: clean(row.Verkkosivu),
    group: clean(row.Kunta || row.Alue || row.Tyyppi),
    type: clean(row.Tyyppi),
    area: clean(row.Alue),
    municipality: clean(row.Kunta),
    specialty: clean(row.Erikoisala),
  }))
  .filter((item) => item.name && item.url));

const output = `import { Provider } from './types';

export interface RegionalProvider extends Provider {
  area?: string;
  municipality?: string;
  municipalities?: string[];
  specialty?: string;
  type?: string;
}

export const PATIENT_ASSOCIATION_LINKS: Provider[] = ${stringify(patientAssociations)};

export const SENIOR_ASSOCIATION_LINKS: RegionalProvider[] = ${stringify(seniorAssociations)};

export const MUSEUM_LINKS: RegionalProvider[] = ${stringify(museums)};
`;

writeFileSync(resolve('communityLinks.ts'), output);
