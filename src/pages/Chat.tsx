import React, { useState, useEffect, useRef } from 'react';
import { useApp, INDIAN_LANGUAGES, getLanguageName, getSpeechLang, getRecognitionLang } from '../context/AppContext';
import VoiceInput from '../components/VoiceInput';
import { Send, User, Bot, ArrowLeft, Image, X, Globe, Camera } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Namaste ${user?.name}! How can I help you with your farm today? You can also send me photos of your crops for disease diagnosis!`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatLanguage, setChatLanguage] = useState(user?.preferred_language || 'en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update chat language when user preference changes
  useEffect(() => {
    if (user?.preferred_language) {
      setChatLanguage(user.preferred_language);
    }
  }, [user?.preferred_language]);

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
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = getSpeechLang(currentLang);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: currentLang === 'hi' 
          ? 'क्षमा करें, मुझे इंटरनेट से जुड़ने में समस्या हो रही है।' 
          : 'Sorry, I am having trouble connecting to the internet.', 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 border-b border-slate-200/60 z-10">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/60">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
          <Bot size={28} />
        </div>
        <div className="flex-1">
          <h1 className="font-extrabold text-lg text-slate-800 tracking-tight">Kisan Assistant</h1>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></span>
            Online
          </div>
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
      <div className="p-4 bg-white border-t border-slate-200/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center gap-3">
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
            className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl hover:bg-emerald-200 border border-emerald-200/60 shadow-sm transition-all active:scale-95"
            title={currentLang === 'hi' ? 'फोटो लें या अपलोड करें' : 'Take or upload photo'}
          >
            <Camera size={24} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={currentLang === 'hi' ? 'संदेश लिखें...' : 'Type a message...'}
            className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-base transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}