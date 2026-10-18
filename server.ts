import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/db/database';
import { validateJsonLd } from './src/db/seoDefaults';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Express middlewares
app.use(express.json());
app.use(cookieParser());

// Initialize Google GenAI if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Google GenAI SDK:', err);
  }
}

// Admin secret token
const ADMIN_EMAIL = 'admin@kashiyatra.in';
const ADMIN_PASSWORD = 'KashiAdmin@2026';
const ADMIN_TOKEN = 'kashi_admin_secret_token_2026';

// Middleware to extract or create Guest UUID
function getGuestUuid(req: express.Request, res: express.Response): string {
  let guestUuid = req.cookies?.kashi_guest_id || req.headers['x-guest-uuid'];
  if (!guestUuid || typeof guestUuid !== 'string') {
    guestUuid = `guest_${uuidv4()}`;
    res.cookie('kashi_guest_id', guestUuid, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false, // Accessible to client tracking scripts
      sameSite: 'lax',
    });
  }
  return guestUuid;
}

// Middleware for Admin Route Protection
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.kashi_admin_token;

  if (token === ADMIN_TOKEN) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Admin credentials required.' });
}

// ==========================================
// 1. Guest Tracking & Analytics Endpoints
// ==========================================

// Init or resume guest session
app.get('/api/guest/init', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const lang = (req.query.lang as 'en' | 'hi') || 'en';
  const device = (req.query.device as 'mobile' | 'tablet' | 'desktop') || 'mobile';
  const referrer = (req.headers.referer as string) || 'direct';

  const { visitor, session, isNew, account } = db.getOrCreateGuest(guestUuid, lang, device, referrer);

  res.json({
    guestUuid,
    isNew,
    preferredLanguage: visitor.preferred_language,
    freeCreditsRemaining: account.free_credits_remaining,
    availableCredits: account.available_credits,
    sessionId: session.id,
  });
});

// Record Batched or Single Analytics Events
app.post('/api/analytics/events', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const { events } = req.body;

  if (Array.isArray(events)) {
    events.forEach((ev: any) => {
      if (ev.eventType) {
        db.recordEvent(guestUuid, ev.eventType, ev.touristPlaceId, ev.metadata);
      }
    });
  } else if (req.body.eventType) {
    db.recordEvent(guestUuid, req.body.eventType, req.body.touristPlaceId, req.body.metadata);
  }

  res.json({ success: true });
});

// Privacy Data Clear
app.post('/api/analytics/clear-data', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  db.clearGuestData(guestUuid);
  res.clearCookie('kashi_guest_id');
  res.json({ success: true, message: 'All analytics and session data cleared.' });
});

// Tour lifecycle
app.post('/api/tour/create', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const { places, travelMode, lang } = req.body;
  const tour = db.createOrUpdateTour(guestUuid, places || [], travelMode || 'walking', lang || 'en');
  res.json({ tour });
});

app.post('/api/tour/complete', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const { tourId } = req.body;
  const success = db.completeTour(guestUuid, tourId);
  res.json({ success });
});

// Feedback Submission
app.post('/api/feedback', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const {
    tourId,
    overallRating,
    navigationRating,
    easeOfUseRating,
    informationRating,
    preferredLanguage,
    whatLiked,
    problemsEncountered,
    suggestions,
    comments,
  } = req.body;

  const record = db.submitFeedback({
    guest_uuid: guestUuid,
    tour_id: tourId || null,
    overall_rating: Math.min(5, Math.max(1, Number(overallRating) || 5)),
    navigation_rating: Math.min(5, Math.max(1, Number(navigationRating) || 5)),
    ease_of_use_rating: Math.min(5, Math.max(1, Number(easeOfUseRating) || 5)),
    information_rating: Math.min(5, Math.max(1, Number(informationRating) || 5)),
    preferred_language: preferredLanguage === 'hi' ? 'hi' : 'en',
    what_liked: whatLiked,
    problems_encountered: problemsEncountered,
    suggestions: suggestions,
    comments: comments,
  });

  res.json({ success: true, feedback: record });
});

// ==========================================
// 2. Multilingual AI Tourist Assistant
// ==========================================

