import { TouristPlace } from '../types/tourist';
import { VARANASI_PLACES } from '../data/varanasiPlaces';

export interface SeoPageRecord {
  id: string;
  page_name: string;
  page_type: 'home' | 'place' | 'guide' | 'planner' | 'shared_location' | 'custom';
  route_pattern: string; // e.g. '/', '/places/kashi-vishwanath', '/guide', '/plan-tour'
  place_id?: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: 'website' | 'article' | 'place';
  twitter_card: 'summary' | 'summary_large_image';
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  robots_index: boolean;
  robots_follow: boolean;
  structured_data_json: string; // stringified JSON-LD schema
  custom_headings?: {
    h1?: string;
    h2?: string;
    intro_text?: string;
  };
  status: 'published' | 'draft' | 'disabled';
  priority: number; // 0.1 to 1.0
  change_freq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  updated_at: string;
  created_at: string;
}

export interface SeoGlobalSettings {
  site_name: string;
  default_title_suffix: string;
  default_meta_description: string;
  default_og_image: string;
  site_url: string;
  twitter_handle: string;
  google_site_verification?: string;
  enable_auto_sitemap: boolean;
  enable_rich_snippets: boolean;
  robots_txt_custom?: string;
  updated_at: string;
}

export const DEFAULT_SEO_GLOBAL_SETTINGS: SeoGlobalSettings = {
  site_name: 'Kashi Yatra - Varanasi Smart Tourist Guide',
  default_title_suffix: ' | Kashi Yatra Varanasi',
  default_meta_description:
    'Experience the timeless spiritual capital of India with smart pedestrian & driving navigation, live Ghats map, Aarti schedules, verified temple history, and AI pilgrim assistance.',
  default_og_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
  site_url: 'https://kashiyatra.in',
  twitter_handle: '@KashiYatraGuide',
  google_site_verification: 'google-site-verification-kashi-yatra-2026',
  enable_auto_sitemap: true,
  enable_rich_snippets: true,
  robots_txt_custom: '# Custom crawler rules for Kashi Yatra\nUser-agent: Googlebot\nAllow: /\nUser-agent: Bingbot\nAllow: /\n',
  updated_at: new Date().toISOString(),
};

/**
 * Builds Schema.org JSON-LD for a specific tourist attraction
 */
