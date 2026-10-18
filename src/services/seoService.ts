import { VARANASI_PLACES } from '../data/varanasiPlaces';
import { TouristPlace } from '../types/tourist';
import { SeoPageRecord, buildPlaceJsonLd, buildDestinationJsonLd, buildWebSiteJsonLd } from '../db/seoDefaults';

class SeoService {
  private cache: Map<string, SeoPageRecord> = new Map();
  private isInitialized = false;

  constructor() {
    this.prepopulateClientCache();
  }

  /**
   * Pre-populate client cache with instant verified metadata
   */
  private prepopulateClientCache() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kashiyatra.in';

    // Home
    this.cache.set('/', {
      id: 'seo_home',
      page_name: 'Home - Interactive Varanasi Map & Heritage Guide',
      page_type: 'home',
      route_pattern: '/',
      meta_title: 'Kashi Yatra | Varanasi Smart Tourist Guide & Heritage Navigation',
      meta_description:
        'Explore sacred Varanasi with interactive pedestrian navigation, verified temple history, live Ganga Ghats map, Aarti schedules, and AI pilgrim guidance.',
      meta_keywords: 'Varanasi tourist guide, Kashi Yatra, Kashi Vishwanath, Dashashwamedh Ghat, Varanasi navigation, Ganga Aarti timing',
      canonical_url: `${origin}/`,
      og_title: 'Kashi Yatra | Varanasi Smart Tourist Guide & Heritage Navigation',
      og_description: 'Discover sacred Varanasi with walking directions, verified temple history, ghat Aarti timings, and AI pilgrim assistance.',
      og_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      og_type: 'website',
      twitter_card: 'summary_large_image',
      twitter_title: 'Kashi Yatra | Varanasi Smart Tourist Guide & Navigation',
      twitter_description: 'Discover sacred Varanasi with walking directions, verified temple history, and AI pilgrim assistance.',
      twitter_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      robots_index: true,
      robots_follow: true,
      structured_data_json: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [buildWebSiteJsonLd(origin), buildDestinationJsonLd(origin)],
      }),
      status: 'published',
      priority: 1.0,
      change_freq: 'daily',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    // Guide
    this.cache.set('/guide', {
      id: 'seo_guide',
      page_name: 'Heritage Guide & Essential Pilgrim Etiquette',
      page_type: 'guide',
      route_pattern: '/guide',
      meta_title: 'Varanasi Heritage & Cultural Guide | Rituals, Ghats & Tips',
      meta_description:
        'Comprehensive pilgrim guide to Varanasi: explore 84 ghats, Ganga Aarti viewing protocols, temple dress codes, boat fare guidelines, and sacred traditions.',
      meta_keywords: 'Varanasi heritage guide, Kashi ghats rituals, Ganga Aarti dress code, Varanasi boat fares, Kashi pilgrim etiquette',
      canonical_url: `${origin}/guide`,
      og_title: 'Complete Varanasi Heritage & Cultural Guide | Kashi Yatra',
      og_description: 'Practical visitor guide to Varanasi: Ghat etiquette, temple dress codes, boat guidelines, and sacred rituals.',
      og_image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
      og_type: 'article',
      twitter_card: 'summary_large_image',
      twitter_title: 'Varanasi Heritage & Cultural Guide | Kashi Yatra',
      twitter_description: 'Practical visitor guide to Varanasi: Ghat etiquette, temple dress codes, boat guidelines, and sacred rituals.',
      twitter_image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
      robots_index: true,
      robots_follow: true,
      structured_data_json: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Essential Varanasi Heritage & Cultural Guide for Pilgrims',
      }),
      status: 'published',
      priority: 0.9,
      change_freq: 'weekly',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    // Plan Tour
    this.cache.set('/plan-tour', {
      id: 'seo_planner',
      page_name: 'Smart Multi-Stop Tour Planner',
      page_type: 'planner',
      route_pattern: '/plan-tour',
      meta_title: 'Varanasi Tour Planner | Custom Multi-Stop Walking Circuit',
      meta_description:
        'Plan your personalized Varanasi tour circuit. Optimize walking routes across Kashi Vishwanath, Dashashwamedh, Manikarnika, and Assi Ghat with distance calculation.',
      meta_keywords: 'Varanasi tour planner, Kashi walking circuit, Varanasi itinerary 1 day 2 days, ghats walking tour map',
      canonical_url: `${origin}/plan-tour`,
      og_title: 'Varanasi Tour Planner | Custom Multi-Stop Walking Circuit',
      og_description: 'Build custom walking tours through Varanasi with live distance calculation and turn-by-turn navigation.',
      og_image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
      og_type: 'website',
      twitter_card: 'summary_large_image',
      twitter_title: 'Varanasi Tour Planner | Custom Multi-Stop Walking Circuit',
      twitter_description: 'Build custom walking tours through Varanasi with live distance calculation and turn-by-turn navigation.',
      twitter_image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
      robots_index: true,
      robots_follow: true,
      structured_data_json: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Kashi Yatra Tour Planner',
      }),
      status: 'published',
      priority: 0.8,
      change_freq: 'weekly',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    // Attractions
    VARANASI_PLACES.forEach((place) => {
      const route = `/places/${place.id}`;
      this.cache.set(route, {
        id: `seo_place_${place.id}`,
        page_name: `${place.name.en} (${place.name.hi})`,
        page_type: 'place',
        route_pattern: route,
        place_id: place.id,
        meta_title: `${place.name.en} | Darshan, History & Directions | Varanasi`,
        meta_description: `${place.name.en} in Varanasi: ${place.shortIntro.en} Opening hours, darshan timings, history, and walking directions.`.slice(
          0,
          155
        ),
        meta_keywords: `${place.name.en}, ${place.name.hi}, Varanasi ${place.category}, visit ${place.name.en}, Kashi attractions`,
        canonical_url: `${origin}${route}`,
        og_title: `${place.name.en} - ${place.subtitle.en} | Kashi Yatra`,
        og_description: place.shortIntro.en,
        og_image: place.image,
        og_type: 'place',
        twitter_card: 'summary_large_image',
        twitter_title: `${place.name.en} | Varanasi Guide`,
        twitter_description: place.shortIntro.en.slice(0, 180),
        twitter_image: place.image,
        robots_index: true,
        robots_follow: true,
        structured_data_json: JSON.stringify(buildPlaceJsonLd(place, origin)),
        status: 'published',
        priority: 0.9,
        change_freq: 'weekly',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    });
  }

  /**
   * Initialize and fetch custom overrides from backend
   */
  public async init() {
    if (this.isInitialized) return;
    try {
      const res = await fetch('/api/seo/all');
      if (res.ok) {
        const data = await res.json();
        if (data.pages && Array.isArray(data.pages)) {
          data.pages.forEach((p: SeoPageRecord) => {
            const cleanPattern = p.route_pattern.replace(/\/$/, '') || '/';
            this.cache.set(cleanPattern, p);
          });
        }
      }
      this.isInitialized = true;
    } catch (e) {
      // Offline or network error - cache already populated with defaults
    }
  }

  /**
   * Apply SEO metadata to the active document
   */
  public applySeo(path: string, fallbackPlace?: TouristPlace) {
    if (typeof document === 'undefined') return;

    const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
    let record = this.cache.get(cleanPath);

    if (!record && fallbackPlace) {
      record = this.cache.get(`/places/${fallbackPlace.id}`);
    }

    if (!record && cleanPath.startsWith('/places/')) {
      const placeId = cleanPath.replace('/places/', '');
      const place = VARANASI_PLACES.find((p) => p.id === placeId);
      if (place) {
        record = this.cache.get(`/places/${place.id}`);
      }
    }

    if (!record) {
      record = this.cache.get('/');
    }

    if (!record) return;

    // 1. Title
    document.title = record.meta_title;

    // 2. Meta Description
    this.setOrCreateMetaTag('description', record.meta_description, false);

    // 3. Meta Keywords
    if (record.meta_keywords) {
      this.setOrCreateMetaTag('keywords', record.meta_keywords, false);
    }

    // 4. Robots
    const robotsContent = `${record.robots_index ? 'index' : 'noindex'}, ${record.robots_follow ? 'follow' : 'nofollow'}`;
    this.setOrCreateMetaTag('robots', robotsContent, false);

    // 5. Canonical Link
    this.setOrCreateCanonical(record.canonical_url);

    // 6. OpenGraph
    this.setOrCreateMetaTag('og:title', record.og_title || record.meta_title, true);
    this.setOrCreateMetaTag('og:description', record.og_description || record.meta_description, true);
    this.setOrCreateMetaTag('og:image', record.og_image, true);
    this.setOrCreateMetaTag('og:url', record.canonical_url, true);
    this.setOrCreateMetaTag('og:type', record.og_type || 'website', true);
    this.setOrCreateMetaTag('og:site_name', 'Kashi Yatra - Varanasi Smart Tourist Guide', true);

    // 7. Twitter Card
    this.setOrCreateMetaTag('twitter:card', record.twitter_card || 'summary_large_image', false);
    this.setOrCreateMetaTag('twitter:title', record.twitter_title || record.meta_title, false);
    this.setOrCreateMetaTag('twitter:description', record.twitter_description || record.meta_description, false);
    this.setOrCreateMetaTag('twitter:image', record.twitter_image || record.og_image, false);

    // 8. Structured Data JSON-LD
    if (record.structured_data_json) {
      this.setStructuredData(record.structured_data_json);
    }
  }

  private setOrCreateMetaTag(nameOrProperty: string, content: string, isProperty = false) {
    const attr = isProperty ? 'property' : 'name';
    let tag = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, nameOrProperty);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  private setOrCreateCanonical(url: string) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setStructuredData(jsonString: string) {
    try {
      // Validate before inserting
      JSON.parse(jsonString);
      let scriptTag = document.getElementById('kashi-dynamic-jsonld');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'kashi-dynamic-jsonld';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = jsonString;
    } catch (e) {
      // Ignore invalid JSON in runtime tag
    }
  }

  /**
   * Helper to sync URL state cleanly without full page reloads
   */
  public pushUrl(path: string) {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      this.applySeo(path);
    }
  }
}

export const seoService = new SeoService();
