export type Language = 'en' | 'hi';

export type PlaceCategory = 'temple' | 'ghat' | 'historical' | 'culture' | 'museum';

export type TravelMode = 'walking' | 'driving';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TouristPlace {
  id: string;
  number: number;
  name: {
    en: string;
    hi: string;
  };
  subtitle: {
    en: string;
    hi: string;
  };
  category: PlaceCategory;
  coordinates: Coordinates;
  image: string;
  shortIntro: {
    en: string;
    hi: string;
  };
  historicalBackground: {
    en: string;
    hi: string;
  };
  periodDocumented: {
    en: string;
    hi: string;
  };
  religiousSignificance?: {
    en: string;
    hi: string;
  };
  architecturalFeatures: {
    en: string;
    hi: string;
  };
  interestingFacts: {
    en: string[];
    hi: string[];
  };
  visitingHours: {
    en: string;
    hi: string;
  };
  aartiTimings?: {
    en: string;
    hi: string;
  };
  entryFee: {
    en: string;
    hi: string;
  };
  accessibilityNotes: {
    en: string;
    hi: string;
  };
  travelModeSuitability: {
    walking: {
      en: string;
      hi: string;
    };
    driving: {
      en: string;
      hi: string;
    };
  };
  wikipediaUrl: {
    en: string;
    hi: string;
  };
  sources: string[];
  suggestedDurationMinutes: number;
  rating: number;
  highlightTag?: {
    en: string;
    hi: string;
  };
  dressCode?: {
    en: string;
    hi: string;
  };
  dosAndDonts?: {
    en: string[];
    hi: string[];
  };
  emergencyHelp?: {
    en: string;
    hi: string;
  };
  sourceAttribution?: {
    officialUrl?: string;
    sourceTitle?: string;
  };
  status?: 'active' | 'inactive' | 'under_renovation';
  created_at?: string;
  updated_at?: string;
}

export interface NavigationStep {
  instruction: {
    en: string;
    hi: string;
  };
  distanceMeters: number;
  durationSeconds: number;
  maneuver: 'depart' | 'turn-left' | 'turn-right' | 'continue' | 'arrive' | 'slight-left' | 'slight-right';
  coordinates: Coordinates;
}

export interface RouteData {
  distanceMeters: number;
  durationSeconds: number;
  mode: TravelMode;
  geometry: Coordinates[];
  steps: NavigationStep[];
  originName: string;
  destinationName: string;
}

export interface UserLocationState {
  coordinates: Coordinates;
  accuracy?: number;
  isCustomSelected: boolean;
  isInsideVaranasi: boolean;
  permissionGranted: boolean;
  loading: boolean;
  error?: string | null;
}