// Public: Get dynamic AI Assistant Configuration (welcome messages, active categories, prompts)
app.get('/api/ai/config', (req, res) => {
  const config = db.getAIAssistantConfig();
  res.json({
    welcome_message_en: config.welcome_message_en,
    welcome_message_hi: config.welcome_message_hi,
    welcome_subtitle_en: config.welcome_subtitle_en,
    welcome_subtitle_hi: config.welcome_subtitle_hi,
    categories: config.categories.filter((c) => c.is_active).sort((a, b) => a.order - b.order),
    enable_nearby_suggestions: config.enable_nearby_suggestions,
    enable_map_confirmation: config.enable_map_confirmation,
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const { message, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Input length sanitation (max 1000 characters)
  const trimmedMessage = message.trim().slice(0, 1000);
  const lowerQuery = trimmedMessage.toLowerCase();
  const lang: 'en' | 'hi' = context?.lang === 'hi' ? 'hi' : 'en';

  // Resolve user location (coordinates or standard hub)
  let userCoords: { lat: number; lng: number } | undefined = undefined;
  if (context?.userLoc && typeof context.userLoc.lat === 'number' && typeof context.userLoc.lng === 'number') {
    userCoords = { lat: context.userLoc.lat, lng: context.userLoc.lng };
  } else if (context?.manualHubId) {
    if (context.manualHubId === 'godowlia') userCoords = { lat: 25.3094, lng: 83.0062 };
    else if (context.manualHubId === 'cantt-station') userCoords = { lat: 25.3283, lng: 82.9863 };
    else if (context.manualHubId === 'bhu-gate') userCoords = { lat: 25.2798, lng: 82.9996 };
    else if (context.manualHubId === 'assi-ghat') userCoords = { lat: 25.2917, lng: 83.0067 };
  }

  // 1. Fetch Verified Grounding Context from Database
  const grounding = db.getVerifiedGroundingContext(
    trimmedMessage,
    context?.selectedPlaceName || context?.destinationName,
    userCoords,
    lang
  );

  const aiConfig = db.getAIAssistantConfig();
  const systemInstruction = aiConfig.system_instructions;

  // Build context text
  const contextText = `
CURRENT USER CONTEXT:
- Visitor Selected Language: ${lang === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
- User Current Geolocation: ${userCoords ? `Lat ${userCoords.lat}, Lng ${userCoords.lng}` : 'Not provided'}
- Current Destination in App: ${context?.destinationName || 'None'}
- Selected Place in View: ${context?.selectedPlaceName || 'None'}
- Travel Mode: ${context?.travelMode || 'walking'}

${grounding.groundingText}
`;

  let responseText = '';
  const modelName = 'gemini-3.8-flash';

  try {
    if (aiClient && geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timeout')), 3500)
        );
        const apiPromise = aiClient.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemInstruction}\n\n${contextText}\n\nUser Question: ${trimmedMessage}`,
                },
              ],
            },
          ],
        });
        const response: any = await Promise.race([apiPromise, timeoutPromise]);
        responseText = response.text || '';
      } catch (genErr) {
        console.warn('Gemini API call timed out or network restricted, seamlessly falling back to verified database grounding.');
      }
    }

    if (!responseText) {
      const isTopicQuery =
        lowerQuery.includes('aarti') ||
        lowerQuery.includes('आरती') ||
        lowerQuery.includes('food') ||
        lowerQuery.includes('chaat') ||
        lowerQuery.includes('चाट') ||
        lowerQuery.includes('lassi') ||
        lowerQuery.includes('लस्सी') ||
        lowerQuery.includes('kachori') ||
        lowerQuery.includes('कचौड़ी') ||
        lowerQuery.includes('किराया') ||
        lowerQuery.includes('fare') ||
        lowerQuery.includes('boat') ||
        lowerQuery.includes('नाव') ||
        lowerQuery.includes('weather') ||
        lowerQuery.includes('मौसम') ||
        lowerQuery.includes('hotel') ||
        lowerQuery.includes('होटल') ||
        lowerQuery.includes('dharamshala') ||
        lowerQuery.includes('धर्मशाला');

      // High-fidelity database-grounded response
      if (isTopicQuery && grounding.matchedItems.length > 0) {
        const item = grounding.matchedItems[0];
        responseText = lang === 'hi'
          ? `हर हर महादेव! ${item.title.hi}:\n\n${item.details.hi}\n\n(प्रमाणित स्रोत: ${item.source_title || 'वाराणसी पर्यटन'})`
          : `Har Har Mahadev! ${item.title.en}:\n\n${item.details.en}\n\n(Verified Source: ${item.source_title || 'Varanasi Tourism'})`;
      } else if (grounding.matchedPlaces.length > 0) {
        const p = grounding.matchedPlaces[0];
        if (lang === 'hi') {
          const dress = p.dressCode ? ` | परिधान: ${p.dressCode.hi}` : '';
          responseText = `हर हर महादेव! ${p.name.hi} के बारे में प्रमाणित जानकारी:\n\n` +
            `• ${p.shortIntro.hi}\n` +
            `• दर्शन समय: ${p.visitingHours.hi}\n` +
            `• इतिहास: ${p.historicalBackground.hi}\n` +
            `• प्रवेश शुल्क: ${p.entryFee.hi}${dress}\n\n` +
            `सलाह: पुरानी काशी की गलियों में पैदल चलना सुगम है। वाहनों को गोदौलिया या मैदागिन पार्किंग में रखें।`;
        } else {
          const dress = p.dressCode ? ` | Dress Code: ${p.dressCode.en}` : '';
          responseText = `Har Har Mahadev! Verified details for ${p.name.en}:\n\n` +
            `• ${p.shortIntro.en}\n` +
            `• Visiting Hours: ${p.visitingHours.en}\n` +
            `• History: ${p.historicalBackground.en}\n` +
            `• Entry Fee: ${p.entryFee.en}${dress}\n\n` +
            `Tip: Old Kashi alleys are pedestrianized. Please park vehicles at Godowlia Multi-Level Parking.`;
        }
      } else if (grounding.matchedItems.length > 0) {
        const item = grounding.matchedItems[0];
        responseText = lang === 'hi'
          ? `हर हर महादेव! ${item.title.hi}:\n\n${item.details.hi}\n\n(प्रमाणित स्रोत: ${item.source_title || 'वाराणसी पर्यटन'})`
          : `Har Har Mahadev! ${item.title.en}:\n\n${item.details.en}\n\n(Verified Source: ${item.source_title || 'Varanasi Tourism'})`;
      } else {
        if (lang === 'hi') {
          responseText = `हर हर महादेव! काशी यात्रा AI मार्गदर्शक में आपका स्वागत है।\n\n` +
            `वाराणसी के मुख्य दर्शनीय स्थलों में श्री काशी विश्वनाथ मंदिर, दशाश्वमेध घाट, अस्सी घाट, संकट मोचन और सारनाथ शामिल हैं।\n\n` +
            `• यदि आप किसी विशेष घाट, आरती समय, खान-पान या नौका किराया के बारे में पूछना चाहते हैं, तो कृपया नीचे दिए गए विकल्पों में से चुनें या सीधे नाम लिखकर पूछें।`;
        } else {
          responseText = `Har Har Mahadev! Welcome to your Kashi AI Tourist Guide.\n\n` +
            `Major certified highlights include Shri Kashi Vishwanath Temple, Dashashwamedh Ghat, Assi Ghat, Sankat Mochan, and Sarnath.\n\n` +
            `• Ask about any specific temple, Aarti schedule, local food, or boat fares, and I will pull verified records from our database.`;
        }
      }
    }

    // Determine navigation candidate if directions requested or place found
    let navigationCandidate: {
      placeName: string;
      coordinates: { lat: number; lng: number };
      distanceKm?: number;
      googleMapsUrl: string;
    } | null = null;
    if (grounding.matchedPlaces.length > 0) {
      const targetPlace = grounding.matchedPlaces[0];
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetPlace.coordinates.lat},${targetPlace.coordinates.lng}&travelmode=walking`;
      navigationCandidate = {
        placeName: targetPlace.name[lang] || targetPlace.name.en,
        coordinates: targetPlace.coordinates,
        googleMapsUrl: mapsUrl,
      };
    }

    // Prepare contextual follow-up suggestions
    const suggestions: string[] = [];
    if (grounding.matchedPlaces.length > 0) {
      const p = grounding.matchedPlaces[0];
      if (lang === 'hi') {
        suggestions.push(`${p.name.hi} कैसे पहुंचे?`);
        if (p.category === 'ghat') suggestions.push('आरती का समय व नाव का किराया बताएं');
        else suggestions.push('निकटवर्ती प्रसिद्ध खान-पान क्या है?');
        suggestions.push('क्या आप nearby कुछ और देखना चाहेंगे?');
      } else {
        suggestions.push(`How do I reach ${p.name.en}?`);
        if (p.category === 'ghat') suggestions.push('Aarti timings & boat fares');
        else suggestions.push('Famous food spots nearby');
        suggestions.push('Show nearby heritage spots');
      }
    } else if (grounding.matchedItems.length > 0) {
      const item = grounding.matchedItems[0];
      const nearbyList = lang === 'hi' ? item.nearby_suggestions.hi : item.nearby_suggestions.en;
      if (nearbyList.length > 0) {
        suggestions.push(...nearbyList.slice(0, 3));
      }
    } else {
      if (lang === 'hi') {
        suggestions.push('दशाश्वमेध घाट की गंगा आरती का समय क्या है?');
        suggestions.push('अस्सी घाट के बारे में बताओ');
        suggestions.push('काशी की प्रसिद्ध चाट व कचौड़ी कहाँ मिलती है?');
      } else {
        suggestions.push('What is the timing of Dashashwamedh Aarti?');
        suggestions.push('Tell me about Assi Ghat');
        suggestions.push('Best local street food in Varanasi');
      }
    }

    // Check credits and deduct
    const creditResult = db.checkAndDeductCredits(guestUuid, trimmedMessage, responseText, modelName);

    if (!creditResult.allowed) {
      return res.status(402).json({
        error: 'CREDIT_LIMIT_REACHED',
        message: creditResult.reason,
        remainingFree: creditResult.remainingFree,
        remainingCredits: creditResult.remainingCredits,
      });
    }

    res.json({
      reply: responseText,
      suggestions: suggestions.slice(0, 3),
      verifiedCount: grounding.verifiedCount,
      navigationCandidate,
      remainingFree: creditResult.remainingFree,
      remainingCredits: creditResult.remainingCredits,
      model: modelName,
    });
  } catch (err: any) {
    console.error('AI Chat Error:', err);
    res.status(500).json({
      error: 'AI_ERROR',
      message: lang === 'hi' ? 'सहायक से संपर्क करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Could not process AI request. Please try again.',
    });
  }
});

// Fetch credits balance
app.get('/api/ai/credits', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const guest = db.getOrCreateGuest(guestUuid);

  res.json({
    availableCredits: guest.account.available_credits,
    freeCreditsRemaining: guest.account.free_credits_remaining,
    packages: [
      { id: 'pkg_starter', name: 'Starter Pilgrim', credits: 20, priceInr: 49 },
      { id: 'pkg_explorer', name: 'Heritage Explorer', credits: 50, priceInr: 99, popular: true },
      { id: 'pkg_grand', name: 'Grand Kashi Yatra', credits: 150, priceInr: 199 },
    ],
  });
});

