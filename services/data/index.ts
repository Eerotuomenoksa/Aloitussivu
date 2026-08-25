import type { DataProvider } from './dataProvider';
import { selectedDataProvider } from 'virtual:data-provider';

export * from './dataProvider';
export { adminPollIntervalMs, dataProviderKind } from './providerConfig';

const providerPromise: Promise<DataProvider> = Promise.resolve(selectedDataProvider);

export const getDataProvider = () => providerPromise;

export const getVerifiedAdminSession = async () => {
  const provider = await getDataProvider();
  return provider.getAdminSession();
};
