import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TouristPlace, Coordinates, RouteData, TravelMode } from '../types/tourist';
import { VARANASI_CENTER } from '../data/varanasiPlaces';

interface TouristMapProps {
  places: TouristPlace[];
  selectedPlace: TouristPlace | null;
  onSelectPlace: (place: TouristPlace) => void;
  userLocation: Coordinates;
  onSetUserLocation?: (coords: Coordinates) => void;
  routeData: RouteData | null;
  travelMode: TravelMode;
  itineraryPlaces?: TouristPlace[];
  activeNavStepIndex?: number;
}

export const TouristMap: React.FC<TouristMapProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  userLocation,
  onSetUserLocation,
  routeData,
  travelMode,
  itineraryPlaces = [],
  activeNavStepIndex,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeBorderLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [activeMapsConfig, setActiveMapsConfig] = React.useState<{
    activeKeyName: string | null;
    activeKeyMasked: string | null;
    rotationIntervalSeconds: number;
    rotationEnabled: boolean;
  } | null>(null);

  // Poll or check active Maps API key rotation state
  useEffect(() => {
    const fetchActiveKey = async () => {
      try {
        const res = await fetch('/api/maps/active-config');
        if (res.ok) {
          const data = await res.json();
          setActiveMapsConfig(data);
        }
      } catch (e) {
        // quiet fallback
      }
    };

    fetchActiveKey();
    const interval = setInterval(fetchActiveKey, 20000); // Check every 20s
    return () => clearInterval(interval);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [VARANASI_CENTER.lat, VARANASI_CENTER.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // CartoDB Voyager warm tiles - elegant for heritage city
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Attribution quietly in bottom right corner
    L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap © CARTO' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Optional click to reposition user start point if desired
    map.on('click', (e: L.LeafletMouseEvent) => {
      // If click was on map canvas
      if (onSetUserLocation && (e.originalEvent.target as HTMLElement)?.classList.contains('leaflet-container')) {
        onSetUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Places Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const isInItinerary = itineraryPlaces.some((p) => p.id === place.id);
      const itineraryIdx = itineraryPlaces.findIndex((p) => p.id === place.id);

      // Custom HTML numbered icon
      const badgeText = isInItinerary ? `${itineraryIdx + 1}` : `${place.number}`;
      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 ${
            isSelected
              ? 'bg-amber-600 text-white border-amber-300 ring-4 ring-amber-400/40'
              : isInItinerary
              ? 'bg-emerald-600 text-white border-emerald-200'
              : 'bg-stone-900 text-amber-300 border-amber-500/60'
          }">
            ${badgeText}
          </div>
          <div class="w-2 h-2 bg-amber-600 rotate-45 mx-auto -mt-1 shadow-sm ${
            isSelected ? 'bg-amber-600' : isInItinerary ? 'bg-emerald-600' : 'bg-stone-900'
          }"></div>
          ${
            isSelected
              ? `<div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-md pointer-events-none border border-stone-700">
                  ${place.name.en}
                </div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-tourist-marker',
        iconSize: [32, 38],
        iconAnchor: [16, 36],
      });

      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: customIcon });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectPlace(place);
      });

      markersLayer.addLayer(marker);
    });
  }, [places, selectedPlace, itineraryPlaces, onSelectPlace]);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-500/25 rounded-full animate-ping"></div>
          <div class="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-location-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [userLocation]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up previous route layers
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    if (routeBorderLayerRef.current) {
      routeBorderLayerRef.current.remove();
      routeBorderLayerRef.current = null;
    }

    if (routeData && routeData.geometry && routeData.geometry.length > 0) {
      const latLngs: [number, number][] = routeData.geometry.map((pt) => [pt.lat, pt.lng]);

      const isWalking = travelMode === 'walking';
      const mainColor = isWalking ? '#ea580c' : '#2563eb'; // Orange for walking / Blue for driving
      const dashArray = isWalking ? '4, 8' : undefined;

      // Outer border for high contrast against map roads
      routeBorderLayerRef.current = L.polyline(latLngs, {
        color: '#ffffff',
        weight: isWalking ? 8 : 9,
        opacity: 0.9,
      }).addTo(map);

      // Inner stroke
      routeLayerRef.current = L.polyline(latLngs, {
        color: mainColor,
        weight: isWalking ? 5 : 6,
        opacity: 0.95,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Fit bounds with padding so user sees full route
      const bounds = L.latLngBounds(latLngs);
      bounds.extend([userLocation.lat, userLocation.lng]);
      map.fitBounds(bounds, {
        paddingTopLeft: [40, 80],
        paddingBottomRight: [40, 260], // leave room for bottom details sheet
        maxZoom: 16,
      });
    }
  }, [routeData, travelMode, userLocation]);

  // Focus on selected place if changed and not currently actively routing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace) return;

    if (!routeData) {
      map.flyTo([selectedPlace.coordinates.lat, selectedPlace.coordinates.lng], 15, {
        duration: 1.0,
      });
    }
  }, [selectedPlace, routeData]);

  // Recenter controls
  const handleRecenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 0.8 });
    }
  };

  const handleFitEntireVaranasi = () => {
    if (mapInstanceRef.current) {
      const group = L.featureGroup(places.map((p) => L.marker([p.coordinates.lat, p.coordinates.lng])));
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15), { duration: 0.8 });
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Action Controls */}
      <div className="absolute right-3 top-20 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenterUser}
          className="w-10 h-10 rounded-full bg-white text-stone-800 shadow-md border border-stone-200 flex items-center justify-center hover:bg-amber-50 active:scale-95 transition-all"
          title="My Location"
          aria-label="Recenter on current location"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
        </button>

        <button
          onClick={handleFitEntireVaranasi}
          className="w-10 h-10 rounded-full bg-white text-stone-800 shadow-md border border-stone-200 flex items-center justify-center hover:bg-amber-50 active:scale-95 transition-all text-xs font-bold text-amber-800"
          title="View All Varanasi"
          aria-label="View entire Varanasi"
        >
          Kashi
        </button>

        <div className="flex flex-col rounded-full bg-white shadow-md border border-stone-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-amber-50 border-b border-stone-200 active:bg-stone-100"
            title="Zoom In"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-amber-50 active:bg-stone-100"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      {/* Discrete Maps API Key Indicator */}
      {activeMapsConfig?.activeKeyName && (
        <div className="absolute left-3 bottom-3 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-stone-700 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Maps API: {activeMapsConfig.activeKeyName}</span>
          <span className="text-stone-400">({activeMapsConfig.activeKeyMasked})</span>
          <span className="text-amber-300">
            · {Math.round(activeMapsConfig.rotationIntervalSeconds / 3600)}h rotation
          </span>
        </div>
      )}
    </div>
  );
};
