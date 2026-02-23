import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Jos sivu on alihakemistossa (esim. /seniorin-aloitussivu/), muuta tämä:
  base: './', 
});