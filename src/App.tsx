import React, { useState, useEffect } from 'react';
import { InputScreen } from './components/InputScreen';
import { Dashboard } from './components/Dashboard';
import { UserMetrics, calculateHealthMetrics, HealthResults } from './utils/calculations';
import { AnimatePresence, motion } from 'motion/react';

// Empty initial state as requested
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
  const [metrics, setMetrics] = useState<UserMetrics>(() => {
    // Load from local storage if available
    const saved = localStorage.getItem('health_metrics');
    return saved ? JSON.parse(saved) : INITIAL_METRICS;
  });

  const [results, setResults] = useState<HealthResults | null>(null);
  const [view, setView] = useState<'input' | 'dashboard'>('input');
  const [darkMode, setDarkMode] = useState(true);

  // Persistence & Calculation Effect
  useEffect(() => {
    localStorage.setItem('health_metrics', JSON.stringify(metrics));
  }, [metrics]);

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAnalyze = () => {
    const calculated = calculateHealthMetrics(metrics);
    setResults(calculated);
    setView('dashboard');
  };

  const handleRecalculate = () => {
    setView('input');
    // Optional: Reset metrics? Or keep them for editing? 
    // Usually "Recalculate" implies editing existing data.
    // If "Reset" was requested, we'd clear them. 
    // Keeping data for better UX.
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${darkMode ? 'bg-black' : 'bg-slate-50'}`}>
      <AnimatePresence mode="wait">
        {view === 'input' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
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
  );
}