// Purchase credits simulation with secure ledger
app.post('/api/ai/credits/purchase', (req, res) => {
  const guestUuid = getGuestUuid(req, res);
  const { packageId, credits, amountInr, packageName } = req.body;

  if (!credits || credits <= 0) {
    return res.status(400).json({ error: 'Invalid credits amount' });
  }

  const { account, transaction } = db.purchaseCredits(
    guestUuid,
    Number(credits),
    Number(amountInr) || 49,
    packageName || 'Tourist Credit Pack'
  );

  res.json({
    success: true,
    availableCredits: account.available_credits,
    transaction,
  });
});

// ==========================================
// 3. Admin Authentication & Dashboard APIs
// ==========================================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.cookie('kashi_admin_token', ADMIN_TOKEN, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.json({ success: true, token: ADMIN_TOKEN, user: { email, role: 'super_admin' } });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Admin Me
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  res.json({ authenticated: true, user: { email: ADMIN_EMAIL, role: 'super_admin' } });
});

// Admin Analytics Dashboard Stats
app.get('/api/analytics/dashboard', requireAdminAuth, (req, res) => {
  const filter = {
    dateRange: req.query.dateRange as string,
    language: req.query.language as string,
    deviceCategory: req.query.deviceCategory as string,
    visitorType: req.query.visitorType as 'all' | 'new' | 'returning',
    touristPlaceId: req.query.touristPlaceId as string,
  };

  const dashboard = db.getAnalyticsDashboard(filter);
  res.json(dashboard);
});

