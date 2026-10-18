import { Coordinates, NavigationStep, RouteData, TravelMode, TouristPlace } from '../types/tourist';

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate travel time in minutes based on mode
 */
export function estimateTravelTimeMinutes(distanceKm: number, mode: TravelMode): number {
  if (mode === 'walking') {
    // Average walking speed in crowded Varanasi ghats/alleys: ~3.5 km/h
    return Math.max(1, Math.round((distanceKm / 3.5) * 60));
  } else {
    // Average driving / auto-rickshaw speed in Varanasi city traffic: ~18 km/h
    return Math.max(2, Math.round((distanceKm / 18) * 60));
  }
}

/**
 * Maps OSRM modifier / maneuver into user-friendly bilingual instructions
 */
function formatStepInstruction(
  type: string,
  modifier: string | undefined,
  name: string | undefined,
  destinationName: string
): { en: string; hi: string } {
  const street = name && name.trim() !== '' ? `onto ${name}` : '';
  const streetHi = name && name.trim() !== '' ? ` (${name} की ओर)` : '';

  if (type === 'arrive') {
    return {
      en: `You have arrived at ${destinationName}`,
      hi: `आप ${destinationName} पहुंच गए हैं`,
    };
  }

  if (type === 'depart') {
    return {
      en: `Head out towards ${destinationName} ${street}`,
      hi: `${destinationName} की ओर आगे बढ़ें${streetHi}`,
    };
  }

  switch (modifier) {
    case 'left':
      return {
        en: `Turn left ${street}`,
        hi: `बाएं मुड़ें${streetHi}`,
      };
    case 'right':
      return {
        en: `Turn right ${street}`,
        hi: `दाएं मुड़ें${streetHi}`,
      };
    case 'slight left':
      return {
        en: `Slight left ${street}`,
        hi: `हल्का बाएं चलें${streetHi}`,
      };
    case 'slight right':
      return {
        en: `Slight right ${street}`,
        hi: `हल्का दाएं चलें${streetHi}`,
      };
    case 'sharp left':
      return {
        en: `Sharp left ${street}`,
        hi: `तीखा बाएं मुड़ें${streetHi}`,
      };
    case 'sharp right':
      return {
        en: `Sharp right ${street}`,
        hi: `तीखा दाएं मुड़ें${streetHi}`,
      };
    case 'u-turn':
      return {
        en: `Make a U-turn ${street}`,
        hi: `यू-टर्न (वापस) मुड़ें${streetHi}`,
      };
    case 'straight':
    default:
      return {
        en: `Continue straight ${street}`,
        hi: `सीधे आगे बढ़ें${streetHi}`,
      };
  }
}

function parseManeuver(modifier?: string): NavigationStep['maneuver'] {
  if (modifier?.includes('left')) return modifier.includes('slight') ? 'slight-left' : 'turn-left';
  if (modifier?.includes('right')) return modifier.includes('slight') ? 'slight-right' : 'turn-right';
  return 'continue';
}

/**
 * Fallback geometry generator in case OSRM service is rate limited
 */
function generateFallbackRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: TravelMode,
  originName: string,
  destName: string
): RouteData {
  const distKm = calculateHaversineDistanceKm(origin, destination);
  const roadFactor = mode === 'walking' ? 1.25 : 1.4;
  const actualDistMeters = Math.round(distKm * 1000 * roadFactor);
  const durationSec = estimateTravelTimeMinutes(distKm * roadFactor, mode) * 60;

  // Midpoint with small realistic deviation
  const midLat = (origin.lat + destination.lat) / 2 + (destination.lng - origin.lng) * 0.15;
  const midLng = (origin.lng + destination.lng) / 2 - (destination.lat - origin.lat) * 0.15;

  const geometry: Coordinates[] = [
    origin,
    { lat: (origin.lat * 2 + midLat) / 3, lng: (origin.lng * 2 + midLng) / 3 },
    { lat: midLat, lng: midLng },
    { lat: (midLat + destination.lat * 2) / 3, lng: (midLng + destination.lng * 2) / 3 },
    destination,
  ];

  const steps: NavigationStep[] = [
    {
      instruction: {
        en: `Start from ${originName} towards ${destName}`,
        hi: `${originName} से ${destName} की ओर प्रस्थान करें`,
      },
      distanceMeters: Math.round(actualDistMeters * 0.3),
      durationSeconds: Math.round(durationSec * 0.3),
      maneuver: 'depart',
      coordinates: origin,
    },
    {
      instruction: {
        en: mode === 'walking'
          ? `Follow the heritage lane / ghat pathway towards ${destName}`
          : `Continue along the main road towards ${destName}`,
        hi: mode === 'walking'
          ? `विरासत गली या घाट मार्ग से ${destName} की ओर आगे बढ़ें`
          : `मुख्य मार्ग से ${destName} की दिशा में सीधे चलें`,
      },
      distanceMeters: Math.round(actualDistMeters * 0.5),
      durationSeconds: Math.round(durationSec * 0.5),
      maneuver: 'continue',
      coordinates: { lat: midLat, lng: midLng },
    },
    {
      instruction: {
        en: `Arrive at ${destName}`,
        hi: `${destName} पहुंचें`,
      },
      distanceMeters: Math.round(actualDistMeters * 0.2),
      durationSeconds: Math.round(durationSec * 0.2),
      maneuver: 'arrive',
      coordinates: destination,
    },
  ];

  return {
    distanceMeters: actualDistMeters,
    durationSeconds: durationSec,
    mode,
    geometry,
    steps,
    originName,
    destinationName: destName,
  };
}

