import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import VoiceInput from '../components/VoiceInput';
import { Send, User, Bot, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function Chat() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Namaste ${user?.name}! How can I help you with your farm today?`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          userContext: user
        }),
      });
      const data = await res.json();
      
      const botMsg: Message = { id: Date.now() + 1, text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
      
      // Simple TTS for bot response if needed (optional)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        // Try to match language
        utterance.lang = user?.preferred_language === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Sorry, I am having trouble connecting to the internet.', sender: 'bot' }]);
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
        <div>
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

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center gap-3">
          <VoiceInput 
            onTranscript={(text) => handleSend(text)} 
            language={user?.preferred_language === 'hi' ? 'hi-IN' : 'en-US'}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-base transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