// Admin Guest Activity Table
app.get('/api/analytics/guest-activity', requireAdminAuth, (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const report = db.getGuestActivityList(page, pageSize);
  res.json(report);
});

// Admin Guest Event Timeline
app.get('/api/analytics/guest-timeline/:guestUuid', requireAdminAuth, (req, res) => {
  const timeline = db.getGuestTimeline(req.params.guestUuid);
  res.json(timeline);
});

// Admin Feedback List & Status Update
app.get('/api/feedback/list', requireAdminAuth, (req, res) => {
  const rating = req.query.rating ? Number(req.query.rating) : undefined;
  const language = req.query.language as string;
  const status = req.query.status as string;

  const list = db.getFeedbackList({ rating, language, status });
  res.json({ feedback: list });
});

app.patch('/api/feedback/:id/status', requireAdminAuth, (req, res) => {
  const { status } = req.body;
  const success = db.updateFeedbackStatus(req.params.id, status);
  res.json({ success });
});

// Admin AI Management & Stats
app.get('/api/admin/ai/stats', requireAdminAuth, (req, res) => {
  const stats = db.getAIManagementStats();
  const config = db.getAIAssistantConfig();
  const knowledgeCount = db.getAIKnowledgeBase().length;
  res.json({
    ...stats,
    config,
    knowledgeCount,
  });
});

app.post('/api/admin/ai/settings', requireAdminAuth, (req, res) => {
  const newSettings = db.updateAISettings(req.body);
  res.json({ success: true, settings: newSettings });
});

// Admin: Get AI Assistant Config (Welcome messages, system instructions, category cards)
app.get('/api/admin/ai/config', requireAdminAuth, (req, res) => {
  const config = db.getAIAssistantConfig();
  res.json({ success: true, config });
});

