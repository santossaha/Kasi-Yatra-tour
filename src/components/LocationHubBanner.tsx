import React, { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check } from 'lucide-react';
import { Coordinates, Language, UserLocationState } from '../types/tourist';
import { VARANASI_HUBS } from '../data/varanasiPlaces';

interface LocationHubBannerProps {
  locationState: UserLocationState;
  onSelectHub: (coords: Coordinates) => void;
  onRetryLocation: () => void;
  lang: Language;
}

export const LocationHubBanner: React.FC<LocationHubBannerProps> = ({
  locationState,
  onSelectHub,
  onRetryLocation,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // If user is inside Varanasi and has GPS permission granted, no need to show prominent banner
  if (locationState.isInsideVaranasi && locationState.permissionGranted && !locationState.error) {
    return null;
  }

  return (
    <div className="w-full bg-amber-100/90 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl text-xs shadow-xs flex flex-col gap-1.5 backdrop-blur-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
          <span className="font-medium text-[11px] leading-tight">
            {locationState.error
              ? lang === 'hi'
                ? 'आप वाराणसी से बाहर हैं। आरंभिक बिंदु गोदौलिया चौक चुना गया है।'
                : 'Start point set to Godowlia Chowk (Main Ghats).'
              : lang === 'hi'
              ? 'स्थान चुना गया'
              : 'Starting point selected'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-0.5"
          >
            {lang === 'hi' ? 'बदलें' : 'Change'}
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            onClick={onRetryLocation}
            className="p-1 hover:bg-amber-200/60 rounded"
            title="Retry GPS"
          >
            <Navigation className="w-3 h-3 text-amber-800" />
          </button>
        </div>
      </div>

      {/* Hub dropdown options */}
      {isOpen && (
        <div className="pt-1.5 border-t border-amber-200 flex flex-col gap-1">
          <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
            {lang === 'hi' ? 'आरंभिक बिंदु चुनें:' : 'Select Starting Hub:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            {VARANASI_HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => {
                  onSelectHub(hub.coordinates);
                  setIsOpen(false);
                }}
                className="px-2 py-1 text-left bg-white/80 hover:bg-white rounded-md text-[11px] font-medium text-stone-800 border border-amber-200/80 flex items-center justify-between"
              >
                <span>{hub.name[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
