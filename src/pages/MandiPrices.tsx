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
    <div className="min-h-screen bg-slate-100 p-4 pb-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mandi Prices</h1>
      </div>

      {/* Crop Selector */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x">
        {user?.crops.map(crop => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`snap-start px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
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
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium">Fetching latest prices...</div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Main Price Card */}
          <div className="card bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-xl shadow-emerald-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10">
              <div className="text-emerald-100 text-sm font-medium mb-2 uppercase tracking-wide">Average Price (per Quintal)</div>
              <div className="text-5xl font-extrabold mb-4 tracking-tight">₹{data.average_price}</div>
              <div className="flex items-center gap-2 text-sm font-bold bg-white/20 backdrop-blur-sm w-fit px-4 py-2 rounded-xl">
                {data.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {data.trend === 'up' ? 'Trending Up' : 'Trending Down'}
              </div>
            </div>
          </div>

          {/* Nearby Mandis */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 ml-1 tracking-tight">Nearby Markets</h3>
            <div className="space-y-3">
              {data.mandis.map((mandi, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <div className="font-bold text-slate-800 text-lg mb-1">{mandi.name}</div>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-500" /> {mandi.distance}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-emerald-600 text-xl">₹{mandi.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Advice */}
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-900 text-sm leading-relaxed shadow-sm">
            <strong className="flex items-center gap-2 mb-2 text-blue-800 text-base">💡 AI Tip</strong> 
            {data.trend === 'up' 
              ? "Prices are rising. It might be good to hold for a few days if you have storage." 
              : "Prices are dipping slightly. Consider selling at the City Central Market for better rates."}
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 mt-10 font-medium">Select a crop to see prices</div>
      )}
    </div>
  );
}
