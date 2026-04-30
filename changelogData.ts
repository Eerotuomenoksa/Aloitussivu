export type ChangelogWorktreeChange = {
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'unmerged';
  path: string;
};

export type ChangelogCommit = {
  hash: string;
  date: string;
  subject: string;
  files: string[];
};

export const CHANGELOG_GENERATED_AT = "30.4.2026 klo 12.12";
export const CHANGELOG_WORKTREE_CHANGES: ChangelogWorktreeChange[] = [
  {
    "status": "untracked",
    "path": "changelogData.ts"
  },
  {
    "status": "modified",
    "path": "components/InfoModal.tsx"
  },
  {
    "status": "modified",
    "path": "constants.tsx"
  },
  {
    "status": "modified",
    "path": "docs/linkit.csv"
  },
  {
    "status": "modified",
    "path": "docs/linkit.md"
  },
  {
    "status": "modified",
    "path": "docs/yllapito-linkkiloki.csv"
  },
  {
    "status": "modified",
    "path": "linkHealth.ts"
  },
  {
    "status": "untracked",
    "path": "linkStats.ts"
  },
  {
    "status": "untracked",
    "path": "localStats.ts"
  },
  {
    "status": "untracked",
    "path": "muutosloki.html"
  },
  {
    "status": "untracked",
    "path": "muutosloki.tsx"
  },
  {
    "status": "modified",
    "path": "package.json"
  },
  {
    "status": "untracked",
    "path": "scripts/update-changelog.mjs"
  },
  {
    "status": "modified",
    "path": "scripts/update-links.mjs"
  },
  {
    "status": "modified",
    "path": "vite.config.ts"
  }
];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
  {
    "hash": "74e507d03d87f16e8b49021494d2f45817cbaef9",
    "date": "2026-04-30",
    "subject": "lisätty linkkien tarkistamine, uusien ilmoitus toiminto ja vanhentuneen linkin ilmoitus",
    "files": [
      "App.tsx",
      "components/InfoModal.tsx",
      "components/LinkReportModal.tsx",
      "components/LocalNewsHeadlines.tsx",
      "components/NearbyGuidancePlaces.tsx",
      "components/ProviderModal.tsx",
      "components/QuickLinks.tsx",
      "components/RegionalServicesPanel.tsx",
      "components/WeatherCard.tsx",
      "docs/linkit.csv",
      "docs/linkit.md",
      "docs/yllapito-linkkiloki.csv",
      "linkHealth.ts",
      "linkVisibility.ts",
      "localServices.ts",
      "package.json",
      "scripts/update-links.mjs",
      "types.ts"
    ]
  },
  {
    "hash": "c9e69fd758ba3f96532c3feac5a4f399b1fbc750",
    "date": "2026-04-30",
    "subject": "lisätty oma kunta",
    "files": [
      "localServices.ts",
      "municipalityWebsites.ts"
    ]
  },
  {
    "hash": "be951b415e16da4134d81958978488cda1706f90",
    "date": "2026-04-30",
    "subject": "lisätty liputuspäivät ja teemapäivät",
    "files": [
      "components/Clock.tsx",
      "services/holidayService.ts",
      "types.ts"
    ]
  },
  {
    "hash": "f8fa06653076ce4e6a4b9022de79cc07a04abdbf",
    "date": "2026-04-30",
    "subject": "Lähimmät opastuspaikat",
    "files": [
      "App.tsx",
      "components/NearbyGuidancePlaces.tsx",
      "components/RegionalServicesPanel.tsx",
      "components/WeatherCard.tsx",
      "seniorSurfGuidancePlaces.ts",
      "services/guidancePlacesService.ts",
      "types.ts"
    ]
  },
  {
    "hash": "f8230405efbcb3994fb9a08877d3cfbd042399b4",
    "date": "2026-04-30",
    "subject": "muutettu kuntatiedon sijaintia",
    "files": [
      "components/RegionalServicesPanel.tsx"
    ]
  },
  {
    "hash": "5489a2343b8d9b231a2d305515f376569ce6c452",
    "date": "2026-04-30",
    "subject": "zoom myös pienennys",
    "files": [
      "App.tsx",
      "components/QuickLinks.tsx"
    ]
  },
  {
    "hash": "87f72925dd9e4a2d57230a4dc647c5ce386e3904",
    "date": "2026-04-30",
    "subject": "lisätty uutiset",
    "files": [
      "components/RegionalServicesPanel.tsx",
      "services/rssService.ts"
    ]
  },
  {
    "hash": "642e7754422c5c68a4a8820700a22a5ab6f010ac",
    "date": "2026-04-30",
    "subject": "Paikalliset linkit",
    "files": [
      "App.tsx",
      "components/LocalNewsHeadlines.tsx",
      "components/QuickLinks.tsx",
      "components/RegionalServicesPanel.tsx",
      "components/WeatherCard.tsx",
      "localServices.ts",
      "municipalRegistry.ts",
      "services/rssService.ts",
      "types.ts"
    ]
  },
  {
    "hash": "758cf5b3b450c7abb6416fdcaeb58f18d16cb2a0",
    "date": "2026-04-26",
    "subject": "Lisätty ääniohjaus ja parannettu käyttöliittymää. Ääniohjauksella käyttäjät voivat nyt navigoida sovelluksessa ja suorittaa toimintoja äänikomennoilla, mikä parantaa saavutettavuutta ja käyttökokemusta. Käyttöliittymään on lisätty uusia elementtejä ja parannettu vanhoja, jotta sovellus olisi entistä intuitiivisempi ja visuaalisesti miellyttävämpi. Näiden muutosten myötä sovellus tarjoaa entistä paremman käyttökokemuksen kaikille käyttäjille.",
    "files": [
      ".claude/settings.json",
      "App.tsx",
      "components/InfoModal.tsx",
      "components/ProviderModal.tsx",
      "components/QuickLinks.tsx",
      "constants.tsx",
      "types.ts",
      "vite.config.ts"
    ]
  },
  {
    "hash": "2626f6fed8c52ec20d1c41c8c75cda36b78fe4b7",
    "date": "2026-04-26",
    "subject": "koodi korjauksia",
    "files": [
      ".claude/settings.json",
      ".github/workflows/deploy.yml",
      ".gitignore",
      "index.html",
      "package-lock.json",
      "services/geminiService.ts",
      "tailwind.config.js",
      "vite.config.ts"
    ]
  }
];
