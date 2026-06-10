import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
        admin: 'yllapito.html',
        supporters: 'sivua-tukemassa.html',
        privacy: 'tietosuoja.html',
        accessibility: 'saavutettavuus.html',
      },
    },
  },
  base: './',
});
