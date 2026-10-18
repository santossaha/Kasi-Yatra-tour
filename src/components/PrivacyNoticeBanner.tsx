import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Trash2 } from 'lucide-react';
import { Language } from '../types/tourist';
import { analytics } from '../services/analyticsService';

interface PrivacyNoticeBannerProps {
  lang: Language;
}

export const PrivacyNoticeBanner: React.FC<PrivacyNoticeBannerProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('kashi_privacy_dismissed');
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('kashi_privacy_dismissed', 'true');
    setIsVisible(false);
  };

  const handleClearData = async () => {
    await analytics.clearData();
    setClearedNotice(true);
    setTimeout(() => {
      setClearedNotice(false);
      setIsVisible(false);
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-stone-700 text-xs">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-stone-100 mb-0.5">
              {lang === 'hi' ? 'गोपनीयता एवं अनाम एनालिटिक्स' : 'Privacy & Anonymous Guest Analytics'}
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              {lang === 'hi'
                ? 'हम बिना किसी लॉगिन के ऐप को बेहतर बनाने हेतु केवल अनाम सेशन एवं देखे गए दर्शनीय स्थलों को रिकॉर्ड करते हैं। आपकी व्यक्तिगत लोकेशन या निजी डेटा कभी साझा नहीं किया जाता।'
                : 'We track anonymous session statistics and places viewed to optimize tour navigation without mandatory login. Precise GPS movements are never recorded.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-white p-1 rounded-lg"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
        <button
          onClick={handleClearData}
          className="text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>{clearedNotice ? (lang === 'hi' ? 'डेटा मिटा दिया गया!' : 'Data Cleared!') : (lang === 'hi' ? 'मेरा डेटा हटाएं' : 'Clear My Data')}</span>
        </button>

        <button
          onClick={handleDismiss}
          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs"
        >
          {lang === 'hi' ? 'स्वीकार करें' : 'Got it'}
        </button>
      </div>
    </div>
  );
};
