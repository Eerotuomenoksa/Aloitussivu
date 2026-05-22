export type NameDayToday = {
  date: string;
  names: string[];
};

const CACHE_KEY = 'nameDayToday';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const readCachedNameDay = (): NameDayToday | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as Partial<NameDayToday & { cachedAt: string }>;
    if (!cached.cachedAt || Date.now() - Date.parse(cached.cachedAt) > CACHE_TTL_MS) return null;
    if (!Array.isArray(cached.names)) return null;
    return {
      date: typeof cached.date === 'string' ? cached.date : '',
      names: cached.names.filter((name): name is string => typeof name === 'string'),
    };
  } catch {
    return null;
  }
};

const writeCachedNameDay = (value: NameDayToday) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...value,
      cachedAt: new Date().toISOString(),
    }));
  } catch {
    // Cache is optional.
  }
};

export const getNameDayTodayUrl = () => {
  const explicitUrl = import.meta.env.VITE_NAMEDAY_TODAY_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return '';
  return `https://europe-west1-${projectId}.cloudfunctions.net/namedayToday`;
};

export const fetchNameDayToday = async (): Promise<NameDayToday | null> => {
  const cached = readCachedNameDay();
  if (cached) return cached;

  const url = getNameDayTodayUrl();
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json() as Partial<NameDayToday>;
    if (!Array.isArray(data.names)) return null;

    const result = {
      date: typeof data.date === 'string' ? data.date : '',
      names: data.names.filter((name): name is string => typeof name === 'string' && name.trim().length > 0),
    };
    writeCachedNameDay(result);
    return result;
  } catch {
    return null;
  }
};
