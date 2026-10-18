import { Coordinates, TouristPlace } from '../types/tourist';
import { VARANASI_PLACES } from '../data/varanasiPlaces';
import { calculateHaversineDistanceKm } from './routingService';

export type ShareType = 'snapshot' | 'live';

export interface ActiveShareSession {
  shareToken: string;
  senderSecret: string;
  shareUrl: string;
  shareType: ShareType;
  senderName: string;
  expiresAt: string;
  durationMinutes: number;
  lastUpdatedAt: string;
  updateCount: number;
}

export interface SharedLocationPayload {
  share: {
    id: string;
    share_token: string;
    share_type: 'snapshot' | 'live';
    status: 'active' | 'paused' | 'ended' | 'expired';
    sender_name: string;
    duration_seconds: number;
    started_at: string;
    expires_at: string;
    ended_at: string | null;
    last_updated_at: string;
    update_count: number;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy_meters: number;
    heading: number | null;
    speed: number | null;
    captured_at: string;
  } | null;
}

const STORAGE_KEY = 'kashi_active_location_share';

class LocationShareService {
  private activeSession: ActiveShareSession | null = null;
  private watchId: number | null = null;
  private intervalTimer: any = null;
  private updateListeners: ((session: ActiveShareSession) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ActiveShareSession;
        // Check if expired
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          this.activeSession = parsed;
          if (parsed.shareType === 'live') {
            this.startLiveTrackingBackground();
          }
        } else {
          this.clearStorage();
        }
      }
    } catch (e) {
      this.clearStorage();
    }
  }

  public getActiveSession(): ActiveShareSession | null {
    if (!this.activeSession) return null;
    if (new Date(this.activeSession.expiresAt).getTime() <= Date.now()) {
      this.clearStorage();
      return null;
    }
    return this.activeSession;
  }

  public onSessionChange(listener: (session: ActiveShareSession | null) => void) {
    const notify = () => listener(this.getActiveSession());
    this.updateListeners.push(notify);
    return () => {
      this.updateListeners = this.updateListeners.filter((l) => l !== notify);
    };
  }

  private notifyListeners() {
    const session = this.getActiveSession();
    this.updateListeners.forEach((fn) => fn(session as any));
  }

  public async createShare(params: {
    shareType: ShareType;
    durationMinutes: number;
    senderName?: string;
    coordinates: Coordinates;
    accuracyMeters?: number;
    heading?: number;
    speed?: number;
  }): Promise<ActiveShareSession> {
    const res = await fetch('/api/location-share/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shareType: params.shareType,
        durationMinutes: params.durationMinutes,
        senderName: params.senderName || 'Kashi Pilgrim',
        latitude: params.coordinates.lat,
        longitude: params.coordinates.lng,
        accuracyMeters: params.accuracyMeters || 15,
        heading: params.heading,
        speed: params.speed,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create location share');
    }

    const data = await res.json();
    const session: ActiveShareSession = {
      shareToken: data.shareToken,
      senderSecret: data.senderSecret,
      shareUrl: data.shareUrl,
      shareType: data.shareType,
      senderName: data.senderName,
      expiresAt: data.expiresAt,
      durationMinutes: data.durationMinutes,
      lastUpdatedAt: new Date().toISOString(),
      updateCount: 1,
    };

    this.activeSession = session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.notifyListeners();

    if (session.shareType === 'live') {
      this.startLiveTrackingBackground();
    }

    return session;
  }

  private startLiveTrackingBackground() {
    this.stopTrackingOnly();

    // 1. Geolocation watchPosition
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.pushLocationUpdate({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading || undefined,
            speed: pos.coords.speed || undefined,
          });
        },
        (err) => {
          console.warn('Geolocation watchPosition warning:', err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );
    }

    // 2. Periodic heartbeat ping (every 12 seconds)
    this.intervalTimer = setInterval(() => {
      if (!this.activeSession) {
        this.stopTrackingOnly();
        return;
      }
      if (new Date(this.activeSession.expiresAt).getTime() <= Date.now()) {
        this.stopShare();
        return;
      }
      // Re-query current position if watchPosition is dormant
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.pushLocationUpdate({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              heading: pos.coords.heading || undefined,
              speed: pos.coords.speed || undefined,
            });
          },
          undefined,
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }, 12000);
  }

  private async pushLocationUpdate(loc: {
    lat: number;
    lng: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
  }) {
    if (!this.activeSession) return;

    try {
      const res = await fetch(`/api/location-share/${this.activeSession.shareToken}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderSecret: this.activeSession.senderSecret,
          latitude: loc.lat,
          longitude: loc.lng,
          accuracyMeters: Math.round(loc.accuracy || 10),
          heading: loc.heading,
          speed: loc.speed,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (this.activeSession) {
          this.activeSession.lastUpdatedAt = new Date().toISOString();
          this.activeSession.updateCount = (this.activeSession.updateCount || 0) + 1;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.activeSession));
          this.notifyListeners();
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === 'SESSION_EXPIRED' || errData.error === 'SHARING_ENDED') {
          this.clearStorage();
          this.notifyListeners();
        }
      }
    } catch (e) {
      console.warn('Failed to push live location update:', e);
    }
  }

  public async stopShare(): Promise<boolean> {
    const session = this.activeSession;
    this.stopTrackingOnly();
    this.clearStorage();
    this.notifyListeners();

    if (!session) return true;

    try {
      const res = await fetch(`/api/location-share/${session.shareToken}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderSecret: session.senderSecret }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Error reporting stop share to server:', e);
      return false;
    }
  }

  private stopTrackingOnly() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private clearStorage() {
    this.activeSession = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  public async fetchSharedLocation(token: string): Promise<{
    success: boolean;
    data?: SharedLocationPayload;
    error?: string;
  }> {
    try {
      const res = await fetch(`/api/location-share/${token}`);
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || data.message || 'Share not found or expired' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error fetching shared location' };
    }
  }

  public findNearestLandmark(coords: Coordinates): {
    place: TouristPlace;
    distanceMeters: number;
    distanceText: string;
  } | null {
    if (!coords || !coords.lat || !coords.lng) return null;
    let closest: TouristPlace | null = null;
    let minDistanceKm = Infinity;

    for (const place of VARANASI_PLACES) {
      const dist = calculateHaversineDistanceKm(coords, place.coordinates);
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
        closest = place;
      }
    }

    if (!closest) return null;

    const meters = Math.round(minDistanceKm * 1000);
    const distanceText = meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;

    return {
      place: closest,
      distanceMeters: meters,
      distanceText,
    };
  }
}

export const locationShareService = new LocationShareService();
