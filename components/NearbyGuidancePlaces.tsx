import React, { useMemo } from 'react';
import { isLinkVisible, useLinkVisibilityVersion } from '../linkVisibility';
import { getNearbyGuidancePlaces } from '../services/guidancePlacesService';
import { LocalityInfo } from '../types';

interface NearbyGuidancePlacesProps {
  locality: LocalityInfo | null;
  fontSizeStep: number;
  className?: string;
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

const NearbyGuidancePlaces: React.FC<NearbyGuidancePlacesProps> = ({ locality, fontSizeStep, className = '' }) => {
  useLinkVisibilityVersion();
  const places = useMemo(() => {
    if (typeof locality?.lat !== 'number' || typeof locality?.lon !== 'number') return [];
    return getNearbyGuidancePlaces(locality.lat, locality.lon, 3);
  }, [locality?.lat, locality?.lon]);

  return (
    <section className={`space-y-3 ${className}`} aria-labelledby="nearby-guidance-heading">
      <div className="flex items-center justify-between gap-4">
        <h3 id="nearby-guidance-heading" className={`font-black uppercase tracking-widest text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
          Lähimmät digiopastuspaikat
        </h3>
        {isLinkVisible('https://seniorsurf.fi/seniorit/opastuspaikat/') && (
          <a
            href="https://seniorsurf.fi/seniorit/opastuspaikat/"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-black text-[var(--theme-primary)] hover:underline ${smallTextClasses[fontSizeStep]}`}
          >
            Avaa kartta
          </a>
        )}
      </div>

      {places.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {places.map((place) => {
            const primaryOrganizer = place.organizers.find((organizer) => organizer.url) ?? place.organizers[0];
            const href = primaryOrganizer?.url && isLinkVisible(primaryOrganizer.url)
              ? primaryOrganizer.url
              : 'https://seniorsurf.fi/seniorit/opastuspaikat/';
            const visibleHref = isLinkVisible(href) ? href : '';

            const content = (
              <>
                <span className={`font-black leading-tight text-[var(--theme-text)] ${textClasses[fontSizeStep]}`}>
                  {place.name}
                </span>
                <span className={`font-bold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
                  {place.address}, {place.postoffice}
                </span>
                <span className={`font-black text-[var(--theme-primary)] ${smallTextClasses[fontSizeStep]}`}>
                  {formatDistance(place.distanceKm)}
                </span>
              </>
            );

            return visibleHref ? (
              <a
                key={place.id}
                href={visibleHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[150px] flex-col justify-between gap-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--theme-pale)] hover:shadow-md active:scale-[.99]"
              >
                {content}
              </a>
            ) : (
              <div
                key={place.id}
                className="flex min-h-[150px] flex-col justify-between gap-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-sm"
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 text-center">
          <p className={`font-bold text-[var(--theme-muted)] ${smallTextClasses[fontSizeStep]}`}>
            Salli sijainnin käyttö, niin näet lähimmät SeniorSurf-opastuspaikat.
          </p>
        </div>
      )}
    </section>
  );
};

export default NearbyGuidancePlaces;
