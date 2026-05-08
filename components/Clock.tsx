import React, { useState, useEffect } from 'react';
import { getTodayEvents } from '../services/holidayService';
import { useI18n } from '../i18n';

interface ClockProps {
  fontSizeStep?: number;
  variant?: 'hero' | 'compact';
}

const Clock: React.FC<ClockProps> = ({ fontSizeStep = 0, variant = 'hero' }) => {
  const { locale } = useI18n();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const todayEvents = getTodayEvents(time);
  const dateString = time.toLocaleDateString(locale, { 
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

  if (variant === 'compact') {
    return (
      <div className="text-left xl:text-right space-y-2">
        <p className="font-black text-5xl md:text-6xl leading-none tracking-tight text-brand-indigo dark:text-blue-200" aria-live="polite">
          {timeString}
        </p>
        <p className="capitalize text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">
          {dateString}
        </p>
        {todayEvents.length > 0 && (
          <div className="flex flex-wrap xl:justify-end gap-2 pt-1">
            {todayEvents.map((event) => (
              <p
                key={`${event.date}-${event.name}`}
                className="inline-flex rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100 px-3 py-1 text-sm font-black"
              >
                {event.name}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

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
      {todayEvents.length > 0 && (
        <div className="space-y-2 pt-2">
          {todayEvents.map((event) => (
            <p
              key={`${event.date}-${event.name}`}
              className="inline-flex mr-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100 px-4 py-2 text-base md:text-xl font-black"
            >
              {event.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clock;