// Admin: Update AI Assistant Config
app.put('/api/admin/ai/config', requireAdminAuth, (req, res) => {
  try {
    const updated = db.updateAIAssistantConfig(req.body);
    res.json({ success: true, config: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update AI config' });
  }
});

// Admin: Get Verified Knowledge Base Items
app.get('/api/admin/ai/knowledge', requireAdminAuth, (req, res) => {
  const category = req.query.category as string | undefined;
  const q = req.query.q as string | undefined;
  const items = db.getAIKnowledgeBase(category, q);
  res.json({ success: true, items, count: items.length });
});

// Admin: Get single knowledge item
app.get('/api/admin/ai/knowledge/:id', requireAdminAuth, (req, res) => {
  const item = db.getAIKnowledgeItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Knowledge item not found' });
  }
  res.json({ success: true, item });
});

// Admin: Create or Update Knowledge Item
app.post('/api/admin/ai/knowledge', requireAdminAuth, (req, res) => {
  try {
    const saved = db.saveAIKnowledgeItem(req.body);
    res.json({ success: true, item: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save knowledge item' });
  }
});

// Admin: Delete Knowledge Item
app.delete('/api/admin/ai/knowledge/:id', requireAdminAuth, (req, res) => {
  const success = db.deleteAIKnowledgeItem(req.params.id);
  res.json({ success });
});

// Admin: Reset Knowledge Base to Verified Defaults
app.post('/api/admin/ai/knowledge/reset', requireAdminAuth, (req, res) => {
  const items = db.resetAIKnowledgeBase();
  res.json({ success: true, message: 'Reset to verified Kashi knowledge base items', items });
});

// CSV Export
app.get('/api/analytics/export-csv', requireAdminAuth, (req, res) => {
  const report = db.getGuestActivityList(1, 1000);
  const headers = [
    'Guest UUID',
    'First Seen',
    'Last Active',
    'Duration (Mins)',
    'Device',
    'Language',
    'Places Viewed',
    'Searches',
    'Tour Status',
    'Feedback',
  ];

  const rows = report.items.map((item) => [
    item.guest_uuid,
    item.first_seen_at,
    item.last_seen_at,
    item.duration_minutes,
    item.device_category,
    item.preferred_language,
    item.places_viewed_count,
    item.searches_count,
    item.tour_status,
    item.feedback_status,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="kashi_analytics_export.csv"');
  res.send(csv);
});

// ==========================================
// 4. Google Maps API Key Rotation Endpoints
// ==========================================

// Public active config for client app
app.get('/api/maps/active-config', (req, res) => {
  const settings = db.getMapsApiSettings();
  const allKeys = db.getMapsApiKeys();
  const activeKey = allKeys.find((k) => k.id === settings.active_key_id);
  const eligibleCount = allKeys.filter((k) => k.is_enabled && k.is_eligible).length;

  res.json({
    activeKeyId: activeKey?.id || null,
    activeKeyName: activeKey?.key_name || null,
    activeKeyMasked: activeKey?.key_masked || null,
    rotationEnabled: settings.rotation_enabled,
    rotationStrategy: settings.rotation_strategy,
    rotationIntervalSeconds: settings.rotation_interval_seconds,
    nextRotationDueAt: settings.next_rotation_due_at,
    lastRotationAt: settings.last_rotation_at,
    totalEligibleKeys: eligibleCount,
  });
});

// Admin: Get Maps Settings
app.get('/api/admin/maps/settings', requireAdminAuth, (req, res) => {
  const settings = db.getMapsApiSettings();
  res.json(settings);
});

// Admin: Update Maps Settings
app.post('/api/admin/maps/settings', requireAdminAuth, (req, res) => {
  const {
    rotation_enabled,
    rotation_strategy,
    rotation_interval_seconds,
    max_eligible_keys,
    usage_threshold_per_key,
  } = req.body;

  const updated = db.updateMapsApiSettings({
    rotation_enabled: rotation_enabled !== undefined ? Boolean(rotation_enabled) : undefined,
    rotation_strategy: rotation_strategy || undefined,
    rotation_interval_seconds: rotation_interval_seconds ? Number(rotation_interval_seconds) : undefined,
    max_eligible_keys: max_eligible_keys ? Number(max_eligible_keys) : undefined,
    usage_threshold_per_key: usage_threshold_per_key ? Number(usage_threshold_per_key) : undefined,
    updated_by_admin_id: 'admin@kashiyatra.in',
  });

  res.json({ success: true, settings: updated });
});

// Admin: Get All Maps API Keys
app.get('/api/admin/maps/keys', requireAdminAuth, (req, res) => {
  const keys = db.getMapsApiKeys();
  res.json({ keys });
});

// Admin: Add Maps API Key
app.post('/api/admin/maps/keys', requireAdminAuth, (req, res) => {
  const { key_name, raw_key, key_type, rotation_priority } = req.body;
  if (!key_name || !raw_key) {
    return res.status(400).json({ error: 'Key name and raw API key are required' });
  }

  const newKey = db.addMapsApiKey({
    key_name,
    raw_key,
    key_type,
    rotation_priority: Number(rotation_priority) || undefined,
  });

  res.json({ success: true, key: newKey });
});

// Admin: Update Maps API Key
app.patch('/api/admin/maps/keys/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateMapsApiKey(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ success: true, key: updated });
});

// Admin: Delete Maps API Key
app.delete('/api/admin/maps/keys/:id', requireAdminAuth, (req, res) => {
  const success = db.deleteMapsApiKey(req.params.id);
  res.json({ success });
});

// Admin: Validate Key
app.post('/api/admin/maps/keys/:id/validate', requireAdminAuth, (req, res) => {
  const result = db.validateMapsApiKey(req.params.id);
  res.json(result);
});

// Admin: Rotate Key Now
app.post('/api/admin/maps/rotate-now', requireAdminAuth, (req, res) => {
  const { reason } = req.body;
  const result = db.rotateActiveKey('time_based', reason || 'Administrator triggered manual rotation via Admin UI');
  res.json(result);
});

// Admin: Rotation History Log
app.get('/api/admin/maps/history', requireAdminAuth, (req, res) => {
  const history = db.getMapsRotationHistory();
  res.json({ history });
});

// ==========================================
// 5. Secure Live Location Sharing & Tracking
// ==========================================

// Create a new location share (snapshot or live)
app.post('/api/location-share/create', (req, res) => {
  const { shareType, durationMinutes, senderName, latitude, longitude, accuracyMeters, heading, speed } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Valid latitude and longitude coordinates are required' });
  }

  const durationSec = Math.max(300, Math.min(86400, Number(durationMinutes || 60) * 60));
  const validShareType = shareType === 'snapshot' ? 'snapshot' : 'live';

  const result = db.createLocationShare({
    share_type: validShareType,
    sender_name: senderName || 'Kashi Pilgrim',
    duration_seconds: durationSec,
    initial_location: {
      latitude,
      longitude,
      accuracy_meters: accuracyMeters || 10,
      heading: heading ?? undefined,
      speed: speed ?? undefined,
    },
  });

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  const shareUrl = `${protocol}://${host}/shared-location/${result.rawToken}`;

  // Log analytics event
  const guestUuid = getGuestUuid(req, res);
  db.recordEvent(guestUuid, 'route_requested', undefined, {
    action: 'location_share_created',
    shareType: validShareType,
    durationMinutes: Math.round(durationSec / 60),
  });

  res.json({
    success: true,
    shareToken: result.rawToken,
    senderSecret: result.senderSecret,
    shareUrl,
    shareType: result.share.share_type,
    senderName: result.share.sender_name,
    expiresAt: result.share.expires_at,
    durationMinutes: Math.round(result.share.duration_seconds / 60),
    location: result.location,
  });
});

// Get shared location by public token (no secrets exposed)
app.get('/api/location-share/:token', (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const result = db.getLocationShareByToken(token);
  if (!result) {
    return res.status(404).json({ error: 'LOCATION_SHARE_NOT_FOUND', message: 'Location share link is invalid or does not exist.' });
  }

  res.json({
    success: true,
    share: result.share,
    location: result.location,
  });
});

// Update location during live tracking (requires senderSecret)
app.post('/api/location-share/:token/update', (req, res) => {
  const token = req.params.token;
  const { senderSecret, latitude, longitude, accuracyMeters, heading, speed } = req.body;

  if (!token || !senderSecret) {
    return res.status(401).json({ error: 'Token and senderSecret are required' });
  }

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Valid latitude and longitude coordinates are required' });
  }

  const updateResult = db.updateSharedLocation(token, senderSecret, {
    latitude,
    longitude,
    accuracy_meters: accuracyMeters || 10,
    heading,
    speed,
  });

  if (!updateResult.success) {
    return res.status(400).json({ error: updateResult.error });
  }

  res.json({
    success: true,
    share: {
      id: updateResult.share?.id,
      share_token: updateResult.share?.share_token,
      share_type: updateResult.share?.share_type,
      status: updateResult.share?.status,
      last_updated_at: updateResult.share?.last_updated_at,
      update_count: updateResult.share?.update_count,
    },
    location: updateResult.location,
  });
});

// Stop sharing (requires senderSecret)
app.post('/api/location-share/:token/stop', (req, res) => {
  const token = req.params.token;
  const { senderSecret } = req.body;

  if (!token || !senderSecret) {
    return res.status(401).json({ error: 'Token and senderSecret are required' });
  }

  const stopped = db.stopLocationShare(token, senderSecret);
  if (!stopped) {
    return res.status(404).json({ error: 'Could not stop share: invalid token or secret.' });
  }

  res.json({ success: true, message: 'Location sharing stopped successfully.' });
});

// Admin: Location Sharing Stats & Monitoring
app.get('/api/admin/location-shares', requireAdminAuth, (req, res) => {
  const stats = db.getLocationSharingAdminStats();
  res.json(stats);
});

// Admin: Stop a specific location share
app.post('/api/admin/location-shares/:id/stop', requireAdminAuth, (req, res) => {
  const success = db.adminStopLocationShare(req.params.id);
  res.json({ success });
});

// ==========================================
// 6. Dynamic SEO, Sitemap & Robots Endpoints
// ==========================================

// Dynamic sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  const baseUrl = `${protocol}://${host}`;
  const sitemapXml = db.generateSitemapXml(baseUrl);
  res.header('Content-Type', 'application/xml');
  res.send(sitemapXml);
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  const baseUrl = `${protocol}://${host}`;
  const robotsTxt = db.generateRobotsTxt(baseUrl);
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// Public: Get SEO for specific route or URL
const handleGetSeoMetadata = (req: express.Request, res: express.Response) => {
  const queryPath = (req.query.path as string) || (req.query.route as string) || (req.query.url as string) || '/';
  const page = db.getSeoPageByRoute(queryPath);
  if (!page) {
    // If not found, return fallback default
    const fallback = db.getSeoPageByRoute('/');
    return res.json({ found: false, page: fallback, metadata: fallback });
  }
  res.json({ found: true, page, metadata: page });
};
app.get('/api/seo/page', handleGetSeoMetadata);
app.get('/api/seo/metadata', handleGetSeoMetadata);

// Public: Get all published SEO pages
app.get('/api/seo/all', (req, res) => {
  const pages = db.getSeoPages(false);
  res.json({ pages });
});

// Public: Global SEO settings
app.get('/api/seo/settings', (req, res) => {
  const settings = db.getSeoGlobalSettings();
  res.json({ settings });
});

// Admin: Get all SEO pages (including drafts & disabled)
app.get('/api/admin/seo/pages', requireAdminAuth, (req, res) => {
  const pages = db.getSeoPages(true);
  res.json({ pages });
});

// Admin: Get single SEO page
app.get('/api/admin/seo/pages/:id', requireAdminAuth, (req, res) => {
  const page = db.getSeoPageById(req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'SEO page not found' });
  }
  res.json({ page });
});

