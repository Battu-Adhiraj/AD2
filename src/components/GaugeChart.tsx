import React from 'react';

interface GaugeChartProps {
  score: number; // 1 to 10
  color: string;
  darkMode: boolean;
}

export function GaugeChart({ score, color, darkMode }: GaugeChartProps) {
  // SVG parameters
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  
  // Semi-circle math
  const circumference = Math.PI * radius;
  // Map score (1-10) to percentage (0-100)
  const percentage = ((score - 1) / 9) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size / 2 + strokeWidth} className="overflow-visible">
        {/* Background Track */}
        <path
          d={`M ${strokeWidth/2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${cy}`}
          fill="none"
          stroke={darkMode ? "#1e293b" : "#e2e8f0"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d={`M ${strokeWidth/2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className={`text-5xl font-mono font-bold tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {score.toFixed(1)}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Score / 10.0
        </span>
      </div>
    </div>
  );
}
