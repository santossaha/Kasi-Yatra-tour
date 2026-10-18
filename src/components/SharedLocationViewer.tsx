import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  Clock,
  ExternalLink,
  ShieldAlert,
  Footprints,
  Car,
  RefreshCw,
  PhoneCall,
  Languages,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Language, Coordinates, RouteData } from '../types/tourist';
import { locationShareService, SharedLocationPayload } from '../services/locationShareService';
import { VARANASI_PLACES } from '../data/varanasiPlaces';
import { fetchRoute, formatDistance, formatDuration } from '../services/routingService';

interface SharedLocationViewerProps {
  token: string;
  onOpenFullGuide?: () => void;
}

export const SharedLocationViewer: React.FC<SharedLocationViewerProps> = ({
  token,
  onOpenFullGuide,
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [payload, setPayload] = useState<SharedLocationPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);
  const [countdown, setCountdown] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Recipient's Own Location & Directions to Tourist
  const [viewerLocation, setViewerLocation] = useState<Coordinates | null>(null);
  const [viewerLocLoading, setViewerLocLoading] = useState<boolean>(false);
  const [routeToTourist, setRouteToTourist] = useState<RouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [travelMode, setTravelMode] = useState<'walking' | 'driving'>('walking');

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const touristMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const viewerMarkerRef = useRef<L.Marker | null>(null);

  // Load shared data
  const loadData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    const result = await locationShareService.fetchSharedLocation(token);
    if (result.success && result.data) {
      setPayload(result.data);
      setErrorMsg('');
      setSecondsSinceUpdate(0);
    } else {
      setErrorMsg(result.error || 'This location link is expired, ended, or invalid.');
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Periodic polling if live share is active
  useEffect(() => {
    if (!payload || payload.share.status !== 'active' || payload.share.share_type !== 'live') {
      return;
    }
    const pollInterval = setInterval(() => {
      loadData(true);
    }, 6000);
    return () => clearInterval(pollInterval);
  }, [payload?.share.status, payload?.share.share_type, token]);

  // Elapsed seconds timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!payload?.share.expires_at) return;
    const updateCountdown = () => {
      const remainingMs = new Date(payload.share.expires_at).getTime() - Date.now();
      if (remainingMs <= 0) {
        setCountdown(lang === 'hi' ? 'समय समाप्त (Expired)' : 'Sharing Expired');
      } else {
        const totalSec = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        if (hours > 0) {
          setCountdown(`${hours}h ${mins}m ${secs}s`);
        } else {
          setCountdown(`${mins}m ${secs}s`);
        }
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [payload?.share.expires_at, lang]);

  // Map Initialization & Updates
  useEffect(() => {
    if (!mapContainerRef.current || !payload?.location) return;

    const lat = payload.location.latitude;
    const lng = payload.location.longitude;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Plot nearby key landmarks for context
      VARANASI_PLACES.slice(0, 10).forEach((place) => {
        const landmarkIcon = L.divIcon({
          className: 'custom-landmark-marker',
          html: `
            <div class="px-2 py-1 bg-white/95 backdrop-blur-xs border border-amber-600/50 rounded-lg shadow-md text-[10px] font-bold text-stone-800 flex items-center gap-1 whitespace-nowrap hover:scale-105 transition-transform">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span>${place.name.en}</span>
            </div>
          `,
          iconSize: [100, 24],
          iconAnchor: [50, 12],
        });
        L.marker([place.coordinates.lat, place.coordinates.lng], {
          icon: landmarkIcon,
          interactive: false,
        }).addTo(map);
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update Tourist Marker
    const isLive = payload.share.status === 'active' && payload.share.share_type === 'live';
    const isEnded = payload.share.status === 'ended' || payload.share.status === 'expired';

    const touristIcon = L.divIcon({
      className: 'custom-tourist-share-marker',
      html: `
        <div class="relative flex flex-col items-center">
          ${
            isLive
              ? '<span class="absolute -top-1 -right-1 flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span></span>'
              : ''
          }
          <div class="w-12 h-12 rounded-full ${
            isEnded
              ? 'bg-stone-500 ring-stone-300'
              : isLive
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-emerald-300'
              : 'bg-gradient-to-tr from-amber-600 to-orange-500 ring-amber-300'
          } ring-4 shadow-2xl flex items-center justify-center text-white font-extrabold text-sm border-2 border-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="mt-1 px-2.5 py-0.5 ${
            isEnded ? 'bg-stone-700' : 'bg-stone-900'
          } text-white font-bold text-[11px] rounded-full shadow-md whitespace-nowrap border border-white/40">
            ${payload.share.sender_name}
          </div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 40],
    });

    if (touristMarkerRef.current) {
      touristMarkerRef.current.setLatLng([lat, lng]);
      touristMarkerRef.current.setIcon(touristIcon);
    } else {
      touristMarkerRef.current = L.marker([lat, lng], { icon: touristIcon, zIndexOffset: 1000 }).addTo(map);
    }

    // Accuracy Circle
    const accuracy = payload.location.accuracy_meters || 15;
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setRadius(accuracy);
    } else {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: isLive ? '#10b981' : '#f59e0b',
        fillColor: isLive ? '#10b981' : '#f59e0b',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);
    }

    // Pan to position if not routing
    if (!routeToTourist) {
      map.panTo([lat, lng], { animate: true });
    }
  }, [payload]);

  // Calculate route from viewer to tourist
  const handleGetDirections = async () => {
    if (!payload?.location) return;
    setViewerLocLoading(true);

    try {
      const viewerPos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const vCoords: Coordinates = {
        lat: viewerPos.coords.latitude,
        lng: viewerPos.coords.longitude,
      };
      setViewerLocation(vCoords);

      const touristCoords: Coordinates = {
        lat: payload.location.latitude,
        lng: payload.location.longitude,
      };

      setRouteLoading(true);
      const data = await fetchRoute(
        vCoords,
        touristCoords,
        travelMode,
        lang === 'hi' ? 'आपका स्थान' : 'Your Location',
        payload.share.sender_name
      );
      setRouteToTourist(data);

      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;

        // Draw Viewer Marker
        const viewerIcon = L.divIcon({
          className: 'viewer-marker',
          html: `
            <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-lg">
              You
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (viewerMarkerRef.current) {
          viewerMarkerRef.current.setLatLng([vCoords.lat, vCoords.lng]);
        } else {
          viewerMarkerRef.current = L.marker([vCoords.lat, vCoords.lng], { icon: viewerIcon }).addTo(map);
        }

        // Draw Route Polyline
        if (routePolylineRef.current) {
          routePolylineRef.current.remove();
        }
        const latLngs = data.geometry.map((g) => [g.lat, g.lng] as [number, number]);
        routePolylineRef.current = L.polyline(latLngs, {
          color: travelMode === 'walking' ? '#ea580c' : '#2563eb',
          weight: 5,
          opacity: 0.85,
        }).addTo(map);

        map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
      }
    } catch (err: any) {
      alert(
        lang === 'hi'
          ? 'आपके स्थान तक पहुँचने में त्रुटि हुई। कृपया GPS सक्षम करें।'
          : 'Could not access your location. Please enable GPS permissions.'
      );
    } finally {
      setViewerLocLoading(false);
      setRouteLoading(false);
    }
  };

  // Nearest landmark information
  const nearest = payload?.location
    ? locationShareService.findNearestLandmark({
        lat: payload.location.latitude,
        lng: payload.location.longitude,
      })
    : null;

  const isLive = payload?.share.status === 'active' && payload?.share.share_type === 'live';
  const isSnapshot = payload?.share.status === 'active' && payload?.share.share_type === 'snapshot';
  const isExpiredOrEnded =
    payload?.share.status === 'ended' ||
    payload?.share.status === 'expired' ||
    (payload?.share.expires_at && new Date(payload.share.expires_at).getTime() <= Date.now());

  const googleMapsUrl = payload?.location
    ? `https://www.google.com/maps/dir/?api=1&destination=${payload.location.latitude},${payload.location.longitude}`
    : '#';

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-stone-100 p-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-stone-900">
          {lang === 'hi' ? 'स्थान लोड हो रहा है...' : 'Loading Shared Location...'}
        </h2>
        <p className="text-xs text-stone-500 mt-1">Connecting to Varanasi Tourist Navigation Node</p>
      </div>
    );
  }

  if (errorMsg && !payload) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-stone-100 p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-extrabold text-stone-900 mb-2">
          {lang === 'hi' ? 'स्थान लिंक अमान्य या समाप्त हो गया है' : 'Location Share Link Ended or Expired'}
        </h2>
        <p className="text-xs text-stone-600 max-w-md mb-6 leading-relaxed">
          {lang === 'hi'
            ? 'गोपनीयता सुरक्षा के तहत, यह लोकेशन लिंक बंद कर दिया गया है या निर्धारित समय समाप्त हो गया है। कृपया अपने साथी से नया लिंक मांगें।'
            : 'For privacy and safety, this location sharing session has either timed out or been ended by the tourist. Please request a new link.'}
        </p>
        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>{lang === 'hi' ? 'काशी यात्रा गाइड खोलें' : 'Open Kashi Yatra Guide'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-stone-900 leading-tight">
              {lang === 'hi' ? 'काशी यात्रा - साझा स्थान' : 'Kashi Yatra - Shared Location'}
            </h1>
            <p className="text-[10px] text-amber-800 font-medium -mt-0.5">
              {lang === 'hi' ? 'वाराणसी लाइव ट्रैकर' : 'Varanasi Live Location Viewer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            title="Refresh location"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))}
            className="px-2.5 py-1 rounded-lg border border-amber-600/40 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Languages className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'en' ? 'हिं' : 'EN'}</span>
          </button>

          {/* Full Guide Link */}
          <button
            onClick={() => {
              if (onOpenFullGuide) {
                onOpenFullGuide();
              } else {
                window.location.href = '/';
              }
            }}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'hi' ? 'पूर्ण गाइड' : 'Full Guide'}</span>
          </button>
        </div>
      </header>

      {/* Floating Status & Tourist Information Card */}
      <div className="absolute top-16 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 p-4 space-y-3">
          {/* Status Badge & Countdown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLive ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <span>{lang === 'hi' ? 'लाइव ट्रैकिंग' : 'Live Tracking'}</span>
                </span>
              ) : isSnapshot ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-900 font-bold text-xs rounded-full border border-blue-300">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>{lang === 'hi' ? 'स्थिर स्नैपशॉट' : 'Snapshot'}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-900 font-bold text-xs rounded-full border border-rose-300">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                  <span>{lang === 'hi' ? 'समाप्त / निष्प्रभावी' : 'Sharing Ended'}</span>
                </span>
              )}
            </div>

            <div className="text-[11px] font-mono font-semibold text-stone-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{countdown}</span>
            </div>
          </div>

          {/* Tourist Name & Last Updated */}
          <div>
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <span>{payload?.share.sender_name}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {isLive
                ? secondsSinceUpdate < 5
                  ? lang === 'hi'
                    ? 'अभी-अभी अपडेट हुआ'
                    : 'Updated just now'
                  : lang === 'hi'
                  ? `${secondsSinceUpdate} सेकंड पहले अपडेट हुआ`
                  : `Updated ${secondsSinceUpdate}s ago`
                : lang === 'hi'
                ? 'स्नैपशॉट रिकॉर्ड'
                : 'Recorded snapshot'}
            </p>
          </div>

          {/* Nearest Landmark in Varanasi */}
          {nearest && (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  {lang === 'hi' ? 'समीप का प्रमुख घाट/स्थल' : 'Nearest Varanasi Landmark'}
                </span>
                <span className="font-extrabold text-stone-900">
                  {nearest.place.name[lang]}
                </span>
                <span className="text-amber-900 font-semibold ml-1.5">
                  ({nearest.distanceText})
                </span>
              </div>
            </div>
          )}

          {/* Route info if viewer requested directions */}
          {routeToTourist && (
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>{lang === 'hi' ? 'पर्यटक तक की दूरी' : 'Distance to Tourist'}</span>
                <span className="text-emerald-700">
                  {formatDistance(routeToTourist.distanceMeters)} · {formatDuration(routeToTourist.durationSeconds, lang)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                {travelMode === 'walking'
                  ? lang === 'hi'
                    ? 'पैदल मार्ग: संकरी गलियों व घाटों से सुगम मार्ग'
                    : 'Walking Route: Navigating via pedestrian alleys & ghat steps'
                  : lang === 'hi'
                  ? 'वाहन मार्ग: निकटतम पार्किंग तक'
                  : 'Driving Route: Navigating to nearest vehicle drop point'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleGetDirections}
                disabled={viewerLocLoading || routeLoading}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {viewerLocLoading || routeLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>
                  {routeToTourist
                    ? lang === 'hi'
                      ? 'मार्ग पुनः गणना'
                      : 'Recalculate Route'
                    : lang === 'hi'
                    ? 'यहाँ तक का मार्ग देखें'
                    : 'Get Route to Tourist'}
                </span>
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Maps</span>
              </a>
            </div>

            {/* Travel Mode Switcher if Directions Active */}
            {routeToTourist && (
              <div className="flex items-center justify-center bg-stone-100 p-1 rounded-xl gap-1">
                <button
                  onClick={() => {
                    setTravelMode('walking');
                    handleGetDirections();
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                    travelMode === 'walking'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'पैदल' : 'Walk'}</span>
                </button>
                <button
                  onClick={() => {
                    setTravelMode('driving');
                    handleGetDirections();
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                    travelMode === 'driving'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'वाहन' : 'Drive'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Fullscreen Map Canvas */}
      <main className="w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full" />
      </main>

      {/* Bottom Emergency / Help Footer */}
      <div className="fixed bottom-3 right-3 z-30 flex items-center gap-2">
        <a
          href="tel:112"
          className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-lg border border-stone-700 flex items-center gap-1.5 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
          <span>{lang === 'hi' ? 'पर्यटक पुलिस: 112' : 'Tourist Police: 112'}</span>
        </a>
      </div>
    </div>
  );
};