// Admin: Create new SEO page
app.post('/api/admin/seo/pages', requireAdminAuth, (req, res) => {
  try {
    const created = db.createSeoPage(req.body);
    res.json({ success: true, page: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create SEO page' });
  }
});

// Admin: Update SEO page
app.put('/api/admin/seo/pages/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateSeoPage(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'SEO page not found' });
  }
  res.json({ success: true, page: updated });
});

// Admin: Delete SEO page
app.delete('/api/admin/seo/pages/:id', requireAdminAuth, (req, res) => {
  const deleted = db.deleteSeoPage(req.params.id);
  res.json({ success: deleted });
});

// Admin: Global SEO Settings
app.get('/api/admin/seo/settings', requireAdminAuth, (req, res) => {
  const settings = db.getSeoGlobalSettings();
  res.json({ settings });
});

app.put('/api/admin/seo/settings', requireAdminAuth, (req, res) => {
  const updated = db.updateSeoGlobalSettings(req.body);
  res.json({ success: true, settings: updated });
});

// Admin: Reset SEO Defaults
app.post('/api/admin/seo/reset-defaults', requireAdminAuth, (req, res) => {
  const pages = db.resetSeoDefaults();
  res.json({ success: true, message: 'All SEO entries reset to verified defaults.', pages });
});

