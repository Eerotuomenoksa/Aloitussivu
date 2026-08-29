import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const configuredProvider = env.VITE_DATA_PROVIDER?.trim().toLocaleLowerCase('en-US');
  const providerFile = configuredProvider === 'cloudcity'
    ? './services/data/cloudcityApiDataProvider.ts'
    : configuredProvider === 'firebase-rollback'
      ? './services/data/firebaseDataProvider.ts'
      : configuredProvider === 'local'
        ? './services/data/localDataProvider.ts'
        : env.VITE_FIREBASE_API_KEY?.trim()
          ? './services/data/firebaseDataProvider.ts'
          : './services/data/localDataProvider.ts';

  return {
    plugins: [
      react(),
      ...(mode === 'staging' ? [{
        name: 'staging-noindex',
        transformIndexHtml: {
          order: 'post' as const,
          handler: (html: string) => {
            const robotsMeta = '<meta name="robots" content="noindex, nofollow, noarchive">';
            const robotsPattern = /<meta\s+name=["']robots["'][^>]*>/i;

            return robotsPattern.test(html)
              ? html.replace(robotsPattern, robotsMeta)
              : html.replace('</head>', `    ${robotsMeta}\n</head>`);
          },
        },
      }] : []),
    ],
    resolve: {
      alias: {
        'virtual:data-provider': fileURLToPath(new URL(providerFile, import.meta.url)),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: 'index.html',
          changelog: 'muutosloki.html',
          suggestions: 'ehdotukset.html',
          feedbackQueue: 'kehitysjono.html',
          links: 'linkit.html',
          linksSv: 'linkit-sv.html',
          linksEn: 'linkit-en.html',
          admin: 'yllapito.html',
          privacy: 'tietosuoja.html',
          privacySv: 'tietosuoja-sv.html',
          privacyEn: 'tietosuoja-en.html',
          accessibility: 'saavutettavuus.html',
          accessibilitySv: 'saavutettavuus-sv.html',
          accessibilityEn: 'saavutettavuus-en.html',
        },
      },
    },
    base: './',
  };
});
