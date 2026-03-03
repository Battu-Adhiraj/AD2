import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface UnitInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  type: 'weight' | 'length' | 'height'; // 'height' handles ft/in logic specifically
  tooltip?: string;
}

export function UnitInput({
  label,
  value,
  onChange,
  type,
  tooltip
}: UnitInputProps) {
  // Internal state for unit selection
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  
  // Height specific state (ft/in)
  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');
  
  // Standard input state
  const [displayValue, setDisplayValue] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);

  // Sync internal state when external value changes (e.g. reset)
  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
      setFeet('');
      setInches('');
      return;
    }

    if (unit === 'metric') {
      setDisplayValue(value.toFixed(1).replace(/\.0$/, ''));
    } else {
      if (type === 'weight') {
        // kg -> lbs
        const lbs = value * 2.20462;
        setDisplayValue(lbs.toFixed(1).replace(/\.0$/, ''));
      } else if (type === 'length') {
        // cm -> in
        const inch = value / 2.54;
        setDisplayValue(inch.toFixed(1).replace(/\.0$/, ''));
      } else if (type === 'height') {
        // cm -> ft/in
        const totalInches = value / 2.54;
        const ft = Math.floor(totalInches / 12);
        const inc = totalInches % 12;
        setFeet(ft.toString());
        setInches(inc.toFixed(1).replace(/\.0$/, ''));
      }
    }
  }, [value, unit, type]);

  const handleMetricChange = (valStr: string) => {
    setDisplayValue(valStr);
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      onChange(val);
    } else {
      onChange(0);
    }
  };

  const handleImperialChange = (valStr: string) => {
    setDisplayValue(valStr);
    const val = parseFloat(valStr);
    if (isNaN(val)) {
      onChange(0);
      return;
    }

    if (type === 'weight') {
      // lbs -> kg
      onChange(val / 2.20462);
    } else if (type === 'length') {
      // in -> cm
      onChange(val * 2.54);
    }
  };

  const handleFeetChange = (valStr: string) => {
    setFeet(valStr);
    updateHeightFromFtIn(valStr, inches);
  };

  const handleInchesChange = (valStr: string) => {
    setInches(valStr);
    updateHeightFromFtIn(feet, valStr);
  };

  const updateHeightFromFtIn = (ftStr: string, inStr: string) => {
    const ft = parseFloat(ftStr) || 0;
    const inc = parseFloat(inStr) || 0;
    const totalInches = (ft * 12) + inc;
    onChange(totalInches * 2.54); // Convert to cm
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
          {label}
          {tooltip && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-emerald-500 transition-colors"
              >
                <HelpCircle size={13} />
              </button>
              {showTooltip && (
                <div className="absolute left-full ml-2 bottom-0 w-48 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in zoom-in-95 duration-200">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </label>
        
        {/* Unit Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setUnit('metric')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              unit === 'metric' 
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {type === 'weight' ? 'KG' : 'CM'}
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              unit === 'imperial' 
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {type === 'weight' ? 'LBS' : (type === 'height' ? 'FT' : 'IN')}
          </button>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="relative">
        {type === 'height' && unit === 'imperial' ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={feet}
                onChange={(e) => handleFeetChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">ft</span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={inches}
                onChange={(e) => handleInchesChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">in</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              type="number"
              value={displayValue}
              onChange={(e) => unit === 'metric' ? handleMetricChange(e.target.value) : handleImperialChange(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              {unit === 'metric' 
                ? (type === 'weight' ? 'kg' : 'cm') 
                : (type === 'weight' ? 'lbs' : 'in')
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
