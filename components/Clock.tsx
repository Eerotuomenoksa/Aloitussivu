
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  let greeting = "Hyvää huomenta!";
  if (hour >= 10 && hour < 18) greeting = "Hyvää päivää!";
  else if (hour >= 18 && hour < 22) greeting = "Hyvää iltaa!";
  else if (hour >= 22 || hour < 5) greeting = "Hyvää yötä!";

  const timeString = time.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('fi-FI', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="text-center lg:text-left space-y-4">
      <div className="flex flex-col">
        <span className="text-3xl md:text-5xl font-black text-blue-700 dark:text-blue-400 tracking-wide uppercase italic mb-2">
          {greeting}
        </span>
        <h1 className="text-8xl sm:text-9xl lg:text-[10rem] font-black text-slate-950 dark:text-white tracking-tighter leading-none">
          {timeString}
        </h1>
      </div>
      <p className="text-3xl md:text-5xl text-slate-800 dark:text-slate-200 capitalize font-bold tracking-tight">
        {dateString}
      </p>
    </div>
  );
};

export default Clock;
