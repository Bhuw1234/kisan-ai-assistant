import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Scheme {
  id: number;
  name: string;
  category: string;
  benefits: string;
  eligibility_criteria: string;
  official_link: string;
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
    <div className="min-h-screen bg-slate-100 p-4 pb-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Government Schemes</h1>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium">Finding schemes for you...</div>
        </div>
      ) : (
        <div className="space-y-5">
          {schemes.map(scheme => (
            <div key={scheme.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border border-blue-100">
                  {scheme.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{scheme.name}</h3>
              <p className="text-slate-600 text-sm mb-5 leading-relaxed">{scheme.benefits}</p>
              
              <div className="bg-slate-50 p-4 rounded-2xl mb-5 text-sm text-slate-700 border border-slate-200/60">
                <strong className="text-slate-900 block mb-1">Eligibility:</strong> {scheme.eligibility_criteria}
              </div>

              <a 
                href={scheme.official_link} 
                target="_blank" 
                rel="noreferrer"
                className="w-full btn-secondary py-3.5 text-base"
              >
                Apply Now <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
