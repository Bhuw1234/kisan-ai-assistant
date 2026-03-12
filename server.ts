import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env for local development
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config({ path: path.join(__dirname, '.env') });
}

// --- Express Setup ---
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Language to name mapping for AI prompts
const languageNames: Record<string, string> = {
  'en': 'English',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'te': 'Telugu',
  'mr': 'Marathi',
  'ta': 'Tamil',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'or': 'Odia',
  'as': 'Assamese',
  'ur': 'Urdu',
  'sd': 'Sindhi',
  'sa': 'Sanskrit',
  'konkani': 'Konkani',
  'dogri': 'Dogri',
  'santali': 'Santali',
  'kashmiri': 'Kashmiri',
  'nepali': 'Nepali',
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
app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    // Handle both JSON and FormData
    let query: string = '';
    let userContext: any = {};
    let imageBase64: string | undefined;

    if (req.is('application/json')) {
      query = req.body.query || '';
      userContext = req.body.userContext || {};
    } else if (req.is('multipart/form-data')) {
      query = req.body.query || '';
      userContext = JSON.parse(req.body.userContext || '{}');
      imageBase64 = req.body.image;
    }

    const { state, district, land_size, crops, preferred_language } = userContext || {};

    // PRIORITY: Use user's preferred language from their profile first
    // Only auto-detect from query if no preferred_language is provided
    let langCode = '';
    
    if (preferred_language) {
      // User has a preference - use it
      langCode = preferred_language;
    } else {
      // Auto-detect from query if no preference
      // Check for Hindi/Devanagari script
      if (/[\u0900-\u097F]/.test(query)) {
        langCode = 'hi';
      } else // Check for Bengali
      if (/[\u0980-\u09FF]/.test(query)) {
        langCode = 'bn';
      } else // Check for Telugu
      if (/[\u0C00-\u0C7F]/.test(query)) {
        langCode = 'te';
      } else // Check for Tamil
      if (/[\u0B80-\u0BFF]/.test(query)) {
        langCode = 'ta';
      } else // Check for Gujarati
      if (/[\u0A80-\u0AFF]/.test(query)) {
        langCode = 'gu';
      } else // Check for Kannada
      if (/[\u0C80-\u0CFF]/.test(query)) {
        langCode = 'kn';
      } else // Check for Malayalam
      if (/[\u0D00-\u0D7F]/.test(query)) {
        langCode = 'ml';
      } else // Check for Punjabi
      if (/[\u0A00-\u0A7F]/.test(query)) {
        langCode = 'pa';
      } else // Check for Odia
      if (/[\u0B00-\u0B7F]/.test(query)) {
        langCode = 'or';
      } else // Check for Assamese
      if (/[\u0980-\u09FF]/.test(query)) {
        langCode = 'as';
      } else // Check for Urdu
      if (/[\u0600-\u06FF]/.test(query)) {
        langCode = 'ur';
      } else {
        langCode = 'en';
      }
    }
    
    const language = languageNames[langCode] || 'English';
    console.log('Language:', language, '(user preference:', preferred_language, ')');
    
    // Build context for AI - CRITICAL: Always respond in user's preferred language
    let contextInfo = `
      You are Kisan AI Assistant, a friendly agricultural advisor for Indian farmers.
      
      STRICT: Always respond in ${language} language only.
      ${langCode === 'hi' ? 'जवाब हिंदी में दें।' : langCode === 'bn' ? 'উত্তর বাংলায় দিন।' : langCode === 'ta' ? 'பதில் தமிழில் அளிக்கவும்.' : 'Respond in the language user prefers.'}
      
      - If the user's preferred language is Hindi, respond ONLY in Hindi (हिंदी में जवाब दें)
      - If the user's preferred language is Bengali, respond ONLY in Bengali (বাংলায় উত্তর দিন)
      - If the user's preferred language is Tamil, respond ONLY in Tamil (தமிழில் பதில் அளிக்கவும்)
      - If the user's preferred language is Telugu, respond ONLY in Telugu (తెలుగులో స్పందించండి)
      - If the user's preferred language is Gujarati, respond ONLY in Gujarati (ગુજરાતીમાં જવાબ આપો)
      - If the user's preferred language is Kannada, respond ONLY in Kannada (ಕನ್ನಡದಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿ)
      - If the user's preferred language is Malayalam, respond ONLY in Malayalam (മലയാളത്തില്‍ മറുപടി നല്‍കുക)
      - If the user's preferred language is Punjabi, respond ONLY in Punjabi (ਪੰਜਾਬੀ ਵਿਚ ਜਵਾਬ ਦਿਓ)
      - If the user's preferred language is Odia, respond ONLY in Odia (ଓଡ଼ିଆ ରେ ଉତ୍ତਰ ਦਿਓ)
      - If the user's preferred language is English, respond in English
      
      NEVER respond in a different language than ${language}.
      
      FORMATTING RULES (IMPORTANT):
      - Use PLAIN TEXT ONLY - never use any Markdown formatting
      - Do NOT use bold text (**text**)
      - Do NOT use italics (*text* or _text_)
      - Do NOT use headings (# Heading)
      - Do NOT use bullet points with symbols like *, -, or numbers
      - Do NOT use code blocks or any formatting symbols
      - Just write simple, clean paragraphs in plain text
      
      Use simple words and avoid technical jargon.
      Be friendly and helpful like a fellow farmer.
      
      User location: ${state || 'Not set'}, ${district || 'Not set'}
      User profile: Land: ${land_size || 'Not set'} acres, Crops: ${crops?.join(', ') || 'Not set'}
    `;

    // If there's an image, analyze it for plant disease/crop issues
    let contents: any[] = [];
    
    if (imageBase64) {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      contents = [
        {
          role: 'user',
          parts: [
            { text: contextInfo + '\n\nPlease analyze this image and tell me about any visible plant diseases, pest damage, nutrient deficiencies, or crop health issues. If this is not a plant/crop image, please let me know.' },
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