import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Footprints,
  Car,
  Compass,
  Sparkles,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { RouteData, NavigationStep, Language, TravelMode, Coordinates } from '../types/tourist';
import { formatDistance, formatDuration, getGoogleMapsNavigationUrl } from '../services/routingService';
import { speechService } from '../services/speechService';

interface NavigationBannerProps {
  routeData: RouteData;
  lang: Language;
  onExitNavigation: () => void;
  onRecalculateRoute: () => void;
  userLocation: Coordinates;
  destinationCoords: Coordinates;
  travelMode: TravelMode;
  onSetTravelMode: (mode: TravelMode) => void;
  onStepChange?: (stepIndex: number) => void;
  onCompleteTour: () => void;
  onOpenAiAssistant: () => void;
  onOpenShareLocation?: () => void;
}

export const NavigationBanner: React.FC<NavigationBannerProps> = ({
  routeData,
  lang,
  onExitNavigation,
  onRecalculateRoute,
  userLocation,
  destinationCoords,
  travelMode,
  onSetTravelMode,
  onStepChange,
  onCompleteTour,
  onOpenAiAssistant,
  onOpenShareLocation,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const steps = routeData.steps || [];
  const currentStep: NavigationStep | undefined = steps[currentStepIndex] || steps[0];

  // Announce step when current step changes
  useEffect(() => {
    if (currentStep) {
      speechService.speak(currentStep.instruction[lang], lang);
    }
    if (onStepChange) {
      onStepChange(currentStepIndex);
    }
  }, [currentStepIndex, lang]);

  // Simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsSimulating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, steps.length]);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    speechService.setMuted(nextMute);
  };

  const renderManeuverIcon = (maneuver?: NavigationStep['maneuver']) => {
    const iconClass = 'w-6 h-6 text-white';
    switch (maneuver) {
      case 'turn-left':
      case 'slight-left':
        return <CornerUpLeft className={iconClass} />;
      case 'turn-right':
      case 'slight-right':
        return <CornerUpRight className={iconClass} />;
      case 'arrive':
        return <Compass className={iconClass} />;
      case 'depart':
      case 'continue':
      default:
        return <ArrowUp className={iconClass} />;
    }
  };

  const googleMapsUrl = getGoogleMapsNavigationUrl(userLocation, destinationCoords, travelMode);

  return (
    <>
      {/* Top Turn-by-Turn HUD Banner */}
      <div className="fixed top-14 left-2 right-2 sm:left-4 sm:right-4 z-40 max-w-lg mx-auto">
        <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-stone-700/80 p-3.5 flex flex-col gap-2.5">
          {/* Main Direction Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-600 flex items-center justify-center shrink-0 shadow-md">
                {renderManeuverIcon(currentStep?.maneuver)}
              </div>
              <div>
                <div className="text-sm font-semibold text-amber-300">
                  {currentStep ? formatDistance(currentStep.distanceMeters) : '0 m'}
                </div>
                <div className="text-xs text-stone-100 font-medium line-clamp-2 leading-tight">
                  {currentStep?.instruction[lang] || routeData.destinationName}
                </div>
              </div>
            </div>

            <button
              onClick={onExitNavigation}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              title="Exit Navigation"
              aria-label="Exit Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Destination, ETA, and Step Controls */}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400">
                {formatDuration(routeData.durationSeconds, lang)}
              </span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-300">{formatDistance(routeData.distanceMeters)}</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-400 truncate max-w-[110px]">{routeData.destinationName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1 text-stone-400 hover:text-white rounded"
                title={isMuted ? 'Unmute voice' : 'Mute voice'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
                className="p-1 text-stone-300 hover:text-white disabled:opacity-30"
                title="Previous step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-[11px] text-stone-400 px-1 font-mono">
                {currentStepIndex + 1}/{steps.length}
              </span>

              <button
                disabled={currentStepIndex >= steps.length - 1}
                onClick={() => setCurrentStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                className="p-1 text-stone-300 hover:text-white disabled:opacity-30"
                title="Next step"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Controller */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 p-2.5 flex items-center justify-between gap-2">
        {/* Mode switcher while navigating */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => onSetTravelMode('walking')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-all ${
              travelMode === 'walking'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'पैदल' : 'Walk'}</span>
          </button>
          <button
            onClick={() => onSetTravelMode('driving')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-all ${
              travelMode === 'driving'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'वाहन' : 'Drive'}</span>
          </button>
        </div>

        {/* Live Simulation Preview Player */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              isSimulating
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            title="Preview navigation"
          >
            {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden xs:inline">{isSimulating ? 'Pause' : 'Simulate'}</span>
          </button>

          <button
            onClick={() => {
              setIsSimulating(false);
              setCurrentStepIndex(0);
            }}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            title="Reset step to start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Tourist Assistant Launcher */}
        <button
          onClick={onOpenAiAssistant}
          className="p-1.5 bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-lg shadow-xs flex items-center gap-1 font-bold text-xs transition-all"
          title="Ask AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Guide</span>
        </button>

        {/* Share Location during Navigation */}
        {onOpenShareLocation && (
          <button
            onClick={onOpenShareLocation}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 font-bold text-xs transition-all"
            title="Share My Location"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'शेयर' : 'Share'}</span>
          </button>
        )}

        {/* Complete Tour & External Map & Exit */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCompleteTour}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1"
            title="Mark tour completed and share feedback"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{lang === 'hi' ? 'यात्रा पूर्ण' : 'Done'}</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg border border-stone-200 hover:bg-stone-50"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onExitNavigation}
            className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            {lang === 'hi' ? 'समाप्त' : 'Exit'}
          </button>
        </div>
      </div>
    </>
  );
};
