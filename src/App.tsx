/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TouristPlace, Language, TravelMode, PlaceCategory, RouteData, UserLocationState, Coordinates } from './types/tourist';
import { VARANASI_PLACES, VARANASI_HUBS } from './data/varanasiPlaces';
import { TouristMap } from './components/TouristMap';
import { Navbar } from './components/Navbar';
import { PlaceSearch } from './components/PlaceSearch';
import { PlaceDetailsSheet } from './components/PlaceDetailsSheet';
import { NavigationBanner } from './components/NavigationBanner';
import { TourPlannerModal } from './components/TourPlannerModal';
import { VaranasiGuideModal } from './components/VaranasiGuideModal';
import { NearbyPlacesCarousel } from './components/NearbyPlacesCarousel';
import { LocationHubBanner } from './components/LocationHubBanner';
import { FeedbackModal } from './components/FeedbackModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PrivacyNoticeBanner } from './components/PrivacyNoticeBanner';
import { ShareLocationModal } from './components/ShareLocationModal';
import { SharedLocationViewer } from './components/SharedLocationViewer';
import { ActiveShareBanner } from './components/ActiveShareBanner';
import { requestUserLocation } from './services/geolocationService';
import { fetchRoute, calculateHaversineDistanceKm } from './services/routingService';
import { analytics } from './services/analyticsService';
import { seoService } from './services/seoService';
import { Sparkles, Share2 } from 'lucide-react';

