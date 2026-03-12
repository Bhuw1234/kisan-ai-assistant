import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface UserProfile {
  id?: number;
  name: string;
  state: string;
  district: string;
  land_size: string;
  crops: string[];
  income_category: string;
  preferred_language: string;
}

// All Indian Languages with comprehensive info
export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', flag: '🇮🇳' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', flag: '🇮🇳' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', flag: '🇮🇳' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '🇮🇳' },
];

// Comprehensive translations for all UI elements
export const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Namaste! How can I help you with your farm today? You can also send me photos of your crops for disease diagnosis!',
    placeholder: 'Type a message...',
    takePhoto: 'Take or upload photo',
    connecting: 'Sorry, I am having trouble connecting to the internet.',
    online: 'Online',
    assistant: 'Kisan Assistant',
    send: 'Send',
    loading: 'Thinking...',
  },
  hi: {
    welcome: 'नमस्ते! आज मैं आपके खेत में कैसे मदद कर सकता हूं? आप बीमारी का पता लगाने के लिए अपनी फसलों की फोटो भी भेज सकते हैं!',
    placeholder: 'संदेश लिखें...',
    takePhoto: 'फोटो लें या अपलोड करें',
    connecting: 'क्षमा करें, मुझे इंटरनेट से जुड़ने में समस्या हो रही है।',
    online: 'ऑनलाइन',
    assistant: 'किसान सहायक',
    send: 'भेजें',
    loading: 'सोच रहा हूं...',
  },
  bn: {
    welcome: 'নমস্কার! আজ আমি কীভাবে আপনার খামারে সাহায্য করতে পারি? রোগ নির্ণয়ের জন্য আপনি আপনার ফসলের ছবিও পাঠাতে পারেন!',
    placeholder: 'বার্তা লিখুন...',
    takePhoto: 'ছবি তোলো বা আপলোড করো',
    connecting: 'দুঃখিত, ইন্টারনেটে সংযোগ করতে সমস্যা হচ্ছে।',
    online: 'অনলাইন',
    assistant: 'কৃষক সহায়ক',
    send: 'পাঠান',
    loading: 'ভাবছি...',
  },
  te: {
    welcome: 'నమస్కారం! ఈరోజు మీ పొలంలో నేను ఎలా సహాయం చేయగలను? వ్యాధి నిర్ధారణ కోసం మీ పంటల ఫోటోలను కూడా పంపవచ్చు!',
    placeholder: 'సందేశాన్ని టైప్ చేయండి...',
    takePhoto: 'ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
    connecting: 'క్షమించండి, ఇంటర్నెట్‌కి కనెక్ట్ కావడంలో సమస్య ఉంది।',
    online: 'ఆన్‌లైన్',
    assistant: 'రైతు సహాయకుడు',
    send: 'పంపు',
    loading: 'ఆలోచిస్తోంది...',
  },
  mr: {
    welcome: 'नमस्कार! आज मी तुमच्या शेतात कशी मदत करू? रोग निदानासाठी तुम्ही तुमच्या पिकांचे फोटोही पाठवू शकता!',
    placeholder: 'संदेश लिहा...',
    takePhoto: 'फोटो काढा किंवा अपलोड करा',
    connecting: 'क्षमस्व, इंटरनेटशी कनेक्ट होण्यात समस्या येत आहे।',
    online: 'ऑनलाइन',
    assistant: 'शेतकरी सहाय्यक',
    send: 'पाठवा',
    loading: 'विचार करत आहे...',
  },
  ta: {
    welcome: 'வணக்கம்! இன்று உங்கள் பண்ணையில் நான் எப்படி உதவ முடியும்? நோய் கண்டறிதலுக்கு உங்கள் பயிர்களின் புகைப்படங்களையும் அனுப்பலாம்!',
    placeholder: 'செய்தியை தட்டச்சு செய்யவும்...',
    takePhoto: 'புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்',
    connecting: 'மன்னிக்கவும், இணையத்துடன் இணைப்பதில் சிக்கல் உள்ளது।',
    online: 'ஆன்லைன்',
    assistant: 'விவசாயி உதவியாளர்',
    send: 'அனுப்பு',
    loading: 'யோசிக்கிறது...',
  },
  gu: {
    welcome: 'નમસ્તે! આજે હું તમારા ખેતરમાં કેવી રીતે મદદ કરી શકું? રોગની તપાસ માટે તમે તમારા પાકના ફોટો પણ મોકલી શકો છો!',
    placeholder: 'સંદેશ લખો...',
    takePhoto: 'ફોટો લો અથવા અપલોડ કરો',
    connecting: 'માફ કરજો, ઇન્ટરનેટ સાથે જોડાવામાં સમસ્યા છે।',
    online: 'ઓનલાઈન',
    assistant: 'ખેડૂત સહાયક',
    send: 'મોકલો',
    loading: 'વિચારી રહ્યું છે...',
  },
  kn: {
    welcome: 'ನಮಸ್ಕಾರ! ಇಂದು ನಿಮ್ಮ ಕೃಷಿಯಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ರೋಗ ಪತ್ತೆಗಾಗಿ ನಿಮ್ಮ ಬೆಳೆಗಳ ಫೋಟೋಗಳನ್ನು ಸಹ ಕಳುಹಿಸಬಹುದು!',
    placeholder: 'ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
    takePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    connecting: 'ಕ್ಷಮಿಸಿ, ಇಂಟರ್ನೆಟ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಮಸ್ಯೆಯಿದೆ।',
    online: 'ಆನ್‌ಲೈನ್',
    assistant: 'ರೈತ ಸಹಾಯಕ',
    send: 'ಕಳುಹಿಸು',
    loading: 'ಯೋಚಿಸುತ್ತಿದೆ...',
  },
  ml: {
    welcome: 'നമസ്കാരം! ഇന്ന് നിങ്ങളുടെ കൃഷിയിൽ ഞാൻ എങ്ങനെ സഹായിക്കാം? രോഗനിർണയത്തിനായി നിങ്ങളുടെ വിളകളുടെ ഫോട്ടോകളും അയയ്ക്കാം!',
    placeholder: 'സന്ദേശം ടൈപ്പ് ചെയ്യുക...',
    takePhoto: 'ഫോട്ടോ എടുക്കുക അല്ലെങ്കിൽ അപ്‌ലോഡ് ചെയ്യുക',
    connecting: 'ക്ഷമിക്കണം, ഇന്റർനെറ്റിലേക്ക് കണക്റ്റ് ചെയ്യാൻ പ്രശ്‌നമുണ്ട്।',
    online: 'ഓൺലൈൻ',
    assistant: 'കർഷക സഹായി',
    send: 'അയയ്ക്കുക',
    loading: 'ചിന്തിക്കുന്നു...',
  },
  pa: {
    welcome: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੇ ਖੇਤ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਲਈ ਤੁਸੀਂ ਆਪਣੀਆਂ ਫਸਲਾਂ ਦੀਆਂ ਫੋਟੋਆਂ ਵੀ ਭੇਜ ਸਕਦੇ ਹੋ!',
    placeholder: 'ਸੁਨੇਹਾ ਲਿਖੋ...',
    takePhoto: 'ਫੋਟੋ ਲਓ ਜਾਂ ਅੱਪਲੋਡ ਕਰੋ',
    connecting: 'ਮਾਫ਼ ਕਰਨਾ, ਇੰਟਰਨੈੱਟ ਨਾਲ ਜੁੜਨ ਵਿੱਚ ਸਮੱਸਿਆ ਹੈ।',
    online: 'ਆਨਲਾਈਨ',
    assistant: 'ਕਿਸਾਨ ਸਹਾਇਕ',
    send: 'ਭੇਜੋ',
    loading: 'ਸੋਚ ਰਿਹਾ ਹਾਂ...',
  },
  or: {
    welcome: 'ନମସ୍କାର! ଆଜି ମୁଁ ଆପଣଙ୍କ ଖେତରେ କିପରି ସାହାଯ୍ୟ କରିପାରିବି? ରୋଗ ନିର୍ଣ୍ଣୟ ପାଇଁ ଆପଣ ଆପଣଙ୍କ ଫସଲର ଫଟୋ ମଧ୍ୟ ପଠାଇପାରିବେ!',
    placeholder: 'ସନ୍ଦେଶ ଲେଖନ୍ତୁ...',
    takePhoto: 'ଫଟୋ ଉଠାନ୍ତୁ କିମ୍ବା ଅପଲୋଡ୍ କରନ୍ତୁ',
    connecting: 'କ୍ଷମା କରନ୍ତୁ, ଇଣ୍ଟରନେଟ୍ ସହିତ ସଂଯୋଗ କରିବାରେ ସମସ୍ୟା ହେଉଛି।',
    online: 'ଅନଲାଇନ୍',
    assistant: 'କୃଷକ ସହାୟକ',
    send: 'ପଠାନ୍ତୁ',
    loading: 'ଚିନ୍ତା କରୁଛି...',
  },
  as: {
    welcome: 'নমস্কাৰ! আজি মই আপোনাৰ খেতিত কেনেদৰে সহায় কৰিব পাৰো? ৰোগ নিৰ্ণয়ৰ বাবে আপুনি আপোনাৰ শস্যৰ ফটোও পঠিয়াব পাৰে!',
    placeholder: 'বাৰ্তা লিখক...',
    takePhoto: 'ফটো লওক বা আপলোড কৰক',
    connecting: 'ক্ষমা কৰিব, ইণ্টাৰনেটৰ সৈতে সংযোগ কৰোঁতে সমস্যা হৈছে।',
    online: 'অনলাইন',
    assistant: 'কৃষক সহায়ক',
    send: 'পঠিয়াওক',
    loading: 'ভাবি আছো...',
  },
  ur: {
    welcome: 'نمستے! آج میں آپ کے کھیت میں کیسے مدد کر سکتا ہوں؟ بیماری کی تشخیص کے لیے آپ اپنی فصلوں کی تصاویر بھی بھیج سکتے ہیں!',
    placeholder: 'پیغام لکھیں...',
    takePhoto: 'تصویر لیں یا اپ لوڈ کریں',
    connecting: 'معذرت، انٹرنیٹ سے جڑنے میں مسئلہ ہے۔',
    online: 'آن لائن',
    assistant: 'کسان مددگار',
    send: 'بھیجیں',
    loading: 'سوچ رہا ہوں...',
  },
  sd: {
    welcome: 'نمستو! اڄ مانھنجاڙي توهان جي کيتي ۾ ڪيئن مدد ڪري سگهان ٿو؟ بيماري جي سڃاڻپ لاءِ توهان پنهنجي فصلن جا فوٽو به موڪلي سگهو ٿا!',
    placeholder: 'پيغام لکو...',
    takePhoto: 'فوٽو وٺو يا اپ لوڊ ڪريو',
    connecting: 'معاف ڪجو، انٽرنيٽ سان ڳنڍڻ ۾ مسئلو آهي۔',
    online: 'آن لائن',
    assistant: 'هاري مددگار',
    send: 'موڪليو',
    loading: 'سوچي رهيو آهي...',
  },
  sa: {
    welcome: 'नमस्ते! अद्यापि अहं तव क्षेत्रे कथं साहाय्यं कर्तुं शक्नोमि? रोगनिदानाय तव सस्यानां चित्राणि अपि प्रेषयितुं शक्नोषि!',
    placeholder: 'सन्देशं लिख...',
    takePhoto: 'चित्रं गृह्ण or अपलोड् कुरु',
    connecting: 'क्षम्यताम्, इण्टरनेट् सह सम्पर्कः कठिनः अस्ति।',
    online: 'ऑनलाइन',
    assistant: 'कृषक सहायकः',
    send: 'प्रेषय',
    loading: 'चिन्तयामि...',
  },
  kok: {
    welcome: 'नमस्कार! आज मी तुमच्या शेतांत कसो मजत करूं? रोगाचे निदान करपाक तुमी तुमच्या पिकांचे फोटोय धाडूं येतात!',
    placeholder: 'संदेश बरो...',
    takePhoto: 'फोटो काड किंवा अपलोड कर',
    connecting: 'माफ कर, इंटरनेटाकडेन जोडपाक त्रास जाता।',
    online: 'ऑनलाईन',
    assistant: 'शेतकरी मदतगार',
    send: 'धाड',
    loading: 'विचार करता...',
  },
  doi: {
    welcome: 'नमस्ते! अज मैं तेरे खेत च किस तरहां मदद करी सकदा? बीमारी दी पहचान लेई तूं अपनी फसलां दी फोटो भी भेज सकदा!',
    placeholder: 'संदेश लिख...',
    takePhoto: 'फोटो ले जां अपलोड कर',
    connecting: 'माफ करना, इंटरनेट नाल जुड्डे च समस्या है।',
    online: 'ऑनलाइन',
    assistant: 'किसान सहायक',
    send: 'भेज',
    loading: 'सोचदा पिया हां...',
  },
  sat: {
    welcome: 'ᱡᱳᱦᱟᱨ! ᱟᱹᱭ ᱫᱤᱱ ᱟᱢᱟᱜ ᱵᱟᱨᱦᱟ ᱨᱮ ᱪᱮᱫ ᱞᱮᱠᱟ ᱜᱚᱲᱚ ᱮᱢ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ? ᱨᱟᱱ ᱧᱟᱢ ᱞᱟᱹᱜᱤᱫ ᱟᱢ ᱟᱢᱟᱜ ᱵᱤᱞᱤ ᱨᱮᱭᱟᱜ ᱪᱤᱛᱟᱹᱨ ᱦᱚᱸ ᱠᱩᱥᱤ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ!',
    placeholder: 'ᱨᱤᱠᱟ ᱚᱞ...',
    takePhoto: 'ᱪᱤᱛᱟᱹᱨ ᱤᱫ ᱟᱨ ᱵᱟᱝ ᱟᱯᱞᱳᱰ ᱢᱮ',
    connecting: 'ᱤᱠᱟᱹ ᱢᱮ, ᱤᱱᱴᱚᱨᱱᱮᱴ ᱥᱟᱞᱟᱜ ᱡᱩᱲᱟᱹᱣ ᱨᱮ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱢᱮᱱᱟᱜᱼᱟ।',
    online: 'ᱚᱱᱞᱟᱭᱤᱱ',
    assistant: 'ᱪᱟᱥ ᱜᱚᱲᱚᱭᱤᱡ',
    send: 'ᱠᱩᱥᱤ ᱢᱮ',
    loading: 'ᱢᱮᱛᱚᱜ ᱠᱟᱱᱟ...',
  },
  ks: {
    welcome: 'نمستے! أز چھاہ کیس ہیتھ کَہن مدتھ کَرن؟ بیمأری ہِند پہچان باپت چھ توہیہ پننی فصلن ہِند فوٹو تہ بھیجتھ ہیو!',
    placeholder: 'پیغام لیکھو...',
    takePhoto: 'فوٹو تھأو یا اپلوڈ کریو',
    connecting: 'معاف، انٹرنیٹ سیتھ جودھتھ منز مسئلہ چھ۔',
    online: 'آن لائن',
    assistant: 'کٲشک مدتھ گار',
    send: 'بھیجیو',
    loading: 'سوچان...',
  },
  ne: {
    welcome: 'नमस्ते! आज म तपाईंको खेतमा कसरी मद्दत गर्न सक्छु? रोग पहिचानको लागि तपाईं आफ्नो बालीको फोटो पनि पठाउन सक्नुहुन्छ!',
    placeholder: 'सन्देश टाइप गर्नुहोस्...',
    takePhoto: 'फोटो लिनुहोस् वा अपलोड गर्नुहोस्',
    connecting: 'माफ गर्नुहोस्, इन्टरनेटमा जोड्न समस्या भएको छ।',
    online: 'अनलाइन',
    assistant: 'किसान सहायक',
    send: 'पठाउनुहोस्',
    loading: 'सोचिरहेको छु...',
  },
};