/**
 * Fetch real route from OSRM (Walking or Driving)
 */
export async function fetchRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: TravelMode = 'walking',
  originName: string = 'Current Location',
  destinationName: string = 'Destination'
): Promise<RouteData> {
  const profile = mode === 'walking' ? 'foot' : 'driving';
  // Standard OSRM public API endpoints
  const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OSRM responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    const geoCoords: Coordinates[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );

    const steps: NavigationStep[] = [];
    if (route.legs && route.legs[0] && route.legs[0].steps) {
      for (const step of route.legs[0].steps) {
        const manType = step.maneuver?.type || 'continue';
        const modifier = step.maneuver?.modifier;
        const name = step.name;
        const manLocation = step.maneuver?.location;
        const stepCoords: Coordinates = manLocation
          ? { lat: manLocation[1], lng: manLocation[0] }
          : origin;

        steps.push({
          instruction: formatStepInstruction(manType, modifier, name, destinationName),
          distanceMeters: Math.round(step.distance || 0),
          durationSeconds: Math.round(step.duration || 0),
          maneuver: manType === 'arrive' ? 'arrive' : manType === 'depart' ? 'depart' : parseManeuver(modifier),
          coordinates: stepCoords,
        });
      }
    }

    if (steps.length === 0) {
      steps.push({
        instruction: {
          en: `Head directly towards ${destinationName}`,
          hi: `${destinationName} की ओर आगे बढ़ें`,
        },
        distanceMeters: Math.round(route.distance),
        durationSeconds: Math.round(route.duration),
        maneuver: 'depart',
        coordinates: origin,
      });
      steps.push({
        instruction: {
          en: `Arrive at ${destinationName}`,
          hi: `${destinationName} पहुंचें`,
        },
        distanceMeters: 0,
        durationSeconds: 0,
        maneuver: 'arrive',
        coordinates: destination,
      });
    }

    return {
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      mode,
      geometry: geoCoords,
      steps,
      originName,
      destinationName,
    };
  } catch (err) {
    console.warn('OSRM route fetch failed, falling back to local Varanasi navigation generator:', err);
    return generateFallbackRoute(origin, destination, mode, originName, destinationName);
  }
}

/**
 * Solves Traveling Salesperson Problem (TSP) using Nearest-Neighbor heuristic
 * to recommend an optimal tour order with minimal backtracking
 */
export function optimizeTourOrder(
  startPoint: Coordinates,
  places: TouristPlace[]
): TouristPlace[] {
  if (places.length <= 1) return [...places];

  const remaining = [...places];
  const optimized: TouristPlace[] = [];
  let currentPos = startPoint;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateHaversineDistanceKm(currentPos, remaining[i].coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextPlace = remaining.splice(nearestIndex, 1)[0];
    optimized.push(nextPlace);
    currentPos = nextPlace.coordinates;
  }

  return optimized;
}

/**
 * Formats distance into readable km or meters
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Formats duration into readable min or hours
 */
export function formatDuration(seconds: number, lang: 'en' | 'hi' = 'en'): string {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (lang === 'hi') {
      return remainingMins > 0 ? `${hours} घंटे ${remainingMins} मि` : `${hours} घंटे`;
    }
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }
  return lang === 'hi' ? `${Math.max(1, minutes)} मिनट` : `${Math.max(1, minutes)} min`;
}

/**
 * Generate Google Maps navigation URL
 */
export function getGoogleMapsNavigationUrl(
  origin: Coordinates,
  destination: Coordinates,
  mode: TravelMode
): string {
  const travelMode = mode === 'walking' ? 'walking' : 'driving';
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${travelMode}`;
}
