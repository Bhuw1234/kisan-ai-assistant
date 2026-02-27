import React, { useState } from 'react';
import { useApp, UserProfile } from '../context/AppContext';
import { MapPin, Sprout, Ruler, Globe } from 'lucide-react';

export default function Onboarding() {
  const { saveUser } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    state: 'Punjab',
    district: '',
    land_size: '',
    crops: [],
    income_category: 'Small (<2 hectares)',
    preferred_language: 'en'
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    saveUser(formData);
  };

  const states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Telangana', 'Odisha', 'Bihar'];
  const cropsList = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Vegetables'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Sprout size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Welcome to Kisan AI</h1>
          <p className="text-slate-500 font-medium">Your personal agriculture assistant</p>
        </div>

        <div className="card">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Globe size={24} /></div>
                Select Language
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, preferred_language: 'en' })}
                  className={`p-5 rounded-2xl border-2 font-bold text-lg transition-all ${
                    formData.preferred_language === 'en' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setFormData({ ...formData, preferred_language: 'hi' })}
                  className={`p-5 rounded-2xl border-2 font-bold text-lg transition-all ${
                    formData.preferred_language === 'hi' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  हिंदी
                </button>
              </div>
              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter your name"
                />
              </div>
              <button onClick={handleNext} disabled={!formData.name} className="btn-primary w-full">
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><MapPin size={24} /></div>
                Location
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field"
                >
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Ludhiana"
                />
              </div>
              <div className="flex gap-4">
                <button onClick={handleBack} className="btn-secondary flex-1">Back</button>
                <button onClick={handleNext} disabled={!formData.district} className="btn-primary flex-1">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Ruler size={24} /></div>
                Farm Details
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Land Size (Acres)</label>
                <input
                  type="number"
                  value={formData.land_size}
                  onChange={(e) => setFormData({ ...formData, land_size: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Income Category</label>
                <select
                  value={formData.income_category}
                  onChange={(e) => setFormData({ ...formData, income_category: e.target.value })}
                  className="input-field"
                >
                  <option value="Small (<2 hectares)">Small (&lt;2 hectares)</option>
                  <option value="Medium (2-10 hectares)">Medium (2-10 hectares)</option>
                  <option value="Large (>10 hectares)">Large (&gt;10 hectares)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button onClick={handleBack} className="btn-secondary flex-1">Back</button>
                <button onClick={handleNext} disabled={!formData.land_size} className="btn-primary flex-1">Next</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Sprout size={24} /></div>
                Crops
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {cropsList.map(crop => (
                  <button
                    key={crop}
                    onClick={() => {
                      const newCrops = formData.crops.includes(crop)
                        ? formData.crops.filter(c => c !== crop)
                        : [...formData.crops, crop];
                      setFormData({ ...formData, crops: newCrops });
                    }}
                    className={`p-4 rounded-2xl border-2 text-base font-semibold transition-all ${
                      formData.crops.includes(crop)
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleBack} className="btn-secondary flex-1">Back</button>
                <button onClick={handleSubmit} disabled={formData.crops.length === 0} className="btn-primary flex-1">
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
