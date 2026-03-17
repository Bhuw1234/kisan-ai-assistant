import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Scheme {
  id: number;
  name: string;
  category: string;
  benefits: string;
  eligibility: string;
  link: string;
}

export default function Schemes() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/schemes/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: user.state,
          land_size: user.land_size
        })
      })
      .then(res => res.json())
      .then(data => setSchemes(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-4 pb-10">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button onClick={() => navigate(-1)} className="p-2.5 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 hover:bg-slate-50 transition-colors flex-shrink-0">
          <ArrowLeft size={18} className="text-slate-700 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Government Schemes</h1>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium text-sm sm:text-base">Finding schemes for you...</div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {schemes.map(scheme => (
            <div key={scheme.id} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <span className="bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg uppercase tracking-wide border border-blue-100">
                  {scheme.category}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{scheme.name}</h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">{scheme.benefits}</p>
              
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm text-slate-700 border border-slate-200/60">
                <strong className="text-slate-900 block mb-1">Eligibility:</strong> {scheme.eligibility}
              </div>

              <a 
                href={scheme.link} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-white hover:bg-slate-50 text-emerald-700 border-2 border-emerald-600 font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Apply Now <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
