import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface UnitInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  type: 'weight' | 'length' | 'height';
  tooltip?: string;
  darkMode: boolean;
}

export function UnitInput({ label, value, onChange, type, tooltip, darkMode }: UnitInputProps) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Avoid overwriting local state if it functionally matches the prop value
    // This allows users to type "1." without it snapping to "1"
    let currentParsed = 0;
    if (unit === 'metric') {
      currentParsed = parseFloat(displayValue) || 0;
      if (Math.abs(currentParsed - value) < 0.01) return;
      setDisplayValue(value === 0 ? '' : value.toFixed(1).replace(/\.0$/, ''));
    } else {
      if (type === 'weight') {
        currentParsed = (parseFloat(displayValue) || 0) / 2.20462;
        if (Math.abs(currentParsed - value) < 0.01) return;
        setDisplayValue(value === 0 ? '' : (value * 2.20462).toFixed(1).replace(/\.0$/, ''));
      } else if (type === 'length') {
        currentParsed = (parseFloat(displayValue) || 0) * 2.54;
        if (Math.abs(currentParsed - value) < 0.01) return;
        setDisplayValue(value === 0 ? '' : (value / 2.54).toFixed(1).replace(/\.0$/, ''));
      } else if (type === 'height') {
        const ft = parseFloat(feet) || 0;
        const inc = parseFloat(inches) || 0;
        currentParsed = ((ft * 12) + inc) * 2.54;
        if (Math.abs(currentParsed - value) < 0.01) return;
        
        if (value === 0) {
          setFeet('');
          setInches('');
        } else {
          const totalInches = value / 2.54;
          setFeet(Math.floor(totalInches / 12).toString());
          setInches((totalInches % 12).toFixed(1).replace(/\.0$/, ''));
        }
      }
    }
  }, [value, unit, type, displayValue, feet, inches]);

  const handleMetricChange = (valStr: string) => {
    setDisplayValue(valStr);
    onChange(parseFloat(valStr) || 0);
  };

  const handleImperialChange = (valStr: string) => {
    setDisplayValue(valStr);
    const val = parseFloat(valStr) || 0;
    if (type === 'weight') onChange(val / 2.20462);
    else if (type === 'length') onChange(val * 2.54);
  };

  const updateHeight = (ftStr: string, inStr: string) => {
    const ft = parseFloat(ftStr) || 0;
    const inc = parseFloat(inStr) || 0;
    onChange(((ft * 12) + inc) * 2.54);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl font-mono text-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? 'bg-[#1a1a1a] text-white placeholder:text-slate-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-300'}`;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {label}
          {tooltip && (
            <div 
              className="relative flex items-center"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <HelpCircle size={14} className="opacity-70 cursor-help hover:opacity-100 transition-opacity" />
              {showTooltip && (
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-lg text-xs font-normal normal-case shadow-xl z-50 ${darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </label>
        <div className="flex gap-1">
          <button
            onClick={() => setUnit('metric')}
            className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${unit === 'metric' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
          >
            {type === 'weight' ? 'KG' : 'CM'}
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${unit === 'imperial' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
          >
            {type === 'weight' ? 'LBS' : (type === 'height' ? 'FT/IN' : 'IN')}
          </button>
        </div>
      </div>
      
      {type === 'height' && unit === 'imperial' ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input type="number" value={feet} onChange={(e) => { setFeet(e.target.value); updateHeight(e.target.value, inches); }} placeholder="0" className={inputClass} />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>ft</span>
          </div>
          <div className="relative flex-1">
            <input type="number" value={inches} onChange={(e) => { setInches(e.target.value); updateHeight(feet, e.target.value); }} placeholder="0" className={inputClass} />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>in</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input type="number" value={displayValue} onChange={(e) => unit === 'metric' ? handleMetricChange(e.target.value) : handleImperialChange(e.target.value)} placeholder="0" className={inputClass} />
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>
            {unit === 'metric' ? (type === 'weight' ? 'kg' : 'cm') : (type === 'weight' ? 'lbs' : 'in')}
          </span>
        </div>
      )}
    </div>
  );
}
