import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Coins,
  Bot,
  User,
  AlertCircle,
  ShoppingBag,
  MapPin,
  Flame,
  Landmark,
  Utensils,
  BookOpen,
  Compass,
  Hotel,
  CloudSun,
  Bus,
  ChevronRight,
  Navigation,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Languages,
  CheckCircle2,
} from 'lucide-react';
import { Language, TouristPlace, TravelMode } from '../types/tourist';
import { VARANASI_HUBS } from '../data/varanasiPlaces';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  selectedPlace: TouristPlace | null;
  destinationPlace: TouristPlace | null;
  travelMode: TravelMode;
  currentNavInstruction?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  verifiedCount?: number;
  suggestions?: string[];
  navigationCandidate?: {
    placeName: string;
    coordinates: { lat: number; lng: number };
    googleMapsUrl: string;
  } | null;
}

interface CategoryConfig {
  id: string;
  name_en: string;
  name_hi: string;
  subtitle_en: string;
  subtitle_hi: string;
  icon: string;
  quick_prompts_en: string[];
  quick_prompts_hi: string[];
  order: number;
  is_active: boolean;
}

interface AIConfigResponse {
  welcome_message_en: string;
  welcome_message_hi: string;
  welcome_subtitle_en: string;
  welcome_subtitle_hi: string;
  categories: CategoryConfig[];
  enable_nearby_suggestions: boolean;
  enable_map_confirmation: boolean;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  lang: initialLang,
  selectedPlace,
  destinationPlace,
  travelMode,
  currentNavInstruction,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [freeCredits, setFreeCredits] = useState<number>(5);
  const [paidCredits, setPaidCredits] = useState<number>(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Dynamic AI configuration from backend
  const [aiConfig, setAiConfig] = useState<AIConfigResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Location state (GPS or manual hub)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

  // Navigation Confirmation Modal State
  const [confirmingNavigation, setConfirmingNavigation] = useState<{
    placeName: string;
    url: string;
    coords?: { lat: number; lng: number };
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initial language if changed externally
  useEffect(() => {
    setCurrentLang(initialLang);
  }, [initialLang]);

  // Fetch dynamic AI configuration and user credits on mount
  useEffect(() => {
    fetchAIConfig();
    fetchCredits();
  }, []);

  // Update initial welcome message when config or language changes
  useEffect(() => {
    if (!aiConfig) return;

    const welcomeText =
      currentLang === 'hi' ? aiConfig.welcome_message_hi : aiConfig.welcome_message_en;

    // If chat is empty or contains only welcome, refresh the welcome message
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === 'welcome_msg')) {
      setMessages([
        {
          id: 'welcome_msg',
          sender: 'assistant',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions:
            currentLang === 'hi'
              ? [
                  'दशाश्वमेध घाट की गंगा आरती का समय क्या है?',
                  'अस्सी घाट के बारे में बताओ',
                  'काशी की सबसे प्रसिद्ध टमाटर चाट कहाँ मिलती है?',
                ]
              : [
                  'What is the verified timing of Dashashwamedh Aarti?',
                  'Tell me about Assi Ghat',
                  'Where to find authentic Banarasi street food?',
                ],
        },
      ]);
    }
  }, [aiConfig, currentLang]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, selectedCategory]);

  const fetchAIConfig = async () => {
    try {
      const res = await fetch('/api/ai/config');
      if (res.ok) {
        const data = await res.json();
        setAiConfig(data);
      }
    } catch (e) {
      console.warn('Could not fetch dynamic AI config, using built-in defaults:', e);
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/ai/credits');
      if (res.ok) {
        const data = await res.json();
        setFreeCredits(data.freeCreditsRemaining ?? 5);
        setPaidCredits(data.availableCredits ?? 0);
      }
    } catch (e) {
      console.warn('Could not fetch AI credits:', e);
    }
  };

  // Request browser geolocation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationName(currentLang === 'hi' ? 'लाइव जीपीएस स्थिति' : 'Live GPS Location');
        setLocationStatus('granted');
        setShowLocationPicker(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setLocationStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Select a manual hub
  const handleSelectHub = (hub: (typeof VARANASI_HUBS)[0]) => {
    setUserCoords(hub.coordinates);
    setLocationName(hub.name[currentLang] || hub.name.en);
    setLocationStatus('granted');
    setShowLocationPicker(false);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          context: {
            lang: currentLang,
            selectedPlaceName: selectedPlace?.name[currentLang] || undefined,
            destinationName: destinationPlace?.name[currentLang] || undefined,
            travelMode,
            nextInstruction: currentNavInstruction || undefined,
            userLoc: userCoords || undefined,
          },
        }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error === 'CREDIT_LIMIT_REACHED') {
        setShowPurchaseModal(true);
        const limitMsg: ChatMessage = {
          id: `limit_${Date.now()}`,
          sender: 'system',
          text:
            currentLang === 'hi'
              ? 'आपकी दैनिक निशुल्क AI सहायता सीमा पूरी हो चुकी है। आप सामान्य पर्यटक गाइड का उपयोग जारी रख सकते हैं या अतिरिक्त AI क्रेडिट ले सकते हैं।'
              : "You've reached your free daily AI query limit. You can continue browsing the guide or add more AI credits.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, limitMsg]);
      } else if (res.ok) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verifiedCount: data.verifiedCount,
          suggestions: data.suggestions,
          navigationCandidate: data.navigationCandidate,
        };
        setMessages((prev) => [...prev, botMsg]);
        setFreeCredits(data.remainingFree);
        setPaidCredits(data.remainingCredits);
      } else {
        throw new Error(data.message || 'AI request failed');
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'system',
        text:
          currentLang === 'hi'
            ? 'क्षमा करें, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, could not process request right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    if (!aiConfig) return;
    const welcomeText =
      currentLang === 'hi' ? aiConfig.welcome_message_hi : aiConfig.welcome_message_en;
    setMessages([
      {
        id: 'welcome_msg',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions:
          currentLang === 'hi'
            ? [
                'दशाश्वमेध घाट की गंगा आरती का समय क्या है?',
                'अस्सी घाट के बारे में बताओ',
                'काशी की सबसे प्रसिद्ध टमाटर चाट कहाँ मिलती है?',
              ]
            : [
                'What is the verified timing of Dashashwamedh Aarti?',
                'Tell me about Assi Ghat',
                'Where to find authentic Banarasi street food?',
              ],
      },
    ]);
    setSelectedCategory(null);
  };

  // Map category icon strings to Lucide components
  const renderCategoryIcon = (iconName: string) => {
    const iconClass = 'w-4 h-4 shrink-0';
    switch (iconName) {
      case 'Flame':
        return <Flame className={`${iconClass} text-orange-500`} />;
      case 'Landmark':
        return <Landmark className={`${iconClass} text-amber-600`} />;
      case 'Utensils':
        return <Utensils className={`${iconClass} text-red-500`} />;
      case 'BookOpen':
        return <BookOpen className={`${iconClass} text-indigo-600`} />;
      case 'Compass':
        return <Compass className={`${iconClass} text-emerald-600`} />;
      case 'Hotel':
        return <Hotel className={`${iconClass} text-blue-600`} />;
      case 'CloudSun':
        return <CloudSun className={`${iconClass} text-amber-500`} />;
      case 'Bus':
        return <Bus className={`${iconClass} text-teal-600`} />;
      case 'MapPin':
      default:
        return <MapPin className={`${iconClass} text-amber-600`} />;
    }
  };

  // Trigger Google Maps confirmation dialog
  const handleOpenGoogleMaps = (candidate: { placeName: string; googleMapsUrl: string; coordinates?: { lat: number; lng: number } }) => {
    setConfirmingNavigation({
      placeName: candidate.placeName,
      url: candidate.googleMapsUrl,
      coords: candidate.coordinates,
    });
  };

  const handleConfirmNavigation = () => {
    if (confirmingNavigation?.url) {
      window.open(confirmingNavigation.url, '_blank', 'noopener,noreferrer');
    }
    setConfirmingNavigation(null);
  };

  if (!isOpen) return null;

  const categories = aiConfig?.categories || [];

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-50 w-full sm:w-[420px] sm:max-h-[640px] h-full sm:h-[640px] bg-white sm:rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden font-sans">
      {/* 1. Header with Heritage Gradient & Language Toggle */}
      <div className="p-3 bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-900/80 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold leading-tight flex items-center gap-1.5 text-white">
              <span>{currentLang === 'hi' ? 'काशी यात्रा AI सहायक' : 'Kashi AI Tourist Guide'}</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-400/30">
                Verified
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-200 font-medium">
              <span>
                {freeCredits > 0
                  ? currentLang === 'hi'
                    ? `${freeCredits} निःशुल्क प्रश्न शेष`
                    : `${freeCredits} free queries left today`
                  : currentLang === 'hi'
                  ? `${paidCredits} क्रेडिट शेष`
                  : `${paidCredits} paid credits left`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Language Toggle Button */}
          <button
            onClick={() => setCurrentLang(currentLang === 'hi' ? 'en' : 'hi')}
            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[11px] font-bold text-amber-100 rounded-lg border border-white/15 flex items-center gap-1 transition-all"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentLang === 'hi' ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Credits Badge / Add button */}
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-2 py-1 bg-amber-600/70 hover:bg-amber-600 text-[11px] font-bold text-amber-100 rounded-lg flex items-center gap-1 border border-amber-400/30 transition-all"
            title="Add Credits"
          >
            <Coins className="w-3 h-3 text-amber-300" />
            <span>{paidCredits}</span>
          </button>

          {/* Reset chat button */}
          <button
            onClick={handleResetChat}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg transition-colors"
            title="New Conversation / नई बातचीत"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Location Context Sub-bar */}
      <div className="px-3 py-1.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-1.5 text-stone-700 truncate max-w-[240px]">
          <Navigation className={`w-3.5 h-3.5 shrink-0 ${locationStatus === 'granted' ? 'text-emerald-600' : 'text-stone-400'}`} />
          <span className="truncate">
            {locationName ? locationName : currentLang === 'hi' ? 'स्थान: निर्धारित नहीं' : 'Location: Not set'}
          </span>
        </div>

        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className="text-amber-800 hover:text-amber-900 font-semibold text-[11px] flex items-center gap-1 underline underline-offset-2 shrink-0"
        >
          {locationStatus === 'granted'
            ? currentLang === 'hi'
              ? 'बदलें'
              : 'Change'
            : currentLang === 'hi'
            ? 'स्थान जोड़ें'
            : 'Set Location'}
        </button>
      </div>

      {/* Location Picker Dropdown */}
      {showLocationPicker && (
        <div className="p-3 bg-amber-50/90 border-b border-amber-200 text-xs space-y-2 animate-in fade-in shrink-0">
          <div className="font-bold text-amber-950 flex items-center justify-between">
            <span>{currentLang === 'hi' ? 'अपनी वर्तमान स्थिति चुनें' : 'Select Your Current Location'}</span>
            <button onClick={() => setShowLocationPicker(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-amber-800 leading-tight">
            {currentLang === 'hi'
              ? 'स्थान की जानकारी से AI निकटतम घाटों, मंदिर व खान-पान की सटीक दूरी (किमी) बता सकेगा।'
              : 'Allows the AI to compute exact walking distances to ghats, temples, and eateries.'}
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleRequestLocation}
              disabled={locationStatus === 'requesting'}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 shadow-xs transition-all col-span-2"
            >
              <Navigation className="w-3 h-3" />
              <span>
                {locationStatus === 'requesting'
                  ? currentLang === 'hi'
                    ? 'जीपीएस खोजा जा रहा है...'
                    : 'Locating via GPS...'
                  : currentLang === 'hi'
                  ? 'मोबाइल GPS का उपयोग करें'
                  : 'Use Device GPS'}
              </span>
            </button>

            {VARANASI_HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => handleSelectHub(hub)}
                className="p-1.5 bg-white hover:bg-amber-100 text-stone-800 rounded-lg border border-amber-200 text-[10px] font-medium text-left truncate transition-colors"
              >
                📍 {hub.name[currentLang] || hub.name.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Messages & Interactive Category Flow */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-stone-50/40 text-xs">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed flex items-start gap-1.5"
              >
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>{msg.text}</div>
              </div>
            );
          }

          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className="space-y-2">
              <div className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold shadow-xs">
                    K
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap text-xs ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-br-xs shadow-xs font-medium'
                      : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-bl-xs'
                  }`}
                >
                  {!isUser && msg.verifiedCount && msg.verifiedCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-1.5 pb-1 border-b border-stone-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentLang === 'hi' ? 'प्रमाणित काशी डेटाबेस जानकारी' : 'Verified Heritage Record'}</span>
                    </div>
                  )}

                  {msg.text}

                  {/* Navigation Call-to-action button if candidate present */}
                  {!isUser && msg.navigationCandidate && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => handleOpenGoogleMaps(msg.navigationCandidate!)}
                        className="w-full px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {currentLang === 'hi'
                            ? `Google Maps पर ${msg.navigationCandidate.placeName} का रास्ता देखें`
                            : `View Directions to ${msg.navigationCandidate.placeName} on Maps`}
                        </span>
                        <ExternalLink className="w-3 h-3 text-amber-600" />
                      </button>
                    </div>
                  )}

                  <div className={`text-[9px] mt-1 text-right ${isUser ? 'text-amber-200' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>

              {/* Follow-up suggestion chips */}
              {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="pl-7 flex flex-wrap gap-1.5 pt-0.5">
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendMessage(sug)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 active:bg-amber-100 border border-stone-200 hover:border-amber-300 text-[10.5px] font-medium text-stone-700 hover:text-amber-900 rounded-lg shadow-2xs transition-all flex items-center gap-1 text-left"
                    >
                      <span>💬 {sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-stone-500 text-xs py-2 pl-7">
            <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <span>{currentLang === 'hi' ? 'प्रमाणित डेटाबेस से उत्तर तैयार हो रहा है...' : 'Pulling verified Kashi facts...'}</span>
          </div>
        )}

        {/* 4. Interactive Category Cards Section (Shown prominently at start or when exploring) */}
        {messages.length <= 2 && (
          <div className="mt-4 pt-3 border-t border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {currentLang === 'hi' ? 'प्रमुख विषय चुनें' : 'Explore by Category'}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">
                {currentLang === 'hi' ? '9 प्रमाणित श्रेणियां' : '9 Verified Topics'}
              </span>
            </div>

            {/* Grid of 9 Categories */}
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const name = currentLang === 'hi' ? cat.name_hi : cat.name_en;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between h-[64px] ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-500'
                        : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-amber-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {renderCategoryIcon(cat.icon)}
                      <ChevronRight className={`w-3 h-3 text-stone-400 transition-transform ${isSelected ? 'rotate-90 text-amber-600' : ''}`} />
                    </div>
                    <div className="font-bold text-[10.5px] leading-tight text-stone-900 truncate w-full mt-1">
                      {name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-prompts of selected category */}
            {selectedCategory && (
              <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1.5 animate-in fade-in">
                <div className="text-[10px] font-bold text-amber-900 flex items-center justify-between">
                  <span>
                    {currentLang === 'hi' ? 'इस श्रेणी के लोकप्रिय प्रश्न:' : 'Common queries for this category:'}
                  </span>
                  <button onClick={() => setSelectedCategory(null)} className="text-amber-700 hover:text-amber-900 text-[10px]">
                    {currentLang === 'hi' ? 'बंद करें' : 'Close'}
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {(
                    currentLang === 'hi'
                      ? categories.find((c) => c.id === selectedCategory)?.quick_prompts_hi || []
                      : categories.find((c) => c.id === selectedCategory)?.quick_prompts_en || []
                  ).map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        handleSendMessage(prompt);
                        setSelectedCategory(null);
                      }}
                      className="text-left px-2 py-1.5 bg-white hover:bg-amber-100 rounded-lg text-[11px] text-stone-800 font-medium border border-amber-200/60 shadow-2xs transition-colors flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <Send className="w-2.5 h-2.5 text-stone-300 group-hover:text-amber-700 shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Open Input Form - Always Visible & Responsive */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-1.5 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentLang === 'hi'
              ? 'अस्सी घाट, आरती समय, खान-पान या कुछ भी पूछें...'
              : 'Ask about Assi Ghat, Aarti timing, chaat, lanes...'
          }
          className="flex-1 px-3 py-2 text-xs bg-stone-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 border border-transparent focus:border-amber-500 transition-all placeholder:text-stone-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="w-8 h-8 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition-all"
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* 6. Google Maps Directions Confirmation Modal */}
      {confirmingNavigation && (
        <div className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-2xs p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-stone-200 text-xs w-full max-w-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Navigation className="w-5 h-5 text-amber-600" />
              <h4>{currentLang === 'hi' ? 'Google Maps दिशानिर्देश खोलें?' : 'Open Google Maps Directions?'}</h4>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              {currentLang === 'hi'
                ? `क्या आप आधिकारिक Google Maps ऐप या वेबसाइट पर ${confirmingNavigation.placeName} के लिए पैदल दिशानिर्देश खोलना चाहते हैं?`
                : `Would you like to open verified walking directions to ${confirmingNavigation.placeName} on Google Maps?`}
            </p>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-[10.5px] text-stone-500 space-y-1">
              <div className="font-semibold text-stone-700">
                🎯 {confirmingNavigation.placeName}
              </div>
              <div>{currentLang === 'hi' ? 'सुरक्षा: आधिकारिक Google Maps नेविगेशन URL का उपयोग होगा।' : 'Official Google Maps intent link.'}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmingNavigation(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
              >
                {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmNavigation}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span>{currentLang === 'hi' ? 'हाँ, मैप खोलें' : 'Yes, Open Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Credit Purchase Dialog */}
      {showPurchaseModal && (
        <div className="absolute inset-0 z-50 bg-stone-900/70 backdrop-blur-xs p-4 flex flex-col justify-end sm:justify-center animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-stone-900">
                  {currentLang === 'hi' ? 'AI क्रेडिट पैकेज' : 'AI Assistant Credits'}
                </h4>
              </div>
              <button onClick={() => setShowPurchaseModal(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-stone-500 mb-3">
              {currentLang === 'hi'
                ? 'निशुल्क सीमा पूरी हो चुकी है। नक्शा और गाइड हमेशा निशुल्क है। अतिरिक्त AI सवाल पूछने के लिए पैक चुनें:'
                : 'Free daily allowance used. Map and static guide remain 100% free. Add credits for continuous AI guidance:'}
            </p>

            <div className="space-y-2 mb-3">
              {[
                { id: 'pkg_starter', name: 'Starter Pilgrim', credits: 20, priceInr: 49 },
                { id: 'pkg_explorer', name: 'Heritage Explorer', credits: 50, priceInr: 99, popular: true },
                { id: 'pkg_grand', name: 'Grand Kashi Yatra', credits: 150, priceInr: 199 },
              ].map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/ai/credits/purchase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          packageId: pkg.id,
                          packageName: pkg.name,
                          credits: pkg.credits,
                          amountInr: pkg.priceInr,
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setPaidCredits(data.availableCredits);
                        setShowPurchaseModal(false);
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    pkg.popular
                      ? 'border-amber-500 bg-amber-50/60 hover:bg-amber-100/70'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <span>{pkg.name}</span>
                      {pkg.popular && (
                        <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-semibold">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">{pkg.credits} AI Questions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-amber-900">₹{pkg.priceInr}</div>
                    <div className="text-[9px] text-emerald-700 font-medium">Instant Activate</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-[11px]">
              <button onClick={() => setShowPurchaseModal(false)} className="text-stone-500 hover:text-stone-800">
                {currentLang === 'hi' ? 'बिना AI जारी रखें' : 'Continue Without AI'}
              </button>
              <span className="text-stone-400 text-[10px]">Secure Instant Credits</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
