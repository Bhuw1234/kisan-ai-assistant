import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, TrendingUp, FileText, MessageSquare, LogOut, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, setUser } = useApp();
  const [weather, setWeather] = useState({ temp: 28, condition: 'Sunny' });

  const handleLogout = () => {
    localStorage.removeItem('kisan_user_id');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-6 rounded-b-[2.5rem] shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Namaste, {user?.name}</h1>
              <p className="opacity-90 font-medium mt-1 flex items-center gap-1">
                <MapPin size={14} /> {user?.district}, {user?.state}
              </p>
            </div>
            <button onClick={handleLogout} className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
          
          {/* Weather Widget (Mock) */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-4">
              <div className="text-5xl drop-shadow-sm">☀️</div>
              <div>
                <div className="text-3xl font-bold tracking-tight">{weather.temp}°C</div>
                <div className="text-sm font-medium opacity-90">{weather.condition}</div>
              </div>
            </div>
            <div className="text-right text-sm font-medium opacity-80">
              Today<br/>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="p-6 grid grid-cols-2 gap-5 mt-2">
        <Link to="/schemes" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <FileText size={32} />
          </div>
          <span className="font-bold text-slate-800">Schemes</span>
        </Link>

        <Link to="/mandi" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
            <TrendingUp size={32} />
          </div>
          <span className="font-bold text-slate-800">Mandi Prices</span>
        </Link>

        <Link to="/advisory" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Sprout size={32} />
          </div>
          <span className="font-bold text-slate-800">Crop Advice</span>
        </Link>

        <Link to="/chat" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
            <MessageSquare size={32} />
          </div>
          <span className="font-bold text-slate-800">Ask AI</span>
        </Link>
      </div>

      {/* Quick Status */}
      <div className="px-6 mt-2">
        <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Your Crops</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
          {user?.crops.map(crop => (
            <div key={crop} className="snap-start bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap font-medium text-slate-700 flex items-center gap-2">
              <Sprout size={16} className="text-emerald-500" />
              {crop}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
