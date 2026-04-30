import { SENIORSURF_GUIDANCE_PLACES } from '../seniorSurfGuidancePlaces';
import { NearbyGuidancePlace } from '../types';

const toRadians = (value: number) => value * Math.PI / 180;

const getDistanceKm = (fromLat: number, fromLon: number, toLat: number, toLon: number) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLon = toRadians(toLon - fromLon);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getNearbyGuidancePlaces = (lat: number, lon: number, limit = 3): NearbyGuidancePlace[] => {
  return SENIORSURF_GUIDANCE_PLACES
    .map((place) => ({
      ...place,
      distanceKm: getDistanceKm(lat, lon, place.lat, place.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
};
