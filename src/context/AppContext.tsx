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

// All Indian Languages
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
  { code: 'konkani', name: 'Konkani', native: 'कोंकणी', flag: '🇮🇳' },
  { code: 'dogri', name: 'Dogri', native: 'डोगरी', flag: '🇮🇳' },
  { code: 'santali', name: 'Santali', native: 'संताली', flag: '🇮🇳' },
  { code: 'kashmiri', name: 'Kashmiri', native: 'कश्मीरी', flag: '🇮🇳' },
  { code: 'nepali', name: 'Nepali', native: 'नेपाली', flag: '🇮🇳' },
];

// Get language display name
export const getLanguageName = (code: string): string => {
  const lang = INDIAN_LANGUAGES.find(l => l.code === code);
  return lang ? `${lang.flag} ${lang.native}` : code;
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
