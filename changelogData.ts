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
  subject: string;
};

export const CHANGELOG_GENERATED_AT = "29.5.2026 klo 11.11";
export const CHANGELOG_VERSION = "0.64";
export const CHANGELOG_WORKTREE_SUMMARY: string[] = [
  "Versionumerointi otettiin käyttöön: nykyinen versio näkyy footerissa ja muutoslokin yläosassa.",
  "Muutoshistoria näyttää versionumeron jokaisen muutoksen yhteydessä.",
  "Pirkkalan uutisiin lisättiin Pirkkalainen-lehden RSS-syöte.",
  "Linkkien tarkistusdata ja ylläpitoloki päivitettiin uusimman buildin yhteydessä."
];
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = [];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
  {
    "hash": "d51fb607b0534852e3ca78bafccf9118ab642be2",
    "date": "2026-05-29",
    "subject": "päivitä linkkien tarkistus",
    "version": "0.64"
  },
  {
    "hash": "5fcacdc0df66efe3e566abae564a9036a7046ee7",
    "date": "2026-05-29",
    "subject": "päivitä ylläpidon turvallisuuskorjaukset",
    "version": "0.63"
  },
  {
    "hash": "28f84d36c3ae7e4cd6c969592fe6916cb9a6a906",
    "date": "2026-05-28",
    "subject": "käyttölaskuri päivitys",
    "version": "0.62"
  },
  {
    "hash": "cb424a403fc2d7cdedad791f45287fcab782b217",
    "date": "2026-05-28",
    "subject": "limit nameday test usage",
    "version": "0.61"
  },
  {
    "hash": "a7cdeb6c94e3d0a4350be984c5de83564e570b4f",
    "date": "2026-05-28",
    "subject": "avoid live crawls in pages deploy",
    "version": "0.60"
  },
  {
    "hash": "aa19828197c588757b15977a2abc6d5dffa7f581",
    "date": "2026-05-28",
    "subject": "fix pages firebase validation",
    "version": "0.59"
  },
  {
    "hash": "e88ce72a06448f3ecb729f0d585354d5b16b09ae",
    "date": "2026-05-28",
    "subject": "chore: update security cleanup and homepage groups",
    "version": "0.58"
  },
  {
    "hash": "9af577252e9c8a4b0415b4c818616bb123f1ce8b",
    "date": "2026-05-27",
    "subject": "security(P0-SEC-001): Tarkenna ihmistehtavien ohjeet",
    "version": "0.57"
  },
  {
    "hash": "7ffe8c6ba3496546ed390f9e30d6c6c4014fb8e9",
    "date": "2026-05-27",
    "subject": "security(P3-SEC-014): Kayta vakaata Gemini mallia",
    "version": "0.56"
  },
  {
    "hash": "82f54014b5de189f4f8980d0b1e38f8536a77857",
    "date": "2026-05-27",
    "subject": "security(P3-SEC-013): Valta innerHTML RSS tekstipurussa",
    "version": "0.55"
  },
  {
    "hash": "b9a46f740e8cff8c5b1ab278512bd38e732addfd",
    "date": "2026-05-27",
    "subject": "security(P3-SEC-012): Kayta crypto UUID tunnisteissa",
    "version": "0.54"
  },
  {
    "hash": "ad1d8918fed21282afed961ab45469504d9c5d23",
    "date": "2026-05-27",
    "subject": "security(P2-SEC-011): Lisaa budjettihalytys",
    "version": "0.53"
  },
  {
    "hash": "a484c07f982796a4ded2093e3422214154dac23f",
    "date": "2026-05-27",
    "subject": "security(P2-SEC-010): Pakota admin tilien 2FA",
    "version": "0.52"
  },
  {
    "hash": "520bf1e27348481190d7d4116aed4ba5383d604d",
    "date": "2026-05-27",
    "subject": "security(P1-SEC-006): Tiukenna hosting CSP",
    "version": "0.51"
  },
  {
    "hash": "6e86159a040dd30064099cc0633505c8806ff440",
    "date": "2026-05-27",
    "subject": "security(P1-SEC-005): Vaadi App Check kayttotilastoille",
    "version": "0.50"
  },
  {
    "hash": "e738a694fe3455664a659056b80ed308130a7d9d",
    "date": "2026-05-27",
    "subject": "security(P1-SEC-004): Pakota App Check geminiChatissa",
    "version": "0.49"
  },
  {
    "hash": "852c092c6a01e858ffb74dd05bc9ea3ad322c44b",
    "date": "2026-05-27",
    "subject": "security(P0-SEC-003): Rajaa Firebase API avain",
    "version": "0.48"
  },
  {
    "hash": "e89ea594b1c80dbb1f9fad87ff051ce76159446a",
    "date": "2026-05-27",
    "subject": "security(P0-SEC-002): Siirra tyohakemisto pois OneDrivesta",
    "version": "0.47"
  },
  {
    "hash": "dcfe1c45cd2186cfb3bdbf285f846a0bf4d5bb41",
    "date": "2026-05-27",
    "subject": "security(P0-SEC-001): Pyorayta functions salaisuudet",
    "version": "0.46"
  },
  {
    "hash": "7bb4ebcf68ac11aa1e5d354ca5c8c788908af9b0",
    "date": "2026-05-26",
    "subject": "sää vaihtuu paikkakunnan mukaan ja muut kunta tarkistukset manuaaliseen kunnan vaihtoon",
    "version": "0.45"
  },
  {
    "hash": "47c4a3e76780f378046e949a2da1d23b598c3066",
    "date": "2026-05-26",
    "subject": "laajennettu käyttötilastot sivuille",
    "version": "0.44"
  },
  {
    "hash": "493907344c4e87b46b5e807f1efc6f60b09f46a3",
    "date": "2026-05-26",
    "subject": "lisätty tilastointi sivu",
    "version": "0.43"
  },
  {
    "hash": "0f0766d0ba33814c35788de8b5d2c53f55ac9313",
    "date": "2026-05-26",
    "subject": "tietoturva parannuksia",
    "version": "0.42"
  },
  {
    "hash": "643bb47e6ab0a22045a645d512755dda952d2702",
    "date": "2026-05-26",
    "subject": "lisätty sukujutut ja poistettu tuplia",
    "version": "0.41"
  },
  {
    "hash": "f6853c7eafbb3303646289d1cf15e8fff925be00",
    "date": "2026-05-25",
    "subject": "digiup tool lisätty",
    "version": "0.40"
  },
  {
    "hash": "14f3cd6f6d2743765b8c22d2572fae449633971b",
    "date": "2026-05-25",
    "subject": "Lisätty alueellisia kirjastoja ja tukemassa sivu",
    "version": "0.39"
  },
  {
    "hash": "d44c3c6c7854307ab63f00471a4fc5fa2633230b",
    "date": "2026-05-25",
    "subject": "Lisätty äänen tunnistus Google hakuun ja Avustajaan, muokattu näkyvän kunnan toimintoja",
    "version": "0.38"
  },
  {
    "hash": "82e9c3103692ab593cdaf4a313cf049db8f6864a",
    "date": "2026-05-22",
    "subject": "Nimipäivät lisätty testaukseen",
    "version": "0.37"
  },
  {
    "hash": "e97f3855810aae4cbd13653927eb2f00096ea00d",
    "date": "2026-05-22",
    "subject": "lisätty symbolit alueellisiin palveluihin",
    "version": "0.36"
  },
  {
    "hash": "35863b5f04184202813182f1a406844b21bacd94",
    "date": "2026-05-22",
    "subject": "Luontosivusto.fi lisätty",
    "version": "0.35"
  },
  {
    "hash": "97c4d8b150b437ff2d86b933ee732c085d18c21a",
    "date": "2026-05-22",
    "subject": "Visuaalinen tarkistus",
    "version": "0.34"
  },
  {
    "hash": "6cd99ae858e21f01d3bc7c24e27ecaa459d17b85",
    "date": "2026-05-22",
    "subject": "ylläpidon varoitusten ja ilmoitusten käsittelyn korjaukset",
    "version": "0.33"
  },
  {
    "hash": "c97a8449cf0e62d91dc964c8161fd1449dd5765a",
    "date": "2026-05-22",
    "subject": "huijausvaroitusten ylläpidon toiminta ja tuplalinkkien käsittely",
    "version": "0.32"
  },
  {
    "hash": "5c93fddcef2f3562feeba22e4b04276b6defd1e6",
    "date": "2026-05-22",
    "subject": "Testaus palautetteen korjauksia",
    "version": "0.31"
  },
  {
    "hash": "eef722e41e039b4500ba59b0e42ee22cb64aeb46",
    "date": "2026-05-20",
    "subject": "poistettu tupla omakanta",
    "version": "0.30"
  },
  {
    "hash": "9377458d2b3c129f7dcc14f7d22e3464b2c85482",
    "date": "2026-05-20",
    "subject": "lisää käytettävyyttä mobiiliin",
    "version": "0.29"
  },
  {
    "hash": "32123c5a2e3aeb178d6d885fcd360892c74949ad",
    "date": "2026-05-20",
    "subject": "lisätty vähemmistöihin liittyviä linkkejä",
    "version": "0.28"
  },
  {
    "hash": "b019f1dc54735d1b14acbe6d4e785e97f174718b",
    "date": "2026-05-20",
    "subject": "mobiililiittymän tarkennuksia ja ulkomaiden käsittely",
    "version": "0.27"
  },
  {
    "hash": "f78da66d316b4dd8523c7cd282113446a0848d5a",
    "date": "2026-05-19",
    "subject": "värimaailmaa uusiksi ja esittelykierros",
    "version": "0.26"
  },
  {
    "hash": "3647f916469b8469d5a2a397e16f174a9539ae2f",
    "date": "2026-05-19",
    "subject": "sivuston esittely",
    "version": "0.25"
  },
  {
    "hash": "b6951f7de6ad82564f4b31022982156eff031a38",
    "date": "2026-05-19",
    "subject": "Saavutettavuuden parannuksia ja nimen muutos",
    "version": "0.24"
  },
  {
    "hash": "79db8e4a6461267e27616fddfcfe829fe6e76465",
    "date": "2026-05-19",
    "subject": "laajennettaan paikallisten teatterien ja museoiden näkyvyyttä paikallisliikenteen alueen mukaisiin kuntiin",
    "version": "0.23"
  },
  {
    "hash": "8a49ccef1e4aa6d562bd12d4149716df8902a025",
    "date": "2026-05-19",
    "subject": "linkkilistaan museo ja teatteri sarake",
    "version": "0.22"
  },
  {
    "hash": "5c2cc751895792d356c39aa715097df19ae5aed6",
    "date": "2026-05-18",
    "subject": "Korjattu ilmoitetun linkin piilotus",
    "version": "0.21"
  },
  {
    "hash": "b097239bbf0dc7d99169edcf067a3048f66179b7",
    "date": "2026-05-18",
    "subject": "korjattu huijausvaroitusten hakua",
    "version": "0.20"
  },
  {
    "hash": "f263effbe6db46c258e1f13fe87c895f58038685",
    "date": "2026-05-18",
    "subject": "Alakategoriat lisätty, lisätty huijausvaroitukset ja korjattu tekoälyn näkyminen laatikoiden päällä",
    "version": "0.19"
  },
  {
    "hash": "751584bc50782a26ac3193dc9f897d80aac2c8a4",
    "date": "2026-05-12",
    "subject": "Selkeytetty puhelinnumeron ja linkin eroa kategoria näkymässä",
    "version": "0.18"
  },
  {
    "hash": "2896f483d513fbb0de259fc2fe037c3844f1e117",
    "date": "2026-05-12",
    "subject": "Lisää versiot muutoslokiin",
    "version": "0.17"
  },
  {
    "hash": "c6ee191d0a187c51b9ff992970b372efb5fe455e",
    "date": "2026-05-12",
    "subject": "Puhelinnumerot lisätty 35  ja versionumerointi",
    "version": "0.16"
  },
  {
    "hash": "b03bd630df085f5b3724916aa02fd3afa46ed4dc",
    "date": "2026-05-12",
    "subject": "lisätty 152 alueellista liikuntapaikka linkkiä",
    "version": "0.15"
  },
  {
    "hash": "84a8861b6688f3f8ed3b97c3e7a0701668856cb9",
    "date": "2026-05-12",
    "subject": "Päivitä muutosloki",
    "version": "0.14"
  },
  {
    "hash": "899318babdf949f10bfea7189db6637a345ed293",
    "date": "2026-05-12",
    "subject": "väri muutoksia",
    "version": "0.13"
  },
  {
    "hash": "b995b0538ce132d9b6559b2ad7b5dd293af184c1",
    "date": "2026-05-11",
    "subject": "sään paikkaa vaihdettu takaisin headeriin ja huijausvaroitusten määrä max 2kpl",
    "version": "0.12"
  },
  {
    "hash": "2eeea59d71d758ab420b0454746aff1818468eb0",
    "date": "2026-05-11",
    "subject": "Muutokset",
    "version": "0.11"
  },
  {
    "hash": "0d557441cc41361cf4078dff093e84e38c4e54de",
    "date": "2026-05-11",
    "subject": "Tupla linkkien poistoja ja alueellisten linkkien näkyvyys, lisätty myös paikallisia urheiluseuroja",
    "version": "0.10"
  },
  {
    "hash": "bb547c7ebb9331b5a5f947b50d8aba0d756cb068",
    "date": "2026-05-08",
    "subject": "Paikalliset linkit ja hakupäivitykset",
    "version": "0.09"
  },
  {
    "hash": "e2fe1b4c2593e9f1db47710070c000b1a7c03909",
    "date": "2026-05-08",
    "subject": "ilmoita linkki lähetä-nappulan korjaus ja alueellisten linkkien näkyvyys",
    "version": "0.08"
  },
  {
    "hash": "4578fb7091e7ebb23cf5214e9c59474b8087942d",
    "date": "2026-05-08",
    "subject": "Huijausvaroitusten tarkennukset",
    "version": "0.07"
  },
  {
    "hash": "b75d9b8c630ea216c1e1e5e5cc8c7247cb8a74e2",
    "date": "2026-05-08",
    "subject": "muutosloki tarkennus",
    "version": "0.06"
  },
  {
    "hash": "360ea3d3dd76c6a4612efdaa9257db3c5827eeb6",
    "date": "2026-05-08",
    "subject": "käyttöliittymän siivousta",
    "version": "0.05"
  },
  {
    "hash": "e0b8a689187e142e03c2103e0511bbeb41c44abd",
    "date": "2026-05-08",
    "subject": "koodi tarkistus",
    "version": "0.04"
  },
  {
    "hash": "39d2d6c53df90afbadb0bf0ec704d0ab802cc001",
    "date": "2026-05-07",
    "subject": "Lehtilinkit",
    "version": "0.03"
  },
  {
    "hash": "59898548a2d2ce91bb20eb60fecac320cc68b9bb",
    "date": "2026-05-07",
    "subject": "Huijausvaroitukset",
    "version": "0.02"
  },
  {
    "hash": "73c16755f3cdc9e7ccfa80339ef9363484da81e7",
    "date": "2026-05-07",
    "subject": "secrets",
    "version": "0.01"
  },
  {
    "hash": "2222e5e511815ba3928dd5653e77296b6123d556",
    "date": "2026-05-07",
    "subject": "Huijausvaroitukset toimii ja on etusivulla",
    "version": "0.00"
  },
  {
    "hash": "8cd1a097e22536e18a62bfdc7e9e7aac0ff1a408",
    "date": "2026-05-07",
    "subject": "Päivitä muutosloki",
    "version": "0.00"
  },
  {
    "hash": "b452f10203d293c54622c4b8a192525240eb9d04",
    "date": "2026-05-07",
    "subject": "Firebase määritykset ja uusi kategoria Kotihoito-palvelut",
    "version": "0.00"
  },
  {
    "hash": "0fc8aae40dbe0cccbe0035448024f751b1bd107d",
    "date": "2026-05-07",
    "subject": "tuplien poistoja",
    "version": "0.00"
  },
  {
    "hash": "ae4d9c472a1bfc5aab1d011837adbc0fe0c70718",
    "date": "2026-05-07",
    "subject": "Lisätty Kategoriat Museot, Potilasyhdistykset ja Eläkeyhdistykset sekä huijausvaroitukset",
    "version": "0.00"
  },
  {
    "hash": "32e24dddf9eb3f7ea40cf2dcca6c98bdc34989c2",
    "date": "2026-05-05",
    "subject": "Linkkien tarkituksia ja poistoja\"",
    "version": "0.00"
  },
  {
    "hash": "aa461854769845c67f590aea737be76da0f291c5",
    "date": "2026-05-05",
    "subject": "Haettiin kieliversioihin sopivat linkit",
    "version": "0.00"
  },
  {
    "hash": "15a60ac9961cac77076f942593c51ed331ad61f9",
    "date": "2026-05-05",
    "subject": "Lisää ylläpidon työkalut ja Firebase-linkkiehdotukset",
    "version": "0.00"
  },
  {
    "hash": "154d3e775ec4af6db48dc64f426a844b092afbf0",
    "date": "2026-05-05",
    "subject": "kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame",
    "version": "0.00"
  },
  {
    "hash": "b64d8c43c4c485c0908bcd4810bd3ec403c00ab4",
    "date": "2026-05-04",
    "subject": "\"kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame\"",
    "version": "0.00"
  },
  {
    "hash": "851cc8b4e3f70bf524a28d25ffdfb68610ea1da0",
    "date": "2026-05-04",
    "subject": "poistettu Google haku tyyliset linkit",
    "version": "0.00"
  },
  {
    "hash": "08ce9a87434f1da24c112a1bed71c86899eab3a1",
    "date": "2026-05-04",
    "subject": "hsl.fi alueellisiin linkkeihin",
    "version": "0.00"
  },
  {
    "hash": "7e7fd27f6c551d1249600d11ae6961b61b6323ef",
    "date": "2026-05-04",
    "subject": "Linkki luettelo lisätty",
    "version": "0.00"
  },
  {
    "hash": "6c55f1f54b902f19b6cc7eed8a0cc3497d0d02e7",
    "date": "2026-05-04",
    "subject": "Lisää palvelualueet ja korjaa muutosloki",
    "version": "0.00"
  },
  {
    "hash": "2c19aa029d1b3abeaa9710cf29da361d5589d718",
    "date": "2026-05-04",
    "subject": "elementit -10%, poistettu tuplana olevat kunnan sivut alueellisista linkeistä, lisätty pirkkalainen uutiset feed",
    "version": "0.00"
  },
  {
    "hash": "aeed58215bd6da00dae353c3118bfbf47a6abb94",
    "date": "2026-04-30",
    "subject": "Poistettu google haku linkkejä",
    "version": "0.00"
  },
  {
    "hash": "4716962d88022672767a9e8b914cdc17afbd40f4",
    "date": "2026-04-30",
    "subject": "Kello piilota ja näytä",
    "version": "0.00"
  },
  {
    "hash": "186c74cc4924c08dae0e77586ab1c2d00edbfbb5",
    "date": "2026-04-30",
    "subject": "66 uutisfeediä lisätty",
    "version": "0.00"
  },
  {
    "hash": "a6fe7ee9dd10f3dfc6be238655a208ee8402e7cd",
    "date": "2026-04-30",
    "subject": "Lisätty 120 paikallislehteä ja uusi kategoria",
    "version": "0.00"
  },
  {
    "hash": "e376ccb5ed28d063c30aece4cdb1146ed61a1f47",
    "date": "2026-04-30",
    "subject": "lisätty asetukset valikko, missä voi piilotttaa ja näyttää toimintoja",
    "version": "0.00"
  },
  {
    "hash": "157ae8f63f5be05e382bdec0ef69860986f28f60",
    "date": "2026-04-30",
    "subject": "Add theatre member links",
    "version": "0.00"
  },
  {
    "hash": "cbe4f8d4ffd114250a3abbb8e4e58c751bb11467",
    "date": "2026-04-30",
    "subject": "Add approved link workflow and new links",
    "version": "0.00"
  },
  {
    "hash": "f26af5d59108e2d284f861ae857097fa985105a1",
    "date": "2026-04-30",
    "subject": "siirretty ilmoita linkistä nappulaa",
    "version": "0.00"
  },
  {
    "hash": "3f14e72e3aed4e1e6c4f64974f04ffb72f9c699b",
    "date": "2026-04-30",
    "subject": "Update deploy.yml",
    "version": "0.00"
  },
  {
    "hash": "ba43fd438b351414afb39ac28ff4fd77f7099bbb",
    "date": "2026-04-30",
    "subject": "muotoiluja yläriville",
    "version": "0.00"
  },
  {
    "hash": "93ed1b53ba9fb781e1be2d9ad42ef2ce3668fefd",
    "date": "2026-04-30",
    "subject": "srk poistettu",
    "version": "0.00"
  },
  {
    "hash": "1d054d9a21e1ce4e620580a24bec5e033992aacf",
    "date": "2026-04-30",
    "subject": "lisätty seurakunnat",
    "version": "0.00"
  },
  {
    "hash": "5b2123294b58758a2457d6b31d021818ca2eb6d0",
    "date": "2026-04-30",
    "subject": "lisätty beta teksti ja linkki muutoslokiin",
    "version": "0.00"
  },
  {
    "hash": "52a5969808d8536596d6f3c923c0ba96b9bb2fa9",
    "date": "2026-04-30",
    "subject": "muutosloki lisätty",
    "version": "0.00"
  },
  {
    "hash": "3459ef3d54a07518525195600ea9db4986841ad7",
    "date": "2026-04-30",
    "subject": "Lisätty ehdotettuja linkkejä",
    "version": "0.00"
  },
  {
    "hash": "74e507d03d87f16e8b49021494d2f45817cbaef9",
    "date": "2026-04-30",
    "subject": "lisätty linkkien tarkistamine, uusien ilmoitus toiminto ja vanhentuneen linkin ilmoitus",
    "version": "0.00"
  },
  {
    "hash": "c9e69fd758ba3f96532c3feac5a4f399b1fbc750",
    "date": "2026-04-30",
    "subject": "lisätty oma kunta",
    "version": "0.00"
  },
  {
    "hash": "be951b415e16da4134d81958978488cda1706f90",
    "date": "2026-04-30",
    "subject": "lisätty liputuspäivät ja teemapäivät",
    "version": "0.00"
  },
  {
    "hash": "f8fa06653076ce4e6a4b9022de79cc07a04abdbf",
    "date": "2026-04-30",
    "subject": "Lähimmät opastuspaikat",
    "version": "0.00"
  },
  {
    "hash": "f8230405efbcb3994fb9a08877d3cfbd042399b4",
    "date": "2026-04-30",
    "subject": "muutettu kuntatiedon sijaintia",
    "version": "0.00"
  },
  {
    "hash": "5489a2343b8d9b231a2d305515f376569ce6c452",
    "date": "2026-04-30",
    "subject": "zoom myös pienennys",
    "version": "0.00"
  },
  {
    "hash": "87f72925dd9e4a2d57230a4dc647c5ce386e3904",
    "date": "2026-04-30",
    "subject": "lisätty uutiset",
    "version": "0.00"
  },
  {
    "hash": "642e7754422c5c68a4a8820700a22a5ab6f010ac",
    "date": "2026-04-30",
    "subject": "Paikalliset linkit",
    "version": "0.00"
  },
  {
    "hash": "758cf5b3b450c7abb6416fdcaeb58f18d16cb2a0",
    "date": "2026-04-26",
    "subject": "Lisätty ääniohjaus ja parannettu käyttöliittymää. Ääniohjauksella käyttäjät voivat nyt navigoida sovelluksessa ja suorittaa toimintoja äänikomennoilla, mikä parantaa saavutettavuutta ja käyttökokemusta. Käyttöliittymään on lisätty uusia elementtejä ja parannettu vanhoja, jotta sovellus olisi entistä intuitiivisempi ja visuaalisesti miellyttävämpi. Näiden muutosten myötä sovellus tarjoaa entistä paremman käyttökokemuksen kaikille käyttäjille.",
    "version": "0.00"
  },
  {
    "hash": "2626f6fed8c52ec20d1c41c8c75cda36b78fe4b7",
    "date": "2026-04-26",
    "subject": "koodi korjauksia",
    "version": "0.00"
  },
  {
    "hash": "49b3b7fbd2ea631338eca097a6371dcace0017a5",
    "date": "2026-04-26",
    "subject": "feat: Update app name and links",
    "version": "0.00"
  },
  {
    "hash": "e738e3f55815c672604e75ac6491be310b0d3f1b",
    "date": "2026-02-23",
    "subject": "feat: Refactor app entry point and metadata",
    "version": "0.00"
  },
  {
    "hash": "ff97135e84cd7f7f32c626a67d1bf430fe329744",
    "date": "2026-02-09",
    "subject": "feat(App): Add aria-label to theme toggle button",
    "version": "0.00"
  },
  {
    "hash": "4fa08ca995ab216231a07de027f0d4a8ff4515ec",
    "date": "2026-02-09",
    "subject": "fix(Clock): Remove static greeting and simplify layout",
    "version": "0.00"
  },
  {
    "hash": "05dfff44a2f67b943517351c50c755ad33ed3c42",
    "date": "2026-02-09",
    "subject": "feat: Implement dynamic font size scaling",
    "version": "0.00"
  },
  {
    "hash": "c290e0577010617675a4d01c4ed213df5daba687",
    "date": "2026-02-09",
    "subject": "feat: Improve UI and Gemini integration",
    "version": "0.00"
  },
  {
    "hash": "9bc43bb0241b9fcb5d164c0418194e8ae85c2ffb",
    "date": "2026-02-09",
    "subject": "feat: Introduce daily quotes and improve UI components",
    "version": "0.00"
  },
  {
    "hash": "745890bafb84120cd5e0b9608170ee5a962851dd",
    "date": "2026-02-09",
    "subject": "feat: Initialize Seniorin Aloitussivu project",
    "version": "0.00"
  },
  {
    "hash": "480a9078b67b61ca32368fdbae4171778f1c3cbd",
    "date": "2026-02-09",
    "subject": "Initial commit",
    "version": "0.00"
  }
];
