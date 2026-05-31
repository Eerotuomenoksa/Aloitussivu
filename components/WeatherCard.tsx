
import React, { useState, useEffect } from 'react';
import { isLinkVisible, useLinkVisibilityVersion } from '../linkVisibility';
import { findMunicipality, getLocalizedMunicipalityName, normalizeMunicipality } from '../localServices';
import { LocalityInfo } from '../types';
import { useI18n } from '../i18n';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

interface WeatherCardProps {
  locality?: LocalityInfo | null;
  onLocationResolved?: (location: LocalityInfo) => void;
  variant?: 'default' | 'compact';
}

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

  const resolveMunicipality = (address: Record<string, string | undefined>, displayName: string) => {
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

    if (districtCandidates.some((district) => vantaaDistricts.has(normalizeMunicipality(district)))) {
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
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        { cache: 'no-cache' }
      );
      if (!weatherRes.ok) {
        throw new Error(`Weather request failed: ${weatherRes.status}`);
      }
      const weatherData = await weatherRes.json();
      if (!weatherData.current_weather) {
        throw new Error('Weather response missing current weather');
      }

      return {
        temp: Math.round(weatherData.current_weather.temperature),
        condition: getWeatherText(weatherData.current_weather.weathercode),
        icon: getWeatherIcon(weatherData.current_weather.weathercode),
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
        const municipality = resolveMunicipality(address, geoData.display_name || '');
        const municipalityInfo = findMunicipality(municipality);
        const isInFinland = countryCode ? countryCode === 'fi' : !!municipalityInfo;
        const localizedMunicipality = getLocalizedMunicipalityName(municipalityInfo, language) || city;
        const fallbackMunicipality = getLocalizedMunicipalityName(findMunicipality('Helsinki'), language) || 'Helsinki';

        if (!isActive) return;

        setWeather({
          temp: currentWeather.temp,
          condition: currentWeather.condition,
          icon: currentWeather.icon,
        });
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

  return (
    <div 
      className={`bg-gradient-to-br ${isCompact ? 'from-[#214f76] to-[#173e5f] rounded-[1.25rem] p-2 min-h-[82px] border-2 md:rounded-[2rem] md:p-6 md:min-h-[160px] md:border-4' : 'from-[#214f76] to-[#173e5f] rounded-[2.5rem] p-10 min-h-[220px] border-4'} text-white shadow-xl flex items-center justify-between w-full h-full border-white/20`}
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
            <p className={`${isCompact ? 'text-xl md:text-4xl text-[#d09a32]' : 'text-6xl'} font-black my-0.5 tracking-tighter md:my-1`}>{weather?.temp}°C</p>
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
