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

export const CHANGELOG_GENERATED_AT = "30.4.2026 klo 15.03";
export const CHANGELOG_WORKTREE_SUMMARY: string[] = [
  "Muutosloki muutettiin selkokieliseksi kehittäjäsivuksi, joka näyttää muutokset ilman tiedostolinkkejä.",
  "Pääsivulle lisättiin beta-merkintä sekä linkki muutoslokiin.",
  "Paikallisiin linkkeihin lisättiin seurakunnat, ja niiden piilottaminen tallentuu nyt selaimen muistiin.",
  "Linkkien tarkistus, näkyvyyden hallinta ja ylläpitoloki päivittyvät automaattisesti buildin yhteydessä.",
  "Palvelukategorioita ja paikallisia linkkejä laajennettiin uusilla suomalaisilla palveluilla."
];
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = [];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
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
  },
  {
    "hash": "f8230405efbcb3994fb9a08877d3cfbd042399b4",
    "date": "2026-04-30",
    "subject": "muutettu kuntatiedon sijaintia"
  },
  {
    "hash": "5489a2343b8d9b231a2d305515f376569ce6c452",
    "date": "2026-04-30",
    "subject": "zoom myös pienennys"
  },
  {
    "hash": "87f72925dd9e4a2d57230a4dc647c5ce386e3904",
    "date": "2026-04-30",
    "subject": "lisätty uutiset"
  },
  {
    "hash": "642e7754422c5c68a4a8820700a22a5ab6f010ac",
    "date": "2026-04-30",
    "subject": "Paikalliset linkit"
  },
  {
    "hash": "758cf5b3b450c7abb6416fdcaeb58f18d16cb2a0",
    "date": "2026-04-26",
    "subject": "Lisätty ääniohjaus ja parannettu käyttöliittymää. Ääniohjauksella käyttäjät voivat nyt navigoida sovelluksessa ja suorittaa toimintoja äänikomennoilla, mikä parantaa saavutettavuutta ja käyttökokemusta. Käyttöliittymään on lisätty uusia elementtejä ja parannettu vanhoja, jotta sovellus olisi entistä intuitiivisempi ja visuaalisesti miellyttävämpi. Näiden muutosten myötä sovellus tarjoaa entistä paremman käyttökokemuksen kaikille käyttäjille."
  },
  {
    "hash": "2626f6fed8c52ec20d1c41c8c75cda36b78fe4b7",
    "date": "2026-04-26",
    "subject": "koodi korjauksia"
  }
];
