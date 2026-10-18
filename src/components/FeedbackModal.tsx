import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { Language } from '../types/tourist';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  tourId?: string | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  lang,
  tourId,
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [navigationRating, setNavigationRating] = useState<number>(5);
  const [easeOfUseRating, setEaseOfUseRating] = useState<number>(5);
  const [informationRating, setInformationRating] = useState<number>(5);
  const [whatLiked, setWhatLiked] = useState<string>('');
  const [problemsEncountered, setProblemsEncountered] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          overallRating,
          navigationRating,
          easeOfUseRating,
          informationRating,
          preferredLanguage: lang,
          whatLiked,
          problemsEncountered,
          suggestions,
          comments: `${whatLiked ? 'Liked: ' + whatLiked + '. ' : ''}${problemsEncountered ? 'Problems: ' + problemsEncountered + '. ' : ''}${suggestions ? 'Suggestions: ' + suggestions : ''}`,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarInput = (val: number, setVal: (v: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setVal(star)}
            className="p-1 text-stone-300 hover:text-amber-500 transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                star <= val ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-semibold text-stone-600 ml-1.5">{val}/5</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-800 flex items-center justify-center text-amber-200">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {lang === 'hi' ? 'यात्रा अनुभव एवं प्रतिक्रिया' : 'Tour Experience & Feedback'}
              </h3>
              <p className="text-xs text-amber-200">
                {lang === 'hi' ? 'वाराणसी यात्रा को और बेहतर बनाने में मदद करें' : 'Help us improve the Varanasi tour guide'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-amber-200 hover:text-white rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2 animate-bounce" />
            <h4 className="text-base font-bold text-stone-900 mb-1">
              {lang === 'hi' ? 'धन्यवाद! आपकी प्रतिक्रिया प्राप्त हो गई।' : 'Thank You! Feedback Received.'}
            </h4>
            <p className="text-xs text-stone-500">
              {lang === 'hi' ? 'हर हर महादेव! आपकी यात्रा मंगलमय हो।' : 'Har Har Mahadev! Safe travels in Kashi.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {/* Ratings Grid */}
            <div className="space-y-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">
                  {lang === 'hi' ? 'समग्र अनुभव (Overall):' : 'Overall Experience:'}
                </span>
                {renderStarInput(overallRating, setOverallRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">
                  {lang === 'hi' ? 'नेविगेशन सटीकता:' : 'Navigation Accuracy:'}
                </span>
                {renderStarInput(navigationRating, setNavigationRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">
                  {lang === 'hi' ? 'उपयोग में सरलता:' : 'Ease of Use:'}
                </span>
                {renderStarInput(easeOfUseRating, setEaseOfUseRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">
                  {lang === 'hi' ? 'इतिहास व विवरण गुणवत्ता:' : 'Tourist Info Quality:'}
                </span>
                {renderStarInput(informationRating, setInformationRating)}
              </div>
            </div>

            {/* Questions */}
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                {lang === 'hi' ? 'आपको सबसे अच्छा क्या लगा?' : 'What did you like most?'}
              </label>
              <input
                type="text"
                value={whatLiked}
                onChange={(e) => setWhatLiked(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'उदा. पैदल गलियों का सही रास्ता, आरती का सटीक समय...'
                    : 'e.g. Accurate walking lanes, clear Aarti timings...'
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                {lang === 'hi' ? 'क्या कोई समस्या या परेशानी आई?' : 'What problems did you encounter?'}
              </label>
              <input
                type="text"
                value={problemsEncountered}
                onChange={(e) => setProblemsEncountered(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'उदा. संकरी गलियों में जीपीएस नेटवर्क, भीड़...'
                    : 'e.g. GPS drift in narrow lanes, crowd confusion...'
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                {lang === 'hi' ? 'सुझाव एवं टिप्पणियां (Suggestions):' : 'Suggestions for improvement:'}
              </label>
              <textarea
                rows={2}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'अन्य सुविधाएं जो आप चाहते हैं...'
                    : 'Any additional ideas or thoughts...'
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-stone-500 hover:text-stone-800 text-xs font-medium"
              >
                {lang === 'hi' ? 'बाद में याद दिलाएं' : 'Remind Later'}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {submitting
                  ? lang === 'hi'
                    ? 'जमा हो रहा है...'
                    : 'Submitting...'
                  : lang === 'hi'
                  ? 'प्रतिक्रिया भेजें'
                  : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
