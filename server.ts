import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetch } from 'undici';

// Make fetch available globally for Supabase client
(globalThis as any).fetch = fetch;

// Load .env for local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Express Setup ---
const app = express();
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    supabaseConfigured: !!supabase,
    geminiConfigured: !!ai
  });
});

// Debug endpoint to test fetch
app.get('/api/test-fetch', async (req, res) => {
  try {
    console.log('Testing fetch...');
    const response = await fetch('https://httpbin.org/get');
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Fetch error:', error);
    res.status(500).json({ success: false, error: error?.message || String(error) });
  }
});

// Debug endpoint to test Supabase fetch
app.get('/api/test-supabase', async (req, res) => {
  try {
    console.log('Testing Supabase fetch...');
    console.log('URL:', `${supabaseUrl}/rest/v1/users?select=count&limit=1`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response data:', data);
    
    res.json({ success: true, data, status: response.status });
  } catch (error: any) {
    console.error('Supabase fetch error:', error);
    res.status(500).json({ success: false, error: error?.message || String(error) });
  }
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('SUPABASE_URL:', supabaseUrl ? 'set' : 'NOT SET');

const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url: any, options: any) => fetch(url, options)
  }
}) : null;

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- API Routes ---

// 1. User Profile
app.post('/api/user', async (req, res) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(500).json({ error: 'Database not configured' });
      return;
    }
    
    const { name, state, district, land_size, crops, income_category, preferred_language } = req.body;
    
    console.log('Creating user with data:', { name, state, district });
    
    // Use direct REST API call instead of Supabase client
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name,
        state,
        district,
        land_size,
        crops: JSON.stringify(crops),
        income_category,
        preferred_language
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Supabase error:', data);
      throw new Error(data.message || 'Failed to create user');
    }
    
    console.log('User created successfully:', data);
    res.json({ id: data[0]?.id, success: true });
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
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (isProduction) {
  // Determine the correct base path for Vercel
  const distPath = process.env.VERCEL 
    ? path.join(process.cwd(), 'dist')
    : path.join(__dirname, 'dist');
  
  // Serve static files in production
  app.use(express.static(distPath));
  
  // Handle SPA - serve index.html for all non-API routes
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