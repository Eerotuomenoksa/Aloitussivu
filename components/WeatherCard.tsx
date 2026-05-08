
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

const WeatherCard: React.FC<WeatherCardProps> = ({ onLocationResolved, variant = 'default' }) => {
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
    const fetchWeather = async (lat: number, lon: number, shouldLocalizeLinks = true) => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
          { cache: 'no-cache' }
        );
        const weatherData = await weatherRes.json();
        
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&accept-language=fi&lat=${lat}&lon=${lon}&zoom=12`
        );
        const geoData = await geoRes.json();
        const address = geoData.address || {};
        const city = address.city || address.town || address.municipality || t('yourLocation');
        const municipality = resolveMunicipality(address, geoData.display_name || '');
        const municipalityInfo = findMunicipality(municipality);
        const localizedMunicipality = getLocalizedMunicipalityName(municipalityInfo, language) || city;
        const fallbackMunicipality = getLocalizedMunicipalityName(findMunicipality('Helsinki'), language) || 'Helsinki';

        setWeather({
          temp: Math.round(weatherData.current_weather.temperature),
          condition: getWeatherText(weatherData.current_weather.weathercode),
          icon: getWeatherIcon(weatherData.current_weather.weathercode)
        });
        setLocationName(shouldLocalizeLinks ? localizedMunicipality : fallbackMunicipality);
        if (shouldLocalizeLinks) {
          onLocationResolved?.({ municipality, displayName: city, lat, lon });
        }
        setError(null);
      } catch (err) {
        setError(t('weatherUnavailable'));
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, true),
        () => fetchWeather(60.1695, 24.9354, false)
      );
    } else {
      fetchWeather(60.1695, 24.9354, false);
    }
  }, [language, onLocationResolved, t]);

  const isCompact = variant === 'compact';

  return (
    <div 
      className={`bg-gradient-to-br from-brand-indigo to-brand-purple ${isCompact ? 'rounded-[2rem] p-6 min-h-[160px]' : 'rounded-[2.5rem] p-10 min-h-[220px]'} text-white shadow-xl flex items-center justify-between w-full h-full border-4 border-white/20`}
      aria-label={t('showWeather')}
    >
      <div className="space-y-1">
        <h3 className={`${isCompact ? 'text-xl' : 'text-2xl'} font-black opacity-90 tracking-tight`}>{locationName}</h3>
        {loading ? (
          <div className="animate-pulse h-12 w-24 bg-white/20 rounded-xl" aria-hidden="true"></div>
        ) : error ? (
          <p className="text-xl font-bold">{error}</p>
        ) : (
          <>
            <p className={`${isCompact ? 'text-4xl' : 'text-6xl'} font-black my-1 tracking-tighter`}>{weather?.temp}°C</p>
            <p className={`${isCompact ? 'text-lg' : 'text-xl'} font-bold opacity-80 uppercase`}>{weather?.condition}</p>
          </>
        )}
      </div>

      {isLinkVisible('https://www.ilmatieteenlaitos.fi/') ? (
        <a
          href="https://www.ilmatieteenlaitos.fi/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${isCompact ? 'text-5xl min-w-[76px] min-h-[76px]' : 'text-8xl min-w-[120px] min-h-[120px]'} drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer p-4 bg-white/10 rounded-full flex items-center justify-center focus:ring-4 focus:ring-white/50 focus:outline-none`}
          aria-label={t('weatherDetails')}
        >
          <span aria-hidden="true">{loading ? '⏳' : weather?.icon || '🌤️'}</span>
        </a>
      ) : (
        <div className={`${isCompact ? 'text-5xl min-w-[76px] min-h-[76px]' : 'text-8xl min-w-[120px] min-h-[120px]'} drop-shadow-2xl p-4 bg-white/10 rounded-full flex items-center justify-center`}>
          <span aria-hidden="true">{loading ? '⏳' : weather?.icon || '🌤️'}</span>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