export function buildPlaceJsonLd(place: TouristPlace, siteUrl: string): object {
  const placeUrl = `${siteUrl.replace(/\/$/, '')}/places/${place.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.name.en,
    alternateName: place.name.hi,
    description: place.shortIntro.en,
    url: placeUrl,
    image: [place.image],
    touristType: ['Pilgrim', 'Heritage Traveler', 'Spiritual Explorer', 'Cultural Enthusiast'],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.coordinates.lat,
      longitude: place.coordinates.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Varanasi',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
      postalCode: '221001',
    },
    isAccessibleForFree: place.entryFee?.en?.toLowerCase().includes('free') ?? true,
    publicAccess: true,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: place.rating || 4.8,
      reviewCount: 1250,
      bestRating: 5,
      worstRating: 1,
    },
    openingHours: place.visitingHours?.en || 'Mo-Su 05:00-21:00',
  };
}

/**
 * Builds Schema.org JSON-LD for the primary destination (Varanasi)
 */
export function buildDestinationJsonLd(siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: 'Varanasi (Kashi / Banaras)',
    alternateName: 'काशी / वाराणसी',
    description:
      'The sacred city of light, Lord Shiva, and the Holy Ganges, celebrated as one of the continuously inhabited oldest living cities in the world.',
    url: siteUrl,
    touristType: ['Spiritual Pilgrimage', 'Cultural Heritage', 'Ghat Exploration', 'Ancient Philosophy'],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.3109,
      longitude: 83.0104,
    },
    hasPart: VARANASI_PLACES.map((p) => ({
      '@type': 'TouristAttraction',
      name: p.name.en,
      url: `${siteUrl.replace(/\/$/, '')}/places/${p.id}`,
    })),
  };
}

/**
 * Builds Schema.org WebSite JSON-LD
 */
export function buildWebSiteJsonLd(siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kashi Yatra - Varanasi Smart Tourist Guide',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl.replace(/\/$/, '')}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate initial default SEO records
 */
export function generateDefaultSeoPages(places: TouristPlace[] = VARANASI_PLACES, siteUrl = 'https://kashiyatra.in'): SeoPageRecord[] {
  const now = new Date().toISOString();
  const pages: SeoPageRecord[] = [];

  // 1. Home Page
  pages.push({
    id: 'seo_home',
    page_name: 'Home - Interactive Varanasi Map & Heritage Guide',
    page_type: 'home',
    route_pattern: '/',
    meta_title: 'Kashi Yatra | Varanasi Smart Tourist Guide & Heritage Navigation',
    meta_description:
      'Explore sacred Varanasi with interactive pedestrian navigation, verified temple history, live Ganga Ghats map, Aarti schedules, and AI pilgrim guidance.',
    meta_keywords:
      'Varanasi tourist guide, Kashi Yatra, Kashi Vishwanath, Dashashwamedh Ghat, Manikarnika, Varanasi navigation, Ganga Aarti timing',
    canonical_url: `${siteUrl}/`,
    og_title: 'Kashi Yatra | Varanasi Smart Tourist Guide & Heritage Navigation',
    og_description:
      'Discover sacred Varanasi with walking directions, verified temple history, ghat Aarti timings, and AI pilgrim assistance.',
    og_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    twitter_title: 'Kashi Yatra | Varanasi Smart Tourist Guide & Navigation',
    twitter_description:
      'Discover sacred Varanasi with walking directions, verified temple history, and AI pilgrim assistance.',
    twitter_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    robots_index: true,
    robots_follow: true,
    structured_data_json: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': [buildWebSiteJsonLd(siteUrl), buildDestinationJsonLd(siteUrl)],
      },
      null,
      2
    ),
    custom_headings: {
      h1: 'Kashi Yatra: Smart Tourist Guide to Varanasi',
      h2: 'Explore Sacred Ghats, Ancient Jyotirlingas & Heritage Alleys',
      intro_text:
        'Welcome to Kashi Yatra, the verified digital companion for spiritual seekers and cultural explorers in Varanasi. Navigate labyrinthine lanes, discover Aarti schedules, and uncover thousands of years of living history.',
    },
    status: 'published',
    priority: 1.0,
    change_freq: 'daily',
    updated_at: now,
    created_at: now,
  });

  // 2. Guide Page
  pages.push({
    id: 'seo_guide',
    page_name: 'Heritage Guide & Essential Pilgrim Etiquette',
    page_type: 'guide',
    route_pattern: '/guide',
    meta_title: 'Varanasi Heritage & Cultural Guide | Rituals, Ghats & Tips',
    meta_description:
      'Comprehensive pilgrim guide to Varanasi: explore 84 ghats, Ganga Aarti viewing protocols, temple dress codes, boat fare guidelines, and sacred traditions.',
    meta_keywords:
      'Varanasi heritage guide, Kashi ghats rituals, Ganga Aarti dress code, Varanasi boat fares, Kashi pilgrim etiquette',
    canonical_url: `${siteUrl}/guide`,
    og_title: 'Complete Varanasi Heritage & Cultural Guide | Kashi Yatra',
    og_description:
      'Practical visitor guide to Varanasi: Ghat etiquette, temple dress codes, boat guidelines, and sacred rituals.',
    og_image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
    og_type: 'article',
    twitter_card: 'summary_large_image',
    twitter_title: 'Varanasi Heritage & Cultural Guide | Kashi Yatra',
    twitter_description:
      'Practical visitor guide to Varanasi: Ghat etiquette, temple dress codes, boat guidelines, and sacred rituals.',
    twitter_image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
    robots_index: true,
    robots_follow: true,
    structured_data_json: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Essential Varanasi Heritage & Cultural Guide for Pilgrims',
        description: 'Complete guide to rituals, 84 ghats, dress codes, and boat etiquette in Varanasi.',
        author: { '@type': 'Organization', name: 'Kashi Yatra Editorial Team' },
        publisher: { '@type': 'Organization', name: 'Kashi Yatra', url: siteUrl },
      },
      null,
      2
    ),
    custom_headings: {
      h1: 'Complete Varanasi Pilgrim & Heritage Guide',
      h2: 'Sacred Rituals, Temple Etiquette, and Cultural Insights',
      intro_text:
        'A comprehensive reference for first-time visitors and spiritual pilgrims navigating the 84 sacred ghats, ancient alleyways, and temple protocols of Varanasi.',
    },
    status: 'published',
    priority: 0.9,
    change_freq: 'weekly',
    updated_at: now,
    created_at: now,
  });

  // 3. Tour Planner Page
  pages.push({
    id: 'seo_planner',
    page_name: 'Smart Multi-Stop Tour Planner',
    page_type: 'planner',
    route_pattern: '/plan-tour',
    meta_title: 'Varanasi Tour Planner | Custom Multi-Stop Walking Circuit',
    meta_description:
      'Plan your personalized Varanasi tour circuit. Optimize walking routes across Kashi Vishwanath, Dashashwamedh, Manikarnika, and Assi Ghat with distance calculation.',
    meta_keywords:
      'Varanasi tour planner, Kashi walking circuit, Varanasi itinerary 1 day 2 days, ghats walking tour map',
    canonical_url: `${siteUrl}/plan-tour`,
    og_title: 'Varanasi Tour Planner | Custom Multi-Stop Walking Circuit',
    og_description:
      'Build custom walking tours through Varanasi with live distance calculation and turn-by-turn navigation.',
    og_image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    twitter_title: 'Varanasi Tour Planner | Custom Multi-Stop Walking Circuit',
    twitter_description:
      'Build custom walking tours through Varanasi with live distance calculation and turn-by-turn navigation.',
    twitter_image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    robots_index: true,
    robots_follow: true,
    structured_data_json: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Kashi Yatra Tour Planner',
        applicationCategory: 'TravelApplication',
        operatingSystem: 'All',
        description: 'Interactive multi-stop walking tour planner for sacred Varanasi.',
      },
      null,
      2
    ),
    custom_headings: {
      h1: 'Varanasi Multi-Stop Heritage Tour Planner',
      h2: 'Design Your Custom Pilgrim Circuit Across Ancient Kashi',
      intro_text:
        'Select temples, ghats, and cultural landmarks to generate an optimized itinerary with walking distances, travel durations, and turn-by-turn directions.',
    },
    status: 'published',
    priority: 0.8,
    change_freq: 'weekly',
    updated_at: now,
    created_at: now,
  });

  // 4. Shared Location Template Page (Private tracker template - noindex by default for user privacy)
  pages.push({
    id: 'seo_shared_location',
    page_name: 'Secure Live Location Tracking',
    page_type: 'shared_location',
    route_pattern: '/shared-location',
    meta_title: 'Live Location Tracker | Kashi Yatra Pilgrim Safety',
    meta_description:
      'Secure, private live location sharing for companions and family members navigating Varanasi ghats and temples together.',
    meta_keywords: 'Varanasi location sharing, live pilgrim tracker, safe travel in Varanasi',
    canonical_url: `${siteUrl}/shared-location`,
    og_title: 'Live Location Sharing | Kashi Yatra',
    og_description: 'Secure, private live location sharing for pilgrims and companions in Varanasi.',
    og_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    og_type: 'website',
    twitter_card: 'summary',
    twitter_title: 'Live Location Sharing | Kashi Yatra',
    twitter_description: 'Secure, private live location sharing for pilgrims in Varanasi.',
    twitter_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    robots_index: false, // Private by default to protect user location
    robots_follow: false,
    structured_data_json: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Kashi Yatra Live Location Sharing',
        description: 'Temporary encrypted peer-to-peer location tracking service for Varanasi tourists.',
      },
      null,
      2
    ),
    custom_headings: {
      h1: 'Live Location Sharing & Tourist Safety',
      h2: 'Find Your Family & Travel Companions in Varanasi',
      intro_text:
        'Temporary, privacy-focused live location tracking designed specifically for the narrow, crowded alleys and vibrant ghats of Kashi.',
    },
    status: 'published',
    priority: 0.3,
    change_freq: 'monthly',
    updated_at: now,
    created_at: now,
  });

  // 5. Individual Tourist Places (All 12+ attractions!)
  places.forEach((place) => {
    const slug = place.id;
    const placeUrl = `${siteUrl}/places/${slug}`;
    const cleanIntro = place.shortIntro?.en?.replace(/"/g, "'") || '';
    const cleanTitle = `${place.name.en} | Darshan, History & Directions | Varanasi`;

    pages.push({
      id: `seo_place_${place.id}`,
      page_name: `${place.name.en} (${place.name.hi})`,
      page_type: 'place',
      route_pattern: `/places/${slug}`,
      place_id: place.id,
      meta_title: cleanTitle,
      meta_description: `${place.name.en} in Varanasi: ${cleanIntro} Opening hours, darshan timings, history, and walking directions.`.slice(
        0,
        155
      ),
      meta_keywords: `${place.name.en}, ${place.name.hi}, Varanasi ${place.category}, visit ${place.name.en}, Kashi attractions`,
      canonical_url: placeUrl,
      og_title: `${place.name.en} - ${place.subtitle.en} | Kashi Yatra`,
      og_description: cleanIntro,
      og_image: place.image,
      og_type: 'place',
      twitter_card: 'summary_large_image',
      twitter_title: `${place.name.en} | Varanasi Guide`,
      twitter_description: cleanIntro.slice(0, 180),
      twitter_image: place.image,
      robots_index: true,
      robots_follow: true,
      structured_data_json: JSON.stringify(buildPlaceJsonLd(place, siteUrl), null, 2),
      custom_headings: {
        h1: place.name.en,
        h2: place.subtitle.en,
        intro_text: place.shortIntro.en,
      },
      status: 'published',
      priority: place.category === 'temple' || place.category === 'ghat' ? 0.9 : 0.8,
      change_freq: 'weekly',
      updated_at: now,
      created_at: now,
    });
  });

  return pages;
}

/**
 * Validates JSON-LD input string
 */
export function validateJsonLd(jsonString: string): { valid: boolean; error?: string; parsed?: any } {
  if (!jsonString || !jsonString.trim()) {
    return { valid: false, error: 'Structured data JSON is empty.' };
  }
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed['@context'] && !parsed['@graph']) {
      return {
        valid: false,
        error: "JSON-LD schema should include '@context': 'https://schema.org' or '@graph'.",
        parsed,
      };
    }
    return { valid: true, parsed };
  } catch (err: any) {
    return { valid: false, error: `Invalid JSON syntax: ${err.message}` };
  }
}

/**
 * Generates dynamic sitemap.xml
 */
export function generateSitemapXml(pages: SeoPageRecord[], baseUrl = 'https://kashiyatra.in'): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const publishedPages = pages.filter((p) => p.status === 'published' && p.robots_index);

  const xmlUrls = publishedPages
    .map((p) => {
      const fullLoc = p.canonical_url.startsWith('http')
        ? p.canonical_url
        : `${cleanBase}${p.route_pattern.startsWith('/') ? '' : '/'}${p.route_pattern}`;
      const lastModDate = (p.updated_at ? new Date(p.updated_at) : new Date()).toISOString().split('T')[0];
      const priority = (p.priority ?? 0.8).toFixed(1);
      const changeFreq = p.change_freq || 'weekly';

      return `  <url>
    <loc>${escapeXml(fullLoc)}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

/**
 * Generates dynamic robots.txt
 */
export function generateRobotsTxt(settings: SeoGlobalSettings, baseUrl = 'https://kashiyatra.in'): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const sitemapUrl = `${cleanBase}/sitemap.xml`;

  return `# robots.txt for Kashi Yatra - Varanasi Smart Tourist Guide
User-agent: *
Allow: /
Allow: /places/
Allow: /guide
Allow: /plan-tour
Disallow: /api/
Disallow: /admin
Disallow: /shared-location/

# Sitemaps
Sitemap: ${sitemapUrl}

${settings.robots_txt_custom || ''}
`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
