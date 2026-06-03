export type ChangelogWorktreeChange = {
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
};

export const CHANGELOG_GENERATED_AT = "3.6.2026 klo 06.31";
export const CHANGELOG_VERSION = "0.71.0";
export const CHANGELOG_WORKTREE_SUMMARY: string[] = [
  "Versionumerointi otettiin käyttöön: nykyinen versio näkyy footerissa ja muutoslokin yläosassa.",
  "Muutoshistoria näyttää versionumeron jokaisen muutoksen yhteydessä.",
  "Linkkien tarkistusdata ja ylläpitoloki päivitettiin uusimman buildin yhteydessä.",
  "Google-haku, palveluhaku ja tekoälyavustaja toimivat nyt myös omalla äänellä mikrofonipainikkeen kautta.",
  "Asetuksiin lisättiin mahdollisuus vaihtaa etusivun digitaalinen kello vanhan ajan analogiseen kelloon.",
  "Digitaalisen kellon päivämäärän välistystä parannettiin ja analogisen kellon numerot sijoitettiin selvästi kellotaulun ulkokehälle.",
  "Mobiilissa palveluruudukko muutettiin yksipalstaiseksi listaksi ja alakategorioiden symbolit piilotettiin.",
  "Palveluruudukon ja palveluhaun visuaalinen ilme yhtenäistettiin Aurora-teemaan.",
  "Etusivun alueellisiin palveluihin nostettiin myös paikalliset kirjastokimpat, jotta esimerkiksi Loviisalle näkyy Helle-kirjastot.",
  "Alueellisten palvelujen kunnan valintaa selkeytettiin: rajausviesti päivitettiin, turha kuntalaatikko poistettiin ja Vaihda kunta -painike siirrettiin työpöytänäkymässä kunnan kentän rinnalle.",
  "Alueellisten palveluiden paneelin kortit, kuntahaku ja paikalliset uutiset päivitettiin uuteen Aurora-pintakieleen.",
  "Ylläpitoon lisättiin nimipäivärajapinnan käyttölaskuri, joka näyttää kutsujen kokonaismäärän, onnistuneet ja epäonnistuneet haut sekä viimeisimmän käyttöajan.",
  "Kirjautuminen ja huijausvaroitukset -sivulle lisättiin näkyvä Palaa etusivulle -linkki.",
  "Sivuston esittelyyn lisättiin tieto, että robottia, Google-hakua ja palveluhakua voi käyttää myös omalla äänellä.",
  "Ohje- ja esittelyikkunoiden visuaalinen ilme yhtenäistettiin muun Aurora-ulkoasun kanssa.",
  "Linkkiluettelon Paikkakunnittain-taulukon vaakavieritystä helpotettiin yläreunan vierityspalkilla ja lukitulla paikkakuntasarakkeella.",
  "Linkkiluettelon Paikkakunnittain-välilehdeltä poistettiin tyhjä paikallisten palvelujen sarake ja siihen lisättiin omat sarakkeet potilas- ja eläkeyhdistyksille.",
  "Alueellisten linkkien listaan lisättiin kirjastojen lisäksi museot, teatterit, potilasyhdistykset ja eläkeyhdistykset.",
  "Linkkiluettelon taulukot ja apupalkit päivitettiin käyttämään Aurora-teeman pintoja ja värejä.",
  "Sivustolle lisättiin kokeiluna Sivua tukemassa -sivu, jossa kerrotaan tukijaperiaatteet ja näytetään ensimmäisenä tukijana Vanhustyön keskusliitto ry."
];
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = [];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
  {
    "hash": "b4be06f2aa5936820d454ce24b6e2a3b8f1f8168",
    "date": "2026-06-02",
    "version": "0.74.0",
    "changeType": "minor",
    "subject": "uusi sääkortti ja saavutettavuus tarkistukset"
  },
  {
    "hash": "af4298174475ff9c55934093ba4476ca49c4451b",
    "date": "2026-06-02",
    "version": "0.73.0",
    "changeType": "minor",
    "subject": "Muutokset sivu päivitys ja tummien teemojen uudet värit"
  },
  {
    "hash": "44bec77a5def0672defc7cb014224036036c89cc",
    "date": "2026-06-02",
    "version": "0.72.0",
    "changeType": "minor",
    "subject": "Uusi visuaalinen ilme Aurora ja mahdollisuus valita asetuksista värimaailma"
  },
  {
    "hash": "65826beca2ed722ef53c68282de73db26f551004",
    "date": "2026-06-01",
    "version": "0.71.0",
    "changeType": "minor",
    "subject": "Sivun työnimi on vaihdettu"
  },
  {
    "hash": "f224f36ffd055d08cd13b2046168ffd713f0cbc5",
    "date": "2026-05-31",
    "version": "0.70.0",
    "changeType": "minor",
    "subject": "Versio numeroinnin korjaus"
  },
  {
    "hash": "ab84a59578e9ec6fe2fe1a34c728664bdf0396ce",
    "date": "2026-05-31",
    "version": "0.69.1",
    "changeType": "patch",
    "subject": "päivitä muutosloki"
  },
  {
    "hash": "bcd8f3bfbebddafee65473f453ff23a125fae2ae",
    "date": "2026-05-31",
    "version": "0.69.0",
    "changeType": "minor",
    "subject": "lisätty luonnokset tietosuoja-selosteeseen ja saavutettavuusselosteeseen"
  },
  {
    "hash": "bce6efa1be66086a44341549ed408513ba9a1058",
    "date": "2026-05-31",
    "version": "0.68.0",
    "changeType": "minor",
    "subject": "Saavutettavuus muutoksia"
  },
  {
    "hash": "d8602a5be238d0096881b825fce6f310316a0189",
    "date": "2026-05-29",
    "version": "0.67.0",
    "changeType": "minor",
    "subject": "toinen kello"
  },
  {
    "hash": "315d1ccb512ffe8c36be273625dd2bb7bdf8b62d",
    "date": "2026-05-29",
    "version": "0.66.3",
    "changeType": "patch",
    "subject": "päivitä linkki- ja paikallisuutistiedot"
  },
  {
    "hash": "d51fb607b0534852e3ca78bafccf9118ab642be2",
    "date": "2026-05-29",
    "version": "0.66.2",
    "changeType": "patch",
    "subject": "päivitä linkkien tarkistus"
  },
  {
    "hash": "5fcacdc0df66efe3e566abae564a9036a7046ee7",
    "date": "2026-05-29",
    "version": "0.66.1",
    "changeType": "patch",
    "subject": "päivitä ylläpidon turvallisuuskorjaukset"
  },
  {
    "hash": "28f84d36c3ae7e4cd6c969592fe6916cb9a6a906",
    "date": "2026-05-28",
    "version": "0.66.0",
    "changeType": "minor",
    "subject": "käyttölaskuri päivitys"
  },
  {
    "hash": "cb424a403fc2d7cdedad791f45287fcab782b217",
    "date": "2026-05-28",
    "version": "0.65.0",
    "changeType": "minor",
    "subject": "limit nameday test usage"
  },
  {
    "hash": "a7cdeb6c94e3d0a4350be984c5de83564e570b4f",
    "date": "2026-05-28",
    "version": "0.64.4",
    "changeType": "patch",
    "subject": "avoid live crawls in pages deploy"
  },
  {
    "hash": "aa19828197c588757b15977a2abc6d5dffa7f581",
    "date": "2026-05-28",
    "version": "0.64.3",
    "changeType": "patch",
    "subject": "fix pages firebase validation"
  },
  {
    "hash": "e88ce72a06448f3ecb729f0d585354d5b16b09ae",
    "date": "2026-05-28",
    "version": "0.64.2",
    "changeType": "patch",
    "subject": "chore: update security cleanup and homepage groups"
  },
  {
    "hash": "9af577252e9c8a4b0415b4c818616bb123f1ce8b",
    "date": "2026-05-27",
    "version": "0.64.1",
    "changeType": "patch",
    "subject": "security(P0-SEC-001): Tarkenna ihmistehtavien ohjeet"
  },
  {
    "hash": "7ffe8c6ba3496546ed390f9e30d6c6c4014fb8e9",
    "date": "2026-05-27",
    "version": "0.64.0",
    "changeType": "minor",
    "subject": "security(P3-SEC-014): Kayta vakaata Gemini mallia"
  },
  {
    "hash": "82f54014b5de189f4f8980d0b1e38f8536a77857",
    "date": "2026-05-27",
    "version": "0.63.0",
    "changeType": "minor",
    "subject": "security(P3-SEC-013): Valta innerHTML RSS tekstipurussa"
  },
  {
    "hash": "b9a46f740e8cff8c5b1ab278512bd38e732addfd",
    "date": "2026-05-27",
    "version": "0.62.0",
    "changeType": "minor",
    "subject": "security(P3-SEC-012): Kayta crypto UUID tunnisteissa"
  },
  {
    "hash": "ad1d8918fed21282afed961ab45469504d9c5d23",
    "date": "2026-05-27",
    "version": "0.61.3",
    "changeType": "patch",
    "subject": "security(P2-SEC-011): Lisaa budjettihalytys"
  },
  {
    "hash": "a484c07f982796a4ded2093e3422214154dac23f",
    "date": "2026-05-27",
    "version": "0.61.2",
    "changeType": "patch",
    "subject": "security(P2-SEC-010): Pakota admin tilien 2FA"
  },
  {
    "hash": "520bf1e27348481190d7d4116aed4ba5383d604d",
    "date": "2026-05-27",
    "version": "0.61.1",
    "changeType": "patch",
    "subject": "security(P1-SEC-006): Tiukenna hosting CSP"
  },
  {
    "hash": "6e86159a040dd30064099cc0633505c8806ff440",
    "date": "2026-05-27",
    "version": "0.61.0",
    "changeType": "minor",
    "subject": "security(P1-SEC-005): Vaadi App Check kayttotilastoille"
  },
  {
    "hash": "e738a694fe3455664a659056b80ed308130a7d9d",
    "date": "2026-05-27",
    "version": "0.60.0",
    "changeType": "minor",
    "subject": "security(P1-SEC-004): Pakota App Check geminiChatissa"
  },
  {
    "hash": "852c092c6a01e858ffb74dd05bc9ea3ad322c44b",
    "date": "2026-05-27",
    "version": "0.59.3",
    "changeType": "patch",
    "subject": "security(P0-SEC-003): Rajaa Firebase API avain"
  },
  {
    "hash": "e89ea594b1c80dbb1f9fad87ff051ce76159446a",
    "date": "2026-05-27",
    "version": "0.59.2",
    "changeType": "patch",
    "subject": "security(P0-SEC-002): Siirra tyohakemisto pois OneDrivesta"
  },
  {
    "hash": "dcfe1c45cd2186cfb3bdbf285f846a0bf4d5bb41",
    "date": "2026-05-27",
    "version": "0.59.1",
    "changeType": "patch",
    "subject": "security(P0-SEC-001): Pyorayta functions salaisuudet"
  },
  {
    "hash": "7bb4ebcf68ac11aa1e5d354ca5c8c788908af9b0",
    "date": "2026-05-26",
    "version": "0.59.0",
    "changeType": "minor",
    "subject": "sää vaihtuu paikkakunnan mukaan ja muut kunta tarkistukset manuaaliseen kunnan vaihtoon"
  },
  {
    "hash": "47c4a3e76780f378046e949a2da1d23b598c3066",
    "date": "2026-05-26",
    "version": "0.58.0",
    "changeType": "minor",
    "subject": "laajennettu käyttötilastot sivuille"
  },
  {
    "hash": "493907344c4e87b46b5e807f1efc6f60b09f46a3",
    "date": "2026-05-26",
    "version": "0.57.0",
    "changeType": "minor",
    "subject": "lisätty tilastointi sivu"
  },
  {
    "hash": "0f0766d0ba33814c35788de8b5d2c53f55ac9313",
    "date": "2026-05-26",
    "version": "0.56.0",
    "changeType": "minor",
    "subject": "tietoturva parannuksia"
  },
  {
    "hash": "643bb47e6ab0a22045a645d512755dda952d2702",
    "date": "2026-05-26",
    "version": "0.55.0",
    "changeType": "minor",
    "subject": "lisätty sukujutut ja poistettu tuplia"
  },
  {
    "hash": "f6853c7eafbb3303646289d1cf15e8fff925be00",
    "date": "2026-05-25",
    "version": "0.54.0",
    "changeType": "minor",
    "subject": "digiup tool lisätty"
  },
  {
    "hash": "14f3cd6f6d2743765b8c22d2572fae449633971b",
    "date": "2026-05-25",
    "version": "0.53.0",
    "changeType": "minor",
    "subject": "Lisätty alueellisia kirjastoja ja tukemassa sivu"
  },
  {
    "hash": "d44c3c6c7854307ab63f00471a4fc5fa2633230b",
    "date": "2026-05-25",
    "version": "0.52.0",
    "changeType": "minor",
    "subject": "Lisätty äänen tunnistus Google hakuun ja Avustajaan, muokattu näkyvän kunnan toimintoja"
  },
  {
    "hash": "82e9c3103692ab593cdaf4a313cf049db8f6864a",
    "date": "2026-05-22",
    "version": "0.51.0",
    "changeType": "minor",
    "subject": "Nimipäivät lisätty testaukseen"
  },
  {
    "hash": "e97f3855810aae4cbd13653927eb2f00096ea00d",
    "date": "2026-05-22",
    "version": "0.50.0",
    "changeType": "minor",
    "subject": "lisätty symbolit alueellisiin palveluihin"
  },
  {
    "hash": "35863b5f04184202813182f1a406844b21bacd94",
    "date": "2026-05-22",
    "version": "0.49.0",
    "changeType": "minor",
    "subject": "Luontosivusto.fi lisätty"
  },
  {
    "hash": "97c4d8b150b437ff2d86b933ee732c085d18c21a",
    "date": "2026-05-22",
    "version": "0.48.1",
    "changeType": "patch",
    "subject": "Visuaalinen tarkistus"
  },
  {
    "hash": "6cd99ae858e21f01d3bc7c24e27ecaa459d17b85",
    "date": "2026-05-22",
    "version": "0.48.0",
    "changeType": "minor",
    "subject": "ylläpidon varoitusten ja ilmoitusten käsittelyn korjaukset"
  },
  {
    "hash": "c97a8449cf0e62d91dc964c8161fd1449dd5765a",
    "date": "2026-05-22",
    "version": "0.47.1",
    "changeType": "patch",
    "subject": "huijausvaroitusten ylläpidon toiminta ja tuplalinkkien käsittely"
  },
  {
    "hash": "5c93fddcef2f3562feeba22e4b04276b6defd1e6",
    "date": "2026-05-22",
    "version": "0.47.0",
    "changeType": "minor",
    "subject": "Testaus palautetteen korjauksia"
  },
  {
    "hash": "eef722e41e039b4500ba59b0e42ee22cb64aeb46",
    "date": "2026-05-20",
    "version": "0.46.0",
    "changeType": "minor",
    "subject": "poistettu tupla omakanta"
  },
  {
    "hash": "9377458d2b3c129f7dcc14f7d22e3464b2c85482",
    "date": "2026-05-20",
    "version": "0.45.0",
    "changeType": "minor",
    "subject": "lisää käytettävyyttä mobiiliin"
  },
  {
    "hash": "32123c5a2e3aeb178d6d885fcd360892c74949ad",
    "date": "2026-05-20",
    "version": "0.44.0",
    "changeType": "minor",
    "subject": "lisätty vähemmistöihin liittyviä linkkejä"
  },
  {
    "hash": "b019f1dc54735d1b14acbe6d4e785e97f174718b",
    "date": "2026-05-20",
    "version": "0.43.0",
    "changeType": "minor",
    "subject": "mobiililiittymän tarkennuksia ja ulkomaiden käsittely"
  },
  {
    "hash": "f78da66d316b4dd8523c7cd282113446a0848d5a",
    "date": "2026-05-19",
    "version": "0.42.0",
    "changeType": "minor",
    "subject": "värimaailmaa uusiksi ja esittelykierros"
  },
  {
    "hash": "3647f916469b8469d5a2a397e16f174a9539ae2f",
    "date": "2026-05-19",
    "version": "0.41.0",
    "changeType": "minor",
    "subject": "sivuston esittely"
  },
  {
    "hash": "b6951f7de6ad82564f4b31022982156eff031a38",
    "date": "2026-05-19",
    "version": "0.40.0",
    "changeType": "minor",
    "subject": "Saavutettavuuden parannuksia ja nimen muutos"
  },
  {
    "hash": "79db8e4a6461267e27616fddfcfe829fe6e76465",
    "date": "2026-05-19",
    "version": "0.39.5",
    "changeType": "patch",
    "subject": "laajennettaan paikallisten teatterien ja museoiden näkyvyyttä paikallisliikenteen alueen mukaisiin kuntiin"
  },
  {
    "hash": "8a49ccef1e4aa6d562bd12d4149716df8902a025",
    "date": "2026-05-19",
    "version": "0.39.4",
    "changeType": "patch",
    "subject": "linkkilistaan museo ja teatteri sarake"
  },
  {
    "hash": "5c2cc751895792d356c39aa715097df19ae5aed6",
    "date": "2026-05-18",
    "version": "0.39.3",
    "changeType": "patch",
    "subject": "Korjattu ilmoitetun linkin piilotus"
  },
  {
    "hash": "b097239bbf0dc7d99169edcf067a3048f66179b7",
    "date": "2026-05-18",
    "version": "0.39.2",
    "changeType": "patch",
    "subject": "korjattu huijausvaroitusten hakua"
  },
  {
    "hash": "f263effbe6db46c258e1f13fe87c895f58038685",
    "date": "2026-05-18",
    "version": "0.39.1",
    "changeType": "patch",
    "subject": "Alakategoriat lisätty, lisätty huijausvaroitukset ja korjattu tekoälyn näkyminen laatikoiden päällä"
  },
  {
    "hash": "751584bc50782a26ac3193dc9f897d80aac2c8a4",
    "date": "2026-05-12",
    "version": "0.39.0",
    "changeType": "minor",
    "subject": "Selkeytetty puhelinnumeron ja linkin eroa kategoria näkymässä"
  },
  {
    "hash": "2896f483d513fbb0de259fc2fe037c3844f1e117",
    "date": "2026-05-12",
    "version": "0.38.1",
    "changeType": "patch",
    "subject": "Lisää versiot muutoslokiin"
  },
  {
    "hash": "c6ee191d0a187c51b9ff992970b372efb5fe455e",
    "date": "2026-05-12",
    "version": "0.38.0",
    "changeType": "minor",
    "subject": "Puhelinnumerot lisätty 35  ja versionumerointi"
  },
  {
    "hash": "b03bd630df085f5b3724916aa02fd3afa46ed4dc",
    "date": "2026-05-12",
    "version": "0.37.2",
    "changeType": "patch",
    "subject": "lisätty 152 alueellista liikuntapaikka linkkiä"
  },
  {
    "hash": "84a8861b6688f3f8ed3b97c3e7a0701668856cb9",
    "date": "2026-05-12",
    "version": "0.37.1",
    "changeType": "patch",
    "subject": "Päivitä muutosloki"
  },
  {
    "hash": "899318babdf949f10bfea7189db6637a345ed293",
    "date": "2026-05-12",
    "version": "0.37.0",
    "changeType": "minor",
    "subject": "väri muutoksia"
  },
  {
    "hash": "b995b0538ce132d9b6559b2ad7b5dd293af184c1",
    "date": "2026-05-11",
    "version": "0.36.0",
    "changeType": "minor",
    "subject": "sään paikkaa vaihdettu takaisin headeriin ja huijausvaroitusten määrä max 2kpl"
  },
  {
    "hash": "2eeea59d71d758ab420b0454746aff1818468eb0",
    "date": "2026-05-11",
    "version": "0.35.0",
    "changeType": "minor",
    "subject": "Muutokset"
  },
  {
    "hash": "0d557441cc41361cf4078dff093e84e38c4e54de",
    "date": "2026-05-11",
    "version": "0.34.3",
    "changeType": "patch",
    "subject": "Tupla linkkien poistoja ja alueellisten linkkien näkyvyys, lisätty myös paikallisia urheiluseuroja"
  },
  {
    "hash": "bb547c7ebb9331b5a5f947b50d8aba0d756cb068",
    "date": "2026-05-08",
    "version": "0.34.2",
    "changeType": "patch",
    "subject": "Paikalliset linkit ja hakupäivitykset"
  },
  {
    "hash": "e2fe1b4c2593e9f1db47710070c000b1a7c03909",
    "date": "2026-05-08",
    "version": "0.34.1",
    "changeType": "patch",
    "subject": "ilmoita linkki lähetä-nappulan korjaus ja alueellisten linkkien näkyvyys"
  },
  {
    "hash": "4578fb7091e7ebb23cf5214e9c59474b8087942d",
    "date": "2026-05-08",
    "version": "0.34.0",
    "changeType": "minor",
    "subject": "Huijausvaroitusten tarkennukset"
  },
  {
    "hash": "b75d9b8c630ea216c1e1e5e5cc8c7247cb8a74e2",
    "date": "2026-05-08",
    "version": "0.33.1",
    "changeType": "patch",
    "subject": "muutosloki tarkennus"
  },
  {
    "hash": "360ea3d3dd76c6a4612efdaa9257db3c5827eeb6",
    "date": "2026-05-08",
    "version": "0.33.0",
    "changeType": "minor",
    "subject": "käyttöliittymän siivousta"
  },
  {
    "hash": "e0b8a689187e142e03c2103e0511bbeb41c44abd",
    "date": "2026-05-08",
    "version": "0.32.2",
    "changeType": "patch",
    "subject": "koodi tarkistus"
  },
  {
    "hash": "39d2d6c53df90afbadb0bf0ec704d0ab802cc001",
    "date": "2026-05-07",
    "version": "0.32.1",
    "changeType": "patch",
    "subject": "Lehtilinkit"
  },
  {
    "hash": "59898548a2d2ce91bb20eb60fecac320cc68b9bb",
    "date": "2026-05-07",
    "version": "0.32.0",
    "changeType": "minor",
    "subject": "Huijausvaroitukset"
  },
  {
    "hash": "73c16755f3cdc9e7ccfa80339ef9363484da81e7",
    "date": "2026-05-07",
    "version": "0.31.1",
    "changeType": "patch",
    "subject": "secrets"
  },
  {
    "hash": "2222e5e511815ba3928dd5653e77296b6123d556",
    "date": "2026-05-07",
    "version": "0.31.0",
    "changeType": "minor",
    "subject": "Huijausvaroitukset toimii ja on etusivulla"
  },
  {
    "hash": "8cd1a097e22536e18a62bfdc7e9e7aac0ff1a408",
    "date": "2026-05-07",
    "version": "0.30.1",
    "changeType": "patch",
    "subject": "Päivitä muutosloki"
  },
  {
    "hash": "b452f10203d293c54622c4b8a192525240eb9d04",
    "date": "2026-05-07",
    "version": "0.30.0",
    "changeType": "minor",
    "subject": "Firebase määritykset ja uusi kategoria Kotihoito-palvelut"
  },
  {
    "hash": "0fc8aae40dbe0cccbe0035448024f751b1bd107d",
    "date": "2026-05-07",
    "version": "0.29.0",
    "changeType": "minor",
    "subject": "tuplien poistoja"
  },
  {
    "hash": "ae4d9c472a1bfc5aab1d011837adbc0fe0c70718",
    "date": "2026-05-07",
    "version": "0.28.0",
    "changeType": "minor",
    "subject": "Lisätty Kategoriat Museot, Potilasyhdistykset ja Eläkeyhdistykset sekä huijausvaroitukset"
  },
  {
    "hash": "32e24dddf9eb3f7ea40cf2dcca6c98bdc34989c2",
    "date": "2026-05-05",
    "version": "0.27.3",
    "changeType": "patch",
    "subject": "Linkkien tarkituksia ja poistoja\""
  },
  {
    "hash": "aa461854769845c67f590aea737be76da0f291c5",
    "date": "2026-05-05",
    "version": "0.27.2",
    "changeType": "patch",
    "subject": "Haettiin kieliversioihin sopivat linkit"
  },
  {
    "hash": "15a60ac9961cac77076f942593c51ed331ad61f9",
    "date": "2026-05-05",
    "version": "0.27.1",
    "changeType": "patch",
    "subject": "Lisää ylläpidon työkalut ja Firebase-linkkiehdotukset"
  },
  {
    "hash": "154d3e775ec4af6db48dc64f426a844b092afbf0",
    "date": "2026-05-05",
    "version": "0.27.0",
    "changeType": "minor",
    "subject": "kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame"
  },
  {
    "hash": "b64d8c43c4c485c0908bcd4810bd3ec403c00ab4",
    "date": "2026-05-04",
    "version": "0.26.0",
    "changeType": "minor",
    "subject": "\"kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame\""
  },
  {
    "hash": "851cc8b4e3f70bf524a28d25ffdfb68610ea1da0",
    "date": "2026-05-04",
    "version": "0.25.4",
    "changeType": "patch",
    "subject": "poistettu Google haku tyyliset linkit"
  },
  {
    "hash": "08ce9a87434f1da24c112a1bed71c86899eab3a1",
    "date": "2026-05-04",
    "version": "0.25.3",
    "changeType": "patch",
    "subject": "hsl.fi alueellisiin linkkeihin"
  },
  {
    "hash": "7e7fd27f6c551d1249600d11ae6961b61b6323ef",
    "date": "2026-05-04",
    "version": "0.25.2",
    "changeType": "patch",
    "subject": "Linkki luettelo lisätty"
  },
  {
    "hash": "6c55f1f54b902f19b6cc7eed8a0cc3497d0d02e7",
    "date": "2026-05-04",
    "version": "0.25.1",
    "changeType": "patch",
    "subject": "Lisää palvelualueet ja korjaa muutosloki"
  },
  {
    "hash": "2c19aa029d1b3abeaa9710cf29da361d5589d718",
    "date": "2026-05-04",
    "version": "0.25.0",
    "changeType": "minor",
    "subject": "elementit -10%, poistettu tuplana olevat kunnan sivut alueellisista linkeistä, lisätty pirkkalainen uutiset feed"
  },
  {
    "hash": "aeed58215bd6da00dae353c3118bfbf47a6abb94",
    "date": "2026-04-30",
    "version": "0.24.1",
    "changeType": "patch",
    "subject": "Poistettu google haku linkkejä"
  },
  {
    "hash": "4716962d88022672767a9e8b914cdc17afbd40f4",
    "date": "2026-04-30",
    "version": "0.24.0",
    "changeType": "minor",
    "subject": "Kello piilota ja näytä"
  },
  {
    "hash": "186c74cc4924c08dae0e77586ab1c2d00edbfbb5",
    "date": "2026-04-30",
    "version": "0.23.0",
    "changeType": "minor",
    "subject": "66 uutisfeediä lisätty"
  },
  {
    "hash": "a6fe7ee9dd10f3dfc6be238655a208ee8402e7cd",
    "date": "2026-04-30",
    "version": "0.22.0",
    "changeType": "minor",
    "subject": "Lisätty 120 paikallislehteä ja uusi kategoria"
  },
  {
    "hash": "e376ccb5ed28d063c30aece4cdb1146ed61a1f47",
    "date": "2026-04-30",
    "version": "0.21.0",
    "changeType": "minor",
    "subject": "lisätty asetukset valikko, missä voi piilotttaa ja näyttää toimintoja"
  },
  {
    "hash": "157ae8f63f5be05e382bdec0ef69860986f28f60",
    "date": "2026-04-30",
    "version": "0.20.2",
    "changeType": "patch",
    "subject": "Add theatre member links"
  },
  {
    "hash": "cbe4f8d4ffd114250a3abbb8e4e58c751bb11467",
    "date": "2026-04-30",
    "version": "0.20.1",
    "changeType": "patch",
    "subject": "Add approved link workflow and new links"
  },
  {
    "hash": "f26af5d59108e2d284f861ae857097fa985105a1",
    "date": "2026-04-30",
    "version": "0.20.0",
    "changeType": "minor",
    "subject": "siirretty ilmoita linkistä nappulaa"
  },
  {
    "hash": "3f14e72e3aed4e1e6c4f64974f04ffb72f9c699b",
    "date": "2026-04-30",
    "version": "0.19.1",
    "changeType": "patch",
    "subject": "Update deploy.yml"
  },
  {
    "hash": "ba43fd438b351414afb39ac28ff4fd77f7099bbb",
    "date": "2026-04-30",
    "version": "0.19.0",
    "changeType": "minor",
    "subject": "muotoiluja yläriville"
  },
  {
    "hash": "93ed1b53ba9fb781e1be2d9ad42ef2ce3668fefd",
    "date": "2026-04-30",
    "version": "0.18.0",
    "changeType": "minor",
    "subject": "srk poistettu"
  },
  {
    "hash": "1d054d9a21e1ce4e620580a24bec5e033992aacf",
    "date": "2026-04-30",
    "version": "0.17.0",
    "changeType": "minor",
    "subject": "lisätty seurakunnat"
  },
  {
    "hash": "5b2123294b58758a2457d6b31d021818ca2eb6d0",
    "date": "2026-04-30",
    "version": "0.16.2",
    "changeType": "patch",
    "subject": "lisätty beta teksti ja linkki muutoslokiin"
  },
  {
    "hash": "52a5969808d8536596d6f3c923c0ba96b9bb2fa9",
    "date": "2026-04-30",
    "version": "0.16.1",
    "changeType": "patch",
    "subject": "muutosloki lisätty"
  },
  {
    "hash": "3459ef3d54a07518525195600ea9db4986841ad7",
    "date": "2026-04-30",
    "version": "0.16.0",
    "changeType": "minor",
    "subject": "Lisätty ehdotettuja linkkejä"
  },
  {
    "hash": "74e507d03d87f16e8b49021494d2f45817cbaef9",
    "date": "2026-04-30",
    "version": "0.15.1",
    "changeType": "patch",
    "subject": "lisätty linkkien tarkistamine, uusien ilmoitus toiminto ja vanhentuneen linkin ilmoitus"
  },
  {
    "hash": "c9e69fd758ba3f96532c3feac5a4f399b1fbc750",
    "date": "2026-04-30",
    "version": "0.15.0",
    "changeType": "minor",
    "subject": "lisätty oma kunta"
  },
  {
    "hash": "be951b415e16da4134d81958978488cda1706f90",
    "date": "2026-04-30",
    "version": "0.14.0",
    "changeType": "minor",
    "subject": "lisätty liputuspäivät ja teemapäivät"
  },
  {
    "hash": "f8fa06653076ce4e6a4b9022de79cc07a04abdbf",
    "date": "2026-04-30",
    "version": "0.13.0",
    "changeType": "minor",
    "subject": "Lähimmät opastuspaikat"
  },
  {
    "hash": "f8230405efbcb3994fb9a08877d3cfbd042399b4",
    "date": "2026-04-30",
    "version": "0.12.0",
    "changeType": "minor",
    "subject": "muutettu kuntatiedon sijaintia"
  },
  {
    "hash": "5489a2343b8d9b231a2d305515f376569ce6c452",
    "date": "2026-04-30",
    "version": "0.11.0",
    "changeType": "minor",
    "subject": "zoom myös pienennys"
  },
  {
    "hash": "87f72925dd9e4a2d57230a4dc647c5ce386e3904",
    "date": "2026-04-30",
    "version": "0.10.0",
    "changeType": "minor",
    "subject": "lisätty uutiset"
  },
  {
    "hash": "642e7754422c5c68a4a8820700a22a5ab6f010ac",
    "date": "2026-04-30",
    "version": "0.9.1",
    "changeType": "patch",
    "subject": "Paikalliset linkit"
  },
  {
    "hash": "758cf5b3b450c7abb6416fdcaeb58f18d16cb2a0",
    "date": "2026-04-26",
    "version": "0.9.0",
    "changeType": "minor",
    "subject": "Lisätty ääniohjaus ja parannettu käyttöliittymää. Ääniohjauksella käyttäjät voivat nyt navigoida sovelluksessa ja suorittaa toimintoja äänikomennoilla, mikä parantaa saavutettavuutta ja käyttökokemusta. Käyttöliittymään on lisätty uusia elementtejä ja parannettu vanhoja, jotta sovellus olisi entistä intuitiivisempi ja visuaalisesti miellyttävämpi. Näiden muutosten myötä sovellus tarjoaa entistä paremman käyttökokemuksen kaikille käyttäjille."
  },
  {
    "hash": "2626f6fed8c52ec20d1c41c8c75cda36b78fe4b7",
    "date": "2026-04-26",
    "version": "0.8.0",
    "changeType": "minor",
    "subject": "koodi korjauksia"
  },
  {
    "hash": "49b3b7fbd2ea631338eca097a6371dcace0017a5",
    "date": "2026-04-26",
    "version": "0.7.1",
    "changeType": "patch",
    "subject": "feat: Update app name and links"
  },
  {
    "hash": "e738e3f55815c672604e75ac6491be310b0d3f1b",
    "date": "2026-02-23",
    "version": "0.7.0",
    "changeType": "minor",
    "subject": "feat: Refactor app entry point and metadata"
  },
  {
    "hash": "ff97135e84cd7f7f32c626a67d1bf430fe329744",
    "date": "2026-02-09",
    "version": "0.6.0",
    "changeType": "minor",
    "subject": "feat(App): Add aria-label to theme toggle button"
  },
  {
    "hash": "4fa08ca995ab216231a07de027f0d4a8ff4515ec",
    "date": "2026-02-09",
    "version": "0.5.1",
    "changeType": "patch",
    "subject": "fix(Clock): Remove static greeting and simplify layout"
  },
  {
    "hash": "05dfff44a2f67b943517351c50c755ad33ed3c42",
    "date": "2026-02-09",
    "version": "0.5.0",
    "changeType": "minor",
    "subject": "feat: Implement dynamic font size scaling"
  },
  {
    "hash": "c290e0577010617675a4d01c4ed213df5daba687",
    "date": "2026-02-09",
    "version": "0.4.0",
    "changeType": "minor",
    "subject": "feat: Improve UI and Gemini integration"
  },
  {
    "hash": "9bc43bb0241b9fcb5d164c0418194e8ae85c2ffb",
    "date": "2026-02-09",
    "version": "0.3.0",
    "changeType": "minor",
    "subject": "feat: Introduce daily quotes and improve UI components"
  },
  {
    "hash": "745890bafb84120cd5e0b9608170ee5a962851dd",
    "date": "2026-02-09",
    "version": "0.2.0",
    "changeType": "minor",
    "subject": "feat: Initialize Seniorin Aloitussivu project"
  },
  {
    "hash": "480a9078b67b61ca32368fdbae4171778f1c3cbd",
    "date": "2026-02-09",
    "version": "0.1.1",
    "changeType": "patch",
    "subject": "Initial commit"
  }
];
