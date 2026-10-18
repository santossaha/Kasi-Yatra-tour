import React from 'react';
import { TouristPlace, Language, Coordinates } from '../types/tourist';
import { calculateHaversineDistanceKm, formatDistance } from '../services/routingService';
import { Footprints, Navigation2 } from 'lucide-react';

interface NearbyPlacesCarouselProps {
  places: TouristPlace[];
  selectedPlace: TouristPlace | null;
  onSelectPlace: (place: TouristPlace) => void;
  userLocation: Coordinates;
  lang: Language;
}

export const NearbyPlacesCarousel: React.FC<NearbyPlacesCarouselProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  userLocation,
  lang,
}) => {
  // Sort places by proximity to current location
  const sortedPlaces = [...places].sort((a, b) => {
    const distA = calculateHaversineDistanceKm(userLocation, a.coordinates);
    const distB = calculateHaversineDistanceKm(userLocation, b.coordinates);
    return distA - distB;
  });

  return (
    <div className="w-full flex items-center gap-2.5 overflow-x-auto py-1 px-1 no-scrollbar">
      {sortedPlaces.slice(0, 10).map((place) => {
        const isSelected = selectedPlace?.id === place.id;
        const distKm = calculateHaversineDistanceKm(userLocation, place.coordinates);

        return (
          <div
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className={`shrink-0 w-44 rounded-xl p-2 cursor-pointer transition-all duration-200 border ${
              isSelected
                ? 'bg-amber-50/95 border-amber-600 shadow-md ring-2 ring-amber-500/30'
                : 'bg-white/95 backdrop-blur-md border-stone-200 shadow-sm hover:border-amber-400'
            }`}
          >
            <div className="relative h-20 w-full rounded-lg overflow-hidden mb-1.5 bg-stone-100">
              <img
                src={place.image}
                alt={place.name.en}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-stone-900/90 text-amber-300 font-bold text-[10px] flex items-center justify-center border border-amber-400">
                {place.number}
              </div>
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-stone-900/80 text-[10px] text-white font-medium flex items-center gap-0.5">
                <Footprints className="w-2.5 h-2.5 text-orange-400" />
                {formatDistance(distKm * 1000)}
              </div>
            </div>

            <div className="font-bold text-xs text-stone-900 truncate leading-tight">
              {place.name[lang]}
            </div>
            <div className="text-[10px] text-amber-800 font-medium truncate">
              {place.subtitle[lang]}
            </div>
          </div>
        );
      })}
    </div>
  );
};