// Admin: Validate JSON-LD Schema
app.post('/api/admin/seo/validate-schema', requireAdminAuth, (req, res) => {
  const { json } = req.body;
  const result = validateJsonLd(json);
  res.json(result);
});

// ==========================================
// 7. Dynamic Tourist Places & Location Endpoints
// ==========================================

// Public: Get all active tourist places
app.get('/api/places', (req, res) => {
  const places = db.getTouristPlaces(false);
  res.json({ places, count: places.length });
});

// Public: Get single tourist place by ID
app.get('/api/places/:id', (req, res) => {
  const place = db.getTouristPlaceById(req.params.id);
  if (!place) {
    return res.status(404).json({ error: 'Tourist place not found' });
  }
  res.json({ place });
});

// Admin: Get all places (including inactive / under renovation)
app.get('/api/admin/places', requireAdminAuth, (req, res) => {
  const places = db.getTouristPlaces(true);
  res.json({ places, count: places.length });
});

// Admin: Create new tourist place
app.post('/api/admin/places', requireAdminAuth, (req, res) => {
  try {
    const created = db.createTouristPlace(req.body);
    res.json({ success: true, place: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create tourist place' });
  }
});

// Admin: Update tourist place
app.put('/api/admin/places/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateTouristPlace(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Tourist place not found' });
  }
  res.json({ success: true, place: updated });
});

// Admin: Delete or deactivate tourist place
app.delete('/api/admin/places/:id', requireAdminAuth, (req, res) => {
  const hardDelete = req.query.hard === 'true';
  const success = db.deleteTouristPlace(req.params.id, hardDelete);
  res.json({ success });
});

// Admin: Reset places to default Varanasi places
app.post('/api/admin/places/reset-defaults', requireAdminAuth, (req, res) => {
  const places = db.resetTouristPlaces();
  res.json({ success: true, message: 'All tourist visiting points reset to defaults', places });
});

