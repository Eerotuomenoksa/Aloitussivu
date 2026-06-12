import React, { useState, useEffect } from 'react';
import { getTodayEvents } from '../services/holidayService';
import { fetchNameDayToday } from '../services/nameDayService';
import { useI18n } from '../i18n';

const WORLD_CLOCK_URL = 'https://fi.thetimenow.com/worldclock.php';

interface ClockProps {
  fontSizeStep?: number;
  variant?: 'hero' | 'compact' | 'aurora';
  mode?: 'digital' | 'analog';
  secondaryClock?: {
    label: string;
    timeZone: string;
  };
}

const Clock: React.FC<ClockProps> = ({ fontSizeStep = 0, variant = 'hero', mode = 'digital', secondaryClock }) => {
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
  const nameDayLabel = nameDayNames.length > 0 ? `Nimipäivä: ${nameDayNames.join(', ')}` : '';
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  if (variant === 'aurora') {
    if (mode === 'analog') {
      return (
        <div className="text-left">
          <div className="aurora-analog-clock" aria-label={`${timeString}, ${dateString}`} role="img">
            <div className="aurora-analog-face" aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => {
                const hour = index + 1;
                const angle = hour * 30;
                return (
                  <span
                    key={hour}
                    className="aurora-analog-hour"
                    style={{ transform: `rotate(${angle}deg) translateY(calc(-1 * var(--analog-number-radius))) rotate(-${angle}deg)` }}
                  >
                    {hour}
                  </span>
                );
              })}
              {Array.from({ length: 60 }, (_, index) => (
                <span
                  key={index}
                  className={index % 5 === 0 ? 'aurora-analog-tick aurora-analog-tick-hour' : 'aurora-analog-tick'}
                  style={{ transform: `rotate(${index * 6}deg) translateY(calc(-1 * var(--analog-tick-radius)))` }}
                />
              ))}
              <span className="aurora-analog-hand aurora-analog-hour-hand" style={{ transform: `rotate(${hourAngle}deg)` }} />
              <span className="aurora-analog-hand aurora-analog-minute-hand" style={{ transform: `rotate(${minuteAngle}deg)` }} />
              <span className="aurora-analog-hand aurora-analog-second-hand" style={{ transform: `rotate(${secondAngle}deg)` }} />
              <span className="aurora-analog-pin" />
            </div>
          </div>
          <div className="mt-6">
            <p className="font-body text-[clamp(1.15rem,1.6vw,1.35rem)] font-bold capitalize leading-snug text-[#cfe7d6]">
              {dateString}
            </p>
            {nameDayLabel && (
              <p className="mt-1 font-body text-[clamp(.95rem,1.2vw,1.05rem)] font-bold text-white/75">
                {nameDayLabel}
              </p>
            )}
          </div>
          {secondaryClock && (
            <a
              href={WORLD_CLOCK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur transition-colors hover:bg-white/20"
              aria-label={`${secondaryClock.label} ${secondaryTimeString}. Avaa maailmankello`}
            >
              <span className="text-xs font-black uppercase tracking-wide text-white/80">{secondaryClock.label}</span>
              <span className="font-display text-2xl font-semibold leading-none text-white">{secondaryTimeString}</span>
              <span className="text-xs font-bold text-white/75">{secondaryDateString}</span>
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="text-left">
        <time
          dateTime={time.toISOString()}
          aria-live="polite"
          className="block font-body font-bold text-white"
          style={{
            fontSize: 'clamp(3.6rem, 6.5vw, 5rem)',
            letterSpacing: '.01em',
            lineHeight: '1',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 2px 60px rgba(61,184,112,.2)',
          }}
        >
          {timeString}
        </time>
        <div className="mt-3">
          <p className="font-body text-[clamp(1.15rem,1.6vw,1.35rem)] font-bold capitalize leading-snug text-[#cfe7d6]">
            {dateString}
          </p>
          {nameDayLabel && (
            <p className="mt-1 font-body text-[clamp(.95rem,1.2vw,1.05rem)] font-bold text-white/75">
              {nameDayLabel}
            </p>
          )}
        </div>
        {secondaryClock && (
          <a
            href={WORLD_CLOCK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur transition-colors hover:bg-white/20"
            aria-label={`${secondaryClock.label} ${secondaryTimeString}. Avaa maailmankello`}
          >
            <span className="text-xs font-black uppercase tracking-wide text-white/80">{secondaryClock.label}</span>
            <span className="font-display text-2xl font-semibold leading-none text-white">{secondaryTimeString}</span>
            <span className="text-xs font-bold text-white/75">{secondaryDateString}</span>
          </a>
        )}
      </div>
    );
  }

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
        <p className="font-display text-4xl md:text-6xl leading-none tracking-tight text-white drop-shadow" aria-live="polite">
          {timeString}
        </p>
        <p className="capitalize text-sm md:text-lg font-bold text-white/70 leading-snug">
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
            <span className="font-display text-2xl font-bold leading-none text-white">{secondaryTimeString}</span>
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
        <h1 className={`font-display font-bold text-[#1a2e1e] dark:text-[#e8f5ed] tracking-tighter leading-none transition-all duration-300 ${timeSizes[fontSizeStep]}`}>
          {timeString}
        </h1>
      </div>
      <p className={`text-[#3d5a44] dark:text-[#9ec4a8] capitalize font-bold tracking-tight transition-all duration-300 ${dateSizes[fontSizeStep]}`}>
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
