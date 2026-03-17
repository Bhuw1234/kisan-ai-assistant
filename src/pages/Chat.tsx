import React, { useState, useEffect, useRef } from 'react';
import { useApp, INDIAN_LANGUAGES, getLanguageName, getSpeechLang, getRecognitionLang, t } from '../context/AppContext';
import VoiceInput from '../components/VoiceInput';
import { Send, User, Bot, ArrowLeft, Image, X, Globe, Camera, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  image?: string;
}

export default function Chat() {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const [chatLanguage, setChatLanguage] = useState(user?.preferred_language || 'en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message based on language
  useEffect(() => {
    const welcomeMsg = t(chatLanguage, 'welcome');
    const userName = user?.name || '';
    const personalizedWelcome = welcomeMsg.replace('Namaste', `Namaste ${userName}`).replace('नमस्ते', `नमस्ते ${userName}`);
    setMessages([{ id: 1, text: personalizedWelcome, sender: 'bot' }]);
  }, [chatLanguage, user?.name]);

  // Update chat language when user preference changes
  useEffect(() => {
    if (user?.preferred_language) {
      setChatLanguage(user.preferred_language);
    }
  }, [user?.preferred_language]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = chatLanguage;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleLanguageChange = async (langCode: string) => {
    // Update local state immediately for instant response
    setChatLanguage(langCode);
    
    if (user && setUser) {
      const updatedUser = { ...user, preferred_language: langCode };
      setUser(updatedUser);
      // Save to backend in background
      try {
        await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      } catch (e) {
        console.error('Failed to update language preference');
      }
    }
    setShowLangMenu(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() && !selectedImage) return;

    const userMsg: Message = { 
      id: Date.now(), 
      text: text.trim(), 
      sender: 'user',
      image: selectedImage || undefined
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('query', text.trim());
      
      // Include current chat language in userContext - ensure user object exists
      const userContextWithLang = {
        ...(user || {}),
        preferred_language: chatLanguage
      };
      formData.append('userContext', JSON.stringify(userContextWithLang));
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      const botMsg: Message = { id: Date.now() + 1, text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
      
      // TTS for bot response
      if ('speechSynthesis' in window && data.response) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = getSpeechLang(currentLang);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: t(currentLang, 'connecting'), 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white p-3 sm:p-4 shadow-sm flex items-center gap-2 sm:gap-4 border-b border-slate-200/60 z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/60 flex-shrink-0">
          <ArrowLeft size={18} className="text-slate-700" />
        </button>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner flex-shrink-0">
          <Bot size={22} className="sm:w-7 sm:h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight truncate">{t(currentLang, 'assistant')}</h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></span>
            {t(currentLang, 'online')}
          </div>
        </div>
        
        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 border border-emerald-200/60 transition-all"
          >
            <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline max-w-[80px] truncate">
              {INDIAN_LANGUAGES.find(l => l.code === currentLang)?.native || 'English'}
            </span>
            <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showLangMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl border border-slate-200/60 z-50 max-h-[70vh] overflow-y-auto">
              <div className="p-2">
                {INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 rounded-xl text-left transition-all ${
                      currentLang === lang.code 
                        ? 'bg-emerald-100 text-emerald-700 font-semibold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium truncate">{lang.native}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">{lang.name}</div>
                    </div>
                    {currentLang === lang.code && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-3xl text-base shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-sm shadow-emerald-600/20'
                  : 'bg-white border border-slate-200/60 text-slate-800 rounded-tl-sm'
              }`}
              style={{ direction: ['ur', 'sd', 'ks'].includes(currentLang) ? 'rtl' : 'ltr' }}
            >
              {msg.image && (
                <div className="mb-3">
                  <img 
                    src={msg.image} 
                    alt="Uploaded" 
                    className="max-w-full rounded-2xl border-2 border-white/20"
                  />
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200/60 p-5 rounded-3xl rounded-tl-sm shadow-sm flex gap-2 items-center">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="h-24 rounded-2xl border-2 border-emerald-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 sm:p-4 bg-white border-t border-slate-200/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <VoiceInput 
            onTranscript={(text) => handleSend(text)} 
            language={getRecognitionLang(currentLang) as 'en-US' | 'hi-IN' | 'bn-IN' | 'te-IN' | 'mr-IN' | 'ta-IN' | 'gu-IN' | 'kn-IN' | 'ml-IN' | 'pa-IN' | 'or-IN' | 'as-IN' | 'ur-IN'}
          />
          
          {/* Image Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 sm:p-4 bg-emerald-100 text-emerald-700 rounded-xl sm:rounded-2xl hover:bg-emerald-200 border border-emerald-200/60 shadow-sm transition-all active:scale-95 flex-shrink-0"
            title={t(currentLang, 'takePhoto')}
          >
            <Camera size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t(currentLang, 'placeholder')}
            className="flex-1 p-2.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/60 focus:ring-2 sm:focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm sm:text-base transition-all min-w-0"
            style={{ direction: ['ur', 'sd', 'ks'].includes(currentLang) ? 'rtl' : 'ltr' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="p-2.5 sm:p-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex-shrink-0"
          >
            <Send size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
