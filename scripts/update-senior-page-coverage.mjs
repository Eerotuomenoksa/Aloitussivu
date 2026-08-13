import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const API_URL = 'https://pxdata.stat.fi/PXWeb/api/v1/fi/StatFin/vaerak/11re.px';
const PXWEB_URL = 'https://statfin.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__vaerak/statfin_vaerak_pxt_11re.px/';
const DATA_YEAR = '2025';

const readText = (filePath) => readFile(path.join(ROOT, filePath), 'utf8');
const formatNumberFi = (value) => new Intl.NumberFormat('fi-FI')
  .format(value)
  .replace(/[\u00a0\u202f]/g, ' ');
const formatPercentFi = (value) => new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format(value);

const parseMunicipalities = async () => {
  const source = await readText('municipalRegistry.ts');
  return [...source.matchAll(/\{\s*"code":\s*"(?<code>[^"]+)",\s*"name":\s*"(?<name>[^"]+)"/g)]
    .map((match) => ({ code: match.groups.code, name: match.groups.name }));
};

const parseSeniorMunicipalityNames = async () => {
  const source = await readText('localSeniorLinks.ts');
  return [...source.matchAll(/"municipality":\s*"(?<name>[^"]+)"/g)]
    .map((match) => match.groups.name);
};

const findVariable = (metadata, text) => {
  const variable = metadata.variables.find((candidate) => candidate.text === text);
  if (!variable) throw new Error(`Tilastokeskuksen taulusta puuttuu muuttuja: ${text}`);
  return variable;
};

const fetchJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'SeniorinAloitussivu senior-page-coverage (+https://github.com/Eerotuomenoksa/Aloitussivu)',
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`Tilastokeskuksen rajapinta palautti ${response.status} ${response.statusText}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchSeniorPopulation = async (municipalities) => {
  const metadata = await fetchJson(API_URL);
  const area = findVariable(metadata, 'Alue');
  const age = findVariable(metadata, 'Ikä');
  const gender = findVariable(metadata, 'Sukupuoli');
  const year = findVariable(metadata, 'Vuosi');
  const contents = findVariable(metadata, 'Tiedot');
  const ageValues = age.values.filter((value) => value === '100-' || Number.parseInt(value, 10) >= 65);

  const dataset = await fetchJson(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: [
        {
          code: area.code,
          selection: {
            filter: 'item',
            values: ['SSS', ...municipalities.map((municipality) => `KU${municipality.code}`)],
          },
        },
        {
          code: age.code,
          selection: { filter: 'item', values: ageValues },
        },
        {
          code: gender.code,
          selection: { filter: 'item', values: ['SSS'] },
        },
        {
          code: year.code,
          selection: { filter: 'item', values: [DATA_YEAR] },
        },
        {
          code: contents.code,
          selection: { filter: 'item', values: [contents.values[0]] },
        },
      ],
      response: { format: 'json-stat2' },
    }),
  });

  return { dataset, metadata, ageValues, variables: { area, age } };
};

const categoryIndex = (dimension) => {
  const index = dimension?.category?.index;
  if (Array.isArray(index)) return new Map(index.map((value, position) => [value, position]));
  return new Map(Object.entries(index ?? {}));
};

const createStrides = (sizes) => sizes.map((_, dimensionIndex) =>
  sizes.slice(dimensionIndex + 1).reduce((product, size) => product * size, 1));

const populationByArea = (dataset, areaCode, ageCode, ageValues) => {
  const areaDimensionIndex = dataset.id.indexOf(areaCode);
  const ageDimensionIndex = dataset.id.indexOf(ageCode);
  if (areaDimensionIndex === -1 || ageDimensionIndex === -1) {
    throw new Error('Tilastokeskuksen vastauksen ulottuvuuksia ei voitu tunnistaa');
  }

  const areaIndex = categoryIndex(dataset.dimension[areaCode]);
  const ageIndex = categoryIndex(dataset.dimension[ageCode]);
  const strides = createStrides(dataset.size);
  const totals = new Map();

  for (const [areaValue, areaPosition] of areaIndex.entries()) {
    const total = ageValues.reduce((sum, ageValue) => {
      const flatIndex = Number(areaPosition) * strides[areaDimensionIndex]
        + Number(ageIndex.get(ageValue)) * strides[ageDimensionIndex];
      return sum + (dataset.value[flatIndex] ?? 0);
    }, 0);
    totals.set(areaValue, total);
  }

  return totals;
};

const createMarkdown = (payload) => {
  const municipalityRows = payload.municipalities
    .map((row) => `| ${row.name} | ${formatNumberFi(row.population65Plus)} | ${formatPercentFi(row.shareOfCoveredPopulationPercent)} % |`)
    .join('\n');

  return `# Kuntien seniorisivujen väestökattavuus

Päivitetty: ${new Intl.DateTimeFormat('fi-FI', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}

## Tulos

- Oma virallinen seniori- tai ikäihmisten sivu löytyi ${payload.municipalityCount} kunnalle.
- Näissä kunnissa asuu yhteensä **${formatNumberFi(payload.coveredPopulation65Plus)} vähintään 65-vuotiasta**.
- Koko Suomessa asuu yhteensä **${formatNumberFi(payload.finlandPopulation65Plus)} vähintään 65-vuotiasta**.
- Löydetyt kuntasivut kattavat siten **${formatPercentFi(payload.coveragePercent)} %** Suomen 65 vuotta täyttäneestä väestöstä.

## Laskentatapa ja rajaus

Kuntajoukko tulee raportin \`docs/kuntien-seniorisivut.csv\` 70 korkean varmuuden osumasta, jotka on tuotu tiedostoon \`localSeniorLinks.ts\`. Väestömäärät ovat Tilastokeskuksen vuoden ${payload.dataYear} lopun kuntakohtaisia tietoja. Mukana ovat iät 65–99 sekä Tilastokeskuksen yhdistetty luokka 100 vuotta täyttäneille. Koko Suomen vertailuluku lasketaan samasta taulusta ja samoista ikäluokista.

Lähde: [Tilastokeskus, Väestö 31.12. iän ja alueen mukaan](${PXWEB_URL})

Koneellinen tulos: \`outputs/municipality-senior-page-coverage.json\`

## Kunnat

| Kunta | 65 vuotta täyttäneitä | Osuus löydettyjen kuntien 65+ väestöstä |
| --- | ---: | ---: |
${municipalityRows}
`;
};

const main = async () => {
  const municipalities = await parseMunicipalities();
  const municipalityByNormalizedName = new Map(
    municipalities.map((municipality) => [municipality.name.toLocaleLowerCase('fi-FI'), municipality]),
  );
  const seniorMunicipalityNames = [...new Set(await parseSeniorMunicipalityNames())];
  const seniorMunicipalities = seniorMunicipalityNames.map((name) => {
    const municipality = municipalityByNormalizedName.get(name.toLocaleLowerCase('fi-FI'));
    if (!municipality) throw new Error(`Kuntakoodia ei löytynyt seniorilinkille: ${name}`);
    return municipality;
  });

  const { dataset, ageValues, variables } = await fetchSeniorPopulation(seniorMunicipalities);
  const totals = populationByArea(dataset, variables.area.code, variables.age.code, ageValues);
  const rows = seniorMunicipalities
    .map((municipality) => ({
      ...municipality,
      population65Plus: totals.get(`KU${municipality.code}`),
    }))
    .toSorted((a, b) => b.population65Plus - a.population65Plus || a.name.localeCompare(b.name, 'fi'));
  const coveredPopulation65Plus = rows.reduce((sum, row) => sum + row.population65Plus, 0);
  const finlandPopulation65Plus = totals.get('SSS');
  const payload = {
    generatedAt: new Date().toISOString(),
    dataYear: Number(DATA_YEAR),
    ageRange: '65+',
    municipalityCount: rows.length,
    coveredPopulation65Plus,
    finlandPopulation65Plus,
    coveragePercent: coveredPopulation65Plus / finlandPopulation65Plus * 100,
    source: {
      name: 'Tilastokeskus, Väestörakenne',
      apiUrl: API_URL,
      pxwebUrl: PXWEB_URL,
      table: '11re',
      title: dataset.label,
      updated: dataset.updated,
    },
    municipalities: rows.map((row) => ({
      ...row,
      shareOfCoveredPopulationPercent: row.population65Plus / coveredPopulation65Plus * 100,
    })),
  };

  if (rows.length !== 70) {
    throw new Error(`Odotettiin 70 seniorisivukuntaa, mutta löytyi ${rows.length}`);
  }
  if (!Number.isFinite(finlandPopulation65Plus) || !Number.isFinite(coveredPopulation65Plus)) {
    throw new Error('65 vuotta täyttäneiden väestömäärää ei voitu laskea');
  }

  await mkdir(path.join(ROOT, 'outputs'), { recursive: true });
  await mkdir(path.join(ROOT, 'docs'), { recursive: true });
  await writeFile(
    path.join(ROOT, 'outputs', 'municipality-senior-page-coverage.json'),
    `${JSON.stringify(payload, null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    path.join(ROOT, 'docs', 'kuntien-seniorisivujen-vaestokattavuus.md'),
    createMarkdown(payload),
    'utf8',
  );

  console.log(`Kuntia: ${rows.length}`);
  console.log(`65+ löydetyissä kunnissa: ${formatNumberFi(coveredPopulation65Plus)}`);
  console.log(`65+ koko Suomessa: ${formatNumberFi(finlandPopulation65Plus)}`);
  console.log(`Kattavuus: ${formatPercentFi(payload.coveragePercent)} %`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
