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
  preferred_language: 'en' | 'hi';
}

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
