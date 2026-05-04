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
  subject: string;
};

export const CHANGELOG_GENERATED_AT = "4.5.2026 klo 17.05";
export const CHANGELOG_WORKTREE_SUMMARY: string[] = [
  "Käyttöliittymän tekstit, painikkeet ja laatikot pienennettiin 10 prosenttia aiempaa kompaktimmiksi.",
  "Alueellisista linkeistä poistettiin tuplana näkynyt kunnan verkkosivut -linkki, kun kunnan palvelut näyttää saman asian käyttäjälle selkeämmin.",
  "Pirkkalan uutisiin lisättiin Pirkkalainen-lehden RSS-syöte.",
  "Sijainnista tunnistettu kunta tallennetaan selaimen muistiin, jotta alueelliset palvelut palautuvat automaattisesti sivun uudelleenavauksessa.",
  "Alueellisiin palveluihin lisättiin ja laajennettiin palvelualue-mallia, jotta joukkoliikennejärjestäjät, kuten HSL, Nysse, Föli, Linkki ja Vilkku, voidaan jakaa usealle kunnalle yhdestä paikasta.",
  "Liikenne-kategoriaa täydennettiin suomalaisilla joukkoliikennejärjestäjillä ja suurilla liikennöitsijöillä.",
  "Linkkien tarkistusdata ja ylläpitoloki päivitettiin uusimman buildin yhteydessä."
];
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = [];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
  {
    "hash": "2c19aa029d1b3abeaa9710cf29da361d5589d718",
    "date": "2026-05-04",
    "subject": "elementit -10%, poistettu tuplana olevat kunnan sivut alueellisista linkeistä, lisätty pirkkalainen uutiset feed"
  },
  {
    "hash": "aeed58215bd6da00dae353c3118bfbf47a6abb94",
    "date": "2026-04-30",
    "subject": "Poistettu google haku linkkejä"
  },
  {
    "hash": "4716962d88022672767a9e8b914cdc17afbd40f4",
    "date": "2026-04-30",
    "subject": "Kello piilota ja näytä"
  },
  {
    "hash": "186c74cc4924c08dae0e77586ab1c2d00edbfbb5",
    "date": "2026-04-30",
    "subject": "66 uutisfeediä lisätty"
  },
  {
    "hash": "a6fe7ee9dd10f3dfc6be238655a208ee8402e7cd",
    "date": "2026-04-30",
    "subject": "Lisätty 120 paikallislehteä ja uusi kategoria"
  },
  {
    "hash": "e376ccb5ed28d063c30aece4cdb1146ed61a1f47",
    "date": "2026-04-30",
    "subject": "lisätty asetukset valikko, missä voi piilotttaa ja näyttää toimintoja"
  },
  {
    "hash": "157ae8f63f5be05e382bdec0ef69860986f28f60",
    "date": "2026-04-30",
    "subject": "Add theatre member links"
  },
  {
    "hash": "cbe4f8d4ffd114250a3abbb8e4e58c751bb11467",
    "date": "2026-04-30",
    "subject": "Add approved link workflow and new links"
  },
  {
    "hash": "f26af5d59108e2d284f861ae857097fa985105a1",
    "date": "2026-04-30",
    "subject": "siirretty ilmoita linkistä nappulaa"
  },
  {
    "hash": "3f14e72e3aed4e1e6c4f64974f04ffb72f9c699b",
    "date": "2026-04-30",
    "subject": "Update deploy.yml"
  },
  {
    "hash": "ba43fd438b351414afb39ac28ff4fd77f7099bbb",
    "date": "2026-04-30",
    "subject": "muotoiluja yläriville"
  },
  {
    "hash": "93ed1b53ba9fb781e1be2d9ad42ef2ce3668fefd",
    "date": "2026-04-30",
    "subject": "srk poistettu"
  },
  {
    "hash": "1d054d9a21e1ce4e620580a24bec5e033992aacf",
    "date": "2026-04-30",
    "subject": "lisätty seurakunnat"
  },
  {
    "hash": "5b2123294b58758a2457d6b31d021818ca2eb6d0",
    "date": "2026-04-30",
    "subject": "lisätty beta teksti ja linkki muutoslokiin"
  },
  {
    "hash": "52a5969808d8536596d6f3c923c0ba96b9bb2fa9",
    "date": "2026-04-30",
    "subject": "muutosloki lisätty"
  },
  {
    "hash": "3459ef3d54a07518525195600ea9db4986841ad7",
    "date": "2026-04-30",
    "subject": "Lisätty ehdotettuja linkkejä"
  },
  {
    "hash": "74e507d03d87f16e8b49021494d2f45817cbaef9",
    "date": "2026-04-30",
    "subject": "lisätty linkkien tarkistamine, uusien ilmoitus toiminto ja vanhentuneen linkin ilmoitus"
  },
  {
    "hash": "c9e69fd758ba3f96532c3feac5a4f399b1fbc750",
    "date": "2026-04-30",
    "subject": "lisätty oma kunta"
  },
  {
    "hash": "be951b415e16da4134d81958978488cda1706f90",
    "date": "2026-04-30",
    "subject": "lisätty liputuspäivät ja teemapäivät"
  },
  {
    "hash": "f8fa06653076ce4e6a4b9022de79cc07a04abdbf",
    "date": "2026-04-30",
    "subject": "Lähimmät opastuspaikat"
  }
];
