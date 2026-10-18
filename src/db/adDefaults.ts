export type AdPosition = 'top' | 'bottom' | 'left' | 'right' | 'middle' | 'listing' | 'detail';
export type AdPageType = 'home' | 'place' | 'guide' | 'planner' | 'shared_location' | 'all';
export type AdDeviceTarget = 'desktop' | 'tablet' | 'mobile';
export type AdFormat = 'auto' | 'horizontal' | 'rectangle' | 'vertical';
export type AdStatus = 'active' | 'paused' | 'disabled';
export type AdFallbackBehavior = 'collapse' | 'subtle_box' | 'pilgrim_tip';

export interface AdPlacement {
  id: string;
  placement_key: string;
  placement_name: string;
  ad_slot: string;
  position: AdPosition;
  page_types: AdPageType[];
  device_targets: AdDeviceTarget[];
  enabled: boolean;
  delay_seconds: number;
  min_interval_seconds: number;
  session_limit: number;
  daily_limit: number;
  ad_format: AdFormat;
  responsive: boolean;
  start_at?: string | null;
  end_at?: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface AdSettings {
  id: string;
  global_enabled: boolean;
  publisher_id: string;
  test_mode: boolean;
  default_delay_seconds: number;
  default_min_interval_seconds: number;
  default_session_limit: number;
  default_daily_limit: number;
  consent_required: boolean;
  fallback_behavior: AdFallbackBehavior;
  emergency_kill_switch: boolean;
  updated_at: string;
  created_at: string;
}

export interface AdOperationalStats {
  totalPlacements: number;
  activePlacements: number;
  globalEnabled: boolean;
  testMode: boolean;
  publisherIdConfigured: boolean;
  totalImpressionsLogged: number;
  impressionsByPlacement: Record<string, number>;
  impressionsByDevice: Record<string, number>;
  lastImpressionAt: string | null;
}

export const DEFAULT_AD_SETTINGS: AdSettings = {
  id: 'ad_settings_default',
  global_enabled: true,
  publisher_id: 'ca-pub-6829104829102847', // Sample publisher ID (can be updated by admin anytime)
  test_mode: true, // Defaults to test mode so ads are safe during prototyping
  default_delay_seconds: 5,
  default_min_interval_seconds: 30,
  default_session_limit: 8,
  default_daily_limit: 20,
  consent_required: true,
  fallback_behavior: 'pilgrim_tip',
  emergency_kill_switch: false,
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

export const DEFAULT_AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'ad_p_top_banner',
    placement_key: 'placement_top_banner',
    placement_name: 'Top Navigation Sub-Banner',
    ad_slot: '1092837461',
    position: 'top',
    page_types: ['all'],
    device_targets: ['desktop', 'tablet', 'mobile'],
    enabled: true,
    delay_seconds: 5,
    min_interval_seconds: 45,
    session_limit: 6,
    daily_limit: 15,
    ad_format: 'horizontal',
    responsive: true,
    priority: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad_p_bottom_banner',
    placement_key: 'placement_bottom_banner',
    placement_name: 'Bottom Footer Responsive Bar',
    ad_slot: '2093848572',
    position: 'bottom',
    page_types: ['all'],
    device_targets: ['desktop', 'tablet', 'mobile'],
    enabled: true,
    delay_seconds: 8,
    min_interval_seconds: 60,
    session_limit: 4,
    daily_limit: 12,
    ad_format: 'horizontal',
    responsive: true,
    priority: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad_p_left_sidebar',
    placement_key: 'placement_left_sidebar',
    placement_name: 'Desktop Left Sidebar Ad',
    ad_slot: '3049586721',
    position: 'left',
    page_types: ['home', 'guide', 'planner'],
    device_targets: ['desktop'], // Strict desktop target to protect mobile UX
    enabled: true,
    delay_seconds: 10,
    min_interval_seconds: 60,
    session_limit: 5,
    daily_limit: 15,
    ad_format: 'vertical',
    responsive: false,
    priority: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad_p_right_sidebar',
    placement_key: 'placement_right_sidebar',
    placement_name: 'Desktop Right Sidebar Ad',
    ad_slot: '4092837465',
    position: 'right',
    page_types: ['home', 'guide', 'planner'],
    device_targets: ['desktop'], // Strict desktop target
    enabled: true,
    delay_seconds: 12,
    min_interval_seconds: 60,
    session_limit: 5,
    daily_limit: 15,
    ad_format: 'vertical',
    responsive: false,
    priority: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad_p_listing_feed',
    placement_key: 'placement_listing_feed',
    placement_name: 'Tourist Places In-Feed Placement',
    ad_slot: '5093827164',
    position: 'listing',
    page_types: ['home'],
    device_targets: ['desktop', 'tablet', 'mobile'],
    enabled: true,
    delay_seconds: 6,
    min_interval_seconds: 30,
    session_limit: 6,
    daily_limit: 18,
    ad_format: 'auto',
    responsive: true,
    priority: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad_p_middle_content',
    placement_key: 'placement_middle_content',
    placement_name: 'Middle Content Divider Ad',
    ad_slot: '6094837261',
    position: 'middle',
    page_types: ['guide', 'planner'],
    device_targets: ['desktop', 'tablet', 'mobile'],
    enabled: true,
    delay_seconds: 10,
    min_interval_seconds: 60,
    session_limit: 4,
    daily_limit: 10,
    ad_format: 'rectangle',
    responsive: true,
    priority: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad_p_detail_sheet',
    placement_key: 'placement_detail_sheet',
    placement_name: 'Tourist Place Detail Modal Ad',
    ad_slot: '7093847261',
    position: 'detail',
    page_types: ['place'],
    device_targets: ['desktop', 'tablet', 'mobile'],
    enabled: true,
    delay_seconds: 5,
    min_interval_seconds: 40,
    session_limit: 5,
    daily_limit: 12,
    ad_format: 'auto',
    responsive: true,
    priority: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
