
import React, { useState, useEffect } from 'react';

const QUOTES = [
  "Jokainen päivä on uusi mahdollisuus.",
  "Pieni hymy kantaa pitkälle.",
  "Onni löytyy usein arjen pienistä hetkistä.",
  "Jokainen hetki on arvokas lahja.",
  "Mieli on kuin puutarha: mitä kylvät, sitä niität.",
  "Ystävällinen sana ei maksa mitään, mutta antaa paljon.",
  "Luonto on paras lääke mielenrauhaan.",
  "Tänään on hyvä päivä olla kiitollinen.",
  "Rohkeus on sitä, että tekee vaikka pelottaa.",
  "Elämä on tässä ja nyt.",
  "Ole oma itsesi, kaikki muut on jo varattu.",
  "Sydän on viisas opas matkalla.",
  "Pienet askeleet vievät suuriin kohteisiin.",
  "Ilo on sielun aurinkoa.",
  "Rauha alkaa sisältäpäin.",
  "Ystävyys on elämän suola.",
  "Kauneus on katsojan silmässä ja sydämessä.",
  "Anna jokaiselle päivälle mahdollisuus olla elämäsi kaunein.",
  "Viisaus on hiljaisuutta ja kuuntelua.",
  "Hyvyys on kieli, jota kuurot kuulevat ja sokeat näkevät.",
  "Eilinen on historiaa, huominen arvoitus, tämä päivä lahja.",
  "Nauru pidentää ikää ja lämmittää mieltä.",
  "Tee tänään jotain, mistä tulevaisuuden itsesi kiittää.",
  "Kiitollisuus muuttaa sen mitä meillä on, riittäväksi.",
  "Yksinkertaisuus on äärimmäistä hienostuneisuutta.",
  "Mitä enemmän annat, sitä enemmän saat.",
  "Toivo on ankkuri, joka pitää myrskyssä.",
  "Aika on kalleinta mitä meillä on.",
  "Kukki siellä, missä sinut on istutettu.",
  "Elämä on matka, ei määränpää.",
  "Suurin ilo on antaa iloa toisille."
];

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

  // Valitaan mietelause päivän mukaan (1-31)
  const quoteIndex = time.getDate() - 1;
  const dailyQuote = QUOTES[quoteIndex] || QUOTES[0];

  return (
    <div className="text-center md:text-left space-y-2">
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-black text-blue-600/80 tracking-wide uppercase italic">
          {greeting}
        </span>
        <h1 className="text-8xl font-black text-slate-800 tracking-tight leading-none">
          {timeString}
        </h1>
      </div>
      <div className="space-y-4">
        <p className="text-2xl text-slate-500 capitalize font-medium">
          {dateString}
        </p>
        <div className="pt-4 border-t-2 border-slate-100 max-w-sm">
          <p className="text-2xl font-serif italic text-slate-600 leading-relaxed">
            "{dailyQuote}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Clock;
