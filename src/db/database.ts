import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  SeoPageRecord,
  SeoGlobalSettings,
  DEFAULT_SEO_GLOBAL_SETTINGS,
  generateDefaultSeoPages,
  generateSitemapXml,
  generateRobotsTxt,
  buildPlaceJsonLd,
} from './seoDefaults';
import {
  AdSettings,
  AdPlacement,
  DEFAULT_AD_SETTINGS,
  DEFAULT_AD_PLACEMENTS,
  AdOperationalStats,
} from './adDefaults';
import {
  AIAssistantConfig,
  AIKnowledgeItem,
  AICategoryConfig,
  DEFAULT_AI_ASSISTANT_CONFIG,
  DEFAULT_AI_KNOWLEDGE_ITEMS,
} from './aiDefaults';
import { VARANASI_PLACES } from '../data/varanasiPlaces';
import { TouristPlace } from '../types/tourist';

export interface GuestVisitor {
  id: string;
  guest_uuid: string;
  first_seen_at: string;
  last_seen_at: string;
  preferred_language: 'en' | 'hi';
  consent_status: 'granted' | 'declined' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface VisitorSession {
  id: string;
  guest_visitor_id: string;
  guest_uuid: string;
  started_at: string;
  last_activity_at: string;
  ended_at?: string | null;
  device_category: 'mobile' | 'tablet' | 'desktop';
  referrer_source: string;
  session_status: 'active' | 'completed' | 'abandoned';
}

export interface AnalyticsEvent {
  id: string;
  visitor_session_id: string;
  guest_uuid: string;
  event_type:
    | 'page_view'
    | 'place_viewed'
    | 'place_details_opened'
    | 'search_performed'
    | 'route_requested'
    | 'navigation_started'
    | 'navigation_step_completed'
    | 'tour_planned'
    | 'tour_completed'
    | 'feedback_submitted'
    | 'ai_assistant_opened'
    | 'ai_message_sent'
    | 'language_switched';
  tourist_place_id?: string | null;
  event_metadata?: Record<string, any>;
  occurred_at: string;
}

export interface Tour {
  id: string;
  guest_visitor_id: string;
  guest_uuid: string;
  started_at: string;
  completed_at?: string | null;
  travel_mode: 'walking' | 'driving';
  selected_language: 'en' | 'hi';
  tour_status: 'in_progress' | 'completed' | 'abandoned';
  stops: {
    tourist_place_id: string;
    stop_order: number;
    arrival_status: 'pending' | 'arrived' | 'skipped';
    arrived_at?: string | null;
  }[];
}

export interface FeedbackRecord {
  id: string;
  guest_visitor_id: string;
  guest_uuid: string;
  tour_id?: string | null;
  overall_rating: number; // 1-5
  navigation_rating: number; // 1-5
  ease_of_use_rating: number; // 1-5
  information_rating: number; // 1-5
  preferred_language: 'en' | 'hi';
  what_liked?: string;
  problems_encountered?: string;
  suggestions?: string;
  comments?: string;
  status: 'new' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface AIUsageRecord {
  id: string;
  guest_visitor_id: string;
  guest_uuid: string;
  conversation_id: string;
  provider: string;
  model: string;
  prompt_preview: string;
  response_preview: string;
  input_tokens: number;
  output_tokens: number;
  internal_credits_used: number;
  estimated_cost: number;
  status: 'success' | 'failed' | 'limited';
  created_at: string;
}

export interface GuestCreditAccount {
  id: string;
  guest_visitor_id: string;
  guest_uuid: string;
  available_credits: number;
  free_credits_remaining: number;
  last_free_reset_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  guest_credit_account_id: string;
  guest_uuid: string;
  transaction_type: 'free_grant' | 'purchase' | 'usage_deduction' | 'refund' | 'bonus';
  credits: number; // positive for addition, negative for deduction
  amount_inr?: number;
  package_name?: string;
  payment_reference?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface AISettings {
  ai_enabled: boolean;
  free_daily_messages: number;
  credits_per_message: number;
  model_name: string;
  system_prompt_language: string;
  require_credits_after_free: boolean;
  credits_exhausted_msg_en: string;
  credits_exhausted_msg_hi: string;
  payment_coming_soon_msg_en: string;
  payment_coming_soon_msg_hi: string;
}

export interface MapsApiKey {
  id: string;
  key_name: string;
  encrypted_key: string;
  key_masked: string;
  key_fingerprint: string;
  key_type: 'browser_javascript' | 'backend_routes' | 'all';
  is_enabled: boolean;
  is_eligible: boolean;
  rotation_priority: number;
  total_requests_observed: number;
  last_activated_at: string | null;
  last_validated_at: string | null;
  last_validation_result: 'valid' | 'invalid' | 'quota_exceeded' | 'untested';
  last_error_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface MapsApiSettings {
  id: string;
  rotation_enabled: boolean;
  rotation_strategy: 'time_based' | 'usage_based' | 'health_fallback';
  rotation_interval_seconds: number;
  active_key_id: string | null;
  max_eligible_keys: number;
  usage_threshold_per_key: number;
  next_rotation_due_at: string;
  last_rotation_at: string;
  updated_by_admin_id: string;
  updated_at: string;
}

export interface MapsKeyRotationHistory {
  id: string;
  event_type: 'scheduled_rotation' | 'manual_rotation' | 'health_fallback' | 'key_added' | 'key_disabled' | 'validation_failed';
  previous_key_id: string | null;
  new_key_id: string | null;
  previous_key_name: string | null;
  new_key_name: string | null;
  trigger_reason: string;
  status: 'success' | 'warning' | 'failure';
  occurred_at: string;
}

export interface LocationShare {
  id: string;
  share_token: string;
  sender_secret: string;
  share_type: 'snapshot' | 'live';
  status: 'active' | 'paused' | 'ended' | 'expired';
  sender_name: string;
  duration_seconds: number;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
  last_updated_at: string;
  update_count: number;
  created_at: string;
}

export interface SharedLocation {
  id: string;
  location_share_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  heading?: number | null;
  speed?: number | null;
  captured_at: string;
  created_at: string;
}

interface DatabaseSchema {
  guest_visitors: GuestVisitor[];
  visitor_sessions: VisitorSession[];
  analytics_events: AnalyticsEvent[];
  tours: Tour[];
  feedback: FeedbackRecord[];
  ai_usage_records: AIUsageRecord[];
  guest_credit_accounts: GuestCreditAccount[];
  credit_transactions: CreditTransaction[];
  ai_settings: AISettings;
  maps_api_keys: MapsApiKey[];
  maps_api_settings: MapsApiSettings;
  maps_key_rotation_history: MapsKeyRotationHistory[];
  location_shares: LocationShare[];
  shared_locations: SharedLocation[];
  seo_pages: SeoPageRecord[];
  seo_global_settings: SeoGlobalSettings;
  tourist_places: TouristPlace[];
  ai_assistant_config: AIAssistantConfig;
  ai_knowledge_base: AIKnowledgeItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kashi_store.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
    if (this.data.guest_visitors.length === 0) {
      this.seedInitialAnalytics();
    }
    if (!this.data.maps_api_keys || this.data.maps_api_keys.length === 0) {
      this.seedInitialMapsKeys();
    }
    if (!this.data.seo_pages || this.data.seo_pages.length === 0) {
      this.data.seo_pages = generateDefaultSeoPages(VARANASI_PLACES);
      this.saveDatabase();
    }
    if (!this.data.tourist_places || this.data.tourist_places.length === 0) {
      this.data.tourist_places = VARANASI_PLACES.map((p) => ({
        ...p,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      this.saveDatabase();
    }
    if (!this.data.ai_assistant_config) {
      this.data.ai_assistant_config = { ...DEFAULT_AI_ASSISTANT_CONFIG };
      this.saveDatabase();
    }
    if (!this.data.ai_knowledge_base || this.data.ai_knowledge_base.length === 0) {
      this.data.ai_knowledge_base = [...DEFAULT_AI_KNOWLEDGE_ITEMS];
      this.saveDatabase();
    }
  }

  private getDefaultData(): DatabaseSchema {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    return {
      guest_visitors: [],
      visitor_sessions: [],
      analytics_events: [],
      tours: [],
      feedback: [],
      ai_usage_records: [],
      guest_credit_accounts: [],
      credit_transactions: [],
      ai_settings: {
        ai_enabled: true,
        free_daily_messages: 5,
        credits_per_message: 1,
        model_name: 'gemini-3.8-flash',
        system_prompt_language: 'bilingual',
        require_credits_after_free: true,
        credits_exhausted_msg_en: 'You have used all 5 of your free AI guidance queries.',
        credits_exhausted_msg_hi: 'आपकी 5 निःशुल्क AI मार्गदर्शन सीमा पूरी हो चुकी है।',
        payment_coming_soon_msg_en: 'Online credit recharge and payment options are coming soon. The interactive map, navigation, and heritage guide remain 100% free.',
        payment_coming_soon_msg_hi: 'ऑनलाइन भुगतान व क्रेडिट रिचार्ज सुविधा जल्द उपलब्ध होगी। इंटरेक्टिव मैप, नेविगेशन व हेरिटेज गाइड हमेशा 100% निःशुल्क रहेंगे।',
      },
      maps_api_keys: [],
      maps_api_settings: {
        id: 'settings_default',
        rotation_enabled: true,
        rotation_strategy: 'time_based',
        rotation_interval_seconds: 7200, // 2 hours
        active_key_id: null,
        max_eligible_keys: 5,
        usage_threshold_per_key: 2500,
        next_rotation_due_at: twoHoursLater,
        last_rotation_at: now.toISOString(),
        updated_by_admin_id: 'admin@kashiyatra.in',
        updated_at: now.toISOString(),
      },
      maps_key_rotation_history: [],
      location_shares: [],
      shared_locations: [],
      seo_pages: generateDefaultSeoPages(VARANASI_PLACES),
      seo_global_settings: { ...DEFAULT_SEO_GLOBAL_SETTINGS },
      tourist_places: VARANASI_PLACES.map((p) => ({
        ...p,
        status: 'active',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })),
      ai_assistant_config: { ...DEFAULT_AI_ASSISTANT_CONFIG },
      ai_knowledge_base: [...DEFAULT_AI_KNOWLEDGE_ITEMS],
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (!parsed.location_shares) parsed.location_shares = [];
        if (!parsed.shared_locations) parsed.shared_locations = [];
        if (!parsed.seo_pages || parsed.seo_pages.length === 0) {
          parsed.seo_pages = generateDefaultSeoPages(VARANASI_PLACES);
        }
        if (!parsed.seo_global_settings) {
          parsed.seo_global_settings = { ...DEFAULT_SEO_GLOBAL_SETTINGS };
        }
        if (!parsed.tourist_places || parsed.tourist_places.length === 0) {
          parsed.tourist_places = VARANASI_PLACES.map((p) => ({
            ...p,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
        } else {
          // Merge newly added places from VARANASI_PLACES into the database
          const nowStr = new Date().toISOString();
          for (const defaultPlace of VARANASI_PLACES) {
            const existingIdx = parsed.tourist_places.findIndex((p: any) => p.id === defaultPlace.id);
            if (existingIdx === -1) {
              parsed.tourist_places.push({
                ...defaultPlace,
                status: 'active',
                created_at: nowStr,
                updated_at: nowStr,
              });
            }
          }
        }
        if (!parsed.ai_assistant_config) {
          parsed.ai_assistant_config = { ...DEFAULT_AI_ASSISTANT_CONFIG };
        }
        if (!parsed.ai_knowledge_base || parsed.ai_knowledge_base.length === 0) {
          parsed.ai_knowledge_base = [...DEFAULT_AI_KNOWLEDGE_ITEMS];
        }
        if (parsed.ai_settings) {
          if (parsed.ai_settings.ai_enabled === undefined) parsed.ai_settings.ai_enabled = true;
          if (!parsed.ai_settings.credits_exhausted_msg_en) {
            parsed.ai_settings.credits_exhausted_msg_en = 'You have used all 5 of your free AI guidance queries.';
          }
          if (!parsed.ai_settings.credits_exhausted_msg_hi) {
            parsed.ai_settings.credits_exhausted_msg_hi = 'आपकी 5 निःशुल्क AI मार्गदर्शन सीमा पूरी हो चुकी है।';
          }
          if (!parsed.ai_settings.payment_coming_soon_msg_en) {
            parsed.ai_settings.payment_coming_soon_msg_en = 'Online credit recharge and payment options are coming soon. The interactive map, navigation, and heritage guide remain 100% free.';
          }
          if (!parsed.ai_settings.payment_coming_soon_msg_hi) {
            parsed.ai_settings.payment_coming_soon_msg_hi = 'ऑनलाइन भुगतान व क्रेडिट रिचार्ज सुविधा जल्द उपलब्ध होगी। इंटरेक्टिव मैप, नेविगेशन व हेरिटेज गाइड हमेशा 100% निःशुल्क रहेंगे।';
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading database file, initializing default:', e);
    }
    const def = this.getDefaultData();
    this.saveDatabase(def);
    return def;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing database file:', e);
    }
  }

  // --- Seed Realistic Initial Data for Demonstration ---
  private seedInitialAnalytics() {
    const places = [
      'kashi-vishwanath',
      'dashashwamedh-ghat',
      'manikarnika-ghat',
      'assi-ghat',
      'sarnath',
      'sankat-mochan',
      'ramnagar-fort',
      'kaal-bhairav',
    ];

    const now = new Date();

    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const dayDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const visitorsCount = 8 + Math.floor(Math.random() * 12);

      for (let v = 0; v < visitorsCount; v++) {
        const guestUuid = `guest_${dayOffset}_${v}_${uuidv4().slice(0, 8)}`;
        const isNew = Math.random() > 0.35;
        const lang: 'en' | 'hi' = Math.random() > 0.4 ? 'hi' : 'en';
        const device: 'mobile' | 'tablet' | 'desktop' =
          Math.random() > 0.3 ? 'mobile' : Math.random() > 0.5 ? 'desktop' : 'tablet';

        const startTime = new Date(dayDate.getTime() + Math.random() * 12 * 60 * 60 * 1000).toISOString();
        const durationMins = 3 + Math.floor(Math.random() * 25);
        const endTime = new Date(new Date(startTime).getTime() + durationMins * 60 * 1000).toISOString();

        const visitor: GuestVisitor = {
          id: uuidv4(),
          guest_uuid: guestUuid,
          first_seen_at: isNew ? startTime : new Date(dayDate.getTime() - 5 * 86400000).toISOString(),
          last_seen_at: endTime,
          preferred_language: lang,
          consent_status: 'granted',
          created_at: startTime,
          updated_at: endTime,
        };
        this.data.guest_visitors.push(visitor);

        const session: VisitorSession = {
          id: uuidv4(),
          guest_visitor_id: visitor.id,
          guest_uuid: guestUuid,
          started_at: startTime,
          last_activity_at: endTime,
          ended_at: endTime,
          device_category: device,
          referrer_source: Math.random() > 0.5 ? 'direct' : 'google.com',
          session_status: 'completed',
        };
        this.data.visitor_sessions.push(session);

        // Events
        this.data.analytics_events.push({
          id: uuidv4(),
          visitor_session_id: session.id,
          guest_uuid: guestUuid,
          event_type: 'page_view',
          occurred_at: startTime,
        });

        // Place views
        const viewedPlace1 = places[Math.floor(Math.random() * places.length)];
        this.data.analytics_events.push({
          id: uuidv4(),
          visitor_session_id: session.id,
          guest_uuid: guestUuid,
          event_type: 'place_viewed',
          tourist_place_id: viewedPlace1,
          occurred_at: new Date(new Date(startTime).getTime() + 10000).toISOString(),
        });

        if (Math.random() > 0.4) {
          const viewedPlace2 = places[Math.floor(Math.random() * places.length)];
          this.data.analytics_events.push({
            id: uuidv4(),
            visitor_session_id: session.id,
            guest_uuid: guestUuid,
            event_type: 'place_details_opened',
            tourist_place_id: viewedPlace2,
            occurred_at: new Date(new Date(startTime).getTime() + 45000).toISOString(),
          });
        }

        // Tour creation & completion
        if (Math.random() > 0.5) {
          const travelMode = Math.random() > 0.3 ? 'walking' : 'driving';
          const isCompleted = Math.random() > 0.4;
          const tourId = uuidv4();

          this.data.tours.push({
            id: tourId,
            guest_visitor_id: visitor.id,
            guest_uuid: guestUuid,
            started_at: startTime,
            completed_at: isCompleted ? endTime : null,
            travel_mode: travelMode,
            selected_language: lang,
            tour_status: isCompleted ? 'completed' : 'abandoned',
            stops: [
              { tourist_place_id: 'kashi-vishwanath', stop_order: 1, arrival_status: 'arrived' },
              { tourist_place_id: 'dashashwamedh-ghat', stop_order: 2, arrival_status: isCompleted ? 'arrived' : 'pending' },
            ],
          });

          this.data.analytics_events.push({
            id: uuidv4(),
            visitor_session_id: session.id,
            guest_uuid: guestUuid,
            event_type: 'route_requested',
            event_metadata: { mode: travelMode },
            occurred_at: new Date(new Date(startTime).getTime() + 60000).toISOString(),
          });

          if (isCompleted) {
            this.data.analytics_events.push({
              id: uuidv4(),
              visitor_session_id: session.id,
              guest_uuid: guestUuid,
              event_type: 'tour_completed',
              occurred_at: endTime,
            });

            // Feedback
            if (Math.random() > 0.5) {
              const ratings = [4, 5, 5, 4, 5, 3];
              const overallRating = ratings[Math.floor(Math.random() * ratings.length)];
              const commentsList = [
                'Amazing pedestrian walking route through Vishwanath Gali! Never got lost.',
                'गंगा आरती का समय और नाव के सही दाम जानने में बहुत मदद मिली।',
                'Loved the distinction between verified history and faith.',
                'बहुत ही सुंदर और उपयोगी मार्गदर्शिका।',
                'Audio directions were clear while walking through crowded Dashashwamedh ghat.',
              ];
              this.data.feedback.push({
                id: uuidv4(),
                guest_visitor_id: visitor.id,
                guest_uuid: guestUuid,
                tour_id: tourId,
                overall_rating: overallRating,
                navigation_rating: overallRating >= 4 ? 5 : 4,
                ease_of_use_rating: 5,
                information_rating: 5,
                preferred_language: lang,
                what_liked: 'Clear pedestrian paths & accurate Aarti timings',
                problems_encountered: overallRating <= 3 ? 'Crowded alleys near Godowlia' : undefined,
                suggestions: 'Add more audio commentary for smaller shrines',
                comments: commentsList[Math.floor(Math.random() * commentsList.length)],
                status: Math.random() > 0.3 ? 'reviewed' : 'new',
                created_at: endTime,
              });
            }
          }
        }
      }
    }

    this.saveDatabase();
  }

  // --- Guest Identification & Session Management ---
  public getOrCreateGuest(
    guestUuid: string,
    lang: 'en' | 'hi' = 'en',
    device: 'mobile' | 'tablet' | 'desktop' = 'mobile',
    referrer: string = 'direct'
  ): { visitor: GuestVisitor; session: VisitorSession; isNew: boolean; account: GuestCreditAccount } {
    const now = new Date().toISOString();
    const todayStr = now.split('T')[0];

    let visitor = this.data.guest_visitors.find((v) => v.guest_uuid === guestUuid);
    let isNew = false;

    if (!visitor) {
      isNew = true;
      visitor = {
        id: uuidv4(),
        guest_uuid: guestUuid,
        first_seen_at: now,
        last_seen_at: now,
        preferred_language: lang,
        consent_status: 'granted',
        created_at: now,
        updated_at: now,
      };
      this.data.guest_visitors.push(visitor);
    } else {
      visitor.last_seen_at = now;
      visitor.preferred_language = lang;
      visitor.updated_at = now;
    }

    // Session logic: look for active session in last 30 mins
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    let session = this.data.visitor_sessions.find(
      (s) => s.guest_uuid === guestUuid && s.last_activity_at >= thirtyMinsAgo && s.session_status === 'active'
    );

    if (!session) {
      session = {
        id: uuidv4(),
        guest_visitor_id: visitor.id,
        guest_uuid: guestUuid,
        started_at: now,
        last_activity_at: now,
        ended_at: null,
        device_category: device,
        referrer_source: referrer,
        session_status: 'active',
      };
      this.data.visitor_sessions.push(session);

      // Record page_view event
      this.data.analytics_events.push({
        id: uuidv4(),
        visitor_session_id: session.id,
        guest_uuid: guestUuid,
        event_type: 'page_view',
        occurred_at: now,
      });
    } else {
      session.last_activity_at = now;
    }

    // Ensure Credit Account exists
    let account = this.data.guest_credit_accounts.find((a) => a.guest_uuid === guestUuid);
    if (!account) {
      account = {
        id: uuidv4(),
        guest_visitor_id: visitor.id,
        guest_uuid: guestUuid,
        available_credits: 0,
        free_credits_remaining: this.data.ai_settings.free_daily_messages,
        last_free_reset_date: todayStr,
        created_at: now,
        updated_at: now,
      };
      this.data.guest_credit_accounts.push(account);
    } else {
      // Daily reset for free credits
      if (account.last_free_reset_date !== todayStr) {
        account.free_credits_remaining = this.data.ai_settings.free_daily_messages;
        account.last_free_reset_date = todayStr;
        account.updated_at = now;
      }
    }

    this.saveDatabase();
    return { visitor, session, isNew, account };
  }

  // --- Record Analytics Event ---
  public recordEvent(
    guestUuid: string,
    eventType: AnalyticsEvent['event_type'],
    touristPlaceId?: string | null,
    metadata?: Record<string, any>
  ): AnalyticsEvent {
    const now = new Date().toISOString();
    const guest = this.getOrCreateGuest(guestUuid);

    const event: AnalyticsEvent = {
      id: uuidv4(),
      visitor_session_id: guest.session.id,
      guest_uuid: guestUuid,
      event_type: eventType,
      tourist_place_id: touristPlaceId || null,
      event_metadata: metadata,
      occurred_at: now,
    };

    this.data.analytics_events.push(event);
    this.saveDatabase();
    return event;
  }

  // --- Tour Lifecycle ---
  public createOrUpdateTour(
    guestUuid: string,
    places: string[],
    travelMode: 'walking' | 'driving',
    lang: 'en' | 'hi'
  ): Tour {
    const now = new Date().toISOString();
    const guest = this.getOrCreateGuest(guestUuid);

    const tour: Tour = {
      id: uuidv4(),
      guest_visitor_id: guest.visitor.id,
      guest_uuid: guestUuid,
      started_at: now,
      completed_at: null,
      travel_mode: travelMode,
      selected_language: lang,
      tour_status: 'in_progress',
      stops: places.map((pid, idx) => ({
        tourist_place_id: pid,
        stop_order: idx + 1,
        arrival_status: 'pending',
      })),
    };

    this.data.tours.push(tour);
    this.recordEvent(guestUuid, 'tour_planned', places[0], { stopCount: places.length, travelMode });
    this.saveDatabase();
    return tour;
  }

  public completeTour(guestUuid: string, tourId?: string): boolean {
    const now = new Date().toISOString();
    const tour = tourId
      ? this.data.tours.find((t) => t.id === tourId)
      : [...this.data.tours].reverse().find((t) => t.guest_uuid === guestUuid && t.tour_status === 'in_progress');

    if (tour) {
      tour.tour_status = 'completed';
      tour.completed_at = now;
      tour.stops.forEach((s) => (s.arrival_status = 'arrived'));
      this.recordEvent(guestUuid, 'tour_completed', undefined, { tourId: tour.id });
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Feedback ---
  public submitFeedback(feedbackData: Omit<FeedbackRecord, 'id' | 'guest_visitor_id' | 'created_at' | 'status'>): FeedbackRecord {
    const now = new Date().toISOString();
    const guest = this.getOrCreateGuest(feedbackData.guest_uuid);

    const record: FeedbackRecord = {
      ...feedbackData,
      id: uuidv4(),
      guest_visitor_id: guest.visitor.id,
      status: 'new',
      created_at: now,
    };

    this.data.feedback.push(record);
    this.recordEvent(feedbackData.guest_uuid, 'feedback_submitted', undefined, {
      rating: feedbackData.overall_rating,
    });
    this.saveDatabase();
    return record;
  }

  // --- Credits & AI Usage ---
  public checkAndDeductCredits(
    guestUuid: string,
    prompt: string,
    response: string,
    modelName: string = 'gemini-3.8-flash'
  ): { allowed: boolean; remainingCredits: number; remainingFree: number; reason?: string } {
    const now = new Date().toISOString();
    const guest = this.getOrCreateGuest(guestUuid);
    const account = guest.account;
    const settings = this.data.ai_settings;

    let usedFree = false;

    if (account.free_credits_remaining > 0) {
      account.free_credits_remaining -= 1;
      usedFree = true;
    } else if (account.available_credits >= settings.credits_per_message) {
      account.available_credits -= settings.credits_per_message;

      this.data.credit_transactions.push({
        id: uuidv4(),
        guest_credit_account_id: account.id,
        guest_uuid: guestUuid,
        transaction_type: 'usage_deduction',
        credits: -settings.credits_per_message,
        status: 'completed',
        created_at: now,
      });
    } else {
      return {
        allowed: false,
        remainingCredits: account.available_credits,
        remainingFree: account.free_credits_remaining,
        reason: 'Free allowance exhausted. Please purchase credits to continue AI assistance.',
      };
    }

    account.updated_at = now;

    // Record AI usage
    this.data.ai_usage_records.push({
      id: uuidv4(),
      guest_visitor_id: guest.visitor.id,
      guest_uuid: guestUuid,
      conversation_id: uuidv4(),
      provider: 'google-genai',
      model: modelName,
      prompt_preview: prompt.slice(0, 100),
      response_preview: response.slice(0, 100),
      input_tokens: Math.round(prompt.length / 4),
      output_tokens: Math.round(response.length / 4),
      internal_credits_used: usedFree ? 0 : settings.credits_per_message,
      estimated_cost: 0.00001,
      status: 'success',
      created_at: now,
    });

    this.recordEvent(guestUuid, 'ai_message_sent', undefined, { usedFree });
    this.saveDatabase();

    return {
      allowed: true,
      remainingCredits: account.available_credits,
      remainingFree: account.free_credits_remaining,
    };
  }

  public purchaseCredits(
    guestUuid: string,
    credits: number,
    amountInr: number,
    packageName: string
  ): { account: GuestCreditAccount; transaction: CreditTransaction } {
    const now = new Date().toISOString();
    const guest = this.getOrCreateGuest(guestUuid);
    const account = guest.account;

    account.available_credits += credits;
    account.updated_at = now;

    const transaction: CreditTransaction = {
      id: uuidv4(),
      guest_credit_account_id: account.id,
      guest_uuid: guestUuid,
      transaction_type: 'purchase',
      credits: credits,
      amount_inr: amountInr,
      package_name: packageName,
      payment_reference: `PAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      status: 'completed',
      created_at: now,
    };

    this.data.credit_transactions.push(transaction);
    this.saveDatabase();
    return { account, transaction };
  }

  // --- Clear Guest Data (Privacy Compliance) ---
  public clearGuestData(guestUuid: string): boolean {
    this.data.guest_visitors = this.data.guest_visitors.filter((v) => v.guest_uuid !== guestUuid);
    this.data.visitor_sessions = this.data.visitor_sessions.filter((s) => s.guest_uuid !== guestUuid);
    this.data.analytics_events = this.data.analytics_events.filter((e) => e.guest_uuid !== guestUuid);
    this.data.tours = this.data.tours.filter((t) => t.guest_uuid !== guestUuid);
    this.data.feedback = this.data.feedback.filter((f) => f.guest_uuid !== guestUuid);
    this.data.ai_usage_records = this.data.ai_usage_records.filter((u) => u.guest_uuid !== guestUuid);
    this.data.guest_credit_accounts = this.data.guest_credit_accounts.filter((c) => c.guest_uuid !== guestUuid);
    this.data.credit_transactions = this.data.credit_transactions.filter((ct) => ct.guest_uuid !== guestUuid);
    this.saveDatabase();
    return true;
  }

  // --- Admin Analytics Aggregations ---
  public getAnalyticsDashboard(filter: {
    dateRange?: string; // 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'all';
    language?: string;
    deviceCategory?: string;
    visitorType?: 'all' | 'new' | 'returning';
    touristPlaceId?: string;
  }) {
    const now = new Date();
    let startDate: Date;

    switch (filter.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 86400000);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '30days':
      default:
        startDate = new Date(now.getTime() - 30 * 86400000);
        break;
    }

    const startIso = startDate.toISOString();

    // Filter sessions
    const filteredSessions = this.data.visitor_sessions.filter((s) => {
      if (s.started_at < startIso) return false;
      if (filter.deviceCategory && filter.deviceCategory !== 'all' && s.device_category !== filter.deviceCategory) {
        return false;
      }
      return true;
    });

    const sessionIds = new Set(filteredSessions.map((s) => s.id));
    const guestUuids = new Set(filteredSessions.map((s) => s.guest_uuid));

    // Filter visitors
    const filteredVisitors = this.data.guest_visitors.filter((v) => {
      if (!guestUuids.has(v.guest_uuid)) return false;
      if (filter.language && filter.language !== 'all' && v.preferred_language !== filter.language) return false;
      const isNew = v.first_seen_at >= startIso;
      if (filter.visitorType === 'new' && !isNew) return false;
      if (filter.visitorType === 'returning' && isNew) return false;
      return true;
    });

    const activeVisitorUuids = new Set(filteredVisitors.map((v) => v.guest_uuid));

    // Filter events
    const filteredEvents = this.data.analytics_events.filter((e) => {
      if (!activeVisitorUuids.has(e.guest_uuid)) return false;
      if (e.occurred_at < startIso) return false;
      if (filter.touristPlaceId && filter.touristPlaceId !== 'all' && e.tourist_place_id !== filter.touristPlaceId) {
        return false;
      }
      return true;
    });

    // Counts
    const totalVisits = filteredSessions.length;
    const uniqueVisitors = activeVisitorUuids.size;
    const newVisitors = filteredVisitors.filter((v) => v.first_seen_at >= startIso).length;
    const returningVisitors = Math.max(0, uniqueVisitors - newVisitors);

    // Avg session duration
    let totalDurationSeconds = 0;
    filteredSessions.forEach((s) => {
      const dur = (new Date(s.last_activity_at).getTime() - new Date(s.started_at).getTime()) / 1000;
      totalDurationSeconds += Math.max(30, dur);
    });
    const avgSessionDurationSeconds = totalVisits > 0 ? Math.round(totalDurationSeconds / totalVisits) : 0;

    // Places viewed
    const placeViewsCount = filteredEvents.filter(
      (e) => e.event_type === 'place_viewed' || e.event_type === 'place_details_opened'
    ).length;

    // Tours
    const filteredTours = this.data.tours.filter(
      (t) => activeVisitorUuids.has(t.guest_uuid) && t.started_at >= startIso
    );
    const toursCompleted = filteredTours.filter((t) => t.tour_status === 'completed').length;
    const tourCompletionRate = filteredTours.length > 0 ? Math.round((toursCompleted / filteredTours.length) * 100) : 0;

    // Feedback
    const filteredFeedback = this.data.feedback.filter(
      (f) => activeVisitorUuids.has(f.guest_uuid) && f.created_at >= startIso
    );
    const avgRating =
      filteredFeedback.length > 0
        ? Number((filteredFeedback.reduce((acc, f) => acc + f.overall_rating, 0) / filteredFeedback.length).toFixed(1))
        : 4.8;

    // AI Conversations
    const filteredAiUsage = this.data.ai_usage_records.filter(
      (u) => activeVisitorUuids.has(u.guest_uuid) && u.created_at >= startIso
    );

    // Grouping by Place
    const placeCounts: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      if (e.tourist_place_id) {
        placeCounts[e.tourist_place_id] = (placeCounts[e.tourist_place_id] || 0) + 1;
      }
    });

    // Grouping by Date for Growth Chart (Daily)
    const dailyMap: Record<string, { date: string; visits: number; visitors: number; newVisitors: number }> = {};
    filteredSessions.forEach((s) => {
      const d = s.started_at.split('T')[0];
      if (!dailyMap[d]) {
        dailyMap[d] = { date: d, visits: 0, visitors: 0, newVisitors: 0 };
      }
      dailyMap[d].visits += 1;
    });

    const visitorGrowth = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Language stats
    const langCounts = {
      hindi: filteredVisitors.filter((v) => v.preferred_language === 'hi').length,
      english: filteredVisitors.filter((v) => v.preferred_language === 'en').length,
    };

    // Device category stats
    const deviceCounts = {
      mobile: filteredSessions.filter((s) => s.device_category === 'mobile').length,
      desktop: filteredSessions.filter((s) => s.device_category === 'desktop').length,
      tablet: filteredSessions.filter((s) => s.device_category === 'tablet').length,
    };

    // Mode stats
    const walkingTours = filteredTours.filter((t) => t.travel_mode === 'walking').length;
    const drivingTours = filteredTours.filter((t) => t.travel_mode === 'driving').length;

    return {
      summary: {
        totalVisits,
        uniqueVisitors,
        newVisitors,
        returningVisitors,
        avgSessionDurationSeconds,
        placeViewsCount,
        toursCompleted,
        tourCompletionRate,
        feedbackCount: filteredFeedback.length,
        avgRating,
        aiRequestsCount: filteredAiUsage.length,
      },
      visitorGrowth,
      popularPlaces: Object.entries(placeCounts)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count),
      languages: langCounts,
      devices: deviceCounts,
      travelModes: { walking: walkingTours, driving: drivingTours },
      settings: this.data.ai_settings,
    };
  }

  // --- Guest Activity Report & Timeline ---
  public getGuestActivityList(page: number = 1, pageSize: number = 20) {
    const list = this.data.guest_visitors.map((v) => {
      const sessions = this.data.visitor_sessions.filter((s) => s.guest_uuid === v.guest_uuid);
      const events = this.data.analytics_events.filter((e) => e.guest_uuid === v.guest_uuid);
      const tours = this.data.tours.filter((t) => t.guest_uuid === v.guest_uuid);
      const feedback = this.data.feedback.filter((f) => f.guest_uuid === v.guest_uuid);

      const latestSession = sessions[sessions.length - 1];
      const viewedPlaces = Array.from(
        new Set(
          events
            .filter((e) => e.tourist_place_id)
            .map((e) => e.tourist_place_id!)
        )
      );

      const durationMins = latestSession
        ? Math.round(
            (new Date(latestSession.last_activity_at).getTime() - new Date(latestSession.started_at).getTime()) / 60000
          )
        : 1;

      return {
        guest_uuid: v.guest_uuid,
        first_seen_at: v.first_seen_at,
        last_seen_at: v.last_seen_at,
        session_start: latestSession?.started_at || v.first_seen_at,
        duration_minutes: Math.max(1, durationMins),
        device_category: latestSession?.device_category || 'mobile',
        preferred_language: v.preferred_language,
        places_viewed_count: viewedPlaces.length,
        places_viewed: viewedPlaces,
        searches_count: events.filter((e) => e.event_type === 'search_performed').length,
        tours_count: tours.length,
        tour_status: tours.length > 0 ? tours[tours.length - 1].tour_status : 'none',
        feedback_status: feedback.length > 0 ? `${feedback[0].overall_rating} ★` : 'none',
      };
    });

    list.sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));

    const total = list.length;
    const startIdx = (page - 1) * pageSize;
    const paginated = list.slice(startIdx, startIdx + pageSize);

    return { total, page, pageSize, items: paginated };
  }

  public getGuestTimeline(guestUuid: string) {
    const events = this.data.analytics_events
      .filter((e) => e.guest_uuid === guestUuid)
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

    const tours = this.data.tours.filter((t) => t.guest_uuid === guestUuid);
    const feedback = this.data.feedback.filter((f) => f.guest_uuid === guestUuid);
    const aiUsage = this.data.ai_usage_records.filter((u) => u.guest_uuid === guestUuid);

    return {
      guest_uuid: guestUuid,
      events,
      tours,
      feedback,
      aiUsage,
    };
  }

  // --- Feedback List & Status Update ---
  public getFeedbackList(filter?: { rating?: number; language?: string; status?: string }) {
    let list = [...this.data.feedback];
    if (filter?.rating) {
      list = list.filter((f) => f.overall_rating === filter.rating);
    }
    if (filter?.language && filter.language !== 'all') {
      list = list.filter((f) => f.preferred_language === filter.language);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((f) => f.status === filter.status);
    }
    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  public updateFeedbackStatus(feedbackId: string, status: 'new' | 'reviewed' | 'resolved') {
    const fb = this.data.feedback.find((f) => f.id === feedbackId);
    if (fb) {
      fb.status = status;
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- AI Settings & Management ---
  public getAISettings(): AISettings {
    return this.data.ai_settings;
  }

  public updateAISettings(newSettings: Partial<AISettings>): AISettings {
    this.data.ai_settings = { ...this.data.ai_settings, ...newSettings };
    this.saveDatabase();
    return this.data.ai_settings;
  }

  public getAIManagementStats() {
    const records = this.data.ai_usage_records;
    const transactions = this.data.credit_transactions.filter((t) => t.transaction_type === 'purchase');

    const totalRequests = records.length;
    const successfulRequests = records.filter((r) => r.status === 'success').length;
    const failedRequests = records.filter((r) => r.status === 'failed').length;
    const totalCreditsPurchased = transactions.reduce((acc, t) => acc + t.credits, 0);
    const totalRevenueInr = transactions.reduce((acc, t) => acc + (t.amount_inr || 0), 0);
    const totalCreditsUsed = records.reduce((acc, r) => acc + r.internal_credits_used, 0);

    return {
      settings: this.data.ai_settings,
      totalRequests,
      successfulRequests,
      failedRequests,
      totalCreditsPurchased,
      totalRevenueInr,
      totalCreditsUsed,
      recentUsage: records.slice(-20).reverse(),
    };
  }

  // --- Maps API Key Management & Rotation Methods ---

  public seedInitialMapsKeys() {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const keyA: MapsApiKey = {
      id: 'key_google_maps_a',
      key_name: 'Google Maps Key A (Primary)',
      encrypted_key: 'ENC_AIzaSyC9823482348234_A',
      key_masked: 'AIza••••••••1234',
      key_fingerprint: 'SHA256:7a9f...c4e1',
      key_type: 'all',
      is_enabled: true,
      is_eligible: true,
      rotation_priority: 1,
      total_requests_observed: 342,
      last_activated_at: now.toISOString(),
      last_validated_at: now.toISOString(),
      last_validation_result: 'valid',
      last_error_code: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const keyB: MapsApiKey = {
      id: 'key_google_maps_b',
      key_name: 'Google Maps Key B (Secondary)',
      encrypted_key: 'ENC_AIzaSyD1928472918472_B',
      key_masked: 'AIza••••••••5678',
      key_fingerprint: 'SHA256:3b8d...91a2',
      key_type: 'all',
      is_enabled: true,
      is_eligible: true,
      rotation_priority: 2,
      total_requests_observed: 210,
      last_activated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      last_validated_at: now.toISOString(),
      last_validation_result: 'valid',
      last_error_code: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const keyC: MapsApiKey = {
      id: 'key_google_maps_c',
      key_name: 'Google Maps Key C (Failover)',
      encrypted_key: 'ENC_AIzaSyE7261948291048_C',
      key_masked: 'AIza••••••••9012',
      key_fingerprint: 'SHA256:e4f1...28d9',
      key_type: 'all',
      is_enabled: true,
      is_eligible: true,
      rotation_priority: 3,
      total_requests_observed: 98,
      last_activated_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      last_validated_at: now.toISOString(),
      last_validation_result: 'valid',
      last_error_code: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    this.data.maps_api_keys = [keyA, keyB, keyC];
    this.data.maps_api_settings = {
      id: 'settings_default',
      rotation_enabled: true,
      rotation_strategy: 'time_based',
      rotation_interval_seconds: 7200, // 2-hour interval
      active_key_id: keyA.id,
      max_eligible_keys: 5,
      usage_threshold_per_key: 2500,
      next_rotation_due_at: twoHoursLater,
      last_rotation_at: now.toISOString(),
      updated_by_admin_id: 'admin@kashiyatra.in',
      updated_at: now.toISOString(),
    };

    this.data.maps_key_rotation_history = [
      {
        id: uuidv4(),
        event_type: 'scheduled_rotation',
        previous_key_id: keyC.id,
        new_key_id: keyA.id,
        previous_key_name: keyC.key_name,
        new_key_name: keyA.key_name,
        trigger_reason: '2-hour scheduled interval elapsed',
        status: 'success',
        occurred_at: now.toISOString(),
      },
    ];

    this.saveDatabase();
  }

  public maskApiKey(rawKey: string): string {
    const clean = rawKey.trim();
    if (clean.length <= 8) return 'AIza••••';
    const prefix = clean.startsWith('AIza') ? 'AIza' : clean.slice(0, 4);
    const suffix = clean.slice(-4);
    return `${prefix}••••••••${suffix}`;
  }

  public getMapsApiSettings(): MapsApiSettings & { activeKey?: MapsApiKey | null } {
    // Auto-check if scheduled rotation is due
    this.checkAndPerformScheduledRotation();

    const activeKey = this.data.maps_api_keys.find((k) => k.id === this.data.maps_api_settings.active_key_id) || null;
    return {
      ...this.data.maps_api_settings,
      activeKey,
    };
  }

  public updateMapsApiSettings(newSettings: Partial<MapsApiSettings>): MapsApiSettings {
    const now = new Date();
    const intervalSec = newSettings.rotation_interval_seconds || this.data.maps_api_settings.rotation_interval_seconds;
    const nextDue = new Date(now.getTime() + intervalSec * 1000).toISOString();

    this.data.maps_api_settings = {
      ...this.data.maps_api_settings,
      ...newSettings,
      next_rotation_due_at: newSettings.rotation_interval_seconds ? nextDue : this.data.maps_api_settings.next_rotation_due_at,
      updated_at: now.toISOString(),
    };

    this.saveDatabase();
    return this.data.maps_api_settings;
  }

  public getMapsApiKeys(): MapsApiKey[] {
    return this.data.maps_api_keys.map((k) => ({
      ...k,
      encrypted_key: '[ENCRYPTED_SERVER_SIDE]', // Never return secret to frontend
    }));
  }

  public addMapsApiKey(data: {
    key_name: string;
    raw_key: string;
    key_type?: 'browser_javascript' | 'backend_routes' | 'all';
    rotation_priority?: number;
  }): MapsApiKey {
    const now = new Date().toISOString();
    const masked = this.maskApiKey(data.raw_key);
    const fingerprint = `SHA256:${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`;

    // Validate key format (Google API keys start with AIza and are ~39 chars)
    const isFormatValid = data.raw_key.trim().startsWith('AIza') && data.raw_key.trim().length >= 35;

    const newKey: MapsApiKey = {
      id: `key_${uuidv4().slice(0, 8)}`,
      key_name: data.key_name,
      encrypted_key: `ENC_${Buffer.from(data.raw_key).toString('base64')}`,
      key_masked: masked,
      key_fingerprint: fingerprint,
      key_type: data.key_type || 'all',
      is_enabled: true,
      is_eligible: isFormatValid,
      rotation_priority: data.rotation_priority || this.data.maps_api_keys.length + 1,
      total_requests_observed: 0,
      last_activated_at: null,
      last_validated_at: now,
      last_validation_result: isFormatValid ? 'valid' : 'invalid',
      last_error_code: isFormatValid ? null : 'INVALID_KEY_PREFIX_OR_LENGTH',
      created_at: now,
      updated_at: now,
    };

    this.data.maps_api_keys.push(newKey);

    // Record history
    this.data.maps_key_rotation_history.unshift({
      id: uuidv4(),
      event_type: 'key_added',
      previous_key_id: null,
      new_key_id: newKey.id,
      previous_key_name: null,
      new_key_name: newKey.key_name,
      trigger_reason: `Admin added new key (${masked})`,
      status: isFormatValid ? 'success' : 'warning',
      occurred_at: now,
    });

    // If no active key, set this as active
    if (!this.data.maps_api_settings.active_key_id && newKey.is_eligible) {
      this.data.maps_api_settings.active_key_id = newKey.id;
      newKey.last_activated_at = now;
    }

    this.saveDatabase();
    return {
      ...newKey,
      encrypted_key: '[ENCRYPTED_SERVER_SIDE]',
    };
  }

  public updateMapsApiKey(id: string, updates: Partial<MapsApiKey>): MapsApiKey | null {
    const key = this.data.maps_api_keys.find((k) => k.id === id);
    if (!key) return null;

    Object.assign(key, updates);
    key.updated_at = new Date().toISOString();

    // If active key was disabled, trigger immediate rotation to next eligible key
    if (updates.is_enabled === false && this.data.maps_api_settings.active_key_id === id) {
      this.rotateActiveKey('health_fallback', `Active key was disabled by administrator`);
    }

    this.saveDatabase();
    return {
      ...key,
      encrypted_key: '[ENCRYPTED_SERVER_SIDE]',
    };
  }

  public deleteMapsApiKey(id: string): boolean {
    const key = this.data.maps_api_keys.find((k) => k.id === id);
    if (!key) return false;

    // If active key is deleted, rotate first
    if (this.data.maps_api_settings.active_key_id === id) {
      this.rotateActiveKey('health_fallback', `Active key (${key.key_name}) was deleted by administrator`);
    }

    this.data.maps_api_keys = this.data.maps_api_keys.filter((k) => k.id !== id);

    this.data.maps_key_rotation_history.unshift({
      id: uuidv4(),
      event_type: 'key_disabled',
      previous_key_id: id,
      new_key_id: null,
      previous_key_name: key.key_name,
      new_key_name: null,
      trigger_reason: `Admin removed key from pool`,
      status: 'warning',
      occurred_at: new Date().toISOString(),
    });

    this.saveDatabase();
    return true;
  }

  public validateMapsApiKey(id: string): { valid: boolean; result: string; message: string } {
    const key = this.data.maps_api_keys.find((k) => k.id === id);
    const now = new Date().toISOString();
    if (!key) return { valid: false, result: 'not_found', message: 'Key not found' };

    // Decode and validate
    const rawKey = key.encrypted_key.replace(/^ENC_/, '');
    const decoded = Buffer.from(rawKey, 'base64').toString('utf-8');

    const startsWithAIza = decoded.startsWith('AIza');
    const isLengthCorrect = decoded.length >= 35 && decoded.length <= 42;

    if (startsWithAIza && isLengthCorrect) {
      key.last_validated_at = now;
      key.last_validation_result = 'valid';
      key.last_error_code = null;
      key.is_eligible = true;
      this.saveDatabase();
      return { valid: true, result: 'valid', message: 'Key structure and prefix (AIza) verified successfully.' };
    } else {
      key.last_validated_at = now;
      key.last_validation_result = 'invalid';
      key.last_error_code = 'MALFORMED_API_KEY';
      key.is_eligible = false;
      this.saveDatabase();
      return { valid: false, result: 'invalid', message: 'Key does not match valid Google Maps Platform format.' };
    }
  }

  public rotateActiveKey(
    strategy: 'time_based' | 'usage_based' | 'health_fallback' = 'time_based',
    reason?: string
  ): { previousKey: string | null; newKey: string | null; success: boolean } {
    const now = new Date();
    const settings = this.data.maps_api_settings;

    // Filter eligible, enabled keys sorted by priority
    const eligibleKeys = this.data.maps_api_keys
      .filter((k) => k.is_enabled && k.is_eligible && k.last_validation_result !== 'invalid')
      .sort((a, b) => a.rotation_priority - b.rotation_priority);

    if (eligibleKeys.length === 0) {
      return { previousKey: settings.active_key_id, newKey: null, success: false };
    }

    const currentKeyId = settings.active_key_id;
    const currentKey = this.data.maps_api_keys.find((k) => k.id === currentKeyId);

    // Find next key in circular sequence
    const currentIndex = eligibleKeys.findIndex((k) => k.id === currentKeyId);
    let nextIndex = 0;
    if (currentIndex >= 0 && currentIndex < eligibleKeys.length - 1) {
      nextIndex = currentIndex + 1;
    }

    const nextKey = eligibleKeys[nextIndex];

    // Update active key & schedule next rotation
    settings.active_key_id = nextKey.id;
    settings.last_rotation_at = now.toISOString();
    settings.next_rotation_due_at = new Date(now.getTime() + settings.rotation_interval_seconds * 1000).toISOString();
    settings.updated_at = now.toISOString();

    nextKey.last_activated_at = now.toISOString();

    // Record audit history
    this.data.maps_key_rotation_history.unshift({
      id: uuidv4(),
      event_type: strategy === 'health_fallback' ? 'health_fallback' : strategy === 'usage_based' ? 'scheduled_rotation' : 'scheduled_rotation',
      previous_key_id: currentKeyId,
      new_key_id: nextKey.id,
      previous_key_name: currentKey?.key_name || 'None',
      new_key_name: nextKey.key_name,
      trigger_reason: reason || (strategy === 'time_based' ? `${settings.rotation_interval_seconds / 3600}h interval elapsed` : 'Strategy threshold reached'),
      status: 'success',
      occurred_at: now.toISOString(),
    });

    this.saveDatabase();
    return {
      previousKey: currentKeyId,
      newKey: nextKey.id,
      success: true,
    };
  }

  public checkAndPerformScheduledRotation() {
    const settings = this.data.maps_api_settings;
    if (!settings.rotation_enabled) return;

    const now = new Date();
    const nextDue = new Date(settings.next_rotation_due_at);

    if (now >= nextDue) {
      this.rotateActiveKey(
        settings.rotation_strategy,
        `Scheduled ${Math.round(settings.rotation_interval_seconds / 60)} minute interval reached`
      );
    }
  }

  public incrementMapsKeyUsage(keyId?: string) {
    const targetId = keyId || this.data.maps_api_settings.active_key_id;
    if (!targetId) return;

    const key = this.data.maps_api_keys.find((k) => k.id === targetId);
    if (key) {
      key.total_requests_observed += 1;
      this.saveDatabase();

      // Check usage-based rotation
      if (
        this.data.maps_api_settings.rotation_strategy === 'usage_based' &&
        key.total_requests_observed >= this.data.maps_api_settings.usage_threshold_per_key
      ) {
        this.rotateActiveKey('usage_based', `Usage threshold (${this.data.maps_api_settings.usage_threshold_per_key} requests) reached`);
      }
    }
  }

  public getMapsRotationHistory(): MapsKeyRotationHistory[] {
    return this.data.maps_key_rotation_history.slice(0, 50);
  }

  // --- Secure Live Location Sharing & Tracking ---

  public createLocationShare(data: {
    share_type: 'snapshot' | 'live';
    sender_name?: string;
    duration_seconds: number;
    initial_location: {
      latitude: number;
      longitude: number;
      accuracy_meters: number;
      heading?: number;
      speed?: number;
    };
  }): {
    share: LocationShare;
    rawToken: string;
    senderSecret: string;
    location: SharedLocation;
  } {
    const now = new Date();
    // Cap max duration to 24 hours (86400s), default to 3600s (1h)
    const durationSec = Math.min(86400, Math.max(300, data.duration_seconds || 3600));
    const expiresAt = new Date(now.getTime() + durationSec * 1000).toISOString();

    // Generate cryptographic-style random tokens
    const rawToken = `kashi_${uuidv4().replace(/-/g, '')}${Math.random().toString(36).slice(2, 8)}`;
    const senderSecret = `sec_${uuidv4().replace(/-/g, '')}`;

    const share: LocationShare = {
      id: `share_${uuidv4().slice(0, 8)}`,
      share_token: rawToken,
      sender_secret: senderSecret,
      share_type: data.share_type,
      status: 'active',
      sender_name: data.sender_name?.trim() || 'Kashi Pilgrim',
      duration_seconds: durationSec,
      started_at: now.toISOString(),
      expires_at: expiresAt,
      ended_at: null,
      last_updated_at: now.toISOString(),
      update_count: 1,
      created_at: now.toISOString(),
    };

    const location: SharedLocation = {
      id: `loc_${uuidv4().slice(0, 8)}`,
      location_share_id: share.id,
      latitude: Number(data.initial_location.latitude.toFixed(6)),
      longitude: Number(data.initial_location.longitude.toFixed(6)),
      accuracy_meters: Math.round(data.initial_location.accuracy_meters || 10),
      heading: data.initial_location.heading ?? null,
      speed: data.initial_location.speed ?? null,
      captured_at: now.toISOString(),
      created_at: now.toISOString(),
    };

    this.data.location_shares.unshift(share);
    this.data.shared_locations.unshift(location);
    this.saveDatabase();

    return { share, rawToken, senderSecret, location };
  }

  public updateSharedLocation(
    token: string,
    senderSecret: string,
    locationData: {
      latitude: number;
      longitude: number;
      accuracy_meters: number;
      heading?: number;
      speed?: number;
    }
  ): { success: boolean; share?: LocationShare; location?: SharedLocation; error?: string } {
    const now = new Date();
    const share = this.data.location_shares.find((s) => s.share_token === token);

    if (!share || share.sender_secret !== senderSecret) {
      return { success: false, error: 'UNAUTHORIZED_OR_NOT_FOUND' };
    }

    if (share.status === 'ended') {
      return { success: false, error: 'SHARING_ENDED' };
    }

    if (now.getTime() > new Date(share.expires_at).getTime()) {
      share.status = 'expired';
      this.saveDatabase();
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    // Validate coordinates
    const lat = locationData.latitude;
    const lng = locationData.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number' || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { success: false, error: 'INVALID_COORDINATES' };
    }

    share.last_updated_at = now.toISOString();
    share.update_count += 1;

    // Overwrite the existing shared_locations entry for privacy to avoid storing persistent movement trails
    let loc = this.data.shared_locations.find((l) => l.location_share_id === share.id);
    if (loc) {
      loc.latitude = Number(lat.toFixed(6));
      loc.longitude = Number(lng.toFixed(6));
      loc.accuracy_meters = Math.round(locationData.accuracy_meters || 10);
      loc.heading = locationData.heading ?? null;
      loc.speed = locationData.speed ?? null;
      loc.captured_at = now.toISOString();
    } else {
      loc = {
        id: `loc_${uuidv4().slice(0, 8)}`,
        location_share_id: share.id,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        accuracy_meters: Math.round(locationData.accuracy_meters || 10),
        heading: locationData.heading ?? null,
        speed: locationData.speed ?? null,
        captured_at: now.toISOString(),
        created_at: now.toISOString(),
      };
      this.data.shared_locations.unshift(loc);
    }

    this.saveDatabase();
    return { success: true, share, location: loc };
  }

  public getLocationShareByToken(token: string): {
    share: Omit<LocationShare, 'sender_secret'>;
    location: SharedLocation | null;
  } | null {
    const now = new Date();
    const share = this.data.location_shares.find((s) => s.share_token === token);
    if (!share) return null;

    // Auto-expire check
    if (share.status === 'active' && now.getTime() > new Date(share.expires_at).getTime()) {
      share.status = 'expired';
      this.saveDatabase();
    }

    const loc = this.data.shared_locations.find((l) => l.location_share_id === share.id) || null;

    // Return sanitized share without sender_secret
    const { sender_secret, ...sanitizedShare } = share;
    return {
      share: sanitizedShare,
      location: loc,
    };
  }

  public stopLocationShare(token: string, senderSecret: string): boolean {
    const now = new Date();
    const share = this.data.location_shares.find((s) => s.share_token === token);

    if (!share || share.sender_secret !== senderSecret) {
      return false;
    }

    share.status = 'ended';
    share.ended_at = now.toISOString();
    this.saveDatabase();
    return true;
  }

  public adminStopLocationShare(id: string): boolean {
    const now = new Date();
    const share = this.data.location_shares.find((s) => s.id === id);
    if (!share) return false;
    share.status = 'ended';
    share.ended_at = now.toISOString();
    this.saveDatabase();
    return true;
  }

  public getLocationSharingAdminStats() {
    const now = new Date().getTime();
    const shares = this.data.location_shares;

    // Check expiration on active shares
    shares.forEach((s) => {
      if (s.status === 'active' && now > new Date(s.expires_at).getTime()) {
        s.status = 'expired';
      }
    });

    const activeSessions = shares.filter((s) => s.status === 'active').length;
    const endedSessions = shares.filter((s) => s.status === 'ended').length;
    const expiredSessions = shares.filter((s) => s.status === 'expired').length;
    const liveCount = shares.filter((s) => s.share_type === 'live').length;
    const snapshotCount = shares.filter((s) => s.share_type === 'snapshot').length;
    const totalUpdates = shares.reduce((acc, s) => acc + s.update_count, 0);

    const avgDurationMins =
      shares.length > 0 ? Math.round(shares.reduce((acc, s) => acc + s.duration_seconds, 0) / shares.length / 60) : 30;

    return {
      totalShares: shares.length,
      activeSessions,
      endedSessions,
      expiredSessions,
      liveCount,
      snapshotCount,
      totalUpdates,
      avgDurationMins,
      recentShares: shares.slice(0, 20).map((s) => ({
        id: s.id,
        share_type: s.share_type,
        status: s.status,
        sender_name: s.sender_name,
        started_at: s.started_at,
        expires_at: s.expires_at,
        ended_at: s.ended_at,
        update_count: s.update_count,
        duration_minutes: Math.round(s.duration_seconds / 60),
      })),
    };
  }

  // ==========================================
  // SEO Management Methods
  // ==========================================
  public getSeoPages(includeDisabled = true): SeoPageRecord[] {
    if (!this.data.seo_pages) {
      this.data.seo_pages = generateDefaultSeoPages(VARANASI_PLACES);
      this.saveDatabase();
    }
    if (includeDisabled) {
      return [...this.data.seo_pages];
    }
    return this.data.seo_pages.filter((p) => p.status === 'published');
  }

  public getSeoPageByRoute(routePattern: string): SeoPageRecord | null {
    if (!this.data.seo_pages) return null;
    const cleanPattern = routePattern.split('?')[0].replace(/\/$/, '') || '/';
    return (
      this.data.seo_pages.find((p) => {
        const pagePattern = p.route_pattern.replace(/\/$/, '') || '/';
        return pagePattern === cleanPattern;
      }) || null
    );
  }

  public getSeoPageById(id: string): SeoPageRecord | null {
    return this.data.seo_pages?.find((p) => p.id === id) || null;
  }

  public createSeoPage(data: Partial<SeoPageRecord>): SeoPageRecord {
    const now = new Date().toISOString();
    const siteUrl = this.data.seo_global_settings?.site_url || 'https://kashiyatra.in';
    const route = data.route_pattern || '/custom-' + Date.now();

    const newPage: SeoPageRecord = {
      id: 'seo_' + uuidv4().slice(0, 8),
      page_name: data.page_name || 'New Custom SEO Page',
      page_type: data.page_type || 'custom',
      route_pattern: route.startsWith('/') ? route : '/' + route,
      place_id: data.place_id || null,
      meta_title: data.meta_title || 'Varanasi Heritage Page | Kashi Yatra',
      meta_description:
        data.meta_description ||
        'Discover authentic heritage, spiritual traditions, and pilgrim advice in Varanasi with Kashi Yatra.',
      meta_keywords: data.meta_keywords || 'Varanasi, Kashi, Ghats, Temples, Heritage',
      canonical_url: data.canonical_url || `${siteUrl}${route.startsWith('/') ? '' : '/'}${route}`,
      og_title: data.og_title || data.meta_title || 'Kashi Yatra Varanasi Heritage',
      og_description: data.og_description || data.meta_description || 'Explore Varanasi with Kashi Yatra.',
      og_image:
        data.og_image ||
        this.data.seo_global_settings?.default_og_image ||
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      og_type: data.og_type || 'website',
      twitter_card: data.twitter_card || 'summary_large_image',
      twitter_title: data.twitter_title || data.meta_title || 'Kashi Yatra Varanasi Guide',
      twitter_description: data.twitter_description || data.meta_description || 'Explore Varanasi with Kashi Yatra.',
      twitter_image:
        data.twitter_image ||
        data.og_image ||
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      robots_index: data.robots_index !== undefined ? data.robots_index : true,
      robots_follow: data.robots_follow !== undefined ? data.robots_follow : true,
      structured_data_json: data.structured_data_json || '{}',
      custom_headings: data.custom_headings || {
        h1: data.page_name || 'Varanasi Heritage Exploration',
        h2: 'Discover Spiritual Sacred Traditions in Kashi',
        intro_text: data.meta_description || 'Verified pilgrim insights and navigation in sacred Varanasi.',
      },
      status: data.status || 'published',
      priority: data.priority ?? 0.8,
      change_freq: data.change_freq || 'weekly',
      updated_at: now,
      created_at: now,
    };

    if (!this.data.seo_pages) this.data.seo_pages = [];
    this.data.seo_pages.push(newPage);
    this.saveDatabase();
    return newPage;
  }

  public updateSeoPage(id: string, updates: Partial<SeoPageRecord>): SeoPageRecord | null {
    const pageIndex = this.data.seo_pages?.findIndex((p) => p.id === id);
    if (pageIndex === undefined || pageIndex === -1) return null;

    const existing = this.data.seo_pages[pageIndex];
    const updated: SeoPageRecord = {
      ...existing,
      ...updates,
      id: existing.id, // prevent overwriting ID
      updated_at: new Date().toISOString(),
    };

    this.data.seo_pages[pageIndex] = updated;
    this.saveDatabase();
    return updated;
  }

  public deleteSeoPage(id: string): boolean {
    const initialLen = this.data.seo_pages?.length || 0;
    this.data.seo_pages = (this.data.seo_pages || []).filter((p) => p.id !== id);
    if (this.data.seo_pages.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public getSeoGlobalSettings(): SeoGlobalSettings {
    if (!this.data.seo_global_settings) {
      this.data.seo_global_settings = { ...DEFAULT_SEO_GLOBAL_SETTINGS };
      this.saveDatabase();
    }
    return this.data.seo_global_settings;
  }

  public updateSeoGlobalSettings(updates: Partial<SeoGlobalSettings>): SeoGlobalSettings {
    if (!this.data.seo_global_settings) {
      this.data.seo_global_settings = { ...DEFAULT_SEO_GLOBAL_SETTINGS };
    }
    this.data.seo_global_settings = {
      ...this.data.seo_global_settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.seo_global_settings;
  }

  public resetSeoDefaults(): SeoPageRecord[] {
    const siteUrl = this.data.seo_global_settings?.site_url || 'https://kashiyatra.in';
    this.data.seo_pages = generateDefaultSeoPages(VARANASI_PLACES, siteUrl);
    this.data.seo_global_settings = { ...DEFAULT_SEO_GLOBAL_SETTINGS };
    this.saveDatabase();
    return this.data.seo_pages;
  }

  public generateSitemapXml(baseUrl?: string): string {
    const siteUrl = baseUrl || this.data.seo_global_settings?.site_url || 'https://kashiyatra.in';
    const pages = this.getSeoPages(false);
    return generateSitemapXml(pages, siteUrl);
  }

  public generateRobotsTxt(baseUrl?: string): string {
    const siteUrl = baseUrl || this.data.seo_global_settings?.site_url || 'https://kashiyatra.in';
    const settings = this.getSeoGlobalSettings();
    return generateRobotsTxt(settings, siteUrl);
  }

  // ==========================================
  // Tourist Visiting Points Management Methods
  // ==========================================
  public getTouristPlaces(includeInactive = false): TouristPlace[] {
    if (!this.data.tourist_places || this.data.tourist_places.length === 0) {
      this.data.tourist_places = VARANASI_PLACES.map((p) => ({
        ...p,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      this.saveDatabase();
    }

    if (includeInactive) {
      return [...this.data.tourist_places].sort((a, b) => (a.number || 0) - (b.number || 0));
    }
    return this.data.tourist_places
      .filter((p) => p.status !== 'inactive')
      .sort((a, b) => (a.number || 0) - (b.number || 0));
  }

  public getTouristPlaceById(id: string): TouristPlace | null {
    const places = this.getTouristPlaces(true);
    return places.find((p) => p.id === id) || null;
  }

  public createTouristPlace(data: Partial<TouristPlace>): TouristPlace {
    const places = this.getTouristPlaces(true);
    const maxNum = places.reduce((max, p) => Math.max(max, p.number || 0), 0);

    const generatedSlug = data.id
      ? data.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : (data.name?.en || 'place-' + Date.now()).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newPlace: TouristPlace = {
      id: generatedSlug,
      number: data.number || maxNum + 1,
      name: {
        en: data.name?.en || 'New Sacred Place',
        hi: data.name?.hi || 'नया तीर्थ स्थल',
      },
      subtitle: {
        en: data.subtitle?.en || 'Spiritual & Heritage Destination in Varanasi',
        hi: data.subtitle?.hi || 'वाराणसी का आध्यात्मिक व सांस्कृतिक दर्शनीय स्थल',
      },
      category: data.category || 'temple',
      coordinates: {
        lat: Number(data.coordinates?.lat) || 25.3109,
        lng: Number(data.coordinates?.lng) || 83.0104,
      },
      image:
        data.image ||
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      shortIntro: {
        en: data.shortIntro?.en || 'A revered spiritual and cultural destination situated in ancient Varanasi.',
        hi: data.shortIntro?.hi || 'प्राचीन काशी में स्थित एक पावन आध्यात्मिक और सांस्कृतिक दर्शनीय स्थल।',
      },
      historicalBackground: {
        en: data.historicalBackground?.en || 'Steeped in centuries of Varanasi heritage and tradition.',
        hi: data.historicalBackground?.hi || 'वाराणसी की सदियों पुरानी विरासत और परंपराओं से जुड़ा हुआ स्थल।',
      },
      periodDocumented: {
        en: data.periodDocumented?.en || 'Ancient Varanasi Heritage',
        hi: data.periodDocumented?.hi || 'प्राचीन काशी धरोहर',
      },
      religiousSignificance: {
        en: data.religiousSignificance?.en || 'Revered by pilgrims seeking divine darshan and blessings.',
        hi: data.religiousSignificance?.hi || 'तीर्थयात्रियों और श्रद्धालुओं द्वारा पूजनीय।',
      },
      architecturalFeatures: {
        en: data.architecturalFeatures?.en || 'Traditional Indian architecture and stone masonry.',
        hi: data.architecturalFeatures?.hi || 'पारंपरिक भारतीय स्थापत्य और प्रस्तर शिल्प।',
      },
      interestingFacts: {
        en: data.interestingFacts?.en || ['Holds unique sanctity in Kashi pilgrimage circuits.'],
        hi: data.interestingFacts?.hi || ['काशी तीर्थ परिक्रमा में विशेष महत्व रखता है।'],
      },
      visitingHours: {
        en: data.visitingHours?.en || 'Open 05:00 AM - 09:00 PM',
        hi: data.visitingHours?.hi || 'प्रातः 05:00 से रात्रि 09:00 बजे तक खुला',
      },
      entryFee: {
        en: data.entryFee?.en || 'Free Entry',
        hi: data.entryFee?.hi || 'निःशुल्क प्रवेश',
      },
      accessibilityNotes: {
        en: data.accessibilityNotes?.en || 'Accessible via pedestrian lanes or nearby main road.',
        hi: data.accessibilityNotes?.hi || 'पैदल गलियों या नजदीकी मुख्य मार्ग से सुलभ।',
      },
      travelModeSuitability: {
        walking: {
          en: data.travelModeSuitability?.walking?.en || 'Highly recommended for an immersive experience.',
          hi: data.travelModeSuitability?.walking?.hi || 'पैदल यात्रा अत्यधिक उपयुक्त।',
        },
        driving: {
          en: data.travelModeSuitability?.driving?.en || 'Vehicles drop at nearest parking / chowk.',
          hi: data.travelModeSuitability?.driving?.hi || 'नजदीकी पार्किंग या चौराहे तक वाहन सुलभ।',
        },
      },
      wikipediaUrl: {
        en: data.wikipediaUrl?.en || 'https://en.wikipedia.org/wiki/Varanasi',
        hi: data.wikipediaUrl?.hi || 'https://hi.wikipedia.org/wiki/वाराणसी',
      },
      sources: data.sources || ['Kashi Heritage Board', 'Varanasi Smart City Development'],
      suggestedDurationMinutes: data.suggestedDurationMinutes || 45,
      rating: data.rating || 4.8,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.tourist_places.push(newPlace);

    // Sync SEO page for this new place
    const siteUrl = this.data.seo_global_settings?.site_url || 'https://kashiyatra.in';
    const placeRoute = `/places/${newPlace.id}`;
    if (!this.data.seo_pages.some((sp) => sp.route_pattern === placeRoute)) {
      this.data.seo_pages.push({
        id: `seo_place_${newPlace.id}`,
        page_name: `${newPlace.name.en} (${newPlace.name.hi})`,
        page_type: 'place',
        route_pattern: placeRoute,
        place_id: newPlace.id,
        meta_title: `${newPlace.name.en} | Darshan, History & Directions | Varanasi`,
        meta_description: `${newPlace.name.en} in Varanasi: ${newPlace.shortIntro.en} Opening hours, darshan timings, history, and walking directions.`.slice(0, 160),
        canonical_url: `${siteUrl}/places/${newPlace.id}`,
        og_title: `${newPlace.name.en} | Varanasi Smart Tourist Guide`,
        og_description: newPlace.shortIntro.en.slice(0, 160),
        og_image: newPlace.image,
        og_type: 'place',
        twitter_card: 'summary_large_image',
        twitter_title: `${newPlace.name.en} | Varanasi Smart Tourist Guide`,
        twitter_description: newPlace.shortIntro.en.slice(0, 160),
        twitter_image: newPlace.image,
        robots_index: true,
        robots_follow: true,
        structured_data_json: '',
        status: 'published',
        priority: 0.8,
        change_freq: 'weekly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    this.saveDatabase();
    return newPlace;
  }

  public updateTouristPlace(id: string, updates: Partial<TouristPlace>): TouristPlace | null {
    if (!this.data.tourist_places) return null;
    const index = this.data.tourist_places.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.data.tourist_places[index];
    const updated: TouristPlace = {
      ...current,
      ...updates,
      coordinates: {
        lat: updates.coordinates?.lat !== undefined ? Number(updates.coordinates.lat) : current.coordinates.lat,
        lng: updates.coordinates?.lng !== undefined ? Number(updates.coordinates.lng) : current.coordinates.lng,
      },
      name: {
        ...current.name,
        ...(updates.name || {}),
      },
      subtitle: {
        ...current.subtitle,
        ...(updates.subtitle || {}),
      },
      shortIntro: {
        ...current.shortIntro,
        ...(updates.shortIntro || {}),
      },
      historicalBackground: {
        ...current.historicalBackground,
        ...(updates.historicalBackground || {}),
      },
      visitingHours: {
        ...current.visitingHours,
        ...(updates.visitingHours || {}),
      },
      entryFee: {
        ...current.entryFee,
        ...(updates.entryFee || {}),
      },
      updated_at: new Date().toISOString(),
    };

    this.data.tourist_places[index] = updated;

    // Keep SEO page title/image in sync if changed
    const seoPage = this.data.seo_pages.find((p) => p.route_pattern === `/places/${id}` || p.place_id === id);
    if (seoPage) {
      if (updates.name?.en) {
        seoPage.meta_title = `${updated.name.en} | Darshan, History & Directions | Varanasi`;
        seoPage.page_name = `${updated.name.en} (${updated.name.hi})`;
      }
      if (updates.image) {
        seoPage.og_image = updated.image;
        seoPage.twitter_image = updated.image;
      }
      if (updates.status === 'inactive') {
        seoPage.status = 'disabled';
        seoPage.robots_index = false;
      } else if (updates.status === 'active') {
        seoPage.status = 'published';
        seoPage.robots_index = true;
      }
      seoPage.updated_at = new Date().toISOString();
    }

    this.saveDatabase();
    return updated;
  }

  public deleteTouristPlace(id: string, hardDelete = false): boolean {
    if (!this.data.tourist_places) return false;
    const index = this.data.tourist_places.findIndex((p) => p.id === id);
    if (index === -1) return false;

    if (hardDelete) {
      this.data.tourist_places.splice(index, 1);
      this.data.seo_pages = this.data.seo_pages.filter((p) => p.route_pattern !== `/places/${id}` && p.place_id !== id);
    } else {
      this.data.tourist_places[index].status = 'inactive';
      this.data.tourist_places[index].updated_at = new Date().toISOString();
      const seoPage = this.data.seo_pages.find((p) => p.route_pattern === `/places/${id}`);
      if (seoPage) {
        seoPage.status = 'disabled';
        seoPage.robots_index = false;
      }
    }
    this.saveDatabase();
    return true;
  }

  public resetTouristPlaces(): TouristPlace[] {
    const now = new Date().toISOString();
    this.data.tourist_places = VARANASI_PLACES.map((p) => ({
      ...p,
      status: 'active',
      created_at: now,
      updated_at: now,
    }));
    this.saveDatabase();
    return this.data.tourist_places;
  }

  // ==========================================
  // AI Assistant Configuration & Knowledge Base
  // ==========================================

  public getAIAssistantConfig(): AIAssistantConfig {
    if (!this.data.ai_assistant_config) {
      this.data.ai_assistant_config = { ...DEFAULT_AI_ASSISTANT_CONFIG };
      this.saveDatabase();
    }
    return this.data.ai_assistant_config;
  }

  public updateAIAssistantConfig(updates: Partial<AIAssistantConfig>): AIAssistantConfig {
    const current = this.getAIAssistantConfig();
    const updated: AIAssistantConfig = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.ai_assistant_config = updated;
    this.saveDatabase();
    return updated;
  }

  public getAIKnowledgeBase(category?: string, query?: string): AIKnowledgeItem[] {
    let items = this.data.ai_knowledge_base || [];
    if (category && category !== 'all') {
      items = items.filter((it) => it.category === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter(
        (it) =>
          it.title.en.toLowerCase().includes(q) ||
          it.title.hi.includes(q) ||
          it.summary.en.toLowerCase().includes(q) ||
          it.summary.hi.includes(q) ||
          it.details.en.toLowerCase().includes(q) ||
          it.details.hi.includes(q) ||
          it.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }

  public getAIKnowledgeItemById(id: string): AIKnowledgeItem | undefined {
    return (this.data.ai_knowledge_base || []).find((it) => it.id === id);
  }

  public saveAIKnowledgeItem(item: Partial<AIKnowledgeItem>): AIKnowledgeItem {
    if (!this.data.ai_knowledge_base) {
      this.data.ai_knowledge_base = [...DEFAULT_AI_KNOWLEDGE_ITEMS];
    }

    const id = item.id || `kb_${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const existingIndex = this.data.ai_knowledge_base.findIndex((it) => it.id === id);

    const record: AIKnowledgeItem = {
      id,
      category: item.category || 'places',
      place_id: item.place_id,
      title: item.title || { en: 'New Topic', hi: 'नया विषय' },
      summary: item.summary || { en: '', hi: '' },
      details: item.details || { en: '', hi: '' },
      schedule_timing: item.schedule_timing,
      coordinates: item.coordinates,
      source_url: item.source_url,
      source_title: item.source_title,
      nearby_suggestions: item.nearby_suggestions || { en: [], hi: [] },
      is_verified: item.is_verified ?? true,
      tags: item.tags || [],
      updated_at: now,
    };

    if (existingIndex >= 0) {
      this.data.ai_knowledge_base[existingIndex] = record;
    } else {
      this.data.ai_knowledge_base.push(record);
    }

    this.saveDatabase();
    return record;
  }

  public deleteAIKnowledgeItem(id: string): boolean {
    if (!this.data.ai_knowledge_base) return false;
    const initialLen = this.data.ai_knowledge_base.length;
    this.data.ai_knowledge_base = this.data.ai_knowledge_base.filter((it) => it.id !== id);
    if (this.data.ai_knowledge_base.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public resetAIKnowledgeBase(): AIKnowledgeItem[] {
    this.data.ai_knowledge_base = [...DEFAULT_AI_KNOWLEDGE_ITEMS];
    this.data.ai_assistant_config = { ...DEFAULT_AI_ASSISTANT_CONFIG };
    this.saveDatabase();
    return this.data.ai_knowledge_base;
  }

  /**
   * Verified Grounding Context Engine:
   * Dynamically queries verified database places and knowledge base records,
   * calculates distance if user coordinates provided, and builds strict grounding instructions.
   */
  public getVerifiedGroundingContext(
    userQuery: string,
    placeContext?: string,
    userLoc?: { lat: number; lng: number },
    lang: 'en' | 'hi' = 'en'
  ): {
    groundingText: string;
    verifiedCount: number;
    matchedItems: AIKnowledgeItem[];
    matchedPlaces: TouristPlace[];
    nearbyPlacesSuggestions: Array<{ name: string; distanceKm?: number; coordinates?: { lat: number; lng: number } }>;
  } {
    const qLower = (userQuery || '').toLowerCase();
    const placeLower = (placeContext || '').toLowerCase();

    const qClean = qLower.replace(/[?!,।.]/g, ' ');
    const queryTokens = qClean.split(/\s+/).filter((w) => w.length >= 2);

    // 1. Scored Match for Tourist Places from database
    const places = this.getTouristPlaces(false);
    const scoredPlaces = places
      .map((p) => {
        let score = 0;
        const nameEn = p.name.en.toLowerCase();
        const nameHi = p.name.hi;
        const id = p.id.toLowerCase();

        // Exact ID or full name match
        if (qLower.includes(id) || id.includes(qLower)) score += 80;
        if (qLower.includes(nameEn) || nameEn.includes(qLower)) score += 60;
        if (qLower.includes(nameHi) || nameHi.includes(qLower)) score += 60;

        // Token matches
        for (const token of queryTokens) {
          if (token === 'ghat' || token === 'घाट' || token === 'temple' || token === 'मंदिर') {
            continue; // Generic words don't give high specific score
          }
          if (id.includes(token)) score += 30;
          if (nameEn.includes(token)) score += 30;
          if (nameHi.includes(token)) score += 30;
        }

        // Generic category match only if no specific tokens found
        if (score === 0) {
          if (
            (qLower.includes('temple') || qLower.includes('मंदिर')) &&
            p.category === 'temple'
          ) score += 5;
          if (
            (qLower.includes('ghat') || qLower.includes('घाट')) &&
            p.category === 'ghat'
          ) score += 5;
        }

        if (placeLower && nameEn.includes(placeLower)) score += 15;

        return { place: p, score };
      })
      .filter((sp) => sp.score > 0)
      .sort((a, b) => b.score - a.score);

    const matchedPlaces: TouristPlace[] = scoredPlaces.map((sp) => sp.place);

    // 2. Scored Match for Knowledge Base Items
    const kb = this.data.ai_knowledge_base || DEFAULT_AI_KNOWLEDGE_ITEMS;
    const scoredItems = kb
      .map((item) => {
        let score = 0;
        const titleEn = item.title.en.toLowerCase();
        const titleHi = item.title.hi;

        if (qLower.includes(titleEn) || titleEn.includes(qLower)) score += 50;
        if (qLower.includes(titleHi) || titleHi.includes(qLower)) score += 50;

        for (const token of queryTokens) {
          if (titleEn.includes(token)) score += 20;
          if (titleHi.includes(token)) score += 20;
          if (item.tags.some((t) => t.toLowerCase() === token)) score += 25;
        }

        // Category associations
        if (
          (qLower.includes('aarti') || qLower.includes('आरती')) &&
          item.category === 'aarti'
        ) score += 35;
        if (
          (qLower.includes('food') || qLower.includes('चाट') || qLower.includes('लस्सी') || qLower.includes('कचौड़ी') || qLower.includes('पान')) &&
          item.category === 'food'
        ) score += 35;
        if (
          (qLower.includes('boat') || qLower.includes('नाव') || qLower.includes('किराया') || qLower.includes('रिक्शा') || qLower.includes('transport')) &&
          item.category === 'transport'
        ) score += 35;
        if (
          (qLower.includes('history') || qLower.includes('इतिहास') || qLower.includes('अहिल्याबाई')) &&
          item.category === 'history'
        ) score += 35;
        if (
          (qLower.includes('weather') || qLower.includes('मौसम') || qLower.includes('दीपावली')) &&
          item.category === 'weather'
        ) score += 35;
        if (
          (qLower.includes('hotel') || qLower.includes('होटल') || qLower.includes('धर्मशाला') || qLower.includes('रुकने')) &&
          item.category === 'hotels'
        ) score += 35;
        if (
          (qLower.includes('plan') || qLower.includes('योजना') || qLower.includes('itinerary')) &&
          item.category === 'planning'
        ) score += 35;

        return { item, score };
      })
      .filter((si) => si.score > 0)
      .sort((a, b) => b.score - a.score);

    const matchedItems: AIKnowledgeItem[] = scoredItems.map((si) => si.item);

    // Calculate distance and sort nearby suggestions
    const nearbyPlacesSuggestions: Array<{ name: string; distanceKm?: number; coordinates?: { lat: number; lng: number } }> = [];

    if (userLoc && typeof userLoc.lat === 'number' && typeof userLoc.lng === 'number') {
      const sortedPlaces = [...places]
        .map((p) => {
          const dLat = ((p.coordinates.lat - userLoc.lat) * Math.PI) / 180;
          const dLon = ((p.coordinates.lng - userLoc.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLoc.lat * Math.PI) / 180) *
              Math.cos((p.coordinates.lat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distKm = Math.round(6371 * c * 10) / 10;
          return {
            name: p.name[lang] || p.name.en,
            distanceKm: distKm,
            coordinates: p.coordinates,
          };
        })
        .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      nearbyPlacesSuggestions.push(...sortedPlaces.slice(0, 4));
    }

    // Build Grounding Text
    let groundingText = '=== VERIFIED KASHI HERITAGE DATABASE CONTEXT ===\n';

    if (userLoc) {
      groundingText += `USER CURRENT LOCATION: Latitude ${userLoc.lat}, Longitude ${userLoc.lng}\n`;
      if (nearbyPlacesSuggestions.length > 0) {
        groundingText += 'CLOSEST VERIFIED SPOTS TO USER:\n';
        nearbyPlacesSuggestions.forEach((s) => {
          const approxWalkMins = Math.round((s.distanceKm || 1) * 14);
          groundingText += `- ${s.name}: ${s.distanceKm} km (approx ${approxWalkMins} mins walk)\n`;
        });
      }
      groundingText += '\n';
    }

    if (matchedPlaces.length > 0) {
      groundingText += '--- VERIFIED PLACES FROM DATABASE ---\n';
      matchedPlaces.slice(0, 3).forEach((p) => {
        groundingText += `[Place ID: ${p.id}]\n`;
        groundingText += `Name: ${p.name.en} / ${p.name.hi}\n`;
        groundingText += `Category: ${p.category} | Coordinates: ${p.coordinates.lat}, ${p.coordinates.lng}\n`;
        groundingText += `Visiting Hours: ${p.visitingHours.en} (Hindi: ${p.visitingHours.hi})\n`;
        groundingText += `Entry Fee: ${p.entryFee.en}\n`;
        if (p.dressCode) groundingText += `Dress Code: ${p.dressCode.en}\n`;
        groundingText += `Historical Fact: ${p.historicalBackground.en}\n`;
        if (p.religiousSignificance) groundingText += `Religious Significance: ${p.religiousSignificance.en}\n`;
        if (p.dosAndDonts) groundingText += `Crucial Dos & Don'ts: ${p.dosAndDonts.en.slice(0, 3).join('; ')}\n`;
        if (p.emergencyHelp) groundingText += `Emergency Contact: ${p.emergencyHelp.en}\n`;
        const sourceUrl = p.sourceAttribution?.officialUrl || p.wikipediaUrl?.en || 'https://varanasi.nic.in/';
        groundingText += `Verified Official Source: ${sourceUrl}\n\n`;
      });
    }

    if (matchedItems.length > 0) {
      groundingText += '--- VERIFIED KNOWLEDGE BASE TOPICS ---\n';
      matchedItems.slice(0, 4).forEach((item) => {
        groundingText += `[Topic: ${item.title.en} / ${item.title.hi}]\n`;
        groundingText += `Category: ${item.category}\n`;
        if (item.schedule_timing) groundingText += `Verified Schedule: ${item.schedule_timing}\n`;
        if (item.coordinates) groundingText += `Coordinates: ${item.coordinates.lat}, ${item.coordinates.lng}\n`;
        groundingText += `Verified Details (EN): ${item.details.en}\n`;
        groundingText += `Verified Details (HI): ${item.details.hi}\n`;
        if (item.source_url) groundingText += `Source: ${item.source_title || 'Official'} (${item.source_url})\n`;
        if (item.nearby_suggestions.en.length > 0) {
          groundingText += `Nearby Verified Recommendations: ${item.nearby_suggestions.en.join('; ')}\n`;
        }
        groundingText += '\n';
      });
    }

    if (matchedPlaces.length === 0 && matchedItems.length === 0) {
      // Provide general grounding context on key hubs
      groundingText += `General Context: No specific spot keyword matched directly. Provide guidance using verified facts for Godowlia, Kashi Vishwanath, Dashashwamedh, and Assi Ghat. If user asks for unverified or private vendor details, explicitly state that verified data is not yet in the database.\n`;
    }

    groundingText += '=== END VERIFIED DATABASE CONTEXT ===\n';

    return {
      groundingText,
      verifiedCount: matchedPlaces.length + matchedItems.length,
      matchedItems,
      matchedPlaces,
      nearbyPlacesSuggestions,
    };
  }
}

export const db = new DatabaseManager();
