
import React, { useState, useEffect } from 'react';
import { isLinkVisible, useLinkVisibilityVersion } from '../linkVisibility';
import { LocalityInfo } from '../types';
import { useI18n } from '../i18n';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  windspeed?: number;
  feelsLike?: number;
  humidity?: number;
  code?: number;
  hour?: number;
}

interface WeatherCardProps {
  locality?: LocalityInfo | null;
  onLocationResolved?: (location: LocalityInfo) => void;
  variant?: 'default' | 'compact' | 'chip' | 'aurora';
}

type WeatherState = 'sunny' | 'cloudy' | 'rainy' | 'night';

const getWeatherState = (code: number | undefined, hour: number | undefined): WeatherState => {
  const h = hour ?? 12;
  if (h < 5 || h >= 22) return 'night';
  if (code === undefined) return 'sunny';
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 48) return 'cloudy';
  if (code >= 51) return 'rainy';
  return 'sunny';
};

const RainLayer: React.FC = () => {
  const drops = React.useMemo(() =>
    Array.from({ length: 28 }, () => ({
      left: `${Math.random() * 110 - 5}%`,
      height: `${18 + Math.random() * 28}px`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.7 + Math.random() * 0.6}s`,
      opacity: 0.2 + Math.random() * 0.5,
    })),
  []);

  return (
    <div className="wcard-rain-wrap" aria-hidden="true">
      {drops.map((drop, index) => (
        <div
          key={index}
          className="wcard-raindrop"
          style={{
            left: drop.left,
            height: drop.height,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
};

const StarField: React.FC = () => {
  const stars = React.useMemo(() =>
    Array.from({ length: 32 }, () => {
      const size = 1 + Math.random() * 2.5;
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 75}%`,
        width: `${size}px`,
        height: `${size}px`,
        duration: `${2 + Math.random() * 3}s`,
        delay: `${Math.random() * 3}s`,
      };
    }),
  []);

  return (
    <>
      {stars.map((star, index) => (
        <div
          key={index}
          className="wcard-star"
          aria-hidden="true"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}
    </>
  );
};

const vantaaDistricts = new Set([
  'aviapolis',
  'hakunila',
  'hiekkaharju',
  'kivistö',
  'koivukylä',
  'korso',
  'martinlaakso',
  'myyrmäki',
  'tikkurila',
]);

const WeatherCard: React.FC<WeatherCardProps> = ({ locality, onLocationResolved, variant = 'default' }) => {
  const { language, t } = useI18n();
  useLinkVisibilityVersion();
  const [locationName, setLocationName] = useState<string>(t('location'));
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️';
    if (code >= 1 && code <= 3) return '🌤️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return t('weatherClear');
    if (code >= 1 && code <= 3) return t('weatherPartlyCloudy');
    if (code >= 45 && code <= 48) return t('weatherFog');
    if (code >= 51 && code <= 67) return t('weatherRain');
    if (code >= 71 && code <= 77) return t('weatherSnow');
    if (code >= 80 && code <= 82) return t('weatherShowers');
    if (code >= 95) return t('weatherThunder');
    return t('weatherVariable');
  };

  const isPrecipitation = (code: number | undefined) => (
    code !== undefined && code >= 51
  );

  const resolveMunicipality = (
    address: Record<string, string | undefined>,
    displayName: string,
    normalize: (name: string) => string,
  ) => {
    const candidates = [
      address.municipality,
      address.city,
      address.town,
      address.village,
      address.county,
      address.state_district,
    ].filter(Boolean) as string[];

    const districtCandidates = [
      address.suburb,
      address.city_district,
      address.neighbourhood,
      address.quarter,
    ].filter(Boolean) as string[];

    if (districtCandidates.some((district) => vantaaDistricts.has(normalize(district)))) {
      return 'Vantaa';
    }

    if (displayName.toLocaleLowerCase('fi-FI').includes('vantaa') || displayName.toLocaleLowerCase('fi-FI').includes('vanda')) {
      return 'Vantaa';
    }

    return candidates[0] || t('yourLocation');
  };

  useEffect(() => {
    let isActive = true;

    const fetchCurrentWeather = async (lat: number, lon: number): Promise<WeatherData> => {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,windspeed_10m,weathercode` +
        `&timezone=auto`,
        { cache: 'no-cache' }
      );
      if (!weatherRes.ok) {
        throw new Error(`Weather request failed: ${weatherRes.status}`);
      }
      const weatherData = await weatherRes.json();
      const cur = weatherData.current;
      if (!cur) throw new Error('Weather response missing current data');

      const code: number = cur.weathercode ?? 0;
      const hour: number = cur.time ? new Date(cur.time).getHours() : new Date().getHours();

      return {
        temp: Math.round(cur.temperature_2m ?? 0),
        condition: getWeatherText(code),
        icon: getWeatherIcon(code),
        windspeed: cur.windspeed_10m !== undefined ? Math.round(cur.windspeed_10m * 10) / 10 : undefined,
        feelsLike: cur.apparent_temperature !== undefined ? Math.round(cur.apparent_temperature) : undefined,
        humidity: cur.relative_humidity_2m !== undefined ? Math.round(cur.relative_humidity_2m) : undefined,
        code,
        hour,
      };
    };

    const fetchWeather = async (lat: number, lon: number, shouldLocalizeLinks = true) => {
      try {
        if (isActive) {
          setLoading(true);
        }
        const currentWeather = await fetchCurrentWeather(lat, lon);
        
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&accept-language=fi&lat=${lat}&lon=${lon}&zoom=12`
        );
        const geoData = await geoRes.json();
        const address = geoData.address || {};
        const countryCode = typeof address.country_code === 'string' ? address.country_code.toLowerCase() : undefined;
        const city = address.city || address.town || address.municipality || t('yourLocation');
        const {
          findMunicipality,
          getLocalizedMunicipalityName,
          normalizeMunicipality,
        } = await import('../localServices');
        const municipality = resolveMunicipality(address, geoData.display_name || '', normalizeMunicipality);
        const municipalityInfo = findMunicipality(municipality);
        const isInFinland = countryCode ? countryCode === 'fi' : !!municipalityInfo;
        const localizedMunicipality = getLocalizedMunicipalityName(municipalityInfo, language) || city;
        const fallbackMunicipality = getLocalizedMunicipalityName(findMunicipality('Helsinki'), language) || 'Helsinki';

        if (!isActive) return;

        setWeather(currentWeather);
        setLocationName(shouldLocalizeLinks ? (isInFinland ? localizedMunicipality : city) : fallbackMunicipality);
        if (shouldLocalizeLinks) {
          onLocationResolved?.({ municipality, displayName: city, lat, lon, countryCode, isInFinland });
        }
        setError(null);
      } catch (err) {
        if (isActive) {
          setError(t('weatherUnavailable'));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    const fetchWeatherForMunicipality = async (nextLocality: LocalityInfo) => {
      try {
        setLoading(true);
        setError(null);
        const {
          findMunicipality,
          getLocalizedMunicipalityName,
        } = await import('../localServices');
        const municipalityInfo = findMunicipality(nextLocality.municipality);
        const displayName = getLocalizedMunicipalityName(municipalityInfo, language) || nextLocality.displayName || nextLocality.municipality;
        setLocationName(displayName);

        if (typeof nextLocality.lat === 'number' && typeof nextLocality.lon === 'number') {
          const currentWeather = await fetchCurrentWeather(nextLocality.lat, nextLocality.lon);
          if (!isActive) return;
          setWeather(currentWeather);
          setError(null);
          setLoading(false);
          return;
        }

        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nextLocality.municipality)}&count=1&language=fi&format=json&countryCode=FI`,
          { cache: 'no-cache' }
        );
        const geoData = await geoRes.json();
        const match = Array.isArray(geoData.results) ? geoData.results[0] : null;
        const lat = match ? Number(match.latitude) : Number.NaN;
        const lon = match ? Number(match.longitude) : Number.NaN;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          throw new Error('Municipality coordinates not found');
        }

        if (!isActive) return;
        onLocationResolved?.({
          ...nextLocality,
          municipality: municipalityInfo?.name ?? nextLocality.municipality,
          displayName,
          lat,
          lon,
          countryCode: 'fi',
          isInFinland: true,
        });

        const currentWeather = await fetchCurrentWeather(lat, lon);
        if (!isActive) return;

        setWeather(currentWeather);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (isActive) {
          setError(t('weatherUnavailable'));
          setLoading(false);
        }
      }
    };

    if (locality?.municipality) {
      fetchWeatherForMunicipality(locality);
      return () => {
        isActive = false;
      };
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, true),
        () => fetchWeather(60.1695, 24.9354, false)
      );
    } else {
      fetchWeather(60.1695, 24.9354, false);
    }

    return () => {
      isActive = false;
    };
  }, [language, locality, onLocationResolved, t]);

  const isCompact = variant === 'compact';

  if (variant === 'aurora') {
    const state: WeatherState = getWeatherState(weather?.code, weather?.hour);
    const stateClass = `wcard-${state}` as const;
    const ariaLabel = loading
      ? t('weatherLoading')
      : error
        ? error
        : `${t('weather')}: ${weather?.temp}°C, ${weather?.condition}, ${weather?.feelsLike !== undefined ? `${t('weatherFeelsLike')} ${weather.feelsLike}°C, ` : ''}${locationName}`;

    return (
      <div
        className={`wcard-base ${stateClass}`}
        role="region"
        aria-label={ariaLabel}
        aria-live={loading ? 'polite' : undefined}
      >
        {state === 'sunny' && (
          <div className="wcard-sun-orb" aria-hidden="true" />
        )}

        {state === 'cloudy' && (
          <>
            <div className="wcard-cloud-blob" aria-hidden="true" style={{ width: 100, height: 50, background: 'rgba(180,210,240,.07)', top: 20, left: -20, animationDuration: '22s' }} />
            <div className="wcard-cloud-blob" aria-hidden="true" style={{ width: 140, height: 60, background: 'rgba(160,200,230,.05)', top: 40, left: -40, animationDuration: '30s', animationDelay: '-8s' }} />
            <div className="wcard-cloud-blob" aria-hidden="true" style={{ width: 80, height: 40, background: 'rgba(200,220,250,.06)', top: 10, right: 20, animationDuration: '18s', animationDelay: '-4s', animationDirection: 'reverse' }} />
          </>
        )}

        {state === 'rainy' && <RainLayer />}

        {state === 'night' && (
          <>
            <StarField />
            <div className="wcard-moon" aria-hidden="true" />
          </>
        )}

        <div className="wcard-main">
          <div className="wcard-temp-row">
            {loading ? (
              <span className="wcard-temp" style={{ opacity: .4 }} role="status" aria-live="polite">-</span>
            ) : error ? (
              <span className="wcard-temp" style={{ fontSize: '1.5rem', opacity: .6 }}>{error}</span>
            ) : (
              <>
                <span className="wcard-temp" aria-label={`${weather!.temp} ${t('degreeCelsius')}`}>
                  {weather!.temp}
                </span>
                <span className="wcard-unit" aria-hidden="true">°C</span>
              </>
            )}
          </div>

          {!loading && !error && weather && (
            <div className="wcard-side">
              <div className="wcard-location">
                <span className="wcard-dot" aria-hidden="true" />
                <span>{locationName}</span>
              </div>
              <div className={`wcard-cond ${isPrecipitation(weather.code) ? 'wcard-cond-wet' : 'wcard-cond-dry'}`}>
                <span aria-hidden="true">{weather.icon}</span>
                <span>{isPrecipitation(weather.code) ? t('weatherWet') : t('weatherDry')}</span>
              </div>
              <div className="wcard-meta">
              {weather.feelsLike !== undefined && (
                <div className="wcard-meta-item">
                  <span className="wcard-meta-label">{t('weatherFeelsLike')}</span>
                  <span className="wcard-meta-val">{weather.feelsLike} °C</span>
                </div>
              )}
              {weather.windspeed !== undefined && (
                <div className="wcard-meta-item">
                  <span className="wcard-meta-label">{t('weatherWind')}</span>
                  <span className="wcard-meta-val">{weather.windspeed} m/s</span>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'chip') {
    return (
      <div className="flex w-full items-center gap-4 text-white" aria-label={t('showWeather')}>
        <span className="flex-shrink-0 text-[2rem] leading-none md:text-[2.35rem]" aria-hidden="true">
          {loading ? '⏳' : weather?.icon || '🌤️'}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <strong className="block text-[1.05rem] font-black leading-tight text-white md:text-[1.2rem]">
            {loading ? t('weatherLoading') : error ? error : `${weather?.temp}°C · ${locationName}`}
          </strong>
          {!loading && !error && (
            <span className="mt-1 block text-[.9rem] font-bold leading-tight text-white/80 md:text-[1rem]">
              {weather?.condition}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-[#1a4d2e] ${isCompact ? 'rounded-[1.25rem] p-2 min-h-[82px] border-2 md:rounded-[2rem] md:p-6 md:min-h-[160px]' : 'rounded-[2.5rem] p-10 min-h-[220px] border-2'} text-white shadow-xl flex items-center justify-between w-full h-full border-white/20`}
      aria-label={t('showWeather')}
    >
      <div className="space-y-1">
        <p className={`${isCompact ? 'text-sm leading-tight md:text-xl' : 'text-2xl'} font-black opacity-90 tracking-tight`}>{locationName}</p>
        {loading ? (
          <p className="mt-1 rounded-xl bg-white/15 px-2 py-1.5 text-xs font-black text-white md:mt-2 md:px-3 md:py-2 md:text-base" role="status" aria-live="polite">
            {t('weatherLoading')}
          </p>
        ) : error ? (
          <p className="text-xl font-bold">{error}</p>
        ) : (
          <>
            <p className={`${isCompact ? 'text-xl md:text-4xl text-[#e8a020]' : 'text-6xl'} font-black my-0.5 tracking-tighter md:my-1`}>{weather?.temp}°C</p>
            <p className={`${isCompact ? 'text-xs md:text-lg' : 'text-xl'} font-bold opacity-80 uppercase leading-tight`}>{weather?.condition}</p>
          </>
        )}
      </div>

      {isLinkVisible('https://www.ilmatieteenlaitos.fi/') ? (
        <a
          href="https://www.ilmatieteenlaitos.fi/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${isCompact ? 'text-2xl min-w-[44px] min-h-[44px] md:text-5xl md:min-w-[76px] md:min-h-[76px]' : 'text-8xl min-w-[120px] min-h-[120px]'} drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer p-2 md:p-4 bg-white/10 rounded-full flex items-center justify-center focus:ring-4 focus:ring-white/50 focus:outline-none`}
          aria-label={t('weatherDetails')}
        >
          <span aria-hidden="true">{loading ? '⏳' : weather?.icon || '🌤️'}</span>
        </a>
      ) : (
        <div className={`${isCompact ? 'text-2xl min-w-[44px] min-h-[44px] md:text-5xl md:min-w-[76px] md:min-h-[76px]' : 'text-8xl min-w-[120px] min-h-[120px]'} drop-shadow-2xl p-2 md:p-4 bg-white/10 rounded-full flex items-center justify-center`}>
          <span aria-hidden="true">{loading ? '⏳' : weather?.icon || '🌤️'}</span>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
