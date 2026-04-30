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

export const CHANGELOG_GENERATED_AT = "30.4.2026 klo 12.45";
export const CHANGELOG_SOURCE = "git-fallback";
export const CHANGELOG_WORKTREE_CHANGES: ChangelogWorktreeChange[] = [
  {
    "status": "modified",
    "path": "changelogData.ts"
  },
  {
    "status": "modified",
    "path": "components/RegionalServicesPanel.tsx"
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
    "status": "untracked",
    "path": "localLinkVisibility.ts"
  },
  {
    "status": "modified",
    "path": "localServices.ts"
  },
  {
    "status": "modified",
    "path": "muutosloki.tsx"
  }
];
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = [];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
  {
    "hash": "5b2123294b58758a2457d6b31d021818ca2eb6d0",
    "date": "2026-04-30",
    "subject": "lisätty beta teksti ja linkki muutoslokiin",
    "files": [
      "App.tsx",
      "changelogData.ts",
      "docs/linkit.csv",
      "docs/linkit.md",
      "docs/yllapito-linkkiloki.csv",
      "muutosloki.tsx",
      "scripts/update-changelog.mjs"
    ]
  },
  {
    "hash": "52a5969808d8536596d6f3c923c0ba96b9bb2fa9",
    "date": "2026-04-30",
    "subject": "muutosloki lisätty",
    "files": [
      "changelogData.ts",
      "docs/linkit.csv",
      "docs/linkit.md",
      "docs/yllapito-linkkiloki.csv",
      "muutosloki.tsx"
    ]
  },
  {
    "hash": "3459ef3d54a07518525195600ea9db4986841ad7",
    "date": "2026-04-30",
    "subject": "Lisätty ehdotettuja linkkejä",
    "files": [
      "changelogData.ts",
      "components/InfoModal.tsx",
      "constants.tsx",
      "docs/linkit.csv",
      "docs/linkit.md",
      "docs/yllapito-linkkiloki.csv",
      "linkHealth.ts",
      "linkStats.ts",
      "localStats.ts",
      "muutosloki.html",
      "muutosloki.tsx",
      "package.json",
      "scripts/update-changelog.mjs",
      "scripts/update-links.mjs",
      "vite.config.ts"
    ]
  },
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
  }
];
