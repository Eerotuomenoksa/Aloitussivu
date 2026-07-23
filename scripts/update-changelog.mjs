import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { bumpVersion, classifyChange, normalizeVersion } from './versioning.mjs';

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, 'changelogData.ts');
const versionPath = path.join(repoRoot, 'appVersion.ts');
const historyBaseVersion = '0.1.0';
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

function readRecentCommits() {
  const output = runGit(['log', '--no-merges', '--date=short', '--pretty=format:@@@%H|%ad|%s']);
  if (!output) return [];

  return output.split(/\r?\n/).filter(Boolean).flatMap(line => {
    if (!line.startsWith('@@@')) return [];
    const [hash, date, subject] = line.slice(3).split('|');
    return [{ hash, date, subject, paths: readCommitPaths(hash) }];
  });
}

function readCommitPaths(hash) {
  try {
    const output = runGit(['show', '--name-only', '--format=', hash]);
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function readAppVersion() {
  try {
    const source = readFileSync(versionPath, 'utf8');
    return normalizeVersion(source.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? '0.0.0');
  } catch {
    return '0.0.0';
  }
}

function addVersionsToCommits(commits, currentVersion) {
  const oldestFirst = [...commits].reverse();
  let cursor = normalizeVersion(historyBaseVersion);
  const versionedOldestFirst = oldestFirst.map((commit) => {
    const classification = classifyChange({
      subject: commit.subject,
      paths: commit.paths,
    });
    cursor = bumpVersion(cursor, classification.bump);

    return {
      hash: commit.hash,
      date: commit.date,
      version: cursor,
      changeType: classification.bump,
      subject: commit.subject,
      tags: getCommitTags(commit),
    };
  });

  return versionedOldestFirst.reverse();
}

function getCommitTags(commit) {
  const subject = commit.subject.toLocaleLowerCase('fi-FI');
  const paths = commit.paths ?? [];
  const tags = [];
  const visualSubjectPattern = /(aurora|visuaal|ulkoasu|ilme|teema|väri|vari|värimaailma|varimaailma|sääkortti|saakortti|bento|mobiili|modal|ikkuna)/iu;
  const visualPathPattern = /^index\.css$/iu;

  if (visualSubjectPattern.test(subject) || paths.some((pathName) => visualPathPattern.test(pathName))) {
    tags.push('Visuaalisuus');
  }

  return tags;
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
  const visibleChanges = changes.filter((change) => (
    !['changelogData.ts', 'scripts/update-changelog.mjs'].includes(change.path)
  ));
  if (visibleChanges.length === 0) return [];

  const paths = visibleChanges.map((change) => change.path);
  const notes = [];

  if (paths.some((pathName) => ['App.tsx'].includes(pathName))) {
    notes.push('Android-puhelimilla asetuspaneeli pysyy nyt ruudun sisällä ja vierii omana paneelinaan.');
  }

  if (paths.some((pathName) => ['communityLinks.ts', 'localSportsClubs.ts'].includes(pathName))) {
    notes.push('Keravan Lähelläsi-sisältöjä täydennettiin: museoihin lisättiin Sinkka, Halosenniemi ja Ainola sekä urheiluseuroihin KP-75, Keravan Urheilijat, Keski-Uudenmaan Yleisurheilu ja PK Keski-Uusimaa.');
  }

  if (paths.some((pathName) => ['components/QuickLinks.tsx', 'components/ProviderModal.tsx', 'components/LocalNewsHeadlines.tsx', 'components/ScamAlertsBanner.tsx', 'components/RegionalServicesPanel.tsx', 'i18n.tsx'].includes(pathName))) {
    notes.push('Alueelliset linkit kertovat nyt selvemmin, onko kyse oman kunnan palvelusta, seudullisesta palvelusta, hyvinvointialueesta, naapurikunnan palvelusta vai valtakunnallisesta hausta.');
    notes.push('Suosikkien löydettävyyttä parannettiin pitämällä tähdet näkyvissä, selkeyttämällä Omat suosikkini -ohjetta ja näyttämällä puuttuvista paikallisuutisista oma viesti.');
    notes.push('Huijausvaroitusten etusivunäkymää tiivistettiin niin, että varoitukset vievät vähemmän tilaa mutta avautuvat edelleen lisätietoihin.');
  }

  if (paths.some((pathName) => ['hooks/useModalFocusTrap.ts', 'components/FeedbackModal.tsx', 'components/LinkReportModal.tsx', 'components/InfoModal.tsx', 'components/HomepageModal.tsx', 'components/ProviderModal.tsx'].includes(pathName))) {
    notes.push('Modaaleihin lisättiin yhteinen fokusloukku, Escape-sulku ja fokuksen palautus, jotta ikkunoita voi käyttää luotettavammin näppäimistöllä ja ruudunlukijalla.');
  }

  if (paths.some((pathName) => ['components/FeedbackModal.tsx'].includes(pathName))) {
    notes.push('Palautelomakkeen kuvakaappausliitteet rajattiin sallittuihin kuvatyyppeihin ja turvalliseen data URL -muotoon.');
  }

  if (paths.some((pathName) => ['appVersion.ts', 'package.json', 'package-lock.json', 'muutosloki.tsx', 'App.tsx'].includes(pathName))) {
    notes.push('Versionumerointi otettiin käyttöön: nykyinen versio näkyy footerissa ja muutoslokin yläosassa.');
    notes.push('Muutoshistoria näyttää versionumeron jokaisen muutoksen yhteydessä.');
  }

  if (paths.some((pathName) => ['index.html', 'public/favicon.svg', 'public/favicon-32.png', 'public/apple-touch-icon.png'].includes(pathName))) {
    notes.push('Sivun otsikkoa, kuvausta ja favicon-kuvakkeita täsmennettiin.');
  }

  if (paths.some((pathName) => ['kehitysjono.tsx'].includes(pathName))) {
    notes.push('Kehitysjonon julkiselle käsittelymerkinnälle annettiin pidempi tekstikenttä.');
  }

  if (paths.some((pathName) => ['localServices.ts'].includes(pathName))) {
    notes.push('Alueellisten linkkien datamalliin lisättiin alkuperätieto oman kunnan, seudun, hyvinvointialueen, naapurikunnan ja valtakunnallisen fallbackin erottamiseen.');
    notes.push('Joukkoliikenteen alueellisia linkkejä täydennettiin Lahden seudulle, Hämeenlinnan seudulle, Vaasaan, Mustasaareen ja Rovaniemelle.');
    notes.push('Loviisan joukkoliikenteen linkki lisättiin alueellisiin palveluihin.');
    notes.push('Paikallisia kirjastolinkkejä täydennettiin Kirkanta/Kirjastot.fi-dataan pohjautuvilla kirjastokimpoilla.');
    notes.push('Alueellisiin palveluihin lisättiin ja laajennettiin palvelualue-mallia, jotta joukkoliikennejärjestäjät, kuten HSL, Nysse, Föli, Linkki ja Vilkku, voidaan jakaa usealle kunnalle yhdestä paikasta.');
    notes.push('Alueellisista linkeistä poistettiin tuplana näkynyt kunnan verkkosivut -linkki, kun kunnan palvelut näyttää saman asian käyttäjälle selkeämmin.');
  }

  if (paths.some((pathName) => ['firestore.rules'].includes(pathName))) {
    notes.push('Firestore-sääntöjä kovennettiin: ylläpidon sähköpostikirjautumiselta vaaditaan vahvistettu sähköposti, dokumentin ID sidotaan kirjoitettuun dataan ja palauteliitteiden kuvamuoto validoidaan.');
  }

  if (paths.some((pathName) => ['README.md', 'security_best_practices_report.md', 'docs/alueelliset-linkit-puuttuvat-kunnat.md'].includes(pathName))) {
    notes.push('Dokumentaatioon lisättiin täyden tarkistuksen raportti, ylläpito-ohjeet ja alueellisten linkkien kattavuusraportti.');
  }

  if (paths.some((pathName) => ['tsconfig.json', 'vite-env.d.ts', 'adminStats.ts', 'components/RegionalServicesPanel.tsx'].includes(pathName))) {
    notes.push('TypeScript-tarkistus korjattiin kulkemaan läpi erottamalla Vite-asetukset omasta projektistaan ja täsmentämällä ongelmalliset tyypit.');
  }

  if (paths.some((pathName) => ['constants.tsx'].includes(pathName))) {
    notes.push('Puhelinnumerot lisättiin omaksi kategoriakseen ja tärkeimpien palveluiden korteille lisättiin soittopainikkeet.');
    notes.push('Liikunta-kategoriaa täydennettiin Tanssit-ryhmällä, josta löytyy lavatansseja, päivätansseja ja seuratanssia tukevia linkkejä.');
  }

  if (paths.some((pathName) => ['localNewspaperFeeds.ts', 'scripts/update-newspaper-feeds.mjs', 'docs/paikallisuutiset-puuttuvat-kunnat.md'].includes(pathName))) {
    notes.push('Pirkkalan uutisiin lisättiin Pirkkalainen-lehden RSS-syöte.');
  }

  if (paths.some((pathName) => ['linkHealth.ts', 'linkStats.ts', 'docs/linkit.csv', 'docs/linkit.md', 'docs/yllapito-linkkiloki.csv', 'scripts/update-links.mjs'].includes(pathName))) {
    notes.push('Linkkien tarkistusdata ja ylläpitoloki päivitettiin uusimman buildin yhteydessä.');
    notes.push('Linkkitarkistukseen lisättiin RSS- ja uutisvirtalinkit sekä http-osoitteet, jotta muuttuneet alasivut ja ei-suojatut linkit jäävät heti pois näkyvistä.');
  }

  if (paths.some((pathName) => ['components/SearchBar.tsx', 'components/Assistant.tsx', 'components/QuickLinks.tsx', 'hooks/useSpeechInput.ts'].includes(pathName))) {
    notes.push('Google-haku, palveluhaku ja tekoälyavustaja toimivat nyt myös omalla äänellä mikrofonipainikkeen kautta.');
  }

  if (paths.some((pathName) => ['App.tsx', 'components/Clock.tsx', 'i18n.tsx', 'index.css'].includes(pathName))) {
    notes.push('Asetuksiin lisättiin mahdollisuus vaihtaa etusivun digitaalinen kello vanhan ajan analogiseen kelloon.');
    notes.push('Digitaalisen kellon päivämäärän välistystä parannettiin ja analogisen kellon numerot sijoitettiin selvästi kellotaulun ulkokehälle.');
  }

  if (paths.some((pathName) => ['components/QuickLinks.tsx', 'index.css'].includes(pathName))) {
    notes.push('Mobiilissa palveluruudukko muutettiin yksipalstaiseksi listaksi ja alakategorioiden symbolit piilotettiin.');
    notes.push('Palveluruudukon ja palveluhaun visuaalinen ilme yhtenäistettiin Aurora-teemaan.');
  }

  if (paths.some((pathName) => ['components/RegionalServicesPanel.tsx'].includes(pathName))) {
    notes.push('Lähelläsi-osion kunnan valinta yhdistettiin otsikon viereen ja aluepalvelut ryhmiteltiin selkeämmin.');
    notes.push('Alueelliset Kela-taksit poistettiin etusivun aluepalveluiden nostokorteista ja jätettiin näkyviin Liikenne-kategorian taksilinkkien kärkeen.');
    notes.push('Etusivun alueellisiin palveluihin nostettiin myös paikalliset kirjastokimpat, jotta esimerkiksi Loviisalle näkyy Helle-kirjastot.');
    notes.push('Alueellisten palvelujen kunnan valintaa selkeytettiin: rajausviesti päivitettiin, turha kuntalaatikko poistettiin ja Vaihda kunta -painike siirrettiin työpöytänäkymässä kunnan kentän rinnalle.');
    notes.push('Alueellisten palveluiden paneelin kortit, kuntahaku ja paikalliset uutiset päivitettiin uuteen Aurora-pintakieleen.');
  }

  if (paths.some((pathName) => ['components/ScamAlertsBanner.tsx'].includes(pathName))) {
    notes.push('Desktopissa kompaktiin huijausvaroitusnäkymään mahtuu nyt kaksi aktiivista varoitusta rinnakkain.');
  }

  if (paths.some((pathName) => ['ehdotukset.tsx', 'adminStats.ts', 'functions/nameday.ts', 'firestore.rules'].includes(pathName))) {
    notes.push('Ylläpitoon lisättiin nimipäivärajapinnan käyttölaskuri, joka näyttää kutsujen kokonaismäärän, onnistuneet ja epäonnistuneet haut sekä viimeisimmän käyttöajan.');
    notes.push('Kirjautuminen ja huijausvaroitukset -sivulle lisättiin näkyvä Palaa etusivulle -linkki.');
  }

  if (paths.some((pathName) => ['components/OnboardingTour.tsx', 'components/InfoModal.tsx'].includes(pathName))) {
    notes.push('Sivuston esittelyyn lisättiin tieto, että robottia, Google-hakua ja palveluhakua voi käyttää myös omalla äänellä.');
    notes.push('Ohje- ja esittelyikkunoiden visuaalinen ilme yhtenäistettiin muun Aurora-ulkoasun kanssa.');
  }

  if (paths.some((pathName) => ['linkit.tsx'].includes(pathName))) {
    notes.push('Linkkiluettelon Paikkakunnittain-taulukon vaakavieritystä helpotettiin yläreunan vierityspalkilla ja lukitulla paikkakuntasarakkeella.');
    notes.push('Linkkiluettelon Paikkakunnittain-välilehdeltä poistettiin tyhjä paikallisten palvelujen sarake ja siihen lisättiin omat sarakkeet potilas- ja eläkeyhdistyksille.');
    notes.push('Alueellisten linkkien listaan lisättiin kirjastojen lisäksi museot, teatterit, potilasyhdistykset ja eläkeyhdistykset.');
    notes.push('Linkkiluettelon taulukot ja apupalkit päivitettiin käyttämään Aurora-teeman pintoja ja värejä.');
  }

  if (paths.some((pathName) => ['sivua-tukemassa.html', 'sivuaTukemassa.tsx', 'App.tsx', 'vite.config.ts'].includes(pathName) || pathName.startsWith('assets/'))) {
    notes.push('Sivustolle lisättiin kokeiluna Sivua tukemassa -sivu, jossa kerrotaan tukijaperiaatteet ja näytetään ensimmäisenä tukijana Vanhustyön keskusliitto ry.');
  }

  if (notes.length === 0) {
    notes.push('Työpuussa on paikallisia muutoksia, mutta niistä ei löytynyt vielä valmista yhteenvetokategoriaa.');
  }

  return uniqueBy(notes, (item) => item);
}

function summarizeCommit(commit) {
  const subject = commit.subject.toLocaleLowerCase('fi-FI');
  const notes = [];

  if (subject.includes('elementit -10%')) {
    notes.push('Käyttöliittymän tekstit, painikkeet ja laatikot pienennettiin 10 prosenttia aiempaa kompaktimmiksi.');
  }

  if (subject.includes('tuplana olevat kunnan sivut')) {
    notes.push('Alueellisista linkeistä poistettiin tuplana näkynyt kunnan verkkosivut -linkki, kun kunnan palvelut näyttää saman asian käyttäjälle selkeämmin.');
  }

  if (subject.includes('pirkkalainen')) {
    notes.push('Pirkkalan uutisiin lisättiin Pirkkalainen-lehden RSS-syöte.');
  }

  if (subject.includes('toinen kello')) {
    notes.push('Asetuksiin lisättiin toinen kello, jonka aikavyöhykkeen käyttäjä voi valita itse.');
  }

  if (subject.includes('saavutettavuus muutoksia')) {
    notes.push('Saavutettavuustarkistuksen havaintoja korjattiin: otsikkorakennetta, asetuspaneelin rooleja, linkkien nimiä ja kosketusalueita parannettiin.');
  }

  if (subject.includes('tietosuoja-selosteeseen') || subject.includes('saavutettavuusselosteeseen')) {
    notes.push('Tietosuojaselosteen ja saavutettavuusselosteen luonnokset lisättiin sivustolle sekä linkitettiin footeriin, Ohjeeseen ja Tietoa-osioon.');
  }

  if (subject.includes('linkkien täysi tarkistus')) {
    notes.push('Kaikki linkkilähteet tarkistettiin uudelleen ja katkenneet tai epäilyttävät linkit piilotettiin loppukäyttäjiltä.');
    notes.push('Alueelliset Kela-taksit poistettiin etusivun nostolinkeistä, mutta ne löytyvät edelleen Liikenne-kategorian taksilinkkien kärjestä.');
  }

  if (subject.includes('suorituskykyä ja virheenkestoa')) {
    notes.push('Paikallisuutisten lähteet haetaan nyt rinnakkain, ja yhden lähteen virhe ei estä muiden lähteiden tuloksia.');
    notes.push('Linkkien näkyvyystarkistus käyttää välimuistitettua estolistaa, ja hyväksyttyjen sekä estettyjen linkkien Firestore-kuuntelut jaetaan päällekkäisten verkkopyyntöjen välttämiseksi.');
    notes.push('Opastuskierroksen vieritysmittaus rajattiin yhteen päivitykseen animaatiokehystä kohden, ja sen ajastimet sekä tapahtumankuuntelijat siivotaan sulkemisen yhteydessä.');
    notes.push('Paikallisten asetusten tallennusvirheet eivät enää estä etusivun toimintaa, jos selaimen paikallinen tallennustila ei ole käytettävissä.');
  }

  if (subject.includes('länsi-uudenmaan palveluliikennelinkkejä')) {
    notes.push('Länsi-Uudenmaan palveluliikennelinkit lisättiin Espoolle, Inkolle, Kauniaisille, Kirkkonummelle ja Siuntiolle; puuttuvien palveluliikennelinkkien määrä väheni 113 kunnasta 108 kuntaan.');
    notes.push('Alueellisten kategorioiden linkkimäärät näytetään nyt käyttäjän valitsemalla kielellä kaikilla seitsemällä tuetulla kielellä.');
  }

  return notes;
}

function summarizeToday(recentCommits, worktreeChanges) {
  const today = new Date().toISOString().slice(0, 10);
  const commitNotes = recentCommits
    .filter((commit) => commit.date === today)
    .flatMap((commit) => summarizeCommit(commit));
  const worktreeNotes = worktreeChanges.length > 0 ? summarizeWorktree(worktreeChanges) : [];

  return uniqueBy([
    ...worktreeNotes,
    ...commitNotes,
  ], (item) => item);
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
const appVersion = readAppVersion();
const worktreeChanges = readWorktreeChanges();
const recentCommits = addVersionsToCommits(readRecentCommits(), appVersion);
const worktreeSummary = summarizeToday(recentCommits, worktreeChanges);
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
  version: string;
  changeType: 'major' | 'minor' | 'patch' | 'none';
  subject: string;
  tags: string[];
};

export const CHANGELOG_GENERATED_AT = ${JSON.stringify(generatedAt)};
export const CHANGELOG_VERSION = ${JSON.stringify(appVersion)};
export const CHANGELOG_WORKTREE_SUMMARY: string[] = ${JSON.stringify(worktreeSummary, null, 2)};
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = ${JSON.stringify(deployments, null, 2)};
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = ${JSON.stringify(recentCommits, null, 2)};
`;

writeFileSync(outputPath, fileContents, 'utf8');
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
