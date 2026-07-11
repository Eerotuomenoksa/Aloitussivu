import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const API_URL = 'https://pxdata.stat.fi/PXWeb/api/v1/fi/Kuntien_avainluvut/kuntien_avainluvut_viimeisin.px';
const PXWEB_URL = 'https://pxdata.stat.fi/PxWeb/pxweb/fi/Kuntien_avainluvut/Kuntien_avainluvut__uusin/kuntien_avainluvut_viimeisin.px';
const STATISTIC_CODE = 'M411';
const STATISTIC_LABEL = 'Väkiluku, 2025';
const POPULATION_YEAR = 2025;

const POPULATION_BANDS = [
  {
    id: 'erittain-pieni',
    label: 'erittäin pieni',
    min: 0,
    max: 1_999,
    regionalServiceLikelihood: 'erittäin suuri',
    serviceExpectation: 'palvelut ovat usein seudullisia, kutsupohjaisia tai taksiyrittäjän hoitamia',
    newsExpectation: 'uutiset löytyvät usein seutu- tai maakuntalehdestä',
  },
  {
    id: 'pieni',
    label: 'pieni',
    min: 2_000,
    max: 4_999,
    regionalServiceLikelihood: 'suuri',
    serviceExpectation: 'palvelu voi olla kunnan oma sivu, asiointiliikenne tai taksipohjainen ratkaisu',
    newsExpectation: 'paikallisuutiset voivat tulla seutulehdestä tai maakuntalehdestä',
  },
  {
    id: 'pienehko',
    label: 'pienehkö',
    min: 5_000,
    max: 9_999,
    regionalServiceLikelihood: 'kohtalainen',
    serviceExpectation: 'oma tai seudullinen joukkoliikenne- ja palveluliikennesivu on mahdollinen',
    newsExpectation: 'paikallislehti tai seutulehti on todennäköinen ensisijainen lähde',
  },
  {
    id: 'keskisuuri',
    label: 'keskisuuri',
    min: 10_000,
    max: 19_999,
    regionalServiceLikelihood: 'kohtalainen tai pieni',
    serviceExpectation: 'omalle tai seudulliselle palvelusivulle on yleensä parempi mahdollisuus',
    newsExpectation: 'uutiset löytyvät usein paikallis- tai seutulehdestä, joskus myös kunnan uutisista',
  },
  {
    id: 'suuri',
    label: 'suuri',
    min: 20_000,
    max: 49_999,
    regionalServiceLikelihood: 'pieni',
    serviceExpectation: 'omaa tai selkeää seudullista joukkoliikenne- ja palveluliikennetietoa kannattaa odottaa',
    newsExpectation: 'paikallinen tai seudullinen uutislähde on usein löydettävissä',
  },
  {
    id: 'erittain-suuri',
    label: 'erittäin suuri',
    min: 50_000,
    max: Number.POSITIVE_INFINITY,
    regionalServiceLikelihood: 'hyvin pieni',
    serviceExpectation: 'omaa tai vahvaa seudullista palvelutietoa kannattaa odottaa',
    newsExpectation: 'paikallinen, seudullinen tai kaupunkikohtainen uutislähde on yleensä löydettävissä',
  },
];

const readText = (filePath) => readFile(path.join(ROOT, filePath), 'utf8');

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const formatNumberFi = (value) => new Intl.NumberFormat('fi-FI')
  .format(value)
  .replace(/[\u00a0\u202f]/g, ' ');

const getPopulationBand = (population) => {
  const band = POPULATION_BANDS.find((candidate) => population >= candidate.min && population <= candidate.max);
  if (!band) throw new Error(`Population band missing for ${population}`);
  return band;
};

