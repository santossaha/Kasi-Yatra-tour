import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  MapPin,
  Radio,
  Clock,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Square,
  AlertTriangle,
  User,
  Navigation2,
  Lock,
} from 'lucide-react';
import { Coordinates, Language } from '../types/tourist';
import { locationShareService, ActiveShareSession, ShareType } from '../services/locationShareService';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userLocation: Coordinates;
}

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  isOpen,
  onClose,
  lang,
  userLocation,
}) => {
  const [activeSession, setActiveSession] = useState<ActiveShareSession | null>(null);
  const [shareType, setShareType] = useState<ShareType>('live');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [customMinutes, setCustomMinutes] = useState<string>('45');
  const [senderName, setSenderName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    setActiveSession(locationShareService.getActiveSession());
    const unsubscribe = locationShareService.onSessionChange((session) => {
      setActiveSession(session);
    });
    return () => unsubscribe();
  }, [isOpen]);

  // Real-time countdown calculation
  useEffect(() => {
    if (!activeSession) {
      setCountdown('');
      return;
    }

    const updateTimer = () => {
      const remainingMs = new Date(activeSession.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setCountdown(lang === 'hi' ? 'समय समाप्त' : 'Expired');
        setActiveSession(null);
      } else {
        const totalSec = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        if (hours > 0) {
          setCountdown(`${hours}h ${mins}m ${secs}s`);
        } else {
          setCountdown(`${mins}m ${secs}s`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession, lang]);

  if (!isOpen) return null;

  const handleStartSharing = async () => {
    setErrorMsg('');
    setLoading(true);

    const minutesToUse = durationMinutes === -1 ? Math.max(5, Number(customMinutes) || 30) : durationMinutes;

    try {
      // 1. Check or request fresh high-accuracy position if available
      let coords = userLocation;
      let accuracy = 15;

      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          const freshPos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 9000,
              maximumAge: 10000,
            });
          });
          coords = {
            lat: freshPos.coords.latitude,
            lng: freshPos.coords.longitude,
          };
          accuracy = freshPos.coords.accuracy || 15;
        } catch (geoErr: any) {
          if (geoErr.code === 1) {
            // Permission denied
            throw new Error(
              lang === 'hi'
                ? 'स्थान (GPS) अनुमति अस्वीकृत है। कृपया अपने ब्राउज़र सेटिंग्स में लोकेशन अनुमति सक्षम करें।'
                : 'Location permission was denied. Please allow location access in your browser to share your coordinates.'
            );
          } else if (geoErr.code === 2) {
            throw new Error(
              lang === 'hi'
                ? 'GPS सिग्नल अनुपलब्ध है। कृपया सुनिश्चित करें कि डिवाइस का लोकेशन चालू है।'
                : 'GPS position is unavailable. Please verify device location services are turned on.'
            );
          }
          // If timeout, fallback to existing coords
        }
      }

      const session = await locationShareService.createShare({
        shareType,
        durationMinutes: minutesToUse,
        senderName: senderName.trim() || (lang === 'hi' ? 'काशी यात्री' : 'Varanasi Pilgrim'),
        coordinates: coords,
        accuracyMeters: accuracy,
      });

      setActiveSession(session);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not start location sharing');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSharing = async () => {
    setLoading(true);
    await locationShareService.stopShare();
    setActiveSession(null);
    setLoading(false);
  };

  const handleCopyLink = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (!activeSession) return;
    const title = lang === 'hi' ? 'मेरा वाराणसी लोकेशन लिंक' : 'My Varanasi Location Link';
    const text =
      lang === 'hi'
        ? `${activeSession.senderName} ने वाराणसी में अपना स्थान साझा किया है। इस सुरक्षित लिंक पर देखें:`
        : `${activeSession.senderName} shared their location in Varanasi with you. View securely here:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: activeSession.shareUrl,
        });
      } catch (e) {
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Share2 className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {lang === 'hi' ? 'स्थान साझा करें (Live Location)' : 'Share My Location'}
              </h3>
              <p className="text-[11px] text-amber-100">
                {lang === 'hi'
                  ? 'परिवार व मित्रों को वाराणसी में आपको आसानी से खोजने दें'
                  : 'Let companions easily locate you across Varanasi ghats & alleys'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/15 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-stone-800">
          {/* Active Session Display */}
          {activeSession ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-900 tracking-wide uppercase">
                      {activeSession.shareType === 'live'
                        ? lang === 'hi'
                          ? 'लाइव ट्रैकिंग सक्रिय है'
                          : 'Live Tracking Active'
                        : lang === 'hi'
                        ? 'स्थान स्नैपशॉट सक्रिय है'
                        : 'Snapshot Link Active'}
                    </span>
                  </div>
                  <div className="px-2.5 py-0.5 bg-emerald-200/70 text-emerald-900 font-mono text-xs font-bold rounded-full">
                    {countdown}
                  </div>
                </div>

                <p className="text-xs text-emerald-800 mb-3">
                  {activeSession.shareType === 'live'
                    ? lang === 'hi'
                      ? 'आपका लाइव स्थान हर कुछ सेकंड में अपडेट हो रहा है।'
                      : 'Your location is updating in real time as you navigate through Varanasi.'
                    : lang === 'hi'
                    ? 'आपका वर्तमान स्थिर स्थान लिंक के माध्यम से दिखाई दे रहा है।'
                    : 'A single point-in-time location snapshot is shared via this link.'}
                </p>

                {/* Link Box */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-300 shadow-inner">
                  <input
                    type="text"
                    readOnly
                    value={activeSession.shareUrl}
                    className="w-full text-xs font-mono text-stone-700 bg-transparent outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : lang === 'hi' ? 'कॉपी' : 'Copy'}</span>
                  </button>
                </div>

                {/* Action Buttons for Active Session */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-emerald-200">
                  <button
                    onClick={handleNativeShare}
                    className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'मित्रों को भेजें' : 'Share with Companion'}</span>
                  </button>

                  <a
                    href={activeSession.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-white hover:bg-stone-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'देखें' : 'Preview'}</span>
                  </a>

                  <button
                    onClick={handleStopSharing}
                    disabled={loading}
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'hi' ? 'शेयरिंग रोकें' : 'Stop Sharing'}</span>
                  </button>
                </div>
              </div>

              {/* Security Details */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'hi' ? 'गोपनीयता नियंत्रण' : 'Privacy & Security'}</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {lang === 'hi'
                    ? 'यह लिंक क्रिप्टोग्राफिक रूप से यादृच्छिक है। इसे केवल वही देख सकते हैं जिनके पास यह लिंक है। आप कभी भी "शेयरिंग रोकें" दबाकर लिंक अमान्य कर सकते हैं।'
                    : 'This secure link is cryptographically generated. Only people with this exact URL can view your coordinates. Revoke instantly at any time.'}
                </p>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <div className="space-y-4">
              {/* Sharing Mode Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  {lang === 'hi' ? '1. शेयरिंग प्रकार चुनें' : '1. Select Sharing Mode'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShareType('live')}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      shareType === 'live'
                        ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
                        </span>
                        <span className="font-bold text-xs text-stone-900">
                          {lang === 'hi' ? 'लाइव लोकेशन' : 'Share Live Location'}
                        </span>
                      </div>
                      <Radio className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-[11px] text-stone-600 leading-tight">
                      {lang === 'hi'
                        ? 'आप जहां-जहां चलेंगे, साथी को वास्तविक समय में दिखेगा।'
                        : 'Your real-time movement updates automatically on their map.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareType('snapshot')}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      shareType === 'snapshot'
                        ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-xs text-stone-900">
                          {lang === 'hi' ? 'वर्तमान स्नैपशॉट' : 'Current Snapshot'}
                        </span>
                      </div>
                      <Radio className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-[11px] text-stone-600 leading-tight">
                      {lang === 'hi'
                        ? 'केवल आपके वर्तमान स्थान का एक बार का स्थिर बिंदु साझा होगा।'
                        : 'Shares only your current stationary point-in-time coordinates.'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Sender Name / Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  {lang === 'hi' ? '2. आपका नाम या विवरण (वैकल्पिक)' : '2. Your Name or Note (Optional)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={
                      lang === 'hi'
                        ? 'उदा. राहुल (दशाश्वमेध घाट के पास)'
                        : 'e.g. Rahul (Near Dashashwamedh Ghat)'
                    }
                    maxLength={50}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Duration Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                    {lang === 'hi' ? '3. शेयरिंग अवधि तय करें' : '3. Set Sharing Duration'}
                  </label>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lang === 'hi' ? 'स्वतः समाप्त होगा' : 'Auto-expires'}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[
                    { label: '15m', mins: 15 },
                    { label: '30m', mins: 30 },
                    { label: '1h', mins: 60 },
                    { label: '2h', mins: 120 },
                    { label: '4h', mins: 240 },
                    { label: '8h', mins: 480 },
                    { label: 'Custom', mins: -1 },
                  ].map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => setDurationMinutes(d.mins)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                        durationMinutes === d.mins
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {durationMinutes === -1 && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="w-24 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <span className="text-xs text-stone-600">
                      {lang === 'hi' ? 'मिनट (5 से 1440)' : 'minutes (5 to 1440)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Privacy Notice Banner */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-stone-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'hi' ? 'गोपनीयता सूचना' : 'Privacy Notice'}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {lang === 'hi'
                    ? 'स्थान केवल इस सुरक्षित लिंक धारक को दिखाई देगा। कोई खाता आवश्यक नहीं है। लिंक समय समाप्त होने पर अपने आप बंद हो जाता है।'
                    : 'Location is only accessible to whoever has the secure link. No account required. Sharing ends when duration expires or whenever you tap Stop.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartSharing}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Navigation2 className="w-4 h-4" />
                  )}
                  <span>
                    {loading
                      ? lang === 'hi'
                        ? 'स्थान लिंक तैयार हो रहा है...'
                        : 'Generating Secure Link...'
                      : lang === 'hi'
                      ? 'सुरक्षित लिंक बनाएं व साझा करें'
                      : 'Generate Secure Sharing Link'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
