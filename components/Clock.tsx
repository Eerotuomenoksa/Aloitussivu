import React, { useState, useEffect } from 'react';
import { getTodayEvents } from '../services/holidayService';
import { fetchNameDayToday } from '../services/nameDayService';
import { useI18n } from '../i18n';

const WORLD_CLOCK_URL = 'https://fi.thetimenow.com/worldclock.php';

interface ClockProps {
  fontSizeStep?: number;
  variant?: 'hero' | 'compact';
  secondaryClock?: {
    label: string;
    timeZone: string;
  };
}

const Clock: React.FC<ClockProps> = ({ fontSizeStep = 0, variant = 'hero', secondaryClock }) => {
  const { locale } = useI18n();
  const [time, setTime] = useState(new Date());
  const [nameDayNames, setNameDayNames] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchNameDayToday().then((result) => {
      if (!isActive || !result) return;
      setNameDayNames(result.names);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const timeString = time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const secondaryTimeString = secondaryClock
    ? time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: secondaryClock.timeZone })
    : '';
  const secondaryDateString = secondaryClock
    ? time.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: secondaryClock.timeZone })
    : '';
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
      <div className="text-left space-y-2">
        <p className="font-black text-4xl md:text-6xl leading-none tracking-tight text-[#d09a32] drop-shadow" aria-live="polite">
          {timeString}
        </p>
        <p className="capitalize text-sm md:text-lg font-bold text-white leading-snug">
          {dateString}
        </p>
        {secondaryClock && (
          <a
            href={WORLD_CLOCK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1 rounded-2xl bg-white/10 px-3 py-2 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/50"
            aria-label={`${secondaryClock.label} ${secondaryTimeString}. Avaa maailmankello`}
          >
            <span className="text-xs font-black uppercase tracking-wide text-white/75">{secondaryClock.label}</span>
            <span className="text-2xl font-black leading-none text-white">{secondaryTimeString}</span>
            <span className="text-xs font-bold text-white/75">{secondaryDateString}</span>
          </a>
        )}
        {nameDayNames.length > 0 && (
          <p className="text-sm md:text-base font-black text-white/90 leading-snug">
            Nimipäivä: {nameDayNames.join(', ')}
          </p>
        )}
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
      {secondaryClock && (
        <a
          href={WORLD_CLOCK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl bg-white/80 px-5 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
          aria-label={`${secondaryClock.label} ${secondaryTimeString}. Avaa maailmankello`}
        >
          <span className="text-sm md:text-lg font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">{secondaryClock.label}</span>
          <span className="text-3xl md:text-5xl font-black leading-none">{secondaryTimeString}</span>
          <span className="text-sm md:text-lg font-bold text-slate-500 dark:text-slate-300">{secondaryDateString}</span>
        </a>
      )}
      {nameDayNames.length > 0 && (
        <p className="text-slate-700 dark:text-slate-300 text-base md:text-2xl font-black">
          Nimipäivä: {nameDayNames.join(', ')}
        </p>
      )}
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
