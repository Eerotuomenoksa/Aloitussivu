/// <reference types="vite/client" />

declare module 'virtual:data-provider' {
  import type { DataProvider } from './services/data/dataProvider';
  export const selectedDataProvider: DataProvider;
}
