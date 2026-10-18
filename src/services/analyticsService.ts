import { Language } from '../types/tourist';

interface QueuedEvent {
  eventType: string;
  touristPlaceId?: string | null;
  metadata?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private queue: QueuedEvent[] = [];
  private flushTimeout: any = null;
  private guestUuid: string = '';
  private initialized: boolean = false;
  private consentGranted: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('kashi_privacy_consent');
      if (savedConsent !== null) {
        this.consentGranted = savedConsent === 'true';
      }
    }
  }

  public async init(lang: Language = 'en'): Promise<{
    guestUuid: string;
    isNew: boolean;
    freeCreditsRemaining: number;
    availableCredits: number;
  }> {
    if (this.initialized && this.guestUuid) {
      return {
        guestUuid: this.guestUuid,
        isNew: false,
        freeCreditsRemaining: 5,
        availableCredits: 0,
      };
    }

    try {
      const device = window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
      const res = await fetch(`/api/guest/init?lang=${lang}&device=${device}`);
      if (res.ok) {
        const data = await res.json();
        this.guestUuid = data.guestUuid;
        this.initialized = true;
        return data;
      }
    } catch (e) {
      console.warn('Analytics initialization failed:', e);
    }

    this.guestUuid = 'guest_local_' + Math.random().toString(36).substring(2, 9);
    this.initialized = true;
    return {
      guestUuid: this.guestUuid,
      isNew: true,
      freeCreditsRemaining: 5,
      availableCredits: 0,
    };
  }

  public getGuestUuid(): string {
    return this.guestUuid;
  }

  public hasConsent(): boolean {
    return this.consentGranted;
  }

  public setConsent(granted: boolean) {
    this.consentGranted = granted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kashi_privacy_consent', String(granted));
    }
  }

  public track(eventType: string, touristPlaceId?: string | null, metadata?: Record<string, any>) {
    if (!this.consentGranted) return;

    this.queue.push({
      eventType,
      touristPlaceId: touristPlaceId || null,
      metadata,
      timestamp: new Date().toISOString(),
    });

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    // Debounce flush every 1.5s to batch events efficiently
    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, 1500);
  }

  public async flush() {
    if (this.queue.length === 0) return;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (err) {
      console.warn('Failed to send batched analytics:', err);
    }
  }

  public async clearData(): Promise<boolean> {
    try {
      const res = await fetch('/api/analytics/clear-data', { method: 'POST' });
      if (res.ok) {
        this.queue = [];
        this.initialized = false;
        this.guestUuid = '';
        localStorage.removeItem('kashi_privacy_consent');
        localStorage.removeItem('kashi_tour_completed_pending');
        return true;
      }
    } catch (e) {
      console.error('Error clearing guest data:', e);
    }
    return false;
  }
}

export const analytics = new AnalyticsService();
