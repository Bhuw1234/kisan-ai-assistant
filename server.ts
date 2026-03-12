import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';

// Load .env for local development
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config({ path: path.join(__dirname, '.env') });
}

// --- Express Setup ---
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for handling multipart/form-data
const upload = multer();

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    supabaseConfigured: !!supabase,
    geminiConfigured: !!ai
  });
});

// Initialize Supabase - prioritize NEXT_PUBLIC_ versions as they have correct values
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initialize Gemini
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Comprehensive language configuration for AI prompts
const languageConfig: Record<string, {
  name: string;
  nativePrompt: string;
  greeting: string;
  fallback: string;
}> = {
  en: {
    name: 'English',
    nativePrompt: 'Respond in English only.',
    greeting: 'Namaste! How can I help you?',
    fallback: 'Sorry, I am having trouble connecting to the internet.'
  },
  hi: {
    name: 'Hindi',
    nativePrompt: 'केवल हिंदी में जवाब दें। सरल भाषा का प्रयोग करें।',
    greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?',
    fallback: 'क्षमा करें, मुझे इंटरनेट से जुड़ने में समस्या हो रही है।'
  },
  bn: {
    name: 'Bengali',
    nativePrompt: 'শুধুমাত্র বাংলায় উত্তর দিন। সহজ ভাষা ব্যবহার করুন।',
    greeting: 'নমস্কার! আমি কীভাবে সাহায্য করতে পারি?',
    fallback: 'দুঃখিত, ইন্টারনেটে সংযোগ করতে সমস্যা হচ্ছে।'
  },
  te: {
    name: 'Telugu',
    nativePrompt: 'కేవలం తెలుగులో మాత్రమే స్పందించండి। సులభమైన భాష వాడండి।',
    greeting: 'నమస్కారం! నేను ఎలా సహాయం చేయగలను?',
    fallback: 'క్షమించండి, ఇంటర్నెట్‌కి కనెక్ట్ కావడంలో సమస్య ఉంది।'
  },
  mr: {
    name: 'Marathi',
    nativePrompt: 'केवळ मराठीत उत्तर द्या। सोपी भाषा वापरा।',
    greeting: 'नमस्कार! मी कशी मदत करू?',
    fallback: 'क्षमस्व, इंटरनेटशी कनेक्ट होण्यात समस्या येत आहे।'
  },
  ta: {
    name: 'Tamil',
    nativePrompt: 'தமிழில் மட்டுமே பதிலளியுங்கள். எளிய மொழியைப் பயன்படுத்துங்கள்.',
    greeting: 'வணக்கம்! நான் எப்படி உதவ முடியும்?',
    fallback: 'மன்னிக்கவும், இணையத்துடன் இணைப்பதில் சிக்கல் உள்ளது.'
  },
  gu: {
    name: 'Gujarati',
    nativePrompt: 'ફક્ત ગુજરાતીમાં જવાબ આપો। સરળ ભાષા વાપરો।',
    greeting: 'નમસ્તે! હું કેવી રીતે મદદ કરી શકું?',
    fallback: 'માફ કરજો, ઇન્ટરનેટ સાથે જોડાવામાં સમસ્યા છે.'
  },
  kn: {
    name: 'Kannada',
    nativePrompt: 'ಕೇವಲ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಪ್ರತಿಕ್ರಿಯಿಸಿ. ಸರಳ ಭಾಷೆ ಬಳಸಿ.',
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    fallback: 'ಕ್ಷಮಿಸಿ, ಇಂಟರ್ನೆಟ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಮಸ್ಯೆಯಿದೆ.'
  },
  ml: {
    name: 'Malayalam',
    nativePrompt: 'മലയാളത്തിൽ മാത്രം മറുപടി നൽകുക. ലളിതമായ ഭാഷ ഉപയോഗിക്കുക.',
    greeting: 'നമസ്കാരം! ഞാൻ എങ്ങനെ സഹായിക്കാം?',
    fallback: 'ക്ഷമിക്കണം, ഇന്റർനെറ്റിലേക്ക് കണക്റ്റ് ചെയ്യാൻ പ്രശ്‌നമുണ്ട്.'
  },
  pa: {
    name: 'Punjabi',
    nativePrompt: 'ਕੇਵਲ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸੌਖੀ ਭਾਸ਼ਾ ਵਰਤੋ।',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    fallback: 'ਮਾਫ਼ ਕਰਨਾ, ਇੰਟਰਨੈੱਟ ਨਾਲ ਜੁੜਨ ਵਿੱਚ ਸਮੱਸਿਆ ਹੈ।'
  },
  or: {
    name: 'Odia',
    nativePrompt: 'କେବଳ ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅ। ସରଳ ଭାଷା ବ୍ୟବହାର କର।',
    greeting: 'ନମସ୍କାର! ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
    fallback: 'କ୍ଷମା କରନ୍ତୁ, ଇଣ୍ଟରନେଟ୍ ସହିତ ସଂଯୋଗ କରିବାରେ ସମସ୍ୟା ହେଉଛି।'
  },
  as: {
    name: 'Assamese',
    nativePrompt: 'কেৱল অসমীয়াত উত্তৰ দিয়ক। সৰল ভাষা ব্যৱহাৰ কৰক।',
    greeting: 'নমস্কাৰ! মই কেনেদৰে সহায় কৰিব পাৰো?',
    fallback: 'ক্ষমা কৰিব, ইণ্টাৰনেটৰ সৈতে সংযোগ কৰোঁতে সমস্যা হৈছে।'
  },
  ur: {
    name: 'Urdu',
    nativePrompt: 'صرف اردو میں جواب دیں۔ آسان زبان استعمال کریں۔',
    greeting: 'نمستے! میں کیسے مدد کر سکتا ہوں؟',
    fallback: 'معذرت، انٹرنیٹ سے جڑنے میں مسئلہ ہے۔'
  },
  sd: {
    name: 'Sindhi',
    nativePrompt: 'صرف سنڌي ۾ جواب ڏيو. آسان ٻولي استعمال ڪريو.',
    greeting: 'نمستو! مانھنجاڙي ڪيئن مدد ڪري سگهان ٿو؟',
    fallback: 'معاف ڪجو، انٽرنيٽ سان ڳنڍڻ ۾ مسئلو آهي.'
  },
  sa: {
    name: 'Sanskrit',
    nativePrompt: 'केवलं संस्कृते उत्तरं ददातु। सरलं भाषां प्रयोगयतु।',
    greeting: 'नमस्ते! अहं कथं साहाय्यं कर्तुं शक्नोमि?',
    fallback: 'क्षम्यताम्, इण्टरनेट् सह सम्पर्कः कठिनः अस्ति।'
  },
  kok: {
    name: 'Konkani',
    nativePrompt: 'फकत कोंकणींत जाप दियात। सादी भास वापरात।',
    greeting: 'नमस्कार! मी कसो मजत करूं?',
    fallback: 'माफ कर, इंटरनेटाकडेन जोडपाक त्रास जाता।'
  },
  doi: {
    name: 'Dogri',
    nativePrompt: 'सिर्फ डोगरी च جواب देओ। सद्दी भाषा वर्तो।',
    greeting: 'नमस्ते! मैं किस तरहां मदद करी सकदा?',
    fallback: 'माफ करना, इंटरनेट नाल जुड्डे च समस्या है।'
  },
  sat: {
    name: 'Santali',
    nativePrompt: 'ᱥᱩᱫᱩᱨ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱜᱮ ᱛᱮᱞᱟ ᱮᱢ ᱢᱮ। ᱥᱟᱫᱟ ᱯᱟᱹᱨᱥᱤ ᱵᱮᱵᱷᱟᱨ ᱢᱮ।',
    greeting: 'ᱡᱳᱦᱟᱨ! ᱟᱹᱭ ᱪᱮᱫ ᱞᱮᱠᱟ ᱜᱚᱲᱚ ᱮᱢ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ?',
    fallback: 'ᱤᱠᱟᱹ ᱢᱮ, ᱤᱱᱴᱚᱨᱱᱮᱴ ᱥᱟᱞᱟᱜ ᱡᱩᱲᱟᱹᱣ ᱨᱮ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱢᱮᱱᱟᱜᱼᱟ।'
  },
  ks: {
    name: 'Kashmiri',
    nativePrompt: 'صرف کٲشُر مَنز جواب دیو۔ آسان زانٕچ استعمال کریو۔',
    greeting: 'نمستے! چھاہ کیس ہیتھ کَہن مدتھ کَرن؟',
    fallback: 'معاف، انٹرنیٹ سیتھ جودھتھ منز مسئلہ چھ۔'
  },
  ne: {
    name: 'Nepali',
    nativePrompt: 'केवल नेपालीमा मात्र उत्तर दिनुहोस्। सजिलो भाषा प्रयोग गर्नुहोस्।',
    greeting: 'नमस्ते! म कसरी मद्दत गर्न सक्छु?',
    fallback: 'माफ गर्नुहोस्, इन्टरनेटमा जोड्न समस्या भएको छ।'
  },
};

