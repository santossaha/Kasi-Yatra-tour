# Kashi Yatra (काशी यात्रा) — Varanasi Smart Tourist Guide & Navigation

An independent, mobile-first tourist navigation and heritage companion web application for Varanasi (Kashi), India. Built with **React 19, TypeScript, Express, Vite, and Tailwind CSS**, it empowers domestic and international visitors to explore ancient temples, historic ghats, cultural monuments, and sacred pilgrimage routes without needing a local guide.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Architecture & Technology Stack](#3-architecture--technology-stack)
4. [Project Directory Structure](#4-project-directory-structure)
5. [Prerequisites](#5-prerequisites)
6. [Local Development Setup](#6-local-development-setup)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Database & Storage Architecture](#8-database--storage-architecture)
9. [Google Maps API Key Management & Automatic Rotation](#9-google-maps-api-key-management--automatic-rotation)
10. [Built-in Multilingual AI Tourist Assistant](#10-built-in-multilingual-ai-tourist-assistant)
11. [Admin Analytics & Intelligence Dashboard](#11-admin-analytics--intelligence-dashboard)
12. [Secure Live Location Sharing & Companion Tracking](#12-secure-live-location-sharing--companion-tracking)
13. [Dynamic Backend SEO Management & Technical Optimization](#13-dynamic-backend-seo-management--technical-optimization)
14. [Live Production Deployment](#14-live-production-deployment)
15. [Troubleshooting Guide](#15-troubleshooting-guide)
16. [Security & Google Cloud Compliance](#16-security--google-cloud-compliance)
17. [Maintenance & Updates](#17-maintenance--updates)

---

## 1. Project Overview

Varanasi is one of the world's oldest continually inhabited cities, featuring an intricate maze of ancient pedestrian alleys (*galis*), 84 sacred riverfront ghats along the Ganges, and historic shrines. Traditional vehicle navigation systems struggle in Varanasi because vehicles cannot enter the narrow heritage galis.

**Kashi Yatra** solves this by offering:
- **Dedicated Pedestrian Navigation**: Navigates alleys, stepped ghat corridors, and riverfront paths.
- **Dedicated Vehicular Navigation**: Identifies vehicle drop-off zones and multi-level parking hubs (e.g., Godowlia Multi-level Parking, Maidagin).
- **Verified History vs. Living Faith**: Strictly distinguishes documented archaeological records (e.g., Ahilyabai Holkar 1780 CE, Sarnath 250 BCE Ashokan relics) from mythological beliefs.
- **Bilingual Interface**: Seamless one-tap switching between English and Hindi across the entire app, navigation directions, and voice readouts.
- **Privacy-First Anonymous Analytics**: Tracks tourist footfall and session patterns without requiring user sign-in.
- **Automated Google Maps Key Rotation**: Distributes API load and protects against quota exhaustion.

---

## 2. Key Features

| Feature | Description |
| :--- | :--- |
| **Interactive Heritage Map** | High-performance map canvas with 12 verified numbered tourist attractions, GPS live-location beacon, and custom markers. |
| **Current Location Detection** | Identifies visitor GPS coordinates. If outside Varanasi or permission denied, offers starting hubs (*Godowlia Chowk*, *Cantt Station*, *BHU Gate*). |
| **Walking vs. Driving Routing** | Pedestrian routing through alleys vs. driving routing with designated parking drop-offs. |
| **Turn-by-Turn HUD Navigation** | Maneuver icons, distance to next turn, ETA, step simulator, voice guidance (Text-to-Speech), and external Google Maps launcher. |
| **Multi-Stop Tour Planner** | Itinerary creator featuring a Nearest-Neighbor Traveling Salesperson (TSP) route optimizer to minimize backtracking. |
| **Mobile-First Bottom Sheet** | Expandable place details sheet with photography, visiting hours, Aarti timings, entry fees, and Wikipedia links. |
| **Multilingual AI Assistant** | Context-aware AI powered by `@google/genai` responding in the active language (Hindi or English) with daily free allowances and prepaid credit packs. |
| **Tour Feedback System** | Post-tour 1–5 star rating modal with comments, problem logs, and an admin review workflow. |
| **Admin Intelligence Dashboard** | Secure portal with 9 metric cards, date/device/language filters, visitor growth charts, guest activity timeline, and CSV export. |
| **Google Maps Key Rotation** | Centralized backend rotation scheduler supporting 2-hour intervals, credential masking (`AIza••••••••1234`), and health testing. |
| **Visitor Safety & Etiquette Guide** | Advice on cremation ghat photography bans (Manikarnika/Harishchandra), boat rates, temple lockers, and emergency helplines. |
| **Secure Live Location Sharing** | Ephemeral, cryptographically secure companion tracking (`/shared-location/:token`) with one-time snapshots, continuous live GPS updates, configurable duration, nearest landmark identification, and instant revocation. |

---

## 3. Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   Client Browser                       │
│  - React 19 SPA (Vite)                                 │
│  - Tailwind CSS v4 + Motion Animations                 │
│  - Interactive Leaflet Map Engine                      │
│  - Web Speech API (Bilingual Voice Directions)         │
│  - Anonymous Guest First-Party Cookie (kashi_guest_id) │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON API
┌──────────────────────────▼─────────────────────────────┐
│               Full-Stack Express Server                │
│  - server.ts running on Port 3000                      │
│  - /api/guest/init: Session & anonymous tracking       │
│  - /api/analytics/*: Batched event ingestion & metrics │
│  - /api/tour/*: Tour planning & completion handling    │
│  - /api/feedback/*: Ratings & review submission        │
│  - /api/ai/*: Multilingual Gemini Assistant & credits  │
│  - /api/maps/*: Google Maps API key rotation service   │
│  - /api/admin/*: Protected intelligence dashboard      │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐
│ Database Storage │               │ External APIs    │
│ - JSON DB Store  │               │ - Gemini Flash   │
│ - data/kashi_    │               │ - OSRM Routing   │
│   store.json     │               │ - CartoDB/OSM    │
│ - Prisma Ready   │               │ - Wikipedia API  │
└──────────────────┘               └──────────────────┘
```

### Core Technologies and Versions
- **Frontend Framework**: React `^19.0.1` + React DOM `^19.0.1`
- **Build Tool**: Vite `^8.3.0` with `@vitejs/plugin-react` `^6.1.1`
- **Backend Runtime**: Node.js v18+ / v20+ with Express `^4.21.2` and `tsx` `^4.21.0`
- **Styling**: Tailwind CSS `^4.3.3` with `@tailwindcss/vite`
- **Icons & Animation**: `lucide-react` `^0.546.0` & `motion` `^12.23.24`
- **Mapping**: `leaflet` `^1.9.4` & `@types/leaflet` `^1.9.22`
- **Routing Engine**: OSRM (Open Source Routing Machine) API with local fallback
- **AI Integration**: Google GenAI TypeScript SDK (`@google/genai` `^2.4.0`)
- **Language**: TypeScript `^7.0.2`

---

## 4. Project Directory Structure

```
.
├── data/
│   └── kashi_store.json            # Persistent JSON database (sessions, keys, analytics)
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx       # Secure admin dashboard (analytics, feedback, maps)
│   │   ├── AIAssistantModal.tsx     # Context-aware AI assistant & credit purchase modal
│   │   ├── FeedbackModal.tsx        # Post-tour rating and review form
│   │   ├── LocationHubBanner.tsx    # Remote user detection & hub switcher (Godowlia, etc.)
│   │   ├── Navbar.tsx               # Top navigation, language toggle & admin button
│   │   ├── NavigationBanner.tsx     # Turn-by-turn HUD banner, voice, and step simulator
│   │   ├── NearbyPlacesCarousel.tsx # Proximity-sorted tourist attraction cards
│   │   ├── PlaceDetailsSheet.tsx    # Mobile-first bottom sheet (history, Aarti, fees)
│   │   ├── PlaceSearch.tsx          # Bilingual search input & category filter
│   │   ├── PrivacyNoticeBanner.tsx  # Transparent analytics notice & data-clear option
│   │   ├── TourPlannerModal.tsx     # Itinerary planner with TSP route optimization
│   │   ├── TouristMap.tsx           # Interactive Leaflet map with custom numbered markers
│   │   └── VaranasiGuideModal.tsx   # Safety, boat rates, etiquette, and emergency numbers
│   ├── data/
│   │   └── varanasiPlaces.ts        # Verified coordinates, documented periods & history
│   ├── db/
│   │   └── database.ts              # DatabaseManager, relational models, and rotation logic
│   ├── services/
│   │   ├── analyticsService.ts      # Debounced client analytics ingestion & cookies
│   │   ├── geolocationService.ts    # Browser Geolocation & Varanasi boundary verification
│   │   ├── mapsKeyRotationService.ts# Centralized Google Maps key rotation scheduler
│   │   ├── routingService.ts        # OSRM walking/driving routing, TSP solver, Google links
│   │   └── speechService.ts         # Web Speech API bilingual text-to-speech
│   ├── types/
│   │   └── tourist.ts               # TypeScript interfaces (Place, Step, Route, Language)
│   ├── App.tsx                      # Main application coordinator
│   ├── index.css                    # Global Tailwind CSS and Leaflet overrides
│   └── main.tsx                     # React DOM entry point
├── .env.example                     # Environment variable template
├── index.html                       # HTML5 entry with fonts and metadata
├── metadata.json                    # AI Studio applet capabilities and permissions
├── package.json                     # Scripts and dependencies
├── server.ts                        # Full-stack Express server with Vite middlewares
├── tsconfig.json                    # TypeScript compiler options
└── vite.config.ts                   # Vite configuration
```

---

## 5. Prerequisites

Before installing the application, verify that your environment meets these requirements:

### Required Software
1. **Node.js**: `v18.0.0` or higher (`v20.x LTS` recommended).
2. **npm**: `v9.0.0` or higher (bundled with Node.js).
3. **Git**: `v2.20.0` or higher.

### Verification Commands
Run the following commands in your terminal to verify installed versions:
```bash
node -v   # Expected: v18.x.x or v20.x.x
npm -v    # Expected: 9.x.x or 10.x.x
git --version # Expected: git version 2.x.x
```

### Optional Accounts & API Credentials
- **Google Cloud Platform**: Required only if configuring custom Google Maps credentials for key rotation or Maps JavaScript API.
- **Gemini AI API Key**: Required for live generative responses from `@google/genai`. If omitted, the app uses a built-in offline response engine.

---

## 6. Local Development Setup

Follow these numbered steps to run the application locally:

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd varanasi-tourist-guide
```

### Step 2: Install Dependencies
Install all required npm packages:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment template into a local `.env` file:
```bash
cp .env.example .env
```
Open `.env` in your text editor. At minimum, you can run immediately with the default placeholders.

### Step 4: Storage Initialization
The application uses an automatic storage engine at `data/kashi_store.json`.
- When the server starts for the first time, it automatically creates `data/kashi_store.json`.
- It seeds realistic analytics, guest visitor sessions, sample feedback reviews, and three pre-configured Google Maps credentials (*Key A*, *Key B*, *Key C*) for key rotation testing.
- No manual SQL migrations or database setup commands are required for development.

### Step 5: Start the Full-Stack Application
Start the development server:
```bash
npm run dev
```
The server will boot via `tsx server.ts` and mount Vite's development middleware:
```
🚀 Kashi Yatra Server running on http://0.0.0.0:3000
```

### Step 6: Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

### Step 7: Functional Verification Checklist
- [ ] **Interactive Map**: The map centers on Varanasi with numbered tourist markers.
- [ ] **Location Detection**: Click the target icon. If granted, your position is shown. If outside Varanasi, it sets Godowlia Chowk as the starting hub.
- [ ] **Route Calculation**: Click on any place (e.g., *Point 1: Shri Kashi Vishwanath Temple*), switch between **Walk** and **Drive**, and click **Start Navigation**.
- [ ] **Bilingual Switch**: Click the **EN / हिं** toggle in the header. The entire UI, route instructions, and place descriptions switch instantly.
- [ ] **Multi-Stop Tour**: Click **Plan Tour**, reorder places, click **Optimize Order**, and start navigation.
- [ ] **AI Assistant**: Click the floating **AI Guide** button at the bottom right. Ask a question in English or Hindi.
- [ ] **Tour Completion**: During navigation, click **Done / यात्रा पूर्ण**. The 1–5 star Feedback Modal will appear.
- [ ] **Admin Portal**: Click **Admin** in the header. Log in with `admin@kashiyatra.in` and `KashiAdmin@2026`.
- [ ] **Key Rotation**: In the Admin Portal, open the **Maps API Settings** tab and click **Rotate Key Now**.

---

## 7. Environment Variables Reference

| Variable Name | Required? | Default / Example | Purpose & Source |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `3000` | Port for the Express server. |
| `NODE_ENV` | Optional | `development` | Set to `production` in live environments. |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API Key for AI responses. Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey). |
| `APP_URL` | Optional | `http://localhost:3000` | Fully qualified domain URL of the deployed application. |
| `GOOGLE_MAPS_BROWSER_KEY` | Optional | `""` | Optional Google Maps JavaScript browser key. |

*Note: Raw Google Maps credentials added through the Admin Portal are encrypted and stored inside `data/kashi_store.json`. Never commit `.env` to Git.*

---

## 8. Database & Storage Architecture

The application contains a structured relational schema managed by `DatabaseManager` (`src/db/database.ts`):

### Core Tables
1. **`guest_visitors`**: Anonymous visitor records, `guest_uuid`, first/last seen timestamps, preferred language, consent status.
2. **`visitor_sessions`**: Sessions, duration, device category (*mobile*, *tablet*, *desktop*), referrer, status.
3. **`analytics_events`**: Chronological events (`page_view`, `place_details_opened`, `route_requested`, `tour_completed`, `search_performed`, `ai_message_sent`).
4. **`tours` & `tour_stops`**: Tour definitions, selected stops, travel mode, completion timestamps.
5. **`feedback`**: Star ratings (overall, navigation, ease-of-use, information), comments, reported problems, review status.
6. **`ai_usage_records`**: AI interactions, prompt/response previews, tokens consumed, internal credits deducted.
7. **`guest_credit_accounts` & `credit_transactions`**: Free daily quotas, available prepaid credits, purchase ledger.
8. **`maps_api_keys`**: Credential pool, encrypted keys, masked values (`AIza••••••••1234`), health results, observed requests.
9. **`maps_api_settings`**: Active key ID, strategy (*time_based*, *usage_based*, *health_fallback*), interval seconds, next due timestamp.
10. **`maps_key_rotation_history`**: Audit trail of every rotation event, trigger reason, and status.

### Backups and Data Clearance
- To back up data: Copy `data/kashi_store.json` to a safe storage location.
- To reset demo data: Delete `data/kashi_store.json` and restart the server; it will automatically re-seed.

---

## 9. Google Maps API Key Management & Automatic Rotation

To distribute API load across different credentials and prevent unexpected quota exhaustion, the app features an automated key rotation engine.

### How It Works
1. **Centralized Backend Scheduler**: The server runs an interval ticker (`GoogleMapsKeyRotationService`) that checks the persistent timestamp `next_rotation_due_at`.
2. **Deterministic Rotation**: When the interval elapses (e.g., every 2 hours), the system atomically switches the active key to the next eligible key in priority order.
3. **Unified Client Delivery**: Browsers fetch active configuration via `/api/maps/active-config`. All visitors transition simultaneously.
4. **Preserved Navigation**: Key rotation preserves the active destination, map zoom level, user GPS beacon, and calculated route without reloading the page.
5. **Credential Masking**: Only masked fingerprints (`AIza••••••••1234`) are returned via API responses.

### Configuring Rotation in Admin Panel
1. Access the **Admin Portal** by clicking **Admin** in the header.
2. Sign in with:
   - **Email**: `admin@kashiyatra.in`
   - **Password**: `KashiAdmin@2026`
3. Click the **Maps API Settings** tab.
4. Set the **Rotation Interval** (options: 15 min, 30 min, 1 hour, **2 hours**, 4 hours, 6 hours).
5. Choose a **Rotation Strategy**:
   - *Time-Based*: Rotates automatically after the elapsed duration.
   - *Usage-Based*: Rotates when observed requests hit the threshold.
   - *Health-Based Fallback*: Preserves the key until an error is detected.
6. Add new credentials using **Add Key** with automatic format validation.
7. Click **Rotate Key Now** to trigger an immediate manual rotation with reason logging.

---

## 10. Built-in Multilingual AI Tourist Assistant

The AI Tourist Assistant is integrated into the map, place details, and navigation screens.

### Capabilities
- Ingests active context: Selected tourist attraction, current travel mode (walking vs. vehicle), next navigation instruction, and verified historical records.
- Speaks the active language: Responds in polite Hindi when the application is set to Hindi (*"हर हर महादेव..."*) or English when set to English.
- Grounded in Varanasi facts: Enforces photography bans at cremation ghats, provides fixed boat rates, explains temple lockers, and gives emergency helpline numbers (Tourist Police `112`).

### Free Quota & Prepaid Credit System
- **Free Allowance**: Every guest receives **5 free AI queries per day**.
- **Friendly Credit Limit Notice**: When the quota is exhausted, visitors receive a prompt offering either **"Continue Without AI"** (leaving maps and the entire guide 100% free) or **"Purchase AI Credits"**.
- **Credit Packages**:
  - *Starter Pilgrim*: 20 credits (₹49)
  - *Heritage Explorer*: 50 credits (₹99)
  - *Grand Kashi Yatra*: 150 credits (₹199)

---

## 11. Admin Analytics & Intelligence Dashboard

The Admin Portal provides real-time operational visibility:

### 1. Overview Tab
- **9 Metric Cards**: Total Visits, Unique Visitors, New vs. Returning, Avg Session Duration, Places Viewed, Tours Completed, Feedback Rating, AI Usage, and Walk vs. Drive ratio.
- **Interactive Charts**: Daily visitor growth bar chart and top 6 most-visited Varanasi locations.

### 2. Guest Activity Tab
- Paginated table of anonymous visitor sessions with device type, language, duration, and places viewed.
- Click **View Timeline** on any guest to view their event stream (*1. Opened app → 2. Selected Hindi → 3. Viewed Kashi Vishwanath → 4. Started navigation → 5. Completed tour → 6. Submitted feedback*).

### 3. Feedback Tab
- Lists all visitor feedback with star ratings, comments, and reported navigation issues.
- Allows administrators to mark reviews as **Reviewed** or **Resolved**.

### 4. AI Management Tab
- View total AI requests, token revenue, and configure daily free message allowances.

### 5. Maps API Settings Tab
- Live active key monitor, countdown to next rotation, manual rotate button, credentials pool table, and rotation audit history.

### 6. Location Shares Tab
- Monitor active companion tracking sessions across Varanasi, view live vs. snapshot distribution, track GPS update volume, and force-terminate active shares if requested.

---

## 12. Secure Live Location Sharing & Companion Tracking

To help tourists find companions, family members, or tour groups among the bustling ghats and alleys of Varanasi, the app includes a secure live location sharing engine.

### How It Works
1. **Sharing Modes**:
   - **One-time Snapshot**: Shares the tourist's current stationary coordinates.
   - **Live Location Tracking**: Continuously updates the tourist's position via browser geolocation `watchPosition` and background heartbeat pings.
2. **Cryptographic Unpredictable Links**:
   - Generates links in the format: `https://your-domain.com/shared-location/SECURE_TOKEN`.
   - Never exposes internal user IDs, sequential numbers, or raw GPS coordinates in the URL.
3. **Configurable Expiry**:
   - Options for 15m, 30m, 1 hour (default), 2h, 4h, 8h, or custom durations up to 24 hours.
   - Automatically lapses when time expires.
4. **Recipient Experience**:
   - Accessible on any mobile or desktop browser without requiring an account.
   - Live Leaflet map with pulsing tourist beacon and accuracy radius.
   - **Nearest Varanasi Landmark**: Calculates spatial distance to the nearest iconic site (e.g., *"140m from Dashashwamedh Ghat"*).
   - **"Get Route to Tourist"**: Requests the viewer's location and calculates walking/driving routes with distance and ETA to the tourist.
   - **External Map Link**: One-click "Open in Google Maps" launcher.
   - Direct emergency helpline access (Tourist Police `112`).
5. **Privacy Safeguards**:
   - **Sender Secret Protection**: Only the sharer's browser holds the secret needed to push updates or stop the share.
   - **No Surveillance History**: The backend overwrites the latest coordinate snapshot; no historical breadcrumb movement trail is permanently retained.
   - **Instant Revocation**: Clicking **Stop Sharing** immediately marks the token as ended on the server.

---

## 13. Dynamic Backend SEO Management & Technical Optimization

Kashi Yatra incorporates a centralized, dynamic SEO engine with full administrative control, server-side crawler meta injection, dynamic XML sitemaps, robots.txt directives, and Schema.org JSON-LD structured data.

### Key Capabilities

1. **Server-Side Dynamic Meta Tag Injection**:
   - When search engines (Googlebot, Bingbot) or social scrapers (WhatsApp, Twitter, Facebook, Slack) request public routes (`/`, `/places/:slug`, `/guide`, `/plan-tour`), `server.ts` injects dynamic `<title>`, `<meta name="description">`, `<link rel="canonical">`, OpenGraph, Twitter Cards, and Schema.org JSON-LD directly into the rendered HTML before serving.
   - Crawlers receive full heritage metadata without requiring JavaScript execution.

2. **Automated XML Sitemap (`/sitemap.xml`)**:
   - Served dynamically with `Content-Type: application/xml`.
   - Automatically indexes all published pages, priority ratings (e.g., 1.0 for Home, 0.9 for Ghats & Temples), and change frequencies (`daily`, `weekly`).
   - Automatically excludes private user tokens, `/api/*`, and `/admin/*`.

3. **Configurable Robots Directives (`/robots.txt`)**:
   - Served dynamically with `Content-Type: text/plain`.
   - Allows public routes while explicitly disallowing private APIs (`/api/`), administrative portals (`/admin`), and private location sessions (`/shared-location/`).
   - Dynamically references the absolute `Sitemap:` URL.

4. **Schema.org JSON-LD Structured Data**:
   - `TouristAttraction` for all 12+ Varanasi places with `GeoCoordinates`, opening hours, admission details, and address.
   - `TouristDestination` for Varanasi (Kashi / Banaras) with connected attractions.
   - `WebSite` with `SearchAction` deep-linking.
   - `BreadcrumbList` and `Article` schema for cultural guides.

5. **Admin SEO Management Module (`/admin` -> SEO Management)**:
   - **Page Listing & Filters**: Search by keyword or filter by type (`home`, `place`, `guide`, `planner`, `custom`) and publish status.
   - **Visual Snippet Preview**: Real-time Google Search Result Preview (with desktop vs. mobile toggle) and Social Share Card Preview.
   - **Character Length Guidance**: Real-time length meters for Meta Title (recommended 30–60 chars) and Meta Description (recommended 120–160 chars).
   - **JSON-LD Schema Validator**: Syntax check and Schema.org structure validation with Beautify and Auto-Generate buttons.
   - **One-Click Reset Defaults**: Restores verified historical metadata across all attractions in one click.
   - **Global SEO Settings**: Configures site brand name, base URL, default OG images, and custom robots rules.

---

## 14. Live Production Deployment

### Production Build
Build the optimized client bundle:
```bash
npm run build
```
This outputs static assets into the `dist/` directory.

### Running in Production
Start the production server:
```bash
NODE_ENV=production npm start
```
The Express server will serve static production assets from `dist/` and handle all `/api/*` endpoints on port 3000.

### Recommended Production Platforms
1. **Google Cloud Run / Docker**:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```
2. **Render / Railway / VPS**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variable**: `NODE_ENV=production`

---

## 15. Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 3000 Already in Use** | Another local process is listening on port 3000. | Run `lsof -i :3000` and kill the conflicting PID, or start with `PORT=3001 npm run dev`. |
| **Location Permission Denied** | The browser blocked geolocation access. | The app automatically defaults to Godowlia Chowk. To re-enable, click the padlock icon in the browser address bar and allow location access. |
| **User Outside Varanasi** | Physical coordinates are outside Varanasi. | Normal behavior. The app detects this and sets your starting hub to Godowlia Chowk so you can plan routes. |
| **AI Assistant Returns Fallback Message** | `GEMINI_API_KEY` is not set or quota was reached. | The app uses a built-in knowledge responder so queries never break. Add a valid key to `.env` to enable live generative AI. |
| **Google Maps Key Validation Failed** | Key does not start with `AIza` or length is invalid. | Ensure you copied the full Google Cloud API key starting with `AIza` and having 35–42 characters. |
| **Voice Directions Not Speaking** | Browser speech synthesis is muted or unsupported. | Click the speaker icon in the navigation HUD to unmute. Ensure system volume is turned on. |

---

## 16. Security & Google Cloud Compliance

1. **Zero Secret Exposure**:
   - Raw Google Maps keys and payment credentials are encrypted server-side in `data/kashi_store.json`.
   - Frontend API endpoints only return masked values (`AIza••••••••1234`).
2. **Website Referrer Restrictions**:
   - In Google Cloud Console, restrict browser API keys to your authorized domains (e.g., `https://your-domain.com/*` and `http://localhost:3000/*`).
3. **Quota Protection**:
   - Key rotation distributes legitimate load across configured project credentials without circumvention of Google Cloud Terms of Service.
4. **Privacy Compliance**:
   - Precise GPS movements are never recorded to the database. Interactions are logged as high-level tourist place IDs.
   - Visitors can delete all their session and analytics records using **Clear My Data** on the privacy banner.

---

## 17. Maintenance & Updates

### Updating Tourist Locations
To add or modify temples, ghats, or Aarti timings:
1. Open `src/data/varanasiPlaces.ts`.
2. Add or update items in `VARANASI_PLACES` with verified GPS coordinates, bilingual text, documented eras, and Wikipedia URLs.
3. Run `npm run lint` to verify TypeScript types.

### Running TypeScript Verification
```bash
npm run lint
```

### Pre-Configured Administrator Credentials
- **Login URL**: Click the **Admin** button in the header (or navigate to `/admin`).
- **Email**: `admin@kashiyatra.in`
- **Password**: `KashiAdmin@2026`

---

## License

This project is licensed under the **Apache-2.0 License**.

