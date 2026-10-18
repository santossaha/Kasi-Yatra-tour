import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Square, Clock } from 'lucide-react';
import { Language } from '../types/tourist';
import { locationShareService, ActiveShareSession } from '../services/locationShareService';

interface ActiveShareBannerProps {
  lang: Language;
  onOpenShareModal: () => void;
}

export const ActiveShareBanner: React.FC<ActiveShareBannerProps> = ({
  lang,
  onOpenShareModal,
}) => {
  const [activeSession, setActiveSession] = useState<ActiveShareSession | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [stopping, setStopping] = useState<boolean>(false);

  useEffect(() => {
    setActiveSession(locationShareService.getActiveSession());
    const unsub = locationShareService.onSessionChange((session) => {
      setActiveSession(session);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!activeSession) {
      setCountdown('');
      return;
    }

    const updateTimer = () => {
      const remainingMs = new Date(activeSession.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
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
  }, [activeSession]);

  if (!activeSession) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(activeSession.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStopping(true);
    await locationShareService.stopShare();
    setActiveSession(null);
    setStopping(false);
  };

  return (
    <div className="fixed top-16 right-3 sm:right-4 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
      <div
        onClick={onOpenShareModal}
        className="cursor-pointer bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-emerald-500/80 p-2 sm:px-3 sm:py-2 flex items-center gap-2 sm:gap-3 text-stone-800 transition-all hover:shadow-2xl"
      >
        {/* Pulsing Dot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wide hidden xs:inline">
            {activeSession.shareType === 'live'
              ? lang === 'hi'
                ? 'लाइव शेयरिंग'
                : 'Live Sharing'
              : lang === 'hi'
              ? 'स्नैपशॉट'
              : 'Snapshot'}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100/80 rounded-full text-[11px] font-mono font-bold text-emerald-900">
          <Clock className="w-3 h-3 text-emerald-700" />
          <span>{countdown}</span>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          title="Copy share link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={stopping}
          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
          title="Stop sharing immediately"
        >
          <Square className="w-2.5 h-2.5 fill-current" />
          <span className="hidden sm:inline">{lang === 'hi' ? 'रोकें' : 'Stop'}</span>
        </button>
      </div>
    </div>
  );
};