// Get language display name
export const getLanguageName = (code: string): string => {
  const lang = INDIAN_LANGUAGES.find(l => l.code === code);
  return lang ? `${lang.flag} ${lang.native}` : code;
};

// Get translation for a key
export const t = (langCode: string, key: string): string => {
  const lang = translations[langCode] || translations.en;
  return lang[key] || translations.en[key] || key;
};

// Get speech synthesis language code
export const getSpeechLang = (code: string): string => {
  const langMap: Record<string, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'or': 'or-IN',
    'as': 'as-IN',
    'ur': 'ur-IN',
    'sd': 'ur-IN', // Sindhi fallback to Urdu
    'sa': 'hi-IN', // Sanskrit fallback to Hindi
    'kok': 'kok-IN', // Konkani
    'doi': 'doi-IN', // Dogri
    'sat': 'sat-IN', // Santali
    'ks': 'ks-IN', // Kashmiri
    'ne': 'ne-IN', // Nepali
  };
  return langMap[code] || 'en-IN';
};

// Get speech recognition language code
export const getRecognitionLang = (code: string): string => {
  const langMap: Record<string, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'or': 'or-IN',
    'as': 'as-IN',
    'ur': 'ur-IN',
    'sd': 'ur-IN',
    'sa': 'hi-IN',
    'kok': 'kok-IN',
    'doi': 'doi-IN',
    'sat': 'sat-IN',
    'ks': 'ks-IN',
    'ne': 'ne-IN',
  };
  return langMap[code] || 'en-IN';
};

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  saveUser: (user: UserProfile) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing user ID
    const storedUserId = localStorage.getItem('kisan_user_id');
    if (storedUserId) {
      fetch(`/api/user/${storedUserId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('User not found');
        })
        .then(data => setUserState(data))
        .catch(() => localStorage.removeItem('kisan_user_id'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const saveUser = async (userData: UserProfile) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) {
        const newUser = { ...userData, id: data.id };
        setUserState(newUser);
        localStorage.setItem('kisan_user_id', String(data.id));
      }
    } catch (error) {
      console.error('Failed to save user', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{ user, setUser: setUserState, isLoading, saveUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}