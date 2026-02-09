
import React, { useState, useEffect } from 'react';

const WeatherCard: React.FC = () => {
  const [location, setLocation] = useState<string>('Helsinki');
  const [temp, setTemp] = useState<number>(4);

  // In a real app, we would use navigator.geolocation and a real API.
  // For this demo, we'll keep it static or simulated.

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between w-full h-full min-h-[160px]">
      <div>
        <h3 className="text-2xl font-medium opacity-90">{location}</h3>
        <p className="text-6xl font-bold my-1">{temp}°C</p>
        <p className="text-xl">Puolipilvistä</p>
      </div>
      <div className="text-7xl">
        🌤️
      </div>
    </div>
  );
};

export default WeatherCard;
