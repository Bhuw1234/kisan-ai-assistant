import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env for local development
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  import('dotenv/config');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Express Setup ---
const app = express();
app.use(express.json());

// Initialize Supabase - check both naming conventions for Vercel
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('ENV - SUPABASE_URL:', supabaseUrl ? 'set' : 'NOT SET');
console.log('ENV - SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'NOT SET');
console.log('ENV - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'set' : 'NOT SET');

const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;
console.log('Supabase configured:', supabase ? 'connected' : 'not configured');

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.error('WARNING: GEMINI_API_KEY not found in environment!');
} else {
  console.log('API Key loaded:', apiKey.substring(0, 10) + '...');
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save profile' });
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

// 3. Chat / Advisory (Gemini)
app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    const { query, userContext } = req.body;
    const { state, district, land_size, crops, preferred_language } = userContext || {};

    const language = preferred_language === 'hi' ? 'Hindi' : 'English';
    
    const systemPrompt = `
      You are an agricultural advisor for Indian farmers.
      Explain in simple language.
      Avoid technical jargon.
      Respond in ${language}.
      User location: ${state}, ${district}
      User profile: Land: ${land_size} acres, Crops: ${JSON.stringify(crops)}
      
      If the user asks about crops, pests, or weather, provide specific advice.
      If the user asks about prices, give a general estimate but mention that real-time Mandi prices vary.
      
      Keep the response concise (under 100 words if possible) and actionable.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nQuestion: ' + query }] }
      ]
    });

    const text = response.text;
    
    // Log interaction
    if (supabase && userContext?.id) {
      await supabase
        .from('interactions')
        .insert([
          {
            user_id: userContext.id,
            query,
            response: text
          }
        ]);
    }

    res.json({ response: text });
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
async function createViteApp() {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Handle SPA - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
}

// --- Start Server ---
async function startServer() {
  await createViteApp();
  
  // For local development only
  if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  }
}

startServer();

// Export for Vercel
export default app;