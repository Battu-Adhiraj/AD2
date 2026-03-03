import React from 'react';
import { UnitInput } from './UnitInput';
import { UserMetrics, ActivityLevel, Phenotype } from '@/utils/calculations';
import { Activity, Globe, ChevronRight, Moon, Sun, User } from 'lucide-react';

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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8 transition-colors duration-500">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl dark:shadow-slate-950/50 flex flex-col md:flex-row overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-500">
        
        {/* Left Panel: Branding & Info */}
        <div className="w-full md:w-1/3 bg-emerald-600 dark:bg-emerald-950 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Abstract Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
               <Activity className="text-white" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Metabolic <br/> Analytics
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed opacity-90">
              Advanced clinical algorithms to decode your metabolic integrity. Enter your anthropometric data to generate a comprehensive health profile.
            </p>
          </div>

          <div className="relative z-10 mt-12">
             <div className="flex items-center gap-3 text-emerald-100/60 text-xs font-medium uppercase tracking-widest">
                <div className="h-px w-8 bg-emerald-100/40"></div>
                Input Phase
             </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col h-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-10">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <User className="text-emerald-500" size={20} />
               Subject Profile
             </h2>
             <button 
               onClick={toggleDarkMode}
               className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
               {darkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>

          <div className="space-y-10">
            
            {/* Section 1: Core Demographics */}
            <div className="space-y-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                 01. Core Demographics
               </h3>
               
               <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">Age</label>
                    <input
                      type="number"
                      value={metrics.age || ''}
                      onChange={(e) => updateMetric('age', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Gender</label>
                    <div className="flex bg-slate-50 dark:bg-slate-900/50 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                      {(['male', 'female'] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => updateMetric('gender', g)}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold capitalize transition-all ${
                            metrics.gender === g 
                              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <div>
                 <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Globe size={14} /> Phenotype Context
                 </label>
                 <div className="grid grid-cols-2 gap-4">
                    {(['standard', 'indian'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateMetric('phenotype', p)}
                        className={`relative px-4 py-3 rounded-xl border-2 text-left transition-all ${
                          metrics.phenotype === p
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className={`block text-sm font-bold capitalize mb-0.5 ${
                          metrics.phenotype === p ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {p}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">
                          {p === 'indian' ? 'Stricter visceral thresholds (0.48 WHtR)' : 'Standard clinical thresholds (0.50 WHtR)'}
                        </span>
                        {metrics.phenotype === p && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                        )}
                      </button>
                    ))}
                 </div>
               </div>
            </div>

            {/* Section 2: Anthropometrics */}
            <div className="space-y-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                 02. Anthropometrics
               </h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <UnitInput
                    label="Height"
                    type="height"
                    value={metrics.height}
                    onChange={(v) => updateMetric('height', v)}
                  />
                  <UnitInput
                    label="Weight"
                    type="weight"
                    value={metrics.weight}
                    onChange={(v) => updateMetric('weight', v)}
                  />
                  <UnitInput
                    label="Waist (Navel)"
                    type="length"
                    tooltip="Measure horizontally at the level of the navel. Relax stomach, do not suck in."
                    value={metrics.waist}
                    onChange={(v) => updateMetric('waist', v)}
                  />
                  <UnitInput
                    label="Neck"
                    type="length"
                    tooltip="Measure below the larynx (Adam's apple). Keep tape snug but not tight."
                    value={metrics.neck}
                    onChange={(v) => updateMetric('neck', v)}
                  />
                  {metrics.gender === 'female' && (
                    <UnitInput
                      label="Hip"
                      type="length"
                      tooltip="Measure at the widest part of the buttocks."
                      value={metrics.hip}
                      onChange={(v) => updateMetric('hip', v)}
                    />
                  )}
               </div>
            </div>

            {/* Section 3: Lifestyle */}
            <div className="space-y-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                 03. Lifestyle Profile
               </h3>
               
               <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">Activity Level</label>
                  <div className="relative">
                    <select
                      value={metrics.activityLevel}
                      onChange={(e) => updateMetric('activityLevel', e.target.value as ActivityLevel)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-900 dark:text-slate-100 text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <option value="sedentary">Sedentary (Office job, little exercise)</option>
                      <option value="light">Light (Exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                      <option value="active">Active (Exercise 6-7 days/week)</option>
                      <option value="extreme">Extreme (Physical job + training)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Action */}
            <div className="pt-6">
              <button
                onClick={onAnalyze}
                disabled={!isFormValid}
                className={`w-full group flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  isFormValid 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Analyze Metabolic Profile
                <ChevronRight className={`transition-transform duration-300 ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
              </button>
              {!isFormValid && (
                <p className="text-center text-xs text-rose-500 mt-3 font-medium animate-pulse">
                  Please complete all required fields to proceed.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
