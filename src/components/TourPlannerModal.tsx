import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Navigation2,
  Footprints,
  Car,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { TouristPlace, Language, Coordinates, TravelMode } from '../types/tourist';
import { calculateHaversineDistanceKm, estimateTravelTimeMinutes, formatDistance, formatDuration, optimizeTourOrder } from '../services/routingService';

interface TourPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePlaces: TouristPlace[];
  itineraryPlaces: TouristPlace[];
  onUpdateItinerary: (places: TouristPlace[]) => void;
  lang: Language;
  userLocation: Coordinates;
  travelMode: TravelMode;
  onSetTravelMode: (mode: TravelMode) => void;
  onStartItineraryNavigation: (places: TouristPlace[]) => void;
}

export const TourPlannerModal: React.FC<TourPlannerModalProps> = ({
  isOpen,
  onClose,
  availablePlaces,
  itineraryPlaces,
  onUpdateItinerary,
  lang,
  userLocation,
  travelMode,
  onSetTravelMode,
  onStartItineraryNavigation,
}) => {
  if (!isOpen) return null;

  // Calculate cumulative stats
  let totalDistanceMeters = 0;
  let prevCoord = userLocation;

  itineraryPlaces.forEach((place) => {
    const distKm = calculateHaversineDistanceKm(prevCoord, place.coordinates);
    const roadFactor = travelMode === 'walking' ? 1.25 : 1.4;
    totalDistanceMeters += distKm * 1000 * roadFactor;
    prevCoord = place.coordinates;
  });

  const totalTimeSeconds = estimateTravelTimeMinutes(totalDistanceMeters / 1000, travelMode) * 60;

  const handleOptimize = () => {
    const optimized = optimizeTourOrder(userLocation, itineraryPlaces);
    onUpdateItinerary(optimized);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...itineraryPlaces];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onUpdateItinerary(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= itineraryPlaces.length - 1) return;
    const next = [...itineraryPlaces];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onUpdateItinerary(next);
  };

  const handleRemove = (placeId: string) => {
    onUpdateItinerary(itineraryPlaces.filter((p) => p.id !== placeId));
  };

  const handleAdd = (place: TouristPlace) => {
    if (!itineraryPlaces.some((p) => p.id === place.id)) {
      onUpdateItinerary([...itineraryPlaces, place]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {lang === 'hi' ? 'स्मार्ट यात्रा योजना (टूर प्लानर)' : 'Smart Tour Itinerary Planner'}
              </h2>
              <p className="text-xs text-stone-300">
                {lang === 'hi' ? 'कम से कम दूरी में अधिक से अधिक दर्शन' : 'Optimized multi-stop Varanasi route'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Travel Mode & Optimization Action */}
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2">
          {/* Mode Switch */}
          <div className="flex items-center bg-stone-200 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => onSetTravelMode('walking')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                travelMode === 'walking'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पैदल' : 'Walking'}</span>
            </button>
            <button
              onClick={() => onSetTravelMode('driving')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                travelMode === 'driving'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'वाहन' : 'Driving'}</span>
            </button>
          </div>

          {/* Auto-optimize Route Button */}
          {itineraryPlaces.length > 1 && (
            <button
              onClick={handleOptimize}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
              title="Automatically calculate the best order with minimal backtracking"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'मार्ग सुव्यवस्थित करें' : 'Optimize Order'}
            </button>
          )}
        </div>

        {/* Stats Strip */}
        <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/50 flex items-center justify-between text-xs text-amber-950 font-medium">
          <div className="flex items-center gap-2">
            <span>{itineraryPlaces.length} {lang === 'hi' ? 'स्थान चयनित' : 'stops selected'}</span>
            <span>·</span>
            <span>{formatDistance(totalDistanceMeters)}</span>
          </div>
          <div className="flex items-center gap-1 text-stone-700">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>~{formatDuration(totalTimeSeconds, lang)} {lang === 'hi' ? 'कुल यात्रा' : 'travel time'}</span>
          </div>
        </div>

        {/* Selected Stops List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {itineraryPlaces.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              <p className="font-medium text-stone-600 mb-1">
                {lang === 'hi' ? 'कोई स्थान नहीं चुना गया है' : 'No destinations selected yet'}
              </p>
              <p>
                {lang === 'hi'
                  ? 'नीचे दिए गए स्थानों में से जोड़ें या मुख्य स्क्रीन पर "टूर में जोड़ें" दबाएं।'
                  : 'Select stops from below or click "Add to Tour" on place details.'}
              </p>
            </div>
          ) : (
            itineraryPlaces.map((place, idx) => (
              <div
                key={place.id}
                className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200/90 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 leading-tight">
                      {place.name[lang]}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {place.category.toUpperCase()} · ~{place.suggestedDurationMinutes} min visit
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === itineraryPlaces.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemove(place.id)}
                    className="p-1 text-red-500 hover:text-red-700 ml-1"
                    title="Remove from itinerary"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Quick Add Available Places Section */}
          <div className="mt-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 mb-2">
              {lang === 'hi' ? 'अन्य प्रसिद्ध दर्शनीय स्थल जोड़ें:' : 'Add other famous attractions:'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {availablePlaces
                .filter((p) => !itineraryPlaces.some((item) => item.id === p.id))
                .slice(0, 8)
                .map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleAdd(place)}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-lg text-xs text-stone-700 flex items-center gap-1 transition-all"
                  >
                    <span className="font-semibold text-amber-700">+{place.number}</span>
                    <span>{place.name[lang]}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={() => onUpdateItinerary([])}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            {lang === 'hi' ? 'सब हटाएं' : 'Clear all'}
          </button>

          <button
            disabled={itineraryPlaces.length === 0}
            onClick={() => {
              onStartItineraryNavigation(itineraryPlaces);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Navigation2 className="w-4 h-4 fill-white" />
            {lang === 'hi' ? 'यात्रा मार्ग नेविगेट करें' : 'Start Tour Navigation'}
          </button>
        </div>
      </div>
    </div>
  );
};
