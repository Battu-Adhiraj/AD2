import React from 'react';
import { UnitInput } from './UnitInput';
import { UserMetrics, ActivityLevel, Phenotype } from '@/utils/calculations';
import { Activity, Moon, Sun, ChevronRight, Fingerprint } from 'lucide-react';

interface InputScreenProps {
  metrics: UserMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<UserMetrics>>;
  onAnalyze: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function InputScreen({ metrics, setMetrics, onAnalyze, darkMode, toggleDarkMode }: InputScreenProps) {
  const updateMetric = <K extends keyof UserMetrics>(key: K, value: UserMetrics[K]) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = metrics.age > 0 && metrics.weight > 0 && metrics.height > 0 && metrics.waist > 0 && metrics.neck > 0;

  return (
    <div className="w-full h-full flex">
      {/* Left Branding Panel */}
      <div className={`w-2/5 h-full relative flex flex-col justify-between p-12 overflow-hidden ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-100'}`}>
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
            <Activity className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} size={28} />
          </div>
          <h1 className={`text-5xl font-bold tracking-tight mb-6 leading-[1.15] ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Personal Health<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
              Dashboard
            </span>
          </h1>
          <p className={`text-base leading-relaxed max-w-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Enter your basic body measurements to get a simple, easy-to-understand breakdown of your health, muscle mass, and daily calorie needs.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-slate-200' : 'bg-black/10 hover:bg-black/20 text-slate-700'}`}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <div className={`text-sm font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Ready to start
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className={`w-3/5 h-full flex flex-col p-12 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-[#111]' : 'bg-white'}`}>
        <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center space-y-10">
          
          {/* Demographics Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Age</label>
              <input
                type="number"
                value={metrics.age || ''}
                onChange={(e) => updateMetric('age', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl font-mono text-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? 'bg-[#1a1a1a] text-white placeholder:text-slate-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-300'}`}
              />
            </div>
            <div className="col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Gender</label>
              <div className={`flex rounded-xl p-1 border ${darkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-slate-50 border-slate-300'}`}>
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => updateMetric('gender', g)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                      metrics.gender === g 
                        ? (darkMode ? 'bg-[#2a2a2a] text-emerald-400 shadow-sm' : 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200')
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Anthropometrics Grid */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Body Measurements</label>
            <div className="grid grid-cols-2 gap-6">
              <UnitInput label="Height" type="height" value={metrics.height} onChange={(v) => updateMetric('height', v)} darkMode={darkMode} />
              <UnitInput label="Weight" type="weight" value={metrics.weight} onChange={(v) => updateMetric('weight', v)} darkMode={darkMode} />
              <UnitInput label="Waist" type="length" value={metrics.waist} onChange={(v) => updateMetric('waist', v)} darkMode={darkMode} tooltip="Measure around your belly button, relaxed." />
              <UnitInput label="Neck" type="length" value={metrics.neck} onChange={(v) => updateMetric('neck', v)} darkMode={darkMode} tooltip="Measure just below your Adam's apple." />
              {metrics.gender === 'female' && (
                <UnitInput label="Hip" type="length" value={metrics.hip} onChange={(v) => updateMetric('hip', v)} darkMode={darkMode} tooltip="Measure around the widest part of your hips." />
              )}
            </div>
          </div>

          {/* Context Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Daily Activity Level</label>
              <select
                value={metrics.activityLevel}
                onChange={(e) => updateMetric('activityLevel', e.target.value as ActivityLevel)}
                className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer ${darkMode ? 'bg-[#1a1a1a] text-white border border-white/10' : 'bg-slate-50 text-slate-900 border border-slate-300'}`}
              >
                <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                <option value="light">Light (Exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                <option value="active">Active (Exercise 6-7 days/week)</option>
                <option value="extreme">Extreme (Physical job or athlete)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Body Type / Genetics</label>
              <div className={`flex rounded-xl p-1 border ${darkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-slate-50 border-slate-300'}`}>
                {(['standard', 'indian'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateMetric('phenotype', p)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                      metrics.phenotype === p 
                        ? (darkMode ? 'bg-[#2a2a2a] text-emerald-400 shadow-sm' : 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200')
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                    }`}
                    title={p === 'indian' ? 'South Asian genetics (adjusts for higher belly fat risk)' : 'Global average genetics'}
                  >
                    {p === 'indian' ? 'South Asian' : 'Global Avg'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 mt-auto">
            <button
              onClick={onAnalyze}
              disabled={!isFormValid}
              className={`w-full group flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-300 ${
                isFormValid 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5' 
                  : (darkMode ? 'bg-[#1a1a1a] text-slate-600 cursor-not-allowed border border-white/5' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
              }`}
            >
              <Fingerprint size={20} />
              Calculate My Results
              <ChevronRight size={20} className={`transition-transform duration-300 ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
