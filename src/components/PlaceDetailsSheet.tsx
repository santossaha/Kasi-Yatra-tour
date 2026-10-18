import React, { useState } from 'react';
import {
  X,
  Navigation2,
  Footprints,
  Car,
  Clock,
  Ticket,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Volume2,
  BookmarkPlus,
  BookmarkCheck,
  Compass,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { TouristPlace, Language, TravelMode, Coordinates } from '../types/tourist';
import { calculateHaversineDistanceKm, estimateTravelTimeMinutes, formatDistance, getGoogleMapsNavigationUrl } from '../services/routingService';
import { speechService } from '../services/speechService';

interface PlaceDetailsSheetProps {
  place: TouristPlace | null;
  onClose: () => void;
  lang: Language;
  userLocation: Coordinates;
  travelMode: TravelMode;
  onSetTravelMode: (mode: TravelMode) => void;
  onStartNavigation: (place: TouristPlace) => void;
  isNavigating: boolean;
  isInItinerary: boolean;
  onToggleItinerary: (place: TouristPlace) => void;
}

export const PlaceDetailsSheet: React.FC<PlaceDetailsSheetProps> = ({
  place,
  onClose,
  lang,
  userLocation,
  travelMode,
  onSetTravelMode,
  onStartNavigation,
  isNavigating,
  isInItinerary,
  onToggleItinerary,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'practical'>('overview');

  if (!place) return null;

  const distKm = calculateHaversineDistanceKm(userLocation, place.coordinates);
  const walkingMin = estimateTravelTimeMinutes(distKm * 1.25, 'walking');
  const drivingMin = estimateTravelTimeMinutes(distKm * 1.4, 'driving');

  const handleSpeakOverview = () => {
    const textToSpeak = `${place.name[lang]}. ${place.shortIntro[lang]}`;
    speechService.speak(textToSpeak, lang);
  };

  const googleMapsUrl = getGoogleMapsNavigationUrl(userLocation, place.coordinates, travelMode);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl border-t border-stone-200 transition-all duration-300 ease-out flex flex-col ${
        isExpanded ? 'max-h-[85vh] h-[85vh]' : 'max-h-[310px] h-[310px]'
      }`}
    >
      {/* Top Drag / Pull Handle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-2 pb-1 flex flex-col items-center justify-center cursor-pointer select-none bg-stone-50/90 rounded-t-2xl border-b border-stone-100"
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mb-1"></div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          {isExpanded ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'कम विवरण देखें' : 'Compact View'}
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'विस्तृत इतिहास एवं विवरण' : 'Full History & Details'}
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col">
        {/* Compact Header: Place name, number, distance */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm mt-0.5">
              {place.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 leading-tight">{place.name[lang]}</h2>
                <button
                  onClick={handleSpeakOverview}
                  className="p-1 text-stone-400 hover:text-amber-600 transition-colors"
                  title="Listen aloud"
                  aria-label="Listen audio overview"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-amber-800 font-medium">{place.subtitle[lang]}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distance & Travel Mode Bar */}
        <div className="mt-2.5 flex items-center justify-between bg-stone-50 rounded-xl p-2 border border-stone-200/70">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-stone-800">
              {formatDistance(distKm * 1000)} {lang === 'hi' ? 'दूरी' : 'away'}
            </span>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1 text-stone-600">
              <Footprints className="w-3.5 h-3.5 text-orange-600" />
              <span>~{walkingMin} min</span>
            </div>
            <div className="flex items-center gap-1 text-stone-600">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span>~{drivingMin} min</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => onSetTravelMode('walking')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all ${
                travelMode === 'walking'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Footprints className="w-3 h-3" />
              {lang === 'hi' ? 'पैदल' : 'Walk'}
            </button>
            <button
              onClick={() => onSetTravelMode('driving')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all ${
                travelMode === 'driving'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Car className="w-3 h-3" />
              {lang === 'hi' ? 'वाहन' : 'Drive'}
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onStartNavigation(place)}
            className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Navigation2 className="w-4 h-4 fill-white" />
            {isNavigating
              ? lang === 'hi'
                ? 'मार्ग रीकैलकुलेट करें'
                : 'Recalculate Route'
              : lang === 'hi'
              ? 'नेविगेट शुरू करें'
              : 'Start Navigation'}
          </button>

          <button
            onClick={() => onToggleItinerary(place)}
            className={`py-2.5 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
              isInItinerary
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
            title={isInItinerary ? 'Remove from tour' : 'Add to tour'}
          >
            {isInItinerary ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'यात्रा में शामिल' : 'Added to Tour'}</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-stone-500" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'टूर में जोड़ें' : 'Add to Tour'}</span>
              </>
            )}
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium flex items-center gap-1 shrink-0"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Maps</span>
          </a>
        </div>

        {/* Intro text visible in compact peek */}
        <div className="mt-3 text-xs text-stone-600 leading-relaxed">
          {place.shortIntro[lang]}
        </div>

        {/* Expanded View Tabs and Content */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-stone-200 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-amber-600 text-amber-700 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {lang === 'hi' ? 'पहलू व विशेषताएं' : 'Key Highlights'}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-amber-600 text-amber-700 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {lang === 'hi' ? 'इतिहास व आस्था' : 'History & Faith'}
              </button>
              <button
                onClick={() => setActiveTab('practical')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'practical'
                    ? 'border-amber-600 text-amber-700 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {lang === 'hi' ? 'समय व नियम' : 'Hours & Practical'}
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-3 text-xs">
                {/* Photo */}
                <div className="relative h-44 w-full rounded-xl overflow-hidden shadow-sm">
                  <img
                    src={place.image}
                    alt={place.name.en}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-3 right-3 text-white text-xs font-medium">
                    {place.architecturalFeatures[lang]}
                  </div>
                </div>

                {/* Documented Period */}
                <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/60 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-800">
                      {lang === 'hi' ? 'अभिलेखित कालखंड:' : 'Documented Era:'}{' '}
                    </span>
                    <span className="text-stone-700">{place.periodDocumented[lang]}</span>
                  </div>
                </div>

                {/* Interesting Facts */}
                <div>
                  <h4 className="font-bold text-stone-800 mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900">
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    {lang === 'hi' ? 'रोचक तथ्य एवं विशेषताएं' : 'Interesting Heritage Facts'}
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-stone-600 pl-1">
                    {place.interestingFacts[lang].map((fact, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
              <div className="flex flex-col gap-3 text-xs leading-relaxed text-stone-700">
                {/* Historical Background */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                    {lang === 'hi' ? 'प्रमाणित ऐतिहासिक पृष्ठभूमि' : 'Documented Historical Background'}
                  </div>
                  <p className="text-stone-600">{place.historicalBackground[lang]}</p>
                </div>

                {/* Religious Significance & Beliefs (Explicitly separated from documented history) */}
                {place.religiousSignificance && (
                  <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200">
                    <div className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                      {lang === 'hi' ? 'धार्मिक मान्यता व स्थानीय आस्था' : 'Religious Tradition & Local Beliefs'}
                    </div>
                    <p className="text-amber-900/90">{place.religiousSignificance[lang]}</p>
                    <p className="mt-1 text-[10px] text-amber-800 italic">
                      {lang === 'hi'
                        ? '*यह खंड धार्मिक आस्था और पौराणिक परंपरा पर आधारित है।'
                        : '*This section represents sacred tradition and spiritual belief distinct from archaeological records.'}
                    </p>
                  </div>
                )}

                {/* Sources & Wikipedia */}
                <div className="pt-2 border-t border-stone-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">
                      {lang === 'hi' ? 'इतिहास के स्रोत:' : 'Documentary Sources:'}
                    </span>
                    <a
                      href={place.wikipediaUrl[lang]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:text-amber-900 font-semibold text-xs flex items-center gap-1 underline underline-offset-2"
                    >
                      {lang === 'hi' ? 'विकिपीडिया पर पढ़ें' : 'Read on Wikipedia'}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {place.sources.join(' · ')}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRACTICAL & ACCESSIBILITY */}
            {activeTab === 'practical' && (
              <div className="flex flex-col gap-3 text-xs text-stone-700">
                {/* Visiting Hours & Aarti */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-stone-800">{lang === 'hi' ? 'दर्शन समय' : 'Visiting Hours'}</div>
                      <div className="text-stone-600">{place.visitingHours[lang]}</div>
                    </div>
                  </div>

                  {place.aartiTimings && (
                    <div className="pt-2 border-t border-stone-200 flex items-start gap-2">
                      <Compass className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-stone-800">{lang === 'hi' ? 'आरती समय' : 'Aarti Schedule'}</div>
                        <div className="text-amber-800 font-medium">{place.aartiTimings[lang]}</div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-200 flex items-start gap-2">
                    <Ticket className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-stone-800">{lang === 'hi' ? 'प्रवेश शुल्क' : 'Entry Fee'}</div>
                      <div className="text-stone-600">{place.entryFee[lang]}</div>
                    </div>
                  </div>
                </div>

                {/* Travel & Accessibility Advisory */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex flex-col gap-2">
                  <div className="font-bold text-stone-900 mb-0.5">
                    {lang === 'hi' ? 'पहुंच एवं मार्ग सलाह' : 'Navigation & Accessibility Advisory'}
                  </div>
                  <div className="text-stone-600">
                    <strong className="text-stone-800">{lang === 'hi' ? 'पैदल:' : 'On Foot:'} </strong>
                    {place.travelModeSuitability.walking[lang]}
                  </div>
                  <div className="text-stone-600">
                    <strong className="text-stone-800">{lang === 'hi' ? 'वाहन:' : 'Vehicle:'} </strong>
                    {place.travelModeSuitability.driving[lang]}
                  </div>
                  <div className="text-stone-600 pt-1 border-t border-stone-200">
                    <strong className="text-stone-800">{lang === 'hi' ? 'सुलभता (Accessibility):' : 'Accessibility:'} </strong>
                    {place.accessibilityNotes[lang]}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
