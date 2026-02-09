
import React, { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

const WeatherCard: React.FC = () => {
  const [locationName, setLocationName] = useState<string>('Helsinki');
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
    if (code === 0) return 'Selkeää';
    if (code >= 1 && code <= 3) return 'Puolipilvistä';
    if (code >= 45 && code <= 48) return 'Sumua';
    if (code >= 51 && code <= 67) return 'Sadetta';
    if (code >= 71 && code <= 77) return 'Lumisadetta';
    if (code >= 80 && code <= 82) return 'Kuuroja';
    if (code >= 95) return 'Ukkosta';
    return 'Vaihtelevaa';
  };

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
          { cache: 'no-cache' }
        );
        const weatherData = await weatherRes.json();
        
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
        );
        const geoData = await geoRes.json();
        const city = geoData.address.city || geoData.address.town || geoData.address.municipality || 'Sijaintisi';

        setWeather({
          temp: Math.round(weatherData.current_weather.temperature),
          condition: getWeatherText(weatherData.current_weather.weathercode),
          icon: getWeatherIcon(weatherData.current_weather.weathercode)
        });
        setLocationName(city);
        setError(null);
      } catch (err) {
        setError("Sää ei saatavilla");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(60.1695, 24.9354)
      );
    } else {
      fetchWeather(60.1695, 24.9354);
    }
  }, []);

  return (
    <div 
      className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-[2.5rem] p-10 text-white shadow-xl flex items-center justify-between w-full h-full border-4 border-white/20 min-h-[220px]"
      aria-label="Säätiedot"
    >
      <div className="space-y-1">
        <h3 className="text-2xl font-black opacity-90 tracking-tight">{locationName}</h3>
        {loading ? (
          <div className="animate-pulse h-12 w-24 bg-white/20 rounded-xl" aria-hidden="true"></div>
        ) : error ? (
          <p className="text-xl font-bold">{error}</p>
        ) : (
          <>
            <p className="text-6xl font-black my-1 tracking-tighter">{weather?.temp}°C</p>
            <p className="text-xl font-bold opacity-80 uppercase">{weather?.condition}</p>
          </>
        )}
      </div>

      <a 
        href="https://www.ilmatieteenlaitos.fi/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-8xl drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer p-4 bg-white/10 rounded-full flex items-center justify-center min-w-[120px] min-h-[120px] focus:ring-4 focus:ring-white/50 focus:outline-none"
        aria-label="Katso tarkempi sää Ilmatieteen laitokselta"
      >
        <span aria-hidden="true">{loading ? '⏳' : weather?.icon || '🌤️'}</span>
      </a>
    </div>
  );
};

export default WeatherCard;
