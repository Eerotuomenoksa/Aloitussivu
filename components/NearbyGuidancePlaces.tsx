import React, { useMemo } from 'react';
import { getNearbyGuidancePlaces } from '../services/guidancePlacesService';
import { LocalityInfo } from '../types';

interface NearbyGuidancePlacesProps {
  locality: LocalityInfo | null;
  fontSizeStep: number;
}

const textClasses = [
  'text-base md:text-lg',
  'text-lg md:text-xl',
  'text-xl md:text-2xl',
  'text-2xl md:text-3xl',
  'text-3xl md:text-4xl',
];

const smallTextClasses = [
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
];

const formatDistance = (value: number) => {
  if (value < 10) return `${value.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(value)} km`;
};

const NearbyGuidancePlaces: React.FC<NearbyGuidancePlacesProps> = ({ locality, fontSizeStep }) => {
  const places = useMemo(() => {
    if (typeof locality?.lat !== 'number' || typeof locality?.lon !== 'number') return [];
    return getNearbyGuidancePlaces(locality.lat, locality.lon, 3);
  }, [locality?.lat, locality?.lon]);

  return (
    <section className="space-y-3 md:hidden" aria-labelledby="nearby-guidance-heading">
      <div className="flex items-center justify-between gap-4">
        <h3 id="nearby-guidance-heading" className={`font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ${smallTextClasses[fontSizeStep]}`}>
          Lähimmät digiopastuspaikat
        </h3>
        <a
          href="https://seniorsurf.fi/seniorit/opastuspaikat/"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-black text-brand-indigo dark:text-blue-300 hover:underline ${smallTextClasses[fontSizeStep]}`}
        >
          Avaa kartta
        </a>
      </div>

      {places.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {places.map((place) => {
            const primaryOrganizer = place.organizers.find((organizer) => organizer.url) ?? place.organizers[0];
            const href = primaryOrganizer?.url || 'https://seniorsurf.fi/seniorit/opastuspaikat/';

            return (
              <a
                key={place.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 p-5 shadow-md hover:shadow-xl transition-all active:scale-95 min-h-[150px] flex flex-col justify-between gap-4"
              >
                <span className={`font-black text-slate-900 dark:text-white leading-tight ${textClasses[fontSizeStep]}`}>
                  {place.name}
                </span>
                <span className={`font-bold text-slate-600 dark:text-slate-300 ${smallTextClasses[fontSizeStep]}`}>
                  {place.address}, {place.postoffice}
                </span>
                <span className={`font-black text-brand-indigo dark:text-blue-300 ${smallTextClasses[fontSizeStep]}`}>
                  {formatDistance(place.distanceKm)}
                </span>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
          <p className={`text-slate-500 dark:text-slate-400 font-bold ${smallTextClasses[fontSizeStep]}`}>
            Salli sijainnin käyttö, niin näet lähimmät SeniorSurf-opastuspaikat.
          </p>
        </div>
      )}
    </section>
  );
};

export default NearbyGuidancePlaces;
