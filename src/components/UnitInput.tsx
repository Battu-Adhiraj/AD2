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
        setDisplayValue((value * 2.20462).toFixed(1).replace(/\.0$/, ''));
      } else if (type === 'length') {
        setDisplayValue((value / 2.54).toFixed(1).replace(/\.0$/, ''));
      } else if (type === 'height') {
        const totalInches = value / 2.54;
        setFeet(Math.floor(totalInches / 12).toString());
        setInches((totalInches % 12).toFixed(1).replace(/\.0$/, ''));
      }
    }
  }, [value, unit, type]);

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

  const inputClass = `w-full px-4 py-3 rounded-xl font-mono text-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? 'bg-[#1a1a1a] text-white placeholder:text-slate-700 border border-white/5' : 'bg-slate-50 text-slate-900 placeholder:text-slate-300 border border-slate-200'}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {label}
          {tooltip && <HelpCircle size={12} className="opacity-50" />}
        </label>
        <div className="flex gap-1">
          <button
            onClick={() => setUnit('metric')}
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${unit === 'metric' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600') : (darkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600')}`}
          >
            {type === 'weight' ? 'KG' : 'CM'}
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${unit === 'imperial' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600') : (darkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600')}`}
          >
            {type === 'weight' ? 'LBS' : (type === 'height' ? 'FT/IN' : 'IN')}
          </button>
        </div>
      </div>
      
      {type === 'height' && unit === 'imperial' ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input type="number" value={feet} onChange={(e) => { setFeet(e.target.value); updateHeight(e.target.value, inches); }} placeholder="0" className={inputClass} />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono opacity-30 ${darkMode ? 'text-white' : 'text-black'}`}>ft</span>
          </div>
          <div className="relative flex-1">
            <input type="number" value={inches} onChange={(e) => { setInches(e.target.value); updateHeight(feet, e.target.value); }} placeholder="0" className={inputClass} />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono opacity-30 ${darkMode ? 'text-white' : 'text-black'}`}>in</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input type="number" value={displayValue} onChange={(e) => unit === 'metric' ? handleMetricChange(e.target.value) : handleImperialChange(e.target.value)} placeholder="0" className={inputClass} />
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono opacity-30 ${darkMode ? 'text-white' : 'text-black'}`}>
            {unit === 'metric' ? (type === 'weight' ? 'kg' : 'cm') : (type === 'weight' ? 'lbs' : 'in')}
          </span>
        </div>
      )}
    </div>
  );
}
