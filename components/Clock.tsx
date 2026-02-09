
import React, { useState, useEffect } from 'react';

interface ClockProps {
  fontSizeStep?: number;
}

const Clock: React.FC<ClockProps> = ({ fontSizeStep = 0 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('fi-FI', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const timeSizes = [
    'text-8xl sm:text-9xl lg:text-[10rem]',
    'text-9xl sm:text-[10rem] lg:text-[12rem]',
    'text-[10rem] sm:text-[12rem] lg:text-[14rem]',
    'text-[12rem] sm:text-[14rem] lg:text-[16rem]',
    'text-[14rem] sm:text-[16rem] lg:text-[18rem]'
  ];

  const dateSizes = [
    'text-3xl md:text-5xl',
    'text-4xl md:text-6xl',
    'text-5xl md:text-7xl',
    'text-6xl md:text-8xl',
    'text-7xl md:text-9xl'
  ];

  return (
    <div className="text-center lg:text-left space-y-2">
      <div className="flex flex-col">
        <h1 className={`font-black text-slate-950 dark:text-white tracking-tighter leading-none transition-all duration-300 ${timeSizes[fontSizeStep]}`}>
          {timeString}
        </h1>
      </div>
      <p className={`text-slate-800 dark:text-slate-200 capitalize font-bold tracking-tight transition-all duration-300 ${dateSizes[fontSizeStep]}`}>
        {dateString}
      </p>
    </div>
  );
};

export default Clock;
