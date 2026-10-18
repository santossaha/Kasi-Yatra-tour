import React from 'react';
import {
  Compass,
  MapPin,
  Languages,
  BookOpen,
  Route,
  Navigation,
  Share2,
} from 'lucide-react';
import { Language, UserLocationState } from '../types/tourist';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenTourPlanner: () => void;
  onOpenGuide: () => void;
  onOpenAdmin: () => void;
  onOpenShareLocation: () => void;
  itineraryCount: number;
  locationState: UserLocationState;
  onTriggerExploreNearby: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onOpenTourPlanner,
  onOpenGuide,
  onOpenAdmin,
  onOpenShareLocation,
  itineraryCount,
  locationState,
  onTriggerExploreNearby,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-3 sm:px-4 flex items-center justify-between shadow-xs">
      {/* Brand Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center shadow-xs">
          <Compass className="w-4 h-4 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-stone-900 leading-tight">
            {lang === 'hi' ? 'काशी यात्रा' : 'Kashi Yatra'}
          </h1>
          <span className="text-[10px] text-amber-800 font-medium block -mt-0.5">
            {lang === 'hi' ? 'स्मार्ट वाराणसी गाइड' : 'Varanasi Smart Guide'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Explore Nearby */}
        <button
          onClick={onTriggerExploreNearby}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-amber-700 hover:bg-amber-50/80 border border-stone-200/70 flex items-center gap-1 transition-all"
          title="Explore Nearby Places"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">{lang === 'hi' ? 'समीप खोजें' : 'Nearby'}</span>
        </button>

        {/* Plan Tour */}
        <button
          onClick={onOpenTourPlanner}
          className="relative px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-1.5 shadow-xs transition-all"
          title="Plan My Tour"
        >
          <Route className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'hi' ? 'टूर प्लान' : 'Plan Tour'}</span>
          {itineraryCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 font-bold text-[10px] flex items-center justify-center -mr-1">
              {itineraryCount}
            </span>
          )}
        </button>

        {/* Share My Location */}
        <button
          onClick={onOpenShareLocation}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1 transition-all"
          title="Share My Location"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">{lang === 'hi' ? 'स्थान शेयर' : 'Share Location'}</span>
        </button>

        {/* Varanasi Visitor Guide */}
        <button
          onClick={onOpenGuide}
          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          title="Visitor Guidelines & Safety"
          aria-label="Visitor guidelines"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Admin Portal Button */}
        <button
          onClick={onOpenAdmin}
          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 flex items-center gap-1 transition-all"
          title="Admin Analytics Portal"
        >
          <span className="text-[10px] uppercase font-bold text-stone-500">Admin</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-2 py-1 rounded-lg border border-amber-600/40 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 transition-all"
          title={lang === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
        >
          <Languages className="w-3.5 h-3.5 text-amber-700" />
          <span>{lang === 'en' ? 'हिं' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};