export default function App() {
  // Check if viewing a shared location link: /shared-location/:token
  const [sharedToken, setSharedToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/shared-location\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }
    return null;
  });
  const [isShareLocationOpen, setIsShareLocationOpen] = useState<boolean>(false);

  const [lang, setLang] = useState<Language>('en');
  const [placesList, setPlacesList] = useState<TouristPlace[]>(VARANASI_PLACES);
  const [selectedPlace, setSelectedPlace] = useState<TouristPlace | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');

  // Load dynamic tourist places directly from database
  const loadPlacesFromDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/places');
      if (res.ok) {
        const data = await res.json();
        if (data.places && Array.isArray(data.places) && data.places.length > 0) {
          setPlacesList(data.places);
          
          // Match place from URL or ensure selectedPlace is backed by database record
          const path = typeof window !== 'undefined' ? window.location.pathname : '/';
          if (path.startsWith('/places/')) {
            const slug = path.replace('/places/', '').split('/')[0];
            const matched = data.places.find((p: TouristPlace) => p.id === slug);
            if (matched) setSelectedPlace(matched);
            else setSelectedPlace(data.places[0]);
          } else {
            setSelectedPlace((prev) => {
              if (!prev) return data.places[0];
              const found = data.places.find((p: TouristPlace) => p.id === prev.id);
              return found || data.places[0];
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not load places from API, using fallback data:', e);
    }
  }, []);

  // Multi-stop Tour Planner State
  const [itineraryPlaces, setItineraryPlaces] = useState<TouristPlace[]>([
    VARANASI_PLACES[0], // Kashi Vishwanath
    VARANASI_PLACES[1], // Dashashwamedh Ghat
    VARANASI_PLACES[2], // Manikarnika Ghat
  ]);
  const [isTourPlannerOpen, setIsTourPlannerOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Active Navigation & Routing State
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [activeNavStepIndex, setActiveNavStepIndex] = useState<number>(0);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  // User Location State
  const [locationState, setLocationState] = useState<UserLocationState>({
    coordinates: VARANASI_HUBS[0].coordinates, // Default to Godowlia Chowk
    isCustomSelected: true,
    isInsideVaranasi: true,
    permissionGranted: false,
    loading: true,
    error: null,
  });

  // Initialize SEO, analytics, database places & initial URL routing on mount
  useEffect(() => {
    analytics.init(lang);
    seoService.init();
    loadPlacesFromDatabase();

    // Route matching from window.location
    const path = window.location.pathname;
    if (path.startsWith('/places/')) {
      const slug = path.replace('/places/', '').split('/')[0];
      const matched = VARANASI_PLACES.find((p) => p.id === slug);
      if (matched) {
        setSelectedPlace(matched);
        seoService.applySeo(path, matched);
      } else {
        setSelectedPlace(VARANASI_PLACES[0]);
        seoService.applySeo('/');
      }
    } else if (path === '/guide') {
      setIsGuideOpen(true);
      setSelectedPlace(VARANASI_PLACES[0]);
      seoService.applySeo('/guide');
    } else if (path === '/plan-tour') {
      setIsTourPlannerOpen(true);
      setSelectedPlace(VARANASI_PLACES[0]);
      seoService.applySeo('/plan-tour');
    } else if (path.startsWith('/shared-location')) {
      seoService.applySeo('/shared-location');
    } else {
      setSelectedPlace(VARANASI_PLACES[0]);
      seoService.applySeo('/');
    }

    // Handle browser Back / Forward buttons
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p.startsWith('/places/')) {
        const slug = p.replace('/places/', '').split('/')[0];
        const matched = VARANASI_PLACES.find((place) => place.id === slug);
        if (matched) {
          setSelectedPlace(matched);
          setIsGuideOpen(false);
          setIsTourPlannerOpen(false);
        }
      } else if (p === '/guide') {
        setIsGuideOpen(true);
        setIsTourPlannerOpen(false);
      } else if (p === '/plan-tour') {
        setIsTourPlannerOpen(true);
        setIsGuideOpen(false);
      } else {
        setIsGuideOpen(false);
        setIsTourPlannerOpen(false);
      }
      seoService.applySeo(p);
    };

    window.addEventListener('popstate', handlePopState);

    // Check if returning visitor has a completed tour awaiting feedback
    const pendingFeedback = localStorage.getItem('kashi_tour_completed_pending');
    if (pendingFeedback === 'true') {
      setTimeout(() => {
        setIsFeedbackOpen(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Request location on first mount
  const initLocation = useCallback(async () => {
    setLocationState((prev) => ({ ...prev, loading: true }));
    const result = await requestUserLocation();
    setLocationState(result);
  }, []);

  useEffect(() => {
    initLocation();
  }, [initLocation]);


  // Track search queries debounced
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const timeout = setTimeout(() => {
        analytics.track('search_performed', undefined, { query: searchQuery.trim() });
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery]);

  // Filter places based on search query and category
  const filteredPlaces = useMemo(() => {
    return placesList.filter((place) => {
      // Inactive check
      if (place.status === 'inactive') return false;

      // Category match
      if (selectedCategory !== 'all' && place.category !== selectedCategory) {
        return false;
      }
      // Query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchNameEn = place.name.en.toLowerCase().includes(q);
      const matchNameHi = place.name.hi.toLowerCase().includes(q);
      const matchSubtitleEn = place.subtitle.en.toLowerCase().includes(q);
      const matchSubtitleHi = place.subtitle.hi.toLowerCase().includes(q);
      const matchCategory = place.category.toLowerCase().includes(q);
      return matchNameEn || matchNameHi || matchSubtitleEn || matchSubtitleHi || matchCategory;
    });
  }, [placesList, searchQuery, selectedCategory]);

  // Compute route when requested or when mode switches during active navigation
  const computeRoute = useCallback(
    async (destination: TouristPlace, mode: TravelMode) => {
      setRouteLoading(true);
      try {
        const originName = locationState.isInsideVaranasi
          ? lang === 'hi'
            ? 'आपका वर्तमान स्थान'
            : 'Your Current Location'
          : lang === 'hi'
          ? 'गोदौलिया चौक (गेटवे)'
          : 'Godowlia Chowk (Ghats Gateway)';

        analytics.track('route_requested', destination.id, { mode });

        const data = await fetchRoute(
          locationState.coordinates,
          destination.coordinates,
          mode,
          originName,
          destination.name[lang]
        );
        setRouteData(data);
      } catch (err) {
        console.error('Route calculation error:', err);
      } finally {
        setRouteLoading(false);
      }
    },
    [locationState.coordinates, locationState.isInsideVaranasi, lang]
  );

  // Handle Start Navigation for a single place
  const handleStartNavigation = useCallback(
    (place: TouristPlace) => {
      setSelectedPlace(place);
      setIsNavigating(true);
      analytics.track('navigation_started', place.id, { travelMode });
      computeRoute(place, travelMode);
    },
    [computeRoute, travelMode]
  );

  // Recalculate route when travel mode changes during active navigation
  const handleSetTravelMode = useCallback(
    (newMode: TravelMode) => {
      setTravelMode(newMode);
      if (selectedPlace) {
        computeRoute(selectedPlace, newMode);
      }
    },
    [selectedPlace, computeRoute]
  );

  // Handle Tour Completion & Feedback prompt
  const handleCompleteTour = useCallback(async () => {
    try {
      await fetch('/api/tour/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: activeTourId }),
      });
      analytics.track('tour_completed', selectedPlace?.id);
      localStorage.setItem('kashi_tour_completed_pending', 'false');
    } catch (e) {
      console.warn('Failed to record tour completion on server:', e);
    }
    setIsNavigating(false);
    setRouteData(null);
    setIsFeedbackOpen(true);
  }, [activeTourId, selectedPlace]);

  // Exit navigation
  const handleExitNavigation = useCallback(() => {
    setIsNavigating(false);
    setRouteData(null);
  }, []);

  // Handle Select Place from map or search
  const handleSelectPlace = useCallback((place: TouristPlace) => {
    setSelectedPlace(place);
    analytics.track('place_details_opened', place.id);
    seoService.pushUrl(`/places/${place.id}`);
  }, []);

  const handleOpenTourPlanner = useCallback(() => {
    setIsTourPlannerOpen(true);
    seoService.pushUrl('/plan-tour');
  }, []);

  const handleCloseTourPlanner = useCallback(() => {
    setIsTourPlannerOpen(false);
    seoService.pushUrl(selectedPlace ? `/places/${selectedPlace.id}` : '/');
  }, [selectedPlace]);

  const handleOpenGuide = useCallback(() => {
    setIsGuideOpen(true);
    seoService.pushUrl('/guide');
  }, []);

  const handleCloseGuide = useCallback(() => {
    setIsGuideOpen(false);
    seoService.pushUrl(selectedPlace ? `/places/${selectedPlace.id}` : '/');
  }, [selectedPlace]);

  // Handle Itinerary toggle
  const handleToggleItinerary = useCallback((place: TouristPlace) => {
    setItineraryPlaces((prev) => {
      const exists = prev.some((p) => p.id === place.id);
      if (exists) {
        return prev.filter((p) => p.id !== place.id);
      } else {
        return [...prev, place];
      }
    });
  }, []);

  // Handle Start Itinerary Navigation (routes to stop #1 and creates tour on server)
  const handleStartItineraryNavigation = useCallback(
    async (places: TouristPlace[]) => {
      if (places.length === 0) return;
      try {
        const res = await fetch('/api/tour/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            places: places.map((p) => p.id),
            travelMode,
            lang,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setActiveTourId(data.tour?.id || null);
          localStorage.setItem('kashi_tour_completed_pending', 'true');
        }
      } catch (err) {
        console.warn('Could not save tour to database:', err);
      }

      setSelectedPlace(places[0]);
      setIsNavigating(true);
      analytics.track('tour_planned', places[0].id, { stopCount: places.length });
      computeRoute(places[0], travelMode);
    },
    [computeRoute, travelMode, lang]
  );

  // Explore Nearby button action
  const handleTriggerExploreNearby = useCallback(() => {
    const sorted = [...placesList].sort((a, b) => {
      const dA = calculateHaversineDistanceKm(locationState.coordinates, a.coordinates);
      const dB = calculateHaversineDistanceKm(locationState.coordinates, b.coordinates);
      return dA - dB;
    });

    if (sorted.length > 0) {
      setSelectedPlace(sorted[0]);
      analytics.track('place_details_opened', sorted[0].id, { trigger: 'explore_nearby' });
    }
  }, [locationState.coordinates, placesList]);

  // Set manual user location (e.g. clicking on map or selecting hub)
  const handleSetUserLocation = useCallback((coords: Coordinates) => {
    setLocationState({
      coordinates: coords,
      isCustomSelected: true,
      isInsideVaranasi: true,
      permissionGranted: true,
      loading: false,
      error: null,
    });
  }, []);

  // Language switch with analytics event
  const handleToggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      analytics.track('language_switched', undefined, { from: prev, to: next });
      return next;
    });
  }, []);

  // If viewing a shared location URL (/shared-location/:token), render dedicated viewer
  if (sharedToken) {
    return (
      <SharedLocationViewer
        token={sharedToken}
        onOpenFullGuide={() => {
          window.history.pushState({}, '', '/');
          setSharedToken(null);
        }}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-100 font-sans select-none">
      {/* Semantic SEO Header for Accessibility & Crawlers */}
      <header role="banner" className="sr-only">
        <h1>Kashi Yatra - Varanasi Smart Tourist Guide & Navigation</h1>
        <p>
          Smart pedestrian & vehicle navigation, live Ghats map, Aarti schedules, verified temple history, and AI
          pilgrim assistance for exploring Varanasi.
        </p>
      </header>

      {/* Top Navigation Bar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenTourPlanner={handleOpenTourPlanner}
        onOpenGuide={handleOpenGuide}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenShareLocation={() => setIsShareLocationOpen(true)}
        itineraryCount={itineraryPlaces.length}
        locationState={locationState}
        onTriggerExploreNearby={handleTriggerExploreNearby}
      />

      {/* Floating Active Live Share Banner */}
      <ActiveShareBanner
        lang={lang}
        onOpenShareModal={() => setIsShareLocationOpen(true)}
      />

      {/* Floating Top Search & Filter Bar */}
      <div className="absolute top-16 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 z-20 flex flex-col gap-2 pointer-events-auto">
        <PlaceSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          lang={lang}
          totalCount={filteredPlaces.length}
        />

        {/* User Hub / Remote Location Advisory Banner */}
        <LocationHubBanner
          locationState={locationState}
          onSelectHub={handleSetUserLocation}
          onRetryLocation={initLocation}
          lang={lang}
        />

        {/* Nearby Carousel Glance when not navigating */}
        {!isNavigating && (
          <NearbyPlacesCarousel
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
            userLocation={locationState.coordinates}
            lang={lang}
          />
        )}
      </div>

      {/* Full-bleed Interactive Map Canvas */}
      <main className="w-full h-full pt-14">
        <TouristMap
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          userLocation={locationState.coordinates}
          onSetUserLocation={handleSetUserLocation}
          routeData={routeData}
          travelMode={travelMode}
          itineraryPlaces={itineraryPlaces}
          activeNavStepIndex={activeNavStepIndex}
        />
      </main>

      {/* Floating Buttons: Share My Location & AI Tourist Assistant (when not navigating) */}
      {!isNavigating && (
        <>
          {/* Share My Location Button */}
          <button
            onClick={() => setIsShareLocationOpen(true)}
            className="fixed bottom-24 left-4 z-30 px-3.5 py-2.5 bg-gradient-to-tr from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/80 active:scale-95 transition-all group"
            title="Share My Location"
          >
            <Share2 className="w-4 h-4 text-emerald-200" />
            <span className="font-bold text-xs tracking-wide">
              {lang === 'hi' ? 'स्थान शेयर करें' : 'Share My Location'}
            </span>
          </button>

          {/* AI Tourist Assistant Launcher */}
          <button
            onClick={() => {
              setIsAiAssistantOpen(true);
              analytics.track('ai_assistant_opened');
            }}
            className="fixed bottom-24 right-4 z-30 px-3.5 py-2.5 bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/80 active:scale-95 transition-all group"
            title="Ask AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
            <span className="font-bold text-xs tracking-wide">
              {lang === 'hi' ? 'AI गाइड' : 'AI Assistant'}
            </span>
          </button>
        </>
      )}

      {/* Turn-by-Turn HUD Banner when Navigating */}
      {isNavigating && routeData && (
        <NavigationBanner
          routeData={routeData}
          lang={lang}
          onExitNavigation={handleExitNavigation}
          onRecalculateRoute={() => selectedPlace && computeRoute(selectedPlace, travelMode)}
          userLocation={locationState.coordinates}
          destinationCoords={selectedPlace?.coordinates || routeData.geometry[routeData.geometry.length - 1]}
          travelMode={travelMode}
          onSetTravelMode={handleSetTravelMode}
          onStepChange={setActiveNavStepIndex}
          onCompleteTour={handleCompleteTour}
          onOpenAiAssistant={() => {
            setIsAiAssistantOpen(true);
            analytics.track('ai_assistant_opened');
          }}
          onOpenShareLocation={() => setIsShareLocationOpen(true)}
        />
      )}

      {/* Mobile-first Place Details Bottom Sheet */}
      {!isNavigating && selectedPlace && (
        <PlaceDetailsSheet
          place={selectedPlace}
          onClose={() => {
            setSelectedPlace(null);
            seoService.pushUrl('/');
          }}
          lang={lang}
          userLocation={locationState.coordinates}
          travelMode={travelMode}
          onSetTravelMode={handleSetTravelMode}
          onStartNavigation={handleStartNavigation}
          isNavigating={isNavigating}
          isInItinerary={itineraryPlaces.some((p) => p.id === selectedPlace.id)}
          onToggleItinerary={handleToggleItinerary}
        />
      )}

      {/* Multilingual AI Tourist Assistant Chat & Credit Purchase Modal */}
      <AIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        lang={lang}
        selectedPlace={selectedPlace}
        destinationPlace={selectedPlace}
        travelMode={travelMode}
        currentNavInstruction={routeData?.steps[activeNavStepIndex]?.instruction[lang]}
      />

      {/* Tour Completion & Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        lang={lang}
        tourId={activeTourId}
      />

      {/* Smart Multi-Destination Tour Planner Modal */}
      <TourPlannerModal
        isOpen={isTourPlannerOpen}
        onClose={handleCloseTourPlanner}
        availablePlaces={placesList}
        itineraryPlaces={itineraryPlaces}
        onUpdateItinerary={setItineraryPlaces}
        lang={lang}
        userLocation={locationState.coordinates}
        travelMode={travelMode}
        onSetTravelMode={handleSetTravelMode}
        onStartItineraryNavigation={handleStartItineraryNavigation}
      />

      {/* Varanasi Heritage & Visitor Safety Guide Modal */}
      <VaranasiGuideModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
        lang={lang}
      />

      {/* Admin Intelligence & Analytics Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          loadPlacesFromDatabase();
        }}
      />

      {/* Secure Live Location Sharing Modal */}
      <ShareLocationModal
        isOpen={isShareLocationOpen}
        onClose={() => setIsShareLocationOpen(false)}
        lang={lang}
        userLocation={locationState.coordinates}
      />

      {/* Privacy Notice Banner */}
      <PrivacyNoticeBanner lang={lang} />

      {/* Route Calculation Loading Indicator */}
      {routeLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>{lang === 'hi' ? 'मार्ग की गणना हो रही है...' : 'Calculating optimal route...'}</span>
        </div>
      )}
    </div>
  );
}
