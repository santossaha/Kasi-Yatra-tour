import { TouristPlace } from '../types/tourist';

export const VARANASI_CENTER = {
  lat: 25.3109,
  lng: 83.0104,
};

// Common starting hubs in Varanasi
export const VARANASI_HUBS = [
  {
    id: 'godowlia',
    name: { en: 'Godowlia Chowk (Main Ghat Gateway)', hi: 'गोदौलिया चौक (मुख्य घाट प्रवेश द्वार)' },
    coordinates: { lat: 25.3094, lng: 83.0062 },
  },
  {
    id: 'cantt-station',
    name: { en: 'Varanasi Junction (Cantt Railway Station)', hi: 'वाराणसी जंक्शन (कैंट रेलवे स्टेशन)' },
    coordinates: { lat: 25.3283, lng: 82.9863 },
  },
  {
    id: 'bhu-gate',
    name: { en: 'BHU Main Gate (Lanka)', hi: 'बीएचयू मुख्य द्वार (लंका)' },
    coordinates: { lat: 25.2798, lng: 82.9996 },
  },
];

export const VARANASI_PLACES: TouristPlace[] = [
  {
    id: 'kashi-vishwanath',
    number: 1,
    name: {
      en: 'Shri Kashi Vishwanath Temple',
      hi: 'श्री काशी विश्वनाथ मंदिर',
    },
    subtitle: {
      en: 'The Golden Temple of Lord Shiva & Sacred Jyotirlinga',
      hi: 'भगवान शिव का स्वर्णिम ज्योतिर्लिंग मंदिर',
    },
    category: 'temple',
    coordinates: { lat: 25.3109, lng: 83.0107 },
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'One of the twelve most sacred Jyotirlingas in Hinduism, standing at the spiritual heart of Kashi on the western bank of the Ganges.',
      hi: 'हिंदू धर्म के बारह सबसे पवित्र ज्योतिर्लिंगों में से एक, जो गंगा के पश्चिमी तट पर काशी के आध्यात्मिक केंद्र में स्थित है।',
    },
    historicalBackground: {
      en: 'The temple has been destroyed and reconstructed several times across centuries. The current sanctum structure was constructed in 1780 CE by Maharani Ahilyabai Holkar of Indore. In 1835, Maharaja Ranjit Singh of Punjab donated 1 tonne of gold to plate its iconic spire (shikhara). The temple corridor connecting the shrine directly to the holy Ganga was inaugurated in December 2021.',
      hi: 'इस मंदिर का सदियों में कई बार जीर्णोद्धार हुआ। वर्तमान गर्भगृह का निर्माण 1780 ईस्वी में इंदौर की महारानी अहिल्याबाई होल्कर ने करवाया था। 1835 में पंजाब के महाराजा रणजीत सिंह ने इसके शिखर पर 1 टन सोने का पत्तर दान किया। गंगा को मंदिर से सीधे जोड़ने वाले विश्वनाथ धाम कॉरिडोर का लोकार्पण दिसंबर 2021 में हुआ।',
    },
    periodDocumented: {
      en: 'Rebuilt 1780 CE by Ahilyabai Holkar; Gold dome added 1835 CE',
      hi: '1780 ईस्वी में अहिल्याबाई होल्कर द्वारा पुनर्निर्मित; 1835 ईस्वी में स्वर्ण शिखर',
    },
    religiousSignificance: {
      en: 'Believed to grant Moksha (liberation from the cycle of rebirth) to anyone passing away in Kashi, where Shiva whispers the Taraka mantra into the ear.',
      hi: 'ऐसी मान्यता है कि काशी में देहत्याग करने वाले को भगवान शिव स्वयं तारक मंत्र देकर मोक्ष प्रदान करते हैं।',
    },
    architecturalFeatures: {
      en: 'Nagari style spire crowned with gold plating, intricate stone carvings, and a modern 50,000 sq meter stone corridor leading seamlessly down to Lalita Ghat.',
      hi: 'नागर शैली का स्वर्णिम शिखर, बलुआ पत्थर पर नक्काशी, और ललिता घाट तक फैला 50,000 वर्ग मीटर का भव्य पत्थर कॉरिडोर।',
    },
    interestingFacts: {
      en: [
        'Over 800 kg of pure gold adorns the main temple dome and sanctum.',
        'The sacred well known as Gyanvapi is situated right beside the sanctum.',
        'Electronic gadgets, leather belts, and shoes are strictly prohibited inside the sanctum; free digital lockers are provided at the corridor gates.',
      ],
      hi: [
        'मुख्य मंदिर के गुंबद और गर्भगृह पर 800 किलो से अधिक शुद्ध सोना सुशोभित है।',
        'ज्ञानवापी कूप गर्भगृह के ठीक समीप स्थित है।',
        'गर्भगृह के अंदर मोबाइल, कैमरा और चमड़े का सामान ले जाना प्रतिबंधित है; कॉरिडोर द्वारों पर निशुल्क लॉकर उपलब्ध हैं।',
      ],
    },
    visitingHours: {
      en: '03:00 AM – 11:00 PM (Gates close briefly during Bhog Aarti at 11:15 AM)',
      hi: 'प्रातः 03:00 बजे से रात्रि 11:00 बजे तक (भोग आरती के समय 11:15 पूर्वाह्न अल्प विराम)',
    },
    aartiTimings: {
      en: 'Mangala Aarti: 03:00 AM | Bhog: 11:15 AM | Sandhya: 07:00 PM | Shayan: 10:30 PM',
      hi: 'मंगला आरती: प्रातः 03:00 | भोग: 11:15 पूर्वाह्न | संध्या: 07:00 सायं | शयन: 10:30 रात्रि',
    },
    entryFee: {
      en: 'Free for general Sugam/walk-in Darshan; nominal fee applies for special booked poojas via temple trust',
      hi: 'सामान्य दर्शन निशुल्क; विशेष पूजा एवं सुगम दर्शन हेतु न्यास द्वारा निर्धारित शुल्क',
    },
    accessibilityNotes: {
      en: 'The new Vishwanath Corridor is fully wheelchair accessible with ramps, battery-operated golf carts, and elevators from the ghat gate.',
      hi: 'नया विश्वनाथ कॉरिडोर रैंप, गोल्फ कार्ट और लिफ्ट के साथ व्हीलचेयर अनुकूल है।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Highly recommended. Located in pedestrianized lanes of old Kashi and corridor walkways.',
        hi: 'अत्यधिक अनुशंसित। पुरानी काशी की पैदल गलियों और भव्य कॉरिडोर से सुगम।',
      },
      driving: {
        en: 'Vehicles must park at Godowlia Multilevel Parking or Maidagin. Pedestrian walk or e-rickshaw required thereafter.',
        hi: 'वाहन गोदौलिया मल्टीलेवल पार्किंग या मैदागिन पर खड़े करने होंगे; आगे पैदल या ई-रिक्शा।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Kashi_Vishwanath_Temple',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%95%E0%A4%BE%E0%A4%B6%E0%A5%80_%E0%A4%B5%E0%A4%BF%E0%A4%B6%E0%A5%8D%E0%A4%B5%E0%A4%A8%E0%A4%BE%E0%A4%A5_%E0%A4%AE%E0%A4%82%E0%A4%A6%E0%A4%BF%E0%A4%B0',
    },
    sources: [
      'Archaeological Survey of India (ASI)',
      'Kashi Vishwanath Temple Trust Records',
      'Gazetteer of Varanasi District',
    ],
    suggestedDurationMinutes: 90,
    rating: 4.9,
    highlightTag: {
      en: 'Must Visit #1',
      hi: 'सर्वोच्च दर्शनीय स्थल',
    },
  },
  {
    id: 'dashashwamedh-ghat',
    number: 2,
    name: {
      en: 'Dashashwamedh Ghat',
      hi: 'दशाश्वमेध घाट',
    },
    subtitle: {
      en: 'The Grand Waterfront & World-Famous Evening Maha Aarti',
      hi: 'प्रसिद्ध गंगा आरती और काशी का सबसे जीवंत मुख्य घाट',
    },
    category: 'ghat',
    coordinates: { lat: 25.3069, lng: 83.0105 },
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'The most vibrant and culturally famous ghat in Varanasi, renowned worldwide for its magnificent daily evening Ganga Aarti performed by priests with multi-tiered brass lamps.',
      hi: 'वाराणसी का सबसे प्रसिद्ध और जीवंत घाट, जो शाम को पुरोहितों द्वारा की जाने वाली भव्य गंगा आरती और मंत्रोच्चार के लिए विश्व प्रसिद्ध है।',
    },
    historicalBackground: {
      en: 'The ghat’s name relates to the legendary sacrifice of ten horses (dasa-ashwamedha) performed here. Historically, the ghat stone steps were rebuilt in 1748 CE by Peshwa Balaji Baji Rao, and later in 1774 CE by Queen Ahilyabai Holkar of Indore, cementing its status as the social and religious hub of Kashi.',
      hi: 'इस घाट का नाम दस घोड़ों के अश्वमेध यज्ञ से जुड़ा है। ऐतिहासिक रूप से 1748 में पेशवा बालाजी बाजीराव और 1774 में रानी अहिल्याबाई होल्कर ने इसके पत्थर के घाटों का जीर्णोद्धार करवाया।',
    },
    periodDocumented: {
      en: 'Rebuilt 1748 CE by Peshwas; renovated 1774 CE',
      hi: '1748 ईस्वी में पेशवा द्वारा निर्मित; 1774 ईस्वी में पुनर्निर्मित',
    },
    religiousSignificance: {
      en: 'According to tradition, Lord Brahma created this ghat to welcome Lord Shiva to Varanasi. Taking a dip here is considered equivalent to performing ten Ashwamedha sacrifices.',
      hi: 'धार्मिक परंपरा के अनुसार भगवान ब्रह्मा ने भगवान शिव के काशी आगमन पर इस घाट का निर्माण किया था। यहां स्नान दस अश्वमेध यज्ञों के समतुल्य माना जाता है।',
    },
    architecturalFeatures: {
      en: 'Expansive pink Chunar sandstone steps descending smoothly into the Ganga, stepped viewing platforms, and tiered wooden pavilions.',
      hi: 'चुनार के गुलाबी बलुआ पत्थर की चौड़ी सीढ़ियां जो गंगा तक जाती हैं, एवं आरती दर्शन हेतु विशेष चबूतरे।',
    },
    interestingFacts: {
      en: [
        'The evening Ganga Aarti begins around 6:45 PM (summer) or 6:15 PM (winter) and lasts 45 minutes.',
        'Thousands assemble each dusk on riverboats and steps with floating earthen diya lamps (deepdan).',
        'Direct pedestrian gateway to Vishwanath Gali and Godowlia market.',
      ],
      hi: [
        'संध्या गंगा आरती गर्मियों में सायं 6:45 और सर्दियों में 6:15 बजे शुरू होकर 45 मिनट चलती है।',
        'हजारों श्रद्धालु नावों और सीढ़ियों पर बैठकर गंगा में दीपदान करते हैं।',
        'विश्वनाथ गली और गोदौलिया बाज़ार से सीधा पैदल संपर्क।',
      ],
    },
    visitingHours: {
      en: 'Open 24 hours daily (Best experience: Sunrise 5:30 AM & Evening Aarti 6:30 PM)',
      hi: '24 घंटे खुला (सर्वश्रेष्ठ समय: प्रातः 5:30 सूर्योदय व सायं 6:30 गंगा आरती)',
    },
    aartiTimings: {
      en: 'Maha Ganga Aarti: 6:45 PM (Summer) / 6:15 PM (Winter)',
      hi: 'महा गंगा आरती: सायं 6:45 (ग्रीष्म) / सायं 6:15 (शीतकाल)',
    },
    entryFee: {
      en: 'Free public access; boat rides range ₹100–₹300 per person on shared boats or ₹1,500+ for private bajra',
      hi: 'घाट पर जाना पूर्णतः निशुल्क; साझा नौका ₹100–₹300 प्रति व्यक्ति, निजी नाव अलग दर पर',
    },
    accessibilityNotes: {
      en: 'Steep stone steps. Accessible viewing available from the upper promenade and Godowlia plaza.',
      hi: 'सीढ़ियां हैं। ऊपरी चबूतरे से आरती आसानी से देखी जा सकती है।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Only accessible by foot from Godowlia crossing (approx. 400m walk).',
        hi: 'गोदौलिया चौराहे से केवल पैदल (लगभग 400 मीटर की दूरी)।',
      },
      driving: {
        en: 'Vehicles strictly restricted on Dashashwamedh road during daytime and evening.',
        hi: 'दिन और शाम के समय इस मार्ग पर वाहनों का प्रवेश पूरी तरह प्रतिबंधित है।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Dashashwamedh_Ghat',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%A6%E0%A4%B6%E0%A4%BE%E0%A4%B6%E0%A5%8D%E0%A4%B5%E0%A4%AE%E0%A5%87%E0%A4%A7_%E0%A4%98%E0%A4%BE%E0%A4%9F',
    },
    sources: [
      'Ghats of Varanasi: Cultural Heritage Survey',
      'Varanasi Nagar Nigam Heritage Registry',
      'District Administration Varanasi',
    ],
    suggestedDurationMinutes: 75,
    rating: 4.9,
    highlightTag: {
      en: 'Iconic Ganga Aarti',
      hi: 'विश्वविख्यात महाआरती',
    },
  },
  {
    id: 'manikarnika-ghat',
    number: 3,
    name: {
      en: 'Manikarnika Ghat',
      hi: 'मणिकर्णिका घाट',
    },
    subtitle: {
      en: 'The Eternal Cremation Ghat & Sacred Manikarnika Kund',
      hi: 'महाश्मशान और मोक्षदायिनी चक्रपुष्करिणी कुंड',
    },
    category: 'ghat',
    coordinates: { lat: 25.3108, lng: 83.0139 },
    image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'The primary cremation ghat of Varanasi where the sacred funeral pyres burn continuously. Here death is viewed not with despair, but as a dignified transition toward ultimate liberation (Moksha).',
      hi: 'वाराणसी का मुख्य महाश्मशान घाट जहां निरंतर चिताएं प्रज्वलित रहती हैं। यहां मृत्यु को शोक नहीं बल्कि मोक्ष का द्वार माना जाता है।',
    },
    historicalBackground: {
      en: 'Mentioned in early Gupta inscriptions and ancient Puranas. The stone ghat steps and temples were reinforced by the Scindias and Peshwas in the 18th and 19th centuries. The sacred Manikarnika Kund (Chakrapushkarini) is documented as one of the oldest water bodies in Varanasi.',
      hi: 'गुप्तकालीन अभिलेखों और पुराणों में इसका उल्लेख है। 18वीं-19वीं शताब्दी में सिंधिया और पेशवा शासकों ने इसके पत्थर के घाटों का सुदृढ़ीकरण किया। चक्रपुष्करिणी कुंड काशी के प्राचीनतम तीर्थों में से है।',
    },
    periodDocumented: {
      en: 'Ancient recorded site; stone terraces reinforced 1730–1791 CE',
      hi: 'प्राचीन काल से निरंतर; पत्थर के चबूतरे 1730-1791 ईस्वी में सुदृढ़',
    },
    religiousSignificance: {
      en: 'Believed to be the spot where Parvati dropped her earring (Manikarnika) or where Lord Shiva keeps eternal vigil over departing souls.',
      hi: 'धार्मिक मान्यतानुसार यहां माता पार्वती का कर्णफूल (मणिकर्णिका) गिरा था। मान्यता है कि शिव यहां स्वयं मुक्ति देते हैं।',
    },
    architecturalFeatures: {
      en: 'Multi-level stone burning terraces, wood stacks, the ancient stepped Kund, and the leaning Ratneshwar Mahadev temple adjacent at Scindia Ghat.',
      hi: 'बहुस्तरीय पत्थर के चबूतरे, प्राचीन कुंड, और समीप ही झुका हुआ ऐतिहासिक रत्नेश्वर महादेव मंदिर।',
    },
    interestingFacts: {
      en: [
        'Photography of funeral pyres is strictly prohibited out of respect for grieving families.',
        'The eternal flame used to light pyres is maintained by the hereditary Dom Raja community.',
        'Best observed from a passing riverboat on the Ganges to maintain respectful distance.',
      ],
      hi: [
        'शोकसंतप्त परिवारों के सम्मान में चिताओं की फोटोग्राफी सख्त वर्जित है।',
        'चिता जलाने वाली अखंड अग्नि का संरक्षण डोम राजा परिवार द्वारा पीढ़ियों से किया जाता है।',
        'नाव से दूर रहकर सम्मानपूर्वक दर्शन करना सबसे उपयुक्त माना जाता है।',
      ],
    },
    visitingHours: {
      en: 'Active 24 hours daily. Quiet respectful presence required.',
      hi: '24 घंटे सक्रिय। शांत और मर्यादित व्यवहार अपेक्षित है।',
    },
    entryFee: {
      en: 'Free public ghat. Beware of touts asking for bogus donations for firewood.',
      hi: 'निःशुल्क। लकड़ी या दान के नाम पर पैसे मांगने वाले दलालों से सावधान रहें।',
    },
    accessibilityNotes: {
      en: 'Uneven surfaces, stairs, and smoke from firewood. Best viewed respectfully from the river.',
      hi: 'सीढ़ियां और धुआं रहता है। नाव से दर्शन करना सबसे सहज विकल्प है।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Accessible via narrow ghat paths from Dashashwamedh (10 min walk) or Kashi Vishwanath Corridor.',
        hi: 'दशाश्वमेध से घाट के रास्ते पैदल (10 मिनट) या विश्वनाथ कॉरिडोर से।',
      },
      driving: {
        en: 'No vehicular access. Strictly pedestrian alleyways.',
        hi: 'गाड़ियों का कोई प्रवेश नहीं। केवल पैदल संकरी गलियां।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Manikarnika_Ghat',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%AE%E0%A4%A3%E0%A4%BF%E0%A4%95%E0%A4%B0%E0%A5%8D%E0%A4%A3%E0%A4%BF%E0%A4%95%E0%A4%BE_%E0%A4%98%E0%A4%BE%E0%A4%9F',
    },
    sources: [
      'Imperial Gazetteer of India, Vol. 24',
      'Banaras: City of Light (Diana L. Eck)',
      'ASI Archaeological Records',
    ],
    suggestedDurationMinutes: 45,
    rating: 4.7,
    highlightTag: {
      en: 'Sacred Mahashmashan',
      hi: 'मोक्ष महातीर्थ',
    },
  },
  {
    id: 'assi-ghat',
    number: 4,
    name: {
      en: 'Assi Ghat',
      hi: 'अस्सी घाट',
    },
    subtitle: {
      en: 'Southern Gateway, Subah-e-Banaras & Cultural Hub',
      hi: 'सुबह-ए-बनारस, योग, संगीत और दक्षिण काशी का संगम',
    },
    category: 'ghat',
    coordinates: { lat: 25.2897, lng: 83.0069 },
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'The southernmost of Varanasi’s major ghats, where the river Assi meets the Ganges. Famous for its morning classical music, yoga, and vibrant student-intellectual atmosphere.',
      hi: 'वाराणसी के प्रमुख घाटों का सबसे दक्षिणी छोर, जहां अस्सी नदी का गंगा से संगम होता है। यह सुबह-ए-बनारस, योगाभ्यास और सांस्कृतिक गतिविधियों का प्रमुख केंद्र है।',
    },
    historicalBackground: {
      en: 'Mentioned extensively in the Matsya Purana, Kurma Purana, and Agni Purana. Historically served as the retreat where poet-saint Goswami Tulsidas resided and wrote parts of the Ramcharitmanas before passing away nearby at Tulsi Ghat in 1623 CE.',
      hi: 'मत्स्य, कूर्म और अग्नि पुराण में इसका विशद वर्णन है। संत गोस्वामी तुलसीदास ने यहां रहकर रामचरितमानस की रचना की थी और 1623 में निकटवर्ती तुलसी घाट पर महाप्रयाण किया।',
    },
    periodDocumented: {
      en: 'Ancient river confluence; major cultural center since 16th century CE',
      hi: 'प्राचीन संगम स्थल; 16वीं शताब्दी से प्रमुख सांस्कृतिक केंद्र',
    },
    religiousSignificance: {
      en: 'Worship of the Asisangameshwar lingam under a sacred Peepal tree and sunrise holy bath here are believed to bestow the fruit of all pilgrimages.',
      hi: 'असि-संगमेश्वर लिंग की पूजा और पीपल वृक्ष के नीचे सूर्योदय स्नान से समस्त तीर्थों का पुण्य प्राप्त होने की मान्यता है।',
    },
    architecturalFeatures: {
      en: 'Spacious stone plaza accommodating large gatherings, steps leading into the river, and quaint heritage cafes lining the upper lane.',
      hi: 'विशाल पत्थर का खुला प्रांगण, सीढ़ियां, और ऊपरी हिस्से में ऐतिहासिक इमारतें व कैफे।',
    },
    interestingFacts: {
      en: [
        'Hosts "Subah-e-Banaras" every morning at dawn featuring Vedic chants, classical music, and group yoga.',
        'Popular gathering place for Banaras Hindu University (BHU) students, artists, and international travelers.',
        'Great starting point for an end-to-end boat cruise all the way up to Namo Ghat.',
      ],
      hi: [
        'हर सुबह भोर में "सुबह-ए-बनारस" का आयोजन, जिसमें वेद पाठ, शास्त्रीय गायन और सामूहिक योग होता है।',
        'बीएचयू छात्रों, साहित्यकारों और विदेशी पर्यटकों का प्रिय स्थल।',
        'अस्सी से नमो घाट तक संपूर्ण 84 घाटों की नौका यात्रा का बेहतरीन आरंभ बिंदु।',
      ],
    },
    visitingHours: {
      en: 'Open 24 hours (Best experience: 5:00 AM – 7:30 AM for morning dawn rituals)',
      hi: '24 घंटे खुला (सर्वोत्तम समय: प्रातः 5:00 से 7:30 बजे सुबह-ए-बनारस हेतु)',
    },
    aartiTimings: {
      en: 'Morning Subah-e-Banaras Aarti: 5:00 AM | Evening Aarti: 6:30 PM',
      hi: 'प्रातः आरती: 5:00 बजे | संध्या आरती: सायं 6:30 बजे',
    },
    entryFee: {
      en: 'Free public entry',
      hi: 'पूर्णतः निशुल्क',
    },
    accessibilityNotes: {
      en: 'Vehicle road reaches directly to the top edge of Assi Ghat, making it one of the most accessible ghats in Varanasi for cars and elderly visitors.',
      hi: 'गाड़ियां घाट के ठीक ऊपर तक पहुंच सकती हैं, इसलिए यह बुजुर्गों और वाहनों के लिए सबसे सुगम घाट है।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Scenic walking along the connected ghat stone promenade from Dashashwamedh (approx. 35-45 mins).',
        hi: 'दशाश्वमेध से घाटों के किनारे-किनारे सुरम्य पदयात्रा (35-45 मिनट)।',
      },
      driving: {
        en: 'Accessible by auto, car, and taxi via Assi Road with roadside parking available.',
        hi: 'अस्सी रोड से कार, ऑटो और टैक्सी द्वारा आसानी से पहुंचा जा सकता है।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Assi_Ghat',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%85%E0%A4%B8%E0%A5%8D%E0%A4%B8%E0%A5%80_%E0%A4%98%E0%A4%BE%E0%A4%9F',
    },
    sources: [
      'Subah-e-Banaras Official Cultural Board',
      'Varanasi Heritage Directory',
      'Puranic Encyclopedia',
    ],
    suggestedDurationMinutes: 75,
    rating: 4.8,
    highlightTag: {
      en: 'Subah-e-Banaras Hub',
      hi: 'सुबह-ए-बनारस',
    },
  },
  {
    id: 'sarnath',
    number: 5,
    name: {
      en: 'Sarnath Archaeological Site & Dhamek Stupa',
      hi: 'सारनाथ पुरातात्विक स्थल एवं धमेक स्तूप',
    },
    subtitle: {
      en: 'Where Gautama Buddha Preached His First Sermon (Dharmachakra Pravartana)',
      hi: 'भगवान बुद्ध द्वारा प्रथम उपदेश (धर्मचक्र प्रवर्तन) का पावन स्थल',
    },
    category: 'historical',
    coordinates: { lat: 25.3811, lng: 83.0214 },
    image: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'Located 10 km north-east of Varanasi, Sarnath is one of the four principal Buddhist pilgrimage sites. Here Gautama Buddha taught the Four Noble Truths and set the Wheel of Dharma into motion in 528 BCE.',
      hi: 'वाराणसी से 10 किमी उत्तर-पूर्व में स्थित सारनाथ बौद्ध धर्म के चार प्रमुख तीर्थों में से एक है। यहीं 528 ईसा पूर्व बुद्ध ने चार आर्य सत्य और अष्टांगिक मार्ग का प्रथम उपदेश दिया था।',
    },
    historicalBackground: {
      en: 'After attaining Enlightenment at Bodh Gaya, Buddha delivered his first discourse to five disciples in the Deer Park (Isipatana). Emperor Ashoka visited in the 3rd century BCE, erecting monumental stupas and the celebrated Ashoka Pillar whose four-lion capital is India’s National Emblem. The Dhamek Stupa was expanded to its present cylindrical form around 500 CE during the Gupta Dynasty.',
      hi: 'बोधगया में ज्ञान प्राप्ति के बाद बुद्ध ने मृगदाव में 5 शिष्यों को उपदेश दिया। तीसरी सदी ईसा पूर्व में सम्राट अशोक ने यहां स्तंभ और स्तूप बनवाए, जिसका सिंह शीर्ष भारत का राष्ट्रीय प्रतीक है। वर्तमान धमेक स्तूप का विस्तार 500 ईस्वी के आसपास गुप्त काल में हुआ।',
    },
    periodDocumented: {
      en: 'First Sermon 528 BCE; Ashokan Pillar 250 BCE; Current Dhamek Stupa ~500 CE',
      hi: 'प्रथम उपदेश 528 ई.पू.; अशोक स्तंभ 250 ई.पू.; वर्तमान धमेक स्तूप ~500 ईस्वी (गुप्त काल)',
    },
    religiousSignificance: {
      en: 'Birthplace of the Buddhist Sangha (monastic order) and location of the Dharmachakra Pravartana Sutra.',
      hi: 'बौद्ध संघ की स्थापना का पावन स्थल और धर्मचक्र प्रवर्तन का केंद्र।',
    },
    architecturalFeatures: {
      en: 'Massive cylindrical brick and stone stupa standing 43.6 meters high with intricate Gupta geometric and floral relief carvings, surrounded by ancient monastery ruins.',
      hi: '43.6 मीटर ऊंचा विशाल बेलनाकार स्तूप, जिस पर गुप्तकालीन ज्यामितीय और पुष्प नक्काशी उकेरी गई है।',
    },
    interestingFacts: {
      en: [
        'India’s National Emblem (the Lion Capital of Ashoka) was excavated right here and is preserved in the adjacent Sarnath Archaeological Museum.',
        'Monks and pilgrims from Japan, Thailand, Sri Lanka, and Tibet regularly perform circumambulation (pradakshina) here.',
        'Also sacred to Jainism as the birthplace of Shreyanshanatha, the 11th Tirthankara.',
      ],
      hi: [
        'भारत का राष्ट्रीय प्रतीक (अशोक स्तंभ का सिंह शीर्ष) यहीं से प्राप्त हुआ था और पास के सारनाथ संग्रहालय में सुरक्षित है।',
        'जापान, थाईलैंड, श्रीलंका और तिब्बत से आने वाले बौद्ध भिक्षु यहां स्तूप की प्रदक्षिणा करते हैं।',
        'जैन धर्म के 11वें तीर्थंकर श्रेयांसनाथ जी की जन्मस्थली के रूप में भी पूज्य।',
      ],
    },
    visitingHours: {
      en: 'Sunrise to Sunset daily (approx. 06:00 AM – 06:00 PM)',
      hi: 'सूर्योदय से सूर्यास्त तक (लगभग प्रातः 06:00 से सायं 06:00 बजे तक)',
    },
    entryFee: {
      en: '₹25 for Indian citizens & SAARC visitors; ₹300 for foreign tourists (Free for children under 15)',
      hi: 'भारतीय नागरिकों हेतु ₹25; विदेशी पर्यटकों हेतु ₹300 (15 वर्ष से कम बच्चों का प्रवेश निशुल्क)',
    },
    accessibilityNotes: {
      en: 'Flat green lawns with paved pathways around the monument, wheelchair accessible.',
      hi: 'समतल पक्के रास्ते और बगीचे, व्हीलचेयर अनुकूल स्थल।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Site grounds are best explored on foot. Distance from central Varanasi (10 km) requires a vehicle to reach.',
        hi: 'परिसर के अंदर पैदल चलना सुगम; शहर के केंद्र से 10 किमी की दूरी के लिए वाहन आवश्यक।',
      },
      driving: {
        en: 'Easily accessible via Ghazipur-Varanasi Highway (approx. 25-35 minutes drive from Godowlia/Cantt). Ample parking available.',
        hi: 'गाजीपुर-वाराणसी मार्ग से सुगम (कार/टैक्सी द्वारा 25-35 मिनट)। विशाल पार्किंग उपलब्ध।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Sarnath',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%B8%E0%A4%BE%E0%A4%B0%E0%A4%A8%E0%A4%BE%E0%A4%A5',
    },
    sources: [
      'Archaeological Survey of India (ASI) Sarnath Circle',
      'Buddhist Monuments at Sarnath (UNESCO Tentative List)',
      'Cunningham, Alexander: Archaeological Survey Reports',
    ],
    suggestedDurationMinutes: 120,
    rating: 4.9,
    highlightTag: {
      en: 'UNESCO Tentative Heritage',
      hi: 'विश्व धरोहर स्थल',
    },
  },
  {
    id: 'sankat-mochan',
    number: 6,
    name: {
      en: 'Sankat Mochan Hanuman Temple',
      hi: 'संकट मोचन हनुमान मंदिर',
    },
    subtitle: {
      en: 'Shrine of the Reliever of Troubles & Sacred Besan Ladoo Offering',
      hi: 'संकट हर्ता श्री हनुमान जी का पावन धाम व प्रसिद्ध बेसन लड्डू प्रसाद',
    },
    category: 'temple',
    coordinates: { lat: 25.2817, lng: 82.9991 },
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'One of the most revered Hanuman shrines in India, established by the saint-poet Goswami Tulsidas. Millions visit to seek freedom from planetary afflictions and distress.',
      hi: 'भारत के सर्वाधिक प्रतिष्ठित हनुमान मंदिरों में से एक, जिसकी स्थापना गोस्वामी तुलसीदास जी ने की थी। संकटों और ग्रहों के निवारण हेतु यहां लाखों भक्त आते हैं।',
    },
    historicalBackground: {
      en: 'According to tradition, saint Tulsidas had a divine vision of Lord Hanuman at this serene wooded spot in the early 16th century CE, after which he established the murti facing Lord Rama. The modern temple structure was expanded by educationist and freedom fighter Pandit Madan Mohan Malaviya in the early 1900s.',
      hi: 'परंपरा अनुसार 16वीं सदी में तुलसीदास जी को यहीं हनुमान जी के साक्षात दर्शन हुए थे। आधुनिक मंदिर परिसर का विस्तार 20वीं सदी के प्रारंभ में पंडित मदन मोहन मालवीय जी द्वारा कराया गया।',
    },
    periodDocumented: {
      en: 'Early 16th Century CE foundation; renovated 1900s by Madan Mohan Malaviya',
      hi: '16वीं सदी के आरंभ में स्थापना; 1900 के दशक में मदन मोहन मालवीय द्वारा पुनर्निर्माण',
    },
    religiousSignificance: {
      en: 'Dedicated to Hanuman as "Sankat Mochan" (The Reliever of Obstacles). Tuesdays and Saturdays draw tens of thousands of devotees.',
      hi: 'संकट हरने वाले संकट मोचन हनुमान जी को समर्पित। मंगलवार और शनिवार को भारी भीड़ उमड़ती है।',
    },
    architecturalFeatures: {
      en: 'Traditional North Indian red stone architecture, courtyards surrounded by lush trees inhabited by friendly sacred monkeys, and a peaceful devotional hall.',
      hi: 'पारंपरिक उत्तर भारतीय लाल पत्थर की शैली, वृक्षों से घिरा शांत प्रांगण और विशाल दर्शन मंडप।',
    },
    interestingFacts: {
      en: [
        'Famous for its pure desi ghee Besan Ladoos and aromatic Tulsi garlands offered to the deity.',
        'Hosts the annual Sankat Mochan Sangeet Samaroh, where India’s greatest classical musicians perform all night.',
        'Mobiles and cameras must be placed in lockers at the gate.',
      ],
      hi: [
        'शुद्ध देसी घी के बेसन के लड्डुओं और तुलसी माला के भोग के लिए प्रसिद्ध।',
        'प्रतिवर्ष प्रसिद्ध संकट मोचन संगीत समारोह का आयोजन होता है, जिसमें देश के शीर्ष संगीतकार रातभर प्रस्तुतियां देते हैं।',
        'गेट पर सुरक्षा जांच और लॉकर की सुविधा उपलब्ध है।',
      ],
    },
    visitingHours: {
      en: '05:00 AM – 10:00 PM daily (Afternoon rest: 12:00 PM – 03:00 PM)',
      hi: 'प्रातः 05:00 से रात्रि 10:00 बजे तक (दोपहर 12:00 से 03:00 तक कपाट विश्राम)',
    },
    aartiTimings: {
      en: 'Morning Aarti: 05:00 AM | Evening Aarti: 08:30 PM',
      hi: 'प्रातः आरती: 05:00 बजे | शयन आरती: रात्रि 08:30 बजे',
    },
    entryFee: {
      en: 'Free entry for all',
      hi: 'पूर्णतः निशुल्क',
    },
    accessibilityNotes: {
      en: 'Gentle ramp access from the main entrance; wheelchair friendly inside the temple perimeter.',
      hi: 'प्रवेश द्वार से रैंप की सुविधा, परिसर में व्हीलचेयर ले जाना संभव।',
    },
    travelModeSuitability: {
      walking: {
        en: 'About 15 mins walk from Assi Ghat or BHU Lanka gate.',
        hi: 'अस्सी घाट या बीएचयू लंका गेट से लगभग 15 मिनट की पैदल दूरी।',
      },
      driving: {
        en: 'Fully accessible by car, auto, and cab. Designated parking available near the entrance road.',
        hi: 'कार, ऑटो और टैक्सी से सीधे सुलभ। मंदिर मार्ग पर पार्किंग उपलब्ध।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Sankat_Mochan_Hanuman_Temple',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%B8%E0%A4%82%E0%A4%95%E0%A4%9F_%E0%A4%AE%E0%A5%8B%E0%A4%9 advocates_%E0%A4%B9%E0%A4%A8%E0%A5%81%E0%A4%AE%E0%A4%BE%E0%A4%A8_%E0%A4%AE%E0%A4%82%E0%A4%A6%E0%A4%BF%E0%A4%B0',
    },
    sources: [
      'Sankat Mochan Foundation Trust',
      'District Cultural Gazetteer of Varanasi',
      'Madan Mohan Malaviya Memorial Archives',
    ],
    suggestedDurationMinutes: 60,
    rating: 4.8,
    highlightTag: {
      en: 'Spiritual Sanctuary',
      hi: 'शांति व भक्ति धाम',
    },
  },
  {
    id: 'ramnagar-fort',
    number: 7,
    name: {
      en: 'Ramnagar Fort & Museum',
      hi: 'रामनगर किला एवं संग्रहालय',
    },
    subtitle: {
      en: '18th Century Sandstone Citadel of the Kashi Naresh on the Eastern Bank',
      hi: 'गंगा के पूर्वी तट पर काशी नरेश का 18वीं सदी का ऐतिहासिक बलुआ पत्थर दुर्ग',
    },
    category: 'historical',
    coordinates: { lat: 25.2678, lng: 83.0253 },
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'An imposing 18th-century cream sandstone fortification on the eastern bank of the Ganges, serving as the ancestral residence of the Kashi Naresh (Maharaja of Varanasi).',
      hi: 'गंगा के पूर्वी तट पर चुनार के सुनहरे बलुआ पत्थर से निर्मित 18वीं सदी का भव्य किला, जो काशी नरेश का पैतृक निवास स्थान है।',
    },
    historicalBackground: {
      en: 'Built in 1750 CE by Maharaja Balwant Singh, the fort reflects Mughal and Rajput architectural amalgamation. It has stood witness to the Nawabs of Awadh, British colonial treaties, and continues the centuries-old tradition of the world-renowned 31-day Ramlila festival.',
      hi: '1750 ईस्वी में महाराजा बलवंत सिंह द्वारा निर्मित यह दुर्ग मुगल और राजपूत स्थापत्य कला का सुंदर संगम है। यहां की 31 दिवसीय विश्वप्रसिद्ध रामलीला यूनेस्को अमूर्त सांस्कृतिक धरोहर का हिस्सा है।',
    },
    periodDocumented: {
      en: 'Built 1750 CE by Maharaja Balwant Singh',
      hi: '1750 ईस्वी में महाराजा बलवंत सिंह द्वारा निर्मित',
    },
    religiousSignificance: {
      en: 'Houses the sacred Vyas Temple, where sage Veda Vyasa is believed to have performed penance after visiting Varanasi.',
      hi: 'दुर्ग परिसर में वेदव्यास जी का प्रसिद्ध मंदिर है जहां उन्होंने तपस्या की थी।',
    },
    architecturalFeatures: {
      en: 'Chunar sandstone bastions, carved stone balconies (jharokhas), defensive ramparts facing the Ganges, and an astronomical clock crafted in 1852 by the royal court astronomer.',
      hi: 'चुनार का नक्काशीदार बलुआ पत्थर, झरोखे, गंगा की ओर मुख किए प्राचीर, और 1852 की दुर्लभ खगोलीय घड़ी।',
    },
    interestingFacts: {
      en: [
        'The Saraswati Bhawan museum exhibits vintage American cars, bejeweled palanquins, ivory carvings, and antique swords.',
        'Features a rare astronomical clock displaying day, week, month, moon phases, and planetary constellations.',
        'Famous for Shiv Prasad Lassi Bhandar located right outside the fort gate serving lassi in earthen purwas.',
      ],
      hi: [
        'सरस्वती भवन संग्रहालय में विंटेज गाड़ियां, सोने-चांदी की पालकियां और शाही अस्त्र-शस्त्र प्रदर्शित हैं।',
        '1852 में निर्मित एक दुर्लभ खगोलीय घड़ी जो वार, तिथि, नक्षत्र और ग्रहों की स्थिति बताती है।',
        'किले के ठीक बाहर प्रसिद्ध शिवप्रसाद लस्सी भंडार जहां कुल्हड़ में रबड़ीदार लस्सी मिलती है।',
      ],
    },
    visitingHours: {
      en: '10:00 AM – 05:00 PM daily (Museum ticket counter closes at 04:30 PM)',
      hi: 'प्रातः 10:00 से सायं 05:00 बजे तक (टिकट काउंटर 04:30 बंद)',
    },
    entryFee: {
      en: '₹50 for Indian nationals; ₹250 for foreign tourists; ₹20 for children',
      hi: 'भारतीय नागरिकों हेतु ₹50; विदेशी पर्यटकों हेतु ₹250; बच्चों हेतु ₹20',
    },
    accessibilityNotes: {
      en: 'Cobbled courtyards and stone staircases; moderate physical mobility needed for museum upper floors.',
      hi: 'प्रांगण में पत्थर के रास्ते और सीढ़ियां हैं।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Can be crossed via boat from Assi Ghat in dry seasons or pedestrian pontoon bridge in winter.',
        hi: 'अस्सी घाट से नाव द्वारा या शीतकाल में पीपा पुल से पैदल पार किया जा सकता है।',
      },
      driving: {
        en: 'Directly reachable via Ramnagar Bridge (Samne Ghat Bridge) by car or auto in approx. 20-30 mins.',
        hi: 'सामने घाट पक्का पुल द्वारा कार, बस या ऑटो से 20-30 मिनट में सुलभ।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Ramnagar_Fort',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%A8%E0%A4%97%E0%A4%B0_%E0%A4%95%E0%A4%BF%E0%A4%B2%E0%A4%BE',
    },
    sources: [
      'Kashi Naresh Trust Archives',
      'Archaeological Survey of India',
      'Uttar Pradesh State Tourism Board',
    ],
    suggestedDurationMinutes: 90,
    rating: 4.6,
    highlightTag: {
      en: 'Royal Citadel',
      hi: 'शाही राजप्रासाद',
    },
  },
  {
    id: 'tulsi-manas-mandir',
    number: 8,
    name: {
      en: 'Tulsi Manas Mandir',
      hi: 'तुलसी मानस मंदिर',
    },
    subtitle: {
      en: 'White Marble Temple Inscribed with the Verses of Ramcharitmanas',
      hi: 'सफेद संगमरमर पर उत्कीर्ण संपूर्ण रामचरितमानस का पावन मंदिर',
    },
    category: 'temple',
    coordinates: { lat: 25.2831, lng: 83.0003 },
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'A pristine white Makrana marble temple built on the sacred site where saint Goswami Tulsidas composed the epic devotional poem Ramcharitmanas in the Awadhi dialect.',
      hi: 'सफेद मकराना संगमरमर का भव्य मंदिर, जो उसी पावन स्थल पर बना है जहां संत तुलसीदास ने अवधी में श्रीरामचरितमानस की रचना की थी।',
    },
    historicalBackground: {
      en: 'Dedicated in 1964 CE by the philanthropic Thakur Das Sureka family of Kolkata. Built to preserve and showcase the epic in its entirety, with every Chaupai and Doha engraved onto pure white marble slabs lining the temple interior.',
      hi: '1964 ईस्वी में कोलकाता के सुरेंद्र परिवार द्वारा निर्मित। संपूर्ण रामचरितमानस के दोहे और चौपाइयों को संगमरमर की दीवारों पर नक्काशी कर संरक्षित किया गया है।',
    },
    periodDocumented: {
      en: 'Constructed 1964 CE',
      hi: '1964 ईस्वी में निर्मित',
    },
    religiousSignificance: {
      en: 'Reveres Lord Rama, Sita, Lakshmana, and Hanuman alongside Goswami Tulsidas, celebrating devotion through vernacular poetry.',
      hi: 'श्री राम, जानकी, लक्ष्मण और हनुमान जी के साथ गोस्वामी तुलसीदास जी की भक्ति परंपरा का वंदन।',
    },
    architecturalFeatures: {
      en: 'Immaculate white marble structure, landscaped botanical gardens, and mechanized moving puppet dioramas depicting scenes from the Ramayana on the upper floor.',
      hi: 'सफेद संगमरमर का शिखर, सुंदर बगीचे, और प्रथम तल पर रामायण के प्रसंगों को दर्शाती स्वचालित झांकियां।',
    },
    interestingFacts: {
      en: [
        'The entire Hindi Ramcharitmanas is engraved across all inner walls.',
        'Features an engaging mechanical puppet museum popular with families and children.',
        'Located adjacent to the historic Durga Kund Temple.',
      ],
      hi: [
        'मंदिर की संपूर्ण आंतरिक दीवारों पर पूरी रामचरितमानस उत्कीर्ण है।',
        'ऊपर के तल पर रामायण की गतिशील स्वचालित झांकियां हैं जो बच्चों को आकर्षित करती हैं।',
        'ऐतिहासिक दुर्गा कुंड मंदिर के ठीक समीप स्थित।',
      ],
    },
    visitingHours: {
      en: '05:30 AM – 12:00 PM and 03:30 PM – 09:00 PM daily',
      hi: 'प्रातः 05:30 से 12:00 और दोपहर 03:30 से रात्रि 09:00 बजे तक',
    },
    entryFee: {
      en: 'Free admission to temple; nominal ₹5–₹10 fee for upstairs mechanical puppet gallery',
      hi: 'मंदिर प्रवेश पूर्णतः निशुल्क; ऊपरी झांकी कक्ष हेतु नाममात्र ₹5-₹10 शुल्क',
    },
    accessibilityNotes: {
      en: 'Ground floor is completely wheelchair accessible with flat marble flooring.',
      hi: 'भूतल पर समतल संगमरमर फर्श, व्हीलचेयर अनुकूल।',
    },
    travelModeSuitability: {
      walking: {
        en: '10 minutes walk from Sankat Mochan Temple or Durga Kund.',
        hi: 'संकट मोचन मंदिर या दुर्गा कुंड से 10 मिनट की पैदल दूरी।',
      },
      driving: {
        en: 'Easily accessible by car and auto on Durgakund Road with on-site parking.',
        hi: 'दुर्गाकुंड रोड पर कार और ऑटो से सीधे सुलभ।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Tulsi_Manas_Mandir',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%A4%E0%A4%B1%E0%A5%81%E0%A4%B2%E0%A4%B8%E0%A5%80_%E0%A4%AE%E0%A4%BE%E0%A4%A8%E0%A4%B8_%E0%A4%AE%E0%A4%82%E0%A4%A6%E0%A4%BF%E0%A4%B0',
    },
    sources: [
      'Tulsi Manas Mandir Trust Publications',
      'Varanasi Tourism Authority',
    ],
    suggestedDurationMinutes: 45,
    rating: 4.7,
    highlightTag: {
      en: 'Marble Heritage',
      hi: 'संगमरमर की रामायण',
    },
  },
  {
    id: 'namo-ghat',
    number: 9,
    name: {
      en: 'Namo Ghat (Khirkiya Ghat)',
      hi: 'नमो घाट (खिड़किया घाट)',
    },
    subtitle: {
      en: 'Modern Northern Waterfront & Iconic Giant Namaste Sculptures',
      hi: 'काशी का आधुनिक उत्तरी घाट व प्रसिद्ध नमस्ते प्रतिमाएं',
    },
    category: 'ghat',
    coordinates: { lat: 25.3346, lng: 83.0366 },
    image: 'https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'Varanasi’s most modern, state-of-the-art waterfront at the northern edge near Rajghat, featuring world-famous bronze sculptures of folded hands offering "Namaste" to the rising sun.',
      hi: 'वाराणसी का सबसे आधुनिक और सुव्यवस्थित घाट, जहां उदीयमान सूर्य को प्रणाम करती हाथ जोड़े हुए विशाल कांस्य "नमस्ते" प्रतिमाएं स्थापित हैं।',
    },
    historicalBackground: {
      en: 'Formerly known as Khirkiya Ghat near the ancient Rajghat plateau (one of the oldest excavated habitation layers of Kashi dating to the 8th century BCE). Completely redesigned by the Varanasi Smart City Project in 2022–2024 to create a multi-modal transit hub with modern amenities, boat fueling stations, open-air amphitheater, and helicopter pad.',
      hi: 'प्राचीन राजघाट के समीप स्थित जिसे पहले खिड़किया घाट कहा जाता था। वाराणसी स्मार्ट सिटी परियोजना के अंतर्गत 2022-2024 में इसे अत्याधुनिक जल व थल पर्यटन केंद्र के रूप में विकसित किया गया।',
    },
    periodDocumented: {
      en: 'Modern redevelopment 2022–2024 CE; ancient site traces to 800 BCE',
      hi: 'आधुनिक पुनर्विकास 2022–2024 ईस्वी; प्राचीन स्थल 800 ई.पू.',
    },
    religiousSignificance: {
      en: 'Symbolizes the greeting of hospitality (Atithi Devo Bhava) and Surya Namaskar to the sacred river Ganga.',
      hi: 'पवित्र गंगा और सूर्यदेव को नमन तथा भारतीय आतिथ्य परंपरा (अतिथि देवो भव:) का प्रतीक।',
    },
    architecturalFeatures: {
      en: 'Iconic 25-foot and 15-foot metal sculptures of folded hands, landscaped waterfront promenade, floating CNG boat filling station, electric vehicle charging points, and paved promenades.',
      hi: '25 फुट ऊंची विशाल नमस्ते धातु प्रतिमाएं, आकर्षक गंगा तटबंध, ओपन एयर थिएटर और सीएनजी फ्लोटिंग स्टेशन।',
    },
    interestingFacts: {
      en: [
        'First ghat in India with a dedicated floating heliport facility and CNG boat fuel station.',
        'Extremely popular at evening for cool river breeze, illuminated photo-ops, and street food kiosks.',
        'Spans over half a kilometer with wide pedestrian walking boulevards.',
      ],
      hi: [
        'भारत का पहला घाट जहां फ्लोटिंग हैलीपैड और नौकाओं के लिए सीएनजी स्टेशन की व्यवस्था है।',
        'शाम को ठंडी गंगा बयार, लाइटिंग और स्वादिष्ट स्ट्रीट फूड के लिए युवाओं में बेहद लोकप्रिय।',
        'आधा किलोमीटर लंबा चौड़ा पक्का वॉकिंग ट्रैक।',
      ],
    },
    visitingHours: {
      en: 'Open 24 hours daily (Vibrant from 4:30 PM to 10:30 PM)',
      hi: '24 घंटे खुला (शाम 4:30 से रात 10:30 बजे तक सबसे मनोरम)',
    },
    entryFee: {
      en: 'Nominal platform ticket ₹10 during peak hours; parking charges apply for vehicles',
      hi: 'पीक घंटों में ₹10 का नाममात्र टिकट; वाहन पार्किंग शुल्क अलग',
    },
    accessibilityNotes: {
      en: 'Most accessible ghat in Varanasi with zero step ramps from car parking all the way down to the water’s edge.',
      hi: 'वाराणसी का सर्वाधिक सुगम घाट, जहां पार्किंग से गंगा किनारे तक बिना सीढ़ियों के सीधा रैंप है।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Scenic pedestrian walk along the northern promenade; 15 mins walk from Rajghat.',
        hi: 'राजघाट से 15 मिनट की सुरम्य पदयात्रा।',
      },
      driving: {
        en: 'Direct 4-lane road access with dedicated multi-acre vehicle parking right beside the ghat.',
        hi: 'फोर-लेन पक्की सड़क से सीधे जुड़ा हुआ, विशाल कार पार्किंग उपलब्ध।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Khirkiya_Ghat',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%96%E0%A4%BF%E0%A4%A1%E0%A4%BC%E0%A4%95%E0%A4%BF%E0%A4%AF%E0%A4%BE_%E0%A4%98%E0%A4%BE%E0%A4%9F',
    },
    sources: [
      'Varanasi Smart City Development Authority',
      'Inland Waterways Authority of India',
    ],
    suggestedDurationMinutes: 60,
    rating: 4.8,
    highlightTag: {
      en: 'Modern Wonder',
      hi: 'आधुनिक काशी का गौरव',
    },
  },
  {
    id: 'kaal-bhairav',
    number: 10,
    name: {
      en: 'Kaal Bhairav Temple',
      hi: 'काल भैरव मंदिर',
    },
    subtitle: {
      en: 'The Kotwal (Guardian Protector) of Kashi',
      hi: 'काशी के कोतवाल और नगर रक्षक देव',
    },
    category: 'temple',
    coordinates: { lat: 25.3184, lng: 83.0118 },
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'Considered the supreme police chief and spiritual protector of Varanasi, whose permission every visitor and resident is traditionally expected to seek upon entering Kashi.',
      hi: 'काशी के कोतवाल यानी नगर के मुख्य रक्षक देव, जिनका आशीर्वाद और अनुमति लिए बिना काशी यात्रा पूर्ण नहीं मानी जाती।',
    },
    historicalBackground: {
      en: 'One of the oldest temples in northern Varanasi, mentioned in ancient Tantric scriptures. The present temple structure was built in the mid-17th century CE. Lord Kaal Bhairav’s face is adorned in silver and garlanded with marigolds.',
      hi: 'प्राचीन तांत्रिक शास्त्रों में वर्णित उत्तर काशी का अति प्राचीन मंदिर। वर्तमान संरचना 17वीं सदी के मध्य में निर्मित हुई। भगवान का मुख चांदी के मुखौटे और गेंदे के फूलों से सुसज्जित रहता है।',
    },
    periodDocumented: {
      en: 'Ancient Tantric shrine; current temple mid-17th Century CE',
      hi: 'प्राचीन तांत्रिक तीर्थ; वर्तमान मंदिर 17वीं सदी के मध्य',
    },
    religiousSignificance: {
      en: 'Believed to eradicate fear of death, negative energies, and cleanse past karmic debts ("Bhairavi Yatana"). Devotees tie a sacred black thread (Ganda) on their wrists.',
      hi: 'काल और भय से मुक्ति दिलाने वाले देव। श्रद्धालु यहां काले धागे का रक्षा सूत्र (गंडा) अपनी कलाई पर बांधते हैं।',
    },
    architecturalFeatures: {
      en: 'Ancient stone sanctum, copper doorways, sacred dog vehicle (Vahana) shrines, and traditional brass oil lamp lamps.',
      hi: 'प्राचीन पत्थर का गर्भगृह, तांबे के कपाट, और भैरव जी के वाहन श्वान (श्वान प्रतिमा) का पूजन।',
    },
    interestingFacts: {
      en: [
        'Tradition mandates visiting Kaal Bhairav before leaving Varanasi to obtain the spiritual stamp of pilgrimage completion.',
        'Priests bless devotees with a soft peacock feather whisk to ward off the evil eye.',
        'Mustard oil lamps are lit in hundreds around the outer walls.',
      ],
      hi: [
        'परंपरा के अनुसार काशी छोड़ने से पहले कोतवाल से आज्ञा लेना आवश्यक माना जाता है।',
        'पुजारी भक्तों को मोरपंख के झाड़ू से झाड़कर बुरी नजर से रक्षा करते हैं।',
        'मंदिर की दीवारों पर सरसों के तेल के दीप प्रज्वलित किए जाते हैं।',
      ],
    },
    visitingHours: {
      en: '05:00 AM – 01:30 PM and 04:30 PM – 10:30 PM daily',
      hi: 'प्रातः 05:00 से दोपहर 01:30 और सायं 04:30 से रात्रि 10:30 बजे तक',
    },
    entryFee: {
      en: 'Free admission for all',
      hi: 'पूर्णतः निशुल्क',
    },
    accessibilityNotes: {
      en: 'Located inside narrow lanes of Visheshwarganj. Pedestrian access only.',
      hi: 'विशेश्वरगंज की संकरी गलियों में स्थित, केवल पैदल मार्ग से पहुंचा जा सकता है।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Walking is the only way inside the last 200m alleyway from Maidagin crossing.',
        hi: 'मैदागिन चौराहे से अंतिम 200 मीटर केवल पैदल गलियों से जाया जा सकता है।',
      },
      driving: {
        en: 'Vehicles can drop off at Maidagin or Golgadda; subsequent alley must be walked.',
        hi: 'वाहन मैदागिन या गोलगड्डा तक जा सकते हैं; आगे पैदल चलना होगा।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Kaal_Bhairav_Temple,_Varanasi',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%95%E0%A4%BE%E0%A4%B2_%E0%A4%AD%E0%A5%88%E0%A4%B0%E0%A4%B5_%E0%A4%AE%E0%A4%82%E0%A4%A6%E0%A4%BF%E0%A4%B0,_%E0%A4%B5%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%A3%E0%A4%B8%E0%A5%80',
    },
    sources: [
      'Kashi Khanda (Skanda Purana)',
      'District Administration Varanasi Heritage Cell',
    ],
    suggestedDurationMinutes: 45,
    rating: 4.8,
    highlightTag: {
      en: 'Guardian of Kashi',
      hi: 'काशी के कोतवाल',
    },
  },
  {
    id: 'bharat-kala-bhavan',
    number: 11,
    name: {
      en: 'Bharat Kala Bhavan (BHU Museum)',
      hi: 'भारत कला भवन (बीएचयू संग्रहालय)',
    },
    subtitle: {
      en: 'Premier Museum of Indian Art, Miniature Paintings & Archaeological Relics',
      hi: 'भारतीय कला, लघु चित्रकला और प्राचीन मूर्तियों का विश्वस्तरीय संग्रहालय',
    },
    category: 'museum',
    coordinates: { lat: 25.2672, lng: 82.9922 },
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'Located on the verdant campus of Banaras Hindu University, Bharat Kala Bhavan is an internationally renowned university museum housing over 100,000 antiquities, miniature paintings, and historical manuscripts.',
      hi: 'बनारस हिंदू विश्वविद्यालय (बीएचयू) के सुरम्य परिसर में स्थित, यह 1,00,000 से अधिक दुर्लभ मूर्तियों, लघु चित्रों और ऐतिहासिक पांडुलिपियों का विश्वविख्यात संग्रहालय है।',
    },
    historicalBackground: {
      en: 'Founded in 1920 CE by visionary art connoisseur Rai Krishnadasa with the guidance of Rabindranath Tagore and later shifted to BHU under Pandit Madan Mohan Malaviya’s patronship in 1950 CE.',
      hi: '1920 ईस्वी में विख्यात कला मर्मज्ञ राय कृष्णदास ने रवींद्रनाथ टैगोर के सानिध्य में इसकी स्थापना की। 1950 में महामना मदन मोहन मालवीय के आमंत्रण पर इसे बीएचयू परिसर में स्थापित किया गया।',
    },
    periodDocumented: {
      en: 'Founded 1920 CE; dedicated at BHU in 1950 CE',
      hi: '1920 में स्थापित; 1950 में बीएचयू में लोकार्पित',
    },
    architecturalFeatures: {
      en: 'Colonial Indo-Saracenic university galleries, temperature-controlled archival vaults, and serene open courtyards surrounded by lush trees.',
      hi: 'इंडो-सारसेनिक विश्वविद्यालय शैली की दीर्घाएं, प्राचीन नक्काशीदार लकड़ी के द्वार और शांत प्रांगण।',
    },
    interestingFacts: {
      en: [
        'Possesses the world’s most extensive collection of Mughal, Rajasthani, and Pahari miniature paintings.',
        'Houses the rare 1st century CE Gandhara and Mathura stone sculptures.',
        'Displays authentic personal belongings and hand-written letters of Mahatma Gandhi, Jawaharlal Nehru, and Rabindranath Tagore.',
      ],
      hi: [
        'मुगल, राजस्थानी और पहाड़ी लघु चित्रों का दुनिया का सबसे समृद्ध संग्रह।',
        'पहली सदी ईस्वी की गांधार और मथुरा शैली की अत्यंत दुर्लभ बौद्ध एवं हिंदू मूर्तियां।',
        'महात्मा गांधी, नेहरू और टैगोर के दुर्लभ हस्तलिखित पत्र और स्मृति चिह्न।',
      ],
    },
    visitingHours: {
      en: '10:30 AM – 04:30 PM (Closed on Sundays and University holidays)',
      hi: 'प्रातः 10:30 से सायं 04:30 बजे तक (रविवार और विश्वविद्यालय अवकाश पर बंद)',
    },
    entryFee: {
      en: '₹20 for Indian visitors; ₹300 for foreign travelers (Free for BHU students with ID)',
      hi: 'भारतीय पर्यटकों हेतु ₹20; विदेशी पर्यटकों हेतु ₹300 (बीएचयू छात्रों हेतु निशुल्क)',
    },
    accessibilityNotes: {
      en: 'Paved level ramps throughout ground floor exhibition galleries.',
      hi: 'भूतल की सभी प्रदर्शन दीर्घाओं में समतल रैंप और सुलभ रास्ते।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Lovely shaded walk through the sprawling green BHU tree avenues.',
        hi: 'बीएचयू के छायादार हरे-भरे रास्तों से सुहानी पदयात्रा।',
      },
      driving: {
        en: 'Easily accessible by car, cab, and auto right up to the museum front portico with ample parking.',
        hi: 'कार और ऑटो से सीधे संग्रहालय के मुख्य द्वार तक सुलभ।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Bharat_Kala_Bhavan',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4_%E0%A4%95%E0%A4%B2%E0%A4%BE_%E0%A4%AD%E0%A4%95%E0%A4%A8',
    },
    sources: [
      'Banaras Hindu University Official Records',
      'Ministry of Culture, Government of India',
    ],
    suggestedDurationMinutes: 90,
    rating: 4.7,
    highlightTag: {
      en: 'Art & Heritage Treasure',
      hi: 'कला व इतिहास का खजाना',
    },
  },
  {
    id: 'panchganga-ghat',
    number: 12,
    name: {
      en: 'Panchganga Ghat & Alamgir Mosque',
      hi: 'पंचगंगा घाट एवं आलमगीर मस्जिद',
    },
    subtitle: {
      en: 'Mythical Confluence of Five Holy Streams & Sant Ramananda’s Hermitage',
      hi: 'पांच पवित्र नदियों का संगम व संत कबीर-रामानंद की साधना भूमि',
    },
    category: 'ghat',
    coordinates: { lat: 25.3168, lng: 83.0185 },
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    shortIntro: {
      en: 'A quiet, majestic ghat where five subterranean sacred rivers are believed to merge. Here Saint Kabir was initiated into spirituality by Swami Ramananda on the stone steps at dawn.',
      hi: 'एक भव्य और शांत घाट जहां पांच पावन नदियों के अदृश्य संगम की मान्यता है। इसी घाट की सीढ़ियों पर भोर में स्वामी रामानंद ने संत कबीर को दीक्षा दी थी।',
    },
    historicalBackground: {
      en: 'Documented in medieval texts as the Bindu Madhava sanctuary. The striking minarets of the Alamgir Mosque were built in the 17th century CE overlooking the riverbank. During the Hindu month of Kartik, thousands of tall bamboo basket lanterns (Aakash Deep) are illuminated along the stone cliffs.',
      hi: 'मध्यकालीन ग्रंथों में बिंदु माधव तीर्थ के रूप में प्रसिद्ध। 17वीं सदी में नदी तट पर आलमगीर मस्जिद का निर्माण हुआ। कार्तिक मास में यहां बांस की टोकरियों में आकाशदीप जलाने की अनूठी परंपरा है।',
    },
    periodDocumented: {
      en: 'Medieval confluence site; stone ghat reinforced 1775 CE by Maratha kings',
      hi: 'मध्यकालीन तीर्थ; मराठा शासकों द्वारा 1775 ईस्वी में पक्के घाट का निर्माण',
    },
    religiousSignificance: {
      en: 'Confluence of Ganga, Yamuna, Saraswati, Kirana, and Dhutpapa. Taking bath in Kartik month is considered deeply auspicious.',
      hi: 'गंगा, यमुना, सरस्वती, किरणा और धूतपापा नदियों का संगम। कार्तिक पूर्णिमा पर स्नान का विशेष महत्व।',
    },
    architecturalFeatures: {
      en: 'Monumental tall stone flight of steps rising over 30 meters above the river level, topped by ancient Maratha havelis and stone towers.',
      hi: 'नदी से 30 मीटर से अधिक ऊंचाई तक उठती विशाल पत्थर की सीढ़ियां और मराठा हवेलियां।',
    },
    interestingFacts: {
      en: [
        'Famous for the Diwali of the Gods (Dev Deepawali) when every step is lit with thousands of oil diyas.',
        'Saint Trailanga Swami lived and meditated on this tranquil ghat for decades.',
        'Much quieter and more introspective than Dashashwamedh Ghat.',
      ],
      hi: [
        'देव दीपावली पर यहां हजारों दीपों की जगमगाहट देखने लायक होती है।',
        'महान योगी तैलंग स्वामी ने यहां दशकों तक साधना की थी।',
        'दशाश्वमेध की तुलना में बेहद शांत और चिंतनशील वातावरण।',
      ],
    },
    visitingHours: {
      en: 'Open 24 hours daily (Serene early mornings from 5:30 AM to 8:00 AM)',
      hi: '24 घंटे खुला (प्रातः 5:30 से 8:00 बजे तक अत्यंत शांत व मनोहारी)',
    },
    entryFee: {
      en: 'Free public access',
      hi: 'पूर्णतः निशुल्क',
    },
    accessibilityNotes: {
      en: 'Very tall and steep stone steps from the alleys down to the water. Sturdy footwear recommended.',
      hi: 'गलियों से पानी तक बहुत ऊंची और खड़ी सीढ़ियां हैं। आरामदायक जूते पहनें।',
    },
    travelModeSuitability: {
      walking: {
        en: 'Accessible on foot along the continuous ghat walkway from Manikarnika (approx. 10-12 mins).',
        hi: 'मणिकर्णिका घाट से आगे की ओर पैदल 10-12 मिनट में पहुंचा जा सकता है।',
      },
      driving: {
        en: 'No vehicle road to the ghat edge. Drop off at Chaukhamba or Machhodari and walk through historic galis.',
        hi: 'गाड़ियां घाट तक नहीं जा सकतीं। चौखंभा या मछोदरी पर उतरकर गलियों से पैदल जाना होगा।',
      },
    },
    wikipediaUrl: {
      en: 'https://en.wikipedia.org/wiki/Panchganga_Ghat',
      hi: 'https://hi.wikipedia.org/wiki/%E0%A4%AA%E0%A4%82%E0%A4%9A%E0%A4%97%E0%A4%82%E0%A4%97%E0%A4%BE_%E0%A4%98%E0%A4%BE%E0%A4%9F',
    },
    sources: [
      'Banaras: City of Light (Diana L. Eck)',
      'ASI Regional Monograph on Varanasi Ghats',
    ],
    suggestedDurationMinutes: 60,
    rating: 4.7,
    highlightTag: {
      en: 'Spiritual Confluence',
      hi: 'महातीर्थ संगम',
    },
  },
];
