import { Coordinates, UserLocationState } from '../types/tourist';
import { VARANASI_CENTER, VARANASI_HUBS } from '../data/varanasiPlaces';

/**
 * Bounds of Varanasi tourist and city zone
 */
export const VARANASI_BOUNDS = {
  minLat: 25.20,
  maxLat: 25.42,
  minLng: 82.90,
  maxLng: 83.15,
};

export function isLocationInVaranasi(coords: Coordinates): boolean {
  return (
    coords.lat >= VARANASI_BOUNDS.minLat &&
    coords.lat <= VARANASI_BOUNDS.maxLat &&
    coords.lng >= VARANASI_BOUNDS.minLng &&
    coords.lng <= VARANASI_BOUNDS.maxLng
  );
}

export async function requestUserLocation(): Promise<UserLocationState> {
  if (!navigator.geolocation) {
    return {
      coordinates: VARANASI_HUBS[0].coordinates, // Fallback Godowlia Chowk
      isCustomSelected: true,
      isInsideVaranasi: true,
      permissionGranted: false,
      loading: false,
      error: 'Geolocation is not supported by your browser. Using Godowlia Chowk as start point.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const inVaranasi = isLocationInVaranasi(coords);

        resolve({
          coordinates: inVaranasi ? coords : VARANASI_HUBS[0].coordinates,
          accuracy: position.coords.accuracy,
          isCustomSelected: !inVaranasi,
          isInsideVaranasi: inVaranasi,
          permissionGranted: true,
          loading: false,
          error: inVaranasi
            ? null
            : 'You are currently outside Varanasi. We have set your starting point to Godowlia Chowk (Main Ghats) so you can explore and plan your tour.',
        });
      },
      (err) => {
        let msg = 'Location access denied or unavailable.';
        if (err.code === 1) msg = 'Location permission was denied by user.';
        if (err.code === 2) msg = 'Position unavailable.';
        if (err.code === 3) msg = 'Location request timed out.';

        resolve({
          coordinates: VARANASI_HUBS[0].coordinates,
          isCustomSelected: true,
          isInsideVaranasi: true,
          permissionGranted: false,
          loading: false,
          error: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  });
}