const parseMunicipalities = async () => {
  const source = await readText('municipalRegistry.ts');
  return [...source.matchAll(/\{\s*"code":\s*"(?<code>[^"]+)",\s*"name":\s*"(?<name>[^"]+)",\s*"wellbeingAreaCode":\s*"(?<wellbeingAreaCode>[^"]+)",\s*"wellbeingAreaName":\s*"(?<wellbeingAreaName>[^"]+)"/g)]
    .map((match) => ({
      code: match.groups.code,
      name: match.groups.name,
      wellbeingAreaCode: match.groups.wellbeingAreaCode,
      wellbeingAreaName: match.groups.wellbeingAreaName,
    }));
};

const fetchPopulationDataset = async (municipalities) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'user-agent': 'SeniorinAloitussivu municipality-population-context (+https://pxdata.stat.fi/)',
      },
      body: JSON.stringify({
        query: [
          {
            code: 'Alue',
            selection: {
              filter: 'item',
              values: municipalities.map((municipality) => `KU${municipality.code}`),
            },
          },
          {
            code: 'Tiedot',
            selection: {
              filter: 'item',
              values: [STATISTIC_CODE],
            },
          },
        ],
        response: {
          format: 'json-stat2',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Statistics Finland API returned ${response.status} ${response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const mapPopulationByMunicipalityCode = (dataset) => {
  const areaIndex = dataset.dimension?.Alue?.category?.index;
  const values = dataset.value;
  if (!areaIndex || !Array.isArray(values)) {
    throw new Error('Unexpected population dataset shape');
  }

  const populationByCode = new Map();
  for (const [areaCode, index] of Object.entries(areaIndex)) {
    if (!areaCode.startsWith('KU')) continue;
    populationByCode.set(areaCode.slice(2), values[index]);
  }

  return populationByCode;
};

const loadRegionalCoverage = async () => {
  try {
    const source = await readText('outputs/regional-link-coverage.json');
    const parsed = JSON.parse(source);
    return new Map((parsed.municipalities ?? []).map((row) => [row.code, row]));
  } catch {
    return new Map();
  }
};

const countBy = (rows, keyFn) => rows.reduce((acc, row) => {
  const key = keyFn(row);
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});

const createBandSummary = (rows) => POPULATION_BANDS.map((band) => {
  const bandRows = rows.filter((row) => row.populationBand === band.id);
  return {
    id: band.id,
    label: band.label,
    populationRange: band.max === Number.POSITIVE_INFINITY
      ? `${formatNumberFi(band.min)}+`
      : `${formatNumberFi(band.min)}-${formatNumberFi(band.max)}`,
    municipalityCount: bandRows.length,
    publicTransportFallbackCount: bandRows.filter((row) => row.linkCoverage.publicTransportStatus === 'fallback-national').length,
    serviceTransportMissingCount: bandRows.filter((row) => row.linkCoverage.serviceTransportStatus === 'missing').length,
    localNewsFeedMissingCount: bandRows.filter((row) => row.linkCoverage.localNewsFeedStatus === 'missing').length,
    regionalServiceLikelihood: band.regionalServiceLikelihood,
    serviceExpectation: band.serviceExpectation,
    newsExpectation: band.newsExpectation,
  };
});

const createCsv = (rows) => [
  [
    'code',
    'name',
    'wellbeingAreaName',
    'population2025',
    'populationBand',
    'regionalServiceLikelihood',
    'serviceExpectation',
    'newsExpectation',
    'publicTransportStatus',
    'serviceTransportStatus',
    'localNewsFeedStatus',
  ].join(','),
  ...rows.map((row) => [
    row.code,
    row.name,
    row.wellbeingAreaName,
    row.population,
    row.populationBandLabel,
    row.regionalServiceLikelihood,
    row.serviceExpectation,
    row.newsExpectation,
    row.linkCoverage.publicTransportStatus,
    row.linkCoverage.serviceTransportStatus,
    row.linkCoverage.localNewsFeedStatus,
  ].map(csvEscape).join(',')),
].join('\n');

const createMarkdown = (payload) => {
  const summaryRows = payload.bandSummary
    .map((row) => `| ${row.label} | ${row.populationRange} | ${row.municipalityCount} | ${row.publicTransportFallbackCount} | ${row.serviceTransportMissingCount} | ${row.localNewsFeedMissingCount} | ${row.regionalServiceLikelihood} |`)
    .join('\n');

  const municipalityRows = payload.municipalities
    .toSorted((a, b) => a.population - b.population || a.name.localeCompare(b.name, 'fi'))
    .map((row) => `| ${row.name} | ${row.wellbeingAreaName} | ${formatNumberFi(row.population)} | ${row.populationBandLabel} | ${row.linkCoverage.publicTransportStatus} | ${row.linkCoverage.serviceTransportStatus} | ${row.linkCoverage.localNewsFeedStatus} |`)
    .join('\n');

  return `# Kuntien väkiluku ja alueellisten linkkien tulkintatausta

Päivitetty: ${new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date())}

Lähde: Tilastokeskus, Kuntien avainluvut, \`${STATISTIC_LABEL}\`. Taulu on päivitetty ${new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(payload.source.updated))}. Väkiluku tarkoittaa vuoden lopussa vakinaisesti alueella asuvaa väestöä.

Koneellinen JSON: \`outputs/municipality-population-context.json\`
CSV: \`docs/kuntien-vakiluku-linkkitausta.csv\`

## Tulkinta alueellisten linkkien hakuun

Pieni väkiluku ei todista, ettei palvelua ole, mutta se muuttaa hakutyön odotusarvoa. Erittäin pienissä kunnissa julkinen liikenne voi olla kutsu-, asiointi- tai taksipohjaista, ja paikallisuutiset voivat tulla seutu- tai maakuntalehdestä. Siksi puuttuva kuntakohtainen linkki pitää tulkita eri tavalla kuin suuressa kaupungissa: ensin etsitään virallinen oma lähde, sitten seudullinen tai maakunnallinen lähde, ja vasta sen jälkeen kirjataan, että kuntakohtaista linkkiä ei löytynyt.

## Väkilukuluokat ja linkkikattavuus

| Luokka | Väkiluku | Kuntia | Julkinen fallback | Palveluliikenne puuttuu | Uutissyöte puuttuu | Seudullisen mallin todennäköisyys |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${summaryRows}

## Käytännön priorisointi

1. Suurissa ja keskisuurissa kunnissa puuttuva palveluliikenne- tai uutissyötelinkki kannattaa tarkistaa aktiivisesti, koska oma tai selkeä seudullinen sivu on todennäköisempi.
2. Pienissä ja erittäin pienissä kunnissa hyväksyttävä lopputulos voi olla virallinen seudullinen, maakunnallinen, kutsutaksi-, asiointiliikenne- tai maakuntalehtitason linkki.
3. Jos pienelle kunnalle ei löydy omaa paikallislehteä tai RSS-syötettä, etsi ensin seutulehti, maakuntalehti, kunnan uutiset-sivu ja hyvinvointialueen uutiset.
4. Älä lisää kuntakohtaista linkkiä vain siksi, että kunnassa on puute. Linkin pitää edelleen perustua löydettyyn lähteeseen.

## Kunnat väkiluvun mukaan

| Kunta | Hyvinvointialue | Väkiluku 2025 | Luokka | Julkinen liikenne | Palveluliikenne | Uutissyöte |
| --- | --- | ---: | --- | --- | --- | --- |
${municipalityRows}
`;
};

const main = async () => {
  const municipalities = await parseMunicipalities();
  const dataset = await fetchPopulationDataset(municipalities);
  const populationByCode = mapPopulationByMunicipalityCode(dataset);
  const coverageByCode = await loadRegionalCoverage();

  const missingCodes = municipalities
    .filter((municipality) => !populationByCode.has(municipality.code))
    .map((municipality) => `${municipality.code} ${municipality.name}`);

  if (missingCodes.length > 0) {
    throw new Error(`Population missing for municipalities: ${missingCodes.join(', ')}`);
  }

  const rows = municipalities.map((municipality) => {
    const population = populationByCode.get(municipality.code);
    const band = getPopulationBand(population);
    const coverage = coverageByCode.get(municipality.code);

    return {
      ...municipality,
      population,
      populationYear: POPULATION_YEAR,
      populationBand: band.id,
      populationBandLabel: band.label,
      regionalServiceLikelihood: band.regionalServiceLikelihood,
      serviceExpectation: band.serviceExpectation,
      newsExpectation: band.newsExpectation,
      linkCoverage: {
        publicTransportStatus: coverage?.publicTransport?.status ?? 'unknown',
        serviceTransportStatus: coverage?.serviceTransport?.status ?? 'unknown',
        localNewsFeedStatus: coverage?.localNewsFeed?.status ?? 'unknown',
      },
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      name: 'Tilastokeskus, Kuntien avainluvut',
      apiUrl: API_URL,
      pxwebUrl: PXWEB_URL,
      statisticCode: STATISTIC_CODE,
      statisticLabel: STATISTIC_LABEL,
      updated: dataset.updated,
      note: dataset.dimension?.Tiedot?.category?.note?.[STATISTIC_CODE]?.[0] ?? '',
    },
    municipalityCount: rows.length,
    populationYear: POPULATION_YEAR,
    bandDefinitions: POPULATION_BANDS,
    bandSummary: createBandSummary(rows),
    linkCoverageByPopulationBand: countBy(rows, (row) => `${row.populationBand}:${row.linkCoverage.serviceTransportStatus}:${row.linkCoverage.localNewsFeedStatus}`),
    municipalities: rows,
  };

  await mkdir(path.join(ROOT, 'outputs'), { recursive: true });
  await mkdir(path.join(ROOT, 'docs'), { recursive: true });
  await writeFile(path.join(ROOT, 'outputs', 'municipality-population-context.json'), JSON.stringify(payload, null, 2), 'utf8');
  await writeFile(path.join(ROOT, 'docs', 'kuntien-vakiluku-linkkitausta.csv'), `${createCsv(rows)}\n`, 'utf8');
  await writeFile(path.join(ROOT, 'docs', 'kuntien-vakiluku-linkkitausta.md'), createMarkdown(payload), 'utf8');

  console.log(`Wrote ${rows.length} municipality population rows`);
  console.log('Wrote outputs/municipality-population-context.json');
  console.log('Wrote docs/kuntien-vakiluku-linkkitausta.csv');
  console.log('Wrote docs/kuntien-vakiluku-linkkitausta.md');
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
