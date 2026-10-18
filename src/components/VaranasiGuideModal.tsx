import React from 'react';
import {
  X,
  ShieldAlert,
  Camera,
  Shirt,
  Anchor,
  PhoneCall,
  Utensils,
  HelpCircle,
} from 'lucide-react';
import { Language } from '../types/tourist';

interface VaranasiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const VaranasiGuideModal: React.FC<VaranasiGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 bg-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-800 flex items-center justify-center text-amber-200">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {lang === 'hi' ? 'काशी यात्री मार्गदर्शिका एवं सुरक्षा' : 'Varanasi Visitor & Safety Guide'}
              </h2>
              <p className="text-xs text-amber-100">
                {lang === 'hi' ? 'महत्वपूर्ण नियम, शिष्टाचार एवं हेल्पलाइन' : 'Essential etiquette, tips & helplines'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-stone-700">
          {/* Rule 1: Ghat Photography */}
          <div className="p-3 bg-red-50/80 rounded-xl border border-red-200">
            <div className="font-bold text-red-900 flex items-center gap-1.5 mb-1 text-xs">
              <Camera className="w-4 h-4 text-red-700" />
              {lang === 'hi' ? 'श्मशान घाटों पर फोटोग्राफी सख्त वर्जित' : 'Cremation Ghat Photography Strictly Prohibited'}
            </div>
            <p className="text-red-900/80 leading-relaxed">
              {lang === 'hi'
                ? 'मणिकर्णिका और हरिश्चंद्र घाट पर जलती हुई चिताओं की फोटो या वीडियो लेना परिवारों के सम्मान में पूर्णतः प्रतिबंधित है। इसका उल्लंघन करने पर स्थानीय प्रशासन द्वारा दंडात्मक कार्रवाई हो सकती है।'
                : 'Taking photographs or videos of funeral pyres at Manikarnika and Harishchandra Ghats is strictly prohibited out of respect for mourning families. Drone flying requires prior DM permit.'}
            </p>
          </div>

          {/* Rule 2: Temple Dress code & Lockers */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1 text-xs">
              <Shirt className="w-4 h-4 text-amber-800" />
              {lang === 'hi' ? 'मंदिर पोशाक नियम एवं सुरक्षा लॉकर' : 'Temple Dress Codes & Digital Lockers'}
            </div>
            <p className="text-amber-900/80 leading-relaxed">
              {lang === 'hi'
                ? 'श्री काशी विश्वनाथ मंदिर और काल भैरव मंदिर में मोबाइल, कैमरा, चमड़े का बेल्ट और पर्स ले जाना वर्जित है। कॉरिडोर गेट पर निशुल्क डिजिटल लॉकर उपलब्ध हैं। शालीन भारतीय परिधान (धोती-कुर्ता, साड़ी, सलवार) अनुशंसित हैं।'
                : 'Mobile phones, cameras, leather belts, and shoes are prohibited inside Kashi Vishwanath sanctum. Free verified digital lockers are provided at Corridor entry gates. Modest clothing covering shoulders and knees is recommended.'}
            </p>
          </div>

          {/* Rule 3: Boat Rides */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="font-bold text-blue-950 flex items-center gap-1.5 mb-1 text-xs">
              <Anchor className="w-4 h-4 text-blue-700" />
              {lang === 'hi' ? 'गंगा नौका विहार (बोटिंग) दिशानिर्देश' : 'Ganges Boat Ride Advisory'}
            </div>
            <p className="text-blue-900/80 leading-relaxed">
              {lang === 'hi'
                ? 'सूर्योदय (सुबह 5:30) और गंगा आरती (शाम 6:00) के समय नाव की सवारी सबसे लोकप्रिय है। साझा नाव का किराया ₹100-₹300 प्रति व्यक्ति तय होता है। नाव पर सवार होते समय हमेशा लाइफ जैकेट पहनें।'
                : 'Sunrise (5:30 AM) and evening Aarti (6:00 PM) are prime boating times. Shared boats cost ₹100–₹300 per seat. Always wear life jackets as mandated by the Varanasi Water Police.'}
            </p>
          </div>

          {/* Famous Street Foods */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1 text-xs">
              <Utensils className="w-4 h-4 text-amber-700" />
              {lang === 'hi' ? 'प्रसिद्ध बनारसी खान-पान' : 'Iconic Banarasi Culinary Treats'}
            </div>
            <p className="text-stone-600 leading-relaxed">
              {lang === 'hi'
                ? 'गोदौलिया में काशी चाट भंडार (टमाटर चाट), विश्वनाथ गली में ब्लू लस्सी, पहलवान लस्सी लंका, रामनगर लस्सी और शीतकाल में प्रसिद्ध "मलइयो" का आनंद अवश्य लें।'
                : 'Do not miss Tamatar Chaat at Kashi Chat Bhandar (Godowlia), Blue Lassi at Manikarnika Gali, famous Pehelwan Lassi (Lanka), and winter Malaiyo froth at Chowk.'}
            </p>
          </div>

          {/* Emergency Helplines */}
          <div className="p-3 bg-stone-900 text-white rounded-xl">
            <div className="font-bold flex items-center gap-1.5 mb-2 text-xs text-amber-400">
              <PhoneCall className="w-4 h-4" />
              {lang === 'hi' ? 'आपातकालीन हेल्पलाइन नंबर' : 'Emergency & Tourist Helplines'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-stone-400">{lang === 'hi' ? 'पर्यटक पुलिस / आपातकाल:' : 'Tourist Police / Emergency:'}</span>
                <div className="font-bold text-white text-sm">112</div>
              </div>
              <div>
                <span className="text-stone-400">{lang === 'hi' ? 'एंबुलेंस / चिकित्सा:' : 'Ambulance / Medical:'}</span>
                <div className="font-bold text-white text-sm">108 / 102</div>
              </div>
              <div>
                <span className="text-stone-400">{lang === 'hi' ? 'विश्वनाथ मंदिर हेल्पडेस्क:' : 'Vishwanath Helpdesk:'}</span>
                <div className="font-bold text-amber-300">0542-2392629</div>
              </div>
              <div>
                <span className="text-stone-400">{lang === 'hi' ? 'महिला हेल्पलाइन:' : 'Women Helpline:'}</span>
                <div className="font-bold text-white text-sm">1090</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl"
          >
            {lang === 'hi' ? 'समझ गया' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
