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

export const CHANGELOG_GENERATED_AT = "12.5.2026 klo 09.57";
export const CHANGELOG_VERSION = "0.64";
export const CHANGELOG_WORKTREE_SUMMARY: string[] = [
  "Versionumerointi otettiin käyttöön: nykyinen versio näkyy footerissa ja muutoslokin yläosassa.",
  "Muutoshistoria näyttää versionumeron jokaisen muutoksen yhteydessä."
];
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = [];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
  {
    "hash": "c6ee191d0a187c51b9ff992970b372efb5fe455e",
    "date": "2026-05-12",
    "subject": "Puhelinnumerot lisätty 35  ja versionumerointi",
    "version": "0.64"
  },
  {
    "hash": "b03bd630df085f5b3724916aa02fd3afa46ed4dc",
    "date": "2026-05-12",
    "subject": "lisätty 152 alueellista liikuntapaikka linkkiä",
    "version": "0.63"
  },
  {
    "hash": "84a8861b6688f3f8ed3b97c3e7a0701668856cb9",
    "date": "2026-05-12",
    "subject": "Päivitä muutosloki",
    "version": "0.62"
  },
  {
    "hash": "899318babdf949f10bfea7189db6637a345ed293",
    "date": "2026-05-12",
    "subject": "väri muutoksia",
    "version": "0.61"
  },
  {
    "hash": "b995b0538ce132d9b6559b2ad7b5dd293af184c1",
    "date": "2026-05-11",
    "subject": "sään paikkaa vaihdettu takaisin headeriin ja huijausvaroitusten määrä max 2kpl",
    "version": "0.60"
  },
  {
    "hash": "2eeea59d71d758ab420b0454746aff1818468eb0",
    "date": "2026-05-11",
    "subject": "Muutokset",
    "version": "0.59"
  },
  {
    "hash": "0d557441cc41361cf4078dff093e84e38c4e54de",
    "date": "2026-05-11",
    "subject": "Tupla linkkien poistoja ja alueellisten linkkien näkyvyys, lisätty myös paikallisia urheiluseuroja",
    "version": "0.58"
  },
  {
    "hash": "bb547c7ebb9331b5a5f947b50d8aba0d756cb068",
    "date": "2026-05-08",
    "subject": "Paikalliset linkit ja hakupäivitykset",
    "version": "0.57"
  },
  {
    "hash": "e2fe1b4c2593e9f1db47710070c000b1a7c03909",
    "date": "2026-05-08",
    "subject": "ilmoita linkki lähetä-nappulan korjaus ja alueellisten linkkien näkyvyys",
    "version": "0.56"
  },
  {
    "hash": "4578fb7091e7ebb23cf5214e9c59474b8087942d",
    "date": "2026-05-08",
    "subject": "Huijausvaroitusten tarkennukset",
    "version": "0.55"
  },
  {
    "hash": "b75d9b8c630ea216c1e1e5e5cc8c7247cb8a74e2",
    "date": "2026-05-08",
    "subject": "muutosloki tarkennus",
    "version": "0.54"
  },
  {
    "hash": "360ea3d3dd76c6a4612efdaa9257db3c5827eeb6",
    "date": "2026-05-08",
    "subject": "käyttöliittymän siivousta",
    "version": "0.53"
  },
  {
    "hash": "e0b8a689187e142e03c2103e0511bbeb41c44abd",
    "date": "2026-05-08",
    "subject": "koodi tarkistus",
    "version": "0.52"
  },
  {
    "hash": "39d2d6c53df90afbadb0bf0ec704d0ab802cc001",
    "date": "2026-05-07",
    "subject": "Lehtilinkit",
    "version": "0.51"
  },
  {
    "hash": "59898548a2d2ce91bb20eb60fecac320cc68b9bb",
    "date": "2026-05-07",
    "subject": "Huijausvaroitukset",
    "version": "0.50"
  },
  {
    "hash": "73c16755f3cdc9e7ccfa80339ef9363484da81e7",
    "date": "2026-05-07",
    "subject": "secrets",
    "version": "0.49"
  },
  {
    "hash": "2222e5e511815ba3928dd5653e77296b6123d556",
    "date": "2026-05-07",
    "subject": "Huijausvaroitukset toimii ja on etusivulla",
    "version": "0.48"
  },
  {
    "hash": "8cd1a097e22536e18a62bfdc7e9e7aac0ff1a408",
    "date": "2026-05-07",
    "subject": "Päivitä muutosloki",
    "version": "0.47"
  },
  {
    "hash": "b452f10203d293c54622c4b8a192525240eb9d04",
    "date": "2026-05-07",
    "subject": "Firebase määritykset ja uusi kategoria Kotihoito-palvelut",
    "version": "0.46"
  },
  {
    "hash": "0fc8aae40dbe0cccbe0035448024f751b1bd107d",
    "date": "2026-05-07",
    "subject": "tuplien poistoja",
    "version": "0.45"
  },
  {
    "hash": "ae4d9c472a1bfc5aab1d011837adbc0fe0c70718",
    "date": "2026-05-07",
    "subject": "Lisätty Kategoriat Museot, Potilasyhdistykset ja Eläkeyhdistykset sekä huijausvaroitukset",
    "version": "0.44"
  },
  {
    "hash": "32e24dddf9eb3f7ea40cf2dcca6c98bdc34989c2",
    "date": "2026-05-05",
    "subject": "Linkkien tarkituksia ja poistoja\"",
    "version": "0.43"
  },
  {
    "hash": "aa461854769845c67f590aea737be76da0f291c5",
    "date": "2026-05-05",
    "subject": "Haettiin kieliversioihin sopivat linkit",
    "version": "0.42"
  },
  {
    "hash": "15a60ac9961cac77076f942593c51ed331ad61f9",
    "date": "2026-05-05",
    "subject": "Lisää ylläpidon työkalut ja Firebase-linkkiehdotukset",
    "version": "0.41"
  },
  {
    "hash": "154d3e775ec4af6db48dc64f426a844b092afbf0",
    "date": "2026-05-05",
    "subject": "kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame",
    "version": "0.40"
  },
  {
    "hash": "b64d8c43c4c485c0908bcd4810bd3ec403c00ab4",
    "date": "2026-05-04",
    "subject": "\"kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame\"",
    "version": "0.39"
  },
  {
    "hash": "851cc8b4e3f70bf524a28d25ffdfb68610ea1da0",
    "date": "2026-05-04",
    "subject": "poistettu Google haku tyyliset linkit",
    "version": "0.38"
  },
  {
    "hash": "08ce9a87434f1da24c112a1bed71c86899eab3a1",
    "date": "2026-05-04",
    "subject": "hsl.fi alueellisiin linkkeihin",
    "version": "0.37"
  },
  {
    "hash": "7e7fd27f6c551d1249600d11ae6961b61b6323ef",
    "date": "2026-05-04",
    "subject": "Linkki luettelo lisätty",
    "version": "0.36"
  },
  {
    "hash": "6c55f1f54b902f19b6cc7eed8a0cc3497d0d02e7",
    "date": "2026-05-04",
    "subject": "Lisää palvelualueet ja korjaa muutosloki",
    "version": "0.35"
  },
  {
    "hash": "2c19aa029d1b3abeaa9710cf29da361d5589d718",
    "date": "2026-05-04",
    "subject": "elementit -10%, poistettu tuplana olevat kunnan sivut alueellisista linkeistä, lisätty pirkkalainen uutiset feed",
    "version": "0.34"
  },
  {
    "hash": "aeed58215bd6da00dae353c3118bfbf47a6abb94",
    "date": "2026-04-30",
    "subject": "Poistettu google haku linkkejä",
    "version": "0.33"
  },
  {
    "hash": "4716962d88022672767a9e8b914cdc17afbd40f4",
    "date": "2026-04-30",
    "subject": "Kello piilota ja näytä",
    "version": "0.32"
  },
  {
    "hash": "186c74cc4924c08dae0e77586ab1c2d00edbfbb5",
    "date": "2026-04-30",
    "subject": "66 uutisfeediä lisätty",
    "version": "0.31"
  },
  {
    "hash": "a6fe7ee9dd10f3dfc6be238655a208ee8402e7cd",
    "date": "2026-04-30",
    "subject": "Lisätty 120 paikallislehteä ja uusi kategoria",
    "version": "0.30"
  },
  {
    "hash": "e376ccb5ed28d063c30aece4cdb1146ed61a1f47",
    "date": "2026-04-30",
    "subject": "lisätty asetukset valikko, missä voi piilotttaa ja näyttää toimintoja",
    "version": "0.29"
  },
  {
    "hash": "157ae8f63f5be05e382bdec0ef69860986f28f60",
    "date": "2026-04-30",
    "subject": "Add theatre member links",
    "version": "0.28"
  },
  {
    "hash": "cbe4f8d4ffd114250a3abbb8e4e58c751bb11467",
    "date": "2026-04-30",
    "subject": "Add approved link workflow and new links",
    "version": "0.27"
  },
  {
    "hash": "f26af5d59108e2d284f861ae857097fa985105a1",
    "date": "2026-04-30",
    "subject": "siirretty ilmoita linkistä nappulaa",
    "version": "0.26"
  },
  {
    "hash": "3f14e72e3aed4e1e6c4f64974f04ffb72f9c699b",
    "date": "2026-04-30",
    "subject": "Update deploy.yml",
    "version": "0.25"
  },
  {
    "hash": "ba43fd438b351414afb39ac28ff4fd77f7099bbb",
    "date": "2026-04-30",
    "subject": "muotoiluja yläriville",
    "version": "0.24"
  },
  {
    "hash": "93ed1b53ba9fb781e1be2d9ad42ef2ce3668fefd",
    "date": "2026-04-30",
    "subject": "srk poistettu",
    "version": "0.23"
  },
  {
    "hash": "1d054d9a21e1ce4e620580a24bec5e033992aacf",
    "date": "2026-04-30",
    "subject": "lisätty seurakunnat",
    "version": "0.22"
  },
  {
    "hash": "5b2123294b58758a2457d6b31d021818ca2eb6d0",
    "date": "2026-04-30",
    "subject": "lisätty beta teksti ja linkki muutoslokiin",
    "version": "0.21"
  },
  {
    "hash": "52a5969808d8536596d6f3c923c0ba96b9bb2fa9",
    "date": "2026-04-30",
    "subject": "muutosloki lisätty",
    "version": "0.20"
  },
  {
    "hash": "3459ef3d54a07518525195600ea9db4986841ad7",
    "date": "2026-04-30",
    "subject": "Lisätty ehdotettuja linkkejä",
    "version": "0.19"
  },
  {
    "hash": "74e507d03d87f16e8b49021494d2f45817cbaef9",
    "date": "2026-04-30",
    "subject": "lisätty linkkien tarkistamine, uusien ilmoitus toiminto ja vanhentuneen linkin ilmoitus",
    "version": "0.18"
  },
  {
    "hash": "c9e69fd758ba3f96532c3feac5a4f399b1fbc750",
    "date": "2026-04-30",
    "subject": "lisätty oma kunta",
    "version": "0.17"
  },
  {
    "hash": "be951b415e16da4134d81958978488cda1706f90",
    "date": "2026-04-30",
    "subject": "lisätty liputuspäivät ja teemapäivät",
    "version": "0.16"
  },
  {
    "hash": "f8fa06653076ce4e6a4b9022de79cc07a04abdbf",
    "date": "2026-04-30",
    "subject": "Lähimmät opastuspaikat",
    "version": "0.15"
  },
  {
    "hash": "f8230405efbcb3994fb9a08877d3cfbd042399b4",
    "date": "2026-04-30",
    "subject": "muutettu kuntatiedon sijaintia",
    "version": "0.14"
  },
  {
    "hash": "5489a2343b8d9b231a2d305515f376569ce6c452",
    "date": "2026-04-30",
    "subject": "zoom myös pienennys",
    "version": "0.13"
  },
  {
    "hash": "87f72925dd9e4a2d57230a4dc647c5ce386e3904",
    "date": "2026-04-30",
    "subject": "lisätty uutiset",
    "version": "0.12"
  },
  {
    "hash": "642e7754422c5c68a4a8820700a22a5ab6f010ac",
    "date": "2026-04-30",
    "subject": "Paikalliset linkit",
    "version": "0.11"
  },
  {
    "hash": "758cf5b3b450c7abb6416fdcaeb58f18d16cb2a0",
    "date": "2026-04-26",
    "subject": "Lisätty ääniohjaus ja parannettu käyttöliittymää. Ääniohjauksella käyttäjät voivat nyt navigoida sovelluksessa ja suorittaa toimintoja äänikomennoilla, mikä parantaa saavutettavuutta ja käyttökokemusta. Käyttöliittymään on lisätty uusia elementtejä ja parannettu vanhoja, jotta sovellus olisi entistä intuitiivisempi ja visuaalisesti miellyttävämpi. Näiden muutosten myötä sovellus tarjoaa entistä paremman käyttökokemuksen kaikille käyttäjille.",
    "version": "0.10"
  },
  {
    "hash": "2626f6fed8c52ec20d1c41c8c75cda36b78fe4b7",
    "date": "2026-04-26",
    "subject": "koodi korjauksia",
    "version": "0.09"
  },
  {
    "hash": "49b3b7fbd2ea631338eca097a6371dcace0017a5",
    "date": "2026-04-26",
    "subject": "feat: Update app name and links",
    "version": "0.08"
  },
  {
    "hash": "e738e3f55815c672604e75ac6491be310b0d3f1b",
    "date": "2026-02-23",
    "subject": "feat: Refactor app entry point and metadata",
    "version": "0.07"
  },
  {
    "hash": "ff97135e84cd7f7f32c626a67d1bf430fe329744",
    "date": "2026-02-09",
    "subject": "feat(App): Add aria-label to theme toggle button",
    "version": "0.06"
  },
  {
    "hash": "4fa08ca995ab216231a07de027f0d4a8ff4515ec",
    "date": "2026-02-09",
    "subject": "fix(Clock): Remove static greeting and simplify layout",
    "version": "0.05"
  },
  {
    "hash": "05dfff44a2f67b943517351c50c755ad33ed3c42",
    "date": "2026-02-09",
    "subject": "feat: Implement dynamic font size scaling",
    "version": "0.04"
  },
  {
    "hash": "c290e0577010617675a4d01c4ed213df5daba687",
    "date": "2026-02-09",
    "subject": "feat: Improve UI and Gemini integration",
    "version": "0.03"
  },
  {
    "hash": "9bc43bb0241b9fcb5d164c0418194e8ae85c2ffb",
    "date": "2026-02-09",
    "subject": "feat: Introduce daily quotes and improve UI components",
    "version": "0.02"
  },
  {
    "hash": "745890bafb84120cd5e0b9608170ee5a962851dd",
    "date": "2026-02-09",
    "subject": "feat: Initialize Seniorin Aloitussivu project",
    "version": "0.01"
  },
  {
    "hash": "480a9078b67b61ca32368fdbae4171778f1c3cbd",
    "date": "2026-02-09",
    "subject": "Initial commit",
    "version": "0.00"
  }
];
