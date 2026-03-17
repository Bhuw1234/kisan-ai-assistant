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
      <header className="bg-emerald-700 text-white p-4 sm:p-6 rounded-b-[2rem] sm:rounded-b-[2.5rem] shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight truncate">Namaste, {user?.name}</h1>
              <p className="opacity-90 font-medium mt-1 flex items-center gap-1 text-sm sm:text-base">
                <MapPin size={14} /> <span className="truncate">{user?.district}, {user?.state}</span>
              </p>
            </div>
            <button onClick={handleLogout} className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors flex-shrink-0 ml-2">
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Weather Widget (Mock) */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl drop-shadow-sm">☀️</div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">{weather.temp}°C</div>
                <div className="text-xs sm:text-sm font-medium opacity-90">{weather.condition}</div>
              </div>
            </div>
            <div className="text-right text-xs sm:text-sm font-medium opacity-80">
              Today<br/>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-2 gap-3 sm:gap-5 mt-2">
        <Link to="/schemes" className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
            <FileText size={24} className="sm:w-8 sm:h-8" />
          </div>
          <span className="font-bold text-slate-800 text-sm sm:text-base">Schemes</span>
        </Link>

        <Link to="/mandi" className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 text-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
            <TrendingUp size={24} className="sm:w-8 sm:h-8" />
          </div>
          <span className="font-bold text-slate-800 text-sm sm:text-base">Mandi Prices</span>
        </Link>

        <Link to="/advisory" className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
            <Sprout size={24} className="sm:w-8 sm:h-8" />
          </div>
          <span className="font-bold text-slate-800 text-sm sm:text-base">Crop Advice</span>
        </Link>

        <Link to="/chat" className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-transform hover:shadow-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 text-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
            <MessageSquare size={24} className="sm:w-8 sm:h-8" />
          </div>
          <span className="font-bold text-slate-800 text-sm sm:text-base">Ask AI</span>
        </Link>
      </div>

      {/* Quick Status */}
      <div className="px-4 sm:px-6 mt-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 tracking-tight">Your Crops</h3>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 snap-x">
          {user?.crops.map(crop => (
            <div key={crop} className="snap-start bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap font-medium text-slate-700 flex items-center gap-2 text-sm sm:text-base">
              <Sprout size={14} className="text-emerald-500 sm:w-4 sm:h-4" />
              {crop}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
