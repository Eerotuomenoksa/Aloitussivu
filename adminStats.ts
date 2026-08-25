
export type NameDayApiUsageStats = {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  monthlyRequests: Record<string, number>;
  monthlyLimit: number;
  lastUsedAt: string;
};

export const subscribeNameDayApiUsageStats = (
  callback: (stats: NameDayApiUsageStats | null) => void,
  onError?: (message: string, error?: { code?: string; message: string }) => void
) => {
  callback(null);
  onError?.('Nimipäivärajapinnan laskuri ei kuulu ensimmäiseen Cloudcity-julkaisuun.');
  return () => {};
};
