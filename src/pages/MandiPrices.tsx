import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MandiData {
  average_price: number;
  trend: 'up' | 'down';
  mandis: Array<{
    name: string;
    price: number;
    distance: string;
  }>;
}

export default function MandiPrices() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState(user?.crops[0] || 'Wheat');
  const [data, setData] = useState<MandiData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCrop && user?.district) {
      setLoading(true);
      fetch(`/api/mandi?crop=${selectedCrop}&district=${user.district}`)
        .then(res => res.json())
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [selectedCrop, user?.district]);

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-4 pb-10">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button onClick={() => navigate(-1)} className="p-2.5 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 hover:bg-slate-50 transition-colors flex-shrink-0">
          <ArrowLeft size={18} className="text-slate-700 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Mandi Prices</h1>
      </div>

      {/* Crop Selector */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 mb-3 sm:mb-4 snap-x">
        {user?.crops.map(crop => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`snap-start px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold whitespace-nowrap transition-all text-sm sm:text-base ${
              selectedCrop === crop 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium text-sm sm:text-base">Fetching latest prices...</div>
        </div>
      ) : data ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Price Card */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-xl shadow-emerald-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10">
              <div className="text-emerald-100 text-xs sm:text-sm font-medium mb-1 sm:mb-2 uppercase tracking-wide">Average Price (per Quintal)</div>
              <div className="text-3xl sm:text-5xl font-extrabold mb-3 sm:mb-4 tracking-tight">₹{data.average_price}</div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-white/20 backdrop-blur-sm w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                {data.trend === 'up' ? <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" /> : <TrendingDown size={16} className="sm:w-[18px] sm:h-[18px]" />}
                {data.trend === 'up' ? 'Trending Up' : 'Trending Down'}
              </div>
            </div>
          </div>

          {/* Nearby Mandis */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 ml-1 tracking-tight">Nearby Markets</h3>
            <div className="space-y-2 sm:space-y-3">
              {data.mandis.map((mandi, idx) => (
                <div key={idx} className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-slate-800 text-sm sm:text-lg mb-1 truncate">{mandi.name}</div>
                    <div className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <MapPin size={12} className="text-emerald-500 sm:w-3.5 sm:h-3.5" /> {mandi.distance}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-emerald-600 text-lg sm:text-xl">₹{mandi.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Advice */}
          <div className="bg-blue-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-blue-100 text-blue-900 text-xs sm:text-sm leading-relaxed shadow-sm">
            <strong className="flex items-center gap-2 mb-2 text-blue-800 text-sm sm:text-base">💡 AI Tip</strong> 
            {data.trend === 'up' 
              ? "Prices are rising. It might be good to hold for a few days if you have storage." 
              : "Prices are dipping slightly. Consider selling at the City Central Market for better rates."}
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 mt-10 font-medium text-sm sm:text-base">Select a crop to see prices</div>
      )}
    </div>
  );
}
