export interface AICategoryConfig {
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

export interface AIAssistantConfig {
  welcome_message_en: string;
  welcome_message_hi: string;
  welcome_subtitle_en: string;
  welcome_subtitle_hi: string;
  system_instructions: string;
  categories: AICategoryConfig[];
  enable_nearby_suggestions: boolean;
  enable_map_confirmation: boolean;
  updated_at: string;
}

export interface AIKnowledgeItem {
  id: string;
  category: 'places' | 'aarti' | 'temples' | 'food' | 'history' | 'planning' | 'hotels' | 'weather' | 'transport';
  place_id?: string;
  title: {
    en: string;
    hi: string;
  };
  summary: {
    en: string;
    hi: string;
  };
  details: {
    en: string;
    hi: string;
  };
  schedule_timing?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  source_url?: string;
  source_title?: string;
  nearby_suggestions: {
    en: string[];
    hi: string[];
  };
  is_verified: boolean;
  tags: string[];
  updated_at: string;
}

export const DEFAULT_AI_CATEGORIES: AICategoryConfig[] = [
  {
    id: 'explore',
    name_en: 'Explore Places',
    name_hi: 'स्थान खोजें',
    subtitle_en: 'Iconic spots, lanes & monuments',
    subtitle_hi: 'प्रमुख स्थल, गलियां व स्मारक',
    icon: 'MapPin',
    quick_prompts_en: [
      'Top 5 must-visit heritage places in Varanasi',
      'Tell me about Assi Ghat and its importance',
      'What are the best viewpoints along the Ganga ghats?',
      'How to explore the ancient lanes of Old Kashi safely?'
    ],
    quick_prompts_hi: [
      'वाराणसी के 5 सबसे प्रमुख दर्शनीय स्थल कौन से हैं?',
      'अस्सी घाट के बारे में विस्तार से बताएं',
      'गंगा घाटों का सबसे सुंदर दृश्य कहाँ से दिखता है?',
      'पुरानी काशी की गलियों में कैसे घूमें?'
    ],
    order: 1,
    is_active: true,
  },
  {
    id: 'aarti',
    name_en: 'Ghats & Ganga Aarti',
    name_hi: 'घाट और गंगा आरती',
    subtitle_en: 'Verified Aarti schedules & boat etiquette',
    subtitle_hi: 'प्रमाणित आरती समय व नौका शिष्टाचार',
    icon: 'Flame',
    quick_prompts_en: [
      'What is the verified timing of Dashashwamedh Ganga Aarti?',
      'How to attend Subah-e-Banaras morning Aarti at Assi Ghat?',
      'What are the rules and boat rates for watching Aarti from the river?',
      'What are the photography rules at Manikarnika Ghat?'
    ],
    quick_prompts_hi: [
      'दशाश्वमेध घाट की गंगा आरती का सही समय क्या है?',
      'अस्सी घाट पर सुबह-ए-बनारस आरती में कैसे शामिल हों?',
      'नाव से आरती देखने के क्या नियम और उचित किराया है?',
      'मणिकर्णिका घाट पर फोटोग्राफी के क्या नियम हैं?'
    ],
    order: 2,
    is_active: true,
  },
  {
    id: 'temples',
    name_en: 'Temples & Darshan',
    name_hi: 'मंदिर व दर्शन',
    subtitle_en: 'Vishwanath Corridor, timings & dress codes',
    subtitle_hi: 'विश्वनाथ धाम, समय सारणी व नियम',
    icon: 'Landmark',
    quick_prompts_en: [
      'Kashi Vishwanath Temple timings, entry gates & dress code',
      'Sankat Mochan Hanuman Temple darshan timings and offerings',
      'Tell me about Kaal Bhairav (Kotwal of Varanasi) darshan',
      'How to visit Durga Kund Temple and Tulsi Manas Mandir?'
    ],
    quick_prompts_hi: [
      'काशी विश्वनाथ मंदिर के दर्शन का समय, गेट और ड्रेस कोड क्या है?',
      'संकट मोचन मंदिर के दर्शन का समय और प्रसाद के नियम बताएं',
      'काल भैरव (काशी के कोतवाल) के दर्शन की क्या महत्ता है?',
      'दुर्गा कुंड और तुलसी मानस मंदिर कैसे पहुंचे?'
    ],
    order: 3,
    is_active: true,
  },
  {
    id: 'food',
    name_en: 'Famous Food',
    name_hi: 'काशी का खान-पान',
    subtitle_en: 'Authentic Chaat, Kachori, Lassi & Paan',
    subtitle_hi: 'प्रसिद्ध चाट, कचौड़ी, लस्सी व बनारसी पान',
    icon: 'Utensils',
    quick_prompts_en: [
      'Where can I find the best Tamatar Chaat and Palak Chaat in Varanasi?',
      'Best places for authentic morning Kachori Jalebi (e.g. Ram Bhandar)',
      'Famous Lassi spots: Pehalwan Lassi at Assi vs Blue Lassi',
      'Where to get authentic Banarasi Paan and winter Malaiyo?'
    ],
    quick_prompts_hi: [
      'काशी की सबसे प्रसिद्ध टमाटर चाट और पालक चाट कहाँ मिलेगी?',
      'सुबह की कचौड़ी-जलेबी के लिए सबसे प्रसिद्ध दुकानें (जैसे राम भंडार)',
      'अस्सी की पहलवान लस्सी और ब्लू लस्सी की विशेषता क्या है?',
      'असली बनारसी पान और सर्दियों का मलइयो कहाँ मिलता है?'
    ],
    order: 4,
    is_active: true,
  },
  {
    id: 'history',
    name_en: 'History & Heritage',
    name_hi: 'इतिहास व विरासत',
    subtitle_en: 'Chronology, Ahilyabai, Sarnath & legends',
    subtitle_hi: 'ऐतिहासिक कालक्रम, अहिल्याबाई, सारनाथ व गाथाएं',
    icon: 'BookOpen',
    quick_prompts_en: [
      'Why is Varanasi considered one of the oldest continuously inhabited cities?',
      'History of Maharani Ahilyabai Holkar rebuilding Kashi Vishwanath in 1780',
      'Historical and archaeological importance of Sarnath & Ashoka Pillar',
      'What is the historical origin of the 84 ghats of Kashi?'
    ],
    quick_prompts_hi: [
      'वाराणसी को विश्व के सबसे प्राचीन जीवंत शहरों में क्यों गिना जाता है?',
      '1780 में महारानी अहिल्याबाई होल्कर द्वारा मंदिर पुनर्निर्माण का इतिहास',
      'सारनाथ का ऐतिहासिक महत्व और अशोक स्तंभ का इतिहास',
      'काशी के 84 घाटों का ऐतिहासिक निर्माण कैसे हुआ?'
    ],
    order: 5,
    is_active: true,
  },
  {
    id: 'planning',
    name_en: 'Tour Planning',
    name_hi: 'यात्रा योजना व सुझाव',
    subtitle_en: '1-day, 2-day & 3-day optimal itineraries',
    subtitle_hi: '1-दिवसीय, 2-दिवसीय व 3-दिवसीय उत्तम यात्रा क्रम',
    icon: 'Compass',
    quick_prompts_en: [
      'Suggest a realistic 1-day walking itinerary for Varanasi ghats & temples',
      'What is the ideal 2-day itinerary including Sarnath and Ganga Aarti?',
      'Walking tips: how to avoid crowds and traffic jams around Godowlia?',
      'What should senior citizens keep in mind while visiting Kashi?'
    ],
    quick_prompts_hi: [
      'वाराणसी में 1 दिन की सबसे उत्तम यात्रा योजना (Itinerary) सुझाएं',
      'सारनाथ और गंगा आरती सहित 2 दिन का आदर्श प्लान क्या है?',
      'गोदौलिया की भीड़ और ट्रैफिक से बचने के पैदल रास्ते कौन से हैं?',
      'वरिष्ठ नागरिकों (बुजुर्गों) के लिए दर्शन के विशेष सुझाव बताएं'
    ],
    order: 6,
    is_active: true,
  },
  {
    id: 'hotels',
    name_en: 'Hotels & Dharamshalas',
    name_hi: 'होटल व धर्मशाला',
    subtitle_en: 'Ghat stays, Cantonment & pilgrim rest houses',
    subtitle_hi: 'घाट के पास निवास, कैंट व तीर्थयात्री धर्मशालाएं',
    icon: 'Hotel',
    quick_prompts_en: [
      'Is it better to stay on the ghats or near Cantt Railway Station?',
      'Verified government and trust dharamshalas near Godowlia & Vishwanath Temple',
      'Heritage haveli hotels on the Ganges with river views',
      'Tips for vehicle accessibility and luggage transport in alley hotels'
    ],
    quick_prompts_hi: [
      'घाटों के पास रुकना बेहतर है या कैंट रेलवे स्टेशन के पास?',
      'विश्वनाथ मंदिर और गोदौलिया के पास सुरक्षित व प्रमाणित धर्मशालाएं',
      'गंगा किनारे हेरिटेज हवेलियां और होटल की जानकारी',
      'गलियों में स्थित होटलों तक सामान ले जाने के व्यावहारिक सुझाव'
    ],
    order: 7,
    is_active: true,
  },
  {
    id: 'weather',
    name_en: 'Weather & Best Time',
    name_hi: 'मौसम व सर्वोत्तम समय',
    subtitle_en: 'Seasonal weather, Dev Deepawali & precautions',
    subtitle_hi: 'ऋतु अनुसार मौसम, देव दीपावली व सावधानियां',
    icon: 'CloudSun',
    quick_prompts_en: [
      'What is the best month to visit Varanasi for pleasant weather?',
      'When is Dev Deepawali and how to book boat rides in advance?',
      'How does monsoon (July-September) affect boat rides on the Ganga?',
      'What clothes should I pack for Varanasi in winter vs summer?'
    ],
    quick_prompts_hi: [
      'वाराणसी आने के लिए सबसे सुहावना मौसम किस महीने में होता है?',
      'देव दीपावली कब होती है और इसके लिए क्या विशेष तैयारी चाहिए?',
      'मानसून (जुलाई-सितंबर) में गंगा के जलस्तर और नौका संचालन का क्या नियम है?',
      'सर्दियों और गर्मियों में काशी यात्रा के लिए क्या वस्त्र साथ रखें?'
    ],
    order: 8,
    is_active: true,
  },
  {
    id: 'transport',
    name_en: 'Transport & Boating',
    name_hi: 'नाव, ऑटो व यातायात',
    subtitle_en: 'Govt boat fares, e-rickshaws & pedestrian zones',
    subtitle_hi: 'सरकारी नौका दरें, ई-रिक्शा व नो-व्हीकल जोन',
    icon: 'Bus',
    quick_prompts_en: [
      'Official boat fare guidelines: rowing boat vs motorboat rates',
      'How do e-rickshaws and auto-rickshaws charge between Cantt and Godowlia?',
      'Which areas in Varanasi are pedestrian-only no-vehicle zones?',
      'How to reach Babatpur Airport from Varanasi city?'
    ],
    quick_prompts_hi: [
      'प्रशासन द्वारा तय नाव का किराया: हाथ वाली नाव और मोटरबोट के रेट',
      'कैंट रेलवे स्टेशन से गोदौलिया का सामान्य ई-रिक्शा और ऑटो किराया क्या है?',
      'वाराणसी के कौन से इलाके पूरी तरह नो-व्हीकल (केवल पैदल) जोन हैं?',
      'बाबतपुर एयरपोर्ट से शहर पहुंचने के सबसे किफायती और सुगम साधन'
    ],
    order: 9,
    is_active: true,
  },
];

export const DEFAULT_AI_ASSISTANT_CONFIG: AIAssistantConfig = {
  welcome_message_en: 'Har Har Mahadev! Welcome to your Kashi AI Tourist Guide. I am grounded in verified Varanasi heritage data, official Aarti timings, safe alley navigation, and local culture. Select a category below or ask me any question directly.',
  welcome_message_hi: 'हर हर महादेव! काशी यात्रा AI मार्गदर्शक में आपका स्वागत है। मैं प्रमाणित काशी विरासत डेटा, सटीक आरती समय, सुगम पैदल मार्गों और स्थानीय संस्कृति पर आधारित जानकारी देता हूँ। नीचे दी गई श्रेणी चुनें या सीधे अपना सवाल पूछें।',
  welcome_subtitle_en: 'Verified pilgrim intelligence • Real-time pedestrian guidance • Authentic local facts',
  welcome_subtitle_hi: 'प्रमाणित तीर्थ जानकारी • सटीक पैदल मार्गदर्शन • प्रामाणिक स्थानीय तथ्य',
  system_instructions: `You are the official "Kashi Yatra AI Tourist Assistant" (काशी यात्रा मार्गदर्शक), built inside the Varanasi Smart Tourist Guide app.
Your highest duty is to provide strictly verified, culturally sensitive, safe, and actionable guidance for tourists exploring Varanasi.

CRITICAL INSTRUCTIONS & CORE RULES:
1. STRICT VERIFICATION & ANTI-HALLUCINATION:
   - Ground your answers in the provided database context of verified places, Aarti schedules, timings, and navigation rules.
   - If a specific detail (like a personal phone number, unverified private vendor price, or non-existent museum) is not verified in the database, clearly state: "यह जानकारी अभी डेटाबेस में प्रमाणित नहीं है" / "This specific detail is not yet verified in our database". NEVER invent or guess.
2. LANGUAGE HARMONIZATION:
   - Respond in the language used by the user. If user asks in Hindi, answer in polite, clear Hindi. If in English, answer in polished English. If in Hinglish (e.g. "Assi Ghat pe aarti kab hoti hai?"), answer in natural conversational Hindi/Hinglish.
3. CONTEXTUAL FOLLOW-UP SUGGESTIONS:
   - Always conclude with 2-3 helpful, logically connected follow-up suggestions or questions (e.g., "क्या आप Assi Ghat के पास प्रसिद्ध Pehalwan Lassi या Subah-e-Banaras आरती के बारे में जानना चाहते हैं?").
4. DISTANCE & NAVIGATION:
   - When a location or distance is mentioned, reference verified coordinates and pedestrian facts: Old Kashi alleys around Vishwanath Temple and Dashashwamedh are pedestrian-only.
   - Never scrape Google Maps. If user wants live turn-by-turn navigation, inform them and offer to open Google Maps with confirmation.
5. CULTURAL SENSITIVITY & SAFETY:
   - Manikarnika & Harishchandra Ghat: Firmly remind visitors that photography of funeral pyres is strictly prohibited by law and custom.
   - Ganga Boating: Remind tourists to wear mandatory life jackets and use official municipal rate guidelines.
   - Emergency helpline: Tourist Police 112 / Vishwanath Helpdesk 0542-2392629.`,
  categories: DEFAULT_AI_CATEGORIES,
  enable_nearby_suggestions: true,
  enable_map_confirmation: true,
  updated_at: new Date().toISOString(),
};

export const DEFAULT_AI_KNOWLEDGE_ITEMS: AIKnowledgeItem[] = [
  {
    id: 'kb_aarti_dashashwamedh',
    category: 'aarti',
    place_id: 'dashashwamedh-ghat',
    title: {
      en: 'Dashashwamedh Ghat Maha Ganga Aarti',
      hi: 'दशाश्वमेध घाट महा गंगा आरती',
    },
    summary: {
      en: 'The world-famous evening ritual dedicated to Goddess Ganga performed by 7 young priests holding grand multi-tiered brass lamps.',
      hi: 'मां गंगा को समर्पित विश्व प्रसिद्ध संध्या महाआरती, जिसे 7 युवा पुरोहित भव्य बहुमंजिला पीतल के दीपकों से संपन्न करते हैं।',
    },
    details: {
      en: 'The Maha Ganga Aarti is organized daily by Ganga Seva Nidhi at Dashashwamedh Ghat. The ritual begins immediately after dusk (approx 6:45 PM in summer, 6:00 PM in winter) and lasts for about 45 minutes. Thousands of pilgrims watch from the stone steps or from wooden boats on the river. It is free to watch on the steps; arrive at least 45 minutes early for a seated spot. Avoid paying anyone for step access.',
      hi: 'दशाश्वमेध घाट पर गंगा सेवा निधि द्वारा प्रतिदिन भव्य महाआरती आयोजित की जाती है। यह संध्या गोधूलि बेला के तुरंत बाद शुरू होती है (गर्मी में शाम 6:45 बजे, सर्दी में शाम 6:00 बजे) और लगभग 45 मिनट चलती है। सीढ़ियों पर बैठकर देखना पूरी तरह निःशुल्क है। अच्छी जगह पाने के लिए कम से कम 45 मिनट पहले पहुंचे। सीढ़ियों पर बैठने के लिए किसी को पैसे न दें।',
    },
    schedule_timing: 'Summer: 6:45 PM - 7:30 PM | Winter: 6:00 PM - 6:45 PM Daily',
    coordinates: { lat: 25.3072, lng: 83.0105 },
    source_url: 'https://varanasi.nic.in/tourist-place/dashashwamedh-ghat/',
    source_title: 'District Administration Varanasi & Ganga Seva Nidhi',
    nearby_suggestions: {
      en: [
        'Kashi Chaat Bhandar (famous Tamatar Chaat at Godowlia Chowk, 300m away)',
        'Manmandir Ghat Observatory (Jantar Mantar built by Sawai Jai Singh)',
        'Vishwanath Gali pedestrian corridor entrance'
      ],
      hi: [
        'काशी चाट भंडार (गोदौलिया चौक पर प्रसिद्ध टमाटर चाट, 300 मीटर)',
        'मानमंदिर घाट वेधशाला (सवाई जय सिंह द्वारा निर्मित जंतर मंतर)',
        'विश्वनाथ गली पैदल कॉरिडोर प्रवेश द्वार'
      ],
    },
    is_verified: true,
    tags: ['aarti', 'dashashwamedh', 'ganga', 'evening', 'boats'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_aarti_assi',
    category: 'aarti',
    place_id: 'assi-ghat',
    title: {
      en: 'Assi Ghat Subah-e-Banaras Morning Aarti',
      hi: 'अस्सी घाट सुबह-ए-बनारस प्रातःकालीन आरती',
    },
    summary: {
      en: 'Spiritual morning cultural initiative featuring sunrise Aarti, Vedic chanting, group yoga, and classical music recital on the riverbank.',
      hi: 'प्रातःकाल सूर्योदय की आरती, वैदिक मंत्रोच्चार, सामूहिक योगाभ्यास और शास्त्रीय संगीत का भव्य आध्यात्मिक संगम।',
    },
    details: {
      en: 'Subah-e-Banaras takes place at Assi Ghat every morning at sunrise (around 5:00 AM - 5:30 AM). It includes Ganga Aarti with traditional brass lamps, followed by Vedic hymns chanted by students, a 45-minute yoga session open to all tourists, and ragas played on sitar, shehnai, or flute. Assi Ghat marks the southernmost point of the ancient 84 ghats where the sacred Assi river once met the Ganga.',
      hi: 'अस्सी घाट पर प्रतिदिन सूर्योदय के समय (सुबह 5:00 से 5:30 बजे) सुबह-ए-बनारस कार्यक्रम होता है। इसमें मां गंगा की प्रातःकालीन आरती, वेदपाठी बटुकों द्वारा मंत्रोच्चार, सभी पर्यटकों के लिए खुला 45 मिनट का निःशुल्क योगाभ्यास और शास्त्रीय संगीत की प्रस्तुति शामिल है। अस्सी घाट 84 घाटों का दक्षिणी छोर है।',
    },
    schedule_timing: 'Morning Sunrise: 5:00 AM - 7:00 AM Daily',
    coordinates: { lat: 25.2917, lng: 83.0067 },
    source_url: 'https://varanasi.nic.in/tourist-place/assi-ghat/',
    source_title: 'Subah-e-Banaras Society & UP Tourism',
    nearby_suggestions: {
      en: [
        'Pehalwan Lassi (legendary rabri and malai lassi near Assi Crossing)',
        'Tulsi Ghat & Akhada (where Goswami Tulsidas composed Ramcharitmanas)',
        'Ravidas Ghat (broad promenade for evening walks)'
      ],
      hi: [
        'पहलवान लस्सी (अस्सी चौराहे के पास प्रसिद्ध मलाईदार गाढ़ी लस्सी)',
        'तुलसी घाट व अखाड़ा (जहां गोस्वामी तुलसीदास जी ने रामचरितमानस की रचना की)',
        'रविदास घाट (शाम के टहलने के लिए खुला व शांत घाट)'
      ],
    },
    is_verified: true,
    tags: ['aarti', 'assi', 'morning', 'subah-e-banaras', 'yoga'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_temple_vishwanath',
    category: 'temples',
    place_id: 'kashi-vishwanath',
    title: {
      en: 'Shri Kashi Vishwanath Golden Temple & Corridor',
      hi: 'श्री काशी विश्वनाथ स्वर्णिम ज्योतिर्लिंग व धाम कॉरिडोर',
    },
    summary: {
      en: 'One of the 12 sacred Jyotirlingas, rebuilt in 1780 CE by Maharani Ahilyabai Holkar and expanded with a 50,000 sq m stone corridor in 2021.',
      hi: '12 पवित्र ज्योतिर्लिंगों में प्रमुख, 1780 में अहिल्याबाई होल्कर द्वारा पुनर्निर्मित एवं 2021 में 50,000 वर्ग मी. कॉरिडोर युक्त।',
    },
    details: {
      en: 'Official Timings: Mangala Aarti (3:00 AM - 4:00 AM, advance ticket needed), General Darshan (4:00 AM - 11:15 AM, 12:20 PM - 7:00 PM, 8:15 PM - 9:00 PM). Four entry gates: Gate 4 (Godowlia/Chowk), Gate 1 (Dhuraj/Ghat side), Gate 2 (Saraswati Phatak), Gate 3 (Neelkanth). Lockers are free inside the Corridor for mobile phones and leather items (belts and wallets prohibited inside inner sanctum). Inner sanctum touch darshan (Sparsh) requires traditional dhoti-kurta for men and saree for women during specific morning hours.',
      hi: 'आधिकारिक समय सारणी: मंगला आरती (सुबह 3:00 से 4:00 बजे, अग्रिम बुकिंग), सामान्य दर्शन (सुबह 4:00 से 11:15, दोपहर 12:20 से शाम 7:00, रात्रि 8:15 से 9:00)। मुख्य चार गेट: गेट 4 (गोदौलिया/चौक), गेट 1 (गंगा/ललिता घाट द्वार), गेट 2 (सरस्वती फाटक), गेट 3 (नीलकंठ)। कॉरिडोर के अंदर मोबाइल व चमड़े की वस्तुओं के लिए निःशुल्क लॉकर उपलब्ध हैं। गर्भगृह स्पर्श दर्शन के लिए पुरुषों हेतु धोती-कुर्ता और महिलाओं हेतु साड़ी का परिधान नियम लागू है।',
    },
    schedule_timing: 'Open daily 4:00 AM to 11:00 PM (Aarti breaks between slots)',
    coordinates: { lat: 25.3109, lng: 83.0107 },
    source_url: 'https://shrikashivishwanath.org/',
    source_title: 'Shri Kashi Vishwanath Temple Trust (Official)',
    nearby_suggestions: {
      en: [
        'Annapurna Mandir (Goddess of nourishment, 100m away, serves free noon prasad)',
        'Dhundhiraj Ganpati (ancient guardian Ganesha shrine at entrance)',
        'Vishwanath Gali handicraft shops for Banarasi silk & wooden toys'
      ],
      hi: [
        'माता अन्नपूर्णा मंदिर (अन्न की देवी, 100 मीटर, दोपहर में निःशुल्क महाप्रसाद)',
        'ढूंढिराज गणपति (प्रवेश द्वार पर स्थित प्राचीन संरक्षक गणेश जी)',
        'विश्वनाथ गली के प्रसिद्ध बनारसी रेशम व काष्ठ खिलौना बाजार'
      ],
    },
    is_verified: true,
    tags: ['temple', 'vishwanath', 'jyotirlinga', 'darshan', 'timings'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_temple_sankat_mochan',
    category: 'temples',
    place_id: 'sankat-mochan',
    title: {
      en: 'Sankat Mochan Hanuman Temple',
      hi: 'संकट मोचन हनुमान मंदिर',
    },
    summary: {
      en: 'Sacred shrine established by saint-poet Goswami Tulsidas, renowned for divine solace, peaceful campus, and sacred Besan Ladoos.',
      hi: 'गोस्वामी तुलसीदास जी द्वारा स्थापित पावन हनुमान मंदिर, शांतिपूर्ण परिसर व प्रसिद्ध बेसन के लड्डू महाप्रसाद के लिए विख्यात।',
    },
    details: {
      en: 'Founded where Goswami Tulsidas is believed to have had the divine vision of Lord Hanuman. Located in the southern sector near BHU. Open daily from 5:00 AM to 10:00 PM. Tuesday and Saturday attract large crowds. Special Besan Ladoos (pure desi ghee) are the primary offering. The temple hosts the prestigious Sankat Mochan Sangeet Samaroh every April, featuring India top classical musicians. Mobile phones are checked at the security counter.',
      hi: 'ऐसी मान्यता है कि इसी स्थान पर गोस्वामी तुलसीदास जी को भगवान हनुमान जी के साक्षात दर्शन हुए थे। बीएचयू के निकट दक्षिणी भाग में स्थित। प्रतिदिन सुबह 5:00 से रात्रि 10:00 बजे तक खुला रहता है। मंगलवार और शनिवार को विशेष भीड़ रहती है। शुद्ध देसी घी के बेसन के लड्डू प्रमुख प्रसाद हैं। हर वर्ष अप्रैल में यहां प्रतिष्ठित संकट मोचन संगीत समारोह होता है। मोबाइल फोन सुरक्षा काउंटर पर जमा करना होता है।',
    },
    schedule_timing: 'Open daily 5:00 AM - 10:00 PM (No afternoon closure)',
    coordinates: { lat: 25.2818, lng: 82.9984 },
    source_url: 'https://varanasi.nic.in/tourist-place/sankat-mochan-temple/',
    source_title: 'Varanasi District Administration & Temple Trust',
    nearby_suggestions: {
      en: [
        'Banaras Hindu University (BHU) campus and New Vishwanath Temple (VT)',
        'Durga Kund Temple & historical stepwell (500m north)',
        'Pahalwan Lassi at Lanka Gate (famous thick lassi)'
      ],
      hi: [
        'काशी हिंदू विश्वविद्यालय (BHU) परिसर व नया विश्वनाथ मंदिर (VT)',
        'दुर्गा कुंड मंदिर व ऐतिहासिक लाल कुंड (500 मीटर उत्तर)',
        'लंका गेट पर पहलवान लस्सी'
      ],
    },
    is_verified: true,
    tags: ['temple', 'hanuman', 'sankat-mochan', 'tulsidas', 'prasad'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_food_varanasi_street',
    category: 'food',
    title: {
      en: 'Authentic Varanasi Street Food & Legendary Eateries',
      hi: 'प्रामाणिक बनारसी खान-पान व ऐतिहासिक स्वाद के ठिकाने',
    },
    summary: {
      en: 'Varanasi offers a distinctive vegetarian food culture rooted in slow-simmered spices, desi ghee, clay cups (kulhad), and centuries-old recipes.',
      hi: 'धीमी आंच पर पकने वाले मसालों, शुद्ध देसी घी, कुल्हड़ और सदियों पुरानी पाक-परंपरा का अनोखा शाकाहारी संगम।',
    },
    details: {
      en: 'Top Verified Food Recommendations:\n1. Tamatar Chaat & Palak Chaat: Kashi Chaat Bhandar (Godowlia Chowk) - cooked mashed tomatoes in ghee with dry fruits and cumin syrup. Opens 3:30 PM to 10:30 PM.\n2. Morning Kachori-Sabzi & Jalebi: Ram Bhandar (Thatheri Bazar) - spicy hing-dal kachori with pumpkin-potato curry, served strictly 7:00 AM to 11:00 AM.\n3. Lassi: Pehalwan Lassi (Assi Crossing, rich malai layer) & Blue Lassi (near Manikarnika Ghat alley, fruit toppings).\n4. Banarasi Paan: Keshav Tambool Bhandar (near Lanka) & Gopal Sah Paan (Chowk) - made with delicate Magahi leaf, kattha, gulkand, and betel nut without tobacco.\n5. Malaiyo (Winter specialty, Nov-Feb): Milk froth blended with saffron, pistachios, and dew drops, served in small earthen pots at Chaukhamba and Thatheri Bazar.',
      hi: 'प्रमुख प्रमाणित खाद्य स्थल:\n1. टमाटर चाट व पालक चाट: काशी चाट भंडार (गोदौलिया चौक) - देसी घी, काजू और जीरा-रस में पकी टमाटर चाट। दोपहर 3:30 से रात 10:30 बजे तक।\n2. सुबह की कचौड़ी-सब्जी व जलेबी: राम भंडार (ठठेरी बाजार) - हींग-उड़द दाल की कचौड़ी व कद्दू-आलू की तरकारी, सुबह 7:00 से 11:00 बजे तक।\n3. लस्सी: पहलवान लस्सी (अस्सी चौराहा, मलाईदार रबड़ी) और ब्लू लस्सी (मणिकर्णिका गली, विभिन्न फलों की टॉपिंग)।\n4. बनारसी पान: केशव ताम्बूल भंडार (लंका) और गोपाल साह (चौक) - कोमल मगही पत्ता, कत्था, गुलकंद और सुगंधित सुपाड़ी।\n5. मलइयो (सर्दियों की मिठाई, नवंबर-फरवरी): केसरिया दूध का फेन, पिस्ता और ओस की बूंदों से बना अमृत, चौखंभा व ठठेरी बाजार में उपलब्ध।',
    },
    schedule_timing: 'Morning Kachori: 7 AM - 11 AM | Evening Chaat: 4 PM - 11 PM',
    coordinates: { lat: 25.3094, lng: 83.0062 },
    source_url: 'https://varanasi.nic.in/culture-heritage/cuisine/',
    source_title: 'Varanasi District Tourism Cuisine Directory',
    nearby_suggestions: {
      en: [
        'Godowlia Chowk intersection (the food epicenter)',
        'Thatheri Bazar antique brass market',
        'Dashashwamedh vegetable & flower market'
      ],
      hi: [
        'गोदौलिया चौराहा (स्वाद का मुख्य केंद्र)',
        'ठठेरी बाजार (पीतल व कांसे का पारंपरिक बाजार)',
        'दशाश्वमेध फूल व पूजा सामग्री मंडी'
      ],
    },
    is_verified: true,
    tags: ['food', 'chaat', 'kachori', 'lassi', 'paan', 'malaiyo'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_transport_rates',
    category: 'transport',
    title: {
      en: 'Varanasi Transport, Ghat Boats & Fare Guidelines',
      hi: 'वाराणसी यातायात, नौका किराया व आवागमन नियम',
    },
    summary: {
      en: 'Official municipal guidelines on boat hire, e-rickshaws, and navigation across Old Kashi pedestrian zones.',
      hi: 'नगर निगम द्वारा तय नौका किराया, ई-रिक्शा दरें व पुरानी काशी के नो-व्हीकल जोन के नियम।',
    },
    details: {
      en: '1. Boats on Ganga: \n- Shared manual rowing boat: ₹100 - ₹150 per passenger between Assi and Dashashwamedh.\n- Private manual boat (up to 4 people): ₹800 - ₹1200 for 1-hour round trip.\n- Motorboat / Bajra: ₹1500 - ₹2500 per hour depending on season. Always insist on government-mandated life jackets before boarding.\n2. E-Rickshaws & Autos: \n- Shared e-rickshaw from Cantt Railway Station to Godowlia Chowk: ₹20 - ₹30 per passenger.\n- Reserved auto: ₹120 - ₹180.\n- Shared ride from Lanka (BHU) to Godowlia: ₹15 - ₹20.\n3. Pedestrian Rules: \n- The road from Godowlia to Dashashwamedh Ghat and Vishwanath Corridor is strictly a No-Vehicle Zone between 9:00 AM and 10:00 PM. All cars and autos must park at Godowlia Multi-Level Parking or Maidagin Parking.',
      hi: '1. गंगा में नौका किराया: \n- साझा हाथ वाली नाव (Rowing): ₹100 - ₹150 प्रति व्यक्ति (अस्सी से दशाश्वमेध)।\n- निजी हाथ वाली नाव (4 लोगों तक): ₹800 - ₹1200 प्रति घंटा।\n- मोटरबोट / बजड़ा: ₹1500 - ₹2500 प्रति घंटा। नाव पर बैठने से पहले अनिवार्य लाइफ जैकेट अवश्य पहनें।\n2. ई-रिक्शा व ऑटो: \n- कैंट रेलवे स्टेशन से गोदौलिया चौक: शेयरिंग ₹20 - ₹30 प्रति सवारी, रिजर्व ₹120 - ₹180।\n- लंका (BHU) से गोदौलिया: शेयरिंग ₹15 - ₹20।\n3. पैदल नियम: \n- गोदौलिया से दशाश्वमेध घाट और विश्वनाथ धाम का रास्ता सुबह 9:00 से रात 10:00 बजे तक पूर्णतः नो-व्हीकल जोन (केवल पैदल) रहता है। सभी वाहन गोदौलिया मल्टीलेवल पार्किंग या मैदागिन पर खड़े करने होते हैं।',
    },
    schedule_timing: 'Boats operate 5:30 AM to 8:30 PM (restricted in heavy monsoon)',
    coordinates: { lat: 25.3094, lng: 83.0062 },
    source_url: 'https://varanasi.nic.in/transport/',
    source_title: 'Varanasi Nagar Nigam & Traffic Police Directory',
    nearby_suggestions: {
      en: [
        'Godowlia Multi-Level Automated Parking Facility',
        'Dashashwamedh Police Station & Helpdesk',
        'Cantt Railway Station Pre-paid Auto Booth'
      ],
      hi: [
        'गोदौलिया मल्टीलेवल आधुनिक पार्किंग',
        'दशाश्वमेध पुलिस थाना व सहायता केंद्र',
        'कैंट रेलवे स्टेशन प्रीपेड ऑटो बूथ'
      ],
    },
    is_verified: true,
    tags: ['transport', 'boats', 'auto', 'erickshaw', 'parking', 'fares'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_history_kashi_chronology',
    category: 'history',
    title: {
      en: 'Varanasi Antiquity, Archaeology & Royal Patronage',
      hi: 'काशी की प्राचीनता, पुरातात्विक साक्ष्य व शाही संरक्षण',
    },
    summary: {
      en: 'Continuous habitation since at least the 11th century BCE, recognized in the Rigveda and Atharvaveda, with grand revivals by the Marathas and Ahilyabai Holkar.',
      hi: 'कम से कम 11वीं सदी ईसा पूर्व से निरंतर जीवंत, ऋग्वेद व अथर्ववेद में उल्लेख, तथा मराठा व अहिल्याबाई काल में भव्य पुनरुद्धार।',
    },
    details: {
      en: 'Excavations at Rajghat Plateau by the Archaeological Survey of India (ASI) establish continuous human urban settlement from at least the 11th century BCE. The city derived its name from two rivers: the Varuna to the north and the Assi to the south. Sarnath (10 km north) marks where Gautama Buddha turned the Wheel of Dharma (Dhammacakkappavattana Sutta) in 528 BCE. In 1780 CE, Maharani Ahilyabai Holkar of Indore financed the reconstruction of the current Kashi Vishwanath sanctum. Later in 1835, Maharaja Ranjit Singh of Punjab plated the temple spire with pure gold.',
      hi: 'भारतीय पुरातत्व सर्वेक्षण (ASI) द्वारा राजघाट पर की गई खुदाई से साबित होता है कि यहां 11वीं सदी ईसा पूर्व से निरंतर शहरी आबादी रही है। शहर का नाम दो नदियों के संगम से पड़ा: उत्तर में वरुणा और दक्षिण में अस्सी। सारनाथ में 528 ईसा पूर्व भगवान बुद्ध ने प्रथम उपदेश (धर्मचक्रप्रवर्तन) दिया था। 1780 में इंदौर की महारानी अहिल्याबाई होल्कर ने वर्तमान विश्वनाथ मंदिर का निर्माण करवाया और 1835 में पंजाब के महाराजा रणजीत सिंह ने इसके शिखर को शुद्ध सोने से मंडित किया।',
    },
    schedule_timing: 'Historical Documentation • Verified by Archaeological Survey of India (ASI)',
    coordinates: { lat: 25.3283, lng: 83.0335 },
    source_url: 'https://asi.nic.in/',
    source_title: 'Archaeological Survey of India (ASI) & National Portal of India',
    nearby_suggestions: {
      en: [
        'Rajghat Archaeological Excavation Site',
        'Sarnath Archaeological Museum (closed on Fridays)',
        'Dhamek Stupa & Ashoka Pillar Capital'
      ],
      hi: [
        'राजघाट पुरातात्विक उत्खनन स्थल',
        'सारनाथ पुरातात्विक संग्रहालय (शुक्रवार बंद)',
        'धमेख स्तूप व अशोक सिंह स्तंभ'
      ],
    },
    is_verified: true,
    tags: ['history', 'archaeology', 'ahilyabai', 'antiquity', 'sarnath'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_planning_ideal_day',
    category: 'planning',
    title: {
      en: 'Optimized 1-Day & 2-Day Spiritual Walking Itinerary',
      hi: 'उत्तम 1-दिवसीय व 2-दिवसीय आध्यात्मिक पैदल यात्रा योजना',
    },
    summary: {
      en: 'A step-by-step route designed to maximize morning peace on the ghats, avoid midday alley crowds, and experience Ganga Aarti seamlessly.',
      hi: 'सुबह की शांति, दोपहर की भीड़ से बचाव और संध्या आरती के निर्बाध दर्शन हेतु विशेष रूप से तैयार यात्रा मार्ग।',
    },
    details: {
      en: 'Optimal 1-Day Plan:\n- 05:00 AM: Reach Assi Ghat for Subah-e-Banaras morning Aarti and classical music.\n- 06:30 AM: Breakfast at Pehalwan Lassi or morning Kachori near Assi.\n- 07:30 AM: Morning boat ride from Assi to Dashashwamedh/Manikarnika along the 84 ghats.\n- 09:30 AM: Enter Kashi Vishwanath Corridor via Lalita Ghat entrance (less congested than Godowlia Gate).\n- 11:30 AM: Visit Annapurna Mandir for darshan and noon mahaprasad.\n- 01:00 PM: Rest at hotel during peak afternoon heat.\n- 04:30 PM: Walk through Vishwanath Gali, explore silk weavers and taste Tamatar Chaat at Kashi Chaat Bhandar.\n- 06:00 PM: Settle at Dashashwamedh Ghat steps for the 6:45 PM Maha Ganga Aarti.\n- 08:00 PM: Dinner and Banarasi Paan at Godowlia Chowk.',
      hi: 'आदर्श 1-दिवसीय यात्रा क्रम:\n- सुबह 05:00: अस्सी घाट पर सुबह-ए-बनारस आरती व शास्त्रीय संगीत।\n- सुबह 06:30: अस्सी चौराहे पर पहलवान लस्सी या कचौड़ी का नाश्ता।\n- सुबह 07:30: अस्सी से दशाश्वमेध व मणिकर्णिका तक 84 घाटों की नौका यात्रा।\n- सुबह 09:30: ललिता घाट की ओर से विश्वनाथ धाम में प्रवेश (गोदौलिया गेट से कम भीड़)।\n- पूर्वाह्न 11:30: अन्नपूर्णा माता के दर्शन व महाप्रसाद।\n- दोपहर 01:00: होटल में विश्राम (दोपहर की गर्मी से बचाव)।\n- शाम 04:30: विश्वनाथ गली में भ्रमण व काशी चाट भंडार पर टमाटर चाट।\n- शाम 06:00: दशाश्वमेध घाट की सीढ़ियों पर महा गंगा आरती हेतु स्थान ग्रहण।\n- रात्रि 08:00: गोदौलिया चौक पर भोजन व प्रसिद्ध बनारसी पान।',
    },
    schedule_timing: 'Full day schedule (05:00 AM to 09:00 PM)',
    coordinates: { lat: 25.3094, lng: 83.0062 },
    source_url: 'https://varanasi.nic.in/tourist-places/',
    source_title: 'Varanasi Smart City Tourism Initiative',
    nearby_suggestions: {
      en: [
        'Sarnath Half-Day Excursion (ideal for Day 2 morning)',
        'Ramnagar Fort & Museum across the Ganges (Day 2 afternoon)',
        'BHU New Vishwanath Temple (Day 2 evening)'
      ],
      hi: [
        'सारनाथ आधा दिन भ्रमण (दूसरे दिन सुबह हेतु श्रेष्ठ)',
        'रामनगर किला व संग्रहालय गंगा पार (दूसरे दिन दोपहर)',
        'काशी हिंदू विश्वविद्यालय नया विश्वनाथ मंदिर (दूसरे दिन शाम)'
      ],
    },
    is_verified: true,
    tags: ['planning', 'itinerary', '1-day', 'walking', 'guide'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_weather_seasons',
    category: 'weather',
    title: {
      en: 'Varanasi Climate, Best Visiting Months & Dev Deepawali',
      hi: 'वाराणसी का मौसम, श्रेष्ठ यात्रा माह व देव दीपावली',
    },
    summary: {
      en: 'Winter (October to March) provides the finest weather (15°C–25°C). Dev Deepawali in November is the city grandest visual spectacle.',
      hi: 'सर्दियां (अक्टूबर से मार्च) सुखद मौसम (15°C–25°C) प्रदान करती हैं। नवंबर में देव दीपावली शहर का सबसे भव्य उत्सव है।',
    },
    details: {
      en: 'Season Breakdown:\n1. Winter (October - March): Peak tourist season. Temperatures 10°C to 25°C. Crisp mornings and pleasant walking weather. Carry light woolens.\n2. Dev Deepawali (Kartik Purnima, mid-November): Over 1 million earthen lamps (diyas) light all 84 ghats. Book hotels and boats 3-4 months in advance.\n3. Summer (April - June): Temperatures exceed 42°C with dry loo winds. Only early mornings (5-8 AM) and evenings (6-9 PM) are suitable for sightseeing.\n4. Monsoon (July - September): River water levels rise significantly. In peak flooding, the lower stone steps of all ghats are submerged, and the administration halts all commercial boat rides for safety.',
      hi: 'ऋतु अनुसार विवरण:\n1. शीतकाल (अक्टूबर - मार्च): यात्रा का सर्वोत्तम समय। तापमान 10°C से 25°C। सुबह सुखद और धूप सुहावनी। हल्के ऊनी कपड़े साथ रखें।\n2. देव दीपावली (कार्तिक पूर्णिमा, नवंबर): सभी 84 घाटों पर 10 लाख से अधिक मिट्टी के दीप जलते हैं। होटल व नौका की बुकिंग 3-4 महीने पहले करें।\n3. ग्रीष्मकाल (अप्रैल - जून): तापमान 42°C से अधिक, तेज धूप व लू। केवल सुबह (5 से 8) व शाम (6 से 9) ही भ्रमण हेतु उपयुक्त।\n4. वर्षाकाल (जुलाई - सितंबर): गंगा का जलस्तर काफी बढ़ जाता है। बाढ़ के समय सीढ़ियां जलमग्न हो जाती हैं और सुरक्षा कारणों से नौका संचालन रोक दिया जाता है।',
    },
    schedule_timing: 'Best Period: October through March',
    coordinates: { lat: 25.3109, lng: 83.0104 },
    source_url: 'https://mausam.imd.gov.in/',
    source_title: 'India Meteorological Department (IMD) Varanasi Station',
    nearby_suggestions: {
      en: [
        'Assi Ghat morning walks in winter mist',
        'Sunset boat rides from Rajghat to Assi in pleasant autumn'
      ],
      hi: [
        'सर्दियों में अस्सी घाट की सुबह की सैर',
        'शरद ऋतु में राजघाट से अस्सी तक सूर्यास्त नौका यात्रा'
      ],
    },
    is_verified: true,
    tags: ['weather', 'best-time', 'winter', 'dev-deepawali', 'monsoon'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb_hotels_stay_guide',
    category: 'hotels',
    title: {
      en: 'Varanasi Accommodation Guide: Ghats, Cantt & Dharamshalas',
      hi: 'वाराणसी आवास मार्गदर्शिका: घाट, कैंट व धर्मशालाएं',
    },
    summary: {
      en: 'Where to stay based on your priorities: riverside heritage atmosphere on the ghats, luxury hotels in Cantonment, or budget dharamshalas near Godowlia.',
      hi: 'अपनी सुविधा अनुसार निवास चुनें: घाटों पर नदी का हेरिटेज दृश्य, कैंट में आधुनिक होटल, या गोदौलिया के निकट किफायती धर्मशालाएं।',
    },
    details: {
      en: '1. On the Ghats (Assi, Dashashwamedh, Kedar):\n- Pros: Instant access to sunrise, Ganga Aarti, and spiritual atmosphere. Historic havelis converted into boutique stays.\n- Cons: No motor vehicle access. You must walk through narrow pedestrian alleys with luggage. Book luggage porters if needed.\n2. Cantonment (Cantt / Nadesar):\n- Pros: Wide roads, peaceful green campus, accessible by car/taxi, home to luxury properties (Taj Ganges, Ramada).\n- Cons: 5 to 7 km away from main ghats, requiring a 25-minute auto ride to Godowlia.\n3. Trusted Dharamshalas (Pilgrim Rest Houses):\n- Shri Kashi Vishwanath Dharmashala, Birla Dharmashala (near Godowlia), and Marwari Seva Sangh. Safe, economical (₹300 - ₹1000/day) with verified pilgrim verification.',
      hi: '1. घाटों के किनारे (अस्सी, दशाश्वमेध, केदार घाट):\n- लाभ: गंगा का सीधा दृश्य, आरती व सुबह के आयोजनों की सुगम पहुंच।\n- सावधानी: चार पहिया वाहन नहीं जा सकते। सामान लेकर संकरी गलियों में पैदल चलना पड़ता है।\n2. कैंटोनमेंट क्षेत्र (कैंट / नदेसर):\n- लाभ: चौड़ी सड़कें, शांत माहौल, टैक्सी से सुगम पहुंच, लग्जरी होटल।\n- सावधानी: मुख्य घाटों से 5 से 7 किमी दूर (ऑटो से लगभग 25 मिनट)।\n3. विश्वसनीय धर्मशालाएं:\n- श्री काशी विश्वनाथ धर्मशाला, बिड़ला धर्मशाला (गोदौलिया के पास), मारवाड़ी सेवा संघ। सुरक्षित, स्वच्छ व किफायती (₹300 - ₹1000/दिन)।',
    },
    schedule_timing: 'Standard Check-in: 12:00 PM | Check-out: 11:00 AM',
    coordinates: { lat: 25.3094, lng: 83.0062 },
    source_url: 'https://varanasi.nic.in/hotels-lodges/',
    source_title: 'District Administration Varanasi Tourism Directory',
    nearby_suggestions: {
      en: [
        'Godowlia Chowk (central connectivity hub)',
        'Assi Ghat promenade for morning coffee & peaceful cafes',
        'Varanasi Cantt Railway Station (5 km)'
      ],
      hi: [
        'गोदौलिया चौक (केंद्रीय आवागमन केंद्र)',
        'अस्सी घाट किनारा (शांत कैफे व सुबह की चाय)',
        'वाराणसी कैंट रेलवे स्टेशन (5 किमी)'
      ],
    },
    is_verified: true,
    tags: ['hotels', 'stay', 'dharamshala', 'ghats', 'cantonment'],
    updated_at: new Date().toISOString(),
  },
];