// --- API Routes ---

// 1. User Profile
app.post('/api/user', async (req, res) => {
  try {
    if (!supabase) {
      res.status(500).json({ error: 'Database not configured' });
      return;
    }
    
    const { name, state, district, land_size, crops, income_category, preferred_language } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          state,
          district,
          land_size,
          crops: JSON.stringify(crops),
          income_category,
          preferred_language
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json({ id: data.id, success: true });
  } catch (error: any) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save profile', details: error?.message || String(error) });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    if (!supabase) {
      res.status(500).json({ error: 'Database not configured' });
      return;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'User not found' });
      } else {
        throw error;
      }
    } else {
      data.crops = JSON.parse(data.crops);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 2. Schemes Finder
app.post('/api/schemes/find', async (req, res) => {
  try {
    if (!supabase) {
      res.status(500).json({ error: 'Database not configured' });
      return;
    }
    
    const { state } = req.body;
    
    const { data, error } = await supabase
      .from('schemes')
      .select('*')
      .or(`state.eq.All,state.eq.${state}`);

    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// 3. Chat / Advisory (Gemini) - Supports text and images
app.post('/api/chat', upload.none(), async (req, res) => {
  try {
    if (!ai) {
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    // Handle both JSON and FormData (multer handles multipart/form-data)
    let query: string = '';
    let userContext: any = {};
    let imageBase64: string | undefined;

    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      query = req.body.query || '';
      userContext = req.body.userContext || {};
    } else {
      // FormData - multer has already parsed it
      query = req.body.query || '';
      try {
        userContext = typeof req.body.userContext === 'string' 
          ? JSON.parse(req.body.userContext) 
          : (req.body.userContext || {});
      } catch (e) {
        console.error('Failed to parse userContext:', e);
        userContext = {};
      }
      imageBase64 = req.body.image;
    }

    const { state, district, land_size, crops, preferred_language } = userContext || {};

    console.log('Chat request:', { 
      query: query?.substring(0, 50), 
      preferred_language, 
      contentType: contentType.substring(0, 30) 
    });

    // PRIORITY: Use user's preferred language from their profile first
    // Only auto-detect from query if no preferred_language is provided
    let langCode = 'en';
    
    if (preferred_language && languageConfig[preferred_language]) {
      langCode = preferred_language;
    } else {
      // Auto-detect from query if no preference
      const scriptPatterns: [RegExp, string][] = [
        [/[\u0900-\u097F]/, 'hi'],      // Devanagari (Hindi, Marathi, Sanskrit, etc.)
        [/[\u0980-\u09FF]/, 'bn'],      // Bengali (also Assamese)
        [/[\u0C00-\u0C7F]/, 'te'],      // Telugu
        [/[\u0B80-\u0BFF]/, 'ta'],      // Tamil
        [/[\u0A80-\u0AFF]/, 'gu'],      // Gujarati
        [/[\u0C80-\u0CFF]/, 'kn'],      // Kannada
        [/[\u0D00-\u0D7F]/, 'ml'],      // Malayalam
        [/[\u0A00-\u0A7F]/, 'pa'],      // Punjabi
        [/[\u0B00-\u0B7F]/, 'or'],      // Odia
        [/[\u0600-\u06FF]/, 'ur'],      // Arabic script (Urdu, Sindhi, Kashmiri)
        [/[\u11300-\u1137F]/, 'sat'],   // Ol Chiki (Santali)
      ];

      for (const [pattern, code] of scriptPatterns) {
        if (pattern.test(query)) {
          langCode = code;
          break;
        }
      }
    }
    
    const langInfo = languageConfig[langCode] || languageConfig.en;
    console.log('Language:', langInfo.name, '(code:', langCode, ', user preference:', preferred_language, ')');
    
    // Build context for AI - CRITICAL: Always respond in user's preferred language
    let contextInfo = `
You are Kisan AI Assistant, a friendly agricultural advisor for Indian farmers.

CRITICAL LANGUAGE INSTRUCTION:
- ${langInfo.nativePrompt}
- NEVER respond in a different language.
- If the user asks in a mixed language, respond ONLY in ${langInfo.name}.

FORMATTING RULES (IMPORTANT):
- Use PLAIN TEXT ONLY - never use any Markdown formatting
- Do NOT use bold text (**text**)
- Do NOT use italics (*text* or _text_)
- Do NOT use headings (# Heading)
- Do NOT use bullet points with symbols like *, -, or numbers
- Do NOT use code blocks or any formatting symbols
- Just write simple, clean paragraphs in plain text

COMMUNICATION STYLE:
- Use simple words and avoid technical jargon
- Be friendly and helpful like a fellow farmer
- Give practical, actionable advice
- Use local farming terminology when appropriate
- Keep responses concise but informative

USER CONTEXT:
- Location: ${state || 'Not set'}, ${district || 'Not set'}
- Land Size: ${land_size || 'Not set'} acres
- Crops: ${crops?.join(', ') || 'Not set'}

Remember: You are speaking to an Indian farmer who may have limited technical knowledge. Explain things simply and clearly in ${langInfo.name}.
    `;

    // If there's an image, analyze it for plant disease/crop issues
    let contents: any[] = [];
    
    if (imageBase64) {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      const imagePrompt = contextInfo + `

IMAGE ANALYSIS TASK:
Analyze this image for:
1. Plant diseases (fungal, bacterial, viral)
2. Pest damage (insects, mites, nematodes)
3. Nutrient deficiencies (nitrogen, phosphorus, potassium, micronutrients)
4. Water stress (drought, waterlogging)
5. Overall crop health

If this is not a plant/crop image, politely inform the farmer.

Provide practical solutions and recommendations suitable for Indian farming conditions.`;

      contents = [
        {
          role: 'user',
          parts: [
            { text: imagePrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ];
    } else {
      contents = [
        { 
          role: 'user', 
          parts: [{ text: contextInfo + '\n\nQuestion: ' + query }] 
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    const text = response.text || 'No response received';
    
    // Log interaction
    if (supabase && userContext?.id) {
      await supabase
        .from('interactions')
        .insert([
          {
            user_id: userContext.id,
            query: query || '[Image Analysis]',
            response: text
          }
        ]);
    }

    // Clean response - remove any remaining Markdown formatting
    const cleanText = text
      .replace(/\*\*/g, '')  // Remove bold markers
      .replace(/\*/g, '')    // Remove italic markers
      .replace(/#{1,6}\s/g, '')  // Remove headings
      .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
      .replace(/`/g, '')  // Remove inline code markers
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .trim();

    res.json({ response: cleanText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// 4. Mandi Prices (Mock)
app.get('/api/mandi', (req, res) => {
  const { crop, district } = req.query;
  const basePrice = Math.floor(Math.random() * (3000 - 1500) + 1500);
  const nearbyMandis = [
    { name: `${district || 'Local'} Main Mandi`, price: basePrice, distance: '5 km' },
    { name: `${district || 'Local'} Rural Market`, price: basePrice - 50, distance: '12 km' },
    { name: 'City Central Market', price: basePrice + 120, distance: '25 km' },
  ];
  
  res.json({
    crop,
    average_price: basePrice,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    mandis: nearbyMandis
  });
});

// --- Static Files & SPA Fallback ---
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const distPath = process.env.VERCEL 
  ? path.join(process.cwd(), 'dist')
  : path.join(__dirname, 'dist');
const distExists = fs.existsSync(distPath);

// Serve static files in production OR in development if dist exists
if (distExists) {
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- Start Server (Local only) ---
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
