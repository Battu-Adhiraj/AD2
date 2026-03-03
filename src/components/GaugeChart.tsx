import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  score: number;
  color: string;
}

export function GaugeChart({ score, color }: GaugeChartProps) {
  // Score is 1-10. We want to map it to a semi-circle (180 degrees).
  // 1 -> 0 deg, 10 -> 180 deg? Or just fill percentage.
  
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 10 - score },
  ];

  const cx = "50%";
  const cy = "100%";
  const iR = 80;
  const oR = 120;

  // Needle angle
  // 1 = 180 deg (left), 10 = 0 deg (right) in standard polar?
  // Recharts starts at 0 (3 o'clock) and goes counter-clockwise.
  // We want semi-circle from 180 (9 o'clock) to 0 (3 o'clock).
  // Actually, let's just use startAngle 180 endAngle 0.
  
  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-end pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={iR}
            outerRadius={oR}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#1e293b" /> {/* Slate-800 */}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-4xl font-bold text-white tracking-tighter">{score.toFixed(1)}</span>
        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">MIS Score</span>
      </div>
    </div>
  );
}
