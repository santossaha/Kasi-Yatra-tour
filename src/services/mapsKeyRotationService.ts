import { db, MapsApiKey, MapsApiSettings, MapsKeyRotationHistory } from '../db/database';

class GoogleMapsKeyRotationService {
  private timer: any = null;

  constructor() {
    this.startRotationScheduler();
  }

  /**
   * Starts a resilient server-side interval ticker that checks
   * against the database's persistent next_rotation_due_at timestamp.
   */
  public startRotationScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    // Check every 30 seconds
    this.timer = setInterval(() => {
      this.checkAndRotateIfDue();
    }, 30000);
  }

  public checkAndRotateIfDue() {
    try {
      db.checkAndPerformScheduledRotation();
    } catch (err) {
      console.error('Error during scheduled Google Maps key rotation check:', err);
    }
  }

  public getActiveConfig(): {
    activeKeyMasked: string | null;
    activeKeyName: string | null;
    activeKeyId: string | null;
    rotationEnabled: boolean;
    rotationStrategy: string;
    rotationIntervalSeconds: number;
    nextRotationDueAt: string;
    lastRotationAt: string;
    totalEligibleKeys: number;
  } {
    const settings = db.getMapsApiSettings();
    const allKeys = db.getMapsApiKeys();
    const activeKey = allKeys.find((k) => k.id === settings.active_key_id);
    const eligibleCount = allKeys.filter((k) => k.is_enabled && k.is_eligible).length;

    return {
      activeKeyMasked: activeKey?.key_masked || null,
      activeKeyName: activeKey?.key_name || null,
      activeKeyId: activeKey?.id || null,
      rotationEnabled: settings.rotation_enabled,
      rotationStrategy: settings.rotation_strategy,
      rotationIntervalSeconds: settings.rotation_interval_seconds,
      nextRotationDueAt: settings.next_rotation_due_at,
      lastRotationAt: settings.last_rotation_at,
      totalEligibleKeys: eligibleCount,
    };
  }

  public manualRotate(reason?: string) {
    return db.rotateActiveKey('time_based', reason || 'Administrator triggered manual rotation');
  }

  public getSettings() {
    return db.getMapsApiSettings();
  }

  public updateSettings(updates: Partial<MapsApiSettings>) {
    return db.updateMapsApiSettings(updates);
  }

  public getAllKeys() {
    return db.getMapsApiKeys();
  }

  public addKey(data: {
    key_name: string;
    raw_key: string;
    key_type?: 'browser_javascript' | 'backend_routes' | 'all';
    rotation_priority?: number;
  }) {
    return db.addMapsApiKey(data);
  }

  public updateKey(id: string, updates: Partial<MapsApiKey>) {
    return db.updateMapsApiKey(id, updates);
  }

  public deleteKey(id: string) {
    return db.deleteMapsApiKey(id);
  }

  public validateKey(id: string) {
    return db.validateMapsApiKey(id);
  }

  public getHistory() {
    return db.getMapsRotationHistory();
  }
}

export const mapsKeyRotationService = new GoogleMapsKeyRotationService();
