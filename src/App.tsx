import React, { useState, useEffect } from 'react';
import { InputScreen } from './components/InputScreen';
import { Dashboard } from './components/Dashboard';
import { UserMetrics, calculateHealthMetrics, HealthResults } from './utils/calculations';
import { AnimatePresence, motion } from 'motion/react';

const INITIAL_METRICS: UserMetrics = {
  age: 0,
  gender: 'male',
  weight: 0,
  height: 0,
  waist: 0,
  neck: 0,
  hip: 0,
  activityLevel: 'sedentary',
  phenotype: 'standard'
};

export default function App() {
  const [metrics, setMetrics] = useState<UserMetrics>(INITIAL_METRICS);

  const [results, setResults] = useState<HealthResults | null>(null);
  const [view, setView] = useState<'input' | 'dashboard'>('input');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAnalyze = () => {
    try {
      const calculated = calculateHealthMetrics(metrics);
      setResults(calculated);
      setView('dashboard');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred during calculation.");
      }
    }
  };

  const handleRecalculate = () => {
    setView('input');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const isDesktop = import.meta.env.VITE_IS_DESKTOP === 'true';

  return (
    <div className={`app-window transition-colors duration-500 ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-slate-900'}`}>
      {/* Fake Titlebar for Electron feel */}
      {isDesktop && (
        <div className={`h-8 w-full flex items-center justify-between px-4 select-none shrink-0 z-50 ${darkMode ? 'bg-[#111] border-b border-white/5' : 'bg-[#e5e5e5] border-b border-black/5'}`} style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className={`text-[10px] font-mono tracking-widest uppercase opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>
            Metabolic Analytics Engine v3.0
          </div>
          <div className="w-16" /> {/* Spacer for balance */}
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <InputScreen 
                metrics={metrics} 
                setMetrics={setMetrics} 
                onAnalyze={handleAnalyze} 
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {results && (
                <Dashboard 
                  results={results} 
                  metrics={metrics} 
                  onRecalculate={handleRecalculate} 
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