// ==========================================
// Dynamic SEO HTML Injection Helper
// ==========================================
function injectSeoToHtml(html: string, reqPath: string, baseUrl: string): string {
  if (reqPath.startsWith('/admin')) {
    return html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');
  }

  let seo = db.getSeoPageByRoute(reqPath);

  if (!seo && reqPath.startsWith('/shared-location/')) {
    seo = db.getSeoPageByRoute('/shared-location');
  }

  if (!seo && reqPath.startsWith('/places/')) {
    const placeId = reqPath.replace('/places/', '').split('/')[0];
    const placeSeo = db.getSeoPages(true).find((p) => p.place_id === placeId || p.route_pattern.includes(placeId));
    if (placeSeo) seo = placeSeo;
  }

  if (!seo) {
    seo = db.getSeoPageByRoute('/');
  }

  if (!seo) return html;

  const escapeAttr = (s: string) => (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapeContent = (s: string) => (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const globalSettings = db.getSeoGlobalSettings();
  const canonicalUrl = seo.canonical_url.startsWith('http')
    ? seo.canonical_url
    : `${baseUrl.replace(/\/$/, '')}${seo.route_pattern.startsWith('/') ? '' : '/'}${seo.route_pattern}`;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeContent(seo.meta_title)}</title>`);

  // Replace or inject Meta Description
  if (html.includes('name="description"')) {
    html = html.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeAttr(seo.meta_description)}" />`
    );
  }

  // Build full SEO block
  const seoTags = `
    <!-- Dynamic Server-Injected SEO & Social Metadata -->
    <link rel="canonical" href="${escapeAttr(canonicalUrl)}" />
    <meta name="keywords" content="${escapeAttr(seo.meta_keywords || '')}" />
    <meta name="robots" content="${seo.robots_index ? 'index' : 'noindex'}, ${seo.robots_follow ? 'follow' : 'nofollow'}" />
    <meta property="og:title" content="${escapeAttr(seo.og_title || seo.meta_title)}" />
    <meta property="og:description" content="${escapeAttr(seo.og_description || seo.meta_description)}" />
    <meta property="og:image" content="${escapeAttr(seo.og_image || globalSettings.default_og_image)}" />
    <meta property="og:url" content="${escapeAttr(canonicalUrl)}" />
    <meta property="og:type" content="${escapeAttr(seo.og_type || 'website')}" />
    <meta property="og:site_name" content="${escapeAttr(globalSettings.site_name)}" />
    <meta name="twitter:card" content="${escapeAttr(seo.twitter_card || 'summary_large_image')}" />
    <meta name="twitter:site" content="${escapeAttr(globalSettings.twitter_handle)}" />
    <meta name="twitter:title" content="${escapeAttr(seo.twitter_title || seo.meta_title)}" />
    <meta name="twitter:description" content="${escapeAttr(seo.twitter_description || seo.meta_description)}" />
    <meta name="twitter:image" content="${escapeAttr(seo.twitter_image || seo.og_image || globalSettings.default_og_image)}" />
    ${globalSettings.google_site_verification ? `<meta name="google-site-verification" content="${escapeAttr(globalSettings.google_site_verification)}" />` : ''}
    ${seo.structured_data_json ? `<script type="application/ld+json">\n${seo.structured_data_json}\n</script>` : ''}
  `;

  // Pre-rendered semantic crawler headings
  const preRendered = seo.custom_headings
    ? `
    <!-- Semantic Pre-Rendered Crawler Content -->
    <div id="seo-crawler-content" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">
      <h1>${escapeContent(seo.custom_headings.h1 || seo.page_name)}</h1>
      <h2>${escapeContent(seo.custom_headings.h2 || '')}</h2>
      <p>${escapeContent(seo.custom_headings.intro_text || seo.meta_description)}</p>
    </div>`
    : '';

  html = html.replace('</head>', `${seoTags}\n  </head>`);
  if (preRendered) {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n${preRendered}`);
  }

  return html;
}

// ==========================================
// Vite Dev Server / Static File Serving with SEO
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Custom HTML SEO middleware for direct page visits & crawlers
    app.use(async (req, res, next) => {
      if (
        req.method === 'GET' &&
        !req.path.startsWith('/api') &&
        !req.path.startsWith('/@') &&
        !req.path.startsWith('/src') &&
        !req.path.startsWith('/node_modules') &&
        !req.path.includes('.') &&
        req.accepts('html')
      ) {
        try {
          const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
          const transformed = await vite.transformIndexHtml(req.originalUrl, template);
          const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
          const host = req.get('host') || `localhost:${PORT}`;
          const finalHtml = injectSeoToHtml(transformed, req.path, `${protocol}://${host}`);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
        } catch (e) {
          return next(e);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const template = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.get('host') || `localhost:${PORT}`;
      const finalHtml = injectSeoToHtml(template, req.path, `${protocol}://${host}`);
      res.send(finalHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kashi Yatra Server running on http://0.0.0.0:${PORT}`);
  });
}


startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
